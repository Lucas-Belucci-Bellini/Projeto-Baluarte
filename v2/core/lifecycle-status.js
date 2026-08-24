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
  'stopping',
  'failed',
  'stopped'
]);

/**
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry
 * @param {{vivos: () => string[], falhas: () => Array<{modulo: string, fase: string, motivo: string}>, emTransicao: () => ({modulo: string, direcao: string, etapa: string} | null), fase: string}} ciclo
 */
export function criarStatusLifecycle(registry, ciclo) {
  if (!registry || typeof registry.listar !== 'function') {
    throw new TypeError('registry é obrigatório');
  }
  if (!ciclo || typeof ciclo.vivos !== 'function' || typeof ciclo.falhas !== 'function') {
    throw new TypeError('ciclo é obrigatório');
  }
  /* Exigido, não opcional com fallback. Ciclo sem `emTransicao` produziria um
   * retrato que nunca diz `starting` nem `stopping` — e retrato que nunca acusa
   * é indistinguível de sistema que nunca transiciona. É a doença que este
   * repositório já pagou três vezes: peça pronta, desligada, e verde. */
  if (typeof ciclo.emTransicao !== 'function') {
    throw new TypeError('ciclo precisa expor emTransicao()');
  }

  /** @param {string} id */
  function estadoDo(id) {
    /* A transição vem ANTES de `vivos()` por necessidade, não por estilo: na
     * descida o módulo continua vivo enquanto desce, então perguntar a `vivos()`
     * primeiro devolveria `running` justamente para quem está parando. */
    const transicao = ciclo.emTransicao();
    if (transicao && transicao.modulo === id) {
      return transicao.direcao === 'descendo' ? 'stopping' : 'starting';
    }
    if (ciclo.vivos().includes(id)) return 'running';
    if (ciclo.falhas().some((f) => f.modulo === id)) return 'failed';
    /* `subindo` conta como `registered`: o módulo está no Registry e o ciclo
     * ainda não chegou nele — que é a definição de `registered` no contrato.
     * Antes caía em `stopped`, dizendo "já saiu do ar" sobre um módulo que
     * nunca tinha entrado. */
    return ciclo.fase === 'parado' || ciclo.fase === 'subindo' ? 'registered' : 'stopped';
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
    /* Um contador por estado de `ESTADOS_MODULO`, sem exceção: contador que
     * falta faz um módulo sumir da soma, e um resumo que não fecha com `total`
     * é pior do que não ter resumo. */
    return {
      total: modulos.length,
      running: modulos.filter((m) => m.estado === 'running').length,
      starting: modulos.filter((m) => m.estado === 'starting').length,
      stopping: modulos.filter((m) => m.estado === 'stopping').length,
      failed: modulos.filter((m) => m.estado === 'failed').length,
      stopped: modulos.filter((m) => m.estado === 'stopped').length,
      registered: modulos.filter((m) => m.estado === 'registered').length
    };
  }

  return { estadoDo, retrato, resumo };
}
