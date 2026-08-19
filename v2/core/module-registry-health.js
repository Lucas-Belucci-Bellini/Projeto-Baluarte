/**
 * Observabilidade e decisão de fallback do Module Registry.
 *
 * Este adaptador não inicia módulos, concede permissões nem substitui RLS.
 * Ele traduz o estado do Runtime Health para uma decisão operacional isolável.
 */

/**
 * @typedef {'registered'|'healthy'|'degraded'|'quarantined'|'maintenance'|'disabled'|'unregistered'} RegistryModuleMode
 */

/**
 * @typedef {{
 *   id: string,
 *   mode: RegistryModuleMode,
 *   status: 'unknown'|'healthy'|'failed'|'exhausted'|'unregistered',
 *   restarts: number,
 *   podeReiniciar: boolean,
 *   ultimoErro?: string,
 * }} RegistryHealthEntry
 */

/**
 * @param {{listar: () => string[], modulo: (id: string) => unknown}} registry
 * @param {{estado: (id: string) => {status: 'unknown'|'healthy'|'failed'|'exhausted', restarts?: number[], lastError?: unknown}, podeReiniciar: (id: string) => boolean}} runtimeHealth
 * @param {{authorize?: (request: {id: string, mode: 'active'|'maintenance'|'disabled', reason: string}) => boolean}} [options]
 */
export function criarModuleRegistryHealth(registry, runtimeHealth, options = {}) {
  const overrides = new Map();
  const authorize = options.authorize ?? (() => false);
  /** @param {string} id @returns {RegistryModuleMode} */
  function modo(id) {
    if (!registry?.modulo(id)) return 'unregistered';
    const override = overrides.get(id);
    if (override) return override;
    const estado = runtimeHealth.estado(id);
    if (estado.status === 'healthy') return 'healthy';
    if (estado.status === 'failed') return 'degraded';
    if (estado.status === 'exhausted') return 'quarantined';
    return 'registered';
  }

  /** @param {string} id */
  function podeAtivar(id) {
    if (!registry?.modulo(id)) return false;
    const mode = modo(id);
    if (mode === 'maintenance' || mode === 'disabled' || mode === 'quarantined') return false;
    return runtimeHealth.podeReiniciar(id);
  }

  /**
   * @param {string} id
   * @param {'active'|'maintenance'|'disabled'} mode
   * @param {string} reason
   */
  function definirModo(id, mode, reason) {
    if (!registry?.modulo(id)) throw new Error(`módulo não registrado: "${id}"`);
    if (!['active', 'maintenance', 'disabled'].includes(mode)) {
      throw new Error(`modo operacional inválido: "${mode}"`);
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new Error('maintenance/disabled exige motivo');
    }
    if (!authorize({ id, mode, reason })) {
      throw new Error('autorização server-side necessária para mudar modo');
    }
    if (mode === 'active') overrides.delete(id);
    else overrides.set(id, mode);
    return modo(id);
  }

  /** @param {string} id @returns {RegistryHealthEntry} */
  function entrada(id) {
    const mode = modo(id);
    if (mode === 'unregistered') {
      return {
        id,
        mode,
        status: 'unregistered',
        restarts: 0,
        podeReiniciar: false,
      };
    }

    const estado = runtimeHealth.estado(id);
    /** @type {RegistryHealthEntry} */
    const entry = {
      id,
      mode,
      status: estado.status,
      restarts: estado.restarts?.length ?? 0,
      podeReiniciar: podeAtivar(id),
    };
    if (estado.lastError instanceof Error) entry.ultimoErro = estado.lastError.message;
    else if (estado.lastError !== undefined) entry.ultimoErro = String(estado.lastError);
    return entry;
  }

  function resumo() {
    return registry.listar().sort().map(entrada);
  }

  return { modo, podeAtivar, definirModo, resumo };
}
