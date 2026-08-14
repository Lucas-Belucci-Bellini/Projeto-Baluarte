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

import { cx, h } from './helpers.js';
import { createHeroWebGL, heroSkinColors } from './hero-webgl.js';
import { createHeroRays } from './hero-rays.js';
import { createHeroField } from './hero3d.js';
import { mountSpline } from './spline-embed.js';
import { sceneFor } from '../data/spline-scenes.js';
import type { HChild } from './helpers.js';
import type { SplineMount } from './spline-embed.js';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface ImmersiveHeroCta {
  readonly label: string;
  readonly variant?: string;
  readonly onClick?: () => void;
}

export interface ImmersiveHeroOptions {
  readonly kicker?: string;
  readonly title?: string;
  readonly sub?: string;
  readonly desc?: HChild | readonly HChild[];
  readonly ctas?: readonly ImmersiveHeroCta[];
  readonly accent?: string;
  readonly accent2?: string;
  readonly variant?: string;
  readonly sceneKey?: string;
  readonly query?: Readonly<Record<string, string>> | null;
  readonly hudLeft?: string;
  readonly hudRight?: string;
}

interface HeroEffectLike {
  start(): void;
  destroy(): void;
  setPointer(x: number, y: number): void;
}

export function buildImmersiveHero(
  options: ImmersiveHeroOptions = {},
): HTMLDivElement {
  const skin = heroSkinColors();
  const {
    kicker = '',
    title = '',
    sub = '',
    desc = '',
    ctas = [],
    accent = skin.accent,
    accent2 = skin.accent2,
    variant = 'galaxy',
    sceneKey = '',
    query = null,
    hudLeft = '',
    hudRight = '',
  } = options;

  const canvas = h('canvas', { className: 'bx-hero__canvas' });
  const splineWrap = h('div', {
    className: 'bx-hero__spline',
    'aria-hidden': 'true',
  });

  const descNodes: readonly HChild[] | null = desc
    ? (Array.isArray(desc) ? desc : [desc])
    : null;
  const inner = h(
    'div',
    { className: 'bx-hero__inner' },
    kicker && h('div', { className: 'bx-hero__kicker' }, kicker),
    h(
      'h1',
      { className: 'bx-hero__title' },
      h('span', { className: 'bx-hero__title-main' }, title),
      sub && h('span', { className: 'bx-hero__title-sub' }, sub),
    ),
    descNodes && h('p', { className: 'bx-hero__desc' }, ...descNodes),
    ctas.length && h(
      'div',
      { className: 'bx-hero__cta' },
      ...ctas.map((cta) => h(
        'button',
        {
          className: cx(
            'bx-hero__btn',
            cta.variant && `bx-hero__btn--${cta.variant}`,
          ),
          onclick: cta.onClick,
        },
        cta.label,
      )),
    ),
  );

  const hud = (hudLeft || hudRight) && h(
    'div',
    { className: 'bx-hero__hud' },
    h('div', { className: 'bx-hero__hud-l' }, hudLeft),
    h('div', { className: 'bx-hero__hud-r' }, hudRight),
  );

  const hero = h(
    'div',
    {
      className: 'bx-hero',
      style: `--bx-accent:${accent};--bx-accent2:${accent2};`,
    },
    canvas,
    h('div', { className: 'bx-hero__rays', 'aria-hidden': 'true' }),
    h('div', { className: 'bx-hero__grid', 'aria-hidden': 'true' }),
    h('div', { className: 'fx-aurora bx-hero__aurora', 'aria-hidden': 'true' }),
    splineWrap,
    hud,
    inner,
  );

  const preferredEffect = variant === 'lightrays'
    ? createHeroRays(canvas, { accent, accent2 })
    : createHeroWebGL(canvas, { accent, accent2, variant });
  const fx: HeroEffectLike = preferredEffect ?? createHeroField(canvas, {
    accent,
    accent2,
  });
  fx.start();

  let spline: SplineMount | null = null;
  const sceneUrl = sceneKey
    ? sceneFor(sceneKey, query ? { ...query } : null)
    : '';
  if (sceneUrl) {
    spline = mountSpline(splineWrap, sceneUrl, {
      onReady: () => hero.classList.add('has-spline'),
      onFail: () => hero.classList.remove('has-spline'),
    });
  }

  let onMove: ((event: PointerEvent) => void) | null = null;
  if (!REDUCED) {
    onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      fx.setPointer(
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
      );
    };
    hero.addEventListener('pointermove', onMove);
  }

  /* auto-limpeza ao sair do DOM (troca de rota) */
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!document.contains(hero)) {
        try {
          fx.destroy();
        } catch {
          /* efeito já destruído */
        }
        try {
          spline?.destroy();
        } catch {
          /* Spline já desmontado */
        }
        if (onMove) hero.removeEventListener('pointermove', onMove);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return hero;
}
