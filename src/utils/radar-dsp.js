/**
 * Radar DSP — primitivas de processamento em JS puro.
 * Inspirado no fluxo do PLFM_RADAR (FMCW): magnitude → DC notch → MTI → FFT Doppler → CFAR.
 * Tudo opera em arrays Float32. Sem dependência externa.
 */

/* ===================== FFT radix-2 (Cooley–Tukey) ===================== */

/** Bit reversal helper. */
function bitReverse(n, bits) {
  let r = 0;
  for (let i = 0; i < bits; i++) {
    r = (r << 1) | (n & 1);
    n >>>= 1;
  }
  return r;
}

/**
 * FFT in-place, radix-2. Tamanho deve ser potência de 2.
 * @param {Float32Array} re
 * @param {Float32Array} im
 */
export function fft(re, im) {
  const N = re.length;
  const bits = Math.log2(N) | 0;
  if ((1 << bits) !== N) throw new Error('FFT requer tamanho potência de 2');

  for (let i = 0; i < N; i++) {
    const j = bitReverse(i, bits);
    if (j > i) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }

  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1;
    const theta = -2 * Math.PI / size;
    const wReal = Math.cos(theta);
    const wImag = Math.sin(theta);
    for (let i = 0; i < N; i += size) {
      let wr = 1, wi = 0;
      for (let j = 0; j < half; j++) {
        const a = i + j, b = a + half;
        const tr = wr * re[b] - wi * im[b];
        const ti = wr * im[b] + wi * re[b];
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] = re[a] + tr; im[a] = im[a] + ti;
        const nwr = wr * wReal - wi * wImag;
        wi = wr * wImag + wi * wReal;
        wr = nwr;
      }
    }
  }
}

/* ===================== Janelas ===================== */

/** Janela Hann (reduz vazamento espectral). */
export function hann(N) {
  const w = new Float32Array(N);
  for (let n = 0; n < N; n++) w[n] = 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)));
  return w;
}

/* ===================== Magnitude (linear/dB) ===================== */

/** Magnitude linear de um par (re,im). */
export function magnitude(re, im) {
  const out = new Float32Array(re.length);
  for (let i = 0; i < re.length; i++) out[i] = Math.hypot(re[i], im[i]);
  return out;
}

/** Magnitude em dB com piso configurável. */
export function magnitudeDb(re, im, floor = -120) {
  const out = new Float32Array(re.length);
  for (let i = 0; i < re.length; i++) {
    const m = Math.hypot(re[i], im[i]);
    out[i] = m > 0 ? Math.max(floor, 20 * Math.log10(m)) : floor;
  }
  return out;
}

/* ===================== Pré-processamento ===================== */

/** Remove DC (média) de cada coluna (range bin) de um frame Float32 NxM. */
export function dcNotch(frame, rows, cols) {
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    for (let r = 0; r < rows; r++) sum += frame[r * cols + c];
    const mean = sum / rows;
    for (let r = 0; r < rows; r++) frame[r * cols + c] -= mean;
  }
}

/** MTI canclick estilo "single-pulse": subtrai o frame anterior do atual. Modifica current in-place. */
export function mti(current, previous) {
  for (let i = 0; i < current.length; i++) current[i] -= previous[i];
}

/* ===================== CFAR (CA-CFAR 2D) ===================== */

/**
 * Cell Averaging CFAR em 2D.
 * Para cada célula, calcula média do ruído nas células de referência ao redor
 * (excluindo guard cells), aplica fator k, e marca detecção se cell > k*média.
 *
 * @param {Float32Array} mag - magnitude 2D, row-major
 * @param {number} rows
 * @param {number} cols
 * @param {object} opts - { guard, ref, k }
 * @returns {{ mask: Uint8Array, detections: Array<{r:number,c:number,snr:number}> }}
 */
export function cfar2d(mag, rows, cols, opts = {}) {
  const guard = opts.guard ?? 1;
  const ref = opts.ref ?? 3;
  const k = opts.k ?? 4.0;
  const half = guard + ref;
  const mask = new Uint8Array(rows * cols);
  const detections = [];

  for (let r = half; r < rows - half; r++) {
    for (let c = half; c < cols - half; c++) {
      let sum = 0, n = 0;
      for (let dr = -half; dr <= half; dr++) {
        for (let dc = -half; dc <= half; dc++) {
          if (Math.abs(dr) <= guard && Math.abs(dc) <= guard) continue;
          sum += mag[(r + dr) * cols + (c + dc)];
          n++;
        }
      }
      const noise = n > 0 ? sum / n : 1e-9;
      const cell = mag[r * cols + c];
      if (cell > k * noise) {
        mask[r * cols + c] = 1;
        detections.push({ r, c, snr: cell / (noise + 1e-9) });
      }
    }
  }

  /* Ordena pela SNR — alvos mais fortes primeiro. */
  detections.sort((a, b) => b.snr - a.snr);
  return { mask, detections };
}

