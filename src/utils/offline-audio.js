/**
 * Acervo de música OFFLINE — guarda os arquivos de áudio do PRÓPRIO usuário no
 * navegador (IndexedDB), pra tocar SEM internet e em QUALQUER rede (inclusive as
 * que bloqueiam Spotify/YouTube). Os bytes ficam no aparelho — nada sai pra rede,
 * nada pesa no bundle. Cumpre o objetivo do operador ("ouvir em qualquer lugar,
 * independente do WiFi", #291 §3). Sem dependências (#238 web leve).
 *
 * Modelo: 1 object store `tracks` (keyPath `id`) com `{ id, name, type, size,
 * addedAt, blob }`. O `blob` (o File) só é lido no play; a listagem devolve só
 * os metadados.
 */

import { uid } from './helpers.js';

const DB_NAME = 'baluarte-music';
const STORE = 'tracks';
const DB_VERSION = 1;

/** Extensões de áudio aceitas quando o `type` do arquivo vem vazio. */
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm|mp4|weba)$/i;

let dbPromise = null;

/** IndexedDB disponível? (alguns modos privados antigos bloqueiam). */
export function offlineAudioSupported() {
  return typeof indexedDB !== 'undefined';
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** Roda `fn(store)` numa transação e resolve quando ela completa. */
function withStore(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const out = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(out && out.__req ? out.__req.result : out);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

function isAudioFile(f) {
  return !!f && (/^audio\//.test(f.type) || AUDIO_EXT.test(f.name || ''));
}

/** Tira a extensão e troca `_` por espaço, pra um título limpo. */
function cleanName(filename) {
  return (
    String(filename || 'Faixa')
      .replace(/\.[^.]+$/, '')
      .replace(/[_]+/g, ' ')
      .trim() || 'Faixa'
  );
}

/**
 * Adiciona arquivos (FileList ou array de File). Ignora não-áudio.
 * Devolve os metadados das faixas adicionadas.
 */
export async function addFiles(files) {
  const list = Array.from(files || []).filter(isAudioFile);
  if (!list.length) return [];
  const added = list.map((f) => ({
    id: uid('trk'),
    name: cleanName(f.name),
    type: f.type || 'audio/mpeg',
    size: f.size || 0,
    addedAt: Date.now()
  }));
  await withStore('readwrite', (store) => {
    list.forEach((f, i) => store.put({ ...added[i], blob: f }));
  });
  return added;
}

/** Lista as faixas (só metadados), mais antigas primeiro. */
export async function listTracks() {
  const recs = await withStore('readonly', (store) => ({ __req: store.getAll() }));
  return (recs || [])
    .map(({ id, name, type, size, addedAt }) => ({ id, name, type, size, addedAt }))
    .sort((a, b) => a.addedAt - b.addedAt);
}

/** Devolve o Blob (File) de uma faixa pra tocar, ou null. */
export async function getBlob(id) {
  const rec = await withStore('readonly', (store) => ({ __req: store.get(id) }));
  return rec ? rec.blob : null;
}

/** Remove uma faixa. */
export function removeTrack(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

/** Apaga TODO o acervo deste aparelho. */
export function clearAll() {
  return withStore('readwrite', (store) => store.clear());
}

/** Tamanho legível (B/KB/MB). */
export function formatSize(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
