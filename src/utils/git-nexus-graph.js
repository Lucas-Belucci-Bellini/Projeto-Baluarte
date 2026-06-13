/**
 * Git Nexus — visualização de grafo force-directed em Canvas 2D puro.
 *
 * Renderiza o grafo de conhecimento de código: nós coloridos por COMUNIDADE,
 * tamanho por CENTRALIDADE (PageRank), arestas = imports. Simulação de forças
 * (repulsão + molas + centralização) que esfria sozinha. Interativo: hover
 * realça o nó e a vizinhança; clique seleciona (callback p/ o painel de impacto).
 *
 * Auto-dimensionável (o loop tenta dimensionar até o canvas ter layout) e
 * auto-encerrável (para se o canvas sair do DOM) — robusto a remontagem, como
 * no hero3d. Respeita prefers-reduced-motion (assenta o layout sem animar).
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTE = ['#00f0ff', '#ff00aa', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];

export function createGraphView(canvas, { nodes, edges, comIdx, pr, onSelect } = {}) {
  const ctx = canvas.getContext('2d');
  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1;
  let everConnected = false, waitFrames = 0;
  let alpha = REDUCED ? 0 : 1;           // "temperatura" da simulação
  let hoverId = null, selectedId = null;

  /* posição inicial: círculo por comunidade (espalha) */
  const N = nodes.length;
  const prMax = Math.max(1e-9, ...[...pr.values()]);
  const P = new Map();
  nodes.forEach((n, i) => {
    const a = (i / N) * Math.PI * 2;
    P.set(n.id, { x: Math.cos(a) * 220 + (Math.random() - 0.5) * 40, y: Math.sin(a) * 220 + (Math.random() - 0.5) * 40, vx: 0, vy: 0 });
  });
  const radius = (id) => 3 + Math.sqrt((pr.get(id) || 0) / prMax) * 16;
  const color = (id) => PALETTE[(comIdx.get(id) || 0) % PALETTE.length];

  /* vizinhança p/ realce */
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

  /* um passo da simulação de forças */
  function step() {
    const K = 0.018;                       // mola
    const REP = 1400;                       // repulsão
    const arr = nodes;
    /* repulsão O(n²) — ok para ~160 nós */
    for (let i = 0; i < N; i++) {
      const a = P.get(arr[i].id);
      for (let j = i + 1; j < N; j++) {
        const b = P.get(arr[j].id);
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
        const f = REP / d2;
        const d = Math.sqrt(d2); const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
    }
    /* molas nas arestas */
    for (const e of edges) {
      const a = P.get(e.source), b = P.get(e.target);
      const dx = b.x - a.x, dy = b.y - a.y;
      a.vx += dx * K; a.vy += dy * K; b.vx -= dx * K; b.vy -= dy * K;
    }
    /* centralização + integração + atrito */
    for (const n of arr) {
      const p = P.get(n.id);
      p.vx += -p.x * 0.002; p.vy += -p.y * 0.002;
      p.x += p.vx * alpha * 0.6; p.y += p.vy * alpha * 0.6;
      p.vx *= 0.82; p.vy *= 0.82;
    }
    alpha *= 0.985; if (alpha < 0.02) alpha = 0.02;
  }

  /* transforma coords do mundo → tela (fit) */
  let scale = 1, ox = 0, oy = 0;
  function fit() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of P.values()) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    const gw = maxX - minX || 1, gh = maxY - minY || 1;
    scale = Math.min(w / (gw + 80), h / (gh + 80));
    ox = w / 2 - (minX + maxX) / 2 * scale;
    oy = h / 2 - (minY + maxY) / 2 * scale;
  }
  const toScreen = (p) => ({ x: p.x * scale + ox, y: p.y * scale + oy });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    fit();
    const hi = hoverId || selectedId;
    const hiSet = hi ? nbr.get(hi) : null;

    /* arestas */
    for (const e of edges) {
      const a = toScreen(P.get(e.source)), b = toScreen(P.get(e.target));
      const active = hi && (e.source === hi || e.target === hi);
      ctx.strokeStyle = active ? 'rgba(0,240,255,0.55)' : 'rgba(120,140,170,0.10)';
      ctx.lineWidth = active ? 1.4 : 0.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    /* nós */
    for (const n of nodes) {
      const p = toScreen(P.get(n.id));
      const r = radius(n.id) * Math.min(1.4, scale + 0.4);
      const dim = hi && n.id !== hi && !(hiSet && hiSet.has(n.id));
      ctx.globalAlpha = dim ? 0.18 : 1;
      ctx.fillStyle = color(n.id);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      if (n.id === selectedId) { ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      /* rótulo dos mais centrais / do realçado */
      if (!dim && (r > 9 || n.id === hi)) {
        ctx.globalAlpha = 1; ctx.fillStyle = '#cdd9ee';
        ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(n.label, p.x, p.y + r + 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    if (dead || !running) return;
    if (canvas.isConnected) { everConnected = true; if (w <= 1 || h <= 1) resize(); }
    else if (everConnected) { running = false; return; }
    else if (waitFrames++ > 180) { running = false; return; }
    if (w > 1 && h > 1) { if (alpha > 0.025) step(); draw(); }
    raf = requestAnimationFrame(frame);
  }

  function nodeAt(sx, sy) {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      const p = toScreen(P.get(n.id));
      const r = radius(n.id) * Math.min(1.4, scale + 0.4) + 3;
      const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
      if (d < r * r && d < bestD) { bestD = d; best = n.id; }
    }
    return best;
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const id = nodeAt(e.clientX - r.left, e.clientY - r.top);
    if (id !== hoverId) { hoverId = id; canvas.style.cursor = id ? 'pointer' : 'default'; if (alpha < 0.05) draw(); }
  }
  function onClick(e) {
    const r = canvas.getBoundingClientRect();
    const id = nodeAt(e.clientX - r.left, e.clientY - r.top);
    selectedId = id;
    if (alpha < 0.05) draw();
    if (onSelect) onSelect(id);
  }
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('click', onClick);

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (w <= 1) resize(); }); ro.observe(canvas); }

  function start() {
    if (dead || running) return;
    running = true;
    if (REDUCED) { /* assenta sem animar */ for (let i = 0; i < 220; i++) { alpha = 1; step(); } alpha = 0; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  return {
    start, stop,
    select(id) { selectedId = id; if (alpha < 0.05) draw(); },
    reheat() { if (!REDUCED) { alpha = 0.6; } },
    destroy() {
      dead = true; stop();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
      if (ro) ro.disconnect();
    }
  };
}
