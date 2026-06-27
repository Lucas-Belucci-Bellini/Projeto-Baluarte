export const DEFAULT_STYLE = {
  // Fill
  fillType: 'solid', // 'solid' | 'linear' | 'radial'
  fill: '#ffffff',
  fillColor2: '#a855f7',
  gradientAngle: 135,

  // Stroke (rendered as a clean outer outline of the merged silhouette)
  strokeEnabled: false,
  strokeColor: '#0d0716',
  strokeWidth: 4,

  // Drop shadow (cast from the merged silhouette)
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowBlur: 24,
  shadowOffsetX: 0,
  shadowOffsetY: 14,
  shadowOpacity: 0.35,

  // Global
  opacity: 1,

  // Canvas / export background
  backgroundEnabled: false,
  backgroundColor: '#0d0716'
};

export const DEFAULT_GLOBAL_RADIUS = 32;
export const DEFAULT_SMOOTHING = 0.6;
export const DEFAULT_TOLERANCE = 1;
export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 600;
export const DEFAULT_GRID_SIZE = 10;

let shapeCounter = 0;
const uid = () => {
  shapeCounter += 1;
  return `shape-${Date.now()}-${shapeCounter}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createShape = (x = 100, y = 100, w = 120, h = 80) => ({
  id: uid(),
  x,
  y,
  w,
  h,
  r: undefined
});

export const createInitialState = () => ({
  shapes: [
    { id: 'shape-1', x: 300, y: 150, w: 200, h: 280, r: undefined },
    { id: 'shape-2', x: 500, y: 220, w: 200, h: 140, r: undefined }
  ],
  style: { ...DEFAULT_STYLE },
  globalRadius: DEFAULT_GLOBAL_RADIUS,
  smoothing: DEFAULT_SMOOTHING,
  tolerance: DEFAULT_TOLERANCE,
  selectedIds: [],
  canvasWidth: DEFAULT_CANVAS_WIDTH,
  canvasHeight: DEFAULT_CANVAS_HEIGHT,
  snapToGrid: true,
  gridSize: DEFAULT_GRID_SIZE
});

// One-click layout templates. Each returns a fresh set of shapes (with unique ids)
// laid out around a common origin so "Fit to view" frames them nicely.
const make = (x, y, w, h) => ({ id: uid(), x, y, w, h, r: undefined });

export const PRESETS = [
  {
    // Canonical 2-bridge demo: a tall block and a shorter block sharing a vertical
    // edge, where the tall one overhangs both top and bottom.
    id: 'pair',
    name: 'Pair',
    radius: 32,
    build: () => [make(300, 160, 200, 280), make(500, 240, 200, 140)]
  },
  {
    // Vertical bar + horizontal bar sharing an edge with a single overhang -> 1 bridge.
    id: 'l-shape',
    name: 'L-Shape',
    radius: 36,
    build: () => [make(300, 160, 160, 300), make(460, 360, 260, 100)]
  },
  {
    // Top bar overhanging a centered stem on both sides -> 2 bridges.
    id: 't-shape',
    name: 'T-Shape',
    radius: 34,
    build: () => [make(260, 200, 360, 120), make(380, 320, 120, 240)]
  },
  {
    // A plus built from a centered bar with stems above & below -> 4 bridges.
    id: 'plus',
    name: 'Plus',
    radius: 30,
    build: () => [make(280, 320, 280, 120), make(360, 200, 120, 120), make(360, 440, 120, 120)]
  },
  {
    // Each step overhangs its neighbour -> 2 bridges per joint (4 total).
    id: 'stairs',
    name: 'Stairs',
    radius: 26,
    build: () => [make(260, 180, 150, 140), make(410, 260, 150, 140), make(560, 340, 150, 140)]
  },
  {
    // W / zigzag: middle block dips, outer blocks rise -> 4 bridges.
    id: 'zigzag',
    name: 'Zigzag',
    radius: 28,
    build: () => [make(280, 220, 150, 150), make(430, 300, 150, 150), make(580, 220, 150, 150)]
  },
  {
    // Equal blocks sharing full edges merge into a single stadium / pill (no bridges).
    id: 'pill-row',
    name: 'Pill Row',
    radius: 70,
    build: () => [make(260, 280, 120, 120), make(380, 280, 120, 120), make(500, 280, 120, 120)]
  }
];
