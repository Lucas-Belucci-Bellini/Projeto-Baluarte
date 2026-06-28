/**
 * Kit de HERÓI imersivo reusável (#246/#195/#262) — generaliza o herói da home
 * ("Command Deck") pra qualquer página flagship em UMA chamada:
 *   herói WebGL (galáxia + arc-reactor, com fallback 2D) + raios + grid HUD +
 *   título holográfico + kicker + descrição + CTAs + slot Spline opcional.
 *
 * Drop-in: `buildImmersiveHero({...})` devolve o elemento e SE AUTO-LIMPA quando
 * sai do DOM (MutationObserver destrói o contexto WebGL/Spline) — a página não
 * precisa gerenciar ciclo de vida. Respeita prefers-reduced-motion.
 */

import { h, cx } from './helpers.js';
import { createHeroWebGL, heroSkinColors } from './hero-webgl.js';
import { createHeroField } from './hero3d.js';
import { mountSpline } from './spline-embed.js';
import { sceneFor } from '../data/spline-scenes.js';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function buildImmersiveHero(opts = {}) {
  const _skin = heroSkinColors();
  const {
    kicker = '', title = '', sub = '', desc = '', ctas = [],
    accent = _skin.accent, accent2 = _skin.accent2, variant = 'galaxy',
    sceneKey = '', query = null, hudLeft = '', hudRight = ''
  } = opts;

  const canvas = h('canvas', { className: 'bx-hero__canvas' });
  const splineWrap = h('div', { className: 'bx-hero__spline', 'aria-hidden': 'true' });

  const descNodes = desc ? (Array.isArray(desc) ? desc : [desc]) : null;
  const inner = h('div', { className: 'bx-hero__inner' },
    kicker && h('div', { className: 'bx-hero__kicker' }, kicker),
    h('h1', { className: 'bx-hero__title' },
      h('span', { className: 'bx-hero__title-main' }, title),
      sub && h('span', { className: 'bx-hero__title-sub' }, sub)),
    descNodes && h('p', { className: 'bx-hero__desc' }, ...descNodes),
    ctas.length && h('div', { className: 'bx-hero__cta' },
      ...ctas.map((c) => h('button', {
        className: cx('bx-hero__btn', c.variant && `bx-hero__btn--${c.variant}`),
        onclick: c.onClick
      }, c.label))));

  const hud = (hudLeft || hudRight) && h('div', { className: 'bx-hero__hud' },
    h('div', { className: 'bx-hero__hud-l' }, hudLeft),
    h('div', { className: 'bx-hero__hud-r' }, hudRight));

  const hero = h('div', { className: 'bx-hero', style: `--bx-accent:${accent};--bx-accent2:${accent2};` },
    canvas,
    h('div', { className: 'bx-hero__rays', 'aria-hidden': 'true' }),
    h('div', { className: 'bx-hero__grid', 'aria-hidden': 'true' }),
    h('div', { className: 'fx-aurora bx-hero__aurora', 'aria-hidden': 'true' }),
    splineWrap,
    hud,
    inner);

  let fx = createHeroWebGL(canvas, { accent, accent2, variant });
  if (!fx) fx = createHeroField(canvas, { accent, accent2 });
  fx.start();

  let sp = null;
  const sceneUrl = sceneKey ? sceneFor(sceneKey, query) : '';
  if (sceneUrl) {
    sp = mountSpline(splineWrap, sceneUrl, {
      onReady: () => hero.classList.add('has-spline'),
      onFail: () => hero.classList.remove('has-spline')
    });
  }

  let onMove = null;
  if (!REDUCED) {
    onMove = (e) => {
      const r = hero.getBoundingClientRect();
      fx.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    hero.addEventListener('pointermove', onMove);
  }

  /* auto-limpeza ao sair do DOM (troca de rota) */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(hero)) {
        try { fx.destroy(); } catch {}
        try { sp && sp.destroy(); } catch {}
        if (onMove) hero.removeEventListener('pointermove', onMove);
        mo.disconnect();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return hero;
}
