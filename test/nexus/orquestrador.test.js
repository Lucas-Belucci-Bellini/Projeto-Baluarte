/**
 * Testes do orquestrador do Nexus.
 *
 * O valor deste componente está no que ele RECUSA. Um módulo torto tem que
 * falhar na composição, com mensagem dizendo de quem é a culpa — não meia tela
 * depois, e nunca em silêncio. Cada teste aqui é um desses "não".
 *
 * Rodar: npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { compor, iniciarTodos, CONTRATO } from '../../src/nexus/orquestrador.js';

const carregador = () => Promise.resolve({});

const dominio = (nome, extra = {}) => ({
  nome, versao: '0.1.0', contrato: '1.1.0', natureza: 'paginas',
  rotas: [], eventos: { emite: [], escuta: [] }, precisa: [], ...extra,
});

const rota = (path, extra = {}) => ({ path, titulo: path, icone: '', peso: 'leve', load: carregador, ...extra });

/* ============================ composição feliz ============================== */

test('compõe rotas de vários domínios sem erro', () => {
  const c = compor([
    dominio('core', { natureza: 'biblioteca' }),
    dominio('shell', { precisa: ['baluarte-core'], rotas: [rota('/home'), rota('/sobre')] }),
    dominio('profile', { precisa: ['baluarte-core', 'baluarte-shell'], rotas: [rota('/perfil')] }),
  ]);
  assert.deepEqual(c.erros, []);
  assert.deepEqual(c.rotas.map((r) => r.path), ['/home', '/sobre', '/perfil']);
  assert.equal(c.rotas[0].dominio, 'baluarte-shell');
});

test('a ordem põe a dependência antes de quem depende', () => {
  const c = compor([
    dominio('profile', { precisa: ['baluarte-shell'], rotas: [rota('/perfil')] }),
    dominio('shell', { precisa: ['baluarte-core'] }),
    dominio('core', { natureza: 'biblioteca' }),
  ]);
  assert.deepEqual(c.erros, []);
  assert.ok(c.ordem.indexOf('baluarte-core') < c.ordem.indexOf('baluarte-shell'));
  assert.ok(c.ordem.indexOf('baluarte-shell') < c.ordem.indexOf('baluarte-profile'));
});

/* ============================== as recusas ================================== */

test('recusa contrato de major diferente — o módulo fala outra língua', () => {
  const c = compor([dominio('velho', { contrato: '0.9.0' })]);
  assert.match(c.erros.join('\n'), /contrato "0\.9\.0" incompatível/);
  assert.deepEqual(c.rotas, []);
});

test('aceita minor diferente dentro do mesmo major', () => {
  const c = compor([dominio('antigo', { contrato: '1.0.0', rotas: [rota('/x')] })]);
  assert.deepEqual(c.erros, []);
  assert.equal(c.rotas.length, 1);
});

test('DOIS DOMÍNIOS NA MESMA ROTA é erro, não "o último ganha"', () => {
  /* Sem isto, quem vence dependeria da ordem de carregamento — o pior tipo de
   * bug pra reproduzir, porque muda sozinho quando alguém mexe noutro lugar. */
  const c = compor([
    dominio('tools', { rotas: [rota('/editor')] }),
    dominio('jarvis-core', { rotas: [rota('/editor')] }),
  ]);
  assert.match(c.erros.join('\n'), /rota \/editor reivindicada por baluarte-tools e baluarte-jarvis-core/);
  assert.equal(c.rotas.length, 1, 'a rota em conflito não deveria ser registrada duas vezes');
});

test('recusa dependência que não está na composição', () => {
  const c = compor([dominio('profile', { precisa: ['baluarte-shell'] })]);
  assert.match(c.erros.join('\n'), /precisa de baluarte-shell, que não está na composição/);
});

test('detecta ciclo em vez de travar', () => {
  const c = compor([
    dominio('a', { precisa: ['baluarte-b'] }),
    dominio('b', { precisa: ['baluarte-a'] }),
  ]);
  assert.match(c.erros.join('\n'), /ciclo de dependência/);
});

test('recusa rota sem load carregável', () => {
  const c = compor([dominio('x', { rotas: [{ path: '/x', titulo: 'X', peso: 'leve' }] })]);
  assert.match(c.erros.join('\n'), /load precisa ser/);
});

test('recusa domínio duplicado na composição', () => {
  const c = compor([dominio('shell'), dominio('shell')]);
  assert.match(c.erros.join('\n'), /domínio duplicado/);
});

