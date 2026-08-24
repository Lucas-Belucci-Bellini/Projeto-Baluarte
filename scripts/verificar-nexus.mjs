/**
 * Verificador do mapa de migração do Nexus (docs/nexus/dominios.json).
 *
 * O mapa só serve pra alguma coisa se ele for VERDADE. Este script cobra isso
 * comparando o mapa com o código real, em vez de confiar na boa vontade:
 *
 *  1. cobertura total — toda rota registrada em src/main.js aparece no mapa;
 *  2. sem órfã — toda rota do mapa existe de fato em src/main.js;
 *  3. sem dono duplo — nenhuma rota em dois donos ao mesmo tempo;
 *  4. os domínios aprovados (#406 + decisões) estão todos declarados;
 *  5. `precisa` aponta só para domínio que existe, e o grafo não tem ciclo;
 *  6. `estado` e `peso` usam o vocabulário combinado;
 *  7. domínio fora dos 20 originais aponta a decisão que o criou;
 *  8. repositório externo declara decisão e forma de integração;
 *  9. nenhum arquivo do monólito aparece em dois domínios;
 * 10. toda página que atende rota está na origem de algum domínio;
 * 11. toda folha de src/styles/ tem dono;
 * 12. todo dataset de src/data/ tem dono.
 *
 * Rodar: node scripts/verificar-nexus.mjs   (ou npm run verificar-nexus)
 * Sai com código 1 se algo divergir — dá pra plugar no CI.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const MAPA = join(raiz, 'docs/nexus/dominios.json');
const MAIN = join(raiz, 'src/main.js');

/* Os domínios aprovados. A lista é fixa de propósito: se alguém inventar um
 * domínio novo sem passar pelo #406, o verificador reclama em vez de aceitar
 * calado. Entrada nova aqui exige registro em docs/NEXUS-DECISOES.md. */
const DOMINIOS_DO_PLANO = [
  'baluarte-core', 'baluarte-shell', 'baluarte-content', 'baluarte-tools',
  'baluarte-arsenal', 'baluarte-elites', 'baluarte-academia', 'baluarte-robotica',
  'baluarte-midia', 'baluarte-audio', 'baluarte-cibersec', 'baluarte-economia',
  'baluarte-jarvis-core', 'baluarte-jarvis-tools', 'baluarte-jarvis-memory',
  'baluarte-profile', 'baluarte-data', 'baluarte-desktop', 'baluarte-infra',
  'baluarte-docs',
  'baluarte-geo',   // D-001 (2026-08-01): 21º domínio, geo/tático.
];

const ESTADOS = ['vazio', 'backlog', 'desenvolvimento', 'teste', 'estavel'];
const PESOS = ['leve', 'pesado'];

const erros = [];
const falhar = (msg) => erros.push(msg);

const mapa = JSON.parse(readFileSync(MAPA, 'utf8'));
const main = readFileSync(MAIN, 'utf8');

/* Rotas reais: só as chamadas de registro em coluna zero. O bloco de exemplo
 * do topo do main.js é indentado dentro do comentário, então não entra. */
/* Duas formas de registar, e as duas contam: `router.register` direto, e o
 * `reg()` que embrulha a rota no portão de conta. Reconhecer só a primeira
 * fez este verificador declarar 98 rotas como fantasmas no dia em que o
 * portão entrou — o mapa estava certo, o detetor é que ficou desatualizado. */
