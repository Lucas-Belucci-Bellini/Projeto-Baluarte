/* O vocabulário de "por que falta imagem" existe em DUAS linguagens.
 *
 * O gerador (Python) escreve o código em `imgAusente`; a wiki (JS) traduz esse
 * código em frase. Se um lado ganhar um motivo novo e o outro não, nada quebra:
 * a wiki mostra o texto padrão ("sem ícone extraído") e o motivo real — o que
 * mandaria o operador rodar o extrator, ou dumpar a CfgVehicleIcons, ou nada —
 * se perde calado. É o defeito clássico deste repositório: duas versões da
 * mesma regra divergindo sem barulho.
 *
 * Por isso o teste lê o `.py` DE VERDADE em vez de repetir a lista aqui:
 * repetir criaria a terceira cópia do mesmo problema.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { MOTIVO_SEM_IMG, motivoSemImagem } from '../src/data/arma3-imagens.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const PY = join(AQUI, '..', 'scripts', 'arma3', 'gerar_imagens_comum.py');

/* As constantes do Python: `SEM_PICTURE = 'sem-picture-no-config'` e irmãs.
 * Só as de nível de módulo em MAIÚSCULA — nomes locais não são vocabulário. */
function motivosDoPython() {
  const src = readFileSync(PY, 'utf8');
  const achados = [];
  for (const linha of src.split('\n')) {
    const m = /^([A-Z][A-Z0-9_]*)\s*=\s*'([a-z0-9-]+)'\s*$/.exec(linha);
    if (m) achados.push({ nome: m[1], valor: m[2] });
  }
  return achados;
}

test('o teste consegue mesmo ler as constantes do gerador', () => {
  const py = motivosDoPython();
  assert.ok(py.length >= 3,
    `só ${py.length} constante(s) lida(s) de ${PY} — se o formato do arquivo ` +
    'mudou, este teste passaria a não provar nada');
  assert.ok(py.some((c) => c.nome === 'SEM_PICTURE'),
    'SEM_PICTURE sumiu do gerador (ou o regex parou de casar)');
});

test('todo motivo que o Python escreve tem frase em português no JS', () => {
  for (const { nome, valor } of motivosDoPython()) {
    assert.ok(valor in MOTIVO_SEM_IMG,
      `${nome} = "${valor}" existe no gerador e não em src/data/arma3-imagens.js — ` +
      'a wiki mostraria o texto genérico e perderia a instrução');
  }
});

test('e o JS não inventa motivo que o gerador nunca escreve', () => {
  const doPy = new Set(motivosDoPython().map((c) => c.valor));
  for (const chave of Object.keys(MOTIVO_SEM_IMG)) {
    assert.ok(doPy.has(chave),
      `"${chave}" está no JS e não é constante do gerador — motivo morto`);
  }
});

test('as frases são frases: não vazias e não o próprio código', () => {
  for (const [codigo, frase] of Object.entries(MOTIVO_SEM_IMG)) {
    assert.ok(frase.trim().length > 20, `${codigo}: frase curta demais`);
    assert.notEqual(frase, codigo);
  }
});

test('motivo desconhecido não estoura — cai num texto honesto', () => {
  assert.equal(typeof motivoSemImagem('coisa-que-nao-existe'), 'string');
  assert.ok(motivoSemImagem(undefined).length > 0);
  assert.ok(motivoSemImagem('').length > 0);
});