/* ===================== Conversão range/doppler ===================== */

/**
 * Converte índice de range bin pra distância em metros.
 * Modelo FMCW simplificado: range = bin * c / (2 * B), onde B é a banda do chirp.
 * Defaults razoáveis para 5.8 GHz, B=200MHz, fs=2MHz.
 */
export function rangeMeters(bin, opts = {}) {
  const c = 3e8;
  const B = opts.bandwidth ?? 200e6;
  const fs = opts.sampleRate ?? 2e6;
  const T = opts.chirpDuration ?? 1e-3;
  const slope = B / T;
  /* range = (f_beat * c) / (2 * slope), f_beat = bin * fs / N */
  const N = opts.fftN ?? 64;
  const fBeat = bin * (fs / N);
  return (fBeat * c) / (2 * slope);
}

/**
 * Converte índice de doppler bin pra velocidade radial em m/s.
 * Centro da FFT = 0 m/s. Bins negativos = afastando, positivos = aproximando (convenção).
 */
export function velocityMs(bin, opts = {}) {
  const c = 3e8;
  const f0 = opts.carrier ?? 5.8e9;
  const lambda = c / f0;
  const PRF = opts.PRF ?? 1000;
  const M = opts.dopplerN ?? 32;
  const k = bin - M / 2;
  return (k * (PRF / M) * lambda) / 2;
}

/* ===================== Cross-Ambiguity (radar passivo) ===================== */

/**
 * Função de Cross-Ambiguidade (CAF) — o coração do radar PASSIVO.
 * Conceito do espectre / passiveRadar (Max-Manning): em vez de transmitir um
 * sinal próprio, correlaciona um canal de REFERÊNCIA (o "iluminador" ambiente,
 * ex. rádio FM) com o canal de VIGILÂNCIA (os ecos). Picos no mapa
 * range × Doppler = alvos: o atraso (range) e o desvio Doppler (velocidade).
 *
 * Usa o "algoritmo de batches" (rápido e padrão em SDR passivo):
 *   - para cada atraso τ: correlaciona ref atrasado com surv em D blocos
 *     (colapsa o tempo rápido) → 1 valor por bloco;
 *   - FFT desses D valores = espectro Doppler daquele τ.
 *
 * @param {Float32Array} ref  canal de referência
 * @param {Float32Array} surv canal de vigilância
 * @param {object} opts { rangeBins, dopplerBins } (dopplerBins potência de 2)
 * @returns {{ mag: Float32Array, rows:number, cols:number }} mapa range-Doppler
 */
export function crossAmbiguity(ref, surv, opts = {}) {
  const R = opts.rangeBins ?? 64;
  const D = opts.dopplerBins ?? 32;
  const refIm = opts.refIm || null;   /* parte imaginária (I/Q) opcional */
  const survIm = opts.survIm || null;
  const N = Math.min(ref.length, surv.length);
  const B = Math.max(1, Math.floor(N / D)); /* amostras por bloco */
  const mag = new Float32Array(R * D);
  const re = new Float32Array(D), im = new Float32Array(D);
  const halfD = D >> 1;

  for (let tau = 0; tau < R; tau++) {
    for (let m = 0; m < D; m++) {
      let accRe = 0, accIm = 0;
      const base = m * B;
      for (let k = 0; k < B; k++) {
        const i = base + k, j = i - tau;
        if (j < 0) continue;
        const sR = surv[i], sI = survIm ? survIm[i] : 0;
        const rR = ref[j], rI = refIm ? refIm[j] : 0;
        /* surv * conj(ref) — correlação complexa */
        accRe += sR * rR + sI * rI;
        accIm += sI * rR - sR * rI;
      }
      re[m] = accRe; im[m] = accIm;
    }
    fft(re, im); /* FFT length D, in-place */
    for (let d = 0; d < D; d++) {
      const ds = (d + halfD) % D; /* fftshift: Doppler zero no centro */
      mag[tau * D + d] = Math.hypot(re[ds], im[ds]);
    }
  }
  return { mag, rows: R, cols: D };
}
