import {
  createSpotifyPkceChallenge,
  exchangeSpotifyAuthorizationCode,
  refreshSpotifyAccessToken,
  createSpotifyPlaybackMonitor,
} from './jarvis-spotify.js';
import type { SpotifyPkceConfig, SpotifyPlaybackMonitor, SpotifyTokens } from './jarvis-spotify.ts';

const SESSION_KEY = 'baluarte:spotify:pkce';
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
}

function storage(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}
function readPending(): PendingAuthorization | null {
  const raw = storage()?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (value === null || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    if (typeof record.state !== 'string' || typeof record.codeVerifier !== 'string' || typeof record.clientId !== 'string' || typeof record.redirectUri !== 'string') return null;
    return { state: record.state, codeVerifier: record.codeVerifier, clientId: record.clientId, redirectUri: record.redirectUri, scope: typeof record.scope === 'string' ? record.scope : DEFAULT_SCOPE };
  } catch { return null; }
}
function clearPending(): void { storage()?.removeItem(SESSION_KEY); }

export async function beginSpotifyAuthorization(config: SpotifyPkceConfig): Promise<string> {
  const challenge = await createSpotifyPkceChallenge({ ...config, scope: config.scope?.trim() || DEFAULT_SCOPE });
  storage()?.setItem(SESSION_KEY, JSON.stringify({ state: challenge.state, codeVerifier: challenge.codeVerifier, clientId: config.clientId, redirectUri: config.redirectUri, scope: config.scope?.trim() || DEFAULT_SCOPE } satisfies PendingAuthorization));
  return challenge.authorizationUrl;
}

export async function resumeSpotifyAuthorization(search = typeof location === 'undefined' ? '' : location.search): Promise<'idle' | 'connected' | 'rejected'> {
  const query = new URLSearchParams(search);
  const code = query.get('code');
  const returnedState = query.get('state');
  if (!code && !query.get('error')) return connected ? 'connected' : 'idle';
  const pending = readPending();
  clearPending();
  if (query.get('error') || !pending || !returnedState || returnedState !== pending.state || !code) return 'rejected';
  tokens = await exchangeSpotifyAuthorizationCode(pending, code, pending.codeVerifier);
  monitor?.stop();
  monitor = createSpotifyPlaybackMonitor({
    getAccessToken: () => tokens?.accessToken ?? null,
    refreshAccessToken: async () => {
      if (!tokens?.refreshToken) return null;
      try { tokens = await refreshSpotifyAccessToken(pending, tokens.refreshToken); return tokens.accessToken; } catch { tokens = null; return null; }
    },
  });
  monitor.start();
  connected = true;
  return 'connected';
}

export function disconnectSpotify(): void {
  monitor?.stop(); monitor = null; tokens = null; connected = false; clearPending();
}

export function isSpotifyConnected(): boolean { return connected; }
export const spotifyDefaultScope = DEFAULT_SCOPE;
