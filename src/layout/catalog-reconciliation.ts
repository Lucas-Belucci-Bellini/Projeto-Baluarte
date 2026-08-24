/**
 * UI-04 — reconciliação controlada do catálogo de navegação.
 *
 * O resultado é uma matriz de decisão, não uma nova fonte de rotas. Nenhuma
 * linha autoriza ocultar, liberar ou registrar uma rota; ela apenas torna
 * explícito o que precisa ser alinhado antes de promover o Registry para a
 * navegação pública.
 */

import type { RegistryNavigationEntry } from '../../v2/core/registry';
import {
  observeRegistryNavigation,
} from './registry-observer';
import type {
  NavigationObservation,
} from './registry-observer';
import type { NavGroup } from './sidebar';

export type CatalogReconciliationDisposition =
  | 'aligned'
  | 'metadata-mismatch'
  | 'registry-only'
  | 'legacy-only';

export type CatalogReconciliationAction =
  | 'no-action'
  | 'align-metadata-before-promotion'
  | 'defer-registry-promotion'
  | 'preserve-v1-fallback';

export interface CatalogReconciliationRow {
  readonly path: string;
  readonly registryModuleId: string | null;
  readonly registryLabel: string | null;
  readonly legacyLabel: string | null;
  readonly registryDomain: string | null;
  readonly legacyDomain: string | null;
  readonly disposition: CatalogReconciliationDisposition;
  readonly action: CatalogReconciliationAction;
  readonly promotionAllowed: boolean;
}

export interface CatalogReconciliationSummary {
  readonly total: number;
  readonly aligned: number;
  readonly metadataMismatch: number;
  readonly registryOnly: number;
  readonly legacyOnly: number;
  readonly promotionCandidates: number;
}

export interface CatalogReconciliation {
  readonly observation: NavigationObservation;
  readonly rows: readonly CatalogReconciliationRow[];
  readonly summary: CatalogReconciliationSummary;
}

function rowForPath(
  path: string,
  observation: NavigationObservation,
): CatalogReconciliationRow {
  const registry = observation.projection.entries.find(
    (entry) => entry.path === path,
  );
  const legacy = observation.legacyProjection.entries.find(
    (entry) => entry.path === path,
  );

  if (!registry && !legacy) {
    throw new Error(`path ausente nas projeções de reconciliação: ${path}`);
  }

  const metadataMismatch = Boolean(
    registry
      && legacy
      && (
        registry.label !== legacy.label
        || registry.icon !== legacy.icon
        || registry.domainId !== legacy.domainId
      ),
  );
  const disposition: CatalogReconciliationDisposition = !registry
    ? 'legacy-only'
    : !legacy
      ? 'registry-only'
      : metadataMismatch
        ? 'metadata-mismatch'
        : 'aligned';

  const action: CatalogReconciliationAction =
    disposition === 'aligned'
      ? 'no-action'
      : disposition === 'metadata-mismatch'
        ? 'align-metadata-before-promotion'
        : disposition === 'registry-only'
          ? 'defer-registry-promotion'
          : 'preserve-v1-fallback';

  return {
    path,
    registryModuleId: registry?.moduleId ?? null,
    registryLabel: registry?.label ?? null,
    legacyLabel: legacy?.label ?? null,
    registryDomain: registry?.domainId ?? null,
    legacyDomain: legacy?.domainId ?? null,
    disposition,
    action,
    promotionAllowed: disposition === 'aligned',
  };
}

export function reconcileNavigationCatalogs(
  entries: readonly RegistryNavigationEntry[],
  options: {
    readonly legacyGroups?: readonly NavGroup[];
    readonly currentPhase?: number;
  } = {},
): CatalogReconciliation {
  const observation = observeRegistryNavigation(entries, options);
  const paths = [...new Set([
    ...observation.parity.registryPaths,
    ...observation.parity.legacyPaths,
  ])].sort((left, right) => left.localeCompare(right));
  const rows = paths.map((path) => rowForPath(path, observation));

  const summary: CatalogReconciliationSummary = {
    total: rows.length,
    aligned: rows.filter((row) => row.disposition === 'aligned').length,
    metadataMismatch: rows.filter((row) => row.disposition === 'metadata-mismatch').length,
    registryOnly: rows.filter((row) => row.disposition === 'registry-only').length,
    legacyOnly: rows.filter((row) => row.disposition === 'legacy-only').length,
    promotionCandidates: rows.filter((row) => row.promotionAllowed).length,
  };

  return { observation, rows, summary };
}
