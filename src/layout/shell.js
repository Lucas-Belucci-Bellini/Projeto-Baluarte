/**
 * Shell — monta o layout principal (sidebar + header + main)
 * e gerencia a renderização das páginas.
 */

import { h, mount, empty } from '../utils/helpers.js';
import { renderHeader } from './header.js';
import { renderSidebar, wireSidebar, updateActiveNav } from './sidebar.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';

let mainInner = null;
let shellRefs = null;

export function mountShell(rootEl) {
  empty(rootEl);

  mainInner = h('div', { className: 'main__inner' });
  const main = h('main', { className: 'main', id: 'main', role: 'main' }, mainInner);

  const sidebar = renderSidebar();
  const header = renderHeader();
  const overlay = h('div', {
    className: 'sidebar-overlay',
    onclick: () => bus.emit('sidebar:close-mobile')
  });

  const shell = h(
    'div',
    {
      className: appState.get('sidebarCollapsed') ? 'shell is-collapsed' : 'shell'
    },
    sidebar,
    header,
    main
  );

  rootEl.appendChild(shell);
  rootEl.appendChild(overlay);

  shellRefs = { shell, sidebar, header, main, overlay };
  wireSidebar(shellRefs);

  return shellRefs;
}

/** Renderiza uma página (HTMLElement) na área principal. */
export function renderPage(pageEl, route) {
  if (!mainInner) return;
  mount(mainInner, pageEl);
  if (route) {
    updateActiveNav(route);
    document.title = pageTitleForRoute(route) + ' · Baluarte';
    appState.set({ route });
    mainInner.scrollTop = 0;
  }
}

function pageTitleForRoute(path) {
  const map = {
    '/home': 'Ponte de Comando',
    '/ferramentas': 'Hub de Ferramentas',
    '/editor': 'Editor de Código',
    '/terminal': 'Terminal',
    '/calculadoras': 'Calculadoras',
    '/calc-cientifica': 'Calculadora Científica',
    '/calc-numerica': 'Calculadora Numérica',
    '/tabela-verdade': 'Tabela Verdade',
    '/cripto': 'Lab de Criptografia',
    '/regex': 'Lab de Regex',
    '/graficos': 'Gerador de Gráficos',
    '/simbolos': 'Hub de Símbolos',
    '/logic-sim': 'Simulador de Lógica',
    '/portas': 'Enciclopédia de Lógica Digital',
    '/morse': 'Gerador de Código Morse',
    '/memes': 'Arquivo de Memes 2016',
    '/biblioteca': 'Biblioteca',
    '/academia': 'Academia',
    '/universo': 'Universo',
    '/tabela-periodica': 'Tabela Periódica',
    '/modpack': 'Modpack Minecraft',
    '/guia-pc': 'Guia para Montar PC',
    '/fft': 'Visualizador FFT',
    '/media': 'Media Hub',
    '/videos': 'Central de Vídeos',
    '/elites': 'Elites',
    '/arsenal': 'Arsenal',
    '/ciberseg': 'CiberSeg',
    '/economia': 'Economia',
    '/jarvis': 'J.A.R.V.I.S.',
    '/ia-proprietaria': 'IA Proprietária Mark 11',
    '/perfil': 'Perfil',
    '/sobre': 'Sobre o Projeto'
  };
  return map[path] || 'Mark XIII';
}

export function getShellRefs() {
  return shellRefs;
}
