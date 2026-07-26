/**
 * Motor balístico — o cérebro do computador de tiro.
 *
 * Dois solucionadores, e a escolha entre eles é uma decisão de engenharia,
 * não preguiça:
 *
 *  1. `resolverVacuo()` — **forma fechada**, exata para o modelo sem ar.
 *     Resolve a equação da trajetória isolando tan(θ). Custo: microssegundos.
 *     Erro real: superestima o alcance (ignora arrasto) — em morteiro de
 *     82 mm a 3 km, ~15 a 25 %. Serve para: pré-filtrar cargas viáveis,
 *     dar o "chute inicial" ao solver numérico e rodar em loop de UI.
 *
 *  2. `resolverComArrasto()` — **integração numérica** com arrasto
 *     quadrático e vento 3D. É o número que vai para a peça.
 *
 * ── A matemática do caso 1 ──
 * Trajetória sem ar, origem na boca do tubo:
 *
 *     y = x·tan θ − g·x² / (2·v²·cos²θ)
 *
 * Usando 1/cos²θ = 1 + tan²θ e chamando T = tan θ, k = g·x²/(2v²):
 *
 *     y = xT − k(1 + T²)   ⟹   k·T² − x·T + (y + k) = 0
 *
 * que é uma quadrática em T. Δ = x² − 4k(y + k):
 *
 *     T = [ x ± √Δ ] / (2k)
 *
 *  · Δ < 0  → alvo FORA DE ALCANCE nesta carga (nenhum ângulo resolve).
 *  · raiz − → tiro TENSO (low angle), trajetória rasante.
 *  · raiz + → tiro CURVO (high angle) — o modo normal do morteiro, que
 *    passa por cima de obstáculos e cai quase na vertical.
 *  · Δ = 0  → alcance máximo exato; as duas soluções se fundem.
 *
 * Alcance máximo para um alvo a altura relativa y (envelope de segurança):
 *
 *     x_max = (v/g)·√(v² − 2gy)
 *
 * Tudo em SI: metros, segundos, radianos por dentro. `g` é configurável
 * porque a gravidade varia ~0,5 % do equador ao polo e o Arma usa 9,81 cravado.
 */

import { radToDeg, degToRad } from './angles.js';

/** Gravidade padrão (CGPM 1901). O Arma 3 usa 9.81 — passe `g: 9.81` para bater com o jogo. */
export const G_PADRAO = 9.80665;

/** Modos de trajetória. */
export const MODO = { ALTO: 'alto', TENSO: 'tenso' };

/**
 * Alcance máximo no vácuo para um alvo a `deltaAlt` metros acima da peça.
 * Retorna 0 se nem no melhor ângulo o projétil alcança a altura do alvo.
 */
export function alcanceMaximoVacuo(v, deltaAlt = 0, g = G_PADRAO) {
  const dentro = v * v - 2 * g * deltaAlt;
  if (dentro <= 0) return 0; // alvo acima do apogeu vertical: inalcançável
  return (v / g) * Math.sqrt(dentro);
}

/**
 * Resolve o tiro no vácuo (forma fechada).
 *
 * @param {object} p
 * @param {number} p.distanciaM  distância HORIZONTAL peça→alvo (m)
 * @param {number} p.deltaAltM   altitude do alvo menos a da peça (m, + = alvo acima)
 * @param {number} p.v           velocidade inicial (m/s)
 * @param {string} [p.modo]      'alto' (padrão) ou 'tenso'
 * @param {number} [p.g]
 * @returns {{ok:boolean, motivo?:string, elevacaoRad?:number, elevacaoDeg?:number,
 *            tempoVooS?:number, apiceM?:number, velocidadeImpacto?:number,
 *            anguloImpactoDeg?:number, alcanceMaxM:number}}
 */
