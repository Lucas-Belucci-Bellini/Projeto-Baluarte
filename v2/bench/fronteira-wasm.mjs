/**
 * Quanto custa atravessar a fronteira JS↔WASM — o número que decide se um Core
 * em Rust faz sentido para o trabalho que o Core do Baluarte faz.
 *
 * ── A pergunta ─────────────────────────────────────────────────────────────
 * "Rust é mais rápido que JavaScript" é verdade e é irrelevante sozinho. O
 * Core do Baluarte roda no NAVEGADOR, e no navegador Rust só chega via WASM.
 * WASM não enxerga o DOM nem objetos JS: tudo que atravessa é número, ou bytes
 * copiados para a memória linear.
 *
 * O Core faz orquestração — casar nome de evento, achar um módulo, checar uma
 * permissão, decidir uma rota. Os dados são strings e objetos JS. Então a
 * conta que importa não é "quanto Rust economiza no cálculo", é:
 *
 *     economia no cálculo  −  custo de atravessar  =  ganho real
 *
 * E o custo de atravessar precisa ser medido, não estimado.
 *
 * Rodar:  cd v2/bench/rust-wasm && cargo build --release --target wasm32-unknown-unknown
 *         node v2/bench/fronteira-wasm.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const caminho = join(aqui, 'rust-wasm/target/wasm32-unknown-unknown/release/baluarte_bench.wasm');

let wasm;
try {
  const mod = await WebAssembly.compile(readFileSync(caminho));
  wasm = (await WebAssembly.instantiate(mod, {})).exports;
} catch (err) {
  console.error(`\n  Não achei o .wasm em ${caminho}`);
  console.error('  Rode: cd v2/bench/rust-wasm && cargo build --release --target wasm32-unknown-unknown\n');
  process.exit(1);
}

const fmt = (ns) => (ns >= 1000 ? `${(ns / 1000).toFixed(2)} µs` : `${ns.toFixed(1)} ns`);

/** @param {string} nome @param {number} vezes @param {() => any} fn */
function medir(nome, vezes, fn) {
  for (let i = 0; i < 50_000; i++) fn();          // aquece
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < vezes; i++) fn();
  const ns = Number(process.hrtime.bigint() - t0) / vezes;
  console.log(`  ${nome.padEnd(52)}${fmt(ns).padStart(10)}/op`);
  return ns;
}

const N = 2_000_000;
const r = {};

console.log('\n═══ A. O piso: atravessar sem fazer nada ═══');
r.jsSoma = medir('JS      soma(a,b)', N, () => jsSoma(3, 4));
r.wasmSoma = medir('WASM    soma(a,b) — só o custo da travessia', N, () => wasm.soma(3, 4));

function jsSoma(a, b) { return a + b; }

console.log('\n═══ B. O trabalho REAL do bus: casar um nome de evento ═══');
/* Do lado JS, o mapa é um Map<string, …> e o nome já é uma string JS. */
const mapaJs = new Map();
for (let i = 0; i < 64; i++) { mapaJs.set(`ev:${i}`, i); wasm.registrar(i); }
let contagemJs = 0;
const despacharJs = (nome) => { contagemJs++; return mapaJs.get(nome) ?? 0; };

r.jsDespacho = medir('JS      despachar("ev:7")', N, () => despacharJs('ev:7'));

/* Do lado WASM por ID numérico: o caso mais favorável possível — nada de texto
 * atravessa, e o Rust ainda assim precisa montar a chave. */
r.wasmId = medir('WASM    despachar(7)  — só número atravessa', N, () => wasm.despachar(7));

/* Do lado WASM por NOME: a forma real. O nome é string JS e precisa ser
 * copiado para a memória linear antes da chamada. */
const mem = new Uint8Array(wasm.memory.buffer, wasm.buf_ptr(), 256);
const enc = new TextEncoder();
/* `encodeInto` na view que já existe, em vez de `encode` (que aloca um
 * Uint8Array novo por chamada). Mesma regra que vale para o Rust: cada lado
 * medido na sua melhor forma, senão a conclusão é sobre quem escreveu. */
const despacharWasmStr = (nome) => {
  const { written } = enc.encodeInto(nome, mem);
  return wasm.despachar_str(written);
};
r.wasmStr = medir('WASM    despachar("ev:7") — com a cópia do texto', N, () => despacharWasmStr('ev:7'));

console.log('\n═══ C. Onde WASM ganha de verdade: cálculo puro ═══');
/* Mesma conta dos dois lados, sem nada atravessar por iteração. */
const trabalhoJs = (n) => { let s = 0; for (let i = 0; i < n; i++) s = (s * 31 + i) | 0; return s; };
const CICLOS = 200;
r.jsCalculo = medir(`JS      ${CICLOS} iterações de hash inteiro`, 200_000, () => trabalhoJs(CICLOS));
/* Não há equivalente exato exportado; o ponto de C é o contraste de ORDEM DE
 * GRANDEZA entre "trabalho por travessia" e "travessia". */

console.log('\n═══ VEREDICTO ═══');
const sobrecarga = r.wasmStr - r.jsDespacho;
console.log(`  Travessia crua (soma):        ${fmt(r.wasmSoma)}  vs  ${fmt(r.jsSoma)} em JS`);
console.log(`  Despacho de evento real:      ${fmt(r.wasmStr)}  vs  ${fmt(r.jsDespacho)} em JS`);
console.log(`  Diferença por evento:         ${sobrecarga >= 0 ? '+' : ''}${fmt(Math.abs(sobrecarga))} ${sobrecarga >= 0 ? 'MAIS CARO' : 'mais barato'} em WASM`);
console.log(`  Razão (WASM texto / JS):      ${(r.wasmStr / r.jsDespacho).toFixed(2)}×`);
console.log(`
  Leitura: a travessia por si só custa ${fmt(r.wasmSoma)}. Qualquer operação do
  Core que custe MENOS que isso do lado JS fica mais lenta em WASM, por
  definição — a conta que se economiza é menor que o pedágio que se paga.
`);
