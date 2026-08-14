export type HealthStatus = 'healthy' | 'unhealthy';

export interface HealthSnapshot {
  liveness: HealthStatus;
  readiness: HealthStatus;
  fase: string;
  motivos: string[];
  contagem: {
    modulos: number;
    falhas: number;
    eventosOrfaos: number;
    referenciasOrfas: number;
  };
}

export interface HealthMonitor {
  definirEstado(state: string): void;
  verificar(): HealthSnapshot;
  retrato(): HealthSnapshot & { estado: string };
}

export function criarMonitorSaude(boot: {
  diagnostico(): unknown;
}): HealthMonitor;
