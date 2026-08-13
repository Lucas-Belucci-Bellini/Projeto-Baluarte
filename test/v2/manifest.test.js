/**
 * Contrato do módulo da V2 (`v2/core/manifest.js`).
 *
 * O que estes testes protegem, em ordem de importância:
 *
 * 1. **Namespace de storage e de evento.** Sem eles, dois módulos reivindicam a
 *    mesma chave e o segundo a carregar vence — em silêncio. Falha silenciosa é
 *    exatamente o que a arquitetura da V2 existe para eliminar, e seria irônico
 *    reintroduzi-la no primeiro arquivo dela.
 * 2. **`migrate` obrigatório acima da versão 1.** É a lição das 59 chaves da V1
 *    escrita como invariante, para não precisar ser reaprendida.
 * 3. **Erros acumulam.** Um manifesto com cinco problemas tem que reportar os
 *    cinco; parar no primeiro transforma isso em cinco execuções.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validar, normalizar, PERMISSOES } from '../../v2/core/manifest.js';

/** Manifesto mínimo válido — a base que cada teste desvia num ponto só. */
const base = () => ({ id: 'cripto', name: 'Lab de Criptografia', version: '1.0.0' });

const erroSobre = (r, trecho) =>
  r.erros.some((x) => x.toLowerCase().includes(trecho.toLowerCase()));

/* ===== o mínimo ===== */

test('manifesto mínimo é válido', () => {
  const r = validar(base());
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('não-objeto é recusado sem explodir', () => {
  for (const v of [null, undefined, 'texto', 42, []]) {
    assert.equal(validar(v).ok, false, `aceitou ${JSON.stringify(v)}`);
  }
});

test('id, name e version são obrigatórios', () => {
  assert.ok(erroSobre(validar({ name: 'X', version: '1.0.0' }), 'id'));
  assert.ok(erroSobre(validar({ id: 'x', version: '1.0.0' }), 'name'));
  assert.ok(erroSobre(validar({ id: 'x', name: 'X' }), 'version'));
});

test('name vazio ou só espaço é recusado', () => {
  /* Os 31 "rota registrada sem título" da V1 vieram daqui. */
  for (const nome of ['', '   ', '\t']) {
    assert.equal(validar({ ...base(), name: nome }).ok, false, `aceitou ${JSON.stringify(nome)}`);
  }
});

test('id fora de kebab-case é recusado', () => {
  for (const mau of ['Cripto', 'cripto_lab', 'cripto.lab', '2fast', 'cripto-', '-x']) {
    assert.equal(validar({ ...base(), id: mau }).ok, false, `aceitou "${mau}"`);
  }
  for (const bom of ['cripto', 'centro-militar', 'arma3']) {
    assert.equal(validar({ ...base(), id: bom }).ok, true, `recusou "${bom}"`);
  }
});

test('version fora de semver é recusada', () => {
  for (const mau of ['1.0', 'v1.0.0', '1', 'abc', 1]) {
    assert.equal(validar({ ...base(), version: mau }).ok, false, `aceitou ${JSON.stringify(mau)}`);
  }
  assert.equal(validar({ ...base(), version: '1.0.0-rc.1' }).ok, true);
});

/* ===== storage: os invariantes que mais importam ===== */

test('chave de storage FORA do namespace do módulo é recusada', () => {
  const r = validar({
    ...base(),
    storage: [{ key: 'editor:state', version: 1, class: 'local' }]
  });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'cripto:'), r.erros.join(' | '));
});

test('chave dentro do namespace passa', () => {
  const r = validar({
    ...base(),
    storage: [{ key: 'cripto:prefs', version: 1, class: 'local' }]
  });
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('versão > 1 sem migrate é recusada', () => {
  /* A lição das 59 chaves: dado do operador não migra sozinho. */
  const r = validar({
    ...base(),
    storage: [{ key: 'cripto:prefs', version: 2, class: 'local' }]
  });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'migrate'), r.erros.join(' | '));
});

