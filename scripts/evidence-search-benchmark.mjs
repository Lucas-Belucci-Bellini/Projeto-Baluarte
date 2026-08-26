#!/usr/bin/env node

import { PZ_IDS } from '../src/data/zomboid-admin.js';
import { normalizeZomboidWikiEntry } from '../v2/data/wiki-zomboid.js';
import { evidenceFromCatalog } from '../v2/data/catalog-evidence.js';
import { EvidenceStore } from '../v2/data/evidence.js';

const RETRIEVED_AT = '2026-08-22T00:00:00.000Z';
const DATASET_REVISION = 'local-zomboid-curated-2026-08-22';
const FIELDS = ['name', 'author', 'category', 'workshopId', 'modId', 'spawnId'];

function entryFromPzId(item) {
  return normalizeZomboidWikiEntry({
    id: `workshop:${item.workshopId}`,
    name: item.name,
    author: item.author,
    category: item.cat,
    workshopId: item.workshopId,
    modId: item.modId,
    spawnId: item.spawnId,
    source: {
      uri: `https://steamcommunity.com/sharedfiles/filedetails/?id=${item.workshopId}`,
      title: `${item.name} — Steam Workshop`,
      publisher: item.author,
      revision: DATASET_REVISION,
    },
    retrievedAt: RETRIEVED_AT,
  });
}

function valor(entry, field) {
  return entry[field];
}

function carregarCatalogo() {
  const store = new EvidenceStore();
  for (const item of PZ_IDS) {
    const entry = entryFromPzId(item);
    for (const field of FIELDS) {
      const value = valor(entry, field);
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) continue;
      store.append(evidenceFromCatalog({
        moduleId: 'wiki-zomboid',
        entityId: entry.id,
        field,
        value,
        source: entry.source,
        retrievedAt: entry.retrievedAt,
        confidence: 0.75,
        collector: 'evidence-search-benchmark',
      }));
    }
  }
  return store;
}

function medir(store, nome, options, repeticoes = 250) {
  for (let i = 0; i < 10; i += 1) store.search(options);
  const inicio = performance.now();
  let resultado = null;
  for (let i = 0; i < repeticoes; i += 1) resultado = store.search(options);
  const totalMs = performance.now() - inicio;
  return {
    nome,
    query: options.query,
    limit: options.limit ?? 25,
    meanUs: (totalMs * 1000) / repeticoes,
    available: resultado.summary.available,
    returned: resultado.summary.returned,
    truncated: resultado.summary.truncated,
  };
}

const store = carregarCatalogo();
const records = store.list().length;
const cenarios = [
  medir(store, 'todos os metadados', { query: 'wiki-zomboid', limit: 25 }),
  medir(store, 'campo workshop', { query: 'workshopid', limit: 100 }),
  medir(store, 'revisão do dataset', { query: DATASET_REVISION, limit: 100 }),
  medir(store, 'escopo + estado', { query: 'wiki-zomboid', moduleId: 'wiki-zomboid', status: 'pending', limit: 100 }),
];

console.log(JSON.stringify({
  benchmark: 'evidence-search-local',
  estado: 'passou',
  dataset: 'PZ_IDS local curado',
  entradas: PZ_IDS.length,
  registros: records,
  repeticoes: 250,
  cenarios: cenarios.map((resultado) => ({
    ...resultado,
    meanUs: Number(resultado.meanUs.toFixed(3)),
  })),
  limites: { defaultLimit: 25, maxLimit: 100 },
  interpretacao: 'diagnostico local; sem threshold de producao',
}, null, 2));
