/**
 * Contrato **Fire Mission** — a fronteira entre o GPS e o computador de tiro.
 *
 * O GPS sabe ONDE estão a peça e o alvo. O computador sabe COMO acertar.
 * Este módulo é o pacote que atravessa essa fronteira, e ele é desenhado
 * para ser transportado por qualquer coisa: chamada de função no mesmo
 * processo, `postMessage` para um Web Worker, HTTP `POST /api/fire-mission`
 * ou frame de WebSocket. **A mesma função resolve nos quatro casos** — é o
 * que evita ter duas implementações da física divergindo com o tempo.
 *
 * ── Pedido (`vanguard.fire-mission/1`) ───────────────────────────────────
 * {
 *   "schema": "vanguard.fire-mission/1",
 *   "id": "FM-001",
 *   "peca":  { "pos": {...}, "sistema": "m252_81mm", "cargas": [0,1,2,3,4] },
 *   "alvo":  { "pos": {...}, "id": "TGT-ALFA" },
 *   "ambiente": { "ventoVelocidadeMs": 6, "ventoDirecaoDeg": 270,
 *                 "declinacaoMagDeg": -21.5, "gravidade": 9.80665 },
 *   "opcoes": { "modo": "alto", "sistemaMil": "nato", "solver": "arrasto" }
 * }
 *
 * `pos` aceita três formatos, e misturar é permitido (alvo em MGRS, peça em
 * lat/lon, por exemplo):
 *   { "tipo": "latlon", "lat": -22.95, "lon": -43.21, "alt": 30 }
 *   { "tipo": "mgrs",   "valor": "23K PQ 83477 60685", "alt": 30 }
 *   { "tipo": "local",  "x": 12340, "y": 5670, "alt": 30 }   ← metros do mundo
 *   { "tipo": "local",  "grid": "034056", "terreno": "altis", "alt": 30 }
 *
 * A última forma é a grade lida NA CARTA DO ARMA 3: com `terreno`, o grid é
 * convertido pelo config daquele mundo (offset e sinal do passo). Sem
 * `terreno`, `grid` cai na grade local genérica do `gridref.js` — que é a
 * convenção MGRS e está invertida no eixo N-S em quase todo mapa do jogo.
 *
 * ── Resposta (`vanguard.fire-solution/1`) ────────────────────────────────
 * Ver `resolverMissao()`. O princípio: devolver **números prontos para gritar
 * no rádio** (azimute em mils, elevação em mils, tempo de voo em segundos) e
 * os dados brutos junto, para a tela desenhar sem recalcular nada.
 */

import { radToMil, normDeg } from './angles.js';
import { gridVector, mgrsParaLatLon, convergenciaMeridianos } from './mgrs.js';
import { gridParaLocal, vetorLocal } from './gridref.js';
import { acharTerreno, gradeParaMetros } from './arma3-grid.js';
import { resolverVacuo, resolverComArrasto, MODO, G_PADRAO } from './ballistics.js';
import { SISTEMAS, arrastoDaCarga, zonaBatida } from './charges.js';

export const SCHEMA_PEDIDO = 'vanguard.fire-mission/1';
export const SCHEMA_RESPOSTA = 'vanguard.fire-solution/1';
export const VERSAO_MOTOR = '1.0.0';

/**
 * Normaliza qualquer um dos três formatos de posição.
 * @returns {{tipo:'geo'|'local', lat?:number, lon?:number, x?:number, y?:number, alt:number}}
 */
