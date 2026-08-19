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
import { mountShell, renderPage } from './layout/shell.js';
/* Home é eager (primeiro paint instantâneo). As demais páginas carregam sob
 * demanda via import() dinâmico — o Vite faz code-splitting automático, então
 * o bundle inicial fica pequeno e cada rota baixa só o seu próprio chunk. */
import { homePage } from './pages/home.js';
import { notFoundPage, loadErrorPage } from './pages/_placeholder.js';
import { initShadowGate } from './utils/shadow-gate.js';
import { hxBeacon } from './utils/hx-beacon.js';
import { initToast } from './utils/toast.js';
import { initPaleta } from './utils/paleta.js';
import './styles/paleta.css';
import { initTheme } from './utils/theme.js';
import { initUniverse } from './utils/universe-theme.js';
import { playBootIntro } from './utils/boot-intro.js';
import { countPageView } from './utils/page-views.js';
import { handleAuthRedirect } from './core/supabase-auth.js';
import { $ } from './utils/helpers.js';
import { VERSION } from './data/version.js';
import { startJarvisMusicPresence } from './utils/jarvis-music-presence.js';
import { resumeSpotifyAuthorization } from './utils/jarvis-spotify-session.js';

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

/* ==============================================================
 *  Rotas funcionais (Fase 1, 2, 3, 4)
 * ============================================================== */
