/**
 * /visao — Visão & Câmera
 * Tab 1: Detecção de movimento (diff de frames via canvas)
 * Tab 2: Rastreamento de olhar (MediaPipe Face Mesh → estimativa de gaze)
 * Tab 3: Mão JARVIS (MediaPipe Hands — esqueleto neon estilo Iron Man)
 * Tab 4: Visão Noturna (pixel boost verde + scanlines + vinheta)
 * Tab 5: Visão Térmica (mapa de calor FLIR via LUT)
 * Tab 6: Claridade Noturna (amplificação de exposição → aspecto diurno)
 */

import { h } from '../utils/helpers.js';

/* ══════════════════════════════════════
   LATERALIDADE (handedness) — 4 funções dedicadas
   Vídeo espelhado: o rótulo cru do MediaPipe fica invertido na tela.
   A POSIÇÃO do pulso (x espelhado) é a fonte da verdade.
   ══════════════════════════════════════ */
function resolveLeft(raw)  { return raw === 'Left'  ? 'RIGHT' : null; }
function resolveRight(raw) { return raw === 'Right' ? 'LEFT'  : null; }
function conferirRight(wristX) { return (1 - wristX) < 0.5; }   // mão direita → esquerda da tela
function conferirLeft(wristX)  { return (1 - wristX) >= 0.5; }  // mão esquerda → direita da tela
function decidirLado(raw, wristX) {
  let label = resolveLeft(raw) || resolveRight(raw) || raw.toUpperCase();
  if (label === 'RIGHT' && !conferirRight(wristX)) label = 'LEFT';
  else if (label === 'LEFT' && !conferirLeft(wristX)) label = 'RIGHT';
  return label;
}

/* ══════════════════════════════════════
   MOTION DETECTION
   ══════════════════════════════════════ */

class MotionDetector {
  constructor(video, canvas, overlay, sensitivity = 25, onAlert) {
    this.video = video;
    this.canvas = canvas;
    this.overlay = overlay;
    this.sensitivity = sensitivity;
    this.onAlert = onAlert;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.octx = overlay.getContext('2d');
    this.prev = null;
    this.raf = null;
    this.stream = null;
    this.running = false;
    this.motionCount = 0;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.overlay.width = 640;
      this.overlay.height = 480;
      this.running = true;
      this._loop();
      return true;
    } catch (e) {
      return false;
    }
  }

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    this.ctx.drawImage(this.video, 0, 0, 640, 480);
    const curr = this.ctx.getImageData(0, 0, 640, 480);
    if (this.prev) {
      const diff = this._diff(this.prev, curr);
      this._drawMotion(diff);
    }
    this.prev = curr;
  }

  _diff(a, b) {
    const result = new Uint8ClampedArray(a.data.length);
    let motionPixels = 0;
    const thr = this.sensitivity;
    for (let i = 0; i < a.data.length; i += 4) {
      const dr = Math.abs(a.data[i]   - b.data[i]);
      const dg = Math.abs(a.data[i+1] - b.data[i+1]);
      const db = Math.abs(a.data[i+2] - b.data[i+2]);
      const avg = (dr + dg + db) / 3;
      if (avg > thr) {
        result[i] = 0; result[i+1] = 240; result[i+2] = 255; result[i+3] = 200;
        motionPixels++;
      } else {
        result[i+3] = 0;
      }
    }
    this.motionCount = motionPixels;
    return new ImageData(result, 640, 480);
  }

  _drawMotion(diff) {
    this.octx.clearRect(0, 0, 640, 480);
    this.octx.putImageData(diff, 0, 0);

    const ratio = this.motionCount / (640 * 480);
    if (ratio > 0.01 && this.onAlert) this.onAlert(ratio);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.prev = null;
  }
}

/* ══════════════════════════════════════
   GAZE / EYE TRACKING (MediaPipe)
   ══════════════════════════════════════ */

