# TypeScript Migration Wave 43 — Nexus Gate and Arma 3 Extraction Panel

**Data:** 20 de agosto de 2026

**Branch de entrega:** `main`

**Status:** gates locais concluídos; pronta para commit e publicação

**Autor:** Manus AI

## Objetivo

A Wave 43 promove três fronteiras de página TypeScript que ainda eram carregadas por wrappers `.js`: o gate do Git Nexus e os dois módulos do Núcleo (`git-nexus-cockpit` e `git-nexus-nucleo`), além do painel operacional de extração da wiki Arma 3.

O `git-nexus-gate.ts` passa a carregar os módulos do Cockpit e do Núcleo por specifiers extensionless. O `arma3-tutorial.ts` passa a carregar `arma3-extracao-painel.ts` diretamente, preservando o carregamento sob demanda do painel pesado.

> **Contrato promovido:** imports lazy em arquivos `.ts` usam os módulos canônicos TypeScript sem `.js` e sem `.ts` no caminho, mantendo os wrappers JavaScript para compatibilidade incremental.

## Arquivos alterados

| Arquivo | Alteração | Motivo |
|---|---|---|
| `src/pages/git-nexus-gate.ts` | `git-nexus-cockpit.js` e `git-nexus-nucleo.js` promovidos para imports extensionless | Gate nativo carrega diretamente os módulos TypeScript canônicos |
| `src/pages/arma3-tutorial.ts` | `arma3-extracao-painel.js` promovido para import extensionless | Painel operacional usa a implementação TypeScript diretamente |
| `docs/nexus/dominios.json` | Registrados `arma3-extracao-painel.ts`, `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts` | Sincronizar o mapa Nexus com os arquivos realmente consumidos |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_43_2026_08_20.md` | Novo relatório | Registrar contrato, validação, riscos e rollback |

Os wrappers `src/pages/git-nexus-gate.js`, `src/pages/git-nexus-cockpit.js`, `src/pages/git-nexus-nucleo.js` e `src/pages/arma3-extracao-painel.js` permanecem no repositório para consumers JavaScript ainda não migrados.

## Comportamento preservado

### Git Nexus Gate

O gate continua verificando se o app nativo está disponível antes de materializar o Núcleo. Em navegador, a página continua exibindo o teaser app-only. No Launcher, o módulo escolhido por `ui=cockpit` continua sendo carregado lazy, enquanto o caminho padrão continua carregando o Núcleo. Falhas de carregamento continuam levando ao teaser de falha já existente.

A Wave 43 não altera a detecção `window.baluarte.native`, o contrato de `GitNexusModule`, as rotas, a cena 3D, o modo cockpit, as permissões ou a mensagem de fallback.

### Painel de extração Arma 3

A aba operacional `extrair` da página `arma3-tutorial.ts` continua carregando o painel apenas quando o usuário abre essa aba. O restante da wiki não paga o custo do painel no carregamento inicial. O container continua sendo limpo somente quando a aba ainda é a ativa, e erros continuam sendo convertidos para mensagem visível no painel.

A promoção não altera parsers, catálogo de dados, pipeline de extração, escrita de arquivos, permissões do Launcher ou contratos da wiki. Apenas muda a origem resolvida pelo dynamic import.

## Segurança e fronteiras

Esta onda não altera autenticação, autorização, RLS, Supabase, telemetria, fingerprint, geolocalização, PKCE, segredos, endpoints externos ou canais IPC. Não houve mudança em `src/main.js`, portanto não houve alteração de rota e a regra especial de sincronização com o Nexus para o entrypoint não foi acionada.

O painel Arma 3 continua separado do conteúdo de leitura e permanece lazy. O Gate Nexus continua restringindo a superfície pesada ao Launcher nativo. Os wrappers JavaScript permanecem disponíveis.

As fronteiras `hx-beacon.ts`, `jarvis-repo-memory.ts`, `jarvis-spotify.ts` e `jarvis-hermes-agent.js` continuam fora do escopo por exigirem auditorias próprias de telemetria, rede, memória remota, PKCE, polling, segredo ou contrato de agente.

## Gates executados

Todos os gates abaixo foram executados localmente sobre a árvore final da Wave 43.

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

Os avisos de chunks maiores que 500 kB continuam conhecidos e concentrados principalmente em Three.js e assets da Arma 3. Nenhuma configuração foi relaxada para silenciá-los.

## Resultado da integração V2

A integração V2 confirmou o boot do navegador, os cinco módulos, sessões de Runtime, saúde do Registry e Platform, incidentes de health, rotas reais da V1, manifesto, view nativa, cena 3D, scheduler, métricas, permissões e adaptador V1. Resultado: `21/21`.

O smoke confirmou `99/99` rotas verdes. O caminho crítico confirmou boot, navegação, estado entre rotas, persistência de permissões através de reload e retorno à home com `15/15` afirmações verdes.

## Runtime Rust: limitação conhecida

O gate local `npm run v2:runtime` terminou com exit 101 porque o Cargo 1.75.0 não reconhece a feature `edition2024` exigida pela metadata de `getrandom v0.4.3`. A falha é do ambiente local, não foi causada pelos imports, não foi escondida e não foi contornada com configuração permissiva.

## Rollback

O rollback deve usar revert normal no `main`, sem force push:

```bash
git revert <SHA_DA_WAVE_43>
git push origin main
```

O revert deve restaurar os três imports `.js` em `git-nexus-gate.ts` e `arma3-tutorial.ts` e remover as três entradas TypeScript adicionadas ao Nexus. As implementações `.ts` e wrappers JavaScript permanecem no repositório.

Após o revert, repetir `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Publicação

A publicação será feita diretamente no branch `main`. Antes do commit, será executado `fetch origin main`; qualquer avanço remoto será integrado com `git merge --no-edit origin/main`. Não será usada PR nem force push.

**SHA da Wave 43:** `f4d8987e0a9355b4d1539b01c8e9eaf8a79688a6`

## Próximo passo recomendado

Após o CI remoto da Wave 43 ficar verde, auditar os imports `.js` restantes nos arquivos TypeScript. As próximas fronteiras devem continuar sendo escolhidas por baixo risco e por existência de implementação `.ts` canônica, sem misturar migração com alteração de produto.

As fronteiras de telemetria, memória remota, Spotify e agente Hermes permanecem reservadas para auditorias específicas.
