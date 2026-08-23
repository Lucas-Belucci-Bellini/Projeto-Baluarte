"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   NÚCLEO J.A.R.V.I.S. v7 — ASTROLÁBIO SONORO · Projeto Baluarte
   Fonte em TypeScript. O artefato `jarvis-nucleo-v7.js` é gerado para
   produção com o compilador TypeScript, sem transpile no navegador.

   Mudanças face ao v6:
   · SEM TELEMETRIA. Foram-se os painéis holográficos, o terminal de bordo,
     a barra de leituras e a grelha de fundo. Fica o objeto. Os comandos
     desvanecem-se sozinhos após 4 s sem rato.
   · OUVE. Analisador Web Audio com três bandas (grave · médio · agudo),
     deteção de batida por fluxo espectral e um espectro de 64 bins enviado
     à GPU como textura — um upload de 64 bytes por frame, zero JS por barra.
   · TOCA. Sequenciador generativo próprio (pad, baixo, arpejo, sibilo) para
     haver sempre música; ou arrasta-se um ficheiro; ou abre-se o microfone.
   · DANÇA. O interior responde: o grave dilata o plasma e o coração, o médio
     abre as facetas do cristal, o agudo acelera as fagulhas e faz cintilar as
     lâminas, a batida dispara onda de choque. Tudo por uniformes.
   ═══════════════════════════════════════════════════════════════════════════ */
