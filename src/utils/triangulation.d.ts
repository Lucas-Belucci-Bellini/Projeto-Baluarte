export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface BearingStation extends Point2D {
  readonly bearing: number;
}

export interface TriangulationResult {
  readonly ok: boolean;
  readonly x: number;
  readonly y: number;
  readonly residual: number;
}

export function bearingTo(from: Point2D, to: Point2D): number;
export function triangulate(stations: readonly BearingStation[]): TriangulationResult;
export function gaussianNoise(sigma: number): number;
export function dist(a: Point2D, b: Point2D): number;
