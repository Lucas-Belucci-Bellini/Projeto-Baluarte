export interface HeroSkinColors {
  accent: string;
  accent2: string;
}

export interface HeroWebGLOptions extends Partial<HeroSkinColors> {
  variant?: string;
}

export interface HeroEffect {
  webgl: boolean;
  start(): void;
  stop(): void;
  setPointer(x: number, y: number): void;
  setScroll?(scrollY: number): void;
  destroy(): void;
}

export function heroSkinColors(): HeroSkinColors;
export function createHeroWebGL(
  canvas: HTMLCanvasElement,
  options?: HeroWebGLOptions,
): HeroEffect | null;
