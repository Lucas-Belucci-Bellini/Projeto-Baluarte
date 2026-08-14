# Relatório de auditoria dos merges da V2 do Projeto Baluarte

**Data da auditoria:** 13 de agosto de 2026  
**Repositório:** [Lucas-Belucci-Bellini/Projeto-Baluarte][1]  
**Branch principal auditada:** `main`  
**Branch de continuidade trabalhada:** `claude/issue-420-baluarte-cdzuo0`  
**Branch adicional solicitada:** `v2/js-specialist-contract-hardening`  
**Autor:** Manus AI

## 1. Resumo executivo

O trabalho começou a partir da branch de continuidade criada durante a sessão anterior do Claude. O objetivo operacional foi continuar a construção da V2, corrigir os contratos que ainda quebravam a suíte e verificar se seria seguro integrar o resultado na `main`.

O resultado técnico da branch de continuidade foi positivo em quatro áreas importantes: a suíte JavaScript ficou verde, o build Vite ficou verde, a integração real da V2 no navegador ficou verde e os testes do Runtime Rust ficaram verdes depois que o ambiente Rust foi atualizado e um erro real de composição do binário foi corrigido. Entretanto, o portão de tipos da V2 continuou vermelho. Portanto, a branch ficou **funcional em runtime e testes**, mas não ficou pronta para ser considerada completamente verde.

O merge para a `main` foi tentado localmente, mas não foi concluído. O Git encontrou seis conflitos `add/add`, porque a `main` e a branch de continuidade haviam criado versões independentes dos mesmos arquivos da V2. Quatro conflitos foram escolhidos e adicionados ao índice; dois continuam abertos: `v2/core/supervisor.js` e `test/v2/supervisor.test.js`. Não existe commit de merge e nada foi enviado para `origin/main`. A `main` remota permaneceu em `915bcfe7`.

A branch `v2/js-specialist-contract-hardening` é um caso separado e maior. No momento da auditoria, ela estava **38 commits atrás e 261 commits à frente** da `main`, com o PR #431 aberto e estado de merge `unstable`.[4] Os testes JavaScript e o build local dessa branch passaram, mas o portão `tsc` falhou com 71 erros. No GitHub, os checks `Build + invariantes` e `V2 Core` falharam, enquanto as verificações de rotas e Vercel passaram.[4] [5] [6]

> **Conclusão:** não houve quebra publicada na `main`, porque o merge foi interrompido antes da criação do commit. A quebra observada foi de integração/conflito e de tipagem, não de execução principal. O estado local, porém, está no meio de um merge e precisa ser abortado ou finalizado antes de continuar qualquer trabalho.

## 2. Estado dos branches e hashes

| Referência | Hash observado | Estado observado | Relação com `main` |
| --- | --- | --- | --- |
| `origin/main` | `915bcfe7` | Remota intacta | Base de comparação |
| `origin/claude/issue-420-baluarte-cdzuo0` | `ae3953a0` | Branch de continuidade atualizada | 193 commits à frente da `main` antes do merge local |
| `origin/v2/js-specialist-contract-hardening` | `fe692647` | Branch do especialista JS/JSDoc | 38 atrás e 261 à frente da `main` |
| `HEAD` local durante a auditoria | `915bcfe7` | `main` local com merge em andamento | Possui `MERGE_HEAD=ae3953a0` |
| `MERGE_HEAD` local | `ae3953a0` | Commit que está sendo integrado | Merge ainda não finalizado |

A branch de continuidade foi publicada com o commit `ae3953a0`, cuja mensagem é `fix(v2): fechar contratos de runtime e stdio`.[2] Esse commit não foi incorporado à `origin/main`. A tentativa de integração executada depois foi somente local.

A branch do especialista corresponde ao PR #431, intitulado **“V2: JS specialist hardening — runtime health contracts”**.[4] Ela contém 38 commits que ainda estão apenas na `main` em relação a ela e 261 commits exclusivos da própria branch. Essa assimetria explica por que a página do GitHub mostra simultaneamente os números `38` e `261`: a branch não é uma pequena correção linear sobre a `main`; ela é uma linha de desenvolvimento extensa, com muita história paralela.

## 3. Linha do tempo do que aconteceu

### 3.1. Estado recebido da sessão anterior

O conteúdo enviado pelo usuário descrevia uma sessão do Claude que já havia desenvolvido uma grande parte da V2: revisão da arquitetura, decisão de stack, contratos de Runtime, testes de segurança, supervisor, lifecycle, grupos de módulos e uma prova experimental do Runtime Rust. A sessão anterior terminou por limite de uso depois de registrar resultados da prova do Runtime.

