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
import { iconForPath, iconByPath, lineIcon } from '../utils/icons.js';
import { canInstall, onInstallChange, promptInstall } from '../utils/pwa.js';

/* ===== Grupos de navegação do menu lateral =====
 * Para ADICIONAR um item ao menu, inclua { path, label, icon, phase } no grupo
 * desejado:
 *   - `path`  rota (#/path) — precisa estar registrada em main.js
 *   - `label` texto exibido
 *   - `icon`  glifo de fallback — só usado se a rota não tiver ícone de linha em
 *             icons.js (`iconByPath`). A navegação inteira hoje usa o set de linha;
 *             mapeie a nova rota lá para manter a coerência (Design System §4).
 *   - `phase` liberação: <= CURRENT_PHASE fica ativo; senão aparece bloqueado
 */
export const NAV_GROUPS = [
  {
    label: 'Início',
    items: [
      { path: '/home',        label: 'Ponte de Comando',   icon: '⬡', phase: 1 },
      { path: '/baixar',      label: 'Baixar o App',       icon: '⬇', phase: 1 },
      { path: '/perfil',      label: 'Perfil',             icon: '◔', phase: 1 },
      { path: '/projetos',    label: 'Projetos',           icon: '📁', phase: 1 },
      { path: '/mural',       label: 'Mural',              icon: '📣', phase: 1 },
      { path: '/comms',       label: 'Rede Neural',        icon: '📡', phase: 1 },
      { path: '/roadmap',     label: 'Roadmap',            icon: '◈', phase: 1 },
      { path: '/sobre',       label: 'Sobre o Projeto',    icon: '◇', phase: 1 }
    ]
  },
  {
    /* Fusão da seção IA no Núcleo de IA (#231/#238): a seção inteira virou um
     * cockpit com abas dentro do Git Nexus. Uma entrada só; as ferramentas
     * (JARVIS, Conselho, APIs, Dashboard, ML, Mini-LLM, Segundo Cérebro, Memória,
     * Terminal-IA, Segurança, IA Proprietária) abrem como abas lá dentro. */
    label: 'IA & Jarvis',
    items: [
      { path: '/git-nexus', label: 'Núcleo de IA', icon: '🔗', phase: 1 }
    ]
  },
  {
    label: 'Código & Dev',
    items: [
      { path: '/editor',      label: 'Editor de Código',   icon: '⌨',  phase: 1 },
      { path: '/gerar-codigo', label: 'Gerador de Código',  icon: '🧬', phase: 1 },
      { path: '/terminal',    label: 'Terminal',           icon: '▸',  phase: 1 },
      { path: '/json-studio', label: 'JSON Studio',        icon: '⟦⟧', phase: 1 },
      { path: '/git-helper',  label: 'Git Helper',         icon: '⎇',  phase: 1 },
      { path: '/regex',       label: 'Lab de Regex',       icon: '✱',  phase: 1 },
      { path: '/codigo',      label: 'Raio-X do Código',   icon: '◇',  phase: 1 },
      { path: '/utilidades',  label: 'Caixa de Ferramentas', icon: '🧰', phase: 1 }
    ]
  },
  {
    label: 'Ciência & Lógica',
    items: [
      { path: '/calculadoras',    label: 'Calculadoras',     icon: '∑',  phase: 1 },
      { path: '/calc-cientifica', label: 'Calc. Científica', icon: 'π',  phase: 1 },
      { path: '/calc-numerica',   label: 'Calc. Numérica',   icon: '⊞',  phase: 1 },
      { path: '/tabela-verdade',  label: 'Tabela Verdade',   icon: '⊨',  phase: 1 },
      { path: '/logic-sim',       label: 'Logic Sim',        icon: '⊻',  phase: 1 },
      { path: '/portas',          label: 'Portas Lógicas',   icon: '⊡',  phase: 1 },
      { path: '/graficos',        label: 'Gráficos',         icon: '◢',  phase: 1 },
      { path: '/tabela-periodica',label: 'Tabela Periódica', icon: '⚛',  phase: 1 },
      { path: '/universo',        label: 'Universo',         icon: '✦',  phase: 1 }
    ]
  },
  {
    label: 'Segurança & Cripto',
    items: [
      { path: '/cripto',        label: 'Lab de Cripto',    icon: '⚿',  phase: 1 },
      { path: '/esteganografia',label: 'Esteganografia',   icon: '⬚',  phase: 1 },
      { path: '/ciberseg',      label: 'CiberSeg',         icon: '⊗',  phase: 1 },
      { path: '/morse',         label: 'Código Morse',     icon: '⠶',  phase: 1 }
    ]
  },
  {
    label: 'Criativo & Visual',
    items: [
      { path: '/color-studio',  label: 'Color Studio',     icon: '◐',  phase: 1 },
      { path: '/qr-studio',     label: 'QR Code Studio',   icon: '▦',  phase: 1 },
      { path: '/simbolos',      label: 'Símbolos',         icon: '❖',  phase: 1 }
    ]
  },
  {
    label: 'Conhecimento',
    items: [
      { path: '/biblioteca',    label: 'Biblioteca',         icon: '◫',  phase: 1 },
      { path: '/academia',      label: 'Academia',           icon: '◬',  phase: 1 },
      { path: '/robotica',      label: 'Robótica',           icon: '⊕',  phase: 1 },
      { path: '/guia-pc',       label: 'Guia para Montar PC',icon: '◨',  phase: 1 },
      { path: '/wiki-arma3',    label: 'Wiki de Arma 3',     icon: '📖', phase: 1 },
      { path: '/vanguard',      label: 'Project Vanguard',   icon: '⌖',  phase: 1 },
      { path: '/modpack',       label: 'Modpack Minecraft',  icon: '◧',  phase: 1 },
      { path: '/zomboid',       label: 'Modpack Zomboid',    icon: '🧟', phase: 1 },
      { path: '/zomboid-admin', label: 'Admin Zomboid',      icon: '⌘', phase: 1 },
      { path: '/economia',      label: 'Economia',           icon: '◈',  phase: 1 },
      { path: '/dolar',         label: 'Radar do Câmbio',    icon: '💹', phase: 1 }
    ]
  },
  {
    label: 'Mídia & Entretenimento',
    items: [
      { path: '/radio',   label: 'Rádio',              icon: '⊛',  phase: 1 },
      { path: '/musicas', label: 'Música',             icon: '♪',  phase: 1 },
      { path: '/fft',     label: 'Visualizador FFT',   icon: '∿',  phase: 1 },
      { path: '/media',   label: 'Media Hub',          icon: '⊜',  phase: 1 },
      { path: '/videos',  label: 'Central de Vídeos',  icon: '▶',  phase: 1 },
      { path: '/tv',      label: 'TV',                 icon: '▤',  phase: 1 },
      { path: '/filmes',  label: 'Cinema',             icon: '◰',  phase: 1 },
      { path: '/memes',   label: 'Arquivo de Memes',   icon: '◱',  phase: 1 },
      { path: '/jogos',   label: 'Arcade Baluarte',    icon: '🎮', phase: 1 },
      { path: '/batalha-naval', label: 'Batalha Naval', icon: '🚢', phase: 1 }
    ]
  },
  {
    label: 'Campo & Tático',
    items: [
      { path: '/elites',       label: 'Elites',         icon: '◆',  phase: 1 },
      { path: '/dossie',       label: 'Dossiê de Forças', icon: '▣', phase: 1 },
      { path: '/arsenal',      label: 'Arsenal',        icon: '⌖',  phase: 1 },
      { path: '/radar',        label: 'Radar Tático',   icon: '⌬',  phase: 1 },
      { path: '/geo',          label: 'GeoPulse',       icon: '🛰', phase: 1 },
      { path: '/find',         label: 'Onde Estou?',    icon: '🧭', phase: 1 },
      { path: '/triangulacao', label: 'Triangulação',   icon: '△',  phase: 1 },
      { path: '/mapa',         label: 'Mapa Mundial',   icon: '🗺', phase: 1 }
    ]
  },
  {
    /* As 13 frentes militares foram CONSOLIDADAS num hub único (estilo Wikipédia)
     * em /militar — sidebar enxuta. As páginas individuais seguem registradas e
     * acessíveis pelo hub (link "abrir página completa") e por URL direta. */
    label: 'Seção Militar',
    items: [
      { path: '/militar', label: 'Centro Militar', icon: '🎖', phase: 1 },
      { path: '/modelos-3d', label: 'Modelos 3D', icon: '🧊', phase: 1 }
    ]
  },
  {
    label: 'Visão & Câmera',
    items: [
      { path: '/visao', label: 'Visão & Câmera', icon: '👁', phase: 1 },
      { path: '/ocr', label: 'Leitor OCR', icon: '👁', phase: 1 },
      { path: '/jarvis-vision', label: 'JARVIS · Corpo Total', icon: '🤖', phase: 1 }
    ]
  },
  {
    label: 'Sistema',
    items: [
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙', phase: 1 },
      { path: '/banco',       label: 'Painel do Banco',     icon: '🗄', phase: 1 }
    ]
  }
];

