/**
 * A saúde do escalonador — o que `estado()` esquece por ser instantâneo.
 *
 * O defeito: depois de a fila drenar, um escalonador que recusou 400 trabalhos
 * por `FilaCheia` fica IDÊNTICO a um que nunca recebeu nenhum. A recusa ia para
 * `deps.metricas?.contar?.()`, que é opcional — e sem métricas injetadas, que é
 * o padrão, desaparecia inteira.
 *
 * O veredito usa a única condição bloqueante que este código já decide sozinho:
 * fila no teto, isto é, a recusar trabalho NESTE instante. Saturação é
 * contrapressão normal e falha de trabalho é problema de quem o pediu — virar
 * qualquer das duas em veredito exigiria escolher um limiar, que é exatamente
 * a política não decidida que mantém o `retry` desta fase por fazer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { criarEscalonador, Cancelado, FilaCheia } from '../../v2/core/trabalho.js';

const adiar = () => new Promise((r) => setTimeout(r, 0));

test('sem métricas injetadas, a recusa deixa de desaparecer', async () => {
  /* O defeito inteiro: `criarEscalonador({...})` sem o segundo argumento. */
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 1 });
  let soltar;
  const preso = new Promise((r) => { soltar = r; });

  e.enfileirar('m', 'segura', () => preso);
  await adiar();
  e.enfileirar('m', 'na-fila', () => 1).catch(() => {});
  await adiar();
  await assert.rejects(e.enfileirar('m', 'recusado', () => 1), FilaCheia);

  assert.equal(e.saude().contagem.recusados, 1);

  soltar();
  await adiar(); await adiar();
  /* E depois de drenar continua lá — que é o ponto todo. */
  assert.equal(e.saude().contagem.recusados, 1, 'a recusa evaporou ao drenar');
  assert.equal(e.saude().estado.naFila, 0);
});

test('fila no teto é unhealthy, e drenar devolve a healthy', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 1 });
  let soltar;
  const preso = new Promise((r) => { soltar = r; });

  const emCurso = e.enfileirar('m', 'segura', () => preso);
  await adiar();
  assert.equal(e.saude().readiness, 'healthy', 'a correr não é doente');

  const naFila = e.enfileirar('m', 'espera', () => 2);
  await adiar();
  const s = e.saude();
  assert.equal(s.readiness, 'unhealthy');
  assert.match(s.motivos.join(' '), /fila no teto/);

  soltar();
  await emCurso; await naFila;
  await adiar();
  assert.equal(e.saude().readiness, 'healthy');
});

test('saturado com fila NÃO é unhealthy: é contrapressão a funcionar', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 100 });
  let soltar;
  const preso = new Promise((r) => { soltar = r; });

  const a = e.enfileirar('m', 'segura', () => preso);
  const b = e.enfileirar('m', 'espera', () => 2);
  await adiar();

  const s = e.saude();
  assert.equal(s.readiness, 'healthy', 'saturação passou a degradar o veredito');
  assert.match(s.motivos.join(' '), /saturado/);

  soltar(); await a; await b;
});

test('trabalho que falha conta, e não vira veredito', async () => {
  const e = criarEscalonador();
  for (let i = 0; i < 20; i += 1) {
    await assert.rejects(e.enfileirar('m', 'ruim', () => { throw new Error('x'); }));
  }
  const s = e.saude();
  assert.equal(s.contagem.falhados, 20);
  assert.equal(s.contagem.concluidos, 0);
  assert.equal(s.readiness, 'healthy', 'falha de trabalho passou a degradar o veredito');
  assert.match(s.motivos.join(' '), /20 trabalho\(s\) falhado/);
});

test('trabalho que rejeita de forma síncrona também conta como falhado', async () => {
  /* O caminho do `catch` do `executar`, que é outro braço do código. */
  const e = criarEscalonador();
  await assert.rejects(e.enfileirar('m', 'sincrono', () => { throw new Error('já'); }));
  assert.equal(e.saude().contagem.falhados, 1);
});

