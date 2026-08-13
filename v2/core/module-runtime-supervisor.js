/**
 * Supervisor mínimo do ciclo módulo + Runtime.
 * Mantém o estado de execução fora do módulo e garante cleanup.
 */
export function criarModuleRuntimeSupervisor(lifecycle, hooks = {}) {
  if (!lifecycle || typeof lifecycle.abrir !== 'function' || typeof lifecycle.fechar !== 'function') {
    throw new TypeError('lifecycle Runtime inválido');
  }

  const estados = new Map();
  const hook = (nome) => typeof hooks[nome] === 'function' ? hooks[nome] : async () => {};

  async function iniciar(id) {
    const estado = estados.get(id);
    if (estado === 'running' || estado === 'starting') return;
    estados.set(id, 'starting');
    try {
      await lifecycle.abrir(id);
      await hook('init')(id);
      await hook('start')(id);
      estados.set(id, 'running');
    } catch (error) {
      estados.set(id, 'failed');
      try { await lifecycle.fechar(id); } finally { await hook('dispose')(id); }
      throw error;
    }
  }

  async function parar(id) {
    if (!estados.has(id) || estados.get(id) === 'stopped') return;
    try {
      await hook('stop')(id);
    } finally {
      try { await lifecycle.fechar(id); } finally {
        await hook('dispose')(id);
        estados.set(id, 'stopped');
      }
    }
  }

  function estado(id) { return estados.get(id) ?? 'stopped'; }

  return { iniciar, parar, estado };
}
