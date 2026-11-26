import assert from 'node:assert/strict';
import test from 'node:test';

import { hxBeacon } from '../src/utils/hx-beacon.ts';

test('hxBeacon legado retorna sem consentimento e não chama a rede', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error('network must remain unreachable');
  };

  try {
    await hxBeacon();
    await hxBeacon({ consent: false });
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('consentimento explícito ainda respeita o endpoint placeholder', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error('placeholder must not trigger geolocation');
  };

  try {
    await hxBeacon({ consent: true });
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('opções nulas ou inválidas permanecem fail-closed', async () => {
  await assert.doesNotReject(() => hxBeacon(null));
  await assert.doesNotReject(() => hxBeacon({ consent: 1 }));
});
