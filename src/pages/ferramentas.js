/**
 * Hub de Ferramentas — catálogo de ferramentas técnicas em 7 categorias.
 * Busca textual + filtro por categoria. Cada card aponta para uma rota real
 * (página implementada ou placeholder).
 */

import '../styles/ferramentas.css';
import { h, debounce, normalize, mount, cx } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { toast } from '../utils/toast.js';

/* ============================================================
 *  Catálogo de ferramentas (7 categorias)
 *  Cada item: { id, name, category, icon, desc, phase, tag? }
 *  Status visual:
 *   - phase = 1 → ready
 *   - phase >= 2 → locked
 *   - tag = 'novo' → selo extra "NOVO" (ferramenta recém-adicionada)
 * ============================================================ */
const TOOLS = [
  /* === Desenvolvimento (5) === */
  { id: 'editor', name: 'Editor de Código', category: 'desenvolvimento', icon: '⌨', phase: 1, tag: 'novo', desc: '26 linguagens com syntax highlight, multi-tabs, find & replace, runners JS/HTML/CSS/Markdown, persistência local.' },
  { id: 'terminal', name: 'Terminal Web', category: 'desenvolvimento', icon: '▶', phase: 1, tag: 'novo', desc: '60+ comandos POSIX-like + aliases estilo PowerShell. Filesystem virtual persistente, pipes, redirects, history e autocomplete.' },
  { id: 'regex', name: 'Lab de Regex', category: 'desenvolvimento', icon: '✱', phase: 1, desc: 'Tester JS com highlight de matches, grupos nomeados, replace preview, 10 exemplos e cheatsheet completa.' },
  { id: 'json', name: 'JSON Studio', category: 'desenvolvimento', icon: '{ }', phase: 1, desc: 'Formata, minifica e valida JSON, com árvore navegável, erros com linha/coluna e estatísticas da estrutura.' },
  { id: 'git-helper', name: 'Git Helper', category: 'desenvolvimento', icon: '⎇', phase: 1, desc: 'Cheatsheet de comandos Git agrupados (clique copia) e modelos de .gitignore.' },
  { id: 'utilidades', name: 'Caixa de Ferramentas', category: 'desenvolvimento', icon: '🧰', phase: 1, tag: 'novo', desc: '24 utilidades: senhas, UUID, texto (contador/diff/caso/slug/binário/frequência), datas, timestamp, porcentagem, regra de três, romanos, ASCII, bytes, Lorem, base64 de imagem, sorteador, px↔rem, fusos, Markdown→HTML e JSON↔CSV.' },

  /* === Cálculo (9) === */
  { id: 'calc-cientifica', name: 'Científica', category: 'calculo', icon: '∑', phase: 1, desc: 'Trigonometria (deg/rad), hiperbólicas, logaritmos, fatoriais, memória, histórico.' },
  { id: 'calc-financeira', name: 'Financeira', category: 'calculo', icon: '$', phase: 1, desc: 'Juros simples/compostos, VPL/TIR, Parcelamento Price, conversão de taxa.' },
  { id: 'calc-conversores', name: 'Conversores', category: 'calculo', icon: '⇄', phase: 1, desc: '10 categorias, 80+ unidades: comprimento, massa, temperatura, energia, tempo, dados, velocidade, pressão, ângulo.' },
  { id: 'calc-estatistica', name: 'Estatística', category: 'calculo', icon: 'σ', phase: 1, desc: 'Média, mediana, moda, desvio, variância, quartis + regressão linear (R², predição).' },
  { id: 'calc-engenharia', name: 'Engenharia', category: 'calculo', icon: '⚙', phase: 1, desc: 'Lei de Ohm, divisor de tensão, resistor color code, frequência↔λ, Stevin (hidrostática).' },
  { id: 'calc-saude', name: 'Saúde', category: 'calculo', icon: '♥', phase: 1, desc: 'IMC + classificação, TMB Mifflin, macros, FC máxima e zonas Karvonen, hidratação.' },
  { id: 'calc-numerica', name: 'Numérica (Bin/Hex/Oct)', category: 'calculo', icon: '01', phase: 1, desc: 'Conversões Dec/Bin/Hex/Oct simultâneas. Bit ops (AND/OR/XOR/NOT/shift). IEEE 754 visualizer.' },
  { id: 'tabela-verdade', name: 'Tabela Verdade', category: 'calculo', icon: '⊨', phase: 1, desc: 'Parser de expressões lógicas (AND/OR/NOT/XOR/IMPLIES/IFF), tabela completa, K-map (até 4 vars), SOP/POS canônicas, simplificação Quine-McCluskey.' },
  { id: 'logic-sim', name: 'Logic Sim', category: 'calculo', icon: '⊞', phase: 1, tag: 'novo', desc: 'Simulador de lógica digital interativo: 14 portas + flip-flops D/JK/T (lógica sequencial), ligados com fios no canvas. Salve e reabra circuitos.' },

  /* === Criptografia (8) === */
  { id: 'cripto-cesar', name: 'Cifra de César', category: 'cripto', icon: 'C', phase: 1, desc: 'Cifra clássica com shift 0-25, brute force ranqueado por score PT.' },
  { id: 'cripto-base', name: 'Base64 / Base32 / Hex', category: 'cripto', icon: '⬢', phase: 1, desc: 'Encode simultâneo nas 3 bases + decoder com detecção de formato.' },
  { id: 'cripto-aes', name: 'AES-GCM', category: 'cripto', icon: '⚿', phase: 1, desc: 'AES-256 autenticado via Web Crypto. Chave derivada por PBKDF2-SHA256 (100k iter), salt+IV random.' },
  { id: 'cripto-hash', name: 'Hash (SHA family)', category: 'cripto', icon: '#', phase: 1, desc: 'SHA-1, SHA-256, SHA-384, SHA-512 simultâneos via Web Crypto.' },
  { id: 'cripto-morse', name: 'Código Morse', category: 'cripto', icon: '· ─', phase: 1, desc: 'Página dedicada: texto ↔ Morse, reprodução em áudio (oscilador), flash visual sincronizado, WPM e tom ajustáveis, tabela de referência completa.' },
  { id: 'cripto-vigenere', name: 'Vigenère', category: 'cripto', icon: 'V', phase: 1, desc: 'Cifra polialfabética com chave repetida. Mostra a chave esticada alinhada.' },
  { id: 'cripto-atbash', name: 'Atbash', category: 'cripto', icon: 'A', phase: 1, desc: 'Substituição A↔Z, B↔Y… Involução (decode = encode).' },
  { id: 'cripto-otp', name: 'One-Time Pad', category: 'cripto', icon: '⊕', phase: 1, desc: 'XOR byte-a-byte com chave random ≥ mensagem. Provadamente seguro (Shannon).' },
  { id: 'cripto-steg', name: 'Esteganografia', category: 'cripto', icon: '◳', phase: 1, tag: 'novo', desc: 'Esconde e revela texto dentro de imagens via LSB (Canvas), 100% no navegador. Opção de cifrar com AES-256 antes de esconder. Exporta PNG sem perda.' },

  /* === Visualização (4) === */
  { id: 'graficos', name: 'Gerador de Gráficos', category: 'visualizacao', icon: '◢', phase: 1, desc: '12 tipos em Canvas 2D puro: linha, barra V/H, pizza, donut, área, radar, scatter, bolha, heatmap, histograma, gauge. Export PNG.' },
  { id: 'fft', name: 'Visualizador FFT', category: 'visualizacao', icon: '~', phase: 1, desc: '6 modos (barras/curva/waveform/radial/spectrogram/partículas) via Web Audio API. Mic, arquivo ou tom de teste.' },
  { id: 'colorpicker', name: 'Color Studio', category: 'visualizacao', icon: '◐', phase: 1, tag: 'novo', desc: 'Conversor HEX/RGB/HSL/OKLCH, gerador de paletas, construtor de gradiente e verificador de contraste WCAG.' },
  { id: 'simbolos', name: 'Hub de Símbolos', category: 'visualizacao', icon: '✦', phase: 1, desc: '1200+ caracteres Unicode em 14 categorias. Busca por code point ou nome, favoritos persistidos, click copia.' },

  /* === Mídia (7) === */
  { id: 'media-hub', name: 'Media Hub', category: 'midia', icon: '◫', phase: 1, desc: 'Player local pra áudio/vídeo/imagens via File API. Drag-and-drop e cross-link com FFT.' },
  { id: 'videos', name: 'Central de Vídeos', category: 'midia', icon: '▶', phase: 1, desc: 'YouTube embeds em 5 playlists temáticas. Marca "assistido", busca, cross-link com Media Hub.' },
  { id: 'audio-fft', name: 'Áudio Studio', category: 'midia', icon: '♪', phase: 1, desc: 'Atalho para Visualizador FFT — analisa áudio do mic ou arquivo em tempo real.' },
  { id: 'qrcode', name: 'QR Code Studio', category: 'midia', icon: '▦', phase: 1, tag: 'novo', desc: 'Gera QR Codes de texto, Wi-Fi, vCard e e-mail com codificador próprio (Reed-Solomon) e lê QR Codes pela câmera.' },
  { id: 'radio', name: 'Rádio', category: 'midia', icon: '∿', phase: 1, tag: 'novo', desc: 'Receptor de rádio com dois modos: sintetizador via Web Audio (100% offline) e Online com estações reais da internet pela Radio Browser API.' },
  { id: 'musicas', name: 'Central de Música', category: 'midia', icon: '♫', phase: 1, tag: 'novo', desc: 'Faixa em destaque em loop infinito e playlist temática, via embeds do Spotify.' },
  { id: 'filmes', name: 'Cinema', category: 'midia', icon: '▣', phase: 1, tag: 'novo', desc: 'Cinema do Baluarte — catálogo de filmes do acervo; cada título abre num player modal integrado.' },
  { id: 'tv', name: 'TV do Baluarte', category: 'midia', icon: '📺', phase: 1, tag: 'novo', desc: '34 canais em rotação (playlists do YouTube) com grade de programação por horário — o canal "no ar agora" toca ao abrir.' },
  { id: 'radar', name: 'Radar Tático', category: 'visualizacao', icon: '⌬', phase: 1, tag: 'novo', desc: 'Console range-Doppler com CFAR-CA, MTI, DC notch e waterfall. Modo mock funciona sem hardware; modos replay e bridge (WebSocket ws://127.0.0.1:8765) plugam em CSI de roteador, ESP32 ou SDR.' },

  /* === Referência (9) === */
  { id: 'tabela-periodica', name: 'Tabela Periódica', category: 'referencia', icon: '⚛', phase: 1, desc: '118 elementos com massa, configuração eletrônica e categoria. Filtro por categoria, grid 18×10.' },
  { id: 'modpack-mc', name: 'Modpack Minecraft', category: 'referencia', icon: '◧', phase: 1, desc: '60+ mods catalogados em 9 categorias com tier list (S/A/B/C) e descrição completa.' },
  { id: 'guia-pc', name: 'Guia para Montar PC', category: 'referencia', icon: '◨', phase: 1, desc: '4 presets (orçamento → workstation) + tutorial de 7 passos.' },
  { id: 'arsenal-ref', name: 'Arsenal (Catálogo)', category: 'referencia', icon: '⌖', phase: 1, desc: '159 armas + 24 veículos + 6 doutrinas. Filtro por categoria/equipe/tier, busca textual e ficha completa.' },
  { id: 'doutrina', name: 'Doutrina Militar', category: 'referencia', icon: '◆', phase: 1, desc: 'CQB, Overwatch, Fireteam, Breach, EVAC, Recon — 6 manuais táticos do Baluarte.' },
  { id: 'portas', name: 'Lógica Digital', category: 'referencia', icon: '∧', phase: 1, tag: 'novo', desc: 'Enciclopédia de lógica digital: portas fundamentais com símbolo, expressão e tabela verdade, blocos construtivos e catálogo de CIs 7400/4000.' },
  { id: 'ciberseg', name: 'CiberSeg', category: 'referencia', icon: '⊘', phase: 1, tag: 'novo', desc: 'Enciclopédia de cibersegurança — catálogo de ataques, defesas e ferramentas com filtro por categoria e ficha detalhada.' },
  { id: 'academia', name: 'Academia', category: 'referencia', icon: '</>', phase: 1, tag: 'novo', desc: 'Trilhas de linguagens de programação com módulos de código e atalho "abrir no Editor", mais recursos de aprendizado e carreiras de tecnologia.' },
  { id: 'jogos', name: 'Jogos de Aprendizado', category: 'referencia', icon: '🎮', phase: 1, tag: 'novo', desc: 'Aprenda programação jogando: JavaScript ("qual a saída?"), HTML (múltipla escolha) e CSS ("acerte o layout" com Flexbox), com pontuação.' },
  { id: 'robotica', name: 'Robótica', category: 'referencia', icon: '⊙', phase: 1, tag: 'novo', desc: 'Currículo de robótica em 12 módulos, do básico ao avançado, com rail de navegação e painel de conteúdo.' },

  /* === Sistema (4) === */
  { id: 'cotacoes', name: 'Cotações Live', category: 'sistema', icon: '$', phase: 1, desc: 'Câmbio (AwesomeAPI) + crypto (CoinGecko) em tempo real + conversor.' },
  { id: 'jarvis', name: 'J.A.R.V.I.S.', category: 'sistema', icon: '◉', phase: 1, tag: 'novo', desc: 'Assistente IA em 6 modos: Local (regras), Navegador (WebLLM — IA real offline via WebGPU, sem API), Claude API, Ollama, Servidor (Python + Gemini com busca web) e Agente (com ferramentas + leitura do estado do site).' },
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
  qrcode: '/qr-studio',
  /* Cálculo */
  'calc-cientifica': '/calc-cientifica',
  'calc-financeira': '/calculadoras',
  'calc-conversores': '/calculadoras',
  'calc-estatistica': '/calculadoras',
  'calc-engenharia': '/calculadoras',
  'calc-saude': '/calculadoras',
  'calc-numerica': '/calc-numerica',
  'tabela-verdade': '/tabela-verdade',
  'logic-sim': '/logic-sim',
  /* Criptografia (todas no hub /cripto) */
  'cripto-cesar': '/cripto',
  'cripto-base': '/cripto',
  'cripto-aes': '/cripto',
  'cripto-hash': '/cripto',
  'cripto-morse': '/morse',
  'cripto-vigenere': '/cripto',
  'cripto-atbash': '/cripto',
  'cripto-otp': '/cripto',
  'cripto-steg': '/esteganografia',
  /* Visualização */
  graficos: '/graficos',
  fft: '/fft',
  simbolos: '/simbolos',
  /* Mídia */
  'media-hub': '/media',
  videos: '/videos',
  tv: '/tv',
  'audio-fft': '/fft',
  radio: '/radio',
  musicas: '/musicas',
  filmes: '/filmes',
  /* Referência */
  'tabela-periodica': '/tabela-periodica',
  'modpack-mc': '/modpack',
  'guia-pc': '/guia-pc',
  'arsenal-ref': '/arsenal',
  doutrina: '/arsenal',
  portas: '/portas',
  ciberseg: '/ciberseg',
  academia: '/academia',
  jogos: '/jogos',
  robotica: '/robotica',
  /* Sistema */
  cotacoes: '/economia',
  jarvis: '/jarvis',
  'ia-proprietaria': '/ia-proprietaria',
  config: '/perfil',
  'git-helper': '/git-helper',
  colorpicker: '/color-studio',
  utilidades: '/utilidades'
};

