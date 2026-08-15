export interface CodeQuestQuestion {
  readonly q: string;
  readonly code?: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly explain?: string;
}
export interface CodeQuestTrack {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly color: string;
  readonly questions: readonly CodeQuestQuestion[];
}
export const CODE_QUEST: readonly CodeQuestTrack[];
export const CODE_QUEST_TOTAL: number;
