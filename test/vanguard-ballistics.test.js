/**
 * Testes do motor balístico e do contrato de missão de tiro.
 *
 * A asserção mais forte aqui é a do primeiro teste: pegar o ângulo que o
 * solucionador devolveu, jogar de volta na equação da trajetória e conferir
 * que o projétil passa EXATAMENTE na altura do alvo. Isso não depende de
 * nenhuma tabela externa — é a própria física fechando consigo mesma.
 *
 * Para o solucionador com arrasto (que não tem forma fechada), a verificação
 * equivalente é o `residuoM`: a distância entre onde o projétil realmente
 * cruzou a altura do alvo e onde o alvo está. Tem de ser milimétrico.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolverVacuo, resolverComArrasto, alcanceMaximoVacuo, calibrarArrasto,
  integrarTrajetoria, G_PADRAO, MODO
} from '../src/utils/vanguard/ballistics.js';
import { SISTEMAS, arrastoDaCarga, listarSistemas, zonaBatida } from '../src/utils/vanguard/charges.js';
import {
  resolverMissao, validarMissao, normalizarPosicao, componentesVento,
  tratarRequisicao, SCHEMA_PEDIDO, SCHEMA_RESPOSTA
} from '../src/utils/vanguard/fire-mission.js';
import { radToMil } from '../src/utils/vanguard/angles.js';

/* Altura da trajetória sem ar, a distância x, para elevação θ. */
const alturaVacuo = (x, theta, v, g = G_PADRAO) =>
  x * Math.tan(theta) - (g * x * x) / (2 * v * v * Math.cos(theta) ** 2);

test('vácuo: a solução satisfaz a equação da trajetória', () => {
  const casos = [
    [1500, 0, 200], [1500, 120, 200], [2500, -80, 200],
    [400, 0, 70], [3000, 300, 268], [100, -500, 120], [5000, 0, 318]
  ];
  for (const [x, y, v] of casos) {
    for (const modo of [MODO.ALTO, MODO.TENSO]) {
      const s = resolverVacuo({ distanciaM: x, deltaAltM: y, v, modo });
      if (!s.ok) continue;
      const yCalc = alturaVacuo(x, s.elevacaoRad, v);
      assert.ok(Math.abs(yCalc - y) < 1e-6,
        `x=${x} y=${y} v=${v} ${modo}: trajetória passa em ${yCalc}, alvo em ${y}`);
    }
  }
});

test('vácuo: alcance máximo é v²/g e ocorre a 45°', () => {
  for (const v of [70, 120, 200, 268, 318]) {
    assert.ok(Math.abs(alcanceMaximoVacuo(v, 0) - (v * v) / G_PADRAO) < 1e-9);
    /* No limite do alcance as duas raízes se fundem em 45°. */
    const s = resolverVacuo({ distanciaM: alcanceMaximoVacuo(v, 0) - 1e-6, deltaAltM: 0, v });
    assert.ok(Math.abs(s.elevacaoDeg - 45) < 0.05, `v=${v}: ${s.elevacaoDeg}°`);
  }
});

test('vácuo: os dois ramos são complementares quando o alvo está no mesmo nível', () => {
  /* Sem diferença de altura, θ_alto + θ_tenso = 90°. */
  const alto = resolverVacuo({ distanciaM: 2000, deltaAltM: 0, v: 200, modo: MODO.ALTO });
  const tenso = resolverVacuo({ distanciaM: 2000, deltaAltM: 0, v: 200, modo: MODO.TENSO });
  assert.ok(Math.abs(alto.elevacaoDeg + tenso.elevacaoDeg - 90) < 1e-9);
  assert.ok(alto.tempoVooS > tenso.tempoVooS, 'o tiro curvo demora mais');
  assert.ok(alto.apiceM > tenso.apiceM, 'o tiro curvo sobe mais');
});

test('vácuo: alvo mais alto reduz o alcance máximo', () => {
  const v = 200;
  assert.ok(alcanceMaximoVacuo(v, 500) < alcanceMaximoVacuo(v, 0));
  assert.ok(alcanceMaximoVacuo(v, -500) > alcanceMaximoVacuo(v, 0));
  /* Alvo acima da altura máxima vertical (v²/2g) é inalcançável. */
  assert.equal(alcanceMaximoVacuo(v, (v * v) / (2 * G_PADRAO) + 1), 0);
});

