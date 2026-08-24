# Registry Mode Authorization & Audit — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

A onda foi construída sobre o SHA publicado `75d362707589022f1cb77cba13200d3ccf77a2fb`.

## Objetivo

Fortalecer a fronteira que controla os modos operacionais `maintenance`, `disabled` e `active` do Module Registry antes de conectá-la a Supabase/RLS. Esta etapa cria um contrato local verificável para uma decisão server-side rica e para auditoria, mas não simula claims client-side como autorização e não abre conexão externa sem aprovação explícita do operador.

## Contrato

`criarModuleRegistryHealth(registry, runtimeHealth, options)` continua aceitando consumidores legados que retornam `true` ou `false` no callback `authorize`. Para a futura integração protegida, o callback pode retornar uma decisão com `allowed`, `requestId`, `actorId`, `actorRole` e `approvedBy`.

Quando `requireAudit: true` é usado, a operação exige simultaneamente:

| Campo | Regra |
|---|---|
| `requestId` | Obrigatório na solicitação e na decisão; idempotência exige que uma repetição do mesmo pedido não gere segundo efeito ou segundo registro. |
| `actorId` | Identidade do operador que solicitou a mudança. |
| `actorRole` | Papel autorizado, como `admin`, `dev` ou `owner`, decidido pela camada protegida. |
| `approvedBy` | Identidade do aprovador exigido pela política. |
| `reason` | Motivo não vazio para a mudança de modo. |
| `audit` | Sink obrigatório quando a auditoria server-side é exigida. |

Uma decisão booleana positiva sem metadados não satisfaz o contrato auditado. Ausência de callback ou decisão falsa permanece deny-by-default. O Registry continua recusando módulos desconhecidos, modos inválidos e motivos vazios.

## Auditoria e idempotência

Cada mudança aprovada gera um evento `registry.mode.changed` com módulo, modo, motivo, timestamp e metadados de identidade. O adaptador mantém apenas um ledger local limitado para testes e diagnóstico; o sink externo, quando existir, será a fonte persistente server-side. `maxAuditEntries` limita a memória local. Repetir o mesmo `requestId` com os mesmos dados devolve o modo atual sem duplicar auditoria; reutilizar o mesmo `requestId` para outra solicitação é recusado.

O método `auditoria()` devolve cópias defensivas. A auditoria completa não é adicionada ao diagnóstico público da Platform nesta onda, evitando expor identidade de operador, papel ou aprovador a superfícies de navegador. A Platform continua expondo somente o diagnóstico operacional necessário.

## Segurança

Este contrato não transforma o frontend em autoridade. `actorRole`, `approvedBy` e `allowed` devem vir de um backend protegido/RLS quando a integração real for feita. Nenhum service role, token, claim ou segredo foi adicionado ao frontend. A auditoria local não é apresentada como trilha de produção.

A mudança de modo só ocorre depois da decisão autorizadora e da auditoria obrigatória. Se o sink de auditoria falhar, a operação falha fechada antes de alterar o override. O histórico local é bounded e não substitui retenção, append-only, políticas de acesso, limpeza idempotente ou trilha de auditoria do banco.

## Testes

`test/v2/module-registry-health.test.js` cobre autorização legada, deny-by-default, requisito de sink, identidade/papel/aprovador/requestId, decisão positiva incompleta, idempotência, conflito de requestId e retenção limitada do ledger. A checagem direcionada passou em `16/16`, `npm run tipos:v2` passou e `git diff --check` passou.

A bateria completa de V1/V2, integração de navegador, smoke, caminho crítico, build, contratos de segurança e workflow Rust será executada antes da publicação. O gate Rust local pode continuar limitado pelo Cargo `1.75.0`; o workflow remoto usa toolchain stable.

## Supabase/RLS — não executado nesta onda

Nenhum projeto Supabase staging foi acessado, nenhum fixture foi criado e nenhuma mudança de banco foi aplicada. A execução real exige aprovação explícita do operador, projeto separado de produção, quatro identidades de teste, políticas RLS verificáveis, fixtures isolados e cleanup idempotente. O próximo documento deverá registrar a matriz de identidade, os SQLs, a evidência de cada decisão e o rollback antes de qualquer conexão.

## Riscos

O principal risco é um consumidor tratar o ledger em memória como auditoria definitiva. Por isso, a API é documentada como contrato local e a Platform não expõe a auditoria detalhada. Outro risco é uma implementação futura aceitar `actorRole` vindo do navegador; o contrato deve ser integrado apenas a uma decisão server-side/RLS verificável.

## Rollback

Reverter `v2/core/module-registry-health.js`, `test/v2/module-registry-health.test.js` e este documento remove o contrato auditado e preserva o callback booleano legado. Nenhuma configuração externa ou schema foi alterado.

## Próximo passo

Com aprovação explícita, executar a validação da matriz RLS em staging separado. Sem essa aprovação, a próxima implementação segura é um fake server-side local que reproduza quatro identidades e as decisões `allow/deny`, sem chamadas de rede e sem claims confiadas no frontend.
