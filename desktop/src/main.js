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
const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain, session, systemPreferences, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { registerIpc } = require('./ipc');
const nexus = require('./nexus');

/* WebGPU pro WebLLM (fallback do Hermes): em máquinas/plataformas onde o
 * Chromium desliga o WebGPU por padrão (Linux, GPUs bloqueadas), o modo
 * navegador do Hermes morre sem isso. Onde já é suportado, é no-op. */
app.commandLine.appendSwitch('enable-unsafe-webgpu');

/* Visor 3D dentro do app (0.7.3): em GPU da blocklist o Chromium 126 desliga
 * o WebGL SEM fallback de software — o visor morre com "WebGL desativado"
 * mesmo com o site certo no ar. ignore-gpu-blocklist tenta a GPU real;
 * enable-unsafe-swiftshader garante o render por software quando nem isso dá
 * (aceitável aqui: a janela só carrega as origens confiáveis do launcher). */
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

/* Login Google no APP (pedido do operador: "só a web conseguia conectar"):
 * o Google recusa OAuth em navegador embutido quando o User-Agent entrega
 * o Electron ("este navegador ou app pode não ser seguro"). O Chromium por
 * baixo é o mesmo do Chrome — só limpamos os tokens delatores do UA. */
app.userAgentFallback = app.userAgentFallback
  .replace(/ baluarte-launcher\/[^ ]+/i, '')
  .replace(/ Electron\/[^ ]+/, '');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch {
  /* ausente em dev cru — segue sem auto-update */
}

/* ⚠️ O launcher é uma CASCA em volta do site ao vivo — ele não embute conteúdo,
 * carrega esta URL. Isso significa que existem DOIS canais de atualização, e
 * desligar o auto-update do instalador só fecha um deles: se a V2 subir no mesmo
 * endereço, o app "congelado na 1.0.0" passa a mostrar a V2 sem instalar nada, e
 * o congelamento vira enfeite.
 *
 * ⛔ ESTA URL NÃO PODE MUDAR SEM PLANO DE MIGRAÇÃO. Leia antes de editar.
 *
 * A 1.0.0 chegou a apontar para `v1.projeto-baluarte.vercel.app` — e isso era um
 * apagador de dados silencioso. `localStorage` é escopado por ORIGEM, e
 * `projeto-baluarte.vercel.app` e `v1.projeto-baluarte.vercel.app` são origens
 * diferentes. Todo mundo que já usa o app (0.9.2 aponta para o endereço
 * principal) atualizaria para a 1.0.0 e encontraria as 71 chaves vazias: abas do
 * editor, conversas e memórias do JARVIS, histórico do terminal e o cofre de
 * chaves de API do `apis:vault`. Sem erro, sem aviso, sem desfazer — pareceria
 * que o app apagou tudo. Era o pior modo de falha possível numa versão que se
 * chama "ponto de congelamento".
 *
 * O pin continua sendo necessário, mas quem se muda tem que ser a V2, não a V1:
 * a V1 fica onde o dado dos operadores JÁ está, e a V2 nasce em endereço próprio
 * (ADR-003). Mover a V1 exigiria uma ponte entre origens (iframe + postMessage)
 * ou exportar/importar, e nenhum dos dois vale o risco numa versão que congela.
 *
 * `BALUARTE_URL` existe para o aceite local: dá pra apontar o app para um deploy
 * de teste sem editar código. */
const REMOTE_URL = process.env.BALUARTE_URL || 'https://projeto-baluarte.vercel.app/';
const ALLOWED_ORIGINS = [
  'https://projeto-baluarte.vercel.app',
  /* O alias `v1.` segue permitido — se um dia ele existir e o app for movido
   * PARA lá, será com migração planejada, e recusar a origem faria o app não
   * abrir justamente no momento do teste. */
  'https://v1.projeto-baluarte.vercel.app'
];

/* A outra metade do login Google no app: o fluxo OAuth NAVEGA pra fora do
 * site (supabase.co/auth → accounts.google.com → de volta ao site) e o
 * will-navigate jogava esse trajeto pro navegador EXTERNO — a sessão nascia
 * lá e o app ficava deslogado. Estas origens de autenticação (e só elas)
 * podem navegar DENTRO da janela; qualquer outro link segue indo pro
 * navegador de verdade. */
const AUTH_ORIGINS = [
  'https://hcwzsxdcvmswebunznak.supabase.co',
  'https://accounts.google.com',
  'https://accounts.youtube.com'   // o Google às vezes pinga aqui no meio do login
];

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
    const ok = ALLOWED_ORIGINS.some((o) => url.startsWith(o))
      || AUTH_ORIGINS.some((o) => url.startsWith(o))   // OAuth (Google/Supabase) fica NA janela
      || url.startsWith('file://');
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

