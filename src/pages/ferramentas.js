/**
 * Hub de Ferramentas — catálogo de ferramentas técnicas em 7 categorias.
 * Busca textual + filtro por categoria. Cada card aponta para uma rota real
 * (página implementada ou placeholder).
 */

import { h, debounce, normalize, mount, cx } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';

/* ============================================================
 *  Catálogo de ferramentas (7 categorias)
 *  Cada item: { id, name, category, icon, desc, phase }
 *  Status visual:
 *   - phase = 1 → ready
 *   - phase >= 2 → locked
 * ============================================================ */
const TOOLS = [
  /* === Desenvolvimento (5) === */
  { id: 'editor', name: 'Editor de Código', category: 'desenvolvimento', icon: '⌨', phase: 1, desc: '26 linguagens com syntax highlight, multi-tabs, runners JS/HTML/CSS/Markdown, persistência local.' },
  { id: 'terminal', name: 'Terminal Web', category: 'desenvolvimento', icon: '▶', phase: 1, desc: '60+ comandos POSIX-like. Filesystem virtual persistente, pipes, redirects, history e autocomplete.' },
  { id: 'regex', name: 'Lab de Regex', category: 'desenvolvimento', icon: '✱', phase: 1, desc: 'Tester JS com highlight de matches, grupos nomeados, replace preview, 10 exemplos e cheatsheet completa.' },
  { id: 'json', name: 'JSON Studio', category: 'desenvolvimento', icon: '{ }', phase: 2, desc: 'Format, minify, diff, validação JSON Schema e conversão YAML/TOML.' },
  { id: 'git-helper', name: 'Git Helper', category: 'desenvolvimento', icon: '⎇', phase: 2, desc: 'Cheatsheet interativa, gerador de .gitignore e templates de commit.' },

  /* === Cálculo (8) === */
  { id: 'calc-cientifica', name: 'Científica', category: 'calculo', icon: '∑', phase: 1, desc: 'Trigonometria (deg/rad), hiperbólicas, logaritmos, fatoriais, memória, histórico.' },
  { id: 'calc-financeira', name: 'Financeira', category: 'calculo', icon: '$', phase: 1, desc: 'Juros simples/compostos, VPL/TIR, Parcelamento Price, conversão de taxa.' },
  { id: 'calc-conversores', name: 'Conversores', category: 'calculo', icon: '⇄', phase: 1, desc: '10 categorias, 80+ unidades: comprimento, massa, temperatura, energia, tempo, dados, velocidade, pressão, ângulo.' },
  { id: 'calc-estatistica', name: 'Estatística', category: 'calculo', icon: 'σ', phase: 1, desc: 'Média, mediana, moda, desvio, variância, quartis + regressão linear (R², predição).' },
  { id: 'calc-engenharia', name: 'Engenharia', category: 'calculo', icon: '⚙', phase: 1, desc: 'Lei de Ohm, divisor de tensão, resistor color code, frequência↔λ, Stevin (hidrostática).' },
  { id: 'calc-saude', name: 'Saúde', category: 'calculo', icon: '♥', phase: 1, desc: 'IMC + classificação, TMB Mifflin, macros, FC máxima e zonas Karvonen, hidratação.' },
  { id: 'calc-numerica', name: 'Numérica (Bin/Hex/Oct)', category: 'calculo', icon: '01', phase: 1, desc: 'Conversões Dec/Bin/Hex/Oct simultâneas. Bit ops (AND/OR/XOR/NOT/shift). IEEE 754 visualizer.' },
  { id: 'tabela-verdade', name: 'Tabela Verdade', category: 'calculo', icon: '⊨', phase: 1, desc: 'Parser de expressões lógicas (AND/OR/NOT/XOR/IMPLIES/IFF), tabela completa, K-map (até 4 vars), SOP/POS canônicas, simplificação Quine-McCluskey.' },

  /* === Criptografia (5) === */
  { id: 'cripto-cesar', name: 'Cifra de César', category: 'cripto', icon: 'C', phase: 1, desc: 'Cifra clássica com shift 0-25, brute force ranqueado por score PT.' },
  { id: 'cripto-base', name: 'Base64 / Base32 / Hex', category: 'cripto', icon: '⬢', phase: 1, desc: 'Encode simultâneo nas 3 bases + decoder com detecção de formato.' },
  { id: 'cripto-aes', name: 'AES-GCM', category: 'cripto', icon: '⚿', phase: 1, desc: 'AES-256 autenticado via Web Crypto. Chave derivada por PBKDF2-SHA256 (100k iter), salt+IV random.' },
  { id: 'cripto-hash', name: 'Hash (SHA family)', category: 'cripto', icon: '#', phase: 1, desc: 'SHA-1, SHA-256, SHA-384, SHA-512 simultâneos via Web Crypto.' },
  { id: 'cripto-morse', name: 'Código Morse', category: 'cripto', icon: '· ─', phase: 1, desc: 'Página dedicada: texto ↔ Morse, reprodução em áudio (oscilador), flash visual sincronizado, WPM e tom ajustáveis, tabela de referência completa.' },
  { id: 'cripto-vigenere', name: 'Vigenère', category: 'cripto', icon: 'V', phase: 1, desc: 'Cifra polialfabética com chave repetida. Mostra a chave esticada alinhada.' },
  { id: 'cripto-atbash', name: 'Atbash', category: 'cripto', icon: 'A', phase: 1, desc: 'Substituição A↔Z, B↔Y… Involução (decode = encode).' },
  { id: 'cripto-otp', name: 'One-Time Pad', category: 'cripto', icon: '⊕', phase: 1, desc: 'XOR byte-a-byte com chave random ≥ mensagem. Provadamente seguro (Shannon).' },

  /* === Visualização (4) === */
  { id: 'graficos', name: 'Gerador de Gráficos', category: 'visualizacao', icon: '◢', phase: 1, desc: '12 tipos em Canvas 2D puro: linha, barra V/H, pizza, donut, área, radar, scatter, bolha, heatmap, histograma, gauge. Export PNG.' },
  { id: 'fft', name: 'Visualizador FFT', category: 'visualizacao', icon: '~', phase: 1, desc: '6 modos (barras/curva/waveform/radial/spectrogram/partículas) via Web Audio API. Mic, arquivo ou tom de teste.' },
  { id: 'colorpicker', name: 'Color Studio', category: 'visualizacao', icon: '◐', phase: 2, desc: 'HEX/RGB/HSL/OKLCH, paletas geradas, gradient builder.' },
  { id: 'simbolos', name: 'Hub de Símbolos', category: 'visualizacao', icon: '✦', phase: 1, desc: '1200+ caracteres Unicode em 14 categorias. Busca por code point ou nome, favoritos persistidos, click copia.' },

  /* === Mídia (4) === */
  { id: 'media-hub', name: 'Media Hub', category: 'midia', icon: '◫', phase: 1, desc: 'Player local pra áudio/vídeo/imagens via File API. Drag-and-drop e cross-link com FFT.' },
  { id: 'videos', name: 'Central de Vídeos', category: 'midia', icon: '▶', phase: 1, desc: 'YouTube embeds em 5 playlists temáticas. Marca "assistido", busca, cross-link com Media Hub.' },
  { id: 'audio-fft', name: 'Áudio Studio', category: 'midia', icon: '♪', phase: 1, desc: 'Atalho para Visualizador FFT — analisa áudio do mic ou arquivo em tempo real.' },
  { id: 'qrcode', name: 'QR Code Studio', category: 'midia', icon: '▦', phase: 2, desc: 'Gera e lê QR codes (WiFi, vCard, URL, texto).' },

  /* === Referência (5) === */
  { id: 'tabela-periodica', name: 'Tabela Periódica', category: 'referencia', icon: '⚛', phase: 1, desc: '118 elementos com massa, configuração eletrônica e categoria. Filtro por categoria, grid 18×10.' },
  { id: 'modpack-mc', name: 'Modpack Minecraft', category: 'referencia', icon: '◧', phase: 1, desc: '60+ mods catalogados em 9 categorias com tier list (S/A/B/C) e descrição completa.' },
  { id: 'guia-pc', name: 'Guia para Montar PC', category: 'referencia', icon: '◨', phase: 1, desc: '4 presets (orçamento → workstation) + tutorial de 7 passos.' },
  { id: 'arsenal-ref', name: 'Arsenal (Catálogo)', category: 'referencia', icon: '⌖', phase: 1, desc: '159 armas + 24 veículos + 6 doutrinas. Filtro por categoria/equipe/tier, busca textual e ficha completa.' },
  { id: 'doutrina', name: 'Doutrina Militar', category: 'referencia', icon: '◆', phase: 1, desc: 'CQB, Overwatch, Fireteam, Breach, EVAC, Recon — 6 manuais táticos do Baluarte.' },

  /* === Sistema (4) === */
  { id: 'cotacoes', name: 'Cotações Live', category: 'sistema', icon: '$', phase: 1, desc: 'Câmbio (AwesomeAPI) + crypto (CoinGecko) em tempo real + conversor.' },
  { id: 'jarvis', name: 'J.A.R.V.I.S.', category: 'sistema', icon: '◉', phase: 1, desc: 'Assistente IA — modo local (regras) ou Claude API. 4 modos completos na Fase 20.' },
  { id: 'ia-proprietaria', name: 'IA Proprietária Mark 11', category: 'sistema', icon: '◎', phase: 1, desc: 'Sistema de Skills dinâmico (SKILL.md). Capacidades modulares e componíveis da IA embarcada do Baluarte.' },
  { id: 'config', name: 'Configurações', category: 'sistema', icon: '⚙', phase: 1, desc: 'Tema, atalhos, idioma, limpeza de cache.' }
];

