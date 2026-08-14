export type NewsStatus = 'candidate' | 'reviewed' | 'published';

export interface NewsItem {
  readonly id: string;
  readonly source: string;
  readonly url: string;
  readonly title: string;
  readonly publishedAt: string | null;
  readonly capturedAt: string;
  readonly language: string;
  readonly topics: readonly string[];
  readonly summary: string | null;
  readonly confidence: number;
  readonly status: NewsStatus;
}

export interface NewsInput {
  readonly id?: unknown;
  readonly source?: unknown;
  readonly url?: unknown;
  readonly title?: unknown;
  readonly publishedAt?: unknown;
  readonly capturedAt?: unknown;
  readonly language?: unknown;
  readonly topics?: unknown;
  readonly summary?: unknown;
  readonly confidence?: unknown;
  readonly status?: unknown;
}

export interface NewsBriefingOptions {
  readonly topic?: string;
  readonly limit?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asInput(value: unknown): NewsInput | null {
  return isRecord(value) ? value : null;
}

function cleanText(value: unknown, max = 240): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanTopics(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((topic): topic is string => typeof topic === 'string')
    .map((topic) => topic.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function boundedConfidence(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0.5;
}

function status(value: unknown): NewsStatus {
  return value === 'reviewed' || value === 'published' ? value : 'candidate';
}

function stableId(source: string, url: string, title: string): string {
  const raw = `${source}|${url}|${title}`.toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `news-${(hash >>> 0).toString(16)}`;
}

export function normalizeNewsItem(value: unknown, capturedAt = new Date().toISOString()): NewsItem | null {
  const input = asInput(value);
  if (!input) return null;
  const source = cleanText(input.source, 120);
  const url = safeUrl(input.url);
  const title = cleanText(input.title, 300);
  if (!source || !url || !title) return null;

  const id = cleanText(input.id, 100) || stableId(source, url, title);
  const captured = isoOrNull(input.capturedAt) ?? capturedAt;
  return {
    id,
    source,
    url,
    title,
    publishedAt: isoOrNull(input.publishedAt),
    capturedAt: captured,
    language: cleanText(input.language, 16) || 'und',
    topics: cleanTopics(input.topics),
    summary: cleanText(input.summary, 800) || null,
    confidence: boundedConfidence(input.confidence),
    status: status(input.status),
  };
}

export function deduplicateNews(items: readonly NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];
  for (const item of [...items].sort((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
    return rightTime - leftTime;
  })) {
    const key = `${item.url}|${item.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function buildNewsBriefingPrompt(options: NewsBriefingOptions = {}): string {
  const topic = options.topic?.trim() || 'as principais notícias relevantes ao operador';
  const limit = Math.min(12, Math.max(1, Math.trunc(options.limit ?? 6)));
  return [
    'Você é o módulo de Briefing de Notícias do Projeto Baluarte.',
    `Pesquise ${topic} e selecione no máximo ${limit} itens recentes.`,
    'Para cada item, informe título, fonte, data quando disponível, resumo factual curto e URL original.',
    'Separe fato de análise, declare quando a data ou a fonte não estiver disponível e não invente links.',
    'A resposta é um rascunho de leitura: não envie mensagens, não publique conteúdo e não execute ações externas.',
  ].join('\n');
}

export function renderNewsSources(items: readonly NewsItem[]): string {
  return deduplicateNews(items)
    .map((item, index) => `${index + 1}. ${item.title} — ${item.source} (${item.url})`)
    .join('\n');
}
