/**
 * /codigo — Raio-X do Código (auto-análise, estilo GitNexus) — agora em 3D.
 * Lê src/data/codemap.json (gerado por scripts/gen-codemap.mjs) e desenha um
 * grafo force-directed 3D dos arquivos e seus imports, projetado em canvas com
 * rotação automática (arraste para girar), + métricas do próprio site.
 */

import { h, empty } from '../utils/helpers.js';
import codemap from '../data/codemap.json';
import { codeMemoryCounts } from '../utils/jarvis-brain.js';

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
        ' em 3D: cada esfera é um arquivo, cada linha é um import. ',
        'Arraste para girar · passe o mouse para destacar as conexões.'))
  );

  const m = codemap.meta;
  const memCounts = codeMemoryCounts(); /* arquivos comentados pelo JARVIS (auto-memória) */
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
  const commented = Object.keys(memCounts).length;
  if (commented) page.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 8px' } },
    `🧠 ${commented} arquivo(s) com memórias do JARVIS (halo roxo) — a auto-memória liga as conversas ao código.`));

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
  page.appendChild(buildLiveNexus());

  /* ===== Grafo 3D: força + projeção em perspectiva ===== */
  const N = codemap.nodes.map((n) => ({
    ...n, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
    r: Math.min(12, 3 + Math.sqrt(n.importedBy) * 1.7), color: colorOf(n.dir),
    mem: memCounts[n.id] || 0, sx: 0, sy: 0, sc: 1, zr: 0
  }));
  const idx = new Map(N.map((n, i) => [n.id, i]));
  const L = codemap.links.map((l) => ({ s: idx.get(l.source), t: idx.get(l.target) }))
    .filter((l) => l.s != null && l.t != null);
  const adj = N.map(() => new Set());
  for (const l of L) { adj[l.s].add(l.t); adj[l.t].add(l.s); }

  /* posições iniciais: esfera de Fibonacci (espalha bem em 3D) */
  const R0 = 150, GA = Math.PI * (1 + Math.sqrt(5));
  N.forEach((n, i) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / N.length);
    const th = GA * (i + 0.5);
    n.x = R0 * Math.sin(phi) * Math.cos(th);
    n.y = R0 * Math.sin(phi) * Math.sin(th);
    n.z = R0 * Math.cos(phi);
  });

  let W = 800, Hc = 520, dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d');
  const FOCAL = 620;
  let hover = -1, alpha = 1, raf = 0;
  let yaw = 0.6, pitch = -0.35, autoSpin = true;
  let dragging = false, lastX = 0, lastY = 0, moved = false;
  const order = N.map((_, i) => i);

  function size() {
    W = wrap.clientWidth || 800;
    canvas.width = W * dpr; canvas.height = Hc * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = Hc + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function forces() {
    /* repulsão 3D O(n²) */
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j];
        let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        let d2 = dx * dx + dy * dy + dz * dz || 0.01;
        const d = Math.sqrt(d2), f = 720 / d2;
        const ux = dx / d, uy = dy / d, uz = dz / d;
        a.vx += ux * f; a.vy += uy * f; a.vz += uz * f;
        b.vx -= ux * f; b.vy -= uy * f; b.vz -= uz * f;
      }
    }
    /* atração das arestas */
    for (const l of L) {
      const a = N[l.s], b = N[l.t];
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, f = 0.013;
      a.vx += dx * f; a.vy += dy * f; a.vz += dz * f;
      b.vx -= dx * f; b.vy -= dy * f; b.vz -= dz * f;
    }
    /* gravidade à origem + integra */
    for (const n of N) {
      n.vx += -n.x * 0.008; n.vy += -n.y * 0.008; n.vz += -n.z * 0.008;
      n.vx *= 0.85; n.vy *= 0.85; n.vz *= 0.85;
      n.x += n.vx * alpha; n.y += n.vy * alpha; n.z += n.vz * alpha;
    }
    alpha *= 0.99;
  }

  function project() {
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch), sinX = Math.sin(pitch);
    const cx = W / 2, cy = Hc / 2;
    for (const n of N) {
      /* rotação Y depois X */
      const x1 = n.x * cosY - n.z * sinY;
      const z1 = n.x * sinY + n.z * cosY;
      const y2 = n.y * cosX - z1 * sinX;
      const z2 = n.y * sinX + z1 * cosX;
      const sc = FOCAL / (FOCAL + z2);
      n.sx = cx + x1 * sc; n.sy = cy + y2 * sc; n.sc = sc; n.zr = z2;
    }
    order.sort((a, b) => N[b].zr - N[a].zr); /* longe primeiro */
  }

  function draw() {
    ctx.clearRect(0, 0, W, Hc);
    /* arestas */
    for (const l of L) {
      const a = N[l.s], b = N[l.t];
      const on = hover === l.s || hover === l.t;
      const front = Math.max(0, Math.min(1, ((a.sc + b.sc) / 2 - 0.6) / 0.7));
      ctx.lineWidth = on ? 1.3 : 0.5;
      ctx.strokeStyle = on ? 'rgba(0,240,255,0.6)' : `rgba(150,170,200,${0.04 + front * 0.10})`;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    }
    /* nós (já ordenados longe→perto) */
    for (const i of order) {
      const n = N[i];
      const dim = hover >= 0 && hover !== i && !adj[hover].has(i);
      const depth = Math.max(0.35, Math.min(1, (n.sc - 0.55) / 0.7));
      ctx.globalAlpha = dim ? 0.12 : depth;
      const rr = Math.max(1.5, n.r * n.sc);
      ctx.beginPath(); ctx.arc(n.sx, n.sy, rr, 0, Math.PI * 2);
      ctx.fillStyle = n.color; ctx.fill();
      if (n.mem && !dim) { /* halo roxo: arquivo com memórias do JARVIS */
        ctx.globalAlpha = depth; ctx.lineWidth = 1.5; ctx.strokeStyle = '#9b7bff';
        ctx.beginPath(); ctx.arc(n.sx, n.sy, rr + 3, 0, Math.PI * 2); ctx.stroke();
      }
      if (hover === i) { ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    if (alpha > 0.02) forces();
    if (autoSpin && !dragging) yaw += 0.0024;
    project();
    draw();
    raf = requestAnimationFrame(frame);
  }

  /* ===== interação ===== */
  function pick(mx, my) {
    let best = -1, bd = 16 * 16;
    /* de perto para longe (fim do order) para priorizar nós da frente */
    for (let k = order.length - 1; k >= 0; k--) {
      const i = order[k], n = N[i];
      const dx = n.sx - mx, dy = n.sy - my, d = dx * dx + dy * dy;
      const rr = Math.max(7, n.r * n.sc + 5);
      if (d < rr * rr && d < bd) { bd = d; best = i; break; }
    }
    return best;
  }
  canvas.addEventListener('mousedown', (e) => {
    dragging = true; moved = false;
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragging) {
      moved = true;
      yaw += (e.clientX - lastX) * 0.008;
      pitch += (e.clientY - lastY) * 0.008;
      pitch = Math.max(-1.4, Math.min(1.4, pitch));
      lastX = e.clientX; lastY = e.clientY;
    }
    const best = pick(mx, my);
    if (best !== hover) {
      hover = best;
      if (best >= 0) {
        const n = N[best];
        tip.textContent = `${n.id} · ${n.loc} ln · importado ${n.importedBy}×${n.mem ? ' · 🧠 ' + n.mem : ''}`;
        tip.style.left = Math.min(mx + 12, W - 220) + 'px'; tip.style.top = (my + 12) + 'px';
        tip.style.display = 'block';
      } else tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mouseleave', () => { hover = -1; tip.style.display = 'none'; });

  /* inicia após o layout existir */
  setTimeout(() => { size(); frame(); }, 60);
  const onResize = () => size();
  window.addEventListener('resize', onResize);

  /* limpeza ao sair do DOM (cancela rAF e listeners) */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(page)) {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return page;
}

function listCard(title, rows) {
  return h('div', { className: 'cod-list' },
    h('div', { className: 'cod-list__title' }, title),
    ...rows.map(([a, b]) => h('div', { className: 'cod-list__row' },
      h('span', { className: 'cod-list__a' }, a),
      h('span', { className: 'cod-list__b u-mono u-text-cyan' }, b))));
}

/* Git Nexus ao vivo: lê TODO o repo agora pela API do GitHub (não o codemap
 * pré-gerado) — reflete o estado atual, inclusive arquivos novos. (issue #189) */
function buildLiveNexus() {
  const REPO = 'Lucas-Belucci-Bellini/Projeto-Baluarte';
  const status = h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, '');
  const btn = h('button', { className: 'btn btn--ghost btn--sm', onclick: load }, '🛰️ Ler o repo ao vivo');
  const body = h('div', { style: { marginTop: '8px' } });
  const card = h('div', { className: 'cod-list', style: { marginTop: 'var(--space-md)' } },
    h('div', { className: 'cod-list__title', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
      h('span', null, '🗺️ Git Nexus ao vivo'), btn),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '4px 0' } },
      'Busca a árvore inteira do repositório agora pela API do GitHub (não o codemap pré-gerado), incluindo arquivos novos.'),
    status, body);

  async function load() {
    btn.disabled = true; status.textContent = ' buscando a árvore do repo…';
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render((data.tree || []).filter((t) => t.type === 'blob'));
      status.textContent = '';
    } catch {
      status.textContent = ' ⚠ não consegui ler o repo agora (limite da API pública do GitHub? tente daqui a pouco).';
    } finally { btn.disabled = false; }
  }

  function render(blobs) {
    empty(body);
    const totalKB = Math.round(blobs.reduce((s, b) => s + (b.size || 0), 0) / 1024);
    const byDir = {};
    for (const b of blobs) {
      const dir = b.path.includes('/') ? b.path.split('/')[0] : '(raiz)';
      (byDir[dir] = byDir[dir] || []).push(b);
    }
    const known = new Set((codemap.nodes || []).map((n) => n.id));
    body.appendChild(h('div', { className: 'cod-metrics', style: { marginBottom: 'var(--space-sm)' } },
      metric('arquivos (repo)', blobs.length),
      metric('KB totais', totalKB),
      metric('pastas', Object.keys(byDir).length),
      metric('no codemap', (codemap.meta || {}).files || 0)));
    for (const [dir, files] of Object.entries(byDir).sort((a, b) => b[1].length - a[1].length)) {
      files.sort((a, b) => (b.size || 0) - (a.size || 0));
      const det = h('details', { className: 'cod-list', style: { marginBottom: '6px' } },
        h('summary', { style: { cursor: 'pointer', fontWeight: '600' } }, `${dir} · ${files.length} arquivos`));
      for (const f of files) {
        const isNew = !known.has(f.path) && /\.(js|mjs)$/.test(f.path);
        det.appendChild(h('div', { className: 'cod-list__row' },
          h('span', { className: 'cod-list__a' }, f.path + (isNew ? '  🆕' : '')),
          h('span', { className: 'cod-list__b u-mono u-text-cyan' }, (Math.round((f.size || 0) / 102.4) / 10) + ' KB')));
      }
      body.appendChild(det);
    }
  }

  return card;
}
