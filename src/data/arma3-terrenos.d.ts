/**
 * Terrenos do Arma 3 — a grade REAL do config de cada mundo.
 *
 * O módulo é **gerado** (`scripts/arma3/gerar-base-terrenos.py`) e o cabeçalho
 * do `.js` diz "não edite à mão". Por isso aqui há apenas a DECLARAÇÃO:
 * converter obrigaria o gerador a emitir TypeScript, para dado que é catálogo.
 *
 * ── O que os tipos preservam ────────────────────────────────────────────────
 * `tamanhoM` e `areaKm2` são `number | null` porque **4 dos 31 mundos não
 * declaram `mapSize`**. Nulo aqui não é buraco de dado: é o motivo de
 * `dentroDoMundo()` devolver `null` em vez de `false`. Trocar por `number` e
 * "0 quando não sabe" faria o ponto cair fora de um mundo de tamanho zero.
 *
 * `capitais` e `localidadesPorTipo` são nulos pelo mesmo motivo — mundo sem
 * cidade nomeada (VR, Desert) não tem lista vazia, tem ausência.
 *
 * A forma da `grade` vem de `utils/arma3-grade.js`, que é quem faz a conversão.
 */

import type { GradeMundo } from '../utils/arma3-grade.js';

/**
 * Um mundo do jogo, do config dele.
 *
 * `passoY` negativo na `grade` é o normal (northing do norte para baixo) — ver
 * `arma3-grade.d.ts`.
 */
export interface A3Terreno {
  readonly id: string;
  /** O classname do mundo no config. */
  readonly classe: string;
  readonly nome: string;
  readonly autor: string;
  readonly dlc: string;
  /** Como a DLC foi determinada: `tabela`, `mod` ou `caminho`. */
  readonly dlcFonte: string;
  /** `null` nos 4 mundos que não declaram `mapSize`. */
  readonly tamanhoM: number | null;
  readonly areaKm2: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly grade: GradeMundo;
  readonly localidades: number;
  /** Contagem por tipo de local. `null` no mundo sem localidade nomeada. */
  readonly localidadesPorTipo: Readonly<Record<string, number>> | null;
  readonly capitais: readonly string[] | null;
  readonly aeroportos: number;
  readonly ehMod: boolean;
}

/** Procedência da extração dos terrenos. */
export interface A3TerMeta {
  readonly oficiais: number;
  readonly mods: number;
  readonly comGrade: number;
  /** De onde sai a base de localidades, sob demanda. */
  readonly dbUrl: string;
}

/** Um local nomeado dentro de um mundo. `nome` é nulo em marcador sem rótulo. */
export interface A3TerLocalidade {
  readonly nome: string | null;
  readonly tipo: string;
  readonly x: number;
  readonly y: number;
  readonly raioA: number;
  readonly raioB: number;
}

/** O que a base remota traz de cada mundo, indexado pelo `id` do terreno. */
export interface A3TerDetalhe {
  readonly classe: string;
  readonly localidades: readonly A3TerLocalidade[];
  readonly aeroportos: readonly unknown[];
}

/**
 * A base de localidades, como o JSON remoto a entrega.
 *
 * ⚠️ `carregarTerrenos()` é chamado **sem** `campo`, então o que chega é o
 * envelope inteiro — não o array de dentro. É a diferença para
 * `carregarArsenal()`, que extrai `armas`.
 */
export interface A3TerBase {
  readonly terrenos: Readonly<Record<string, A3TerDetalhe | undefined>>;
}

export const A3TER: readonly A3Terreno[];
export const A3TER_META: A3TerMeta;
export const A3TER_TOTAL: number;

/**
 * Base de localidades sob demanda. Uma requisição por sessão (a promessa fica
 * em cache no módulo); um fracasso **não** é cacheado, então a próxima chamada
 * tenta de novo.
 *
 * Rejeita com `Error` legível quando a rede falha, o JSON é inválido ou o
 * servidor responde não-2xx.
 */
export function carregarTerrenos(): Promise<A3TerBase>;
