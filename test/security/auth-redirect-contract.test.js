import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  handleAuthRedirect,
  isLoggedIn,
  signOut,
} from '../../src/core/supabase-auth.js';

const fetchReal = globalThis.fetch;
const windowReal = globalThis.window;
const historyReal = globalThis.history;

function instalarUrl(hash) {
  globalThis.window = {
    location: {
      hash,
      pathname: '/login',
      search: '?source=oauth',
    },
  };
}

function instalarHistorico() {
  const chamadas = [];
  globalThis.history = {
    replaceState: (_state, _title, url) => chamadas.push(url),
  };
  return chamadas;
}

afterEach(async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
  await signOut();
  globalThis.fetch = fetchReal;
  if (windowReal === undefined) delete globalThis.window;
  else globalThis.window = windowReal;
  if (historyReal === undefined) delete globalThis.history;
  else globalThis.history = historyReal;
});

test('OAuth: navegação hash normal não cria sessão nem altera histórico', () => {
  instalarUrl('#/home');
  const chamadas = instalarHistorico();

  assert.equal(handleAuthRedirect(), false);
  assert.equal(isLoggedIn(), false);
  assert.deepEqual(chamadas, []);
});

test('OAuth: sessão completa é armazenada e tokens saem da URL', () => {
  instalarUrl('#access_token=access-1&refresh_token=refresh-1&expires_in=3600');
  const chamadas = instalarHistorico();

  assert.equal(handleAuthRedirect(), true);
  assert.equal(isLoggedIn(), true);
  assert.deepEqual(chamadas, ['/login?source=oauth#/home']);
  assert.doesNotMatch(chamadas[0], /access_token|refresh_token/);
});

test('OAuth: fragmento com token parcial não autentica o usuário', () => {
  instalarUrl('#access_token=access-1&expires_in=3600');
  const chamadas = instalarHistorico();

  assert.equal(handleAuthRedirect(), false);
  assert.equal(isLoggedIn(), false);
  assert.deepEqual(chamadas, ['/login?source=oauth#/home']);
});

test('OAuth: erro do provedor limpa o fragmento sem criar sessão', () => {
  instalarUrl('#error=access_denied&error_description=cancelado');
  const chamadas = instalarHistorico();

  assert.equal(handleAuthRedirect(), false);
  assert.equal(isLoggedIn(), false);
  assert.deepEqual(chamadas, ['/login?source=oauth#/home']);
});
