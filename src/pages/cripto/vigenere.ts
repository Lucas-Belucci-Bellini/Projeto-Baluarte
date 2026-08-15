import { h, debounce } from '../../utils/helpers.js';
import { vigenereEncode, vigenereDecode } from '../../utils/cripto-engine.js';

export function vigenerePanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const text = h('textarea', { className: 'input', rows: 3, placeholder: 'Texto plano ou cifrado…', value: 'O baluarte nao cede', oninput: debounce(render, 80) });
  const key = h('input', { className: 'input', type: 'text', placeholder: 'Chave (apenas letras)', value: 'OMEGA', oninput: debounce(render, 80) });
  const encOut = h('div', { className: 'cripto-out u-mono' });
  const decOut = h('div', { className: 'cripto-out u-mono' });
  const stretchEl = h('div', { className: 'vigenere-stretch u-mono u-text-muted' });
  function render(): void {
    encOut.textContent = vigenereEncode(text.value, key.value);
    decOut.textContent = vigenereDecode(text.value, key.value);
    const normalizedKey = key.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!normalizedKey) { stretchEl.textContent = '(chave inválida)'; return; }
    let keyIndex = 0;
    const stretched = [...text.value].map((character) => {
      if (!/[A-Za-z]/.test(character)) return ' ';
      const characterKey = normalizedKey[keyIndex % normalizedKey.length] ?? '';
      keyIndex += 1;
      return characterKey;
    }).join('');
    stretchEl.textContent = stretched;
  }
  wrap.append(h('h3', { className: 'cripto-tile__title' }, 'V  Cifra de Vigenère'), h('p', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'Cifra polialfabética: cada letra do texto é deslocada conforme a letra correspondente da chave (repetida). ', 'Resistente a frequência simples; ', h('strong', null, 'criptoanálise por Kasiski/Friedman'), ' funciona contra textos longos.'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto', text), h('label', null, 'Chave (letras A-Z)', key)), h('span', { className: 'cripto-out__label' }, 'Chave esticada (alinhada com o texto)'), stretchEl, h('div', { className: 'cripto-tile__row' }, h('div', { className: 'cripto-tile__col' }, h('span', { className: 'cripto-out__label' }, 'Encode (cifrar)'), encOut), h('div', { className: 'cripto-tile__col' }, h('span', { className: 'cripto-out__label' }, 'Decode (decifrar)'), decOut)));
  setTimeout(render, 0);
  return wrap;
}
