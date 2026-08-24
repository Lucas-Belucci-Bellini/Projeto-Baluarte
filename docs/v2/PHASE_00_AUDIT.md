# PHASE 00 AUDIT — Estado real da V2

**Audited commit:** `f64022766b477a311de0da55c23c19a2d1fedf84`  
**Branch:** `main`  
**Data/hora da auditoria:** 2026-08-19, aproximadamente 02:11–02:16 UTC  
**Status:** AUDIT AND BASELINE — esta fase não alterou código de produto, configurações de CI ou dependências. Foram criados apenas `docs/v2/BASELINE.md` e este relatório.  
**Objetivo:** transformar o prompt mestre em um mapa verificável de estado, causas raiz, efeitos cascata, lacunas arquiteturais e ordem de execução.

> A V2 não será considerada completa por quantidade de páginas. Ela só poderá ser declarada completa quando Core, módulos, contratos, dados, permissões, observabilidade, testes, segurança, documentação e publicação atenderem aos critérios do roadmap e houver evidência no mesmo SHA.

## 1. Repository state

O repositório local está na branch `main`, sincronizado com `origin/main` no SHA auditado, com working tree limpo na descoberta. A árvore contém frontend `src/`, Core V1/V2, `v2/runtime` em Rust, scripts Python para dados Arma 3, Supabase migrations, Android/Capacitor, desktop, backend auxiliares, documentação e workflows GitHub Actions. O projeto não é um protótipo isolado: é uma plataforma monorepo com superfícies de produção, experimentais e históricas coexistindo.

O `package.json` identifica a versão `1.0.0-rc`, projeto ESM, Vite, TypeScript incremental, Playwright/tsx, Three.js, Capacitor e scripts de validação. O README ainda descreve a V1 como referência e a V2 como reconstrução arquitetural. A migração de páginas canônicas para TypeScript está concluída no inventário, mas wrappers JS permanecem por compatibilidade.

## 2. Architecture state

A arquitetura atual possui uma separação prática entre a SPA V1 e a infraestrutura V2. A V1 registra 98 rotas, usa carregamento eager/lazy e possui fallback de 404 e de erro de chunk. A V2 contém Core de boot, ciclo, registry, plataforma, runtime/session/transport/bridge, módulos e integração browser. A documentação define a direção `Core → Module System → Data/Evidence → superfícies`, mas parte do modelo de módulo ainda é especificação e não uma unidade operacional uniforme para todas as 98 rotas.

A decisão arquitetural vigente é não criar um segundo repositório, segundo Event Bus, segundo Storage ou segundo Permission Manager sem justificativa. A V1 continua referência de comportamento e superfície; a V2 é uma reconstrução de contratos, isolamento e capacidade de expansão.

## 3. Core state

O Core já possui ou orquestra boot, ciclo, registry, plataforma, flags, permissões, storage, eventos, health e partes do Runtime. Os testes locais comprovam uma integração V2 funcional: 19/19 verificações passaram, incluindo cinco módulos, sessões de Runtime, rotas reais V1, manifesto, engine 3D, contexto, métricas e concessão/revogação de permissões.

A principal conclusão é positiva, mas limitada: o Core atual consegue sustentar o vertical slice existente; isso não prova que todos os módulos do produto já estejam registrados, isolados ou governados pelo mesmo manifesto operacional. O próximo trabalho deve ampliar o contrato comum, não criar uma camada paralela dentro das páginas.

## 4. Module state

Há um inventário operacional de 98 rotas e um modelo documentado de módulos com manifestos, dependências, permissões, lifecycle, health, fallback e estados `enabled`, `degraded`, `disabled`, `maintenance`, `experimental` e `quarantined`. A implementação atual já tem flags de estabilidade, gates de núcleo, lazy loading, recuperação de chunks e fallback de erro.

