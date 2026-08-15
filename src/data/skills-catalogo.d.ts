/**
 * Tipos do catálogo de skills — ARQUIVO GERADO junto de `skills-catalogo.js`.
 * Não edite à mão: rode `npm run gen-catalogo-skills`.
 */

export interface Skill {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly exemplos: readonly string[];
}

export declare const SKILLS: readonly Skill[];

/** Texto compacto pro briefing do JARVIS (uma linha por skill). */
export declare function skillsBriefing(): string;
