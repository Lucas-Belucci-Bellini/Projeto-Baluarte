/**
 * Motor do Simulador de Lógica Digital (v2.1.0).
 *
 * Um circuito é { comps, wires, seq }.
 *  - comp: { id, type, x, y, on, values, q, prevClk }
 *      `on`      — estado das fontes (IN/CLOCK), alternado pelo usuário/clock.
 *      `values`  — vetor de saídas calculadas (1 para portas, 2 para flip-flops).
 *      `q`/`prevClk` — estado interno dos flip-flops (bit guardado + borda).
 *  - wire: { id, from, fromPort, to, toPort } — liga a saída `fromPort` de
 *    `from` à entrada `toPort` de `to`.
 *
 * simulate() estabiliza a lógica combinacional, atualiza os flip-flops nas
 * bordas de subida do clock e re-estabiliza — então circuitos com
 * realimentação (latches montados com portas) e flip-flops funcionam.
 */

export const GATES = {
  IN:     { ins: 0, outs: 1, label: 'IN',    kind: 'source' },
  CLOCK:  { ins: 0, outs: 1, label: 'CLK',   kind: 'source' },
  OUT:    { ins: 1, outs: 0, label: 'OUT',   kind: 'sink' },
  BUFFER: { ins: 1, outs: 1, label: 'BUF',   kind: 'gate' },
  NOT:    { ins: 1, outs: 1, label: 'NOT',   kind: 'gate' },
  AND:    { ins: 2, outs: 1, label: 'AND',   kind: 'gate' },
  OR:     { ins: 2, outs: 1, label: 'OR',    kind: 'gate' },
  NAND:   { ins: 2, outs: 1, label: 'NAND',  kind: 'gate' },
  NOR:    { ins: 2, outs: 1, label: 'NOR',   kind: 'gate' },
  XOR:    { ins: 2, outs: 1, label: 'XOR',   kind: 'gate' },
  XNOR:   { ins: 2, outs: 1, label: 'XNOR',  kind: 'gate' },
  AND3:   { ins: 3, outs: 1, label: 'AND3',  kind: 'gate' },
  OR3:    { ins: 3, outs: 1, label: 'OR3',   kind: 'gate' },
  NAND3:  { ins: 3, outs: 1, label: 'NAND3', kind: 'gate' },
  NOR3:   { ins: 3, outs: 1, label: 'NOR3',  kind: 'gate' },
  XOR3:   { ins: 3, outs: 1, label: 'XOR3',  kind: 'gate' },
  XNOR3:  { ins: 3, outs: 1, label: 'XNOR3', kind: 'gate' },
  /* Flip-flops disparados na borda de subida — 2 saídas (Q e Q̄). */
  DFF:    { ins: 2, outs: 2, label: 'D-FF',  kind: 'ff', inLabels: ['D', 'CLK'],      outLabels: ['Q', 'Q̄'] },
  TFF:    { ins: 2, outs: 2, label: 'T-FF',  kind: 'ff', inLabels: ['T', 'CLK'],      outLabels: ['Q', 'Q̄'] },
  JKFF:   { ins: 3, outs: 2, label: 'JK-FF', kind: 'ff', inLabels: ['J', 'K', 'CLK'], outLabels: ['Q', 'Q̄'] }
};

/** Ordem da paleta de componentes. */
export const PALETTE = [
  'IN', 'CLOCK', 'OUT', 'BUFFER', 'NOT',
  'AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR',
  'AND3', 'OR3', 'NAND3', 'NOR3', 'XOR3', 'XNOR3',
  'DFF', 'TFF', 'JKFF'
];

/**
 * Aplica a função lógica de uma porta a um vetor de entradas.
 * Generaliza para qualquer número de entradas (2, 3 ou mais):
 *  - AND/NAND  → todas verdadeiras
 *  - OR/NOR    → ao menos uma verdadeira
 *  - XOR/XNOR  → paridade (nº ímpar de entradas verdadeiras)
 */
function applyGate(type, inputs) {
  const all = inputs.length > 0 && inputs.every(Boolean);
  const any = inputs.some(Boolean);
  const oddOnes = inputs.filter(Boolean).length % 2 === 1;
  switch (type) {
    case 'BUFFER': return !!inputs[0];
    case 'NOT':    return !inputs[0];
    case 'AND':
    case 'AND3':   return all;
    case 'OR':
    case 'OR3':    return any;
    case 'NAND':
    case 'NAND3':  return !all;
    case 'NOR':
    case 'NOR3':   return !any;
    case 'XOR':
    case 'XOR3':   return oddOnes;
    case 'XNOR':
    case 'XNOR3':  return !oddOnes;
    default:       return false;
  }
}

export function createCircuit() {
  return { comps: [], wires: [], seq: 1 };
}

export function addComponent(circuit, type, x, y) {
  const comp = { id: 'c' + (circuit.seq++), type, x, y, on: false };
  circuit.comps.push(comp);
  return comp;
}

export function removeComponent(circuit, id) {
  circuit.comps = circuit.comps.filter((c) => c.id !== id);
  circuit.wires = circuit.wires.filter((w) => w.from !== id && w.to !== id);
}