A lacuna é de cobertura e autoridade: a rota V1 ainda é a unidade visível mais direta, enquanto o Module Registry V2 precisa governar disponibilidade pública, health, circuit breaker, diagnóstico e recuperação sem depender apenas do cliente. O exemplo Wiki Arma 3 está documentado, mas a cobertura equivalente para todos os domínios e a persistência/auditoria server-side ainda precisam ser comprovadas.

## 5. Event Bus state

O catálogo gerado de eventos está em dia: 19 eventos e 8 namespaces. O Event Bus é exercitado por testes e é tratado no plano como sistema nervoso para comunicação assíncrona entre módulos. Essa é uma área a preservar.

A lacuna não é um erro atual demonstrado; é a necessidade de continuar ligando módulos novos a eventos versionados, com origem, timestamp, payload e contexto, sem catálogos manuais duplicados. A geração do catálogo deve permanecer gate independente.

## 6. Storage state

Existe uma camada de storage e uma política de esquemas/classificação, com catálogo documental e testes de persistência. O caminho crítico comprova escrita no editor, sobrevivência entre rotas, reload e revogação persistente de permissão. Offline passou 9/9 e a sonda de memória não encontrou acumulação de timer, loop ou áudio.

Foi observada uma falha de automação: `npm run gen-catalogo-storage -- --verificar` tenta importar `src/core/permissions.ts` diretamente pelo Node ESM, que não possui loader TypeScript. Isso é a causa raiz `GEN-TS-001`, compartilhada também pelo gerador de tabela de estabilidade. Não é evidência de corrupção dos dados ou do Storage em runtime; é incompatibilidade entre scripts Node e o estado migrado do Core.

A regra de dados continua: classificar origem, finalidade, sensibilidade, retenção, acesso e migração. Backup/exportação do dado do operador e uma camada plenamente trocável continuam itens de hardening/roadmap, não devem ser presumidos como concluídos.

## 7. Permissions state

O Core possui permissões com deny-by-default, capacidades de risco e testes de concessão/revogação. O caminho crítico confirma que `arsenal.read` pode ser revogada, sobreviver ao reload e ser reativada.

A documentação também registra a limitação importante: a autorização operacional de `developer`, `admin` e `owner` não pode depender de `localStorage`, query string, `user_metadata` ou decodificação local de JWT. A implementação server-side com perfil/claims e RLS ainda é uma dependência do sistema de identidade e do Module Registry operacional. Portanto, a existência de uma API de permissão no frontend não deve ser confundida com RBAC de produção concluído.

## 8. Auth state

A autenticação Supabase existente suporta sessão, Google/OAuth e operações de login/logout conforme a documentação atual. A branch `feature/login-cadastro` contém a nova superfície `/login`, mas não está incorporada ao `main` auditado. O bloqueador registrado é `src/pages/login.js` ainda ser uma página JavaScript canônica na branch, além da ausência de todo o conjunto de testes de signup, confirmação de e-mail, login inválido/válido, refresh expirado, logout offline, redirect Google e Supabase não configurado.

O próximo release recomendado é `1.1.0 — Identidade Preview`, mas ele não deve ser promovido antes da conversão de `login.js`, da validação real de sessão/RLS/redirects e dos gates de segurança. Senhas, service keys e papéis não podem entrar no bundle.

## 9. TypeScript migration state

