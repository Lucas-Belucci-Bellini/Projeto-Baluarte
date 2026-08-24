import { test } from 'node:test';
import assert from 'node:assert/strict';

import { STAGING_RLS_SCENARIOS } from '../../v2/data/staging-rls-matrix.ts';
import { criarFakeStagingRls } from '../../v2/data/staging-rls-fake.ts';

test('fake RLS executa os nove cenários com a expectativa declarada', () => {
  const fake = criarFakeStagingRls({ clock: () => 100 });
  const resultados = fake.runMatrix();

  assert.equal(resultados.length, STAGING_RLS_SCENARIOS.length);
  assert.deepEqual(
    resultados.map(({ id, expected, observed }) => ({ id, expected, observed })),
    STAGING_RLS_SCENARIOS.map(({ id, expectation }) => ({
      id,
      expected: expectation,
      observed: expectation,
    })),
  );
  assert.equal(fake.audit().length, 9);
});

test('fake RLS mantém isolamento de proprietário e não proprietário', () => {
  const fake = criarFakeStagingRls({ clock: () => 200 });
  const resultados = fake.runMatrix();
  const byId = new Map(resultados.map((result) => [result.id, result]));

  assert.equal(byId.get('owner-profile-select').rows.length, 1);
  assert.equal(byId.get('non-owner-profile-select').rows.length, 0);
  assert.equal(byId.get('owner-profile-update').changed, true);
  assert.equal(byId.get('non-owner-profile-update').changed, false);
  assert.equal(byId.get('non-owner-memory-delete').changed, false);

  const after = fake.snapshot();
  assert.equal(after.profiles[0].displayName, 'Fixture U1 updated by owner');
  assert.equal(after.memories.length, 1);
});

test('fake RLS separa identidade autenticada de policy administrativa', () => {
  const fake = criarFakeStagingRls({ clock: () => 300 });
  const resultados = fake.runMatrix();
  const byId = new Map(resultados.map((result) => [result.id, result]));

  assert.equal(byId.get('operator-mural-insert').observed, 'allow');
  assert.equal(byId.get('operator-mural-insert').changed, true);
  assert.equal(byId.get('owner-mural-insert').observed, 'deny');
  assert.equal(byId.get('owner-mural-insert').changed, false);
  assert.equal(fake.snapshot().muralPosts.length, 1);
});

test('fake RLS registra evidência antes/depois e cleanup é idempotente', () => {
  const fake = criarFakeStagingRls({ clock: () => 400 });
  const resultados = fake.runMatrix();
  const ownerUpdate = resultados.find(({ id }) => id === 'owner-profile-update');
  assert.equal(ownerUpdate.before.profiles[0].displayName, 'Fixture U1');
  assert.equal(ownerUpdate.after.profiles[0].displayName, 'Fixture U1 updated by owner');

  assert.equal(fake.cleanup().removed, 3);
  assert.equal(fake.cleanup().removed, 0);
  assert.deepEqual(fake.snapshot(), { profiles: [], memories: [], muralPosts: [] });
});

test('fake RLS rejeita cenário desconhecido e não cria fixture implícita', () => {
  const fake = criarFakeStagingRls();
  assert.throws(() => fake.executeScenario('not-a-scenario'), /cenário RLS desconhecido/i);
  assert.deepEqual(fake.snapshot(), { profiles: [], memories: [], muralPosts: [] });
});
