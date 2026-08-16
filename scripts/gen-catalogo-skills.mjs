#!/usr/bin/env node
/**
 * Catálogo de skills — GERADO de `.claude/skills/*​/SKILL.md`.
 *
 * O JARVIS já sabe quais *páginas* o site tem (`src/data/site-capabilities.js`,
 * derivado do `NAV_GROUPS`). Não sabia quais *habilidades* o projeto tem —
 * indexar o grafo, medir raio de impacto, rodar o site, traçar um bug. Elas
 * existem em `.claude/skills/` e o site nunca as viu.
 *
 * Mesma regra dos outros catálogos: promessa em dois lugares diverge. Este
 * arquivo é gerado, não escrito à mão — alguém renomeia uma skill, esquece o
 * documento, e o documento passa a mentir com cara de verdade.
 *
 * ── O que NÃO entra, e por quê ──────────────────────────────────────────────
 * Os plugins instalados na máquina do operador (`~/.claude/plugins`) ficam de
 * fora por padrão. São centenas de skills de terceiros — Carta, Twilio, Zoom,
 * AWS — que não têm relação com o Baluarte, inflariam o bundle de um site
 * estático e publicariam a configuração da máquina de quem desenvolve num
 * endereço público. O que vale pro JARVIS é o que o PROJETO sabe fazer.
 *
 * Quem quiser o inventário da máquina roda com `--maquina`: a saída vai para
 * um arquivo à parte, ignorado pelo git, e nunca entra no build.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = path.join(RAIZ, '.claude', 'skills');
const DESTINO = path.join(RAIZ, 'src', 'data', 'skills-catalogo.js');

/**
 * Lê o frontmatter YAML de um SKILL.md. Só precisamos de `name` e
 * `description`, ambos escalares — não vale arrastar um parser de YAML pra
 * dentro do projeto por dois campos. Aceita valor com ou sem aspas e trata a
 * aspa escapada que aparece nas descrições com exemplos ("Index this repo").
 */
function lerFrontmatter(bruto) {
  // Normaliza CRLF antes de qualquer coisa. Este repo está no Windows com
  // `core.autocrlf`, então alguns SKILL.md chegam com `\r\n` e outros com `\n`
  // — e um `\r` sobrando faz a linha inteira falhar no casamento, pulando a
  // skill em silêncio. Foi assim que `run-projeto-baluarte` sumiu do catálogo
  // na primeira geração, sem erro nenhum.
  const texto = bruto.replace(/\r\n/g, '\n');
  if (!texto.startsWith('---')) return null;
  const fim = texto.indexOf('\n---', 3);
  if (fim === -1) return null;
  const bloco = texto.slice(3, fim);
  const campos = {};
  for (const linha of bloco.split('\n')) {
    const m = /^([a-zA-Z_-]+):\s*(.*)$/.exec(linha);
    if (!m) continue;
    let valor = m[2].trim();
    if (valor.startsWith('"') && valor.endsWith('"') && valor.length > 1) {
      valor = valor.slice(1, -1).replace(/\\"/g, '"');
    }
    campos[m[1]] = valor;
  }
  return campos;
}

/** Extrai os exemplos citados na descrição (padrão `Examples: "a", "b"`). */
function exemplosDe(descricao) {
  const corte = /(?:Examples?|Exemplos?)\s*:/i.exec(descricao);
  if (!corte) return [];
  return [...descricao.slice(corte.index).matchAll(/"([^"]{3,})"/g)].map((m) => m[1]);
}

/** Remove a cauda de exemplos, deixando só a frase de propósito. */
function propositoDe(descricao) {
  const corte = /(?:Examples?|Exemplos?)\s*:/i.exec(descricao);
  return (corte ? descricao.slice(0, corte.index) : descricao).trim().replace(/[.\s]+$/, '');
}

const skills = [];
if (existsSync(ORIGEM)) {
  for (const dir of readdirSync(ORIGEM).sort()) {
    const arquivo = path.join(ORIGEM, dir, 'SKILL.md');
    if (!existsSync(arquivo) || !statSync(arquivo).isFile()) continue;
    const fm = lerFrontmatter(readFileSync(arquivo, 'utf8'));
    if (!fm?.description) continue;
    skills.push({
      id: fm.name || dir,
      nome: (fm.name || dir).replace(/-/g, ' '),
      descricao: propositoDe(fm.description),
      exemplos: exemplosDe(fm.description).slice(0, 3)
    });
  }
}

if (process.argv.includes('--maquina')) {
  // Inventário da máquina: fica fora do bundle e fora do git de propósito.
  const plugins = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'plugins');
  const saida = path.join(RAIZ, '.baluarte', 'inventario-plugins.json');
  const lista = existsSync(plugins) ? readdirSync(plugins).filter((n) => !n.startsWith('.')) : [];
  writeFileSync(saida, `${JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), plugins: lista }, null, 2)}\n`);
  console.log(`[skills] inventário da máquina: ${lista.length} entrada(s) → .baluarte/inventario-plugins.json (não versionado)`);
}

const conteudo = `/**
 * Catálogo de skills do Projeto Baluarte — ARQUIVO GERADO.
 *
 * Não edite à mão: rode \`npm run gen-catalogo-skills\`.
 * Fonte: \`.claude/skills/*​/SKILL.md\`.
 *
 * Serve pro J.A.R.V.I.S. saber o que o PROJETO sabe fazer, do mesmo jeito que
 * \`site-capabilities.js\` faz ele saber quais páginas existem.
 */

/** @typedef {{ id: string, nome: string, descricao: string, exemplos: string[] }} Skill */

/** @type {Skill[]} */
export const SKILLS = ${JSON.stringify(skills, null, 2)};

/** Texto compacto pro briefing do JARVIS (uma linha por skill). */
export function skillsBriefing() {
  if (SKILLS.length === 0) return '';
  const linhas = SKILLS.map((s) => \`- **\${s.id}** — \${s.descricao}\`);
  return \`## HABILIDADES DO PROJETO (\${SKILLS.length})\\n\${linhas.join('\\n')}\`;
}
`;

writeFileSync(DESTINO, conteudo);

// O `.d.ts` também é gerado. O tsconfig roda com `allowJs: false`, então todo
// módulo `.js` de `src/data` precisa de um companheiro declarado — e escrever
// esse à mão seria promessa em dois lugares: muda o formato do catálogo, o
// tipo continua dizendo o antigo, e o `tipos:ts` passa mentindo.
const tipos = `/**
 * Tipos do catálogo de skills — ARQUIVO GERADO junto de \`skills-catalogo.js\`.
 * Não edite à mão: rode \`npm run gen-catalogo-skills\`.
 */

export interface Skill {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly exemplos: readonly string[];
}

export declare const SKILLS: readonly Skill[];

/** Texto compacto pro briefing do JARVIS (uma linha por skill). */
export declare function skillsBriefing(): string;
`;
writeFileSync(DESTINO.replace(/\.js$/, '.d.ts'), tipos);

console.log(`[skills] ${skills.length} skill(s) → src/data/skills-catalogo.js (+ .d.ts)`);
for (const s of skills) console.log(`  · ${s.id}`);
