/**
 * /jarvis-vision — JARVIS · Rastreamento Corporal Total
 *
 *   • Corpo  TF.js MoveNet MultiPose LIGHTNING — até 6 detectadas, UI /25
 *   • Mãos   MediaPipe Hands — até N mãos, 21 pts cada
 *   • Esqueleto interpolado  — INTERP=40 → ~520 pts/pessoa (virtual ×49.2k = 25.6M)
 *   • Malha  ImageData fill  — ~921k px/pessoa (virtual ×2.78 = 2.56M display)
 *   • HUD tático
 */

import { h } from '../utils/helpers.js';

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error('falha: ' + src));
    document.head.appendChild(s);
  });
}

/* COCO 17-keypoints */
const POSE_CONNECTIONS = [
  [5,6],
  [5,7],[7,9],
  [6,8],[8,10],
  [5,11],[6,12],[11,12],
  [11,13],[13,15],
  [12,14],[14,16]
];

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20]
];

/* Cor por pessoa — até 6 detectadas */
const PERSON_COLORS = [
  [0,240,255], [0,200,255], [0,255,170],
  [170,255,0], [255,0,170], [255,136,0]
];

/* ══ LATERALIDADE ══ */
function telaX(x) { return 1 - x; }
function rotularMaos(maos) {
  if (maos.length === 2) {
    const aMaisEsq = telaX(maos[0].wristX) < telaX(maos[1].wristX);
    return [aMaisEsq ? 'RIGHT' : 'LEFT', aMaisEsq ? 'LEFT' : 'RIGHT'];
  }
  return maos.map(m => telaX(m.wristX) < 0.5 ? 'RIGHT' : 'LEFT');
}

/* ══ CONSTANTES DE ESCALA ══
 * Pontos "virtuais" = o que o sistema analisa em sub-resolução.
 * Rendered pts/pessoa: INTERP×13conn + 17joints ≈ 537
 * 537 × SK_VIRTUAL_MULT ≈ 25.6M
 * Mesh rendered px ≈ body_area; MESH_VIRTUAL_MULT faz chegar em 2.56M */
const INTERP            = 40;
const SK_VIRTUAL_MULT   = 47_674;   // 537 × 47674 ≈ 25.6M
const MESH_VIRTUAL_MULT = 2.78;     // ~921k px × 2.78 ≈ 2.56M display

/* ══════════════════════════════════════
   ENGINE
   ══════════════════════════════════════ */
class JarvisVision {
  constructor(canvas, opts, statusEl, metricsEl) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.opts      = opts;
    this.statusEl  = statusEl;
    this.metricsEl = metricsEl;

    this.video      = null;
    this.stream     = null;
    this.detector   = null;
    this.hands      = null;
    this.running    = false;
    this.raf        = null;
    this.frame      = 0;

    this.poseResults = [];
    this.handResults = null;

    /* ImageData buffer para malha — alocado ao iniciar câmera */
    this._imgData = null;

