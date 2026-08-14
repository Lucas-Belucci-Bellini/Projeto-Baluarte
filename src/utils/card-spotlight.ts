let mounted = false;

export function mountCardSpotlight(root?: HTMLElement | null): void {
  if (mounted) return;
  if (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = root ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return;
  mounted = true;

  let frame = 0;
  let lastEvent: PointerEvent | null = null;

  target.addEventListener('pointermove', (event: PointerEvent) => {
    lastEvent = event;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const currentEvent = lastEvent;
      if (!currentEvent || !(currentEvent.target instanceof Element)) return;
      const card = currentEvent.target.closest<HTMLElement>('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((currentEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((currentEvent.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x.toFixed(1)}%`);
      card.style.setProperty('--my', `${y.toFixed(1)}%`);
    });
  }, { passive: true });
}
