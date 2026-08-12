/**
 * O primeiro módulo escrito PARA a V2.
 *
 * Duas coisas são testadas aqui, e a segunda é a que importa mais:
 *
 * 1. **O motor funciona** — inclusive compatível byte a byte com a V1, porque
 *    texto cifrado lá tem que abrir aqui. Mudar iterações, salt ou formato
 *    tornaria ilegível o que o operador guardou.
 * 2. **O módulo se comporta como módulo** — sobe pelo ciclo, recebe contexto
 *    recortado, oferece api a outro módulo, e desmonta sem deixar referência.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import cripto from '../../v2/modules/cripto/module.js';
import { cifrar, decifrar, hash, base64ParaBytes, ALGOS_HASH } from '../../v2/modules/cripto/motor.js';
import { validar } from '../../v2/core/manifest.js';
import { criarRegistry } from '../../v2/core/registry.js';
import { criarCiclo } from '../../v2/core/ciclo.js';
import { criarResolvedorApi } from '../../v2/core/api.js';
import { criarMetricas } from '../../v2/core/metricas.js';
import { criarEscalonador } from '../../v2/core/trabalho.js';
import { criarBus } from '../../v2/core/bus.js';

/* ═══════════ o motor ═══════════ */

test('cifra e decifra, com acento', async () => {
  const claro = 'coração — ação · 日本';
  assert.equal(await decifrar(await cifrar(claro, 'senha'), 'senha'), claro);
});

test('senha errada NÃO decifra', async () => {
  const c = await cifrar('segredo', 'certa');
  await assert.rejects(() => decifrar(c, 'errada'));
});

test('cada cifragem usa salt e IV NOVOS', async () => {
  /* Reusar IV em GCM quebra a garantia do modo. Comparar só a saída inteira não
   * provaria: o salt aleatório já a faz diferir. Decompõe-se o envelope. */
  const a = base64ParaBytes(await cifrar('x', 's'));
  const b = base64ParaBytes(await cifrar('x', 's'));

  assert.notDeepEqual([...a.slice(0, 16)], [...b.slice(0, 16)], 'salt repetido');
  assert.notDeepEqual([...a.slice(16, 28)], [...b.slice(16, 28)], 'IV repetido');
});

test('senha vazia é recusada nos dois sentidos', async () => {
  await assert.rejects(() => cifrar('x', ''), /senha vazia/);
  await assert.rejects(() => decifrar('AAAA', ''), /senha vazia/);
});

test('entrada curta demais diz o que está errado', async () => {
  /* Sem esta checagem o WebCrypto dá um erro sem explicação. */
  await assert.rejects(() => decifrar('AAAA', 's'), /muito curtos/);
});

test('base64 inválido devolve null em vez de levantar', async () => {
  /* Texto colado errado é caso normal, não excepcional. */
  assert.equal(base64ParaBytes('não é base64 %%%'), null);
});

