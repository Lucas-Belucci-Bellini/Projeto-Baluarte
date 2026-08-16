/**
 * Base compartilhada dos scripts de ferramentas externas de IA (`tools:sync`,
 * `tools:status`).
 *
 * A regra: o repositório versiona o **manifest** (`config/ai-tools.json`), os
 * scripts e os pontos de integração. Os clones em si ficam FORA do git, numa
 * pasta ignorada — foi exatamente assim que `GitNexus-1.6.7/` (139 MB) e
 * `Humanity always first/` (172 MB) entraram no histórico e nunca mais saíram,
 * até estourarem o limite de 245 MB da Lambda no deploy. Ferramenta externa se
 * instala, não se versiona.
 *
 * O detalhe que obriga este módulo a existir (em vez de dois `path.resolve`
 * soltos nos scripts): quando o Baluarte é aberto a partir de um **worktree**
 * (`.claude/worktrees/…`), a raiz das ferramentas tem que continuar sendo a do
 * repositório PRINCIPAL. Sem isso cada worktree clonaria os mesmos gigabytes de
 * novo, e o `gitnexus` já compilado numa pasta ficaria invisível na outra — o
 * operador veria "instalado" no `tools:status` de um lado e "missing" do outro,
 * sobre o mesmo disco.
 *
 * Nada aqui lança por causa do git: fora de um repositório, ou com o comando
 * indisponível, cai no próprio checkout. Um script de instalação que morre
 * porque `git rev-parse` piscou é pior que um que instala no lugar óbvio.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const aqui = path.dirname(fileURLToPath(import.meta.url));

/** Raiz do checkout atual — pode ser o repo principal OU um worktree. */
export const raizDoCheckout = path.resolve(aqui, '..', '..');

/** Lê e valida o manifest versionado. */
export function lerManifest() {
  const arquivo = path.join(raizDoCheckout, 'config', 'ai-tools.json');
  const manifest = JSON.parse(readFileSync(arquivo, 'utf8'));
  if (!Array.isArray(manifest.tools)) {
    throw new Error('config/ai-tools.json: falta a lista "tools"');
  }
  return manifest;
}

/**
 * Raiz do repositório principal. Num worktree, `--git-common-dir` aponta para o
 * `.git` do repo principal e o pai dele é a raiz procurada.
 */
export function raizDoRepoPrincipal() {
  const r = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: raizDoCheckout,
    encoding: 'utf8',
    shell: false,
    windowsHide: true
  });
  if (r.status !== 0) return raizDoCheckout;
  const comum = (r.stdout || '').trim();
  return comum ? path.dirname(comum) : raizDoCheckout;
}

/**
 * Onde os clones moram: env do operador → `installRoot` do manifest, sempre
 * ancorado no repo principal (ver o comentário do topo).
 */
export function raizDasFerramentas(manifest) {
  const escolhido = process.env.BALUARTE_AI_TOOLS_DIR || manifest.installRoot || '.baluarte/tools';
  return path.resolve(raizDoRepoPrincipal(), escolhido);
}

/** Caminho absoluto de uma ferramenta (respeita `localPath` do manifest). */
export function caminhoDaFerramenta(manifest, tool) {
  return tool.localPath
    ? path.resolve(raizDoRepoPrincipal(), tool.localPath)
    : path.join(raizDasFerramentas(manifest), tool.id);
}

/** Roda git e devolve stdout limpo; string vazia se falhar (nunca lança). */
export function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false, windowsHide: true });
  return r.status === 0 ? (r.stdout || '').trim() : '';
}

/** Seleciona ferramentas por id; sem ids, devolve todas. */
export function selecionar(manifest, ids) {
  if (ids.length === 0) return manifest.tools;
  const querido = new Set(ids.map((s) => s.toLowerCase()));
  const achado = manifest.tools.filter((t) => querido.has(t.id.toLowerCase()));
  const faltando = [...querido].filter((id) => !achado.some((t) => t.id.toLowerCase() === id));
  if (faltando.length > 0) {
    const conhecidos = manifest.tools.map((t) => t.id).join(', ');
    throw new Error(`ferramenta desconhecida: ${faltando.join(', ')} — conheço: ${conhecidos}`);
  }
  return achado;
}
