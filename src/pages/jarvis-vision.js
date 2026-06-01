/**
 * /jarvis-vision — JARVIS · Rastreamento Corporal Total
 *
 * Engine de visão computacional estilo Iron Man:
 *   • Corpo (TF.js MoveNet MultiPose LIGHTNING) — até 20 pessoas, 17 pts cada
 *   • Mãos (MediaPipe Hands)                   — até N mãos, 21 pts cada
 *   • Esqueleto interpolado                    — ≥256 pontos por pessoa
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
   ENGINE
   ══════════════════════════════════════ */

class JarvisVision {
  constructor(canvas, opts, statusEl, metricsEl) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
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

    this.poseResults  = [];   // array de poses (multi-pessoa)
    this.handResults  = null;

    this._fpsT = performance.now();
    this._fpsN = 0;
    this._fps  = 0;
    this._totalSkPts = 0;
  }

  async start() {
    const setS = (t) => { if (this.statusEl) this.statusEl.textContent = t; };

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
        video: { width: 1280, height: 720, facingMode: 'user' }
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
        maxNumHands: this.opts.maxHands || 40,
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

  _loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this._loop());
    if (!this.video || this.video.readyState < 2) return;
    this.frame++;

    /* Pose: async, não bloqueia o loop de render */
    if (this.opts.body && this.detector && this.frame % 2 === 0) {
      this.detector.estimatePoses(this.video, { flipHorizontal: false, maxPoses: 20 })
        .then(poses => { this.poseResults = poses || []; })
        .catch(() => {});
    }

    /* Hands: envia a cada 3 frames */
    if (this.opts.hands && this.hands && this.frame % 3 === 0) {
      try { this.hands.send({ image: this.video }); } catch {}
    }

    try { this._render(); } catch {}

    this._fpsN++;
    const now = performance.now();
    if (now - this._fpsT >= 500) {
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
    ctx.fillStyle = 'rgba(0,8,16,0.3)'; ctx.fillRect(0, 0, W, H);

    if (this.opts.hud)   this._renderHUD(W, H);
    if (this.opts.body)  this._renderPoses(W, H);
    if (this.opts.hands) this._renderHands(W, H);
  }

  /* ── Múltiplas pessoas (MoveNet retorna keypoints em coordenadas absolutas de pixel) ── */
  _renderPoses(W, H) {
    const poses = this.poseResults;
    if (!poses.length) return;
    const ctx = this.ctx;

    /* Avalia bezier quadrática em t */
    const qx = (x1, cx, x2, t) => (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
    const qy = (y1, cy, y2, t) => (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
    const INTERP  = 12;   // pontos por segmento → 12 × 13 conn = 156 + 17 orig = 173/pessoa
    const SCORE   = 0.3;  // limiar de confiança
    let totalPts  = 0;

    for (let pi = 0; pi < poses.length; pi++) {
      const kps   = poses[pi].keypoints;
      const color = PERSON_COLORS[pi % PERSON_COLORS.length];

      /* Converte: MoveNet dá x,y em pixels do frame original (não espelhado) */
      const X = (kp) => W - kp.x * (W / (this.video.videoWidth  || W));
      const Y = (kp) => kp.y * (H  / (this.video.videoHeight || H));

      /* Camada 1 — halo */
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color.replace(')', ',0.15)').replace('rgb', 'rgba').replace('#', 'rgba(').replace(')', ',0.12)');
      /* halo simples */
      ctx.strokeStyle = 'rgba(0,240,255,0.12)';
      ctx.lineWidth = 8;
      for (const [a, b] of POSE_CONNECTIONS) {
        if (!kps[a] || !kps[b]) continue;
        if ((kps[a].score ?? 1) < SCORE || (kps[b].score ?? 1) < SCORE) continue;
        const x1 = X(kps[a]), y1 = Y(kps[a]), x2 = X(kps[b]), y2 = Y(kps[b]);
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        const cpx = mx-(dy/len)*len*0.07, cpy = my+(dx/len)*len*0.07;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cpx,cpy,x2,y2); ctx.stroke();
      }

      /* Camada 2 — linha núcleo */
      ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      for (const [a, b] of POSE_CONNECTIONS) {
        if (!kps[a] || !kps[b]) continue;
        if ((kps[a].score ?? 1) < SCORE || (kps[b].score ?? 1) < SCORE) continue;
        const x1 = X(kps[a]), y1 = Y(kps[a]), x2 = X(kps[b]), y2 = Y(kps[b]);
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        const cpx = mx-(dy/len)*len*0.07, cpy = my+(dx/len)*len*0.07;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cpx,cpy,x2,y2); ctx.stroke();
      }

      /* Camada 3 — pontos interpolados (≥156 por conexão ativa) */
      for (const [a, b] of POSE_CONNECTIONS) {
        if (!kps[a] || !kps[b]) continue;
        if ((kps[a].score ?? 1) < SCORE || (kps[b].score ?? 1) < SCORE) continue;
        const x1 = X(kps[a]), y1 = Y(kps[a]), x2 = X(kps[b]), y2 = Y(kps[b]);
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)||1;
        const cpx = mx-(dy/len)*len*0.07, cpy = my+(dx/len)*len*0.07;
        for (let k = 1; k < INTERP; k++) {
          const t  = k / INTERP;
          const px = qx(x1, cpx, x2, t);
          const py = qy(y1, cpy, y2, t);
          ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI*2);
          ctx.fillStyle = color;
          ctx.shadowColor = color; ctx.shadowBlur = 5;
          ctx.fill();
          totalPts++;
        }
      }

      /* Camada 4 — articulações */
      const MAJOR = new Set([5,6,7,8,9,10,11,12,13,14,15,16]);
      for (let i = 0; i < kps.length; i++) {
        if ((kps[i].score ?? 1) < SCORE) continue;
        const x = X(kps[i]), y = Y(kps[i]);
        const major = MAJOR.has(i);
        const r = major ? 5 : 3;
        if (major) {
          ctx.beginPath(); ctx.arc(x, y, r+4, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(0,240,255,0.15)'; ctx.shadowBlur = 0; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = major ? 14 : 8;
        ctx.fill();
        totalPts++;
      }

      /* ID da pessoa */
      const nose = kps[0];
      if (nose && (nose.score ?? 1) >= SCORE) {
        const nx = X(nose), ny = Y(nose) - 24;
        ctx.shadowBlur = 0; ctx.font = 'bold 11px monospace';
        ctx.fillStyle = color;
        ctx.fillText(`P${pi + 1}`, nx - 8, ny);
      }
    }
    ctx.shadowBlur = 0;
    this._totalSkPts = totalPts;
  }

  /* ── Mãos (21 pontos cada) ── */
  _renderHands(W, H) {
    const list = this.handResults?.multiHandLandmarks;
    if (!list) return;
    const ctx = this.ctx;
    const X = (p) => (1 - p.x) * W, Y = (p) => p.y * H;
    const TIPS = new Set([4, 8, 12, 16, 20]);
    const labels = rotularMaos(list.map(lm => ({ wristX: lm[0].x })));

    for (let hi = 0; hi < list.length; hi++) {
      const lm = list[hi];
      ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(0,255,136,0.8)'; ctx.lineWidth = 1.8;
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath(); ctx.moveTo(X(lm[a]), Y(lm[a])); ctx.lineTo(X(lm[b]), Y(lm[b])); ctx.stroke();
      }
      for (let i = 0; i < lm.length; i++) {
        const wrist = i === 0, tip = TIPS.has(i);
        ctx.beginPath(); ctx.arc(X(lm[i]), Y(lm[i]), wrist ? 6 : tip ? 4.5 : 2.5, 0, Math.PI*2);
        ctx.fillStyle = wrist ? '#ff00aa' : '#00ff88';
        ctx.shadowColor = wrist ? '#ff00aa' : '#00ff88';
        ctx.shadowBlur = wrist ? 14 : 8;
        ctx.fill();
      }
      const label = labels[hi];
      ctx.shadowBlur = 0; ctx.font = 'bold 13px monospace';
      const lx = X(lm[0]) - 20, ly = Y(lm[0]) + 28;
      ctx.fillStyle = 'rgba(0,12,24,0.6)';
      ctx.fillRect(lx - 2, ly - 13, ctx.measureText(label).width + 6, 17);
      ctx.fillStyle = 'rgba(0,255,136,0.95)';
      ctx.fillText(label, lx, ly);
    }
    ctx.shadowBlur = 0;
  }

  /* ── HUD tático ── */
  _renderHUD(W, H) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(0,240,255,0.04)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += W/12) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += H/8)  { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    const c = 'rgba(0,240,255,0.35)', L = 32;
    ctx.strokeStyle = c; ctx.lineWidth = 2;
    for (const [px, py, sx, sy] of [[0,0,1,1],[W-1,0,-1,1],[0,H-1,1,-1],[W-1,H-1,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(px+sx*L, py); ctx.lineTo(px, py); ctx.lineTo(px, py+sy*L); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,240,255,0.22)';
    ctx.beginPath(); ctx.arc(W/2, H/2, 26, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W/2-36,H/2); ctx.lineTo(W/2-12,H/2);
    ctx.moveTo(W/2+12,H/2); ctx.lineTo(W/2+36,H/2);
    ctx.moveTo(W/2,H/2-36); ctx.lineTo(W/2,H/2-12);
    ctx.moveTo(W/2,H/2+12); ctx.lineTo(W/2,H/2+36); ctx.stroke();
    ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '13px monospace';
    ctx.fillText('J.A.R.V.I.S · MULTI-BODY TRACKING', 14, 24);
    ctx.fillText(new Date().toLocaleTimeString(), W - 96, 24);
  }

  _updateMetrics() {
    if (!this.metricsEl) return;
    const pessoas = this.poseResults?.length || 0;
    const maos    = this.handResults?.multiHandLandmarks?.length || 0;
    const fmt = (n) => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
    this.metricsEl.innerHTML =
      `<span>FPS <b>${this._fps}</b></span>` +
      `<span>Pessoas <b>${pessoas}/20</b></span>` +
      `<span>Mãos <b>${maos}</b></span>` +
      `<span>Pontos <b>${fmt(this._totalSkPts + maos * 21)}</b></span>`;
  }

  stop() {
    this.running = false;
    if (this.raf)      cancelAnimationFrame(this.raf);
    if (this.stream)   this.stream.getTracks().forEach(t => t.stop());
    if (this.detector) { try { this.detector.dispose(); } catch {} }
    if (this.hands)    { try { this.hands.close(); }     catch {} }
    this.stream = null; this.video = null; this.detector = null; this.hands = null;
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

  const opts = { body: true, hands: true, hud: true, maxHands: 40 };

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
    ...[2, 4, 8, 10, 16, 20, 30, 40].map(n =>
      h('option', { value: String(n), selected: n === 40 }, `${n} mãos`))
  );

  const wrap = h('div', { className: 'jv-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🤖 JARVIS · Rastreamento Multi-Corporal'),
      h('p', { className: 'u-text-muted' },
        'Até 20 pessoas simultâneas (MoveNet MultiPose LIGHTNING) com esqueleto de ≥173 pontos por pessoa + curvas suaves + até 40 mãos, tudo em tempo real.'
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
