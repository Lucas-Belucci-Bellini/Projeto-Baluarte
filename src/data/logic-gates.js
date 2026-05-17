/**
 * Portas lógicas básicas — usado pelo Simulador de Lógica (/logic-sim).
 *
 * Cada porta: id, símbolo, função booleana e descrição.
 * (Antes este dado morava — fora de lugar — dentro de data/modpack.js.)
 */
export const LOGIC_GATES = [
  { id: 'AND',  symbol: '∧', fn: (a, b) => a && b,     desc: 'Saída 1 se ambos forem 1.' },
  { id: 'OR',   symbol: '∨', fn: (a, b) => a || b,     desc: 'Saída 1 se pelo menos um for 1.' },
  { id: 'NOT',  symbol: '¬', fn: (a) => !a,            desc: 'Inverte o sinal (1 input).' },
  { id: 'XOR',  symbol: '⊕', fn: (a, b) => a !== b,    desc: 'Saída 1 se exatamente um for 1.' },
  { id: 'NAND', symbol: '⊼', fn: (a, b) => !(a && b),  desc: 'NOT AND. Universal: pode formar qualquer porta.' },
  { id: 'NOR',  symbol: '⊽', fn: (a, b) => !(a || b),  desc: 'NOT OR. Também universal.' },
  { id: 'XNOR', symbol: '↔', fn: (a, b) => a === b,    desc: 'NOT XOR (igualdade).' }
];
