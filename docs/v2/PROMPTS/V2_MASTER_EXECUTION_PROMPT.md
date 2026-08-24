# Baluarte V2 — Master Execution Prompt

> Documento operacional para Manus/Claude/Codex/Agentes de desenvolvimento. Este arquivo transforma o roadmap da V2 em um contrato executável por fases. O agente deve trabalhar incrementalmente, validar tudo e publicar cada fase na `main` somente quando os gates estiverem verdes.

## 0. MISSÃO

Reconstruir o Projeto-Baluarte V2 como uma plataforma modular, testável, observável, segura e preparada para crescer sem transformar a V1 em dívida arquitetural. A V1 é referência de comportamento e dados, não obrigação de linguagem ou arquitetura.

A V2 deve preservar a superfície estável da V1 enquanto cria uma arquitetura própria baseada em módulos, contratos, Data Layer, Evidence Layer, Event Bus, Task Manager, Knowledge Mesh, agentes de coleta, Risk Engine e interfaces modernas.

## 1. REGRA PRINCIPAL DE EXECUÇÃO

NUNCA tente construir a V2 inteira em uma única alteração.

Execute exatamente um slice/fase por vez:
1. inspecione o estado real do repositório;
2. leia as regras e decisões existentes;
3. identifique dependências;
4. escreva ou atualize o plano da fase;
5. implemente somente o escopo da fase;
6. crie testes antes ou junto da implementação;
7. execute todos os gates disponíveis;
8. corrija regressões;
9. atualize documentação e matriz de execução;
10. commit;
11. push para `main` somente após validação;
12. registre SHA, testes, limitações e próximo passo;
13. só então avance para a próxima fase.

Se uma fase não puder ser concluída com segurança, NÃO force o merge. Registre o bloqueio, preserve o estado funcional e pare naquele marco.

## 2. REGRAS DE OURO

- Não apagar comportamento V1 sem evidência e decisão documentada.
- Não introduzir dependência externa apenas porque parece conveniente.
- Não criar storage implícito dentro de módulos de UI.
- Não colocar segredos no frontend, Git ou documentação.
- Não coletar dados remotos durante testes determinísticos.
- Toda informação externa deve possuir proveniência.
- Dados importantes devem possuir identidade, versão/revisão, timestamp e origem.
- Módulos devem possuir lifecycle explícito: init/execute/dispose quando aplicável.
- Falha de um módulo não pode derrubar a V1 inteira.
- Não duplicar contratos em JavaScript, TypeScript, Python e Rust sem necessidade.
- Escolher a linguagem por responsabilidade, não por preferência.
- TypeScript: interface web e orquestração no navegador.
- Rust: runtime local futuro, parsers binários e operações de alto desempenho.
- Python: IA, coleta, automação e pipelines de dados quando fizer sentido.
- PostgreSQL/Supabase: persistência, tenancy, consultas e integridade.
- Tauri/Rust: aplicativo desktop quando chegar o momento.
- Qualquer decisão arquitetural relevante deve entrar no Decision Log/ADR.

## 3. GATES OBRIGATÓRIOS

Sempre detectar os scripts reais do `package.json` e usar os existentes. Quando disponíveis, executar no mínimo:

