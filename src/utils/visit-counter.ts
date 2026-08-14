/**
 * Contador de acessos do Baluarte — gravado no banco oficial (Supabase).
 *
 * - Conta o acesso UMA vez por sessão do navegador (guard em sessionStorage),
 *   chamando a função `bump_visits()` (escrita anônima segura via RPC).
 * - Nas visitas seguintes da mesma sessão, só LÊ o total (sem inflar).
 * - Zero regressão: se o Supabase não estiver configurado, a tabela/função ainda
 *   não tiver sido aplicada, ou der qualquer erro (offline etc.), devolve `null`
 *   e o chamador simplesmente não exibe nada.
 */

import { dbRpc, dbSelect, supabaseConfigured } from '../core/supabase.js';

const SESSION_FLAG = 'baluarte:visit-counted';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function readTotal(): Promise<number | null> {
  const rows: unknown = await dbSelect(
    'site_stats',
    'select=count&key=eq.visits',
  );
  if (!Array.isArray(rows) || !isRecord(rows[0])) return null;
  return finiteNumber(rows[0].count);
}

/** Conta (1x/sessão) e devolve o total de visitas, ou `null` se indisponível. */
export async function countVisit(): Promise<number | null> {
  if (!supabaseConfigured()) return null;

  try {
    let already = false;
    try {
      already = sessionStorage.getItem(SESSION_FLAG) === '1';
    } catch {
      /* sem storage */
    }

    if (already) return await readTotal();

    const total: unknown = await dbRpc('bump_visits');
    try {
      sessionStorage.setItem(SESSION_FLAG, '1');
    } catch {
      /* sem storage */
    }
    return finiteNumber(total) ?? await readTotal();
  } catch {
    return null; // tabela/função ainda não aplicada, offline, RLS, etc.
  }
}
