/**
 * /cerebro — Segundo Cérebro do Baluarte.
 *
 * Mapa de conhecimento (knowledge graph) que liga domínios, projetos,
 * conceitos e fontes do Mark XIII. Inspirado em ferramentas como o GitNexus,
 * mas 100% no navegador e alimentado pelos dados do próprio site
 * (src/data/cerebro.json). Clicar num nó com rota navega para a página.
 */

import '../styles/cerebro.css';
import { h } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { router } from '../core/router.js';
import cerebro from '../data/cerebro.json';
import { getMemories } from '../utils/jarvis-brain.js';

const TIPOS = cerebro.tipos;

/* Memórias do JARVIS entram no grafo como nós ligados aos seus conceitos. */
function memoryGraph() {
  const ids = new Set(cerebro.nodes.map((n) => n.id));
  const nodes = [], links = [];
  getMemories().slice(0, 50).forEach((m, i) => {
    const id = 'mem-' + (m.id || i);
    nodes.push({ id, tipo: 'memoria', rota: '/memoria', label: m.text.length > 22 ? m.text.slice(0, 20) + '…' : m.text });
    const t = (m.conceptIds || []).filter((c) => ids.has(c));
    (t.length ? t : ['p-cerebro']).forEach((c) => links.push({ source: id, target: c }));
  });
  return { nodes, links };
}

export function cerebroPage() {
  const page = h('div', { className: 'page-cerebro' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SEGUNDO CÉREBRO')),
      h('h1', { className: 'page-header__title' }, '🧠 Segundo Cérebro'),
      h('p', { className: 'page-header__description' }, cerebro.meta.desc,
        ' Clique num nó para abrir a página.'))
  );

  /* Métricas (incluindo as memórias do JARVIS já ligadas ao cérebro) */
  const mg = memoryGraph();
  const nDom = cerebro.nodes.filter((n) => n.tipo === 'dominio').length;
  const metrics = h('div', { className: 'cer-metrics' },
    metric(cerebro.nodes.length + mg.nodes.length, 'nós'),
    metric(cerebro.links.length + mg.links.length, 'conexões'),
    metric(nDom, 'domínios'),
    metric(mg.nodes.length, 'memórias'));
  page.appendChild(metrics);

  /* Legenda */
  const legend = h('div', { className: 'cer-legend' });
  Object.values(TIPOS).forEach((t) => {
    legend.appendChild(h('span', { className: 'cer-leg' },
      h('span', { className: 'cer-leg__dot', style: { background: t.cor } }),
      t.label));
  });
  page.appendChild(legend);

  /* Grafo */
  const wrap = h('div', { className: 'cer-graph' });
  const canvas = h('canvas', { className: 'cer-canvas' });
  const tip = h('div', { className: 'cer-tip' });
  wrap.appendChild(canvas);
  wrap.appendChild(tip);
  page.appendChild(wrap);

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🕸️ Este grafo é alimentado por ', h('span', { className: 'u-mono' }, 'src/data/cerebro.json'),
      ' — conforme o Baluarte cresce, o cérebro cresce junto.')
  );

  /* ===== Simulação força-dirigida ===== */
  requestAnimationFrame(() => initGraph(canvas, tip, mg, page));

  return page;
}

function metric(v, l) {
  return h('div', { className: 'cer-metric' },
    h('div', { className: 'cer-metric__v' }, String(v)),
    h('div', { className: 'cer-metric__l' }, l));
}

