/**
 * Engine de gráficos em Canvas 2D puro (Fase 9).
 *
 * 12 tipos: line, bar, hbar, pie, donut, area, radar, scatter, bubble,
 *           heatmap, histogram, gauge.
 *
 * Dataset universal:
 *   {
 *     labels: ['A', 'B', 'C'],      // categorias (eixo X)
 *     values: [10, 20, 30],         // valores
 *     // ou para scatter/bubble:
 *     points: [{x, y, r?}, ...]
 *     // ou para heatmap:
 *     matrix: [[1, 2], [3, 4]]
 *   }
 *
 * Opções: { title, palette, showGrid, showLabels, showValues, padding }
 */

/* Paletas de cores (Material 3 Dark + Neon) */
export const PALETTES = {
  neon: ['#d4a24e', '#e8c07a', '#00ff88', '#ffaa00', '#66ddff', '#ff3355', '#ffd700', '#7c4dff'],
  ocean: ['#00b4d8', '#0077b6', '#03045e', '#90e0ef', '#caf0f8', '#48cae4', '#ade8f4', '#0096c7'],
  sunset: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee'],
  forest: ['#52b788', '#40916c', '#2d6a4f', '#1b4332', '#081c15', '#74c69d', '#95d5b2', '#b7e4c7'],
  mono: ['#e6f1ff', '#93a4bf', '#5a6b85', '#1c2e47', '#112233', '#0f1419', '#0a0a0a', '#444c5c']
};

const DEFAULT_OPTS = {
  title: '',
  palette: 'neon',
  showGrid: true,
  showLabels: true,
  showValues: false,
  padding: { top: 40, right: 40, bottom: 50, left: 60 },
  bgColor: '#0a0a0a',
  fgColor: '#e6f1ff',
  gridColor: 'rgba(212, 162, 78, 0.08)',
  axisColor: 'rgba(212, 162, 78, 0.3)',
  fontFamily: 'JetBrains Mono, monospace',
  font: '12px JetBrains Mono, monospace'
};

function getColors(palette) {
  return PALETTES[palette] || PALETTES.neon;
}

function clearCanvas(ctx, w, h, bg) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

function drawTitle(ctx, title, w, padding, fg, fontFamily) {
  if (!title) return;
  ctx.fillStyle = fg;
  ctx.font = 'bold 14px ' + fontFamily;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(title, w / 2, 10);
}

function niceMax(value) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exp);
  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * Math.pow(10, exp);
}

function fmt(n) {
  if (!isFinite(n)) return '';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

/* ===== Grid + axis helpers ===== */

function drawAxes(ctx, area, opts, minY, maxY) {
  const { x, y, w, h } = area;
  ctx.strokeStyle = opts.axisColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  /* Grid horizontal + labels Y */
  const steps = 5;
  ctx.font = opts.font;
  ctx.fillStyle = '#5a6b85';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= steps; i++) {
    const yy = y + h - (i / steps) * h;
    const val = minY + (i / steps) * (maxY - minY);
    if (opts.showGrid && i > 0) {
      ctx.strokeStyle = opts.gridColor;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + w, yy);
      ctx.stroke();
    }
    if (opts.showLabels) ctx.fillText(fmt(val), x - 6, yy);
  }
}

function drawXLabels(ctx, area, labels, opts) {
  if (!opts.showLabels || !labels.length) return;
  const { x, y, w, h } = area;
  const step = w / labels.length;
  ctx.font = opts.font;
  ctx.fillStyle = '#5a6b85';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  labels.forEach((lab, i) => {
    const cx = x + step * i + step / 2;
    ctx.fillText(String(lab), cx, y + h + 6);
  });
}

