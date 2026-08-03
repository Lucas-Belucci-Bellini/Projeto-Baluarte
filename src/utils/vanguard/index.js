/**
 * Motor do Project Vanguard — ponto único de importação.
 *
 * Regra de ouro deste diretório: **zero dependências e zero DOM**. Tudo aqui
 * roda igual no navegador, no Node, num Web Worker e numa função serverless.
 * É o que permite a mesma física alimentar o app, o site e a API sem
 * ninguém reimplementar nada (e sem duas versões divergirem em silêncio).
 *
 * Se você for adicionar algo aqui e precisar de `window`, `document` ou de um
 * pacote npm: o lugar é `src/ui/`, não aqui.
 */

export * from './angles.js';
export * from './geo.js';
export * from './mgrs.js';
export * from './gridref.js';
/* Grade REAL dos terrenos do Arma 3 (offset e SINAL do passo por mundo).
 * Diferente do gridref.js, que e MGRS local: 30 dos 31 mundos do jogo contam
 * o northing de cima pra baixo, e assumir a convencao MGRS erra o eixo N-S. */
export * from './arma3-grid.js';
export * from './ballistics.js';
export * from './charges.js';
export * from './fire-mission.js';
