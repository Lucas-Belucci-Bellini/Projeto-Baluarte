/**
 * Índice unificado da WIKI DE ARMA 3 (/wiki-arma3).
 *
 * Não guarda conteúdo próprio: LÊ os data files que já existem e normaliza tudo
 * num formato único de "artigo", pra wiki ter uma busca só, um índice só e um
 * deep-link por assunto (#/wiki-arma3?a=<id>). Quem escreve conteúdo continua
 * editando o arquivo de origem — a wiki reflete automático.
 *
 * Fontes: arma3-armas (o arsenal medido no jogo) · arma3-vanilla (jogo base) ·
 * arma3-config (instalar/configurar) ·
 * arma3-comandos (console/SQF) · arma3-campanhas · arma3-drive (arquivos) ·
 * arma3-tutoriais (mods do preset, explicados à mão) · arma3-colecao (os 237
 * itens da coleção Steam, com capa).
 *
 * Regra de ouro: um item da coleção e o tutorial do MESMO mod (mesmo id do
 * Workshop) viram UM artigo só — a capa vem da coleção, a explicação vem do
 * tutorial. É o que dá o efeito "infobox + artigo" de wiki de verdade.
 */

import { normalize } from '../utils/helpers.js';
import { A3VAN_SECOES } from './arma3-vanilla.js';
import { A3CFG_SECOES } from './arma3-config.js';
import { A3CMD_SECOES } from './arma3-comandos.js';
import { A3CAMP_SECOES } from './arma3-campanhas.js';
import { A3DRV_SECOES } from './arma3-drive.js';
import { A3TUT_CATEGORIAS, A3TUT_MODS } from './arma3-tutoriais.js';
import { A3TUT_DEPS } from './arma3-deps.js';
import { A3COL_INFO, A3COL_CATS, A3COL_ITENS } from './arma3-colecao.js';
import { ARMA3_PRESETS } from './arma3-presets.js';
import { A3ARM, A3ARM_TIPOS } from './arma3-armas.js';
import { A3ACC, A3ACC_TOTAL } from './arma3-acessorios.js';
import { A3TER } from './arma3-terrenos.js';
import { A3VEI, A3VEI_CATEGORIAS } from './arma3-veiculos.js';
import { A3EQP, A3EQP_CATEGORIAS } from './arma3-equipamento.js';
import { A3SOL } from './arma3-soldados.js';

export { A3COL_INFO };

/* ==============================================================
 *  Níveis — o eixo "iniciante ↔ veterano" que os filtros usam.
 * ============================================================== */
export const WIKI_NIVEIS = [
  { id: 1, nome: 'Iniciante',     icon: '🌱', desc: 'Nunca jogou ou está apanhando. Comece por aqui.' },
  { id: 2, nome: 'Intermediário', icon: '⚔️', desc: 'Já joga; quer dominar mods, esquadrão e equipamento.' },
  { id: 3, nome: 'Veterano',      icon: '💀', desc: 'Console, SQF, edição de missão e ajuste fino.' }
];

/* ==============================================================
 *  Portais — as "grandes portas" da capa da wiki.
 * ============================================================== */
