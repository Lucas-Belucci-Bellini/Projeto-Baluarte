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
  clearMemoryCorpusCache,
  getLastMemoryCorpusObservation,
  getMemoryCorpusCache,
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
