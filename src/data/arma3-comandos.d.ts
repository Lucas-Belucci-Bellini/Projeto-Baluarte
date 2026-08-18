/**
 * Comandos de console do Arma 3 — o que se cola no debug console.
 *
 * ⚠️ Diferente das outras trilhas, os itens **não** têm `atalhos`: têm `sqf`, o
 * comando pronto. E `sqf` é `string | null` porque parte dos itens é explicação
 * conceitual sem comando associado — a página só mostra o bloco "▸ Comando"
 * quando há o que copiar.
 *
 * A coleção também se chama `itens`, não `topicos`, e o nome é preservado de
 * propósito: renomear aqui quebraria o gerador e a página em silêncio.
 */

export interface A3CmdItem {
  readonly titulo: string;
  readonly texto: string;
  /** Comando pronto para o console. `null` quando o item é só explicação. */
  readonly sqf: string | null;
  readonly dicas: readonly string[];
}

export interface A3CmdSecao {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly itens: readonly A3CmdItem[];
}

export const A3CMD_SECOES: readonly A3CmdSecao[];
export const A3CMD_TOTAL: number;
