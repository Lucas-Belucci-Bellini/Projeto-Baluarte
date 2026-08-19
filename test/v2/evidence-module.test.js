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