/* ===== 1. Linha ===== */
function drawLine(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const maxV = niceMax(Math.max(...values, 0));
  const minV = Math.min(0, ...values);

  drawAxes(ctx, area, opts, minV, maxV);
  drawXLabels(ctx, area, labels, opts);

  const step = area.w / Math.max(values.length - 1, 1);

  /* Linha */
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 8;
  ctx.beginPath();
  values.forEach((v, i) => {
    const px = area.x + step * i;
    const py = area.y + area.h - ((v - minV) / (maxV - minV || 1)) * area.h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* Pontos */
  ctx.fillStyle = colors[0];
  values.forEach((v, i) => {
    const px = area.x + step * i;
    const py = area.y + area.h - ((v - minV) / (maxV - minV || 1)) * area.h;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    if (opts.showValues) {
      ctx.font = opts.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(fmt(v), px, py - 8);
    }
  });
}

/* ===== 2. Barra vertical ===== */
function drawBar(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const maxV = niceMax(Math.max(...values, 0));
  const minV = Math.min(0, ...values);

  drawAxes(ctx, area, opts, minV, maxV);

  const slot = area.w / values.length;
  const barW = slot * 0.7;
  values.forEach((v, i) => {
    const px = area.x + slot * i + (slot - barW) / 2;
    const py = area.y + area.h - ((v - minV) / (maxV - minV || 1)) * area.h;
    const barH = area.y + area.h - py;
    const grad = ctx.createLinearGradient(px, py, px, py + barH);
    grad.addColorStop(0, colors[i % colors.length]);
    grad.addColorStop(1, colors[i % colors.length] + '80');
    ctx.fillStyle = grad;
    ctx.fillRect(px, py, barW, barH);
    ctx.strokeStyle = colors[i % colors.length];
    ctx.strokeRect(px, py, barW, barH);
    if (opts.showValues) {
      ctx.fillStyle = opts.fgColor;
      ctx.font = opts.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(fmt(v), px + barW / 2, py - 4);
    }
  });

  drawXLabels(ctx, area, labels, opts);
}

/* ===== 3. Barra horizontal ===== */
function drawHBar(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const padding = { top: 40, right: 40, bottom: 30, left: 100 };
  const area = { x: padding.left, y: padding.top, w: w - padding.left - padding.right, h: h - padding.top - padding.bottom };
  const maxV = niceMax(Math.max(...values, 0));

  /* Eixo X */
  ctx.strokeStyle = opts.axisColor;
  ctx.beginPath();
  ctx.moveTo(area.x, area.y);
  ctx.lineTo(area.x, area.y + area.h);
  ctx.lineTo(area.x + area.w, area.y + area.h);
  ctx.stroke();

  const slot = area.h / values.length;
  const barH = slot * 0.7;
  values.forEach((v, i) => {
    const py = area.y + slot * i + (slot - barH) / 2;
    const barW = (v / maxV) * area.w;
    const grad = ctx.createLinearGradient(area.x, py, area.x + barW, py);
    grad.addColorStop(0, colors[i % colors.length] + '80');
    grad.addColorStop(1, colors[i % colors.length]);
    ctx.fillStyle = grad;
    ctx.fillRect(area.x, py, barW, barH);
    ctx.strokeStyle = colors[i % colors.length];
    ctx.strokeRect(area.x, py, barW, barH);

    /* label à esquerda */
    ctx.fillStyle = '#5a6b85';
    ctx.font = opts.font;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(labels[i] || i), area.x - 6, py + barH / 2);

    if (opts.showValues) {
      ctx.fillStyle = opts.fgColor;
      ctx.textAlign = 'left';
      ctx.fillText(fmt(v), area.x + barW + 4, py + barH / 2);
    }
  });
}

/* ===== 4. Pizza ===== */
function drawPie(ctx, w, h, data, opts, donut = false) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const cx = w / 2;
  const cy = h / 2 + 10;
  const r = Math.min(w, h - 60) / 2 - 20;
  const total = values.reduce((s, v) => s + Math.abs(v), 0) || 1;

  let start = -Math.PI / 2;
  values.forEach((v, i) => {
    const slice = (Math.abs(v) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = opts.bgColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Label */
    if (opts.showLabels) {
      const mid = start + slice / 2;
      const lx = cx + Math.cos(mid) * (r * 0.7);
      const ly = cy + Math.sin(mid) * (r * 0.7);
      ctx.fillStyle = '#0a0a0a';
      ctx.font = 'bold ' + opts.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const pct = ((v / total) * 100).toFixed(0);
      if (slice > 0.15) ctx.fillText(`${pct}%`, lx, ly);
    }

    start += slice;
  });

  /* Donut: limpa o centro */
  if (donut) {
    ctx.fillStyle = opts.bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    /* Total no centro */
    ctx.fillStyle = opts.fgColor;
    ctx.font = 'bold 18px ' + opts.fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(total), cx, cy - 6);
    ctx.font = opts.font;
    ctx.fillStyle = '#93a4bf';
    ctx.fillText('Total', cx, cy + 12);
  }

  /* Legenda */
  if (opts.showLabels && labels.length) {
    const lx = 10;
    let ly = h - 30;
    ctx.font = opts.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    labels.slice(0, 4).forEach((lab, i) => {
      const cx2 = lx + (i % 4) * (w / 4);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(cx2, ly, 10, 10);
      ctx.fillStyle = '#93a4bf';
      ctx.fillText(`${lab}: ${fmt(values[i])}`, cx2 + 14, ly + 5);
    });
  }
}

function drawDonut(ctx, w, h, data, opts) { drawPie(ctx, w, h, data, opts, true); }

