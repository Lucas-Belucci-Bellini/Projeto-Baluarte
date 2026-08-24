/**
 * Arsenal do Arma 3 — as armas medidas no config do jogo.
 *
 * O módulo é **gerado** (`scripts/arma3/gerar-base-armas.py`) a partir do dump
 * do jogo em execução. Por isso aqui há apenas a DECLARAÇÃO: converter
 * obrigaria o gerador a emitir TypeScript, para dado que é catálogo.
 *
 * ── Por que quase tudo é `| null` ───────────────────────────────────────────
 * Os campos nulos são o registro de **o que o config não informou** daquela
 * arma, e são a razão de a wiki omitir a linha em vez de imprimir "0". Zero é
 * uma medida; ausência não é. Trocar os `null` por `0` faria a ficha técnica
 * publicar arrasto zero e dano zero como se tivessem sido medidos.
 *
 * `airFriction` merece atenção: **negativo é arrasto**. Foguete e míssil trazem
 * valor POSITIVO porque seguem outro modelo de voo — é o que `dadosBalisticos()`
 * usa para recusar a arma em vez de desenhar uma bala que ganha velocidade.
 */

/** Um modo de disparo declarado no config. `rpm` é nulo quando não vem. */
export interface A3ArmaModo {
  readonly nome: string;
  readonly rpm: number | null;
  readonly dispersao: number;
  readonly auto: boolean;
  /** Tiros por rajada (1 = tiro a tiro). */
  readonly rajada: number;
}

/**
 * Uma arma do arsenal.
 *
 * `ehMod` só vem nas armas da base **remota** (`carregarArsenal()`); as 106 do
 * núcleo embutido não trazem o campo, e é por isso que ele é opcional.
 */
export interface A3Arma {
  readonly id: string;
  /** O classname no config. */
  readonly classe: string;
  readonly nome: string;
  /** Todos os nomes de exibição das variantes com os mesmos números. */
  readonly nomes: readonly string[];
  readonly tipo: string;
  /** Como o tipo foi determinado: `classe`, `config`, `descricao`… */
  readonly tipoFonte: string;
  readonly origem: string;
  readonly calibre: string | null;
  readonly calibreFonte: string | null;
  /** Velocidade de saída (m/s). */
  readonly v0: number | null;
  /** Negativo = arrasto. Positivo existe (foguete/míssil) e não é arrasto. */
  readonly airFriction: number | null;
  /** `false` marca explicitamente a arma fora do modelo balístico. */
  readonly balistico: boolean;
  readonly dano: number | null;
  readonly danoIndireto: number | null;
  readonly raioIndireto: number | null;
  readonly explosivo: boolean | null;
  readonly velTipica: number | null;
  readonly dispersao: number;
  readonly dispersaoMrad: number;
  readonly dispersaoCm100: number;
  readonly penetracao: number | null;
  readonly capacidade: number | null;
  readonly rpm: number;
  readonly zeroing: number;
  readonly massa: number;
  readonly municao: string | null;
  readonly modos: readonly A3ArmaModo[];
  readonly img: string | null;
  /** Por que a imagem falta, quando falta. */
  readonly imgAusente: string | null;
  readonly variantes: number;
  readonly miras: readonly string[];
  readonly acessorios: readonly string[];
  readonly fontePatch: string | null;
  readonly desc: string | null;
  readonly faccao: string | null;
  readonly obs: string | null;
  /** Só nas armas da base remota — as 106 do núcleo não trazem o campo. */
  readonly ehMod?: boolean;
}

/** Um recorte do arsenal por função (fuzil, DMR, lançador…). */
export interface A3ArmaTipo {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
}

/** A ficha de um calibre: em que classe de arma ele vive, e a ressalva. */
export interface A3ArmaCalibre {
  readonly classe: string;
  readonly nota: string;
}

/**
 * Procedência da extração — é o que sustenta "medido no config".
 *
 * `nucleo` são as armas embutidas neste módulo; `mods` as que só existem na
 * base remota. `armasCanonicas` é a soma, e `classesNoConfig` o total bruto
 * antes de agrupar variantes.
 */
export interface A3ArmMeta {
  /** O arquivo `.rpt` de onde a contagem saiu. */
  readonly dump: string;
  readonly classesNoConfig: number;
  readonly armasCanonicas: number;
  readonly nucleo: number;
  readonly mods: number;
  readonly nucleoComBalistica: number;
  readonly nucleoComIcone: number;
  readonly porTipo: Readonly<Record<string, number | undefined>>;
  readonly porEvidencia: Readonly<Record<string, number | undefined>>;
  /** De onde sai o arsenal completo, sob demanda. */
  readonly arsenalUrl: string;
}

/** As armas do núcleo, embutidas — o arsenal completo vem de `carregarArsenal()`. */
export const A3ARM: readonly A3Arma[];
export const A3ARM_TIPOS: readonly A3ArmaTipo[];
/** Indexado pelo rótulo normalizado do calibre ("5.56×45 mm"). */
export const A3ARM_CALIBRES: Readonly<Record<string, A3ArmaCalibre | undefined>>;
export const A3ARM_TOTAL: number;
export const A3ARM_META: A3ArmMeta;

/**
 * Arsenal completo (com os mods) sob demanda — ~1,9 MB cru, ~100 kB no fio.
 *
 * Uma requisição por sessão (a promessa fica em cache no módulo); um fracasso
 * **não** é cacheado, então a próxima chamada tenta de novo.
 *
 * ⚠️ Diferente de `carregarTerrenos()`, esta chamada extrai o campo `armas` do
 * envelope, então o que chega é o **array**. Se o JSON vier sem esse campo, ela
 * rejeita dizendo o que faltou, em vez de resolver `undefined` e estourar no
 * `.filter()` de quem chamou.
 */
export function carregarArsenal(): Promise<readonly A3Arma[]>;