const THEMES = [
    { name: 'ouro', deep: 0x8f4f16, high: 0xffe0a6, hot: 0xffd28a, blade: 0xc8913f,
        rings: 0xf0a83c, ringAlt: 0xffb347, constel: 0xffd07a, dust: 0xff9c3a,
        ember: 0x5e2c0c, bg: 0x0b0910,
        css: '#d4a24e', css2: '#eec886', dim: '#9d9078', txt: '#f4ecdd' },
    { name: 'rubi', deep: 0x76141f, high: 0xffb6a6, hot: 0xff9d84, blade: 0xba4a45,
        rings: 0xf05a4c, ringAlt: 0xff7d63, constel: 0xffa08a, dust: 0xff6a4a,
        ember: 0x5e0f14, bg: 0x0d070a,
        css: '#d45a52', css2: '#f0a99c', dim: '#9d7a76', txt: '#f7ecea' },
    { name: 'jade', deep: 0x0e5340, high: 0xb4ffdf, hot: 0x8effcb, blade: 0x3fb489,
        rings: 0x3cd9a0, ringAlt: 0x6effc4, constel: 0x8fffd4, dust: 0x3affae,
        ember: 0x073327, bg: 0x07100d,
        css: '#4ecfa0', css2: '#a8ffd8', dim: '#789d90', txt: '#e9f7f1' }
];
let TH = THEMES[0];
const CFG = {
    crystalR: 1.95, crystalDetail: 1,
    plasmaR: 1.58, plasmaDetail: 2,
    rings: [{ r: 3.15, count: 44, len: 0.34 },
        { r: 4.05, count: 56, len: 0.30 },
        { r: 4.95, count: 68, len: 0.26 }],
    eqBars: 64, eqRadius: 2.42,
    constelPts: 110, dustCount: 700,
    spinCore: 0.075, spinRings: 0.30, spinDust: 0.02,
    noiseFreq: 1.45, noiseAmp: 0.30, noiseSpeed: 0.28,
    pulseSpeed: 1.05, pulseAmt: 0.075,
    bloomStrength: 0.92, bloomRadius: 0.6, bloomThreshold: 0.58, exposure: 1.02,
    parallax: 0.38, repelRadius: 2.5, repelForce: 1.7,
    linkDist: 2.6, linkOpacity: 0.5, linkSlack: 1.0,
    arcCount: 4, arcSegs: 8, arcLife: 0.3,
    sparkPerRing: 6, sparkTrail: 4, sparkSpeed: 0.5,
    glyphCount: 14, aberration: 0.0016, grain: 0.045, vignette: 0.26,
    orbitMin: 8, orbitMax: 28, bootDur: 2.6,
    scanDur: 2.3, scanEvery: 19, idleCinema: 15, hudIdle: 4,
    stripText: 'BALUARTE · MARK XV · ASTROLABIO SONORO · SINCRONIA 99.4 · '
};
const VIEWS = [
    { name: 'retrato', dist: 12.5, pitch: 0.10, fov: 46, auto: 0 },
    { name: 'diagnóstico', dist: 17.5, pitch: 0.62, fov: 52, auto: 0 },
    { name: 'órbita', dist: 22.0, pitch: -0.14, fov: 58, auto: 0.10 }
];
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.raw = null;
        this.master = null;
        this.musicBus = null;
        this.micStream = null;
        this.mediaEl = null;
        this.mediaSrc = null;
        this.micSrc = null;
        this.mode = 'off';
        this.bands = { bass: 0, mid: 0, treble: 0, level: 0 };
        this.beat = false;
        this.fft = new Uint8Array(CFG.eqBars);
        this.label = '';
        // normalização adaptativa: cada banda é medida contra o seu próprio máximo
        // recente, para música alta e música fraca aterrarem ambas a meio da escala
        this.peak = { bass: 0.05, mid: 0.04, treble: 0.02, level: 0.04 };
        this.mean = { bass: 0.02, mid: 0.02, treble: 0.01, level: 0.02 };
        this.specRaw = new Float32Array(CFG.eqBars);
        this.specPeak = 24;
        this.beatCool = 0;
        this.bpm = 84;
        this.step = 0;
        this.nextTime = 0;
        this.timer = 0;
    }
    ensure() {
        if (this.ctx)
            return this.ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const master = ctx.createGain();
        master.gain.value = 0.55;
        const an = ctx.createAnalyser();
        an.fftSize = 2048;
        an.smoothingTimeConstant = 0.72;
        master.connect(ctx.destination);
        master.connect(an); // derivação: analisa sem somar
        const bus = ctx.createGain();
        bus.gain.value = 0;
        bus.connect(master);
        this.ctx = ctx;
        this.master = master;
        this.analyser = an;
        this.musicBus = bus;
        this.raw = new Uint8Array(an.frequencyBinCount);
        return ctx;
    }
    resume() {
        if (this.ctx && this.ctx.state === 'suspended')
            this.ctx.resume();
    }
    /* ─ fontes ─ */
    toggleGenerative() {
        const ctx = this.ensure();
        this.resume();
        if (this.mode === 'gen') {
            this.silence();
            return false;
        }
        this.detach();
        this.mode = 'gen';
        this.label = 'partitura generativa · baluarte';
        this.musicBus.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);
        this.nextTime = ctx.currentTime + 0.08;
        this.step = 0;
        this.timer = window.setInterval(() => this.schedule(), 25);
        return true;
    }
    async playFile(file) {
        const ctx = this.ensure();
        this.resume();
        this.detach();
        const el = this.mediaEl || document.createElement('audio');
        el.src = URL.createObjectURL(file);
        el.loop = true;
        el.crossOrigin = 'anonymous';
        if (!this.mediaSrc) {
            this.mediaSrc = ctx.createMediaElementSource(el);
            this.mediaEl = el;
        }
        this.mediaSrc.connect(this.master);
        await el.play();
        this.mode = 'file';
        this.label = file.name.replace(/\.[^.]+$/, '');
        return this.label;
    }
    async captureSystem() {
        const ctx = this.ensure();
        this.resume();
        if (this.mode === 'sistema') {
            this.silence();
            return false;
        }
        const media = navigator.mediaDevices;
        if (typeof media?.getDisplayMedia !== 'function')
            throw new Error('SEM_CAPTURA');
        let stream;
        try {
            stream = await media.getDisplayMedia({
                video: true,
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
        }
        catch {
            throw new Error('RECUSADO');
        }
        if (!stream.getAudioTracks().length) {
            stream.getTracks().forEach(t => t.stop());
            throw new Error('SEM_AUDIO');
        }
        this.detach();
        if (ctx.state === 'suspended')
            await ctx.resume();
        stream.getVideoTracks().forEach(t => t.stop());
        this.micStream = stream;
        this.micSrc = ctx.createMediaStreamSource(stream);
        this.micSrc.connect(this.analyser);
        stream.getAudioTracks().forEach(t => {
            t.onended = () => { if (this.mode === 'sistema') {
                this.silence();
                this.onEnded?.();
            } };
        });
        this.mode = 'sistema';
        this.label = 'áudio do sistema';
        return true;
    }
    onEnded = null;
    async useMic() {
        const ctx = this.ensure();
        this.resume();
        if (this.mode === 'mic') {
            this.silence();
            return false;
        }
        this.detach();
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        this.micStream = stream;
        this.micSrc = ctx.createMediaStreamSource(stream);
        this.micSrc.connect(this.analyser); // só o analisador: sem retorno
        this.mode = 'mic';
        this.label = 'entrada externa · microfone';
        return true;
    }
    detach() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
        if (this.musicBus && this.ctx)
            this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        if (this.mediaEl) {
            this.mediaEl.pause();
        }
        if (this.mediaSrc) {
            try {
                this.mediaSrc.disconnect();
            }
            catch (e) { /* já solto */ }
        }
        if (this.micSrc) {
            try {
                this.micSrc.disconnect();
            }
            catch (e) { /* já solto */ }
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => { t.onended = null; t.stop(); });
            this.micStream = null;
        }
        this.peak = { bass: 0.05, mid: 0.04, treble: 0.02, level: 0.04 };
        this.mean = { bass: 0.02, mid: 0.02, treble: 0.01, level: 0.02 };
        this.specPeak = 24;
        this.beatCool = 0;
    }
    silence() { this.detach(); this.mode = 'off'; this.label = ''; }
    /* ─ sequenciador: pad + baixo + arpejo + sibilo, escala menor pentatónica ─ */
    schedule() {
        const ctx = this.ctx;
        const eighth = 30 / this.bpm;
        while (this.nextTime < ctx.currentTime + 0.25) {
            this.emit(this.step++, this.nextTime);
            this.nextTime += eighth;
        }
    }
    emit(i, t) {
        const scale = [0, 3, 5, 7, 10, 12, 15];
        const bar = Math.floor(i / 16) % 4;
        const roots = [0, -2, 3, -5];
        const root = 55 * Math.pow(2, roots[bar] / 12);
        if (i % 16 === 0)
            this.pad(t, root, bar);
        if (i % 4 === 0)
            this.bassNote(t, root, i % 16 === 8 ? 1.5 : 1);
        if ([2, 3, 6, 10, 11, 14].indexOf(i % 16) >= 0) {
            const n = scale[(i * 5 + bar) % scale.length];
            this.pluck(t, root * 4 * Math.pow(2, n / 12));
        }
        if (i % 4 === 2)
            this.sizzle(t, 0.05);
        if (i % 16 === 15)
            this.sizzle(t, 0.16);
    }
    bassNote(t, f, len) {
        const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
        o.type = 'sawtooth';
        o.frequency.value = f;
        lp.type = 'lowpass';
        lp.Q.value = 4;
        lp.frequency.setValueAtTime(340, t);
        lp.frequency.exponentialRampToValueAtTime(95, t + 0.45 * len);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.55, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.55 * len);
        o.connect(lp);
        lp.connect(g);
        g.connect(this.musicBus);
        o.start(t);
        o.stop(t + 0.7 * len);
    }
    pad(t, root, bar) {
        const ctx = this.ctx, g = ctx.createGain(), lp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1400;
        lp.Q.value = 0.7;
        // o pad vive nos médios: deixa a banda grave livre para a batida pulsar
        hp.type = 'highpass';
        hp.frequency.value = 210;
        hp.Q.value = 0.5;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 1.6);
        g.gain.linearRampToValueAtTime(0.0001, t + 5.4);
        lp.connect(hp);
        hp.connect(g);
        g.connect(this.musicBus);
        [0, 7, 15, 22].forEach((n, k) => {
            const o = ctx.createOscillator();
            o.type = k % 2 ? 'triangle' : 'sine';
            o.frequency.value = root * 2 * Math.pow(2, n / 12);
            o.detune.value = (k - 1.5) * 6 + bar * 2;
            o.connect(lp);
            o.start(t);
            o.stop(t + 5.6);
        });
    }
    pluck(t, f) {
        const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.10, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 0.5);
        o.connect(g);
        g.connect(this.musicBus);
        o.start(t);
        o.stop(t + 0.55);
    }
    sizzle(t, amp) {
        const ctx = this.ctx, n = 1024;
        const buf = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++)
            d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = ctx.createBufferSource();
        s.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 5200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(amp, t);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 0.14);
        s.connect(hp);
        hp.connect(g);
        g.connect(this.musicBus);
        s.start(t);
    }
    /* ─ análise ─ */
    update(dt) {
        this.beat = false;
        if (!this.analyser || this.mode === 'off') {
            const k = Math.min(1, dt * 3);
            this.bands.bass += (0 - this.bands.bass) * k;
            this.bands.mid += (0 - this.bands.mid) * k;
            this.bands.treble += (0 - this.bands.treble) * k;
            this.bands.level += (0 - this.bands.level) * k;
            for (let i = 0; i < this.fft.length; i++)
                this.fft[i] = Math.max(0, this.fft[i] - 12);
            return;
        }
        const raw = this.raw;
        this.analyser.getByteFrequencyData(raw);
        const band = (a, b) => {
            let s = 0;
            for (let i = a; i < b; i++)
                s += raw[i];
            return s / ((b - a) * 255);
        };
        const eBass = band(1, 12), eMid = band(12, 80), eTre = band(80, 300);
        const eAll = eBass * 0.5 + eMid * 0.35 + eTre * 0.15;
        const decay = Math.pow(0.5, dt / 2.2); // meia-vida do máximo: 2.2 s
        const soft = 1 / Math.tanh(1.5);
        // duas medidas por banda: nível absoluto contra o máximo recente, e
        // CONTRASTE contra a média longa — é o contraste que faz o objeto dançar
        // quando a música tem cama contínua (pads, masters comprimidos)
        let relBass = 0;
        const norm = (v, key, floor) => {
            const p = Math.max(v, Math.max(floor, this.peak[key] * decay));
            this.peak[key] = p;
            const m = this.mean[key] + (v - this.mean[key]) * Math.min(1, dt * 0.3);
            this.mean[key] = m;
            const rel = Math.max(0, (v - m) / Math.max(p - m, p * 0.18));
            if (key === 'bass')
                relBass = rel;
            const x = (v / p) * 0.30 + rel * 0.62;
            return Math.min(1, Math.tanh(x * 1.2) * soft);
        };
        const bass = norm(eBass, 'bass', 0.05);
        const mid = norm(eMid, 'mid', 0.04);
        const tre = norm(eTre, 'treble', 0.02);
        const lvl = norm(eAll, 'level', 0.04);
        const ease = (cur, v) => cur + (v - cur) * (v > cur ? Math.min(1, dt * 22) : Math.min(1, dt * 5));
        this.bands.bass = ease(this.bands.bass, bass);
        this.bands.mid = ease(this.bands.mid, mid);
        this.bands.treble = ease(this.bands.treble, tre);
        this.bands.level = ease(this.bands.level, lvl);
        // batida: contraste do grave contra a sua média longa — nunca sobre o
        // valor já limitado, senão o fluxo desaparece no teto
        this.beatCool -= dt;
        if (relBass > 0.52 && eBass > this.peak.bass * 0.25 && this.beatCool <= 0) {
            this.beat = true;
            this.beatCool = 0.3;
        }
        // 64 bins em escala logarítmica → textura do equalizador, com o mesmo
        // tipo de normalização para a coroa usar toda a altura
        const n = this.fft.length, top = 380;
        let mx = 0;
        for (let i = 0; i < n; i++) {
            const a = Math.floor(Math.pow(i / n, 1.9) * top) + 1;
            const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / n, 1.9) * top) + 1);
            let s = 0;
            for (let k = a; k < b; k++)
                s += raw[k];
            const v = (s / (b - a)) * (1 + i / n * 1.6);
            this.specRaw[i] = v;
            if (v > mx)
                mx = v;
        }
        this.specPeak = Math.max(mx, Math.max(20, this.specPeak * decay));
        for (let i = 0; i < n; i++) {
            const v = Math.min(255, 255 * (this.specRaw[i] / this.specPeak));
            this.fft[i] = Math.max(v, this.fft[i] - 700 * dt);
        }
    }
}
const audio = new AudioEngine();
/* ═══ 2 · RUÍDO SIMPLEX (Ashima/Gustavson) ═════════════════════════════════ */
const GLSL_NOISE = `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(0.166666666666,0.333333333333);
  const vec4 D = vec4(0.0,0.5,1.0,2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`;
