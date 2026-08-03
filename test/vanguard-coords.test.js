/**
 * Testes do motor de coordenadas.
 *
 * Filosofia destes testes: **não** conferir contra números que eu digitei de
 * memória (isso só testa a minha memória). Cada asserção aqui é ancorada em
 * uma de três coisas verificáveis:
 *   a) constante geodésica publicada (quarto de meridiano WGS84),
 *   b) integração numérica independente da mesma grandeza,
 *   c) propriedade estrutural que o sistema tem que satisfazer
 *      (ida-e-volta, simetria, regras documentadas do MGRS).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  latLonParaUTM, utmParaLatLon, latLonParaMGRS, mgrsParaLatLon, parseMGRS,
  fusoDe, bandaDe, meridianoCentral, gridVector, convergenciaMeridianos
} from '../src/utils/vanguard/mgrs.js';
import { WGS84, haversine, vincentyInverse, vincentyDirect, R_TERRA } from '../src/utils/vanguard/geo.js';
import { radToMil, milToRad, degToMil, milToDeg, deltaDeg, normDeg, milsPorTamanho, distanciaPorMils } from '../src/utils/vanguard/angles.js';
import { localParaGrid, gridParaLocal, vetorLocal, criarQuadro, TERRENOS } from '../src/utils/vanguard/gridref.js';

/* Metros por grau, para converter erro angular em erro linear. */
const metros = (dLat, dLon, lat) =>
  Math.hypot(dLat * 111320, dLon * 111320 * Math.cos((lat * Math.PI) / 180));

test('arco meridiano bate com a constante publicada do WGS84', () => {
  const { a, e2 } = WGS84;
  const phi = Math.PI / 2;
  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256) * phi -
    (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi) +
    (15 * e2 * e2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi) -
    (35 * e2 ** 3 / 3072) * Math.sin(6 * phi)
  );
  /* Quarto de meridiano WGS84 = 10 001 965,729 m (valor publicado). */
  assert.ok(Math.abs(M - 10001965.729) < 0.01, `quarto de meridiano = ${M}`);
});

test('northing UTM no meridiano central = k0 × arco meridiano (integração numérica)', () => {
  const { a, e2 } = WGS84;
  /* Integra dM = a(1−e²)/(1−e²sin²t)^1.5 dt por Simpson — independente da série. */
  const arco = (phiEnd) => {
    const n = 100000, h = phiEnd / n;
    const f = (t) => (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(t) ** 2, 1.5);
    let s = 0;
    for (let i = 0; i <= n; i++) s += ((i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2)) * f(i * h);
    return (s * h) / 3;
  };
  /* Fuso 18 (MC −75°): longe das exceções da Noruega e de Svalbard, que
   * deslocariam o meridiano central e invalidariam a comparação. */
  const mc = meridianoCentral(18);
  for (const lat of [10, 30, 45, 60, 75]) {
    const u = latLonParaUTM(lat, mc);
    assert.equal(u.zona, 18, 'nenhuma exceção de fuso deve se aplicar aqui');
    const esperado = 0.9996 * arco((lat * Math.PI) / 180);
    assert.ok(Math.abs(u.northing - esperado) < 0.001,
      `lat ${lat}: northing ${u.northing} vs ${esperado}`);
    assert.ok(Math.abs(u.easting - 500000) < 1e-6, 'easting no MC deve ser 500000');
  }
});

test('UTM ida-e-volta fecha em milímetros no mundo todo', () => {
  let pior = 0;
  for (let lat = -79; lat <= 83; lat += 3.7) {
    for (let lon = -179; lon <= 179; lon += 11.3) {
      const u = latLonParaUTM(lat, lon);
      const b = utmParaLatLon(u);
      pior = Math.max(pior, metros(b.lat - lat, b.lon - lon, lat));
    }
  }
  assert.ok(pior < 0.05, `pior erro de ida-e-volta UTM: ${pior} m`);
});

