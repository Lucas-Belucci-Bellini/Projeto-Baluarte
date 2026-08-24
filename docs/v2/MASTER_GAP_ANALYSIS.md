# MASTER GAP ANALYSIS

**Status:** `CURRENT — WAVE 36 / RELEASE 1.2.0`
**Data da observação:** 2026-08-20
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `32b59ad5e521ea521758b1e9d52c5f50f959f078`
**Tag de release base:** `v1.2.0`
**Working tree:** limpo no fechamento da release

> Este documento é o mapa corrente de lacunas após a reconciliação do Master Super-Prompt Ω. Ele não declara a V2 completa e não transforma a lista de fases futuras em implementação automática.

## 1. Resumo executivo

O Baluarte está em uma condição de **V1 publicável, migração TypeScript incremental ativa e fundação V2 verificável**, não em uma condição de V2 concluída. A Wave 36 promoveu os consumers TypeScript de `theme.ts` em `shell.ts` e `perfil.ts`, mantendo o wrapper JavaScript para os consumers legados. A release `1.2.0` foi publicada depois da Wave 35, com o frontend e utilitários promovidos gradualmente para TypeScript, wrappers JavaScript preservados para compatibilidade e o Nexus sincronizado. Os gates locais relevantes e os oito workflows remotos da release terminaram verdes.

O prompt anexado é compatível com a direção arquitetural de #423, mas é muito mais amplo que o próximo escopo executável. Ele deve funcionar como uma camada de governança acima do roadmap, não como uma ordem para construir Core, marketplace, plugins, desktop, mobile, billing real, IA autônoma e centenas de integrações em sequência imediata. As regras canônicas continuam exigindo pequenos passos, ausência de sistemas duplicados, segurança por padrão, observabilidade, documentação e verificação no `main` [1] [2].

Os principais gaps atuais são **provas de produção e fronteiras de segurança**, não ausência geral de telas. Permanecem sem validação suficiente: Auth/login-cadastro na main corrente, autorização server-side/RLS para papéis e módulos, persistência remota Billing transacional, backup/restore, aceite físico de desktop/mobile, benchmarks de performance e o registro formal dos projetos externos. O runtime Rust local é uma limitação de ambiente; não foi evidenciada falha do protocolo remoto.

## 2. Evidência do estado atual

| Área | Evidência no SHA `b865fcc6` | Estado |
|---|---|---|
| V1/router | Smoke de 99/99 rotas e caminho crítico 15/15 | `EXISTS` |
| TypeScript | Páginas canônicas migradas; wrappers JS permanecem por compatibilidade | `PARTIAL` sistêmico / página canônica `EXISTS` |
| Nexus | 99 rotas, 0 lacunas, 21/21 domínios | `EXISTS` |
| Core V2 | Boot, Registry, Platform, Runtime Session, health e permissões locais | `PARTIAL` |
| Event Bus | Eventos versionados, catálogo e integração V2 | `PARTIAL` |
| Module System | Manifest, lifecycle, health e pilotos funcionais | `PARTIAL` |
| Data Layer | Storage local, schemas e harnesses | `PARTIAL` |
| Evidence Layer | Provenance, revision, confidence e contratos iniciais | `PARTIAL` |
| Supabase/RLS | Contratos e SQL/harnesses existem; staging server-side não está aprovado como autoridade | `BLOCKED` |
| Auth/Tenancy | Superfícies e contratos existem; fluxo completo na main corrente não foi aceito | `BLOCKED` |
| Billing | Catálogo, ledger e transação local/read-only | `PARTIAL` / remoto `BLOCKED` |
| JARVIS | Contexto, ferramentas e presença musical/Spotify com fakes e permissões | `PARTIAL` |
| Desktop | Launcher e contratos parciais | `PARTIAL` / aceite de distribuição `BLOCKED` |
| Mobile | PWA/Capacitor e contratos parciais | `PARTIAL` / aceite físico `BLOCKED` |
| Arma 3/Zomboid | Dados, páginas e fixtures parciais; módulos ainda precisam de governança por schema/evidence | `PARTIAL` |
| AEGIS Ocean | Governança de dados dual-use documentada | `EXISTS` como regra; produto científico ainda `PLANNED` |
| CI | Oito workflows verdes no SHA da release | `EXISTS` |
| Backup/restore | Rollback de código documentado; drill de dados e RPO/RTO não comprovados | `MISSING` |
| Performance/accessibility | Gates comportamentais existem; matriz completa e budgets não fechados | `PARTIAL` |

## 3. Causas-raiz, bloqueios e efeitos cascata

