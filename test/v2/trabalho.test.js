/**
 * Escalonador de trabalho.
 *
 * Os três invariantes que carregam o resto:
 *
 * 1. **O teto é respeitado.** Sem ele, dez módulos pedindo rede ao subir viram
 *    dez conexões simultâneas e a página que o operador está olhando espera
 *    atrás de trabalho de fundo.
 * 2. **Cancelar cancela de verdade.** Cancelamento que só ignora o resultado
 *    não é cancelamento — o trabalho continua gastando rede e escrevendo em
 *    algo que já saiu da tela.
 * 3. **Ninguém faminta ninguém.** Um bot com duzentas tarefas não pode
 *    monopolizar o teto global.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarEscalonador, Cancelado, FilaCheia, INTERATIVO, FUNDO } from '../../v2/core/trabalho.js';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════ o básico ═══════════ */

test('executa e devolve o resultado', async () => {
  const e = criarEscalonador();
  assert.equal(await e.enfileirar('a', 'x', () => 42), 42);
});

test('propaga a falha sem derrubar o escalonador', async () => {
  const e = criarEscalonador();
  await assert.rejects(() => e.enfileirar('a', 'x', () => { throw new Error('boom'); }));
  assert.equal(await e.enfileirar('a', 'y', () => 'ok'), 'ok', 'o escalonador travou depois da falha');
});

test('função SÍNCRONA que levanta não trava o escalonador', async () => {
  /* Sem o catch síncrono, `rodando` nunca desce e tudo para para sempre. */
  const e = criarEscalonador({ limite: 1 });
  await assert.rejects(() => e.enfileirar('a', 'x', () => { throw new Error('sync'); }));
  assert.equal(await e.enfileirar('a', 'y', () => 'passou'), 'passou');
  assert.equal(e.estado().rodando, 0);
});

/* ═══════════ teto de concorrência ═══════════ */

test('nunca passa do limite simultâneo', async () => {
  let ativos = 0, pico = 0;
  const e = criarEscalonador({ limite: 3, limitePorModulo: 3 });

  await Promise.all(Array.from({ length: 12 }, (_, i) =>
    e.enfileirar('a', `t${i}`, async () => {
      ativos += 1; pico = Math.max(pico, ativos);
      await espera(10);
      ativos -= 1;
    })));

  assert.ok(pico <= 3, `pico foi ${pico}, limite era 3`);
  assert.equal(e.estado().rodando, 0);
});

test('todas terminam, nenhuma fica presa', async () => {
  const e = criarEscalonador({ limite: 2, limitePorModulo: 2 });
  const feitas = [];
  await Promise.all(Array.from({ length: 20 }, (_, i) =>
    e.enfileirar('a', `t${i}`, async () => { await espera(1); feitas.push(i); })));
  assert.equal(feitas.length, 20);
  assert.equal(e.estado().naFila, 0);
});

/* ═══════════ prioridade ═══════════ */

test('interativo passa na frente do trabalho de fundo', async () => {
  const ordem = [];
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });

  /* A primeira ocupa a única vaga; as três seguintes disputam a fila. */
  const bloqueio = e.enfileirar('a', 'bloqueio', async () => { await espera(20); ordem.push('bloqueio'); });
  const p = [
    e.enfileirar('a', 'fundo', async () => { ordem.push('fundo'); }, { prioridade: FUNDO }),
    e.enfileirar('a', 'normal', async () => { ordem.push('normal'); }),
    e.enfileirar('a', 'interativo', async () => { ordem.push('interativo'); }, { prioridade: INTERATIVO })
  ];

  await Promise.all([bloqueio, ...p]);
  assert.deepEqual(ordem, ['bloqueio', 'interativo', 'normal', 'fundo']);
});

test('mesma prioridade respeita a ordem de chegada', async () => {
  const ordem = [];
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });
  const bloqueio = e.enfileirar('a', 'b', async () => espera(15));
  const p = ['x', 'y', 'z'].map((n) => e.enfileirar('a', n, () => ordem.push(n)));
  await Promise.all([bloqueio, ...p]);
  assert.deepEqual(ordem, ['x', 'y', 'z']);
});

/* ═══════════ justiça entre módulos ═══════════ */

