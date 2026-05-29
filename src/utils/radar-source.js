/**
 * Radar Source — fontes de dados pro radar.
 * Três modos:
 *   - MockSource: sintetiza alvos com ruído em JS (sem hardware).
 *   - ReplaySource: lê fixture pré-gravada (estub — TODO Tier 2).
 *   - BridgeSource: conecta WebSocket ws://127.0.0.1:8765/radar (estub — Tier 1).
 *
 * Todas implementam: start(onFrame), stop(), kind, fps, frameSize.
 */

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

/* ===================== Factory ===================== */

export function makeSource(kind, opts) {
  switch (kind) {
    case 'mock':   return new MockSource(opts);
    case 'replay': return new ReplaySource(opts);
    case 'bridge': return new BridgeSource(opts);
    default:       return new MockSource(opts);
  }
}
