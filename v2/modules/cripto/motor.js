/**
 * Motor de criptografia do módulo — funções puras, sem contexto e sem DOM.
 *
 * ── Por que é uma CÓPIA e não um import da V1 ───────────────────────────────
 * O `src/utils/cripto-engine.js` faz isto bem e tem 27 testes. Reescrever seria
 * violar a Regra 4 (não reescrever sem motivo) — a implementação está certa.
 *
 * Mas importá-lo daqui amarraria a V2 a um arquivo **congelado**: a V1 é
 * referência estável e não vai mudar, então a cópia não diverge por evolução —
 * ela diverge só se alguém mexer aqui de propósito, que é o comportamento certo
 * para código que agora pertence a outro projeto.
 *
 * A alternativa — a V2 importar da V1 — deixaria a reconstrução dependendo do
 * que ela está substituindo, e o dia do desligamento da V1 arrastaria isto
 * junto. **A duplicação aqui é o preço de poder desligar a V1 sem medo.**
 *
 * ── O que foi portado, e o que não ──────────────────────────────────────────
 * Só AES-GCM, hash e base64: o que este módulo usa. Os outros 20 exports da V1
 * (césar, vigenère, atbash, morse, OTP, esteganografia) ficam lá até alguém
 * precisar deles aqui — portar por precaução é carregar peso sem consumidor
 * (Regra 17).
 *
 * ── O que NÃO mudou na tradução ─────────────────────────────────────────────
 * Formato do envelope (`salt(16) || iv(12) || cifra`), 100 000 iterações de
 * PBKDF2 e SHA-256 na derivação. São compatíveis byte a byte com a V1 — texto
 * cifrado lá abre aqui. Mudar qualquer um desses números tornaria o dado antigo
 * ilegível, que é a forma mais direta de perder o que o operador guardou.
 */

const ITERACOES_PBKDF2 = 100_000;
const TAMANHO_SALT = 16;
const TAMANHO_IV = 12;

/** Algoritmos de hash aceitos. Lista fechada: nome livre viraria erro do WebCrypto. */
export const ALGOS_HASH = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

/** @param {number} tamanho */
export function bytesAleatorios(tamanho) {
  const bytes = new Uint8Array(tamanho);
  crypto.getRandomValues(bytes);
  return bytes;
}

/** @param {Uint8Array} bytes */
export function bytesParaBase64(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/**
 * @param {string} b64
 * @returns {Uint8Array|null} `null` quando não é base64 — não levanta, porque
 * a entrada vem do operador e texto colado errado é caso normal, não excepcional
 */
export function base64ParaBytes(b64) {
  try {
    const bin = atob(b64.trim());
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/**
 * @param {string} senha
 * @param {Uint8Array} salt
 */
async function derivarChave(senha, salt) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERACOES_PBKDF2, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * @param {string} texto
 * @param {string} [algo]
 */
export async function hash(texto, algo = 'SHA-256') {
  if (!ALGOS_HASH.includes(algo)) throw new Error(`algoritmo desconhecido: ${algo}`);
  const buf = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest(algo, buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cifra com AES-GCM. Salt e IV novos a cada chamada — reusar IV em GCM quebra
 * a garantia do modo, e é o erro clássico de quem "otimiza" derivação de chave.
 *
 * @param {string} texto
 * @param {string} senha
 * @returns {Promise<string>} base64 de `salt || iv || cifra`
 */
export async function cifrar(texto, senha) {
  if (!senha) throw new Error('senha vazia');
  const salt = bytesAleatorios(TAMANHO_SALT);
  const iv = bytesAleatorios(TAMANHO_IV);
  const chave = await derivarChave(senha, salt);
  const cifra = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, chave, new TextEncoder().encode(texto)
  );

  const saida = new Uint8Array(salt.length + iv.length + cifra.byteLength);
  saida.set(salt, 0);
  saida.set(iv, salt.length);
  saida.set(new Uint8Array(cifra), salt.length + iv.length);
  return bytesParaBase64(saida);
}

/**
 * @param {string} b64
 * @param {string} senha
 */
export async function decifrar(b64, senha) {
  if (!senha) throw new Error('senha vazia');
  const tudo = base64ParaBytes(b64);
  /* 16 de tag do GCM além do salt e do IV: menos que isso não é cifra deste
   * formato, e tentar decifrar daria um erro do WebCrypto sem explicação. */
  if (!tudo || tudo.length < TAMANHO_SALT + TAMANHO_IV + 16) {
    throw new Error('dados muito curtos para ser uma cifra deste formato');
  }
  const salt = tudo.slice(0, TAMANHO_SALT);
  const iv = tudo.slice(TAMANHO_SALT, TAMANHO_SALT + TAMANHO_IV);
  const cifra = tudo.slice(TAMANHO_SALT + TAMANHO_IV);
  const chave = await derivarChave(senha, salt);
  const claro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, chave, cifra);
  return new TextDecoder().decode(claro);
}
