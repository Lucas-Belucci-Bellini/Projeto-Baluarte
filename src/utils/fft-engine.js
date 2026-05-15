/**
 * FFT Engine (Fase 15).
 *
 * Wrapper Web Audio API com 6 modos de visualização em Canvas 2D:
 *   1. bars       — espectro tradicional
 *   2. line       — curva de resposta em frequência
 *   3. waveform   — domínio do tempo
 *   4. radial     — barras polares
 *   5. spectrogram — waterfall scrolling
 *   6. particles  — partículas reagindo a bandas
 *
 * Fontes suportadas: microfone, arquivo de áudio, oscilador de teste.
 */

let audioCtx = null;
let analyserNode = null;
let gainNode = null;
let sourceNode = null;
let sourceType = null;
let mediaElement = null;
let microphoneStream = null;
let testOscillator = null;
let dataArray = null;
let waveformArray = null;
let spectrogramHistory = null;
let particles = null;
let animationId = null;
let renderMode = 'bars';
let renderCallback = null;

const PALETTE = {
  primary: '#00f0ff',
  secondary: '#ff00aa',
  warn: '#ffaa00',
  success: '#00ff88',
  bg: '#0a0a0a'
};

/* ===== Init / lifecycle ===== */

export function getAudioCtx() {
  if (!audioCtx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) throw new Error('Web Audio API não disponível');
    audioCtx = new C();
  }
  return audioCtx;
}

function ensureAnalyser() {
  const ctx = getAudioCtx();
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;
    gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    analyserNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    resizeBuffers();
  }
  return analyserNode;
}

function resizeBuffers() {
  if (!analyserNode) return;
  dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  waveformArray = new Uint8Array(analyserNode.fftSize);
}

export function setFftSize(size) {
  ensureAnalyser();
  /* fftSize válido: potência de 2 entre 32 e 32768 */
  analyserNode.fftSize = size;
  resizeBuffers();
}

export function setSmoothing(value) {
  ensureAnalyser();
  analyserNode.smoothingTimeConstant = Math.max(0, Math.min(1, value));
}

export function setGain(value) {
  ensureAnalyser();
  if (gainNode) gainNode.gain.value = Math.max(0, Math.min(2, value));
}

/* ===== Sources ===== */

export async function connectMicrophone() {
  disconnect();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  ensureAnalyser();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
  });
  microphoneStream = stream;
  sourceNode = ctx.createMediaStreamSource(stream);
  /* Microfone NÃO conecta ao destination pra evitar feedback */
  sourceNode.connect(analyserNode);
  /* Mas desconecta o gain do destination pra microfone só visualizar */
  try { gainNode.disconnect(ctx.destination); } catch {}
  sourceType = 'mic';
  return true;
}

export function connectMediaElement(el) {
  disconnect();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  ensureAnalyser();

  mediaElement = el;
  sourceNode = ctx.createMediaElementSource(el);
  sourceNode.connect(analyserNode);
  /* Reconnecta gain → destination pra ouvir o áudio */
  try { gainNode.connect(ctx.destination); } catch {}
  sourceType = 'media';
  return el;
}

export async function connectTestTone(frequency = 440) {
  disconnect();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  ensureAnalyser();

  testOscillator = ctx.createOscillator();
  testOscillator.type = 'sine';
  testOscillator.frequency.value = frequency;
  testOscillator.connect(analyserNode);
  testOscillator.start();
  try { gainNode.connect(ctx.destination); } catch {}
  sourceType = 'test';
  return testOscillator;
}

export function setTestFrequency(f) {
  if (testOscillator) testOscillator.frequency.value = f;
}

export function disconnect() {
  stopRender();
  if (testOscillator) {
    try { testOscillator.stop(); } catch {}
    try { testOscillator.disconnect(); } catch {}
    testOscillator = null;
  }
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((t) => t.stop());
    microphoneStream = null;
  }
  if (sourceNode) {
    try { sourceNode.disconnect(); } catch {}
    sourceNode = null;
  }
  sourceType = null;
}

export function getSourceType() {
  return sourceType;
}

/* ===== Rendering ===== */

export function setMode(mode) {
  renderMode = mode;
  /* Reset estado por modo */
  if (mode === 'spectrogram') {
    spectrogramHistory = null;
  }
  if (mode === 'particles') {
    particles = null;
  }
}

export function startRender(canvas, opts = {}) {
  ensureAnalyser();
  stopRender();
  const ctx = canvas.getContext('2d');

  function frame() {
    if (!analyserNode) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const W = rect.width;
    const H = rect.height;

    const drawer = MODES[renderMode] || MODES.bars;
    drawer(ctx, W, H, opts);

    if (renderCallback) {
      try { renderCallback({ peak: getPeak() }); } catch {}
    }

    animationId = requestAnimationFrame(frame);
  }
  animationId = requestAnimationFrame(frame);
}

export function stopRender() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
}

export function onRenderTick(cb) {
  renderCallback = cb;
}

function getPeak() {
  if (!dataArray) return 0;
  analyserNode.getByteFrequencyData(dataArray);
  let max = 0;
  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] > max) max = dataArray[i];
  }
  return max / 255;
}

/* ===== Modes ===== */

function clearBg(ctx, W, H) {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);
}

