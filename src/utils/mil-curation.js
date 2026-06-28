/**
 * Curadoria do Centro Militar — dado NOSSO que sobrepõe a Wikipédia (#246).
 *
 * Lê a tabela `mil_curation` do Supabase (leitura pública via RLS; escrita só
 * por service_role/dashboard) e devolve um mapa por id de tópico com a nota do
 * operador, o destaque e a ordem. Best-effort: sem Supabase / offline → {} (o
 * hub funciona igual, só sem a camada de curadoria). Web leve: 1 GET pequeno.
 */

import { supabaseConfigured, dbSelect } from '../core/supabase.js';

/** @returns {Promise<Record<string,{id:string,note:string|null,featured:boolean,sort:number}>>} */
export async function fetchMilCuration() {
  if (!supabaseConfigured()) return {};
  try {
    const rows = await dbSelect('mil_curation', 'select=id,note,featured,sort&order=sort');
    if (!Array.isArray(rows)) return {};
    const map = {};
    for (const r of rows) if (r && r.id) map[r.id] = r;
    return map;
  } catch {
    return {};   // indisponível: ignora de propósito
  }
}