export function normalizarPosicao(pos, rotulo = 'posição') {
  if (!pos || typeof pos !== 'object') {
    throw new TypeError(`${rotulo}: objeto de posição ausente`);
  }
  const alt = Number.isFinite(pos.alt) ? pos.alt : 0;

  switch (pos.tipo) {
    case 'latlon': {
      if (!Number.isFinite(pos.lat) || !Number.isFinite(pos.lon)) {
        throw new TypeError(`${rotulo}: lat/lon inválidos`);
      }
      return { tipo: 'geo', lat: pos.lat, lon: pos.lon, alt };
    }
    case 'mgrs': {
      const { lat, lon } = mgrsParaLatLon(pos.valor);
      return { tipo: 'geo', lat, lon, alt };
    }
    case 'local': {
      /* aceita x/y numéricos OU a string de grid ("123456") */
      if (typeof pos.grid === 'string') {
        /* Com `terreno`, a grade é lida pelo config DAQUELE mundo do Arma 3:
         * offset e SINAL do passo. Sem ele, cai na grade local genérica
         * (origem no canto sudoeste, northing pra cima), que é a convenção
         * MGRS — e que está INVERTIDA em 30 dos 31 mundos do jogo. Por isso o
         * terreno não tem padrão: adivinhar erraria o eixo N-S calado. */
        if (pos.terreno) {
          const t = acharTerreno(pos.terreno);
          if (!t) throw new RangeError(`${rotulo}: terreno "${pos.terreno}" não está na base`);
          if (!t.grade) {
            throw new RangeError(`${rotulo}: o terreno ${t.nome} não declara grade no config — `
              + 'informe x/y em metros do mundo');
          }
          const m = gradeParaMetros(pos.grid, t);
          if (!m) throw new SyntaxError(`${rotulo}: grade "${pos.grid}" ilegível (use 4 a 10 dígitos, em par)`);
          return { tipo: 'local', x: m.x, y: m.y, alt };
        }
        const g = gridParaLocal(pos.grid);
        return { tipo: 'local', x: g.x, y: g.y, alt };
      }
      if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
        throw new TypeError(`${rotulo}: x/y locais inválidos`);
      }
      return { tipo: 'local', x: pos.x, y: pos.y, alt };
    }
    default:
      throw new TypeError(`${rotulo}: tipo de posição desconhecido "${pos.tipo}"`);
  }
}

/** Valida o pedido e devolve a lista de problemas (vazia = ok). */
export function validarMissao(missao) {
  const erros = [];
  if (!missao || typeof missao !== 'object') return ['pedido não é um objeto'];
  if (missao.schema && missao.schema !== SCHEMA_PEDIDO) {
    erros.push(`schema "${missao.schema}" não suportado (esperado "${SCHEMA_PEDIDO}")`);
  }
  if (!missao.peca?.pos) erros.push('peca.pos ausente');
  if (!missao.alvo?.pos) erros.push('alvo.pos ausente');

  const sisId = missao.peca?.sistema;
  if (!sisId) erros.push('peca.sistema ausente');
  else if (!SISTEMAS[sisId]) erros.push(`peca.sistema "${sisId}" desconhecido`);

  try {
    if (missao.peca?.pos) normalizarPosicao(missao.peca.pos, 'peca.pos');
    if (missao.alvo?.pos) normalizarPosicao(missao.alvo.pos, 'alvo.pos');
  } catch (e) {
    erros.push(e.message);
  }

  const p = missao.peca?.pos && (() => { try { return normalizarPosicao(missao.peca.pos); } catch { return null; } })();
  const a = missao.alvo?.pos && (() => { try { return normalizarPosicao(missao.alvo.pos); } catch { return null; } })();
  if (p && a && p.tipo !== a.tipo) {
    /* Misturar geo com local não tem como funcionar: são quadros diferentes
     * sem uma âncora que os relacione. Falha explícita > resposta errada. */
    erros.push('peça e alvo em quadros diferentes (um geográfico, outro local) — converta antes com criarQuadro()');
  }

  /* Dois TERRENOS diferentes é o mesmo erro num disfarce pior: os dois viram
   * `local` e a conta fecha, devolvendo um azimute com cara de válido entre
   * pontos de mundos que não se tocam. Só pega quando ambos declaram terreno —
   * grade sem terreno é a grade genérica, e aí não há o que comparar. */
  const tp = missao.peca?.pos?.terreno;
  const ta = missao.alvo?.pos?.terreno;
  if (tp && ta && String(tp).toLowerCase() !== String(ta).toLowerCase()) {
    erros.push(`peça em "${tp}" e alvo em "${ta}" — são terrenos diferentes, não há linha de tiro entre eles`);
  }
  return erros;
}

