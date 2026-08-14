export type RoboticaNivel = 'Básico' | 'Intermediário' | 'Avançado';

export interface RoboticaTopico {
  readonly nome: string;
  readonly desc: string;
}

export interface RoboticaModulo {
  readonly id: string;
  readonly titulo: string;
  readonly icon: string;
  readonly nivel: RoboticaNivel;
  readonly resumo: string;
  readonly topicos: readonly RoboticaTopico[];
}

export const ROBOTICA_MODULOS: readonly RoboticaModulo[];
export const ROBOTICA_TOTAL: number;
