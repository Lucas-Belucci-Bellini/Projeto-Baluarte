/**
 * Página /logic-sim — Simulador de Lógica Digital (v2.0.0).
 *
 * Simulador interativo de verdade: coloca componentes num canvas, liga
 * com fios (saída → entrada), alterna as entradas e vê os sinais
 * propagarem em tempo real. Suporta realimentação (latches/flip-flops
 * montados com portas). Salva/carrega o circuito em localStorage.
 */

import '../styles/logic-sim.css';
import { h, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  GATES, PALETTE, createCircuit, addComponent, removeComponent,
  addWire, removeWire, simulate, inputValues, serialize, deserialize
} from '../utils/logic-sim-engine.js';

const STORAGE_KEY = 'logic-sim:circuit';
const CW = 1000;          /* largura lógica do canvas */
const CH = 560;           /* altura  lógica do canvas */
const W = 80;             /* largura do componente */
const H = 52;             /* altura do componente */
const PR = 7;             /* raio do port */

let circuit = null;
let tool = 'wire';        /* 'wire' | 'erase' */
let drag = null;          /* { comp, dx, dy, moved } */
let wiring = null;        /* { from, mx, my } */
let addCount = 0;
let frame = 0;

/* ===== Geometria ===== */

function inPortPos(comp, port) {
  const def = GATES[comp.type];
  if (def.ins <= 1) return { x: comp.x, y: comp.y + H / 2 };
  /* distribui as N entradas uniformemente na lateral esquerda */
  return { x: comp.x, y: comp.y + (H * (port + 1)) / (def.ins + 1) };
}
function outPortPos(comp, port = 0) {
  const def = GATES[comp.type];
  if (def.outs <= 1) return { x: comp.x + W, y: comp.y + H / 2 };
  return { x: comp.x + W, y: comp.y + (H * (port + 1)) / (def.outs + 1) };
}
function compAt(x, y) {
  for (let i = circuit.comps.length - 1; i >= 0; i--) {
    const c = circuit.comps[i];
    if (x >= c.x && x <= c.x + W && y >= c.y && y <= c.y + H) return c;
  }
  return null;
}
function outPortAt(x, y) {
  for (const c of circuit.comps) {
    const def = GATES[c.type];
    for (let p = 0; p < def.outs; p++) {
      const pos = outPortPos(c, p);
      if ((x - pos.x) ** 2 + (y - pos.y) ** 2 <= (PR + 5) ** 2) return { comp: c, port: p };
    }
  }
  return null;
}
function inPortAt(x, y) {
  for (const c of circuit.comps) {
    const def = GATES[c.type];
    for (let p = 0; p < def.ins; p++) {
      const pos = inPortPos(c, p);
      if ((x - pos.x) ** 2 + (y - pos.y) ** 2 <= (PR + 5) ** 2) return { comp: c, port: p };
    }
  }
  return null;
}
function distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}
function wireAt(x, y) {
  const byId = {};
  circuit.comps.forEach((c) => (byId[c.id] = c));
  for (const w of circuit.wires) {
    const a = byId[w.from], b = byId[w.to];
    if (!a || !b) continue;
    const p1 = outPortPos(a, w.fromPort), p2 = inPortPos(b, w.toPort);
    if (distSeg(x, y, p1.x, p1.y, p2.x, p2.y) < 7) return w;
  }
  return null;
}

/* ===== Persistência ===== */

function save() {
  storage.set(STORAGE_KEY, serialize(circuit));
  setStatus('logicSim', { componentes: circuit.comps.length, fios: circuit.wires.length });
}

/* ===== Desenho ===== */

function colorFor(on) {
  return on ? '#d4a24e' : '#3a4358';
}

