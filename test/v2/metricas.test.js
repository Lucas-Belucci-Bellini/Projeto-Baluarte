/**
 * Métricas.
 *
 * O teste que mais importa aqui não é de contagem — é o de **cardinalidade**.
 * Métrica com rótulo vindo de entrada (url, id de tarefa, nome de arquivo)
 * cresce sem limite e mata o processo devagar, sem ninguém ligar o efeito à
 * causa. É falha silenciosa E adiada, o pior par possível.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarMetricas, TETO_SERIES } from '../../v2/core/metricas.js';

/* ═══════════ contadores ═══════════ */

test('contar soma', () => {
  const m = criarMetricas();
  m.contar('coletas');
  m.contar('coletas');
  m.contar('coletas', undefined, 5);
  assert.equal(m.retrato().contadores.coletas[''], 7);
});

test('rótulos separam séries', () => {
  const m = criarMetricas();
  m.contar('coletas', { fonte: 'wikipedia' });
  m.contar('coletas', { fonte: 'janes' });
  m.contar('coletas', { fonte: 'wikipedia' });

  const c = m.retrato().contadores.coletas;
  assert.equal(c['fonte=wikipedia'], 2);
  assert.equal(c['fonte=janes'], 1);
});

test('a ORDEM dos rótulos não parte a série em duas', () => {
  /* `{a,b}` e `{b,a}` são a mesma medida; sem ordenar, viram duas linhas e
   * nenhuma das duas está certa. */
  const m = criarMetricas();
  m.contar('x', { a: '1', b: '2' });
  m.contar('x', { b: '2', a: '1' });
  assert.deepEqual(m.retrato().contadores.x, { 'a=1,b=2': 2 });
});

/* ═══════════ cardinalidade — o núcleo ═══════════ */

test('estourar o teto NÃO cresce sem limite', () => {
  const m = criarMetricas();
  for (let i = 0; i < TETO_SERIES + 50; i++) m.contar('coletas', { url: `u${i}` });

  const series = Object.keys(m.retrato().contadores.coletas);
  assert.equal(series.length, TETO_SERIES + 1, 'o teto não segurou');
});

test('o excedente vai para «outros» — visível, não descartado', () => {
  /* Descartar em silêncio faria a soma mentir. O balde diz "há mais coisa aqui". */
  const m = criarMetricas();
  for (let i = 0; i < TETO_SERIES + 10; i++) m.contar('c', { u: `u${i}` });

  const c = m.retrato().contadores.c;
  assert.equal(c['«outros»'], 10, 'o excedente sumiu em vez de acumular');
});

test('métrica truncada é ANUNCIADA no retrato', () => {
  /* Quem lê precisa saber que está vendo resumo truncado, não a verdade. */
  const m = criarMetricas();
  for (let i = 0; i < TETO_SERIES + 1; i++) m.contar('grande', { u: `u${i}` });
  m.contar('pequena');

  assert.deepEqual(m.retrato().truncadas, ['grande']);
});

test('série que JÁ existe continua contando depois do estouro', () => {
  /* Congelar as antigas no momento do estouro seria perder justamente a série
   * que interessa acompanhar. */
  const m = criarMetricas();
  m.contar('c', { u: 'importante' });
  for (let i = 0; i < TETO_SERIES + 5; i++) m.contar('c', { u: `lixo${i}` });
  m.contar('c', { u: 'importante' });

  assert.equal(m.retrato().contadores.c['u=importante'], 2);
});

/* ═══════════ medidas ═══════════ */

test('medir guarda n, média, min e max', () => {
  const m = criarMetricas();
  [10, 20, 60].forEach((v) => m.medir('busca_ms', v));
  assert.deepEqual(m.retrato().medidas.busca_ms[''], { n: 3, media: 30, min: 10, max: 60 });
});

test('NaN é ignorado — envenenaria min/max para sempre', () => {
  const m = criarMetricas();
  m.medir('x', 10);
  m.medir('x', NaN);
  m.medir('x', Infinity);
  assert.deepEqual(m.retrato().medidas.x[''], { n: 1, media: 10, min: 10, max: 10 });
});

/* ═══════════ cronometrar ═══════════ */

test('cronometrar mede o caminho feliz', () => {
  const m = criarMetricas();
  const r = m.cronometrar('op', () => 'resultado');
  assert.equal(r, 'resultado');
  assert.equal(m.retrato().medidas.op['ok=true'].n, 1);
});

test('cronometrar mede a FALHA e separa por ok — e propaga o erro', () => {
  /* Sem o rótulo `ok`, uma operação que falha rápido puxa a média para baixo e
   * esconde que o caminho feliz piorou. */
  const m = criarMetricas();
  assert.throws(() => m.cronometrar('op', () => { throw new Error('x'); }));
  assert.equal(m.retrato().medidas.op['ok=false'].n, 1);
  assert.equal(m.retrato().medidas.op['ok=true'], undefined);
});

test('cronometrar funciona com promessa, nos dois desfechos', async () => {
  const m = criarMetricas();
  await m.cronometrar('a', async () => 1);
  await assert.rejects(() => m.cronometrar('a', async () => { throw new Error('y'); }));

  const med = m.retrato().medidas.a;
  assert.equal(med['ok=true'].n, 1);
  assert.equal(med['ok=false'].n, 1);
});

test('cronometrar não engole o valor de retorno assíncrono', () => {
  const m = criarMetricas();
  return m.cronometrar('a', async () => 'valor').then((v) => assert.equal(v, 'valor'));
});

/* ═══════════ recorte por módulo ═══════════ */

test('o rótulo do módulo é CARIMBADO, não pedido', () => {
  /* Se o módulo informasse o próprio nome, poderia informar outro. */
  const m = criarMetricas();
  m.paraModulo('militar').contar('busca', { fonte: 'wiki' });
  assert.equal(m.retrato().contadores.busca['fonte=wiki,modulo=militar'], 1);
});

test('dois módulos não se confundem na mesma métrica', () => {
  const m = criarMetricas();
  m.paraModulo('a').medir('ms', 10);
  m.paraModulo('b').medir('ms', 30);

  const med = m.retrato().medidas.ms;
  assert.equal(med['modulo=a'].media, 10);
  assert.equal(med['modulo=b'].media, 30);
});

test('cronometrar por módulo carimba e mede', async () => {
  const m = criarMetricas();
  await m.paraModulo('militar').cronometrar('wiki', async () => 'ok');
  assert.equal(m.retrato().medidas.wiki['modulo=militar,ok=true'].n, 1);
});

test('o módulo NÃO consegue se passar por outro', () => {
  /* `{ ...rotulos, modulo: id }` — o carimbo vem por último de propósito. Com a
   * ordem invertida, um módulo passaria `{ modulo: 'outro' }` e falsificaria a
   * atribuição. Parece paranoia num projeto de uma pessoa; deixa de parecer
   * quando módulos vierem de outros repositórios. */
  const m = criarMetricas();
  m.paraModulo('militar').contar('busca', { modulo: 'jarvis' });

  const c = m.retrato().contadores.busca;
  assert.deepEqual(Object.keys(c), ['modulo=militar'], 'o módulo falsificou a origem');
});
