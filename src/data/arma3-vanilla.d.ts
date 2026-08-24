/**
 * Tutorial do Arma 3 vanilla — o jogo-base, escrito à mão.
 *
 * Conteúdo curado (não gerado do dump): as seções e tópicos que explicam o jogo
 * sem mod nenhum. Declaração e não conversão porque é catálogo de texto — a
 * página só lê.
 *
 * `atalhos` é opcional em 10 dos 42 tópicos: nem toda explicação tem tecla
 * associada, e uma lista vazia obrigatória faria a página renderizar o bloco
 * "⌨️ Comandos & atalhos" sem nada dentro.
 */

/** Par tecla → ação, exibido em `<kbd>`. */
export type A3VanAtalho = readonly [tecla: string, acao: string];

export interface A3VanTopico {
  readonly titulo: string;
  readonly texto: string;
  readonly atalhos?: readonly A3VanAtalho[];
  readonly dicas: readonly string[];
}

export interface A3VanSecao {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly topicos: readonly A3VanTopico[];
}

export const A3VAN_SECOES: readonly A3VanSecao[];
export const A3VAN_TOTAL_TOPICOS: number;
