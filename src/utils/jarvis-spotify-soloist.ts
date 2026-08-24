import { observeJarvisSpotifySoloistPlayback } from './jarvis-music-presence';

const DEFAULT_BRIDGE_ENDPOINT = 'http://127.0.0.1:18791/v1/spotify/playback';
const MIN_POLL_MS = 10_000;
const MAX_RETRY_MS = 120_000;
const MAX_TEXT_LENGTH = 160;
const MAX_TIME_MS = 24 * 60 * 60 * 1000;
const MAX_RESPONSE_BYTES = 64 * 1024;

export type SpotifySoloistPlayback = 'playing' | 'paused' | 'unknown';

export interface SpotifySoloistPlaybackSnapshot {
  readonly playback: SpotifySoloistPlayback;
  readonly title: string | null;
  readonly artist: string | null;
  readonly positionMs: number | null;
  readonly durationMs: number | null;
}

export type SpotifySoloistPollResult =
  | { readonly kind: 'playing' | 'paused' | 'unknown'; readonly snapshot: SpotifySoloistPlaybackSnapshot }
  | { readonly kind: 'error'; readonly code: 'unavailable' | 'invalid-response' | 'not-authorized' };

export interface SpotifySoloistMonitorOptions {
  readonly endpoint?: string;
  readonly bridgeToken?: string;
  readonly fetchFn?: typeof fetch;
  readonly onResult?: (result: SpotifySoloistPollResult) => void;
  readonly intervalMs?: number;
  readonly documentLike?: Pick<Document, 'visibilityState'>;
}

export interface SpotifySoloistMonitor {
  start(): void;
  stop(): void;
  poll(): Promise<SpotifySoloistPollResult>;
}

const EMPTY_SNAPSHOT: SpotifySoloistPlaybackSnapshot = Object.freeze({
  playback: 'unknown',
  title: null,
  artist: null,
  positionMs: null,
  durationMs: null,
});

function recordOf(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, MAX_TEXT_LENGTH) : null;
}

function finiteTime(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return Math.min(MAX_TIME_MS, Math.round(value));
}

function identityName(value: unknown): string | null {
  const record = recordOf(value);
  const decorations = recordOf(record?.decorations);
  const identity = recordOf(decorations?.identity);
  return text(identity?.name) ?? text(record?.name);
}

function itemArtist(item: Record<string, unknown>): string | null {
  const creators = Array.isArray(item.creators) ? item.creators : [];
  for (const creator of creators) {
    const creatorRecord = recordOf(creator);
    const name = identityName(creatorRecord?.entity);
    if (name) return name;
  }
  const artists = Array.isArray(item.artists) ? item.artists : [];
  for (const artist of artists) {
    const name = identityName(artist);
    if (name) return name;
  }
  return null;
}

function itemDuration(item: Record<string, unknown>): number | null {
  const decorations = recordOf(item.decorations);
  const playback = recordOf(decorations?.playback) ?? recordOf(item.playback);
  return finiteTime(playback?.duration_ms) ?? finiteTime(item.duration_ms);
}

function playbackKind(value: unknown): SpotifySoloistPlayback {
  return value === 'playing' ? 'playing' : value === 'paused' ? 'paused' : 'unknown';
}

/**
 * Normaliza tanto a resposta sanitizada da ponte quanto o playback_state oficial
 * do Soloist. Nunca retorna URI, capa, volume, fila, ações ou qualquer comando.
 */
export function parseSpotifySoloistPlayback(value: unknown): SpotifySoloistPlaybackSnapshot {
  const payload = recordOf(value);
  if (!payload) return EMPTY_SNAPSHOT;

  const directPlayback = payload.playback;
  if (directPlayback === 'playing' || directPlayback === 'paused' || directPlayback === 'unknown') {
    return Object.freeze({
      playback: directPlayback,
      title: text(payload.title),
      artist: text(payload.artist),
      positionMs: finiteTime(payload.positionMs),
      durationMs: finiteTime(payload.durationMs),
    });
  }

  const item = recordOf(payload.item);
  const status = payload.status;
  const playback = playbackKind(status);
  if (!item || (status !== 'playing' && status !== 'paused')) {
    return EMPTY_SNAPSHOT;
  }

  const position = recordOf(payload.position);
  return Object.freeze({
    playback,
    title: identityName(item),
    artist: itemArtist(item),
    positionMs: finiteTime(position?.position_ms),
    durationMs: itemDuration(item),
  });
}

