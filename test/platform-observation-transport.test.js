import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PLATFORM_OBSERVATION_TTL_MS,
  MAX_PLATFORM_OBSERVATION_TTL_MS,
  PLATFORM_OBSERVATION_ORIGIN,
  isPlatformObservationEnvelopeFresh,
  projectPlatformDiagnosticEnvelope,
  sealPlatformObservationEnvelope,
  serializePlatformObservationEnvelope,
  verifyPlatformObservationEnvelope,
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
    nonce: 'nonce-transport-0001',
  });

  assert.equal(envelope.contractVersion, 'platform-observation/v1');
  assert.equal(envelope.origin, PLATFORM_OBSERVATION_ORIGIN);
  assert.equal(envelope.source, 'v2-platform-diagnostic');
  assert.equal(envelope.nonce, 'nonce-transport-0001');
  assert.equal(envelope.capturedAt, 1_000);
  assert.equal(envelope.expiresAt, 6_000);
  assert.equal(envelope.authority, 'not-authorized');
  assert.equal(envelope.summary.moduleCount, 2);
  assert.equal(envelope.summary.healthyModuleCount, 2);
  assert.equal(envelope.summary.incidentCount, 0);
  assert.equal(envelope.redaction.applied, true);
  assert.ok(envelope.redaction.fields.includes('boot.metricas'));
  assert.equal(envelope.integrity.status, 'unsealed');
  assert.equal('boot' in envelope, false);
  assert.equal('registry' in envelope, false);
  assert.equal(Object.isFrozen(envelope), true);
});

test('TTL é verificável e expira sem tolerância implícita', () => {
  const envelope = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 10_000,
    ttlMs: DEFAULT_PLATFORM_OBSERVATION_TTL_MS,
    nonce: 'nonce-transport-0002',
  });

  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 10_000), true);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 14_999), true);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 15_000), false);
  assert.equal(isPlatformObservationEnvelopeFresh(envelope, 9_999), false);
});

test('TTL e nonce inválidos são rejeitados', () => {
  assert.throws(
    () => projectPlatformDiagnosticEnvelope(diagnostic(), { ttlMs: 0 }),
    /ttlMs deve estar entre/,
  );
  assert.throws(
    () => projectPlatformDiagnosticEnvelope(diagnostic(), { ttlMs: MAX_PLATFORM_OBSERVATION_TTL_MS + 1 }),
    /ttlMs deve estar entre/,
  );
  assert.throws(
    () => projectPlatformDiagnosticEnvelope(diagnostic(), { nonce: 'curto' }),
    /nonce deve ter 16–128 caracteres seguros/,
  );
});

test('digest SHA-256 sela o payload e rejeita tampering, origem falsa e replay', async () => {
  const unsigned = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 30_000,
    ttlMs: 1_000,
    nonce: 'nonce-transport-0003',
  });
  const sealed = await sealPlatformObservationEnvelope(unsigned);

  assert.equal(sealed.integrity.algorithm, 'SHA-256');
  assert.equal(sealed.integrity.status, 'sealed');
  assert.match(sealed.integrity.digest, /^[a-f0-9]{64}$/);
  assert.equal(await verifyPlatformObservationEnvelope(sealed, 30_001), true);
  assert.equal(await verifyPlatformObservationEnvelope(sealed, 31_000), false);

  const tampered = { ...sealed, summary: { ...sealed.summary, moduleCount: 99 } };
  assert.equal(await verifyPlatformObservationEnvelope(tampered, 30_001), false);

  const wrongOrigin = { ...sealed, origin: 'external-origin' };
  assert.equal(await verifyPlatformObservationEnvelope(wrongOrigin, 30_001), false);
});

test('serialização não expõe payload operacional ou valores redigidos', () => {
  const envelope = projectPlatformDiagnosticEnvelope(diagnostic(), {
    capturedAtMs: 20_000,
    ttlMs: 1_000,
    nonce: 'nonce-transport-0004',
  });
  const serialized = serializePlatformObservationEnvelope(envelope);

  assert.match(serialized, /platform-observation\/v1/);
  assert.match(serialized, /not-authorized/);
  assert.doesNotMatch(serialized, /não transportar/);
  assert.doesNotMatch(serialized, /execute|grant|actorId|token/);
});
