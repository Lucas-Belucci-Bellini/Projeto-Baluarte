export interface AcademyModule {
  readonly title: string;
  readonly code: string;
}

export interface AcademyLanguage {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly paradigm: string;
  readonly year: number;
  readonly creator: string;
  readonly summary: string;
  readonly why: string;
  readonly modules: readonly AcademyModule[];
}

export interface LearningResourceLink {
  readonly name: string;
  readonly url: string;
  readonly desc: string;
}

export interface LearningResourceCategory {
  readonly group: string;
  readonly note: string;
  readonly links: readonly LearningResourceLink[];
}

export interface CareerCard {
  readonly nome: string;
  readonly codigo: string;
  readonly desc: string;
}

export const LANGS_ACADEMY: readonly AcademyLanguage[];
export const TOTAL_LANGS: number;
export function findLang(id: string): AcademyLanguage | null;
export const LEARNING_RESOURCES: readonly LearningResourceCategory[];
export const TECH_INTRO: string;
export const TECH_CARREIRAS: readonly CareerCard[];
