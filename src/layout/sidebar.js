/**
 * Sidebar — navegação principal do Baluarte (todas as rotas).
 * Collapsible no desktop. Drawer overlay no mobile.
 */

import { h, cx } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';
import { router } from '../core/router.js';
import { storage } from '../core/storage.js';
import { VERSION, CODENAME } from '../data/version.js';

/* ===== Grupos de navegação do menu lateral — todas as rotas ===== */
export const NAV_GROUPS = [
  {
    label: 'Operações',
    items: [
      { path: '/home', label: 'Ponte de Comando', icon: '⬡', phase: 1 },
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙', phase: 1 }
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/editor', label: 'Editor de Código', icon: '⌨', phase: 1 },
      { path: '/json-studio', label: 'JSON Studio', icon: '⟦⟧', phase: 1 },
      { path: '/qr-studio', label: 'QR Code Studio', icon: '▦', phase: 1 },
      { path: '/git-helper', label: 'Git Helper', icon: '⎇', phase: 1 },
      { path: '/utilidades', label: 'Caixa de Ferramentas', icon: '🧰', phase: 1 },
      { path: '/terminal', label: 'Terminal', icon: '▸', phase: 1 },
      { path: '/calculadoras', label: 'Calculadoras', icon: '∑', phase: 1 },
      { path: '/calc-cientifica', label: 'Calc. Científica', icon: 'π', phase: 1 },
      { path: '/calc-numerica', label: 'Calc. Numérica', icon: '⊞', phase: 1 },
      { path: '/tabela-verdade', label: 'Tabela Verdade', icon: '⊨', phase: 1 },
      { path: '/cripto', label: 'Lab de Cripto', icon: '⚿', phase: 1 },
      { path: '/esteganografia', label: 'Esteganografia', icon: '⬚', phase: 1 },
      { path: '/regex', label: 'Lab de Regex', icon: '✱', phase: 1 },
      { path: '/graficos', label: 'Gráficos', icon: '◢', phase: 1 },
      { path: '/simbolos', label: 'Símbolos', icon: '❖', phase: 1 },
      { path: '/color-studio', label: 'Color Studio', icon: '◐', phase: 1 },
      { path: '/logic-sim', label: 'Logic Sim', icon: '⊻', phase: 1 },
      { path: '/portas', label: 'Portas Lógicas', icon: '⊡', phase: 1 },
      { path: '/morse', label: 'Código Morse', icon: '⠶', phase: 1 }
    ]
  },
  {
    label: 'Conhecimento',
    items: [
      { path: '/biblioteca', label: 'Biblioteca', icon: '◫', phase: 1 },
      { path: '/academia', label: 'Academia', icon: '◬', phase: 1 },
      { path: '/jogos', label: 'Jogos de Aprendizado', icon: '🎮', phase: 1 },
      { path: '/robotica', label: 'Robótica', icon: '⚙', phase: 1 },
      { path: '/universo', label: 'Universo', icon: '✦', phase: 1 },
      { path: '/tabela-periodica', label: 'Tabela Periódica', icon: '⚛', phase: 1 },
      { path: '/modpack', label: 'Modpack Minecraft', icon: '◧', phase: 1 },
      { path: '/guia-pc', label: 'Guia para Montar PC', icon: '◨', phase: 1 }
    ]
  },
  {
    label: 'Mídia',
    items: [
      { path: '/fft', label: 'Visualizador FFT', icon: '∿', phase: 1 },
      { path: '/radio', label: 'Rádio', icon: '◉', phase: 1 },
      { path: '/musicas', label: 'Música', icon: '♪', phase: 1 },
      { path: '/media', label: 'Media Hub', icon: '▦', phase: 1 },
      { path: '/videos', label: 'Central de Vídeos', icon: '▶', phase: 1 },
      { path: '/tv', label: 'TV', icon: '📺', phase: 1 },
      { path: '/memes', label: 'Arquivo de Memes', icon: '◫', phase: 1 },
      { path: '/filmes', label: 'Cinema', icon: '▤', phase: 1 }
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
      { path: '/ia-proprietaria', label: 'IA Proprietária', icon: '◎', phase: 1 },
      { path: '/perfil', label: 'Perfil', icon: '◔', phase: 1 },
      { path: '/sobre', label: 'Sobre o Projeto', icon: '◇', phase: 1 }
    ]
  }
];

const CURRENT_PHASE = 21;

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
      h('a', {
        className: 'sidebar__ext', href: 'https://www.youtube.com/@Spartan_Gamer_BR',
        target: '_blank', rel: 'noopener', title: 'Canal no YouTube — Spartan Gamer BR'
      }, '▶ @Spartan_Gamer_BR'),
      h('a', {
        className: 'sidebar__ext', href: 'https://llbr-innovations-constructions.vercel.app/',
        target: '_blank', rel: 'noopener', title: 'LLBR Innovations & Constructions'
      }, '⬡ LLBR Innovations'),
      h('div', { className: 'sidebar__ver' }, `v${VERSION} · ${CODENAME}`)
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
