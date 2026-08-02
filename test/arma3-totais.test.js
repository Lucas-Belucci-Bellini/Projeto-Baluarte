/**
 * Confere `src/data/arma3-totais.js` contra as bases de verdade.
 *
 * O arquivo de totais é uma CÓPIA — e cópia de número é exatamente o que
 * envelhece calada. Ele existe para que a barra de abas de `/arma3-tutorial`
 * possa mostrar "🔫 Armas · 106" sem arrastar os 2,2 MB de bases junto; o preço
 * é que agora há dois lugares dizendo a mesma coisa.
 *
 * Este teste é o que faz o preço valer a pena: se uma base for regerada pelos
 * scripts do Arma 3 e os totais ficarem para trás, o CI acusa em vez de a tela
 * mentir. Sem ele, o arquivo gerado seria só mais uma fonte de verdade
 * divergente.
 *
 * Conserto quando falhar: `node scripts/gerar-arma3-totais.mjs`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as totais from '../src/data/arma3-totais.js';

/* base → contadores que ela exporta (espelha o gerador). */
const BASES = [
  ['vanilla', ['A3VAN_TOTAL_TOPICOS']],
  ['armas', ['A3ARM_TOTAL']],
  ['acessorios', ['A3ACC_TOTAL']],
  ['veiculos', ['A3VEI_TOTAL']],
  ['equipamento', ['A3EQP_TOTAL']],
  ['soldados', ['A3SOL_TOTAL']],
  ['terrenos', ['A3TER_TOTAL']],
  ['municao', ['A3MUN_TOTAL', 'A3MAG_TOTAL']],
  ['colecao', ['A3COL_TOTAL']],
  ['tutoriais', ['A3TUT_TOTAL']],
  ['config', ['A3CFG_TOTAL_TOPICOS']],
  ['comandos', ['A3CMD_TOTAL']],
  ['campanhas', ['A3CAMP_TOTAL']],
  ['drive', ['A3DRV_TOTAL']],
  ['presets', ['ARMA3_TOTAL_MODS']]
];

test('cada total copiado bate com o que a base exporta', async () => {
  const divergentes = [];
  for (const [base, nomes] of BASES) {
    const mod = await import(`../src/data/arma3-${base}.js`);
    for (const nome of nomes) {
      if (totais[nome] !== mod[nome]) {
        divergentes.push(`${nome}: totais diz ${totais[nome]}, arma3-${base}.js diz ${mod[nome]}`);
      }
    }
  }
  assert.deepEqual(divergentes, [],
    `total desatualizado — rode \`node scripts/gerar-arma3-totais.mjs\`:\n  ${divergentes.join('\n  ')}`);
});

test('nenhum contador ficou de fora nem sobrando', async () => {
  /* Se uma base ganhar um contador novo, ele precisa entrar no gerador — senão
   * a aba nova nasce sem número e ninguém percebe. */
  const esperados = new Set(BASES.flatMap(([, nomes]) => nomes));
  const publicados = new Set(Object.keys(totais));
  assert.deepEqual([...publicados].filter((n) => !esperados.has(n)), [], 'total publicado que o gerador não conhece');
  assert.deepEqual([...esperados].filter((n) => !publicados.has(n)), [], 'total que o gerador conhece mas não publicou');
});

test('todo total é inteiro positivo', async () => {
  for (const [nome, valor] of Object.entries(totais)) {
    assert.equal(typeof valor, 'number', `${nome} não é número`);
    assert.ok(Number.isInteger(valor) && valor > 0, `${nome} = ${valor} não é contagem válida`);
  }
});

test('onde a base é inteira em JS, o total é o tamanho da lista', async () => {
  /* Vale só para as bases SEM banco externo. As que têm `dbUrl` guardam um
   * NÚCLEO em JS e o resto num JSON carregado sob demanda — nelas o total é o
   * do banco completo, propositalmente maior que o núcleo (acessórios: núcleo
   * de 211, total de 3218). Cobrar igualdade ali seria cobrar a ausência do
   * carregamento sob demanda, que é justamente o que se quer ter. */
  const { A3TER, A3TER_TOTAL, A3TER_META } = await import('../src/data/arma3-terrenos.js');
  assert.equal(A3TER_TOTAL, A3TER.length, 'o total de terrenos não é o tamanho da lista');
  assert.ok(A3TER_META, 'terrenos deveria declarar meta');

  const { A3MUN, A3MUN_TOTAL, A3MAG, A3MAG_TOTAL } = await import('../src/data/arma3-municao.js');
  assert.equal(A3MUN_TOTAL, A3MUN.length);
  assert.equal(A3MAG_TOTAL, A3MAG.length);
});

test('nas bases com banco externo, o núcleo é menor que o total', async () => {
  /* É a propriedade que diz que o carregamento sob demanda está de pé: se o
   * núcleo alcançasse o total, o JSON teria virado peso morto e alguém teria
   * inlinado o banco inteiro de volta no bundle. */
  for (const [base, lista, total] of [
    ['acessorios', 'A3ACC', 'A3ACC_TOTAL'],
    ['veiculos', 'A3VEI', 'A3VEI_TOTAL'],
    ['equipamento', 'A3EQP', 'A3EQP_TOTAL'],
    ['soldados', 'A3SOL', 'A3SOL_TOTAL']
  ]) {
    const mod = await import(`../src/data/arma3-${base}.js`);
    const meta = Object.entries(mod).find(([k]) => /_META$/.test(k))?.[1];
    assert.ok(meta?.dbUrl, `${base} deveria declarar dbUrl`);
    assert.ok(mod[lista].length < mod[total],
      `${base}: núcleo (${mod[lista].length}) alcançou o total (${mod[total]}) — o banco externo virou peso morto`);
    assert.ok(typeof mod[`carregar${base[0].toUpperCase()}${base.slice(1)}`] === 'function'
      || Object.keys(mod).some((k) => /^carregar/.test(k)), `${base} deveria expor um carregador`);
  }
});
