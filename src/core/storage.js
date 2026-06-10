/**
 * Wrapper para localStorage com fallback in-memory.
 * Serializa JSON automaticamente. Namespace 'baluarte:' para evitar conflitos.
 */

const NAMESPACE = 'baluarte:';
const memory = new Map();

function isStorageAvailable() {
  try {
    const testKey = '__baluarte_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/* Em modo privado / cookies bloqueados, o localStorage lança ao escrever — aí
 * caímos num Map em memória, então o app nunca quebra (mas não persiste entre
 * sessões). `storage.hasLocalStorage` diz qual está em uso. */
const HAS_LS = typeof window !== 'undefined' && isStorageAvailable();

function key(k) {
  return `${NAMESPACE}${k}`;
}

export function get(k, fallback = null) {
  const fullKey = key(k);
  try {
    const raw = HAS_LS ? localStorage.getItem(fullKey) : memory.get(fullKey);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Falha ao ler "${k}":`, err);
    return fallback;
  }
}

export function set(k, value) {
  const fullKey = key(k);
  try {
    const raw = JSON.stringify(value);
    if (HAS_LS) {
      localStorage.setItem(fullKey, raw);
    } else {
      memory.set(fullKey, raw);
    }
    return true;
  } catch (err) {
    console.warn(`[storage] Falha ao gravar "${k}":`, err);
    return false;
  }
}

export function remove(k) {
  const fullKey = key(k);
  if (HAS_LS) {
    localStorage.removeItem(fullKey);
  } else {
    memory.delete(fullKey);
  }
}

export function clearAll() {
  if (HAS_LS) {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(NAMESPACE)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } else {
    memory.clear();
  }
}

export const storage = { get, set, remove, clearAll, hasLocalStorage: HAS_LS };
