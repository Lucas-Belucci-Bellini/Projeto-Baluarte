/**
 * Página /arma3-tutorial — o centro de aprendizado do Arma 3 do operador:
 *   aba 1: 🎮 JOGO BASE (vanilla, sem mods) — tutorial completo do jogo
 *   aba 2: 🧩 MODS DO PRESET — os 105 mods explicados um a um
 *
 * Dados: src/data/arma3-vanilla.js (seções/tópicos do jogo base) e
 * src/data/arma3-tutoriais.js (1 entrada por mod, chave = id do Workshop)
 * + src/data/arma3-deps.js (dependências oficiais, geradas por script).
 */

import '../styles/arma3-tutorial.css';
import '../styles/simbolos.css';
import { h, debounce, normalize } from '../utils/helpers.js';
import { ARMA3_PRESETS } from '../data/arma3-presets.js';
import { A3TUT_CATEGORIAS, A3TUT_MODS, A3TUT_TOTAL, A3TUT_DUAL_ARMS } from '../data/arma3-tutoriais.js';
import { A3TUT_DEPS } from '../data/arma3-deps.js';
import { A3VAN_SECOES, A3VAN_TOTAL_TOPICOS } from '../data/arma3-vanilla.js';
import { A3CFG_SECOES, A3CFG_TOTAL_TOPICOS } from '../data/arma3-config.js';
import { A3CMD_SECOES, A3CMD_TOTAL } from '../data/arma3-comandos.js';
import { A3CAMP_SECOES, A3CAMP_TOTAL } from '../data/arma3-campanhas.js';
import { A3COL_INFO, A3COL_CATS, A3COL_ITENS, A3COL_TOTAL } from '../data/arma3-colecao.js';
import { A3DRV_PASTAS, A3DRV_SECOES, A3DRV_TOTAL } from '../data/arma3-drive.js';
import {
  A3ARM, A3ARM_TIPOS, A3ARM_TOTAL, A3ARM_META, carregarArsenal,
} from '../data/arma3-armas.js';
import { A3CAT, A3CAT_CATEGORIAS, A3CAT_META, carregarCatalogo } from '../data/arma3-catalogo.js';
import { A3MUN, A3MAG, A3MUN_TOTAL, A3MAG_TOTAL } from '../data/arma3-municao.js';
import { A3ACC, A3ACC_TOTAL, A3ACC_META } from '../data/arma3-acessorios.js';
import { A3TER, A3TER_TOTAL, A3TER_META } from '../data/arma3-terrenos.js';
import { A3VEI, A3VEI_TOTAL, A3VEI_CATEGORIAS, A3VEI_META } from '../data/arma3-veiculos.js';
import { resolverTiro, dadosBalisticos } from '../utils/arma3-balistica.js';

const PRESET_ID = 'projeto-baluarte-vercel-app';

