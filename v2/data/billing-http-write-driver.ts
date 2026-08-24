import { BillingPersistenceError, type BillingPersistenceErrorCode } from './billing-driver.js';
import type { UsageEvent } from './billing.js';
import type { UsageWriteRequest } from './billing-persistence.js';

interface HttpResponseLike {
  readonly status: number;
  json(): Promise<unknown>;
}

export interface BillingHttpWriteTransport {
  request(
    url: string,
    init: Readonly<{
      readonly method: 'POST';
      readonly headers: Readonly<Record<string, string>>;
      readonly body: string;
      readonly signal: AbortSignal;
    }>,
  ): Promise<HttpResponseLike>;
}

export interface BillingHttpWriteDriverOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly accessToken: string;
  readonly principalUserId: string;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
  readonly transport: BillingHttpWriteTransport;
  readonly observer?: BillingWriteObserver;
}

export type BillingWriteOutcome = 'success' | 'error';

export interface BillingWriteObservation {
  readonly operation: 'appendUsage';
  readonly outcome: BillingWriteOutcome;
  readonly durationMs: number;
  readonly attempts: number;
  readonly errorCode?: BillingPersistenceErrorCode;
}

export interface BillingWriteObserver {
  observe(observation: BillingWriteObservation): void;
}

const NOOP_BILLING_WRITE_OBSERVER: BillingWriteObserver = Object.freeze({ observe() {} });

type JsonRecord = Readonly<Record<string, unknown>>;

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

function record(value: unknown, field: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou objeto inválido`);
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
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou número inválido`);
  }
  return numeric;
}

function metadata(value: unknown, field: string): Readonly<Record<string, string>> {
  const source = record(value, field);
  const entries = Object.entries(source).map(([key, item]) => [key, text(item, `${field}.${key}`)] as const);
  return Object.freeze(Object.fromEntries(entries));
}

function iso(value: unknown, field: string): string {
  const normalized = text(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new BillingPersistenceError('INVALID_RESPONSE', `${field} retornou data inválida`);
  }
  return new Date(normalized).toISOString();
}

function parseUsage(value: unknown): UsageEvent {
  const row = record(value, 'usage');
  return Object.freeze({
    id: text(row.id, 'usage.id'),
    idempotencyKey: text(row.idempotency_key, 'usage.idempotency_key'),
    accountId: text(row.account_id, 'usage.account_id'),
    workspaceId: text(row.workspace_id, 'usage.workspace_id'),
    feature: text(row.feature, 'usage.feature'),
    quantity: numberValue(row.quantity, 'usage.quantity'),
    timestamp: iso(row.occurred_at, 'usage.occurred_at'),
    source: text(row.source, 'usage.source'),
    metadata: metadata(row.metadata, 'usage.metadata'),
  });
}

function errorCode(status: number): { readonly code: BillingPersistenceErrorCode; readonly retryable: boolean } {
  if (status === 401 || status === 403) return { code: 'MEMBERSHIP_REQUIRED', retryable: false };
  if (status === 404) return { code: 'WORKSPACE_NOT_FOUND', retryable: false };
  if (status === 409) return { code: 'IDEMPOTENCY_CONFLICT', retryable: false };
  if (status === 408 || status === 429 || status >= 500) return { code: 'UPSTREAM_UNAVAILABLE', retryable: true };
  return { code: 'INVALID_RESPONSE', retryable: false };
}

function retryable(error: unknown): boolean {
  return error instanceof BillingPersistenceError && error.retryable;
}

export class BillingHttpWriteDriver {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;
  private readonly principalUserId: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly transport: BillingHttpWriteTransport;
  private readonly observer: BillingWriteObserver;

  constructor(options: BillingHttpWriteDriverOptions) {
    if (typeof window !== 'undefined') throw new Error('BillingHttpWriteDriver deve executar somente no backend');
    const base = new URL(required(options.baseUrl, 'baseUrl'));
    if (base.protocol !== 'https:' && base.hostname !== 'localhost') throw new TypeError('baseUrl deve usar HTTPS');
    this.baseUrl = base.toString().replace(/\/$/, '');
    this.principalUserId = required(options.principalUserId, 'principalUserId');
    this.timeoutMs = options.timeoutMs ?? 5000;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 100 || this.timeoutMs > 30000) {
      throw new RangeError('timeoutMs deve estar entre 100 e 30000');
    }
    this.maxAttempts = options.maxAttempts ?? 2;
    if (!Number.isInteger(this.maxAttempts) || this.maxAttempts < 1 || this.maxAttempts > 2) {
      throw new RangeError('maxAttempts deve estar entre 1 e 2');
    }
    this.headers = Object.freeze({
      apikey: required(options.apiKey, 'apiKey'),
      Authorization: `Bearer ${required(options.accessToken, 'accessToken')}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Profile': 'billing',
      Prefer: 'return=representation',
    });
    this.transport = options.transport;
    this.observer = options.observer ?? NOOP_BILLING_WRITE_OBSERVER;
  }

  async appendUsage(request: UsageWriteRequest): Promise<UsageEvent> {
    this.assertPrincipal(request.actorUserId);
    const payload = {
      account_id: required(request.accountId, 'usage.accountId'),
      workspace_id: required(request.workspaceId, 'usage.workspaceId'),
      feature: required(request.feature, 'usage.feature'),
      quantity: request.quantity,
      idempotency_key: required(request.idempotencyKey, 'usage.idempotencyKey'),
      occurred_at: iso(request.timestamp, 'usage.timestamp'),
      source: required(request.source, 'usage.source'),
      metadata: { ...request.metadata },
    };
    const startedAt = Date.now();
    let attempts = 0;
    try {
      for (attempts = 1; attempts <= this.maxAttempts; attempts += 1) {
        try {
          const result = await this.postUsage(payload);
          this.observer.observe({ operation: 'appendUsage', outcome: 'success', durationMs: Date.now() - startedAt, attempts });
          return result;
        } catch (error) {
          if (!retryable(error) || attempts >= this.maxAttempts) throw error;
        }
      }
      throw new BillingPersistenceError('UPSTREAM_UNAVAILABLE', 'billing upstream indisponível', true);
    } catch (error) {
      if (error instanceof BillingPersistenceError) {
        this.observer.observe({ operation: 'appendUsage', outcome: 'error', durationMs: Date.now() - startedAt, attempts, errorCode: error.code });
      }
      throw error;
    }
  }

  private async postUsage(payload: Readonly<Record<string, unknown>>): Promise<UsageEvent> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.transport.request(`${this.baseUrl}/rest/v1/usage_events`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (response.status < 200 || response.status >= 300) {
        const mapped = errorCode(response.status);
        throw new BillingPersistenceError(mapped.code, 'billing upstream rejeitou a escrita', mapped.retryable);
      }
      const body = await response.json();
      const row = Array.isArray(body) ? body[0] : body;
      if (!row) throw new BillingPersistenceError('INVALID_RESPONSE', 'billing upstream não retornou o evento criado');
      return parseUsage(row);
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

  private assertPrincipal(actorUserId: string): void {
    if (required(actorUserId, 'actorUserId') !== this.principalUserId) {
      throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não corresponde à sessão do driver');
    }
  }
}
