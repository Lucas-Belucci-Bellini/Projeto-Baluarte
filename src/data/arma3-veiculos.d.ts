/**
 * Veículos do Arma 3, medidos no config.
 *
 * ⚠️ ARQUIVO GERADO. `A3VEI` é o **núcleo** embutido (874); o catálogo completo
 * (5.425) vem de `carregarVeiculos()`, sob demanda.
 *
 * ── Por que `blindagem` separa "menor" de "relativas" ───────────────────────
 * No config, armor **negativo** é blindagem RELATIVA ao casco (convenção do
 * engine, em 19.223 partes — quase todas rodas). Um `min()` sobre absolutas e
 * relativas juntas anunciaria "parte mais fraca: −100", que não significa nada.
 * Por isso `menor`/`menorParte` comparam só absolutas e `relativas` é contagem
 * à parte — e `menor` é `null` no veículo que não declara nenhuma absoluta.
 */

/** Blindagem por parte. `menor`/`maior` são absolutas; `relativas` é contagem. */
export interface A3VeiBlindagem {
  readonly partes: number;
  /** `null` quando o veículo não declara nenhuma blindagem absoluta. */
  readonly menor: number | null;
  readonly menorParte: string | null;
  readonly maior: number | null;
  /** Partes com armor negativo (proporcional ao casco). */
  readonly relativas: number;
}

export interface A3Veiculo {
  readonly id: string;
  readonly classe: string;
  readonly nome: string;
  readonly categoria: string;
  readonly categoriaFonte: string;
  readonly dlc: string;
  readonly dlcFonte: string;
  readonly lado: string;
  readonly faccao: string;
  readonly armor: number;
  readonly armorEstrutural: number;
  readonly blindagem: A3VeiBlindagem | null;
  /** km/h. */
  readonly maxSpeed: number;
  readonly potencia: number | null;
  readonly lotacao: number;
  readonly cargaMax: number | null;
  readonly combustivel: number | null;
  /** Custo que a IA usa para decidir emprego. */
  readonly custo: number;
  /** Quantos sistemas de arma. `null` quando o config não declara. */
  readonly armas: number | null;
  readonly imagem: string;
}

export interface A3VeiCategoria {
  readonly id: string;
  readonly icon: string;
  readonly nome: string;
  readonly desc: string;
}

export interface A3VeiMeta {
  readonly porCategoria: Readonly<Record<string, number | undefined>>;
  readonly comBlindagem: number;
  readonly faccoes: number;
  readonly dbUrl: string;
}

/** A base remota, como o JSON a entrega — o envelope, não o array. */
export interface A3VeiBase {
  readonly veiculos: readonly A3Veiculo[];
  readonly faccoes: Readonly<Record<string, unknown>>;
}

export const A3VEI: readonly A3Veiculo[];
export const A3VEI_CATEGORIAS: readonly A3VeiCategoria[];
export const A3VEI_META: A3VeiMeta;
export const A3VEI_NUCLEO: number;
export const A3VEI_TOTAL: number;

/** Catálogo completo sob demanda. Devolve o envelope; ver `A3VeiBase`. */
export function carregarVeiculos(): Promise<A3VeiBase>;
