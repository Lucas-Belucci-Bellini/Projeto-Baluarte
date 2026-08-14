/**
 * Transporte abstrato Core → Runtime.
 *
 * Não escolhe IPC, Tauri, stdio ou socket. O contrato recebe um transportador
 * pequeno e testável; a implementação física pode ser trocada sem alterar o
 * Permission System ou o Runtime Bridge.
 */

import { envelopeRuntime, validarEnvelopeRuntime } from './runtime-bridge.js';

/** @typedef {{ enviar: (payload: string) => Promise<string> | string }} RuntimeTransport */
/** @typedef {{modulo: string, permissoes: ReadonlyArray<string>}} RuntimeGrant */
/** @typedef {{versao: number, resultados: ReadonlyArray<unknown>}} RuntimeResponse */

/** @param {ReadonlyArray<RuntimeGrant>} grants @returns {string} */
export function serializarCargaRuntime(grants) {
  const envelope = envelopeRuntime(grants);
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

  if (!resposta || typeof resposta !== 'object' || Array.isArray(resposta)) throw new TypeError('resposta do Runtime deve ser objeto');
  if (resposta.versao !== 1) throw new TypeError(`versão de resposta não suportada: ${JSON.stringify(resposta.versao)}`);
  if (!Array.isArray(resposta.resultados)) throw new TypeError('resposta do Runtime precisa de resultados');

  return /** @type {RuntimeResponse} */ (resposta);
}

/** @param {RuntimeTransport} transport @param {ReadonlyArray<RuntimeGrant>} grants @returns {Promise<RuntimeResponse>} */
export async function chamarRuntime(transport, grants) {
  if (!transport || typeof transport.enviar !== 'function') throw new TypeError('transport precisa implementar enviar(payload)');
  const payload = serializarCargaRuntime(grants);
  const resposta = await transport.enviar(payload);
  return validarRespostaRuntime(resposta);
}
