# PHASE 08 — Billing HTTP Read Driver

**Estado:** implementado e validado com transporte fake; nenhum Supabase remoto acessado

## Objetivo

Criar a primeira implementação HTTP atrás de `BillingReadDriver` sem habilitar connector, sem colocar token no frontend e sem transformar a V1 em dependente de Supabase. O driver está preparado para PostgREST em staging, mas nesta fase só usa um transporte injetado em testes.

## Contrato

`v2/data/billing-http-read-driver.ts` implementa `BillingReadDriver` com as operações `getWorkspace`, `resolvePlan` e `listUsage`. O contrato preserva `planVersion`, resolve assignments dentro da janela temporal solicitada e consulta a versão exata do plano.

| Proteção | Comportamento |
|---|---|
| Origem remota | exige HTTPS; localhost é permitido somente para fake/local |
| Execução | rejeita uso no browser; o driver é server-side |
| Credenciais | `apikey` e Bearer ficam nos headers do transporte, nunca na URL |
| Principal | `actorUserId` precisa coincidir com o principal fixado no driver |
| Timeout | AbortController entre 100 ms e 30 s; padrão de 5 s |
| Resposta | payload precisa ser array e cada campo é validado antes de sair |
| Status upstream | 401/403, 404, timeout, 429 e 5xx são convertidos para erros tipados |

## Erros

Falhas de upstream não expõem mensagem SQL, response body, token ou URL completa ao consumidor. Os códigos usados são `MEMBERSHIP_REQUIRED`, `WORKSPACE_NOT_FOUND`, `UPSTREAM_TIMEOUT`, `UPSTREAM_UNAVAILABLE` e `INVALID_RESPONSE`. Erros de timeout, 429 e 5xx são marcados como retryable; autorização, payload inválido e workspace inexistente não são.

## Testes

`test/v2/billing-http-read-driver.test.js` usa transporte fake e cobre workspace autorizado, usage, resolução temporal e versionada de plano, headers server-side, 401, payload inválido, timeout, principal incompatível e URL HTTP rejeitada. Nenhum teste realiza chamada de rede.

## Limites

O driver não escreve, não cria workspace, não atribui plano e não registra usage. Ele também não comprova RLS real, pois os connectors Supabase permanecem desabilitados. A próxima etapa de integração deverá usar um staging explicitamente aprovado, testes com usuários reais de teste, políticas RLS e rollback documentado.
