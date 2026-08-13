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
