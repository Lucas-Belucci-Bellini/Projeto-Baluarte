import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRegistry } from '../../v2/core/registry.js';
import { criarContexto } from '../../v2/core/contexto.js';
import { criarResolvedorApi } from '../../v2/core/api.js';
import evidence from '../../v2/modules/evidence/module.js';
import wikiZomboid from '../../v2/modules/wiki-zomboid/module.js';
import {
  normalizeZomboidWikiEntry,
  validateZomboidWikiEntry,
  zomboidWorkshopEntryId,
} from '../../v2/data/wiki-zomboid.js';

const fixture = {
  id: zomboidWorkshopEntryId('1234567890'),
  name: 'Fixture vehicle',
  author: 'Fixture author',
  category: 'veiculo',
  workshopId: '1234567890',
  modId: '',
  spawnId: '',
  source: {
    uri: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890',
    title: 'Fixture vehicle — Steam Workshop',
    publisher: 'Fixture author',
    revision: 'fixture-r1',
  },
  retrievedAt: '2026-08-22T00:00:00.000Z',
};

function localStorage() {
  return {
    get: () => undefined,
    set: () => true,
  };
}

function localLog() {
  return { debug: () => {} };
}

test('schema Wiki Zomboid normaliza proveniência e rejeita Workshop ID inválido', () => {
  const validation = validateZomboidWikiEntry(fixture);
  assert.equal(validation.valid, true, validation.errors.join('; '));
  const normalized = normalizeZomboidWikiEntry(fixture);
  assert.equal(normalized.id, 'zomboid:workshop:1234567890');
  assert.equal(normalized.source.revision, 'fixture-r1');
  assert.equal(Object.isFrozen(normalized), true);
  assert.equal(Object.isFrozen(normalized.source), true);
  assert.equal(validateZomboidWikiEntry({ ...fixture, workshopId: 'id-inválido' }).valid, false);
  assert.throws(() => zomboidWorkshopEntryId(''), /workshopId inválido/);
});

test('Wiki Zomboid declara rota, API e referência fraca à Evidence', () => {
  const registry = criarRegistry();
  assert.equal(registry.registrar(wikiZomboid), true);
  const seal = registry.selar();
  assert.equal(seal.ok, true, JSON.stringify(seal.recusados));
  assert.deepEqual(seal.ativos, ['wiki-zomboid']);
  assert.deepEqual(registry.rotas().map((route) => route.path), ['/wiki-zomboid']);
  assert.deepEqual(registry.navegacao().map((entry) => entry.path), ['/wiki-zomboid']);
  assert.deepEqual(registry.referenciasOrfas(), [
    { modulo: 'wiki-zomboid', tipo: 'modulo', alvo: 'evidence' },
  ]);
  assert.deepEqual(wikiZomboid.references, { modules: ['evidence'] });
});

test('Wiki Zomboid resolve Evidence pelo Registry e anexa somente fato local bounded', () => {
  const registry = criarRegistry();
  registry.registrar(evidence);
  registry.registrar(wikiZomboid);
  const seal = registry.selar();
  assert.equal(seal.ok, true, JSON.stringify(seal.recusados));
  const apis = criarResolvedorApi(registry);
  evidence.lifecycle.init({ log: localLog() });
  wikiZomboid.lifecycle.init(criarContexto(wikiZomboid, {
    storage: localStorage(),
    apis,
  }));

  const summary = wikiZomboid.api.summary();
  assert.equal(summary.total, 159);
  assert.equal(summary.categories, 8);
  assert.equal(summary.sourceMode, 'local-curated');
  assert.equal(summary.evidenceAvailable, true);
  assert.equal(summary.evidenceLinked, 0);
  assert.equal(wikiZomboid.api.list(1).length, 1);
  assert.equal(wikiZomboid.api.list(101).length, 100);

  const record = wikiZomboid.api.appendEvidence('3736408852', 'workshopId');
  assert.equal(record?.claimKey, 'wiki-zomboid:zomboid:workshop:3736408852:workshopId');
  assert.equal(record?.status, 'pending');
  assert.equal(record?.source.revision, 'local-zomboid-curated-2026-08-22');
  assert.equal(wikiZomboid.api.summary().evidenceLinked, 1);
  assert.equal(Object.hasOwn(record ?? {}, 'source'), true);
  assert.equal(Object.hasOwn(record ?? {}, 'statement'), true);

  wikiZomboid.lifecycle.dispose();
  evidence.lifecycle.dispose();
});

test('Wiki Zomboid mantém fallback quando Evidence não está registrada', () => {
  const registry = criarRegistry();
  registry.registrar(wikiZomboid);
  registry.selar();
  const apis = criarResolvedorApi(registry);
  wikiZomboid.lifecycle.init(criarContexto(wikiZomboid, {
    storage: localStorage(),
    apis,
  }));
  assert.equal(wikiZomboid.api.summary().evidenceAvailable, false);
  assert.equal(wikiZomboid.api.appendEvidence('3736408852'), null);
  wikiZomboid.lifecycle.dispose();
});
