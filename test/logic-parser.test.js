/**
 * Testes do motor de lógica (`/tabela-verdade`, `/portas`, `/logic-sim`).
 *
 * A âncora aqui é EQUIVALÊNCIA, não a string de saída: uma expressão
 * simplificada pode ser escrita de várias formas igualmente corretas, e cobrar
 * o texto exato transformaria refatoração em falso alarme. O que não pode mudar
 * nunca é a tabela-verdade — e é ela que os testes comparam.
 *
 * As leis usadas (De Morgan, distributividade, absorção, contraposição) são
 * álgebra booleana publicada, não valor tabelado de memória.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  compile, buildTruthTable, toSOP, toPOS, simplifySOP, grayCodeOrder
} from '../src/utils/logic-parser.js';

/** Assinatura da função booleana: a coluna de resultado, sobre as vars dadas. */
function assinatura(expr, vars) {
  const c = compile(expr);
  assert.ok(!c.error, `"${expr}" não compilou: ${c.error}`);
  return buildTruthTable(c, vars || c.vars).map((r) => (r.result ? '1' : '0')).join('');
}

/** Duas expressões descrevem a mesma função? */
function equivalem(a, b, vars) {
  const varsA = vars || [...new Set([...compile(a).vars, ...compile(b).vars])].sort();
  return assinatura(a, varsA) === assinatura(b, varsA);
}

const mesmaCoisa = (a, b, vars) =>
  assert.ok(equivalem(a, b, vars), `"${a}" e "${b}" deveriam ser a mesma função`);

/* ========================= leis da álgebra booleana ======================== */

test('De Morgan', () => {
  mesmaCoisa('NOT (A AND B)', '(NOT A) OR (NOT B)');
  mesmaCoisa('NOT (A OR B)', '(NOT A) AND (NOT B)');
});

test('distributividade', () => {
  mesmaCoisa('A AND (B OR C)', '(A AND B) OR (A AND C)');
  mesmaCoisa('A OR (B AND C)', '(A OR B) AND (A OR C)');
});

test('absorção e idempotência', () => {
  mesmaCoisa('A OR (A AND B)', 'A');
  mesmaCoisa('A AND (A OR B)', 'A');
  mesmaCoisa('A AND A', 'A');
  mesmaCoisa('A OR A', 'A');
});

test('dupla negação e terceiro excluído', () => {
  mesmaCoisa('NOT (NOT A)', 'A');
  assert.equal(assinatura('A OR NOT A'), '11', 'tautologia');
  assert.equal(assinatura('A AND NOT A'), '00', 'contradição');
});

test('implicação, contraposição e bicondicional', () => {
  mesmaCoisa('A -> B', '(NOT A) OR B');
  mesmaCoisa('A -> B', '(NOT B) -> (NOT A)', ['A', 'B']);
  mesmaCoisa('A <-> B', '(A -> B) AND (B -> A)');
  mesmaCoisa('A XOR B', 'NOT (A <-> B)');
});

test('comutatividade e associatividade', () => {
  for (const op of ['AND', 'OR', 'XOR', 'IFF']) {
    mesmaCoisa(`A ${op} B`, `B ${op} A`, ['A', 'B']);
    mesmaCoisa(`(A ${op} B) ${op} C`, `A ${op} (B ${op} C)`, ['A', 'B', 'C']);
  }
});

/* ====================== NAND, NOR e XNOR (universais) ====================== */

test('as portas negadas são a negação das positivas', () => {
  /* A página /portas ensina que NAND e NOR são universais; antes disso o
   * parser não conhecia nenhuma das três e "A NAND B" dava erro de sintaxe. */
  mesmaCoisa('A NAND B', 'NOT (A AND B)');
  mesmaCoisa('A NOR B', 'NOT (A OR B)');
  mesmaCoisa('A XNOR B', 'NOT (A XOR B)');
  mesmaCoisa('A XNOR B', 'A <-> B');
});

test('NAND é universal: dá para escrever NOT, AND e OR só com ela', () => {
  /* É a propriedade que justifica a frase "porta universal" na tela /portas.
   * Se falhar, ou a porta está errada ou a tela está ensinando errado. */
  mesmaCoisa('A NAND A', 'NOT A', ['A']);
  mesmaCoisa('(A NAND B) NAND (A NAND B)', 'A AND B');
  mesmaCoisa('(A NAND A) NAND (B NAND B)', 'A OR B');
});

test('NOR também é universal', () => {
  mesmaCoisa('A NOR A', 'NOT A', ['A']);
  mesmaCoisa('(A NOR B) NOR (A NOR B)', 'A OR B');
  mesmaCoisa('(A NOR A) NOR (B NOR B)', 'A AND B');
});

test('os símbolos valem o mesmo que as palavras', () => {
  mesmaCoisa('A ⊼ B', 'A NAND B');
  mesmaCoisa('A ⊽ B', 'A NOR B');
  mesmaCoisa('A ⊙ B', 'A XNOR B');
});

