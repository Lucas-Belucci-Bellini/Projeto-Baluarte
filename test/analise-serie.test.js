/**
 * Análise de série temporal — o núcleo de decisão.
 *
 * As asserções são de PROPRIEDADE, não de número decorado: RSI de série que só
 * sobe é 100 por definição, Bollinger de série constante colapsa na constante,
 * a banda inferior nunca passa a superior. Conferir contra valor copiado de
 * uma planilha provaria só que copiei certo.
 *
 * Dois testes existem por causa de defeitos do código de origem
 * (`stock-analyzer-bot/server/indicators.ts`) que NÃO foram portados. Eles
 * estão marcados como REGRESSÃO — se alguém "simplificar" de volta, reprovam.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RISCO, TENDENCIA, analisar, bollinger, desvio, ema, emaSerie, macd,
  risco, rsi, sma, tendencia, volatilidade
} from '../src/utils/analise-serie.js';

const constante = (n, v = 50) => new Array(n).fill(v);
const subindo = (n, de = 10, passo = 1) => Array.from({ length: n }, (_, i) => de + i * passo);
const descendo = (n, de = 500, passo = 1) => Array.from({ length: n }, (_, i) => de - i * passo);

// ── médias ────────────────────────────────────────────────────────────────

test('a média de uma série constante é a própria constante', () => {
  assert.equal(sma(constante(50, 7), 20), 7);
  assert.equal(ema(constante(50, 7), 20), 7);
});

test('sem amostra suficiente devolve null, nunca um número plausível', () => {
  assert.equal(sma(subindo(5), 20), null);
  assert.equal(ema(subindo(5), 20), null);
  assert.equal(rsi(subindo(5), 14), null);
  assert.equal(bollinger(subindo(5), 20).meio, null);
  assert.equal(volatilidade(subindo(5), 20), null);
});

test('a EMA reage mais rápido que a SMA a uma mudança recente', () => {
  const s = [...constante(40, 100), ...constante(10, 200)];
  const a = sma(s, 20);
  const e = ema(s, 20);
  assert.ok(e > a, `EMA ${e} deveria estar acima da SMA ${a} após o degrau`);
});

test('emaSerie alinha ao índice e só começa na semente', () => {
  const s = subindo(30);
  const es = emaSerie(s, 10);
  assert.equal(es.length, s.length);
  assert.ok(es.slice(0, 9).every((v) => v === null), 'antes da semente é null');
  assert.ok(Number.isFinite(es[9]), 'a semente entra no índice periodo-1');
  assert.equal(es.at(-1), ema(s, 10), 'o último ponto bate com ema()');
});

// ── RSI ───────────────────────────────────────────────────────────────────

test('RSI fica sempre dentro de 0..100', () => {
  const series = [subindo(60), descendo(60), constante(60),
                  Array.from({ length: 60 }, (_, i) => 100 + 30 * Math.sin(i / 3)),
                  Array.from({ length: 60 }, () => Math.random() * 1000)];
  for (const s of series) {
    const r = rsi(s, 14);
    assert.ok(r === null || (r >= 0 && r <= 100), `RSI fora da faixa: ${r}`);
  }
});

test('RSI dos extremos: só sobe é 100, só desce é 0', () => {
  assert.equal(rsi(subindo(60), 14), 100);
  assert.equal(rsi(descendo(60), 14), 0);
});

test('série constante não é nem sobrecomprada nem sobrevendida', () => {
  assert.equal(rsi(constante(60), 14), 50,
    'sem ganho e sem perda o índice é neutro, não 100');
});

// ── MACD ──────────────────────────────────────────────────────────────────

test('REGRESSÃO: o histograma do MACD NÃO é sempre zero', () => {
  // No original a linha de sinal era `Placeholder = macdLine`, então
  // histograma = macd - macd = 0 para qualquer entrada. O indicador parecia
  // funcionar e não dizia nada.
  const s = [...subindo(40, 100, 2), ...descendo(30, 180, 3)];
  const m = macd(s);
  assert.ok(Number.isFinite(m.histograma), 'histograma deveria existir');
  assert.notEqual(m.histograma, 0, 'histograma zerado = a linha de sinal é falsa');
  assert.notEqual(m.sinal, m.linha, 'a linha de sinal não pode ser o próprio MACD');
});

test('o MACD muda de sinal quando a série vira', () => {
  const alta = macd([...constante(40, 100), ...subindo(40, 100, 5)]);
  const baixa = macd([...constante(40, 100), ...descendo(40, 100, 5)]);
  assert.ok(alta.linha > 0, 'série subindo => MACD positivo');
  assert.ok(baixa.linha < 0, 'série descendo => MACD negativo');
});

test('MACD sem histórico suficiente devolve tudo null', () => {
  const m = macd(subindo(20));
  assert.equal(m.linha, null);
  assert.equal(m.sinal, null);
  assert.equal(m.histograma, null);
});

// ── Bollinger e volatilidade ──────────────────────────────────────────────

test('as bandas nunca se cruzam e o meio é a média', () => {
  const s = Array.from({ length: 80 }, (_, i) => 100 + 20 * Math.sin(i / 4));
  const b = bollinger(s, 20);
  assert.ok(b.inferior <= b.meio && b.meio <= b.superior, 'ordem das bandas');
  assert.equal(b.meio, sma(s, 20), 'o meio é exatamente a SMA');
});

test('série constante colapsa as bandas no próprio valor', () => {
  const b = bollinger(constante(40, 42), 20);
  assert.equal(b.superior, 42);
  assert.equal(b.meio, 42);
  assert.equal(b.inferior, 42);
  assert.equal(desvio(constante(40, 42), 20), 0);
  assert.equal(volatilidade(constante(40, 42), 20), 0);
});

test('a volatilidade é relativa: a mesma variação % dá o mesmo número', () => {
  const pequeno = Array.from({ length: 40 }, (_, i) => 10 * (1 + 0.03 * ((i % 2) ? 1 : -1)));
  const grande = pequeno.map((v) => v * 1000);
  assert.ok(Math.abs(volatilidade(pequeno, 20) - volatilidade(grande, 20)) < 1e-9,
    'escala não pode mudar a volatilidade relativa');
});

// ── tendência: o segundo defeito não portado ──────────────────────────────

test('REGRESSÃO: falta de dado é INDEFINIDA, não LATERAL', () => {
  // O original devolvia "Sideways" quando faltava média — então "ainda não
  // coletei 21 dias" saía com a mesma cara de "medi e não há direção".
  assert.equal(tendencia(null, null, null, 100), TENDENCIA.INDEFINIDA);
  assert.equal(tendencia(10, 9, null, 11), TENDENCIA.INDEFINIDA,
    'uma média faltando já basta para não afirmar');
  assert.equal(tendencia(10, 9, 8, 11), TENDENCIA.ALTA);
  assert.notEqual(tendencia(null, null, null, 100), TENDENCIA.LATERAL);
});

test('a direção segue a ordem das médias', () => {
  assert.equal(tendencia(10, 9, 8, 11), TENDENCIA.ALTA);
  assert.equal(tendencia(8, 9, 10, 7), TENDENCIA.BAIXA);
  assert.equal(tendencia(10, 9, 8, 5), TENDENCIA.LATERAL, 'preço abaixo quebra a alta');
  assert.equal(tendencia(9, 10, 8, 11), TENDENCIA.LATERAL, 'médias desordenadas');
});

// ── risco ─────────────────────────────────────────────────────────────────

test('o risco vem acompanhado do motivo', () => {
  const r = risco({ rsi: 85, superior: 100, inferior: 50, atual: 120, vol: 0.15 });
  assert.equal(r.nivel, RISCO.ALTO);
  assert.ok(r.motivos.length >= 3, `esperava motivos, veio ${JSON.stringify(r.motivos)}`);
  assert.ok(r.motivos.some((m) => m.includes('RSI')));
});

test('sem nenhum sinal disponível o risco é INDEFINIDO, não BAIXO', () => {
  const r = risco({});
  assert.equal(r.nivel, RISCO.INDEFINIDO,
    'não medir não é o mesmo que medir e achar tudo calmo');
});

test('série calma dá risco baixo', () => {
  const r = risco({ rsi: 50, superior: 110, inferior: 90, atual: 100, vol: 0.01 });
  assert.equal(r.nivel, RISCO.BAIXO);
});

// ── o relatório ───────────────────────────────────────────────────────────

test('analisar() diz o que ainda NÃO dá para afirmar', () => {
  const a = analisar(subindo(30), { intervaloHoras: 2.5 });
  assert.equal(a.completo, false);
  assert.ok(a.faltam.some((f) => f.includes('longa')), `faltam: ${a.faltam}`);
  assert.equal(a.medias.longo, null);
  assert.equal(a.tendencia, TENDENCIA.INDEFINIDA);
});

test('com histórico suficiente o relatório fecha', () => {
  const a = analisar(subindo(260, 100, 0.5), { intervaloHoras: 2.5 });
  assert.equal(a.completo, true, `ainda faltam: ${a.faltam}`);
  assert.equal(a.tendencia, TENDENCIA.ALTA);
  assert.equal(a.amostras, 260);
});

test('a janela de cada indicador vem em horas — o número sem escala é meia informação', () => {
  const a = analisar(subindo(260), { intervaloHoras: 2.5 });
  assert.equal(a.rsiJanelaHoras, 35, 'RSI(14) a cada 2h30 cobre 35 h');
  assert.equal(a.medias.janelaHoras.longo, 500, 'SMA(200) cobre 500 h ≈ 21 dias');
  const sem = analisar(subindo(260));
  assert.equal(sem.rsiJanelaHoras, null, 'sem intervalo declarado, não invento a escala');
});

test('valor inválido é descartado e CONTADO, não silenciado', () => {
  const s = [...subindo(60), NaN, null, undefined, Infinity, 'texto'];
  const a = analisar(s);
  assert.equal(a.amostras, 60);
  assert.equal(a.descartadas, 5, 'quantos vieram ruins tem de aparecer');
  assert.ok(Number.isFinite(a.atual));
});

test('entrada vazia ou inválida não estoura', () => {
  for (const ruim of [null, undefined, [], 'texto', 42, {}]) {
    const a = analisar(ruim);
    assert.equal(a.amostras, 0);
    assert.equal(a.atual, null);
    assert.equal(a.tendencia, TENDENCIA.INDEFINIDA);
    assert.equal(a.risco.nivel, RISCO.INDEFINIDO);
  }
});

test('a análise é determinística', () => {
  const s = Array.from({ length: 300 }, (_, i) => 100 + 20 * Math.sin(i / 7) + i * 0.1);
  assert.deepEqual(analisar(s, { intervaloHoras: 2.5 }),
                   analisar(s, { intervaloHoras: 2.5 }));
});