A branch encontrada no GitHub não estava parada no primeiro commit descrito na mensagem. Ela já continha uma sequência extensa de commits posteriores, incluindo a evolução do Runtime, contratos de lifecycle, segurança, grupos, observabilidade e integração.

### 3.2. Inspeção inicial da branch de continuidade

A branch `claude/issue-420-baluarte-cdzuo0` foi clonada e verificada. O `HEAD` inicial apontava para `60d2f020`, com a mensagem `runtime: valida resultados antes da versão da resposta`. Ela tinha 349 arquivos alterados em relação à `main`, com aproximadamente 26.499 linhas adicionadas e 8.291 removidas.

O plano-mestre da V2 confirma que a ordem arquitetural correta é construir e testar Core, Module System, contratos, migração e somente depois módulos grandes. O mesmo documento também determina que nenhuma alteração grande deve ser mesclada sem testes.[7]

### 3.3. Linha de base antes das correções

A primeira execução revelou que a branch não estava verde naquele ambiente:

| Verificação | Resultado inicial | Diagnóstico |
| --- | ---: | --- |
| `npm test` | 837 passou, 8 falharam, de 845 | Contratos de supervisor/grupos e `runtime-bootstrap` incompatíveis |
| `npm run build` | Falhou com código 127 | `vite` não estava instalado no ambiente |
| `npm run tipos:v2` | Falhou com código 127 | `tsc` não estava instalado no ambiente |
| `npm run v2:integracao` | Falhou | Navegador do Playwright não estava instalado |
| `npm run v2:runtime` | Falhou com código 127 | `cargo` não estava instalado |

As oito falhas JavaScript eram de dois tipos. Três vinham do supervisor de lifecycle, principalmente por ordem de cleanup diferente daquela documentada. Quatro vinham do agrupador de Runtime, que passou a exigir objetos `dependencies` e `batches` mesmo quando os testes e consumidores antigos forneciam apenas o Registry. A oitava falha vinha do teste de contrato que importava `runtime-bootstrap.js`, camada ausente naquela versão da branch.

### 3.4. Correções implementadas na branch de continuidade

Foram feitas as seguintes correções no commit `ae3953a0`:

| Área | Alteração | Motivo |
| --- | --- | --- |
| Supervisor de módulo | Cleanup de falha passou a executar `dispose` antes de fechar o Runtime; o shutdown normal passou a seguir `stop → dispose → fechar Runtime` | Alinhamento com `docs/v2/V2_RUNTIME_LIFECYCLE.md` |
| Teste do supervisor | O harness passou a criar hooks padrão de `init`, `start`, `stop` e `dispose`; a expectativa de shutdown foi atualizada | O teste anterior não exercitava os hooks padrão e esperava ordem incompatível |
| Grupo de Runtime | `dependencies` e `batches` passaram a ser derivados quando omitidos; quando só o grafo é fornecido, ele é adaptado para batches singleton | Compatibilidade com consumidores antigos sem retirar validação |
| Bootstrap do Runtime | Foi adicionada a camada que transforma Registry + Permission System em envelope serializável | O contrato de integração exigia uma fronteira explícita de autorização |
| Transporte stdio | Foram adicionados contratos JSDoc, narrowing de valores nulos e um shim local mínimo para as APIs Node | O transporte não fazia parte do escopo browser original do `jsconfig` |
| Rust binário | Imports `crate::...` foram corrigidos para `baluarte_runtime::...`; o `main.rs` também recebeu o import de `std::env` | O protocolo estava compilando como binário separado da biblioteca |

### 3.5. Ambiente de validação

Para poder testar de verdade, foram instaladas as dependências Node declaradas no projeto e o navegador Chromium do Playwright. O primeiro `cargo` instalado pelo sistema era a versão 1.75, que não conseguia ler a dependência `getrandom 0.4.3`, pois ela requer suporte à edição 2024 do Rust. O toolchain foi então atualizado para Rust/Cargo 1.97.1 usando o canal estável. Esse problema era de ambiente, mas revelou também um erro real nos imports do binário Rust, que foi corrigido no código.

## 4. Resultados depois das correções

Depois das correções, os contratos diretamente afetados passaram e a suíte completa ficou verde:

