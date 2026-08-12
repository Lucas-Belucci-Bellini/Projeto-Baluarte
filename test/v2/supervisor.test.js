import test from 'node:test';
import assert from 'node:assert/strict';
import { criarSupervisor } from '../../v2/core/supervisor.js';

function bootFake(resultado = { ok: true, vivos: ['alpha'], falhas: [] }) {
  let subirChamadas = 0;
  let descerChamadas = 0;
  return {
    boot: {
      async subir() { subirChamadas += 1; return resultado; },
      async descer() { descerChamadas += 1; return { ok: true, problemas: [] }; }
    },
    contagem: () => ({ subir: subirChamadas, descer: descerChamadas })
  };
}

test('supervisor chega a ready quando boot e readiness estão saudáveis', async () => {
  const fake = bootFake();
  const supervisor = criarSupervisor(fake.boot, { verificar: () => ({ readiness: 'healthy' }) });
  const resultado = await supervisor.iniciar();
  assert.equal(resultado.estado, 'ready');
  assert.equal(supervisor.estado, 'ready');
});

test('falha de módulo produz estado degraded sem derrubar o processo', async () => {
  const fake = bootFake({ ok: false, vivos: ['alpha'], falhas: [{ modulo: 'beta' }] });
  const supervisor = criarSupervisor(fake.boot, { verificar: () => ({ readiness: 'healthy' }) });
  await supervisor.iniciar();
  assert.equal(supervisor.estado, 'degraded');
});

test('iniciar duas vezes não sobe o Boot duas vezes', async () => {
  const fake = bootFake();
  const supervisor = criarSupervisor(fake.boot, { verificar: () => ({ readiness: 'healthy' }) });
  await supervisor.iniciar();
  await supervisor.iniciar();
  assert.deepEqual(fake.contagem(), { subir: 1, descer: 0 });
});

test('parar é idempotente depois de parado', async () => {
  const fake = bootFake();
  const supervisor = criarSupervisor(fake.boot, { verificar: () => ({ readiness: 'healthy' }) });
  await supervisor.iniciar();
  await supervisor.parar();
  await supervisor.parar();
  assert.equal(supervisor.estado, 'stopped');
  assert.deepEqual(fake.contagem(), { subir: 1, descer: 1 });
});

test('erro de boot leva o supervisor para failed', async () => {
  const boot = {
    async subir() { throw new Error('boot explodiu'); },
    async descer() { return { ok: true }; }
  };
  const supervisor = criarSupervisor(boot);
  await assert.rejects(supervisor.iniciar(), /boot explodiu/);
  assert.equal(supervisor.estado, 'failed');
  assert.equal(supervisor.diagnostico().ultimoErro, 'boot explodiu');
});
