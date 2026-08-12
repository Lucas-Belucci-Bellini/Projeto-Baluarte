import test from 'node:test';
import assert from 'node:assert/strict';
import { criarSupervisor } from '../../v2/core/supervisor.js';

function ambiente({ falhas = [] } = {}) {
  let estadoSaude = 'idle';
  const diagnostico = { vivos: ['alpha'], falhas };
  const boot = {
    subir: async () => ({ vivos: ['alpha'], falhas }),
    descer: async () => {},
    diagnostico: () => diagnostico
  };
  const saude = {
    definirEstado: (estado) => { estadoSaude = estado; },
    retrato: () => ({ estado: estadoSaude })
  };
  return { boot, saude };
}

test('supervisor chega a ready quando todos os módulos sobem', async () => {
  const { boot, saude } = ambiente();
  const supervisor = criarSupervisor(boot, saude, { agora: () => 1000 });

  const resultado = await supervisor.iniciar();
  assert.equal(resultado.estado, 'ready');
  assert.equal(supervisor.estado(), 'ready');
  assert.equal(supervisor.status().health.estado, 'ready');
});

test('falha de módulo produz estado degraded sem derrubar o conjunto', async () => {
  const { boot, saude } = ambiente({ falhas: [{ modulo: 'beta', erro: 'init' }] });
  const supervisor = criarSupervisor(boot, saude);

  const resultado = await supervisor.iniciar();
  assert.equal(resultado.estado, 'degraded');
  assert.equal(supervisor.estado(), 'degraded');
});

test('iniciar novamente em estado pronto é idempotente', async () => {
  const { boot, saude } = ambiente();
  let subidas = 0;
  boot.subir = async () => { subidas += 1; return { vivos: ['alpha'], falhas: [] }; };
  const supervisor = criarSupervisor(boot, saude);

  await supervisor.iniciar();
  const segunda = await supervisor.iniciar();
  assert.equal(segunda.idempotente, true);
  assert.equal(subidas, 1);
});

test('shutdown termina em stopped e pode ser repetido', async () => {
  const { boot, saude } = ambiente();
  let descidas = 0;
  boot.descer = async () => { descidas += 1; };
  const supervisor = criarSupervisor(boot, saude);

  await supervisor.iniciar();
  assert.equal((await supervisor.parar()).estado, 'stopped');
  assert.equal((await supervisor.parar()).idempotente, true);
  assert.equal(descidas, 1);
});

test('erro de boot vira failed e preserva mensagem', async () => {
  const { boot, saude } = ambiente();
  boot.subir = async () => { throw new Error('registry inválido'); };
  const supervisor = criarSupervisor(boot, saude);

  await assert.rejects(() => supervisor.iniciar(), /registry inválido/);
  assert.equal(supervisor.estado(), 'failed');
  assert.equal(supervisor.status().ultimaFalha, 'registry inválido');
});

test('não inicia durante stopping', async () => {
  const { boot, saude } = ambiente();
  let liberar;
  boot.descer = () => new Promise((resolve) => { liberar = resolve; });
  const supervisor = criarSupervisor(boot, saude);

  await supervisor.iniciar();
  const parada = supervisor.parar();
  await assert.rejects(() => supervisor.iniciar(), /shutdown/);
  liberar();
  await parada;
});
