/**
 * Views por página — métricas reais gravadas no banco oficial (Supabase),
 * reaproveitando a tabela `site_stats` (chaves `view:/rota`).
 *
 * - `countPageView(rota)` conta 1 view por rota POR SESSÃO (guard em
 *   sessionStorage), chamando `bump_view(rota)` (escrita anônima segura via RPC).
 * - `readPageViews()` lê as rotas mais vistas + o total.
 * - Zero regressão: sem Supabase configurado / função não aplicada / offline /
 *   rota inválida → silencioso (não conta, devolve null). Mesmo espírito do
 *   visit-counter.js (web leve, #238).
 */

import { supabaseConfigured, dbRpc, dbSelect } from '../core/supabase.js';

const SEEN_PREFIX = 'baluarte:viewed:';
/* Mesma validação do banco: só rota simples (/a-z0-9/_-). Evita contar lixo e
 * bate com o CHECK da função bump_view — rota fora disso nem chama o RPC. */
const ROUTE_RE = /^\/[a-z0-9/_-]{0,63}$/;

/** Conta 1 view da rota (1x/rota/sessão). Silencioso; não retorna nada útil. */
export async function countPageView(route) {
  if (!supabaseConfigured()) return;
  if (!route || route === '/' || !ROUTE_RE.test(route)) return;

  const flag = SEEN_PREFIX + route;
  try {
    let seen = false;
    try { seen = sessionStorage.getItem(flag) === '1'; } catch { /* sem storage */ }
    if (seen) return;

    await dbRpc('bump_view', { p_route: route });
    try { sessionStorage.setItem(flag, '1'); } catch { /* sem storage */ }
  } catch { /* indisponível: ignora de propósito */ }
}

/**
 * Lê as rotas mais vistas + o total. Devolve `{ top: [{route, count}], total }`
 * ou `null` se indisponível. `limit` = quantas rotas no `top`.
 */
export async function readPageViews(limit = 5) {
  if (!supabaseConfigured()) return null;
  try {
    const rows = await dbSelect('site_stats', 'select=key,count&key=like.view:*&order=count.desc');
    if (!Array.isArray(rows) || !rows.length) return null;
    const all = rows.map((r) => ({ route: String(r.key).replace(/^view:/, ''), count: Number(r.count) || 0 }));
    const total = all.reduce((s, r) => s + r.count, 0);
    return { top: all.slice(0, limit), total };
  } catch {
    return null;
  }
}
