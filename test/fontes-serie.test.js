/**
 * As fontes e o significado dos números delas.
 *
 * O teste central aqui é o que justifica os três domínios usarem UM motor:
 * a mesma série, subindo do mesmo jeito, tem de produzir vereditos OPOSTOS
 * conforme a fonte — porque bitcoin subindo e bundle inchando são a mesma
 * matemática e notícias contrárias.
 *
 * Se esse teste passar, compartilhar o motor é seguro. Se falhar, o
 * compartilhamento estaria mentindo em metade das fontes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { TENDENCIA } from '../src/utils/analise-serie.js';
import {
  DOMINIO, FONTES, INTERVALO_HORAS, POLARIDADE, POR_ID, VEREDITO,
  analisarFonte, fontesDo, interpretar, panorama
} from '../src/utils/fontes-serie.js';

/** Série longa o bastante para fechar até a média longa (200). */
const subindo = (n = 260, de = 100, passo = 0.5) =>
  Array.from({ length: n }, (_, i) => de + i * passo);
const descendo = (n = 260, de = 300, passo = 0.5) =>
  Array.from({ length: n }, (_, i) => de - i * passo);

test('A MESMA subida dá vereditos OPOSTOS conforme a fonte', () => {
  const serie = subindo();

  const jogadores = analisarFonte('jogadores-online', serie);
  const bundle = analisarFonte('bundle-kb', serie);

  assert.equal(jogadores.tendencia, TENDENCIA.ALTA);
  assert.equal(bundle.tendencia, TENDENCIA.ALTA, 'a matemática é a mesma');

  assert.equal(jogadores.veredito, VEREDITO.MELHORANDO, 'mais gente é bom');
  assert.equal(bundle.veredito, VEREDITO.PIORANDO, 'bundle inchando é regressão');
});

test('e a mesma queda também', () => {
  const serie = descendo();
  assert.equal(analisarFonte('jogadores-online', serie).veredito, VEREDITO.PIORANDO);
  assert.equal(analisarFonte('bundle-kb', serie).veredito, VEREDITO.MELHORANDO);
});

test('fonte neutra não vira julgamento', () => {
  const r = analisarFonte('btc-usd', subindo(260, 50_000, 20));
  assert.equal(r.tendencia, TENDENCIA.ALTA);
  assert.equal(r.veredito, VEREDITO.OBSERVANDO,
    'o Baluarte observa cotação, não recomenda');
  assert.ok(!/melhor|pior/i.test(r.resumo), `resumo julgou: ${r.resumo}`);
});

test('sem polaridade declarada, nada é interpretado', () => {
  assert.equal(interpretar(TENDENCIA.ALTA, null), VEREDITO.INDEFINIDO);
  assert.equal(interpretar(TENDENCIA.ALTA, undefined), VEREDITO.INDEFINIDO,
    'inventar significado é pior que não ter');
});

test('sem histórico, o veredito é INDEFINIDO — e o resumo diz o que falta', () => {
  const r = analisarFonte('bundle-kb', subindo(30));
  assert.equal(r.veredito, VEREDITO.INDEFINIDO);
  assert.match(r.resumo, /falta/i, `resumo não explicou: ${r.resumo}`);
  assert.ok(!/piorando|melhorando/.test(r.resumo));
});

test('valor implausível é rejeitado pela fonte e CONTADO', () => {
  // API devolvendo 0 e -1 é o modo clássico de falhar sem erro
  const s = [...subindo(260), 0, -1, 99e9];
  const r = analisarFonte('jogadores-online', s);
  assert.equal(r.rejeitadas, 2, 'o -1 e o 99e9 saem; o 0 é plausível aqui');
  assert.ok(Number.isFinite(r.atual));
});

test('os limites são por fonte, não globais', () => {
  assert.equal(POR_ID['rotas-quebradas'].aceita(0), true, 'zero rota quebrada é ótimo');
  assert.equal(POR_ID['rotas-quebradas'].aceita(-1), false);
  assert.equal(POR_ID['btc-usd'].aceita(0), false, 'bitcoin a zero é a API falhando');
  assert.equal(POR_ID['btc-usd'].aceita(95_000), true);
});

test('fonte desconhecida é erro explícito, não silêncio', () => {
  const r = analisarFonte('nao-existe', subindo());
  assert.ok(r.erro, 'deveria dizer que não conhece');
  assert.equal(r.veredito, VEREDITO.INDEFINIDO);
});

// ── o catálogo ────────────────────────────────────────────────────────────

test('todo id é único e estável', () => {
  const ids = FONTES.map((f) => f.id);
  assert.equal(ids.length, new Set(ids).size,
    'id repetido sobrescreveria a série histórica da outra fonte');
});

test('toda fonte declara polaridade, domínio e unidade', () => {
  const pols = Object.values(POLARIDADE);
  const doms = Object.values(DOMINIO);
  for (const f of FONTES) {
    assert.ok(pols.includes(f.polaridade), `${f.id} sem polaridade válida`);
    assert.ok(doms.includes(f.dominio), `${f.id} sem domínio válido`);
    assert.ok(f.unidade, `${f.id} sem unidade — número sem unidade não se lê`);
    assert.equal(f.intervaloHoras, INTERVALO_HORAS);
  }
});

test('os três domínios têm fonte', () => {
  for (const d of Object.values(DOMINIO)) {
    assert.ok(fontesDo(d).length > 0, `domínio ${d} vazio`);
  }
});

// ── panorama ──────────────────────────────────────────────────────────────

test('o panorama agrupa por domínio e ordena o que piora', () => {
  const p = panorama({
    'bundle-kb': subindo(260, 400, 1),          // piorando
    'jogadores-online': descendo(260, 500, 1),  // piorando
    'testes-passando': subindo(260, 100, 1)     // melhorando
  });

  assert.equal(p.intervaloHoras, INTERVALO_HORAS);
  assert.equal(p.fontesComDado, 3);
  assert.equal(p.fontesTotais, FONTES.length);

  for (const d of Object.values(DOMINIO)) {
    assert.ok(Array.isArray(p.dominios[d]), `domínio ${d} ausente do panorama`);
  }

  const ids = p.atencao.map((r) => r.fonte.id);
  assert.deepEqual(ids.sort(), ['bundle-kb', 'jogadores-online'],
    'só o que piora entra na lista de atenção');
});

test('fonte sem coleta não é erro — aparece como sem dado', () => {
  const p = panorama({});
  assert.equal(p.fontesComDado, 0);
  assert.deepEqual(p.atencao, [], 'nada a alarmar quando nada foi medido');
  const todas = Object.values(p.dominios).flat();
  assert.equal(todas.length, FONTES.length);
  assert.ok(todas.every((r) => r.veredito === VEREDITO.INDEFINIDO));
});

test('o panorama é determinístico', () => {
  const s = { 'bundle-kb': subindo(260), 'btc-usd': subindo(260, 50_000, 10) };
  assert.deepEqual(panorama(s), panorama(s));
});

test('o resumo traz a janela em horas, não só o número', () => {
  const r = analisarFonte('bundle-kb', subindo());
  assert.match(r.resumo, /50 h/, `esperava a janela curta (20 × 2,5 h): ${r.resumo}`);
});
