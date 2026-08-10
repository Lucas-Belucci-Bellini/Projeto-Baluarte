/**
 * Lab de Criptografia — o primeiro módulo escrito PARA a V2.
 *
 * ── Por que este arquivo existe, sendo que já havia um manifesto de /cripto ──
 * O anterior apontava para a página da V1: provava que o Registry consegue
 * servir código antigo, e não provava nada sobre **escrever um módulo novo**.
 * A pergunta que faltava é de ergonomia, e ergonomia não se responde por
 * inspeção: *é agradável escrever um módulo assim? o contexto entrega o que se
 * precisa, na hora em que se precisa?*
 *
 * ── O que ele exercita, de propósito ────────────────────────────────────────
 * Todas as capacidades do contexto, para nenhuma ficar "pronta e não usada":
 *
 *   ctx.storage    preferência do painel, na chave declarada
 *   ctx.metricas   quantas cifragens, quanto tempo
 *   ctx.trabalho   PBKDF2 com 100 000 iterações fora da fila interativa
 *   ctx.bus        anuncia o que fez, sem saber quem escuta
 *   ctx.log        erro com dono e causa
 *   api            cifrar/decifrar para OUTRO módulo usar (o JARVIS é o caso)
 *   lifecycle      init/dispose de verdade, com o que precisa ser desmontado
 *
 * ── Escopo, dito antes que alguém pergunte ──────────────────────────────────
 * **Isto não migra o /cripto da V1.** A V1 tem 8 painéis e 861 linhas de UI;
 * portar tudo agora seria mover uma funcionalidade quando o objetivo é testar
 * uma arquitetura. Aqui há AES e hash — o suficiente para o módulo ser real e
 * exercer o contrato inteiro. Os outros painéis migram quando alguém precisar
 * deles, não por completude.
 */

import { cifrar, decifrar, hash, ALGOS_HASH } from './motor.js';

/* A instância viva do módulo. Fica no escopo do arquivo — e não em `globalThis`
 * — porque `dispose()` precisa alcançá-la, e estado global é a Regra 8. */
let estado = null;

export default {
  id: 'cripto',
  name: 'Lab de Criptografia',
  version: '2.0.0',
  description: 'AES-GCM e hashes, no navegador.',
  stability: 'beta',
  icon: '⚿',
  ambiente: 'ambos',

  nav: { section: 'ferramentas', order: 30 },
  dependencies: [],

  /* Nenhuma: cifrar texto que o operador digitou não toca arquivo, rede nem
   * banco. `USER_DATA` seria tentador e errado — o texto nunca sai daqui. */
  permissions: [],

  storage: [
    { key: 'cripto:painel', version: 1, class: 'local' }
  ],

  events: {
    /* Anuncia o que fez sem saber quem escuta. O JARVIS pode querer registrar,
     * o diagnóstico pode querer contar — nenhum dos dois é problema deste
     * módulo. Sem PAYLOAD do texto: evento com dado sensível vira vazamento
     * pelo caminho do observador. */
    emits: ['cripto:cifrou', 'cripto:decifrou'],
    consumes: []
  },

  /**
   * A api que outro módulo usa. É o caminho legítimo que substitui o acesso
   * direto — o JARVIS quer cifrar uma anotação, pede aqui.
   */
  api: {
    /** @param {string} texto @param {string} senha */
    cifrar: (texto, senha) => cifrar(texto, senha),
    /** @param {string} b64 @param {string} senha */
    decifrar: (b64, senha) => decifrar(b64, senha),
    /** @param {string} texto @param {string} [algo] */
    hash: (texto, algo) => hash(texto, algo),
    algos: () => [...ALGOS_HASH]
  },
  apiVersion: 1,

  routes: [
    { path: '/cripto', view: (args) => import('./view.js').then((m) => m.criarView(estado, args)) }
  ],

  lifecycle: {
    /** @param {any} ctx */
    init(ctx) {
      /* Guardar o contexto é o que permite à view usar as capacidades sem
       * importar nada do Core — ela recebe, não busca. */
      estado = { ctx, painel: ctx.storage.get('cripto:painel', 'aes') };
      ctx.log.debug('cripto no ar', { painel: estado.painel });
    },

    dispose() {
      /* Sem timer nem listener para soltar — mas zerar a referência importa: um
       * módulo desmontado que continua segurando o contexto impede o Core de
       * ser coletado, e "vazamento em dispose" é o tipo de coisa que só aparece
       * depois de subir e descer o sistema mil vezes. */
      estado = null;
    }
  }
};
