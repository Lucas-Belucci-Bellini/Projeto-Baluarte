# Module Registry Health/Fallback — Pilot

## Status

`PUBLISHED ON MAIN — AUDIT CONTRACT IN PROGRESS`

## Objetivo

Adicionar observabilidade operacional ao Module Registry sem criar um segundo Registry, Supervisor, Event Bus ou Permission Manager. O adaptador `v2/core/module-registry-health.js` combina o Registry canônico com `module-runtime-health.js` e traduz estados de falha em modos isoláveis.

## Contrato

| Estado Runtime | Modo operacional | Pode ativar/reiniciar |
|---|---|---:|
| Módulo não registrado | `unregistered` | Não |
| Registrado sem health conhecido | `registered` | Sim |
| `healthy` | `healthy` | Sim |
| `failed` | `degraded` | Sim enquanto a política de restart permitir |
| `exhausted` | `quarantined` | Não |

Um módulo em `degraded` ou `quarantined` não derruba Core, Router, Home ou outros módulos. O adaptador somente informa o modo e a decisão de ativação; ele não inicia módulos e não concede permissões.

## Testes

`test/v2/module-registry-health.test.js` cobre módulo desconhecido, módulo registrado, degradação após falha e quarentena após exceder o limite de reinícios. O teste confirma que um módulo saudável independente permanece registrado quando outro é isolado.

## Segurança

Este piloto não transforma health em autorização. O módulo continua sujeito ao Registry selado, ao Runtime e ao Permission Manager. Autorização administrativa, desligamento remoto de página e papel de proprietário/desenvolvedor continuam dependentes de backend/RLS e não podem ser derivados de metadata client-side.

O adaptador agora expõe `definirModo(id, mode, reason, context?)`, mas a operação é deny-by-default: `maintenance`, `disabled` e o retorno a `active` só são aceitos quando o callback `authorize` server-side aprova a solicitação. O motivo é obrigatório e deve ser mantido na auditoria do backend. O contrato auditado opcional também exige `requestId`, `actorId`, `actorRole`, `approvedBy` e sink de auditoria; repetição do mesmo `requestId` é idempotente, e conflito de conteúdo é recusado. Um callback ausente ou falso nunca concede acesso.

## Fallback

O fallback é deliberadamente conservador: `registered` pode ser ativado; `degraded` pode tentar reinício limitado; `quarantined` e `unregistered` não podem ser ativados. Não existe fallback silencioso para um módulo desconhecido, porque isso poderia abrir uma rota não registrada.

## Rollback e próximo passo

O rollback é o revert do adaptador, testes e documentação. O callback local continua sendo apenas um contrato de fronteira; a integração server-side/RLS real exige aprovação explícita, staging separado, quatro identidades de teste, auditoria persistente e cleanup idempotente. Nenhuma ação remota ou alteração de dados foi executada nesta onda. O detalhamento da Wave 1 está em `docs/v2/REGISTRY_MODE_AUTH_AUDIT_WAVE_1.md`.
