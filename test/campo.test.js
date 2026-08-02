/**
 * Testes do grupo 6 — campo, vigilância e segurança.
 *
 * Aqui a régua é a mesma do repo irmão (Vanguard): número errado numa tela de
 * sensoriamento é pior que tela quebrada, porque ninguém percebe. E vale também
 * a regra de UMA implementação: duas cópias da mesma conta divergem em
 * silêncio — foi exatamente o que aconteceu com o Morse.
 *
 * Âncoras: propriedade estrutural (recuperar o alvo sem ruído, recusar caso
 * singular, mais sensores = menos erro) e concordância entre as telas que
 * dizem calcular a mesma coisa.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { triangulate, bearingTo, dist, gaussianNoise } from '../src/utils/triangulation.js';
import { toMorse, fromMorse } from '../src/utils/cripto-engine.js';
import { textToMorse, morseToText } from '../src/data/morse-code.js';

/* ===================== uma implementação, dois chamadores ================== */

test('/cripto e /morse dão a MESMA resposta', async () => {
  /* Havia duas implementações de Morse no repositório e elas já tinham
   * divergido: a de `/cripto` DESCARTAVA em silêncio todo caractere fora da
   * tabela. "ÍNDIA" saía "NDIA", "VOCÊ" saía "VOC" — texto com letra faltando,
   * sem aviso nenhum. Agora `cripto-engine` delega para a canônica. */
  for (const texto of ['SOS', 'ÍNDIA', 'VOCÊ', 'A§B', 'EU SOU', 'BALUARTE 2026']) {
    assert.equal(toMorse(texto), textToMorse(texto), `divergiram em "${texto}"`);
    assert.equal(fromMorse(toMorse(texto)), morseToText(textToMorse(texto)), `decodificação divergiu em "${texto}"`);
  }
});

test('/cripto não engole caractere em silêncio', () => {
  /* Perder o acento é honesto (o Morse não distingue); perder a LETRA não é. */
  assert.equal(fromMorse(toMorse('ÍNDIA')), 'INDIA');
  assert.equal(fromMorse(toMorse('VOCÊ')), 'VOCE');
  assert.match(toMorse('A§B'), /#/, 'caractere sem código deveria ser marcado, não sumir');
});

/* ============================== triangulação =============================== */

const alvo = { x: 137.5, y: -82.25 };
const comRumo = (p, t = alvo, erro = 0) => ({ ...p, bearing: bearingTo(p, t) + erro });

test('sem ruído, os rumos exatos recuperam o alvo', () => {
  /* A propriedade que define o método: se as retas se cruzam num ponto, é
   * aquele ponto que tem de sair. Erro numérico até 1e-9 é ponto flutuante. */
  const estacoes = [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 250, y: 400 }, { x: -300, y: 200 }].map((s) => comRumo(s));
  const r = triangulate(estacoes);
  assert.ok(r.ok);
  assert.ok(dist(r, alvo) < 1e-9, `errou por ${dist(r, alvo)}`);
  assert.ok(r.residual < 1e-9, `resíduo deveria ser zero, veio ${r.residual}`);
});

test('duas estações bastam para cruzar', () => {
  const r = triangulate([{ x: 0, y: 0 }, { x: 1000, y: 0 }].map((s) => comRumo(s)));
  assert.ok(r.ok);
  assert.ok(dist(r, alvo) < 1e-9);
});

test('rumos paralelos são recusados, não chutados', () => {
  /* Retas paralelas não se cruzam. Devolver um ponto qualquer aqui seria pior
   * que devolver nada: a tela mostraria uma posição inventada com a mesma
   * cara de uma posição medida. */
  const paralelas = [{ x: 0, y: 0, bearing: 0 }, { x: 0, y: 100, bearing: 0 }, { x: 0, y: 200, bearing: 0 }];
  const r = triangulate(paralelas);
  assert.equal(r.ok, false);
  assert.equal(r.residual, Infinity);
});

test('estação sozinha não define ponto', () => {
  assert.equal(triangulate([comRumo({ x: 0, y: 0 })]).ok, false);
  assert.equal(triangulate([]).ok, false);
});

