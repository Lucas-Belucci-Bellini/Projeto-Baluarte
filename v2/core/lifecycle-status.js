/**
 * Retrato do lifecycle por módulo.
 *
 * Não controla o lifecycle e não duplica o `ciclo.js`: apenas traduz o estado
 * operacional do ciclo para um contrato estável de diagnóstico.
 */

export const ESTADOS_MODULO = Object.freeze([
  'registered',
  'starting',
  'running',
  'failed',
  'stopped'
]);

/**
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry
 * @param {{vivos: () => string[], falhas: () => Array<{modulo: string, fase: string, motivo: string}>, fase: string}} ciclo
 */
export function criarStatusLifecycle(registry, ciclo) {
  if (!registry || typeof registry.listar !== 'function') {
    throw new TypeError('registry é obrigatório');
  }
  if (!ciclo || typeof ciclo.vivos !== 'function' || typeof ciclo.falhas !== 'function') {
    throw new TypeError('ciclo é obrigatório');
  }

  /** @param {string} id */
  function estadoDo(id) {
    if (ciclo.vivos().includes(id)) return 'running';
    if (ciclo.falhas().some((f) => f.modulo === id)) return 'failed';
    return ciclo.fase === 'parado' ? 'registered' : 'stopped';
  }

  function retrato() {
    const falhas = ciclo.falhas();
    return registry.listar().map((id) => {
      const manifesto = registry.modulo(id);
      const falha = falhas.find((f) => f.modulo === id) ?? null;
      return {
        modulo: id,
        nome: manifesto?.name ?? id,
        versao: manifesto?.version ?? null,
        estado: estadoDo(id),
        falha
      };
    });
  }

  function resumo() {
    const modulos = retrato();
    return {
      total: modulos.length,
      running: modulos.filter((m) => m.estado === 'running').length,
      failed: modulos.filter((m) => m.estado === 'failed').length,
      stopped: modulos.filter((m) => m.estado === 'stopped').length,
      registered: modulos.filter((m) => m.estado === 'registered').length
    };
  }

  return { estadoDo, retrato, resumo };
}
