export interface PageViewTop {
  readonly route: string;
  readonly count: number;
}

export interface PageViewsResult {
  readonly top: readonly PageViewTop[];
  readonly total: number;
}

export function readPageViews(limit?: number): Promise<PageViewsResult | null>;
export function countPageView(route: string): Promise<void>;
