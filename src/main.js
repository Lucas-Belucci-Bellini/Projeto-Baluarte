/**
 * Bootstrap principal — Baluarte Mark XIII (ponto de entrada da SPA).
 *
 * Fluxo do boot(): monta o shell (sidebar + header + main) → liga o router ao
 * shell via event bus → inicializa tema/universo/toast/gateway oculto →
 * router.start() pinta a primeira tela.
 *
 * Para ADICIONAR uma rota, registre-a abaixo:
 *   reg('/x', lazy(() => import('./pages/x.js'), 'xPage'));
 * O lazy() faz code-splitting: cada página vira um chunk próprio, baixado só
 * quando acessada. Lembre de também colocar a rota em sidebar.js (menu),
 * shell.js (título) e icons.js (ícone) — ver CONTRIBUTING.md.
 *
 * `reg()` é `router.register()` + portão de conta: toda rota exige sessão,
 * exceto as de PUBLIC_ROUTES (/home e /login). Sem sessão, o aviso dispara e
 * a navegação vai pro /login antes do handler real (e o chunk dele) rodar —
 * use `router.register()` direto só pra uma rota que deva ficar pública.
 */

import { router } from './core/router.js';
import { bus } from './core/events.js';
import { appState } from './core/state.js';
import { aplicarPolitica } from './core/politica.js';
import { mountShell, renderPage } from './layout/shell.js';
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

/* Roda DENTRO do Baluarte Launcher? A ponte (`window.baluarte`) só existe no app;
 * usado pra gatear trabalho pesado pro nativo e manter o boot da web leve (#238). */
const isNative = () => typeof window !== 'undefined' && !!window.baluarte && window.baluarte.native === true;

/* Núcleo de IA (#231/#238): as rotas legadas da seção IA caem no cockpit do
 * Git Nexus na aba certa. No app abre a aba; na web o gate mostra o teaser
 * (a seção IA é app-only). Deep-link também via #/git-nexus?tab=<id>. */
const lazyNexus = (tab) => (args) =>
  import('./pages/git-nexus-gate.js').then((m) => m.gitNexusGate({ ...args, tab })).catch(recoverChunk);

/* Rotas LEVES do Núcleo (L1 Conhecimento + L2 Memória, do `docs/OMEGA-PRISM.md`):
 * são leves e por-usuário (Supabase), então a regra #238 as coloca na WEB (a
 * "espinha" do Omega Prism, Fatia 1). Aqui renderizam a PÁGINA real no navegador
 * — diferente do resto da seção IA, que é pesado e fica app-only via `lazyNexus`.
 * No APP seguem caindo no cockpit unificado do Núcleo, na aba certa (sem regressão). */
