import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateLocalRlsPolicy } from '../src/security/rls-staging-contract.ts';

const BASE = Object.freeze({
  action: 'read',
  actorRole: 'user',
  subject: 'user-1',
  tenantId: 'tenant-a',
  resourceTenantId: 'tenant-a',
  expiresAt: 20_000,
  nowMs: 10_000,
  requestedServiceOperation: false,
  serviceRoleVerified: false,
  source: 'server',
});

test('anonymous and missing identity are denied by default', () => {
  const anonymous = evaluateLocalRlsPolicy({ ...BASE, actorRole: 'anonymous', subject: null });
  const missingSubject = evaluateLocalRlsPolicy({ ...BASE, subject: null });
  assert.deepEqual(anonymous, { allowed: false, reason: 'anonymous-denied', authority: 'not-authorized' });
  assert.deepEqual(missingSubject, { allowed: false, reason: 'subject-missing', authority: 'not-authorized' });
});

test('cross-tenant reads are denied', () => {
  const decision = evaluateLocalRlsPolicy({ ...BASE, resourceTenantId: 'tenant-b' });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'tenant-mismatch');
  assert.equal(decision.authority, 'not-authorized');
});

test('expired identity and missing tenant are denied', () => {
  const expired = evaluateLocalRlsPolicy({ ...BASE, expiresAt: 10_000 });
  const missingTenant = evaluateLocalRlsPolicy({ ...BASE, tenantId: null });
  assert.equal(expired.reason, 'identity-expired');
  assert.equal(missingTenant.reason, 'tenant-missing');
});

test('normal users can read their tenant but cannot write', () => {
  const read = evaluateLocalRlsPolicy(BASE);
  const write = evaluateLocalRlsPolicy({ ...BASE, action: 'write' });
  assert.deepEqual(read, { allowed: true, reason: 'policy-allowed', authority: 'server-policy' });
  assert.deepEqual(write, { allowed: false, reason: 'write-role-denied', authority: 'not-authorized' });
});

test('admin, dev and owner are the only elevated local write roles', () => {
  for (const actorRole of ['admin', 'dev', 'owner']) {
    const decision = evaluateLocalRlsPolicy({ ...BASE, action: 'write', actorRole });
    assert.deepEqual(decision, { allowed: true, reason: 'policy-allowed', authority: 'server-policy' });
  }
});

test('client cannot self-assert a service-role operation', () => {
  const decision = evaluateLocalRlsPolicy({
    ...BASE,
    requestedServiceOperation: true,
    source: 'client',
    serviceRoleVerified: true,
  });
  assert.deepEqual(decision, { allowed: false, reason: 'service-role-unverified', authority: 'not-authorized' });
});

test('only a verified server boundary can model a service-role operation', () => {
  const decision = evaluateLocalRlsPolicy({
    ...BASE,
    requestedServiceOperation: true,
    source: 'server',
    serviceRoleVerified: true,
  });
  assert.deepEqual(decision, { allowed: true, reason: 'service-role-allowed', authority: 'server-policy' });
});
