import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast.js';
import { toMorse, fromMorse, playMorse, stopMorse } from '../../utils/cripto-engine.js';

export function morsePanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const textInput = h('textarea', { className: 'input', rows: 3, placeholder: 'Texto plano…', value: 'SOS BALUARTE', oninput: debounce(renderEnc, 80) });
  const morseInput = h('textarea', { className: 'input', rows: 3, placeholder: 'Código Morse (ponto = ., traço = -, palavras separadas por /)', value: '... --- ... / -... .- .-.. ..- .- .-. - .', oninput: debounce(renderDec, 80) });
  const morseOut = h('div', { className: 'cripto-out cripto-morse-out u-mono' });
  const textOut = h('div', { className: 'cripto-out u-mono' });
  const wpm = h('input', { className: 'input', type: 'number', value: '18', min: '5', max: '40' });
  const freq = h('input', { className: 'input', type: 'number', value: '600', min: '200', max: '1500' });
  const playBtn = h('button', { className: 'btn btn--primary', onclick: (): void => { try { const duration = playMorse(morseOut.textContent || textInput.value, { wpm: Number.parseInt(wpm.value, 10) || 18, freq: Number.parseInt(freq.value, 10) || 600 }); toast(`Reproduzindo Morse (${Math.ceil(duration)}s)…`, { type: 'info', duration: 2000 }); } catch (error: unknown) { toast(`Erro: ${error instanceof Error ? error.message : 'erro desconhecido'}`, { type: 'danger' }); } } }, '▶ Tocar');
  const stopBtn = h('button', { className: 'btn btn--soft', onclick: (): void => { stopMorse(); toast('Parado', { type: 'info' }); } }, '■ Parar');
  function renderEnc(): void { morseOut.textContent = toMorse(textInput.value); }
  function renderDec(): void { textOut.textContent = fromMorse(morseInput.value); }
  wrap.append(h('h3', { className: 'cripto-tile__title' }, '· ─  Código Morse'), h('div', { className: 'cripto-tile__title-sub' }, '↑ Texto → Morse'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto', textInput)), h('span', { className: 'cripto-out__label' }, 'Saída Morse'), morseOut, h('div', { className: 'cripto-tile__title-sub' }, '↓ Morse → Texto'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Código Morse (espaço entre letras, / entre palavras)', morseInput)), h('span', { className: 'cripto-out__label' }, 'Texto decodificado'), textOut, h('div', { className: 'cripto-tile__title-sub' }, '◉ Áudio'), h('div', { className: 'cripto-tile__grid', style: { gridTemplateColumns: '1fr 1fr' } }, h('label', null, 'Velocidade (WPM)', wpm), h('label', null, 'Frequência (Hz)', freq)), h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } }, playBtn, stopBtn), h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: '8px' } }, 'Toca a saída do encoder via ', h('code', null, 'AudioContext'), '. WPM padrão: 18 (palavras por minuto), tom: 600 Hz.'));
  setTimeout(() => { renderEnc(); renderDec(); }, 0);
  return wrap;
}
