# V2 Master Prompt — Matriz de fases e estado atual

**SHA de referência:** `0b79ab7e470f3ac8d53de0ada340c6a08398bce3`  
**Data:** 2026-08-19  
**Critério:** uma fase só é `concluída` quando existe implementação, teste, documentação, validação e publicação na `main`. Uma documentação de intenção não é evidência de implementação.

## Resumo

O Projeto-Baluarte já possui uma fundação significativa: governança e documentação V2, Core inicial, Event Bus, Storage, permissões básicas, Runtime/Session/Bridge, integração V2, migração das páginas canônicas para TypeScript e automação diária. A baseline atual passa `tipos:ts`, `tipos:v2`, testes 960/960, build, integração 19/19, smoke 98/98 e caminho crítico 15/15.

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
| PHASE 8 — Testing Infrastructure | **Avançada** | 960/960, smoke 98/98, integração 19/19, caminho 15/15, offline 9/9 | Contratos Data/Evidence, auth/RLS, Runtime remoto e testes mensais |
| PHASE 9 — API Contracts | **Parcial avançada** | `.d.ts`, JSDoc V2, Runtime envelopes e contratos de módulos | Fechar contratos server-side, Evidence, auth, Module Registry e integrações |
| PHASE 10 — TypeScript Migration | **Concluída para páginas canônicas** | Inventário com zero páginas canônicas JS; wrappers preservados | Converter `login.js` da branch de identidade e avaliar utilitários/scripts fora do escopo de páginas |
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
| PHASE 23 — UX / UI Integration | **Planejada** | Shell/layout atual e proposta Command Shell Modular documentada | Implementar layout modular depois do slice fundacional estável |
| PHASE 24 — Documentation | **Parcial avançada** | README, roadmaps, onboarding, audits, releases, migration e daily report | ADRs dos próximos slices, contratos Data/Evidence, runbooks e changelog |
| PHASE 25 — V2 Stabilization | **Não iniciada** | Gates locais principais verdes | Incidentes, quarentena, rollback, módulos críticos e testes periódicos |
| PHASE 26 — V2 Release Candidate | **Não iniciada** | Release plan define critérios | Beta, app preview, auth, Data/Evidence, Runtime e checks externos verdes |
| PHASE 27 — V2 COMPLETE | **Não iniciada** | Nenhuma declaração válida ainda | Todos os critérios de `2.0.0`, documentação completa e testes mensais ativados |

## Próximo marco executável

O próximo incremento deve ser pequeno e reduzir uma causa raiz real antes de adicionar produto. O alvo recomendado é `GEN-TS-001`: os geradores `gen-catalogo-storage.mjs` e `gen-tabela-estabilidade.mjs` importam `src/core/permissions.ts` diretamente com Node ESM e falham com `ERR_UNKNOWN_FILE_EXTENSION`. O contrato deve ser corrigido sem mudar a política, sem gerar um segundo sistema e sem usar transpile/exclusão silenciosa.

Depois desse reparo, o marco seguinte é `L0 — Identidade Preview`: converter `feature/login-cadastro/src/pages/login.js` para `login.ts`, reaplicar a mudança sobre a main atual, validar Auth/RLS/redirect/logout e publicar somente com os gates correspondentes.

A escolha de corrigir primeiro `GEN-TS-001` em vez de iniciar o layout ou OpenClaw é deliberada: o prompt exige que a fundação, os verificadores e as causas raiz sejam estabilizados antes de ampliar o número de módulos. O layout, app, JARVIS pesado, OpenClaw, notícias e PokeDesk permanecem no roadmap, mas não devem ser implementados como atalhos antes do primeiro vertical slice completo.

## Regras de transição

Cada próximo marco deverá criar uma branch de trabalho, alterar poucos arquivos, adicionar teste, rodar gates, atualizar documentação, gerar relatório, integrar na `main`, verificar novamente o SHA publicado e registrar rollback. Falhas externas de Rust, Supabase, Vercel ou GitHub deverão aparecer como `unknown/external` quando não houver evidência suficiente.

Nenhum módulo externo poderá enviar WhatsApp, publicar conteúdo, executar venda, alterar anúncio ou modificar dados externos sem confirmação explícita do operador. Nenhum papel elevado poderá ser decidido por `localStorage`, query string ou metadata editável pelo cliente.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Plano 01 — Fundação, Hardening e Transição V1 → V2"

[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Plano 02 — Wiki Project Zomboid na V2"

[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Plano Mestre V2 — Construção, Integração e Evolução Contínua"