/* ═══ 3 · ESTADO ═══════════════════════════════════════════════════════════ */
let scene, camera, renderer, composer, bloomPass, compPass;
let coreGroup, crystal, plasma, heart, hitSphere, strip, scanDisc;
let eqMesh, fftTex;
const ringGroups = [], bladeMeshes = [], sparkMats = [], circles = [];
let constel, constelBase, constelVel;
let linkGeo, linkPairs, glyphs;
let arcGeo, arcMat, dust;
const waves = [];
const themed = [];
let spinning = true, frame = 0, booted = false, hudOn = true;
let viewIdx = 0, openTarget = 0, openAmt = 0;
let scanT = -1, scanY = -9, scanInt = 0, lastInput = 0, cinema = false;
let pulseUntil = 0, energy = 0, sparkClock = 0, hudTouch = 0;
const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
const orb = { yaw: 0, pitch: 0.10, dist: 26, tYaw: 0, tPitch: 0.10, tDist: 12.5,
    fov: 46, tFov: 46, drag: false, lx: 0, ly: 0, pinch: 0 };
const perf = { acc: 0, n: 0, fps: 60, quality: 2, low: 0, high: 0, linkD: 0, arcs: 0 };
let mouseX = -999, clock, ray, ndc, mw;
let SPRITE = null;
const hex = (v) => '#' + v.toString(16).padStart(6, '0');
const rgba = (v, a) => 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')';
function randDir() {
    const z = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    return new THREE.Vector3(Math.cos(a) * s, Math.sin(a) * s, z);
}
function tint(mat, key, uni) {
    themed.push({ mat, key, uni });
    return mat;
}
function glowSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.22, 'rgba(255,242,224,0.92)');
    grad.addColorStop(0.55, 'rgba(255,224,196,0.28)');
    grad.addColorStop(1, 'rgba(255,214,184,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}
/* aviso transitório: aparece, diz o que mudou, e sai — não fica a ocupar ecrã */
let toastTimer = 0;
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('on'), 2600);
}
/* ═══ 4 · CONSTRUÇÃO ═══════════════════════════════════════════════════════ */
function init() {
    clock = new THREE.Clock();
    ray = new THREE.Raycaster();
    ndc = new THREE.Vector2();
    mw = new THREE.Vector3();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(TH.bg, 0.028);
    camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);
    camera.position.set(0, 0, 26);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(TH.bg, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CFG.exposure;
    document.getElementById('stage').appendChild(renderer.domElement);
    SPRITE = glowSprite();
    coreGroup = new THREE.Group();
    scene.add(coreGroup);
    buildCrystal();
    buildPlasma();
    buildEqualizer();
    buildAstrolabe();
    buildSparks();
    buildArcs();
    buildStrip();
    buildScanDisc();
    buildWaves();
    buildConstellation();
    buildGlyphs();
    buildDust();
    postFX();
    bind();
    perf.linkD = CFG.linkDist;
    perf.arcs = CFG.arcCount;
    const ld = document.getElementById('loading');
    ld.style.opacity = '0';
    setTimeout(() => ld.remove(), 750);
    setTimeout(() => document.getElementById('title').classList.add('faded'), 4200);
}
/* cristal: arestas incandescentes; as facetas separam-se no pulso e no médio */
function buildCrystal() {
    const src = new THREE.IcosahedronGeometry(CFG.crystalR, CFG.crystalDetail);
    const pos = Float32Array.from(src.attributes.position.array);
    const tri = pos.length / 9;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const bary = new Float32Array(pos.length);
    const seed = new Float32Array(pos.length / 3);
    for (let f = 0; f < tri; f++) {
        const s = Math.random();
        for (let v = 0; v < 3; v++) {
            bary[(f * 3 + v) * 3 + v] = 1;
            seed[f * 3 + v] = s;
        }
    }
    geo.setAttribute('aBary', new THREE.BufferAttribute(bary, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uDeep: { value: new THREE.Color(TH.deep) }, uHigh: { value: new THREE.Color(TH.high) },
            uHot: { value: new THREE.Color(TH.hot) },
            uTime: { value: 0 }, uPulse: { value: 1 }, uOpen: { value: 0 },
            uScan: { value: -9 }, uScanInt: { value: 0 }, uInt: { value: 0 }, uNear: { value: 1 },
            uAud: { value: 0 }, uBass: { value: 0 }
        },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        vertexShader: `
      attribute vec3 aBary; attribute float aSeed;
      uniform float uPulse, uOpen, uBass, uTime;
      varying vec3 vBary; varying float vSeed; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        // cada faceta desliza pela sua normal: fenda de luz, sem reconstruir malha
        float slide = uOpen * (0.4 + aSeed*1.1) + uBass*0.22*sin(uTime*3.0 + aSeed*21.0);
        vec3 p = (position + normal * slide) * uPulse;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vBary = aBary; vSeed = aSeed;
        vY = (modelMatrix * vec4(p,1.0)).y;
        gl_Position = projectionMatrix * mv;
      }`,
        fragmentShader: `
      uniform vec3 uDeep, uHigh, uHot;
      uniform float uTime, uScan, uScanInt, uInt, uNear, uAud;
      varying vec3 vBary; varying float vSeed; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        float b = min(min(vBary.x, vBary.y), vBary.z);
        float edge = 1.0 - smoothstep(0.0, 0.045, b);
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
        float flick = 0.78 + 0.22*sin(uTime*2.3 + vSeed*37.0);
        float scan = exp(-abs(vY - uScan)*2.6) * uScanInt;
        vec3 col = mix(uDeep, uHigh, clamp(edge*0.85 + fres*0.5, 0.0, 1.0));
        col = mix(col, uHot, clamp(scan*0.8 + uAud*0.45, 0.0, 1.0));
        float a = edge*0.9*flick + fres*0.16 + scan*0.45 + uAud*0.22*edge;
        gl_FragColor = vec4(col, a * uInt * uNear);
      }`
    });
    tint(mat, 'deep', 'uDeep');
    tint(mat, 'high', 'uHigh');
    tint(mat, 'hot', 'uHot');
    crystal = new THREE.Mesh(geo, mat);
    coreGroup.add(crystal);
    heart = new THREE.Mesh(new THREE.SphereGeometry(0.82, 28, 18), new THREE.ShaderMaterial({
        uniforms: { uDark: { value: new THREE.Color(0x08060c) },
            uEmber: { value: new THREE.Color(TH.ember) }, uInt: { value: 1 } },
        vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vN = normalize(normalMatrix*normal);
        vec4 mv = modelViewMatrix*vec4(position,1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix*mv;
      }`,
        fragmentShader: `
      uniform vec3 uDark, uEmber; uniform float uInt;
      varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.9);
        gl_FragColor = vec4(mix(uDark, uEmber, f*uInt), 1.0);
      }`
    }));
    tint(heart.material, 'ember', 'uEmber');
    coreGroup.add(heart);
    hitSphere = new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 10), new THREE.MeshBasicMaterial({ visible: false }));
    coreGroup.add(hitSphere);
}
/* plasma: pontos deslocados por ruído — grave dilata, médio agita */
function buildPlasma() {
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(Float32Array.from(new THREE.IcosahedronGeometry(CFG.plasmaR, CFG.plasmaDetail).attributes.position.array), 3));
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uDeep: { value: new THREE.Color(TH.deep) }, uHigh: { value: new THREE.Color(TH.high) },
            uHot: { value: new THREE.Color(TH.hot) },
            uTime: { value: 0 }, uPulse: { value: 1 }, uNear: { value: 1 },
            uFreq: { value: CFG.noiseFreq }, uAmp: { value: CFG.noiseAmp }, uSpeed: { value: CFG.noiseSpeed },
            uSize: { value: 3.4 }, uPixel: { value: Math.min(devicePixelRatio, 2) },
            uScan: { value: -9 }, uScanInt: { value: 0 }, uAud: { value: 0 }
        },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: GLSL_NOISE + `
      uniform float uTime, uPulse, uFreq, uAmp, uSpeed, uSize, uPixel, uScan, uScanInt, uAud;
      varying float vDist; varying float vD; varying float vScan;
      void main(){
        vec3 dir = normalize(position);
        float n = snoise(vec3(position.x*uFreq + uTime*uSpeed,
                              position.y*uFreq,
                              position.z*uFreq - uTime*uSpeed));
        float u = 0.5 + n*0.5;
        vD = u;
        vec3 p = (position + dir*(u*uAmp*uPulse)) * uPulse;
        vec4 world = modelMatrix * vec4(p,1.0);
        vScan = exp(-abs(world.y - uScan)*2.6) * uScanInt;
        vec4 mv = viewMatrix * world;
        vDist = -mv.z;
        gl_PointSize = min(uSize*uPixel*(60.0/vDist)*(0.7 + u*0.7 + vScan + uAud*0.9), 9.0*uPixel);
        gl_Position = projectionMatrix * mv;
      }`,
        fragmentShader: `
      uniform vec3 uDeep, uHigh, uHot; uniform float uNear, uAud;
      varying float vDist; varying float vD; varying float vScan;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if(d > 0.5) discard;
        float core = smoothstep(0.5, 0.05, d);
        float fade = smoothstep(24.0, 4.0, vDist);
        vec3 col = mix(uDeep, uHigh, clamp(vD*1.2, 0.0, 1.0));
        col = mix(col, uHot, clamp(vScan*0.7 + uAud*0.5, 0.0, 1.0));
        gl_FragColor = vec4(col, core*fade*(0.26 + vD*0.5 + vScan*0.4 + uAud*0.3)*uNear);
      }`
    });
    tint(mat, 'deep', 'uDeep');
    tint(mat, 'high', 'uHigh');
    tint(mat, 'hot', 'uHot');
    plasma = new THREE.Points(geo, mat);
    coreGroup.add(plasma);
}
/* equalizador diegético: 64 lâminas radiais que leem o espectro na GPU.
   O espectro vive numa textura de 64×1 — um upload por frame, nada por barra. */
function buildEqualizer() {
    const n = CFG.eqBars;
    fftTex = new THREE.DataTexture(audio.fft, n, 1, THREE.LuminanceFormat);
    fftTex.minFilter = fftTex.magFilter = THREE.LinearFilter;
    fftTex.needsUpdate = true;
    const geo = new THREE.BoxGeometry(0.055, 1, 0.055);
    geo.translate(0, 0.5, 0);
    // espectro espelhado nas duas metades do círculo: coroa simétrica em vez de
    // um lado só de graves
    const idx = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const h = i < n / 2 ? i : n - 1 - i;
        idx[i] = (h * 2 + 0.5) / n;
    }
    geo.setAttribute('aI', new THREE.InstancedBufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uFFT: { value: fftTex }, uCol: { value: new THREE.Color(TH.rings) },
            uHot: { value: new THREE.Color(TH.hot) }, uOn: { value: 0 }, uTime: { value: 0 }
        },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `
      attribute float aI;
      uniform sampler2D uFFT; uniform float uOn, uTime;
      varying float vV;
      void main(){
        float v = texture2D(uFFT, vec2(aI, 0.5)).r;
        vV = v;
        vec3 p = position;
        p.y *= 0.10 + v*v*1.05*uOn;
        vec4 world = modelMatrix * instanceMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
        fragmentShader: `
      uniform vec3 uCol, uHot; uniform float uOn;
      varying float vV;
      void main(){
        vec3 col = mix(uCol, uHot, clamp(vV*1.4, 0.0, 1.0));
        gl_FragColor = vec4(col*(0.5 + vV), (0.22 + vV*0.85) * uOn);
      }`
    });
    tint(mat, 'rings', 'uCol');
    tint(mat, 'hot', 'uHot');
    eqMesh = new THREE.InstancedMesh(geo, mat, n);
    const dummy = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2;
        dir.set(Math.cos(a), 0, Math.sin(a));
        dummy.position.copy(dir).multiplyScalar(CFG.eqRadius);
        dummy.quaternion.setFromUnitVectors(up, dir);
        dummy.updateMatrix();
        eqMesh.setMatrixAt(i, dummy.matrix);
    }
    eqMesh.instanceMatrix.needsUpdate = true;
    eqMesh.frustumCulled = false;
    coreGroup.add(eqMesh);
}
const BLADE_VS = `
  attribute float aSeed;
  uniform float uTime, uOpen, uScan, uScanInt, uPulse, uTre;
  varying float vB; varying float vScan; varying float vSpec;
  void main(){
    vec4 ip = instanceMatrix * vec4(position, 1.0);
    vec3 radial = normalize(instanceMatrix[3].xyz + vec3(0.0,0.0,1e-5));
    ip.xyz += radial * uOpen;
    vec4 world = modelMatrix * ip;
    vec3 n = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vec3 viewDir = normalize(cameraPosition - world.xyz);
    float lit = 0.34 + 0.66 * abs(dot(n, normalize(-world.xyz)));
    vSpec = pow(1.0 - abs(dot(n, viewDir)), 3.0);
    vScan = exp(-abs(world.y - uScan)*2.2) * uScanInt;
    // agudo: cintilação por lâmina, cada uma na sua fase
    float shim = uTre * (0.5 + 0.5*sin(uTime*26.0 + aSeed*44.0));
    vB = lit * (0.82 + 0.18*sin(uTime*1.25 + aSeed*19.0)) + vSpec*0.7 + vScan*1.6
       + uPulse*0.5 + shim*1.1;
    gl_Position = projectionMatrix * viewMatrix * world;
  }`;
