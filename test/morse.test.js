/**
 * Testes do código Morse.
 *
 * Existem porque a tela `/morse` estava devolvendo resposta errada em silêncio:
 * a tabela tinha `Í: '..'`, que é o mesmo código do `I`. Como a tabela inversa
 * é construída varrendo as entradas, o último vencia — e TODA decodificação
 * trocava I por Í. "SIM" saía "SÍM"; "INDIA" saía "ÍNDÍA". A tela abria, não
 * dava erro nenhum, e mentia. É exatamente o defeito que teste de fumaça não
 * pega e que só um teste de PROPRIEDADE pega.
 *
 * Nada aqui confere contra número decorado: ou é constante publicada (o timing
 * PARIS, a tabela internacional), ou é propriedade estrutural (ida-e-volta,
 * unicidade, monotonicidade).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MORSE_TABLE, MORSE_REVERSE, wpmToDitMs,
  textToMorse, morseToText, morseToSegments
} from '../src/data/morse-code.js';

/* ===================== o defeito que motivou o arquivo ====================== */

test('nenhum caractere compartilha código com outro', () => {
  /* A inversa só é bem-definida se a tabela for injetora. Se dois caracteres
   * dividirem um código, o último sobrescreve o primeiro e a decodificação
   * passa a devolver o caractere errado — sem erro, sem aviso. */
  const porCodigo = {};
  for (const [ch, code] of Object.entries(MORSE_TABLE)) (porCodigo[code] ||= []).push(ch);
  const colisoes = Object.entries(porCodigo).filter(([, chs]) => chs.length > 1);
  assert.deepEqual(colisoes, [], `código repetido na tabela: ${JSON.stringify(colisoes)}`);
});

test('ida e volta preserva o texto A–Z e 0–9', () => {
  const texto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
  assert.equal(morseToText(textToMorse(texto)), texto);
});

test('a letra I sobrevive à ida e volta (a regressão do Í)', () => {
  assert.equal(morseToText(textToMorse('SIM')), 'SIM');
  assert.equal(morseToText(textToMorse('INDIA')), 'INDIA');
  assert.equal(morseToText('..'), 'I');
});

/* ======================= tabela: constante publicada ======================== */

test('as letras do Morse internacional conferem com a tabela publicada', () => {
  /* Amostra da ITU-R M.1677-1 — constante publicada, não número lembrado. */
  const OFICIAL = { A: '.-', E: '.', N: '-.', O: '---', S: '...', T: '-', Z: '--..' };
  for (const [ch, code] of Object.entries(OFICIAL)) assert.equal(MORSE_TABLE[ch], code, `letra ${ch}`);
});

test('todo código usa só ponto e traço, e a inversa fecha com a tabela', () => {
  for (const [ch, code] of Object.entries(MORSE_TABLE)) {
    assert.match(code, /^[.-]+$/, `código de ${ch} tem símbolo estranho: ${code}`);
    assert.equal(MORSE_REVERSE[code], ch, `a inversa de ${code} não volta em ${ch}`);
  }
});

/* ============================ acentos do PT-BR ============================== */

test('acento com código próprio é preservado na ida e volta', () => {
  for (const ch of ['Á', 'É', 'Ó', 'Ú', 'Ç', 'Ñ']) {
    assert.equal(morseToText(textToMorse(ch)), ch, `${ch} não voltou`);
  }
});

test('acento sem código no Morse vale pela letra-base, não vira #', () => {
  /* O Morse internacional não distingue estes. Perder o acento é honesto;
   * virar '#' perderia a letra inteira. */
  assert.equal(textToMorse('Í'), MORSE_TABLE.I);
  assert.equal(morseToText(textToMorse('ÍNDIA')), 'INDIA');
  assert.equal(morseToText(textToMorse('VOCÊ')), 'VOCE');
  for (const ch of ['À', 'Â', 'Ã', 'Ê', 'Ô', 'Õ', 'Ü']) {
    assert.doesNotMatch(textToMorse(ch), /#/, `${ch} virou # em vez de dobrar na letra-base`);
  }
});

test('caractere de fato sem código vira #', () => {
  assert.equal(textToMorse('§'), '#');
});

/* ============================ estrutura do texto =========================== */

test('palavras são separadas por / e letras por espaço', () => {
  assert.equal(textToMorse('EU SOU'), '. ..- / ... --- ..-');
});

test('decodifica palavra separada por /, | ou espaço duplo', () => {
  const esperado = 'EU SOU';
  assert.equal(morseToText('. ..- / ... --- ..-'), esperado);
  assert.equal(morseToText('. ..- | ... --- ..-'), esperado);
  assert.equal(morseToText('. ..-  ... --- ..-'), esperado);
});

test('caixa e espaço extra não mudam o resultado', () => {
  assert.equal(textToMorse('  eu   sou  '), textToMorse('EU SOU'));
});

/* =========================== timing PARIS (áudio) ========================== */

test('wpmToDitMs segue o padrão PARIS', () => {
  /* PARIS = 50 unidades por palavra. A 1 WPM, uma palavra leva 60 s, logo a
   * unidade vale 60000/50 = 1200 ms. Constante do padrão, não valor decorado. */
  assert.equal(wpmToDitMs(1), 1200);
  assert.equal(wpmToDitMs(20), 60);
});

test('a duração de PARIS a 20 WPM fecha em 1 minuto para 20 palavras', () => {
  /* Propriedade estrutural do padrão: a palavra PARIS, com o espaço de palavra,
   * é exatamente 50 unidades — é a definição de WPM. */
  const wpm = 20;
  const segs = morseToSegments(textToMorse('PARIS') + ' /', wpm);
  const total = segs.reduce((s, x) => s + x.ms, 0);
  assert.equal(Math.round(total / wpmToDitMs(wpm)), 50, 'PARIS deveria custar 50 unidades');
});

test('proporções do timing: dah = 3 dits, espaço de letra = 3, de palavra = 7', () => {
  const u = wpmToDitMs(20);
  const segs = morseToSegments('.- / -', 20);
  const dit = segs.find((s) => s.kind === 'dit');
  const dah = segs.find((s) => s.kind === 'dah');
  const palavra = segs.find((s) => s.kind === 'word-gap');
  assert.equal(dit.ms, u);
  assert.equal(dah.ms, u * 3);
  assert.equal(palavra.ms, u * 7);
});

test('mais rápido é mais curto — monotonicidade', () => {
  const dur = (wpm) => morseToSegments(textToMorse('BALUARTE'), wpm).reduce((s, x) => s + x.ms, 0);
  assert.ok(dur(30) < dur(20) && dur(20) < dur(10), 'aumentar o WPM deveria encurtar a transmissão');
});

test('não há dois segmentos ligados em seguida — sempre há silêncio entre sinais', () => {
  /* Se dois "on" ficassem colados, o operador ouviria um traço só no lugar de
   * duas letras. É a propriedade que garante que a mensagem é legível. */
  const segs = morseToSegments(textToMorse('SOS BALUARTE'), 18);
  for (let i = 1; i < segs.length; i += 1) {
    assert.ok(!(segs[i].on && segs[i - 1].on), `segmentos ligados colados na posição ${i}`);
  }
});
