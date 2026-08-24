# Migração TypeScript — Wave 32

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover `page-views.ts` nos três consumers comprovados — bootstrap V1, home e perfil — preservando guard por sessão, validação de rota, RPC `bump_view`, SELECT de métricas e fallback silencioso.

> Esta onda não modifica SQL, schema, RLS, credenciais, limites, sessionStorage ou o comportamento visual das métricas. É uma promoção de resolução para a implementação TypeScript canônica.

## Baseline e publicação

A Wave 32 partiu do fechamento documental da Wave 31 em `cd1a343bd1111ef5a29c17bba6753fc179426d60`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `50abaf5b1bba548deece5beabf8c61342032518` |
| Mensagem | `refactor(metrics): promote typed page views consumers` |
| Arquivos alterados | 4 |
| Consumers promovidos | 3 |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contrato auditado

`page-views.ts` implementa duas superfícies. `countPageView(route)` ignora Supabase indisponível, a rota raiz e rotas fora do regex permitido; depois usa `baluarte:viewed:<rota>` em `sessionStorage` para impedir duplicação por sessão e chama `dbRpc('bump_view', { p_route: route })` somente quando necessário.

`readPageViews(limit)` lê `site_stats` com `select=key,count&key=like.view:*&order=count.desc`, transforma linhas em `{ route, count }`, calcula o total e retorna `null` quando Supabase, resposta ou rede não estão disponíveis. O wrapper `page-views.js` continua reexportando as duas funções.

| Consumer | API promovida | Comportamento preservado |
|---|---|---|
| `src/main.js` | `countPageView` | contagem por rota no boot, sem alteração de chamada |
| `src/pages/home.ts` | `readPageViews` | métrica opcional `readPageViews(1)` |
| `src/pages/perfil.ts` | `readPageViews` | painel de métricas e fallback existentes |

## Implementação

| Arquivo | Alteração |
|---|---|
| `src/main.js` | `page-views.js` → `page-views.ts` |
| `src/pages/home.ts` | `page-views.js` → `page-views.ts` |
| `src/pages/perfil.ts` | `page-views.js` → `page-views.ts` |
| `docs/nexus/dominios.json` | Registro de `page-views.ts` no domínio Core |

Como `src/main.js` foi alterado, o mapa Nexus foi atualizado na mesma changeset. Nenhuma rota foi adicionada, removida ou renomeada.

## Escopo mantido fora

Não foram tocados `visit-counter.ts`, `supabase.ts`, migrations, SQL, RLS, service role, autenticação, `user-prefs`, Vercel, analytics externo, layout ou router. A Wave 32 não executou alterações de banco e não criou novas permissões.

## Gates locais

Os gates foram executados após a promoção. Vite stale foi encerrado antes da integração. Artefatos transitórios do smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 402 arquivos com dono |
| `npm run tipos:ts` | verde | bootstrap, home e perfil resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 8,81 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A falha local do Rust continua ambiental e não foi mascarada. O CI remoto usa uma toolchain compatível.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal era mudar a contagem de views por sessão ou a leitura dos agregados em home/perfil. A API, o guard, o regex de rota, o RPC, o SELECT e os fallbacks permaneceram no módulo canônico; tipos, build, smoke, caminho crítico, integração V2 e CI confirmaram a resolução sem regressão.

O rollback é restaurar os três imports para `.js`, remover `page-views.ts` da entrada adicionada ao Nexus e publicar um commit normal no `main`. Não é necessário alterar banco, RLS, sessionStorage, RPC, `strict` ou histórico.

## CI remota

A execução remota foi disparada para o SHA curto `50abaf5b`; todos os oito workflows terminaram com sucesso.

| Workflow | Run | Resultado |
|---|---:|---|
| CI | `32341279537` | success |
| Core CI | `32341279611` | success |
| V2 Core | `32341279855` | success |
| V2 Runtime | `32341279586` | success |
| V2 Validation | `32341279556` | success |
| Vigia das rotas | `32341279648` | success |
| Arma 3 Data CI | `32341279660` | success |
| CodeQL | `32341279789` | success |

Os avisos informativos dos workflows continuam sem relação com a alteração: Node 20 forçado para Node 24 e manutenção futura do CodeQL Action v3.

## Critério de conclusão

A Wave 32 está encerrada: bootstrap, home e perfil resolvem `page-views.ts`; wrapper JavaScript permanece disponível; guard, RPC, SELECT, fallback e Nexus foram preservados; gates locais passaram; e a CI remota confirmou os oito workflows sem regressão.

O próximo passo recomendado é continuar o inventário TS-backed em outra fronteira isolada, sem misturar mudanças de schema, RLS ou integrações externas.

**Autor:** Manus AI

**SHA de implementação:** `50abaf5b1bba548deece5beabf8c61342032518`.

**Data:** 2026-08-20.
