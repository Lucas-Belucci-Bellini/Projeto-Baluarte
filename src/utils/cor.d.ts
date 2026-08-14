export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface HslColor {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export interface OklchColor {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export function clamp(value: number, lower: number, upper: number): number;
export function hexToRgb(hex: string): RgbColor | null;
export function rgbToHex(color: RgbColor): string;
export function rgbToHsl(color: RgbColor): HslColor;
export function hslToRgb(color: HslColor): RgbColor;
export function srgbToLinear(value: number): number;
export function rgbToOklch(color: RgbColor): OklchColor;
export function relLuminance(color: RgbColor): number;
export function contrastRatio(first: RgbColor, second: RgbColor): number;
