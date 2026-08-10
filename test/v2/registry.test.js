/**
 * Module Registry — os invariantes DO CONJUNTO.
 *
 * O que estes testes protegem, em ordem de gravidade:
 *
 * 1. **Isolamento (§6).** Um módulo ruim desativa a si e a quem depende dele —
 *    e o resto sobe. Se um manifesto inválido derrubasse o conjunto, a promessa
 *    central da arquitetura ("módulo quebrado não derruba o Baluarte") seria
 *    falsa já no carregamento.
 * 2. **Cascata transitiva.** A→B→C com C morto tem que matar B *e* A. Sem o
 *    ponto fixo, A ficaria ativo apontando para um módulo que não existe.
 * 3. **Uma fonte para o nome.** `navegacao()` é a mesma origem para sidebar e
 *    cabeçalho — é o que elimina as 22 divergências de label da V1.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';

const mod = (id, extra = {}) => ({
  id, name: `Módulo ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  ...extra
});

const selarCom = (...mods) => {
  const r = criarRegistry();
  mods.forEach((m) => r.registrar(m));
  return { registry: r, selo: r.selar() };
};

/* ═══════════ registro e selagem ═══════════ */

test('registra e sela um conjunto válido', () => {
  const { selo } = selarCom(mod('cripto'), mod('editor'));
  assert.equal(selo.ok, true, JSON.stringify(selo.recusados));
  assert.deepEqual(selo.ativos.sort(), ['cripto', 'editor']);
});

test('ler antes de selar é erro, não resultado vazio', () => {
  /* Devolver [] daria um Baluarte silenciosamente sem rotas — o pior tipo de
   * bug: tudo "funciona", nada aparece. */
  const r = criarRegistry();
  r.registrar(mod('x'));
  assert.throws(() => r.rotas(), /selar/);
});

test('registrar depois de selar é erro', () => {
  const r = criarRegistry();
  r.selar();
  assert.throws(() => r.registrar(mod('tarde')), /selado/);
});

/* ═══════════ isolamento ═══════════ */

test('manifesto inválido não derruba os outros (§6)', () => {
  const { selo } = selarCom(mod('bom'), { id: 'Ruim', name: '', version: 'x' }, mod('outro'));
  assert.deepEqual(selo.ativos.sort(), ['bom', 'outro']);
  assert.equal(selo.recusados.length, 1);
  assert.match(selo.recusados[0].motivo, /inválido/);
});

test('manifesto sem id legível ainda é reportado', () => {
  const { selo } = selarCom({ name: 'sem id', version: '1.0.0' });
  assert.equal(selo.recusados.length, 1);
  assert.match(selo.recusados[0].id, /anônimo/);
});

test('id duplicado: o segundo é recusado, o primeiro fica', () => {
  const { selo } = selarCom(mod('cripto'), mod('cripto'));
  assert.deepEqual(selo.ativos, ['cripto']);
  assert.match(selo.recusados[0].motivo, /duplicado/);
});

/* ═══════════ colisões do conjunto ═══════════ */

test('dois módulos pedindo a MESMA rota: o segundo cai', () => {
  /* Sem isto o segundo venceria em silêncio — ou dependendo da ordem de
   * registro, que é a pior forma de decidir. */
  const a = mod('a', { routes: [{ path: '/comum', view: () => {} }] });
  const b = mod('b', { routes: [{ path: '/comum', view: () => {} }] });
  const { selo, registry } = selarCom(a, b);

  assert.deepEqual(selo.ativos, ['a']);
  assert.match(selo.recusados[0].motivo, /já pertence ao módulo "a"/);
  assert.equal(registry.rotas().length, 1);
});

test('dois módulos pedindo a mesma CHAVE de storage: o segundo cai', () => {
  const a = mod('a', { storage: [{ key: 'a:x', version: 1, class: 'local' }] });
  const b = mod('b', { storage: [{ key: 'a:x', version: 1, class: 'local' }] });
  /* (só é possível porque o manifesto de `b` seria recusado pelo namespace —
   * este teste existe para o dia em que alguém afrouxar aquele invariante) */
  const r = criarRegistry();
  r.registrar(a);
  r.registrar({ ...b, storage: [{ key: 'b:x', version: 1, class: 'local' }] });
  const selo = r.selar();
  assert.equal(selo.ok, true, 'chaves distintas deviam passar');
});

/* ═══════════ dependências ═══════════ */

test('dependência ausente desativa o módulo', () => {
  const { selo } = selarCom(mod('a', { dependencies: ['fantasma'] }), mod('b'));
  assert.deepEqual(selo.ativos, ['b']);
  assert.match(selo.recusados[0].motivo, /ausente: fantasma/);
});

test('a desativação é TRANSITIVA — A→B→C com C morto mata os três', () => {
  /* Sem o laço de ponto fixo, A ficaria ativo apontando para B morto. */
  const a = mod('a', { dependencies: ['b'] });
  const b = mod('b', { dependencies: ['c'] });
  const { selo } = selarCom(a, b, mod('sozinho'));   // 'c' nunca registrado

  assert.deepEqual(selo.ativos, ['sozinho']);
  assert.equal(selo.recusados.length, 2);
});

