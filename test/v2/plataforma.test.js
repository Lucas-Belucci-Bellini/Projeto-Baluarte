import test from 'node:test';
import assert from 'node:assert/strict';
import { criarPlataforma } from '../../v2/core/plataforma.js';

function montar({ falhas = [], vivos = ['core'] } = {}) {
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
  return criarPlataforma(registry, boot);
}

test('fachada expõe saúde e lifecycle no diagnóstico', () => {
  const plataforma = montar();
  const d = plataforma.diagnostico();
  assert.equal(d.supervisor.estado, 'idle');
  assert.equal(d.saude.readiness, 'healthy');
  assert.equal(d.lifecycle.resumo.running, 1);
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
