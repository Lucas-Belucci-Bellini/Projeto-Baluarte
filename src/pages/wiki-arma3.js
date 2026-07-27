/**
 * Página /wiki-arma3 — a Wiki de Arma 3 do Baluarte.
 *
 * Três vistas, escolhidas pela query (deep-link de verdade, com botão voltar):
 *   #/wiki-arma3              → CAPA: portais, trilha por nível, busca grande
 *   #/wiki-arma3?p=<portal>   → ÍNDICE: grade OU tabela ordenável, com filtros
 *   #/wiki-arma3?a=<id>       → ARTIGO: infobox + corpo + atalhos + veja também
 * Aceita ainda ?q=<busca> e ?n=<nível>, então qualquer estado é linkável.
 *
 * O conteúdo NÃO mora aqui: vem do índice unificado em data/wiki-arma3.js, que
 * lê os data files de Arma 3 já existentes. Pra escrever conteúdo novo, edite a
 * fonte (arma3-vanilla, arma3-tutoriais, …) — a wiki reflete sozinha.
 */

import '../styles/wiki-arma3.css';
import { h, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import {
  WIKI_ARTIGOS, WIKI_POR_ID, WIKI_TOTAL, WIKI_PORTAIS, WIKI_NIVEIS,
  WIKI_CONTAGEM, A3COL_INFO, buscar, relacionados, catsDoPortal
} from '../data/wiki-arma3.js';

const portalPorId = Object.fromEntries(WIKI_PORTAIS.map((p) => [p.id, p]));

/* Monta a URL de um estado da wiki — tudo navega por link, nada por estado oculto. */
function url({ p = '', a = '', q = '', n = 0, v = '' } = {}) {
  const qs = new URLSearchParams();
  if (a) qs.set('a', a);
  if (p) qs.set('p', p);
  if (q) qs.set('q', q);
  if (n) qs.set('n', String(n));
  if (v) qs.set('v', v);
  const s = qs.toString();
  return '/wiki-arma3' + (s ? '?' + s : '');
}
const ir = (estado) => router.navigate(url(estado));

/* ==============================================================
 *  Peças reutilizadas
 * ============================================================== */

/* Miniatura com fallback: item sem capa mostra o ícone da categoria. */
function capa(art, classe) {
  if (art.img) {
    return h('img', {
      className: classe, src: art.img, alt: art.titulo, loading: 'lazy', decoding: 'async'
    });
  }
  return h('div', { className: classe + ' wk-capa--vazia' }, h('span', null, art.icon || '📄'));
}

const selo = (art) => h('span', { className: `wk-selo wk-selo--n${art.nivel}` },
  WIKI_NIVEIS[art.nivel - 1].icon + ' ' + WIKI_NIVEIS[art.nivel - 1].nome);

/* Card do índice em modo grade. */
function cardArtigo(art) {
  return h('a', {
    className: 'card wk-card', href: '#' + url({ a: art.id }),
    onclick: (e) => { e.preventDefault(); ir({ a: art.id }); }
  },
    capa(art, 'wk-card__capa'),
    h('div', { className: 'wk-card__corpo' },
      h('div', { className: 'wk-card__meta' },
        h('span', { className: 'wk-card__cat' }, `${art.icon || '📄'} ${art.catNome}`),
        selo(art)),
      h('b', { className: 'wk-card__titulo' }, art.titulo),
      h('p', { className: 'wk-card__resumo' }, (art.resumo || '').slice(0, 180)),
      h('div', { className: 'wk-card__tags' },
        art.noPreset ? h('span', { className: 'wk-tag wk-tag--on' }, '✔ no preset') : null,
        art.temTutorial ? h('span', { className: 'wk-tag' }, '📖 explicado') : null,
        art.deps.length ? h('span', { className: 'wk-tag' }, '⚙ requer ' + art.deps[0]) : null)));
}

/* ==============================================================
 *  VISTA 1 — capa da wiki
 * ============================================================== */
function vistaCapa(page) {
  page.appendChild(h('div', { className: 'wk-hero anim-fade-in' },
    h('span', { className: 'wk-hero__olho' }, 'BALUARTE · ENCICLOPÉDIA'),
    h('h1', { className: 'wk-hero__titulo' }, 'Wiki de Arma 3'),
    h('p', { className: 'wk-hero__sub' },
      'Tudo sobre o jogo e sobre a coleção oficial do Baluarte, num lugar só: ',
      h('b', null, `${WIKI_TOTAL} artigos`),
      ' com imagem, teclas e dependências. Do primeiro tiro ao script no console.'),
    buscaGrande()));

  /* trilhas: o corte iniciante ↔ veterano */
  page.appendChild(h('div', { className: 'wk-secao__head' },
    h('h2', { className: 'wk-secao__titulo' }, 'Por onde você está?'),
    h('span', { className: 'wk-secao__linha' })));
  page.appendChild(h('div', { className: 'wk-trilhas' },
    ...WIKI_NIVEIS.map((nv) => h('a', {
      className: `card wk-trilha wk-trilha--n${nv.id}`, href: '#' + url({ p: 'tudo', n: nv.id }),
      onclick: (e) => { e.preventDefault(); ir({ p: 'tudo', n: nv.id }); }
    },
      h('span', { className: 'wk-trilha__icon' }, nv.icon),
      h('b', { className: 'wk-trilha__nome' }, nv.nome),
      h('p', { className: 'wk-trilha__desc' }, nv.desc),
      h('span', { className: 'wk-trilha__qtd' },
        `${WIKI_ARTIGOS.filter((a) => a.nivel === nv.id).length} artigos →`)))));

  /* ── o acervo medido no jogo ──
   *
   * O placar do que a extração já tirou do config, com a divisão honesta:
   * "navegável" é o que virou tabela/artigo aqui; "cru no repositório" é o
   * que já foi medido mas ainda não tem gerador. Os números do cru vêm do
   * dump de 26–27/07/2026 (scripts/arma3/out/) e mudam quando ele rodar de
   * novo — por isso a frase diz DE ONDE saíram, e não finge tempo real. */
  page.appendChild(h('div', { className: 'card wk-colecao' },
    h('div', null,
      h('b', null, '🧬 Medido direto do jogo em execução'),
      h('p', { className: 'u-text-muted' },
        'Navegável nesta wiki: ', h('b', null, '10.822 armas'),
        ' (106 artigos do núcleo + arsenal completo na tabela), ',
        h('b', null, '211 miras e acessórios'), ', ',
        h('b', null, '31 terrenos com a grade real'), ', ',
        h('b', null, '1.432 carregadores'), ' e ', h('b', null, '472 munições'),
        '. Já medido e aguardando gerador (cru em scripts/arma3/out/): ',
        h('b', null, '67.368 itens de inventário'),
        ' (40.720 uniformes, 12.829 capacetes, 9.875 coletes), ',
        h('b', null, '24.261 registros de veículo'), ' com blindagem por hitpoint, ',
        h('b', null, '44.761 soldados'), ' de 248 facções e ',
        h('b', null, '12.716 animações'), ' (8.705 estados + 4.011 gestos) — '
        + 'dump de 26–27/07/2026.')),
    h('div', { className: 'wk-colecao__acoes' },
      h('a', { className: 'btn', href: '#/arma3-tutorial?aba=armas' }, '🔫 Tabela de armas'),
      h('a', { className: 'btn', href: '#/vanguard' }, '⌖ Computador de tiro'))));

  /* portais */
  page.appendChild(h('div', { className: 'wk-secao__head' },
    h('h2', { className: 'wk-secao__titulo' }, 'Portais'),
    h('span', { className: 'wk-secao__linha' })));
  page.appendChild(h('div', { className: 'wk-portais' },
    ...WIKI_PORTAIS.map((p) => h('a', {
      className: `card wk-portal wk-portal--${p.cor}`, href: '#' + url({ p: p.id }),
      onclick: (e) => { e.preventDefault(); ir({ p: p.id }); }
    },
      h('span', { className: 'wk-portal__icon' }, p.icon),
      h('div', null,
        h('b', { className: 'wk-portal__nome' }, p.nome),
        h('p', { className: 'wk-portal__desc' }, p.desc)),
      h('span', { className: 'badge badge--cyan wk-portal__qtd' }, String(WIKI_CONTAGEM[p.id] || 0))))));

  /* faixa da coleção + atalhos úteis */
  page.appendChild(h('div', { className: 'card wk-colecao' },
    h('div', null,
      h('b', null, `📦 Coleção "${A3COL_INFO.nome}"`),
      h('p', { className: 'u-text-muted' },
        'Assine a coleção na Steam e o Launcher baixa tudo sozinho. Cada item está catalogado aqui, com capa e resumo.')),
    h('div', { className: 'wk-colecao__acoes' },
      h('a', { className: 'btn btn--primary', href: A3COL_INFO.url, target: '_blank', rel: 'noopener noreferrer' },
        'Assinar na Steam ↗'),
      h('a', {
        className: 'btn', href: '#' + url({ p: 'colecao' }),
        onclick: (e) => { e.preventDefault(); ir({ p: 'colecao' }); }
      }, 'Ver os itens'),
      h('a', { className: 'btn', href: '#/arma3-tutorial' }, 'Modo tutorial (abas)'))));
}

/* Campo de busca da capa: manda pro índice global já filtrando. */
function buscaGrande() {
  const input = h('input', {
    className: 'input wk-busca__campo', type: 'search',
    placeholder: 'Buscar na wiki… (ex.: rapel, ACE médico, zeroing, spawnar helicóptero)',
    onkeydown: (e) => { if (e.key === 'Enter' && input.value.trim()) ir({ p: 'tudo', q: input.value.trim() }); }
  });
  return h('div', { className: 'wk-busca' }, input,
    h('button', {
      className: 'btn btn--primary',
      onclick: () => ir({ p: 'tudo', q: input.value.trim() })
    }, '⌕ Buscar'));
}

/* ==============================================================
 *  VISTA 2 — índice (grade ou tabela)
 * ============================================================== */
function vistaIndice(page, { p, q, n, v }) {
  const portalAtivo = p === 'tudo' ? '' : p;
  const info = portalPorId[portalAtivo];
  let termo = q || '';
  let cat = '';
  let nivel = Number(n) || 0;
  let modo = v === 'tabela' ? 'tabela' : 'grade';
  let ordem = { col: 'titulo', asc: true };

  page.appendChild(migalhas([
    ['Wiki de Arma 3', url({})],
    [info ? info.nome : 'Todos os artigos', null]
  ]));

  page.appendChild(h('div', { className: 'page-header' },
    h('h1', { className: 'page-header__title' },
      info ? `${info.icon} ${info.nome}` : '⬡ Todos os artigos'),
    h('p', { className: 'page-header__description' },
      info ? info.desc : 'A wiki inteira em uma lista só — filtre por categoria e nível, ou use a busca.')));

  /* --- barra de controle --- */
  const campo = h('input', {
    className: 'input wk-filtro__busca', type: 'search', value: termo,
    placeholder: 'Buscar nesta seção…',
    oninput: debounce((e) => { termo = e.target.value; pintar(); }, 120)
  });
  const btnModo = h('button', {
    className: 'btn wk-filtro__modo',
    onclick: () => {
      modo = modo === 'grade' ? 'tabela' : 'grade';
      btnModo.textContent = modo === 'grade' ? '▦ Grade' : '▤ Tabela';
      pintar();
    }
  }, modo === 'grade' ? '▦ Grade' : '▤ Tabela');

  const chipsNivel = h('div', { className: 'wk-chips' },
    ...[{ id: 0, nome: 'Todos os níveis', icon: '⬡' }, ...WIKI_NIVEIS].map((nv) =>
      h('button', {
        className: 'wk-chip' + (nivel === nv.id ? ' is-active' : ''), dataset: { nivel: String(nv.id) },
        onclick: () => {
          nivel = nv.id;
          chipsNivel.querySelectorAll('.wk-chip').forEach((b) =>
            b.classList.toggle('is-active', Number(b.dataset.nivel) === nivel));
          pintar();
        }
      }, `${nv.icon} ${nv.nome}`)));

  /* Chips de categoria. A contagem de cada um acompanha a busca/nível ativos —
   * senão o chip promete "67" e entrega 2. Chip que zeraria some da barra. */
  const cats = catsDoPortal(portalAtivo);
  const qtdEls = new Map();
  const chipEls = new Map();
  const chipsCat = h('div', { className: 'wk-chips' },
    ...[{ id: '', nome: 'Tudo', icon: '⬡' }, ...cats].map((c) => {
      const qtdEl = h('span', { className: 'wk-chip__qtd' });
      const btn = h('button', {
        className: 'wk-chip' + (cat === c.id ? ' is-active' : ''), dataset: { cat: c.id },
        onclick: () => {
          cat = c.id;
          chipsCat.querySelectorAll('.wk-chip').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.cat === cat));
          pintar();
        }
      }, `${c.icon || '📄'} ${c.nome}`, qtdEl);
      qtdEls.set(c.id, qtdEl);
      chipEls.set(c.id, btn);
      return btn;
    }));

  /* Recalcula os números dos chips ignorando o filtro de categoria (é o que o
   * usuário veria ao clicar em cada um), mas respeitando busca + nível. */
  function atualizarChips() {
    const base = buscar(termo, { portal: portalAtivo, nivel });
    qtdEls.forEach((el, id) => {
      const qtd = id ? base.filter((a) => a.cat === id).length : base.length;
      el.textContent = String(qtd);
      /* o chip ativo nunca some, senão o usuário perde o botão de voltar atrás */
      chipEls.get(id).hidden = qtd === 0 && id !== cat;
    });
  }

  page.append(h('div', { className: 'wk-filtro' }, campo, btnModo), chipsCat, chipsNivel);

  const contador = h('p', { className: 'wk-contador u-text-muted' });
  const alvo = h('div', null);
  page.append(contador, alvo);

  /* --- tabela ordenável (o formato "ver coisa complexa rápido") --- */
  const COLUNAS = [
    { id: 'titulo', rotulo: 'Artigo' },
    { id: 'catNome', rotulo: 'Categoria' },
    { id: 'nivel', rotulo: 'Nível' },
    { id: 'autor', rotulo: 'Autor' }
  ];

  function tabela(lista) {
    const ordenada = [...lista].sort((a, b) => {
      const A = a[ordem.col] ?? '', B = b[ordem.col] ?? '';
      const r = typeof A === 'number' ? A - B : String(A).localeCompare(String(B), 'pt-BR');
      return ordem.asc ? r : -r;
    });
    const cabecalho = h('tr', null,
      h('th', { className: 'wk-tab__th wk-tab__th--img' }, ''),
      ...COLUNAS.map((c) => h('th', {
        className: 'wk-tab__th' + (ordem.col === c.id ? ' is-sorted' : ''),
        onclick: () => {
          ordem = { col: c.id, asc: ordem.col === c.id ? !ordem.asc : true };
          pintar();
        }
      }, c.rotulo, h('span', { className: 'wk-tab__seta' },
        ordem.col === c.id ? (ordem.asc ? '▲' : '▼') : '⇅'))));
    return h('div', { className: 'wk-tab__wrap' },
      h('table', { className: 'wk-tab' },
        h('thead', null, cabecalho),
        h('tbody', null, ...ordenada.map((art) => h('tr', {
          className: 'wk-tab__tr',
          onclick: () => ir({ a: art.id })
        },
          h('td', { className: 'wk-tab__td' }, capa(art, 'wk-tab__img')),
          h('td', { className: 'wk-tab__td' },
            h('b', { className: 'wk-tab__nome' }, art.titulo),
            h('span', { className: 'wk-tab__resumo' }, (art.resumo || '').slice(0, 110))),
          h('td', { className: 'wk-tab__td' }, art.catNome),
          h('td', { className: 'wk-tab__td' }, selo(art)),
          h('td', { className: 'wk-tab__td u-text-muted' }, art.autor || '—'))))));
  }

  function pintar() {
    const lista = buscar(termo, { portal: portalAtivo, cat, nivel });
    atualizarChips();
    alvo.replaceChildren();
    contador.textContent = `${lista.length} de ${portalAtivo ? WIKI_CONTAGEM[portalAtivo] : WIKI_TOTAL} artigos`;
    if (!lista.length) {
      alvo.appendChild(h('div', { className: 'card wk-vazio u-text-muted' },
        'Nada encontrado. Tente outro termo ou limpe os filtros.'));
      return;
    }
    alvo.appendChild(modo === 'tabela'
      ? tabela(lista)
      : h('div', { className: 'wk-grade' }, ...lista.map(cardArtigo)));
  }

  pintar();
}

