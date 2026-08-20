import type { PlatformDiagnostic } from '../../v2/core/plataforma';

export type RuntimeObservationSource =
  | 'visual-only'
  | 'v1-nucleo-event'
  | 'runtime-observed'
  | 'v2-platform-diagnostic';

export type RuntimeConnectionStatus = 'unknown' | 'connected' | 'disconnected';
export type RuntimeHealthStatus = 'unknown' | 'healthy' | 'degraded' | 'failed' | 'exhausted';
export type RuntimeObservationSeverity = 'none' | 'info' | 'warning' | 'critical';
export type RuntimeFallbackState = 'unknown' | 'available' | 'degraded' | 'blocked';

export interface RuntimeObservation {
  readonly source: RuntimeObservationSource;
  readonly connection: RuntimeConnectionStatus;
  readonly health: RuntimeHealthStatus;
  readonly severity: RuntimeObservationSeverity;
  readonly fallback: RuntimeFallbackState;
  readonly authority: 'not-authorized';
  readonly detail?: string;
  readonly moduleCount?: number;
  readonly incidentCount?: number;
}

export const VISUAL_ONLY_RUNTIME_OBSERVATION: RuntimeObservation = Object.freeze({
  source: 'visual-only',
  connection: 'unknown',
  health: 'unknown',
  severity: 'info',
  fallback: 'available',
  authority: 'not-authorized',
});

function normalizeHealth(
  diagnostic: PlatformDiagnostic,
  incidentCount: number,
): RuntimeHealthStatus {
  const readiness = diagnostic.saude.readiness;
  const failedModules = diagnostic.saude.contagem.falhas;
  const exhaustedIncident = diagnostic.registry.incidentes.some((incident) => incident.status === 'exhausted');
  const exhaustedModule = diagnostic.registry.modulos.some((module) => module.status === 'exhausted');
  if (diagnostic.supervisor.estado === 'failed') return 'failed';
  if (exhaustedIncident || exhaustedModule) return 'exhausted';
  if (readiness === 'healthy' && failedModules === 0 && incidentCount === 0) return 'healthy';
  if (readiness === 'healthy' || failedModules > 0 || incidentCount > 0 || diagnostic.supervisor.estado === 'ready') {
    return 'degraded';
  }
  return 'unknown';
}

function normalizeConnection(diagnostic: PlatformDiagnostic): RuntimeConnectionStatus {
  if (diagnostic.supervisor.estado === 'ready') return 'connected';
  if (diagnostic.supervisor.estado === 'failed' || diagnostic.supervisor.estado === 'stopped') {
    return 'disconnected';
  }
  return 'unknown';
}

function severityFor(
  health: RuntimeHealthStatus,
  connection: RuntimeConnectionStatus,
): RuntimeObservationSeverity {
  if (health === 'failed' || health === 'exhausted') return 'critical';
  if (health === 'degraded') return 'warning';
  if (health === 'healthy' && connection === 'connected') return 'none';
  return 'info';
}

function fallbackFor(
  health: RuntimeHealthStatus,
  connection: RuntimeConnectionStatus,
): RuntimeFallbackState {
  if (health === 'healthy') return 'available';
  if (health === 'degraded') return 'degraded';
  if (health === 'failed' || health === 'exhausted' || connection === 'disconnected') return 'blocked';
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
    severity: severityFor(health, connection),
    fallback: fallbackFor(health, connection),
    authority: 'not-authorized',
    detail,
    moduleCount,
    incidentCount,
  };
}
