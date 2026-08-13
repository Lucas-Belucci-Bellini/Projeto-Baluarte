/**
 * Ponte lógica entre Permission System e Core de Runtime.
 *
 * Esta camada NÃO é IPC. Ela produz o único retrato de autorização que um
 * transporte futuro poderá levar ao Runtime Rust. Isso mantém a decisão de
 * permissão no Core de Orquestração e a aplicação da política no Runtime.
 *
 * Fluxo:
 *
 *   Manifesto → Registry → Permission System → snapshot → Runtime Rust
 *
 * O snapshot é deliberadamente pequeno e serializável. Nenhuma função,
 * contexto ou objeto do Core atravessa a fronteira de processo.
 */

import { PERMISSOES } from './manifest.js';

/**
 * @typedef {{modulo: string, permissoes: string[]}} RuntimeGrant
 */
/** @typedef {{versao: 1, modulos: RuntimeGrant[]}} RuntimeEnvelope */
/** @typedef {{modulo: string, permissoes: unknown}} UnknownRuntimeGrant */

/**
 * @param {{avaliar: (modulo: string, permissao: string) => string}} permissoes
 * @param {string} modulo
 * @returns {RuntimeGrant}
 */
export function snapshotRuntime(permissoes, modulo) {
  const concedidas = PERMISSOES.filter((p) => permissoes.avaliar(modulo, p) === 'ok');
  return Object.freeze({ modulo, permissoes: Object.freeze([...concedidas]) });
}

/** @param {RuntimeGrant[]} grants @returns {RuntimeEnvelope} */
export function envelopeRuntime(grants) {
  const ids = new Set();
  const modulos = grants.map((grant) => {
    if (!grant || typeof grant.modulo !== 'string' || !grant.modulo) {
      throw new TypeError('grant de Runtime precisa de modulo');
    }
    if (ids.has(grant.modulo)) throw new TypeError(`grant duplicado para o módulo "${grant.modulo}"`);
    ids.add(grant.modulo);

    const permissoes = [...new Set(grant.permissoes)];
    const desconhecidas = permissoes.filter((p) => !PERMISSOES.includes(p));
    if (desconhecidas.length) throw new TypeError(`permissões desconhecidas no grant de "${grant.modulo}": ${desconhecidas.join(', ')}`);
    return { modulo: grant.modulo, permissoes };
  });

  return Object.freeze({ versao: 1, modulos: Object.freeze(modulos) });
}

/**
 * @param {unknown} envelope
 * @returns {{ok: true, envelope: RuntimeEnvelope} | {ok: false, erros: string[]}}
 */
export function validarEnvelopeRuntime(envelope) {
  const erros = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return { ok: false, erros: ['envelope não é objeto'] };
  }

  const candidato = /** @type {Record<string, unknown>} */ (envelope);
  if (candidato.versao !== 1) erros.push(`versão de envelope não suportada: ${JSON.stringify(candidato.versao)}`);
  if (!Array.isArray(candidato.modulos)) {
    erros.push('`modulos` deve ser array');
  } else {
    const ids = new Set();
    candidato.modulos.forEach((item, i) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        erros.push(`modulos[${i}] deve ser objeto`);
        return;
      }
      const modulo = /** @type {Record<string, unknown>} */ (item);
      if (typeof modulo.modulo !== 'string' || !modulo.modulo) erros.push(`modulos[${i}].modulo inválido`);
      else if (ids.has(modulo.modulo)) erros.push(`módulo duplicado: "${modulo.modulo}"`);
      else ids.add(modulo.modulo);

      if (!Array.isArray(modulo.permissoes)) {
        erros.push(`modulos[${i}].permissoes deve ser array`);
        return;
      }
      const vistas = new Set();
      modulo.permissoes.forEach((permissao, j) => {
        if (typeof permissao !== 'string' || !PERMISSOES.includes(permissao)) {
          erros.push(`modulos[${i}].permissoes[${j}] desconhecida: ${JSON.stringify(permissao)}`);
        } else if (vistas.has(permissao)) {
          erros.push(`permissão duplicada em ${modulo.modulo}: "${permissao}"`);
        } else vistas.add(permissao);
      });
    });
  }

  if (erros.length) return { ok: false, erros };

  const modulos = /** @type {RuntimeGrant[]} */ (candidato.modulos);
  return { ok: true, envelope: { versao: 1, modulos } };
}
