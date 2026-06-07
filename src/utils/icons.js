/**
 * Ícones de linha do Baluarte — set minimalista e coerente (24×24, traço).
 *
 * Todos no mesmo grid, fill none + stroke currentColor, então herdam a cor
 * do tema/universo automaticamente. `lineIcon(name)` devolve o markup do SVG;
 * `iconByPath` mapeia cada rota a um ícone. Sem dependências externas.
 */

/* Conteúdo interno de cada ícone (o <svg> é montado por lineIcon). */
const PATHS = {
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/>',
  user: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>',
  flag: '<path d="M6 21V4"/><path d="M6 5h11l-2.5 3.5L17 12H6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".6"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.3h11.4A1.5 1.5 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  code: '<path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>',
  terminal: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m7 10 3 2.5-3 2.5M12.5 16h4"/>',
  braces: '<path d="M8 4c-2 0-2 2-2 4s0 3-2 4c2 1 2 2 2 4s0 4 2 4"/><path d="M16 4c2 0 2 2 2 4s0 3 2 4c-2 1-2 2-2 4s0 4-2 4"/>',
  branch: '<circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="8" r="2.2"/><path d="M7 8.2v7.6M7 13a6 6 0 0 1 6-6h2"/>',
  regex: '<path d="M12 5v8M8.5 7l7 4M15.5 7l-7 4"/><circle cx="7" cy="17.5" r="1.4"/>',
  tool: '<path d="M14.5 6.5a3.8 3.8 0 0 1-5 5L5 16v3h3l4.5-4.5a3.8 3.8 0 0 0 5-5l-2.2 2.2-2.6-.6-.6-2.6Z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  func: '<path d="M14 4h-1.5a2.5 2.5 0 0 0-2.5 2.5V9m-2 0h6"/><path d="M8.5 20c2 0 2.5-1.5 3.5-4s1.5-4 3.5-4"/>',
  binary: '<rect x="5" y="4" width="5.5" height="7" rx="1"/><rect x="13.5" y="13" width="5.5" height="7" rx="1"/><path d="M16.2 4v7M5 20h5.5M7.7 17v3"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
  circuit: '<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 12h4l4-5M12 12l4 5"/>',
  gate: '<path d="M6 6h5a6 6 0 0 1 0 12H6V6Z"/><path d="M3 9h3M3 15h3M17.5 12H21"/>',
  chart: '<path d="M4 4v16h16"/><path d="m7 14 3-4 3 2 4-6"/>',
  atom: '<circle cx="12" cy="12" r="1.4"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  star: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m7 7 2.5 2.5M17 7l-2.5 2.5M7 17l2.5-2.5M17 17l-2.5-2.5"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 4.5-4.5L13 16l3-3 3 3.5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z"/>',
  morse: '<circle cx="5" cy="12" r="1.3"/><path d="M9.5 12h4.5"/><circle cx="18.5" cy="12" r="1.3"/>',
  droplet: '<path d="M12 4c3 3.5 5.5 6.4 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 10.4 9 7.5 12 4Z"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5M20 14v6M14 20h6M19 18.5h.01"/>',
  hash: '<path d="M9 4 7.5 20M16.5 4 15 20M5 9h14M4 15h14"/>',
  book: '<path d="M5 4.5h9a3 3 0 0 1 3 3V20a3 3 0 0 0-3-3H5V4.5Z"/><path d="M5 4.5v12.5"/>',
  cap: '<path d="M12 5 3 9l9 4 9-4-9-4Z"/><path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5"/><circle cx="12" cy="4" r="1.2"/>',
  monitor: '<rect x="3.5" y="5" width="17" height="11" rx="2"/><path d="M9 20h6M12 16v4"/>',
  cube: '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  coins: '<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5"/><ellipse cx="15" cy="13" rx="5" ry="2.5"/><path d="M10 13v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4"/>',
  trending: '<path d="M4 16 10 10l3 3 7-7"/><path d="M15 6h5v5"/>',
  radio: '<circle cx="12" cy="14" r="2"/><path d="M7.5 9.5a6 6 0 0 1 9 0M5 7a9.5 9.5 0 0 1 14 0M10.5 19h3"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  wave: '<path d="M3 12h2l2-6 3 13 3-16 3 12 2-3h3"/>',
  playc: '<circle cx="12" cy="12" r="8.5"/><path d="m10 8.5 5 3.5-5 3.5Z"/>',
  video: '<rect x="3.5" y="6" width="12" height="12" rx="2"/><path d="m15.5 10 5-3v10l-5-3"/>',
  tv: '<rect x="3.5" y="8" width="17" height="11" rx="2"/><path d="m8 4 4 4 4-4"/>',
  film: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14M15 5v14M4 9.5h5M15 9.5h5M4 14.5h5M15 14.5h5"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r=".6"/><circle cx="15" cy="10" r=".6"/>',
  gamepad: '<rect x="3" y="8" width="18" height="9" rx="4"/><path d="M7.5 11.5v3M6 13h3M15 12h.01M17.5 14h.01"/>',
  diamond: '<path d="M12 3 4 12l8 9 8-9-8-9Z"/><path d="M8 12h8"/>',
  file: '<path d="M7 3h7l4 4v14H7V3Z"/><path d="M13.5 3v4.5H18M10 12h5M10 15.5h5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  radar: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 12 18 7"/>',
  satellite: '<path d="m5 13 6-6M8 4 4 8l4 4 4-4-4-4Z"/><path d="M13 9.5 18.5 15M14 19a5 5 0 0 0 5-5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5.5-5 2 2-5.5 5-2Z"/>',
  triangle: '<path d="M12 5 4 19h16L12 5Z"/>',
  map: '<path d="m9 5-5 2v12l5-2 6 2 5-2V5l-5 2-6-2Z"/><path d="M9 5v12M15 7v12"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14 0 17M12 3.5c-2.5 2.5-2.5 14 0 17"/>',
  bars: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />',
  award: '<circle cx="12" cy="9" r="5"/><path d="m9 13.5-1.5 6 4.5-2.5 4.5 2.5-1.5-6"/>',
  swords: '<path d="M4 4h3l9 9-3 3-9-9V4Z"/><path d="M20 4h-3l-4 4M14.5 12.5 17 15M6 18l3-3M5 19l2 2"/>',
  helmet: '<path d="M4 14a8 8 0 0 1 16 0v1H4v-1Z"/><path d="M4 15v2h16v-2M12 6v8"/>',
  sitemap: '<rect x="9.5" y="3.5" width="5" height="4" rx="1"/><rect x="3.5" y="16.5" width="5" height="4" rx="1"/><rect x="15.5" y="16.5" width="5" height="4" rx="1"/><path d="M12 7.5v4M6 16.5v-2h12v2"/>',
  rocket: '<path d="M12 3c3 2 4.5 5 4.5 9L12 16l-4.5-4c0-4 1.5-7 4.5-9Z"/><path d="M9.5 15 7 19M14.5 15 17 19M10.5 12.5h3"/>',
  strategy: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.5h16M4 15h16M9.5 4v16M15 4v16"/>',
  scroll: '<path d="M6 5h10a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V5Z"/><path d="M6 5a2 2 0 0 0-2 2v2h4M9 9h6M9 13h6"/>',
  crosshair: '<circle cx="12" cy="12" r="7.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="2"/><path d="M9 15.5a3.5 3.5 0 0 1 6 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  hex: '<path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z"/>'
};

