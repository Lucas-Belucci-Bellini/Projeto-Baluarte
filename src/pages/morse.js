/**
 * Página /morse — Gerador de Mensagens em Código Morse (v2.0.0).
 *
 * - Texto → Morse e Morse → Texto (bidirecional)
 * - Reprodução em áudio (oscilador Web Audio) com WPM e frequência ajustáveis
 * - Flash visual sincronizado (lanterna de sinalização)
 * - Tabela de referência completa
 */

import '../styles/morse.css';
import { h, cx } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  MORSE_TABLE,
  textToMorse,
  morseToText,
  morseToSegments
} from '../data/morse-code.js';

const STORAGE_KEY = 'morse:state';

function loadState() {
  return storage.get(STORAGE_KEY) || {
    text: 'PROJETO BALUARTE',
    wpm: 18,
    freq: 600
  };
}

/* O AudioContext é de MÓDULO de propósito: o navegador limita quantos existem
 * por aba, então reaproveitar um entre visitas é o certo. O que NÃO pode ser de
 * módulo é o estado da transmissão — ver `morsePage()`. */
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function morsePage() {
  const state = loadState();
  const fullPage = h('div', { className: 'page-morse' });

  /* Estado da transmissão — POR INSTÂNCIA, não de módulo.
   *
   * Era `let playing` no topo do arquivo, e isso quebrava a tela de um jeito
   * que nenhum teste de tela única pega: quem saísse no meio da transmissão
   * deixava `playing === true` para sempre. Ao voltar, a página nova via a
   * bandeira levantada pela página velha, e o Play só respondia com
   * `stopFlag = true` — botão morto, sem erro no console, sem pista nenhuma.
   * Medido antes do conserto: voltar e clicar Play criava zero osciladores. */
  let playing = false;
  let stopFlag = false;
  let transmissao = null;      // { osc, timers, guard } da transmissão em curso

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'CÓDIGO MORSE')
      ),
      h('h1', { className: 'page-header__title' }, '··− Gerador de Código Morse'),
      h('p', { className: 'page-header__description' },
        'Converte mensagens entre texto e ',
        h('span', { className: 'u-text-cyan' }, 'código Morse internacional'),
        '. Reproduz o sinal em áudio (oscilador) e em flash visual, com velocidade ',
        'em WPM e tom ajustáveis. Timing padrão PARIS.'
      )
    )
  );

  /* ===== Modo de conversão ===== */
  let mode = 'encode'; /* encode = texto→morse | decode = morse→texto */

  const inputArea = h('textarea', {
    className: 'morse-input',
    rows: 4,
    spellcheck: false,
    placeholder: 'Digite a mensagem…',
    value: state.text,
    oninput: () => { render(); persist(); }
  });

  const outputBox = h('div', { className: 'morse-output u-mono' });

  const encodeBtn = h('button', {
    className: cx('morse-mode-btn', mode === 'encode' && 'is-active'),
    onclick: () => { mode = 'encode'; swapMode(); }
  }, 'TEXTO → MORSE');

  const decodeBtn = h('button', {
    className: cx('morse-mode-btn', mode === 'decode' && 'is-active'),
    onclick: () => { mode = 'decode'; swapMode(); }
  }, 'MORSE → TEXTO');

  function swapMode() {
    encodeBtn.classList.toggle('is-active', mode === 'encode');
    decodeBtn.classList.toggle('is-active', mode === 'decode');
    inputArea.placeholder = mode === 'encode'
      ? 'Digite a mensagem…'
      : 'Cole o código Morse (. e -, palavras separadas por /)…';
    render();
  }

  /* ===== Lâmpada de flash ===== */
  const lamp = h('div', { className: 'morse-lamp' });
  const lampTrack = h('div', { className: 'morse-lamp__track u-mono' }, 'pronto');

  /* ===== Controles de reprodução ===== */
  const wpmLabel = h('span', { className: 'u-mono u-text-cyan morse-ctl__val' }, `${state.wpm} WPM`);
  const wpmSlider = h('input', {
    type: 'range', min: '5', max: '40', step: '1', value: String(state.wpm),
    'aria-label': 'Velocidade em palavras por minuto',
    oninput: (e) => { state.wpm = parseInt(e.target.value, 10); wpmLabel.textContent = `${state.wpm} WPM`; persist(); }
  });

  const freqLabel = h('span', { className: 'u-mono u-text-cyan morse-ctl__val' }, `${state.freq} Hz`);
  const freqSlider = h('input', {
    type: 'range', min: '300', max: '1000', step: '20', value: String(state.freq),
    'aria-label': 'Tom do sinal em hertz',
    oninput: (e) => { state.freq = parseInt(e.target.value, 10); freqLabel.textContent = `${state.freq} Hz`; persist(); }
  });

  const playBtn = h('button', { className: 'btn btn--primary' }, '▶ Reproduzir');
  const stopBtn = h('button', { className: 'btn btn--ghost' }, '■ Parar');

  playBtn.onclick = () => {
    const morse = currentMorse();
    if (!morse || !morse.replace(/[\s/|]/g, '')) {
      toast('Nada para reproduzir', { type: 'warning' });
      return;
    }
    playMorse(morse);
  };
  stopBtn.onclick = () => { stopFlag = true; };

  function playMorse(morse) {
    if (playing) { stopFlag = true; return; }
    const segs = morseToSegments(morse, state.wpm);
    if (!segs.length) return;

    playing = true;
    stopFlag = false;
    playBtn.textContent = '⏸ Tocando…';
    playBtn.disabled = true;

    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = state.freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);

    let t = ctx.currentTime + 0.08;
    const startAt = t;
    for (const s of segs) {
      const dur = s.ms / 1000;
      if (s.on) {
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.006);
        gain.gain.setValueAtTime(0.28, Math.max(t + 0.006, t + dur - 0.006));
        gain.gain.linearRampToValueAtTime(0, t + dur);
      }
      t += dur;
    }
    osc.start(startAt);
    osc.stop(t + 0.05);

    /* Flash visual sincronizado via setTimeout */
    let elapsed = 0;
    const timers = [];
    for (const s of segs) {
      if (s.on) {
        timers.push(setTimeout(() => { if (!stopFlag) lamp.classList.add('is-on'); }, elapsed));
        timers.push(setTimeout(() => lamp.classList.remove('is-on'), elapsed + s.ms));
      }
      elapsed += s.ms;
    }
    lampTrack.textContent = morse;

    const finish = () => {
      playing = false;
      transmissao = null;
      playBtn.textContent = '▶ Reproduzir';
      playBtn.disabled = false;
      lamp.classList.remove('is-on');
      lampTrack.textContent = stopFlag ? 'parado' : 'concluído';
      timers.forEach(clearTimeout);
      clearInterval(guard);
      if (stopFlag) { try { osc.stop(); } catch { /* já parou sozinho */ } }
    };
    const fim = setTimeout(finish, elapsed + 120);
    const guard = setInterval(() => {
      if (stopFlag || !playing) finish();
    }, 100);
    timers.push(fim);
    transmissao = { osc, timers, guard };
  }

  /* Sair da tela no meio da transmissão precisa CALAR o oscilador: ele já está
   * agendado até o fim da mensagem no relógio do AudioContext e continuaria
   * apitando por cima da tela seguinte. */
  function pararTransmissao() {
    if (!transmissao) return;
    stopFlag = true;
    playing = false;
    clearInterval(transmissao.guard);
    transmissao.timers.forEach(clearTimeout);
    try { transmissao.osc.stop(); } catch { /* já parou sozinho */ }
    transmissao = null;
  }
  aoSair(fullPage, pararTransmissao);

  /* ===== Botões utilitários ===== */
  const copyBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const out = mode === 'encode' ? currentMorse() : morseToText(inputArea.value);
      navigator.clipboard.writeText(out).then(
        () => toast('Resultado copiado', { type: 'success' }),
        () => toast('Falha ao copiar', { type: 'danger' })
      );
    }
  }, '⧉ Copiar saída');

  const swapBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const out = mode === 'encode' ? currentMorse() : morseToText(inputArea.value);
      inputArea.value = out;
      mode = mode === 'encode' ? 'decode' : 'encode';
      swapMode();
      persist();
    }
  }, '⇅ Inverter');

  const clearBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => { inputArea.value = ''; render(); persist(); }
  }, '✕ Limpar');

  /* ===== Lógica de render ===== */
  function currentMorse() {
    return mode === 'encode' ? textToMorse(inputArea.value) : inputArea.value;
  }

  function render() {
    setStatus('morse', { modo: mode, caracteres: inputArea.value.length });
    const result = mode === 'encode'
      ? textToMorse(inputArea.value)
      : morseToText(inputArea.value);
    outputBox.textContent = result || '—';
    const hasUnknown = mode === 'encode' ? result.includes('#') : result.includes('�');
    outputBox.classList.toggle('has-warning', hasUnknown);
  }

  function persist() {
    storage.set(STORAGE_KEY, { text: inputArea.value, wpm: state.wpm, freq: state.freq });
  }

  /* ===== Layout ===== */
  fullPage.appendChild(
    h('div', { className: 'morse-modes' }, encodeBtn, decodeBtn)
  );

  fullPage.appendChild(
    h('div', { className: 'morse-grid' },
      h('div', { className: 'morse-panel card' },
        h('div', { className: 'morse-panel__label' }, 'ENTRADA'),
        inputArea
      ),
      h('div', { className: 'morse-panel card' },
        h('div', { className: 'morse-panel__label' }, 'SAÍDA'),
        outputBox,
        h('div', { className: 'morse-panel__actions' }, copyBtn, swapBtn, clearBtn)
      )
    )
  );

  /* Painel de sinal */
  fullPage.appendChild(
    h('div', { className: 'morse-signal card' },
      h('div', { className: 'morse-signal__lamp-wrap' },
        lamp,
        h('div', { className: 'morse-signal__caption u-text-muted' }, 'FAROL DE SINALIZAÇÃO')
      ),
      h('div', { className: 'morse-signal__body' },
        h('div', { className: 'morse-ctl' },
          h('label', null, 'Velocidade'), wpmSlider, wpmLabel),
        h('div', { className: 'morse-ctl' },
          h('label', null, 'Tom'), freqSlider, freqLabel),
        h('div', { className: 'morse-signal__buttons' }, playBtn, stopBtn),
        h('div', { className: 'morse-lamp__track-wrap u-mono' }, lampTrack)
      )
    )
  );

  /* Tabela de referência */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Tabela de Referência'))
  );

  const refGrid = h('div', { className: 'morse-ref' });
  Object.entries(MORSE_TABLE).forEach(([ch, code]) => {
    refGrid.appendChild(
      h('button', {
        className: 'morse-ref__cell',
        title: `Inserir "${ch}"`,
        onclick: () => {
          if (mode === 'encode') inputArea.value += ch;
          else inputArea.value += (inputArea.value && !inputArea.value.endsWith(' ') ? ' ' : '') + code;
          render();
          persist();
        }
      },
        h('span', { className: 'morse-ref__char' }, ch === ' ' ? '␣' : ch),
        h('span', { className: 'morse-ref__code u-mono' }, code)
      )
    );
  });
  fullPage.appendChild(refGrid);

  render();
  return fullPage;
}
