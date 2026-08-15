# Auditoria de confiabilidade dos bots e dos gates

**Audited commit:** `603bd6002ccc2030d0a0311958516fc20de69552`

**Status:** AUDIT AND PLAN — nenhum workflow foi alterado nesta etapa.

**Objetivo:** analisar a evidência enviada pelo operador, confirmar o estado no GitHub e definir como os próximos bots devem produzir menos erros, com causas raiz explícitas e sem esconder falhas.

## 1. Resumo executivo

A imagem enviada mostra um snapshot com cinco checks não bem-sucedidos: **CI / Build + invariantes**, **Supabase Preview**, **Vercel — Deployment rate limited**, **V2 Core** e **V2 Validation**. Também mostra o **Vigia das rotas** em andamento e CodeQL, análise Python e Runtime Rust verdes. A imagem é uma evidência histórica fornecida pelo operador; a confirmação atual foi feita contra o commit publicado `603bd6002ccc2030d0a0311958516fc20de69552`.

No commit atual, três workflows falham pela mesma causa raiz: o comando `npm run tipos:v2` reproduz **61 diagnósticos TypeScript/JSDoc**. Portanto, não são três problemas independentes. `CI`, `V2 Core` e `V2 Validation` estão duplicando o mesmo bloqueio de contrato; o primeiro reparo deve ser feito no mapa de tipos da V2, e não em três workflows diferentes.

| Grupo observado | Estado no commit atual | Classificação | Decisão |
| --- | --- | --- | --- |
| `CI` | Falha | Causa raiz compartilhada: `tipos:v2` com 61 diagnósticos | Corrigir contratos V2 antes de alterar o workflow |
| `V2 Core` | Falha | Mesmo `tipos:v2`; efeito cascata do mesmo contrato | Não contar como segunda causa |
| `V2 Validation` | Falha | Mesmo `tipos:v2`; integração/build nem chegam a ser a evidência primária | Reexecutar depois da correção do tipo-raiz |
| `Supabase Preview` | Falhou no snapshot da imagem; não há log atual correspondente entre os runs recentes do `main` consultados | Causa ainda não classificada | Não inventar correção; capturar o log do run específico |
| `Vercel` | `Deployment rate limited — retry in 24 hours` | Limitação operacional da plataforma, não erro de código demonstrado | Aguardar janela de retry e registrar como incidente de infraestrutura |
| `Vigia das rotas` | Verde no commit atual | Gate de regressão V1 | Não alterar sem evidência |
| `CodeQL` | Verde no commit atual | Segurança estática | Preservar |
| `V2 Runtime` | Verde no commit atual | Runtime Rust/execução | Preservar |
| `Core CI` | Verde no commit atual | Core isolado | Preservar |
| `Arma 3 Data CI` | Verde no commit atual | Dados e invariantes Arma 3 | Preservar |

A leitura correta para os próximos bots é: **um contrato quebrado deve gerar uma ocorrência raiz, os workflows dependentes devem apontar para essa ocorrência e o relatório não deve contar cada repetição como um novo defeito**.

## 2. Evidência e comandos executados

| Evidência | Resultado |
| --- | --- |
| `gh run list --repo Lucas-Belucci-Bellini/Projeto-Baluarte --branch main` | Runs recentes do `main` consultados; o commit `603bd6002ccc...` possui CI, V2 Core e V2 Validation falhos, enquanto Core CI, V2 Runtime, Arma 3 Data CI, CodeQL e Vigia passam |
| `gh run view 31864958690 --log-failed` | CI termina em `tipos:v2` com 61 diagnósticos |
| `gh run view 31864958637 --log-failed` | V2 Core reproduz os mesmos 61 diagnósticos |
| `gh run view 31864958667 --log-failed` | V2 Validation reproduz os mesmos 61 diagnósticos |
| `npm run tipos:v2` | Falha localmente com os mesmos 61 diagnósticos |
| `npm test` | 884/884 no gate local da migração frontend |
| `npm run build` | Verde localmente; permanece apenas o aviso histórico de chunks acima de 500 kB |
| `npm run smoke` | 98/98 verde localmente |
| `npm run v2:integracao` | 14/14 verde localmente |
| `npm run caminho-critico` | 15/15 verde localmente |

