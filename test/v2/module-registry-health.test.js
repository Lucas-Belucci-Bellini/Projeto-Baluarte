import test from 'node:test';
import assert from 'node:assert/strict';

import { criarRuntimeHealth } from '../../v2/core/module-runtime-health.js';
import { criarModuleRegistryHealth } from '../../v2/core/module-registry-health.js';

function registryFake(ids) {
  const ativos = new Set(ids);
  return {
    listar: () => [...ativos],
    modulo: (id) => (ativos.has(id) ? { id } : null),
  };
}

test('registry health: módulo desconhecido não vira ativo por fallback', () => {
  const health = criarModuleRegistryHealth(
    registryFake(['alpha']),
    criarRuntimeHealth(),
  );

  assert.equal(health.modo('unknown'), 'unregistered');
  assert.equal(health.podeAtivar('unknown'), false);
});

test('registry health: módulo registrado começa disponível para ativação', () => {
  const health = criarModuleRegistryHealth(
    registryFake(['alpha']),
    criarRuntimeHealth(),
  );

  assert.equal(health.modo('alpha'), 'registered');
  assert.equal(health.podeAtivar('alpha'), true);
});

test('registry health: falha permite estado degraded e reinício limitado', () => {
  const runtimeHealth = criarRuntimeHealth({ maxRestarts: 1, windowMs: 60_000 });
  const health = criarModuleRegistryHealth(registryFake(['alpha']), runtimeHealth);

  runtimeHealth.marcarFalha('alpha', new Error('falha controlada'));

  assert.equal(health.modo('alpha'), 'degraded');
  assert.equal(health.podeAtivar('alpha'), true);
  assert.equal(health.resumo()[0].ultimoErro, 'falha controlada');
});

test('registry health: limite de falhas coloca módulo em quarentena sem derrubar registry', () => {
  const runtimeHealth = criarRuntimeHealth({ maxRestarts: 1, windowMs: 60_000 });
  const health = criarModuleRegistryHealth(registryFake(['alpha', 'beta']), runtimeHealth);

  runtimeHealth.marcarFalha('alpha', new Error('1'));
  runtimeHealth.marcarFalha('alpha', new Error('2'));

  assert.equal(health.modo('alpha'), 'quarantined');
  assert.equal(health.podeAtivar('alpha'), false);
  assert.equal(health.modo('beta'), 'registered');
  assert.deepEqual(health.resumo().map(({ id }) => id), ['alpha', 'beta']);
});

test('registry health: maintenance exige autorização server-side e motivo', () => {
  const pedidos = [];
  const health = criarModuleRegistryHealth(
    registryFake(['alpha', 'beta']),
    criarRuntimeHealth(),
    { authorize: (request) => { pedidos.push(request); return request.id === 'alpha'; } },
  );

  assert.throws(
    () => health.definirModo('alpha', 'maintenance', ''),
    /exige motivo/i,
  );
  assert.equal(health.definirModo('alpha', 'maintenance', 'janela aprovada'), 'maintenance');
  assert.equal(health.podeAtivar('alpha'), false);
  assert.equal(health.modo('beta'), 'registered');
  assert.deepEqual(pedidos, [{ id: 'alpha', mode: 'maintenance', reason: 'janela aprovada' }]);
});

test('registry health: autorização negada não altera disabled', () => {
  const health = criarModuleRegistryHealth(
    registryFake(['alpha']),
    criarRuntimeHealth(),
    { authorize: () => false },
  );

  assert.throws(
    () => health.definirModo('alpha', 'disabled', 'incidente'),
    /autorização server-side necessária/i,
  );
  assert.equal(health.modo('alpha'), 'registered');
});

test('registry health: active remove override somente com autorização', () => {
  const health = criarModuleRegistryHealth(
    registryFake(['alpha']),
    criarRuntimeHealth(),
    { authorize: () => true },
  );

  health.definirModo('alpha', 'disabled', 'teste');
  assert.equal(health.modo('alpha'), 'disabled');
  assert.equal(health.definirModo('alpha', 'active', 'retorno aprovado'), 'registered');
});
