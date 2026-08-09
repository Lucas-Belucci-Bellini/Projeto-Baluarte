/**
 * Wikipedia — fonte de dados viva pro Centro Militar (#246/consolidação militar).
 *
 * Busca o RESUMO de um artigo pela REST API da Wikimedia (CORS liberado, sem
 * proxy/Cloudflare) e cacheia em memória + localStorage (TTL). Web leve: 1
 * request pequeno por tópico, sob demanda. Conteúdo é CC BY-SA 4.0 — a UI
 * SEMPRE credita a Wikipédia e linka o artigo.
 */

import { storage } from '../core/storage.js';

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

  /* Pelo wrapper — e isso CONSERTA um vazamento de dado: a chave era gravada
   * crua (`wiki:sum:pt:Título`), sem o `baluarte:`. Como o botão "Limpar todos
   * os dados locais" do /perfil filtra por esse prefixo, ele nunca apagava o
   * cache da Wikipédia: o operador pedia para apagar tudo, recebia a mensagem
   * de que tudo foi apagado, e o histórico do que ele consultou ficava. O
   * relatório de storage da /shadow também não os contava. */
  const doDisco = storage.get(key, null);
  if (doDisco && Date.now() - doDisco.ts < TTL) {
    mem.set(key, doDisco.data);
    return doDisco.data;
  }

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
  storage.set(key, { ts: Date.now(), data });
  return data;
}

/** URL canônica do artigo (pra fallback de link quando o fetch falha). */
export function wikiArticleUrl(title, lang = 'pt') {
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}
