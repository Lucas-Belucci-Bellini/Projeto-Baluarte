/**
 * Supervisor V2 — coordena boot, readiness e shutdown sem assumir o transporte.
 *
 * O Supervisor não executa módulos nem concede permissões. Ele apenas governa
 * o ciclo de vida do conjunto e transforma falhas de boot em estado observável.
 */

/** @typedef {'idle'|'starting'|'ready'|'degraded'|'stopping'|'stopped'|'failed'} SupervisorState */
/** @typedef {{subir: () => Promise<{falhas: unknown[]}>, descer: () => Promise<void>, diagnostico: () => unknown}} SupervisorBoot */
/** @typedef {{definirEstado: (estado: SupervisorState) => void, retrato: () => unknown}} SupervisorHealth */

const ESTADOS = Object.freeze(['idle', 'starting', 'ready', 'degraded', 'stopping', 'stopped', 'failed']);

/** @param {SupervisorBoot} boot @param {SupervisorHealth} saude @param {{agora?: () => number}} [options] */
export function criarSupervisor(boot, saude, { agora = () => Date.now() } = {}) {
  if (!boot?.subir || !boot?.descer) throw new TypeError('Supervisor exige Boot com subir/descer');
  if (!saude?.definirEstado || !saude?.retrato) throw new TypeError('Supervisor exige monitor de saúde');

  /** @type {SupervisorState} */
  let estado = 'idle';
  let inicio = /** @type {number|null} */ (null);
  let ultimaFalha = /** @type {string|null} */ (null);

  /** @param {SupervisorState} novo */
  const mudar = (novo) => {
    if (!ESTADOS.includes(novo)) throw new Error(`estado inválido: ${novo}`);
    estado = novo;
    saude.definirEstado(novo);
  };

  async function iniciar() {
    if (estado === 'starting' || estado === 'ready' || estado === 'degraded') {
      return { estado, idempotente: true, diagnostico: boot.diagnostico() };
    }
    if (estado === 'stopping') throw new Error('não é possível iniciar durante shutdown');

    inicio = agora();
    ultimaFalha = null;
    mudar('starting');

    try {
      const resultado = await boot.subir();
      const degradado = resultado.falhas.length > 0;
      mudar(degradado ? 'degraded' : 'ready');
      return { estado, duracaoMs: agora() - inicio, resultado, diagnostico: boot.diagnostico() };
    } catch (erro) {
      ultimaFalha = erro instanceof Error ? erro.message : String(erro);
      mudar('failed');
      throw erro;
    }
  }

  async function parar() {
    if (estado === 'idle' || estado === 'stopped') {
      mudar('stopped');
      return { estado, idempotente: true };
    }
    if (estado === 'stopping') return { estado, idempotente: true };

    mudar('stopping');
    try {
      await boot.descer();
      mudar('stopped');
      return { estado };
    } catch (erro) {
      ultimaFalha = erro instanceof Error ? erro.message : String(erro);
      mudar('failed');
      throw erro;
    }
  }

  function status() {
    const diagnostico = boot.diagnostico();
    const health = saude.retrato();
    return { estado, inicio, duracaoMs: inicio === null ? null : agora() - inicio, ultimaFalha, health, diagnostico };
  }

  return { iniciar, parar, status, estado: () => estado };
}

export { ESTADOS as ESTADOS_SUPERVISOR };
