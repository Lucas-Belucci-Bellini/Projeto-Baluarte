/**
 * Página /color-studio — Color Studio (v2.1.0).
 *
 * Conversor HEX/RGB/HSL/OKLCH, gerador de paletas, construtor de
 * gradiente e verificador de contraste WCAG. Sem dependências.
 */

import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';

const STORAGE_KEY = 'color-studio:color';

/* ============================================================
 *  Conversões de cor
 * ============================================================ */

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

/* ============================================================
 *  Utilidades de UI
 * ============================================================ */

function copy(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => toast('Copiado: ' + text, { type: 'success', duration: 1400 }),
      () => toast('Não foi possível copiar', { type: 'danger' })
    );
  }
}

/* Valor monoespaçado que copia ao clicar. */
function copyValue(text) {
  return h('button', {
    className: 'cs-copy u-mono',
    title: 'Clique para copiar',
    onclick: () => copy(text)
  }, text);
}

function field(label, ...controls) {
  return h('label', { className: 'cs-field' },
    h('span', { className: 'cs-field__label' }, label),
    h('div', { className: 'cs-field__controls' }, ...controls));
}

/* ============================================================
 *  Página
 * ============================================================ */

export function colorStudioPage() {
  let color = hexToRgb(storage.get(STORAGE_KEY) || '') || { r: 0, g: 240, b: 255 };
  const syncFns = [];

  function setColor(rgb) {
    color = {
      r: clamp(Math.round(rgb.r), 0, 255),
      g: clamp(Math.round(rgb.g), 0, 255),
      b: clamp(Math.round(rgb.b), 0, 255)
    };
    storage.set(STORAGE_KEY, rgbToHex(color));
    syncFns.forEach((fn) => fn());
  }

  const page = h('div', { className: 'page-color-studio' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'COLOR STUDIO')),
      h('h1', { className: 'page-header__title' }, '◐ Color Studio'),
      h('p', { className: 'page-header__description' },
        'Conversor ',
        h('span', { className: 'u-text-cyan' }, 'HEX / RGB / HSL / OKLCH'),
        ', gerador de paletas, construtor de gradiente e verificador de ',
        'contraste ', h('span', { className: 'u-text-cyan' }, 'WCAG'), '.')
    )
  );

  page.appendChild(buildConverter());
  page.appendChild(buildPalettes());
  page.appendChild(buildGradient());
  page.appendChild(buildContrast());

  /* ===== Conversor ===== */
  function buildConverter() {
    const wrap = h('div', { className: 'cs-card card' });
    const preview = h('div', { className: 'cs-preview' });

    const picker = h('input', {
      type: 'color',
      className: 'cs-picker',
      oninput: (e) => setColor(hexToRgb(e.target.value) || color)
    });
    const hexInput = h('input', {
      className: 'input cs-input', type: 'text', spellcheck: 'false',
      oninput: () => {
        const rgb = hexToRgb(hexInput.value);
        if (rgb) setColor(rgb);
      }
    });
    const copyHexBtn = h('button', {
      className: 'btn btn--sm', title: 'Copiar HEX',
      onclick: () => copy(rgbToHex(color))
    }, '⧉ Copiar');

    const rgbInputs = ['r', 'g', 'b'].map(() =>
      h('input', {
        className: 'input cs-num', type: 'number', min: '0', max: '255',
        oninput: () => setColor({
          r: +rgbInputs[0].value, g: +rgbInputs[1].value, b: +rgbInputs[2].value
        })
      }));

    const hslInputs = [360, 100, 100].map((max) =>
      h('input', {
        className: 'input cs-num', type: 'number', min: '0', max: String(max),
        oninput: () => setColor(hslToRgb({
          h: +hslInputs[0].value, s: +hslInputs[1].value, l: +hslInputs[2].value
        }))
      }));

    const oklchValue = h('div', { className: 'cs-oklch u-mono' });

    wrap.appendChild(
      h('div', { className: 'cs-converter' },
        preview,
        h('div', { className: 'cs-fields' },
          field('HEX', picker, hexInput, copyHexBtn),
          field('RGB', ...rgbInputs),
          field('HSL', ...hslInputs),
          field('OKLCH', oklchValue)
        )
      )
    );

    syncFns.push(() => {
      const hex = rgbToHex(color);
      preview.style.background = hex;
      picker.value = hex;
      if (document.activeElement !== hexInput) hexInput.value = hex;
      const order = ['r', 'g', 'b'];
      rgbInputs.forEach((inp, i) => {
        if (document.activeElement !== inp) inp.value = String(color[order[i]]);
      });
      const hsl = rgbToHsl(color);
      const hslVals = [Math.round(hsl.h), Math.round(hsl.s), Math.round(hsl.l)];
      hslInputs.forEach((inp, i) => {
        if (document.activeElement !== inp) inp.value = String(hslVals[i]);
      });
      const ok = rgbToOklch(color);
      const txt = `oklch(${(ok.l * 100).toFixed(1)}% ${ok.c.toFixed(3)} ${ok.h.toFixed(1)})`;
      empty(oklchValue);
      oklchValue.appendChild(copyValue(txt));
    });

    return wrap;
  }

  /* ===== Paletas ===== */
  function buildPalettes() {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Paletas')));

    const shadesRow = h('div', { className: 'cs-swatches' });
    const harmonyRow = h('div', { className: 'cs-swatches' });
    wrap.appendChild(h('div', { className: 'cs-palette-label' }, 'Tons (claro → escuro)'));
    wrap.appendChild(shadesRow);
    wrap.appendChild(h('div', { className: 'cs-palette-label' }, 'Harmonias'));
    wrap.appendChild(harmonyRow);

    function swatch(rgb, label) {
      const hex = rgbToHex(rgb);
      return h('button', {
        className: 'cs-swatch',
        style: { background: hex },
        title: `${label ? label + ' · ' : ''}${hex} — clique para usar`,
        onclick: () => setColor(rgb)
      },
        h('span', { className: 'cs-swatch__hex u-mono' }, hex),
        label && h('span', { className: 'cs-swatch__tag' }, label)
      );
    }

    syncFns.push(() => {
      const hsl = rgbToHsl(color);
      empty(shadesRow);
      [95, 86, 74, 62, 50, 40, 30, 22, 12].forEach((l) => {
        shadesRow.appendChild(swatch(hslToRgb({ h: hsl.h, s: hsl.s, l })));
      });
      empty(harmonyRow);
      [
        { d: 180, t: 'Complementar' },
        { d: -30, t: 'Análoga' },
        { d: 30, t: 'Análoga' },
        { d: 120, t: 'Triádica' },
        { d: 240, t: 'Triádica' }
      ].forEach(({ d, t }) => {
        harmonyRow.appendChild(swatch(hslToRgb({ h: hsl.h + d, s: hsl.s, l: hsl.l }), t));
      });
    });

    return wrap;
  }

  /* ===== Gradiente ===== */
  function buildGradient() {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Gradiente')));

    const c1 = h('input', { type: 'color', className: 'cs-picker', value: '#00f0ff' });
    const c2 = h('input', { type: 'color', className: 'cs-picker', value: '#ff00aa' });
    const angle = h('input', {
      type: 'range', min: '0', max: '360', step: '1', value: '90'
    });
    const angleVal = h('span', { className: 'u-mono u-text-cyan' }, '90°');
    const bar = h('div', { className: 'cs-gradient-bar' });
    const cssOut = h('div', { className: 'cs-gradient-css' });

    function refresh() {
      angleVal.textContent = angle.value + '°';
      const css = `linear-gradient(${angle.value}deg, ${c1.value}, ${c2.value})`;
      bar.style.background = css;
      empty(cssOut);
      cssOut.appendChild(copyValue('background: ' + css + ';'));
    }
    [c1, c2, angle].forEach((el) => (el.oninput = refresh));

    wrap.appendChild(
      h('div', { className: 'cs-grad-controls' },
        field('Cor inicial', c1),
        field('Cor final', c2),
        field('Ângulo', angle, angleVal),
        h('button', {
          className: 'btn btn--sm',
          title: 'Usar a cor atual como cor inicial',
          onclick: () => { c1.value = rgbToHex(color); refresh(); }
        }, '↤ Cor atual')
      )
    );
    wrap.appendChild(bar);
    wrap.appendChild(cssOut);
    refresh();
    return wrap;
  }

  /* ===== Contraste WCAG ===== */
  function buildContrast() {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Contraste WCAG')));

    const fg = h('input', { type: 'color', className: 'cs-picker', value: '#e6f1ff' });
    const bg = h('input', { type: 'color', className: 'cs-picker', value: '#0a0a0a' });
    const sample = h('div', { className: 'cs-contrast-sample' },
      h('div', { className: 'cs-contrast-sample__big' }, 'Texto grande'),
      h('div', { className: 'cs-contrast-sample__small' },
        'Texto normal — o conteúdo precisa de contraste suficiente para ser legível.'));
    const ratioEl = h('div', { className: 'cs-ratio u-mono' });
    const badges = h('div', { className: 'cs-badges' });

    function badge(label, passed) {
      return h('span', {
        className: 'badge ' + (passed ? 'badge--success' : 'badge--danger')
      }, `${label}: ${passed ? 'passa' : 'falha'}`);
    }

    function refresh() {
      const fgRgb = hexToRgb(fg.value), bgRgb = hexToRgb(bg.value);
      sample.style.background = bg.value;
      sample.style.color = fg.value;
      const ratio = contrastRatio(fgRgb, bgRgb);
      ratioEl.textContent = `Razão de contraste: ${ratio.toFixed(2)} : 1`;
      empty(badges);
      badges.appendChild(badge('AA texto normal', ratio >= 4.5));
      badges.appendChild(badge('AA texto grande', ratio >= 3));
      badges.appendChild(badge('AAA texto normal', ratio >= 7));
      badges.appendChild(badge('AAA texto grande', ratio >= 4.5));
    }
    [fg, bg].forEach((el) => (el.oninput = refresh));

    wrap.appendChild(
      h('div', { className: 'cs-grad-controls' },
        field('Texto (frente)', fg),
        field('Fundo', bg),
        h('button', {
          className: 'btn btn--sm',
          title: 'Usar a cor atual como cor do texto',
          onclick: () => { fg.value = rgbToHex(color); refresh(); }
        }, '↤ Cor atual')
      )
    );
    wrap.appendChild(sample);
    wrap.appendChild(ratioEl);
    wrap.appendChild(badges);
    refresh();
    return wrap;
  }

  /* Sincroniza tudo na primeira renderização. */
  syncFns.forEach((fn) => fn());

  return page;
}
