/**
 * /jarvis-vision — JARVIS · Rastreamento Corporal Total
 *
 * Sessão dedicada de visão computacional estilo Iron Man:
 *   • Corpo (MediaPipe Pose)      — 33 pontos do esqueleto humano
 *   • Mãos (MediaPipe Hands)      — até N mãos, 21 pontos cada
 *   • Detecção de movimento       — destaca articulações que se moveram
 *   • HUD tático                  — cantos, grade, relógio, métricas
 *
 * Tudo roda sobre a mesma câmera, com camadas que podem ser ligadas/desligadas.
 */

import { h } from '../utils/helpers.js';

/* ── Loader de script CDN com cache por src ── */
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error('falha ao carregar ' + src));
    document.head.appendChild(s);
  });
}

/* Conexões dos 21 pontos da mão (MediaPipe Hands) */
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20]
];

/* Conexões dos 33 pontos do corpo (MediaPipe Pose) */
const POSE_CONNECTIONS = [
  [11,12],[11,13],[13,15],[12,14],[14,16],          // braços
  [11,23],[12,24],[23,24],                          // tronco
  [23,25],[25,27],[27,29],[29,31],[27,31],          // perna esquerda
  [24,26],[26,28],[28,30],[30,32],[28,32],          // perna direita
  [15,17],[15,19],[15,21],[16,18],[16,20],[16,22],  // mãos (do pose)
  [9,10],[0,11],[0,12]                              // boca/ombros
];

/* ══════════════════════════════════════
   LATERALIDADE (handedness) — 4 funções dedicadas
   ──────────────────────────────────────
   O vídeo é espelhado (selfie). O MediaPipe rotula da perspectiva da
   câmera, então o rótulo cru fica invertido na tela. Em vez de um
   ternário único, separamos em 4 responsabilidades:

     resolveLeft  / resolveRight  → produzem o rótulo de display
     conferirLeft / conferirRight → validam o rótulo contra a posição
                                    real do pulso na tela (cross-check)

   O cross-check é a fonte da verdade: como a imagem é espelhada, a mão
   que aparece no lado ESQUERDO da tela é a mão DIREITA da pessoa, e
   vice-versa. Usamos a posição do pulso (x espelhado) para confirmar.
   ══════════════════════════════════════ */

/** Rótulo cru "Left" → display "RIGHT" (mão direita da pessoa). */
function resolveLeft(rawLabel) {
  return rawLabel === 'Left' ? 'RIGHT' : null;
}

/** Rótulo cru "Right" → display "LEFT" (mão esquerda da pessoa). */
function resolveRight(rawLabel) {
  return rawLabel === 'Right' ? 'LEFT' : null;
}

/**
 * Confere se o display "RIGHT" bate com a posição.
 * Com vídeo espelhado, a mão direita da pessoa aparece à ESQUERDA da
 * tela → x espelhado (1 - wristX) < 0.5. Retorna true se consistente.
 */
function conferirRight(wristX) {
  const screenX = 1 - wristX;        // x já espelhado no canvas
  return screenX < 0.5;
}

/**
 * Confere se o display "LEFT" bate com a posição.
 * Mão esquerda da pessoa aparece à DIREITA da tela → x espelhado >= 0.5.
 */
function conferirLeft(wristX) {
  const screenX = 1 - wristX;
  return screenX >= 0.5;
}

/**
 * Decide o rótulo final de uma mão combinando rótulo + cross-check de
 * posição. Se o rótulo do MediaPipe contradiz a posição na tela,
 * confiamos na POSIÇÃO (mais robusta com imagem espelhada).
 */
function decidirLado(rawLabel, wristX) {
  let label = resolveLeft(rawLabel) || resolveRight(rawLabel) || rawLabel.toUpperCase();
  if (label === 'RIGHT' && !conferirRight(wristX)) label = 'LEFT';
  else if (label === 'LEFT' && !conferirLeft(wristX)) label = 'RIGHT';
  return label;
}

