/**
 * Cliente mínimo de request/response para o Runtime local.
 * O transporte é injetado para manter o Core independente de stdio/Tauri.
 */
export function criarRuntimeRequestClient(transport, { timeoutMs = 5000 } = {}) {
  if (!transport || typeof transport.request !== 'function') {
    throw new TypeError('transport.request é obrigatório');
  }
  let ocupado = false;

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
      clearTimeout(timer);
      ocupado = false;
    }
  }

  return { request, ocupado: () => ocupado };
}
