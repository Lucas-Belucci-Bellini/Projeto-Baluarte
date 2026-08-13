import test from 'node:test';
import assert from 'node:assert/strict';
import { criarSessaoRuntime } from '../../v2/core/runtime-session.js';

function permissions(map) {
  return { avaliar: (modulo, permissao) => map[modulo]?.includes(permissao) ? 'ok' : 'negada' };
}

const respostaValida = JSON.stringify({ versao: 1, resultados: [] });

test('abre sessão enviando apenas permissões efetivas', async () => {
  let payload;
  const transport = { async enviar(value) { payload = JSON.parse(value); return respostaValida; } };
  const session = criarSessaoRuntime(permissions({ alpha: ['READ_FILES'], beta: [] }), transport);
  const result = await session.abrir(['alpha', 'beta']);
  assert.equal(result.estado, 'open');
  assert.deepEqual(payload, { versao: 1, modulos: [
    { modulo: 'alpha', permissoes: ['READ_FILES'] },
    { modulo: 'beta', permissoes: [] }
  ] });
});

test('resposta fora do contrato impede sessão de ficar aberta', async () => {
  const session = criarSessaoRuntime(permissions({ alpha: ['READ_FILES'] }), {
    async enviar() { return JSON.stringify({ accepted: true }); }
  });
  await assert.rejects(session.abrir(['alpha']), /resposta do Runtime precisa de resultados/);
  assert.equal(session.estado, 'failed');
});

test('resposta válida do Runtime permite abrir a sessão', async () => {
  const session = criarSessaoRuntime(permissions({ alpha: ['READ_FILES'] }), {
    async enviar() { return respostaValida; }
  });
  const result = await session.abrir(['alpha']);
  assert.equal(result.estado, 'open');
});

test('falha de transporte impede sessão de ficar aberta', async () => {
  const session = criarSessaoRuntime(permissions({ alpha: ['READ_FILES'] }), {
    async enviar() { throw new Error('runtime indisponível'); }
  });
  await assert.rejects(session.abrir(['alpha']), /runtime indisponível/);
  assert.equal(session.estado, 'failed');
  assert.match(session.diagnostico().ultimoErro, /runtime indisponível/);
});

test('fechar é idempotente', async () => {
  const session = criarSessaoRuntime(permissions({}), {
    async enviar() { return respostaValida; }
  });
  assert.equal((await session.fechar()).estado, 'closed');
  assert.equal((await session.fechar()).estado, 'closed');
});

test('não aceita abrir durante uma abertura em andamento', async () => {
  let resolve;
  const pending = new Promise((r) => { resolve = r; });
  const session = criarSessaoRuntime(permissions({ alpha: [] }), {
    enviar: async () => { await pending; return respostaValida; }
  });
  const opening = session.abrir(['alpha']);
  await assert.rejects(session.abrir(['alpha']), /já está abrindo/);
  resolve();
  await opening;
});
