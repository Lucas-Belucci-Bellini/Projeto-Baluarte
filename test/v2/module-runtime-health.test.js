import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeHealth } from '../../v2/core/module-runtime-health.js';

test('health começa unknown e pode ficar healthy', () => {
  const health = criarRuntimeHealth();
  assert.equal(health.estado('alpha').status, 'unknown');
  health.marcarSaudavel('alpha');
  assert.equal(health.estado('alpha').status, 'healthy');
});

test('limita reinícios dentro da janela', () => {
  const health = criarRuntimeHealth({ maxRestarts: 2, windowMs: 60_000 });
  assert.equal(health.marcarFalha('alpha', new Error('1')), true);
  assert.equal(health.marcarFalha('alpha', new Error('2')), true);
  assert.equal(health.marcarFalha('alpha', new Error('3')), false);
  assert.equal(health.podeReiniciar('alpha'), false);
  assert.equal(health.estado('alpha').status, 'exhausted');
});

test('falha antiga sai da janela', () => {
  const health = criarRuntimeHealth({ maxRestarts: 1, windowMs: 0 });
  assert.equal(health.marcarFalha('alpha', new Error('1')), true);
  assert.equal(health.marcarFalha('alpha', new Error('2')), true);
  assert.equal(health.podeReiniciar('alpha'), true);
});

test('histórico registra transições sem stack trace e mantém cópia defensiva', () => {
  const health = criarRuntimeHealth({ clock: () => 123 });
  health.marcarSaudavel('alpha');
  health.marcarFalha('alpha', new Error('boom'));

  const historico = health.incidentes();
  assert.deepEqual(historico, [
    { type: 'healthy', id: 'alpha', timestamp: 123, status: 'healthy', restarts: 0 },
    { type: 'failed', id: 'alpha', timestamp: 123, status: 'failed', restarts: 1, error: 'boom' },
  ]);
  assert.equal('stack' in historico[1], false);
  historico[0].status = 'corrompido';
  assert.equal(health.incidentes()[0].status, 'healthy');
});

test('histórico é limitado e preserva apenas os eventos mais recentes', () => {
  let agora = 100;
  const health = criarRuntimeHealth({ maxIncidents: 2, clock: () => agora++ });
  health.marcarSaudavel('a');
  health.marcarSaudavel('b');
  health.marcarSaudavel('c');

  assert.deepEqual(health.incidentes().map(({ id }) => id), ['b', 'c']);
});
