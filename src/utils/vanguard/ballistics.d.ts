/**
 * Motor balístico — o cérebro do computador de tiro.
 *
 * Dois solucionadores, e a escolha entre eles é decisão de engenharia:
 * `resolverVacuo()` é forma fechada (microssegundos, mas superestima o alcance
 * em 15–25 % num morteiro de 82 mm a 3 km) e serve para pré-filtrar cargas e
 * rodar em laço de UI; `resolverComArrasto()` é integração numérica com vento
 * 3D, e é o número que vai para a peça.
 *
 * ── Por que o resultado é união discriminada ────────────────────────────────
 * "Alvo fora de alcance" não é exceção, é resposta — acontece o tempo todo ao
 * varrer as cargas. Por isso o retorno é `{ ok: false, motivo }` ou
 * `{ ok: true, … }`, e o `ok` é o discriminante: com ele o TypeScript recusa
 * ler `elevacaoRad` de uma solução que não existe, que é exatamente o defeito
 * que um `undefined` calado produziria no meio do cartão de tiro.
 */

/** Modo de trajetória: curvo (o normal do morteiro) ou tenso. */
export type ModoTiro = 'alto' | 'tenso';

/** Gravidade padrão (CGPM 1901). O Arma 3 usa 9.81 — passe `g: 9.81` para bater com o jogo. */
export const G_PADRAO: number;

export const MODO: { readonly ALTO: 'alto'; readonly TENSO: 'tenso' };

/** Uma amostra da trajetória. `y` é altura acima da boca do tubo. */
export interface AmostraTrajetoria {
  readonly x: number;
  readonly y: number;
  /** Través (+ direita). */
  readonly z: number;
  readonly t: number;
  readonly v: number;
}

/** O ponto em que a trajetória, DESCENDO, cruza a altura do alvo. */
export interface CruzamentoTrajetoria {
  readonly x: number;
  readonly z: number;
  readonly t: number;
  readonly vx: number;
  readonly vy: number;
  readonly vz: number;
}

export interface PedidoVacuo {
  /** Distância HORIZONTAL peça→alvo (m). */
  readonly distanciaM: number;
  /** Altitude do alvo menos a da peça (m, + = alvo acima). */
  readonly deltaAltM?: number;
  /** Velocidade inicial (m/s). */
  readonly v: number;
  readonly modo?: ModoTiro;
  readonly g?: number;
}

export interface SolucaoVacuoOk {
  readonly ok: true;
  readonly elevacaoRad: number;
  readonly elevacaoDeg: number;
  readonly tempoVooS: number;
  /** Apogeu acima da BOCA do tubo, não acima do solo. */
  readonly apiceM: number;
  readonly velocidadeImpacto: number;
  readonly anguloImpactoDeg: number;
  readonly alcanceMaxM: number;
  readonly solver: 'vacuo';
}

export interface SolucaoFalha {
  readonly ok: false;
  readonly motivo: string;
  readonly alcanceMaxM: number;
}

export type SolucaoVacuo = SolucaoVacuoOk | SolucaoFalha;

export interface PedidoIntegracao {
  readonly v: number;
  readonly elevacaoRad: number;
  /** Coeficiente de arrasto (`airFriction`), **negativo**. */
  readonly mu: number;
  readonly deltaAltM?: number;
  readonly g?: number;
  /** m/s, + = vento de CAUDA (empurra). */
  readonly ventoLongitudinal?: number;
  /** m/s, + = vento vindo da ESQUERDA (leva à direita). */
  readonly ventoTravessal?: number;
  readonly dt?: number;
  readonly tMax?: number;
  readonly guardarPontos?: boolean;
}

/** `pts` é `null` quando `guardarPontos: false`; `cruzamento` quando não cruza. */
export interface ResultadoIntegracao {
  readonly pts: AmostraTrajetoria[] | null;
  readonly cruzamento: CruzamentoTrajetoria | null;
}

export interface PedidoArrasto {
  readonly distanciaM: number;
  readonly deltaAltM?: number;
  readonly v: number;
  /** Coeficiente de arrasto (`airFriction`), **negativo**. */
  readonly mu: number;
  readonly modo?: ModoTiro;
  readonly ventoLongitudinal?: number;
  readonly ventoTravessal?: number;
  readonly g?: number;
  readonly dt?: number;
}

export interface SolucaoArrastoOk {
  readonly ok: true;
  readonly elevacaoRad: number;
  readonly elevacaoDeg: number;
  readonly tempoVooS: number;
  readonly apiceM: number;
  /** Erro residual de alcance da solução (m) — deve ficar em centímetros. */
  readonly residuoM: number;
  /** Deriva lateral acumulada pelo vento de través (m, + = direita). */
  readonly derivaM: number;
  readonly velocidadeImpacto: number;
  readonly anguloImpactoDeg: number;
  readonly alcanceMaxM: number;
  readonly trajetoria: AmostraTrajetoria[] | null;
  readonly solver: 'arrasto';
}

/**
 * Falha do solver com arrasto.
 *
 * `alcanceMaxM` e `faltaM` só existem quando a falha é "fora de alcance" — nas
 * validações de entrada (v ≤ 0, μ ≥ 0, distância ≤ 0) o alcance máximo nem
 * chegou a ser calculado.
 */
export interface SolucaoArrastoFalha {
  readonly ok: false;
  readonly motivo: string;
  readonly alcanceMaxM?: number;
  readonly faltaM?: number;
  readonly solver?: 'arrasto';
}

export type SolucaoArrasto = SolucaoArrastoOk | SolucaoArrastoFalha;

/**
 * Alcance máximo no vácuo para um alvo a `deltaAlt` metros acima da peça.
 * `0` se nem no melhor ângulo o projétil alcança a altura do alvo.
 */
export function alcanceMaximoVacuo(v: number, deltaAlt?: number, g?: number): number;

/** Resolve o tiro no vácuo (forma fechada). Rápido; superestima o alcance. */
export function resolverVacuo(pedido: PedidoVacuo): SolucaoVacuo;

/**
 * Integra a trajetória com arrasto quadrático e vento.
 *
 * O vento entra como velocidade DO AR: o arrasto age sobre `v − v_ar`, o que
 * faz vento de cauda/proa alterarem alcance e vento de través gerar deriva —
 * tudo do mesmo termo, sem gambiarra.
 */
export function integrarTrajetoria(pedido: PedidoIntegracao): ResultadoIntegracao;

/** Resolve o tiro COM arrasto e vento. É o número que vai para a peça. */
export function resolverComArrasto(pedido: PedidoArrasto): SolucaoArrasto;

/**
 * Calibra o coeficiente de arrasto a partir de "esta arma, nesta carga (v),
 * tem alcance máximo R".
 *
 * Inventar um `airFriction` é chutar; alcance máximo por carga é dado de tabela
 * de tiro, público e verificável. Devolve μ **negativo**. Alcance publicado
 * maior que o do vácuo (nenhum arrasto explica) devolve `-1e-9`.
 */
export function calibrarArrasto(
  v: number,
  alcanceMaxM: number,
  opcoes?: { g?: number; dt?: number },
): number;