const CURRENT_PHASE = 21;

/** Monta um link do menu: ícone (de linha ou glifo) + rótulo + badge de fase. */
function navItem(item, currentPath) {
  const isActive = currentPath === item.path;
  const isReady = item.phase <= CURRENT_PHASE;

  /* Ícone de linha (SVG) por rota; fallback para o glifo antigo. */
  const iconEl = h('span', { className: 'sidebar__item-icon' });
  if (iconByPath[item.path]) iconEl.innerHTML = iconForPath(item.path);
  else iconEl.textContent = item.icon;

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
    iconEl,
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

  /* Botão "Instalar app" (PWA) — só aparece quando o navegador permite. */
  const installBtn = h('button', {
    className: 'sidebar__install',
    title: 'Instalar o Baluarte na tela inicial',
    style: {
      display: canInstall() ? 'block' : 'none',
      width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit',
      margin: '0 0 8px', padding: '7px 10px', borderRadius: '7px',
      color: '#d4a24e', border: '1px solid rgba(212,162,78,0.35)',
      background: 'linear-gradient(90deg, rgba(212,162,78,0.16), rgba(212,162,78,0.02))'
    },
    html: lineIcon('download') + '<span class="sidebar__ext-label">Instalar app</span>',
    onclick: () => promptInstall()
  });
  onInstallChange((can) => { installBtn.style.display = can ? 'block' : 'none'; });

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
        h('img', { className: 'sidebar__logo-img', src: '/logo.svg', alt: 'Baluarte' }),
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
      installBtn,
      h('a', {
        className: 'sidebar__ext', href: 'https://www.youtube.com/@Spartan_Gamer_BR',
        target: '_blank', rel: 'noopener', title: 'Canal no YouTube — Spartan Gamer BR',
        html: lineIcon('play') + '<span class="sidebar__ext-label">@Spartan_Gamer_BR</span>'
      }),
      h('a', {
        className: 'sidebar__ext', href: 'https://llbr-innovations-constructions.vercel.app/',
        target: '_blank', rel: 'noopener', title: 'LLBR Innovations & Constructions',
        html: lineIcon('hex') + '<span class="sidebar__ext-label">LLBR Innovations</span>'
      }),
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
