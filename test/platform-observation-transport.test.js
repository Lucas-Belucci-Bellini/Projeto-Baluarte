import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PLATFORM_OBSERVATION_TTL_MS,
  MAX_PLATFORM_OBSERVATION_TTL_MS,
  isPlatformObservationEnvelopeFresh,
  projectPlatformDiagnosticEnvelope,
  serializePlatformObservationEnvelope,
} from '../src/layout/platform-observation-transport.ts';

function diagnostic(overrides = {}) {
  return {
    supervisor: { estado: 'ready' },
    saude: { readiness: 'healthy', contagem: { falhas: 0 } },
    registry: {
      modulos: [
        { id: 'editor', mode: 'healthy', status: 'healthy' },
        { id: 'militar', mode: 'healthy', status: 'healthy' },
      ],
      incidentes: [{ type: 'healthy', id: 'editor', status: 'healthy' }],
    },
    lifecycle: { modulos: [], resumo: {} },
    boot: {
      falhas: [],
      metricas: { segredo: 'não transportar' },
      apis: [{ token: 'não transportar' }],
      usoDeApi: { segredo: 'não transportar' },
      permissoes: { ator: 'não transportar' },
      decisoesDePermissao: [{ actorId: 'não transportar' }],
    },
    ...overrides,
  };
}

test('envelope transporta resumo redigido e mantém autoridade não autorizada', () => {
  const envelope = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 1_000,
    ttlMs: 5_000,
  });

  assert.equal(envelope.contractVersion, 'platform-observation/v1');
  assert.equal(envelope.source, 'v2-platform-diagnostic');
  assert.equal(envelope.capturedAt, 1_000);
  assert.equal(envelope.expiresAt, 6_000);
  assert.equal(envelope.authority, 'not-authorized');
  assert.equal(envelope.summary.moduleCount, 2);
  assert.equal(envelope.summary.healthyModuleCount, 2);
  assert.equal(envelope.summary.incidentCount, 0);
  assert.equal(envelope.redaction.applied, true);
  assert.ok(envelope.redaction.fields.includes('boot.metricas'));
  assert.equal('boot' in envelope, false);
  assert.equal('registry' in envelope, false);
  assert.equal(Object.isFrozen(envelope), true);
});

test('TTL é verificável e expira sem tolerância implícita', () => {
  const envelope = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 10_000,
    ttlMs: DEFAULT_PLATFORM_OBSERVATION_TTL_MS,
  });

  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 10_000), true);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 14_999), true);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 15_000), false);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 9_999), false);
});

test('TTL inválido é rejeitado e não cria uma janela indefinida', () => {
  assert.throws(
    () => projectPlatformDiagnosticEnvelope(diagnostic(), { ttlMs: 0 }),
    /ttlMs deve estar entre/,
  );
  assert.throws(
    () => projectPlatformDiagnosticEnvelope(diagnostic(), { ttlMs: MAX_PLATFORM_OBSERVATION_TTL_MS + 1 }),
    /ttlMs deve estar entre/,
  );
});

test('serialização não expõe payload operacional ou valores redigidos', () => {
  const envelope = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 20_000,
    ttlMs: 1_000,
  });
  const serialized = serializePlatformObservationEnvelope(envelope);

  assert.match(serialized, /platform-observation\/v1/);
  assert.match(serialized, /not-authorized/);
  assert.doesNotMatch(serialized, /não transportar/);
  assert.doesNotMatch(serialized, /execute|grant|actorId|token/);
});
