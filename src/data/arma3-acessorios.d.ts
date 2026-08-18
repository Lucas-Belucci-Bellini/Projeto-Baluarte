/**
 * Acessórios do Arma 3 — miras, silenciadores, apontadores e bipés.
 *
 * ⚠️ ARQUIVO GERADO. `A3ACC` é o **núcleo** embutido (211); o catálogo completo
 * (3.218) vem de `carregarAcessorios()`, sob demanda.
 *
 * ── A ampliação é o campo delicado deste arquivo ────────────────────────────
 * `ampliacaoRotulo` só existe quando o jogo **declara** "Magnification: Nx".
 * Quando não declara, o valor honesto é `null` e a tela mostra o FOV cru,
 * rotulado como FOV: calcular zoom a partir do FOV erraria em 159 das 215
 * ópticas que trazem os dois valores. `ampliacaoFonte` registra de onde o
 * número veio, para a tela poder dizer se é medido ou estimado.
 */

/** Campo de visão da óptica. `modos > 1` quando a mira tem zoom variável. */
export interface A3AccFov {
  readonly init: number;
  readonly min: number;
  readonly max: number;
  readonly modos: number;
}

export interface A3Acessorio {
  readonly id: string;
  readonly classe: string;
  readonly nome: string;
  /** `mira`, `silenciador`, `apontador`, `bipe`. */
  readonly tipo: string;
  readonly tipoFonte: string;
  readonly dlc: string;
  readonly dlcFonte: string;
  readonly descricao: string | null;
  readonly massa: number;
  readonly imagem: string;
  /** Número, faixa `[min, max]`, ou `null` quando o config não declara. */
  readonly ampliacao: number | readonly number[] | null;
  /** Só existe quando o jogo escreve "Magnification: Nx". */
  readonly ampliacaoRotulo: string | null;
  readonly ampliacaoFonte: string | null;
  readonly fov: A3AccFov | null;
  /** Coeficiente do silenciador. Nulo em todo o núcleo — o config não traz. */
  readonly coefSilenciador: number | null;
}

/** Procedência da extração dos acessórios. */
export interface A3AccMeta {
  readonly porTipo: Readonly<Record<string, number | undefined>>;
  readonly comAmpliacao: number;
  readonly semAmpliacao: number;
  readonly armasComSlot: number;
  readonly dbUrl: string;
}

/** Os acessórios do núcleo, embutidos. */
export const A3ACC: readonly A3Acessorio[];
export const A3ACC_META: A3AccMeta;
/** Quantos estão embutidos aqui (contra `A3ACC_TOTAL`, que é o config inteiro). */
export const A3ACC_NUCLEO: number;
export const A3ACC_TOTAL: number;

/**
 * A base remota, como o JSON a entrega.
 *
 * ⚠️ O loader é chamado **sem** `campo`, então o que chega é o envelope
 * inteiro — não o array de dentro. É a diferença para `carregarArsenal()`, que
 * extrai `armas` e devolve a lista direto. Declarar array aqui faria o `.filter()`
 * de quem chamasse estourar em `undefined`.
 */
export interface A3AccBase {
  readonly acessorios: readonly A3Acessorio[];
  /** Quais armas aceitam cada acessório, indexado pela classe do acessório. */
  readonly slots: Readonly<Record<string, unknown>>;
}

/**
 * Catálogo completo sob demanda. Uma requisição por sessão; fracasso não é
 * cacheado. Rejeita com `Error` legível quando a rede ou o JSON falham.
 */
export function carregarAcessorios(): Promise<A3AccBase>;
