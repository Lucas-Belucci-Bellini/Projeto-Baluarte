# Relatório de conclusão — Release 1.3.1

**Status:** PUBLICADA E VERIFICADA  
**Projeto:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch:** `main`  
**Data da verificação:** 2026-08-22  
**Autor:** Manus AI

## Resumo executivo

O slice V2 de **preview local de retenção Evidence** foi implementado e publicado diretamente na `main`. A release `1.3.1` mantém a V1, os wrappers JavaScript e o router existentes, acrescentando somente uma projeção local, determinística, bounded e read-only para apoiar a futura política de retenção e auditoria.

A implementação não apaga registros, não altera status, não concede permissões, não acessa rede e não ativa Supabase, SQL, RLS, Auth operacional, OpenClaw, WhatsApp, Spotify ou qualquer ação externa. A release pública foi confirmada como não-draft e não-prerelease, com oito assets desktop verificáveis e manifests declarando `version: 1.3.1`.

## Commits e tags

| Marco | SHA / referência | Estado |
|---|---|---|
| Commit funcional | `752206fbfd4641223ee741d2e5a03099c5716338` | Publicado na `main` |
| Commit de versionamento | `9b7343940c82c3ba487a0129b0171e38794c6567` | Publicado na `main` |
| Tag web | `v1.3.1` | Aponta para `9b734394` |
| Tag desktop | `desktop-v1.3.1` | Aponta para `9b734394` |
| Desktop Release | `32592402608` | Verde nos três sistemas |
| Release pública | [v1.3.1 no GitHub](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.1) | Não-draft, não-prerelease |

## O que foi implementado

O contrato canônico TypeScript em `v2/data/evidence.ts` agora fornece `projectEvidenceRetention(records, options)`. O módulo `v2/modules/evidence/module.js` expõe `retentionPreview(options)` pelo mesmo Registry já existente, com fallback vazio seguro quando o store não está inicializado ou já foi descartado. O wrapper `v2/data/evidence.js` foi preservado.

A projeção exige uma data `now` ISO válida, usa `maxAgeDays` padrão 30 com teto 3650 e `limit` padrão 25 com teto 100. Ela preserva a ordem append-only, classifica cada registro como `within-window`, `past-window` ou `future-observed`, congela itens, resumo e saída e retorna somente `id`, `moduleId`, `status`, `observedAt`, `ageDays` e `retention`. Conteúdo de claim, `statement`, fonte, URI, publisher, collector, tokens, claims e permissões não são projetados.

## Validação local

| Comando / gate | Resultado |
|---|---:|
| `node scripts/gen-catalogo-eventos.mjs --verificar` | Verde |
| `npm run verificar-nexus` | Verde |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | `1256/1256` |
| `npm run build` | Verde; warning conhecido de chunks acima de 500 kB |
| `npm run v2:integracao` | `50/50` |
| `npm run smoke` | `99/99` rotas V1 |
| `npm run caminho-critico` | `15/15` |
| Testes focais Evidence | `9/9` |
| Runner oficial — gates de código | `20` com código 0 |
| Runner oficial — Rust local | Código 101, `blocked-known` |

O warning de chunks grandes não foi mascarado nem tratado como falha. O Rust local continua separado porque o Cargo disponível não interpreta a metadata `edition2024`; o workflow remoto correspondente permaneceu verde.

A primeira execução do runner oficial apresentou um falso vermelho em `v2_integracao`: o processo foi iniciado com `PORTA_V2=4195`, mas o runner limpa somente as portas 4193/4194 e encontrou um Vite stale. O log mostrava boot vazio, ausência de `#nav` e timeout de 30 segundos, não uma asserção funcional do novo contrato. Foram encerrados somente os processos Vite do harness nas portas envolvidas, sem alteração de código, e o runner foi repetido com `PORTA_V2=4193`; todos os gates de código passaram.

## CI remota

O commit funcional `752206fb` teve oito workflows aplicáveis verdes: CI, Core CI, V2 Core, V2 Validation, V2 Runtime, CodeQL, Arma 3 Data CI e Vigia das rotas. O commit de versionamento `9b734394` também teve os oito workflows aplicáveis verdes:

| Workflow | Run |
|---|---:|
| CI | `32592111084` |
| Core CI | `32592111075` |
| V2 Core | `32592111062` |
| V2 Validation | `32592111069` |
| V2 Runtime | `32592111081` |
| CodeQL | `32592111068` |
| Arma 3 Data CI | `32592111108` |
| Vigia das rotas — push | `32592111074` |

