/**
 * /home-3d — Ponte de Comando 3D (PILOTO do redesign, issues #195/#196).
 *
 * Página piloto NÃO-disruptiva: não toca na /home atual. Demonstra a direção do
 * redesign pedida nos issues — 3D imersivo e interativo (#195) com fidelidade
 * cinematográfica + organização de conteúdo estilo Steam (#196), tudo em JS/CSS
 * puro (consistência técnica, zero dependência — influência "Claude Code").
 *
 * Camadas:
 *   - Herói cinematográfico: campo de partículas 3D (hero3d.js) + emblema
 *     giratório em CSS 3D + parallax de mouse + HUD ao vivo.
 *   - Faixa de métricas reais com contagem animada.
 *   - Prateleiras estilo Steam (scroll horizontal, cards com tilt 3D no hover)
 *     alimentadas por dados reais: Arsenal, Equipes, Universos, Crônicas.
 *   - Grade de acesso rápido (estilo biblioteca/command-palette).
 *
 * Acessível e leve: respeita prefers-reduced-motion, pausa o canvas fora da
 * viewport e limpa tudo (rAF/observers) quando a página sai do DOM.
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { createHeroField } from '../utils/hero3d.js';
import { ARSENAL, TOTAL as ARSENAL_TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL, CHAPTERS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS, TOTAL_UNIVERSOS } from '../data/universos.js';
import { VERSION } from '../data/version.js';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Hero =====
 * `onCleanup` é LOCAL por invocação da página (passado de home3dPage). Antes era
 * global no módulo e uma segunda chamada da página destruía os recursos da
 * primeira — o que matava o campo de partículas do herói montado. */

function buildHero(onCleanup) {
  const canvas = h('canvas', { className: 'h3-hero__canvas' });

  /* emblema 3D (CSS preserve-3d): núcleo hexagonal + anéis girando */
  const emblem = h('div', { className: 'h3-emblem' },
    h('div', { className: 'h3-emblem__ring h3-emblem__ring--a' }),
    h('div', { className: 'h3-emblem__ring h3-emblem__ring--b' }),
    h('div', { className: 'h3-emblem__core' }, '⬡'));

  const hudClock = h('span', { className: 'h3-hud__clock u-mono' }, '--:--:--');
  const tick = () => { hudClock.textContent = new Date().toLocaleTimeString('pt-BR'); };
  tick();
  if (!REDUCED) { const t = setInterval(tick, 1000); onCleanup(() => clearInterval(t)); }

  const layers = h('div', { className: 'h3-hero__layers' },
    h('div', { className: 'h3-hero__layer h3-hero__layer--back' }, emblem),
    h('div', { className: 'h3-hero__layer h3-hero__layer--front' },
      h('div', { className: 'h3-hero__kicker u-mono' }, 'NÚCLEO INFINITY DREADNOUGHT'),
      h('h1', { className: 'h3-hero__title' },
        h('span', { className: 'h3-hero__title-main' }, 'BALUARTE'),
        h('span', { className: 'h3-hero__title-sub' }, 'MARK XIII')),
      h('p', { className: 'h3-hero__tagline' },
        'Plataforma narrativa e tática — onde os deuses sangram. ',
        h('span', { className: 'u-text-cyan' }, 'Redesign 3D imersivo.')),
      h('div', { className: 'h3-hero__cta' },
        h('button', { className: 'h3-btn h3-btn--primary', onclick: () => router.navigate('/home') }, '▸ Entrar na Ponte de Comando'),
        h('button', { className: 'h3-btn', onclick: () => router.navigate('/arsenal') }, '⌖ Explorar Arsenal'))));

  /* HUD: badge de preview (não-disruptivo) + relógio + status */
  const hud = h('div', { className: 'h3-hud' },
    h('div', { className: 'h3-hud__corner h3-hud__corner--tl' },
      h('span', { className: 'h3-badge h3-badge--preview' }, '◐ PREVIEW · redesign #195/#196'),
      h('a', { className: 'h3-hud__link', href: '#/home' }, '↩ ver a Home atual')),
    h('div', { className: 'h3-hud__corner h3-hud__corner--tr' },
      hudClock,
      h('span', { className: 'h3-hud__dot' }, '● MARK XIII ONLINE')));

  const hero = h('div', { className: 'h3-hero' }, canvas, hud, layers);

  /* campo de partículas */
  const fx = createHeroField(canvas, { accent: '#00f0ff', accent2: '#ff00aa' });
  fx.start();
  onCleanup(() => fx.destroy());

  /* parallax de mouse: move as camadas + alimenta o campo + inclina o emblema */
  if (!REDUCED) {
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--px', (x - 0.5).toFixed(3));
      hero.style.setProperty('--py', (y - 0.5).toFixed(3));
      fx.setPointer(x, y);
    };
    hero.addEventListener('pointermove', onMove);
    onCleanup(() => hero.removeEventListener('pointermove', onMove));
  }

  return hero;
}

/* ===== Faixa de métricas (count-up) ===== */

