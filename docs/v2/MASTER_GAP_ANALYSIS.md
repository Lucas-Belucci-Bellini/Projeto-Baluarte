# Baluarte V2 — Master Gap Analysis

**Status:** `IN PROGRESS`
**Data da observação:** 2026-08-19
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `2f660dc6fe0b9676cab2b0fa4dfe8bf5400b181f`
**Working tree:** limpo

> Este documento responde ao primeiro checkpoint do Master Super-Prompt. Ele descreve o que foi observado no código e nos gates; não transforma intenção de roadmap em implementação nem inventa validação externa.

## 1. Resumo executivo

O Projeto-Baluarte está em uma condição de **fundação V2 ativa e verificável**, não de V2 completa. A V1 continua funcional e os gates principais estão verdes no SHA observado. A migração das páginas canônicas para TypeScript está concluída no inventário atual, mantendo wrappers JavaScript por compatibilidade. O Core, Event Bus, Runtime Session, Evidence Layer, Billing Foundation local/read-only e a presença musical do JARVIS possuem contratos e testes relevantes.

Os maiores gaps não são uma ausência geral de código; são fronteiras ainda não comprovadas em ambiente real. Os principais bloqueadores são autorização server-side/RLS ainda não validada em staging, Auth/login-cadastro fora do fluxo de promoção, Runtime Rust localmente bloqueado por Cargo incompatível, geradores Node/TypeScript com contrato de execução quebrado e ausência de evidência de persistência remota transacional.

A regra operacional é manter a próxima entrega pequena. A primeira ordem recomendada após este mapa é corrigir `GEN-TS-001`, depois reavaliar a feature de identidade, e somente então promover o piloto operacional do Module Registry e a validação remota do Billing.

## 2. What exists?

| Área | Evidência atual | Estado |
|---|---|---|
| V1 | SPA, rotas, wrappers e fallback de erro/chunk | Funcional nos gates observados |
| TypeScript | Implementações `.ts`, strict gate, wrappers `.js`, contratos `.d.ts` | Migração de páginas canônicas concluída; migração sistêmica continua |
| Core V2 | Boot, ciclo, registry, plataforma, permissões, health, runtime/session | Vertical slice funcional; cobertura total ainda não provada |
| Event Bus | Eventos versionados e catálogo gerado | 19 eventos / 8 namespaces observados |
| Storage | Persistência local, política e testes de reload/offline | Funcional localmente; backup/restore e geradores precisam hardening |
| Evidence | Contrato de fonte, timestamp, revision, confidence, provenance | Fundação implementada; lineage/grafo ainda incompletos |
| Billing | Catálogo, ledger, idempotência, transação local, drivers HTTP read/write e preflight | Read-only/local; staging real desativado |
| JARVIS | Contexto, presença musical, Spotify PKCE, refresh em memória e reação 3D | Fatias implementadas; tool registry/memória completa ainda não |
| CI | Oito workflows verdes no SHA `2f660dc6` | Saudável neste ciclo |
| Automação | Relatório diário e monitor de issues | Configurados; ações externas continuam sob confirmação |
| Desktop/mobile/3D | Superfícies e contratos parciais | Não equivalem a validação completa de distribuição |

## 3. What is incomplete?

A arquitetura de módulos ainda não governa uniformemente todas as páginas e superfícies. O Module Registry possui contratos e pilotos, mas a autoridade server-side para disponibilidade, health, quarentena e papéis ainda depende de Auth, Tenancy e RLS.

A autenticação `feature/login-cadastro` não deve ser considerada integrada ao `main` apenas porque existe em branch ou documentação. É necessário reavaliar a branch sobre a main atual e executar testes de cadastro, confirmação de e-mail, login válido/inválido, refresh expirado, logout offline, redirect OAuth e Supabase ausente.

A persistência Billing ainda é local/read-only de forma segura. A atomicidade de assignment + usage foi modelada no adapter in-memory, mas duas chamadas PostgREST independentes não substituem uma RPC ou transação PostgreSQL revisada. Não há provider financeiro ou cobrança real ativado.

A matriz completa de testes do Master Prompt ainda não existe como execução única. Há testes unitários, integração, smoke, caminho crítico e CodeQL, mas performance, acessibilidade, mobile, desktop, carga, restore e RLS remoto precisam de evidência específica.

