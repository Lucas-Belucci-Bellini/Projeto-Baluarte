/**
 * JARVIS Skills — habilidades que o agente cria para si mesmo.
 *
 * O agente chama `create_skill`, ganha uma capacidade nova, e ela é persistida
 * no storage e recarregada no boot do site.
 *
 * ── SEGURANÇA: por que a declaração não pode afrouxar isto ──────────────────
 * O corpo da skill é JavaScript rodando numa sandbox de três camadas: denylist
 * estática antes de salvar, shadowing dos globais perigosos como parâmetros
 * `undefined`, e `"use strict"` sem segredos (a skill só recebe `input` e `sdk`;
 * a chave de API do operador nunca chega nela).
 *
 * Skills são **puras**: computam ou consultam dados do Baluarte e devolvem um
 * valor serializável. Não tocam no DOM nem na rede. É por isso que
 * `SkillSdk` não tem nada de rede aqui — o tipo descreve exatamente o que a
 * sandbox entrega, e alargá-lo seria descrever uma sandbox que não existe.
 *
 * ── Por que os retornos são união ok/erro ───────────────────────────────────
 * Skill que não compila, nome que colide com built-in e limite de skills são
 * casos NORMAIS (o agente erra e tenta de novo), não exceções. O `ok` é o
 * discriminante, e com ele o TypeScript recusa ler `.skill` de um resultado que
 * só tem `.error`.
 */

/** O que a skill recebe como argumentos — vem do JSON Schema declarado nela. */
export type SkillInput = Readonly<Record<string, unknown>>;

/** As capacidades seguras expostas à skill. Sem rede, sem DOM, sem storage. */
export interface SkillSdk {
  /** Avalia expressão matemática. Lança se a expressão for inválida. */
  calc(expr: unknown): number;
  /** Busca no Arsenal — até 10 itens resumidos. */
  arsenal(query: unknown): unknown[];
  /** Ficha resumida de uma equipe de elite. `null` se o código não existe. */
  equipe(code: unknown): unknown | null;
  equipes(): unknown[];
  /** Resumo de um arco das Crônicas. `null` se o código não existe. */
  arco(code: unknown): unknown | null;
  arcos(): unknown[];
  /** Linha de depuração, devolvida junto do resultado em `logs`. */
  log(...args: unknown[]): void;
  now(): number;
}

/** A função compilada da skill. */
export type SkillRunner = (input: SkillInput, sdk: SkillSdk) => unknown;

/** O JSON Schema (de objeto) dos argumentos da skill. */
export interface SkillSchema {
  readonly type: 'object';
  readonly properties: Readonly<Record<string, unknown>>;
  readonly required?: readonly string[];
}

/** O que o agente manda ao pedir uma skill nova. Tudo é validado. */
export interface SkillSpec {
  readonly name?: unknown;
  readonly description?: unknown;
  readonly input_schema?: unknown;
  readonly code?: unknown;
}

/** Uma skill já validada, antes de ganhar id e contadores. */
export interface SkillValidada {
  readonly name: string;
  readonly description: string;
  readonly input_schema: SkillSchema;
  readonly code: string;
}

/** Uma skill persistida. */
export interface Skill extends SkillValidada {
  readonly id: string;
  readonly origin: string;
  readonly runs: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** O resumo que a UI e a ferramenta `list_skills` mostram — sem o código. */
export interface SkillResumo {
  readonly name: string;
  readonly description: string;
  readonly runs: number;
  readonly createdAt: number;
}

export type SkillValidacao =
  | { readonly ok: true; readonly skill: SkillValidada }
  | { readonly ok: false; readonly error: string };

export type SkillCriacao =
  | { readonly ok: true; readonly skill: Skill; readonly updated: boolean }
  | { readonly ok: false; readonly error: string };

export type SkillExecucao =
  | { readonly ok: true; readonly result: unknown; readonly logs: string[] }
  | { readonly ok: false; readonly error: string; readonly logs: string[] };

/**
 * Compila o corpo da skill numa função sandbox. Cacheia por string de código.
 * @throws {SyntaxError} se o código não compilar.
 */
export function buildRunner(code: string): SkillRunner;

/** Executa uma skill. Erro de compilação ou de execução vira `ok: false`. */
export function runSkill(skill: Skill, input: SkillInput | null | undefined): SkillExecucao;

/** As skills persistidas. `[]` quando o storage não tem nada utilizável. */
export function loadSkills(): Skill[];

/** Resumos para a UI e para `list_skills` — não expõe o código. */
export function listSkillSummaries(): SkillResumo[];

/**
 * Valida e normaliza uma especificação de skill.
 *
 * `reserved` são os nomes das ferramentas built-in: skill não pode sombrear uma.
 */
export function validateSkill(
  spec: SkillSpec | null | undefined,
  reserved?: readonly string[],
): SkillValidacao;

/** Cria (ou atualiza) e persiste uma skill. */
export function createSkill(
  spec: SkillSpec | null | undefined,
  opcoes?: { reserved?: readonly string[] },
): SkillCriacao;

/** Remove uma skill pelo nome. `false` se não existia. */
export function deleteSkill(name: string): boolean;
