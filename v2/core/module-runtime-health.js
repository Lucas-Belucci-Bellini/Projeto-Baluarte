/** Runtime health state + bounded restart policy. */

/** @typedef {{status: 'unknown'|'healthy'|'failed'|'exhausted', restarts: number[], lastError?: unknown}} RuntimeHealthState */

/**
 * @param {{maxRestarts?: number, windowMs?: number}} [options]
 */
export function criarRuntimeHealth({ maxRestarts = 3, windowMs = 60_000 } = {}) {
  /** @type {Map<string, RuntimeHealthState>} */
  const estados = new Map();

  /** @param {string} id @returns {RuntimeHealthState} */
  function estado(id) {
    return estados.get(id) ?? { status: 'unknown', restarts: [] };
  }

  /** @param {string} id */
  function marcarSaudavel(id) {
    const atual = estado(id);
    estados.set(id, { ...atual, status: 'healthy' });
  }

  /** @param {string} id @param {unknown} error */
  function marcarFalha(id, error) {
    const agora = Date.now();
    const atual = estado(id);
    const restarts = [...atual.restarts.filter(t => agora - t < windowMs), agora];
    const exhausted = restarts.length > maxRestarts;
    estados.set(id, { status: exhausted ? 'exhausted' : 'failed', restarts, lastError: error });
    return !exhausted;
  }

  /** @param {string} id */
  function podeReiniciar(id) {
    return estado(id).status !== 'exhausted';
  }

  return { estado, marcarSaudavel, marcarFalha, podeReiniciar };
}
