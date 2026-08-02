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
  /* Acentuadas com código PRÓPRIO no Morse internacional.
   *
   * `Í: '..'` já esteve nesta lista e era um erro grave: '..' é o I, e como a
   * inversa é construída varrendo a tabela, o último a escrever vencia — toda
   * decodificação devolvia Í no lugar de I. "SIM" virava "SÍM", "INDIA" virava
   * "ÍNDÍA". O Morse internacional não tem Í; quem não tem código é dobrado
   * para a letra-base em `textToMorse`. */
  Á: '.--.-', É: '..-..', Ó: '---.',  Ú: '..--',  Ç: '-.-..',
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

/* Inversa: morse → caractere.
 *
 * Só é bem-definida porque a tabela não tem dois caracteres com o mesmo código
 * — se voltar a ter, o último silenciosamente vence e a decodificação passa a
 * mentir. Há teste cobrindo exatamente isso. */
export const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([k, v]) => [v, k])
);

/* Acentos que o Morse internacional NÃO distingue: valem pela letra-base.
 * Sem isto, "índia" e "você" saem cheios de '#' — que é pior do que a perda do
 * acento, porque perde a letra inteira. */
const SEM_CODIGO = {
  À: 'A', Â: 'A', Ã: 'A', Ä: 'A',
  Ê: 'E', Ë: 'E',
  Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
  Ò: 'O', Ô: 'O', Õ: 'O', Ö: 'O',
  Ù: 'U', Û: 'U', Ü: 'U'
};

/* Velocidade WPM padrão Morse: PARIS = 50 dits → 1 dit em ms */
export function wpmToDitMs(wpm) {
  return 1200 / wpm;
}

/**
 * Codifica texto → Morse.
 * Letras separadas por espaço, palavras separadas por ' / '.
 * Acento sem código próprio vale pela letra-base; o resto vira '#'.
 */
export function textToMorse(text) {
  const codigo = (ch) => MORSE_TABLE[ch] || MORSE_TABLE[SEM_CODIGO[ch]] || (ch.trim() ? '#' : '');
  return String(text)
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word]
        .map(codigo)
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
