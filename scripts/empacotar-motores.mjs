#!/usr/bin/env node
/**
 * Empacota os motores externos PARA DENTRO do instalador do app.
 *
 * Por que existe: o operador quer que o motor já esteja lá quando a pessoa abrir
 * o app, sem `npm i -g` nem npx. O caminho para isso é o instalador, não o git —
 * os clones somam ~5 GB e ficam em `.baluarte/tools/` (ignorado). O que o
 * instalador leva é só o **artefato compilado + dependências de produção**.
 *
 * O que faz, por motor com bloco `empacotar` no manifest:
 *   1. copia o que `incluir` lista (dist/, package.json…) do clone para
 *      `desktop/engine/<id>/`;
 *   2. roda `npm install` lá dentro omitindo o que `omitir` diz (dev/optional);
 *   3. reporta o tamanho final, que é o quanto o instalador cresce.
 *
 * O `desktop/package.json` leva `desktop/engine/` em `extraResources`, e o
 * `desktop/src/nexus.js` já procura o motor em `resourcesPath/engine/<id>/…`.
 *
 * Onde estão os clones: `BALUARTE_AI_TOOLS_DIR`, ou o `installRoot` do manifest
 * (mesma regra do `sync-ai-tools.mjs`). Útil ao rodar de um worktree, que não
 * tem `.baluarte/`.
 *
 * Uso:
 *   node scripts/empacotar-motores.mjs                 # todos os empacotáveis
 *   node scripts/empacotar-motores.mjs gitnexus        # só um
 *   node scripts/empacotar-motores.mjs --listar        # o que dá e o que não dá
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  cpSync,
  rmSync,
  statSync,
  readdirSync
} from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { lerManifest, caminhoDaFerramenta, raizDasFerramentas, raizDoCheckout } from './lib/ai-tools.mjs';

const manifest = lerManifest();

const args = process.argv.slice(2);
const listar = args.includes('--listar');
const pedidos = args.filter((a) => !a.startsWith('--'));

// Os clones moram no repo PRINCIPAL (a lib resolve isso, inclusive de dentro de
// um worktree); já o `desktop/engine/` encenado fica NESTE checkout, que é de
// onde o electron-builder vai rodar.
const toolsRoot = raizDasFerramentas(manifest);
const repoRoot = raizDoCheckout;
const destinoRaiz = path.join(repoRoot, 'desktop', 'engine');

const log = (...a) => console.log('[motores]', ...a);

function tamanhoMB(alvo) {
  let total = 0;
  const anda = (p) => {
    let st;
    try {
      st = statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const f of readdirSync(p)) anda(path.join(p, f));
    } else {
      total += st.size;
    }
  };
  anda(alvo);
  return Math.round(total / (1024 * 1024));
}

function origemDe(tool) {
  const raiz = caminhoDaFerramenta(manifest, tool);
  return tool.empacotar && tool.empacotar.subdir ? path.join(raiz, tool.empacotar.subdir) : raiz;
}

function selecionar() {
  const todos = manifest.tools.filter((t) => t && t.empacotar);
  if (pedidos.length === 0) return todos;
  const querido = new Set(pedidos.map((p) => p.toLowerCase()));
  const achados = todos.filter((t) => querido.has(t.id.toLowerCase()));
  const faltando = [...querido].filter((q) => !achados.some((t) => t.id.toLowerCase() === q));
  if (faltando.length) {
    throw new Error(`sem bloco \`empacotar\` no manifest (ou id inexistente): ${faltando.join(', ')}`);
  }
  return achados;
}

/**
 * Caminho do `npm-cli.js` que acompanha o Node em execução.
 *
 * Por que não chamar `npm.cmd` direto: desde a correção do CVE-2024-27980 o Node
 * recusa spawnar `.cmd`/`.bat` sem `shell: true` (dá EINVAL), e ligar o shell só
 * pra isso abre porta pra interpretação de argumento. Rodar o JS do npm com o
 * próprio Node não precisa de shell e funciona igual nos três sistemas.
 */
function npmCli() {
  const candidato = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return existsSync(candidato) ? candidato : null;
}

