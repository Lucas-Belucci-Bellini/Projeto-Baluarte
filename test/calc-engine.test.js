/**
 * Testes do motor das calculadoras (`/calc-cientifica` e `/calc-numerica`).
 *
 * O grupo 3 da auditoria é o das telas que CALCULAM, e ali a régua é outra:
 * tela quebrada todo mundo vê, número errado ninguém vê. Foi o que aconteceu
 * com o `bitOps.not`, que devolvia 0 para qualquer entrada nos 32 bits padrão —
 * o botão NOT da calculadora numérica estava simplesmente errado, sem nunca dar
 * sinal disso.
 *
 * Nada aqui é conferido contra número lembrado de cabeça. Cada teste se ancora
 * em uma de três coisas:
 *   - constante PUBLICADA (o padrão IEEE 754, a convenção de notação);
 *   - propriedade ESTRUTURAL (ida-e-volta, involução, associatividade);
 *   - identidade MATEMÁTICA que vale por definição (log(a·b) = log a + log b).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluate, toBase, fromBase, bitOps, ieee754, formatResult } from '../src/utils/calc-engine.js';

const v = (expr, opts) => evaluate(expr, opts).value;
/* Comparação de ponto flutuante: igualdade exata em binário é armadilha. */
const perto = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

/* ======================= bit a bit: o defeito do NOT ======================== */

test('NOT devolve o complemento, não zero — em toda largura', () => {
  /* `(1 << 32) - 1` é ZERO em JavaScript: o deslocamento conta módulo 32.
   * A máscara vem de `2 ** bits`. Com 32 bits (o padrão da tela) o NOT
   * devolvia 0 para qualquer entrada. */
  assert.equal(bitOps.not(0, 32), 0xFFFFFFFF);
  assert.equal(bitOps.not(5, 32), 0xFFFFFFFA);
  assert.equal(bitOps.not(0, 16), 0xFFFF);
  assert.equal(bitOps.not(5, 16), 0xFFFA);
  assert.equal(bitOps.not(0, 8), 0xFF);
  assert.equal(bitOps.not(255, 8), 0);
});

test('NOT é involução: aplicar duas vezes devolve o original', () => {
  for (const bits of [8, 16, 32]) {
    const teto = 2 ** bits;
    for (const x of [0, 1, 5, 42, teto - 1, Math.floor(teto / 2)]) {
      assert.equal(bitOps.not(bitOps.not(x, bits), bits), x, `x=${x} bits=${bits}`);
    }
  }
});

test('NOT nunca escapa da largura pedida', () => {
  for (const bits of [8, 16, 32]) {
    for (const x of [0, 1, 255, 65535, 4294967295]) {
      const r = bitOps.not(x, bits);
      assert.ok(r >= 0 && r < 2 ** bits, `not(${x}, ${bits}) = ${r} estourou a largura`);
    }
  }
});

test('De Morgan fecha — NAND, NOR e XNOR conferem com a definição', () => {
  /* ¬(a∧b) = ¬a ∨ ¬b, e cada porta composta é a negação da simples.
   * Identidade lógica publicada, não valor tabelado. */
  for (const [a, b] of [[0, 0], [0, 1], [12, 10], [0xFF, 0x0F], [123456, 654321]]) {
    assert.equal(bitOps.nand(a, b), bitOps.not(bitOps.and(a, b)), `nand(${a},${b})`);
    assert.equal(bitOps.nor(a, b), bitOps.not(bitOps.or(a, b)), `nor(${a},${b})`);
    assert.equal(bitOps.xnor(a, b), bitOps.not(bitOps.xor(a, b)), `xnor(${a},${b})`);
    assert.equal(bitOps.nand(a, b), bitOps.or(bitOps.not(a), bitOps.not(b)), `De Morgan em (${a},${b})`);
  }
});

test('XOR consigo mesmo zera, e com zero é identidade', () => {
  for (const x of [0, 1, 42, 0xDEADBEEF]) {
    assert.equal(bitOps.xor(x, x), 0);
    assert.equal(bitOps.xor(x, 0), x >>> 0);
  }
});

test('deslocar à esquerda e à direita é multiplicar e dividir por 2', () => {
  for (const x of [1, 3, 255, 1024]) {
    for (const n of [1, 3, 8]) {
      assert.equal(bitOps.shl(x, n), (x * 2 ** n) >>> 0, `${x} << ${n}`);
      assert.equal(bitOps.shr(x, n), Math.floor(x / 2 ** n), `${x} >> ${n}`);
    }
  }
});

/* ============================ bases numéricas ============================== */

test('ida e volta entre bases preserva o valor', () => {
  for (const valor of [0, 1, 7, 255, 4096, 65535, 123456789, 2 ** 31 - 1]) {
    for (const base of [2, 8, 16]) {
      assert.equal(fromBase(toBase(valor, base), base), valor, `${valor} na base ${base}`);
    }
  }
});

test('negativo vira complemento de dois na largura pedida', () => {
  /* Definição do complemento de dois: -n é representado como 2^bits - n. */
  for (const bits of [8, 16, 32]) {
    for (const n of [1, 5, 100]) {
      assert.equal(fromBase(toBase(-n, 16, bits), 16), 2 ** bits - n, `-${n} em ${bits} bits`);
    }
  }
});

test('binário sai com pelo menos um byte, alinhado', () => {
  assert.equal(toBase(1, 2), '00000001');
  assert.equal(toBase(255, 2), '11111111');
  assert.equal(toBase(256, 2).length, 9);
});

test('valor não finito não vira número falso', () => {
  for (const x of [NaN, Infinity, -Infinity]) assert.equal(toBase(x, 16), '—');
});

