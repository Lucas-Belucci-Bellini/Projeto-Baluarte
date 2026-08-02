/**
 * Visor 3D universal (#310, fase 2) — abre QUALQUER modelo 3D no site, como
 * qualquer visualizador da web: arquivo local (arrastar/escolher) ou URL, nos
 * formatos .glb / .gltf / .stl / .obj / .fbx. three.js com iluminação de
 * estúdio (RoomEnvironment + ACES), enquadramento automático, OrbitControls
 * e reprodução de animação embutida.
 *
 * Chunk LAZY de propósito (#238 — web leve): a página só faz `import()` deste
 * módulo quando o operador realmente abre um modelo; o three.js (~600 KB) não
 * entra no boot do site.
 *
 * .gltf multi-arquivo funciona no modo local: todos os arquivos soltos juntos
 * (bin/texturas) viram blob-URLs e o LoadingManager resolve os caminhos
 * relativos por nome-base. DRACO usa o decoder SELF-HOSTED (public/modelos-3d/
 * draco/) sob demanda — zero dependência de CDN externo.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sondarWebGL, liberar } from './webgl-probe.js';

export const FORMATOS = ['glb', 'gltf', 'stl', 'obj', 'fbx'];

const extDe = (nome) => {
  const m = String(nome || '').split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
};

/** Acha o arquivo de entrada num drop multi-arquivo (o .glb/.gltf/… principal). */
export function acharEntrada(files) {
  const lista = Array.from(files || []);
  for (const ext of FORMATOS) {
    const f = lista.find((x) => extDe(x.name) === ext);
    if (f) return f;
  }
  return null;
}

async function carregarObjeto({ url, files, nome }) {
  const manager = new THREE.LoadingManager();
  const revogar = [];
  let alvo = url, rotulo = nome || '';

  if (files && files.length) {
    /* mapa nome-base → blob-URL: um .gltf que referencia "textures/cor.png"
     * acha o "cor.png" solto junto no drop (resolvemos pelo nome do arquivo). */
    const porNome = new Map();
    for (const f of Array.from(files)) {
      const b = URL.createObjectURL(f);
      revogar.push(b);
      porNome.set(f.name.toLowerCase(), b);
    }
    const entrada = acharEntrada(files);
    if (!entrada) throw new Error(`Nenhum modelo 3D nos arquivos (aceito: ${FORMATOS.join(', ')}).`);
    alvo = porNome.get(entrada.name.toLowerCase());
    rotulo = rotulo || entrada.name;
    manager.setURLModifier((u) => {
      if (u.startsWith('blob:') || u.startsWith('data:')) return u;
      const base = decodeURIComponent(u.split(/[?#]/)[0].split('/').pop() || '').toLowerCase();
      return porNome.get(base) || u;
    });
  }

  const ext = extDe(rotulo) || extDe(url) || 'glb';
  const fim = () => revogar.forEach((b) => URL.revokeObjectURL(b));

  try {
    if (ext === 'glb' || ext === 'gltf') {
      const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js')
      ]);
      /* DRACO decoder SELF-HOSTED (0.7.2): antes vinha do gstatic CDN — se a
       * rede/CSP bloqueava o CDN, .glb comprimido morria. Agora mora no site
       * (public/modelos-3d/draco/), zero dependência externa. */
      const draco = new DRACOLoader().setDecoderPath(
        (import.meta.env && import.meta.env.BASE_URL || '/') + 'modelos-3d/draco/');
      const loader = new GLTFLoader(manager).setDRACOLoader(draco);
      const gltf = await loader.loadAsync(alvo);
      return { objeto: gltf.scene, clips: gltf.animations || [], rotulo, fim };
    }
    if (ext === 'stl') {
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
      const geo = await new STLLoader(manager).loadAsync(alvo);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x9db4c8, metalness: 0.25, roughness: 0.55 }));
      return { objeto: mesh, clips: [], rotulo, fim };
    }
    if (ext === 'obj') {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const obj = await new OBJLoader(manager).loadAsync(alvo);
      obj.traverse((n) => {
        if (n.isMesh && (!n.material || n.material.type === 'MeshPhongMaterial')) {
          n.material = new THREE.MeshStandardMaterial({ color: 0x9db4c8, metalness: 0.2, roughness: 0.6 });
        }
      });
      return { objeto: obj, clips: [], rotulo, fim };
    }
    if (ext === 'fbx') {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const obj = await new FBXLoader(manager).loadAsync(alvo);
      return { objeto: obj, clips: obj.animations || [], rotulo, fim };
    }
    throw new Error(`Formato ".${ext}" não suportado (aceito: ${FORMATOS.join(', ')}).`);
  } catch (e) {
    fim();
    throw e;
  }
}