export function resolverVacuo({ distanciaM, deltaAltM = 0, v, modo = MODO.ALTO, g = G_PADRAO }) {
  const x = distanciaM;
  const y = deltaAltM;
  const alcanceMaxM = alcanceMaximoVacuo(v, y, g);

  if (!(v > 0)) return { ok: false, motivo: 'velocidade inicial precisa ser > 0', alcanceMaxM };

  /* Alvo na vertical da peça: sem solução balística útil (e perigosíssimo). */
  if (x < 1e-9) {
    return { ok: false, motivo: 'alvo na vertical da peça — sem solução de tiro', alcanceMaxM };
  }

  const k = (g * x * x) / (2 * v * v);
  const disc = x * x - 4 * k * (y + k);

  if (disc < 0) {
    return {
      ok: false,
      motivo: x > alcanceMaxM ? 'alvo fora de alcance' : 'sem solução (geometria)',
      alcanceMaxM
    };
  }

  const raiz = Math.sqrt(disc);
  const T = modo === MODO.TENSO ? (x - raiz) / (2 * k) : (x + raiz) / (2 * k);
  const theta = Math.atan(T);

  const vx = v * Math.cos(theta);
  const vy0 = v * Math.sin(theta);
  const tof = x / vx;
  const vyImp = vy0 - g * tof;

  return {
    ok: true,
    elevacaoRad: theta,
    elevacaoDeg: radToDeg(theta),
    tempoVooS: tof,
    /* apogeu acima da BOCA do tubo (não acima do solo) */
    apiceM: (vy0 * vy0) / (2 * g),
    velocidadeImpacto: Math.hypot(vx, vyImp),
    anguloImpactoDeg: radToDeg(Math.atan2(-vyImp, vx)),
    alcanceMaxM,
    solver: 'vacuo'
  };
}

/* ───────────────────── modelo com arrasto ───────────────────── */

/**
 * Integra a trajetória com arrasto quadrático e vento.
 *
 * Modelo de arrasto: a = μ·|v_rel|·v_rel, com μ < 0 — a MESMA formulação do
 * `airFriction` da engine Real Virtuality (Arma 3) e do
 * `arma3-balistica.js` do Projeto Baluarte. Manter a formulação idêntica
 * entre os dois projetos é deliberado: os coeficientes são intercambiáveis
 * e um valor calibrado num serve no outro.
 *
 * O vento entra como velocidade DO AR: o arrasto age sobre `v − v_ar`, que é
 * fisicamente correto e faz vento de cauda/proa alterarem alcance e vento de
 * través gerar deriva — tudo do mesmo termo, sem gambiarra.
 *
 * Eixos: x = alcance (na direção de tiro), y = vertical, z = través (+ direita).
 *
 * @returns {{pts:Array, cruzamento:object|null}} `cruzamento` = ponto em que a
 *          trajetória DESCENDO cruza a altura do alvo.
 */
export function integrarTrajetoria({
  v, elevacaoRad, mu, deltaAltM = 0, g = G_PADRAO,
  ventoLongitudinal = 0, ventoTravessal = 0,
  dt = 0.01, tMax = 200, guardarPontos = true
}) {
  let x = 0, y = 0, z = 0;
  let vx = v * Math.cos(elevacaoRad);
  let vy = v * Math.sin(elevacaoRad);
  let vz = 0;
  let t = 0;
  const pts = guardarPontos ? [{ x: 0, y: 0, z: 0, t: 0, v }] : null;
  let cruzamento = null;
  let ant = { x, y, z, t, vx, vy, vz };

  while (t < tMax) {
    /* Velocidade RELATIVA AO AR (é sobre ela que o arrasto age). */
    const rx = vx - ventoLongitudinal;
    const rz = vz - ventoTravessal;
    const vrel = Math.hypot(rx, vy, rz);
    const kdrag = mu * vrel; // mu < 0 → desacelera

    /* Integrador do ponto médio (RK2): erro O(dt²) em vez de O(dt) do Euler.
     * Com dt = 10 ms isso põe o erro de tempo de voo abaixo de 1 ms num voo
     * de 40 s — barato e elimina o viés sistemático do Euler. */
    const ax1 = kdrag * rx, ay1 = kdrag * vy - g, az1 = kdrag * rz;
    const mvx = vx + ax1 * dt / 2, mvy = vy + ay1 * dt / 2, mvz = vz + az1 * dt / 2;
    const mrx = mvx - ventoLongitudinal, mrz = mvz - ventoTravessal;
    const mvrel = Math.hypot(mrx, mvy, mrz);
    const mk = mu * mvrel;
    const ax = mk * mrx, ay = mk * mvy - g, az = mk * mrz;

    ant = { x, y, z, t, vx, vy, vz };
    vx += ax * dt; vy += ay * dt; vz += az * dt;
    x += mvx * dt; y += mvy * dt; z += mvz * dt;
    t += dt;

    if (pts) pts.push({ x, y, z, t, v: Math.hypot(vx, vy, vz) });

    /* Cruzou a altura do alvo DESCENDO? Interpola linearmente entre os dois
     * passos — com dt = 10 ms e queda de ~100 m/s, a interpolação erra < 1 cm. */
    if (!cruzamento && ant.y >= deltaAltM && y < deltaAltM && vy < 0) {
      const f = (ant.y - deltaAltM) / (ant.y - y || 1);
      cruzamento = {
        x: ant.x + (x - ant.x) * f,
        z: ant.z + (z - ant.z) * f,
        t: ant.t + dt * f,
        vx: ant.vx + (vx - ant.vx) * f,
        vy: ant.vy + (vy - ant.vy) * f,
        vz: ant.vz + (vz - ant.vz) * f
      };
      break;
    }
    /* Passou muito abaixo sem cruzar (alvo acima do apogeu): aborta. */
    if (vy < 0 && y < deltaAltM - 1e6) break;
  }

  return { pts, cruzamento };
}

