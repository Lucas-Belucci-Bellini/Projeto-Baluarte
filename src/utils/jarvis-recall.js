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

/**
 * Recall por relevância.
 * @param {string} query  pergunta atual
 * @param {Array<{text:string, sessionId?:string}>} docs  resumos/candidatos
 * @param {number} k  máximo de resultados
 * @returns {Array<{text, sessionId, score}>} ordenados por relevância
 */
export function recall(query, docs, k = 3) {
  const q = tokenize(query);
  if (!q.length || !docs || !docs.length) return [];

  const df = new Map();
  const docTokens = docs.map((d) => {
    const t = tokenize(d.text);
    for (const w of new Set(t)) df.set(w, (df.get(w) || 0) + 1);
    return t;
  });
  const N = docs.length;
  const idf = (w) => Math.log(1 + N / ((df.get(w) || 0) + 1));

  const qv = tfidfVec(q, idf);
  const scored = docs.map((d, i) => ({
    text: d.text, sessionId: d.sessionId,
    score: cosine(qv, tfidfVec(docTokens[i], idf))
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0.04).slice(0, k);
}

/* Cache do corpus de memória (resumos por sessão), para a ferramenta síncrona
 * recall_memory do agente — preenchido pela página do Jarvis. */
const MAX_MEMORY_CACHE_DOCS = 256;
let _memCache = [];
let _corpusCache = null;
let _lastCorpusObservation = null;

export function setMemoryCache(docs) {
  _memCache = Array.isArray(docs) ? docs.slice(0, MAX_MEMORY_CACHE_DOCS) : [];
}

export function getMemoryCache() { return _memCache.slice(); }

export function setMemoryCorpusCache(revision, docs) {
  const safeRevision = Number.isInteger(revision) && revision >= 0 ? revision : 0;
  const safeDocs = Array.isArray(docs) ? docs.slice(0, MAX_MEMORY_CACHE_DOCS) : [];
  _corpusCache = { revision: safeRevision, docs: safeDocs };
  return safeDocs.slice();
}

export function getMemoryCorpusCache(revision) {
  if (!_corpusCache || _corpusCache.revision !== revision) {
    return null;
  }
  return _corpusCache.docs.slice();
}

export function clearMemoryCorpusCache() {
  _corpusCache = null;
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