const rotasReais = [...main.matchAll(/^(?:router\.register|reg)\('([^']+)'/gm)].map((m) => m[1]);

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

/* Externos: repositórios de fora do Nexus que entram na composição final
 * (D-001/D-002). Publicam rota pelo mesmo contrato, então contam como dono. */
for (const [nome, e] of Object.entries(mapa.externos)) {
  if (nome.startsWith('$')) continue;
  for (const rota of e.rotas) declarar(rota, `externo:${nome}`);
  if (!e.decidido?.trim()) falhar(`externo ${nome}: sem a decisão que o trouxe pra cá`);
  if (!e.integracao?.trim()) falhar(`externo ${nome}: sem forma de integração declarada`);
}

for (const [nome, l] of Object.entries(mapa.lacunas)) {
  if (nome.startsWith('$')) continue;
  for (const rota of l.rotas) declarar(rota, `lacuna:${nome}`);
  if (!l.recomendacao?.trim()) falhar(`lacuna ${nome}: sem recomendação — lacuna sem saída proposta é só um buraco`);
}

/* Domínio que veio de decisão precisa apontar pra ela. Sem isso, daqui a três
 * meses ninguém lembra por que existe um 21º e a discussão recomeça. */
for (const [nome, d] of Object.entries(mapa.dominios)) {
  const noPlanoOriginal = DOMINIOS_DO_PLANO.indexOf(nome) < 20;
  if (!noPlanoOriginal && !d.decidido?.trim()) falhar(`${nome}: domínio fora dos 20 originais sem registro de decisão`);
}

/* Arquivo com dois donos é a mesma doença da rota com dono duplo, um nível
 * abaixo — e mais traiçoeira: os dois domínios extraem, ninguém percebe, e o
 * arquivo passa a existir em duas versões que divergem em silêncio. Apareceu
 * de verdade ao extrair o core (user-prefs, memory-cloud, comms, realtime). */
const donoArquivo = new Map();
const donoPasta = new Map();   // entradas do mapa que cobrem uma pasta inteira
const declararArquivo = (arq, dono) => {
  if (arq.includes('(')) return;                        // anotação em prosa
  const onde = arq.endsWith('/') ? donoPasta : donoArquivo;
  if (onde.has(arq)) falhar(`arquivo com dono duplo: ${arq} (${onde.get(arq)} e ${dono})`);
  else onde.set(arq, dono);
};
for (const [nome, d] of Object.entries(mapa.dominios)) {
  for (const arq of d.origem) declararArquivo(arq, nome);
}
for (const [nome, e] of Object.entries(mapa.externos)) {
  if (nome.startsWith('$')) continue;
  for (const arq of e.origem) declararArquivo(arq, `externo:${nome}`);
}

/* Rota declarada mas página não listada em `origem` é armadilha de extração:
 * o domínio promete a tela e chega na hora de mover sem saber qual arquivo
 * levar. Aconteceu com o shell, que declarava /sobre, /roadmap e /projetos
 * sem nenhuma delas na origem. Aqui o main.js é a fonte: ele diz qual arquivo
 * atende cada rota. */
const paginaDaRota = [...main.matchAll(/^(?:router\.register|reg)\('([^']+)'.*?\.\/pages\/([^']+)'/gm)];
for (const [, rota, arquivo] of paginaDaRota) {
  const caminho = `src/pages/${arquivo}`;
  const pasta = `${caminho.slice(0, caminho.lastIndexOf('/'))}/`;
  if (!donoArquivo.has(caminho) && !donoPasta.has(pasta)) {
    falhar(`página sem dono: ${caminho} atende ${rota}, mas não está na origem de ninguém`);
  }
}

/* Dataset sem dono: mesmo buraco das folhas, e o mais caro dos três, porque
 * `src/data/` são 10 MB. O critério de quem fica com o quê está no contrato
 * §5: `data` leva o que é GERADO por script ou consumido por mais de um
 * domínio; dataset de consumidor único mora no domínio dele. */
for (const arq of readdirSync(join(raiz, 'src/data')).filter((f) => /\.(js|json)$/.test(f))) {
  const caminho = `src/data/${arq}`;
  if (!donoArquivo.has(caminho)) falhar(`dataset sem dono: ${caminho}`);
}

/* Folha de estilo sem dono é o mesmo buraco da página sem dono — e passava
 * batido porque CSS não aparece em import de rota. Eram 93 de 95 quando este
 * check entrou. A folha segue quem a importa; as globais do index.html e as
 * multi-domínio ficam no shell, que é a fundação visual. */
for (const folha of readdirSync(join(raiz, 'src/styles')).filter((f) => f.endsWith('.css'))) {
  const caminho = `src/styles/${folha}`;
  if (!donoArquivo.has(caminho)) falhar(`folha sem dono: ${caminho}`);
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
const donos = [...declaradas.values()];
const emDominio = donos.filter((d) => !d.startsWith('lacuna:') && !d.startsWith('externo:')).length;
const emExterno = donos.filter((d) => d.startsWith('externo:')).length;
const emLacuna = donos.filter((d) => d.startsWith('lacuna:')).length;

console.log(`Nexus — mapa de migração (contrato ${mapa.versaoContrato})`);
console.log(`  rotas em src/main.js ....... ${rotasReais.length}`);
console.log(`  com domínio definido ....... ${emDominio}`);
console.log(`  em repositório externo ..... ${emExterno}`);
console.log(`  em lacuna (sem dono) ....... ${emLacuna}`);
console.log(`  arquivos com dono .......... ${donoArquivo.size}`);
console.log(`  domínios declarados ........ ${Object.keys(mapa.dominios).length}/${DOMINIOS_DO_PLANO.length}`);
console.log(`  repositórios externos ...... ${Object.keys(mapa.externos).filter((k) => !k.startsWith("$")).length}`);

const porEstado = {};
for (const d of Object.values(mapa.dominios)) porEstado[d.estado] = (porEstado[d.estado] ?? 0) + 1;
console.log(`  maturidade ................. ${Object.entries(porEstado).map(([e, n]) => `${e}: ${n}`).join(' · ')}`);

if (erros.length) {
  console.error(`\n✗ ${erros.length} divergência(s):`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ mapa bate com o código.');
