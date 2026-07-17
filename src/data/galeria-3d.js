/**
 * Galeria 3D do Baluarte — modelos LIVRES hospedados no próprio site, que
 * abrem no visor three.js real (renderiza aqui, sem iframe/CDN de terceiros).
 * É o "clicar e ver 3D que funciona de verdade" (#310 / 0.7.2).
 *
 * ⚠️ NADA aqui é extraído do Arma 3 — os modelos do jogo são conteúdo
 * protegido da Bohemia Interactive e não podem ser republicados (ver #386).
 * Estes são modelos de licença permissiva (Khronos glTF Sample Models e
 * three.js examples), com crédito. O operador adiciona os dele soltando o
 * .glb em public/modelos-3d/ e mais uma entrada aqui.
 */

export const GALERIA_3D = [
  {
    id: 'soldado',
    nome: 'Soldado (animado)',
    arquivo: '/modelos-3d/Soldier.glb',
    tag: 'militar',
    autor: 'three.js examples',
    licenca: 'CC-BY',
    fonte: 'https://github.com/mrdoob/three.js',
    desc: 'Soldado com esqueleto e animação de caminhada — mostra o player de animação do visor.'
  },
  {
    id: 'capacete',
    nome: 'Capacete sci-fi',
    arquivo: '/modelos-3d/capacete-sci-fi.glb',
    tag: 'equipamento',
    autor: 'ctrlaltdavid / theblueturtle_',
    licenca: 'CC-BY 4.0',
    fonte: 'https://github.com/KhronosGroup/glTF-Sample-Models',
    desc: 'DamagedHelmet — o modelo PBR de referência da indústria (metal, emissivos, normal map).'
  },
  {
    id: 'buggy',
    nome: 'Veículo — Buggy',
    arquivo: '/modelos-3d/veiculo-buggy.glb',
    tag: 'veículo',
    autor: 'Cesium',
    licenca: 'Domínio público',
    fonte: 'https://github.com/KhronosGroup/glTF-Sample-Models',
    desc: 'Buggy off-road — modelo pesado (muitas peças), bom teste de enquadramento automático.'
  },
  {
    id: 'lanterna',
    nome: 'Lanterna',
    arquivo: '/modelos-3d/lanterna.glb',
    tag: 'equipamento',
    autor: 'Microsoft / Frank Galligan',
    licenca: 'CC0',
    fonte: 'https://github.com/KhronosGroup/glTF-Sample-Models',
    desc: 'Poste-lanterna com vidro e metal — teste de materiais translúcidos.'
  }
];
