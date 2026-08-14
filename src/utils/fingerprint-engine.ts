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

export type FingerprintVector = ArrayLike<number>;

export interface FingerprintLocation {
  readonly centroid: number[];
  readonly n: number;
}

export interface FingerprintMatch {
  readonly name: string;
  readonly samples: number;
  readonly score: number;
  confidence: number;
}

export interface FingerprintLocationSummary {
  readonly name: string;
  readonly samples: number;
}

export interface FingerprintDatabase {
  readonly locations: Record<string, FingerprintLocation>;
}

/** Similaridade de cosseno entre dois vetores (1 = idêntico, 0 = ortogonal). */
export function cosine(a: FingerprintVector, b: FingerprintVector): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isLocation(value: unknown): value is FingerprintLocation {
  if (!isRecord(value) || !Array.isArray(value.centroid)) return false;
  const samples = value.n;
  return typeof samples === 'number'
    && Number.isInteger(samples)
    && samples >= 0
    && value.centroid.every(
      (component): component is number => (
        typeof component === 'number' && Number.isFinite(component)
      ),
    );
}

function isDatabase(value: unknown): value is FingerprintDatabase {
  if (!isRecord(value) || !isRecord(value.locations)) return false;
  return Object.values(value.locations).every(isLocation);
}

export interface FingerprintDB {
  learn(name: string, vector: FingerprintVector): number;
  classify(vector: FingerprintVector): FingerprintMatch[];
  locations(): FingerprintLocationSummary[];
  remove(name: string): void;
  clear(): void;
}

export function createFingerprintDB(): FingerprintDB {
  let db = load();

  function load(): FingerprintDatabase {
    const raw: unknown = storage.get<unknown>(KEY, null);
    return isDatabase(raw) ? raw : { locations: {} };
  }

  function persist(): void {
    storage.set(KEY, db);
  }

  /** Aprende uma amostra para um local (média acumulada = centroide). */
  function learn(name: string, vector: FingerprintVector): number {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) throw new Error('Dê um nome ao local.');

    const values = Array.from(vector);
    const current = db.locations[normalizedName] ?? {
      centroid: values.slice(),
      n: 0,
    };
    const centroid = current.centroid;
    const samples = current.n + 1;

    for (let index = 0; index < values.length; index += 1) {
      centroid[index] = (centroid[index] * current.n + values[index]) / samples;
    }
    const next: FingerprintLocation = { centroid, n: samples };
    db = {
      locations: {
        ...db.locations,
        [normalizedName]: next,
      },
    };
    persist();
    return samples;
  }

  /** Classifica um vetor → lista de locais ordenada por similaridade. */
  function classify(vector: FingerprintVector): FingerprintMatch[] {
    const values = Array.from(vector);
    const results: FingerprintMatch[] = Object.entries(db.locations).map(
      ([name, location]) => ({
        name,
        samples: location.n,
        score: cosine(values, location.centroid),
        confidence: 0,
      }),
    );
    results.sort((first, second) => second.score - first.score);
    const sum = results.reduce(
      (total, result) => total + Math.max(0, result.score),
      0,
    ) || 1;
    results.forEach((result) => {
      result.confidence = Math.max(0, result.score) / sum;
    });
    return results;
  }

  function locations(): FingerprintLocationSummary[] {
    return Object.entries(db.locations).map(([name, location]) => ({
      name,
      samples: location.n,
    }));
  }

  function remove(name: string): void {
    const { [name]: _removed, ...remaining } = db.locations;
    void _removed;
    db = { locations: remaining };
    persist();
  }

  function clear(): void {
    db = { locations: {} };
    persist();
  }

  return { learn, classify, locations, remove, clear };
}
