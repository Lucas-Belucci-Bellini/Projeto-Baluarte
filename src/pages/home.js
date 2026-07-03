/**
 * Home — Ponte de Comando "Command Deck" (redesign novo #246/#195, aprovado).
 * Hero com título holográfico animado sobre fundo HUD (grid + scanline + colchetes)
 * + grid BENTO (métricas, Núcleo de IA, baixar app, vigilância, destaques, acesso
 * rápido) + prateleiras com scroll-snap. Leve: CSS/canvas + herói WebGL reusado,
 * JS puro. Respeita prefers-reduced-motion e limpa rAF/observers ao trocar de rota.
 */

import { h } from '../utils/helpers.js';
import { lineIcon, iconForPath } from '../utils/icons.js';
import { attachSpotlight, attachTilt } from '../utils/effects.js';
import { router } from '../core/router.js';
import { appState } from '../core/state.js';
import { createHeroWebGL, heroSkinColors } from '../utils/hero-webgl.js';
import { createHeroField } from '../utils/hero3d.js';
import { countVisit } from '../utils/visit-counter.js';
import { readPageViews } from '../utils/page-views.js';
import { mountSpline } from '../utils/spline-embed.js';
import { sceneFor } from '../data/spline-scenes.js';
import { ARSENAL, TOTAL as ARSENAL_TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL, CHAPTERS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS, TOTAL_UNIVERSOS } from '../data/universos.js';
import { VERSION } from '../data/version.js';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Eyebrow de célula com ícone de linha (set único — Design System §4). */
const cellTag = (icon, text) => h('div', { className: 'hv2-cell__tag' },
  h('span', { className: 'hv2-cell__tag-ico', html: lineIcon(icon) }), text);
/* Ícone de linha inline pra botão/título (herda a cor do contexto). */
const btnIco = (icon) => h('span', { className: 'hv2-btn__ico', html: lineIcon(icon) });

function countUp(el, target, onCleanup) {
  if (REDUCED) { el.textContent = String(target); return; }
  const dur = 1100, t0 = performance.now();
  let raf = 0;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  onCleanup(() => { if (raf) cancelAnimationFrame(raf); });
}

/* ===== Hero ===== */
function buildHero(onCleanup, operador, sceneUrl) {
  const canvas = h('canvas', { className: 'hv2-hero__canvas' });
  const clock = h('span', { className: 'hv2-hud__clock' }, '--:--:--');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('pt-BR'); };
  tick();
  if (!REDUCED) { const t = setInterval(tick, 1000); onCleanup(() => clearInterval(t)); }

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
      h('button', { className: 'hv2-btn hv2-btn--primary', onclick: () => router.navigate('/ferramentas') }, btnIco('gear'), 'Hub de Ferramentas'),
      h('button', { className: 'hv2-btn hv2-btn--app', onclick: () => router.navigate('/baixar') }, btnIco('download'), 'Baixar o app'),
      h('button', { className: 'hv2-btn', onclick: () => router.navigate('/git-nexus') }, btnIco('nexus'), 'Núcleo de IA')));

  /* camada Spline (cena 3D rica) — entra por cima do herói WebGL quando há cena
   * configurada/passada; no sucesso some o canvas/grid; na falta/falha fica o herói. */
  const splineWrap = h('div', { className: 'hv2-hero__spline', 'aria-hidden': 'true' });

  const corner = (pos) => h('span', { className: `hv2-corner hv2-corner--${pos}`, 'aria-hidden': 'true' });
  const hero = h('div', { className: 'hv2-hero' },
    canvas,
    h('div', { className: 'hv2-hero__rays', 'aria-hidden': 'true' }),
    h('div', { className: 'hv2-hero__grid' }),
    h('div', { className: 'hv2-hero__scan' }),
    splineWrap,
    corner('tl'), corner('tr'), corner('bl'), corner('br'),
    h('div', { className: 'hv2-hud' },
      h('div', { className: 'hv2-hud__tl' }, '◯ MARK XIII · v' + VERSION),
      h('div', { className: 'hv2-hud__tr' }, clock, h('div', null, h('span', { className: 'hv2-hud__dot' }, '● '), 'NÚCLEO ONLINE')),
      h('div', { className: 'hv2-hud__bl' }, 'LAT —.—— · LON —.——'),
      h('div', { className: 'hv2-hud__br' }, '● NÚCLEO 3D · WEBGL · NÍVEL ÔMEGA')),
    inner);

  /* astrolábio de fábula (mockup V2) — segue o tema/universo ativo (#246) */
  let fx = createHeroWebGL(canvas, { variant: 'astrolabe' });
  if (!fx) fx = createHeroField(canvas, heroSkinColors());
  fx.start();
  onCleanup(() => fx.destroy());

  /* cena Spline por cima (se houver) — herói WebGL fica de fallback */
  if (sceneUrl) {
    const sp = mountSpline(splineWrap, sceneUrl, {
      onReady: () => hero.classList.add('has-spline'),
      onFail: () => hero.classList.remove('has-spline')
    });
    onCleanup(() => sp.destroy());
  }

  if (!REDUCED) {
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      fx.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    hero.addEventListener('pointermove', onMove);
    onCleanup(() => hero.removeEventListener('pointermove', onMove));
  }
  return hero;
}

