/** Runtime health state + bounded restart policy. */
export function criarRuntimeHealth({ maxRestarts = 3, windowMs = 60_000 } = {}) {
  const estados = new Map();

  function estado(id) {
    return estados.get(id) ?? { status: 'unknown', restarts: [] };
  }

  function marcarSaudavel(id) {
    const atual = estado(id);
    estados.set(id, { ...atual, status: 'healthy' });
  }

  function marcarFalha(id, error) {
    const agora = Date.now();
    const atual = estado(id);
    const restarts = [...atual.restarts.filter(t => agora - t < windowMs), agora];
    const exhausted = restarts.length > maxRestarts;
    estados.set(id, { status: exhausted ? 'exhausted' : 'failed', restarts, lastError: error });
    return !exhausted;
  }

  function podeReiniciar(id) {
    return estado(id).status !== 'exhausted';
  }

  return { estado, marcarSaudavel, marcarFalha, podeReiniciar };
}
