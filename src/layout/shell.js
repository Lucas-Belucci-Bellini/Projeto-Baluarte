/**
 * Shell — monta o layout principal (sidebar + header + main)
 * e gerencia a renderização das páginas.
 */

import { h, mount, empty } from '../utils/helpers.js';
import { renderHeader } from './header.js';
import { renderSidebar, wireSidebar, updateActiveNav } from './sidebar.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';
import { setCurrentFunction } from '../utils/baluarte-status.js';

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
    setCurrentFunction(route);
    mainInner.scrollTop = 0;
  }
}

function pageTitleForRoute(path) {
  const map = {
    '/home': 'Ponte de Comando',
    '/ferramentas': 'Hub de Ferramentas',
    '/editor': 'Editor de Código',
    '/json-studio': 'JSON Studio',
    '/qr-studio': 'QR Code Studio',
    '/git-helper': 'Git Helper',
    '/utilidades': 'Caixa de Ferramentas',
    '/terminal': 'Terminal',
    '/calculadoras': 'Calculadoras',
    '/calc-cientifica': 'Calculadora Científica',
    '/calc-numerica': 'Calculadora Numérica',
    '/tabela-verdade': 'Tabela Verdade',
    '/cripto': 'Lab de Criptografia',
    '/esteganografia': 'Esteganografia',
    '/regex': 'Lab de Regex',
    '/graficos': 'Gerador de Gráficos',
    '/simbolos': 'Hub de Símbolos',
    '/color-studio': 'Color Studio',
    '/logic-sim': 'Simulador de Lógica',
    '/portas': 'Enciclopédia de Lógica Digital',
    '/morse': 'Gerador de Código Morse',
    '/memes': 'Arquivo de Memes 2016',
    '/filmes': 'Cinema do Baluarte',
    '/biblioteca': 'Biblioteca',
    '/academia': 'Academia',
    '/jogos': 'Jogos de Aprendizado',
    '/robotica': 'Currículo de Robótica',
    '/universo': 'Universo',
    '/tabela-periodica': 'Tabela Periódica',
    '/modpack': 'Modpack Minecraft',
    '/guia-pc': 'Guia para Montar PC',
    '/fft': 'Visualizador FFT',
    '/radio': 'Rádio de Frequências',
    '/musicas': 'Central de Música',
    '/media': 'Media Hub',
    '/videos': 'Central de Vídeos',
    '/tv': 'TV do Baluarte',
    '/elites': 'Elites',
    '/dossie': 'Dossiê',
    '/arsenal': 'Arsenal',
    '/radar': 'Radar Tático',
    '/ciberseg': 'CiberSeg',
    '/economia': 'Economia',
    '/dolar': 'Radar do Câmbio',
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