/**
 * Decompõe o vento em componente LONGITUDINAL (ao longo da linha de tiro,
 * + = cauda) e TRAVESSAL (+ = vindo da esquerda, empurra para a direita).
 *
 * Convenção meteorológica: `ventoDirecaoDeg` é a direção DE ONDE o vento
 * vem (vento de 270° = vento de oeste). É a convenção da METAR e da carta
 * meteorológica — e a que mais gente erra ao integrar.
 */
export function componentesVento(ventoVelocidadeMs, ventoDirecaoDeg, azimuteTiroDeg) {
  if (!ventoVelocidadeMs) return { longitudinal: 0, travessal: 0 };
  /* Direção PARA ONDE o vento sopra = de onde vem + 180°. */
  const paraOnde = normDeg(ventoDirecaoDeg + 180);
  const rel = ((paraOnde - azimuteTiroDeg) * Math.PI) / 180;
  return {
    longitudinal: ventoVelocidadeMs * Math.cos(rel), // + = empurra o projétil
    travessal: ventoVelocidadeMs * Math.sin(rel)     // + = empurra para a direita
  };
}

/**
 * Resolve uma missão de tiro completa.
 *
 * Roda TODAS as cargas disponíveis e devolve as que resolvem, ordenadas por
 * preferência. O critério de preferência é doutrinário, não estético:
 * **a menor carga que alcança o alvo com folga**. Carga menor = menos
 * dispersão em valor absoluto, menos desgaste do tubo, menos assinatura
 * sonora. Só se nenhuma carga tem folga é que aceitamos a que estiver no
 * limite.
 *
 * @param {object} missao pedido `vanguard.fire-mission/1`
 * @returns {object} resposta `vanguard.fire-solution/1`
 */
