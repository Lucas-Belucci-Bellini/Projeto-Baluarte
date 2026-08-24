import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addMessage,
  clearAll,
  createSession,
  deleteSession,
  getMemoryRevision,
} from '../src/utils/jarvis-memory.js';
import {
  buildRecallIndex,
  clearMemoryCorpusCache,
  getLastMemoryCorpusObservation,
  getMemoryCorpusCache,
  recall,
  recordMemoryCorpusObservation,
  setMemoryCorpusCache,
} from '../src/utils/jarvis-recall.js';

test('revisão aumenta nas mutações de sessão e mensagem', async () => {
  await clearAll();
  const initial = getMemoryRevision();
  const session = await createSession('cache test', 'local');
  const afterSession = getMemoryRevision();
  assert.ok(afterSession > initial);

  await addMessage(session.id, 'user', 'pergunta de teste');
  const afterMessage = getMemoryRevision();
  assert.ok(afterMessage > afterSession);

  await deleteSession(session.id);
  const afterDelete = getMemoryRevision();
  assert.ok(afterDelete > afterMessage);
  await clearAll();
});

test('cache corpus retorna cópias e limita a 256 documentos', () => {
  clearMemoryCorpusCache();
  const docs = Array.from({ length: 300 }, (_, index) => ({
    sessionId: `sess-${index}`,
    text: `resumo ${index}`,
  }));
  const stored = setMemoryCorpusCache(7, docs);
  assert.equal(stored.length, 256);
  stored.pop();
  const hit = getMemoryCorpusCache(7);
  assert.equal(hit?.length, 256);
  assert.equal(getMemoryCorpusCache(6), null);
  assert.equal(hit?.[0]?.sessionId, 'sess-0');
});

test('mutação torna revisão nova incompatível com cache antigo', async () => {
  await clearAll();
  const session = await createSession('freshness', 'local');
  const revision = getMemoryRevision();
  setMemoryCorpusCache(revision, [{ sessionId: 'old', text: 'resumo antigo' }]);
  assert.ok(getMemoryCorpusCache(revision));
  await addMessage(session.id, 'user', 'novo conteúdo');
  assert.equal(getMemoryCorpusCache(getMemoryRevision()), null);
  await clearAll();
});

test('índice derivado preserva o ranking e os scores do recall original', () => {
  const docs = [
    { sessionId: 'alpha', text: 'Arsenal de infantaria e veículos leves para reconhecimento.' },
    { sessionId: 'bravo', text: 'Biblioteca de crônicas e documentação histórica do projeto.' },
    { sessionId: 'charlie', text: 'Arsenal pesado para defesa de perímetro e logística.' },
    { sessionId: 'delta', text: '' },
  ];
  const index = buildRecallIndex(docs);
  assert.ok(index);
  for (const query of ['arsenal veículos', 'CRÔNICAS históricas', '', 'sem correspondência']) {
    assert.deepEqual(recall(query, docs, 3), recall(query, docs, 3, index));
  }
  const subset = [docs[2], docs[0]];
  assert.deepEqual(recall('arsenal', subset, 2), recall('arsenal', subset, 2, index));
  assert.deepEqual(recall('arsenal', docs.map((doc) => ({ ...doc })), 2), recall('arsenal', docs.map((doc) => ({ ...doc })), 2, index));
});

test('observabilidade do corpus é bounded e não inclui conteúdo', () => {
  recordMemoryCorpusObservation({
    revision: 9.7,
    documents: 999,
    cacheHit: true,
    buildMs: 90_000,
    sessionId: 'não deveria aparecer',
    text: 'não deveria aparecer',
  });
  assert.deepEqual(getLastMemoryCorpusObservation(), {
    revision: 0,
    documents: 256,
    cacheHit: true,
    buildMs: 60_000,
  });
});
