/**
 * Home — Ponte de Comando "Command Deck".
 *
 * Implementação canônica TypeScript da primeira pintura do Baluarte. A página
 * continua leve, respeita prefers-reduced-motion e libera efeitos ao sair da
 * rota; os motores visuais e integrações remotas permanecem atrás de contratos
 * declarados enquanto a migração incremental avança.
 */

import { h } from '../utils/helpers.js';
import { lineIcon, iconForPath } from '../utils/icons.js';
import { attachSpotlight, attachTilt } from '../utils/effects.js';
import { router } from '../core/router.js';
import type { RouteArgs } from '../core/router.js';
import { appState } from '../core/state.js';
import { createHeroWebGL, heroSkinColors } from '../utils/hero-webgl.js';
import type { HeroEffect } from '../utils/hero-webgl.js';
import { createHeroField } from '../utils/hero3d.js';
import type { HeroFieldEffect } from '../utils/hero3d.js';
import { countVisit } from '../utils/visit-counter';
import { readPageViews } from '../utils/page-views';
import { mountSpline } from '../utils/spline-embed.js';
import { sceneFor } from '../data/spline-scenes.js';
import { ARSENAL, TOTAL as ARSENAL_TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL, CHAPTERS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS, TOTAL_UNIVERSOS } from '../data/universos.js';
import { VERSION } from '../data/version.js';

const REDUCED = typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

type CleanupFn = () => void;
type HeroAnimation = HeroEffect | HeroFieldEffect;
export type HomePageArgs = Pick<RouteArgs, 'query'>;

type ShelfCard = HTMLDivElement;

/* Eyebrow de célula com ícone de linha (set único — Design System §4). */
const cellTag = (icon: string, text: string): HTMLDivElement =>
  h('div', { className: 'hv2-cell__tag' },
    h('span', { className: 'hv2-cell__tag-ico', html: lineIcon(icon) }), text);

/* Ícone de linha inline pra botão/título (herda a cor do contexto). */
const btnIco = (icon: string): HTMLSpanElement =>
  h('span', { className: 'hv2-btn__ico', html: lineIcon(icon) });

function countUp(el: HTMLElement, target: number, onCleanup: (fn: CleanupFn) => void): void {
  if (REDUCED) {
    el.textContent = String(target);
    return;
  }

  const duration = 1100;
  const startedAt = performance.now();
  let raf = 0;
  const step = (time: number): void => {
    const progress = Math.min(1, (time - startedAt) / duration);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
    if (progress < 1) raf = requestAnimationFrame(step);
  };

  raf = requestAnimationFrame(step);
  onCleanup(() => {
    if (raf) cancelAnimationFrame(raf);
  });
}

