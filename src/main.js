/**
 * Bootstrap principal — Baluarte Mark XIII.
 * 1. Monta o shell (sidebar + header + main).
 * 2. Registra as 31 rotas.
 * 3. Conecta o router ao shell.
 * 4. Inicializa toast + gateway oculto da Ponte Shadow.
 * 5. Inicia.
 */

import { router } from './core/router.js';
import { bus } from './core/events.js';
import { appState } from './core/state.js';
import { mountShell, renderPage } from './layout/shell.js';
/* Home é eager (primeiro paint instantâneo). As demais páginas carregam sob
 * demanda via import() dinâmico — o Vite faz code-splitting automático, então
 * o bundle inicial fica pequeno e cada rota baixa só o seu próprio chunk. */
import { homePage } from './pages/home.js';
import { notFoundPage } from './pages/_placeholder.js';
import { initShadowGate } from './utils/shadow-gate.js';
import { hxBeacon } from './utils/hx-beacon.js';
import { initToast } from './utils/toast.js';
import { initTheme } from './utils/theme.js';
import { $ } from './utils/helpers.js';
import { VERSION } from './data/version.js';

/* ==============================================================
 *  Helper de carregamento sob demanda (code-splitting via Vite).
 *  Cada rota só baixa o JS da sua página quando acessada.
 * ============================================================== */
const lazy = (loader, fn) => (args) => loader().then((m) => m[fn](args));

/* ==============================================================
 *  Rotas funcionais (Fase 1, 2, 3, 4)
 * ============================================================== */
router.register('/home', () => homePage());   // eager: 1º paint
router.register('/ferramentas', lazy(() => import('./pages/ferramentas.js'), 'ferramentasPage'));
router.register('/editor', lazy(() => import('./pages/editor.js'), 'editorPage'));
router.register('/json-studio', lazy(() => import('./pages/json-studio.js'), 'jsonStudioPage'));
router.register('/qr-studio', lazy(() => import('./pages/qr-studio.js'), 'qrStudioPage'));
router.register('/git-helper', lazy(() => import('./pages/git-helper.js'), 'gitHelperPage'));
router.register('/terminal', lazy(() => import('./pages/terminal.js'), 'terminalPage'));
router.register('/calc-cientifica', lazy(() => import('./pages/calc-cientifica.js'), 'calcCientificaPage'));
router.register('/calc-numerica', lazy(() => import('./pages/calc-numerica.js'), 'calcNumericaPage'));
router.register('/calculadoras', lazy(() => import('./pages/calculadoras/index.js'), 'calculadorasPage'));
router.register('/tabela-verdade', lazy(() => import('./pages/tabela-verdade.js'), 'tabelaVerdadePage'));
router.register('/cripto', lazy(() => import('./pages/cripto/index.js'), 'criptoPage'));
router.register('/esteganografia', lazy(() => import('./pages/esteganografia.js'), 'esteganografiaPage'));
router.register('/graficos', lazy(() => import('./pages/graficos.js'), 'graficosPage'));
router.register('/simbolos', lazy(() => import('./pages/simbolos.js'), 'simbolosPage'));
router.register('/color-studio', lazy(() => import('./pages/color-studio.js'), 'colorStudioPage'));
router.register('/regex', lazy(() => import('./pages/regex.js'), 'regexPage'));
router.register('/arsenal', lazy(() => import('./pages/arsenal.js'), 'arsenalPage'));
router.register('/biblioteca', lazy(() => import('./pages/biblioteca.js'), 'bibliotecaPage'));
router.register('/elites', lazy(() => import('./pages/elites.js'), 'elitesPage'));
router.register('/ciberseg', lazy(() => import('./pages/ciberseg.js'), 'cibersegPage'));
router.register('/academia', lazy(() => import('./pages/academia.js'), 'academiaPage'));
router.register('/robotica', lazy(() => import('./pages/robotica.js'), 'roboticaPage'));
router.register('/fft', lazy(() => import('./pages/fft.js'), 'fftPage'));
router.register('/radio', lazy(() => import('./pages/radio.js'), 'radioPage'));
router.register('/musicas', lazy(() => import('./pages/musicas.js'), 'musicasPage'));
router.register('/media', lazy(() => import('./pages/media.js'), 'mediaPage'));
router.register('/videos', lazy(() => import('./pages/videos.js'), 'videosPage'));
router.register('/tv', lazy(() => import('./pages/tv.js'), 'tvPage'));
router.register('/utilidades', lazy(() => import('./pages/utilidades.js'), 'utilidadesPage'));
router.register('/jogos', lazy(() => import('./pages/jogos.js'), 'jogosPage'));
router.register('/universo', lazy(() => import('./pages/universo.js'), 'universoPage'));
router.register('/tabela-periodica', lazy(() => import('./pages/tabela-periodica.js'), 'tabelaPeriodicaPage'));
router.register('/modpack', lazy(() => import('./pages/modpack.js'), 'modpackPage'));
router.register('/guia-pc', lazy(() => import('./pages/guia-pc.js'), 'guiaPcPage'));
router.register('/logic-sim', lazy(() => import('./pages/logic-sim.js'), 'logicSimPage'));
router.register('/portas', lazy(() => import('./pages/portas.js'), 'portasPage'));
router.register('/morse', lazy(() => import('./pages/morse.js'), 'morsePage'));
router.register('/memes', lazy(() => import('./pages/memes.js'), 'memesPage'));
router.register('/filmes', lazy(() => import('./pages/filmes.js'), 'filmesPage'));
router.register('/shadow', lazy(() => import('./pages/shadow.js'), 'shadowPage'));
router.register('/perfil', lazy(() => import('./pages/perfil.js'), 'perfilPage'));
router.register('/economia', lazy(() => import('./pages/economia.js'), 'economiaPage'));
router.register('/jarvis', lazy(() => import('./pages/jarvis.js'), 'jarvisPage'));
router.register('/ia-proprietaria', lazy(() => import('./pages/ia-proprietaria.js'), 'iaProprietariaPage'));
router.register('/radar', lazy(() => import('./pages/radar.js'), 'radarPage'));
router.register('/geo', lazy(() => import('./pages/geopulse.js'), 'geopulsePage'));
router.register('/find', lazy(() => import('./pages/find.js'), 'findPage'));
router.register('/triangulacao', lazy(() => import('./pages/triangulacao.js'), 'triangulacaoPage'));
router.register('/llm-lab', lazy(() => import('./pages/llm-lab.js'), 'llmLabPage'));

