/**
 * Fingerprint engine — posicionamento por "impressão digital".
 *
 * Conceito do **find** (schollz/find): em vez de GPS, aprende a assinatura de
 * sinais de cada local e depois classifica onde você está comparando a leitura
 * atual com as aprendidas (vizinho-mais-próximo por similaridade de cosseno).
 *
 * Aqui o "sinal" é a assinatura ACÚSTICA do ambiente (espectro do microfone),
 * então funciona no navegador/celular sem hardware extra. O motor é genérico:
 * recebe vetores de características e não liga pra origem deles.
 *
 * JS puro, persistido em localStorage.
 */

import { storage } from '../core/storage.js';

const KEY = 'find:db';

/** Similaridade de cosseno entre dois vetores (1 = idêntico, 0 = ortogonal). */
export function cosine(a, b) {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function createFingerprintDB() {
  let db = load();

  function load() {
    const raw = storage.get(KEY, null);
    return raw && raw.locations ? raw : { locations: {} };
  }
  function persist() { storage.set(KEY, db); }

  /** Aprende uma amostra para um local (média acumulada = centroide). */
  function learn(name, vector) {
    name = String(name || '').trim();
    if (!name) throw new Error('Dê um nome ao local.');
    const v = Array.from(vector);
    const loc = db.locations[name] || { centroid: v.slice(), n: 0 };
    const c = loc.centroid;
    const nn = loc.n + 1;
    for (let i = 0; i < v.length; i++) c[i] = (c[i] * loc.n + v[i]) / nn;
    loc.n = nn;
    loc.centroid = c;
    db.locations[name] = loc;
    persist();
    return nn;
  }

  /** Classifica um vetor → lista de locais ordenada por similaridade. */
  function classify(vector) {
    const v = Array.from(vector);
    const res = Object.entries(db.locations).map(([name, loc]) => ({
      name, samples: loc.n, score: cosine(v, loc.centroid)
    }));
    res.sort((a, b) => b.score - a.score);
    const sum = res.reduce((s, r) => s + Math.max(0, r.score), 0) || 1;
    res.forEach((r) => { r.confidence = Math.max(0, r.score) / sum; });
    return res;
  }

  function locations() {
    return Object.entries(db.locations).map(([name, loc]) => ({ name, samples: loc.n }));
  }
  function remove(name) { delete db.locations[name]; persist(); }
  function clear() { db = { locations: {} }; persist(); }

  return { learn, classify, locations, remove, clear };
}
