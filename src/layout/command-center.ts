/**
 * PHASE UI — contrato read-only do Command Center.
 *
 * A projeção organiza entradas já existentes do NavigationProjection em grandes
 * sistemas. Ela não cria rotas, não cria um Event Bus, não autoriza comandos e
 * não altera a sidebar pública. Um domínio sem mapeamento permanece visível na
 * categoria de fallback para não apagar superfície durante a migração.
 */

import type {
  AvailabilityState,
  NavigationEntry,
  NavigationProjection,
} from './navigation';

export interface CommandCenterCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly domainIds: readonly string[];
  readonly order: number;
}

export interface CommandDescriptor {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly path: string;
  readonly icon: string;
  readonly categoryId: string;
  readonly keywords: readonly string[];
  readonly availability: AvailabilityState;
  readonly moduleId: string | null;
  readonly source: NavigationEntry['source'];
}

export interface CommandCenterCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly order: number;
  readonly fallback: boolean;
  readonly commands: readonly CommandDescriptor[];
}

export interface CommandCenterProjection {
  readonly categories: readonly CommandCenterCategory[];
  readonly commands: readonly CommandDescriptor[];
  readonly queryPlaceholder: string;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function descriptorFor(
  entry: NavigationEntry,
  categoryId: string,
): CommandDescriptor {
  return {
    id: `command:${entry.id}`,
    label: entry.label,
    title: entry.title,
    path: entry.path,
    icon: entry.icon,
    categoryId,
    keywords: [
      normalize(entry.label),
      normalize(entry.title),
      normalize(entry.path),
      normalize(entry.domainId),
    ].filter((keyword, index, values) => values.indexOf(keyword) === index),
    availability: entry.availability,
    moduleId: entry.moduleId,
    source: entry.source,
  };
}

function assertDefinitions(
  definitions: readonly CommandCenterCategoryDefinition[],
): void {
  const ids = new Set<string>();
  const domains = new Set<string>();
  for (const definition of definitions) {
    if (definition.id.trim() === '' || ids.has(definition.id)) {
      throw new Error(`Categoria de Command Center inválida ou duplicada: ${definition.id}`);
    }
    ids.add(definition.id);
    for (const domainId of definition.domainIds) {
      if (domains.has(domainId)) {
        throw new Error(`Domínio mapeado em mais de uma categoria: ${domainId}`);
      }
      domains.add(domainId);
    }
  }
}

export function projectCommandCenter(
  projection: NavigationProjection,
  definitions: readonly CommandCenterCategoryDefinition[],
): CommandCenterProjection {
  assertDefinitions(definitions);

  const definitionByDomain = new Map<string, CommandCenterCategoryDefinition>();
  for (const definition of definitions) {
    for (const domainId of definition.domainIds) {
      definitionByDomain.set(domainId, definition);
    }
  }

  const fallbackDefinition: CommandCenterCategoryDefinition = {
    id: 'unassigned',
    label: 'Outros sistemas',
    icon: '◇',
    domainIds: [],
    order: Number.MAX_SAFE_INTEGER,
  };
  const hasUnassigned = projection.domains.some(
    (domain) => !definitionByDomain.has(domain.id),
  );
  const allDefinitions = hasUnassigned
    ? [...definitions, fallbackDefinition]
    : [...definitions];
  const commandsByCategory = new Map<string, CommandDescriptor[]>();

  for (const definition of allDefinitions) {
    commandsByCategory.set(definition.id, []);
  }

  for (const entry of projection.entries) {
    const definition = definitionByDomain.get(entry.domainId) ?? fallbackDefinition;
    commandsByCategory.get(definition.id)?.push(descriptorFor(entry, definition.id));
  }

  const categories = allDefinitions
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
      icon: definition.icon,
      order: definition.order,
      fallback: definition.id === fallbackDefinition.id,
      commands: commandsByCategory.get(definition.id) ?? [],
    }))
    .filter((category) => category.commands.length > 0 || !category.fallback)
    .sort((left, right) => left.order - right.order);

  return {
    categories,
    commands: categories.flatMap((category) => category.commands),
    queryPlaceholder: 'Buscar ou executar comando…',
  };
}

export function searchCommandCenter(
  projection: CommandCenterProjection,
  query: string,
): readonly CommandDescriptor[] {
  const term = normalize(query);
  if (term === '') return projection.commands;
  return projection.commands.filter((command) =>
    command.keywords.some((keyword) => keyword.includes(term)),
  );
}