| Verificação | Resultado após correções | Interpretação |
| --- | ---: | --- |
| Testes afetados | 14/14 | Supervisor, grupo, dependências e contract slice verdes |
| `npm test` | 846/846 | Nenhum teste JavaScript falhou |
| `npm run build` | Passou | Build Vite produzido; permaneceu apenas warning de chunks acima de 500 kB |
| `npm run v2:integracao` | 13/13 | Boot, módulos, rotas, permissões e navegação real verdes |
| `npm run v2:runtime` | 26 testes da biblioteca + 5 do binário + 3 de processo | Runtime Rust verde, total de 34 testes executados |
| `npm run tipos:v2` | Falhou com 137 erros | Nenhum erro nos arquivos principais alterados nesta sessão, mas o Core inteiro ainda não está tipado |

A integração browser foi particularmente importante: ela confirmou que os três módulos sobem, as 17 rotas chegam ao router real da V1, a navegação vem do manifesto, a view nativa renderiza, o módulo usa o contexto do Core e as concessões/revogações de permissões funcionam. O Runtime Rust também passou pelos testes de envelope, isolamento por módulo, confinamento de caminhos, permissões, processo stdio, JSON inválido e requests grandes.

O warning do build não foi tratado como erro: o Vite informou que alguns chunks ultrapassam 500 kB depois da minificação. Isso é uma oportunidade de code splitting, não uma quebra funcional detectada.

## 5. O portão de tipos: o principal problema ainda aberto

O portão `npm run tipos:v2` continuou vermelho. Na branch de continuidade, a execução local encontrou 137 erros. Os erros estavam distribuídos principalmente por:

| Arquivo ou grupo | Natureza dos erros |
| --- | --- |
| `runtime-stdio.js` | APIs Node fora do escopo de tipos browser; parte resolvida com shim local |
| `vertical-slice.js` | hooks e parâmetros sem contratos JSDoc |
| `module-runtime-events.js`, `module-runtime-health.js`, `module-runtime-lifecycle.js` | parâmetros implícitos e tipos de erro/estado ausentes |
| `runtime-group-status.js`, `runtime-manager.js`, `runtime-dependency-contract.js` | opções obrigatórias tratadas como opcionais e retornos `unknown` |
| `runtime-state-machine.js`, `runtime-state-events.js` | histórico mutável sem tipo e narrowing de estado incompleto |
| `runtime-supervisor.js`, `supervisor.js` | opções, snapshots e estado global não descritos por JSDoc |
| `runtime-transport.js` | payload recebido como `unknown` e normalização de erro |

Os quatro arquivos implementados ou modificados diretamente nesta sessão foram tipados até não produzirem erros próprios no portão: `module-runtime-supervisor.js`, `runtime-manager-group.js`, `runtime-bootstrap.js` e `runtime-stdio.js`. Isso reduziu o débito local, mas não tornou o escopo completo verde.

Portanto, a afirmação correta não é “a V2 está verde”. A formulação correta é: **os testes de runtime e integração estão verdes; o gate de tipos ainda está vermelho**.

## 6. O merge local na `main`

Depois que a branch de continuidade foi publicada, foi executado:

```text
git switch main
git pull --ff-only origin main
git merge --no-ff ae3953a0 -m "merge: integrar correções do Runtime V2"
```

A atualização da `main` remota estava limpa e sem commits novos. O merge local, porém, encontrou seis conflitos `add/add`:

| Arquivo | Por que conflitou | Estado atual |
| --- | --- | --- |
| `v2/core/runtime-bootstrap.js` | `main` já tinha uma versão com Registry selado e `criarGrantRuntime`; a branch trazia uma implementação mais genérica, sem esse export | Resolvido e staged, preservando o contrato mais completo da `main` com robustez adicional |
| `v2/core/runtime-transport.js` | As duas versões eram quase iguais; havia diferença na ordem de validação da resposta | Resolvido e staged usando a versão da `main` |
| `v2/core/supervisor.js` | `main` esperava health/status com `definirEstado`/`retrato`; a branch adicionava readiness, concorrência e getter `estado` | **Ainda em conflito** |
| `test/v2/supervisor.test.js` | Os testes da `main` esperavam `supervisor.estado()`; os da branch esperavam `supervisor.estado` como propriedade | **Ainda em conflito** |
| `v2/runtime/CONTRACT.md` | A branch tinha a documentação expandida de envelope, isolamento e evolução | Resolvido e staged usando a versão expandida |
| `v2/runtime/Cargo.toml` | A versão da `main` não declarava `serde` e `serde_json`, embora o código Rust os importasse | Resolvido e staged usando a versão funcional da branch |

O conflito de `supervisor.js` não é apenas textual. Ele representa duas decisões de API que precisam ser unificadas conscientemente. A `main` possui integração com o monitor de saúde e retorno `status()`; a branch possui deduplicação de operações concorrentes, verificação de readiness e diagnóstico de último erro. Além disso, a API `estado()` da `main` é incompatível com o getter `estado` da branch. O teste conflitado revela exatamente essa divergência.