/* ======================== gate do mega-plano #238 =========================== */

test('na web, rota pesada é gateada e o chunk não desce', () => {
  const c = compor([dominio('jarvis-tools', { rotas: [rota('/git-nexus', { peso: 'pesado' })] })], { nativo: false });
  assert.equal(c.rotas[0].gateado, true);
});

test('no app, a mesma rota carrega de verdade', () => {
  const c = compor([dominio('jarvis-tools', { rotas: [rota('/git-nexus', { peso: 'pesado' })] })], { nativo: true });
  assert.equal(c.rotas[0].gateado, false);
});

test('rota leve nunca é gateada, nem na web', () => {
  const c = compor([dominio('shell', { rotas: [rota('/home')] })], { nativo: false });
  assert.equal(c.rotas[0].gateado, false);
});

/* ===================== destaques (contrato §1.2 / D-003) ==================== */

test('agrega os destaques declarados pelos domínios', () => {
  const c = compor([
    dominio('arsenal', {
      rotas: [rota('/arsenal')],
      destaques: [{ rotulo: 'Arsenal', rota: '/arsenal', total: 251, fonte: 'medido' }],
    }),
    dominio('elites', {
      rotas: [rota('/elites')],
      destaques: [{ rotulo: 'Equipes', rota: '/elites', total: 26, fonte: 'medido' }],
    }),
  ]);
  assert.deepEqual(c.erros, []);
  assert.deepEqual(c.destaques.map((d) => `${d.rotulo}=${d.total}`), ['Arsenal=251', 'Equipes=26']);
  assert.equal(c.destaques[0].dominio, 'baluarte-arsenal');
});

test('DESTAQUE NÃO É PORTA DOS FUNDOS: rota de outro domínio é recusada', () => {
  const c = compor([
    dominio('arsenal', {
      rotas: [rota('/arsenal')],
      destaques: [{ rotulo: 'Crônicas', rota: '/biblioteca', total: 24, fonte: 'x' }],
    }),
    dominio('content', { rotas: [rota('/biblioteca')] }),
  ]);
  assert.match(c.erros.join('\n'), /aponta pra \/biblioteca, que não é dele/);
  assert.deepEqual(c.destaques, []);
});

test('destaque pode apontar pra rota ainda PLANEJADA do próprio domínio', () => {
  /* Durante a migração o domínio declara o destaque antes de publicar a tela —
   * é o que mantém a home viva enquanto a extração acontece. */
  const c = compor([
    dominio('arsenal', {
      rotas: [],
      planejado: [{ path: '/arsenal', titulo: 'Arsenal', peso: 'leve', origem: 'src/pages/arsenal.js' }],
      destaques: [{ rotulo: 'Arsenal', rota: '/arsenal', total: 251, fonte: 'medido' }],
    }),
  ]);
  assert.deepEqual(c.erros, []);
  assert.equal(c.destaques.length, 1);
});

/* ============================ inicialização ================================= */

test('iniciarTodos entrega os destaques agregados a quem sobe', async () => {
  let recebido = null;
  const shell = dominio('shell', { async iniciar(ctx) { recebido = ctx.destaques; } });
  const arsenal = dominio('arsenal', {
    rotas: [rota('/arsenal')],
    destaques: [{ rotulo: 'Arsenal', rota: '/arsenal', total: 251, fonte: 'medido' }],
  });
  const c = compor([shell, arsenal]);
  const porNome = new Map([['baluarte-shell', shell], ['baluarte-arsenal', arsenal]]);
  const falhas = await iniciarTodos(porNome, c);
  assert.deepEqual(falhas, []);
  assert.equal(recebido.length, 1);
  assert.equal(recebido[0].rotulo, 'Arsenal');
});

test('domínio que explode ao iniciar não derruba os outros', async () => {
  const ordem = [];
  const bom = dominio('shell', { async iniciar() { ordem.push('shell'); } });
  const ruim = dominio('quebrado', { async iniciar() { throw new Error('boom'); } });
  const c = compor([ruim, bom]);
  const porNome = new Map([['baluarte-shell', bom], ['baluarte-quebrado', ruim]]);
  const falhas = await iniciarTodos(porNome, c);
  assert.match(falhas.join('\n'), /baluarte-quebrado: boom/);
  assert.deepEqual(ordem, ['shell'], 'o domínio saudável tinha que ter subido mesmo assim');
});

test('a versão do contrato do orquestrador é semver', () => {
  assert.match(CONTRATO, /^\d+\.\d+\.\d+$/);
});
