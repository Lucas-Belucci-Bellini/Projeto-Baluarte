export type MorseSegmentKind = 'word-gap' | 'dah' | 'dit' | 'sym-gap' | 'char-gap';

export interface MorseSegment {
  readonly on: boolean;
  readonly ms: number;
  readonly kind: MorseSegmentKind;
}

export const MORSE_TABLE: Readonly<Record<string, string>>;
export const MORSE_REVERSE: Readonly<Record<string, string>>;
export function wpmToDitMs(wpm: number): number;
export function textToMorse(text: string): string;
export function morseToText(morse: string): string;
export function morseToSegments(morse: string, wpm: number): readonly MorseSegment[];
