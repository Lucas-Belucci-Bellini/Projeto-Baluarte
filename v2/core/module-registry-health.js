/**
 * Observabilidade e decisão de fallback do Module Registry.
 *
 * Este adaptador não inicia módulos, concede permissões nem substitui RLS.
 * Ele traduz o estado do Runtime Health para uma decisão operacional isolável.
 */

/**
 * @typedef {'registered'|'healthy'|'degraded'|'quarantined'|'unregistered'} RegistryModuleMode
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
 */
export function criarModuleRegistryHealth(registry, runtimeHealth) {
  /** @param {string} id @returns {RegistryModuleMode} */
  function modo(id) {
    if (!registry?.modulo(id)) return 'unregistered';
    const estado = runtimeHealth.estado(id);
    if (estado.status === 'healthy') return 'healthy';
    if (estado.status === 'failed') return 'degraded';
    if (estado.status === 'exhausted') return 'quarantined';
    return 'registered';
  }

  /** @param {string} id */
  function podeAtivar(id) {
    if (!registry?.modulo(id)) return false;
    return runtimeHealth.podeReiniciar(id);
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

  return { modo, podeAtivar, resumo };
}
