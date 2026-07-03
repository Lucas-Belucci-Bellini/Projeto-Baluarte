/**
 * Modelos 3D — visualizador de modelos militares (issue #310).
 *
 * Acervo curado das coleções do Sketchfab listadas na issue (militar, armas,
 * mechas/Pacific Rim). REGRA DE OURO do operador: **crédito sempre** — cada
 * card e o player mostram autor (com link), licença e link pro Sketchfab;
 * isso protege o projeto e dá visibilidade aos criadores.
 *
 * Arquitetura (web leve, #238):
 *   - Seed commitado (`src/data/modelos-3d.json`): destaques de cada coleção
 *     (nome/autor/licença/thumb) → render instantâneo, sem rede.
 *   - "Carregar mais": pagina a coleção AO VIVO pela API pública do Sketchfab
 *     (CORS ok), deduplicando por uid.
 *   - O 3D em si é o EMBED oficial do Sketchfab (iframe sob demanda, só ao
 *     abrir um modelo) — 100% dentro dos termos e sempre creditado.
 */

import { h } from '../utils/helpers.js';
import { lineIcon } from '../utils/icons.js';
import { attachSpotlight } from '../utils/effects.js';
import SEED from '../data/modelos-3d.json';
import '../styles/modelos-3d.css';

const GRUPOS = [
  ['todos', 'Todos'],
  ['militar', 'Militar'],
  ['armas', 'Armas'],
  ['mechas', 'Mechas & Pacific Rim']
];

const colByUid = Object.fromEntries(SEED.colecoes.map((c) => [c.uid, c]));

const embedUrl = (uid) =>
  `https://sketchfab.com/models/${uid}/embed?utm_source=website&utm_medium=embed&utm_campaign=share-popup&autostart=1`;

