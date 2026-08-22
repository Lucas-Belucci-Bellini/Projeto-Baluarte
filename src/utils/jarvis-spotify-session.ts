import {
  createSpotifyPkceChallenge,
  exchangeSpotifyAuthorizationCode,
  refreshSpotifyAccessToken,
  createSpotifyPlaybackMonitor,
  isSpotifyClientId,
} from './jarvis-spotify';
import type { SpotifyPkceConfig, SpotifyPlaybackMonitor, SpotifyPlaybackPollResult, SpotifyTokens } from './jarvis-spotify';

const SESSION_KEY = 'baluarte:spotify:pkce';
const CLIENT_ID_KEY = 'baluarte:spotify:client-id';
const DEFAULT_SCOPE = 'user-read-playback-state';
let monitor: SpotifyPlaybackMonitor | null = null;
let tokens: SpotifyTokens | null = null;
let connected = false;

interface PendingAuthorization {
  readonly state: string;
  readonly codeVerifier: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope: string;
  readonly returnTo: string | null;
}

export interface SpotifySessionEventDetail {
  readonly connected: boolean;
  readonly playback?: SpotifyPlaybackPollResult['kind'];
  readonly title?: string | null;
  readonly artist?: string | null;
  readonly returnTo?: string | null;
}

function storage(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}

function persistentStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}

function readPending(): PendingAuthorization | null {
  const raw = storage()?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (value === null || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    if (typeof record.state !== 'string' || typeof record.codeVerifier !== 'string' || typeof record.clientId !== 'string' || typeof record.redirectUri !== 'string') return null;
    return {
      state: record.state,
      codeVerifier: record.codeVerifier,
      clientId: record.clientId,
      redirectUri: record.redirectUri,
      scope: typeof record.scope === 'string' ? record.scope : DEFAULT_SCOPE,
      returnTo: typeof record.returnTo === 'string' && /^\/[A-Za-z0-9_./?=#&-]{0,240}$/.test(record.returnTo) ? record.returnTo : null,
    };
  } catch { return null; }
}

function clearPending(): void { storage()?.removeItem(SESSION_KEY); }

function safeReturnTo(value: string | undefined): string | null {
  if (!value || !/^\/[A-Za-z0-9_./?=#&-]{0,240}$/.test(value) || value.startsWith('//')) return null;
  return value;
}

function emitSessionEvent(detail: SpotifySessionEventDetail): void {
  if (typeof globalThis.dispatchEvent !== 'function' || typeof CustomEvent === 'undefined') return;
  globalThis.dispatchEvent(new CustomEvent<SpotifySessionEventDetail>('baluarte:spotify-session', { detail }));
}

export function getSpotifyClientId(): string {
  const value = persistentStorage()?.getItem(CLIENT_ID_KEY)?.trim() ?? '';
  return isSpotifyClientId(value) ? value : '';
}

export function rememberSpotifyClientId(clientId: string): void {
  const value = clientId.trim();
  const target = persistentStorage();
  if (!target) return;
  if (!value) { target.removeItem(CLIENT_ID_KEY); return; }
  if (isSpotifyClientId(value)) target.setItem(CLIENT_ID_KEY, value);
  else target.removeItem(CLIENT_ID_KEY);
}

export async function beginSpotifyAuthorization(config: SpotifyPkceConfig): Promise<string> {
  rememberSpotifyClientId(config.clientId);
  const challenge = await createSpotifyPkceChallenge({ ...config, scope: config.scope?.trim() || DEFAULT_SCOPE });
  storage()?.setItem(SESSION_KEY, JSON.stringify({
    state: challenge.state,
    codeVerifier: challenge.codeVerifier,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: config.scope?.trim() || DEFAULT_SCOPE,
    returnTo: safeReturnTo(config.returnTo),
  } satisfies PendingAuthorization));
  return challenge.authorizationUrl;
}

export async function resumeSpotifyAuthorization(search = typeof location === 'undefined' ? '' : location.search): Promise<'idle' | 'connected' | 'rejected'> {
  const query = new URLSearchParams(search);
  const code = query.get('code');
  const returnedState = query.get('state');
  if (!code && !query.get('error')) return connected ? 'connected' : 'idle';
  const pending = readPending();
  clearPending();
  if (query.get('error') || !pending || !returnedState || returnedState !== pending.state || !code) {
    emitSessionEvent({ connected: false });
    return 'rejected';
  }
  rememberSpotifyClientId(pending.clientId);
  const spotifyConfig: SpotifyPkceConfig = {
    clientId: pending.clientId,
    redirectUri: pending.redirectUri,
    scope: pending.scope,
  };
  tokens = await exchangeSpotifyAuthorizationCode(spotifyConfig, code, pending.codeVerifier);
  monitor?.stop();
  monitor = createSpotifyPlaybackMonitor({
    getAccessToken: () => tokens?.accessToken ?? null,
    refreshAccessToken: async () => {
      if (!tokens?.refreshToken) return null;
      try { tokens = await refreshSpotifyAccessToken(spotifyConfig, tokens.refreshToken); return tokens.accessToken; } catch { tokens = null; return null; }
    },
    onResult: (result) => {
      if (result.kind === 'unauthorized') connected = false;
      const detail: SpotifySessionEventDetail = result.kind === 'playing' || result.kind === 'paused'
        ? { connected, playback: result.kind, title: result.metadata.title, artist: result.metadata.artist }
        : { connected, playback: result.kind };
      emitSessionEvent(detail);
    },
  });
  monitor.start();
  connected = true;
  emitSessionEvent({ connected: true, playback: 'unknown', returnTo: pending.returnTo });
  return 'connected';
}

export function disconnectSpotify(): void {
  monitor?.stop(); monitor = null; tokens = null; connected = false; clearPending();
  emitSessionEvent({ connected: false, playback: 'unknown' });
}

export function isSpotifyConnected(): boolean { return connected; }
export const spotifyDefaultScope = DEFAULT_SCOPE;
