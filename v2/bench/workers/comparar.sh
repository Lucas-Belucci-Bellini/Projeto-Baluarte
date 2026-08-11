#!/usr/bin/env bash
# O trabalho REAL dos workers, nas três linguagens candidatas.
#
# Não é um microbenchmark inventado: é `scripts/arma3/out/arma3-config.json`,
# 18,7 MB de dado que o Baluarte já processa hoje, com Python. A pergunta que
# isto responde é a que o operador pediu — *"Python ainda é a melhor escolha
# para esta responsabilidade?"* — e a resposta tinha que ser medida.
#
# O que se mede: ler do disco, desserializar, e percorrer o resultado contando
# chaves. O passeio existe para o compilador não descartar o trabalho e para o
# custo do modelo de objetos aparecer, que é onde as três diferem de verdade.
#
# Rodar: bash v2/bench/workers/comparar.sh
set -euo pipefail
cd "$(dirname "$0")"

ALVO="${1:-../../../scripts/arma3/out/arma3-config.json}"
if [ ! -f "$ALVO" ]; then
  echo "arquivo de medição ausente: $ALVO"
  echo "(é dado gerado; rode o pipeline do Arma 3 ou aponte para outro JSON grande)"
  exit 1
fi
echo "alvo: $(ls -la "$ALVO" | awk '{printf "%.1f MB", $5/1048576}')"
echo

echo "── Python 3.11 (json da stdlib) ──"
python3 - "$ALVO" <<'PY'
import json, sys, time, resource
t0 = time.perf_counter()
with open(sys.argv[1], 'rb') as f:
    dados = json.load(f)
t_parse = time.perf_counter() - t0

t1 = time.perf_counter()
def contar(v):
    if isinstance(v, dict):
        return len(v) + sum(contar(x) for x in v.values())
    if isinstance(v, list):
        return sum(contar(x) for x in v)
    return 0
n = contar(dados)
t_passeio = time.perf_counter() - t1
rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
print(f"  parse    {t_parse*1000:8.0f} ms")
print(f"  passeio  {t_passeio*1000:8.0f} ms   ({n} chaves)")
print(f"  memória  {rss:8.0f} MB (pico)")
PY

echo
echo "── Node 22 (JSON.parse) ──"
node --expose-gc - "$ALVO" <<'JS'
import { readFileSync } from 'node:fs';
const alvo = process.argv[2];
let t0 = performance.now();
const dados = JSON.parse(readFileSync(alvo, 'utf8'));
const tParse = performance.now() - t0;

t0 = performance.now();
const contar = (v) => {
  if (Array.isArray(v)) { let s = 0; for (const x of v) s += contar(x); return s; }
  if (v && typeof v === 'object') {
    const k = Object.keys(v);
    let s = k.length;
    for (const c of k) s += contar(v[c]);
    return s;
  }
  return 0;
};
const n = contar(dados);
const tPasseio = performance.now() - t0;
const rss = process.memoryUsage().rss / 1048576;
console.log(`  parse    ${tParse.toFixed(0).padStart(8)} ms`);
console.log(`  passeio  ${tPasseio.toFixed(0).padStart(8)} ms   (${n} chaves)`);
console.log(`  memória  ${rss.toFixed(0).padStart(8)} MB (rss)`);
JS

echo
echo "── Rust 1.94 (serde_json) ──"
if [ ! -f rust/target/release/bench-workers ]; then
  echo "  compilando…"
  (cd rust && cargo build --release -q)
fi
rust/target/release/bench-workers "$ALVO"

echo
echo "════ E onde Rust GANHA de verdade: trabalho de byte, sem JSON ════"
echo "(varredura de assinatura + hash rolante sobre os mesmos bytes —"
echo " é a forma do parser de .p3d/.pbo, que é CPU pura)"
echo
echo "── Python ──"
python3 - "$ALVO" <<'PY'
import sys, time
b = open(sys.argv[1],'rb').read()
t0 = time.perf_counter()
h = 0
achados = 0
for i in range(len(b)):
    h = (h * 31 + b[i]) & 0xFFFFFFFF
    if b[i] == 0x7B: achados += 1
print(f"  {(time.perf_counter()-t0)*1000:8.0f} ms   (hash {h:08x}, {achados} chaves-abre)")
PY

echo "── Node ──"
node - "$ALVO" <<'JS'
import { readFileSync } from 'node:fs';
const b = readFileSync(process.argv[2]);
const t0 = performance.now();
let h = 0, achados = 0;
for (let i = 0; i < b.length; i++) {
  h = (Math.imul(h, 31) + b[i]) >>> 0;
  if (b[i] === 0x7B) achados++;
}
console.log(`  ${(performance.now()-t0).toFixed(0).padStart(8)} ms   (hash ${h.toString(16).padStart(8,'0')}, ${achados} chaves-abre)`);
JS

echo "── Rust ──"
rust/target/release/bench-workers "$ALVO" --bytes
