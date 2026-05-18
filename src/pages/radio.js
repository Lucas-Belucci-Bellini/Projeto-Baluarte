/**
 * Página /radio — Rádio de Frequências (v2.0.0).
 *
 * Um receptor de rádio sintetizado via Web Audio: o dial percorre toda
 * a banda, gera estática entre as estações e "trava" o sinal quando
 * você sintoniza uma frequência de estação. 100% offline.
 */

import { h, cx } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';

const STORAGE_KEY = 'radio:state';
const BAND_MIN = 87.5;
const BAND_MAX = 108.0;
const LOCK_RANGE = 0.35; /* MHz de tolerância para travar a estação */

/* Estações fixas — cada uma emite um sinal sintetizado distinto. */
const STATIONS = [
  { freq: 89.1,  nome: 'Núcleo FM',        tipo: 'tom',   tom: 220, wave: 'sine',     desc: 'Portadora grave do Núcleo Infinity.' },
  { freq: 92.4,  nome: 'Rádio Alfa',       tipo: 'acorde', tom: 330, wave: 'triangle', desc: 'Acorde de três tons da equipe ALFA.' },
  { freq: 95.7,  nome: 'Sinal Morse OMEGA', tipo: 'morse', tom: 620, wave: 'sine',     desc: 'Baliza repetindo "BALUARTE" em Morse.' },
  { freq: 98.9,  nome: 'Onda Drift',       tipo: 'sweep', tom: 440, wave: 'sawtooth',  desc: 'Varredura contínua estilo Eurobeat.' },
  { freq: 101.5, nome: 'Estação Vanadis',  tipo: 'tom',   tom: 523, wave: 'sine',      desc: 'Tom cristalino de referência.' },
  { freq: 104.3, nome: 'Frequência 11',    tipo: 'acorde', tom: 174, wave: 'square',   desc: 'Acorde sombrio do arco INDIA.' },
  { freq: 106.8, nome: 'Beacon Shadow',    tipo: 'morse', tom: 760, wave: 'square',    desc: 'Baliza cifrada de baixa potência.' }
];

const MORSE = { B: '-...', A: '.-', L: '.-..', U: '..-', R: '.-.', T: '-', E: '.' };
const MORSE_WORD = 'BALUARTE';

let audio = null; /* { ctx, noise, noiseGain, osc, sigGain, master, lfo, lfoGain } */
let routeWatcher = null;

function teardown() {
  if (audio) {
    try { audio.ctx.close(); } catch {}
    audio = null;
  }
}

