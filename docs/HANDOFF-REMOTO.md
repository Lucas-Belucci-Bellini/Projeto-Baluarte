# Handoff para a sessão REMOTA

O inverso do [`HANDOFF-LOCAL.md`](./HANDOFF-LOCAL.md). Aquele descreve o que só a
máquina do operador faz; **este descreve o que só o remoto faz** — e existe
porque a sessão local de 16/08/2026 esbarrou em quatro coisas que ela não tinha
como verificar, todas verificáveis no Linux do CI.

## Estado em 16/08/2026

`main` = `5a19299e`. **Não há nada preso no local**: os quatro worktrees estão
limpos, o `main` local bate com o `origin/main`, e tudo de substância está
publicado. Pode começar direto de `origin/main`.

CI do `main`: **tudo verde, menos `Supabase Preview`.**

| check | |
| --- | --- |
| `validate` (V2 Validation) | ✅ |
| `Build + invariantes` | ✅ |
| `Rust Runtime — fmt + test + clippy` | ✅ |
| `core` · `runtime` · `arma3` | ✅ |
| `Todas as rotas estão verdes?` | ✅ |
| `Analisar (python / javascript-typescript)` | ✅ |
| **`Supabase Preview`** | ❌ *Remote migration versions not found in local migrations directory* |

## A assimetria que motiva este arquivo

Quatro verificações **não rodam na máquina do operador** (Windows) e rodam aqui.
Se você precisar de evidência sobre qualquer uma delas, você é quem consegue
produzi-la — a sessão local não consegue, e vai ter que acreditar em você.

| o que | por que não roda no Windows |
| --- | --- |
| `npm run v2:runtime` | precisa do `cargo`; não está instalado lá |
| `npm run testar-*-arma3` (4 scripts) | `UnicodeEncodeError` — console em cp1252 não codifica o `✓` que os scripts Python imprimem |
| `npm test` | quebrado no Windows; lá se roda `npx tsx --test $(find test -name '*.test.js')` por bash |
| `Supabase Preview` | nunca foi investigado localmente |

Nenhuma delas é defeito de produto: são defeitos de *ambiente*. Não "conserte"
o código por causa delas sem antes confirmar que o sintoma existe no Linux.

## Fila

A ordem está em [`docs/v2/V2_PROGRESS.md`](./v2/V2_PROGRESS.md) §"Próximo bloco".
O que trava cada item, hoje:

1. **Integrar a fachada ao entrypoint oficial da V2** — *já existe implementado*
   na branch `claude/nexus-config-refactor-462339` (publicada, **sem PR**). O
   merge dela com o `main` de então foi testado a seco (`git merge-tree`) e era
   **limpo**; o `main` andou depois, então refaça o teste. Ressalva: a branch é
   um saco de gatos — junto da fachada ela traz `empacotar-motores.mjs`,
   `gen-catalogo-skills.mjs`, `install-obsidian-plugin.mjs`,
   `distribuir-skills.mjs`, `tool-run.mjs`, `sync-ai-tools.mjs`,
   `lib/ai-tools.mjs` e o `skills-catalogo`. Vale separar a fachada num PR
   próprio; se não der, revise-a isoladamente. **Não foi verificado se ela está
   verde** — rode `tipos:ts`, `tipos:v2`, `build` e a suíte antes de mergear.
2. **Contract test `Manifest → Registry → Permission → Runtime`** — pressupõe o
   item 1. Escrever contra um `v2/harness/main.js` que está prestes a mudar é
   trabalho que nasce para ser refeito.
3. **`Supabase Preview`** — independente de tudo acima, e o único vermelho do
   `main`. Bom primeiro alvo se quiser algo desacoplado.

## Armadilhas já pagas — não reintroduza

**A família "Windows".** Cinco instâncias já apareceram: `spawn('npx')` que morre
em `ENOENT` no Node 24 (`npx` é `npx.cmd`, e o Node recusa spawnar `.cmd` desde a
CVE-2024-27980); `path.relative` devolvendo `src\core\flags.ts` em gerador cujo
produto é versionado; `npm test`; os verificadores Python em cp1252; e o console.
**Script novo que monta caminho ou spawna processo tem que ser pensado nos dois
sistemas** — o CI só cobre o Linux, então o outro lado é ponto cego.

**Espera por relógio.** O portão de integração reprovava um módulo correto porque
dormia 900 ms fixos antes de ler a tela. Sleep fixo mede a máquina, não o
sistema. Espere por condição, com teto.

**Geradores que não enxergam TypeScript.** Quem migra um arquivo ganha um
`flags.ts` com o código e deixa um `flags.js` que só re-exporta. Dois geradores
de catálogo varriam apenas `.js`, liam o shim e concluíam que ninguém emitia o
evento. Pior: o CI mandava *"rode o gerador e commite o resultado"*, e obedecer
teria apagado 11 eventos verdadeiros do documento. **Se um verificador de
catálogo acusar drift, confira o diff antes de commitar** — regeneração que
*remove* linha merece desconfiança. O mesmo padrão vale para chamada tipada:
`bus.on<NucleoEvent>('x', …)` era invisível ao regex que exigia o parêntese
colado no método.

**Passo vermelho esconde os seguintes.** Nos jobs, um passo que falha deixa os
posteriores `skipped`. O `tipos:v2` vermelho escondeu, em ordem: o catálogo de
eventos, o de storage e o Chromium ausente. Ao consertar um passo, **espere
achar outro atrás dele** — e não confunda isso com regressão.

**Push de bot não dispara workflow.** Os commits automáticos de câmbio usam o
`GITHUB_TOKEN` padrão, e o GitHub não dispara Actions nesse caso. Por isso o
`main` passou dias vermelho sem ninguém ver: ele só é medido quando um humano
empurra. Não leia "último CI verde" como "`main` verde" sem olhar o SHA.

## Política de entrega combinada com o operador

Incremental. Cada peça verde vai para o `main` assim que verifica, com branch de
backup antes (`backup/AAAA-MM-DD-...`, empurrada) e entrada no
`historico/CHANGELOG.md` no merge.

| landa direto | para para revisão |
| --- | --- |
| ferramental, portões, tipos, docs | contrato, esquema de dado, comportamento visível |

O motivo é medição, não gosto: lote grande dá **um** sinal de CI para N
mudanças; N pushes dão N sinais, e o vermelho já vem localizado.

## Pendência cosmética

A ref remota `fix/tipos-v2` aponta para `663d62f3`, a versão *pré-amend* do
commit. Todo o conteúdo dela está no `main` (`31e6512d` + `5a19299e`); é ref
velha, não trabalho perdido. Pode apagar:

```
git push origin --delete fix/tipos-v2
```
