/**
 * Página /media — Media Hub (Fase 15).
 *
 * Carrega áudios, vídeos e imagens locais via File API.
 * Tudo fica em memória (object URLs). Não persiste entre reloads.
 */

import { h, cx, debounce, empty } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';

let mediaList = [];
let selectedId = null;
let listEl = null;
let viewerEl = null;
let countEl = null;
let kbHandler = null;

function uid() {
  return 'm_' + Math.random().toString(36).slice(2, 10);
}

function typeOf(file) {
  if (file.type.startsWith('audio')) return 'audio';
  if (file.type.startsWith('video')) return 'video';
  if (file.type.startsWith('image')) return 'image';
  return 'file';
}

function iconFor(t) {
  return ({ audio: '♪', video: '▶', image: '◫', file: '◇' })[t] || '◇';
}

function colorFor(t) {
  return ({ audio: '#ff00aa', video: '#00f0ff', image: '#00ff88', file: '#93a4bf' })[t] || '#93a4bf';
}

function fmtSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function addFiles(files) {
  for (const f of files) {
    const type = typeOf(f);
    if (type === 'file') continue;
    const url = URL.createObjectURL(f);
    mediaList.push({
      id: uid(),
      name: f.name,
      type,
      size: f.size,
      url,
      mime: f.type,
      addedAt: Date.now()
    });
  }
  if (mediaList.length > 0 && !selectedId) selectedId = mediaList[0].id;
  renderList();
  renderViewer();
}

function removeItem(id) {
  const item = mediaList.find((m) => m.id === id);
  if (!item) return;
  URL.revokeObjectURL(item.url);
  mediaList = mediaList.filter((m) => m.id !== id);
  if (selectedId === id) selectedId = mediaList[0]?.id || null;
  renderList();
  renderViewer();
}

function clearAll() {
  if (!mediaList.length) return;
  if (!confirm('Remover todos os itens?')) return;
  mediaList.forEach((m) => URL.revokeObjectURL(m.url));
  mediaList = [];
  selectedId = null;
  renderList();
  renderViewer();
  toast('Lista limpa', { type: 'info' });
}

function unmount() {
  /* Revoga URLs ao sair pra evitar memory leak */
  mediaList.forEach((m) => { try { URL.revokeObjectURL(m.url); } catch {} });
  mediaList = [];
  selectedId = null;
}

function attachUnmountWatcher() {
  if (kbHandler) window.removeEventListener('hashchange', kbHandler);
  kbHandler = () => {
    if (!location.hash.startsWith('#/media')) {
      unmount();
      window.removeEventListener('hashchange', kbHandler);
      kbHandler = null;
    }
  };
  window.addEventListener('hashchange', kbHandler);
}

/* ===== Render ===== */

function renderList() {
  if (!listEl) return;
  empty(listEl);

  if (countEl) {
    const counts = { audio: 0, video: 0, image: 0 };
    mediaList.forEach((m) => counts[m.type]++);
    countEl.innerHTML = `${mediaList.length} item${mediaList.length !== 1 ? 's' : ''} <span class="u-text-muted u-mono" style="font-size: 11px;">· ♪${counts.audio} ▶${counts.video} ◫${counts.image}</span>`;
  }

  if (!mediaList.length) {
    listEl.appendChild(
      h('div', { className: 'media-empty u-text-muted' },
        h('div', { style: { fontSize: '48px' } }, '◫'),
        h('div', null, 'Nenhuma mídia carregada'),
        h('div', { style: { fontSize: '12px', marginTop: '8px' } },
          'Arraste arquivos aqui ou use o botão acima.')
      )
    );
    return;
  }

  mediaList.forEach((m) => {
    listEl.appendChild(
      h('div', {
        className: cx('media-row', m.id === selectedId && 'is-active'),
        onclick: () => {
          selectedId = m.id;
          document.querySelectorAll('.media-row').forEach((r) =>
            r.classList.toggle('is-active', r.dataset.id === m.id)
          );
          renderViewer();
        },
        'data-id': m.id
      },
        h('div', { className: 'media-row__icon', style: `color: ${colorFor(m.type)};` }, iconFor(m.type)),
        h('div', { className: 'media-row__body' },
          h('div', { className: 'media-row__name' }, m.name),
          h('div', { className: 'media-row__meta u-text-muted' },
            h('span', null, m.type.toUpperCase()),
            h('span', null, ' · '),
            h('span', null, fmtSize(m.size))
          )
        ),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          title: 'Remover',
          onclick: (ev) => { ev.stopPropagation(); removeItem(m.id); }
        }, '×')
      )
    );
  });
}

