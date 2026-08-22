import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRegistry } from '../../v2/core/registry.js';
import evidence from '../../v2/modules/evidence/module.js';

const input = {
  id: 'module-ev-001',
  claimKey: 'module:evidence:contract',
  statement: 'Evidence permanece isolado do frontend e da rede.',
  source: { uri: 'https://example.test/evidence-contract', revision: 'r1' },
  retrievedAt: '2026-08-19T00:00:00.000Z',
  confidence: 0.95,
  moduleId: 'evidence',
  collector: 'contract-test',
};

test('Evidence manifesta-se como módulo sem rota e permanece ativo no Registry', () => {
  const registry = criarRegistry();
  registry.registrar(evidence);
  const seal = registry.selar();
  assert.equal(seal.ok, true, JSON.stringify(seal.recusados));
  assert.deepEqual(seal.ativos, ['evidence']);
  assert.deepEqual(registry.rotas(), []);
  assert.equal(registry.permissoes().get('evidence')?.length, 0);
});

test('Evidence API funciona após init e libera o store em dispose', () => {
  const logs = [];
  evidence.lifecycle.init({ log: { debug: (...args) => logs.push(args) } });
  const record = evidence.api.append(input);
  assert.equal(record.id, input.id);
  assert.equal(evidence.api.listByClaim(input.claimKey).length, 1);
  const catalogRecord = evidence.api.appendCatalog({
    moduleId: 'wiki',
    entityId: 'fixture-1',
    field: 'title',
    value: 'Fixture catalog fact',
    source: { uri: 'https://example.test/catalog', revision: 'r1' },
    retrievedAt: '2026-08-19T00:00:00.000Z',
    confidence: 0.8,
  });
  assert.equal(catalogRecord.claimKey, 'wiki:fixture-1:title');
  assert.ok(logs.length >= 1);
  evidence.lifecycle.dispose();
  assert.deepEqual(evidence.api.list(), []);
  assert.throws(() => evidence.api.append(input), /não foi inicializado/);
});

test('Evidence retentionPreview permanece bounded durante o lifecycle', () => {
  const options = { now: '2026-09-01T00:00:00.000Z', maxAgeDays: 30 };
  assert.deepEqual(evidence.api.retentionPreview(options), {
    now: '2026-09-01T00:00:00.000Z',
    maxAgeDays: 30,
    items: [],
    summary: { total: 0, withinWindow: 0, pastWindow: 0, futureObserved: 0 },
  });
  evidence.lifecycle.init({ log: { debug: () => {} } });
  evidence.api.append({ ...input, id: 'module-retention-old', observedAt: '2026-07-01T00:00:00.000Z' });
  const preview = evidence.api.retentionPreview(options);
  assert.equal(preview.summary.pastWindow, 1);
  assert.equal(preview.items[0]?.id, 'module-retention-old');
  assert.equal(Object.hasOwn(preview.items[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(preview.items[0] ?? {}, 'source'), false);
  evidence.lifecycle.dispose();
  assert.equal(evidence.api.retentionPreview(options).summary.total, 0);
});

test('Evidence auditPreview permanece redigido durante o lifecycle', () => {
  const options = { moduleId: 'module-audit', limit: 1 };
  assert.deepEqual(evidence.api.auditPreview(), {
    scope: 'all',
    limit: 25,
    records: [],
    summary: {
      returned: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
      superseded: 0,
      truncated: false,
    },
  });
  evidence.lifecycle.init({ log: { debug: () => {} } });
  const record = evidence.api.append({ ...input, id: 'module-audit-001', moduleId: 'module-audit' });
  const preview = evidence.api.auditPreview(options);
  assert.deepEqual(preview.records, [{
    id: record.id,
    moduleId: 'module-audit',
    status: 'pending',
    observedAt: record.observedAt,
  }]);
  assert.equal(preview.summary.truncated, false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'source'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'collector'), false);
  assert.equal(evidence.api.list().length, 1);
  evidence.lifecycle.dispose();
  assert.equal(evidence.api.auditPreview().summary.returned, 0);
  assert.throws(() => evidence.api.auditPreview({ moduleId: '' }), /moduleId deve ser/);
});

test('Evidence emite eventos bounded sem incluir conteúdo da evidência', () => {
  const events = [];
  evidence.lifecycle.init({
    log: { debug: () => {} },
    bus: { emit: (event, payload) => events.push({ event, payload }) },
  });
  const record = evidence.api.append(input);
  evidence.api.markStatus(record.id, 'verified');
  assert.deepEqual(events, [
    { event: 'evidence:appended', payload: { id: input.id, moduleId: 'evidence', status: 'pending' } },
    { event: 'evidence:status-changed', payload: { id: input.id, moduleId: 'evidence', status: 'verified' } },
  ]);
  assert.equal(Object.hasOwn(events[0].payload, 'statement'), false);
  assert.equal(Object.hasOwn(events[0].payload, 'source'), false);
  evidence.lifecycle.dispose();
});
