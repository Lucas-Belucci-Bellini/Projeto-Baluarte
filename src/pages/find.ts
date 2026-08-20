/**
 * Página /find — "Onde Estou?" (posição indoor por impressão acústica).
 * JS -> TypeScript: contratos locais para Web Audio e fingerprint DB.
 */

import '../styles/find.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast';
import { createFingerprintDB } from '../utils/fingerprint-engine.js';

const BANDS = 48;
const CAPTURE_MS = 1600;

type RankedLocation = {
  name: string;
  samples: number;
  score: number;
  confidence: number;
};

type KnownLocation = {
  name: string;
  samples: number;
};

type FingerprintDB = {
  learn(name: string, vector: ArrayLike<number>): number;
  classify(vector: ArrayLike<number>): RankedLocation[];
  locations(): KnownLocation[];
  remove(name: string): void;
  clear(): void;
};

type AudioContextCtor = new () => AudioContext;

type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: AudioContextCtor;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Captura uma impressão acústica (vetor de BANDS bandas) via microfone. */
async function captureFingerprint(): Promise<Float32Array> {
  const audioWindow = window as WindowWithWebkitAudio;
  const AC = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AC || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Áudio indisponível neste dispositivo.');
  }

  const ctx = new AC();
  if (ctx.state === 'suspended') await ctx.resume();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
  });
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0;
  src.connect(analyser);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 19000;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();

  const bins = analyser.frequencyBinCount;
  const spec = new Float32Array(bins);
  const acc = new Float32Array(BANDS);
  const per = Math.max(1, Math.floor(bins / BANDS));
  let frames = 0;
  const t0 = performance.now();

  await new Promise<void>((resolve) => {
    const tick = (): void => {
      analyser.getFloatFrequencyData(spec);
      for (let b = 0; b < BANDS; b++) {
        let sum = 0;
        for (let k = 0; k < per; k++) {
          sum += Math.max(0, spec[b * per + k] + 140) / 140;
        }
        acc[b] += sum / per;
      }
      frames++;
      if (performance.now() - t0 >= CAPTURE_MS) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  try {
    osc.stop();
  } catch {
    /* noop */
  }
  stream.getTracks().forEach((track) => track.stop());
  await ctx.close();
  for (let b = 0; b < BANDS; b++) acc[b] /= Math.max(1, frames);
  return acc;
}

export function findPage(): HTMLElement {
  const db = createFingerprintDB() as FingerprintDB;
  const page = h('div', { className: 'page-find' });

  page.append(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'ONDE ESTOU')),
      h('h1', { className: 'page-header__title' }, '🧭 Onde Estou?'),
      h('p', { className: 'page-header__description' },
        'Posição ', h('span', { className: 'u-text-cyan' }, 'indoor por impressão acústica'),
        ' — grave a "assinatura sonora" de cada cômodo e o app adivinha onde você está. Precisa do microfone.')));

  const nameI = h('input', { className: 'input', placeholder: 'Nome do local (ex.: Cozinha)', maxlength: 24 }) as HTMLInputElement;
  const learnBtn = h('button', { className: 'btn btn--primary' }, '🎙 Gravar aqui') as HTMLButtonElement;
  const whereBtn = h('button', { className: 'btn btn--ghost' }, '❓ Onde estou?') as HTMLButtonElement;
  const result = h('div', { className: 'find-result' });
  const locList = h('div', { className: 'find-locs' });

  function busy(on: boolean, btn: HTMLButtonElement | null, label: string): void {
    [learnBtn, whereBtn].forEach((button) => { button.disabled = on; });
    if (btn) btn.textContent = on ? '… ouvindo' : label;
  }

  learnBtn.onclick = async (): Promise<void> => {
    const name = nameI.value.trim();
    if (!name) {
      toast('Dê um nome ao local primeiro.', { type: 'warning' });
      nameI.focus();
      return;
    }
    busy(true, learnBtn, '🎙 Gravar aqui');
    try {
      const vec = await captureFingerprint();
      const n = db.learn(name, vec);
      toast(`"${name}" gravado (${n} amostra${n > 1 ? 's' : ''}).`, { type: 'success' });
      renderLocs();
    } catch (error: unknown) {
      toast(errorMessage(error, 'Falha ao gravar.'), { type: 'warning' });
    } finally {
      busy(false, learnBtn, '🎙 Gravar aqui');
    }
  };

  whereBtn.onclick = async (): Promise<void> => {
    if (!db.locations().length) {
      toast('Grave ao menos um local antes.', { type: 'warning' });
      return;
    }
    busy(true, whereBtn, '❓ Onde estou?');
    try {
      const vec = await captureFingerprint();
      renderResult(db.classify(vec));
    } catch (error: unknown) {
      toast(errorMessage(error, 'Falha ao medir.'), { type: 'warning' });
    } finally {
      busy(false, whereBtn, '❓ Onde estou?');
    }
  };

  function renderResult(ranked: RankedLocation[]): void {
    empty(result);
    if (!ranked.length) return;
    const top = ranked[0];
    result.append(
      h('div', { className: 'find-best' },
        h('span', { className: 'find-best__lbl u-text-muted' }, 'VOCÊ ESTÁ EM'),
        h('span', { className: 'find-best__name u-text-cyan' }, top.name),
        h('span', { className: 'find-best__conf u-mono' }, `${Math.round(top.confidence * 100)}% de confiança`)),
      h('div', { className: 'find-ranks' },
        ...ranked.map((r) => h('div', { className: 'find-rank' },
          h('span', { className: 'find-rank__name' }, r.name),
          h('div', { className: 'find-rank__bar' }, h('span', { style: { width: `${Math.round(Math.max(0, r.score) * 100)}%` } })),
          h('span', { className: 'find-rank__pct u-mono u-text-muted' }, `${Math.round(r.confidence * 100)}%`)))));
  }

  function renderLocs(): void {
    empty(locList);
    const locs = db.locations();
    if (!locs.length) {
      locList.append(h('div', { className: 'u-text-muted u-mono' }, 'nenhum local gravado'));
      return;
    }
    locs.forEach((location) => {
      locList.append(h('div', { className: 'find-loc' },
        h('span', { className: 'find-loc__name' }, location.name),
        h('span', { className: 'find-loc__n u-mono u-text-muted' }, `${location.samples} amostra${location.samples > 1 ? 's' : ''}`),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => { db.remove(location.name); renderLocs(); }
        }, '✕')));
    });
  }

  page.append(
    h('div', { className: 'find-panel card' },
      h('div', { className: 'find-row' }, nameI, learnBtn),
      h('div', { className: 'find-row' }, whereBtn),
      result),
    h('div', { className: 'find-panel card' },
      h('div', { className: 'find-locs__head' },
        h('span', null, '📍 Locais conhecidos'),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => { db.clear(); renderLocs(); empty(result); toast('Locais apagados.'); }
        }, 'Limpar tudo')),
      locList));

  renderLocs();
  return page;
}
