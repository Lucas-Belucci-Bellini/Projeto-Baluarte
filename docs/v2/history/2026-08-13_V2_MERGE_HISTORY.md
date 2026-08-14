# Histórico da reconstrução e dos merges da V2

**Data de consolidação:** 14 de agosto de 2026  
**Repositório:** [Lucas-Belucci-Bellini/Projeto-Baluarte][1]  
**Finalidade:** preservar o contexto das sessões anteriores e orientar quem precisa entender por que a V2 chegou ao estado atual.

## 1. Como usar este arquivo

Este documento é uma **síntese histórica reconciliada**. Os anexos originais foram preservados sem edição em [`2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt`](2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt) e [`2026-08-13_MERGE_AUDIT_SOURCE.md`](2026-08-13_MERGE_AUDIT_SOURCE.md).

A auditoria anexada registra um momento anterior em que a `main` ainda estava em `915bcfe7` e o merge da branch de continuidade havia sido interrompido localmente. Depois daquele registro, houve uma nova operação: a branch `v2/js-specialist-contract-hardening` foi integrada e publicada na `main` no merge `1fe33468`. Portanto, a frase “não houve merge publicado” é verdadeira para o snapshot histórico do anexo, mas não descreve o estado atual.

Para o estado atual do código, prevalece [`docs/v2/MAIN_ERROR_AUDIT.md`](../MAIN_ERROR_AUDIT.md), que audita o commit `1fe3346866f3b93105190b925a7f15c40eb0aea4` e registra os erros oficiais depois do merge.

## 2. Fontes arquivadas

| Fonte | Tipo | Hash SHA-256 | Tratamento |
| --- | --- | --- | --- |
| `2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt` | Transcrição completa da sessão enviada pelo usuário | `dff2c1bfd92fc96763872e8781a103ef13f73c7e2c2b7ca1b6fd5f30ba47aa6b` | Preservada integralmente, sem normalização |
| `2026-08-13_MERGE_AUDIT_SOURCE.md` | Relatório original da auditoria dos merges | `cceb12f6c707fab7720667525597761a818ff8a31e26540fe3a2d312bf18cc01` | Preservado integralmente, como registro histórico |
| `relatorio-merge-v2-baluarte.md` | Segundo anexo do relatório de merge | Mesmo hash do relatório acima | Identificado como duplicata byte a byte; não foi criado um terceiro arquivo redundante |

## 3. Linha do tempo reconciliada

| Momento | Evidência | Estado registrado |
| --- | --- | --- |
| Sessão anterior do Claude | Transcript arquivado | Fase 0, decisões de stack, benchmarks, contratos Runtime, branch de continuidade e limites da sessão |
| Branch de continuidade | `ae3953a0` / `460d1708` nas fontes históricas | Correções de lifecycle, grupos, bootstrap, stdio e provas do Runtime; type gate ainda incompleto |
| Primeira auditoria de merge | Relatório original anexado | Merge local interrompido, conflitos em Supervisor/teste e `origin/main=915bcfe7` |
| Integração posterior | Commit [`1fe33468`][2] | `v2/js-specialist-contract-hardening` integrada na `main` e publicada |
| Auditoria atual | [`MAIN_ERROR_AUDIT.md`](../MAIN_ERROR_AUDIT.md) | 80 falhas brutas agrupadas por causa raiz; 6 workflows vermelhos e 4 verdes |

## 4. O que a sessão anterior decidiu sobre a arquitetura

A sessão registrada no transcript separou dois sistemas que antes eram chamados genericamente de “Core”. O **Core de Orquestração**, executado no navegador, coordena módulos, rotas, views, contratos e eventos. O **Core de Runtime**, executado em processo isolado, deve cuidar de permissões reais sobre filesystem, rede, processos, supervisão e sandbox.

Essa separação é importante porque evita usar Rust/WASM para resolver um problema que pertence ao algoritmo ou à integração de UI. A sessão registrou benchmarks em que um escalonador caiu de aproximadamente `1073 µs` para `4,0 µs` por tarefa depois de remover uma estrutura O(n²), sem trocar JavaScript por outra linguagem. A decisão resultante foi medir antes de trocar de linguagem.

A divisão poliglota documentada na sessão histórica é:

| Camada | Linguagem/tecnologia histórica escolhida | Responsabilidade |
| --- | --- | --- |
| Interface web e Core de Orquestração | TypeScript como direção futura; etapa atual em JavaScript + JSDoc/checkJs | Módulos, rotas, views e coordenação no navegador |
| Core de Runtime | Rust | Processo isolado, permissões reais e sandbox |
| IA, coleta e automação | Python | Ecossistema de IA, workers e pipelines de automação |
| Parsers binários de alto volume | Rust | Processamento de `.p3d`/`.pbo` quando o benchmark justificar |
| Dados e fila entre processos | PostgreSQL/Supabase | Persistência, evidência, filas e isolamento |
| App desktop | Tauri/Rust, pós-1.0.0 | Superfície nativa para o Runtime confiável |

