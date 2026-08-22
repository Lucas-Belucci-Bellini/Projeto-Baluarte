import { h } from './helpers.js';

export type JarvisV7VisualState = 'loading' | 'ready' | 'fallback';

export const JARVIS_V7_PATH = '/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html';

export interface JarvisV7VisualOptions {
  readonly fallback: HTMLElement;
  readonly source?: string;
  readonly onState?: (state: JarvisV7VisualState) => void;
}

export interface JarvisV7Visual {
  readonly root: HTMLDivElement;
  readonly frame: HTMLIFrameElement;
  readonly source: string;
  setState(state: JarvisV7VisualState): void;
  dispose(): void;
}

function currentOrigin(): string {
  const locationValue = globalThis.location;
  return locationValue && typeof locationValue.origin === 'string'
    ? locationValue.origin
    : 'http://localhost';
}

export function normalizeJarvisV7Url(source = JARVIS_V7_PATH): string {
  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new TypeError('fonte do JARVIS V7 deve ser texto não vazio');
  }
  const origin = currentOrigin();
  const resolved = new URL(source.trim(), `${origin}/`);
  if (resolved.origin !== origin || resolved.pathname !== JARVIS_V7_PATH || resolved.search || resolved.hash) {
    throw new TypeError('fonte do JARVIS V7 deve ser o artefato local same-origin');
  }
  return resolved.href;
}

export function createJarvisV7Visual(options: JarvisV7VisualOptions): JarvisV7Visual {
  const source = normalizeJarvisV7Url(options.source);
  const root = h('div', {
    className: 'jv-visual-switcher',
    dataset: { visualSource: 'jarvis-nucleo-v7', visualState: 'loading' },
  }) as HTMLDivElement;
  const frame = h('iframe', {
    className: 'jv-visual-switcher__frame',
    title: 'J.A.R.V.I.S. Núcleo V7 — visualização 3D',
    loading: 'eager',
    referrerPolicy: 'no-referrer',
    sandbox: 'allow-scripts allow-same-origin',
    src: source,
    'aria-label': 'J.A.R.V.I.S. Núcleo V7, visualização 3D',
  }) as HTMLIFrameElement;
  const fallback = options.fallback;
  fallback.classList.add('jv-visual-switcher__fallback');
  fallback.dataset.v7Fallback = 'true';
  root.append(frame, fallback);

  let disposed = false;
  const setState = (state: JarvisV7VisualState): void => {
    if (disposed) return;
    root.dataset.visualState = state;
    frame.hidden = state !== 'ready';
    fallback.hidden = state === 'ready';
    options.onState?.(state);
  };
  const onLoad = (): void => setState('ready');
  const onError = (): void => setState('fallback');
  frame.addEventListener('load', onLoad);
  frame.addEventListener('error', onError);
  setState('loading');

  return {
    root,
    frame,
    source,
    setState,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      frame.removeEventListener('load', onLoad);
      frame.removeEventListener('error', onError);
      frame.src = 'about:blank';
      frame.remove();
      fallback.hidden = false;
      fallback.classList.remove('jv-visual-switcher__fallback');
      delete fallback.dataset.v7Fallback;
    },
  };
}
