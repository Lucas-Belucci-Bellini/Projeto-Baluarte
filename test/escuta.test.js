/**
 * O ouvido do J.A.R.V.I.S. — prova sem microfone (#405).
 *
 * A detecção de palma é a parte do assistente de voz que mais tem chance de
 * ficar "quase funcionando": qualquer som alto passa de um limiar, então um
 * detector ingênuo dispara sozinho a noite inteira e ninguém entende por quê.
 *
 * Por isso o teste central aqui não é "palma dispara" — é **música alta NÃO
 * dispara**. O primeiro é fácil; o segundo é o que decide se dá para deixar
 * ligado.
 *
 * As séries são sintetizadas com a forma que o fenômeno tem (ataque abrupto e
 * queda rápida na palma; sustentação na música), não com números copiados de
 * uma gravação — assim o teste diz o que ele acredita, e não só o que mediu.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  JanelaEnergia, comandoApos, detectarPalmaDupla, detectarTransientes,
  energiaDoQuadro, normalizarFala, temAtivacao
} from '../src/utils/escuta-nucleo.js';

const DT = 16;                              // ~60 quadros/s
const FUNDO = 0.05;                         // sala silenciosa, não zero

/** Série de fundo com um pouco de vida — silêncio absoluto não existe. */
function fundo(n, nivel = FUNDO) {
  return Array.from({ length: n }, (_, i) => nivel * (0.9 + 0.2 * Math.sin(i / 3)));
}

/**
 * Enfia um transiente em `i`: sobe de uma vez e decai com constante de ~26 ms.
 *
 * O decaimento é em TEMPO, não em quadros. A primeira versão deste helper
 * decaía "em 6 quadros", o que fazia a mesma palma durar 100 ms a 60 fps e
 * 200 ms a 30 fps — e então o teste de taxa de quadros reprovava o detector
 * por um defeito do sinal sintético, não do código. Palma real dura o que
 * dura, independentemente de quantas vezes por segundo alguém a mediu.
 */
function palma(serie, i, dtMs = DT, pico = 0.9) {
  const s = serie.slice();
  const TAU_MS = 26;
  s[i] = pico;
  for (let k = 1; i + k < s.length; k += 1) {
    const v = pico * Math.exp(-(k * dtMs) / TAU_MS);
    if (v < 1e-3) break;
    s[i + k] = Math.max(s[i + k], v);
  }
  return s;
}

test('duas palmas próximas viram um gesto', () => {
  let s = fundo(120);
  s = palma(s, 40, DT);
  s = palma(s, 40 + Math.round(250 / DT), DT);   // 250 ms depois
  const pares = detectarPalmaDupla(s, DT);
  assert.equal(pares.length, 1, 'esperava exatamente um gesto');
});

test('MÚSICA ALTA NÃO DISPARA — a propriedade que torna o gatilho usável', () => {
  // alto o tempo todo, com variação: passa de qualquer limiar absoluto,
  // mas nunca cai de volta ao fundo
  const s = Array.from({ length: 200 },
    (_, i) => 0.55 + 0.25 * Math.sin(i / 2) + 0.1 * Math.sin(i / 7));
  assert.deepEqual(detectarPalmaDupla(s, DT), [],
    'música sustentada não pode virar palma');
  assert.deepEqual(detectarTransientes(s, DT), [],
    'nem transiente isolado');
});

test('fala contínua também não dispara', () => {
  // voz: sobe e desce, mas com sílabas encadeadas e sem retorno ao fundo
  const s = Array.from({ length: 200 },
    (_, i) => 0.30 + 0.18 * Math.abs(Math.sin(i / 4)) + 0.05 * Math.sin(i));
  assert.deepEqual(detectarPalmaDupla(s, DT), []);
});

test('silêncio e fade-in não disparam', () => {
  assert.deepEqual(detectarTransientes(fundo(150), DT), [], 'silêncio');
  const rampa = Array.from({ length: 150 }, (_, i) => 0.02 + (i / 150) * 0.9);
  assert.deepEqual(detectarTransientes(rampa, DT), [],
    'subida gradual não é transiente');
});

test('palmas longe demais não são o mesmo gesto', () => {
  let s = fundo(300);
  s = palma(s, 40, DT);
  s = palma(s, 40 + Math.round(1800 / DT), DT);  // 1,8 s
  assert.deepEqual(detectarPalmaDupla(s, DT), []);
});