test('o resultado não depende da ordem das estações', () => {
  const base = [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 250, y: 400 }].map((s) => comRumo(s, alvo, 0.01));
  const a = triangulate(base);
  const b = triangulate([...base].reverse());
  assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9, 'mínimos quadrados virou sensível à ordem');
});

test('mais sensores reduzem o erro sob ruído', () => {
  /* É a razão de existir do ajuste por mínimos quadrados: se acrescentar
   * estação não melhorasse, o método não estaria combinando as medidas. */
  const erroMedio = (n, sigma, amostras = 400) => {
    let soma = 0;
    for (let k = 0; k < amostras; k += 1) {
      const est = Array.from({ length: n }, (_, i) => {
        const ang = (2 * Math.PI * i) / n;
        return comRumo({ x: 600 * Math.cos(ang), y: 600 * Math.sin(ang) }, alvo, gaussianNoise(sigma));
      });
      soma += dist(triangulate(est), alvo);
    }
    return soma / amostras;
  };
  const poucas = erroMedio(3, 0.02);
  const muitas = erroMedio(8, 0.02);
  assert.ok(muitas < poucas, `8 estações (${muitas.toFixed(2)}) não ficou melhor que 3 (${poucas.toFixed(2)})`);
});

test('o resíduo cresce com o ruído — serve como medida de confiança', () => {
  /* A tela mostra o resíduo ao operador. Se ele não acompanhasse o ruído, seria
   * um número decorativo. */
  const residuoMedio = (sigma, amostras = 300) => {
    let soma = 0;
    for (let k = 0; k < amostras; k += 1) {
      const est = [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 250, y: 400 }, { x: -300, y: 200 }]
        .map((s) => comRumo(s, alvo, gaussianNoise(sigma)));
      soma += triangulate(est).residual;
    }
    return soma / amostras;
  };
  assert.ok(residuoMedio(0) < 1e-9, 'sem ruído o resíduo tem que ser zero');
  assert.ok(residuoMedio(0.05) > residuoMedio(0.01), 'o resíduo não acompanha o ruído');
});

/* ================================ rumos ==================================== */

test('bearingTo segue a convenção declarada: de +x, anti-horário', () => {
  const origem = { x: 0, y: 0 };
  assert.equal(bearingTo(origem, { x: 1, y: 0 }), 0);
  assert.ok(Math.abs(bearingTo(origem, { x: 0, y: 1 }) - Math.PI / 2) < 1e-12);
  assert.ok(Math.abs(bearingTo(origem, { x: -1, y: 0 }) - Math.PI) < 1e-12);
  assert.ok(Math.abs(bearingTo(origem, { x: 0, y: -1 }) + Math.PI / 2) < 1e-12);
});

test('rumo de ida e volta difere de 180°', () => {
  /* Normalização por atan2 em vez de `%`: o resto em JavaScript herda o sinal
   * do dividendo, e a conta ingênua acusava π de erro justamente quando a
   * diferença era π — ou seja, quando estava certa. */
  const normalizar = (ang) => Math.atan2(Math.sin(ang), Math.cos(ang));   // para (-π, π]
  for (const [a, b] of [
    [{ x: 12, y: -7 }, { x: -30, y: 44 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: -5, y: -5 }, { x: 5, y: 5 }]
  ]) {
    const ida = bearingTo(a, b), volta = bearingTo(b, a);
    assert.ok(Math.abs(normalizar(ida - volta - Math.PI)) < 1e-12,
      `ida e volta não são opostos: ${ida} vs ${volta}`);
  }
});

/* ============================= ruído gaussiano ============================= */

test('o ruído tem média ~0 e desvio ~sigma', () => {
  /* Box–Muller: se a média escorregasse, todo o simulador ficaria enviesado e
   * a tela mostraria um erro sistemático que o sensor real não tem. */
  const sigma = 3;
  const n = 40000;
  const amostras = Array.from({ length: n }, () => gaussianNoise(sigma));
  const media = amostras.reduce((s, x) => s + x, 0) / n;
  const dp = Math.sqrt(amostras.reduce((s, x) => s + (x - media) ** 2, 0) / n);
  assert.ok(Math.abs(media) < 0.1, `média ${media} longe de zero`);
  assert.ok(Math.abs(dp - sigma) < 0.15, `desvio ${dp} longe de ${sigma}`);
});
