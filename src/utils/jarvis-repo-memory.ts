/**
 * Memória versionada no repositório — cliente da função /api/memory.
 *
 * Cada memória nova é COMMITADA no repo (branch jarvis-memory) e a lista pode
 * ser lida de volta para a IA buscar nela. Saves são SERIALIZADOS (um de cada
 * vez) para nunca conflitar no mesmo arquivo, e gateados: se o servidor não
 * tiver GITHUB_TOKEN, paramos de tentar para não martelar o endpoint.
 */

const API = '/api/memory';

type RepoAction = 'save' | 'list';

export interface RepoMemoryEntry {
  readonly text: string;
  readonly source?: string;
  readonly conceptIds?: readonly string[];
  readonly codeIds?: readonly string[];
  readonly ts?: number;
  readonly [key: string]: unknown;
}

export interface RepoSaveResult {
  readonly ok?: boolean;
  readonly skip?: boolean;
  readonly dup?: boolean;
  readonly total?: number;
  readonly error?: string;
  readonly [key: string]: unknown;
}

interface RepoResponse {
  readonly ok?: boolean;
  readonly entries?: unknown;
  readonly error?: unknown;
  readonly [key: string]: unknown;
}

interface SaveRequest {
  readonly action: 'save';
  readonly entry: RepoMemoryEntry;
}

interface ListRequest {
  readonly action: 'list';
}

let repoState: boolean | null = null;
let queue: Promise<RepoSaveResult> = Promise.resolve({ ok: true });

/** Estado do repo: true (ativo) · false (sem token) · null (ainda não sabido). */
export function repoEnabled(): boolean | null {
  return repoState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isRepoResponse(value: unknown): value is RepoResponse {
  return isRecord(value);
}

function isRepoEntry(value: unknown): value is RepoMemoryEntry {
  return isRecord(value) && typeof value.text === 'string';
}

async function post(payload: SaveRequest | ListRequest): Promise<RepoResponse> {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return isRepoResponse(data) ? data : {};
}

function noToken(data: RepoResponse): boolean {
  return data.ok === false
    && typeof data.error === 'string'
    && /GITHUB_TOKEN/i.test(data.error);
}

/** Commita uma memória no repo (serializado, best-effort). */
export function saveEntry(entry: RepoMemoryEntry): Promise<RepoSaveResult> {
  if (repoState === false) return Promise.resolve({ ok: false, skip: true });

  queue = queue.then(async (): Promise<RepoSaveResult> => {
    if (repoState === false) return { ok: false, skip: true };
    try {
      const data = await post({ action: 'save', entry });
      if (data.ok === true) repoState = true;
      else if (noToken(data)) repoState = false;
      return {
        ...data,
        error: typeof data.error === 'string' ? data.error : undefined,
      };
    } catch {
      return { ok: false };
    }
  });
  return queue;
}

/** Lê todas as memórias do repo. */
export async function listEntries(): Promise<RepoMemoryEntry[]> {
  try {
    const data = await post({ action: 'list' });
    if (data.ok === true) {
      return Array.isArray(data.entries)
        ? data.entries.filter(isRepoEntry)
        : [];
    }
    if (noToken(data)) repoState = false;
    return [];
  } catch {
    return [];
  }
}
