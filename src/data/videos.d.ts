export type VideoSource = 'youtube' | 'youtube-playlist' | 'local';

export interface VideoItem {
  readonly id: string;
  readonly title: string;
  readonly duration: string;
  readonly source: VideoSource;
  readonly ytId?: string;
  readonly playlistId?: string;
  readonly playlistTitle?: string;
  readonly tags?: readonly string[];
}

export interface VideoPlaylist {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
  readonly videos: readonly VideoItem[];
}

export interface LocatedVideo extends VideoItem {
  readonly playlistId: string;
  readonly playlistTitle: string;
}

export const PLAYLISTS: readonly VideoPlaylist[];
export const TOTAL_VIDEOS: number;
export const TOTAL_PLAYLISTS: number;
export function findPlaylist(id: string): VideoPlaylist | null;
export function findVideo(videoId: string | undefined): LocatedVideo | null;
