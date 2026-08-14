import type { HeroEffect } from './hero-webgl.js';

export interface HeroRaysOptions {
  readonly accent?: string;
  readonly accent2?: string;
}

export function createHeroRays(
  canvas: HTMLCanvasElement,
  options?: HeroRaysOptions,
): HeroEffect | null;
