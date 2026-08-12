/**
 * O motor de criptografia — a cobertura que faltava para `cripto` ser estável.
 *
 * `cripto` está marcado **`estavel`** em `src/core/politica.js`, e a definição
 * da 1.0.0 diz que estável é *previsível, **testado**, recuperável e seguro*.
 * Até aqui, `cripto-engine.js` tinha 372 linhas e 26 exports, e os testes
 * importavam **dois** (`toMorse`/`fromMorse`). Vinte e quatro funções — AES,
 * OTP, base64/32/hex, vigenère, atbash, césar e os hashes — sustentavam uma
 * promessa que nada verificava.
 *
 * ── O que estes testes cobram, e por quê ────────────────────────────────────
 * A afirmação central é **ida e volta**: `decode(encode(x)) === x`. Numa
 * ferramenta de cifra, essa é a única propriedade que o operador realmente
 * depende — ele cola um texto, guarda o resultado, e um dia precisa de volta.
 * Cifra que codifica bonito e não destrava destrói dado em silêncio, e o
 * sintoma só aparece quando já é tarde.
 *
 * Os testes afirmam ida-e-volta em vez de saídas literais de propósito: fixar
 * a saída exata congelaria detalhes de implementação (padding, caixa,
 * separador) que ninguém prometeu, e o teste passaria a reprovar refatoração
 * legítima em vez de defeito.
 *
 * ── A armadilha que já mordeu este projeto ──────────────────────────────────
 * `test/campo.test.js` registra que a implementação de morse de `/cripto`
 * **descartava em silêncio** todo caractere fora do alfabeto — o operador
 * colava um texto com acento e recebia outro de volta, sem aviso. Este é um
 * projeto em português: acento não é caso exótico, é o caso comum. Por isso
 * cada cifra é testada com "coração", "ação" e "ÁÉÍÓÚ" — não para exigir que
 * todas cifrem acento (césar sobre A–Z legitimamente não cifra), mas para
 * exigir que nenhuma **engula** o que não sabe cifrar.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  caesarEncode, caesarDecode, caesarBruteforce,
  vigenereEncode, vigenereDecode, atbash,
  toBase64, fromBase64, toBase32, fromBase32, toHex, fromHex,
  hashText, randomBytes, otpEncode,
  textToBytes, bytesToText, bytesToBase64, base64ToBytes,
  aesEncrypt, aesDecrypt
} from '../src/utils/cripto-engine.js';

/* Frases de prova. A terceira existe porque este projeto é em português e a
 * armadilha documentada em campo.test.js foi exatamente essa. */
const SIMPLES = 'O baluarte nao cede';
const ACENTUADA = 'A ação do coração é única — não cede!';
const SIMBOLOS = '{"n":42} <tag> 100% \\ / \n\ttab';

/* ===== César ===== */

test('césar: ida e volta em qualquer deslocamento', () => {
  for (let s = 0; s < 26; s += 1) {
    assert.equal(caesarDecode(caesarEncode(SIMPLES, s), s), SIMPLES, `shift ${s}`);
  }
});

test('césar: NÃO engole acento nem pontuação — devolve o que não cifra', () => {
  /* A–Z não cobre "ç" nem "ã", e tudo bem. O defeito seria sumir com eles. */
  const cifrado = caesarEncode(ACENTUADA, 7);
  assert.equal(caesarDecode(cifrado, 7), ACENTUADA);
  for (const ch of ['ç', 'ã', 'é', '—', '!']) {
    assert.ok(cifrado.includes(ch), `césar engoliu "${ch}"`);
  }
});

test('césar: deslocamento 0 e 26 são identidade', () => {
  assert.equal(caesarEncode(SIMPLES, 0), SIMPLES);
  assert.equal(caesarEncode(SIMPLES, 26), SIMPLES);
});

test('césar: deslocamento negativo não quebra (normaliza)', () => {
  assert.equal(caesarDecode(caesarEncode(SIMPLES, -3), -3), SIMPLES);
});

test('césar: a força bruta contém a resposta certa', () => {
  const cifrado = caesarEncode(SIMPLES, 11);
  const todas = caesarBruteforce(cifrado).map((r) => r.text);
  assert.ok(todas.includes(SIMPLES), 'o texto original não apareceu entre as 26');
});