/* ==============================================================
 *  VISTA 3 — artigo
 * ============================================================== */
function vistaArtigo(page, art) {
  const info = portalPorId[art.portal];
  page.appendChild(migalhas([
    ['Wiki de Arma 3', url({})],
    [info ? info.nome : 'Artigos', url({ p: art.portal })],
    [art.titulo, null]
  ]));

  const corpo = h('div', { className: 'wk-art__texto' },
    ...(art.corpo || art.resumo || '').split('\n\n').filter(Boolean).map((par) => h('p', null, par)));

  /* atalhos de teclado em <kbd> — o que mais se consulta no meio da partida */
  const atalhos = art.atalhos && art.atalhos.length
    ? h('section', { className: 'wk-art__bloco' },
      h('h2', { className: 'wk-art__h2' }, '⌨️ Comandos & atalhos'),
      h('div', { className: 'wk-atalhos' }, ...art.atalhos.map(([tecla, acao]) =>
        h('div', { className: 'wk-atalho' },
          h('kbd', { className: 'wk-kbd' }, tecla),
          h('span', null, acao)))))
    : null;

  const dicas = art.dicas && art.dicas.length
    ? h('section', { className: 'wk-art__bloco' },
      h('h2', { className: 'wk-art__h2' }, '💡 Dicas'),
      h('ul', { className: 'wk-dicas' }, ...art.dicas.map((d) => h('li', null, d))))
    : null;

  /* bloco SQF com botão de copiar (artigos do portal Console) */
  let sqf = null;
  if (art.sqf) {
    const btn = h('button', {
      className: 'wk-sqf__copiar',
      onclick: () => {
        const ok = () => { btn.textContent = 'copiado ✓'; setTimeout(() => { btn.textContent = '⧉ copiar'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(art.sqf).then(ok).catch(() => {});
        } else ok();
      }
    }, '⧉ copiar');
    sqf = h('section', { className: 'wk-art__bloco' },
      h('h2', { className: 'wk-art__h2' }, '▸ Comando (cole no console)'),
      h('div', { className: 'wk-sqf' }, h('pre', { className: 'wk-sqf__code' }, art.sqf), btn));
  }

  /* guia original do autor (inglês, direto do Workshop) — colapsado e rotulado */
  const guia = art.guia
    ? h('details', { className: 'wk-art__guia' },
      h('summary', null, '📖 Guia original do autor (inglês, do Steam Workshop)'),
      h('pre', { className: 'wk-art__guiatxt' }, art.guia))
    : null;

  const vejaTambem = relacionados(art);
  const relEl = vejaTambem.length
    ? h('section', { className: 'wk-art__bloco' },
      h('h2', { className: 'wk-art__h2' }, '🔗 Veja também'),
      h('div', { className: 'wk-rel' }, ...vejaTambem.map((o) => h('a', {
        className: 'wk-rel__item', href: '#' + url({ a: o.id }),
        onclick: (e) => { e.preventDefault(); ir({ a: o.id }); }
      }, capa(o, 'wk-rel__img'), h('span', null, o.titulo)))))
    : null;

  page.appendChild(h('article', { className: 'wk-art anim-fade-in' },
    h('div', { className: 'wk-art__main' },
      h('h1', { className: 'wk-art__titulo' }, art.titulo),
      h('div', { className: 'wk-art__olho' },
        selo(art),
        h('span', { className: 'wk-tag' }, `${art.icon || '📄'} ${art.catNome}`),
        art.noPreset ? h('span', { className: 'wk-tag wk-tag--on' }, '✔ está no preset oficial') : null,
        art.naColecao ? h('span', { className: 'wk-tag' }, '📦 na coleção') : null),
      corpo, atalhos, sqf, dicas, guia, relEl),
    infobox(art)));
}

const ROTULO_TIPO = {
  mod: 'Mod', item: 'Item da coleção', guia: 'Guia',
  comando: 'Comando de console', campanha: 'Missão/campanha', arquivo: 'Arquivo',
  arma: 'Arma', acessorio: 'Acessório', terreno: 'Terreno'
};

/* Infobox estilo wiki: capa + ficha técnica, na lateral. */
function infobox(art) {
  const linha = (rot, val) => val
    ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, rot),
      h('span', { className: 'wk-info__val' }, val))
    : null;

  return h('aside', { className: 'card wk-info' },
    art.img ? h('img', { className: 'wk-info__capa', src: art.img, alt: art.titulo, loading: 'lazy' }) : null,
    h('div', { className: 'wk-info__head' }, art.titulo),
    linha('Tipo', ROTULO_TIPO[art.tipo] || art.tipo),
    linha('Categoria', art.catNome),
    linha('Nível', WIKI_NIVEIS[art.nivel - 1].nome),
    linha('Autor', art.autor),
    linha('Tamanho', art.tam),
    linha('ID Workshop', art.wid),
    art.deps && art.deps.length ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'Requer'),
      h('span', { className: 'wk-info__val' },
        ...art.deps.map((d) => h('span', { className: 'wk-tag' }, d)))) : null,
    art.dlcs && art.dlcs.length ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'DLC'),
      h('span', { className: 'wk-info__val' },
        ...art.dlcs.map((d) => h('span', { className: 'wk-tag wk-tag--aviso' }, d)))) : null,
    /* tags da Steam — rotuladas, senão parecem dependência logo abaixo de REQUER */
    art.tags && art.tags.length ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'Tags'),
      h('span', { className: 'wk-info__val' },
        ...art.tags.map((t) => h('span', { className: 'wk-tag' }, t)))) : null,

    /* Ficha técnica da arma. Infobox de wiki existe justamente pra isso —
     * até aqui os números medidos só apareciam diluídos na prosa do corpo. */
    ...(art.arma ? fichaArma(art.arma, linha) : []),
    ...(art.acessorio ? fichaAcessorio(art.acessorio, linha) : []),
    ...(art.terreno ? fichaTerreno(art.terreno, linha) : []),

    ...(art.links || []).map((l) => {
      /* Link interno (#/rota) NÃO abre em aba nova: `target=_blank` faz sentido
       * pro Workshop, não pra ir de uma tela do site pra outra. */
      const externo = /^https?:/i.test(l.url);
      return h('a', {
        className: 'btn wk-info__link',
        href: l.url,
        target: externo ? '_blank' : null,
        rel: externo ? 'noopener noreferrer' : null,
      }, l.rotulo + (externo ? ' ↗' : ' →'));
    }));
}

