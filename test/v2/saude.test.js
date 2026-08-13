import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliarSaude, criarMonitorSaude } from '../../v2/core/saude.js';

test('Core no ar com módulo saudável fica ready', () => {
  const resultado = avaliarSaude({
    fase: 'no-ar',
    modulos: [{ id: 'core' }],
    falhas: [],
    eventosOrfaos: [],
    referenciasOrfas: []
  });

  assert.equal(resultado.liveness, 'healthy');
  assert.equal(resultado.readiness, 'healthy');
  assert.deepEqual(resultado.contagem, {
    modulos: 1,
    falhas: 0,
    eventosOrfaos: 0,
    referenciasOrfas: 0
  });
});

test('falha isolada degrada diagnóstico sem matar liveness', () => {
  const resultado = avaliarSaude({
    fase: 'no-ar',
    modulos: [{ id: 'core' }],
    falhas: [{ modulo: 'quebrado' }],
    eventosOrfaos: [],
    referenciasOrfas: []
  });

  assert.equal(resultado.liveness, 'healthy');
  assert.equal(resultado.readiness, 'healthy');
  assert.match(resultado.motivos.join(' '), /falha/);
});

test('Core parado não fica ready', () => {
  const resultado = avaliarSaude({ fase: 'parado', modulos: [] });
  assert.equal(resultado.liveness, 'unhealthy');
  assert.equal(resultado.readiness, 'unhealthy');
});

test('Core no ar sem módulos não fica ready', () => {
  const resultado = avaliarSaude({ fase: 'no-ar', modulos: [], falhas: [] });
  assert.equal(resultado.liveness, 'healthy');
  assert.equal(resultado.readiness, 'unhealthy');
});

test('retrato ausente falha fechado', () => {
  const resultado = avaliarSaude(null);
  assert.equal(resultado.liveness, 'unhealthy');
  assert.equal(resultado.readiness, 'unhealthy');
});

test('monitor consulta o boot a cada verificação', () => {
  let chamadas = 0;
  const monitor = criarMonitorSaude({
    diagnostico() {
      chamadas += 1;
      return { fase: 'no-ar', modulos: [{ id: 'x' }] };
    }
  });

  assert.equal(monitor.verificar().readiness, 'healthy');
  assert.equal(monitor.verificar().readiness, 'healthy');
  assert.equal(chamadas, 2);
});

test('monitor exige diagnóstico do boot', () => {
  assert.throws(() => criarMonitorSaude({}), /boot\.diagnostico é obrigatório/);
});
