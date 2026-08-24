# Migração TypeScript — Wave 33

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover `maplibre-loader.ts` em `/mapa` e `/vanguard`, e `webgl-probe.ts` em `/modelos-3d`, sem alterar CDN, fallback, sonda, viewer pesado ou contratos das páginas.

## Baseline e publicação

A onda partiu de `816030832ee328c08de7db7bcf12072e00b4ce78`, com `origin/main` sincronizado. Não houve PR nem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `b41d20a0802b6701d8933f08dd3a60e8e1879729` |
| Mensagem | `refactor(geo): promote typed maplibre webgl loaders` |
| Arquivos alterados | 4 |
| Consumers promovidos | 3 |
| Rotas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contratos auditados

`maplibre-loader.ts` continua carregando CSS e JavaScript do MapLibre `4.7.1` sob demanda, reutilizando `loadPromise`, retornando o namespace global quando presente e resolvendo `null` em falha de CDN/rede. `/mapa` e `/vanguard` continuam usando as mesmas interfaces de mapa, markers, controls e eventos.

`webgl-probe.ts` continua criando um canvas leve, detectando WebGL/WebGL2 e liberando o contexto via `WEBGL_lose_context`. O viewer `visor-3d.js` e o diagnóstico pesado permanecem fora da onda.

| Consumer | Resultado |
|---|---|
| `src/pages/mapa.ts` | runtime e `MapLibreNamespace` resolvem o módulo TS |
| `src/pages/vanguard.ts` | runtime e quatro tipos MapLibre resolvem o módulo TS |
| `src/pages/modelos-3d.ts` | sonda resolve o módulo TS; viewer continua lazy em JS |

Os wrappers `maplibre-loader.js` e `webgl-probe.js` permanecem disponíveis.

## Implementação e gates

O mapa Nexus recebeu `maplibre-loader.ts` no domínio geo e `webgl-probe.ts` no domínio 3D. Nenhuma rota foi adicionada, removida ou renomeada.

| Gate | Resultado |
|---|---:|
| `git diff --check` / JSON Nexus | verde |
| `npm run verificar-nexus` | verde: 99 rotas, 0 lacunas, 21/21 domínios, 404 arquivos com dono |
| `npm run tipos:ts` / `npm run tipos:v2` | verde |
| `npm test` / `npm run build` | verde; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde: 21/21 |
| `npm run smoke` | verde: 99/99 |
| `npm run caminho-critico` | verde: 15/15 |
| `npm run v2:runtime` | limitação local conhecida: Cargo 1.75.0 não lê `edition2024` |

A falha local do Rust não foi mascarada; o CI remoto usa toolchain compatível. Node `v22.13.0`, npm `10.9.2`, TypeScript `7.0.2`, Cargo `1.75.0`, pacote `1.1.5`.

## CI remota

Todos os oito workflows aplicáveis no SHA `b41d20a0` terminaram com sucesso.

| Workflow | Run |
|---|---:|
| CI | `32342234579` |
| Core CI | `32342234531` |
| V2 Core | `32342234502` |
| V2 Runtime | `32342234618` |
| V2 Validation | `32342234529` |
| Vigia das rotas | `32342234625` |
| Arma 3 Data CI | `32342234534` |
| CodeQL | `32342234677` |

## Riscos e rollback

O risco limitado era resolução do loader em consumers TypeScript. Build, tipos, smoke, caminho crítico, integração V2 e CI confirmaram o comportamento. Rollback: restaurar os três imports para `.js`, remover as duas entradas TS do Nexus e publicar commit normal; não alterar CDN, WebGL, viewer ou histórico.

**Autor:** Manus AI. **Data:** 2026-08-20.