function normalizedHostname(value: string): string {
  return value.toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
}

function assertLoopbackEndpoint(rawEndpoint: string): string {
  let endpoint: URL;
  try {
    endpoint = new URL(rawEndpoint);
  } catch {
    throw new Error('SPOTIFY_SOLOIST_ENDPOINT_INVALID');
  }
  const hostname = normalizedHostname(endpoint.hostname);
  const loopback = hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
  if (!loopback || !['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.hash) {
    throw new Error('SPOTIFY_SOLOIST_ENDPOINT_LOOPBACK_REQUIRED');
  }
  return endpoint.toString();
}

function retryDelay(response: Response): number {
  const value = Number(response.headers.get('Retry-After'));
  return Number.isFinite(value) && value >= 0 ? Math.min(MAX_RETRY_MS, Math.round(value * 1000)) : MIN_POLL_MS;
}

async function responseJson(response: Response): Promise<unknown | null> {
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > MAX_RESPONSE_BYTES) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

export function createSpotifySoloistMonitor(options: SpotifySoloistMonitorOptions = {}): SpotifySoloistMonitor {
  const endpoint = assertLoopbackEndpoint(options.endpoint ?? DEFAULT_BRIDGE_ENDPOINT);
  const fetchFn = options.fetchFn ?? fetch;
  const documentLike = options.documentLike ?? (typeof document === 'undefined' ? undefined : document);
  const intervalMs = Math.max(MIN_POLL_MS, options.intervalMs ?? MIN_POLL_MS);
  let timer: number | null = null;
  let stopped = true;
  let nextDelay = intervalMs;

  const schedule = (delay: number): void => {
    if (stopped || typeof window === 'undefined') return;
    timer = window.setTimeout(() => {
      timer = null;
      void pollAndSchedule();
    }, delay);
  };

  const publish = (result: SpotifySoloistPollResult): void => {
    if (result.kind === 'playing' || result.kind === 'paused' || result.kind === 'unknown') {
      observeJarvisSpotifySoloistPlayback(
        result.kind,
        result.snapshot.title,
        result.snapshot.artist,
        result.snapshot.positionMs ?? undefined,
        result.snapshot.durationMs ?? undefined,
      );
    } else {
      observeJarvisSpotifySoloistPlayback('unknown', null, null, undefined, undefined);
    }
    options.onResult?.(result);
  };

  const poll = async (): Promise<SpotifySoloistPollResult> => {
    let response: Response;
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.bridgeToken?.trim()) headers['x-baluarte-bridge-token'] = options.bridgeToken.trim();
      response = await fetchFn(endpoint, { method: 'GET', headers });
    } catch {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'unavailable' };
      publish(result);
      return result;
    }

    if (response.status === 401 || response.status === 403) {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'not-authorized' };
      publish(result);
      return result;
    }
    if (response.status === 429) {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'unavailable' };
      publish(result);
      nextDelay = retryDelay(response);
      return result;
    }
    if (response.status === 204) {
      const result: SpotifySoloistPollResult = { kind: 'unknown', snapshot: EMPTY_SNAPSHOT };
      publish(result);
      return result;
    }
    if (!response.ok) {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'unavailable' };
      publish(result);
      return result;
    }

    const payload = await responseJson(response);
    if (payload === null) {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'invalid-response' };
      publish(result);
      return result;
    }
    const snapshot = parseSpotifySoloistPlayback(payload);
    const result: SpotifySoloistPollResult = { kind: snapshot.playback, snapshot };
    publish(result);
    return result;
  };

  const pollAndSchedule = async (): Promise<void> => {
    if (stopped) return;
    if (documentLike?.visibilityState === 'hidden') {
      schedule(intervalMs);
      return;
    }
    try {
      const result = await poll();
      if (result.kind !== 'error') nextDelay = intervalMs;
    } catch {
      const result: SpotifySoloistPollResult = { kind: 'error', code: 'unavailable' };
      publish(result);
      nextDelay = Math.min(MAX_RETRY_MS, nextDelay * 2);
    }
    schedule(nextDelay);
  };

  return {
    start(): void {
      if (!stopped) return;
      stopped = false;
      nextDelay = intervalMs;
      void pollAndSchedule();
    },
    stop(): void {
      stopped = true;
      if (timer !== null && typeof window !== 'undefined') window.clearTimeout(timer);
      timer = null;
    },
    poll,
  };
}

export const spotifySoloistDefaultBridgeEndpoint = DEFAULT_BRIDGE_ENDPOINT;
