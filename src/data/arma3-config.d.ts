/**
 * Tutorial de configuração do Arma 3 — gráficos, rede, controles.
 *
 * Conteúdo curado, mesmo formato das outras trilhas do tutorial. Aqui todos os
 * 19 tópicos trazem atalhos, diferente do vanilla.
 */

/** Par tecla → ação, exibido em `<kbd>`. */
export type A3CfgAtalho = readonly [tecla: string, acao: string];

export interface A3CfgTopico {
  readonly titulo: string;
  readonly texto: string;
  readonly atalhos: readonly A3CfgAtalho[];
  readonly dicas: readonly string[];
}

export interface A3CfgSecao {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly topicos: readonly A3CfgTopico[];
}

export const A3CFG_SECOES: readonly A3CfgSecao[];
export const A3CFG_TOTAL_TOPICOS: number;