O inventário publicado registra zero páginas canônicas JS restantes. A superfície foi migrada incrementalmente com implementações `.ts`, wrappers `.js` e contratos `.d.ts`, sem `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de strict. O gate `npm run tipos:ts` está verde.

A contagem física observada nesta auditoria é 99 arquivos `.js` e 107 `.ts` diretamente em `src/pages/`; o relatório agregado registra 142 wrappers, 156 implementações TypeScript e 171 declarações de fronteira. A diferença é de escopo: arquivos físicos incluem auxiliares/submódulos, enquanto o relatório agrega unidades definidas pelo inventário. Isso deve ser mantido explícito para não transformar duas métricas legítimas em uma inconsistência falsa.

A migração de páginas não encerra a migração do sistema: Core, scripts, utilitários legados, contratos JSDoc, login da feature e código experimental ainda precisam de decisões próprias.

## 10. Rust state

O Runtime Rust possui crate, biblioteca de protocolo, binário e testes de processo. O comando oficial é `npm run v2:runtime`. Nesta máquina o Cargo é `1.75.0`, não há `rustup`, não há `rust-toolchain` local e o `Cargo.lock` está no formato v4. O comando para antes da compilação com `lock file version 4 requires -Znext-lockfile-bump`.

A causa é classificada como `ENV-RUST-001 — toolchain local incompatível`, não como falha de produto demonstrada. O Runtime precisa ser validado no CI com o toolchain suportado antes de qualquer declaração de beta/RC. Não foi correto modificar o lockfile para fazer a máquina local passar.

## 11. Python state

A árvore `scripts/arma3/` contém parsers, verificadores, geradores de base, imagens, modelos e pipeline de dados. Os workflows/documentos anteriores registram os verificadores Arma 3 como camada própria. A auditoria PHASE 0 não reexecutou cada pipeline Python porque o objetivo imediato foi baseline dos gates principais; portanto, o estado detalhado de cada script Python deve continuar sendo confirmado pelo workflow correspondente, não presumido como verde apenas pela presença dos arquivos.

A regra operacional é que artefatos gerados sejam reproduzíveis, tenham fonte e não sejam alterados manualmente para satisfazer um gate.

## 12. Supabase state

O repositório contém migrations e contratos de segurança. A documentação histórica registra testes SQL/RLS verdes no snapshot anterior, mas essa auditoria não inventa um resultado remoto atual de Supabase: nenhum check atual foi executado nesta coleta para provar produção, preview ou isolamento real.

A principal lacuna continua sendo separar autenticação, autorização e disponibilidade de módulo, com `auth.uid()`, perfis/roles server-side e RLS. Qualquer falha futura de Supabase deve ser coletada pelo run e classificada como causa de código, migração, configuração ou indisponibilidade externa; não deve ser inferida a partir de ausência de log.

## 13. CI state

A main está sincronizada localmente com `origin/main`. Os gates locais TypeScript, testes, build, tipos V2, integração, smoke e caminho crítico estão verdes. O relatório diário coleta workflows por SHA e marca dados externos indisponíveis como `unknown`.

O histórico `CI_BOT_RELIABILITY_AUDIT_2026-08-15.md` estabeleceu a regra correta para bots: uma causa raiz deve ser agregada, efeitos cascata não devem ser contados como defeitos independentes, e rate limit de Vercel deve ser tratado como incidente externo. Essa regra permanece obrigatória.

## 14. Test state

A suíte comportamental passou 960/960, smoke passou 98/98, integração V2 passou 19/19, caminho crítico passou 15/15, memória passou sem acumulação e offline passou 9/9. O build Vite passou. O typecheck TypeScript e o gate JSDoc V2 passaram com zero diagnósticos.

O Runtime Rust ficou `unknown/local-blocked` por toolchain, e os geradores de storage/estabilidade ficaram vermelhos por `GEN-TS-001`. Esses resultados não devem ser apagados nem convertidos em verde por exclusão de scripts.

## 15. Security state

A auditoria encontrou 0 vulnerabilidades de produção no `npm audit --omit=dev --audit-level=high`. O audit completo encontrou 6 vulnerabilidades de desenvolvimento, 4 high e 2 moderate. A correção automática `--force` não deve ser executada sem análise porque pode atualizar Vite ou outras dependências com breaking changes.

A busca estrutural encontrou usos de `innerHTML`, `localStorage`, IndexedDB, APIs externas e mensagens de chaves de API. Isso é inventário de superfície de risco, não prova de vulnerabilidade em cada ocorrência. A próxima auditoria de hardening deve revisar sinks e sanitização por módulo, sem reescrever a V1 às cegas. Segredos de servidor não devem estar no frontend.

## 16. Performance state

A sonda de memória passou para Home, Cérebro, Rádio, Visão e Mapa: não observou acúmulo de timer, laço de animação ou áudio entre visitas. O heap foi explicitamente tratado como informativo, pois oscila com coleta de lixo.

O build ainda exibe warning histórico de chunks grandes. Não há medição suficiente nesta PHASE 0 para afirmar que JARVIS está mais leve ou que a plataforma atingiu metas de latência. O trabalho de otimização do JARVIS deve medir primeira resposta, duração, prompt, ferramentas, turnos, memória aproximada e fallback antes/depois.

## 17. Documentation state

README, plano mestre, regras, decisões, onboarding, issues consolidadas, roadmap completo, auditoria histórica, release plan, migração TypeScript, confiabilidade dos bots, automação diária e inventário modular existem. A baseline e esta auditoria foram adicionadas para cumprir o prompt mestre e ancorar o estado no SHA atual.

Há documentação histórica com SHAs antigos; ela deve permanecer histórica, mas novos relatórios precisam declarar explicitamente o SHA observado. O relatório diário foi ajustado para inspecionar o `origin/main` e o estado novo antes de enviar resumo.

## 18. Technical debt

As dívidas prioritárias são: compatibilidade dos geradores Node com imports TypeScript (`GEN-TS-001`); validação do Runtime com toolchain suportado (`ENV-RUST-001`); seis vulnerabilidades de desenvolvimento (`DEV-DEPS-001`); identidade/login-cadastro ainda fora da main; autorização operacional server-side/RLS; cobertura uniforme do Module Registry; backup/exportação e migração de dados; e a ausência de evidência atual de todos os checks remotos de Supabase/Vercel.

Nenhuma dessas dívidas deve ser resolvida com `any`, exclusões, downgrade de gates, alteração arbitrária de lockfile ou trust no cliente.

## 19. Broken contracts

O contrato quebrado reproduzido agora é `GEN-TS-001`: scripts Node `gen-catalogo-storage.mjs` e `gen-tabela-estabilidade.mjs` importam `src/core/permissions.ts` diretamente, mas são executados com `node`, sem loader TypeScript. O efeito é a falha dos dois verificadores, embora `tipos:ts`, testes de runtime da aplicação e catálogo de eventos passem.

`ENV-RUST-001` é uma fronteira de ambiente: Cargo antigo versus lockfile v4. A documentação histórica também contém famílias de contratos já tratadas, como ROOT-TYPES-001, mas a auditoria atual não reproduziu esses erros no `main`.

## 20. Duplicated systems

Não foi identificada nesta coleta uma segunda implementação ativa do Event Bus, Storage ou Permission Manager que deva ser criada ou removida imediatamente. O risco documentado é arquitetural: páginas e módulos legados ainda podem acessar mecanismos diretamente, enquanto o alvo V2 exige contratos do Core. Antes de qualquer nova abstração, deve-se procurar consumidores e justificar a mudança em ADR.

O sistema de relatório diário e o monitor de issues são automações separadas por responsabilidade; não devem ser fundidos em um novo daemon sem necessidade. O MCP/OpenClaw também deve permanecer uma camada independente e com confirmação explícita para efeitos externos.

## 21. Main branch risks

A main está saudável nos gates locais principais, mas os riscos de promoção são: declarar V2 completa apenas porque páginas foram migradas; promover identidade sem RLS e testes; chamar Runtime de verde sem toolchain/CI; transformar uma falha de gerador em alterações manuais no catálogo; confiar em role do cliente; executar `npm audit fix --force`; ou adicionar grandes módulos antes do primeiro vertical slice completo com Data/Evidence, permissões e observabilidade.

O risco de documentação também é real: métricas físicas e agregadas devem ser rotuladas, e referências históricas não devem ser apresentadas como estado atual.

## 22. Recommended phase order

A ordem recomendada, adaptada ao estado real, é:

1. **PHASE 0 — concluída documentalmente neste SHA:** baseline, auditoria, regras e riscos.
2. **PHASE 1 — Core/automação:** corrigir `GEN-TS-001` com uma solução suportada para scripts de verificação, adicionar testes do gerador e preservar os catálogos; disponibilizar toolchain Rust compatível no ambiente/CI sem editar o lockfile para mascarar a falha.
3. **PHASE 2 — Identidade Preview:** converter `feature/login-cadastro/src/pages/login.js` para TypeScript, reaplicar sobre a main atual, escrever testes auth/RLS/redirect/logout e rodar os gates completos.
4. **PHASE 3 — Module Registry operacional:** escolher um módulo piloto, preferencialmente Wiki Arma 3 ou Knowledge, e conectar manifesto, health, fallback, estado público, diagnóstico protegido e autorização server-side sem derrubar a V1.
5. **PHASE 4 — Data/Evidence vertical slice:** fechar entidade, fonte, versão, confiança, revisão, storage e superfície mínima com integração e observabilidade.
6. **PHASE 5 — JARVIS hardening:** medir baseline, reduzir briefing/histórico/ferramentas por demanda e manter deny-by-default, Hermes offline e confirmação para ações externas.
7. **PHASE 6 — Command Shell Modular e app preview:** somente após base mínima estável, com tutorial, fallback, auth, offline e testes de web/mobile.
8. **PHASE 7 — OpenClaw/MCP/notícias:** health e leitura primeiro; bridge protegido; drafts/simulação automáticos; WhatsApp, venda e publicação exigem confirmação explícita.
9. **PHASE 8 — Hardening, performance, segurança e documentação:** resolver dependências, medir, revisar sinks, executar CI remoto e atualizar ADRs/release notes.
10. **PHASE 9 — V2 Stabilization/RC/COMPLETE:** testes mensais por módulo, rollback/quarentena, checks externos identificáveis e declaração formal somente quando todos os critérios da release forem evidenciados.

A ordem não implementa o futuro inteiro agora. Ela fecha fundação, identidade e primeiro slice antes de adicionar superfícies grandes.

## Matriz de causas raiz versus efeitos

| ID | Causa raiz | Evidência | Efeitos/cascata | Próxima ação |
|---|---|---|---|---|
| `GEN-TS-001` | Geradores Node importam `.ts` sem loader | Dois comandos falham com `ERR_UNKNOWN_FILE_EXTENSION` | Storage/stability verification indisponíveis | Corrigir contrato script→fonte e testar ambos |
| `ENV-RUST-001` | Cargo local antigo para lockfile v4 | `cargo test` falha antes de compilar | Runtime local não validado | Usar toolchain suportado no CI/ambiente |
| `DEV-DEPS-001` | Vulnerabilidades apenas em dev deps | `npm audit` completo: 6 | Não afeta dependências de produção analisadas | Revisão controlada, sem `--force` |
| `AUTH-IDENTITY-001` | Login-cadastro ainda não migrado/integrado | Branch e documento de feature | Release 1.1.0 bloqueada | Converter login e validar Auth/RLS |
| `MODULE-RBAC-001` | Manifesto/role client-side não é autoridade server-side | Gap documentado no inventário | Diagnóstico/quarentena não pode ser promovido sem RLS | Piloto de Module Registry com backend |

## What must not be changed without new evidence

Não alterar os gates verdes da V1, Event Bus, catálogo de eventos, Runtime protocol, smoke, caminho crítico, storage core, política de permissões ou scripts de CI apenas para reduzir sintomas. Não criar segundo registry/event bus/storage/permission manager, não confiar em `localStorage` para role e não publicar OpenClaw/WhatsApp/vendas sem confirmação explícita.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Plano 01 — Fundação, Hardening e Transição V1 → V2"

[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Plano 02 — Wiki Project Zomboid na V2"

[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Plano Mestre V2 — Construção, Integração e Evolução Contínua"

[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório principal do Projeto-Baluarte"
