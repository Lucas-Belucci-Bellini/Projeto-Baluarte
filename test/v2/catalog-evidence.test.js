import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceFromCatalog } from '../../v2/data/catalog-evidence.ts';

const source = { uri: 'https://example.test/catalog', revision: 'fixture-1' };

test('catalog adapter creates a deterministic evidence claim', () => {
  const result = evidenceFromCatalog({
    moduleId: 'wiki-arma3',
    entityId: 'article-42',
    field: 'title',
    value: 'A factual catalog value',
    source,
    retrievedAt: '2026-08-19T00:00:00.000Z',
    confidence: 0.7,
  });
  assert.equal(result.claimKey, 'wiki-arma3:article-42:title');
  assert.equal(result.statement, 'A factual catalog value');
  assert.equal(result.collector, 'catalog-adapter');
});

test('catalog adapter serializes structured values without losing provenance', () => {
  const result = evidenceFromCatalog({
    moduleId: 'wiki',
    entityId: 'article-1',
    field: 'metadata',
    value: { version: 42, tags: ['public'] },
    source,
    retrievedAt: '2026-08-19T00:00:00.000Z',
    confidence: 0.9,
    collector: 'wiki-fixture',
    evidenceId: 'ev-custom-1',
  });
  assert.equal(result.id, 'ev-custom-1');
  assert.equal(result.statement, '{"version":42,"tags":["public"]}');
  assert.deepEqual(result.source, source);
});

test('catalog adapter rejects empty identity fields', () => {
  assert.throws(() => evidenceFromCatalog({
    moduleId: '',
    entityId: 'article-1',
    field: 'title',
    value: 'x',
    source,
    retrievedAt: '2026-08-19T00:00:00.000Z',
    confidence: 0.5,
  }), /moduleId/);
});
