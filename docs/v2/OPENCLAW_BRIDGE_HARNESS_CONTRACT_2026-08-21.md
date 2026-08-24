# OpenClaw — Contrato da bridge harness-only

**Versão:** `openclaw-bridge-harness/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** comunicação de chat com upstream fake/loopback em harness V2
**Autor:** Manus AI

## Objetivo

Permitir que o harness valide a fronteira de comunicação do JARVIS com um gateway OpenClaw local sem transformar a bridge em integração externa autorizada por padrão. O contrato é deliberadamente restrito: chat completions somente, sem tools, webhooks, WhatsApp, notícias, vendas, persistência ou autoridade operacional.

## Requisitos do factory

`createOpenClawHarnessBridge(options)` deve:

| Requisito | Política |
|---|---|
| upstream | `http`/`https` para `localhost`, `127.0.0.1` ou `::1`; qualquer hostname externo é rejeitado antes do servidor iniciar |
| token de chamada | obrigatório para `POST /v1/chat/completions`; ausência ou divergência retorna `401` com `bridge_token_required`/`bridge_token_invalid` |
| header do token | `x-baluarte-bridge-token`; nunca encaminhar ao upstream |
| origem | origem exata configurada ou `http://localhost:5173` por padrão; origem presente e diferente retorna `403` |
| health | `200`, `mode: harness-only`, `authority: not-authorized`, sem afirmar que o upstream está saudável |
| payload | array `messages` obrigatório; o upstream recebe somente `model`, `stream: false` e `messages` |
| corpo | limite já existente de 256 KiB |
| timeout | `AbortController` e limite existente |
| erros | códigos bounded; não expor URL, token, stack, body ou mensagem do upstream |
| lifecycle | factory retorna servidor fechável; nenhum listen automático ao importar |

O token pode vir explicitamente em `options.bridgeToken` ou de `BALUARTE_OPENCLAW_HARNESS_TOKEN` para o processo do harness. O valor não deve aparecer em logs, payload, resposta ou observação.

## Compatibilidade

`createOpenClawBridge()` permanece intacto para os consumidores existentes e mantém o teste V1 com upstream fake. A nova factory é opt-in e não substitui a factory genérica. O harness pode usar `fetchImpl` injetado para evitar rede durante o teste; a validação de loopback continua obrigatória mesmo nesse caminho.

## Semântica de segurança

O modo harness-only não é autenticação de usuário, não valida Supabase Auth, não interpreta `app_metadata`, não cria claims e não muda `runtimeAuthority`, que permanece `not-authorized`. O token local prova somente que o chamador conhece o segredo temporário do harness; ele não concede escopos, acesso a módulos ou promoção pública.

Não haverá cache de token, logs de token, rotação automática, retry para upstream externo, descoberta de gateway, conexão com Spotify, WhatsApp ou coleta de notícias. Se o upstream loopback estiver indisponível, a resposta será um erro bounded de gateway e nenhuma ação alternativa será executada.

## Testes obrigatórios

A suíte deve cobrir health harness-only, ausência de token, token inválido, token válido com upstream fake, origem exata, origem externa, upstream externo rejeitado, payload inválido, corpo excedido, timeout/erro de upstream, não encaminhamento do header de token e ausência de segredos nas respostas.

## Rollback

Remover a factory harness-only, seus testes e documentação devolve o bridge genérico ao estado anterior. Não requer alterações em secrets, deployment, Supabase, RLS, Auth ou workflows persistentes.

— **Manus AI**
