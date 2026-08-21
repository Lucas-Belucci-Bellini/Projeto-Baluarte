# OpenClaw — Auditoria da bridge restrita ao harness

**Status:** AUDIT COMPLETE — nenhuma conexão OpenClaw real foi ativada
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `e09eef2676417366f41415c18bfd91c9bd9ea7e8`
**Data:** 2026-08-21
**Objetivo:** definir a menor evolução segura para testar a bridge localmente sem transformar o Projeto-Baluarte em um cliente externo autorizado por padrão.

## Capacidades existentes

`scripts/openclaw-bridge.mjs` já expõe `createOpenClawBridge()`, uma rota `GET /health` e `POST /v1/chat/completions`. O adapter limita o corpo a 256 KiB, usa timeout com `AbortController`, encaminha somente `model`, `stream: false` e `messages`, redige erros de upstream e aplica CORS por origem configurada ou loopback. As credenciais do gateway são lidas somente de variáveis de ambiente e não entram no payload.

A cobertura existente em `test/jarvis-first-slice.test.js` usa um upstream HTTP fake local, verifica encaminhamento de uma mensagem e bloqueia uma origem externa. O teste não ativa o gateway padrão `127.0.0.1:18789` nem WhatsApp, notícias ou qualquer serviço externo.

## Lacunas relevantes

| Lacuna | Risco | Limite deste slice |
|---|---|---|
| A bridge genérica não exige um segredo de chamada | Um processo local autorizado pela rede poderia chamar o endpoint se soubesse a porta | Adicionar modo harness-only com token obrigatório para chat |
| O modo genérico aceita gateway configurável sem provar loopback | Uma execução acidental poderia apontar para serviço externo | O factory harness-only deve rejeitar URL não-loopback |
| CORS genérico aceita qualquer porta localhost quando não há override | Origens locais não são identidade | O modo harness-only exige origem exata configurada/default do harness |
| O endpoint de health é somente um retrato | Não deve ser interpretado como autoridade ou conectividade real | Manter `mode: harness-only`, sem promoção ou claims |
| Não existe lifecycle de processo persistente no site | Ativar background/bridge no Vercel exigiria arquitetura e secrets próprios | Não criar servidor persistente, webhook ou integração de produção |

## Contrato de segurança do próximo slice

O novo `createOpenClawHarnessBridge()` será um factory local explícito. Ele aceitará somente upstream `http`/`https` em `localhost`, `127.0.0.1` ou `::1`; rejeitará qualquer hostname externo antes de criar servidor; exigirá token de bridge para `POST /v1/chat/completions`; usará uma origem exata do harness; e manterá o endpoint de health sem prometer autoridade operacional. O token nunca será logado, encaminhado ao upstream ou incluído em observabilidade.

O factory genérico existente permanecerá compatível para não quebrar consumidores V1; a nova política não será aplicada implicitamente a produção. O teste do slice usará somente servidor fake local e `fetchImpl` injetado. O modo harness-only não será conectado ao router, ao OpenClaw real, ao Spotify, ao WhatsApp ou a notícias.

## Não fazer neste slice

Não criar cron, worker, webhook, serviço 24/7, deployment, secret remoto, OAuth, connector, Supabase, RLS, configuração de WhatsApp ou busca de notícias. Não aceitar payloads de tool calls, ações de venda, links externos ou comandos operacionais; a bridge continuará limitada a chat completions.

## Rollback

Rollback remove o factory harness-only e seus testes/contratos, deixando `createOpenClawBridge()` no estado anterior. Nenhuma mudança externa, migration ou limpeza de credenciais é necessária.

— **Manus AI**

## Implementação e validação

Foi adicionado `createOpenClawHarnessBridge()` em `scripts/openclaw-bridge.mjs`, sem alterar o comportamento da factory genérica. O factory exige token local, compara o header `x-baluarte-bridge-token` em tempo constante, valida upstream loopback sem credenciais embutidas, fixa origem exata e expõe health como `mode: harness-only` e `authority: not-authorized`. O token não é encaminhado ao upstream, não aparece em logs/respostas e não cria scopes.

Os testes focais passaram em **38/38** junto com `npm run tipos:ts`. A cobertura inclui ausência e divergência de token, upstream externo e URL com credenciais rejeitados, health, preflight CORS, origem externa, payload inválido, encaminhamento mínimo para upstream fake e redaction de erro/token. A bridge genérica também continua coberta pelo teste V1 existente.

Não houve conexão com `127.0.0.1:18789`, a menos que um teste injete explicitamente um fake loopback. Não foram ativados OpenClaw real, WhatsApp, notícias, vendas, webhooks, cron, workers, Supabase ou RLS.

## Rollback

O rollback é local e reversível: remover `createOpenClawHarnessBridge()`, seus testes e estes documentos deixa `createOpenClawBridge()` e o contrato V1 no estado anterior. Nenhuma secret, deployment, migration ou configuração externa precisa ser removida.

— **Manus AI**
