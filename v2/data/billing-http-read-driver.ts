import type {
  BillingReadDriver,
  BillingPersistenceErrorCode,
} from './billing-driver.js';
import { BillingPersistenceError } from './billing-driver.js';
import type {
  Plan,
  PlanAssignment,
  PlanResolution,
  UsageEvent,
} from './billing.js';
import type { WorkspaceRecord } from './billing-persistence.js';
import {
  NOOP_BILLING_READ_OBSERVER,
  type BillingReadObserver,
  type BillingReadOperation,
} from './billing-observability.js';

interface HttpResponseLike {
  readonly status: number;
  json(): Promise<unknown>;
}

export interface BillingHttpTransport {
  request(
    url: string,
    init: Readonly<{
      readonly method: 'GET';
      readonly headers: Readonly<Record<string, string>>;
      readonly signal: AbortSignal;
    }>,
  ): Promise<HttpResponseLike>;
}

export interface BillingHttpReadDriverOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly accessToken: string;
  readonly principalUserId: string;
  readonly timeoutMs?: number;
  readonly transport: BillingHttpTransport;
  readonly observer?: BillingReadObserver;
}

type JsonRecord = Readonly<Record<string, unknown>>;

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

function record(value: unknown, field: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou um objeto inválido`);
  }
  return value as JsonRecord;
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou texto inválido`);
  }
  return value.trim();
}

function numberValue(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou número inválido`);
  }
  return value;
}

function array(value: unknown, field: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou uma lista inválida`);
  return value;
}