/* ===== Hero ===== */
function buildHero(
  onCleanup: (fn: CleanupFn) => void,
  operador: string,
  sceneUrl: string,
): HTMLDivElement {
  const canvas = h('canvas', { className: 'hv2-hero__canvas' });
  const clock = h('span', { className: 'hv2-hud__clock' }, '--:--:--');
  const tick = (): void => {
    clock.textContent = new Date().toLocaleTimeString('pt-BR');
  };
  tick();
  if (!REDUCED) {
    const timer = setInterval(tick, 1000);
    onCleanup(() => clearInterval(timer));
  }

  const inner = h('div', { className: 'hv2-hero__inner' },
    h('div', { className: 'hv2-kicker fx-shiny' }, 'NÚCLEO INFINITY DREADNOUGHT · ONLINE'),
    h('h1', { className: 'hv2-title' },
      h('span', { className: 'hv2-title__main' }, 'BALUARTE'),
      h('span', { className: 'hv2-title__sub' }, 'MARK XIII')),
    h('div', { className: 'hv2-divider', 'aria-hidden': 'true' },
      h('span', { className: 'hv2-divider__line' }),
      h('span', { className: 'hv2-divider__star' }, '✦'),
      h('span', { className: 'hv2-divider__line hv2-divider__line--r' })),
    h('p', { className: 'hv2-tagline' },
      'Bem-vindo, operador ', h('span', { className: 'u-text-cyan' }, operador),
      '. A ponte de comando da plataforma — narrativa, tática e ferramentas, ',
      'onde os deuses sangram.'),
    h('div', { className: 'hv2-cta' },
      h('button', {
        className: 'hv2-btn hv2-btn--primary',
        onclick: () => router.navigate('/ferramentas')
      }, btnIco('gear'), 'Hub de Ferramentas'),
      h('button', {
        className: 'hv2-btn hv2-btn--app',
        onclick: () => router.navigate('/baixar')
      }, btnIco('download'), 'Baixar o app'),
      h('button', {
        className: 'hv2-btn',
        onclick: () => router.navigate('/git-nexus')
      }, btnIco('nexus'), 'Núcleo de IA')));

  /* Camada Spline opcional: o hero nativo continua sendo o fallback. */
  const splineWrap = h('div', {
    className: 'hv2-hero__spline',
    'aria-hidden': 'true'
  });

  const corner = (position: string): HTMLSpanElement =>
    h('span', {
      className: `hv2-corner hv2-corner--${position}`,
      'aria-hidden': 'true'
    });

  const hero = h('div', { className: 'hv2-hero' },
    canvas,
    h('div', { className: 'hv2-hero__rays', 'aria-hidden': 'true' }),
    h('div', { className: 'hv2-hero__grid' }),
    h('div', { className: 'hv2-hero__scan' }),
    splineWrap,
    corner('tl'), corner('tr'), corner('bl'), corner('br'),
    h('div', { className: 'hv2-hud' },
      h('div', { className: 'hv2-hud__tl' }, '◯ MARK XIII · v' + VERSION),
      h('div', { className: 'hv2-hud__tr' },
        clock,
        h('div', null,
          h('span', { className: 'hv2-hud__dot' }, '● '),
          'NÚCLEO ONLINE')),
      h('div', { className: 'hv2-hud__bl' }, 'LAT —.—— · LON —.——'),
      h('div', { className: 'hv2-hud__br' }, '● NÚCLEO 3D · WEBGL · NÍVEL ÔMEGA')),
    inner);

  let effect: HeroAnimation | null = createHeroWebGL(canvas, { variant: 'astrolabe' });
  if (!effect) effect = createHeroField(canvas, heroSkinColors());
  effect.start();
  onCleanup(() => effect?.destroy());

  if (sceneUrl) {
    const spline = mountSpline(splineWrap, sceneUrl, {
      onReady: () => hero.classList.add('has-spline'),
      onFail: () => hero.classList.remove('has-spline')
    });
    onCleanup(() => spline.destroy());
  }

  if (!REDUCED) {
    const onMove = (event: PointerEvent): void => {
      const rect = hero.getBoundingClientRect();
      effect?.setPointer(
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
      );
    };
    hero.addEventListener('pointermove', onMove);
    onCleanup(() => hero.removeEventListener('pointermove', onMove));
  }

  return hero;
}

/* ===== Bento ===== */
function metricCell(onCleanup: (fn: CleanupFn) => void): HTMLDivElement {
  const metrics: ReadonlyArray<readonly [number, string, string]> = [
    [ARSENAL_TOTAL, 'Arsenal', '/arsenal'],
    [TOTAL_EQUIPES, 'Equipes', '/elites'],
    [ARCS_TOTAL, 'Arcos', '/biblioteca'],
    [CHAPTERS_TOTAL, 'Capítulos', '/biblioteca'],
    [TOTAL_UNIVERSOS, 'Universos', '/universo'],
    [187, 'Módulos', '/git-nexus']
  ];
  const grid = h('div', { className: 'hv2-metrics__grid' });
  metrics.forEach(([value, label, path]) => {
    const number = h('div', {
      className: 'hv2-metric__v',
      onclick: () => router.navigate(path)
    }, '0');
    countUp(number, value, onCleanup);
    grid.append(
      h('div', { className: 'hv2-metric' },
        number,
        h('div', { className: 'hv2-metric__l' }, label)),
    );
  });

  return h('div', { className: 'hv2-cell hv2-cell--metrics' },
    cellTag('chart', 'Status operacional'),
    h('h3', { className: 'hv2-cell__title' }, 'O Baluarte em números'),
    h('p', { className: 'hv2-cell__desc' },
      'Conteúdo real, vivo e navegável — clique num número pra mergulhar.'),
    grid);
}

