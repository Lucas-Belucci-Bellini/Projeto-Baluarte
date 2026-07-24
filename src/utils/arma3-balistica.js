/**
 * Calculadora de balística do Arma 3 — o "orgulho" da wiki (#398).
 *
 * Implementa o MODELO DE ARRASTO REAL do engine (Real Virtuality): cada
 * projétil desacelera com força proporcional a `airFriction × v²` na direção
 * da velocidade RELATIVA AO AR (por isso vento entra como velocidade do ar),
 * mais gravidade 9.81 m/s². Integração numérica por passos de 2 ms.
 *
 * Não é aproximação de fórmula fechada — é a MESMA equação que o jogo resolve
 * (airFriction + initSpeed do config). O ACE Advanced Ballistics acrescenta
 * coeficiente balístico G1/G7, spin drift e Coriolis; começamos exatos no
 * vanilla e evoluímos.
 */

const G = 9.81;

/* airFriction de REFERÊNCIA por família de calibre (negativo = arrasto).
 * O valor EXATO por arma vem da extração local dos PBOs (#398); estes são os
 * de referência pra família, coerentes com o alcance observado no jogo. */
export const AIR_FRICTION_REF = {
  '9x21mm': -0.0018,
  '.45 ACP': -0.0025,
  '5.56mm': -0.00114,
  '5.8mm': -0.0011,
  '6.5mm': -0.00075,
  '7.62mm': -0.0009,
  '7.62x39mm': -0.00125,
  '9.3mm': -0.00055,
  '.338': -0.00036,
  '12.7x54mm': -0.0016,
  '12.7mm': -0.0005
};

/* Integra a trajetória do projétil.
 *  initSpeed (m/s), airFriction (<0), angleRad (elevação do cano),
 *  maxDist (m, até onde integrar), ventoLateral (m/s, +direita), passo dt. */
function integrar(initSpeed, airFriction, angleRad, maxDist, ventoLateral = 0) {
  const dt = 0.002;
  let x = 0, y = 0, z = 0;
  let vx = initSpeed * Math.cos(angleRad);
  let vy = initSpeed * Math.sin(angleRad);
  let vz = 0;
  let t = 0;
  const pts = [{ x: 0, y: 0, z: 0, t: 0, v: initSpeed }];
  /* integra até passar de maxDist (ou cair demais / tempo estourar) */
  while (x < maxDist && t < 30 && y > -1000) {
    const relvz = vz - ventoLateral;               // velocidade relativa ao ar (lateral)
    const relSpeed = Math.hypot(vx, vy, relvz);
    const k = airFriction * relSpeed;              // fator de arrasto (negativo)
    const ax = k * vx;
    const ay = k * vy - G;
    const az = k * relvz;
    vx += ax * dt; vy += ay * dt; vz += az * dt;
    x += vx * dt; y += vy * dt; z += vz * dt;
    t += dt;
    pts.push({ x, y, z, t, v: Math.hypot(vx, vy, vz) });
  }
  return pts;
}

/* valor de y (altura) na distância d, interpolando entre amostras */
function alturaEm(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].x >= d) {
      const a = pts[i - 1], b = pts[i];
      const f = (d - a.x) / (b.x - a.x || 1);
      return {
        y: a.y + (b.y - a.y) * f,
        z: a.z + (b.z - a.z) * f,
        t: a.t + (b.t - a.t) * f,
        v: a.v + (b.v - a.v) * f
      };
    }
  }
  const last = pts[pts.length - 1];
  return { y: last.y, z: last.z, t: last.t, v: last.v };
}

/* Ângulo de elevação (super-elevação) que ZERA a mira na distância `zero`:
 * bisseção — no ângulo 0 a bala já caiu (y<0); subindo o ângulo, y(zero) cresce. */
function anguloDeZero(initSpeed, airFriction, zero) {
  let lo = 0, hi = 0.15; // rad (~8.6°) cobre calibres lentos a longas distâncias
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const pts = integrar(initSpeed, airFriction, mid, zero + 5);
    const h = alturaEm(pts, zero).y;
    if (h > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Resolve o tiro. Entrada:
 *   initSpeed (m/s), airFriction (<0), zero (m, distância de zeragem),
 *   alvo (m, distância do alvo), vento (m/s lateral, +direita, opcional).
 * Saída: queda no alvo (cm e mils), tempo de voo, velocidade e energia
 *   residual, deriva por vento e a polilinha da trajetória (pra desenhar).
 */
export function resolverTiro({ initSpeed, airFriction, zero, alvo, vento = 0 }) {
  const ang = anguloDeZero(initSpeed, airFriction, zero);
  const maxDist = Math.max(alvo, zero) * 1.08 + 10;
  const pts = integrar(initSpeed, airFriction, ang, maxDist, vento);
  const noAlvo = alturaEm(pts, alvo);
  const quedaM = noAlvo.y;                      // + = acima da mira; − = abaixo
  const mils = alvo > 0 ? (quedaM / alvo) * 1000 : 0; // 1 mil ≈ alvo/1000
  const vFrac = noAlvo.v / initSpeed;
  return {
    anguloZeroGraus: ang * 180 / Math.PI,
    quedaCm: quedaM * 100,
    mils,
    tempo: noAlvo.t,
    vAlvo: noAlvo.v,
    vFrac,
    energiaRelPct: vFrac * vFrac * 100,          // fração da energia cinética de saída
    derivaVentoCm: noAlvo.z * 100,
    trajetoria: pts,
    apiceM: Math.max(0, ...pts.map((p) => p.y))  // altura máx acima da mira
  };
}

/* Tabela de queda pra várias distâncias (útil no card da arma) */
export function tabelaQueda({ initSpeed, airFriction, zero }, distancias) {
  const ang = anguloDeZero(initSpeed, airFriction, zero);
  const maxD = Math.max(...distancias, zero) * 1.08 + 10;
  const pts = integrar(initSpeed, airFriction, ang, maxD);
  return distancias.map((d) => {
    const a = alturaEm(pts, d);
    return { d, quedaCm: a.y * 100, mils: d > 0 ? (a.y / d) * 1000 : 0, v: a.v, t: a.t };
  });
}