const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'desenvolvimento', label: 'Desenvolvimento' },
  { id: 'calculo', label: 'Cálculo' },
  { id: 'cripto', label: 'Criptografia' },
  { id: 'visualizacao', label: 'Visualização' },
  { id: 'midia', label: 'Mídia' },
  { id: 'referencia', label: 'Referência' },
  { id: 'sistema', label: 'Sistema' }
];

/* ============================================================
 *  Mapa: tool.id → rota registrada no router
 *  Tools sem entrada aqui exibem um toast informando que ainda
 *  não foi planejada uma rota dedicada (chegará em fases futuras).
 * ============================================================ */
const TOOL_ROUTES = {
  /* Desenvolvimento */
  editor: '/editor',
  terminal: '/terminal',
  regex: '/regex',
  json: '/json-studio',
  /* Cálculo */
  'calc-cientifica': '/calc-cientifica',
  'calc-financeira': '/calculadoras',
  'calc-conversores': '/calculadoras',
  'calc-estatistica': '/calculadoras',
  'calc-engenharia': '/calculadoras',
  'calc-saude': '/calculadoras',
  'calc-numerica': '/calc-numerica',
  'tabela-verdade': '/tabela-verdade',
  /* Criptografia (todas no hub /cripto) */
  'cripto-cesar': '/cripto',
  'cripto-base': '/cripto',
  'cripto-aes': '/cripto',
  'cripto-hash': '/cripto',
  'cripto-morse': '/morse',
  'cripto-vigenere': '/cripto',
  'cripto-atbash': '/cripto',
  'cripto-otp': '/cripto',
  /* Visualização */
  graficos: '/graficos',
  fft: '/fft',
  simbolos: '/simbolos',
  /* Mídia */
  'media-hub': '/media',
  videos: '/videos',
  'audio-fft': '/fft',
  /* Referência */
  'tabela-periodica': '/tabela-periodica',
  'modpack-mc': '/modpack',
  'guia-pc': '/guia-pc',
  'arsenal-ref': '/arsenal',
  doutrina: '/arsenal',
  /* Sistema */
  cotacoes: '/economia',
  jarvis: '/jarvis',
  'ia-proprietaria': '/ia-proprietaria',
  config: '/perfil'
  /* Sem rota dedicada (futuras): git-helper, colorpicker, qrcode */
};

