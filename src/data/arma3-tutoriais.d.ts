/**
 * Tutoriais dos mods da coleção — escritos à mão, um por mod.
 *
 * Não é gerado do dump: é o texto que explica **como usar** cada mod, com as
 * teclas e as pegadinhas. O elo com o catálogo da Steam é a chave de
 * `A3TUT_MODS`, que é o ID do item no Workshop (o mesmo de `A3COL_ITENS` e de
 * `A3TUT_DEPS`).
 */

/** Par tecla → ação, exibido em `<kbd>`. */
export type A3TutAtalho = readonly [tecla: string, acao: string];

/** O tutorial de um mod. */
export interface A3TutMod {
  /** Casa com `A3TutCategoria.id`. */
  readonly cat: string;
  readonly nome: string;
  /** O que o mod é. */
  readonly oQue: string;
  /** Como se usa. */
  readonly como: string;
  readonly atalhos: readonly A3TutAtalho[];
  readonly dicas: readonly string[];
}

export interface A3TutCategoria {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
}

/**
 * O Dual Arms, que ganhou ficha própria.
 *
 * É o único mod com `url` e `nota` — carregar duas armas primárias muda regras
 * do jogo o bastante para merecer a ressalva escrita.
 */
export interface A3TutDualArms {
  readonly nome: string;
  readonly url: string;
  readonly oQue: string;
  readonly como: string;
  readonly atalhos: readonly A3TutAtalho[];
  readonly dicas: readonly string[];
  readonly nota: string;
}

export const A3TUT_CATEGORIAS: readonly A3TutCategoria[];
export const A3TUT_DUAL_ARMS: A3TutDualArms;

/** Indexado pelo ID do item no Workshop — chave desconhecida devolve `undefined`. */
export const A3TUT_MODS: Readonly<Record<string, A3TutMod | undefined>>;

export const A3TUT_TOTAL: number;
