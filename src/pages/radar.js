/**
 * Página /radar — Console de Radar Baluarte (Tier 0: Mock/Replay/Bridge).
 *
 * Mostra um Range-Doppler heatmap real-time, waterfall, lista de detecções
 * com CFAR-CA, e indicadores de status. A fonte de dados é trocável (Mock /
 * Replay / Bridge WebSocket) — quando o operador rodar tools/radar-bridge,
 * o modo Bridge passa a usar dados reais (CSI do roteador, ESP32 ou SDR).
 *
 * Sem hardware: Mock gera 3 alvos animados pra demo.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { makeSource } from '../utils/radar-source.js';
import { cfar2d, rangeMeters, velocityMs } from '../utils/radar-dsp.js';
import { createTracker } from '../utils/radar-tracker.js';
import { toast } from '../utils/toast.js';

let source = null;
let mode = 'mock';
let cfg = { cfarK: 4.0, mtiOn: false, dcNotchOn: true, frozen: false };
let lastFrame = null;
let prevMag = null;
let fpsCounter = { count: 0, last: performance.now(), value: 0 };
let tracker = createTracker();
let tracksCache = [];

/* Refs DOM. */
let rdCanvas, waterfallCanvas, detListEl, statusBar, modeBtns, freezeBtn;

/* ===================== Render principal ===================== */

export function radarPage() {
  const page = h('div', { className: 'page-radar' });

  page.appendChild(buildHeader());
  page.appendChild(buildConsole());

  /* Inicia fonte default (mock). */
  setTimeout(() => switchSource('mock'), 0);

  /* Cleanup quando trocar de rota — observa hash. */
  window.addEventListener('hashchange', cleanup, { once: true });

  return page;
}

function buildHeader() {
  return h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'RADAR')),
    h('h1', { className: 'page-header__title' }, '⌖ Radar Tático'),
    h('p', { className: 'page-header__description' },
      'Console range-Doppler com CFAR. ',
      h('span', { className: 'u-text-cyan' }, 'Modo ACÚSTICO funciona no celular'),
      ' (microfone + alto-falante, efeito Doppler). Mock roda sem nada; replay e bridge usam fixture ou WebSocket local.'
    )
  );
}

