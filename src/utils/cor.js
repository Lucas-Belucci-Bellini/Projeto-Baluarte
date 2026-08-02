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

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function hexToRgb(hex) {
  const s = String(hex).trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(s)) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16)
    };
  }
  if (/^[0-9a-f]{6}$/i.test(s)) {
    const n = parseInt(s, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  return null;
}

function rgbToHex({ r, g, b }) {
  const c = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let hue = 0, sat = 0;
  if (d !== 0) {
    sat = d / (1 - Math.abs(2 * l - 1));
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: sat * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/* sRGB → linear (decodificação gama). */
function srgbToLinear(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/* sRGB → OKLCH (Björn Ottosson) — para exibição. */
function rgbToOklch({ r, g, b }) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const lc = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const mc = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const sc = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(lc), m_ = Math.cbrt(mc), s_ = Math.cbrt(sc);
  const okL = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const okA = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const okB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  let hue = Math.atan2(okB, okA) * 180 / Math.PI;
  if (hue < 0) hue += 360;
  return { l: okL, c: Math.sqrt(okA * okA + okB * okB), h: hue };
}

/* Luminância relativa + razão de contraste (WCAG 2.x). */
function relLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1), l2 = relLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export {
  clamp, hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  srgbToLinear, rgbToOklch, relLuminance, contrastRatio
};
