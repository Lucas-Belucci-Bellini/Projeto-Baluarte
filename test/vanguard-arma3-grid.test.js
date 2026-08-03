/**
 * Grade real dos terrenos do Arma 3.
 *
 * Nada aqui compara com número decorado. São propriedades estruturais, que
 * valem em qualquer mundo com qualquer convenção de grade — e uma delas é
 * justamente a que o `gridref.js` erra para mapa do Arma: o SINAL do passo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  acharTerreno, terrenosComGrade, parseGrade, gradeParaMetros,
  metrosParaGrade, vetorArma3, dentroDoMundo, sentidoNorthing,
} from '../src/utils/vanguard/arma3-grid.js';
import { normalizarPosicao, validarMissao, resolverMissao } from '../src/utils/vanguard/fire-mission.js';

test('a base traz terrenos com grade medida', () => {
  const ts = terrenosComGrade();
  assert.ok(ts.length >= 30, `esperava 30+, veio ${ts.length}`);
  for (const t of ts) {
    assert.ok(Number.isFinite(t.grade.offsetX), `${t.classe}: offsetX`);
    assert.ok(Number.isFinite(t.grade.offsetY), `${t.classe}: offsetY`);
    assert.notEqual(t.grade.passoY, 0, `${t.classe}: passoY zero`);
  }
});

test('parseGrade recusa o que é ambíguo', () => {
  for (const ruim of ['', '123', '12345', 'abc', '123456789012']) {
    assert.equal(parseGrade(ruim), null, `deveria recusar "${ruim}"`);
  }
  assert.deepEqual(parseGrade('034056'), { e: 34, n: 56, casas: 3 });
  assert.deepEqual(parseGrade('0340 0560'), { e: 340, n: 560, casas: 4 });
});

test('ida-e-volta grade → metros → grade em TODOS os terrenos', () => {
  for (const t of terrenosComGrade()) {
    const max = 10 ** t.grade.digitos - 1;
    for (const e of [0, 1, Math.floor(max / 2), max - 1]) {
      for (const n of [0, 1, Math.floor(max / 2), max - 1]) {
        const txt = String(e).padStart(t.grade.digitos, '0')
          + String(n).padStart(t.grade.digitos, '0');
        const m = gradeParaMetros(txt, t);
        assert.ok(m, `${t.classe}: ${txt} não converteu`);
        assert.equal(metrosParaGrade(m.x, m.y, t), txt, `${t.classe}: ${txt}`);
      }
    }
  }
});

test('o SINAL do passo decide onde fica o northing 000 — o erro que motivou o módulo', () => {
  const altis = acharTerreno('altis');
  assert.ok(altis, 'Altis não está na base');
  assert.equal(sentidoNorthing(altis), 'norte-para-sul');

  /* No Altis o rótulo 000 fica na borda NORTE, não na sul. Se alguém
   * "consertar" o sinal do passo achando que é erro de dado, este teste cai. */
  const zero = gradeParaMetros('0'.repeat(altis.grade.digitos * 2), altis);
  assert.ok(zero.y > altis.tamanhoM / 2,
    `northing 000 deveria cair na metade NORTE; caiu em y=${zero.y}`);

  /* E o mundo que conta ao contrário continua funcionando. */
  const invertidos = terrenosComGrade().filter((t) => t.grade.passoY > 0);
  assert.ok(invertidos.length >= 1, 'esperava ao menos 1 mundo sul-para-norte');
  for (const t of invertidos) {
    assert.equal(sentidoNorthing(t), 'sul-para-norte');
  }
});

test('azimute: anti-simetria e vizinho a leste, em todos os terrenos', () => {
  for (const t of terrenosComGrade()) {
    const meio = Math.floor((10 ** t.grade.digitos - 1) / 2);
    const g = (e, n) => String(e).padStart(t.grade.digitos, '0')
      + String(n).padStart(t.grade.digitos, '0');
    const a = gradeParaMetros(g(meio, meio), t);
    const b = gradeParaMetros(g(meio + 1, meio), t);

    const ida = vetorArma3(a, b);
    const volta = vetorArma3(b, a);
    const dif = ((ida.azimuteDeg - volta.azimuteDeg) % 360 + 360) % 360;
    assert.ok(Math.abs(dif - 180) < 1e-9, `${t.classe}: ida/volta diferem ${dif}°`);
    assert.ok(Math.abs(ida.azimuteDeg - 90) < 1e-9,
      `${t.classe}: vizinho a leste deu ${ida.azimuteDeg}°`);
    assert.ok(Math.abs(ida.distanciaM - Math.abs(t.grade.passoX)) < 1e-6,
      `${t.classe}: distância ${ida.distanciaM} ≠ passo ${t.grade.passoX}`);
    assert.ok(Math.abs(ida.retroAzimuteDeg - 270) < 1e-9, `${t.classe}: retro`);
  }
});

test('as unidades de ângulo fecham a volta', () => {
  const v = vetorArma3({ x: 0, y: 0 }, { x: 1, y: 0 }); // leste = 90°
  assert.ok(Math.abs(v.azimuteMilNato - 1600) < 1e-9);
  assert.ok(Math.abs(v.azimuteMrad - (2 * Math.PI * 1000) / 4) < 1e-9);
});