/* Linhas de ficha técnica de uma arma, na ordem em que se compara arma.
 * Só entra o que o config informou — ausente some, em vez de virar "0". */
function fichaArma(a, linha) {
  const n = (x, suf = '', casas = 0) =>
    (typeof x === 'number' ? `${x.toFixed(casas).replace(/\.0+$/, '')}${suf}` : null);
  return [
    linha('Calibre', a.calibre),
    linha('Velocidade de saída', n(a.v0, ' m/s', 1)),
    linha('Arrasto (airFriction)', typeof a.airFriction === 'number'
      ? h('code', null, String(a.airFriction)) : null),
    linha('Precisão', a.dispersaoCm100
      ? `${a.dispersaoCm100} cm a 100 m (${a.dispersaoMrad} mrad)` : null),
    linha('Dano', n(a.dano, '', 1)),
    linha('Cadência', n(a.rpm, ' tiros/min')),
    linha('Carregador', n(a.capacidade)),
    linha('Zeragem máx.', n(a.zeroing, ' m')),
    linha('Massa', n(a.massa)),
    /* Elo pra munição: ela não vira artigo (seriam 472 nomes de classe
     * técnicos afogando o índice), mas daqui dá pra chegar na tabela dela. */
    a.municao ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'Munição'),
      h('span', { className: 'wk-info__val' },
        h('a', { href: `#/arma3-tutorial?aba=municao&q=${encodeURIComponent(a.municao)}` },
          h('code', null, a.municao)))) : null,
    a.miras && a.miras.length ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'Miras'),
      h('span', { className: 'wk-info__val' },
        ...a.miras.map((m) => h('span', { className: 'wk-tag' }, m)))) : null,
    a.acessorios && a.acessorios.length ? h('div', { className: 'wk-info__linha' },
      h('span', { className: 'wk-info__rot' }, 'Acessórios'),
      h('span', { className: 'wk-info__val' },
        ...a.acessorios.map((m) => h('span', { className: 'wk-tag' }, m)))) : null,
    a.variantes > 1
      ? linha('Variantes', `${a.variantes} classes no config`)
      : null,
    linha('Classe', h('code', null, a.classe)),
  ];
}