router.register('/home', (args) => homePage(args));   // eager: 1º paint (args → ?spline=)
router.register('/baixar', lazy(() => import('./pages/baixar.ts'), 'baixarPage'));
router.register('/ferramentas', lazy(() => import('./pages/ferramentas.ts'), 'ferramentasPage'));
router.register('/editor', lazy(() => import('./pages/editor.js'), 'editorPage'));
router.register('/json-studio', lazy(() => import('./pages/json-studio.ts'), 'jsonStudioPage'));
router.register('/qr-studio', lazy(() => import('./pages/qr-studio.ts'), 'qrStudioPage'));
router.register('/git-helper', lazy(() => import('./pages/git-helper.ts'), 'gitHelperPage'));
router.register('/terminal', lazy(() => import('./pages/terminal.ts'), 'terminalPage'));
router.register('/calc-cientifica', lazy(() => import('./pages/calc-cientifica.ts'), 'calcCientificaPage'));
router.register('/calc-numerica', lazy(() => import('./pages/calc-numerica.ts'), 'calcNumericaPage'));
router.register('/calculadoras', lazy(() => import('./pages/calculadoras/index.js'), 'calculadorasPage'));
router.register('/tabela-verdade', lazy(() => import('./pages/tabela-verdade.ts'), 'tabelaVerdadePage'));
router.register('/cripto', lazy(() => import('./pages/cripto/index.js'), 'criptoPage'));
router.register('/esteganografia', lazy(() => import('./pages/esteganografia.ts'), 'esteganografiaPage'));
router.register('/graficos', lazy(() => import('./pages/graficos.ts'), 'graficosPage'));
router.register('/simbolos', lazy(() => import('./pages/simbolos.ts'), 'simbolosPage'));
router.register('/color-studio', lazy(() => import('./pages/color-studio.ts'), 'colorStudioPage'));
router.register('/regex', lazy(() => import('./pages/regex.ts'), 'regexPage'));
router.register('/arsenal', lazy(() => import('./pages/arsenal.js'), 'arsenalPage'));
router.register('/militar', lazy(() => import('./pages/militar.js'), 'militarPage'));   // hub consolidado das frentes militares
router.register('/modelos-3d', lazy(() => import('./pages/modelos-3d.js'), 'modelos3dPage'));   // visualizador 3D militar (#310)
router.register('/biblioteca', lazy(() => import('./pages/biblioteca.ts'), 'bibliotecaPage'));
router.register('/elites', lazy(() => import('./pages/elites.ts'), 'elitesPage'));
router.register('/dossie', lazy(() => import('./pages/dossie.ts'), 'dossiePage'));
router.register('/ciberseg', lazy(() => import('./pages/ciberseg.ts'), 'cibersegPage'));
router.register('/academia', lazy(() => import('./pages/academia.ts'), 'academiaPage'));
router.register('/robotica', lazy(() => import('./pages/robotica.ts'), 'roboticaPage'));
router.register('/fft', lazy(() => import('./pages/fft.ts'), 'fftPage'));
router.register('/radio', lazy(() => import('./pages/radio.ts'), 'radioPage'));
router.register('/musicas', lazy(() => import('./pages/musicas.ts'), 'musicasPage'));
router.register('/media', lazy(() => import('./pages/media.ts'), 'mediaPage'));
router.register('/videos', lazy(() => import('./pages/videos.ts'), 'videosPage'));
router.register('/tv', lazy(() => import('./pages/tv.ts'), 'tvPage'));
router.register('/utilidades', lazy(() => import('./pages/utilidades.ts'), 'utilidadesPage'));
router.register('/jogos', lazy(() => import('./pages/jogos.js'), 'jogosPage'));
router.register('/batalha-naval', lazy(() => import('./pages/batalha-naval.js'), 'batalhaNavalPage'));
router.register('/universo', lazy(() => import('./pages/universo.ts'), 'universoPage'));
router.register('/tabela-periodica', lazy(() => import('./pages/tabela-periodica.ts'), 'tabelaPeriodicaPage'));
router.register('/modpack', lazy(() => import('./pages/modpack.ts'), 'modpackPage'));
router.register('/wiki-arma3', lazy(() => import('./pages/wiki-arma3.js'), 'wikiArma3Page'));   // wiki de Arma 3 (capa/índice/artigo via ?p= ?a=)
router.register('/arma3-tutorial', lazy(() => import('./pages/arma3-tutorial.js'), 'arma3TutorialPage'));   // tutorial dos 105 mods do preset
router.register('/vanguard', lazy(() => import('./pages/vanguard.js'), 'vanguardPage'));                     // Project Vanguard: computador de tiro + coordenadas
router.register('/zomboid', lazy(() => import('./pages/zomboid.ts'), 'zomboidPage'));   // coleção Project Zomboid (Spartan Gamer BR)
router.register('/zomboid-admin', lazy(() => import('./pages/zomboid-admin.ts'), 'zomboidAdminPage'));   // admin de servidor PZ
router.register('/guia-pc', lazy(() => import('./pages/guia-pc.ts'), 'guiaPcPage'));
router.register('/logic-sim', lazy(() => import('./pages/logic-sim.ts'), 'logicSimPage'));
router.register('/portas', lazy(() => import('./pages/portas.ts'), 'portasPage'));
router.register('/morse', lazy(() => import('./pages/morse.ts'), 'morsePage'));
router.register('/memes', lazy(() => import('./pages/memes.ts'), 'memesPage'));
router.register('/filmes', lazy(() => import('./pages/filmes.ts'), 'filmesPage'));
router.register('/shadow', lazy(() => import('./pages/shadow.ts'), 'shadowPage'));
router.register('/perfil', lazy(() => import('./pages/perfil.js'), 'perfilPage'));
router.register('/login', lazy(() => import('./pages/login.js'), 'loginPage'));
router.register('/economia', lazy(() => import('./pages/economia.ts'), 'economiaPage'));
router.register('/dolar', lazy(() => import('./pages/dolar.ts'), 'dolarPage'));
router.register('/jarvis', lazyNexus('jarvis'));
router.register('/ia-proprietaria', lazyNexus('ia'));
router.register('/radar', lazy(() => import('./pages/radar.ts'), 'radarPage'));
router.register('/geo', lazy(() => import('./pages/geopulse.js'), 'geopulsePage'));
router.register('/find', lazy(() => import('./pages/find.ts'), 'findPage'));
router.register('/triangulacao', lazy(() => import('./pages/triangulacao.ts'), 'triangulacaoPage'));
router.register('/llm-lab', lazyNexus('llm'));