test('o eco da mesma palma não vira a segunda palma', () => {
  let s = fundo(120);
  s = palma(s, 40, DT, 0.9);
  s = palma(s, 42, DT, 0.6);                     // 32 ms — reflexo da parede
  const picos = detectarTransientes(s, DT);
  assert.equal(picos.length, 1, `período refratário falhou: ${picos}`);
});

test('três palmas viram UM gesto, não dois sobrepostos', () => {
  let s = fundo(160);
  const p = Math.round(250 / DT);
  s = palma(s, 40, DT); s = palma(s, 40 + p); s = palma(s, 40 + 2 * p);
  assert.equal(detectarPalmaDupla(s, DT).length, 1);
});

test('a mesma série em outra taxa de quadros é lida coerentemente', () => {
  // 30 fps: o mesmo intervalo em ms, metade dos quadros
  const dt = 33;
  let s = fundo(80);
  s = palma(s, 30, dt);
  s = palma(s, 30 + Math.round(250 / dt), dt);
  assert.equal(detectarPalmaDupla(s, dt).length, 1,
    'dtMs precisa ser levado em conta — "rápido" depende da taxa');
});

test('entrada inválida devolve vazio em vez de estourar', () => {
  for (const ruim of [null, undefined, [], [1], 'texto', 42, {}]) {
    assert.deepEqual(detectarTransientes(ruim, DT), []);
    assert.deepEqual(detectarPalmaDupla(ruim, DT), []);
  }
  assert.deepEqual(detectarTransientes(fundo(50), 0), [], 'dt inválido');
});

test('a detecção é determinística', () => {
  let s = fundo(120);
  s = palma(s, 40, DT); s = palma(s, 40 + Math.round(250 / DT), DT);
  assert.deepEqual(detectarPalmaDupla(s, DT), detectarPalmaDupla(s, DT));
});

test('energiaDoQuadro normaliza 0..1 e independe do fftSize', () => {
  assert.equal(energiaDoQuadro(new Uint8Array(64).fill(255)), 1);
  assert.equal(energiaDoQuadro(new Uint8Array(2048).fill(255)), 1,
    'o mesmo som cheio em outro fftSize tem de dar o mesmo número');
  assert.equal(energiaDoQuadro(new Uint8Array(64)), 0);
  assert.equal(energiaDoQuadro([]), 0);
  assert.equal(energiaDoQuadro(null), 0);
});

test('a janela guarda só o necessário e não cresce sem limite', () => {
  const j = new JanelaEnergia(10);
  for (let i = 0; i < 100; i += 1) j.push(i / 100);
  assert.equal(j.serie().length, 10, 'a janela tem de ser limitada');
  assert.equal(j.serie().at(-1), 0.99, 'o último quadro é o mais recente');
  j.limpar();
  assert.equal(j.serie().length, 0);
});

// ── palavra de ativação ───────────────────────────────────────────────────

test('a ativação ignora acento, caixa e pontuação', () => {
  for (const frase of ['Jarvis', 'JARVIS!', 'jarvís...', '  jarvis  ']) {
    assert.equal(temAtivacao(frase), 'jarvis', `falhou em "${frase}"`);
  }
});

test('ativação casa por PALAVRA inteira, não por pedaço', () => {
  assert.equal(temAtivacao('jarvisão chegou'), null,
    'pedaço dentro de outra palavra não pode acordar o assistente');
  assert.equal(temAtivacao('meujarvis'), null);
  assert.equal(temAtivacao('o jarvis abriu'), 'jarvis');
});

test('sem ativação, nada é comando', () => {
  assert.equal(temAtivacao('abre o mapa'), null);
  assert.equal(comandoApos('abre o mapa'), '');
  assert.equal(temAtivacao(''), null);
  assert.equal(temAtivacao(null), null);
});

test('o comando é o que sobra depois da ativação', () => {
  assert.equal(comandoApos('Jarvis, abre o mapa'), 'abre o mapa');
  assert.equal(comandoApos('ei jarvis abre o arsenal'), 'abre o arsenal');
  assert.equal(comandoApos('jarvis'), '', 'só o nome não é comando');
});

test('a segunda palavra de ativação também vale', () => {
  assert.equal(temAtivacao('baluarte status'), 'baluarte');
  assert.equal(comandoApos('baluarte status'), 'status');
  assert.equal(temAtivacao('jarvis', ['computador']), null,
    'a lista de palavras é respeitada');
});
