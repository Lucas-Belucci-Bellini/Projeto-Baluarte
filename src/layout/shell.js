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
import { pinElement } from './overlay.js';
import { revealScan } from '../utils/scroll-reveal.js';
import { mountAtmosphere } from '../utils/atmosphere.js';
import { mountCardSpotlight } from '../utils/card-spotlight.js';
import { mountScrollProgress } from '../utils/scroll-progress.js';

let mainInner = null;
let shellRefs = null;

export function mountShell(rootEl) {
  empty(rootEl);

  mountAtmosphere(rootEl);               // fundo imersivo único, atrás de todo o app (#246)
  mountCardSpotlight(rootEl);            // brilho radial que segue o cursor nos cards (#246)

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
  mountScrollProgress();                 // barra de progresso de leitura no topo (#246)
  wireSidebar(shellRefs);
  bus.on('page:pin', pinCurrentPage);

  return shellRefs;
}

/**
 * Renderiza uma página (HTMLElement) na área principal.
 * É o ponto único de troca de tela: o router emite 'route:change' (ver main.js)
 * e o shell chama isto. A página anterior é destruída ao trocar o conteúdo.
 */
export function renderPage(pageEl, route) {
  if (!mainInner) return;
  mount(mainInner, pageEl);              // troca o conteúdo do <main> (descarta a página antiga)
  if (pageEl && pageEl.classList) pageEl.classList.add('route-enter'); // transição de entrada (#246)
  revealScan(pageEl, route);             // anima os blocos entrando na viewport (scroll-reveal)
  if (route) {
    updateActiveNav(route);              // realça o item ativo na sidebar
    document.title = pageTitleForRoute(route) + ' · Baluarte';
    appState.set({ route });             // publica a rota atual no store global
    setCurrentFunction(route);           // atualiza o status do site (HUD/JARVIS)
    mainInner.scrollTop = 0;             // volta ao topo na navegação
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
    '/batalha-naval': 'Batalha Naval',
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
    '/enciclopedia-militar': 'Enciclopédia Militar',
    '/codigo': 'Raio-X do Código',
    '/projetos': 'Projetos',
    '/mural': 'Mural do Baluarte',
    '/cerebro': 'Segundo Cérebro',
    '/memoria': 'Memória do JARVIS',
    '/terminal-ia': 'Terminal-IA',
    '/seguranca': 'Segurança do Agente',
    '/gerar-codigo': 'Gerador de Código',
    '/conselho': 'Conselho de IAs',
    '/ocr': 'Leitor OCR',
    '/sobre': 'Sobre o Projeto'
  };
  return map[path] || 'Mark XIII';
}

export function getShellRefs() {
  return shellRefs;
}

/**
 * "Sobrepor": move a página atual para uma janela flutuante que sobrevive à
 * navegação (mantém áudio/estado rodando). Deixa um aviso na área principal.
 */
export function pinCurrentPage() {
  if (!mainInner) return false;
  const pageEl = mainInner.firstElementChild;
  if (!pageEl || pageEl.classList.contains('pin-placeholder')) return false;
  const route = appState.get('route');
  const title = pageTitleForRoute(route);
  pinElement(pageEl, title);
  mount(mainInner, h('div', { className: 'pin-placeholder' },
    h('div', { className: 'pin-placeholder__icon' }, '📌'),
    h('div', null, `"${title}" está sobreposta e continua rodando.`),
    h('p', { className: 'u-text-muted', style: { fontSize: '13px', marginTop: '6px' } },
      'Navegue à vontade — a janela flutuante segue ativa. Arraste pelo topo; feche pelo ✕.')));
  return true;
}
