# PHASE 11 — Billing Staging Configuration

**Estado:** factory server-side implementada; staging remoto ainda não conectado

## Objetivo

Criar uma fronteira de configuração que impeça o Billing Read Driver de ser ativado por acidente em produção, no browser ou contra um endpoint local. A factory só constrói o driver quando o opt-in está explícito e o ambiente é `staging`.

## Variáveis aceitas

| Variável | Regra |
|---|---|
| `BILLING_READ_DRIVER_ENABLED` | precisa ser `1` ou `true` |
| `BILLING_READ_ENVIRONMENT` | único valor aceito: `staging` |
| `BILLING_READ_BASE_URL` | HTTPS remoto; localhost e IP local são rejeitados |
| `BILLING_READ_API_KEY` | obrigatória e server-side |
| `BILLING_READ_ACCESS_TOKEN` | obrigatória e server-side |
| `BILLING_READ_PRINCIPAL_USER_ID` | principal fixado para a sessão |
| `BILLING_READ_TIMEOUT_MS` | padrão 5000; intervalo de 100 a 30000 |

Quando o opt-in não está ativo, `loadBillingReadConfig` retorna `null`. Assim, a ausência de configuração mantém a integração desligada e não é tratada como erro de boot.

## Erros

`BillingConfigError` possui códigos `DISABLED`, `MISSING_ENV`, `INVALID_ENV`, `INVALID_URL` e `INVALID_TIMEOUT`. As mensagens não ecoam API key, access token, URL privada ou qualquer valor secreto.

## Factory

`createBillingReadDriverFromConfig` recebe configuração validada, transporte HTTP e observer opcional. A factory não lê o ambiente global, não acessa a rede e não cria connector. A chamada real continua dependendo de injeção explícita no backend.

## Checklist antes de staging real

A equipe deverá aprovar o projeto Supabase de staging, armazenar secrets somente no backend, confirmar URL HTTPS, executar migrações em ambiente descartável, validar RLS com duas contas, validar observabilidade sem dados sensíveis, comprovar ausência de writes e definir rollback. Nenhum valor deve ser colocado no `.env` versionado, frontend, manifest, Service Worker ou logs.

## Limites

A factory rejeita `production`, localhost, IP local e timeout fora do limite. Ela não autoriza billing financeiro, checkout, webhook, invoice ou write de usage. A habilitação de connector Supabase permanece uma decisão separada que exige autorização e revisão do projeto correto.