/* ========================= IEEE 754: padrão publicado ====================== */

test('IEEE 754 confere com as constantes do padrão', () => {
  /* Valores canônicos do IEEE 754 — publicados, verificáveis fora daqui. */
  assert.equal(ieee754(1, 'single').hex, '3F800000');
  assert.equal(ieee754(-2, 'single').hex, 'C0000000');
  assert.equal(ieee754(0.15625, 'single').hex, '3E200000');
  assert.equal(ieee754(1, 'double').hex, '3FF0000000000000');
  assert.equal(ieee754(-2, 'double').hex, 'C0000000' + '00000000');
});

test('IEEE 754: os campos têm a largura do padrão e remontam o número', () => {
  const s = ieee754(3.14, 'single');
  assert.equal(s.sign.length + s.exponent.length + s.mantissa.length, 32);
  assert.equal(s.exponent.length, 8);
  assert.equal(s.mantissa.length, 23);

  const d = ieee754(3.14, 'double');
  assert.equal(d.sign.length + d.exponent.length + d.mantissa.length, 64);
  assert.equal(d.exponent.length, 11);
  assert.equal(d.mantissa.length, 52);

  /* Ida e volta pelos próprios bits: remonta o número a partir do hex. */
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  d.hex.match(/../g).forEach((b, i) => view.setUint8(i, parseInt(b, 16)));
  assert.equal(view.getFloat64(0, false), 3.14);
});

test('o sinal do zero negativo sobrevive', () => {
  assert.equal(ieee754(-0, 'single').sign, '1');
  assert.equal(ieee754(0, 'single').sign, '0');
});

/* ===================== expressões: precedência e convenção ================== */

test('o menos unário liga mais fraco que o expoente', () => {
  /* Convenção matemática, a mesma de calculadora científica e de CAS:
   * -2² é -(2²) = -4, não (-2)² = 4. A planilha faz diferente; a tela aqui
   * chama-se "calculadora científica". */
  assert.equal(v('-2^2'), -4);
  assert.equal(v('-2^4'), -16);
  assert.equal(v('-2^3'), -8, 'expoente ímpar não muda de sinal de todo jeito');
  assert.equal(v('(-2)^2'), 4, 'parêntese continua mandando');
});

test('a potência é associativa à direita e aceita expoente com sinal', () => {
  assert.equal(v('2^3^2'), 512, '2^(3^2), não (2^3)^2 = 64');
  assert.equal(v('2^-1'), 0.5);
  assert.equal(v('-2^-2'), -0.25);
});

test('multiplicação antes de soma; subtração e divisão à esquerda', () => {
  assert.equal(v('2+3*4'), 14);
  assert.equal(v('2*(3+4)'), 14);
  assert.equal(v('10-3-2'), 5, 'seria 9 se fosse associativa à direita');
  assert.equal(v('8/4/2'), 1, 'seria 4 se fosse associativa à direita');
  assert.equal(v('2*3^2'), 18, 'o expoente vem antes do produto');
});

test('identidades matemáticas fecham — logaritmo, exponencial, Pitágoras', () => {
  /* Vale por definição, para qualquer entrada: é o tipo de âncora que não
   * depende de eu ter digitado o número certo. */
  perto(v('ln(2*8)'), v('ln(2)+ln(8)'));
  perto(v('log(100)'), 2);
  perto(v('exp(ln(7))'), 7, 1e-9);
  perto(v('sqrt(9)^2'), 9);
  perto(v('sin(0.7)^2+cos(0.7)^2'), 1);
});

test('graus e radianos são modos de verdade', () => {
  perto(v('sin(90)', { mode: 'deg' }), 1);
  perto(v('sin(pi/2)', { mode: 'rad' }), 1);
  perto(v('cos(180)', { mode: 'deg' }), -1);
  assert.notEqual(v('sin(90)', { mode: 'deg' }), v('sin(90)', { mode: 'rad' }));
});

test('pi e e são as constantes de verdade', () => {
  perto(v('pi'), Math.PI);
  perto(v('e'), Math.E);
});

test('fatorial e sinal duplo', () => {
  assert.equal(v('5!'), 120);
  assert.equal(v('0!'), 1);
  assert.equal(v('--5'), 5);
});

test('expressão inválida devolve erro, não número inventado', () => {
  for (const expr of ['2+', '(1', 'foo(2)', '*3']) {
    const r = evaluate(expr);
    assert.ok(r.error, `"${expr}" deveria acusar erro`);
    assert.ok(Number.isNaN(r.value), `"${expr}" deveria devolver NaN, veio ${r.value}`);
  }
});

test('expressão vazia é zero, não erro', () => {
  assert.equal(v(''), 0);
  assert.equal(v('   '), 0);
});

/* ============================== formatação ================================= */

test('formatResult não mente sobre número não finito', () => {
  assert.equal(formatResult(NaN), 'NaN');
  assert.equal(formatResult(Infinity), '∞');
  assert.equal(formatResult(-Infinity), '-∞');
});

test('formatResult preserva inteiro e não inventa precisão', () => {
  assert.equal(formatResult(0), '0');
  assert.equal(formatResult(1234567), '1234567');
  assert.equal(formatResult(-42), '-42');
  /* 0,1+0,2 não pode aparecer como 0.30000000000000004 numa calculadora. */
  assert.equal(formatResult(0.1 + 0.2), '0.3');
});

test('formatResult vai para notação científica nos extremos', () => {
  assert.match(formatResult(1e20), /e\+?20/);
  assert.match(formatResult(1e-9), /e-9/);
});
