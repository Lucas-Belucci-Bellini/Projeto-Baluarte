/**
 * Página /morse — Gerador de Mensagens em Código Morse.
 *
 * Texto ↔ Morse, reprodução em áudio com WPM/frequência ajustáveis, flash
 * visual sincronizado e tabela de referência completa.
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
  morseToSegments,
} from '../data/morse-code.js';
import type { MorseSegment } from '../data/morse-code.js';

const STORAGE_KEY = 'morse:state';
type MorseMode = 'encode' | 'decode';

interface MorseState {
  text: string;
  wpm: number;
  freq: number;
}

interface Transmission {
  readonly osc: OscillatorNode;
  readonly timers: number[];
  readonly guard: number;
}

function isMorseState(value: unknown): value is MorseState {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.text === 'string'
    && typeof candidate.wpm === 'number'
    && Number.isFinite(candidate.wpm)
    && typeof candidate.freq === 'number'
    && Number.isFinite(candidate.freq);
}

function loadState(): MorseState {
  const stored: unknown = storage.get<unknown>(STORAGE_KEY, null);
  if (isMorseState(stored)) return { ...stored };
  return { text: 'PROJETO BALUARTE', wpm: 18, freq: 600 };
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const windowWithWebkit = window as Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const Constructor = window.AudioContext ?? windowWithWebkit.webkitAudioContext;
    if (!Constructor) throw new Error('Web Audio API não disponível');
    audioCtx = new Constructor();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

export function morsePage(): HTMLDivElement {
  const state = loadState();
  const fullPage = h('div', { className: 'page-morse' });
  let playing = false;
  let stopFlag = false;
  let transmission: Transmission | null = null;

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'CÓDIGO MORSE'),
      ),
      h('h1', { className: 'page-header__title' }, '··− Gerador de Código Morse'),
      h('p', { className: 'page-header__description' },
        'Converte mensagens entre texto e ',
        h('span', { className: 'u-text-cyan' }, 'código Morse internacional'),
        '. Reproduz o sinal em áudio (oscilador) e em flash visual, com velocidade ',
        'em WPM e tom ajustáveis. Timing padrão PARIS.',
      ),
    ),
  );

  let mode: MorseMode = 'encode';
  const inputArea = h('textarea', {
    className: 'morse-input',
    rows: 4,
    spellcheck: false,
    placeholder: 'Digite a mensagem…',
    value: state.text,
    oninput: () => {
      render();
      persist();
    },
  });
  const outputBox = h('div', { className: 'morse-output u-mono' });
  const encodeBtn = h('button', {
    className: cx('morse-mode-btn', mode === 'encode' && 'is-active'),
    onclick: () => {
      mode = 'encode';
      swapMode();
    },
  }, 'TEXTO → MORSE');
  const decodeBtn = h('button', {
    className: 'morse-mode-btn',
    onclick: () => {
      mode = 'decode';
      swapMode();
    },
  }, 'MORSE → TEXTO');

  function swapMode(): void {
    encodeBtn.classList.toggle('is-active', mode === 'encode');
    decodeBtn.classList.toggle('is-active', mode === 'decode');
    inputArea.placeholder = mode === 'encode'
      ? 'Digite a mensagem…'
      : 'Cole o código Morse (. e -, palavras separadas por /)…';
    render();
  }

  const lamp = h('div', { className: 'morse-lamp' });
  const lampTrack = h('div', { className: 'morse-lamp__track u-mono' }, 'pronto');
  const wpmLabel = h('span', {
    className: 'u-mono u-text-cyan morse-ctl__val',
  }, `${state.wpm} WPM`);
  const wpmSlider = h('input', {
    type: 'range',
    min: '5',
    max: '40',
    step: '1',
    value: String(state.wpm),
    'aria-label': 'Velocidade em palavras por minuto',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      state.wpm = Number.parseInt(input.value, 10);
      wpmLabel.textContent = `${state.wpm} WPM`;
      persist();
    },
  });
  const freqLabel = h('span', {
    className: 'u-mono u-text-cyan morse-ctl__val',
  }, `${state.freq} Hz`);
  const freqSlider = h('input', {
    type: 'range',
    min: '300',
    max: '1000',
    step: '20',
    value: String(state.freq),
    'aria-label': 'Tom do sinal em hertz',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      state.freq = Number.parseInt(input.value, 10);
      freqLabel.textContent = `${state.freq} Hz`;
      persist();
    },
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
  stopBtn.onclick = () => {
    stopFlag = true;
  };

  function playMorse(morse: string): void {
    if (playing) {
      stopFlag = true;
      return;
    }
    const segments: readonly MorseSegment[] = morseToSegments(morse, state.wpm);
    if (!segments.length) return;

    playing = true;
    stopFlag = false;
    playBtn.textContent = '⏸ Tocando…';
    playBtn.disabled = true;

    const context = getCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = state.freq;
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(context.destination);

    let currentTime = context.currentTime + 0.08;
    const startAt = currentTime;
    for (const segment of segments) {
      const duration = segment.ms / 1000;
      if (segment.on) {
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.28, currentTime + 0.006);
        gain.gain.setValueAtTime(0.28, Math.max(currentTime + 0.006, currentTime + duration - 0.006));
        gain.gain.linearRampToValueAtTime(0, currentTime + duration);
      }
      currentTime += duration;
    }
    oscillator.start(startAt);
    oscillator.stop(currentTime + 0.05);

    let elapsed = 0;
    const timers: number[] = [];
    for (const segment of segments) {
      if (segment.on) {
        timers.push(window.setTimeout(() => {
          if (!stopFlag) lamp.classList.add('is-on');
        }, elapsed));
        timers.push(window.setTimeout(() => lamp.classList.remove('is-on'), elapsed + segment.ms));
      }
      elapsed += segment.ms;
    }
    lampTrack.textContent = morse;

    const finish = (): void => {
      playing = false;
      transmission = null;
      playBtn.textContent = '▶ Reproduzir';
      playBtn.disabled = false;
      lamp.classList.remove('is-on');
      lampTrack.textContent = stopFlag ? 'parado' : 'concluído';
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(guard);
      if (stopFlag) {
        try {
          oscillator.stop();
        } catch {
          /* já parou sozinho */
        }
      }
    };
    const finishTimer = window.setTimeout(finish, elapsed + 120);
    const guard = window.setInterval(() => {
      if (stopFlag || !playing) finish();
    }, 100);
    timers.push(finishTimer);
    transmission = { osc: oscillator, timers, guard };
  }

  function stopTransmission(): void {
    if (!transmission) return;
    stopFlag = true;
    playing = false;
    window.clearInterval(transmission.guard);
    transmission.timers.forEach((timer) => window.clearTimeout(timer));
    try {
      transmission.osc.stop();
    } catch {
      /* já parou sozinho */
    }
    transmission = null;
  }
  aoSair(fullPage, stopTransmission);

  const copyButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const output = mode === 'encode' ? currentMorse() : morseToText(inputArea.value);
      navigator.clipboard.writeText(output).then(
        () => toast('Resultado copiado', { type: 'success' }),
        () => toast('Falha ao copiar', { type: 'danger' }),
      );
    },
  }, '⧉ Copiar saída');
  const swapButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const output = mode === 'encode' ? currentMorse() : morseToText(inputArea.value);
      inputArea.value = output;
      mode = mode === 'encode' ? 'decode' : 'encode';
      swapMode();
      persist();
    },
  }, '⇅ Inverter');
  const clearButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      inputArea.value = '';
      render();
      persist();
    },
  }, '✕ Limpar');

  function currentMorse(): string {
    return mode === 'encode' ? textToMorse(inputArea.value) : inputArea.value;
  }

  function render(): void {
    setStatus('morse', { modo: mode, caracteres: inputArea.value.length });
    const result = mode === 'encode'
      ? textToMorse(inputArea.value)
      : morseToText(inputArea.value);
    outputBox.textContent = result || '—';
    const hasUnknown = mode === 'encode' ? result.includes('#') : result.includes('�');
    outputBox.classList.toggle('has-warning', hasUnknown);
  }

  function persist(): void {
    storage.set(STORAGE_KEY, {
      text: inputArea.value,
      wpm: state.wpm,
      freq: state.freq,
    });
  }

  fullPage.appendChild(h('div', { className: 'morse-modes' }, encodeBtn, decodeBtn));
  fullPage.appendChild(
    h('div', { className: 'morse-grid' },
      h('div', { className: 'morse-panel card' },
        h('div', { className: 'morse-panel__label' }, 'ENTRADA'),
        inputArea,
      ),
      h('div', { className: 'morse-panel card' },
        h('div', { className: 'morse-panel__label' }, 'SAÍDA'),
        outputBox,
        h('div', { className: 'morse-panel__actions' }, copyButton, swapButton, clearButton),
      ),
    ),
  );
  fullPage.appendChild(
    h('div', { className: 'morse-signal card' },
      h('div', { className: 'morse-signal__lamp-wrap' },
        lamp,
        h('div', { className: 'morse-signal__caption u-text-muted' }, 'FAROL DE SINALIZAÇÃO'),
      ),
      h('div', { className: 'morse-signal__body' },
        h('div', { className: 'morse-ctl' },
          h('label', null, 'Velocidade'),
          wpmSlider,
          wpmLabel,
        ),
        h('div', { className: 'morse-ctl' },
          h('label', null, 'Tom'),
          freqSlider,
          freqLabel,
        ),
        h('div', { className: 'morse-signal__buttons' }, playBtn, stopBtn),
        h('div', { className: 'morse-lamp__track-wrap u-mono' }, lampTrack),
      ),
    ),
  );
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Tabela de Referência'),
    ),
  );

  const referenceGrid = h('div', { className: 'morse-ref' });
  Object.entries(MORSE_TABLE).forEach(([character, code]) => {
    referenceGrid.appendChild(
      h('button', {
        className: 'morse-ref__cell',
        title: `Inserir "${character}"`,
        onclick: () => {
          if (mode === 'encode') inputArea.value += character;
          else inputArea.value += (
            inputArea.value && !inputArea.value.endsWith(' ') ? ' ' : ''
          ) + code;
          render();
          persist();
        },
      },
        h('span', { className: 'morse-ref__char' }, character === ' ' ? '␣' : character),
        h('span', { className: 'morse-ref__code u-mono' }, code),
      ),
    );
  });
  fullPage.appendChild(referenceGrid);
  render();
  return fullPage;
}
