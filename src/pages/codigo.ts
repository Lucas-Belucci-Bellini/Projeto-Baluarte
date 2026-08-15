/**
 * /codigo — Raio-X do Código, grafo force-directed 3D do codemap do Baluarte.
 */

import '../styles/codigo.css';
import { h, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import codemap from '../data/codemap.json';
import { codeMemoryCounts } from '../utils/jarvis-brain.js';

interface CodeMapMeta {
  readonly files: number;
  readonly loc: number;
  readonly links: number;
  readonly dirs: number;
}

interface CodeMapNode {
  readonly id: string;
  readonly label: string;
  readonly dir?: string;
  readonly importedBy: number;
  readonly loc: number;
}

interface CodeMapLink {
  readonly source: string;
  readonly target: string;
}

interface CodeMapRankedNode {
  readonly label: string;
  readonly importedBy?: number;
  readonly loc?: number;
}

interface CodeMapData {
  readonly meta: CodeMapMeta;
  readonly nodes: readonly CodeMapNode[];
  readonly links: readonly CodeMapLink[];
  readonly byDir?: Readonly<Record<string, unknown>>;
  readonly topImported: readonly CodeMapRankedNode[];
  readonly topLoc: readonly CodeMapRankedNode[];
}

interface GraphNode extends CodeMapNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  color: string;
  mem: number;
  sx: number;
  sy: number;
  sc: number;
  zr: number;
}

interface IndexedLink {
  readonly s: number;
  readonly t: number;
}

interface GitBlob {
  readonly path: string;
  readonly type: 'blob';
  readonly size?: number;
}

interface GitTreeResponse {
  readonly tree?: readonly GitBlob[];
}

const graphData = codemap as unknown as CodeMapData;
const COLORS: Readonly<Record<string, string>> = {
  pages: '#ff3b8d',
  utils: '#ffaa00',
  data: '#00ff88',
  core: '#d4a24e',
  layout: '#b15dff',
  '(raiz)': '#8aa0bd',
};

function groupOf(directory: string | undefined): string {
  return (directory || '').split('/')[0] || '(raiz)';
}

function colorOf(directory: string | undefined): string {
  return COLORS[groupOf(directory)] || '#66ddff';
}

