import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSpotifySoloistMonitor,
  parseSpotifySoloistPlayback,
} from '../../src/utils/jarvis-spotify-soloist.ts';
import { createSpotifySoloistBridge } from '../../scripts/spotify-soloist-bridge.ts';
import { getJarvisMusicSnapshot, observeJarvisSpotifySoloistPlayback } from '../../src/utils/jarvis-music-presence.ts';
import { getJarvisRuntimeContext } from '../../src/utils/jarvis-context.ts';

function response(status, body, headers = {}) {
  const text = body === null ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name] ?? null },
    text: async () => text,
  };
}

const soloistPlayback = {
  type: 'playback_state',
  status: 'playing',
  item: {
    uri: 'spotify:track:private-uri-must-not-escape',
    entity_type: 'track',
    decorations: {
      identity: { name: 'Núcleo' },
      playback: { duration_ms: 180000 },
    },
    creators: [{ entity: { entity_type: 'artist', decorations: { identity: { name: 'Baluarte' } } } }],
  },
  position: { position_ms: 1234, timestamp_ms: 1747654321000, speed: 1 },
  volume: 65,
  available_actions: { pause: {} },
};

test('parser Soloist normaliza playback_state oficial sem vazar URI, volume ou ações', () => {
  const snapshot = parseSpotifySoloistPlayback(soloistPlayback);
  assert.deepEqual(snapshot, {
    playback: 'playing',
    title: 'Núcleo',
    artist: 'Baluarte',
    positionMs: 1234,
    durationMs: 180000,
  });
  assert.doesNotMatch(JSON.stringify(snapshot), /private-uri|volume|pause|available_actions/);
});

test('parser Soloist aceita somente estados conhecidos e converte idle/buffering em unknown', () => {
  assert.equal(parseSpotifySoloistPlayback({ status: 'paused', item: soloistPlayback.item }).playback, 'paused');
  assert.equal(parseSpotifySoloistPlayback({ status: 'idle', item: soloistPlayback.item }).playback, 'unknown');
  assert.equal(parseSpotifySoloistPlayback({ status: 'buffering', item: soloistPlayback.item }).playback, 'unknown');
  assert.equal(parseSpotifySoloistPlayback({ nope: true }).playback, 'unknown');
});

test('parser Soloist limita texto e tempos fora do domínio', () => {
  const parsed = parseSpotifySoloistPlayback({
    playback: 'playing',
    title: 'x'.repeat(500),
    artist: 'y'.repeat(500),
    positionMs: -2,
    durationMs: Number.POSITIVE_INFINITY,
  });
  assert.equal(parsed.title?.length, 160);
  assert.equal(parsed.artist?.length, 160);
  assert.equal(parsed.positionMs, null);
  assert.equal(parsed.durationMs, null);
});

test('monitor Soloist publica somente presença read-only e limpa faixa quando a ponte fica indisponível', async () => {
  const monitor = createSpotifySoloistMonitor({
    endpoint: 'http://127.0.0.1:18791/v1/spotify/playback',
    bridgeToken: 'bridge-token',
    fetchFn: async (url, init) => {
      assert.equal(url, 'http://127.0.0.1:18791/v1/spotify/playback');
      assert.equal(init.method, 'GET');
      assert.equal(init.headers['x-baluarte-bridge-token'], 'bridge-token');
      assert.doesNotMatch(JSON.stringify(init), /spak_|api.key|secret|access.token/i);
      return response(200, { ok: true, playback: 'playing', title: 'Núcleo', artist: 'Baluarte', positionMs: 10, durationMs: 100 });
    },
  });
  assert.equal((await monitor.poll()).kind, 'playing');
  assert.equal(getJarvisMusicSnapshot().source, 'spotify-soloist');
  assert.match(getJarvisRuntimeContext({ compact: true }), /Núcleo/);

  const unavailable = createSpotifySoloistMonitor({
    endpoint: 'http://127.0.0.1:18791/v1/spotify/playback',
    bridgeToken: 'bridge-token',
    fetchFn: async () => { throw new Error('offline'); },
  });
  assert.deepEqual(await unavailable.poll(), { kind: 'error', code: 'unavailable' });
  assert.equal(getJarvisMusicSnapshot().playback, 'unknown');
  assert.equal(getJarvisMusicSnapshot().title, null);
});

test('monitor Soloist exige endpoint loopback e nunca aceita endpoint externo', () => {
  assert.throws(() => createSpotifySoloistMonitor({ endpoint: 'https://example.com/soloist' }), /SPOTIFY_SOLOIST_ENDPOINT_LOOPBACK_REQUIRED/);
  assert.throws(() => createSpotifySoloistMonitor({ endpoint: 'http://user:pass@127.0.0.1:18791' }), /SPOTIFY_SOLOIST_ENDPOINT_LOOPBACK_REQUIRED/);
});

test('ponte Soloist exige token, permite apenas GET de playback e redige resposta', async () => {
  const calls = [];
  const bridge = createSpotifySoloistBridge({
    port: 0,
    allowedOrigin: 'http://127.0.0.1:5173',
    bridgeToken: 'bridge-token',
    runner: async (args) => {
      calls.push(args);
      return { stdout: JSON.stringify(soloistPlayback), stderr: 'not returned to client' };
    },
  });
  const address = await bridge.listen();
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const health = await fetch(`${base}/health`, { headers: { origin: 'http://127.0.0.1:5173' } });
    assert.equal(health.status, 200);
    assert.equal((await health.json()).tokenConfigured, true);

    const missing = await fetch(`${base}/v1/spotify/playback`, { headers: { origin: 'http://127.0.0.1:5173' } });
    assert.equal(missing.status, 401);

    const playback = await fetch(`${base}/v1/spotify/playback`, {
      headers: { origin: 'http://127.0.0.1:5173', 'x-baluarte-bridge-token': 'bridge-token' },
    });
    assert.equal(playback.status, 200);
    const payload = await playback.json();
    assert.equal(payload.playback, 'playing');
    assert.equal(payload.title, 'Núcleo');
    assert.equal(payload.artist, 'Baluarte');
    assert.equal(payload.readOnly, true);
    assert.equal(payload.snapshot, undefined);
    assert.equal(payload.volume, undefined);
    assert.equal(payload.available_actions, undefined);
    assert.doesNotMatch(JSON.stringify(payload), /private-uri|secret|api.key|access.token/i);
    assert.deepEqual(calls, [['now', '--json']]);

    const control = await fetch(`${base}/v1/spotify/playback`, {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:5173', 'x-baluarte-bridge-token': 'bridge-token' },
    });
    assert.equal(control.status, 404);

    const blocked = await fetch(`${base}/v1/spotify/playback`, {
      headers: { origin: 'https://evil.example', 'x-baluarte-bridge-token': 'bridge-token' },
    });
    assert.equal(blocked.status, 403);
  } finally {
    await bridge.close();
  }
});

test('presença Soloist manual mantém contrato de fonte única', () => {
  observeJarvisSpotifySoloistPlayback('paused', 'Faixa', 'Artista', 20, 1000);
  assert.equal(getJarvisMusicSnapshot().source, 'spotify-soloist');
  assert.equal(getJarvisMusicSnapshot().playback, 'paused');
});