function buildBento(onCleanup: (fn: CleanupFn) => void): HTMLElement {
  const arco = ARCS[0];
  const equipe = EQUIPES[0];
  const vigilancia: ReadonlyArray<readonly [string, string]> = [
    ['NÚCLEO', `Mark XIII estável · v${VERSION}`],
    ['JARVIS', 'online — local/servidor/Claude'],
    ['NEXUS', 'grafo de código + ML'],
    ['PWA', 'service worker — offline ok']
  ];
  const tiles: ReadonlyArray<readonly [string, string]> = [
    ['Núcleo de IA', '/git-nexus'], ['Ferramentas', '/ferramentas'],
    ['Editor', '/editor'], ['Biblioteca', '/biblioteca'],
    ['Arsenal', '/arsenal'], ['Universo', '/universo'],
    ['Câmbio', '/dolar'], ['Sobre', '/sobre']
  ];

  const visitsMessage = h('span', { className: 'hv2-vig__msg' }, '…');
  const visitsLine = h('div', {
    className: 'hv2-vig',
    style: { display: 'none' }
  },
    h('span', { className: 'hv2-vig__dot' }),
    h('span', { className: 'hv2-vig__tag' }, 'ACESSOS'),
    visitsMessage);
  countVisit().then((count) => {
    if (count == null) return;
    visitsMessage.textContent = `${count.toLocaleString('pt-BR')} visitas ao Baluarte`;
    visitsLine.style.display = '';
  });

  const viewsMessage = h('span', { className: 'hv2-vig__msg' }, '…');
  const viewsLine = h('div', {
    className: 'hv2-vig',
    style: { display: 'none' }
  },
    h('span', { className: 'hv2-vig__dot' }),
    h('span', { className: 'hv2-vig__tag' }, 'PÁGINAS'),
    viewsMessage);
  readPageViews(1).then((result) => {
    if (!result || !result.total) return;
    const top = result.top[0];
    viewsMessage.textContent = `${result.total.toLocaleString('pt-BR')} páginas vistas` +
      (top ? ` · top ${top.route}` : '');
    viewsLine.style.display = '';
  });

  const section = h('section', { className: 'hv2-bento' },
    metricCell(onCleanup),
    h('div', {
      className: 'hv2-cell hv2-cell--ai hv2-cell--link',
      onclick: () => router.navigate('/git-nexus')
    },
      h('div', { className: 'hv2-orb', 'aria-hidden': 'true' }),
      cellTag('nexus', 'Núcleo de IA'),
      h('h3', { className: 'hv2-cell__title' }, 'JARVIS, grafo & memória — num cockpit'),
      h('p', { className: 'hv2-cell__desc' },
        'Git Nexus + J.A.R.V.I.S. + Segundo Cérebro + ML, unificados. O cérebro do Baluarte.'),
      h('div', { className: 'hv2-cell__cta' }, 'abrir o Núcleo →')),
    h('div', {
      className: 'hv2-cell hv2-cell--app hv2-cell--mag hv2-cell--link',
      onclick: () => router.navigate('/baixar')
    },
      cellTag('download', 'Baluarte Launcher'),
      h('h3', { className: 'hv2-cell__title' }, 'Baixe o app desktop'),
      h('p', { className: 'hv2-cell__desc' },
        'A experiência completa: 3D pesado, IA e motor real, sem as travas do navegador.'),
      h('div', { className: 'hv2-cell__os' },
        h('span', null, '🪟'), h('span', null, '🍎'), h('span', null, '🐧'))),
    h('div', { className: 'hv2-cell hv2-cell--wide' },
      cellTag('eye', 'Vigilância · ao vivo'),
      ...vigilancia.map(([tag, message]) =>
        h('div', { className: 'hv2-vig' },
          h('span', { className: 'hv2-vig__dot' }),
          h('span', { className: 'hv2-vig__tag' }, tag),
          h('span', { className: 'hv2-vig__msg' }, message))),
      visitsLine,
      viewsLine),
    h('div', {
      className: 'hv2-cell hv2-cell--link',
      onclick: () => router.navigate('/biblioteca')
    },
      cellTag('book', 'Crônica em destaque'),
      h('h3', { className: 'hv2-cell__title' }, arco?.title || 'Onde os Deuses Sangram'),
      h('p', { className: 'hv2-cell__desc' },
        (arco?.synopsis || 'As Crônicas da Baluarte.').slice(0, 110))),
    h('div', {
      className: 'hv2-cell hv2-cell--link',
      style: { '--accent': equipe?.color || '#d4a24e' },
      onclick: () => router.navigate('/elites')
    },
      cellTag('diamond', 'Equipe em destaque'),
      h('h3', { className: 'hv2-cell__title' }, equipe?.name || 'Esquadrão ALFA'),
      h('p', { className: 'hv2-cell__desc' },
        equipe?.specialty || 'Esquadrões de elite do alfabeto OTAN.')),
    h('div', { className: 'hv2-cell hv2-cell--wide' },
      cellTag('grid', 'Acesso rápido'),
      h('div', { className: 'hv2-tiles' },
        ...tiles.map(([label, path]) => h(
          'button',
          {
            className: 'hv2-tile',
            onclick: () => router.navigate(path)
          },
          h('span', { className: 'hv2-tile__icon', html: iconForPath(path) }),
          h('span', { className: 'hv2-tile__label' }, label),
        )))
    ),
  );

  /* Spotlight que segue o cursor nas células do bento. */
  section.querySelectorAll<HTMLElement>('.hv2-cell').forEach((cell) =>
    onCleanup(attachSpotlight(cell)));
  return section;
}

