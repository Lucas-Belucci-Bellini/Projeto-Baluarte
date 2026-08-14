/**
 * Sessão de Runtime — coordena autorização + transporte sem conhecer IPC.
 *
 * Uma sessão só pode ser aberta com um envelope validado. O transporte é
 * injetado e, portanto, pode ser substituído por um fake nos testes ou por
 * Tauri/IPC quando a decisão arquitetural estiver fechada.
 */
import { envelopeRuntime, snapshotRuntime, validarEnvelopeRuntime } from './runtime-bridge.js';
import { validarRespostaRuntime } from './runtime-transport.js';

/** @typedef {'closed'|'opening'|'open'|'closing'|'failed'} RuntimeSessionState */
/** @typedef {{enviar: (payload: string) => Promise<string> | string}} RuntimeSessionTransport */
/** @typedef {{avaliar: (modulo: string, permissao: string) => string}} RuntimeSessionPermissions */
/** @typedef {{versao: 1, modulos: ReadonlyArray<{modulo: string, permissoes: ReadonlyArray<string>}>}} RuntimeSessionEnvelope */
/** @typedef {{versao: number, resultados: ReadonlyArray<unknown>}} RuntimeSessionResponse */
/** @typedef {{estado: RuntimeSessionState, envelope: RuntimeSessionEnvelope|null, resposta?: RuntimeSessionResponse}} RuntimeSessionOpenResult */
/** @typedef {{estado: RuntimeSessionState}} RuntimeSessionCloseResult */
/** @typedef {{estado: RuntimeSessionState, ultimoErro: string|null, envelope: RuntimeSessionEnvelope|null}} RuntimeSessionDiagnostics */
/** @typedef {{abrir: (modulos: ReadonlyArray<string>) => Promise<RuntimeSessionOpenResult>, fechar: () => Promise<RuntimeSessionCloseResult>, diagnostico: () => RuntimeSessionDiagnostics, readonly estado: RuntimeSessionState}} RuntimeSession */

export const ESTADOS_RUNTIME_SESSION = Object.freeze([
  'closed', 'opening', 'open', 'closing', 'failed'
]);

/**
 * @param {RuntimeSessionPermissions} permissoes
 * @param {RuntimeSessionTransport} transporte
 * @returns {RuntimeSession}
 */
export function criarSessaoRuntime(permissoes, transporte) {
  if (!permissoes || typeof permissoes.avaliar !== 'function') {
    throw new TypeError('permissoes.avaliar é obrigatório');
  }
  if (!transporte || typeof transporte.enviar !== 'function') {
    throw new TypeError('transporte.enviar é obrigatório');
  }

  /** @type {RuntimeSessionState} */
  let estado = 'closed';
  /** @type {string|null} */
  let ultimoErro = null;
  /** @type {RuntimeSessionEnvelope|null} */
  let envelope = null;

  /** @param {ReadonlyArray<string>} modulos */
  async function abrir(modulos) {
    if (estado === 'open') return { estado, envelope };
    if (estado === 'opening') throw new Error('sessão já está abrindo');
    if (estado === 'closing') throw new Error('não é possível abrir durante fechamento');

    estado = 'opening';
    ultimoErro = null;
    try {
      const grants = modulos.map((id) => snapshotRuntime(permissoes, id));
      const candidato = envelopeRuntime(grants);
      const validacao = validarEnvelopeRuntime(candidato);
      if (!validacao.ok) throw new Error(`envelope inválido: ${validacao.erros.join('; ')}`);

      const respostaBruta = await transporte.enviar(JSON.stringify(validacao.envelope));
      const resposta = validarRespostaRuntime(respostaBruta);

      envelope = validacao.envelope;
      estado = 'open';
      return { estado, envelope, resposta };
    } catch (error) {
      ultimoErro = error instanceof Error ? error.message : String(error);
      estado = 'failed';
      throw error;
    }
  }

  async function fechar() {
    if (estado === 'closed') return { estado };
    if (estado === 'closing') return { estado };
    estado = 'closing';
    envelope = null;
    estado = 'closed';
    return { estado };
  }

  return {
    abrir,
    fechar,
    diagnostico: () => ({ estado, ultimoErro, envelope }),
    get estado() { return estado; }
  };
}
