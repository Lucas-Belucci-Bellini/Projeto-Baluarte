/**
 * /cerebro — Segundo Cérebro do Baluarte.
 *
 * Mapa de conhecimento (knowledge graph) que liga domínios, projetos,
 * conceitos e fontes do Mark XIII. Inspirado em ferramentas como o GitNexus,
 * mas 100% no navegador e alimentado pelos dados do próprio site
 * (src/data/cerebro.json). Clicar num nó com rota navega para a página.
 *
 * Omega Prism (Fatia 1, L1 Conhecimento): o operador cria NOTAS próprias que
 * viram nós no grafo (ligadas aos conceitos) e, logado, sincronizam com a CONTA
 * (Supabase, `knowledge_notes`) — cross-device. Deslogado segue 100% local.
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import cerebro from '../data/cerebro.json';
import { getMemories, linkConcepts } from '../utils/jarvis-brain.js';
import { listNotes, addNote, deleteNote, syncNotes, noteCount } from '../core/knowledge.js';
import { isLoggedIn } from '../core/supabase-auth.js';

const TIPOS = cerebro.tipos;
/* Estilos p/ nós que não vêm do cerebro.json: as NOTAS do operador e as
 * memórias do JARVIS. Entram na legenda e no desenho como tipos de 1ª classe. */
const EXTRA_TIPOS = {
  nota: { cor: '#ffce5a', r: 7, label: '📝 Nota (sua)' },
  memoria: { cor: '#7c8aa5', r: 5, label: '🧠 Memória' }
};
const STYLE = { ...TIPOS, ...EXTRA_TIPOS };

const CONCEPT_IDS = new Set(cerebro.nodes.map((n) => n.id));
function shorten(s, n = 22) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

/* Memórias do JARVIS entram no grafo como nós ligados aos seus conceitos. */
function memoryGraph() {
  const nodes = [], links = [];
  getMemories().slice(0, 50).forEach((m, i) => {
    const id = 'mem-' + (m.id || i);
    nodes.push({ id, tipo: 'memoria', rota: '/memoria', label: shorten(m.text) });
    const t = (m.conceptIds || []).filter((c) => CONCEPT_IDS.has(c));
    (t.length ? t : ['p-cerebro']).forEach((c) => links.push({ source: id, target: c }));
  });
  return { nodes, links };
}

/* Notas do operador (Segundo Cérebro) entram como nós ligados aos conceitos. */
function notesGraph() {
  const nodes = [], links = [];
  listNotes().slice(0, 80).forEach((nt, i) => {
    const id = 'nota-' + (nt.id || i);
    nodes.push({ id, tipo: 'nota', label: shorten(nt.title), nota: nt });
    const t = linkConcepts(nt.title + ' ' + (nt.body || '')).filter((c) => CONCEPT_IDS.has(c));
    (t.length ? t : ['p-cerebro']).forEach((c) => links.push({ source: id, target: c }));
  });
  return { nodes, links };
}

/* Junta memórias + notas num único "extra" para o grafo. */
function extraGraph() {
  const mg = memoryGraph(), ng = notesGraph();
  return { nodes: ng.nodes.concat(mg.nodes), links: ng.links.concat(mg.links), notes: ng.nodes.length, mems: mg.nodes.length };
}

