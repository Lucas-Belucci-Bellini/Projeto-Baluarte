/**
 * Hero WebGL — cena 3D imersiva do herói (issue #195: design 3D, imersivo,
 * "o melhor possível"). WebGL 1.0 puro, sem dependência:
 *   - Nebulosa volumétrica de milhares de partículas (blending aditivo = brilho).
 *   - Núcleo central de anéis 3D girando (estilo arc-reactor / orbe do JARVIS).
 *   - Câmera orbita com o mouse (parallax) e mergulha com o scroll (fly-through).
 *
 * Devolve `null` se o WebGL não estiver disponível ou um shader não compilar —
 * a página então cai no campo de partículas 2D (hero3d.js). Auto-dimensionável
 * e auto-encerrável (robusto a remontagem); respeita prefers-reduced-motion
 * (assenta a cena e não gira sozinho) e pausa com a aba oculta.
 *
 * API igual à createHeroField: { start, stop, setPointer, setScroll, destroy }.
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== mat4 mínimo (column-major) ===== */
const M = {
  ident: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c*4+r] = a[r]*b[c*4] + a[4+r]*b[c*4+1] + a[8+r]*b[c*4+2] + a[12+r]*b[c*4+3];
    }
    return o;
  },
  persp(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
  },
  transZ(z) { const m = M.ident(); m[14] = z; return m; },
  rotX(a) { const c = Math.cos(a), s = Math.sin(a); const m = M.ident(); m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m; },
  rotY(a) { const c = Math.cos(a), s = Math.sin(a); const m = M.ident(); m[0]=c; m[2]=-s; m[8]=s; m[10]=c; return m; },
  rotZ(a) { const c = Math.cos(a), s = Math.sin(a); const m = M.ident(); m[0]=c; m[1]=s; m[4]=-s; m[5]=c; return m; }
};

const VERT = `
attribute vec3 aPos; attribute vec3 aColor; attribute float aSize;
uniform mat4 uMVP; uniform float uScale; uniform float uPoint; uniform float uWave;
varying vec3 vColor; varying float vDepth;
void main() {
  vec4 clip = uMVP * vec4(aPos, 1.0);
  gl_Position = clip;
  float w = max(0.001, clip.w);
  /* onda de energia: anel de brilho que sai do centro pra fora (uWave = raio) */
  float ring = smoothstep(0.5, 0.0, abs(length(aPos) - uWave));
  gl_PointSize = clamp(aSize * uScale * uPoint / w * (1.0 + ring * 0.5), 1.0, 52.0);
  vColor = aColor * (1.0 + ring * 1.5);
  vDepth = clamp(1.4 - (w - 1.0) / 9.0, 0.12, 1.0);
}`;
const FRAG = `
precision mediump float;
varying vec3 vColor; varying float vDepth;
uniform float uIsLine; uniform float uIntensity;
void main() {
  float a = 1.0;
  if (uIsLine < 0.5) { vec2 uv = gl_PointCoord - 0.5; a = smoothstep(0.5, 0.0, length(uv)); }
  gl_FragColor = vec4(vColor * vDepth * uIntensity, a * vDepth * uIntensity);
}`;

