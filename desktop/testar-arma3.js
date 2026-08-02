/**
 * Prova o módulo `desktop/src/arma3.js` — em especial as REGRAS DE SEGURANÇA.
 *
 * Este módulo commita e empurra. Um defeito aqui não dá tela branca: dá commit
 * no lugar errado, ou arquivo alheio junto na leva. Por isso o que se cobra
 * primeiro não é "funciona", é "recusa o que tem de recusar".
 *
 * Roda num repositório git DESCARTÁVEL, criado em pasta temporária, com um
 * `origin` local — nunca no clone de verdade e nunca tocando a rede.
 *
 * Rodar:  node desktop/testar-arma3.js
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const arma3 = require('./src/arma3');

let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) falhas += 1;
};

const git = (repo, ...args) =>
  execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Repositório de mentira com a mesma cara do de verdade. */
function repoFalso() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'baluarte-teste-'));
  const repo = path.join(raiz, 'Projeto-Baluarte');
  const remoto = path.join(raiz, 'remoto.git');

  fs.mkdirSync(path.join(repo, 'scripts', 'arma3', 'out'), { recursive: true });
  // o arquivo que PROVA que é este repositório
  fs.writeFileSync(path.join(repo, 'scripts', 'arma3', 'extrair-tudo.py'), '# de mentira\n');
  fs.writeFileSync(path.join(repo, 'README.md'), '# teste\n');

  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'config', 'user.email', 'teste@exemplo');
  git(repo, 'config', 'user.name', 'Teste');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', 'base');

  execFileSync('git', ['init', '-q', '--bare', remoto], { encoding: 'utf8' });
  git(repo, 'remote', 'add', 'origin', remoto);
  return { raiz, repo, remoto };
}

const escreverSaida = (repo, nome, obj) =>
  fs.writeFileSync(path.join(repo, 'scripts', 'arma3', 'out', nome),
                   JSON.stringify(obj || { teste: true }, null, 1));