/* ===== 6. Área ===== */
function drawArea(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const maxV = niceMax(Math.max(...values, 0));
  const minV = Math.min(0, ...values);

  drawAxes(ctx, area, opts, minV, maxV);
  drawXLabels(ctx, area, labels, opts);

  const step = area.w / Math.max(values.length - 1, 1);

  /* Gradient fill */
  const grad = ctx.createLinearGradient(0, area.y, 0, area.y + area.h);
  grad.addColorStop(0, colors[0] + 'CC');
  grad.addColorStop(1, colors[0] + '10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(area.x, area.y + area.h);
  values.forEach((v, i) => {
    const px = area.x + step * i;
    const py = area.y + area.h - ((v - minV) / (maxV - minV || 1)) * area.h;
    ctx.lineTo(px, py);
  });
  ctx.lineTo(area.x + area.w, area.y + area.h);
  ctx.closePath();
  ctx.fill();

  /* Linha por cima */
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const px = area.x + step * i;
    const py = area.y + area.h - ((v - minV) / (maxV - minV || 1)) * area.h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
}

/* ===== 7. Radar ===== */
function drawRadar(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const labels = data.labels || [];
  const values = data.values || [];
  if (!values.length) return;

  const cx = w / 2;
  const cy = h / 2 + 10;
  const r = Math.min(w, h - 80) / 2 - 30;
  const maxV = niceMax(Math.max(...values, 0));
  const n = values.length;

  /* Grade radial */
  ctx.strokeStyle = opts.gridColor;
  for (let k = 1; k <= 5; k++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rr = (r * k) / 5;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  /* Eixos */
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }

  /* Labels */
  ctx.fillStyle = '#93a4bf';
  ctx.font = opts.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  labels.forEach((lab, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const lx = cx + Math.cos(a) * (r + 16);
    const ly = cy + Math.sin(a) * (r + 16);
    ctx.fillText(String(lab), lx, ly);
  });

  /* Polígono dos valores */
  ctx.fillStyle = colors[0] + '40';
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = (v / maxV) * r;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/* ===== 8/9. Scatter / Bubble ===== */
function drawScatter(ctx, w, h, data, opts, bubble = false) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const points = data.points || (data.values || []).map((v, i) => ({ x: i, y: v }));
  if (!points.length) return;

  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = niceMax(Math.max(...xs) - minX) + minX;
  const minY = Math.min(...ys, 0), maxY = niceMax(Math.max(...ys) - minY) + minY;

  drawAxes(ctx, area, opts, minY, maxY);

  /* eixo X labels */
  if (opts.showLabels) {
    ctx.fillStyle = '#5a6b85';
    ctx.font = opts.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 5; i++) {
      const val = minX + (i / 5) * (maxX - minX);
      const px = area.x + (i / 5) * area.w;
      ctx.fillText(fmt(val), px, area.y + area.h + 6);
    }
  }

  /* Pontos */
  points.forEach((p, i) => {
    const px = area.x + ((p.x - minX) / (maxX - minX || 1)) * area.w;
    const py = area.y + area.h - ((p.y - minY) / (maxY - minY || 1)) * area.h;
    const radius = bubble ? Math.max((p.r || 5), 3) : 5;
    ctx.fillStyle = colors[i % colors.length] + (bubble ? '80' : 'CC');
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function drawBubble(ctx, w, h, data, opts) { drawScatter(ctx, w, h, data, opts, true); }

/* ===== 10. Heatmap ===== */
function drawHeatmap(ctx, w, h, data, opts) {
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const matrix = data.matrix || [];
  if (!matrix.length || !matrix[0]?.length) return;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const cellW = area.w / cols;
  const cellH = area.h / rows;

  const flat = matrix.flat();
  const mn = Math.min(...flat);
  const mx = Math.max(...flat);
  const range = mx - mn || 1;

  /* Gradient cyan→magenta */
  function colorAt(t) {
    const r = Math.round(0 + (255 - 0) * t);
    const g = Math.round(240 + (0 - 240) * t);
    const b = Math.round(255 + (170 - 255) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const v = matrix[i][j];
      const t = (v - mn) / range;
      ctx.fillStyle = colorAt(t);
      ctx.fillRect(area.x + j * cellW, area.y + i * cellH, cellW - 1, cellH - 1);
      if (opts.showValues && cellW > 30) {
        ctx.fillStyle = t > 0.5 ? '#0a0a0a' : '#e6f1ff';
        ctx.font = 'bold 11px ' + opts.fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmt(v), area.x + j * cellW + cellW / 2, area.y + i * cellH + cellH / 2);
      }
    }
  }
}

/* ===== 11. Histograma ===== */
function drawHistogram(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const raw = data.values || [];
  if (!raw.length) return;

  /* 10 bins */
  const bins = 10;
  const mn = Math.min(...raw);
  const mx = Math.max(...raw);
  const range = mx - mn || 1;
  const counts = new Array(bins).fill(0);
  raw.forEach((v) => {
    const idx = Math.min(bins - 1, Math.floor(((v - mn) / range) * bins));
    counts[idx]++;
  });

  const { top, right, bottom, left } = opts.padding;
  const area = { x: left, y: top, w: w - left - right, h: h - top - bottom };
  const maxV = niceMax(Math.max(...counts));

  drawAxes(ctx, area, opts, 0, maxV);

  const slot = area.w / bins;
  counts.forEach((c, i) => {
    const px = area.x + slot * i;
    const py = area.y + area.h - (c / maxV) * area.h;
    const barH = area.y + area.h - py;
    ctx.fillStyle = colors[0] + 'CC';
    ctx.fillRect(px + 1, py, slot - 2, barH);
    ctx.strokeStyle = colors[0];
    ctx.strokeRect(px + 1, py, slot - 2, barH);
  });

  /* X labels: min e max do bin */
  ctx.fillStyle = '#5a6b85';
  ctx.font = opts.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= bins; i += 2) {
    const val = mn + (i / bins) * range;
    ctx.fillText(fmt(val), area.x + slot * i, area.y + area.h + 6);
  }
}

/* ===== 12. Gauge ===== */
function drawGauge(ctx, w, h, data, opts) {
  const colors = getColors(opts.palette);
  clearCanvas(ctx, w, h, opts.bgColor);
  drawTitle(ctx, opts.title, w, opts.padding, opts.fgColor, opts.fontFamily);

  const value = data.values?.[0] || 0;
  const max = data.values?.[1] || 100;
  const pct = Math.max(0, Math.min(1, value / max));

  const cx = w / 2;
  const cy = h / 2 + 40;
  const r = Math.min(w, h) / 3;

  /* Arco de fundo */
  ctx.strokeStyle = '#1c2e47';
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.stroke();

  /* Arco preenchido com gradient */
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1] || colors[0]);
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + pct * Math.PI);
  ctx.stroke();

  /* Valor central */
  ctx.fillStyle = colors[0];
  ctx.font = 'bold 36px ' + opts.fontFamily;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 12;
  ctx.fillText(fmt(value), cx, cy - 20);
  ctx.shadowBlur = 0;

  ctx.font = opts.font;
  ctx.fillStyle = '#93a4bf';
  ctx.fillText(`/ ${fmt(max)} (${(pct * 100).toFixed(0)}%)`, cx, cy + 10);

  /* Min/Max */
  ctx.font = opts.font;
  ctx.fillStyle = '#5a6b85';
  ctx.textAlign = 'left';
  ctx.fillText('0', cx - r - 20, cy + 4);
  ctx.textAlign = 'right';
  ctx.fillText(fmt(max), cx + r + 20, cy + 4);
}

