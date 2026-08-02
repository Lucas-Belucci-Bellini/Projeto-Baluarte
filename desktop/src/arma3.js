// Ponte de EXTRAÇÃO do Arma 3 (0.9.1) — do debug console do jogo até um ramo
// no repositório, sem passo manual no meio.
//
// O fluxo de hoje é: colar o `.sqf` no jogo → abrir o terminal → rodar o parser
// Python → abrir o git → commitar → empurrar. Cinco ferramentas para uma coisa
// só, e as três últimas fora do jogo. Este módulo faz o app cuidar do que vem
// depois do jogo.
//
// ═══ AS QUATRO REGRAS QUE DEFINEM ESTE MÓDULO ═══
//
// 1. NENHUM SEGREDO NOSSO. O app não guarda token do GitHub, não pede senha e
//    não fala com a API do GitHub. Quem empurra é o `git` da máquina, com a
//    credencial que o operador já configurou (gerenciador de credenciais ou
//    chave SSH). Guardar token de repositório dentro de um app de desktop seria
//    trocar conveniência por um segredo a mais para vazar — e este app já tem
//    uma postura de segurança séria em `arquivos.js` que não vale contradizer.
//
// 2. NUNCA NO RAMO PRINCIPAL. Só empurra para ramo com prefixo próprio, e
//    recusa `main`/`master`/`HEAD` explicitamente. O que sai daqui vira PR,
//    nunca commit direto no que está no ar.
//
// 3. SÓ O QUE A EXTRAÇÃO PRODUZ. O `git add` recebe uma lista fixa de caminhos
//    dentro de `scripts/arma3/out/`. Se a extração mexer em qualquer outro
//    arquivo, o módulo ABORTA em vez de commitar junto — um extrator com defeito
//    não pode virar commit de coisa alheia.
//
// 4. UMA IMPLEMENTAÇÃO DO PARSING. Os parsers continuam em Python, no repo. O
//    app ORQUESTRA, não reimplementa: portar seis parsers para Node criaria duas
//    versões da mesma leitura, que é exatamente o defeito que já apareceu neste
//    projeto (o /cripto tinha uma segunda implementação de Morse e ela engolia
//    letra em silêncio).
//
// Tudo por `execFile` com argv fixo — nunca `shell`, nunca interpolação de
// string em comando.

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const WIN = process.platform === 'win32';

/* Prefixo obrigatório do ramo. Serve de duas coisas: deixa claro na lista de
 * ramos de onde veio, e é a peneira que impede empurrar para qualquer lugar. */
const PREFIXO_RAMO = 'arma3/extracao-';
const RAMOS_PROIBIDOS = new Set(['main', 'master', 'head', 'develop', 'producao', 'production']);

/* Só estes arquivos podem ser commitados. É a regra 3. */
const DIR_SAIDA = 'scripts/arma3/out';
const PADRAO_SAIDA = /^arma3-[a-z0-9-]+\.json$/;

/* Prova de que a pasta apontada é ESTE repositório, e não uma qualquer: um
 * arquivo que só existe aqui. Sem isto, um caminho errado faria o app commitar
 * em outro projeto do operador. */
const PROVA_REPO = path.join('scripts', 'arma3', 'extrair-tudo.py');

const TEMPO_LIMITE = { git: 60_000, python: 15 * 60_000 };   // extração é demorada

/* As etapas que o app sabe pedir, e o .sqf que cada uma exige. Espelha
 * `ETAPAS` de scripts/arma3/extrair-tudo.py — se lá crescer, aqui também. */
const ETAPAS = {
  armas: 'dump-config.sqf',
  mapas: 'dump-mapas.sqf',
  itens: 'dump-itens.sqf',
  veiculos: 'dump-veiculos.sqf',
  acessorios: 'dump-acessorios.sqf',
  animacoes: 'dump-animacoes.sqf',
  grupos: 'dump-grupos.sqf',
  funcoes: 'dump-funcoes.sqf',
  manual: 'dump-manual.sqf',
  simbologia: 'dump-simbologia.sqf',
  'terreno-fisico': 'dump-terreno-fisico.sqf',
  proveniencia: 'dump-proveniencia.sqf'
};

/* Marca que cada dump escreve no .rpt. É como saber o que o operador já rodou
 * no jogo sem perguntar. */
const MARCAS = {
  armas: '<<A3DUMP>>',
  mapas: '<<A3MAPA>>',
  itens: '<<A3ITEM>>',
  veiculos: '<<A3VEIC>>',
  acessorios: '<<A3ACC>>',
  animacoes: '<<A3ANIM>>',
  grupos: '<<A3GRUPO>>',
  funcoes: '<<A3FUNC>>',
  manual: '<<A3MANUAL>>',
  simbologia: '<<A3SIMB>>',
  'terreno-fisico': '<<A3CHAO>>',
  proveniencia: '<<A3PROV>>'
};

