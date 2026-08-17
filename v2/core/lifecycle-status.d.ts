import type { LifecycleFailure, ModuleCycle } from './ciclo.js';
import type { ModuleRegistry } from './registry.js';

export type ModuleLifecycleState =
  | 'registered'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'failed'
  | 'stopped';

export interface LifecycleModuleStatus {
  modulo: string;
  nome: string;
  versao: string | null;
  estado: ModuleLifecycleState;
  falha: LifecycleFailure | null;
}

export interface LifecycleSummary {
  total: number;
  running: number;
  starting: number;
  stopping: number;
  failed: number;
  stopped: number;
  registered: number;
}

export interface LifecycleStatus {
  estadoDo(moduleId: string): ModuleLifecycleState;
  retrato(): LifecycleModuleStatus[];
  resumo(): LifecycleSummary;
}

export function criarStatusLifecycle(
  registry: ModuleRegistry,
  cycle: Pick<ModuleCycle, 'vivos' | 'falhas' | 'emTransicao' | 'fase'>,
): LifecycleStatus;
