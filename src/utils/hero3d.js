/**
 * Hero 3D — campo de partículas com profundidade em Canvas 2D puro (issue
 * #195/#196: redesign 3D, imersivo e interativo, sem dependência externa).
 *
 * Projeta partículas com z (profundidade) em perspectiva, faz parallax com o
 * mouse e desenha as conexões próximas (estilo "constelação cinematográfica").
 *
 * Robustez: o loop é AUTO-DIMENSIONÁVEL e AUTO-ENCERRÁVEL. Ele tenta dimensionar
 * a cada quadro até o canvas ganhar layout (height:100% só resolve depois de
 * inserido), e para sozinho se o canvas nunca conectar (página descartada) ou
 * for desmontado — o que torna o efeito imune a chamadas de página duplicadas e
 * a problemas de ordem de inserção. Respeita prefers-reduced-motion e pausa com
 * a aba oculta.
 *
 * Uso:
 *   const fx = createHeroField(canvas, { accent: '#d4a24e' });
 *   fx.start();           // anima (idempotente)
 *   fx.setPointer(x, y);  // parallax (coords 0..1 relativas ao herói)
 *   fx.destroy();         // limpa rAF + listeners
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createHeroField(canvas, { accent = '#d4a24e', accent2 = '#e8c07a', density = 1, grid = true } = {}) {
  const ctx = canvas.getContext('2d');
  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1;
  let everConnected = false, waitFrames = 0;
  let particles = [];
  let tt = 0; // tempo (anima o grid de horizonte)
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const FOCAL = 360;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(rect.width));
    const nh = Math.max(1, Math.round(rect.height));
    if (nw <= 1 && nh <= 1) return false;   // ainda sem layout
    w = nw; h = nh;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    return true;
  }

  function seed() {
    const n = Math.min(180, Math.floor((w * h) / 9000 * density));
    particles = Array.from({ length: n }, () => ({
      x: (Math.random() * 2 - 1) * w,
      y: (Math.random() * 2 - 1) * h,
      z: Math.random() * FOCAL + 40,
      hue: Math.random() < 0.18 ? accent2 : accent
    }));
  }

  function project(p, ox, oy) {
    const s = FOCAL / p.z;
    return { sx: w / 2 + (p.x + ox) * s, sy: h / 2 + (p.y + oy) * s, s };
  }

  /* grid de horizonte (synthwave / GTA-VI): chão em perspectiva que recua até
     um horizonte com brilho. Linhas horizontais "voam" em direção ao observador. */
  function drawGrid(ox) {
    const horizon = h * 0.66;
    const vanish = w / 2 + ox * 1.2;     // ponto de fuga acompanha o parallax
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    /* brilho do horizonte */
    const glow = ctx.createLinearGradient(0, horizon - 40, 0, horizon + 4);
    glow.addColorStop(0, 'rgba(232,192,122,0)');
    glow.addColorStop(1, 'rgba(232,192,122,0.22)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, horizon - 40, w, 44);

    ctx.strokeStyle = accent; ctx.lineWidth = 1;
    /* linhas horizontais com espaçamento em perspectiva, rolando com o tempo */
    const ROWS = 16, period = 1;
    for (let i = 0; i < ROWS; i++) {
      const f = ((i + (tt * 0.012) % 1) / ROWS);     // 0 (horizonte) → 1 (perto)
      const y = horizon + Math.pow(f, 2.2) * (h - horizon);
      if (y <= horizon || y > h) continue;
      ctx.globalAlpha = Math.min(0.32, f * 0.4);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    /* linhas verticais convergindo ao ponto de fuga */
    const COLS = 14;
    for (let i = -COLS; i <= COLS; i++) {
      const xBottom = vanish + (i / COLS) * w * 1.4;
      ctx.globalAlpha = 0.14;
      ctx.beginPath(); ctx.moveTo(vanish, horizon); ctx.lineTo(xBottom, h); ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function paint() {
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const ox = (pointer.x - 0.5) * 140;
    const oy = (pointer.y - 0.5) * 140;
    tt += 1;

    ctx.clearRect(0, 0, w, h);
    if (grid) drawGrid(ox);
    const pts = [];
    for (const p of particles) {
      p.z -= 0.45;
      if (p.z < 40) { p.z = FOCAL + 40; p.x = (Math.random() * 2 - 1) * w; p.y = (Math.random() * 2 - 1) * h; }
      const k = 1 - p.z / (FOCAL + 40);
      const pr = project(p, ox * k, oy * k);
      if (pr.sx < -50 || pr.sx > w + 50 || pr.sy < -50 || pr.sy > h + 50) continue;
      const r = Math.max(0.4, pr.s * 1.1);
      const alpha = Math.min(1, pr.s * 0.9);
      ctx.beginPath();
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = alpha * 0.9;
      ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);
      ctx.fill();
      pts.push({ x: pr.sx, y: pr.sy, a: alpha });
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.5;
    const MAX = 70, MAXD = 96 * 96;
    for (let i = 0; i < pts.length && i < MAX; i++) {
      for (let j = i + 1; j < pts.length && j < MAX; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MAXD) {
          ctx.globalAlpha = (1 - d2 / MAXD) * 0.18 * Math.min(pts[i].a, pts[j].a);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* loop: auto-dimensiona; auto-encerra se o canvas não estiver montado */
  function frame() {
    if (dead || !running) return;
    if (canvas.isConnected) {
      everConnected = true;
      if (w <= 1 || h <= 1) resize();
    } else if (everConnected) {
      running = false; return;            // foi desmontado → encerra
    } else if (waitFrames++ > 180) {
      running = false; return;            // nunca conectou (página descartada)
    }
    if (w > 1 && h > 1) paint();
    raf = requestAnimationFrame(frame);
  }

  /* movimento reduzido: 1 quadro estático assim que houver layout */
  function staticDraw() {
    if (dead) return;
    if (canvas.isConnected && resize()) { paint(); return; }
    if (!canvas.isConnected && everConnected) return;
    if (waitFrames++ > 180) return;
    requestAnimationFrame(staticDraw);
  }

  function start() {
    if (dead || running) return;
    if (REDUCED) { staticDraw(); return; }
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function onResize() { resize(); }
  window.addEventListener('resize', onResize);

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => { if (running && (w <= 1 || h <= 1)) resize(); });
    ro.observe(canvas);
  }

  let wasRunning = false;
  function onVisibility() {
    if (document.hidden) { wasRunning = running; stop(); }
    else if (wasRunning && !dead) start();
  }
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start,
    stop,
    setPointer(x, y) { pointer.tx = x; pointer.ty = y; },
    destroy() {
      dead = true; stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (ro) ro.disconnect();
    }
  };
}
