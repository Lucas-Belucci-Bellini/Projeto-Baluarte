/**
 * Página /logic-sim — Simulador de Lógica Digital.
 *
 * A UI Canvas permanece interativa: componentes podem ser adicionados,
 * arrastados, conectados, apagados e simulados em tempo real. A engine V1
 * continua na fronteira declarada em logic-sim-engine.d.ts.
 */

import '../styles/logic-sim.css';
import { h, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  GATES,
  PALETTE,
  createCircuit,
  addComponent,
  removeComponent,
  addWire,
  removeWire,
  simulate,
  inputValues,
  serialize,
  deserialize,
} from '../utils/logic-sim-engine.js';
import type {
  GateType,
  LogicCircuit,
  LogicComponent,
  LogicWire,
} from '../utils/logic-sim-engine.js';

const STORAGE_KEY = 'logic-sim:circuit';
const CW = 1000;
const CH = 560;
const W = 80;
const H = 52;
const PR = 7;

type Tool = 'wire' | 'erase';
type ExampleKey = 'and' | 'half-adder' | 'sr-latch' | 'd-ff';

interface DragState {
  comp: LogicComponent;
  dx: number;
  dy: number;
  moved: boolean;
}

interface WiringState {
  from: string;
  fromPort: number;
  mx: number;
  my: number;
}

interface PortHit {
  comp: LogicComponent;
  port: number;
}

let circuit: LogicCircuit = createCircuit();
let tool: Tool = 'wire';
let drag: DragState | null = null;
let wiring: WiringState | null = null;
let addCount = 0;
let frame = 0;

function inPortPos(component: LogicComponent, port: number): { x: number; y: number } {
  const definition = GATES[component.type];
  if (definition.ins <= 1) return { x: component.x, y: component.y + H / 2 };
  return { x: component.x, y: component.y + (H * (port + 1)) / (definition.ins + 1) };
}

function outPortPos(component: LogicComponent, port = 0): { x: number; y: number } {
  const definition = GATES[component.type];
  if (definition.outs <= 1) return { x: component.x + W, y: component.y + H / 2 };
  return { x: component.x + W, y: component.y + (H * (port + 1)) / (definition.outs + 1) };
}

function componentAt(x: number, y: number): LogicComponent | null {
  for (let index = circuit.comps.length - 1; index >= 0; index -= 1) {
    const component = circuit.comps[index];
    if (x >= component.x && x <= component.x + W && y >= component.y && y <= component.y + H) return component;
  }
  return null;
}

function outPortAt(x: number, y: number): PortHit | null {
  for (const component of circuit.comps) {
    const definition = GATES[component.type];
    for (let port = 0; port < definition.outs; port += 1) {
      const position = outPortPos(component, port);
      if ((x - position.x) ** 2 + (y - position.y) ** 2 <= (PR + 5) ** 2) return { comp: component, port };
    }
  }
  return null;
}

function inPortAt(x: number, y: number): PortHit | null {
  for (const component of circuit.comps) {
    const definition = GATES[component.type];
    for (let port = 0; port < definition.ins; port += 1) {
      const position = inPortPos(component, port);
      if ((x - position.x) ** 2 + (y - position.y) ** 2 <= (PR + 5) ** 2) return { comp: component, port };
    }
  }
  return null;
}

function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function wireAt(x: number, y: number): LogicWire | null {
  const byId = new Map(circuit.comps.map((component) => [component.id, component]));
  for (const wire of circuit.wires) {
    const from = byId.get(wire.from);
    const to = byId.get(wire.to);
    if (!from || !to) continue;
    const start = outPortPos(from, wire.fromPort);
    const end = inPortPos(to, wire.toPort);
    if (distanceToSegment(x, y, start.x, start.y, end.x, end.y) < 7) return wire;
  }
  return null;
}

function save(): void {
  storage.set(STORAGE_KEY, serialize(circuit));
  setStatus('logicSim', { componentes: circuit.comps.length, fios: circuit.wires.length });
}

