export type DistributedStorageState = 'shared' | 'local-simulator' | 'unavailable';
export type DistributedFailureMode = 'closed' | 'none';
export type DistributedRateLimitDecision = 'allowed' | 'blocked' | 'simulated';

export interface SharedQuotaIncrement {
  readonly count: number;
  readonly limit: number;
  readonly resetAt: number;
  readonly storage: DistributedStorageState;
}

export interface SharedQuotaStore {
  readonly storage: DistributedStorageState;
  readonly increment: (
    windowKey: string,
    windowStart: number,
    limit: number,
    resetAt: number,
  ) => SharedQuotaIncrement;
  readonly isAvailable: () => boolean;
}

export interface DistributedRateLimitInput {
  readonly route: string;
  readonly namespace: string;
  readonly bucketMaterial: string;
  readonly limit: number;
  readonly windowSeconds: number;
  readonly nowMs: number;
  readonly store: SharedQuotaStore;
}

export interface DistributedRateLimitResult {
  readonly allowed: boolean;
  readonly decision: DistributedRateLimitDecision;
  readonly storage: DistributedStorageState;
  readonly failureMode: DistributedFailureMode;
  readonly count: number;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number | null;
  readonly retryAfter: number;
}

export interface DistributedRateLimitAuditEvent {
  readonly contractVersion: 'distributed-rate-limit/v1';
  readonly event: 'distributed_rate_limit_decision';
  readonly route: string;
  readonly namespace: string;
  readonly statusClass: '2xx' | '4xx' | '5xx';
  readonly storage: DistributedStorageState;
  readonly failureMode: DistributedFailureMode;
  readonly decision: DistributedRateLimitDecision;
  readonly rateLimited: boolean;
  readonly requestIdPresent: boolean;
}

interface LocalWindow {
  readonly windowStart: number;
  readonly count: number;
}

export class LocalQuotaSimulator implements SharedQuotaStore {
  public readonly storage = 'local-simulator' as const;
  private readonly windows = new Map<string, LocalWindow>();
  private available = true;

  public setAvailable(available: boolean): void {
    this.available = available;
  }

  public isAvailable(): boolean {
    return this.available;
  }

  public increment(
    windowKey: string,
    windowStart: number,
    limit: number,
    resetAt: number,
  ): SharedQuotaIncrement {
    if (!this.available) throw new Error('shared quota simulator unavailable');
    const previous = this.windows.get(windowKey);
    const count = previous?.windowStart === windowStart ? previous.count + 1 : 1;
    this.windows.set(windowKey, { windowStart, count });
    return { count, limit, resetAt, storage: this.storage };
  }
}

function boundedPositive(value: number, fallback: number, maximum: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(Math.trunc(value), maximum));
}

function blocked(
  storage: DistributedStorageState,
  limit: number,
): DistributedRateLimitResult {
  return {
    allowed: false,
    decision: 'blocked',
    storage,
    failureMode: 'closed',
    count: 0,
    limit,
    remaining: 0,
    resetAt: null,
    retryAfter: 0,
  };
}

export function evaluateDistributedRateLimit(
  input: DistributedRateLimitInput,
): DistributedRateLimitResult {
  const limit = boundedPositive(input.limit, 30, 1_000_000);
  const windowSeconds = boundedPositive(input.windowSeconds, 60, 86_400);
  const nowSeconds = Math.max(0, Math.trunc(input.nowMs / 1_000));
  const windowStart = nowSeconds - (nowSeconds % windowSeconds);
  const resetAt = (windowStart + windowSeconds) * 1_000;

  if (!input.store.isAvailable()) return blocked('unavailable', limit);

  const windowKey = `${input.namespace}\x00${input.route}\x00${input.bucketMaterial}`;
  try {
    const result = input.store.increment(windowKey, windowStart, limit, resetAt);
    const remaining = Math.max(0, result.limit - result.count);
    const allowed = result.count <= result.limit;
    return {
      allowed,
      decision: result.storage === 'local-simulator'
        ? 'simulated'
        : allowed ? 'allowed' : 'blocked',
      storage: result.storage,
      failureMode: 'none',
      count: result.count,
      limit: result.limit,
      remaining,
      resetAt: result.resetAt,
      retryAfter: allowed ? 0 : Math.max(1, Math.ceil((result.resetAt - input.nowMs) / 1_000)),
    };
  } catch {
    return blocked('unavailable', limit);
  }
}

export function buildDistributedRateLimitAudit(
  decision: DistributedRateLimitResult,
  input: Pick<DistributedRateLimitInput, 'route' | 'namespace'>,
  requestIdPresent: boolean,
): DistributedRateLimitAuditEvent {
  return {
    contractVersion: 'distributed-rate-limit/v1',
    event: 'distributed_rate_limit_decision',
    route: input.route,
    namespace: input.namespace,
    statusClass: decision.allowed ? '2xx' : decision.storage === 'unavailable' ? '5xx' : '4xx',
    storage: decision.storage,
    failureMode: decision.failureMode,
    decision: decision.decision,
    rateLimited: !decision.allowed,
    requestIdPresent,
  };
}
