import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EvidenceStore,
  normalizeEvidence,
  projectEvidenceAudit,
  projectEvidenceRetention,
  projectEvidenceReviewQueue,
  projectEvidenceSearch,
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
  assert.equal(store.get(base.id)?.revision, 3);
});

test('evidence revision history is bounded, immutable and structural', () => {
  const store = new EvidenceStore();
  store.append(base);
  store.markStatus(base.id, 'verified');
  store.markStatus(base.id, 'superseded', 'ev-002');

  const preview = store.revisionPreview(base.id);
  assert.deepEqual(preview.revisions.map((revision) => [revision.id, revision.revision, revision.kind, revision.status, revision.supersededBy ?? null]), [
    [base.id, 1, 'appended', 'pending', null],
    [base.id, 2, 'status-changed', 'verified', null],
    [base.id, 3, 'status-changed', 'superseded', 'ev-002'],
  ]);
  assert.deepEqual(preview.summary, { returned: 3, available: 3, truncated: false });
  assert.equal(Object.isFrozen(preview), true);
  assert.equal(Object.isFrozen(preview.revisions), true);
  assert.equal(Object.isFrozen(preview.revisions[0]), true);
  assert.equal(Object.hasOwn(preview.revisions[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(preview.revisions[0] ?? {}, 'source'), false);

  const limited = store.revisionPreview(base.id, { limit: 2 });
  assert.equal(limited.revisions.length, 2);
  assert.deepEqual(limited.summary, { returned: 2, available: 3, truncated: true });
  assert.deepEqual(store.revisionPreview('missing').summary, { returned: 0, available: 0, truncated: false });
  assert.throws(() => store.revisionPreview(''), /id deve ser/);
  assert.throws(() => store.revisionPreview(base.id, { limit: 0 }), /limit deve ser/);
  assert.throws(() => store.revisionPreview(base.id, { limit: 1.5 }), /limit deve ser/);
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

test('evidence review queue is bounded, scoped and structural', () => {
  const store = new EvidenceStore();
  store.append({ ...base, id: 'review-pending-1', moduleId: 'wiki-arma3' });
  store.append({ ...base, id: 'review-verified', moduleId: 'wiki-arma3', status: 'verified' });
  store.append({ ...base, id: 'review-pending-2', moduleId: 'evidence' });
  store.append({ ...base, id: 'review-pending-3', moduleId: 'wiki-arma3' });

  const queue = projectEvidenceReviewQueue(store.list(), { moduleId: 'wiki-arma3', limit: 1 });
  assert.equal(queue.scope, 'wiki-arma3');
  assert.equal(queue.limit, 1);
  assert.deepEqual(queue.items.map((item) => [item.id, item.status, item.sourceRevision]), [
    ['review-pending-1', 'pending', 'r1'],
  ]);
  assert.deepEqual(queue.summary, { returned: 1, available: 2, truncated: true });
  assert.equal(Object.isFrozen(queue), true);
  assert.equal(Object.isFrozen(queue.items), true);
  assert.equal(Object.isFrozen(queue.items[0]), true);
  assert.deepEqual(Object.keys(queue.items[0] ?? {}).sort(), [
    'claimKey',
    'confidence',
    'id',
    'moduleId',
    'observedAt',
    'sourceRevision',
    'status',
  ]);
  assert.equal(Object.hasOwn(queue.items[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(queue.items[0] ?? {}, 'source'), false);
  assert.equal(Object.hasOwn(queue.items[0] ?? {}, 'collector'), false);

  const all = store.reviewQueue();
  assert.deepEqual(all.items.map((item) => item.id), [
    'review-pending-1',
    'review-pending-2',
    'review-pending-3',
  ]);
  assert.deepEqual(all.summary, { returned: 3, available: 3, truncated: false });
  assert.throws(() => projectEvidenceReviewQueue(store.list(), { moduleId: '' }), /moduleId deve ser/);
  assert.throws(() => projectEvidenceReviewQueue(store.list(), { limit: 0 }), /limit deve ser/);
  assert.throws(() => projectEvidenceReviewQueue(store.list(), { limit: 1.5 }), /limit deve ser/);
  assert.equal(store.list().length, 4);
});

test('evidence search is local, bounded, filtered and structural', () => {
  const store = new EvidenceStore();
  store.append({ ...base, id: 'search-alpha', claimKey: 'wiki:Alpha', moduleId: 'wiki-arma3', status: 'pending' });
  store.append({ ...base, id: 'search-beta', claimKey: 'wiki:Beta', moduleId: 'evidence', status: 'verified', source: { ...base.source, revision: 'R2' } });
  store.append({ ...base, id: 'search-gamma', claimKey: 'other:Gamma', moduleId: 'wiki-arma3', status: 'rejected' });

  const byClaim = projectEvidenceSearch(store.list(), { query: 'ALPHA', limit: 1 });
  assert.equal(byClaim.query, 'ALPHA');
  assert.equal(byClaim.scope, 'all');
  assert.equal(byClaim.status, 'all');
  assert.equal(byClaim.limit, 1);
  assert.deepEqual(byClaim.items.map((item) => [item.id, item.claimKey, item.status]), [
    ['search-alpha', 'wiki:Alpha', 'pending'],
  ]);
  assert.deepEqual(byClaim.summary, { returned: 1, available: 1, truncated: false });

  const scoped = store.search({ query: 'wiki', moduleId: 'wiki-arma3', status: 'pending', limit: 1 });
  assert.deepEqual(scoped.items.map((item) => item.id), ['search-alpha']);
  assert.deepEqual(scoped.summary, { returned: 1, available: 1, truncated: false });

  const byRevision = store.search({ query: 'r2', status: 'verified' });
  assert.deepEqual(byRevision.items.map((item) => item.id), ['search-beta']);
  assert.equal(Object.isFrozen(byRevision), true);
  assert.equal(Object.isFrozen(byRevision.items), true);
  assert.equal(Object.isFrozen(byRevision.items[0]), true);
  assert.deepEqual(Object.keys(byRevision.items[0] ?? {}).sort(), [
    'claimKey',
    'confidence',
    'id',
    'moduleId',
    'observedAt',
    'sourceRevision',
    'status',
  ]);
  assert.equal(Object.hasOwn(byRevision.items[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(byRevision.items[0] ?? {}, 'source'), false);
  assert.equal(Object.hasOwn(byRevision.items[0] ?? {}, 'uri'), false);

  const capped = projectEvidenceSearch(store.list(), { query: 'search', limit: 1 });
  assert.deepEqual(capped.summary, { returned: 1, available: 3, truncated: true });
  assert.equal(capped.items.length, 1);
  assert.throws(() => projectEvidenceSearch(store.list(), { query: '' }), /query deve ser/);
  assert.throws(() => projectEvidenceSearch(store.list(), { query: 'x', moduleId: '' }), /moduleId deve ser/);
  assert.throws(() => projectEvidenceSearch(store.list(), { query: 'x', status: 'unknown' }), /status de evidência/);
  assert.throws(() => projectEvidenceSearch(store.list(), { query: 'x', limit: 0 }), /limit deve ser/);
  assert.throws(() => projectEvidenceSearch(store.list(), { query: 'x', limit: 1.5 }), /limit deve ser/);
  assert.equal(store.list().length, 3);
});

test('evidence audit preview is structural, bounded and read-only', () => {
  const store = new EvidenceStore();
  store.append({ ...base, id: 'audit-pending', moduleId: 'wiki-arma3' });
  store.append({ ...base, id: 'audit-verified', moduleId: 'evidence', status: 'verified' });
  store.append({ ...base, id: 'audit-rejected', moduleId: 'wiki-arma3', status: 'rejected' });

  const preview = projectEvidenceAudit(store.list());
  assert.equal(preview.scope, 'all');
  assert.equal(preview.limit, 25);
  assert.deepEqual(preview.records.map((record) => [record.id, record.moduleId, record.status]), [
    ['audit-pending', 'wiki-arma3', 'pending'],
    ['audit-verified', 'evidence', 'verified'],
    ['audit-rejected', 'wiki-arma3', 'rejected'],
  ]);
  assert.deepEqual(preview.summary, {
    returned: 3,
    pending: 1,
    verified: 1,
    rejected: 1,
    superseded: 0,
    truncated: false,
  });
  assert.equal(Object.isFrozen(preview), true);
  assert.equal(Object.isFrozen(preview.records), true);
  assert.equal(Object.isFrozen(preview.records[0]), true);
  assert.deepEqual(Object.keys(preview.records[0] ?? {}).sort(), [
    'id',
    'moduleId',
    'observedAt',
    'status',
  ]);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'statement'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'source'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'collector'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'claimKey'), false);
  assert.equal(Object.hasOwn(preview.records[0] ?? {}, 'confidence'), false);

  const limited = projectEvidenceAudit(store.list(), { limit: 2 });
  assert.equal(limited.records.length, 2);
  assert.deepEqual(limited.summary, {
    returned: 2,
    pending: 1,
    verified: 1,
    rejected: 0,
    superseded: 0,
    truncated: true,
  });

  const scoped = projectEvidenceAudit(store.list(), { moduleId: 'wiki-arma3', limit: 1 });
  assert.equal(scoped.scope, 'wiki-arma3');
  assert.deepEqual(scoped.records.map((record) => record.id), ['audit-pending']);
  assert.equal(scoped.summary.truncated, true);
  assert.equal(store.list().length, 3);
  assert.equal(store.get('audit-verified')?.status, 'verified');

  assert.throws(() => projectEvidenceAudit(store.list(), { moduleId: '' }), /moduleId deve ser/);
  assert.throws(() => projectEvidenceAudit(store.list(), { limit: 0 }), /limit deve ser/);
  assert.throws(() => projectEvidenceAudit(store.list(), { limit: 1.5 }), /limit deve ser/);
});
