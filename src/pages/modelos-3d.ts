/**
 * Modelos 3D — acervo curado e visualizador universal.
 *
 * O catálogo inicial é local e creditado; a API pública do Sketchfab só é
 * consultada por "Carregar mais". O three.js e o diagnóstico pesado continuam
 * lazy-loaded, e todos os viewers/telemetrias são best-effort.
 */

import { h } from '../utils/helpers.js';
import { lineIcon } from '../utils/icons.js';
import { attachSpotlight } from '../utils/effects.js';
import seedData from '../data/modelos-3d.json';
import { GALERIA_3D } from '../data/galeria-3d.js';
import type { ModelCollection, ModelSeed, SketchfabModel } from '../data/modelos-3d.js';
import type { GalleryModel } from '../data/galeria-3d.js';
import type { UniversalViewerSource, Viewer3DController } from '../utils/visor-3d.js';
import '../styles/modelos-3d.css';
import { sondarWebGL } from '../utils/webgl-probe.js';

const GROUPS = [
  ['todos', 'Todos'], ['militar', 'Militar'], ['armas', 'Armas'], ['mechas', 'Mechas & Pacific Rim'],
] as const;
const SEED = seedData as unknown as ModelSeed;
const COLLECTION_BY_UID: Record<string, ModelCollection> = Object.fromEntries(SEED.colecoes.map((collection) => [collection.uid, collection]));
const embedUrl = (uid: string): string => `https://sketchfab.com/models/${uid}/embed?utm_source=website&utm_medium=embed&utm_campaign=share-popup&autostart=1`;

