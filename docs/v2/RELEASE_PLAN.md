# Plano de releases do Projeto-Baluarte

**Documento de planejamento:** os marcos abaixo são propostas de release, não declarações de que uma versão já foi publicada.

## 1. Princípio de release

Uma release só pode ser promovida quando o código correspondente ao SHA auditado tiver evidência reproduzível. “Mergeable” no GitHub não é suficiente. Cada promoção deve registrar o SHA, os gates executados, os checks externos, as migrações de dados e os riscos conhecidos.

A V1 continua sendo a linha de referência enquanto a V2 é construída. A migração de páginas para TypeScript preserva wrappers `.js`, portanto a melhoria de tipagem não deve quebrar as rotas antigas.

## 2. Trilhas e marcos

| Marco | Objetivo | Critérios de entrada | Critérios de saída |
| --- | --- | --- | --- |
| `1.0.0` — linha histórica pulada | Marco de congelamento planejado, não publicado como release pública | ADRs históricos preservados para rastreabilidade | Não promover uma tag pública `v1.0.0`; o próximo marco público é `1.1.0` |
| `1.1.0` — Identidade + fundação V2 | Entregar a primeira release pública posterior ao salto, com identidade estabilizada e contratos V2 iniciais | `feature/login-cadastro` convertida para TS; gates V1 verdes; Evidence e Billing Foundation cobertos por testes | Testes de auth, versão, Service Worker, build, smoke, integração V2 e documentação de atualização; nenhum segredo; V1 sem regressão |
| `1.1.5` — Contratos V2 e experiência JARVIS | Consolidar Auth/OAuth/ownership, Billing Foundation, Registry Health/Fallback, presença musical e dashboard JARVIS | Main sincronizado; contratos locais verdes; Service Worker e launcher alinhados; CI remoto sem falhas novas | `tipos:ts`, `tipos:v2`, testes, build, smoke, caminho crítico, V2 Core/Runtime/Validation, Security Contracts, CodeQL e Vigia verdes; release notes e rollback publicados |
| `1.2.0` — Frontend TypeScript incremental | Consolidar as Waves 23–35, promover utilitários TypeScript e manter V1 funcional durante a construção da V2 | Wave 35 publicada no `main`; versão, Service Worker, README e changelog alinhados; CI remota verde | Nexus sem lacunas, tipos V1/V2, testes, build, integração V2 `21/21`, smoke `99/99`, caminho crítico `15/15` e oito workflows remotos verdes |
| `2.0.0-alpha.1` — Frontend TypeScript | Consolidar a migração para TypeScript e preservar wrappers | Inventário com zero páginas canônicas JS em `src/pages` | `tipos:ts` verde, inventário atualizado, páginas comportamentais e smoke completo |
| `2.0.0-alpha.2` — Contratos V2 | Fechar o gate JSDoc/checkJs e runtime de contratos | `ROOT-TYPES-001` resolvido por famílias, sem `any` ou exclusões | `tipos:v2` verde no mesmo SHA; CI, V2 Core e V2 Validation verdes; testes V2 sem cascata |
| `2.0.0-beta.1` — Primeiro vertical slice | Conectar Runtime, Core, Data, módulo e superfície | Core e Runtime verdes, RLS revisado, integração definida | E2E, integração, health/restart, session/transport/bridge e Supabase verdes |
| `2.0.0-beta.2` — Plataforma modular | Entregar módulos isoláveis, quarentena e papéis | Flags, permissões e diagnóstico server-side | Falha de um módulo não derruba página; developer/admin/owner veem diagnóstico autorizado; user recebe fallback neutro |
| `2.0.0-rc.1` — Protótipo de app | Expor a primeira experiência web/app minimamente estável | Beta sem bloqueios críticos e layout Command Shell Modular | Build web/desktop/mobile, onboarding/tutorial, auth e dados locais/offline verificados |
| `2.0.0` — V2 estável | Bater o martelo da V2 | RC aprovado e módulos prioritários concluídos | Todos os gates obrigatórios verdes, documentação completa e plano de teste mensal ativado |
| `2.1.0` — Operação mensal | Evoluir módulos com regressão periódica | V2.0.0 estável | Relatório mensal por módulo, incidentes, regressões e plano de manutenção publicados |

## 3. Dependências críticas

A release de identidade depende da branch `feature/login-cadastro`, mas essa branch ainda contém `src/pages/login.js`; ela precisa entrar no circuito de migração TypeScript antes de ser promovida. A release Alpha do frontend depende do inventário chegar a zero páginas canônicas JS. A Alpha de contratos depende da correção de `ROOT-TYPES-001`, atualmente representada por 61 diagnósticos reproduzidos em `tipos:v2`.

A Vercel e o Supabase são gates de entrega, mas falhas de rate limit ou ausência de log devem ser classificadas como incidentes operacionais, não corrigidas com alterações arbitrárias no produto. Nenhum release deve ser declarado verde com um check externo desconhecido.

## 4. Checklist por release

| Área | Pergunta obrigatória |
| --- | --- |
| Código | O SHA promovido é explícito e imutável no relatório? |
| Tipos | `tipos:ts` e `tipos:v2` passam nos marcos em que se aplicam? |
| Comportamento | `npm test`, smoke, integração e caminho crítico passam? |
| Runtime | Rust, E2E e protocolos de sessão passam? |
| Dados | SQL, RLS, migrações e dados gerados foram verificados? |
| Segurança | CodeQL, dependências de produção e ausência de segredos passam? |
| Deploy | Vercel e Supabase têm check identificável e não estão rate-limited? |
| Documentação | README, inventários, changelog, release notes e onboarding estão atualizados? |
| Operação | Existe rollback, quarentena de módulo e responsável pelo incidente? |

## 5. Regra de promoção

Se um gate raiz falha, os gates dependentes devem ser marcados como “bloqueados por causa raiz” e não como novos defeitos. Se o provedor externo falha por rate limit, a release fica em espera operacional, sem mudança de código. Se um teste comportamental falha, a promoção para e o relatório aponta arquivo, linha, função, causa, efeito e teste posterior.

## 6. Próximo release recomendado

O marco promovido é **`1.2.0 — Frontend TypeScript incremental`**, com a Wave 35 publicada no SHA `561aff89f90fac275d892ba0764cfdddd6c9a7bc` e a versão alinhada nos arquivos de runtime e documentação. O próximo release recomendado é **`2.0.0-alpha.1 — Frontend TypeScript`**, que só deve ser iniciado após inventário atualizado e plano explícito para os wrappers e contratos restantes. A fundação de Billing permanece sem cobrança real, a autorização server-side do Registry ainda depende de staging/RLS aprovado e nenhum provider externo é ativado automaticamente.