export const WIKI_PORTAIS = [
  { id: 'comecar',  nome: 'Começar a jogar',     icon: '🎮', cor: 'cyan',
    desc: 'O jogo base, do zero: mover, atirar, comandar IA, ler o mapa e sobreviver ao primeiro dia.' },
  { id: 'mods',     nome: 'Mods & instalação',   icon: '🧩', cor: 'magenta',
    desc: 'Como instalar o preset, o que cada mod faz, teclas e dependências.' },
  { id: 'colecao',  nome: 'A coleção',           icon: '📦', cor: 'cyan',
    desc: 'Os itens da coleção oficial do Baluarte, um por um, com capa e resumo.' },
  { id: 'missoes',  nome: 'Missões & campanhas', icon: '🏴', cor: 'magenta',
    desc: 'O que jogar: campanhas, cenários dinâmicos e coop.' },
  { id: 'comandos', nome: 'Console & comandos',  icon: '⌨️', cor: 'cyan',
    desc: 'Spawnar, teleportar, depurar — o lado técnico (SQF) pra quem já manda no jogo.' },
  { id: 'arquivos', nome: 'Arquivos & backup',   icon: '☁️', cor: 'magenta',
    desc: 'A instalação real espelhada no Drive: pastas, PBOs e saves.' },
  { id: 'arsenal',  nome: 'Arsenal',             icon: '🔫', cor: 'cyan',
    desc: 'Cada arma com os números MEDIDOS no config do jogo: v₀, arrasto, dano, '
        + 'precisão em centímetros e o ícone como aparece no Arsenal.' },
  { id: 'optica',   nome: 'Miras & acessórios',  icon: '🔭', cor: 'magenta',
    desc: 'Miras, lasers, silenciadores e bipés extraídos do config. A ampliação '
        + 'sai do texto do próprio jogo — nunca de conta com o campo de visão.' },
  { id: 'terrenos', nome: 'Terrenos',            icon: '🗺️', cor: 'cyan',
    desc: 'Os mundos jogáveis com a grade REAL de cada um: tamanho, célula, '
        + 'localidades e a direção do northing que o computador de tiro usa.' },
  { id: 'veiculos', nome: 'Veículos',            icon: '🛡️', cor: 'magenta',
    desc: 'Blindados, viaturas, aeronaves e navios com a blindagem medida — '
        + 'o total do casco E a parte mais fraca, que só o total esconde.' },
  { id: 'equipamento', nome: 'Equipamento',      icon: '🦺', cor: 'cyan',
    desc: 'Coletes, capacetes, uniformes e mochilas com a proteção POR PONTO '
        + 'DO CORPO e a fração de dano que atravessa a placa.' },
  { id: 'soldados', nome: 'Soldados & facções',  icon: '🎖️', cor: 'magenta',
    desc: 'Quem é cada soldado, de que facção — e O QUE CARREGA: arma, '
        + 'carregadores, uniforme e mochila, tudo lido do config.' }
];

/* Nível por seção de origem. A chave é `portal:secao` de propósito: o id
 * `veiculos` existe no jogo base (dirigir um carro — básico) E nos comandos
 * (spawnar veículo por script — avançado); só o par desempata. O que não estiver
 * aqui cai em 2 (intermediário), e o portal Console inteiro é 3. */
const NIVEL_POR_ORIGEM = {
  /* iniciante — o que se precisa pra sobreviver ao primeiro dia */
  'comecar:comeco': 1, 'comecar:movimento': 1, 'comecar:tiro': 1,
  'comecar:inventario': 1, 'comecar:navegacao': 1,
  'mods:instalar': 1, 'mods:ordem': 1,
  'missoes:vind-comeco': 1,
  /* veterano — editor, servidor, performance e as tripas dos arquivos */
  'comecar:criacao': 3,
  'mods:servidores': 3, 'mods:performance': 3, 'mods:troubleshooting': 3,
  'arquivos:anatomia': 3
};

/* Mesma ideia pras categorias de mod: fundação/interface/imersão são "instala e
 * joga"; admin e construção pedem bagagem. */
const NIVEL_POR_CAT_MOD = {
  fundacao: 1, interface: 1, imersao: 1,
  admin: 3, construcao: 3
};

const slug = (s) => normalize(s)
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/* Mapa id-do-Workshop → URL, tirado do preset oficial (fonte dos links). */
const PRESET = ARMA3_PRESETS.find((p) => p.id === 'projeto-baluarte-vercel-app');
const URL_PRESET = Object.fromEntries(
  (PRESET ? PRESET.mods : [])
    .map((m) => [(m.url.match(/id=(\d+)/) || [])[1], m.url])
    .filter(([id]) => id)
);
const wsUrl = (id) => URL_PRESET[id] || `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`;

/* Converte um tópico (vanilla/config/comandos/campanhas/drive) em artigo. */
function artigoDeTopico(t, sec, portal, tipo) {
  return {
    id: `${portal.slice(0, 3)}-${slug(t.titulo)}`,
    titulo: t.titulo,
    tipo,
    portal,
    cat: sec.id,
    catNome: sec.nome,
    icon: sec.icon,
    nivel: NIVEL_POR_ORIGEM[`${portal}:${sec.id}`] || (portal === 'comandos' ? 3 : 2),
    img: '',
    resumo: t.texto || '',
    corpo: t.texto || '',
    guia: '',
    sqf: t.sqf || '',
    atalhos: t.atalhos || [],
    dicas: t.dicas || [],
    links: t.link ? [{ rotulo: t.link.rotulo, url: t.link.url }] : [],
    deps: [], dlcs: [], tags: [], autor: '', tam: ''
  };
}

