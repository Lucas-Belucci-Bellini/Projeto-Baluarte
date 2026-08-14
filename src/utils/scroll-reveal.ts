const REDUCED = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SUPPORTED = typeof IntersectionObserver !== 'undefined';

let observer: IntersectionObserver | null = null;
let tallObserver: IntersectionObserver | null = null;

function onEntries(entries: readonly IntersectionObserverEntry[], currentObserver: IntersectionObserver): void {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      currentObserver.unobserve(entry.target);
    }
  });
}

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(onEntries, {
    rootMargin: '0px 0px -6% 0px',
    threshold: 0.04
  });
  return observer;
}

function getTallObserver(): IntersectionObserver {
  if (tallObserver) return tallObserver;
  tallObserver = new IntersectionObserver(onEntries, {
    rootMargin: '0px 0px -6% 0px',
    threshold: 0
  });
  return tallObserver;
}

function targets(root: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.classList.contains('anim-fade-in')) continue;
    if (child.dataset.noReveal != null) continue;
    result.push(child);
  }
  return result;
}

export function revealScan(root: HTMLElement | null, route?: string): void {
  if (!root || route === '/home' || route === '/home-3d') return;
  const blocks = targets(root);
  if (!blocks.length) return;

  if (REDUCED || !SUPPORTED) {
    blocks.forEach((element) => element.classList.add('reveal', 'is-revealed'));
    return;
  }

  const standardObserver = getObserver();
  const viewportHeight = (typeof window !== 'undefined' && window.innerHeight) || 800;
  blocks.forEach((element, index) => {
    if (element.classList.contains('reveal')) return;
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 45}ms`);
    const currentObserver = element.offsetHeight > viewportHeight * 0.5
      ? getTallObserver()
      : standardObserver;
    currentObserver.observe(element);
  });
}
