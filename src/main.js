/**
 * Bootstrap principal — Baluarte Mark XIII (ponto de entrada da SPA).
 *
 * Fluxo do boot(): monta o shell (sidebar + header + main) → liga o router ao
 * shell via event bus → inicializa tema/universo/toast/gateway oculto →
 * router.start() pinta a primeira tela.
 *
 * Para ADICIONAR uma rota, registre-a abaixo:
 *   router.register('/x', lazy(() => import('./pages/x.js'), 'xPage'));
 * O lazy() faz code-splitting: cada página vira um chunk próprio, baixado só
 * quando acessada. Lembre de também colocar a rota em sidebar.js (menu),
 * shell.js (título) e icons.js (ícone) — ver CONTRIBUTING.md.
 */

import { router } from './core/router.js';
import { bus } from './core/events.js';
import { appState } from './core/state.js';
import { aplicarPolitica } from './core/politica.js';
import { mountShell, renderPage, getShellRefs } from './layout/shell.js';
/* Home é eager (primeiro paint instantâneo). As demais páginas carregam sob
 * demanda via import() dinâmico — o Vite faz code-splitting automático, então
 * o bundle inicial fica pequeno e cada rota baixa só o seu próprio chunk. */
import { homePage } from './pages/home.js';
import { notFoundPage, loadErrorPage } from './pages/_placeholder.js';
import { initShadowGate } from './utils/shadow-gate.js';
import { hxBeacon } from './utils/hx-beacon.js';
import { initToast, toast } from './utils/toast.js';
import { initPaleta } from './utils/paleta.js';
import './styles/paleta.css';
import { initTheme } from './utils/theme.js';
import { initUniverse } from './utils/universe-theme.js';
import { playBootIntro } from './utils/boot-intro.js';
import { countPageView } from './utils/page-views.js';
import { handleAuthRedirect, isLoggedIn } from './core/supabase-auth.js';
import { $ } from './utils/helpers.js';
import { VERSION } from './data/version.js';
import { startJarvisMusicPresence } from './utils/jarvis-music-presence.ts';
import { resumeSpotifyAuthorization, describeSpotifyFailure } from './utils/jarvis-spotify-session.ts';

/* ==============================================================
 *  Helper de carregamento sob demanda (code-splitting via Vite).
 *  Cada rota só baixa o JS da sua página quando acessada. Se o import
 *  falhar (deploy novo trocou os hashes dos chunks, ou soluço de rede),
 *  recupera: 1 reload automático quando online (guarda anti-loop); senão
 *  propaga pro route:error, que mostra "falha ao carregar" (não um 404 falso).
 * ============================================================== */
const CHUNK_RELOAD_FLAG = 'baluarte:chunk-reload';

function isChunkLoadError(err) {
  const m = String((err && (err.message || err.name)) || err);
  return /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|NetworkError|Failed to fetch/i.test(m);
}

/* Recupera de falha de import (chunk velho pós-deploy): recarrega 1× quando
 * online; se já tentou ou está offline, relança pro route:error tratar. */
