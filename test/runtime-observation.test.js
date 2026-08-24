import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  projectPlatformDiagnostic,
  VISUAL_ONLY_RUNTIME_OBSERVATION,
} from '../src/layout/runtime-observation.ts';

function diagnostic(overrides = {}) {
  return {
    supervisor: {
      estado: 'ready',
      inicio: 1,
      duracaoMs: 5,
      ultimaFalha: null,
      health: null,
      diagnostico: null,
    },
    saude: {
      liveness: 'healthy',
      readiness: 'healthy',
      fase: 'no-ar',
      motivos: [],
      contagem: {
        modulos: 2,
        falhas: 0,
        eventosOrfaos: 0,
        referenciasOrfas: 0,
      },
    },
    registry: {
      modulos: [
        { id: 'core', mode: 'healthy', status: 'healthy', restarts: 0, podeReiniciar: true },
        { id: 'editor', mode: 'healthy', status: 'healthy', restarts: 0, podeReiniciar: true },
      ],
      incidentes: [],
    },
    lifecycle: { modulos: [], resumo: {} },
    boot: { fase: 'no-ar', modulos: [], falhas: [] },
    ...overrides,
  };
}

test('diagnóstico ausente permanece visual-only e não autorizado', () => {
  assert.deepEqual(projectPlatformDiagnostic(null), VISUAL_ONLY_RUNTIME_OBSERVATION);
});

test('Plataforma pronta e sem incidentes projeta conexão e health saudáveis', () => {
  assert.deepEqual(projectPlatformDiagnostic(diagnostic()), {
    source: 'v2-platform-diagnostic',
    connection: 'connected',
    health: 'healthy',
    severity: 'none',
    fallback: 'available',
    authority: 'not-authorized',
    detail: 'supervisor=ready · readiness=healthy · módulos=2 · incidentes=0',
    moduleCount: 2,
    incidentCount: 0,
  });
});

test('incidente ou falha de módulo degrada o health sem desconectar a plataforma', () => {
  const result = projectPlatformDiagnostic(diagnostic({
    saude: {
      ...diagnostic().saude,
      contagem: { ...diagnostic().saude.contagem, falhas: 1 },
    },
    registry: {
      ...diagnostic().registry,
      incidentes: [{ type: 'runtime.failed', id: 'editor', timestamp: 3, status: 'failed', restarts: 1 }],
    },
  }));
  assert.equal(result.connection, 'connected');
  assert.equal(result.health, 'degraded');
  assert.equal(result.severity, 'warning');
  assert.equal(result.fallback, 'degraded');
  assert.equal(result.authority, 'not-authorized');
  assert.equal(result.incidentCount, 1);
});

test('supervisor failed projeta desconexão e falha observada', () => {
  const result = projectPlatformDiagnostic(diagnostic({
    supervisor: { estado: 'failed', inicio: 1, duracaoMs: 5, ultimaFalha: 'boom', health: null, diagnostico: null },
    saude: { ...diagnostic().saude, readiness: 'unhealthy' },
  }));
  assert.equal(result.connection, 'disconnected');
  assert.equal(result.health, 'failed');
  assert.equal(result.severity, 'critical');
  assert.equal(result.fallback, 'blocked');
  assert.equal(result.authority, 'not-authorized');
});

test('exhausted mantém fallback bloqueado e severidade crítica', () => {
  const base = diagnostic();
  const result = projectPlatformDiagnostic({
    ...base,
    saude: { ...base.saude, readiness: 'unhealthy', contagem: { ...base.saude.contagem, falhas: 1 } },
    registry: {
      ...base.registry,
      modulos: [{ ...base.registry.modulos[0], status: 'exhausted', mode: 'quarantined' }, base.registry.modulos[1]],
      incidentes: [{ type: 'failed', id: 'core', timestamp: 4, status: 'exhausted', restarts: 4, error: 'limite' }],
    },
  });
  assert.equal(result.health, 'exhausted');
  assert.equal(result.severity, 'critical');
  assert.equal(result.fallback, 'blocked');
});
