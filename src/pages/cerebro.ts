/**
 * Página /cerebro — Segundo Cérebro do Baluarte.
 *
 * O grafo JSON e as memórias duráveis do JARVIS continuam alimentando a mesma
 * simulação Canvas, agora com nós, arestas e ciclo de vida estritamente tipados.
 */

import '../styles/cerebro.css';
import { h } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { router } from '../core/router.js';
import cerebro from '../data/cerebro.json';
import { getMemories } from '../utils/jarvis-brain.js';

interface GraphDataNode {
  readonly id: string;
  readonly label: string;
  readonly tipo: string;
  readonly rota?: string;
}

interface GraphDataLink {
  readonly source: string;
  readonly target: string;
}

interface ExtraGraph {
  readonly nodes: GraphDataNode[];
  readonly links: GraphDataLink[];
}

interface TypeMeta {
  readonly label: string;
  readonly cor: string;
  readonly r: number;
}

interface GraphNode extends GraphDataNode {
  r: number;
  cor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  deg: number;
}

interface GraphLink {
  readonly s: GraphNode;
  readonly t: GraphNode;
}

const TIPOS = cerebro.tipos as Record<string, TypeMeta>;

function memoryGraph(): ExtraGraph {
  const ids = new Set(cerebro.nodes.map((node) => node.id));
  const nodes: GraphDataNode[] = [];
  const links: GraphDataLink[] = [];
  getMemories().slice(0, 50).forEach((memory, index) => {
    const id = `mem-${memory.id || index}`;
    nodes.push({
      id,
      tipo: 'memoria',
      rota: '/memoria',
      label: memory.text.length > 22 ? `${memory.text.slice(0, 20)}…` : memory.text,
    });
    const concepts = (memory.conceptIds ?? []).filter((concept) => ids.has(concept));
    (concepts.length ? concepts : ['p-cerebro']).forEach((concept) => links.push({ source: id, target: concept }));
  });
  return { nodes, links };
}

function metric(value: number, label: string): HTMLDivElement {
  return h('div', { className: 'cer-metric' },
    h('div', { className: 'cer-metric__v' }, String(value)),
    h('div', { className: 'cer-metric__l' }, label),
  );
}

export function cerebroPage(): HTMLDivElement {
  const page = h('div', { className: 'page-cerebro' });
  page.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SEGUNDO CÉREBRO'),
  ),
  h('h1', { className: 'page-header__title' }, '🧠 Segundo Cérebro'),
  h('p', { className: 'page-header__description' }, cerebro.meta.desc, ' Clique num nó para abrir a página.'),
  ));

  const memory = memoryGraph();
  const domainCount = cerebro.nodes.filter((node) => node.tipo === 'dominio').length;
  page.appendChild(h('div', { className: 'cer-metrics' },
    metric(cerebro.nodes.length + memory.nodes.length, 'nós'),
    metric(cerebro.links.length + memory.links.length, 'conexões'),
    metric(domainCount, 'domínios'),
    metric(memory.nodes.length, 'memórias'),
  ));

  const legend = h('div', { className: 'cer-legend' });
  Object.values(TIPOS).forEach((type) => legend.appendChild(h('span', { className: 'cer-leg' },
    h('span', { className: 'cer-leg__dot', style: { background: type.cor } }), type.label,
  )));
  page.appendChild(legend);

  const wrap = h('div', { className: 'cer-graph' });
  const canvas = h('canvas', { className: 'cer-canvas' });
  const tip = h('div', { className: 'cer-tip' });
  wrap.append(canvas, tip);
  page.appendChild(wrap);
  page.appendChild(h('p', {
    className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' },
  },
  '🕸️ Este grafo é alimentado por ', h('span', { className: 'u-mono' }, 'src/data/cerebro.json'),
  ' — conforme o Baluarte cresce, o cérebro cresce junto.',
  ));

  requestAnimationFrame(() => initGraph(canvas, tip, memory, page));
  return page;
}

