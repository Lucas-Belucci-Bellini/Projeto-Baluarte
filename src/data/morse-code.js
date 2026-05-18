/**
 * Tabela de código Morse internacional (Fase 7).
 */

export const MORSE_TABLE = {
  /* Letras */
  A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',     F: '..-.',
  G: '--.',   H: '....',  I: '..',    J: '.---',  K: '-.-',   L: '.-..',
  M: '--',    N: '-.',    O: '---',   P: '.--.',  Q: '--.-',  R: '.-.',
  S: '...',   T: '-',     U: '..-',   V: '...-',  W: '.--',   X: '-..-',
  Y: '-.--',  Z: '--..',
  /* Acentuadas (PT-BR) */
  Á: '.--.-', É: '..-..', Í: '..',    Ó: '---.',  Ú: '..--',  Ç: '-.-..',
  Ñ: '--.--',
  /* Dígitos */
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  /* Pontuação */
  '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',  '!': '-.-.--',
  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',  '&': '.-...',   ':': '---...',
  ';': '-.-.-.',  '=': '-...-',   '+': '.-.-.',   '-': '-....-',  '_': '..--.-',
  '"': '.-..-.',  '$': '...-..-', '@': '.--.-.'
};

/* Inversa: morse → caractere */
export const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([k, v]) => [v, k])
);

/* Velocidade WPM padrão Morse: PARIS = 50 dits → 1 dit em ms */
export function wpmToDitMs(wpm) {
  return 1200 / wpm;
}

/**
 * Codifica texto → Morse.
 * Letras separadas por espaço, palavras separadas por ' / '.
 * Caracteres sem correspondência viram '#'.
 */
export function textToMorse(text) {
  return String(text)
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word]
        .map((ch) => MORSE_TABLE[ch] || (ch.trim() ? '#' : ''))
        .filter(Boolean)
        .join(' ')
    )
    .join(' / ');
}

/**
 * Decodifica Morse → texto.
 * Aceita palavras separadas por '/', '|' ou espaço duplo.
 */
export function morseToText(morse) {
  return String(morse)
    .trim()
    .replace(/\s*[/|]\s*/g, '  ')
    .split(/ {2,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => MORSE_REVERSE[code] || '�')
        .join('')
    )
    .join(' ');
}

/**
 * Converte uma string Morse numa lista de segmentos on/off (em ms),
 * respeitando o timing PARIS. Usado para áudio e flash visual.
 */
export function morseToSegments(morse, wpm) {
  const unit = wpmToDitMs(wpm);
  const segs = [];
  const tokens = morse.trim().split(/\s+/).filter(Boolean);

  tokens.forEach((tok, ti) => {
    if (tok === '/' || tok === '|') {
      segs.push({ on: false, ms: unit * 7, kind: 'word-gap' });
      return;
    }
    const symbols = [...tok];
    symbols.forEach((sym, si) => {
      segs.push({ on: true, ms: sym === '-' ? unit * 3 : unit, kind: sym === '-' ? 'dah' : 'dit' });
      if (si < symbols.length - 1) segs.push({ on: false, ms: unit, kind: 'sym-gap' });
    });
    const next = tokens[ti + 1];
    if (next && next !== '/' && next !== '|') {
      segs.push({ on: false, ms: unit * 3, kind: 'char-gap' });
    }
  });
  return segs;
}
