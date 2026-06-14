/**
 * Home — Ponte de Comando (redesign 3D imersivo, promovido a oficial nos
 * issues #195/#196). Substitui a home antiga: herói cinematográfico com campo
 * de partículas 3D + emblema giratório, métricas reais, prateleiras estilo
 * Steam com dados reais, status do sistema (vigilância + infra) no novo visual
 * e acesso rápido.
 *
 * Leve e acessível: respeita prefers-reduced-motion, pausa o canvas com a aba
 * oculta e limpa tudo (rAF/observers) ao trocar de rota. O herói usa hero3d.js.
 */

import { h, empty, formatNumber } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { appState } from '../core/state.js';
import { createHeroField } from '../utils/hero3d.js';
import { createHeroWebGL } from '../utils/hero-webgl.js';
import { ARSENAL, TOTAL as ARSENAL_TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL, CHAPTERS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS, TOTAL_UNIVERSOS } from '../data/universos.js';
import { VERSION } from '../data/version.js';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Hero ===== */

function buildHero(onCleanup, operador) {
  const canvas = h('canvas', { className: 'h3-hero__canvas' });

  const emblem = h('div', { className: 'h3-emblem', title: 'arraste para girar' },
    h('div', { className: 'h3-emblem__ring h3-emblem__ring--a' }),
    h('div', { className: 'h3-emblem__ring h3-emblem__ring--b' }),
    h('div', { className: 'h3-emblem__core' }, '⬡'));

  const hudClock = h('span', { className: 'h3-hud__clock u-mono' }, '--:--:--');
  const tick = () => { hudClock.textContent = new Date().toLocaleTimeString('pt-BR'); };
  tick();
  if (!REDUCED) { const t = setInterval(tick, 1000); onCleanup(() => clearInterval(t)); }

  const kicker = h('div', { className: 'h3-hero__kicker u-mono' }, 'NÚCLEO INFINITY DREADNOUGHT');

  const layers = h('div', { className: 'h3-hero__layers' },
    h('div', { className: 'h3-hero__layer h3-hero__layer--back' }, emblem),
    h('div', { className: 'h3-hero__layer h3-hero__layer--front' },
      kicker,
      h('h1', { className: 'h3-hero__title' },
        h('span', { className: 'h3-hero__title-main' }, 'BALUARTE'),
        h('span', { className: 'h3-hero__title-sub' }, 'MARK XIII')),
      h('p', { className: 'h3-hero__tagline' },
        'Bem-vindo, operador ', h('span', { className: 'u-text-cyan' }, operador),
        '. Plataforma narrativa e tática — onde os deuses sangram.'),
      h('div', { className: 'h3-hero__cta' },
        h('button', { className: 'h3-btn h3-btn--primary', onclick: () => router.navigate('/ferramentas') }, '⚙ Hub de Ferramentas'),
        h('button', { className: 'h3-btn', onclick: () => router.navigate('/jarvis') }, '◉ Falar com o J.A.R.V.I.S.'))));

  const hud = h('div', { className: 'h3-hud' },
    h('div', { className: 'h3-hud__corner h3-hud__corner--tl' },
      h('span', { className: 'h3-badge h3-badge--ver' }, '⬡ MARK XIII · v' + VERSION)),
    h('div', { className: 'h3-hud__corner h3-hud__corner--tr' },
      hudClock,
      h('span', { className: 'h3-hud__dot' }, '● NÚCLEO ONLINE')));

  const hero = h('div', { className: 'h3-hero' }, canvas, hud, layers);

  /* cena 3D imersiva em WebGL (nebulosa + núcleo de anéis); cai no campo de
     partículas 2D se o WebGL faltar (issue #195 — design 3D no melhor possível). */
  let fx = createHeroWebGL(canvas, { accent: '#00f0ff', accent2: '#ff00aa' });
  const webglOn = !!fx;
  if (!fx) fx = createHeroField(canvas, { accent: '#00f0ff', accent2: '#ff00aa' });
  if (webglOn) hero.classList.add('is-webgl');   // o núcleo WebGL substitui o emblema CSS
  fx.start();
  onCleanup(() => fx.destroy());

  if (!REDUCED) {
    /* parallax de mouse no herói (camadas + campo de partículas) */
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--px', (x - 0.5).toFixed(3));
      hero.style.setProperty('--py', (y - 0.5).toFixed(3));
      fx.setPointer(x, y);
    };
    hero.addEventListener('pointermove', onMove);
    onCleanup(() => hero.removeEventListener('pointermove', onMove));

    /* emblema 3D MANIPULÁVEL (só no fallback 2D; com WebGL o núcleo é a cena) */
    if (!webglOn) {
      let gx = 0, gy = 0, vgx = 0, vgy = 0, dragging = false, lastX = 0, lastY = 0, inertia = 0;
      const applyEmblem = () => { emblem.style.setProperty('--gx', gx.toFixed(2) + 'deg'); emblem.style.setProperty('--gy', gy.toFixed(2) + 'deg'); };
      const spin = () => {
        if (dragging) return;
        gx += vgx; gy += vgy; vgx *= 0.94; vgy *= 0.94; applyEmblem();
        if (Math.abs(vgx) > 0.02 || Math.abs(vgy) > 0.02) inertia = requestAnimationFrame(spin); else inertia = 0;
      };
      const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; if (inertia) cancelAnimationFrame(inertia); emblem.setPointerCapture?.(e.pointerId); e.preventDefault(); };
      const move = (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
        gy += dx * 0.5; gx -= dy * 0.5; vgy = dx * 0.5; vgx = -dy * 0.5; applyEmblem();
      };
      const up = () => { if (!dragging) return; dragging = false; inertia = requestAnimationFrame(spin); };
      emblem.addEventListener('pointerdown', down);
      emblem.addEventListener('pointermove', move);
      emblem.addEventListener('pointerup', up);
      emblem.addEventListener('pointercancel', up);
      onCleanup(() => { if (inertia) cancelAnimationFrame(inertia); });
    }

    /* parallax de scroll (scrollytelling): o herói recua e desbota; com WebGL,
       o scroll também mergulha a câmera pela nebulosa (fly-through). */
    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      const prog = Math.max(0, Math.min(1, -r.top / (r.height || 1)));
      layers.style.transform = `translateY(${(prog * 60).toFixed(1)}px)`;
      layers.style.opacity = (1 - prog * 0.85).toFixed(2);
      if (webglOn && fx.setScroll) fx.setScroll(prog);
    };
    window.addEventListener('scroll', onScroll, true);  // capture: pega o scroll do container
    onCleanup(() => window.removeEventListener('scroll', onScroll, true));

    /* glitch/scramble no kicker (toque cyberpunk), uma vez */
    scramble(kicker, 'NÚCLEO INFINITY DREADNOUGHT', onCleanup);
  }
  return hero;
}