/** Liga a saída fromPort de fromId à entrada toPort de toId. Uma entrada só aceita um fio. */
export function addWire(circuit, fromId, fromPort, toId, toPort) {
  if (fromId === toId) return null;
  circuit.wires = circuit.wires.filter((w) => !(w.to === toId && w.toPort === toPort));
  const wire = { id: 'w' + (circuit.seq++), from: fromId, fromPort: fromPort || 0, to: toId, toPort };
  circuit.wires.push(wire);
  return wire;
}

export function removeWire(circuit, id) {
  circuit.wires = circuit.wires.filter((w) => w.id !== id);
}

/**
 * Propaga os sinais e define `values` em cada componente.
 * Fluxo: estabiliza a lógica combinacional, atualiza os flip-flops nas
 * bordas de subida do clock, então re-estabiliza para propagar o resultado.
 */
export function simulate(circuit) {
  const byId = {};
  for (const c of circuit.comps) byId[c.id] = c;

  /* Inicializa `values` (e o estado dos flip-flops) onde faltar. */
  for (const c of circuit.comps) {
    const def = GATES[c.type] || { ins: 0, outs: 0 };
    if (!Array.isArray(c.values)) c.values = new Array(def.outs).fill(false);
    if (def.kind === 'source') c.values = [!!c.on];
    if (def.kind === 'ff') {
      if (typeof c.q !== 'boolean') c.q = false;
      if (typeof c.prevClk !== 'boolean') c.prevClk = false;
      c.values = [c.q, !c.q];
    }
  }

  /* Lê o valor que chega na entrada `port` de um componente. */
  function readInput(comp, port) {
    const w = circuit.wires.find((x) => x.to === comp.id && x.toPort === port);
    if (!w) return false;
    const src = byId[w.from];
    if (!src || !src.values) return false;
    return !!src.values[w.fromPort || 0];
  }

  /* Estabiliza a lógica combinacional — flip-flops mantêm o estado atual. */
  function settle() {
    for (let pass = 0; pass < 40; pass++) {
      let changed = false;
      for (const c of circuit.comps) {
        const def = GATES[c.type];
        if (!def || def.kind === 'source' || def.kind === 'ff') continue;
        const inv = [];
        for (let p = 0; p < def.ins; p++) inv.push(readInput(c, p));
        const next = c.type === 'OUT' ? !!inv[0] : applyGate(c.type, inv);
        if (next !== c.values[0]) { c.values[0] = next; changed = true; }
      }
      if (!changed) break;
    }
  }

  /* Atualiza os flip-flops nas bordas de subida do clock.
     Lê todas as entradas antes de atualizar qualquer estado, para que
     cascatas de flip-flops vejam o valor anterior (atraso de propagação). */
  function updateFlipFlops() {
    const snapshot = [];
    for (const c of circuit.comps) {
      const def = GATES[c.type];
      if (!def || def.kind !== 'ff') continue;
      const ins = [];
      for (let p = 0; p < def.ins; p++) ins.push(readInput(c, p));
      snapshot.push({ c, ins });
    }
    for (const { c, ins } of snapshot) {
      const clk = ins[ins.length - 1];     /* CLK é sempre a última entrada */
      if (clk && !c.prevClk) {             /* borda de subida */
        if (c.type === 'DFF') c.q = !!ins[0];
        else if (c.type === 'TFF') c.q = ins[0] ? !c.q : c.q;
        else if (c.type === 'JKFF') {
          const j = ins[0], k = ins[1];
          if (j && k) c.q = !c.q;
          else if (j) c.q = true;
          else if (k) c.q = false;
        }
      }
      c.prevClk = clk;
      c.values = [c.q, !c.q];
    }
  }

  settle();
  updateFlipFlops();
  settle();
  return circuit;
}

/** Valores das entradas de um componente — usado para colorir os fios. */
export function inputValues(circuit, comp) {
  const def = GATES[comp.type] || { ins: 0 };
  const byId = {};
  for (const c of circuit.comps) byId[c.id] = c;
  const vals = [];
  for (let p = 0; p < def.ins; p++) {
    const w = circuit.wires.find((x) => x.to === comp.id && x.toPort === p);
    const src = w ? byId[w.from] : null;
    vals.push(src && src.values ? !!src.values[w.fromPort || 0] : false);
  }
  return vals;
}

export function serialize(circuit) {
  return JSON.stringify({
    comps: circuit.comps.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, on: !!c.on })),
    wires: circuit.wires.map((w) => ({
      id: w.id, from: w.from, fromPort: w.fromPort || 0, to: w.to, toPort: w.toPort
    })),
    seq: circuit.seq
  });
}

export function deserialize(json) {
  try {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (!d || !Array.isArray(d.comps)) return null;
    return {
      comps: d.comps.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, on: !!c.on })),
      wires: (d.wires || []).map((w) => ({
        id: w.id, from: w.from, fromPort: w.fromPort || 0, to: w.to, toPort: w.toPort
      })),
      seq: d.seq || (d.comps.length + (d.wires ? d.wires.length : 0) + 2)
    };
  } catch {
    return null;
  }
}
