/**
 * Gera `src/data/arma3-totais.js` — só os CONTADORES das bases do Arma 3.
 *
 * Existe por causa do peso da tela `/arma3-tutorial`: ela importava 19 bases
 * estaticamente, 2,2 MB, e mostrava só uma aba por vez. Não dava para carregar
 * as bases sob demanda porque a BARRA DE ABAS precisa dos totais ("🔫 Armas ·
 * 1234") — e o total só existia dentro da base pesada. Pedir o total puxava a
 * base inteira junto.
 *
 * Aqui os totais viram um módulo de ~1 kB, e as bases passam a ser carregadas
 * na troca de aba.
 *
 * Não é número digitado à mão: o script IMPORTA cada base e lê o valor que ela
 * mesma exporta. E há teste (`test/arma3-totais.test.js`) conferindo cada total
 * contra a base de verdade — se uma base for regerada e os totais ficarem para
 * trás, o CI acusa. Sem esse teste, este arquivo seria exatamente o tipo de
 * cópia que envelhece calada.
 *
 * Rodar:  node scripts/gerar-arma3-totais.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/* base → contadores que ela exporta. A ordem é a da barra de abas. */
const BASES = [
  ['vanilla', ['A3VAN_TOTAL_TOPICOS']],
  ['armas', ['A3ARM_TOTAL']],
  ['acessorios', ['A3ACC_TOTAL']],
  ['veiculos', ['A3VEI_TOTAL']],
  ['equipamento', ['A3EQP_TOTAL']],
  ['soldados', ['A3SOL_TOTAL']],
  ['terrenos', ['A3TER_TOTAL']],
  ['municao', ['A3MUN_TOTAL', 'A3MAG_TOTAL']],
  ['colecao', ['A3COL_TOTAL']],
  ['tutoriais', ['A3TUT_TOTAL']],
  ['config', ['A3CFG_TOTAL_TOPICOS']],
  ['comandos', ['A3CMD_TOTAL']],
  ['campanhas', ['A3CAMP_TOTAL']],
  ['drive', ['A3DRV_TOTAL']],
  ['presets', ['ARMA3_TOTAL_MODS']]
];

const linhas = [];
for (const [base, nomes] of BASES) {
  const mod = await import(`../src/data/arma3-${base}.js`);
  for (const nome of nomes) {
    const valor = mod[nome];
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      console.error(`✗ ${nome} não é número em arma3-${base}.js: ${valor}`);
      process.exit(1);
    }
    linhas.push(`export const ${nome} = ${valor};`);
  }
}

const conteudo = `/**
 * Contadores das bases do Arma 3 — ARQUIVO GERADO.
 *
 * ⚠ Não edite à mão: rode \`node scripts/gerar-arma3-totais.mjs\`. Editar aqui é
 * perder a edição na próxima geração e fazer os números divergirem da base.
 *
 * Por que existe: a barra de abas de \`/arma3-tutorial\` mostra o total de cada
 * base. Ler esse total da própria base obrigava a carregar os 2,2 MB de dados
 * só para escrever um número no rótulo. Com os totais aqui (~1 kB), cada base
 * é carregada sob demanda, na troca de aba.
 *
 * \`test/arma3-totais.test.js\` confere cada número contra a base real.
 */

${linhas.join('\n')}
`;

writeFileSync(join(raiz, 'src/data/arma3-totais.js'), conteudo);
console.log(`✓ src/data/arma3-totais.js — ${linhas.length} contadores`);
