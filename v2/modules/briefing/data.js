/**
 * Data Layer mínimo do módulo de Briefing.
 * Mantém a entrada externa como candidato até possuir fonte e URL válidas.
 */

/** @typedef {'candidate'|'reviewed'|'published'} BriefingStatus */
/** @typedef {{id:string, source:string, url:string, title:string, publishedAt:string|null, capturedAt:string, language:string, topics:string[], summary:string|null, confidence:number, status:BriefingStatus}} BriefingItem */

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {unknown} value @param {number} [max] @returns {string} */
function text(value, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** @param {unknown} value @returns {string|null} */
function url(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** @param {unknown} value @returns {string|null} */
function date(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

/** @param {unknown} value @returns {string[]} */
function topics(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim().toLowerCase()).filter(Boolean).slice(0, 12)
    : [];
}

/** @param {unknown} value @returns {number} */
function confidence(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.5;
}

/** @param {unknown} value @returns {BriefingStatus} */
function status(value) {
  return value === 'reviewed' || value === 'published' ? value : 'candidate';
}

/** @param {string} source @param {string} link @param {string} title @returns {string} */
function stableId(source, link, title) {
  const raw = `${source}|${link}|${title}`.toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `briefing-${(hash >>> 0).toString(16)}`;
}

/** @param {unknown} value @param {string} [capturedAt] @returns {BriefingItem|null} */
export function normalizeItem(value, capturedAt = new Date().toISOString()) {
  if (!isRecord(value)) return null;
  const source = text(value.source, 120);
  const link = url(value.url);
  const title = text(value.title, 300);
  if (!source || !link || !title) return null;
  return {
    id: text(value.id, 100) || stableId(source, link, title),
    source,
    url: link,
    title,
    publishedAt: date(value.publishedAt),
    capturedAt: date(value.capturedAt) || capturedAt,
    language: text(value.language, 16) || 'und',
    topics: topics(value.topics),
    summary: text(value.summary, 800) || null,
    confidence: confidence(value.confidence),
    status: status(value.status),
  };
}

/** @param {readonly BriefingItem[]} items @returns {BriefingItem[]} */
export function deduplicate(items) {
  const seen = new Set();
  return [...items]
    .sort((left, right) => Date.parse(right.publishedAt || '') - Date.parse(left.publishedAt || ''))
    .filter((item) => {
      const key = `${item.url}|${item.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** @param {string} topic @param {number} [limit] @returns {string} */
export function buildPrompt(topic = 'as principais notícias relevantes ao operador', limit = 6) {
  const bounded = Math.min(12, Math.max(1, Math.trunc(limit)));
  return [
    'Você é o módulo de Briefing de Notícias do Projeto Baluarte.',
    `Pesquise ${topic.trim() || 'as principais notícias relevantes ao operador'} e selecione no máximo ${bounded} itens recentes.`,
    'Informe título, fonte, data quando disponível, resumo factual curto e URL original.',
    'Separe fato de análise, marque lacunas e não invente links.',
    'Produza apenas um rascunho de leitura; não envie mensagens, publique ou execute ações externas.',
  ].join('\n');
}