/* ==============================================================
 *  Construção do índice (roda 1x no import do módulo).
 * ============================================================== */
function construir() {
  const artigos = [];
  const catsPorId = {};
  [...A3TUT_CATEGORIAS, ...A3COL_CATS].forEach((c) => { catsPorId[c.id] = c; });

  /* --- 1. tópicos escritos à mão (jogo base, config, comandos, campanhas, drive) --- */
  const FONTES = [
    [A3VAN_SECOES,  'comecar',  'guia'],
    [A3CFG_SECOES,  'mods',     'guia'],
    [A3CMD_SECOES,  'comandos', 'comando'],
    [A3CAMP_SECOES, 'missoes',  'campanha'],
    [A3DRV_SECOES,  'arquivos', 'arquivo']
  ];
  FONTES.forEach(([secoes, portal, tipo]) => {
    (secoes || []).forEach((sec) => {
      (sec.topicos || sec.itens || []).forEach((t) => {
        artigos.push(artigoDeTopico(t, sec, portal, tipo));
      });
    });
  });

  /* --- 2. mods/itens: funde tutorial (explicação) + coleção (capa/metadados) --- */
  const ids = new Set([...Object.keys(A3TUT_MODS), ...Object.keys(A3COL_ITENS)]);
  ids.forEach((wid) => {
    const tut = A3TUT_MODS[wid];
    const col = A3COL_ITENS[wid];
    const cat = (tut && tut.cat) || (col && col.cat) || 'mod';
    const catInfo = catsPorId[cat] || { nome: 'Mods', icon: '🧩' };
    /* Item da coleção que é cenário/campanha pertence ao portal de missões. */
    const portal = (col && (col.cat === 'cenario' || col.cat === 'campanha')) ? 'missoes'
      : (tut ? 'mods' : 'colecao');

    const partes = [];
    if (tut) {
      if (tut.oQue) partes.push(tut.oQue);
      if (tut.como) partes.push(`Como funciona — ${tut.como}`);
    } else if (col && col.resumo) {
      partes.push(col.resumo);
    }

    artigos.push({
      id: `w-${wid}`,
      wid,
      titulo: (tut && tut.nome) || (col && col.nome) || wid,
      tipo: tut ? 'mod' : 'item',
      portal,
      cat,
      catNome: catInfo.nome,
      icon: catInfo.icon,
      nivel: NIVEL_POR_CAT_MOD[cat] || 2,
      img: (col && col.img) || '',
      resumo: (col && col.resumo) || (tut && tut.oQue) || '',
      corpo: partes.join('\n\n'),
      /* guia longo do autor (inglês, direto do Workshop) — vai num "leia mais" */
      guia: (col && col.guia) || '',
      sqf: '',
      atalhos: (tut && tut.atalhos) || [],
      dicas: (tut && tut.dicas) || [],
      links: [{ rotulo: 'Página no Steam Workshop', url: wsUrl(wid) }],
      deps: A3TUT_DEPS[wid] || (col && col.deps) || [],
      dlcs: (col && col.dlcs) || [],
      tags: (col && col.tags) || [],
      autor: (col && col.autor) || '',
      tam: (col && col.tam) || '',
      naColecao: !!col,
      noPreset: !!URL_PRESET[wid],
      temTutorial: !!tut
    });
  });

  /* --- 3. arsenal: uma arma = um artigo ---------------------------------
   * A wiki é a camada de NAVEGAÇÃO do conteúdo que mora nos data files, e o
   * arsenal estava de fora: dava pra ver a tabela em /arma3-tutorial, mas não
   * dava pra CHEGAR nela pela wiki, nem buscar "MX" e achar a arma.
   *
   * Arma é, de longe, o melhor caso pro formato "infobox + artigo" que esta
   * wiki usa: tem capa (o ícone extraído do jogo), ficha técnica (os números
   * medidos) e texto. Por isso entra como portal próprio em vez de virar um
   * link solto na capa. */
  const tiposArma = Object.fromEntries(A3ARM_TIPOS.map((t) => [t.id, t]));
  A3ARM.forEach((a) => {
    const tp = tiposArma[a.tipo] || { nome: 'Arma', icon: '🔫' };
    /* O corpo é montado a partir do que foi MEDIDO — sem adjetivo que o
     * config não sustente. Cada frase só existe se o dado existir. */
    const frases = [];
    /* O `desc` do config costuma ser "Assault Rifle · Caliber: 6.5x39 mm" — o
     * calibre já sai normalizado no campo próprio, então corta a parte
     * repetida em vez de dizer duas vezes. */
    const categoria = (a.desc || '').split(/\s*·?\s*Caliber/i)[0].replace(/[·\s]+$/, '');
    if (categoria) frases.push(categoria + '.');
    if (a.calibre) frases.push(`Calibre ${a.calibre}.`);
    if (a.v0) {
      frases.push(`Sai do cano a ${a.v0} m/s` +
        (a.airFriction ? ` e desacelera com arrasto ${a.airFriction} (airFriction do config).` : '.'));
    }
    if (a.dispersaoCm100) {
      frases.push(`Dispersão de ${a.dispersaoMrad} mrad — cerca de ` +
        `${a.dispersaoCm100} cm a 100 m no melhor modo de tiro.`);
    }
    if (a.dano) frases.push(`Dano direto ${a.dano} por projétil.`);
    if (a.capacidade) frases.push(`Carregador padrão de ${a.capacidade}.`);
    if (a.zeroing) frases.push(`Zeragem até ${a.zeroing} m.`);
    if (a.variantes > 1) {
      frases.push(`O config tem ${a.variantes} classes desta mesma arma ` +
        '(óptica pré-montada e camuflagem) — todas com a mesma balística.');
    }
    if (!a.balistico) {
      frases.push('Não segue o modelo de bala: foguete e míssil usam outro ' +
        'modelo de voo no engine, então a calculadora de trajetória não se aplica.');
    }

    artigos.push({
      id: `ars-${a.id}`,
      titulo: a.nome,
      tipo: 'arma',
      portal: 'arsenal',
      cat: a.tipo,
      catNome: tp.nome,
      icon: tp.icon,
      /* Pistola e fuzil são o básico; DMR/sniper/lançador pedem bagagem. */
      nivel: ['pistola', 'fuzil', 'smg'].includes(a.tipo) ? 1
        : (['sniper', 'lancador', 'dmr'].includes(a.tipo) ? 3 : 2),
      img: a.img || '',
      resumo: [categoria, a.calibre, a.origem].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '',
      sqf: `this addWeapon "${a.classe}";`,
      atalhos: [],
      dicas: [],
      /* `?arma=` faz a calculadora abrir JÁ nesta arma — sem isso o link
       * entregava uma tabela de 106 linhas e a calculadora em outra coisa.
       *
       * E o RÓTULO segue o que a arma permite: prometer "e na calculadora"
       * pra foguete, sinalizador ou arma sem v0 no config levava o leitor a
       * uma calculadora que caía em OUTRA arma, calada. */
      links: [{
        rotulo: a.balistico ? 'Abrir na tabela e na calculadora' : 'Abrir na tabela',
        url: `#/arma3-tutorial?aba=armas&arma=${a.id}`,
      }],
      deps: [],
      dlcs: a.origem ? [a.origem] : [],
      tags: [a.calibre, a.origem, tp.nome, a.classe].filter(Boolean),
      autor: '',
      tam: '',
      /* usados pela infobox da wiki */
      arma: a
    });
  });

  /* --- 6. miras e acessórios (config do jogo) ---
   *
   * Mesma regra do arsenal: cada frase só existe se o dado existir. A
   * ampliação é o campo delicado — ela SÓ vem quando o próprio jogo escreve
   * "Magnification: Nx" na descrição. Onde não vem, o artigo diz que não é
   * declarada e mostra o campo de visão cru, rotulado como FOV. Converter
   * FOV em ampliação (0,75/FOV) erra: nas 215 ópticas que trazem os dois,
   * 159 discordam da conta — inclusive o ELCAN, que dá 12× calculado contra
   * "2x" escrito pela própria Bohemia. */
  const TIPO_ACC = {
    mira: { nome: 'Mira', icon: '🔭', nivel: 2 },
    silenciador: { nome: 'Silenciador', icon: '🤫', nivel: 2 },
    apontador: { nome: 'Laser / lanterna', icon: '🔦', nivel: 1 },
    bipe: { nome: 'Bipé / empunhadura', icon: '⚙️', nivel: 1 },
  };
  A3ACC.forEach((c) => {
    const tp = TIPO_ACC[c.tipo] || { nome: 'Acessório', icon: '🔧', nivel: 2 };
    const frases = [];
    if (c.descricao) frases.push(c.descricao.replace(/\s*\.?\s*$/, '.'));

    if (c.tipo === 'mira') {
      if (c.ampliacaoRotulo) {
        frases.push(`Ampliação ${c.ampliacaoRotulo}, como o próprio jogo declara ` +
          'na descrição do item.');
      } else if (c.fov) {
        frases.push('O jogo não declara a ampliação desta mira. O config traz o ' +
          `campo de visão (zoom ${c.fov.init ?? c.fov.min}), que NÃO é ampliação — ` +
          'a conversão entre os dois não se sustenta no acervo, então fica o FOV cru.');
      }
      if (c.fov && c.fov.modos > 1) {
        frases.push(`Tem ${c.fov.modos} modos ópticos (colimador e luneta, por exemplo).`);
      }
    }
    if (typeof c.coefSilenciador === 'number') {
      frases.push(`Coeficiente de som ${c.coefSilenciador} — quanto o config ` +
        'reduz o alcance audível do disparo.');
    }
    if (typeof c.massa === 'number') frases.push(`Massa ${c.massa} no inventário.`);

    artigos.push({
      id: `opt-${c.id}`,
      titulo: c.nome,
      tipo: 'acessorio',
      portal: 'optica',
      cat: c.tipo,
      catNome: tp.nome,
      icon: tp.icon,
      nivel: tp.nivel,
      /* `c.imagem` é caminho .paa cru do config — o extrator de ícones ainda
       * não cobriu acessórios. Capa ausente é ausente, não <img> quebrado. */
      img: '',
      resumo: [tp.nome, c.ampliacaoRotulo, c.dlc].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '', sqf: `this addPrimaryWeaponItem "${c.classe}";`,
      atalhos: [], dicas: [],
      links: [{
        rotulo: 'Ver na tabela de acessórios',
        url: `#/arma3-tutorial?aba=acessorios&q=${encodeURIComponent(c.classe)}`,
      }],
      deps: [], dlcs: c.dlc ? [c.dlc] : [],
      tags: [tp.nome, c.dlc, c.ampliacaoRotulo, c.classe].filter(Boolean),
      autor: '', tam: '',
      acessorio: c,
    });
  });

  /* --- 7. terrenos (CfgWorlds) ---
   *
   * O dado que justifica o portal é a GRADE: offset, passo e o SINAL do
   * passo por eixo. É o que o computador de tiro consome pra transformar
   * "034056" em metros e daí em azimute — e o sinal é o que impede errar o
   * eixo N-S em 180°. Por isso ele aparece no artigo, não só na tabela. */
  A3TER.forEach((t) => {
    const frases = [];
    if (t.tamanhoM) {
      const km = t.tamanhoM / 1000;
      frases.push(`Terreno de ${km.toFixed(1)} km de lado` +
        (t.areaKm2 ? `, ${t.areaKm2} km² de área` : '') + '.');
    } else {
      frases.push('O config deste mundo não declara o tamanho (mapSize).');
    }
    if (t.localidades) {
      frases.push(`${t.localidades} localidades nomeadas no config` +
        (t.capitais && t.capitais.length ? ` — entre elas ${t.capitais.join(', ')}.` : '.'));
    }
    if (t.aeroportos) frases.push(`${t.aeroportos} pista(s) registrada(s).`);
    if (t.grade) {
      frases.push(`A célula da grade mede ${Math.abs(t.grade.passoX)} m, e o ` +
        `northing conta ${t.grade.passoY < 0 ? 'do norte PARA BAIXO — a convenção ' +
        'dos mapas vanilla' : 'PARA CIMA, ao contrário dos mapas vanilla'}. ` +
        'É desse sinal que sai o azimute certo.');
    }
    if (typeof t.latitude === 'number') {
      frases.push(`Latitude ${t.latitude}° e longitude ${t.longitude}° no config — ` +
        'é o que define a posição do sol e a hora do nascer e pôr.');
    }

    artigos.push({
      id: `ter-${t.id}`,
      titulo: t.nome === t.classe ? t.nome : `${t.nome} (${t.classe})`,
      tipo: 'terreno',
      portal: 'terrenos',
      cat: t.ehMod ? 'mod' : 'oficial',
      catNome: t.ehMod ? 'Terreno de mod' : 'Terreno oficial',
      icon: '🗺️',
      nivel: 2,
      img: '',
      resumo: [t.dlc, t.tamanhoM ? `${(t.tamanhoM / 1000).toFixed(0)} km` : null,
        t.localidades ? `${t.localidades} localidades` : null].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '', sqf: '', atalhos: [], dicas: [],
      /* Deep-link que abre o card de azimute JÁ neste terreno — é o elo entre
       * a wiki e o Vanguard, e o motivo do portal existir. */
      links: [{
        rotulo: 'Calcular azimute neste terreno',
        url: `#/vanguard?terreno=${t.id}`,
      }],
      deps: [], dlcs: t.dlc && !t.ehMod ? [t.dlc] : [],
      tags: [t.dlc, t.autor, t.classe].filter(Boolean),
      autor: t.autor || '', tam: '',
      terreno: t,
    });
  });

  /* --- 8. veículos (CfgVehicles) ---
   *
   * O dado que justifica o portal é a BLINDAGEM POR PARTE. `armor` sozinho
   * diz o casco; o ponto fraco tático (motor, combustível, torre) mora no
   * hitpoints. E o sinal importa: armor negativo é blindagem RELATIVA ao
   * total, não "mais fraca que zero" — 19.223 partes do acervo usam essa
   * convenção, quase todas rodas. Por isso o artigo separa as duas coisas. */
  const catVei = Object.fromEntries(A3VEI_CATEGORIAS.map((c) => [c.id, c]));
  A3VEI.forEach((v) => {
    const cat = catVei[v.categoria] || { nome: 'Veículo', icon: '🚙' };
    const frases = [];
    if (v.armor) {
      frases.push(`Blindagem de casco ${v.armor}` +
        (v.armorEstrutural ? `, estrutural ${v.armorEstrutural}.` : '.'));
    }
    const b = v.blindagem;
    if (b && b.menor != null) {
      frases.push(`Das ${b.partes} partes com dano próprio, a mais fraca é ` +
        `${b.menorParte} (${b.menor}) — é por ela que o veículo cede primeiro.`);
    } else if (b) {
      frases.push(`Tem ${b.partes} partes com dano próprio, mas nenhuma com ` +
        'blindagem absoluta declarada.');
    } else {
      frases.push('O config não declara blindagem por parte para este veículo.');
    }
    if (b && b.relativas) {
      frases.push(`Outras ${b.relativas} partes usam blindagem RELATIVA ` +
        '(valor negativo no config, proporcional ao casco) — normalmente rodas ' +
        'e periscópios; não se comparam com as absolutas.');
    }
    if (v.maxSpeed) frases.push(`Velocidade máxima ${v.maxSpeed} km/h.`);
    if (v.lotacao) frases.push(`Leva ${v.lotacao} ocupantes.`);
    if (v.armas) frases.push(`Monta ${v.armas} sistema(s) de arma.`);
    if (v.custo) frases.push(`Custo ${v.custo} na avaliação da IA do config.`);

    artigos.push({
      id: `vei-${v.id}`,
      titulo: v.nome,
      tipo: 'veiculo',
      portal: 'veiculos',
      cat: v.categoria,
      catNome: cat.nome,
      icon: cat.icon,
      nivel: v.categoria === 'blindado' || v.categoria === 'aereo' ? 3 : 2,
      img: '',
      resumo: [cat.nome, v.faccao, v.dlc].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '',
      sqf: `_v = "${v.classe}" createVehicle position player;`,
      atalhos: [], dicas: [],
      links: [{
        rotulo: 'Ver na tabela de veículos',
        url: `#/arma3-tutorial?aba=veiculos&q=${encodeURIComponent(v.classe)}`,
      }],
      deps: [], dlcs: v.dlc ? [v.dlc] : [],
      tags: [cat.nome, v.lado, v.faccao, v.dlc, v.classe].filter(Boolean),
      autor: '', tam: '',
      veiculo: v,
    });
  });

  /* --- 9. equipamento (uniformes, coletes, capacetes, mochilas, óculos) ---
   *
   * O dado que justifica o portal é a PROTEÇÃO POR PONTO DO CORPO. Um número
   * só por colete esconde a diferença entre "peito 25, abdômen descoberto" e
   * "os dois em 25" — e é essa distinção que decide se a peça serve. Vem
   * junto o `passThrough`: a fração do dano que passa pela placa mesmo
   * quando o ponto está coberto. */
  const catEqp = Object.fromEntries(A3EQP_CATEGORIAS.map((c) => [c.id, c]));
  A3EQP.forEach((q) => {
    const cat = catEqp[q.tipo] || { nome: 'Equipamento', icon: '🎽' };
    const frases = [];
    const p = q.protecao;
    if (p && p.maior != null) {
      frases.push(`Protege ${p.cobertas} de ${p.partes} pontos do corpo; o mais ` +
        `blindado é ${p.maiorParte} (${p.maior}).`);
      if (p.passagem != null) {
        frases.push(`Mesmo onde cobre, ${Math.round(p.passagem * 100)}% do dano ` +
          'atravessa a placa (passThrough) — proteção não é imunidade.');
      }
    } else if (p) {
      frases.push(`O config lista ${p.partes} pontos do corpo para esta peça, ` +
        'mas não declara blindagem em nenhum.');
    } else if (q.tipo === 'colete' || q.tipo === 'capacete') {
      frases.push('O config não declara proteção por ponto do corpo para esta peça.');
    }
    if (q.capacidade) {
      frases.push(`Carrega ${q.capacidade} de volume` +
        (q.containerClass ? ` (${q.containerClass}).` : '.'));
    }
    if (typeof q.massa === 'number') frases.push(`Massa ${q.massa}.`);
    if (q.variantes > 1) {
      frases.push(`O config tem ${q.variantes} classes com estes mesmos números ` +
        '— camuflagem e cor diferentes, mesma proteção e mesma capacidade.');
    }

    artigos.push({
      id: `eqp-${q.id}`,
      titulo: q.nome,
      tipo: 'equipamento',
      portal: 'equipamento',
      cat: q.tipo,
      catNome: cat.nome,
      icon: cat.icon,
      nivel: q.tipo === 'colete' || q.tipo === 'capacete' ? 2 : 1,
      img: '',
      resumo: [cat.nome, p && p.maior != null ? `proteção ${p.maior}` : null,
        q.dlc].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '',
      sqf: q.tipo === 'mochila' ? `this addBackpack "${q.classe}";`
        : `this addItem "${q.classe}";`,
      atalhos: [], dicas: [],
      links: [{
        rotulo: 'Ver na tabela de equipamento',
        url: `#/arma3-tutorial?aba=equipamento&q=${encodeURIComponent(q.classe)}`,
      }],
      deps: [], dlcs: q.dlc ? [q.dlc] : [],
      tags: [cat.nome, q.dlc, q.classe].filter(Boolean),
      autor: '', tam: '',
      equipamento: q,
    });
  });

  /* --- 10. soldados ---
   *
   * Fecha o círculo das cinco bases: o soldado referencia a ARMA, o
   * CARREGADOR e o UNIFORME por classe — e as três já existem aqui. É o
   * artigo que responde "o que o Rifleman da BLUFOR leva pro campo".
   *
   * ⚠️ `lado` é null em ~87%, e isso é o dado: 83 das 248 facções usam
   * `side: 7` (sideUnknown do engine). Facção sem lado é soldado sem lado —
   * preencher por semelhança inventaria filiação. */
  A3SOL.forEach((s) => {
    const frases = [];
    if (s.faccao) {
      frases.push(`Facção ${s.faccao}` +
        (s.lado ? `, do lado ${s.lado}.` : ' — o config não declara o lado dela.'));
    }
    if (s.armas && s.armas.length) {
      frases.push(`Sai com ${s.armas.join(' e ')}` +
        (s.nCarregadores ? `, ${s.nCarregadores} carregadores.` : '.'));
    }
    if (s.uniforme) frases.push(`Veste ${s.uniforme}.`);
    if (s.mochila) frases.push(`Leva a mochila ${s.mochila}.`);
    if (s.nGranadas) frases.push(`Tem ${s.nGranadas} slot(s) de granada/explosivo.`);
    if (s.nItens) frases.push(`${s.nItens} itens ligados (rádio, GPS, kit).`);

    artigos.push({
      id: `sol-${s.id}`,
      titulo: s.nome,
      tipo: 'soldado',
      portal: 'soldados',
      cat: s.lado || 'sem-lado',
      catNome: s.lado || 'Lado não declarado',
      icon: '🎖️',
      nivel: 2,
      img: '',
      resumo: [s.faccao, s.lado, s.dlc].filter(Boolean).join(' · '),
      corpo: frases.join(' '),
      guia: '',
      sqf: `_g = createGroup west; _u = _g createUnit ["${s.classe}", position player, [], 0, "NONE"];`,
      atalhos: [], dicas: [],
      links: [{
        rotulo: 'Ver na tabela de soldados',
        url: `#/arma3-tutorial?aba=soldados&q=${encodeURIComponent(s.classe)}`,
      }],
      deps: [], dlcs: s.dlc ? [s.dlc] : [],
      tags: [s.faccao, s.lado, s.dlc, s.classe].filter(Boolean),
      autor: '', tam: '',
      soldado: s,
    });
  });

  /* Busca: um campo achatado e sem acento por artigo (feito 1x, não a cada tecla) */
  artigos.forEach((a) => {
    a._busca = normalize(
      `${a.titulo} ${a.resumo} ${a.corpo} ${a.catNome} ${a.tags.join(' ')} ${a.autor} ${a.wid || ''} ` +
      `${(a.atalhos || []).map((x) => x.join(' ')).join(' ')}`
    );
  });

  artigos.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  return artigos;
}

