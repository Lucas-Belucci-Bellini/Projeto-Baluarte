// Runtime nativo da V2 no app — ponte entre o main do Electron e o
// `baluarte-runtime` (Rust), pelo transporte declarado em
// `v2/core/runtime-stdio.js`.
//
// Canais (registrados na allowlist do `ipc.js`):
//   'runtime:status'    -> { disponivel, binario?, motivo? }
//   'runtime:autorizar' -> resposta do Runtime para `authorize`
//   'runtime:ler'       -> resposta do Runtime para `read_file`
//
// ── Três decisões que valem a explicação ────────────────────────────────────
//
// 1. **Não requer `electron`.** Nem no topo, nem em lugar nenhum. A raiz
//    confiável entra injetada, como o `ctx` do `buildHandlers` já faz com o
//    resto. É o que torna este arquivo testável em Node puro — `hermes.js` já
//    seguia essa disciplina, e sem ela não haveria como provar nada daqui sem
//    subir um Electron.
//
// 2. **Ausência não é erro.** Se o binário não estiver no pacote, `status()`
//    devolve `{ disponivel: false, motivo }` em vez de estourar — mesmo contrato
//    do `hermes:status`. Hoje é o estado normal: o binário só existe depois de
//    um `cargo build`, e a release ainda não o empacota. Ponte que explode
//    quando a peça falta transforma "recurso ausente" em "app quebrado".
//
// 3. **`pathToFileURL` no import dinâmico.** O transporte é ESM e este processo
//    é CommonJS, então a carga é por `import()`. Em Windows, `import()` de um
//    caminho absoluto (`C:\...`) falha — precisa de URL `file://`. É a família
//    "Windows" de novo, e ela já custou caro neste repositório.

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const EXE = process.platform === 'win32' ? 'baluarte-runtime.exe' : 'baluarte-runtime';

/* A raiz do repositório vista de `desktop/src/`. Em app empacotado este caminho
 * não existe, e é por isso que os candidatos de `resourcesPath` vêm antes. */
const RAIZ_REPO = path.join(__dirname, '..', '..');

/**
 * Onde o binário pode estar, em ordem de precedência.
 *
 * `BALUARTE_RUNTIME_BIN` vem primeiro para permitir apontar à mão sem editar
 * código — o mesmo recurso que o `hermes.js` dá para o modelo, e que salva
 * quando o empacotamento muda de lugar.
 *
 * `release` antes de `debug`: se as duas existirem na máquina de quem
 * desenvolve, a otimizada é a que se parece com produção.
 *
 * @returns {string[]}
 */
function candidatosBinario() {
  const lista = [];
  if (process.env.BALUARTE_RUNTIME_BIN) lista.push(process.env.BALUARTE_RUNTIME_BIN);
  if (process.resourcesPath) lista.push(path.join(process.resourcesPath, 'runtime', EXE));
  const alvo = path.join(RAIZ_REPO, 'v2', 'runtime', 'target');
  lista.push(path.join(alvo, 'release', EXE));
  lista.push(path.join(alvo, 'debug', EXE));
  return lista;
}

/** @returns {string[]} */
function candidatosTransporte() {
  const lista = [];
  if (process.resourcesPath) {
    lista.push(path.join(process.resourcesPath, 'v2core', 'runtime-stdio.js'));
  }
  lista.push(path.join(RAIZ_REPO, 'v2', 'core', 'runtime-stdio.js'));
  return lista;
}

/** @param {string[]} candidatos @returns {string|null} */
function primeiroQueExiste(candidatos) {
  for (const c of candidatos) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      /* Caminho inválido é "não existe", não motivo para derrubar a busca. */
    }
  }
  return null;
}

/**
 * @param {{ raiz: string, acharBinario?: () => (string|null), acharTransporte?: () => (string|null) }} opcoes
 */
function criarRuntime(opcoes) {
  if (!opcoes || !opcoes.raiz) throw new TypeError('raiz é obrigatória');
  const raiz = opcoes.raiz;
  /* Injetáveis para o teste poder simular "binário ausente" e "binário
   * presente" sem depender do que existe no disco de quem roda a suíte. */
  const acharBinario = opcoes.acharBinario || (() => primeiroQueExiste(candidatosBinario()));
  const acharTransporte = opcoes.acharTransporte || (() => primeiroQueExiste(candidatosTransporte()));

  /** @type {{autorizar: Function, lerArquivo: Function, fechar: Function}|null} */
  let transporte = null;

  function status() {
    const binario = acharBinario();
    if (!binario) {
      return {
        disponivel: false,
        motivo: 'binário do Runtime não encontrado — compile com `cargo build --release --manifest-path v2/runtime/Cargo.toml` ou aponte BALUARTE_RUNTIME_BIN'
      };
    }
    if (!acharTransporte()) {
      return {
        disponivel: false,
        binario,
        motivo: 'transporte (v2/core/runtime-stdio.js) não encontrado no pacote'
      };
    }
    return { disponivel: true, binario };
  }

  /* Lazy: o processo do Runtime só sobe quando alguém realmente pede uma
   * operação. Abrir no `require` faria todo arranque do app pagar por um
   * recurso que a maioria das sessões não usa. */
  async function ligado() {
    if (transporte) return transporte;
    const s = status();
    if (!s.disponivel) throw new Error(`Runtime indisponível: ${s.motivo}`);
    const mod = await import(pathToFileURL(String(acharTransporte())).href);
    transporte = mod.criarRuntimeStdio({ executable: String(s.binario), root: raiz });
    return transporte;
  }

  /** @param {unknown} envelope */
  async function autorizar(envelope) {
    return (await ligado()).autorizar(envelope);
  }

  /** @param {unknown} envelope @param {string} modulo @param {string} caminho */
  async function ler(envelope, modulo, caminho) {
    return (await ligado()).lerArquivo(envelope, modulo, caminho);
  }

  async function fechar() {
    const atual = transporte;
    transporte = null;
    if (atual) await atual.fechar();
  }

  return { status, autorizar, ler, fechar };
}

module.exports = { criarRuntime, candidatosBinario, candidatosTransporte, EXE };
