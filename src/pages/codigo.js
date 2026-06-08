/**
 * /codigo — Raio-X do Código (auto-análise, estilo GitNexus).
 * Lê src/data/codemap.json (gerado por scripts/gen-codemap.mjs) e desenha um
 * grafo force-directed dos arquivos e seus imports, + métricas do próprio site.
 */

import { h, empty } from '../utils/helpers.js';
import codemap from '../data/codemap.json';

/* cor por pasta de topo */
const GROUP = (dir) => (dir || '').split('/')[0] || '(raiz)';
const COLORS = {
  pages: '#ff3b8d', utils: '#ffaa00', data: '#00ff88', core: '#00f0ff',
  layout: '#b15dff', '(raiz)': '#8aa0bd'
};
const colorOf = (dir) => COLORS[GROUP(dir)] || '#66ddff';

function metric(label, value) {
  return h('div', { className: 'cod-metric' },
    h('div', { className: 'cod-metric__v u-mono' }, value),
    h('div', { className: 'cod-metric__l u-text-muted' }, label));
}

export function codigoPage() {
  const page = h('div', { className: 'page-codigo' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CÓDIGO')),
      h('h1', { className: 'page-header__title' }, '🔬 Raio-X do Código'),
      h('p', { className: 'page-header__description' },
        'O site analisa o ', h('span', { className: 'u-text-cyan' }, 'próprio código'),
        ': cada ponto é um arquivo, cada linha é um import. Passe o mouse para destacar as conexões.'))
  );

  const m = codemap.meta;
  page.appendChild(h('div', { className: 'cod-metrics' },
    metric('arquivos', m.files),
    metric('linhas', m.loc.toLocaleString('pt-BR')),
    metric('imports', m.links),
    metric('pastas', m.dirs)));

  /* Legenda */
  const leg = h('div', { className: 'cod-legend' });
  for (const [g, c] of Object.entries(COLORS)) {
    if (!codemap.byDir || !Object.keys(codemap.byDir).some((d) => GROUP(d) === g)) continue;
    leg.appendChild(h('span', { className: 'cod-leg' },
      h('span', { className: 'cod-leg__dot', style: { background: c } }), g));
  }
  page.appendChild(leg);

  /* Canvas do grafo */
  const wrap = h('div', { className: 'cod-graph' });
  const canvas = h('canvas', { className: 'cod-canvas' });
  const tip = h('div', { className: 'cod-tip' });
  wrap.append(canvas, tip);
  page.appendChild(wrap);

  /* Listas */
  const lists = h('div', { className: 'cod-lists' });
  lists.appendChild(listCard('★ Mais importados', codemap.topImported.map((x) => [x.label, x.importedBy + '×'])));
  lists.appendChild(listCard('▦ Maiores arquivos', codemap.topLoc.map((x) => [x.label, x.loc + ' ln'])));
  page.appendChild(lists);

  /* ===== Força + render ===== */
  const N = codemap.nodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0,
    r: Math.min(11, 3 + Math.sqrt(n.importedBy) * 1.6), color: colorOf(n.dir) }));
  const idx = new Map(N.map((n, i) => [n.id, i]));
  const L = codemap.links.map((l) => ({ s: idx.get(l.source), t: idx.get(l.target) }))
    .filter((l) => l.s != null && l.t != null);
  const adj = N.map(() => new Set());
  for (const l of L) { adj[l.s].add(l.t); adj[l.t].add(l.s); }

  let W = 800, Hc = 520, dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d');
  let hover = -1;

  function size() {
    W = wrap.clientWidth || 800;
    canvas.width = W * dpr; canvas.height = Hc * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = Hc + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  /* posições iniciais: anel por grupo */
  const groups = [...new Set(N.map((n) => GROUP(n.dir)))];
  N.forEach((n) => {
    const gi = groups.indexOf(GROUP(n.dir));
    const a = (gi / groups.length) * Math.PI * 2 + Math.random();
    n.x = 400 + Math.cos(a) * 150 + (Math.random() - 0.5) * 80;
    n.y = 260 + Math.sin(a) * 150 + (Math.random() - 0.5) * 80;
  });

  let alpha = 1, raf = 0;
  function step() {
    const cx = W / 2, cy = Hc / 2;
    /* repulsão O(n²) */
    for (let i = 0; i < N.length; i++) {
      for (let j = i + 1; j < N.length; j++) {
        let dx = N[i].x - N[j].x, dy = N[i].y - N[j].y;
        let d2 = dx * dx + dy * dy || 0.01;
        const f = 240 / d2;
        const d = Math.sqrt(d2);
        const ux = dx / d, uy = dy / d;
        N[i].vx += ux * f; N[i].vy += uy * f;
        N[j].vx -= ux * f; N[j].vy -= uy * f;
      }
    }
    /* atração das arestas */
    for (const l of L) {
      const a = N[l.s], b = N[l.t];
      const dx = b.x - a.x, dy = b.y - a.y;
      const f = 0.012;
      a.vx += dx * f; a.vy += dy * f;
      b.vx -= dx * f; b.vy -= dy * f;
    }
    /* gravidade ao centro + integra */
    for (const n of N) {
      n.vx += (cx - n.x) * 0.006; n.vy += (cy - n.y) * 0.006;
      n.vx *= 0.86; n.vy *= 0.86;
      n.x += n.vx * alpha; n.y += n.vy * alpha;
    }
    alpha *= 0.985;
    draw();
    if (alpha > 0.02) raf = requestAnimationFrame(step);
  }

  function draw() {
    ctx.clearRect(0, 0, W, Hc);
    /* arestas */
    ctx.lineWidth = 0.5;
    for (const l of L) {
      const on = hover === l.s || hover === l.t;
      ctx.strokeStyle = on ? 'rgba(0,240,255,0.55)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(N[l.s].x, N[l.s].y); ctx.lineTo(N[l.t].x, N[l.t].y); ctx.stroke();
    }
    /* nós */
    for (let i = 0; i < N.length; i++) {
      const n = N[i];
      const dim = hover >= 0 && hover !== i && !adj[hover].has(i);
      ctx.globalAlpha = dim ? 0.2 : 1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color; ctx.fill();
      if (hover === i) { ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best = -1, bd = 14 * 14;
    for (let i = 0; i < N.length; i++) {
      const dx = N[i].x - mx, dy = N[i].y - my, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    if (best !== hover) {
      hover = best;
      if (best >= 0) {
        const n = N[best];
        tip.textContent = `${n.id} · ${n.loc} ln · importado ${n.importedBy}×`;
        tip.style.left = Math.min(mx + 12, W - 220) + 'px'; tip.style.top = (my + 12) + 'px';
        tip.style.display = 'block';
      } else tip.style.display = 'none';
      if (alpha <= 0.02) draw();
    }
  });
  canvas.addEventListener('mouseleave', () => { hover = -1; tip.style.display = 'none'; if (alpha <= 0.02) draw(); });

  /* inicia após o layout existir */
  setTimeout(() => { size(); step(); }, 60);
  window.addEventListener('resize', () => { size(); if (alpha <= 0.02) draw(); });

  return page;
}

function listCard(title, rows) {
  return h('div', { className: 'cod-list' },
    h('div', { className: 'cod-list__title' }, title),
    ...rows.map(([a, b]) => h('div', { className: 'cod-list__row' },
      h('span', { className: 'cod-list__a' }, a),
      h('span', { className: 'cod-list__b u-mono u-text-cyan' }, b))));
}