function iso(value: unknown, field: string): string {
  const normalized = text(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou data inválida`);
  }
  return new Date(normalized).toISOString();
}

function parseWorkspace(value: unknown): WorkspaceRecord {
  const row = record(value, 'workspace');
  return Object.freeze({
    id: text(row.id, 'workspace.id'),
    accountId: text(row.account_id, 'workspace.account_id'),
    slug: text(row.slug, 'workspace.slug'),
    displayName: text(row.display_name, 'workspace.display_name'),
  });
}

function parsePlan(value: unknown): Plan {
  const row = record(value, 'plan');
  const entitlements = array(row.entitlements, 'plan.entitlements').map((item) => text(item, 'plan.entitlement'));
  const features = array(row.features, 'plan.features').map((item) => text(item, 'plan.feature'));
  const limits = record(row.limits, 'plan.limits');
  const metadata = record(row.metadata, 'plan.metadata');
  return Object.freeze({
    id: text(row.plan_id, 'plan.plan_id'),
    name: text(row.name, 'plan.name'),
    description: typeof row.description === 'string' ? row.description : '',
    status: text(row.status, 'plan.status') as Plan['status'],
    currency: text(row.currency, 'plan.currency') as Plan['currency'],
    billingPeriod: text(row.billing_period, 'plan.billing_period') as Plan['billingPeriod'],
    priceMinor: numberValue(row.price_minor, 'plan.price_minor'),
    trialDays: numberValue(row.trial_days, 'plan.trial_days'),
    entitlements,
    limits: Object.freeze({ ...limits } as Plan['limits']),
    features,
    metadata: Object.freeze(Object.fromEntries(Object.entries(metadata).map(([key, item]) => [key, text(item, `plan.metadata.${key}`)]))),
    version: numberValue(row.version, 'plan.version'),
  });
}

function parseAssignment(value: unknown): PlanAssignment {
  const row = record(value, 'assignment');
  const effectiveTo = row.effective_to == null ? undefined : iso(row.effective_to, 'assignment.effective_to');
  return Object.freeze({
    id: text(row.id, 'assignment.id'),
    accountId: text(row.account_id, 'assignment.account_id'),
    workspaceId: text(row.workspace_id, 'assignment.workspace_id'),
    planId: text(row.plan_id, 'assignment.plan_id'),
    planVersion: numberValue(row.plan_version, 'assignment.plan_version'),
    status: text(row.status, 'assignment.status') as PlanAssignment['status'],
    effectiveFrom: iso(row.effective_from, 'assignment.effective_from'),
    ...(effectiveTo ? { effectiveTo } : {}),
    assignedAt: iso(row.assigned_at, 'assignment.assigned_at'),
    source: text(row.source, 'assignment.source'),
  });
}

function parseUsage(value: unknown): UsageEvent {
  const row = record(value, 'usage');
  const metadata = record(row.metadata, 'usage.metadata');
  return Object.freeze({
    id: text(row.id, 'usage.id'),
    idempotencyKey: text(row.idempotency_key, 'usage.idempotency_key'),
    accountId: text(row.account_id, 'usage.account_id'),
    workspaceId: text(row.workspace_id, 'usage.workspace_id'),
    feature: text(row.feature, 'usage.feature'),
    quantity: numberValue(row.quantity, 'usage.quantity'),
    timestamp: iso(row.occurred_at, 'usage.occurred_at'),
    source: text(row.source, 'usage.source'),
    metadata: Object.freeze(Object.fromEntries(Object.entries(metadata).map(([key, item]) => [key, text(item, `usage.metadata.${key}`)]))),
  });
}

function errorCode(status: number): { readonly code: BillingPersistenceErrorCode; readonly retryable: boolean } {
  if (status === 401 || status === 403) return { code: 'MEMBERSHIP_REQUIRED', retryable: false };
  if (status === 404) return { code: 'WORKSPACE_NOT_FOUND', retryable: false };
  if (status === 408 || status === 429 || status >= 500) return { code: 'UPSTREAM_UNAVAILABLE', retryable: true };
  return { code: 'INVALID_RESPONSE', retryable: false };
}

export class BillingHttpReadDriver implements BillingReadDriver {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;
  private readonly principalUserId: string;
  private readonly timeoutMs: number;
  private readonly transport: BillingHttpTransport;
  private readonly observer: BillingReadObserver;

  constructor(options: BillingHttpReadDriverOptions) {
    if (typeof window !== 'undefined') throw new Error('BillingHttpReadDriver deve executar somente no backend');
    const base = new URL(required(options.baseUrl, 'baseUrl'));
    if (base.protocol !== 'https:' && base.hostname !== 'localhost') throw new TypeError('baseUrl deve usar HTTPS');
    this.baseUrl = base.toString().replace(/\/$/, '');
    this.principalUserId = required(options.principalUserId, 'principalUserId');
    this.timeoutMs = options.timeoutMs ?? 5000;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 100 || this.timeoutMs > 30000) {
      throw new RangeError('timeoutMs deve estar entre 100 e 30000');
    }
    this.headers = Object.freeze({
      apikey: required(options.apiKey, 'apiKey'),
      Authorization: `Bearer ${required(options.accessToken, 'accessToken')}`,
      Accept: 'application/json',
      'Accept-Profile': 'billing',
    });
    this.transport = options.transport;
    this.observer = options.observer ?? NOOP_BILLING_READ_OBSERVER;
  }

  async getWorkspace(workspaceId: string, actorUserId: string): Promise<WorkspaceRecord> {
    return this.read('getWorkspace', async () => {
      this.assertPrincipal(actorUserId);
      const rows = await this.getRows(`/rest/v1/workspaces?id=eq.${encodeURIComponent(required(workspaceId, 'workspaceId'))}&select=id,account_id,slug,display_name`);
      if (rows.length === 0) throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', 'workspace não encontrado');
      return parseWorkspace(rows[0]);
    });
  }

  async resolvePlan(accountId: string, workspaceId: string, actorUserId: string, at?: string): Promise<PlanResolution> {
    return this.read('resolvePlan', async () => {
      this.assertPrincipal(actorUserId);
      const account = required(accountId, 'accountId');
      const workspace = required(workspaceId, 'workspaceId');
      const instant = at ? new Date(at).toISOString() : new Date().toISOString();
      const assignments = await this.getRows(`/rest/v1/plan_assignments?account_id=eq.${encodeURIComponent(account)}&workspace_id=eq.${encodeURIComponent(workspace)}&status=eq.active&effective_from=lte.${encodeURIComponent(instant)}&order=effective_from.desc`);
      const assignment = assignments
        .map(parseAssignment)
        .find((candidate) => !candidate.effectiveTo || Date.parse(candidate.effectiveTo) > Date.parse(instant)) ?? null;
      if (!assignment) return { accountId: account, workspaceId: workspace, plan: null, assignment: null, reason: 'no-assignment' };
      const plans = await this.getRows(`/rest/v1/plans?plan_id=eq.${encodeURIComponent(assignment.planId)}&version=eq.${assignment.planVersion}&status=eq.active&limit=1`);
      if (plans.length === 0) return { accountId: account, workspaceId: workspace, plan: null, assignment, reason: 'plan-unavailable' };
      return { accountId: account, workspaceId: workspace, plan: parsePlan(plans[0]), assignment, reason: 'resolved' };
    });
  }

  async listUsage(workspaceId: string, actorUserId: string): Promise<readonly UsageEvent[]> {
    return this.read('listUsage', async () => {
      this.assertPrincipal(actorUserId);
      const rows = await this.getRows(`/rest/v1/usage_events?workspace_id=eq.${encodeURIComponent(required(workspaceId, 'workspaceId'))}&order=occurred_at.asc`);
      return Object.freeze(rows.map(parseUsage));
    });
  }

  private async read<T>(operation: BillingReadOperation, action: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    try {
      const result = await action();
      this.observer.observe({ operation, outcome: 'success', durationMs: Date.now() - startedAt });
      return result;
    } catch (error) {
      if (error instanceof BillingPersistenceError) {
        this.observer.observe({ operation, outcome: 'error', durationMs: Date.now() - startedAt, errorCode: error.code });
      }
      throw error;
    }
  }

  private assertPrincipal(actorUserId: string): void {
    if (required(actorUserId, 'actorUserId') !== this.principalUserId) {
      throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não corresponde à sessão do driver');
    }
  }

  private async getRows(path: string): Promise<readonly unknown[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.transport.request(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      });
      if (response.status < 200 || response.status >= 300) {
        const mapped = errorCode(response.status);
        throw new BillingPersistenceError(mapped.code, 'billing upstream rejeitou a leitura', mapped.retryable);
      }
      const payload = await response.json();
      return array(payload, 'billing upstream');
    } catch (error) {
      if (error instanceof BillingPersistenceError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BillingPersistenceError('UPSTREAM_TIMEOUT', 'billing upstream excedeu o timeout', true);
      }
      throw new BillingPersistenceError('UPSTREAM_UNAVAILABLE', 'billing upstream indisponível', true);
    } finally {
      clearTimeout(timeout);
    }
  }
}
