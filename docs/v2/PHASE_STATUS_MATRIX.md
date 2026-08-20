# V2 Master Prompt — Matriz de fases e estado atual

**SHA de referência:** `1032437c93b686e7ec574ebf489c236cacd892ea`
**Data:** 2026-08-20
**Critério:** uma fase só é `concluída` quando existe implementação, teste, documentação, validação e publicação na `main`. Uma documentação de intenção não é evidência de implementação.

## Resumo

O Projeto-Baluarte já possui uma fundação significativa: governança e documentação V2, Core inicial, Event Bus, Storage, permissões básicas, Runtime/Session/Bridge, integração V2, migração das páginas canônicas para TypeScript, fronteira Node/TypeScript dos geradores e automação diária. A baseline corrente passa `tipos:ts`, `tipos:v2`, testes 1085/1085, build, integração 21/21, smoke 99/99 e caminho crítico 15/15.

Isso ainda não equivale à V2 completa do prompt mestre. Permanecem pendentes o vertical slice completo com Data/Evidence e observabilidade de produto, Module Registry operacional uniforme, identidade/login-cadastro integrada com RLS, validação Runtime em toolchain compatível, hardening de segurança, layout Command Shell Modular, app preview, JARVIS medido/otimizado, bridge OpenClaw/MCP protegido, notícias com proveniência, testes mensais e critérios de RC/COMPLETE.

## Matriz de fases 0–27

| Fase do prompt | Estado | Evidência atual | Lacuna para conclusão |
|---|---|---|---|
| PHASE 0 — Audit and Baseline | **Concluída neste marco** | `PHASE_00_AUDIT.md` e `BASELINE.md` publicados na main | Manter baseline atualizada após mudanças relevantes |
| PHASE 1 — Core Foundation | **Parcial avançada** | `v2/core`, boot, ciclo, plataforma, contratos e testes V2 | Consolidar contratos restantes, diagnóstico e limites de Core |
| PHASE 2 — Module System | **Parcial** | Registry, manifests e integração de módulos existentes | Cobertura operacional uniforme, estados, quarentena e fallback por módulo |
| PHASE 3 — Event Bus | **Parcial avançada** | Event Bus testado; catálogo automático com 19 eventos/8 namespaces | Versionamento, descoberta de dependências e cobertura de módulos externos |
| PHASE 4 — Data Layer | **Parcial** | Storage, política de esquemas, catálogos e persistência local | Camada de dados comum, migrações/backup e contratos de entidades |
| PHASE 5 — Permission System | **Parcial avançada** | Deny-by-default, permissões e concessão/revogação testadas | RBAC server-side, roles protegidos e RLS para operações administrativas |
| PHASE 6 — Configuration | **Parcial** | Configuração e flags existentes no Core | Fonte única, versionamento, diagnóstico e configuração de módulos |
| PHASE 7 — Observability | **Parcial** | Health, métricas, snapshots e sonda de memória | Telemetria consistente por módulo, incidentes, retenção e dashboards operacionais |
| PHASE 8 — Testing Infrastructure | **Avançada** | 1085/1085, smoke 99/99, integração 21/21, caminho 15/15, offline 9/9 | Contratos Data/Evidence, auth/RLS, Runtime remoto e testes mensais |
| PHASE 9 — API Contracts | **Parcial avançada** | `.d.ts`, JSDoc V2, Runtime envelopes e contratos de módulos | Fechar contratos server-side, Evidence, auth, Module Registry e integrações |
| PHASE 10 — TypeScript Migration | **Concluída para páginas canônicas** | Inventário com zero páginas canônicas JS; 115 wrappers preservados; consumers TypeScript de páginas promovidos nas Waves 39–43 | Avaliar utilitários sensíveis, scripts externos ao Vite e remover wrappers somente quando o grafo legado permitir |
| PHASE 11 — Vertical Integration | **Parcial** | V2 browser integration 19/19 conecta Core, módulos, Runtime Session e router | Primeiro slice completo com Data + Evidence + permissão + observabilidade + superfície |
| PHASE 12 — JARVIS Foundation | **Parcial avançada** | JARVIS, WebLLM, Hermes, voz, memória e contratos presentes | Medir/otimizar, Tool Registry, permission boundaries e fallback documentado |
| PHASE 13 — Wiki Infrastructure | **Parcial** | Wiki Arma 3 e inventário; contrato de Wiki documentado | Wiki Project Zomboid/Evidence Layer, ingestão, proveniência e revisão |
| PHASE 14 — Project Integration | **Parcial planejada** | Projetos conectados e roadmap Nexus | Contratos externos estáveis, adapters e integração verificável |
| PHASE 15 — IDE Foundation | **Parcial avançada** | Editor, terminal virtual, Git helper e testes V1 | Isolamento formal de execução, extensões, projetos e integração V2 |
| PHASE 16 — 3D Foundation | **Parcial avançada** | Three.js, visor 3D, cena, modelos e integração 19/19 | Registry independente, health/quarentena e limites de recursos |
| PHASE 17 — Social Foundation | **Não iniciada como slice V2** | Mural/comms existem como superfícies V1 | Contrato de identidade, canais, moderação, storage e RLS |
| PHASE 18 — Sensors Foundation | **Experimental/parcial** | Radar, visão e GeoPulse existem como páginas | Sensor API, simulador, eventos e fusion desacoplados de páginas |
| PHASE 19 — App/Desktop Foundation | **Parcial de infraestrutura** | Capacitor/Android e desktop scaffoldados | App Preview testado, fallback, auth, offline, câmera/OCR e distribuição interna |
| PHASE 20 — Hardening | **Parcial** | Auditorias, flags, permissões e gates existentes | XSS/DOM/URL/upload/iframe/worker, secrets, dependências dev e Runtime CI |
| PHASE 21 — Performance | **Parcial inicial** | Sonda de memória sem acúmulo; warning de chunks conhecido | Benchmarks de JARVIS, carregamento, módulos pesados, CPU/memória e comparação |
| PHASE 22 — Security | **Parcial inicial** | Produção sem vulnerabilidades no audit; CodeQL histórico verde | RLS/RBAC atual, threat model, dependências dev, integração externa e revisão de sinks |
| PHASE 23 — UX / UI Integration | **Command Center read-only; editor bloqueado** | Shell/layout atual, [`PHASE_UI_DESIGN_SYSTEM.md`](./PHASE_UI_DESIGN_SYSTEM.md), contratos UI-01/UI-02/UI-03/UI-04, pilotos, gate de promoção e [`COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md`](./COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md) | Protótipo visual isolado no harness; depois observabilidade server-side, acessibilidade, claims, rollback e promoção controlada, sem trocar a sidebar global |
| PHASE 24 — Documentation | **Parcial avançada** | README, roadmaps, onboarding, audits, releases, migration, inventários, PHASE UI e daily report | ADRs dos próximos slices, contratos Data/Evidence, runbooks e changelog |
| PHASE 25 — V2 Stabilization | **Não iniciada** | Gates locais principais verdes | Incidentes, quarentena, rollback, módulos críticos e testes periódicos |
| PHASE 26 — V2 Release Candidate | **Não iniciada** | Release plan define critérios | Beta, app preview, auth, Data/Evidence, Runtime e checks externos verdes |
| PHASE 27 — V2 COMPLETE | **Não iniciada** | Nenhuma declaração válida ainda | Todos os critérios de `2.0.0`, documentação completa e testes mensais ativados |

