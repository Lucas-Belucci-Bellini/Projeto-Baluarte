import { performance } from 'node:perf_hooks';
import {
  getMemoryCorpusCache,
  setMemoryCorpusCache,
  summarizeSession,
} from '../src/utils/jarvis-recall.js';

const SESSION_COUNT = 256;
const MESSAGES_PER_SESSION = 8;
const ROUNDS = 5;

const sessions = Array.from({ length: SESSION_COUNT }, (_, sessionIndex) => (
  Array.from({ length: MESSAGES_PER_SESSION }, (_, messageIndex) => ({
    role: messageIndex % 2 === 0 ? 'user' : 'jarvis',
    text: `sessão ${sessionIndex} turno ${messageIndex} planejamento operacional do Projeto Baluarte `.repeat(8),
    ts: messageIndex,
  }))
));

function buildCorpus() {
  return sessions.map((messages, sessionIndex) => ({
    sessionId: `sess-${sessionIndex}`,
    text: summarizeSession(messages),
  }));
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

const uncachedSamples = [];
let uncachedDocumentsBuilt = 0;
for (let round = 0; round < ROUNDS; round += 1) {
  const startedAt = performance.now();
  const docs = buildCorpus();
  uncachedSamples.push(performance.now() - startedAt);
  uncachedDocumentsBuilt += docs.length;
}

const initialDocs = buildCorpus();
setMemoryCorpusCache(1, initialDocs);
const cachedSamples = [];
let cachedDocumentsRead = 0;
for (let round = 0; round < ROUNDS; round += 1) {
  const startedAt = performance.now();
  const docs = getMemoryCorpusCache(1);
  cachedSamples.push(performance.now() - startedAt);
  cachedDocumentsRead += docs?.length || 0;
}

const uncachedMedianMs = Number(median(uncachedSamples).toFixed(3));
const cachedMedianMs = Number(median(cachedSamples).toFixed(3));
const report = {
  benchmark: 'jarvis-memory-cache-v1',
  deterministicInput: true,
  input: {
    sessions: SESSION_COUNT,
    messagesPerSession: MESSAGES_PER_SESSION,
    rounds: ROUNDS,
  },
  uncached: {
    documentsBuilt: uncachedDocumentsBuilt,
    medianMs: uncachedMedianMs,
  },
  cached: {
    documentsRead: cachedDocumentsRead,
    medianMs: cachedMedianMs,
  },
  logicalAvoidance: {
    summariesAvoided: uncachedDocumentsBuilt,
    cacheReads: ROUNDS,
    summaryRebuildReductionPercent: 100,
  },
  timing: {
    observedSpeedup: cachedMedianMs > 0 ? Number((uncachedMedianMs / cachedMedianMs).toFixed(2)) : null,
    note: 'Tempo é diagnóstico local do sandbox; a evidência principal é a eliminação determinística da reconstrução de resumos sob a mesma revisão.',
  },
};

console.log(JSON.stringify(report, null, 2));
