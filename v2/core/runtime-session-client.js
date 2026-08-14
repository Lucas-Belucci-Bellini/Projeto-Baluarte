/**
 * Sessão de alto nível sobre o RuntimeRequestClient.
 * Mantém o contrato do módulo separado do transporte.
 */

/** @typedef {{request: (payload: unknown) => Promise<unknown> | unknown}} RuntimeSessionClientTransport */
/** @typedef {{modulos: ReadonlyArray<unknown>}} RuntimeSessionEnvelope */
/** @typedef {{status: string, message?: string}} RuntimeSessionResponse */
/** @typedef {{status: 'authorized'|'file', message?: string, [key: string]: unknown}} RuntimeSessionSuccessResponse */
/** @typedef {{abrir: () => Promise<RuntimeSessionSuccessResponse>, lerArquivo: (modulo: string, path: string) => Promise<RuntimeSessionSuccessResponse>, fechar: () => Promise<void>, aberta: () => boolean}} RuntimeSessionClient */

/**
 * @param {RuntimeSessionClientTransport} client
 * @param {RuntimeSessionEnvelope} envelope
 * @returns {RuntimeSessionClient}
 */
export function criarRuntimeSession(client, envelope) {
  if (!client || typeof client.request !== 'function') throw new TypeError('client.request é obrigatório');
  if (!envelope || !Array.isArray(envelope.modulos)) throw new TypeError('envelope de Runtime inválido');

  let aberta = false;

  async function abrir() {
    if (aberta) return { status: 'authorized' };
    const resposta = await client.request({ op: 'authorize', envelope });
    if (!resposta || typeof resposta !== 'object' || Array.isArray(resposta)) {
      throw new Error('Runtime não autorizado');
    }
    const resultado = /** @type {RuntimeSessionResponse & Record<string, unknown>} */ (resposta);
    if (resultado.status !== 'authorized') {
      throw new Error(resultado.message || 'Runtime não autorizado');
    }
    aberta = true;
    return /** @type {RuntimeSessionSuccessResponse} */ ({ ...resultado, status: 'authorized' });
  }

  /** @param {string} modulo @param {string} path */
  async function lerArquivo(modulo, path) {
    if (!aberta) throw new Error('Runtime Session não está aberta');
    const resposta = await client.request({ op: 'read_file', envelope, modulo, path });
    if (!resposta || typeof resposta !== 'object' || Array.isArray(resposta)) {
      throw new Error('Runtime não conseguiu ler o arquivo');
    }
    const resultado = /** @type {RuntimeSessionResponse & Record<string, unknown>} */ (resposta);
    if (resultado.status !== 'file') {
      throw new Error(resultado.message || 'Runtime não conseguiu ler o arquivo');
    }
    return /** @type {RuntimeSessionSuccessResponse} */ ({ ...resultado, status: 'file' });
  }

  async function fechar() {
    aberta = false;
  }

  return { abrir, lerArquivo, fechar, aberta: () => aberta };
}