/* ============================================================ */

let activeCategory = 'all';
let searchTerm = '';
let gridEl = null;
let countEl = null;

function toolCard(tool) {
  const isReady = tool.phase <= 1;
  const route = TOOL_ROUTES[tool.id] || null;

  return h(
    'div',
    {
      className: 'card card--interactive tool-card',
      'data-status': isReady ? 'ready' : 'locked',
      'data-category': tool.category,
      'data-id': tool.id,
      title: route
        ? `Abrir ${tool.name}`
        : `${tool.name} — sem rota dedicada (chega em fase futura)`,
      onclick: () => {
        if (route) {
          /* Rota existe: navega. Se for placeholder, a própria página informa fase. */
          router.navigate(route);
        } else {
          /* Sem rota mapeada (ferramentas extras tipo JSON Studio, Color Picker, etc.) */
          toast(`"${tool.name}" ainda não tem rota dedicada — chegará em fase futura.`, {
            type: 'warning',
            duration: 3200
          });
        }
      }
    },
    h(
      'div',
      { className: 'tool-card__head' },
      h('div', { className: 'tool-card__icon' }, tool.icon),
      isReady
        ? h('span', { className: 'badge badge--success' }, 'PRONTO')
        : h('span', { className: 'badge badge--magenta' }, 'ROADMAP')
    ),
    h('h3', { className: 'tool-card__title' }, tool.name),
    h('p', { className: 'tool-card__desc' }, tool.desc),
    h(
      'div',
      { className: 'tool-card__meta' },
      tool.category.toUpperCase()
    )
  );
}

