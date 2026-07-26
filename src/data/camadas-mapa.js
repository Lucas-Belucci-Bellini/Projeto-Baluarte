/**
 * Catálogo de camadas de mapa — COMPARTILHADO entre Projeto Baluarte e
 * Project Vanguard.
 *
 * ⚠️ Este arquivo tem API IDÊNTICA nos dois repositórios, de propósito — a
 * mesma decisão do `helpers.js`. O Baluarte monta o `/mapa` (multi-camada,
 * terreno 3D, tempo real) e o Vanguard monta o GPS topográfico tático; os dois
 * querem as MESMAS fontes de tile. Mantê-las em dois lugares faria uma ganhar
 * uma camada nova e a outra não, sem ninguém perceber.
 *
 * Ao mexer aqui, copie para o repo irmão:
 *   Projeto-Baluarte/src/data/camadas-mapa.js
 *   Project-Vanguard/src/data/camadas-mapa.js
 *
 * Regras que valem pras duas pontas:
 *   - Nenhuma fonte exige chave de API. Se exigir, não entra: o site é
 *     estático e a chave ficaria exposta no bundle.
 *   - `creditos` é obrigatório. Tile de terceiro sem atribuição visível é
 *     violação de licença, não descuido de UI.
 *   - Nada de DOM aqui: é só dado. Isso é o que permite o Vanguard importar
 *     sem quebrar a regra de `src/engine/` (zero DOM, zero dependência).
 */

/* A imagem MODIS mais recente publicada é a de ~36 h atrás; pedir a de hoje
 * devolve tile vazio. */
