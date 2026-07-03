/**
 * Sistema de temas — troca a paleta de acento do Baluarte (Material 3 + Neon).
 *
 * Cada tema define só duas cores-base (primária/secundária); as variantes
 * (soft/edge/glow) são derivadas em runtime e aplicadas como CSS custom
 * properties no <html>. Não toca em variables.css; o tema "neon" (padrão)
 * apenas remove os overrides e volta ao definido no CSS.
 */

import { storage } from '../core/storage.js';

const KEY = 'ui:theme';

export const THEMES = [
  { id: 'neon',    label: 'Neon',    primary: '#d4a24e', secondary: '#e8c07a' },
  { id: 'ambar',   label: 'Âmbar',   primary: '#ffb000', secondary: '#ff5e00' },
  { id: 'matrix',  label: 'Matrix',  primary: '#00ff66', secondary: '#00b34a' },
  { id: 'tatico',  label: 'Tático',  primary: '#ff3b3b', secondary: '#ff8c00' },
  { id: 'violeta', label: 'Violeta', primary: '#b15dff', secondary: '#00e0ff' },
  { id: 'gelo',    label: 'Gelo',    primary: '#7fdbff', secondary: '#4aa8ff' }
];

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  const n = m ? parseInt(m[1], 16) : 0xd4a24e;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

function varsFor(primaryHex, secondaryHex) {
  const p = hexToRgb(primaryHex);
  const s = hexToRgb(secondaryHex);
  return {
    '--color-cyan': primaryHex,
    '--color-cyan-soft': rgba(p, 0.15),
    '--color-cyan-edge': rgba(p, 0.4),
    '--color-magenta': secondaryHex,
    '--color-magenta-soft': rgba(s, 0.15),
    '--color-magenta-edge': rgba(s, 0.4),
    '--shadow-glow-cyan': `0 0 16px ${rgba(p, 0.4)}, 0 0 32px ${rgba(p, 0.15)}`,
    '--shadow-glow-cyan-strong': `0 0 24px ${rgba(p, 0.6)}, 0 0 48px ${rgba(p, 0.3)}`,
    '--shadow-glow-magenta': `0 0 16px ${rgba(s, 0.4)}, 0 0 32px ${rgba(s, 0.15)}`,
    '--shadow-glow-magenta-strong': `0 0 24px ${rgba(s, 0.6)}, 0 0 48px ${rgba(s, 0.3)}`
  };
}

/** Aplica um tema ao <html>. 'neon' remove overrides (volta ao CSS base). */
export function applyTheme(id) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0];
  const root = document.documentElement;
  const vars = varsFor(t.primary, t.secondary);
  if (t.id === 'neon') {
    Object.keys(vars).forEach((k) => root.style.removeProperty(k));
  } else {
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }
  root.dataset.theme = t.id;
  return t.id;
}

export function getThemeId() {
  return storage.get(KEY) || 'neon';
}

/** Define e persiste o tema. */
export function setTheme(id) {
  const applied = applyTheme(id);
  storage.set(KEY, applied);
  return applied;
}

/** Aplica o tema salvo (chamar no boot). */
export function initTheme() {
  applyTheme(getThemeId());
}
