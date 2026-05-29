/**
 * Radar Source — fontes de dados pro radar.
 * Três modos:
 *   - MockSource: sintetiza alvos com ruído em JS (sem hardware).
 *   - ReplaySource: lê fixture pré-gravada (estub — TODO Tier 2).
 *   - BridgeSource: conecta WebSocket ws://127.0.0.1:8765/radar (estub — Tier 1).
 *
 * Todas implementam: start(onFrame), stop(), kind, fps, frameSize.
 */

import { crossAmbiguity } from './radar-dsp.js';

const RANGE_BINS = 64;
const DOPPLER_BINS = 32;

/* ===================== MockSource ===================== */

/**
 * Sintetiza frames Range-Doppler com 1–3 alvos andando.
 * O frame é Float32Array de tamanho RANGE_BINS*DOPPLER_BINS já em "magnitude pronta",
 * pra UI poder pintar direto sem fazer FFT (mock simplificado).
 */
export class MockSource {
  constructor(opts = {}) {
    this.kind = 'mock';
    this.fps = opts.fps ?? 20;
    this.rangeBins = RANGE_BINS;
    this.dopplerBins = DOPPLER_BINS;
    this.frameSize = RANGE_BINS * DOPPLER_BINS;
    this.timer = null;
    this.frameIdx = 0;

    /* Alvos sintéticos. range e doppler em "bins" (com float interno pra animação). */
    this.targets = [
      { range: 14, doppler: 19, vRange: +0.06, vDoppler: -0.04, amp: 1.0 },
      { range: 32, doppler: 12, vRange: -0.04, vDoppler: +0.07, amp: 0.7 },
      { range: 48, doppler: 16, vRange: +0.02, vDoppler: +0.00, amp: 0.5 }
    ];
  }

  start(onFrame) {
    const dt = 1000 / this.fps;
    this.timer = setInterval(() => {
      this.frameIdx++;
      const frame = this._synthesize();
      onFrame({
        index: this.frameIdx,
        timestamp: performance.now(),
        rows: this.rangeBins,
        cols: this.dopplerBins,
        mag: frame
      });
    }, dt);
  }

  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  _synthesize() {
    const R = this.rangeBins, D = this.dopplerBins;
    const f = new Float32Array(R * D);

    /* Ruído gaussiano-ish (Box-Muller barato). */
    for (let i = 0; i < f.length; i++) {
      const u1 = Math.random() + 1e-9;
      const u2 = Math.random();
      f[i] = Math.abs(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)) * 0.08;
    }

    /* Espalha cada alvo como uma gaussiana 2D no range-doppler. */
    for (const t of this.targets) {
      t.range += t.vRange;
      t.doppler += t.vDoppler;
      if (t.range < 4 || t.range > R - 4) t.vRange *= -1;
      if (t.doppler < 4 || t.doppler > D - 4) t.vDoppler *= -1;

      const sigma = 1.2;
      const r0 = t.range, d0 = t.doppler;
      const rmin = Math.max(0, (r0 - 4) | 0), rmax = Math.min(R - 1, (r0 + 4) | 0);
      const dmin = Math.max(0, (d0 - 4) | 0), dmax = Math.min(D - 1, (d0 + 4) | 0);
      for (let r = rmin; r <= rmax; r++) {
        for (let d = dmin; d <= dmax; d++) {
          const dr = r - r0, dd = d - d0;
          const e = Math.exp(-(dr * dr + dd * dd) / (2 * sigma * sigma));
          f[r * D + d] += t.amp * e;
        }
      }
    }
    return f;
  }
}

/* ===================== ReplaySource (estub) ===================== */

/**
 * Stub — Tier 2. Vai carregar fixture do PLFM_RADAR de
 * /public/radar/aeris-reference-frame.json. Por enquanto delega no MockSource
 * só pra UI não quebrar.
 */
export class ReplaySource extends MockSource {
  constructor(opts = {}) {
    super(opts);
    this.kind = 'replay';
  }
}

/* ===================== BridgeSource ===================== */

/**
 * Conecta no bridge local via WebSocket. Estub: tenta conectar, se falhar avisa.
 * Quando o usuário tiver o tools/radar-bridge/bridge.py rodando, ele manda
 * pacotes JSON: { index, timestamp, rows, cols, mag: [...] }.
 */
