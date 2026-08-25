/**
 * Evidence Layer — fatos observados com proveniência explícita.
 *
 * Esta camada é deliberadamente agnóstica de banco e frontend. Ela valida e
 * mantém um log append-only em memória para que módulos V2 possam testar seus
 * contratos antes da persistência Postgres/Supabase.
 */

export type EvidenceStatus = 'pending' | 'verified' | 'rejected' | 'superseded';

export interface EvidenceSource {
  readonly uri: string;
  readonly title?: string;
  readonly publisher?: string;
  readonly revision?: string;
}

export interface EvidenceInput {
  readonly id: string;
  readonly claimKey: string;
  readonly statement: string;
  readonly source: EvidenceSource;
  readonly retrievedAt: string;
  readonly observedAt?: string;
  readonly confidence: number;
  readonly status?: EvidenceStatus;
  readonly moduleId: string;
  readonly collector?: string;
  readonly supersededBy?: string;
}

export interface EvidenceRecord {
  readonly id: string;
  readonly claimKey: string;
  readonly statement: string;
  readonly source: EvidenceSource;
  readonly retrievedAt: string;
  readonly observedAt: string;
  readonly confidence: number;
  readonly status: EvidenceStatus;
  readonly moduleId: string;
  readonly collector: string;
  readonly supersededBy?: string;
}

export interface EvidenceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export type EvidenceRetentionState = 'within-window' | 'past-window' | 'future-observed';

export interface EvidenceRetentionOptions {
  readonly now: string;
  readonly maxAgeDays?: number;
  readonly limit?: number;
}

export interface EvidenceRetentionItem {
  readonly id: string;
  readonly moduleId: string;
  readonly status: EvidenceStatus;
  readonly observedAt: string;
  readonly ageDays: number;
  readonly retention: EvidenceRetentionState;
}

export interface EvidenceRetentionSummary {
  readonly total: number;
  readonly withinWindow: number;
  readonly pastWindow: number;
  readonly futureObserved: number;
}

export interface EvidenceRetentionPreview {
  readonly now: string;
  readonly maxAgeDays: number;
  readonly items: readonly EvidenceRetentionItem[];
  readonly summary: EvidenceRetentionSummary;
}

export interface EvidenceAuditOptions {
  readonly moduleId?: string;
  readonly limit?: number;
}

export interface EvidenceAuditRecord {
  readonly id: string;
  readonly moduleId: string;
  readonly status: EvidenceStatus;
  readonly observedAt: string;
}

export interface EvidenceAuditSummary {
  readonly returned: number;
  readonly pending: number;
  readonly verified: number;
  readonly rejected: number;
  readonly superseded: number;
  readonly truncated: boolean;
}

export interface EvidenceAuditPreview {
  readonly scope: string;
  readonly limit: number;
  readonly records: readonly EvidenceAuditRecord[];
  readonly summary: EvidenceAuditSummary;
}

export interface EvidenceReviewOptions {
  readonly moduleId?: string;
  readonly limit?: number;
}

export interface EvidenceReviewItem {
  readonly id: string;
  readonly moduleId: string;
  readonly claimKey: string;
  readonly status: 'pending';
  readonly confidence: number;
  readonly observedAt: string;
  readonly sourceRevision: string | null;
}

export interface EvidenceReviewSummary {
  readonly returned: number;
  readonly available: number;
  readonly truncated: boolean;
}

export interface EvidenceReviewQueue {
  readonly scope: string;
  readonly limit: number;
  readonly items: readonly EvidenceReviewItem[];
  readonly summary: EvidenceReviewSummary;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isEvidenceStatus(value: unknown): value is EvidenceStatus {
  return value === 'pending'
    || value === 'verified'
    || value === 'rejected'
    || value === 'superseded';
}

const RETENTION_DAY_MS = 86_400_000;
const DEFAULT_RETENTION_DAYS = 30;
const MAX_RETENTION_DAYS = 3650;
const DEFAULT_RETENTION_LIMIT = 25;
const MAX_RETENTION_LIMIT = 100;
const DEFAULT_AUDIT_LIMIT = 25;
const MAX_AUDIT_LIMIT = 100;
const DEFAULT_REVIEW_LIMIT = 25;
const MAX_REVIEW_LIMIT = 100;

function boundedPositive(value: number | undefined, fallback: number, maximum: number, name: string): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1) throw new TypeError(`${name} deve ser inteiro positivo`);
  return Math.min(value, maximum);
}

function retentionOptions(options: EvidenceRetentionOptions): Required<EvidenceRetentionOptions> {
  if (options === null || typeof options !== 'object') {
    throw new TypeError('opções de retenção devem ser um objeto');
  }
  if (!isIsoDate(options.now)) throw new TypeError('now deve ser uma data ISO válida');
  return {
    now: new Date(options.now).toISOString(),
    maxAgeDays: boundedPositive(options.maxAgeDays, DEFAULT_RETENTION_DAYS, MAX_RETENTION_DAYS, 'maxAgeDays'),
    limit: boundedPositive(options.limit, DEFAULT_RETENTION_LIMIT, MAX_RETENTION_LIMIT, 'limit'),
  };
}