/** Alcance (m) atingido com arrasto para um dado ângulo. 0 se não cruza o alvo. */
function alcanceComArrasto(opts) {
  const { cruzamento } = integrarTrajetoria({ ...opts, guardarPontos: false });
  return cruzamento ? cruzamento.x : 0;
}

/**
 * Ângulo de alcance máximo com arrasto. Sem ar seria 45°; com ar cai para
 * ~40–43° (e desce mais quanto mais lento/arrastado o projétil), então
 * procuramos de verdade em vez de assumir 45°.
 * Busca pela seção áurea — a função alcance(θ) é unimodal neste intervalo.
 */
function anguloAlcanceMaximo(base, loDeg = 1, hiDeg = 70) {
  const phi = (Math.sqrt(5) - 1) / 2;
  let lo = degToRad(loDeg), hi = degToRad(hiDeg);
  let c = hi - phi * (hi - lo), d = lo + phi * (hi - lo);
  let fc = alcanceComArrasto({ ...base, elevacaoRad: c });
  let fd = alcanceComArrasto({ ...base, elevacaoRad: d });
  for (let i = 0; i < 40 && hi - lo > 1e-5; i++) {
    if (fc > fd) { hi = d; d = c; fd = fc; c = hi - phi * (hi - lo); fc = alcanceComArrasto({ ...base, elevacaoRad: c }); }
    else { lo = c; c = d; fc = fd; d = lo + phi * (hi - lo); fd = alcanceComArrasto({ ...base, elevacaoRad: d }); }
  }
  const ang = (lo + hi) / 2;
  return { anguloRad: ang, alcance: alcanceComArrasto({ ...base, elevacaoRad: ang }) };
}

/**
 * Resolve o tiro COM arrasto e vento. Este é o número que vai para a peça.
 *
 * Estratégia: acha o ângulo de alcance máximo, o que parte o domínio em dois
 * ramos monótonos (tenso abaixo dele, curvo acima). Bisseção no ramo pedido —
 * robusta, sem derivada, sem risco de divergir como Newton faria perto do
 * alcance máximo (onde a derivada vai a zero).
 *
 * @param {object} p
 * @param {number} p.distanciaM   distância horizontal (m)
 * @param {number} p.deltaAltM    diferença de altitude alvo−peça (m)
 * @param {number} p.v            velocidade inicial (m/s)
 * @param {number} p.mu           coeficiente de arrasto (airFriction, < 0)
 * @param {string} [p.modo]       'alto' | 'tenso'
 * @param {number} [p.ventoLongitudinal] m/s, + = vento de CAUDA (empurra)
 * @param {number} [p.ventoTravessal]    m/s, + = vento vindo da ESQUERDA (leva à direita)
 */
