# Relatório de conclusão — V2 Wiki Zomboid → Evidence review queue

**Projeto:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch oficial:** `main`  
**SHA final auditado:** `c707cffcf602fdfa7efc76bc0edbcad2071df34c`  
**Commit de versionamento da release:** `9ae47cea549b886874a223b4adf9573cc07e1e29`  
**Data:** 2026-08-22  
**Status:** **CONCLUÍDO E PUBLICADO**

## Resumo executivo

O próximo slice da V2 foi concluído diretamente na `main`: o piloto local Wiki Zomboid agora possui uma fila de revisão Evidence bounded, read-only e segura para registros pendentes. A implementação não concede revisão humana, não altera status e não transforma o navegador em autoridade. A fila serve apenas como read-model preparatório para uma futura revisão server-side.

O marco foi publicado em três commits funcionais/documentais e recebeu a release pública `1.3.0`. A integração browser passou de `48/48` para **`49/49`**, a suíte completa passou **`1254/1254`**, smoke e caminho crítico continuaram em **`99/99`** e **`15/15`**, a CI aplicável do commit de versionamento passou em **8/8 workflows**, e o Desktop Release concluiu com sucesso em Windows, macOS ARM64 e Ubuntu. A release pública é não-draft e não-prerelease, contém oito assets e todos os instaladores, blockmaps e manifests verificados responderam HTTP 200.

> **Conclusão:** o slice deu certo e a release 1.3.0 está publicada. A V2 completa ainda não foi declarada; o percentual formal de prontidão permanece em **57,3%**, sem recomputação nesta rodada.

## Linha de commits publicada

| Papel | SHA | Mensagem | Estado |
|---|---|---|---|
| Implementação | `3f05e24018d4f08585b17df7f5244fa4f392164d` | `feat(v2): add bounded evidence review queue` | Publicado na `main`; CI aplicável verde |
| Hardening e cobertura | `0ab6f428eb39bdbc7feb7cfce1001b4ed2fde9b1` | `test(v2): harden evidence review queue contract` | Publicado na `main`; CI aplicável verde |
| Versionamento e candidata | `9ae47cea549b886874a223b4adf9573cc07e1e29` | `chore(release): prepare 1.3.0` | Publicado na `main`; CI 8/8 verde |
| Reconciliação final | `c707cffcf602fdfa7efc76bc0edbcad2071df34c` | `docs(v2): reconcile release 1.3.0 evidence slice` | Publicado na `main`; todos os workflows observados no SHA terminaram verdes |

A `main` local e `origin/main` foram confirmadas no SHA final `c707cffc`. As tags anotadas `v1.3.0` e `desktop-v1.3.0` apontam para o commit de versionamento `9ae47cea`; não houve force push, rebase público ou PR intermediário.

## Contrato implementado

A função `reviewQueue(limit)` consulta somente `evidenceApi?.listByModule('wiki-zomboid')`. Ela considera exclusivamente registros com `status: 'pending'`, usa limite padrão de 25 itens e limita qualquer solicitação válida a no máximo 100 itens. Argumentos não inteiros, menores que 1 ou não numéricos lançam `TypeError` por meio do bounded limit existente.

