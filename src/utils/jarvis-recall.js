/**
 * Jarvis Recall — memória entre conversas (estilo claude-mem).
 *
 * Conceito do **claude-mem** (thedotmack): manter contexto entre sessões.
 *   - summarizeSession(): resume uma conversa em uma linha compacta (econômico).
 *   - recall(): dada a pergunta atual, acha os resumos mais RELEVANTES de
 *     conversas anteriores (TF-IDF + cosseno) para injetar como memória.
 *
 * Tudo determinístico, JS puro, sem modelo nem dependências. "Disclosure
 * progressivo": injeta resumos curtos em vez do histórico inteiro → menos tokens.
 */

const STOP = new Set((
  'a o e de da do das dos que em um uma para por com no na os as se ao à é são ' +
  'foi era ser tem há mais mas ou eu você ele ela isso este essa esse aqui ali ' +
  'the and to of in is it for on with that this you are be as at or your was'
).split(/\s+/));

/** Tokeniza: minúsculas, sem acento/pontuação, sem stopwords, >2 letras. */
export function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function tfidfVec(tokens, idf) {
  const tf = new Map();
  for (const w of tokens) tf.set(w, (tf.get(w) || 0) + 1);
  const v = new Map();
  for (const [w, f] of tf) v.set(w, f * (idf(w)));
  return v;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const [w, x] of a) { na += x * x; if (b.has(w)) dot += x * b.get(w); }
  for (const [, y] of b) nb += y * y;
  return (na && nb) ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

function buildRecallStats(tokenLists) {
  const df = new Map();
  for (const tokens of tokenLists) {
    for (const word of new Set(tokens)) df.set(word, (df.get(word) || 0) + 1);
  }
  const N = tokenLists.length;
  const idfByToken = new Map();
  for (const [word, frequency] of df) {
    idfByToken.set(word, Math.log(1 + N / (frequency + 1)));
  }
  const idf = (word) => idfByToken.get(word) ?? Math.log(1 + N);
  return {
    idfByToken,
    vectors: tokenLists.map((tokens) => tfidfVec(tokens, idf)),
  };
}

export function buildRecallIndex(docs) {
  if (!Array.isArray(docs)) return null;
  const safeDocs = docs.slice(0, MAX_MEMORY_CACHE_DOCS);
  const tokensByDoc = safeDocs.map((doc) => tokenize(doc.text));
  const stats = buildRecallStats(tokensByDoc);
  return {
    docs: safeDocs,
    positions: new Map(safeDocs.map((doc, index) => [doc, index])),
    tokensByDoc,
    idfByToken: stats.idfByToken,
    vectors: stats.vectors,
  };
}

function indexCoversDocs(index, docs) {
  return Boolean(
    index
      && Array.isArray(index.docs)
      && Array.isArray(index.tokensByDoc)
      && docs.length <= index.docs.length
      && docs.every((doc) => index.positions?.has(doc)),
  );
}

function prepareRecallStats(docs, index) {
  if (!indexCoversDocs(index, docs)) {
    return buildRecallStats(docs.map((doc) => tokenize(doc.text)));
  }

  const tokenLists = docs.map((doc) => index.tokensByDoc[index.positions.get(doc)]);
  const sameCorpus = docs.length === index.docs.length
    && docs.every((doc, position) => doc === index.docs[position]);
  return sameCorpus ? index : buildRecallStats(tokenLists);
}

