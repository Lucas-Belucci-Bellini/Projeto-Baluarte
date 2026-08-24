/**
 * Calculadora de balística do Arma 3 — o modelo de arrasto real do engine.
 *
 * ── Por que declaração, e não conversão ─────────────────────────────────────
 * O módulo é PURO e integra numericamente a mesma equação que o jogo resolve
 * (`airFriction` + `initSpeed` do config). Está medido e coberto por teste;
 * declarar a fronteira tipa quem consome sem tocar no integrador.
 *
 * ── O `null` e o `throw` são a parte importante ─────────────────────────────
 * `dadosBalisticos()` devolve `null` quando o modelo **não se aplica**: foguete
 * e míssil têm `airFriction` POSITIVO e `v0` de ejeção (~30 m/s) porque seguem
 * outro modelo de voo. Jogar esse par no integrador produziria uma bala
 * GANHANDO velocidade — ficção desenhada com cara de medição. `resolverTiro()`
 * é a guarda simétrica: com `airFriction >= 0` ele **lança**, em vez de
 * devolver curva impossível. Os tipos preservam os dois comportamentos.
 */

/** De onde saiu o par (`v0`, `airFriction`) que alimenta o integrador. */
export type FonteBalistica = 'config' | 'referencia';

/**
 * O que `dadosBalisticos()` precisa saber de uma arma.
 *
 * Declarado estruturalmente de propósito: o módulo não importa o catálogo, só
 * lê estes quatro campos — e `A3Arma` os satisfaz.
 */
export interface ArmaBalistica {
  /** `false` marca explicitamente a arma que não segue o modelo balístico. */
  readonly balistico?: boolean | null;
  /** Velocidade de saída medida no config (m/s). */
  readonly v0?: number | null;
  /** Arrasto medido no config. **Negativo** quando é arrasto de verdade. */
  readonly airFriction?: number | null;
  readonly calibre?: string | null;
}

/** O par que o integrador consome, com a procedência declarada. */
export interface DadosBalisticos {
  readonly initSpeed: number;
  /** Sempre negativo — se não for, a arma não passa por aqui. */
  readonly airFriction: number;
  readonly fonte: FonteBalistica;
}

/** Uma amostra da trajetória integrada. `y` é altura relativa à linha de mira. */
export interface PontoTrajetoria {
  readonly x: number;
  readonly y: number;
  /** Deriva lateral acumulada pelo vento (m, + para a direita). */
  readonly z: number;
  readonly t: number;
  readonly v: number;
}

export interface PedidoTiro {
  readonly initSpeed: number;
  /** Deve ser negativo — positivo lança `RangeError`. */
  readonly airFriction: number;
  /** Distância de zeragem (m). */
  readonly zero: number;
  /** Distância do alvo (m). */
  readonly alvo: number;
  /** Vento lateral (m/s, + para a direita). */
  readonly vento?: number;
}

export interface ResultadoTiro {
  readonly anguloZeroGraus: number;
  /** Positivo = acima da mira; negativo = abaixo. */
  readonly quedaCm: number;
  /** MILIRRADIANO (1 mrad = 1 m a 1000 m), **não** mil NATO. */
  readonly mils: number;
  readonly tempo: number;
  readonly vAlvo: number;
  readonly vFrac: number;
  /** Fração da energia cinética de saída que resta no alvo (%). */
  readonly energiaRelPct: number;
  readonly derivaVentoCm: number;
  readonly trajetoria: readonly PontoTrajetoria[];
  /** Altura máxima acima da linha de mira (m). */
  readonly apiceM: number;
}

/** O pedido da tabela: igual ao do tiro, mas sem alvo único. */
export interface PedidoTabela {
  readonly initSpeed: number;
  readonly airFriction: number;
  readonly zero: number;
  readonly vento?: number;
}

/** Uma linha do cartão de tiro. `mils` e `derivaMils` são MILIRRADIANOS. */
export interface LinhaQueda {
  readonly d: number;
  readonly quedaCm: number;
  readonly mils: number;
  readonly derivaCm: number;
  readonly derivaMils: number;
  readonly v: number;
  readonly t: number;
}

/**
 * `airFriction` de REFERÊNCIA por família de calibre (negativo = arrasto).
 *
 * Só entra quando o config não informa o arrasto da arma, e o resultado sai
 * marcado como `fonte: 'referencia'` para a tela poder dizer que é estimativa.
 * As chaves são os rótulos **normalizados** pelo gerador (`arma3-armas.js`) —
 * calibre desconhecido devolve `undefined`, e o fallback simplesmente não casa.
 */
export const AIR_FRICTION_REF: Readonly<Record<string, number | undefined>>;

/**
 * Os números de tiro de uma arma, ou `null` quando o modelo não se aplica.
 *
 * `null` é resposta legítima e frequente — veja o cabeçalho do arquivo.
 */
export function dadosBalisticos(arma: ArmaBalistica | null | undefined): DadosBalisticos | null;

/**
 * Resolve o tiro.
 *
 * @throws {RangeError} se `airFriction >= 0` (é empuxo, não arrasto) ou se
 * `initSpeed <= 0`. Use `dadosBalisticos()` para filtrar antes.
 */
export function resolverTiro(pedido: PedidoTiro): ResultadoTiro;

/**
 * Tabela de queda para várias distâncias — o "cartão de tiro" da arma.
 *
 * Integra UMA vez e amostra em cada distância: o ângulo de zeragem é o mesmo
 * para toda a tabela.
 */
export function tabelaQueda(
  pedido: PedidoTabela,
  distancias: readonly number[],
): LinhaQueda[];

/** 6400 mils NATO por volta. */
export const MIL_NATO_POR_VOLTA: number;
/** 2π·1000 ≈ 6283,2 milirradianos por volta. */
export const MRAD_POR_VOLTA: number;

/**
 * mrad → mil NATO. A razão é ~0,982: parece arredondamento, mas a 1000 m dá
 * quase 2 m de erro — por isso o motor guarda radiano e converte só na borda.
 */
export function milRadParaMilNato(mrad: number): number;