### Runs relevantes

Os links abaixo são os runs do commit atual que sustentam a matriz: [CI 31864958690][1], [V2 Core 31864958637][2], [V2 Validation 31864958667][3], [Core CI 31864958641][4], [V2 Runtime 31864958604][5], [Vigia das rotas 31864958642][6], [CodeQL 31864958657][7] e [Arma 3 Data CI 31864958674][8].

## 3. Matriz de causas raiz

### ROOT-TYPES-001 — O gate `tipos:v2` está vermelho em 61 pontos

| Campo | Registro |
| --- | --- |
| Workflow/comando | `CI`, `V2 Core`, `V2 Validation`, `npm run tipos:v2` |
| Severidade | Alta para a publicação da V2; os testes comportamentais locais continuam passando |
| Categoria | Contrato arquitetural de tipos JSDoc/checkJs |
| Causa raiz | A implementação V2 em JavaScript/JSDoc e os contratos inferidos não concordam sobre opções obrigatórias, retornos, lifecycle, ambiente Node e objetos de snapshot |
| Efeito cascata | Três workflows reportam vermelho para a mesma execução lógica; a falha de tipo impede a etapa seguinte de ser uma evidência independente |
| Contrato arquitetural? | Sim; o reparo deve consolidar interfaces compartilhadas, não adicionar casts locais |
| Regra | Não usar `any`, `@ts-ignore`, exclusões do `checkJs` ou relaxamento do strict |

A distribuição por arquivo é:

| Arquivo | Diagnósticos | Família |
| --- | ---: | --- |
| `v2/core/runtime-stdio.js` | 28 | Ambiente Node e callbacks/pending sem anotações |
| `v2/core/vertical-slice.js` | 11 | Lifecycle de módulos/hooks sem interface explícita |
| `v2/core/runtime-supervisor.js` | 3 | Snapshot/opções do supervisor |
| `v2/core/runtime-group-snapshot.js` | 3 | Registry opcional e módulos `unknown` |
| `v2/core/runtime-manager-group.js` | 3 | Opções, `PromiseSettledResult` e erro agregado |
| `v2/core/runtime-session-client.js` | 3 | Parâmetros e shape de resposta de sessão |
| `v2/core/runtime-bridge.js` | 2 | String não estreitada para `Permission` |
| `v2/core/runtime-group-status.js` | 2 | Batches opcionais e shape de módulos |
| `v2/core/runtime-manager.js` | 2 | Opções e retorno de restart |
| `v2/core/runtime-module-readiness.js` | 2 | Readiness e predicado booleano |
| `v2/core/runtime-readiness-wait.js` | 1 | Opções de espera obrigatórias |
| `v2/core/runtime-transport.js` | 1 | Grants recebidos como `unknown` |
| **Total** | **61** | **Uma causa raiz agregada, doze superfícies afetadas** |

### Ordem de correção que reduz mais erros

1. **`runtime-stdio.js` e ambiente Node**, porque concentra 28 de 61 mensagens e é uma fronteira bem delimitada entre processo e Core. Declarar somente `ChildProcess`, `readline.Interface`, `pending` e callbacks realmente usados.
2. **`vertical-slice.js`**, porque seus 11 erros representam o contrato comum de módulos e hooks. Definir lifecycle de `init`, `start`, `stop` e `dispose` antes de adaptar consumidores.
3. **Supervisor e snapshots**, reunindo `runtime-supervisor.js`, `runtime-group-snapshot.js` e `runtime-group-status.js`. Decidir uma única forma de representar `modules`, estado e dependências obrigatórias.
4. **Managers e readiness**, alinhando opções validadas, formato de restart, `PromiseSettledResult` e retorno de readiness.
5. **Session, bridge e transport**, estreitando permissões, grants e respostas sem transformar a fronteira em `unknown` permanente.
6. Rodar uma única vez `tipos:v2`, depois os testes específicos, e só então deixar CI, V2 Core e V2 Validation repetirem o mesmo SHA.

