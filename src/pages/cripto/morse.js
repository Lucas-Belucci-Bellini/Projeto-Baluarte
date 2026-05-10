/**
 * Código Morse — encode + decode + áudio (Web Audio).
 */

import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast.js';
import { toMorse, fromMorse, playMorse, stopMorse } from '../../utils/cripto-engine.js';

export function morsePanel() {
  const wrap = h('div', { className: 'cripto-tile' });

  const textInput = h('textarea', {
    className: 'input', rows: 3,
    placeholder: 'Texto plano…',
    value: 'SOS BALUARTE',
    oninput: debounce(renderEnc, 80)
  });
  const morseInput = h('textarea', {
    className: 'input', rows: 3,
    placeholder: 'Código Morse (ponto = ., traço = -, palavras separadas por /)',
    value: '... --- ... / -... .- .-.. ..- .- .-. - .',
    oninput: debounce(renderDec, 80)
  });
  const morseOut = h('div', { className: 'cripto-out cripto-morse-out u-mono' });
  const textOut = h('div', { className: 'cripto-out u-mono' });
  const wpm = h('input', { className: 'input', type: 'number', value: '18', min: '5', max: '40' });
  const freq = h('input', { className: 'input', type: 'number', value: '600', min: '200', max: '1500' });
  const playBtn = h('button', {
    className: 'btn btn--primary',
    onclick: () => {
      try {
        const dur = playMorse(morseOut.textContent || textInput.value, {
          wpm: parseInt(wpm.value, 10) || 18,
          freq: parseInt(freq.value, 10) || 600
        });
        toast(`Reproduzindo Morse (${Math.ceil(dur)}s)…`, { type: 'info', duration: 2000 });
      } catch (e) {
        toast('Erro: ' + e.message, { type: 'danger' });
      }
    }
  }, '▶ Tocar');
  const stopBtn = h('button', {
    className: 'btn btn--soft',
    onclick: () => { stopMorse(); toast('Parado', { type: 'info' }); }
  }, '■ Parar');

  function renderEnc() {
    morseOut.textContent = toMorse(textInput.value);
  }
  function renderDec() {
    textOut.textContent = fromMorse(morseInput.value);
  }

  wrap.append(
    h('h3', { className: 'cripto-tile__title' }, '· ─  Código Morse'),

    h('div', { className: 'cripto-tile__title-sub' }, '↑ Texto → Morse'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto', textInput)
    ),
    h('span', { className: 'cripto-out__label' }, 'Saída Morse'),
    morseOut,

    h('div', { className: 'cripto-tile__title-sub' }, '↓ Morse → Texto'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Código Morse (espaço entre letras, / entre palavras)', morseInput)
    ),
    h('span', { className: 'cripto-out__label' }, 'Texto decodificado'),
    textOut,

    h('div', { className: 'cripto-tile__title-sub' }, '◉ Áudio'),
    h('div', { className: 'cripto-tile__grid', style: { gridTemplateColumns: '1fr 1fr' } },
      h('label', null, 'Velocidade (WPM)', wpm),
      h('label', null, 'Frequência (Hz)', freq)
    ),
    h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
      playBtn, stopBtn
    ),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: '8px' } },
      'Toca a saída do encoder via ',
      h('code', null, 'AudioContext'),
      '. WPM padrão: 18 (palavras por minuto), tom: 600 Hz.')
  );

  setTimeout(() => { renderEnc(); renderDec(); }, 0);
  return wrap;
}