/* ══════════════════════════════════════
   ENGINE — uma câmera, várias camadas
   ══════════════════════════════════════ */

class JarvisVision {
  constructor(canvas, opts, statusEl, metricsEl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.opts = opts;            // { body, hands, motion, hud, maxHands }
    this.statusEl = statusEl;
    this.metricsEl = metricsEl;

    this.video = null;
    this.stream = null;
    this.pose = null;
    this.hands = null;
    this.running = false;
    this.raf = null;
    this.frame = 0;

    this.poseResults = null;
    this.handResults = null;

    /* buffer de luminância para detecção de movimento */
    this.prevLum = null;
    this.motionCells = [];       // grade de células com movimento
    this.GRID = 24;              // resolução da grade de movimento

    this._fpsT = performance.now();
    this._fpsN = 0;
    this._fps = 0;
  }

  async start() {
    const setS = (t) => { if (this.statusEl) this.statusEl.textContent = t; };
    setS('Carregando modelos MediaPipe…');
    try {
      if (this.opts.body)  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
      if (this.opts.hands) await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    } catch (e) {
      setS('Falha ao carregar modelos — verifique a conexão.');
      return false;
    }

    setS('Solicitando câmera…');
    try {
      this.video = document.createElement('video');
      this.video.muted = true; this.video.playsInline = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
      });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch {
      setS('Câmera negada ou indisponível.');
      return false;
    }

    const vw = this.video.videoWidth || 1280;
    const vh = this.video.videoHeight || 720;
    this.canvas.width = vw;
    this.canvas.height = vh;

