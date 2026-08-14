export type SupervisorState =
  | 'idle'
  | 'starting'
  | 'ready'
  | 'degraded'
  | 'stopping'
  | 'stopped'
  | 'failed';

export interface SupervisorStatus {
  estado: SupervisorState;
  inicio: number | null;
  duracaoMs: number | null;
  ultimaFalha: string | null;
  health: unknown;
  diagnostico: unknown;
}

export interface Supervisor {
  iniciar(): Promise<unknown>;
  parar(): Promise<unknown>;
  status(): SupervisorStatus;
  estado(): SupervisorState;
}

export function criarSupervisor(
  boot: {
    subir(): Promise<{ falhas: ReadonlyArray<unknown> }>;
    descer(): Promise<unknown>;
    diagnostico?(): unknown;
  },
  health: {
    definirEstado?(state: SupervisorState): void;
    retrato(): unknown;
  },
  options?: { agora?: () => number },
): Supervisor;