/* ══════════════════════ processos (argv fixo, sem shell) ══════════════════ */

function rodar(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, {
      cwd: opts.cwd,
      timeout: opts.timeout || TEMPO_LIMITE.git,
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }   // nunca travar pedindo senha
    }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        codigo: err ? (err.code ?? 1) : 0,
        saida: String(stdout || ''),
        erro: String(stderr || '') || (err ? String(err.message) : ''),
        expirou: !!(err && err.killed)
      });
    });
  });
}

const git = (repo, args, timeout) => rodar('git', args, { cwd: repo, timeout });

/* ══════════════════════════ repositório ══════════════════════════════════ */

/** Onde está o clone. `BALUARTE_REPO` manda; senão, tenta os lugares óbvios. */
function acharRepo(preferido) {
  const tentativas = [
    preferido,
    process.env.BALUARTE_REPO,
    path.join(os.homedir(), 'Projeto-Baluarte'),
    path.join(os.homedir(), 'Documents', 'Projeto-Baluarte'),
    path.join(os.homedir(), 'Documentos', 'Projeto-Baluarte'),
    path.join(os.homedir(), 'dev', 'Projeto-Baluarte'),
    path.join(os.homedir(), 'git', 'Projeto-Baluarte')
  ].filter(Boolean);

  for (const t of tentativas) {
    try {
      const raiz = path.resolve(t);
      if (fs.existsSync(path.join(raiz, PROVA_REPO)) && fs.existsSync(path.join(raiz, '.git'))) {
        return raiz;
      }
    } catch { /* caminho inválido: tenta o próximo */ }
  }
  return null;
}

async function estadoRepo(repo) {
  if (!repo) return { valido: false, motivo: 'clone do Projeto-Baluarte não encontrado' };
  const ramo = await git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const sujo = await git(repo, ['status', '--porcelain', '-uall']);
  if (!ramo.ok) return { valido: false, motivo: 'não é um repositório git utilizável' };
  const pendentes = sujo.saida.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    valido: true,
    caminho: repo,
    ramo: ramo.saida.trim(),
    /* Trabalho pendente FORA da pasta de saída impede o commit: não dá para
     * empurrar extração junto com edição pela metade que o operador esqueceu. */
    pendentesForaDaSaida: pendentes.filter((l) => !l.includes(DIR_SAIDA)).length,
    pendentesNaSaida: pendentes.filter((l) => l.includes(DIR_SAIDA)).length
  };
}

/* ══════════════════════════════ o .rpt ═══════════════════════════════════ */

/** Pasta de logs do Arma 3 em cada sistema. */
function pastasDeLog() {
  const casa = os.homedir();
  if (WIN) return [path.join(process.env.LOCALAPPDATA || path.join(casa, 'AppData', 'Local'), 'Arma 3')];
  return [
    path.join(casa, '.local', 'share', 'Arma 3'),
    path.join(casa, 'Library', 'Application Support', 'Arma 3'),
    // Proton/Steam no Linux
    path.join(casa, '.steam', 'steam', 'steamapps', 'compatdata', '107410', 'pfx',
              'drive_c', 'users', 'steamuser', 'AppData', 'Local', 'Arma 3')
  ];
}

/**
 * Lê o `.rpt` mais recente e diz QUAIS dumps ele contém.
 *
 * Linha a linha e com teto de bytes: um `.rpt` de sessão longa passa de 1 GB, e
 * ler inteiro na memória já derrubou processo neste projeto.
 */
function varrerRpt(arquivo, tetoBytes = 400 * 1024 * 1024) {
  const achados = {};
  const fd = fs.openSync(arquivo, 'r');
  try {
    const tam = fs.fstatSync(fd).size;
    const inicio = Math.max(0, tam - tetoBytes);      // só a cauda, que é onde está o dump novo
    const buf = Buffer.alloc(1024 * 1024);
    let pos = inicio;
    let resto = '';
    while (pos < tam) {
      const lidos = fs.readSync(fd, buf, 0, buf.length, pos);
      if (lidos <= 0) break;
      pos += lidos;
      const texto = resto + buf.toString('latin1', 0, lidos);
      const linhas = texto.split('\n');
      resto = linhas.pop() || '';
      for (const linha of linhas) {
        for (const [etapa, marca] of Object.entries(MARCAS)) {
          if (!linha.includes(marca)) continue;
          const a = (achados[etapa] ||= { registros: 0, completo: false });
          a.registros += 1;
          if (linha.includes(`${marca}FIM`)) a.completo = true;
        }
      }
    }
    return achados;
  } finally {
    fs.closeSync(fd);
  }
}