function rodarNpm(argv, cwd) {
  const cli = npmCli();
  log(`npm ${argv.join(' ')}`);
  const r = cli
    ? spawnSync(process.execPath, [cli, ...argv], { cwd, stdio: 'inherit', shell: false, windowsHide: true })
    : spawnSync('npm', argv, { cwd, stdio: 'inherit', shell: false, windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`falhou (${r.status}): npm ${argv.join(' ')}`);
}

function empacotar(tool) {
  const spec = tool.empacotar;
  const origem = origemDe(tool);
  const destino = path.join(destinoRaiz, tool.id);

  if (!existsSync(origem)) {
    throw new Error(`clone ausente: ${origem} — rode \`npm run tools:sync -- ${tool.id}\` antes`);
  }

  const incluir = Array.isArray(spec.incluir) && spec.incluir.length ? spec.incluir : ['dist', 'package.json'];
  for (const item of incluir) {
    if (!existsSync(path.join(origem, item))) {
      throw new Error(
        `${tool.id}: falta \`${item}\` em ${origem} — o motor não está compilado (veja \`setup\` no manifest)`
      );
    }
  }

  log(`${tool.id}: limpando ${path.relative(repoRoot, destino)}`);
  // maxRetries: no Windows, indexador/antivírus seguram node_modules e dão EBUSY.
  rmSync(destino, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  mkdirSync(destino, { recursive: true });

  for (const item of incluir) {
    cpSync(path.join(origem, item), path.join(destino, item), { recursive: true });
  }

  // Neutraliza o ciclo de vida do PRÓPRIO motor (`prepare`/`postinstall`), que
  // recompilaria a partir do `src/` — fonte que não copiamos, porque estamos
  // encenando um artefato já compilado.
  //
  // Não dá pra usar `--ignore-scripts`: ele é tudo-ou-nada e também mataria os
  // scripts das DEPENDÊNCIAS, e aí `@ladybugdb/core` fica sem o binário nativo
  // `lbugjs.node` e o motor morre no start. Tirar `scripts` do package.json
  // encenado atinge só o pacote raiz e deixa as deps se instalarem inteiras.
  const pkgPath = path.join(destino, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const removidos = Object.keys(pkg.scripts || {});
  delete pkg.scripts;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  if (removidos.length) log(`${tool.id}: scripts do pacote raiz neutralizados (${removidos.join(', ')})`);

  if (spec.copiarModulos) {
    // Copiar a árvore que JÁ funciona, em vez de reinstalar.
    //
    // Reinstalar do zero tenta recompilar nativo: `@ladybugdb/core` não acha
    // prebuilt para esta plataforma e cai em "building from source", que exige
    // MSVC/VC++ — ausente nesta máquina (o handoff registra isso). O clone
    // instalado já tem o `lbugjs.node` pronto; copiá-lo é o que garante que o
    // motor empacotado é exatamente o motor testado.
    const nmOrigem = path.join(origem, 'node_modules');
    if (!existsSync(nmOrigem)) {
      throw new Error(`${tool.id}: falta node_modules em ${origem} — rode o \`setup\` do manifest antes`);
    }
    const excluir = new Set(spec.excluirModulos || []);
    cpSync(nmOrigem, path.join(destino, 'node_modules'), {
      recursive: true,
      // dereference: links de workspace (ex.: `gitnexus-shared`) viram symlink no
      // node_modules, e criar symlink no Windows exige privilégio elevado (EPERM).
      // Copiando o conteúdo real, o pacote fica autocontido e instalável em
      // qualquer máquina.
      dereference: true,
      filter: (src) => {
        const rel = path.relative(nmOrigem, src).split(path.sep).filter(Boolean);
        if (rel.length >= 1 && excluir.has(rel[0])) return false;
        if (rel.length >= 2 && excluir.has(`${rel[0]}/${rel[1]}`)) return false;
        return true;
      }
    });
    if (excluir.size) log(`${tool.id}: podados ${[...excluir].join(', ')}`);
  } else {
    const omitir = Array.isArray(spec.omitir) ? spec.omitir : ['dev', 'optional'];
    const flags = omitir.map((o) => `--omit=${o}`);
    rodarNpm(['install', ...flags, '--no-audit', '--no-fund'], destino);
  }

  const mb = tamanhoMB(destino);
  log(`${tool.id}: pronto — ${mb} MB em ${path.relative(repoRoot, destino)}`);
  return { id: tool.id, mb };
}

try {
  if (listar) {
    log(`clones em: ${toolsRoot}`);
    for (const t of manifest.tools) {
      const marca = t.empacotar
        ? 'empacota'
        : t.referenciaApenas
          ? 'referência (não é serviço)'
          : 'sem bloco `empacotar`';
      const existe = existsSync(origemDe(t)) ? '' : '  (clone ausente)';
      log(`  ${t.id.padEnd(24)} ${marca}${existe}`);
    }
    process.exit(0);
  }

  const alvos = selecionar();
  if (alvos.length === 0) {
    log('nenhum motor tem bloco `empacotar` no manifest — nada a fazer.');
    process.exit(0);
  }

  mkdirSync(destinoRaiz, { recursive: true });
  const feitos = alvos.map(empacotar);
  const total = feitos.reduce((s, f) => s + f.mb, 0);
  log(`--- ${feitos.length} motor(es), ${total} MB no instalador ---`);
  for (const f of feitos) log(`    ${f.id.padEnd(24)} ${f.mb} MB`);
} catch (err) {
  console.error(`[motores] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
