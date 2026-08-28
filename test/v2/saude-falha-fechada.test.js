/**
 * A sonda de saúde tem de RESPONDER, não levantar.
 *
 * `avaliarSaude` já falhava fechado para qualquer retrato inválido — `null`,
 * texto, número — o que mostra que a robustez era intenção do desenho. O que
 * escapava era o Boot **levantar** ao ser perguntado: `verificar()` chamava
 * `boot.diagnostico()` sem guarda, então a exceção passava POR CIMA da proteção
 * em vez de por dentro dela.
 *
 * Por que isso é o pior modo de falha possível aqui: quem chama uma sonda de
 * saúde pergunta "está saudável?" para DECIDIR O QUE FAZER. Recebendo uma
 * exceção, o supervisor que devia reagir ao `unhealthy` morre junto com aquilo
 * que ia diagnosticar. E desde que o diagnóstico da Plataforma agrega várias
 * saúdes, uma sonda que estoura derruba o agregado inteiro.
 *
 * Os outros dois, na mesma família — o relatório dizendo coisas que não ajudam:
 *
 *   · retrato sem `fase` produzia "Core não está no ar: undefined" e fazia o
 *     campo `fase` sumir do JSON, porque `undefined` não serializa. O módulo já
 *     tinha a palavra certa (`desconhecida`) e não a usava aqui;
 *
 *   · `saude.d.ts` declara `contagem` como OBRIGATÓRIA e os caminhos de erro
 *     omitiam-na. Um consumidor TypeScript — `plataforma.ts` é um — escreve
 *     `s.contagem.modulos` confiando no tipo e apanha um TypeError exatamente
 *     quando o sistema já está doente.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { avaliarSaude, criarMonitorSaude } from '../../v2/core/saude.js';

const CONTAGEM_VAZIA = { modulos: 0, falhas: 0, eventosOrfaos: 0, referenciasOrfas: 0 };

test('boot que levanta devolve unhealthy em vez de propagar a exceção', () => {
  const monitor = criarMonitorSaude({
    diagnostico() { throw new Error('o boot rebentou'); },
  });
  const s = monitor.verificar();
  assert.equal(s.liveness, 'unhealthy');
  assert.equal(s.readiness, 'unhealthy');
});

test('o motivo distingue "o boot levantou" de "o boot não deu nada"', () => {
  /* São problemas diferentes e quem lê o motivo precisa saber qual foi: um é
   * código a rebentar, o outro é ausência de retrato. */
  const queLevanta = criarMonitorSaude({ diagnostico() { throw new Error('detalhe útil'); } });
  const queNadaDa = criarMonitorSaude({ diagnostico: () => null });

  assert.match(queLevanta.verificar().motivos.join(' '), /Boot levantou: detalhe útil/);
  assert.match(queNadaDa.verificar().motivos.join(' '), /retrato ausente/);
});

test('retrato() também não propaga, e mantém o estado publicado', () => {
  /* O outro caminho da mesma superfície: `retrato()` compõe `verificar()` com o
   * estado do supervisor, e levantava igual. */
  const monitor = criarMonitorSaude({ diagnostico() { throw new Error('x'); } });
  monitor.definirEstado('descendo');
  const r = monitor.retrato();
  assert.equal(r.liveness, 'unhealthy');
  assert.equal(r.estado, 'descendo');
});

test('boot que levanta algo que não é Error não quebra o registo', () => {
  for (const lixo of ['texto cru', null, 42]) {
    const monitor = criarMonitorSaude({ diagnostico() { throw lixo; } });
    const s = monitor.verificar();
    assert.equal(s.liveness, 'unhealthy');
    assert.equal(typeof s.motivos[0], 'string');
  }
});

