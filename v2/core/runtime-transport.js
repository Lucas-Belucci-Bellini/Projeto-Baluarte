/**
 * Transporte abstrato Core → Runtime.
 *
 * Não escolhe IPC, Tauri, stdio ou socket. O contrato recebe um transportador
 * pequeno e testável; a implementação física pode ser trocada sem alterar o
 * Permission System ou o Runtime Bridge.
 */

import { envelopeRuntime, validarEnvelopeRuntime } from './runtime-bridge.js';

/** @typedef {{ enviar: (payload: string) => Promise<string> | string }} RuntimeTransport */
/** @typedef {{versao: number, resultados: ReadonlyArray<unknown>}} RuntimeResponse */

/** @param {unknown} grants @returns {string} */
export function serializarCargaRuntime(grants) {
  /* A guarda diz o que já era exigido na prática: sem ela o `grants.map` lá
   * dentro estourava "map is not a function", que culpa o lugar errado. O cast
   * declara apenas o que foi verificado — que é array —; o conteúdo continua
   * sendo validado grant a grant pelo `envelopeRuntime`, que lança no primeiro
   * inválido. */
  if (!Array.isArray(grants)) throw new TypeError('grants de Runtime devem ser um array');
  const envelope = envelopeRuntime(/** @type {ReadonlyArray<import('./runtime-bridge.js').RuntimeGrant>} */ (grants));
  const validacao = validarEnvelopeRuntime(envelope);
  if (!validacao.ok) throw new Error(`carga inválida: ${validacao.erros.join('; ')}`);
  return JSON.stringify(validacao.envelope);
}

/** @param {string} payload @returns {RuntimeResponse} */
export function validarRespostaRuntime(payload) {
  if (typeof payload !== 'string') throw new TypeError('resposta do Runtime deve ser string');
  let resposta;
  try {
    resposta = JSON.parse(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new TypeError(`resposta do Runtime não é JSON válido: ${message}`);
  }

  if (!resposta || typeof resposta !== 'object' || Array.isArray(resposta)) {
    throw new TypeError('resposta do Runtime deve ser objeto');
  }
  if (resposta.versao !== 1) throw new TypeError(`versão de resposta não suportada: ${JSON.stringify(resposta.versao)}`);
  if (!Array.isArray(resposta.resultados)) throw new TypeError('resposta do Runtime precisa de resultados');

  return /** @type {RuntimeResponse} */ (resposta);
}

/**
 * Faz uma chamada usando qualquer transporte que implemente `enviar`.
 * O transporte não recebe objetos internos do Core: apenas JSON.
 * @param {RuntimeTransport} transport
 * @param {unknown} grants
 * @returns {Promise<RuntimeResponse>}
 */
export async function chamarRuntime(transport, grants) {
  if (!transport || typeof transport.enviar !== 'function') {
    throw new TypeError('transport precisa implementar enviar(payload)');
  }
  const payload = serializarCargaRuntime(grants);
  const resposta = await transport.enviar(payload);
  return validarRespostaRuntime(resposta);
}
