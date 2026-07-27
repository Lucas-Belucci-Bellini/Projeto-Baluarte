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

/**
 * Os números de tiro de uma arma, com a procedência declarada.
 *
 * Desde a extração da #398 cada arma traz o `v0` e o `airFriction` MEDIDOS no
 * config do jogo — é o que esta função devolve. O fallback por calibre só
 * entra quando a arma não tem o dado, e vem marcado como `fonte: 'referencia'`
 * pra tela poder dizer que aquele número é estimado.
 *
 * Devolve `null` quando o modelo não se aplica. Isso não é frescura: no config
 * do Arma, foguete e míssil têm `airFriction` POSITIVO e `v0` de ejeção
 * (~30 m/s), porque seguem outro modelo de voo — o projétil acelera depois de
 * sair do tubo. Jogar esse par no integrador abaixo (que assume arrasto, isto
 * é, `airFriction < 0`) produziria uma bala GANHANDO velocidade e uma
 * "trajetória" que não existe. Melhor recusar do que desenhar ficção.
 */
export function dadosBalisticos(arma) {
  if (!arma) return null;
  if (arma.balistico === false) return null;

  const v0 = arma.v0;
  const af = arma.airFriction;
  if (typeof v0 === 'number' && v0 > 0 && typeof af === 'number' && af < 0) {
    return { initSpeed: v0, airFriction: af, fonte: 'config' };
  }

  const ref = AIR_FRICTION_REF[arma.calibre];
  if (typeof v0 === 'number' && v0 > 0 && typeof ref === 'number') {
    return { initSpeed: v0, airFriction: ref, fonte: 'referencia' };
  }
  return null;
}

/* airFriction de REFERÊNCIA por família de calibre (negativo = arrasto).
 *
 * Deixou de ser a fonte principal: `dadosBalisticos()` usa o valor medido da
 * arma e só cai aqui quando o config não informa o arrasto. Fica porque essa
 * minoria existe — e porque um número de família declarado como estimativa é
 * honesto, enquanto um número de família apresentado como medição não era. */
export const AIR_FRICTION_REF = {
  /* Os rótulos são os NORMALIZADOS pelo gerador (arma3-armas.js). Se mudarem
   * lá, mudam aqui — senão o fallback silenciosamente nunca casa. */
  '9 mm': -0.0018,
  '.45 ACP': -0.0025,
  '5.56×45 mm': -0.00114,
  '5.45×39 mm': -0.0012,
  '5.8×42 mm': -0.0011,
  '6.5×39 mm': -0.00075,
  '6.5 Creedmoor': -0.00062,
  '6.8 SPC': -0.001,
  '7.62×51 mm': -0.0009,
  '7.62×39 mm': -0.00125,
  '7.62×54 mm': -0.001,
  '.300 BLK': -0.0018,
  '.300 WM': -0.00045,
  '9.3×64 mm': -0.00055,
  '.338 LM': -0.00036,
  '.408 CheyTac': -0.00033,
  '12.7×54 mm': -0.0016,
  '12.7×99 mm': -0.0005,
  '12.7×108 mm': -0.00052
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
  /* Guarda explícita: `airFriction >= 0` não é arrasto, é empuxo. Acontece de
   * verdade no config (foguete/míssil) e a integração devolveria uma curva
   * fisicamente impossível em vez de falhar. Ver dadosBalisticos(). */
  if (!(airFriction < 0)) {
    throw new RangeError(
      `airFriction deve ser negativo (arrasto); recebi ${airFriction}. ` +
      'Foguete e míssil usam outro modelo de voo — use dadosBalisticos() para filtrar.');
  }
  if (!(initSpeed > 0)) {
    throw new RangeError(`initSpeed deve ser positivo; recebi ${initSpeed}.`);
  }
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

/**
 * Tabela de queda pra várias distâncias — o "cartão de tiro" da arma.
 *
 * Integra UMA vez e amostra em cada distância, em vez de resolver o tiro por
 * distância: o ângulo de zeragem é o mesmo para toda a tabela, então repetir a
 * bisseção 12 vezes só gastaria CPU pra chegar no mesmo número.
 *
 * `mils` aqui é MILIRRADIANO de verdade (1 mrad = 1 m a 1000 m), que é o que
 * o retículo das miras usa. NÃO é o mil NATO (6400 por volta, ≈0,98 mrad) —
 * quem precisar do NATO converte na borda, com `milRadParaMilNato`.
 */
export function tabelaQueda({ initSpeed, airFriction, zero, vento = 0 }, distancias) {
  const ang = anguloDeZero(initSpeed, airFriction, zero);
  const maxD = Math.max(...distancias, zero) * 1.08 + 10;
  const pts = integrar(initSpeed, airFriction, ang, maxD, vento);
  return distancias.map((d) => {
    const a = alturaEm(pts, d);
    return {
      d,
      quedaCm: a.y * 100,
      mils: d > 0 ? (a.y / d) * 1000 : 0,
      derivaCm: a.z * 100,
      derivaMils: d > 0 ? (a.z / d) * 1000 : 0,
      v: a.v,
      t: a.t,
    };
  });
}

/* 6400 mils NATO por volta contra 2π·1000 ≈ 6283,2 milirradianos. A razão é
 * ~0,982: parece arredondamento, mas a 1000 m dá quase 2 m de erro — por isso
 * o motor guarda radiano e só converte na borda. */
export const MIL_NATO_POR_VOLTA = 6400;
export const MRAD_POR_VOLTA = 2 * Math.PI * 1000;
export const milRadParaMilNato = (mrad) => mrad * (MIL_NATO_POR_VOLTA / MRAD_POR_VOLTA);