test('concluído e falhado somam com o enfileirado', async () => {
  const e = criarEscalonador();
  await e.enfileirar('m', 'ok', () => 1);
  await e.enfileirar('m', 'ok2', () => 2);
  await assert.rejects(e.enfileirar('m', 'mau', () => { throw new Error('x'); }));

  const c = e.saude().contagem;
  assert.equal(c.enfileirados, 3);
  assert.equal(c.concluidos, 2);
  assert.equal(c.falhados, 1);
  assert.equal(c.concluidos + c.falhados, c.enfileirados);
});

test('cancelamento na fila conta', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });
  let soltar;
  const preso = new Promise((r) => { soltar = r; });
  const emCurso = e.enfileirar('m', 'segura', () => preso);
  await adiar();

  const ctrl = new AbortController();
  const cancelado = e.enfileirar('m', 'espera', () => 1, { sinal: ctrl.signal });
  await adiar();
  ctrl.abort();
  await assert.rejects(cancelado, Cancelado);

  assert.equal(e.saude().contagem.cancelados, 1);
  assert.match(e.saude().motivos.join(' '), /1 trabalho\(s\) cancelado/);

  soltar(); await emCurso;
});

test('cancelado antes de começar conta uma vez só', async () => {
  /* Dois caminhos escrevem `cancelados` — o listener do abort e o `executar`.
   * Um trabalho abortado não pode ser contado nos dois. */
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });
  const ctrl = new AbortController();
  ctrl.abort();
  await assert.rejects(e.enfileirar('m', 'nasce-morto', () => 1, { sinal: ctrl.signal }), Cancelado);
  assert.equal(e.saude().contagem.cancelados, 1, 'contou duas vezes o mesmo cancelamento');
});

test('escalonador em repouso é healthy e sem motivos', () => {
  const s = criarEscalonador().saude();
  assert.equal(s.readiness, 'healthy');
  assert.deepEqual(s.motivos, []);
  assert.deepEqual(s.contagem, {
    enfileirados: 0, concluidos: 0, falhados: 0, recusados: 0, cancelados: 0
  });
});

test('a saúde resume duração de tarefas concluídas e falhadas com relógio injetado', async () => {
  const tempos = [10, 15, 18, 26, 40, 47];
  const e = criarEscalonador({ relogio: () => tempos.shift() });

  await e.enfileirar('m', 'ok', () => 1);
  await assert.rejects(e.enfileirar('m', 'falha', () => { throw new Error('x'); }));

  assert.deepEqual(e.saude().latencia, {
    n: 2,
    mediaMs: 6.5,
    minMs: 5,
    maxMs: 8,
  });
});

test('relógio inválido não quebra o escalonador nem cria latência falsa', async () => {
  const e = criarEscalonador({ relogio: () => { throw new Error('clock indisponível'); } });
  assert.equal(await e.enfileirar('m', 'ok', () => 1), 1);
  assert.deepEqual(e.saude().latencia, {
    n: 0,
    mediaMs: 0,
    minMs: null,
    maxMs: null,
  });
});

test('a saúde traz o estado, e ele bate com estado()', async () => {
  const e = criarEscalonador({ limite: 2, limitePorModulo: 2 });
  await e.enfileirar('m', 'ok', () => 1);
  assert.deepEqual(e.saude().estado, e.estado());
});

test('a saúde não mudou nada do que o escalonador já garantia', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });
  const ordem = [];
  const a = e.enfileirar('m', 'a', async () => { ordem.push('a'); });
  const fundo = e.enfileirar('m', 'fundo', async () => { ordem.push('fundo'); }, { prioridade: 500 });
  const inter = e.enfileirar('m', 'inter', async () => { ordem.push('inter'); }, { prioridade: 10 });
  await Promise.all([a, fundo, inter]);
  /* A prioridade continua a mandar: o interativo passa à frente do fundo. */
  assert.deepEqual(ordem, ['a', 'inter', 'fundo']);
  assert.equal(await e.paraModulo('m').fazer('via-modulo', () => 7), 7);
});