export class BridgeSource {
  constructor(opts = {}) {
    this.kind = 'bridge';
    this.url = opts.url ?? 'ws://127.0.0.1:8765/radar';
    this.ws = null;
    this.connected = false;
    this.fps = 0;
    this.rangeBins = RANGE_BINS;
    this.dopplerBins = DOPPLER_BINS;
    this.frameSize = RANGE_BINS * DOPPLER_BINS;
    this._onError = opts.onError || (() => {});
  }

  start(onFrame) {
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      this._onError(err.message || 'WebSocket falhou');
      return;
    }

    this.ws.onopen = () => { this.connected = true; };
    this.ws.onerror = () => {
      this._onError('Bridge offline. Rode tools/radar-bridge/bridge.py localmente.');
    };
    this.ws.onclose = () => { this.connected = false; };

    this.ws.onmessage = (ev) => {
      let pkt;
      try { pkt = JSON.parse(ev.data); } catch { return; }
      if (!pkt || !Array.isArray(pkt.mag)) return;
      onFrame({
        index: pkt.index ?? 0,
        timestamp: pkt.timestamp ?? performance.now(),
        rows: pkt.rows ?? RANGE_BINS,
        cols: pkt.cols ?? DOPPLER_BINS,
        mag: new Float32Array(pkt.mag)
      });
    };
  }

  stop() {
    if (this.ws) { this.ws.close(); this.ws = null; }
    this.connected = false;
  }
}

/* ===================== AcousticSource ===================== */

/**
 * Radar ACÚSTICO — funciona em qualquer celular/notebook, SEM hardware extra.
 *
 * Princípio (CW Doppler sonar): o alto-falante emite um tom contínuo quase
 * inaudível (~19 kHz) e o microfone capta o eco. Objetos em movimento deslocam
 * a frequência do eco (efeito Doppler): aproximando → sobe; afastando → desce.
 * As bandas laterais em torno do tom = micro-Doppler do movimento.
 *
 * Mapeamento para o pipeline range-Doppler já existente:
 *   - cols (eixo Doppler/velocidade) = bins de FFT em torno do tom emitido
 *   - rows (eixo vertical)           = histórico temporal (espectrograma rolante)
 * Assim o mesmo CFAR/heatmap/waterfall destaca alvos em movimento de verdade.
 *
 * Requer gesto do usuário (clique no modo) para liberar áudio + microfone.
 */
export class AcousticSource {
  constructor(opts = {}) {
    this.kind = 'acoustic';
    this.rangeBins = RANGE_BINS;
    this.dopplerBins = DOPPLER_BINS;
    this.frameSize = RANGE_BINS * DOPPLER_BINS;
    this.fps = opts.fps ?? 20;
    this.freq = opts.freq ?? 19000;   /* tom emitido (Hz). 19k ~ inaudível p/ adultos */
    this.volume = opts.volume ?? 0.06; /* baixo: evita incômodo e clipping */
    this._onError = opts.onError || (() => {});
    this.connected = false;
    this.ctx = null; this.osc = null; this.analyser = null; this.stream = null;
    this.timer = null; this.frameIdx = 0; this.history = null;
  }

  async start(onFrame) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Áudio do navegador indisponível neste dispositivo.');
      }
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      /* Microfone (sem filtros que apagariam o Doppler). */
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const micSrc = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 16384;
      this.analyser.smoothingTimeConstant = 0;
      micSrc.connect(this.analyser);

      /* Tom emitido pelo alto-falante. */
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sine';
      this.osc.frequency.value = this.freq;
      const gain = this.ctx.createGain();
      gain.gain.value = this.volume;
      this.osc.connect(gain); gain.connect(this.ctx.destination);
      this.osc.start();
      this.connected = true;

      const binHz = this.ctx.sampleRate / this.analyser.fftSize;
      const centerBin = Math.round(this.freq / binHz);
      const spec = new Float32Array(this.analyser.frequencyBinCount);
      const R = this.rangeBins, D = this.dopplerBins, half = D >> 1;
      this.history = new Float32Array(R * D);

      const dt = 1000 / this.fps;
      this.timer = setInterval(() => {
        this.analyser.getFloatFrequencyData(spec); /* dB (~ -140..0) */
        const line = new Float32Array(D);
        for (let k = 0; k < D; k++) {
          const b = centerBin - half + k;
          const db = (b >= 0 && b < spec.length) ? spec[b] : -140;
          line[k] = Math.max(0, db + 140) / 140; /* normaliza p/ 0..1 */
        }
        /* Empurra histórico uma linha para baixo; linha nova no topo. */
        this.history.copyWithin(D, 0, (R - 1) * D);
        this.history.set(line, 0);
        this.frameIdx++;
        onFrame({
          index: this.frameIdx, timestamp: performance.now(),
          rows: R, cols: D, mag: new Float32Array(this.history)
        });
      }, dt);
    } catch (err) {
      this.connected = false;
      const msg = err && err.name === 'NotAllowedError'
        ? 'Microfone negado. Permita o acesso para usar o radar acústico.'
        : (err?.message || 'Falha ao iniciar o áudio.');
      this._onError(msg);
    }
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    try { this.osc && this.osc.stop(); } catch { /* já parado */ }
    this.osc = null;
    if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; }
    this.connected = false;
  }
}