export function radioPage() {
  const state = storage.get(STORAGE_KEY) || { freq: 95.7, volume: 0.6 };
  if (typeof state.freq !== 'number') state.freq = 95.7;
  if (typeof state.volume !== 'number') state.volume = 0.6;

  let power = false;
  let morseTimer = null;

  const fullPage = h('div', { className: 'page-radio' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MÍDIA'), h('span', null, '›'),
        h('span', null, 'RÁDIO')),
      h('h1', { className: 'page-header__title' }, '◉))) Rádio de Frequências'),
      h('p', { className: 'page-header__description' },
        'Receptor sintetizado via Web Audio. Gire o dial pela banda ',
        h('span', { className: 'u-text-cyan' }, `${BAND_MIN}–${BAND_MAX} MHz`),
        ': entre as estações há estática; ao sintonizar uma frequência ',
        'de estação o sinal trava. Totalmente offline.')
    )
  );

  /* ===== Visor ===== */
  const freqDisplay = h('div', { className: 'radio-display__freq u-mono' }, state.freq.toFixed(1));
  const stationName = h('div', { className: 'radio-display__station' }, '— estática —');
  const signalBars = h('div', { className: 'radio-signal' });
  for (let i = 0; i < 8; i++) signalBars.appendChild(h('span', { className: 'radio-signal__bar' }));

  /* ===== Áudio ===== */
  function startAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();

    /* ruído branco (estática) */
    const bufSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    /* oscilador do sinal da estação */
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440;
    const sigGain = ctx.createGain();
    sigGain.gain.value = 0;

    const master = ctx.createGain();
    master.gain.value = state.volume;

    noise.connect(noiseGain);
    noiseGain.connect(master);
    osc.connect(sigGain);
    sigGain.connect(master);
    master.connect(ctx.destination);

    noise.start();
    osc.start();
    audio = { ctx, noise, noiseGain, osc, sigGain, master };
  }

  /* Estação mais próxima + proximidade 0..1. */
  function nearest(freq) {
    let best = null;
    let bestDist = Infinity;
    for (const s of STATIONS) {
      const d = Math.abs(s.freq - freq);
      if (d < bestDist) { bestDist = d; best = s; }
    }
    const proximity = bestDist <= LOCK_RANGE ? 1 - bestDist / LOCK_RANGE : 0;
    return { station: best, proximity };
  }

  function clearMorse() {
    if (morseTimer) { clearTimeout(morseTimer); morseTimer = null; }
  }

  /* Reproduz a baliza Morse repetindo a palavra. */
  function runMorse(station) {
    clearMorse();
    if (!audio) return;
    const unit = 90;
    const seq = [];
    for (const ch of MORSE_WORD) {
      const code = MORSE[ch] || '';
      for (const sym of code) {
        seq.push({ on: true, ms: sym === '-' ? unit * 3 : unit });
        seq.push({ on: false, ms: unit });
      }
      seq.push({ on: false, ms: unit * 2 });
    }
    let i = 0;
    const step = () => {
      if (!audio || !power) return;
      const { proximity } = nearest(state.freq);
      const seg = seq[i % seq.length];
      const g = seg.on ? proximity * 0.5 : 0;
      audio.sigGain.gain.setTargetAtTime(g, audio.ctx.currentTime, 0.01);
      i++;
      morseTimer = setTimeout(step, seg.ms);
    };
    step();
  }

  /* Atualiza o áudio e o visor conforme a sintonia. */
  function tune() {
    freqDisplay.textContent = state.freq.toFixed(1);
    const { station, proximity } = nearest(state.freq);
    const locked = proximity > 0;

    /* barras de sinal */
    const lit = Math.round(proximity * 8);
    [...signalBars.children].forEach((bar, idx) =>
      bar.classList.toggle('is-lit', idx < lit));

    stationName.textContent = locked && power
      ? `▸ ${station.nome}`
      : (power ? '— estática —' : 'desligado');
    stationName.classList.toggle('is-locked', locked && power);

    if (!audio || !power) return;
    const t = audio.ctx.currentTime;

    /* estática inversamente proporcional à proximidade */
    audio.noiseGain.gain.setTargetAtTime((1 - proximity) * 0.16, t, 0.05);

    if (station) {
      audio.osc.type = station.wave;
      if (station.tipo === 'morse') {
        audio.osc.frequency.setTargetAtTime(station.tom, t, 0.02);
        if (!morseTimer) runMorse(station);
        return;
      }
      clearMorse();
      if (station.tipo === 'sweep') {
        audio.osc.frequency.setTargetAtTime(
          station.tom + Math.sin(t * 1.5) * 120, t, 0.05);
      } else {
        audio.osc.frequency.setTargetAtTime(station.tom, t, 0.03);
      }
      audio.sigGain.gain.setTargetAtTime(proximity * 0.32, t, 0.04);
    } else {
      clearMorse();
      audio.sigGain.gain.setTargetAtTime(0, t, 0.05);
    }
  }

  /* loop leve só para o efeito de sweep contínuo */
  let raf = 0;
  function loop() {
    if (power && audio) {
      const { station } = nearest(state.freq);
      if (station && station.tipo === 'sweep') tune();
    }
    raf = requestAnimationFrame(loop);
  }

  /* ===== Controles ===== */
  const powerBtn = h('button', { className: 'btn btn--primary' }, '⏻ Ligar');
  powerBtn.onclick = () => {
    power = !power;
    if (power) {
      if (!audio) startAudio();
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      powerBtn.textContent = '⏻ Desligar';
      powerBtn.classList.add('is-on');
      if (!raf) loop();
      toast('Rádio ligado', { type: 'success' });
    } else {
      powerBtn.textContent = '⏻ Ligar';
      powerBtn.classList.remove('is-on');
      clearMorse();
      if (audio) {
        audio.noiseGain.gain.value = 0;
        audio.sigGain.gain.value = 0;
      }
    }
    tune();
  };

  const dial = h('input', {
    className: 'radio-dial',
    type: 'range',
    min: String(BAND_MIN),
    max: String(BAND_MAX),
    step: '0.1',
    value: String(state.freq),
    oninput: (e) => {
      state.freq = parseFloat(e.target.value);
      storage.set(STORAGE_KEY, state);
      clearMorse();
      tune();
    }
  });

  const volLabel = h('span', { className: 'u-mono u-text-cyan radio-vol__val' },
    `${Math.round(state.volume * 100)}%`);
  const volSlider = h('input', {
    type: 'range', min: '0', max: '1', step: '0.05', value: String(state.volume),
    oninput: (e) => {
      state.volume = parseFloat(e.target.value);
      volLabel.textContent = `${Math.round(state.volume * 100)}%`;
      storage.set(STORAGE_KEY, state);
      if (audio) audio.master.gain.setTargetAtTime(state.volume, audio.ctx.currentTime, 0.02);
    }
  });

  /* ===== Layout ===== */
  fullPage.appendChild(
    h('div', { className: 'radio-set card' },
      h('div', { className: 'radio-display' },
        h('div', null,
          freqDisplay,
          h('span', { className: 'radio-display__unit' }, 'MHz')),
        stationName,
        signalBars
      ),
      h('div', { className: 'radio-dial-wrap' },
        h('span', { className: 'radio-dial__min' }, String(BAND_MIN)),
        dial,
        h('span', { className: 'radio-dial__max' }, String(BAND_MAX))
      ),
      h('div', { className: 'radio-controls' },
        powerBtn,
        h('label', { className: 'radio-vol' },
          h('span', null, 'Volume'), volSlider, volLabel)
      )
    )
  );

  /* Estações — clique sintoniza */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Estações Conhecidas'))
  );
  const list = h('div', { className: 'radio-stations' });
  STATIONS.forEach((s) => {
    list.appendChild(
      h('button', {
        className: 'radio-station',
        onclick: () => {
          state.freq = s.freq;
          dial.value = String(s.freq);
          storage.set(STORAGE_KEY, state);
          clearMorse();
          tune();
          if (!power) toast('Ligue o rádio para ouvir', { type: 'info' });
        }
      },
        h('span', { className: 'radio-station__freq u-mono' }, s.freq.toFixed(1)),
        h('span', { className: 'radio-station__body' },
          h('span', { className: 'radio-station__nome' }, s.nome),
          h('span', { className: 'radio-station__desc' }, s.desc))
      )
    );
  });
  fullPage.appendChild(list);

  /* Fecha o áudio ao sair da rota */
  if (routeWatcher) window.removeEventListener('hashchange', routeWatcher);
  routeWatcher = () => {
    if (!location.hash.startsWith('#/radio')) {
      clearMorse();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      teardown();
      window.removeEventListener('hashchange', routeWatcher);
      routeWatcher = null;
    }
  };
  window.addEventListener('hashchange', routeWatcher);

  tune();
  return fullPage;
}