/**
 * WebGL disponível NESTE navegador? (0.7.2.1 — autodiagnóstico do "não vai":
 * em máquina com aceleração de hardware desligada/GPU bloqueada, o contexto
 * vem nulo e o three.js morre com erro críptico. Testamos antes e falamos
 * claro o que falta.)
 */
export function diagnosticoWebGL() {
  return sondarWebGL();
}

/**
 * Monta o visor dentro de `host` e carrega o modelo.
 * fonte: { url } OU { files } (FileList/array de File) — `nome` opcional.
 * Devolve controles: { rotulo, temAnimacao, setAnimando, setGiro, recentrar,
 * stats, dispose }.
 */
export async function montarVisor3D(host, fonte) {
  const diag = diagnosticoWebGL();
  if (!diag.ok) {
    throw new Error('WebGL está DESATIVADO neste navegador — sem ele não existe 3D. ' +
      'Ative a aceleração de hardware (Configurações → Sistema → "Usar aceleração de hardware") e recarregue a página.');
  }

  const { objeto, clips, rotulo, fim } = await carregarObjeto(fonte);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 5000);
  /* GPU fraca/bloqueada às vezes recusa contexto com antialias — tenta sem */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'default' });
    } catch (e2) {
      fim();
      throw new Error(`o navegador recusou criar o contexto WebGL (${String(e2 && e2.message).slice(0, 80)}) — ` +
        'tente ativar a aceleração de hardware ou outro navegador.');
    }
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  /* estúdio: IBL do RoomEnvironment (o mesmo look de visor "de site grande").
   * BLINDADO (0.7.10): em GPU AMD via ANGLE/D3D11 o pipeline do PMREM
   * (render targets half-float) às vezes sai PRETO — o modelo montava e
   * ficava todo preto por depender SÓ do environment. Agora é try/catch e,
   * acima de tudo, existem LUZES EXPLÍCITAS (adiante) que garantem o modelo
   * visível mesmo se o IBL falhar. */
  let pmrem = null;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  } catch (e) {
    if (pmrem) { try { pmrem.dispose(); } catch { /* ok */ } pmrem = null; }
    cena.environment = null; // sem IBL: as luzes explícitas assumem
  }

  cena.add(objeto);

  /* enquadramento automático: FIT-TO-VIEW pela esfera envolvente e o FOV real
   * (0.7.2) — antes um fator fixo deixava modelos altos/finos, tipo o soldado,
   * cortados (a câmera nascia perto demais). Agora a distância é calculada pra
   * a esfera caber na vertical E na horizontal do frustum. */
  objeto.updateWorldMatrix(true, true);
  const caixa = new THREE.Box3().setFromObject(objeto);
  /* SkinnedMesh (soldado etc.): a caixa da geometria vem em REST pose e ignora
   * a escala/pose do esqueleto — sai minúscula e a câmera nasce dentro do
   * modelo. Expandir pelas posições reais dos ossos dá o extent de verdade. */
  const p = new THREE.Vector3();
  objeto.traverse((n) => {
    if (n.isSkinnedMesh && n.skeleton) {
      for (const osso of n.skeleton.bones) { osso.getWorldPosition(p); caixa.expandByPoint(p); }
    }
  });
  const centro = caixa.getCenter(new THREE.Vector3());
  const tam = caixa.getSize(new THREE.Vector3()).length() || 1;
  const raio = tam / 2;
  /* aspecto REAL do palco já aqui (a câmera nasce com 1 e só é ajustada
   * depois) — sem isso, palco largo-e-baixo cortava modelo alto. */
  const aspecto = (host.clientWidth || 1) / (host.clientHeight || 1);
  const fov = (camera.fov * Math.PI) / 180;
  const distV = raio / Math.sin(fov / 2);                       // cabe na vertical
  const distH = raio / Math.sin(Math.atan(Math.tan(fov / 2) * Math.max(aspecto, 0.1))); // e na horizontal
  /* folga de 45%: a caixa de skinned-mesh (soldado etc.) costuma vir
   * subestimada — a margem generosa garante o corpo inteiro no quadro. */
  const dist = Math.max(distV, distH) * 1.45;
  camera.near = tam / 1000; camera.far = tam * 100;
  const dir = new THREE.Vector3(0.5, 0.35, 1).normalize();
  camera.position.copy(centro).addScaledVector(dir, dist);

  /* LUZES EXPLÍCITAS (0.7.10) — a correção da "janela preta": antes a cena
   * dependia SÓ do environment (IBL) do PMREM, que sai preto em algumas GPUs
   * (AMD/ANGLE/D3D11) — o modelo montava e ficava todo preto. Estas luzes
   * garantem o modelo visível SEMPRE, com ou sem IBL. Posições em função do
   * tamanho do modelo pra escalar de lanterna a veículo. */
  cena.add(new THREE.HemisphereLight(0xffffff, 0x404654, cena.environment ? 0.9 : 1.6));
  const key = new THREE.DirectionalLight(0xfff4e6, cena.environment ? 1.6 : 2.6);
  key.position.copy(centro).add(new THREE.Vector3(1, 2, 1.5).multiplyScalar(tam));
  cena.add(key);
  const fill = new THREE.DirectionalLight(0xbfd4ec, cena.environment ? 0.7 : 1.2);
  fill.position.copy(centro).add(new THREE.Vector3(-1.5, 0.6, -1).multiplyScalar(tam));
  cena.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, cena.environment ? 0.5 : 0.9);
  back.position.copy(centro).add(new THREE.Vector3(0, 0.8, -2).multiplyScalar(tam));
  cena.add(back);

  const controles = new OrbitControls(camera, renderer.domElement);
  controles.target.copy(centro);
  controles.enableDamping = true;
  controles.autoRotateSpeed = 1.6;
  const poseInicial = { pos: camera.position.clone(), alvo: centro.clone() };

  /* animação embutida (se houver): toca o 1º clip, pausável */
  let mixer = null, animando = false;
  if (clips.length) {
    mixer = new THREE.AnimationMixer(objeto);
    mixer.clipAction(clips[0]).play();
    animando = true;
  }

  const relogio = new THREE.Clock();
  let vivo = true, raf = 0;
  const quadro = () => {
    if (!vivo) return;
    raf = requestAnimationFrame(quadro);
    const dt = relogio.getDelta();
    if (mixer && animando) mixer.update(dt);
    controles.update();
    renderer.render(cena, camera);
  };

  const dimensionar = () => {
    const w = host.clientWidth || 640, hh = host.clientHeight || 480;
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
    renderer.setSize(w, hh);
  };
  dimensionar();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(dimensionar) : null;
  if (ro) ro.observe(host);
  quadro();

  /* contagem de triângulos/vértices pro rodapé de info */
  let tris = 0, verts = 0;
  objeto.traverse((n) => {
    if (n.isMesh && n.geometry) {
      const g = n.geometry;
      verts += (g.attributes.position || {}).count || 0;
      tris += g.index ? g.index.count / 3 : ((g.attributes.position || {}).count || 0) / 3;
    }
  });

  return {
    rotulo,
    temAnimacao: clips.length > 0,
    stats: { tris: Math.round(tris), verts, clips: clips.length },
    setAnimando(on) { animando = !!on; },
    setGiro(on) { controles.autoRotate = !!on; },
    /* amostra o brilho do quadro renderizado (0.7.10): força um frame e LÊ o
     * pixel central de volta — distingue "montou" de "montou e APARECE".
     * É o que o diagnóstico usa pra pegar a tela-preta que o mount não vê. */
    amostraLuminancia() {
      try {
        renderer.render(cena, camera);
        const gl = renderer.getContext();
        const w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight;
        if (!w || !hh) return { ok: false, motivo: 'canvas 0×0' };
        const n = 16;
        const px = new Uint8Array(n * n * 4);
        gl.readPixels((w - n) >> 1, (hh - n) >> 1, n, n, gl.RGBA, gl.UNSIGNED_BYTE, px);
        let soma = 0, max = 0;
        for (let i = 0; i < px.length; i += 4) {
          const l = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
          soma += l; if (l > max) max = l;
        }
        return { ok: max > 8, media: Math.round(soma / (n * n)), max: Math.round(max), largura: w, altura: hh };
      } catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
    },
    recentrar() {
      camera.position.copy(poseInicial.pos);
      controles.target.copy(poseInicial.alvo);
      controles.update();
    },
    dispose() {
      vivo = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      controles.dispose();
      if (mixer) mixer.stopAllAction();
      cena.traverse((n) => {
        if (n.isMesh) {
          if (n.geometry) n.geometry.dispose();
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            if (!m) return;
            Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
            m.dispose();
          });
        }
      });
      if (pmrem) pmrem.dispose();
      /* `dispose()` libera os recursos de GPU, mas NÃO devolve o contexto
       * WebGL — ele só some quando o canvas é coletado, e isso pode demorar.
       * O navegador limita o número de contextos vivos (por volta de 16), então
       * um contexto retido por visita faz a galeria parar de renderizar depois
       * de algumas idas e vindas. `forceContextLoss` é a forma documentada de
       * devolvê-lo na hora. Medido antes: 3 contextos por visita a
       * `/modelos-3d` sem nenhum liberado. */
      try { renderer.forceContextLoss(); } catch { /* contexto já perdido */ }
      renderer.dispose();
      renderer.domElement.remove();
      fim();
    }
  };
}
