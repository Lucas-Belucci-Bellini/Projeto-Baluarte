/**
 * O engine 3D da V2 — o que dá para provar sem GPU.
 *
 * Node não tem WebGL, e isso NÃO é uma limitação do teste: o caminho sem WebGL é
 * o mais importante que este módulo tem. Um engine 3D que lança quando a GPU não
 * está disponível derruba a página inteira em máquina fraca, VM, navegador com
 * aceleração desligada ou driver na lista negra — que é justamente onde o 3D
 * deveria simplesmente não aparecer.
 *
 * O que exige GPU (render de fato, `dispose` liberando recurso de verdade) fica
 * para o portão de navegador. Aqui se prova a fronteira, e o grafo de cena, que o
 * Three.js monta sem contexto gráfico.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import { criarCena, temWebGL, iluminarTresPontos } from '../../v2/modules/visor3d/cena.js';

/** Um `document` de mentira que responde o que o teste mandar. */
function docFalso(contexto) {
  return { createElement: () => ({ getContext: () => contexto }) };
}

test('sem document, não há WebGL', () => {
  assert.equal(temWebGL(undefined), false);
  assert.equal(temWebGL({}), false, 'objeto sem createElement');
});

test('getContext devolvendo null significa sem WebGL', () => {
  /* O caso real de GPU bloqueada: a classe `WebGLRenderingContext` existe, e a
   * criação do contexto falha mesmo assim. Perguntar pela classe responderia
   * "tem"; perguntar pelo contexto responde a verdade. */
  assert.equal(temWebGL(docFalso(null)), false);
});

test('getContext que lança também significa sem WebGL', () => {
  /* Alguns navegadores lançam em vez de devolver null. Deixar a exceção subir
   * transformaria "não tem 3D" em "a página quebrou". */
  const doc = { createElement: () => ({ getContext: () => { throw new Error('bloqueado'); } }) };
  assert.equal(temWebGL(doc), false);
});

test('com contexto, temWebGL aceita — e devolve o contexto de teste', () => {
  /* O canvas de teste não pode ficar segurando GPU: um vazamento nascido dentro
   * da checagem de vazamento seria irônico e real. */
  let perdeu = false;
  const ctx = {
    getExtension: (nome) => (nome === 'WEBGL_lose_context'
      ? { loseContext: () => { perdeu = true; } }
      : null)
  };
  assert.equal(temWebGL(docFalso(ctx)), true);
  assert.equal(perdeu, true, 'o contexto de teste tem de ser devolvido');
});

test('sem WebGL, criarCena devolve null — não lança', () => {
  /* A asserção que dá nome ao arquivo. `null` é contrato: quem chama decide o
   * fallback. Lançar aqui faria o módulo derrubar a rota inteira. */
  assert.equal(criarCena({}, { doc: docFalso(null) }), null);
});

test('canvas ausente é erro de programação, não de ambiente', () => {
  /* Ambiente sem GPU devolve `null`; chamada errada lança. Confundir os dois
   * faria um bug de código passar por "esse navegador não suporta". */
  assert.throws(() => criarCena(null, { doc: docFalso(null) }), /canvas/);
});

test('a iluminação de três pontos entrega key, fill, rim e ambiente', () => {
  /* O grafo de cena do Three.js não precisa de GPU, então isto é testável aqui.
   * A rim vindo de trás (z negativo) é o que separa o objeto do fundo escuro —
   * sem ela a cena vira mancha, e é o erro que mais barateia um 3D. */
  const scene = new THREE.Scene();
  const luzes = iluminarTresPontos(scene);

  assert.equal(luzes.length, 4);
  assert.equal(scene.children.length, 4, 'as luzes têm de entrar na cena');

  const direcionais = luzes.filter((l) => l instanceof THREE.DirectionalLight);
  assert.equal(direcionais.length, 3, 'key, fill e rim');
  assert.ok(
    luzes.some((l) => l instanceof THREE.AmbientLight),
    'sem ambiente, o lado escuro fica preto puro'
  );

  /* Pelo NOME, não por "alguma direcional com z<0": a fill também está atrás
   * (z=-4), então a versão anterior desta asserção passava com a rim movida para
   * a frente — mutante sobreviveu e mostrou isso. Nomear as luzes é o que deixa
   * o teste falar da peça certa. */
  const rim = scene.getObjectByName('rim');
  const fill = scene.getObjectByName('fill');
  assert.ok(rim, 'a rim precisa existir e ser endereçável por nome');
  assert.ok(rim.position.z < 0, 'a rim vem de trás do objeto');
  assert.ok(
    rim.position.z < fill.position.z,
    'a rim tem de estar MAIS atrás que a fill — senão não recorta a silhueta'
  );
});
