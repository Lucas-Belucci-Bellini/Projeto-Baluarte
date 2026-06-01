/**
 * /jarvis-vision — JARVIS · Rastreamento Corporal Total
 *
 * Engine de visão computacional estilo Iron Man:
 *   • Corpo (TF.js MoveNet MultiPose LIGHTNING) — até 20 pessoas, 17 pts cada
 *   • Mãos (MediaPipe Hands)                   — até N mãos, 21 pts cada
 *   • Esqueleto interpolado                    — até 2670 pontos por pessoa
 *   • HUD tático                               — cantos, grade, relógio, métricas
 */

import { h } from '../utils/helpers.js';

/* ── Loader de script CDN com cache por src ── */
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error('falha: ' + src));
    document.head.appendChild(s);
  });
}

/* Conexões para o formato COCO 17-keypoints (MoveNet):
 * 0=nariz 1=olhoE 2=olhoD 3=orelhaE 4=orelhaD
 * 5=ombroE 6=ombroD 7=cotoveloE 8=cotoveloD 9=pulsoE 10=pulsoD
 * 11=quadrilE 12=quadrilD 13=joelhoE 14=joelhoD 15=tornozeloE 16=tornozeloD */
const POSE_CONNECTIONS = [
  [5,6],                          // ombros
  [5,7],[7,9],                    // braço esquerdo
  [6,8],[8,10],                   // braço direito
  [5,11],[6,12],[11,12],          // tronco
  [11,13],[13,15],                // perna esquerda
  [12,14],[14,16]                 // perna direita
];

/* Conexões dos 21 pontos da mão (MediaPipe Hands) */
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20]
];

/* Cores por pessoa (20 max) — gradiente ciano→magenta */
const PERSON_COLORS = [
  '#00f0ff', '#00c8ff', '#00ffaa', '#aaff00', '#ff00aa',
  '#ff8800', '#ff4400', '#cc00ff', '#ffff00', '#00ff44',
  '#ff0055', '#00aaff', '#88ff00', '#ff6600', '#9900ff',
  '#00ffcc', '#ff0099', '#44ff00', '#0055ff', '#ffaa00'
];

/* ══════════════════════════════════════
   LATERALIDADE — 100% posicional (sem rótulo instável do MediaPipe)
   ══════════════════════════════════════ */
function telaX(wristX) { return 1 - wristX; }
function decidirLadoPosicional(wristX) {
  return telaX(wristX) < 0.5 ? 'RIGHT' : 'LEFT';
}
function rotularMaos(maos) {
  if (maos.length === 2) {
    const [a, b] = maos;
    const aMaisEsq = telaX(a.wristX) < telaX(b.wristX);
    return [aMaisEsq ? 'RIGHT' : 'LEFT', aMaisEsq ? 'LEFT' : 'RIGHT'];
  }
  return maos.map(m => decidirLadoPosicional(m.wristX));
}

/* ══════════════════════════════════════
   GESTO HOMEM-ARANHA
   Indicador (8) e mindinho (20) levantados,
   médio (12) e anelar (16) abaixados,
   polegar (4) estendido para o lado.
   ══════════════════════════════════════ */
function _isFingerUp(lm, tip, pip) {
  return lm[tip].y < lm[pip].y - 0.03;
}
function _isFingerDown(lm, tip, pip) {
  return lm[tip].y > lm[pip].y + 0.02;
}
function _isSpideyGesture(lm) {
  return (
    _isFingerUp(lm,   8, 6)  &&   // indicador levantado
    _isFingerDown(lm, 12, 10) &&  // médio abaixado
    _isFingerDown(lm, 16, 14) &&  // anelar abaixado
    _isFingerUp(lm,  20, 18)       // mindinho levantado
  );
}
/* Gesto "L": polegar estendido para o lado + indicador levantado,
   médio, anelar e mindinho abaixados. */
