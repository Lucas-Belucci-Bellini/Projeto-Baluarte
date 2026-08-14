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

export type BuiltInPermissionId =
  | 'app.navegar'
  | 'arsenal.read'
  | 'elites.read'
  | 'cronicas.read'
  | 'ferramentas.calcular'
  | 'editor.write'
  | 'sistema.diagnostico'
  | 'ferramentas.write'
  | 'jarvis.memoria.ler'
  | 'jarvis.skills.escrever'
  | 'jarvis.skills.ler'
  | 'jarvis.skills.executar';

export type PermissionId = string;

/** Ferramenta built-in → permissão do catálogo (`src/core/politica.js`). */
export const PERMISSAO_POR_TOOL: Readonly<Record<string, BuiltInPermissionId>> = Object.freeze({
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
  delete_skill: 'jarvis.skills.escrever',
});

/**
 * Padrão para o que não está no mapa. É `restrito` de propósito.
 *
 * Skill aprendida é código que o agente escreveu e o sandbox executa; e uma
 * ferramenta registrada em runtime que esqueceu de declarar permissão precisa
 * nascer NEGADA, com mensagem visível, em vez de nascer aberta e ninguém
 * perceber. O padrão fechado protege mais que o mapa.
 */
export const PERMISSAO_PADRAO: BuiltInPermissionId = 'jarvis.skills.executar';

export interface DynamicToolPermission {
  readonly permissao?: string;
}

/** Qual permissão esta ferramenta exige? */
export function permissaoDe(
  name: string,
  dinamica?: DynamicToolPermission,
): PermissionId {
  return PERMISSAO_POR_TOOL[name]
    ?? dinamica?.permissao
    ?? PERMISSAO_PADRAO;
}
