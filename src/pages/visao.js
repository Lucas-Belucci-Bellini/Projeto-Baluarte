/**
 * /visao — Visão & Câmera
 * Tab 1: Detecção de movimento (diff de frames via canvas)
 * Tab 2: Rastreamento de olhar (MediaPipe Face Mesh → estimativa de gaze)
 */

import { h } from '../utils/helpers.js';

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
   PÁGINA
   ══════════════════════════════════════ */

let _motionDetector = null;
let _gazeTracker = null;

function cleanup() {
  if (_motionDetector) { _motionDetector.stop(); _motionDetector = null; }
  if (_gazeTracker) { _gazeTracker.stop(); _gazeTracker = null; }
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

  /* ── Tabs ── */
  const tabs = ['motion', 'gaze'];
  const tabLabels = { motion: '◉ Detecção de Movimento', gaze: '👁 Rastreamento de Olhar' };
  const contents = { motion: motionContent, gaze: gazeContent };

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
      h('p', { className: 'u-text-muted' }, 'Detecção de movimento e rastreamento de olhar em tempo real via câmera.')
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
