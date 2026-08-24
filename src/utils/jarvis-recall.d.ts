/**
 * Jarvis Recall — memória entre conversas.
 *
 * `summarizeSession()` resume uma conversa em uma linha; `recall()` acha os
 * resumos mais relevantes para a pergunta atual (TF-IDF + cosseno). Tudo
 * determinístico, JS puro, sem modelo nem dependências.
 *
 * "Disclosure progressivo": injeta resumos curtos em vez do histórico inteiro,
 * o que gasta menos tokens — é o motivo de o módulo existir.
 *
 * ── O que o tipo preserva ───────────────────────────────────────────────────
 * `recall()` filtra por `score > 0.04` antes de cortar em `k`, então devolver
 * **menos** que `k` — inclusive zero — é o caso normal, não falha. E o cache de
 * memória é estado de módulo, preenchido pela página do JARVIS: `getMemoryCache`
 * devolve `[]` até alguém chamar `setMemoryCache`.
 */

/** Um candidato do corpus: o resumo de uma sessão anterior. */
export interface RecallDoc {
  readonly text: string;
  readonly sessionId?: string;
}

/** Um resultado de recall, com a relevância que o classificou. */
export interface RecallHit {
  readonly text: string;
  readonly sessionId: string | undefined;
  readonly score: number;
}

/** Índice derivado local; não contém query nem resultado de modelo. */
export interface RecallIndex {
  readonly docs: readonly RecallDoc[];
  readonly positions: ReadonlyMap<RecallDoc, number>;
  readonly tokensByDoc: readonly (readonly string[])[];
  readonly idfByToken: ReadonlyMap<string, number>;
  readonly vectors: readonly ReadonlyMap<string, number>[];
}

/** Uma mensagem de conversa, como `jarvis-memory` a guarda. */
export interface RecallMensagem {
  readonly role: string;
  readonly text?: string;
  readonly ts?: number;
}

/** Tokeniza: minúsculas, sem acento/pontuação, sem stopwords, >2 letras. */
export function tokenize(s: string | null | undefined): string[];

/**
 * Recall por relevância, ordenado do mais relevante para o menos.
 *
 * Corta em `score > 0.04` e depois em `k`, então pode devolver menos que `k`
 * (ou nada) — é resposta, não falha.
 */
export function recall(
  query: string,
  docs: readonly RecallDoc[] | null | undefined,
  k?: number,
  index?: RecallIndex | null,
): RecallHit[];

/** Preenche o cache do corpus usado pela ferramenta síncrona (cópia bounded). */
export function setMemoryCache(docs: readonly RecallDoc[] | null | undefined): void;

/** O corpus em cache. `[]` até alguém chamar `setMemoryCache`. */
export function getMemoryCache(): RecallDoc[];

/** Constrói um índice derivado bounded para o corpus fornecido. */
export function buildRecallIndex(docs: readonly RecallDoc[] | null | undefined): RecallIndex | null;

/** Guarda o corpus completo resumido sob uma revisão local. */
export function setMemoryCorpusCache(revision: number, docs: readonly RecallDoc[] | null | undefined): RecallDoc[];

/** Retorna uma cópia do corpus somente quando a revisão coincide; senão `null`. */
export function getMemoryCorpusCache(revision: number): RecallDoc[] | null;

/** Retorna o índice somente quando a revisão do corpus coincide; senão `null`. */
export function getMemoryCorpusIndex(revision: number): RecallIndex | null;

/** Invalida o corpus cacheado sem tocar na persistência. */
export function clearMemoryCorpusCache(): void;

export interface MemoryCorpusObservation {
  readonly revision: number;
  readonly documents: number;
  readonly cacheHit: boolean;
  readonly buildMs: number;
}

/** Registra somente métricas bounded, sem conteúdo de conversa ou identificadores. */
export function recordMemoryCorpusObservation(observation: Partial<MemoryCorpusObservation>): void;

/** Retorna uma cópia da última observação bounded, ou `null`. */
export function getLastMemoryCorpusObservation(): MemoryCorpusObservation | null;

/** Resume uma sessão em uma linha. `''` quando não há o que resumir. */
export function summarizeSession(
  messages: readonly RecallMensagem[] | null | undefined,
): string;
