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

/**
 * Cria o snapshot de autorização de um módulo.
 *
 * Só permissões atualmente concedidas atravessam a fronteira. As declaradas
 * mas negadas ficam no Permission System e continuam disponíveis para o
 * diagnóstico do operador.
 *
 * @param {{avaliar: (modulo: string, permissao: string) => string}} permissoes
 * @param {string} modulo
 * @returns {RuntimeGrant}
 */
export function snapshotRuntime(permissoes, modulo) {
  const concedidas = PERMISSOES.filter((p) => permissoes.avaliar(modulo, p) === 'ok');
  return Object.freeze({ modulo, permissoes: Object.freeze([...concedidas]) });
}

/**
 * Converte um conjunto de snapshots em uma carga transportável.
 *
 * A versão pertence ao envelope, não ao mecanismo de transporte. Assim um
 * futuro IPC pode rejeitar uma versão incompatível antes de entregar qualquer
 * capacidade ao Runtime.
 *
 * @param {RuntimeGrant[]} grants
 */
export function envelopeRuntime(grants) {
  const ids = new Set();
  const modulos = grants.map((grant) => {
    if (!grant || typeof grant.modulo !== 'string' || !grant.modulo) {
      throw new TypeError('grant de Runtime precisa de modulo');
    }
    if (ids.has(grant.modulo)) {
      throw new TypeError(`grant duplicado para o módulo "${grant.modulo}"`);
    }
    ids.add(grant.modulo);

    const permissoes = [...new Set(grant.permissoes)];
    const desconhecidas = permissoes.filter((p) => !PERMISSOES.includes(p));
    if (desconhecidas.length) {
      throw new TypeError(`permissões desconhecidas no grant de "${grant.modulo}": ${desconhecidas.join(', ')}`);
    }

    return { modulo: grant.modulo, permissoes };
  });

  return Object.freeze({ versao: 1, modulos: Object.freeze(modulos) });
}

/**
 * Valida uma carga recebida antes que ela seja entregue ao Runtime.
 *
 * Isto é uma segunda barreira, não uma substituição da RuntimePolicy. O
 * processo Rust continua sendo a autoridade final; a ponte apenas impede que
 * o Core envie uma carga obviamente inválida ao transporte.
 *
 * @param {unknown} envelope
 * @returns {{ok: true, envelope: {versao: 1, modulos: RuntimeGrant[]}} | {ok: false, erros: string[]}}
 */
export function validarEnvelopeRuntime(envelope) {
  const erros = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return { ok: false, erros: ['envelope não é objeto'] };
  }

  const e = /** @type {Record<string, any>} */ (envelope);
  if (e.versao !== 1) erros.push(`versão de envelope não suportada: ${JSON.stringify(e.versao)}`);
  if (!Array.isArray(e.modulos)) erros.push('`modulos` deve ser array');
  else {
    const ids = new Set();
    e.modulos.forEach((m, i) => {
      if (!m || typeof m !== 'object' || Array.isArray(m)) {
        erros.push(`modulos[${i}] deve ser objeto`);
        return;
      }
      if (typeof m.modulo !== 'string' || !m.modulo) erros.push(`modulos[${i}].modulo inválido`);
      else if (ids.has(m.modulo)) erros.push(`módulo duplicado: "${m.modulo}"`);
      else ids.add(m.modulo);

      if (!Array.isArray(m.permissoes)) {
        erros.push(`modulos[${i}].permissoes deve ser array`);
        return;
      }
      const vistas = new Set();
      m.permissoes.forEach((p, j) => {
        if (typeof p !== 'string' || !PERMISSOES.includes(p)) {
          erros.push(`modulos[${i}].permissoes[${j}] desconhecida: ${JSON.stringify(p)}`);
        } else if (vistas.has(p)) {
          erros.push(`permissão duplicada em ${m.modulo}: "${p}"`);
        } else vistas.add(p);
      });
    });
  }

  return erros.length
    ? { ok: false, erros }
    : { ok: true, envelope: { versao: 1, modulos: e.modulos } };
}
