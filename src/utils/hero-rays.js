/**
 * Hero LightRays — fundo WebGL de "raios volumétricos" (god-rays) pro herói,
 * porta vanilla/sem-dep do LightRays do react-bits (que usa OGL). #246/#262.
 *
 * Fragment shader de QUAD de tela cheia (não é o sistema de point-sprites do
 * `hero-webgl.js`): feixes de luz que descem de uma fonte no topo, modulados por
 * ruído animado, na cor do universo ativo. WebGL 1.0 puro, blending aditivo.
 *
 * API igual à createHeroWebGL: { start, stop, setPointer, setScroll, destroy }.
 * Devolve `null` se WebGL/compilação falhar (a página cai no fallback). Respeita
 * prefers-reduced-motion (1 quadro e para) e pausa com a aba oculta.
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform float uIntensity;
uniform vec3 uColA; uniform vec3 uColB; uniform vec2 uPtr;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uRes.x / uRes.y;

  /* fonte de luz no topo, segue de leve o ponteiro */
  vec2 src = vec2((uPtr.x - 0.5) * 0.8, 1.25);
  vec2 d = p - src;
  float ang = atan(d.x, -d.y);
  float dist = length(d);

  /* feixes = faixas angulares de ruído animado, em camadas */
  float rays = 0.0;
  rays += noise(vec2(ang * 6.0,  uTime * 0.16)) * 0.6;
  rays += noise(vec2(ang * 13.0 - uTime * 0.10, 3.1)) * 0.3;
  rays += noise(vec2(ang * 27.0 + uTime * 0.06, 7.2)) * 0.15;
  rays = pow(max(rays, 0.0), 2.3);

  float fade = smoothstep(1.9, 0.05, dist);      /* mais forte perto da fonte */
  float beam = rays * fade * uIntensity;

  vec3 col = mix(uColB, uColA, clamp(uv.y, 0.0, 1.0)) * beam * 1.7;
  gl_FragColor = vec4(col, beam);
}`;

function hexToRGB(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

export function createHeroRays(canvas, opts = {}) {
  const { accent = '#d4a24e', accent2 = '#e8c07a' } = opts;
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) || canvas.getContext('experimental-webgl'); }
  catch { return null; }
  if (!gl) return null;

  function shader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
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
    uRes: gl.getUniformLocation(prog, 'uRes'),
    uTime: gl.getUniformLocation(prog, 'uTime'),
    uIntensity: gl.getUniformLocation(prog, 'uIntensity'),
    uColA: gl.getUniformLocation(prog, 'uColA'),
    uColB: gl.getUniformLocation(prog, 'uColB'),
    uPtr: gl.getUniformLocation(prog, 'uPtr')
  };

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc.aPos);
  gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, 0, 0);

  const cA = hexToRGB(accent), cB = hexToRGB(accent2);
  gl.uniform3f(loc.uColA, cA[0], cA[1], cA[2]);
  gl.uniform3f(loc.uColB, cB[0], cB[1], cB[2]);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);     // aditivo = brilho

  let raf = 0, running = false, dead = false, w = 0, h = 0, dpr = 1, tt = 0;
  let everConnected = false, waitFrames = 0, introStart = 0;
  const ptr = { x: 0.5, tx: 0.5 };

  function resize() {
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw <= 1 && nh <= 1) return false;
    w = nw; h = nh; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  }

  function draw() {
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    tt += 0.016;
    if (!introStart) introStart = performance.now();
    const intro = REDUCED ? 1 : Math.min(1, (performance.now() - introStart) / 900);
    const intensity = 0.1 + 0.9 * (1 - Math.pow(1 - intro, 3));

    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform1f(loc.uTime, tt);
    gl.uniform1f(loc.uIntensity, intensity);
    gl.uniform2f(loc.uPtr, ptr.x, 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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
    setPointer(x) { ptr.tx = x; },
    setScroll() {},
    destroy() {
      dead = true; stop();
      document.removeEventListener('visibilitychange', onVis);
      if (ro) ro.disconnect();
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    }
  };
}
