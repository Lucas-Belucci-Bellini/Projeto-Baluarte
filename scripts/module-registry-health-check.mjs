import assert from 'node:assert/strict';

import { criarModuleRegistryHealth } from '../v2/core/module-registry-health.js';
import { criarRuntimeHealth } from '../v2/core/module-runtime-health.js';

function registryFake(ids) {
  const modules = new Set(ids);
  return {
    listar: () => [...modules],
    modulo: (id) => (modules.has(id) ? { id } : null),
  };
}

const registry = registryFake(['alpha', 'beta']);
let now = 1000;
const runtimeHealth = criarRuntimeHealth({
  maxRestarts: 1,
  windowMs: 60_000,
  clock: () => now,
});
const auditEntries = [];
const health = criarModuleRegistryHealth(registry, runtimeHealth, {
  requireAudit: true,
  clock: () => now,
  audit: (entry) => auditEntries.push(entry),
  authorize: (request) => ({
    allowed: request.id === 'beta' && request.mode === 'maintenance',
    requestId: request.requestId,
    actorId: 'fixture-operator',
    actorRole: 'admin',
    approvedBy: 'fixture-approver',
  }),
});

const decisions = [];

assert.equal(health.modo('unknown'), 'unregistered');
assert.equal(health.podeAtivar('unknown'), false);
decisions.push('deny');

assert.equal(health.modo('alpha'), 'registered');
assert.equal(health.podeAtivar('alpha'), true);
decisions.push('allow');

runtimeHealth.marcarSaudavel('alpha');
assert.equal(health.modo('alpha'), 'healthy');
assert.equal(health.podeAtivar('alpha'), true);
decisions.push('allow');

now += 1_000;
runtimeHealth.marcarFalha('alpha', new Error('falha controlada'));
assert.equal(health.modo('alpha'), 'degraded');
assert.equal(health.podeAtivar('alpha'), true);

now += 1_000;
runtimeHealth.marcarFalha('alpha', new Error('segunda falha'));
assert.equal(health.modo('alpha'), 'quarantined');
assert.equal(health.podeAtivar('alpha'), false);
decisions.push('deny');

assert.equal(
  health.definirModo('beta', 'maintenance', 'janela aprovada', { requestId: 'health-check-1' }),
  'maintenance',
);
assert.equal(health.podeAtivar('beta'), false);
assert.equal(auditEntries.length, 1);
assert.equal(auditEntries[0].type, 'registry.mode.changed');
assert.equal(auditEntries[0].actorRole, 'admin');
decisions.push('allow');

const snapshot = health.resumo();
snapshot.pop();
snapshot[0].mode = 'disabled';
assert.equal(health.resumo().length, 2);
assert.notEqual(health.resumo()[0].mode, 'disabled');
assert.equal(health.incidentes().length, 3);

const deniedHealth = criarModuleRegistryHealth(registryFake(['beta']), criarRuntimeHealth(), {
  authorize: () => false,
});
assert.throws(
  () => deniedHealth.definirModo('beta', 'disabled', 'incidente'),
  /autorização server-side necessária/i,
);
assert.equal(deniedHealth.modo('beta'), 'registered');
decisions.push('deny');

assert.equal(decisions.length, 6);
assert.equal(decisions.filter((decision) => decision === 'allow').length, 3);
assert.equal(decisions.filter((decision) => decision === 'deny').length, 3);

console.log(JSON.stringify({
  scope: 'module-registry-health/local',
  modules: 2,
  cases: decisions.length,
  decisions: {
    allow: decisions.filter((decision) => decision === 'allow').length,
    deny: decisions.filter((decision) => decision === 'deny').length,
  },
  modes: {
    unknown: 'unregistered',
    failed: 'degraded',
    exhausted: 'quarantined',
    authorizedOverride: 'maintenance',
    deniedOverride: 'registered',
  },
  auditEntries: auditEntries.length,
  incidents: health.incidentes().length,
  network: 'not-used',
}, null, 2));
