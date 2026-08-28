export const SERVER_CLAIMS_OBSERVATION_CONTRACT_VERSION = 'claims-observation/v1' as const;
export const SERVER_VALIDATED_CLAIMS_SOURCE = 'server-validated' as const;
export const MAX_SERVER_CLAIMS_TTL_MS = 60_000;

export const KNOWN_SERVER_CLAIM_SCOPES = Object.freeze([
  'platform:observe',
  'registry:read',
  'module:read',
] as const);

export type KnownServerClaimScope = (typeof KNOWN_SERVER_CLAIM_SCOPES)[number];

export interface ServerClaimsInput {
  readonly issuer?: unknown;
  readonly subject?: unknown;
  readonly audience?: unknown;
  readonly scopes?: unknown;
  readonly issuedAt?: unknown;
  readonly expiresAt?: unknown;
  readonly requestId?: unknown;
  readonly source?: unknown;
  readonly authenticated?: unknown;
}

export interface ServerClaimsObservation {
  readonly contractVersion: typeof SERVER_CLAIMS_OBSERVATION_CONTRACT_VERSION;
  readonly source: 'server-authority-projection';
  readonly identity: {
    readonly issuerPresent: boolean;
    readonly issuerMatched: boolean;
    readonly subjectPresent: boolean;
    readonly audienceMatched: boolean;
    readonly authenticated: boolean;
    readonly trustedSource: boolean;
  };
  readonly scopes: {
    readonly requested: readonly string[];
    readonly accepted: readonly KnownServerClaimScope[];
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

export interface ServerClaimsObservationOptions {
  readonly expectedIssuer?: string;
  readonly expectedAudience?: string;
  readonly nowMs?: number;
  readonly allowedScopes?: readonly KnownServerClaimScope[];
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function timestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean))];
}

function resolveAllowedScopes(
  scopes: readonly string[],
  allowedScopes: readonly KnownServerClaimScope[],
): KnownServerClaimScope[] {
  return scopes.filter(
    (scope): scope is KnownServerClaimScope => allowedScopes.includes(scope as KnownServerClaimScope),
  );
}

export function observeServerClaims(
  input: ServerClaimsInput | null | undefined,
  options: ServerClaimsObservationOptions = {},
): ServerClaimsObservation {
  const claims = input ?? {};
  const issuer = text(claims.issuer);
  const subject = text(claims.subject);
  const audience = text(claims.audience);
  const requested = stringList(claims.scopes);
  const issuedAt = timestamp(claims.issuedAt);
  const expiresAt = timestamp(claims.expiresAt);
  const nowMs = options.nowMs ?? Date.now();
  const expectedIssuer = text(options.expectedIssuer);
  const expectedAudience = text(options.expectedAudience);
  const allowedScopes = options.allowedScopes ?? KNOWN_SERVER_CLAIM_SCOPES;
  const trustedSource = claims.source === SERVER_VALIDATED_CLAIMS_SOURCE;
  const issuerMatches = expectedIssuer === null ? issuer !== null : issuer === expectedIssuer;
  const audienceMatched = expectedAudience === null ? audience !== null : audience === expectedAudience;
  const authenticated = claims.authenticated === true;
  const ttlMs = issuedAt !== null && expiresAt !== null ? expiresAt - issuedAt : null;
  const fresh = Number.isInteger(nowMs)
    && nowMs >= 0
    && issuedAt !== null
    && expiresAt !== null
    && expiresAt > issuedAt
    && ttlMs !== null
    && ttlMs <= MAX_SERVER_CLAIMS_TTL_MS
    && nowMs >= issuedAt
    && nowMs < expiresAt;
  const identityReady = trustedSource && authenticated && issuerMatches && audienceMatched && subject !== null && fresh;
  const accepted = identityReady ? resolveAllowedScopes(requested, allowedScopes) : [];
  const acceptedSet = new Set(accepted);

  return Object.freeze({
    contractVersion: SERVER_CLAIMS_OBSERVATION_CONTRACT_VERSION,
    source: 'server-authority-projection',
    identity: Object.freeze({
    issuerPresent: issuer !== null,
    issuerMatched: issuerMatches,
    subjectPresent: subject !== null,
      audienceMatched,
      authenticated,
      trustedSource,
    }),
    scopes: Object.freeze({
      requested: Object.freeze(requested),
      accepted: Object.freeze(accepted),
      rejected: Object.freeze(requested.filter((scope) => !acceptedSet.has(scope as KnownServerClaimScope))),
    }),
    validity: Object.freeze({ issuedAt, expiresAt, ttlMs, fresh }),
    requestIdPresent: text(claims.requestId) !== null,
    decision: 'not-authorized',
    authority: 'not-authorized',
  });
}
