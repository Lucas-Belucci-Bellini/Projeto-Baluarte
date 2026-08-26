# V2 Doctor — check local de Module Mode Policy

**Status:** `IMPLEMENTED LOCALLY — READ-ONLY`
**Data:** 2026-08-26
**Escopo:** incluir a verificação da fixture `module-registry-mode-policy/v1` no catálogo seguro do `verify:v2`

## Objetivo

Este slice torna observável no Doctor o contrato fake server-side de quatro identidades adicionado na alpha.16. O Doctor passa a executar `node scripts/module-mode-policy-check.mjs` como check `safe`, sem iniciar harness, escrever build, consultar rede, acessar Supabase ou modificar qualquer modo de módulo.

O check não cria uma segunda política. Ele somente chama o verificador canônico da fixture, que continua sendo a origem da matriz local de papéis/modos e do teste de spoofing. O Doctor apenas classifica o comando como `green`, `failed` ou outro estado bounded conforme o resultado observado.

## Registro do catálogo

| Campo | Valor |
|---|---|
| `id` | `module_mode_policy` |
| `category` | `security-local` |
| `command` | `node scripts/module-mode-policy-check.mjs` |
| `policy` | `safe` |
| Efeito externo | nenhum |
| Rede/storage/schema | não utilizados |

O modo `inventory-only` lista esta entrada como `not-run`, seguindo a mesma regra dos demais checks. O modo normal executa o comando com timeout bounded por `runCheck()` e preserva o estado real; o Doctor não converte `failed`, `unknown` ou `blocked-known` em `green`.

## Evidência

A validação local desta alteração produziu:

| Gate | Resultado |
|---|---:|
| Sintaxe `scripts/v2-doctor.mjs` | passou |
| Testes focais do Doctor | `10/10` |
| `npm run check:module-mode-policy` | 4 identidades, 6 casos, 3 allow, 3 deny, spoof deny |
| Doctor `module_mode_policy` | `green`, exit code 0 do check |
| Doctor total | `16 green`, `2 blocked-known`, `1 unknown`, `5 not-run`, `0 failed` |
| Exit code global do Doctor | `2`, devido exclusivamente ao estado `unknown` de Cargo |
| `git diff --check` | passou |

Os dois `blocked-known` são os transportes Python opcionais sem o SDK `google-genai`; o `unknown` é a indisponibilidade observacional de Cargo no sandbox. Esses estados são ambientais e continuam explicitamente visíveis.

## Invariantes

O check deve permanecer apenas uma extensão do array `DOCTOR_CHECKS`, com `policy: safe`, comando explícito e `module_mode_policy` único. Ele não pode importar claims, ler `actorRole` do navegador, aceitar identidade dinâmica, executar rede ou alterar `DOCTOR_CHECKS` em runtime.

O resultado `green` do check comprova somente que a fixture local respondeu como esperado. Não comprova Auth, JWT, claims, service role, tenancy, ownership, RLS, staging, persistência, auditoria remota, distribuição ou autoridade de produção.

## Não-escopo

Este documento não promove a fixture para produção, não altera o contrato `verify:v2` para executar gates com efeitos, não muda o exit code do Doctor e não reclassifica bloqueios ambientais. Build, harness, smoke, caminho crítico, compilação Python e runtime Rust continuam `not-run`/`unknown` conforme a política read-only existente.

Não foram alterados V1, router, sidebar, boot, Storage, Evidence, Auth, RLS, Supabase, Billing, rede, banco, migrations, Service Worker ou workflows remotos.

## Rollback

Reverter a alteração em `scripts/v2-doctor.mjs` e `test/v2-doctor.test.js`, removendo este documento e seu checkpoint de matriz, retorna o Doctor ao catálogo anterior. O rollback não exige cleanup externo porque o check não grava dados, não cria schema e não toca serviços remotos.

— **Manus AI**
