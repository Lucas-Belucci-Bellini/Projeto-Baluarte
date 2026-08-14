import type { HeroSkinColors } from './hero-webgl.js';

export interface HeroFieldOptions extends Partial<HeroSkinColors> {
  density?: number;
  grid?: boolean;
}

export interface HeroFieldEffect {
  start(): void;
  stop(): void;
  setPointer(x: number, y: number): void;
  destroy(): void;
}

export function createHeroField(
  canvas: HTMLCanvasElement,
  options?: HeroFieldOptions | HeroSkinColors,
): HeroFieldEffect;