const MODES = {
  bars(ctx, W, H) {
    analyserNode.getByteFrequencyData(dataArray);
    clearBg(ctx, W, H);
    const bins = Math.min(dataArray.length, 256);
    const barW = W / bins;
    for (let i = 0; i < bins; i++) {
      const v = dataArray[i] / 255;
      const barH = v * H * 0.95;
      const x = i * barW;
      const y = H - barH;
      const t = i / bins;
      const r = Math.round(0 + (255 - 0) * t);
      const g = Math.round(240 + (0 - 240) * t);
      const b = Math.round(255 + (170 - 255) * t);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, Math.max(barW - 1, 1), barH);
    }
  },

  line(ctx, W, H) {
    analyserNode.getByteFrequencyData(dataArray);
    clearBg(ctx, W, H);
    const bins = dataArray.length;
    ctx.strokeStyle = PALETTE.primary;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.primary;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < bins; i++) {
      const v = dataArray[i] / 255;
      const x = (i / bins) * W;
      const y = H - v * H * 0.9;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Fill below */
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
  },

  waveform(ctx, W, H) {
    analyserNode.getByteTimeDomainData(waveformArray);
    clearBg(ctx, W, H);
    /* Linha zero */
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    /* Waveform */
    ctx.strokeStyle = PALETTE.secondary;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.secondary;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const len = waveformArray.length;
    for (let i = 0; i < len; i++) {
      const v = (waveformArray[i] - 128) / 128;
      const x = (i / len) * W;
      const y = H / 2 + v * H * 0.45;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  radial(ctx, W, H) {
    analyserNode.getByteFrequencyData(dataArray);
    clearBg(ctx, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const innerR = Math.min(W, H) * 0.18;
    const outerMax = Math.min(W, H) * 0.45;
    const bins = Math.min(dataArray.length, 180);

    for (let i = 0; i < bins; i++) {
      const v = dataArray[i] / 255;
      const angle = (i / bins) * Math.PI * 2 - Math.PI / 2;
      const len = v * (outerMax - innerR);
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * (innerR + len);
      const y2 = cy + Math.sin(angle) * (innerR + len);
      const t = i / bins;
      const r = Math.round(0 + (255 - 0) * t);
      const g = Math.round(240 + (0 - 240) * t);
      const b = Math.round(255 + (170 - 255) * t);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    /* Anel central */
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();
  },

  spectrogram(ctx, W, H) {
    analyserNode.getByteFrequencyData(dataArray);

    /* Inicializa history se necessário (W pode mudar com resize) */
    if (!spectrogramHistory || spectrogramHistory.width !== Math.floor(W)) {
      spectrogramHistory = ctx.getImageData(0, 0, Math.max(1, Math.floor(W)), Math.max(1, Math.floor(H)));
      ctx.clearRect(0, 0, W, H);
      spectrogramHistory.width = Math.floor(W);
    }

    /* Scrolla 1px à esquerda */
    const imageData = ctx.getImageData(1, 0, Math.floor(W) - 1, Math.floor(H));
    ctx.putImageData(imageData, 0, 0);

    /* Coluna nova à direita */
    const bins = dataArray.length;
    const colX = Math.floor(W) - 1;
    for (let y = 0; y < H; y++) {
      const binIdx = Math.floor(((H - 1 - y) / H) * bins);
      const v = dataArray[binIdx] / 255;
      /* Gradient: dark → cyan → magenta → orange */
      let r, g, b;
      if (v < 0.33) {
        const t = v / 0.33;
        r = 10 + t * (0 - 10);
        g = 10 + t * (240 - 10);
        b = 16 + t * (255 - 16);
      } else if (v < 0.66) {
        const t = (v - 0.33) / 0.33;
        r = 0 + t * (255 - 0);
        g = 240 + t * (0 - 240);
        b = 255 + t * (170 - 255);
      } else {
        const t = (v - 0.66) / 0.34;
        r = 255;
        g = 0 + t * (170 - 0);
        b = 170 + t * (0 - 170);
      }
      ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      ctx.fillRect(colX, y, 1, 1);
    }
  },

  particles(ctx, W, H) {
    analyserNode.getByteFrequencyData(dataArray);
    if (!particles) {
      particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        band: Math.floor(Math.random() * dataArray.length)
      }));
    }
    /* Fade */
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
    ctx.fillRect(0, 0, W, H);

    particles.forEach((p) => {
      const energy = dataArray[p.band] / 255;
      p.x += p.vx * (1 + energy * 4);
      p.y += p.vy * (1 + energy * 4);
      if (p.x < 0 || p.x > W) p.vx = -p.vx;
      if (p.y < 0 || p.y > H) p.vy = -p.vy;

      const t = p.band / dataArray.length;
      const r = Math.round(0 + (255 - 0) * t);
      const g = Math.round(240 + (0 - 240) * t);
      const b = Math.round(255 + (170 - 255) * t);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + energy * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size + energy * 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

export const RENDER_MODES = [
  { id: 'bars', label: 'Espectro · Barras', icon: '▮' },
  { id: 'line', label: 'Espectro · Curva', icon: '⤴' },
  { id: 'waveform', label: 'Forma de Onda', icon: '~' },
  { id: 'radial', label: 'Radial', icon: '◯' },
  { id: 'spectrogram', label: 'Spectrogram', icon: '▦' },
  { id: 'particles', label: 'Partículas', icon: '∴' }
];
