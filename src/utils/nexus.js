/**
 * Nexus Central — cliente de ingestão multi-site (migration 0010).
 *
 * Fala com as RPCs `ingest_event` / `ingest_stat` / `ingest_memory` do
 * Supabase (SECURITY DEFINER): o site NÃO tem INSERT direto nas tabelas —
 * grava só pelo portão da `ingest_key` do tenant, validada dentro da função.
 * Sem SDK (regra web=leve #238): `dbFetch` do core.
 *
 * A chave de ingestão é pública POR DESIGN (anti-abuso, não segredo — qualquer
 * visitante do site a veria no bundle de qualquer forma). Override sem deploy:
 * `localStorage` `baluarte:nexus:key` (rotação: SQL comentado na 0010).
 *
 * Telemetria automática (initNexusTelemetry, chamada pós-boot no main.js):
 *   - page_view por troca de rota (stat diária por página)
 *   - tempo de tela por sessão (flush no pagehide, fetch keepalive)
 * Tudo best-effort e silencioso: telemetria NUNCA quebra nem atrasa o site.
 */

import { dbFetch, supabaseConfigured, supabaseUrl, supabaseAnonKey } from '../core/supabase.js';
import { storage } from '../core/storage.js';
import { bus } from '../core/events.js';

const SLUG = 'baluarte';
/* chave de teste semeada na 0010 — troque no banco (rotação) + aqui ou via storage */
const KEY_PADRAO = 'chave_baluarte_123';

function ingestKey() { return storage.get('nexus:key', '') || KEY_PADRAO; }
function ativo() { return supabaseConfigured() && !!ingestKey(); }

/** POST numa RPC do PostgREST — best-effort, nunca lança. */
async function rpc(nome, args) {
  if (!ativo()) return null;
  try {
    return await dbFetch(`rpc/${nome}`, { method: 'POST', body: args });
  } catch (e) {
    console.warn(`[nexus] ${nome} falhou (seguindo em silêncio):`, e.message);
    return null;
  }
}

/** Evento de telemetria (nucleo_events). Tipos aceitos pelo check da 0010:
 * page_view, click, interaction, session, voice, error, learning, custom
 * (+ os 5 originais do /api/nucleo). @returns Promise<uuid|null> */
export function nexusEvent(tipo, payload = {}) {
  return rpc('ingest_event', {
    p_slug: SLUG, p_key: ingestKey(),
    p_event_type: tipo, p_payload: payload, p_source: 'site-baluarte'
  });
}

/** Estatística agregada (site_stats — soma no upsert por tenant+dia+métrica+dims). */
export function nexusStat(metrica, valor, dimensoes = {}) {
  return rpc('ingest_stat', {
    p_slug: SLUG, p_key: ingestKey(),
    p_metrica: metrica, p_valor: valor, p_dimensoes: dimensoes
  });
}

/** Fato durável aprendido (memories). */
export function nexusMemory(texto, tags = []) {
  return rpc('ingest_memory', {
    p_slug: SLUG, p_key: ingestKey(),
    p_text: texto, p_tags: tags, p_source: 'site-baluarte'
  });
}

/* ===== Telemetria automática ===== */

let ligada = false;

export function initNexusTelemetry() {
  if (ligada || !ativo() || typeof window === 'undefined') return;
  ligada = true;

  /* page_view por rota (a primeira e cada troca) */
  let rotaAtual = location.hash.replace(/^#/, '') || '/';
  nexusStat('page_views', 1, { pagina: rotaAtual });
  bus.on('route:change', (m) => {
    const rota = (m && m.path) || location.hash.replace(/^#/, '') || '/';
    if (rota === rotaAtual) return;
    rotaAtual = rota;
    nexusStat('page_views', 1, { pagina: rota });
  });

  /* tempo de tela: acumula só o tempo VISÍVEL; flush ao esconder/fechar a aba.
   * fetch keepalive direto (dbFetch não expõe keepalive; sendBeacon não manda
   * os headers que o PostgREST exige). */
  let inicioVisivel = document.visibilityState === 'visible' ? Date.now() : 0;
  let acumuladoSeg = 0;
  const flush = () => {
    if (inicioVisivel) { acumuladoSeg += (Date.now() - inicioVisivel) / 1000; inicioVisivel = 0; }
    const seg = Math.round(acumuladoSeg);
    if (seg < 3) return;              // ruído (aba aberta e fechada na hora)
    acumuladoSeg = 0;
    try {
      fetch(`${supabaseUrl()}/rest/v1/rpc/ingest_stat`, {
        method: 'POST', keepalive: true,
        headers: {
          apikey: supabaseAnonKey(),
          authorization: `Bearer ${supabaseAnonKey()}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          p_slug: SLUG, p_key: ingestKey(),
          p_metrica: 'tempo_tela_seg', p_valor: seg, p_dimensoes: {}
        })
      });
    } catch { /* silencioso */ }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    else if (!inicioVisivel) inicioVisivel = Date.now();
  });
  window.addEventListener('pagehide', flush);
}
