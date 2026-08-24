import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast';
import { caesarEncode, caesarDecode, caesarBruteforce, ptScore } from '../../utils/cripto-engine.js';
import type { CaesarCandidate } from '../../utils/cripto-engine.js';

interface RankedCandidate extends CaesarCandidate { readonly score: number; }

export function caesarPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const input = h('textarea', { className: 'input', rows: 3, placeholder: 'Texto plano…', value: 'O baluarte nao cede', oninput: debounce(render, 100) });
  const shift = h('input', { className: 'input', type: 'number', value: '3', min: '0', max: '25', oninput: debounce(render, 100) });
  const encOut = h('div', { className: 'cripto-out u-mono' });
  const decOut = h('div', { className: 'cripto-out u-mono' });
  const bfOut = h('div', { className: 'cripto-bf' });
  function render(): void {
    const text = input.value;
    const amount = Number.parseInt(shift.value, 10) || 0;
    encOut.textContent = caesarEncode(text, amount);
    decOut.textContent = caesarDecode(text, amount);
    bfOut.innerHTML = '';
    const ranked: RankedCandidate[] = caesarBruteforce(text).map((candidate) => ({ ...candidate, score: ptScore(candidate.text) })).sort((left, right) => right.score - left.score);
    ranked.forEach((candidate, index) => {
      const row = h('div', { className: `cripto-bf__row${index === 0 ? ' is-best' : ''}`, title: `Score PT: ${candidate.score}`, onclick: (): void => { shift.value = String(candidate.shift); render(); toast(`Shift = ${candidate.shift}`, { type: 'info' }); } }, h('span', { className: 'cripto-bf__shift' }, `shift ${String(candidate.shift).padStart(2, '0')}`), h('span', { className: 'cripto-bf__text u-mono' }, candidate.text || '(vazio)'), h('span', { className: 'cripto-bf__score u-mono u-text-muted' }, `s=${candidate.score}`));
      bfOut.appendChild(row);
    });
  }
  wrap.append(h('h3', { className: 'cripto-tile__title' }, 'C  Cifra de César'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto', input), h('label', null, 'Shift (0-25)', shift)), h('div', { className: 'cripto-tile__row' }, h('div', { className: 'cripto-tile__col' }, h('span', { className: 'cripto-out__label' }, 'Cifrado (encode)'), encOut), h('div', { className: 'cripto-tile__col' }, h('span', { className: 'cripto-out__label' }, 'Decifrado (decode)'), decOut)), h('div', { className: 'cripto-tile__title-sub' }, '⌖ Brute force (clique para usar)'), bfOut);
  setTimeout(render, 0);
  return wrap;
}
