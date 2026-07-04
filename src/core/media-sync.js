/**
 * Sync Universal de mídia (0008 · Banco de Dados Universal) — save-states.
 *
 * Guarda o "onde parei" de qualquer mídia (vídeo/filme/música/rádio/leitura)
 * por usuário, na tabela `media_bookmarks` (RLS dono-só), e sincroniza entre
 * o app desktop (Electron) e o mobile/web (v0.4.0) — mesmo login = mesmo estado.
 *
 * LOCAL-FIRST: todo save ecoa no localStorage na hora (funciona deslogado e
 * offline); logado, sobe pro banco com debounce (não metralha a REST a cada
 * segundo de playback). Leitura: nuvem quando logado (fallback local), local
 * quando não.
 *
 * Uso típico num player:
 *   video.addEventListener('timeupdate', () =>
 *     saveBookmark('video:' + id, { kind: 'video', position: video.currentTime, duration: video.duration }));
 *   const b = await loadBookmark('video:' + id);
 *   if (b) video.currentTime = b.position_secs;
 */

import { storage } from './storage.js';
import { dbFetch } from './supabase.js';
import { getAccessToken, currentUser, isLoggedIn } from './supabase-auth.js';

const LOCAL_KEY = 'media:bookmarks';           // espelho local {mediaKey: row}
const DEBOUNCE_MS = 4000;                      // sobe pra nuvem no máx. 1x/4s por mídia

const timers = new Map();

function localAll() { return storage.get(LOCAL_KEY, {}) || {}; }
function localPut(mediaKey, row) {
  const all = localAll();
  all[mediaKey] = row;
  storage.set(LOCAL_KEY, all);
}

/**
 * Salva o save-state de uma mídia. Local na hora; nuvem com debounce (logado).
 * @param {string} mediaKey  id estável da mídia (ex.: 'video:tv/canal-x', 'musica:radio-1')
 * @param {{kind?:string, position:number, duration?:number, meta?:object}} s
 */
export function saveBookmark(mediaKey, s = {}) {
  const row = {
    media_key: mediaKey,
    kind: s.kind || 'video',
    position_secs: Math.max(0, Math.round((s.position || 0) * 10) / 10),
    duration_secs: s.duration != null ? Math.round(s.duration) : null,
    meta: s.meta || {},
    updated_at: new Date().toISOString()
  };
  localPut(mediaKey, row);
  if (!isLoggedIn()) return;

  clearTimeout(timers.get(mediaKey));
  timers.set(mediaKey, setTimeout(async () => {
    try {
      const token = await getAccessToken();
      const user = currentUser();
      if (!token || !user) return;
      /* UPSERT pelo UNIQUE (user_id, media_key) — 1 request, sem read-modify-write */
      await dbFetch('media_bookmarks?on_conflict=user_id,media_key', {
        method: 'POST',
        token,
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: { user_id: user.id, ...row, updated_at: undefined }
      });
    } catch (e) {
      console.warn('[media-sync] upsert falhou (fica no local):', e.message);
    }
  }, DEBOUNCE_MS));
}

/** Lê o save-state de uma mídia: nuvem (logado) com fallback local. */
export async function loadBookmark(mediaKey) {
  if (isLoggedIn()) {
    try {
      const token = await getAccessToken();
      const rows = await dbFetch(
        `media_bookmarks?media_key=eq.${encodeURIComponent(mediaKey)}&select=*&limit=1`,
        { token }
      );
      if (rows && rows[0]) { localPut(mediaKey, rows[0]); return rows[0]; }
    } catch { /* cai no local */ }
  }
  return localAll()[mediaKey] || null;
}

/** "Continuar de onde parou": os N save-states mais recentes do usuário. */
export async function listRecentBookmarks(limit = 12) {
  if (isLoggedIn()) {
    try {
      const token = await getAccessToken();
      return await dbFetch(
        `media_bookmarks?select=*&order=updated_at.desc&limit=${limit}`,
        { token }
      );
    } catch { /* cai no local */ }
  }
  return Object.values(localAll())
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
    .slice(0, limit);
}
