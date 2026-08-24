/**
 * A vista do Visor 3D — o consumidor que faz o engine deixar de ser preparação.
 *
 * A cena é DELIBERADAMENTE leve: um icosaedro em wireframe girando, sem textura,
 * sem modelo carregado, sem post-processing. O mega-plano (#238) diz que 3D
 * pesado é do app e a web fica no leve — e como `ambiente` ainda não é cobrado
 * por ninguém no boot da V2, a contenção tem de estar no que a cena É, não no
 * que o manifesto declara.
 *
 * O que esta vista prova, e que nenhum teste de Node alcança: que o engine
 * monta, anima e **descarta** num navegador de verdade.
 */

import * as THREE from 'three';
import { criarCena, iluminarTresPontos } from './cena.js';

/**
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {(Node|string)[]} [filhos]
 * @returns {HTMLElement}
 */
function el(tag, attrs = {}, filhos = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const f of filhos) node.append(f);
  return node;
}

/**
 * Monta a vista da rota `/visor3d`.
 *
 * @returns {HTMLElement} sempre um elemento — inclusive sem WebGL, onde a
 *   mensagem substitui a cena. Devolver `null` faria o router mostrar "falha ao
 *   carregar", que é mentira: a rota funcionou; o 3D é que não cabe nesta
 *   máquina.
 */
export function criarView() {
  const raiz = el('div', { class: 'v2-visor3d' });
  raiz.append(el('h1', {}, ['Visor 3D']));
  raiz.append(el('p', {}, [
    'Engine 3D reutilizável da V2. Cena leve por decisão: o 3D pesado é do app.'
  ]));

  const canvas = /** @type {HTMLCanvasElement} */ (el('canvas', {
    class: 'v2-visor3d__canvas',
    width: '640',
    height: '360',
    'aria-label': 'Cena 3D de demonstração'
  }));
  raiz.append(canvas);

  const cena = criarCena(canvas);
  if (!cena) {
    /* Sem WebGL a rota continua servindo — só o 3D some. É a diferença entre
     * "seu navegador não faz 3D" e "a página quebrou". */
    canvas.remove();
    raiz.append(el('p', { class: 'v2-visor3d__sem-webgl' }, [
      'Este navegador não disponibiliza WebGL — a cena 3D não é exibida.'
    ]));
    raiz.dataset.estado = 'sem-webgl';
    return raiz;
  }

  iluminarTresPontos(cena.palco.scene);

  /* Geometria e material criados UMA vez, fora do laço: criá-los por quadro é o
   * vazamento clássico de Three.js — some memória de GPU até a aba morrer. */
  const geometria = new THREE.IcosahedronGeometry(1.2, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00e0ff, wireframe: true, roughness: 0.4, metalness: 0.3
  });
  const corpo = new THREE.Mesh(geometria, material);
  corpo.name = 'demo';
  cena.montar(({ scene }) => scene.add(corpo));

  cena.aoQuadro((dt) => {
    /* Radianos por SEGUNDO, multiplicados pelo delta — não por quadro. */
    corpo.rotation.y += dt * 0.6;
    corpo.rotation.x += dt * 0.25;
  });

  cena.redimensionar(canvas.clientWidth || 640, canvas.clientHeight || 360);
  cena.iniciar();

  /* O `dispose` do engine percorre a cena e devolve geometria, material e
   * renderer. Sem chamá-lo ao sair da rota, o `requestAnimationFrame` continua
   * para sempre: a GPU segue desenhando uma cena que ninguém vê, e o
   * `sonda-memoria` reprova — com razão. */
  Object.assign(raiz, { destruir: () => cena.dispose() });
  raiz.dataset.estado = 'ativo';
  return raiz;
}