/* ===================== formas canônicas: SOP, POS, simplificação =========== */

const EXPRESSOES = [
  'A AND B', 'A OR B', 'A XOR B', 'NOT A',
  '(A AND B) OR (NOT A AND C)', 'A AND (B OR C)', 'A XOR B XOR C',
  'A -> B', 'A <-> B', 'A NAND B', '(A OR B) AND (NOT C)'
];

test('SOP, POS e a forma simplificada descrevem a MESMA função', () => {
  /* O teste mais forte que existe para este motor: seja qual for a forma
   * escolhida para escrever, a tabela-verdade tem que bater com a original.
   * Não cobra o texto — cobra o significado. */
  for (const expr of EXPRESSOES) {
    const c = compile(expr);
    const rows = buildTruthTable(c, c.vars);
    const original = assinatura(expr, c.vars);
    for (const [nome, forma] of [
      ['SOP', toSOP(rows, c.vars)],
      ['POS', toPOS(rows, c.vars)],
      ['simplificada', simplifySOP(rows, c.vars)]
    ]) {
      if (forma === '0' || forma === '1') continue;      // constante: não é expressão
      assert.equal(assinatura(forma, c.vars), original,
        `a forma ${nome} de "${expr}" (${forma}) mudou a função`);
    }
  }
});

test('a simplificação não é mais longa que a canônica', () => {
  /* Simplificar que aumenta não é simplificar. */
  for (const expr of EXPRESSOES) {
    const c = compile(expr);
    const rows = buildTruthTable(c, c.vars);
    assert.ok(simplifySOP(rows, c.vars).length <= toSOP(rows, c.vars).length,
      `a "simplificação" de "${expr}" ficou maior que a canônica`);
  }
});

test('tautologia e contradição viram 1 e 0', () => {
  const taut = compile('A OR NOT A');
  const contra = compile('A AND NOT A');
  assert.equal(simplifySOP(buildTruthTable(taut, taut.vars), taut.vars), '1');
  assert.equal(simplifySOP(buildTruthTable(contra, contra.vars), contra.vars), '0');
});

/* ============================ tabela-verdade =============================== */

test('a tabela tem 2^n linhas, todas distintas', () => {
  for (const expr of ['A', 'A AND B', 'A AND B AND C', 'A AND B AND C AND D']) {
    const c = compile(expr);
    const rows = buildTruthTable(c, c.vars);
    assert.equal(rows.length, 2 ** c.vars.length, `linhas de "${expr}"`);
    const vistas = new Set(rows.map((r) => JSON.stringify(r.env)));
    assert.equal(vistas.size, rows.length, 'combinação de entrada repetida');
  }
});

test('a primeira variável é o bit mais significativo', () => {
  /* É o que faz a tabela na tela ler na ordem que o leitor espera. */
  const c = compile('A AND B');
  const rows = buildTruthTable(c, ['A', 'B']);
  assert.deepEqual(rows.map((r) => [r.env.A, r.env.B]),
    [[false, false], [false, true], [true, false], [true, true]]);
});

/* ============================== código Gray ================================ */

test('no código Gray, vizinhos diferem em exatamente 1 bit', () => {
  /* É a definição do código Gray, e é o que faz o mapa de Karnaugh funcionar:
   * se dois vizinhos diferissem em 2 bits, o agrupamento seria inválido. */
  const umBit = (a, b) => {
    const d = a ^ b;
    return d !== 0 && (d & (d - 1)) === 0;
  };
  for (const n of [1, 2, 3, 4]) {
    const ordem = grayCodeOrder(n);
    assert.equal(ordem.length, 2 ** n, `tamanho para n=${n}`);
    assert.equal(new Set(ordem).size, ordem.length, `repetição para n=${n}`);
    for (let i = 1; i < ordem.length; i += 1) {
      assert.ok(umBit(ordem[i - 1], ordem[i]), `n=${n}: ${ordem[i - 1]} → ${ordem[i]} mudou mais de um bit`);
    }
    /* Fecha o ciclo: o último também é vizinho do primeiro. */
    assert.ok(umBit(ordem[ordem.length - 1], ordem[0]), `n=${n}: o código Gray não fecha o ciclo`);
  }
});

/* ============================ entrada malformada =========================== */

test('expressão inválida acusa erro em vez de devolver função falsa', () => {
  for (const expr of ['A AND', '(A', 'A)', '@']) {
    const c = compile(expr);
    assert.ok(c.error, `"${expr}" deveria acusar erro`);
    assert.deepEqual(c.vars, [], `"${expr}" não deveria declarar variáveis`);
  }
});

test('expressão vazia é vazia, não erro', () => {
  const c = compile('');
  assert.equal(c.empty, true);
  assert.deepEqual(c.vars, []);
});

test('caixa e concatenação implícita seguem valendo', () => {
  mesmaCoisa('a and b', 'A AND B');
  mesmaCoisa('AB', 'A AND B');
  mesmaCoisa('A*B', 'A AND B');
  mesmaCoisa('A+B', 'A OR B');
});