router.register('/sobre', lazy(() => import('./pages/sobre.js'), 'sobrePage'));
router.register('/roadmap', lazy(() => import('./pages/roadmap.js'), 'roadmapPage'));
router.register('/jarvis-dashboard', lazy(() => import('./pages/jarvis-dashboard.js'), 'jarvisDashboardPage'));
router.register('/mapa', lazy(() => import('./pages/mapa.js'), 'mapaPage'));
router.register('/visao', lazy(() => import('./pages/visao.js'), 'visaoPage'));
router.register('/jarvis-vision', lazy(() => import('./pages/jarvis-vision.js'), 'jarvisVisionPage'));
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

/* ==============================================================
 *  Mark XIII — 46 rotas, todas implementadas. Sem placeholders.
 * ============================================================== */
router.setNotFound((path) => notFoundPage(path));

/* ==============================================================
 *  Wire router → shell
 * ============================================================== */
bus.on('route:change', ({ view, path }) => {
  if (view) renderPage(view, path);
});

bus.on('route:notfound', ({ view, path }) => {
  if (view) renderPage(view, path);
});

bus.on('route:error', ({ path, error }) => {
  console.error(`[main] Erro na rota ${path}:`, error);
  renderPage(notFoundPage(path), path);
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
  initTheme();

  mountShell(root);
  initToast();
  initShadowGate();
  router.start('/home');
  setTimeout(() => hxBeacon(), 2000);

  console.log(
    `%c⬡ BALUARTE — Mark XIII · v${VERSION}`,
    'color: #00f0ff; font-weight: bold; font-family: monospace; font-size: 14px;'
  );
  console.log(
    '%c46 rotas ativas · JS puro + Vite 5',
    'color: #93a4bf; font-family: monospace;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* ==============================================================
 *  Service Worker — registrado em modo passivo (skeleton).
 *  Cache real só na Fase 18.
 * ============================================================== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[sw] registro falhou (esperado em dev):', err));
  });
}