function buildConsole() {
  /* Bar de controle: modo + CFAR + filtros + freeze. */
  modeBtns = h('div', { className: 'rdr-modes' },
    modeButton('mock', 'MOCK'),
    modeButton('acoustic', '🎙 ACÚSTICO'),
    modeButton('replay', 'REPLAY'),
    modeButton('bridge', 'BRIDGE')
  );

  const cfarSlider = h('input', {
    type: 'range', min: 2, max: 10, step: 0.1, value: cfg.cfarK,
    className: 'rdr-slider',
    oninput: (e) => {
      cfg.cfarK = parseFloat(e.target.value);
      const lbl = e.target.parentElement.querySelector('.rdr-slider__val');
      if (lbl) lbl.textContent = cfg.cfarK.toFixed(1);
    }
  });

  const mtiToggle = toggle('MTI', cfg.mtiOn, (v) => cfg.mtiOn = v);
  const dcToggle = toggle('DC notch', cfg.dcNotchOn, (v) => cfg.dcNotchOn = v);

  freezeBtn = h('button', {
    className: 'btn btn--ghost rdr-freeze',
    onclick: () => {
      cfg.frozen = !cfg.frozen;
      freezeBtn.classList.toggle('is-active', cfg.frozen);
      freezeBtn.textContent = cfg.frozen ? '▶ RETOMAR' : '⏸ FREEZE';
    }
  }, '⏸ FREEZE');

  const controls = h('div', { className: 'rdr-controls card' },
    h('div', { className: 'rdr-controls__row' },
      h('span', { className: 'rdr-controls__label' }, 'FONTE'), modeBtns
    ),
    h('div', { className: 'rdr-controls__row' },
      h('span', { className: 'rdr-controls__label' }, 'CFAR k'),
      h('div', { className: 'rdr-slider-wrap' },
        cfarSlider,
        h('span', { className: 'rdr-slider__val u-mono' }, cfg.cfarK.toFixed(1))
      )
    ),
    h('div', { className: 'rdr-controls__row' }, mtiToggle, dcToggle, freezeBtn)
  );

  /* Status bar topo do scope. */
  statusBar = h('div', { className: 'rdr-status' },
    statusItem('MODE', 'MOCK', 'mode'),
    statusItem('FPS', '0', 'fps'),
    statusItem('TGT', '0', 'tgt'),
    statusItem('FRAME', '0', 'frame'),
    statusItem('LINK', '─', 'link')
  );

  /* Canvas Range-Doppler. */
  rdCanvas = h('canvas', { className: 'rdr-rd', width: 512, height: 320 });
  const rdScope = h('div', { className: 'rdr-scope card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '⌖ RANGE × DOPPLER'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'X: velocidade · Y: alcance · brilho: magnitude'
      )
    ),
    rdCanvas
  );

  /* Waterfall. */
  waterfallCanvas = h('canvas', { className: 'rdr-waterfall', width: 512, height: 160 });
  const wfScope = h('div', { className: 'rdr-scope card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '∿ WATERFALL'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'tempo desce · range no eixo X'
      )
    ),
    waterfallCanvas
  );

  /* Lista de detecções. */
  detListEl = h('div', { className: 'rdr-det-list' },
    h('div', { className: 'u-text-muted u-mono' }, 'sem alvos')
  );
  const detPanel = h('div', { className: 'rdr-det card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '◎ DETECÇÕES'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'CFAR-CA · ordenado por SNR'
      )
    ),
    detListEl
  );

  return h('div', { className: 'rdr-layout' },
    h('div', { className: 'rdr-side' }, statusBar, controls, detPanel),
    h('div', { className: 'rdr-main' }, rdScope, wfScope)
  );
}

function modeButton(kind, label) {
  const btn = h('button', {
    className: cx('rdr-mode', kind === mode && 'is-active'),
    'data-kind': kind,
    onclick: () => switchSource(kind)
  }, label);
  return btn;
}

function toggle(label, initial, onChange) {
  let on = initial;
  const btn = h('button', {
    className: cx('rdr-toggle', on && 'is-on'),
    onclick: () => {
      on = !on;
      btn.classList.toggle('is-on', on);
      onChange(on);
    }
  }, label);
  return btn;
}

function statusItem(label, value, key) {
  return h('div', { className: 'rdr-status__item', 'data-key': key },
    h('span', { className: 'rdr-status__label' }, label),
    h('span', { className: 'rdr-status__val u-mono' }, value)
  );
}

function setStatus(key, val) {
  const item = statusBar?.querySelector(`[data-key="${key}"] .rdr-status__val`);
  if (item) item.textContent = val;
}

/* ===================== Fonte ===================== */

function switchSource(kind) {
  if (source) source.stop();
  tracker.reset();
  tracksCache = [];
  mode = kind;
  modeBtns?.querySelectorAll('.rdr-mode').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.kind === kind));
  setStatus('mode', kind.toUpperCase());
  setStatus('link', kind === 'bridge' ? 'conectando…' : (kind === 'acoustic' ? 'iniciando…' : '─'));

  source = makeSource(kind, {
    onError: (msg) => {
      toast(msg, { type: 'warning' });
      setStatus('link', 'OFFLINE');
    }
  });
  source.start(onFrame);

  if (kind === 'bridge') {
    /* Mostra link como conectado se o WS abrir em até 1.5s. */
    setTimeout(() => {
      if (source && source.kind === 'bridge') {
        setStatus('link', source.connected ? 'LIVE' : 'OFFLINE');
        if (!source.connected) {
          toast('Bridge offline. Rode tools/radar-bridge/bridge.py.', { type: 'warning' });
        }
      }
    }, 1500);
  }

  if (kind === 'acoustic') {
    /* getUserMedia é assíncrono: confirma o link após liberar o microfone. */
    setTimeout(() => {
      if (source && source.kind === 'acoustic') {
        setStatus('link', source.connected ? 'LIVE' : 'OFFLINE');
        if (source.connected) {
          toast('Radar acústico ativo. Mexa a mão perto do aparelho.', { type: 'success' });
        }
      }
    }, 1200);
  }
}

