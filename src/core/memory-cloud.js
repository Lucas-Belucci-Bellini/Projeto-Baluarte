/**
 * Memória na nuvem por usuário — espelha a Memória do JARVIS (jarvis-brain) na
 * tabela `memories` do Supabase, POR USUÁRIO (RLS dono-só). Sem login / sem
 * Supabase → no-op (devolve null), e a Memória segue local (localStorage), sem
 * regressão. Omega Prism, Fatia 1.
 */

import { supabaseConfigured, dbFetch } from './supabase.js';
import { getAccessToken, currentUser } from './supabase-auth.js';

/** Contexto autenticado (token + usuário) ou null. */
async function ctx() {
  if (!supabaseConfigured()) return null;
  const token = await getAccessToken();
  const user = currentUser();
  return token && user ? { token, user } : null;
}

/** Lista as memórias do usuário logado (mais recentes primeiro) ou null. */
export async function cloudListMemories() {
  const c = await ctx();
  if (!c) return null;
  try {
    const rows = await dbFetch(
      `memories?select=id,text,source,tags,created_at&user_id=eq.${encodeURIComponent(c.user.id)}&order=created_at.desc&limit=2000`,
      { token: c.token }
    );
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

/** Insere uma memória na conta. Devolve a linha (id/created_at) ou null. */
export async function cloudInsertMemory({ text, source = 'jarvis', tags = [] }) {
  const c = await ctx();
  if (!c) return null;
  try {
    const rows = await dbFetch('memories', {
      method: 'POST',
      body: { user_id: c.user.id, text, source, tags: tags || [] },
      token: c.token,
      prefer: 'return=representation'
    });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

/** Apaga uma memória da conta pelo id (uuid). Best-effort. */
export async function cloudDeleteMemory(id) {
  const c = await ctx();
  if (!c || !id) return;
  try {
    await dbFetch(
      `memories?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(c.user.id)}`,
      { method: 'DELETE', token: c.token }
    );
  } catch {
    /* best-effort */
  }
}

/** Apaga TODAS as memórias da conta (usado pelo "apagar tudo"). Best-effort. */
export async function cloudClearMemories() {
  const c = await ctx();
  if (!c) return;
  try {
    await dbFetch(`memories?user_id=eq.${encodeURIComponent(c.user.id)}`, { method: 'DELETE', token: c.token });
  } catch {
    /* best-effort */
  }
}
