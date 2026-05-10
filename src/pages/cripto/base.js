/**
 * Base64 / Base32 / Hex — encode + decode bidirecional.
 */

import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast.js';
import {
  toBase64, fromBase64,
  toBase32, fromBase32,
  toHex, fromHex
} from '../../utils/cripto-engine.js';

const ENCODERS = {
  'base64': { enc: toBase64, dec: fromBase64, label: 'Base64', alphabet: 'A-Z a-z 0-9 + / =' },
  'base32': { enc: toBase32, dec: fromBase32, label: 'Base32', alphabet: 'A-Z 2-7 =' },
  'hex': { enc: toHex, dec: fromHex, label: 'Hex', alphabet: '0-9 a-f' }
};

export function basePanel() {
  const wrap = h('div', { className: 'cripto-tile' });

  const input = h('textarea', {
    className: 'input',
    rows: 4,
    placeholder: 'Texto plano…',
    value: 'Operador OMEGA',
    oninput: debounce(render, 100)
  });
  const out = h('div', { className: 'cripto-base-grid' });

  /* Decoder área */
  const decInput = h('textarea', {
    className: 'input',
    rows: 3,
    placeholder: 'Cole aqui o texto codificado…',
    oninput: debounce(renderDec, 100)
  });
  const decFormat = h('select', { className: 'input', onchange: renderDec },
    h('option', { value: 'base64', selected: true }, 'Base64'),
    h('option', { value: 'base32' }, 'Base32'),
    h('option', { value: 'hex' }, 'Hex')
  );
  const decOut = h('div', { className: 'cripto-out u-mono' });

  function render() {
    const text = input.value;
    out.innerHTML = '';
    for (const [id, { enc, label, alphabet }] of Object.entries(ENCODERS)) {
      const result = enc(text);
      const row = h('div', { className: 'cripto-base-row' },
        h('div', { className: 'cripto-base-row__head' },
          h('strong', null, label),
          h('span', { className: 'u-text-muted u-mono' }, '· alfabeto: ' + alphabet),
          h('button', {
            className: 'btn btn--ghost btn--sm',
            onclick: () => {
              navigator.clipboard.writeText(result).then(() => toast('Copiado!', { type: 'success' }));
            }
          }, '⎘ copiar')
        ),
        h('div', { className: 'cripto-out u-mono' }, result || '(vazio)'),
        h('div', { className: 'u-text-muted', style: { fontSize: '11px' } },
          `${result.length} caracteres`)
      );
      out.appendChild(row);
    }
  }

  function renderDec() {
    const fmt = decFormat.value;
    const { dec } = ENCODERS[fmt];
    const result = dec(decInput.value);
    if (result === null || result === '') {
      decOut.textContent = decInput.value ? '(formato inválido)' : '';
      decOut.classList.toggle('is-error', !!decInput.value);
    } else {
      decOut.textContent = result;
      decOut.classList.remove('is-error');
    }
  }

  wrap.append(
    h('h3', { className: 'cripto-tile__title' }, '⬢  Base64 · Base32 · Hex'),
    h('div', { className: 'cripto-tile__title-sub' }, '↑ Encode'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto plano', input)
    ),
    out,
    h('div', { className: 'cripto-tile__title-sub' }, '↓ Decode'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto codificado', decInput),
      h('label', null, 'Formato', decFormat)
    ),
    h('span', { className: 'cripto-out__label' }, 'Decodificado'),
    decOut
  );

  setTimeout(render, 0);
  return wrap;
}
