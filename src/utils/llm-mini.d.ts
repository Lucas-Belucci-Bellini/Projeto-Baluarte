export interface CharVocabulary {
  readonly chars: readonly string[];
  readonly stoi: ReadonlyMap<string, number>;
  readonly itos: readonly string[];
  readonly size: number;
}

export function buildVocab(text: string): CharVocabulary;

export class NeuralBigram {
  constructor(vocab: CharVocabulary);
  prepare(text: string): number;
  trainStep(learningRate?: number): number;
  generate(maxLength?: number, temperature?: number): string;
}
