/**
 * Git Nexus — grafo de conhecimento de código em 3D (issue #195: "tem que ter
 * isso em 3D o jeito que ele se organiza, e ele tem que se mover igual ao
 * jarvis"). Orbe de nós que se auto-organiza por forças em 3D, projetado em
 * perspectiva no canvas, GIRANDO continuamente (vivo, estilo núcleo do JARVIS).
 *
 * Canvas 2D puro (sem WebGL/Three): posições 3D (x,y,z) → rotação → projeção
 * perspectiva → pintura ordenada por profundidade (longe = menor/mais apagado),
 * com glow. Nós coloridos por comunidade, tamanho por centralidade (PageRank).
 * Arraste para girar (inércia). Hover realça vizinhança; clique seleciona.
 *
 * Mesma API de createGraphView (start/stop/select/destroy + onSelect), então a
 * página só troca o construtor. Auto-dimensionável e auto-encerrável (robusto a
 * remontagem). Respeita prefers-reduced-motion (assenta e não gira sozinho).
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTE = ['#00f0ff', '#ff00aa', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];

export function createGraphView3D(canvas, { nodes, edges, comIdx, pr, onSelect } = {}) {
  const ctx = canvas.getContext('2d');
  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1;
  let everConnected = false, waitFrames = 0;
  let alpha = 1;                 // "temperatura" da auto-organização
  let rotY = 0.4, rotX = -0.25;  // rotação da câmera
  let autoSpin = REDUCED ? 0 : 0.0035;
  let hoverId = null, selectedId = null;
  const FOCAL = 540, SPREAD = 260;

  const N = nodes.length;
  const prMax = Math.max(1e-9, ...[...pr.values()]);
  const radius = (id) => 2.5 + Math.sqrt((pr.get(id) || 0) / prMax) * 15;
  const color = (id) => PALETTE[(comIdx.get(id) || 0) % PALETTE.length];

  /* posição inicial 3D — casca esférica aleatória (vira orbe ao organizar) */
  const P = new Map();
  nodes.forEach((n) => {
    const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(1 - u * u);
    P.set(n.id, { x: Math.cos(t) * rr * SPREAD, y: u * SPREAD, z: Math.sin(t) * rr * SPREAD, vx: 0, vy: 0, vz: 0 });
  });

  const nbr = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of edges) { nbr.get(e.source).add(e.target); nbr.get(e.target).add(e.source); }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw <= 1 && nh <= 1) return false;
    w = nw; h = nh; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  /* um passo de força em 3D (O(n²), ok p/ ~160 nós) */
  function step() {
    const REP = 2200, K = 0.02, arr = nodes;
    for (let i = 0; i < N; i++) {
      const a = P.get(arr[i].id);
      for (let j = i + 1; j < N; j++) {
        const b = P.get(arr[j].id);
        let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        let d2 = dx * dx + dy * dy + dz * dz; if (d2 < 1) d2 = 1;
        const f = REP / d2, d = Math.sqrt(d2);
        const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
        a.vx += fx; a.vy += fy; a.vz += fz; b.vx -= fx; b.vy -= fy; b.vz -= fz;
      }
    }
    for (const e of edges) {
      const a = P.get(e.source), b = P.get(e.target);
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      a.vx += dx * K; a.vy += dy * K; a.vz += dz * K;
      b.vx -= dx * K; b.vy -= dy * K; b.vz -= dz * K;
    }
    for (const n of arr) {
      const p = P.get(n.id);
      p.vx += -p.x * 0.004; p.vy += -p.y * 0.004; p.vz += -p.z * 0.004; // centraliza
      p.x += p.vx * alpha * 0.5; p.y += p.vy * alpha * 0.5; p.z += p.vz * alpha * 0.5;
      p.vx *= 0.8; p.vy *= 0.8; p.vz *= 0.8;
    }
    alpha *= 0.99; if (alpha < 0.03) alpha = 0.03;
  }

  /* projeta um ponto 3D (já rotacionado) → tela; guarda em screen[] */
  const screen = new Map();
  function project() {
    const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
    let order = [];
    for (const n of nodes) {
      const p = P.get(n.id);
      /* rotação Y depois X */
      let x = p.x * cy - p.z * sy;
      let z = p.x * sy + p.z * cy;
      let y = p.y * cx - z * sx;
      z = p.y * sx + z * cx;
      const s = FOCAL / (FOCAL + z);
      screen.set(n.id, { x: w / 2 + x * s, y: h / 2 + y * s, s, z });
      order.push(n.id);
    }
    order.sort((a, b) => screen.get(b).z - screen.get(a).z); // longe primeiro
    return order;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    /* fundo: leve brilho central (núcleo) */
    const order = project();
    const hi = hoverId || selectedId;
    const hiSet = hi ? nbr.get(hi) : null;

    /* arestas primeiro (depth via média) */
    for (const e of edges) {
      const a = screen.get(e.source), b = screen.get(e.target);
      const active = hi && (e.source === hi || e.target === hi);
      const depth = (a.s + b.s) / 2;          // perto = maior s
      ctx.strokeStyle = active ? 'rgba(0,240,255,0.6)' : `rgba(120,150,200,${(0.05 + depth * 0.06).toFixed(3)})`;
      ctx.lineWidth = active ? 1.4 : 0.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    /* nós ordenados por profundidade, com glow */
    for (const id of order) {
      const sp = screen.get(id);
      const baseR = radius(id) * sp.s;
      const dim = hi && id !== hi && !(hiSet && hiSet.has(id));
      const c = color(id);
      const depthA = Math.max(0.25, Math.min(1, sp.s));   // longe = mais apagado
      ctx.globalAlpha = dim ? 0.12 : depthA;
      ctx.shadowColor = c;
      ctx.shadowBlur = dim ? 0 : (id === hi ? 24 : baseR * 1.8);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, Math.max(1, baseR), 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (id === selectedId) { ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      if (!dim && id === hi) {
        ctx.globalAlpha = 1; ctx.fillStyle = '#eaf2ff';
        ctx.font = '11px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(graphLabel(id), sp.x, sp.y + baseR + 3);
      }
    }
    ctx.globalAlpha = 1;
  }

  const labelMap = new Map(nodes.map((n) => [n.id, n.label || n.id]));
  function graphLabel(id) { return labelMap.get(id) || id; }

  function frame() {
    if (dead || !running) return;
    if (canvas.isConnected) { everConnected = true; if (w <= 1 || h <= 1) resize(); }
    else if (everConnected) { running = false; return; }
    else if (waitFrames++ > 180) { running = false; return; }
    if (w > 1 && h > 1) {
      if (alpha > 0.04) step();
      if (!dragging) rotY += autoSpin;       // gira sozinho (se move como o JARVIS)
      draw();
    }
    raf = requestAnimationFrame(frame);
  }

  /* ---- interação ---- */
  function nodeAt(sx, sy) {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      const sp = screen.get(n.id); if (!sp) continue;
      const rr = radius(n.id) * sp.s + 4;
      const d = (sp.x - sx) ** 2 + (sp.y - sy) ** 2;
      if (d < rr * rr && d < bestD) { bestD = d; best = n.id; }
    }
    return best;
  }
  let dragging = false, lastX = 0, lastY = 0, vSpin = 0, moved = false;
  function onDown(e) { dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture?.(e.pointerId); }
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      rotY += dx * 0.008; rotX += dy * 0.008;
      rotX = Math.max(-1.3, Math.min(1.3, rotX)); vSpin = dx * 0.008;
    } else {
      const id = nodeAt(e.clientX - r.left, e.clientY - r.top);
      if (id !== hoverId) { hoverId = id; canvas.style.cursor = id ? 'pointer' : 'grab'; }
    }
  }
  function onUp(e) {
    if (dragging && !moved) {
      const r = canvas.getBoundingClientRect();
      selectedId = nodeAt(e.clientX - r.left, e.clientY - r.top);
      if (onSelect) onSelect(selectedId);
    }
    dragging = false;
    if (Math.abs(vSpin) > 0.001 && !REDUCED) autoSpin = Math.max(0.0035, Math.abs(vSpin)) * Math.sign(vSpin || 1);
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.style.cursor = 'grab';

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (w <= 1) resize(); }); ro.observe(canvas); }

  function start() {
    if (dead || running) return;
    running = true;
    if (REDUCED) { for (let i = 0; i < 260; i++) step(); alpha = 0; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  return {
    start, stop,
    select(id) { selectedId = id; },
    reheat() { if (!REDUCED) alpha = 0.5; },
    destroy() {
      dead = true; stop();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      if (ro) ro.disconnect();
    }
  };
}