export function projectEvidenceRetention(
  records: readonly EvidenceRecord[],
  options: EvidenceRetentionOptions,
): EvidenceRetentionPreview {
  const normalized = retentionOptions(options);
  const nowMs = Date.parse(normalized.now);
  const maxAgeMs = normalized.maxAgeDays * RETENTION_DAY_MS;
  let withinWindow = 0;
  let pastWindow = 0;
  let futureObserved = 0;
  const items = records.slice(0, normalized.limit).map((record) => {
    const deltaMs = nowMs - Date.parse(record.observedAt);
    const retention: EvidenceRetentionState = deltaMs < 0
      ? 'future-observed'
      : deltaMs > maxAgeMs
        ? 'past-window'
        : 'within-window';
    if (retention === 'within-window') withinWindow += 1;
    if (retention === 'past-window') pastWindow += 1;
    if (retention === 'future-observed') futureObserved += 1;
    return Object.freeze({
      id: record.id,
      moduleId: record.moduleId,
      status: record.status,
      observedAt: record.observedAt,
      ageDays: deltaMs < 0 ? 0 : Math.floor(deltaMs / RETENTION_DAY_MS),
      retention,
    });
  });
  return Object.freeze({
    now: normalized.now,
    maxAgeDays: normalized.maxAgeDays,
    items: Object.freeze(items),
    summary: Object.freeze({
      total: items.length,
      withinWindow,
      pastWindow,
      futureObserved,
    }),
  });
}

function normalizeAuditOptions(options: EvidenceAuditOptions | null | undefined): {
  readonly moduleId: string | null;
  readonly limit: number;
} {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('opções de auditoria devem ser um objeto');
  }
  if (options.moduleId !== undefined && !isNonEmptyString(options.moduleId)) {
    throw new TypeError('moduleId deve ser texto não vazio');
  }
  return {
    moduleId: options.moduleId?.trim() ?? null,
    limit: boundedPositive(options.limit, DEFAULT_AUDIT_LIMIT, MAX_AUDIT_LIMIT, 'limit'),
  };
}

export function projectEvidenceReviewQueue(
  records: readonly EvidenceRecord[],
  options: EvidenceReviewOptions = {},
): EvidenceReviewQueue {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('opções de revisão devem ser um objeto');
  }
  if (options.moduleId !== undefined && !isNonEmptyString(options.moduleId)) {
    throw new TypeError('moduleId deve ser texto não vazio');
  }
  const moduleId = options.moduleId?.trim() ?? null;
  const limit = boundedPositive(options.limit, DEFAULT_REVIEW_LIMIT, MAX_REVIEW_LIMIT, 'limit');
  const scoped = moduleId === null
    ? records
    : records.filter((record) => record.moduleId === moduleId);
  const pending = scoped.filter((record) => record.status === 'pending');
  const items = pending.slice(0, limit).map((record) => Object.freeze({
    id: record.id,
    moduleId: record.moduleId,
    claimKey: record.claimKey,
    status: 'pending' as const,
    confidence: record.confidence,
    observedAt: record.observedAt,
    sourceRevision: record.source.revision ?? null,
  }));
  return Object.freeze({
    scope: moduleId ?? 'all',
    limit,
    items: Object.freeze(items),
    summary: Object.freeze({
      returned: items.length,
      available: pending.length,
      truncated: pending.length > limit,
    }),
  });
}

export function projectEvidenceAudit(
  records: readonly EvidenceRecord[],
  options: EvidenceAuditOptions = {},
): EvidenceAuditPreview {
  const normalized = normalizeAuditOptions(options);
  const scoped = normalized.moduleId === null
    ? records
    : records.filter((record) => record.moduleId === normalized.moduleId);
  const selected = scoped.slice(0, normalized.limit);
  let pending = 0;
  let verified = 0;
  let rejected = 0;
  let superseded = 0;
  const auditRecords = selected.map((record) => {
    if (record.status === 'pending') pending += 1;
    if (record.status === 'verified') verified += 1;
    if (record.status === 'rejected') rejected += 1;
    if (record.status === 'superseded') superseded += 1;
    return Object.freeze({
      id: record.id,
      moduleId: record.moduleId,
      status: record.status,
      observedAt: record.observedAt,
    });
  });
  return Object.freeze({
    scope: normalized.moduleId ?? 'all',
    limit: normalized.limit,
    records: Object.freeze(auditRecords),
    summary: Object.freeze({
      returned: auditRecords.length,
      pending,
      verified,
      rejected,
      superseded,
      truncated: scoped.length > normalized.limit,
    }),
  });
}