test('versão > 1 COM migrate passa', () => {
  const r = validar({
    ...base(),
    storage: [{ key: 'cripto:prefs', version: 2, class: 'local', migrate: (v) => v }]
  });
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('classe de dado inválida é recusada', () => {
  const r = validar({ ...base(), storage: [{ key: 'cripto:p', version: 1, class: 'publico2' }] });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'class'));
});

test('version de storage não-inteira é recusada', () => {
  for (const v of [0, -1, 1.5, '1', null]) {
    const r = validar({ ...base(), storage: [{ key: 'cripto:p', version: v, class: 'local' }] });
    assert.equal(r.ok, false, `aceitou version=${JSON.stringify(v)}`);
  }
});

/* ===== eventos ===== */

test('emitir evento fora do próprio namespace é recusado', () => {
  const r = validar({ ...base(), events: { emits: ['editor:salvou'] } });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'cripto:'));
});

test('CONSUMIR evento alheio é permitido — é o ponto do Event Bus', () => {
  const r = validar({ ...base(), events: { emits: ['cripto:cifrado'], consumes: ['editor:salvou'] } });
  assert.equal(r.ok, true, r.erros.join(' | '));
});

/* ===== rotas ===== */

test('path sem barra inicial é recusado', () => {
  const r = validar({ ...base(), routes: [{ path: 'cripto', view: () => {} }] });
  assert.equal(r.ok, false);
});

test('view que não é função é recusada (carregamento preguiçoso)', () => {
  const r = validar({ ...base(), routes: [{ path: '/cripto', view: {} }] });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'função'));
});

test('rota duplicada dentro do mesmo módulo é recusada', () => {
  const r = validar({
    ...base(),
    routes: [{ path: '/cripto', view: () => {} }, { path: '/cripto', view: () => {} }]
  });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'duplicada'));
});

/* ===== dependências e permissões ===== */

test('módulo que depende de si mesmo é recusado', () => {
  const r = validar({ ...base(), dependencies: ['cripto'] });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'próprio'));
});

test('permissão fora do vocabulário é recusada', () => {
  const r = validar({ ...base(), permissions: ['ROOT'] });
  assert.equal(r.ok, false);
  assert.ok(erroSobre(r, 'desconhecida'));
  assert.equal(validar({ ...base(), permissions: [...PERMISSOES] }).ok, true);
});

/* ===== a ergonomia que faz alguém usar isto ===== */

test('erros ACUMULAM — cinco problemas, cinco mensagens', () => {
  const r = validar({
    id: 'Cripto',                                   // 1 kebab
    name: '',                                       // 2 vazio
    version: 'v1',                                  // 3 semver
    permissions: ['ROOT'],                          // 4 vocabulário
    storage: [{ key: 'outro:x', version: 1, class: 'local' }] // 5 namespace
  });
  assert.equal(r.ok, false);
  assert.ok(r.erros.length >= 5, `só ${r.erros.length}: ${r.erros.join(' | ')}`);
});

test('a mensagem diz o valor recusado, não só que recusou', () => {
  const r = validar({ ...base(), stability: 'quase' });
  assert.ok(r.erros.some((x) => x.includes('quase')), r.erros.join(' | '));
});

/* ===== normalizar ===== */

test('stability padrão é experimental, não estável', () => {
  /* Mesmo raciocínio do deny-by-default: quem não declarou não ganha a
   * promessa mais forte por omissão. */
  assert.equal(normalizar(base()).stability, 'experimental');
});

test('normalizar preenche sem apagar o declarado', () => {
  const n = normalizar({ ...base(), stability: 'estavel', events: { emits: ['cripto:x'] } });
  assert.equal(n.stability, 'estavel');
  assert.deepEqual(n.events.emits, ['cripto:x']);
  assert.deepEqual(n.events.consumes, [], 'não preencheu o lado que faltava');
  assert.deepEqual(n.routes, []);
  assert.equal(n.ambiente, 'ambos');
});
