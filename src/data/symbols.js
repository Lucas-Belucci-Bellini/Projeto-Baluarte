/**
 * Banco de símbolos Unicode (Fase 10).
 *
 * Categorias com ranges Unicode + entries customizadas.
 * Total: 1200+ símbolos categorizados.
 */

/** Helper: gera array de chars de um range hex. */
function range(start, end, opts = {}) {
  const skip = new Set(opts.skip || []);
  const arr = [];
  for (let i = start; i <= end; i++) {
    if (skip.has(i)) continue;
    arr.push(String.fromCodePoint(i));
  }
  return arr;
}

/**
 * Categorias. Cada uma: { id, label, icon, items: string[] (chars) }
 */
export const SYMBOL_CATEGORIES = [
  /* ===== Setas (~150 símbolos) ===== */
  {
    id: 'arrows',
    label: 'Setas',
    icon: '→',
    items: [
      ...range(0x2190, 0x21FF),  /* Arrows */
      ...range(0x2794, 0x27BF),  /* Dingbat arrows */
      ...range(0x2B00, 0x2B59)   /* Misc symbols and arrows */
    ]
  },

  /* ===== Matemática (~250 símbolos) ===== */
  {
    id: 'math',
    label: 'Matemática',
    icon: '∑',
    items: [
      ...range(0x2200, 0x22FF),  /* Mathematical Operators */
      ...range(0x27C0, 0x27EF),  /* Misc Math A */
      ...range(0x2980, 0x29FF),  /* Misc Math B */
      ...range(0x2A00, 0x2AFF)   /* Supplemental Math */
    ]
  },

  /* ===== Lógica + Conjuntos ===== */
  {
    id: 'logic',
    label: 'Lógica & Conjuntos',
    icon: '∀',
    items: [
      '∀', '∃', '∄', '∅', '∈', '∉', '∋', '∌', '∩', '∪', '⊂', '⊃', '⊆', '⊇',
      '⊄', '⊅', '⊊', '⊋', '⊕', '⊗', '⊖', '⊘', '⊙', '⊚', '⊛',
      '∧', '∨', '¬', '⊻', '⊼', '⊽', '⇒', '⇔', '⊢', '⊨', '⊭', '⊬',
      '≡', '≢', '≜', '≝', '≟', '≠', '≤', '≥', '≪', '≫', '≦', '≧',
      '⋀', '⋁', '⋂', '⋃', '∴', '∵', '⊧'
    ]
  },

  /* ===== Geometria ===== */
  {
    id: 'geometry',
    label: 'Geometria',
    icon: '◆',
    items: [
      ...range(0x25A0, 0x25FF),  /* Geometric Shapes */
      ...range(0x2B12, 0x2B1F),
      '◇', '◈', '◉', '◊', '○', '◌', '◍', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕',
      '◖', '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠', '◡', '◢', '◣', '◤', '◥',
      '⬡', '⬢', '⬣', '⬟', '⬠', '⬞', '⬜', '⬛'
    ]
  },

  /* ===== Estrelas e decorativos ===== */
  {
    id: 'stars',
    label: 'Estrelas',
    icon: '★',
    items: [
      '★', '☆', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '⋆', '✫',
      '✶', '✷', '✸', '✹', '✺', '✻', '✼', '✽', '✾', '✿', '❀', '❁', '❂', '❃',
      '❄', '❅', '❆', '❇', '❈', '❉', '❊', '❋',
      '⚝', '⭐', '🌟', '💫', '✨'
    ]
  },

  /* ===== Moedas ===== */
  {
    id: 'currency',
    label: 'Moedas',
    icon: '$',
    items: [
      ...range(0x20A0, 0x20CF),
      '$', '¢', '£', '¤', '¥', '฿', '₿', '＄', '￠', '￡', '￥', '￦'
    ]
  },

  /* ===== Música ===== */
  {
    id: 'music',
    label: 'Música',
    icon: '♪',
    items: [
      '♩', '♪', '♫', '♬', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡', '𝅘𝅥', '𝅘𝅥𝅮', '𝆺',
      '🎵', '🎶', '🎼', '🎻', '🎺', '🎷', '🎸', '🎹', '🥁', '🎙', '🎤'
    ]
  },

  /* ===== Letras gregas ===== */
  {
    id: 'greek',
    label: 'Grego',
    icon: 'Ω',
    items: [
      ...range(0x0370, 0x03FF, { skip: [0x0378, 0x0379, 0x0380, 0x0381, 0x0382, 0x0383, 0x038B, 0x038D, 0x03A2] })
    ]
  },

  /* ===== Caixa (box drawing) ===== */
  {
    id: 'box',
    label: 'Caixa & Linhas',
    icon: '┼',
    items: [
      ...range(0x2500, 0x257F),  /* Box Drawing */
      ...range(0x2580, 0x259F)   /* Block Elements */
    ]
  },

  /* ===== Cartas e jogos ===== */
  {
    id: 'cards',
    label: 'Cartas & Jogos',
    icon: '♠',
    items: [
      '♠', '♡', '♢', '♣', '♤', '♥', '♦', '♧',
      '⚀', '⚁', '⚂', '⚃', '⚄', '⚅',
      '♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟',
      '🂠', '🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂬', '🂭', '🂮'
    ]
  },

  /* ===== Astronomia ===== */
  {
    id: 'astronomy',
    label: 'Astronomia',
    icon: '☉',
    items: [
      '☀', '☁', '☂', '☃', '☄', '★', '☆', '☇', '☈', '☉', '☊', '☋', '☌', '☍', '☎',
      '☼', '☽', '☾', '☿', '♀', '♁', '♂', '♃', '♄', '♅', '♆', '♇',
      '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
      '🌍', '🌎', '🌏', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌝',
      '🪐', '☄️', '🛰️', '🚀'
    ]
  },

  /* ===== Religião / Místico ===== */
  {
    id: 'religion',
    label: 'Místico',
    icon: '☥',
    items: [
      '☥', '☦', '☧', '☨', '☩', '☪', '☫', '☬', '☭', '☮', '☯', '✝', '✞', '✟', '✠',
      '☢', '☣', '☤', '⚛', '⚜', '☩', '⚙', '⚒', '⚔', '⚖', '⚗', '⚘'
    ]
  },

  /* ===== Diversos (OS, controle, decoração) ===== */
  {
    id: 'misc',
    label: 'Diversos',
    icon: '⌘',
    items: [
      '⌘', '⌥', '⌃', '⇧', '⏎', '⌫', '⌦', '⇥', '↵', '⎋', '⌽', '⌾', '⏏',
      '⌚', '⌛', '⏰', '⏱', '⏲', '⏳',
      '✓', '✔', '✗', '✘', '☑', '☒', '☐',
      '❤', '♥', '♡', '💚', '💛', '💙', '💜', '🖤', '🤍', '🤎',
      ...range(0x2700, 0x27BF, { skip: [] }),  /* Dingbats */
      ...range(0x2600, 0x26FF, { skip: [] })   /* Misc Symbols */
    ]
  },

  /* ===== Pontuação especial ===== */
  {
    id: 'punctuation',
    label: 'Pontuação',
    icon: '«',
    items: [
      '—', '–', '−', '…', '·', '•', '◦',
      '"', '"', "'", "'", '‚', '„', '‛', '‟',
      '§', '¶', '¿', '¡', '†', '‡', '※',
      '«', '»', '‹', '›', '⟨', '⟩', '⟪', '⟫', '⟬', '⟭'
    ]
  }
];

