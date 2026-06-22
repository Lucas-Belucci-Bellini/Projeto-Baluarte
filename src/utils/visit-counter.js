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

import { supabaseConfigured, dbRpc, dbSelect } from '../core/supabase.js';

const SESSION_FLAG = 'baluarte:visit-counted';

async function readTotal() {
  const rows = await dbSelect('site_stats', 'select=count&key=eq.visits');
  return Array.isArray(rows) && rows[0] ? Number(rows[0].count) : null;
}

/** Conta (1x/sessão) e devolve o total de visitas, ou `null` se indisponível. */
export async function countVisit() {
  if (!supabaseConfigured()) return null;
  try {
    let already = false;
    try { already = sessionStorage.getItem(SESSION_FLAG) === '1'; } catch { /* sem storage */ }

    if (already) return await readTotal();

    const total = await dbRpc('bump_visits');
    try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch { /* sem storage */ }
    const n = Number(total);
    return Number.isFinite(n) ? n : await readTotal();
  } catch {
    return null; // tabela/função ainda não aplicada, offline, RLS, etc.
  }
}
