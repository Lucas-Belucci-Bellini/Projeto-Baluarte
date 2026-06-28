/**
 * Centro Militar — hub que CONSOLIDA as ~13 frentes militares + Arsenal numa
 * página só, estilo Wikipédia (índice de conteúdo + seções). #246 / consolidação.
 *
 * Cada seção tem: título + link pra página completa (conteúdo rico já existente)
 * + um EXTRATO VIVO da Wikipédia (via REST API, sob demanda quando entra na
 * viewport), com atribuição CC BY-SA. Web leve: só fetch + DOM, sem dependência.
 * Os dados são carregados best-effort — se a Wikipédia não responder, a seção
 * mostra a descrição + link pro artigo (zero erro).
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { lineIcon } from '../utils/icons.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { fetchWikiSummary, wikiArticleUrl } from '../utils/wikipedia.js';
import '../styles/centro-militar.css';

/* Frentes militares → página existente (conteúdo completo) + artigo da Wikipédia. */
const TOPICS = [
  { id: 'enciclopedia', label: 'Enciclopédia Militar', icon: 'book', route: '/enciclopedia-militar', wiki: 'Militar', desc: 'Visão geral: o que é uma força armada, seus ramos, organização e papel na sociedade.' },
  { id: 'forcas-armadas', label: 'Forças Armadas do Mundo', icon: 'globe', route: '/forcas-armadas', wiki: 'Forças armadas', desc: 'Exércitos, marinhas e forças aéreas dos países do mundo.' },
  { id: 'orcamentos', label: 'Orçamentos Militares', icon: 'bars', route: '/orcamentos-militares', wiki: 'Despesa militar', desc: 'Quanto cada país gasta em defesa — em % do PIB e em valores.' },
  { id: 'poder', label: 'Rankings de Poder', icon: 'award', route: '/poder-militar', wiki: 'Potência militar', desc: 'Comparação do poder militar entre as nações.' },
  { id: 'arsenal-exp', label: 'Arsenal Expandido', icon: 'swords', route: '/arsenal-expandido', wiki: 'Armamento', desc: 'Catálogo ampliado de armamentos e equipamentos.' },
  { id: 'especiais', label: 'Forças Especiais', icon: 'helmet', route: '/forcas-especiais', wiki: 'Forças especiais', desc: 'Unidades de elite e operações especiais.' },
  { id: 'organizacao', label: 'Organização Militar', icon: 'sitemap', route: '/organizacao-militar', wiki: 'Organização militar', desc: 'Hierarquia e patentes — do esquadrão ao grupo de exércitos.' },
  { id: 'tecnologia', label: 'Tecnologia Militar', icon: 'rocket', route: '/tecnologia-militar', wiki: 'Tecnologia militar', desc: 'Sistemas de combate por domínio — do soldado conectado às armas hipersônicas.' },
  { id: 'taticas', label: 'Táticas & Estratégias', icon: 'strategy', route: '/taticas-estrategias', wiki: 'Tática militar', desc: 'Da tática no campo de batalha à grande estratégia.' },
  { id: 'historia', label: 'História Militar', icon: 'scroll', route: '/historia-militar', wiki: 'História militar', desc: 'A evolução da guerra e das instituições militares.' },
  { id: 'armas-pais', label: 'Armas por País', icon: 'crosshair', route: '/armas-por-pais', wiki: 'Arma', desc: 'Armamentos catalogados por país de origem.' },
  { id: 'guerras', label: 'Guerras & Conflitos', icon: 'globe', route: '/guerras-conflitos', wiki: 'Guerra', desc: 'Conflitos armados ao longo da história.' },
  { id: 'batalhas', label: 'Batalhas Históricas', icon: 'shield', route: '/batalhas-historicas', wiki: 'Batalha', desc: 'As batalhas que mudaram o curso da história.' },
  { id: 'arsenal', label: 'Arsenal', icon: 'target', route: '/arsenal', wiki: 'Arsenal', desc: 'O catálogo militar completo do Baluarte.' }
];