## 4. Como os próximos bots devem dar menos erros

O problema não é somente a quantidade de erros; é a qualidade do diagnóstico. Os bots devem trabalhar com um protocolo de falha determinístico.

| Melhoria | Comportamento desejado |
| --- | --- |
| Um gate-raiz por execução | Rodar `npm run tipos:v2` uma vez e gerar um relatório agrupado por arquivo, código TS e contrato. |
| Deduplicação | `CI`, `V2 Core` e `V2 Validation` devem referenciar o mesmo artefato de diagnóstico quando o erro for o mesmo SHA e comando. |
| Validação antes da edição | Ler a implementação e seus consumidores antes de criar um `.d.ts`; não declarar uma assinatura imaginada. |
| Falha em etapas | Se o typecheck falhar, marcar integração/build como “não executado por dependência”, e não como uma nova causa. |
| Contexto no log | Exibir arquivo, linha, função, contrato esperado, contrato recebido e teste posterior. |
| Proteção contra regressão | Preservar `npm test`, build, smoke, Vigia, CodeQL, Arma 3 Data CI e Runtime como gates independentes. |
| Artifacts | Anexar `tipos-v2-errors.json`, resumo Markdown e versões de Node/npm/TypeScript ao run. |
| Reexecução controlada | Não fazer retry automático em rate limit da Vercel nem em falha externa do Supabase sem identificar o run e o motivo. |
| Segurança | Nunca colocar tokens, e-mails privados de colaboradores ou chaves em logs, URLs ou artefatos públicos. |

A ferramenta de relatório diário planejada em [`DAILY_PROGRESS_AUTOMATION.md`](DAILY_PROGRESS_AUTOMATION.md) deverá reutilizar essa matriz, em vez de enviar apenas “bot vermelho”.

## 5. Supabase Preview e Vercel

A falha do **Supabase Preview** aparece na imagem, mas não foi possível classificá-la como erro atual de SQL/RLS porque o conjunto recente de runs do `main` consultado não apresentou um run correspondente com log disponível. O procedimento correto é localizar o check pelo SHA da PR ou commit da imagem e coletar seu log. Até lá, ela permanece como **incidente não classificado**, não como defeito confirmado da camada Supabase.

A mensagem da **Vercel — Deployment rate limited — retry in 24 hours** é operacional. Ela informa limitação de taxa do provedor; não prova que o build ou o código falhou. O bot deve registrar essa condição como `external-rate-limit`, evitar alterações de código e reprogramar uma tentativa após a janela indicada.

## 6. O que não deve ser alterado sem nova evidência

Não devem ser alterados nesta correção de tipos: o Runtime Rust que está verde, o Vigia das rotas, CodeQL, Arma 3 Data CI, Core CI, os testes locais 884/884, build, smoke 98/98, integração 14/14 e caminho crítico 15/15. Também não se deve desligar `checkJs`, remover o workflow V2, transformar o typecheck em informativo ou aceitar `any` para produzir um falso verde.

## 7. Critério de conclusão da correção

A causa `ROOT-TYPES-001` só será considerada encerrada quando `npm run tipos:v2` retornar exit 0 no mesmo SHA, os testes específicos de cada família passarem, CI/V2 Core/V2 Validation forem verdes no GitHub e nenhum gate anteriormente verde tiver regredido. Depois disso, o relatório diário deverá atualizar a contagem de causas raiz e marcar os efeitos cascata como resolvidos.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958690 "CI no commit do Mapa Tático"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958637 "V2 Core no commit do Mapa Tático"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958667 "V2 Validation no commit do Mapa Tático"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958641 "Core CI no commit do Mapa Tático"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958604 "V2 Runtime no commit do Mapa Tático"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958642 "Vigia das rotas no commit do Mapa Tático"
[7]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958657 "CodeQL no commit do Mapa Tático"
[8]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31864958674 "Arma 3 Data CI no commit do Mapa Tático"
