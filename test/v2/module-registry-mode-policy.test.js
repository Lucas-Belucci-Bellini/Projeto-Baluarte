import assert from 'node:assert/strict';
import { test } from 'node:test';

import { criarRuntimeHealth } from '../../v2/core/module-runtime-health.js';
import { criarModuleRegistryHealth } from '../../v2/core/module-registry-health.js';
import {
  criarModuleModePolicy,
  MODULE_MODE_FIXTURE_SOURCE,
  MODULE_MODE_POLICY_VERSION,
} from '../../v2/core/module-registry-mode-policy.js';

test('module mode policy: expõe exatamente quatro identidades server-side da fixture', () => {
  const policy = criarModuleModePolicy();

  assert.equal(policy.contractVersion, MODULE_MODE_POLICY_VERSION);
  assert.equal(policy.source, MODULE_MODE_FIXTURE_SOURCE);
  assert.deepEqual(policy.identidades(), [
    { id: 'fixture-user', role: 'user', source: MODULE_MODE_FIXTURE_SOURCE },
    { id: 'fixture-admin', role: 'admin', source: MODULE_MODE_FIXTURE_SOURCE },
    { id: 'fixture-dev', role: 'dev', source: MODULE_MODE_FIXTURE_SOURCE },
    { id: 'fixture-owner', role: 'owner', source: MODULE_MODE_FIXTURE_SOURCE },
  ]);
  assert.equal(policy.identidade('unknown'), null);
});

test('module mode policy: user permanece deny-by-default em todos os modos', () => {
  const policy = criarModuleModePolicy();

  for (const mode of ['active', 'maintenance', 'disabled']) {
    assert.deepEqual(policy.decidir('fixture-user', {
      id: 'alpha', mode, reason: 'teste', requestId: `user-${mode}`,
    }), {
      allowed: false,
      reason: 'role-mode-denied',
      requestId: `user-${mode}`,
    });
  }
});

test('module mode policy: dev pode maintenance/active, mas não disabled', () => {
  const policy = criarModuleModePolicy();

  assert.deepEqual(policy.decidir('fixture-dev', {
    id: 'alpha', mode: 'maintenance', reason: 'janela', requestId: 'dev-1',
  }), {
    allowed: true,
    requestId: 'dev-1',
    actorId: 'fixture-dev',
    actorRole: 'dev',
    approvedBy: 'fixture-admin',
  });
  assert.equal(policy.decidir('fixture-dev', {
    id: 'alpha', mode: 'active', reason: 'retorno', requestId: 'dev-2',
  }).allowed, true);
  assert.deepEqual(policy.decidir('fixture-dev', {
    id: 'alpha', mode: 'disabled', reason: 'incidente', requestId: 'dev-3',
  }), {
    allowed: false,
    reason: 'role-mode-denied',
    requestId: 'dev-3',
  });
});

test('module mode policy: admin e owner podem os três modos com aprovador fixture', () => {
  const policy = criarModuleModePolicy();

  for (const identityId of ['fixture-admin', 'fixture-owner']) {
    for (const mode of ['active', 'maintenance', 'disabled']) {
      const decision = policy.decidir(identityId, {
        id: 'alpha', mode, reason: 'janela aprovada', requestId: `${identityId}-${mode}`,
      });
      assert.equal(decision.allowed, true);
      assert.equal(decision.actorId, identityId);
      assert.equal(decision.actorRole, identityId.slice('fixture-'.length));
      assert.equal(decision.approvedBy, 'fixture-owner');
    }
  }
});

test('module mode policy: identidade desconhecida e requests inválidos falham fechados', () => {
  const policy = criarModuleModePolicy();

  assert.deepEqual(policy.decidir('not-a-fixture', {
    id: 'alpha', mode: 'active', reason: 'teste', requestId: 'unknown-1',
  }), { allowed: false, reason: 'identity-unknown', requestId: 'unknown-1' });
  assert.deepEqual(policy.decidir('fixture-admin', null), {
    allowed: false, reason: 'request-invalid',
  });
  assert.deepEqual(policy.decidir('fixture-admin', {
    id: 'alpha', mode: 'invalid', reason: 'teste', requestId: 'invalid-mode',
  }), { allowed: false, reason: 'mode-invalid', requestId: 'invalid-mode' });
  assert.deepEqual(policy.decidir('fixture-admin', {
    id: 'alpha', mode: 'active', reason: '', requestId: 'empty-reason',
  }), { allowed: false, reason: 'reason-missing', requestId: 'empty-reason' });
  assert.deepEqual(policy.decidir('fixture-admin', {
    id: 'alpha', mode: 'active', reason: 'teste', requestId: '',
  }), { allowed: false, reason: 'request-id-invalid' });
});

test('module mode policy: request não pode elevar autoridade por actorRole client-side', () => {
  const policy = criarModuleModePolicy();

  const decision = policy.decidir('fixture-user', {
    id: 'alpha',
    mode: 'disabled',
    reason: 'tentativa client-side',
    requestId: 'spoof-1',
    actorRole: 'owner',
  });

  assert.deepEqual(decision, {
    allowed: false,
    reason: 'role-mode-denied',
    requestId: 'spoof-1',
  });
});

test('module mode policy: callback fechado ignora actorRole do request e mantém resposta congelada', () => {
  const policy = criarModuleModePolicy();
  const authorizeAsAdmin = policy.authorizeAs('fixture-admin');
  const decision = authorizeAsAdmin({
    id: 'alpha', mode: 'disabled', reason: 'incidente', requestId: 'admin-1', actorRole: 'user',
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.actorRole, 'admin');
  assert.equal(Object.isFrozen(decision), true);
  assert.equal(Object.isFrozen(policy.identidades()), true);
  assert.deepEqual(policy.modosPermitidos('user'), []);
  assert.deepEqual(policy.modosPermitidos('owner'), ['active', 'maintenance', 'disabled']);
});


test('module mode policy: integra com Module Registry Health auditado sem conceder autoridade extra', () => {
  const policy = criarModuleModePolicy();
  const auditEntries = [];
  const health = criarModuleRegistryHealth(
    registryFake(['alpha']),
    criarRuntimeHealth(),
    {
      requireAudit: true,
      audit: (entry) => auditEntries.push(entry),
      authorize: policy.authorizeAs('fixture-admin'),
      clock: () => 1234,
    },
  );

  assert.equal(
    health.definirModo('alpha', 'maintenance', 'janela fixture', { requestId: 'integration-1' }),
    'maintenance',
  );
  assert.equal(health.podeAtivar('alpha'), false);
  assert.deepEqual(auditEntries, [{
    type: 'registry.mode.changed',
    id: 'alpha',
    mode: 'maintenance',
    reason: 'janela fixture',
    requestId: 'integration-1',
    actorId: 'fixture-admin',
    actorRole: 'admin',
    approvedBy: 'fixture-owner',
    timestamp: 1234,
  }]);
});

function registryFake(ids) {
  const ativos = new Set(ids);
  return {
    listar: () => [...ativos],
    modulo: (id) => (ativos.has(id) ? { id } : null),
  };
}
