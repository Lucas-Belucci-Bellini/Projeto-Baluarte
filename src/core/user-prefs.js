/**
 * Preferências do usuário na nuvem — lê/grava a linha do usuário logado na tabela
 * `profiles` (Supabase), protegida por RLS (cada um só mexe na própria). Guarda a
 * "estética" (tema + skin de universo), favoritos e nome de exibição, pra restaurar
 * em qualquer dispositivo. Sem login / sem Supabase → devolve null e o app segue no
 * modo local (localStorage), sem regressão.
 */

import { supabaseConfigured, dbFetch } from './supabase.js';
import { getAccessToken, currentUser } from './supabase-auth.js';

/** Lê o perfil do usuário logado (`{ id, display_name, theme, universe, favorites, prefs }`) ou null. */
export async function loadProfile() {
  if (!supabaseConfigured()) return null;
  const token = await getAccessToken();
  const user = currentUser();
  if (!token || !user) return null;
  try {
    const rows = await dbFetch(`profiles?select=*&id=eq.${encodeURIComponent(user.id)}`, { token });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

/** Atualiza campos do perfil do usuário logado (patch parcial). Devolve a linha ou null. */
export async function saveProfile(patch) {
  if (!supabaseConfigured() || !patch) return null;
  const token = await getAccessToken();
  const user = currentUser();
  if (!token || !user) return null;
  try {
    const rows = await dbFetch(`profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      body: { ...patch, updated_at: new Date().toISOString() },
      token,
      prefer: 'return=representation'
    });
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}
