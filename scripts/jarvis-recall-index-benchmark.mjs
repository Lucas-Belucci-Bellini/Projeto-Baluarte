import { performance } from 'node:perf_hooks';
import { buildRecallIndex, recall } from '../src/utils/jarvis-recall.js';

const DOCUMENTS = 256;
const QUERIES = [
  'arsenal reconhecimento',
  'crônicas biblioteca',
  'logística operacional',
  'defesa perímetro',
  'projeto baluarte',
  'histórico de módulos',
  'notícia externa',
  'consulta sem correspondência',
];
const ROUNDS = 8;

const docs = Array.from({ length: DOCUMENTS }, (_, index) => ({
  sessionId: `sess-${index}`,
  text: [
    `sessão ${index} planejamento do Projeto Baluarte`,
    index % 2 === 0 ? 'arsenal reconhecimento logística' : 'biblioteca crônicas histórico',
    index % 3 === 0 ? 'defesa perímetro módulo operacional' : 'equipe documentação evidência',
  ].join(' — '),
}));

const index = buildRecallIndex(docs);
const baselineSamples = [];
const indexedSamples = [];
let equivalenceChecked = true;

for (const query of QUERIES) {
  const baseline = recall(query, docs, 3);
  const indexed = recall(query, docs, 3, index);
  if (JSON.stringify(baseline) !== JSON.stringify(indexed)) equivalenceChecked = false;
}

for (let round = 0; round < ROUNDS; round += 1) {
  let startedAt = performance.now();
  for (const query of QUERIES) recall(query, docs, 3);
  baselineSamples.push(performance.now() - startedAt);

  startedAt = performance.now();
  for (const query of QUERIES) recall(query, docs, 3, index);
  indexedSamples.push(performance.now() - startedAt);
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

const baselineMedianMs = Number(median(baselineSamples).toFixed(3));
const indexedMedianMs = Number(median(indexedSamples).toFixed(3));
const baselineDocumentTokenizations = ROUNDS * QUERIES.length * DOCUMENTS;
const indexedDocumentTokenizations = DOCUMENTS;
const avoided = baselineDocumentTokenizations - indexedDocumentTokenizations;

console.log(JSON.stringify({
  benchmark: 'jarvis-recall-index-v1',
  deterministicInput: true,
  input: { documents: DOCUMENTS, queries: QUERIES.length, rounds: ROUNDS },
  equivalenceChecked,
  baseline: {
    medianMs: baselineMedianMs,
    documentTokenizations: baselineDocumentTokenizations,
  },
  indexed: {
    medianMs: indexedMedianMs,
    documentTokenizations: indexedDocumentTokenizations,
  },
  reductions: {
    documentTokenizationsAvoided: avoided,
    documentTokenizationReductionPercent: Number(((avoided / baselineDocumentTokenizations) * 100).toFixed(2)),
    observedSpeedup: indexedMedianMs > 0 ? Number((baselineMedianMs / indexedMedianMs).toFixed(2)) : null,
  },
  note: 'Tempos são diagnósticos do sandbox. O índice não cacheia queries, hits, scores ou conteúdo adicional.',
}, null, 2));