/* ===================== Pipeline de frame ===================== */

function onFrame(pkt) {
  if (cfg.frozen) return;
  lastFrame = pkt;
  const { rows, cols } = pkt;
  const mag = new Float32Array(pkt.mag); /* cópia mutável */

  /* DC notch (subtrai média por range bin). */
  if (cfg.dcNotchOn) {
    for (let r = 0; r < rows; r++) {
      let sum = 0;
      for (let c = 0; c < cols; c++) sum += mag[r * cols + c];
      const mean = sum / cols;
      for (let c = 0; c < cols; c++) mag[r * cols + c] = Math.max(0, mag[r * cols + c] - mean);
    }
  }

  /* MTI: subtrai frame anterior. */
  if (cfg.mtiOn && prevMag && prevMag.length === mag.length) {
    for (let i = 0; i < mag.length; i++) mag[i] = Math.abs(mag[i] - prevMag[i]);
  }
  prevMag = new Float32Array(mag);

  /* CFAR-CA 2D → rastreio multi-alvo (tracks persistentes com ID). */
  const cfar = cfar2d(mag, rows, cols, { guard: 1, ref: 3, k: cfg.cfarK });
  tracksCache = tracker.update(cfar.detections);

  /* Pinta. */
  drawRD(mag, rows, cols, cfar.mask);
  drawTrackOverlay(tracksCache, rows, cols);
  shiftWaterfall(mag, rows, cols);
  renderDetections();

  /* FPS. */
  fpsCounter.count++;
  const now = performance.now();
  if (now - fpsCounter.last >= 1000) {
    fpsCounter.value = Math.round((fpsCounter.count * 1000) / (now - fpsCounter.last));
    fpsCounter.count = 0;
    fpsCounter.last = now;
    setStatus('fps', String(fpsCounter.value));
  }
  setStatus('tgt', String(tracksCache.length));
  setStatus('frame', String(pkt.index));
}

/* ===================== Render Canvas ===================== */

const PALETTE = buildPalette(); /* viridis-ish em 256 níveis */

function buildPalette() {
  const p = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    /* Aproximação simplificada (sem usar matriz cromática completa): vai do preto azulado → ciano → magenta. */
    const r = Math.round(255 * Math.pow(t, 1.3) * (0.6 + 0.4 * t));
    const g = Math.round(255 * t * (1 - 0.4 * t));
    const b = Math.round(255 * (1 - Math.pow(1 - t, 2.0)));
    p[i * 4] = r; p[i * 4 + 1] = g; p[i * 4 + 2] = b; p[i * 4 + 3] = 255;
  }
  return p;
}

function drawRD(mag, rows, cols, mask) {
  const ctx = rdCanvas.getContext('2d');
  const W = rdCanvas.width, H = rdCanvas.height;

  /* Normaliza pra max do frame. */
  let max = 1e-6;
  for (let i = 0; i < mag.length; i++) if (mag[i] > max) max = mag[i];

  /* Pinta cada bin como retângulo. cols=doppler→X, rows=range→Y. */
  const cellW = W / cols, cellH = H / rows;
  /* Background preto. */
  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = Math.min(255, Math.round((mag[r * cols + c] / max) * 255));
      const p = v * 4;
      ctx.fillStyle = `rgb(${PALETTE[p]},${PALETTE[p+1]},${PALETTE[p+2]})`;
      ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
    }
  }

  /* Marca detecções com retângulo ciano. */
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mask[r * cols + c]) {
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }

  /* Grid leve. */
  ctx.strokeStyle = 'rgba(150, 180, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const x = (W / 8) * i;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let i = 1; i < 4; i++) {
    const y = (H / 4) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

