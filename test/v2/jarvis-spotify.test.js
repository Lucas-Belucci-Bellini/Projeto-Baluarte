import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSpotifyPkceChallenge,
  exchangeSpotifyAuthorizationCode,
  createSpotifyPlaybackMonitor,
} from '../../src/utils/jarvis-spotify.ts';
import {
  getJarvisMusicSnapshot,
  observeJarvisSpotifyApiPlayback,
} from '../../src/utils/jarvis-music-presence.ts';
import { getJarvisRuntimeContext } from '../../src/utils/jarvis-context.ts';

const config = { clientId: '1234567890abcdefghijkl', redirectUri: 'https://baluarte.example/callback' };

function response(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name] ?? null },
    json: async () => body,
  };
}

test('PKCE usa S256, state e somente o escopo mínimo de playback', async () => {
  const challenge = await createSpotifyPkceChallenge(config);
  const url = new URL(challenge.authorizationUrl);
  assert.equal(url.origin, 'https://accounts.spotify.com');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'user-read-playback-state');
  assert.equal(url.searchParams.get('state'), challenge.state);
  assert.match(challenge.codeVerifier, /^[A-Za-z0-9._~-]{43,128}$/);
  assert.equal(url.searchParams.get('code_challenge'), challenge.codeChallenge);
});

test('troca o código PKCE sem client secret e mantém tokens fora do status musical', async () => {
  let request;
  const tokens = await exchangeSpotifyAuthorizationCode(config, 'code-value', 'verifier-value-'.padEnd(48, 'x'), async (url, init) => {
    request = { url, init };
    return response(200, { access_token: 'access-token', refresh_token: 'refresh-token', expires_in: 3600 });
  });
  assert.equal(tokens.accessToken, 'access-token');
  assert.equal(request.url, 'https://accounts.spotify.com/api/token');
  assert.equal(request.init.headers.Authorization, undefined);
  assert.match(request.init.body, /grant_type=authorization_code/);
  assert.doesNotMatch(JSON.stringify(getJarvisMusicSnapshot()), /access-token|refresh-token/);
});

test('monitor publica faixa playing no registro único e no contexto do JARVIS', async () => {
  const monitor = createSpotifyPlaybackMonitor({
    accessToken: 'secret-token',
    documentLike: { visibilityState: 'visible' },
    fetchFn: async (url, init) => {
      assert.equal(url, 'https://api.spotify.com/v1/me/player');
      assert.equal(init.headers.Authorization, 'Bearer secret-token');
      return response(200, { is_playing: true, progress_ms: 1234, item: { name: 'Núcleo', duration_ms: 180000, artists: [{ name: 'Baluarte' }] } });
    },
  });
  const result = await monitor.poll();
  assert.equal(result.kind, 'playing');
  const snapshot = getJarvisMusicSnapshot();
  assert.equal(snapshot.source, 'spotify-api');
  assert.equal(snapshot.playback, 'playing');
  assert.equal(snapshot.title, 'Núcleo');
  assert.match(getJarvisRuntimeContext({ compact: true }), /Núcleo/);
  assert.match(getJarvisRuntimeContext({ compact: true }), /spotify-api/);
});

test('204 vira unknown, não pausa inventada, e não deixa faixa antiga', async () => {
  const monitor = createSpotifyPlaybackMonitor({
    accessToken: 'token',
    fetchFn: async () => response(204, null),
  });
  const result = await monitor.poll();
  assert.equal(result.kind, 'unknown');
  assert.equal(getJarvisMusicSnapshot().playback, 'unknown');
  assert.equal(getJarvisMusicSnapshot().title, null);
});

test('401 encerra a sessão lógica e 429 respeita Retry-After', async () => {
  const unauthorized = createSpotifyPlaybackMonitor({ accessToken: 'token', fetchFn: async () => response(401, {}) });
  assert.equal((await unauthorized.poll()).kind, 'unauthorized');
  const limited = createSpotifyPlaybackMonitor({ accessToken: 'token', fetchFn: async () => response(429, {}, { 'Retry-After': '17' }) });
  const result = await limited.poll();
  assert.equal(result.kind, 'rate-limited');
  assert.equal(result.retryAfterMs, 17000);
});

test('estado musical manual continua compatível com o mesmo contexto', () => {
  observeJarvisSpotifyApiPlayback('paused', 'Faixa pausada', 'Artista', 300, 1000);
  assert.equal(getJarvisMusicSnapshot().playback, 'paused');
  assert.match(getJarvisRuntimeContext(), /Faixa pausada/);
});
