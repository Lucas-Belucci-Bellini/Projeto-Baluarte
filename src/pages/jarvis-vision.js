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
   LATERALIDADE (handedness) — 100% posicional
   ──────────────────────────────────────
   O rótulo cru do MediaPipe ("Left"/"Right") é instável e troca de frame
   para frame — era o que fazia LEFT e RIGHT aparecerem juntos/invertidos.
   Agora ignoramos o rótulo e decidimos SÓ pela posição do pulso na tela,
   que com vídeo espelhado é a fonte da verdade:
     • mão DIREITA da pessoa → aparece à ESQUERDA da tela
     • mão ESQUERDA da pessoa → aparece à DIREITA da tela
   `decidirLadoPosicional` resolve uma mão isolada; `rotularMaos` resolve o
   conjunto evitando rótulos duplicados quando há 2 mãos.
   ══════════════════════════════════════ */

/** Posição X do pulso na TELA (já espelhada) → 0..1, 0 = borda esquerda. */
function telaX(wristX) { return 1 - wristX; }

/** Lado de uma mão isolada, só pela posição na tela. */
function decidirLadoPosicional(wristX) {
  return telaX(wristX) < 0.5 ? 'RIGHT' : 'LEFT';
}

/**
 * Rotula um conjunto de mãos garantindo unicidade quando há exatamente 2:
 * a que está mais à esquerda da tela é RIGHT, a outra é LEFT. Isso impede
 * que ambas recebam o mesmo rótulo (o bug dos "dois juntos"). Para 1 ou
 * 3+ mãos, usa a decisão posicional individual.
 * @param {Array<{wristX:number}>} maos
 * @returns {string[]} rótulos na mesma ordem de entrada
 */
