/**
 * Contrato **Fire Mission** — a fronteira entre o GPS e o computador de tiro.
 *
 * O pacote é desenhado para atravessar qualquer transporte: chamada de função,
 * `postMessage` para um Worker, `POST /api/fire-mission` ou frame de WebSocket.
 * **A mesma função resolve nos quatro casos** — é o que evita duas
 * implementações da física divergindo com o tempo.
 *
 * ── O que os tipos aqui protegem ────────────────────────────────────────────
 * `PosicaoPedido` é união discriminada por `tipo`, então o TypeScript exige os
 * campos certos de cada formato — misturar `lat` com `x` deixa de compilar em
 * vez de virar `TypeError` em tempo de execução. E `resolverMissao()` devolve
 * união discriminada por `ok`: quem lê `solucoes` sem checar `ok` não compila.
 *
 * O que os tipos **não** podem proteger, e por isso continua validado em tempo
 * de execução: peça e alvo em quadros diferentes (um geo, outro local) e peça e
 * alvo em terrenos diferentes. Os dois passam no tipo e dariam um azimute com
 * cara de válido entre pontos que não se tocam.
 */

import type { SistemaMil } from './angles.js';
import type { ModoTiro } from './ballistics.js';
import type { ZonaBatida } from './charges.js';

export const SCHEMA_PEDIDO: string;
export const SCHEMA_RESPOSTA: string;
export const VERSAO_MOTOR: string;

/** Posição em lat/lon (graus). */
export interface PosicaoLatLon {
  readonly tipo: 'latlon';
  readonly lat: number;
  readonly lon: number;
  readonly alt?: number;
}

/** Posição em MGRS (`"23K PQ 83477 60685"`). */
export interface PosicaoMGRS {
  readonly tipo: 'mgrs';
  readonly valor: string;
  readonly alt?: number;
}

/** Posição local por metros do mundo. */
export interface PosicaoLocalXY {
  readonly tipo: 'local';
  readonly x: number;
  readonly y: number;
  readonly alt?: number;
}

/**
 * Posição local pela grade escrita.
 *
 * ⚠️ `terreno` **não tem padrão**, de propósito: com ele a grade é lida pelo
 * config daquele mundo (offset e sinal do passo); sem ele cai na grade local
 * genérica, que é a convenção MGRS — e que está INVERTIDA no eixo N-S em 30
 * dos 31 mundos do jogo. Adivinhar erraria o eixo calado.
 */
export interface PosicaoLocalGrade {
  readonly tipo: 'local';
  readonly grid: string;
  readonly terreno?: string;
  readonly alt?: number;
}

export type PosicaoPedido =
  | PosicaoLatLon | PosicaoMGRS | PosicaoLocalXY | PosicaoLocalGrade;

/** Posição já normalizada: geográfica ou local, com altitude sempre presente. */
export type PosicaoNormalizada =
  | { readonly tipo: 'geo'; readonly lat: number; readonly lon: number; readonly alt: number }
  | { readonly tipo: 'local'; readonly x: number; readonly y: number; readonly alt: number };

export interface PecaPedido {
  readonly pos: PosicaoPedido;
  readonly sistema: string;
  /** Quais cargas tentar. Ausente ou vazio = todas as do sistema. */
  readonly cargas?: readonly number[];
  /** Incerteza da própria posição (m) — entra no piso da zona batida. */
  readonly erroPosicaoM?: number;
}

export interface AlvoPedido {
  readonly pos: PosicaoPedido;
  readonly id?: string;
}

export interface AmigoPedido {
  readonly pos: PosicaoPedido;
  readonly id?: string;
}

export interface AmbientePedido {
  readonly ventoVelocidadeMs?: number;
  /** Direção DE ONDE o vento vem (convenção METAR): 270° = vento de oeste. */
  readonly ventoDirecaoDeg?: number;
  /** Declinação magnética, leste positiva. */
  readonly declinacaoMagDeg?: number;
  readonly gravidade?: number;
}

export interface OpcoesPedido {
  readonly modo?: ModoTiro;
  readonly sistemaMil?: SistemaMil;
  readonly solver?: 'arrasto' | 'vacuo';
}

/** Um pedido `vanguard.fire-mission/1`. */
export interface MissaoPedido {
  readonly schema?: string;
  readonly id?: string;
  readonly peca: PecaPedido;
  readonly alvo: AlvoPedido;
  readonly ambiente?: AmbientePedido;
  readonly opcoes?: OpcoesPedido;
  /**
   * Posições amigas conhecidas. Sem elas o "danger close" NÃO é avaliado, e a
   * resposta diz isso — um alerta de segurança falso-negativo silencioso é
   * pior que nenhum.
   */
  readonly amigos?: readonly AmigoPedido[];
}

/** As componentes do vento na linha de tiro. */
export interface ComponentesVento {
  /** + = empurra o projétil (vento de cauda). */
  readonly longitudinal: number;
  /** + = empurra para a direita. */
  readonly travessal: number;
}

