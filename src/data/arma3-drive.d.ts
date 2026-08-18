/**
 * A pasta do Google Drive do operador — onde moram os arquivos do Arma 3.
 *
 * Trilha curada, no formato das outras, mais o índice das pastas reais. Os
 * tópicos aqui **não** têm `atalhos` (não é coisa de tecla, é coisa de
 * arquivo) e ganham um `link` opcional, presente em 2 dos 19: só alguns tópicos
 * apontam para um destino concreto.
 */

/** Um link nomeado dentro de um tópico. */
export interface A3DrvLink {
  readonly url: string;
  readonly rotulo: string;
}

export interface A3DrvTopico {
  readonly titulo: string;
  readonly texto: string;
  readonly dicas: readonly string[];
  /** Presente em 2 dos 19 tópicos. */
  readonly link?: A3DrvLink;
}

export interface A3DrvSecao {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly topicos: readonly A3DrvTopico[];
}

/** Uma pasta do Drive, pelo id que a URL de compartilhamento usa. */
export interface A3DrvPasta {
  readonly id: string;
  readonly nome: string;
  readonly driveId: string;
  readonly desc: string;
}

/** A pasta raiz — a que contém todas as outras. */
export interface A3DrvRaiz {
  readonly nome: string;
  readonly driveId: string;
}

export const A3DRV_PASTAS: readonly A3DrvPasta[];
export const A3DRV_RAIZ: A3DrvRaiz;
export const A3DRV_SECOES: readonly A3DrvSecao[];
export const A3DRV_TOTAL: number;
