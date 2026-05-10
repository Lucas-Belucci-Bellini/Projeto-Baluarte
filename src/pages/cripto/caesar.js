/**
 * César — encode, decode e brute force.
 */

import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast.js';
import { caesarEncode, caesarDecode, caesarBruteforce, ptScore } from '../../utils/cripto-engine.js';

export function caesarPanel() {
  const wrap = h('div', { className: 'cripto-tile' });

  const input = h('textarea', {
    className: 'input',
    rows: 3,
    placeholder: 'Texto plano…',
    value: 'O baluarte nao cede',
    oninput: debounce(render, 100)
  });
  const shift = h('input', {
    className: 'input', type: 'number', value: '3', min: '0', max: '25',
    oninput: debounce(render, 100)
  });
  const encOut = h('div', { className: 'cripto-out u-mono' });
  const decOut = h('div', { className: 'cripto-out u-mono' });
  const bfOut = h('div', { className: 'cripto-bf' });

  function render() {
    const text = input.value;
    const s = parseInt(shift.value, 10) || 0;
    encOut.textContent = caesarEncode(text, s);
    decOut.textContent = caesarDecode(text, s);

    /* Brute force ranking */
    bfOut.innerHTML = '';
    const all = caesarBruteforce(text)
      .map((r) => ({ ...r, score: ptScore(r.text) }))
      .sort((a, b) => b.score - a.score);

    all.forEach((r, idx) => {
      const row = h('div', {
        className: 'cripto-bf__row' + (idx === 0 ? ' is-best' : ''),
        title: `Score PT: ${r.score}`,
        onclick: () => {
          shift.value = r.shift;
          render();
          toast(`Shift = ${r.shift}`, { type: 'info' });
        }
      },
        h('span', { className: 'cripto-bf__shift' }, 'shift ' + String(r.shift).padStart(2, '0')),
        h('span', { className: 'cripto-bf__text u-mono' }, r.text || '(vazio)'),
        h('span', { className: 'cripto-bf__score u-mono u-text-muted' }, 's=' + r.score)
      );
      bfOut.appendChild(row);
    });
  }

  wrap.append(
    h('h3', { className: 'cripto-tile__title' }, 'C  Cifra de César'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto', input),
      h('label', null, 'Shift (0-25)', shift)
    ),
    h('div', { className: 'cripto-tile__row' },
      h('div', { className: 'cripto-tile__col' },
        h('span', { className: 'cripto-out__label' }, 'Cifrado (encode)'),
        encOut
      ),
      h('div', { className: 'cripto-tile__col' },
        h('span', { className: 'cripto-out__label' }, 'Decifrado (decode)'),
        decOut
      )
    ),
    h('div', { className: 'cripto-tile__title-sub' }, '⌖ Brute force (clique para usar)'),
    bfOut
  );

  setTimeout(render, 0);
  return wrap;
}
