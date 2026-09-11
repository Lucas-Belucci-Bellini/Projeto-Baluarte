# Module Registry Health — wiring da política local

**Marco:** `module-registry-health-policy-wiring/v1`

**Estado:** `IMPLEMENTED LOCALLY — FULL GATES AND PUBLICATION PENDING`

**Base local:** `origin/main` em `8647310461429ea1b58855a26188d426afba3754`

**Branch:** `v2/module-registry-health-policy-wiring`

**Autor:** Manus AI

## Objetivo

O check local `module-registry-health` já exercia a fronteira auditada do Module Registry Health, mas fabricava dentro do próprio script um callback com `actorId`, `actorRole` e `approvedBy`. Esta slice substitui somente essa duplicação por uma composição com a fixture canônica `criarModuleModePolicy()`.

O check agora fecha `authorizeAs('fixture-admin')` sobre a política local e continua entregando a decisão ao `criarModuleRegistryHealth(...)`. A mudança não cria uma nova autoridade, não altera o Registry, não muda os modos permitidos do adaptador e não conecta qualquer serviço externo.

## Contrato preservado

A execução continua bounded, determinística, read-only e sem rede. Os seis casos existentes permanecem: módulo desconhecido, módulo registrado, health positiva, falha isolada, quarentena após falhas excedentes, override autorizado e override negado, contabilizados na saída como seis decisões (`3 allow`, `3 deny`).

A autorização do caso de manutenção agora é produzida pela mesma fixture usada nos testes da política:

| Campo | Valor observado |
|---|---|
| Identidade selecionada pelo harness | `fixture-admin` |
| Papel produzido pela fixture | `admin` |
| Aprovador produzido pela fixture | `fixture-owner` |
| Pedido | `beta`, `maintenance`, motivo não vazio e `health-check-1` |
| Auditoria | uma entrada `registry.mode.changed` |
| Rede | `not-used` |

O callback continua sendo uma decisão sintética server-side de teste. `actorRole` presente no request não é usado como autoridade, e a fixture não lê token, claim, storage, banco ou configuração de produção.

## Alteração técnica

O único consumidor alterado é `scripts/module-registry-health-check.mjs`:

1. importa `criarModuleModePolicy`;
2. instancia uma política local determinística;
3. usa `modePolicy.authorizeAs('fixture-admin')` no `criarModuleRegistryHealth`;
4. verifica no próprio check que o ledger contém `actorId: fixture-admin`, `actorRole: admin` e `approvedBy: fixture-owner`.

A saída JSON do comando permanece compatível com o contrato `MODULE_REGISTRY_HEALTH_CHECK_CONTRACT_2026-08-27.md`.

## Evidência local desta implementação

| Verificação | Resultado |
|---|---:|
| `node scripts/module-registry-health-check.mjs` | passou; `6` casos, `3 allow`, `3 deny`, `1` auditoria, `3` incidentes |
| Testes `module-registry-health` + `module-registry-mode-policy` | `19/19` pass, `0` fail |
| `npm run tipos:v2` | passou |
| `git diff --check` | passou nesta etapa |
| Rede, Supabase, Auth, RLS, DDL e service role | não utilizados |

Os gates completos, GitNexus staged scan, commit, CI remoto, pós-merge e atualização da memória canônica ainda são pendentes. O ambiente local usa Node `22.13.0`, enquanto o projeto declara Node `24.x`; o aviso `EBADENGINE` não foi ocultado e não altera a classificação da evidência.

## Fronteiras de segurança

Este documento não transforma a fixture em autorização de produção. As quatro identidades (`user`, `admin`, `dev`, `owner`) são dados determinísticos de teste. A fixture não valida claims, não consulta Supabase Auth, não executa RLS, não persiste auditoria e não concede permissões a módulos reais.

A auditoria em memória continua limitada ao diagnóstico local. A trilha persistente, retenção operacional, ownership, RLS, RBAC server-side e aprovação de staging permanecem fora desta slice.

## Relação com a PR #526

Esta branch parte diretamente do `origin/main` em `86473104` e não inclui o commit da PR #526 (`b9d55ab8`). A slice é independente e não deve ser mesclada por cherry-pick ou combinação de branches. A PR #526 continua aberta em draft e bloqueada pelo status externo `build-rate-limit` do Vercel.

## Rollback

O rollback é um revert normal do commit desta slice, removendo o import/uso da fixture e as asserções adicionais do script, além deste documento. Os contratos canônicos `module-registry-health`, a política fake e o callback booleano legado permanecem preservados.

## Critério de publicação

A slice só poderá ser integrada depois de passar os gates locais completos, revisão do diff staged, detecção GitNexus, PR draft com checks aplicáveis verdes, backup remoto do `main` real antes do merge, squash merge normal e workflows pós-merge verdes. Somente então a memória canônica poderá registrar o novo marco; nenhuma `v2.0.0-alpha.22` é criada por este documento.

— **Manus AI**
