/**
 * Orquestrador V2 — fachada mínima para o ciclo operacional.
 *
 * Responsabilidades continuam separadas: Boot sobe módulos, Supervisor decide
 * o estado global e Health observa. Este componente só oferece uma entrada
 * única para o processo hospedeiro.
 */
import { criarSupervisor } from './supervisor.js';

export function criarOrquestrador(boot, saude) {
  const supervisor = criarSupervisor(boot, saude);

  return {
    iniciar: () => supervisor.iniciar(),
    parar: () => supervisor.parar(),
    diagnostico: () => ({
      supervisor: supervisor.diagnostico(),
      boot: boot.diagnostico?.() ?? null,
      health: saude?.retrato?.() ?? saude?.verificar?.() ?? null
    }),
    supervisor
  };
}
