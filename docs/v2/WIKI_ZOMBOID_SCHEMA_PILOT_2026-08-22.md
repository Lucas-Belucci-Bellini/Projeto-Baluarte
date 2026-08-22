# V2 Wiki Zomboid — Piloto de Schema e Evidence

**Status:** `PUBLICADO NA main — release incremental em preparação`

**Data:** 2026-08-22

**Autor:** Manus AI

## Objetivo

Este checkpoint executa o próximo passo válido da Phase 06 da V2: conectar a Evidence Layer a um fluxo de leitura controlado da Wiki usando fixtures locais e schemas verificáveis. O domínio escolhido foi Project Zomboid porque o Baluarte já possui duas superfícies V1 data-driven e um catálogo curado local com `name`, `author`, categoria, Workshop ID e campos opcionais de Mod ID/Spawn ID.

O piloto não raspa a Steam Workshop, não faz fetch automático, não cria persistência e não substitui `/zomboid` ou `/zomboid-admin`. Ele cria uma superfície separada no harness V2 em `/wiki-zomboid`, preservando as rotas públicas existentes.

## Contrato entregue

`v2/data/wiki-zomboid.ts` é a implementação TypeScript canônica do schema. Ela fornece `validateZomboidWikiEntry`, `normalizeZomboidWikiEntry` e `zomboidWorkshopEntryId`. A validação exige identificador, nome, autor, categoria conhecida, Workshop ID numérico, URL HTTP/HTTPS, revisão da fonte e data ISO válida. `modId` e `spawnId` permanecem opcionais e vazios quando o dataset não os fornece; nenhum valor ausente é inventado.

O registro normalizado é congelado, a fonte carrega URL, título, publisher e revisão do dataset, e a chave determinística usa o formato `zomboid:workshop:<workshopId>`. `v2/data/wiki-zomboid.js` permanece como wrapper de compatibilidade para a implementação TypeScript.

O módulo `v2/modules/wiki-zomboid/module.js` expõe uma API V2 bounded com `list`, `get`, `summary`, `reviewQueue` e `appendEvidence`. O módulo registra uma rota local `/wiki-zomboid`, declara estabilidade `beta`, não pede permissões, não declara storage e referencia Evidence como ligação fraca por `references.modules: ['evidence']`.

Durante `init`, o módulo resolve Evidence exclusivamente por `ctx.talvez('evidence', { versao: 1 })`. Quando Evidence está disponível, `appendEvidence` usa `evidence.appendCatalog` e produz registros `pending` com proveniência explícita, confidence conservadora `0.75` e collector `wiki-zomboid-local-catalog`. Quando Evidence não está registrada, o módulo continua funcional e retorna `null` para a tentativa de anexação; não há import direto do módulo Evidence nem capacidade ad-hoc.

## Integração no harness

O harness real registra sete módulos: Cripto, Editor, Militar, Evidence, Wiki Zomboid, Briefing e Visor 3D. O novo módulo acrescenta uma rota e um item de navegação apenas ao banco de prova V2. A contagem passa a 20 rotas e seis itens de navegação no harness; as 99 rotas do smoke V1, o shell V1 e seus cinco itens de navegação públicos não são alterados.

A view V2 exibe somente estado bounded: `159 entradas locais`, oito categorias, modo `local-curated` e `Evidence local conectada` quando a referência fraca foi resolvida. Ela não expõe conteúdo de evidências, tokens, claims, permissões ou autoridade operacional.

## Testes

O teste focal `test/v2/wiki-zomboid-module.test.js` cobre validação, normalização, imutabilidade, rejeição de Workshop ID inválido, manifesto e referência fraca, resolução real pelo Registry/API resolver, anexação local de Evidence e fallback sem Evidence.

| Evidência | Resultado |
|---|---:|
| Teste focal Wiki Zomboid | **4/4** (inclui queue pending-only, limite, imutabilidade, campos omitidos, argumentos inválidos e exclusão após `verified`) |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | **1254/1254** |
| `npm run build` | Verde; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | **49/49** em `PORTA_V2=4195` com Chromium do ambiente |
| Smoke V1 anterior | `99/99` |
| Caminho crítico | `15/15` |