function colorFor(on: boolean | undefined): string {
  return on ? '#d4a24e' : '#3a4358';
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function draw(context: CanvasRenderingContext2D): void {
  context.clearRect(0, 0, CW, CH);
  context.strokeStyle = 'rgba(255,255,255,0.035)';
  context.lineWidth = 1;
  for (let gridX = 0; gridX <= CW; gridX += 28) {
    context.beginPath(); context.moveTo(gridX, 0); context.lineTo(gridX, CH); context.stroke();
  }
  for (let gridY = 0; gridY <= CH; gridY += 28) {
    context.beginPath(); context.moveTo(0, gridY); context.lineTo(CW, gridY); context.stroke();
  }

  const byId = new Map(circuit.comps.map((component) => [component.id, component]));
  context.lineWidth = 2.5;
  for (const wire of circuit.wires) {
    const from = byId.get(wire.from);
    const to = byId.get(wire.to);
    if (!from || !to) continue;
    const start = outPortPos(from, wire.fromPort);
    const end = inPortPos(to, wire.toPort);
    context.strokeStyle = colorFor(from.values?.[wire.fromPort]);
    context.beginPath();
    context.moveTo(start.x, start.y);
    const middleX = (start.x + end.x) / 2;
    context.bezierCurveTo(middleX, start.y, middleX, end.y, end.x, end.y);
    context.stroke();
  }

  if (wiring) {
    const from = byId.get(wiring.from);
    if (from) {
      const start = outPortPos(from, wiring.fromPort);
      context.strokeStyle = '#ffaa00';
      context.setLineDash([6, 4]);
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(wiring.mx, wiring.my);
      context.stroke();
      context.setLineDash([]);
    }
  }

  for (const component of circuit.comps) {
    const definition = GATES[component.type];
    const inputs = inputValues(circuit, component);
    const lit = component.type === 'OUT' ? inputs[0] : !!component.values?.[0];
    context.fillStyle = lit ? 'rgba(212,162,78,0.14)' : 'rgba(20,26,38,0.96)';
    context.strokeStyle = lit ? '#d4a24e' : '#46506a';
    context.lineWidth = drag?.comp === component ? 3 : 1.6;
    roundRect(context, component.x, component.y, W, H, 8);
    context.fill();
    context.stroke();

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if (component.type === 'IN') {
      context.fillStyle = component.on ? '#d4a24e' : '#9aa6bd';
      context.font = 'bold 24px monospace';
      context.fillText(component.on ? '1' : '0', component.x + W / 2, component.y + H / 2 + 1);
    } else if (component.type === 'OUT') {
      context.beginPath();
      context.arc(component.x + W / 2, component.y + H / 2, 13, 0, Math.PI * 2);
      context.fillStyle = lit ? '#d4a24e' : '#2a3142';
      context.fill();
      context.strokeStyle = lit ? '#aef6ff' : '#46506a';
      context.lineWidth = 2;
      context.stroke();
    } else if (component.type === 'CLOCK') {
      context.fillStyle = component.on ? '#d4a24e' : '#9aa6bd';
      context.font = 'bold 13px monospace';
      context.fillText(`CLK ${component.on ? '1' : '0'}`, component.x + W / 2, component.y + H / 2 + 1);
    } else if (definition.kind !== 'ff') {
      context.fillStyle = '#dfe6f5';
      context.font = 'bold 14px monospace';
      context.fillText(definition.label, component.x + W / 2, component.y + H / 2 + 1);
    }

    for (let port = 0; port < definition.ins; port += 1) {
      const position = inPortPos(component, port);
      context.beginPath();
      context.arc(position.x, position.y, PR, 0, Math.PI * 2);
      context.fillStyle = colorFor(inputs[port]);
      context.fill();
      context.strokeStyle = '#0b0e16';
      context.lineWidth = 1.5;
      context.stroke();
    }
    for (let port = 0; port < definition.outs; port += 1) {
      const position = outPortPos(component, port);
      context.beginPath();
      context.arc(position.x, position.y, PR, 0, Math.PI * 2);
      context.fillStyle = colorFor(component.values?.[port]);
      context.fill();
      context.strokeStyle = '#0b0e16';
      context.lineWidth = 1.5;
      context.stroke();
    }

    if (definition.kind === 'ff') {
      context.font = '9px monospace';
      context.fillStyle = '#8b97ad';
      context.textBaseline = 'middle';
      context.textAlign = 'left';
      (definition.inLabels ?? []).forEach((label, port) => {
        const position = inPortPos(component, port);
        context.fillText(label, component.x + 8, position.y);
      });
      context.textAlign = 'right';
      (definition.outLabels ?? []).forEach((label, port) => {
        const position = outPortPos(component, port);
        context.fillText(label, component.x + W - 8, position.y);
      });
      context.textAlign = 'center';
    }
  }
}

function buildExample(key: ExampleKey): LogicCircuit {
  const example = createCircuit();
  if (key === 'and') {
    const a = addComponent(example, 'IN', 70, 130);
    const b = addComponent(example, 'IN', 70, 320);
    const gate = addComponent(example, 'AND', 360, 210);
    const output = addComponent(example, 'OUT', 640, 224);
    addWire(example, a.id, 0, gate.id, 0);
    addWire(example, b.id, 0, gate.id, 1);
    addWire(example, gate.id, 0, output.id, 0);
  } else if (key === 'half-adder') {
    const a = addComponent(example, 'IN', 70, 120);
    const b = addComponent(example, 'IN', 70, 330);
    const xor = addComponent(example, 'XOR', 380, 150);
    const and = addComponent(example, 'AND', 380, 320);
    const sum = addComponent(example, 'OUT', 680, 164);
    const carry = addComponent(example, 'OUT', 680, 334);
    addWire(example, a.id, 0, xor.id, 0);
    addWire(example, b.id, 0, xor.id, 1);
    addWire(example, a.id, 0, and.id, 0);
    addWire(example, b.id, 0, and.id, 1);
    addWire(example, xor.id, 0, sum.id, 0);
    addWire(example, and.id, 0, carry.id, 0);
  } else if (key === 'sr-latch') {
    const set = addComponent(example, 'IN', 70, 120);
    const reset = addComponent(example, 'IN', 70, 360);
    const first = addComponent(example, 'NOR', 360, 150);
    const second = addComponent(example, 'NOR', 360, 330);
    const q = addComponent(example, 'OUT', 660, 164);
    const qn = addComponent(example, 'OUT', 660, 344);
    addWire(example, set.id, 0, first.id, 0);
    addWire(example, second.id, 0, first.id, 1);
    addWire(example, first.id, 0, second.id, 0);
    addWire(example, reset.id, 0, second.id, 1);
    addWire(example, first.id, 0, q.id, 0);
    addWire(example, second.id, 0, qn.id, 0);
  } else {
    const data = addComponent(example, 'IN', 70, 120);
    const clock = addComponent(example, 'CLOCK', 70, 340);
    const flipFlop = addComponent(example, 'DFF', 380, 210);
    const q = addComponent(example, 'OUT', 700, 190);
    const qn = addComponent(example, 'OUT', 700, 320);
    addWire(example, data.id, 0, flipFlop.id, 0);
    addWire(example, clock.id, 0, flipFlop.id, 1);
    addWire(example, flipFlop.id, 0, q.id, 0);
    addWire(example, flipFlop.id, 1, qn.id, 0);
  }
  return example;
}

export function logicSimPage(): HTMLDivElement {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  circuit = deserialize(saved) ?? buildExample('and');
  tool = 'wire';
  drag = null;
  wiring = null;
  addCount = 0;

  const page = h('div', { className: 'page-logic-sim' });
  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'LOGIC SIM'),
    ),
    h('h1', { className: 'page-header__title' }, '⊻ Simulador de Lógica Digital'),
    h('p', { className: 'page-header__description' },
      'Coloque componentes, ligue saída → entrada com fios e veja os sinais propagarem em tempo real. 14 portas lógicas + ',
      h('span', { className: 'u-text-cyan' }, 'flip-flops D, JK e T'),
      ' (lógica sequencial disparada na borda do clock). Salve e reabra seus circuitos.',
    ),
  ));

  const canvas = h('canvas', { className: 'lsim-canvas' });
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) {
    page.appendChild(h('p', { className: 'lsim-hint u-text-muted' }, 'Canvas 2D indisponível neste navegador.'));
    return page;
  }
  const context: CanvasRenderingContext2D = canvasContext;
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CW * devicePixelRatio;
  canvas.height = CH * devicePixelRatio;
  canvas.style.width = `${CW}px`;
  canvas.style.height = `${CH}px`;
  context.scale(devicePixelRatio, devicePixelRatio);

  const palette = h('div', { className: 'lsim-group' });
  PALETTE.forEach((type: GateType) => {
    palette.appendChild(h('button', {
      className: 'lsim-palette-btn',
      title: `Adicionar ${type}`,
      onclick: () => {
        addCount += 1;
        const x = 120 + (addCount % 6) * 26;
        const y = 90 + (addCount % 6) * 26;
        addComponent(circuit, type, x, y);
        save();
      },
    }, GATES[type].label));
  });

  function toolButton(id: Tool, label: string): HTMLButtonElement {
    return h('button', {
      className: `lsim-tool-btn${tool === id ? ' is-active' : ''}`,
      'data-tool': id,
      onclick: () => {
        tool = id;
        document.querySelectorAll('.lsim-tool-btn').forEach((button) => {
          if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.tool === id);
        });
      },
    }, label);
  }

  function exampleButton(key: ExampleKey, label: string): HTMLButtonElement {
    return h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => {
        circuit = buildExample(key);
        save();
        toast(`Exemplo carregado: ${label}`, { type: 'info' });
      },
    }, label);
  }

  const savedKey = 'logic-sim:saved';
  function getSaved(): Record<string, unknown> {
    const value: unknown = storage.get<unknown>(savedKey);
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  const savedSelect = h('select', { className: 'lsim-select input', 'aria-label': 'Circuito salvo' });
  function refreshSaved(): void {
    empty(savedSelect);
    savedSelect.appendChild(h('option', { value: '' }, '⭱ Abrir salvo…'));
    Object.keys(getSaved()).sort().forEach((name) => savedSelect.appendChild(h('option', { value: name }, name)));
  }
  savedSelect.onchange = () => {
    const name = savedSelect.value;
    savedSelect.value = '';
    if (!name) return;
    const loaded = deserialize(getSaved()[name]);
    if (loaded) {
      circuit = loaded;
      save();
      toast(`Circuito aberto: ${name}`, { type: 'info' });
    } else {
      toast('Não foi possível abrir o circuito', { type: 'danger' });
    }
  };
  refreshSaved();

  const saveButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const name = prompt('Nome para salvar este circuito:');
      if (!name || !name.trim()) return;
      const saved = getSaved();
      saved[name.trim()] = serialize(circuit);
      storage.set(savedKey, saved);
      refreshSaved();
      toast(`Circuito salvo: ${name.trim()}`, { type: 'success' });
    },
  }, '⭳ Salvar');

  page.appendChild(h('div', { className: 'lsim-bar' },
    palette,
    h('div', { className: 'lsim-group' }, toolButton('wire', '✋ Mover / Ligar'), toolButton('erase', '✕ Apagar')),
    h('div', { className: 'lsim-group' },
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => { circuit = createCircuit(); save(); toast('Canvas limpo', { type: 'info' }); },
      }, '⌫ Limpar'),
      exampleButton('and', 'AND'), exampleButton('half-adder', 'Meio-somador'),
      exampleButton('sr-latch', 'Trava SR'), exampleButton('d-ff', 'D Flip-Flop'),
    ),
    h('div', { className: 'lsim-group' }, saveButton, savedSelect),
  ));
  page.appendChild(h('div', { className: 'lsim-canvas-wrap' }, canvas));
  page.appendChild(h('p', { className: 'lsim-hint u-text-muted' },
    'Clique numa porta da paleta para adicioná-la · arraste os componentes · clique no port de saída (●) e solte num port de entrada para criar um fio · clique numa entrada IN para alterná-la (0/1) · ferramenta Apagar remove peças e fios.',
  ));

  function mousePosition(event: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (CW / rect.width), y: (event.clientY - rect.top) * (CH / rect.height) };
  }

  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    const { x, y } = mousePosition(event);
    if (tool === 'erase') {
      const component = componentAt(x, y);
      if (component) { removeComponent(circuit, component.id); save(); return; }
      const wire = wireAt(x, y);
      if (wire) { removeWire(circuit, wire.id); save(); }
      return;
    }
    const output = outPortAt(x, y);
    if (output) {
      wiring = { from: output.comp.id, fromPort: output.port, mx: x, my: y };
      return;
    }
    const component = componentAt(x, y);
    if (component) drag = { comp: component, dx: x - component.x, dy: y - component.y, moved: false };
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const { x, y } = mousePosition(event);
    if (drag) {
      const nextX = Math.max(0, Math.min(CW - W, x - drag.dx));
      const nextY = Math.max(0, Math.min(CH - H, y - drag.dy));
      if (Math.abs(nextX - drag.comp.x) > 1 || Math.abs(nextY - drag.comp.y) > 1) drag.moved = true;
      drag.comp.x = nextX;
      drag.comp.y = nextY;
    } else if (wiring) {
      wiring.mx = x;
      wiring.my = y;
    }
  });

  const onUp = (event: MouseEvent): void => {
    if (!canvas.isConnected) return;
    const { x, y } = mousePosition(event);
    if (wiring) {
      const input = inPortAt(x, y);
      if (input) {
        addWire(circuit, wiring.from, wiring.fromPort, input.comp.id, input.port);
        save();
      }
      wiring = null;
    }
    if (drag) {
      if (!drag.moved && drag.comp.type === 'IN') drag.comp.on = !drag.comp.on;
      else if (drag.moved) save();
      drag = null;
    }
  };
  window.addEventListener('mouseup', onUp);

  const loop = window.setInterval(() => {
    if (!canvas.isConnected) {
      window.clearInterval(loop);
      return;
    }
    frame += 1;
    const clock = Math.floor(frame / 14) % 2 === 1;
    circuit.comps.forEach((component) => {
      if (component.type === 'CLOCK') component.on = clock;
    });
    simulate(circuit);
    draw(context);
  }, 50);

  aoSair(page, () => {
    window.removeEventListener('mouseup', onUp);
    window.clearInterval(loop);
  });
  return page;
}
