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

/* Lê do Vite (`import.meta.env`) quando empacotado, do ambiente quando rodando
 * em Node — teste, Web Worker ou host serverless. `import.meta.env` só existe
 * sob o Vite; ler direto derruba o módulo no import fora dele. Mesma correção
 * aplicada no baluarte-core, pra as duas cópias não divergirem durante a
 * migração (#406). No navegador o comportamento é idêntico ao de antes. */
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  || globalThis.process?.env
  || {};

const URL = (env.VITE_SUPABASE_URL || 'https://hcwzsxdcvmswebunznak.supabase.co').replace(/\/+$/, '');
const ANON = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm';

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

/**
 * RPC — chama uma função do banco (PostgREST `/rpc/<fn>`). Devolve o retorno da
 * função. Útil pra escrita anônima SEGURA: a função roda como `SECURITY DEFINER`
 * (ignora o RLS), então o anon executa sem ter permissão de escrever na tabela.
 */
export const dbRpc = (fn, args, token) =>
  dbFetch(`rpc/${fn}`, { method: 'POST', body: args || {}, token });