function initGraph(canvas: HTMLCanvasElement, tip: HTMLDivElement, extra: ExtraGraph, page: HTMLDivElement): void {
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) return;
  const context: CanvasRenderingContext2D = canvasContext;
  const dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  const sourceNodes: GraphDataNode[] = [...cerebro.nodes, ...extra.nodes];
  const sourceLinks: GraphDataLink[] = [...cerebro.links, ...extra.links];
  const idMap = new Map<string, GraphNode>();
  const nodes: GraphNode[] = sourceNodes.map((node) => {
    const type = TIPOS[node.tipo] ?? { r: 8, cor: '#8aa0bd', label: '' };
    const graphNode: GraphNode = {
      ...node, r: type.r, cor: type.cor, x: 0, y: 0, vx: 0, vy: 0, deg: 0,
    };
    idMap.set(node.id, graphNode);
    return graphNode;
  });
  const links: GraphLink[] = sourceLinks
    .map((link) => ({ s: idMap.get(link.source), t: idMap.get(link.target) }))
    .filter((link): link is GraphLink => Boolean(link.s && link.t));
  links.forEach((link) => { link.s.deg += 1; link.t.deg += 1; });

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2;
    const radius = node.tipo === 'dominio' ? 60 : 180 + (index % 5) * 24;
    node.x = width / 2 + Math.cos(angle) * radius;
    node.y = height / 2 + Math.sin(angle) * radius;
  });

  let alpha = 1;
  let hover: GraphNode | null = null;
  let dragging: GraphNode | null = null;
  const resizeObserver = new ResizeObserver(() => { resize(); alpha = Math.max(alpha, 0.4); });
  resizeObserver.observe(canvas);

  function step(): void {
    for (let index = 0; index < nodes.length; index += 1) {
      const first = nodes[index];
      for (let next = index + 1; next < nodes.length; next += 1) {
        const second = nodes[next];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distanceSquared = dx * dx + dy * dy || 0.01;
        const force = (520 * alpha) / distanceSquared;
        const distance = Math.sqrt(distanceSquared);
        const ux = dx / distance;
        const uy = dy / distance;
        first.vx += ux * force; first.vy += uy * force;
        second.vx -= ux * force; second.vy -= uy * force;
      }
    }
    links.forEach((link) => {
      const dx = link.t.x - link.s.x;
      const dy = link.t.y - link.s.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (distance - 96) * 0.016 * alpha;
      const ux = dx / distance;
      const uy = dy / distance;
      link.s.vx += ux * force; link.s.vy += uy * force;
      link.t.vx -= ux * force; link.t.vy -= uy * force;
    });
    nodes.forEach((node) => {
      node.vx += (width / 2 - node.x) * 0.006 * alpha;
      node.vy += (height / 2 - node.y) * 0.006 * alpha;
      if (node === dragging) { node.vx = 0; node.vy = 0; return; }
      node.x += node.vx; node.y += node.vy;
      node.vx *= 0.86; node.vy *= 0.86;
      node.x = Math.max(node.r + 4, Math.min(width - node.r - 4, node.x));
      node.y = Math.max(node.r + 4, Math.min(height - node.r - 4, node.y));
    });
    alpha = Math.max(alpha * 0.99, 0.02);
  }

  function neighbors(node: GraphNode): Set<GraphNode> {
    const result = new Set<GraphNode>([node]);
    links.forEach((link) => {
      if (link.s === node) result.add(link.t);
      if (link.t === node) result.add(link.s);
    });
    return result;
  }

  function draw(): void {
    context.clearRect(0, 0, width, height);
    const near = hover ? neighbors(hover) : null;
    links.forEach((link) => {
      const active = near && (link.s === hover || link.t === hover);
      context.strokeStyle = active ? 'rgba(212,162,78,0.5)' : 'rgba(255,255,255,0.07)';
      context.lineWidth = active ? 1.4 : 0.8;
      context.beginPath(); context.moveTo(link.s.x, link.s.y); context.lineTo(link.t.x, link.t.y); context.stroke();
    });
    nodes.forEach((node) => {
      const dimmed = near && node !== hover && !near.has(node);
      context.globalAlpha = dimmed ? 0.25 : 1;
      context.beginPath(); context.arc(node.x, node.y, node.r + (node === hover ? 3 : 0), 0, Math.PI * 2);
      context.fillStyle = node.cor;
      context.fill();
      if (node.tipo === 'dominio' || node.tipo === 'projeto') {
        context.fillStyle = dimmed ? 'rgba(200,210,225,0.4)' : '#dfe7f3';
        context.font = `${node.tipo === 'dominio' ? 12 : 10}px Inter, sans-serif`;
        context.textAlign = 'center';
        context.fillText(node.label, node.x, node.y - node.r - 5);
      }
    });
    context.globalAlpha = 1;
  }

  function pick(mouseX: number, mouseY: number): GraphNode | null {
    let best: GraphNode | null = null;
    let bestDistance = 16 * 16;
    nodes.forEach((node) => {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < bestDistance && distanceSquared < (node.r + 6) ** 2) {
        best = node;
        bestDistance = distanceSquared;
      }
    });
    return best;
  }

  let animationFrame = requestAnimationFrame(function loop(): void {
    step();
    draw();
    animationFrame = requestAnimationFrame(loop);
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (dragging) {
      dragging.x = mouseX; dragging.y = mouseY; alpha = Math.max(alpha, 0.3);
    }
    hover = pick(mouseX, mouseY);
    canvas.style.cursor = hover ? 'pointer' : 'crosshair';
    if (hover) {
      tip.style.display = 'block';
      tip.style.left = `${Math.min(mouseX + 12, width - 180)}px`;
      tip.style.top = `${mouseY + 12}px`;
      const type = TIPOS[hover.tipo];
      tip.innerHTML = `<b>${hover.label}</b><br><span style="color:${hover.cor}">${type?.label ?? ''}</span>${hover.rota ? ' · clique p/ abrir' : ''}`;
    } else tip.style.display = 'none';
  });
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    dragging = pick(event.clientX - rect.left, event.clientY - rect.top);
  });
  const onMouseUp = (): void => { dragging = null; };
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', () => { hover = null; tip.style.display = 'none'; });
  canvas.addEventListener('click', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const node = pick(event.clientX - rect.left, event.clientY - rect.top);
    if (node?.rota) router.navigate(node.rota);
  });

  aoSair(page, () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    window.removeEventListener('mouseup', onMouseUp);
  });
}
