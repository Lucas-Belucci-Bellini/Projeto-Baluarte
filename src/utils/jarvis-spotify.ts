import { observeJarvisSpotifyApiPlayback } from './jarvis-music-presence';

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const PLAYBACK_ENDPOINT = 'https://api.spotify.com/v1/me/player';
const DEFAULT_SCOPE = 'user-read-playback-state';
const MIN_POLL_MS = 15_000;
const MAX_RETRY_MS = 120_000;

export interface SpotifyPkceConfig {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope?: string;
}

export interface SpotifyPkceChallenge {
  readonly state: string;
  readonly codeVerifier: string;
  readonly codeChallenge: string;
  readonly authorizationUrl: string;
}

export interface SpotifyTokens {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: number;
}

export interface SpotifyTrackMetadata {
  readonly title: string | null;
  readonly artist: string | null;
  readonly positionMs: number | null;
  readonly durationMs: number | null;
}

export type SpotifyPlaybackPollResult =
  | { readonly kind: 'playing' | 'paused' | 'unknown'; readonly metadata: SpotifyTrackMetadata }
  | { readonly kind: 'unauthorized' | 'rate-limited' | 'error'; readonly retryAfterMs?: number };

export interface SpotifyPlaybackMonitorOptions {
  readonly accessToken?: string;
  readonly getAccessToken?: () => Promise<string | null> | string | null;
  readonly refreshAccessToken?: () => Promise<string | null>;
  readonly fetchFn?: typeof fetch;
  readonly onResult?: (result: SpotifyPlaybackPollResult) => void;
  readonly intervalMs?: number;
  readonly documentLike?: Pick<Document, 'visibilityState'>;
}

export interface SpotifyPlaybackMonitor {
  start(): void;
  stop(): void;
  poll(): Promise<SpotifyPlaybackPollResult>;
}

function assertConfig(config: SpotifyPkceConfig): void {
  if (!/^[A-Za-z0-9]{20,}$/.test(config.clientId)) throw new Error('SPOTIFY_CLIENT_ID_INVALID');
  let redirect: URL;
  try { redirect = new URL(config.redirectUri); } catch { throw new Error('SPOTIFY_REDIRECT_URI_INVALID'); }
  const local = redirect.hostname === 'localhost' || redirect.hostname === '127.0.0.1' || redirect.hostname === '[::1]';
  if (redirect.protocol !== 'https:' && !(local && redirect.protocol === 'http:')) throw new Error('SPOTIFY_REDIRECT_URI_INVALID');
  if (redirect.username || redirect.password || redirect.hash) throw new Error('SPOTIFY_REDIRECT_URI_INVALID');
}

function randomString(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function base64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
}

export async function createSpotifyPkceChallenge(config: SpotifyPkceConfig): Promise<SpotifyPkceChallenge> {
  assertConfig(config);
  const state = randomString(32);
  const codeVerifier = randomString(64);
  const codeChallenge = base64Url(await sha256(codeVerifier));
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    scope: config.scope?.trim() || DEFAULT_SCOPE,
    redirect_uri: config.redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return { state, codeVerifier, codeChallenge, authorizationUrl: `${AUTH_ENDPOINT}?${params.toString()}` };
}

function tokenFromPayload(value: unknown): SpotifyTokens {
  if (value === null || typeof value !== 'object') throw new Error('SPOTIFY_TOKEN_RESPONSE_INVALID');
  const record = value as Record<string, unknown>;
  if (typeof record.access_token !== 'string' || typeof record.expires_in !== 'number') throw new Error('SPOTIFY_TOKEN_RESPONSE_INVALID');
  return {
    accessToken: record.access_token,
    refreshToken: typeof record.refresh_token === 'string' ? record.refresh_token : null,
    expiresAt: Date.now() + Math.max(0, record.expires_in - 30) * 1000,
  };
}

export async function exchangeSpotifyAuthorizationCode(
  config: SpotifyPkceConfig,
  code: string,
  codeVerifier: string,
  fetchFn: typeof fetch = fetch,
): Promise<SpotifyTokens> {
  assertConfig(config);
  if (!code.trim() || !codeVerifier.trim()) throw new Error('SPOTIFY_CODE_INPUT_INVALID');
  const response = await fetchFn(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      code_verifier: codeVerifier,
    }).toString(),
  });
  if (!response.ok) throw new Error(response.status === 400 ? 'SPOTIFY_AUTHORIZATION_REJECTED' : 'SPOTIFY_TOKEN_EXCHANGE_FAILED');
  return tokenFromPayload(await response.json());
}