test('um módulo com MUITAS tarefas não faminta os outros', async () => {
  /* O caso concreto: um bot enfileira duzentas coletas e o resto do Baluarte
   * para. O teto por módulo existe para isso. */
  const e = criarEscalonador({ limite: 4, limitePorModulo: 2 });
  let terminouOutro = -1;
  let contador = 0;

  const guloso = Array.from({ length: 30 }, (_, i) =>
    e.enfileirar('bot', `c${i}`, async () => { await espera(5); contador += 1; }));

  const outro = e.enfileirar('militar', 'urgente', async () => {
    await espera(1);
    terminouOutro = contador;
  });

  await Promise.all([...guloso, outro]);

  assert.ok(terminouOutro >= 0, 'a tarefa do outro módulo nunca rodou');
  assert.ok(terminouOutro < 25, `esperou ${terminouOutro} tarefas do bot antes de rodar`);
});

test('o teto por módulo é respeitado', async () => {
  const e = criarEscalonador({ limite: 8, limitePorModulo: 2 });
  let picoDoBot = 0, ativosDoBot = 0;

  await Promise.all(Array.from({ length: 10 }, (_, i) =>
    e.enfileirar('bot', `t${i}`, async () => {
      ativosDoBot += 1; picoDoBot = Math.max(picoDoBot, ativosDoBot);
      await espera(5);
      ativosDoBot -= 1;
    })));

  assert.ok(picoDoBot <= 2, `o bot chegou a ${picoDoBot} simultâneas com teto 2`);
});

/* ═══════════ cancelamento ═══════════ */

test('cancelar ENQUANTO espera tira da fila e rejeita', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1 });
  const ctrl = new AbortController();
  let rodou = false;

  const bloqueio = e.enfileirar('a', 'b', async () => espera(20));
  const cancelada = e.enfileirar('a', 'c', () => { rodou = true; }, { sinal: ctrl.signal });
  ctrl.abort();

  await assert.rejects(() => cancelada, Cancelado);
  await bloqueio;
  await espera(10);
  assert.equal(rodou, false, 'a tarefa cancelada rodou mesmo assim');
});

test('cancelar libera a vaga na fila em vez de segurá-la', async () => {
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 2 });
  const ctrl = new AbortController();

  const bloqueio = e.enfileirar('a', 'b', async () => espera(20));
  const c1 = e.enfileirar('a', 'c1', () => 1, { sinal: ctrl.signal });
  ctrl.abort();
  await assert.rejects(() => c1, Cancelado);

  /* Se a cancelada tivesse ficado na fila, esta seria recusada. */
  const c2 = e.enfileirar('a', 'c2', () => 'entrou');
  await bloqueio;
  assert.equal(await c2, 'entrou');
});

test('o sinal chega à função — quem executa pode abortar de verdade', async () => {
  /* Cancelamento que só descarta o resultado não é cancelamento: o fetch
   * continua, gasta rede e escreve no que já saiu da tela. */
  const e = criarEscalonador();
  const ctrl = new AbortController();
  let recebido;

  const p = e.enfileirar('a', 'x', async ({ sinal }) => {
    recebido = sinal;
    await espera(30);
    return 'terminou';
  }, { sinal: ctrl.signal });

  await espera(5);
  assert.equal(recebido, ctrl.signal, 'a função não recebeu o sinal');
  ctrl.abort();
  assert.equal(await p, 'terminou', 'quem já começou decide se para — o escalonador não mata');
});

/* ═══════════ fila com teto ═══════════ */

test('fila cheia RECUSA na hora em vez de pendurar', async () => {
  /* Promessa que nunca resolve é o pior jeito de comunicar "não vai dar". */
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 2 });
  const bloqueio = e.enfileirar('a', 'b', async () => espera(20));

  e.enfileirar('a', 'f1', () => 1);
  e.enfileirar('a', 'f2', () => 2);
  await assert.rejects(() => e.enfileirar('a', 'f3', () => 3), FilaCheia);

  await bloqueio;
});

/* ═══════════ observabilidade ═══════════ */

test('estado() mostra o que está rodando, por módulo', async () => {
  const e = criarEscalonador({ limite: 4, limitePorModulo: 4 });
  const p = [
    e.enfileirar('a', 'x', async () => espera(20)),
    e.enfileirar('a', 'y', async () => espera(20)),
    e.enfileirar('b', 'z', async () => espera(20))
  ];
  await espera(5);

  const s = e.estado();
  assert.equal(s.rodando, 3);
  assert.deepEqual(s.porModulo, { a: 2, b: 1 });
  await Promise.all(p);
  assert.deepEqual(e.estado().porModulo, {}, 'o contador por módulo vazou');
});

