/**
 * Triangulação — localização por interseção de rumos (bearings).
 *
 * Conceito dos repos alexflint/triangulation e vandroogenbroeck/triangulation:
 * várias estações em posições conhecidas medem o ÂNGULO até um alvo; o cruzamento
 * dessas retas dá a posição. Com ruído as retas não se cruzam num ponto só, então
 * resolvemos por MÍNIMOS QUADRADOS (ponto que minimiza a distância às retas).
 *
 * JS puro, 2D. Ângulos em radianos, medidos de +x (sentido anti-horário).
 */

/** Rumo (ângulo) de `from` para `to`. */
export function bearingTo(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Estima a posição do alvo a partir de estações {x, y, bearing}.
 * Cada rumo define uma reta; resolvemos (MᵀM)p = Mᵀd (equações normais 2×2),
 * onde a normal à reta i é n=(-sinθ, cosθ) e a restrição é n·p = n·s_i.
 * @returns {{ ok:boolean, x:number, y:number, residual:number }}
 */
export function triangulate(stations) {
  let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
  for (const s of stations) {
    const nx = -Math.sin(s.bearing), ny = Math.cos(s.bearing);
    const d = nx * s.x + ny * s.y;
    a11 += nx * nx; a12 += nx * ny; a22 += ny * ny;
    b1 += nx * d; b2 += ny * d;
  }
  const det = a11 * a22 - a12 * a12;
  if (Math.abs(det) < 1e-9) return { ok: false, x: 0, y: 0, residual: Infinity };
  const x = (a22 * b1 - a12 * b2) / det;
  const y = (a11 * b2 - a12 * b1) / det;

  /* resíduo = RMS da distância perpendicular do ponto às retas */
  let res = 0;
  for (const s of stations) {
    const nx = -Math.sin(s.bearing), ny = Math.cos(s.bearing);
    const e = nx * (x - s.x) + ny * (y - s.y);
    res += e * e;
  }
  return { ok: true, x, y, residual: Math.sqrt(res / Math.max(1, stations.length)) };
}

/** Ruído gaussiano (Box–Muller) com desvio padrão sigma. */
export function gaussianNoise(sigma) {
  const u1 = Math.random() + 1e-9, u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
}

/** Distância euclidiana entre dois pontos. */
export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
