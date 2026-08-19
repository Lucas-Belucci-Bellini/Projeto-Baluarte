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
}
