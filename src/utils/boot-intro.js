/**
 * Entrada do Baluarte — "cascata cybertroniana" (mockup Fable 5 V2, #246).
 *
 * Overlay de boot que cobre o site/app enquanto monta: chuva de glifos
 * procedurais num canvas 2D + sigilo astrolábio girando (SVG) + wordmark
 * que decodifica de glifos pra BALUARTE. Site e app (o Launcher carrega o
 * site, então a entrada vale pros dois).
 *
 * Duração padrão 6500ms (o operador pediu MAIS tempo que os 3600ms do
 * mockup) — clique em qualquer lugar ou Esc pula. prefers-reduced-motion:
 * sem chuva/decode, saída rápida. Cores seguem o tema ativo (tokens).
 */

import '../styles/boot-intro.css';

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const DURATION = 6500;          // "aumentasse o tempo" — mockup era 3600
const FADE = 900;
const FINAL = 'BALUARTE';
const GLYPHS = '⏃⏚☊⎅⟒⎎☌⊑⟟⟊☍⌰⋔⋏⍜⌿⍀⌇⏁⎍⎐⍙⌖⊬⋉◬⌭⌮';

const SIGIL = `
<svg viewBox="0 0 200 200" class="boot-intro__ring boot-intro__ring--slow" aria-hidden="true">
  <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-cyan)" stroke-width="1.5" stroke-dasharray="40 14 8 14" opacity="0.8"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="var(--color-magenta)" stroke-width="0.8" stroke-dasharray="2 6" opacity="0.6"/>
  <path d="M100 4 L106 16 L94 16 Z" fill="var(--color-cyan)"/>
  <path d="M100 196 L106 184 L94 184 Z" fill="var(--color-cyan)"/>
</svg>
<svg viewBox="0 0 200 200" class="boot-intro__ring boot-intro__ring--rev" aria-hidden="true">
  <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-cyan)" stroke-width="1" stroke-dasharray="22 10 4 10" opacity="0.7"/>
  <path d="M170 100 L160 94 L160 106 Z" fill="var(--color-magenta)"/>
  <path d="M30 100 L40 94 L40 106 Z" fill="var(--color-magenta)"/>
</svg>
<svg viewBox="0 0 200 200" class="boot-intro__ring" aria-hidden="true">
  <path d="M100 44 L148 72 L148 128 L100 156 L52 128 L52 72 Z" fill="var(--color-cyan)" fill-opacity="0.1" stroke="var(--color-cyan)" stroke-width="1.6"/>
  <path d="M100 62 L132 81 L132 119 L100 138 L68 119 L68 81 Z" fill="none" stroke="var(--color-magenta)" stroke-width="1" opacity="0.85"/>
  <path d="M100 82 L117 92 L117 112 L100 122 L83 112 L83 92 Z" class="boot-intro__pulse" fill="var(--color-cyan)" fill-opacity="0.35" stroke="var(--color-cyan)" stroke-width="1.2"/>
</svg>`;

