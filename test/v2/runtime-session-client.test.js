import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeSession } from '../../v2/core/runtime-session-client.js';

const envelope = { versao: 1, modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }] };

test('session abre, usa Runtime e fecha', async () => {
  const requests = [];
  const client = { request: async (request) => {
    requests.push(request);
    return request.op === 'authorize'
      ? { status: 'authorized', modulos: ['alpha'] }
      : { status: 'file', modulo: 'alpha', bytes: [65, 66] };
  }};
  const session = criarRuntimeSession(client, envelope);

  await session.abrir();
  assert.equal(session.aberta(), true);
  const file = await session.lerArquivo('alpha', 'hello.txt');
  assert.deepEqual(file.bytes, [65, 66]);
  await session.fechar();
  assert.equal(session.aberta(), false);
  assert.deepEqual(requests.map(r => r.op), ['authorize', 'read_file']);
});

test('não lê antes de abrir', async () => {
  const session = criarRuntimeSession({ request: async () => ({ status: 'file', bytes: [] }) }, envelope);
  await assert.rejects(() => session.lerArquivo('alpha', 'x'), /não está aberta/);
});

test('falha de autorização não abre a sessão', async () => {
  const session = criarRuntimeSession({ request: async () => ({ status: 'error', code: 'RUNTIME_REJECTED', message: 'negado' }) }, envelope);
  await assert.rejects(() => session.abrir(), /negado/);
  assert.equal(session.aberta(), false);
});
