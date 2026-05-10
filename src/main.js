/**
 * Bootstrap principal — Baluarte Mark XIII (Fase 1.5).
 * 1. Monta o shell (sidebar + header + main).
 * 2. Registra TODAS as rotas (13 principais + 17 ferramentas = 30 rotas).
 * 3. Conecta o router ao shell.
 * 4. Inicializa toast system.
 * 5. Inicia.
 */

import { router } from './core/router.js';
import { bus } from './core/events.js';
import { appState } from './core/state.js';
import { mountShell, renderPage } from './layout/shell.js';
import { homePage } from './pages/home.js';
import { ferramentasPage } from './pages/ferramentas.js';
import { editorPage } from './pages/editor.js';
import { placeholderPage, notFoundPage } from './pages/_placeholder.js';
import { initToast } from './utils/toast.js';
import { $ } from './utils/helpers.js';

/* ==============================================================
 *  Rotas funcionais (Fase 1, 2)
 * ============================================================== */
router.register('/home', () => homePage());
router.register('/ferramentas', () => ferramentasPage());
router.register('/editor', () => editorPage());

/* ==============================================================
 *  Rotas de páginas principais (placeholders — Fases 11-20)
 * ============================================================== */
const PRINCIPAL_ROUTES = [
  '/biblioteca',
  '/elites',
  '/lab',
  '/economia',
  '/academia',
  '/arsenal',
  '/ciberseg',
  '/universo',
  '/perfil',
  '/jarvis',
  '/shadow'
];

/* ==============================================================
 *  Rotas de ferramentas (placeholders — Fases 2-21)
 *  Acessadas via Hub de Ferramentas e direto pela URL.
 * ============================================================== */
const TOOL_ROUTES = [
  /* /editor implementado na Fase 2 — registrado acima */
  '/terminal',
  '/calculadoras',
  '/calc-cientifica',
  '/calc-numerica',
  '/tabela-verdade',
  '/cripto',
  '/graficos',
  '/simbolos',
  '/regex',
  '/fft',
  '/media',
  '/videos',
  '/tabela-periodica',
  '/modpack',
  '/guia-pc',
  '/logic-sim',
  '/ia-proprietaria'
];

[...PRINCIPAL_ROUTES, ...TOOL_ROUTES].forEach((path) => {
  router.register(path, () => placeholderPage(path));
});

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
  router.start('/home');

  const totalRoutes = 3 + PRINCIPAL_ROUTES.length + TOOL_ROUTES.length;
  console.log(
    '%c⬡ BALUARTE — Mark XIII · v0.2.0',
    'color: #00f0ff; font-weight: bold; font-family: monospace; font-size: 14px;'
  );
  console.log(
    `%cRotas: ${totalRoutes} (3 ativas + ${PRINCIPAL_ROUTES.length} principais placeholder + ${TOOL_ROUTES.length} ferramentas placeholder)`,
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
