/**
 * Análise de série temporal — o núcleo de decisão (#405, stock-analyzer-bot).
 *
 * Portado de `server/indicators.ts` do `stock-analyzer-bot`, que é TypeScript
 * e não atravessa a regra do Baluarte. Mas o nome de lá engana o escopo: SMA,
 * EMA, RSI, MACD e Bollinger não são operadores **financeiros** — são
 * operadores de **série temporal**. Tendência, momento, volatilidade, reversão
 * à média. Servem para qualquer número que chegue periodicamente: preço,
 * jogadores online, gasto de token, temperatura, taxa de erro.
 *
 * Zero DOM, zero dependência — roda no navegador, no Node e numa função
 * serverless, igual ao motor do Vanguard.
 *
 * ## O intervalo faz parte da resposta
 *
 * Um período é sempre "N amostras", nunca "N horas". Com coleta a cada 2h30,
 * `rsi14` cobre 35 horas e `sma200` cobre 21 dias. Quem lê "RSI 72" sem saber
 * disso acha que está vendo o agora, e está vendo dia e meio. Por isso
 * `analisar()` recebe o intervalo e devolve a janela de cada indicador em
 * horas — o número sem a escala é meia informação.
 *
 * ## Ausência não é valor
 *
 * Todo indicador devolve `null` quando não há amostra suficiente, nunca um
 * número plausível. E `tendencia` distingue `indefinida` (falta dado) de
 * `lateral` (há dado e ele não aponta para lado nenhum) — as duas coisas
 * pareciam a mesma no original, e a diferença é justamente o que decide se
 * dá para agir.
 *
 * ## Dois defeitos que vieram do original e NÃO foram portados
 *
 * 1. **O histograma do MACD era sempre zero.** A linha de sinal estava
 *    marcada como `Placeholder` e recebia o próprio MACD, então
 *    `histograma = macd - macd`. O histograma é o sinal do MACD; zerado, o
 *    indicador vira enfeite que parece funcionar. Aqui a linha de sinal é a
 *    EMA de verdade sobre a série do MACD.
 * 2. **`determineTrend` devolvia "Sideways" por falta de dado.** Ver acima.
 */

/** Média móvel simples das últimas `periodo` amostras. */
export function sma(serie, periodo) {
  if (!Array.isArray(serie) || !(periodo >= 1) || serie.length < periodo) return null;
  const janela = serie.slice(-periodo);
  let soma = 0;
  for (const v of janela) {
    if (!Number.isFinite(v)) return null;
    soma += v;
  }
  return soma / periodo;
}

/**
 * Média móvel exponencial. Semente = SMA das primeiras `periodo` amostras,
 * que é a convenção usual e evita o viés de começar do primeiro valor.
 */
export function ema(serie, periodo) {
  if (!Array.isArray(serie) || !(periodo >= 1) || serie.length < periodo) return null;
  if (serie.some((v) => !Number.isFinite(v))) return null;

  const k = 2 / (periodo + 1);
  let v = serie.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;
  for (let i = periodo; i < serie.length; i += 1) v = serie[i] * k + v * (1 - k);
  return v;
}

/** A série inteira de EMA, alinhada ao índice original (`null` antes da semente). */
export function emaSerie(serie, periodo) {
  if (!Array.isArray(serie) || !(periodo >= 1) || serie.length < periodo) return [];
  if (serie.some((v) => !Number.isFinite(v))) return [];

  const k = 2 / (periodo + 1);
  const fora = new Array(serie.length).fill(null);
  let v = serie.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;
  fora[periodo - 1] = v;
  for (let i = periodo; i < serie.length; i += 1) {
    v = serie[i] * k + v * (1 - k);
    fora[i] = v;
  }
  return fora;
}

/**
 * Índice de força relativa, 0..100. Suavização de Wilder.
 *
 * Sem queda nenhuma o resultado é 100 por definição (não há divisão por zero
 * a proteger — é o limite, não um caso especial).
 */
