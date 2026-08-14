export interface SplineOptions {
  onReady?: () => void;
  onFail?: () => void;
}

export interface SplineMount {
  destroy(): void;
}

export function mountSpline(
  container: HTMLElement,
  url: string,
  options?: SplineOptions,
): SplineMount;
