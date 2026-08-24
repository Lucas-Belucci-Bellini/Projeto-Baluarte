/**
 * Engine 3D reutilizável da V2 — cena, câmera, luz, material, animação, descarte.
 *
 * É o que o `V2_MASTER_PLAN` §12 manda **preparar**: um visualizador reutilizável
 * como módulo independente. Não é uma cena do Baluarte; é o que qualquer cena da
 * V2 usa para existir. Quem decide o que aparece é quem chama, por `montar()`.
 *
 * ── Três decisões que valem mais que o código ───────────────────────────────
 *
 * 1. **Sem WebGL, devolve `null`.** Não lança, não desenha caixa de erro, não
 *    deixa um canvas preto. O chamador decide o que mostrar no lugar — é o mesmo
 *    contrato do `src/utils/hero-webgl.js`, e a razão é a mesma: 3D é enfeite
 *    caro, e enfeite que quebra a página é pior que enfeite ausente.
 *
 * 2. **`dispose()` devolve TUDO.** Geometria, material, textura, renderer e o
 *    laço de animação. O projeto tem um portão (`npm run sonda-memoria`) que
 *    reprova timer ou loop pendurado, e engine 3D é o lugar clássico onde eles
 *    vazam: sai da rota, o `requestAnimationFrame` continua rodando para sempre,
 *    segurando a GPU e a aba.
 *
 * 3. **O laço não é dono do tempo.** `deltaTime` vem do `Clock`, então animação
 *    de 90° por segundo é 90° por segundo em 30 fps ou em 144 fps. Somar um passo
 *    fixo por quadro faz a cena correr mais rápido em máquina melhor — defeito
 *    que só aparece na máquina de outra pessoa.
 *
 * O `three` já é dependência declarada (`^0.161.0`) e tinha **um** consumidor
 * (`src/utils/visor-3d.js`, da V1). Este é o primeiro da V2.
 */

import * as THREE from 'three';

/** @typedef {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}} Palco */
/** @typedef {(palco: Palco) => void} Montagem */
/** @typedef {(dt: number, tempo: number, palco: Palco) => void} Quadro */

/**
 * O navegador consegue WebGL?
 *
 * Testa criando um contexto de verdade e descartando — `!!window.WebGLRenderingContext`
 * mente: a classe existe em ambiente onde a criação falha (GPU bloqueada, driver
 * na lista negra, contexto perdido). Perguntar pela classe é perguntar se o
 * navegador CONHECE WebGL, não se ele consegue usar.
 *
 * @param {Document} [doc]
 * @returns {boolean}
 */