Cada item retornado é congelado e possui exatamente os seguintes campos: `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. A lista também é congelada. O read-model não devolve `statement`, `source`, URI, título, publisher, collector, `moduleId`, token, claims, role, permissão ou qualquer outro dado operacional.

A ausência da Evidence é tratada de forma segura: `reviewQueue()` retorna `[]` e o módulo continua funcional. O módulo Wiki não recebeu `markStatus`. O teste usa `evidence.api.markStatus()` somente para mudar uma fixture durante a verificação focal e provar que um registro `verified` deixa de aparecer na fila; essa mutação não é exposta pela API do Wiki nem pela view do navegador.

O comentário JSDoc incorreto que tratava `limit` como `workshopId` foi corrigido para `@param {number} [limit]`. A fila foi adicionada ao manifesto do módulo como `reviewQueue`, mantendo o Registry, o resolvedor de APIs, o Event Bus e o Evidence Store existentes.

## Arquivos alterados no marco

| Arquivo | Alteração |
|---|---|
| `v2/modules/wiki-zomboid/module.js` | API `reviewQueue(limit)`, JSDoc corrigido, saída congelada e fallback sem Evidence |
| `test/v2/wiki-zomboid-module.test.js` | Testes de pending-only, dois registros, limite, imutabilidade, campos omitidos, argumentos inválidos, fallback e exclusão após `verified` |
| `scripts/v2-integracao.mjs` | Nova asserção browser explícita: queue vazia e bounded no boot limpo |
| `v2/data/wiki-zomboid.ts` e wrapper `.js` | Preservados; nenhuma alteração de contrato canônico necessária |
| `docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md` | Contrato, segurança, 49/49 e status da release atualizados |
| `docs/v2/PHASE_02_EVIDENCE_SLICE.md` | Conclusão do vertical slice local registrada |
| `docs/v2/MASTER_EXECUTION_MATRIX.md` | Phase 06, Phase 13, release/rollback e medição corrente reconciliados |
| `docs/v2/PHASE_STATUS_MATRIX.md` | Checkpoint do slice e da release incluído |
| `docs/v2/V2_PROGRESS_REPORT_2026-08-22.md` | SHA, contagens, release e checkpoint atualizados; 57,3% mantido sem recomputação |
| `docs/releases/v1.3.0.md` | Nota final com artefatos, hashes de manifest e critérios verificados |
| `README.md` | Release pública 1.3.0 e documentação do slice adicionadas |
| `historico/CHANGELOG.md` | Entrada pública 1.3.0 adicionada no topo |
| `package.json`, `package-lock.json` | Versão sincronizada em `1.3.0` |
| `desktop/package.json`, `desktop/package-lock.json` | Versão sincronizada em `1.3.0` |
| `src/data/version.js` | Fonte canônica web atualizada para `1.3.0` |
| `public/sw.js` | Cache atualizado para `baluarte-v1.3.0` |
| `.github/workflows/desktop-release.yml` | Default informativo atualizado para `1.3.0` |

A V1, o router, as 99 rotas do smoke, as superfícies `/zomboid` e `/zomboid-admin` e os 115 wrappers JavaScript foram preservados. O inventário continua com zero páginas JavaScript canônicas e as implementações TypeScript canônicas permanecem separadas dos wrappers de compatibilidade.

## Validação local

Os comandos foram executados no checkout local com `CHROME_PATH=/usr/bin/chromium` e `PORTA_V2=4195` quando aplicável.

| Comando ou evidência | Resultado |
|---|---|
| Teste focal Wiki Zomboid | **4/4** |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | **1254/1254** |
| `npm run build` | Verde; warning conhecido de chunks maiores que 500 kB |
| `npm run v2:integracao` | **49/49** |
| `npm run smoke` | **99/99** |
| `npm run caminho-critico` | **15/15** |
| `node scripts/gen-catalogo-eventos.mjs --verificar` | Verde no runner |
| `npm run verificar-nexus` | Verde no runner |
| Contratos Python, compilação e gates auxiliares | Verdes no runner |
| Runner oficial `/home/ubuntu/run_baluarte_hardening_gates.sh` | **20 gates retornaram código 0**; Rust retornou código 101 e foi mantido como `blocked-known` |
| `git diff --check` | Verde |
| Estado final local | Working tree limpo; `main == origin/main == c707cffc` |

O runner oficial foi executado após a implementação do slice; a cobertura focal foi ampliada em seguida para incluir os casos de segurança da fila e passou. O preflight da candidata 1.3.0 repetiu typechecks, suíte completa, build, integração browser, smoke e caminho crítico. A diferença é documental/teste/JSDoc, sem mudança comportamental posterior na implementação.

O Rust local permanece bloqueado somente por `rustc/cargo 1.75.0`, que não interpreta `edition2024` no Runtime. Isso não foi mascarado nem classificado como falha nova do código web. Os workflows remotos de Rust observados anteriormente permaneceram verdes.

O smoke produziu alterações transitórias nos relatórios gerados `relatorios/smoke-rotas.json` e `relatorios/smoke-rotas.md`, principalmente tempos e títulos não determinísticos. Como esses arquivos não eram parte do slice e não alteravam o resultado do gate, foram restaurados antes do commit final; nenhum artefato transitório foi incluído na release.

## CI remoto

### Commits funcionais

Os commits `3f05e240` e `0ab6f428` tiveram os oito workflows aplicáveis observados no SHA e terminaram verdes: `Arma 3 Data CI`, `CI`, `CodeQL`, `Core CI`, `V2 Core`, `V2 Runtime`, `V2 Validation` e `Vigia das rotas`.

### Commit de versionamento

O commit `9ae47cea` teve os oito workflows aplicáveis verdes: `Arma 3 Data CI`, `CI`, `CodeQL`, `Core CI`, `V2 Core`, `V2 Runtime`, `V2 Validation` e `Vigia das rotas`.

### Commit documental final

No commit `c707cffc`, foram observados e concluídos com sucesso os workflows `Arma 3 Data CI` (`32589575511`), `CI` (`32589575497`), `CodeQL` (`32589575513`), `Core CI` (`32589575494`), `V2 Runtime` (`32589575522`), `V2 Validation` (`32589575527`) e `Vigia das rotas` (`32589575507`). O workflow `V2 Core` não apareceu na listagem desse SHA final e, portanto, não é contado nem afirmado como executado nesse commit documental.

As anotações remotas sobre ações usando Node.js 20 foram warnings de infraestrutura, porque os jobs foram forçados a Node 24; não houve falha funcional.

## Release e artefatos

A release pública está em [GitHub — v1.3.0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.0). A API confirmou `isDraft: false`, `isPrerelease: false`, publicação em `2026-08-22T17:52:48Z` e oito assets.

| Asset | Tamanho | Status HTTP |
|---|---:|---:|
| `Baluarte-Launcher-Setup-1.3.0.exe` | 644.015.736 bytes | 200 |
| `Baluarte-Launcher-Setup-1.3.0.exe.blockmap` | 669.507 bytes | 200 |
| `Baluarte-Launcher-1.3.0.AppImage` | 773.768.732 bytes | 200 |
| `Baluarte-Launcher-1.3.0-arm64.dmg` | 406.515.679 bytes | 200 |
| `Baluarte-Launcher-1.3.0-arm64.dmg.blockmap` | 423.438 bytes | 200 |
| `latest.yml` | 363 bytes | 200 |
| `latest-linux.yml` | 386 bytes | 200 |
| `latest-mac.yml` | 363 bytes | 200 |

Os três manifests declaram `version: 1.3.0`. Os SHA-512 publicados nos manifests são `PE2NI8ksImMgsEu4jtqCyIyukwPr2qmaIjRqj4qaZBrPg/TRAxSGnezRA3gqq2cBjw+eMKyFZDPy6uMrQ3WrNA==` para Windows, `EtjSwMpZ/tsG/k33ryzL/2C1zvL8zGkZ24d2a9Kgiyrcf8YyZt/esN7S4S5aCSIljPNRJvA+P0FxVZz5vHupqw==` para Linux e `4STrzKfpOc81JfNNSc8KhWRZKoWVpHA1Y0PvwF9xbKAr3LuLKvhbz3OEAPcDTcn+tk1NhLdgzkXXwQupNoZKtQ==` para macOS ARM64.

O workflow Desktop Release `32588898329` concluiu os três jobs com sucesso. A tag `desktop-v1.3.0` aponta para o mesmo commit de versionamento da tag `v1.3.0`, e o Service Worker usa a chave `baluarte-v1.3.0`.

## O que não foi alterado

Não houve DDL, migration, RLS, staging Supabase, escrita remota, Auth de produção, roles client-side, alteração do Permission Manager, novo Storage, novo Event Bus, envio de WhatsApp, OpenClaw, Spotify, venda, publicação externa, controle de playback ou uso de segredos. A release não transforma `pending` em `verified`; ela apenas torna a leitura bounded de pendências observável e testável.

A política `runtimeAuthority: not-authorized` e `publicPromotionAllowed: false` permanece intacta. A existência das superfícies administrativas V1 não foi usada para inferir autorização para o novo fluxo. Nenhum botão de aprovação foi criado.

## Limitações e riscos restantes

A fila é in-memory e local. Ela não sobrevive a reload, não é uma fila distribuída e não é uma ferramenta de aprovação humana. Os dados de Evidence continuam sujeitos à política futura de retenção, auditoria, tenancy, concorrência e proveniência operacional.

A V2 estável não foi declarada. O índice formal permanece em 57,3% sem nova recomputação. Ainda faltam persistência comum, RLS e Auth/RBAC server-side, operação uniforme de health/quarentena, aceite físico do app, estabilização, release candidate, revisão de consumidor, testes mensais e avaliação em hardware real.

O Supabase Preview continua `unknown/external` quando o drift de migrations aparecer; nenhuma ação remota foi feita para tentar resolver isso. O Rust local continua `blocked-known`. Esses estados são limitações documentadas, não falhas novas do slice.

## Rollback

A referência operacional anterior é a release pública `v1.2.9`. Não apagar tags corretas nem reescrever histórico. Se surgir defeito na 1.3.0, a reversão operacional deve retornar à `v1.2.9` e uma correção posterior deve usar uma nova versão do Service Worker, sem reutilizar a chave `baluarte-v1.3.0`.

## Próximo passo ordenado

O próximo trabalho recomendado é definir a política de retenção e a auditoria de consumidor para Evidence local, incluindo limites de idade, duplicidade, concorrência e descarte. Em seguida, deve ser desenhado um fluxo de revisão humana sem mutação client-side, com autoridade server-side, escopo explícito, auditoria e rollback.

Somente depois de contrato, staging, custo, RLS, tenancy e rollback aprovados deve ser considerada persistência Supabase. A evolução de busca/indexação do catálogo deve continuar local e mensurada antes de qualquer scraping ou ingestão remota.

## Documentos relacionados

| Documento | Finalidade |
|---|---|
| [`v1.3.0.md`](../releases/v1.3.0.md) | Nota pública da release e artefatos |
| [`WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](./WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md) | Contrato do piloto e fila bounded |
| [`PHASE_02_EVIDENCE_SLICE.md`](./PHASE_02_EVIDENCE_SLICE.md) | Fase Evidence e vertical slice |
| [`MASTER_EXECUTION_MATRIX.md`](./MASTER_EXECUTION_MATRIX.md) | Matriz mestre do roadmap |
| [`PHASE_STATUS_MATRIX.md`](./PHASE_STATUS_MATRIX.md) | Estado das fases V2 |
| [`V2_PROGRESS_REPORT_2026-08-22.md`](./V2_PROGRESS_REPORT_2026-08-22.md) | Medição atual sem recomputação do percentual |
| [`README.md`](../../README.md) | Onboarding e visão geral do projeto |
