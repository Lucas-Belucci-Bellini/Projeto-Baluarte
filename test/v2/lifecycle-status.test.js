/**
 * Retrato do lifecycle por módulo.
 *
 * O que estes testes protegem, do mais grave ao menos:
 *
 * 1. **A transição ganha do estado assentado.** Na descida o módulo continua em
 *    `vivos()` enquanto desce. Perguntar a `vivos()` primeiro devolveria
 *    `running` para quem está parando — um retrato verde sobre um sistema sendo
 *    desmontado.
 * 2. **`starting` e `stopping` são produzidos, não só declarados.** Enquanto
 *    ninguém os emitisse, um retrato que nunca acusa transição era
 *    indistinguível de um sistema que nunca transiciona.
 * 3. **Módulo ainda não alcançado na subida é `registered`, não `stopped`.**
 *    `stopped` afirma "saiu do ar" sobre quem nunca entrou.
 * 4. **O resumo fecha com `total`.** Contador que falta some com o módulo da
 *    soma.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { criarStatusLifecycle, ESTADOS_MODULO } from '../../v2/core/lifecycle-status.js';

function registry() {
  const modules = new Map([
    ['core', { name: 'Core', version: '2.0.0' }],
    ['ui', { name: 'UI', version: '2.0.0' }],
    ['broken', { name: 'Broken', version: '2.0.0' }]
  ]);
  return {
    listar: () => [...modules.keys()],
    modulo: (id) => modules.get(id) ?? null
  };
}

/* Ciclo assentado: nada em voo. É o padrão porque a maioria das perguntas é
 * sobre estado estável — o voo é a exceção, e cada teste que precisa dele diz. */
const parado = (over = {}) => ({
  fase: 'no-ar',
  vivos: () => [],
  falhas: () => [],
  emTransicao: () => null,
  ...over
});

test('módulos vivos aparecem como running', () => {
  const status = criarStatusLifecycle(registry(), parado({ vivos: () => ['core', 'ui'] }));
  assert.equal(status.estadoDo('core'), 'running');
  assert.equal(status.estadoDo('ui'), 'running');
  assert.equal(status.estadoDo('broken'), 'stopped');
});

test('falha do módulo é preservada no retrato', () => {
  const falha = { modulo: 'broken', fase: 'init', motivo: 'timeout' };
  const status = criarStatusLifecycle(
    registry(),
    parado({ vivos: () => ['core'], falhas: () => [falha] })
  );
  assert.equal(status.estadoDo('broken'), 'failed');
  assert.deepEqual(status.retrato()[2].falha, falha);
});

test('resumo contabiliza os estados', () => {
  const ciclo = parado({
    vivos: () => ['core', 'ui'],
    falhas: () => [{ modulo: 'broken', fase: 'init', motivo: 'erro' }]
  });
  assert.deepEqual(criarStatusLifecycle(registry(), ciclo).resumo(), {
    total: 3,
    running: 2,
    starting: 0,
    stopping: 0,
    failed: 1,
    stopped: 0,
    registered: 0
  });
});

test('antes do boot módulos ficam registered', () => {
  const status = criarStatusLifecycle(registry(), parado({ fase: 'parado' }));
  assert.equal(status.estadoDo('core'), 'registered');
});

/* ═══════════ transições ═══════════ */

test('o módulo em voo na subida é starting', () => {
  const ciclo = parado({
    fase: 'subindo',
    vivos: () => ['core'],
    emTransicao: () => ({ modulo: 'ui', direcao: 'subindo', etapa: 'init' })
  });
  const status = criarStatusLifecycle(registry(), ciclo);
  assert.equal(status.estadoDo('ui'), 'starting');
  assert.equal(status.estadoDo('core'), 'running', 'quem já subiu não vira starting');
});

test('na subida, módulo ainda não alcançado é registered — e não stopped', () => {
  const ciclo = parado({
    fase: 'subindo',
    vivos: () => ['core'],
    emTransicao: () => ({ modulo: 'ui', direcao: 'subindo', etapa: 'runtime' })
  });
  /* `broken` não subiu, não falhou e não está em voo: o ciclo ainda não chegou
   * nele. Dizer `stopped` seria afirmar que saiu do ar. */
  assert.equal(criarStatusLifecycle(registry(), ciclo).estadoDo('broken'), 'registered');
});

test('o módulo em voo na descida é stopping, mesmo continuando vivo', () => {
  /* A asserção que dá nome ao item: `ui` ainda está em `vivos()` — é assim que o
   * ciclo desce — e mesmo assim o retrato precisa dizer `stopping`. Se a ordem
   * das perguntas inverter, isto vira `running`. */
  const ciclo = parado({
    fase: 'descendo',
    vivos: () => ['core', 'ui'],
    emTransicao: () => ({ modulo: 'ui', direcao: 'descendo', etapa: 'stop' })
  });
  const status = criarStatusLifecycle(registry(), ciclo);
  assert.equal(status.estadoDo('ui'), 'stopping');
  assert.equal(status.estadoDo('core'), 'running');
});

test('resumo conta starting e stopping', () => {
  const emVoo = parado({
    fase: 'subindo',
    vivos: () => ['core'],
    emTransicao: () => ({ modulo: 'ui', direcao: 'subindo', etapa: 'start' })
  });
  const r = criarStatusLifecycle(registry(), emVoo).resumo();
  assert.equal(r.starting, 1);
  assert.equal(r.stopping, 0);
  /* O resumo tem que fechar: se um contador faltar, o módulo some da soma. */
  const soma = r.running + r.starting + r.stopping + r.failed + r.stopped + r.registered;
  assert.equal(soma, r.total, 'a soma dos estados precisa fechar com total');
});

test('ciclo sem emTransicao é recusado na construção', () => {
  /* Aceitar com fallback produziria um retrato que nunca acusa transição —
   * indistinguível de um sistema que não transiciona. É a falha silenciosa que
   * este repositório já pagou três vezes. */
  const semTransicao = { fase: 'no-ar', vivos: () => [], falhas: () => [] };
  assert.throws(() => criarStatusLifecycle(registry(), semTransicao), /emTransicao/);
});

test('todo estado do vocabulário tem contador no resumo', () => {
  /* Amarra a lista ao resumo: acrescentar um estado sem contador passa a quebrar
   * aqui, em vez de sumir silenciosamente da soma. */
  const resumo = criarStatusLifecycle(registry(), parado()).resumo();
  for (const estado of ESTADOS_MODULO) {
    assert.ok(estado in resumo, `falta contador para "${estado}" no resumo`);
  }
});