/* ⚠️ A 1.0.0 é a ÚLTIMA versão que o app instala sozinho (ADR-003).
 *
 * Daqui em diante o operador **decide** se instala. O motivo não é capricho: o
 * que vem depois da 1.0.0 é a V2 — código novo, arquitetura nova — e empurrar
 * isso por auto-update para quem estava usando uma versão estável é trocar o
 * chão de alguém sem perguntar. Quem quiser a V2 instala por conta e risco;
 * quem não quiser fica na 1.0.0, que é justamente a linha-base que o ADR-001
 * existe para preservar.
 *
 * `autoDownload = false`: o app ainda AVISA que existe versão nova, mas só baixa
 * se mandarem. Avisar é serviço; baixar sozinho é decidir pelo outro. */
function setupUpdates() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.on('error', () => {
    /* silencioso por enquanto; UI de update no M1+ */
  });

  /* Versão nova disponível → pergunta ANTES de baixar. */
  autoUpdater.on('update-available', (info) => {
    const win = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    dialog.showMessageBox(win, {
      type: 'question',
      title: 'Existe uma versão nova',
      message: `Baluarte ${info && info.version ? info.version : 'novo'} está disponível.`,
      detail:
        'A 1.0.0 é a última versão que o Baluarte instalava sozinho. O que vem ' +
        'depois dela é código novo (V2) — baixar é por sua conta e risco.\n\n' +
        'Se preferir ficar onde está, é só recusar: a 1.0.0 continua funcionando ' +
        'e você pode instalar depois, quando quiser.',
      buttons: ['Baixar agora', 'Agora não'],
      defaultId: 1,        // o padrão é NÃO mexer no que funciona
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate().catch(() => {});
    }).catch(() => { /* best-effort */ });
  });
  /* A ARMADILHA DA BANDEJA: fechar a janela só esconde (o app segue vivo) e o
   * update baixado só instala no quit — que nunca vinha. Agora, quando o
   * download termina, o operador ganha o botão "Reiniciar agora". */
  autoUpdater.on('update-downloaded', (info) => {
    const win = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    if (win && !win.isVisible()) win.show();
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Atualização pronta',
      message: `Baluarte Launcher ${info && info.version ? info.version : 'novo'} baixado.`,
      detail: 'Reiniciar agora pra aplicar? (Fechar a janela NÃO aplica — o app vive na bandeja.)',
      buttons: ['Reiniciar agora', 'Depois (aplica no Sair)'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) { isQuitting = true; autoUpdater.quitAndInstall(); }
    }).catch(() => { /* best-effort */ });
  });
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  /* re-checa a cada 2h — o app vive dias na bandeja sem reiniciar */
  setInterval(() => { autoUpdater.checkForUpdates().catch(() => {}); }, 2 * 60 * 60 * 1000);
}

/* ===================== ciclo de vida / instância única ===================== */

// Antes de sair de verdade, marca a flag pra o handler de 'close' não esconder
// a janela (senão Cmd+Q / shutdown ficariam presos na bandeja).
app.on('before-quit', () => {
  isQuitting = true;
  nexus.stop(); // encerra o motor se a gente tiver subido
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

    /* P0 (#338): Corpo Total — o `getUserMedia` da página só funciona se o
     * MAIN autorizar a permissão de mídia; sem handler o Electron NEGA em
     * silêncio (por isso a câmera "não era reconhecida" no app). Allowlist:
     * só `media` (câmera/microfone) e só pra origem confiável do site. */
    const isTrustedMediaOrigin = (u) => {
      try { return ALLOWED_ORIGINS.includes(new URL(u).origin); } catch { return false; }
    };
    session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => {
      const from = (details && details.requestingUrl) || (wc && wc.getURL()) || '';
      const ok = permission === 'media' && isTrustedMediaOrigin(from);
      if (ok && process.platform === 'darwin' && systemPreferences.askForMediaAccess) {
        // macOS: dispara o prompt do SISTEMA (exige NSCameraUsageDescription no Info.plist)
        systemPreferences.askForMediaAccess('camera').catch(() => {});
      }
      callback(ok);
    });
    session.defaultSession.setPermissionCheckHandler((wc, permission, origin) =>
      permission === 'media' && isTrustedMediaOrigin(origin));

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
    nexus.maybeStart(); // M3c: sobe o motor por padrão (override→vendored→global→npx); BALUARTE_NEXUS_DISABLE desliga

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