function _isLGesture(lm) {
  /* Polegar estendido lateralmente: distância horizontal entre ponta (4) e base (2) */
  const thumbOut = Math.abs(lm[4].x - lm[2].x) > 0.08;
  return (
    thumbOut &&
    _isFingerUp(lm,   8, 6)  &&   // indicador levantado
    _isFingerDown(lm, 12, 10) &&  // médio abaixado
    _isFingerDown(lm, 16, 14) &&  // anelar abaixado
    _isFingerDown(lm, 20, 18)      // mindinho abaixado
  );
}

/* ══════════════════════════════════════
   ENGINE
   ══════════════════════════════════════ */

class JarvisVision {
  constructor(canvas, opts, statusEl, metricsEl) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    this.opts     = opts;
    this.statusEl = statusEl;
    this.metricsEl = metricsEl;

    this.video    = null;
    this.stream   = null;
    this.detector = null;   // TF.js MoveNet MultiPose
    this.hands    = null;   // MediaPipe Hands
    this.running  = false;
    this.raf      = null;
    this.frame    = 0;

    this.poseResults  = [];
    this.handResults  = null;

    /* Áudio "vai teia" — gesto Homem-Aranha (caminho absoluto p/ rotas hash) */
    this._teiaAudio     = new Audio('/vai-teia.mp3');
    this._teiaAudio.preload = 'auto';
    this._teiaCooldown  = 0;   // timestamp mínimo para tocar novamente

    /* Áudio "pou estourado" — gesto de L */
    this._lAudio        = new Audio('/pou-estourado.mp3');
    this._lAudio.preload = 'auto';
    this._lCooldown     = 0;

