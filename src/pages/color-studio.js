/**
 * Página /color-studio — Color Studio (v2.1.0).
 *
 * Conversor HEX/RGB/HSL/OKLCH, gerador de paletas, construtor de
 * gradiente e verificador de contraste WCAG. Sem dependências.
 */

import '../styles/color-studio.css';
import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  clamp, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToOklch, contrastRatio
} from '../utils/cor.js';

const STORAGE_KEY = 'color-studio:color';

/* ============================================================
 *  Conversões de cor
 * ============================================================ */

/* A matemática de cor mora em `src/utils/cor.js` (importada acima): é pura e
 * testável lá, enquanto aqui dentro — num arquivo que importa CSS no topo —
 * não carregava fora do navegador. */
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
    setStatus('colorStudio', { corAtual: rgbToHex(color), rgb: `${color.r},${color.g},${color.b}` });
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

    const c1 = h('input', { type: 'color', className: 'cs-picker', value: '#d4a24e' });
    const c2 = h('input', { type: 'color', className: 'cs-picker', value: '#e8c07a' });
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
