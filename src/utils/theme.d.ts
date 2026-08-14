export type ThemeId =
  | 'neon'
  | 'esmeralda'
  | 'rubi'
  | 'ambar'
  | 'matrix'
  | 'tatico'
  | 'violeta'
  | 'gelo';

export interface ThemeVars {
  readonly '--color-bg': string;
  readonly '--color-bg-elevated': string;
  readonly '--color-surface': string;
  readonly '--color-surface-2': string;
  readonly '--color-surface-3': string;
  readonly '--color-text-primary': string;
  readonly '--color-text-secondary': string;
  readonly '--color-text-muted': string;
  readonly '--color-text-inverse': string;
  readonly '--border-thin': string;
  readonly '--border-base': string;
  readonly '--border-strong': string;
  readonly '--border-magenta': string;
}

export interface ThemeDefinition {
  readonly id: ThemeId;
  readonly label: string;
  readonly primary: string;
  readonly secondary: string;
  readonly vars?: Readonly<ThemeVars>;
}

export type Theme = ThemeDefinition;

export const THEMES: readonly ThemeDefinition[];
export function applyTheme(id: string): string;
export function getThemeId(): string;
export function setTheme(id: string): string;
export function initTheme(): void;