/* ============================================================ */

/* Cor de destaque por categoria (acento dos cards). */
const CAT_COLOR = {
  desenvolvimento: '#d4a24e', calculo: '#7ee787', cripto: '#e8c07a',
  visualizacao: '#ffaa00', midia: '#9d7bff', referencia: '#66ddff', sistema: '#ff6b6b'
};

/* Inclinação 3D no hover (estilo do redesign #195). */
function tilt(card) {
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return card;
  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
    card.style.setProperty('--ry', (x * 11).toFixed(2) + 'deg');
  };
  const reset = () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', reset);
  return card;
}

function toolCard(tool) {
  const isReady = tool.phase <= 1;
  const route = TOOL_ROUTES[tool.id] || null;
  const accent = CAT_COLOR[tool.category] || '#d4a24e';

  return tilt(h('div', {
    className: 'fh-card' + (isReady ? '' : ' is-locked'),
    style: { '--accent': accent },
    'data-category': tool.category,
    title: route ? `Abrir ${tool.name}` : `${tool.name} — sem rota dedicada (chega em fase futura)`,
    onclick: () => {
      if (route) router.navigate(route);
      else toast(`"${tool.name}" ainda não tem rota dedicada — chegará em fase futura.`, { type: 'warning', duration: 3200 });
    }
  },
    h('div', { className: 'fh-card__glow' }),
    h('div', { className: 'fh-card__top' },
      h('span', { className: 'fh-card__icon' }, tool.icon),
      h('div', { className: 'fh-card__badges' },
        tool.tag === 'novo' && h('span', { className: 'fh-badge fh-badge--novo' }, 'NOVO'),
        isReady ? h('span', { className: 'fh-badge fh-badge--ready' }, 'PRONTO')
                : h('span', { className: 'fh-badge fh-badge--soon' }, 'ROADMAP'))),
    h('h3', { className: 'fh-card__title' }, tool.name),
    h('p', { className: 'fh-card__desc' }, tool.desc),
    h('div', { className: 'fh-card__cat u-mono' }, tool.category.toUpperCase())));
}

