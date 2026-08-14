export interface SplineScene {
  url: string;
  label?: string;
}

export const SPLINE_SCENES: Readonly<Record<string, SplineScene | string>>;
export function sceneFor(key: string, query?: Record<string, string> | null): string;
