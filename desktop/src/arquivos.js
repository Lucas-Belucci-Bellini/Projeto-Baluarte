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

module.exports = { status, buscar, relatorio };