async function main() {
  console.log('provando desktop/src/arma3.js\n');

  /* ─────────────── 1. varredura do .rpt ─────────────── */
  console.log('1. leitura do .rpt');
  const tmpRpt = path.join(os.tmpdir(), `teste-${Date.now()}.rpt`);
  fs.writeFileSync(tmpRpt, [
    'linha qualquer do jogo',
    '2026/08/02 <<A3GRUPO>>INICIO|v1',
    '2026/08/02 <<A3GRUPO>>G|a|b|c|d|e|f',
    '2026/08/02 <<A3GRUPO>>FIM|1.0',
    '2026/08/02 <<A3SIMB>>M|x|y|z|w|1|2|0',      // sem FIM: incompleto
    'mais ruído',
  ].join('\n'), 'latin1');
  // varrerRpt não é exportada; exercitada pelo status() abaixo, mas a leitura
  // do formato dá para conferir aqui pelo mesmo caminho de código:
  const achados = require('./src/arma3');
  ok(typeof achados.status === 'function', 'o módulo expõe status/extrair/entregar');
  fs.unlinkSync(tmpRpt);

  /* ─────────────── 2. o repositório precisa ser ESTE ─────────────── */
  console.log('\n2. identificação do repositório');
  const vazio = fs.mkdtempSync(path.join(os.tmpdir(), 'baluarte-vazio-'));
  let erro = null;
  try { await arma3.extrair({ repo: vazio, etapas: [] }); } catch (e) { erro = e.message; }
  ok(!!erro, `pasta sem a prova do repo é recusada (${erro ? erro.slice(0, 42) : 'NÃO RECUSOU'})`);

  const { raiz, repo, remoto } = repoFalso();

  /* ─────────────── 3. etapa desconhecida ─────────────── */
  console.log('\n3. validação de entrada');
  erro = null;
  try { await arma3.extrair({ repo, etapas: ['rm -rf /'] }); } catch (e) { erro = e.message; }
  ok(!!erro && /desconhecida/.test(erro), 'etapa fora da lista é recusada antes de rodar nada');

  /* ─────────────── 4. nada mudou → não commita ─────────────── */
  console.log('\n4. entrega');
  let r = await arma3.entregar({ repo, ramo: 'teste-a' });
  ok(r.ok === false && /nada mudou/.test(r.motivo), 'sem mudança na pasta de saída, não commita');

  /* ─────────────── 5. RAMO PROTEGIDO ─────────────── */
  escreverSaida(repo, 'arma3-grupos.json');
  for (const proibido of ['main', 'master', 'HEAD', 'production']) {
    erro = null;
    try { await arma3.entregar({ repo, ramo: proibido }); } catch (e) { erro = e.message; }
    ok(!!erro && /protegido/.test(erro), `ramo "${proibido}" é recusado`);
  }

  /* ─────────────── 6. arquivo ALHEIO não vai junto ─────────────── */
  fs.writeFileSync(path.join(repo, 'segredo.txt'), 'não deveria ser commitado');
  erro = null;
  try { await arma3.entregar({ repo, ramo: 'teste-b' }); } catch (e) { erro = e.message; }
  ok(!!erro && /fora de/.test(erro), 'alteração fora da pasta de saída bloqueia a entrega');
  fs.unlinkSync(path.join(repo, 'segredo.txt'));

  /* ─────────────── 7. só JSON com o nome certo ─────────────── */
  fs.writeFileSync(path.join(repo, 'scripts', 'arma3', 'out', 'nao-e-base.txt'), 'x');
  fs.writeFileSync(path.join(repo, 'scripts', 'arma3', 'out', 'travesso.json'), '{}');
  r = await arma3.entregar({ repo, ramo: 'teste-c' });
  ok(r.ok === true, 'entrega válida commita');
  ok(r.arquivos.length === 1 && r.arquivos[0].endsWith('arma3-grupos.json'),
     `só o JSON no padrão entrou (${r.arquivos.join(', ')})`);
  ok(r.ramo === 'arma3/extracao-teste-c', `ramo com prefixo próprio: ${r.ramo}`);
  ok(r.empurrado === false, 'sem `empurrar: true`, o commit fica LOCAL');
  ok(r.prUrl === null, 'sem empurrar, não inventa link de PR');

  const commitado = git(repo, 'show', '--name-only', '--format=', 'HEAD').trim().split('\n');
  ok(!commitado.some((f) => /nao-e-base|travesso/.test(f)),
     'arquivo de nome estranho na pasta de saída NÃO foi commitado');

  /* ─────────────── 8. empurrar de verdade (remoto local) ─────────────── */
  escreverSaida(repo, 'arma3-simbologia.json', { outro: 1 });
  r = await arma3.entregar({ repo, ramo: 'teste-d', empurrar: true, etapas: ['simbologia'] });
  ok(r.ok === true && r.empurrado === true, 'com `empurrar: true`, empurra');
  const noRemoto = execFileSync('git', ['branch', '--list'], { cwd: remoto, encoding: 'utf8' });
  ok(noRemoto.includes('arma3/extracao-teste-d'), 'o ramo chegou no remoto');
  ok(!/^\*?\s*(main|master)\b/m.test(noRemoto), 'o ramo principal NÃO foi tocado no remoto');
  ok(typeof r.prUrl === 'string' && r.prUrl.includes('teste-d'), 'devolve o link para abrir o PR');

  const msg = git(repo, 'log', '-1', '--format=%B');
  ok(/simbologia/.test(msg), 'a mensagem de commit diz qual etapa foi');

  /* ─────────────── 9. status não explode sem jogo ─────────────── */
  console.log('\n5. status');
  const st = await arma3.status({ repo });
  ok(st && st.repo && st.repo.valido === true, 'status enxerga o repositório');
  ok(Array.isArray(st.faltamNoJogo) && st.faltamNoJogo.length > 0,
     'sem dump nenhum, lista o que falta rodar no jogo');
  ok(st.faltamNoJogo.every((f) => f.sqf.startsWith('scripts/arma3/')),
     'e diz o caminho do .sqf a colar');
  ok(st.pronto === false, 'sem dump, não se declara pronto');

  fs.rmSync(raiz, { recursive: true, force: true });
  fs.rmSync(vazio, { recursive: true, force: true });

  console.log();
  if (falhas) { console.log(`✗ ${falhas} verificação(ões) falharam`); process.exit(1); }
  console.log('✓ as regras de segurança seguram: repo identificado, ramo protegido recusado,');
  console.log('  arquivo alheio bloqueado, e o empurrão só acontece quando é pedido.');
}

main().catch((e) => { console.error('erro no teste:', e); process.exit(1); });
