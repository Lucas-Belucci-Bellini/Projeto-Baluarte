/**
 * Bootstrap principal — Baluarte Mark XIII · v1.0.0.
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
import { homePage } from './pages/home.js';
import { ferramentasPage } from './pages/ferramentas.js';
import { editorPage } from './pages/editor.js';
import { terminalPage } from './pages/terminal.js';
import { calcCientificaPage } from './pages/calc-cientifica.js';
import { calcNumericaPage } from './pages/calc-numerica.js';
import { calculadorasPage } from './pages/calculadoras/index.js';
import { tabelaVerdadePage } from './pages/tabela-verdade.js';
import { criptoPage } from './pages/cripto/index.js';
import { graficosPage } from './pages/graficos.js';
import { simbolosPage } from './pages/simbolos.js';
import { regexPage } from './pages/regex.js';
import { arsenalPage } from './pages/arsenal.js';
import { bibliotecaPage } from './pages/biblioteca.js';
import { elitesPage } from './pages/elites.js';
import { cibersegPage } from './pages/ciberseg.js';
import { academiaPage } from './pages/academia.js';
import { fftPage } from './pages/fft.js';
import { mediaPage } from './pages/media.js';
import { videosPage } from './pages/videos.js';
import { universoPage } from './pages/universo.js';
import { tabelaPeriodicaPage } from './pages/tabela-periodica.js';
import { modpackPage } from './pages/modpack.js';
import { guiaPcPage } from './pages/guia-pc.js';
import { logicSimPage } from './pages/logic-sim.js';
import { shadowPage } from './pages/shadow.js';
import { perfilPage } from './pages/perfil.js';
import { economiaPage } from './pages/economia.js';
import { jarvisPage } from './pages/jarvis.js';
import { iaProprietariaPage } from './pages/ia-proprietaria.js';
import { notFoundPage } from './pages/_placeholder.js';
import { sobrePage } from './pages/sobre.js';
import { initShadowGate } from './utils/shadow-gate.js';
import { initToast } from './utils/toast.js';
import { $ } from './utils/helpers.js';

/* ==============================================================
 *  Rotas funcionais (Fase 1, 2, 3, 4)
 * ============================================================== */
router.register('/home', () => homePage());
router.register('/ferramentas', () => ferramentasPage());
router.register('/editor', () => editorPage());
router.register('/terminal', () => terminalPage());
router.register('/calc-cientifica', () => calcCientificaPage());
router.register('/calc-numerica', () => calcNumericaPage());
router.register('/calculadoras', () => calculadorasPage());
router.register('/tabela-verdade', () => tabelaVerdadePage());
router.register('/cripto', () => criptoPage());
router.register('/graficos', () => graficosPage());
router.register('/simbolos', () => simbolosPage());
router.register('/regex', () => regexPage());
router.register('/arsenal', () => arsenalPage());
router.register('/biblioteca', () => bibliotecaPage());
router.register('/elites', () => elitesPage());
router.register('/ciberseg', () => cibersegPage());
router.register('/academia', () => academiaPage());
router.register('/fft', () => fftPage());
router.register('/media', () => mediaPage());
router.register('/videos', () => videosPage());
router.register('/universo', () => universoPage());
router.register('/tabela-periodica', () => tabelaPeriodicaPage());
router.register('/modpack', () => modpackPage());
router.register('/guia-pc', () => guiaPcPage());
router.register('/logic-sim', () => logicSimPage());
router.register('/shadow', () => shadowPage());
router.register('/perfil', () => perfilPage());
router.register('/economia', () => economiaPage());
router.register('/jarvis', () => jarvisPage());
router.register('/ia-proprietaria', () => iaProprietariaPage());

router.register('/sobre', () => sobrePage());

/* ==============================================================
 *  Mark XIII v1.0.0 — 31 rotas, todas implementadas. Sem placeholders.
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

  mountShell(root);
  initToast();
  initShadowGate();
  router.start('/home');

  console.log(
    '%c⬡ BALUARTE — Mark XIII · v1.0.0',
    'color: #00f0ff; font-weight: bold; font-family: monospace; font-size: 14px;'
  );
  console.log(
    '%c31 rotas ativas · 21 fases entregues · JS puro + Vite 5',
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
