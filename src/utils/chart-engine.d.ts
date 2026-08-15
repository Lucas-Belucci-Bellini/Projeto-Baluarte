export interface ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}

export interface ChartData {
  readonly labels?: readonly string[];
  readonly values?: readonly number[];
  readonly points?: readonly ChartPoint[];
  readonly matrix?: readonly (readonly number[])[];
}

export interface ChartOptions {
  readonly title?: string;
  readonly palette?: string;
  readonly showGrid?: boolean;
  readonly showLabels?: boolean;
  readonly showValues?: boolean;
  readonly padding?: Readonly<Record<string, number>>;
  readonly [key: string]: unknown;
}

export interface ChartTypeDefinition {
  readonly label: string;
  readonly icon: string;
  readonly needs: string;
}

export const CHART_TYPES: Readonly<Record<string, ChartTypeDefinition>>;
export const PALETTES: Readonly<Record<string, readonly string[]>>;

export function drawChart(
  canvas: HTMLCanvasElement,
  type: string,
  data: ChartData,
  options?: ChartOptions,
): void;

export function exportPNG(canvas: HTMLCanvasElement, filename?: string): void;
