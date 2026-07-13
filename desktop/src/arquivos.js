// JARVIS Arquivista — motor de arquivos READ-ONLY (#369, fase 1 / 0.6.0).
//
// Dá olhos ao J.A.R.V.I.S. dentro do PC: buscar arquivos por nome e gerar o
// inventário completo com relatório em disco. É a fase "só olhar":
//
//   • READ-ONLY de verdade: este módulo não importa NENHUMA API de escrita
//     além de criar o próprio arquivo de relatório em Documentos/Baluarte.
//     Mover/renomear/apagar não existem aqui (fase 3, sempre com confirmação).
//   • COFRE PESSOAL: pastas com marcador pessoal (pessoal, privado, senha…)
//     são puladas inteiras — nem os nomes entram no resultado, só a contagem.
//   • ZONA PROIBIDA: credenciais (.ssh, .gnupg, cofres de navegador), configs
//     (AppData/Library/dotfiles), node_modules, .git, caches. Symlinks não
//     são seguidos.
//   • LIMITES DUROS: teto de entradas + profundidade + timeout → resultado
//     parcial sinalizado, nunca app travado.
//   • NADA SAI DA MÁQUINA: resultados ficam no PC; telemetria só vê números.
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/* ===================== configuração de segurança ===================== */

/** Marcadores de pasta PESSOAL — pulada inteira, sem listar nomes. */
const COFRE_PESSOAL = [
  'pessoal', 'pessoais', 'privado', 'privada', 'private', 'intimo', 'íntimo',
  'senha', 'senhas', 'password', 'passwords', 'segredo', 'segredos', 'secret', 'secrets'
];

/** Diretórios técnicos proibidos (nome exato, case-insensitive). */
const ZONA_PROIBIDA = new Set([
  '.ssh', '.gnupg', '.gpg', '.aws', '.azure', '.kube', '.docker', '.pki',
  'appdata', 'library', 'node_modules', '.git', '.svn', '.hg', '.cache',
  '__pycache__', '.npm', '.nuget', '.gradle', '.m2', '.cargo', '.rustup',
  '$recycle.bin', 'system volume information', '.trash', '.local',
  'onedrivetemp', 'ntuser.dat'
]);

const LIMITES = {
  maxEntradas: 300000,   // teto de arquivos+pastas visitados por varredura
  maxProfundidade: 14,
  timeoutMs: 120000,     // 2 min — para com parcial sinalizado
  maxResultadosBusca: 60
};

const ehPessoal = (nome) => {
  const n = nome.toLowerCase();
  return COFRE_PESSOAL.some((m) => n.includes(m));
};
const ehProibida = (nome) => {
  const n = nome.toLowerCase();
  return ZONA_PROIBIDA.has(n) || (n.startsWith('.') && n !== '.');
};

/* raiz padrão: home do usuário. Sobrescrevível SÓ pra teste (env). */
const raiz = () => process.env.BALUARTE_ARQUIVOS_RAIZ || os.homedir();

/* progresso vivo da varredura corrente (o Núcleo mostra "varrendo… N") */
let _progresso = { ativo: false, varridos: 0, atual: '', inicio: 0 };

/* ===================== o walker (coração read-only) ===================== */

/**
 * Varre `base` chamando `visita(caminhoAbs, dirent, profundidade)` por arquivo.
 * Aplica cofre/zona proibida/limites. Devolve as contagens da varredura.
 * opts.ignorarDirs: Set de caminhos ABSOLUTOS a pular (ex.: a própria pasta
 * do relatório — senão o inventário conta o arquivo que está escrevendo).
 */
