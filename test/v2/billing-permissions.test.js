import test from 'node:test';
import assert from 'node:assert/strict';
import { mapEntitlementsToPermissions } from '../../v2/core/billing-permissions.ts';

const plan = {
  id: 'pro',
  name: 'Pro',
  description: 'Plano de teste',
  status: 'active',
  currency: 'BRL',
  billingPeriod: 'monthly',
  priceMinor: 0,
  trialDays: 0,
  entitlements: ['CAN_USE_JARVIS', 'CAN_USE_API', 'CAN_EXPORT_REPORTS'],
  limits: {},
  features: [],
  metadata: {},
  version: 1,
};

test('entitlements map to permission candidates without granting access', () => {
  const result = mapEntitlementsToPermissions(plan, [
    { entitlement: 'CAN_USE_JARVIS', permission: 'jarvis.read' },
    { entitlement: 'CAN_USE_API', permission: 'api.execute' },
  ]);
  assert.deepEqual(result.grantedCandidates, [
    { entitlement: 'CAN_USE_JARVIS', permission: 'jarvis.read', source: 'billing-entitlement' },
    { entitlement: 'CAN_USE_API', permission: 'api.execute', source: 'billing-entitlement' },
  ]);
  assert.deepEqual(result.unmappedEntitlements, ['CAN_EXPORT_REPORTS']);
});

test('conflicting mappings are rejected instead of silently escalating access', () => {
  assert.throws(() => mapEntitlementsToPermissions(plan, [
    { entitlement: 'CAN_USE_JARVIS', permission: 'jarvis.read' },
    { entitlement: 'CAN_USE_JARVIS', permission: 'jarvis.write' },
  ]), /mapeamentos conflitantes/);
});