function sourceErrors(value: unknown): string[] {
  if (!isRecord(value)) return ['source deve ser um objeto'];
  const errors: string[] = [];
  if (!isNonEmptyString(value.uri)) errors.push('source.uri deve ser uma URL não vazia');
  if (value.title !== undefined && typeof value.title !== 'string') errors.push('source.title deve ser texto');
  if (value.publisher !== undefined && typeof value.publisher !== 'string') errors.push('source.publisher deve ser texto');
  if (value.revision !== undefined && typeof value.revision !== 'string') errors.push('source.revision deve ser texto');
  return errors;
}

export function validateEvidence(input: unknown): EvidenceValidation {
  if (!isRecord(input)) return { valid: false, errors: ['evidência deve ser um objeto'] };
  const errors: string[] = [];
  if (!isNonEmptyString(input.id)) errors.push('id deve ser texto não vazio');
  if (!isNonEmptyString(input.claimKey)) errors.push('claimKey deve ser texto não vazio');
  if (!isNonEmptyString(input.statement)) errors.push('statement deve ser texto não vazio');
  if (!isNonEmptyString(input.moduleId)) errors.push('moduleId deve ser texto não vazio');
  if (!isIsoDate(input.retrievedAt)) errors.push('retrievedAt deve ser uma data ISO válida');
  if (input.observedAt !== undefined && !isIsoDate(input.observedAt)) errors.push('observedAt deve ser uma data ISO válida');
  if (typeof input.confidence !== 'number' || !Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    errors.push('confidence deve ser um número entre 0 e 1');
  }
  if (input.status !== undefined && !isEvidenceStatus(input.status)) errors.push('status de evidência inválido');
  if (input.collector !== undefined && !isNonEmptyString(input.collector)) errors.push('collector deve ser texto não vazio');
  if (input.supersededBy !== undefined && !isNonEmptyString(input.supersededBy)) errors.push('supersededBy deve ser texto não vazio');
  errors.push(...sourceErrors(input.source));
  return { valid: errors.length === 0, errors };
}

export function normalizeEvidence(input: EvidenceInput): EvidenceRecord {
  const validation = validateEvidence(input);
  if (!validation.valid) throw new TypeError(`evidência inválida: ${validation.errors.join('; ')}`);
  return Object.freeze({
    id: input.id.trim(),
    claimKey: input.claimKey.trim(),
    statement: input.statement.trim(),
    source: Object.freeze({
      uri: input.source.uri.trim(),
      ...(input.source.title ? { title: input.source.title.trim() } : {}),
      ...(input.source.publisher ? { publisher: input.source.publisher.trim() } : {}),
      ...(input.source.revision ? { revision: input.source.revision.trim() } : {}),
    }),
    retrievedAt: new Date(input.retrievedAt).toISOString(),
    observedAt: new Date(input.observedAt ?? input.retrievedAt).toISOString(),
    confidence: input.confidence,
    status: input.status ?? 'pending',
    moduleId: input.moduleId.trim(),
    collector: input.collector?.trim() ?? 'unknown',
    ...(input.supersededBy ? { supersededBy: input.supersededBy.trim() } : {}),
  });
}

export class EvidenceStore {
  private readonly records = new Map<string, EvidenceRecord>();

  append(input: EvidenceInput): EvidenceRecord {
    const record = normalizeEvidence(input);
    if (this.records.has(record.id)) throw new Error(`evidência duplicada: ${record.id}`);
    this.records.set(record.id, record);
    return record;
  }

  get(id: string): EvidenceRecord | null {
    return this.records.get(id) ?? null;
  }

  list(): readonly EvidenceRecord[] {
    return [...this.records.values()];
  }

  listByClaim(claimKey: string): readonly EvidenceRecord[] {
    return this.list().filter((record) => record.claimKey === claimKey);
  }

  listByModule(moduleId: string): readonly EvidenceRecord[] {
    return this.list().filter((record) => record.moduleId === moduleId);
  }

  markStatus(id: string, status: EvidenceStatus, supersededBy?: string): EvidenceRecord {
    const current = this.records.get(id);
    if (!current) throw new Error(`evidência não encontrada: ${id}`);
    const next: EvidenceRecord = Object.freeze({
      ...current,
      status,
      ...(supersededBy ? { supersededBy } : {}),
    });
    this.records.set(id, next);
    return next;
  }

  snapshot(): readonly EvidenceRecord[] {
    return this.list().map((record) => Object.freeze({
      ...record,
      source: Object.freeze({ ...record.source }),
    }));
  }

  retentionPreview(options: EvidenceRetentionOptions): EvidenceRetentionPreview {
    return projectEvidenceRetention(this.list(), options);
  }

  auditPreview(options?: EvidenceAuditOptions): EvidenceAuditPreview {
    return projectEvidenceAudit(this.list(), options);
  }

  reviewQueue(options?: EvidenceReviewOptions): EvidenceReviewQueue {
    return projectEvidenceReviewQueue(this.list(), options);
  }
}