test('vácuo: casos que têm de falhar em vez de devolver número errado', () => {
  const fora = resolverVacuo({ distanciaM: 99999, deltaAltM: 0, v: 200 });
  assert.equal(fora.ok, false);
  assert.match(fora.motivo, /fora de alcance/);

  assert.equal(resolverVacuo({ distanciaM: 0, deltaAltM: 100, v: 200 }).ok, false);
  assert.equal(resolverVacuo({ distanciaM: 100, deltaAltM: 0, v: 0 }).ok, false);
  assert.equal(resolverVacuo({ distanciaM: 100, deltaAltM: 0, v: -5 }).ok, false);
});

test('arrasto: o resíduo da solução é milimétrico', () => {
  const mu = calibrarArrasto(268, 5608);
  for (const d of [300, 800, 1500, 3000, 4500, 5000]) {
    for (const dy of [-200, 0, 300]) {
      const s = resolverComArrasto({ distanciaM: d, deltaAltM: dy, v: 268, mu });
      if (!s.ok) continue;
      assert.ok(Math.abs(s.residuoM) < 0.01,
        `d=${d} dy=${dy}: resíduo ${s.residuoM} m`);
    }
  }
});

test('arrasto → 0 converge para a solução de vácuo', () => {
  const vac = resolverVacuo({ distanciaM: 1500, deltaAltM: 100, v: 200, modo: MODO.ALTO });
  const arr = resolverComArrasto({ distanciaM: 1500, deltaAltM: 100, v: 200, mu: -1e-9, modo: MODO.ALTO });
  assert.ok(arr.ok);
  assert.ok(Math.abs(arr.elevacaoDeg - vac.elevacaoDeg) < 0.01,
    `arrasto ${arr.elevacaoDeg}° vs vácuo ${vac.elevacaoDeg}°`);
  assert.ok(Math.abs(arr.tempoVooS - vac.tempoVooS) < 0.05);
});

test('arrasto encurta o alcance e exige mais elevação que o vácuo', () => {
  const mu = calibrarArrasto(268, 5608);
  const vac = resolverVacuo({ distanciaM: 3000, deltaAltM: 0, v: 268, modo: MODO.ALTO });
  const arr = resolverComArrasto({ distanciaM: 3000, deltaAltM: 0, v: 268, mu, modo: MODO.ALTO });
  /* No ramo alto, mais elevação = menos alcance. Com ar perdendo alcance, a
   * solução precisa de MENOS elevação que a de vácuo para chegar à mesma
   * distância — e o alcance máximo cai. */
  assert.ok(arr.alcanceMaxM < vac.alcanceMaxM, 'o ar encurta o alcance máximo');
  assert.ok(arr.elevacaoDeg < vac.elevacaoDeg, 'compensa com menos elevação no ramo alto');
  assert.ok(arr.velocidadeImpacto < 268, 'chega mais devagar do que saiu');
});

test('arrasto: ramo alto é monótono decrescente na distância', () => {
  const mu = calibrarArrasto(268, 5608);
  let anterior = Infinity;
  for (let d = 500; d <= 5000; d += 250) {
    const s = resolverComArrasto({ distanciaM: d, deltaAltM: 0, v: 268, mu, modo: MODO.ALTO });
    assert.ok(s.ok, `d=${d} devia ter solução`);
    assert.ok(s.elevacaoDeg < anterior, `d=${d}: elevação ${s.elevacaoDeg} não decresceu`);
    assert.ok(s.elevacaoDeg > 45, 'ramo alto fica acima de 45°');
    anterior = s.elevacaoDeg;
  }
});

test('arrasto: ramo tenso é monótono crescente na distância', () => {
  const mu = calibrarArrasto(268, 5608);
  let anterior = -Infinity;
  for (let d = 500; d <= 4000; d += 500) {
    const s = resolverComArrasto({ distanciaM: d, deltaAltM: 0, v: 268, mu, modo: MODO.TENSO });
    assert.ok(s.ok, `d=${d} devia ter solução`);
    assert.ok(s.elevacaoDeg > anterior, `d=${d}: elevação ${s.elevacaoDeg} não cresceu`);
    assert.ok(s.elevacaoDeg < 45, 'ramo tenso fica abaixo de 45°');
    anterior = s.elevacaoDeg;
  }
});