export function resolverMissao(missao) {
  const erros = validarMissao(missao);
  if (erros.length) {
    return { schema: SCHEMA_RESPOSTA, ok: false, erros, id: missao?.id ?? null };
  }

  const peca = normalizarPosicao(missao.peca.pos, 'peca.pos');
  const alvo = normalizarPosicao(missao.alvo.pos, 'alvo.pos');
  const sis = SISTEMAS[missao.peca.sistema];

  const opc = missao.opcoes ?? {};
  const modo = opc.modo === MODO.TENSO ? MODO.TENSO : MODO.ALTO;
  const sistemaMil = opc.sistemaMil ?? 'nato';
  const usarArrasto = (opc.solver ?? 'arrasto') === 'arrasto';

  const amb = missao.ambiente ?? {};
  const g = amb.gravidade ?? sis.gRecomendado ?? G_PADRAO;

  /* ── geometria ── */
  const vetor = peca.tipo === 'geo'
    ? gridVector(peca, alvo)
    : vetorLocal(peca, alvo);

  const azGradeDeg = vetor.azimuteGradeDeg;
  const dist = vetor.distanciaHorizontalM;
  const dAlt = vetor.deltaAltM;

  /* Norte verdadeiro e norte magnético só existem se houver quadro
   * geográfico. Na grade local do jogo, "norte" é o norte da grade e pronto. */
  let convergenciaDeg = null, azVerdadeiroDeg = null, azMagneticoDeg = null;
  if (peca.tipo === 'geo') {
    convergenciaDeg = convergenciaMeridianos(peca.lat, peca.lon);
    azVerdadeiroDeg = normDeg(azGradeDeg + convergenciaDeg);
    if (Number.isFinite(amb.declinacaoMagDeg)) {
      /* azimute magnético = verdadeiro − declinação (declinação leste positiva) */
      azMagneticoDeg = normDeg(azVerdadeiroDeg - amb.declinacaoMagDeg);
    }
  }

  const vento = componentesVento(amb.ventoVelocidadeMs ?? 0, amb.ventoDirecaoDeg ?? 0, azGradeDeg);

  /* ── solução por carga ── */
  const cargasPedidas = Array.isArray(missao.peca.cargas) && missao.peca.cargas.length
    ? sis.cargas.filter((c) => missao.peca.cargas.includes(c.id))
    : sis.cargas;

  const solucoes = [];
  const avisos = [];

  for (const carga of cargasPedidas) {
    let s;
    if (usarArrasto) {
      s = resolverComArrasto({
        distanciaM: dist, deltaAltM: dAlt, v: carga.v0,
        mu: arrastoDaCarga(sis.id, carga.id), modo, g,
        ventoLongitudinal: vento.longitudinal, ventoTravessal: vento.travessal
      });
    } else {
      s = resolverVacuo({ distanciaM: dist, deltaAltM: dAlt, v: carga.v0, modo, g });
    }

    if (!s.ok) {
      avisos.push(`carga ${carga.id}: ${s.motivo}`);
      continue;
    }

    /* Correção de direção pela deriva do vento: quantos mils virar CONTRA a
     * deriva para o projétil cair na linha. */
    const correcaoDirecaoMil = dist > 0 && s.derivaM != null
      ? -radToMil(Math.atan2(s.derivaM, dist), sistemaMil)
      : 0;

    const zb = zonaBatida(sis.id, dist, { erroPosicaoM: missao.peca.erroPosicaoM ?? 0 });
    const abaixoDoMinimo = dist < carga.alcanceMinM;
    if (abaixoDoMinimo) avisos.push(`carga ${carga.id}: abaixo do alcance mínimo (${carga.alcanceMinM} m)`);

    solucoes.push({
      carga: carga.id,
      v0: carga.v0,
      modo,
      elevacaoMil: radToMil(s.elevacaoRad, sistemaMil),
      elevacaoDeg: s.elevacaoDeg,
      tempoVooS: s.tempoVooS,
      apiceM: s.apiceM,
      /* altitude absoluta do apogeu: é o número que interessa para liberar
       * espaço aéreo — o apogeu de um 120 mm passa de 3 km. */
      apiceAltitudeM: peca.alt + s.apiceM,
      derivaVentoM: s.derivaM ?? 0,
      correcaoDirecaoMil,
      velocidadeImpactoMs: s.velocidadeImpacto,
      anguloImpactoDeg: s.anguloImpactoDeg,
      alcanceMaxM: s.alcanceMaxM,
      residuoM: s.residuoM ?? 0,
      zonaBatida: zb,
      abaixoDoMinimo,
      /* folga: quanto sobra de alcance nesta carga (usado no ranqueamento) */
      folgaM: s.alcanceMaxM - dist,
      folgaRel: s.alcanceMaxM > 0 ? (s.alcanceMaxM - dist) / s.alcanceMaxM : 0
    });
  }

  /* Ranqueamento: primeiro as cargas válidas (dentro do mínimo) com folga
   * ≥ 10 %, da menor para a maior. Depois o resto, por folga decrescente. */
  const confortavel = (x) => !x.abaixoDoMinimo && x.folgaRel >= 0.10;
  solucoes.sort((a, b) => {
    const ca = confortavel(a), cb = confortavel(b);
    if (ca !== cb) return ca ? -1 : 1;
    if (ca && cb) return a.carga - b.carga;
    return b.folgaRel - a.folgaRel;
  });
  if (solucoes.length) solucoes[0].preferida = true;

  /* ── Segurança ──
   * "Danger close" é distância do impacto às TROPAS AMIGAS — não distância
   * da peça ao alvo. Só dá para avaliar de verdade se soubermos onde estão
   * os amigos, então o pedido pode trazer `missao.amigos: [{pos, id}]`.
   * Sem essa lista, não inventamos um aviso: dizemos que não foi avaliado.
   * Um alerta de segurança falso-negativo silencioso é pior que nenhum. */
  const preferida = solucoes[0] ?? null;
  let seguranca = { avaliado: false, motivo: 'nenhuma posição amiga informada', maisProximo: null };

  if (preferida) {
    const raio = preferida.zonaBatida.raioSegurancaM;

    /* A própria peça é uma posição amiga — essa nós sempre conhecemos. */
    const candidatos = [{ id: 'PECA', pos: peca, dist }];
    for (const amigo of missao.amigos ?? []) {
      try {
        const ap = normalizarPosicao(amigo.pos, `amigos[${amigo.id ?? '?'}].pos`);
        if (ap.tipo !== alvo.tipo) continue; // quadros diferentes: ignora em silêncio
        const v = ap.tipo === 'geo' ? gridVector(ap, alvo) : vetorLocal(ap, alvo);
        candidatos.push({ id: amigo.id ?? 'AMIGO', pos: ap, dist: v.distanciaHorizontalM });
      } catch { /* posição amiga malformada não invalida a missão inteira */ }
    }

    candidatos.sort((a, b) => a.dist - b.dist);
    const perto = candidatos[0];
    const temAmigos = (missao.amigos ?? []).length > 0;

    seguranca = {
      avaliado: true,
      raioSegurancaM: raio,
      maisProximo: { id: perto.id, distanciaM: perto.dist },
      dentroDaZona: perto.dist < raio,
      motivo: temAmigos ? null : 'só a posição da peça foi considerada (nenhum amigo informado)'
    };

    if (perto.dist < raio) {
      avisos.push(`DANGER CLOSE: ${perto.id} a ${Math.round(perto.dist)} m do impacto, dentro do raio de segurança de ${Math.round(raio)} m`);
    } else if (perto.dist < raio * 2) {
      avisos.push(`ATENÇÃO: ${perto.id} a ${Math.round(perto.dist)} m do impacto (raio de segurança ${Math.round(raio)} m)`);
    }
  }

  return {
    schema: SCHEMA_RESPOSTA,
    ok: solucoes.length > 0,
    id: missao.id ?? null,
    ts: new Date().toISOString(),
    alvoId: missao.alvo.id ?? null,

    geometria: {
      quadro: peca.tipo,
      distanciaHorizontalM: dist,
      distanciaInclinadaM: vetor.distanciaInclinadaM,
      deltaAltM: dAlt,
      dE: vetor.dE,
      dN: vetor.dN,
      zonaUTM: vetor.zona ?? null,
      fatorEscala: vetor.fatorEscala ?? null
    },

    azimute: {
      gradeDeg: azGradeDeg,
      gradeMil: radToMil((azGradeDeg * Math.PI) / 180, sistemaMil),
      verdadeiroDeg: azVerdadeiroDeg,
      magneticoDeg: azMagneticoDeg,
      magneticoMil: azMagneticoDeg == null ? null : radToMil((azMagneticoDeg * Math.PI) / 180, sistemaMil),
      convergenciaDeg
    },

    vento: {
      velocidadeMs: amb.ventoVelocidadeMs ?? 0,
      direcaoDeg: amb.ventoDirecaoDeg ?? null,
      longitudinalMs: vento.longitudinal,
      travessalMs: vento.travessal
    },

    sistema: { id: sis.id, nome: sis.nome, calibre: sis.calibre },
    solucoes,
    seguranca,
    avisos,
    motor: {
      versao: VERSAO_MOTOR,
      solver: usarArrasto ? 'arrasto' : 'vacuo',
      sistemaMil,
      gravidade: g
    }
  };
}

/**
 * Adaptador HTTP: recebe o corpo já parseado, devolve `{status, body}`.
 * Serve tanto para uma função serverless (Vercel/Render) quanto para o
 * handler de um WebSocket. Manter isto aqui garante que a versão web e a
 * versão em rede resolvem pela MESMA função.
 */
export function tratarRequisicao(corpo) {
  try {
    const r = resolverMissao(corpo);
    return { status: r.ok ? 200 : 422, body: r };
  } catch (e) {
    return {
      status: 400,
      body: { schema: SCHEMA_RESPOSTA, ok: false, erros: [e.message] }
    };
  }
}