/* ===== Bento ===== */
function metricCell(onCleanup) {
  const metrics = [
    [ARSENAL_TOTAL, 'Arsenal', '/arsenal'],
    [TOTAL_EQUIPES, 'Equipes', '/elites'],
    [ARCS_TOTAL, 'Arcos', '/biblioteca'],
    [CHAPTERS_TOTAL, 'Capítulos', '/biblioteca'],
    [TOTAL_UNIVERSOS, 'Universos', '/universo'],
    [187, 'Módulos', '/git-nexus']
  ];
  const grid = h('div', { className: 'hv2-metrics__grid' });
  metrics.forEach(([v, l, path]) => {
    const num = h('div', { className: 'hv2-metric__v', onclick: () => router.navigate(path) }, '0');
    countUp(num, v, onCleanup);
    grid.append(h('div', { className: 'hv2-metric' }, num, h('div', { className: 'hv2-metric__l' }, l)));
  });
  return h('div', { className: 'hv2-cell hv2-cell--metrics' },
    cellTag('chart', 'Status operacional'),
    h('h3', { className: 'hv2-cell__title' }, 'O Baluarte em números'),
    h('p', { className: 'hv2-cell__desc' }, 'Conteúdo real, vivo e navegável — clique num número pra mergulhar.'),
    grid);
}

function buildBento(onCleanup) {
  const arco = ARCS[0] || {}; const eq = EQUIPES[0] || {};
  const vig = [
    ['NÚCLEO', `Mark XIII estável · v${VERSION}`],
    ['JARVIS', 'online — local/servidor/Claude'],
    ['NEXUS', 'grafo de código + ML'],
    ['PWA', 'service worker — offline ok']
  ];
  const tiles = [
    ['Núcleo de IA', '/git-nexus'], ['Ferramentas', '/ferramentas'],
    ['Editor', '/editor'], ['Biblioteca', '/biblioteca'],
    ['Arsenal', '/arsenal'], ['Universo', '/universo'],
    ['Câmbio', '/dolar'], ['Sobre', '/sobre']
  ];

  // Contador de acessos ao vivo (gravado no Supabase). Só aparece se vier número
  // — se o banco não estiver configurado/aplicado, a linha fica oculta (sem erro).
  const acessosMsg = h('span', { className: 'hv2-vig__msg' }, '…');
  const acessosLine = h('div', { className: 'hv2-vig', style: { display: 'none' } },
    h('span', { className: 'hv2-vig__dot' }),
    h('span', { className: 'hv2-vig__tag' }, 'ACESSOS'),
    acessosMsg);
  countVisit().then((n) => {
    if (n == null) return;
    acessosMsg.textContent = `${n.toLocaleString('pt-BR')} visitas ao Baluarte`;
    acessosLine.style.display = '';
  });

  // Views por página (métrica real no banco). Mostra total + a rota mais vista.
  const viewsMsg = h('span', { className: 'hv2-vig__msg' }, '…');
  const viewsLine = h('div', { className: 'hv2-vig', style: { display: 'none' } },
    h('span', { className: 'hv2-vig__dot' }),
    h('span', { className: 'hv2-vig__tag' }, 'PÁGINAS'),
    viewsMsg);
  readPageViews(1).then((res) => {
    if (!res || !res.total) return;
    const top = res.top && res.top[0];
    viewsMsg.textContent = `${res.total.toLocaleString('pt-BR')} páginas vistas`
      + (top ? ` · top ${top.route}` : '');
    viewsLine.style.display = '';
  });

  const section = h('section', { className: 'hv2-bento' },
    metricCell(onCleanup),
    h('div', { className: 'hv2-cell hv2-cell--ai hv2-cell--link', onclick: () => router.navigate('/git-nexus') },
      h('div', { className: 'hv2-orb', 'aria-hidden': 'true' }),
      cellTag('nexus', 'Núcleo de IA'),
      h('h3', { className: 'hv2-cell__title' }, 'JARVIS, grafo & memória — num cockpit'),
      h('p', { className: 'hv2-cell__desc' }, 'Git Nexus + J.A.R.V.I.S. + Segundo Cérebro + ML, unificados. O cérebro do Baluarte.'),
      h('div', { className: 'hv2-cell__cta' }, 'abrir o Núcleo →')),
    h('div', { className: 'hv2-cell hv2-cell--app hv2-cell--mag hv2-cell--link', onclick: () => router.navigate('/baixar') },
      cellTag('download', 'Baluarte Launcher'),
      h('h3', { className: 'hv2-cell__title' }, 'Baixe o app desktop'),
      h('p', { className: 'hv2-cell__desc' }, 'A experiência completa: 3D pesado, IA e motor real, sem as travas do navegador.'),
      h('div', { className: 'hv2-cell__os' }, h('span', null, '🪟'), h('span', null, '🍎'), h('span', null, '🐧'))),
    h('div', { className: 'hv2-cell hv2-cell--wide' },
      cellTag('eye', 'Vigilância · ao vivo'),
      ...vig.map(([t, m]) => h('div', { className: 'hv2-vig' },
        h('span', { className: 'hv2-vig__dot' }), h('span', { className: 'hv2-vig__tag' }, t), h('span', { className: 'hv2-vig__msg' }, m))),
      acessosLine, viewsLine),
    h('div', { className: 'hv2-cell hv2-cell--link', onclick: () => router.navigate('/biblioteca') },
      cellTag('book', 'Crônica em destaque'),
      h('h3', { className: 'hv2-cell__title' }, arco.title || 'Onde os Deuses Sangram'),
      h('p', { className: 'hv2-cell__desc' }, (arco.synopsis || 'As Crônicas da Baluarte.').slice(0, 110))),
    h('div', { className: 'hv2-cell hv2-cell--link', style: { '--accent': eq.color || '#d4a24e' }, onclick: () => router.navigate('/elites') },
      cellTag('diamond', 'Equipe em destaque'),
      h('h3', { className: 'hv2-cell__title' }, eq.name || 'Esquadrão ALFA'),
      h('p', { className: 'hv2-cell__desc' }, eq.specialty || 'Esquadrões de elite do alfabeto OTAN.')),
    h('div', { className: 'hv2-cell hv2-cell--wide' },
      cellTag('grid', 'Acesso rápido'),
      h('div', { className: 'hv2-tiles' },
        ...tiles.map(([label, path]) => h('button', { className: 'hv2-tile', onclick: () => router.navigate(path) },
          h('span', { className: 'hv2-tile__icon', html: iconForPath(path) }), h('span', { className: 'hv2-tile__label' }, label))))));

  /* Spotlight que segue o cursor nas células do bento (porta do react-bits). */
  section.querySelectorAll('.hv2-cell').forEach((cell) => onCleanup(attachSpotlight(cell)));
  return section;
}

