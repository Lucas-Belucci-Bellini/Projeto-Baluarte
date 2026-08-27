import test from 'node:test';
import assert from 'node:assert/strict';
import { criarPlataforma } from '../../v2/core/plataforma.js';
import { criarRuntimeHealth } from '../../v2/core/module-runtime-health.js';
import { criarModuleRegistryHealth } from '../../v2/core/module-registry-health.js';
import { criarEscalonador } from '../../v2/core/trabalho.js';

function montar({ falhas = [], vivos = ['core'], registryHealth = undefined, trabalho = undefined } = {}) {
  const registry = {
    listar: () => ['core'],
    modulo: () => ({ name: 'Core', version: '2.0.0' })
  };
  let fase = 'no-ar';
  const ciclo = {
    vivos: () => vivos,
    falhas: () => falhas,
    /* Nada em voo: estes testes olham a fachada com o ciclo assentado. O duplo
     * precisa expor a peça mesmo assim — o status recusa ciclo sem ela, e é de
     * propósito: ciclo que não relata transição produziria um retrato que nunca
     * acusa nada. */
    emTransicao: () => null,
    get fase() { return fase; }
  };
  const boot = {
    ciclo,
    subir: async () => ({ vivos, falhas, ok: falhas.length === 0 }),
    descer: async () => { fase = 'parado'; return { ok: true, problemas: [] }; },
    diagnostico: () => ({ fase, modulos: vivos, falhas, eventosOrfaos: [], referenciasOrfas: [] })
  };
  return criarPlataforma(registry, boot, { registryHealth, trabalho });
}

test('fachada expõe saúde e lifecycle no diagnóstico', () => {
  const plataforma = montar();
  const d = plataforma.diagnostico();
  assert.equal(d.supervisor.estado, 'idle');
  assert.equal(d.saude.readiness, 'healthy');
  assert.equal(d.lifecycle.resumo.running, 1);
  assert.deepEqual(d.registry.modulos, [{
    id: 'core',
    mode: 'registered',
    status: 'unknown',
    restarts: 0,
    podeReiniciar: true,
  }]);
  assert.deepEqual(d.registry.incidentes, []);
  assert.equal(d.trabalho, null);
});

test('fachada expõe a saúde do escalonador real no diagnóstico', async () => {
  const trabalho = criarEscalonador();
  await trabalho.enfileirar('core', 'probe', () => 'ok');

  const d = montar({ trabalho }).diagnostico();
  assert.equal(d.trabalho.readiness, 'healthy');
  assert.equal(d.trabalho.contagem.enfileirados, 1);
  assert.equal(d.trabalho.contagem.concluidos, 1);
  assert.equal(d.trabalho.estado.naFila, 0);
});

test('fachada recusa um escalonador sem saúde', () => {
  assert.throws(() => montar({ trabalho: {} }), /trabalho inválido/);
});

test('fachada expõe overrides de maintenance no diagnóstico do Registry', () => {
  const registryHealth = criarModuleRegistryHealth(
    { listar: () => ['core'], modulo: () => ({ id: 'core' }) },
    criarRuntimeHealth(),
    { authorize: () => true },
  );
  registryHealth.definirModo('core', 'maintenance', 'janela aprovada');

  const plataforma = montar({ registryHealth });
  assert.equal(plataforma.diagnostico().registry.modulos[0].mode, 'maintenance');
  assert.equal(plataforma.diagnostico().registry.modulos[0].podeReiniciar, false);
  assert.deepEqual(plataforma.diagnostico().registry.incidentes, []);
});

test('fachada expõe incidentes do Runtime Health compartilhado', () => {
  const runtimeHealth = criarRuntimeHealth({ clock: () => 987 });
  runtimeHealth.marcarFalha('core', new Error('falha observada'));
  const registryHealth = criarModuleRegistryHealth(
    { listar: () => ['core'], modulo: () => ({ id: 'core' }) },
    runtimeHealth,
  );

  const plataforma = montar({ registryHealth });
  assert.deepEqual(plataforma.diagnostico().registry.incidentes, [{
    type: 'failed',
    id: 'core',
    timestamp: 987,
    status: 'failed',
    restarts: 1,
    error: 'falha observada',
  }]);
});

test('iniciar delega ao Supervisor e preserva falhas como degraded', async () => {
  const plataforma = montar({ falhas: [{ modulo: 'core', fase: 'init', motivo: 'erro' }] });
  const d = await plataforma.iniciar();
  assert.equal(d.estado, 'degraded');
});

test('parar delega ao Supervisor', async () => {
  const plataforma = montar();
  await plataforma.iniciar();
  const d = await plataforma.parar();
  assert.equal(d.estado, 'stopped');
});
