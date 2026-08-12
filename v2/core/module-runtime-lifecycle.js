/**
 * Integra o ciclo de vida dos módulos com as sessões de Runtime.
 *
 * Regra: autorização e Runtime vêm antes de `init`; `dispose` fecha o Runtime
 * mesmo quando o módulo falha durante a subida.
 */

export function criarLifecycleRuntime(registry, runtime, permissoes) {
  const abertas = new Set();

  async function abrir(id) {
    if (!registry?.selado) throw new Error('registry precisa estar selado');
    if (!registry.modulo(id)) throw new Error(`módulo não ativo: "${id}"`);
    if (abertas.has(id)) return;
    await runtime.abrir(registry, permissoes, id);
    abertas.add(id);
  }

  async function fechar(id) {
    if (!abertas.has(id)) return;
    try {
      await runtime.fechar(id);
    } finally {
      abertas.delete(id);
    }
  }

  return { abrir, fechar, abertas: () => [...abertas] };
}
