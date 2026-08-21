# Billing Foundation — Auditoria pré-implementação

**Status:** AUDIT COMPLETE — contrato local ainda não ampliado
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA auditado:** `08e0455295c784a6c2fe0863f3a53e9e7e617f0c`
**Data/hora UTC:** `2026-08-21T04:16:25Z`
**Escopo:** descobrir o estado real antes de implementar a próxima extensão local de Billing; nenhum provider remoto, DDL, staging ou efeito financeiro foi executado.

## Resumo executivo

O projeto **já possui uma fundação local de Billing substancial**. Não é correto iniciar um segundo ledger ou um segundo sistema de entitlement. Os contratos canônicos estão em `v2/data/billing.ts`, `v2/data/billing-persistence.ts`, `v2/data/billing-driver.ts`, `v2/core/billing-permissions.ts` e nos adapters de staging/read-only existentes.

A maior parte do núcleo já está coberta: catálogo versionado de planos, assignments, resolução por workspace/account, ledger de uso append-only em memória, replay idempotente, mutex assíncrono, transação local de assignment + usage, boundaries de membership/account/workspace, códigos de erro bounded e preflight remoto de leitura sem ativação por inferência.

A lacuna escolhida para o próximo slice é **não criar mais storage**, mas adicionar um contrato explícito de **preflight de consumo local** e observabilidade bounded das decisões de mutação. O preflight deve consultar um plano já resolvido, calcular uso atual + quantidade solicitada, negar antes da mutação quando o limite finito for excedido ou quando faltar entitlement/limite, e manter a semântica `deny-by-default`. A observabilidade não armazenará account IDs, workspace IDs, tokens, payloads ou mensagens de provider.

## Evidências encontradas

| Área | Estado observado | Evidência | Decisão |
|---|---|---|---|
| Catálogo de planos | Implementado localmente | `v2/data/billing.ts`, `BillingCatalog` e `normalizePlan` | Reutilizar |
| Entitlements | Implementados como dados de plano | `Plan.entitlements`, `hasEntitlement` e `v2/core/billing-permissions.ts` | Não conceder autoridade nova |
| Ledger | Append-only em memória | `UsageLedger.append`, replay por `idempotencyKey` e `total` | Reutilizar |
| Idempotência | Implementada e testada | `BillingPersistenceAdapter.appendUsage` e testes concorrentes | Preservar |
| Transação local | Implementada | `assignPlanAndAppendUsage` sob `AsyncMutex` | Estender apenas no preflight |
| Isolamento | Implementado | membership, account/workspace e códigos `BillingPersistenceError` | Não relaxar |
| Observabilidade | Somente read-side | `v2/data/billing-observability.ts` cobre `getWorkspace`, `resolvePlan`, `listUsage` | Adicionar decisão de mutação bounded |
| Provider/staging | Guardado e opt-in | `billing-activation.ts` e `billing-staging-preflight.ts` | Não ativar nem alterar |
| Supabase | Projeto compartilhado com schema externo, incluindo `billing_entitlements` | `docs/HANDOFF-LOCAL.md` | Nenhuma migration/DDL remota |

## Causa raiz e não-problemas

Não há um erro de produção identificado nesta auditoria. O ponto de evolução é uma **lacuna contratual**, não um defeito em cascata: `decideUsage()` existe como função pura, mas a operação mutável `appendUsage()` ainda não exige formalmente que uma decisão de limite/entitlement seja feita antes do append. A implementação atual protege identidade, membership e idempotência, porém não transforma o preflight de consumo em uma fronteira explícita e testável do adapter.

O fato de existir `billing_entitlements` no Supabase compartilhado **não autoriza** importar schema, escrever DDL, conectar provider ou inferir que a identidade do usuário está liberada. Esse é um contexto externo e permanece fora do slice local.

## Comandos e inspeções executados

| Comando/inspeção | Resultado |
|---|---|
| `git rev-parse HEAD` | SHA auditado `08e0455295c784a6c2fe0863f3a53e9e7e617f0c` |
| Busca de arquivos `*billing*` | Não havia arquivo fora dos contratos V2 encontrados por padrão de nome; os arquivos estão em `v2/data/` |
| Busca textual `billing/entitlement/usage/quota` | Encontrados contratos V2, staging remoto guardado e referência documental ao schema compartilhado |
| Leitura de `package.json` | `npm test`, TypeScript strict, V2 TypeScript e gates oficiais disponíveis; nenhuma dependência de provider de cobrança |
| Leitura de `tsconfig.json` | Billing V2 já incluído em `v2/data/*` e `v2/core/billing-permissions.ts` |
| Leitura de `v2/data/billing.ts` | Catálogo, planos, assignments, decisão pura de usage e `UsageLedger` existentes |
| Leitura de `v2/data/billing-persistence.ts` | Adapter local com mutex, replay idempotente, boundaries e transação local existentes |
| Leitura de `test/v2/billing-persistence.test.js` | Cobertura concorrente e de isolamento existente |
| Leitura de `v2/data/billing-observability.ts` | Observabilidade atual é somente de leitura |
| `date -u` | `2026-08-21T04:16:25Z` |