export function rsi(serie, periodo = 14) {
  if (!Array.isArray(serie) || !(periodo >= 1) || serie.length < periodo + 1) return null;
  if (serie.some((v) => !Number.isFinite(v))) return null;

  let ganho = 0;
  let perda = 0;
  for (let i = 1; i <= periodo; i += 1) {
    const d = serie[i] - serie[i - 1];
    if (d > 0) ganho += d; else perda += Math.abs(d);
  }
  let mediaGanho = ganho / periodo;
  let mediaPerda = perda / periodo;

  for (let i = periodo + 1; i < serie.length; i += 1) {
    const d = serie[i] - serie[i - 1];
    if (d > 0) {
      mediaGanho = (mediaGanho * (periodo - 1) + d) / periodo;
      mediaPerda = (mediaPerda * (periodo - 1)) / periodo;
    } else {
      mediaGanho = (mediaGanho * (periodo - 1)) / periodo;
      mediaPerda = (mediaPerda * (periodo - 1) + Math.abs(d)) / periodo;
    }
  }

  if (mediaPerda === 0) return mediaGanho === 0 ? 50 : 100;
  const rs = mediaGanho / mediaPerda;
  return 100 - 100 / (1 + rs);
}

/**
 * MACD com linha de sinal DE VERDADE.
 *
 * O original marcava a linha de sinal como `Placeholder` e a igualava ao
 * próprio MACD, o que fazia o histograma ser sempre zero. Aqui o MACD é
 * calculado ponto a ponto e a linha de sinal é a EMA sobre essa série — que é
 * o que o indicador é.
 */
export function macd(serie, rapido = 12, lento = 26, sinal = 9) {
  const vazio = { linha: null, sinal: null, histograma: null };
  if (!Array.isArray(serie) || serie.length < lento + sinal) return vazio;

  const eRapido = emaSerie(serie, rapido);
  const eLento = emaSerie(serie, lento);
  if (!eRapido.length || !eLento.length) return vazio;

  const linhas = [];
  for (let i = 0; i < serie.length; i += 1) {
    if (eRapido[i] === null || eLento[i] === null) continue;
    linhas.push(eRapido[i] - eLento[i]);
  }
  if (linhas.length < sinal) return vazio;

  const linha = linhas.at(-1);
  const s = ema(linhas, sinal);
  if (s === null) return vazio;
  return { linha, sinal: s, histograma: linha - s };
}

/** Desvio padrão populacional das últimas `periodo` amostras. */
export function desvio(serie, periodo) {
  const m = sma(serie, periodo);
  if (m === null) return null;
  const janela = serie.slice(-periodo);
  const soma = janela.reduce((a, v) => a + (v - m) ** 2, 0);
  return Math.sqrt(soma / periodo);
}

/** Bandas de Bollinger: média ± k desvios. */
export function bollinger(serie, periodo = 20, k = 2) {
  const meio = sma(serie, periodo);
  const d = desvio(serie, periodo);
  if (meio === null || d === null) return { superior: null, meio: null, inferior: null };
  return { superior: meio + k * d, meio, inferior: meio - k * d };
}

/**
 * Volatilidade relativa: desvio das variações percentuais entre amostras.
 * Relativa de propósito — assim 5% é 5% tanto num número de 10 quanto de 10.000.
 */
export function volatilidade(serie, periodo = 20) {
  if (!Array.isArray(serie) || serie.length < periodo + 1) return null;
  const janela = serie.slice(-(periodo + 1));
  const variacoes = [];
  for (let i = 1; i < janela.length; i += 1) {
    const base = janela[i - 1];
    if (!Number.isFinite(base) || base === 0) return null;
    variacoes.push((janela[i] - base) / Math.abs(base));
  }
  const m = variacoes.reduce((a, b) => a + b, 0) / variacoes.length;
  const v = variacoes.reduce((a, x) => a + (x - m) ** 2, 0) / variacoes.length;
  return Math.sqrt(v);
}

export const TENDENCIA = {
  ALTA: 'alta',
  BAIXA: 'baixa',
  LATERAL: 'lateral',
  INDEFINIDA: 'indefinida'
};

/**
 * Direção pela ordem das médias.
 *
 * `INDEFINIDA` quando falta média — e isso NÃO é `LATERAL`. O original
 * devolvia "Sideways" nos dois casos, então "ainda não tenho 21 dias de
 * coleta" saía com a mesma cara de "medi e não há direção". Só um dos dois
 * autoriza agir.
 */
export function tendencia(curto, medio, longo, atual) {
  const faltando = [curto, medio, longo, atual].some((v) => !Number.isFinite(v));
  if (faltando) return TENDENCIA.INDEFINIDA;
  if (atual > curto && curto > medio && medio > longo) return TENDENCIA.ALTA;
  if (atual < curto && curto < medio && medio < longo) return TENDENCIA.BAIXA;
  return TENDENCIA.LATERAL;
}

