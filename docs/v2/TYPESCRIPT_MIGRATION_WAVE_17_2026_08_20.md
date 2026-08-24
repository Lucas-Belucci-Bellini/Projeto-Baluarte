# Migração TypeScript — Wave 17

**Status:** publicada diretamente no `main`; implementação e CI remota concluídas com sucesso.

**Objetivo:** promover `/codigo`, `/comms` e `/banco` para as implementações TypeScript canônicas, preservando as fronteiras externas existentes e sem alterar contratos de Supabase, Auth, RLS ou Realtime.

## Baseline

A Wave 17 parte do `main` em `796e616f25ff6bc01122a591b9f12cfcf5fe027a`, igual a `origin/main`, após a Wave 16 e sua CI remota verde. Os três candidatos possuem wrappers JavaScript pequenos e exports TypeScript correspondentes.

| Rota | Implementação TS | Export | Contrato externo | Decisão |
|---|---|---|---|---|
| `/codigo` | `src/pages/codigo.ts` | `codigoPage` | leitura opcional do GitHub somente após clique; canvas e listeners locais | Promover |
| `/comms` | `src/pages/comms.ts` | `commsPage` | Supabase REST/Realtime; leitura pública, escrita autenticada, RLS e teardown | Promover sem alterar a bridge |
| `/banco` | `src/pages/banco.ts` | `bancoPage` | Supabase somente leitura, fallback quando não configurado ou indisponível | Promover sem alterar a camada de dados |

## Contratos auditados

`/codigo` monta o grafo local a partir de `src/data/codemap.json` e das memórias do JARVIS. O card “Ler o repo ao vivo” é opt-in: somente o clique dispara a leitura da árvore GitHub. A página trata falhas com fallback visual e registra `aoSair(page, ...)` para cancelar RAF e listeners. A promoção não transforma o GitHub em dependência do boot.

`/comms` usa `openComms()` como adapter único. O adapter mantém a assinatura Realtime, deduplicação, histórico, autenticação por token no envio, rate limit e `close()`. Leitura sem login continua permitida; transmissão só aparece com sessão Supabase. O callback de mutação fecha a ponte e remove a inscrição quando a página sai do DOM. Nenhuma mensagem será enviada durante os gates, e a promoção não muda payload, destinatário ou permissões.

`/banco` usa `supabaseConfigured()` antes de qualquer consulta. Quando não há configuração, renderiza fallback local. Quando há configuração, lê `site_stats` e `mural_posts` com `dbSelect`, trata erro de rede/migration e não oferece escrita. A semântica declarada de RLS permanece na camada Supabase existente; nenhum service role ou credencial nova entra no frontend.

Os wrappers `src/pages/codigo.js`, `src/pages/comms.js` e `src/pages/banco.js` reexportam exatamente os símbolos públicos TypeScript. A alteração é apenas de resolução do módulo no router e de origem no Nexus.

## Alteração implementada

No `src/main.js`:

```text
/codigo  .js → .ts
/comms   .js → .ts
/banco   .js → .ts
```

`docs/nexus/dominios.json` foi atualizado na mesma changeset de `src/main.js`, substituindo as três origens legadas. Os wrappers `.js` permanecem para consumidores antigos.

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
| `npm run smoke` | verde | 99/99 rotas verdes; chamadas externas permaneceram em fallback quando necessário |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou e os relatórios de smoke gerados por timestamp foram restaurados antes do commit. Nenhuma mensagem foi enviada pelo Comms durante a validação; nenhuma escrita externa foi executada.

## Risco, segurança e rollback

O risco principal de `/comms` é a fronteira Supabase/Realtime, mas ela está encapsulada em `openComms()` e possui teardown explícito. O risco de `/banco` é indisponibilidade de backend, mitigada por fallback e mensagens de estado. O risco de `/codigo` é o loop de canvas, mitigado por teardown existente. Nenhuma operação de escrita externa será realizada.

Rollback: restaurar no router e no Nexus as três extensões para `.js`, mantendo os módulos TypeScript e os wrappers. Qualquer reversão será um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 17 foi concluída: as três rotas carregam diretamente `.ts`, os contratos externos permaneceram inalterados, todos os gates comportamentais passaram e a CI remota terminou verde no SHA de implementação.

| Workflow remoto | Resultado |
|---|---:|
| CI | success |
| Core CI | success |
| V2 Core | success |
| V2 Runtime | success |
| V2 Validation | success |
| Vigia das rotas | success |
| Arma 3 Data CI | success |
| CodeQL | success |

**Autor:** Manus AI
**SHA de implementação e publicação:** `16fc595ff6f5cd2b0943bb7f4a272f4b7f886af6`.
**Data dos gates:** 2026-08-20T03:05Z–03:12Z.