test('hash conhecido bate', async () => {
  assert.equal(
    await hash(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
});

test('algoritmo desconhecido é recusado, não passado adiante', async () => {
  await assert.rejects(() => hash('x', 'MD5'), /desconhecido/);
  for (const a of ALGOS_HASH) assert.ok(await hash('x', a));
});

test('COMPATIBILIDADE: o que a V1 cifrou, a V2 decifra', async () => {
  /* O ponto do porte fiel. Se este teste cair, o formato divergiu e o operador
   * perde o que guardou. */
  const { aesEncrypt } = await import('../../src/utils/cripto-engine.js');
  const daV1 = await aesEncrypt('mensagem da V1', 'senha-comum');
  assert.equal(await decifrar(daV1, 'senha-comum'), 'mensagem da V1');
});

test('COMPATIBILIDADE: o que a V2 cifrou, a V1 decifra', async () => {
  const { aesDecrypt } = await import('../../src/utils/cripto-engine.js');
  const daV2 = await cifrar('mensagem da V2', 'senha-comum');
  assert.equal(await aesDecrypt(daV2, 'senha-comum'), 'mensagem da V2');
});

/* ═══════════ o módulo ═══════════ */

test('o manifesto é válido', () => {
  const r = validar(cripto);
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('declara permissão NENHUMA — e isso é afirmação, não esquecimento', () => {
  /* Cifrar texto digitado não toca arquivo, rede nem banco. `USER_DATA` seria
   * tentador e errado: o texto nunca sai daqui. */
  assert.deepEqual(cripto.permissions, []);
});

test('a chave de storage respeita o namespace do módulo', () => {
  for (const s of cripto.storage) assert.ok(s.key.startsWith('cripto:'), s.key);
});

function montar() {
  const registry = criarRegistry();
  registry.registrar(cripto);
  registry.selar();

  const metricas = criarMetricas();
  const dados = {};
  const ciclo = criarCiclo(registry, {
    storage: { get: (k) => dados[k], set: (k, v) => { dados[k] = v; return true; } },
    bus: criarBus(),
    metricas,
    trabalho: criarEscalonador({}, { metricas }),
    apis: criarResolvedorApi(registry)
  });
  return { registry, ciclo, metricas, dados };
}

test('sobe pelo ciclo e o init recebe o contexto recortado', async () => {
  const { ciclo } = montar();
  const r = await ciclo.subir();
  assert.equal(r.ok, true, JSON.stringify(r.falhas));

  const ctx = ciclo.contexto('cripto');
  assert.equal(ctx.modulo, 'cripto');
  assert.deepEqual(ctx.storage.chaves(), ['cripto:painel']);
  assert.equal(ctx.pode('NETWORK'), false, 'ganhou permissão que não declarou');
  await ciclo.descer();
});

test('a view falha ALTO se pedida antes do init', async () => {
  /* Tela morta que parece funcionar é pior que erro. */
  const { criarView } = await import('../../v2/modules/cripto/view.js');
  assert.throws(() => criarView(null), /não está no ar/);
});

test('OUTRO módulo usa a api de cifra pelo contrato', async () => {
  /* É o caminho legítimo que substitui "importar o arquivo do outro". */
  const registry = criarRegistry();
  registry.registrar(cripto);
  registry.registrar({
    id: 'jarvis', name: 'JARVIS', version: '1.0.0', dependencies: ['cripto'],
    routes: [{ path: '/jarvis', view: () => Promise.resolve({}) }]
  });
  registry.selar();

  const apis = criarResolvedorApi(registry);
  const motor = apis.usar('jarvis', ['cripto'], 'cripto', { versao: 1 });

  const c = await motor.cifrar('anotação do jarvis', 'chave');
  assert.equal(await motor.decifrar(c, 'chave'), 'anotação do jarvis');
  assert.deepEqual(motor.algos(), ALGOS_HASH);
});

test('quem NÃO declarou dependência não alcança a api', async () => {
  const registry = criarRegistry();
  registry.registrar(cripto);
  registry.registrar({ id: 'intruso', name: 'I', version: '1.0.0',
    routes: [{ path: '/i', view: () => Promise.resolve({}) }] });
  registry.selar();

  const apis = criarResolvedorApi(registry);
  assert.throws(() => apis.usar('intruso', [], 'cripto'), /não declarou depender/);
});

test('dispose solta a referência ao contexto', async () => {
  /* Módulo desmontado que segura o contexto impede o Core de ser coletado — e
   * isso só aparece depois de subir e descer mil vezes. */
  const { ciclo } = montar();
  await ciclo.subir();
  await ciclo.descer();

  const { criarView } = await import('../../v2/modules/cripto/view.js');
  assert.throws(() => criarView(null), /não está no ar/);
});

test('sobe e desce várias vezes sem acumular estado', async () => {
  const { ciclo } = montar();
  for (let i = 0; i < 3; i++) {
    const r = await ciclo.subir();
    assert.equal(r.ok, true, `ciclo ${i}: ${JSON.stringify(r.falhas)}`);
    await ciclo.descer();
  }
});
