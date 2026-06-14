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
  rotY(a) { const c = Math.cos(a), s = Math.sin(a); const m = M.ident(); m[0]=c; m[2]=-s; m[8]=s; m[10]=c; return m; }
};

const VERT = `
attribute vec3 aPos; attribute vec3 aColor; attribute float aSize;
uniform mat4 uMVP; uniform float uScale; uniform float uPoint;
varying vec3 vColor; varying float vDepth;
void main() {
  vec4 clip = uMVP * vec4(aPos, 1.0);
  gl_Position = clip;
  float w = max(0.001, clip.w);
  gl_PointSize = clamp(aSize * uScale * uPoint / w, 1.0, 46.0);
  vColor = aColor;
  vDepth = clamp(1.4 - (w - 1.0) / 9.0, 0.12, 1.0);
}`;
const FRAG = `
precision mediump float;
varying vec3 vColor; varying float vDepth;
uniform float uIsLine;
void main() {
  float a = 1.0;
  if (uIsLine < 0.5) { vec2 uv = gl_PointCoord - 0.5; a = smoothstep(0.5, 0.0, length(uv)); }
  gl_FragColor = vec4(vColor * vDepth, a * vDepth);
}`;

function hexToRGB(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

export function createHeroWebGL(canvas, { accent = '#00f0ff', accent2 = '#ff00aa' } = {}) {
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
    uIsLine: gl.getUniformLocation(prog, 'uIsLine')
  };

  const cA = hexToRGB(accent), cB = hexToRGB(accent2);

  /* ----- geometria: nebulosa de partículas ----- */
  const N = 3600;
  const pPos = new Float32Array(N * 3), pCol = new Float32Array(N * 3), pSize = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    /* disco achatado + halo esférico (galáxia) */
    const u = Math.random(), ang = Math.random() * Math.PI * 2;
    const rad = Math.pow(u, 0.6) * 3.4;
    const disc = Math.random() < 0.7;
    const y = disc ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 3.0;
    pPos[i*3] = Math.cos(ang) * rad;
    pPos[i*3+1] = y;
    pPos[i*3+2] = Math.sin(ang) * rad;
    const t = Math.random();
    const mix = t < 0.15 ? [1,1,1] : (t < 0.6 ? cA : cB);
    pCol[i*3] = mix[0]; pCol[i*3+1] = mix[1]; pCol[i*3+2] = mix[2];
    pSize[i] = 6 + Math.random() * 18;
  }
  const bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, pPos, gl.STATIC_DRAW);
  const bCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCol); gl.bufferData(gl.ARRAY_BUFFER, pCol, gl.STATIC_DRAW);
  const bSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bSize); gl.bufferData(gl.ARRAY_BUFFER, pSize, gl.STATIC_DRAW);

  /* ----- núcleo: anéis 3D (arc-reactor) como pontos brilhantes -----
     gl.LINES com lineWidth>1 é ignorado na maioria das GPUs (vira hairline e
     some sobre a nebulosa). Render como point-sprites = orbe luminoso nítido. */
  const ringPts = [], ringCol = [], ringSz = [];
  const RSEG = 150, R = 1.18;
  const rings = [
    { ax: 'z', tilt: 0,    col: cA },
    { ax: 'x', tilt: 0,    col: cB },
    { ax: 'y', tilt: 0,    col: cA },
    { ax: 'z', tilt: 0.62, col: cB },
    { ax: 'x', tilt: -0.62, col: cA }
  ];
  for (const ring of rings) {
    for (let i = 0; i < RSEG; i++) {
      const a = (i / RSEG) * Math.PI * 2;
      let x = Math.cos(a) * R, y = Math.sin(a) * R, z = 0;
      if (ring.ax === 'x') { [x, y, z] = [0, x, y]; }
      else if (ring.ax === 'y') { [x, y, z] = [x, 0, y]; }
      if (ring.tilt) { const c = Math.cos(ring.tilt), s = Math.sin(ring.tilt); const nx = x*c - z*s; z = x*s + z*c; x = nx; }
      ringPts.push(x, y, z);
      ringCol.push(ring.col[0], ring.col[1], ring.col[2]);
      ringSz.push(7 + ((i % 12 === 0) ? 7 : 0));   // "rebites" mais brilhantes a cada 12
    }
  }
  const LINES = ringPts.length / 3;
  const lPos = new Float32Array(ringPts);
  const lCol = new Float32Array(ringCol), lSize = new Float32Array(ringSz);
  const bLPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLPos); gl.bufferData(gl.ARRAY_BUFFER, lPos, gl.STATIC_DRAW);
  const bLCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLCol); gl.bufferData(gl.ARRAY_BUFFER, lCol, gl.STATIC_DRAW);
  const bLSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bLSize); gl.bufferData(gl.ARRAY_BUFFER, lSize, gl.STATIC_DRAW);

  /* núcleo central (1 ponto grande pulsante) */
  const corePos = new Float32Array([0,0,0]), coreCol = new Float32Array([...cA]), coreSize = new Float32Array([60]);
  const bCorePos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCorePos); gl.bufferData(gl.ARRAY_BUFFER, corePos, gl.STATIC_DRAW);
  const bCoreCol = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCoreCol); gl.bufferData(gl.ARRAY_BUFFER, coreCol, gl.STATIC_DRAW);
  const bCoreSize = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCoreSize); gl.bufferData(gl.ARRAY_BUFFER, coreSize, gl.STATIC_DRAW);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);     // aditivo = brilho

  /* ----- estado/loop ----- */
  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1, tt = 0;
  let everConnected = false, waitFrames = 0;
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

    camY = 0.4 + (ptr.x - 0.5) * 1.1;
    camX = -0.18 + (ptr.y - 0.5) * 0.7;
    const dist = 6.2 + scroll * 5.5;       // scroll mergulha a câmera

    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);

    const proj = M.persp(1.05, w / h, 0.1, 60);
    const view = M.mul(M.transZ(-dist), M.mul(M.rotX(camX), M.rotY(camY)));
    const pv = M.mul(proj, view);
    const scale = Math.min(w, h) * 0.5 * dpr;

    /* nebulosa (gira devagar) */
    const mvpNeb = M.mul(pv, M.rotY(tt * 0.6));
    gl.uniformMatrix4fv(loc.uMVP, false, mvpNeb);
    gl.uniform1f(loc.uScale, scale); gl.uniform1f(loc.uIsLine, 0);
    gl.uniform1f(loc.uPoint, 0.05);
    bindAttr(bPos, bCol, bSize);
    gl.drawArrays(gl.POINTS, 0, N);

    /* núcleo: anéis de orbes girando em eixos diferentes (arc-reactor) */
    const mvpCore = M.mul(pv, M.mul(M.rotY(tt * 1.6), M.rotX(tt * 0.9)));
    gl.uniformMatrix4fv(loc.uMVP, false, mvpCore);
    gl.uniform1f(loc.uIsLine, 0);
    gl.uniform1f(loc.uPoint, 0.085);
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