test('MGRS ida-e-volta fica dentro da célula nomeada', () => {
  for (const precisao of [1, 2, 3, 4, 5]) {
    const celula = 10 ** (5 - precisao);
    let pior = 0;
    for (let lat = -75; lat <= 80; lat += 7.3) {
      for (let lon = -175; lon <= 175; lon += 23.1) {
        const s = latLonParaMGRS(lat, lon, precisao);
        const b = mgrsParaLatLon(s, { canto: true });
        pior = Math.max(pior, metros(b.lat - lat, b.lon - lon, lat));
      }
    }
    /* O canto SO da célula está no máximo a √2 × lado do ponto original. */
    assert.ok(pior <= celula * Math.SQRT2 + 0.05,
      `precisão ${precisao} (célula ${celula} m): pior erro ${pior} m`);
  }
});

test('âncora conhecida: equador no meridiano central do fuso 31 = 31NEA0000000000', () => {
  assert.equal(latLonParaMGRS(0, 3, 5), '31NEA0000000000');
  const p = parseMGRS('31NEA0000000000');
  assert.equal(p.zona, 31);
  assert.equal(p.banda, 'N');
  assert.equal(p.easting, 500000);
  assert.equal(p.northing, 0);
});

test('MGRS respeita as regras estruturais documentadas', () => {
  /* Conjunto de colunas repete a cada 3 fusos. */
  const col = (z) => latLonParaMGRS(0, meridianoCentral(z), 1)[String(z).length + 1];
  assert.equal(col(31), col(34), 'fusos 31 e 34 usam o mesmo conjunto de colunas');
  assert.equal(col(32), col(35), 'fusos 32 e 35 usam o mesmo conjunto de colunas');
  assert.notEqual(col(31), col(32), 'fusos vizinhos usam conjuntos diferentes');

  /* Fusos pares deslocam a linha em 5 letras — logo, na mesma latitude,
   * fusos vizinhos não repetem a letra de linha. */
  const linha = (z) => {
    const s = latLonParaMGRS(10, meridianoCentral(z), 1);
    return s[String(z).length + 2];
  };
  assert.notEqual(linha(31), linha(32), 'fusos vizinhos devem diferir na letra de linha');

  /* Nem I nem O aparecem em lugar nenhum. */
  for (let z = 1; z <= 60; z += 7) {
    for (const lat of [-70, -20, 0, 20, 70]) {
      const s = latLonParaMGRS(lat, meridianoCentral(z), 3);
      assert.ok(!/[IO]/.test(s), `"${s}" contém I ou O`);
    }
  }
});

test('exceções de fuso da Noruega e de Svalbard', () => {
  assert.equal(fusoDe(60.39, 5.32), 32, 'Bergen cai no fuso 32 alargado');
  assert.equal(fusoDe(55.0, 5.32), 31, 'abaixo de 56° vale a regra normal');
  assert.equal(fusoDe(78.22, 15.63), 33, 'Svalbard: 9°–21° cai no fuso 33');
  assert.equal(fusoDe(78.22, 25.0), 35, 'Svalbard: 21°–33° cai no fuso 35');
  assert.equal(fusoDe(70.0, 15.63), 33, 'abaixo de 72° vale a regra normal');
});

test('bandas de latitude', () => {
  assert.equal(bandaDe(0), 'N');
  assert.equal(bandaDe(-0.001), 'M');
  assert.equal(bandaDe(-80), 'C');
  assert.equal(bandaDe(83.9), 'X');
  assert.equal(bandaDe(72), 'X', 'a banda X é dupla (72°–84°)');
  assert.equal(bandaDe(85), null, 'fora da cobertura UTM');
  assert.equal(bandaDe(-81), null);
});

