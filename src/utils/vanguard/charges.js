/**
 * Sistemas de armas, munições e CARGAS.
 *
 * ⚠️ **Procedência dos números — leia antes de confiar.**
 * Os valores abaixo são de **REFERÊNCIA DE MODELO**, compilados de dados
 * públicos (velocidade inicial por carga e alcance máximo/mínimo). Eles NÃO
 * são uma tabela de tiro oficial e NÃO substituem uma. Servem para: treinar,
 * bater com o jogo e ter uma base coerente para calibrar depois.
 *
 * O que é honesto neste arquivo: em vez de inventar um coeficiente de
 * arrasto, guardamos o par (v₀, alcance máximo publicado) — que é dado
 * verificável — e **derivamos** o arrasto com `calibrarArrasto()`. Assim a
 * tabela inteira fica consistente com a fonte, e trocar a fonte por uma
 * tabela de tiro real recalibra tudo sozinho.
 *
 * Mesma política do `AIR_FRICTION_REF` do `arma3-balistica.js` no Projeto
 * Baluarte — os dois projetos usam a MESMA formulação de arrasto de
 * propósito, então coeficiente calibrado num vale no outro.
 */

import { calibrarArrasto } from './ballistics.js';

/**
 * @typedef {object} Carga
 * @property {number} id        número da carga (0 = a mais fraca)
 * @property {number} v0        velocidade inicial (m/s)
 * @property {number} alcanceMaxM alcance máximo publicado (m) — usado na calibração
 * @property {number} alcanceMinM alcance mínimo prático (m)
 */

export const SISTEMAS = {
  /* ── O morteiro do Arma 3 ── */
  mk6_82mm: {
    id: 'mk6_82mm',
    nome: 'Mk6 82 mm',
    calibre: 82,
    origem: 'Arma 3 (vanilla)',
    tipo: 'morteiro',
    /* No vanilla o Mk6 não tem seleção de carga: uma velocidade só. As
     * cargas 0–3 abaixo replicam o comportamento do ACE3, que adiciona
     * seleção de carga ao mesmo tubo. Calibre contra a tabela do jogo. */
    jogo: true,
    cargas: [
      { id: 0, v0: 75,  alcanceMaxM: 480,  alcanceMinM: 34 },
      { id: 1, v0: 120, alcanceMaxM: 1400, alcanceMinM: 100 },
      { id: 2, v0: 160, alcanceMaxM: 2450, alcanceMinM: 200 },
      { id: 3, v0: 200, alcanceMaxM: 3800, alcanceMinM: 300 }
    ],
    dispersaoAlcanceRel: 0.010,
    dispersaoDirecaoMil: 3.0,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 6,
    gRecomendado: 9.81 // o Arma usa 9,81 cravado
  },

  /* ── Sistemas reais ── */
  m224_60mm: {
    id: 'm224_60mm',
    nome: 'M224 60 mm',
    calibre: 60,
    origem: 'EUA',
    tipo: 'morteiro leve',
    cargas: [
      { id: 0, v0: 50,  alcanceMaxM: 200,  alcanceMinM: 70 },
      { id: 1, v0: 105, alcanceMaxM: 850,  alcanceMinM: 100 },
      { id: 2, v0: 145, alcanceMaxM: 1550, alcanceMinM: 200 },
      { id: 3, v0: 185, alcanceMaxM: 2400, alcanceMinM: 300 },
      { id: 4, v0: 247, alcanceMaxM: 3490, alcanceMinM: 400 }
    ],
    dispersaoAlcanceRel: 0.012,
    dispersaoDirecaoMil: 4.0,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 5
  },

  m252_81mm: {
    id: 'm252_81mm',
    nome: 'M252 81 mm',
    calibre: 81,
    origem: 'EUA / Reino Unido',
    tipo: 'morteiro médio',
    cargas: [
      { id: 0, v0: 70,  alcanceMaxM: 400,  alcanceMinM: 80 },
      { id: 1, v0: 135, alcanceMaxM: 1300, alcanceMinM: 150 },
      { id: 2, v0: 180, alcanceMaxM: 2300, alcanceMinM: 250 },
      { id: 3, v0: 225, alcanceMaxM: 3800, alcanceMinM: 350 },
      { id: 4, v0: 268, alcanceMaxM: 5608, alcanceMinM: 500 }
    ],
    dispersaoAlcanceRel: 0.009,
    dispersaoDirecaoMil: 3.0,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 5
  },

  m120_120mm: {
    id: 'm120_120mm',
    nome: 'M120/M121 120 mm',
    calibre: 120,
    origem: 'EUA (base Soltam)',
    tipo: 'morteiro pesado',
    cargas: [
      { id: 0, v0: 118, alcanceMaxM: 1100, alcanceMinM: 200 },
      { id: 1, v0: 170, alcanceMaxM: 2300, alcanceMinM: 300 },
      { id: 2, v0: 220, alcanceMaxM: 3800, alcanceMinM: 400 },
      { id: 3, v0: 270, alcanceMaxM: 5500, alcanceMinM: 500 },
      { id: 4, v0: 318, alcanceMaxM: 7200, alcanceMinM: 700 }
    ],
    dispersaoAlcanceRel: 0.008,
    dispersaoDirecaoMil: 2.5,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 6
  },

  podnos_82mm: {
    id: 'podnos_82mm',
    nome: '2B14 Podnos 82 mm',
    calibre: 82,
    origem: 'URSS / Rússia',
    tipo: 'morteiro médio',
    cargas: [
      { id: 0, v0: 80,  alcanceMaxM: 500,  alcanceMinM: 85 },
      { id: 1, v0: 120, alcanceMaxM: 1400, alcanceMinM: 150 },
      { id: 2, v0: 170, alcanceMaxM: 2800, alcanceMinM: 250 },
      { id: 3, v0: 211, alcanceMaxM: 4270, alcanceMinM: 400 }
    ],
    dispersaoAlcanceRel: 0.011,
    dispersaoDirecaoMil: 3.5,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 6
  },

  sani_120mm: {
    id: 'sani_120mm',
    nome: '2S12 Sani 120 mm',
    calibre: 120,
    origem: 'URSS / Rússia',
    tipo: 'morteiro pesado',
    cargas: [
      { id: 0, v0: 120, alcanceMaxM: 1200, alcanceMinM: 480 },
      { id: 1, v0: 180, alcanceMaxM: 2600, alcanceMinM: 600 },
      { id: 2, v0: 250, alcanceMaxM: 4800, alcanceMinM: 800 },
      { id: 3, v0: 325, alcanceMaxM: 7100, alcanceMinM: 1000 }
    ],
    dispersaoAlcanceRel: 0.010,
    dispersaoDirecaoMil: 3.0,
    /* piso de dispersão (m): pontaria + assentamento + incerteza de posição */
    dispersaoBaseM: 7
  }
};

