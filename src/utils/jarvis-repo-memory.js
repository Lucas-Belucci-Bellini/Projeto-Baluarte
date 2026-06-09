/**
 * Memória versionada no repositório — cliente da função /api/memory.
 *
 * Cada memória nova é COMMITADA no repo (branch jarvis-memory) e a lista pode
 * ser lida de volta para a IA buscar nela. Saves são SERIALIZADOS (um de cada
 * vez) para nunca conflitar no mesmo arquivo, e gateados: se o servidor não
 * tiver GITHUB_TOKEN, paramos de tentar para não martelar o endpoint.
 */

const API = '/api/memory';

let repoState = null;   // null = desconhecido, true = ativo, false = sem token
let queue = Promise.resolve();

/** Estado do repo: true (ativo) · false (sem token) · null (ainda não sabido). */
export function repoEnabled() { return repoState; }

async function post(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function noToken(d) {
  return d && d.ok === false && typeof d.error === 'string' && /GITHUB_TOKEN/i.test(d.error);
}

/** Commita uma memória no repo (serializado, best-effort). */
export function saveEntry(entry) {
  if (repoState === false) return Promise.resolve({ ok: false, skip: true });
  queue = queue.then(async () => {
    if (repoState === false) return { ok: false, skip: true };
    try {
      const d = await post({ action: 'save', entry });
      if (d.ok) repoState = true;
      else if (noToken(d)) repoState = false;
      return d;
    } catch { return { ok: false }; }
  });
  return queue;
}

/** Lê todas as memórias do repo. */
export async function listEntries() {
  try {
    const d = await post({ action: 'list' });
    if (d.ok) { repoState = true; return Array.isArray(d.entries) ? d.entries : []; }
    if (noToken(d)) repoState = false;
    return [];
  } catch { return []; }
}