export function modelos3dPage() {
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  /* estado (por visita — o seed já dá o primeiro paint) */
  let modelos = SEED.modelos.slice();
  const seen = new Set(modelos.map((m) => m.uid));
  const cursors = {};                    // uid da coleção → URL da próxima página
  let grupo = 'todos', colecao = '', busca = '';

  const page = h('div', { className: 'page-m3d' });

  /* ----- intro + aviso de créditos ----- */
  page.appendChild(h('div', { className: 'card m3d-intro' },
    h('div', { className: 'm3d-intro__ico', html: lineIcon('cube') }),
    h('div', null,
      h('p', { className: 'm3d-intro__lead' },
        'Acervo 3D militar — armas, veículos, mechas e dioramas das coleções curadas na ',
        h('a', { href: 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/310', target: '_blank', rel: 'noopener noreferrer' }, 'issue #310'),
        '. Clique num modelo pra girar em 3D no player oficial do Sketchfab.'),
      h('p', { className: 'm3d-intro__credit' },
        '✦ Todos os modelos pertencem aos seus criadores. Cada card e o player mostram o ',
        h('b', null, 'autor, a licença e o link original'),
        ' — crédito sempre, do jeito que tem que ser.'))));

  /* ----- toolbar: busca + grupos + coleção ----- */
  const buscaInput = h('input', {
    className: 'input m3d-busca', type: 'search',
    placeholder: 'Buscar por nome ou autor… (ex.: AK, tank, jaeger)',
    oninput: (e) => { busca = e.target.value.trim().toLowerCase(); renderGrid(); }
  });
  const chips = GRUPOS.map(([id, label]) => h('button', {
    className: 'm3d-chip' + (id === grupo ? ' is-active' : ''), 'data-grupo': id,
    onclick: () => {
      grupo = id; colecao = ''; colSel.value = '';
      toolbar.querySelectorAll('.m3d-chip').forEach((b) => b.classList.toggle('is-active', b.dataset.grupo === id));
      renderGrid();
    }
  }, label));
  const colSel = h('select', {
    className: 'input m3d-colsel',
    onchange: (e) => { colecao = e.target.value; renderGrid(); }
  },
    h('option', { value: '' }, 'Todas as coleções'),
    ...SEED.colecoes.map((c) => h('option', { value: c.uid }, `${c.title} — ${c.author} (${c.count}${c.count >= 480 ? '+' : ''})`)));
  const toolbar = h('div', { className: 'm3d-toolbar' }, buscaInput, h('div', { className: 'm3d-chips' }, ...chips), colSel);
  page.appendChild(toolbar);

  /* ----- grid ----- */
  const status = h('div', { className: 'm3d-status' });
  const grid = h('div', { className: 'm3d-grid' });
  const maisBtn = h('button', { className: 'btn btn--primary m3d-mais', onclick: () => carregarMais() }, 'Carregar mais desta coleção');
  const maisWrap = h('div', { className: 'm3d-mais-wrap' }, maisBtn);
  page.append(status, grid, maisWrap);

  function visiveis() {
    return modelos.filter((m) => {
      if (colecao && !m.cols.includes(colecao)) return false;
      if (!colecao && grupo !== 'todos' && !m.cols.some((c) => (colByUid[c] || {}).grupo === grupo)) return false;
      if (busca && !(`${m.name} ${m.author}`.toLowerCase().includes(busca))) return false;
      return true;
    });
  }

  function card(m) {
    const col = colByUid[m.cols[0]] || {};
    const el = h('div', { className: 'm3d-card', onclick: () => abrirViewer(m) },
      h('div', { className: 'm3d-card__thumb' },
        m.thumb ? h('img', { src: m.thumb, alt: m.name, loading: 'lazy' }) : h('div', { className: 'm3d-card__nothumb' }, '⬡'),
        m.anim ? h('span', { className: 'm3d-card__anim', title: 'Tem animação' }, '▶ animado') : null,
        h('span', { className: 'm3d-card__play' }, 'ver em 3D')),
      h('div', { className: 'm3d-card__body' },
        h('div', { className: 'm3d-card__name', title: m.name }, m.name),
        h('div', { className: 'm3d-card__by' }, 'por ',
          h('a', {
            href: m.authorUrl || '#', target: '_blank', rel: 'noopener noreferrer',
            onclick: (e) => e.stopPropagation()
          }, m.author)),
        h('div', { className: 'm3d-card__meta' },
          h('span', { className: 'm3d-card__lic' }, m.license || 'ver licença'),
          h('span', { className: 'm3d-card__col' }, col.title || ''))));
    attachSpotlight(el);
    return el;
  }

  function renderGrid() {
    const list = visiveis();
    grid.replaceChildren(...list.map(card));
    status.textContent = colecao
      ? `${list.length} modelo(s) carregado(s) de "${(colByUid[colecao] || {}).title}" — o acervo completo tem ${(colByUid[colecao] || {}).count}${(colByUid[colecao] || {}).count >= 480 ? '+' : ''}.`
      : `${list.length} modelo(s) — destaques do acervo. Escolha uma coleção pra carregar tudo.`;
    maisWrap.style.display = colecao ? '' : 'none';
  }

  /* ----- paginação ao vivo (API pública, CORS ok) ----- */
  async function carregarMais() {
    if (!colecao) return;
    maisBtn.disabled = true; maisBtn.textContent = 'Carregando…';
    try {
      const url = cursors[colecao]
        || `https://api.sketchfab.com/v3/collections/${colecao}/models?count=24`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      let novos = 0;
      for (const m of data.results || []) {
        if (!m.uid) continue;
        if (seen.has(m.uid)) {
          const ex = modelos.find((x) => x.uid === m.uid);
          if (ex && !ex.cols.includes(colecao)) ex.cols.push(colecao);
          continue;
        }
        seen.add(m.uid);
        const u = m.user || {}, lic = m.license || {}, ims = (m.thumbnails || {}).images || [];
        let thumb = null, bd = 1e9;
        for (const im of ims) { const d = Math.abs((+im.width || 0) - 512); if (d < bd) { bd = d; thumb = im.url; } }
        modelos.push({
          uid: m.uid, name: m.name || 'Sem nome',
          url: m.viewerUrl || `https://sketchfab.com/3d-models/${m.uid}`,
          author: u.displayName || u.username || 'desconhecido', authorUrl: u.profileUrl || '',
          license: lic.label || '', thumb,
          anim: (m.animationCount || 0) > 0 ? 1 : 0, cols: [colecao]
        });
        novos++;
      }
      cursors[colecao] = data.next || null;
      maisBtn.textContent = cursors[colecao]
        ? 'Carregar mais desta coleção'
        : 'Coleção completa carregada ✦';
      maisBtn.disabled = !cursors[colecao];
      if (novos) renderGrid();
    } catch {
      maisBtn.textContent = 'Sem rede agora — tente de novo';
      maisBtn.disabled = false;
    }
  }

  /* ----- viewer (modal com embed oficial + crédito completo) ----- */
  function abrirViewer(m) {
    const iframe = h('iframe', {
      className: 'm3d-viewer__frame', src: embedUrl(m.uid), title: m.name,
      allow: 'autoplay; fullscreen; xr-spatial-tracking', allowfullscreen: 'true',
      loading: 'eager', frameborder: '0'
    });
    const modal = h('div', { className: 'm3d-viewer', onclick: (e) => { if (e.target === modal) fechar(); } },
      h('div', { className: 'm3d-viewer__box' },
        h('button', { className: 'm3d-viewer__close', onclick: () => fechar(), 'aria-label': 'Fechar' }, '✕'),
        iframe,
        h('div', { className: 'm3d-viewer__credit' },
          h('a', { href: m.url, target: '_blank', rel: 'noopener noreferrer', className: 'm3d-viewer__name' }, m.name),
          h('span', null, ' por '),
          h('a', { href: m.authorUrl || '#', target: '_blank', rel: 'noopener noreferrer' }, m.author),
          h('span', null, ' no '),
          h('a', { href: 'https://sketchfab.com?utm_source=website&utm_medium=embed&utm_campaign=share-popup', target: '_blank', rel: 'noopener noreferrer' }, 'Sketchfab'),
          m.license ? h('span', { className: 'm3d-viewer__lic' }, ` · Licença: ${m.license}`) : null)));
    const onKey = (e) => { if (e.key === 'Escape') fechar(); };
    function fechar() { document.removeEventListener('keydown', onKey); modal.remove(); }
    document.addEventListener('keydown', onKey);
    onCleanup(() => { document.removeEventListener('keydown', onKey); });
    page.appendChild(modal);
  }

  /* ----- crédito global (rodapé) ----- */
  page.appendChild(h('p', { className: 'm3d-footer' },
    'Coleções: ',
    ...SEED.colecoes.flatMap((c, i) => [
      i ? ' · ' : '',
      h('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer' }, c.title),
      ` (${c.author})`
    ]),
    ' — todos os modelos © seus autores, exibidos via player oficial do Sketchfab.'));

  renderGrid();

  /* auto-limpeza ao sair da rota */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch { /* ok */ } }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
