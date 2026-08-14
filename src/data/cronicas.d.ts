export interface CronicaBlock {
  readonly t?: string;
  readonly v?: string;
}

export interface CronicaChapter {
  readonly id: string;
  readonly title: string;
  readonly content?: string;
  readonly blocks?: readonly CronicaBlock[];
}

export interface CronicaArc {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly universe: string;
  readonly tags: readonly string[];
  readonly cover: string;
  readonly equipe: string;
  readonly synopsis: string;
  readonly canonical?: boolean;
  readonly chapters: readonly CronicaChapter[];
}

export interface SagaLoadResult {
  readonly arcos: readonly CronicaArc[];
}

export const ARCS: readonly CronicaArc[];
export const ARCS_TOTAL: number;
export const CHAPTERS_TOTAL: number;
export const UNIVERSES: readonly string[];
export const ALL_TAGS: readonly string[];
export function loadSaga(): Promise<SagaLoadResult>;
export function findArc(id: string): CronicaArc | null;
export function findChapter(arcId: string, chapterId: string): CronicaChapter | null;
