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
import { iconForPath, iconByPath } from '../utils/icons.js';
import { canInstall, onInstallChange, promptInstall } from '../utils/pwa.js';

/* ===== Grupos de navegação do menu lateral =====
 * Para ADICIONAR um item ao menu, inclua { path, label, icon, phase } no grupo
 * desejado:
 *   - `path`  rota (#/path) — precisa estar registrada em main.js
 *   - `label` texto exibido
 *   - `icon`  glifo de fallback (o ícone de linha vem de icons.js por `path`)
 *   - `phase` liberação: <= CURRENT_PHASE fica ativo; senão aparece bloqueado
 */
export const NAV_GROUPS = [
  {
    label: 'Início',
    items: [
      { path: '/home',        label: 'Ponte de Comando',   icon: '⬡', phase: 1 },
      { path: '/perfil',      label: 'Perfil',             icon: '◔', phase: 1 },
      { path: '/projetos',    label: 'Projetos',           icon: '📁', phase: 1 },
      { path: '/mural',       label: 'Mural',              icon: '📣', phase: 1 },
      { path: '/roadmap',     label: 'Roadmap',            icon: '◈', phase: 1 },
      { path: '/sobre',       label: 'Sobre o Projeto',    icon: '◇', phase: 1 }
    ]
  },
  {
    label: 'IA & Jarvis',
    items: [
      { path: '/jarvis',           label: 'J.A.R.V.I.S.',      icon: '◉', phase: 1 },
      { path: '/conselho',         label: 'Conselho de IAs',    icon: '⚖', phase: 1 },
      { path: '/apis',             label: 'Central de APIs',    icon: '🔑', phase: 1 },
      { path: '/jarvis-dashboard', label: 'Jarvis Dashboard',   icon: '⬡', phase: 1 },
      { path: '/aprendizado',      label: 'ML da Memória',      icon: '📈', phase: 1 },
      { path: '/llm-lab',          label: 'Mini-LLM do Zero',   icon: '🧠', phase: 1 },
      { path: '/cerebro',          label: 'Segundo Cérebro',    icon: '🧠', phase: 1 },
      { path: '/memoria',          label: 'Memória do JARVIS',  icon: '🧠', phase: 1 },
      { path: '/terminal-ia',      label: 'Terminal-IA',        icon: '💻', phase: 1 },
      { path: '/seguranca',        label: 'Segurança do Agente', icon: '🛡', phase: 1 },
      { path: '/ia-proprietaria',  label: 'IA Proprietária',    icon: '◎', phase: 1 }
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
      { path: '/modpack',       label: 'Modpack Minecraft',  icon: '◧',  phase: 1 },
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
    label: 'Seção Militar',
    items: [
      { path: '/forcas-armadas',       label: 'Forças Armadas do Mundo', icon: '🌍', phase: 1 },
      { path: '/orcamentos-militares', label: 'Orçamentos Militares',    icon: '📊', phase: 1 },
      { path: '/poder-militar',        label: 'Rankings de Poder',       icon: '🏅', phase: 1 },
      { path: '/arsenal-expandido',    label: 'Arsenal Expandido',       icon: '⚔', phase: 1 },
      { path: '/forcas-especiais',     label: 'Forças Especiais',        icon: '🪖', phase: 1 },
      { path: '/organizacao-militar',  label: 'Organização Militar',     icon: '⚙', phase: 1 },
      { path: '/tecnologia-militar',   label: 'Tecnologia Militar',      icon: '🚀', phase: 1 },
      { path: '/taticas-estrategias',  label: 'Táticas & Estratégias',   icon: '🗺', phase: 1 },
      { path: '/historia-militar',     label: 'História Militar',        icon: '📜', phase: 1 },
      { path: '/armas-por-pais',       label: 'Armas por País',          icon: '🔫', phase: 1 },
      { path: '/guerras-conflitos',    label: 'Guerras & Conflitos',     icon: '🌐', phase: 1 },
      { path: '/batalhas-historicas',  label: 'Batalhas Históricas',     icon: '🔰', phase: 1 },
      { path: '/enciclopedia-militar', label: 'Enciclopédia Militar',    icon: '🎖', phase: 1 }
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
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙', phase: 1 }
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
      color: '#00f0ff', border: '1px solid rgba(0,240,255,0.35)',
      background: 'linear-gradient(90deg, rgba(0,240,255,0.16), rgba(0,240,255,0.02))'
    },
    onclick: () => promptInstall()
  }, '⬇ Instalar app');
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
      installBtn,
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
