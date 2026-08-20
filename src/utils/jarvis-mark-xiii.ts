import { h } from './helpers.js';
import type { RuntimeObservation } from '../layout/runtime-observation';

export type { RuntimeObservation as MarkXiiiRuntimeObservation } from '../layout/runtime-observation';

export interface MarkXiiiConsoleOptions {
  readonly version: string;
  readonly musicConnected: boolean;
  readonly onMusic: () => void;
}

export interface MarkXiiiConsole {
  readonly root: HTMLDivElement;
  setMode(label: string): void;
  setMusic(connected: boolean): void;
  setRuntimeObservation(observation: RuntimeObservation): void;
  dispose(): void;
}

type MarkTheme = 'gold' | 'rose' | 'jade';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

const THEMES: Readonly<Record<MarkTheme, { node: string; glow: string; line: string }>> = {
  gold: { node: '#f4d493', glow: '#d6a84f', line: 'rgba(223, 183, 100, .34)' },
  rose: { node: '#f3b0a9', glow: '#d36e68', line: 'rgba(221, 128, 124, .30)' },
  jade: { node: '#8ed7bd', glow: '#50bd96', line: 'rgba(112, 201, 163, .28)' },
};

function createParticle(width: number, height: number, index: number): Particle {
  const angle = (index / 148) * Math.PI * 2;
  const radius = Math.min(width, height) * (0.13 + (index % 9) * 0.012);
  return {
    x: width / 2 + Math.cos(angle) * radius,
    y: height / 2 + Math.sin(angle) * radius * 0.74,
    vx: Math.sin(angle * 1.7) * 0.018,
    vy: Math.cos(angle * 1.3) * 0.014,
    size: 1 + (index % 4) * 0.55,
    alpha: 0.28 + (index % 7) * 0.08,
    phase: index * 0.31,
  };
}

function setText(element: HTMLElement, value: string): void {
  element.textContent = value;
}