## Limites obrigatórios do próximo slice

O próximo slice poderá alterar somente contratos locais e testes/documentação associados. Ele não deverá:

1. criar ou alterar migrations SQL;
2. criar staging ou alterar Supabase;
3. conectar Stripe, Mercado Pago, provider de pagamentos ou webhook;
4. emitir cobrança, compra, reembolso, transferência ou alteração de entitlement remoto;
5. transformar entitlement em autoridade de segurança no cliente;
6. remover o mutex, a idempotência, as boundaries ou os códigos de erro existentes;
7. registrar identificadores, tokens, payloads ou conteúdo sensível na observabilidade.

## Rollback

O rollback é a reversão do commit do slice local. O backup publicado antes desta rodada é `backup/2026-08-21-v2-doctor-expanded`; antes de alterar arquivos de Billing deve ser criada uma nova branch de backup apontando para o SHA corrente. Nenhuma operação externa será necessária para desfazer a mudança.

— **Manus AI**

## Resultado da implementação local

A extensão foi implementada sem criar um segundo ledger. `v2/data/billing-foundation.ts` agora contém o preflight puro e o contrato `billing-mutation/v1`; `BillingPersistenceAdapter` recebeu `appendUsageWithPreflight()` e um observador opcional de mutações; `billing-driver.ts` recebeu apenas os códigos públicos bounded necessários; e `tsconfig.json` inclui o novo módulo no gate strict.

O método legado `appendUsage()` não foi alterado semanticamente. A nova superfície protegida valida membership/account/workspace, trata replay antes de resolver o plano, rejeita drift de idempotência, calcula uso projetado dentro do mutex e somente chama o ledger quando o preflight permite. O replay não precisa revalidar o plano original e retorna `preflight: null`, preservando a semântica de idempotência.

| Validação | Resultado |
|---|---:|
| Testes focais do novo contrato | 9/9 |
| Suítes V2 de Billing | 67/67 |
| TypeScript strict | verde |
| TypeScript V2 | verde |
| Regressão completa `npm test` | 1166/1166 |

Nenhum provider de pagamento, webhook, Supabase, DDL, staging, Stripe, Mercado Pago ou cobrança real foi acessado. O comportamento remoto permanece guardado pelos preflights já existentes.

## Arquivos do slice

| Arquivo | Papel |
|---|---|
| `v2/data/billing-foundation.ts` | Preflight puro, reason codes e auditoria bounded `billing-mutation/v1` |
| `v2/data/billing-persistence.ts` | Nova superfície `appendUsageWithPreflight()` e observador opcional |
| `v2/data/billing-driver.ts` | Códigos públicos `ENTITLEMENT_REQUIRED`, `LIMIT_NOT_CONFIGURED`, `LIMIT_EXCEEDED` e `INVALID_LIMIT` |
| `test/v2/billing-foundation.test.js` | 9 testes de limite, entitlement, replay, concorrência e redaction |
| `tsconfig.json` | Inclusão strict do novo módulo |
| `docs/v2/BILLING_FOUNDATION_AUDIT_2026-08-21.md` | Diagnóstico e evidência deste marco |
| `docs/v2/BILLING_FOUNDATION_CONTRACT_2026-08-21.md` | Contrato antes da implementação |

## Limitações preservadas

A fundação ainda é **local/in-memory**. Ela não é uma autorização server-side real, não substitui RLS, não valida JWT, não escolhe provider, não reconcilia webhook e não persiste ledger em Supabase. Entitlements seguem sendo dados de plano e candidatos de permissão; nunca concedem autoridade diretamente. O próximo passo remoto continua bloqueado por staging, RLS, provider, observabilidade operacional e aprovação explícita.

## Publicação e CI remoto

**Commit publicado:** `93e21960acac904151ee41a0f109286d0919783e`

O commit foi integrado diretamente à `main` após `fetch` e `merge --no-edit`, sem force push. Os workflows remotos aplicáveis concluíram com sucesso para esse SHA: `Arma 3 Data CI`, `CI`, `CodeQL`, `Core CI`, `V2 Core`, `V2 Runtime`, `V2 Validation` e `Vigia das rotas`. O runner local também passou todos os gates executáveis; somente `rust_runtime` retornou código 101 pelo bloqueio já documentado do Cargo 1.75.0 com metadata `edition2024`. O `verify:v2` mantém esse caso como `blocked-known`, sem convertê-lo em verde.

A execução duplicada do workflow `Vigia das rotas` para o mesmo SHA também terminou com sucesso. Não há falha nova atribuível ao Billing Foundation.
