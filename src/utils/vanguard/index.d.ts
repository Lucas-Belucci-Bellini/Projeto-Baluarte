/**
 * Motor do Project Vanguard — ponto único de importação.
 *
 * Espelha `index.js` reexportação por reexportação, e a ordem é a mesma de lá.
 * Cada módulo tem o seu `.d.ts` ao lado, porque declarar só o que a página de
 * hoje consome deixaria o resto do motor invisível para o TypeScript — e um
 * `export *` que não resolve não vira erro sob `skipLibCheck`, vira `any` em
 * silêncio. Foi assim que `A3ColInfo` passou meses sem recusar nada.
 *
 * Regra de ouro do diretório, preservada: **zero dependências e zero DOM**. Se
 * algo aqui precisar de `window` ou de um pacote npm, o lugar é `src/ui/`.
 */

export * from './angles.js';
export * from './geo.js';
export * from './mgrs.js';
export * from './gridref.js';
/* Grade REAL dos terrenos do Arma 3 (offset e SINAL do passo por mundo).
 * Diferente do gridref.js, que é MGRS local: 30 dos 31 mundos do jogo contam
 * o northing de cima pra baixo, e assumir a convenção MGRS erra o eixo N-S. */
export * from './arma3-grid.js';
export * from './ballistics.js';
export * from './charges.js';
export * from './fire-mission.js';
