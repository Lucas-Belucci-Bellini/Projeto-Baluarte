/**
 * Testes do ciclo de vida de página.
 *
 * O gancho de saída é o que impede vazamento entre rotas, e ele próprio precisa
 * de garantia: se `encerrar()` rodasse duas vezes, uma página pararia o áudio
 * da SEGUINTE; se parasse na primeira exceção, um erro bobo numa limpeza
 * deixaria todas as outras penduradas.
 *
 * Roda em Node puro — o módulo não toca em DOM de propósito, só guarda funções
 * por chave. É por isso que dá pra testar sem navegador.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { aoSair, encerrar, pendentes } from '../src/core/ciclo-vida.js';

/* O módulo só usa o elemento como CHAVE de WeakMap, nunca mexe nele — então um
 * objeto qualquer serve de página nestes testes. */
const pagina = () => ({});

test('encerrar roda as limpezas registradas', () => {
  const p = pagina();
  const feito = [];
  aoSair(p, () => feito.push('a'));
  aoSair(p, () => feito.push('b'));
  assert.equal(encerrar(p), 2);
  assert.deepEqual(feito.sort(), ['a', 'b']);
});

test('a ordem é inversa ao registro — o mais recente sai primeiro', () => {
  /* Como um `defer`: quem montou por último costuma depender de quem montou
   * antes, então desmontar na ordem inversa é o que não deixa meio-estado. */
  const p = pagina();
  const ordem = [];
  aoSair(p, () => ordem.push(1));
  aoSair(p, () => ordem.push(2));
  aoSair(p, () => ordem.push(3));
  encerrar(p);
  assert.deepEqual(ordem, [3, 2, 1]);
});

test('encerrar duas vezes não roda a limpeza duas vezes', () => {
  /* O shell chama isto a cada troca de tela. Se repetisse, a página que está
   * ENTRANDO levaria a limpeza da que já saiu. */
  const p = pagina();
  let n = 0;
  aoSair(p, () => { n += 1; });
  encerrar(p);
  encerrar(p);
  assert.equal(n, 1);
});

test('uma limpeza que explode não impede as outras', () => {
  const p = pagina();
  const feito = [];
  const erroOriginal = console.error;
  console.error = () => {};                 // a falha é registrada; aqui só cala o ruído
  try {
    aoSair(p, () => feito.push('primeira'));
    aoSair(p, () => { throw new Error('falha proposital'); });
    aoSair(p, () => feito.push('ultima'));
    assert.doesNotThrow(() => encerrar(p), 'encerrar não pode derrubar a navegação');
  } finally {
    console.error = erroOriginal;
  }
  assert.deepEqual(feito, ['ultima', 'primeira'], 'meia limpeza é melhor que nenhuma');
});

test('encerrar numa página sem registro é inofensivo', () => {
  assert.equal(encerrar(pagina()), 0);
  assert.equal(encerrar(null), 0);
  assert.equal(encerrar(undefined), 0);
});

test('aoSair ignora chamada malformada em vez de quebrar a página', () => {
  const p = pagina();
  assert.doesNotThrow(() => aoSair(p, null));
  assert.doesNotThrow(() => aoSair(null, () => {}));
  assert.doesNotThrow(() => aoSair(p, 'não é função'));
  assert.equal(pendentes(p), 0);
});

test('uma página não enxerga a limpeza da outra', () => {
  const a = pagina();
  const b = pagina();
  let tocouB = false;
  aoSair(a, () => {});
  aoSair(b, () => { tocouB = true; });
  encerrar(a);
  assert.equal(tocouB, false);
  assert.equal(pendentes(b), 1, 'a limpeza de B continua pendente');
});

test('registrar durante o encerramento não entra em laço infinito', () => {
  /* Cenário real: uma limpeza que remonta algo e registra outra limpeza. O
   * registro já foi esvaziado quando as funções rodam, então o novo fica para
   * o próximo ciclo em vez de ser executado no meio deste. */
  const p = pagina();
  let n = 0;
  aoSair(p, () => { n += 1; aoSair(p, () => { n += 1; }); });
  encerrar(p);
  assert.equal(n, 1);
  assert.equal(pendentes(p), 1, 'a limpeza registrada durante a saída fica para depois');
});