/* ===== Prateleiras ===== */
function shelf(icon, title, cards, morePath) {
  return h('section', { className: 'hv2-shelf' },
    h('div', { className: 'hv2-shelf__head' },
      h('h2', { className: 'hv2-shelf__title' },
        h('span', { className: 'hv2-shelf__ico', html: lineIcon(icon) }), title),
      morePath && h('button', { className: 'hv2-shelf__more', onclick: () => router.navigate(morePath) }, 'ver tudo →')),
    h('div', { className: 'hv2-track' }, ...cards));
}
const scard = (cat, name, meta, path) => h('div', { className: 'hv2-scard', onclick: () => router.navigate(path) },
  h('div', { className: 'hv2-scard__cat' }, cat),
  h('div', { className: 'hv2-scard__name' }, name),
  h('div', { className: 'hv2-scard__meta' }, meta));

/* ===== Página ===== */
export function homePage(args) {
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  const operador = (appState.get('user') || { name: 'Operador' }).name;
  /* O herói do home agora é o ASTROLÁBIO 3D nativo (mockup Fable 5 V2) — a cena
   * Spline só entra se pedida explicitamente por ?spline=URL (debug/preview). */
  const sceneUrl = args && args.query && args.query.spline
    ? sceneFor('home', args.query) : '';

  const page = h('div', { className: 'page-home2' });
  page.appendChild(buildHero(onCleanup, operador, sceneUrl));
  page.appendChild(buildBento(onCleanup));
  page.appendChild(shelf('crosshair', 'Arsenal em destaque', ARSENAL.slice(0, 12).map((it) =>
    scard((it.category || '').toUpperCase(), it.name, [it.origin, it.year].filter(Boolean).join(' · '), '/arsenal')), '/arsenal'));
  page.appendChild(shelf('star', 'Universos', UNIVERSOS.slice(0, 12).map((u) =>
    scard('UNIVERSO', u.name, u.tagline || '', '/universo')), '/universo'));
  page.appendChild(shelf('book', 'Crônicas', ARCS.slice(0, 12).map((a) =>
    scard(a.universe || 'CRÔNICAS', a.title, (a.synopsis || '').slice(0, 80), '/biblioteca')), '/biblioteca'));

  /* Inclinação 3D que segue o cursor nos cards das prateleiras (porta do react-bits). */
  page.querySelectorAll('.hv2-scard').forEach((c) => onCleanup(attachTilt(c)));

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  return page;
}