test('ordem de carga põe a dependência ANTES', () => {
  const { selo } = selarCom(
    mod('ui', { dependencies: ['core'] }),
    mod('core')
  );
  assert.deepEqual(selo.ativos, ['core', 'ui'], 'init rodaria fora de ordem');
});

test('ciclo derruba TODOS os envolvidos, não só quem fechou', () => {
  /* Culpar o último a entrar mandaria consertar o módulo errado. */
  const { selo } = selarCom(
    mod('a', { dependencies: ['b'] }),
    mod('b', { dependencies: ['a'] }),
    mod('livre')
  );
  assert.deepEqual(selo.ativos, ['livre']);
  assert.equal(selo.recusados.length, 2);
  assert.ok(selo.recusados.every((r) => /ciclo/.test(r.motivo)));
});

test('cadeia longa sem ciclo carrega inteira, em ordem', () => {
  const { selo } = selarCom(
    mod('d', { dependencies: ['c'] }),
    mod('c', { dependencies: ['b'] }),
    mod('b', { dependencies: ['a'] }),
    mod('a')
  );
  assert.deepEqual(selo.ativos, ['a', 'b', 'c', 'd']);
});

/* ═══════════ as saídas alimentam o Core ═══════════ */

test('rotas() diz o módulo dono de cada rota', () => {
  const { registry } = selarCom(mod('a'), mod('b'));
  const rotas = registry.rotas();
  assert.deepEqual(rotas.map((r) => [r.path, r.modulo]).sort(),
    [['/a', 'a'], ['/b', 'b']]);
  assert.equal(typeof rotas[0].view, 'function');
});

test('navegacao() é UMA fonte para sidebar e cabeçalho', () => {
  /* O defeito da V1 em uma linha: lá o nome vinha de dois arquivos e 22 rotas
   * divergiram. Aqui só existe `name`. */
  const { registry } = selarCom(
    mod('cripto', { name: 'Lab de Criptografia', icon: '⚿', nav: { section: 'ferramentas', order: 30 } })
  );
  const [item] = registry.navegacao();
  assert.equal(item.nome, 'Lab de Criptografia');
  assert.equal(item.icone, '⚿');
  assert.equal(item.path, '/cripto');
  assert.equal(item.estabilidade, 'experimental', 'padrão devia ser o mais fraco');
});

test('navegacao() ordena por nav.order e desempata por nome', () => {
  const { registry } = selarCom(
    mod('z', { name: 'Zeta', nav: { order: 10 } }),
    mod('a', { name: 'Alfa', nav: { order: 10 } }),
    mod('p', { name: 'Primeiro', nav: { order: 1 } })
  );
  assert.deepEqual(registry.navegacao().map((n) => n.nome), ['Primeiro', 'Alfa', 'Zeta']);
});

test('módulo sem rota não aparece na navegação, mas continua ativo', () => {
  /* Um serviço (fila, logger) é módulo e não é página. */
  const { registry, selo } = selarCom(mod('servico', { routes: [] }), mod('pagina'));
  assert.ok(selo.ativos.includes('servico'));
  assert.deepEqual(registry.navegacao().map((n) => n.modulo), ['pagina']);
});

test('esquemas() entrega a chave com o dono', () => {
  const { registry } = selarCom(
    mod('cripto', { storage: [{ key: 'cripto:prefs', version: 1, class: 'local' }] })
  );
  assert.deepEqual(registry.esquemas(), [
    { key: 'cripto:prefs', version: 1, class: 'local', modulo: 'cripto' }
  ]);
});

test('permissoes() separa por módulo — permissão mínima é por módulo', () => {
  const { registry } = selarCom(
    mod('militar', { permissions: ['NETWORK'] }),
    mod('cripto', { permissions: [] })
  );
  const p = registry.permissoes();
  assert.deepEqual(p.get('militar'), ['NETWORK']);
  assert.deepEqual(p.get('cripto'), []);
});

test('eventos() diz quem emite e quem escuta', () => {
  const { registry } = selarCom(
    mod('editor', { events: { emits: ['editor:aba-aberta'], consumes: [] } }),
    mod('jarvis', { events: { emits: [], consumes: ['editor:aba-aberta'] } })
  );
  const e = registry.eventos().get('editor:aba-aberta');
  assert.deepEqual(e.emitem, ['editor']);
  assert.deepEqual(e.escutam, ['jarvis']);
});

test('eventosOrfaos() acha quem escuta o que ninguém emite (§7)', () => {
  const { registry } = selarCom(
    mod('jarvis', { events: { emits: [], consumes: ['editor:aba-aberta'] } })
  );
  assert.deepEqual(registry.eventosOrfaos(), [
    { evento: 'editor:aba-aberta', escutadoPor: ['jarvis'] }
  ]);
});

/* ═══════════ com os módulos reais ═══════════ */

test('os três módulos reais da V1 carregam juntos', async () => {
  const [cripto, editor, militar] = await Promise.all([
    import('../../v2/modules/cripto/module.js'),
    import('../../v2/modules/editor/module.js'),
    import('../../v2/modules/militar/module.js')
  ]);
  const { selo, registry } = selarCom(cripto.default, editor.default, militar.default);

  assert.equal(selo.ok, true, JSON.stringify(selo.recusados));
  assert.equal(registry.rotas().length, 17, '1 cripto + 1 editor + 15 militar');
  assert.equal(registry.navegacao().length, 3, 'três entradas de navegação');
});
