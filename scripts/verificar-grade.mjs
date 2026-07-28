#!/usr/bin/env node
/**
 * Confere o conversor de grade (src/utils/arma3-grade.js) contra a base de
 * terrenos gerada — TODOS os mundos, não um exemplo escolhido a dedo.
 *
 *   node scripts/verificar-grade.mjs
 *
 * Nada aqui compara com número digitado de memória. São propriedades
 * estruturais, que valem em qualquer mundo com qualquer convenção de grade:
 *
 *   1. ida-e-volta: grade → metros → grade devolve a grade original
 *   2. o centro da célula de northing 0 é offsetY + passoY/2 — o SINAL do
 *      passo decide se isso é a borda norte (vanilla) ou a sul (Chernobyl),
 *      e é isso que impede o erro de 180° no azimute
 *   3. anti-simetria: az(a,b) e az(b,a) diferem exatamente 180°
 *   4. célula vizinha a leste dista exatamente |passoX| e tem azimute 90°
 *   5. as voltas fecham: 90° = 1600 mil NATO; 360° = 2π·1000 MRAD
 *
 * Sai com código 1 se algo falhar, então serve em CI.
 */

import { A3TER } from '../src/data/arma3-terrenos.js';
import {
  azimuteGrau, distanciaM, gradeParaMetros, grauParaMilNato, grauParaMrad,
  metrosParaGrade, parseGrade,
} from '../src/utils/arma3-grade.js';
import { MIL_NATO_POR_VOLTA, MRAD_POR_VOLTA } from '../src/utils/arma3-balistica.js';

const falhas = [];
const perto = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// ── 5. constantes fecham a volta ─────────────────────────────────────────
if (!perto(grauParaMilNato(90), MIL_NATO_POR_VOLTA / 4)) {
  falhas.push(`90° deu ${grauParaMilNato(90)} mil NATO, esperado ${MIL_NATO_POR_VOLTA / 4}`);
}
if (!perto(grauParaMrad(360), MRAD_POR_VOLTA)) {
  falhas.push(`360° deu ${grauParaMrad(360)} MRAD, esperado ${MRAD_POR_VOLTA}`);
}

// ── parse: casos degenerados nunca viram coordenada ──────────────────────
for (const ruim of ['', '123', '12345', 'abc', '123456789012']) {
  if (parseGrade(ruim) !== null) falhas.push(`parseGrade("${ruim}") devia ser null`);
}

const comGrade = A3TER.filter((t) => t.grade);
if (!comGrade.length) falhas.push('nenhum terreno com grade na base');

for (const t of comGrade) {
  const g = t.grade;
  const rot = `${t.classe}`;

  // células de teste espalhadas (0, 1, meio, perto do fim do formato)
  const max = 10 ** g.digitos - 1;
  const celulas = [0, 1, Math.floor(max / 2), max - 1];

  // ── 1. ida-e-volta em pares (e, n) ─────────────────────────────────────
  for (const e of celulas) {
    for (const n of celulas) {
      const txt = String(e).padStart(g.digitos, '0') + String(n).padStart(g.digitos, '0');
      const m = gradeParaMetros(txt, g);
      if (!m) { falhas.push(`${rot}: gradeParaMetros(${txt}) deu null`); continue; }
      const volta = metrosParaGrade(m.x, m.y, g);
      if (volta !== txt) {
        falhas.push(`${rot}: ida-e-volta quebrou — ${txt} → ${volta}`);
      }
    }
  }

  // ── 2. o sinal do passo aponta o norte certo ───────────────────────────
  const n0 = gradeParaMetros('0'.repeat(g.digitos * 2), g);
  const esperadoY = g.offsetY + 0.5 * g.passoY;
  if (!perto(n0.y, esperadoY, 1e-9)) {
    falhas.push(`${rot}: célula 0 de northing em y=${n0.y}, esperado ${esperadoY}`);
  }

  // ── 3 e 4. azimute: anti-simetria e vizinho a leste ────────────────────
  const meio = Math.floor(max / 2);
  const a = gradeParaMetros(
    String(meio).padStart(g.digitos, '0') + String(meio).padStart(g.digitos, '0'), g);
  const b = gradeParaMetros(
    String(meio + 1).padStart(g.digitos, '0') + String(meio).padStart(g.digitos, '0'), g);
  const ida = azimuteGrau(a, b);
  const voltaAz = azimuteGrau(b, a);
  const dif = ((ida - voltaAz) % 360 + 360) % 360;
  if (!perto(dif, 180, 1e-9)) {
    falhas.push(`${rot}: az ida ${ida}° e volta ${voltaAz}° não diferem 180°`);
  }
  if (!perto(ida, 90, 1e-9)) {
    falhas.push(`${rot}: vizinho a leste deu azimute ${ida}°, esperado 90°`);
  }
  if (!perto(distanciaM(a, b), Math.abs(g.passoX), 1e-6)) {
    falhas.push(`${rot}: vizinho a leste dista ${distanciaM(a, b)} m, esperado ${Math.abs(g.passoX)}`);
  }
}

console.log(`terrenos verificados: ${comGrade.length} (de ${A3TER.length} na base)`);
const desce = comGrade.filter((t) => t.grade.passoY < 0).length;
console.log(`  northing pra baixo (passoY<0): ${desce}`);
console.log(`  northing pra cima  (passoY>0): ${comGrade.length - desce}`);

if (falhas.length) {
  console.error(`\n${falhas.length} falha(s):`);
  for (const f of falhas.slice(0, 25)) console.error('  -', f);
  process.exit(1);
}
console.log('\nok — ida-e-volta, sinal do norte, anti-simetria e vizinhança batem em todos.');
