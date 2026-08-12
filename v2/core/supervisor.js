/**
 * Supervisor V2 — coordena o ciclo de vida do Core sem duplicar o Boot.
 *
 * O Boot continua sendo dono da subida/descida dos módulos. O Supervisor é
 * dono apenas do estado global, concorrência e política de falha do processo.
 */

export const ESTADOS_SUPERVISOR = Object.freeze([
  'idle', 'starting', 'ready', 'degraded', 'stopping', 'stopped', 'failed'
]);

/**
 * @param {{subir: () => Promise<any>, descer: () => Promise<any>}} boot
 * @param {{verificar: () => any}} [saude]
 */
export function criarSupervisor(boot, saude) {
  if (!boot || typeof boot.subir !== 'function' || typeof boot.descer !== 'function') {
    throw new TypeError('boot.subir e boot.descer são obrigatórios');
  }

  let estado = 'idle';
  let ultimaSubida = null;
  let ultimoErro = null;
  let operacao = null;

  async function iniciar() {
    if (estado === 'ready' || estado === 'degraded') return diagnostico();
    if (estado === 'starting') return operacao;
    if (estado === 'stopping') throw new Error('não é possível iniciar durante shutdown');

    estado = 'starting';
    ultimoErro = null;
    operacao = (async () => {
      try {
        ultimaSubida = await boot.subir();
        const health = saude?.verificar?.();
        const degradado = Boolean(ultimaSubida?.falhas?.length) || health?.readiness === 'unhealthy';
        estado = degradado ? 'degraded' : 'ready';
        return diagnostico();
      } catch (error) {
        ultimoErro = error instanceof Error ? error.message : String(error);
        estado = 'failed';
        throw error;
      } finally {
        operacao = null;
      }
    })();
    return operacao;
  }

  async function parar() {
    if (estado === 'idle' || estado === 'stopped') {
      estado = 'stopped';
      return { estado };
    }
    if (estado === 'starting') throw new Error('não é possível parar durante startup');
    if (estado === 'stopping') return operacao;

    estado = 'stopping';
    operacao = (async () => {
      try {
        const resultado = await boot.descer();
        if (resultado?.ok === false) {
          ultimoErro = resultado.problemas;
          estado = 'degraded';
        } else {
          estado = 'stopped';
        }
        return { estado, resultado };
      } catch (error) {
        ultimoErro = error instanceof Error ? error.message : String(error);
        estado = 'failed';
        throw error;
      } finally {
        operacao = null;
      }
    })();
    return operacao;
  }

  function diagnostico() {
    return {
      estado,
      ultimaSubida,
      ultimoErro,
      saude: saude?.verificar?.() ?? null
    };
  }

  return {
    iniciar,
    parar,
    diagnostico,
    get estado() { return estado; }
  };
}