function metric(label: string, value: string | number): HTMLDivElement {
  return h('div', { className: 'cod-metric' },
    h('div', { className: 'cod-metric__v u-mono' }, value),
    h('div', { className: 'cod-metric__l u-text-muted' }, label));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isGitBlob(value: unknown): value is GitBlob {
  return isRecord(value) && value.type === 'blob' && typeof value.path === 'string'
    && (value.size === undefined || typeof value.size === 'number');
}

function listCard(title: string, rows: readonly (readonly [string, string | number])[]): HTMLDivElement {
  return h('div', { className: 'cod-list' },
    h('div', { className: 'cod-list__title' }, title),
    ...rows.map(([label, value]) => h('div', { className: 'cod-list__row' },
      h('span', { className: 'cod-list__a' }, label),
      h('span', { className: 'cod-list__b u-mono u-text-cyan' }, value))));
}

export function codigoPage(): HTMLDivElement {
  const page = h('div', { className: 'page-codigo' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CÓDIGO')),
      h('h1', { className: 'page-header__title' }, '🔬 Raio-X do Código'),
      h('p', { className: 'page-header__description' },
        'O site analisa o ', h('span', { className: 'u-text-cyan' }, 'próprio código'),
        ' em 3D: cada esfera é um arquivo, cada linha é um import. ',
        'Arraste para girar · passe o mouse para destacar as conexões.'),
    ),
  );
  const memoryCounts = codeMemoryCounts();
  page.appendChild(h('div', { className: 'cod-metrics' },
    metric('arquivos', graphData.meta.files),
    metric('linhas', graphData.meta.loc.toLocaleString('pt-BR')),
    metric('imports', graphData.meta.links),
    metric('pastas', graphData.meta.dirs)));
  const legend = h('div', { className: 'cod-legend' });
  Object.entries(COLORS).forEach(([group, color]) => {
    if (!graphData.byDir || !Object.keys(graphData.byDir).some((directory) => groupOf(directory) === group)) return;
    legend.appendChild(h('span', { className: 'cod-leg' },
      h('span', { className: 'cod-leg__dot', style: { background: color } }), group));
  });
  page.appendChild(legend);
  const commented = Object.keys(memoryCounts).length;
  if (commented) page.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 8px' } },
    `🧠 ${commented} arquivo(s) com memórias do JARVIS (halo roxo) — a auto-memória liga as conversas ao código.`));

  const wrapper = h('div', { className: 'cod-graph' });
  const canvas = h('canvas', { className: 'cod-canvas' });
  const tip = h('div', { className: 'cod-tip' });
  wrapper.append(canvas, tip);
  page.appendChild(wrapper);
  const lists = h('div', { className: 'cod-lists' });
  lists.appendChild(listCard('★ Mais importados', graphData.topImported.map((node) => [node.label, `${node.importedBy ?? 0}×`])));
  lists.appendChild(listCard('▦ Maiores arquivos', graphData.topLoc.map((node) => [node.label, `${node.loc ?? 0} ln`])));
  page.appendChild(lists);
  page.appendChild(buildLiveNexus());

  const nodes: GraphNode[] = graphData.nodes.map((node) => ({
    ...node,
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
    r: Math.min(12, 3 + Math.sqrt(node.importedBy) * 1.7),
    color: colorOf(node.dir),
    mem: memoryCounts[node.id] || 0,
    sx: 0, sy: 0, sc: 1, zr: 0,
  }));
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const links: IndexedLink[] = graphData.links
    .map((link) => ({ s: indexById.get(link.source), t: indexById.get(link.target) }))
    .filter((link): link is IndexedLink => link.s !== undefined && link.t !== undefined);
  const adjacency: Set<number>[] = nodes.map(() => new Set<number>());
  links.forEach((link) => {
    adjacency[link.s].add(link.t);
    adjacency[link.t].add(link.s);
  });
  const radius = 150;
  const goldenAngle = Math.PI * (1 + Math.sqrt(5));
  nodes.forEach((node, index) => {
    const phi = Math.acos(1 - 2 * (index + 0.5) / Math.max(1, nodes.length));
    const theta = goldenAngle * (index + 0.5);
    node.x = radius * Math.sin(phi) * Math.cos(theta);
    node.y = radius * Math.sin(phi) * Math.sin(theta);
    node.z = radius * Math.cos(phi);
  });

  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) return page;
  const context: CanvasRenderingContext2D = canvasContext;
  let width = 800;
  const height = 520;
  let devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
  const focal = 620;
  let hover = -1;
  let alpha = 1;
  let animationFrame = 0;
  let yaw = 0.6;
  let pitch = -0.35;
  let autoSpin = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let moved = false;
  const order = nodes.map((_, index) => index);

  function size(): void {
    width = wrapper.clientWidth || 800;
    devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function forces(): void {
    for (let first = 0; first < nodes.length; first += 1) {
      const a = nodes[first];
      for (let second = first + 1; second < nodes.length; second += 1) {
        const b = nodes[second];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const distanceSquared = dx * dx + dy * dy + dz * dz || 0.01;
        const distance = Math.sqrt(distanceSquared);
        const force = 720 / distanceSquared;
        a.vx += (dx / distance) * force;
        a.vy += (dy / distance) * force;
        a.vz += (dz / distance) * force;
        b.vx -= (dx / distance) * force;
        b.vy -= (dy / distance) * force;
        b.vz -= (dz / distance) * force;
      }
    }
    links.forEach((link) => {
      const a = nodes[link.s];
      const b = nodes[link.t];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const force = 0.013;
      a.vx += dx * force; a.vy += dy * force; a.vz += dz * force;
      b.vx -= dx * force; b.vy -= dy * force; b.vz -= dz * force;
    });
    nodes.forEach((node) => {
      node.vx += -node.x * 0.008;
      node.vy += -node.y * 0.008;
      node.vz += -node.z * 0.008;
      node.vx *= 0.85; node.vy *= 0.85; node.vz *= 0.85;
      node.x += node.vx * alpha;
      node.y += node.vy * alpha;
      node.z += node.vz * alpha;
    });
    alpha *= 0.99;
  }

  function project(): void {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const centerX = width / 2;
    const centerY = height / 2;
    nodes.forEach((node) => {
      const rotatedX = node.x * cosYaw - node.z * sinYaw;
      const rotatedZ = node.x * sinYaw + node.z * cosYaw;
      const rotatedY = node.y * cosPitch - rotatedZ * sinPitch;
      const depthZ = node.y * sinPitch + rotatedZ * cosPitch;
      const scale = focal / (focal + depthZ);
      node.sx = centerX + rotatedX * scale;
      node.sy = centerY + rotatedY * scale;
      node.sc = scale;
      node.zr = depthZ;
    });
    order.sort((left, right) => nodes[right].zr - nodes[left].zr);
  }

  function draw(): void {
    context.clearRect(0, 0, width, height);
    links.forEach((link) => {
      const a = nodes[link.s];
      const b = nodes[link.t];
      const highlighted = hover === link.s || hover === link.t;
      const front = Math.max(0, Math.min(1, ((a.sc + b.sc) / 2 - 0.6) / 0.7));
      context.lineWidth = highlighted ? 1.3 : 0.5;
      context.strokeStyle = highlighted ? 'rgba(212,162,78,0.6)' : `rgba(150,170,200,${0.04 + front * 0.10})`;
      context.beginPath();
      context.moveTo(a.sx, a.sy);
      context.lineTo(b.sx, b.sy);
      context.stroke();
    });
    order.forEach((index) => {
      const node = nodes[index];
      const dimmed = hover >= 0 && hover !== index && !adjacency[hover].has(index);
      const depth = Math.max(0.35, Math.min(1, (node.sc - 0.55) / 0.7));
      context.globalAlpha = dimmed ? 0.12 : depth;
      const nodeRadius = Math.max(1.5, node.r * node.sc);
      context.beginPath();
      context.arc(node.sx, node.sy, nodeRadius, 0, Math.PI * 2);
      context.fillStyle = node.color;
      context.fill();
      if (node.mem && !dimmed) {
        context.globalAlpha = depth;
        context.lineWidth = 1.5;
        context.strokeStyle = '#9b7bff';
        context.beginPath();
        context.arc(node.sx, node.sy, nodeRadius + 3, 0, Math.PI * 2);
        context.stroke();
      }
      if (hover === index) {
        context.globalAlpha = 1;
        context.lineWidth = 2;
        context.strokeStyle = '#fff';
        context.stroke();
      }
    });
    context.globalAlpha = 1;
  }

  function frame(): void {
    if (alpha > 0.02) forces();
    if (autoSpin && !dragging) yaw += 0.0024;
    project();
    draw();
    animationFrame = requestAnimationFrame(frame);
  }

  function pick(mouseX: number, mouseY: number): number {
    let best = -1;
    let bestDistance = 16 * 16;
    for (let index = order.length - 1; index >= 0; index -= 1) {
      const nodeIndex = order[index];
      const node = nodes[nodeIndex];
      const dx = node.sx - mouseX;
      const dy = node.sy - mouseY;
      const distance = dx * dx + dy * dy;
      const nodeRadius = Math.max(7, node.r * node.sc + 5);
      if (distance < nodeRadius * nodeRadius && distance < bestDistance) {
        bestDistance = distance;
        best = nodeIndex;
        break;
      }
    }
    return best;
  }

  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    dragging = true;
    moved = false;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  const onMouseUp = (): void => { dragging = false; };
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (dragging) {
      moved = true;
      yaw += (event.clientX - lastX) * 0.008;
      pitch = Math.max(-1.4, Math.min(1.4, pitch + (event.clientY - lastY) * 0.008));
      lastX = event.clientX;
      lastY = event.clientY;
    }
    const best = pick(mouseX, mouseY);
    if (best === hover) return;
    hover = best;
    if (best >= 0) {
      const node = nodes[best];
      tip.textContent = `${node.id} · ${node.loc} ln · importado ${node.importedBy}×${node.mem ? ` · 🧠 ${node.mem}` : ''}`;
      tip.style.left = `${Math.min(mouseX + 12, width - 220)}px`;
      tip.style.top = `${mouseY + 12}px`;
      tip.style.display = 'block';
    } else {
      tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mouseleave', () => {
    hover = -1;
    tip.style.display = 'none';
  });
  const onResize = (): void => size();
  setTimeout(() => { size(); frame(); }, 60);
  window.addEventListener('resize', onResize);
  aoSair(page, () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mouseup', onMouseUp);
    autoSpin = false;
    moved = false;
  });
  return page;
}

