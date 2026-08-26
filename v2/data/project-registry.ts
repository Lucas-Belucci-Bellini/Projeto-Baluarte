/**
 * Project Registry — inventário local e read-only de projetos candidatos.
 *
 * Este contrato não consulta, baixa ou executa repositórios externos. Entradas
 * sem auditoria suficiente permanecem explicitamente como `not-audited` e só
 * podem receber a decisão conservadora `defer`.
 */

export const PROJECT_REGISTRY_DECISIONS = [
  'use',
  'adapt',
  'inspire',
  'isolate',
  'defer',
  'reject',
] as const;

export type ProjectRegistryDecision = typeof PROJECT_REGISTRY_DECISIONS[number];

export const PROJECT_REGISTRY_AUDIT_STATES = [
  'not-audited',
  'locally-audited',
  'externally-verified',
  'blocked-external',
] as const;

export type ProjectRegistryAuditState = typeof PROJECT_REGISTRY_AUDIT_STATES[number];

export const PROJECT_REGISTRY_SOURCE_KINDS = [
  'roadmap',
  'repository',
  'local-document',
] as const;

export type ProjectRegistrySourceKind = typeof PROJECT_REGISTRY_SOURCE_KINDS[number];
export type ProjectRegistryMaintenance = 'unknown' | 'active' | 'stale' | 'archived';
export type ProjectRegistryCost = 'unknown' | 'none-known' | 'low' | 'medium' | 'high';

export interface ProjectRegistrySource {
  readonly kind: ProjectRegistrySourceKind;
  readonly reference: string;
}

export interface ProjectRegistryEntryInput {
  readonly id: string;
  readonly name: string;
  readonly source: ProjectRegistrySource;
  readonly auditState: ProjectRegistryAuditState;
  readonly repositoryUrl?: string;
  readonly license?: string;
  readonly maintenance?: ProjectRegistryMaintenance;
  readonly architecture?: readonly string[];
  readonly capabilities?: readonly string[];
  readonly overlap?: readonly string[];
  readonly security?: readonly string[];
  readonly cost?: ProjectRegistryCost;
  readonly decision: ProjectRegistryDecision;
  readonly nextStep: string;
}

export interface ProjectRegistryEntry {
  readonly id: string;
  readonly name: string;
  readonly source: Readonly<ProjectRegistrySource>;
  readonly auditState: ProjectRegistryAuditState;
  readonly repositoryUrl?: string;
  readonly license?: string;
  readonly maintenance: ProjectRegistryMaintenance;
  readonly architecture: readonly string[];
  readonly capabilities: readonly string[];
  readonly overlap: readonly string[];
  readonly security: readonly string[];
  readonly cost: ProjectRegistryCost;
  readonly decision: ProjectRegistryDecision;
  readonly nextStep: string;
}

export interface ProjectRegistryValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ProjectRegistryQueryOptions {
  readonly query?: string;
  readonly auditState?: ProjectRegistryAuditState;
  readonly decision?: ProjectRegistryDecision;
  readonly limit?: number;
}

export interface ProjectRegistrySummary {
  readonly available: number;
  readonly returned: number;
  readonly truncated: boolean;
}

