/**
 * Campanhas e missões do Arma 3 — trilha curada do tutorial.
 *
 * Mesmo formato das outras trilhas: seções com tópicos, atalhos e dicas.
 */

/** Par tecla → ação, exibido em `<kbd>`. */
export type A3CampAtalho = readonly [tecla: string, acao: string];

export interface A3CampTopico {
  readonly titulo: string;
  readonly texto: string;
  readonly atalhos: readonly A3CampAtalho[];
  readonly dicas: readonly string[];
}

export interface A3CampSecao {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly topicos: readonly A3CampTopico[];
}

export const A3CAMP_SECOES: readonly A3CampSecao[];
export const A3CAMP_TOTAL: number;
