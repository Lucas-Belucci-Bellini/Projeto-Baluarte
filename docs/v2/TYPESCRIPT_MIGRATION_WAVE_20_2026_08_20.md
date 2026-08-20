# Migração TypeScript — Wave 20

**Status:** implementação local concluída; publicação preparada após gates verdes.

**Objetivo:** promover `/vanguard` para a implementação TypeScript canônica e fechar o inventário atual, mantendo `/jarvis` e `/editor` fora da promoção até os contratos pesados serem auditados em uma onda própria.

## Baseline

A Wave 20 parte do `main` em `e6428d166e7080c38e056f0ae911306098e4c66c`, igual a `origin/main`, após a conclusão remota verde da Wave 19.

O inventário de imports diretos com implementação TypeScript restante mostrou apenas `/editor` e `/vanguard`; JARVIS continua encaminhado pelo gate `lazyNexus` e por isso foi classificado separadamente.

| Superfície | Estado | Decisão |
|---|---|---|
| `/vanguard` | wrapper `.js` de 5 linhas para `vanguard.ts`, motor balístico puro, MapLibre lazy e ponte interna entre cards | Promover |
| `/editor` | wrapper `.js` para 736 linhas de IDE, VFS, runners, autocomplete, persistência e atalhos globais | Bloquear para auditoria contratual dedicada |
| `/jarvis` e rotas JARVIS pesadas | gate `lazyNexus`, bridge nativa, cockpit, memória, ferramentas e contratos de runtime | Não alterar nesta onda |

## Contrato auditado de Vanguard

`/vanguard` usa o motor puro em `src/utils/vanguard/`, conversores MGRS/UTM, dados de Arma 3 e `gridVector()`. A física e a conversão não dependem de DOM externo. O mapa tático carrega MapLibre por `loadMapLibre()` e usa o catálogo de camadas compartilhado; o carregamento é a única fronteira remota obrigatória da página visual, já existente na implementação TypeScript.

A ponte entre o mapa e o computador de tiro é um objeto local com `aplicar` opcional. Não há Event Bus global, sessão, Supabase, escrita externa ou permissões novas. As ações permanecem dentro da página e os dados default são de treino/simulação, não uma tabela de tiro oficial.

## Classificação de Editor e JARVIS

O Editor possui lifecycle explícito com `aoSair`, remove o listener global de teclado e usa o VFS local. Porém, seus 736 linhas combinam múltiplas tabs, syntax highlight, autocomplete, runners, persistência e execução de código. O risco de promover somente por troca de extensão é baixo para o router, mas o contrato de execução merece uma onda própria com testes de VFS, Ctrl+Enter, Ctrl+S, tabs, teardown e regressão do caminho crítico. Portanto, ele permanece bloqueado sem alteração.

JARVIS e o gate de Nexus têm contrato mais amplo: bridge nativa, cockpit, sessões, memória, ferramentas e possíveis integrações externas. A Wave 19 promoveu somente o gate TypeScript e não mudou os módulos pesados. Nenhum import de `jarvis.js`, `editor.js` ou bridge nativa será alterado nesta onda.

## Alteração implementada

No `src/main.js`:

```text
/vanguard  ./pages/vanguard.js → ./pages/vanguard.ts
```

`docs/nexus/dominios.json` foi atualizado na mesma changeset, substituindo apenas a origem de Vanguard. O wrapper `.js` permanece para consumidores legados.

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
| `npm run smoke` | verde | 99/99 rotas verdes; Vanguard abriu sem interação externa |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. Os relatórios de smoke gerados por timestamp foram restaurados antes do commit. JARVIS/editor não foram alterados, conforme a classificação contratual.

## Risco, segurança e rollback

O risco é limitado ao carregamento lazy do MapLibre e aos tipos do motor, todos já encapsulados na implementação TypeScript. Nenhuma chamada de escrita, autenticação, Supabase, bridge nativa ou operação externa de alto impacto será executada. O conteúdo de balística é tratado como simulação de treino.

Rollback: restaurar no router e no Nexus a origem `.js`, mantendo `vanguard.ts` e o wrapper. A reversão será um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 20 será concluída após o commit e a confirmação da CI remota no SHA final. Os critérios locais já foram satisfeitos: `/vanguard` carrega diretamente `.ts`, o inventário registra Editor/JARVIS como bloqueados por contrato e todos os gates comportamentais passaram.

**Autor:** Manus AI
**SHA:** será preenchido após publicação.
**Data dos gates:** 2026-08-20T03:59Z–04:01Z.