function countUp(el, target) {
  if (REDUCED) { el.textContent = String(target); return; }
  const dur = 900, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(target * eased));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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

  /* dispara a contagem quando a faixa entra na tela */
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((ents, obs) => {
      for (const e of ents) if (e.isIntersecting) { els.forEach(([el, v]) => countUp(el, v)); obs.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(strip);
    onCleanup(() => io.disconnect());
  } else {
    els.forEach(([el, v]) => { el.textContent = String(v); });
  }
  return strip;
}

/* ===== Prateleiras estilo Steam ===== */

function tiltCard(card) {
  if (REDUCED) return card;
  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    card.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
  };
  const reset = () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', reset);
  return card;
}

function shelf(title, subtitle, cards, morePath) {
  const track = h('div', { className: 'h3-shelf__track' }, ...cards);
  return h('section', { className: 'h3-shelf h3-reveal' },
    h('div', { className: 'h3-shelf__head' },
      h('div', null,
        h('h2', { className: 'h3-shelf__title' }, title),
        subtitle && h('p', { className: 'h3-shelf__sub u-text-muted' }, subtitle)),
      morePath && h('button', { className: 'h3-shelf__more', onclick: () => router.navigate(morePath) }, 'ver tudo →')),
    track);
}

function arsenalCard(it) {
  return tiltCard(h('div', { className: 'h3-card h3-card--arsenal', onclick: () => router.navigate('/arsenal') },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__cat u-mono' }, (it.category || '').toUpperCase()),
    h('div', { className: 'h3-card__name' }, it.name),
    h('div', { className: 'h3-card__meta u-text-muted' }, [it.origin, it.year, it.caliber].filter(Boolean).join(' · '))));
}

function equipeCard(e) {
  const color = e.color || '#00f0ff';
  return tiltCard(h('div', {
    className: 'h3-card h3-card--equipe', style: { '--accent': color }, onclick: () => router.navigate('/elites')
  },
    h('div', { className: 'h3-card__glow' }),
    h('div', { className: 'h3-card__code u-mono' }, e.code),
    h('div', { className: 'h3-card__name' }, e.name),
    h('div', { className: 'h3-card__meta u-text-muted' }, e.specialty || ''),
    h('span', { className: 'h3-card__status' + (e.status === 'ativa' ? ' is-on' : '') }, e.status || '—')));
}

function universoCard(u) {
  const color = u.color || '#00f0ff';
  return tiltCard(h('div', {
    className: 'h3-card h3-card--universo', style: { '--accent': color }, onclick: () => router.navigate('/universo')
  },
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
  { icon: '⚙', label: 'Ferramentas', path: '/ferramentas' },
  { icon: '◉', label: 'J.A.R.V.I.S.', path: '/jarvis' },
  { icon: '📈', label: 'ML da Memória', path: '/aprendizado' },
  { icon: '🔑', label: 'Central de APIs', path: '/apis' },
  { icon: '⌨', label: 'Editor', path: '/editor' },
  { icon: '◇', label: 'Raio-X', path: '/codigo' },
  { icon: '💹', label: 'Câmbio', path: '/dolar' },
  { icon: '◫', label: 'Biblioteca', path: '/biblioteca' }
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

export function home3dPage() {
  /* recursos a limpar quando ESTA página sair do DOM (local — não global) */
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  const page = h('div', { className: 'page-home3d' });
  page.appendChild(buildHero(onCleanup));
  page.appendChild(buildMetrics(onCleanup));

  const shelves = h('div', { className: 'h3-shelves' },
    shelf('🔫 Arsenal em destaque', `${ARSENAL_TOTAL} armas e veículos reais por categoria`, ARSENAL.slice(0, 12).map(arsenalCard), '/arsenal'),
    shelf('◆ Equipes de Elite', `${TOTAL_EQUIPES} esquadrões do alfabeto OTAN`, EQUIPES.slice(0, 12).map(equipeCard), '/elites'),
    shelf('🌌 Universos', `${TOTAL_UNIVERSOS} mundos das Crônicas`, UNIVERSOS.slice(0, 12).map(universoCard), '/universo'),
    shelf('📖 Crônicas — Onde os Deuses Sangram', `${ARCS_TOTAL} arcos · ${CHAPTERS_TOTAL} capítulos`, ARCS.slice(0, 12).map(arcoCard), '/biblioteca'));
  page.appendChild(shelves);
  page.appendChild(buildLaunch());

  page.appendChild(h('p', { className: 'h3-foot u-text-muted' },
    'Página piloto do redesign (issues ',
    h('a', { className: 'u-text-cyan', href: 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/195', target: '_blank', rel: 'noopener' }, '#195'),
    ' / ',
    h('a', { className: 'u-text-cyan', href: 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/196', target: '_blank', rel: 'noopener' }, '#196'),
    '). Não substitui a Home atual — é uma prévia para aprovação.'));

  /* scroll-reveal das seções */
  if (typeof IntersectionObserver !== 'undefined' && !REDUCED) {
    const io = new IntersectionObserver((ents) => {
      for (const e of ents) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { threshold: 0.08 });
    /* observa após montar */
    requestAnimationFrame(() => page.querySelectorAll('.h3-reveal').forEach((el) => io.observe(el)));
    onCleanup(() => io.disconnect());
  } else {
    requestAnimationFrame(() => page.querySelectorAll('.h3-reveal').forEach((el) => el.classList.add('is-in')));
  }

  /* limpa tudo quando a página deixa o DOM (troca de rota) */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) {
        cleanups.splice(0).forEach((fn) => { try { fn(); } catch { /* ok */ } });
        mo.disconnect();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