/* ===================== PassiveSource ===================== */

/**
 * Radar PASSIVO (demo) — conceito do espectre / passiveRadar.
 *
 * Não transmite nada: sintetiza um sinal de REFERÊNCIA (iluminador ambiente,
 * tipo rádio FM = ruído de banda larga) e um sinal de VIGILÂNCIA contendo o
 * caminho direto + ecos de alvos em movimento (cada eco = cópia atrasada e com
 * desvio Doppler). Roda a Cross-Ambiguidade (CAF) de verdade a cada frame, então
 * a tela mostra o mesmo processamento de um radar passivo real — só que com
 * dados simulados (substituíveis por um SDR via modo BRIDGE).
 */
export class PassiveSource {
  constructor(opts = {}) {
    this.kind = 'passive';
    this.rangeBins = RANGE_BINS;
    this.dopplerBins = DOPPLER_BINS;
    this.frameSize = RANGE_BINS * DOPPLER_BINS;
    this.fps = opts.fps ?? 12;
    this.N = opts.N ?? 2048;            /* amostras por frame */
    this.timer = null;
    this.frameIdx = 0;
    /* alvos: delay = range (bins), dop = bin Doppler alvo, vel = deriva */
    this.targets = [
      { delay: 12, dop: 21, vel: -0.05, amp: 0.9 },
      { delay: 30, dop: 12, vel: +0.07, amp: 0.7 },
      { delay: 47, dop: 18, vel: +0.02, amp: 0.5 }
    ];
  }

  start(onFrame) {
    const dt = 1000 / this.fps;
    this.timer = setInterval(() => {
      this.frameIdx++;
      const { ref, surv, survIm } = this._synthesize();
      const ca = crossAmbiguity(ref, surv, { rangeBins: this.rangeBins, dopplerBins: this.dopplerBins, survIm });
      onFrame({
        index: this.frameIdx, timestamp: performance.now(),
        rows: ca.rows, cols: ca.cols, mag: ca.mag
      });
    }, dt);
  }

  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  _synthesize() {
    const N = this.N, R = this.rangeBins, D = this.dopplerBins;
    const B = Math.floor(N / D);

    /* Referência: ruído de banda larga (iluminador ambiente). */
    const ref = new Float32Array(N);
    for (let n = 0; n < N; n++) ref[n] = Math.random() * 2 - 1;

    /* Vigilância (I/Q): caminho direto forte (range 0) + ruído de fundo. */
    const surv = new Float32Array(N);   /* parte real */
    const survIm = new Float32Array(N); /* parte imaginária */
    for (let n = 0; n < N; n++) surv[n] = 0.9 * ref[n] + (Math.random() * 2 - 1) * 0.05;

    /* Ecos: cópia atrasada (range) + Doppler complexo (e^{j2πfn}) → pico único. */
    for (const t of this.targets) {
      t.dop += t.vel;
      if (t.dop < 4 || t.dop > D - 4) t.vel *= -1;
      const tau = t.delay | 0;
      const q = t.dop - (D >> 1);          /* offset Doppler relativo ao centro */
      const f = q / (B * D);               /* freq normalizada → cai no bin certo */
      for (let n = tau; n < N; n++) {
        const a = t.amp * ref[n - tau];
        const ph = 2 * Math.PI * f * n;
        surv[n] += a * Math.cos(ph);
        survIm[n] += a * Math.sin(ph);
      }
    }
    return { ref, surv, survIm };
  }
}

/* ===================== Factory ===================== */

export function makeSource(kind, opts) {
  switch (kind) {
    case 'mock':     return new MockSource(opts);
    case 'replay':   return new ReplaySource(opts);
    case 'bridge':   return new BridgeSource(opts);
    case 'acoustic': return new AcousticSource(opts);
    case 'passive':  return new PassiveSource(opts);
    default:         return new MockSource(opts);
  }
}