## 4. What is duplicated?

Não foi encontrada evidência atual que justifique criar um segundo Event Bus, segundo Storage, segundo Permission Manager ou segundo sistema de autenticação. O risco é de consumidores legados acessarem caminhos diretos enquanto a V2 tenta consolidar contratos; isso requer análise de consumidores, não uma nova implementação paralela.

Os relatórios diário e de monitoramento de issues são automações distintas por responsabilidade e não devem ser fundidos sem necessidade. A integração Spotify e a presença musical local também não devem criar um segundo registro global de status; o contrato existente deve continuar sendo a fronteira única.

Documentações históricas com SHA antigo não são duplicação de estado: devem permanecer como evidência histórica, mas precisam declarar claramente que não representam o estado corrente.

## 5. What is broken?

| ID | Causa raiz | Evidência | Efeitos cascata | Classificação |
|---|---|---|---|---|
| `GEN-TS-001` | Scripts executados por Node importam `.ts` sem loader compatível | Geradores de catálogo de storage/estabilidade falham antes de executar | Verificadores desses catálogos ficam indisponíveis | Erro de contrato de automação |
| `ENV-RUST-001` | Cargo local `1.75.0` não lê `Cargo.lock` v4 | `npm run v2:runtime` pode parar antes da compilação local | Runtime local fica `unknown/local-blocked` | Limitação de ambiente, não causa de produto comprovada |
| `AUTH-IDENTITY-001` | Superfície login-cadastro ainda não está validada/promovida na main atual | Feature e documentação não equivalem a Auth/RLS testados | Release de identidade e RBAC de produção ficam bloqueados | Gap arquitetural |
| `MODULE-RBAC-001` | Estado/role no cliente não é autoridade server-side | Registry e permissões locais não provam RLS | Quarentena, admin/dev/owner e diagnóstico protegido não podem ser promovidos | Gap de segurança |
| `BILLING-REMOTE-001` | Não existe ainda uma transação remota comprovada para assignment + usage | Driver real permanece desligado por preflight | Billing write e provider financeiro ficam bloqueados | Bloqueio deliberado de segurança |

Os testes completos e os gates remotos verdes não eliminam esses gaps: eles provam o escopo que executaram. Não devem ser contados como falhas independentes os efeitos derivados de uma mesma causa raiz.

## 6. What is risky?

O maior risco de governança é declarar a V2 completa pela quantidade de código ou páginas migradas. O segundo é confiar em autorização local, `localStorage`, query string ou metadata do cliente para decidir acesso administrativo. O terceiro é conectar Supabase staging sem confirmar projeto, RLS, rollback, secrets server-side e observabilidade.

Também são riscos reais: usar `npm audit fix --force` sem revisão, editar artefatos gerados para satisfazer verificadores, alterar `Cargo.lock` para contornar o toolchain local, adicionar grandes features sem checkpoint, introduzir novos providers diretamente no Core e chamar automações externas sem approval/kill switch/audit.

O warning de chunks grandes do Vite é um risco de performance, não falha de build. O uso de wrappers JavaScript é dívida de compatibilidade controlada, não evidência de páginas canônicas JS restantes.

## 7. What is missing?

Ainda faltam ou precisam de formalização: `DEFINITION_OF_DONE.md`, `CONTRACT_POLICY.md`, `RELEASE_GATES.md` como artefatos consolidados; baseline corrente no SHA `2f660dc6`; RPC/transação remota Billing; RLS formal em staging; Auth/login-cadastro validado; piloto completo do Module Registry com quarentena; backup/restore drill; inventário de dados/LGPD; matriz de performance/acessibilidade/mobile/desktop; `verify:v2`; `doctor`; catálogo completo de APIs/módulos/health; e relatórios de fase no formato uniforme do Master Prompt.

A ausência de um artefato não autoriza construir uma plataforma inteira antecipadamente. Cada item deve ser puxado pela próxima fase válida, com escopo pequeno e consumidor identificado.

## 8. What is blocked?

