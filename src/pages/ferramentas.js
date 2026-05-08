/**
 * Hub de Ferramentas — 35+ ferramentas em 7 categorias.
 * Busca textual + filtro por categoria. Cada card vai virar página real nas próximas fases.
 */

import { h, debounce, normalize, mount, cx } from '../utils/helpers.js';

/* ============================================================
 *  Catálogo de ferramentas (35 entradas, 7 categorias)
 *  Cada item: { id, name, category, icon, desc, phase }
 *  Status visual:
 *   - phase = 1 → ready
 *   - phase >= 2 → locked
 * ============================================================ */
const TOOLS = [
  /* === Desenvolvimento (5) === */
  { id: 'editor', name: 'Editor de Código', category: 'desenvolvimento', icon: '⌨', phase: 2, desc: '26 linguagens com Prism.js. Runners para JS/HTML/CSS/Python (Pyodide).' },
  { id: 'terminal', name: 'Terminal Web', category: 'desenvolvimento', icon: '▶', phase: 2, desc: '60+ comandos POSIX-like. Filesystem virtual, pipes e redirects.' },
  { id: 'regex', name: 'Lab de Regex', category: 'desenvolvimento', icon: '✱', phase: 2, desc: 'Tester com highlight, grupos nomeados e cheatsheet integrada.' },
  { id: 'json', name: 'JSON Studio', category: 'desenvolvimento', icon: '{ }', phase: 2, desc: 'Format, minify, diff, validação JSON Schema e conversão YAML/TOML.' },
  { id: 'git-helper', name: 'Git Helper', category: 'desenvolvimento', icon: '⎇', phase: 2, desc: 'Cheatsheet interativa, gerador de .gitignore e templates de commit.' },

  /* === Cálculo (8) === */
  { id: 'calc-cientifica', name: 'Científica', category: 'calculo', icon: '∑', phase: 2, desc: 'Trigonometria, hiperbólicas, logaritmos, fatoriais, memória.' },
  { id: 'calc-financeira', name: 'Financeira', category: 'calculo', icon: '$', phase: 2, desc: 'VP/VF, juros simples e compostos, TIR, VPL, parcelamento.' },
  { id: 'calc-conversores', name: 'Conversores', category: 'calculo', icon: '⇄', phase: 2, desc: 'Unidades SI, imperial, energia, dados, temperatura, tempo.' },
  { id: 'calc-estatistica', name: 'Estatística', category: 'calculo', icon: 'σ', phase: 2, desc: 'Média, mediana, desvio, regressão linear, distribuições.' },
  { id: 'calc-engenharia', name: 'Engenharia', category: 'calculo', icon: '⚙', phase: 2, desc: 'Lei de Ohm, divisor de tensão, Bernoulli, vigas, estruturas.' },
  { id: 'calc-saude', name: 'Saúde', category: 'calculo', icon: '♥', phase: 2, desc: 'IMC, TMB, macros, FC máxima, hidratação, ovulação.' },
  { id: 'calc-numerica', name: 'Numérica (Bin/Hex/Oct)', category: 'calculo', icon: '01', phase: 2, desc: 'Conversões Dec/Bin/Hex/Oct. Bit ops. IEEE 754 visualizer.' },
  { id: 'tabela-verdade', name: 'Tabela Verdade', category: 'calculo', icon: '⊨', phase: 2, desc: 'Chips lógicos, mapa de Karnaugh, simplificação.' },

  /* === Criptografia (5) === */
  { id: 'cripto-cesar', name: 'Cifra de César', category: 'cripto', icon: 'C', phase: 2, desc: 'Cifra clássica com shift configurável e brute force.' },
  { id: 'cripto-base', name: 'Base64 / Base32 / Hex', category: 'cripto', icon: '⬢', phase: 2, desc: 'Encode/decode em múltiplas bases.' },
  { id: 'cripto-aes', name: 'AES-GCM', category: 'cripto', icon: '⚿', phase: 2, desc: 'Criptografia simétrica autenticada via Web Crypto API nativa.' },
  { id: 'cripto-hash', name: 'Hash (SHA family)', category: 'cripto', icon: '#', phase: 2, desc: 'SHA-1, SHA-256, SHA-384, SHA-512, MD5 (info).' },
  { id: 'cripto-misto', name: 'Morse · Vigenère · Atbash · OTP', category: 'cripto', icon: '· ─', phase: 2, desc: 'Cifras clássicas e modernas em um único laboratório.' },

  /* === Visualização (4) === */
  { id: 'graficos', name: 'Gerador de Gráficos', category: 'visualizacao', icon: '◢', phase: 2, desc: '12 tipos (linha, barra, pizza, radar, área, scatter, ...) em Canvas puro.' },
  { id: 'fft', name: 'Visualizador FFT', category: 'visualizacao', icon: '~', phase: 4, desc: '6 modos de visualização espectral via Web Audio API.' },
  { id: 'colorpicker', name: 'Color Studio', category: 'visualizacao', icon: '◐', phase: 2, desc: 'HEX/RGB/HSL/OKLCH, paletas geradas, gradient builder.' },
  { id: 'simbolos', name: 'Hub de Símbolos', category: 'visualizacao', icon: '✦', phase: 2, desc: '1200+ caracteres Unicode categorizados, busca e copy.' },

  /* === Mídia (4) === */
  { id: 'media-hub', name: 'Media Hub', category: 'midia', icon: '◫', phase: 4, desc: 'Scanner local via File System Access API, organização e player.' },
  { id: 'videos', name: 'Central de Vídeos', category: 'midia', icon: '▶', phase: 4, desc: 'YouTube embeds + arquivos locais, playlists.' },
  { id: 'audio-fft', name: 'Áudio Studio', category: 'midia', icon: '♪', phase: 4, desc: 'Player com FFT, EQ, loop e exportação.' },
  { id: 'qrcode', name: 'QR Code Studio', category: 'midia', icon: '▦', phase: 2, desc: 'Gera e lê QR codes (WiFi, vCard, URL, texto).' },

  /* === Referência (5) === */
  { id: 'tabela-periodica', name: 'Tabela Periódica', category: 'referencia', icon: '⚛', phase: 4, desc: '118 elementos, propriedades, isótopos, configuração eletrônica.' },
  { id: 'modpack-mc', name: 'Modpack Minecraft', category: 'referencia', icon: '◧', phase: 4, desc: '490+ mods catalogados, tier list e dependências.' },
  { id: 'guia-pc', name: 'Guia para Montar PC', category: 'referencia', icon: '◨', phase: 4, desc: 'Tutorial passo-a-passo, compatibilidades, presets de uso.' },
  { id: 'arsenal-ref', name: 'Arsenal (Catálogo)', category: 'referencia', icon: '⌖', phase: 3, desc: '159 armas + veículos + doutrinas táticas.' },
  { id: 'doutrina', name: 'Doutrina Militar', category: 'referencia', icon: '◆', phase: 3, desc: 'Manuais, ROE, taxonomia de operações especiais.' },

  /* === Sistema (4) === */
  { id: 'cotacoes', name: 'Cotações Live', category: 'sistema', icon: '$', phase: 5, desc: 'Câmbio + crypto em tempo real (APIs externas).' },
  { id: 'jarvis', name: 'J.A.R.V.I.S.', category: 'sistema', icon: '◉', phase: 5, desc: 'Assistente IA com 4 modos. Claude API + Ollama local.' },
  { id: 'shadow', name: 'Shadow Bridge', category: 'sistema', icon: '◐', phase: 5, desc: 'Autenticação SHA-256×100. Proteção de áreas sensíveis.' },
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

/* ============================================================ */

let activeCategory = 'all';
let searchTerm = '';
let gridEl = null;
let countEl = null;

function toolCard(tool) {
  const isReady = tool.phase <= 1;

  return h(
    'div',
    {
      className: 'card card--interactive tool-card',
      'data-status': isReady ? 'ready' : 'locked',
      'data-category': tool.category,
      'data-id': tool.id,
      title: isReady
        ? `Abrir ${tool.name}`
        : `${tool.name} — disponível na Fase ${tool.phase}`,
      onclick: () => {
        if (!isReady) {
          alert(`"${tool.name}" será implementada na Fase ${tool.phase}.`);
          return;
        }
        alert(`"${tool.name}" — Fase 1 entregou apenas o catálogo. A página real vem nas próximas fases.`);
      }
    },
    h(
      'div',
      { className: 'tool-card__head' },
      h('div', { className: 'tool-card__icon' }, tool.icon),
      isReady
        ? h('span', { className: 'badge badge--success' }, 'PRONTO')
        : h('span', { className: 'badge badge--magenta' }, `FASE ${tool.phase}`)
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
        h('span', { className: 'u-text-cyan' }, '35 ferramentas'),
        ' organizadas em ',
        h('span', { className: 'u-text-cyan' }, '7 categorias'),
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
