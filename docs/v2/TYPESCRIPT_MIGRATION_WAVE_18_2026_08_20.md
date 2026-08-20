# Migração TypeScript — Wave 18

**Status:** implementação local concluída; publicação preparada após gates verdes.

**Objetivo:** promover `/cerebro`, `/memoria` e `/modelos-3d` para as implementações TypeScript canônicas, preservando os contratos internos do JARVIS, a sincronização best-effort de Memória e o carregamento lazy do visualizador 3D.

## Baseline

A Wave 18 parte do `main` em `ad0fee1db93c1f153c4404cd77c3a7ab8aec4f43`, igual a `origin/main` após a integração do registro de validação contínua. Os três candidatos possuem wrappers JavaScript pequenos e exports TypeScript correspondentes.

| Rota | Implementação TS | Export | Fronteira sensível | Decisão |
|---|---|---|---|---|
| `/cerebro` | `src/pages/cerebro.ts` | `cerebroPage` | grafo local, memórias JARVIS e canvas com teardown | Promover |
| `/memoria` | `src/pages/memoria.ts` | `memoriaPage` | local-first, branch `jarvis-memory`, Supabase/Auth best-effort | Promover sem mudar bridge |
| `/modelos-3d` | `src/pages/modelos-3d.ts` | `modelos3dPage` | WebGL/three lazy, arquivos locais, Sketchfab opt-in e URLs filtradas | Promover sem mudar viewer |

## Contratos auditados

`/cerebro` lê `src/data/cerebro.json`, acrescenta até 50 memórias do JARVIS e monta um grafo Canvas. Links internos usam o router e o ciclo de vida usa `aoSair` para cancelar a renderização quando a página sai. A implementação não concede permissões, não usa Supabase diretamente e não executa rede durante o boot.

`/memoria` é local-first. As operações locais continuam em `jarvis-brain.js`; sincronização com o branch versionado e com a conta Supabase só ocorre quando o operador aciona os botões correspondentes. A conta é checada por `isLoggedIn()` antes da sincronização de usuário. A promoção não muda as chaves de storage, o conteúdo das memórias, os destinos `/cerebro` e `/codigo`, nem as operações de apagar/limpar.

`/modelos-3d` inicia com catálogo local. O visualizador universal valida esquemas `http(s)`, `blob`, `data` e caminhos locais, carrega `visor-3d.js` sob demanda e libera viewers/teclas por cleanup. A API pública do Sketchfab só é consultada por `Carregar mais`; falhas retornam estado visual sem derrubar a página. O diagnóstico 3D e o three.js também são lazy. Não há token ou credencial no frontend.

Os wrappers `src/pages/cerebro.js`, `src/pages/memoria.js` e `src/pages/modelos-3d.js` reexportam os mesmos símbolos públicos. A mudança é exclusivamente a resolução do módulo no router e as três origens Nexus correspondentes.

## Alteração implementada

No `src/main.js`:

```text
/cerebro     .js → .ts
/memoria     .js → .ts
/modelos-3d .js → .ts
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
| `npm run smoke` | verde | 99/99 rotas verdes; nenhuma dependência remota obrigatória no boot |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. Os relatórios de smoke gerados por timestamp foram restaurados antes do commit. Nenhum login, upload, sincronização de memória, chamada Sketchfab ou escrita externa foi executado durante os gates.

## Risco, segurança e rollback

O risco de Cerebro é o ciclo Canvas, mitigado pelo `aoSair` existente. O risco de Memória é confundir sincronização best-effort com autorização implícita; nenhuma permissão nova será criada. O risco de Modelos 3D é rede/URL/viewer, mitigado pelo lazy loading, validação de URL, fallback e descarte. Nenhuma operação externa de escrita será executada nos gates.

Rollback: restaurar no router e no Nexus as três extensões para `.js`, mantendo os TypeScript e wrappers. A reversão será um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 18 será concluída após o commit e a confirmação da CI remota no SHA final. Os critérios locais já foram satisfeitos: as três rotas carregam diretamente `.ts`, os contratos JARVIS/Auth/WebGL permaneceram inalterados e todos os gates comportamentais passaram.

**Autor:** Manus AI
**SHA:** será preenchido após publicação.
**Data dos gates:** 2026-08-20T03:22Z–03:24Z.
