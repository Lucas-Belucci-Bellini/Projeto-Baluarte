import { h } from './helpers.js';

export type JarvisV7VisualState = 'loading' | 'ready' | 'fallback';

/** Captura local do núcleo dourado aprovado como visual principal do app. */
export const JARVIS_V7_PATH = '/jarvis/jarvis-nucleo-browser.webp';

export interface JarvisV7VisualOptions {
  readonly fallback: HTMLElement;
  readonly source?: string;
  readonly onState?: (state: JarvisV7VisualState) => void;
}

export interface JarvisV7Visual {
  readonly root: HTMLDivElement;
  readonly image: HTMLImageElement;
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
  const image = h('img', {
    className: 'jv-visual-switcher__image',
    src: source,
    alt: 'Núcleo dourado J.A.R.V.I.S. do Projeto Baluarte',
    loading: 'eager',
    decoding: 'async',
  }) as HTMLImageElement;
  const fallback = options.fallback;
  fallback.classList.add('jv-visual-switcher__fallback');
  fallback.dataset.v7Fallback = 'true';
  root.append(image, fallback);

  let disposed = false;
  const setState = (state: JarvisV7VisualState): void => {
    if (disposed) return;
    root.dataset.visualState = state;
    image.hidden = state !== 'ready';
    fallback.hidden = state === 'ready';
    options.onState?.(state);
  };
  const onLoad = (): void => setState('ready');
  const onError = (): void => setState('fallback');
  image.addEventListener('load', onLoad);
  image.addEventListener('error', onError);
  setState('loading');

  return {
    root,
    image,
    source,
    setState,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      image.remove();
      fallback.hidden = false;
      fallback.classList.remove('jv-visual-switcher__fallback');
      delete fallback.dataset.v7Fallback;
    },
  };
}
