// Gera build/icon.png (512×512) — sem dependência: encoder PNG mínimo via zlib.
// Visual: fundo escuro do projeto + anel arc-reactor ciano + núcleo magenta,
// no mesmo espírito do herói 3D da home. Rode: `node build/make-icon.mjs`.
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const S = 512, C = S / 2;
const px = Buffer.alloc(S * S * 4);

const smooth = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const dx = x - C, dy = y - C;
    const d = Math.hypot(dx, dy);

    // fundo escuro #06080d
    let r = 6, g = 8, b = 13;

    // brilho central suave (ciano)
    const core = smooth(150, 0, d);
    r = mix(r, 0, core * 0.4); g = mix(g, 120, core); b = mix(b, 150, core);

    // anel arc-reactor ciano (banda ~[150,196])
    const ring = smooth(150, 162, d) * smooth(196, 184, d);
    r = mix(r, 0, ring); g = mix(g, 240, ring); b = mix(b, 255, ring);

    // núcleo magenta
    const dot = smooth(44, 30, d);
    r = mix(r, 255, dot); g = mix(g, 0, dot); b = mix(b, 170, dot);

    const i = (y * S + x) * 4;
    px[i] = Math.round(r); px[i + 1] = Math.round(g); px[i + 2] = Math.round(b); px[i + 3] = 255;
  }
}

// --- encoder PNG (RGBA, sem filtro) ---
const raw = Buffer.alloc(S * (1 + S * 4));
for (let y = 0; y < S; y++) {
  raw[y * (1 + S * 4)] = 0; // filtro 0
  px.copy(raw, y * (1 + S * 4) + 1, y * S * 4, (y + 1) * S * 4);
}

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'icon.png');
writeFileSync(out, png);
console.log('icon.png gerado:', out, `(${png.length} bytes)`);
