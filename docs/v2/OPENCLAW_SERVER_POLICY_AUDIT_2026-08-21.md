# OpenClaw — Auditoria da política server-side

**Status:** AUDIT COMPLETE — política local somente; nenhuma rede ou upstream foi ativado
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `2227db231178cf54d22bcfdc3ae799e228339abc`
**Data:** 2026-08-21
**Objetivo:** preparar uma decisão deny-by-default para futuras requisições server-side do OpenClaw sem transformar observação em autorização.

## Contratos existentes

`src/layout/server-claims-observation.ts` aceita somente scopes conhecidos `platform:observe`, `registry:read` e `module:read`. Claims só aceitam escopos quando a origem é `server-validated`, a identidade está autenticada, issuer/audience/subject estão presentes e o TTL é fresco e limitado a 60 segundos. Mesmo nesse caso, a saída fixa `decision: 'not-authorized'` e `authority: 'not-authorized'`.

`src/layout/server-observation.ts`, `runtime-observation.ts`, `module-observation-visual.ts`, `controlled-rollout-evidence.ts` e `platform-observation-transport.ts` preservam a mesma fronteira: observação read-only, fallback projetado e nenhuma autoridade client-side. A bridge harness-only de `scripts/openclaw-bridge.mjs` usa token local apenas para o processo de teste; esse token não é claim, não atribui scope e não substitui Auth/RLS.

## Lacuna real

Não existe hoje um scope `openclaw:chat` no catálogo. Essa ausência é deliberada e deve manter qualquer preflight de OpenClaw negado. Um contrato futuro só poderá admitir requisição quando houver scope explícito de servidor, claims frescas, origem server-validated, identidade autenticada, `runtimeAuthority` autorizada por política formal e payload bounded. O estado atual não satisfaz esses requisitos.

| Evidência atual | Permite conexão OpenClaw? | Decisão |
|---|---:|---|
| `platform:observe` | Não | observação de plataforma apenas |
| `registry:read` | Não | leitura do registry apenas |
| `module:read` | Não | revisão read-only de módulo |
| `decision: not-authorized` | Não | bloqueia ação operacional |
| token harness-only | Não | autentica somente o chamador do harness local |
| upstream loopback fake | Não | teste determinístico sem serviço externo |

## Bloqueios que não devem ser mascarados

A integração real depende de identidade/login-cadastro, catálogo de scopes server-side, revisão de threat model, secrets de gateway, rate limit distribuído, auditoria de consumidor, política de retenção, origem verificável e autorização operacional. RLS remoto permanece bloqueado até aprovação explícita de staging; nenhum DDL deve ser aplicado durante este slice. WhatsApp, notícias e processos de venda exigem contratos separados de proveniência, consentimento, limites e confirmação humana.

## Limite do próximo slice

A próxima implementação será uma função pura TypeScript de preflight. Ela apenas classificará uma requisição como `denied` ou `not-ready`, com reason codes bounded e resumo numérico redigido. Não fará fetch, não lerá secrets, não abrirá socket, não alterará claims e não será conectada ao router ou ao bridge harness-only.

## Rollback

O rollback remove o contrato local e seus testes, sem tocar em Auth, RLS, bridge, OpenClaw, secrets ou serviços externos.

— **Manus AI**

## Implementação e validação

Foi adicionado `src/security/openclaw-server-policy.ts` com `preflightOpenClawServerRequest()`. A função é síncrona, pura e não importa rede, provider ou SDK. Ela normaliza operação, limita `messageCount` a 32 e `payloadBytes` a 256 KiB, rejeita tool calls e operações não-chat, exige claims observadas e frescas, procura o scope inexistente `openclaw:chat` e fixa `authority: 'not-authorized'` e `publicPromotionAllowed: false`.

O resultado possível é somente `denied` ou `not-ready`; nunca `authorized`. No estado atual, claims válidas com scopes existentes resultam em `not-ready` por `scope-missing`, `authority-not-authorized` e `policy-not-configured`, enquanto claims ausentes/expiradas ou entradas inválidas resultam em `denied`. A saída contém apenas reason codes bounded, contagens, bytes e booleano de tool calls; não inclui subject, issuer, audience, prompt, URL, token ou segredo.

Os testes focais passaram em **44/44**, incluindo a bridge harness-only, e `npm run tipos:ts` passou. O contrato deliberadamente não conecta o módulo ao bridge, ao router, ao Supabase, ao Auth, ao OpenClaw real ou a qualquer serviço externo.

## Readiness atual

A política está pronta como barreira local de preflight, mas **não está pronta para liberar integração**. Os bloqueios permanecem: inexistência de `openclaw:chat` no catálogo; `runtimeAuthority` não autorizado; Auth/login-cadastro não finalizado; RLS remoto sem staging aprovado; rate limit distribuído não contratado; secrets e auditoria de produção não definidos; e ausência de threat model específico para WhatsApp, notícias e ações de venda.

## Rollback

O rollback remove o módulo, seus testes e estes documentos. Não requer alteração de bridge harness, secrets, deployment, Auth, RLS, Supabase ou serviços externos.

— **Manus AI**
