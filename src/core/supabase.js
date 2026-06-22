/**
 * Supabase — cliente leve do banco OFICIAL do Baluarte.
 *
 * Sem SDK: falamos direto com a REST (PostgREST) e a Auth por `fetch`, pra
 * respeitar a regra "web = leve" (#238) — zero peso de bundle. A segurança vem
 * do RLS no banco (a publishable key é pública por design; só o RLS autoriza).
 *
 * Config por env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) com fallback no
 * projeto oficial. Se nada estiver configurado, `supabaseConfigured()` é false
 * e os recursos caem no modo local (ex.: o mural volta pro localStorage).
 */

const URL = (import.meta.env.VITE_SUPABASE_URL || 'https://hcwzsxdcvmswebunznak.supabase.co').replace(/\/+$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm';

import { storage } from './storage.js';

export function supabaseConfigured() { return !!(URL && ANON); }
export function supabaseUrl() { return URL; }
export function supabaseAnonKey() { return ANON; }

/** fetch genérico na REST do PostgREST. `token` = JWT do usuário logado (senão anon). */
export async function dbFetch(path, { method = 'GET', body, token, prefer, headers = {} } = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: ANON,
      authorization: `Bearer ${token || ANON}`,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...(prefer ? { prefer } : {}),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!res.ok) {
    const err = new Error((data && data.message) || `Supabase HTTP ${res.status}`);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

/** SELECT: `query` é a querystring do PostgREST (ex.: 'select=*&order=created_at.desc'). */
export const dbSelect = (table, query = '') => dbFetch(`${table}${query ? `?${query}` : ''}`);

/** INSERT: devolve a linha criada. `token` precisa ser o JWT do dono (RLS). */
export const dbInsert = (table, row, token) =>
  dbFetch(table, { method: 'POST', body: row, token, prefer: 'return=representation' });

/* ---- Auth (login do dono por CÓDIGO OTP de 6 dígitos) ------------------ *
 * Fluxo: requestOtp(email) envia o código → verifyOtp(email, code) devolve a
 * sessão (guardada no storage). A escrita usa o access_token; o RLS no banco
 * só libera o dono (e-mail). getAccessToken() renova via refresh_token. */

const SESSION_KEY = 'sb:session';
export const OWNER_EMAIL = 'lucasbb2007@gmail.com';

async function authFetch(path, body) {
  const res = await fetch(`${URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!res.ok) {
    const msg = (data && (data.msg || data.error_description || data.message)) || `Auth HTTP ${res.status}`;
    const err = new Error(msg); err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

function saveSession(d) {
  if (!d || !d.access_token) return null;
  const sess = {
    access_token: d.access_token,
    refresh_token: d.refresh_token || null,
    expires_at: d.expires_at || (Math.floor(Date.now() / 1000) + (d.expires_in || 3600)),
    user: d.user ? { id: d.user.id, email: d.user.email } : null
  };
  storage.set(SESSION_KEY, sess);
  return sess;
}

export function getSession() { return storage.get(SESSION_KEY, null); }
export function currentUser() { const s = getSession(); return (s && s.user) || null; }
export function isOwner() {
  const u = currentUser();
  return !!(u && u.email && u.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
}
export function signOut() { storage.remove(SESSION_KEY); }

/** Envia o código OTP de 6 dígitos pro e-mail. */
export const requestOtp = (email) => authFetch('otp', { email, create_user: true });

/** Confirma o código e guarda a sessão. */
export const verifyOtp = async (email, code) =>
  saveSession(await authFetch('verify', { type: 'email', email, token: code }));

/** access_token válido (renova se estiver perto de expirar). null se deslogado. */
export async function getAccessToken() {
  const s = getSession();
  if (!s || !s.access_token) return null;
  const now = Math.floor(Date.now() / 1000);
  if (s.expires_at && s.expires_at - now < 60 && s.refresh_token) {
    try {
      const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: ANON, 'content-type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      });
      if (r.ok) { const ns = saveSession(await r.json()); return ns && ns.access_token; }
      signOut(); return null;
    } catch { return s.access_token; }
  }
  return s.access_token;
}