export function temWebGL(doc = globalThis.document) {
  if (!doc || typeof doc.createElement !== 'function') return false;
  try {
    const teste = doc.createElement('canvas');
    const ctx = teste.getContext('webgl2') || teste.getContext('webgl');
    if (!ctx) return false;
    /* Devolve o contexto na hora: um canvas de teste segurando GPU seria um
     * vazamento nascido dentro da própria checagem de vazamento. */
    const perder = ctx.getExtension && ctx.getExtension('WEBGL_lose_context');
    if (perder && typeof perder.loseContext === 'function') perder.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Cria o palco 3D sobre um canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{fundo?: number, fov?: number, perto?: number, longe?: number, doc?: Document}} [opcoes]
 * @returns {{
 *   palco: Palco,
 *   montar: (montagem: Montagem) => void,
 *   aoQuadro: (quadro: Quadro) => void,
 *   redimensionar: (largura: number, altura: number) => void,
 *   iniciar: () => void,
 *   parar: () => void,
 *   rodando: () => boolean,
 *   dispose: () => void
 * } | null} `null` quando não há WebGL — o chamador decide o fallback.
 */
export function criarCena(canvas, opcoes = {}) {
  if (!canvas) throw new TypeError('canvas é obrigatório');
  if (!temWebGL(opcoes.doc)) return null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opcoes.fundo ?? 0x05070c);

  const camera = new THREE.PerspectiveCamera(
    opcoes.fov ?? 55,
    1,
    opcoes.perto ?? 0.1,
    opcoes.longe ?? 200
  );
  camera.position.set(0, 1.6, 5);
  camera.lookAt(0, 0, 0);

  /** @type {THREE.WebGLRenderer} */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch {
    /* `temWebGL` disse que dá, e a criação falhou mesmo assim — acontece com
     * contexto perdido entre a checagem e o uso. Cai no mesmo `null` em vez de
     * propagar: para quem chama, "não deu" é uma resposta só. */
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  /** @type {Palco} */
  const palco = { scene, camera, renderer };

  const relogio = new THREE.Clock();
  /** @type {Quadro[]} */
  const quadros = [];
  /** @type {number|null} */
  let raf = null;
  let vivo = true;

  /** @param {number} largura @param {number} altura */
  function redimensionar(largura, altura) {
    if (!vivo || largura <= 0 || altura <= 0) return;
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
    /* `false`: quem manda no tamanho CSS do canvas é o layout, não o renderer.
     * Deixá-lo escrever `style.width` briga com a folha de estilo da página. */
    renderer.setSize(largura, altura, false);
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
  }

  function desenhar() {
    if (!vivo) return;
    raf = requestAnimationFrame(desenhar);
    const dt = relogio.getDelta();
    const tempo = relogio.getElapsedTime();
    for (const q of quadros) q(dt, tempo, palco);
    renderer.render(scene, camera);
  }

  function parar() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }

  return {
    palco,
    /** @param {Montagem} montagem */
    montar(montagem) {
      if (vivo) montagem(palco);
    },
    /** @param {Quadro} quadro */
    aoQuadro(quadro) {
      quadros.push(quadro);
    },
    redimensionar,
    iniciar() {
      if (!vivo || raf !== null) return;
      /* Zera o acumulado: sem isto o 1º quadro recebe todo o tempo decorrido
       * desde a construção, e a cena "pula" no primeiro frame. */
      relogio.getDelta();
      desenhar();
    },
    parar,
    rodando: () => raf !== null,
    dispose() {
      if (!vivo) return;
      vivo = false;
      parar();
      quadros.length = 0;
      /* Percorre a árvore inteira: geometria e material são recursos de GPU e
       * não somem com o garbage collector do JS. Material pode ser array (multi-
       * material), e cada textura dele é outro recurso. */
      scene.traverse((obj) => {
        const malha = /** @type {THREE.Mesh} */ (obj);
        if (malha.geometry) malha.geometry.dispose();
        const mat = malha.material;
        if (!mat) return;
        for (const m of Array.isArray(mat) ? mat : [mat]) {
          const campos = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (m));
          for (const chave of Object.keys(campos)) {
            const valor = campos[chave];
            if (valor && typeof valor === 'object' && 'isTexture' in valor) {
              /** @type {THREE.Texture} */ (valor).dispose();
            }
          }
          m.dispose();
        }
      });
      scene.clear();
      renderer.dispose();
    }
  };
}

/**
 * Iluminação de três pontos — o padrão que faz um objeto ter volume em vez de
 * silhueta chapada.
 *
 * Fica aqui, e não em cada cena, porque toda cena precisa dela e errar a
 * proporção entre key/fill/rim é o jeito mais rápido de um 3D parecer amador.
 *
 * @param {THREE.Scene} scene
 * @returns {THREE.Light[]} as luzes criadas, para quem quiser ajustar depois
 */
export function iluminarTresPontos(scene) {
  /* Cada luz leva `name`. Não é enfeite: é o que deixa quem monta a cena achar e
   * ajustar uma delas (`scene.getObjectByName('rim')`) sem depender da ordem do
   * array — e é o que deixa um teste falar sobre a rim, e não sobre "alguma
   * direcional atrás", que a fill também satisfaz. */
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.name = 'key';
  key.position.set(5, 10, 7.5);

  const fill = new THREE.DirectionalLight(0x9fd4ff, 0.8);
  fill.name = 'fill';
  fill.position.set(-6, 3, -4);

  /* A rim vem de TRÁS, e mais atrás que a fill: é ela que separa o objeto do
   * fundo escuro. Sem rim, cena de fundo escuro vira mancha. */
  const rim = new THREE.DirectionalLight(0x00e0ff, 1.1);
  rim.name = 'rim';
  rim.position.set(0, 4, -10);

  const ambiente = new THREE.AmbientLight(0x404860, 0.6);
  ambiente.name = 'ambiente';

  /** @type {THREE.Light[]} */
  const luzes = [key, fill, rim, ambiente];
  luzes.forEach((l) => scene.add(l));
  return luzes;
}