function buildLiveNexus(): HTMLDivElement {
  const repository = 'Lucas-Belucci-Bellini/Projeto-Baluarte';
  const status = h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, '');
  const body = h('div', { style: { marginTop: '8px' } });
  const button = h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { void load(); } }, '🛰️ Ler o repo ao vivo');
  const card = h('div', { className: 'cod-list', style: { marginTop: 'var(--space-md)' } },
    h('div', { className: 'cod-list__title', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
      h('span', null, '🗺️ Git Nexus ao vivo'), button),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '4px 0' } },
      'Busca a árvore inteira do repositório agora pela API do GitHub (não o codemap pré-gerado), incluindo arquivos novos.'),
    status, body);

  async function load(): Promise<void> {
    button.disabled = true;
    status.textContent = ' buscando a árvore do repo…';
    try {
      const response = await fetch(`https://api.github.com/repos/${repository}/git/trees/main?recursive=1`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const value: unknown = await response.json();
      const data = isRecord(value) ? value as GitTreeResponse : {};
      const blobs = Array.isArray(data.tree) ? data.tree.filter(isGitBlob) : [];
      render(blobs);
      status.textContent = '';
    } catch {
      status.textContent = ' ⚠ não consegui ler o repo agora (limite da API pública do GitHub? tente daqui a pouco).';
    } finally {
      button.disabled = false;
    }
  }

  function render(blobs: readonly GitBlob[]): void {
    empty(body);
    const totalKilobytes = Math.round(blobs.reduce((sum, blob) => sum + (blob.size || 0), 0) / 1024);
    const byDirectory: Record<string, GitBlob[]> = {};
    blobs.forEach((blob) => {
      const directory = blob.path.includes('/') ? blob.path.split('/')[0] : '(raiz)';
      (byDirectory[directory] ||= []).push(blob);
    });
    const known = new Set(graphData.nodes.map((node) => node.id));
    body.appendChild(h('div', { className: 'cod-metrics', style: { marginBottom: 'var(--space-sm)' } },
      metric('arquivos (repo)', blobs.length),
      metric('KB totais', totalKilobytes),
      metric('pastas', Object.keys(byDirectory).length),
      metric('no codemap', graphData.meta.files)));
    Object.entries(byDirectory).sort((first, second) => second[1].length - first[1].length).forEach(([directory, files]) => {
      files.sort((first, second) => (second.size || 0) - (first.size || 0));
      const details = h('details', { className: 'cod-list', style: { marginBottom: '6px' } },
        h('summary', { style: { cursor: 'pointer', fontWeight: '600' } }, `${directory} · ${files.length} arquivos`));
      files.forEach((file) => {
        const isNew = !known.has(file.path) && /\.(js|mjs)$/.test(file.path);
        details.appendChild(h('div', { className: 'cod-list__row' },
          h('span', { className: 'cod-list__a' }, `${file.path}${isNew ? '  🆕' : ''}`),
          h('span', { className: 'cod-list__b u-mono u-text-cyan' }, `${Math.round((file.size || 0) / 102.4) / 10} KB`)));
      });
      body.appendChild(details);
    });
  }
  return card;
}
