import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast';
import { toBase64, fromBase64, toBase32, fromBase32, toHex, fromHex } from '../../utils/cripto-engine.js';
import type { BaseEncoders } from '../../utils/cripto-engine.js';

type BaseFormat = 'base64' | 'base32' | 'hex';
const ENCODERS: Record<BaseFormat, BaseEncoders> = {
  base64: { enc: toBase64, dec: fromBase64, label: 'Base64', alphabet: 'A-Z a-z 0-9 + / =' },
  base32: { enc: toBase32, dec: fromBase32, label: 'Base32', alphabet: 'A-Z 2-7 =' },
  hex: { enc: toHex, dec: fromHex, label: 'Hex', alphabet: '0-9 a-f' },
};
function isBaseFormat(value: string): value is BaseFormat { return value === 'base64' || value === 'base32' || value === 'hex'; }
function copyResult(value: string): void { if (navigator.clipboard) void navigator.clipboard.writeText(value).then(() => toast('Copiado!', { type: 'success' })); }

export function basePanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const input = h('textarea', { className: 'input', rows: 4, placeholder: 'Texto plano…', value: 'Operador OMEGA', oninput: debounce(render, 100) });
  const out = h('div', { className: 'cripto-base-grid' });
  const decInput = h('textarea', { className: 'input', rows: 3, placeholder: 'Cole aqui o texto codificado…', oninput: debounce(renderDec, 100) });
  const decFormat = h('select', { className: 'input', onchange: renderDec }, h('option', { value: 'base64', selected: true }, 'Base64'), h('option', { value: 'base32' }, 'Base32'), h('option', { value: 'hex' }, 'Hex'));
  const decOut = h('div', { className: 'cripto-out u-mono' });
  function render(): void {
    out.innerHTML = '';
    for (const format of Object.keys(ENCODERS) as BaseFormat[]) {
      const encoder = ENCODERS[format];
      const result = encoder.enc(input.value);
      const row = h('div', { className: 'cripto-base-row' }, h('div', { className: 'cripto-base-row__head' }, h('strong', null, encoder.label), h('span', { className: 'u-text-muted u-mono' }, `· alfabeto: ${encoder.alphabet}`), h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => copyResult(result) }, '⎘ copiar')), h('div', { className: 'cripto-out u-mono' }, result || '(vazio)'), h('div', { className: 'u-text-muted', style: { fontSize: '11px' } }, `${result.length} caracteres`));
      out.appendChild(row);
    }
  }
  function renderDec(): void {
    const format: BaseFormat = isBaseFormat(decFormat.value) ? decFormat.value : 'base64';
    const result = ENCODERS[format].dec(decInput.value);
    if (result === null || result === '') { decOut.textContent = decInput.value ? '(formato inválido)' : ''; decOut.classList.toggle('is-error', Boolean(decInput.value)); return; }
    decOut.textContent = result; decOut.classList.remove('is-error');
  }
  wrap.append(h('h3', { className: 'cripto-tile__title' }, '⬢  Base64 · Base32 · Hex'), h('div', { className: 'cripto-tile__title-sub' }, '↑ Encode'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto plano', input)), out, h('div', { className: 'cripto-tile__title-sub' }, '↓ Decode'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto codificado', decInput), h('label', null, 'Formato', decFormat)), h('span', { className: 'cripto-out__label' }, 'Decodificado'), decOut);
  setTimeout(render, 0);
  return wrap;
}