async function varrer(base, visita, opts = {}) {
  const ignorar = opts.ignorarDirs || null;
  const stats = {
    arquivos: 0, pastas: 0, protegidas: 0, proibidas: 0,
    parcial: false, motivoParcial: '', duracaoMs: 0
  };
  const inicio = Date.now();
  _progresso = { ativo: true, varridos: 0, atual: '', inicio };
  const fila = [[base, 0]];

  try {
    while (fila.length) {
      if (Date.now() - inicio > LIMITES.timeoutMs) {
        stats.parcial = true; stats.motivoParcial = 'timeout'; break;
      }
      if (stats.arquivos + stats.pastas > LIMITES.maxEntradas) {
        stats.parcial = true; stats.motivoParcial = 'teto de entradas'; break;
      }
      const [dir, prof] = fila.shift();
      let entradas;
      try {
        entradas = await fsp.readdir(dir, { withFileTypes: true });
      } catch { continue; }                       // sem permissão → segue o baile
      for (const e of entradas) {
        const nome = e.name;
        if (e.isSymbolicLink()) continue;         // symlink nunca é seguido
        if (e.isDirectory()) {
          if (ehPessoal(nome)) { stats.protegidas++; continue; }
          if (ehProibida(nome)) { stats.proibidas++; continue; }
          const abs = path.join(dir, nome);
          if (ignorar && ignorar.has(abs)) continue;
          stats.pastas++;
          if (prof < LIMITES.maxProfundidade) fila.push([abs, prof + 1]);
          continue;
        }
        if (!e.isFile()) continue;
        stats.arquivos++;
        _progresso.varridos = stats.arquivos;
        if ((stats.arquivos & 1023) === 0) _progresso.atual = dir;
        await visita(path.join(dir, nome), e, prof);
      }
    }
  } finally {
    stats.duracaoMs = Date.now() - inicio;
    _progresso = { ativo: false, varridos: stats.arquivos, atual: '', inicio: 0 };
  }
  return stats;
}

/* normaliza pra busca sem acento/caixa */
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ===================== API dos canais IPC ===================== */

/** Estado do motor — raiz, bloqueios e progresso (pro comando "arquivos"). */
function status() {
  return {
    disponivel: true,
    raiz: raiz(),
    cofrePessoal: COFRE_PESSOAL,
    limites: LIMITES,
    progresso: { ..._progresso }
  };
}

/**
 * Busca por NOME (substring, sem acento/caixa) sob a raiz.
 * @returns { resultados: [{caminho,nome,bytes,modificado}], stats, parcial }
 */
async function buscar({ termo, limite } = {}) {
  const t = norm(String(termo || '').trim());
  if (t.length < 2) throw new Error('termo de busca muito curto (mínimo 2 caracteres)');
  const teto = Math.min(Number(limite) || LIMITES.maxResultadosBusca, 200);
  const resultados = [];
  const stats = await varrer(raiz(), async (caminho, dirent) => {
    if (resultados.length >= teto) return;
    if (!norm(dirent.name).includes(t)) return;
    try {
      const st = await fsp.stat(caminho);
      resultados.push({
        caminho, nome: dirent.name, bytes: st.size,
        modificado: st.mtime.toISOString().slice(0, 16).replace('T', ' ')
      });
    } catch { /* stat falhou → pula */ }
  });
  return { termo, resultados, total: resultados.length, tetoAtingido: resultados.length >= teto, stats };
}

const fmtBytes = (b) => {
  if (b >= 1e9) return (b / 1e9).toFixed(2) + ' GB';
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB';
  if (b >= 1e3) return (b / 1e3).toFixed(0) + ' KB';
  return b + ' B';
};

/**
 * Inventário completo da raiz + relatório em disco (o pedido do notebook):
 * `Documentos/Baluarte/relatorio-arquivos-<data>.md` (resumo legível) e
 * `…-caminhos.txt` (TODOS os caminhos, um por linha, streamado).
 */
