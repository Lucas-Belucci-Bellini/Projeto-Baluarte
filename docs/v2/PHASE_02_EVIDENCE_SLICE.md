# PHASE 02 — Evidence Layer

**Status:** implementado como slice local e publicado na `main` somente após os gates.  
**Autor:** Manus AI  
**Escopo:** proveniência e ciclo de verificação de fatos para módulos V2.

## Decisão

A primeira entrega da Data Layer não tenta migrar os catálogos existentes, não coleta dados da rede e não escreve diretamente em Supabase. Ela cria uma fronteira pequena, determinística e testável para fatos observados: cada evidência precisa de identificador, chave da afirmação, texto, fonte, momento de coleta, confiança e módulo responsável.

> **Regra:** informação coletada por agentes não é fato confiável sem fonte, data, versão/revisão e validação explícitas.

## Contrato entregue

`v2/data/evidence.ts` fornece `validateEvidence`, `normalizeEvidence` e `EvidenceStore`. O adapter `v2/data/catalog-evidence.ts` transforma campos de catálogos em claims determinísticas, e o módulo expõe isso como `appendCatalog`. A normalização rejeita confidence fora de `[0, 1]`, datas inválidas, fontes sem URI, campos obrigatórios vazios e estados desconhecidos. O registro normalizado é congelado e a inserção é append-only por `id`; a mudança permitida nesta fase é apenas de ciclo de verificação (`pending`, `verified`, `rejected`, `superseded`).

O módulo `v2/modules/evidence/module.js` expõe o mesmo contrato ao Module Registry, sem rotas, sem permissões, sem rede e sem storage implícito. Seu `dispose()` libera a instância do store. Isso demonstra isolamento: o módulo pode falhar ou ser desligado sem derrubar a superfície V1.

## Testes

Foram adicionados `test/v2/evidence.test.js` e `test/v2/evidence-module.test.js`. Eles cobrem validação, defaults, imutabilidade, duplicidade, filtragem por claim/módulo, transição de status, manifesto sem rota, lifecycle de inicialização e descarte.

| Gate | Resultado |
|---|---:|
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | **971/971** |
| `npm run build` | Verde; warning conhecido de chunks grandes |
| `npm run smoke` | Verde |
| `npm run v2:integracao` | **19/19** |
| `npm run caminho-critico` | **15/15** |
| `npm run prova-offline` | **9/9** |
| `npm run sonda-memoria` | Verde |

## Limites conscientes

Este slice ainda não faz ingestão, deduplicação semântica, busca full-text, embeddings, revisão humana ou persistência Postgres. A migration SQL existente continua sendo a fundação futura e não foi alterada nesta fase. A persistência deve ser adicionada depois de definir o adapter, os testes de concorrência e a política de tenancy; não será criada uma segunda implementação de Storage no frontend.

## Próximo passo recomendado

O adapter local de catálogo, a fila Wiki Zomboid e as projeções locais de retenção/auditoria já foram conectados ao módulo e validados com fixtures. O próximo slice válido é definir a política operacional de retenção e auditoria server-side com identidade, tenancy, ownership, concorrência, exportação e rollback. Só depois de aprovação explícita devem entrar persistência remota, fila de ingestão, worker Python ou pgvector.


## Checkpoint seguinte — Wiki Zomboid schema pilot — 2026-08-22

O slice conectou o contrato de Evidence a uma leitura controlada da Wiki usando o catálogo local curado de Project Zomboid. `v2/data/wiki-zomboid.ts` exige nome, autor, categoria conhecida, Workshop ID numérico, fonte com URL/revisão e `retrievedAt` ISO; `modId` e `spawnId` permanecem opcionais e não são inventados. O módulo `wiki-zomboid` declara `references.modules: ['evidence']`, resolve a API por `ctx.talvez('evidence', { versao: 1 })`, expõe API bounded e continua funcional sem Evidence.

O slice seguinte, publicado no commit funcional `3f05e240`, adicionou `reviewQueue(limit)` como read-model local, somente leitura e bounded. Ela filtra apenas `pending`, usa limite padrão 25 e máximo 100, congela fila e itens e retorna exclusivamente `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. O teste também demonstrou que um registro `verified` sai da fila, sem conceder ao Wiki uma API de mutação; a chamada de `markStatus` foi usada apenas no teste através do módulo Evidence.

O harness V2 registra sete módulos, 20 rotas e seis itens de navegação internos. A view local informa `159 entradas locais`, oito categorias e o estado da Evidence sem substituir as superfícies V1 `/zomboid` e `/zomboid-admin`. O teste focal passou 4/4, `npm test` passou 1254/1254 e `npm run v2:integracao` passou 49/49 em porta limpa. O runner oficial passou 20 gates com código 0 e manteve apenas Rust como `blocked-known` código 101 devido ao toolchain local incompatível com `edition2024`; a CI remota aplicável dos commits funcionais e de versionamento terminou verde. A release `v1.3.0` e a tag `desktop-v1.3.0` foram publicadas após o Desktop Release `32588898329` concluir em Windows, macOS ARM64 e Ubuntu; os oito assets, os três manifests e os instaladores/blockmaps responderam HTTP 200. O slice continua local/read-only e não ativa rede, persistência, Auth, RLS, Supabase, scraping ou publicação externa. A documentação detalhada está em [`WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](./WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md).

