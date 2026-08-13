/**
 * Sessão de alto nível sobre o RuntimeRequestClient.
 * Mantém o contrato do módulo separado do transporte.
 */
export function criarRuntimeSession(client, envelope) {
  if (!client || typeof client.request !== 'function') throw new TypeError('client.request é obrigatório');
  if (!envelope || !Array.isArray(envelope.modulos)) throw new TypeError('envelope de Runtime inválido');

  let aberta = false;

  async function abrir() {
    if (aberta) return;
    const resposta = await client.request({ op: 'authorize', envelope });
    if (!resposta || resposta.status !== 'authorized') {
      throw new Error(resposta?.message || 'Runtime não autorizado');
    }
    aberta = true;
    return resposta;
  }

  async function lerArquivo(modulo, path) {
    if (!aberta) throw new Error('Runtime Session não está aberta');
    const resposta = await client.request({ op: 'read_file', envelope, modulo, path });
    if (!resposta || resposta.status !== 'file') {
      throw new Error(resposta?.message || 'Runtime não conseguiu ler o arquivo');
    }
    return resposta;
  }

  async function fechar() {
    aberta = false;
  }

  return { abrir, lerArquivo, fechar, aberta: () => aberta };
}