/* ===== Prateleiras ===== */
function shelf(
  icon: string,
  title: string,
  cards: readonly ShelfCard[],
  morePath: string,
): HTMLElement {
  return h('section', { className: 'hv2-shelf' },
    h('div', { className: 'hv2-shelf__head' },
      h('h2', { className: 'hv2-shelf__title' },
        h('span', { className: 'hv2-shelf__ico', html: lineIcon(icon) }), title),
      morePath && h('button', {
        className: 'hv2-shelf__more',
        onclick: () => router.navigate(morePath)
      }, 'ver tudo →')),
    h('div', { className: 'hv2-track' }, ...cards));
}

const scard = (
  category: string,
  name: string,
  meta: string,
  path: string,
): ShelfCard => h('div', {
  className: 'hv2-scard',
  onclick: () => router.navigate(path)
},
  h('div', { className: 'hv2-scard__cat' }, category),
  h('div', { className: 'hv2-scard__name' }, name),
  h('div', { className: 'hv2-scard__meta' }, meta));

/* ===== Página ===== */
export function homePage(args: HomePageArgs): HTMLDivElement {
  const cleanups: CleanupFn[] = [];
  const onCleanup = (fn: CleanupFn): void => {
    cleanups.push(fn);
  };
  const operador = appState.get('user').name || 'Operador';
  const sceneUrl = args.query?.spline ? sceneFor('home', args.query) : '';

  const page = h('div', { className: 'page-home2' });
  page.appendChild(buildHero(onCleanup, operador, sceneUrl));
  page.appendChild(buildBento(onCleanup));
  page.appendChild(shelf(
    'crosshair',
    'Arsenal em destaque',
    ARSENAL.slice(0, 12).map((item) =>
      scard(
        (item.category || '').toUpperCase(),
        item.name,
        [item.origin, item.year].filter(Boolean).join(' · '),
        '/arsenal',
      )),
    '/arsenal',
  ));
  page.appendChild(shelf(
    'star',
    'Universos',
    UNIVERSOS.slice(0, 12).map((universe) =>
      scard('UNIVERSO', universe.name, universe.tagline || '', '/universo')),
    '/universo',
  ));
  page.appendChild(shelf(
    'book',
    'Crônicas',
    ARCS.slice(0, 12).map((arc) =>
      scard(
        arc.universe || 'CRÔNICAS',
        arc.title,
        (arc.synopsis || '').slice(0, 80),
        '/biblioteca',
      )),
    '/biblioteca',
  ));

  /* Inclinação 3D que segue o cursor nos cards das prateleiras. */
  page.querySelectorAll<HTMLElement>('.hv2-scard').forEach((card) =>
    onCleanup(attachTilt(card)));

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!document.contains(page)) {
        cleanups.splice(0).forEach((cleanup) => {
          try {
            cleanup();
          } catch {
            /* Uma limpeza isolada não deve impedir as demais. */
          }
        });
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
