import type { EvidenceInput, EvidenceSource } from './evidence.js';

export interface CatalogEvidenceInput {
  readonly moduleId: string;
  readonly entityId: string;
  readonly field: string;
  readonly value: unknown;
  readonly source: EvidenceSource;
  readonly retrievedAt: string;
  readonly confidence: number;
  readonly collector?: string;
  readonly evidenceId?: string;
}

function statementValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value);
  const serialized = JSON.stringify(value);
  return serialized ?? 'undefined';
}

export function evidenceFromCatalog(input: CatalogEvidenceInput): EvidenceInput {
  const moduleId = input.moduleId.trim();
  const entityId = input.entityId.trim();
  const field = input.field.trim();
  if (!moduleId || !entityId || !field) throw new TypeError('catálogo exige moduleId, entityId e field');
  const claimKey = `${moduleId}:${entityId}:${field}`;
  return {
    id: input.evidenceId?.trim() || `catalog:${claimKey}:${input.retrievedAt}`,
    claimKey,
    statement: statementValue(input.value),
    source: input.source,
    retrievedAt: input.retrievedAt,
    confidence: input.confidence,
    moduleId,
    collector: input.collector ?? 'catalog-adapter',
  };
}
