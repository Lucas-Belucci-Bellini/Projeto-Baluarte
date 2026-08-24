# Wave 35 — promoção de `card-spotlight` para TypeScript

**Data:** 2026-08-20  
**Status:** publicada no `main`  
**SHA publicado:** `561aff89f90fac275d892ba0764cfdddd6c9a7bc`  
**Commit:** `refactor(shell): promote typed card spotlight`

## Resumo executivo

A Wave 35 promoveu o consumer canônico do efeito visual `card-spotlight` no shell para `src/utils/card-spotlight.ts`. O wrapper `src/utils/card-spotlight.js` foi preservado para consumidores JavaScript legados, e o mapa Nexus passou a registrar as duas fronteiras. A mudança é pequena, reversível e não altera a API pública nem o comportamento visual.

O código TypeScript já existia e possui tipos explícitos para `HTMLElement`, `PointerEvent`, `Element`, `requestAnimationFrame` e os estados opcionais de DOM. A alteração da onda foi exclusivamente de promoção do import em `src/layout/shell.ts`, acompanhada da sincronização arquitetural em `docs/nexus/dominios.json`.

## Contrato preservado

O módulo continua oferecendo `mountCardSpotlight(root?: HTMLElement | null): void`. O mount permanece idempotente por meio do estado interno `mounted`; respeita `prefers-reduced-motion: reduce`; usa `document.body` como fallback quando nenhum root é fornecido; registra `pointermove` passivo; limita atualizações a um frame de animação; encontra o ancestral `.card`; e escreve `--mx` e `--my` com uma casa decimal. Nenhuma rede, armazenamento, permissão, segredo ou dependência externa foi introduzida.

## Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| `src/layout/shell.ts` | Import canônico passou de `../utils/card-spotlight.js` para `../utils/card-spotlight`. |
| `docs/nexus/dominios.json` | Adicionado `src/utils/card-spotlight.ts` ao domínio `baluarte-shell`, mantendo o wrapper `.js`. |

## Validação local

| Gate | Resultado |
| --- | --- |
| `git diff --check` | verde |
| JSON do Nexus | válido |
| `npm run verificar-nexus` | verde: 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npm test` | verde |
| `npm run build` | verde; somente avisos conhecidos de chunks grandes de Three.js/Arma 3 |
| `npm run v2:integracao` | verde: 21/21 |
| `npm run smoke` | verde: 99/99 rotas |
| `npm run caminho-critico` | verde: 15/15 |
| `npm run v2:runtime` | limitação local conhecida, exit 101 |

O runtime Rust local continua bloqueado pelo Cargo 1.75.0 ao interpretar a dependência `getrandom v0.4.3`, que requer metadata `edition2024`. A configuração do projeto não foi relaxada e a falha não foi mascarada. O workflow remoto `V2 Runtime`, executado com toolchain compatível, terminou verde.

## CI remota no SHA publicado

Os oito workflows disparados para `561aff89f90fac275d892ba0764cfdddd6c9a7bc` terminaram com sucesso: `CI`, `V2 Runtime`, `V2 Core`, `Core CI`, `V2 Validation`, `CodeQL`, `Arma 3 Data CI` e `Vigia das rotas`. O Vigia confirmou build, abertura das rotas, continuidade do router V1, jornada crítica, descarte de recursos e comportamento offline. Houve apenas o aviso operacional de actions legadas direcionadas a Node 20 sendo executadas em Node 24; não houve falha funcional.

## Riscos e efeitos cascata

Não foi identificado erro raiz novo. O risco principal da promoção era divergência entre o import TypeScript e o mapa Nexus; os dois foram alterados no mesmo changeset. O wrapper JavaScript permanece como rollback imediato e como compatibilidade para consumers não migrados. Não há efeito cascata conhecido.

## Rollback

Para reverter a onda, basta reverter o commit `561aff89f90fac275d892ba0764cfdddd6c9a7bc` ou restaurar o import em `src/layout/shell.ts` para `../utils/card-spotlight.js` e remover a entrada TypeScript do domínio `baluarte-shell`. O wrapper e a implementação TypeScript não devem ser apagados durante o rollback.

## Próximo marco

Com a Wave 35 estável e a CI remota verde, o próximo marco é alinhar `package.json`, `src/data/version.ts`, `public/sw.js`, `README.md` e o changelog para a release `1.2.0`. Essa alteração será publicada em commit separado, após repetir os gates completos.

**Autor:** Manus AI