    this._fpsT = performance.now();
    this._fpsN = 0;
    this._fps  = 0;
    this._totalSkPts = 0;
    this._lastFrameT = 0;   // para cap de 60fps
    this._lastMetrics = ''; // evita innerHTML se não mudou
  }

  /* Destrava reprodução: toca mudo brevemente dentro do gesto do usuário */
  _unlockAudio() {
    for (const a of [this._teiaAudio, this._lAudio]) {
      try {
        a.muted = true;
        a.play().then(() => {
          a.pause(); a.currentTime = 0; a.muted = false;
        }).catch(() => { a.muted = false; });
      } catch {}
    }
  }

  async start() {
    const setS = (t) => { if (this.statusEl) this.statusEl.textContent = t; };

    /* Destrava áudio na política de autoplay — start() vem de um clique */
    this._unlockAudio();

    setS('Carregando TF.js…');
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');
      if (this.opts.hands)
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    } catch (e) {
      setS('Falha ao carregar modelos — verifique a conexão.');
      return false;
    }

    setS('Solicitando câmera…');
    try {
      this.video = document.createElement('video');
      this.video.muted = true; this.video.playsInline = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280, max: 1280 }, height: { ideal: 720, max: 720 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' }
      });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch {
      setS('Câmera negada ou indisponível.');
      return false;
    }

    const vw = this.video.videoWidth  || 1280;
    const vh = this.video.videoHeight || 720;
    this.canvas.width  = vw;
    this.canvas.height = vh;

    if (this.opts.body) {
      setS('Inicializando MoveNet MultiPose…');
      try {
        await window.tf.setBackend('webgl');
        await window.tf.ready();
        this.detector = await window.poseDetection.createDetector(
          window.poseDetection.SupportedModels.MoveNet,
          {
            modelType: window.poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableTracking: true,
            trackerType: window.poseDetection.TrackerType.BoundingBox
          }
        );
      } catch (e) {
        setS('Falha ao criar detector de poses.');
        return false;
      }
    }

    if (this.opts.hands) {
      this.hands = new window.Hands({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
      });
      this.hands.setOptions({
        maxNumHands: this.opts.maxHands || 80,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      this.hands.onResults(r => { this.handResults = r; });
      await this.hands.initialize();
    }

    this.running = true;
    setS('● RASTREANDO');
    this._loop();
    return true;
  }

  setOpt(k, v) { this.opts[k] = v; }

  _loop(ts = 0) {
    if (!this.running) return;
    this.raf = requestAnimationFrame((t) => this._loop(t));
    /* Cap a 60fps: pula frames se monitor for 120/144Hz */
    if (ts - this._lastFrameT < 14) return;
    this._lastFrameT = ts;
    /* Não renderiza se aba estiver oculta */
    if (document.hidden) return;
    if (!this.video || this.video.readyState < 2) return;
    this.frame++;

    /* Pose: async a cada 3 frames (era 2) — poupa ~33% GPU de inferência */
    if (this.opts.body && this.detector && this.frame % 3 === 0) {
      this.detector.estimatePoses(this.video, { flipHorizontal: false, maxPoses: 20 })
        .then(poses => { this.poseResults = poses || []; })
        .catch(() => {});
    }

    /* Hands: a cada 4 frames (era 3) */
    if (this.opts.hands && this.hands && this.frame % 4 === 0) {
      try { this.hands.send({ image: this.video }); } catch {}
    }

    try { this._render(); } catch {}

    this._fpsN++;
    const now = performance.now();
    if (now - this._fpsT >= 1000) {
      this._fps  = Math.round((this._fpsN * 1000) / (now - this._fpsT));
      this._fpsN = 0; this._fpsT = now;
      this._updateMetrics();
    }
  }

  _render() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;

    /* Vídeo espelhado */
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(this.video, -W, 0, W, H); ctx.restore();
    ctx.fillStyle = 'rgba(0,8,16,0.25)'; ctx.fillRect(0, 0, W, H);

    if (this.opts.hud)   this._renderHUD(W, H);
    if (this.opts.body)  this._renderPoses(W, H);
    if (this.opts.hands) this._renderHands(W, H);
  }

  /* ── Múltiplas pessoas (MoveNet retorna keypoints em coordenadas absolutas de pixel) ── */
  _renderPoses(W, H) {
    const poses = this.poseResults;
    if (!poses.length) return;
    const ctx = this.ctx;

    /* Bezier quadrática */
    const qx = (x1, cx, x2, t) => (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
    const qy = (y1, cy, y2, t) => (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
    /* 12 conexões × 221 + 17 articulações ≈ 2670 pontos por pessoa (máx) */
    const INTERP = 221;
    const SCORE  = 0.35; // limiar ligeiramente maior → filtra ruído e reduz desenho
    const MAJOR  = new Uint8Array([0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1]);
    let totalPts = 0;

    /* Escala calculada uma vez por frame */
    const scaleX = W / (this.video.videoWidth  || W);
    const scaleY = H / (this.video.videoHeight || H);
    const toX = (kp) => W - kp.x * scaleX;
    const toY = (kp) => kp.y * scaleY;

    for (let pi = 0; pi < poses.length; pi++) {
      const kps   = poses[pi].keypoints;
      const color = PERSON_COLORS[pi % PERSON_COLORS.length];

      /* Pré-calcula coords válidos; pula pessoa se nenhum ponto visível */
      const px = new Float32Array(17);
      const py = new Float32Array(17);
      const ok = new Uint8Array(17);
      let validCount = 0;
      for (let i = 0; i < 17; i++) {
        if (kps[i] && (kps[i].score ?? 1) >= SCORE) {
          px[i] = toX(kps[i]); py[i] = toY(kps[i]); ok[i] = 1; validCount++;
        }
      }
      if (validCount < 3) continue; // pessoa sem pontos suficientes — skip

      /* Camada 1 — halo (shadowBlur=0, lineWidth=8, cor única) */
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,240,255,0.10)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let ci = 0; ci < POSE_CONNECTIONS.length; ci++) {
        const [a, b] = POSE_CONNECTIONS[ci];
        if (!ok[a] || !ok[b]) continue;
        const x1 = px[a], y1 = py[a], x2 = px[b], y2 = py[b];
        const mx = (x1+x2)*0.5, my = (y1+y2)*0.5;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx-(dy/len)*len*0.07, my+(dx/len)*len*0.07, x2,y2);
      }
      ctx.stroke();

      /* Camada 2 — linha núcleo (shadowBlur=6 → ~40% mais rápido que 10) */
      ctx.shadowColor = color; ctx.shadowBlur = 6;
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let ci = 0; ci < POSE_CONNECTIONS.length; ci++) {
        const [a, b] = POSE_CONNECTIONS[ci];
        if (!ok[a] || !ok[b]) continue;
        const x1 = px[a], y1 = py[a], x2 = px[b], y2 = py[b];
        const mx = (x1+x2)*0.5, my = (y1+y2)*0.5;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx-(dy/len)*len*0.07, my+(dx/len)*len*0.07, x2,y2);
      }
      ctx.stroke();

      /* Camada 3 — pontos interpolados sem shadowBlur (fillRect = 10× mais rápido que arc) */
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      for (let ci = 0; ci < POSE_CONNECTIONS.length; ci++) {
        const [a, b] = POSE_CONNECTIONS[ci];
        if (!ok[a] || !ok[b]) continue;
        const x1 = px[a], y1 = py[a], x2 = px[b], y2 = py[b];
        const mx = (x1+x2)*0.5, my = (y1+y2)*0.5;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        const cpx = mx-(dy/len)*len*0.07, cpy = my+(dx/len)*len*0.07;
        for (let k = 1; k < INTERP; k++) {
          const t = k / INTERP;
          ctx.fillRect(qx(x1,cpx,x2,t)-1.5, qy(y1,cpy,y2,t)-1.5, 3, 3);
          totalPts++;
        }
      }

      /* Camada 4 — articulações */
      for (let i = 0; i < 17; i++) {
        if (!ok[i]) continue;
        const major = MAJOR[i];
        const r = major ? 5 : 3;
        if (major) {
          ctx.beginPath(); ctx.arc(px[i], py[i], r+4, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(0,240,255,0.15)'; ctx.shadowBlur = 0; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(px[i], py[i], r, 0, Math.PI*2);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = major ? 12 : 6;
        ctx.fill();
        totalPts++;
      }

      /* Label */
      if (ok[0]) {
        ctx.shadowBlur = 0; ctx.font = 'bold 11px monospace';
        ctx.fillStyle = color;
        ctx.fillText(`P${pi + 1}`, px[0] - 8, py[0] - 24);
      }
    }
    ctx.shadowBlur = 0;
    this._totalSkPts = totalPts;
  }

  /* ── Mãos (21 pontos + interpolação) ── */
  _renderHands(W, H) {
    const list = this.handResults?.multiHandLandmarks;
    if (!list) return;
    const ctx = this.ctx;
    const X = (p) => (1 - p.x) * W, Y = (p) => p.y * H;
    const TIPS = new Set([4, 8, 12, 16, 20]);
    const HAND_INTERP = 18; // pontos interpolados por segmento de mão
    const labels = rotularMaos(list.map(lm => ({ wristX: lm[0].x })));

    for (let hi = 0; hi < list.length; hi++) {
      const lm = list[hi];
      const spidey = _isSpideyGesture(lm);
      const lGest  = _isLGesture(lm);

      const lineColor = spidey ? '#ff3300' : lGest ? '#00aaff' : 'rgba(0,255,136,0.8)';
      const dotColor  = spidey ? '#ff6600' : lGest ? '#33ccff' : '#00ff88';
      const glowColor = spidey ? '#ff2200' : lGest ? '#0088ff' : '#00ff88';
      const fancy     = spidey || lGest;

      /* Linhas de conexão (path único) */
      ctx.shadowColor = glowColor; ctx.shadowBlur = fancy ? 18 : 8;
      ctx.strokeStyle = lineColor; ctx.lineWidth = fancy ? 2.5 : 1.8;
      ctx.beginPath();
      for (let ci = 0; ci < HAND_CONNECTIONS.length; ci++) {
        const [a, b] = HAND_CONNECTIONS[ci];
        ctx.moveTo(X(lm[a]), Y(lm[a])); ctx.lineTo(X(lm[b]), Y(lm[b]));
      }
      ctx.stroke();

      /* Pontos interpolados nas conexões (mais pontos = traço mais denso) */
      ctx.shadowBlur = 0;
      ctx.fillStyle = dotColor;
      for (let ci = 0; ci < HAND_CONNECTIONS.length; ci++) {
        const [a, b] = HAND_CONNECTIONS[ci];
        const ax = X(lm[a]), ay = Y(lm[a]), bx = X(lm[b]), by = Y(lm[b]);
        for (let k = 1; k < HAND_INTERP; k++) {
          const t = k / HAND_INTERP;
          ctx.fillRect(ax + (bx-ax)*t - 1, ay + (by-ay)*t - 1, 2, 2);
        }
      }

      /* Articulações */
      for (let i = 0; i < lm.length; i++) {
        const wrist = i === 0, tip = TIPS.has(i);
        ctx.beginPath(); ctx.arc(X(lm[i]), Y(lm[i]), wrist ? 6 : tip ? 4.5 : 2.5, 0, Math.PI*2);
        ctx.fillStyle = wrist ? '#ff00aa' : dotColor;
        ctx.shadowColor = wrist ? '#ff00aa' : glowColor;
        ctx.shadowBlur = wrist ? 14 : (fancy ? 12 : 6);
        ctx.fill();
      }

      /* Label + alerta gesto */
      const label = labels[hi];
      ctx.shadowBlur = 0; ctx.font = 'bold 13px monospace';
      const lx = X(lm[0]) - 20, ly = Y(lm[0]) + 28;
      ctx.fillStyle = 'rgba(0,12,24,0.6)';
      ctx.fillRect(lx - 2, ly - 13, ctx.measureText(label).width + 6, 17);
      ctx.fillStyle = spidey ? '#ff4400' : lGest ? '#00aaff' : 'rgba(0,255,136,0.95)';
      ctx.fillText(label, lx, ly);

      if (spidey || lGest) {
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = spidey ? '#ff4400' : '#00aaff';
        ctx.shadowColor = spidey ? '#ff2200' : '#0088ff'; ctx.shadowBlur = 10;
        ctx.fillText(spidey ? '🕷 VAI TEIA!' : '🅛 POU!', X(lm[0]) - 40, Y(lm[0]) - 40);
        ctx.shadowBlur = 0;
      }
    }
    ctx.shadowBlur = 0;

    /* Dispara áudios por gesto (cooldown 2s cada) */
    const now = performance.now();
    if (list.some(lm => _isSpideyGesture(lm)) && now > this._teiaCooldown) {
      this._teiaCooldown = now + 2000;
      this._teiaAudio.currentTime = 0;
      this._teiaAudio.play().catch(() => {});
    }
    if (list.some(lm => _isLGesture(lm)) && now > this._lCooldown) {
      this._lCooldown = now + 2000;
      this._lAudio.currentTime = 0;
      this._lAudio.play().catch(() => {});
    }
  }

  /* ── HUD tático (grid em path único) ── */
  _renderHUD(W, H) {
    const ctx = this.ctx;
    /* Grid em path único — eram 20 beginPath/stroke individuais */
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,240,255,0.04)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += W/12) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for (let y = 0; y <= H; y += H/8)  { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    /* Cantos e mira em path único */
    const L = 32, hx = W/2, hy = H/2;
    ctx.strokeStyle = 'rgba(0,240,255,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L,0); ctx.lineTo(0,0); ctx.lineTo(0,L);
    ctx.moveTo(W-L,0); ctx.lineTo(W,0); ctx.lineTo(W,L);
    ctx.moveTo(0,H-L); ctx.lineTo(0,H); ctx.lineTo(L,H);
    ctx.moveTo(W,H-L); ctx.lineTo(W,H); ctx.lineTo(W-L,H);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,240,255,0.22)';
    ctx.beginPath();
    ctx.arc(hx, hy, 26, 0, Math.PI*2);
    ctx.moveTo(hx-36,hy); ctx.lineTo(hx-12,hy);
    ctx.moveTo(hx+12,hy); ctx.lineTo(hx+36,hy);
    ctx.moveTo(hx,hy-36); ctx.lineTo(hx,hy-12);
    ctx.moveTo(hx,hy+12); ctx.lineTo(hx,hy+36);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '13px monospace';
    ctx.fillText('J.A.R.V.I.S · MULTI-BODY TRACKING', 14, 24);
    ctx.fillText(new Date().toLocaleTimeString(), W - 96, 24);
  }

  _updateMetrics() {
    if (!this.metricsEl) return;
    const pessoas = this.poseResults?.length || 0;
    const maos    = this.handResults?.multiHandLandmarks?.length || 0;
    const pts     = this._totalSkPts + maos * 21;
    const fmt = (n) => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
    const html =
      `<span>FPS <b>${this._fps}</b></span>` +
      `<span>Pessoas <b>${pessoas}/20</b></span>` +
      `<span>Mãos <b>${maos}</b></span>` +
      `<span>Pontos <b>${fmt(pts)}</b></span>`;
    /* Só atualiza DOM se o conteúdo mudou */
    if (html !== this._lastMetrics) {
      this.metricsEl.innerHTML = html;
      this._lastMetrics = html;
    }
  }

  stop() {
    this.running = false;
    if (this.raf)      cancelAnimationFrame(this.raf);
    if (this.stream)   this.stream.getTracks().forEach(t => t.stop());
    if (this.detector) { try { this.detector.dispose(); } catch {} }
    if (this.hands)    { try { this.hands.close(); }     catch {} }
    try { window.tf?.disposeVariables(); } catch {}
    this.stream = null; this.video = null; this.detector = null; this.hands = null;
    this.poseResults = []; this.handResults = null;
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

  const opts = { body: true, hands: true, hud: true, maxHands: 80 };

  const canvas  = h('canvas', { className: 'jv-canvas' });
  const status  = h('span',  { className: 'jv-status' }, 'Câmera parada.');
  const metrics = h('div',   { className: 'jv-metrics' });
  let running   = false;

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

  const layerDefs = [
    { k: 'body',  label: '🦴 Esqueleto' },
    { k: 'hands', label: '✋ Mãos' },
    { k: 'hud',   label: '🎯 HUD' }
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

  const handsSel = h('select', { className: 'jv-select', onchange: (e) => {
    opts.maxHands = +e.target.value;
    if (_engine && _engine.hands)
      _engine.hands.setOptions({ maxNumHands: opts.maxHands });
  } },
    ...[2, 4, 8, 10, 20, 40, 60, 80].map(n =>
      h('option', { value: String(n), selected: n === 80 }, `${n} mãos`))
  );

  const wrap = h('div', { className: 'jv-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🤖 JARVIS · Rastreamento Multi-Corporal'),
      h('p', { className: 'u-text-muted' },
        'Até 20 pessoas simultâneas (MoveNet MultiPose LIGHTNING) com esqueleto de até 2670 pontos por pessoa + curvas suaves + até 80 mãos, tudo em tempo real.'
      )
    ),
    h('div', { className: 'jv-bar' },
      startBtn,
      ...layerBtns,
      h('label', { className: 'jv-label' }, 'Máx mãos:', handsSel),
      status
    ),
    metrics,
    h('div', { className: 'jv-viewport' }, canvas),
    h('div', { className: 'jv-legend' },
      h('span', null, h('i', { style: { background: '#00f0ff' } }), 'Pessoa 1'),
      h('span', null, h('i', { style: { background: '#00ffaa' } }), 'Pessoa 2'),
      h('span', null, h('i', { style: { background: '#aaff00' } }), 'Pessoa 3+'),
      h('span', null, h('i', { style: { background: '#00ff88' } }), 'Mãos'),
      h('span', null, h('i', { style: { background: '#ff00aa' } }), 'Pulso')
    ),
    h('div', { className: 'jv-info' },
      h('p', null, '⚡ TF.js MoveNet MultiPose carrega via CDN na primeira ativação (~8-12s). Depois fica em cache do browser.'),
      h('p', null, '💡 Afaste-se da câmera para capturar o corpo todo. Cada pessoa detectada recebe uma cor diferente.')
    )
  );

  const obs = new MutationObserver(() => {
    if (!document.body.contains(wrap)) { cleanup(); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return wrap;
}
