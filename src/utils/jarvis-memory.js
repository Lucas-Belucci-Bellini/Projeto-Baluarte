/**
 * JARVIS Memory (Fase 20) — persistência em IndexedDB.
 *
 * Substitui o localStorage simples da Fase 19 por um banco estruturado
 * com múltiplas sessões de conversa.
 *
 * Stores:
 *   - sessions:  { id, title, mode, createdAt, updatedAt }
 *   - messages:  { id (auto), sessionId, role, text, ts }
 *
 * Fallback: se IndexedDB falhar, opera em memória (perde no reload).
 */

import { randHex } from './helpers.js';

const DB_NAME = 'baluarte-jarvis';
const DB_VERSION = 1;

let dbPromise = null;
const memFallback = { sessions: [], messages: [] };
let usingFallback = false;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      usingFallback = true;
      reject(new Error('IndexedDB indisponível'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const ms = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        ms.createIndex('bySession', 'sessionId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      usingFallback = true;
      reject(req.error);
    };
  });
  return dbPromise;
}

function tx(storeName, mode = 'readonly') {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + randHex(3);
}

/* ===== Sessions ===== */

export async function createSession(title, mode) {
  const session = {
    id: uid('sess'),
    title: title || 'Nova conversa',
    mode: mode || 'local',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  try {
    const store = await tx('sessions', 'readwrite');
    await reqAsync(store.add(session));
  } catch {
    memFallback.sessions.push(session);
  }
  return session;
}

export async function listSessions() {
  try {
    const store = await tx('sessions');
    const all = await reqAsync(store.getAll());
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [...memFallback.sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export async function updateSession(id, patch) {
  try {
    const store = await tx('sessions', 'readwrite');
    const session = await reqAsync(store.get(id));
    if (session) {
      Object.assign(session, patch, { updatedAt: Date.now() });
      await reqAsync(store.put(session));
    }
  } catch {
    const s = memFallback.sessions.find((x) => x.id === id);
    if (s) Object.assign(s, patch, { updatedAt: Date.now() });
  }
}

export async function deleteSession(id) {
  try {
    const sStore = await tx('sessions', 'readwrite');
    await reqAsync(sStore.delete(id));
    /* Apaga mensagens da sessão */
    const mStore = await tx('messages', 'readwrite');
    const idx = mStore.index('bySession');
    const keys = await reqAsync(idx.getAllKeys(id));
    for (const key of keys) await reqAsync(mStore.delete(key));
  } catch {
    memFallback.sessions = memFallback.sessions.filter((s) => s.id !== id);
    memFallback.messages = memFallback.messages.filter((m) => m.sessionId !== id);
  }
}

/* ===== Messages ===== */

export async function addMessage(sessionId, role, text) {
  const msg = { sessionId, role, text, ts: Date.now() };
  try {
    const store = await tx('messages', 'readwrite');
    const id = await reqAsync(store.add(msg));
    msg.id = id;
  } catch {
    msg.id = memFallback.messages.length + 1;
    memFallback.messages.push(msg);
  }
  await updateSession(sessionId, {});
  return msg;
}

export async function getMessages(sessionId) {
  try {
    const store = await tx('messages');
    const idx = store.index('bySession');
    const all = await reqAsync(idx.getAll(sessionId));
    return all.sort((a, b) => a.ts - b.ts);
  } catch {
    return memFallback.messages
      .filter((m) => m.sessionId === sessionId)
      .sort((a, b) => a.ts - b.ts);
  }
}

/** Todas as mensagens de todas as sessões (para recall entre conversas). */
export async function getAllMessages() {
  try {
    const store = await tx('messages');
    return await reqAsync(store.getAll());
  } catch {
    return [...memFallback.messages];
  }
}

export async function clearAll() {
  try {
    const sStore = await tx('sessions', 'readwrite');
    await reqAsync(sStore.clear());
    const mStore = await tx('messages', 'readwrite');
    await reqAsync(mStore.clear());
  } catch {
    memFallback.sessions = [];
    memFallback.messages = [];
  }
}

export function isUsingFallback() {
  return usingFallback;
}

/* ===== Helper: Promisifica IDBRequest ===== */

function reqAsync(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
