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

export type PlanAssignmentStatus = 'active' | 'scheduled' | 'revoked';

export interface PlanAssignment {
  readonly id: string;
  readonly accountId: string;
  readonly workspaceId: string;
  readonly planId: string;
  readonly planVersion: number;
  readonly status: PlanAssignmentStatus;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly assignedAt: string;
  readonly source: string;
}

export interface PlanResolution {
  readonly accountId: string;
  readonly workspaceId: string;
  readonly plan: Plan | null;
  readonly assignment: PlanAssignment | null;
  readonly reason: 'resolved' | 'no-assignment' | 'plan-unavailable';
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

function isoDate(value: string, field: string): string {
  const normalized = required(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) throw new TypeError(`${field} deve ser uma data ISO válida`);
  return new Date(timestamp).toISOString();
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

export function normalizePlanAssignment(assignment: PlanAssignment): PlanAssignment {
  const effectiveFrom = isoDate(assignment.effectiveFrom, 'assignment.effectiveFrom');
  const effectiveTo = assignment.effectiveTo ? isoDate(assignment.effectiveTo, 'assignment.effectiveTo') : undefined;
  if (effectiveTo && Date.parse(effectiveTo) <= Date.parse(effectiveFrom)) {
    throw new RangeError('assignment.effectiveTo deve ser posterior a effectiveFrom');
  }
  return Object.freeze({
    ...assignment,
    id: required(assignment.id, 'assignment.id'),
    accountId: required(assignment.accountId, 'assignment.accountId'),
    workspaceId: required(assignment.workspaceId, 'assignment.workspaceId'),
    planId: required(assignment.planId, 'assignment.planId'),
    planVersion: Number.isInteger(assignment.planVersion) && assignment.planVersion > 0
      ? assignment.planVersion
      : (() => { throw new RangeError('assignment.planVersion deve ser inteiro positivo'); })(),
    effectiveFrom,
    ...(effectiveTo ? { effectiveTo } : {}),
    assignedAt: isoDate(assignment.assignedAt, 'assignment.assignedAt'),
    source: required(assignment.source, 'assignment.source'),
  });
}

export class BillingCatalog {
  private readonly plans = new Map<string, Plan>();
  private readonly assignments = new Map<string, PlanAssignment>();

  registerPlan(plan: Plan): Plan {
    const normalized = normalizePlan(plan);
    const existing = this.plans.get(normalized.id);
    if (existing && normalized.version <= existing.version) {
      throw new Error(`plan.version deve avançar para ${normalized.id}`);
    }
    this.plans.set(normalized.id, normalized);
    return normalized;
  }

  assignPlan(assignment: PlanAssignment): PlanAssignment {
    const normalized = normalizePlanAssignment(assignment);
    if (this.assignments.has(normalized.id)) throw new Error(`assignment.id duplicado: ${normalized.id}`);
    this.assignments.set(normalized.id, normalized);
    return normalized;
  }

  resolve(accountId: string, workspaceId: string, at = new Date().toISOString()): PlanResolution {
    const account = required(accountId, 'accountId');
    const workspace = required(workspaceId, 'workspaceId');
    const instant = Date.parse(isoDate(at, 'at'));
    const candidates = [...this.assignments.values()]
      .filter((assignment) => assignment.accountId === account && assignment.workspaceId === workspace)
      .filter((assignment) => assignment.status === 'active')
      .filter((assignment) => Date.parse(assignment.effectiveFrom) <= instant)
      .filter((assignment) => !assignment.effectiveTo || Date.parse(assignment.effectiveTo) > instant)
      .sort((left, right) => Date.parse(right.effectiveFrom) - Date.parse(left.effectiveFrom));
    const assignment = candidates[0] ?? null;
    if (!assignment) return { accountId: account, workspaceId: workspace, plan: null, assignment: null, reason: 'no-assignment' };
    const plan = this.plans.get(assignment.planId) ?? null;
    if (!plan || plan.status !== 'active') {
      return { accountId: account, workspaceId: workspace, plan: null, assignment, reason: 'plan-unavailable' };
    }
    return { accountId: account, workspaceId: workspace, plan, assignment, reason: 'resolved' };
  }
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

  findByIdempotencyKey(idempotencyKey: string): UsageEvent | null {
    const normalized = required(idempotencyKey, 'usage.idempotencyKey');
    return this.byIdempotency.get(normalized) ?? null;
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