test('alimenta as métricas com duração e desfecho', async () => {
  const { criarMetricas } = await import('../../v2/core/metricas.js');
  const metricas = criarMetricas();
  const e = criarEscalonador({}, { metricas });

  await e.enfileirar('a', 'ok', () => 1);
  await assert.rejects(() => e.enfileirar('a', 'ruim', () => { throw new Error('x'); }));

  const m = metricas.retrato();
  assert.equal(m.medidas.trabalho_ms['modulo=a,ok=true'].n, 1);
  assert.equal(m.medidas.trabalho_ms['modulo=a,ok=false'].n, 1);
  assert.equal(m.contadores.trabalho_enfileirado['modulo=a'], 2);
});

/* ═══════════ recorte por módulo ═══════════ */

test('paraModulo carimba o dono — o módulo não escolhe de quem é o trabalho', async () => {
  const { criarMetricas } = await import('../../v2/core/metricas.js');
  const metricas = criarMetricas();
  const e = criarEscalonador({}, { metricas });

  await e.paraModulo('militar').fazer('busca', () => 'ok');
  assert.equal(metricas.retrato().contadores.trabalho_enfileirado['modulo=militar'], 1);
});

/* ═══════════ isolando cada defesa ═══════════
 *
 * Estes três testes existem porque a primeira rodada de mutantes teve TRÊS
 * sobreviventes — e a causa não era o código, eram os testes:
 *
 * - o teto global nunca era exercitado sozinho, porque o teto por módulo estava
 *   igual e salvava;
 * - as duas defesas de cancelamento (tirar da fila / checar antes de executar)
 *   se cobrem, então matar uma deixava a outra passando o teste.
 *
 * Defesa em profundidade é boa; defesa não testada individualmente é sorte. */

test('o teto GLOBAL segura mesmo com o teto por módulo folgado', async () => {
  let ativos = 0, pico = 0;
  const e = criarEscalonador({ limite: 2, limitePorModulo: 99 });

  await Promise.all(Array.from({ length: 10 }, (_, i) =>
    e.enfileirar('a', `t${i}`, async () => {
      ativos += 1; pico = Math.max(pico, ativos);
      await espera(8);
      ativos -= 1;
    })));

  assert.ok(pico <= 2, `pico ${pico} com limite global 2 e por-módulo 99`);
});

test('cancelar na fila tira o item NA HORA, não quando chegaria a vez', async () => {
  /* Isola a remoção observando a fila ENQUANTO o bloqueio ainda roda.
   *
   * A primeira versão deste teste falhava em isolar: ela esperava a rejeição, e
   * sem a remoção a rejeição vem mesmo — só que lá na frente, quando a tarefa
   * seria executada. O `await` mascarava a diferença esperando mais. Só o
   * estado da fila, medido no meio, separa "removeu" de "adiou". */
  const e = criarEscalonador({ limite: 1, limitePorModulo: 1, tetoFila: 5 });
  const ctrl = new AbortController();

  const bloqueio = e.enfileirar('a', 'b', async () => espera(40));
  /* O `catch` é anexado JÁ: a rejeição por cancelamento chega no instante do
   * abort, e sem tratador nesse momento o Node reporta rejeição não tratada e
   * derruba o teste antes da asserção. */
  const f1 = e.enfileirar('a', 'f1', () => 1, { sinal: ctrl.signal }).catch((err) => err);
  const f2 = e.enfileirar('a', 'f2', () => 2);

  await espera(5);
  assert.equal(e.estado().naFila, 2, 'as duas deviam estar esperando');

  ctrl.abort();
  await espera(5);
  assert.equal(e.estado().naFila, 1, 'a cancelada continuou ocupando lugar na fila');

  assert.ok((await f1) instanceof Cancelado, 'a cancelada não rejeitou com Cancelado');
  await bloqueio;
  await f2;
});

test('sinal JÁ abortado no enfileiramento não executa a função', async () => {
  /* Isola a checagem em `executar()`: um sinal já abortado não dispara o evento
   * 'abort' (ele só dispara na transição), então a remoção da fila não acontece
   * e a segunda defesa é a única que resta. */
  const ctrl = new AbortController();
  ctrl.abort();

  const e = criarEscalonador();
  let rodou = false;
  await assert.rejects(
    () => e.enfileirar('a', 'x', () => { rodou = true; }, { sinal: ctrl.signal }),
    Cancelado
  );
  assert.equal(rodou, false, 'executou uma tarefa com sinal já abortado');
});