export const RISCO = { BAIXO: 'baixo', MEDIO: 'medio', ALTO: 'alto', INDEFINIDO: 'indefinido' };

/**
 * Risco por acúmulo de sinais extremos. Devolve o nível E os motivos —
 * um rótulo sem a evidência não dá para conferir nem para contestar.
 */
export function risco({ rsi: r, superior, inferior, atual, vol }) {
  const motivos = [];
  let pontos = 0;
  let olhou = 0;

  if (Number.isFinite(r)) {
    olhou += 1;
    if (r > 80 || r < 20) { pontos += 4; motivos.push(`RSI em extremo (${r.toFixed(1)})`); }
    else if (r > 70 || r < 30) { pontos += 2; motivos.push(`RSI esticado (${r.toFixed(1)})`); }
  }
  if (Number.isFinite(superior) && Number.isFinite(inferior) && Number.isFinite(atual)) {
    olhou += 1;
    if (atual >= superior) { pontos += 2; motivos.push('acima da banda superior'); }
    else if (atual <= inferior) { pontos += 2; motivos.push('abaixo da banda inferior'); }
  }
  if (Number.isFinite(vol)) {
    olhou += 1;
    if (vol > 0.10) { pontos += 4; motivos.push(`volatilidade alta (${(vol * 100).toFixed(1)}%)`); }
    else if (vol > 0.05) { pontos += 2; motivos.push(`volatilidade elevada (${(vol * 100).toFixed(1)}%)`); }
  }

  if (!olhou) return { nivel: RISCO.INDEFINIDO, pontos: 0, motivos: ['sem dado suficiente'] };
  if (pontos >= 5) return { nivel: RISCO.ALTO, pontos, motivos };
  if (pontos >= 2) return { nivel: RISCO.MEDIO, pontos, motivos };
  return { nivel: RISCO.BAIXO, pontos, motivos: motivos.length ? motivos : ['nenhum sinal extremo'] };
}

/** Períodos padrão. Nomeados por papel, não por número. */
export const PERIODOS = { curto: 20, medio: 50, longo: 200, rsi: 14, bollinger: 20 };

/**
 * O relatório completo de uma série.
 *
 * `intervaloHoras` é o espaçamento entre amostras (2.5 no caso do coletor).
 * Ele não muda conta nenhuma — muda a LEITURA, e por isso viaja junto: cada
 * indicador reporta quantas horas a janela dele cobre.
 */
export function analisar(serie, { intervaloHoras = null, periodos = {} } = {}) {
  const p = { ...PERIODOS, ...periodos };
  const limpa = Array.isArray(serie) ? serie.filter((v) => Number.isFinite(v)) : [];
  const descartadas = (Array.isArray(serie) ? serie.length : 0) - limpa.length;
  const atual = limpa.length ? limpa.at(-1) : null;

  const janela = (n) => (Number.isFinite(intervaloHoras) ? n * intervaloHoras : null);

  const mCurto = sma(limpa, p.curto);
  const mMedio = sma(limpa, p.medio);
  const mLongo = sma(limpa, p.longo);
  const bb = bollinger(limpa, p.bollinger);
  const r = rsi(limpa, p.rsi);
  const vol = volatilidade(limpa, p.bollinger);
  const md = macd(limpa);

  const dir = tendencia(mCurto, mMedio, mLongo, atual);
  const rk = risco({ rsi: r, superior: bb.superior, inferior: bb.inferior, atual, vol });

  const faltam = [];
  if (mCurto === null) faltam.push(`média curta (precisa de ${p.curto} amostras)`);
  if (mMedio === null) faltam.push(`média média (precisa de ${p.medio})`);
  if (mLongo === null) faltam.push(`média longa (precisa de ${p.longo})`);
  if (r === null) faltam.push(`RSI (precisa de ${p.rsi + 1})`);
  if (md.linha === null) faltam.push('MACD (precisa de 35)');

  return {
    amostras: limpa.length,
    descartadas,
    atual,
    intervaloHoras,
    medias: {
      curto: mCurto, medio: mMedio, longo: mLongo,
      janelaHoras: { curto: janela(p.curto), medio: janela(p.medio), longo: janela(p.longo) }
    },
    rsi: r,
    rsiJanelaHoras: janela(p.rsi),
    macd: md,
    bollinger: bb,
    volatilidade: vol,
    tendencia: dir,
    risco: rk,
    /** O que ainda não dá para afirmar, e quanto falta para poder. */
    faltam,
    completo: faltam.length === 0
  };
}