/* Revela um texto com caracteres aleatórios "assentando" (efeito cyberpunk). */
function scramble(el, text, onCleanup) {
  const chars = '▚▞█▓▒░/\\<>*+=ABCDEF0123456789';
  let frame = 0; const total = 28; let raf = 0;
  const run = () => {
    const reveal = Math.floor((frame / total) * text.length);
    let out = '';
    for (let i = 0; i < text.length; i++) out += i < reveal || text[i] === ' ' ? text[i] : chars[(Math.random() * chars.length) | 0];
    el.textContent = out;
    if (frame++ < total) raf = requestAnimationFrame(run); else el.textContent = text;
  };
  raf = requestAnimationFrame(run);
  onCleanup(() => { if (raf) cancelAnimationFrame(raf); });
}

/* ===== Métricas (count-up) ===== */

function countUp(el, target) {
  if (REDUCED) { el.textContent = String(target); return; }
  const dur = 900, t0 = performance.now();
  const stepFn = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(stepFn);
  };
  requestAnimationFrame(stepFn);
}

function buildMetrics(onCleanup) {
  const metrics = [
    { v: ARSENAL_TOTAL, l: 'Arsenal', path: '/arsenal' },
    { v: TOTAL_EQUIPES, l: 'Equipes de elite', path: '/elites' },
    { v: ARCS_TOTAL, l: 'Arcos nas Crônicas', path: '/biblioteca' },
    { v: CHAPTERS_TOTAL, l: 'Capítulos', path: '/biblioteca' },
    { v: TOTAL_UNIVERSOS, l: 'Universos', path: '/universo' }
  ];
  const els = [];
  const strip = h('div', { className: 'h3-metrics' },
    ...metrics.map((m) => {
      const num = h('div', { className: 'h3-metric__v u-mono' }, '0');
      els.push([num, m.v]);
      return h('button', { className: 'h3-metric', onclick: () => router.navigate(m.path) },
        num, h('div', { className: 'h3-metric__l' }, m.l));
    }),
    h('div', { className: 'h3-metric h3-metric--ver' },
      h('div', { className: 'h3-metric__v u-mono u-text-magenta' }, 'v' + VERSION),
      h('div', { className: 'h3-metric__l' }, 'versão')));

  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((ents, obs) => {
      for (const e of ents) if (e.isIntersecting) { els.forEach(([el, v]) => countUp(el, v)); obs.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(strip);
    onCleanup(() => io.disconnect());
  } else els.forEach(([el, v]) => { el.textContent = String(v); });
  return strip;
}

/* ===== Status do sistema (vigilância + infra, no novo visual) ===== */

function buildStatus() {
  const vigilancia = [
    { tag: 'NÚCLEO', msg: `Mark XIII estável — v${VERSION}.`, on: true },
    { tag: 'ROUTER', msg: 'SPA hash router — todas as rotas operacionais.', on: true },
    { tag: 'JARVIS', msg: 'J.A.R.V.I.S. online — modos local/servidor/Claude.', on: true },
    { tag: 'NEXUS', msg: 'Git Nexus — grafo de código + comunidades + ML.', on: true },
    { tag: 'PWA', msg: 'Service Worker ativo — funciona offline.', on: true }
  ];
  const infra = [
    ['Frontend', 'JS ES2022 puro + Vite 5'],
    ['Inteligência', 'J.A.R.V.I.S. + Conselho de IAs'],
    ['Persistência', 'localStorage + IndexedDB'],
    ['Aprendizado', 'ML da Memória + Git Nexus'],
    ['Deploy', 'Vercel — estático + funções Python']
  ];

  return h('section', { className: 'h3-status h3-reveal' },
    h('div', { className: 'h3-status__col' },
      h('div', { className: 'h3-status__head' },
        h('h2', { className: 'h3-shelf__title' }, '⌖ Vigilância'),
        h('span', { className: 'h3-badge h3-badge--live' }, '● AO VIVO')),
      ...vigilancia.map((e) => h('div', { className: 'h3-vig' },
        h('span', { className: 'h3-vig__dot' + (e.on ? ' is-on' : '') }),
        h('span', { className: 'h3-vig__tag u-mono' }, e.tag),
        h('span', { className: 'h3-vig__msg' }, e.msg)))),
    h('div', { className: 'h3-status__col' },
      h('h2', { className: 'h3-shelf__title' }, '◈ Infraestrutura'),
      ...infra.map(([k, v]) => h('div', { className: 'h3-infra' },
        h('span', { className: 'h3-infra__k' }, k),
        h('span', { className: 'h3-infra__v u-mono u-text-muted' }, v),
        h('span', { className: 'h3-infra__ok' }, 'OK')))));
}

/* ===== Prateleiras estilo Steam ===== */

function tiltCard(card) {
  if (REDUCED) return card;
  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    card.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
  };
  const reset = () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', reset);
  return card;
}

function shelf(title, subtitle, cards, morePath) {
  return h('section', { className: 'h3-shelf h3-reveal' },
    h('div', { className: 'h3-shelf__head' },
      h('div', null,
        h('h2', { className: 'h3-shelf__title' }, title),
        subtitle && h('p', { className: 'h3-shelf__sub u-text-muted' }, subtitle)),
      morePath && h('button', { className: 'h3-shelf__more', onclick: () => router.navigate(morePath) }, 'ver tudo →')),
    h('div', { className: 'h3-shelf__track' }, ...cards));
}

function arsenalCard(it) {
  return tiltCard(h('div', { className: 'h3-card h3-card--arsenal', onclick: () => router.navigate('/arsenal') },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__cat u-mono' }, (it.category || '').toUpperCase()),
    h('div', { className: 'h3-card__name' }, it.name),
    h('div', { className: 'h3-card__meta u-text-muted' }, [it.origin, it.year, it.caliber].filter(Boolean).join(' · '))));
}
function equipeCard(e) {
  return tiltCard(h('div', { className: 'h3-card h3-card--equipe', style: { '--accent': e.color || '#00f0ff' }, onclick: () => router.navigate('/elites') },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__code u-mono' }, e.code),
    h('div', { className: 'h3-card__name' }, e.name),
    h('div', { className: 'h3-card__meta u-text-muted' }, e.specialty || ''),
    h('span', { className: 'h3-card__status' + (e.status === 'ativa' ? ' is-on' : '') }, e.status || '—')));
}
function universoCard(u) {
  return tiltCard(h('div', { className: 'h3-card h3-card--universo', style: { '--accent': u.color || '#00f0ff' }, onclick: () => router.navigate('/universo') },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__icon' }, u.icon || '◇'),
    h('div', { className: 'h3-card__name' }, u.name),
    h('div', { className: 'h3-card__meta u-text-muted' }, u.tagline || '')));
}
function arcoCard(a) {
  return tiltCard(h('div', { className: 'h3-card h3-card--arco', onclick: () => router.navigate('/biblioteca') },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__cat u-mono' }, a.universe || 'CRÔNICAS'),
    h('div', { className: 'h3-card__name' }, a.title),
    h('div', { className: 'h3-card__meta u-text-muted' }, (a.synopsis || '').slice(0, 90))));
}

/* ===== Acesso rápido ===== */

const LAUNCH = [
  { icon: '🔗', label: 'Git Nexus', path: '/git-nexus' },
  { icon: '◉', label: 'J.A.R.V.I.S.', path: '/jarvis' },
  { icon: '📈', label: 'ML da Memória', path: '/aprendizado' },
  { icon: '⚙', label: 'Ferramentas', path: '/ferramentas' },
  { icon: '⌨', label: 'Editor', path: '/editor' },
  { icon: '◫', label: 'Biblioteca', path: '/biblioteca' },
  { icon: '💹', label: 'Câmbio', path: '/dolar' },
  { icon: '◇', label: 'Sobre', path: '/sobre' }
];

function buildLaunch() {
  return h('section', { className: 'h3-launch h3-reveal' },
    h('h2', { className: 'h3-shelf__title' }, 'Acesso rápido'),
    h('div', { className: 'h3-launch__grid' },
      ...LAUNCH.map((l) => tiltCard(h('button', { className: 'h3-tile', onclick: () => router.navigate(l.path) },
        h('span', { className: 'h3-tile__icon' }, l.icon),
        h('span', { className: 'h3-tile__label' }, l.label))))));
}

/* ===== Página ===== */

export function homePage() {
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  const operador = (appState.get('user') || { name: 'Operador' }).name;

  const page = h('div', { className: 'page-home3d' });
  page.appendChild(buildHero(onCleanup, operador));
  page.appendChild(buildMetrics(onCleanup));
  page.appendChild(buildStatus());

  page.appendChild(h('div', { className: 'h3-shelves' },
    shelf('🔫 Arsenal em destaque', `${formatNumber(ARSENAL_TOTAL)} armas e veículos reais por categoria`, ARSENAL.slice(0, 12).map(arsenalCard), '/arsenal'),
    shelf('◆ Equipes de Elite', `${TOTAL_EQUIPES} esquadrões do alfabeto OTAN`, EQUIPES.slice(0, 12).map(equipeCard), '/elites'),
    shelf('🌌 Universos', `${TOTAL_UNIVERSOS} mundos das Crônicas`, UNIVERSOS.slice(0, 12).map(universoCard), '/universo'),
    shelf('📖 Crônicas — Onde os Deuses Sangram', `${ARCS_TOTAL} arcos · ${CHAPTERS_TOTAL} capítulos`, ARCS.slice(0, 12).map(arcoCard), '/biblioteca')));
  page.appendChild(buildLaunch());

  /* scroll-reveal */
  if (typeof IntersectionObserver !== 'undefined' && !REDUCED) {
    const io = new IntersectionObserver((ents) => {
      for (const e of ents) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { threshold: 0.08 });
    requestAnimationFrame(() => page.querySelectorAll('.h3-reveal').forEach((el) => io.observe(el)));
    onCleanup(() => io.disconnect());
  } else requestAnimationFrame(() => page.querySelectorAll('.h3-reveal').forEach((el) => el.classList.add('is-in')));

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