export function arma3TutorialPage(args = {}) {
  const page = h('div', { className: 'page-a3tut' });
  const preset = ARMA3_PRESETS.find((p) => p.id === PRESET_ID);
  const urlPorId = Object.fromEntries(preset.mods.map((m) => [m.url.match(/id=(\d+)/)[1], m.url]));

  let catAtiva = 'all';

  /* Armas que a calculadora aceita: só as que têm um projétil balístico de
   * verdade (ver dadosBalisticos). Calculada uma vez — é o mesmo filtro do
   * seletor, do botão da tabela e do contador do cabeçalho. */
  const armasCalculaveis = A3ARM.filter((a) => dadosBalisticos(a));

  /* estado da calculadora de balística (sobrevive aos re-renders).
   *
   * `?arma=<id>` vem da wiki: o artigo de cada arma promete "abrir na tabela e
   * na calculadora", e sem isto o link caía numa lista de 106 com a
   * calculadora em outra arma — promessa quebrada. Se o id não existir (link
   * velho, arma que saiu do preset), cai no padrão em vez de quebrar.
   *
   * O padrão é um fuzil do JOGO BASE: a lista está ordenada por velocidade, e
   * o primeiro item calhava de ser um DMR de CDLC que quase ninguém reconhece. */
  let busca = '';
  const armaPedida = (args.query || {}).arma;
  /* `?q=` pré-preenche a busca — é como o artigo da arma manda o leitor
   * direto na munição dela, sem virar 472 artigos de nome de classe. */
  const buscaInicial = (args.query || {}).q || '';
  let calcArmaId = (armasCalculaveis.find((a) => a.id === armaPedida)
    || armasCalculaveis.find((a) => a.classe === 'arifle_MX_F')
    || armasCalculaveis.find((a) => a.origem === 'Base' && a.tipo === 'fuzil')
    || armasCalculaveis[0] || {}).id;
  let calcZero = 300, calcAlvo = 600, calcVento = 0;

  /* arsenal completo (mods) — só desce quando o operador pede */
  let expandido = null;   // id da arma com os modos de tiro abertos
  let arsenalMods = null, arsenalEstado = 'ocioso';
  /* catálogo (veículos, miras, uniformes…) — idem */
  let catalogoMods = null, catalogoEstado = 'ocioso';
  const abaInicial = (args.query || {}).aba;
  const ABAS = ['vanilla', 'armas', 'acessorios', 'veiculos', 'terrenos', 'municao',
    'carregadores', 'catalogo', 'colecao', 'config', 'mods', 'comandos',
    'campanhas', 'drive'];
  let aba = ABAS.includes(abaInicial) ? abaInicial : (armaPedida ? 'armas' : 'vanilla');

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'TUTORIAL ARMA 3')),
      h('h1', { className: 'page-header__title' }, '📖 Bíblia do Arma 3 — a wiki completa'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, 'Jogo base'),
        ` (${A3VAN_TOTAL_TOPICOS} tópicos) · `,
        h('span', { className: 'u-text-cyan' }, `coleção completa (${A3COL_TOTAL} itens)`),
        ' com guia de cada um · ',
        h('span', { className: 'u-text-cyan' }, `${A3TUT_TOTAL} mods`),
        ' do preset a fundo · comandos, campanhas e até os ',
        h('span', { className: 'u-text-cyan' }, 'arquivos reais no Drive'),
        '. Do casual ao programador.')));

  /* aviso de honestidade sobre teclas + link do preset */
  page.appendChild(h('div', { className: 'card a3tut-aviso' },
    h('p', null,
      h('b', null, '⌨️ Sobre os atalhos: '),
      'as teclas listadas são os padrões do jogo/ACE — TUDO é remapeável em ',
      h('b', null, 'Options → Controls'),
      ' (mods CBA: em Configure Addons). O Field Manual (Esc, dentro do jogo) é a referência oficial do vanilla; a página do Workshop (link em cada card) é a de cada mod.'),
    h('div', { className: 'a3tut-aviso__acoes' },
      h('a', { className: 'btn btn--primary', href: preset.arquivo, download: '' }, '⬇ Baixar o preset (arrastar no Launcher)'),
      h('a', { className: 'btn', href: '#/modpack?jogo=arma3' }, '◧ Central de Modpacks'))));

  /* ===== abas: jogo base | mods ===== */
  const abas = h('div', { className: 'symbols-cats a3tut-abas' });
  const abaBtn = (id, label) => h('button', {
    className: 'symbols-cat a3tut-aba' + (aba === id ? ' is-active' : ''), dataset: { aba: id },
    onclick: () => {
      aba = id; busca = ''; buscaInput.value = ''; catAtiva = 'all';
      abas.querySelectorAll('.a3tut-aba').forEach((b) => b.classList.toggle('is-active', b.dataset.aba === id));
      montarChips(); render();
    }
  }, h('span', { className: 'symbols-cat__label' }, label));
  abas.append(
    abaBtn('vanilla', `🎮 Jogo base (vanilla) · ${A3VAN_TOTAL_TOPICOS}`),
    abaBtn('armas', `🔫 Armas (database) · ${A3ARM_TOTAL}`),
    abaBtn('acessorios', `🔭 Miras & acessórios · ${A3ACC_TOTAL}`),
    abaBtn('veiculos', `🛡️ Veículos · ${A3VEI_TOTAL}`),
    abaBtn('terrenos', `🗺️ Terrenos · ${A3TER_TOTAL}`),
    abaBtn('municao', `💥 Munições · ${A3MUN_TOTAL}`),
    abaBtn('carregadores', `🧰 Carregadores · ${A3MAG_TOTAL}`),
    abaBtn('catalogo', A3CAT_META.disponivel
      ? `🎒 Catálogo (veículos, miras, gear) · ${A3CAT_META.nucleo}`
      : '🎒 Catálogo (veículos, miras, gear) · ⏳'),
    abaBtn('colecao', `📦 Coleção completa · ${A3COL_TOTAL}`),
    abaBtn('config', `🔧 Instalar & configurar mods · ${A3CFG_TOTAL_TOPICOS}`),
    abaBtn('mods', `🧩 Mods do preset · ${A3TUT_TOTAL}`),
    abaBtn('comandos', `⌨️ Comandos & Spawn · ${A3CMD_TOTAL}`),
    abaBtn('campanhas', `🏴 Campanhas · ${A3CAMP_TOTAL}`),
    abaBtn('drive', `☁️ Arquivos (Drive) · ${A3DRV_TOTAL}`));
  page.appendChild(abas);

  /* busca + chips (as categorias mudam conforme a aba) */
  const buscaInput = h('input', {
    className: 'input a3tut-busca', type: 'search',
    placeholder: 'Buscar… (ex.: rapel, zeroing, comandar, sniper)',
    value: buscaInicial,
    oninput: debounce((e) => { busca = e.target.value; render(); }, 120)
  });
  busca = buscaInicial;
  const chips = h('div', { className: 'symbols-cats' });
  function secoesDaAba() {
    if (aba === 'config') return A3CFG_SECOES;
    if (aba === 'comandos') return A3CMD_SECOES;
    if (aba === 'campanhas') return A3CAMP_SECOES;
    if (aba === 'drive') return A3DRV_SECOES;
    if (aba === 'vanilla') return A3VAN_SECOES;
    return null; // mods usa A3TUT_CATEGORIAS · colecao usa A3COL_CATS
  }
  function montarChips() {
    chips.replaceChildren();
    const secs = secoesDaAba();
    const cats = aba === 'mods'
      ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3TUT_CATEGORIAS]
      : (aba === 'colecao'
        ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3COL_CATS]
        : (aba === 'armas'
          ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3ARM_TIPOS]
          : (aba === 'veiculos'
            ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3VEI_CATEGORIAS]
            : (aba === 'catalogo'
            ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3CAT_CATEGORIAS]
            /* Munições e carregadores são lista PLANA: não têm seção, e o
             * filtro delas é a busca + ordenar coluna. Sem esta guarda o
             * `secs.map` abaixo estoura com `secs === null`. */
            : (!secs
              ? []
              : [{ id: 'all', nome: 'Tudo', icon: '⬡' },
                ...secs.map((s) => ({ id: s.id, nome: s.nome, icon: s.icon }))])))));
    cats.forEach((c) => {
      chips.appendChild(h('button', {
        className: 'symbols-cat' + (c.id === catAtiva ? ' is-active' : ''), dataset: { cat: c.id },
        onclick: () => {
          catAtiva = c.id;
          chips.querySelectorAll('.symbols-cat').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === c.id));
          render();
        }
      },
        h('span', { className: 'symbols-cat__icon' }, c.icon),
        h('span', { className: 'symbols-cat__label' }, c.nome)));
    });
  }
  const contador = h('div', { className: 'a3tut-contador u-text-muted' });
  page.append(h('div', { className: 'a3tut-toolbar' }, buscaInput), chips, contador);

  const corpo = h('div', null);
  page.appendChild(corpo);

  const linhaAtalho = ([tecla, acao]) =>
    h('div', { className: 'a3tut-atalho' },
      h('kbd', { className: 'a3tut-kbd' }, tecla),
      h('span', { className: 'a3tut-atalho__acao' }, acao));

  function cardMod(id, t) {
    const deps = A3TUT_DEPS[id];
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.nome),
        h('a', { className: 'a3tut-card__ws', href: urlPorId[id], target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
      deps && deps.length ? h('div', { className: 'a3tut-card__deps' },
        h('span', { className: 'a3tut-card__label' }, 'REQUER'),
        ...deps.map((dep) => h('span', { className: 'a3tut-dep' }, dep))) : null,
      h('p', { className: 'a3tut-card__oque' }, t.oQue),
      h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMO FUNCIONA'),
        h('p', null, t.como)),
      t.atalhos && t.atalhos.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
        h('div', { className: 'a3tut-atalhos' }, ...t.atalhos.map(linhaAtalho))) : null,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  function cardTopico(t) {
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.titulo),
        t.link ? h('a', { className: 'a3tut-card__ws', href: t.link.url, target: '_blank', rel: 'noopener noreferrer' }, t.link.rotulo + ' ↗') : null),
      h('p', { className: 'a3tut-card__oque' }, t.texto),
      t.atalhos && t.atalhos.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
        h('div', { className: 'a3tut-atalhos' }, ...t.atalhos.map(linhaAtalho))) : null,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  /* card da aba Comandos & Spawn: bloco SQF com botão de copiar */
  function cardComando(t) {
    let sqfEl = null;
    if (t.sqf) {
      const copiarBtn = h('button', {
        className: 'a3tut-sqf__copiar',
        onclick: () => {
          const done = () => { copiarBtn.textContent = 'copiado ✓'; setTimeout(() => { copiarBtn.textContent = '⧉ copiar'; }, 1600); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.sqf).then(done).catch(() => {});
          else done();
        }
      }, '⧉ copiar');
      sqfEl = h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDO (COLE NO CONSOLE)'),
        h('div', { className: 'a3tut-sqf' },
          h('pre', { className: 'a3tut-sqf__code' }, t.sqf),
          copiarBtn));
    }
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.titulo)),
      h('p', { className: 'a3tut-card__oque' }, t.texto),
      sqfEl,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  /* pula pra aba Mods já buscando o item (usado pelos cards da Coleção) */
  function irParaTutorial(nome) {
    const btn = abas.querySelector('[data-aba="mods"]');
    if (btn) btn.click();
    busca = nome; buscaInput.value = nome;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* card da aba Coleção: capa do Workshop + guia do autor */
  function cardColecao(id, it) {
    const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`;
    return h('div', { className: 'card a3tut-card a3col-card' },
      it.img ? h('img', { className: 'a3col-card__capa', src: it.img, alt: it.nome, loading: 'lazy' }) : null,
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, it.nome),
        h('a', { className: 'a3tut-card__ws', href: url, target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
      h('div', { className: 'a3col-card__meta' },
        it.tam ? h('span', { className: 'badge' }, it.tam) : null,
        it.autor ? h('span', { className: 'badge' }, 'por ' + it.autor) : null,
        ...it.tags.map((t) => h('span', { className: 'a3col-tag' }, t))),
      it.dlcs && it.dlcs.length ? h('div', { className: 'a3tut-card__deps' },
        h('span', { className: 'a3tut-card__label' }, 'DLC'),
        ...it.dlcs.map((d) => h('span', { className: 'a3tut-dep a3tut-dep--aviso' }, d))) : null,
      it.deps && it.deps.length ? h('div', { className: 'a3tut-card__deps' },
        h('span', { className: 'a3tut-card__label' }, 'REQUER'),
        ...it.deps.map((d) => h('span', { className: 'a3tut-dep' }, d))) : null,
      h('p', { className: 'a3tut-card__oque' }, it.resumo),
      it.guia ? h('details', { className: 'a3col-card__guia' },
        h('summary', null, '📖 guia completo do autor'),
        h('pre', { className: 'a3col-card__guiatxt' }, it.guia)) : null,
      it.temTutorial ? h('button', {
        className: 'a3col-card__irtut', onclick: () => irParaTutorial(it.nome)
      }, '🧩 tutorial detalhado na aba Mods →') : null);
  }

  /* visualizador de pastas do Drive (iframe embeddedfolderview — a pasta é
   * compartilhada por link, então o embed lista os arquivos AO VIVO) */
  function viewerDrive() {
    let pastaAtiva = A3DRV_PASTAS[0];
    const iframe = h('iframe', {
      className: 'a3drv-iframe', loading: 'lazy', title: 'Arquivos do Arma 3 no Drive',
      src: `https://drive.google.com/embeddedfolderview?id=${pastaAtiva.driveId}#list`
    });
    const descEl = h('p', { className: 'a3drv-desc u-text-muted' }, pastaAtiva.desc);
    const abrirEl = h('a', {
      className: 'btn', target: '_blank', rel: 'noopener noreferrer',
      href: `https://drive.google.com/drive/folders/${pastaAtiva.driveId}`
    }, 'abrir no Drive ↗');
    const chipsPastas = h('div', { className: 'symbols-cats a3drv-pastas' });
    A3DRV_PASTAS.forEach((p) => {
      chipsPastas.appendChild(h('button', {
        className: 'symbols-cat' + (p.id === pastaAtiva.id ? ' is-active' : ''), dataset: { pasta: p.id },
        onclick: () => {
          pastaAtiva = p;
          chipsPastas.querySelectorAll('.symbols-cat').forEach((b) => b.classList.toggle('is-active', b.dataset.pasta === p.id));
          iframe.src = `https://drive.google.com/embeddedfolderview?id=${p.driveId}#list`;
          descEl.textContent = p.desc;
          abrirEl.href = `https://drive.google.com/drive/folders/${p.driveId}`;
        }
      }, h('span', { className: 'symbols-cat__label' }, p.nome)));
    });
    return h('div', { className: 'card a3drv-viewer' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '☁️ Navegar nos arquivos reais (ao vivo)'),
        abrirEl),
      h('p', { className: 'a3tut-card__oque' },
        'O espelho completo da instalação do operador está numa pasta compartilhada do Drive — igual à aba Filmes, dá pra navegar sem sair do site. Escolha a pasta:'),
      chipsPastas, descEl, iframe);
  }

  /* ===== aba Armas: calculadora de balística + tabela estilo Fallout ===== */

  /* Miniatura do ícone extraído do jogo. Arma sem ícone NÃO ganha desenho
   * genérico: ganha um selo com o motivo (`imgAusente`). Um placeholder que
   * parecesse arma faria o leitor achar que está vendo aquela arma. */
  const MOTIVO_SEM_IMG = {
    'sem-picture-no-config': 'o config desta arma não aponta nenhum ícone',
    'paa-nao-extraido': 'ícone dentro de .ebo cifrado (DLC) — nem o Arma 3 Tools abre',
  };
  function thumb(a, tam = 'sm') {
    if (a.img) {
      return h('img', {
        className: `a3arm-thumb a3arm-thumb--${tam}`, src: a.img, alt: a.nome,
        loading: 'lazy', decoding: 'async', width: tam === 'sm' ? 56 : 112,
      });
    }
    return h('span', {
      className: `a3arm-thumb a3arm-thumb--${tam} a3arm-thumb--vazio`,
      title: MOTIVO_SEM_IMG[a.imgAusente] || 'sem ícone',
    }, '⃠');
  }

  /* Número do config ou marca de ausência — nunca 0 no lugar de "não sei". */
  const val = (x, sufixo = '', casas = 0) =>
    (typeof x === 'number'
      ? h('span', null, x.toFixed(casas).replace(/\.0+$/, ''),
        sufixo ? h('span', { className: 'a3arm-td__u' }, ' ' + sufixo) : null)
      : h('span', { className: 'a3arm-td__na', title: 'o config não informa' }, '—'));

  /* mini-SVG da trajetória (queda em cm × distância) */
  function svgTrajetoria(res, alvo) {
    const pts = res.trajetoria.filter((p) => p.x <= alvo * 1.02);
    if (pts.length < 2) return null;
    const W = 520, H = 150, padL = 8, padR = 8, padT = 10, padB = 18;
    const maxX = alvo || 1;
    const ys = pts.map((p) => p.y);
    const yMin = Math.min(0, ...ys), yMax = Math.max(0, ...ys);
    const span = (yMax - yMin) || 1;
    const sx = (x) => padL + (x / maxX) * (W - padL - padR);
    const sy = (y) => padT + (1 - (y - yMin) / span) * (H - padT - padB);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
    const NS = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', `0 0 ${W} ${H}`); el.setAttribute('class', 'a3arm-svg');
    const mk = (t, at) => { const n = document.createElementNS(NS, t); for (const k in at) n.setAttribute(k, at[k]); return n; };
    el.appendChild(mk('line', { x1: padL, y1: sy(0), x2: W - padR, y2: sy(0), class: 'a3arm-svg__zero' }));  // linha de mira
    el.appendChild(mk('path', { d, class: 'a3arm-svg__path' }));
    el.appendChild(mk('line', { x1: sx(alvo), y1: padT, x2: sx(alvo), y2: H - padB, class: 'a3arm-svg__alvo' }));
    const t1 = mk('text', { x: padL + 2, y: sy(0) - 4, class: 'a3arm-svg__lbl' }); t1.textContent = 'linha de mira';
    const t2 = mk('text', { x: sx(alvo) - 4, y: H - 6, class: 'a3arm-svg__lbl', 'text-anchor': 'end' }); t2.textContent = alvo + ' m';
    el.append(t1, t2);
    return el;
  }

  function calcBalistica() {
    const box = h('div', { className: 'card a3tut-card a3arm-calc' });
    const saida = h('div', { className: 'a3arm-calc__saida' });

    function recalc() {
      const a = A3ARM.find((w) => w.id === calcArmaId) || armasCalculaveis[0];
      const bal = dadosBalisticos(a);
      if (!bal) {
        /* Só chega aqui se a lista mudar: o seletor já filtra o não-balístico. */
        saida.replaceChildren(h('p', { className: 'a3arm-calc__aviso' },
          h('b', null, '⃠ Sem solução para esta arma. '),
          'Foguete e míssil não seguem o modelo de arrasto de bala — o config '
          + 'guarda velocidade de ejeção e empuxo, não um projétil balístico.'));
        return;
      }
      const { initSpeed, airFriction, fonte } = bal;
      const res = resolverTiro({ initSpeed, airFriction, zero: calcZero, alvo: calcAlvo, vento: calcVento });
      const sinal = res.quedaCm >= 0 ? '+' : '−';
      const abs = Math.abs(res.quedaCm);
      saida.replaceChildren(
        h('p', { className: 'a3arm-calc__proc' },
          fonte === 'config'
            ? [h('span', { className: 'a3arm-selo a3arm-selo--medido' }, '● MEDIDO'),
              ` v₀ ${initSpeed} m/s · airFriction ${airFriction} — valores do config do jogo.`]
            : [h('span', { className: 'a3arm-selo a3arm-selo--ref' }, '○ REFERÊNCIA'),
              ` v₀ ${initSpeed} m/s do config; arrasto ${airFriction} estimado pela família `
              + `${a.calibre || 'do calibre'} — esta arma não declara airFriction.`]),
        h('div', { className: 'a3arm-calc__grid' },
          resultado('Queda no alvo', `${sinal}${abs.toFixed(0)} cm`, res.quedaCm >= 0 ? 'acima da mira → segure baixo' : 'abaixo da mira → segure alto'),
          resultado('Correção', `${res.mils >= 0 ? '+' : '−'}${Math.abs(res.mils).toFixed(1)} mils`, 'no retículo (mil-dots)'),
          resultado('Tempo de voo', `${res.tempo.toFixed(2)} s`, `chega em ${calcAlvo} m`),
          resultado('Vel. no alvo', `${res.vAlvo.toFixed(0)} m/s`, `${res.energiaRelPct.toFixed(0)}% da energia de saída`),
          resultado('Deriva por vento', `${res.derivaVentoCm >= 0 ? '→' : '←'} ${Math.abs(res.derivaVentoCm).toFixed(0)} cm`, calcVento ? `vento ${calcVento} m/s` : 'sem vento'),
          resultado('Elevação do cano', `${res.anguloZeroGraus.toFixed(2)}°`, `zerado em ${calcZero} m · ápice ${(res.apiceM * 100).toFixed(0)} cm`)),
        svgTrajetoria(res, calcAlvo) || h('p', { className: 'u-text-muted' }, ''));
    }

    const selArma = h('select', { className: 'input a3arm-sel', onchange: (e) => { calcArmaId = e.target.value; recalc(); } });
    A3ARM_TIPOS.forEach((tp) => {
      const grp = h('optgroup', { label: tp.nome });
      armasCalculaveis.filter((a) => a.tipo === tp.id).forEach((a) =>
        grp.appendChild(h('option', { value: a.id, selected: a.id === calcArmaId },
          `${a.nome}${a.calibre ? ' — ' + a.calibre : ''}`)));
      if (grp.children.length) selArma.appendChild(grp);
    });
    const num = (val, min, max, step, set) => h('input', {
      className: 'input a3arm-num', type: 'number', value: String(val), min: String(min), max: String(max), step: String(step),
      oninput: (e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) { set(Math.max(min, Math.min(max, v))); recalc(); } }
    });
    box.append(
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🧮 Calculadora de trajetória (modelo real do engine)')),
      h('p', { className: 'a3tut-card__oque' },
        'Resolve o MESMO cálculo do jogo: arrasto ', h('code', null, 'airFriction × v²'),
        ' + gravidade 9.81, por integração numérica. Escolha a arma e o alvo — dá a queda, a correção em mils, o tempo e a energia residual. ',
        h('span', { className: 'u-text-muted' },
          `(v₀ e airFriction agora saem do config do jogo, arma por arma — `
          + `${armasCalculaveis.length} de ${A3ARM_TOTAL} têm balística. `
          + 'Lançadores ficam de fora: míssil não é projétil balístico.)')),
      h('div', { className: 'a3arm-calc__campos' },
        h('label', null, h('span', null, 'Arma'), selArma),
        h('label', null, h('span', null, 'Zeragem (m)'), num(calcZero, 25, 2000, 25, (v) => calcZero = v)),
        h('label', null, h('span', null, 'Alvo (m)'), num(calcAlvo, 10, 2000, 10, (v) => calcAlvo = v)),
        h('label', null, h('span', null, 'Vento lateral (m/s)'), num(calcVento, -20, 20, 1, (v) => calcVento = v))),
      saida);
    recalc();
    return box;
  }
  function resultado(rotulo, valor, sub) {
    return h('div', { className: 'a3arm-res' },
      h('span', { className: 'a3arm-res__rot' }, rotulo),
      h('b', { className: 'a3arm-res__val' }, valor),
      h('span', { className: 'a3arm-res__sub u-text-muted' }, sub));
  }

  /* ===== tabela ordenável, compartilhada pelas três abas de dados =====
   *
   * Uma spec de coluna, três tabelas (armas, munições, carregadores). Antes
   * cada tabela repetia thead + linha na mão; com isso, ordenar precisaria ser
   * escrito três vezes — e é justamente o que o operador pediu em todas.
   *
   * `ordem` guarda o estado por TABELA (a chave é o id), não global: ordenar os
   * fuzis não pode bagunçar a ordem dos snipers logo abaixo.
   *
   * `val(e)` é o valor pra COMPARAR, `cel(e)` é o que aparece. Separar os dois
   * é o que faz "8.7 cm" ordenar como 8.7 e não como texto — e o que mantém
   * ausente (`null`) sempre no fim, em vez de virar 0 e liderar a coluna
   * crescente, que seria a mentira de sempre. */
  const ordem = {};

  function tabelaSort(idTabela, colunas, itens) {
    const est = ordem[idTabela] || (ordem[idTabela] = { col: null, desc: false });

    let lista = itens;
    if (est.col) {
      const c = colunas.find((x) => x.k === est.col);
      if (c) {
        lista = [...itens].sort((a, b) => {
          const va = c.val(a), vb = c.val(b);
          /* Ausente vai SEMPRE pro fim, nos dois sentidos. */
          const na = va === null || va === undefined || va === '';
          const nb = vb === null || vb === undefined || vb === '';
          if (na && nb) return 0;
          if (na) return 1;
          if (nb) return -1;
          const r = typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb), 'pt-BR');
          return est.desc ? -r : r;
        });
      }
    }

    const th = (c) => h('th', {
      className: 'a3arm-th' + (c.cls ? ' ' + c.cls : '')
        + (c.k ? ' is-sortable' : '') + (est.col === c.k ? ' is-sorted' : ''),
      title: c.k ? 'ordenar por esta coluna' : null,
      onclick: c.k ? () => {
        if (est.col === c.k) est.desc = !est.desc;
        else { est.col = c.k; est.desc = !!c.descPrimeiro; }
        render();
      } : null,
    }, c.rot, c.k && est.col === c.k
      ? h('span', { className: 'a3arm-seta' }, est.desc ? ' ▾' : ' ▴')
      : null);

    return h('div', { className: 'a3arm-tabela-wrap' },
      h('table', { className: 'a3arm-tabela' },
        h('thead', null, h('tr', null, ...colunas.map(th))),
        h('tbody', null, ...lista.map((e) => h('tr', { className: 'a3arm-tr' },
          ...colunas.map((c) => h('td', {
            className: 'a3arm-td' + (c.celCls ? ' ' + c.celCls : ''),
          }, c.cel(e))))))));
  }

  const secao = (icon, titulo, desc, qtd, ...corpoEls) => h('div', { className: 'a3tut-secao' },
    h('div', { className: 'a3tut-secao__head' },
      h('span', { className: 'a3tut-secao__icon' }, icon),
      h('h2', { className: 'a3tut-secao__titulo' }, titulo),
      h('span', { className: 'badge badge--cyan' }, String(qtd))),
    desc ? h('p', { className: 'a3tut-secao__desc u-text-muted' }, desc) : null,
    ...corpoEls);

  /* Modos de tiro de uma arma. O MX tem 6 no config (Single, FullAuto, rajadas
   * e os modos que a óptica troca) — a tabela mostrava um RPM só. */
  function celModos(a) {
    const ms = a.modos || [];
    if (!ms.length) return h('span', { className: 'a3arm-td__na' }, '—');
    const aberto = expandido === a.id;
    return h('button', {
      className: 'a3arm-modos-btn' + (aberto ? ' is-open' : ''),
      title: ms.map((m) => m.nome).join(' · '),
      onclick: () => { expandido = aberto ? null : a.id; render(); },
    }, `${ms.length} modo${ms.length > 1 ? 's' : ''}`, aberto ? ' ▾' : ' ▸');
  }

  function detalheModos(a) {
    const ms = a.modos || [];
    return h('div', { className: 'a3arm-modos' },
      h('span', { className: 'a3arm-modos__tit' }, `Modos de tiro de ${a.nome}`),
      h('div', { className: 'a3arm-modos__grade' }, ...ms.map((m) => h('div', {
        className: 'a3arm-modo',
      },
        h('b', null, m.nome),
        h('span', null, m.auto ? 'automático' : 'semi',
          m.rajada > 1 ? ` · rajada de ${m.rajada}` : ''),
        h('span', { className: 'a3arm-num-cel' }, m.rpm ? `${m.rpm} tiros/min` : '—'),
        h('span', { className: 'u-text-muted' }, m.dispersao
          ? `dispersão ${(m.dispersao * 1000).toFixed(2)} mrad · ${(m.dispersao * 10000).toFixed(1)} cm a 100 m`
          : 'dispersão não informada')))));
  }

  /* ===== munições ===== */
  function cardFurtividade() {
    const q = A3MUN.filter((m) => typeof m.audibleFire === 'number')
      .sort((a, b) => a.audibleFire - b.audibleFire);
    const sub = A3MUN.filter((m) => m.subsonico).length;
    const exp = A3MUN.filter((m) => m.explosivo).length;
    return h('div', { className: 'card a3tut-card a3arm-proc' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '💥 Munição — o que estes números querem dizer')),
      h('p', { className: 'a3tut-card__oque' },
        'Dois campos do config têm nome enganoso e é onde quase todo mundo erra:'),
      h('ul', { className: 'a3tut-dicas' },
        h('li', null, h('b', null, 'Penetração ≠ calibre. '),
          'O campo ', h('code', null, 'caliber'), ' da MUNIÇÃO não é o calibre em mm — '
          + 'é o multiplicador de penetração do engine. Aqui está renomeado pra não confundir '
          + 'com o calibre da arma.'),
        h('li', null, h('b', null, 'Explosivo mata pelo dano INDIRETO. '),
          `${exp} munições são explosivas: o `, h('code', null, 'dano'),
          ' direto pode ser baixo e ainda assim matar pelo dano indireto dentro do raio. '
          + 'Olhar só a primeira coluna faz foguete parecer fraco.'),
        h('li', null, h('b', null, 'Furtividade. '),
          h('code', null, 'visibleFire'), ' e ', h('code', null, 'audibleFire'),
          ' são o quanto o tiro te denuncia — vão de ',
          h('b', null, String(q[0].audibleFire)), ' a ',
          h('b', null, String(q[q.length - 1].audibleFire)),
          `. E ${sub} munições são `, h('b', null, 'subsônicas'),
          ' (abaixo de 340 m/s): o projétil não estala ao passar, que é o que faz '
          + 'supressor valer a pena de verdade.')));
  }

  function tabelaMunicao(lista) {
    const flag = (on, txt, cls) => (on
      ? h('span', { className: `a3arm-flag ${cls}` }, txt)
      : h('span', { className: 'a3arm-td__na' }, '·'));
    const colunas = [
      { k: 'classe', rot: 'Munição', celCls: 'a3arm-td--nome', val: (m) => m.classe,
        cel: (m) => h('code', { className: 'a3arm-af' }, m.classe) },
      { k: 'dano', rot: 'Dano', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.dano, cel: (m) => val(m.dano, '', 1) },
      { k: 'ind', rot: 'Dano indireto', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.danoIndireto,
        cel: (m) => (m.danoIndireto
          ? h('span', { title: `raio de ${m.raioIndireto} m` }, String(m.danoIndireto),
            h('span', { className: 'a3arm-td__u' }, ` /${m.raioIndireto} m`))
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'pen', rot: 'Penetração', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.penetracao,
        cel: (m) => h('span', { title: 'campo `caliber` do config — multiplicador de penetração, não o calibre' },
          val(m.penetracao, '', 2)) },
      { k: 'vt', rot: 'Vel. típica', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.velTipica, cel: (m) => val(m.velTipica, 'm/s') },
      { k: 'af', rot: 'airFriction', celCls: 'a3arm-num-cel', val: (m) => m.airFriction,
        cel: (m) => (typeof m.airFriction === 'number'
          ? h('code', { className: 'a3arm-af' }, String(m.airFriction))
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'som', rot: 'Ruído', celCls: 'a3arm-num-cel', val: (m) => m.audibleFire,
        cel: (m) => h('span', { title: 'audibleFire — o quanto o tiro se ouve' }, val(m.audibleFire, '', 2)) },
      { k: 'luz', rot: 'Clarão', celCls: 'a3arm-num-cel', val: (m) => m.visibleFire,
        cel: (m) => h('span', { title: 'visibleFire — o quanto o tiro se vê' }, val(m.visibleFire, '', 2)) },
      { k: 'sub', rot: 'Subsônica', val: (m) => (m.subsonico ? 0 : 1),
        cel: (m) => flag(m.subsonico, 'subsônica', 'is-sub') },
      { k: 'exp', rot: 'Explosiva', val: (m) => (m.explosivo ? 0 : 1),
        cel: (m) => flag(m.explosivo, 'explosiva', 'is-exp') },
      { k: 'ric', rot: 'Ricocheteia', val: (m) => (m.ricochete ? 0 : 1),
        cel: (m) => flag(m.ricochete, 'ricocheteia', 'is-ric') },
    ];
    return secao('💥', 'Munições', 'Todas as munições que o preset carrega, com dano, '
      + 'penetração e o quanto cada tiro denuncia a posição.',
    lista.length, tabelaSort('municao', colunas, lista));
  }

  /* ===== miras e acessórios =====
   *
   * ⚠️ A coluna "Ampliação" e a coluna "FOV" são DUAS COISAS e ficam
   * separadas de propósito. Ampliação só existe onde o próprio jogo escreve
   * "Magnification: Nx"; nas outras 926 miras a célula fica vazia e só o FOV
   * aparece. Derivar uma da outra (0,75/FOV) discorda do texto do jogo em
   * 159 das 215 ópticas que trazem os dois — no ELCAN dá 12× contra "2x"
   * escrito pela Bohemia. Uma coluna só, "zoom", esconderia isso.
   */
  function cardAcessorios() {
    const miras = A3ACC.filter((a) => a.tipo === 'mira');
    const comAmp = miras.filter((a) => a.ampliacao !== null).length;
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🔭 De onde vem a ampliação')),
      h('p', { className: 'a3tut-card__oque' },
        'Ampliação e campo de visão são colunas separadas porque são grandezas '
        + 'diferentes. A ', h('b', null, 'ampliação'), ' só aparece quando o jogo '
        + 'a declara no texto do item ("Magnification: 2x") — são ',
        h('b', null, `${comAmp} das ${miras.length} miras`),
        '. Nas outras a célula fica vazia e sobra o ', h('b', null, 'FOV'),
        ', que é o campo de visão cru do config.'),
      h('p', { className: 'a3tut-card__oque' },
        'Por que não converter um no outro: a conta 0,75/FOV ',
        h('b', null, 'discorda do próprio jogo em 159 das 215'),
        ' miras que trazem os dois valores. No ELCAN SpecterOS ela dá 12×, e a '
        + 'Bohemia escreve "2x" na descrição. Preencher a coluna com a conta '
        + 'seria inventar número com cara de medição.'),
      h('p', { className: 'a3arm-proc__nota u-text-muted' },
        `Núcleo do jogo e DLCs: ${A3ACC.length} acessórios. `
        + `O acervo completo com mods tem ${A3ACC_TOTAL} — `,
        h('code', null, A3ACC_META.dbUrl), '.'));
  }

  function tabelaAcessorios(lista) {
    const TIPO_ROT = {
      mira: '🔭 mira', silenciador: '🤫 silenciador',
      apontador: '🔦 laser', bipe: '⚙️ bipé',
    };
    const colunas = [
      /* Sem thumb: o `imagem` daqui é o caminho .paa cru do config — o ícone
       * dos acessórios ainda não passou pelo extrator (só o das armas). */
      { k: 'nome', rot: 'Acessório', celCls: 'a3arm-td--nome', val: (a) => a.nome,
        cel: (a) => h('b', null, a.nome) },
      { k: 'tipo', rot: 'Tipo', val: (a) => a.tipo,
        cel: (a) => h('span', null, TIPO_ROT[a.tipo] || a.tipo) },
      { k: 'amp', rot: 'Ampliação', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => (Array.isArray(a.ampliacao) ? a.ampliacao[1] : a.ampliacao),
        cel: (a) => (a.ampliacaoRotulo
          ? h('b', { title: 'declarada pelo jogo na descrição do item' }, a.ampliacaoRotulo)
          : h('span', { className: 'a3arm-td__na', title: 'o jogo não declara a ampliação desta mira' }, '—')) },
      { k: 'fov', rot: 'FOV (config)', celCls: 'a3arm-num-cel',
        val: (a) => (a.fov ? a.fov.init : null),
        cel: (a) => (a.fov
          ? h('span', { title: 'campo de visão cru — NÃO é ampliação' },
            h('code', { className: 'a3arm-af' }, String(a.fov.init ?? a.fov.min)),
            a.fov.modos > 1 ? h('span', { className: 'a3arm-td__u' }, ` ${a.fov.modos} modos`) : null)
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'sil', rot: 'Coef. som', celCls: 'a3arm-num-cel',
        val: (a) => a.coefSilenciador, cel: (a) => val(a.coefSilenciador, '', 2) },
      { k: 'massa', rot: 'Massa', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.massa, cel: (a) => val(a.massa, '', 1) },
      { k: 'dlc', rot: 'Origem', val: (a) => a.dlc,
        cel: (a) => h('span', { className: 'a3arm-flag' }, a.dlc) },
      { k: 'classe', rot: 'Classe', val: (a) => a.classe,
        cel: (a) => h('code', { className: 'a3arm-af' }, a.classe) },
    ];
    return secao('🔭', 'Miras & acessórios',
      'Miras, silenciadores, lasers e bipés do jogo base e das DLCs, medidos no config.',
      lista.length, tabelaSort('acessorios', colunas, lista));
  }

  /* ===== veículos =====
   *
   * A coluna que justifica a tabela é "Ponto fraco": só a blindagem do casco
   * esconde onde o veículo cede. E ela compara SÓ blindagem absoluta —
   * armor negativo no config é blindagem RELATIVA ao casco (19.223 partes do
   * acervo, quase todas rodas), e misturar as duas anunciaria "ponto fraco:
   * −100". As relativas ficam numa coluna própria, contadas. */
  function tabelaVeiculos(lista) {
    const CAT = Object.fromEntries(A3VEI_CATEGORIAS.map((c) => [c.id, c]));
    const colunas = [
      { k: 'nome', rot: 'Veículo', celCls: 'a3arm-td--nome', val: (v) => v.nome,
        cel: (v) => h('b', null, v.nome) },
      { k: 'cat', rot: 'Tipo', val: (v) => v.categoria,
        cel: (v) => h('span', null, `${(CAT[v.categoria] || {}).icon || ''} `
          + `${(CAT[v.categoria] || {}).nome || v.categoria}`) },
      { k: 'armor', rot: 'Casco', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (v) => v.armor,
        cel: (v) => h('span', { title: 'blindagem total do casco' }, val(v.armor)) },
      { k: 'fraca', rot: 'Ponto fraco', celCls: 'a3arm-num-cel',
        val: (v) => (v.blindagem ? v.blindagem.menor : null),
        cel: (v) => {
          const b = v.blindagem;
          if (!b) {
            return h('span', { className: 'a3arm-td__na', title: 'o config não declara blindagem por parte' }, '—');
          }
          if (b.menor == null) {
            return h('span', { className: 'a3arm-td__na', title: `${b.partes} partes, nenhuma com blindagem absoluta` }, '—');
          }
          return h('span', { title: `a mais fraca das ${b.partes} partes com dano próprio` },
            h('b', null, String(b.menor)),
            h('span', { className: 'a3arm-td__u' }, ` ${b.menorParte || ''}`));
        } },
      { k: 'rel', rot: 'Partes relativas', celCls: 'a3arm-num-cel',
        val: (v) => (v.blindagem ? v.blindagem.relativas : null),
        cel: (v) => (v.blindagem && v.blindagem.relativas
          ? h('span', { title: 'blindagem negativa no config = proporcional ao casco (rodas, periscópios); não se compara com as absolutas' },
            String(v.blindagem.relativas))
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'vel', rot: 'Vel. máx.', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (v) => v.maxSpeed, cel: (v) => val(v.maxSpeed, 'km/h') },
      { k: 'lot', rot: 'Ocupantes', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (v) => v.lotacao, cel: (v) => val(v.lotacao) },
      { k: 'armas', rot: 'Armas', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (v) => v.armas, cel: (v) => val(v.armas) },
      { k: 'lado', rot: 'Lado', val: (v) => v.lado,
        cel: (v) => (v.lado ? h('span', { className: 'a3arm-flag' }, v.lado)
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'dlc', rot: 'Origem', val: (v) => v.dlc,
        cel: (v) => h('span', { className: 'a3arm-flag' }, v.dlc) },
      { k: 'classe', rot: 'Classe', val: (v) => v.classe,
        cel: (v) => h('code', { className: 'a3arm-af' }, v.classe) },
    ];
    return secao('🛡️', 'Veículos',
      'Blindados, viaturas, aeronaves e navios do jogo base e das DLCs. '
      + 'A coluna "Ponto fraco" é a parte com menor blindagem ABSOLUTA — é por '
      + 'ela que o veículo cede antes do casco ceder.',
    lista.length, tabelaSort('veiculos', colunas, lista));
  }

  /* ===== terrenos =====
   *
   * A coluna que importa é "Northing": ela mostra o SINAL do passo da grade.
   * 30 dos 31 mundos contam de cima pra baixo (convenção vanilla) e 1 conta
   * pra cima — quem assumir um só erra o eixo N-S em 180°. */
  function cardTerrenos() {
    const desce = A3TER.filter((t) => t.grade && t.grade.passoY < 0).length;
    const sobe = A3TER.filter((t) => t.grade && t.grade.passoY > 0).length;
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🗺️ A grade de cada mundo é diferente')),
      h('p', { className: 'a3tut-card__oque' },
        'Converter "034056" em metros exige o offset e o passo ',
        h('b', null, 'daquele terreno'), ' — e o passo tem SINAL. ',
        h('b', null, `${desce} mundos`), ' contam o northing do norte para baixo '
        + '(a convenção dos mapas vanilla) e ', h('b', null, `${sobe}`),
        ' conta para cima. Assumir uma convenção só erraria o eixo N-S em 180°.'),
      h('p', { className: 'a3tut-card__oque' },
        'Por isso a grade vai literal, como o config declara, e a conversão fica '
        + 'em um módulo puro (', h('code', null, 'src/utils/arma3-grade.js'),
        ') com verificador que confere ida-e-volta, anti-simetria do azimute e '
        + 'vizinhança em ', h('b', null, 'todos'), ' os mundos — não num exemplo escolhido.'),
      h('p', { className: 'a3arm-proc__nota u-text-muted' },
        'Mundos-alias (casca apontando pro mesmo .wrp de outro) ficam fora, '
        + 'senão o mesmo terreno apareceria várias vezes.'));
  }

  function tabelaTerrenos(lista) {
    const colunas = [
      { k: 'nome', rot: 'Terreno', celCls: 'a3arm-td--nome', val: (t) => t.nome,
        cel: (t) => h('a', { href: `#/vanguard?terreno=${t.id}`, title: 'calcular azimute neste terreno' },
          h('b', null, t.nome)) },
      { k: 'tam', rot: 'Tamanho', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (t) => t.tamanhoM,
        cel: (t) => (t.tamanhoM
          ? h('span', null, (t.tamanhoM / 1000).toFixed(1), h('span', { className: 'a3arm-td__u' }, ' km'))
          : h('span', { className: 'a3arm-td__na', title: 'o config deste mundo não declara mapSize' }, '—')) },
      { k: 'area', rot: 'Área', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (t) => t.areaKm2, cel: (t) => val(t.areaKm2, 'km²', 0) },
      { k: 'cel', rot: 'Célula', celCls: 'a3arm-num-cel',
        val: (t) => (t.grade ? Math.abs(t.grade.passoX) : null),
        cel: (t) => (t.grade ? val(Math.abs(t.grade.passoX), 'm') : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'north', rot: 'Northing', val: (t) => (t.grade ? (t.grade.passoY < 0 ? 0 : 1) : null),
        cel: (t) => (t.grade
          ? h('span', { className: 'a3arm-flag', title: `passoY = ${t.grade.passoY}` },
            t.grade.passoY < 0 ? '↓ p/ baixo' : '↑ p/ cima')
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'loc', rot: 'Localidades', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (t) => t.localidades, cel: (t) => val(t.localidades) },
      { k: 'aero', rot: 'Pistas', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (t) => t.aeroportos, cel: (t) => val(t.aeroportos) },
      { k: 'dlc', rot: 'Origem', val: (t) => t.dlc,
        cel: (t) => h('span', { className: 'a3arm-flag' }, t.dlc) },
      { k: 'classe', rot: 'Classe', val: (t) => t.classe,
        cel: (t) => h('code', { className: 'a3arm-af' }, t.classe) },
    ];
    return secao('🗺️', 'Terrenos',
      'Os mundos jogáveis com a grade real de cada um. Clique no nome para abrir '
      + 'o cálculo de azimute do Vanguard já naquele terreno.',
      lista.length, tabelaSort('terrenos', colunas, lista));
  }

  /* ===== carregadores ===== */
  function cardCarregadores() {
    const variam = {};
    A3MAG.forEach((m) => {
      if (!m.municao || !m.v0) return;
      (variam[m.municao.toLowerCase()] ||= new Set()).add(m.v0);
    });
    const nVariam = Object.values(variam).filter((s) => s.size > 1).length;
    return h('div', { className: 'card a3tut-card a3arm-proc' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🧰 Carregador muda a balística')),
      h('p', { className: 'a3tut-card__oque' },
        'Cada carregador tem ', h('b', null, 'velocidade de saída própria'),
        ' — não é atributo só da arma. Em ', h('b', null, String(nVariam)),
        ' munições a mesma bala sai com v₀ diferente dependendo do carregador, e é por '
        + 'isso que a mesma arma aparece em mais de uma linha na tabela de armas: '
        + 'não é duplicata, é balística diferente.'),
      h('p', { className: 'a3arm-proc__nota u-text-muted' },
        'O ', h('code', null, 'v₀'), ' aqui é o do carregador; a arma aplica o multiplicador '
        + 'dela por cima, e o resultado é o que aparece na coluna v₀ das armas.'));
  }

  function tabelaCarregadores(lista) {
    const colunas = [
      { k: 'nome', rot: 'Carregador', celCls: 'a3arm-td--nome', val: (m) => m.nome,
        cel: (m) => [m.nome, m.tracante ? h('span', { className: 'a3arm-flag is-tra' }, 'traçante') : null] },
      { k: 'cap', rot: 'Capacidade', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.capacidade, cel: (m) => val(m.capacidade) },
      { k: 'v0', rot: 'v₀', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.v0, cel: (m) => val(m.v0, 'm/s') },
      { k: 'massa', rot: 'Massa', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (m) => m.massa, cel: (m) => val(m.massa) },
      { k: 'mun', rot: 'Munição', val: (m) => m.municao,
        cel: (m) => (m.municao
          ? h('code', { className: 'a3arm-af' }, m.municao)
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'origem', rot: 'Origem', val: (m) => m.origem,
        cel: (m) => h('span', { className: 'a3col-tag' }, m.origem || '—') },
    ];
    return secao('🧰', 'Carregadores', 'Capacidade, massa e a velocidade de saída de cada um.',
      lista.length, tabelaSort('carregadores', colunas, lista));
  }

  /* tabela de um tipo de arma (estilo Fallout, rolagem horizontal) */
  function tabelaTipo(tp, armas) {
    const colunas = [
      { rot: '', cls: 'a3arm-th--img', celCls: 'a3arm-td--img', cel: (a) => thumb(a) },
      { k: 'nome', rot: 'Arma', celCls: 'a3arm-td--nome', val: (a) => a.nome,
        cel: (a) => [a.nome,
          a.variantes > 1
            ? h('span', { className: 'a3arm-var', title: a.nomes.join(' · ') }, `+${a.variantes - 1} variantes`)
            : null,
          a.faccao ? h('span', { className: 'a3arm-fac' }, a.faccao) : null] },
      { k: 'calibre', rot: 'Calibre', val: (a) => a.calibre,
        cel: (a) => a.calibre || h('span', { className: 'a3arm-td__na' }, '—') },
      { k: 'v0', rot: 'v₀', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.v0, cel: (a) => val(a.v0, 'm/s', 1) },
      { k: 'af', rot: 'airFriction', celCls: 'a3arm-num-cel', val: (a) => a.airFriction,
        cel: (a) => (typeof a.airFriction === 'number'
          ? h('code', { className: 'a3arm-af' }, String(a.airFriction))
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'disp', rot: 'Precisão', celCls: 'a3arm-num-cel', val: (a) => a.dispersaoCm100,
        cel: (a) => (a.dispersaoCm100
          ? h('span', { title: `${a.dispersaoMrad} mrad — dispersão do melhor modo de tiro` },
            `${a.dispersaoCm100}`, h('span', { className: 'a3arm-td__u' }, ' cm/100 m'))
          : h('span', { className: 'a3arm-td__na' }, '—')) },
      { k: 'dano', rot: 'Dano', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.dano, cel: (a) => val(a.dano, '', 1) },
      { k: 'rpm', rot: 'Cadência', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.rpm, cel: (a) => val(a.rpm, '/min') },
      { k: 'modos', rot: 'Modos', val: (a) => (a.modos || []).length, cel: celModos },
      { k: 'cap', rot: 'Carreg.', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.capacidade, cel: (a) => val(a.capacidade) },
      { k: 'zero', rot: 'Zeroing', celCls: 'a3arm-num-cel', descPrimeiro: true,
        val: (a) => a.zeroing, cel: (a) => val(a.zeroing, 'm') },
      { k: 'origem', rot: 'Origem', val: (a) => a.origem,
        cel: (a) => h('span', { className: 'a3col-tag' }, a.origem || '—') },
      { rot: 'Balística', cel: (a) => (dadosBalisticos(a)
        ? h('button', {
          className: 'a3arm-calcbtn', title: 'abrir na calculadora',
          onclick: () => {
            calcArmaId = a.id; aba = 'armas'; catAtiva = 'all'; busca = '';
            buscaInput.value = ''; render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, '🧮')
        : h('span', {
          className: 'a3arm-td__na',
          title: a.tipo === 'lancador'
            ? 'míssil/foguete não segue o modelo de arrasto de bala'
            : 'o config não informa v₀ e airFriction desta arma'
        }, '—')) },
    ];
    const aberta = armas.find((a) => a.id === expandido);
    return secao(tp.icon, tp.nome, tp.desc, armas.length,
      tabelaSort(`arma:${tp.id}`, colunas, armas),
      aberta ? detalheModos(aberta) : null);
  }

  /* Painel de procedência: de onde vem cada número e o que falta. É o que
   * separa "database" de "tabela bonita" — o leitor consegue auditar. */
  function procedenciaArmas() {
    const m = A3ARM_META;
    const pct = (n, d) => `${((n / d) * 100).toFixed(0)}%`;
    const linha = (rot, valor, nota) => h('div', { className: 'a3arm-proc__linha' },
      h('span', { className: 'a3arm-proc__rot' }, rot),
      h('b', null, valor),
      h('span', { className: 'u-text-muted' }, nota));

    const btn = h('button', {
      className: 'btn', onclick: async () => {
        if (arsenalEstado === 'carregando' || arsenalMods) return;
        arsenalEstado = 'carregando';
        btn.textContent = 'baixando…'; btn.disabled = true;
        try {
          arsenalMods = (await carregarArsenal()).filter((a) => a.ehMod);
          arsenalEstado = 'pronto';
          render();
        } catch (err) {
          arsenalEstado = 'erro';
          btn.disabled = false;
          btn.textContent = 'falhou — tentar de novo';
          console.error('[arma3] arsenal completo:', err);
        }
      }
    }, `⬇ Carregar o arsenal completo (+${m.mods} armas de mods)`);

    return h('div', { className: 'card a3tut-card a3arm-proc' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🔬 Procedência dos números')),
      h('p', { className: 'a3tut-card__oque' },
        'Tudo aqui foi lido do config do jogo ',
        h('b', null, 'em execução'), ', com o preset completo carregado — ',
        h('code', null, m.dump), '. Nada é estimado, e o que falta aparece como ',
        h('span', { className: 'a3arm-td__na' }, '—'), ', nunca como zero.'),
      h('div', { className: 'a3arm-proc__grid' },
        linha('Classes no config', String(m.classesNoConfig), 'inclui variante de óptica e camuflagem'),
        linha('Armas distintas', String(m.armasCanonicas), 'mesmo modelo + mesma balística = uma linha'),
        linha('Núcleo (jogo + DLC)', String(m.nucleo), 'no bundle, sempre disponível'),
        linha('Com balística', `${m.nucleoComBalistica}/${m.nucleo}`,
          `${pct(m.nucleoComBalistica, m.nucleo)} do núcleo tem v₀ e airFriction`),
        linha('Com ícone', `${m.nucleoComIcone}/${m.nucleo}`,
          'o que falta é DLC em .ebo cifrado — nem o Arma 3 Tools abre')),
      h('p', { className: 'a3arm-proc__nota u-text-muted' },
        h('b', null, 'Classificação: '),
        'o tipo (fuzil/DMR/sniper…) é o ÚNICO campo inferido — não existe no config. '
        + 'Cada arma registra em que evidência caiu: ',
        ...Object.entries(m.porEvidencia).map(([k, v], i) =>
          h('span', null, i ? ' · ' : '', h('code', null, k), ` ${v}`)),
        '. O que não dá pra classificar fica como ', h('code', null, 'primaria'),
        ' em vez de virar "fuzil" por default.'),
      arsenalMods ? null : h('div', { className: 'a3arm-proc__acoes' }, btn));
  }

  /* Cabeçalho do catálogo — inclusive o estado "ainda não extraído", que é
   * informação, não erro: esses dados só existem depois do dump no jogo. */
  function catalogoCabecalho() {
    if (!A3CAT_META.disponivel) {
      return h('div', { className: 'card a3tut-card a3cat-pendente' },
        h('div', { className: 'a3tut-card__head' },
          h('b', { className: 'a3tut-card__nome' }, '⏳ Dados extraídos, catálogo ainda não montado')),
        h('p', { className: 'a3tut-card__oque' },
          'Veículos, soldados, miras, uniformes, coletes, capacetes, mochilas e '
          + 'acessórios saem do mesmo lugar que as armas: o config do jogo ',
          h('b', null, 'em execução'),
          '. Essa parte já foi feita — os dumps rodaram e o dado cru está em ',
          h('code', null, 'scripts/arma3/out/'),
          '. O que falta é o gerador que transforma esse cru nas tabelas desta aba. '
          + 'Até ele existir, a aba fica honestamente vazia: mostrar número que não '
          + 'foi conferido seria pior que não mostrar nada.'),
        h('div', { className: 'a3tut-card__sec' },
          h('span', { className: 'a3tut-card__label' }, 'O QUE JÁ EXISTE'),
          h('ul', { className: 'a3tut-dicas' },
            h('li', null, h('code', null, 'out/arma3-itens.json'),
              ' — uniformes, coletes, capacetes, mochilas, óculos'),
            h('li', null, h('code', null, 'out/arma3-veiculos.json'),
              ' — veículos e soldados, com blindagem por hitpoint'),
            h('li', null, h('code', null, 'out/arma3-acessorios.json'),
              ' — miras, supressores, bipés e lasers'),
            h('li', null, h('code', null, 'out/arma3-mapas.json'), ' — os terrenos'),
            h('li', null, h('code', null, 'out/arma3-animacoes.json'), ' — gestos e poses'))),
        h('p', { className: 'a3arm-proc__nota u-text-muted' },
          'As ', h('b', null, `${A3CAT_CATEGORIAS.length} categorias`),
          ' já estão definidas com as colunas de cada uma — a tabela liga sozinha '
          + 'quando o gerador rodar.'));
    }
    const btn = h('button', {
      className: 'btn', onclick: async () => {
        if (catalogoEstado === 'carregando' || catalogoMods) return;
        catalogoEstado = 'carregando';
        btn.textContent = 'baixando…'; btn.disabled = true;
        try {
          catalogoMods = (await carregarCatalogo()).filter((e) => e.ehMod);
          catalogoEstado = 'pronto';
          render();
        } catch (err) {
          catalogoEstado = 'erro';
          btn.disabled = false;
          btn.textContent = 'falhou — tentar de novo';
          console.error('[arma3] catálogo completo:', err);
        }
      }
    }, `⬇ Carregar o catálogo completo (+${A3CAT_META.total - A3CAT_META.nucleo} de mods)`);
    return h('div', { className: 'card a3tut-card a3arm-proc' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, '🔬 Catálogo — procedência')),
      h('p', { className: 'a3tut-card__oque' },
        'Do config do jogo em execução (', h('code', null, A3CAT_META.dump || '—'),
        '). Blindagem, velocidade, zoom de mira e proteção de colete são valores '
        + 'lidos, não estimados. Ausente aparece como ',
        h('span', { className: 'a3arm-td__na' }, '—'), '.'),
      catalogoMods ? null : h('div', { className: 'a3arm-proc__acoes' }, btn));
  }

  /* Tabela de uma categoria do catálogo. As colunas vêm de A3CAT_CATEGORIAS —
   * acrescentar categoria não exige mexer aqui. */
  function tabelaCategoria(cat, itens) {
    const COL = {
      blindagem: ['Blindagem', (e) => val(e.blindagem)],
      velocidade: ['Vel. máx.', (e) => val(e.velocidade, 'km/h')],
      combustivel: ['Combustível', (e) => val(e.combustivel, '', 2)],
      transporte: ['Transporta', (e) => val(e.transporte)],
      armamento: ['Armamento', (e) => (e.armamento && e.armamento.length
        ? h('span', { title: e.armamento.join(' · ') }, `${e.armamento.length} sistema(s)`)
        : h('span', { className: 'a3arm-td__na' }, '—'))],
      lado: ['Lado', (e) => e.lado || h('span', { className: 'a3arm-td__na' }, '—')],
      faccao: ['Facção', (e) => e.faccao || h('span', { className: 'a3arm-td__na' }, '—')],
      uniforme: ['Uniforme', (e) => e.uniforme || h('span', { className: 'a3arm-td__na' }, '—')],
      zoom: ['Zoom máx.', (e) => (e.zoomMax
        ? h('span', null, `${e.zoomMax}×`)
        : h('span', { className: 'a3arm-td__na' }, '—'))],
      visao: ['Visão', (e) => {
        const modos = [...new Set((e.opticas || []).flatMap((o) => o.visao || []))];
        return modos.length ? modos.join(', ') : h('span', { className: 'a3arm-td__na' }, '—');
      }],
      protecao: ['Proteção', (e) => (typeof e.protecaoTorax === 'number'
        ? h('span', { title: (e.protecao || []).map((p) => `${p.ponto}: ${p.armor}`).join(' · ') },
          String(e.protecaoTorax), h('span', { className: 'a3arm-td__u' }, ` (${e.protecaoPonto})`))
        : h('span', { className: 'a3arm-td__na' }, '—'))],
      capacidade: ['Capacidade', (e) => val(e.capacidade)],
      massa: ['Massa', (e) => val(e.massa)],
    };
    const cols = (cat.colunas || []).filter((c) => COL[c]);
    const linha = (e) => h('tr', { className: 'a3arm-tr' },
      h('td', { className: 'a3arm-td a3arm-td--img' }, thumb(e)),
      h('td', { className: 'a3arm-td a3arm-td--nome' }, e.nome,
        e.variantes > 1
          ? h('span', { className: 'a3arm-var', title: e.nomes.join(' · ') }, `+${e.variantes - 1} variantes`)
          : null),
      ...cols.map((c) => h('td', { className: 'a3arm-td a3arm-num-cel' }, COL[c][1](e))),
      h('td', { className: 'a3arm-td' }, h('span', { className: 'a3col-tag' }, e.origem || '—')),
      h('td', { className: 'a3arm-td a3arm-td--obs' },
        e.desc || h('span', { className: 'a3arm-td__na' }, '—')));
    const tabela = h('table', { className: 'a3arm-tabela' },
      h('thead', null, h('tr', null,
        h('th', { className: 'a3arm-th--img' }, ''), h('th', null, 'Nome'),
        ...cols.map((c) => h('th', null, COL[c][0])),
        h('th', null, 'Origem'), h('th', null, 'Descrição'))),
      h('tbody', null, ...itens.map(linha)));
    return h('div', { className: 'a3tut-secao' },
      h('div', { className: 'a3tut-secao__head' },
        h('span', { className: 'a3tut-secao__icon' }, cat.icon),
        h('h2', { className: 'a3tut-secao__titulo' }, cat.nome),
        h('span', { className: 'badge badge--cyan' }, String(itens.length))),
      h('p', { className: 'a3tut-secao__desc u-text-muted' }, cat.desc),
      h('div', { className: 'a3arm-tabela-wrap' }, tabela));
  }

  function secaoEl(cat, cards, qtd, desc) {
    return h('div', { className: 'a3tut-secao' },
      h('div', { className: 'a3tut-secao__head' },
        h('span', { className: 'a3tut-secao__icon' }, cat.icon),
        h('h2', { className: 'a3tut-secao__titulo' }, cat.nome),
        h('span', { className: 'badge badge--cyan' }, String(qtd))),
      h('p', { className: 'a3tut-secao__desc u-text-muted' }, desc),
      h('div', { className: 'a3tut-grid' }, ...cards));
  }

  function render() {
    const termo = normalize(busca.trim());
    corpo.replaceChildren();
    let visiveis = 0, total = 0;

    if (aba === 'mods') {
      total = A3TUT_TOTAL;
      /* destaque pedido pelo operador: o mod das 2 armas principais (fora do
       * preset — Dual Arms). Aparece no topo da aba, some se a busca não bater. */
      const da = A3TUT_DUAL_ARMS;
      if (!termo || normalize(`${da.nome} ${da.oQue} duas armas principais primarias`).includes(termo)) {
        corpo.appendChild(h('div', { className: 'card a3tut-card a3tut-card--destaque' },
          h('div', { className: 'a3tut-card__head' },
            h('b', { className: 'a3tut-card__nome' }, '🎯 ' + da.nome),
            h('a', { className: 'a3tut-card__ws', href: da.url, target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
          h('div', { className: 'a3tut-card__deps' },
            h('span', { className: 'a3tut-dep a3tut-dep--aviso' }, da.nota)),
          h('p', { className: 'a3tut-card__oque' }, da.oQue),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'COMO FUNCIONA'),
            h('p', null, da.como)),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
            h('div', { className: 'a3tut-atalhos' }, ...da.atalhos.map(linhaAtalho))),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'DICAS'),
            h('ul', { className: 'a3tut-dicas' }, ...da.dicas.map((d) => h('li', null, d))))));
      }
      A3TUT_CATEGORIAS.forEach((cat) => {
        if (catAtiva !== 'all' && catAtiva !== cat.id) return;
        const doCat = Object.entries(A3TUT_MODS).filter(([, t]) => t.cat === cat.id);
        const filtrados = !termo ? doCat : doCat.filter(([, t]) =>
          normalize(`${t.nome} ${t.oQue} ${t.como}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(secaoEl(cat, filtrados.map(([id, t]) => cardMod(id, t)), filtrados.length, cat.desc));
      });
      contador.textContent = `${visiveis} de ${total} mods`;
    } else if (aba === 'colecao') {
      total = A3COL_TOTAL;
      /* cabeçalho da coleção (some se houver busca ativa) */
      if (!termo) {
        corpo.appendChild(h('div', { className: 'card a3tut-card a3tut-card--destaque' },
          h('div', { className: 'a3tut-card__head' },
            h('b', { className: 'a3tut-card__nome' }, `📦 Coleção "${A3COL_INFO.nome}"`),
            h('a', { className: 'a3tut-card__ws', href: A3COL_INFO.url, target: '_blank', rel: 'noopener noreferrer' }, 'assinar na Steam ↗')),
          h('p', { className: 'a3tut-card__oque' },
            `A coleção oficial do site, montada por ${A3COL_INFO.autor}: ${A3COL_TOTAL} itens entre mods, cenários, composições e terrenos — TUDO catalogado abaixo com capa, tamanho, dependências e o guia de cada um. Assinou a coleção, o Launcher baixa tudo sozinho.`)));
      }
      A3COL_CATS.forEach((cat) => {
        if (catAtiva !== 'all' && catAtiva !== cat.id) return;
        const doCat = Object.entries(A3COL_ITENS).filter(([, it]) => it.cat === cat.id);
        const filtrados = !termo ? doCat : doCat.filter(([id, it]) =>
          normalize(`${it.nome} ${it.resumo} ${it.tags.join(' ')} ${id}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(secaoEl(cat, filtrados.map(([id, it]) => cardColecao(id, it)), filtrados.length, cat.desc));
      });
      contador.textContent = `${visiveis} de ${total} itens da coleção`;
    } else if (aba === 'armas') {
      const base = arsenalMods ? A3ARM.concat(arsenalMods) : A3ARM;
      total = base.length;
      if (!termo && catAtiva === 'all') {
        corpo.appendChild(calcBalistica());
        corpo.appendChild(procedenciaArmas());
      }
      A3ARM_TIPOS.forEach((tp) => {
        if (catAtiva !== 'all' && catAtiva !== tp.id) return;
        const doTipo = base.filter((a) => a.tipo === tp.id);
        const filtrados = !termo ? doTipo : doTipo.filter((a) => normalize(
          `${a.nome} ${a.nomes ? a.nomes.join(' ') : ''} ${a.calibre || ''} ${a.faccao || ''} `
          + `${a.origem || ''} ${a.obs || ''} ${a.desc || ''} ${a.classe}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(tabelaTipo(tp, filtrados));
      });
      contador.textContent = `${visiveis} de ${total} armas`
        + (arsenalMods ? ' (núcleo + mods)' : ` no núcleo · ${A3ARM_META.mods} de mods sob demanda`);
    } else if (aba === 'acessorios') {
      total = A3ACC.length;
      if (!termo) corpo.appendChild(cardAcessorios());
      const lista = !termo ? A3ACC : A3ACC.filter((a) => normalize(
        `${a.nome} ${a.classe} ${a.tipo} ${a.dlc} ${a.ampliacaoRotulo || ''} `
        + `${a.descricao || ''}`).includes(termo));
      visiveis = lista.length;
      if (lista.length) corpo.appendChild(tabelaAcessorios(lista));
      contador.textContent = `${visiveis} de ${total} acessórios (núcleo do jogo)`;
    } else if (aba === 'terrenos') {
      total = A3TER_TOTAL;
      if (!termo) corpo.appendChild(cardTerrenos());
      const lista = !termo ? A3TER : A3TER.filter((t) => normalize(
        `${t.nome} ${t.classe} ${t.dlc} ${t.autor || ''} `
        + `${(t.capitais || []).join(' ')}`).includes(termo));
      visiveis = lista.length;
      if (lista.length) corpo.appendChild(tabelaTerrenos(lista));
      contador.textContent = `${visiveis} de ${total} terrenos`;
    } else if (aba === 'veiculos') {
      total = A3VEI.length;
      const daCat = catAtiva === 'all' ? A3VEI : A3VEI.filter((v) => v.categoria === catAtiva);
      const lista = !termo ? daCat : daCat.filter((v) => normalize(
        `${v.nome} ${v.classe} ${v.dlc} ${v.lado || ''} ${v.faccao || ''} ${v.categoria}`
      ).includes(termo));
      visiveis = lista.length;
      if (lista.length) corpo.appendChild(tabelaVeiculos(lista));
      contador.textContent = `${visiveis} de ${total} veículos do núcleo `
        + `(${A3VEI_META.porCategoria ? Object.values(A3VEI_META.porCategoria).reduce((a, b) => a + b, 0) : 0} no acervo com mods)`;
    } else if (aba === 'municao') {
      total = A3MUN_TOTAL;
      if (!termo) corpo.appendChild(cardFurtividade());
      const lista = !termo ? A3MUN : A3MUN.filter((m) =>
        normalize(`${m.classe} ${m.subsonico ? 'subsonica' : ''} ${m.explosivo ? 'explosiva' : ''}`).includes(termo));
      visiveis = lista.length;
      if (lista.length) corpo.appendChild(tabelaMunicao(lista));
      contador.textContent = `${visiveis} de ${total} munições`;
    } else if (aba === 'carregadores') {
      total = A3MAG_TOTAL;
      if (!termo) corpo.appendChild(cardCarregadores());
      const lista = !termo ? A3MAG : A3MAG.filter((m) =>
        normalize(`${m.nome} ${m.classe} ${m.municao || ''} ${m.origem || ''}`).includes(termo));
      visiveis = lista.length;
      if (lista.length) corpo.appendChild(tabelaCarregadores(lista));
      contador.textContent = `${visiveis} de ${total} carregadores`;
    } else if (aba === 'catalogo') {
      const base = catalogoMods ? A3CAT.concat(catalogoMods) : A3CAT;
      total = base.length;
      if (!termo) corpo.appendChild(catalogoCabecalho());
      if (A3CAT_META.disponivel) {
        A3CAT_CATEGORIAS.forEach((cat) => {
          if (catAtiva !== 'all' && catAtiva !== cat.id) return;
          const daCat = base.filter((e) => e.categoria === cat.id);
          const filtrados = !termo ? daCat : daCat.filter((e) => normalize(
            `${e.nome} ${e.nomes ? e.nomes.join(' ') : ''} ${e.faccao || ''} `
            + `${e.origem || ''} ${e.desc || ''} ${e.classe}`).includes(termo));
          if (!filtrados.length) return;
          visiveis += filtrados.length;
          corpo.appendChild(tabelaCategoria(cat, filtrados));
        });
      }
      contador.textContent = A3CAT_META.disponivel
        ? `${visiveis} de ${total} itens do catálogo`
        : 'catálogo aguardando extração no jogo';
    } else {
      const secs = secoesDaAba();
      total = aba === 'config' ? A3CFG_TOTAL_TOPICOS
        : (aba === 'comandos' ? A3CMD_TOTAL
          : (aba === 'campanhas' ? A3CAMP_TOTAL
            : (aba === 'drive' ? A3DRV_TOTAL : A3VAN_TOTAL_TOPICOS)));
      const renderCard = aba === 'comandos' ? cardComando : cardTopico;
      if (aba === 'drive' && !termo && catAtiva === 'all') corpo.appendChild(viewerDrive());
      secs.forEach((sec) => {
        if (catAtiva !== 'all' && catAtiva !== sec.id) return;
        const lista = sec.topicos || sec.itens || [];
        const filtrados = !termo ? lista : lista.filter((t) =>
          normalize(`${t.titulo} ${t.texto} ${t.sqf || ''}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(secaoEl(sec, filtrados.map(renderCard), filtrados.length, sec.desc));
      });
      const rotulo = aba === 'config' ? 'tópicos de instalação/config'
        : (aba === 'comandos' ? 'comandos de console'
          : (aba === 'campanhas' ? 'tópicos de campanha'
            : (aba === 'drive' ? 'tópicos dos arquivos' : 'tópicos do jogo base')));
      contador.textContent = `${visiveis} de ${total} ${rotulo}`;
    }
    if (!visiveis) corpo.appendChild(h('div', { className: 'card a3tut-vazio u-text-muted' }, 'Nada bate com essa busca.'));
  }

  montarChips();
  render();
  return page;
}
