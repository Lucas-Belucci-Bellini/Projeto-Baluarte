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
  spotifySession.rememberSpotifyClientId('oauth_client_id_fake_12345');
  assert.equal(spotifySession.getSpotifyClientId(), 'oauth_client_id_fake_12345');
  spotifySession.rememberSpotifyClientId('short');
  assert.equal(spotifySession.getSpotifyClientId(), '');
  assert.doesNotMatch(JSON.stringify(local), /token|secret|password/i);
});

test('Spotify PKCE: Client ID e retorno ficam na sessão, sem Client Secret', async () => {
  const authorizationUrl = await spotifySession.beginSpotifyAuthorization({
    clientId: 'oauth_client_id_fake_12345',
    redirectUri: 'https://projeto-baluarte.vercel.app/',
    returnTo: '/#/jarvis',
    scope: spotifySession.spotifyDefaultScope,
  });
  const url = new URL(authorizationUrl);
  const raw = session.getItem('baluarte:spotify:pkce');
  assert.equal(url.origin, 'https://accounts.spotify.com');
  assert.equal(url.searchParams.get('client_id'), 'oauth_client_id_fake_12345');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'user-read-playback-state');
  assert.match(raw, /"codeVerifier":"[A-Za-z0-9._~-]{43,128}"/);
  assert.match(raw, /"returnTo":"\/#\/jarvis"/);
  assert.doesNotMatch(raw, /client_secret|access_token|refresh_token/i);
  await spotifySession.beginSpotifyAuthorization({
    clientId: 'oauth_client_id_fake_12345',
    redirectUri: 'https://projeto-baluarte.vercel.app/',
    returnTo: 'https://evil.example/#/jarvis',
  });
  assert.match(session.getItem('baluarte:spotify:pkce'), /"returnTo":null/);
});

/**
 * A queixa do operador: *"por algum motivo mesmo eu sendo redirecionado eu não
 * consigo conectar ao spotify"*.
 *
 * O handshake estava certo — foi exercitado ponta a ponta em navegador. O que
 * faltava era o contrário: quando o Spotify recusa, TODOS os modos de falha
 * terminavam no mesmo silêncio. O distintivo continuava `SPOTIFY · OFF`, sem
 * nada no ecrã nem no console a dizer porquê, e não havia como distinguir
 * "cancelei" de "o Redirect URI não bate" de "a minha conta não está na lista
 * do Development mode". O que se cobra aqui é que o motivo sobreviva.
 */
test('Spotify callback: state divergente é rejeitado, e o motivo sai junto', async () => {
  events.length = 0;
  const result = await spotifySession.resumeSpotifyAuthorization('code=code-value&state=wrong-state');
  assert.equal(result, 'rejected');
  assert.equal(events.at(-1)?.type, 'baluarte:spotify-session');
  assert.deepEqual(events.at(-1)?.detail, { connected: false, reason: 'ESTADO_PERDIDO' });
});

test('Spotify callback: a recusa do Spotify chega com as palavras dele', async () => {
  events.length = 0;
  const result = await spotifySession.resumeSpotifyAuthorization(
    'error=access_denied&error_description=User+not+registered+in+the+Developer+Dashboard',
  );
  assert.equal(result, 'rejected');
  const detail = events.at(-1)?.detail;
  assert.equal(detail?.connected, false);
  assert.equal(detail?.reason, 'ACESSO_NEGADO');
  /* Sem isto, "cancelei" e "a minha conta não está na lista" são a mesma tela. */
  assert.match(detail?.reasonText, /access_denied — User not registered in the Developer Dashboard/);
});

test('Spotify: cada motivo diz o que fazer a seguir, não só que falhou', () => {
  for (const motivo of ['ACESSO_NEGADO', 'ESTADO_PERDIDO', 'CODIGO_REJEITADO', 'TROCA_FALHOU', 'RESPOSTA_INVALIDA']) {
    const frase = spotifySession.describeSpotifyFailure(motivo);
    assert.ok(frase.length > 30, `o motivo ${motivo} não explica nada`);
  }
  /* O Development mode é a causa mais comum de "autorizei e não conectou", e a
   * única que o Spotify não deixa o Baluarte detetar sozinho. */
  assert.match(spotifySession.describeSpotifyFailure('ACESSO_NEGADO'), /Development mode/);
  assert.match(spotifySession.describeSpotifyFailure('CODIGO_REJEITADO'), /Redirect URI/);
  assert.equal(spotifySession.describeSpotifyFailure(undefined), '');
});

const markXiii = await import('../../src/utils/jarvis-mark-xiii.ts');

test('Mark XIII: playback cria pulsação sutil e bounded sem alterar autoridade', () => {
  assert.equal(markXiii.markXiiiPlaybackPulse('unknown', 0), 0);
  assert.equal(markXiii.markXiiiPlaybackPulse('paused', 0), 0.025);
  const peak = markXiii.markXiiiPlaybackPulse('playing', Math.PI / (2 * 0.012));
  assert.ok(peak > 0.19 && peak <= 0.2);
  assert.ok(peak < 0.21);
});
