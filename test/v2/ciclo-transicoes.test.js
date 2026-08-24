/**
 * Transições observáveis — no ciclo REAL, não em duplo.
 *
 * O `lifecycle-status.test.js` prova a projeção: dado um ciclo que relata voo, o
 * retrato diz `starting`/`stopping`. Isso não prova que algum ciclo relate voo
 * algum dia — que é exatamente a doença que este repositório já pagou três vezes
 * (fachada, contract test, Runtime Host): peça correta, testada, e que ninguém
 * em produção aciona. Aqui quem responde é o `criarCiclo` de verdade.
 *
 * Nada de espera por relógio: cada módulo avisa que entrou na fase (`entrou`) e
 * só sai quando o teste solta (`liberar`). O ponto de observação é determinado
 * por sinal, não por tempo — timer aqui mediria a máquina, não o ciclo.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarCiclo } from '../../v2/core/ciclo.js';
import { criarStatusLifecycle } from '../../v2/core/lifecycle-status.js';
import { definirDestino, coletor } from '../../v2/core/log.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';

const deps = {
  storage: { get: () => undefined, set: () => true },
  permissoes: criarPermissoes()
};

const mod = (id, lifecycle = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  lifecycle
});

function montar(...mods) {
  const r = criarRegistry();
  mods.forEach((m) => r.registrar(m));
  r.selar();
  return r;
}

/** Uma fase que avisa quando entra e só termina quando mandarem. */
function portao() {
  let abrir;
  let avisar;
  const entrou = new Promise((resolve) => { avisar = resolve; });
  const liberado = new Promise((resolve) => { abrir = resolve; });
  return {
    entrou,
    liberar: () => abrir(),
    fase: () => { avisar(); return liberado; }
  };
}

beforeEach(() => { definirDestino(coletor().destino); });

test('durante o init do módulo real, o retrato diz starting', async () => {
  const g = portao();
  const registry = montar(mod('a', { init: g.fase }), mod('b'));
  const ciclo = criarCiclo(registry, deps);
  const status = criarStatusLifecycle(registry, ciclo);

  const subida = ciclo.subir();
  await g.entrou;

  assert.deepEqual(
    ciclo.emTransicao(),
    { modulo: 'a', direcao: 'subindo', etapa: 'init' },
    'o ciclo real precisa relatar o módulo em voo e a fase em que ele está'
  );
  assert.equal(status.estadoDo('a'), 'starting');
  /* `b` não foi alcançado. Antes disto ele saía como `stopped` — "saiu do ar"
   * sobre um módulo que nunca entrou. */
  assert.equal(status.estadoDo('b'), 'registered', 'quem o ciclo não alcançou é registered');
  assert.equal(status.resumo().starting, 1);

  g.liberar();
  await subida;

  assert.equal(ciclo.emTransicao(), null, 'transição não pode ficar pendurada');
  assert.equal(status.estadoDo('a'), 'running');
  assert.equal(status.resumo().starting, 0);
});

test('durante o stop do módulo real, o retrato diz stopping mesmo com ele ainda vivo', async () => {
  const g = portao();
  const registry = montar(mod('a'), mod('b', { stop: g.fase }));
  const ciclo = criarCiclo(registry, deps);
  const status = criarStatusLifecycle(registry, ciclo);

  await ciclo.subir();
  const descida = ciclo.descer();
  await g.entrou;

  /* A descida é em ordem inversa, então `b` desce primeiro. Ele ainda está em
   * `vivos()` — é assim que o ciclo desce — e o retrato precisa dizer
   * `stopping` assim mesmo. */
  assert.ok(ciclo.vivos().includes('b'), 'premissa: quem está descendo ainda está vivo');
  assert.deepEqual(ciclo.emTransicao(), { modulo: 'b', direcao: 'descendo', etapa: 'stop' });
  assert.equal(status.estadoDo('b'), 'stopping');
  assert.equal(status.estadoDo('a'), 'running', 'quem ainda não desceu segue running');
  assert.equal(status.resumo().stopping, 1);

  g.liberar();
  await descida;

  assert.equal(ciclo.emTransicao(), null);
  assert.deepEqual(ciclo.vivos(), []);
});

test('quem já desceu sai de vivos antes do fim da descida', async () => {
  /* Sem a saída progressiva, `boot.diagnostico()` listava o sistema inteiro com
   * rotas e permissões durante toda a descida — dizendo que estava no ar
   * enquanto era desmontado. */
  const g = portao();
  const registry = montar(mod('a', { stop: g.fase }), mod('b'));
  const ciclo = criarCiclo(registry, deps);
  const status = criarStatusLifecycle(registry, ciclo);

  await ciclo.subir();
  const descida = ciclo.descer();
  await g.entrou;

  /* `b` desceu primeiro (ordem inversa) e já saiu; `a` está em voo. */
  assert.deepEqual(ciclo.vivos(), ['a'], 'b já desceu e não pode continuar em vivos');
  assert.equal(status.estadoDo('b'), 'stopped');
  assert.equal(status.estadoDo('a'), 'stopping');

  g.liberar();
  await descida;
});

test('falha no start é reportada na fase "start", não em "init"', async () => {
  /* `start` marcava a etapa como `init`, então a falha acusava o handler errado
   * — `'start'` existia em `LifecycleStage` e nada o produzia, o mesmo defeito
   * de vocabulário que o `starting` tinha. */
  const registry = montar(mod('a', {
    init: () => {},
    start: () => { throw new Error('start ruim'); }
  }));
  const ciclo = criarCiclo(registry, deps);
  const r = await ciclo.subir();

  assert.equal(r.falhas.length, 1);
  assert.equal(r.falhas[0].fase, 'start');
  assert.equal(r.falhas[0].modulo, 'a');
});

test('transição não sobrevive a uma subida que falhou', async () => {
  const registry = montar(mod('a', { init: () => { throw new Error('init ruim'); } }));
  const ciclo = criarCiclo(registry, deps);
  const status = criarStatusLifecycle(registry, ciclo);

  await ciclo.subir();

  assert.equal(ciclo.emTransicao(), null, 'módulo que falhou não continua "em voo"');
  assert.equal(status.estadoDo('a'), 'failed');
});