function scoreRecallWithoutIndex(queryTokens, docs, k) {
  const stats = buildRecallStats(docs.map((doc) => tokenize(doc.text)));
  const idf = (word) => stats.idfByToken.get(word) ?? Math.log(1 + docs.length);
  const queryVector = tfidfVec(queryTokens, idf);
  const scored = docs.map((doc, index) => ({
    text: doc.text,
    sessionId: doc.sessionId,
    score: cosine(queryVector, stats.vectors[index]),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((hit) => hit.score > 0.04).slice(0, k);
}

/**
 * Recall por relevância.
 * @param {string} query  pergunta atual
 * @param {Array<{text:string, sessionId?:string}>} docs  resumos/candidatos
 * @param {number} k  máximo de resultados
 * @param {object|null} index índice derivado opcional do mesmo corpus/revisão
 * @returns {Array<{text, sessionId, score}>} ordenados por relevância
 */
export function recall(query, docs, k = 3, index = null) {
  const q = tokenize(query);
  if (!q.length || !docs || !docs.length) return [];
  if (docs.length > MAX_MEMORY_CACHE_DOCS && !indexCoversDocs(index, docs)) {
    return scoreRecallWithoutIndex(q, docs, k);
  }

  const stats = prepareRecallStats(docs, index);
  const idf = (word) => stats.idfByToken.get(word) ?? Math.log(1 + docs.length);
  const queryVector = tfidfVec(q, idf);
  const scored = docs.map((doc, indexInCorpus) => ({
    text: doc.text,
    sessionId: doc.sessionId,
    score: cosine(queryVector, stats.vectors[indexInCorpus]),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((hit) => hit.score > 0.04).slice(0, k);
}

/* Cache do corpus de memória (resumos por sessão), para a ferramenta síncrona
 * recall_memory do agente — preenchido pela página do Jarvis. */
const MAX_MEMORY_CACHE_DOCS = 256;
let _memCache = [];
let _corpusCache = null;
let _recallIndex = null;
let _lastCorpusObservation = null;

export function setMemoryCache(docs) {
  _memCache = Array.isArray(docs) ? docs.slice(0, MAX_MEMORY_CACHE_DOCS) : [];
}

export function getMemoryCache() { return _memCache.slice(); }

export function setMemoryCorpusCache(revision, docs) {
  const safeRevision = Number.isInteger(revision) && revision >= 0 ? revision : 0;
  const safeDocs = Array.isArray(docs) ? docs.slice(0, MAX_MEMORY_CACHE_DOCS) : [];
  _corpusCache = { revision: safeRevision, docs: safeDocs };
  _recallIndex = buildRecallIndex(safeDocs);
  return safeDocs.slice();
}

export function getMemoryCorpusCache(revision) {
  if (!_corpusCache || _corpusCache.revision !== revision) {
    return null;
  }
  return _corpusCache.docs.slice();
}

export function getMemoryCorpusIndex(revision) {
  if (!_corpusCache || _corpusCache.revision !== revision) return null;
  return _recallIndex;
}

export function clearMemoryCorpusCache() {
  _corpusCache = null;
  _recallIndex = null;
}

export function recordMemoryCorpusObservation(observation) {
  _lastCorpusObservation = {
    revision: Number.isInteger(observation?.revision) && observation.revision >= 0 ? observation.revision : 0,
    documents: Math.max(0, Math.min(MAX_MEMORY_CACHE_DOCS, Math.floor(Number(observation?.documents) || 0))),
    cacheHit: observation?.cacheHit === true,
    buildMs: Math.max(0, Math.min(60_000, Math.floor(Number(observation?.buildMs) || 0))),
  };
}

export function getLastMemoryCorpusObservation() {
  return _lastCorpusObservation ? { ..._lastCorpusObservation } : null;
}

/** Resume uma sessão (lista de mensagens {role, text, ts}) em uma linha. */
export function summarizeSession(messages) {
  const msgs = messages || [];
  const users = msgs.filter((m) => m.role === 'user').map((m) => m.text || '');
  const jarvis = msgs.filter((m) => m.role === 'jarvis').map((m) => m.text || '');
  if (!users.length && !jarvis.length) return '';

  const goal = users[0] ? users[0].replace(/\s+/g, ' ').trim().slice(0, 160) : '';
  let key = '';
  for (const j of jarvis) {
    const t = j.replace(/```[\s\S]*?```/g, ' [código] ').replace(/\s+/g, ' ').trim();
    if (t.length > key.length && t.length < 320) key = t;
    if (key.length > 140) break;
  }
  const topics = [...new Set(users.flatMap((u) => tokenize(u)))].slice(0, 8).join(', ');
  return [
    goal && `Objetivo: ${goal}`,
    key && `Resposta-chave: ${key.slice(0, 160)}`,
    topics && `Temas: ${topics}`
  ].filter(Boolean).join(' · ').slice(0, 360);
}
