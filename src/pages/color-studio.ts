/**
 * Página /color-studio — Color Studio (v2.1.0).
 *
 * Conversor HEX/RGB/HSL/OKLCH, gerador de paletas, construtor de gradiente
 * e verificador de contraste WCAG.
 */

import '../styles/color-studio.css';
import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status';
import {
  clamp,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToOklch,
  contrastRatio,
} from '../utils/cor';
import type { HslColor, RgbColor } from '../utils/cor';

const STORAGE_KEY = 'color-studio:color';
type Channel = 'r' | 'g' | 'b';
type SyncFunction = () => void;

const CHANNEL_LABELS: Record<Channel, string> = {
  r: 'Vermelho',
  g: 'Verde',
  b: 'Azul',
};

function copy(text: string): void {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(
    () => toast(`Copiado: ${text}`, { type: 'success', duration: 1400 }),
    () => toast('Não foi possível copiar', { type: 'danger' }),
  );
}

function copyValue(text: string): HTMLButtonElement {
  return h('button', {
    className: 'cs-copy u-mono',
    title: 'Clique para copiar',
    onclick: () => copy(text),
  }, text);
}

function field(label: string, ...controls: Node[]): HTMLLabelElement {
  return h('label', { className: 'cs-field' },
    h('span', { className: 'cs-field__label' }, label),
    h('div', { className: 'cs-field__controls' }, ...controls),
  );
}

