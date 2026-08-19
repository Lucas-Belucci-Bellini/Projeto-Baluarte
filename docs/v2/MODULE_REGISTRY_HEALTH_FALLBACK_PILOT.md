# Module Registry Health/Fallback — Pilot

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

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

O adaptador agora expõe `definirModo(id, mode, reason)`, mas a operação é deny-by-default: `maintenance`, `disabled` e o retorno a `active` só são aceitos quando o callback `authorize` server-side aprova a solicitação. O motivo é obrigatório e deve ser mantido na auditoria do backend. Um callback ausente ou falso nunca concede acesso.

## Fallback

O fallback é deliberadamente conservador: `registered` pode ser ativado; `degraded` pode tentar reinício limitado; `quarantined` e `unregistered` não podem ser ativados. Não existe fallback silencioso para um módulo desconhecido, porque isso poderia abrir uma rota não registrada.

## Rollback e próximo passo

O rollback é o revert do adaptador, testes e documentação. O próximo passo do piloto é conectar `resumo()` à superfície de diagnóstico do Runtime e substituir o callback local por uma integração server-side/RLS aprovada, com auditoria e idempotência. Nenhuma ação remota ou alteração de dados foi executada nesta onda.
