/** Runtime health state + bounded restart policy. */

/** @typedef {{status: 'unknown'|'healthy'|'failed'|'exhausted', restarts: number[], lastError?: unknown}} RuntimeHealthState */
/** @typedef {{type: 'healthy'|'failed', id: string, timestamp: number, status: 'healthy'|'failed'|'exhausted', restarts: number, error?: string}} RuntimeHealthIncident */

/**
 * @param {{maxRestarts?: number, windowMs?: number, maxIncidents?: number, clock?: () => number}} [options]
 */
export function criarRuntimeHealth({ maxRestarts = 3, windowMs = 60_000, maxIncidents = 100, clock = () => Date.now() } = {}) {
  /** @type {Map<string, RuntimeHealthState>} */
  const estados = new Map();
  /** @type {RuntimeHealthIncident[]} */
  const incidentes = [];

  /** @param {RuntimeHealthIncident} incidente */
  function registrarIncidente(incidente) {
    incidentes.push(incidente);
    if (incidentes.length > maxIncidents) incidentes.splice(0, incidentes.length - maxIncidents);
  }

  /** @param {unknown} error */
  function mensagem(error) {
    return error instanceof Error ? error.message : String(error);
  }

  /** @param {string} id @returns {RuntimeHealthState} */
  function estado(id) {
    return estados.get(id) ?? { status: 'unknown', restarts: [] };
  }

  /** @param {string} id */
  function marcarSaudavel(id) {
    const atual = estado(id);
    /** @type {RuntimeHealthState} */
    const proximo = { ...atual, status: 'healthy' };
    estados.set(id, proximo);
    registrarIncidente({
      type: 'healthy',
      id,
      timestamp: clock(),
      status: 'healthy',
      restarts: proximo.restarts.length,
    });
  }

  /** @param {string} id @param {unknown} error */
  function marcarFalha(id, error) {
    const agora = clock();
    const atual = estado(id);
    const restarts = [...atual.restarts.filter(t => agora - t < windowMs), agora];
    const status = restarts.length > maxRestarts ? 'exhausted' : 'failed';
    estados.set(id, { status, restarts, lastError: error });
    registrarIncidente({
      type: 'failed',
      id,
      timestamp: agora,
      status,
      restarts: restarts.length,
      error: mensagem(error),
    });
    return status !== 'exhausted';
  }

  /** @param {string} id */
  function podeReiniciar(id) {
    return estado(id).status !== 'exhausted';
  }

  /** @returns {RuntimeHealthIncident[]} */
  function historico() {
    return incidentes.map((incidente) => ({ ...incidente }));
  }

  return { estado, marcarSaudavel, marcarFalha, podeReiniciar, historico, incidentes: historico };
}