/* ===== Vigenère ===== */

test('vigenère: ida e volta', () => {
  assert.equal(vigenereDecode(vigenereEncode(SIMPLES, 'BALUARTE'), 'BALUARTE'), SIMPLES);
  assert.equal(vigenereDecode(vigenereEncode(ACENTUADA, 'chave'), 'chave'), ACENTUADA);
});

test('vigenère: chave sem letra nenhuma devolve o texto intacto', () => {
  /* Decisão da implementação: chave vazia após limpar não-A–Z = sem cifra.
   * O que NÃO pode é devolver vazio ou lixo. */
  assert.equal(vigenereEncode(SIMPLES, '1234'), SIMPLES);
  assert.equal(vigenereEncode(SIMPLES, ''), SIMPLES);
});

test('vigenère: chaves diferentes dão resultados diferentes', () => {
  assert.notEqual(vigenereEncode(SIMPLES, 'ALFA'), vigenereEncode(SIMPLES, 'BRAVO'));
});

/* ===== Atbash ===== */

test('atbash: é a própria inversa', () => {
  assert.equal(atbash(atbash(SIMPLES)), SIMPLES);
  assert.equal(atbash(atbash(ACENTUADA)), ACENTUADA);
});

/* ===== Codificações ===== */

test('base64: ida e volta, inclusive com acento e símbolos', () => {
  for (const t of [SIMPLES, ACENTUADA, SIMBOLOS, '']) {
    assert.equal(fromBase64(toBase64(t)), t, `base64 falhou em ${JSON.stringify(t)}`);
  }
});

test('base32: ida e volta, inclusive com acento e símbolos', () => {
  for (const t of [SIMPLES, ACENTUADA, SIMBOLOS, '']) {
    assert.equal(fromBase32(toBase32(t)), t, `base32 falhou em ${JSON.stringify(t)}`);
  }
});

test('hex: ida e volta, inclusive com acento e símbolos', () => {
  for (const t of [SIMPLES, ACENTUADA, SIMBOLOS, '']) {
    assert.equal(fromHex(toHex(t)), t, `hex falhou em ${JSON.stringify(t)}`);
  }
});

test('as codificações preservam byte a byte — nada de perder o acento no caminho', () => {
  /* O `ç` é 2 bytes em UTF-8. Um encoder que trabalhe em char em vez de byte
   * volta com o caractere trocado, e o operador só percebe lendo. */
  const so = 'çãõéÁ';
  assert.equal(fromBase64(toBase64(so)), so);
  assert.equal(fromBase32(toBase32(so)), so);
  assert.equal(fromHex(toHex(so)), so);
});

/* ===== bytes <-> texto ===== */

test('textToBytes / bytesToText: ida e volta', () => {
  for (const t of [SIMPLES, ACENTUADA, SIMBOLOS]) {
    assert.equal(bytesToText(textToBytes(t)), t);
  }
});

test('bytesToBase64 / base64ToBytes: ida e volta em bytes crus', () => {
  const b = randomBytes(64);
  assert.deepEqual([...base64ToBytes(bytesToBase64(b))], [...b]);
});

/* ===== OTP ===== */

test('OTP: XOR duas vezes com a mesma chave devolve o original', () => {
  const texto = textToBytes(ACENTUADA);
  const chave = randomBytes(texto.length);
  const cifrado = otpEncode(texto, chave);
  assert.deepEqual([...otpEncode(cifrado, chave)], [...texto]);
  assert.equal(bytesToText(otpEncode(cifrado, chave)), ACENTUADA);
});

test('OTP: chave curta é RECUSADA, não truncada em silêncio', () => {
  /* Reusar chave em OTP destrói a garantia inteira. Falhar alto é o certo. */
  const texto = textToBytes('mensagem longa o suficiente');
  assert.throws(() => otpEncode(texto, randomBytes(3)), /pelo menos/i);
});

test('randomBytes: devolve o tamanho pedido e não repete', () => {
  assert.equal(randomBytes(32).length, 32);
  assert.notDeepEqual([...randomBytes(32)], [...randomBytes(32)]);
});

