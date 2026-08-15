export interface WikiSummary { readonly title: string; readonly extract: string; readonly url: string; readonly thumb: string; readonly lang: string; }
export function fetchWikiSummary(title: string, lang?: string): Promise<WikiSummary>;
export function wikiArticleUrl(title: string, lang?: string): string;