export function resolverComArrasto({
  distanciaM, deltaAltM = 0, v, mu, modo = MODO.ALTO,
  ventoLongitudinal = 0, ventoTravessal = 0, g = G_PADRAO, dt = 0.01
}) {
  if (!(v > 0)) return { ok: false, motivo: 'velocidade inicial precisa ser > 0' };
  if (!(mu < 0)) return { ok: false, motivo: 'coeficiente de arrasto precisa ser < 0' };
  if (!(distanciaM > 0)) return { ok: false, motivo: 'distância precisa ser > 0' };

  const base = { v, mu, deltaAltM, g, ventoLongitudinal, ventoTravessal, dt };
  const { anguloRad: angMax, alcance: alcanceMaxM } = anguloAlcanceMaximo(base);

  if (distanciaM > alcanceMaxM) {
    return {
      ok: false,
      motivo: 'alvo fora de alcance',
      alcanceMaxM,
      faltaM: distanciaM - alcanceMaxM,
      solver: 'arrasto'
    };
  }

  /* Ramo monótono conforme o modo. */
  let lo, hi;
  if (modo === MODO.TENSO) { lo = degToRad(0.05); hi = angMax; }
  else { lo = angMax; hi = degToRad(89.5); }

  /* Bisseção: no ramo alto o alcance DECRESCE com o ângulo; no tenso, cresce. */
  const crescente = modo === MODO.TENSO;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const r = alcanceComArrasto({ ...base, elevacaoRad: mid });
    const maior = r > distanciaM;
    if (maior === crescente) hi = mid; else lo = mid;
    if (hi - lo < 1e-7) break;
  }
  const theta = (lo + hi) / 2;

  /* Passada final com dt menor e guardando pontos: é a que vira número final
   * e a polilinha do perfil de trajetória na tela. */
  const fina = integrarTrajetoria({ ...base, elevacaoRad: theta, dt: dt / 2, guardarPontos: true });
  if (!fina.cruzamento) {
    return { ok: false, motivo: 'não convergiu para uma solução', alcanceMaxM, solver: 'arrasto' };
  }
  const c = fina.cruzamento;
  const apice = fina.pts.reduce((m, p) => (p.y > m ? p.y : m), 0);

  return {
    ok: true,
    elevacaoRad: theta,
    elevacaoDeg: radToDeg(theta),
    tempoVooS: c.t,
    apiceM: apice,
    /** erro residual de alcance da solução (m) — deve ficar em centímetros */
    residuoM: c.x - distanciaM,
    /** deriva lateral acumulada pelo vento de través (m, + = direita) */
    derivaM: c.z,
    velocidadeImpacto: Math.hypot(c.vx, c.vy, c.vz),
    anguloImpactoDeg: radToDeg(Math.atan2(-c.vy, Math.hypot(c.vx, c.vz))),
    alcanceMaxM,
    trajetoria: fina.pts,
    solver: 'arrasto'
  };
}

/**
 * Calibra o coeficiente de arrasto a partir de um dado publicado: "esta arma,
 * nesta carga (v), tem alcance máximo R".
 *
 * Por que isto existe: inventar um `airFriction` é chutar. Alcance máximo por
 * carga é dado de tabela de tiro — público e verificável. Derivar μ a partir
 * dele deixa a tabela inteira consistente com a fonte, em vez de bonita e
 * errada. Bisseção em μ (alcance é monótono decrescente em |μ|).
 *
 * @returns {number} μ (negativo) que reproduz `alcanceMaxM` com essa `v`.
 */
export function calibrarArrasto(v, alcanceMaxM, { g = G_PADRAO, dt = 0.01 } = {}) {
  const semAr = alcanceMaximoVacuo(v, 0, g);
  if (alcanceMaxM >= semAr) {
    /* Alcance publicado ≥ o do vácuo: nenhum arrasto explica isso (ou o dado
     * embute foguete-assistido). Devolve arrasto desprezível e deixa explícito. */
    return -1e-9;
  }
  /* Intervalo em ordem numérica: lo = −1e−2 (arrasto brutal, alcance curto)
   * até hi = −1e−9 (praticamente vácuo, alcance longo). Como μ cresce de lo
   * para hi, o alcance também cresce — função MONÓTONA CRESCENTE no
   * intervalo. Logo: alcance abaixo do alvo ⇒ precisa de menos arrasto ⇒
   * sobe o piso (`lo = mid`). Inverter estes dois é o erro clássico aqui. */
  let lo = -1e-2, hi = -1e-9;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const { alcance } = anguloAlcanceMaximo({ v, mu: mid, deltaAltM: 0, g, dt, ventoLongitudinal: 0, ventoTravessal: 0 });
    if (alcance < alcanceMaxM) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) < 1e-15) break;
  }
  return (lo + hi) / 2;
}