/* ===== Hashes ===== */

test('hash: vetor conhecido de SHA-256 para a string vazia', () => {
  /* Vetor público do NIST — se este mudar, a implementação está errada, não o
   * teste. É o único lugar deste arquivo onde a saída literal é afirmada, e é
   * legítimo porque SHA-256 é um padrão, não uma escolha nossa. */
  return hashText('', 'SHA-256').then((h) => {
    assert.equal(h.toLowerCase(),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

test('hash: determinístico e sensível a um caractere', async () => {
  assert.equal(await hashText(SIMPLES), await hashText(SIMPLES));
  assert.notEqual(await hashText(SIMPLES), await hashText(SIMPLES + '.'));
});

test('hash: algoritmo inválido falha alto, não devolve vazio', async () => {
  await assert.rejects(() => hashText('x', 'MD5-INVENTADO'), /inválido/i);
});

/* ===== AES ===== */

test('AES: ida e volta com senha', async () => {
  for (const t of [SIMPLES, ACENTUADA, SIMBOLOS]) {
    const c = await aesEncrypt(t, 'senha-forte-123');
    assert.equal(await aesDecrypt(c, 'senha-forte-123'), t);
  }
});

test('AES: senha errada REJEITA — não devolve lixo como se fosse texto', async () => {
  /* O modo de falha perigoso seria devolver bytes aleatórios sem erro: o
   * operador acharia que o texto foi corrompido, não que errou a senha. */
  const c = await aesEncrypt(SIMPLES, 'certa');
  await assert.rejects(() => aesDecrypt(c, 'errada'));
});

test('AES: salt E IV são sorteados a cada cifragem — conferidos separadamente', async () => {
  /* ⚠️ Este teste já teve uma versão inútil. Ela afirmava "salt/IV novos" mas
   * só comparava a saída inteira — e com IV FIXO a saída continua diferente,
   * porque o salt aleatório muda a chave derivada e portanto o texto cifrado.
   * Descoberto plantando `iv = new Uint8Array(12)`: os 26 testes passaram.
   *
   * A saída é `salt(16) || iv(12) || cifra`, então dá para conferir cada campo
   * em vez de confiar que "diferente no todo" implica "diferente em tudo".
   *
   * Vale registrar por que IV fixo aqui não seria catastrófico, para ninguém
   * ler este teste como alarme maior do que é: em GCM o desastre é reusar o par
   * (chave, IV), e o salt aleatório já faz a chave mudar a cada mensagem. Ainda
   * assim é enfraquecimento gratuito, e a promessa do nome do teste tem que ser
   * a promessa que ele cobra. */
  const a = base64ToBytes(await aesEncrypt(SIMPLES, 'senha'));
  const b = base64ToBytes(await aesEncrypt(SIMPLES, 'senha'));

  const salt = (u) => [...u.slice(0, 16)];
  const iv = (u) => [...u.slice(16, 28)];

  assert.notDeepEqual(salt(a), salt(b), 'o salt repetiu entre duas cifragens');
  assert.notDeepEqual(iv(a), iv(b), 'o IV repetiu entre duas cifragens');
  assert.ok(salt(a).some((x) => x !== 0), 'salt todo zero não é sorteio');
  assert.ok(iv(a).some((x) => x !== 0), 'IV todo zero não é sorteio');
});

test('AES: cifragens diferentes do mesmo texto destravam no mesmo original', async () => {
  const a = await aesEncrypt(SIMPLES, 'senha');
  const b = await aesEncrypt(SIMPLES, 'senha');
  assert.notEqual(a, b);
  assert.equal(await aesDecrypt(a, 'senha'), SIMPLES);
  assert.equal(await aesDecrypt(b, 'senha'), SIMPLES);
});

test('AES: senha vazia é recusada nos dois sentidos', async () => {
  await assert.rejects(() => aesEncrypt(SIMPLES, ''), /senha vazia/i);
  await assert.rejects(() => aesDecrypt('qualquer', ''), /senha vazia/i);
});

test('AES: entrada truncada falha com mensagem, não com stack de baixo nível', async () => {
  await assert.rejects(() => aesDecrypt(toBase64('curto'), 'senha'), /curtos|inválid/i);
});
