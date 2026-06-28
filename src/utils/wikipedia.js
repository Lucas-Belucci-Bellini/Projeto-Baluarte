/**
 * Wikipedia — fonte de dados viva pro Centro Militar (#246/consolidação militar).
 *
 * Busca o RESUMO de um artigo pela REST API da Wikimedia (CORS liberado, sem
 * proxy/Cloudflare) e cacheia em memória + localStorage (TTL). Web leve: 1
 * request pequeno por tópico, sob demanda. Conteúdo é CC BY-SA 4.0 — a UI
 * SEMPRE credita a Wikipédia e linka o artigo.
 */

const TTL = 7 * 24 * 60 * 60 * 1000;   // 7 dias
const mem = new Map();

/**
 * Resumo de um artigo da Wikipédia.
 * @param {string} title  título do artigo (ex.: 'Tecnologia militar')
 * @param {string} [lang] subdomínio de idioma (default 'pt')
 * @returns {Promise<{title:string, extract:string, url:string, thumb:string, lang:string}>}
 */
export async function fetchWikiSummary(title, lang = 'pt') {
  const key = `wiki:sum:${lang}:${title}`;
  if (mem.has(key)) return mem.get(key);

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && Date.now() - o.ts < TTL) { mem.set(key, o.data); return o.data; }
    }
  } catch {}

  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`wiki ${lang} ${res.status}`);
  const j = await res.json();

  const data = {
    title: j.title || title,
    extract: j.extract || '',
    url: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page)
      || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumb: (j.thumbnail && j.thumbnail.source) || '',
    lang
  };

  mem.set(key, data);
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
  return data;
}

/** URL canônica do artigo (pra fallback de link quando o fetch falha). */
export function wikiArticleUrl(title, lang = 'pt') {
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}