Nenhuma falha funcional nova foi reproduzida nos gates da release `1.2.0`. A tabela abaixo distingue bloqueios honestos de efeitos derivados; não conta cada consequência como um defeito independente.

| ID | Causa ou gap raiz | Evidência | Efeitos cascata não independentes | Classificação |
|---|---|---|---|---|
| `ENV-RUST-001` | Cargo local 1.75.0 não interpreta metadata `edition2024` da dependência/lockfile | `npm run v2:runtime` local retorna exit 101; workflow V2 Runtime remoto passou | Runtime local fica `unknown/local-blocked` | Limitação ambiental |
| `AUTH-IDENTITY-001` | Auth/login-cadastro ainda não foi aceito na main corrente com todos os fluxos e RLS | Feature, redirects, refresh, recuperação e isolamento server-side ainda não têm aceite completo | Release de identidade e RBAC de produção adiados | Gap arquitetural/security |
| `MODULE-RBAC-001` | Papéis e disponibilidade de módulos ainda não têm autoridade server-side comprovada | Estado local e pilotos não substituem claims/RLS | Quarentena protegida, admin/dev/owner e diagnóstico server-side não podem ser declarados completos | Gap de segurança |
| `BILLING-REMOTE-001` | Assignment + usage remoto ainda não estão comprovados em RPC/transação PostgreSQL revisada | Driver remoto permanece desligado por preflight | Checkout, webhook, subscription, invoice e provider financeiro ficam adiados | Bloqueio deliberado |
| `RECOVERY-001` | Não há drill reproduzível de backup/restore de dados com RPO/RTO aprovados | Rollback de código existe; recuperação de dados não foi demonstrada | Disaster recovery e declaração de produção ficam adiados | Gap operacional |
| `DESKTOP-MOBILE-ACCEPT-001` | Aceite físico/distribuição de desktop e mobile não pode ser inferido de build web | CI web e smoke não validam macOS, Android/iOS físicos ou instaladores finais | Release de app e auto-update completo ficam adiados | Gap de validação |
| `EXTERNAL-REGISTRY-001` | Projetos externos ainda não têm ficha uniforme de licença, manutenção, sobreposição, risco e custo | O prompt fornece uma lista; não existe ainda decisão por repositório baseada em auditoria completa | Vendorização, plugins e integrações Level 3 ficam adiados | Gap de governança |

### Causas já resolvidas

`GEN-TS-001` não deve mais ser contado como gap atual. O commit `b8e1db7a` está ancestral ao SHA da release e os dois geradores Node-safe passaram diretamente no checkout corrente. A dívida residual é uma auditoria mais ampla das fronteiras Node/TypeScript (`GEN-TS-002`), não a falha original dos geradores [3].

## 4. Reconciliação do roadmap e das issues

| Fonte | Interpretação corrente | Estado no mapa |
|---|---|---|
| #420 | Fundação, hardening e transição V1 → V2; orienta governança e gates | `ACTIVE / PARTIAL` |
| #422 | Wiki Project Zomboid; schema, fixtures e testes antes de conteúdo amplo | `PLANNED / PARTIAL` |
| #423 | Ordem mestre: Core → Data/Evidence → especialistas → vertical slice → módulos | `ACTIVE SOURCE OF ORDER` |
| #430 | Especialistas por domínio e integrador de contratos | `PARTIAL`; tipos e workflows existem, integrador único ainda não |
| #454 | Governança AEGIS Ocean para dados científicos dual-use | `ACTIVE CONSTRAINT`; sem targeting, interceptação ou vigilância operacional |
| #240 | Roadmap guarda-chuva de continuação | `LIVE REFERENCE`; não fechar automaticamente |
| #248 | Manual operacional e continuidade | `LIVE REFERENCE`; manter como entrada de onboarding |
| #291 | Supabase, RLS, banco, rádio/música e regras do operador | `ACTIVE BACKLOG / BLOCKED` nas partes remotas não aprovadas |
| #316 | Backend do Núcleo, persistência, deploy e WebSocket | `PARTIAL / PLANNED` |
| #338 | Aceite e release do launcher desktop | `BLOCKED` por validação de distribuição |
| #369 | Arquivista/filesystem | `PLANNED`; primeira etapa deve ser read-only, search, inventory e report |
| #386 / #398 | Modpacks e Wiki Arma 3 | `PARTIAL`; exige schema, source, license, evidence e versionamento |
| #406 | Mapa Nexus e donos de domínio | `EXISTS`; gate atual verde |