export function dataGibs(agora = Date.now()) {
  return new Date(agora - 36 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Camadas BASE — mutuamente exclusivas (uma de cada vez).
 * `padrao: true` marca a que abre ligada.
 */
export const CAMADAS_BASE = [
  {
    id: 'sat',
    nome: 'Satélite',
    desc: 'Imagem de satélite de alta resolução — o padrão para reconhecimento.',
    padrao: true,
    tileSize: 256,
    maxzoom: 22,
    tiles: [
      'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    ],
    creditos: '© Google',
  },
  {
    id: 'terreno',
    nome: 'Topográfico',
    desc: 'Curvas de nível, trilhas e cotas — a carta topográfica clássica.',
    tileSize: 256,
    maxzoom: 17,
    tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
    creditos: '© OpenTopoMap · © OpenStreetMap',
  },
  {
    id: 'dark',
    nome: 'Tático escuro',
    desc: 'Base escura de baixo contraste — sobreposição tática legível à noite.',
    tileSize: 256,
    maxzoom: 19,
    tiles: [
      'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    ],
    creditos: '© CARTO · © OpenStreetMap',
  },
  {
    id: 'imagery',
    nome: 'Satélite (ESRI)',
    desc: 'Segunda fonte de imagem — útil quando a primeira não cobre a área.',
    tileSize: 256,
    maxzoom: 19,
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    creditos: '© Esri · Maxar · Earthstar Geographics',
  },
];

/**
 * SOBREPOSIÇÕES — ligam e desligam por cima da base.
 * `tipo` diz como a camada é montada no MapLibre.
 */
export const CAMADAS_OVERLAY = [
  {
    id: 'labels',
    nome: 'Nomes e rótulos',
    desc: 'Só os topônimos, para pôr por cima do satélite.',
    tipo: 'raster',
    padrao: true,
    tileSize: 256,
    maxzoom: 20,
    tiles: [
      'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
    ],
    creditos: '© CARTO · © OpenStreetMap',
  },
  {
    id: 'gibs',
    nome: 'MODIS (satélite de ontem)',
    desc: 'Imagem global diária da NASA — nuvem, fumaça e neve do dia anterior.',
    tipo: 'raster',
    tileSize: 256,
    maxzoom: 9,
    opacidade: 0.85,
    tiles: [
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor'
      + `/default/${dataGibs()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    ],
    creditos: '© NASA GIBS / MODIS Terra',
  },
  {
    id: 'gebco',
    nome: 'Batimetria (GEBCO)',
    desc: 'Relevo do fundo do mar.',
    tipo: 'raster',
    tileSize: 256,
    opacidade: 0.7,
    tiles: [
      'https://wms.gebco.net/mapserv?request=GetMap&service=WMS&version=1.3.0'
      + '&layers=GEBCO_LATEST&styles=&format=image/png&transparent=true'
      + '&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}',
    ],
    creditos: '© GEBCO',
  },
  {
    id: 'hillshade',
    nome: 'Sombreamento do relevo',
    desc: 'Realce de encosta a partir do DEM — leitura rápida do terreno.',
    tipo: 'hillshade',
    fonteDem: 'dem',
    exageroPadrao: 0.5,
    creditos: '© Mapzen / AWS Terrain Tiles',
  },
];

/**
 * Modelo de elevação. Serve para dois usos distintos: sombreamento (acima) e
 * terreno 3D. `encoding: 'terrarium'` é obrigatório — sem ele o MapLibre lê a
 * altitude com a fórmula errada e o relevo sai deformado, não vazio, que é o
 * tipo de bug que passa despercebido.
 */
export const CAMADA_DEM = {
  id: 'dem',
  nome: 'Elevação (DEM)',
  tipo: 'raster-dem',
  tileSize: 256,
  maxzoom: 15,
  encoding: 'terrarium',
  tiles: ['https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png'],
  creditos: '© Mapzen / AWS Terrain Tiles',
};

/** Todas as atribuições que precisam aparecer na tela, sem repetir. */
export function creditosDe(ids = null) {
  const todas = [...CAMADAS_BASE, ...CAMADAS_OVERLAY, CAMADA_DEM];
  const alvo = ids ? todas.filter((c) => ids.includes(c.id)) : todas;
  return [...new Set(alvo.map((c) => c.creditos).filter(Boolean))];
}

/** Uma camada pelo id, em qualquer um dos grupos. */
export function camadaPorId(id) {
  return [...CAMADAS_BASE, ...CAMADAS_OVERLAY, CAMADA_DEM].find((c) => c.id === id) || null;
}

/**
 * Monta o objeto `style` do MapLibre a partir do catálogo.
 *
 * `glyphs` aponta para o servidor de fontes do MapLibre porque camada do tipo
 * `symbol` (rótulo vetorial) não renderiza sem ele. Quem não usa `symbol` pode
 * passar `glyphs: null` e economizar a dependência de rede — é o caso do
 * Vanguard, que desenha o texto do grid em canvas 2D justamente para não
 * depender de fonte de terceiro.
 */
export function estiloMapLibre({
  base = 'sat',
  overlays = ['labels'],
  glyphs = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  incluirDem = true,
} = {}) {
  const sources = {};
  const layers = [];

  for (const c of CAMADAS_BASE) {
    sources[c.id] = {
      type: 'raster', tiles: c.tiles, tileSize: c.tileSize,
      maxzoom: c.maxzoom, attribution: c.creditos,
    };
  }
  if (incluirDem) {
    sources[CAMADA_DEM.id] = {
      type: 'raster-dem', tiles: CAMADA_DEM.tiles, tileSize: CAMADA_DEM.tileSize,
      maxzoom: CAMADA_DEM.maxzoom, encoding: CAMADA_DEM.encoding,
      attribution: CAMADA_DEM.creditos,
    };
  }
  for (const c of CAMADAS_OVERLAY) {
    if (c.tipo === 'raster') {
      sources[c.id] = {
        type: 'raster', tiles: c.tiles, tileSize: c.tileSize,
        maxzoom: c.maxzoom, attribution: c.creditos,
      };
    }
  }

  /* Bases primeiro, só a escolhida visível: trocar de base é alternar
   * visibilidade, não recriar a fonte (o que descartaria o cache de tiles). */
  for (const c of CAMADAS_BASE) {
    layers.push({
      id: `base-${c.id}`, type: 'raster', source: c.id,
      layout: { visibility: c.id === base ? 'visible' : 'none' },
    });
  }
  for (const c of CAMADAS_OVERLAY) {
    const visivel = overlays.includes(c.id);
    if (c.tipo === 'raster') {
      layers.push({
        id: `${c.id}-layer`, type: 'raster', source: c.id,
        layout: { visibility: visivel ? 'visible' : 'none' },
        paint: c.opacidade ? { 'raster-opacity': c.opacidade } : {},
      });
    } else if (c.tipo === 'hillshade' && incluirDem) {
      layers.push({
        id: `${c.id}`, type: 'hillshade', source: c.fonteDem,
        layout: { visibility: visivel ? 'visible' : 'none' },
        paint: { 'hillshade-exaggeration': c.exageroPadrao },
      });
    }
  }

  const style = { version: 8, sources, layers };
  if (glyphs) style.glyphs = glyphs;
  return style;
}
