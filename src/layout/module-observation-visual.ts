import type { AvailabilityState } from './navigation';
import type {
  ServerObservationEnvelope,
  ServerObservationReasonCode,
} from './server-observation';

export type ModuleObservationVisualOutcome = 'observe-only' | 'preserve-v1';
export type ModuleObservationVisualFallback = 'v1-preserved';

export type ModuleObservationReason = ServerObservationReasonCode | 'observation-missing';

export interface ModuleObservationVisualDecision {
  readonly moduleId: string;
  readonly availability: AvailabilityState;
  readonly fallback: ModuleObservationVisualFallback;
  readonly outcome: ModuleObservationVisualOutcome;
  readonly reasons: readonly ModuleObservationReason[];
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

function observationIsReady(observation: ServerObservationEnvelope): boolean {
  return observation.authority === 'not-authorized'
    && observation.evidence.healthObserved
    && observation.evidence.claimsObserved
    && observation.evidence.claimsFresh
    && observation.evidence.severity === 'none'
    && observation.evidence.fallback === 'available'
    && observation.transport.rateLimited === false;
}

function reasonsForObservation(
  observation: ServerObservationEnvelope,
): ModuleObservationReason[] {
  const reasons = [...observation.evidence.reasonCodes] as ModuleObservationReason[];
  if (reasons.length === 0) reasons.push('claims-absent');
  return [...new Set(reasons)];
}

export function projectModuleObservationVisual(
  moduleId: string,
  observation: ServerObservationEnvelope | null | undefined,
): ModuleObservationVisualDecision {
  const normalizedModuleId = moduleId.trim() || 'unknown-module';
  if (!observation) {
    return {
      moduleId: normalizedModuleId,
      availability: 'degraded',
      fallback: 'v1-preserved',
      outcome: 'preserve-v1',
      reasons: ['observation-missing'],
      authority: 'not-authorized',
      publicPromotionAllowed: false,
    };
  }

  const ready = observationIsReady(observation);
  return {
    moduleId: normalizedModuleId,
    availability: ready ? 'enabled' : 'degraded',
    fallback: 'v1-preserved',
    outcome: 'observe-only',
    reasons: reasonsForObservation(observation),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  };
}

export function availabilityForObservedModule(
  observations: Readonly<Record<string, ServerObservationEnvelope | null | undefined>>,
): (moduleId: string) => AvailabilityState {
  return (moduleId: string): AvailabilityState => projectModuleObservationVisual(
    moduleId,
    observations[moduleId],
  ).availability;
}
