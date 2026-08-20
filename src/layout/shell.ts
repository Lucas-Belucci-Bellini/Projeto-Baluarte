/**
 * Shell — monta o layout principal e gerencia a renderização das páginas.
 *
 * A implementação canônica está em TypeScript. O wrapper `shell.js` preserva
 * a superfície de importação da V1 durante a migração incremental.
 */

import { encerrar } from '../core/ciclo-vida.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';
import { decryptTitles } from '../utils/effects.js';
import { h, empty, mount } from '../utils/helpers.js';
import { revealScan } from '../utils/scroll-reveal';
import { mountAtmosphere } from '../utils/atmosphere';
import { mountCardSpotlight } from '../utils/card-spotlight';
import { mountScrollProgress } from '../utils/scroll-progress';
import { getThemeId, setTheme, THEMES } from '../utils/theme.js';
import { setCurrentFunction } from '../utils/baluarte-status';
import { mountAvisoV2 } from './aviso-v2.js';
import { renderHeader } from './header.js';
import { pinElement } from './overlay.js';
import { renderSidebar, updateActiveNav, wireSidebar } from './sidebar.js';

export interface ShellRefs {
  shell: HTMLElement;
  sidebar: HTMLElement;
  header: HTMLElement;
  main: HTMLElement;
  overlay: HTMLElement;
}

interface FableTheme {
  id: string;
  title: string;
}

const FABLE_PILL: readonly FableTheme[] = [
  { id: 'neon', title: 'Ouro de Fábula' },
  { id: 'rubi', title: 'Rubi Encantado' },
  { id: 'esmeralda', title: 'Esmeralda Ancestral' },
];

let mainInner: HTMLElement | null = null;
let shellRefs: ShellRefs | null = null;
let paginaAtual: HTMLElement | null = null;

function themeIdFromEvent(event: Event): string | null {
  if (!(event instanceof CustomEvent) || event.detail === null) return null;
  if (typeof event.detail !== 'object') return null;
  const detail = event.detail as Record<string, unknown>;
  return typeof detail.id === 'string' ? detail.id : null;
}

function buildThemePill(): HTMLElement {
  const markActive = (root: HTMLElement, id: string): void => {
    root.querySelectorAll('[data-pill-theme]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-pill-theme') === id);
    });
  };

  const pill = h(
    'div',
    { className: 'theme-pill', role: 'group', 'aria-label': 'Tema' },
    h('span', { className: 'theme-pill__label' }, 'TEMA'),
    FABLE_PILL.map(({ id, title }) => {
      const theme = THEMES.find((candidate) => candidate.id === id);
      if (!theme) return null;

      return h('button', {
        className: 'theme-pill__sw',
        'data-pill-theme': id,
        title,
        'aria-label': title,
        style: {
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        },
        onclick: () => {
          setTheme(id);
          markActive(pill, id);
        },
      });
    }),
  );

  markActive(pill, getThemeId());
  document.addEventListener('baluarte:theme', (event) => {
    const id = themeIdFromEvent(event);
    if (id) markActive(pill, id);
  });
  return pill;
}

export function mountShell(rootEl: HTMLElement): ShellRefs {
  empty(rootEl);
  mountAtmosphere(rootEl);
  mountCardSpotlight(rootEl);

  mainInner = h('div', { className: 'main__inner' });
  const main = h(
    'main',
    { className: 'main', id: 'main', role: 'main' },
    mainInner,
  );
  const sidebar = renderSidebar();
  const header = renderHeader();
  const overlay = h('div', {
    className: 'sidebar-overlay',
    onclick: () => bus.emit('sidebar:close-mobile'),
  });
  const shell = h(
    'div',
    {
      className: appState.get('sidebarCollapsed') ? 'shell is-collapsed' : 'shell',
    },
    sidebar,
    header,
    main,
  );

  rootEl.appendChild(shell);
  rootEl.appendChild(overlay);
  rootEl.appendChild(buildThemePill());
  mountAvisoV2(rootEl);

  shellRefs = { shell, sidebar, header, main, overlay };
  mountScrollProgress();
  wireSidebar(shellRefs);
  bus.on('page:pin', pinCurrentPage);
  return shellRefs;
}

export function renderPage(pageEl: HTMLElement | null, route?: string): void {
  if (!mainInner) return;

  encerrar(paginaAtual);
  paginaAtual = pageEl;
  mount(mainInner, pageEl);
  pageEl?.classList.add('route-enter');
  revealScan(pageEl, route);
  decryptTitles(pageEl);

  if (route) {
    updateActiveNav(route);
    document.title = `${pageTitleForRoute(route)} · Baluarte`;
    appState.set({ route });
    setCurrentFunction(route);
    scrollToTop();
  }
}

function scrollToTop(): void {
  const zero = (): void => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Alguns ambientes de teste não implementam rolagem da janela.
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainInner) mainInner.scrollTop = 0;
  };

  zero();
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(zero);
}

function pageTitleForRoute(path: string): string {
  const titles: Record<string, string> = {
    '/home': 'Ponte de Comando',
    '/militar': 'Centro Militar',
    '/modelos-3d': 'Modelos 3D',
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
    '/wiki-arma3': 'Wiki de Arma 3',
    '/vanguard': 'Project Vanguard — computador de tiro',
    '/modpack': 'Modpack Minecraft',
    '/zomboid': 'Modpack Zomboid — coleção Spartan Gamer BR',
    '/zomboid-admin': 'Zomboid — Administração de Servidor',
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
    '/login': 'Entrar / Criar Conta',
    '/diagnostico': 'Diagnóstico do sistema',
    '/enciclopedia-militar': 'Enciclopédia Militar',
    '/codigo': 'Raio-X do Código',
    '/projetos': 'Projetos',
    '/mural': 'Mural do Baluarte',
    '/comms': 'Rede Neural — chat global',
    '/cerebro': 'Segundo Cérebro',
    '/memoria': 'Memória do JARVIS',
    '/terminal-ia': 'Terminal-IA',
    '/seguranca': 'Segurança do Agente',
    '/gerar-codigo': 'Gerador de Código',
    '/conselho': 'Conselho de IAs',
    '/ocr': 'Leitor OCR',
    '/sobre': 'Sobre o Projeto',
  };
  return titles[path] ?? 'Mark XIII';
}

export function getShellRefs(): ShellRefs | null {
  return shellRefs;
}

export function pinCurrentPage(): boolean {
  if (!mainInner) return false;

  const pageEl = mainInner.firstElementChild;
  if (!(pageEl instanceof HTMLElement) || pageEl.classList.contains('pin-placeholder')) {
    return false;
  }

  const route = appState.get('route');
  const title = pageTitleForRoute(route);
  pinElement(pageEl, title);
  mount(
    mainInner,
    h(
      'div',
      { className: 'pin-placeholder' },
      h('div', { className: 'pin-placeholder__icon' }, '📌'),
      h('div', {}, `"${title}" está sobreposta e continua rodando.`),
      h(
        'p',
        {
          className: 'u-text-muted',
          style: { fontSize: '13px', marginTop: '6px' },
        },
        'Navegue à vontade — a janela flutuante segue ativa. Arraste pelo topo; feche pelo ✕.',
      ),
    ),
  );
  return true;
}