export function ferramentasPage(args) {
  /* Estado LOCAL por invocação (global faria a busca/filtro atualizar o grid
     de uma chamada anterior não-montada — a página é instanciada 2x). */
  let activeCategory = 'all';
  let searchTerm = '';
  const gridEl = h('div', { className: 'fh-grid' });
  const countEl = h('span', { className: 'fh-count u-mono' }, `${TOOLS.length} de ${TOOLS.length}`);

  function applyFilters() {
    const term = normalize(searchTerm);
    const filtered = TOOLS.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (!term) return true;
      return normalize(`${t.name} ${t.desc} ${t.category}`).includes(term);
    });
    mount(gridEl, null);
    if (!filtered.length) {
      gridEl.appendChild(h('div', { className: 'fh-empty' },
        h('div', { style: { fontSize: '46px', opacity: 0.5 } }, '∅'),
        h('div', { className: 'u-text-secondary' }, 'Nenhuma ferramenta encontrada para o filtro atual.')));
    } else {
      filtered.forEach((tool) => gridEl.appendChild(toolCard(tool)));
    }
    countEl.textContent = `${filtered.length} de ${TOOLS.length}`;
  }

  const chips = h('div', { className: 'fh-filters' },
    ...CATEGORIES.map((cat) => {
      const count = cat.id === 'all' ? TOOLS.length : TOOLS.filter((t) => t.category === cat.id).length;
      const accent = CAT_COLOR[cat.id];
      return h('button', {
        className: cx('fh-chip', activeCategory === cat.id && 'is-active'),
        style: accent ? { '--accent': accent } : {},
        'data-cat': cat.id,
        onclick: (e) => {
          activeCategory = cat.id;
          chips.querySelectorAll('.fh-chip').forEach((c) => c.classList.toggle('is-active', c.dataset.cat === cat.id));
          applyFilters();
        }
      }, cat.label, h('span', { className: 'fh-chip__n' }, String(count)));
    }));

  const searchInput = h('input', {
    className: 'fh-search', type: 'search',
    placeholder: '🔎 Buscar ferramenta por nome, descrição ou categoria…',
    'aria-label': 'Buscar ferramenta', autocomplete: 'off',
    oninput: debounce((e) => { searchTerm = e.target.value; applyFilters(); }, 120)
  });

  TOOLS.forEach((tool) => gridEl.appendChild(toolCard(tool)));

  return h('div', { className: 'page-ferramentas' },
    buildImmersiveHero({
      kicker: 'BALUARTE · HUB DE FERRAMENTAS',
      title: 'Hub de Ferramentas',
      sub: 'CAIXA DE FERRAMENTAS TÉCNICAS',
      variant: 'reactor',
      desc: [
        'Catálogo central de todas as ferramentas técnicas do Baluarte — ',
        h('span', { className: 'u-text-cyan' }, `${TOOLS.length} ferramentas`),
        ' em ', h('span', { className: 'u-text-cyan' }, `${CATEGORIES.length - 1} categorias`), '.'
      ],
      ctas: [
        { label: '⌨ Editor de Código', variant: 'primary', onClick: () => router.navigate('/editor') },
        { label: '🔗 Núcleo de IA', onClick: () => router.navigate('/git-nexus') }
      ],
      hudLeft: '⚙ FERRAMENTARIA · ONLINE',
      hudRight: `${TOOLS.length} FERRAMENTAS`,
      query: args && args.query
    }),
    h('div', { className: 'fh-toolbar' }, searchInput, countEl),
    chips,
    gridEl);
}
