import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROJECT_REGISTRY_CATALOG,
  normalizeProjectRegistryEntry,
  projectRegistrySnapshot,
  validateProjectRegistryEntry,
} from '../../v2/data/project-registry.js';

test('Project Registry expõe catálogo local conservador', () => {
  const snapshot = projectRegistrySnapshot();

  assert.equal(snapshot.scope, 'project-registry/local');
  assert.equal(snapshot.summary.available, 4);
  assert.equal(snapshot.summary.returned, 4);
  assert.equal(snapshot.summary.truncated, false);
  assert.deepEqual(snapshot.entries.map((entry) => entry.id), [
    'veritas',
    'dailyplanner',
    'stock-analyzer-bot',
    'project-vanguard',
  ]);
  assert.ok(snapshot.entries.every((entry) => entry.auditState === 'not-audited'));
  assert.ok(snapshot.entries.every((entry) => entry.decision === 'defer'));
});

test('Project Registry filtra por texto, auditoria, decisão e aplica teto bounded', () => {
  const filtered = projectRegistrySnapshot(PROJECT_REGISTRY_CATALOG, {
    query: 'stock',
    auditState: 'not-audited',
    decision: 'defer',
    limit: 1,
  });

  assert.equal(filtered.summary.available, 1);
  assert.equal(filtered.summary.returned, 1);
  assert.equal(filtered.summary.truncated, false);
  assert.equal(filtered.entries[0].name, 'Stock Analyzer Bot');

  const bounded = projectRegistrySnapshot(PROJECT_REGISTRY_CATALOG, { limit: 1000 });
  assert.equal(bounded.limit, 100);
  assert.equal(bounded.summary.returned, 4);
});

test('Project Registry congela snapshot, entradas e listas normalizadas', () => {
  const snapshot = projectRegistrySnapshot();

  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.entries));
  assert.ok(Object.isFrozen(snapshot.entries[0]));
  assert.ok(Object.isFrozen(snapshot.entries[0].source));
  assert.ok(Object.isFrozen(snapshot.entries[0].capabilities));
  assert.throws(() => {
    snapshot.entries[0].name = 'alterado';
  }, TypeError);
});

test('Project Registry rejeita decisão positiva para entrada não auditada', () => {
  const input = {
    id: 'unknown-project',
    name: 'Unknown Project',
    source: { kind: 'repository', reference: 'https://example.invalid/project' },
    auditState: 'not-audited',
    decision: 'use',
    nextStep: 'executar',
  };
  const validation = validateProjectRegistryEntry(input);

  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('; '), /not-audited.*defer/);
  assert.throws(() => normalizeProjectRegistryEntry(input), /entrada do Project Registry inválida/);
});

test('Project Registry rejeita ids duplicados e limites inválidos', () => {
  const duplicate = [PROJECT_REGISTRY_CATALOG[0], PROJECT_REGISTRY_CATALOG[0]];

  assert.throws(() => projectRegistrySnapshot(duplicate), /id duplicado/);
  assert.throws(() => projectRegistrySnapshot(PROJECT_REGISTRY_CATALOG, { limit: 0 }), /limit deve ser inteiro positivo/);
  assert.throws(() => projectRegistrySnapshot(PROJECT_REGISTRY_CATALOG, { query: '   ' }), /query deve ser texto não vazio/);
});
