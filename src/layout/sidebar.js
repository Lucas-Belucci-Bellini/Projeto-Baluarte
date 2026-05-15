/**
 * Sidebar — navegação principal das 13 páginas.
 * Collapsible no desktop. Drawer overlay no mobile.
 */

import { h, cx } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';
import { router } from '../core/router.js';
import { storage } from '../core/storage.js';

/* ===== Definição das 13 rotas oficiais ===== */
export const NAV_GROUPS = [
  {
    label: 'Operações',
    items: [
      { path: '/home', label: 'Ponte de Comando', icon: '⬡', phase: 1 },
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙', phase: 1 }
    ]
  },
  {
    label: 'Conhecimento',
    items: [
      { path: '/biblioteca', label: 'Biblioteca', icon: '◫', phase: 1 },
      { path: '/academia', label: 'Academia', icon: '◬', phase: 1 },
      { path: '/lab', label: 'Lab Científico', icon: '⚛', phase: 2 },
      { path: '/universo', label: 'Universo', icon: '✦', phase: 1 }
    ]
  },
  {
    label: 'Tático',
    items: [
      { path: '/elites', label: 'Elites', icon: '◆', phase: 1 },
      { path: '/arsenal', label: 'Arsenal', icon: '⌖', phase: 1 },
      { path: '/ciberseg', label: 'CiberSeg', icon: '⚿', phase: 1 },
      { path: '/economia', label: 'Economia', icon: '◈', phase: 1 }
    ]
  },
  {
    label: 'Sistema',
    items: [
      { path: '/jarvis', label: 'J.A.R.V.I.S.', icon: '◉', phase: 1 },
      { path: '/perfil', label: 'Perfil', icon: '◔', phase: 1 },
      { path: '/shadow', label: 'Shadow Bridge', icon: '◐', phase: 1 }
    ]
  }
];

const CURRENT_PHASE = 19;

function navItem(item, currentPath) {
  const isActive = currentPath === item.path;
  const isReady = item.phase <= CURRENT_PHASE;

  const el = h(
    'a',
    {
      href: '#' + item.path,
      className: cx('sidebar__item', isActive && 'is-active'),
      title: item.label + (!isReady ? ` (Fase ${item.phase})` : ''),
      onclick: (e) => {
        e.preventDefault();
        router.navigate(item.path);
        bus.emit('sidebar:close-mobile');
      }
    },
    h('span', { className: 'sidebar__item-icon' }, item.icon),
    h('span', { className: 'sidebar__item-label' }, item.label),
    !isReady && h('span', { className: 'sidebar__item-badge' }, `F${item.phase}`)
  );

  return el;
}

function renderNav(currentPath) {
  const nav = h('nav', { className: 'sidebar__nav', 'aria-label': 'Navegação principal' });
  for (const group of NAV_GROUPS) {
    nav.appendChild(h('div', { className: 'sidebar__group-label' }, group.label));
    for (const item of group.items) {
      nav.appendChild(navItem(item, currentPath));
    }
  }
  return nav;
}

export function renderSidebar() {
  const currentPath = appState.get('route');
  const collapsed = storage.get('ui:sidebarCollapsed', false);
  appState.set({ sidebarCollapsed: collapsed });

  const sidebar = h(
    'aside',
    {
      className: cx('sidebar', collapsed && 'is-collapsed'),
      'aria-label': 'Menu lateral'
    },
    h(
      'div',
      { className: 'sidebar__head' },
      h(
        'div',
        { className: 'sidebar__logo' },
        h('span', { className: 'sidebar__logo-glyph' }, '⬡'),
        h('span', null, 'Mark XIII')
      ),
      h(
        'button',
        {
          className: 'sidebar__toggle',
          'aria-label': 'Recolher menu',
          title: 'Recolher / expandir',
          onclick: () => bus.emit('sidebar:toggle-collapse')
        },
        collapsed ? '›' : '‹'
      )
    ),
    renderNav(currentPath),
    h(
      'div',
      { className: 'sidebar__foot' },
      `v0.19.0 · Fase ${CURRENT_PHASE}/21`
    )
  );

  return sidebar;
}

/* ===== Wiring de comportamento ===== */

export function wireSidebar(refs) {
  /* refs: { sidebar, overlay } — atualizados pelo shell */

  bus.on('sidebar:toggle-collapse', () => {
    const next = !appState.get('sidebarCollapsed');
    appState.set({ sidebarCollapsed: next });
    storage.set('ui:sidebarCollapsed', next);
    refs.sidebar.classList.toggle('is-collapsed', next);
    refs.shell.classList.toggle('is-collapsed', next);
  });

  bus.on('sidebar:toggle-mobile', () => {
    const next = !appState.get('sidebarMobileOpen');
    appState.set({ sidebarMobileOpen: next });
    refs.sidebar.classList.toggle('is-mobile-open', next);
    refs.overlay.classList.toggle('is-visible', next);
  });

  bus.on('sidebar:close-mobile', () => {
    appState.set({ sidebarMobileOpen: false });
    refs.sidebar.classList.remove('is-mobile-open');
    refs.overlay.classList.remove('is-visible');
  });

  /* Atalho Ctrl+B para colapsar */
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      bus.emit('sidebar:toggle-collapse');
    }
  });
}

/** Atualiza o item ativo sem rebuildar a sidebar inteira. */
export function updateActiveNav(path) {
  document.querySelectorAll('.sidebar__item').forEach((el) => {
    const isActive = el.getAttribute('href') === '#' + path;
    el.classList.toggle('is-active', isActive);
  });
}
