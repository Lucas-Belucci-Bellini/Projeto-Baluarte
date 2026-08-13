/**
 * Integração do Module Registry com o Runtime Bridge.
 *
 * O Registry é a fonte dos manifestos ativos. O Permission System é a fonte
 * das concessões. Este módulo junta os dois e produz uma única carga para o
 * Runtime, sem conceder nada por conta própria.
 */

import { envelopeRuntime, snapshotRuntime, validarEnvelopeRuntime } from './runtime-bridge.js';

/**
 * Monta a carga de autorização para todos os módulos ativos.
 *
 * @param {ReturnType<import('./registry.js').criarRegistry>} registry
 * @param {{ avaliar: (modulo: string, permissao: string) => string }} permissoes
 */
export function criarCargaRuntime(registry, permissoes) {
  if (!registry?.selado) throw new Error('registry precisa estar selado antes da carga do Runtime');

  const grants = registry.listar().map((modulo) => snapshotRuntime(permissoes, modulo));
  const envelope = envelopeRuntime(grants);
  const validacao = validarEnvelopeRuntime(envelope);

  if (!validacao.ok) {
    throw new Error(`carga de Runtime inválida: ${validacao.erros.join('; ')}`);
  }

  return validacao.envelope;
}

/**
 * Retorna somente o grant de um módulo ativo. Útil para inicialização lazy sem
 * precisar reconstruir a política de todos os módulos.
 */
export function criarGrantRuntime(registry, permissoes, modulo) {
  if (!registry?.selado) throw new Error('registry precisa estar selado antes do grant');
  if (!registry.modulo(modulo)) throw new Error(`módulo não ativo: "${modulo}"`);

  return snapshotRuntime(permissoes, modulo);
}
