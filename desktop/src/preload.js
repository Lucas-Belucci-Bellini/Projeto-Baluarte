// Ponte segura (M0) — exposta ao renderer via contextBridge.
//
// Por enquanto só metadados read-only. O importante já no M0: a UI da web pode
// checar `window.baluarte?.native === true` pra saber que está rodando DENTRO do
// launcher (e então ligar o "modo nativo": motor real do GitNexus, FS, etc.).
//
// Em M2 isto vira a API allowlisted de verdade (baluarte.invoke('nexus.context', …)),
// com validação no processo principal. Nada de `require`/FS cru atravessa a ponte.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('baluarte', {
  native: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});
