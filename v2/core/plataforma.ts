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

export interface PlatformDiagnostic {
  supervisor: SupervisorStatus;
  saude: ReturnType<HealthMonitor['verificar']>;
  lifecycle: {
    modulos: LifecycleModuleStatus[];
    resumo: LifecycleSummary;
  };
  boot: ReturnType<Boot['diagnostico']>;
}

export interface Platform {
  iniciar(): ReturnType<Supervisor['iniciar']>;
  parar(): ReturnType<Supervisor['parar']>;
  diagnostico(): PlatformDiagnostic;
  supervisor: Supervisor;
  saude: HealthMonitor;
  lifecycle: LifecycleStatus;
}

export function criarPlataforma(registry: ModuleRegistry, boot: Boot): Platform {
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

  const saude = criarMonitorSaude(boot);
  const supervisor = criarSupervisor(boot, saude);
  const lifecycle = criarStatusLifecycle(registry, boot.ciclo);

  function diagnostico(): PlatformDiagnostic {
    return {
      supervisor: supervisor.status(),
      saude: saude.verificar(),
      lifecycle: {
        modulos: lifecycle.retrato(),
        resumo: lifecycle.resumo(),
      },
      boot: boot.diagnostico(),
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