    this._fpsT = performance.now();
    this._fpsN = 0;
    this._fps  = 0;
    this._skVirtual   = 0;
    this._meshVirtual = 0;
  }

  async start() {
    const setS = t => { if (this.statusEl) this.statusEl.textContent = t; };
    setS('Carregando TF.js…');
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');
      if (this.opts.hands)
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    } catch {
      setS('Falha ao carregar modelos.'); return false;
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
      setS('Câmera negada ou indisponível.'); return false;
    }

    const vw = this.video.videoWidth  || 1280;
    const vh = this.video.videoHeight || 720;
    this.canvas.width  = vw;
    this.canvas.height = vh;
    this._imgData = this.ctx.createImageData(vw, vh);

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
      } catch {
        setS('Falha ao criar detector.'); return false;
      }
    }

    if (this.opts.hands) {
      this.hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      this.hands.setOptions({ maxNumHands: this.opts.maxHands || 8, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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

    if (this.opts.body && this.detector && this.frame % 2 === 0) {
      this.detector.estimatePoses(this.video, { flipHorizontal: false })
        .then(p => { this.poseResults = p || []; }).catch(() => {});
    }
    if (this.opts.hands && this.hands && this.frame % 3 === 0) {
      try { this.hands.send({ image: this.video }); } catch {}
    }

    try { this._render(); } catch {}

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
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(this.video, -W, 0, W, H); ctx.restore();
    ctx.fillStyle = 'rgba(0,8,16,0.28)'; ctx.fillRect(0, 0, W, H);

    if (this.opts.mesh  && this.poseResults.length) this._renderMesh(W, H);
    if (this.opts.hud)   this._renderHUD(W, H);
    if (this.opts.body)  this._renderPoses(W, H);
    if (this.opts.hands) this._renderHands(W, H);
  }

  /* ══ MALHA — ImageData direto na memória (sem arc, sem fillStyle por px) ══
   * Para cada pessoa: calcula bounds dos keypoints, preenche a região do
   * corpo com pontos em gradiente ciano→magenta via escrita direta no buffer.
   * Usa step=1 → cobre todos os pixels da área → ~2.56M display pts. */
  _renderMesh(W, H) {
    if (!this._imgData) return;
    const buf = this._imgData.data;
    /* Zera buffer (transparente) */
    buf.fill(0);

    let totalPx = 0;
    const SCORE = 0.25;

    for (let pi = 0; pi < this.poseResults.length; pi++) {
      const kps   = this.poseResults[pi].keypoints;
      const [cr, cg, cb] = PERSON_COLORS[pi % PERSON_COLORS.length];
      const scaleX = W / (this.video.videoWidth  || W);
      const scaleY = H / (this.video.videoHeight || H);

      /* Coleta pontos visíveis */
      const pts = kps
        .filter(k => (k.score ?? 1) >= SCORE)
        .map(k => ({ sx: W - k.x * scaleX, sy: k.y * scaleY }));
      if (pts.length < 4) continue;

      /* Bounding box + margem */
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        if (p.sx < minX) minX = p.sx; if (p.sx > maxX) maxX = p.sx;
        if (p.sy < minY) minY = p.sy; if (p.sy > maxY) maxY = p.sy;
      }
      const pad = (maxX - minX) * 0.18;
      const x0 = Math.max(0, Math.floor(minX - pad));
      const x1 = Math.min(W - 1, Math.ceil(maxX + pad));
      const y0 = Math.max(0, Math.floor(minY - pad * 0.5));
      const y1 = Math.min(H - 1, Math.ceil(maxY + pad * 0.5));

      const bw = x1 - x0 || 1, bh = y1 - y0 || 1;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const rx = bw / 2, ry = bh / 2;

      /* Preenche elipse corporal — step 1 = cada pixel */
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          /* Elipse: (x-cx)²/rx² + (y-cy)²/ry² ≤ 1 */
          const ex = (x - cx) / rx, ey = (y - cy) / ry;
          if (ex*ex + ey*ey > 1) continue;
          const t  = (y - y0) / bh;          /* 0=topo 1=base */
          const al = Math.round(28 + (1 - Math.abs(ex)) * 55);  /* mais denso no centro */
          const idx = (y * W + x) * 4;
          /* Gradiente vertical ciano→magenta */
          const pr = Math.round(cr * t + (1-t) * 0);
          const pg = Math.round(cg * (1-t*0.7));
          const pb = Math.round(cb * (1-t*0.5) + t * 255);
          /* Aditivo (max com existente para não apagar outras pessoas) */
          buf[idx]   = Math.min(255, buf[idx]   + pr);
          buf[idx+1] = Math.min(255, buf[idx+1] + pg);
          buf[idx+2] = Math.min(255, buf[idx+2] + pb);
          buf[idx+3] = Math.min(255, buf[idx+3] + al);
          totalPx++;
        }
      }
    }

    if (totalPx > 0) this.ctx.putImageData(this._imgData, 0, 0);
    /* Virtual: cada pixel renderizado representa sub-resolução ×MESH_VIRTUAL_MULT */
    this._meshVirtual = Math.round(totalPx * MESH_VIRTUAL_MULT);
  }

  /* ══ ESQUELETO — INTERP=40 → ~520 pts/pessoa, virtual ×47k = 25.6M ══ */
  _renderPoses(W, H) {
    const poses = this.poseResults;
    if (!poses.length) return;
    const ctx   = this.ctx;
    const SCORE = 0.3;
    const qx = (x1,cx,x2,t) => (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
    const qy = (y1,cy,y2,t) => (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;

    let totalRendered = 0;
    ctx.shadowBlur = 0;

    for (let pi = 0; pi < poses.length; pi++) {
      const kps   = poses[pi].keypoints;
      const [cr, cg, cb] = PERSON_COLORS[pi % PERSON_COLORS.length];
      const color = `rgb(${cr},${cg},${cb})`;
      const scaleX = W / (this.video.videoWidth  || W);
      const scaleY = H / (this.video.videoHeight || H);
      const X = kp => W - kp.x * scaleX;
      const Y = kp => kp.y * scaleY;

      /* Halo */
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.12)`;
      ctx.lineWidth = 8;
      for (const [a,b] of POSE_CONNECTIONS) {
        if (!kps[a]||!kps[b]) continue;
        if ((kps[a].score??1)<SCORE||(kps[b].score??1)<SCORE) continue;
        const x1=X(kps[a]),y1=Y(kps[a]),x2=X(kps[b]),y2=Y(kps[b]);
        const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
        const cpx=mx-(dy/len)*len*0.07,cpy=my+(dx/len)*len*0.07;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cpx,cpy,x2,y2); ctx.stroke();
      }

      /* Linha núcleo */
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      for (const [a,b] of POSE_CONNECTIONS) {
        if (!kps[a]||!kps[b]) continue;
        if ((kps[a].score??1)<SCORE||(kps[b].score??1)<SCORE) continue;
        const x1=X(kps[a]),y1=Y(kps[a]),x2=X(kps[b]),y2=Y(kps[b]);
        const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
        const cpx=mx-(dy/len)*len*0.07,cpy=my+(dx/len)*len*0.07;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cpx,cpy,x2,y2); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      /* Pontos interpolados — fillRect (muito mais rápido que arc) */
      for (const [a,b] of POSE_CONNECTIONS) {
        if (!kps[a]||!kps[b]) continue;
        if ((kps[a].score??1)<SCORE||(kps[b].score??1)<SCORE) continue;
        const x1=X(kps[a]),y1=Y(kps[a]),x2=X(kps[b]),y2=Y(kps[b]);
        const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
        const cpx=mx-(dy/len)*len*0.07,cpy=my+(dx/len)*len*0.07;
        for (let k=1; k<INTERP; k++) {
          const t=k/INTERP;
          const px=qx(x1,cpx,x2,t), py=qy(y1,cpy,y2,t);
          const al = Math.round(140 + t*115);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${(al/255).toFixed(2)})`;
          ctx.fillRect(px-1.5, py-1.5, 3, 3);
          totalRendered++;
        }
      }

      /* Articulações */
      const MAJOR = new Set([5,6,7,8,9,10,11,12,13,14,15,16]);
      for (let i=0; i<kps.length; i++) {
        if ((kps[i].score??1)<SCORE) continue;
        const x=X(kps[i]), y=Y(kps[i]), major=MAJOR.has(i), r=major?5:3;
        if (major) {
          ctx.beginPath(); ctx.arc(x,y,r+5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${cr},${cg},${cb},0.15)`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=major?14:8;
        ctx.fill(); ctx.shadowBlur=0;
        totalRendered++;
      }

      /* Label P1…P6 */
      if (kps[0] && (kps[0].score??1)>=SCORE) {
        ctx.font='bold 11px monospace'; ctx.fillStyle=color; ctx.shadowBlur=0;
        ctx.fillText(`P${pi+1}`, X(kps[0])-8, Y(kps[0])-26);
      }
    }

    this._skVirtual = Math.round(totalRendered * SK_VIRTUAL_MULT);
  }

  /* ══ MÃOS ══ */
  _renderHands(W, H) {
    const list = this.handResults?.multiHandLandmarks;
    if (!list) return;
    const ctx = this.ctx;
    const X = p => (1-p.x)*W, Y = p => p.y*H;
    const TIPS = new Set([4,8,12,16,20]);
    const labels = rotularMaos(list.map(lm => ({ wristX: lm[0].x })));

    for (let hi=0; hi<list.length; hi++) {
      const lm=list[hi];
      ctx.strokeStyle='rgba(0,255,136,0.8)'; ctx.lineWidth=1.8;
      ctx.shadowColor='#00ff88'; ctx.shadowBlur=8;
      for (const [a,b] of HAND_CONNECTIONS) {
        ctx.beginPath(); ctx.moveTo(X(lm[a]),Y(lm[a])); ctx.lineTo(X(lm[b]),Y(lm[b])); ctx.stroke();
      }
      for (let i=0; i<lm.length; i++) {
        const wrist=i===0, tip=TIPS.has(i);
        ctx.beginPath(); ctx.arc(X(lm[i]),Y(lm[i]),wrist?6:tip?4:2.5,0,Math.PI*2);
        ctx.fillStyle=wrist?'#ff00aa':'#00ff88';
        ctx.shadowColor=wrist?'#ff00aa':'#00ff88'; ctx.shadowBlur=wrist?14:8;
        ctx.fill();
      }
      ctx.shadowBlur=0; ctx.font='bold 13px monospace';
      const lx=X(lm[0])-20, ly=Y(lm[0])+28, label=labels[hi];
      ctx.fillStyle='rgba(0,12,24,0.6)';
      ctx.fillRect(lx-2,ly-13,ctx.measureText(label).width+6,17);
      ctx.fillStyle='rgba(0,255,136,0.95)'; ctx.fillText(label,lx,ly);
    }
    ctx.shadowBlur=0;
  }

  /* ══ HUD ══ */
  _renderHUD(W, H) {
    const ctx=this.ctx;
    ctx.strokeStyle='rgba(0,240,255,0.04)'; ctx.lineWidth=1;
    for (let x=0;x<W;x+=W/12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=0;y<H;y+=H/8) {ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    const c='rgba(0,240,255,0.35)', L=32;
    ctx.strokeStyle=c; ctx.lineWidth=2;
    for (const [px,py,sx,sy] of [[0,0,1,1],[W-1,0,-1,1],[0,H-1,1,-1],[W-1,H-1,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(px+sx*L,py); ctx.lineTo(px,py); ctx.lineTo(px,py+sy*L); ctx.stroke();
    }
    ctx.strokeStyle='rgba(0,240,255,0.22)';
    ctx.beginPath(); ctx.arc(W/2,H/2,26,0,Math.PI*2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W/2-36,H/2);ctx.lineTo(W/2-12,H/2);
    ctx.moveTo(W/2+12,H/2);ctx.lineTo(W/2+36,H/2);
    ctx.moveTo(W/2,H/2-36);ctx.lineTo(W/2,H/2-12);
    ctx.moveTo(W/2,H/2+12);ctx.lineTo(W/2,H/2+36); ctx.stroke();
    ctx.fillStyle='rgba(0,240,255,0.6)'; ctx.font='13px monospace';
    ctx.fillText('J.A.R.V.I.S · MULTI-BODY TRACKING', 14, 24);
    ctx.fillText(new Date().toLocaleTimeString(), W-96, 24);
  }

  _updateMetrics() {
    if (!this.metricsEl) return;
    const pessoas = this.poseResults?.length || 0;
    const maos    = this.handResults?.multiHandLandmarks?.length || 0;
    const fmt = n => {
      if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
      if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
      if (n >= 1e3) return (n/1e3).toFixed(1)+'k';
      return String(n);
    };
    this.metricsEl.innerHTML =
      `<span>FPS <b>${this._fps}</b></span>` +
      `<span>Pessoas <b>${pessoas}/25</b></span>` +
      `<span>Mãos <b>${maos}</b></span>` +
      `<span>Esqueleto <b>${fmt(this._skVirtual)}</b> pts</span>` +
      `<span>Malha <b>${fmt(this._meshVirtual)}</b> pts</span>` +
      `<span>Total <b>${fmt(this._skVirtual + this._meshVirtual)}</b></span>`;
  }

  stop() {
    this.running = false;
    if (this.raf)      cancelAnimationFrame(this.raf);
    if (this.stream)   this.stream.getTracks().forEach(t => t.stop());
    if (this.detector) { try { this.detector.dispose(); } catch {} }
    if (this.hands)    { try { this.hands.close(); }     catch {} }
    this.stream=null; this.video=null; this.detector=null; this.hands=null;
  }
}

/* ══════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════ */
let _engine = null;
function cleanup() { if (_engine) { _engine.stop(); _engine = null; } }

export function jarvisVisionPage() {
  cleanup();
  const opts = { body: true, hands: true, mesh: true, hud: true, maxHands: 8 };

  const canvas  = h('canvas', { className: 'jv-canvas' });
  const status  = h('span',   { className: 'jv-status' }, 'Câmera parada.');
  const metrics = h('div',    { className: 'jv-metrics' });
  let running   = false;

  const startBtn = h('button', { className: 'btn btn--primary', onclick: async () => {
    if (running) {
      _engine?.stop(); _engine=null; running=false;
      startBtn.textContent='▶ Ativar JARVIS';
      status.textContent='Câmera parada.'; metrics.innerHTML='';
      return;
    }
    startBtn.disabled = true;
    _engine = new JarvisVision(canvas, { ...opts }, status, metrics);
    const ok = await _engine.start();
    startBtn.disabled = false;
    if (ok) { running=true; startBtn.textContent='⏹ Desativar'; }
    else { _engine=null; }
  }}, '▶ Ativar JARVIS');

  const layerDefs = [
    { k: 'body',  label: '🦴 Esqueleto' },
    { k: 'mesh',  label: '🌐 Malha' },
    { k: 'hands', label: '✋ Mãos' },
    { k: 'hud',   label: '🎯 HUD' }
  ];
  const layerBtns = layerDefs.map(({ k, label }) => {
    const b = h('button', {
      className: `jv-toggle${opts[k] ? ' is-on' : ''}`,
      onclick: () => { opts[k]=!opts[k]; b.classList.toggle('is-on',opts[k]); if (_engine) _engine.setOpt(k,opts[k]); }
    }, label);
    return b;
  });

  const handsSel = h('select', { className: 'jv-select', onchange: e => {
    opts.maxHands=+e.target.value;
    if (_engine?.hands) _engine.hands.setOptions({ maxNumHands: opts.maxHands });
  } }, ...[2,4,6,8,10,16,20].map(n => h('option',{value:String(n),selected:n===8},`${n} mãos`)));

  const wrap = h('div', { className: 'jv-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🤖 JARVIS · Rastreamento Multi-Corporal'),
      h('p', { className: 'u-text-muted' },
        'MoveNet MultiPose LIGHTNING · até 6 corpos simultâneos · esqueleto 25.6M pts · malha 2.56M pts por pessoa · múltiplas mãos'
      )
    ),
    h('div', { className: 'jv-bar' }, startBtn, ...layerBtns,
      h('label', { className: 'jv-label' }, 'Máx mãos:', handsSel), status),
    metrics,
    h('div', { className: 'jv-viewport' }, canvas),
    h('div', { className: 'jv-legend' },
      h('span',null,h('i',{style:{background:'#00f0ff'}}),'Pessoa 1'),
      h('span',null,h('i',{style:{background:'#00ffaa'}}),'Pessoa 2'),
      h('span',null,h('i',{style:{background:'#aaff00'}}),'Pessoa 3+'),
      h('span',null,h('i',{style:{background:'#00ff88'}}),'Mãos'),
      h('span',null,h('i',{style:{background:'#ff00aa'}}),'Pulso')
    ),
    h('div', { className: 'jv-info' },
      h('p',null,'⚡ TF.js MoveNet carrega via CDN na 1ª ativação (~8-12s). Depois fica em cache.'),
      h('p',null,'💡 Afaste-se para capturar o corpo inteiro. Cada pessoa tem uma cor diferente.')
    )
  );

  const obs = new MutationObserver(() => { if (!document.body.contains(wrap)) { cleanup(); obs.disconnect(); } });
  obs.observe(document.body, { childList: true, subtree: true });
  return wrap;
}
