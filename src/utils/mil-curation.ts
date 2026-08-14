/**
 * Curadoria do Centro Militar — dado NOSSO que sobrepõe a Wikipédia (#246).
 *
 * Lê a tabela `mil_curation` do Supabase (leitura pública via RLS; escrita só
 * por service_role/dashboard) e devolve um mapa por id de tópico com a nota do
 * operador, o destaque e a ordem. Best-effort: sem Supabase / offline → {} (o
 * hub funciona igual, só sem a camada de curadoria). Web leve: 1 GET pequeno.
 */

import { dbSelect, supabaseConfigured } from '../core/supabase.js';

export interface MilCurationEntry {
  readonly id: string;
  readonly note: string | null;
  readonly featured: boolean;
  readonly sort: number;
}

export type MilCurationMap = Record<string, MilCurationEntry>;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseEntry(value: unknown): MilCurationEntry | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
    return null;
  }

  return {
    id: value.id,
    note: typeof value.note === 'string' ? value.note : null,
    featured: value.featured === true,
    sort: typeof value.sort === 'number' && Number.isFinite(value.sort)
      ? value.sort
      : 0,
  };
}

export async function fetchMilCuration(): Promise<MilCurationMap> {
  if (!supabaseConfigured()) return {};

  try {
    const rows: unknown = await dbSelect(
      'mil_curation',
      'select=id,note,featured,sort&order=sort',
    );
    if (!Array.isArray(rows)) return {};

    const map: MilCurationMap = {};
    for (const row of rows) {
      const entry = parseEntry(row);
      if (entry) map[entry.id] = entry;
    }
    return map;
  } catch {
    return {}; // indisponível: ignora de propósito
  }
}
