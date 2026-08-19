export type BillingCurrency = 'BRL' | 'USD' | 'EUR';
export type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'custom';
export type PlanStatus = 'draft' | 'active' | 'archived' | 'retired';
export type UnlimitedLimit = { readonly kind: 'unlimited' };
export type FiniteLimit = { readonly kind: 'finite'; readonly value: number };
export type LimitValue = UnlimitedLimit | FiniteLimit;

export interface Plan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: PlanStatus;
  readonly currency: BillingCurrency;
  readonly billingPeriod: BillingPeriod;
  readonly priceMinor: number;
  readonly trialDays: number;
  readonly entitlements: readonly string[];
  readonly limits: Readonly<Record<string, LimitValue>>;
  readonly features: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
  readonly version: number;
}

export interface UsageEvent {
  readonly id: string;
  readonly idempotencyKey: string;
  readonly accountId: string;
  readonly workspaceId: string;
  readonly feature: string;
  readonly quantity: number;
  readonly timestamp: string;
  readonly source: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface UsageDecision {
  readonly allowed: boolean;
  readonly reason: 'within-limit' | 'unlimited' | 'limit-exceeded' | 'missing-limit';
  readonly consumed: number;
  readonly limit: LimitValue | null;
}

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

function nonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${field} deve ser finito e não negativo`);
  return value;
}

export function normalizePlan(plan: Plan): Plan {
  const normalized: Plan = {
    ...plan,
    id: required(plan.id, 'plan.id'),
    name: required(plan.name, 'plan.name'),
    description: plan.description.trim(),
    priceMinor: nonNegative(plan.priceMinor, 'plan.priceMinor'),
    trialDays: nonNegative(plan.trialDays, 'plan.trialDays'),
    entitlements: [...new Set(plan.entitlements.map((item) => required(item, 'entitlement')))],
    features: [...new Set(plan.features.map((item) => required(item, 'feature')))],
    metadata: Object.freeze({ ...plan.metadata }),
    limits: Object.freeze({ ...plan.limits }),
  };
  return Object.freeze(normalized);
}

export function hasEntitlement(plan: Plan, entitlement: string): boolean {
  return plan.entitlements.includes(required(entitlement, 'entitlement'));
}

export function decideUsage(plan: Plan, feature: string, consumed: number, requested: number): UsageDecision {
  const key = required(feature, 'feature');
  const current = nonNegative(consumed, 'consumed');
  const amount = nonNegative(requested, 'requested');
  const limit = plan.limits[key] ?? null;
  if (!limit) return { allowed: false, reason: 'missing-limit', consumed: current, limit };
  if (limit.kind === 'unlimited') return { allowed: true, reason: 'unlimited', consumed: current, limit };
  const allowed = current + amount <= limit.value;
  return { allowed, reason: allowed ? 'within-limit' : 'limit-exceeded', consumed: current, limit };
}

export class UsageLedger {
  private readonly events: UsageEvent[] = [];
  private readonly byIdempotency = new Map<string, UsageEvent>();

  append(event: UsageEvent): UsageEvent {
    const idempotencyKey = required(event.idempotencyKey, 'usage.idempotencyKey');
    const existing = this.byIdempotency.get(idempotencyKey);
    if (existing) return existing;
    const normalized: UsageEvent = Object.freeze({
      ...event,
      id: required(event.id, 'usage.id'),
      accountId: required(event.accountId, 'usage.accountId'),
      workspaceId: required(event.workspaceId, 'usage.workspaceId'),
      feature: required(event.feature, 'usage.feature'),
      source: required(event.source, 'usage.source'),
      quantity: nonNegative(event.quantity, 'usage.quantity'),
      timestamp: required(event.timestamp, 'usage.timestamp'),
      metadata: Object.freeze({ ...event.metadata }),
    });
    if (this.events.some((item) => item.id === normalized.id)) throw new Error(`usage.id duplicado: ${normalized.id}`);
    this.events.push(normalized);
    this.byIdempotency.set(idempotencyKey, normalized);
    return normalized;
  }

  list(): readonly UsageEvent[] {
    return Object.freeze([...this.events]);
  }

  total(accountId: string, workspaceId: string, feature: string): number {
    return this.events
      .filter((event) => event.accountId === accountId && event.workspaceId === workspaceId && event.feature === feature)
      .reduce((sum, event) => sum + event.quantity, 0);
  }
}
