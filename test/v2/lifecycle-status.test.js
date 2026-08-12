import test from 'node:test';
import assert from 'node:assert/strict';
import { criarStatusLifecycle } from '../../v2/core/lifecycle-status.js';

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

test('módulos vivos aparecem como running', () => {
  const ciclo = {
    fase: 'no-ar',
    vivos: () => ['core', 'ui'],
    falhas: () => []
  };
  const status = criarStatusLifecycle(registry(), ciclo);
  assert.equal(status.estadoDo('core'), 'running');
  assert.equal(status.estadoDo('ui'), 'running');
  assert.equal(status.estadoDo('broken'), 'stopped');
});

test('falha do módulo é preservada no retrato', () => {
  const falha = { modulo: 'broken', fase: 'init', motivo: 'timeout' };
  const ciclo = {
    fase: 'no-ar',
    vivos: () => ['core'],
    falhas: () => [falha]
  };
  const status = criarStatusLifecycle(registry(), ciclo);
  assert.equal(status.estadoDo('broken'), 'failed');
  assert.deepEqual(status.retrato()[2].falha, falha);
});

test('resumo contabiliza os estados', () => {
  const ciclo = {
    fase: 'no-ar',
    vivos: () => ['core', 'ui'],
    falhas: () => [{ modulo: 'broken', fase: 'init', motivo: 'erro' }]
  };
  assert.deepEqual(criarStatusLifecycle(registry(), ciclo).resumo(), {
    total: 3,
    running: 2,
    failed: 1,
    stopped: 0,
    registered: 0
  });
});

test('antes do boot módulos ficam registered', () => {
  const ciclo = { fase: 'parado', vivos: () => [], falhas: () => [] };
  const status = criarStatusLifecycle(registry(), ciclo);
  assert.equal(status.estadoDo('core'), 'registered');
});
