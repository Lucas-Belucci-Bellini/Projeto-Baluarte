/**
 * Sistema de temas — troca a paleta do Baluarte.
 *
 * Cada tema define duas cores-base (primária/secundária); as variantes
 * (soft/edge/glow) são derivadas em runtime e aplicadas como CSS custom
 * properties no <html>. Temas de FÁBULA (esmeralda/rubi, do mockup Fable 5 V2)
 * carregam também um kit completo em `vars` — fundo, painéis, texto e bordas —
 * trocando o mundo inteiro, não só o acento. Não toca em variables.css; o tema
 * "neon" (id histórico do padrão, hoje **Ouro**) apenas remove os overrides e
 * volta ao definido no CSS.
 */

import { storage } from '../core/storage.js';

const KEY = 'ui:theme';

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

export interface Theme {
  readonly id: ThemeId;
  readonly label: string;
  readonly primary: string;
  readonly secondary: string;
  readonly vars?: Readonly<ThemeVars>;
}

interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

type GeneratedVarKey =
  | '--color-cyan'
  | '--color-cyan-soft'
  | '--color-cyan-edge'
  | '--color-magenta'
  | '--color-magenta-soft'
  | '--color-magenta-edge'
  | '--shadow-glow-cyan'
  | '--shadow-glow-cyan-strong'
  | '--shadow-glow-magenta'
  | '--shadow-glow-magenta-strong';

const THEMES: readonly Theme[] = [
  /* id 'neon' mantido por compatibilidade de storage — é o Ouro de Fábula padrão */
  { id: 'neon', label: 'Ouro', primary: '#d4a24e', secondary: '#e8c07a' },
  {
    id: 'esmeralda', label: 'Esmeralda', primary: '#2fbf8f', secondary: '#8fd4b4',
    vars: {
      '--color-bg': '#0a1210',
      '--color-bg-elevated': '#0e1a16',
      '--color-surface': '#0f1d19',
      '--color-surface-2': '#152721',
      '--color-surface-3': '#1b3129',
      '--color-text-primary': '#e9f5ee',
      '--color-text-secondary': '#8aa896',
      '--color-text-muted': '#5f7a6b',
      '--color-text-inverse': '#04211a',
      '--border-thin': '1px solid rgba(110, 200, 160, 0.12)',
      '--border-base': '1px solid rgba(110, 200, 160, 0.2)',
      '--border-strong': '1px solid rgba(110, 200, 160, 0.4)',
      '--border-magenta': '1px solid rgba(143, 212, 180, 0.4)',
    },
  },
  {
    id: 'rubi', label: 'Rubi', primary: '#c8556d', secondary: '#e0a06d',
    vars: {
      '--color-bg': '#140a0f',
      '--color-bg-elevated': '#1c0e14',
      '--color-surface': '#201016',
      '--color-surface-2': '#2c161e',
      '--color-surface-3': '#341c26',
      '--color-text-primary': '#f7ecec',
      '--color-text-secondary': '#af8d92',
      '--color-text-muted': '#7d5f66',
      '--color-text-inverse': '#2a060f',
      '--border-thin': '1px solid rgba(224, 138, 150, 0.12)',
      '--border-base': '1px solid rgba(224, 138, 150, 0.2)',
      '--border-strong': '1px solid rgba(224, 138, 150, 0.4)',
      '--border-magenta': '1px solid rgba(224, 160, 109, 0.4)',
    },
  },
  { id: 'ambar', label: 'Âmbar', primary: '#ffb000', secondary: '#ff5e00' },
  { id: 'matrix', label: 'Matrix', primary: '#00ff66', secondary: '#00b34a' },
  { id: 'tatico', label: 'Tático', primary: '#ff3b3b', secondary: '#ff8c00' },
  { id: 'violeta', label: 'Violeta', primary: '#b15dff', secondary: '#00e0ff' },
  { id: 'gelo', label: 'Gelo', primary: '#7fdbff', secondary: '#4aa8ff' },
];

function hexToRgb(hex: string): RgbColor {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  const value = match ? parseInt(match[1], 16) : 0xd4a24e;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(color: RgbColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function varsFor(
  primaryHex: string,
  secondaryHex: string,
): Record<GeneratedVarKey, string> {
  const primary = hexToRgb(primaryHex);
  const secondary = hexToRgb(secondaryHex);
  return {
    '--color-cyan': primaryHex,
    '--color-cyan-soft': rgba(primary, 0.15),
    '--color-cyan-edge': rgba(primary, 0.4),
    '--color-magenta': secondaryHex,
    '--color-magenta-soft': rgba(secondary, 0.15),
    '--color-magenta-edge': rgba(secondary, 0.4),
    '--shadow-glow-cyan': `0 0 16px ${rgba(primary, 0.4)}, 0 0 32px ${rgba(primary, 0.15)}`,
    '--shadow-glow-cyan-strong': `0 0 24px ${rgba(primary, 0.6)}, 0 0 48px ${rgba(primary, 0.3)}`,
    '--shadow-glow-magenta': `0 0 16px ${rgba(secondary, 0.4)}, 0 0 32px ${rgba(secondary, 0.15)}`,
    '--shadow-glow-magenta-strong': `0 0 24px ${rgba(secondary, 0.6)}, 0 0 48px ${rgba(secondary, 0.3)}`,
  };
}

/* União de todas as chaves que qualquer tema pode setar — limpa antes de trocar,
   senão o kit completo de um tema de fábula vazaria pro próximo. */
const ALL_KEYS: readonly string[] = [
  ...Object.keys(varsFor('#000000', '#000000')),
  ...new Set(THEMES.flatMap((theme) => Object.keys(theme.vars ?? {}))),
];

/** Aplica um tema ao <html>. 'neon' (Ouro) remove overrides (volta ao CSS base). */
export function applyTheme(id: string): string {
  const theme = THEMES.find((candidate) => candidate.id === id) ?? THEMES[0];
  const root = document.documentElement;
  ALL_KEYS.forEach((key) => root.style.removeProperty(key));
  if (theme.id !== 'neon') {
    Object.entries(varsFor(theme.primary, theme.secondary)).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
  if (theme.vars) {
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
  root.dataset.theme = theme.id;
  /* avisa a UI (pill flutuante, pickers) sem acoplamento */
  try {
    document.dispatchEvent(new CustomEvent('baluarte:theme', { detail: { id: theme.id } }));
  } catch {
    /* SSR/teste */
  }
  return theme.id;
}

export function getThemeId(): string {
  return storage.get<string>(KEY) || 'neon';
}

/** Define e persiste o tema. */
export function setTheme(id: string): string {
  const applied = applyTheme(id);
  storage.set(KEY, applied);
  return applied;
}

/** Aplica o tema salvo (chamar no boot). */
export function initTheme(): void {
  applyTheme(getThemeId());
}

export { THEMES };
