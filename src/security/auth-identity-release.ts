import type { ServerClaimsObservation } from '../layout/server-claims-observation';

export const AUTH_IDENTITY_RELEASE_CONTRACT_VERSION = 'auth-identity-release/v1' as const;

export type IdentityRole = 'user' | 'admin' | 'dev' | 'owner' | 'unknown';
export type IdentityModuleMode =
  | 'healthy'
  | 'degraded'
  | 'quarantined'
  | 'maintenance'
  | 'disabled'
  | 'unregistered';

export type IdentityReleaseProjection = 'normal-surface' | 'elevated-review-only' | 'disabled';

export type IdentityReleaseReason =
  | 'claims-missing'
  | 'claims-untrusted'
  | 'claims-stale'
  | 'subject-missing'
  | 'role-source-invalid'
  | 'role-unknown'
  | 'user-metadata-ignored'
  | 'module-mode-unknown'
  | 'module-degraded'
  | 'module-read-scope-missing'
  | 'user-module-disabled';

export interface IdentityRoleEvidence {
  readonly role?: unknown;
  readonly source?: unknown;
  readonly userMetadataRole?: unknown;
}

export interface IdentityModuleInput {
  readonly mode?: unknown;
}

export interface IdentityReleaseProjectionResult {
  readonly contractVersion: typeof AUTH_IDENTITY_RELEASE_CONTRACT_VERSION;
  readonly projection: IdentityReleaseProjection;
  readonly role: IdentityRole;
  readonly moduleMode: IdentityModuleMode;
  readonly reasons: readonly IdentityReleaseReason[];
  readonly decision: 'not-authorized';
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

const ELEVATED_ROLES = new Set<IdentityRole>(['admin', 'dev', 'owner']);
const KNOWN_ROLES = new Set<IdentityRole>(['user', 'admin', 'dev', 'owner']);
const KNOWN_MODES = new Set<IdentityModuleMode>([
  'healthy',
  'degraded',
  'quarantined',
  'maintenance',
  'disabled',
  'unregistered',
]);

function uniqueReasons(reasons: readonly IdentityReleaseReason[]): IdentityReleaseReason[] {
  return [...new Set(reasons)];
}

function normalizeRole(evidence: IdentityRoleEvidence | null | undefined, reasons: IdentityReleaseReason[]): IdentityRole {
  if (!evidence || evidence.source !== 'server-app_metadata') {
    reasons.push('role-source-invalid');
    if (evidence?.source === 'user_metadata' || evidence?.userMetadataRole !== undefined) {
      reasons.push('user-metadata-ignored');
    }
    return 'unknown';
  }
  if (typeof evidence.role !== 'string' || !KNOWN_ROLES.has(evidence.role as IdentityRole)) {
    reasons.push('role-unknown');
    return 'unknown';
  }
  return evidence.role as IdentityRole;
}

function normalizeModuleMode(value: unknown, reasons: IdentityReleaseReason[]): IdentityModuleMode {
  if (typeof value === 'string' && KNOWN_MODES.has(value as IdentityModuleMode)) {
    return value as IdentityModuleMode;
  }
  reasons.push('module-mode-unknown');
  return 'disabled';
}

function claimsAreReady(claims: ServerClaimsObservation | null | undefined, reasons: IdentityReleaseReason[]): boolean {
  if (!claims) {
    reasons.push('claims-missing');
    return false;
  }
  let ready = true;
  if (!claims.identity.trustedSource) {
    reasons.push('claims-untrusted');
    ready = false;
  }
  if (!claims.identity.issuerMatched || !claims.identity.audienceMatched) {
    reasons.push('claims-untrusted');
    ready = false;
  }
  if (!claims.identity.authenticated) {
    reasons.push('claims-untrusted');
    ready = false;
  }
  if (!claims.identity.subjectPresent) {
    reasons.push('subject-missing');
    ready = false;
  }
  if (!claims.validity.fresh) {
    reasons.push('claims-stale');
    ready = false;
  }
  return ready;
}

export function projectIdentityRelease(
  claims: ServerClaimsObservation | null | undefined,
  roleEvidence: IdentityRoleEvidence | null | undefined,
  module: IdentityModuleInput | null | undefined,
): IdentityReleaseProjectionResult {
  const reasons: IdentityReleaseReason[] = [];
  const role = normalizeRole(roleEvidence, reasons);
  const moduleMode = normalizeModuleMode(module?.mode, reasons);
  const identityReady = claimsAreReady(claims, reasons);
  const healthy = moduleMode === 'healthy';

  if (!healthy) {
    reasons.push('module-degraded');
  }

  let projection: IdentityReleaseProjection = 'disabled';
  if (identityReady && role !== 'unknown' && healthy) {
    projection = 'normal-surface';
  } else if (identityReady && ELEVATED_ROLES.has(role) && !healthy) {
    const hasModuleRead = claims?.scopes.accepted.includes('module:read') === true;
    if (hasModuleRead) {
      projection = 'elevated-review-only';
    } else {
      reasons.push('module-read-scope-missing');
    }
  } else if (!healthy && role === 'user') {
    reasons.push('user-module-disabled');
  }

  return Object.freeze({
    contractVersion: AUTH_IDENTITY_RELEASE_CONTRACT_VERSION,
    projection,
    role,
    moduleMode,
    reasons: Object.freeze(uniqueReasons(reasons)),
    decision: 'not-authorized',
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}