Uma tentativa de substituir o arquivo conflitado por uma versão unificada não foi aplicada porque o arquivo ainda continha marcadores de conflito do Git. O arquivo permaneceu corretamente sinalizado como não resolvido; nenhum commit parcial de merge foi criado.

O estado local atual é:

```text
HEAD       = 915bcfe7  (main)
MERGE_HEAD = ae3953a0  (commit da branch de continuidade)
conflitos  = v2/core/supervisor.js e test/v2/supervisor.test.js
origin/main permanece em 915bcfe7
```

Isso significa que **não houve merge publicado na `main`**. O merge foi interrompido antes do commit final e antes de qualquer `git push` para `origin/main`.

## 7. A branch `v2/js-specialist-contract-hardening`

A branch solicitada corresponde ao PR #431, aberto contra `main`.[4] Ela representa uma frente de endurecimento de contratos JavaScript/JSDoc, não apenas uma correção pontual do Runtime. Seus commits incluem tipagem do Runtime lifecycle, restart, supervisor, grupos, dependências, transport, session client, bootstrap, bridge, plataforma e orquestrador.

A reprodução local da branch apresentou:

| Verificação | Resultado na branch do especialista |
| --- | ---: |
| `npm test` | 853/853 |
| `npm run build` | Passou, com o mesmo warning de chunks grandes |
| `tsc -p v2/jsconfig.json` | Falhou com 71 erros |
| PR #431 no GitHub | 2 checks falhos, 3 bem-sucedidos, 1 skipped |

Os 71 erros locais indicam que a branch avançou bastante no endurecimento de contratos, mas ainda não fechou o próprio portão de tipos. Os erros mais representativos foram:

- `boot.js` ainda possui incompatibilidade entre o Registry usado pelo Runtime e o contrato completo do Registry.
- `plataforma.js` referencia `criarRegistry`, que não está exportado pelo `registry.js` observado nessa linha da branch.
- `runtime-group-snapshot.js` e `runtime-group-status.js` ainda tratam opções possivelmente ausentes como presentes.
- `runtime-manager-group.js` ainda possui incompatibilidade de opções default, narrowing de `PromiseSettledResult` e propriedade customizada de `AggregateError`.
- `runtime-manager.js`, `runtime-module-readiness.js`, `runtime-readiness-wait.js` e `runtime-session-client.js` ainda possuem divergências entre tipos declarados e retornos efetivos.
- `runtime-stdio.js` ainda dependia de definições Node não contempladas pelo `jsconfig` daquela branch.
- `vertical-slice.js` continuava com hooks e parâmetros sem JSDoc.

O GitHub classificou o PR como aberto, mergeable do ponto de vista textual, mas `unstable` por causa dos checks. Os checks foram:

| Check | Resultado |
| --- | --- |
| `CI / Build + invariantes` | Falhou |
| `V2 Core / core` | Falhou no `npm run tipos:v2` |
| `Vigia das rotas / Todas as rotas estão verdes?` | Passou |
| `Vercel` | Passou |
| `Vercel Preview Comments` | Passou |
| `Supabase Preview` | Skipped |

Os logs do GitHub mostram que a falha principal do `V2 Core` foi a tipagem, com erros em `runtime-stdio.js`, `runtime-supervisor.js`, `runtime-transport.js`, `supervisor.js`, `vertical-slice.js` e outros módulos do Core.[5] O PR e seus checks podem ser acompanhados diretamente no GitHub.[4]

## 8. O que deu errado e o que não deu errado

### O que deu errado

O primeiro problema foi de ambiente: as dependências Node, o navegador Playwright e o Cargo não estavam instalados no sandbox. Isso impediu as primeiras execuções, mas não representou falha do produto.

O segundo problema foi real: oito testes da branch de continuidade estavam quebrados por contratos parcialmente sincronizados. O supervisor, o agrupador de Runtime e o bootstrap tinham evoluído em ritmos diferentes.

O terceiro problema foi real no Rust: o protocolo do binário usava imports relativos ao crate root da biblioteca, embora `main.rs` compilasse como um crate binário separado. O código só revelou isso quando o toolchain Rust correto conseguiu compilar as dependências.

O quarto problema foi arquitetural de integração: a `main` e a branch de continuidade haviam criado arquivos V2 independentes. O resultado foi um merge com seis conflitos `add/add`, inclusive em contratos centrais. Isso mostra que a linha de branches não estava sendo integrada com frequência suficiente.

