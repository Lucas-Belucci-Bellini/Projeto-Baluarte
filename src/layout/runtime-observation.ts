import type { PlatformDiagnostic } from '../../v2/core/plataforma';

export type RuntimeObservationSource =
  | 'visual-only'
  | 'v1-nucleo-event'
  | 'runtime-observed'
  | 'v2-platform-diagnostic';

export type RuntimeConnectionStatus = 'unknown' | 'connected' | 'disconnected';
export type RuntimeHealthStatus = 'unknown' | 'healthy' | 'degraded' | 'failed' | 'exhausted';

export interface RuntimeObservation {
  readonly source: RuntimeObservationSource;
  readonly connection: RuntimeConnectionStatus;
  readonly health: RuntimeHealthStatus;
  readonly authority: 'not-authorized';
  readonly detail?: string;
  readonly moduleCount?: number;
  readonly incidentCount?: number;
}

export const VISUAL_ONLY_RUNTIME_OBSERVATION: RuntimeObservation = Object.freeze({
  source: 'visual-only',
  connection: 'unknown',
  health: 'unknown',
  authority: 'not-authorized',
});

function normalizeHealth(
  diagnostic: PlatformDiagnostic,
  incidentCount: number,
): RuntimeHealthStatus {
  const readiness = diagnostic.saude.readiness;
  const failedModules = diagnostic.saude.contagem.falhas;
  if (readiness === 'healthy' && failedModules === 0 && incidentCount === 0) return 'healthy';
  if (readiness === 'healthy' || failedModules > 0 || incidentCount > 0) return 'degraded';
  if (diagnostic.supervisor.estado === 'failed') return 'failed';
  return 'unknown';
}

function normalizeConnection(diagnostic: PlatformDiagnostic): RuntimeConnectionStatus {
  if (diagnostic.supervisor.estado === 'ready') return 'connected';
  if (diagnostic.supervisor.estado === 'failed' || diagnostic.supervisor.estado === 'stopped') {
    return 'disconnected';
  }
  return 'unknown';
}

export function projectPlatformDiagnostic(
  diagnostic: PlatformDiagnostic | null | undefined,
): RuntimeObservation {
  if (!diagnostic) return VISUAL_ONLY_RUNTIME_OBSERVATION;

  const moduleCount = diagnostic.registry.modulos.length;
  const incidentCount = diagnostic.registry.incidentes.filter((incident) => incident.status !== 'healthy').length;
  const health = normalizeHealth(diagnostic, incidentCount);
  const connection = normalizeConnection(diagnostic);
  const detail = [
    `supervisor=${diagnostic.supervisor.estado}`,
    `readiness=${diagnostic.saude.readiness}`,
    `módulos=${moduleCount}`,
    `incidentes=${incidentCount}`,
  ].join(' · ');

  return {
    source: 'v2-platform-diagnostic',
    connection,
    health,
    authority: 'not-authorized',
    detail,
    moduleCount,
    incidentCount,
  };
}