type ModelQuery = { readonly m?: string; readonly src?: string };
interface ModelPageArgs { readonly query?: ModelQuery }

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
function safeText(value: unknown): string {
  return String(value ?? '').replace(/[<>&"'`]/g, '');
}
function parseSketchfabModel(value: unknown, collectionUid: string): SketchfabModel | null {
  if (!isRecord(value) || typeof value.uid !== 'string') return null;
  const user = isRecord(value.user) ? value.user : {};
  const license = isRecord(value.license) ? value.license : {};
  const thumbnails = isRecord(value.thumbnails) && Array.isArray(value.thumbnails.images) ? value.thumbnails.images : [];
  let thumb: string | null = null;
  let distance = Number.POSITIVE_INFINITY;
  thumbnails.forEach((item) => {
    if (!isRecord(item)) return;
    const width = numberValue(item.width);
    const url = stringValue(item.url);
    if (url && Math.abs(width - 512) < distance) { distance = Math.abs(width - 512); thumb = url; }
  });
  return {
    uid: value.uid,
    name: stringValue(value.name) || 'Sem nome',
    url: stringValue(value.viewerUrl) || `https://sketchfab.com/3d-models/${value.uid}`,
    author: stringValue(user.displayName) || stringValue(user.username) || 'desconhecido',
    authorUrl: stringValue(user.profileUrl),
    license: stringValue(license.label),
    thumb,
    anim: numberValue(value.animationCount) > 0 ? 1 : 0,
    cols: [collectionUid],
  };
}

export function modelos3dPage(args: ModelPageArgs = {}): HTMLDivElement {
  const cleanups: Array<() => void> = [];
  const onCleanup = (cleanup: () => void): void => { cleanups.push(cleanup); };
  let models: SketchfabModel[] = SEED.modelos.map((model) => ({ ...model, cols: [...model.cols] }));
  const seen = new Set(models.map((model) => model.uid));
  const cursors: Record<string, string | null | undefined> = {};
  let group = 'todos';
  let collection = '';
  let query = '';
  const page = h('div', { className: 'page-m3d' });

  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ACERVO'), h('span', null, '›'), h('span', null, 'MODELOS 3D')),
    h('h1', { className: 'page-header__title' }, '◈ Modelos 3D'),
    h('p', { className: 'page-header__description' }, 'Acervo 3D militar renderizado ', h('span', { className: 'u-text-cyan' }, 'no próprio site'), ' (three.js), com visualizador universal para abrir os seus arquivos.'),
  ));
  page.appendChild(h('div', { className: 'card m3d-intro' },
    h('div', { className: 'm3d-intro__ico', html: lineIcon('cube') }),
    h('div', null,
      h('p', { className: 'm3d-intro__lead' }, 'Acervo 3D militar — armas, veículos, mechas e dioramas. A ', h('b', null, 'Galeria 3D'), ' abaixo renderiza os modelos ', h('b', null, 'aqui no site'), ' (motor three.js — clicar e ver, sem depender de nada externo).'),
      h('p', { className: 'm3d-intro__credit' }, '✦ Todos os modelos pertencem aos seus criadores — autor, licença e link sempre à mostra. Modelos do Arma 3 NÃO entram (conteúdo protegido da Bohemia); use o ', h('b', null, 'Visualizador universal'), ' pra abrir os seus localmente.'),
    ),
  ));

  function openUniversal(source: UniversalViewerSource): void {
    if (source.url) {
      const url = source.url.trim();
      const allowedScheme = /^(https?:|blob:|data:)/i.test(url);
      const allowedLocal = /^\/[^/\\]/.test(url);
      if (!allowedScheme && !allowedLocal) { invalidUrlBubble(); return; }
      source = { ...source, url };
    }
    const files = source.files ? Array.from(source.files) : [];
    const firstFile = files.find((file) => /\.(glb|gltf|stl|obj|fbx)$/i.test(file.name)) ?? files[0];
    const name = safeText(source.nome || firstFile?.name || decodeURIComponent((source.url ?? '').split(/[?#]/)[0].split('/').pop() ?? 'modelo')).slice(0, 120) || 'modelo';
    void import('../utils/nexus.js').then((module) => module.nexusEvent('interaction', { acao: 'ver_3d_arquivo', fonte: source.url ? 'url' : 'arquivo', nome: name })).catch(() => {});
    const stage = h('div', { className: 'm3d-visor__palco' }, h('div', { className: 'm3d-visor__loading' }, h('span', { className: 'm3d-visor__spin' }), `Carregando ${name}…`));
    const actions = h('div', { className: 'm3d-visor__acoes' });
    const info = h('span', { className: 'm3d-visor__info' });
    const modal = h('div', { className: 'm3d-viewer', onclick: (event: Event) => { if (event.target === modal) close(); } },
      h('div', { className: 'm3d-viewer__box m3d-visor' },
        h('button', { className: 'm3d-viewer__close', onclick: close, 'aria-label': 'Fechar' }, '✕'), stage,
        h('div', { className: 'm3d-viewer__credit' }, h('span', { className: 'm3d-viewer__name' }, name), info, actions, h('div', { className: 'm3d-visor__dicas' }, 'girar: arrastar · zoom: roda do mouse · mover: botão direito')),
      ));
    let viewer: Viewer3DController | null = null;
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') close(); };
    function close(): void {
      document.removeEventListener('keydown', onKey);
      viewer?.dispose(); viewer = null;
      modal.remove();
    }
    document.addEventListener('keydown', onKey);
    onCleanup(() => { document.removeEventListener('keydown', onKey); viewer?.dispose(); viewer = null; });
    page.appendChild(modal);
    void import('../utils/visor-3d.js').then((module) => module.montarVisor3D(stage, source)).then((mounted) => {
      viewer = mounted;
      stage.querySelector('.m3d-visor__loading')?.remove();
      info.textContent = ` · ${mounted.stats.tris.toLocaleString('pt-BR')} triângulos${mounted.temAnimacao ? ` · ${mounted.stats.clips} animação(ões)` : ''}`;
      let spinning = false;
      const spinButton = h('button', { className: 'm3d-viewer__share', onclick: () => { spinning = !spinning; mounted.setGiro(spinning); spinButton.textContent = spinning ? '⟳ girando' : '⟳ girar'; } }, '⟳ girar');
      actions.append(h('button', { className: 'm3d-viewer__share', onclick: () => mounted.recentrar() }, '◎ recentrar'), spinButton);
      if (mounted.temAnimacao) {
        let playing = true;
        const animationButton = h('button', { className: 'm3d-viewer__share', onclick: () => { playing = !playing; mounted.setAnimando(playing); animationButton.textContent = playing ? '❚❚ pausar' : '▶ animar'; } }, '❚❚ pausar');
        actions.appendChild(animationButton);
      }
    }).catch((error: unknown) => {
      stage.replaceChildren(h('div', { className: 'm3d-visor__erro' }, h('b', null, 'Não consegui abrir esse modelo. '), safeText(error instanceof Error ? error.message : error).slice(0, 200), h('div', { className: 'm3d-visor__erro-dica' }, 'Dica: .glb é o formato mais garantido. Se for .gltf com texturas separadas, arraste TODOS os arquivos juntos. URLs precisam permitir acesso externo (CORS).')));
    });
  }

  function openSketchfabViewer(model: SketchfabModel): void {
    void import('../utils/nexus.js').then((module) => module.nexusEvent('interaction', { acao: 'ver_modelo_3d', uid: model.uid, modelo: model.name, autor: model.author })).catch(() => {});
    const iframe = h('iframe', { className: 'm3d-viewer__frame', src: embedUrl(model.uid), title: model.name, allow: 'autoplay; fullscreen; xr-spatial-tracking', allowfullscreen: true, loading: 'eager', frameborder: '0' });
    const link = `${location.origin}${location.pathname}#/modelos-3d?m=${model.uid}`;
    const share = h('button', { className: 'm3d-viewer__share', title: 'Copiar link direto deste modelo', onclick: () => { const done = () => { share.textContent = 'link copiado ✓'; window.setTimeout(() => { share.textContent = '⧉ compartilhar'; }, 1600); }; void navigator.clipboard?.writeText(link).then(done).catch(() => {}); } }, '⧉ compartilhar');
    const modal = h('div', { className: 'm3d-viewer', onclick: (event: Event) => { if (event.target === modal) close(); } }, h('div', { className: 'm3d-viewer__box' },
      h('button', { className: 'm3d-viewer__close', onclick: close, 'aria-label': 'Fechar' }, '✕'), iframe,
      h('div', { className: 'm3d-viewer__hint' }, '🖼 Player externo do Sketchfab — ficou em tela preta? Seu navegador bloqueia cookies de terceiros. ', h('a', { href: model.url, target: '_blank', rel: 'noopener noreferrer' }, 'Abra no Sketchfab ↗'), ' ou use a Galeria 3D no topo da página.'),
      h('div', { className: 'm3d-viewer__credit' }, h('a', { href: model.url, target: '_blank', rel: 'noopener noreferrer', className: 'm3d-viewer__name' }, model.name), h('span', null, ' por '), h('a', { href: model.authorUrl || '#', target: '_blank', rel: 'noopener noreferrer' }, model.author), h('span', null, ' no '), h('a', { href: 'https://sketchfab.com?utm_source=website&utm_medium=embed&utm_campaign=share-popup', target: '_blank', rel: 'noopener noreferrer' }, 'Sketchfab'), model.license ? h('span', { className: 'm3d-viewer__lic' }, ` · Licença: ${model.license}`) : false, share),
    ));
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') close(); };
    function close(): void { document.removeEventListener('keydown', onKey); modal.remove(); }
    document.addEventListener('keydown', onKey); onCleanup(() => document.removeEventListener('keydown', onKey)); page.appendChild(modal);
  }

  function invalidUrlBubble(): void {
    const alert = h('div', { className: 'm3d-viewer', onclick: (event: Event) => { if (event.target === alert) alert.remove(); } }, h('div', { className: 'm3d-viewer__box m3d-visor' }, h('button', { className: 'm3d-viewer__close', onclick: () => alert.remove(), 'aria-label': 'Fechar' }, '✕'), h('div', { className: 'm3d-visor__erro' }, h('b', null, 'Endereço inválido. '), 'Use uma URL http(s) direta pra um arquivo de modelo (ex.: https://…/modelo.glb).')));
    page.appendChild(alert);
  }

  const galleryGrid = h('div', { className: 'm3d-galeria-grid' });
  GALERIA_3D.forEach((gallery: GalleryModel) => galleryGrid.appendChild(h('div', { className: 'm3d-gal-card', onclick: () => openUniversal({ url: gallery.arquivo, nome: gallery.nome }) },
    h('div', { className: 'm3d-gal-card__thumb', 'aria-hidden': 'true' }, '⬡'), h('div', { className: 'm3d-gal-card__body' }, h('div', { className: 'm3d-gal-card__head' }, h('span', { className: 'm3d-gal-card__nome' }, gallery.nome), h('span', { className: 'badge badge--cyan' }, gallery.tag)), h('p', { className: 'm3d-gal-card__desc u-text-muted' }, gallery.desc), h('div', { className: 'm3d-gal-card__meta u-text-muted' }, `por ${gallery.autor} · `, h('a', { href: gallery.fonte, target: '_blank', rel: 'noopener noreferrer', onclick: (event: Event) => event.stopPropagation() }, gallery.licenca)), h('button', { className: 'btn btn--primary m3d-gal-card__btn' }, '▶ Ver em 3D')),
  )));
  const noWebGL = !sondarWebGL().ok;
  const diagnosticOutput = h('div', { className: 'm3d-diag', style: 'display:none' });
  const diagnosticButton = h('button', { className: 'btn m3d-diag-btn', onclick: async () => {
    diagnosticButton.disabled = true; diagnosticButton.textContent = '🩺 Diagnosticando…'; diagnosticOutput.style.display = ''; diagnosticOutput.replaceChildren(h('div', { className: 'u-text-muted' }, 'Rodando os testes na sua máquina…'));
    try {
      const result = await import('../utils/diag-3d.js').then((module) => module.rodarDiagnostico3D());
      const lines = result.etapas.map((stage) => h('div', { className: 'm3d-diag__linha' }, h('span', { className: 'm3d-diag__ico', style: `color:${stage.ok ? 'var(--color-success)' : '#ff7a7a'}` }, stage.ok ? '✓' : '✕'), h('span', { className: 'm3d-diag__nome' }, stage.nome), h('span', { className: 'm3d-diag__det u-text-muted' }, stage.detalhe)));
      const copy = h('button', { className: 'btn btn--primary', onclick: () => { const done = () => { copy.textContent = 'copiado ✓ — cole aqui pra mim'; }; void navigator.clipboard?.writeText(result.texto).then(done).catch(() => {}); } }, '⧉ copiar laudo');
      diagnosticOutput.replaceChildren(h('div', { className: `m3d-diag__veredito${result.tudoOk ? ' is-ok' : ' is-fail'}` }, result.tudoOk ? '✓ Todas as etapas passaram — o 3D deveria abrir.' : '✕ Achei onde quebra (linha vermelha abaixo).'), ...lines, h('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, copy));
    } catch (error: unknown) { diagnosticOutput.replaceChildren(h('div', { style: 'color:#ff7a7a' }, `O próprio diagnóstico falhou: ${safeText(error instanceof Error ? error.message : error)}`)); }
    diagnosticButton.disabled = false; diagnosticButton.textContent = '🩺 Testar meu 3D de novo';
  } }, '🩺 O 3D não abre? Clique pra diagnosticar');
  page.appendChild(h('div', { className: 'card m3d-galeria' }, h('div', { className: 'm3d-uni__head' }, h('b', null, '🧊 Galeria 3D'), h('span', { className: 'm3d-uni__badge' }, 'renderiza no site · clicar e ver'), noWebGL ? h('span', { className: 'm3d-uni__badge', style: 'color:#ff7a7a;border-color:#ff7a7a' }, '⚠ WebGL DESATIVADO neste navegador') : false), galleryGrid, h('div', { className: 'm3d-diag-wrap' }, diagnosticButton, diagnosticOutput)));

  const exampleUrl = '/modelos-3d/capacete-sci-fi.glb';
  const fileInput = h('input', { type: 'file', multiple: true, style: 'display:none', accept: '.glb,.gltf,.stl,.obj,.fbx,.bin,.png,.jpg,.jpeg,.webp,.ktx2', onchange: (event: Event) => { if (!(event.target instanceof HTMLInputElement)) return; if (event.target.files?.length) openUniversal({ files: Array.from(event.target.files) }); event.target.value = ''; } });
  const dropZone = h('div', { className: 'm3d-drop', tabindex: '0', role: 'button', onclick: () => fileInput.click(), onkeydown: (event: Event) => { if (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); fileInput.click(); } } }, h('span', { className: 'm3d-drop__ico', 'aria-hidden': 'true' }, '⬡'), h('span', null, h('b', null, 'Arraste um modelo 3D aqui'), ' ou clique pra escolher — ', h('span', { className: 'm3d-drop__fmt' }, '.glb · .gltf · .stl · .obj · .fbx'), ' (solte o .gltf junto com o .bin e as texturas que eu resolvo)'));
  dropZone.addEventListener('dragover', (event: DragEvent) => { event.preventDefault(); dropZone.classList.add('is-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-over'));
  dropZone.addEventListener('drop', (event: DragEvent) => { event.preventDefault(); dropZone.classList.remove('is-over'); const files = Array.from(event.dataTransfer?.files ?? []); if (files.length) openUniversal({ files }); });
  const urlInput = h('input', { className: 'input m3d-url', type: 'url', placeholder: 'https://…/modelo.glb — colar a URL de um modelo', onkeydown: (event: Event) => { if (event instanceof KeyboardEvent && event.key === 'Enter' && urlInput.value.trim()) openUniversal({ url: urlInput.value.trim() }); } });
  page.appendChild(h('div', { className: 'card m3d-uni' }, h('div', { className: 'm3d-uni__head' }, h('b', null, 'Visualizador universal'), h('span', { className: 'm3d-uni__badge' }, 'qualquer 3D, direto no site')), dropZone, fileInput, h('div', { className: 'm3d-uni__urlrow' }, urlInput, h('button', { className: 'btn btn--primary', onclick: () => { if (urlInput.value.trim()) openUniversal({ url: urlInput.value.trim() }); } }, 'Abrir URL'), h('button', { className: 'btn', title: 'Capacete de teste oficial do glTF (Khronos)', onclick: () => openUniversal({ url: exampleUrl, nome: 'DamagedHelmet.glb (exemplo Khronos)' }) }, '✦ Exemplo'))));

  const searchInput = h('input', { className: 'input m3d-busca', type: 'search', placeholder: 'Buscar por nome ou autor… (ex.: AK, tank, jaeger)', oninput: (event: Event) => { if (event.target instanceof HTMLInputElement) { query = event.target.value.trim().toLowerCase(); renderGrid(); } } });
  const chips = GROUPS.map(([id, label]) => h('button', { className: `m3d-chip${id === group ? ' is-active' : ''}`, 'data-grupo': id, onclick: () => { group = id; collection = ''; collectionSelect.value = ''; toolbar.querySelectorAll('.m3d-chip').forEach((button) => { if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.grupo === id); }); renderGrid(); } }, label));
  const collectionSelect = h('select', { className: 'input m3d-colsel', 'aria-label': 'Filtrar por coleção', onchange: (event: Event) => { if (event.target instanceof HTMLSelectElement) { collection = event.target.value; renderGrid(); } } }, h('option', { value: '' }, 'Todas as coleções'), ...SEED.colecoes.map((item) => h('option', { value: item.uid }, `${item.title} — ${item.author} (${item.count}${item.count >= 480 ? '+' : ''})`)));
  const toolbar = h('div', { className: 'm3d-toolbar' }, searchInput, h('div', { className: 'm3d-chips' }, ...chips), collectionSelect); page.appendChild(toolbar);
  const status = h('div', { className: 'm3d-status' }); const grid = h('div', { className: 'm3d-grid' }); const moreButton = h('button', { className: 'btn btn--primary m3d-mais', onclick: () => { void loadMore(); } }, 'Carregar mais desta coleção'); const moreWrap = h('div', { className: 'm3d-mais-wrap' }, moreButton); page.append(status, grid, moreWrap);

  function visibleModels(): SketchfabModel[] { return models.filter((model) => { if (collection && !model.cols.includes(collection)) return false; if (!collection && group !== 'todos' && !model.cols.some((uid) => COLLECTION_BY_UID[uid]?.grupo === group)) return false; return !query || `${model.name} ${model.author}`.toLowerCase().includes(query); }); }
  function modelCard(model: SketchfabModel): HTMLDivElement { const col = COLLECTION_BY_UID[model.cols[0]]; const element = h('div', { className: 'm3d-card', onclick: () => openSketchfabViewer(model) }, h('div', { className: 'm3d-card__thumb' }, model.thumb ? h('img', { src: model.thumb, alt: model.name, loading: 'lazy' }) : h('div', { className: 'm3d-card__nothumb' }, '⬡'), model.anim ? h('span', { className: 'm3d-card__anim', title: 'Tem animação' }, '▶ animado') : false, h('span', { className: 'm3d-card__play' }, 'ver em 3D')), h('div', { className: 'm3d-card__body' }, h('div', { className: 'm3d-card__name', title: model.name }, model.name), h('div', { className: 'm3d-card__by' }, 'por ', h('a', { href: model.authorUrl || '#', target: '_blank', rel: 'noopener noreferrer', onclick: (event: Event) => event.stopPropagation() }, model.author)), h('div', { className: 'm3d-card__meta' }, h('span', { className: 'm3d-card__lic' }, model.license || 'ver licença'), h('span', { className: 'm3d-card__col' }, col?.title || '')))); onCleanup(attachSpotlight(element)); return element; }
  function renderGrid(): void { const list = visibleModels(); grid.replaceChildren(...list.map(modelCard)); const selected = collection ? COLLECTION_BY_UID[collection] : null; status.textContent = selected ? `${list.length} modelo(s) carregado(s) de "${selected.title}" — o acervo completo tem ${selected.count}${selected.count >= 480 ? '+' : ''}.` : `${list.length} modelo(s) — destaques do acervo. Escolha uma coleção pra carregar tudo.`; moreWrap.style.display = collection ? '' : 'none'; }
  async function loadMore(): Promise<void> { if (!collection) return; moreButton.disabled = true; moreButton.textContent = 'Carregando…'; try { const url = cursors[collection] ?? `https://api.sketchfab.com/v3/collections/${collection}/models?count=24`; const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`); const data: unknown = await response.json(); const results = isRecord(data) && Array.isArray(data.results) ? data.results : []; let added = 0; results.forEach((item) => { const model = parseSketchfabModel(item, collection); if (!model) return; if (seen.has(model.uid)) { const existing = models.find((entry) => entry.uid === model.uid); if (existing && !existing.cols.includes(collection)) existing.cols.push(collection); return; } seen.add(model.uid); models.push(model); added += 1; }); cursors[collection] = isRecord(data) && typeof data.next === 'string' ? data.next : null; moreButton.textContent = cursors[collection] ? 'Carregar mais desta coleção' : 'Coleção completa carregada ✦'; moreButton.disabled = !cursors[collection]; if (added) renderGrid(); } catch { moreButton.textContent = 'Sem rede agora — tente de novo'; moreButton.disabled = false; } }

  page.appendChild(h('p', { className: 'm3d-footer' }, 'Coleções: ', ...SEED.colecoes.flatMap((item, index) => [index ? ' · ' : '', h('a', { href: item.url, target: '_blank', rel: 'noopener noreferrer' }, item.title), ` (${item.author})`]), ' — todos os modelos © seus autores, exibidos via player oficial do Sketchfab.'));
  renderGrid();
  if (args.query?.m) { const target = models.find((model) => model.uid === args.query?.m); if (target) window.setTimeout(() => openSketchfabViewer(target), 60); }
  if (args.query?.src) window.setTimeout(() => openUniversal({ url: args.query?.src }), 60);
  const observer = new MutationObserver(() => { if (!document.contains(page)) { cleanups.splice(0).forEach((cleanup) => { try { cleanup(); } catch { /* best effort */ } }); observer.disconnect(); } }); observer.observe(document.body, { childList: true, subtree: true });
  return page;
}
