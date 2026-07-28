/**
 * Conversão de ângulos — a base de tudo no Vanguard.
 *
 * ⚠️ "Mil" e "MRAD" NÃO são a mesma coisa, e confundir os dois é o erro
 * clássico que joga a granada 200 m fora do alvo:
 *
 *   - **MRAD (milirradiano real)**: 1 mrad = 0,001 rad → 2π·1000 ≈ **6283,185**
 *     por volta. É o que aparece na retícula de luneta (Horus, Mil-Dot).
 *   - **Mil NATO**: a volta é dividida em **6400** partes (aproximação
 *     "redonda" do milirradiano). É o que morteiro e artilharia OTAN usam —
 *     e é o que o Arma 3 mostra no computador do Mk6.
 *   - **Mil Varsóvia/URSS**: 6000 por volta. **Streck sueco**: 6300.
 *
 * A regra prática "1 mil = 1 m a 1000 m" vale para o MRAD real; o mil NATO
 * erra ~2 % (6400 vs 6283) — irrelevante para observar tiro, relevante para
 * calcular elevação. Por isso o motor sempre guarda o ângulo em **radianos**
 * e converte só na borda (exibição/entrada).
 */

export const MIL_SYSTEMS = {
  /* voltas completas em cada sistema */
  nato: 6400,
  mrad: 2 * Math.PI * 1000, // 6283,185… (milirradiano verdadeiro)
  warsaw: 6000,
  swedish: 6300
};

export const DEG = Math.PI / 180;

export const degToRad = (d) => d * DEG;
export const radToDeg = (r) => r / DEG;

/** rad → mils, no sistema pedido (padrão: mil NATO 6400). */
export function radToMil(rad, system = 'nato') {
  const turn = MIL_SYSTEMS[system];
  if (!turn) throw new RangeError(`sistema de mil desconhecido: ${system}`);
  return (rad / (2 * Math.PI)) * turn;
}

/** mils → rad, no sistema pedido (padrão: mil NATO 6400). */
export function milToRad(mil, system = 'nato') {
  const turn = MIL_SYSTEMS[system];
  if (!turn) throw new RangeError(`sistema de mil desconhecido: ${system}`);
  return (mil / turn) * 2 * Math.PI;
}

export const degToMil = (deg, system = 'nato') => radToMil(degToRad(deg), system);
export const milToDeg = (mil, system = 'nato') => radToDeg(milToRad(mil, system));

/** Normaliza um azimute em graus para [0, 360). */
export function normDeg(deg) {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

/** Normaliza um azimute em mils para [0, volta). */
export function normMil(mil, system = 'nato') {
  const turn = MIL_SYSTEMS[system];
  const m = mil % turn;
  return m < 0 ? m + turn : m;
}

/**
 * Menor diferença angular assinada entre dois azimutes, em graus.
 * Resultado em (−180, 180] — positivo = `b` está à direita de `a`.
 * Usado pela bússola (quanto virar) e pela correção de tiro do observador.
 */
export function deltaDeg(a, b) {
  let d = normDeg(b) - normDeg(a);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Largura angular de um alvo: quantos mils ele ocupa a certa distância.
 * `larguraM` em metros, `distM` em metros. Base do telemetria por retícula
 * ("um homem de 1,8 m que ocupa 3,6 mils está a 500 m").
 */
export function milsPorTamanho(larguraM, distM, system = 'nato') {
  if (distM <= 0) return 0;
  return radToMil(Math.atan2(larguraM, distM), system);
}

/** O inverso: distância estimada a partir do tamanho aparente em mils. */
export function distanciaPorMils(larguraM, mils, system = 'nato') {
  const rad = milToRad(mils, system);
  if (rad <= 0) return Infinity;
  return larguraM / Math.tan(rad);
}
