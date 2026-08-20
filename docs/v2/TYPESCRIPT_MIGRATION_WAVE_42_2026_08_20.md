# TypeScript Migration Wave 42 — Nexus Core Page Consumers

**Data:** 20 de agosto de 2026

**Branch de entrega:** `main`

**Status:** gates locais concluídos; pronta para commit e publicação

**Autor:** Manus AI

## Objetivo

A Wave 42 promove os quatro dynamic imports de páginas canônicas TypeScript que ainda eram carregados por wrappers `.js` no Núcleo Nexus e no Cockpit Nexus: `git-nexus`, `gerar-codigo`, `seguranca` e `ia-proprietaria`.

Os imports agora usam specifiers extensionless nos arquivos TypeScript, conforme o contrato do projeto. As implementações `.ts` já existiam e os wrappers `.js` continuam preservados para compatibilidade incremental com consumers JavaScript.

> **Contrato promovido:** `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts` resolvem diretamente `git-nexus.ts`, `gerar-codigo.ts`, `seguranca.ts` e `ia-proprietaria.ts` por dynamic imports sem `.js` e sem `.ts` no caminho.

## Arquivos alterados

| Arquivo | Alteração | Motivo |
|---|---|---|
| `src/pages/git-nexus-cockpit.ts` | Quatro dynamic imports migrados para specifiers extensionless | Fazer o Cockpit carregar os módulos TypeScript canônicos |
| `src/pages/git-nexus-nucleo.ts` | Os mesmos quatro dynamic imports migrados | Manter Núcleo e Cockpit alinhados |
| `docs/nexus/dominios.json` | Registrados `src/pages/git-nexus.ts`, `src/pages/seguranca.ts` e `src/pages/ia-proprietaria.ts` | Sincronizar o mapa arquitetural com os consumers reais |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_42_2026_08_20.md` | Novo relatório | Registrar contrato, validação, correções e rollback |

`src/pages/gerar-codigo.ts` já estava registrado no Nexus e não recebeu uma entrada duplicada. Os wrappers `src/pages/git-nexus.js`, `src/pages/gerar-codigo.js`, `src/pages/seguranca.js` e `src/pages/ia-proprietaria.js` permanecem disponíveis para consumers JavaScript.

## Páginas afetadas e comportamento preservado

| Página | Superfície | Comportamento preservado |
|---|---|---|
| Git Nexus | Grafo, visualização de código e cockpit do Núcleo | Carregamento lazy, cena 3D, tabs e descarte continuam sob o contrato existente |
| Gerar Código | Geração e edição de código | A página continua lazy e mantém o contrato de renderização existente |
| Segurança | Painéis de segurança e shadow gate | A página continua usando as mesmas políticas e utilitários de segurança |
| IA Proprietária | Interface da IA proprietária | O módulo continua carregando sob demanda com suas fakes e contratos atuais |

A alteração não converte imports lazy em imports eager, não altera rotas do `src/main.js`, não muda nomes de export, não remove wrappers e não introduz novas chamadas de rede ou permissões.

## Auditoria e correção intermediária do Nexus

Na primeira execução dos gates rápidos, o `verificar-nexus` detectou duas divergências: uma duplicação de `src/utils/shadow-gate.js` e a ausência de dono para `src/pages/shadow.ts`. A causa foi uma substituição contextual ampla que encontrou o trecho de `seguranca.js` seguido por `shadow.ts` e deslocou a linha durante a tentativa de inserir `seguranca.ts`.

A correção foi localizada e mínima: `shadow.ts` foi restaurado na posição original e a entrada extra de `shadow-gate.js` foi removida. O bloco final voltou a coincidir com o estado publicado da Wave 41, acrescido somente de `seguranca.ts`. Após a correção, o Nexus passou com `99` rotas, `0` lacunas e `21/21` domínios. Nenhuma alteração funcional foi feita para contornar a falha.

Esse incidente está registrado aqui porque o objetivo dos relatórios é permitir rastrear não apenas o resultado final, mas também as falhas intermediárias e suas causas.

## Segurança e compatibilidade

A Wave 42 é uma promoção de fronteira de módulo. Não houve alteração de autenticação, autorização, RLS, Supabase, telemetria, fingerprint, geolocalização, PKCE, segredos, endpoint externo ou canal IPC.

Os wrappers `.js` não foram removidos. Essa decisão permite que consumers JavaScript ainda não migrados continuem funcionando enquanto os consumers TypeScript passam a usar as implementações canônicas. O tratamento de erro e o carregamento lazy do Núcleo/Cockpit também permanecem inalterados.

A alteração não promoveu `hx-beacon.ts`, `jarvis-repo-memory.ts`, `jarvis-spotify.ts` ou `jarvis-hermes-agent.js`. Essas fronteiras permanecem separadas por envolverem telemetria, memória remota, integração Spotify, PKCE, polling, segredo ou contrato de agente.

## Gates executados

Todos os gates abaixo foram executados na árvore final corrigida da Wave 42.

| Gate | Resultado | Observação |
|---|---:|---|
| `git diff --check` | PASS | Nenhum whitespace inválido |
| JSON do Nexus | PASS | `docs/nexus/dominios.json` válido |
| `npm run verificar-nexus` | PASS | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | PASS | TypeScript estrito sem erros |
| `npm run tipos:v2` | PASS | Contratos TypeScript da V2 sem erros |
| Contratos Supabase | PASS | 11/11 testes de contrato verdes |
| `npm test` | PASS | Suite completa verde |
| `npm run build` | PASS | Build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | PASS | 21/21 afirmações verdes |
| `npm run smoke` | PASS | 99/99 rotas verdes |
| `npm run caminho-critico` | PASS | 15/15 afirmações verdes |
| `npm run v2:runtime` | CONHECIDO | Exit 101 local por Cargo 1.75.0 e metadata `edition2024`; não mascarado |

O build continua exibindo os avisos conhecidos de chunks acima de 500 kB, especialmente Three.js e assets da Arma 3. Nenhuma configuração foi relaxada para esconder esses avisos.

## Resultado da integração V2

A integração V2 confirmou o boot do navegador, os cinco módulos, as sessões de Runtime, o Registry, o Platform, os incidentes de health, as rotas reais da V1, o manifesto, a view nativa, a cena 3D, o scheduler, as métricas, as permissões e o adaptador da V1. Resultado: `21/21`.

O smoke confirmou `99/99` rotas verdes. O caminho crítico confirmou boot, navegação, estado entre rotas, persistência de permissões através de reload e retorno à home com `15/15` afirmações verdes.

## Runtime Rust: limitação conhecida

O gate local `npm run v2:runtime` terminou com exit 101 porque o Cargo 1.75.0 não reconhece a feature `edition2024` exigida pela metadata da dependência `getrandom v0.4.3`. A falha pertence ao ambiente local, não foi causada pelos imports promovidos, não foi ocultada e não foi contornada com configuração permissiva.

## Rollback

O rollback deve usar revert normal no `main`, sem force push:

```bash
git revert <SHA_DA_WAVE_42>
git push origin main
```

O revert deve restaurar os oito imports `.js` dos dois consumers TypeScript e remover as três entradas novas do Nexus: `git-nexus.ts`, `seguranca.ts` e `ia-proprietaria.ts`. `gerar-codigo.ts` já fazia parte do mapa e não deve ser removido no rollback desta onda. As implementações TypeScript e wrappers JavaScript permanecem no repositório.

Após o revert, repetir `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Publicação

A publicação será feita diretamente no branch `main`. Antes do commit, será executado `fetch origin main`; qualquer avanço remoto será integrado com `git merge --no-edit origin/main`. Não será usada PR nem force push.

**SHA da Wave 42:** será preenchido após o commit.

## Próximo passo recomendado

Após o CI remoto da Wave 42 ficar verde, auditar os dynamic imports restantes em `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts`. A prioridade deve ser a próxima implementação `.ts` já existente e não sensível, mantendo wrappers para JavaScript e atualizando o Nexus no mesmo changeset.

As fronteiras de telemetria, memória remota, Spotify e agente Hermes devem continuar reservadas para auditorias específicas, sem promoção automática apenas para reduzir a contagem de arquivos `.js`.
