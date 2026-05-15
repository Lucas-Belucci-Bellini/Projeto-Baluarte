/**
 * Cifra Atbash — substituição A↔Z, B↔Y, C↔X, etc.
 * É sua própria inversa (involução): atbash(atbash(x)) = x.
 */

import { h, debounce } from '../../utils/helpers.js';
import { atbash } from '../../utils/cripto-engine.js';

export function atbashPanel() {
  const wrap = h('div', { className: 'cripto-tile' });

  const text = h('textarea', {
    className: 'input', rows: 4,
    placeholder: 'Texto plano ou cifrado…',
    value: 'BALUARTE',
    oninput: debounce(render, 80)
  });
  const out = h('div', { className: 'cripto-out u-mono' });

  function render() {
    out.textContent = atbash(text.value);
  }

  /* Tabela de substituição visual */
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const tableRows = [];
  for (let i = 0; i < 26; i++) {
    const orig = ALPHA[i];
    const sub = ALPHA[25 - i];
    tableRows.push(
      h('div', { className: 'atbash-pair' },
        h('span', { className: 'atbash-pair__a' }, orig),
        h('span', { className: 'atbash-pair__arrow' }, '↔'),
        h('span', { className: 'atbash-pair__b' }, sub)
      )
    );
  }

  wrap.append(
    h('h3', { className: 'cripto-tile__title' }, 'A  Cifra Atbash'),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px' } },
      'Substituição simples: A↔Z, B↔Y, C↔X, … (espelho do alfabeto). ',
      h('strong', null, 'Involução'),
      ': aplicar duas vezes retorna ao original. Sem chave.'
    ),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto', text)
    ),
    h('span', { className: 'cripto-out__label' }, 'Resultado (encode/decode é o mesmo)'),
    out,
    h('div', { className: 'cripto-tile__title-sub' }, '☰ Tabela de substituição'),
    h('div', { className: 'atbash-table' }, ...tableRows)
  );

  setTimeout(render, 0);
  return wrap;
}
