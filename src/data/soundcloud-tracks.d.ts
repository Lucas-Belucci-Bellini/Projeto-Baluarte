export interface SoundCloudTrack {
  artist: string;
  title: string;
  url: string;
  cover?: string;
}

export declare const SOUNDCLOUD_TRACKS: readonly SoundCloudTrack[];
