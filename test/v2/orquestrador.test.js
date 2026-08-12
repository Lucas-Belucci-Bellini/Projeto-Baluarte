import test from 'node:test';
import assert from 'node:assert/strict';
import { criarOrquestrador } from '../../v2/core/orquestrador.js';

function fakeBoot() {
  let ligado = false;
  return {
    async subir() { ligado = true; return { vivos: ['alpha'], falhas: [] }; },
    async descer() { ligado = false; return { ok: true, problemas: [] }; },
    diagnostico() { return { ligado }; }
  };
}

function fakeHealth() {
  return {
    verificar() { return { liveness: 'healthy', readiness: 'healthy' }; },
    retrato() { return { liveness: 'healthy', readiness: 'healthy' }; }
  };
}

test('orquestrador inicia e para sem duplicar responsabilidade', async () => {
  const orquestrador = criarOrquestrador(fakeBoot(), fakeHealth());
  const inicio = await orquestrador.iniciar();
  assert.equal(inicio.estado, 'ready');
  assert.equal(orquestrador.supervisor.estado, 'ready');

  const fim = await orquestrador.parar();
  assert.equal(fim.estado, 'stopped');
});

test('diagnostico agrega supervisor, boot e health', async () => {
  const orquestrador = criarOrquestrador(fakeBoot(), fakeHealth());
  await orquestrador.iniciar();
  const diagnostico = orquestrador.diagnostico();

  assert.equal(diagnostico.supervisor.estado, 'ready');
  assert.equal(diagnostico.boot.ligado, true);
  assert.equal(diagnostico.health.readiness, 'healthy');
});

test('falha do boot sobe para o supervisor', async () => {
  const boot = {
    subir: async () => { throw new Error('falha de teste'); },
    descer: async () => ({ ok: true, problemas: [] })
  };
  const orquestrador = criarOrquestrador(boot, fakeHealth());

  await assert.rejects(orquestrador.iniciar(), /falha de teste/);
  assert.equal(orquestrador.supervisor.estado, 'failed');
});
