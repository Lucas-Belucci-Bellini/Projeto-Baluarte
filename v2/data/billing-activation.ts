import type { BillingReadConfig } from './billing-config.js';

export type BillingActivationCheck =
  | 'staging-environment'
  | 'approved-project-host'
  | 'server-side-secrets'
  | 'rls-reviewed'
  | 'observability-reviewed'
  | 'rollback-documented'
  | 'writes-disabled'
  | 'connector-explicit';

export interface BillingStagingActivationInput {
  readonly config: BillingReadConfig;
  readonly approvedProjectHost: string;
  readonly secretsSource: 'server-env' | 'secret-manager';
  readonly rlsReviewed: boolean;
  readonly observabilityReviewed: boolean;
  readonly rollbackDocumented: boolean;
  readonly writesEnabled: boolean;
  readonly connectorExplicitlyApproved: boolean;
}

export interface BillingStagingActivationResult {
  readonly allowed: boolean;
  readonly checks: Readonly<Record<BillingActivationCheck, boolean>>;
  readonly failedChecks: readonly BillingActivationCheck[];
}

function normalizedHost(value: string, field: string): string {
  const host = value.trim().toLowerCase();
  if (!host || host.includes('/') || host.includes(':')) throw new TypeError(`${field} deve ser hostname sem porta`);
  return host;
}

export function validateBillingStagingActivation(input: BillingStagingActivationInput): BillingStagingActivationResult {
  const approvedHost = normalizedHost(input.approvedProjectHost, 'approvedProjectHost');
  const configHost = new URL(input.config.baseUrl).hostname.toLowerCase();
  const checks: Record<BillingActivationCheck, boolean> = {
    'staging-environment': input.config.environment === 'staging',
    'approved-project-host': configHost === approvedHost,
    'server-side-secrets': input.secretsSource === 'server-env' || input.secretsSource === 'secret-manager',
    'rls-reviewed': input.rlsReviewed,
    'observability-reviewed': input.observabilityReviewed,
    'rollback-documented': input.rollbackDocumented,
    'writes-disabled': input.writesEnabled === false,
    'connector-explicit': input.connectorExplicitlyApproved,
  };
  const failedChecks = (Object.entries(checks) as Array<[BillingActivationCheck, boolean]>)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);
  return Object.freeze({
    allowed: failedChecks.length === 0,
    checks: Object.freeze(checks),
    failedChecks: Object.freeze(failedChecks),
  });
}

export function assertBillingStagingActivation(input: BillingStagingActivationInput): void {
  const result = validateBillingStagingActivation(input);
  if (!result.allowed) {
    throw new Error(`billing staging bloqueado: ${result.failedChecks.join(', ')}`);
  }
}
