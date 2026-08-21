import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_SESSION_DEFAULT_TTL_SECONDS,
  projectAuthSession,
  projectRefreshSession,
  projectStoredAuthSession,
  toPublicAuthSession,
} from '../../src/core/auth-session.ts';

test('sessão completa é projetada com expiração determinística', () => {
  const session = projectAuthSession({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
  }, 1_000);
  assert.deepEqual(session, {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_at: 4_600,
  });
});

test('TTL ausente usa o padrão bounded e não aceita TTL inválido', () => {
  const defaulted = projectAuthSession({ access_token: 'a', refresh_token: 'r' }, 1_000);
  assert.equal(defaulted?.expires_at, 1_000 + AUTH_SESSION_DEFAULT_TTL_SECONDS);
  assert.equal(projectAuthSession({ access_token: 'a', refresh_token: 'r', expires_in: 0 }, 1_000), null);
  assert.equal(projectAuthSession({ access_token: 'a', refresh_token: 'r', expires_in: '3600' }, 1_000), null);
});

test('token parcial ou payload não objeto nunca cria sessão', () => {
  assert.equal(projectAuthSession({ refresh_token: 'refresh-token', expires_in: 3600 }), null);
  assert.equal(projectAuthSession({ access_token: 'access-token', expires_in: 3600 }), null);
  assert.equal(projectAuthSession(null), null);
  assert.equal(projectAuthSession('access-token'), null);
});

test('sessão persistida valida campos snake_case e expiração', () => {
  const valid = projectStoredAuthSession({ access_token: 'a', refresh_token: 'r', expires_at: 9_999 });
  assert.equal(valid?.expires_at, 9_999);
  assert.equal(projectStoredAuthSession({ access_token: 'a', refresh_token: 'r', expires_at: 0 }), null);
  assert.equal(projectStoredAuthSession({ access_token: 'a', refresh_token: 'r', expires_at: '9999' }), null);
});

test('refresh preserva refresh token anterior quando o provider omite o novo', () => {
  const refreshed = projectRefreshSession({ access_token: 'access-new', expires_in: 900 }, 'refresh-old', 2_000);
  assert.deepEqual(refreshed, {
    access_token: 'access-new',
    refresh_token: 'refresh-old',
    expires_at: 2_900,
  });
});

test('refresh usa novo refresh token e rejeita ausência de ambos', () => {
  const refreshed = projectRefreshSession({ access_token: 'access-new', refresh_token: 'refresh-new' }, 'refresh-old', 2_000);
  assert.equal(refreshed?.refresh_token, 'refresh-new');
  assert.equal(projectRefreshSession({ access_token: 'access-new', expires_in: 900 }, null, 2_000), null);
});

test('projeção pública usa camelCase e não inclui campos externos adicionais', () => {
  const publicSession = toPublicAuthSession({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_at: 4_600,
  });
  assert.deepEqual(publicSession, {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: 4_600,
  });
  assert.equal(JSON.stringify(publicSession).includes('expires_in'), false);
});