export interface ProjectRegistrySnapshot {
  readonly scope: 'project-registry/local';
  readonly query: string | null;
  readonly auditState: ProjectRegistryAuditState | 'all';
  readonly decision: ProjectRegistryDecision | 'all';
  readonly limit: number;
  readonly entries: readonly ProjectRegistryEntry[];
  readonly summary: Readonly<ProjectRegistrySummary>;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const DEFAULT_MAINTENANCE: ProjectRegistryMaintenance = 'unknown';
const DEFAULT_COST: ProjectRegistryCost = 'unknown';

export const PROJECT_REGISTRY_CATALOG: readonly ProjectRegistryEntryInput[] = Object.freeze([
  {
    id: 'veritas',
    name: 'Veritas',
    source: { kind: 'roadmap', reference: 'docs/v2/V2_MASTER_PLAN.md#17-projetos-externos' },
    auditState: 'not-audited',
    decision: 'defer',
    nextStep: 'identificar a fonte oficial e conduzir auditoria passiva antes de qualquer adapter',
  },
  {
    id: 'dailyplanner',
    name: 'DailyPlanner',
    source: { kind: 'roadmap', reference: 'docs/v2/V2_MASTER_PLAN.md#17-projetos-externos' },
    auditState: 'not-audited',
    decision: 'defer',
    nextStep: 'identificar a fonte oficial e conduzir auditoria passiva antes de qualquer adapter',
  },
  {
    id: 'stock-analyzer-bot',
    name: 'Stock Analyzer Bot',
    source: { kind: 'roadmap', reference: 'docs/v2/V2_MASTER_PLAN.md#17-projetos-externos' },
    auditState: 'not-audited',
    decision: 'defer',
    nextStep: 'identificar a fonte oficial e conduzir auditoria passiva antes de qualquer adapter',
  },
  {
    id: 'project-vanguard',
    name: 'Project Vanguard',
    source: { kind: 'roadmap', reference: 'docs/v2/V2_MASTER_PLAN.md#17-projetos-externos' },
    auditState: 'not-audited',
    decision: 'defer',
    nextStep: 'identificar a fonte oficial e conduzir auditoria passiva antes de qualquer adapter',
  },
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOneOf<T extends readonly string[]>(catalog: T, value: unknown): value is T[number] {
  return typeof value === 'string' && (catalog as readonly string[]).includes(value);
}

function isMaintenance(value: unknown): value is ProjectRegistryMaintenance {
  return value === 'unknown' || value === 'active' || value === 'stale' || value === 'archived';
}

function isCost(value: unknown): value is ProjectRegistryCost {
  return value === 'unknown'
    || value === 'none-known'
    || value === 'low'
    || value === 'medium'
    || value === 'high';
}

function stringListErrors(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return [`${field} deve ser uma lista`];
  const errors: string[] = [];
  const seen = new Set<string>();
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(`${field}[${index}] deve ser texto não vazio`);
      return;
    }
    const normalized = item.trim();
    if (seen.has(normalized)) errors.push(`${field} não pode conter duplicatas`);
    seen.add(normalized);
  });
  return errors;
}

function sourceErrors(value: unknown): string[] {
  if (!isRecord(value)) return ['source deve ser um objeto'];
  const errors: string[] = [];
  if (!isOneOf(PROJECT_REGISTRY_SOURCE_KINDS, value.kind)) {
    errors.push('source.kind inválido');
  }
  if (!isNonEmptyString(value.reference)) {
    errors.push('source.reference deve ser texto não vazio');
  }
  return errors;
}

export function validateProjectRegistryEntry(input: unknown): ProjectRegistryValidation {
  if (!isRecord(input)) {
    return { valid: false, errors: ['entrada do Project Registry deve ser um objeto'] };
  }

  const errors: string[] = [];
  if (!isNonEmptyString(input.id)) errors.push('id deve ser texto não vazio');
  if (!isNonEmptyString(input.name)) errors.push('name deve ser texto não vazio');
  if (!isNonEmptyString(input.nextStep)) errors.push('nextStep deve ser texto não vazio');
  errors.push(...sourceErrors(input.source));

  if (!isOneOf(PROJECT_REGISTRY_AUDIT_STATES, input.auditState)) {
    errors.push('auditState inválido');
  }
  if (!isOneOf(PROJECT_REGISTRY_DECISIONS, input.decision)) {
    errors.push('decision inválida');
  }
  if (input.auditState === 'not-audited' && input.decision !== 'defer') {
    errors.push('entrada not-audited deve permanecer com decision defer');
  }
  if (input.repositoryUrl !== undefined) {
    if (!isNonEmptyString(input.repositoryUrl)) {
      errors.push('repositoryUrl deve ser uma URL não vazia');
    } else if (!/^https?:\/\//.test(input.repositoryUrl.trim())) {
      errors.push('repositoryUrl deve usar http ou https');
    }
  }
  if (input.license !== undefined && !isNonEmptyString(input.license)) {
    errors.push('license deve ser texto não vazio quando informado');
  }
  if (input.maintenance !== undefined && !isMaintenance(input.maintenance)) {
    errors.push('maintenance inválido');
  }
  if (input.cost !== undefined && !isCost(input.cost)) errors.push('cost inválido');
  errors.push(...stringListErrors(input.architecture, 'architecture'));
  errors.push(...stringListErrors(input.capabilities, 'capabilities'));
  errors.push(...stringListErrors(input.overlap, 'overlap'));
  errors.push(...stringListErrors(input.security, 'security'));

  return { valid: errors.length === 0, errors };
}

