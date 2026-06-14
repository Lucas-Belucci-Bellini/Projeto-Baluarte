// Baluarte Launcher — processo principal (M0).
//
// Responsabilidades do M0:
//   1. Abrir a janela e carregar a PRODUÇÃO (a mesma UI Vite servida na web).
//   2. Cair num build EMBUTIDO se a web falhar (offline) — fallback gracioso.
//   3. Disparar o auto-update (electron-updater → GitHub Releases) quando empacotado.
//
// Postura de segurança já desde o M0 (a UI vem da web, então o renderer é "não
// confiável"): contextIsolation ligado, nodeIntegration desligado, sandbox, e
// navegação/links presos às origens confiáveis. A ponte nativa de verdade
// (nexus.*, fs.*) entra no M2, atrás de uma allowlist no preload.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch {
  /* electron-updater ausente em dev cru — segue sem auto-update */
}

const REMOTE_URL = 'https://projeto-baluarte.vercel.app/';
const ALLOWED_ORIGINS = ['https://projeto-baluarte.vercel.app'];

/** Caminho do index embutido usado como fallback offline. */
function embeddedIndex() {
  // Empacotado: extraResources copia ../dist -> resources/web
  const packaged = path.join(process.resourcesPath, 'web', 'index.html');
  if (app.isPackaged && fs.existsSync(packaged)) return packaged;
  // Dev: usa o build do Vite irmão (repo/dist), se existir
  const sibling = path.join(__dirname, '..', '..', 'dist', 'index.html');
  if (fs.existsSync(sibling)) return sibling;
  // Último recurso: a página offline mínima
  return path.join(__dirname, 'offline.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#06080d',
    show: false,
    title: 'Baluarte Launcher',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  win.once('ready-to-show', () => win.show());

  // Fallback: se o carregamento principal falhar (offline), usa o build embutido.
  // code -3 (ABORTED) acontece em navegações canceladas — não é falha real.
  let usedFallback = false;
  win.webContents.on('did-fail-load', (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && !usedFallback && code !== -3) {
      usedFallback = true;
      win.loadFile(embeddedIndex());
    }
  });

  // Segurança: links externos abrem no navegador padrão; a navegação dentro da
  // janela fica restrita às origens confiáveis (+ file:// do fallback).
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    const ok = ALLOWED_ORIGINS.some((o) => url.startsWith(o)) || url.startsWith('file://');
    if (!ok) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });

  win.loadURL(REMOTE_URL);
  return win;
}

function setupUpdates() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.on('error', () => {
    /* silencioso no M0; a UI de update entra no M1 */
  });
  // Baixa em background e instala no próximo encerramento.
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  setupUpdates();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