function acharRpt() {
  for (const pasta of pastasDeLog()) {
    let arquivos;
    try {
      arquivos = fs.readdirSync(pasta).filter((a) => a.toLowerCase().endsWith('.rpt'));
    } catch { continue; }
    if (!arquivos.length) continue;
    const ordenados = arquivos
      .map((a) => {
        const p = path.join(pasta, a);
        try { return { p, mtime: fs.statSync(p).mtimeMs }; } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime);
    if (ordenados.length) return ordenados[0].p;
  }
  return null;
}

/* ═══════════════════════════ python ══════════════════════════════════════ */

async function acharPython() {
  for (const cmd of WIN ? ['py', 'python', 'python3'] : ['python3', 'python']) {
    const r = await rodar(cmd, ['--version'], { timeout: 8000 });
    if (r.ok) return { cmd, versao: (r.saida || r.erro).trim() };
  }
  return null;
}

/* ════════════════════════════ API pública ════════════════════════════════ */

/** Panorama: dá para extrair? o que o jogo já dumpou? o repo aceita commit? */
async function status(payload = {}) {
  const repo = acharRepo(payload.repo);
  const [estado, python] = await Promise.all([estadoRepo(repo), acharPython()]);

  const rpt = acharRpt();
  let dumps = {};
  let erroRpt = null;
  if (rpt) {
    try { dumps = varrerRpt(rpt); } catch (e) { erroRpt = String(e.message || e); }
  }

  const disponiveis = Object.keys(dumps).filter((e) => dumps[e].registros > 0);
  return {
    repo: estado,
    python: python || { cmd: null, versao: null },
    rpt: rpt ? { caminho: rpt, erro: erroRpt } : null,
    dumps,
    disponiveis,
    etapasConhecidas: Object.keys(ETAPAS),
    /* Pronto = dá para rodar a extração agora, sem pedir mais nada ao operador. */
    pronto: !!(estado.valido && python && disponiveis.length),
    /* O que ainda falta rodar NO JOGO, com o nome do arquivo a colar. */
    faltamNoJogo: Object.entries(ETAPAS)
      .filter(([e]) => !disponiveis.includes(e))
      .map(([etapa, sqf]) => ({ etapa, sqf: `scripts/arma3/${sqf}` }))
  };
}

/**
 * Roda os parsers (Python, no repo) para as etapas pedidas.
 * Não toca em git — extrair e entregar são passos separados de propósito, para
 * o operador poder olhar o resultado antes de mandar.
 */
async function extrair(payload = {}) {
  const repo = acharRepo(payload.repo);
  const estado = await estadoRepo(repo);
  if (!estado.valido) throw new Error(estado.motivo);

  const python = await acharPython();
  if (!python) throw new Error('Python não encontrado — os parsers do Arma 3 rodam em Python');

  const pedidas = Array.isArray(payload.etapas) ? payload.etapas : [];
  const invalidas = pedidas.filter((e) => !Object.prototype.hasOwnProperty.call(ETAPAS, e));
  if (invalidas.length) throw new Error(`etapa desconhecida: ${invalidas.join(', ')}`);

  const antes = instantaneoSaida(repo);
  const r = await rodar(python.cmd, [path.join('scripts', 'arma3', 'extrair-tudo.py'), ...pedidas],
                        { cwd: repo, timeout: TEMPO_LIMITE.python });
  const depois = instantaneoSaida(repo);

  const mudados = Object.keys(depois).filter((f) => depois[f] !== antes[f]);
  return {
    ok: r.ok,
    expirou: r.expirou,
    etapas: pedidas.length ? pedidas : Object.keys(ETAPAS),
    /* O log inteiro do extrator: é onde aparecem os avisos de placar divergente
     * e de campo truncado, que são o sinal de que algo se perdeu. */
    log: (r.saida + (r.erro ? `\n${r.erro}` : '')).trim().slice(-20000),
    arquivosMudados: mudados,
    avisos: extrairAvisos(r.saida + r.erro)
  };
}

/** Assinatura (tamanho+mtime) de cada JSON da pasta de saída. */
function instantaneoSaida(repo) {
  const dir = path.join(repo, DIR_SAIDA);
  const mapa = {};
  let nomes = [];
  try { nomes = fs.readdirSync(dir); } catch { return mapa; }
  for (const nome of nomes) {
    if (!PADRAO_SAIDA.test(nome)) continue;
    try {
      const s = fs.statSync(path.join(dir, nome));
      mapa[nome] = `${s.size}:${Math.round(s.mtimeMs)}`;
    } catch { /* sumiu no meio: ignora */ }
  }
  return mapa;
}

/** As linhas de aviso dos parsers (começam com `!`) — o que merece o olho. */
function extrairAvisos(log) {
  return String(log || '').split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('!') || l.startsWith('  !'))
    .map((l) => l.replace(/^!+\s*/, ''))
    .slice(0, 40);
}

