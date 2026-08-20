import { chromium } from 'playwright';

const base = process.env.BASE || 'http://127.0.0.1:4173';
const reducedMotion = process.env.REDUCED_MOTION === '1';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({
  serviceWorkers: 'block',
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(String(error.message)));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
const startedAt = Date.now();
await page.goto(`${base}/#/jarvis`, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('.jv-mark-xiii', { timeout: 30000 });
const mountMs = Date.now() - startedAt;
await page.waitForTimeout(400);
const sample = await page.evaluate(async () => {
  const started = performance.now();
  let frames = 0;
  let last = started;
  let elapsed = 0;
  await new Promise((resolve) => {
    const tick = (now) => {
      frames += 1;
      elapsed = now - started;
      last = now;
      if (elapsed >= 2000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const memory = performance.memory;
  const consoleRoot = document.querySelector('.jv-mark-xiii');
  return {
    frames,
    elapsedMs: Math.round(elapsed),
    fps: Number((frames / (elapsed / 1000)).toFixed(2)),
    domNodes: document.querySelectorAll('.jv-mark-xiii *').length,
    canvasCount: document.querySelectorAll('.jv-mark-xiii canvas').length,
    canvasWidth: document.querySelector('.jv-mark-xiii canvas')?.width ?? 0,
    canvasHeight: document.querySelector('.jv-mark-xiii canvas')?.height ?? 0,
    dataset: consoleRoot ? { ...consoleRoot.dataset } : null,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemoryGb: navigator.deviceMemory ?? null,
    jsHeapUsedMb: memory ? Number((memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
    jsHeapLimitMb: memory ? Number((memory.jsHeapSizeLimit / 1048576).toFixed(2)) : null,
    readyState: document.readyState,
    serviceWorkerController: navigator.serviceWorker?.controller?.scriptURL ?? null,
    lastFrameMs: Math.round(last - started),
  };
});
console.log(JSON.stringify({ base, reducedMotion, mountMs, consoleErrors, sample }, null, 2));
await context.close();
await browser.close();