function applyFilters() {
  if (!gridEl) return;
  const term = normalize(searchTerm);
  const filtered = TOOLS.filter((t) => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    if (!matchesCat) return false;
    if (!term) return true;
    const haystack = normalize(`${t.name} ${t.desc} ${t.category}`);
    return haystack.includes(term);
  });

  mount(gridEl, null);
  if (filtered.length === 0) {
    gridEl.appendChild(
      h(
        'div',
        {
          className: 'card',
          style: {
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: 'var(--space-xl)'
          }
        },
        h('div', { style: { fontSize: '48px', marginBottom: '8px', opacity: 0.6 } }, '∅'),
        h('div', { className: 'u-text-secondary' }, 'Nenhuma ferramenta encontrada para o filtro atual.')
      )
    );
  } else {
    filtered.forEach((tool) => gridEl.appendChild(toolCard(tool)));
  }

  if (countEl) {
    countEl.textContent = `${filtered.length} de ${TOOLS.length}`;
  }
}

function categoryChips() {
  return h(
    'div',
    { className: 'tool-filters' },
    ...CATEGORIES.map((cat) => {
      const count =
        cat.id === 'all'
          ? TOOLS.length
          : TOOLS.filter((t) => t.category === cat.id).length;
      const chip = h(
        'button',
        {
          className: cx('chip', activeCategory === cat.id && 'chip--active'),
          'data-cat': cat.id,
          onclick: () => {
            activeCategory = cat.id;
            document.querySelectorAll('.tool-filters .chip').forEach((c) => {
              c.classList.toggle('chip--active', c.dataset.cat === cat.id);
            });
            applyFilters();
          }
        },
        cat.label,
        h('span', { className: 'u-text-muted', style: { marginLeft: '6px' } }, `(${count})`)
      );
      return chip;
    })
  );
}

export function ferramentasPage() {
  /* Reset estado da página a cada montagem */
  activeCategory = 'all';
  searchTerm = '';

  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar ferramenta por nome, descrição ou categoria...',
    'aria-label': 'Buscar ferramenta',
    autocomplete: 'off',
    oninput: debounce((e) => {
      searchTerm = e.target.value;
      applyFilters();
    }, 120)
  });

  countEl = h(
    'span',
    { className: 'section-header__count' },
    `${TOOLS.length} de ${TOOLS.length}`
  );

  gridEl = h('div', { className: 'grid-cards' });

  /* Build inicial */
  TOOLS.forEach((tool) => gridEl.appendChild(toolCard(tool)));

  return h(
    'div',
    { className: 'page-ferramentas' },
    h(
      'div',
      { className: 'page-header anim-fade-in' },
      h(
        'div',
        { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'HUB DE FERRAMENTAS')
      ),
      h('h1', { className: 'page-header__title' }, 'Hub de Ferramentas'),
      h(
        'p',
        { className: 'page-header__description' },
        'Catálogo central de todas as ferramentas técnicas do Baluarte. ',
        h('span', { className: 'u-text-cyan' }, `${TOOLS.length} ferramentas`),
        ' organizadas em ',
        h('span', { className: 'u-text-cyan' }, `${CATEGORIES.length - 1} categorias`),
        '. Algumas já estão prontas, outras chegam em fases futuras.'
      )
    ),

    h('div', { className: 'tool-search-wrap anim-fade-in-up' }, searchInput),

    categoryChips(),

    h(
      'div',
      { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Catálogo'),
      countEl
    ),

    gridEl
  );
}
