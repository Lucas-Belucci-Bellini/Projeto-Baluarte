# Migração TypeScript — Wave 27

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover os utilitários puros `cor.ts` e `triangulation.ts` nos consumidores TypeScript já convertidos, mantendo matemática, tipos, wrappers JavaScript e superfícies de geolocalização/canvas estáveis.

> Esta onda altera somente a resolução de imports para módulos canônicos TypeScript. Não foram modificadas as fórmulas de cor, o solver de mínimos quadrados, o tracker de geolocalização, o canvas, o ruído gaussiano ou qualquer chamada externa.

## Baseline e publicação

A Wave 27 partiu do fechamento documental da Wave 26 em `433d5fad250f0dc1465bb12b3f6825b688072da3`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `2aadf976c91d474a5b0a82fb89bfa5389825d93a` |
| Mensagem | `refactor(utils): promote typed color triangulation` |
| Utilitários promovidos | 2 |
| Consumers alterados | 3 |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contratos auditados

`cor.ts` é um módulo matemático puro de conversão HEX/RGB/HSL/OKLCH e contraste WCAG. A página `/color-studio` usa essas funções em conversão, paleta, gradiente e verificação de contraste; a promoção não alterou nenhuma fórmula nem tipo público.

`triangulation.ts` é um módulo 2D puro. `triangulate()` calcula a interseção por mínimos quadrados, `bearingTo()` calcula rumo, `gaussianNoise()` gera ruído de demonstração e `dist()` calcula distância euclidiana. `/triangulacao` usa os helpers em seu canvas local; `/geo` usa apenas o tipo `Point2D` para projeção da trilha.

| Módulo | Consumer | Fronteira preservada |
|---|---|---|
| `src/utils/cor.ts` | `src/pages/color-studio.ts` | Matemática pura; sem DOM, rede, storage ou serviço externo |
| `src/utils/triangulation.ts` | `src/pages/triangulacao.ts` | Canvas local continua usando o mesmo solver e o mesmo ruído |
| `src/utils/triangulation.ts` | `src/pages/geopulse.ts` | Import é type-only; tracker e geolocalização não foram alterados |

Os wrappers `cor.js` e `triangulation.js` continuam reexportando exatamente os mesmos símbolos para consumidores JavaScript legados.

## Implementação

| Arquivo | Alteração |
|---|---|
| `src/pages/color-studio.ts` | Funções e tipos de `cor.js` passaram a resolver `cor.ts` extensionless |
| `src/pages/triangulacao.ts` | Funções e tipos de `triangulation.js` passaram a resolver `triangulation.ts` extensionless |
| `src/pages/geopulse.ts` | `Point2D` type-only passou a resolver `triangulation.ts` extensionless |
| `docs/nexus/dominios.json` | `cor.ts` e `triangulation.ts` adicionados aos domínios correspondentes |

Nenhuma rota foi adicionada, removida ou renomeada. O `src/main.js` não foi alterado nesta onda; a sincronização de rota não foi necessária.

## Escopo mantido fora

Não foram tocados `geo-tracker.ts`, MapLibre, storage, Supabase/RLS, fingerprint, WebGL, tema, autenticação, Spotify, Hermes, WebLLM, OpenClaw, memória, Vercel ou bridges externos. Os wrappers JS continuam no repositório para compatibilidade.

A próxima onda pode promover outros utilitários puros, mas módulos com geolocalização real, Supabase, persistência, WebGL ou integração externa exigem auditoria e testes próprios antes de qualquer retargeting.

## Gates locais

Os gates foram executados após a alteração. Vite stale foi encerrado antes da integração. Os artefatos transitórios de smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 393 arquivos com dono |
| `npm run tipos:ts` | verde | tipos e imports canônicos resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 8,73 s; apenas avisos conhecidos de chunks grandes |
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

O risco principal é uma resolução de módulo diferente da esperada em um consumer TypeScript, especialmente na coexistência de wrapper `.js` e implementação `.ts`. O TypeScript, build, smoke, integração V2 e caminho crítico cobrem a superfície pública; os wrappers permanecem como fallback.

O rollback é restaurar os três imports para `.js`, remover `cor.ts` e `triangulation.ts` das entradas adicionadas ao mapa Nexus e publicar um commit normal no `main`. Não é necessário apagar as implementações canônicas, mudar `strict` ou reverter histórico.

## CI remota

A execução remota foi disparada para o SHA curto `2aadf976`; todos os oito workflows aplicáveis terminaram com sucesso.

| Workflow | Run | Resultado |
|---|---:|---|
| CI | `32337080555` | success |
| Core CI | `32337080504` | success |
| V2 Core | `32337080486` | success |
| V2 Runtime | `32337080527` | success |
| V2 Validation | `32337080533` | success |
| Vigia das rotas | `32337080528` | success |
| Arma 3 Data CI | `32337080505` | success |
| CodeQL | `32337080502` | success |

## Critério de conclusão

A Wave 27 está encerrada: os três consumers foram promovidos, os wrappers continuam disponíveis, os gates locais passaram e a CI remota confirmou os oito workflows sem regressão. O próximo passo recomendado é promover outro utilitário puro ou iniciar uma auditoria específica de módulos com Supabase/storage, sem misturar as duas superfícies.

**Autor:** Manus AI

**SHA de implementação:** `2aadf976c91d474a5b0a82fb89bfa5389825d93a`.

**Data:** 2026-08-20.
