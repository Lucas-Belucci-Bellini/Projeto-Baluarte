/**
 * As fontes que alimentam a análise, e o que os números delas SIGNIFICAM.
 *
 * O motor em `analise-serie.js` é agnóstico de propósito: ele diz "alta",
 * "baixa" ou "lateral" para qualquer série. É isso que permite três domínios
 * muito diferentes — economia, saúde do próprio ecossistema e comunidade —
 * usarem o mesmo cérebro em vez de três cópias que divergem com o tempo.
 *
 * ## O problema que só aparece quando os três convivem
 *
 * Bitcoin subindo é uma coisa. **Tamanho de bundle subindo é outra.** Rota
 * quebrada subindo é outra ainda. A matemática devolve "alta" nos três casos,
 * e ela está certa nos três — mas se ninguém declarar o que "alta" quer dizer
 * ali, o relatório vai anunciar bundle inchando como boa notícia.
 *
 * Daí a separação central deste arquivo:
 *
 *     direção é MATEMÁTICA   →  analise-serie.js
 *     significado é DECLARAÇÃO →  a polaridade da fonte, aqui
 *
 * Nenhuma das duas adivinha a outra. Uma fonte nova sem polaridade declarada
 * não é interpretada — fica com o veredito `indefinido`, em vez de herdar um
 * palpite.
 *
 * Zero DOM, zero rede. Quem busca de fato mora na borda; aqui é só o mapa do
 * que existe e do que cada número quer dizer.
 */

import { RISCO, TENDENCIA, analisar } from './analise-serie.js';

/** Para onde o número aponta quando sobe. */
export const POLARIDADE = {
  /** subir é bom: preço de um ativo que se detém, jogadores online */
  MAIOR_MELHOR: 'maior-melhor',
  /** subir é ruim: tamanho de bundle, taxa de erro, tempo de build */
  MENOR_MELHOR: 'menor-melhor',
  /** subir não é bom nem ruim, só é: câmbio que se observa, temperatura */
  NEUTRO: 'neutro'
};

export const DOMINIO = {
  ECONOMIA: 'economia',
  ECOSSISTEMA: 'ecossistema',
  COMUNIDADE: 'comunidade'
};

/** O intervalo do coletor. Uma constante porque aparece em conta e em texto. */
export const INTERVALO_HORAS = 2.5;

/**
 * Uma fonte declarada.
 *
 * `limites` é sanidade, não regra de negócio: valor fora dali quase sempre é a
 * API devolvendo lixo (0, -1, null virando 0), e engolir isso contamina a
 * média por 200 amostras. Descartar e CONTAR é melhor que suavizar.
 */
export class Fonte {
  constructor({ id, nome, dominio, unidade, polaridade, limites = null,
                intervaloHoras = INTERVALO_HORAS, sobre = '' }) {
    this.id = id;
    this.nome = nome;
    this.dominio = dominio;
    this.unidade = unidade;
    this.polaridade = polaridade;
    this.limites = limites;            // [min, max] plausível, ou null
    this.intervaloHoras = intervaloHoras;
    this.sobre = sobre;
  }

  /** O valor é plausível para esta fonte? */
  aceita(v) {
    if (!Number.isFinite(v)) return false;
    if (!this.limites) return true;
    const [min, max] = this.limites;
    return v >= min && v <= max;
  }
}

/**
 * O catálogo. Três domínios, um cérebro.
 *
 * Os ids são estáveis de propósito — eles viram chave de armazenamento, e
 * renomear um id perde a série histórica dele.
 */
export const FONTES = [
  // ── economia ────────────────────────────────────────────────────────────
  new Fonte({
    id: 'btc-usd', nome: 'Bitcoin (USD)', dominio: DOMINIO.ECONOMIA,
    unidade: 'USD', polaridade: POLARIDADE.NEUTRO,
    limites: [100, 10_000_000],
    sobre: 'observado, não recomendado — o Baluarte não dá conselho financeiro'
  }),
  new Fonte({
    id: 'usd-brl', nome: 'Dólar (BRL)', dominio: DOMINIO.ECONOMIA,
    unidade: 'BRL', polaridade: POLARIDADE.NEUTRO,
    limites: [0.5, 100]
  }),

  // ── saúde do próprio ecossistema ────────────────────────────────────────
  new Fonte({
    id: 'bundle-kb', nome: 'Peso do bundle', dominio: DOMINIO.ECOSSISTEMA,
    unidade: 'kB', polaridade: POLARIDADE.MENOR_MELHOR,
    limites: [0, 100_000],
    sobre: 'crescer aqui é regressão, não crescimento'
  }),
  new Fonte({
    id: 'rotas-quebradas', nome: 'Rotas quebradas', dominio: DOMINIO.ECOSSISTEMA,
    unidade: 'rotas', polaridade: POLARIDADE.MENOR_MELHOR,
    limites: [0, 1000]
  }),
  new Fonte({
    id: 'testes-passando', nome: 'Testes passando', dominio: DOMINIO.ECOSSISTEMA,
    unidade: 'testes', polaridade: POLARIDADE.MAIOR_MELHOR,
    limites: [0, 100_000]
  }),
  new Fonte({
    id: 'ci-minutos', nome: 'Duração do CI', dominio: DOMINIO.ECOSSISTEMA,
    unidade: 'min', polaridade: POLARIDADE.MENOR_MELHOR,
    limites: [0, 600]
  }),

  // ── comunidade ──────────────────────────────────────────────────────────
  new Fonte({
    id: 'jogadores-online', nome: 'Jogadores online', dominio: DOMINIO.COMUNIDADE,
    unidade: 'jogadores', polaridade: POLARIDADE.MAIOR_MELHOR,
    limites: [0, 10_000_000]
  }),
  new Fonte({
    id: 'servidores-ativos', nome: 'Servidores ativos', dominio: DOMINIO.COMUNIDADE,
    unidade: 'servidores', polaridade: POLARIDADE.MAIOR_MELHOR,
    limites: [0, 1_000_000]
  })
];

