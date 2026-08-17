/**
 * O índice unificado da Wiki de Arma 3.
 *
 * O conteúdo NÃO mora aqui: o módulo **deriva** os artigos dos data files que já
 * existem (`arma3-vanilla`, `arma3-tutoriais`, `arma3-colecao`, as bases
 * extraídas do config…). Escrever conteúdo novo é editar a fonte; a wiki
 * reflete sozinha.
 *
 * ── Por que declaração, e não conversão ─────────────────────────────────────
 * `construir()` monta ~600 linhas de derivação sobre catálogos gerados. A
 * fronteira de consumo é o que a página precisa ter tipada; converter a
 * derivação inteira arrastaria os catálogos junto, que são gerados e não devem
 * emitir TypeScript.
 *
 * ── Sobre os campos opcionais do artigo ─────────────────────────────────────
 * Quase tudo é opcional de propósito. Um artigo vindo de um mod tem `autor` e
 * `wid`; um comando de console tem `sqf` e nenhum dos dois; uma arma tem `arma`
 * e nenhum dos outros blocos técnicos. Declarar tudo obrigatório obrigaria a
 * inventar valores vazios — e a infobox existe justamente para **omitir a linha
 * ausente** em vez de imprimir "0" ou "—".
 */

import type { A3ColInfo } from './arma3-colecao.js';

/** Nível de leitura — a trilha iniciante ↔ veterano. */
export interface WikiNivel {
  readonly id: number;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
}

/** Um portal: o recorte temático de primeiro nível da wiki. */
export interface WikiPortal {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly cor: string;
  readonly desc: string;
}

/** Uma categoria dentro de um portal. */
export interface WikiCategoria {
  readonly id: string;
  readonly nome: string;
  readonly icon?: string;
}

/** Par tecla → ação, exibido em `<kbd>`. */
export type WikiAtalho = readonly [tecla: string, acao: string];

/** Elo do artigo: interno (`#/rota`) ou externo (Workshop, Steam…). */
export interface WikiLink {
  readonly rotulo: string;
  readonly url: string;
}

/**
 * Ficha técnica de arma — só o que o config informou.
 *
 * Campo ausente **some** da infobox em vez de virar "0": zero é uma medida, e
 * publicá-la no lugar de "não declarado" seria inventar dado.
 */
export interface WikiFichaArma {
  readonly classe: string;
  readonly calibre?: string;
  readonly v0?: number;
  readonly airFriction?: number;
  readonly dispersaoCm100?: number;
  readonly dispersaoMrad?: number;
  readonly dano?: number;
  readonly rpm?: number;
  readonly capacidade?: number;
  readonly zeroing?: number;
  readonly massa?: number;
  readonly municao?: string;
  readonly miras?: readonly string[];
  readonly acessorios?: readonly string[];
  readonly variantes?: number;
}

/**
 * Ficha de mira/acessório.
 *
 * `ampliacaoRotulo` só existe quando o jogo **declara** "Magnification: Nx". Sem
 * ele a página mostra o FOV cru, rotulado como FOV — calcular zoom a partir do
 * FOV erraria em 159 das 215 ópticas que trazem os dois valores.
 */
export interface WikiFichaAcessorio {
  readonly classe: string;
  readonly tipo?: string;
  readonly ampliacaoRotulo?: string;
  readonly fov?: {
    readonly init?: number;
    readonly min?: number;
    readonly max?: number;
    readonly modos?: number;
  };
  readonly coefSilenciador?: number;
  readonly massa?: number;
  readonly dlc?: string;
}

/**
 * Ficha de veículo.
 *
 * `blindagem.menor` compara só blindagem **absoluta**. No config, armor negativo
 * é blindagem RELATIVA ao casco (convenção do engine, em 19.223 partes — quase
 * todas rodas); misturar as duas anunciaria "parte mais fraca: −100", que não
 * significa nada. Por isso `relativas` é contagem à parte.
 */
export interface WikiFichaVeiculo {
  readonly classe: string;
  readonly categoria?: string;
  readonly lado?: string;
  readonly faccao?: string;
  readonly armor?: number;
  readonly armorEstrutural?: number;
  readonly blindagem?: {
    readonly menor?: number;
    readonly menorParte?: string;
    readonly partes?: number;
    readonly relativas?: number;
  };
  readonly maxSpeed?: number;
  readonly potencia?: number;
  readonly lotacao?: number;
  readonly cargaMax?: number;
  readonly combustivel?: number;
  readonly armas?: number;
  readonly custo?: number;
  readonly dlc?: string;
}

/**
 * Ficha de equipamento.
 *
 * `protecao.passagem` é o `passThrough`: a fração do dano que atravessa a placa
 * MESMO no ponto coberto. Publicar só "proteção 25" sugeriria imunidade; o par
 * (proteção, passagem) é o que descreve a peça.
 */