Issues abertas são matéria-prima e referências vivas, não uma fila que precisa ser implementada literalmente. Quando uma issue antiga divergir do código ou do SHA atual, prevalece a evidência corrente e a divergência deve ser registrada, não apagada [4] [5] [6].

## 5. Repositórios externos: decisão preliminar

A lista externa do prompt ainda não foi promovida a dependências. Nenhum projeto será copiado ou instalado automaticamente. Antes de uma decisão, cada repositório deverá receber uma ficha com propósito, licença, arquitetura, segurança, manutenção, valor, sobreposição, custo de integração e risco.

| Tipo de capacidade | Decisão preliminar | Regra de integração |
|---|---|---|
| `awesome-*`, cookbooks e quickstarts | `INSPIRE` | Conhecimento e padrões; não runtime nem dependência |
| Memory providers | `ADAPT` ou `ISOLATE` | Avaliar lifecycle/retrieval; usar `MemoryProvider`; não criar segundo banco de memória |
| Code retrieval/context | `ADAPT` ou `INSPIRE` | Reforçar retrieval/context assembly sem duplicar Git Nexus |
| Routers/model fallback | `ADAPT` | Integrar na abstração `AIProvider`; sem provider automático no Core |
| GitNexus e grafos | `USE` apenas após auditoria de fronteira | Usar capacidade através do contrato Git Nexus existente; não copiar internals |
| MCP, n8n e plugins | `DEFER` | Só depois de manifest, permissions, sandbox, version, health e audit |
| Sandboxes/containers | `ISOLATE` | Somente como infraestrutura isolada; nunca executar código arbitrário na superfície principal |
| Repositório sem licença compatível, abandonado ou vulnerável | `REJECT` ou `ISOLATE` | Não vendorizar; registrar a razão |

A decisão preliminar não é aprovação de integração. O próximo artefato específico deverá ser um **Project Registry** com fichas individuais, começando pelos candidatos que resolvam uma lacuna já priorizada.

## 6. Local-only, protótipo e produção

O ledger Billing in-memory, o harness de RLS/PostgREST, os transportes fake de Spotify, fixtures de Wiki e fallback sem Supabase são úteis para testes, mas são `LOCAL_ONLY`. O JARVIS com OpenClaw, notícias, Spotify externo, WhatsApp e automações de impacto continua sujeito a permissões, opt-in, kill switch, auditoria e confirmação humana; não há autorização para envio ou publicação automática.

A presença de interfaces, tipos ou contratos não significa que a capacidade esteja estável. Cada item deve ser marcado como `prototype`, `stub`, `mock`, `planned`, `experimental`, `beta` ou `stable` conforme evidência real.

## 7. Ordem recomendada depois da 1.2.0

1. Atualizar e publicar este mapa e a matriz no SHA da release, preservando os relatórios históricos.
2. Auditar `GEN-TS-002` e demais scripts Node/TypeScript sem ampliar o escopo para grandes refactors.
3. Reavaliar `feature/login-cadastro` na main atual, com testes de cadastro, login, logout, recuperação, refresh, OAuth, Supabase ausente, autorização e RLS.
4. Fechar um piloto de Module Registry com health, fallback, quarentena e papel server-side claramente separados da UX local.
5. Definir o staging Supabase e executar uma revisão de migration, RPC, RLS, rollback e observabilidade antes de qualquer write remoto Billing.
6. Criar o Project Registry e auditar os repositórios externos por capacidade, licença e sobreposição; nenhuma integração automática.
7. Só depois selecionar um vertical slice completo e pequeno conectando Core, Data/Evidence, módulo, superfície, testes e observabilidade.
8. Preparar benchmarks de boot, rotas, eventos, JARVIS, busca, banco e memória antes de afirmar performance.

## 8. O que não deve ser alterado nesta fase

Não devem ser criados um segundo Core, Event Bus, Storage, Permission Manager, memória global ou autenticação paralela. Não devem ser ativados service role, provider financeiro, cobrança real, WhatsApp, venda, publicação automática, filesystem com escrita, targeting operacional, interceptação submarina, vigilância encoberta ou qualquer integração externa sem contrato, segurança, auditoria e aprovação adequados.

A V1, o router, os wrappers de compatibilidade, o mapa Nexus, o Service Worker versionado e os gates verdes da release não devem ser reescritos por estética. A existência de dezenas de fases no prompt não justifica uma alteração grande no `main`.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Plano 01"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/docs/v2/GEN_TS_001_FIX.md "GEN-TS-001 — Fronteira Node/TypeScript"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/430 "Issue #430 — Verificação especializada e integrador"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/454 "Issue #454 — AEGIS Ocean dual-use governance"
[7]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.0 "Release v1.2.0"
