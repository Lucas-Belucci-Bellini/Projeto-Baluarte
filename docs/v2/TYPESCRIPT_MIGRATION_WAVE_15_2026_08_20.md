# Migração TypeScript — Wave 15

**Status:** implementação concluída localmente; publicação aguardando commit após gates verdes.

**Objetivo:** promover `/visao`, `/jogos` e `/batalha-naval` para importação direta das implementações TypeScript, mantendo os wrappers `.js` como compatibilidade temporária e preservando a V1.

## Baseline

A Wave 15 parte do `main` em `30bb39d64a8811ffc30701b6eecc67d860e6cf3a`, igual a `origin/main`, com working tree limpo e a Wave 14 documentada em `docs/v2/TYPESCRIPT_MIGRATION_WAVE_14_2026_08_20.md`.

## Auditoria contratual

| Rota | Implementação TS | Export | Retorno | Contrato sensível | Decisão |
|---|---|---|---|---|---|
| `/visao` | `src/pages/visao.ts` | `visaoPage` | `HTMLElement` | permissões de câmera, CDN MediaPipe, RAF e descarte de streams | Promover; a implementação possui `cleanup()`, `stop()` por detector e tratamento de falha de CDN/câmera |
| `/jogos` | `src/pages/jogos.ts` | `jogosPage` | `HTMLDivElement` | login/registro local, hashing, progresso e ranking em `localStorage` | Promover; não é Auth Supabase nem autorização de servidor, e os contratos da engine JS são preservados |
| `/batalha-naval` | `src/pages/batalha-naval.ts` | `batalhaNavalPage` | `HTMLDivElement` | estado de jogo e aleatoriedade local | Promover; página síncrona, isolada e sem rede, sessão ou persistência externa |

### Visão

`visaoPage()` chama `cleanup()` antes de montar a tela. Os detectores de movimento, olhar e mãos e os filtros noturno, térmico e de clareza possuem ciclos de vida próprios, interrompem `requestAnimationFrame`, param tracks e tratam ausência de câmera ou falha de carregamento do MediaPipe. A promoção muda somente o resolvedor do módulo; não altera permissões de navegador nem transforma a câmera em dependência do boot.

### Jogos

O Arcade mantém a API pública `jogosPage()` e importa `players-engine.js`, `data/jogos.js` e os catálogos de Code Quest. A autenticação da tela é explicitamente local: nome e senha são processados pela engine, o hash é salvo sem senha em texto puro e a sessão/progresso ficam no armazenamento do navegador. Isso não concede permissões administrativas nem substitui Auth/RLS do V2. A promoção não muda nomes de storage, fluxo de `login`, `register`, `logout`, `awardScore`, `saveProgress` ou `leaderboard`.

### Batalha Naval

A página é um jogo local síncrono com tabuleiros 10×10, frota aleatória, turno do computador e toasts. Não possui `fetch`, Supabase, sessão, autorização ou ponte externa. Os botões de tabuleiro continuam no mesmo módulo e a implementação atual mantém rótulos `aria-label`, preservando a correção de acessibilidade registrada na auditoria anterior.

## Alteração implementada

No `src/main.js`:

```text
/visao          .js → .ts
/jogos          .js → .ts
/batalha-naval  .js → .ts
```

No domínio Nexus correspondente, as três origens foram atualizadas na mesma changeset de `src/main.js`. Os wrappers `src/pages/visao.js`, `src/pages/jogos.js` e `src/pages/batalha-naval.js` permanecem no repositório e não foram removidos.

## Gates

Os gates locais foram executados após a promoção. O resultado verificável é:

| Gate | Resultado | Evidência |
|---|---:|---|
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas e 21/21 domínios |
| `npm run tipos:ts` | verde | TypeScript estrito sem erro |
| `npm run tipos:v2` | verde | TypeScript V2 sem erro |
| `npm test` | verde | 1085 testes, 1085 pass, 0 fail, 0 skipped |
| `npm run build` | verde | build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes; relatórios transitórios restaurados antes do commit |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem ajuste artificial |

A validação funcional confirmou o boot V2, as rotas no router real, a navegação, o caminho crítico e a ausência de erros de JavaScript. O gate específico de câmera não solicita permissão no bootstrap porque `visaoPage()` apenas monta os controles; o acesso só começa no clique do usuário. O Arcade continua com visitante, login local e progresso no navegador. Batalha Naval permanece uma página síncrona e autocontida.

Antes da publicação, `git diff --check` passou e os relatórios de smoke gerados apenas por timestamp não entraram no commit. O gate local de runtime não foi mascarado; a CI remota com Rust estável continua sendo a autoridade para essa camada.

## Risco, rollback e segurança

O maior risco está em `/visao`, por lidar com recursos de câmera e scripts externos. O risco é mitigado pelo ciclo explícito de teardown existente e pela ausência de inicialização automática. O risco de `/jogos` é semântico: não confundir conta local do Arcade com Auth/RLS; nenhum privilégio V2 será derivado desse fluxo. `/batalha-naval` tem risco baixo e autocontido.

Rollback: restaurar as três extensões no router e as três origens Nexus para `.js`. Não excluir os módulos TypeScript nem os wrappers. Publicar qualquer reversão como commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 15 será concluída quando as três rotas carregarem diretamente os módulos `.ts`, Nexus e router permanecerem sincronizados, todos os gates comportamentais passarem, a CI remota verde for associada ao SHA correto e o relatório for fechado com SHA e limitações reais.

**Autor:** Manus AI
**SHA de implementação:** será preenchido após publicação.
**Data dos gates:** 2026-08-20T02:27Z–02:28Z.