/* Waterfall: cada novo frame vira uma linha NO TOPO, scroll pra baixo. */
function shiftWaterfall(mag, rows, cols) {
  const ctx = waterfallCanvas.getContext('2d');
  const W = waterfallCanvas.width, H = waterfallCanvas.height;
  /* Scroll: copia o canvas todo pra baixo 1px. */
  const img = ctx.getImageData(0, 0, W, H - 1);
  ctx.putImageData(img, 0, 1);

  /* Reduz row × col → vetor de "intensidade por range" somando doppler. */
  const rowMax = 1e-6;
  let max = rowMax;
  const lineData = new Float32Array(rows);
  for (let r = 0; r < rows; r++) {
    let s = 0;
    for (let c = 0; c < cols; c++) s += mag[r * cols + c];
    lineData[r] = s;
    if (s > max) max = s;
  }

  /* Pinta a primeira linha. X = range (rows), W dividido em rows. */
  const px = W / rows;
  for (let r = 0; r < rows; r++) {
    const v = Math.min(255, Math.round((lineData[r] / max) * 255));
    const p = v * 4;
    ctx.fillStyle = `rgb(${PALETTE[p]},${PALETTE[p+1]},${PALETTE[p+2]})`;
    ctx.fillRect(r * px, 0, px + 0.5, 1);
  }
}

/* Desenha rastros + marcadores + ID dos alvos rastreados sobre o range-Doppler. */
function drawTrackOverlay(tracks, rows, cols) {
  if (!rdCanvas) return;
  const ctx = rdCanvas.getContext('2d');
  const W = rdCanvas.width, H = rdCanvas.height;
  const cellW = W / cols, cellH = H / rows;
  ctx.lineWidth = 1.5;
  ctx.font = '11px "JetBrains Mono", monospace';
  tracks.forEach((t) => {
    const x = (t.c + 0.5) * cellW, y = (t.r + 0.5) * cellH;
    const coasting = t.misses > 0;

    /* rastro */
    ctx.strokeStyle = coasting ? 'rgba(255,0,170,0.35)' : 'rgba(255,0,170,0.6)';
    ctx.beginPath();
    t.trail.forEach((p, i) => {
      const px = (p[1] + 0.5) * cellW, py = (p[0] + 0.5) * cellH;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    /* marcador */
    ctx.strokeStyle = coasting ? 'rgba(255,0,170,0.6)' : '#ff00aa';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(5, cellW * 0.7), 0, Math.PI * 2);
    ctx.stroke();

    /* id */
    ctx.fillStyle = '#ff00aa';
    ctx.fillText('T' + String(t.id).padStart(2, '0'), x + 7, y - 7);
  });
}

function renderDetections() {
  empty(detListEl);
  if (tracksCache.length === 0) {
    detListEl.appendChild(h('div', { className: 'u-text-muted u-mono' }, 'sem alvos'));
    return;
  }
  tracksCache.forEach((t) => {
    const range = rangeMeters(t.r, { fftN: lastFrame?.rows ?? 64 });
    const vel = velocityMs(t.c, { dopplerN: lastFrame?.cols ?? 32 });
    const coasting = t.misses > 0;
    detListEl.appendChild(h('div', { className: cx('rdr-det-row', coasting && 'is-coasting') },
      h('span', { className: 'rdr-det-row__id u-mono' }, `T${String(t.id).padStart(2, '0')}`),
      h('span', { className: 'rdr-det-row__range u-mono' }, `${range.toFixed(1)} m`),
      h('span', { className: 'rdr-det-row__vel u-mono' }, `${vel >= 0 ? '+' : ''}${vel.toFixed(1)} m/s`),
      h('span', { className: 'rdr-det-row__snr u-mono u-text-cyan' }, `${(20 * Math.log10(Math.max(t.snr, 1e-6))).toFixed(1)} dB`)
    ));
  });
}

/* ===================== Cleanup ===================== */

function cleanup() {
  if (source) { source.stop(); source = null; }
  tracker.reset();
  tracksCache = [];
  prevMag = null;
  lastFrame = null;
}