test('MGRS aceita precisões variadas e rejeita entrada inválida', () => {
  assert.equal(parseMGRS('31N EA 12 67').precisao, 2);
  assert.equal(parseMGRS('31NEA1234567890').precisao, 5);
  assert.equal(parseMGRS('31nea123678').tamanhoCelulaM, 1000);
  assert.equal(parseMGRS('31NEA').precisao, 0, 'só o quadrado de 100 km é válido');

  assert.throws(() => parseMGRS('31NEA123'), /ímpar/);
  assert.throws(() => parseMGRS('31NIA1234'), /inválido/i, 'letra I não existe no MGRS');
  assert.throws(() => parseMGRS('61NEA1234'), /1\.\.60/);
  assert.throws(() => parseMGRS('lixo'), /inválido/i);
  /* Coluna que não pertence ao conjunto do fuso tem que falhar, não chutar. */
  assert.throws(() => parseMGRS('31NSA1234'), /não pertence/);
});

test('latLonParaMGRS valida a precisão pedida', () => {
  assert.throws(() => latLonParaMGRS(0, 0, 0), /1 a 5/);
  assert.throws(() => latLonParaMGRS(0, 0, 6), /1 a 5/);
  assert.throws(() => latLonParaMGRS(0, 0, 2.5), /1 a 5/);
  assert.throws(() => latLonParaUTM(85, 0), /fora da cobertura/);
});

test('MGRS por padrão devolve o CENTRO da célula', () => {
  const centro = mgrsParaLatLon('31NEA1234567890');
  const canto = mgrsParaLatLon('31NEA1234567890', { canto: true });
  assert.ok(centro.lat > canto.lat && centro.lon > canto.lon,
    'o centro fica a nordeste do canto sudoeste');
});

test('Vincenty concorda com a haversine na ordem de grandeza e é mais preciso', () => {
  const a = { lat: -22.95, lon: -43.21 };
  const b = { lat: -22.90, lon: -43.15 };
  const v = vincentyInverse(a, b);
  const h = haversine(a, b);
  assert.ok(Math.abs(v.distancia - h) / v.distancia < 0.01, 'diferença < 1 %');

  /* Ida-e-volta direto/inverso: andar a distância no azimute devolve o destino. */
  const chegada = vincentyDirect(a, v.azimuteInicial, v.distancia);
  assert.ok(metros(chegada.lat - b.lat, chegada.lon - b.lon, b.lat) < 0.001,
    'Vincenty direto desfaz o inverso');
});

test('Vincenty: casos degenerados', () => {
  const p = { lat: 10, lon: 20 };
  assert.equal(vincentyInverse(p, p).distancia, 0, 'pontos coincidentes');
  /* Um quarto de volta pelo equador ≈ 1/4 da circunferência equatorial. */
  const q = vincentyInverse({ lat: 0, lon: 0 }, { lat: 0, lon: 90 });
  const esperado = (2 * Math.PI * WGS84.a) / 4;
  assert.ok(Math.abs(q.distancia - esperado) < 1, `equador: ${q.distancia} vs ${esperado}`);
  assert.ok(Math.abs(q.azimuteInicial - 90) < 1e-9, 'azimute leste no equador');
});

test('convergência de meridianos bate com a medida direta na projeção', () => {
  for (const [lat, lon] of [[40, -72], [-25, -48], [60, 8], [-60, 150]]) {
    const p1 = latLonParaUTM(lat, lon);
    const p2 = latLonParaUTM(lat + 0.0001, lon);
    const medida = (Math.atan2(-(p2.easting - p1.easting), p2.northing - p1.northing) * 180) / Math.PI;
    const formula = convergenciaMeridianos(lat, lon);
    assert.ok(Math.abs(medida - formula) < 1e-4,
      `lat ${lat} lon ${lon}: medida ${medida} vs fórmula ${formula}`);
  }
  assert.ok(Math.abs(convergenciaMeridianos(45, meridianoCentral(fusoDe(45, 3)))) < 1e-9,
    'convergência é zero no meridiano central');
});

