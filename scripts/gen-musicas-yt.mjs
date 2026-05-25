/* Extrai id+título dos vídeos das playlists de música e gera
 * src/data/musicas-yt.js. Uso: node scripts/gen-musicas-yt.mjs */
import { writeFileSync } from 'fs';

const PLAYLISTS = ['PLb-ZStpDcG_v1pylb4a2Go-DMQ8mhD8j9', 'PLb-ZStpDcG_vOKD7tJAoGOBqmLdgcRCJV'];

function extractInitialData(html) {
  const m = 'ytInitialData = ';
  let i = html.indexOf(m);
  if (i < 0) return null;
  i += m.length;
  while (i < html.length && html[i] !== '{') i++;
  let depth = 0, start = i, inStr = false, esc = false;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; }
    else if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') { if (--depth === 0) return html.slice(start, i + 1); }
  }
  return null;
}
function collect(o, out) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach((x) => collect(x, out));
  if (o.playlistVideoRenderer) {
    const r = o.playlistVideoRenderer;
    if (r.videoId) out.push({ id: r.videoId, title: (r.title?.runs?.[0]?.text || r.title?.simpleText || 'Faixa').trim() });
  }
  for (const k in o) collect(o[k], out);
}

const seen = new Set();
const vids = [];
for (const pl of PLAYLISTS) {
  const html = await (await fetch('https://www.youtube.com/playlist?list=' + pl, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'pt-BR,pt;q=0.9' }
  })).text();
  const data = extractInitialData(html);
  if (!data) { console.error('sem ytInitialData em', pl); continue; }
  const out = [];
  collect(JSON.parse(data), out);
  for (const v of out) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    vids.push({ id: 'myt-' + (vids.length + 1), title: v.title.slice(0, 90), source: 'youtube', ytId: v.id, tags: ['música'] });
  }
}
writeFileSync('src/data/musicas-yt.js',
  '/* GERADO por scripts/gen-musicas-yt.mjs a partir das playlists de música. Não editar à mão. */\n\n' +
  'export const MUSICAS_YT = ' + JSON.stringify(vids) + ';\n');
console.log('vídeos extraídos:', vids.length);
console.log(vids.slice(0, 4).map((v) => v.ytId + ' · ' + v.title).join('\n'));
