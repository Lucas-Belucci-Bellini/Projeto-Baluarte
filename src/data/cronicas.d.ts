export interface CronicaChapter {
  id: string;
  title: string;
  content: string;
}

export interface CronicaArc {
  id: string;
  code: string;
  title: string;
  universe: string;
  tags: readonly string[];
  cover: string;
  equipe: string;
  synopsis: string;
  chapters: readonly CronicaChapter[];
}

export const ARCS: readonly CronicaArc[];
export const ARCS_TOTAL: number;
export const CHAPTERS_TOTAL: number;
export const UNIVERSES: readonly string[];
export const ALL_TAGS: readonly string[];
export function loadSaga(): Promise<unknown>;
export function findArc(id: string): CronicaArc | null;
export function findChapter(arcId: string, chapterId: string): CronicaChapter | null;
