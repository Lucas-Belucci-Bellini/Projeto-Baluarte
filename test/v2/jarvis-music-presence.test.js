import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getJarvisMusicSnapshot,
  observeJarvisSpotifyPlayback,
  stopJarvisMusicPresence,
} from '../../src/utils/jarvis-music-presence.ts';
import { getStatusSnapshot } from '../../src/utils/baluarte-status.ts';

test('Spotify playback updates passive JARVIS context without a chat turn', () => {
  observeJarvisSpotifyPlayback('Faixa em destaque', 'Projeto Baluarte', 12_500, 180_000, true);
  const snapshot = getJarvisMusicSnapshot();
  assert.equal(snapshot.playback, 'playing');
  assert.equal(snapshot.source, 'spotify-embed');
  assert.equal(snapshot.title, 'Faixa em destaque');
  assert.equal(snapshot.artist, 'Projeto Baluarte');
  assert.equal(snapshot.positionMs, 12_500);
  assert.equal(snapshot.durationMs, 180_000);
  const status = getStatusSnapshot().jarvisMusic;
  assert.ok(status && typeof status === 'object' && !Array.isArray(status));
  assert.equal(status.playback, 'playing');
  assert.equal(status.privacy, 'metadados de reprodução; sem captura de áudio');
});

test('paused Spotify playback clears stale passive music presence', () => {
  observeJarvisSpotifyPlayback('Faixa em destaque', null, 20_000, 180_000, true);
  observeJarvisSpotifyPlayback('Faixa em destaque', null, 20_000, 180_000, false);
  const snapshot = getJarvisMusicSnapshot();
  assert.equal(snapshot.playback, 'idle');
  assert.equal(getStatusSnapshot().jarvisMusic, undefined);
});

test('stop is safe when the browser document is unavailable', () => {
  assert.doesNotThrow(() => stopJarvisMusicPresence());
});