test('vento: cauda/proa mexem no alcance, través gera deriva simétrica', () => {
  const mu = calibrarArrasto(268, 5608);
  const base = { distanciaM: 3000, deltaAltM: 0, v: 268, mu, modo: MODO.ALTO };
  const calmo = resolverComArrasto(base);
  const cauda = resolverComArrasto({ ...base, ventoLongitudinal: 10 });
  const proa = resolverComArrasto({ ...base, ventoLongitudinal: -10 });

  /* Vento de cauda leva o projétil mais longe, então para acertar a MESMA
   * distância no ramo alto é preciso subir a elevação (que encurta). */
  assert.ok(cauda.elevacaoDeg > calmo.elevacaoDeg, 'vento de cauda exige mais elevação');
  assert.ok(proa.elevacaoDeg < calmo.elevacaoDeg, 'vento de proa exige menos elevação');

  const esq = resolverComArrasto({ ...base, ventoTravessal: 10 });
  const dir = resolverComArrasto({ ...base, ventoTravessal: -10 });
  assert.ok(esq.derivaM > 1, 'vento da esquerda empurra para a direita');
  assert.ok(Math.abs(esq.derivaM + dir.derivaM) < 1e-6, 'deriva é simétrica');
  assert.ok(Math.abs(calmo.derivaM) < 1e-9, 'sem vento não há deriva');
});

test('arrasto: entradas inválidas falham explicitamente', () => {
  assert.equal(resolverComArrasto({ distanciaM: 1000, v: 0, mu: -1e-4 }).ok, false);
  assert.equal(resolverComArrasto({ distanciaM: 1000, v: 200, mu: 0 }).ok, false);
  assert.equal(resolverComArrasto({ distanciaM: 1000, v: 200, mu: 1e-4 }).ok, false);
  assert.equal(resolverComArrasto({ distanciaM: 0, v: 200, mu: -1e-4 }).ok, false);

  const fora = resolverComArrasto({ distanciaM: 50000, v: 268, mu: calibrarArrasto(268, 5608) });
  assert.equal(fora.ok, false);
  assert.match(fora.motivo, /fora de alcance/);
  assert.ok(fora.faltaM > 0, 'diz quanto falta de alcance');
});

test('integrador: conserva energia quando não há arrasto', () => {
  /* Com μ ≈ 0 a energia mecânica tem de se conservar ao longo do voo. */
  const v = 200, theta = Math.PI / 3;
  const { pts } = integrarTrajetoria({
    v, elevacaoRad: theta, mu: -1e-12, deltaAltM: 0, dt: 0.005
  });
  const E = (p) => 0.5 * p.v * p.v + G_PADRAO * p.y;
  const E0 = E(pts[0]);
  for (const p of pts) {
    assert.ok(Math.abs(E(p) - E0) / E0 < 1e-4, `energia variou: ${E(p)} vs ${E0}`);
  }
});

test('calibração de arrasto reproduz o alcance máximo publicado', () => {
  const casos = [[268, 5608], [70, 400], [247, 3490], [200, 3800], [318, 7200], [211, 4270]];
  for (const [v, rmax] of casos) {
    const mu = calibrarArrasto(v, rmax);
    assert.ok(mu < 0, `μ tem de ser negativo (v=${v})`);
    const probe = resolverComArrasto({ distanciaM: rmax * 0.5, deltaAltM: 0, v, mu });
    assert.ok(Math.abs(probe.alcanceMaxM - rmax) < 0.5,
      `v=${v}: alcance calculado ${probe.alcanceMaxM} vs publicado ${rmax}`);
  }
});

test('calibração degenera com honestidade quando o dado é impossível', () => {
  /* Alcance publicado maior que o do vácuo: nenhum arrasto explica. */
  const v = 200;
  const mu = calibrarArrasto(v, alcanceMaximoVacuo(v) * 1.5);
  assert.ok(mu < 0 && mu > -1e-6, 'devolve arrasto desprezível em vez de mentir');
});

/* ─────────────────── tabelas de armas ─────────────────── */

