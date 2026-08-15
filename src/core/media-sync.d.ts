export interface MediaBookmarkInput {
  kind?: string;
  position: number;
  duration?: number;
  meta?: Record<string, unknown>;
}

export interface MediaBookmark {
  media_key: string;
  kind: string;
  position_secs: number;
  duration_secs: number | null;
  meta: Record<string, unknown>;
  updated_at: string;
}

export declare function saveBookmark(mediaKey: string, state: MediaBookmarkInput): void;
export declare function loadBookmark(mediaKey: string): Promise<MediaBookmark | null>;
export declare function listRecentBookmarks(limit?: number): Promise<MediaBookmark[]>;
