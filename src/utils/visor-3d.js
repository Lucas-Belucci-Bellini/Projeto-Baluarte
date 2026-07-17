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
 * relativos por nome-base. DRACO usa o decoder oficial (gstatic) sob demanda.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
 * Monta o visor dentro de `host` e carrega o modelo.
 * fonte: { url } OU { files } (FileList/array de File) — `nome` opcional.
 * Devolve controles: { rotulo, temAnimacao, setAnimando, setGiro, recentrar,
 * stats, dispose }.
 */
export async function montarVisor3D(host, fonte) {
  const { objeto, clips, rotulo, fim } = await carregarObjeto(fonte);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 5000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  /* estúdio: IBL do RoomEnvironment (o mesmo look de visor "de site grande") */
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

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
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      fim();
    }
  };
}
