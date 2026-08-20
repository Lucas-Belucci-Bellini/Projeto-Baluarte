/**
 * Gate de promoção controlada de uma superfície modular.
 *
 * A função não promove nada. Ela apenas classifica se existe evidência mínima
 * para uma futura ação operacional explícita. Sem claims server-side válidas,
 * o resultado é bloqueado mesmo quando o módulo está alinhado e saudável.
 */

import type { ModuleAlignmentDecision } from './module-alignment';

export type PromotionAuthoritySource =
  | 'server-claims'
  | 'local-test'
  | 'client-only'
  | 'unknown';

export type PromotionActorRole = 'admin' | 'developer' | 'owner' | 'user' | 'unknown';

export interface PromotionAuthorityEvidence {
  readonly source: PromotionAuthoritySource;
  readonly permitted: boolean;
  readonly actorRole: PromotionActorRole;
  readonly requestId: string | null;
  readonly auditId: string | null;
}

export interface PromotionRollbackEvidence {
  readonly reversible: boolean;
  readonly fallbackPath: string;
  readonly rollbackReference: string;
}

export interface PromotionGateInput {
  readonly alignment: ModuleAlignmentDecision;
  readonly authority: PromotionAuthorityEvidence;
  readonly rollback: PromotionRollbackEvidence;
}

export interface PromotionGateDecision {
  readonly eligibleForControlledRollout: boolean;
  readonly publicPromotionAllowed: false;
  readonly status: 'eligible' | 'blocked';
  readonly reasons: readonly string[];
}

const AUTHORIZED_ROLES: readonly PromotionActorRole[] = [
  'admin',
  'developer',
  'owner',
];

function hasServerAuthority(authority: PromotionAuthorityEvidence): boolean {
  return authority.source === 'server-claims'
    && authority.permitted
    && AUTHORIZED_ROLES.includes(authority.actorRole)
    && authority.requestId !== null
    && authority.auditId !== null;
}

export function evaluatePromotionGate(
  input: PromotionGateInput,
): PromotionGateDecision {
  const reasons: string[] = [];
  if (!input.alignment.allowPublicPromotion) {
    reasons.push('alinhamento do módulo ainda não é candidato');
  }
  if (!hasServerAuthority(input.authority)) {
    reasons.push('claims server-side válidas não foram confirmadas');
  }
  if (!input.rollback.reversible || input.rollback.fallbackPath.trim() === '') {
    reasons.push('rollback reversível com fallback explícito é obrigatório');
  }
  if (input.rollback.rollbackReference.trim() === '') {
    reasons.push('referência de rollback é obrigatória');
  }

  const eligibleForControlledRollout = input.alignment.allowPublicPromotion
    && hasServerAuthority(input.authority)
    && input.rollback.reversible
    && input.rollback.fallbackPath.trim() !== ''
    && input.rollback.rollbackReference.trim() !== '';

  return {
    eligibleForControlledRollout,
    publicPromotionAllowed: false,
    status: eligibleForControlledRollout ? 'eligible' : 'blocked',
    reasons,
  };
}