test('todos os sistemas têm cargas coerentes e calibráveis', () => {
  for (const [id, sis] of Object.entries(SISTEMAS)) {
    assert.ok(sis.cargas.length > 0, `${id}: sem cargas`);
    let vAnterior = 0, rAnterior = 0;
    for (const c of sis.cargas) {
      assert.ok(c.v0 > vAnterior, `${id} carga ${c.id}: v0 devia crescer com a carga`);
      assert.ok(c.alcanceMaxM > rAnterior, `${id} carga ${c.id}: alcance devia crescer`);
      assert.ok(c.alcanceMinM < c.alcanceMaxM, `${id} carga ${c.id}: mínimo ≥ máximo`);
      /* O alcance publicado tem de ser fisicamente possível — e com folga.
       * Um par (v₀, alcance) acima de ~98 % do vácuo implicaria um projétil
       * praticamente sem arrasto, o que denuncia dado errado e ainda deixa a
       * calibração sem margem numérica para trabalhar. */
      const limite = alcanceMaximoVacuo(c.v0, 0, sis.gRecomendado ?? G_PADRAO);
      assert.ok(c.alcanceMaxM < limite * 0.98,
        `${id} carga ${c.id}: alcance ${c.alcanceMaxM} m é ${(100 * c.alcanceMaxM / limite).toFixed(1)} % do vácuo (${limite.toFixed(0)} m) — implausível`);
      vAnterior = c.v0; rAnterior = c.alcanceMaxM;

      const mu = arrastoDaCarga(id, c.id);
      assert.ok(mu < 0 && Number.isFinite(mu), `${id} carga ${c.id}: μ inválido`);
    }
    assert.ok(sis.dispersaoBaseM > 0, `${id}: falta piso de dispersão`);
  }
});

test('arrastoDaCarga é memoizado e valida a entrada', () => {
  const a = arrastoDaCarga('m252_81mm', 4);
  const b = arrastoDaCarga('m252_81mm', 4);
  assert.equal(a, b);
  assert.throws(() => arrastoDaCarga('inexistente', 0), /desconhecido/);
  assert.throws(() => arrastoDaCarga('m252_81mm', 99), /não existe/);
});

test('listarSistemas devolve o resumo para a UI', () => {
  const l = listarSistemas();
  assert.ok(l.length >= 6);
  const mk6 = l.find((s) => s.id === 'mk6_82mm');
  assert.equal(mk6.jogo, true, 'o Mk6 é marcado como sistema de jogo');
  assert.equal(mk6.alcanceMaxM, 3800);
});

test('zona batida tem piso absoluto e cresce com a distância', () => {
  const perto = zonaBatida('m252_81mm', 100);
  const longe = zonaBatida('m252_81mm', 5000);
  assert.ok(perto.erroProvavelAlcanceM >= 5, 'não some a curta distância');
  assert.ok(longe.erroProvavelAlcanceM > perto.erroProvavelAlcanceM);
  /* Incerteza de posição entra em quadratura. */
  const comGps = zonaBatida('m252_81mm', 100, { erroPosicaoM: 30 });
  assert.ok(comGps.erroProvavelAlcanceM > perto.erroProvavelAlcanceM * 2);
});

/* ─────────────────── contrato de missão ─────────────────── */

test('normalizarPosicao aceita os três formatos', () => {
  assert.deepEqual(normalizarPosicao({ tipo: 'latlon', lat: 1, lon: 2, alt: 3 }),
    { tipo: 'geo', lat: 1, lon: 2, alt: 3 });
  const m = normalizarPosicao({ tipo: 'mgrs', valor: '31NEA1234567890', alt: 10 });
  assert.equal(m.tipo, 'geo');
  assert.equal(m.alt, 10);
  assert.deepEqual(normalizarPosicao({ tipo: 'local', x: 10, y: 20 }),
    { tipo: 'local', x: 10, y: 20, alt: 0 });
  const g = normalizarPosicao({ tipo: 'local', grid: '123456' });
  assert.equal(g.x, 12350, 'aceita a string de grid direto');

  assert.throws(() => normalizarPosicao(null), /ausente/);
  assert.throws(() => normalizarPosicao({ tipo: 'xyz' }), /desconhecido/);
  assert.throws(() => normalizarPosicao({ tipo: 'latlon', lat: 'x' }), /inválidos/);
});

test('componentesVento usa a convenção meteorológica (direção DE ONDE vem)', () => {
  /* Vento de 270° (oeste) atirando para leste (090°) = vento de CAUDA. */
  const cauda = componentesVento(10, 270, 90);
  assert.ok(cauda.longitudinal > 9.99, `esperado ~+10, veio ${cauda.longitudinal}`);
  /* Mesmo vento atirando para oeste = vento de PROA. */
  const proa = componentesVento(10, 270, 270);
  assert.ok(proa.longitudinal < -9.99);
  /* Atirando para o norte, vento de oeste é através, da esquerda. */
  const trav = componentesVento(10, 270, 0);
  assert.ok(Math.abs(trav.longitudinal) < 1e-9);
  assert.ok(trav.travessal > 9.99, 'vento de oeste empurra para a direita ao atirar ao norte');
  assert.deepEqual(componentesVento(0, 123, 45), { longitudinal: 0, travessal: 0 });
});