export function colorStudioPage(): HTMLDivElement {
  const stored: unknown = storage.get<unknown>(STORAGE_KEY, '');
  let color: RgbColor = (
    typeof stored === 'string' ? hexToRgb(stored) : null
  ) ?? { r: 0, g: 240, b: 255 };
  const syncFunctions: SyncFunction[] = [];

  function setColor(rgb: RgbColor): void {
    color = {
      r: clamp(Math.round(rgb.r), 0, 255),
      g: clamp(Math.round(rgb.g), 0, 255),
      b: clamp(Math.round(rgb.b), 0, 255),
    };
    const hex = rgbToHex(color);
    storage.set(STORAGE_KEY, hex);
    setStatus('colorStudio', {
      corAtual: hex,
      rgb: `${color.r},${color.g},${color.b}`,
    });
    syncFunctions.forEach((sync) => sync());
  }

  const page = h('div', { className: 'page-color-studio' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'COLOR STUDIO'),
      ),
      h('h1', { className: 'page-header__title' }, '◐ Color Studio'),
      h('p', { className: 'page-header__description' },
        'Conversor ',
        h('span', { className: 'u-text-cyan' }, 'HEX / RGB / HSL / OKLCH'),
        ', gerador de paletas, construtor de gradiente e verificador de ',
        'contraste ',
        h('span', { className: 'u-text-cyan' }, 'WCAG'),
        '.',
      ),
    ),
  );

  page.appendChild(buildConverter());
  page.appendChild(buildPalettes());
  page.appendChild(buildGradient());
  page.appendChild(buildContrast());

  function buildConverter(): HTMLDivElement {
    const wrap = h('div', { className: 'cs-card card' });
    const preview = h('div', { className: 'cs-preview' });
    const picker = h('input', {
      type: 'color',
      className: 'cs-picker',
      oninput: (event: Event) => {
        const input = event.currentTarget;
        if (!(input instanceof HTMLInputElement)) return;
        const rgb = hexToRgb(input.value);
        if (rgb) setColor(rgb);
      },
    });
    const hexInput = h('input', {
      className: 'input cs-input',
      type: 'text',
      spellcheck: false,
      'aria-label': 'Cor em hexadecimal',
      oninput: () => {
        const rgb = hexToRgb(hexInput.value);
        if (rgb) setColor(rgb);
      },
    });
    const copyHexButton = h('button', {
      className: 'btn btn--sm',
      title: 'Copiar HEX',
      onclick: () => copy(rgbToHex(color)),
    }, '⧉ Copiar');

    const channels = ['r', 'g', 'b'] as const;
    const rgbInputs: HTMLInputElement[] = channels.map((channel) => h('input', {
      className: 'input cs-num',
      type: 'number',
      min: '0',
      max: '255',
      'aria-label': `${CHANNEL_LABELS[channel]} (0 a 255)`,
      oninput: () => setColor({
        r: Number(rgbInputs[0].value),
        g: Number(rgbInputs[1].value),
        b: Number(rgbInputs[2].value),
      }),
    }));

    const hslInputs: HTMLInputElement[] = [360, 100, 100].map((max, index) => h('input', {
      className: 'input cs-num',
      type: 'number',
      min: '0',
      max: String(max),
      'aria-label': [
        'Matiz (0 a 360 graus)',
        'Saturação (0 a 100%)',
        'Luminosidade (0 a 100%)',
      ][index],
      oninput: () => setColor({
        ...hslToRgb({
          h: Number(hslInputs[0].value),
          s: Number(hslInputs[1].value),
          l: Number(hslInputs[2].value),
        }),
      }),
    }));
    const oklchValue = h('div', { className: 'cs-oklch u-mono' });

    wrap.appendChild(
      h('div', { className: 'cs-converter' },
        preview,
        h('div', { className: 'cs-fields' },
          field('HEX', picker, hexInput, copyHexButton),
          field('RGB', ...rgbInputs),
          field('HSL', ...hslInputs),
          field('OKLCH', oklchValue),
        ),
      ),
    );

    syncFunctions.push(() => {
      const hex = rgbToHex(color);
      preview.style.background = hex;
      picker.value = hex;
      if (document.activeElement !== hexInput) hexInput.value = hex;
      channels.forEach((channel, index) => {
        const input = rgbInputs[index];
        if (document.activeElement !== input) input.value = String(color[channel]);
      });
      const hsl: HslColor = rgbToHsl(color);
      const hslValues = [Math.round(hsl.h), Math.round(hsl.s), Math.round(hsl.l)];
      hslInputs.forEach((input, index) => {
        if (document.activeElement !== input) input.value = String(hslValues[index]);
      });
      const oklch = rgbToOklch(color);
      const text = `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
      empty(oklchValue);
      oklchValue.appendChild(copyValue(text));
    });
    return wrap;
  }

  function buildPalettes(): HTMLDivElement {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Paletas')));
    const shadesRow = h('div', { className: 'cs-swatches' });
    const harmonyRow = h('div', { className: 'cs-swatches' });
    wrap.appendChild(h('div', { className: 'cs-palette-label' }, 'Tons (claro → escuro)'));
    wrap.appendChild(shadesRow);
    wrap.appendChild(h('div', { className: 'cs-palette-label' }, 'Harmonias'));
    wrap.appendChild(harmonyRow);

    function swatch(rgb: RgbColor, label?: string): HTMLButtonElement {
      const hex = rgbToHex(rgb);
      return h('button', {
        className: 'cs-swatch',
        style: { background: hex },
        title: `${label ? `${label} · ` : ''}${hex} — clique para usar`,
        onclick: () => setColor(rgb),
      },
        h('span', { className: 'cs-swatch__hex u-mono' }, hex),
        label && h('span', { className: 'cs-swatch__tag' }, label),
      );
    }

    syncFunctions.push(() => {
      const hsl = rgbToHsl(color);
      empty(shadesRow);
      [95, 86, 74, 62, 50, 40, 30, 22, 12].forEach((lightness) => {
        shadesRow.appendChild(swatch(hslToRgb({ h: hsl.h, s: hsl.s, l: lightness })));
      });
      empty(harmonyRow);
      const harmonies: readonly { d: number; t: string }[] = [
        { d: 180, t: 'Complementar' },
        { d: -30, t: 'Análoga' },
        { d: 30, t: 'Análoga' },
        { d: 120, t: 'Triádica' },
        { d: 240, t: 'Triádica' },
      ];
      harmonies.forEach(({ d, t }) => {
        harmonyRow.appendChild(swatch(hslToRgb({ h: hsl.h + d, s: hsl.s, l: hsl.l }), t));
      });
    });
    return wrap;
  }

  function buildGradient(): HTMLDivElement {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Gradiente')));
    const firstColor = h('input', { type: 'color', className: 'cs-picker', value: '#d4a24e' });
    const secondColor = h('input', { type: 'color', className: 'cs-picker', value: '#e8c07a' });
    const angle = h('input', { type: 'range', min: '0', max: '360', step: '1', value: '90' });
    const angleValue = h('span', { className: 'u-mono u-text-cyan' }, '90°');
    const bar = h('div', { className: 'cs-gradient-bar' });
    const cssOutput = h('div', { className: 'cs-gradient-css' });

    function refresh(): void {
      angleValue.textContent = `${angle.value}°`;
      const css = `linear-gradient(${angle.value}deg, ${firstColor.value}, ${secondColor.value})`;
      bar.style.background = css;
      empty(cssOutput);
      cssOutput.appendChild(copyValue(`background: ${css};`));
    }
    [firstColor, secondColor, angle].forEach((element) => {
      element.oninput = refresh;
    });

    wrap.appendChild(
      h('div', { className: 'cs-grad-controls' },
        field('Cor inicial', firstColor),
        field('Cor final', secondColor),
        field('Ângulo', angle, angleValue),
        h('button', {
          className: 'btn btn--sm',
          title: 'Usar a cor atual como cor inicial',
          onclick: () => {
            firstColor.value = rgbToHex(color);
            refresh();
          },
        }, '↤ Cor atual'),
      ),
    );
    wrap.appendChild(bar);
    wrap.appendChild(cssOutput);
    refresh();
    return wrap;
  }

  function buildContrast(): HTMLDivElement {
    const wrap = h('div', { className: 'cs-card card' });
    wrap.appendChild(h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Contraste WCAG')));
    const foreground = h('input', { type: 'color', className: 'cs-picker', value: '#e6f1ff' });
    const background = h('input', { type: 'color', className: 'cs-picker', value: '#0a0a0a' });
    const sample = h('div', { className: 'cs-contrast-sample' },
      h('div', { className: 'cs-contrast-sample__big' }, 'Texto grande'),
      h('div', { className: 'cs-contrast-sample__small' },
        'Texto normal — o conteúdo precisa de contraste suficiente para ser legível.'),
    );
    const ratioElement = h('div', { className: 'cs-ratio u-mono' });
    const badges = h('div', { className: 'cs-badges' });

    function badge(label: string, passed: boolean): HTMLSpanElement {
      return h('span', {
        className: `badge ${passed ? 'badge--success' : 'badge--danger'}`,
      }, `${label}: ${passed ? 'passa' : 'falha'}`);
    }

    function refresh(): void {
      const foregroundRgb = hexToRgb(foreground.value) ?? color;
      const backgroundRgb = hexToRgb(background.value) ?? { r: 0, g: 0, b: 0 };
      sample.style.background = background.value;
      sample.style.color = foreground.value;
      const ratio = contrastRatio(foregroundRgb, backgroundRgb);
      ratioElement.textContent = `Razão de contraste: ${ratio.toFixed(2)} : 1`;
      empty(badges);
      badges.appendChild(badge('AA texto normal', ratio >= 4.5));
      badges.appendChild(badge('AA texto grande', ratio >= 3));
      badges.appendChild(badge('AAA texto normal', ratio >= 7));
      badges.appendChild(badge('AAA texto grande', ratio >= 4.5));
    }
    [foreground, background].forEach((element) => {
      element.oninput = refresh;
    });

    wrap.appendChild(
      h('div', { className: 'cs-grad-controls' },
        field('Texto (frente)', foreground),
        field('Fundo', background),
        h('button', {
          className: 'btn btn--sm',
          title: 'Usar a cor atual como cor do texto',
          onclick: () => {
            foreground.value = rgbToHex(color);
            refresh();
          },
        }, '↤ Cor atual'),
      ),
    );
    wrap.appendChild(sample);
    wrap.appendChild(ratioElement);
    wrap.appendChild(badges);
    refresh();
    return wrap;
  }

  syncFunctions.forEach((sync) => sync());
  return page;
}