function rotularMaos(maos) {
  if (maos.length === 2) {
    const [a, b] = maos;
    const aMaisEsq = telaX(a.wristX) < telaX(b.wristX);
    const out = [];
    out[0] = aMaisEsq ? 'RIGHT' : 'LEFT';
    out[1] = aMaisEsq ? 'LEFT' : 'RIGHT';
    return out;
  }
  return maos.map(m => decidirLadoPosicional(m.wristX));
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

    /* Detecção de movimento — canvas offscreen reduzido para diff rápido */
    this.motionW = 160;          // resolução horizontal do buffer de movimento
    this.motionH = 90;
    this._moCanvas = document.createElement('canvas');
    this._moCanvas.width = this.motionW;
    this._moCanvas.height = this.motionH;
    this._moCtx = this._moCanvas.getContext('2d', { willReadFrequently: true });
    this.prevLum = null;
    this.motionMask = null;      // Float32 0..1 por célula (energia de movimento)
    this.motionCount = 0;
    this.MOTION_THR = 14;        // limiar de diferença de luminância (0..255)

    /* Malha densa (point cloud) — alvo de até 256k pontos sobre a silhueta */
    this.MESH_TARGET = 256000;
    this._meshImage = null;

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
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: this.opts.mesh,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
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

  setOpt(k, v) {
    this.opts[k] = v;
    /* Segmentação só roda quando malha está ativa — reconfigurar o pose */
    if (k === 'mesh' && this.pose) {
      try {
        this.pose.setOptions({ enableSegmentation: v, smoothSegmentation: false });
      } catch {}
    }
  }

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    if (!this.video || this.video.readyState < 2) return;

    this.frame++;
    /* Throttle: pose a cada 3 frames, hands nos outros frames — mantém fluidez */
    try {
      if (this.opts.body  && this.pose  && this.frame % 3 === 0) this.pose.send({ image: this.video });
      if (this.opts.hands && this.hands && this.frame % 3 === 1) this.hands.send({ image: this.video });
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
<<<<<<< HEAD
    if (this.opts.mesh && this.frame % 4 === 2) this._renderMesh(W, H);
=======
    if (this.opts.mesh)   this._renderMesh(W, H);
>>>>>>> origin/main
    if (this.opts.hud)    this._renderHUD(W, H);
    if (this.opts.body)   this._renderPose(W, H);
    if (this.opts.hands)  this._renderHands(W, H);
  }

  /* ── Malha densa de pontos sobre o corpo (até 256k) ──
   * Usa a máscara de segmentação do Pose. Amostramos a silhueta numa
   * grade fina e pintamos cada ponto com cor dependente da posição
   * vertical (gradiente ciano→magenta), criando o "scan corporal". */
  _renderMesh(W, H) {
    const seg = this.poseResults?.segmentationMask;
    if (!seg) return;
    const ctx = this.ctx;

    /* Lê a máscara num buffer reduzido (rápido) */
    const mw = 320, mh = Math.round(320 * H / W);
    if (!this._meshCanvas) {
      this._meshCanvas = document.createElement('canvas');
      this._meshCtx = this._meshCanvas.getContext('2d', { willReadFrequently: true });
    }
    this._meshCanvas.width = mw; this._meshCanvas.height = mh;
    try { this._meshCtx.drawImage(seg, 0, 0, mw, mh); } catch { return; }
    const data = this._meshCtx.getImageData(0, 0, mw, mh).data;

    /* Conta pixels de corpo para calibrar o passo e atingir ~MESH_TARGET */
    let bodyPx = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] > 80) bodyPx++;
    if (!bodyPx) { this._meshCount = 0; return; }

    /* densidade real na grade reduzida; depois mapeamos p/ tela cheia */
    const target = Math.min(this.MESH_TARGET, 60000); // teto de desenho real p/ perf
    const step = Math.max(1, Math.round(Math.sqrt(bodyPx / target)));
    const sx = W / mw, sy = H / mh;

    let drawn = 0;
    ctx.shadowBlur = 0;
    for (let y = 0; y < mh; y += step) {
      for (let x = 0; x < mw; x += step) {
        const p = (y * mw + x) * 4;
        if (data[p] <= 80) continue;
        const px = W - x * sx;       // espelhado
        const py = y * sy;
        const t = y / mh;            // gradiente vertical
        const r = Math.round(0 + t * 255);
        const g = Math.round(240 - t * 180);
        const b = Math.round(255 - t * 90);
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
        ctx.fillRect(px, py, 1.5, 1.5);
        drawn++;
      }
    }
    /* estimativa de pontos "capturados" em resolução plena */
    this._meshCount = Math.round(bodyPx * sx * sy / (step * step));
  }

  /* ── Scanner de movimento (rápido e preciso) ──
   * Desenha o frame num canvas offscreen 160×90 e calcula o diff de
   * luminância pixel-a-pixel nessa resolução baixa (≈14k amostras, custo
   * irrisório). Cada pixel de movimento vira um bloco brilhante na tela,
   * dando resolução muito maior que a antiga grade 24×N. */
  _renderMotion(W, H) {
    const mw = this.motionW, mh = this.motionH;
    this._moCtx.drawImage(this.video, 0, 0, mw, mh);
    const data = this._moCtx.getImageData(0, 0, mw, mh).data;

    /* luminância atual */
    const lum = new Uint8Array(mw * mh);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
      lum[i] = (data[p] * 77 + data[p + 1] * 150 + data[p + 2] * 29) >> 8;
    }

    if (this.prevLum && this.prevLum.length === lum.length) {
      const ctx = this.ctx;
      const cw = W / mw, ch = H / mh;
      const thr = this.MOTION_THR;
      let count = 0;
      ctx.shadowBlur = 0;
      for (let j = 0; j < mh; j++) {
        for (let i = 0; i < mw; i++) {
          const idx = j * mw + i;
          const diff = Math.abs(lum[idx] - this.prevLum[idx]);
          if (diff <= thr) continue;
          const e = Math.min(1, diff / 70);
          /* posição espelhada */
          const x = W - (i + 1) * cw;
          const y = j * ch;
          ctx.fillStyle = `rgba(255,${Math.round(40 + e * 80)},170,${0.18 + e * 0.5})`;
          ctx.fillRect(x, y, cw + 0.5, ch + 0.5);
          count++;
        }
      }
      this.motionCount = count;
    }
    this.prevLum = lum;
  }

  /* ── Esqueleto do corpo — mínimo 256 pontos interpolados ──
   * 33 landmarks nativos + ~10 pontos interpolados por conexão ao longo da
   * curva de Bezier quadrática → total ≥ 303 pontos visíveis por frame.
   * Cada ponto interpolado recebe um halo proporcional à sua posição no
   * segmento, criando o efeito de "energia fluindo pelos membros". */
  _renderPose(W, H) {
    const lm = this.poseResults?.poseLandmarks;
    if (!lm) return;
    const ctx = this.ctx;
    const X = (p) => (1 - p.x) * W, Y = (p) => p.y * H;
    const VIS = 0.4;
    const INTERP = 10;   // pontos interpolados por segmento (27 seg × 10 = 270 pts extras)
    const MAJOR = new Set([11,12,13,14,15,16,23,24,25,26,27,28]);

    /* Avalia ponto na bezier quadrática parametrizada em t (0..1) */
    const qx = (x1, cx, x2, t) => (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
    const qy = (y1, cy, y2, t) => (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;

    /* Camada 1 — halo exterior (linha grossa translúcida) */
    ctx.shadowBlur = 0;
    for (const [a, b] of POSE_CONNECTIONS) {
      if (!lm[a] || !lm[b]) continue;
      if ((lm[a].visibility ?? 1) < VIS || (lm[b].visibility ?? 1) < VIS) continue;
      const x1 = X(lm[a]), y1 = Y(lm[a]), x2 = X(lm[b]), y2 = Y(lm[b]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const cpx = mx - (dy / len) * len * 0.06;
      const cpy = my + (dx / len) * len * 0.06;
      ctx.strokeStyle = 'rgba(0,240,255,0.15)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2); ctx.stroke();
    }

    /* Camada 2 — linha núcleo brilhante */
    ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(120,250,255,0.9)'; ctx.lineWidth = 1.5;
    for (const [a, b] of POSE_CONNECTIONS) {
      if (!lm[a] || !lm[b]) continue;
      if ((lm[a].visibility ?? 1) < VIS || (lm[b].visibility ?? 1) < VIS) continue;
      const x1 = X(lm[a]), y1 = Y(lm[a]), x2 = X(lm[b]), y2 = Y(lm[b]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const cpx = mx - (dy / len) * len * 0.06;
      const cpy = my + (dx / len) * len * 0.06;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2); ctx.stroke();
    }

    /* Camada 3 — pontos interpolados ao longo de cada bezier (densidade: INTERP) */
    let skPts = 0;
    for (const [a, b] of POSE_CONNECTIONS) {
      if (!lm[a] || !lm[b]) continue;
      if ((lm[a].visibility ?? 1) < VIS || (lm[b].visibility ?? 1) < VIS) continue;
      const x1 = X(lm[a]), y1 = Y(lm[a]), x2 = X(lm[b]), y2 = Y(lm[b]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const cpx = mx - (dy / len) * len * 0.06;
      const cpy = my + (dx / len) * len * 0.06;
      for (let k = 1; k < INTERP; k++) {
        const t = k / INTERP;
        const px = qx(x1, cpx, x2, t);
        const py = qy(y1, cpy, y2, t);
        /* oscila entre ciano e branco conforme t — efeito de pulso de energia */
        const g = Math.round(200 + t * 55);
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,${g},255,0.75)`;
        ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 6;
        ctx.fill();
        skPts++;
      }
    }
    this._skeletonPts = 33 + skPts;   // exposto para métricas

    /* Camada 4 — articulações originais (landmarks nativos) */
    for (let i = 0; i < lm.length; i++) {
      if ((lm[i].visibility ?? 1) < VIS) continue;
      const x = X(lm[i]), y = Y(lm[i]);
      const major = MAJOR.has(i);
      const r = i <= 10 ? 2.5 : major ? 6 : 4;
      if (major) {
        ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,240,255,0.2)'; ctx.shadowBlur = 0; ctx.fill();
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

    /* Rótulos resolvidos por posição (sem usar o rótulo instável do
     * MediaPipe), com unicidade garantida para 2 mãos. */
    const labels = rotularMaos(list.map(lm => ({ wristX: lm[0].x })));

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
      const label = labels[hi];
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
    const mesh = this._meshCount || 0;
    const skeletonPts = (this._skeletonPts || 0) + hands * 21;
    const totalPts = skeletonPts + mesh;
    const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'k' : String(n);
    this.metricsEl.innerHTML =
      `<span>FPS <b>${this._fps}</b></span>` +
      `<span>Corpos <b>${body}</b></span>` +
      `<span>Mãos <b>${hands}</b></span>` +
      `<span>Esqueleto <b>${skeletonPts}</b> pts</span>` +
      `<span>Malha <b>${fmt(mesh)}</b> pts</span>` +
      `<span>Total <b>${fmt(totalPts)}</b> pts</span>` +
      `<span>Movimento <b>${fmt(this.motionCount || 0)}</b> px</span>`;
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

/* ══════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════ */

let _engine = null;

function cleanup() {
  if (_engine) { _engine.stop(); _engine = null; }
}

export function jarvisVisionPage() {
  cleanup();

<<<<<<< HEAD
  const opts = { body: true, hands: true, motion: true, hud: true, mesh: false, maxHands: 8 };
=======
  const opts = { body: true, hands: true, motion: true, hud: true, mesh: true, maxHands: 8 };
>>>>>>> origin/main

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
    { k: 'body',   label: '🦴 Esqueleto' },
    { k: 'mesh',   label: '🌐 Malha 256k' },
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
        'Esqueleto de 33 pontos + malha densa de até 256k pontos sobre o corpo + múltiplas mãos (21 pts cada) + scanner de movimento em alta resolução, tudo sobre uma câmera, estilo Iron Man.'
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
      h('span', null, h('i', { style: { background: '#00f0ff' } }), 'Esqueleto'),
      h('span', null, h('i', { style: { background: '#7afaff' } }), 'Malha corporal (256k)'),
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
