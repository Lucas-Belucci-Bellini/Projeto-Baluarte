/**
 * Sistemas de armas, munições e CARGAS.
 *
 * ⚠️ **Procedência dos números.** Os valores são de REFERÊNCIA DE MODELO,
 * compilados de dados públicos (velocidade inicial por carga e alcance
 * máximo/mínimo). Eles **não** são tabela de tiro oficial e não substituem uma.
 *
 * O que é honesto no módulo, e o que os tipos preservam: em vez de inventar um
 * coeficiente de arrasto, ele guarda o par (v₀, alcance máximo publicado) — que
 * é verificável — e **deriva** o arrasto com `calibrarArrasto()`. Trocar a
 * fonte por uma tabela real recalibra tudo sozinho.
 */

/** Uma carga do sistema. `id: 0` é a mais fraca. */
export interface Carga {
  readonly id: number;
  /** Velocidade inicial (m/s). */
  readonly v0: number;
  /** Alcance máximo publicado (m) — é daqui que sai o arrasto calibrado. */
  readonly alcanceMaxM: number;
  /** Alcance mínimo prático (m). */
  readonly alcanceMinM: number;
}

/** Um sistema de arma (morteiro), com suas cargas. */
export interface Sistema {
  readonly id: string;
  readonly nome: string;
  /** Em milímetros. */
  readonly calibre: number;
  readonly origem: string;
  readonly tipo: string;
  /** Só nos sistemas que existem no Arma 3. */
  readonly jogo?: boolean;
  readonly cargas: readonly Carga[];
  /** Dispersão de alcance como fração da distância. */
  readonly dispersaoAlcanceRel: number;
  readonly dispersaoDirecaoMil: number;
  /** Piso de dispersão (m): pontaria, assentamento e incerteza de posição. */
  readonly dispersaoBaseM: number;
  /** Gravidade que o sistema recomenda — o Mk6 usa 9,81, como o jogo. */
  readonly gRecomendado?: number;
}

/** A ficha resumida de um sistema, para popular um seletor na UI. */
export interface SistemaResumo {
  readonly id: string;
  readonly nome: string;
  readonly calibre: number;
  readonly origem: string;
  readonly tipo: string;
  readonly jogo: boolean;
  /** Quantas cargas o sistema tem. */
  readonly cargas: number;
  /** O maior alcance máximo entre as cargas. */
  readonly alcanceMaxM: number;
}

/**
 * A elipse de dispersão estimada.
 *
 * Duas parcelas somadas em quadratura: a proporcional à distância (dispersão
 * balística) e o **piso absoluto**, que não some quando o alvo está perto
 * (pontaria, placa-base e a incerteza da própria posição). Sem o piso o modelo
 * diria que a 100 m a dispersão é de centímetros — falso, e pior: faria o aviso
 * de segurança nunca disparar justamente na situação mais perigosa.
 *
 * Não é tabela de tiro: é ordem de grandeza para desenhar a elipse e alertar.
 */
export interface ZonaBatida {
  /** Erro provável (50 % dos tiros dentro), em alcance. */
  readonly erroProvavelAlcanceM: number;
  readonly erroProvavelDirecaoM: number;
  /** ~4 EP ≈ praticamente todos os tiros. */
  readonly semiEixoAlcanceM: number;
  readonly semiEixoDirecaoM: number;
  /** Raio único conservador, para checagem rápida de segurança. */
  readonly raioSegurancaM: number;
}

/** Os sistemas conhecidos, indexados por id (`mk6_82mm`, `m252_81mm`…). */
export const SISTEMAS: Readonly<Record<string, Sistema | undefined>>;

/**
 * Coeficiente de arrasto (μ, negativo) de uma carga, derivado do alcance máximo
 * publicado. Memoizado — a calibração roda bisseção com integração dentro.
 *
 * @throws {RangeError} sistema desconhecido ou carga inexistente nele.
 */
export function arrastoDaCarga(sistemaId: string, cargaId: number): number;

/** Lista de sistemas para popular um seletor na UI. */
export function listarSistemas(): SistemaResumo[];

/**
 * Estimativa da zona batida para uma solução.
 * @throws {RangeError} se o sistema não existir.
 */
export function zonaBatida(
  sistemaId: string,
  distanciaM: number,
  opcoes?: { erroPosicaoM?: number },
): ZonaBatida;
