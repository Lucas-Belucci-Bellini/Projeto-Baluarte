export interface MilitaryCard {
  icon: string;
  nome: string;
  dominio: string;
  resumo: string;
}

export interface MilitaryListItem {
  nome: string;
  resumo: string;
}

export interface MilitaryUnit {
  nome: string;
  efetivo: string;
  comando: string;
  simbolo: string;
}

export interface BattlespaceItem {
  nome: string;
  resumo: string;
  sub: readonly string[];
}

export interface MilitaryLevel {
  nome: string;
  escopo: string;
  resumo: string;
}

export interface MilitaryEra {
  era: string;
  marco: string;
}

export interface MilitaryRankItem {
  pais: string;
  v: number;
}

type ListCategoryType = 'list';

type Category =
  | { id: string; titulo: string; icon: string; tipo: 'cards'; data: readonly MilitaryCard[] }
  | { id: string; titulo: string; icon: string; tipo: 'list'; data: readonly MilitaryListItem[] }
  | { id: string; titulo: string; icon: string; tipo: 'units'; data: readonly MilitaryUnit[] }
  | { id: string; titulo: string; icon: string; tipo: 'battlespace'; data: readonly BattlespaceItem[] }
  | { id: string; titulo: string; icon: string; tipo: 'levels'; data: readonly MilitaryLevel[] }
  | { id: string; titulo: string; icon: string; tipo: 'eras'; data: readonly MilitaryEra[] }
  | { id: string; titulo: string; icon: string; tipo: 'rank-pct' | 'rank-bi'; data: readonly MilitaryRankItem[] };

export const MILITAR_CATEGORIAS: readonly Category[];
export const MILITAR_FONTES: string;