## Checkpoint mais recente — Evidence retention preview / Release 1.3.1 — 2026-08-22

O commit funcional `752206fb` adicionou `projectEvidenceRetention` ao contrato TypeScript e `retentionPreview(options)` ao módulo Evidence. A projeção recebe `now` obrigatório, `maxAgeDays` padrão 30 com teto 3650 e `limit` padrão 25 com teto 100. Ela preserva a ordem append-only, classifica itens como `within-window`, `past-window` ou `future-observed`, congela a saída e retorna somente `id`, `moduleId`, `status`, `observedAt`, `ageDays` e `retention`, além de resumo bounded. Nenhum registro é apagado ou alterado; o fallback antes do init e após `dispose` é vazio.

A validação passou teste focal Evidence `9/9`, suíte completa `1256/1256`, typechecks, build com warning conhecido de chunks grandes, integração V2 `50/50`, smoke `99/99`, caminho crítico `15/15` e runner oficial com 20 gates código 0. A primeira execução do runner teve falso vermelho de `v2_integracao` porque `PORTA_V2=4195` não era limpa pelo runner, que remove apenas 4193/4194; após matar somente os Vite stale do harness e rerodar em 4193, o gate passou e Rust permaneceu `blocked-known` código 101. O commit funcional e o commit de versionamento tiveram 8/8 workflows remotos verdes.

A release `v1.3.1` e a tag `desktop-v1.3.1` foram publicadas após o Desktop Release `32592402608` passar em Windows, macOS ARM64 e Ubuntu. A release pública não é draft nem prerelease, possui oito assets, os manifests declaram `version: 1.3.1` e os oito downloads responderam HTTP 200. A nota detalhada está em [`docs/releases/v1.3.1.md`](../releases/v1.3.1.md) e o contrato em [`EVIDENCE_RETENTION_CONTRACT_2026-08-22.md`](./EVIDENCE_RETENTION_CONTRACT_2026-08-22.md).


## Checkpoint mais recente — Evidence audit preview / Release 1.3.2 — 2026-08-22

O commit funcional `dbd09f52` adicionou `projectEvidenceAudit` ao contrato TypeScript e `auditPreview(options?)` ao módulo Evidence. A projeção aceita chamada sem opções, filtra opcionalmente por `moduleId`, aplica limite padrão 25 e máximo 100, preserva a ordem append-only e retorna somente `scope`, `limit`, registros estruturais e resumo bounded. Cada registro contém apenas `id`, `moduleId`, `status` e `observedAt`; o resumo contém `returned`, contagens por status e `truncated`. Nenhum statement, fonte, URI, publisher, revision, collector, confidence, claimKey, retrievedAt, token, role, claim ou permissão é exposto.

A validação passou teste focal Evidence `11/11`, suíte completa `1258/1258`, `tipos:ts`, `tipos:v2`, build com warning conhecido de chunks grandes, integração V2 `51/51`, smoke `99/99`, caminho crítico `15/15` e runner oficial com 20 gates código 0. Rust local permaneceu `blocked-known` código 101 pela incompatibilidade do Cargo com `edition2024`. Os oito workflows remotos aplicáveis do commit funcional e do commit de versionamento terminaram verdes.

A release `v1.3.2` e a tag `desktop-v1.3.2` foram publicadas após o Desktop Release `32595313050` passar em Windows, macOS ARM64 e Ubuntu. A release pública não é draft nem prerelease, possui oito assets, os manifests declaram `version: 1.3.2` e os oito downloads responderam HTTP 200. A nota detalhada está em [`docs/releases/v1.3.2.md`](../releases/v1.3.2.md) e o contrato em [`EVIDENCE_AUDIT_PREVIEW_CONTRACT_2026-08-22.md`](./EVIDENCE_AUDIT_PREVIEW_CONTRACT_2026-08-22.md).

O próximo marco é uma política operacional de retenção e auditoria server-side com identidade, tenancy, ownership, concorrência, exportação e rollback. Este checkpoint não cria persistência remota nem autorização client-side.
