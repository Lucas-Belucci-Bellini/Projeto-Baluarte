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
import { GALERIA_3D } from '../data/galeria-3d.js';
import '../styles/modelos-3d.css';
import { sondarWebGL } from '../utils/webgl-probe.js';

const GRUPOS = [
  ['todos', 'Todos'],
  ['militar', 'Militar'],
  ['armas', 'Armas'],
  ['mechas', 'Mechas & Pacific Rim']
];

const colByUid = Object.fromEntries(SEED.colecoes.map((c) => [c.uid, c]));

const embedUrl = (uid) =>
  `https://sketchfab.com/models/${uid}/embed?utm_source=website&utm_medium=embed&utm_campaign=share-popup&autostart=1`;

export function modelos3dPage(args = {}) {
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  /* estado (por visita — o seed já dá o primeiro paint) */
  let modelos = SEED.modelos.slice();
  const seen = new Set(modelos.map((m) => m.uid));
  const cursors = {};                    // uid da coleção → URL da próxima página
  let grupo = 'todos', colecao = '', busca = '';

  const page = h('div', { className: 'page-m3d' });

  /* Cabeçalho de página. Faltava: esta era a única das 97 telas sem `h1`
   * nenhum — quem navega por títulos (leitor de tela, modo leitura) caía numa
   * página sem começo declarado, e o site perdia a hierarquia de documento que
   * todas as outras seguem. */
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'ACERVO'), h('span', null, '›'),
        h('span', null, 'MODELOS 3D')),
      h('h1', { className: 'page-header__title' }, '◈ Modelos 3D'),
      h('p', { className: 'page-header__description' },
        'Acervo 3D militar renderizado ',
        h('span', { className: 'u-text-cyan' }, 'no próprio site'),
        ' (three.js), com visualizador universal para abrir os seus arquivos.')));

  /* ----- intro + aviso de créditos ----- */
  page.appendChild(h('div', { className: 'card m3d-intro' },
    h('div', { className: 'm3d-intro__ico', html: lineIcon('cube') }),
    h('div', null,
      h('p', { className: 'm3d-intro__lead' },
        'Acervo 3D militar — armas, veículos, mechas e dioramas. A ',
        h('b', null, 'Galeria 3D'), ' abaixo renderiza os modelos ',
        h('b', null, 'aqui no site'), ' (motor three.js — clicar e ver, sem depender de nada externo). '),
      h('p', { className: 'm3d-intro__credit' },
        '✦ Todos os modelos pertencem aos seus criadores — autor, licença e link sempre à mostra. ',
        'Modelos do Arma 3 NÃO entram (conteúdo protegido da Bohemia); use o ',
        h('b', null, 'Visualizador universal'), ' pra abrir os seus localmente.'))));

  /* ===== Galeria 3D — modelos LIVRES que abrem no visor real (0.7.2) =====
   * A correção do "não funciona": o acervo Sketchfab depende de iframe embed
   * (cookies de terceiros → tela preta em muita máquina). Aqui os modelos são
   * hospedados no próprio site e renderizam no three.js que já funciona. */
  const galeriaGrid = h('div', { className: 'm3d-galeria-grid' });
  GALERIA_3D.forEach((g) => {
    galeriaGrid.appendChild(
      h('div', { className: 'm3d-gal-card', onclick: () => abrirVisorUniversal({ url: g.arquivo, nome: g.nome }) },
        h('div', { className: 'm3d-gal-card__thumb', 'aria-hidden': 'true' }, '⬡'),
        h('div', { className: 'm3d-gal-card__body' },
          h('div', { className: 'm3d-gal-card__head' },
            h('span', { className: 'm3d-gal-card__nome' }, g.nome),
            h('span', { className: 'badge badge--cyan' }, g.tag)),
          h('p', { className: 'm3d-gal-card__desc u-text-muted' }, g.desc),
          h('div', { className: 'm3d-gal-card__meta u-text-muted' },
            `por ${g.autor} · `,
            h('a', { href: g.fonte, target: '_blank', rel: 'noopener noreferrer', onclick: (e) => e.stopPropagation() }, g.licenca)),
          h('button', { className: 'btn btn--primary m3d-gal-card__btn' }, '▶ Ver em 3D'))));
  });
  /* autodiagnóstico do "não vai" (0.7.2.1): se o WebGL estiver desligado na
   * máquina, avisa NA CARA — sem esperar o clique falhar. Teste barato, sem
   * puxar o chunk do three.js. */
  const semWebGL = !sondarWebGL().ok;
  /* Diagnóstico do "não abre" (0.7.6): botão que roda a cadeia inteira do 3D
   * NA MÁQUINA do operador e mostra onde quebra, com copiar. Substitui o
   * chute remoto por dado real. */
  const diagSaida = h('div', { className: 'm3d-diag', style: 'display:none' });
  const diagBtn = h('button', { className: 'btn m3d-diag-btn', onclick: async () => {
    diagBtn.disabled = true; diagBtn.textContent = '🩺 Diagnosticando…';
    diagSaida.style.display = ''; diagSaida.replaceChildren(h('div', { className: 'u-text-muted' }, 'Rodando os testes na sua máquina…'));
    try {
      const { rodarDiagnostico3D } = await import('../utils/diag-3d.js');
      const r = await rodarDiagnostico3D();
      const linhas = r.etapas.map((e) => h('div', { className: 'm3d-diag__linha' },
        h('span', { className: 'm3d-diag__ico', style: `color:${e.ok ? 'var(--color-success)' : '#ff7a7a'}` }, e.ok ? '✓' : '✕'),
        h('span', { className: 'm3d-diag__nome' }, e.nome),
        h('span', { className: 'm3d-diag__det u-text-muted' }, e.detalhe)));
      const copiar = h('button', { className: 'btn btn--primary', onclick: () => {
        const done = () => { copiar.textContent = 'copiado ✓ — cole aqui pra mim'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(r.texto).then(done).catch(() => {});
        else { const ta = h('textarea'); ta.value = r.texto; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch { /* ok */ } ta.remove(); done(); }
      } }, '⧉ copiar laudo');
      diagSaida.replaceChildren(
        h('div', { className: 'm3d-diag__veredito' + (r.tudoOk ? ' is-ok' : ' is-fail') },
          r.tudoOk ? '✓ Todas as etapas passaram — o 3D deveria abrir. Se ainda não abre, copie o laudo e me mande.'
                   : '✕ Achei onde quebra (linha vermelha abaixo). Copie o laudo e me mande que eu conserto certeiro.'),
        ...linhas,
        h('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, copiar));
    } catch (e) {
      diagSaida.replaceChildren(h('div', { style: 'color:#ff7a7a' }, 'O próprio diagnóstico falhou: ' + String(e && e.message || e)));
    }
    diagBtn.disabled = false; diagBtn.textContent = '🩺 Testar meu 3D de novo';
  } }, '🩺 O 3D não abre? Clique pra diagnosticar');

  page.appendChild(h('div', { className: 'card m3d-galeria' },
    h('div', { className: 'm3d-uni__head' },
      h('b', null, '🧊 Galeria 3D'),
      h('span', { className: 'm3d-uni__badge' }, 'renderiza no site · clicar e ver'),
      semWebGL ? h('span', { className: 'm3d-uni__badge', style: 'color:#ff7a7a;border-color:#ff7a7a' },
        '⚠ WebGL DESATIVADO neste navegador — ative a aceleração de hardware nas configurações e recarregue') : null),
    galeriaGrid,
    h('div', { className: 'm3d-diag-wrap' }, diagBtn, diagSaida)));

  /* ----- visor UNIVERSAL (fase 2 do #310): qualquer 3D, como em qualquer
   * site — arquivo local (arrastar/escolher, inclusive .gltf multi-arquivo)
   * ou URL direta. O three.js só baixa quando abre (chunk lazy, #238). ----- */
  const EXEMPLO_URL = '/modelos-3d/capacete-sci-fi.glb';
  const fileInput = h('input', {
    type: 'file', multiple: true, style: 'display:none',
    accept: '.glb,.gltf,.stl,.obj,.fbx,.bin,.png,.jpg,.jpeg,.webp,.ktx2',
    onchange: (e) => { if (e.target.files.length) abrirVisorUniversal({ files: Array.from(e.target.files) }); e.target.value = ''; }
  });
  const dropZone = h('div', {
    className: 'm3d-drop', tabindex: '0', role: 'button',
    onclick: () => fileInput.click(),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } },
    ondragover: (e) => { e.preventDefault(); dropZone.classList.add('is-over'); },
    ondragleave: () => dropZone.classList.remove('is-over'),
    ondrop: (e) => {
      e.preventDefault(); dropZone.classList.remove('is-over');
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) abrirVisorUniversal({ files });
    }
  },
    h('span', { className: 'm3d-drop__ico', 'aria-hidden': 'true' }, '⬡'),
    h('span', null, h('b', null, 'Arraste um modelo 3D aqui'), ' ou clique pra escolher — ',
      h('span', { className: 'm3d-drop__fmt' }, '.glb · .gltf · .stl · .obj · .fbx'),
      ' (solte o .gltf junto com o .bin e as texturas que eu resolvo)'));
  const urlInput = h('input', {
    className: 'input m3d-url', type: 'url', placeholder: 'https://…/modelo.glb — colar a URL de um modelo',
    onkeydown: (e) => { if (e.key === 'Enter' && urlInput.value.trim()) abrirVisorUniversal({ url: urlInput.value.trim() }); }
  });
  page.appendChild(h('div', { className: 'card m3d-uni' },
    h('div', { className: 'm3d-uni__head' },
      h('b', null, 'Visualizador universal'),
      h('span', { className: 'm3d-uni__badge' }, 'qualquer 3D, direto no site')),
    dropZone, fileInput,
    h('div', { className: 'm3d-uni__urlrow' },
      urlInput,
      h('button', { className: 'btn btn--primary', onclick: () => { if (urlInput.value.trim()) abrirVisorUniversal({ url: urlInput.value.trim() }); } }, 'Abrir URL'),
      h('button', { className: 'btn', title: 'Capacete de teste oficial do glTF (Khronos)', onclick: () => abrirVisorUniversal({ url: EXEMPLO_URL, nome: 'DamagedHelmet.glb (exemplo Khronos)' }) }, '✦ Exemplo'))));

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
    'aria-label': 'Filtrar por coleção',
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
    /* Nexus (#348): registra a interação — a IA aprende quais modelos chamam
     * atenção. Lazy e best-effort: telemetria nunca atrapalha o viewer. */
    import('../utils/nexus.js')
      .then((nx) => nx.nexusEvent('interaction', { acao: 'ver_modelo_3d', uid: m.uid, modelo: m.name, autor: m.author }))
      .catch(() => {});
    const iframe = h('iframe', {
      className: 'm3d-viewer__frame', src: embedUrl(m.uid), title: m.name,
      allow: 'autoplay; fullscreen; xr-spatial-tracking', allowfullscreen: 'true',
      loading: 'eager', frameborder: '0'
    });
    /* deep-link compartilhável: #/modelos-3d?m=<uid> */
    const link = `${location.origin}${location.pathname}#/modelos-3d?m=${m.uid}`;
    const shareBtn = h('button', {
      className: 'm3d-viewer__share', title: 'Copiar link direto deste modelo',
      onclick: () => {
        const done = () => { shareBtn.textContent = 'link copiado ✓'; setTimeout(() => { shareBtn.textContent = '⧉ compartilhar'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done).catch(() => {});
        else done();
      }
    }, '⧉ compartilhar');
    const modal = h('div', { className: 'm3d-viewer', onclick: (e) => { if (e.target === modal) fechar(); } },
      h('div', { className: 'm3d-viewer__box' },
        h('button', { className: 'm3d-viewer__close', onclick: () => fechar(), 'aria-label': 'Fechar' }, '✕'),
        iframe,
        /* 0.7.3: o player do Sketchfab é um iframe EXTERNO — com cookies de
         * terceiros bloqueados (padrão em navegador moderno) ele vira tela
         * preta e parece que "o 3D quebrou". O aviso dá as duas saídas. */
        h('div', { className: 'm3d-viewer__hint' },
          '🖼 Player externo do Sketchfab — ficou em tela preta? Seu navegador bloqueia cookies de terceiros. ',
          h('a', { href: m.url, target: '_blank', rel: 'noopener noreferrer' }, 'Abra no Sketchfab ↗'),
          ' ou use a Galeria 3D no topo da página (renderiza aqui no site).'),
        h('div', { className: 'm3d-viewer__credit' },
          h('a', { href: m.url, target: '_blank', rel: 'noopener noreferrer', className: 'm3d-viewer__name' }, m.name),
          h('span', null, ' por '),
          h('a', { href: m.authorUrl || '#', target: '_blank', rel: 'noopener noreferrer' }, m.author),
          h('span', null, ' no '),
          h('a', { href: 'https://sketchfab.com?utm_source=website&utm_medium=embed&utm_campaign=share-popup', target: '_blank', rel: 'noopener noreferrer' }, 'Sketchfab'),
          m.license ? h('span', { className: 'm3d-viewer__lic' }, ` · Licença: ${m.license}`) : null,
          shareBtn)));
    const onKey = (e) => { if (e.key === 'Escape') fechar(); };
    function fechar() { document.removeEventListener('keydown', onKey); modal.remove(); }
    document.addEventListener('keydown', onKey);
    onCleanup(() => { document.removeEventListener('keydown', onKey); });
    page.appendChild(modal);
  }

  /* ----- visor universal: modal com three.js (chunk lazy) ----- */
  /* Sanitização (CodeQL js/xss-through-dom): tudo que veio de fora — valor do
   * input de URL, nome de arquivo solto, ?src= do deep-link — perde os
   * metacaracteres de HTML antes de virar texto na tela. Os children do h()
   * já viram textNode, mas aqui a regra é cinto E suspensório. */
  const semHtml = (s) => String(s == null ? '' : s).replace(/[<>&"'`]/g, '');
  function abrirVisorUniversal(fonte) {
    /* Só destinos legítimos (nada de javascript: etc.): http(s)/blob/data OU
     * um caminho same-origin com UMA barra (ex.: /modelos-3d/x.glb da Galeria).
     * `//host` (protocolo-relativo a outro host) e `/\` são recusados. */
    if (fonte.url) {
      const u = String(fonte.url).trim();
      const okScheme = /^(https?:|blob:|data:)/i.test(u);
      const okLocal = /^\/[^/\\]/.test(u);
      if (!okScheme && !okLocal) { bolhaErroUrl(); return; }
    }
    if (fonte.url) fonte = { ...fonte, url: String(fonte.url).trim() };
    const nome = semHtml(fonte.nome
      || (fonte.files && fonte.files.length ? (fonte.files.find((f) => /\.(glb|gltf|stl|obj|fbx)$/i.test(f.name)) || fonte.files[0]).name : '')
      || decodeURIComponent(String(fonte.url || '').split(/[?#]/)[0].split('/').pop() || 'modelo'))
      .slice(0, 120) || 'modelo';
    import('../utils/nexus.js')
      .then((nx) => nx.nexusEvent('interaction', { acao: 'ver_3d_arquivo', fonte: fonte.url ? 'url' : 'arquivo', nome }))
      .catch(() => {});

    const palco = h('div', { className: 'm3d-visor__palco' },
      h('div', { className: 'm3d-visor__loading' }, h('span', { className: 'm3d-visor__spin' }), `Carregando ${nome}…`));
    const acoes = h('div', { className: 'm3d-visor__acoes' });
    const info = h('span', { className: 'm3d-visor__info' });
    const modal = h('div', { className: 'm3d-viewer', onclick: (e) => { if (e.target === modal) fechar(); } },
      h('div', { className: 'm3d-viewer__box m3d-visor' },
        h('button', { className: 'm3d-viewer__close', onclick: () => fechar(), 'aria-label': 'Fechar' }, '✕'),
        palco,
        h('div', { className: 'm3d-viewer__credit' },
          h('span', { className: 'm3d-viewer__name' }, nome),
          info, acoes,
          h('div', { className: 'm3d-visor__dicas' }, 'girar: arrastar · zoom: roda do mouse · mover: botão direito'))));

    let visor = null;
    const onKey = (e) => { if (e.key === 'Escape') fechar(); };
    function fechar() {
      document.removeEventListener('keydown', onKey);
      if (visor) { try { visor.dispose(); } catch { /* ok */ } visor = null; }
      modal.remove();
    }
    document.addEventListener('keydown', onKey);
    onCleanup(() => { document.removeEventListener('keydown', onKey); if (visor) { try { visor.dispose(); } catch { /* ok */ } visor = null; } });
    page.appendChild(modal);

    import('../utils/visor-3d.js')
      .then((mod) => mod.montarVisor3D(palco, fonte))
      .then((v) => {
        visor = v;
        palco.querySelector('.m3d-visor__loading')?.remove();
        info.textContent = ` · ${v.stats.tris.toLocaleString('pt-BR')} triângulos${v.temAnimacao ? ` · ${v.stats.clips} animação(ões)` : ''}`;
        let girando = false, tocando = v.temAnimacao;
        const giroBtn = h('button', { className: 'm3d-viewer__share', onclick: () => { girando = !girando; v.setGiro(girando); giroBtn.textContent = girando ? '⟳ girando' : '⟳ girar'; } }, '⟳ girar');
        acoes.append(
          h('button', { className: 'm3d-viewer__share', onclick: () => v.recentrar() }, '◎ recentrar'),
          giroBtn);
        if (v.temAnimacao) {
          const animBtn = h('button', { className: 'm3d-viewer__share', onclick: () => { tocando = !tocando; v.setAnimando(tocando); animBtn.textContent = tocando ? '❚❚ pausar' : '▶ animar'; } }, '❚❚ pausar');
          acoes.appendChild(animBtn);
        }
      })
      .catch((err) => {
        palco.replaceChildren(h('div', { className: 'm3d-visor__erro' },
          h('b', null, 'Não consegui abrir esse modelo. '),
          semHtml((err && err.message) || err).slice(0, 200),
          h('div', { className: 'm3d-visor__erro-dica' },
            'Dica: .glb é o formato mais garantido. Se for .gltf com texturas separadas, arraste TODOS os arquivos juntos. URLs precisam permitir acesso externo (CORS).')));
      });
  }

  /* URL recusada antes de qualquer rede: aviso rápido no lugar do visor */
  function bolhaErroUrl() {
    const aviso = h('div', { className: 'm3d-viewer', onclick: (e) => { if (e.target === aviso) aviso.remove(); } },
      h('div', { className: 'm3d-viewer__box m3d-visor' },
        h('button', { className: 'm3d-viewer__close', onclick: () => aviso.remove(), 'aria-label': 'Fechar' }, '✕'),
        h('div', { className: 'm3d-visor__erro' },
          h('b', null, 'Endereço inválido. '),
          'Use uma URL http(s) direta pra um arquivo de modelo (ex.: https://…/modelo.glb).')));
    page.appendChild(aviso);
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

  /* deep-links: ?m=<uid> abre modelo do acervo · ?src=<url> abre no visor
   * universal (compartilhável: #/modelos-3d?src=https://…/modelo.glb) */
  const deepUid = (args.query || {}).m;
  if (deepUid) {
    const alvo = modelos.find((x) => x.uid === deepUid);
    if (alvo) setTimeout(() => abrirViewer(alvo), 60);
  }
  const deepSrc = (args.query || {}).src;
  if (deepSrc) setTimeout(() => abrirVisorUniversal({ url: deepSrc }), 60);

  /* auto-limpeza ao sair da rota */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch { /* ok */ } }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
