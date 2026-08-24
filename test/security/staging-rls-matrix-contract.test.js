import test from 'node:test';
import assert from 'node:assert/strict';

import { STAGING_RLS_SCENARIOS } from '../../v2/data/staging-rls-matrix.ts';

test('staging RLS: matriz cobre os quatro tipos de identidade', () => {
  const principals = new Set(STAGING_RLS_SCENARIOS.map((scenario) => scenario.principal));
  assert.deepEqual(
    [...principals].sort(),
    ['anonymous', 'non-owner', 'operator', 'owner'],
  );
});

test('staging RLS: cada cenário é determinístico e possui limpeza', () => {
  const ids = STAGING_RLS_SCENARIOS.map((scenario) => scenario.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const scenario of STAGING_RLS_SCENARIOS) {
    assert.match(scenario.table, /^[a-z_]+$/);
    assert.match(scenario.setup, /./);
    assert.match(scenario.cleanup, /./);
    assert.match(scenario.rationale, /./);
    assert.ok(['allow', 'deny', 'empty'].includes(scenario.expectation));
  }
});

test('staging RLS: autorização administrativa não usa service role no cliente', () => {
  const serialized = JSON.stringify(STAGING_RLS_SCENARIOS);
  assert.doesNotMatch(serialized, /service[_-]?role/i);
  assert.match(serialized, /policy server-side/i);
});