test('validarMissao pega os erros antes de calcular', () => {
  assert.deepEqual(validarMissao(null), ['pedido não é um objeto']);

  const erros = validarMissao({
    peca: { pos: { tipo: 'local', x: 0, y: 0 }, sistema: 'inexistente' },
    alvo: { pos: { tipo: 'latlon', lat: 1, lon: 1 } }
  });
  assert.ok(erros.some((e) => /desconhecido/.test(e)));
  assert.ok(erros.some((e) => /quadros diferentes/.test(e)),
    'misturar quadro geográfico com local tem de falhar explicitamente');

  assert.ok(validarMissao({ schema: 'outra/9', peca: {}, alvo: {} })
    .some((e) => /schema/.test(e)));

  assert.deepEqual(validarMissao({
    schema: SCHEMA_PEDIDO,
    peca: { pos: { tipo: 'local', x: 0, y: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 1000, y: 0 } }
  }), []);
});

test('missão completa em quadro geográfico', () => {
  const r = resolverMissao({
    schema: SCHEMA_PEDIDO,
    id: 'FM-TESTE',
    peca: { pos: { tipo: 'mgrs', valor: '23K PQ 83477 60685', alt: 30 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'mgrs', valor: '23K PQ 86000 63000', alt: 120 }, id: 'TGT-ALFA' },
    ambiente: { ventoVelocidadeMs: 8, ventoDirecaoDeg: 270, declinacaoMagDeg: -21.5 },
    opcoes: { modo: 'alto', sistemaMil: 'nato', solver: 'arrasto' }
  });

  assert.equal(r.schema, SCHEMA_RESPOSTA);
  assert.equal(r.ok, true);
  assert.equal(r.id, 'FM-TESTE');
  assert.equal(r.alvoId, 'TGT-ALFA');
  assert.equal(r.geometria.quadro, 'geo');
  assert.equal(r.geometria.deltaAltM, 90);
  assert.equal(r.geometria.zonaUTM, 23);

  /* Azimute de grade e mils têm de ser consistentes entre si. */
  assert.ok(Math.abs(r.azimute.gradeMil - radToMil((r.azimute.gradeDeg * Math.PI) / 180)) < 1e-9);
  /* Magnético = verdadeiro − declinação. */
  assert.ok(Math.abs(r.azimute.magneticoDeg - (r.azimute.verdadeiroDeg + 21.5)) < 1e-9);
  assert.ok(r.azimute.convergenciaDeg !== null);

  assert.ok(r.solucoes.length > 0);
  assert.equal(r.solucoes[0].preferida, true, 'a primeira é a preferida');
  for (const s of r.solucoes) {
    assert.ok(s.elevacaoMil > 0 && s.elevacaoMil < 1600, 'elevação dentro de 0–1600 mils');
    assert.ok(s.tempoVooS > 0);
    assert.ok(s.apiceAltitudeM > s.apiceM, 'apogeu absoluto inclui a altitude da peça');
    assert.ok(Math.abs(s.residuoM) < 0.01);
    assert.notEqual(s.derivaVentoM, 0, 'com vento de través tem de haver deriva');
    assert.ok(Number.isFinite(s.correcaoDirecaoMil));
  }
  assert.equal(r.motor.solver, 'arrasto');
  assert.equal(r.seguranca.avaliado, true);
});

test('missão em grade local estilo Arma 3', () => {
  const r = resolverMissao({
    peca: { pos: { tipo: 'local', grid: '123456', alt: 50 }, sistema: 'mk6_82mm' },
    alvo: { pos: { tipo: 'local', grid: '135470', alt: 180 }, id: 'TGT-BRAVO' }
  });
  assert.equal(r.ok, true);
  assert.equal(r.geometria.quadro, 'local');
  assert.equal(r.geometria.deltaAltM, 130);
  assert.equal(r.geometria.dE, 1200);
  assert.equal(r.geometria.dN, 1400);
  /* Sem quadro geográfico não existe norte verdadeiro nem magnético. */
  assert.equal(r.azimute.verdadeiroDeg, null);
  assert.equal(r.azimute.magneticoDeg, null);
  assert.equal(r.azimute.convergenciaDeg, null);
  assert.equal(r.motor.gravidade, 9.81, 'o Mk6 usa a gravidade do Arma 3');
});

