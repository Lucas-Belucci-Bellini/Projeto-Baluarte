import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencySpec } from '../../v2/core/runtime-dependency-spec.js';
import { criarRuntimeDependencyState } from '../../v2/core/runtime-dependency-state.js';

function make(dependsOn) {
  const registry = criarRuntimeModuleRegistry();
  registry.registrar('api', { dependsOn });
  registry.selar();
  return criarRuntimeDependencySpec(registry);
}

test('dependência saudável preserva estado próprio', () => {
  const state = criarRuntimeDependencyState({ spec: make(['db']) });
  assert.equal(state.state('api', 'ready', new Map([['db', 'ready']])), 'ready');
});

test('falha de dependência required/stop bloqueia consumidor', () => {
  const state = criarRuntimeDependencyState({ spec: make(['db']) });
  assert.equal(state.state('api', 'ready', new Map([['db', 'failed']])), 'blocked');
});

test('dependência opcional pode degradar consumidor', () => {
  const state = criarRuntimeDependencyState({ spec: make([{ id: 'cache', required: false, failure: 'degrade' }]) });
  assert.equal(state.state('api', 'ready', new Map([['cache', 'failed']])), 'degraded');
});

test('ignore não altera estado próprio', () => {
  const state = criarRuntimeDependencyState({ spec: make([{ id: 'telemetry', required: false, failure: 'ignore' }]) });
  assert.equal(state.state('api', 'ready', new Map([['telemetry', 'failed']])), 'ready');
});