/* Ficha de mira/acessório.
 *
 * ⚠️ A linha "Ampliação" NUNCA sai de conta. Quando o jogo não escreve
 * "Magnification: Nx", a ficha diz "não declarada" e mostra o FOV cru,
 * rotulado como FOV. Publicar 0,75/FOV como se fosse zoom medido erraria em
 * 159 das 215 ópticas que trazem os dois valores. */
function fichaAcessorio(c, linha) {
  const n = (x, suf = '', casas = 0) =>
    (typeof x === 'number' ? `${x.toFixed(casas).replace(/\.0+$/, '')}${suf}` : null);
  const fov = c.fov;
  return [
    linha('Ampliação', c.ampliacaoRotulo
      ? h('span', null, h('b', null, c.ampliacaoRotulo),
        h('span', { className: 'u-text-muted' }, ' (declarada pelo jogo)'))
      : (c.tipo === 'mira'
        ? h('span', { className: 'u-text-muted' }, 'não declarada no config')
        : null)),
    linha('Campo de visão', fov
      ? h('span', null, h('code', null, String(fov.init ?? fov.min)),
        (fov.min != null && fov.max != null && fov.min !== fov.max)
          ? h('span', { className: 'u-text-muted' }, ` · varia de ${fov.min} a ${fov.max}`)
          : null)
      : null),
    linha('Modos ópticos', fov && fov.modos > 1 ? String(fov.modos) : null),
    linha('Coef. do silenciador', n(c.coefSilenciador, '', 2)),
    linha('Massa', n(c.massa, '', 1)),
    linha('Origem', c.dlc),
    linha('Classe', h('code', null, c.classe)),
  ];
}

