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
import { resolverTiro, dadosBalisticos } from '../utils/arma3-balistica.js';

const PRESET_ID = 'projeto-baluarte-vercel-app';

export function arma3TutorialPage(args = {}) {
  const page = h('div', { className: 'page-a3tut' });
  const preset = ARMA3_PRESETS.find((p) => p.id === PRESET_ID);
  const urlPorId = Object.fromEntries(preset.mods.map((m) => [m.url.match(/id=(\d+)/)[1], m.url]));

  let busca = '', catAtiva = 'all';

  /* Armas que a calculadora aceita: só as que têm um projétil balístico de
   * verdade (ver dadosBalisticos). Calculada uma vez — é o mesmo filtro do
   * seletor, do botão da tabela e do contador do cabeçalho. */
  const armasCalculaveis = A3ARM.filter((a) => dadosBalisticos(a));

  /* estado da calculadora de balística (sobrevive aos re-renders).
   * Abre num fuzil do JOGO BASE — a lista está ordenada por velocidade, e o
   * primeiro item calhava de ser um DMR de CDLC que quase ninguém reconhece. */
  let calcArmaId = (armasCalculaveis.find((a) => a.classe === 'arifle_MX_F')
    || armasCalculaveis.find((a) => a.origem === 'Base' && a.tipo === 'fuzil')
    || armasCalculaveis[0] || {}).id;
  let calcZero = 300, calcAlvo = 600, calcVento = 0;

  /* arsenal completo (mods) — só desce quando o operador pede */
  let arsenalMods = null, arsenalEstado = 'ocioso';
  /* catálogo (veículos, miras, uniformes…) — idem */
  let catalogoMods = null, catalogoEstado = 'ocioso';
  const abaInicial = (args.query || {}).aba;
  const ABAS = ['vanilla', 'armas', 'catalogo', 'colecao', 'config', 'mods',
    'comandos', 'campanhas', 'drive'];
  let aba = ABAS.includes(abaInicial) ? abaInicial : 'vanilla';

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
    oninput: debounce((e) => { busca = e.target.value; render(); }, 120)
  });
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
          : (aba === 'catalogo'
            ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3CAT_CATEGORIAS]
            : [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...secs.map((s) => ({ id: s.id, nome: s.nome, icon: s.icon }))])));
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

  /* tabela de um tipo de arma (estilo Fallout, rolagem horizontal) */
  function tabelaTipo(tp, armas) {
    const th = (t, cls) => h('th', cls ? { className: cls } : null, t);
    const linha = (a) => h('tr', { className: 'a3arm-tr' },
      h('td', { className: 'a3arm-td a3arm-td--img' }, thumb(a)),
      h('td', { className: 'a3arm-td a3arm-td--nome' }, a.nome,
        a.variantes > 1
          ? h('span', { className: 'a3arm-var', title: a.nomes.join(' · ') }, `+${a.variantes - 1} variantes`)
          : null,
        a.faccao ? h('span', { className: 'a3arm-fac' }, a.faccao) : null),
      h('td', { className: 'a3arm-td' }, a.calibre || h('span', { className: 'a3arm-td__na' }, '—')),
      h('td', { className: 'a3arm-td a3arm-num-cel' }, val(a.v0, 'm/s', 1)),
      h('td', { className: 'a3arm-td a3arm-num-cel' },
        typeof a.airFriction === 'number'
          ? h('code', { className: 'a3arm-af' }, String(a.airFriction))
          : h('span', { className: 'a3arm-td__na' }, '—')),
      h('td', { className: 'a3arm-td a3arm-num-cel' }, val(a.dano, '', 1)),
      h('td', { className: 'a3arm-td a3arm-num-cel' }, val(a.rpm, '/min')),
      h('td', { className: 'a3arm-td a3arm-num-cel' }, val(a.capacidade)),
      h('td', { className: 'a3arm-td a3arm-num-cel' }, val(a.zeroing, 'm')),
      h('td', { className: 'a3arm-td' }, h('span', { className: 'a3col-tag' }, a.origem || '—')),
      h('td', { className: 'a3arm-td a3arm-td--obs' },
        a.obs || a.desc || h('span', { className: 'a3arm-td__na' }, '—')),
      h('td', { className: 'a3arm-td' }, dadosBalisticos(a)
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
        }, '—')));
    const tabela = h('table', { className: 'a3arm-tabela' },
      h('thead', null, h('tr', null,
        th('', 'a3arm-th--img'), th('Arma'), th('Calibre'), th('v₀'), th('airFriction'),
        th('Dano'), th('Cadência'), th('Carreg.'), th('Zeroing'), th('Origem'),
        th('Descrição'), th('Balística'))),
      h('tbody', null, ...armas.map(linha)));
    return h('div', { className: 'a3tut-secao' },
      h('div', { className: 'a3tut-secao__head' },
        h('span', { className: 'a3tut-secao__icon' }, tp.icon),
        h('h2', { className: 'a3tut-secao__titulo' }, tp.nome),
        h('span', { className: 'badge badge--cyan' }, String(armas.length))),
      h('p', { className: 'a3tut-secao__desc u-text-muted' }, tp.desc),
      h('div', { className: 'a3arm-tabela-wrap' }, tabela));
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
          h('b', { className: 'a3tut-card__nome' }, '⏳ Catálogo aguardando extração no jogo')),
        h('p', { className: 'a3tut-card__oque' },
          'Veículos, soldados, miras, uniformes, coletes, capacetes, mochilas e '
          + 'acessórios saem do mesmo lugar que as armas: o config do jogo ',
          h('b', null, 'em execução'),
          '. Só o operador consegue tirar — exige o Arma 3 com o preset carregado. '
          + 'Enquanto o dump não roda, esta aba fica honestamente vazia: preencher '
          + 'com número inventado seria pior que não ter.'),
        h('div', { className: 'a3tut-card__sec' },
          h('span', { className: 'a3tut-card__label' }, 'COMO PREENCHER'),
          h('ol', { className: 'a3tut-dicas' },
            h('li', null, 'No jogo: ', h('kbd', { className: 'a3tut-kbd' }, 'Esc'),
              ' → DEBUG CONSOLE → colar ', h('code', null, 'scripts/arma3/dump-catalogo.sqf'),
              ' → EXECUTE'),
            h('li', null, h('code', null, 'python scripts/arma3/parse-catalogo.py')),
            h('li', null, h('code', null, 'python scripts/arma3/extrair-imagens.py'),
              ' (ícones dos itens novos)'),
            h('li', null, h('code', null, 'python scripts/arma3/gerar-catalogo.py')))),
        h('p', { className: 'a3arm-proc__nota u-text-muted' },
          'As ', h('b', null, `${A3CAT_CATEGORIAS.length} categorias`),
          ' já estão definidas com as colunas de cada uma — a tabela liga sozinha '
          + 'quando o dado chegar.'));
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
