/**
 * Cena do NÚCLEO J.A.R.V.I.S. (Fase A do #316) — porta do `jarvis-nucleo.html`
 * do operador pra um módulo do site: núcleo procedural (Simplex noise) + anéis
 * de dados + constelação neural com sinapses vivas + poeira, com pós-processo
 * (UnrealBloom + Glitch). Vira o **backdrop vivo** do cockpit do Núcleo de IA.
 *
 * PESADO E APP-ONLY (#238): o Three.js e os passes são **dynamic-imported aqui
 * dentro** — não entram no bundle do site nem quando este módulo é importado;
 * só baixam quando `mountNucleoScene()` roda (e o cockpit só roda no app).
 *
 * Cores 100% por TOKEN (segue o tema Ouro/Rubi/Esmeralda) e reage a
 * `baluarte:theme`. Respeita prefers-reduced-motion (cena parada, sem glitch).
 * Auto-limpa (MutationObserver) ao sair do DOM. API:
 *   const scene = await mountNucleoScene(container);
 *   scene.pulse(ms);   // "pulso de dados" (glitch) — pra eventos (Fase D)
 *   scene.destroy();
 */

import { storage } from '../core/storage.js';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Lê uma cor de token do <html> (com fallback), como hex 0x…. */
function tokenHex(name, fb) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const m = /^#?([0-9a-f]{6})$/i.exec(v);
    if (m) return parseInt(m[1], 16);
  } catch { /* ignore */ }
  return fb;
}
/* Clareia um hex (mix com branco) — pro núcleo/constelação brilharem. */
function lighten(hex, t) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const L = (c) => Math.round(c + (255 - c) * t);
  return (L(r) << 16) | (L(g) << 8) | L(b);
}

/** Paleta da cena a partir dos tokens do tema ativo. */
function palette() {
  const accent = tokenHex('--color-cyan', 0xf0a83c);
  const accent2 = tokenHex('--color-magenta', 0xffb347);
  return {
    cCore: lighten(accent, 0.45),   // núcleo (micropartículas) — dourado claro
    cRings: accent,                 // anéis de dados
    cRingAlt: accent2,              // anéis alternados / nós
    cConstel: lighten(accent2, 0.3),// constelação neural
    cAmber: accent2,                // poeira quente
    bg: tokenHex('--color-bg', 0x04050a)
  };
}

const CFG = {
  spinCore: 0.10, spinRings: 0.5, spinDust: 0.03,
  coreDetail: 3,      // 3=642 pts (backdrop leve); sobe p/ 4 = 2562 se quiser
  ringCount: 6, constelPts: 120, dustCount: 1200,
  noiseFreq: 1.5, noiseAmp: 0.42, noiseSpeed: 0.35, pulseSpeed: 1.3, pulseAmt: 0.14,
  bloomStrength: 0.6, bloomRadius: 0.5, bloomThreshold: 0.32,
  parallax: 0.4
};

