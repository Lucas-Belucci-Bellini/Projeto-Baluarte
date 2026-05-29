/**
 * Radar Tracker — rastreio multi-alvo sobre as detecções do CFAR.
 *
 * Conceito trazido do passiveRadar (Max-Manning) — `multitarget_kalman_tracker.py`
 * / `simple_kalman_tracker.py`: transformar "blips" soltos de cada frame em
 * ALVOS PERSISTENTES com ID, velocidade suavizada e continuidade temporal.
 *
 * Implementação em JS puro, sem dependências:
 *   - associação por vizinho-mais-próximo com "gate" (raio máximo)
 *   - filtro alfa-beta (Kalman simplificado) para suavizar posição/velocidade
 *   - ciclo de vida: tentativa → confirmado → coasting (sem medida) → removido
 *
 * Trabalha no espaço de bins (range r, doppler c) — o mesmo das detecções.
 */

export function createTracker(opts = {}) {
  const gate = opts.gate ?? 4.5;                 /* raio de associação (bins) */
  const alpha = opts.alpha ?? 0.5;               /* ganho de posição */
  const beta = opts.beta ?? 0.25;                /* ganho de velocidade */
  const confirmHits = opts.confirmHits ?? 3;     /* hits p/ confirmar a track */
  const maxCoast = opts.maxCoast ?? 6;           /* frames sem medida antes de apagar (confirmada) */
  const maxTentativeMiss = opts.maxTentativeMiss ?? 2; /* tentativa morre rápido */
  const trailMax = opts.trailMax ?? 14;          /* tamanho do rastro p/ desenhar */
  const maxTracks = opts.maxTracks ?? 12;        /* alvos confirmados exibidos */
  const maxPool = maxTracks * 3;                 /* teto interno (inclui tentativas) */

  let tracks = [];
  let nextId = 1;

  function pushTrail(t) {
    t.trail.push([t.r, t.c]);
    if (t.trail.length > trailMax) t.trail.shift();
  }

  function update(detections) {
    /* 1) Predição: avança cada track pela sua velocidade. */
    for (const t of tracks) {
      t.r += t.vr;
      t.c += t.vc;
      t.updated = false;
    }

    /* 2) Associação gulosa por vizinho-mais-próximo dentro do gate. */
    const dets = (detections || []).slice(0, 24).map((d) => ({ r: d.r, c: d.c, snr: d.snr, used: false }));
    const pairs = [];
    for (let ti = 0; ti < tracks.length; ti++) {
      for (let di = 0; di < dets.length; di++) {
        const dist = Math.hypot(dets[di].r - tracks[ti].r, dets[di].c - tracks[ti].c);
        if (dist <= gate) pairs.push({ ti, di, dist });
      }
    }
    pairs.sort((a, b) => a.dist - b.dist);
    for (const p of pairs) {
      const t = tracks[p.ti], d = dets[p.di];
      if (t.updated || d.used) continue;
      const resR = d.r - t.r, resC = d.c - t.c; /* resíduo (inovação) */
      t.r += alpha * resR; t.vr += beta * resR;
      t.c += alpha * resC; t.vc += beta * resC;
      t.snr = d.snr;
      t.hits++; t.misses = 0; t.updated = true; d.used = true;
      pushTrail(t);
      if (!t.confirmed && t.hits >= confirmHits) { t.confirmed = true; t.id = nextId++; }
    }

    /* 3) Tracks sem medida: contam "miss" e seguem na inércia (coasting). */
    for (const t of tracks) {
      if (!t.updated) { t.misses++; pushTrail(t); }
      t.age++;
    }

    /* 4) Detecções não usadas viram novas tracks tentativas. */
    for (const d of dets) {
      if (d.used || tracks.length >= maxPool) continue;
      tracks.push({
        id: 0, r: d.r, c: d.c, vr: 0, vc: 0, snr: d.snr,
        hits: 1, misses: 0, age: 1, confirmed: false, updated: true, trail: [[d.r, d.c]]
      });
    }

    /* 5) Poda por ciclo de vida + mantém as mais fortes. */
    tracks = tracks.filter((t) => t.confirmed ? t.misses <= maxCoast : t.misses <= maxTentativeMiss);
    if (tracks.length > maxPool) {
      tracks.sort((a, b) => (Number(b.confirmed) - Number(a.confirmed)) || (b.snr - a.snr));
      tracks = tracks.slice(0, maxPool);
    }

    return confirmed();
  }

  function confirmed() {
    return tracks.filter((t) => t.confirmed).sort((a, b) => a.id - b.id).slice(0, maxTracks);
  }

  function reset() { tracks = []; nextId = 1; }

  return { update, reset, confirmed, get tracks() { return tracks; } };
}
