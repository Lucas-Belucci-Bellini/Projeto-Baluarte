/**
 * JARVIS Tools — as ferramentas do modo Agente.
 *
 * Declara o schema no formato de tool-use da API da Claude e a implementação
 * local de cada uma. O agente chama estas funções para executar ações reais
 * dentro do Baluarte.
 *
 * ── A ordem das fronteiras, que o tipo não pode inverter ────────────────────
 * `runTool()` checa **permissão antes do guard**. A permissão julga se a chamada
 * podia sequer ser tentada; o guard (Sponsio) julga o conteúdo dela. Perguntar
 * "esse comando é perigoso?" sobre uma ação que nem devia estar disponível é
 * responder tarde.
 *
 * Ferramenta sem mapa em `jarvis-permissoes.ts` cai no padrão **fechado**
 * (`jarvis.skills.executar`) — nasce negada, de propósito.
 *
 * ── Por que o resultado tem índice `unknown` ────────────────────────────────
 * Cada ferramenta devolve o próprio payload (`navigated`, `results`, `equipe`,
 * `memories`…), e o agente serializa isso para o modelo. O que é comum a todas
 * é `ok` e, na falha, `error` — mais os campos de recusa (`negado`, `permissao`,
 * `blocked`). O resto é aberto, e `unknown` obriga quem lê a estreitar em vez de
 * confiar. Um `any` aqui devolveria a checagem que a fronteira existe para dar.
 */

/** Uma ferramenta no formato de tool-use da API da Claude. */
export interface ToolSchema {
  readonly name: string;
  readonly description: string;
  readonly input_schema: Readonly<Record<string, unknown>>;
}

/** Os argumentos que o modelo manda para a ferramenta. */
export type ToolInput = Readonly<Record<string, unknown>>;

/**
 * O que uma ferramenta devolve.
 *
 * `ok: false` cobre três recusas diferentes, e elas não são a mesma coisa:
 * `negado` é a fronteira de permissão, `blocked` é o guard do agente, e nenhum
 * dos dois presente é falha da própria ferramenta.
 */
export interface ToolResult {
  readonly ok: boolean;
  readonly error?: string;
  /** Recusado pela fronteira de permissão — veja `permissao`. */
  readonly negado?: boolean;
  /** A permissão exigida, quando a recusa foi dela. */
  readonly permissao?: string;
  /** Recusado pelo guard do agente (Sponsio). */
  readonly blocked?: boolean;
  readonly [chave: string]: unknown;
}

/** Uma ferramenta registrada em runtime por outra parte do site. */
export interface ToolRegistrada {
  readonly name: string;
  readonly description: string;
  readonly input_schema?: Readonly<Record<string, unknown>>;
  readonly run: (input: ToolInput) => ToolResult;
  /**
   * Permissão do catálogo de `src/core/politica.js`. Opcional, mas sem ela a
   * ferramenta cai no padrão fechado.
   */
  readonly permissao?: string;
}

/** Uma skill persistida, do ponto de vista de quem a registra como ferramenta. */
export interface SkillRegistravel {
  readonly name: string;
  readonly description: string;
  readonly input_schema?: Readonly<Record<string, unknown>>;
}

/** Os schemas das ferramentas built-in. */
export const TOOL_SCHEMAS: readonly ToolSchema[];

/**
 * Registra uma ferramenta nova no catálogo do agente.
 * `false` quando o objeto não tem `name` ou `run`.
 */
export function registerTool(tool: ToolRegistrada | null | undefined): boolean;

/** Schemas de TODAS as ferramentas: built-ins + registradas (inclui skills). */
export function getToolSchemas(): ToolSchema[];

/**
 * Executa uma ferramenta pelo nome.
 *
 * Nunca lança por causa da ferramenta: erro de implementação, permissão negada
 * e bloqueio do guard viram `ok: false` com a explicação.
 */
export function runTool(name: string, input: ToolInput | null | undefined): ToolResult;

/** Remove uma ferramenta dinâmica do catálogo. */
export function unregisterTool(name: string): boolean;

/** Registra uma skill persistida como ferramenta dinâmica. */
export function registerSkillAsTool(skill: SkillRegistravel): boolean;

/** Carrega e registra as skills salvas. Idempotente. */
export function initSkills(): void;

/** Apaga a skill do storage e desregistra a ferramenta. `false` se não existia. */
export function removeSkill(name: string): boolean;
