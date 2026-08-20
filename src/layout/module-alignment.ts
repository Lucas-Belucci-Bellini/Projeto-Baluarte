/**
 * PHASE UI — piloto de alinhamento por módulo.
 *
 * Este módulo combina evidências já produzidas pelo Registry e pelo observador
 * com health e deep-link fornecidos pelo ambiente de execução. Ele produz uma
 * recomendação auditável, mas não altera DOM, router, permissões ou Auth.
 */

import type { CatalogReconciliationRow } from './catalog-reconciliation';

export type AlignmentHealthMode =
  | 'registered'
  | 'healthy'
  | 'degraded'
  | 'quarantined'
  | 'maintenance'
  | 'disabled'
  | 'unregistered';

export type AlignmentHealthStatus =
  | 'unknown'
  | 'healthy'
  | 'failed'
  | 'exhausted'
  | 'unregistered';

export type AlignmentHealthSource =
  | 'runtime-registry'
  | 'server-authority'
  | 'unknown';

export type AlignmentDeepLink = 'verified' | 'unverified' | 'broken';

export type AlignmentFallback =
  | 'v1-preserved'
  | 'registry-observation'
  | 'none';

export type ModuleAlignmentOutcome =
  | 'keep-v1'
  | 'observe-registry'
  | 'promotion-candidate'
  | 'blocked';

export interface ModuleAlignmentEvidence {
  readonly health: {
    readonly mode: AlignmentHealthMode;
    readonly status: AlignmentHealthStatus;
    readonly source: AlignmentHealthSource;
  };
  readonly deepLink: AlignmentDeepLink;
  readonly fallback: AlignmentFallback;
}

export interface ModuleAlignmentDecision {
  readonly moduleId: string | null;
  readonly path: string;
  readonly outcome: ModuleAlignmentOutcome;
  readonly allowPublicPromotion: boolean;
  readonly normalUserAction: 'preserve-current-surface';
  readonly reasons: readonly string[];
  readonly evidence: ModuleAlignmentEvidence;
}

function healthIsHealthy(evidence: ModuleAlignmentEvidence): boolean {
  return evidence.health.mode === 'healthy'
    && evidence.health.status === 'healthy'
    && (
      evidence.health.source === 'runtime-registry'
      || evidence.health.source === 'server-authority'
    );
}

function reasonForRow(row: CatalogReconciliationRow): string {
  switch (row.disposition) {
    case 'aligned':
      return 'catálogo alinhado';
    case 'metadata-mismatch':
      return 'metadados do Registry e V1 precisam ser alinhados';
    case 'registry-only':
      return 'módulo existe no Registry, mas ainda não no catálogo V1';
    case 'legacy-only':
      return 'rota V1 ainda não foi publicada pelo Registry';
  }
}

export function decideModuleAlignment(
  row: CatalogReconciliationRow,
  evidence: ModuleAlignmentEvidence,
): ModuleAlignmentDecision {
  const reasons: string[] = [reasonForRow(row)];
  const healthy = healthIsHealthy(evidence);

  if (!healthy) {
    reasons.push('health não está saudável em uma fonte operacional válida');
  }
  if (evidence.deepLink !== 'verified') {
    reasons.push(`deep link está ${evidence.deepLink}`);
  }
  if (evidence.fallback !== 'v1-preserved') {
    reasons.push('fallback V1 não está preservado');
  }
  if (evidence.health.source === 'unknown') {
    reasons.push('fonte de health desconhecida não pode decidir promoção');
  }

  const allowPublicPromotion = row.disposition === 'aligned'
    && healthy
    && evidence.deepLink === 'verified'
    && evidence.fallback === 'v1-preserved';

  let outcome: ModuleAlignmentOutcome;
  if (allowPublicPromotion) {
    outcome = 'promotion-candidate';
  } else if (row.disposition === 'legacy-only') {
    outcome = 'keep-v1';
  } else if (!healthy || evidence.deepLink === 'broken') {
    outcome = 'blocked';
  } else {
    outcome = 'observe-registry';
  }

  return {
    moduleId: row.registryModuleId,
    path: row.path,
    outcome,
    allowPublicPromotion,
    normalUserAction: 'preserve-current-surface',
    reasons,
    evidence,
  };
}
