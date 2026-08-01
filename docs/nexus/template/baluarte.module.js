/**
 * Entrada única do domínio — contrato v1.0.0.
 *
 * O orquestrador do Nexus não lê mais nada deste repositório além deste
 * arquivo. Tudo que o domínio publica (rotas, eventos, dependências) passa
 * por aqui — é o que impede a "unificação" de virar dependência invisível.
 *
 * Especificação completa: docs/NEXUS-CONTRATO.md (Projeto-Baluarte).
 */

export default {
  nome: 'DOMINIO',        // igual ao repositório, sem o prefixo baluarte-
  versao: '0.1.0',        // semver DESTE domínio
  contrato: '1.0.0',      // versão do contrato implementada

  /* Rotas publicadas. `load` é sempre import() dinâmico — é o que preserva o
   * code-splitting: cada página vira um chunk, baixado só quando acessada. */
  rotas: [
    // {
    //   path: '/exemplo',
    //   titulo: 'Exemplo',
    //   icone: 'exemplo',          // chave no icons.js do core
    //   peso: 'leve',              // 'pesado' => só no app (gate #238)
    //   load: () => import('./src/paginas/exemplo.js'),
    // },
  ],

  /* Declarar é obrigatório: evento não declarado é acoplamento escondido. */
  eventos: {
    emite: [],
    escuta: [],
  },

  /* Só domínio que existe no mapa, e sem ciclo (verificar-nexus.mjs cobra). */
  precisa: ['baluarte-core'],

  /** Sobe quando o módulo entra. `ctx` traz router, bus, appState, storage. */
  async iniciar(_ctx) {},

  /** Desmonta: solte listener, timer e worker. O que sobra vaza entre rotas. */
  async parar() {},
};
