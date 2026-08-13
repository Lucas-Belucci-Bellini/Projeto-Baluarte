/**
 * Cliente mínimo de request/response para o Runtime local.
 * O transporte é injetado para manter o Core independente de stdio/Tauri.
 */

/** @typedef {{request: (payload: unknown) => Promise<unknown> | unknown}} RuntimeRequestTransport */
/** @typedef {{request: (payload: unknown) => Promise<unknown>, ocupado: () => boolean}} RuntimeRequestClient */
/**
 * @typedef {{
 *   timeoutMs?: number
 * }} RuntimeRequestClientOptions
 */

/**
 * @param {RuntimeRequestTransport} transport
 * @param {RuntimeRequestClientOptions} [options]
 * @returns {RuntimeRequestClient}
 */
export function criarRuntimeRequestClient(transport, options = {}) {
  const { timeoutMs = 5000 } = options;
  if (!transport || typeof transport.request !== 'function') {
    throw new TypeError('transport.request é obrigatório');
  }
  let ocupado = false;

  /** @param {unknown} payload */
  async function request(payload) {
    if (ocupado) throw new Error('Runtime ocupado: requisição concorrente não permitida');
    ocupado = true;
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(() => transport.request(payload)),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Runtime request timeout')), timeoutMs);
        })
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      ocupado = false;
    }
  }

  return { request, ocupado: () => ocupado };
}
