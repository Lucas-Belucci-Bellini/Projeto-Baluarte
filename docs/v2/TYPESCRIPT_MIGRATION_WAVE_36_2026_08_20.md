# Wave 36 — promoção de `theme` para TypeScript

**Data:** 2026-08-20
**Status:** publicada no `main`; CI remota verde
**SHA publicado:** `32b59ad5e521ea521758b1e9d52c5f50f959f078`
**Commit:** `refactor(theme): promote typed theme consumers`
**Base:** `d78cc0a159827fd3ca72f78892ac851c4669975d`

## Resumo executivo

A Wave 36 promoveu os dois consumers TypeScript do sistema de temas para a implementação canônica `src/utils/theme.ts`: `src/layout/shell.ts` e `src/pages/perfil.ts`. O wrapper `src/utils/theme.js` permanece intacto para `src/main.js` e `src/utils/universe-theme.js`, que continuam sendo consumers JavaScript compatíveis.

A implementação não foi reescrita. O contrato existente de `THEMES`, `applyTheme`, `getThemeId`, `setTheme` e `initTheme` foi preservado. O módulo continua aplicando variáveis CSS ao elemento raiz, persistindo a escolha em `ui:theme`, emitindo `baluarte:theme` e sem chamadas de rede ou telemetria própria.

## Contrato e segurança

`theme.ts` aceita um identificador string, faz fallback para o tema `neon`, limpa variáveis anteriores antes de aplicar o novo kit visual, mantém o identificador histórico `neon` como Ouro e persiste somente pelo Storage/Core já existente. A Wave não introduziu rede, secrets, permissões, novos providers, nova persistência, novo Event Bus ou estado global paralelo.

O wrapper `.js` não foi removido. Isso preserva a compatibilidade com o entrypoint JavaScript e com o `universe-theme.js`, enquanto os consumers TypeScript passam a testar a implementação canônica diretamente.

## Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| `src/layout/shell.ts` | Import de `../utils/theme.js` promovido para `../utils/theme`. |
| `src/pages/perfil.ts` | Import de `../utils/theme.js` promovido para `../utils/theme`. |
| `docs/nexus/dominios.json` | Adicionado `src/utils/theme.ts` ao domínio `baluarte-core`. |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_36_2026_08_20.md` | Relatório da onda. |

## Validação local

| Gate | Resultado |
|---|---|
| `git diff --check` | Verde |
| JSON do Nexus | Válido |
| `npm run verificar-nexus` | Verde: 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| Testes direcionados de tema/perfil | Verdes: 218/218 subtests selecionados |
| `npm test` | Verde |
| `npm run build` | Verde; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | Verde: 21/21 |
| `npm run smoke` | Verde: 99/99 rotas |
| `npm run caminho-critico` | Verde: 15/15 |
| `npm run v2:runtime` | Limitação local conhecida, exit 101 |

O runtime Rust local permanece bloqueado pelo Cargo 1.75.0 ao interpretar metadata `edition2024` da dependência `getrandom`. Nenhuma configuração foi relaxada e o problema não foi mascarado; o workflow remoto V2 Runtime continua sendo a autoridade compatível.

## Riscos e rollback

O principal risco era promover somente parte dos consumers TypeScript e criar divergência de resolução. A implementação canônica, o wrapper e os consumers JavaScript foram mantidos, e o Nexus foi atualizado no mesmo changeset. O rollback é o revert do commit desta onda ou a restauração dos dois imports `.js`; não há migração de dados.

## CI remota

Os oito workflows disparados para `32b59ad5e521ea521758b1e9d52c5f50f959f078` terminaram com sucesso: `CI`, `Core CI`, `V2 Core`, `Arma 3 Data CI`, `Vigia das rotas`, `CodeQL`, `V2 Runtime` e `V2 Validation`. O Vigia confirmou build, abertura das rotas, continuidade do router V1, jornada crítica, descarte de recursos e comportamento offline. Houve apenas o aviso operacional conhecido sobre actions legadas direcionadas a Node 20 sendo executadas em Node 24.

## Próximos passos

Após a publicação e a CI verde, a auditoria GEN-TS-002 continua separada: wrappers V2 e type-only imports `.ts` executados por `tsx`/Vite precisam de uma política de loader própria, sem transformar esta Wave 36 em refactor de runtime.

**Autor:** Manus AI