/* Ficha de terreno. A grade é o motivo do portal existir: sem ela o
 * computador de tiro não converte grade em metros. `passoY` negativo é o
 * normal no vanilla (northing de cima pra baixo) — a ficha diz qual é, em
 * vez de deixar o leitor supor. */
function fichaTerreno(t, linha) {
  const g = t.grade;
  return [
    linha('Tamanho', t.tamanhoM
      ? `${(t.tamanhoM / 1000).toFixed(1)} km × ${(t.tamanhoM / 1000).toFixed(1)} km`
      : h('span', { className: 'u-text-muted' }, 'não declarado no config')),
    linha('Área', t.areaKm2 ? `${t.areaKm2} km²` : null),
    linha('Localidades', t.localidades ? String(t.localidades) : null),
    linha('Pistas', t.aeroportos ? String(t.aeroportos) : null),
    linha('Célula da grade', g ? `${Math.abs(g.passoX)} m` : null),
    linha('Northing', g
      ? (g.passoY < 0 ? 'conta do norte para baixo (vanilla)' : 'conta para cima')
      : null),
    linha('Lat / Lon', typeof t.latitude === 'number'
      ? `${t.latitude}° / ${t.longitude}°` : null),
    linha('Origem', t.dlc),
    linha('Autor', t.autor),
    linha('Classe', h('code', null, t.classe)),
  ];
}

