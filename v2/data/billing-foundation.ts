import type { LimitValue, Plan, PlanResolution } from './billing.js';

export type BillingPreflightReason =
  | 'allowed'
  | 'plan-unavailable'
  | 'entitlement-missing'
  | 'limit-missing'
  | 'limit-exceeded'
  | 'invalid-input'
  | 'invalid-limit';

export interface BillingPreflightInput {
  readonly plan: Plan | null;
  readonly feature: string;
  readonly requiredEntitlement?: string | null;
  readonly consumed: number;
  readonly requested: number;
}

export interface BillingPreflightResult {
  readonly allowed: boolean;
  readonly reason: BillingPreflightReason;
  readonly planId: string | null;
  readonly planVersion: number | null;
  readonly feature: string;
  readonly consumed: number;
  readonly requested: number;
  readonly projected: number;
  readonly limit: LimitValue | null;
  readonly requiredEntitlement: string | null;
}

const MAX_QUANTITY = 1_000_000_000;

function normalizedLabel(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function boundedQuantity(value: number): number | null {
  if (!Number.isFinite(value) || value < 0 || value > MAX_QUANTITY) return null;
  return value;
}

function displayQuantity(value: number): number {
  return boundedQuantity(value) ?? 0;
}

function baseResult(
  input: BillingPreflightInput,
  reason: BillingPreflightReason,
  allowed: boolean,
  limit: LimitValue | null,
  feature: string,
  requiredEntitlement: string | null,
): BillingPreflightResult {
  const consumed = displayQuantity(input.consumed);
  const requested = displayQuantity(input.requested);
  return Object.freeze({
    allowed,
    reason,
    planId: input.plan?.id ?? null,
    planVersion: input.plan?.version ?? null,
    feature,
    consumed,
    requested,
    projected: consumed + requested,
    limit,
    requiredEntitlement,
  });
}

export function evaluateBillingPreflight(input: BillingPreflightInput): BillingPreflightResult {
  const feature = normalizedLabel(input.feature);
  const requiredEntitlement = normalizedLabel(input.requiredEntitlement);
  const consumed = boundedQuantity(input.consumed);
  const requested = boundedQuantity(input.requested);

  if (!feature || consumed === null || requested === null) {
    return baseResult(input, 'invalid-input', false, null, feature ?? '', requiredEntitlement);
  }

  if (!input.plan || input.plan.status !== 'active') {
    return baseResult(input, 'plan-unavailable', false, null, feature, requiredEntitlement);
  }

  if (requiredEntitlement && !input.plan.entitlements.includes(requiredEntitlement)) {
    return baseResult(input, 'entitlement-missing', false, null, feature, requiredEntitlement);
  }

  const limit = input.plan.limits[feature] ?? null;
  if (!limit) {
    return baseResult(input, 'limit-missing', false, null, feature, requiredEntitlement);
  }

  if (limit.kind === 'unlimited') {
    return baseResult(input, 'allowed', true, limit, feature, requiredEntitlement);
  }

  if (!Number.isFinite(limit.value) || limit.value < 0 || limit.value > MAX_QUANTITY) {
    return baseResult(input, 'invalid-limit', false, limit, feature, requiredEntitlement);
  }

  const projected = consumed + requested;
  return baseResult(
    input,
    projected <= limit.value ? 'allowed' : 'limit-exceeded',
    projected <= limit.value,
    limit,
    feature,
    requiredEntitlement,
  );
}

export function preflightFromResolution(
  resolution: PlanResolution,
  input: Omit<BillingPreflightInput, 'plan'>,
): BillingPreflightResult {
  return evaluateBillingPreflight({ ...input, plan: resolution.plan });
}

export type BillingMutationOperation = 'append-usage';
export type BillingMutationOutcome = 'committed' | 'replayed' | 'rejected';
export type BillingMutationStatusClass = '2xx' | '4xx' | '5xx';
export type BillingMutationAuditReason =
  | BillingPreflightReason
  | 'replayed'
  | 'idempotency-conflict'
  | 'duplicate-resource'
  | 'membership-required'
  | 'account-mismatch'
  | 'plan-not-found'
  | 'invalid-state';

export interface BillingMutationAuditEvent {
  readonly contractVersion: 'billing-mutation/v1';
  readonly operation: BillingMutationOperation;
  readonly outcome: BillingMutationOutcome;
  readonly reason: BillingMutationAuditReason;
  readonly statusClass: BillingMutationStatusClass;
  readonly requestedQuantity: number;
  readonly requestIdPresent: boolean;
}

export interface BillingMutationAuditInput {
  readonly operation: BillingMutationOperation;
  readonly outcome: BillingMutationOutcome;
  readonly reason: BillingMutationAuditReason;
  readonly statusClass: BillingMutationStatusClass;
  readonly requestedQuantity: number;
  readonly requestIdPresent: boolean;
}

function boundedAuditQuantity(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value * 1_000) / 1_000, MAX_QUANTITY);
}

export function buildBillingMutationAudit(
  input: BillingMutationAuditInput,
): BillingMutationAuditEvent {
  return Object.freeze({
    contractVersion: 'billing-mutation/v1',
    operation: input.operation,
    outcome: input.outcome,
    reason: input.reason,
    statusClass: input.statusClass,
    requestedQuantity: boundedAuditQuantity(input.requestedQuantity),
    requestIdPresent: input.requestIdPresent === true,
  });
}

export interface BillingMutationObserver {
  observe(event: BillingMutationAuditEvent): void;
}

export const NOOP_BILLING_MUTATION_OBSERVER: BillingMutationObserver = Object.freeze({
  observe() {},
});