function loadMediaPipe() {
  return new Promise((resolve) => {
    if (window.FaceMesh) { resolve(window.FaceMesh); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js';
      s2.crossOrigin = 'anonymous';
      s2.onload = () => resolve(window.FaceMesh);
      s2.onerror = () => resolve(null);
      document.head.appendChild(s2);
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

class GazeTracker {
  constructor(video, canvas, dotEl, statusEl) {
    this.video = video;
    this.canvas = canvas;
    this.dot = dotEl;
    this.status = statusEl;
    this.ctx = canvas.getContext('2d');
    this.faceMesh = null;
    this.camera = null;
    this.running = false;
    this.stream = null;
  }

  async start() {
    const FaceMesh = await loadMediaPipe();
    if (!FaceMesh) {
      if (this.status) this.status.textContent = 'Falha ao carregar MediaPipe.';
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch {
      if (this.status) this.status.textContent = 'Câmera negada.';
      return false;
    }

    this.canvas.width = 640;
    this.canvas.height = 480;

    this.faceMesh = new FaceMesh({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`
    });
    this.faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    this.faceMesh.onResults(r => this._onResults(r));

    this.running = true;
    this._processLoop();
    if (this.status) this.status.textContent = 'Rastreando olhar…';
    return true;
  }

  _processLoop() {
    if (!this.running) return;
    this.faceMesh.send({ image: this.video }).then(() => {
      requestAnimationFrame(() => this._processLoop());
    }).catch(() => {
      if (this.running) requestAnimationFrame(() => this._processLoop());
    });
  }

  _onResults(results) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 640, 480);
    ctx.drawImage(results.image, 0, 0, 640, 480);

    if (!results.multiFaceLandmarks?.length) {
      if (this.dot) this.dot.style.display = 'none';
      return;
    }
    const lm = results.multiFaceLandmarks[0];

    /* olhos: left iris center ~473, right iris center ~468 */
    const li = lm[473]; // left iris
    const ri = lm[468]; // right iris

    /* Pontos de referência das pálpebras */
    const leftEyeOuter = lm[33];
    const leftEyeInner = lm[133];
    const rightEyeOuter = lm[362];
    const rightEyeInner = lm[263];

    /* Gaze horizontal: posição da íris dentro do olho */
    const leftGazeX = (li.x - leftEyeOuter.x) / (leftEyeInner.x - leftEyeOuter.x);
    const rightGazeX = (ri.x - rightEyeOuter.x) / (rightEyeInner.x - rightEyeOuter.x);
    const gazeX = (leftGazeX + rightGazeX) / 2;

    /* Gaze vertical: média vertical das íris vs pontos superiores/inferiores */
    const leftEyeTop = lm[159];
    const leftEyeBot = lm[145];
    const rightEyeTop = lm[386];
    const rightEyeBot = lm[374];

    const leftGazeY = (li.y - leftEyeTop.y) / (leftEyeBot.y - leftEyeTop.y);
    const rightGazeY = (ri.y - rightEyeTop.y) / (rightEyeBot.y - rightEyeTop.y);
    const gazeY = (leftGazeY + rightGazeY) / 2;

    /* Normaliza 0..1 para coordenadas de tela */
    const screenX = Math.max(0, Math.min(1, gazeX)) * window.innerWidth;
    const screenY = Math.max(0, Math.min(1, gazeY * 2 - 0.5)) * window.innerHeight;

    if (this.dot) {
      this.dot.style.display = 'block';
      this.dot.style.left = screenX + 'px';
      this.dot.style.top = screenY + 'px';
    }

    /* Desenha landmarks dos olhos */
    ctx.strokeStyle = 'rgba(0,240,255,0.8)';
    ctx.lineWidth = 1;
    this._drawEyeOutline(ctx, lm, [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246], 640, 480);
    this._drawEyeOutline(ctx, lm, [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398], 640, 480);

    /* Marca íris */
    ctx.fillStyle = 'rgba(0,240,255,0.9)';
    ctx.beginPath();
    ctx.arc(li.x * 640, li.y * 480, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ri.x * 640, ri.y * 480, 4, 0, 2 * Math.PI);
    ctx.fill();

    if (this.status) {
      const dir = gazeX < 0.4 ? 'Esquerda' : gazeX > 0.6 ? 'Direita' : 'Centro';
      const vdir = gazeY < 0.4 ? 'Cima' : gazeY > 0.6 ? 'Baixo' : 'Centro';
      this.status.textContent = `Olhar: ${dir} / ${vdir}`;
    }
  }

  _drawEyeOutline(ctx, lm, indices, w, h) {
    ctx.beginPath();
    indices.forEach((i, n) => {
      const p = lm[i];
      if (n === 0) ctx.moveTo(p.x * w, p.y * h);
      else ctx.lineTo(p.x * w, p.y * h);
    });
    ctx.closePath();
    ctx.stroke();
  }

  stop() {
    this.running = false;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.dot) this.dot.style.display = 'none';
    this.stream = null;
  }
}

/* ══════════════════════════════════════
   HAND TRACKING (MediaPipe Hands)
   ══════════════════════════════════════ */

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20]
];

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

class HandTracker {
  constructor(statusEl) {
    this.statusEl = statusEl;
    this.canvas = null;
    this.ctx = null;
    this.hands = null;
    this.stream = null;
    this.video = null;
    this.raf = null;
    this.running = false;
    this.lastResults = null;
    this.frameCount = 0;
  }

  async start(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (this.statusEl) this.statusEl.textContent = 'Carregando MediaPipe Hands…';
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    } catch {
      if (this.statusEl) this.statusEl.textContent = 'Falha ao carregar MediaPipe — verifique sua conexão.';
      return false;
    }
    try {
      this.video = document.createElement('video');
      this.video.muted = true;
      this.video.playsInline = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch {
      if (this.statusEl) this.statusEl.textContent = 'Câmera negada ou indisponível.';
      return false;
    }
    canvas.width = 640; canvas.height = 480;
    this.hands = new window.Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });
    this.hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    this.hands.onResults(r => { this.lastResults = r; });
    if (this.statusEl) this.statusEl.textContent = 'Inicializando modelo…';
    await this.hands.initialize();
    this.running = true;
    if (this.statusEl) this.statusEl.textContent = 'Rastreando mãos…';
    this._loop();
    return true;
  }

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    if (!this.video || this.video.readyState < 2) return;
    this.frameCount++;
    if (this.frameCount % 2 === 0) this.hands.send({ image: this.video }).catch(() => {});
    this._draw();
  }

  _draw() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(this.video, -W, 0, W, H); ctx.restore();
    this._drawHUD(ctx, W, H);
    if (!this.lastResults?.multiHandLandmarks) return;
    for (let hi = 0; hi < this.lastResults.multiHandLandmarks.length; hi++) {
      const lm = this.lastResults.multiHandLandmarks[hi];
      const raw = this.lastResults.multiHandedness?.[hi]?.label || '';
      /* Lado decidido pelas 4 funções (rótulo + cross-check de posição) */
      const label = decidirLado(raw, lm[0].x);
      this._drawHand(ctx, lm, W, H, label);
    }
  }

  _drawHand(ctx, lm, W, H, label) {
    ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(0,240,255,0.85)'; ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H);
      ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H);
      ctx.stroke();
    }
    const TIPS = new Set([4, 8, 12, 16, 20]);
    for (let i = 0; i < lm.length; i++) {
      const x = (1 - lm[i].x) * W, y = lm[i].y * H;
      const isWrist = i === 0, isTip = TIPS.has(i);
      ctx.beginPath();
      ctx.arc(x, y, isWrist ? 7 : isTip ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isWrist ? '#ff00aa' : '#00f0ff';
      ctx.shadowColor = isWrist ? '#ff00aa' : '#00f0ff';
      ctx.shadowBlur = isWrist ? 20 : 12;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.font = 'bold 13px monospace';
    const lx = (1 - lm[0].x) * W - 20, ly = lm[0].y * H + 26;
    ctx.fillStyle = 'rgba(0,12,24,0.55)';
    ctx.fillRect(lx - 2, ly - 12, ctx.measureText(label).width + 6, 16);
    ctx.fillStyle = 'rgba(0,240,255,0.95)';
    ctx.fillText(label, lx, ly);
  }

  _drawHUD(ctx, W, H) {
    const c = 'rgba(0,240,255,0.45)';
    const len = 22;
    ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.shadowBlur = 0;
    for (const [cx, cy, sx, sy] of [[0,0,1,1],[W-1,0,-1,1],[0,H-1,1,-1],[W-1,H-1,-1,-1]]) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * len, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * len);
      ctx.stroke();
    }
    ctx.fillStyle = c; ctx.font = '10px monospace';
    ctx.fillText('JARVIS · HAND TRACKING · ACTIVE', 8, 16);
    ctx.fillText(new Date().toLocaleTimeString(), W - 82, 16);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.hands) { try { this.hands.close(); } catch {} }
    this.stream = null; this.video = null; this.hands = null;
  }
}

/* ══════════════════════════════════════
   VISION FILTER (night / thermal / clarity)
   ══════════════════════════════════════ */

class VisionFilter {
  constructor(mode) {
    this.mode = mode;
    this.running = false;
    this.raf = null;
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this._lut = this._buildThermalLut();
  }

  _buildThermalLut() {
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      let r, g, b;
      if (i < 64)       { r = 0;   g = 0;   b = i * 4; }
      else if (i < 128) { const t = (i-64)/64;  r = Math.round(t*220); g = 0;   b = Math.round(255-t*255); }
      else if (i < 192) { const t = (i-128)/64; r = 220+Math.round(t*35); g = Math.round(t*255); b = 0; }
      else              { const t = (i-192)/64; r = 255; g = 255; b = Math.round(t*255); }
      lut[i*3] = r; lut[i*3+1] = g; lut[i*3+2] = b;
    }
    return lut;
  }

  async start(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.video = document.createElement('video');
    this.video.muted = true; this.video.playsInline = true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      canvas.width = 640; canvas.height = 480;
      this.running = true;
      this._loop();
      return true;
    } catch { return false; }
  }

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    if (!this.video || this.video.readyState < 2) return;
    const { ctx, canvas, video } = this;
    const W = canvas.width, H = canvas.height;
    ctx.drawImage(video, 0, 0, W, H);
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    if (this.mode === 'night') {
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
        const v = Math.min(255, lum * 2.8);
        d[i] = 0; d[i+1] = Math.round(v); d[i+2] = Math.round(v * 0.06);
      }
      ctx.putImageData(img, 0, 0);
      /* scanlines */
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      /* vignette */
      const vg = ctx.createRadialGradient(W/2, H/2, 70, W/2, H/2, H*0.78);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,18,0,0.78)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      /* HUD text */
      ctx.fillStyle = 'rgba(0,220,0,0.55)'; ctx.font = '10px monospace';
      ctx.fillText('NV · ACTIVE', 8, 16);
      ctx.fillText(new Date().toLocaleTimeString(), W - 76, 16);

    } else if (this.mode === 'thermal') {
      const lut = this._lut;
      for (let i = 0; i < d.length; i += 4) {
        const g = Math.round(0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]);
        d[i] = lut[g*3]; d[i+1] = lut[g*3+1]; d[i+2] = lut[g*3+2];
      }
      ctx.putImageData(img, 0, 0);
      /* scale bar */
      const bar = ctx.createLinearGradient(W-14, 20, W-14, H-20);
      bar.addColorStop(0,    'rgb(255,255,255)');
      bar.addColorStop(0.25, 'rgb(255,255,0)');
      bar.addColorStop(0.5,  'rgb(220,0,0)');
      bar.addColorStop(0.75, 'rgb(0,0,255)');
      bar.addColorStop(1,    'rgb(0,0,0)');
      ctx.fillStyle = bar; ctx.fillRect(W-14, 20, 10, H-40);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.5;
      ctx.strokeRect(W-14, 20, 10, H-40);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px monospace';
      ctx.fillText('HOT', W-18, 14); ctx.fillText('COLD', W-20, H-10);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('THERMAL · IR', 8, 16);

    } else if (this.mode === 'clarity') {
      for (let i = 0; i < d.length; i += 4) {
        /* Boost exposure agressivamente + warm tint para simular luz solar */
        d[i]   = Math.min(255, Math.round(d[i]   * 3.8 + 20));
        d[i+1] = Math.min(255, Math.round(d[i+1] * 3.2 + 14));
        d[i+2] = Math.min(255, Math.round(d[i+2] * 2.4 + 4));
      }
      ctx.putImageData(img, 0, 0);
      /* leve halo quente para imitar luz do dia */
      ctx.fillStyle = 'rgba(255,235,180,0.07)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,235,180,0.5)'; ctx.font = '10px monospace';
      ctx.fillText('CLARITY · DAY ENHANCE', 8, 16);
    }
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null; this.video = null;
  }
}

/* ══════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════ */

let _motionDetector = null;
let _gazeTracker = null;
let _handTracker = null;
let _nightFilter = null;
let _thermalFilter = null;
let _clarityFilter = null;

function cleanup() {
  if (_motionDetector)  { _motionDetector.stop();  _motionDetector = null; }
  if (_gazeTracker)     { _gazeTracker.stop();      _gazeTracker = null; }
  if (_handTracker)     { _handTracker.stop();      _handTracker = null; }
  if (_nightFilter)     { _nightFilter.stop();      _nightFilter = null; }
  if (_thermalFilter)   { _thermalFilter.stop();    _thermalFilter = null; }
  if (_clarityFilter)   { _clarityFilter.stop();    _clarityFilter = null; }
}

export function visaoPage() {
  cleanup();

  /* ── Tab state ── */
  let activeTab = 'motion';

  /* ── Motion tab content ── */
  const motionVideo = h('video', { className: 'visao-video', muted: true, playsinline: true });
  const motionCanvas = h('canvas', { className: 'visao-canvas' });
  const motionOverlay = h('canvas', { className: 'visao-overlay' });
  const motionStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  const sensitivitySlider = h('input', { type: 'range', min: 5, max: 80, value: 25, className: 'visao-slider' });
  const sensitivityLabel = h('span', { className: 'visao-slider-val' }, '25');
  const motionAlert = h('div', { className: 'visao-alert' });
  let motionRunning = false;

  sensitivitySlider.addEventListener('input', () => {
    sensitivityLabel.textContent = sensitivitySlider.value;
    if (_motionDetector) _motionDetector.sensitivity = +sensitivitySlider.value;
  });

  const motionStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (motionRunning) {
      _motionDetector?.stop(); _motionDetector = null;
      motionRunning = false;
      motionStartBtn.textContent = '▶ Iniciar';
      motionStatus.textContent = 'Câmera parada.';
      motionAlert.className = 'visao-alert';
      return;
    }
    motionStatus.textContent = 'Aguardando permissão…';
    _motionDetector = new MotionDetector(
      motionVideo, motionCanvas, motionOverlay, +sensitivitySlider.value,
      (ratio) => {
        motionAlert.className = 'visao-alert visao-alert--active';
        motionAlert.textContent = `⚠ Movimento detectado! (${(ratio * 100).toFixed(1)}% da área)`;
        setTimeout(() => { motionAlert.className = 'visao-alert'; }, 1500);
      }
    );
    const ok = await _motionDetector.start();
    if (ok) {
      motionRunning = true;
      motionStartBtn.textContent = '⏹ Parar';
      motionStatus.textContent = 'Detectando movimento…';
    } else {
      _motionDetector = null;
      motionStatus.textContent = 'Câmera negada ou indisponível.';
    }
  }}, '▶ Iniciar');

  const motionContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' },
      motionStartBtn,
      h('label', { className: 'visao-label' },
        h('span', null, 'Sensibilidade:'),
        sensitivitySlider,
        sensitivityLabel
      ),
      motionStatus
    ),
    motionAlert,
    h('div', { className: 'visao-viewport' },
      motionVideo,
      motionCanvas,
      motionOverlay
    )
  );

  /* ── Gaze tab content ── */
  const gazeVideo = h('video', { className: 'visao-video', muted: true, playsinline: true });
  const gazeCanvas = h('canvas', { className: 'visao-canvas' });
  const gazeStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  const gazeDot = h('div', { className: 'visao-gaze-dot' });
  document.body.appendChild(gazeDot);
  let gazeRunning = false;

  const gazeStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (gazeRunning) {
      _gazeTracker?.stop(); _gazeTracker = null;
      gazeRunning = false;
      gazeStartBtn.textContent = '▶ Iniciar';
      gazeStatus.textContent = 'Câmera parada.';
      return;
    }
    gazeStatus.textContent = 'Carregando MediaPipe…';
    _gazeTracker = new GazeTracker(gazeVideo, gazeCanvas, gazeDot, gazeStatus);
    const ok = await _gazeTracker.start();
    if (ok) {
      gazeRunning = true;
      gazeStartBtn.textContent = '⏹ Parar';
    } else {
      _gazeTracker = null;
    }
  }}, '▶ Iniciar');

  const gazeContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' },
      gazeStartBtn,
      gazeStatus
    ),
    h('div', { className: 'visao-info-box' },
      h('p', null, 'O rastreador usa MediaPipe Face Mesh para detectar os landmarks dos olhos e estimar a direção do olhar. O ponto ciano segue para onde você está olhando na tela.'),
      h('p', null, '⚠ Funciona melhor com boa iluminação frontal e rosto centralizado na câmera.')
    ),
    h('div', { className: 'visao-viewport' },
      gazeVideo,
      gazeCanvas
    )
  );

  /* ── HAND tab ── */
  const handCanvas = h('canvas', { className: 'visao-canvas visao-canvas--full' });
  const handStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  let handRunning = false;
  const handStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (handRunning) {
      _handTracker?.stop(); _handTracker = null;
      handRunning = false; handStartBtn.textContent = '▶ Iniciar';
      handStatus.textContent = 'Câmera parada.'; return;
    }
    handStatus.textContent = 'Aguardando…';
    _handTracker = new HandTracker(handStatus);
    const ok = await _handTracker.start(handCanvas);
    if (ok) { handRunning = true; handStartBtn.textContent = '⏹ Parar'; }
    else { _handTracker = null; }
  }}, '▶ Iniciar');
  const handContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' }, handStartBtn, handStatus),
    h('div', { className: 'visao-info-box' },
      h('p', null, '🤖 Até 2 mãos rastreadas simultâneamente com 21 pontos cada (MediaPipe Hands). Esqueleto neon ciano + ponto magenta no pulso, estilo JARVIS / Iron Man.')
    ),
    h('div', { className: 'visao-viewport' }, handCanvas)
  );

  /* ── NIGHT tab ── */
  const nightCanvas = h('canvas', { className: 'visao-canvas visao-canvas--full' });
  const nightStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  let nightRunning = false;
  const nightStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (nightRunning) {
      _nightFilter?.stop(); _nightFilter = null;
      nightRunning = false; nightStartBtn.textContent = '▶ Iniciar';
      nightStatus.textContent = 'Câmera parada.'; return;
    }
    nightStatus.textContent = 'Aguardando câmera…';
    _nightFilter = new VisionFilter('night');
    const ok = await _nightFilter.start(nightCanvas);
    if (ok) { nightRunning = true; nightStartBtn.textContent = '⏹ Parar'; nightStatus.textContent = 'Visão noturna ativa.'; }
    else { _nightFilter = null; nightStatus.textContent = 'Câmera negada.'; }
  }}, '▶ Iniciar');
  const nightContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' }, nightStartBtn, nightStatus),
    h('div', { className: 'visao-info-box' },
      h('p', null, '🌙 Amplifica o canal de luminosidade 2.8× e aplica tint verde, scanlines e vinheta — simula óculos de visão noturna.')
    ),
    h('div', { className: 'visao-viewport' }, nightCanvas)
  );

  /* ── THERMAL tab ── */
  const thermalCanvas = h('canvas', { className: 'visao-canvas visao-canvas--full' });
  const thermalStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  let thermalRunning = false;
  const thermalStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (thermalRunning) {
      _thermalFilter?.stop(); _thermalFilter = null;
      thermalRunning = false; thermalStartBtn.textContent = '▶ Iniciar';
      thermalStatus.textContent = 'Câmera parada.'; return;
    }
    thermalStatus.textContent = 'Aguardando câmera…';
    _thermalFilter = new VisionFilter('thermal');
    const ok = await _thermalFilter.start(thermalCanvas);
    if (ok) { thermalRunning = true; thermalStartBtn.textContent = '⏹ Parar'; thermalStatus.textContent = 'Visão térmica ativa.'; }
    else { _thermalFilter = null; thermalStatus.textContent = 'Câmera negada.'; }
  }}, '▶ Iniciar');
  const thermalContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' }, thermalStartBtn, thermalStatus),
    h('div', { className: 'visao-info-box' },
      h('p', null, '🌡 Mapa de calor estilo FLIR: frio = azul/preto, quente = laranja/branco. Usa LUT de 256 cores aplicada por pixel via Canvas ImageData.')
    ),
    h('div', { className: 'visao-viewport' }, thermalCanvas)
  );

  /* ── CLARITY tab ── */
  const clarityCanvas = h('canvas', { className: 'visao-canvas visao-canvas--full' });
  const clarityStatus = h('span', { className: 'visao-status' }, 'Câmera parada.');
  let clarityRunning = false;
  const clarityStartBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (clarityRunning) {
      _clarityFilter?.stop(); _clarityFilter = null;
      clarityRunning = false; clarityStartBtn.textContent = '▶ Iniciar';
      clarityStatus.textContent = 'Câmera parada.'; return;
    }
    clarityStatus.textContent = 'Aguardando câmera…';
    _clarityFilter = new VisionFilter('clarity');
    const ok = await _clarityFilter.start(clarityCanvas);
    if (ok) { clarityRunning = true; clarityStartBtn.textContent = '⏹ Parar'; clarityStatus.textContent = 'Claridade ativa.'; }
    else { _clarityFilter = null; clarityStatus.textContent = 'Câmera negada.'; }
  }}, '▶ Iniciar');
  const clarityContent = h('div', { className: 'visao-tab-content' },
    h('div', { className: 'visao-controls' }, clarityStartBtn, clarityStatus),
    h('div', { className: 'visao-info-box' },
      h('p', null, '☀ Amplifica a exposição 3-4× e aplica tint quente — transforma uma cena escura em algo parecido com luz do dia.')
    ),
    h('div', { className: 'visao-viewport' }, clarityCanvas)
  );

  /* ── Tabs ── */
  const tabs = ['motion', 'gaze', 'hand', 'night', 'thermal', 'clarity'];
  const tabLabels = {
    motion: '◉ Movimento',
    gaze: '👁 Olhar',
    hand: '🤖 Mão JARVIS',
    night: '🌙 Noturno',
    thermal: '🌡 Térmico',
    clarity: '☀ Claridade'
  };
  const contents = { motion: motionContent, gaze: gazeContent, hand: handContent, night: nightContent, thermal: thermalContent, clarity: clarityContent };

  const tabBar = h('div', { className: 'visao-tabs' });
  const contentWrap = h('div', { className: 'visao-content' }, motionContent);

  const tabBtns = {};
  for (const t of tabs) {
    const btn = h('button', {
      className: `visao-tab${t === activeTab ? ' is-active' : ''}`,
      onclick: () => {
        if (activeTab === t) return;
        tabBtns[activeTab].classList.remove('is-active');
        activeTab = t;
        tabBtns[t].classList.add('is-active');
        contentWrap.innerHTML = '';
        contentWrap.appendChild(contents[t]);
      }
    }, tabLabels[t]);
    tabBtns[t] = btn;
    tabBar.appendChild(btn);
  }

  const wrap = h('div', { className: 'visao-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '👁 Visão & Câmera'),
      h('p', { className: 'u-text-muted' },
        'Detecção de movimento · Rastreamento de olhar · ',
        h('span', { style: { color: 'var(--color-cyan)' } }, 'Mão JARVIS'),
        ' · Visão Noturna · Visão Térmica · Claridade Noturna'
      )
    ),
    tabBar,
    contentWrap
  );

  /* cleanup ao sair */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(wrap)) {
      cleanup();
      if (document.body.contains(gazeDot)) document.body.removeChild(gazeDot);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return wrap;
}