/* Glifo procedural angular: traços numa grade 3x3 + círculo ocasional. */
function drawGlyph(ctx, x, y, s, seed, alpha) {
  let r = seed >>> 0;
  const rnd = () => { r = (r * 1103515245 + 12345) >>> 0; return (r >>> 16) / 65536; };
  const g = [[0, 0], [s / 2, 0], [s, 0], [0, s / 2], [s / 2, s / 2], [s, s / 2], [0, s], [s / 2, s], [s, s]];
  ctx.beginPath();
  const n = 2 + ((seed >> 3) % 3);
  for (let i = 0; i < n; i++) {
    const a = g[(rnd() * 9) | 0], b = g[(rnd() * 9) | 0];
    ctx.moveTo(x + a[0], y + a[1]); ctx.lineTo(x + b[0], y + b[1]);
  }
  ctx.globalAlpha = alpha; ctx.stroke();
  if ((seed % 5) === 0) { ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * 0.22, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

function readToken(name, fb) {
  try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb; }
  catch { return fb; }
}

/** Mostra a entrada. Devolve { skip } — e resolve sozinha após `duration`. */
export function playBootIntro({ duration = DURATION } = {}) {
  const word = document.createElement('div');
  word.className = 'boot-intro__word';
  word.textContent = '⏚⏃⌰⎍⏃⍀⏁⟒';

  const canvas = document.createElement('canvas');
  canvas.className = 'boot-intro__rain';

  const overlay = document.createElement('div');
  overlay.className = 'boot-intro';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-label', 'Baluarte inicializando');

  const vig = document.createElement('div');
  vig.className = 'boot-intro__vig';

  const center = document.createElement('div');
  center.className = 'boot-intro__center';
  const sigil = document.createElement('div');
  sigil.className = 'boot-intro__sigil';
  sigil.innerHTML = SIGIL;
  const sub = document.createElement('div');
  sub.className = 'boot-intro__sub';
  sub.textContent = 'MARK XIII · INICIALIZANDO NÚCLEO';
  const skipEl = document.createElement('div');
  skipEl.className = 'boot-intro__skip';
  skipEl.textContent = 'CLIQUE PARA PULAR ›';
  center.append(sigil, word, sub, skipEl);
  overlay.append(canvas, vig, center);
  document.body.appendChild(overlay);

  let raf = 0, decodeIv = 0, endT = 0, gone = false;

  /* ----- chuva de glifos (pula em reduced-motion) ----- */
  if (!REDUCED) {
    const ctx = canvas.getContext('2d');
    let W = canvas.width = overlay.clientWidth;
    let H = canvas.height = overlay.clientHeight;
    const CS = 16;
    let cols = Math.ceil(W / CS);
    let drops = Array.from({ length: cols }, () => ({
      y: Math.random() * -H, v: 2.5 + Math.random() * 4.5, seed: (Math.random() * 1e9) | 0
    }));
    const onResize = () => {
      W = canvas.width = overlay.clientWidth; H = canvas.height = overlay.clientHeight;
      cols = Math.ceil(W / CS);
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * -H, v: 2.5 + Math.random() * 4.5, seed: (Math.random() * 1e9) | 0
      }));
    };
    window.addEventListener('resize', onResize);
    const bg = readToken('--color-bg', '#0e0c16');
    const accent = readToken('--color-cyan', '#d4a24e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const loop = () => {
      if (gone) return;
      ctx.globalAlpha = 0.16; ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      ctx.strokeStyle = accent; ctx.lineWidth = 1;
      for (let i = 0; i < cols; i++) {
        const d = drops[i];
        d.y += d.v; d.seed = (d.seed + 1) | 0;
        drawGlyph(ctx, i * CS + 2, d.y, CS - 5, d.seed * 2654435761, 0.85);
        drawGlyph(ctx, i * CS + 2, d.y - CS * 1.4, CS - 5, (d.seed - 7) * 2654435761, 0.35);
        if (d.y > H + 40) { d.y = Math.random() * -200; d.v = 2.5 + Math.random() * 4.5; }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    /* wordmark: decodifica de glifos pra BALUARTE */
    let step = 0;
    decodeIv = setInterval(() => {
      let out = '';
      for (let i = 0; i < FINAL.length; i++) {
        out += (i < step - 2) ? FINAL[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      word.textContent = out; step += 0.5;
      if (step - 2 >= FINAL.length) { word.textContent = FINAL; clearInterval(decodeIv); }
    }, 85);
  } else {
    word.textContent = FINAL;
  }

  function skip() {
    if (gone) return;
    gone = true;
    clearTimeout(endT); clearInterval(decodeIv);
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { cancelAnimationFrame(raf); overlay.remove(); }, REDUCED ? 200 : FADE);
  }
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') skip(); };
  overlay.addEventListener('click', skip);
  document.addEventListener('keydown', onKey);
  endT = setTimeout(skip, REDUCED ? 1200 : duration);

  return { skip };
}