A integração browser provou que os sete módulos sobem sem falha, que o Registry entrega 20 rotas, que a navegação derivada possui seis entradas, que a API Wiki Zomboid retorna o resumo esperado, que `reviewQueue` inicia vazia no boot limpo e que a view renderiza pelo router real da V1 adaptado ao harness. Também confirmou a preservação da sidebar V1, das invariantes de autorização e do fallback de observabilidade.

## Segurança e limites

O piloto é local e read-only. Não adiciona `NETWORK`, `DATABASE`, `USER_DATA`, `READ_FILES`, `WRITE_FILES` ou `EXECUTION`. Não usa Supabase, SQL, DDL, migration, RLS, Auth de produção, OpenClaw, WhatsApp, Spotify ou publicação automática. O link da Steam é proveniência de registro e não é uma autorização para coleta em segundo plano.

As entradas de Evidence começam em `pending`. O piloto não afirma que o Workshop ID, nome, autor ou categoria são fatos verificados por uma autoridade externa; apenas preserva a origem declarada do dataset local e o momento de captura registrado no contrato. A transição para `verified` continua fora deste marco.

A superfície V2 não concede acesso administrativo. A existência de `/zomboid-admin` na V1 continua sujeita ao comportamento atual da plataforma, e este piloto não introduz roles client-side nem tenta resolver Auth/RLS por inferência.

## Próximo passo

O commit funcional deste slice foi publicado na `main` em `3f05e240` (`feat(v2): add bounded evidence review queue`) após os gates locais; a CI remota aplicável do SHA terminou verde. A release do app ainda não foi criada. A próxima evolução válida é medir a necessidade de busca/indexação e revisar o schema com mais fixtures reais do catálogo, ainda sem scraping ou persistência remota. A entrada de dados externos, worker Python, fila de ingestão, embeddings e pgvector permanecem posteriores e dependem de contratos de retenção, concorrência, tenancy, revisão humana e staging autorizado.

A persistência Supabase permanece bloqueada até aprovação explícita de staging, custo, migration, RLS e rollback. O próximo release do app só deve ser criado após o commit funcional, documentação, gates locais, CI remoto e artefatos desktop passarem como conjunto.

## Referências

[1]: ../../src/pages/zomboid.ts "Superfície V1 Project Zomboid"

[2]: ../../src/pages/zomboid-admin.ts "Superfície V1 de administração local"

[3]: ../../src/data/zomboid-admin.js "Dataset local curado do Project Zomboid"

[4]: ../../v2/data/evidence.ts "Contrato canônico da Evidence Layer"

[5]: ../../v2/data/catalog-evidence.ts "Adaptador canônico de catálogo para Evidence"

[6]: ./PHASE_02_EVIDENCE_SLICE.md "Phase 02 — Evidence Layer"


## Checkpoint adicional — Evidence status observability

O piloto foi ampliado sem alterar sua fronteira de segurança: o resumo da API agora informa `evidenceByStatus` para `pending`, `verified`, `rejected` e `superseded`. A view local mostra somente a quantidade bounded de registros vinculados e pendentes; ela não oferece ação de verificação, não altera status e não expõe o conteúdo das claims.

O gate browser passou a verificar que o Registry resolve o resumo Wiki Zomboid com zero evidências vinculadas no boot limpo e que a superfície mostra `0 vinculadas · 0 pendentes`. O teste focal continua cobrindo a transição local para um registro `pending`, confirmando que a contagem por status acompanha o store compartilhado.

Esta observabilidade prepara um futuro fluxo de revisão, mas não o implementa. A nova `reviewQueue(limit)` é um read-model local, bounded e somente leitura: considera apenas registros `pending`, aplica limite padrão 25 e máximo 100, retorna somente `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`, e congela a fila e seus itens. Ela não expõe `statement`, `source`, URI, título, publisher, collector, `moduleId`, token, claims ou permissão. Quando Evidence não está disponível, retorna `[]`. Mudança de status, revisão humana, roles administrativas, auditoria de consumidor e persistência remota continuam fora deste marco e dependem de autoridade server-side, retenção, tenancy, RLS e rollback aprovados.
