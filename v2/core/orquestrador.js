/**
 * Orquestrador V2 — fachada mínima para o ciclo operacional.
 *
 * Responsabilidades continuam separadas: Boot sobe módulos, Supervisor decide
 * o estado global e Health observa. Este componente só oferece uma entrada
 * única para o processo hospedeiro.
 */
import { criarSupervisor } from './supervisor.js';

/**
 * O Supervisor precisa de um colaborador com `definirEstado`/`retrato` só
 * para registrar as próprias transições (ver supervisor.js). Isso é interno
 * ao ciclo de vida do Supervisor e não deve ser confundido com o `saude`
 * (Health) que o chamador injeta para observar o sistema — Health só observa,
 * quem muda de estado é o Supervisor.
 */
function criarRastreadorEstado() {
  let estado = 'idle';
  return {
    definirEstado(novo) { estado = novo; },
    retrato() { return { estado }; }
  };
}

export function criarOrquestrador(boot, saude) {
  const supervisor = criarSupervisor(boot, criarRastreadorEstado());

  return {
    iniciar: () => supervisor.iniciar(),
    parar: () => supervisor.parar(),
    diagnostico: () => ({
      supervisor: supervisor.status(),
      boot: boot.diagnostico?.() ?? null,
      health: saude?.retrato?.() ?? saude?.verificar?.() ?? null
    }),
    supervisor: {
      get estado() { return supervisor.estado(); }
    }
  };
}
