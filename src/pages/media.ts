/**
 * Página /media — Media Hub.
 *
 * Carrega áudio, vídeo e imagem localmente, sem persistência, revogando todos
 * os object URLs ao remover itens ou sair da rota.
 */

import '../styles/media.css';
import { h, cx, empty } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';
import { toast } from '../utils/toast';
import { router } from '../core/router.js';
import { aoSair } from '../core/ciclo-vida.js';

type MediaType = 'audio' | 'video' | 'image' | 'file';

interface MediaItem {
  readonly id: string;
  readonly name: string;
  readonly type: Exclude<MediaType, 'file'>;
  readonly size: number;
  readonly url: string;
  readonly mime: string;
  readonly addedAt: number;
}

let mediaList: MediaItem[] = [];
let selectedId: string | null = null;
let listEl: HTMLDivElement | null = null;
let viewerEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;
let hashHandler: (() => void) | null = null;

function uid(): string {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

function typeOf(file: File): MediaType {
  if (file.type.startsWith('audio')) return 'audio';
  if (file.type.startsWith('video')) return 'video';
  if (file.type.startsWith('image')) return 'image';
  return 'file';
}

function iconFor(type: MediaType): string {
  return ({ audio: '♪', video: '▶', image: '◫', file: '◇' } satisfies Record<MediaType, string>)[type];
}

function colorFor(type: MediaType): string {
  return ({ audio: '#e8c07a', video: '#d4a24e', image: '#00ff88', file: '#93a4bf' } satisfies Record<MediaType, string>)[type];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function addFiles(files: readonly File[]): void {
  files.forEach((file) => {
    const type = typeOf(file);
    if (type === 'file') return;
    mediaList.push({
      id: uid(), name: file.name, type, size: file.size,
      url: URL.createObjectURL(file), mime: file.type, addedAt: Date.now(),
    });
  });
  if (mediaList.length > 0 && !selectedId) selectedId = mediaList[0].id;
  renderList();
  renderViewer();
}

function removeItem(id: string): void {
  const item = mediaList.find((entry) => entry.id === id);
  if (!item) return;
  URL.revokeObjectURL(item.url);
  mediaList = mediaList.filter((entry) => entry.id !== id);
  if (selectedId === id) selectedId = mediaList[0]?.id ?? null;
  renderList();
  renderViewer();
}

function clearAll(): void {
  if (!mediaList.length || !confirm('Remover todos os itens?')) return;
  mediaList.forEach((item) => URL.revokeObjectURL(item.url));
  mediaList = [];
  selectedId = null;
  renderList();
  renderViewer();
  toast('Lista limpa', { type: 'info' });
}

function unmount(): void {
  mediaList.forEach((item) => {
    try { URL.revokeObjectURL(item.url); } catch { /* browser cleanup is best-effort */ }
  });
  mediaList = [];
  selectedId = null;
}

function attachUnmountWatcher(): void {
  if (hashHandler) window.removeEventListener('hashchange', hashHandler);
  hashHandler = (): void => {
    if (!location.hash.startsWith('#/media')) {
      unmount();
      if (hashHandler) window.removeEventListener('hashchange', hashHandler);
      hashHandler = null;
    }
  };
  window.addEventListener('hashchange', hashHandler);
}

function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  if (countEl) {
    const counts: Record<Exclude<MediaType, 'file'>, number> = { audio: 0, video: 0, image: 0 };
    mediaList.forEach((item) => { counts[item.type] += 1; });
    countEl.innerHTML = `${mediaList.length} item${mediaList.length !== 1 ? 's' : ''} <span class="u-text-muted u-mono" style="font-size: 11px;">· ♪${counts.audio} ▶${counts.video} ◫${counts.image}</span>`;
  }
  if (!mediaList.length) {
    listEl.appendChild(h('div', { className: 'media-empty u-text-muted' },
      h('div', { style: { fontSize: '48px' } }, '◫'),
      h('div', null, 'Nenhuma mídia carregada'),
      h('div', { style: { fontSize: '12px', marginTop: '8px' } }, 'Arraste arquivos aqui ou use o botão acima.'),
    ));
    return;
  }
  mediaList.forEach((item) => {
    listEl?.appendChild(h('div', {
      className: cx('media-row', item.id === selectedId && 'is-active'),
      onclick: () => {
        selectedId = item.id;
        document.querySelectorAll('.media-row').forEach((row) => {
          if (row instanceof HTMLElement) row.classList.toggle('is-active', row.dataset.id === item.id);
        });
        renderViewer();
      },
      'data-id': item.id,
    },
    h('div', { className: 'media-row__icon', style: `color: ${colorFor(item.type)};` }, iconFor(item.type)),
    h('div', { className: 'media-row__body' },
      h('div', { className: 'media-row__name' }, item.name),
      h('div', { className: 'media-row__meta u-text-muted' },
        h('span', null, item.type.toUpperCase()), h('span', null, ' · '), h('span', null, formatSize(item.size)),
      ),
    ),
    h('button', {
      className: 'btn btn--ghost btn--sm', title: 'Remover',
      onclick: (event: Event) => { event.stopPropagation(); removeItem(item.id); },
    }, '×'),
    ));
  });
}

function renderViewer(): void {
  if (!viewerEl) return;
  empty(viewerEl);
  const item = mediaList.find((entry) => entry.id === selectedId);
  if (!item) {
    viewerEl.appendChild(h('div', { className: 'media-empty u-text-muted' },
      h('div', { style: { fontSize: '64px' } }, '◫'), h('div', null, 'Selecione um item para visualizar.'),
    ));
    return;
  }
  viewerEl.appendChild(h('div', { className: 'media-viewer__head' },
    h('div', { className: 'media-viewer__icon', style: `color: ${colorFor(item.type)}; border-color: ${colorFor(item.type)};` }, iconFor(item.type)),
    h('div', null,
      h('h3', { className: 'media-viewer__name' }, item.name),
      h('div', { className: 'media-viewer__meta u-text-muted u-mono' }, `${item.type.toUpperCase()} · ${formatSize(item.size)} · ${item.mime || 'unknown'}`),
    ),
  ));
  if (item.type === 'audio') {
    viewerEl.appendChild(h('audio', { controls: true, src: item.url, style: { width: '100%', marginTop: '12px' } }));
    viewerEl.appendChild(h('button', {
      className: 'btn btn--primary btn--sm', style: 'margin-top: 12px',
      onclick: () => {
        toast('Use o /fft pra visualizar este áudio (carregue lá novamente)', { type: 'info' });
        router.navigate('/fft');
      },
    }, '~ Visualizar FFT →'));
  } else if (item.type === 'video') {
    viewerEl.appendChild(h('video', {
      controls: true, src: item.url,
      style: { width: '100%', marginTop: '12px', maxHeight: '60vh', background: '#000', borderRadius: '8px' },
    }));
  } else {
    viewerEl.appendChild(h('img', {
      src: item.url, alt: item.name,
      style: { width: '100%', marginTop: '12px', maxHeight: '70vh', objectFit: 'contain', background: '#0a0a0a', borderRadius: '8px' },
    }));
  }
}

export function mediaPage(): HTMLDivElement {
  mediaList = [];
  selectedId = null;
  const fullPage = h('div', { className: 'page-media' });
  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · MEDIA HUB', title: 'Media Hub', sub: 'ÁUDIO · VÍDEO · IMAGENS',
    desc: [
      'Player local pra ', h('span', { className: 'u-text-cyan' }, 'áudio, vídeo e imagens'),
      '. Arraste arquivos pra biblioteca, navegue e reproduza. ',
      h('span', { className: 'u-text-muted' }, 'Tudo em memória — não persiste entre sessões.'),
    ],
    hudLeft: '◫ MEDIA HUB', hudRight: 'LOCAL',
  }));

  const fileInput = h('input', {
    type: 'file', multiple: true, accept: 'audio/*,video/*,image/*', style: { display: 'none' },
    onchange: (event: Event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const files = Array.from(event.target.files ?? []);
      addFiles(files);
      event.target.value = '';
      toast(`${files.length} item(ns) adicionado(s)`, { type: 'success' });
    },
  });
  const loadButton = h('button', { className: 'btn btn--primary', onclick: () => fileInput.click() }, '📂 Carregar arquivos');
  countEl = h('span', { className: 'section-header__count' }, '0 itens');
  fullPage.appendChild(h('div', { className: 'media-toolbar' },
    loadButton,
    h('button', { className: 'btn btn--ghost btn--sm', onclick: clearAll }, '× Limpar tudo'),
    countEl, fileInput,
  ));

  const dropZone = h('div', { className: 'media-dropzone' }, h('div', { className: 'media-dropzone__text' }, '⤓ Arraste arquivos aqui — áudio, vídeo, imagem'));
  dropZone.addEventListener('dragover', (event: DragEvent) => {
    event.preventDefault();
    dropZone.classList.add('is-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-over'));
  dropZone.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();
    dropZone.classList.remove('is-over');
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      addFiles(files);
      toast(`${files.length} item(ns) adicionado(s)`, { type: 'success' });
    }
  });
  fullPage.appendChild(dropZone);
  listEl = h('div', { className: 'media-list' });
  viewerEl = h('div', { className: 'media-viewer' });
  fullPage.appendChild(h('div', { className: 'media-grid' }, listEl, viewerEl));
  renderList();
  renderViewer();
  attachUnmountWatcher();
  aoSair(fullPage, () => {
    unmount();
    if (hashHandler) window.removeEventListener('hashchange', hashHandler);
    hashHandler = null;
  });
  return fullPage;
}