function draw(ctx) {
  ctx.clearRect(0, 0, CW, CH);

  /* grade */
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= CW; gx += 28) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CH); ctx.stroke();
  }
  for (let gy = 0; gy <= CH; gy += 28) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CW, gy); ctx.stroke();
  }

  const byId = {};
  circuit.comps.forEach((c) => (byId[c.id] = c));

  /* fios */
  ctx.lineWidth = 2.5;
  for (const w of circuit.wires) {
    const a = byId[w.from], b = byId[w.to];
    if (!a || !b) continue;
    const p1 = outPortPos(a, w.fromPort), p2 = inPortPos(b, w.toPort);
    ctx.strokeStyle = colorFor(a.values && a.values[w.fromPort]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    const mx = (p1.x + p2.x) / 2;
    ctx.bezierCurveTo(mx, p1.y, mx, p2.y, p2.x, p2.y);
    ctx.stroke();
  }

  /* fio temporário (ligando) */
  if (wiring) {
    const a = byId[wiring.from];
    if (a) {
      const p1 = outPortPos(a, wiring.fromPort);
      ctx.strokeStyle = '#ffaa00';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(wiring.mx, wiring.my);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /* componentes */
  for (const c of circuit.comps) {
    const def = GATES[c.type];
    const ins = inputValues(circuit, c);
    const lit = c.type === 'OUT' ? ins[0] : !!(c.values && c.values[0]);

    /* corpo */
    ctx.fillStyle = lit ? 'rgba(212,162,78,0.14)' : 'rgba(20,26,38,0.96)';
    ctx.strokeStyle = lit ? '#d4a24e' : '#46506a';
    ctx.lineWidth = (drag && drag.comp === c) ? 3 : 1.6;
    roundRect(ctx, c.x, c.y, W, H, 8);
    ctx.fill();
    ctx.stroke();

    /* rótulo / valor */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (c.type === 'IN') {
      ctx.fillStyle = c.on ? '#d4a24e' : '#9aa6bd';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(c.on ? '1' : '0', c.x + W / 2, c.y + H / 2 + 1);
    } else if (c.type === 'OUT') {
      ctx.beginPath();
      ctx.arc(c.x + W / 2, c.y + H / 2, 13, 0, Math.PI * 2);
      ctx.fillStyle = lit ? '#d4a24e' : '#2a3142';
      ctx.fill();
      ctx.strokeStyle = lit ? '#aef6ff' : '#46506a';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (c.type === 'CLOCK') {
      ctx.fillStyle = c.on ? '#d4a24e' : '#9aa6bd';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('CLK ' + (c.on ? '1' : '0'), c.x + W / 2, c.y + H / 2 + 1);
    } else if (def.kind !== 'ff') {
      ctx.fillStyle = '#dfe6f5';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(def.label, c.x + W / 2, c.y + H / 2 + 1);
    }
    /* flip-flops são identificados pelos rótulos das portas (abaixo) */

    /* ports de entrada */
    for (let p = 0; p < def.ins; p++) {
      const pos = inPortPos(c, p);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PR, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(ins[p]);
      ctx.fill();
      ctx.strokeStyle = '#0b0e16';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    /* ports de saída */
    for (let p = 0; p < def.outs; p++) {
      const pos = outPortPos(c, p);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PR, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(!!(c.values && c.values[p]));
      ctx.fill();
      ctx.strokeStyle = '#0b0e16';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    /* rótulos das portas — flip-flops (D/CLK/J/K · Q/Q̄) */
    if (def.kind === 'ff') {
      ctx.font = '9px monospace';
      ctx.fillStyle = '#8b97ad';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      def.inLabels.forEach((lbl, p) => {
        const pos = inPortPos(c, p);
        ctx.fillText(lbl, c.x + 8, pos.y);
      });
      ctx.textAlign = 'right';
      def.outLabels.forEach((lbl, p) => {
        const pos = outPortPos(c, p);
        ctx.fillText(lbl, c.x + W - 8, pos.y);
      });
      ctx.textAlign = 'center';
    }
  }
}

function roundRect(ctx, x, y, w, hh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r);
  ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ===== Exemplos ===== */

function buildExample(key) {
  const c = createCircuit();
  if (key === 'and') {
    const a = addComponent(c, 'IN', 70, 130);
    const b = addComponent(c, 'IN', 70, 320);
    const g = addComponent(c, 'AND', 360, 210);
    const o = addComponent(c, 'OUT', 640, 224);
    addWire(c, a.id, 0, g.id, 0);
    addWire(c, b.id, 0, g.id, 1);
    addWire(c, g.id, 0, o.id, 0);
  } else if (key === 'half-adder') {
    const a = addComponent(c, 'IN', 70, 120);
    const b = addComponent(c, 'IN', 70, 330);
    const x = addComponent(c, 'XOR', 380, 150);
    const an = addComponent(c, 'AND', 380, 320);
    const soma = addComponent(c, 'OUT', 680, 164);
    const carry = addComponent(c, 'OUT', 680, 334);
    addWire(c, a.id, 0, x.id, 0);
    addWire(c, b.id, 0, x.id, 1);
    addWire(c, a.id, 0, an.id, 0);
    addWire(c, b.id, 0, an.id, 1);
    addWire(c, x.id, 0, soma.id, 0);
    addWire(c, an.id, 0, carry.id, 0);
  } else if (key === 'sr-latch') {
    const s = addComponent(c, 'IN', 70, 120);
    const r = addComponent(c, 'IN', 70, 360);
    const n1 = addComponent(c, 'NOR', 360, 150);
    const n2 = addComponent(c, 'NOR', 360, 330);
    const q = addComponent(c, 'OUT', 660, 164);
    const qn = addComponent(c, 'OUT', 660, 344);
    addWire(c, s.id, 0, n1.id, 0);
    addWire(c, n2.id, 0, n1.id, 1);
    addWire(c, n1.id, 0, n2.id, 0);
    addWire(c, r.id, 0, n2.id, 1);
    addWire(c, n1.id, 0, q.id, 0);
    addWire(c, n2.id, 0, qn.id, 0);
  } else if (key === 'd-ff') {
    const d = addComponent(c, 'IN', 70, 120);
    const clk = addComponent(c, 'CLOCK', 70, 340);
    const ff = addComponent(c, 'DFF', 380, 210);
    const q = addComponent(c, 'OUT', 700, 190);
    const qn = addComponent(c, 'OUT', 700, 320);
    addWire(c, d.id, 0, ff.id, 0);    /* D   → entrada 0 */
    addWire(c, clk.id, 0, ff.id, 1);  /* CLK → entrada 1 */
    addWire(c, ff.id, 0, q.id, 0);    /* Q  → OUT */
    addWire(c, ff.id, 1, qn.id, 0);   /* Q̄ → OUT */
  }
  return c;
}

/* ===== Página ===== */

export function logicSimPage() {
  /* carrega o circuito salvo, ou começa com o exemplo AND */
  const saved = storage.get(STORAGE_KEY);
  circuit = (saved && deserialize(saved)) || buildExample('and');
  tool = 'wire';
  drag = null;
  wiring = null;
  addCount = 0;

  const page = h('div', { className: 'page-logic-sim' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'LOGIC SIM')),
      h('h1', { className: 'page-header__title' }, '⊻ Simulador de Lógica Digital'),
      h('p', { className: 'page-header__description' },
        'Coloque componentes, ligue saída → entrada com fios e veja os sinais ',
        'propagarem em tempo real. 14 portas lógicas + ',
        h('span', { className: 'u-text-cyan' }, 'flip-flops D, JK e T'),
        ' (lógica sequencial disparada na borda do clock). ',
        'Salve e reabra seus circuitos.')
    )
  );

  /* canvas (criado antes da toolbar pra os botões referenciarem) */
  const canvas = h('canvas', { className: 'lsim-canvas' });
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CW * dpr;
  canvas.height = CH * dpr;
  canvas.style.width = CW + 'px';
  canvas.style.height = CH + 'px';
  ctx.scale(dpr, dpr);

  /* ===== Toolbar ===== */
  const palette = h('div', { className: 'lsim-group' });
  PALETTE.forEach((type) => {
    palette.appendChild(
      h('button', {
        className: 'lsim-palette-btn',
        title: 'Adicionar ' + type,
        onclick: () => {
          addCount++;
          const x = 120 + (addCount % 6) * 26;
          const y = 90 + (addCount % 6) * 26;
          addComponent(circuit, type, x, y);
          save();
        }
      }, GATES[type].label)
    );
  });

  function toolBtn(id, label) {
    return h('button', {
      className: 'lsim-tool-btn' + (tool === id ? ' is-active' : ''),
      'data-tool': id,
      onclick: () => {
        tool = id;
        document.querySelectorAll('.lsim-tool-btn').forEach((b) =>
          b.classList.toggle('is-active', b.dataset.tool === id));
      }
    }, label);
  }

  function exampleBtn(key, label) {
    return h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => { circuit = buildExample(key); save(); toast('Exemplo carregado: ' + label, { type: 'info' }); }
    }, label);
  }

  /* ===== Salvar / abrir circuitos (localStorage) ===== */
  const SAVED_KEY = 'logic-sim:saved';
  const getSaved = () => storage.get(SAVED_KEY) || {};

  const savedSelect = h('select', { className: 'lsim-select input', 'aria-label': 'Circuito salvo' });
  function refreshSaved() {
    empty(savedSelect);
    savedSelect.appendChild(h('option', { value: '' }, '⭱ Abrir salvo…'));
    Object.keys(getSaved()).sort().forEach((name) =>
      savedSelect.appendChild(h('option', { value: name }, name)));
  }
  savedSelect.onchange = () => {
    const name = savedSelect.value;
    savedSelect.value = '';
    if (!name) return;
    const loaded = deserialize(getSaved()[name]);
    if (loaded) { circuit = loaded; save(); toast('Circuito aberto: ' + name, { type: 'info' }); }
    else toast('Não foi possível abrir o circuito', { type: 'danger' });
  };
  refreshSaved();

  const saveBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      const name = prompt('Nome para salvar este circuito:');
      if (!name || !name.trim()) return;
      const all = getSaved();
      all[name.trim()] = serialize(circuit);
      storage.set(SAVED_KEY, all);
      refreshSaved();
      toast('Circuito salvo: ' + name.trim(), { type: 'success' });
    }
  }, '⭳ Salvar');

  page.appendChild(
    h('div', { className: 'lsim-bar' },
      palette,
      h('div', { className: 'lsim-group' },
        toolBtn('wire', '✋ Mover / Ligar'),
        toolBtn('erase', '✕ Apagar')
      ),
      h('div', { className: 'lsim-group' },
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => { circuit = createCircuit(); save(); toast('Canvas limpo', { type: 'info' }); }
        }, '⌫ Limpar'),
        exampleBtn('and', 'AND'),
        exampleBtn('half-adder', 'Meio-somador'),
        exampleBtn('sr-latch', 'Trava SR'),
        exampleBtn('d-ff', 'D Flip-Flop')
      ),
      h('div', { className: 'lsim-group' }, saveBtn, savedSelect)
    )
  );

  page.appendChild(
    h('div', { className: 'lsim-canvas-wrap' }, canvas)
  );

  page.appendChild(
    h('p', { className: 'lsim-hint u-text-muted' },
      'Clique numa porta da paleta para adicioná-la · arraste os componentes · ',
      'clique no port de saída (●) e solte num port de entrada para criar um fio · ',
      'clique numa entrada IN para alterná-la (0/1) · ferramenta Apagar remove peças e fios.')
  );

  /* ===== Interação ===== */
  function mousePos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (CW / r.width),
      y: (e.clientY - r.top) * (CH / r.height)
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    const { x, y } = mousePos(e);
    if (tool === 'erase') {
      const c = compAt(x, y);
      if (c) { removeComponent(circuit, c.id); save(); return; }
      const w = wireAt(x, y);
      if (w) { removeWire(circuit, w.id); save(); return; }
      return;
    }
    /* tool wire */
    const op = outPortAt(x, y);
    if (op) { wiring = { from: op.comp.id, fromPort: op.port, mx: x, my: y }; return; }
    const c = compAt(x, y);
    if (c) { drag = { comp: c, dx: x - c.x, dy: y - c.y, moved: false }; }
  });

  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = mousePos(e);
    if (drag) {
      const nx = Math.max(0, Math.min(CW - W, x - drag.dx));
      const ny = Math.max(0, Math.min(CH - H, y - drag.dy));
      if (Math.abs(nx - drag.comp.x) > 1 || Math.abs(ny - drag.comp.y) > 1) drag.moved = true;
      drag.comp.x = nx;
      drag.comp.y = ny;
    } else if (wiring) {
      wiring.mx = x; wiring.my = y;
    }
  });

  /* Em `window` porque soltar o botão FORA do canvas também encerra o arrasto.
   * A limpeza era preguiçosa: o próprio listener se removia, mas só no PRÓXIMO
   * mouseup — até lá continuava pendurado depois de a tela sair. Agora sai na
   * troca de rota, junto com a tela que o criou. */
  const onUp = (e) => {
    if (!canvas.isConnected) return;
    const { x, y } = mousePos(e);
    if (wiring) {
      const ip = inPortAt(x, y);
      if (ip) { addWire(circuit, wiring.from, wiring.fromPort, ip.comp.id, ip.port); save(); }
      wiring = null;
    }
    if (drag) {
      if (!drag.moved && drag.comp.type === 'IN') {
        drag.comp.on = !drag.comp.on;
      } else if (drag.moved) {
        save();
      }
      drag = null;
    }
  };
  window.addEventListener('mouseup', onUp);

  /* ===== Loop de simulação ===== */
  const loop = setInterval(() => {
    if (!canvas.isConnected) { clearInterval(loop); return; }
    frame++;
    const clk = Math.floor(frame / 14) % 2 === 1;
    for (const c of circuit.comps) {
      if (c.type === 'CLOCK') c.on = clk;
    }
    simulate(circuit);
    draw(ctx);
  }, 50);

  /* Solta o listener global e para o laço de simulação ao sair da tela. O laço
   * já se encerrava sozinho, mas só no tique seguinte à desconexão — 50 ms
   * simulando um circuito que ninguém está mais vendo. */
  aoSair(page, () => {
    window.removeEventListener('mouseup', onUp);
    clearInterval(loop);
  });

  return page;
}
