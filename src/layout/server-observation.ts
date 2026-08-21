import type {
  RuntimeFallbackState,
  RuntimeObservation,
  RuntimeObservationSeverity,
} from './runtime-observation';

export const SERVER_OBSERVATION_CONTRACT_VERSION = 'server-observation/v1' as const;

export type ServerObservationReasonCode =
  | 'health-degraded'
  | 'claims-absent'
  | 'claims-stale'
  | 'rate-limited'
  | 'observation-ready';

export interface ServerObservationHealth {
  readonly health: 'healthy' | 'degraded';
  readonly severity: 'none' | 'warning';
  readonly fallback: 'available' | 'degraded';
  readonly connection: 'connected';
  readonly authority: 'not-authorized';
  readonly ok: true;
  readonly service: 'jarvis-backend';
  readonly model: string;
  readonly hasKey: boolean;
  readonly detail: string;
}

export interface ServerObservationClaims {
  readonly identity: {
    readonly authenticated: boolean;
    readonly issuerPresent: boolean;
    readonly subjectPresent: boolean;
    readonly audienceMatched: boolean;
    readonly trustedSource: boolean;
  };
  readonly scopes: {
    readonly requested: readonly string[];
    readonly accepted: readonly string[];
    readonly rejected: readonly string[];
  };
  readonly validity: {
    readonly issuedAt: number | null;
    readonly expiresAt: number | null;
    readonly ttlMs: number | null;
    readonly fresh: boolean;
  };
  readonly requestIdPresent: boolean;
  readonly decision: 'not-authorized';
  readonly authority: 'not-authorized';
}

export interface ServerObservationEvidence {
  readonly healthObserved: boolean;
  readonly claimsObserved: boolean;
  readonly claimsFresh: boolean;
  readonly severity: RuntimeObservationSeverity;
  readonly fallback: RuntimeFallbackState;
  readonly reasonCodes: readonly ServerObservationReasonCode[];
}

export interface ServerObservationEnvelope {
  readonly contractVersion: typeof SERVER_OBSERVATION_CONTRACT_VERSION;
  readonly source: 'server-observed';
  readonly health: ServerObservationHealth;
  readonly claims: ServerObservationClaims;
  readonly evidence: ServerObservationEvidence;
  readonly transport: {
    readonly originAllowed: boolean;
    readonly rateLimited: boolean;
  };
  readonly authority: 'not-authorized';
}

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return typeof value === 'object' && value !== null ? value as RecordValue : {};
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function boolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function finiteTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean))];
}

function healthStatus(value: unknown): 'healthy' | 'degraded' {
  return value === 'healthy' ? 'healthy' : 'degraded';
}

function healthSeverity(value: unknown): 'none' | 'warning' {
  return value === 'none' ? 'none' : 'warning';
}

function healthFallback(value: unknown): 'available' | 'degraded' {
  return value === 'available' ? 'available' : 'degraded';
}

function observationSeverity(value: unknown): RuntimeObservationSeverity {
  return value === 'none' || value === 'info' || value === 'warning' || value === 'critical'
    ? value
    : 'warning';
}

function observationFallback(value: unknown): RuntimeFallbackState {
  return value === 'available' || value === 'degraded' || value === 'blocked' || value === 'unknown'
    ? value
    : 'degraded';
}

function reasonCodes(value: unknown): ServerObservationReasonCode[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is ServerObservationReasonCode => (
    item === 'health-degraded'
      || item === 'claims-absent'
      || item === 'claims-stale'
      || item === 'rate-limited'
      || item === 'observation-ready'
  )))];
}

export function observeServerObservation(input: unknown): ServerObservationEnvelope {
  const root = record(input);
  const healthInput = record(root.health);
  const claimsInput = record(root.claims);
  const identityInput = record(claimsInput.identity);
  const scopesInput = record(claimsInput.scopes);
  const validityInput = record(claimsInput.validity);
  const evidenceInput = record(root.evidence);
  const transportInput = record(root.transport);

  const healthObserved = boolean(evidenceInput.healthObserved, healthInput.ok === true);
  const claimsObserved = boolean(evidenceInput.claimsObserved, boolean(identityInput.authenticated));
  const claimsFresh = boolean(evidenceInput.claimsFresh, boolean(validityInput.fresh));
  const rateLimited = boolean(transportInput.rateLimited);
  const originAllowed = boolean(transportInput.originAllowed);
  const projectedSeverity = observationSeverity(evidenceInput.severity);
  const projectedFallback = observationFallback(evidenceInput.fallback);
  const safeReasons = reasonCodes(evidenceInput.reasonCodes);

  return Object.freeze({
    contractVersion: SERVER_OBSERVATION_CONTRACT_VERSION,
    source: 'server-observed',
    health: Object.freeze({
      health: healthStatus(healthInput.health),
      severity: healthSeverity(healthInput.severity),
      fallback: healthFallback(healthInput.fallback),
      connection: 'connected',
      authority: 'not-authorized',
      ok: true,
      service: 'jarvis-backend',
      model: text(healthInput.model, 'unknown'),
      hasKey: boolean(healthInput.hasKey),
      detail: text(healthInput.detail, 'health observado'),
    }),
    claims: Object.freeze({
      identity: Object.freeze({
        authenticated: boolean(identityInput.authenticated),
        issuerPresent: boolean(identityInput.issuerPresent),
        subjectPresent: boolean(identityInput.subjectPresent),
        audienceMatched: boolean(identityInput.audienceMatched),
        trustedSource: boolean(identityInput.trustedSource),
      }),
      scopes: Object.freeze({
        requested: Object.freeze(stringList(scopesInput.requested)),
        accepted: Object.freeze(stringList(scopesInput.accepted)),
        rejected: Object.freeze(stringList(scopesInput.rejected)),
      }),
      validity: Object.freeze({
        issuedAt: finiteTimestamp(validityInput.issuedAt),
        expiresAt: finiteTimestamp(validityInput.expiresAt),
        ttlMs: finiteTimestamp(validityInput.ttlMs),
        fresh: claimsFresh,
      }),
      requestIdPresent: boolean(claimsInput.requestIdPresent),
      decision: 'not-authorized',
      authority: 'not-authorized',
    }),
    evidence: Object.freeze({
      healthObserved,
      claimsObserved,
      claimsFresh,
      severity: projectedSeverity,
      fallback: projectedFallback,
      reasonCodes: Object.freeze(safeReasons),
    }),
    transport: Object.freeze({ originAllowed, rateLimited }),
    authority: 'not-authorized',
  });
}

export function projectServerObservationToRuntime(
  observation: ServerObservationEnvelope | null | undefined,
): RuntimeObservation {
  if (!observation) {
    return {
      source: 'runtime-observed',
      connection: 'unknown',
      health: 'unknown',
      severity: 'info',
      fallback: 'unknown',
      authority: 'not-authorized',
      detail: 'server observation ausente',
    };
  }

  return {
    source: 'runtime-observed',
    connection: observation.health.connection,
    health: observation.evidence.fallback === 'blocked'
      ? 'failed'
      : observation.evidence.claimsFresh && observation.health.health === 'healthy'
        ? 'healthy'
        : 'degraded',
    severity: observation.evidence.severity,
    fallback: observation.evidence.fallback,
    authority: 'not-authorized',
    detail: observation.evidence.reasonCodes.join(',') || 'observation-ready',
  };
}
