# Migração TypeScript — Wave 30

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover `immersive.ts`, `atmosphere.ts` e `scroll-progress.ts` nos consumers TypeScript do shell e das páginas flagship, sem alterar a montagem DOM, o auto-teardown WebGL/Spline, `prefers-reduced-motion`, listeners ou estilos.

> Esta onda é um retargeting de imports. Os três módulos canônicos já existiam em TypeScript; os wrappers JavaScript continuam no repositório para compatibilidade com consumidores ainda legados.

## Baseline e publicação

A Wave 30 partiu do fechamento documental da Wave 29 em `f3fd9235a9169fe41b2e7185a1d9fc037b51bbac`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `c37ce11a9343a247aaa572d46b22f20b82baaf3f` |
| Mensagem | `refactor(shell): promote typed immersive consumers` |
| Arquivos alterados | 30 |
| Consumers promovidos | 29 TypeScript |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contratos auditados

`immersive.ts` expõe `buildImmersiveHero(options)`, constrói a estrutura visual do herói, inicia o efeito WebGL ou fallback 2D, monta o Spline opcional, respeita `prefers-reduced-motion`, instala pointer tracking e observa a saída do elemento do DOM para destruir efeitos, Spline e listeners.

`atmosphere.ts` expõe `mountAtmosphere(root)`, evita montagem duplicada e acrescenta os elementos de aurora, raios, grid e vinheta. `scroll-progress.ts` expõe `mountScrollProgress()`, evita montagem duplicada, atualiza a barra por `requestAnimationFrame`, observa scroll/resize e reage a alterações do conteúdo principal.

| Módulo | Consumers | Fronteiras preservadas |
|---|---:|---|
| `immersive.ts` | 27 páginas flagship | WebGL/Spline, CTA, pointer tracking e auto-cleanup sem alteração |
| `atmosphere.ts` | `src/layout/shell.ts` | montagem única e estrutura visual sem alteração |
| `scroll-progress.ts` | `src/layout/shell.ts` | listeners passivos, RAF e progresso sem alteração |

Os wrappers `immersive.js`, `atmosphere.js` e `scroll-progress.js` continuam reexportando suas APIs públicas.

## Implementação

Os 27 imports TypeScript de `immersive.js` passaram a resolver `immersive.ts` extensionless. O shell passou a resolver diretamente `atmosphere.ts` e `scroll-progress.ts`. O mapa Nexus recebeu os três pares TypeScript no domínio `baluarte-shell`.

Nenhuma função foi reescrita, nenhum parâmetro foi alterado, nenhum listener foi adicionado ou removido e nenhum CSS foi modificado. Nenhuma rota foi adicionada, removida ou renomeada; o `src/main.js` não foi alterado nesta onda.

## Escopo mantido fora

Não foram tocados `helpers.js`, `hero-webgl.js`, `hero-rays.js`, `hero3d.js`, `spline-embed.js`, `theme`, WebGL engine, storage, Event Bus, Supabase/RLS, autenticação, Spotify, Hermes, WebLLM, OpenClaw ou Vercel. A constatação importante da auditoria foi que `helpers.ts` **não existe** neste repositório; por isso, ele não foi promovido nem tratado como TS-backed.

## Gates locais

Os gates foram executados após a promoção dos 29 consumers. Vite stale foi encerrado antes da integração. Os artefatos transitórios de smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 398 arquivos com dono |
| `npm run tipos:ts` | verde | shell e 27 páginas resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 8,68 s; apenas avisos conhecidos de chunks grandes |
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

O risco principal era resolução parcial do wrapper em um consumer ou alteração acidental do lifecycle dos efeitos. Os testes de tipos, build, smoke, caminho crítico, integração V2 e CI confirmaram a resolução canônica. O run Vigia original e um run agendado adicional do mesmo SHA terminaram ambos com sucesso.

O rollback é restaurar os 29 imports para `.js`, remover as três entradas TypeScript adicionadas ao mapa Nexus e publicar um commit normal no `main`. Não é necessário apagar implementações TS, alterar WebGL, desabilitar cleanup, relaxar `strict` ou reverter histórico.

## CI remota

A execução remota principal foi disparada para o SHA curto `c37ce11a`. Os oito workflows terminaram com sucesso; o Vigia também teve um run agendado adicional no mesmo SHA, igualmente verde.

| Workflow | Run principal | Resultado |
|---|---:|---|
| CI | `32339394489` | success |
| Core CI | `32339394492` | success |
| V2 Core | `32339394536` | success |
| V2 Runtime | `32339394539` | success |
| V2 Validation | `32339394474` | success |
| Vigia das rotas | `32339394443` | success |
| Arma 3 Data CI | `32339394553` | success |
| CodeQL | `32339394509` | success |

| Run adicional do Vigia | SHA | Resultado |
|---:|---|---|
| `32339577081` | `c37ce11a` | success |

Os avisos do Vigia sobre Node 20 forçado para Node 24 são informativos do workflow e não representam falha desta onda.

## Critério de conclusão

A Wave 30 está encerrada: shell e 27 páginas flagship resolvem os módulos TypeScript canônicos de hero, atmosfera e progresso de rolagem; wrappers permanecem disponíveis; lifecycle visual e teardown foram preservados; gates locais passaram; e a CI remota confirmou todos os workflows aplicáveis sem regressão.

O próximo passo recomendado é inventariar outra fronteira realmente TS-backed. `helpers.js` não deve ser promovido por suposição, pois não possui par `helpers.ts` neste estado do repositório.

**Autor:** Manus AI

**SHA de implementação:** `c37ce11a9343a247aaa572d46b22f20b82baaf3f`.

**Data:** 2026-08-20.