O quinto problema continua aberto: a tipagem completa da V2 está longe de verde. O especialista reduziu e organizou parte do débito, mas o PR #431 ainda falha com 71 erros; a branch de continuidade auditada localmente ficou com 137 erros no seu escopo.

### O que não deu errado

A suíte JavaScript da branch de continuidade ficou verde, com 846 testes passando. O build Vite passou. A integração real da V2 no navegador passou em 13/13 verificações. O Runtime Rust passou em 34 testes combinados. A branch do especialista também passou em todos os seus 853 testes e no build local.

Nenhuma alteração foi publicada em `origin/main`. O merge incompleto não criou um commit falso nem deixou a `main` remota parcialmente alterada. O problema está isolado ao workspace local, que atualmente contém um merge aberto.

## 9. Diagnóstico final

O estado do projeto pode ser resumido assim:

| Camada | Estado | Confiança |
| --- | --- | --- |
| V1 existente | Não houve regressão detectada na suíte | Alta |
| V2 JavaScript runtime | Testes verdes na branch de continuidade | Alta para os cenários cobertos |
| V2 integração browser | 13/13 verde | Alta para o vertical slice exercitado |
| Runtime Rust | Biblioteca, binário e processo verdes | Alta para o contrato atual de leitura/confinamento |
| Build Vite | Verde, com warning de tamanho de chunks | Alta |
| JSDoc/TypeScript | Vermelho | Baixa até zerar os erros |
| Merge com `main` | Não concluído, dois conflitos abertos | Nula até resolução e novo ciclo de testes |
| PR #431 | Aberto, checks principais falhando | Não pronto para merge automático |

A principal lição é que “testes verdes” e “merge seguro” são estados diferentes neste repositório. Os testes mostraram que as implementações funcionam em seus próprios contextos. O merge mostrou que os contratos entre linhas de desenvolvimento ainda não estão consolidados. O portão de tipos confirmou que a superfície da V2 ainda não possui uma única fonte de verdade para as assinaturas.

## 10. Próximos passos recomendados

A ação mais segura agora é **não continuar escrevendo sobre esse workspace enquanto o merge estiver aberto**. Primeiro, deve-se decidir entre preservar o merge para resolvê-lo ou voltar ao estado limpo com `git merge --abort`. Como a `origin/main` não foi alterada, abortar o merge local não perde nada publicado.

Depois, a ordem recomendada é resolver primeiro o contrato de `supervisor.js` e seu teste. A decisão precisa ser explícita: manter `estado()` como API compatível com os consumidores atuais ou migrar todos os consumidores para uma propriedade. A implementação também deve incorporar readiness, health/status e deduplicação de operações sem manter duas APIs concorrentes.

Em seguida, a branch `v2/js-specialist-contract-hardening` não deve ser mesclada inteira de uma vez. Ela deve ser rebaseada ou integrada em uma branch temporária, com atenção especial aos 53 arquivos que também mudam em relação à branch de continuidade. O caminho mais seguro é aplicar os commits de tipagem por famílias de contratos, executar `npm run tipos:v2` a cada grupo e só então avaliar a integração na `main`.

O portão decisivo deve ser `npm run tipos:v2` com zero erros. Depois dele, repetir `npm test`, `npm run build`, `npm run v2:integracao` e `npm run v2:runtime`. Somente com todos esses gates verdes é que um commit de merge deve ser criado e enviado à `main`.

### Comandos para recuperar o workspace atual

Se a intenção for abandonar o merge local incompleto:

```bash
git merge --abort
git status --short --branch
```

Se a intenção for continuar o merge:

```bash
git diff --name-only --diff-filter=U
git diff -- v2/core/supervisor.js test/v2/supervisor.test.js
# resolver os dois arquivos, depois:
git add v2/core/supervisor.js test/v2/supervisor.test.js
git commit -m "merge: integrar correções do Runtime V2"
```

O segundo caminho só deve ser seguido depois de consolidar a API do supervisor e executar novamente todos os testes. O relatório não conclui o merge nem altera a `main` remota.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório Projeto-Baluarte"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ae3953a06e05f4b4169eb4d05e8692295ad8d33c "Commit fix(v2): fechar contratos de runtime e stdio"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/claude/issue-420-baluarte-cdzuo0 "Branch de continuidade do Runtime V2"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/431 "PR #431 — V2 JS specialist hardening"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31751363929 "Check V2 Core do PR #431"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31751363953 "Check CI Build + invariantes do PR #431"
[7]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/docs/v2/V2_MASTER_PLAN.md "Plano-mestre da V2"
