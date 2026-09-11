/**
 * Fachada operacional da V2.
 *
 * A Plataforma compõe Boot, Supervisor, Health e Lifecycle Status sem tomar
 * posse das responsabilidades de cada contrato.
 */

import { criarMonitorSaude } from './saude.js';
import { criarStatusLifecycle } from './lifecycle-status.js';
import { criarSupervisor } from './supervisor.js';
import type { Boot } from './boot.js';
import type { HealthMonitor } from './saude.js';
import type {
  LifecycleStatus,
  LifecycleSummary,
  LifecycleModuleStatus,
} from './lifecycle-status.js';
import type { ModuleRegistry } from './registry.js';
import type { Supervisor, SupervisorStatus } from './supervisor.js';
import type { Escalonador, SaudeEscalonador } from './trabalho.js';
import type { criarBus } from './bus.js';

export interface RegistryDiagnosticEntry {
  id: string;
  mode: string;
  status: string;
  restarts: number;
  podeReiniciar: boolean;
  ultimoErro?: string;
}

export interface RegistryDiagnosticIncident {
  type: string;
  id: string;
  timestamp: number;
  status: string;
  restarts: number;
  error?: string;
}

export interface PlatformOptions {
  registryHealth?: {
    resumo(): RegistryDiagnosticEntry[];
    incidentes?(): RegistryDiagnosticIncident[];
  };
  /** Projeção opcional e read-only do escalonador local do Core. */
  trabalho?: Pick<Escalonador, 'saude'>;
  /** Projeção opcional e read-only da saúde do Event Bus local do Core. */
  bus?: Pick<ReturnType<typeof criarBus>, 'saude'>;
}

export interface PlatformDiagnostic {
  supervisor: SupervisorStatus;
  saude: ReturnType<HealthMonitor['verificar']>;
  registry: {
    modulos: RegistryDiagnosticEntry[];
    incidentes: RegistryDiagnosticIncident[];
  };
  lifecycle: {
    modulos: LifecycleModuleStatus[];
    resumo: LifecycleSummary;
  };
  boot: ReturnType<Boot['diagnostico']>;
  trabalho: SaudeEscalonador | null;
  bus: ReturnType<ReturnType<typeof criarBus>['saude']> | null;
}

export interface Platform {
  iniciar(): ReturnType<Supervisor['iniciar']>;
  parar(): ReturnType<Supervisor['parar']>;
  diagnostico(): PlatformDiagnostic;
  supervisor: Supervisor;
  saude: HealthMonitor;
  lifecycle: LifecycleStatus;
}

export function criarPlataforma(
  registry: ModuleRegistry,
  boot: Boot,
  options: PlatformOptions = {},
): Platform {
  if (typeof registry?.listar !== 'function' || typeof registry.modulo !== 'function') {
    throw new TypeError('registry inválido');
  }
  if (
    typeof boot?.subir !== 'function'
    || typeof boot.descer !== 'function'
    || typeof boot.diagnostico !== 'function'
  ) {
    throw new TypeError('boot inválido');
  }
  if (options.trabalho !== undefined && typeof options.trabalho.saude !== 'function') {
    throw new TypeError('trabalho inválido');
  }
  if (options.bus !== undefined && typeof options.bus.saude !== 'function') {
    throw new TypeError('bus inválido');
  }

  const saude = criarMonitorSaude(boot);
  const supervisor = criarSupervisor(boot, saude);
  const lifecycle = criarStatusLifecycle(registry, boot.ciclo);

  function diagnostico(): PlatformDiagnostic {
    const registryEntries = options.registryHealth?.resumo()
      ?? registry.listar().sort().map((id) => ({
        id,
        mode: 'registered',
        status: 'unknown',
        restarts: 0,
        podeReiniciar: true,
      }));

    return {
      supervisor: supervisor.status(),
      saude: saude.verificar(),
      registry: {
        modulos: registryEntries,
        incidentes: options.registryHealth?.incidentes?.() ?? [],
      },
      lifecycle: {
        modulos: lifecycle.retrato(),
        resumo: lifecycle.resumo(),
      },
      boot: boot.diagnostico(),
      trabalho: options.trabalho?.saude() ?? null,
      bus: options.bus?.saude() ?? null,
    };
  }

  return {
    iniciar: () => supervisor.iniciar(),
    parar: () => supervisor.parar(),
    diagnostico,
    supervisor,
    saude,
    lifecycle,
  };
}
