/**
 * Verificador do mapa de migração do Nexus (docs/nexus/dominios.json).
 *
 * O mapa só serve pra alguma coisa se ele for VERDADE. Este script cobra isso
 * comparando o mapa com o código real, em vez de confiar na boa vontade:
 *
 *  1. cobertura total — toda rota registrada em src/main.js aparece no mapa;
 *  2. sem órfã — toda rota do mapa existe de fato em src/main.js;
 *  3. sem dono duplo — nenhuma rota em dois domínios ao mesmo tempo;
 *  4. os 20 domínios do plano (#406) estão todos declarados;
 *  5. `precisa` aponta só para domínio que existe, e o grafo não tem ciclo;
 *  6. `estado` e `peso` usam o vocabulário combinado.
 *
 * Rodar: node scripts/verificar-nexus.mjs   (ou npm run verificar-nexus)
 * Sai com código 1 se algo divergir — dá pra plugar no CI.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const MAPA = join(raiz, 'docs/nexus/dominios.json');
const MAIN = join(raiz, 'src/main.js');

/* Os 20 do plano. A lista é fixa de propósito: se alguém inventar um domínio
 * novo sem passar pelo #406, o verificador reclama em vez de aceitar calado. */
const DOMINIOS_DO_PLANO = [
  'baluarte-core', 'baluarte-shell', 'baluarte-content', 'baluarte-tools',
  'baluarte-arsenal', 'baluarte-elites', 'baluarte-academia', 'baluarte-robotica',
  'baluarte-midia', 'baluarte-audio', 'baluarte-cibersec', 'baluarte-economia',
  'baluarte-jarvis-core', 'baluarte-jarvis-tools', 'baluarte-jarvis-memory',
  'baluarte-profile', 'baluarte-data', 'baluarte-desktop', 'baluarte-infra',
  'baluarte-docs',
];

const ESTADOS = ['vazio', 'backlog', 'desenvolvimento', 'teste', 'estavel'];
const PESOS = ['leve', 'pesado'];

const erros = [];
const falhar = (msg) => erros.push(msg);

const mapa = JSON.parse(readFileSync(MAPA, 'utf8'));
const main = readFileSync(MAIN, 'utf8');

/* Rotas reais: só as chamadas de registro em coluna zero. O bloco de exemplo
 * do topo do main.js é indentado dentro do comentário, então não entra. */
const rotasReais = [...main.matchAll(/^router\.register\('([^']+)'/gm)].map((m) => m[1]);

/* Rotas declaradas no mapa: domínios + lacunas (uma rota sem domínio ainda é
 * responsabilidade de alguém — a lacuna é o registro honesto disso). */
const declaradas = new Map();   // rota -> quem declarou
const declarar = (rota, dono) => {
  if (declaradas.has(rota)) falhar(`rota com dono duplo: ${rota} (${declaradas.get(rota)} e ${dono})`);
  else declaradas.set(rota, dono);
};

for (const [nome, d] of Object.entries(mapa.dominios)) {
  for (const rota of d.rotas) declarar(rota, nome);

  if (!ESTADOS.includes(d.estado)) falhar(`${nome}: estado "${d.estado}" fora de ${ESTADOS.join('|')}`);
  if (!PESOS.includes(d.peso)) falhar(`${nome}: peso "${d.peso}" fora de ${PESOS.join('|')}`);
  if (!d.responsabilidade?.trim()) falhar(`${nome}: sem responsabilidade declarada`);
  if (!Array.isArray(d.origem) || d.origem.length === 0) falhar(`${nome}: sem origem no monólito`);
}

for (const [nome, l] of Object.entries(mapa.lacunas)) {
  if (nome.startsWith('$')) continue;
  for (const rota of l.rotas) declarar(rota, `lacuna:${nome}`);
  if (!l.recomendacao?.trim()) falhar(`lacuna ${nome}: sem recomendação — lacuna sem saída proposta é só um buraco`);
}

/* 1 e 2 — cobertura nos dois sentidos. */
for (const rota of rotasReais) {
  if (!declaradas.has(rota)) falhar(`rota do site fora do mapa: ${rota} (registrada em src/main.js)`);
}
for (const rota of declaradas.keys()) {
  if (!rotasReais.includes(rota)) falhar(`rota fantasma no mapa: ${rota} (não existe em src/main.js)`);
}

/* 4 — os 20 do plano. */
for (const nome of DOMINIOS_DO_PLANO) {
  if (!mapa.dominios[nome]) falhar(`domínio do plano ausente do mapa: ${nome}`);
}
for (const nome of Object.keys(mapa.dominios)) {
  if (!DOMINIOS_DO_PLANO.includes(nome)) falhar(`domínio fora do plano #406: ${nome} (abra a discussão antes)`);
}

/* 5 — dependências: existem e não formam ciclo (DFS com pilha de visita). */
const visitando = new Set();
const pronto = new Set();
function ciclo(nome, caminho) {
  if (pronto.has(nome)) return;
  if (visitando.has(nome)) {
    falhar(`ciclo de dependência: ${[...caminho, nome].join(' → ')}`);
    return;
  }
  visitando.add(nome);
  for (const dep of mapa.dominios[nome]?.precisa ?? []) {
    if (!mapa.dominios[dep]) { falhar(`${nome} depende de "${dep}", que não é um domínio`); continue; }
    ciclo(dep, [...caminho, nome]);
  }
  visitando.delete(nome);
  pronto.add(nome);
}
for (const nome of Object.keys(mapa.dominios)) ciclo(nome, []);

/* Relatório. */
const emDominio = [...declaradas.values()].filter((d) => !d.startsWith('lacuna:')).length;
const emLacuna = declaradas.size - emDominio;

console.log(`Nexus — mapa de migração (contrato ${mapa.versaoContrato})`);
console.log(`  rotas em src/main.js ....... ${rotasReais.length}`);
console.log(`  com domínio definido ....... ${emDominio}`);
console.log(`  em lacuna (sem dono) ....... ${emLacuna}`);
console.log(`  domínios declarados ........ ${Object.keys(mapa.dominios).length}/20`);

const porEstado = {};
for (const d of Object.values(mapa.dominios)) porEstado[d.estado] = (porEstado[d.estado] ?? 0) + 1;
console.log(`  maturidade ................. ${Object.entries(porEstado).map(([e, n]) => `${e}: ${n}`).join(' · ')}`);

if (erros.length) {
  console.error(`\n✗ ${erros.length} divergência(s):`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ mapa bate com o código.');