/* Cache dos coeficientes calibrados: a calibração roda bisseção com
 * integração numérica dentro, então custa alguns ms. Faz uma vez por carga. */
const _cacheMu = new Map();

/**
 * Coeficiente de arrasto (μ, negativo) de uma carga — derivado do alcance
 * máximo publicado. Memoizado.
 */
export function arrastoDaCarga(sistemaId, cargaId) {
  const chave = `${sistemaId}:${cargaId}`;
  if (_cacheMu.has(chave)) return _cacheMu.get(chave);

  const sis = SISTEMAS[sistemaId];
  if (!sis) throw new RangeError(`sistema desconhecido: ${sistemaId}`);
  const carga = sis.cargas.find((c) => c.id === cargaId);
  if (!carga) throw new RangeError(`carga ${cargaId} não existe em ${sistemaId}`);

  const mu = calibrarArrasto(carga.v0, carga.alcanceMaxM, { g: sis.gRecomendado ?? undefined });
  _cacheMu.set(chave, mu);
  return mu;
}

/** Lista de sistemas para popular um seletor na UI. */
export function listarSistemas() {
  return Object.values(SISTEMAS).map((s) => ({
    id: s.id,
    nome: s.nome,
    calibre: s.calibre,
    origem: s.origem,
    tipo: s.tipo,
    jogo: !!s.jogo,
    cargas: s.cargas.length,
    alcanceMaxM: Math.max(...s.cargas.map((c) => c.alcanceMaxM))
  }));
}

/**
 * Estimativa da zona batida (elipse de dispersão) para uma solução.
 *
 * Modelo declarado, em duas parcelas somadas em quadratura:
 *
 *  1. **Proporcional à distância** — dispersão balística propriamente dita
 *     (variação de carga, de temperatura do propelente, de arrasto).
 *  2. **Piso absoluto** (`dispersaoBaseM`) — erro que NÃO some quando o alvo
 *     está perto: pontaria do tubo, assentamento da placa-base, e sobretudo
 *     a incerteza da própria posição (um GPS de celular dá 3–5 m em dia bom).
 *
 * Sem o piso, o modelo diria que a 100 m a dispersão é de centímetros — o que
 * é falso e, pior, faria o aviso de segurança nunca disparar justamente na
 * situação mais perigosa. Somar em quadratura é o certo porque são erros
 * independentes.
 *
 * Não é tabela de tiro: é ordem de grandeza para desenhar a elipse e alertar.
 */
export function zonaBatida(sistemaId, distanciaM, { erroPosicaoM = 0 } = {}) {
  const sis = SISTEMAS[sistemaId];
  if (!sis) throw new RangeError(`sistema desconhecido: ${sistemaId}`);
  const base = Math.hypot(sis.dispersaoBaseM ?? 5, erroPosicaoM);

  const peAlcance = Math.hypot(distanciaM * sis.dispersaoAlcanceRel, base);
  const peDirecao = Math.hypot(distanciaM * (sis.dispersaoDirecaoMil / 6400) * 2 * Math.PI, base);

  return {
    /* Erro provável (50 % dos tiros dentro) nos dois eixos. */
    erroProvavelAlcanceM: peAlcance,
    erroProvavelDirecaoM: peDirecao,
    /* Semi-eixos a ~4 EP ≈ praticamente todos os tiros: raio de segurança. */
    semiEixoAlcanceM: peAlcance * 4,
    semiEixoDirecaoM: peDirecao * 4,
    /* Raio único conservador, para checagem rápida de segurança. */
    raioSegurancaM: Math.max(peAlcance, peDirecao) * 4
  };
}