export async function mountNucleoScene(container) {
  /* ---- carrega Three.js + passes SOB DEMANDA (lazy, app-only) ---- */
  const THREE = await import('three');
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { GlitchPass }, { SimplexNoise }] = await Promise.all([
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
    import('three/examples/jsm/postprocessing/GlitchPass.js'),
    import('three/examples/jsm/math/SimplexNoise.js')
  ]);

  let COL = palette();
  const W = () => container.clientWidth || 1;
  const H = () => container.clientHeight || 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COL.bg, 0.035);
  const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';

  const simplex = new SimplexNoise();
  const coreGroup = new THREE.Group(); scene.add(coreGroup);

  /* ---- núcleo quântico: micropartículas numa esfera, deformadas por noise ---- */
  const geo = new THREE.IcosahedronGeometry(2.0, CFG.coreDetail);
  const coreBase = Float32Array.from(geo.attributes.position.array);
  const coreNormals = new Float32Array(coreBase.length);
  for (let i = 0; i < coreBase.length; i += 3) {
    const v = new THREE.Vector3(coreBase[i], coreBase[i + 1], coreBase[i + 2]).normalize();
    coreNormals[i] = v.x; coreNormals[i + 1] = v.y; coreNormals[i + 2] = v.z;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(coreBase), 3));
  const coreMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(COL.cCore) },
      uSize: { value: 3.4 }, uPixel: { value: Math.min(devicePixelRatio, 2) },
      uFadeNear: { value: 4.0 }, uFadeFar: { value: 22.0 }
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uSize; uniform float uPixel; varying float vDist;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vDist=-mv.z;
        gl_PointSize=uSize*uPixel*(60.0/vDist); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uFadeNear; uniform float uFadeFar; varying float vDist;
      void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard;
        float core=smoothstep(0.5,0.0,d); float fade=smoothstep(uFadeFar,uFadeNear,vDist);
        gl_FragColor=vec4(uColor, core*fade*0.5); }`
  });
  const corePoints = new THREE.Points(pGeo, coreMat); coreGroup.add(corePoints);
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20),
    new THREE.MeshBasicMaterial({ color: COL.cRingAlt, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  heart.name = 'heart'; coreGroup.add(heart);

  /* ---- anéis de dados ---- */
  const circle = (radius, seg) => {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  };
  const rings = [];
  for (let i = 0; i < CFG.ringCount; i++) {
    const g = new THREE.Group(); const R = 3.2 + i * 0.62; const col = i % 2 ? COL.cRingAlt : COL.cRings;
    const dash = new THREE.Line(circle(R, 220), new THREE.LineDashedMaterial({ color: col, transparent: true, opacity: 0.5 - i * 0.03, dashSize: 0.12 + (i % 3) * 0.1, gapSize: 0.06 + (i % 2) * 0.12, blending: THREE.AdditiveBlending }));
    dash.computeLineDistances(); g.add(dash);
    const marks = i % 2 === 0 ? 72 : 48, mv = [];
    for (let k = 0; k < marks; k++) { const a = k / marks * Math.PI * 2; const inner = (k % 6 === 0) ? R - 0.22 : R - 0.09; mv.push(Math.cos(a) * inner, Math.sin(a) * inner, 0, Math.cos(a) * R, Math.sin(a) * R, 0); }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(mv, 3));
    g.add(new THREE.LineSegments(mg, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })));
    const nodes = 3 + (i % 4), nv = [], vv = [];
    for (let k = 0; k < nodes; k++) { const a = (k / nodes) * Math.PI * 2 + i; const x = Math.cos(a) * R, y = Math.sin(a) * R; nv.push(x, y, 0); vv.push(x, y, 0, Math.cos(a) * (R + 0.3), Math.sin(a) * (R + 0.3), 0); }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(nv, 3));
    g.add(new THREE.Points(ng, new THREE.PointsMaterial({ color: COL.cRingAlt, size: 0.14, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
    const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.Float32BufferAttribute(vv, 3));
    g.add(new THREE.LineSegments(vg, new THREE.LineBasicMaterial({ color: COL.cRingAlt, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })));
    g.rotation.x = Math.PI * (0.1 + i * 0.16); g.rotation.y = Math.PI * (i * 0.21);
    g.userData.spin = { x: (Math.random() - 0.5) * CFG.spinRings, y: (Math.random() - 0.5) * CFG.spinRings, z: (0.3 + Math.random() * 0.6) * CFG.spinRings * (i % 2 ? 1 : -1) };
    coreGroup.add(g); rings.push(g);
  }

  /* ---- Fase B (#316): moldura OPCIONAL assada no Blender (GLB) ----
   * Otimização: a estrutura complexa (carcaça/anéis) pode vir de um .glb
   * pré-assado (normais/AO), aliviando a CPU/GPU — o procedural fica só no que
   * precisa ser vivo (núcleo de partículas + constelação + bloom). OPT-IN: só
   * carrega se houver caminho salvo em `nucleo:glbUrl` (a sessão local solta o
   * asset em public/models/nucleo/ e aponta a URL). Sem asset → procedural
   * (comportamento atual, zero 404). Ver docs/HANDOFF-LOCAL.md (M-B). */
  let glbUrl = '';
  try { glbUrl = storage.get('nucleo:glbUrl', '') || ''; } catch { /* sem storage */ }
  if (glbUrl) {
    import('three/examples/jsm/loaders/GLTFLoader.js')
      .then(({ GLTFLoader }) => new Promise((res, rej) => new GLTFLoader().load(glbUrl, res, undefined, rej)))
      .then((gltf) => {
        const mesh = gltf.scene;
        coreGroup.add(mesh);
        rings.forEach((r) => { r.visible = false; });   // o GLB substitui a moldura procedural
      })
      .catch(() => { /* falhou/ausente → mantém a moldura procedural */ });
  }

  /* ---- constelação neural + sinapses ---- */
  const n = CFG.constelPts;
  const constelBase = new Float32Array(n * 3), cur = new Float32Array(n * 3), constelVel = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 5.5 + Math.random() * 4.5, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(ph) * Math.cos(th), y = r * Math.sin(ph) * Math.sin(th) * 0.8, z = r * Math.cos(ph);
    constelBase[i * 3] = x; constelBase[i * 3 + 1] = y; constelBase[i * 3 + 2] = z;
    cur[i * 3] = x; cur[i * 3 + 1] = y; cur[i * 3 + 2] = z;
  }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cur, 3));
  const constel = new THREE.Points(cg, new THREE.PointsMaterial({ color: COL.cConstel, size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(constel);
  const maxLinks = n * 6;
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
  linkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
  const linkMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.LineSegments(linkGeo, linkMat));

  function updateLinks(t) {
    const pos = constel.geometry.attributes.position.array;
    const lp = linkGeo.attributes.position.array, lc = linkGeo.attributes.color.array;
    const maxD = 2.9, base = new THREE.Color(COL.cConstel);
    let li = 0, ci = 0, count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < maxD) {
          const b = (1 - d / maxD) * (0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + (i * 13 + j) * 0.7)));
          lp[li++] = pos[i * 3]; lp[li++] = pos[i * 3 + 1]; lp[li++] = pos[i * 3 + 2];
          lp[li++] = pos[j * 3]; lp[li++] = pos[j * 3 + 1]; lp[li++] = pos[j * 3 + 2];
          for (let k = 0; k < 2; k++) { lc[ci++] = base.r * b; lc[ci++] = base.g * b; lc[ci++] = base.b * b; }
          count++; if (li >= lp.length - 6) { i = n; break; }
        }
      }
    }
    linkGeo.setDrawRange(0, count * 2);
    linkGeo.attributes.position.needsUpdate = true; linkGeo.attributes.color.needsUpdate = true;
  }

  /* ---- poeira ---- */
  const dp = new Float32Array(CFG.dustCount * 3);
  for (let i = 0; i < CFG.dustCount; i++) { const r = 11 + Math.random() * 24, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1); dp[i * 3] = r * Math.sin(ph) * Math.cos(th); dp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); dp[i * 3 + 2] = r * Math.cos(ph); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: COL.cAmber, size: 0.09, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  /* ---- pós-processo: bloom + glitch ---- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), CFG.bloomStrength, CFG.bloomRadius, CFG.bloomThreshold);
  composer.addPass(bloom);
  const glitch = new GlitchPass(); glitch.enabled = false; composer.addPass(glitch);
  composer.setSize(W(), H());

  let glitchUntil = 0;
  function pulse(ms) { glitch.enabled = true; glitchUntil = performance.now() + (ms || 260); }

  /* ---- interação (parallax) ---- */
  const target = { x: 0, y: 0 }, camCur = { x: 0, y: 0 };
  const onMove = (e) => { target.x = (e.clientX / innerWidth - 0.5); target.y = (e.clientY / innerHeight - 0.5); };
  if (!REDUCED) addEventListener('mousemove', onMove);
  const onResize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); composer.setSize(W(), H()); bloom.setSize(W(), H()); };
  addEventListener('resize', onResize);

  /* atualiza cores no troca-tema */
  const onTheme = () => {
    COL = palette();
    coreMat.uniforms.uColor.value.setHex(COL.cCore);
    heart.material.color.setHex(COL.cRingAlt);
    dust.material.color.setHex(COL.cAmber);
    constel.material.color.setHex(COL.cConstel);
    scene.fog.color.setHex(COL.bg);
  };
  document.addEventListener('baluarte:theme', onTheme);

  /* ---- loop ---- */
  const clock = new THREE.Clock();
  let raf = 0, dead = false;
  function frame() {
    if (dead) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsedTime();
    const pos = corePoints.geometry.attributes.position.array;
    const pl = 1 + Math.sin(t * CFG.pulseSpeed) * CFG.pulseAmt;
    for (let i = 0; i < pos.length; i += 3) {
      const bx = coreBase[i], by = coreBase[i + 1], bz = coreBase[i + 2];
      const nx = coreNormals[i], ny = coreNormals[i + 1], nz = coreNormals[i + 2];
      const nv = simplex.noise3d(bx * CFG.noiseFreq + t * CFG.noiseSpeed, by * CFG.noiseFreq, bz * CFG.noiseFreq - t * CFG.noiseSpeed);
      const disp = (0.5 + nv * 0.5) * CFG.noiseAmp * pl;
      pos[i] = (bx + nx * disp) * pl; pos[i + 1] = (by + ny * disp) * pl; pos[i + 2] = (bz + nz * disp) * pl;
    }
    corePoints.geometry.attributes.position.needsUpdate = true;
    heart.scale.setScalar(pl * 1.05); heart.material.opacity = 0.1 + 0.06 * Math.sin(t * CFG.pulseSpeed);
    coreGroup.rotation.y += dt * CFG.spinCore; coreGroup.rotation.x = Math.sin(t * 0.18) * 0.12;
    rings.forEach((r) => { const s = r.userData.spin; r.rotation.x += dt * s.x; r.rotation.y += dt * s.y; r.rotation.z += dt * s.z; });
    const cp = constel.geometry.attributes.position.array;
    for (let i = 0; i < n; i++) {
      const ix = i * 3;
      constelVel[ix] += (constelBase[ix] - cp[ix]) * 2.2 * dt;
      constelVel[ix + 1] += (constelBase[ix + 1] - cp[ix + 1]) * 2.2 * dt;
      constelVel[ix + 2] += (constelBase[ix + 2] - cp[ix + 2]) * 2.2 * dt;
      constelVel[ix] *= 0.9; constelVel[ix + 1] *= 0.9; constelVel[ix + 2] *= 0.9;
      cp[ix] += constelVel[ix]; cp[ix + 1] += constelVel[ix + 1]; cp[ix + 2] += constelVel[ix + 2];
    }
    constel.geometry.attributes.position.needsUpdate = true; constel.rotation.y += dt * 0.05;
    updateLinks(t);
    dust.rotation.y += dt * CFG.spinDust; dust.rotation.x += dt * CFG.spinDust * 0.4;
    camCur.x += (target.x - camCur.x) * 0.045; camCur.y += (target.y - camCur.y) * 0.045;
    camera.position.x = camCur.x * 7 * CFG.parallax; camera.position.y = -camCur.y * 5 * CFG.parallax; camera.lookAt(0, 0, 0);
    if (glitch.enabled && performance.now() > glitchUntil) glitch.enabled = false;
    composer.render();
    if (REDUCED) return;            // 1 quadro e para
    raf = requestAnimationFrame(frame);
  }
  frame();

  function destroy() {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf);
    removeEventListener('mousemove', onMove); removeEventListener('resize', onResize);
    document.removeEventListener('baluarte:theme', onTheme);
    try { renderer.dispose(); composer.dispose && composer.dispose(); } catch { /* ok */ }
    try { renderer.domElement.remove(); } catch { /* ok */ }
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { const m = o.material; (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose && x.dispose()); } });
  }

  /* auto-limpeza ao sair do DOM (troca de rota/aba) */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => { if (!document.contains(container)) { destroy(); mo.disconnect(); } });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return { pulse, destroy };
}
