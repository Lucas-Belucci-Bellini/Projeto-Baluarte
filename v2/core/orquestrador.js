/**
 * Orquestrador V2 — fachada mínima para o ciclo operacional.
 *
 * Responsabilidades continuam separadas: Boot sobe módulos, Supervisor decide
 * o estado global e Health observa. Este componente só oferece uma entrada
 * única para o processo hospedeiro.
 */
import { criarSupervisor } from './supervisor.js';

/** @typedef {{subir: () => Promise<{falhas: ReadonlyArray<unknown>}>, descer: () => Promise<unknown>, diagnostico?: () => unknown}} RuntimeBootFacade */
/** @typedef {{definirEstado: (estado: string) => void, retrato: () => unknown, verificar?: () => unknown}} RuntimeHealthFacade */
/** @typedef {{iniciar: () => Promise<unknown>, parar: () => Promise<unknown>, diagnostico: () => unknown, supervisor: unknown}} RuntimeOrchestrator */

/** @param {RuntimeBootFacade} boot @param {RuntimeHealthFacade} saude @returns {RuntimeOrchestrator} */
export function criarOrquestrador(boot, saude) {
  const supervisor = criarSupervisor(boot, saude);
  /* O Supervisor interno preserva `estado()` para os consumidores de baixo
   * nível. A fachada do Orquestrador expõe o estado como valor, que é o
   * contrato usado pelo diagnóstico e pela camada de transporte. */
  const supervisorPublico = {
    iniciar: supervisor.iniciar,
    parar: supervisor.parar,
    status: supervisor.status,
    get estado() { return supervisor.estado(); }
  };

  return {
    iniciar: () => supervisor.iniciar(),
    parar: () => supervisor.parar(),
    diagnostico: () => ({
      supervisor: supervisor.status(),
      boot: boot.diagnostico?.() ?? null,
      health: saude.retrato?.() ?? saude.verificar?.() ?? null
    }),
    supervisor: supervisorPublico
  };
}