export function cerebroPage() {
  const page = h('div', { className: 'page-cerebro' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SEGUNDO CÉREBRO')),
      h('h1', { className: 'page-header__title' }, '🧠 Segundo Cérebro'),
      h('p', { className: 'page-header__description' }, cerebro.meta.desc,
        ' Crie ', h('span', { className: 'u-text-cyan' }, 'notas'), ' — elas viram nós ligados aos conceitos. Clique num nó com rota para abrir a página.'))
  );

  /* ===== Compositor de notas (L1 Conhecimento por usuário) ===== */
  const titleEl = h('input', { className: 'mem-input', type: 'text', placeholder: 'Título da nota (ex.: "Mark XIII — doutrina de cerco")' });
  const bodyEl = h('textarea', {
    className: 'mem-input', rows: 2, style: { resize: 'vertical', minHeight: '38px', fontFamily: 'inherit' },
    placeholder: 'O que lembrar sobre isso… (opcional)'
  });
  const addBtn = h('button', { className: 'btn btn--primary', onclick: add }, '➕ Nota');
  titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') bodyEl.focus(); });
  const accountBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: isLoggedIn() ? 'Sincronizar as notas com a sua conta' : 'Entre no /perfil pra salvar na conta (cross-device)',
    onclick: async () => {
      if (!isLoggedIn()) {
        toast('Entre com sua conta no /perfil pra salvar o Segundo Cérebro na nuvem', { type: 'info' });
        router.navigate('/perfil');
        return;
      }
      accountBtn.disabled = true; accountBtn.textContent = '⏳…';
      const n = await syncNotes();
      refresh();
      accountBtn.disabled = false; accountBtn.textContent = '☁️ Conta';
      toast(`Conta: ${n} nota(s) na nuvem`, { type: 'success' });
    }
  }, '☁️ Conta');
  page.appendChild(
    h('div', { className: 'cer-compose', style: { background: 'var(--color-bg-elevated)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '8px' } },
      titleEl, bodyEl,
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, addBtn, accountBtn,
        h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'Logado, suas notas voltam em qualquer dispositivo.')))
  );

  /* Lista das notas do operador (com apagar). */
  const notesEl = h('div', { className: 'cer-notes', style: { marginBottom: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: '8px' } });
  page.appendChild(notesEl);

  /* Métricas (incluindo memórias e notas já ligadas ao cérebro) */
  const metrics = h('div', { className: 'cer-metrics' });
  page.appendChild(metrics);

  /* Legenda (tipos do cerebro.json + notas/memórias) */
  const legend = h('div', { className: 'cer-legend' });
  Object.values(STYLE).forEach((t) => {
    legend.appendChild(h('span', { className: 'cer-leg' },
      h('span', { className: 'cer-leg__dot', style: { background: t.cor } }), t.label));
  });
  page.appendChild(legend);

  /* Grafo (remontável quando as notas mudam) */
  const wrap = h('div', { className: 'cer-graph' });
  page.appendChild(wrap);
  let stopGraph = null;

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🕸️ Grafo alimentado por ', h('span', { className: 'u-mono' }, 'src/data/cerebro.json'),
      ' + suas ', h('span', { className: 'u-text-cyan' }, 'notas'), ' e memórias do JARVIS — conforme o Baluarte cresce, o cérebro cresce junto.')
  );

  function add() {
    const t = titleEl.value.trim();
    if (t.length < 2) { toast('Dê um título à nota', { type: 'warning' }); return; }
    addNote({ title: t, body: bodyEl.value.trim() });
    titleEl.value = ''; bodyEl.value = '';
    refresh();
    toast('Nota guardada 🧠', { type: 'success' });
    titleEl.focus();
  }

  function noteCard(nt) {
    return h('div', { className: 'cer-note', style: { background: 'var(--color-bg-elevated)', border: '1px solid rgba(255,206,90,0.25)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', maxWidth: '260px' } },
      h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '6px' } },
        h('span', { style: { color: '#ffce5a' } }, '📝'),
        h('b', { style: { fontSize: '13px' } }, nt.title),
        h('button', {
          className: 'mem-card__del', title: 'Apagar nota', style: { marginLeft: 'auto' },
          onclick: () => { deleteNote(nt.id); refresh(); toast('Nota apagada'); }
        }, '✕')),
      nt.body ? h('div', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: '3px' } }, shorten(nt.body, 90)) : null);
  }

  function mountGraph(extra) {
    if (stopGraph) { stopGraph(); stopGraph = null; }
    empty(wrap);
    const canvas = h('canvas', { className: 'cer-canvas' });
    const tip = h('div', { className: 'cer-tip' });
    wrap.appendChild(canvas);
    wrap.appendChild(tip);
    requestAnimationFrame(() => { stopGraph = initGraph(canvas, tip, extra); });
  }

  function refresh() {
    const ex = extraGraph();
    const nDom = cerebro.nodes.filter((n) => n.tipo === 'dominio').length;
    empty(metrics);
    metrics.append(
      metric(cerebro.nodes.length + ex.nodes.length, 'nós'),
      metric(cerebro.links.length + ex.links.length, 'conexões'),
      metric(ex.notes, 'notas'),
      metric(ex.mems, 'memórias'),
      metric(nDom, 'domínios'));

    const notes = listNotes();
    empty(notesEl);
    if (notes.length) {
      notesEl.append(...notes.slice(0, 40).map(noteCard));
    } else {
      notesEl.appendChild(h('div', { className: 'u-text-muted', style: { fontSize: '12px' } },
        'Nenhuma nota ainda. Escreva acima — vira um nó 📝 no grafo, ligado aos conceitos.'));
    }
    mountGraph(ex);
  }

  refresh();
  /* Sincroniza com a CONTA, se logado (Supabase, cross-device). */
  if (isLoggedIn()) syncNotes().then(() => refresh()).catch(() => {});
  return page;
}

