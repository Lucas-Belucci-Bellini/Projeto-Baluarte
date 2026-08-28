import {
  criarModuleModePolicy,
  MODULE_MODE_FIXTURE_SOURCE,
  MODULE_MODE_ROLES,
} from '../v2/core/module-registry-mode-policy.js';

const policy = criarModuleModePolicy();
const identities = policy.identidades();
const expectedRoles = [...MODULE_MODE_ROLES];

if (identities.length !== 4) {
  throw new Error(`fixture de Module Mode inesperada: ${identities.length} identidades`);
}
if (identities.some((identity) => identity.source !== MODULE_MODE_FIXTURE_SOURCE)) {
  throw new Error('fixture contém identidade fora da origem server-test-fixture');
}
if (identities.map(({ role }) => role).join(',') !== expectedRoles.join(',')) {
  throw new Error('fixture não preserva o catálogo fechado de roles');
}

const cases = [
  ['fixture-user', 'active', false],
  ['fixture-user', 'disabled', false],
  ['fixture-dev', 'maintenance', true],
  ['fixture-dev', 'disabled', false],
  ['fixture-admin', 'disabled', true],
  ['fixture-owner', 'active', true],
];

const decisions = cases.map(([identityId, mode, expectedAllowed]) => {
  const decision = policy.decidir(identityId, {
    id: 'module-fixture',
    mode,
    reason: 'check local',
    requestId: `${identityId}-${mode}`,
  });
  if (decision.allowed !== expectedAllowed) {
    throw new Error(`decisão inesperada para ${identityId}/${mode}`);
  }
  return decision.allowed ? 'allow' : 'deny';
});

const spoofed = policy.decidir('fixture-user', {
  id: 'module-fixture',
  mode: 'disabled',
  reason: 'spoof check',
  requestId: 'spoof-check',
  actorRole: 'owner',
});
if (spoofed.allowed || spoofed.reason !== 'role-mode-denied') {
  throw new Error('actorRole do request elevou autoridade na fixture');
}

console.log(JSON.stringify({
  scope: 'module-mode-policy/local',
  source: policy.source,
  identities: identities.length,
  roles: expectedRoles,
  cases: cases.length,
  decisions: {
    allow: decisions.filter((decision) => decision === 'allow').length,
    deny: decisions.filter((decision) => decision === 'deny').length,
  },
  spoof: 'deny',
}, null, 2));
