/**
 * UI-03 — observação do Registry no shell.
 *
 * Este módulo é deliberadamente passivo. Ele projeta o catálogo V2 e compara
 * seus paths, rótulos, ícones e domínios com a projeção legada, mas não monta
 * elementos, não registra rotas, não decide permissões e não altera a sidebar.
 *
 * A integração de produção deverá consumir este contrato depois de o Boot V2
 * concluir sua subida. Nesta etapa o harness é o único consumidor operacional.
 */

import type { RegistryNavigationEntry } from '../../v2/core/registry';
import {
  projectLegacyNavigation,
  projectRegistryNavigation,
} from './navigation';
import type {
  NavigationEntry,
  NavigationProjection,
} from './navigation';
import { NAV_GROUPS } from './sidebar';
import type { NavGroup } from './sidebar';

export type NavigationParityField = 'label' | 'icon' | 'domainId';

export interface NavigationParityMismatch {
  readonly path: string;
  readonly fields: readonly NavigationParityField[];
}

export interface NavigationParity {
  readonly exact: boolean;
  readonly registryPaths: readonly string[];
  readonly legacyPaths: readonly string[];
  readonly sharedPaths: readonly string[];
  readonly registryOnly: readonly string[];
  readonly legacyOnly: readonly string[];
  readonly mismatches: readonly NavigationParityMismatch[];
}

export interface NavigationObservation {
  readonly source: 'registry-observer';
  readonly projection: NavigationProjection;
  readonly legacyProjection: NavigationProjection;
  readonly parity: NavigationParity;
}

export interface RegistryNavigationObserverOptions {
  readonly legacyGroups?: readonly NavGroup[];
  readonly currentPhase?: number;
}

export interface RegistryNavigationObserver {
  observe(entries: readonly RegistryNavigationEntry[]): NavigationObservation;
  latest(): NavigationObservation | null;
}

function compareEntries(
  registryEntries: readonly NavigationEntry[],
  legacyEntries: readonly NavigationEntry[],
): NavigationParity {
  const registryByPath = new Map(
    registryEntries.map((entry) => [entry.path, entry]),
  );
  const legacyByPath = new Map(
    legacyEntries.map((entry) => [entry.path, entry]),
  );

  const registryPaths = registryEntries.map((entry) => entry.path);
  const legacyPaths = legacyEntries.map((entry) => entry.path);
  const sharedPaths = legacyPaths.filter((path) => registryByPath.has(path));
  const registryOnly = registryPaths.filter((path) => !legacyByPath.has(path));
  const legacyOnly = legacyPaths.filter((path) => !registryByPath.has(path));
  const mismatches: NavigationParityMismatch[] = [];

  for (const path of sharedPaths) {
    const registry = registryByPath.get(path);
    const legacy = legacyByPath.get(path);
    if (!registry || !legacy) continue;

    const fields: NavigationParityField[] = [];
    if (registry.label !== legacy.label) fields.push('label');
    if (registry.icon !== legacy.icon) fields.push('icon');
    if (registry.domainId !== legacy.domainId) fields.push('domainId');
    if (fields.length > 0) mismatches.push({ path, fields });
  }

  return {
    exact:
      registryOnly.length === 0
      && legacyOnly.length === 0
      && mismatches.length === 0,
    registryPaths,
    legacyPaths,
    sharedPaths,
    registryOnly,
    legacyOnly,
    mismatches,
  };
}

export function observeRegistryNavigation(
  entries: readonly RegistryNavigationEntry[],
  options: RegistryNavigationObserverOptions = {},
): NavigationObservation {
  const projection = projectRegistryNavigation(entries);
  const legacyProjection = projectLegacyNavigation(
    options.legacyGroups ?? NAV_GROUPS,
    { currentPhase: options.currentPhase ?? Number.MAX_SAFE_INTEGER },
  );

  return {
    source: 'registry-observer',
    projection,
    legacyProjection,
    parity: compareEntries(projection.entries, legacyProjection.entries),
  };
}

export function createRegistryNavigationObserver(
  options: RegistryNavigationObserverOptions = {},
): RegistryNavigationObserver {
  let observation: NavigationObservation | null = null;

  return {
    observe(entries): NavigationObservation {
      observation = observeRegistryNavigation(entries, options);
      return observation;
    },
    latest(): NavigationObservation | null {
      return observation;
    },
  };
}
