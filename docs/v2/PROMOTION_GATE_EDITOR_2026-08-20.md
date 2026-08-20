# Gate de Promoção Controlada — Editor

**Status:** `BLOCKED FOR PUBLIC PROMOTION — READ-ONLY PROOF`

**Data:** 20 de agosto de 2026

**Base:** `7902d2fe7d127ac4c29dd11035464bc6093329f7`

## Objetivo

O editor é candidato no piloto de alinhamento, mas não pode ser promovido à sidebar pública apenas porque o Registry, o health local e o deep link estão verdes. O novo contrato `src/layout/promotion-gate.ts` torna explícita a última barreira: claims server-side válidas, autorização auditável e rollback reversível.

## Contrato

`evaluatePromotionGate()` recebe a decisão de alinhamento, a evidência de autoridade e a evidência de rollback. O retorno contém `status`, `reasons`, `eligibleForControlledRollout` e `publicPromotionAllowed: false`.

A última propriedade é intencionalmente literal: mesmo que todos os requisitos de uma futura operação sejam reunidos, este contrato não autoriza promoção pública. Ele apenas pode liberar uma etapa controlada posterior, conduzida por uma autoridade operacional.

| Requisito | Necessário |
|---|---:|
| `alignment.allowPublicPromotion` | Sim |
| Fonte `server-claims` | Sim |
| Claim permitida | Sim |
| Papel `admin`, `developer` ou `owner` | Sim |
| `requestId` | Sim |
| `auditId` | Sim |
| Rollback reversível | Sim |
| Fallback explícito | Sim |
| Referência de rollback | Sim |
| Promoção pública automática | Nunca neste gate |

## Resultado no harness

O harness V2 expõe `window.__v2.promotionGatePilot()`. Ele usa o candidato `/editor`, health `runtime-registry`, deep link verificado e rollback `commit:24685606`, mas fornece autoridade `unknown`. O resultado é:

| Campo | Resultado |
|---|---|
| `status` | `blocked` |
| `eligibleForControlledRollout` | `false` |
| `publicPromotionAllowed` | `false` |
| Motivo principal | claims server-side válidas não foram confirmadas |
| Efeito no usuário normal | nenhuma mudança; fallback V1 preservado |

Esse é um bloqueio deliberado e saudável. Não é permitido simular claims no cliente, usar `localStorage`, query string, metadata editável ou um papel digitado na UI para superar o gate.

## Testes

A suíte UI passou com `14/14` testes. O gate browser V2 passou com `24/24`, incluindo:

1. o editor é o único candidato de alinhamento;
2. o gate bloqueia o candidato quando a fonte de autoridade é desconhecida;
3. um rollback ausente bloqueia mesmo com claims server-side simuladas em teste unitário;
4. nenhum usuário normal recebe promoção automática;
5. o Boot V2 continua dirigindo o router real V1.

As claims server-side do teste unitário são fixtures de contrato, não uma integração de produção com Supabase Auth/RLS. A ausência dessa integração continua documentada como bloqueio de promoção.

## Segurança e rollback

O gate não muda modo de Registry, não chama `definirModo()`, não aplica Auth, não escreve SQL e não modifica a sidebar. O rollback do piloto continua sendo o revert do commit que alterou a seção `nav` do manifesto do editor e os contratos de teste. O fallback público continua no shell V1.

Antes de qualquer avanço, será necessário fechar o contrato de claims, a origem dos `requestId`/`auditId`, a retenção de auditoria, o tratamento de deep links e a autorização para mudança de disponibilidade. Nenhuma operação externa é executada por este marco.

## Próximo passo

O próximo marco é desenhar a superfície operacional server-side de observabilidade do editor, sem promover visualmente a rota. Essa superfície deverá permitir ler o health, incidentes e decisões de modo com autoridade verificável e rollback documentado.

## Referências

[1]: ./SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md "Piloto individual do editor"
[2]: ./MODULE_ALIGNMENT_PILOT_2026-08-20.md "Piloto por módulo"
[3]: ../../src/layout/promotion-gate.ts "Contrato do gate de promoção"
[4]: ../../scripts/v2-integracao.mjs "Gate browser V2"
[5]: ../../v2/core/module-registry-health.js "Health e modo operacional do Registry"
