/**
 * Bootstrap principal — Baluarte Mark XIII (Fase 1).
 * 1. Monta o shell (sidebar + header + main).
 * 2. Registra as 13 rotas no router.
 * 3. Conecta o router ao shell.
 * 4. Inicia.
 */

import { router } from './core/router.js';
import { bus } from './core/events.js';
import { appState } from './core/state.js';
import { mountShell, renderPage } from './layout/shell.js';
import { homePage } from './pages/home.js';
import { ferramentasPage } from './pages/ferramentas.js';
import { placeholderPage, notFoundPage } from './pages/_placeholder.js';
import { $ } from './utils/helpers.js';

/* ==============================================================
 *  Registro de rotas
 *  Fase 1: /home + /ferramentas implementadas.
 *  Fases 2-5: rotas registradas com placeholderPage(path).
 * ============================================================== */

router.register('/home', () => homePage());
router.register('/ferramentas', () => ferramentasPage());

router.register('/biblioteca', () => placeholderPage('/biblioteca'));
router.register('/elites', () => placeholderPage('/elites'));
router.register('/lab', () => placeholderPage('/lab'));
router.register('/economia', () => placeholderPage('/economia'));
router.register('/academia', () => placeholderPage('/academia'));
router.register('/arsenal', () => placeholderPage('/arsenal'));
router.register('/ciberseg', () => placeholderPage('/ciberseg'));
router.register('/universo', () => placeholderPage('/universo'));
router.register('/perfil', () => placeholderPage('/perfil'));
router.register('/jarvis', () => placeholderPage('/jarvis'));
router.register('/shadow', () => placeholderPage('/shadow'));

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
  router.start('/home');

  console.log(
    '%c⬡ BALUARTE — Mark XIII · Fase 1 ativa',
    'color: #00f0ff; font-weight: bold; font-family: monospace; font-size: 14px;'
  );
  console.log(
    '%cRotas registradas: 13 · Páginas funcionais: 2 (home, ferramentas) · Placeholders: 11',
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
 *  Cache real só na Fase 5.
 * ============================================================== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[sw] registro falhou (esperado em dev):', err));
  });
}