/** Uma solução de tiro, por carga. */
export interface SolucaoCarga {
  readonly carga: number;
  readonly v0: number;
  readonly modo: ModoTiro;
  readonly elevacaoMil: number;
  readonly elevacaoDeg: number;
  readonly tempoVooS: number;
  readonly apiceM: number;
  /** Altitude ABSOLUTA do apogeu — é o número que libera espaço aéreo. */
  readonly apiceAltitudeM: number;
  readonly derivaVentoM: number;
  /** Quantos mils virar CONTRA a deriva para o projétil cair na linha. */
  readonly correcaoDirecaoMil: number;
  readonly velocidadeImpactoMs: number;
  readonly anguloImpactoDeg: number;
  readonly alcanceMaxM: number;
  readonly residuoM: number;
  readonly zonaBatida: ZonaBatida;
  readonly abaixoDoMinimo: boolean;
  readonly folgaM: number;
  readonly folgaRel: number;
  /** Só na primeira do ranqueamento: a menor carga que alcança com folga. */
  readonly preferida?: boolean;
}

export interface GeometriaResposta {
  readonly quadro: 'geo' | 'local';
  readonly distanciaHorizontalM: number;
  readonly distanciaInclinadaM: number;
  readonly deltaAltM: number;
  readonly dE: number;
  readonly dN: number;
  /** `null` no quadro local — não há fuso. */
  readonly zonaUTM: number | null;
  readonly fatorEscala: number | null;
}

/**
 * Os três nortes.
 *
 * `verdadeiroDeg` e `magneticoDeg` são `null` no quadro local: na grade do jogo
 * "norte" é o norte da grade e pronto. `magneticoDeg` também é `null` quando o
 * pedido não informa a declinação.
 */
export interface AzimuteResposta {
  readonly gradeDeg: number;
  readonly gradeMil: number;
  readonly verdadeiroDeg: number | null;
  readonly magneticoDeg: number | null;
  readonly magneticoMil: number | null;
  readonly convergenciaDeg: number | null;
}

export interface VentoResposta {
  readonly velocidadeMs: number;
  readonly direcaoDeg: number | null;
  readonly longitudinalMs: number;
  readonly travessalMs: number;
}

/**
 * Avaliação de segurança.
 *
 * `avaliado: false` quando não houve solução preferida. Quando `true`, a
 * própria peça sempre entra como posição amiga — mas `motivo` diz se foi só
 * ela, porque "nenhum amigo dentro da zona" com zero amigos informados não é
 * a mesma garantia que com a lista completa.
 */
export interface SegurancaResposta {
  readonly avaliado: boolean;
  readonly motivo: string | null;
  readonly maisProximo: { readonly id: string; readonly distanciaM: number } | null;
  readonly raioSegurancaM?: number;
  readonly dentroDaZona?: boolean;
}

export interface MotorResposta {
  readonly versao: string;
  readonly solver: 'arrasto' | 'vacuo';
  readonly sistemaMil: SistemaMil;
  readonly gravidade: number;
}

/** Pedido recusado na validação — nada foi calculado. */
export interface MissaoRespostaInvalida {
  readonly schema: string;
  readonly ok: false;
  readonly erros: readonly string[];
  readonly id: string | null;
}

/**
 * Missão resolvida.
 *
 * ⚠️ `ok` é `false` também quando a missão era válida mas **nenhuma carga
 * alcança** — aí `solucoes` está vazio e `avisos` explica carga por carga. Por
 * isso `ok` aqui não é `true` literal: é a resposta completa, com ou sem
 * solução, e `solucoes.length` é o que separa os dois casos.
 */
export interface MissaoRespostaResolvida {
  readonly schema: string;
  readonly ok: boolean;
  readonly id: string | null;
  readonly ts: string;
  readonly alvoId: string | null;
  readonly geometria: GeometriaResposta;
  readonly azimute: AzimuteResposta;
  readonly vento: VentoResposta;
  readonly sistema: { readonly id: string; readonly nome: string; readonly calibre: number };
  /** Ordenadas por preferência doutrinária: a menor carga que alcança com folga. */
  readonly solucoes: readonly SolucaoCarga[];
  readonly seguranca: SegurancaResposta;
  readonly avisos: readonly string[];
  readonly motor: MotorResposta;
}

export type MissaoResposta = MissaoRespostaInvalida | MissaoRespostaResolvida;

/**
 * Normaliza qualquer um dos formatos de posição.
 *
 * @throws {TypeError} objeto ausente, lat/lon ou x/y inválidos, `tipo` desconhecido.
 * @throws {RangeError} terreno fora da base, ou terreno sem grade no config.
 * @throws {SyntaxError} grade ilegível.
 */
export function normalizarPosicao(pos: PosicaoPedido, rotulo?: string): PosicaoNormalizada;

/** Valida o pedido e devolve a lista de problemas. Vazia = ok. */
export function validarMissao(missao: MissaoPedido | null | undefined): string[];

/**
 * Decompõe o vento em longitudinal e travessal.
 *
 * `ventoDirecaoDeg` é a direção DE ONDE o vento vem (convenção METAR) — é a que
 * mais gente erra ao integrar.
 */
export function componentesVento(
  ventoVelocidadeMs: number,
  ventoDirecaoDeg: number,
  azimuteTiroDeg: number,
): ComponentesVento;

/**
 * Resolve uma missão de tiro completa.
 *
 * Roda TODAS as cargas pedidas e ordena por preferência doutrinária: **a menor
 * carga que alcança o alvo com folga** (menos dispersão absoluta, menos
 * desgaste do tubo, menos assinatura sonora).
 */
export function resolverMissao(missao: MissaoPedido): MissaoResposta;

/**
 * Adaptador HTTP: recebe o corpo já parseado, devolve `{ status, body }`.
 * 200 resolvida, 422 sem solução, 400 quando algo lançou.
 */
export function tratarRequisicao(corpo: unknown): {
  status: number;
  body: MissaoResposta;
};
