/**
 * Codificador de QR Code — implementação própria, sem dependências.
 *
 * Escopo: modo byte (UTF-8), nível de correção de erro L, versões 1–6
 * com interleaving multi-bloco (a v6 usa 2 blocos Reed-Solomon),
 * máscara fixa 0. Capacidade máxima ~134 bytes — cobre URLs, configs
 * de Wi-Fi e vCards curtos. `encodeQR(text)` devolve { version, size,
 * modules } ou lança erro se o texto não couber.
 */

/* ===== Campo de Galois GF(256) — polinômio primitivo 0x11D ===== */
const GF_EXP = new Array(512);
const GF_LOG = new Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/* Polinômio gerador Reed-Solomon de grau `deg` (comprimento deg+1). */
function rsGenerator(deg) {
  let poly = [1];
  for (let d = 0; d < deg; d++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let i = 0; i < poly.length; i++) {
      next[i] ^= poly[i];
      next[i + 1] ^= gfMul(poly[i], GF_EXP[d]);
    }
    poly = next;
  }
  return poly;
}

/* Codewords de correção de erro (Reed-Solomon) para `data`. */
function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const b of data) {
    const factor = b ^ res[0];
    res.shift();
    res.push(0);
    for (let i = 0; i < ecLen; i++) {
      res[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return res;
}

/* Versões suportadas — nível L.
 * blocks: lista de [quantidade, codewords de dados por bloco].
 * ecPerBlock: codewords de correção de erro por bloco.
 * align: coordenada do padrão de alinhamento central (0 = nenhum). */
const VERSIONS = {
  1: { blocks: [[1, 19]],  ecPerBlock: 7,  align: 0 },
  2: { blocks: [[1, 34]],  ecPerBlock: 10, align: 18 },
  3: { blocks: [[1, 55]],  ecPerBlock: 15, align: 22 },
  4: { blocks: [[1, 80]],  ecPerBlock: 20, align: 26 },
  5: { blocks: [[1, 108]], ecPerBlock: 26, align: 30 },
  6: { blocks: [[2, 68]],  ecPerBlock: 18, align: 34 }
};

const MAX_VERSION = 6;

/* Total de codewords de dados de uma versão. */
function dataCapacity(info) {
  return info.blocks.reduce((sum, [count, cw]) => sum + count * cw, 0);
}

/* Info de formato (15 bits): BCH(15,5) + máscara XOR. */
function formatBits(ecLevelBits, mask) {
  const data = (ecLevelBits << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

/** Codifica `text` num QR Code. */
export function encodeQR(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text)));

  /* Escolhe a menor versão que comporta os dados. */
  let version = 0;
  for (let v = 1; v <= MAX_VERSION; v++) {
    if (bytes.length <= dataCapacity(VERSIONS[v]) - 2) { version = v; break; }
  }
  if (version === 0) {
    throw new Error('Texto longo demais — máximo ~134 bytes (QR nível L, versões 1–6).');
  }
  const info = VERSIONS[version];
  const size = 17 + 4 * version;
  const totalData = dataCapacity(info);

  /* ===== Fluxo de bits ===== */
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4);           /* indicador de modo: byte */
  pushBits(bytes.length, 8);     /* contagem de caracteres (v1–9) */
  for (const b of bytes) pushBits(b, 8);

  const capacityBits = totalData * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  /* bits → codewords de dados */
  const dataCW = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataCW.push(b);
  }
  const pad = [0xec, 0x11];
  let pi = 0;
  while (dataCW.length < totalData) { dataCW.push(pad[pi++ % 2]); }

  /* ===== Blocos + correção de erro (Reed-Solomon por bloco) ===== */
  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (const [count, cw] of info.blocks) {
    for (let b = 0; b < count; b++) {
      const block = dataCW.slice(offset, offset + cw);
      offset += cw;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, info.ecPerBlock));
    }
  }

  /* Interleaving: codewords de dados e depois os de correção,
   * intercalados coluna a coluna entre os blocos. */
  const finalCW = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) finalCW.push(block[i]);
    }
  }
  const maxEc = Math.max(...ecBlocks.map((b) => b.length));
  for (let i = 0; i < maxEc; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) finalCW.push(block[i]);
    }
  }

  const finalBits = [];
  for (const cw of finalCW) {
    for (let i = 7; i >= 0; i--) finalBits.push((cw >> i) & 1);
  }

  /* ===== Matriz ===== */
  const m = Array.from({ length: size }, () => new Array(size).fill(0));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;
  const setFn = (r, c, v) => { if (inBounds(r, c)) { m[r][c] = v; fn[r][c] = true; } };

  /* Padrões localizadores (finders) + separadores */
  function finder(r0, c0) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inRing = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        let v = 0;
        if (inRing) {
          const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          v = edge || core ? 1 : 0;
        }
        setFn(r0 + dr, c0 + dc, v);
      }
    }
  }
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  /* Padrões de temporização (timing) */
  for (let i = 8; i < size - 8; i++) {
    const v = i % 2 === 0 ? 1 : 0;
    setFn(6, i, v);
    setFn(i, 6, v);
  }

  /* Módulo escuro fixo */
  setFn(size - 8, 8, 1);

  /* Padrão de alinhamento (versões 2–6: um, no centro) */
  if (info.align) {
    const a = info.align;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const ring = Math.max(Math.abs(dr), Math.abs(dc));
        setFn(a + dr, a + dc, ring === 1 ? 0 : 1);
      }
    }
  }

  /* Células reservadas para a info de formato */
  function formatCells() {
    const cells = [];
    for (let i = 0; i <= 5; i++) cells.push([i, 8]);
    cells.push([7, 8], [8, 8], [8, 7]);
    for (let i = 9; i < 15; i++) cells.push([8, 14 - i]);
    for (let i = 0; i < 8; i++) cells.push([8, size - 1 - i]);
    for (let i = 8; i < 15; i++) cells.push([size - 15 + i, 8]);
    return cells;
  }
  const fmtCells = formatCells();
  for (const [r, c] of fmtCells) fn[r][c] = true;

  /* ===== Dados em zigue-zague ===== */
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (!fn[row][col] && bi < finalBits.length) {
          m[row][col] = finalBits[bi++];
        }
      }
    }
  }

  /* ===== Máscara 0: (linha + coluna) par ===== */
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!fn[r][c] && (r + c) % 2 === 0) m[r][c] ^= 1;
    }
  }

  /* ===== Info de formato (nível L = 0b01, máscara 0) ===== */
  const fmt = formatBits(0b01, 0);
  const bit = (i) => (fmt >>> i) & 1;
  let k = 0;
  for (const [r, c] of fmtCells) {
    m[r][c] = bit(k < 15 ? k : k - 15);
    k++;
  }

  return { version, size, modules: m };
}
