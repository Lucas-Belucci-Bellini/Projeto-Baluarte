export interface CharVocabulary {
  readonly chars: readonly string[];
  readonly stoi: ReadonlyMap<string, number>;
  readonly itos: readonly string[];
  readonly size: number;
}

export function buildVocab(text: string): CharVocabulary;

export interface NgramTrainInfo {
  readonly contexts: number;
}

export class NgramModel {
  constructor(order?: number);
  train(text: string): NgramTrainInfo;
  generate(maxLength?: number, temperature?: number): string;
}

export const SAMPLE_CORPORA: Readonly<Record<string, string>>;

export class NeuralBigram {
  constructor(vocab: CharVocabulary);
  prepare(text: string): number;
  trainStep(learningRate?: number): number;
  generate(maxLength?: number, temperature?: number): string;
}