export function createMarkXiiiConsole(options: MarkXiiiConsoleOptions): MarkXiiiConsole {
  const canvas = h('canvas', {
    className: 'jv-mark-xiii__canvas',
    role: 'img',
    'aria-label': 'Visualização reativa do Núcleo Mark XIII do JARVIS',
  }) as HTMLCanvasElement;
  const modeValue = h('span', { className: 'jv-mark-xiii__value' }, 'Local');
  const musicValue = h('span', { className: 'jv-mark-xiii__value' }, options.musicConnected ? 'ONLINE' : 'OFF');
  const telemetryValue = h('span', { className: 'jv-mark-xiii__value' }, 'ATIVO');
  const runtimeHealthValue = h('span', { className: 'jv-mark-xiii__value' }, 'UNKNOWN');
  const authorityValue = h('span', { className: 'jv-mark-xiii__value' }, 'NÃO AUTORIZADA');
  const nucleusIndicator = h('span', { className: 'jv-mark-xiii__indicator' }, 'NÚCLEO VISUAL');
  const networkIndicator = h('span', { className: 'jv-mark-xiii__indicator' }, 'REDE PENDENTE');
  const nucleusValue = h('span', { className: 'jv-mark-xiii__value' }, 'VISUAL');
  const networkValue = h('span', { className: 'jv-mark-xiii__value' }, 'UNKNOWN');
  const captionValue = h('div', { className: 'jv-mark-xiii__caption', 'aria-live': 'polite' }, 'Núcleo visual ativo. Observação do Runtime pendente.');
  const clockValue = h('time', { className: 'jv-mark-xiii__clock', dateTime: new Date().toISOString() }, '--:--:--');
  const root = h('section', {
    className: 'jv-mark-xiii',
    dataset: { visibility: 'integrated-v1', theme: 'gold', music: String(options.musicConnected), runtimeConnection: 'unknown', runtimeHealth: 'unknown', runtimeAuthority: 'not-authorized' },
    'aria-labelledby': 'jv-mark-xiii-title',
  },
    h('div', { className: 'jv-mark-xiii__topline' },
      h('div', { className: 'jv-mark-xiii__brand' },
        h('span', { className: 'jv-mark-xiii__sigil', 'aria-hidden': 'true' }, '◈'),
        h('span', { id: 'jv-mark-xiii-title' }, 'MARK XIII')),
      h('div', { className: 'jv-mark-xiii__indicators', 'aria-label': 'Status do núcleo' },
        nucleusIndicator,
        networkIndicator,
        h('span', { className: 'jv-mark-xiii__indicator' }, `VERSÃO ${options.version}`)),
      h('div', { className: 'jv-mark-xiii__time' },
        h('span', { className: 'jv-mark-xiii__date' }, 'OPERAÇÃO Baluarte'), clockValue)),
    h('div', { className: 'jv-mark-xiii__stage' },
      h('div', { className: 'jv-mark-xiii__scanline', 'aria-hidden': 'true' }),
      canvas,
      h('div', { className: 'jv-mark-xiii__title-block', 'aria-hidden': 'true' },
        h('span', null, 'J.A.R.V.I.S.'),
        h('small', null, 'NÚCLEO DE IA · ASTROLÁBIO SONORO')),
      h('div', { className: 'jv-mark-xiii__telemetry' },
        h('div', { className: 'jv-mark-xiii__telemetry-title' }, '◉ MARK XIII'),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'NÚCLEO'), nucleusValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'REDE'), networkValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'EVENTOS'), h('span', { className: 'jv-mark-xiii__value' }, '0')),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'ENERGIA'), h('span', { className: 'jv-mark-xiii__value' }, '100% ⚡')),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'TELEMETRIA'), telemetryValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'PERFIL'), modeValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'MÚSICA'), musicValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'SAÚDE OBS.'), runtimeHealthValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'AUTORIDADE'), authorityValue),
        h('div', { className: 'jv-mark-xiii__telemetry-row' }, h('span', null, 'MOTOR'), h('span', { className: 'jv-mark-xiii__value' }, 'NATIVO (GUGF)'))),
      captionValue),
    h('div', { className: 'jv-mark-xiii__bottom' },
      h('div', { className: 'jv-mark-xiii__presence' },
        h('span', { className: 'jv-mark-xiii__presence-dot', 'aria-hidden': 'true' }),
        h('span', null, 'PRESENÇA EXTERNA'),
        h('span', { className: 'jv-mark-xiii__presence-state' }, options.musicConnected ? 'SPOTIFY ONLINE' : 'SPOTIFY OFF')),
      h('div', { className: 'jv-mark-xiii__actions' },
        h('button', { className: 'jv-mark-xiii__action', type: 'button', onclick: options.onMusic }, '♫ MÚSICA'),
        h('span', { className: 'jv-mark-xiii__theme-label' }, 'TEMA'),
        ...(['gold', 'rose', 'jade'] as const).map((theme) => h('button', {
          className: 'jv-mark-xiii__swatch',
          type: 'button',
          title: `Tema ${theme}`,
          'aria-label': `Tema ${theme}`,
          dataset: { theme },
          onclick: () => { root.dataset.theme = theme; currentTheme = theme; }
        }))))) as HTMLDivElement;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('jarvis: canvas 2D indisponível para o Núcleo Mark XIII');

  let currentTheme: MarkTheme = 'gold';
  let particles: Particle[] = [];
  let raf = 0;
  let disposed = false;
  let width = 0;
  let height = 0;
  let lastFrame = 0;
  let frameWindowStarted = 0;
  let framesInWindow = 0;
  let measuredFps = 0;
  const device = globalThis.navigator as Navigator & { deviceMemory?: number };
  const lowMemoryDevice = typeof device.deviceMemory === 'number' && device.deviceMemory < 4;
  let performanceQuality: 'full' | 'reduced' = lowMemoryDevice ? 'reduced' : 'full';
  const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const mediaListener = () => { root.dataset.reducedMotion = String(prefersReducedMotion?.matches === true); };
  prefersReducedMotion?.addEventListener?.('change', mediaListener);
  mediaListener();

  const particleCount = (): number => performanceQuality === 'reduced' ? 40 : 72;
  const updateTelemetry = (): void => {
    const state = performanceQuality === 'reduced' ? 'REDUZIDO' : 'ATIVO';
    setText(telemetryValue, measuredFps > 0 ? `${state} · ${Math.round(measuredFps)} FPS` : state);
    root.dataset.performance = performanceQuality;
    if (measuredFps > 0) root.dataset.fps = String(Math.round(measuredFps));
  };
  const rebuildParticles = (): void => {
    particles = Array.from({ length: particleCount() }, (_, index) => createParticle(width, height, index));
    root.dataset.particles = String(particles.length);
  };
  const setPerformanceQuality = (quality: 'full' | 'reduced'): void => {
    if (performanceQuality === quality) return;
    performanceQuality = quality;
    rebuildParticles();
    updateTelemetry();
  };
  const samplePerformance = (time: number): void => {
    if (frameWindowStarted === 0) frameWindowStarted = time;
    framesInWindow += 1;
    const windowMs = time - frameWindowStarted;
    if (windowMs < 1000) return;
    measuredFps = (framesInWindow / windowMs) * 1000;
    if (measuredFps < 24 && performanceQuality === 'full') setPerformanceQuality('reduced');
    else if (measuredFps > 48 && performanceQuality === 'reduced' && !lowMemoryDevice) setPerformanceQuality('full');
    framesInWindow = 0;
    frameWindowStarted = time;
    updateTelemetry();
  };
  updateTelemetry();

  const resize = (): void => {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(box.width));
    height = Math.max(1, Math.floor(box.height));
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildParticles();
  };

  const draw = (time: number): void => {
    if (disposed) return;
    const reduced = prefersReducedMotion?.matches === true;
    const frameBudget = performanceQuality === 'reduced' ? 50 : 33;
    if (lastFrame !== 0 && time - lastFrame < frameBudget) {
      raf = requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min(50, time - lastFrame || 16);
    lastFrame = time;
    samplePerformance(time);
    const palette = THEMES[currentTheme];
    const beat = reduced ? 0.08 : Math.sin(time * 0.002) * 0.12 + Math.sin(time * 0.006) * 0.04;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#06070b';
    context.fillRect(0, 0, width, height);

    const centerX = width * 0.49;
    const centerY = height * 0.52;
    const coreRadius = Math.min(width, height) * (0.12 + beat * 0.04);
    const halo = context.createRadialGradient(centerX, centerY, 1, centerX, centerY, coreRadius * 2.8);
    halo.addColorStop(0, `${palette.glow}55`);
    halo.addColorStop(0.34, `${palette.glow}1e`);
    halo.addColorStop(1, 'transparent');
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(centerX, centerY);
    context.strokeStyle = `${palette.line}`;
    context.lineWidth = 0.7;
    for (let ring = 1; ring <= 4; ring += 1) {
      context.beginPath();
      context.ellipse(0, 0, coreRadius * (1.22 + ring * 0.38), coreRadius * (0.7 + ring * 0.2), time * 0.00008 * (ring % 2 ? 1 : -1), 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();

    for (const particle of particles) {
      if (!reduced) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
      }
      const distance = Math.hypot(particle.x - centerX, particle.y - centerY);
      if (distance > Math.min(width, height) * 0.34 || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
        Object.assign(particle, createParticle(width, height, Math.floor(Math.random() * particleCount())));
      }
      const flicker = 0.78 + Math.sin(time * 0.003 + particle.phase) * 0.22;
      context.fillStyle = `${palette.node}${Math.max(0.12, particle.alpha * flicker).toFixed(2).slice(2)}`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size + beat, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = `${palette.line}`;
    context.lineWidth = 0.55;
    const connectionStride = performanceQuality === 'reduced' ? 4 : 2;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += connectionStride) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < Math.min(width, height) * 0.12) {
          context.globalAlpha = Math.max(0, 1 - distance / (Math.min(width, height) * 0.12)) * 0.55;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }
    context.globalAlpha = 1;

    const core = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    core.addColorStop(0, '#fff9df');
    core.addColorStop(0.18, palette.node);
    core.addColorStop(0.58, `${palette.glow}cc`);
    core.addColorStop(1, 'transparent');
    context.fillStyle = core;
    context.beginPath();
    context.arc(centerX, centerY, coreRadius * (0.92 + beat), 0, Math.PI * 2);
    context.fill();

    if (!reduced) raf = requestAnimationFrame(draw);
  };

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvas);
  globalThis.addEventListener('resize', resize);
  resize();
  root.dataset.performance = performanceQuality;
  const setRuntimeObservation = (observation: RuntimeObservation): void => {
    const connected = observation.connection === 'connected';
    const healthLabel = observation.health.toUpperCase();
    root.dataset.runtimeConnection = observation.connection;
    root.dataset.runtimeHealth = observation.health;
    root.dataset.runtimeSeverity = observation.severity;
    root.dataset.runtimeFallback = observation.fallback;
    root.dataset.runtimeAuthority = 'not-authorized';
    root.dataset.runtimeSource = observation.source;
    if (observation.detail) root.dataset.runtimeDetail = observation.detail.slice(0, 120);
    setText(nucleusIndicator, connected ? 'NÚCLEO OBSERVADO' : 'NÚCLEO VISUAL');
    setText(networkIndicator, connected ? 'REDE OBSERVADA' : observation.connection === 'disconnected' ? 'REDE DESCONECTADA' : 'REDE PENDENTE');
    setText(nucleusValue, connected ? 'OBSERVADO' : 'VISUAL');
    setText(networkValue, connected ? 'CONNECTED' : observation.connection.toUpperCase());
    setText(runtimeHealthValue, healthLabel);
    setText(authorityValue, 'NÃO AUTORIZADA');
    nucleusIndicator.classList.toggle('is-online', connected);
    networkIndicator.classList.toggle('is-online', connected);
    setText(captionValue, connected
      ? `Runtime observado · saúde ${healthLabel.toLowerCase()} · severidade ${observation.severity} · fallback ${observation.fallback}.`
      : `Núcleo visual ativo · fallback ${observation.fallback}. Observação do Runtime pendente.`);
  };
  setRuntimeObservation({ source: 'visual-only', connection: 'unknown', health: 'unknown', severity: 'info', fallback: 'available', authority: 'not-authorized' });
  raf = requestAnimationFrame(draw);

  return {
    root,
    setMode(label: string): void {
      setText(modeValue, label.toUpperCase());
    },
    setMusic(connected: boolean): void {
      root.dataset.music = String(connected);
      setText(musicValue, connected ? 'ONLINE' : 'OFF');
      setText(root.querySelector('.jv-mark-xiii__presence-state') as HTMLElement, connected ? 'SPOTIFY ONLINE' : 'SPOTIFY OFF');
    },
    setRuntimeObservation,
    dispose(): void {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      globalThis.removeEventListener('resize', resize);
      prefersReducedMotion?.removeEventListener?.('change', mediaListener);
    },
  };
}
