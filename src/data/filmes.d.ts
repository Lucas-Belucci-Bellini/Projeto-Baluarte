export interface Filme {
  readonly id: string;
  readonly titulo: string;
  readonly ano: number | null;
  readonly genero: string;
  readonly sinopse: string;
}

export const FILMES: readonly Filme[];
export const FILMES_TOTAL: number;
export function filmeEmbedUrl(id: string): string;
