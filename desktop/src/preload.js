// Ponte segura (M0/M1) — exposta ao renderer via contextBridge.
//
// Hoje: metadados read-only + estado de conexão. A UI da web pode checar
// `window.baluarte?.native === true` pra saber que roda DENTRO do launcher
// (ligar o "modo nativo": motor real do GitNexus, FS, etc.).
//
// M1: relata navigator.onLine pro processo principal, que reflete o estado
// na bandeja e no título (indicador online/offline).
//
// M2: vira a API allowlisted de verdade (baluarte.invoke('nexus.context', …)),
// validada no main. Nada de `require`/FS cru atravessa a ponte.
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

contextBridge.exposeInMainWorld('baluarte', {
  native: true,
  platform: process.platform,
  isOnline: () => navigator.onLine,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});