A verificação documental posterior foi publicada na `main`. O Vigia do commit documental passou no run push `32593003396` e no run schedule adicional `32593160915`. Os workflows registraram somente o aviso de depreciação do Node 20 em actions que foram forçadas a executar com Node 24; não houve falha de gate.

## Desktop e artefatos

O Desktop Release `32592402608` passou nos jobs `windows-latest`, `macos-latest` e `ubuntu-latest`. A release pública `v1.3.1` foi publicada em `2026-08-22T19:02:42Z`, como não-draft e não-prerelease.

| Asset | Tamanho | HTTP |
|---|---:|---:|
| `Baluarte-Launcher-Setup-1.3.1.exe` | 644.015.682 bytes | 200 |
| `Baluarte-Launcher-Setup-1.3.1.exe.blockmap` | 669.566 bytes | 200 |
| `Baluarte-Launcher-1.3.1.AppImage` | 773.768.691 bytes | 200 |
| `Baluarte-Launcher-1.3.1-arm64.dmg` | 406.508.904 bytes | 200 |
| `Baluarte-Launcher-1.3.1-arm64.dmg.blockmap` | 423.615 bytes | 200 |
| `latest.yml` | 363 bytes | 200 |
| `latest-linux.yml` | 386 bytes | 200 |
| `latest-mac.yml` | 363 bytes | 200 |

Os três manifests remotos declararam `version: 1.3.1`. Os SHA-512 registrados foram `94Qmw61Dh5RX6Eh9A3Yxq2gtJt+p6vliP6Lju9zcCBaxAz13gjlA00q7pFT1QiWl50rfEJglRn601labPijjig==` para o instalador Windows, `4+qvryhVL9Ls0Wh94dVKPnQqYW9dz/SOnPdP6StO20R3InfloxLv+NfwEn0idhaUQQnK1eHbJl2QPHVZf2oMBg==` para o AppImage Linux e `YndjjbWwrie0rnjIkflsME7xUDGIPkCYEdz38y93ikRohpdhcACoMefV+jS1eK+x0ibexqHj4Vq3ZCZP9Nu0YQ==` para o DMG macOS ARM64.

## Preservação e segurança

A V1 permanece preservada: as 99 rotas do smoke continuam verdes, o router real continua sendo usado, as superfícies legadas e os wrappers permanecem no repositório e nenhuma sidebar V1 foi substituída. O novo preview não cria rota, UI de revisão, `markStatus`, papel de admin/dev/owner, autoridade server-side ou mecanismo de descarte.

O marco continua local e in-memory. `runtimeAuthority` permanece `not-authorized`, `publicPromotionAllowed` permanece `false` e a política deny-by-default não foi relaxada. O drift histórico do Supabase Preview continua `unknown/external`; não foi executada migration, DDL, RLS, staging, escrita remota ou ação de custo.

## Documentação reconciliada

A documentação foi atualizada diretamente na `main` em:

| Documento | Conteúdo |
|---|---|
| [`docs/releases/v1.3.1.md`](../releases/v1.3.1.md) | Nota pública da release e artefatos |
| [`docs/v2/EVIDENCE_RETENTION_CONTRACT_2026-08-22.md`](./EVIDENCE_RETENTION_CONTRACT_2026-08-22.md) | Contrato bounded do preview |
| [`docs/v2/PHASE_02_EVIDENCE_SLICE.md`](./PHASE_02_EVIDENCE_SLICE.md) | Checkpoint da fase Evidence |
| [`docs/v2/MASTER_EXECUTION_MATRIX.md`](./MASTER_EXECUTION_MATRIX.md) | Matriz mestre e próximo marco |
| [`docs/v2/PHASE_STATUS_MATRIX.md`](./PHASE_STATUS_MATRIX.md) | Estado das fases |
| [`docs/v2/V2_PROGRESS_REPORT_2026-08-22.md`](./V2_PROGRESS_REPORT_2026-08-22.md) | Medição corrente, mantendo 57,3% sem recomputação |
| [`README.md`](../../README.md) | Estado público e índice de releases |
| [`historico/CHANGELOG.md`](../../historico/CHANGELOG.md) | Histórico da release publicada |

## Limitações e próximo passo

A release 1.3.1 não fecha a V2. Permanecem pendentes a retenção operacional, a auditoria de consumidores, a revisão humana server-side, a persistência real, Supabase/RLS com staging aprovado, autoridade de produção, health operacional uniforme, aceite físico do app, estabilização, RC e testes mensais.

O próximo slice recomendado é definir a política operacional de retenção e auditoria sem descarte client-side, com testes de concorrência, duplicidade, tenancy, rollback e ownership. Qualquer persistência Supabase/RLS continua condicionada a autorização explícita de staging, custo, migration, segurança e rollback.