function metric(v, l) {
  return h('div', { className: 'cer-metric' },
    h('div', { className: 'cer-metric__v' }, String(v)),
    h('div', { className: 'cer-metric__l' }, l));
}

function initGraph(canvas, tip, extra) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W = 0, H = 0;

  const srcNodes = cerebro.nodes.concat((extra && extra.nodes) || []);
  const srcLinks = cerebro.links.concat((extra && extra.links) || []);
  const idMap = new Map();
  const nodes = srcNodes.map((n, i) => {
    const o = {
      ...n,
      r: (STYLE[n.tipo] || {}).r || 8,
      cor: (STYLE[n.tipo] || {}).cor || '#8aa0bd',
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
      ctx.strokeStyle = on ? 'rgba(0,240,255,0.5)' : 'rgba(255,255,255,0.07)';
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
      if (n.tipo === 'dominio' || n.tipo === 'projeto' || n.tipo === 'nota') {
        ctx.fillStyle = dim ? 'rgba(200,210,225,0.4)' : (n.tipo === 'nota' ? '#ffce5a' : '#dfe7f3');
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
      /* Tooltip montado por DOM (textContent), NUNCA innerHTML: o label/corpo da
       * nota é conteúdo do usuário — innerHTML aqui seria XSS (CodeQL). */
      const t = STYLE[hover.tipo];
      const showBody = hover.tipo === 'nota' && hover.nota && hover.nota.body;
      empty(tip);
      tip.appendChild(h('span', null,
        h('b', null, hover.label),
        h('br', null),
        h('span', { style: { color: hover.cor } }, t ? t.label : ''),
        hover.rota ? ' · clique p/ abrir' : null,
        showBody ? h('br', null) : null,
        showBody ? h('span', { style: { color: '#9aa6b8' } }, shorten(hover.nota.body, 60)) : null
      ));
    } else {
      tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    dragging = pick(e.clientX - rect.left, e.clientY - rect.top);
  });
  const onUp = () => { dragging = null; };
  window.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', () => { hover = null; tip.style.display = 'none'; });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const n = pick(e.clientX - rect.left, e.clientY - rect.top);
    if (n && n.rota) router.navigate(n.rota);
  });

  /* Para o grafo: cancela o loop e solta os observers/listeners. */
  function stop() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    obs.disconnect();
    window.removeEventListener('mouseup', onUp);
  }

  /* Auto-limpa quando a página/canvas sai do DOM (navegação). */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(canvas)) stop();
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return stop;
}
