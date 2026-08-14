/**
 * Fachada operacional da V2.
 *
 * Une os contratos já existentes sem tomar posse de suas responsabilidades:
 * Boot executa módulos, Supervisor controla o processo, Health avalia saúde e
 * Lifecycle Status expõe o estado por módulo.
 */

import { criarMonitorSaude } from './saude.js';
import { criarStatusLifecycle } from './lifecycle-status.js';
import { criarSupervisor } from './supervisor.js';

/** @typedef {{listar: () => ReadonlyArray<string>, modulo: (id: string) => unknown}} PlataformaRegistry */
/** @typedef {{subir: () => Promise<{falhas: unknown[]}>, descer: () => Promise<void>, diagnostico: () => unknown, ciclo: {vivos: () => string[], falhas: () => Array<{modulo: string, fase: string, motivo: string}>, fase: string}}} PlataformaBoot */

/** @param {PlataformaRegistry} registry @param {PlataformaBoot} boot */
export function criarPlataforma(registry, boot) {
  if (!registry || typeof registry.listar !== 'function' || typeof registry.modulo !== 'function') {
    throw new TypeError('registry inválido');
  }
  if (!boot || typeof boot.subir !== 'function' || typeof boot.descer !== 'function' || typeof boot.diagnostico !== 'function') {
    throw new TypeError('boot inválido');
  }

  const saude = criarMonitorSaude(boot);
  const supervisor = criarSupervisor(boot, saude);
  const lifecycle = criarStatusLifecycle(registry, boot.ciclo);

  function diagnostico() {
    return {
      supervisor: supervisor.status(),
      saude: saude.verificar(),
      lifecycle: { modulos: lifecycle.retrato(), resumo: lifecycle.resumo() },
      boot: boot.diagnostico()
    };
  }

  return { iniciar: () => supervisor.iniciar(), parar: () => supervisor.parar(), diagnostico, supervisor, saude, lifecycle };
}
