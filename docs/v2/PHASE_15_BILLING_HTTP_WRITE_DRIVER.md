# PHASE 15 — Billing HTTP Write Driver

**Estado:** contrato e driver de `usage_events` implementados; Supabase staging real continua desativado

## Escopo

Esta fase adiciona o primeiro adapter HTTP server-side de escrita do Billing Foundation. O escopo é deliberadamente limitado a `appendUsage`; assignments, checkout, assinatura, invoice, webhook, refund e qualquer provider financeiro permanecem fora desta alteração.

## Limites de segurança

O driver falha quando executado no browser, aceita somente HTTPS — com `localhost` permitido para testes — e mantém `apiKey` e `accessToken` nos headers, nunca na URL, no payload ou nas mensagens públicas. O `actorUserId` precisa corresponder ao principal fixado na instância. A aplicação usa `Content-Profile: billing` e envia somente os campos autorizados da tabela `usage_events`.

## Idempotência e retry

A request leva `idempotency_key` ao PostgREST. Falhas transitórias `408`, `429`, `5xx` e timeout podem ser tentadas novamente uma única vez por padrão, porque a operação é protegida pela chave de idempotência. Conflito `409` nunca é repetido e vira `BillingPersistenceError` com código `IDEMPOTENCY_CONFLICT`.

O driver não usa `resolution=ignore-duplicates`: uma colisão deve ser observável e tratada explicitamente, não mascarada por um retorno vazio. O payload de upstream é validado e respostas ausentes ou malformadas viram `INVALID_RESPONSE`.

## Observabilidade

O observer opcional registra apenas operação, sucesso/erro, duração, número de tentativas e código tipado. Não recebe body, token, URL completa ou detalhe SQL.

## Testes

A cobertura local prova payload restrito, actor inválido sem rede, headers de schema, ausência de secrets na URL, conflito 409, retry transitório, limite de tentativas, timeout e resposta inválida. Os testes também permanecem compatíveis com o adapter in-memory e sua proteção de conflito de idempotência.

## O que ainda não foi feito

O driver ainda não deve ser construído pelo boot da aplicação. Não existe wiring de produção, migration remota aplicada, teste real de RLS, transação assignment + usage, secret manager ou connector Supabase habilitado. Esses passos exigem projeto staging confirmado, credenciais fornecidas por configuração segura, revisão humana de RLS e plano de rollback.