export async function refreshSpotifyAccessToken(
  config: SpotifyPkceConfig,
  refreshToken: string,
  fetchFn: typeof fetch = fetch,
): Promise<SpotifyTokens> {
  assertConfig(config);
  if (!refreshToken.trim()) throw new Error('SPOTIFY_REFRESH_TOKEN_INVALID');
  const response = await fetchFn(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: config.clientId }).toString(),
  });
  if (!response.ok) throw new Error('SPOTIFY_TOKEN_REFRESH_FAILED');
  const tokens = tokenFromPayload(await response.json());
  return { ...tokens, refreshToken: tokens.refreshToken ?? refreshToken };
}

function recordOf(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function finite(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value) : null; }
function trackMetadata(payload: Record<string, unknown>): SpotifyTrackMetadata {
  const item = recordOf(payload.item);
  const artists = item && Array.isArray(item.artists) ? item.artists : [];
  const artist = artists.map((entry) => recordOf(entry)?.name).find((name): name is string => typeof name === 'string' && Boolean(name.trim())) ?? null;
  return {
    title: typeof item?.name === 'string' ? item.name : null,
    artist,
    positionMs: finite(payload.progress_ms),
    durationMs: finite(item?.duration_ms),
  };
}

function retryAfterMs(response: Response): number {
  const seconds = Number(response.headers.get('Retry-After'));
  return Number.isFinite(seconds) && seconds >= 0 ? Math.min(MAX_RETRY_MS, Math.round(seconds * 1000)) : MIN_POLL_MS;
}

export function createSpotifyPlaybackMonitor(options: SpotifyPlaybackMonitorOptions): SpotifyPlaybackMonitor {
  const fetchFn = options.fetchFn ?? fetch;
  const documentLike = options.documentLike ?? (typeof document === 'undefined' ? undefined : document);
  const token = async (): Promise<string | null> => options.getAccessToken ? await options.getAccessToken() : options.accessToken ?? null;
  const intervalMs = Math.max(MIN_POLL_MS, options.intervalMs ?? MIN_POLL_MS);
  let timer: number | null = null;
  let stopped = true;
  let nextDelay = intervalMs;

  const schedule = (delay: number): void => {
    if (stopped || typeof window === 'undefined') return;
    timer = window.setTimeout(() => { timer = null; void pollAndSchedule(); }, delay);
  };
  const fetchPlayback = async (accessToken: string): Promise<Response> => fetchFn(PLAYBACK_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
  const poll = async (): Promise<SpotifyPlaybackPollResult> => {
    const accessToken = await token();
    if (!accessToken) return { kind: 'unauthorized' };
    let response = await fetchPlayback(accessToken);
    if (response.status === 401 && options.refreshAccessToken) {
      const refreshed = await options.refreshAccessToken();
      if (refreshed) response = await fetchPlayback(refreshed);
    }
    if (response.status === 401) return { kind: 'unauthorized' };
    if (response.status === 429) return { kind: 'rate-limited', retryAfterMs: retryAfterMs(response) };
    if (response.status === 204) return { kind: 'unknown', metadata: { title: null, artist: null, positionMs: null, durationMs: null } };
    if (!response.ok) return { kind: 'error' };
    const payload = recordOf(await response.json());
    if (!payload) return { kind: 'error' };
    return { kind: payload.is_playing === true ? 'playing' : 'paused', metadata: trackMetadata(payload) };
  };
  const publish = (result: SpotifyPlaybackPollResult): void => {
    if (result.kind === 'playing' || result.kind === 'paused') {
      observeJarvisSpotifyApiPlayback(result.kind, result.metadata.title, result.metadata.artist, result.metadata.positionMs ?? undefined, result.metadata.durationMs ?? undefined);
    } else if (result.kind === 'unknown') {
      observeJarvisSpotifyApiPlayback('unknown', null, null, undefined, undefined);
    }
    options.onResult?.(result);
  };
  const pollAndSchedule = async (): Promise<void> => {
    if (stopped) return;
    if (documentLike?.visibilityState === 'hidden') { schedule(intervalMs); return; }
    try {
      const result = await publicPoll();
      nextDelay = result.kind === 'rate-limited' ? (result.retryAfterMs ?? intervalMs) : intervalMs;
      if (result.kind === 'unauthorized') stopped = true;
    } catch {
      const result: SpotifyPlaybackPollResult = { kind: 'error' };
      publish(result); nextDelay = Math.min(MAX_RETRY_MS, nextDelay * 2);
    }
    schedule(nextDelay);
  };
  const publicPoll = async (): Promise<SpotifyPlaybackPollResult> => {
    const result = await poll();
    publish(result);
    return result;
  };
  return {
    start(): void { if (!stopped) return; stopped = false; nextDelay = intervalMs; void pollAndSchedule(); },
    stop(): void { stopped = true; if (timer !== null && typeof window !== 'undefined') window.clearTimeout(timer); timer = null; },
    poll: publicPoll,
  };
}

export const spotifyPlaybackEndpoint = PLAYBACK_ENDPOINT;
export const spotifyDefaultScope = DEFAULT_SCOPE;
