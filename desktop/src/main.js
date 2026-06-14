// Baluarte Launcher — processo principal.
//
//   M0: carrega a PRODUÇÃO (mesma UI Vite) com fallback offline + auto-update.
//   M1 (este): casca de launcher —
//     • splash de abertura enquanto o hub carrega;
//     • system tray (fechar minimiza pra bandeja, estilo launcher);
//     • deep-link `baluarte://<rota>` com instância única;
//     • indicador de conexão (online/offline) na bandeja e no título.
//
// Segurança (a UI vem da web, logo o renderer é "não confiável"):
// contextIsolation ligado, sem nodeIntegration, sandbox, e navegação/links
// presos às origens confiáveis. A ponte nativa real (nexus.*, fs.*) entra no M2.
const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { registerIpc } = require('./ipc');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch {
  /* ausente em dev cru — segue sem auto-update */
}

const REMOTE_URL = 'https://projeto-baluarte.vercel.app/';
const ALLOWED_ORIGINS = ['https://projeto-baluarte.vercel.app'];

let mainWindow = null;
let splashWindow = null;
let tray = null;
let online = true;
let isQuitting = false;

/* ===================== carregamento / fallback ===================== */

/** Caminho do index embutido usado como fallback offline. */
function embeddedIndex() {
  const packaged = path.join(process.resourcesPath, 'web', 'index.html');
  if (app.isPackaged && fs.existsSync(packaged)) return packaged;
  const sibling = path.join(__dirname, '..', '..', 'dist', 'index.html');
  if (fs.existsSync(sibling)) return sibling;
  return path.join(__dirname, 'offline.html');
}

/* ============================= janelas ============================= */

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 440,
    height: 320,
    frame: false,
    resizable: false,
    movable: false,
    center: true,
    backgroundColor: '#06080d',
    alwaysOnTop: true,
    skipTaskbar: true,
    show: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function closeSplash() {
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
  splashWindow = null;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
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

  // Revela a janela e fecha a splash — guardado contra duplo-disparo/destruição.
  const reveal = () => {
    closeSplash();
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) mainWindow.show();
  };
  mainWindow.once('ready-to-show', reveal);
  mainWindow.webContents.once('did-finish-load', reveal);
  setTimeout(reveal, 12000); // trava de segurança: nunca deixa a splash presa

  // Fallback: se a web falhar (offline), cai no build embutido. code -3 = ABORTED.
  let usedFallback = false;
  mainWindow.webContents.on('did-fail-load', (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && !usedFallback && code !== -3) {
      usedFallback = true;
      mainWindow.loadFile(embeddedIndex());
    }
  });

  // Segurança: links externos abrem no navegador; navegação presa às origens OK.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const ok = ALLOWED_ORIGINS.some((o) => url.startsWith(o)) || url.startsWith('file://');
    if (!ok) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });

  // Fechar = esconder pra bandeja (estilo launcher); só sai de fato no "Sair".
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadURL(REMOTE_URL);
}

function showWindow() {
  if (!mainWindow) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) mainWindow.show();
  mainWindow.focus();
}

function toggleWindow() {
  if (mainWindow && mainWindow.isVisible()) mainWindow.hide();
  else showWindow();
}

/* ============================= bandeja ============================= */

function trayImage() {
  const img = nativeImage.createFromPath(path.join(__dirname, '..', 'build', 'icon.png'));
  return img.isEmpty() ? img : img.resize({ width: 18, height: 18 });
}

function rebuildTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: online ? '● Conectado ao hub' : '○ Offline (modo local)', enabled: false },
      { type: 'separator' },
      { label: 'Mostrar Baluarte', click: showWindow },
      { label: 'Recarregar', click: () => mainWindow && mainWindow.loadURL(REMOTE_URL) },
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ])
  );
  tray.setToolTip(online ? 'Baluarte Launcher — online' : 'Baluarte Launcher — offline');
}

function setupTray() {
  tray = new Tray(trayImage());
  tray.on('click', toggleWindow);
  rebuildTrayMenu();
}

/* ============================= conexão ============================= */

function setOnline(v) {
  if (online === v) return;
  online = v;
  rebuildTrayMenu();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setTitle(online ? 'Baluarte Launcher' : 'Baluarte Launcher — offline');
  }
}
// O preload reporta navigator.onLine do renderer.
ipcMain.on('baluarte:net', (_e, v) => setOnline(!!v));

/* ========================= deep link baluarte:// ========================= */

/** baluarte://git-nexus → 'git-nexus' (sanitizado pra não injetar na URL). */
function routeFromDeepLink(url) {
  const m = /^baluarte:\/\/([^?#]*)/i.exec(String(url).trim());
  if (!m) return null;
  return m[1].replace(/[^a-z0-9\-/_]/gi, '').replace(/^\/+/, '');
}

function handleDeepLink(url) {
  const route = routeFromDeepLink(url);
  showWindow();
  if (route && mainWindow) mainWindow.loadURL(REMOTE_URL + '#/' + route);
}

function deepLinkFromArgv(argv) {
  return (argv || []).find((a) => typeof a === 'string' && a.startsWith('baluarte://')) || null;
}

/* ============================ auto-update ============================ */

function setupUpdates() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.on('error', () => {
    /* silencioso por enquanto; UI de update no M1+ */
  });
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
}

/* ===================== ciclo de vida / instância única ===================== */

// Antes de sair de verdade, marca a flag pra o handler de 'close' não esconder
// a janela (senão Cmd+Q / shutdown ficariam presos na bandeja).
app.on('before-quit', () => {
  isQuitting = true;
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // 2ª instância (Windows/Linux): o deep link chega no argv.
  app.on('second-instance', (_e, argv) => {
    const url = deepLinkFromArgv(argv);
    if (url) handleDeepLink(url);
    else showWindow();
  });

  // macOS: deep link via evento.
  app.on('open-url', (e, url) => {
    e.preventDefault();
    handleDeepLink(url);
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);

    // Registra o app como handler do protocolo baluarte://
    if (process.defaultApp && process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('baluarte', process.execPath, [path.resolve(process.argv[1])]);
    } else {
      app.setAsDefaultProtocolClient('baluarte');
    }

    createSplash();
    createMainWindow();
    setupTray();
    setupUpdates();

    // Ponte IPC allowlisted (M2): o renderer fala com o nativo só por aqui.
    registerIpc({
      getMainWindow: () => mainWindow,
      getOnline: () => online,
      remoteUrl: REMOTE_URL
    });

    // Deep link no lançamento inicial (Windows/Linux trazem no argv).
    const initial = deepLinkFromArgv(process.argv);
    if (initial) handleDeepLink(initial);

    app.on('activate', () => {
      if (!mainWindow) createMainWindow();
      else showWindow();
    });
  });
}

app.on('window-all-closed', () => {
  // Com a bandeja, a janela some mas o app segue vivo; só encerra de fato no "Sair".
  if (process.platform !== 'darwin' && isQuitting) app.quit();
});
