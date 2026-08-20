# Migração TypeScript — Wave 21

**Status:** implementação local concluída; publicação preparada após gates verdes.

**Objetivo:** promover `/editor` para a implementação TypeScript canônica após revisar VFS, tabs, runners, persistência, atalhos globais e teardown, sem alterar o contrato pesado do JARVIS.

## Baseline

A Wave 21 parte do `main` em `25ccec48df8ee8623723c7958652277f4c2ed889`, igual a `origin/main`, após a conclusão remota verde da Wave 20.

O wrapper `src/pages/editor.js` reexporta `editorPage` de `editor.ts`. O router ainda carregava `.js`; o Nexus também apontava para `.js`.

## Contrato auditado

A implementação TypeScript expõe `editorPage(): HTMLDivElement` e mantém estado tipado em `EditorState`, com tabs, tab ativa e conteúdo. `loadState()` e `saveState()` preservam a persistência existente; `debounce` limita gravações durante a edição.

O VFS é acessado somente pelas ações explícitas de abrir e salvar arquivo. `vfs.readFile()` cria uma tab com linguagem inferida pela extensão, enquanto `vfs.writeFile()` salva o conteúdo da tab ativa no caminho escolhido. Erros são convertidos em toast e não quebram o router.

Os runners continuam encapsulados em `runTab()`. Preview HTML usa `iframe` com `sandbox="allow-scripts"`; Markdown vira saída renderizada; outras linguagens produzem logs. A promoção não altera payloads, permissões ou o engine de execução.

Os atalhos `Ctrl+Enter`, `Ctrl+S`, `Ctrl+T`, `Ctrl+W`, `Ctrl+F`, `Ctrl+H` e `Escape` são instalados por um único listener global condicionado à rota `#/editor`. Antes de instalar um novo handler, o anterior é removido. `aoSair(fullPage, ...)` remove o listener e fecha o autocomplete, evitando vazamento entre navegações. O caminho crítico já confirmou que escrita no Editor sobrevive à ida e volta pelo Terminal.

JARVIS permanece fora do escopo. O gate `lazyNexus`, as bridges nativas, sessões, cockpit e módulos pesados não serão alterados nesta onda.

## Alteração planejada

No `src/main.js`:

```text
/editor  ./pages/editor.js → ./pages/editor.ts
```

`docs/nexus/dominios.json` foi atualizado na mesma changeset, substituindo apenas a origem de Editor. O wrapper `.js` permanece para consumidores legados.

## Gates

Os gates locais foram executados após a promoção:

| Gate | Resultado | Evidência |
|---|---:|---|
| `node -e JSON.parse(dominios.json)` | verde | mapa Nexus sintaticamente válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde | TypeScript estrito sem erro |
| `npm run tipos:v2` | verde | TypeScript V2 sem erro |
| `npm test` | verde | suíte completa passou; baseline de 1085 testes |
| `npm run build` | verde | build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções, incluindo Editor → Terminal → retorno e persistência após reload |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. Os relatórios de smoke gerados por timestamp foram restaurados antes do commit. JARVIS, VFS externo e execução de código não foram acionados além do caminho crítico existente.

## Risco, segurança e rollback

O risco é local à resolução do módulo e à preservação do estado de Editor. Nenhuma API externa, Supabase, credencial, execução automática ou integração JARVIS será introduzida. O preview permanece sandboxed conforme a implementação existente.

Rollback: restaurar no router e no Nexus a origem `.js`, mantendo `editor.ts` e o wrapper. A reversão será um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 21 será concluída após o commit e a confirmação da CI remota no SHA final. Os critérios locais já foram satisfeitos: `/editor` carrega diretamente `.ts`, o caminho crítico permanece verde e todos os gates comportamentais passaram.

**Autor:** Manus AI
**SHA:** será preenchido após publicação.
**Data dos gates:** 2026-08-20T04:16Z–04:18Z.
