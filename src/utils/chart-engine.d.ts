export interface ChartData {
  readonly labels?: readonly string[];
  readonly values?: readonly number[];
  readonly points?: readonly Readonly<Record<string, number>>[];
  readonly matrix?: readonly (readonly number[])[];
}

export interface ChartOptions {
  readonly title?: string;
  readonly [key: string]: unknown;
}

export function drawChart(
  canvas: HTMLCanvasElement,
  type: string,
  data: ChartData,
  options?: ChartOptions,
): void;
