export interface PageViewTop {
  route: string;
  count: number;
}

export interface PageViewsResult {
  top: readonly PageViewTop[];
  total: number;
}

export function readPageViews(limit?: number): Promise<PageViewsResult | null>;
export function countPageView(route: string): Promise<boolean>;
