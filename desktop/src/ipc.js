// Ponte IPC allowlisted (M2) — a fronteira de segurança entre o renderer (UI
// vinda da web, "não confiável") e o processo principal (poder nativo).
//
// Tudo passa por UM canal (`baluarte:invoke`) e é validado aqui:
//   • o remetente precisa ser a janela principal;
//   • o `channel` precisa estar na allowlist explícita (handlers abaixo);
//   • cada handler valida o próprio payload.
// O renderer NUNCA recebe `ipcRenderer` cru nem FS/require — só o funil
// `window.baluarte.invoke(channel, payload)` do preload.
//
// É aqui que o M3 vai plugar os handlers `nexus.*` (motor real do GitNexus).
const { ipcMain, shell, app } = require('electron');
const path = require('node:path');
const nexus = require('./nexus');
const hermes = require('./hermes');
const arquivos = require('./arquivos');
const arma3 = require('./arma3');
const { criarRuntime } = require('./runtime');

/**
 * Monta os handlers permitidos. `ctx` injeta o que vem do main:
 *   getMainWindow(): BrowserWindow | null
 *   getOnline(): boolean
 *   remoteUrl: string
 */
function buildHandlers(ctx) {
  /* A raiz confiável do Runtime vive no `userData`, seguindo o M4 (RFC #232): o
   * app provê os recursos dele numa pasta própria, sem tocar no sistema.
   *
   * Fica AQUI e não no topo do módulo porque `app.getPath` depende do app estar
   * pronto, e `buildHandlers` só roda no `registerIpc` (main.js:403). No topo,
   * um `require` deste arquivo antes do `ready` derrubaria o arranque.
   *
   * `criarRuntime` não spawna nada — só a primeira operação sobe o processo. */
  const runtime = criarRuntime({
    raiz: path.join(app.getPath('userData'), 'runtime-root')
  });

  return {
    // liveness trivial — útil pra UI confirmar a ponte
    ping: async () => 'pong',

    // metadados do app (a UI mostra "Baluarte Launcher v0.1.0 • win32 • online")
    'app:info': async () => ({
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      online: ctx.getOnline(),
      native: true
    }),

    // abre um link http(s) no navegador padrão (validado — sem file:/javascript:)
    'app:openExternal': async (payload = {}) => {
      const url = payload && payload.url;
      if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
        throw new Error('url inválida (só http/https)');
      }
      await shell.openExternal(url);
      return true;
    },

    // recarrega o hub a partir da produção
    'app:reload': async () => {
      const w = ctx.getMainWindow();
      if (w && !w.isDestroyed()) w.loadURL(ctx.remoteUrl);
      return true;
    },

    // M3a: estado do motor real do GitNexus (servidor na 4747).
    // { available, url, version?, nodeVersion?, spawned }
    'nexus:status': async () => nexus.status(),

    // M3b: grafo REAL do motor (1º repo analisado).
    // { repo, nodes: GraphNode[], relationships: GraphRelationship[] }
    'nexus:graph': async () => nexus.graph(),

    // Fatia 2 (#310/#231): motor Hermes EMBUTIDO (llama.cpp/GGUF), sem API.
    // status inerte se a dep/modelo não existirem → o agente cai no WebLLM.
    'hermes:status': async () => hermes.status(),
    'hermes:generate': async (payload = {}) => hermes.generate(payload),

    // 0.6.0 (#369): JARVIS Arquivista — motor READ-ONLY de arquivos.
    // buscar/relatorio varrem só o diretório do usuário, com cofre pessoal,
    // zona proibida e limites duros (ver desktop/src/arquivos.js).
    'arquivos:status': async () => arquivos.status(),
    'arquivos:buscar': async (payload = {}) => arquivos.buscar(payload),
    'arquivos:relatorio': async () => arquivos.relatorio(),

    // 0.6.1 (#369 fase 2): analisar — leitura de texto seguro, resumo de
    // pasta (duplicados/gordura) e busca por conteúdo. Caminhos de fora
    // passam pelo validarCaminho (raiz + cofre + symlink) no motor.
    'arquivos:ler': async (payload = {}) => arquivos.ler(payload),
    'arquivos:analisar': async (payload = {}) => arquivos.analisar(payload),
    'arquivos:grep': async (payload = {}) => arquivos.grep(payload),

    // 0.7.0 (#369 fase 3): organizar COM CONFIRMAÇÃO — 1 arquivo por vez,
    // "apagar" = lixeira do Baluarte (reversível via restaurar). A pergunta
    // de confirmação mora no Núcleo; o agente NÃO tem acesso a estes canais.
    'arquivos:mover': async (payload = {}) => arquivos.mover(payload),
    'arquivos:apagar': async (payload = {}) => arquivos.apagar(payload),
    'arquivos:lixeira': async () => arquivos.lixeira(),
    'arquivos:restaurar': async (payload = {}) => arquivos.restaurar(payload),

    // 0.7.1 (#369 fase 4): Sentinela — higiene defensiva READ-ONLY
    // (iscas de dupla extensão, executáveis em Downloads/Desktop, autostart).
    'arquivos:sentinela': async () => arquivos.sentinela(),

    // 0.9.1 (#405): ponte de extração do Arma 3 — do debug console do jogo até
    // um ramo no repositório, sem passo manual no meio.
    //
    // Os três passos são SEPARADOS de propósito: o operador vê o que o jogo
    // dumpou, roda a extração, confere o resultado, e só então manda. Um botão
    // só que fizesse tudo esconderia justamente o momento de conferir.
    //
    // Segurança (ver desktop/src/arma3.js): o app NÃO guarda token do GitHub —
    // quem empurra é o git da máquina, com a credencial que já existe. Nunca
    // empurra para ramo protegido, e só commita os JSONs de scripts/arma3/out.
    'arma3:status': async (payload = {}) => arma3.status(payload),
    'arma3:extrair': async (payload = {}) => arma3.extrair(payload),
    'arma3:entregar': async (payload = {}) => arma3.entregar(payload),

    // V2: o Runtime nativo (Rust), pelo transporte de `v2/core/runtime-stdio.js`.
    //
    // `status` DEGRADA em vez de estourar quando o binário não está no pacote —
    // que é o estado normal enquanto a release não o empacota. Mesmo contrato do
    // `hermes:status`, e pela mesma razão: recurso ausente não pode virar app
    // quebrado.
    'runtime:status': async () => runtime.status(),
    'runtime:autorizar': async (payload = {}) => {
      if (!payload.envelope) throw new Error('envelope é obrigatório');
      return runtime.autorizar(payload.envelope);
    },
    'runtime:ler': async (payload = {}) => {
      // O confinamento de caminho é do Runtime, do outro lado da fronteira; aqui
      // só se cobra a FORMA, para não mandar `undefined` atravessar como se
      // fosse pedido legítimo.
      if (!payload.envelope) throw new Error('envelope é obrigatório');
      if (typeof payload.modulo !== 'string' || typeof payload.path !== 'string') {
        throw new Error('modulo e path são obrigatórios');
      }
      return runtime.ler(payload.envelope, payload.modulo, payload.path);
    }
  };
}

/** Registra o funil único de IPC com validação de remetente + allowlist. */
function registerIpc(ctx) {
  const handlers = buildHandlers(ctx);

  ipcMain.handle('baluarte:invoke', async (event, channel, payload) => {
    // 1) remetente: só a janela principal pode invocar
    const w = ctx.getMainWindow();
    if (!w || w.isDestroyed() || event.sender !== w.webContents) {
      return { ok: false, error: 'remetente não autorizado' };
    }
    // 2) allowlist: só canais conhecidos
    const known =
      typeof channel === 'string' && Object.prototype.hasOwnProperty.call(handlers, channel);
    if (!known) return { ok: false, error: `canal desconhecido: ${channel}` };
    // 3) executa com payload validado pelo handler
    try {
      const data = await handlers[channel](payload || {});
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  // Lista de canais (útil pra debug / futura introspecção da UI).
  return Object.keys(handlers);
}

module.exports = { registerIpc };