test('gridVector: geometria básica e reprojeção para o fuso da peça', () => {
  const peca = { lat: -22.95, lon: -43.21, alt: 30 };
  const alvo = { lat: -22.94, lon: -43.20, alt: 120 };
  const v = gridVector(peca, alvo);

  assert.equal(v.deltaAltM, 90);
  assert.ok(v.dE > 0 && v.dN > 0, 'alvo a nordeste');
  assert.ok(v.azimuteGradeDeg > 0 && v.azimuteGradeDeg < 90);
  assert.ok(Math.abs(v.distanciaInclinadaM - Math.hypot(v.distanciaHorizontalM, 90)) < 1e-6);
  /* Distância de grade e de terreno diferem só pelo fator de escala. */
  assert.ok(Math.abs(v.distanciaGradeM / v.fatorEscala - v.distanciaHorizontalM) < 1e-6);

  /* Alvo do outro lado da linha de fuso: sem reprojeção daria centenas de km. */
  const oeste = { lat: 0, lon: 5.9, alt: 0 };
  const leste = { lat: 0, lon: 6.1, alt: 0 };
  const cruzando = gridVector(oeste, leste);
  const distReal = vincentyInverse(oeste, leste).distancia;
  assert.ok(Math.abs(cruzando.distanciaHorizontalM - distReal) < 5,
    `cruzando fuso: ${cruzando.distanciaHorizontalM} vs real ${distReal}`);
});

test('azimute de grade ≈ azimute verdadeiro + convergência', () => {
  const peca = { lat: 45, lon: -70, alt: 0 };
  const alvo = { lat: 45.02, lon: -69.97, alt: 0 };
  const v = gridVector(peca, alvo);
  const verdadeiro = vincentyInverse(peca, alvo).azimuteInicial;
  const conv = convergenciaMeridianos(peca.lat, peca.lon);
  assert.ok(Math.abs(normDeg(v.azimuteGradeDeg + conv) - verdadeiro) < 0.01,
    `grade ${v.azimuteGradeDeg} + conv ${conv} vs verdadeiro ${verdadeiro}`);
});

/* ─────────────────── ângulos ─────────────────── */

test('conversões de ângulo e a diferença entre mil NATO e MRAD', () => {
  assert.ok(Math.abs(radToMil(2 * Math.PI, 'nato') - 6400) < 1e-9);
  assert.ok(Math.abs(radToMil(2 * Math.PI, 'mrad') - 6283.185307) < 1e-5);
  assert.ok(Math.abs(radToMil(2 * Math.PI, 'warsaw') - 6000) < 1e-9);
  assert.ok(Math.abs(radToMil(0.001, 'mrad') - 1) < 1e-12, '1 mrad = 0,001 rad por definição');

  assert.ok(Math.abs(degToMil(90, 'nato') - 1600) < 1e-9);
  assert.ok(Math.abs(milToDeg(1600, 'nato') - 90) < 1e-9);
  for (const s of ['nato', 'mrad', 'warsaw', 'swedish']) {
    assert.ok(Math.abs(milToRad(radToMil(1.234, s), s) - 1.234) < 1e-12, `ida-e-volta ${s}`);
  }
  assert.throws(() => radToMil(1, 'inexistente'), /desconhecido/);
});

test('deltaDeg dá a menor volta, com sinal', () => {
  assert.equal(deltaDeg(350, 10), 20);
  assert.equal(deltaDeg(10, 350), -20);
  assert.equal(deltaDeg(0, 180), 180);
  assert.equal(deltaDeg(0, 181), -179);
  assert.equal(normDeg(-90), 270);
});

test('telemetria por retícula: mils ⇄ distância', () => {
  /* Regra prática: alvo de 1,8 m a 1000 m ocupa ~1,8 mrad. */
  const mils = milsPorTamanho(1.8, 1000, 'mrad');
  assert.ok(Math.abs(mils - 1.8) < 0.01, `${mils} mrad`);
  assert.ok(Math.abs(distanciaPorMils(1.8, mils, 'mrad') - 1000) < 0.01);
});

/* ─────────────────── grade local ─────────────────── */

