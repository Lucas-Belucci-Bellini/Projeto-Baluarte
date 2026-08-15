import type { JarvisMemory } from './jarvis-brain.js';

export interface MemoryCorpusDocument {
  readonly text: string;
  readonly source: string;
  readonly ts: number;
  readonly tokens: readonly string[];
  readonly conceptIds: readonly string[];
  readonly codeIds: readonly string[];
}

export interface VocabularyGrowth {
  readonly x: readonly number[];
  readonly y: readonly number[];
  readonly vocab: number;
}

export interface TermScore {
  readonly term: string;
  readonly score: number;
  readonly df: number;
  readonly tf: number;
}

export interface MemoryCluster {
  readonly terms: readonly string[];
  readonly size: number;
  readonly members: readonly number[];
  readonly share: number;
}

export interface KmeansResult {
  readonly clusters: readonly MemoryCluster[];
  readonly vocabSize: number;
  readonly iterations: number;
  readonly used: boolean;
}

export interface KmeansOptions {
  readonly iters?: number;
  readonly vocabCap?: number;
  readonly seed?: number;
}

export function buildCorpus(memories: readonly JarvisMemory[]): readonly MemoryCorpusDocument[];
export function vocabGrowth(corpus: readonly MemoryCorpusDocument[]): VocabularyGrowth;
export function topTerms(corpus: readonly MemoryCorpusDocument[], limit?: number): readonly TermScore[];
export function sourceCounts(corpus: readonly MemoryCorpusDocument[]): Readonly<Record<string, number>>;
export function timelineByDay(corpus: readonly MemoryCorpusDocument[]): readonly { day: string; count: number; acc: number }[];
export function kmeans(corpus: readonly MemoryCorpusDocument[], k?: number, options?: KmeansOptions): KmeansResult;
export function demoCorpus(): readonly MemoryCorpusDocument[];
