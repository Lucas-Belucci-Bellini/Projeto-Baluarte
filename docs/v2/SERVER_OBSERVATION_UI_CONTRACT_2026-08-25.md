# Contrato — Server Observation na UI da V2

**Data:** 2026-08-25
**Fase:** 08 — Auth / Authorization / Tenancy, slice read-only
**Implementação:** `src/security/server-observation-ui.ts` e `src/pages/jarvis.ts`
**Verificação:** `test/security/server-observation-ui.test.js`

## Objetivo

Conectar o botão de teste do modo Servidor à superfície `server-observation/v1` já existente, para que a UI veja uma observação server-validated sem interpretar essa observação como autorização ou disponibilidade operacional garantida.

## Resolução de endpoint

A resolução aceita somente dois formatos controlados. Em site HTTPS com `serverUrl` vazio, usa o adapter same-origin `/api/observability`. Em desenvolvimento HTTP com `serverUrl` vazio, usa `http://127.0.0.1:8000/observability/observe`. Quando o operador configura uma base explícita, a URL deve ser absoluta, usar `http:` ou `https:` e não possuir credenciais, query string ou fragmento. Bases com `/api` apontam para `/api/observability`; as demais apontam para `/observability/observe`.

Nenhuma URL é montada a partir de token ou metadata. O cliente HTTP continua sendo `GET`, sem body, com timeout bounded e headers opcionais já previstos no contrato server-observation-http.

## Projeção visual

O resultado do transporte é convertido em `RuntimeObservation`:

| Resultado | UI | Autoridade |
|---|---|---|
| Envelope observado, health saudável e fallback disponível | `healthy` / `none` / `available` | sempre `not-authorized` |
| Envelope observado, claims stale ou health degradado | `degraded` / `warning` | sempre `not-authorized` |
| Erro HTTP, timeout ou rede após tentativa | `failed` / `critical` / `blocked` | sempre `not-authorized` |
| Endpoint ausente ou inválido, sem tentativa | `unknown` / `info` / `unknown` | sempre `not-authorized` |

A mensagem exibida no botão usa apenas estado bounded e `reasonCode`. Não exibe URL, corpo de resposta, token, subject, role, metadata ou mensagem arbitrária de exceção.

## Não-escopo

Este slice não cria sessão, não faz refresh ou logout, não grava cache, não habilita módulo, não deriva role, não altera `runtimeAuthority`, não altera Auth/RLS, não adiciona retry automático e não substitui os modos de conversa do JARVIS. O botão continua sendo uma ação manual de observação; a UI não decide promoção, fallback operacional ou autorização.

## Rollback

Remover `server-observation-ui.ts`, seu teste e o import/uso no botão `Testar conexão` devolve o health check legado sem alterar os endpoints backend, a projeção server-validated ou o caminho V1. O rollback não requer migration, alteração de segredo ou mudança de configuração remota.

## Próximo passo

Exercitar esta projeção no harness visual e na rota `/jarvis` com um fake server-observation controlado, mantendo a prova sem rede real. Só depois avaliar refresh/redirect real de Auth ou qualquer ponte server-side autenticada, em contrato separado.
