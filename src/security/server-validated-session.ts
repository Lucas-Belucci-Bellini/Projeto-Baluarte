import {
  KNOWN_SERVER_CLAIM_SCOPES,
  type KnownServerClaimScope,
} from '../layout/server-claims-observation';
import {
  observeServerObservation,
  type ServerObservationEnvelope,
} from '../layout/server-observation';

export const SERVER_VALIDATED_SESSION_CONTRACT_VERSION = 'server-validated-session/v1' as const;

export type ServerValidatedSessionState =
  | 'authenticated'
  | 'anonymous'
  | 'stale'
  | 'degraded'
  | 'unavailable';

export type ServerValidatedSessionReason =
  | 'observation-unavailable'
  | 'authority-mismatch'
  | 'claims-unobserved'
  | 'claims-stale'
  | 'health-degraded'
  | 'fallback-degraded'
  | 'fallback-blocked'
  | 'rate-limited'
  | 'anonymous-identity'
  | 'session-observed';

export interface ServerValidatedSessionProjection {
  readonly contractVersion: typeof SERVER_VALIDATED_SESSION_CONTRACT_VERSION;
  readonly state: ServerValidatedSessionState;
  readonly claimsObserved: boolean;
  readonly claimsFresh: boolean;
  readonly authenticated: boolean;
  readonly health: 'healthy' | 'degraded' | 'unknown';
  readonly fallback: 'available' | 'degraded' | 'blocked' | 'unknown';
  readonly acceptedScopes: readonly KnownServerClaimScope[];
  readonly rejectedScopes: readonly KnownServerClaimScope[];
  readonly reasonCodes: readonly ServerValidatedSessionReason[];
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue | null {
  return typeof value === 'object' && value !== null ? value as RecordValue : null;
}

function hasObservationEnvelope(value: unknown): value is RecordValue {
  const root = record(value);
  return root?.contractVersion === 'server-observation/v1'
    && root.source === 'server-observed';
}

function knownScopes(scopes: readonly string[]): KnownServerClaimScope[] {
  return [...new Set(scopes.filter(
    (scope): scope is KnownServerClaimScope => KNOWN_SERVER_CLAIM_SCOPES.includes(scope as KnownServerClaimScope),
  ))];
}

function uniqueReasons(reasons: readonly ServerValidatedSessionReason[]): ServerValidatedSessionReason[] {
  return [...new Set(reasons)];
}

function unavailable(
  reason: ServerValidatedSessionReason,
): ServerValidatedSessionProjection {
  return Object.freeze({
    contractVersion: SERVER_VALIDATED_SESSION_CONTRACT_VERSION,
    state: 'unavailable',
    claimsObserved: false,
    claimsFresh: false,
    authenticated: false,
    health: 'unknown',
    fallback: 'unknown',
    acceptedScopes: Object.freeze([]),
    rejectedScopes: Object.freeze([]),
    reasonCodes: Object.freeze([reason]),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}

function projectObservation(
  observation: ServerObservationEnvelope,
): ServerValidatedSessionProjection {
  const reasons: ServerValidatedSessionReason[] = [];
  const claimsObserved = observation.evidence.claimsObserved;
  const claimsFresh = observation.evidence.claimsFresh;
  const authenticated = observation.claims.identity.authenticated;
  const rateLimited = observation.transport.rateLimited;
  const blocked = observation.evidence.fallback === 'blocked';
  const healthDegraded = observation.health.health !== 'healthy';
  const fallbackDegraded = observation.evidence.fallback === 'degraded';

  if (rateLimited) reasons.push('rate-limited');
  if (!claimsObserved) reasons.push('claims-unobserved');
  if (claimsObserved && !claimsFresh) reasons.push('claims-stale');
  if (healthDegraded) reasons.push('health-degraded');
  if (fallbackDegraded) reasons.push('fallback-degraded');
  if (blocked) reasons.push('fallback-blocked');
  if (!authenticated && claimsObserved) reasons.push('anonymous-identity');

  let state: ServerValidatedSessionState = 'unavailable';
  if (rateLimited || blocked || !claimsObserved) {
    state = 'unavailable';
  } else if (!claimsFresh) {
    state = 'stale';
  } else if (!authenticated) {
    state = 'anonymous';
  } else if (healthDegraded || fallbackDegraded) {
    state = 'degraded';
  } else {
    state = 'authenticated';
    reasons.push('session-observed');
  }

  return Object.freeze({
    contractVersion: SERVER_VALIDATED_SESSION_CONTRACT_VERSION,
    state,
    claimsObserved,
    claimsFresh,
    authenticated,
    health: observation.health.health,
    fallback: observation.evidence.fallback,
    acceptedScopes: Object.freeze(knownScopes(observation.claims.scopes.accepted)),
    rejectedScopes: Object.freeze(knownScopes(observation.claims.scopes.rejected)),
    reasonCodes: Object.freeze(uniqueReasons(reasons)),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}

export function projectServerValidatedSession(
  input: unknown,
): ServerValidatedSessionProjection {
  if (!hasObservationEnvelope(input)) return unavailable('observation-unavailable');
  if (record(input)?.authority !== 'not-authorized') return unavailable('authority-mismatch');
  const observation = observeServerObservation(input);
  return projectObservation(observation);
}
