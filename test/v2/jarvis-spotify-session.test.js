import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
globalThis.localStorage = local;
globalThis.sessionStorage = session;
const events = [];
globalThis.dispatchEvent = (event) => { events.push(event); return true; };

const spotifySession = await import('../../src/utils/jarvis-spotify-session.ts');

test('Spotify Client ID: memoriza somente valor público válido', () => {
  spotifySession.rememberSpotifyClientId('spak_MEgONNbpUahsaIa3Cp35');
  assert.equal(spotifySession.getSpotifyClientId(), 'spak_MEgONNbpUahsaIa3Cp35');
  spotifySession.rememberSpotifyClientId('short');
  assert.equal(spotifySession.getSpotifyClientId(), 'spak_MEgONNbpUahsaIa3Cp35');
  assert.doesNotMatch(JSON.stringify(local), /token|secret|password/i);
});

test('Spotify PKCE: Client ID e retorno ficam na sessão, sem Client Secret', async () => {
  const authorizationUrl = await spotifySession.beginSpotifyAuthorization({
    clientId: 'spak_MEgONNbpUahsaIa3Cp35',
    redirectUri: 'https://projeto-baluarte.vercel.app/',
    returnTo: '/#/jarvis',
    scope: spotifySession.spotifyDefaultScope,
  });
  const url = new URL(authorizationUrl);
  const raw = session.getItem('baluarte:spotify:pkce');
  assert.equal(url.origin, 'https://accounts.spotify.com');
  assert.equal(url.searchParams.get('client_id'), 'spak_MEgONNbpUahsaIa3Cp35');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'user-read-playback-state');
  assert.match(raw, /"codeVerifier":"[A-Za-z0-9._~-]{43,128}"/);
  assert.match(raw, /"returnTo":"\/#\/jarvis"/);
  assert.doesNotMatch(raw, /client_secret|access_token|refresh_token/i);
  await spotifySession.beginSpotifyAuthorization({
    clientId: 'spak_MEgONNbpUahsaIa3Cp35',
    redirectUri: 'https://projeto-baluarte.vercel.app/',
    returnTo: 'https://evil.example/#/jarvis',
  });
  assert.match(session.getItem('baluarte:spotify:pkce'), /"returnTo":null/);
});

test('Spotify callback: state divergente é rejeitado e só emite estado desconectado', async () => {
  events.length = 0;
  const result = await spotifySession.resumeSpotifyAuthorization('code=code-value&state=wrong-state');
  assert.equal(result, 'rejected');
  assert.equal(events.at(-1)?.type, 'baluarte:spotify-session');
  assert.deepEqual(events.at(-1)?.detail, { connected: false });
});

const markXiii = await import('../../src/utils/jarvis-mark-xiii.ts');

test('Mark XIII: playback cria pulsação sutil e bounded sem alterar autoridade', () => {
  assert.equal(markXiii.markXiiiPlaybackPulse('unknown', 0), 0);
  assert.equal(markXiii.markXiiiPlaybackPulse('paused', 0), 0.025);
  const peak = markXiii.markXiiiPlaybackPulse('playing', Math.PI / (2 * 0.012));
  assert.ok(peak > 0.19 && peak <= 0.2);
  assert.ok(peak < 0.21);
});
