import type { BillingPersistenceErrorCode } from './billing-driver.js';

export type BillingReadOperation = 'getWorkspace' | 'resolvePlan' | 'listUsage';
export type BillingReadOutcome = 'success' | 'error';

export interface BillingReadObservation {
  readonly operation: BillingReadOperation;
  readonly outcome: BillingReadOutcome;
  readonly durationMs: number;
  readonly errorCode?: BillingPersistenceErrorCode;
  readonly upstreamStatus?: number;
}

export interface BillingReadObserver {
  observe(observation: BillingReadObservation): void;
}

export interface BillingReadMetricSnapshot {
  readonly operation: BillingReadOperation;
  readonly success: number;
  readonly errors: number;
  readonly retryableErrors: number;
  readonly errorCodes: Readonly<Record<string, number>>;
  readonly totalDurationMs: number;
}

const OPERATIONS: readonly BillingReadOperation[] = ['getWorkspace', 'resolvePlan', 'listUsage'];

function emptyMetric(operation: BillingReadOperation): BillingReadMetricSnapshot {
  return Object.freeze({
    operation,
    success: 0,
    errors: 0,
    retryableErrors: 0,
    errorCodes: Object.freeze({}),
    totalDurationMs: 0,
  });
}

function boundedDuration(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), 86_400_000);
}

export class BillingReadMetrics implements BillingReadObserver {
  private readonly metrics = new Map<BillingReadOperation, {
    success: number;
    errors: number;
    retryableErrors: number;
    errorCodes: Map<string, number>;
    totalDurationMs: number;
  }>();

  constructor() {
    for (const operation of OPERATIONS) {
      this.metrics.set(operation, { success: 0, errors: 0, retryableErrors: 0, errorCodes: new Map(), totalDurationMs: 0 });
    }
  }

  observe(observation: BillingReadObservation): void {
    const metric = this.metrics.get(observation.operation);
    if (!metric) return;
    metric.totalDurationMs += boundedDuration(observation.durationMs);
    if (observation.outcome === 'success') {
      metric.success += 1;
      return;
    }
    metric.errors += 1;
    if (observation.errorCode) {
      metric.errorCodes.set(observation.errorCode, (metric.errorCodes.get(observation.errorCode) ?? 0) + 1);
      if (observation.errorCode === 'UPSTREAM_TIMEOUT' || observation.errorCode === 'UPSTREAM_UNAVAILABLE') {
        metric.retryableErrors += 1;
      }
    }
  }

  snapshot(): readonly BillingReadMetricSnapshot[] {
    return Object.freeze(OPERATIONS.map((operation) => {
      const metric = this.metrics.get(operation);
      if (!metric) return emptyMetric(operation);
      return Object.freeze({
        operation,
        success: metric.success,
        errors: metric.errors,
        retryableErrors: metric.retryableErrors,
        errorCodes: Object.freeze(Object.fromEntries(metric.errorCodes.entries())),
        totalDurationMs: metric.totalDurationMs,
      });
    }));
  }
}

export const NOOP_BILLING_READ_OBSERVER: BillingReadObserver = Object.freeze({
  observe() {},
});
