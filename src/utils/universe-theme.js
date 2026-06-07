/**
 * Motor de Universos — skin completo do site por universo das Crônicas.
 *
 * Vai além do tema de acento (theme.js): cada universo redefine um KIT de
 * design tokens — cor + glow, fundo/superfícies, tipografia (display) e
 * formas (raios) — aplicados como CSS custom properties no <html>, mais um
 * `data-universe` que liga a atmosfera (texturas/overlays em theme-universos.css).
 *
 * Nenhuma função do site é tocada: é uma camada 100% visual sobre os tokens.
 * `baluarte` = estado padrão (sem overrides) e devolve o tema de acento.
 */

import { storage } from '../core/storage.js';
import { applyTheme, getThemeId } from './theme.js';

const KEY = 'ui:universe';

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  const n = m ? parseInt(m[1], 16) : 0x00f0ff;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

/** Deriva as variantes de cor/glow a partir da primária e secundária. */
function colorVars(primary, secondary) {
  const p = hexToRgb(primary), s = hexToRgb(secondary);
  return {
    '--color-cyan': primary,
    '--color-cyan-soft': rgba(p, 0.15),
    '--color-cyan-edge': rgba(p, 0.4),
    '--color-magenta': secondary,
    '--color-magenta-soft': rgba(s, 0.15),
    '--color-magenta-edge': rgba(s, 0.4),
    '--shadow-glow-cyan': `0 0 16px ${rgba(p, 0.4)}, 0 0 32px ${rgba(p, 0.15)}`,
    '--shadow-glow-cyan-strong': `0 0 24px ${rgba(p, 0.6)}, 0 0 48px ${rgba(p, 0.3)}`,
    '--shadow-glow-magenta': `0 0 16px ${rgba(s, 0.4)}, 0 0 32px ${rgba(s, 0.15)}`,
    '--shadow-glow-magenta-strong': `0 0 24px ${rgba(s, 0.6)}, 0 0 48px ${rgba(s, 0.3)}`
  };
}

/**
 * Skins prontos. Cada um casa com um id de universos.js.
 * `extra` traz os tokens não-cromáticos (fundo, texto, formas, tipografia).
 */
export const UNIVERSE_THEMES = {
  doom: {
    label: 'DOOM',
    primary: '#ff3b1d',
    secondary: '#ff8a00',
    extra: {
      '--color-bg': '#0a0403',
      '--color-bg-elevated': '#170806',
      '--color-surface': '#210b07',
      '--color-surface-2': '#2c0f09',
      '--color-surface-3': '#380f0a',
      '--color-text-primary': '#ffe9e2',
      '--color-text-secondary': '#d99f93',
      '--color-text-muted': '#9c6f66',
      '--radius-xs': '1px', '--radius-sm': '2px', '--radius-md': '3px', '--radius-lg': '4px', '--radius-xl': '6px',
      '--font-display': "'Oswald', 'Inter', sans-serif"
    }
  },
  'warhammer-40k': {
    label: 'Warhammer 40k',
    primary: '#e0a92e',
    secondary: '#9e2b25',
    extra: {
      '--color-bg': '#080604',
      '--color-bg-elevated': '#13100a',
      '--color-surface': '#1b160d',
      '--color-surface-2': '#241d12',
      '--color-surface-3': '#2e2416',
      '--color-text-primary': '#f1e7c9',
      '--color-text-secondary': '#bdae87',
      '--color-text-muted': '#8c7f5d',
      '--radius-xs': '0', '--radius-sm': '0', '--radius-md': '1px', '--radius-lg': '2px', '--radius-xl': '3px',
      '--font-display': "'Cinzel', 'Times New Roman', serif"
    }
  }
};

/** Universos selecionáveis na UI (skin pronto). Demais ficam "em breve". */
export const UNIVERSE_SKINS = [
  { id: 'baluarte', label: 'Baluarte', primary: '#00f0ff', secondary: '#ff00aa' },
  { id: 'doom', label: 'DOOM', primary: '#ff3b1d', secondary: '#ff8a00' },
  { id: 'warhammer-40k', label: 'Warhammer 40k', primary: '#e0a92e', secondary: '#9e2b25' }
];

let appliedKeys = [];

/** Aplica um universo ao <html>. `baluarte`/desconhecido devolve o tema de acento. */
export function applyUniverse(id) {
  const root = document.documentElement;
  appliedKeys.forEach((k) => root.style.removeProperty(k));
  appliedKeys = [];

  const skin = UNIVERSE_THEMES[id];
  if (!skin) {
    delete root.dataset.universe;
    applyTheme(getThemeId()); /* volta ao tema de acento do Baluarte */
    return 'baluarte';
  }

  const vars = { ...colorVars(skin.primary, skin.secondary), ...(skin.extra || {}) };
  Object.entries(vars).forEach(([k, v]) => { root.style.setProperty(k, v); appliedKeys.push(k); });
  root.dataset.universe = id;
  return id;
}

export function getUniverseId() { return storage.get(KEY) || 'baluarte'; }

/** Define e persiste o universo ativo. */
export function setUniverse(id) {
  const applied = applyUniverse(id);
  storage.set(KEY, applied);
  return applied;
}

/** Aplica o universo salvo (chamar no boot, após initTheme). */
export function initUniverse() {
  applyUniverse(getUniverseId());
}
