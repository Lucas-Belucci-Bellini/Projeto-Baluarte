/**
 * Motor do Simulador de Lógica Digital (v2.0.0).
 *
 * Um circuito é { comps, wires, seq }.
 *  - comp: { id, type, x, y, on, value } — `on` é o estado das fontes
 *    (IN/CLOCK, alternado pelo usuário/clock); `value` é a saída calculada.
 *  - wire: { id, from, to, toPort } — liga a saída de `from` à entrada
 *    `toPort` de `to`.
 *
 * simulate() propaga os sinais iterativamente, então circuitos com
 * realimentação (latches e flip-flops montados com portas) estabilizam.
 */

export const GATES = {
  IN:    { ins: 0, outs: 1, label: 'IN',   kind: 'source' },
  CLOCK: { ins: 0, outs: 1, label: 'CLK',  kind: 'source' },
  OUT:   { ins: 1, outs: 0, label: 'OUT',  kind: 'sink' },
  NOT:   { ins: 1, outs: 1, label: 'NOT',  kind: 'gate' },
  AND:   { ins: 2, outs: 1, label: 'AND',  kind: 'gate' },
  OR:    { ins: 2, outs: 1, label: 'OR',   kind: 'gate' },
  NAND:  { ins: 2, outs: 1, label: 'NAND', kind: 'gate' },
  NOR:   { ins: 2, outs: 1, label: 'NOR',  kind: 'gate' },
  XOR:   { ins: 2, outs: 1, label: 'XOR',  kind: 'gate' },
  XNOR:  { ins: 2, outs: 1, label: 'XNOR', kind: 'gate' }
};

/** Ordem da paleta de componentes. */
export const PALETTE = ['IN', 'CLOCK', 'OUT', 'NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];

function applyGate(type, a, b) {
  switch (type) {
    case 'NOT':  return !a;
    case 'AND':  return !!(a && b);
    case 'OR':   return !!(a || b);
    case 'NAND': return !(a && b);
    case 'NOR':  return !(a || b);
    case 'XOR':  return a !== b;
    case 'XNOR': return a === b;
    default:     return false;
  }
}

export function createCircuit() {
  return { comps: [], wires: [], seq: 1 };
}

export function addComponent(circuit, type, x, y) {
  const comp = { id: 'c' + (circuit.seq++), type, x, y, on: false, value: false };
  circuit.comps.push(comp);
  return comp;
}

export function removeComponent(circuit, id) {
  circuit.comps = circuit.comps.filter((c) => c.id !== id);
  circuit.wires = circuit.wires.filter((w) => w.from !== id && w.to !== id);
}

/** Liga a saída de fromId à entrada toPort de toId. Uma entrada só aceita um fio. */
export function addWire(circuit, fromId, toId, toPort) {
  if (fromId === toId) return null;
  circuit.wires = circuit.wires.filter((w) => !(w.to === toId && w.toPort === toPort));
  const wire = { id: 'w' + (circuit.seq++), from: fromId, to: toId, toPort };
  circuit.wires.push(wire);
  return wire;
}

export function removeWire(circuit, id) {
  circuit.wires = circuit.wires.filter((w) => w.id !== id);
}

/**
 * Propaga os sinais e define `value` em cada componente.
 * Itera até 40 vezes para circuitos realimentados estabilizarem.
 */
export function simulate(circuit) {
  const byId = {};
  for (const c of circuit.comps) byId[c.id] = c;

  for (const c of circuit.comps) {
    if (c.type === 'IN' || c.type === 'CLOCK') c.value = !!c.on;
    else if (typeof c.value !== 'boolean') c.value = false;
  }

  for (let pass = 0; pass < 40; pass++) {
    let changed = false;
    for (const c of circuit.comps) {
      if (c.type === 'IN' || c.type === 'CLOCK') continue;
      const def = GATES[c.type];
      const inv = [false, false];
      for (const w of circuit.wires) {
        if (w.to === c.id && w.toPort < def.ins) {
          const src = byId[w.from];
          if (src) inv[w.toPort] = !!src.value;
        }
      }
      const next = c.type === 'OUT' ? inv[0] : applyGate(c.type, inv[0], inv[1]);
      if (next !== c.value) { c.value = next; changed = true; }
    }
    if (!changed) break;
  }
  return circuit;
}

/** Valores das entradas de um componente — usado para colorir os fios. */
export function inputValues(circuit, comp) {
  const def = GATES[comp.type];
  const byId = {};
  for (const c of circuit.comps) byId[c.id] = c;
  const vals = [];
  for (let p = 0; p < def.ins; p++) {
    const w = circuit.wires.find((x) => x.to === comp.id && x.toPort === p);
    vals.push(w && byId[w.from] ? !!byId[w.from].value : false);
  }
  return vals;
}

export function serialize(circuit) {
  return JSON.stringify({
    comps: circuit.comps.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, on: !!c.on })),
    wires: circuit.wires.map((w) => ({ id: w.id, from: w.from, to: w.to, toPort: w.toPort })),
    seq: circuit.seq
  });
}

export function deserialize(json) {
  try {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (!d || !Array.isArray(d.comps)) return null;
    return {
      comps: d.comps.map((c) => ({
        id: c.id, type: c.type, x: c.x, y: c.y, on: !!c.on, value: false
      })),
      wires: (d.wires || []).map((w) => ({ id: w.id, from: w.from, to: w.to, toPort: w.toPort })),
      seq: d.seq || (d.comps.length + d.wires?.length + 2)
    };
  } catch {
    return null;
  }
}
