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

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface BearingStation extends Point2D {
  readonly bearing: number;
}

export interface TriangulationResult {
  readonly ok: boolean;
  readonly x: number;
  readonly y: number;
  readonly residual: number;
}

/** Rumo (ângulo) de `from` para `to`. */
export function bearingTo(from: Point2D, to: Point2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Estima a posição do alvo a partir de estações {x, y, bearing}.
 * Cada rumo define uma reta; resolvemos (MᵀM)p = Mᵀd (equações normais 2×2),
 * onde a normal à reta i é n=(-sinθ, cosθ) e a restrição é n·p = n·s_i.
 */
export function triangulate(
  stations: readonly BearingStation[],
): TriangulationResult {
  let a11 = 0;
  let a12 = 0;
  let a22 = 0;
  let b1 = 0;
  let b2 = 0;

  for (const station of stations) {
    const nx = -Math.sin(station.bearing);
    const ny = Math.cos(station.bearing);
    const d = nx * station.x + ny * station.y;
    a11 += nx * nx;
    a12 += nx * ny;
    a22 += ny * ny;
    b1 += nx * d;
    b2 += ny * d;
  }

  const determinant = a11 * a22 - a12 * a12;
  if (Math.abs(determinant) < 1e-9) {
    return { ok: false, x: 0, y: 0, residual: Infinity };
  }

  const x = (a22 * b1 - a12 * b2) / determinant;
  const y = (a11 * b2 - a12 * b1) / determinant;

  /* resíduo = RMS da distância perpendicular do ponto às retas */
  let residualSum = 0;
  for (const station of stations) {
    const nx = -Math.sin(station.bearing);
    const ny = Math.cos(station.bearing);
    const error = nx * (x - station.x) + ny * (y - station.y);
    residualSum += error * error;
  }

  return {
    ok: true,
    x,
    y,
    residual: Math.sqrt(residualSum / Math.max(1, stations.length)),
  };
}

/** Ruído gaussiano (Box–Muller) com desvio padrão sigma. */
export function gaussianNoise(sigma: number): number {
  const u1 = Math.random() + 1e-9;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
}

/** Distância euclidiana entre dois pontos. */
export function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