export const WIKI_ARTIGOS = construir();

export const WIKI_POR_ID = Object.fromEntries(WIKI_ARTIGOS.map((a) => [a.id, a]));

export const WIKI_TOTAL = WIKI_ARTIGOS.length;

/* Contagem por portal — a capa mostra "N artigos" em cada porta. */
export const WIKI_CONTAGEM = WIKI_PORTAIS.reduce((acc, p) => {
  acc[p.id] = WIKI_ARTIGOS.filter((a) => a.portal === p.id).length;
  return acc;
}, {});

/* Categorias existentes dentro de um portal (pros chips de filtro). */
export function catsDoPortal(portalId) {
  const vistos = new Map();
  WIKI_ARTIGOS.forEach((a) => {
    if (portalId && a.portal !== portalId) return;
    if (!vistos.has(a.cat)) vistos.set(a.cat, { id: a.cat, nome: a.catNome, icon: a.icon, qtd: 0 });
    vistos.get(a.cat).qtd++;
  });
  return [...vistos.values()].sort((a, b) => b.qtd - a.qtd);
}

/* "Veja também": mesma categoria; pra mod, quem compartilha dependência vem antes. */
export function relacionados(art, limite = 6) {
  if (!art) return [];
  const mesmaDep = (o) => art.deps.length && o.deps.some((d) => art.deps.includes(d));
  return WIKI_ARTIGOS
    .filter((o) => o.id !== art.id && (o.cat === art.cat || mesmaDep(o)))
    .sort((a, b) => (mesmaDep(b) ? 1 : 0) - (mesmaDep(a) ? 1 : 0))
    .slice(0, limite);
}

/* Busca global — usada pela barra da wiki e pelo atalho da capa. */
export function buscar(termo, { portal = '', cat = '', nivel = 0 } = {}) {
  const t = normalize(termo);
  return WIKI_ARTIGOS.filter((a) => {
    if (portal && a.portal !== portal) return false;
    if (cat && a.cat !== cat) return false;
    if (nivel && a.nivel !== nivel) return false;
    return !t || a._busca.includes(t);
  });
}
