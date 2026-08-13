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

/**
 * @param {{listar: Function, modulo: Function}} registry
 * @param {{subir: Function, descer: Function, diagnostico: Function, ciclo: object}} boot
 */
export function criarPlataforma(registry, boot) {
  if (!registry || !boot) throw new TypeError('registry e boot são obrigatórios');

  const saude = criarMonitorSaude(boot);
  const supervisor = criarSupervisor(boot, saude);
  const lifecycle = criarStatusLifecycle(registry, boot.ciclo);

  function diagnostico() {
    return {
      supervisor: supervisor.diagnostico(),
      saude: saude.verificar(),
      lifecycle: {
        modulos: lifecycle.retrato(),
        resumo: lifecycle.resumo()
      },
      boot: boot.diagnostico()
    };
  }

  return {
    iniciar: () => supervisor.iniciar(),
    parar: () => supervisor.parar(),
    diagnostico,
    supervisor,
    saude,
    lifecycle
  };
}