const BLADE_FS = `
  uniform vec3 uCol, uHot;
  varying float vB; varying float vScan; varying float vSpec;
  void main(){
    vec3 col = mix(uCol, uHot, clamp(vScan + vSpec*0.55, 0.0, 1.0));
    gl_FragColor = vec4(col * clamp(0.38 + vB, 0.0, 2.6), 1.0);
  }`;
function buildAstrolabe() {
    const dummy = new THREE.Object3D();
    CFG.rings.forEach((spec, i) => {
        const g = new THREE.Group();
        const geo = new THREE.BoxGeometry(spec.len, 0.03, 0.21);
        const seeds = new Float32Array(spec.count);
        for (let k = 0; k < spec.count; k++)
            seeds[k] = Math.random();
        geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uCol: { value: new THREE.Color(TH.blade) }, uHot: { value: new THREE.Color(TH.hot) },
                uTime: { value: 0 }, uOpen: { value: 0 }, uScan: { value: -9 },
                uScanInt: { value: 0 }, uPulse: { value: 0 }, uTre: { value: 0 }
            },
            vertexShader: BLADE_VS, fragmentShader: BLADE_FS
        });
        tint(mat, 'blade', 'uCol');
        tint(mat, 'hot', 'uHot');
        const mesh = new THREE.InstancedMesh(geo, mat, spec.count);
        for (let k = 0; k < spec.count; k++) {
            const a = k / spec.count * Math.PI * 2;
            dummy.position.set(Math.cos(a) * spec.r, Math.sin(a) * spec.r, 0);
            dummy.rotation.set(0, 0, a);
            dummy.updateMatrix();
            dummy.matrix.multiply(new THREE.Matrix4().makeRotationX(0.42 + (k % 2) * 0.12));
            mesh.setMatrixAt(k, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        g.add(mesh);
        bladeMeshes.push(mesh);
        const pts = [];
        for (let s = 0; s <= 180; s++) {
            const a = s / 180 * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * spec.r, Math.sin(a) * spec.r, 0));
        }
        const key = i % 2 ? 'ringAlt' : 'rings';
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tint(new THREE.LineDashedMaterial({ color: TH[key], transparent: true,
            opacity: 0.30, dashSize: 0.16, gapSize: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false }), key));
        line.computeLineDistances();
        g.add(line);
        circles.push(line);
        g.rotation.x = Math.PI * (0.10 + i * 0.19);
        g.rotation.y = Math.PI * (i * 0.24);
        g.userData.spin = {
            x: (Math.random() - 0.5) * CFG.spinRings * 0.4,
            y: (Math.random() - 0.5) * CFG.spinRings * 0.4,
            z: (0.35 + Math.random() * 0.4) * CFG.spinRings * (i % 2 ? 1 : -1)
        };
        coreGroup.add(g);
        ringGroups.push(g);
    });
}
function buildSparks() {
    CFG.rings.forEach((spec, i) => {
        const n = CFG.sparkPerRing, tl = CFG.sparkTrail, total = n * tl;
        const posA = new Float32Array(total * 3);
        const aA = new Float32Array(total), aSpd = new Float32Array(total), aOff = new Float32Array(total);
        for (let k = 0; k < n; k++) {
            const a0 = Math.random() * Math.PI * 2;
            const sp = (0.5 + Math.random() * 0.85) * CFG.sparkSpeed * (k % 2 ? 1 : -1);
            for (let q = 0; q < tl; q++) {
                const idx = k * tl + q;
                aA[idx] = a0;
                aSpd[idx] = sp;
                aOff[idx] = q;
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(posA, 3));
        geo.setAttribute('aA', new THREE.BufferAttribute(aA, 1));
        geo.setAttribute('aSpd', new THREE.BufferAttribute(aSpd, 1));
        geo.setAttribute('aOff', new THREE.BufferAttribute(aOff, 1));
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uCol: { value: new THREE.Color(TH.high) }, uTime: { value: 0 }, uR: { value: spec.r },
                uSize: { value: 7.0 }, uPixel: { value: Math.min(devicePixelRatio, 2) },
                uMap: { value: SPRITE }, uInt: { value: 1 }
            },
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `
        attribute float aA; attribute float aSpd; attribute float aOff;
        uniform float uTime, uR, uSize, uPixel;
        varying float vA;
        void main(){
          float ang = aA + uTime*aSpd - aOff*0.055*sign(aSpd);
          vec4 mv = modelViewMatrix * vec4(cos(ang)*uR, sin(ang)*uR, 0.0, 1.0);
          vA = 1.0 - aOff*0.23;
          gl_PointSize = uSize*uPixel*(60.0/-mv.z)*vA*0.28;
          gl_Position = projectionMatrix * mv;
        }`,
            fragmentShader: `
        uniform sampler2D uMap; uniform vec3 uCol; uniform float uInt;
        varying float vA;
        void main(){
          vec4 s = texture2D(uMap, gl_PointCoord);
          gl_FragColor = vec4(uCol, s.a * vA * vA * uInt);
        }`
        });
        tint(mat, 'high', 'uCol');
        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        ringGroups[i].add(pts);
        sparkMats.push(mat);
    });
}
function buildArcs() {
    arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CFG.arcCount * CFG.arcSegs * 2 * 3), 3));
    arcMat = tint(new THREE.LineBasicMaterial({ color: TH.high, transparent: true, opacity: 0.75,
        blending: THREE.AdditiveBlending, depthWrite: false }), 'high');
    coreGroup.add(new THREE.LineSegments(arcGeo, arcMat));
    regenArcs();
}
let arcClock = 0;
function regenArcs() {
    const p = arcGeo.attributes.position.array;
    let k = 0;
    for (let a = 0; a < CFG.arcCount; a++) {
        const dir = randDir();
        const start = dir.clone().multiplyScalar(CFG.crystalR * 1.02);
        const end = dir.clone().applyAxisAngle(randDir(), 0.22 + Math.random() * 0.5)
            .multiplyScalar(2.9 + Math.random() * 0.4);
        let prev = start;
        for (let s = 1; s <= CFG.arcSegs; s++) {
            const t = s / CFG.arcSegs;
            const pt = start.clone().lerp(end, t);
            const jit = 0.2 * Math.sin(t * Math.PI);
            pt.x += (Math.random() - 0.5) * jit;
            pt.y += (Math.random() - 0.5) * jit;
            pt.z += (Math.random() - 0.5) * jit;
            p[k++] = prev.x;
            p[k++] = prev.y;
            p[k++] = prev.z;
            p[k++] = pt.x;
            p[k++] = pt.y;
            p[k++] = pt.z;
            prev = pt;
        }
    }
    arcGeo.setDrawRange(0, CFG.arcCount * CFG.arcSegs * 2);
    arcGeo.attributes.position.needsUpdate = true;
}
function buildStrip() {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 64;
    const g = c.getContext('2d');
    g.font = '600 34px ui-monospace,"IBM Plex Mono",monospace';
    g.fillStyle = '#ffffff';
    g.textBaseline = 'middle';
    const txt = CFG.stripText, pitch = 2048 / txt.length;
    for (let i = 0; i < txt.length; i++)
        g.fillText(txt[i], i * pitch + pitch * 0.18, 34);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = 2;
    strip = new THREE.Mesh(new THREE.CylinderGeometry(5.75, 5.75, 0.26, 96, 1, true), tint(new THREE.MeshBasicMaterial({ map: tex, color: TH.high, transparent: true, opacity: 0.24,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 'high'));
    strip.rotation.x = Math.PI / 2 + 0.08;
    scene.add(strip);
}
function buildScanDisc() {
    scanDisc = new THREE.Mesh(new THREE.RingGeometry(0.3, 10.5, 72, 1), new THREE.ShaderMaterial({
        uniforms: { uCol: { value: new THREE.Color(TH.hot) }, uInt: { value: 0 } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        vertexShader: `
      varying float vR;
      void main(){
        vR = length(position.xy)/10.5;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,
        fragmentShader: `
      uniform vec3 uCol; uniform float uInt; varying float vR;
      void main(){
        float band = smoothstep(0.0,0.18,vR)*(1.0-smoothstep(0.62,1.0,vR));
        float ring = exp(-pow((vR-0.72)*13.0, 2.0));
        gl_FragColor = vec4(uCol, (band*0.10 + ring*0.55) * uInt);
      }`
    }));
    tint(scanDisc.material, 'hot', 'uCol');
    scanDisc.rotation.x = -Math.PI / 2;
    scanDisc.visible = false;
    scene.add(scanDisc);
}
function fireScan() { scanT = 0; }
function buildWaves() {
    for (let i = 0; i < 3; i++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.ShaderMaterial({
            uniforms: { uColor: { value: new THREE.Color(TH.ringAlt) }, uInt: { value: 0 } },
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
            vertexShader: `
        varying vec3 vN; varying vec3 vV;
        void main(){
          vN = normalize(normalMatrix*normal);
          vec4 mv = modelViewMatrix*vec4(position,1.0);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix*mv;
        }`,
            fragmentShader: `
        uniform vec3 uColor; uniform float uInt; varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 4.0);
          gl_FragColor = vec4(uColor, f*uInt);
        }`
        }));
        tint(m.material, 'ringAlt', 'uColor');
        m.visible = false;
        m.userData.t = 0;
        m.userData.amp = 1;
        scene.add(m);
        waves.push(m);
    }
}
function fireWave(amp) {
    const w = waves.find(x => !x.visible) || waves[0];
    w.visible = true;
    w.userData.t = 0;
    w.userData.amp = amp;
    w.scale.setScalar(2.2);
}
function updateWaves(dt) {
    for (const w of waves) {
        if (!w.visible)
            continue;
        w.userData.t += dt;
        const p = w.userData.t / 1.3;
        if (p >= 1) {
            w.visible = false;
            w.material.uniforms.uInt.value = 0;
            continue;
        }
        w.scale.setScalar(2.2 + p * 7.6);
        w.material.uniforms.uInt.value = 0.5 * w.userData.amp * (1 - p) * (1 - p);
    }
}
function buildConstellation() {
    const n = CFG.constelPts;
    constelBase = new Float32Array(n * 3);
    const p = new Float32Array(n * 3);
    constelVel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
        const r = 6.6 + Math.random() * 4.0, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        constelBase[i * 3] = p[i * 3] = r * Math.sin(ph) * Math.cos(th);
        constelBase[i * 3 + 1] = p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.76;
        constelBase[i * 3 + 2] = p[i * 3 + 2] = r * Math.cos(ph);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(p, 3));
    constel = new THREE.Points(pg, tint(new THREE.PointsMaterial({ color: TH.constel, size: 0.14,
        map: SPRITE, transparent: true, opacity: 0.82,
        blending: THREE.AdditiveBlending, depthWrite: false }), 'constel'));
    scene.add(constel);
    const pairs = [], slack = CFG.linkDist + CFG.linkSlack;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
            const dx = constelBase[i * 3] - constelBase[j * 3];
            const dy = constelBase[i * 3 + 1] - constelBase[j * 3 + 1];
            const dz = constelBase[i * 3 + 2] - constelBase[j * 3 + 2];
            if (dx * dx + dy * dy + dz * dz < slack * slack)
                pairs.push(i, j);
        }
    linkPairs = Int32Array.from(pairs);
    const maxLinks = Math.max(1, linkPairs.length / 2);
    linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
    linkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
    scene.add(new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ vertexColors: true,
        transparent: true, opacity: CFG.linkOpacity,
        blending: THREE.AdditiveBlending, depthWrite: false })));
}
let linkCount = 0;
function updateLinks(t, boost) {
    const pos = constel.geometry.attributes.position.array;
    const lp = linkGeo.attributes.position.array;
    const lc = linkGeo.attributes.color.array;
    const maxD = CFG.linkDist, base = new THREE.Color(TH.constel);
    let li = 0, ci = 0;
    linkCount = 0;
    for (let q = 0; q < linkPairs.length; q += 2) {
        const i = linkPairs[q], j = linkPairs[q + 1];
        const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d >= maxD)
            continue;
        const b = (1 - d / maxD) * (0.28 + 0.72 * Math.abs(Math.sin(t * 2.0 + (i * 13 + j) * 0.7)))
            * (1 + boost * 0.7);
        lp[li++] = pos[i * 3];
        lp[li++] = pos[i * 3 + 1];
        lp[li++] = pos[i * 3 + 2];
        lp[li++] = pos[j * 3];
        lp[li++] = pos[j * 3 + 1];
        lp[li++] = pos[j * 3 + 2];
        for (let k = 0; k < 2; k++) {
            lc[ci++] = base.r * b;
            lc[ci++] = base.g * b;
            lc[ci++] = base.b * b;
        }
        linkCount++;
    }
    linkGeo.setDrawRange(0, linkCount * 2);
    linkGeo.attributes.position.needsUpdate = true;
    linkGeo.attributes.color.needsUpdate = true;
}
function hexTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.strokeStyle = '#ffffff';
    g.lineWidth = 4;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + Math.PI / 6;
        const x = 32 + Math.cos(a) * 22, y = 32 + Math.sin(a) * 22;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.2)';
    g.fill();
    return new THREE.CanvasTexture(c);
}
function buildGlyphs() {
    const n = Math.min(CFG.glyphCount, CFG.constelPts);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    glyphs = new THREE.Points(geo, tint(new THREE.PointsMaterial({ map: hexTexture(), size: 0.58,
        color: TH.constel, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false }), 'constel'));
    glyphs.userData.n = n;
    scene.add(glyphs);
}
function updateGlyphs(t) {
    const src = constel.geometry.attributes.position.array;
    const dst = glyphs.geometry.attributes.position.array;
    const n = glyphs.userData.n, step = Math.floor(CFG.constelPts / n);
    for (let i = 0; i < n; i++) {
        const j = (i * step) * 3;
        dst[i * 3] = src[j];
        dst[i * 3 + 1] = src[j + 1];
        dst[i * 3 + 2] = src[j + 2];
    }
    glyphs.geometry.attributes.position.needsUpdate = true;
    glyphs.rotation.copy(constel.rotation);
    glyphs.material.opacity = 0.58 + 0.24 * Math.sin(t * 1.1);
}
function buildDust() {
    const n = CFG.dustCount, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
        const r = 13 + Math.random() * 20, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        p[i * 3] = r * Math.sin(ph) * Math.cos(th);
        p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        p[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    dust = new THREE.Points(g, tint(new THREE.PointsMaterial({ color: TH.dust, size: 0.12,
        map: SPRITE, transparent: true, opacity: 0.28,
        blending: THREE.AdditiveBlending, depthWrite: false }), 'dust'));
    scene.add(dust);
}
function postFX() {
    if (!THREE.EffectComposer) {
        toast('pós-processamento indisponível — a render sem bloom');
        return;
    }
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), CFG.bloomStrength, CFG.bloomRadius, CFG.bloomThreshold);
    composer.addPass(bloomPass);
    compPass = new THREE.ShaderPass({
        uniforms: {
            tDiffuse: { value: null }, uTime: { value: 0 }, uWarp: { value: 0 },
            uAb: { value: CFG.aberration }, uGrain: { value: CFG.grain }, uVig: { value: CFG.vignette }
        },
        vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime, uAb, uGrain, uVig, uWarp;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec2 c = vUv - 0.5;
        float r = length(c);
        vec2 uv = vUv + c*uWarp*(r*r - 0.12);
        vec2 off = normalize(c + 1e-6)*uAb*(r*r*2.2 + 0.15);
        vec3 col;
        col.r = texture2D(tDiffuse, uv+off).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv-off).b;
        col += (hash(vUv*vec2(1920.0,1080.0) + uTime*57.0) - 0.5)*uGrain;
        col *= 0.985 + 0.015*sin(vUv.y*1300.0);
        col *= 1.0 - uVig*smoothstep(0.34, 0.98, r);
        gl_FragColor = vec4(col, 1.0);
      }`
    });
    compPass.renderToScreen = true;
    composer.addPass(compPass);
}
function applyTheme(i, quiet) {
    TH = THEMES[i];
    themed.forEach(({ mat, key, uni }) => {
        if (uni)
            mat.uniforms[uni].value.set(TH[key]);
        else if (mat.color)
            mat.color.set(TH[key]);
    });
    scene.fog.color.set(TH.bg);
    renderer.setClearColor(TH.bg, 1);
    const rs = document.documentElement.style;
    rs.setProperty('--bg', hex(TH.bg));
    rs.setProperty('--accent', TH.css);
    rs.setProperty('--accent2', TH.css2);
    rs.setProperty('--dim', TH.dim);
    rs.setProperty('--txt', TH.txt);
    rs.setProperty('--line', rgba(TH.blade, 0.26));
    rs.setProperty('--glow', rgba(TH.blade, 0.40));
    document.querySelectorAll('#themes button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.th === i)));
    if (!quiet)
        toast('espectro ' + TH.name);
}
/* ═══ 5 · COMANDOS ═════════════════════════════════════════════════════════ */
function pulse(ms) {
    pulseUntil = performance.now() + (ms || 600);
    fireWave(1);
}
function setView(i, quiet) {
    viewIdx = (i + VIEWS.length) % VIEWS.length;
    const v = VIEWS[viewIdx];
    orb.tDist = v.dist;
    orb.tPitch = v.pitch;
    orb.tFov = v.fov;
    document.getElementById('viewName').textContent = v.name;
    if (!quiet)
        toast('enquadramento ' + v.name);
}
function toggleOpen() {
    openTarget = openTarget > 0 ? 0 : 1;
    document.getElementById('bOpen').setAttribute('aria-pressed', String(openTarget > 0));
}
function touched() {
    lastInput = clock.getElapsedTime();
    hudTouch = lastInput;
    document.getElementById('hud').classList.remove('idle');
    if (cinema)
        cinema = false;
}
function markAudioButtons() {
    const set = (id, on) => document.getElementById(id).setAttribute('aria-pressed', String(on));
    set('bMusic', audio.mode === 'gen' || audio.mode === 'sistema');
    set('bSystem', audio.mode === 'sistema');
    set('bMic', audio.mode === 'mic');
    set('bFile', audio.mode === 'file');
}
let presenca = { tocando: false, titulo: null, artista: null };
function rotuloDaFaixa() {
    if (!presenca.tocando)
        return '';
    const titulo = (presenca.titulo ?? '').trim();
    if (!titulo)
        return 'spotify a tocar';
    const artista = (presenca.artista ?? '').trim();
    return artista ? `${titulo} · ${artista}` : titulo;
}
function pintarBotaoMusica() {
    const alvo = document.getElementById('musicName');
    if (!alvo)
        return;
    const faixa = rotuloDaFaixa();
    alvo.textContent = faixa ? `♪ ${faixa}` : '♪ música';
    document.getElementById('bMusic').title = faixa
        ? `${faixa} — o núcleo acompanha partilhando o som do PC`
        : 'partitura generativa do Baluarte';
}
function ouvirPresencaMusical() {
    addEventListener('message', (event) => {
        if (event.origin !== location.origin || event.source !== window.parent)
            return;
        const dado = event.data;
        if (dado === null || typeof dado !== 'object')
            return;
        const registo = dado;
        if (registo.source !== 'baluarte-presenca-musical')
            return;
        presenca = {
            tocando: registo.tocando === true,
            titulo: typeof registo.titulo === 'string' ? registo.titulo : null,
            artista: typeof registo.artista === 'string' ? registo.artista : null,
        };
        pintarBotaoMusica();
    });
}
function bind() {
    const stageEl = document.getElementById('stage');
    addEventListener('mousemove', e => {
        mouseX = e.clientX;
        target.x = e.clientX / innerWidth - 0.5;
        target.y = e.clientY / innerHeight - 0.5;
        if (orb.drag) {
            orb.tYaw -= (e.clientX - orb.lx) * 0.006;
            orb.tPitch = Math.max(-1.15, Math.min(1.15, orb.tPitch + (e.clientY - orb.ly) * 0.005));
            orb.lx = e.clientX;
            orb.ly = e.clientY;
        }
        touched();
    });
    stageEl.addEventListener('mousedown', e => {
        orb.drag = true;
        orb.lx = e.clientX;
        orb.ly = e.clientY;
        stageEl.classList.add('drag');
        touched();
    });
    addEventListener('mouseup', e => {
        if (orb.drag && Math.abs(e.clientX - orb.lx) < 4 && Math.abs(e.clientY - orb.ly) < 4)
            clickCore(e);
        orb.drag = false;
        stageEl.classList.remove('drag');
    });
    addEventListener('wheel', e => {
        orb.tDist = Math.max(CFG.orbitMin, Math.min(CFG.orbitMax, orb.tDist * (1 + e.deltaY * 0.0012)));
        touched();
    }, { passive: true });
    addEventListener('touchstart', e => {
        touched();
        if (e.touches.length === 2) {
            orb.pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        }
        else {
            orb.lx = e.touches[0].clientX;
            orb.ly = e.touches[0].clientY;
        }
    }, { passive: true });
    addEventListener('touchmove', e => {
        if (e.touches.length === 2 && orb.pinch) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            orb.tDist = Math.max(CFG.orbitMin, Math.min(CFG.orbitMax, orb.tDist * (orb.pinch / d)));
            orb.pinch = d;
            return;
        }
        const t0 = e.touches[0];
        orb.tYaw -= (t0.clientX - orb.lx) * 0.006;
        orb.tPitch = Math.max(-1.15, Math.min(1.15, orb.tPitch + (t0.clientY - orb.ly) * 0.005));
        orb.lx = t0.clientX;
        orb.ly = t0.clientY;
        mouseX = t0.clientX;
        target.x = t0.clientX / innerWidth - 0.5;
        target.y = t0.clientY / innerHeight - 0.5;
    }, { passive: true });
    addEventListener('touchend', () => { orb.pinch = 0; }, { passive: true });
    addEventListener('resize', resize);
    /* som */
    const fileInput = document.getElementById('file');
    document.getElementById('bMusic').onclick = () => {
        touched();
        if (audio.mode === 'sistema') {
            audio.silence();
            markAudioButtons();
            toast('silêncio');
            return;
        }
        if (presenca.tocando) {
            capturarSistema(rotuloDaFaixa());
            return;
        }
        const on = audio.toggleGenerative();
        markAudioButtons();
        toast(on ? 'partitura generativa a tocar' : 'silêncio');
    };
    document.getElementById('bSystem').onclick = () => { touched(); capturarSistema(rotuloDaFaixa()); };
    document.getElementById('bFile').onclick = () => { fileInput.click(); touched(); };
    fileInput.onchange = () => {
        const f = fileInput.files && fileInput.files[0];
        if (f)
            loadTrack(f);
    };
    document.getElementById('bMic').onclick = () => {
        audio.useMic().then(on => {
            markAudioButtons();
            toast(on ? 'microfone aberto — o núcleo está a ouvir' : 'microfone fechado');
        }).catch(() => toast('microfone recusado'));
        touched();
    };
    ['dragenter', 'dragover'].forEach(ev => addEventListener(ev, e => {
        e.preventDefault();
        document.body.classList.add('dropping');
    }));
    ['dragleave', 'drop'].forEach(ev => addEventListener(ev, e => {
        if (ev === 'drop')
            e.preventDefault();
        document.body.classList.remove('dropping');
    }));
    addEventListener('drop', e => {
        const f = e.dataTransfer?.files[0];
        if (f && /audio|video|ogg|mpeg/.test(f.type))
            loadTrack(f);
        else if (f)
            toast('formato não reconhecido');
    });
    document.getElementById('bPulse').onclick = () => { pulse(700); touched(); };
    document.getElementById('bScan').onclick = () => { fireScan(); touched(); };
    document.getElementById('bOpen').onclick = () => { toggleOpen(); touched(); };
    document.getElementById('bView').onclick = () => { setView(viewIdx + 1); touched(); };
    const bs = document.getElementById('bSpin');
    bs.onclick = () => {
        spinning = !spinning;
        bs.setAttribute('aria-pressed', String(spinning));
        touched();
    };
    document.getElementById('bShot').onclick = savePNG;
    document.querySelectorAll('#themes button').forEach(b => b.onclick = () => { applyTheme(+b.dataset.th); touched(); });
    addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if (k === ' ') {
            e.preventDefault();
            pulse(700);
        }
        else if (k === 's')
            fireScan();
        else if (k === 'x')
            toggleOpen();
        else if (k === 'v')
            setView(viewIdx + 1);
        else if (k === 'r')
            bs.click();
        else if (k === 'm')
            document.getElementById('bMusic').click();
        else if (k === 'o')
            document.getElementById('bFile').click();
        else if (k === 'i')
            document.getElementById('bMic').click();
        else if (k === 'a')
            document.getElementById('bSystem').click();
        else if (k === 'p')
            savePNG();
        else if (k === 'h') {
            hudOn = !hudOn;
            document.getElementById('hud').classList.toggle('off', !hudOn);
        }
        else if (k === 'f') {
            document.fullscreenElement ? document.exitFullscreen()
                : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        }
        else if (k >= '1' && k <= '3')
            applyTheme(+k - 1);
        else
            return;
        touched();
    });
    setInterval(() => { if (audio.mode === 'off' && Math.random() < 0.35)
        pulse(420); }, 8000);
    setInterval(() => { if (scanT < 0)
        fireScan(); }, CFG.scanEvery * 1000);
}
function capturarSistema(faixa) {
    audio.captureSystem().then(on => {
        markAudioButtons();
        if (!on) {
            toast('silêncio');
            return;
        }
        toast(faixa ? `a acompanhar · ${faixa}` : 'a acompanhar o som do pc');
    }).catch((erro) => {
        const causa = erro instanceof Error ? erro.message : '';
        if (causa === 'SEM_AUDIO')
            toast('escolha uma ABA e marque "partilhar áudio"');
        else if (causa === 'SEM_CAPTURA')
            toast('este navegador não partilha áudio');
        else
            toast('partilha cancelada');
    });
}
function loadTrack(f) {
    audio.playFile(f).then(name => {
        markAudioButtons();
        toast('a tocar · ' + name);
    }).catch(() => toast('não foi possível ler o ficheiro'));
}
function clickCore(e) {
    ndc.x = (e.clientX / innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    if (ray.intersectObject(hitSphere).length)
        pulse(900);
}
function savePNG() {
    if (composer)
        composer.render();
    else
        renderer.render(scene, camera);
    const a = document.createElement('a');
    a.href = renderer.domElement.toDataURL('image/png');
    a.download = 'jarvis-astrolabio-v7.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('quadro exportado');
}
function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (composer)
        composer.setSize(innerWidth, innerHeight);
    if (bloomPass)
        bloomPass.setSize(innerWidth / 2, innerHeight / 2);
    const px = Math.min(devicePixelRatio, perf.quality === 2 ? 2 : 1);
    plasma.material.uniforms.uPixel.value = px;
    sparkMats.forEach(m => m.uniforms.uPixel.value = px);
}
/* ═══ 6 · LOOP ═════════════════════════════════════════════════════════════ */
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsedTime();
    frame++;
    audio.update(dt);
    const A = audio.bands;
    const live = audio.mode === 'off' ? 0 : 1;
    if (audio.beat) {
        pulseUntil = performance.now() + 260;
        fireWave(0.55 + A.bass * 0.7);
    }
    const boost = performance.now() < pulseUntil ? 1 : 0;
    energy += (boost - energy) * Math.min(1, dt * 6);
    const bootP = Math.min(1, t / CFG.bootDur);
    const boot = 1 - Math.pow(1 - bootP, 3);
    if (!booted && bootP >= 1) {
        booted = true;
        fireWave(1);
        fireScan();
    }
    if (scanT >= 0) {
        scanT += dt;
        const sp = scanT / CFG.scanDur;
        if (sp >= 1) {
            scanT = -1;
            scanInt = 0;
            scanY = -99;
            scanDisc.visible = false;
        }
        else {
            scanY = -7.5 + sp * 15;
            scanInt = Math.sin(sp * Math.PI);
            scanDisc.visible = true;
            scanDisc.position.y = scanY;
            scanDisc.material.uniforms.uInt.value = scanInt;
        }
    }
    /* dança: o interior segue as bandas */
    const pulseS = (1 + Math.sin(t * CFG.pulseSpeed) * CFG.pulseAmt + boost * 0.04 + A.bass * 0.10)
        * (0.4 + 0.6 * boot);
    const near = Math.max(0.32, Math.min(1, (orb.dist - 6.5) / 8.0));
    openAmt += (openTarget - openAmt) * Math.min(1, dt * 3.2);
    const cu = crystal.material.uniforms;
    cu.uTime.value = t;
    cu.uPulse.value = pulseS;
    cu.uInt.value = boot;
    cu.uOpen.value = openAmt * 0.34 + energy * 0.20 + A.mid * 0.26;
    cu.uScan.value = scanY;
    cu.uScanInt.value = scanInt;
    cu.uNear.value = near;
    cu.uAud.value = A.level * 0.9;
    cu.uBass.value = A.bass;
    const pu = plasma.material.uniforms;
    pu.uTime.value = t;
    pu.uPulse.value = pulseS;
    pu.uNear.value = near * boot;
    pu.uScan.value = scanY;
    pu.uScanInt.value = scanInt;
    pu.uAmp.value = CFG.noiseAmp * (1 + A.bass * 1.9 + A.mid * 0.5);
    pu.uSpeed.value = CFG.noiseSpeed * (1 + A.mid * 1.6 + A.treble * 0.8);
    pu.uAud.value = A.level * 0.85;
    heart.scale.setScalar(pulseS * (1 + A.bass * 0.22));
    heart.material.uniforms.uInt.value =
        0.55 + 0.45 * Math.sin(t * CFG.pulseSpeed * 0.8) + boost * 0.5 + A.bass * 0.8;
    if (eqMesh) {
        fftTex.needsUpdate = true;
        const eu = eqMesh.material.uniforms;
        eu.uOn.value += (live * boot - eu.uOn.value) * Math.min(1, dt * 4);
        eu.uTime.value = t;
        eqMesh.rotation.y = t * 0.06;
    }
    if (bloomPass) {
        bloomPass.strength = CFG.bloomStrength * (0.4 + 0.6 * near) + boost * 0.35 + A.level * 0.45;
    }
    bladeMeshes.forEach(m => {
        const u = m.material.uniforms;
        u.uTime.value = t;
        u.uOpen.value = openAmt * 1.15;
        u.uScan.value = scanY;
        u.uScanInt.value = scanInt;
        u.uPulse.value = energy;
        u.uTre.value = A.treble * 0.8;
    });
    sparkClock += dt * (1 + A.treble * 2.6 + A.level * 0.8);
    sparkMats.forEach(m => {
        m.uniforms.uTime.value = sparkClock;
        m.uniforms.uInt.value = boot * (0.6 + 0.4 * near) * (1 + A.treble * 0.7);
    });
    circles.forEach((l, i) => l.material.opacity = (0.30 - i * 0.03) * boot * (1 + A.mid * 0.5));
    arcClock += dt;
    if (arcClock > CFG.arcLife * (1 - A.level * 0.5)) {
        arcClock = 0;
        regenArcs();
    }
    arcMat.opacity = ((0.2 + boost * 0.5 + A.treble * 0.4) + 0.6 * (1 - arcClock / CFG.arcLife))
        * (0.4 + 0.6 * near) * boot;
    updateWaves(dt);
    strip.rotation.y += dt * (0.1 + A.mid * 0.25);
    strip.material.map.offset.x += dt * (0.022 + A.level * 0.05);
    strip.material.opacity = 0.24 * boot * (0.55 + 0.45 * near);
    if (spinning) {
        const sp = 1 + A.level * 1.3;
        coreGroup.rotation.y += dt * CFG.spinCore * sp;
        coreGroup.rotation.x = Math.sin(t * 0.15) * 0.08;
        ringGroups.forEach(g => {
            const s = g.userData.spin;
            g.rotation.x += dt * s.x * sp;
            g.rotation.y += dt * s.y * sp;
            g.rotation.z += dt * s.z * sp;
        });
        dust.rotation.y += dt * CFG.spinDust;
        dust.rotation.x += dt * CFG.spinDust * 0.4;
        constel.rotation.y += dt * 0.035;
    }
    mw.set(target.x * 2, -target.y * 2, 0.5).unproject(camera).sub(camera.position).normalize();
    const world = camera.position.clone().add(mw.multiplyScalar(camera.position.length()));
    const cp = constel.geometry.attributes.position.array, n = CFG.constelPts;
    for (let i = 0; i < n; i++) {
        const ix = i * 3;
        const dx = cp[ix] - world.x, dy = cp[ix + 1] - world.y, dz = cp[ix + 2] - world.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        if (d < CFG.repelRadius && mouseX > -900) {
            const f = (1 - d / CFG.repelRadius) * CFG.repelForce;
            constelVel[ix] += (dx / d) * f * dt;
            constelVel[ix + 1] += (dy / d) * f * dt;
            constelVel[ix + 2] += (dz / d) * f * dt;
        }
        constelVel[ix] += (constelBase[ix] - cp[ix]) * 2.2 * dt;
        constelVel[ix + 1] += (constelBase[ix + 1] - cp[ix + 1]) * 2.2 * dt;
        constelVel[ix + 2] += (constelBase[ix + 2] - cp[ix + 2]) * 2.2 * dt;
        constelVel[ix] *= 0.9;
        constelVel[ix + 1] *= 0.9;
        constelVel[ix + 2] *= 0.9;
        cp[ix] += constelVel[ix];
        cp[ix + 1] += constelVel[ix + 1];
        cp[ix + 2] += constelVel[ix + 2];
    }
    constel.geometry.attributes.position.needsUpdate = true;
    updateLinks(t, boost + A.mid * 0.6);
    updateGlyphs(t);
    /* câmara */
    if (!cinema && t - lastInput > CFG.idleCinema)
        cinema = true;
    if (t - hudTouch > CFG.hudIdle)
        document.getElementById('hud').classList.add('idle');
    const autoSpin = (cinema ? 0.055 : 0) + VIEWS[viewIdx].auto;
    if (autoSpin)
        orb.tYaw += dt * autoSpin;
    if (cinema)
        orb.tPitch += Math.sin(t * 0.11) * dt * 0.05;
    orb.yaw += (orb.tYaw - orb.yaw) * 0.07;
    orb.pitch += (orb.tPitch - orb.pitch) * 0.07;
    orb.dist += (orb.tDist - orb.dist) * 0.06;
    if (Math.abs(orb.fov - orb.tFov) > 0.01) {
        orb.fov += (orb.tFov - orb.fov) * 0.07;
        camera.fov = orb.fov;
        camera.updateProjectionMatrix();
    }
    cur.x += (target.x - cur.x) * 0.045;
    cur.y += (target.y - cur.y) * 0.045;
    const cpi = Math.cos(orb.pitch);
    camera.position.set(Math.sin(orb.yaw) * cpi * orb.dist + cur.x * 2.2 * CFG.parallax, Math.sin(orb.pitch) * orb.dist - cur.y * 1.7 * CFG.parallax, Math.cos(orb.yaw) * cpi * orb.dist);
    camera.lookAt(0, 0, 0);
    if (compPass) {
        compPass.uniforms.uTime.value = t;
        compPass.uniforms.uWarp.value = energy * 0.042 + A.bass * 0.03;
    }
    perf.acc += dt;
    perf.n++;
    if (perf.acc > 1) {
        perf.fps = Math.round(perf.n / perf.acc);
        perf.low = perf.fps < 40 ? perf.low + 1 : 0;
        perf.high = perf.fps > 50 ? perf.high + 1 : 0;
        if (perf.low >= 3 && perf.quality > 0) {
            perf.quality--;
            perf.low = 0;
            if (perf.quality === 1) {
                renderer.setPixelRatio(1);
                resize();
            }
            else {
                CFG.linkDist = 1.9;
                CFG.arcCount = 2;
                dust.visible = false;
            }
        }
        else if (perf.high >= 4 && perf.quality < 2) {
            perf.quality++;
            perf.high = 0;
            if (perf.quality === 1) {
                CFG.linkDist = perf.linkD;
                CFG.arcCount = perf.arcs;
                dust.visible = true;
            }
            else {
                renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
                resize();
            }
        }
        perf.acc = 0;
        perf.n = 0;
    }
    if (composer)
        composer.render();
    else
        renderer.render(scene, camera);
}
/* ═══ 7 · ARRANQUE ═════════════════════════════════════════════════════════ */
ouvirPresencaMusical();
pintarBotaoMusica();
audio.onEnded = () => { markAudioButtons(); toast('partilha encerrada'); };
function avisarPai(status, motivo) {
    try {
        if (window.parent === window)
            return;
        window.parent.postMessage(motivo ? { source: 'jarvis-nucleo-v7', status, reason: motivo } : { source: 'jarvis-nucleo-v7', status }, location.origin);
    }
    catch { /* sem pai acessível: o artefato standalone segue igual */ }
}
(function boot(tries) {
    if (typeof THREE !== 'undefined') {
        try {
            init();
            setView(0, true);
            animate();
            avisarPai('ready');
        }
        catch (e) {
            const el = document.getElementById('err');
            el.style.display = 'block';
            el.textContent = 'erro: ' + e.message;
            console.error(e);
            avisarPai('failed', typeof e?.message === 'string' ? e.message : 'erro no arranque');
        }
    }
    else if (tries < 90) {
        setTimeout(() => boot(tries + 1), 60);
    }
    else {
        document.getElementById('loading').textContent = 'falha ao carregar three.js';
        avisarPai('failed', 'three.js');
    }
})(0);