test('a sonda continua a consultar o boot a cada chamada, mesmo depois de falhar', () => {
  /* Um boot que rebenta e depois recupera tem de ser visto a recuperar: cachear
   * o unhealthy deixaria o sistema marcado como doente para sempre. */
  let n = 0;
  const monitor = criarMonitorSaude({
    diagnostico() {
      n += 1;
      if (n === 1) throw new Error('primeira falhou');
      return { fase: 'no-ar', modulos: [{ id: 'x' }] };
    },
  });
  assert.equal(monitor.verificar().readiness, 'unhealthy');
  assert.equal(monitor.verificar().readiness, 'healthy', 'o unhealthy ficou cacheado');
  assert.equal(n, 2);
});

/* ═══════════ o relatório deixa de dizer "undefined" ═══════════ */

test('retrato sem fase usa a palavra que o módulo já tem', () => {
  const s = avaliarSaude({ modulos: [] });
  assert.equal(s.fase, 'desconhecida');
  assert.ok(!s.motivos.join(' ').includes('undefined'), s.motivos.join(' '));
});

test('fase vazia ou não-texto também vira desconhecida', () => {
  for (const ruim of ['', 42, null, {}, []]) {
    assert.equal(avaliarSaude({ fase: ruim, modulos: [] }).fase, 'desconhecida');
  }
});

test('a fase legítima continua a passar intacta', () => {
  /* A guarda não pode engolir o valor bom. */
  for (const boa of ['parado', 'subindo', 'no-ar', 'descendo']) {
    assert.equal(avaliarSaude({ fase: boa, modulos: [] }).fase, boa);
  }
});

test('o campo fase sobrevive a JSON.stringify', () => {
  /* `undefined` não serializa: o campo sumia do relatório inteiro, e quem lesse
   * o JSON não via sequer que havia uma fase para saber. */
  const serializado = JSON.parse(JSON.stringify(avaliarSaude({ modulos: [] })));
  assert.equal(serializado.fase, 'desconhecida');
});

/* ═══════════ o runtime honra o tipo declarado ═══════════ */

test('retrato ausente devolve a contagem que o .d.ts promete', () => {
  assert.deepEqual(avaliarSaude(null).contagem, CONTAGEM_VAZIA);
});

test('boot que levanta também devolve a contagem', () => {
  const monitor = criarMonitorSaude({ diagnostico() { throw new Error('x'); } });
  assert.deepEqual(monitor.verificar().contagem, CONTAGEM_VAZIA);
});

test('todo caminho de saída tem contagem — nenhum consumidor apanha undefined', () => {
  /* A asserção que importa: `s.contagem.modulos` é o que um consumidor
   * TypeScript escreve confiando no tipo, e tem de funcionar em TODOS. */
  const casos = [
    avaliarSaude(null),
    avaliarSaude('texto'),
    avaliarSaude(42),
    avaliarSaude({}),
    avaliarSaude({ fase: 'no-ar', modulos: [{ id: 'a' }] }),
    criarMonitorSaude({ diagnostico() { throw new Error('x'); } }).verificar(),
    criarMonitorSaude({ diagnostico: () => undefined }).verificar(),
  ];
  for (const s of casos) {
    assert.equal(typeof s.contagem?.modulos, 'number', JSON.stringify(s));
  }
});

test('a correção não mudou nada do que a saúde já garantia', () => {
  assert.equal(avaliarSaude({ fase: 'parado', modulos: [] }).liveness, 'unhealthy');
  assert.equal(avaliarSaude({ fase: 'no-ar', modulos: [], falhas: [] }).readiness, 'unhealthy');
  const vivo = avaliarSaude({ fase: 'no-ar', modulos: [{ id: 'x' }] });
  assert.equal(vivo.liveness, 'healthy');
  assert.equal(vivo.readiness, 'healthy');
  /* Falha de módulo continua a degradar o diagnóstico sem derrubar o veredito —
   * é a regra de isolamento do V2_HEALTH.md. */
  const comFalha = avaliarSaude({ fase: 'no-ar', modulos: [{ id: 'x' }], falhas: [{ id: 'y' }] });
  assert.equal(comFalha.readiness, 'healthy');
  assert.equal(comFalha.contagem.falhas, 1);
  assert.throws(() => criarMonitorSaude({}), /boot\.diagnostico é obrigatório/);
});
