import {
  evaluatePromotionGate,
  type PromotionAuthorityEvidence,
  type PromotionGateDecision,
  type PromotionRollbackEvidence,
} from './promotion-gate';
import type { ModuleAlignmentDecision } from './module-alignment';
import type { ServerObservationEnvelope } from './server-observation';

export interface ControlledRolloutEvidenceInput {
  readonly alignment: ModuleAlignmentDecision;
  readonly observation: ServerObservationEnvelope | null | undefined;
  readonly authority: PromotionAuthorityEvidence;
  readonly rollback: PromotionRollbackEvidence;
}

export interface ControlledRolloutEvidenceDecision extends PromotionGateDecision {
  readonly observationReady: boolean;
  readonly normalUserAction: 'preserve-current-surface';
}

function observationIsReady(
  observation: ServerObservationEnvelope | null | undefined,
): boolean {
  return observation !== null
    && observation !== undefined
    && observation.authority === 'not-authorized'
    && observation.evidence.healthObserved
    && observation.evidence.claimsObserved
    && observation.evidence.claimsFresh
    && observation.evidence.severity === 'none'
    && observation.evidence.fallback === 'available'
    && observation.transport.rateLimited === false;
}

function uniqueReasons(reasons: readonly string[]): string[] {
  return [...new Set(reasons.filter((reason) => reason.trim() !== ''))];
}

export function evaluateControlledRolloutEvidence(
  input: ControlledRolloutEvidenceInput,
): ControlledRolloutEvidenceDecision {
  const promotion = evaluatePromotionGate({
    alignment: input.alignment,
    authority: input.authority,
    rollback: input.rollback,
  });
  const observationReady = observationIsReady(input.observation);
  const reasons = [...promotion.reasons];

  if (!observationReady) {
    reasons.push(input.observation ? 'server-observation não está pronta' : 'server-observation ausente');
  }

  const eligibleForControlledRollout = promotion.eligibleForControlledRollout && observationReady;
  return {
    ...promotion,
    observationReady,
    eligibleForControlledRollout,
    status: eligibleForControlledRollout ? 'eligible' : 'blocked',
    publicPromotionAllowed: false,
    normalUserAction: 'preserve-current-surface',
    reasons: uniqueReasons(reasons),
  };
}
