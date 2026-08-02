/**
 * Testes do router — em especial o arranque.
 *
 * Existem por causa de um defeito que passou despercebido por muito tempo e que
 * nenhum teste de tela pegava: em toda CARGA FRIA (link direto, F5, favorito) a
 * rota inicial resolvia DUAS vezes.
 *
 * `router.start()` chamava `resolve()` na hora e ainda registrava um listener
 * de `DOMContentLoaded` que chamava `resolve()` de novo. Como `main.js` é
 * `<script type="module">`, e módulo é deferido, ele roda ANTES do evento — os
 * dois sempre aconteciam.
 *
 * A página era construída duas vezes e só a segunda ia para o DOM. Nas telas
 * que guardam referência de elemento em variável de módulo (25 páginas), a
 * variável ficava apontando para a cópia ÓRFÃ: o usuário via uma tela que não
 * respondia a nada, sem erro no console. `/calc-cientifica` abria com o teclado
 * inteiramente morto — mas só quando aberta direto; entrando pela navegação
 * interna funcionava, que é o que escondeu o defeito.
 *
 * O vigia de rotas não pega isso por construção: a tela RENDERIZA, ela só não
 * obedece.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

/* ============================ ambiente de teste ============================ */

/**
 * Monta um `window`/`document` mínimo — só o que o router toca — e devolve o
 * módulo carregado de fresco, com os controles para o teste.
 *
 * `readyState` é o parâmetro que interessa: 'complete' é a carga fria de
 * verdade (módulo deferido roda com o DOM já lido); 'loading' é o caso em que
 * esperar o evento ainda faz sentido.
 */
async function montarRouter({ hash = '', readyState = 'complete' } = {}) {
  const listeners = {};
  globalThis.window = {
    location: { hash },
    history: { replaceState: (_s, _t, url) => { globalThis.window.location.hash = String(url); } },
    addEventListener: (tipo, fn, opts) => { (listeners[tipo] ||= []).push({ fn, opts }); },
    removeEventListener: (tipo, fn) => {
      listeners[tipo] = (listeners[tipo] || []).filter((l) => l.fn !== fn);
    }
  };
  globalThis.document = { readyState };

  /* Import com sufixo único: cada teste precisa de um router zerado, e o cache
   * de módulos do Node devolveria sempre a mesma instância. */
  const { router } = await import(`../src/core/router.js?t=${Math.random()}`);
  return {
    router,
    listeners,
    /* Honra `{ once: true }` como o navegador de verdade: sem isso o dublê
     * mentiria a favor do defeito, acusando repetição que o browser não faria. */
    disparar: (tipo) => {
      const fila = [...(listeners[tipo] || [])];
      for (const l of fila) {
        if (l.opts?.once) listeners[tipo] = listeners[tipo].filter((x) => x !== l);
        l.fn();
      }
    },
    conta: (tipo) => (listeners[tipo] || []).length
  };
}

/* ============================== o defeito ================================== */

test('carga fria com rota no hash resolve UMA vez, não duas', async () => {
  /* Reproduz a sequência real do navegador: o módulo é deferido, então
   * `start()` roda com o documento já lido, e SÓ DEPOIS o browser dispara
   * `DOMContentLoaded`. Sem disparar o evento, este teste passaria mesmo com o
   * defeito — era o que ele fazia antes de eu perceber. */
  const { router, disparar } = await montarRouter({ hash: '#/calc-cientifica', readyState: 'complete' });
  let construida = 0;
  router.register('/calc-cientifica', () => { construida += 1; return null; });
  router.start();
  disparar('DOMContentLoaded');
  assert.equal(construida, 1,
    'a página foi construída mais de uma vez: a referência de elemento guardada em módulo passa a apontar para a cópia órfã e a tela para de responder');
});

test('com o DOM já lido, o router nem registra DOMContentLoaded', async () => {
  /* Registrar e depois ignorar seria frágil: basta alguém disparar o evento à
   * mão para o defeito voltar. Melhor não estar lá. */
  const { router, conta } = await montarRouter({ hash: '#/home', readyState: 'complete' });
  router.register('/home', () => null);
  router.start();
  assert.equal(conta('DOMContentLoaded'), 0);
});

