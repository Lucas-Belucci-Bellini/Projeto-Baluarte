export type AngleMode = 'deg' | 'rad';

export interface EvaluateOptions {
  mode?: AngleMode;
  scope?: Record<string, number>;
}

export interface EvaluateResult {
  value: number;
  error?: string;
}

export function evaluate(expression: string, options?: EvaluateOptions): EvaluateResult;
export function formatResult(value: number): string;

export interface BitOperations {
  and(a: number, b: number): number;
  or(a: number, b: number): number;
  xor(a: number, b: number): number;
  not(a: number, bits?: number): number;
  nand(a: number, b: number, bits?: number): number;
  nor(a: number, b: number, bits?: number): number;
  xnor(a: number, b: number, bits?: number): number;
  shl(a: number, amount: number): number;
  shr(a: number, amount: number): number;
  sar(a: number, amount: number): number;
}

export const bitOps: BitOperations;
export function toBase(value: number, base: number, bits?: number): string;
export function fromBase(value: string, base: number): number;

export type Ieee754Precision = 'single' | 'double';

export interface Ieee754Result {
  sign: string;
  exponent: string;
  mantissa: string;
  bits: string;
  hex: string;
}

export function ieee754(value: number, precision?: Ieee754Precision): Ieee754Result;