async function relatorio() {
  const base = raiz();
  const porExt = new Map();
  const porPasta = new Map();     // 1º nível abaixo da raiz
  let totalBytes = 0;
  const maiores = [];             // top 20 por tamanho
  const MAIORES_N = 20;

  /* listagem completa vai direto pro .txt (stream — não estoura memória) */
  const docs = path.join(base, 'Documents');
  const destinoDir = path.join(fs.existsSync(docs) ? docs : base, 'Baluarte');
  await fsp.mkdir(destinoDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  const mdPath = path.join(destinoDir, `relatorio-arquivos-${stamp}.md`);
  const txtPath = path.join(destinoDir, `relatorio-arquivos-${stamp}-caminhos.txt`);
  const txt = fs.createWriteStream(txtPath, { encoding: 'utf8' });

  const stats = await varrer(base, async (caminho, dirent) => {
    txt.write(caminho + '\n');
    /* (a pasta do relatório fica fora da varredura via ignorarDirs) */
    const ext = (path.extname(dirent.name) || '(sem extensão)').toLowerCase();
    porExt.set(ext, (porExt.get(ext) || 0) + 1);
    const rel = path.relative(base, caminho).split(path.sep)[0] || '(raiz)';
    porPasta.set(rel, (porPasta.get(rel) || 0) + 1);
    try {
      const st = await fsp.stat(caminho);
      totalBytes += st.size;
      if (maiores.length < MAIORES_N || st.size > maiores[maiores.length - 1].bytes) {
        maiores.push({ caminho, bytes: st.size });
        maiores.sort((a, b) => b.bytes - a.bytes);
        if (maiores.length > MAIORES_N) maiores.pop();
      }
    } catch { /* ok */ }
  }, { ignorarDirs: new Set([destinoDir]) });
  await new Promise((ok) => txt.end(ok));

  const topExt = [...porExt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  const topPastas = [...porPasta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);

  const md = [
    `# 🗂️ Relatório de arquivos — ${new Date().toLocaleString('pt-BR')}`,
    '',
    `Raiz varrida: \`${base}\``,
    stats.parcial ? `\n> ⚠ **Resultado PARCIAL** (${stats.motivoParcial}) — os números abaixo são o que deu tempo de varrer.` : '',
    '',
    '## Totais',
    `- **Arquivos:** ${stats.arquivos.toLocaleString('pt-BR')}`,
    `- **Pastas:** ${stats.pastas.toLocaleString('pt-BR')}`,
    `- **Espaço somado:** ${fmtBytes(totalBytes)}`,
    `- **Pastas protegidas (cofre pessoal, não listadas):** ${stats.protegidas}`,
    `- **Zonas técnicas puladas (.ssh, AppData, node_modules…):** ${stats.proibidas}`,
    `- **Duração:** ${(stats.duracaoMs / 1000).toFixed(1)}s`,
    '',
    '## Top 20 extensões',
    ...topExt.map(([e, n]) => `- \`${e}\` — ${n.toLocaleString('pt-BR')}`),
    '',
    '## 20 maiores arquivos',
    ...maiores.map((m) => `- ${fmtBytes(m.bytes)} — \`${m.caminho}\``),
    '',
    '## Arquivos por pasta (1º nível)',
    ...topPastas.map(([p, n]) => `- \`${p}\` — ${n.toLocaleString('pt-BR')}`),
    '',
    `## Listagem completa`,
    `Todos os ${stats.arquivos.toLocaleString('pt-BR')} caminhos estão em:`,
    `\`${txtPath}\``,
    '',
    '_Gerado pelo J.A.R.V.I.S. Arquivista (read-only) — Projeto Baluarte._'
  ].filter((l) => l !== null).join('\n');
  await fsp.writeFile(mdPath, md, 'utf8');

  return {
    relatorio: mdPath,
    listagem: txtPath,
    resumo: {
      arquivos: stats.arquivos, pastas: stats.pastas,
      bytes: totalBytes, tamanho: fmtBytes(totalBytes),
      protegidas: stats.protegidas, proibidas: stats.proibidas,
      parcial: stats.parcial, motivoParcial: stats.motivoParcial,
      duracaoSeg: +(stats.duracaoMs / 1000).toFixed(1),
      topExtensoes: topExt.slice(0, 6).map(([e, n]) => `${e}:${n}`)
    }
  };
}

/* ===================== FASE 2 — Analisar (#369, 0.6.1) =====================
 * Agora entram CAMINHOS como input (do operador ou do agente) — a fronteira
 * nova de segurança é validar cada um: dentro da raiz, nenhum segmento do
 * cofre pessoal/zona proibida, sem symlink no caminho. Continua read-only. */

/** Arquivos com cara de segredo: nunca são lidos, nem fora do cofre. */
const ehSegredo = (nome) => /senha|password|secret|token|credenc|\.env$|\.pem$|\.key$|id_rsa|\.pfx$|\.p12$/i.test(nome);

/** Extensões de TEXTO seguras pra leitura/grep (código, docs, dados). */
const EXT_TEXTO = new Set([
  '.txt', '.md', '.markdown', '.json', '.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx',
  '.css', '.html', '.htm', '.xml', '.svg', '.csv', '.tsv', '.yml', '.yaml', '.toml',
  '.ini', '.cfg', '.conf', '.log', '.py', '.java', '.c', '.h', '.cpp', '.hpp', '.cs',
  '.go', '.rs', '.rb', '.php', '.sh', '.ps1', '.bat', '.sql', '.gd', '.lua', '.kt'
]);
const LER_MAX_BYTES = 256 * 1024;   // teto de leitura por arquivo

/**
 * Valida um caminho vindo de fora. Devolve o absoluto normalizado ou lança
 * com mensagem amigável. Regras: dentro da raiz; nenhum segmento pessoal,
 * proibido ou symlink no trajeto.
 */
async function validarCaminho(entrada) {
  const bruto = String(entrada || '').trim();
  if (!bruto) throw new Error('caminho vazio');
  const base = path.resolve(raiz());
  const abs = path.resolve(base, bruto);
  if (abs !== base && !abs.startsWith(base + path.sep)) {
    throw new Error(`fora da minha área (só trabalho dentro de ${base})`);
  }
  const rel = path.relative(base, abs);
  const segmentos = rel ? rel.split(path.sep) : [];
  let atual = base;
  for (const seg of segmentos) {
    if (ehPessoal(seg)) throw new Error('esse caminho passa por uma pasta do cofre pessoal — não entro nem pra ler');
    if (ehProibida(seg)) throw new Error(`"${seg}" fica na zona proibida (credenciais/config/caches) — não entro`);
    atual = path.join(atual, seg);
    const st = await fsp.lstat(atual).catch(() => null);
    if (!st) throw new Error('caminho não existe');
    if (st.isSymbolicLink()) throw new Error('symlink no caminho — não sigo atalhos');
  }
  return abs;
}

/**
 * Lê o CONTEÚDO de um arquivo de texto seguro (código/docs/dados).
 * Recusa binário, segredo e tamanho além do teto (devolve truncado).
 */
async function ler({ caminho, maxBytes } = {}) {
  const abs = await validarCaminho(caminho);
  const st = await fsp.stat(abs);
  if (!st.isFile()) throw new Error('isso é uma pasta — use "analisar" nela');
  const nome = path.basename(abs);
  if (ehSegredo(nome)) throw new Error('esse arquivo tem cara de credencial/segredo — me recuso a ler');
  const ext = path.extname(nome).toLowerCase();
  if (!EXT_TEXTO.has(ext)) throw new Error(`só leio texto/código (${ext || 'sem extensão'} não é um tipo seguro)`);
  const teto = Math.min(Number(maxBytes) || LER_MAX_BYTES, LER_MAX_BYTES);
  const fd = await fsp.open(abs, 'r');
  try {
    const buf = Buffer.alloc(Math.min(st.size, teto));
    await fd.read(buf, 0, buf.length, 0);
    if (buf.includes(0)) throw new Error('conteúdo binário — não é texto');
    const conteudo = buf.toString('utf8');
    return {
      caminho: abs, bytes: st.size, truncado: st.size > teto,
      linhas: conteudo.split('\n').length, conteudo
    };
  } finally { await fd.close(); }
}

/**
 * "O que é esta pasta?" — resumo de um diretório: totais, top extensões,
 * maiores/mais recentes, CLASSIFICAÇÃO heurística (projeto/fotos/música…),
 * DUPLICADOS (tamanho igual + hash dos primeiros 64 KB) e GORDURA
 * (arquivos grandes parados há 90+ dias).
 */
async function analisar({ caminho } = {}) {
  const abs = await validarCaminho(caminho || '.');
  const st = await fsp.stat(abs);
  if (!st.isDirectory()) throw new Error('isso é um arquivo — use "ler" nele');

  const porExt = new Map();
  const maiores = [];
  const recentes = [];
  const porTamanho = new Map();   // size -> [caminhos] (candidatos a duplicado)
  const gordura = [];
  let totalBytes = 0;
  const marcadores = new Set();   // arquivos-assinatura (package.json, …)
  const agora = Date.now();

  const stats = await varrer(abs, async (arq, dirent) => {
    const ext = (path.extname(dirent.name) || '(sem ext)').toLowerCase();
    porExt.set(ext, (porExt.get(ext) || 0) + 1);
    if (/^(package\.json|cargo\.toml|pom\.xml|go\.mod|requirements\.txt|gemfile|makefile|index\.html)$/i.test(dirent.name)) {
      marcadores.add(dirent.name.toLowerCase());
    }
    const s = await fsp.stat(arq).catch(() => null);
    if (!s) return;
    totalBytes += s.size;
    maiores.push({ caminho: arq, bytes: s.size });
    if (maiores.length > 40) { maiores.sort((a, b) => b.bytes - a.bytes); maiores.length = 10; }
    recentes.push({ caminho: arq, mtime: s.mtimeMs });
    if (recentes.length > 40) { recentes.sort((a, b) => b.mtime - a.mtime); recentes.length = 5; }
    if (s.size > 1024) {
      const lista = porTamanho.get(s.size) || [];
      if (lista.length < 8) { lista.push(arq); porTamanho.set(s.size, lista); }
    }
    if (s.size > 100 * 1024 * 1024 && agora - s.mtimeMs > 90 * 24 * 3600 * 1000) {
      if (gordura.length < 10) gordura.push({ caminho: arq, bytes: s.size, meses: Math.round((agora - s.mtimeMs) / (30 * 24 * 3600 * 1000)) });
    }
  });

  /* duplicados: só grupos de MESMO tamanho; hash rápido (64 KB) confirma */
  const duplicados = [];
  const hash64k = async (arq) => {
    const fd = await fsp.open(arq, 'r');
    try {
      const buf = Buffer.alloc(64 * 1024);
      const { bytesRead } = await fd.read(buf, 0, buf.length, 0);
      return crypto.createHash('sha1').update(buf.subarray(0, bytesRead)).digest('hex');
    } finally { await fd.close(); }
  };
  let gruposChecados = 0;
  for (const [tam, lista] of porTamanho) {
    if (lista.length < 2 || gruposChecados >= 120 || duplicados.length >= 10) continue;
    gruposChecados++;
    const porHash = new Map();
    for (const arq of lista) {
      const hx = await hash64k(arq).catch(() => null);
      if (!hx) continue;
      const grupo = porHash.get(hx) || [];
      grupo.push(arq);
      porHash.set(hx, grupo);
    }
    for (const grupo of porHash.values()) {
      if (grupo.length > 1) duplicados.push({ bytes: tam, arquivos: grupo });
    }
  }

  /* classificação heurística pelo perfil das extensões */
  const conta = (...exts) => exts.reduce((n, e) => n + (porExt.get(e) || 0), 0);
  const total = stats.arquivos || 1;
  let tipo = 'mista';
  if (marcadores.size >= 1 && conta('.js', '.ts', '.py', '.java', '.rs', '.go', '.c', '.cpp', '.cs', '.html', '.css') > total * 0.25) tipo = 'projeto de código';
  else if (conta('.jpg', '.jpeg', '.png', '.heic', '.webp', '.raw', '.gif') > total * 0.5) tipo = 'fotos/imagens';
  else if (conta('.mp3', '.flac', '.wav', '.ogg', '.m4a') > total * 0.5) tipo = 'música';
  else if (conta('.mp4', '.mkv', '.avi', '.mov', '.webm') > total * 0.4) tipo = 'vídeos';
  else if (conta('.pdf', '.docx', '.doc', '.xlsx', '.pptx', '.odt') > total * 0.4) tipo = 'documentos';
  else if (conta('.zip', '.rar', '.7z', '.bak', '.iso', '.tar', '.gz') > total * 0.4) tipo = 'backups/arquivos compactados';

  maiores.sort((a, b) => b.bytes - a.bytes);
  recentes.sort((a, b) => b.mtime - a.mtime);
  return {
    caminho: abs, tipo,
    arquivos: stats.arquivos, pastas: stats.pastas, tamanho: fmtBytes(totalBytes),
    protegidas: stats.protegidas, parcial: stats.parcial,
    topExtensoes: [...porExt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([e, n]) => `${e}:${n}`),
    maiores: maiores.slice(0, 5).map((m) => ({ caminho: m.caminho, tamanho: fmtBytes(m.bytes) })),
    recentes: recentes.slice(0, 5).map((r) => ({ caminho: r.caminho, quando: new Date(r.mtime).toISOString().slice(0, 10) })),
    duplicados: duplicados.slice(0, 6).map((d) => ({ tamanho: fmtBytes(d.bytes), arquivos: d.arquivos })),
    gordura: gordura.map((g) => ({ caminho: g.caminho, tamanho: fmtBytes(g.bytes), paradoHaMeses: g.meses }))
  };
}

/**
 * Busca por CONTEÚDO (substring literal, sem regex — sem ReDoS) em arquivos
 * de texto seguros sob uma pasta. Devolve arquivo + linha + trecho.
 */
async function grep({ termo, caminho, maxResultados } = {}) {
  const t = String(termo || '').trim();
  if (t.length < 3) throw new Error('termo de conteúdo muito curto (mínimo 3 caracteres)');
  const abs = await validarCaminho(caminho || '.');
  const teto = Math.min(Number(maxResultados) || 40, 100);
  const tLower = t.toLowerCase();
  const acertos = [];
  let arquivosLidos = 0;

  const stats = await varrer(abs, async (arq, dirent) => {
    if (acertos.length >= teto) return;
    const ext = path.extname(dirent.name).toLowerCase();
    if (!EXT_TEXTO.has(ext) || ehSegredo(dirent.name)) return;
    const s = await fsp.stat(arq).catch(() => null);
    if (!s || s.size > 512 * 1024) return;
    const texto = await fsp.readFile(arq, 'utf8').catch(() => null);
    if (texto == null || texto.includes('\0')) return;
    arquivosLidos++;
    if (!texto.toLowerCase().includes(tLower)) return;
    const linhas = texto.split('\n');
    for (let i = 0; i < linhas.length && acertos.length < teto; i++) {
      if (linhas[i].toLowerCase().includes(tLower)) {
        acertos.push({ caminho: arq, linha: i + 1, trecho: linhas[i].trim().slice(0, 200) });
      }
    }
  });

  return { termo: t, total: acertos.length, tetoAtingido: acertos.length >= teto, arquivosLidos, acertos, parcial: stats.parcial };
}

module.exports = { status, buscar, relatorio, ler, analisar, grep };