export interface WikiFichaEquipamento {
  readonly classe: string;
  readonly tipo?: string;
  readonly protecao?: {
    readonly maior?: number;
    readonly maiorParte?: string;
    readonly cobertas?: number;
    readonly partes?: number;
    readonly passagem?: number;
  };
  readonly capacidade?: number;
  readonly containerClass?: string;
  readonly massa?: number;
  readonly variantes?: number;
  readonly dlc?: string;
}

/**
 * Ficha de soldado.
 *
 * `lado` é opcional porque 83 das 248 facções usam `side: 7` (sideUnknown). A
 * ficha prefere a linha ausente a chutar BLUFOR por o soldado "parecer"
 * ocidental.
 */
export interface WikiFichaSoldado {
  readonly classe: string;
  readonly faccao?: string;
  readonly lado?: string;
  readonly armas?: readonly string[];
  readonly nCarregadores?: number;
  readonly nGranadas?: number;
  readonly uniforme?: string;
  readonly mochila?: string;
  readonly nItens?: number;
  readonly variantes?: number;
  readonly dlc?: string;
}

/**
 * Ficha de terreno.
 *
 * `grade.passoY` negativo é o normal no vanilla (northing de cima para baixo) —
 * a ficha diz qual é, em vez de deixar o leitor supor.
 */
export interface WikiFichaTerreno {
  readonly classe: string;
  readonly tamanhoM?: number;
  readonly areaKm2?: number;
  readonly localidades?: number;
  readonly aeroportos?: number;
  readonly grade?: { readonly passoX: number; readonly passoY: number };
  readonly latitude?: number;
  readonly longitude?: number;
  readonly autor?: string;
  readonly dlc?: string;
}

/** O que o artigo é — governa o rótulo "Tipo" da infobox. */
export type WikiTipo =
  | 'mod' | 'item' | 'guia' | 'comando' | 'campanha' | 'arquivo'
  | 'arma' | 'acessorio' | 'terreno' | 'veiculo' | 'equipamento' | 'soldado';

/**
 * Um artigo da wiki.
 *
 * No máximo **uma** das fichas técnicas está presente, conforme o `tipo` — a
 * página as espalha em sequência (`...(art.arma ? ficha… : [])`) justamente
 * porque só uma responde.
 */
export interface WikiArtigo {
  readonly id: string;
  readonly titulo: string;
  readonly portal: string;
  readonly cat: string;
  readonly catNome: string;
  readonly nivel: number;
  readonly tipo: WikiTipo;
  readonly resumo?: string;
  readonly corpo?: string;
  readonly icon?: string;
  readonly img?: string;
  readonly autor?: string;
  readonly tam?: string;
  /** ID do item no Steam Workshop, quando o artigo vem de um mod. */
  readonly wid?: string;
  readonly deps: readonly string[];
  readonly dlcs?: readonly string[];
  readonly tags?: readonly string[];
  readonly links?: readonly WikiLink[];
  readonly noPreset?: boolean;
  readonly naColecao?: boolean;
  readonly temTutorial?: boolean;
  readonly atalhos?: readonly WikiAtalho[];
  readonly dicas?: readonly string[];
  /** Comando pronto para colar no console (portal Console). */
  readonly sqf?: string;
  /** Guia original do autor, em inglês, direto do Workshop. */
  readonly guia?: string;
  readonly arma?: WikiFichaArma;
  readonly acessorio?: WikiFichaAcessorio;
  readonly terreno?: WikiFichaTerreno;
  readonly veiculo?: WikiFichaVeiculo;
  readonly equipamento?: WikiFichaEquipamento;
  readonly soldado?: WikiFichaSoldado;
}

/** Filtros da busca. Todos opcionais: ausente significa "não filtra". */
export interface WikiFiltro {
  readonly portal?: string;
  readonly cat?: string;
  /** `0` significa "todos os níveis" — não "nível zero". */
  readonly nivel?: number;
}

export const WIKI_NIVEIS: readonly WikiNivel[];
export const WIKI_PORTAIS: readonly WikiPortal[];
export const WIKI_ARTIGOS: readonly WikiArtigo[];
export const WIKI_POR_ID: Readonly<Record<string, WikiArtigo | undefined>>;
export const WIKI_TOTAL: number;
/** Quantos artigos por portal, indexado pelo `id` do portal. */
export const WIKI_CONTAGEM: Readonly<Record<string, number | undefined>>;

/** Reexportado de `arma3-colecao.js` — a coleção oficial na Steam. */
export const A3COL_INFO: A3ColInfo;

/** As categorias de um portal. Portal vazio (`''`) devolve as de todos. */
export function catsDoPortal(portalId: string): readonly WikiCategoria[];

/** Artigos vizinhos, para o "Veja também". */
export function relacionados(art: WikiArtigo, limite?: number): readonly WikiArtigo[];

/** Busca por termo, com filtros. Termo vazio devolve o recorte dos filtros. */
export function buscar(termo: string, filtro?: WikiFiltro): readonly WikiArtigo[];