test('dentroDoMundo devolve null quando o tamanho não é declarado', () => {
  const semTamanho = terrenosComGrade().filter((t) => t.tamanhoM == null);
  for (const t of semTamanho) {
    assert.equal(dentroDoMundo({ x: 0, y: 0 }, t), null,
      `${t.classe}: sem mapSize, a resposta honesta é null`);
  }
  const altis = acharTerreno('altis');
  assert.equal(dentroDoMundo({ x: 100, y: 100 }, altis), true);
  assert.equal(dentroDoMundo({ x: -1, y: 100 }, altis), false);
});

/* ─────────── a grade atravessando a missão de tiro ───────────
 *
 * Os testes acima provam o conversor. Estes provam que o conversor é MESMO o
 * que a missão usa: é possível o módulo estar certo e o motor continuar lendo
 * a grade pela convenção genérica, e o resultado seria um azimute plausível e
 * errado. É esse silêncio que estes testes quebram. */

test('o motor lê a grade pelo config do terreno, não pela convenção genérica', () => {
  const altis = acharTerreno('altis');
  const zeros = '0'.repeat(altis.grade.digitos * 2);

  const comTerreno = normalizarPosicao({ tipo: 'local', grid: zeros, terreno: 'altis' });
  const semTerreno = normalizarPosicao({ tipo: 'local', grid: zeros });

  /* Mesma string, dois quadros: com terreno o northing 000 cai ao NORTE, sem
   * terreno cai na origem do canto sudoeste. Se um dia derem no mesmo, é
   * porque alguém apagou o caminho do terreno. */
  assert.ok(comTerreno.y > altis.tamanhoM / 2, `com terreno: y=${comTerreno.y}`);
  assert.ok(semTerreno.y < altis.tamanhoM / 2, `sem terreno: y=${semTerreno.y}`);

  assert.deepEqual(
    { x: comTerreno.x, y: comTerreno.y },
    gradeParaMetros(zeros, altis),
    'o motor deveria devolver exatamente o que gradeParaMetros devolve'
  );
});

test('terreno desconhecido ou sem grade falha alto, não em silêncio', () => {
  assert.throws(() => normalizarPosicao({ tipo: 'local', grid: '034056', terreno: 'nao_existe' }),
    /não está na base/);
  assert.throws(() => normalizarPosicao({ tipo: 'local', grid: '123', terreno: 'altis' }),
    /ilegível/);
});

test('peça e alvo em terrenos diferentes é pedido inválido', () => {
  const dois = terrenosComGrade().slice(0, 2);
  const erros = validarMissao({
    schema: 'vanguard.fire-mission/1',
    peca: { pos: { tipo: 'local', grid: '034056', terreno: dois[0].id }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', grid: '035057', terreno: dois[1].id } },
  });
  assert.ok(erros.some((e) => /terrenos diferentes/.test(e)),
    `esperava recusa por terrenos diferentes; veio ${JSON.stringify(erros)}`);

  /* O mesmo terreno nos dois lados não pode ser recusado. */
  const ok = validarMissao({
    schema: 'vanguard.fire-mission/1',
    peca: { pos: { tipo: 'local', grid: '034056', terreno: dois[0].id }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', grid: '035057', terreno: dois[0].id } },
  });
  assert.deepEqual(ok, [], `mesmo terreno não deveria dar erro: ${JSON.stringify(ok)}`);
});

test('missão completa numa grade do Arma 3 resolve e fecha a geometria', () => {
  const altis = acharTerreno('altis');
  const d = altis.grade.digitos;
  const g = (e, n) => String(e).padStart(d, '0') + String(n).padStart(d, '0');

  /* Duas células separadas por 20 na horizontal: a distância tem de ser
   * 20 × passo, qualquer que seja o sinal do passo. */
  const passos = 20;
  const r = resolverMissao({
    schema: 'vanguard.fire-mission/1',
    peca: { pos: { tipo: 'local', grid: g(100, 100), terreno: 'altis' }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', grid: g(100 + passos, 100), terreno: 'altis' } },
    opcoes: { modo: 'alto', sistemaMil: 'nato' },
  });

  assert.deepEqual(r.erros ?? [], []);
  assert.equal(r.ok, true, 'deveria haver solução a 2 km com morteiro 81 mm');
  assert.equal(r.geometria.quadro, 'local');
  assert.ok(
    Math.abs(r.geometria.distanciaHorizontalM - passos * Math.abs(altis.grade.passoX)) < 1e-6,
    `distância ${r.geometria.distanciaHorizontalM} ≠ ${passos * Math.abs(altis.grade.passoX)}`
  );
  /* Alvo a leste: azimute 90° = 1600 mil NATO. */
  assert.ok(Math.abs(r.azimute.gradeDeg - 90) < 1e-9, `azimute ${r.azimute.gradeDeg}°`);
  assert.ok(Math.abs(r.azimute.gradeMil - 1600) < 1e-9, `mil ${r.azimute.gradeMil}`);
});
