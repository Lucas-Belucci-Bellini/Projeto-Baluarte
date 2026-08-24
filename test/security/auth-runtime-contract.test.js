import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAccessToken,
  isLoggedIn,
  signInWithPassword,
  signOut,
} from '../../src/core/supabase-auth.js';

const fetchReal = globalThis.fetch;

function resposta(data, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

afterEach(async () => {
  globalThis.fetch = fetchReal;
  await signOut();
});

test('Auth: login só cria sessão quando recebe os dois tokens', async () => {
  globalThis.fetch = async () => resposta({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
  });

  await signInWithPassword('lucas@example.com', 'senha-segura');

  assert.equal(isLoggedIn(), true);
});

test('Auth: resposta 200 sem access_token não cria sessão', async () => {
  globalThis.fetch = async () => resposta({ user: { id: 'u-1' } });

  await assert.rejects(
    () => signInWithPassword('lucas@example.com', 'senha-segura'),
    /resposta de autenticação inválida/i,
  );
  assert.equal(isLoggedIn(), false);
});

test('Auth: refresh incompleto limpa a sessão em vez de persistir token inválido', async () => {
  globalThis.fetch = async () => resposta({
    access_token: 'access-token-expirado',
    refresh_token: 'refresh-token',
    expires_in: 1,
  });
  await signInWithPassword('lucas@example.com', 'senha-segura');

  globalThis.fetch = async () => resposta({ expires_in: 3600 });

  assert.equal(await getAccessToken(), null);
  assert.equal(isLoggedIn(), false);
});

test('Auth: logout continua limpando a sessão se a revogação remota falhar', async () => {
  globalThis.fetch = async () => resposta({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
  });
  await signInWithPassword('lucas@example.com', 'senha-segura');
  globalThis.fetch = async () => { throw new Error('rede indisponível'); };

  await signOut();

  assert.equal(isLoggedIn(), false);
});