function boundedLimit(value: number | undefined): number {
  if (value === undefined) return DEFAULT_LIMIT;
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError('limit deve ser inteiro positivo');
  }
  return Math.min(value, MAX_LIMIT);
}

function normalizeStringList(value: readonly string[] | undefined): readonly string[] {
  return Object.freeze((value ?? []).map((item) => item.trim()));
}

export function normalizeProjectRegistryEntry(input: ProjectRegistryEntryInput): ProjectRegistryEntry {
  const validation = validateProjectRegistryEntry(input);
  if (!validation.valid) {
    throw new TypeError(`entrada do Project Registry inválida: ${validation.errors.join('; ')}`);
  }

  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    source: Object.freeze({
      kind: input.source.kind,
      reference: input.source.reference.trim(),
    }),
    auditState: input.auditState,
    ...(input.repositoryUrl ? { repositoryUrl: input.repositoryUrl.trim() } : {}),
    ...(input.license ? { license: input.license.trim() } : {}),
    maintenance: input.maintenance ?? DEFAULT_MAINTENANCE,
    architecture: normalizeStringList(input.architecture),
    capabilities: normalizeStringList(input.capabilities),
    overlap: normalizeStringList(input.overlap),
    security: normalizeStringList(input.security),
    cost: input.cost ?? DEFAULT_COST,
    decision: input.decision,
    nextStep: input.nextStep.trim(),
  });
}

function normalizeOptions(options: ProjectRegistryQueryOptions | undefined): {
  readonly query: string | null;
  readonly auditState: ProjectRegistryAuditState | null;
  readonly decision: ProjectRegistryDecision | null;
  readonly limit: number;
} {
  if (options !== undefined && (options === null || typeof options !== 'object' || Array.isArray(options))) {
    throw new TypeError('opções do Project Registry devem ser um objeto');
  }
  if (options?.query !== undefined && !isNonEmptyString(options.query)) {
    throw new TypeError('query deve ser texto não vazio quando informado');
  }
  if (options?.auditState !== undefined && !isOneOf(PROJECT_REGISTRY_AUDIT_STATES, options.auditState)) {
    throw new TypeError('auditState inválido');
  }
  if (options?.decision !== undefined && !isOneOf(PROJECT_REGISTRY_DECISIONS, options.decision)) {
    throw new TypeError('decision inválida');
  }
  return {
    query: options?.query?.trim().toLocaleLowerCase() ?? null,
    auditState: options?.auditState ?? null,
    decision: options?.decision ?? null,
    limit: boundedLimit(options?.limit),
  };
}

export function projectRegistrySnapshot(
  entries: readonly ProjectRegistryEntryInput[] = PROJECT_REGISTRY_CATALOG,
  options?: ProjectRegistryQueryOptions,
): ProjectRegistrySnapshot {
  if (!Array.isArray(entries)) throw new TypeError('entries deve ser uma lista');
  const normalizedOptions = normalizeOptions(options);
  const normalized = entries.map(normalizeProjectRegistryEntry);
  const ids = new Set<string>();
  for (const entry of normalized) {
    if (ids.has(entry.id)) throw new TypeError(`id duplicado no Project Registry: ${entry.id}`);
    ids.add(entry.id);
  }

  const scoped = normalized.filter((entry) => {
    const matchesQuery = normalizedOptions.query === null
      || `${entry.id} ${entry.name}`.toLocaleLowerCase().includes(normalizedOptions.query);
    const matchesAuditState = normalizedOptions.auditState === null
      || entry.auditState === normalizedOptions.auditState;
    const matchesDecision = normalizedOptions.decision === null
      || entry.decision === normalizedOptions.decision;
    return matchesQuery && matchesAuditState && matchesDecision;
  });
  const selected = scoped.slice(0, normalizedOptions.limit);

  return Object.freeze({
    scope: 'project-registry/local',
    query: normalizedOptions.query,
    auditState: normalizedOptions.auditState ?? 'all',
    decision: normalizedOptions.decision ?? 'all',
    limit: normalizedOptions.limit,
    entries: Object.freeze(selected),
    summary: Object.freeze({
      available: scoped.length,
      returned: selected.length,
      truncated: scoped.length > selected.length,
    }),
  });
}