function hexToRGB(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

/**
 * Geometria por VARIANTE (#246 — aprofundar o 3D nativo, refs do #262):
 *   - 'galaxy'  (padrão): nebulosa em disco + anéis arc-reactor + núcleo.
 *   - 'planet'  (/universo, ref. "Orbital View of Arrakis"): globo holográfico
 *     (meridianos/paralelos) + anel orbital inclinado + campo de estrelas.
 *   - 'reactor' (Núcleo de IA, ref. "circuit loop / Eternal ARC"): anéis
 *     concêntricos + cruzados + núcleo pulsante forte.
 * Devolve point-clouds (field = fundo; struct = anéis) + tamanho do núcleo.
 */
function buildGeometry(variant, cA, cB) {
  /* Perf (v0.4.0): metade das partículas em aparelho fraco/mobile (flag do boot). */
  const LF = (typeof window !== 'undefined' && window.__baluarteLowFx) ? 0.5 : 1;
  const field = { pos: [], col: [], size: [] };
  const struct = { pos: [], col: [], size: [] };
  let coreSize = 60;
  const push = (o, x, y, z, c, s) => { o.pos.push(x, y, z); o.col.push(c[0], c[1], c[2]); o.size.push(s); };
  const ring = (o, R, tilt, axis, col, seg = 150, rivet = true) => {
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      let x = Math.cos(a) * R, y = Math.sin(a) * R, z = 0;
      if (axis === 'x') { [x, y, z] = [0, x, y]; }
      else if (axis === 'y') { [x, y, z] = [x, 0, y]; }
      if (tilt) { const c = Math.cos(tilt), s = Math.sin(tilt); const nx = x * c - z * s; z = x * s + z * c; x = nx; }
      push(o, x, y, z, col, 7 + (rivet && i % 12 === 0 ? 7 : 0));
    }
  };

  if (variant === 'planet') {
    for (let i = 0; i < 1100; i++) {                 // campo de estrelas
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 3.6 + Math.random() * 3;
      const rxy = Math.sqrt(1 - u * u);
      push(field, Math.cos(th) * rxy * r, u * r, Math.sin(th) * rxy * r, Math.random() < 0.5 ? [1, 1, 1] : cA, 2 + Math.random() * 3);
    }
    const GR = 1.55, SEG = 96;
    for (let la = 1; la < 14; la++) {                // paralelos
      const phi = (la / 14) * Math.PI - Math.PI / 2;
      const y = Math.sin(phi) * GR, rr = Math.cos(phi) * GR;
      for (let s = 0; s < SEG; s++) { const a = (s / SEG) * Math.PI * 2; push(field, Math.cos(a) * rr, y, Math.sin(a) * rr, cA, 3.0); }
    }
    for (let lo = 0; lo < 24; lo++) {                // meridianos
      const lon = (lo / 24) * Math.PI * 2;
      for (let s = 0; s < SEG; s++) { const t = (s / SEG) * Math.PI * 2; push(field, GR * Math.cos(t) * Math.cos(lon), GR * Math.sin(t), GR * Math.cos(t) * Math.sin(lon), cA, 2.6); }
    }
    for (let i = 0; i < 500; i++) {                  // brilho de superfície
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rxy = Math.sqrt(1 - u * u);
      push(field, Math.cos(th) * rxy * GR, u * GR, Math.sin(th) * rxy * GR, Math.random() < 0.2 ? cB : cA, 2 + Math.random() * 5);
    }
    ring(struct, 2.5, 0.42, 'z', cB, 220, true);     // anel orbital
    ring(struct, 2.82, 0.42, 'z', cA, 220, false);
    coreSize = 26;
    return { field, struct, coreSize };
  }

  if (variant === 'reactor') {
    for (let i = 0; i < 1200; i++) {                 // nebulosa curta
      const u = Math.random(), ang = Math.random() * Math.PI * 2, rad = Math.pow(u, 0.7) * 2.4;
      const y = (Math.random() - 0.5) * 0.6, t = Math.random();
      push(field, Math.cos(ang) * rad, y, Math.sin(ang) * rad, t < 0.2 ? [1, 1, 1] : (t < 0.6 ? cA : cB), 4 + Math.random() * 10);
    }
    ring(struct, 0.75, 0, 'z', cA, 120);             // concêntricos
    ring(struct, 1.05, 0, 'z', cB, 140);
    ring(struct, 1.4, 0, 'z', cA, 160);
    ring(struct, 1.4, 0, 'x', cB, 160);              // cruzados
    ring(struct, 1.4, 0, 'y', cA, 160);
    ring(struct, 1.72, 0.6, 'z', cB, 170, false);
    coreSize = 92;
    return { field, struct, coreSize };
  }

  if (variant === 'helix') {
    for (let i = 0; i < 520; i++) {                  // estrelas de fundo
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 3.4 + Math.random() * 3;
      const rxy = Math.sqrt(1 - u * u);
      push(field, Math.cos(th) * rxy * r, u * r, Math.sin(th) * rxy * r, Math.random() < 0.5 ? [1, 1, 1] : cA, 2 + Math.random() * 2);
    }
    const TURNS = 3, HH = 4.2, PTS = 230, HR = 1.05;  // dupla hélice (DNA)
    for (let i = 0; i < PTS; i++) {
      const f = i / PTS, y = (f - 0.5) * HH, ang = f * TURNS * Math.PI * 2;
      push(field, Math.cos(ang) * HR, y, Math.sin(ang) * HR, cA, 7);
      push(field, Math.cos(ang + Math.PI) * HR, y, Math.sin(ang + Math.PI) * HR, cB, 7);
      if (i % 6 === 0) {                              // "degraus" entre as fitas
        const ax = Math.cos(ang) * HR, az = Math.sin(ang) * HR, bx = Math.cos(ang + Math.PI) * HR, bz = Math.sin(ang + Math.PI) * HR;
        for (let k = 1; k < 6; k++) { const tk = k / 6; push(field, ax + (bx - ax) * tk, y, az + (bz - az) * tk, [1, 1, 1], 3); }
      }
    }
    coreSize = 0;
    return { field, struct, coreSize };
  }

  if (variant === 'scope') {
    for (let i = 0; i < 420; i++) {                  // estrelas de fundo
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 3.2 + Math.random() * 3;
      const rxy = Math.sqrt(1 - u * u);
      push(field, Math.cos(th) * rxy * r, u * r, Math.sin(th) * rxy * r, [1, 1, 1], 1.6 + Math.random() * 2);
    }
    for (const R of [0.6, 1.0, 1.45, 1.9]) {          // anéis concêntricos (plano XY)
      const seg = Math.floor(R * 130);
      for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; push(field, Math.cos(a) * R, Math.sin(a) * R, 0, cA, 3.2); }
    }
    for (let k = 0; k < 48; k++) {                    // marcas radiais (graduação)
      const a = (k / 48) * Math.PI * 2;
      for (let r = 1.92; r < 2.1; r += 0.05) push(field, Math.cos(a) * r, Math.sin(a) * r, 0, cB, 3);
    }
    for (let r = -2; r <= 2; r += 0.06) {             // mira (crosshair)
      push(field, r, 0, 0, cA, 2.4); push(field, 0, r, 0, cA, 2.4);
    }
    coreSize = 40;
    return { field, struct, coreSize };
  }

  if (variant === 'astrolabe') {
    /* Astrolábio de fábula (mockup Fable 5 V2): icosaedro duplo + anéis
       inclinados + halo + campo de partículas + vagalumes + estilhaços. */
    const phi = (1 + Math.sqrt(5)) / 2, nrm = Math.hypot(1, phi);
    const V = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map((v) => v.map((x) => x / nrm));
    const E = [];                                    // 30 arestas = pares mais próximos
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]);
      if (d < 1.2) E.push([i, j]);
    }
    const dim = (c, f) => [c[0] * f, c[1] * f, c[2] * f];   // aditivo satura — atenua na cor
    const icosa = (R, col, sz) => {
      for (const [a, b] of E) for (let k = 0; k <= 26; k++) {
        const t = k / 26;
        push(struct, (V[a][0] + (V[b][0] - V[a][0]) * t) * R,
          (V[a][1] + (V[b][1] - V[a][1]) * t) * R,
          (V[a][2] + (V[b][2] - V[a][2]) * t) * R, col, sz);
      }
      for (const v of V) push(struct, v[0] * R, v[1] * R, v[2] * R, col, sz + 4);
    };
    icosa(1.5, dim(cA, 0.8), 3.0);                   // núcleo (arestas)
    icosa(2.05, dim(cB, 0.45), 2.2);                 // casca wireframe externa (discreta)
    const ringE = (R, rx, ry, col, seg, sz) => {     // anel com euler (inclinações do mockup)
      const cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry);
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        let x = Math.cos(a) * R, y = Math.sin(a) * R, z = 0;
        const y2 = y * cX - z * sX; z = y * sX + z * cX; y = y2;
        const x2 = x * cY + z * sY; z = -x * sY + z * cY; x = x2;
        push(struct, x, y, z, col, sz + (i % 18 === 0 ? 3 : 0));
      }
    };
    ringE(2.7, Math.PI / 2.4, 0, dim(cA, 0.6), 280, 2.6);
    ringE(3.15, Math.PI / 2.4 + 0.5, 0.7, dim(cB, 0.5), 300, 2.3);
    ringE(3.6, Math.PI / 2.4 + 1.0, 1.4, dim(cA, 0.45), 320, 2.1);
    ringE(4.4, Math.PI / 2.15, 0, dim(cB, 0.35), 360, 1.8);   // grande halo do astrolábio
    for (let i = 0, N = Math.round(1400 * LF); i < N; i++) {   // campo de partículas
      const r = 4 + Math.random() * 12, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      const t = Math.random();
      push(field, r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph),
        t < 0.18 ? [1, 1, 1] : (t < 0.7 ? cB : cA), 2 + Math.random() * 4);
    }
    for (let i = 0; i < 70; i++) {                   // vagalumes dourados
      const r = 3 + Math.random() * 7, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      push(field, r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6, r * Math.cos(ph), dim(cB, 0.8), 6 + Math.random() * 7);
    }
    const T = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((x) => x * 0.577));
    const TE = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    for (let sI = 0; sI < 14; sI++) {                // estilhaços tetraédricos flutuando
      const cx = (Math.random() - 0.5) * 11, cy = (Math.random() - 0.5) * 7, cz = (Math.random() - 0.5) * 5;
      const s = 0.14 + Math.random() * 0.2;
      const ry = Math.random() * Math.PI * 2, c = Math.cos(ry), sn = Math.sin(ry);
      for (const [a, b] of TE) for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        let x = (T[a][0] + (T[b][0] - T[a][0]) * t) * s;
        const y = (T[a][1] + (T[b][1] - T[a][1]) * t) * s;
        let z = (T[a][2] + (T[b][2] - T[a][2]) * t) * s;
        const x2 = x * c + z * sn; z = -x * sn + z * c; x = x2;
        push(field, cx + x, cy + y, cz + z, cA, 2.6);
      }
    }
    coreSize = 70;
    return { field, struct, coreSize };
  }

  // galaxy (padrão)
  for (let i = 0, N = Math.round(3600 * LF); i < N; i++) {
    const u = Math.random(), ang = Math.random() * Math.PI * 2;
    const rad = Math.pow(u, 0.6) * 3.4;
    const disc = Math.random() < 0.7;
    const y = disc ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 3.0;
    const t = Math.random();
    push(field, Math.cos(ang) * rad, y, Math.sin(ang) * rad, t < 0.15 ? [1, 1, 1] : (t < 0.6 ? cA : cB), 6 + Math.random() * 18);
  }
  for (const r of [{ ax: 'z', tilt: 0 }, { ax: 'x', tilt: 0 }, { ax: 'y', tilt: 0 }, { ax: 'z', tilt: 0.62 }, { ax: 'x', tilt: -0.62 }]) {
    ring(struct, 1.18, r.tilt, r.ax, r.ax === 'x' ? cB : cA, 150);
  }
  coreSize = 60;
  return { field, struct, coreSize };
}