/** Rota → ícone. Itens sem entrada caem no fallback (hex). */
export const iconByPath = {
  '/home': 'home', '/perfil': 'user', '/roadmap': 'flag', '/sobre': 'info',
  '/jarvis': 'orbit', '/jarvis-dashboard': 'grid', '/llm-lab': 'flask', '/ia-proprietaria': 'chip',
  '/editor': 'code', '/terminal': 'terminal', '/json-studio': 'braces', '/git-helper': 'branch',
  '/regex': 'regex', '/utilidades': 'tool',
  '/calculadoras': 'calc', '/calc-cientifica': 'func', '/calc-numerica': 'binary',
  '/tabela-verdade': 'table', '/logic-sim': 'circuit', '/portas': 'gate', '/graficos': 'chart',
  '/tabela-periodica': 'atom', '/universo': 'star',
  '/cripto': 'lock', '/esteganografia': 'image', '/ciberseg': 'shield', '/morse': 'morse',
  '/color-studio': 'droplet', '/qr-studio': 'qr', '/simbolos': 'hash',
  '/biblioteca': 'book', '/academia': 'cap', '/robotica': 'bot', '/guia-pc': 'monitor',
  '/modpack': 'cube', '/economia': 'coins', '/dolar': 'trending',
  '/radio': 'radio', '/musicas': 'music', '/fft': 'wave', '/media': 'playc',
  '/videos': 'video', '/tv': 'tv', '/filmes': 'film', '/memes': 'smile', '/jogos': 'gamepad',
  '/elites': 'diamond', '/dossie': 'file', '/arsenal': 'target', '/radar': 'radar',
  '/geo': 'satellite', '/find': 'compass', '/triangulacao': 'triangle', '/mapa': 'map',
  '/forcas-armadas': 'globe', '/orcamentos-militares': 'bars', '/poder-militar': 'award',
  '/arsenal-expandido': 'swords', '/forcas-especiais': 'helmet', '/organizacao-militar': 'sitemap',
  '/tecnologia-militar': 'rocket', '/taticas-estrategias': 'strategy', '/historia-militar': 'scroll',
  '/armas-por-pais': 'crosshair', '/guerras-conflitos': 'globe', '/batalhas-historicas': 'shield',
  '/visao': 'eye', '/jarvis-vision': 'scan', '/ferramentas': 'gear'
};

/** Markup do ícone de linha pelo nome (ou hex de fallback). */
export function lineIcon(name) {
  const inner = PATHS[name] || PATHS.hex;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="nav-ico" aria-hidden="true">${inner}</svg>`;
}

/** Ícone para uma rota (usa o mapa; fallback hex). */
export function iconForPath(path) {
  return lineIcon(iconByPath[path] || 'hex');
}
