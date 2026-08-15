export interface CfarOptions { readonly guard?: number; readonly ref?: number; readonly k?: number }
export interface RadarDetection { readonly r: number; readonly c: number; readonly snr: number }
export interface CfarResult { readonly mask: Uint8Array; readonly detections: RadarDetection[] }
export interface RangeOptions { readonly bandwidth?: number; readonly sampleRate?: number; readonly chirpDuration?: number; readonly fftN?: number }
export interface VelocityOptions { readonly carrier?: number; readonly PRF?: number; readonly dopplerN?: number }
export interface CrossAmbiguityOptions { readonly rangeBins?: number; readonly dopplerBins?: number; readonly refIm?: Float32Array; readonly survIm?: Float32Array }
export function fft(re: Float32Array, im: Float32Array): void;
export function hann(size: number): Float32Array;
export function magnitude(re: Float32Array, im: Float32Array): Float32Array;
export function magnitudeDb(re: Float32Array, im: Float32Array, floor?: number): Float32Array;
export function dcNotch(frame: Float32Array, rows: number, cols: number): void;
export function mti(current: Float32Array, previous: Float32Array): void;
export function cfar2d(magnitude: Float32Array, rows: number, cols: number, options?: CfarOptions): CfarResult;
export function rangeMeters(bin: number, options?: RangeOptions): number;
export function velocityMs(bin: number, options?: VelocityOptions): number;
export function crossAmbiguity(reference: Float32Array, surveillance: Float32Array, options?: CrossAmbiguityOptions): { readonly mag: Float32Array; readonly rows: number; readonly cols: number };
