/**
 * Conversões de cor — HEX, RGB, HSL, OKLCH e contraste WCAG.
 *
 * Módulo PURO: sem DOM, sem CSS, sem dependência. Estava dentro de
 * `src/pages/color-studio.js`, que importa a folha de estilo no topo — e por
 * isso a matemática de cor não podia ser carregada em Node nem testada em lugar
 * nenhum. A conta estava certa (confere com os valores publicados do WebAIM e
 * do Ottosson); o que faltava era a garantia de que continue certa.
 *
 * As fórmulas seguem fonte publicada, não aproximação caseira:
 *   - sRGB ⇄ linear e luminância relativa: WCAG 2.x / IEC 61966-2-1;
 *   - razão de contraste: (L1 + 0,05) / (L2 + 0,05), WCAG 2.x;
 *   - OKLCH: matrizes do Björn Ottosson (oklab).
 */

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface HslColor {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export interface OklchColor {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

export function hexToRgb(hex: string): RgbColor | null {
  const source = String(hex).trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(source)) {
    return {
      r: parseInt(source[0] + source[0], 16),
      g: parseInt(source[1] + source[1], 16),
      b: parseInt(source[2] + source[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/i.test(source)) {
    const number = parseInt(source, 16);
    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255,
    };
  }
  return null;
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const component = (value: number): string => (
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  );
  return `#${component(r)}${component(g)}${component(b)}`;
}

export function rgbToHsl({ r: red, g: green, b: blue }: RgbColor): HslColor {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = c;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = c;
  } else if (hue < 180) {
    green = c;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = c;
  } else if (hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  return {
    r: (red + m) * 255,
    g: (green + m) * 255,
    b: (blue + m) * 255,
  };
}

/* sRGB → linear (decodificação gama). */
export function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/* sRGB → OKLCH (Björn Ottosson) — para exibição. */
export function rgbToOklch({ r, g, b }: RgbColor): OklchColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const lc = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const mc = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const sc = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const lRoot = Math.cbrt(lc);
  const mRoot = Math.cbrt(mc);
  const sRoot = Math.cbrt(sc);
  const okL = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot;
  const okA = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot;
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot;
  let hue = Math.atan2(okB, okA) * 180 / Math.PI;
  if (hue < 0) hue += 360;

  return { l: okL, c: Math.sqrt(okA * okA + okB * okB), h: hue };
}

/* Luminância relativa + razão de contraste (WCAG 2.x). */
export function relLuminance({ r, g, b }: RgbColor): number {
  return 0.2126 * srgbToLinear(r)
    + 0.7152 * srgbToLinear(g)
    + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(rgb1: RgbColor, rgb2: RgbColor): number {
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
