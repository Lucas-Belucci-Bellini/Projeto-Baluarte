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
const nexus = require('./nexus');

/**
 * Monta os handlers permitidos. `ctx` injeta o que vem do main:
 *   getMainWindow(): BrowserWindow | null
 *   getOnline(): boolean
 *   remoteUrl: string
 */
function buildHandlers(ctx) {
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

    // M3d: subset REST do motor. Cada handler passa o payload (validado em
    // nexus.js) e lança se o motor estiver fora → a UI mostra "indisponível".
    'nexus:repos': async () => nexus.repos(), // GET /api/repos
    'nexus:search': async (payload) => nexus.search(payload), // POST /api/search (híbrida)
    'nexus:cypher': async (payload) => nexus.cypher(payload), // POST /api/query (Cypher)
    'nexus:processes': async (payload) => nexus.processes(payload), // GET /api/processes
    'nexus:clusters': async (payload) => nexus.clusters(payload) // GET /api/clusters
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
