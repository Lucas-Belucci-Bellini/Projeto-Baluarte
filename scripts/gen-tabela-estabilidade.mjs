/**
 * Gera a tabela de estabilidade do README a partir de `src/core/politica.js`.
 *
 * Por que gerar em vez de escrever à mão: a tabela é a **promessa pública da
 * 1.0.0** — "isto aqui é estável" — e promessa que mora em dois lugares diverge.
 * Sempre. Alguém promove uma flag para `estavel` no código e esquece o README, e
 * a partir daí o README mente para quem lê. A fonte é a política; o README é
 * saída.
 *
 * Mesmo padrão que o repositório já usa para as bases do Arma 3: o CI regera e
 * falha se o commit estiver desatualizado, então a divergência aparece no PR em
 * vez de virar documentação velha.
 *
 * Rodar:  npm run gen-tabela-estabilidade
 *         npm run gen-tabela-estabilidade -- --verificar   (só confere, não grava)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { FLAGS } from '../src/core/politica.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const README = join(raiz, 'README.md');

const INICIO = '<!-- ESTABILIDADE:INICIO -->';
const FIM = '<!-- ESTABILIDADE:FIM -->';

const ROTULO = {
  estavel: '🟢 **Estável**',
  beta: '🟡 Beta',
  experimental: '🔴 Experimental'
};

const EXPLICACAO = {
  estavel: 'previsível, testado, recuperável e seguro — é o que a 1.0.0 promete',
  beta: 'funciona e é usável, mas ainda não cumpre todos os critérios acima',
  experimental: 'em construção; **não vem ligado** — precisa ser ativado à mão'
};

function tabela() {
  const linhas = [
    INICIO,
    '',
    '| Módulo | Nível | Onde |',
    '|---|---|---|'
  ];

  const ordem = ['estavel', 'beta', 'experimental'];
  const porNivel = (n) => FLAGS.filter((f) => f.nivel === n)
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const nivel of ordem) {
    for (const f of porNivel(nivel)) {
      const onde = f.ambiente === 'app' ? 'só no app'
        : f.ambiente === 'web' ? 'só na web'
          : 'web e app';
      linhas.push(`| \`${f.id}\` — ${f.descricao} | ${ROTULO[nivel]} | ${onde} |`);
    }
  }

  linhas.push('');
  for (const nivel of ordem) {
    linhas.push(`- ${ROTULO[nivel]} — ${EXPLICACAO[nivel]}`);
  }
  linhas.push('');
  linhas.push(
    '> Gerado de [`src/core/politica.js`](src/core/politica.js) por ' +
    '`npm run gen-tabela-estabilidade`. O CI regera e falha se divergir — ' +
    'promessa que mora em dois lugares diverge.'
  );
  linhas.push('');
  linhas.push(FIM);
  return linhas.join('\n');
}

const atual = readFileSync(README, 'utf8');
const i = atual.indexOf(INICIO);
const j = atual.indexOf(FIM);

if (i === -1 || j === -1) {
  console.error(`gen-tabela-estabilidade: não achei os marcadores no README.\nEsperado:\n  ${INICIO}\n  ${FIM}`);
  process.exit(1);
}

const novo = atual.slice(0, i) + tabela() + atual.slice(j + FIM.length);

if (process.argv.includes('--verificar')) {
  if (novo !== atual) {
    console.error(
      'gen-tabela-estabilidade: a tabela do README não bate com src/core/politica.js.\n' +
      'Rode `npm run gen-tabela-estabilidade` e commite o resultado.'
    );
    process.exit(1);
  }
  console.log('✓ tabela de estabilidade em dia com a política.');
} else {
  writeFileSync(README, novo);
  const conta = ['estavel', 'beta', 'experimental']
    .map((n) => `${FLAGS.filter((f) => f.nivel === n).length} ${n}`).join(' · ');
  console.log(`✓ tabela de estabilidade escrita no README (${conta}).`);
}
