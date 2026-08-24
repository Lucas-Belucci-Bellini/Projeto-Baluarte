# Migração TypeScript — Wave 19

**Status:** publicada diretamente no `main`; implementação e CI remota concluídas com sucesso.

**Objetivo:** promover `/git-nexus`, `/jarvis-vision` e `/mural` para as implementações TypeScript canônicas, preservando o gate app-only do Git Nexus, a ativação explícita da câmera e os modos Supabase/repositório/local do Mural.

## Baseline

A Wave 19 parte do `main` em `ed96ce3a47700aa16d8a37d1aee615d2f7ee62ad`, igual a `origin/main`, após a conclusão remota verde da Wave 18.

| Rota | Implementação TS | Export | Fronteira sensível | Decisão |
|---|---|---|---|---|
| `/git-nexus` | `src/pages/git-nexus-gate.ts` | `gitNexusGate` | ambiente native, imports lazy de cockpit/núcleo e teaser web | Promover |
| `/jarvis-vision` | `src/pages/jarvis-vision.ts` | `jarvisVisionPage` | CDN TF.js/MediaPipe, `getUserMedia`, áudio e teardown | Promover sem ativar câmera nos gates |
| `/mural` | `src/pages/mural.ts` | `muralPage` | Supabase read-only quando configurado; API GitHub best-effort no modo local | Promover sem executar publicação |

## Contratos auditados

`/git-nexus` é um gate app-only. Na web, `isNative()` retorna falso e a página renderiza o teaser com navegação para `/baixar` e `/codigo`. No app, o argumento `query.ui` escolhe entre os imports lazy `git-nexus-cockpit.js` e `git-nexus-nucleo.js`, ambos wrappers para implementações TypeScript. Falha no carregamento retorna teaser e não derruba o router.

`/jarvis-vision` só inicia recursos sensíveis após clique explícito em “Ativar JARVIS”. A implementação carrega TF.js/MoveNet/MediaPipe sob demanda, solicita câmera pelo `navigator.mediaDevices.getUserMedia`, registra stream, detector, áudio e RAF, e o método `stop()` encerra tracks, detector, mãos, variáveis TF e estado. O `MutationObserver` chama cleanup quando a rota sai do DOM. Os gates não clicam no botão e não solicitam câmera.

`/mural` escolhe Supabase quando `supabaseConfigured()` está ativo e, nesse modo, faz apenas leitura pública de `mural_posts` com RLS e publicação bloqueada. Sem Supabase, mantém storage local e sincronização best-effort em `/api/social`, que pode ler ou postar no branch `jarvis-memory` somente mediante configuração externa existente. Nenhum login, post, token ou escrita externa será executado durante a validação. A promoção não altera payloads, permissões ou fallback.

Os wrappers `src/pages/git-nexus-gate.js`, `src/pages/jarvis-vision.js` e `src/pages/mural.js` reexportam os mesmos símbolos públicos. A alteração é exclusivamente a resolução do módulo no router e as origens Nexus correspondentes.

## Alteração implementada

No `src/main.js`:

```text
/git-nexus      .js → .ts
/jarvis-vision  .js → .ts
/mural          .js → .ts
```

`docs/nexus/dominios.json` foi atualizado na mesma changeset de `src/main.js`. Os wrappers `.js` permanecem para compatibilidade.

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
| `npm run smoke` | verde | 99/99 rotas verdes; câmera e publicação não foram ativadas |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. Os relatórios de smoke gerados por timestamp foram restaurados antes do commit. Nenhum token, login, captura de câmera, post no Mural ou escrita externa foi executado durante os gates.

## Risco, segurança e rollback

O risco do Git Nexus está limitado aos imports nativos lazy e possui fallback. O risco do JARVIS Vision é privacidade de câmera e carga pesada de CDN, mitigado pela ativação explícita e teardown. O risco do Mural é escrita externa acidental, evitada pelo modo de validação sem interação e pelo fallback existente. Nenhuma permissão nova, segredo ou service role será introduzido.

Rollback: restaurar no router e no Nexus as três extensões para `.js`, mantendo os TypeScript e wrappers. A reversão será um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 19 foi concluída: as três rotas carregam diretamente `.ts`, os contratos V2/câmera/Supabase permaneceram inalterados, todos os gates comportamentais passaram e a CI remota terminou verde no SHA de implementação.

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
**SHA de implementação e publicação:** `8260fba3d546bfd2c881a70e792373fe77cbd3ee`.
**Data dos gates:** 2026-08-20T03:40Z–03:48Z.