const lazyLeve = (tab, loader, fn) => (args) =>
  (isNative()
    ? import('./pages/git-nexus-gate.js').then((m) => m.gitNexusGate({ ...args, tab }))
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
reg('/baixar', lazy(() => import('./pages/baixar.js'), 'baixarPage'));
reg('/ferramentas', lazy(() => import('./pages/ferramentas.js'), 'ferramentasPage'));
reg('/editor', lazy(() => import('./pages/editor.js'), 'editorPage'));
reg('/json-studio', lazy(() => import('./pages/json-studio.js'), 'jsonStudioPage'));
reg('/qr-studio', lazy(() => import('./pages/qr-studio.js'), 'qrStudioPage'));
reg('/git-helper', lazy(() => import('./pages/git-helper.js'), 'gitHelperPage'));
reg('/terminal', lazy(() => import('./pages/terminal.js'), 'terminalPage'));
reg('/calc-cientifica', lazy(() => import('./pages/calc-cientifica.js'), 'calcCientificaPage'));
reg('/calc-numerica', lazy(() => import('./pages/calc-numerica.js'), 'calcNumericaPage'));
reg('/calculadoras', lazy(() => import('./pages/calculadoras/index.js'), 'calculadorasPage'));
reg('/tabela-verdade', lazy(() => import('./pages/tabela-verdade.js'), 'tabelaVerdadePage'));
reg('/cripto', lazy(() => import('./pages/cripto/index.js'), 'criptoPage'));
reg('/esteganografia', lazy(() => import('./pages/esteganografia.js'), 'esteganografiaPage'));
reg('/graficos', lazy(() => import('./pages/graficos.js'), 'graficosPage'));
reg('/simbolos', lazy(() => import('./pages/simbolos.js'), 'simbolosPage'));
reg('/color-studio', lazy(() => import('./pages/color-studio.js'), 'colorStudioPage'));
reg('/regex', lazy(() => import('./pages/regex.js'), 'regexPage'));
reg('/arsenal', lazy(() => import('./pages/arsenal.js'), 'arsenalPage'));
reg('/militar', lazy(() => import('./pages/militar.js'), 'militarPage'));   // hub consolidado das frentes militares
reg('/modelos-3d', lazy(() => import('./pages/modelos-3d.js'), 'modelos3dPage'));   // visualizador 3D militar (#310)
reg('/biblioteca', lazy(() => import('./pages/biblioteca.js'), 'bibliotecaPage'));
reg('/elites', lazy(() => import('./pages/elites.js'), 'elitesPage'));
reg('/dossie', lazy(() => import('./pages/dossie.js'), 'dossiePage'));
reg('/ciberseg', lazy(() => import('./pages/ciberseg.js'), 'cibersegPage'));
reg('/academia', lazy(() => import('./pages/academia.js'), 'academiaPage'));
reg('/robotica', lazy(() => import('./pages/robotica.js'), 'roboticaPage'));
reg('/fft', lazy(() => import('./pages/fft.js'), 'fftPage'));
reg('/radio', lazy(() => import('./pages/radio.js'), 'radioPage'));
reg('/musicas', lazy(() => import('./pages/musicas.js'), 'musicasPage'));
reg('/media', lazy(() => import('./pages/media.js'), 'mediaPage'));
reg('/videos', lazy(() => import('./pages/videos.js'), 'videosPage'));
reg('/tv', lazy(() => import('./pages/tv.js'), 'tvPage'));
reg('/utilidades', lazy(() => import('./pages/utilidades.js'), 'utilidadesPage'));
reg('/jogos', lazy(() => import('./pages/jogos.js'), 'jogosPage'));
reg('/batalha-naval', lazy(() => import('./pages/batalha-naval.js'), 'batalhaNavalPage'));
reg('/universo', lazy(() => import('./pages/universo.js'), 'universoPage'));
reg('/tabela-periodica', lazy(() => import('./pages/tabela-periodica.js'), 'tabelaPeriodicaPage'));
reg('/modpack', lazy(() => import('./pages/modpack.js'), 'modpackPage'));
reg('/wiki-arma3', lazy(() => import('./pages/wiki-arma3.js'), 'wikiArma3Page'));   // wiki de Arma 3 (capa/índice/artigo via ?p= ?a=)
reg('/arma3-tutorial', lazy(() => import('./pages/arma3-tutorial.js'), 'arma3TutorialPage'));   // tutorial dos 105 mods do preset
reg('/vanguard', lazy(() => import('./pages/vanguard.js'), 'vanguardPage'));                     // Project Vanguard: computador de tiro + coordenadas
reg('/zomboid', lazy(() => import('./pages/zomboid.js'), 'zomboidPage'));   // coleção Project Zomboid (Spartan Gamer BR)
reg('/zomboid-admin', lazy(() => import('./pages/zomboid-admin.js'), 'zomboidAdminPage'));   // admin de servidor PZ
reg('/guia-pc', lazy(() => import('./pages/guia-pc.js'), 'guiaPcPage'));
reg('/logic-sim', lazy(() => import('./pages/logic-sim.js'), 'logicSimPage'));
reg('/portas', lazy(() => import('./pages/portas.js'), 'portasPage'));
reg('/morse', lazy(() => import('./pages/morse.js'), 'morsePage'));
reg('/memes', lazy(() => import('./pages/memes.js'), 'memesPage'));
reg('/filmes', lazy(() => import('./pages/filmes.js'), 'filmesPage'));
reg('/shadow', lazy(() => import('./pages/shadow.js'), 'shadowPage'));
reg('/perfil', lazy(() => import('./pages/perfil.js'), 'perfilPage'));
reg('/login', lazy(() => import('./pages/login.js'), 'loginPage'));
reg('/economia', lazy(() => import('./pages/economia.js'), 'economiaPage'));
reg('/dolar', lazy(() => import('./pages/dolar.js'), 'dolarPage'));
reg('/jarvis', lazyNexus('jarvis'));
reg('/ia-proprietaria', lazyNexus('ia'));
reg('/radar', lazy(() => import('./pages/radar.js'), 'radarPage'));
reg('/geo', lazy(() => import('./pages/geopulse.js'), 'geopulsePage'));
reg('/find', lazy(() => import('./pages/find.js'), 'findPage'));
reg('/triangulacao', lazy(() => import('./pages/triangulacao.js'), 'triangulacaoPage'));
reg('/llm-lab', lazyNexus('llm'));

reg('/sobre', lazy(() => import('./pages/sobre.js'), 'sobrePage'));
reg('/roadmap', lazy(() => import('./pages/roadmap.js'), 'roadmapPage'));
reg('/diagnostico', lazy(() => import('./pages/diagnostico.js'), 'diagnosticoPage'));
reg('/jarvis-dashboard', lazyNexus('dashboard'));
reg('/mapa', lazy(() => import('./pages/mapa.js'), 'mapaPage'));
reg('/visao', lazy(() => import('./pages/visao.js'), 'visaoPage'));
reg('/jarvis-vision', lazyLeve('vision', () => import('./pages/jarvis-vision.js'), 'jarvisVisionPage'));   // app → aba do Núcleo (#316)
reg('/forcas-armadas', lazy(() => import('./pages/forcas-armadas.js'), 'forcasArmadasPage'));
reg('/orcamentos-militares', lazy(() => import('./pages/orcamentos-militares.js'), 'orcamentosMilitaresPage'));
reg('/poder-militar', lazy(() => import('./pages/poder-militar.js'), 'poderMilitarPage'));
reg('/arsenal-expandido', lazy(() => import('./pages/arsenal-expandido.js'), 'arsenalExpandidoPage'));
reg('/forcas-especiais', lazy(() => import('./pages/forcas-especiais.js'), 'forcasEspeciaisPage'));
reg('/organizacao-militar', lazy(() => import('./pages/organizacao-militar.js'), 'organizacaoMilitarPage'));
reg('/tecnologia-militar', lazy(() => import('./pages/tecnologia-militar.js'), 'tecnologiaMilitarPage'));
reg('/taticas-estrategias', lazy(() => import('./pages/taticas-estrategias.js'), 'taticasEstrategiasPage'));
reg('/historia-militar', lazy(() => import('./pages/historia-militar.js'), 'historiaMilitarPage'));
reg('/armas-por-pais', lazy(() => import('./pages/armas-por-pais.js'), 'armasPorPaisPage'));
reg('/guerras-conflitos', lazy(() => import('./pages/guerras-conflitos.js'), 'guerrasConflitosPage'));
reg('/batalhas-historicas', lazy(() => import('./pages/batalhas-historicas.js'), 'batalhasHistoricasPage'));
reg('/enciclopedia-militar', lazy(() => import('./pages/enciclopedia-militar.js'), 'enciclopediaMilitarPage'));

/* ==============================================================
 *  Dev & Projetos — auto-análise do próprio site
 * ============================================================== */
reg('/codigo', lazy(() => import('./pages/codigo.js'), 'codigoPage'));
reg('/projetos', lazy(() => import('./pages/projetos.js'), 'projetosPage'));
reg('/mural', lazy(() => import('./pages/mural.js'), 'muralPage'));
reg('/comms', lazy(() => import('./pages/comms.js'), 'commsPage'));   // Rede Neural — chat global em tempo real (0008)
reg('/banco', lazy(() => import('./pages/banco.js'), 'bancoPage'));
reg('/cerebro', lazyLeve('cerebro', () => import('./pages/cerebro.js'), 'cerebroPage'));
reg('/ocr', lazy(() => import('./pages/ocr.js'), 'ocrPage'));
reg('/memoria', lazyLeve('memoria', () => import('./pages/memoria.js'), 'memoriaPage'));
reg('/terminal-ia', lazyNexus('terminal'));
reg('/seguranca', lazyNexus('seguranca'));
reg('/gerar-codigo', lazyLeve('gerar', () => import('./pages/gerar-codigo.js'), 'gerarCodigoPage'));   // app → aba do Núcleo (#316)
reg('/conselho', lazyNexus('conselho'));
reg('/apis', lazyNexus('apis'));
/* /git-nexus passa pelo GATE leve (#238 Fase 2): web → teaser; app → carrega a
 * experiência completa (git-nexus.js) sob demanda. Mantém o chunk pesado fora da web. */
reg('/git-nexus', lazy(() => import('./pages/git-nexus-gate.js'), 'gitNexusGate'));
reg('/aprendizado', lazyNexus('ml'));
/* /home-3d e /home2 — aliases pra home oficial (links antigos / preview). */
reg('/home-3d', (args) => homePage(args));
reg('/home2', (args) => homePage(args));

/* ==============================================================
 *  Todas as rotas acima são reais (sem placeholders). Fallback 404:
 * ============================================================== */
router.setNotFound((path) => notFoundPage(path));

/* ==============================================================
 *  Wire router → shell
 * ============================================================== */
bus.on('route:change', ({ view, path }) => {
  if (view) {
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
  initToast();
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