    if (this.opts.body) {
      this.pose = new window.Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
      /* modelComplexity 2 = modelo mais preciso (heavy); smoothLandmarks
       * suaviza tremores entre frames; segmentação desligada por custo. */
      this.pose.setOptions({
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      this.pose.onResults(r => { this.poseResults = r; });
      await this.pose.initialize();
    }
    if (this.opts.hands) {
      this.hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      this.hands.setOptions({ maxNumHands: this.opts.maxHands || 4, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      this.hands.onResults(r => { this.handResults = r; });
      await this.hands.initialize();
    }

    this.running = true;
    setS('● RASTREANDO');
    this._loop();
    return true;
  }

  setOpt(k, v) { this.opts[k] = v; }

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    if (!this.video || this.video.readyState < 2) return;

    this.frame++;
    /* Alterna envio de frames aos modelos (custo alto) — pose e hands em
     * frames distintos para manter fluidez. */
    try {
      if (this.opts.body && this.pose && this.frame % 2 === 0)  this.pose.send({ image: this.video });
      if (this.opts.hands && this.hands && this.frame % 2 === 1) this.hands.send({ image: this.video });
    } catch {}

    try { this._render(); } catch {}

    /* FPS */
    this._fpsN++;
    const now = performance.now();
    if (now - this._fpsT >= 500) {
      this._fps = Math.round((this._fpsN * 1000) / (now - this._fpsT));
      this._fpsN = 0; this._fpsT = now;
      this._updateMetrics();
    }
  }

  _render() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;

    /* Vídeo espelhado (selfie) com leve escurecimento p/ destacar overlay */
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(this.video, -W, 0, W, H); ctx.restore();
    ctx.fillStyle = 'rgba(0,8,16,0.32)'; ctx.fillRect(0, 0, W, H);

    if (this.opts.motion) this._renderMotion(W, H);
    if (this.opts.hud)    this._renderHUD(W, H);
    if (this.opts.body)   this._renderPose(W, H);
    if (this.opts.hands)  this._renderHands(W, H);
  }

  /* ── Detecção de movimento por grade ── */
  _renderMotion(W, H) {
    const gx = this.GRID, gy = Math.round(this.GRID * H / W);
    const cw = Math.floor(W / gx), ch = Math.floor(H / gy);
    /* amostra luminância reduzida */
    const small = ctx2dSample(this.ctx, W, H, gx, gy);
    if (this.prevLum && this.prevLum.length === small.length) {
      this.motionCells.length = 0;
      for (let j = 0; j < gy; j++) {
        for (let i = 0; i < gx; i++) {
          const idx = j * gx + i;
          const diff = Math.abs(small[idx] - this.prevLum[idx]);
          if (diff > 18) this.motionCells.push({ i, j, e: Math.min(1, diff / 80) });
        }
      }
      /* desenha células de movimento (espelhadas) */
      const ctx = this.ctx;
      for (const c of this.motionCells) {
        const x = W - (c.i + 1) * cw;
        const y = c.j * ch;
        ctx.fillStyle = `rgba(255,0,170,${0.10 + c.e * 0.35})`;
        ctx.fillRect(x, y, cw, ch);
        ctx.strokeStyle = `rgba(255,0,170,${0.3 + c.e * 0.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      }
    }
    this.prevLum = small;
  }

  /* ── Esqueleto do corpo (33 pontos) ── */
  _renderPose(W, H) {
    const lm = this.poseResults?.poseLandmarks;
    if (!lm) return;
    const ctx = this.ctx;
    const X = (p) => (1 - p.x) * W, Y = (p) => p.y * H;
    const VIS = 0.4;   // limiar de visibilidade um pouco mais alto = menos ruído

    /* Conexões — linha externa grossa translúcida + núcleo fino brilhante
     * (efeito de "feixe de energia" estilo JARVIS). */
    for (const [a, b] of POSE_CONNECTIONS) {
      if (!lm[a] || !lm[b]) continue;
      if ((lm[a].visibility ?? 1) < VIS || (lm[b].visibility ?? 1) < VIS) continue;
      const x1 = X(lm[a]), y1 = Y(lm[a]), x2 = X(lm[b]), y2 = Y(lm[b]);
      ctx.strokeStyle = 'rgba(0,240,255,0.18)'; ctx.lineWidth = 7; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,250,255,0.95)'; ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    /* Articulações principais (ombros, cotovelos, quadris, joelhos…) com
     * halo maior; pontos do rosto (0..10) menores. */
    const MAJOR = new Set([11,12,13,14,15,16,23,24,25,26,27,28]);
    for (let i = 0; i < lm.length; i++) {
      if ((lm[i].visibility ?? 1) < VIS) continue;
      const x = X(lm[i]), y = Y(lm[i]);
      const major = MAJOR.has(i);
      const r = i <= 10 ? 2.5 : major ? 6 : 4;
      if (major) {
        ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,240,255,0.18)'; ctx.shadowBlur = 0; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = major ? '#7afaff' : '#00f0ff';
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = major ? 16 : 10;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  /* ── Mãos (21 pontos cada) ── */
  _renderHands(W, H) {
    const list = this.handResults?.multiHandLandmarks;
    if (!list) return;
    const ctx = this.ctx;
    const X = (p) => (1 - p.x) * W, Y = (p) => p.y * H;
    const TIPS = new Set([4, 8, 12, 16, 20]);

    for (let hi = 0; hi < list.length; hi++) {
      const lm = list[hi];
      ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(0,255,136,0.85)'; ctx.lineWidth = 2;
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath(); ctx.moveTo(X(lm[a]), Y(lm[a])); ctx.lineTo(X(lm[b]), Y(lm[b])); ctx.stroke();
      }
      for (let i = 0; i < lm.length; i++) {
        const wrist = i === 0, tip = TIPS.has(i);
        ctx.beginPath();
        ctx.arc(X(lm[i]), Y(lm[i]), wrist ? 6 : tip ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = wrist ? '#ff00aa' : '#00ff88';
        ctx.shadowColor = wrist ? '#ff00aa' : '#00ff88';
        ctx.shadowBlur = wrist ? 16 : 10;
        ctx.fill();
      }
      /* Lado decidido pelas 4 funções dedicadas (rótulo + cross-check de
       * posição). A posição do pulso na tela é a fonte da verdade. */
      const raw = this.handResults.multiHandedness?.[hi]?.label || '';
      const label = decidirLado(raw, lm[0].x);
      ctx.shadowBlur = 0; ctx.font = 'bold 13px monospace';
      const lx = X(lm[0]) - 20, ly = Y(lm[0]) + 28;
      ctx.fillStyle = 'rgba(0,12,24,0.55)';
      ctx.fillRect(lx - 2, ly - 13, ctx.measureText(label).width + 6, 17);
      ctx.fillStyle = 'rgba(0,255,136,0.95)';
      ctx.fillText(label, lx, ly);
    }
    ctx.shadowBlur = 0;
  }

  /* ── HUD tático ── */
  _renderHUD(W, H) {
    const ctx = this.ctx;
    const c = 'rgba(0,240,255,0.35)';
    /* grade sutil */
    ctx.strokeStyle = 'rgba(0,240,255,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += W / 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += H / 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    /* cantos */
    ctx.strokeStyle = c; ctx.lineWidth = 2; const L = 32;
    for (const [px, py, sx, sy] of [[0,0,1,1],[W-1,0,-1,1],[0,H-1,1,-1],[W-1,H-1,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(px + sx*L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy*L); ctx.stroke();
    }
    /* mira central */
    ctx.strokeStyle = 'rgba(0,240,255,0.25)';
    ctx.beginPath(); ctx.arc(W/2, H/2, 26, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-36, H/2); ctx.lineTo(W/2-12, H/2);
    ctx.moveTo(W/2+12, H/2); ctx.lineTo(W/2+36, H/2);
    ctx.moveTo(W/2, H/2-36); ctx.lineTo(W/2, H/2-12);
    ctx.moveTo(W/2, H/2+12); ctx.lineTo(W/2, H/2+36); ctx.stroke();
    /* texto */
    ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '13px monospace';
    ctx.fillText('J.A.R.V.I.S · FULL BODY TRACKING', 14, 24);
    ctx.fillText(new Date().toLocaleTimeString(), W - 96, 24);
  }

  _updateMetrics() {
    if (!this.metricsEl) return;
    const hands = this.handResults?.multiHandLandmarks?.length || 0;
    const body = this.poseResults?.poseLandmarks ? 1 : 0;
    const visiblePts =
      (this.poseResults?.poseLandmarks?.filter(p => (p.visibility ?? 1) >= 0.3).length || 0) +
      hands * 21;
    const motion = this.motionCells.length;
    this.metricsEl.innerHTML =
      `<span>FPS <b>${this._fps}</b></span>` +
      `<span>Corpos <b>${body}</b></span>` +
      `<span>Mãos <b>${hands}</b></span>` +
      `<span>Pontos <b>${visiblePts}</b></span>` +
      `<span>Movimento <b>${motion}</b> céls</span>`;
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.pose)  { try { this.pose.close(); } catch {} }
    if (this.hands) { try { this.hands.close(); } catch {} }
    this.stream = null; this.video = null; this.pose = null; this.hands = null;
  }
}

/* Amostra luminância média do canvas numa grade gx×gy → Uint8Array */
function ctx2dSample(ctx, W, H, gx, gy) {
  const img = ctx.getImageData(0, 0, W, H).data;
  const out = new Uint8Array(gx * gy);
  const cw = Math.floor(W / gx), ch = Math.floor(H / gy);
  for (let j = 0; j < gy; j++) {
    for (let i = 0; i < gx; i++) {
      let sum = 0, n = 0;
      const x0 = i * cw, y0 = j * ch;
      for (let y = y0; y < y0 + ch; y += 4) {
        for (let x = x0; x < x0 + cw; x += 4) {
          const p = (y * W + x) * 4;
          sum += 0.299*img[p] + 0.587*img[p+1] + 0.114*img[p+2];
          n++;
        }
      }
      out[j * gx + i] = n ? Math.round(sum / n) : 0;
    }
  }
  return out;
}

/* ══════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════ */

let _engine = null;

function cleanup() {
  if (_engine) { _engine.stop(); _engine = null; }
}

export function jarvisVisionPage() {
  cleanup();

  const opts = { body: true, hands: true, motion: true, hud: true, maxHands: 8 };

  const canvas = h('canvas', { className: 'jv-canvas' });
  const status = h('span', { className: 'jv-status' }, 'Câmera parada.');
  const metrics = h('div', { className: 'jv-metrics' });
  let running = false;

  const startBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (running) {
      _engine?.stop(); _engine = null;
      running = false; startBtn.textContent = '▶ Ativar JARVIS';
      status.textContent = 'Câmera parada.'; metrics.innerHTML = '';
      return;
    }
    startBtn.disabled = true;
    _engine = new JarvisVision(canvas, { ...opts }, status, metrics);
    const ok = await _engine.start();
    startBtn.disabled = false;
    if (ok) { running = true; startBtn.textContent = '⏹ Desativar'; }
    else { _engine = null; }
  }}, '▶ Ativar JARVIS');

  /* Toggles de camada */
  const layerDefs = [
    { k: 'body',   label: '🦴 Corpo (33 pts)' },
    { k: 'hands',  label: '✋ Mãos' },
    { k: 'motion', label: '📡 Movimento' },
    { k: 'hud',    label: '🎯 HUD' }
  ];
  const layerBtns = layerDefs.map(({ k, label }) => {
    const b = h('button', {
      className: `jv-toggle${opts[k] ? ' is-on' : ''}`,
      onclick: () => {
        opts[k] = !opts[k];
        b.classList.toggle('is-on', opts[k]);
        if (_engine) _engine.setOpt(k, opts[k]);
      }
    }, label);
    return b;
  });

  /* Seletor de máximo de mãos */
  const handsSel = h('select', { className: 'jv-select', onchange: (e) => {
    opts.maxHands = +e.target.value;
    if (_engine && _engine.hands) _engine.hands.setOptions({ maxNumHands: opts.maxHands });
  } },
    ...[2, 4, 6, 8, 10, 12, 16, 20].map(n =>
      h('option', { value: String(n), selected: n === 8 }, `${n} mãos`))
  );

  const wrap = h('div', { className: 'jv-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🤖 JARVIS · Rastreamento Corporal Total'),
      h('p', { className: 'u-text-muted' },
        'Corpo inteiro (33 pontos) + múltiplas mãos (21 pts cada) + detecção de movimento em grade, tudo sobre uma câmera, estilo Iron Man.'
      )
    ),
    h('div', { className: 'jv-bar' },
      startBtn,
      ...layerBtns,
      h('label', { className: 'jv-label' }, 'Máx:', handsSel),
      status
    ),
    metrics,
    h('div', { className: 'jv-viewport' }, canvas),
    h('div', { className: 'jv-legend' },
      h('span', null, h('i', { style: { background: '#00f0ff' } }), 'Esqueleto corporal'),
      h('span', null, h('i', { style: { background: '#00ff88' } }), 'Mãos'),
      h('span', null, h('i', { style: { background: '#ff00aa' } }), 'Movimento / pulso')
    ),
    h('div', { className: 'jv-info' },
      h('p', null, '⚡ Os modelos (MediaPipe Pose + Hands) carregam via CDN na primeira ativação (~5-8s). Depois ficam em cache.'),
      h('p', null, '💡 Funciona melhor com o corpo enquadrado e boa iluminação. As células magenta acendem onde há movimento — afaste-se da câmera para capturar o corpo todo.')
    )
  );

  /* cleanup ao sair da rota */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(wrap)) { cleanup(); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return wrap;
}
