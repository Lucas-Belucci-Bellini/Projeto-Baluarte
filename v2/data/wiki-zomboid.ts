import type { EvidenceSource } from './evidence.js';

export const ZOMBOID_WIKI_CATEGORIES = [
  'veiculo',
  'blindado',
  'aeronave',
  'arma',
  'uniforme',
  'mapa',
  'utilidade',
  'item',
] as const;

export type ZomboidWikiCategory = typeof ZOMBOID_WIKI_CATEGORIES[number];

export interface ZomboidWikiEntryInput {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly category: ZomboidWikiCategory;
  readonly workshopId: string;
  readonly modId?: string;
  readonly spawnId?: string;
  readonly source: EvidenceSource;
  readonly retrievedAt: string;
}

export interface ZomboidWikiEntry extends ZomboidWikiEntryInput {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly workshopId: string;
  readonly modId: string;
  readonly spawnId: string;
  readonly source: Readonly<EvidenceSource>;
  readonly retrievedAt: string;
}

export interface ZomboidWikiValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isWorkshopId(value: unknown): value is string {
  return typeof value === 'string' && /^\d+$/.test(value.trim());
}

function isIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isCategory(value: unknown): value is ZomboidWikiCategory {
  return typeof value === 'string'
    && (ZOMBOID_WIKI_CATEGORIES as readonly string[]).includes(value);
}

function sourceErrors(value: unknown): string[] {
  if (!isRecord(value)) return ['source deve ser um objeto'];
  const errors: string[] = [];
  if (!isNonEmptyString(value.uri)) errors.push('source.uri deve ser uma URL não vazia');
  if (typeof value.uri === 'string' && !/^https?:\/\//.test(value.uri.trim())) {
    errors.push('source.uri deve usar http ou https');
  }
  if (!isNonEmptyString(value.revision)) errors.push('source.revision deve ser uma revisão não vazia');
  if (value.title !== undefined && typeof value.title !== 'string') errors.push('source.title deve ser texto');
  if (value.publisher !== undefined && typeof value.publisher !== 'string') errors.push('source.publisher deve ser texto');
  return errors;
}

export function validateZomboidWikiEntry(input: unknown): ZomboidWikiValidation {
  if (!isRecord(input)) return { valid: false, errors: ['entrada Wiki Zomboid deve ser um objeto'] };
  const errors: string[] = [];
  if (!isNonEmptyString(input.id)) errors.push('id deve ser texto não vazio');
  if (!isNonEmptyString(input.name)) errors.push('name deve ser texto não vazio');
  if (!isNonEmptyString(input.author)) errors.push('author deve ser texto não vazio');
  if (!isCategory(input.category)) errors.push('category deve pertencer ao catálogo Zomboid');
  if (!isWorkshopId(input.workshopId)) errors.push('workshopId deve conter somente dígitos');
  if (input.modId !== undefined && typeof input.modId !== 'string') errors.push('modId deve ser texto');
  if (input.spawnId !== undefined && typeof input.spawnId !== 'string') errors.push('spawnId deve ser texto');
  if (!isIsoDate(input.retrievedAt)) errors.push('retrievedAt deve ser uma data ISO válida');
  errors.push(...sourceErrors(input.source));
  return { valid: errors.length === 0, errors };
}

export function normalizeZomboidWikiEntry(input: ZomboidWikiEntryInput): ZomboidWikiEntry {
  const validation = validateZomboidWikiEntry(input);
  if (!validation.valid) {
    throw new TypeError(`entrada Wiki Zomboid inválida: ${validation.errors.join('; ')}`);
  }
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    author: input.author.trim(),
    category: input.category,
    workshopId: input.workshopId.trim(),
    modId: input.modId?.trim() ?? '',
    spawnId: input.spawnId?.trim() ?? '',
    source: Object.freeze({
      uri: input.source.uri.trim(),
      ...(input.source.title ? { title: input.source.title.trim() } : {}),
      ...(input.source.publisher ? { publisher: input.source.publisher.trim() } : {}),
      revision: input.source.revision?.trim() ?? '',
    }),
    retrievedAt: new Date(input.retrievedAt).toISOString(),
  });
}

export function zomboidWorkshopEntryId(workshopId: string): string {
  const normalized = workshopId.trim();
  if (!/^\d+$/.test(normalized)) throw new TypeError('workshopId inválido');
  return `zomboid:workshop:${normalized}`;
}
