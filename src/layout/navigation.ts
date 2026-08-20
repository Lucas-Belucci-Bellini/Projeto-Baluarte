/**
 * UI-01 — projeção de navegação.
 *
 * Este módulo não cria um segundo router nem uma segunda fonte de rotas. Ele
 * projeta o catálogo legado `NAV_GROUPS` para o contrato que a PHASE UI poderá
 * consumir progressivamente. O shell atual continua sendo o runtime oficial.
 */

import type { RegistryNavigationEntry } from '../../v2/core/registry';
import type { Stability } from '../../v2/core/manifest';
import type { NavGroup, NavItem } from './sidebar';

export const AVAILABILITY_STATES = [
  'enabled',
  'degraded',
  'disabled',
  'maintenance',
  'experimental',
  'quarantined',
] as const;

export type AvailabilityState = (typeof AVAILABILITY_STATES)[number];

export type NavigationMaturity = 'stable' | 'planned';

export type NavigationSource = 'legacy-sidebar' | 'registry';

export interface NavigationEntry {
  readonly id: string;
  readonly path: string;
  readonly label: string;
  readonly title: string;
  readonly icon: string;
  readonly phase: number | null;
  readonly maturity: NavigationMaturity;
  readonly availability: AvailabilityState;
  readonly domainId: string;
  readonly moduleId: string | null;
  readonly order: number | null;
  readonly stability: Stability | null;
  readonly source: NavigationSource;
}

export interface NavigationDomain {
  readonly id: string;
  readonly label: string;
  readonly entries: readonly NavigationEntry[];
}

export interface NavigationProjection {
  readonly domains: readonly NavigationDomain[];
  readonly entries: readonly NavigationEntry[];
}

export interface NavigationProjectionOptions {
  readonly currentPhase: number;
  readonly titleForPath?: (path: string, fallback: string) => string;
  readonly availabilityForPath?: (
    path: string,
    entry: NavItem,
  ) => AvailabilityState;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePath(path: string): string {
  if (path === '/') return path;
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.replace(/\/+$/g, '');
}

function entryId(domainId: string, path: string): string {
  return `${domainId}:${normalizePath(path).replace(/^\//, '').replace(/\//g, ':')}`;
}

function createEntry(
  domain: NavGroup,
  item: NavItem,
  options: NavigationProjectionOptions,
): NavigationEntry {
  const domainId = slugify(domain.label);
  const path = normalizePath(item.path);
  const label = item.label.trim();
  const title = options.titleForPath?.(path, label) ?? label;
  const availability = options.availabilityForPath?.(path, item) ?? 'enabled';

  if (!AVAILABILITY_STATES.includes(availability)) {
    throw new Error(`Estado de disponibilidade inválido para ${path}: ${availability}`);
  }

  return {
    id: entryId(domainId, path),
    path,
    label,
    title,
    icon: item.icon,
    phase: item.phase,
    maturity: item.phase <= options.currentPhase ? 'stable' : 'planned',
    availability,
    domainId,
    moduleId: null,
    order: null,
    stability: null,
    source: 'legacy-sidebar',
  };
}

/**
 * Projeta o catálogo legado para uma estrutura de domínios estável e testável.
 * Paths duplicados são rejeitados para não mascarar divergência de catálogo.
 */
export function projectLegacyNavigation(
  groups: readonly NavGroup[],
  options: NavigationProjectionOptions,
): NavigationProjection {
  const domains: NavigationDomain[] = [];
  const entries: NavigationEntry[] = [];
  const paths = new Set<string>();
  const ids = new Set<string>();

  for (const group of groups) {
    const domainId = slugify(group.label);
    const domainEntries = group.items.map((item) => {
      const entry = createEntry(group, item, options);
      if (paths.has(entry.path)) {
        throw new Error(`Rota duplicada no catálogo de navegação: ${entry.path}`);
      }
      if (ids.has(entry.id)) {
        throw new Error(`ID duplicado no catálogo de navegação: ${entry.id}`);
      }
      paths.add(entry.path);
      ids.add(entry.id);
      entries.push(entry);
      return entry;
    });

    domains.push({
      id: domainId,
      label: group.label,
      entries: domainEntries,
    });
  }

  return { domains, entries };
}

function maturityFromStability(stability: Stability): NavigationMaturity {
  return stability === 'estavel' ? 'stable' : 'planned';
}

/**
 * Projeta a navegação já validada e selada pelo Registry V2.
 *
 * A disponibilidade continua explícita e conservadora: estabilidade do módulo
 * não é health. Sem um callback autorizado, o item permanece `enabled`.
 */
export function projectRegistryNavigation(
  entries: readonly RegistryNavigationEntry[],
  options: {
    readonly availabilityForModule?: (
      moduleId: string,
      entry: RegistryNavigationEntry,
    ) => AvailabilityState;
  } = {},
): NavigationProjection {
  const domains = new Map<string, NavigationDomain>();
  const projected: NavigationEntry[] = [];
  const paths = new Set<string>();

  for (const entry of entries) {
    const path = normalizePath(entry.path);
    if (paths.has(path)) {
      throw new Error(`Rota duplicada na navegação do Registry: ${path}`);
    }
    paths.add(path);

    const domainLabel = entry.secao?.trim() || 'Sem seção';
    const domainId = slugify(domainLabel);
    const availability =
      options.availabilityForModule?.(entry.modulo, entry) ?? 'enabled';
    const projectedEntry: NavigationEntry = {
      id: `${entry.modulo}:${path.replace(/^\//, '').replace(/\//g, ':')}`,
      path,
      label: entry.nome,
      title: entry.nome,
      icon: entry.icone,
      phase: null,
      maturity: maturityFromStability(entry.estabilidade),
      availability,
      domainId,
      moduleId: entry.modulo,
      order: entry.ordem,
      stability: entry.estabilidade,
      source: 'registry',
    };

    projected.push(projectedEntry);
    const domain = domains.get(domainId);
    if (domain) {
      domain.entries = [...domain.entries, projectedEntry];
    } else {
      domains.set(domainId, {
        id: domainId,
        label: domainLabel,
        entries: [projectedEntry],
      });
    }
  }

  return { domains: [...domains.values()], entries: projected };
}

export function findNavigationEntry(
  projection: NavigationProjection,
  path: string,
): NavigationEntry | null {
  const normalized = normalizePath(path);
  return projection.entries.find((entry) => entry.path === normalized) ?? null;
}
