/**
 * Página /find — "Onde Estou?" (posição indoor por impressão acústica).
 *
 * Conceito do find (schollz/find): aprende a assinatura de cada local e depois
 * adivinha onde você está. Aqui a assinatura é o ESPECTRO ACÚSTICO do ambiente
 * (microfone + tom de prova ~19 kHz, como no radar acústico) — sem hardware.
 *
 * Fluxo: grave 2–3 amostras em cada cômodo ("Cozinha", "Quarto"…) e depois use
 * "Onde estou?" para classificar. JS puro; tudo salvo no navegador.
 */

import '../styles/find.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { createFingerprintDB } from '../utils/fingerprint-engine.js';

const BANDS = 48;
const CAPTURE_MS = 1600;

/** Captura uma impressão acústica (vetor de BANDS bandas) via microfone. */
async function captureFingerprint() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || !navigator.mediaDevices?.getUserMedia) throw new Error('Áudio indisponível neste dispositivo.');
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

  /* tom de prova (ajuda a caracterizar a acústica do local) */
  const osc = ctx.createOscillator();
  osc.type = 'sine'; osc.frequency.value = 19000;
  const gain = ctx.createGain(); gain.gain.value = 0.05;
  osc.connect(gain); gain.connect(ctx.destination); osc.start();

  const bins = analyser.frequencyBinCount;
  const spec = new Float32Array(bins);
  const acc = new Float32Array(BANDS);
  const per = Math.max(1, Math.floor(bins / BANDS));
  let frames = 0;
  const t0 = performance.now();

  await new Promise((resolve) => {
    const tick = () => {
      analyser.getFloatFrequencyData(spec);
      for (let b = 0; b < BANDS; b++) {
        let s = 0;
        for (let k = 0; k < per; k++) s += Math.max(0, spec[b * per + k] + 140) / 140;
        acc[b] += s / per;
      }
      frames++;
      if (performance.now() - t0 >= CAPTURE_MS) { resolve(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  try { osc.stop(); } catch { /* noop */ }
  stream.getTracks().forEach((t) => t.stop());
  ctx.close().catch(() => {});
  for (let b = 0; b < BANDS; b++) acc[b] /= Math.max(1, frames);
  return acc;
}

export function findPage() {
  const db = createFingerprintDB();
  const page = h('div', { className: 'page-find' });

  page.append(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'ONDE ESTOU')),
    h('h1', { className: 'page-header__title' }, '🧭 Onde Estou?'),
    h('p', { className: 'page-header__description' },
      'Posição ', h('span', { className: 'u-text-cyan' }, 'indoor por impressão acústica'),
      ' — grave a "assinatura sonora" de cada cômodo e o app adivinha onde você está. Precisa do microfone.')));

  const nameI = h('input', { className: 'input', placeholder: 'Nome do local (ex.: Cozinha)', maxlength: 24 });
  const learnBtn = h('button', { className: 'btn btn--primary' }, '🎙 Gravar aqui');
  const whereBtn = h('button', { className: 'btn btn--ghost' }, '❓ Onde estou?');
  const result = h('div', { className: 'find-result' });
  const locList = h('div', { className: 'find-locs' });

  function busy(on, btn, label) {
    [learnBtn, whereBtn].forEach((b) => (b.disabled = on));
    if (btn) btn.textContent = on ? '… ouvindo' : label;
  }

  learnBtn.onclick = async () => {
    const name = nameI.value.trim();
    if (!name) { toast('Dê um nome ao local primeiro.', { type: 'warning' }); nameI.focus(); return; }
    busy(true, learnBtn, '🎙 Gravar aqui');
    try {
      const vec = await captureFingerprint();
      const n = db.learn(name, vec);
      toast(`"${name}" gravado (${n} amostra${n > 1 ? 's' : ''}).`, { type: 'success' });
      renderLocs();
    } catch (err) {
      toast(err.message || 'Falha ao gravar.', { type: 'warning' });
    } finally { busy(false, learnBtn, '🎙 Gravar aqui'); }
  };

  whereBtn.onclick = async () => {
    if (!db.locations().length) { toast('Grave ao menos um local antes.', { type: 'warning' }); return; }
    busy(true, whereBtn, '❓ Onde estou?');
    try {
      const vec = await captureFingerprint();
      renderResult(db.classify(vec));
    } catch (err) {
      toast(err.message || 'Falha ao medir.', { type: 'warning' });
    } finally { busy(false, whereBtn, '❓ Onde estou?'); }
  };

  function renderResult(ranked) {
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
          h('div', { className: 'find-rank__bar' }, h('span', { style: { width: Math.round(Math.max(0, r.score) * 100) + '%' } })),
          h('span', { className: 'find-rank__pct u-mono u-text-muted' }, `${Math.round(r.confidence * 100)}%`)))));
  }

  function renderLocs() {
    empty(locList);
    const locs = db.locations();
    if (!locs.length) { locList.append(h('div', { className: 'u-text-muted u-mono' }, 'nenhum local gravado')); return; }
    locs.forEach((l) => {
      locList.append(h('div', { className: 'find-loc' },
        h('span', { className: 'find-loc__name' }, l.name),
        h('span', { className: 'find-loc__n u-mono u-text-muted' }, `${l.samples} amostra${l.samples > 1 ? 's' : ''}`),
        h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { db.remove(l.name); renderLocs(); } }, '✕')));
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
        h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { db.clear(); renderLocs(); empty(result); toast('Locais apagados.'); } }, 'Limpar tudo')),
      locList));

  renderLocs();
  return page;
}