/** Cores do herói a partir do UNIVERSO ativo (#246): por padrão o herói segue a
 *  skin (--color-cyan/--color-magenta do universe-theme.js), com fallback no
 *  visual Baluarte. Páginas podem passar accent/accent2 pra fixar uma cor. */
export function heroSkinColors() {
  const read = (name, fb) => {
    try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb; }
    catch { return fb; }
  };
  return { accent: read('--color-cyan', '#d4a24e'), accent2: read('--color-magenta', '#e8c07a') };
}

export function createHeroWebGL(canvas, opts = {}) {
  const _skin = heroSkinColors();
  const { accent = _skin.accent, accent2 = _skin.accent2, variant = 'galaxy' } = opts;
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) || canvas.getContext('experimental-webgl'); }
  catch { return null; }
  if (!gl) return null;

  function shader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  }
  const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const loc = {
    aPos: gl.getAttribLocation(prog, 'aPos'),
    aColor: gl.getAttribLocation(prog, 'aColor'),
    aSize: gl.getAttribLocation(prog, 'aSize'),
    uMVP: gl.getUniformLocation(prog, 'uMVP'),
    uScale: gl.getUniformLocation(prog, 'uScale'),
    uPoint: gl.getUniformLocation(prog, 'uPoint'),
    uIsLine: gl.getUniformLocation(prog, 'uIsLine'),
    uIntensity: gl.getUniformLocation(prog, 'uIntensity'),
    uWave: gl.getUniformLocation(prog, 'uWave')
  };

  const cA = hexToRGB(accent), cB = hexToRGB(accent2);

  /* ----- geometria por variante (galaxy/planet/reactor) ----- */
  const geo = buildGeometry(variant, cA, cB);

  /* fundo (nebulosa / globo / nebulosa curta) como point-sprites */
  const N = geo.field.pos.length / 3;
  const pPos = new Float32Array(geo.field.pos), pCol = new Float32Array(geo.field.col), pSize = new Float32Array(geo.field.size);
  const bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, pPos, gl.STATIC_DRAW);
  const bCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCol); gl.bufferData(gl.ARRAY_BUFFER, pCol, gl.STATIC_DRAW);
  const bSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bSize); gl.bufferData(gl.ARRAY_BUFFER, pSize, gl.STATIC_DRAW);

  /* estrutura (anéis) como point-sprites — gl.LINES com lineWidth>1 é ignorado
     na maioria das GPUs; point-sprites = orbe/anel luminoso nítido. */
  const LINES = geo.struct.pos.length / 3;
  const lPos = new Float32Array(geo.struct.pos), lCol = new Float32Array(geo.struct.col), lSize = new Float32Array(geo.struct.size);
  const bLPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLPos); gl.bufferData(gl.ARRAY_BUFFER, lPos, gl.STATIC_DRAW);
  const bLCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLCol); gl.bufferData(gl.ARRAY_BUFFER, lCol, gl.STATIC_DRAW);
  const bLSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLSize); gl.bufferData(gl.ARRAY_BUFFER, lSize, gl.STATIC_DRAW);

  /* núcleo central (1 ponto grande pulsante) */
  const corePos = new Float32Array([0,0,0]), coreCol = new Float32Array([...cA]), coreSize = new Float32Array([geo.coreSize]);
  const bCorePos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCorePos); gl.bufferData(gl.ARRAY_BUFFER, corePos, gl.STATIC_DRAW);
  const bCoreCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCoreCol); gl.bufferData(gl.ARRAY_BUFFER, coreCol, gl.STATIC_DRAW);
  const bCoreSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCoreSize); gl.bufferData(gl.ARRAY_BUFFER, coreSize, gl.STATIC_DRAW);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);     // aditivo = brilho

  /* ----- estado/loop ----- */
  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1, tt = 0;
  let everConnected = false, waitFrames = 0;
  let introStart = 0;                       // animação de "power-on" ao montar
  const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let scroll = 0, scrollTarget = 0;
  let camY = 0.4, camX = -0.18;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw <= 1 && nh <= 1) return false;
    w = nw; h = nh; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  }

  function bindAttr(bp, bc, bs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bp); gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bc); gl.enableVertexAttribArray(loc.aColor); gl.vertexAttribPointer(loc.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bs); gl.enableVertexAttribArray(loc.aSize); gl.vertexAttribPointer(loc.aSize, 1, gl.FLOAT, false, 0, 0);
  }

  function draw() {
    ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
    scroll += (scrollTarget - scroll) * 0.08;
    tt += 0.0045;

    /* "power-on": ~900ms zoom-in + fade-in ao montar (REDUCED entra direto) */
    if (!introStart) introStart = performance.now();
    const intro = REDUCED ? 1 : Math.min(1, (performance.now() - introStart) / 900);
    const ease = 1 - Math.pow(1 - intro, 3);
    const intensity = 0.12 + 0.88 * ease;

    /* parallax do ponteiro (mais forte) + deriva sutil pra cena respirar sozinha */
    camY = 0.4 + Math.sin(tt * 0.3) * 0.06 + (ptr.x - 0.5) * 1.3;
    camX = -0.18 + Math.cos(tt * 0.24) * 0.04 + (ptr.y - 0.5) * 0.85;
    const dist = (6.2 + scroll * 5.5) * (1 + (1 - ease) * 0.9);   // intro afasta e mergulha

    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.uIntensity, intensity);
    /* onda de energia pulsando do núcleo pra fora (~3.4s por pulso) */
    gl.uniform1f(loc.uWave, ((tt * 1.25) % 1.0) * 4.4);

    const proj = M.persp(1.05, w / h, 0.1, 60);
    const view = M.mul(M.transZ(-dist), M.mul(M.rotX(camX), M.rotY(camY)));
    const pv = M.mul(proj, view);
    const scale = Math.min(w, h) * 0.5 * dpr;

    /* fundo (gira devagar) — 'scope' varre no próprio plano (rotZ), 'astrolabe'
       deriva bem devagar (poeira de fábula), o resto gira no Y */
    const fieldRot = (variant === 'scope') ? M.rotZ(tt * 0.25)
      : (variant === 'astrolabe') ? M.rotY(tt * 0.12)
      : M.rotY(tt * 0.6);
    const mvpNeb = M.mul(pv, fieldRot);
    gl.uniformMatrix4fv(loc.uMVP, false, mvpNeb);
    gl.uniform1f(loc.uScale, scale); gl.uniform1f(loc.uIsLine, 0);
    gl.uniform1f(loc.uPoint, 0.05);
    bindAttr(bPos, bCol, bSize);
    gl.drawArrays(gl.POINTS, 0, N);

    /* estrutura: 'planet' = anel orbital girando devagar no eixo Y (mantém a
       inclinação); 'astrolabe' = giro majestoso com balanço (mockup Fable V2);
       'galaxy'/'reactor' = anéis tombando em eixos diferentes. */
    const structRot = (variant === 'planet')
      ? M.rotY(tt * 0.45)
      : (variant === 'astrolabe')
        ? M.mul(M.rotY(tt * 0.4), M.mul(M.rotX(Math.sin(tt * 0.55) * 0.2), M.rotZ(tt * 0.08)))
        : M.mul(M.rotY(tt * 1.6), M.rotX(tt * 0.9));
    const mvpCore = M.mul(pv, structRot);
    gl.uniformMatrix4fv(loc.uMVP, false, mvpCore);
    gl.uniform1f(loc.uIsLine, 0);
    gl.uniform1f(loc.uPoint, variant === 'astrolabe' ? 0.055 : 0.085);
    bindAttr(bLPos, bLCol, bLSize);
    gl.drawArrays(gl.POINTS, 0, LINES);

    /* ponto central pulsante */
    gl.uniform1f(loc.uIsLine, 0);
    gl.uniform1f(loc.uPoint, 0.05 + 0.02 * (0.6 + 0.4 * Math.sin(tt * 6)));
    gl.uniformMatrix4fv(loc.uMVP, false, pv);
    bindAttr(bCorePos, bCoreCol, bCoreSize);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  function frame() {
    if (dead || !running) return;
    if (canvas.isConnected) { everConnected = true; if (w <= 1 || h <= 1) resize(); }
    else if (everConnected) { running = false; return; }
    else if (waitFrames++ > 180) { running = false; return; }
    if (w > 1 && h > 1) draw();
    if (REDUCED) { running = false; return; }   // 1 quadro e para
    raf = requestAnimationFrame(frame);
  }

  function start() { if (dead || running) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (w <= 1) resize(); }); ro.observe(canvas); }
  let wasRunning = false;
  function onVis() { if (document.hidden) { wasRunning = running; stop(); } else if (wasRunning && !dead) start(); }
  document.addEventListener('visibilitychange', onVis);

  return {
    webgl: true,
    start, stop,
    setPointer(x, y) { ptr.tx = x; ptr.ty = y; },
    setScroll(v) { scrollTarget = Math.max(0, Math.min(1, v)); },
    destroy() {
      dead = true; stop();
      document.removeEventListener('visibilitychange', onVis);
      if (ro) ro.disconnect();
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    }
  };
}
