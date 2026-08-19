export interface SpotifyPlaybackData {
  duration?: number;
  position?: number;
  isPaused?: boolean;
}

export interface SpotifyPlaybackEvent {
  data?: SpotifyPlaybackData;
}

export interface SpotifyController {
  addListener(event: 'playback_update', listener: (event: SpotifyPlaybackEvent) => void): void;
  restart?: () => void;
  seek(position: number): void;
  play(): void;
}

export interface SpotifyEmbedAPI {
  createController(
    host: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyController) => void,
  ): void;
}

export interface SoundCloudWidget {
  bind(event: string, listener: () => void): void;
  seekTo(position: number): void;
  play(): void;
  load(url: string, options: Record<string, boolean | string>): void;
}

export interface SoundCloudAPI {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: { FINISH: string };
  };
}

declare global {
  interface Window {
    __spotifyAPI?: SpotifyEmbedAPI;
    __spotifyCbs?: Array<(api: SpotifyEmbedAPI) => void>;
    __spotifyApiLoading?: boolean;
    onSpotifyIframeApiReady?: (api: SpotifyEmbedAPI) => void;
    SC?: SoundCloudAPI;
    __scCbs?: Array<() => void>;
    __scLoading?: boolean;
  }
}

export {};
