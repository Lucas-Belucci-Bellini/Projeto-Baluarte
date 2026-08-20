/**
 * UI-01 — projeção de navegação.
 *
 * Este módulo não cria um segundo router nem uma segunda fonte de rotas. Ele
 * projeta o catálogo legado `NAV_GROUPS` para o contrato que a PHASE UI poderá
 * consumir progressivamente. O shell atual continua sendo o runtime oficial.
 */

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

export interface NavigationEntry {
  readonly id: string;
  readonly path: string;
  readonly label: string;
  readonly title: string;
  readonly icon: string;
  readonly phase: number;
  readonly maturity: NavigationMaturity;
  readonly availability: AvailabilityState;
  readonly domainId: string;
  readonly source: 'legacy-sidebar';
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

export function findNavigationEntry(
  projection: NavigationProjection,
  path: string,
): NavigationEntry | null {
  const normalized = normalizePath(path);
  return projection.entries.find((entry) => entry.path === normalized) ?? null;
}