function renderViewer() {
  if (!viewerEl) return;
  empty(viewerEl);

  const item = mediaList.find((m) => m.id === selectedId);
  if (!item) {
    viewerEl.appendChild(
      h('div', { className: 'media-empty u-text-muted' },
        h('div', { style: { fontSize: '64px' } }, '◫'),
        h('div', null, 'Selecione um item para visualizar.')
      )
    );
    return;
  }

  /* Header */
  viewerEl.appendChild(
    h('div', { className: 'media-viewer__head' },
      h('div', { className: 'media-viewer__icon', style: `color: ${colorFor(item.type)}; border-color: ${colorFor(item.type)};` }, iconFor(item.type)),
      h('div', null,
        h('h3', { className: 'media-viewer__name' }, item.name),
        h('div', { className: 'media-viewer__meta u-text-muted u-mono' },
          item.type.toUpperCase() + ' · ' + fmtSize(item.size) + ' · ' + (item.mime || 'unknown')
        )
      )
    )
  );

  /* Conteúdo conforme tipo */
  if (item.type === 'audio') {
    const audio = h('audio', {
      controls: true,
      src: item.url,
      style: { width: '100%', marginTop: '12px' }
    });
    viewerEl.appendChild(audio);
    viewerEl.appendChild(
      h('button', {
        className: 'btn btn--primary btn--sm',
        style: 'margin-top: 12px',
        onclick: () => {
          toast('Use o /fft pra visualizar este áudio (carregue lá novamente)', { type: 'info' });
          router.navigate('/fft');
        }
      }, '~ Visualizar FFT →')
    );
  } else if (item.type === 'video') {
    const video = h('video', {
      controls: true,
      src: item.url,
      style: { width: '100%', marginTop: '12px', maxHeight: '60vh', background: '#000', borderRadius: '8px' }
    });
    viewerEl.appendChild(video);
  } else if (item.type === 'image') {
    const img = h('img', {
      src: item.url,
      alt: item.name,
      style: { width: '100%', marginTop: '12px', maxHeight: '70vh', objectFit: 'contain', background: '#0a0a0a', borderRadius: '8px' }
    });
    viewerEl.appendChild(img);
  }
}

/* ===== Page builder ===== */

export function mediaPage() {
  mediaList = [];
  selectedId = null;

  const fullPage = h('div', { className: 'page-media' });

  fullPage.appendChild(
    buildImmersiveHero({
      kicker: 'BALUARTE · MEDIA HUB',
      title: 'Media Hub',
      sub: 'ÁUDIO · VÍDEO · IMAGENS',
      desc: [
        'Player local pra ',
        h('span', { className: 'u-text-cyan' }, 'áudio, vídeo e imagens'),
        '. Arraste arquivos pra biblioteca, navegue e reproduza. ',
        h('span', { className: 'u-text-muted' }, 'Tudo em memória — não persiste entre sessões.')
      ],
      hudLeft: '◫ MEDIA HUB', hudRight: 'LOCAL'
    })
  );

  /* Toolbar */
  const fileInput = h('input', {
    type: 'file', multiple: true,
    accept: 'audio/*,video/*,image/*',
    style: { display: 'none' },
    onchange: (e) => {
      addFiles([...e.target.files]);
      e.target.value = '';
      toast(`${e.target.files.length} item(ns) adicionado(s)`, { type: 'success' });
    }
  });

  const loadBtn = h('button', {
    className: 'btn btn--primary',
    onclick: () => fileInput.click()
  }, '📂 Carregar arquivos');

  countEl = h('span', { className: 'section-header__count' }, '0 itens');

  fullPage.appendChild(
    h('div', { className: 'media-toolbar' },
      loadBtn,
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: clearAll
      }, '× Limpar tudo'),
      countEl,
      fileInput
    )
  );

  /* Drop zone (em todo o layout) */
  const dropZone = h('div', { className: 'media-dropzone' },
    h('div', { className: 'media-dropzone__text' },
      '⤓ Arraste arquivos aqui — áudio, vídeo, imagem'
    )
  );

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('is-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('is-over');
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length) {
      addFiles(files);
      toast(`${files.length} item(ns) adicionado(s)`, { type: 'success' });
    }
  });

  fullPage.appendChild(dropZone);

  /* Main: lista + viewer */
  listEl = h('div', { className: 'media-list' });
  viewerEl = h('div', { className: 'media-viewer' });

  fullPage.appendChild(
    h('div', { className: 'media-grid' }, listEl, viewerEl)
  );

  renderList();
  renderViewer();
  attachUnmountWatcher();

  return fullPage;
}