test('ranqueamento prefere a menor carga que alcança com folga', () => {
  /* 800 m com o M252: as cargas 1 e 2 alcançam; a 1 fica no limite. */
  const r = resolverMissao({
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 800, y: 0, alt: 0 } }
  });
  assert.equal(r.ok, true);
  const pref = r.solucoes.find((s) => s.preferida);
  assert.ok(pref.folgaRel >= 0.10, 'a preferida tem folga de alcance');
  assert.ok(!pref.abaixoDoMinimo, 'a preferida respeita o alcance mínimo');
  /* Nenhuma carga com folga suficiente e menor que a preferida foi ignorada. */
  const melhores = r.solucoes.filter((s) => !s.abaixoDoMinimo && s.folgaRel >= 0.10);
  assert.equal(pref.carga, Math.min(...melhores.map((s) => s.carga)));
});

test('alvo fora de alcance devolve ok:false com o motivo de cada carga', () => {
  const r = resolverMissao({
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm224_60mm' },
    alvo: { pos: { tipo: 'local', x: 9000, y: 0, alt: 0 } }
  });
  assert.equal(r.ok, false);
  assert.equal(r.solucoes.length, 0);
  assert.equal(r.avisos.length, SISTEMAS.m224_60mm.cargas.length);
  assert.ok(r.avisos.every((a) => /fora de alcance/.test(a)));
});

test('segurança: danger close usa as posições amigas, não a distância da peça', () => {
  const base = {
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 3000, y: 0, alt: 0 } }
  };

  /* Sem amigos informados: só a peça é considerada, e ela está longe. */
  const sem = resolverMissao(base);
  assert.equal(sem.seguranca.avaliado, true);
  assert.equal(sem.seguranca.dentroDaZona, false);
  assert.match(sem.seguranca.motivo, /nenhum amigo/);
  assert.ok(!sem.avisos.some((a) => /DANGER CLOSE/.test(a)));

  /* Amigo colado no alvo: tem de disparar o alerta. */
  const com = resolverMissao({
    ...base,
    amigos: [{ id: 'ALFA-2', pos: { tipo: 'local', x: 3020, y: 10, alt: 0 } }]
  });
  assert.ok(com.avisos.some((a) => /DANGER CLOSE/.test(a)), 'devia alertar');
  assert.equal(com.seguranca.dentroDaZona, true);
  assert.equal(com.seguranca.maisProximo.id, 'ALFA-2');

  /* Amigo perto mas fora da zona: alerta mais brando. */
  const atencao = resolverMissao({
    ...base,
    amigos: [{ id: 'BRAVO', pos: { tipo: 'local', x: 3000, y: 150, alt: 0 } }]
  });
  assert.ok(atencao.avisos.some((a) => /ATENÇÃO/.test(a)));
});

test('missão inválida não explode: devolve erros estruturados', () => {
  const r = resolverMissao({ peca: {}, alvo: {} });
  assert.equal(r.ok, false);
  assert.equal(r.schema, SCHEMA_RESPOSTA);
  assert.ok(r.erros.length > 0);
});

test('adaptador HTTP mapeia sucesso, erro de domínio e entrada malformada', () => {
  const ok = tratarRequisicao({
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 2000, y: 0, alt: 0 } }
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.ok, true);

  const foraDeAlcance = tratarRequisicao({
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 99999, y: 0, alt: 0 } }
  });
  assert.equal(foraDeAlcance.status, 422, 'sem solução é 422, não 500');

  const ruim = tratarRequisicao({ peca: {}, alvo: {} });
  assert.equal(ruim.status, 422);
  assert.equal(ruim.body.ok, false);
});

test('a resposta sobrevive a JSON.stringify → JSON.parse', () => {
  /* O contrato só vale se atravessar a rede sem perder nada. */
  const r = resolverMissao({
    peca: { pos: { tipo: 'local', x: 0, y: 0, alt: 0 }, sistema: 'm252_81mm' },
    alvo: { pos: { tipo: 'local', x: 2000, y: 0, alt: 0 } }
  });
  const volta = JSON.parse(JSON.stringify(r));
  assert.deepEqual(volta.solucoes[0].elevacaoMil, r.solucoes[0].elevacaoMil);
  assert.equal(volta.schema, SCHEMA_RESPOSTA);
  assert.ok(!JSON.stringify(r).includes('trajetoria'),
    'a polilinha da trajetória não entra na resposta (payload enxuto)');
});