router.register('/sobre', lazy(() => import('./pages/sobre.ts'), 'sobrePage'));
router.register('/roadmap', lazy(() => import('./pages/roadmap.ts'), 'roadmapPage'));
router.register('/diagnostico', lazy(() => import('./pages/diagnostico.ts'), 'diagnosticoPage'));
router.register('/jarvis-dashboard', lazyNexus('dashboard'));
router.register('/mapa', lazy(() => import('./pages/mapa.ts'), 'mapaPage'));
router.register('/visao', lazy(() => import('./pages/visao.js'), 'visaoPage'));
router.register('/jarvis-vision', lazyLeve('vision', () => import('./pages/jarvis-vision.js'), 'jarvisVisionPage'));   // app → aba do Núcleo (#316)
router.register('/forcas-armadas', lazy(() => import('./pages/forcas-armadas.js'), 'forcasArmadasPage'));
router.register('/orcamentos-militares', lazy(() => import('./pages/orcamentos-militares.js'), 'orcamentosMilitaresPage'));
router.register('/poder-militar', lazy(() => import('./pages/poder-militar.js'), 'poderMilitarPage'));
router.register('/arsenal-expandido', lazy(() => import('./pages/arsenal-expandido.js'), 'arsenalExpandidoPage'));
router.register('/forcas-especiais', lazy(() => import('./pages/forcas-especiais.js'), 'forcasEspeciaisPage'));
router.register('/organizacao-militar', lazy(() => import('./pages/organizacao-militar.js'), 'organizacaoMilitarPage'));
router.register('/tecnologia-militar', lazy(() => import('./pages/tecnologia-militar.js'), 'tecnologiaMilitarPage'));
router.register('/taticas-estrategias', lazy(() => import('./pages/taticas-estrategias.js'), 'taticasEstrategiasPage'));
router.register('/historia-militar', lazy(() => import('./pages/historia-militar.js'), 'historiaMilitarPage'));
router.register('/armas-por-pais', lazy(() => import('./pages/armas-por-pais.js'), 'armasPorPaisPage'));
router.register('/guerras-conflitos', lazy(() => import('./pages/guerras-conflitos.js'), 'guerrasConflitosPage'));
router.register('/batalhas-historicas', lazy(() => import('./pages/batalhas-historicas.js'), 'batalhasHistoricasPage'));
router.register('/enciclopedia-militar', lazy(() => import('./pages/enciclopedia-militar.js'), 'enciclopediaMilitarPage'));

/* ==============================================================
 *  Dev & Projetos — auto-análise do próprio site
 * ============================================================== */
router.register('/codigo', lazy(() => import('./pages/codigo.js'), 'codigoPage'));
router.register('/projetos', lazy(() => import('./pages/projetos.js'), 'projetosPage'));
router.register('/mural', lazy(() => import('./pages/mural.js'), 'muralPage'));
router.register('/comms', lazy(() => import('./pages/comms.js'), 'commsPage'));   // Rede Neural — chat global em tempo real (0008)
router.register('/banco', lazy(() => import('./pages/banco.js'), 'bancoPage'));
router.register('/cerebro', lazyLeve('cerebro', () => import('./pages/cerebro.js'), 'cerebroPage'));
router.register('/ocr', lazy(() => import('./pages/ocr.ts'), 'ocrPage'));
router.register('/memoria', lazyLeve('memoria', () => import('./pages/memoria.js'), 'memoriaPage'));
router.register('/terminal-ia', lazyNexus('terminal'));
router.register('/seguranca', lazyNexus('seguranca'));
router.register('/gerar-codigo', lazyLeve('gerar', () => import('./pages/gerar-codigo.ts'), 'gerarCodigoPage'));   // app → aba do Núcleo (#316)
router.register('/conselho', lazyNexus('conselho'));
router.register('/apis', lazyNexus('apis'));
/* /git-nexus passa pelo GATE leve (#238 Fase 2): web → teaser; app → carrega a
 * experiência completa (git-nexus.js) sob demanda. Mantém o chunk pesado fora da web. */
router.register('/git-nexus', lazy(() => import('./pages/git-nexus-gate.js'), 'gitNexusGate'));
router.register('/aprendizado', lazyNexus('ml'));
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
  /* Presença musical passiva: observa apenas media elements deste app e sinais
   * explícitos dos embeds; não usa microfone, scraping cross-origin ou turnos de IA. */
  startJarvisMusicPresence();
  void resumeSpotifyAuthorization().then((result) => {
    if (result === 'rejected') console.warn('[spotify] autorização rejeitada ou state inválido');
  }).catch(() => undefined);
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