function initGraph(canvas, tip, extra, page) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W = 0, H = 0;

  const srcNodes = cerebro.nodes.concat((extra && extra.nodes) || []);
  const srcLinks = cerebro.links.concat((extra && extra.links) || []);
  const idMap = new Map();
  const nodes = srcNodes.map((n, i) => {
    const o = {
      ...n,
      r: (TIPOS[n.tipo] || {}).r || 8,
      cor: (TIPOS[n.tipo] || {}).cor || '#8aa0bd',
      x: 0, y: 0, vx: 0, vy: 0, deg: 0
    };
    idMap.set(n.id, o);
    return o;
  });
  const links = srcLinks
    .map((l) => ({ s: idMap.get(l.source), t: idMap.get(l.target) }))
    .filter((l) => l.s && l.t);
  links.forEach((l) => { l.s.deg++; l.t.deg++; });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  /* Seed: domínios no centro, resto em anel */
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    const rad = n.tipo === 'dominio' ? 60 : 180 + (i % 5) * 24;
    n.x = W / 2 + Math.cos(a) * rad;
    n.y = H / 2 + Math.sin(a) * rad;
  });

  let alpha = 1;
  let hover = null;
  let dragging = null;
  const ro = new ResizeObserver(() => { resize(); alpha = Math.max(alpha, 0.4); });
  ro.observe(canvas);

  function step() {
    /* Repulsão O(n²) */
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01;
        const f = (520 * alpha) / d2;
        const d = Math.sqrt(d2);
        const ux = dx / d, uy = dy / d;
        a.vx += ux * f; a.vy += uy * f;
        b.vx -= ux * f; b.vy -= uy * f;
      }
    }
    /* Atração das arestas */
    for (const l of links) {
      let dx = l.t.x - l.s.x, dy = l.t.y - l.s.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - 96) * 0.016 * alpha;
      const ux = dx / d, uy = dy / d;
      l.s.vx += ux * f; l.s.vy += uy * f;
      l.t.vx -= ux * f; l.t.vy -= uy * f;
    }
    /* Gravidade central + integração */
    for (const n of nodes) {
      n.vx += (W / 2 - n.x) * 0.006 * alpha;
      n.vy += (H / 2 - n.y) * 0.006 * alpha;
      if (n === dragging) { n.vx = 0; n.vy = 0; continue; }
      n.x += n.vx; n.y += n.vy;
      n.vx *= 0.86; n.vy *= 0.86;
      n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x));
      n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y));
    }
    alpha *= 0.99;
    if (alpha < 0.02) alpha = 0.02;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    /* Arestas */
    const near = hover ? neighbors(hover) : null;
    for (const l of links) {
      const on = near && (l.s === hover || l.t === hover);
      ctx.strokeStyle = on ? 'rgba(212,162,78,0.5)' : 'rgba(255,255,255,0.07)';
      ctx.lineWidth = on ? 1.4 : 0.8;
      ctx.beginPath();
      ctx.moveTo(l.s.x, l.s.y);
      ctx.lineTo(l.t.x, l.t.y);
      ctx.stroke();
    }
    /* Nós */
    for (const n of nodes) {
      const dim = near && n !== hover && !near.has(n);
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (n === hover ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = n.cor;
      ctx.fill();
      if (n.tipo === 'dominio' || n.tipo === 'projeto') {
        ctx.fillStyle = dim ? 'rgba(200,210,225,0.4)' : '#dfe7f3';
        ctx.font = `${n.tipo === 'dominio' ? 12 : 10}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - n.r - 5);
      }
    }
    ctx.globalAlpha = 1;
  }

  function neighbors(node) {
    const set = new Set([node]);
    for (const l of links) {
      if (l.s === node) set.add(l.t);
      if (l.t === node) set.add(l.s);
    }
    return set;
  }

  function pick(mx, my) {
    let best = null, bd = 16 * 16;
    for (const n of nodes) {
      const dx = n.x - mx, dy = n.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < bd && d2 < (n.r + 6) * (n.r + 6)) { best = n; bd = d2; }
    }
    return best;
  }

  function loop() {
    step();
    draw();
    raf = requestAnimationFrame(loop);
  }
  let raf = requestAnimationFrame(loop);

  /* ===== Interação ===== */
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragging) { dragging.x = mx; dragging.y = my; alpha = Math.max(alpha, 0.3); }
    hover = pick(mx, my);
    canvas.style.cursor = hover ? 'pointer' : 'crosshair';
    if (hover) {
      tip.style.display = 'block';
      tip.style.left = Math.min(mx + 12, W - 180) + 'px';
      tip.style.top = (my + 12) + 'px';
      const t = TIPOS[hover.tipo];
      tip.innerHTML = `<b>${hover.label}</b><br><span style="color:${hover.cor}">${t ? t.label : ''}</span>${hover.rota ? ' · clique p/ abrir' : ''}`;
    } else {
      tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    dragging = pick(e.clientX - rect.left, e.clientY - rect.top);
  });
  /* Em `window` porque soltar o botão fora do canvas também encerra o arrasto —
   * e por isso mesmo precisa ser devolvido na saída. Era anônimo, então não
   * havia como removê-lo: um listener por visita, para sempre. */
  const onMouseUp = () => { dragging = null; };
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', () => { hover = null; tip.style.display = 'none'; });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const n = pick(e.clientX - rect.left, e.clientY - rect.top);
    if (n && n.rota) router.navigate(n.rota);
  });

  /* Limpeza ao sair da tela. Era um `MutationObserver` sobre o `document.body`
   * inteiro, que rodava a cada mutação do documento só para descobrir uma coisa
   * que o shell já sabe na hora da troca — e que ainda por cima esquecia o
   * listener de `mouseup`. */
  aoSair(page, () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('mouseup', onMouseUp);
  });
}