/* ==============================================================
 *  Migalhas de pão (breadcrumb) — volta em 1 clique
 * ============================================================== */
function migalhas(itens) {
  const el = h('nav', { className: 'wk-migalhas' });
  itens.forEach(([rotulo, destino], i) => {
    if (i) el.appendChild(h('span', { className: 'wk-migalhas__sep' }, '›'));
    el.appendChild(destino
      ? h('a', {
        href: '#' + destino,
        onclick: (e) => { e.preventDefault(); router.navigate(destino); }
      }, rotulo)
      : h('span', { className: 'wk-migalhas__atual' }, rotulo));
  });
  return el;
}

/* ==============================================================
 *  Entrada da rota
 * ============================================================== */
export function wikiArma3Page(args = {}) {
  const q = args.query || {};
  const page = h('div', { className: 'page-wiki' });

  if (q.a && WIKI_POR_ID[q.a]) {
    vistaArtigo(page, WIKI_POR_ID[q.a]);
  } else if (q.a) {
    /* link velho ou id errado: não devolve 404 seco — tenta achar e explica. */
    page.appendChild(migalhas([['Wiki de Arma 3', url({})], ['Artigo não encontrado', null]]));
    page.appendChild(h('div', { className: 'card wk-vazio' },
      h('b', null, 'Esse artigo não existe (ou mudou de nome).'),
      h('p', { className: 'u-text-muted' }, `Procurei por "${q.a}" e não achei. Veja se está aqui:`)));
    const chute = buscar(String(q.a).replace(/^w-/, '').replace(/-/g, ' ')).slice(0, 8);
    if (chute.length) page.appendChild(h('div', { className: 'wk-grade' }, ...chute.map(cardArtigo)));
  } else if (q.p || q.q || q.n) {
    vistaIndice(page, { p: q.p || 'tudo', q: q.q || '', n: q.n || 0, v: q.v || '' });
  } else {
    vistaCapa(page);
  }

  /* Artigo/índice novos começam do topo (o hash troca sem recarregar a página). */
  if (q.a || q.p) window.scrollTo({ top: 0, behavior: 'auto' });
  return page;
}