export const POR_ID = Object.fromEntries(FONTES.map((f) => [f.id, f]));

export function fontesDo(dominio) {
  return FONTES.filter((f) => f.dominio === dominio);
}

/** Veredito depois de cruzar direção com significado. */
export const VEREDITO = {
  MELHORANDO: 'melhorando',
  PIORANDO: 'piorando',
  ESTAVEL: 'estavel',
  OBSERVANDO: 'observando',      // neutro: move, mas não é bom nem ruim
  INDEFINIDO: 'indefinido'       // não há base para dizer nada
};

/**
 * Cruza a tendência (matemática) com a polaridade (declaração).
 *
 * `INDEFINIDO` quando falta dado ou quando a fonte não declara polaridade —
 * inventar significado é pior que não ter, porque um veredito errado parece
 * tão confiável quanto um certo.
 */
export function interpretar(direcao, polaridade) {
  if (direcao === TENDENCIA.INDEFINIDA || !polaridade) return VEREDITO.INDEFINIDO;
  if (direcao === TENDENCIA.LATERAL) return VEREDITO.ESTAVEL;
  if (polaridade === POLARIDADE.NEUTRO) return VEREDITO.OBSERVANDO;

  const sobe = direcao === TENDENCIA.ALTA;
  const bomSubir = polaridade === POLARIDADE.MAIOR_MELHOR;
  return sobe === bomSubir ? VEREDITO.MELHORANDO : VEREDITO.PIORANDO;
}

/**
 * Analisa uma série JÁ no contexto da fonte dela.
 *
 * Devolve o relatório do motor mais a leitura: o veredito, e uma frase que diz
 * o que foi visto SEM afirmar mais do que os dados sustentam. Quando falta
 * histórico, a frase diz isso em vez de escolher uma direção.
 */
export function analisarFonte(fonte, serie, opc = {}) {
  const f = fonte instanceof Fonte ? fonte : POR_ID[fonte];
  if (!f) {
    return { erro: `fonte desconhecida: ${fonte}`, veredito: VEREDITO.INDEFINIDO };
  }

  const bruta = Array.isArray(serie) ? serie : [];
  const validas = bruta.filter((v) => f.aceita(v));
  const rejeitadas = bruta.length - validas.length;

  const a = analisar(validas, { intervaloHoras: f.intervaloHoras, ...opc });
  const veredito = interpretar(a.tendencia, f.polaridade);

  return {
    fonte: { id: f.id, nome: f.nome, dominio: f.dominio, unidade: f.unidade,
             polaridade: f.polaridade },
    ...a,
    /** quantas amostras a própria fonte rejeitou por implausíveis */
    rejeitadas,
    veredito,
    resumo: frase(f, a, veredito)
  };
}

function frase(f, a, veredito) {
  if (a.amostras === 0) return `${f.nome}: nenhuma amostra válida ainda.`;

  const valor = `${arredondar(a.atual)} ${f.unidade}`;
  if (veredito === VEREDITO.INDEFINIDO) {
    const falta = a.faltam[0] || 'histórico';
    return `${f.nome}: ${valor} agora. Sem base para afirmar direção — falta ${falta}.`;
  }

  const como = {
    [VEREDITO.MELHORANDO]: 'melhorando',
    [VEREDITO.PIORANDO]: 'piorando',
    [VEREDITO.ESTAVEL]: 'estável',
    [VEREDITO.OBSERVANDO]: a.tendencia === TENDENCIA.ALTA ? 'subindo' : 'descendo'
  }[veredito];

  const r = a.risco.nivel === RISCO.ALTO || a.risco.nivel === RISCO.MEDIO
    ? ` Atenção: ${a.risco.motivos.join('; ')}.`
    : '';
  const janela = a.medias.janelaHoras.curto
    ? ` (janela curta = ${a.medias.janelaHoras.curto} h)` : '';

  return `${f.nome}: ${valor}, ${como}${janela}.${r}`;
}

function arredondar(v) {
  if (!Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toFixed(0);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(4);
}

/**
 * O panorama: todas as fontes com série, agrupadas por domínio.
 *
 * `series` é `{idDaFonte: [números]}`. Fonte sem série não é erro — é fonte
 * que o coletor ainda não alcançou, e ela aparece como tal.
 */
export function panorama(series = {}) {
  const por = {};
  const atencao = [];

  for (const f of FONTES) {
    const s = series[f.id];
    const r = analisarFonte(f, s || []);
    (por[f.dominio] ||= []).push(r);
    if (r.veredito === VEREDITO.PIORANDO) atencao.push(r);
  }

  // o que piora primeiro, e entre esses o de maior risco
  atencao.sort((a, b) => (b.risco?.pontos || 0) - (a.risco?.pontos || 0));

  return {
    intervaloHoras: INTERVALO_HORAS,
    dominios: por,
    /** o que o operador deveria olhar, em ordem */
    atencao,
    fontesComDado: FONTES.filter((f) => (series[f.id] || []).length > 0).length,
    fontesTotais: FONTES.length
  };
}