/** Preenche o bloco da Wikipédia (best-effort). */
function fillWiki(box, t) {
  fetchWikiSummary(t.wiki).then((d) => {
    box.replaceChildren();
    if (d.thumb) box.appendChild(h('img', { className: 'mil-wiki__thumb', src: d.thumb, alt: '', loading: 'lazy' }));
    box.appendChild(h('p', { className: 'mil-wiki__extract' }, d.extract || t.desc));
    box.appendChild(h('div', { className: 'mil-wiki__foot' },
      h('a', { className: 'mil-wiki__more', href: d.url, target: '_blank', rel: 'noopener' }, 'Ler na Wikipédia →'),
      h('span', { className: 'mil-wiki__lic' }, 'Fonte: Wikipédia · CC BY-SA')));
  }).catch(() => {
    box.replaceChildren(
      h('a', { className: 'mil-wiki__more', href: wikiArticleUrl(t.wiki), target: '_blank', rel: 'noopener' },
        `Ler "${t.wiki}" na Wikipédia →`));
  });
}

/** Busca o extrato só quando a seção chega perto da viewport (web leve). */
function lazyFillWiki(sec, box, t, onCleanup) {
  if (typeof IntersectionObserver === 'undefined') { fillWiki(box, t); return; }
  let done = false;
  const io = new IntersectionObserver((entries) => {
    if (done) return;
    if (entries.some((e) => e.isIntersecting)) { done = true; io.disconnect(); fillWiki(box, t); }
  }, { rootMargin: '250px' });
  io.observe(sec);
  onCleanup(() => io.disconnect());
}

export function militarPage() {
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  const page = h('div', { className: 'page-militar' });

  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · CENTRO MILITAR',
    title: 'Centro Militar',
    sub: 'TUDO NUM LUGAR SÓ',
    desc: `${TOPICS.length} frentes militares reunidas — cada uma com extrato vivo da Wikipédia e link pra página completa.`,
    variant: 'scope',
    hudLeft: `🎖 ${TOPICS.length} FRENTES`, hudRight: 'ENCICLOPÉDIA'
  }));

  /* índice de conteúdo (estilo Wikipédia) — botões que rolam até a seção
     (não usar href="#..." por causa do hash routing). */
  const toc = h('aside', { className: 'mil-toc' },
    h('div', { className: 'mil-toc__title' }, 'Conteúdo'),
    h('nav', { className: 'mil-toc__list' },
      ...TOPICS.map((t) => h('button', {
        className: 'mil-toc__item',
        onclick: () => document.getElementById('sec-' + t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, h('span', { className: 'mil-toc__ico', html: lineIcon(t.icon) }),
         h('span', null, t.label)))));

  const sections = h('div', { className: 'mil-sections' });
  for (const t of TOPICS) {
    const wikiBox = h('div', { className: 'mil-wiki' },
      h('span', { className: 'mil-wiki__loading' }, 'Carregando da Wikipédia…'));
    const sec = h('section', { id: 'sec-' + t.id, className: 'mil-section' },
      h('div', { className: 'mil-section__head' },
        h('span', { className: 'mil-section__ico', html: lineIcon(t.icon) }),
        h('h2', { className: 'mil-section__title' }, t.label),
        h('button', { className: 'mil-section__open', onclick: () => router.navigate(t.route) }, 'abrir página completa →')),
      h('p', { className: 'mil-section__desc' }, t.desc),
      wikiBox);
    sections.appendChild(sec);
    lazyFillWiki(sec, wikiBox, t, onCleanup);
  }

  page.appendChild(h('div', { className: 'mil-layout' }, toc, sections));
  page.appendChild(h('p', { className: 'mil-credit' },
    'Extratos de texto da ',
    h('a', { href: 'https://pt.wikipedia.org', target: '_blank', rel: 'noopener' }, 'Wikipédia'),
    ' sob licença ',
    h('a', { href: 'https://creativecommons.org/licenses/by-sa/4.0/', target: '_blank', rel: 'noopener' }, 'CC BY-SA 4.0'),
    ' — as páginas completas de cada frente seguem no Baluarte.'));

  /* auto-limpeza dos observers ao sair da rota */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