## Próximo marco executável

O marco `GEN-TS-001` está resolvido e publicado. A auditoria `GEN-TS-002` confirmou que os geradores Node-safe passam diretamente e que não há outra importação direta de `.ts` em scripts executáveis que justifique uma correção imediata.

O marco `PHASE UI / UI-00` foi concluído como auditoria somente leitura; `UI-01` a `UI-04`, o piloto por módulo, o piloto individual do editor, o gate de promoção e o contrato Command Center foram implementados como contratos/projeções passivas em [`UI_01_NAVIGATION_CONTRACT_2026-08-20.md`](./UI_01_NAVIGATION_CONTRACT_2026-08-20.md), [`UI_02_AVAILABILITY_PILOT_2026-08-20.md`](./UI_02_AVAILABILITY_PILOT_2026-08-20.md), [`UI_03_REGISTRY_OBSERVATION_2026-08-20.md`](./UI_03_REGISTRY_OBSERVATION_2026-08-20.md), [`UI_04_CATALOG_RECONCILIATION_2026-08-20.md`](./UI_04_CATALOG_RECONCILIATION_2026-08-20.md), [`MODULE_ALIGNMENT_PILOT_2026-08-20.md`](./MODULE_ALIGNMENT_PILOT_2026-08-20.md), [`SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md`](./SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md), [`PROMOTION_GATE_EDITOR_2026-08-20.md`](./PROMOTION_GATE_EDITOR_2026-08-20.md) e [`COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md`](./COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md). O próximo marco é um protótipo visual isolado no harness; a sidebar global continua no fallback V1.

A escolha de iniciar com o inventário UI-00 antes de reavaliar Auth/RLS, OpenClaw ou PokeDesk é deliberada: a proposta visual precisa ser reconciliada com o Module Manifest, o Registry, as permissões e os estados de health antes de qualquer refactor amplo. A UI será auditada primeiro, mas a implementação do App Shell, do app preview, do JARVIS pesado, do OpenClaw, das notícias e do PokeDesk continua posterior ao primeiro vertical slice completo e às autoridades server-side.

## Regras de transição

Cada próximo marco deverá trabalhar sobre o checkout sincronizado com `main`, alterar poucos arquivos, adicionar teste quando houver mudança funcional, rodar gates, atualizar documentação, gerar relatório, integrar na `main`, verificar novamente o SHA publicado e registrar rollback. Falhas externas de Rust, Supabase, Vercel ou GitHub deverão aparecer como `unknown/external` quando não houver evidência suficiente.

Nenhum módulo externo poderá enviar WhatsApp, publicar conteúdo, executar venda, alterar anúncio ou modificar dados externos sem confirmação explícita do operador. Nenhum papel elevado poderá ser decidido por `localStorage`, query string ou metadata editável pelo cliente.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Plano 01 — Fundação, Hardening e Transição V1 → V2"

[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Plano 02 — Wiki Project Zomboid na V2"

[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Plano Mestre V2 — Construção, Integração e Evolução Contínua"
