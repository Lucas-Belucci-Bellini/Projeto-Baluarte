/**
 * Wrapper de compatibilidade para a camada de notícias.
 * A implementação canônica está em `news-briefing.ts`.
 */
export {
  normalizeNewsItem,
  deduplicateNews,
  buildNewsBriefingPrompt,
  renderNewsSources,
} from './news-briefing.ts';