function recoverChunk(err) {
  let already = false;
  try { already = sessionStorage.getItem(CHUNK_RELOAD_FLAG) === '1'; } catch { /* sem storage */ }
  if (isChunkLoadError(err) && typeof navigator !== 'undefined' && navigator.onLine && !already) {
    try { sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1'); } catch { /* ok */ }
    location.reload();             // pega index.html + chunks frescos
    return new Promise(() => {});  // pendura até o reload (não renderiza nada)
  }
  throw err;                       // route:error mostra "falha ao carregar"
}

const lazy = (loader, fn) => (args) =>
  loader().then((m) => m[fn](args)).catch(recoverChunk);

/**
 * A volta do Spotify que não deu certo tem de dizer alguma coisa.
 *
 * Antes, todo modo de falha — recusa do Spotify, sessão perdida, código
 * rejeitado na troca — terminava num `catch` vazio: o distintivo continuava
 * `SPOTIFY · OFF` e não havia nada, nem no ecrã nem no console, que dissesse
 * porquê. O aviso mora no boot, e não na página, porque é no boot que a volta
 * aterra: a rota `/jarvis` pode nem estar montada nesse instante.
 */
function avisarFalhaSpotify(event) {
  const detail = event instanceof CustomEvent ? event.detail : null;
  if (!detail || detail.connected !== false || !detail.reason) return;
  const explicacao = describeSpotifyFailure(detail.reason);
  const doSpotify = typeof detail.reasonText === 'string' && detail.reasonText ? ` (Spotify: ${detail.reasonText})` : '';
  console.warn(`[spotify] ${detail.reason}${doSpotify}`);
  toast(`${explicacao}${doSpotify}`, { type: 'warning', duration: 12000 });
  /* O código da volta já foi gasto: deixá-lo no endereço faz um F5 tentar de
   * novo com um código morto, e falhar por um motivo diferente do original. */
  limparVoltaDoSpotify();
}

function limparVoltaDoSpotify() {
  try {
    const atual = new URL(window.location.href);
    if (!atual.searchParams.has('code') && !atual.searchParams.has('error')) return;
    window.history.replaceState(null, '', `${atual.pathname}${atual.hash}`);
  } catch { /* sem History API → o endereço fica como está */ }
}

function restoreSpotifyReturn(event) {
  const detail = event instanceof CustomEvent ? event.detail : null;
  if (!detail || detail.connected !== true || typeof detail.returnTo !== 'string') return;
  const hashIndex = detail.returnTo.indexOf('#');
  const route = hashIndex >= 0 ? detail.returnTo.slice(hashIndex + 1) : '';
  if (!/^\/[A-Za-z0-9_./?=&-]{0,240}$/.test(route)) return;
  setTimeout(() => {
    window.history.replaceState(null, '', window.location.pathname);
    router.navigate(route, { replace: true });
  }, 0);
}


/* Roda DENTRO do Baluarte Launcher? A ponte (`window.baluarte`) só existe no app;
 * usado pra gatear trabalho pesado pro nativo e manter o boot da web leve (#238). */
const isNative = () => typeof window !== 'undefined' && !!window.baluarte && window.baluarte.native === true;

/* Núcleo de IA (#231/#238): as rotas legadas da seção IA caem no cockpit do
 * Git Nexus na aba certa. No app abre a aba; na web o gate mostra o teaser
 * (a seção IA é app-only). Deep-link também via #/git-nexus?tab=<id>. */
const lazyNexus = (tab) => (args) =>
  import('./pages/git-nexus-gate.ts').then((m) => m.gitNexusGate({ ...args, tab })).catch(recoverChunk);

/* Rotas LEVES do Núcleo (L1 Conhecimento + L2 Memória, do `docs/OMEGA-PRISM.md`):
 * são leves e por-usuário (Supabase), então a regra #238 as coloca na WEB (a
 * "espinha" do Omega Prism, Fatia 1). Aqui renderizam a PÁGINA real no navegador
 * — diferente do resto da seção IA, que é pesado e fica app-only via `lazyNexus`.
 * No APP seguem caindo no cockpit unificado do Núcleo, na aba certa (sem regressão). */
const lazyLeve = (tab, loader, fn) => (args) =>
  (isNative()
    ? import('./pages/git-nexus-gate.ts').then((m) => m.gitNexusGate({ ...args, tab }))
    : loader().then((m) => m[fn](args))
  ).catch(recoverChunk);

/* Portão de conta: /home é a vitrine pública e /login é a própria porta —
 * o resto do site exige sessão. `reg()` substitui `router.register()` nas
 * rotas gateadas; sem sessão, mostra o aviso e manda pro /login ANTES de
 * chamar o handler real (nem baixa o chunk da rota bloqueada). */
const PUBLIC_ROUTES = new Set(['/home', '/home-3d', '/home2', '/login']);

function reg(pattern, handler, meta) {
  if (PUBLIC_ROUTES.has(pattern)) {
    router.register(pattern, handler, meta);
    return;
  }
  router.register(pattern, (args) => {
    if (isLoggedIn()) return handler(args);
    toast('Você precisa ter uma conta para prosseguir.', { type: 'warning', duration: 3200 });
    router.navigate('/login');
    return null;
  }, meta);
}

/* ==============================================================
 *  Rotas funcionais (Fase 1, 2, 3, 4)
 * ============================================================== */
reg('/home', (args) => homePage(args));   // eager: 1º paint (args → ?spline=), pública
reg('/baixar', lazy(() => import('./pages/baixar.ts'), 'baixarPage'));
reg('/ferramentas', lazy(() => import('./pages/ferramentas.ts'), 'ferramentasPage'));
reg('/editor', lazy(() => import('./pages/editor.ts'), 'editorPage'));
reg('/json-studio', lazy(() => import('./pages/json-studio.ts'), 'jsonStudioPage'));
reg('/qr-studio', lazy(() => import('./pages/qr-studio.ts'), 'qrStudioPage'));
reg('/git-helper', lazy(() => import('./pages/git-helper.ts'), 'gitHelperPage'));
reg('/terminal', lazy(() => import('./pages/terminal.ts'), 'terminalPage'));
reg('/calc-cientifica', lazy(() => import('./pages/calc-cientifica.ts'), 'calcCientificaPage'));
reg('/calc-numerica', lazy(() => import('./pages/calc-numerica.ts'), 'calcNumericaPage'));
reg('/calculadoras', lazy(() => import('./pages/calculadoras/index.ts'), 'calculadorasPage'));
reg('/tabela-verdade', lazy(() => import('./pages/tabela-verdade.ts'), 'tabelaVerdadePage'));
reg('/cripto', lazy(() => import('./pages/cripto/index.ts'), 'criptoPage'));
reg('/esteganografia', lazy(() => import('./pages/esteganografia.ts'), 'esteganografiaPage'));
reg('/graficos', lazy(() => import('./pages/graficos.ts'), 'graficosPage'));
reg('/simbolos', lazy(() => import('./pages/simbolos.ts'), 'simbolosPage'));
reg('/color-studio', lazy(() => import('./pages/color-studio.ts'), 'colorStudioPage'));
reg('/regex', lazy(() => import('./pages/regex.ts'), 'regexPage'));
reg('/arsenal', lazy(() => import('./pages/arsenal.ts'), 'arsenalPage'));
reg('/militar', lazy(() => import('./pages/militar.ts'), 'militarPage'));   // hub consolidado das frentes militares
reg('/modelos-3d', lazy(() => import('./pages/modelos-3d.ts'), 'modelos3dPage'));   // visualizador 3D militar (#310)
reg('/biblioteca', lazy(() => import('./pages/biblioteca.ts'), 'bibliotecaPage'));
reg('/elites', lazy(() => import('./pages/elites.ts'), 'elitesPage'));
reg('/dossie', lazy(() => import('./pages/dossie.ts'), 'dossiePage'));
reg('/ciberseg', lazy(() => import('./pages/ciberseg.ts'), 'cibersegPage'));
reg('/academia', lazy(() => import('./pages/academia.ts'), 'academiaPage'));
reg('/robotica', lazy(() => import('./pages/robotica.ts'), 'roboticaPage'));
reg('/fft', lazy(() => import('./pages/fft.ts'), 'fftPage'));
reg('/radio', lazy(() => import('./pages/radio.ts'), 'radioPage'));
reg('/musicas', lazy(() => import('./pages/musicas.ts'), 'musicasPage'));
reg('/media', lazy(() => import('./pages/media.ts'), 'mediaPage'));
reg('/videos', lazy(() => import('./pages/videos.ts'), 'videosPage'));
reg('/tv', lazy(() => import('./pages/tv.ts'), 'tvPage'));
reg('/utilidades', lazy(() => import('./pages/utilidades.ts'), 'utilidadesPage'));
reg('/jogos', lazy(() => import('./pages/jogos.ts'), 'jogosPage'));
reg('/batalha-naval', lazy(() => import('./pages/batalha-naval.ts'), 'batalhaNavalPage'));
reg('/universo', lazy(() => import('./pages/universo.ts'), 'universoPage'));
reg('/tabela-periodica', lazy(() => import('./pages/tabela-periodica.ts'), 'tabelaPeriodicaPage'));
reg('/modpack', lazy(() => import('./pages/modpack.ts'), 'modpackPage'));
reg('/wiki-arma3', lazy(() => import('./pages/wiki-arma3.ts'), 'wikiArma3Page'));   // wiki de Arma 3 (capa/índice/artigo via ?p= ?a=)
reg('/arma3-tutorial', lazy(() => import('./pages/arma3-tutorial.ts'), 'arma3TutorialPage'));   // tutorial dos 105 mods do preset
reg('/vanguard', lazy(() => import('./pages/vanguard.ts'), 'vanguardPage'));                     // Project Vanguard: computador de tiro + coordenadas
reg('/zomboid', lazy(() => import('./pages/zomboid.ts'), 'zomboidPage'));   // coleção Project Zomboid (Spartan Gamer BR)
reg('/zomboid-admin', lazy(() => import('./pages/zomboid-admin.ts'), 'zomboidAdminPage'));   // admin de servidor PZ
reg('/guia-pc', lazy(() => import('./pages/guia-pc.ts'), 'guiaPcPage'));
reg('/logic-sim', lazy(() => import('./pages/logic-sim.ts'), 'logicSimPage'));
reg('/portas', lazy(() => import('./pages/portas.ts'), 'portasPage'));
reg('/morse', lazy(() => import('./pages/morse.ts'), 'morsePage'));
reg('/memes', lazy(() => import('./pages/memes.ts'), 'memesPage'));
reg('/filmes', lazy(() => import('./pages/filmes.ts'), 'filmesPage'));
reg('/shadow', lazy(() => import('./pages/shadow.ts'), 'shadowPage'));
reg('/perfil', lazy(() => import('./pages/perfil.js'), 'perfilPage'));
reg('/conta', lazy(() => import('./pages/conta.js'), 'contaPage'));
reg('/login', lazy(() => import('./pages/login.js'), 'loginPage'), { fullscreen: true });
reg('/economia', lazy(() => import('./pages/economia.ts'), 'economiaPage'));
reg('/dolar', lazy(() => import('./pages/dolar.ts'), 'dolarPage'));
/* /jarvis obedece o #238 na prática: na WEB carrega só o Núcleo V7 (o 3D e as
 * funções dele no canto); no APP carrega o JARVIS completo — chat, sessões,
 * memória, skills e agente. São dois chunks distintos, então o navegador nem
 * baixa o motor de IA que não vai usar. O cockpit do Núcleo continua abrindo a
 * página completa na aba própria (git-nexus-cockpit), que é app-only. */
reg('/jarvis', (args) => (isNative()
  ? import('./pages/jarvis.ts').then((m) => m.jarvisPage(args))
  : import('./pages/jarvis-nucleo.ts').then((m) => m.jarvisNucleoPage(args))
).catch(recoverChunk));
reg('/ia-proprietaria', lazyNexus('ia'));
reg('/radar', lazy(() => import('./pages/radar.ts'), 'radarPage'));
reg('/geo', lazy(() => import('./pages/geopulse.ts'), 'geopulsePage'));
reg('/find', lazy(() => import('./pages/find.ts'), 'findPage'));
reg('/triangulacao', lazy(() => import('./pages/triangulacao.ts'), 'triangulacaoPage'));
reg('/llm-lab', lazyNexus('llm'));

reg('/sobre', lazy(() => import('./pages/sobre.ts'), 'sobrePage'));
reg('/roadmap', lazy(() => import('./pages/roadmap.ts'), 'roadmapPage'));
reg('/diagnostico', lazy(() => import('./pages/diagnostico.ts'), 'diagnosticoPage'));
reg('/jarvis-dashboard', lazyNexus('dashboard'));
reg('/mapa', lazy(() => import('./pages/mapa.ts'), 'mapaPage'));
reg('/visao', lazy(() => import('./pages/visao.ts'), 'visaoPage'));
reg('/jarvis-vision', lazyLeve('vision', () => import('./pages/jarvis-vision.ts'), 'jarvisVisionPage'));   // app → aba do Núcleo (#316)
reg('/forcas-armadas', lazy(() => import('./pages/forcas-armadas.ts'), 'forcasArmadasPage'));
reg('/orcamentos-militares', lazy(() => import('./pages/orcamentos-militares.ts'), 'orcamentosMilitaresPage'));
reg('/poder-militar', lazy(() => import('./pages/poder-militar.ts'), 'poderMilitarPage'));
reg('/arsenal-expandido', lazy(() => import('./pages/arsenal-expandido.ts'), 'arsenalExpandidoPage'));
reg('/forcas-especiais', lazy(() => import('./pages/forcas-especiais.ts'), 'forcasEspeciaisPage'));
reg('/organizacao-militar', lazy(() => import('./pages/organizacao-militar.ts'), 'organizacaoMilitarPage'));
reg('/tecnologia-militar', lazy(() => import('./pages/tecnologia-militar.ts'), 'tecnologiaMilitarPage'));
reg('/taticas-estrategias', lazy(() => import('./pages/taticas-estrategias.ts'), 'taticasEstrategiasPage'));
reg('/historia-militar', lazy(() => import('./pages/historia-militar.ts'), 'historiaMilitarPage'));
reg('/armas-por-pais', lazy(() => import('./pages/armas-por-pais.ts'), 'armasPorPaisPage'));
reg('/guerras-conflitos', lazy(() => import('./pages/guerras-conflitos.ts'), 'guerrasConflitosPage'));
reg('/batalhas-historicas', lazy(() => import('./pages/batalhas-historicas.ts'), 'batalhasHistoricasPage'));
reg('/enciclopedia-militar', lazy(() => import('./pages/enciclopedia-militar.ts'), 'enciclopediaMilitarPage'));
/* ==============================================================
 *  Dev & Projetos — auto-análise do próprio site
 * ============================================================== */
reg('/codigo', lazy(() => import('./pages/codigo.ts'), 'codigoPage'));
reg('/projetos', lazy(() => import('./pages/projetos.ts'), 'projetosPage'));
reg('/mural', lazy(() => import('./pages/mural.ts'), 'muralPage'));
reg('/comms', lazy(() => import('./pages/comms.ts'), 'commsPage'));   // Rede Neural — chat global em tempo real (0008)
reg('/banco', lazy(() => import('./pages/banco.ts'), 'bancoPage'));
reg('/cerebro', lazyLeve('cerebro', () => import('./pages/cerebro.ts'), 'cerebroPage'));
reg('/ocr', lazy(() => import('./pages/ocr.ts'), 'ocrPage'));
reg('/memoria', lazyLeve('memoria', () => import('./pages/memoria.ts'), 'memoriaPage'));
reg('/terminal-ia', lazyNexus('terminal'));
reg('/seguranca', lazyNexus('seguranca'));
reg('/gerar-codigo', lazyLeve('gerar', () => import('./pages/gerar-codigo.ts'), 'gerarCodigoPage'));   // app → aba do Núcleo (#316)
reg('/conselho', lazyNexus('conselho'));
reg('/apis', lazyNexus('apis'));
/* /git-nexus passa pelo GATE leve (#238 Fase 2): web → teaser; app → carrega a
 * experiência completa (git-nexus.js) sob demanda. Mantém o chunk pesado fora da web. */
reg('/git-nexus', lazy(() => import('./pages/git-nexus-gate.ts'), 'gitNexusGate'));
reg('/aprendizado', lazyNexus('ml'));
/* /home-3d e /home2 — aliases pra home oficial (links antigos / preview). */
router.register('/home-3d', (args) => homePage(args));
router.register('/home2', (args) => homePage(args));

/* ==============================================================
 *  Todas as rotas acima são reais (sem placeholders). Fallback 404:
 * ============================================================== */
router.setNotFound((path) => notFoundPage(path));

/* ==============================================================
 *  Wire router → shell
 * ============================================================== */
bus.on('route:change', ({ view, path, route }) => {
  if (view) {
    /* Rota "fullscreen" (hoje só /login): tela de portão, sem sidebar/header —
     * vem ANTES da experiência normal do site, não é mais um item do menu. */
    getShellRefs()?.shell.classList.toggle('shell--gate', !!route?.meta?.fullscreen);
    renderPage(view, path);
    /* carregou ok: zera a guarda de reload (cada deploy novo ganha 1 tentativa). */
    try { sessionStorage.removeItem(CHUNK_RELOAD_FLAG); } catch { /* sem storage */ }
  }
});

/* Métrica real: conta 1 view por rota (1x/rota/sessão) no banco (Supabase).
 * Silencioso e best-effort — não bloqueia o render nem quebra se o banco sumir. */
bus.on('route:change', ({ path }) => { countPageView(path); });

bus.on('route:notfound', ({ view, path }) => {
  if (view) renderPage(view, path);
});

bus.on('route:error', ({ path, error }) => {
  console.error('[main] erro ao carregar a rota:', { rota: path }, error);
  /* A rota EXISTE (senão era route:notfound); o que falhou foi o carregamento
   * do chunk. Mostra "falha ao carregar" (com Recarregar), não um 404 falso. */
  renderPage(loadErrorPage(path), path);
});

/* ==============================================================
 *  Inicialização
 * ============================================================== */
function boot() {
  const root = $('#app');
  if (!root) {
    console.error('[main] #app não encontrado no DOM.');
    return;
  }

  appState.set({ bootedAt: Date.now() });
  /* O canal de avisos vem primeiro de propósito: `toast()` só emite no bus, e
   * quem o mostra é o ouvinte que o `initToast()` regista. Enquanto ele estava
   * depois do shell, um aviso emitido no arranque — como o da volta do Spotify,
   * logo abaixo — era emitido para ninguém e desaparecia. */
  initToast();
  /* Presença musical passiva: observa apenas media elements deste app e sinais
   * explícitos dos embeds; não usa microfone, scraping cross-origin ou turnos de IA. */
  startJarvisMusicPresence();
  window.addEventListener('baluarte:spotify-session', restoreSpotifyReturn);
  window.addEventListener('baluarte:spotify-session', avisarFalhaSpotify);
  void resumeSpotifyAuthorization().then((result) => {
    if (result === 'rejected') console.warn('[spotify] autorização não concluída — ver o aviso na tela');
  }).catch((erro) => { console.error('[spotify] falha inesperada ao retomar a autorização', erro); });
  /* Perf mobile/low-end (v0.4.0): detecta aparelho fraco → classe `is-lowfx` no
   * <html> (CSS alivia o grão) + `window.__baluarteLowFx` (o herói WebGL corta
   * partículas). Reduced-motion também entra como low-fx. */
  try {
    const dm = navigator.deviceMemory || 8;
    const hc = navigator.hardwareConcurrency || 8;
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowfx = reduced || dm <= 2 || hc <= 2 || (coarse && innerWidth <= 820);
    if (lowfx) document.documentElement.classList.add('is-lowfx');
    window.__baluarteLowFx = !!lowfx;
  } catch { /* sem as APIs → assume normal */ }

  /* Política (#420) — declara permissões, esquemas de storage e flags ANTES de
   * qualquer página existir. A ordem é o ponto: uma página que consulta flag ou
   * permissão antes disso receberia `false` (deny-by-default) e se desenharia
   * errada. Por isso vem no topo do boot, antes do shell e do router. */
  aplicarPolitica({
    ambiente: isNative() ? 'app' : 'web',
    search: typeof location !== 'undefined' ? location.search : ''
  });

  initTheme();
  initUniverse();
  /* Entrada "cascata cybertroniana" — perf (v0.4.0): SÓ na 1ª carga da sessão
   * (recarregar/voltar não repete) e mais curta no celular. */
  try {
    if (!sessionStorage.getItem('baluarte:booted')) {
      sessionStorage.setItem('baluarte:booted', '1');
      const mobile = typeof matchMedia !== 'undefined' && matchMedia('(max-width: 640px), (pointer: coarse)').matches;
      playBootIntro({ duration: mobile ? 3800 : 6500 });
    }
  } catch { playBootIntro(); }

  mountShell(root);
  /* Ctrl/⌘+K acha qualquer uma das rotas registradas. Vai DEPOIS do
   * router.register de todas elas (o índice sai do próprio router), e antes do
   * start só pra o atalho já valer no primeiro paint. */
  initPaleta();
  initShadowGate();
  /* Se o usuário voltou de um login OAuth (tokens no #fragmento), captura a
   * sessão e limpa o hash ANTES do router interpretar a URL. No-op normalmente. */
  handleAuthRedirect();
  router.start('/home');
  setTimeout(() => hxBeacon(), 2000);
  /* Pré-aquece a memória versionada do repositório (best-effort) — mas só no APP
   * (#238 Fase 2): puxar o jarvis-brain arrasta o codemap/cerebro pro boot, e o
   * site deve ser leve. Na web, /memoria e /cerebro (leves, Fatia 1) puxam o
   * jarvis-brain sob demanda quando abertas; aqui ficamos fora do caminho de boot. */
  if (isNative()) {
    setTimeout(() => { import('./utils/jarvis-brain.js').then((m) => m.syncRepoMemories()).catch(() => {}); }, 1500);
  }

  /* Nexus Central (0010): telemetria multi-site (page_views + tempo de tela)
   * via RPC gateada por ingest_key — lazy e best-effort, fora do boot crítico. */
  setTimeout(() => { import('./utils/nexus.js').then((m) => m.initNexusTelemetry()).catch(() => {}); }, 3000);

  console.log(
    `%c⬡ BALUARTE — Mark XIII · v${VERSION}`,
    'color: #d4a24e; font-weight: bold; font-family: monospace; font-size: 14px;'
  );
  console.log(
    `%c${router.count()} rotas ativas · JS puro + Vite 5`,
    'color: #93a4bf; font-family: monospace;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* ==============================================================
 *  Service Worker — cache do site (stale-while-revalidate).
 *  0.7.3: quando um SW NOVO assume o controle (release nova), a aba
 *  recarrega UMA vez pra sair do bundle velho — era assim que máquinas
 *  presas no cache da v0.5.0 continuavam vendo o site antigo.
 * ============================================================== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[sw] registro falhou (esperado em dev):', err));
  });
  // se a página JÁ nasceu controlada, um controllerchange = release nova
  // (primeiro acesso dispara o evento pelo clients.claim() — esse não conta)
  const jaControlada = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!jaControlada || window.__swRecarregou) return;
    window.__swRecarregou = true;
    if (sessionStorage.getItem('sw:recarregou') === '1') return;
    sessionStorage.setItem('sw:recarregou', '1');
    location.reload();
  });
}