test('grade local estilo Arma: formata e interpreta', () => {
  assert.equal(localParaGrid(12345, 6789, 3), '123067');
  assert.equal(localParaGrid(12345, 6789, 4), '12340678');
  assert.equal(localParaGrid(12345, 6789, 3, true), '123 067');

  const g = gridParaLocal('123456', { canto: true });
  assert.equal(g.x, 12300);
  assert.equal(g.y, 45600);
  assert.equal(g.tamanhoCelulaM, 100);

  const c = gridParaLocal('123456');
  assert.equal(c.x, 12350, 'por padrão devolve o centro da célula');
  assert.equal(c.y, 45650);

  assert.throws(() => gridParaLocal('12345'), /ímpar/);
  assert.throws(() => gridParaLocal('12'), /4 a 10/);
  assert.throws(() => gridParaLocal('abc123'), /inválido/i);
  assert.throws(() => localParaGrid(-1, 0, 3), /fora do mapa/);
  assert.throws(() => localParaGrid(0, 0, 9), /2\.\.5/);
});

test('grade local: ida-e-volta preserva a célula', () => {
  for (const digitos of [2, 3, 4, 5]) {
    const passo = 10 ** (5 - digitos);
    for (const [x, y] of [[0, 0], [1234, 5678], [30719, 30719], [99999, 12345]]) {
      const s = localParaGrid(x, y, digitos);
      const b = gridParaLocal(s, { canto: true });
      assert.ok(x - b.x >= 0 && x - b.x < passo, `x ${x} dígitos ${digitos}`);
      assert.ok(y - b.y >= 0 && y - b.y < passo, `y ${y} dígitos ${digitos}`);
    }
  }
});

test('vetorLocal: azimutes cardeais', () => {
  const o = { x: 1000, y: 1000, alt: 0 };
  assert.equal(vetorLocal(o, { x: 1000, y: 2000 }).azimuteGradeDeg, 0);   // norte
  assert.equal(vetorLocal(o, { x: 2000, y: 1000 }).azimuteGradeDeg, 90);  // leste
  assert.equal(vetorLocal(o, { x: 1000, y: 0 }).azimuteGradeDeg, 180);    // sul
  assert.equal(vetorLocal(o, { x: 0, y: 1000 }).azimuteGradeDeg, 270);    // oeste
  const d = vetorLocal(o, { x: 1300, y: 1400, alt: 50 });
  assert.equal(d.distanciaHorizontalM, 500);
  assert.equal(d.deltaAltM, 50);
});

test('quadro local amarrado ao mundo real fecha a ida-e-volta', () => {
  const q = criarQuadro({ ancoraLat: -22.95, ancoraLon: -43.21, tamanhoM: 30720, nome: 'TESTE' });
  for (const [x, y] of [[0, 0], [15000, 15000], [30720, 30720], [1234, 28000]]) {
    const geo = q.paraLatLon(x, y);
    const volta = q.paraLocal(geo.lat, geo.lon);
    assert.ok(Math.abs(volta.x - x) < 0.01 && Math.abs(volta.y - y) < 0.01,
      `(${x},${y}) → (${volta.x},${volta.y})`);
  }
  assert.ok(q.dentro(100, 100));
  assert.ok(!q.dentro(-1, 100));
  assert.ok(!q.dentro(100, 40000));
});

test('terrenos conhecidos têm tamanho e âncora coerentes', () => {
  for (const [id, t] of Object.entries(TERRENOS)) {
    assert.ok(t.tamanhoM > 0 && t.tamanhoM <= 100000, `${id}: tamanho fora do razoável`);
    assert.ok(t.ancora.lat >= -90 && t.ancora.lat <= 90, `${id}: latitude inválida`);
    assert.ok(t.ancora.lon >= -180 && t.ancora.lon <= 180, `${id}: longitude inválida`);
    assert.ok(typeof t.refReal === 'string' && t.refReal.length > 0, `${id}: falta refReal`);
  }
  assert.equal(TERRENOS.altis.tamanhoM, 30720);
  assert.equal(TERRENOS.stratis.tamanhoM, 8192);
});