| Blocker | Why | What is needed | Impact | Fallback |
|---|---|---|---|---|
| Runtime Rust local | Cargo não suporta lockfile v4 | Toolchain compatível no ambiente ou evidência CI | Não declarar runtime local verde | Usar CI remoto e registrar `unknown` local |
| Billing staging | Projeto, RLS, secrets e rollback não confirmados | Aprovação explícita, projeto staging e checklist | Sem writes/provider reais | Harness local + driver desligado |
| Auth preview | Login/RLS/redirects não validados na main corrente | Revisão da feature e testes completos | Release de identidade adiada | Manter V1 compatível |
| Role server-side | Perfil/claims/RLS ainda não comprovados | Contrato de Auth/Tenancy/RLS | Admin/dev/owner não podem ser autoridade de produção | Permissões locais apenas como UX/gate |
| Spotify externo real | Client ID e consentimento do usuário não fornecidos | Client ID público, redirect URI cadastrada e opt-in | Sem playback real fora do site | Fixtures e monitor mockado |

## 9. What is local-only?

São locais ou simulados: o harness de PostgREST/RLS do Billing, o ledger transacional in-memory, o driver HTTP sem ativação, os testes Spotify com transport fake, o estado musical local, os fixtures Wiki/Data e o fallback de ambiente sem Supabase.

Esses componentes são úteis e testáveis, mas não devem ser descritos como validação de produção, RLS remoto ou integração financeira real.

## 10. What belongs to V2?

Pertencem ao escopo atual: Core pequeno e modular, Module Registry, Event Bus, Data/Evidence, Auth/Tenancy/Permissions server-side, Billing Foundation desacoplada de providers, JARVIS com ferramentas autorizadas, observabilidade, segurança, documentação, testes, surfaces web/desktop/mobile conforme dependências e Wikis como módulos com provenance.

Também pertencem à V2 os contratos de integração com projetos externos, mas não a importação direta dos internals desses projetos. Cada integração deve ter adapter, API, eventos, versão, permissões e health.

## 11. What belongs to future versions?

Não deve ser implementado agora apenas por aparecer no Master Prompt: Baluarte OS completo, hardware control, vigilância arbitrária, agente autônomo irrestrito, ecossistema massivo de plugins, rede social completa, marketplace de terceiros sem sandbox, automação de vendas/publicação sem confirmação e infraestrutura de escala de produção sem benchmark/necessidade.

Essas áreas podem receber interfaces ou contratos quando desbloquearem uma fase real. A V2 deve preparar extensibilidade sem construir todo o futuro antecipadamente.

## 12. Root causes versus cascade effects

A matriz abaixo evita contar efeitos cascata como problemas independentes:

| Root cause | Effects not counted as independent root causes |
|---|---|
| `GEN-TS-001` | Falha do catálogo de storage e falha da tabela de estabilidade |
| `ENV-RUST-001` | Runtime local não executado; não é falha confirmada do protocolo Rust |
| `AUTH-IDENTITY-001` | Release de identidade, testes de login e RBAC de produção adiados |
| `MODULE-RBAC-001` | Quarentena/admin/diagnóstico server-side não promovidos |
| `BILLING-REMOTE-001` | Writes, checkout, subscription, invoice, webhook e provider financeiro adiados |

## 13. Ordem recomendada de correção

1. Atualizar a baseline corrente e manter a auditoria antiga identificada como histórica.
2. Corrigir `GEN-TS-001` com uma fronteira suportada entre scripts Node e TypeScript e adicionar testes dos geradores.
3. Reavaliar `feature/login-cadastro` sobre a main atual, sem promover sem Auth/RLS/redirect tests.
4. Fechar um piloto de Module Registry com health, fallback, quarentena e autorização server-side.
5. Validar Billing staging via RPC/transação e RLS formal.
6. Medir e endurecer JARVIS, ferramentas, memória e integrações externas.
7. Consolidar `verify:v2`, `doctor`, matriz de testes, performance e documentação.
8. Só depois considerar RC, estabilização e V2 complete.

## 14. Critério de conclusão desta análise

Esta análise é um artefato de planejamento, não uma declaração de V2 completa. A próxima fase deve atualizar a baseline no SHA corrente e só então implementar o primeiro item de correção priorizado, com contrato, testes, segurança, performance considerada, documentação, publicação no `main` e verificação pós-publicação.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório oficial"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação e transição V1 → V2"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Issue de Wiki / roadmap"
