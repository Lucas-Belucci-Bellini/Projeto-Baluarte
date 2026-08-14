import type { HChild } from './helpers.js';

export interface ImmersiveHeroCta {
  label: string;
  variant?: string;
  onClick?: () => void;
}

export interface ImmersiveHeroOptions {
  kicker?: string;
  title?: string;
  sub?: string;
  desc?: HChild | readonly HChild[];
  ctas?: readonly ImmersiveHeroCta[];
  accent?: string;
  accent2?: string;
  variant?: string;
  sceneKey?: string;
  query?: Readonly<Record<string, string>> | null;
  hudLeft?: string;
  hudRight?: string;
}

export function buildImmersiveHero(options?: ImmersiveHeroOptions): HTMLDivElement;