/**
 * Commita a pasta de saída num RAMO próprio e (se pedido) empurra.
 *
 * `empurrar` é opt-in: sem ele, o commit fica local e o operador confere antes.
 * Sem token nosso — quem autentica é o git da máquina.
 */
async function entregar(payload = {}) {
  const repo = acharRepo(payload.repo);
  const estado = await estadoRepo(repo);
  if (!estado.valido) throw new Error(estado.motivo);

  if (estado.pendentesForaDaSaida > 0) {
    throw new Error(
      `há ${estado.pendentesForaDaSaida} alteração(ões) pendentes fora de ${DIR_SAIDA}. ` +
      'Commite ou guarde antes: a extração não pode carregar edição alheia junto.');
  }

  /* Regra 3: só entram os JSONs da pasta de saída, conferidos um a um.
   *
   * `-uall` não é detalhe: sem ele o `git status --porcelain` AGRUPA diretório
   * não rastreado numa linha só (`?? scripts/arma3/out/`), e a peneira por nome
   * de arquivo não acha nada — a entrega diria "nada mudou" com a pasta cheia.
   * Acontece exatamente no caso que mais importa: a primeira extração de uma
   * base nova, que ainda não existe no índice. */
  const st = await git(repo, ['status', '--porcelain', '-uall', '--', DIR_SAIDA]);
  const alvos = st.saida.split('\n').map((l) => l.slice(3).trim()).filter(Boolean)
    .filter((p) => p.startsWith(`${DIR_SAIDA}/`) && PADRAO_SAIDA.test(path.basename(p)));
  if (!alvos.length) {
    return { ok: false, motivo: 'nada mudou na pasta de saída — rode a extração antes' };
  }

  /* Regra 2: ramo com prefixo próprio, e jamais um ramo protegido. */
  const sufixo = String(payload.ramo || new Date().toISOString().slice(0, 16).replace(/[:T]/g, ''))
    .toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  if (!sufixo) throw new Error('nome de ramo vazio depois da limpeza');
  const ramo = `${PREFIXO_RAMO}${sufixo}`;
  if (RAMOS_PROIBIDOS.has(sufixo) || RAMOS_PROIBIDOS.has(ramo.toLowerCase())) {
    throw new Error(`ramo protegido: ${ramo}`);
  }

  const passos = [];
  const passo = async (rotulo, args, timeout) => {
    const r = await git(repo, args, timeout);
    passos.push({ rotulo, ok: r.ok, saida: (r.saida + r.erro).trim().slice(0, 4000) });
    if (!r.ok) throw Object.assign(new Error(`${rotulo}: ${(r.erro || r.saida).trim()}`), { passos });
    return r;
  };

  await passo('criar ramo', ['checkout', '-B', ramo]);
  await passo('preparar', ['add', '--', ...alvos]);

  const mensagem = montarMensagem(payload, alvos);
  await passo('commitar', ['commit', '-m', mensagem]);

  let empurrado = false;
  if (payload.empurrar === true) {
    await passo('empurrar', ['push', '-u', 'origin', ramo], TEMPO_LIMITE.git * 3);
    empurrado = true;
  }

  const sha = await git(repo, ['rev-parse', '--short', 'HEAD']);
  return {
    ok: true, ramo, empurrado, arquivos: alvos, commit: sha.saida.trim(),
    passos,
    /* Sem token e sem API: o PR é aberto pelo operador, no navegador. */
    prUrl: empurrado
      ? `https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/new/${encodeURIComponent(ramo)}`
      : null
  };
}

function montarMensagem(payload, alvos) {
  const etapas = Array.isArray(payload.etapas) && payload.etapas.length
    ? payload.etapas.join(', ') : 'extração do Arma 3';
  const linhas = [
    `Arma 3: extração de ${etapas}`,
    '',
    'Gerado pelo Baluarte Launcher a partir do dump do jogo em execução.',
    '',
    ...alvos.map((a) => `  ${a}`),
  ];
  if (payload.observacao) {
    linhas.push('', String(payload.observacao).slice(0, 500));
  }
  return linhas.join('\n');
}

module.exports = { status, extrair, entregar, ETAPAS, MARCAS, PREFIXO_RAMO };