O README atual explica essa decisão de forma compatível com a evolução do repositório: a V1 continua JavaScript puro no navegador; a V2 é multi-linguagem, e TypeScript é usado hoje como verificador de contratos JSDoc, não como linguagem de execução já adotada em todo o produto.

## 5. O que foi construído na branch de continuidade

O relatório histórico descreve a branch `claude/issue-420-baluarte-cdzuo0` como uma frente de fechamento de contratos de Runtime. As mudanças registradas foram:

| Área | Resultado histórico |
| --- | --- |
| Lifecycle do Supervisor | Cleanup e shutdown alinhados ao contrato documentado |
| Runtime Manager Group | Compatibilidade com consumidores antigos e batches derivados |
| Runtime Bootstrap | Envelope autorizado serializável entre Registry e Runtime |
| Transporte stdio | JSDoc, narrowing e shim local para APIs Node |
| Runtime Rust | Correção de composição entre biblioteca e binário |
| Integração browser | Vertical slice funcional no snapshot histórico |
| Type gate | Ainda vermelho, apesar de os arquivos diretamente alterados terem sido tipados |

Essas mudanças não devem ser interpretadas como prova de que a V2 inteira estava pronta. A formulação correta, preservada na auditoria, é: **runtime e integração podem estar verdes enquanto o gate de tipos permanece vermelho**.

## 6. O que aconteceu nos merges

A primeira tentativa foi mesclar a branch de continuidade na `main`. O Git encontrou conflitos `add/add` porque as duas linhas haviam criado versões independentes da V2. Os conflitos mais importantes estavam em `runtime-bootstrap`, `runtime-transport`, `supervisor`, teste do Supervisor, contrato do Runtime e manifesto Cargo. A divergência de Supervisor não era apenas textual: havia duas APIs diferentes para Health e duas formas de expor `estado`.

Esse merge foi abortado antes de publicar qualquer alteração. O relatório anexado está correto nesse ponto para o momento em que foi escrito.

Depois, a branch `v2/js-specialist-contract-hardening` foi integrada em uma operação posterior. O merge final `1fe33468` foi publicado na `main` para que os checks oficiais revelassem o estado real. O resultado foi:

| Gate pós-merge | Estado |
| --- | --- |
| Testes JavaScript | 865 passaram, 6 falharam |
| TypeScript/JSDoc V2 | 71 diagnósticos |
| Runtime processual | 3 falhas `Broken pipe`/resposta ausente |
| Build | Verde |
| Browser E2E local | 13/13 verde |
| Security, CodeQL, Arma 3/Data e rotas | Verdes |

A auditoria atual agrupa as falhas em causas raiz, principalmente a incompatibilidade Supervisor/Health e o fato de `v2/runtime/src/main.rs` ainda ser apenas um banner, sem loop JSON de processo.

## 7. Regras que devem permanecer visíveis

O material arquivado converge em algumas regras para todas as próximas sessões:

1. Não iniciar uma alteração arquitetural sem ler o plano mestre, as regras, os documentos da área, os consumidores e as issues relacionadas.
2. Não usar `@ts-ignore`, `any`, exclusões ou relaxamento de `strict`/`checkJs` para produzir um CI artificialmente verde.
3. Não adicionar funcionalidades grandes enquanto os contratos fundamentais estiverem abertos.
4. Não permitir que um módulo derrube o Core; erros devem ser isolados quando tecnicamente possível.
5. Não duplicar Event Bus, Storage, Logger, Permission Manager ou outra infraestrutura sem uma decisão documentada.
6. Não tratar informação coletada por agentes como fato sem fonte, evidência, versão, data e validação.
7. Medir o gargalo real antes de trocar de linguagem ou introduzir um runtime novo.
8. Preservar a V1 como linha estável e permitir que a V2 seja experimental até atingir os gates do marco.
9. Fazer merges para revelar incompatibilidades somente com intenção explícita, registrando o resultado e sem chamar um estado vermelho de pronto para release.

## 8. O que uma pessoa nova deve fazer agora

A sequência recomendada é ler este histórico, o [roadmap de onboarding](../roadmap/ROADMAP_V2_ONBOARDING.md), o [Plano Mestre V2](../V2_MASTER_PLAN.md) e a [auditoria atual da main](../MAIN_ERROR_AUDIT.md). Depois, escolher uma causa raiz do mapa atual — e não um sintoma isolado —, consultar os consumidores do contrato e executar os gates correspondentes antes de abrir um merge.

A documentação histórica não substitui o estado atual. Ela existe para explicar decisões, tentativas e mudanças de contexto, evitando que uma sessão nova repita um merge antigo ou interprete como atual uma conclusão que já foi superada.

## 9. Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório Projeto-Baluarte"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1fe3346866f3b93105190b925a7f15c40eb0aea4 "Merge publicado da branch especialista JS V2"
