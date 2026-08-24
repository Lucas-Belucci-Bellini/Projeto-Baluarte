import { projectPlatformDiagnostic } from './runtime-observation';
import type { RuntimeObservation } from './runtime-observation';
import type { PlatformDiagnostic } from '../../v2/core/plataforma';

export const PLATFORM_OBSERVATION_CONTRACT_VERSION = 'platform-observation/v1' as const;
export const PLATFORM_OBSERVATION_ORIGIN = 'v2-harness' as const;
export const DEFAULT_PLATFORM_OBSERVATION_TTL_MS = 5_000;
export const MAX_PLATFORM_OBSERVATION_TTL_MS = 60_000;

const REDACTED_FIELDS = Object.freeze([
  'registry.incidentes[].error',
  'boot.falhas[].motivo',
  'boot.metricas',
  'boot.apis',
  'boot.usoDeApi',
  'boot.permissoes',
  'boot.decisoesDePermissao',
] as const);

export type PlatformObservationRedactedField = (typeof REDACTED_FIELDS)[number];

export interface PlatformObservationSummary {
  readonly moduleCount: number;
  readonly healthyModuleCount: number;
  readonly degradedModuleCount: number;
  readonly failedModuleCount: number;
  readonly incidentCount: number;
}

export interface PlatformObservationIntegrity {
  readonly algorithm: 'SHA-256';
  readonly status: 'unsealed' | 'sealed';
  readonly digest?: string;
}

export interface PlatformObservationEnvelope {
  readonly contractVersion: typeof PLATFORM_OBSERVATION_CONTRACT_VERSION;
  readonly origin: typeof PLATFORM_OBSERVATION_ORIGIN;
  readonly source: 'v2-platform-diagnostic';
  readonly nonce: string;
  readonly capturedAt: number;
  readonly expiresAt: number;
  readonly ttlMs: number;
  readonly observation: RuntimeObservation;
  readonly summary: PlatformObservationSummary;
  readonly redaction: {
    readonly applied: true;
    readonly fields: readonly PlatformObservationRedactedField[];
  };
  readonly integrity: PlatformObservationIntegrity;
  readonly authority: 'not-authorized';
}

export interface SealedPlatformObservationEnvelope
  extends Omit<PlatformObservationEnvelope, 'integrity'> {
  readonly integrity: {
    readonly algorithm: 'SHA-256';
    readonly status: 'sealed';
    readonly digest: string;
  };
}

export interface PlatformObservationTransportOptions {
  readonly capturedAtMs?: number;
  readonly ttlMs?: number;
  readonly nonce?: string;
}

function finiteInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`platform observation: ${name} deve ser inteiro não negativo`);
  }
  return value;
}

function resolveTtl(ttlMs: number | undefined): number {
  const ttl = ttlMs ?? DEFAULT_PLATFORM_OBSERVATION_TTL_MS;
  if (!Number.isInteger(ttl) || ttl <= 0 || ttl > MAX_PLATFORM_OBSERVATION_TTL_MS) {
    throw new RangeError(
      `platform observation: ttlMs deve estar entre 1 e ${MAX_PLATFORM_OBSERVATION_TTL_MS}`,
    );
  }
  return ttl;
}

function resolveNonce(nonce: string | undefined): string {
  if (nonce !== undefined) {
    if (!/^[A-Za-z0-9._~-]{16,128}$/.test(nonce)) {
      throw new RangeError('platform observation: nonce deve ter 16–128 caracteres seguros');
    }
    return nonce;
  }
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('platform observation: Web Crypto indisponível para nonce seguro');
}

function projectSummary(diagnostic: PlatformDiagnostic): PlatformObservationSummary {
  const modules = diagnostic.registry.modulos;
  const incidents = diagnostic.registry.incidentes.filter((incident) => incident.status !== 'healthy');
  return {
    moduleCount: modules.length,
    healthyModuleCount: modules.filter((module) => module.status === 'healthy').length,
    degradedModuleCount: modules.filter((module) => module.status === 'degraded').length,
    failedModuleCount: modules.filter((module) => module.status === 'failed' || module.status === 'exhausted').length,
    incidentCount: incidents.length,
  };
}

export function projectPlatformDiagnosticEnvelope(
  diagnostic: PlatformDiagnostic,
  options: PlatformObservationTransportOptions = {},
): PlatformObservationEnvelope {
  const capturedAt = finiteInteger(options.capturedAtMs ?? Date.now(), 'capturedAtMs');
  const ttlMs = resolveTtl(options.ttlMs);
  const observation = projectPlatformDiagnostic(diagnostic);
  const summary = projectSummary(diagnostic);

  return Object.freeze({
    contractVersion: PLATFORM_OBSERVATION_CONTRACT_VERSION,
    origin: PLATFORM_OBSERVATION_ORIGIN,
    source: 'v2-platform-diagnostic',
    nonce: resolveNonce(options.nonce),
    capturedAt,
    expiresAt: capturedAt + ttlMs,
    ttlMs,
    observation: Object.freeze({ ...observation }),
    summary: Object.freeze(summary),
    redaction: Object.freeze({ applied: true as const, fields: REDACTED_FIELDS }),
    integrity: Object.freeze({ algorithm: 'SHA-256' as const, status: 'unsealed' as const }),
    authority: 'not-authorized' as const,
  });
}

function canonicalPayload(envelope: PlatformObservationEnvelope): string {
  return JSON.stringify({
    contractVersion: envelope.contractVersion,
    origin: envelope.origin,
    source: envelope.source,
    nonce: envelope.nonce,
    capturedAt: envelope.capturedAt,
    expiresAt: envelope.expiresAt,
    ttlMs: envelope.ttlMs,
    observation: envelope.observation,
    summary: envelope.summary,
    redaction: envelope.redaction,
    authority: envelope.authority,
  });
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('platform observation: Web Crypto SubtleCrypto indisponível');
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function sealPlatformObservationEnvelope(
  envelope: PlatformObservationEnvelope,
): Promise<SealedPlatformObservationEnvelope> {
  const digest = await sha256Hex(canonicalPayload(envelope));
  return Object.freeze({
    ...envelope,
    integrity: Object.freeze({ algorithm: 'SHA-256' as const, status: 'sealed' as const, digest }),
  });
}

export async function verifyPlatformObservationEnvelope(
  envelope: PlatformObservationEnvelope,
  nowMs = Date.now(),
): Promise<boolean> {
  if (!isPlatformObservationEnvelopeFresh(envelope, nowMs)
    || envelope.origin !== PLATFORM_OBSERVATION_ORIGIN
    || envelope.authority !== 'not-authorized'
    || envelope.integrity.status !== 'sealed'
    || !/^[a-f0-9]{64}$/.test(envelope.integrity.digest ?? '')) {
    return false;
  }
  const expected = await sha256Hex(canonicalPayload(envelope));
  return expected === envelope.integrity.digest;
}

export function isPlatformObservationEnvelopeFresh(
  envelope: PlatformObservationEnvelope,
  nowMs = Date.now(),
): boolean {
  return Number.isFinite(nowMs)
    && nowMs >= envelope.capturedAt
    && nowMs < envelope.expiresAt
    && envelope.expiresAt - envelope.capturedAt === envelope.ttlMs;
}

export function serializePlatformObservationEnvelope(
  envelope: PlatformObservationEnvelope,
): string {
  return JSON.stringify(envelope);
}