test('com o DOM ainda carregando, espera o evento — e só uma vez', async () => {
  const { router, conta, disparar } = await montarRouter({ hash: '#/home', readyState: 'loading' });
  let construida = 0;
  router.register('/home', () => { construida += 1; return null; });
  router.start();
  assert.equal(conta('DOMContentLoaded'), 1, 'deveria esperar o DOM quando ele ainda está sendo lido');

  const inicial = construida;
  disparar('DOMContentLoaded');
  assert.equal(construida, inicial + 1, 'o evento deveria resolver a rota');

  /* `{ once: true }`: disparar de novo não pode reconstruir a tela. */
  disparar('DOMContentLoaded');
  assert.equal(construida, inicial + 1, 'DOMContentLoaded resolveu mais de uma vez');
});

test('sem hash, cai na rota inicial — também uma vez só', async () => {
  const { router } = await montarRouter({ hash: '', readyState: 'complete' });
  let construida = 0;
  router.register('/home', () => { construida += 1; return null; });
  router.start('/home');
  assert.equal(construida, 1);
});

test('start() duas vezes não duplica listener nem re-resolve', async () => {
  const { router, conta } = await montarRouter({ hash: '#/home', readyState: 'complete' });
  let construida = 0;
  router.register('/home', () => { construida += 1; return null; });
  router.start();
  router.start();
  assert.equal(construida, 1);
  assert.equal(conta('hashchange'), 1);
});

/* ========================= casamento de rota =============================== */

test('hashchange resolve a rota nova', async () => {
  const { router, disparar } = await montarRouter({ hash: '#/home', readyState: 'complete' });
  const vistas = [];
  router.register('/home', () => { vistas.push('/home'); return null; });
  router.register('/sobre', () => { vistas.push('/sobre'); return null; });
  router.start();
  globalThis.window.location.hash = '#/sobre';
  disparar('hashchange');
  assert.deepEqual(vistas, ['/home', '/sobre']);
});

test('parâmetros nomeados chegam decodificados', async () => {
  const { router, disparar } = await montarRouter({ hash: '#/perfil/joão%20silva', readyState: 'complete' });
  let recebido = null;
  router.register('/perfil/:id', (args) => { recebido = args.id; return null; });
  router.start();
  assert.equal(recebido, 'joão silva');
  disparar; // silencia lint
});

test('query string vira objeto', async () => {
  const { router } = await montarRouter({ hash: '#/git-nexus?tab=memoria&x=1', readyState: 'complete' });
  let q = null;
  router.register('/git-nexus', ({ query }) => { q = query; return null; });
  router.start();
  assert.deepEqual(q, { tab: 'memoria', x: '1' });
});

test('a barra final é opcional', async () => {
  const { router } = await montarRouter({ hash: '#/sobre/', readyState: 'complete' });
  let bateu = false;
  router.register('/sobre', () => { bateu = true; return null; });
  router.start();
  assert.equal(bateu, true);
});

test('rota não registrada cai no notFound, não numa rota qualquer', async () => {
  const { router } = await montarRouter({ hash: '#/nao-existe', readyState: 'complete' });
  let caiu = null;
  router.register('/home', () => null);
  router.setNotFound((path) => { caiu = path; return null; });
  router.start();
  assert.equal(caiu, '/nao-existe');
});

test('handler que lança não derruba a navegação', async () => {
  const { router, disparar } = await montarRouter({ hash: '#/quebrada', readyState: 'complete' });
  const erroOriginal = console.error;
  console.error = () => {};
  try {
    router.register('/quebrada', () => { throw new Error('falha proposital'); });
    router.register('/home', () => null);
    assert.doesNotThrow(() => router.start());
    globalThis.window.location.hash = '#/home';
    assert.doesNotThrow(() => disparar('hashchange'), 'a navegação seguinte precisa continuar funcionando');
  } finally {
    console.error = erroOriginal;
  }
});

test('list() devolve os destinos navegáveis, sem os de parâmetro', async () => {
  const { router } = await montarRouter({ readyState: 'complete' });
  router.register('/home', () => null);
  router.register('/perfil/:id', () => null);
  assert.deepEqual(router.list(), ['/home']);
  assert.equal(router.count(), 2, 'count conta todas, inclusive as de parâmetro');
});