/* Nomes legíveis (opcional, mostra no tooltip) */
const NAME_HINTS = {
  '★': 'Black Star',
  '☆': 'White Star',
  '✓': 'Check Mark',
  '✗': 'Ballot X',
  '←': 'Leftwards Arrow',
  '→': 'Rightwards Arrow',
  '↑': 'Upwards Arrow',
  '↓': 'Downwards Arrow',
  '∞': 'Infinity',
  '≈': 'Almost Equal',
  '≠': 'Not Equal',
  '≤': 'Less Than or Equal',
  '≥': 'Greater Than or Equal',
  'π': 'Pi',
  '∑': 'N-Ary Summation',
  '∫': 'Integral',
  '√': 'Square Root',
  '∂': 'Partial Differential',
  '∇': 'Nabla',
  '⬡': 'Hexagon',
  '◆': 'Black Diamond'
};

export function describe(char) {
  if (NAME_HINTS[char]) return NAME_HINTS[char];
  const code = char.codePointAt(0);
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

export function getAllSymbols() {
  const seen = new Set();
  const out = [];
  for (const cat of SYMBOL_CATEGORIES) {
    for (const sym of cat.items) {
      if (typeof sym !== 'string' || sym.length === 0) continue;
      if (seen.has(sym)) continue;
      seen.add(sym);
      out.push({ char: sym, catId: cat.id });
    }
  }
  return out;
}

export function countTotal() {
  return getAllSymbols().length;
}
