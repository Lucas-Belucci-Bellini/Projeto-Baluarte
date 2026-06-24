/**
 * Segundo Cérebro na nuvem por usuário — espelha as notas do Segundo Cérebro
 * (`src/core/knowledge.js`) na tabela `knowledge_notes` do Supabase, POR USUÁRIO
 * (RLS dono-só). Sem login / sem Supabase → no-op (devolve null), e as notas
 * seguem locais (localStorage), sem regressão. Omega Prism, Fatia 1.
 *
 * Mesmo padrão do `memory-cloud.js` (sem SDK, só `fetch` via `supabase.js`).
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

/** Lista as notas do usuário logado (mais recentes primeiro) ou null. */
export async function cloudListNotes() {
  const c = await ctx();
  if (!c) return null;
  try {
    const rows = await dbFetch(
      `knowledge_notes?select=id,title,body,tags,links,created_at,updated_at&user_id=eq.${encodeURIComponent(c.user.id)}&order=updated_at.desc&limit=2000`,
      { token: c.token }
    );
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

/** Insere uma nota na conta. Devolve a linha (id/created_at/…) ou null. */
export async function cloudInsertNote({ title, body = '', tags = [], links = [] }) {
  const c = await ctx();
  if (!c) return null;
  try {
    const rows = await dbFetch('knowledge_notes', {
      method: 'POST',
      body: { user_id: c.user.id, title, body, tags: tags || [], links: links || [] },
      token: c.token,
      prefer: 'return=representation'
    });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

/** Apaga uma nota da conta pelo id (uuid). Best-effort. */
export async function cloudDeleteNote(id) {
  const c = await ctx();
  if (!c || !id) return;
  try {
    await dbFetch(
      `knowledge_notes?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(c.user.id)}`,
      { method: 'DELETE', token: c.token }
    );
  } catch {
    /* best-effort */
  }
}