- `npm run tipos:ts`
- `npm run tipos:v2`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run v2:integracao`
- `npm run caminho-critico`
- `npm run prova-offline`
- `npm run sonda-memoria`
- `git diff --check`

Se algum comando não existir, registrar como `N/A`, nunca fingir que passou.

## 4. FASES

### PHASE 00 — Baseline, inventário e contrato V2

Auditar a árvore inteira, scripts, dependências, rotas, módulos, testes, documentação, branches e estado da V1. Confirmar que a V2 possui fronteira clara. Registrar baseline de testes e build. Criar/atualizar `MASTER_EXECUTION_MATRIX.md`.

Saída: baseline reproduzível, inventário e lista de riscos.

### PHASE 01 — Identity

Consolidar login, cadastro, sessão, logout, recuperação de acesso, estados de loading/error, proteção de rotas e contratos de identidade. Preparar tenancy sem vazar dados entre usuários/organizações. Não acoplar autenticação diretamente aos módulos de domínio.

### PHASE 02 — Evidence Layer

Consolidar `Evidence` como contrato central de proveniência. Toda claim deve ter identidade, claimKey, texto/valor, source URI, collectedAt, revision/version quando disponível, confidence, module/agent e lifecycle (`pending`, `verified`, `rejected`, `superseded`). Implementar validação, normalização, imutabilidade e append-only. O adapter de catálogo deve ser determinístico. Não adicionar rede ou storage implícito nesta fase.

### PHASE 03 — Wiki/Catalog Knowledge Ingestion

Criar schemas verificáveis para catálogos e Wiki. Começar com fixtures locais. Implementar parser/adapter determinístico, normalização, versionamento e vínculo automático com Evidence. Só depois de os fixtures passarem considerar ingestão remota controlada.

### PHASE 04 — Data Layer + PostgreSQL/Supabase

Projetar persistência real antes de implementá-la: entidades, índices, constraints, tenancy, auditoria, timestamps, idempotência, concorrência e políticas de acesso. Criar migrations versionadas. Implementar adapter de storage separado da UI. Nenhuma segunda fonte de verdade.

### PHASE 05 — Event Bus

Implementar eventos tipados, envelopes, correlationId, causationId, timestamp, source module, version e payload schema. Adicionar subscribe/unsubscribe, isolamento e testes de lifecycle. Evitar event bus global sem contrato.

### PHASE 06 — Task Manager / Orchestrator

Construir scheduler de tarefas com estado explícito, prioridades, retries, timeout, cancellation, idempotency key e observabilidade. Medir complexidade. Evitar O(n²) onde filas/índices podem resolver. Integrar com Event Bus sem criar ciclos ocultos.

### PHASE 07 — Knowledge Mesh

Conectar entidades, claims, fontes, revisões e relações. Definir IDs estáveis e tipos de relação. Permitir consultas por entidade, claim, fonte, módulo e confiança. Não introduzir embeddings até haver necessidade comprovada.

### PHASE 08 — OpenClaw/Data Hunter boundary

Criar contrato para agentes de coleta: task input, source policy, result, Evidence, confidence, provenance e failure. Agentes nunca escrevem diretamente na UI. Rede deve ser isolada, limitada, observável e desligável. Fixtures offline continuam sendo a base dos testes.

### PHASE 09 — Hermes/Calculation Engine

Separar regras de cálculo do frontend. Criar inputs/outputs versionados, unidades, precisão, arredondamento, explicabilidade e Evidence usada no cálculo. Toda decisão numérica importante deve ser reproduzível.

### PHASE 10 — Risk Engine

Implementar avaliação de risco baseada em sinais, evidências, confiança, impacto e incerteza. Nunca apresentar inferência como fato. Cada resultado deve explicar fatores e fontes. Criar testes de fronteira e regressão.

### PHASE 11 — Decision Lab / Scenarios

Construir cenários determinísticos: baseline, alternativa, hipóteses, impacto, evidências utilizadas e resultado. Permitir comparação de cenários sem alterar dados oficiais. Persistir versões quando aplicável.

### PHASE 12 — Interface V2

Evoluir Landing, Raio-X, Diagnóstico, Cenários, Plano e demais superfícies para consumir contratos reais. Separar componentes de apresentação de domínio. Implementar loading/error/empty states, acessibilidade, responsividade, performance e telemetria sem PII desnecessária.

### PHASE 13 — Observability

Adicionar logs estruturados, correlation IDs, métricas de tarefas, falhas, latência, ingestão, cache e storage. Não registrar segredos. Criar diagnóstico operacional sem expor dados sensíveis.

### PHASE 14 — Security & Privacy

Threat model completo. Revisar autenticação, autorização, tenancy, RLS, secrets, CORS, XSS, CSRF quando aplicável, SSRF em agentes, rate limiting, upload validation, prompt injection em dados externos e isolamento de ferramentas. Criar testes de segurança e documentação.

### PHASE 15 — Performance & Resilience

Benchmark de scheduler, eventos, parsing, consultas, UI e pipelines. Testar grandes volumes, concorrência, retry storms, falha de rede, storage indisponível e recuperação. Corrigir gargalos medidos, não otimizações especulativas.

### PHASE 16 — Desktop / Runtime Boundary

Preparar a arquitetura para Tauri/Rust sem contaminar a web. Definir IPC, permissões, filesystem boundary e runtime contracts. Implementar apenas quando a necessidade estiver validada.

### PHASE 17 — Billing / Plans / Entitlements

Criar domínio de planos independente da UI. Definir catálogo de planos, limites, features, quotas, status de assinatura, entitlement checks, período de cobrança, upgrade/downgrade, cancelamento e auditoria. Nunca confiar em flags do frontend para autorização. Preparar integração de pagamentos somente depois do domínio estar testado.

### PHASE 18 — Multi-tenant / Teams

Adicionar organizações, membros, papéis, convites, permissões e isolamento de dados. Testar que usuário A nunca acessa dados de B. Preparar colaboração futura sem quebrar o modelo individual.

### PHASE 19 — Admin / Operations

Painel operacional para saúde do sistema, tenants, tarefas, evidências, agentes, limites e incidentes. Ações destrutivas exigem autorização forte e auditoria.

### PHASE 20 — Production Hardening

Revisar build, deploy, migrations, rollback, backups, observabilidade, rate limits, custos, cache, cold starts, segurança e documentação. Criar checklist de release.

### PHASE 21 — V2 Release Candidate

Congelar contratos públicos. Rodar todos os gates. Executar testes de integração ponta a ponta. Fazer auditoria de documentação, dependências, licenças e segurança. Criar changelog e critérios de release.

### PHASE 22 — V2.0.0

Publicar tag/release. Congelar o baseline da V2. Registrar arquitetura final, migrações, rollback e compatibilidade. Depois disso, novas funcionalidades devem entrar por branches/ADRs sem alterar silenciosamente o contrato estável.

## 5. PROTOCOLO DE CADA FASE

Antes de editar:
- `git status`
- branch atual
- último commit
- diff local
- árvore relevante
- documentação da fase anterior
- testes existentes

Durante:
- implementar o menor slice vertical que demonstre valor;
- adicionar testes de contrato, integração e regressão;
- não misturar refactor sem relação com a fase;
- documentar decisões e limitações.

Depois:
- executar gates;
- revisar diff;
- verificar ausência de segredos;
- verificar que V1 continua funcional;
- atualizar matriz;
- registrar resultado.

## 6. POLÍTICA DE GIT/GITHUB

Cada fase concluída deve produzir um commit identificável. Preferir mensagens como:
`feat(v2): complete phase 03 wiki catalog ingestion`
`fix(v2): preserve evidence provenance during ingestion`
`docs(v2): record phase 03 gates`

Regra de publicação:
- nunca sobrescrever histórico;
- nunca force push;
- nunca apagar trabalho de outro agente;
- verificar divergência antes de push;
- publicar na `main` somente após gates verdes e diff revisado;
- se houver conflito, parar e reconciliar explicitamente.

## 7. DEFINITION OF DONE

Uma fase só está concluída quando:
- código implementado;
- testes relevantes implementados;
- testes passando;
- build passando;
- smoke/integration gates passando quando disponíveis;
- documentação atualizada;
- riscos e limitações registrados;
- matriz atualizada;
- commit criado;
- push realizado;
- SHA registrado;
- próximo slice definido.

## 8. FORMATO DO RELATÓRIO FINAL DA FASE

Sempre responder:

`PHASE XX — <nome>`

- Status: DONE/BLOCKED
- Objetivo
- Implementado
- Arquivos principais
- Testes
- Gates
- Commit SHA
- Impacto na V1
- Riscos/limitações
- Próxima fase

Nunca declarar sucesso sem evidência de comando/resultado.

## 9. INSTRUÇÃO FINAL AO AGENTE

Você não está sendo solicitado a produzir uma demonstração rápida. Você está construindo uma plataforma que deverá continuar funcionando quando houver muito mais módulos, usuários, dados e agentes.

Pense como arquiteto, engenheiro de software, engenheiro de dados, SRE e revisor de segurança ao mesmo tempo. Prefira contratos claros a atalhos, evidência a suposição, testes a confiança e mudanças pequenas a grandes reescritas cegas.

Comece pela fase atualmente pendente na matriz do repositório. Não reinicie fases já concluídas sem motivo. Não repita trabalho já publicado. Se encontrar uma inconsistência entre este documento e o código, audite primeiro e registre a decisão; não esconda a divergência.

**Objetivo final: Baluarte V2.0.0 — uma plataforma modular, observável, segura, testável, multi-tenant e preparada para evoluir para V2.x sem perder o controle arquitetural.**
