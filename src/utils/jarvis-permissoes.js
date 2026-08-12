/**
 * Permissão exigida por ferramenta do JARVIS (issue #420).
 *
 * Mora fora de `jarvis-tools.js` por um motivo prático: aquele arquivo importa
 * o Arsenal, as Crônicas, o router e JSON via bundler, então não abre em Node
 * puro — e um mapa que decide quem pode o quê precisa ser **testável sem
 * navegador**. Aqui não há nenhuma dependência além de dados literais.
 *
 * A regra de ouro do #420 é `JARVIS → Permission → Tool`. `runTool()` é o
 * gargalo por onde toda chamada do agente passa (built-in, dinâmica ou skill),
 * e é lá que este mapa é consultado.
 */

/** Ferramenta built-in → permissão do catálogo (`src/core/politica.js`). */
export const PERMISSAO_POR_TOOL = Object.freeze({
  navigate: 'app.navegar',
  search_arsenal: 'arsenal.read',
  get_equipe: 'elites.read',
  get_arco: 'cronicas.read',
  calculate: 'ferramentas.calcular',
  open_editor: 'editor.write',
  system_status: 'sistema.diagnostico',
  read_site_state: 'sistema.diagnostico',
  set_color: 'ferramentas.write',
  recall_memory: 'jarvis.memoria.ler',
  create_skill: 'jarvis.skills.escrever',
  list_skills: 'jarvis.skills.ler',
  delete_skill: 'jarvis.skills.escrever'
});

/**
 * Padrão para o que não está no mapa. É `restrito` de propósito.
 *
 * Skill aprendida é código que o agente escreveu e o sandbox executa; e uma
 * ferramenta registrada em runtime que esqueceu de declarar permissão precisa
 * nascer NEGADA, com mensagem visível, em vez de nascer aberta e ninguém
 * perceber. O padrão fechado protege mais que o mapa.
 */
export const PERMISSAO_PADRAO = 'jarvis.skills.executar';

/**
 * Qual permissão esta ferramenta exige?
 *
 * @param {string} name nome da ferramenta
 * @param {{permissao?:string}} [dinamica] entrada do catálogo dinâmico, se houver
 * @returns {string} id de permissão
 */
export function permissaoDe(name, dinamica) {
  if (PERMISSAO_POR_TOOL[name]) return PERMISSAO_POR_TOOL[name];
  if (dinamica && dinamica.permissao) return dinamica.permissao;
  return PERMISSAO_PADRAO;
}
