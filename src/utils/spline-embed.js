/**
 * Spline embed — integra cenas 3D do Spline (o nível de design pedido no #246/#207).
 *
 * Carrega o web component oficial `<spline-viewer>` (CDN) **sob demanda** e monta a
 * cena por cima de um fallback (o herói WebGL/2D que já existe). Filosofia:
 *   - **lazy**: o runtime do Spline (pesado) só baixa quando há uma cena pra mostrar
 *     e o elemento entra na viewport (IntersectionObserver);
 *   - **fallback seguro**: se não houver URL, falhar o load, ou `prefers-reduced-motion`,
 *     fica no herói atual — nunca quebra/branco;
 *   - **timeout**: se a cena não carregar em ~14s, desiste e mantém o fallback.
 *
 * Como obter a URL de uma cena (operador): abrir a cena no Spline → Export →
 * Viewer → copiar a URL `https://prod.spline.design/<id>/scene.splinecode`.
 */

const VIEWER_SRC = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js';
let viewerPromise = null;

function loadViewer() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.customElements && customElements.get('spline-viewer')) return Promise.resolve();
  if (viewerPromise) return viewerPromise;
  viewerPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = VIEWER_SRC;
    s.onload = () => resolve();
    s.onerror = () => { viewerPromise = null; reject(new Error('spline-viewer falhou')); };
    document.head.appendChild(s);
  });
  return viewerPromise;
}

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Monta uma cena Spline dentro de `container` (que deve estar posicionado).
 * @returns {{ destroy: () => void }}
 * @param {HTMLElement} container
 * @param {string} url  URL .splinecode da cena
 * @param {{ onReady?: ()=>void, onFail?: ()=>void, lazy?: boolean }} [opts]
 */
export function mountSpline(container, url, opts = {}) {
  const { onReady, onFail, lazy = true } = opts;
  let destroyed = false, viewer = null, io = null, timer = null;
  const fail = (e) => { if (!destroyed) { try { onFail && onFail(e); } catch {} } };

  if (!url || REDUCED || typeof document === 'undefined') { fail(); return { destroy() {} }; }

  const start = () => {
    if (destroyed) return;
    timer = setTimeout(() => fail(new Error('timeout')), 14000);
    loadViewer().then(() => {
      if (destroyed) return;
      viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', url);
      viewer.setAttribute('loading-anim-type', 'none');
      Object.assign(viewer.style, { width: '100%', height: '100%', display: 'block' });
      viewer.addEventListener('load', () => { if (timer) clearTimeout(timer); if (!destroyed) { try { onReady && onReady(); } catch {} } });
      viewer.addEventListener('error', () => { if (timer) clearTimeout(timer); fail(new Error('scene error')); });
      container.appendChild(viewer);
    }).catch((e) => { if (timer) clearTimeout(timer); fail(e); });
  };

  if (lazy && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((ents, obs) => {
      for (const e of ents) if (e.isIntersecting) { obs.disconnect(); io = null; start(); }
    }, { rootMargin: '200px' });
    io.observe(container);
  } else {
    start();
  }

  return {
    destroy() {
      destroyed = true;
      if (timer) clearTimeout(timer);
      if (io) { io.disconnect(); io = null; }
      if (viewer) { try { viewer.remove(); } catch {} viewer = null; }
    }
  };
}
