import type { ServerClaimsObservation } from './server-claims-observation';

export type ModuleOperationalButton = 'enabled' | 'disabled';
export type ModuleElevatedReview = 'unavailable' | 'review-only';
export type ModuleOperationalReason =
  | 'module-healthy'
  | 'module-degraded'
  | 'module-quarantined'
  | 'module-maintenance'
  | 'module-disabled'
  | 'module-unregistered'
  | 'module-not-ready'
  | 'claims-missing'
  | 'claims-stale'
  | 'claims-untrusted'
  | 'module-read-scope-missing'
  | 'review-only-observation';

export type ModuleOperationalMode =
  | 'registered'
  | 'healthy'
  | 'degraded'
  | 'quarantined'
  | 'maintenance'
  | 'disabled'
  | 'unregistered';

export type ModuleOperationalStatus =
  | 'unknown'
  | 'healthy'
  | 'failed'
  | 'exhausted'
  | 'unregistered';

export interface ModuleRegistryHealthEntry {
  readonly id: string;
  readonly mode: ModuleOperationalMode;
  readonly status: ModuleOperationalStatus;
  readonly restarts: number;
  readonly podeReiniciar: boolean;
}

export interface ModuleOperationalInput {
  readonly moduleId: string;
  readonly health?: ModuleRegistryHealthEntry | null;
  readonly claims?: ServerClaimsObservation | null;
}

export interface ModuleOperationalDecision {
  readonly moduleId: string;
  readonly button: ModuleOperationalButton;
  readonly normalUserAction: 'preserve-current-surface';
  readonly fallback: 'v1-preserved';
  readonly elevatedReview: ModuleElevatedReview;
  readonly reasons: readonly ModuleOperationalReason[];
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

function moduleId(value: string): string {
  const normalized = value.trim();
  return normalized || 'unknown-module';
}

function healthReason(
  health: ModuleRegistryHealthEntry | null | undefined,
): ModuleOperationalReason {
  if (!health) return 'module-not-ready';
  switch (health.mode) {
    case 'healthy':
      return health.status === 'healthy' ? 'module-healthy' : 'module-not-ready';
    case 'degraded':
      return 'module-degraded';
    case 'quarantined':
      return 'module-quarantined';
    case 'maintenance':
      return 'module-maintenance';
    case 'disabled':
      return 'module-disabled';
    case 'unregistered':
      return 'module-unregistered';
    case 'registered':
      return 'module-not-ready';
  }
}

function claimsReasons(
  claims: ServerClaimsObservation | null | undefined,
): { reasons: ModuleOperationalReason[]; review: ModuleElevatedReview } {
  if (!claims) return { reasons: ['claims-missing'], review: 'unavailable' };
  const reasons: ModuleOperationalReason[] = [];
  if (!claims.identity.trustedSource) reasons.push('claims-untrusted');
  if (!claims.identity.authenticated || !claims.validity.fresh) reasons.push('claims-stale');
  const hasModuleRead = claims.scopes.accepted.includes('module:read');
  if (!hasModuleRead) reasons.push('module-read-scope-missing');
  if (claims.identity.trustedSource && claims.identity.authenticated && claims.validity.fresh && hasModuleRead) {
    reasons.push('review-only-observation');
    return { reasons, review: 'review-only' };
  }
  return { reasons, review: 'unavailable' };
}

export function projectModuleOperationalPolicy(
  input: ModuleOperationalInput,
): ModuleOperationalDecision {
  const id = moduleId(input.moduleId);
  const health = healthReason(input.health);
  const claims = claimsReasons(input.claims);
  const healthy = health === 'module-healthy'
    && input.health?.mode === 'healthy'
    && input.health.status === 'healthy';
  return Object.freeze({
    moduleId: id,
    button: healthy ? 'enabled' : 'disabled',
    normalUserAction: 'preserve-current-surface',
    fallback: 'v1-preserved',
    elevatedReview: claims.review,
    reasons: Object.freeze([...new Set([health, ...claims.reasons])]),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}

export function projectModuleOperationalPolicyMap(
  inputs: readonly ModuleOperationalInput[],
): readonly ModuleOperationalDecision[] {
  return Object.freeze(inputs.map(projectModuleOperationalPolicy));
}