/* ===== Dispatcher ===== */

export const CHART_TYPES = {
  line:      { label: 'Linha',          icon: '⤴',   draw: drawLine,      needs: 'values+labels' },
  bar:       { label: 'Barra',          icon: '📊',  draw: drawBar,       needs: 'values+labels' },
  hbar:      { label: 'Barra Horizont.', icon: '➤',  draw: drawHBar,      needs: 'values+labels' },
  pie:       { label: 'Pizza',          icon: '◔',   draw: drawPie,       needs: 'values+labels' },
  donut:     { label: 'Donut',          icon: '◯',   draw: drawDonut,     needs: 'values+labels' },
  area:      { label: 'Área',           icon: '▲',   draw: drawArea,      needs: 'values+labels' },
  radar:     { label: 'Radar',          icon: '✦',   draw: drawRadar,     needs: 'values+labels' },
  scatter:   { label: 'Scatter',        icon: '∴',   draw: drawScatter,   needs: 'points' },
  bubble:    { label: 'Bolha',          icon: '●',   draw: drawBubble,    needs: 'points+r' },
  heatmap:   { label: 'Heatmap',        icon: '▦',   draw: drawHeatmap,   needs: 'matrix' },
  histogram: { label: 'Histograma',     icon: '⫼',   draw: drawHistogram, needs: 'values' },
  gauge:     { label: 'Gauge',          icon: '◴',   draw: drawGauge,     needs: 'value+max' }
};

export function drawChart(canvas, type, data, userOpts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const opts = { ...DEFAULT_OPTS, ...userOpts };
  const chart = CHART_TYPES[type];
  if (!chart) {
    clearCanvas(ctx, w, h, opts.bgColor);
    ctx.fillStyle = '#ff3355';
    ctx.font = opts.font;
    ctx.textAlign = 'center';
    ctx.fillText('Tipo de gráfico desconhecido: ' + type, w / 2, h / 2);
    return;
  }
  chart.draw(ctx, w, h, data, opts);
}

export function exportPNG(canvas, filename = 'baluarte-chart.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
