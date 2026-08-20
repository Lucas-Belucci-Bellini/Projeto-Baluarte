import { projectPlatformDiagnostic } from './runtime-observation';
import type { RuntimeObservation } from './runtime-observation';
import type { PlatformDiagnostic } from '../../v2/core/plataforma';

export const PLATFORM_OBSERVATION_CONTRACT_VERSION = 'platform-observation/v1' as const;
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

export interface PlatformObservationEnvelope {
  readonly contractVersion: typeof PLATFORM_OBSERVATION_CONTRACT_VERSION;
  readonly source: 'v2-platform-diagnostic';
  readonly capturedAt: number;
  readonly expiresAt: number;
  readonly ttlMs: number;
  readonly observation: RuntimeObservation;
  readonly summary: PlatformObservationSummary;
  readonly redaction: {
    readonly applied: true;
    readonly fields: readonly PlatformObservationRedactedField[];
  };
  readonly authority: 'not-authorized';
}

export interface PlatformObservationTransportOptions {
  readonly capturedAtMs?: number;
  readonly ttlMs?: number;
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
    source: 'v2-platform-diagnostic',
    capturedAt,
    expiresAt: capturedAt + ttlMs,
    ttlMs,
    observation: Object.freeze({ ...observation }),
    summary: Object.freeze(summary),
    redaction: Object.freeze({ applied: true as const, fields: REDACTED_FIELDS }),
    authority: 'not-authorized' as const,
  });
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
