// Ponte segura (M0/M1) — exposta ao renderer via contextBridge.
//
// Hoje: metadados read-only + estado de conexão. A UI da web pode checar
// `window.baluarte?.native === true` pra saber que roda DENTRO do launcher
// (ligar o "modo nativo": motor real do GitNexus, FS, etc.).
//
// M1: relata navigator.onLine pro processo principal, que reflete o estado
// na bandeja e no título (indicador online/offline).
//
// M2 (este): expõe o funil `invoke(channel, payload)` — toda chamada nativa
// passa por UM canal validado no main (allowlist + remetente). O renderer
// nunca recebe `ipcRenderer` cru nem FS/require. M3 pluga os handlers nexus.*.
const { contextBridge, ipcRenderer } = require('electron');

const report = () => {
  try {
    ipcRenderer.send('baluarte:net', navigator.onLine);
  } catch {
    /* ignore */
  }
};

window.addEventListener('online', report);
window.addEventListener('offline', report);
window.addEventListener('DOMContentLoaded', report);
report(); // reporta o estado inicial já no preload

/** Funil único: resolve com os dados ou rejeita com a mensagem de erro do main. */
async function invoke(channel, payload) {
  const res = await ipcRenderer.invoke('baluarte:invoke', channel, payload);
  if (!res || res.ok !== true) {
    throw new Error((res && res.error) || 'falha no invoke');
  }
  return res.data;
}

contextBridge.exposeInMainWorld('baluarte', {
  native: true,
  platform: process.platform,
  isOnline: () => navigator.onLine,
  invoke,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});
