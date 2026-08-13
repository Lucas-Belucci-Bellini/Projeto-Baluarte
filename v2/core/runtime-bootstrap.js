/**
 * Monta a carga serializável que atravessa a fronteira Core -> Runtime.
 *
 * O bootstrap apenas consulta o Registry e o Permission System. Ele não abre
 * processos nem escolhe transporte; essa separação mantém autorização,
 * serialização e execução em camadas independentes.
 */
import { snapshotRuntime, envelopeRuntime, validarEnvelopeRuntime } from './runtime-bridge.js';

/** @typedef {{listar: () => Array<string | {id: string}>}} RuntimeRegistry */
/** @typedef {{avaliar: (modulo: string, permissao: string) => string}} PermissionSystem */

/** @param {RuntimeRegistry} registry */
function idsDoRegistry(registry) {
  if (!registry || typeof registry.listar !== 'function') {
    throw new TypeError('registry inválido');
  }

  const entries = registry.listar();
  if (!Array.isArray(entries)) throw new TypeError('registry.listar() deve retornar array');

  return entries.map((entry, index) => {
    const id = typeof entry === 'string' ? entry : entry?.id;
    if (typeof id !== 'string' || !id) {
      throw new TypeError(`módulo inválido no Registry na posição ${index}`);
    }
    return id;
  });
}

/**
 * @param {RuntimeRegistry} registry
 * @param {PermissionSystem} permissoes
 */
export function criarCargaRuntime(registry, permissoes) {
  if (!permissoes || typeof permissoes.avaliar !== 'function') {
    throw new TypeError('Permission System inválido');
  }

  const grants = idsDoRegistry(registry).map((modulo) => snapshotRuntime(permissoes, modulo));
  return envelopeRuntime(grants);
}

export { validarEnvelopeRuntime };
