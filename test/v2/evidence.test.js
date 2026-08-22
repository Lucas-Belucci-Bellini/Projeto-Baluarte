import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EvidenceStore,
  normalizeEvidence,
  projectEvidenceRetention,
  validateEvidence,
} from '../../v2/data/evidence.ts';

const base = {
  id: 'ev-001',
  claimKey: 'wiki:arma3:build-42',
  statement: 'A fonte descreve a entidade no contexto da versão observada.',
  source: {
    uri: 'https://example.test/source/build-42',
    title: 'Fonte de teste',
    publisher: 'Baluarte Test Fixture',
    revision: 'r1',
  },
  retrievedAt: '2026-08-19T00:00:00.000Z',
  confidence: 0.82,
  moduleId: 'wiki-arma3',
  collector: 'fixture',
};

test('evidence validates provenance and confidence bounds', () => {
  assert.equal(validateEvidence(base).valid, true);
  assert.equal(validateEvidence({ ...base, confidence: 1.1 }).valid, false);
  assert.equal(validateEvidence({ ...base, source: { uri: '' } }).valid, false);
  assert.equal(validateEvidence({ ...base, retrievedAt: 'not-a-date' }).valid, false);
});

test('evidence normalization supplies explicit defaults and immutable data', () => {
  const record = normalizeEvidence(base);
  assert.equal(record.status, 'pending');
  assert.equal(record.observedAt, record.retrievedAt);
  assert.equal(record.collector, 'fixture');
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.source), true);
});

test('evidence store is append-only for facts and rejects duplicate ids', () => {
  const store = new EvidenceStore();
  const first = store.append(base);
  assert.equal(store.get(first.id)?.statement, base.statement);
  assert.throws(() => store.append(base), /evidência duplicada/);
  assert.equal(store.listByClaim(base.claimKey).length, 1);
  assert.equal(store.listByModule(base.moduleId).length, 1);
});

test('evidence status changes preserve the observed fact and record supersession', () => {
  const store = new EvidenceStore();
  store.append(base);
  const verified = store.markStatus(base.id, 'verified');
  assert.equal(verified.statement, base.statement);
  assert.equal(verified.status, 'verified');
  const superseded = store.markStatus(base.id, 'superseded', 'ev-002');
  assert.equal(superseded.supersededBy, 'ev-002');
  assert.equal(superseded.statement, base.statement);
});

test('evidence retention preview is deterministic, bounded and read-only', () => {
  const store = new EvidenceStore();
  store.append({ ...base, id: 'ev-recent', observedAt: '2026-08-25T00:00:00.000Z' });
  store.append({ ...base, id: 'ev-old', observedAt: '2026-07-01T00:00:00.000Z' });
  store.append({ ...base, id: 'ev-future', observedAt: '2026-09-02T00:00:00.000Z' });

  const preview = projectEvidenceRetention(store.list(), {
    now: '2026-09-01T00:00:00.000Z',
    maxAgeDays: 30,
  });
  assert.deepEqual(preview.summary, {
    total: 3,
    withinWindow: 1,
    pastWindow: 1,
    futureObserved: 1,
  });
  assert.deepEqual(preview.items.map((item) => [item.id, item.ageDays, item.retention]), [
    ['ev-recent', 7, 'within-window'],
    ['ev-old', 62, 'past-window'],
    ['ev-future', 0, 'future-observed'],
  ]);
  assert.equal(Object.isFrozen(preview), true);
  assert.equal(Object.isFrozen(preview.items), true);
  assert.equal(Object.isFrozen(preview.items[0]), true);
  assert.deepEqual(Object.keys(preview.items[0] ?? {}).sort(), [
    'ageDays',
    'id',
    'moduleId',
    'observedAt',
    'retention',
    'status',
  ]);
  assert.equal(Object.hasOwn(preview.items[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(preview.items[0] ?? {}, 'source'), false);
  assert.equal(Object.hasOwn(preview.items[0] ?? {}, 'claimKey'), false);
  assert.equal(store.list().length, 3);
  assert.equal(store.get('ev-recent')?.status, 'pending');

  const limited = projectEvidenceRetention(store.list(), {
    now: '2026-09-01T00:00:00.000Z',
    limit: 2,
  });
  assert.equal(limited.maxAgeDays, 30);
  assert.equal(limited.items.length, 2);
  assert.equal(limited.summary.total, 2);
  assert.throws(() => projectEvidenceRetention(store.list(), { now: 'invalid' }), /now deve ser/);
  assert.throws(() => projectEvidenceRetention(store.list(), { now: '2026-09-01', maxAgeDays: 0 }), /maxAgeDays deve ser/);
  assert.throws(() => projectEvidenceRetention(store.list(), { now: '2026-09-01', maxAgeDays: 1.5 }), /maxAgeDays deve ser/);
  assert.throws(() => projectEvidenceRetention(store.list(), { now: '2026-09-01', limit: 0 }), /limit deve ser/);
  assert.throws(() => projectEvidenceRetention(store.list(), { now: '2026-09-01', limit: 1.5 }), /limit deve ser/);
});
