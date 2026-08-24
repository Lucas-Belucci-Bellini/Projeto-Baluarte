# TypeScript Migration — Wave 10 — Military Content

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base auditada

A Wave 10 foi preparada sobre o SHA `b9fb13dc`, que contém a Wave 9 de identidade publicada e os oito workflows remotos verdes. Foi publicada no SHA `934752f4` (`refactor(military): route content wave directly to TypeScript`).

## Objetivo

Promover páginas militares predominantemente informativas para implementações TypeScript canônicas, sem alterar dados de Arma 3, balística, permissões administrativas ou integrações externas.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/forcas-armadas` | `src/pages/forcas-armadas.ts` | `forcasArmadasPage` |
| `/poder-militar` | `src/pages/poder-militar.ts` | `poderMilitarPage` |
| `/forcas-especiais` | `src/pages/forcas-especiais.ts` | `forcasEspeciaisPage` |
| `/organizacao-militar` | `src/pages/organizacao-militar.ts` | `organizacaoMilitarPage` |
| `/taticas-estrategias` | `src/pages/taticas-estrategias.ts` | `taticasEstrategiasPage` |
| `/historia-militar` | `src/pages/historia-militar.ts` | `historiaMilitarPage` |

`src/main.js` e `docs/nexus/dominios.json` foram atualizados no mesmo changeset.

## Decisão de escopo

Foram escolhidas páginas sem chamadas Supabase, sessão, permissões ou `fetch` na implementação TypeScript auditada. Permanecem fora desta onda páginas com maior acoplamento ou contratos ainda não promovidos, incluindo `/tecnologia-militar`, `/guerras-conflitos`, `/arsenal-expandido`, `/armas-por-pais`, `/batalhas-historicas`, `/enciclopedia-militar`, `/wiki-arma3` e `/arma3-tutorial`.

## Segurança e dados preservados

A mudança apenas troca o destino do `import()` lazy para o módulo TypeScript já existente. Nenhum dataset, imagem, ícone, integração externa, papel de administrador, RLS, Vercel ou serviço de rede foi alterado. Os wrappers JavaScript permanecem como fronteiras legadas e rollback.

## Validação local

| Gate | Resultado |
|---|---|
| `npm run verificar-nexus` | Passou: 99 rotas, 0 lacunas, 0 divergências |
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | Passou: 1085/1085 |
| `npm run build` | Passou; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou: 21/21 |
| `npm run smoke` | Passou: 99/99 |
| `npm run caminho-critico` | Passou: 15/15 |
| Contratos de segurança | Passou: 39/39 |
| `git diff --check` | Passou |

O gate local `npm run v2:runtime` retornou `101` porque Cargo 1.75.0 não interpreta o metadado `edition2024` da dependência `getrandom`. Essa limitação ambiental é conhecida, não foi mascarada e será validada pelo workflow remoto V2 Runtime.

## Riscos e rollback

O risco é um wrapper legado conter comportamento diferente do TypeScript canônico. Como nenhum wrapper foi removido e os exports foram confirmados, o rollback consiste em reverter as seis extensões no router, as seis origens Nexus e este documento. Nenhum dado externo foi tocado.

## Próximo passo

A divergência de `origin/main` foi inspecionada, a Wave 10 foi publicada no SHA `934752f4` e CI, Core CI, V2 Core, V2 Runtime, V2 Validation, Vigia das rotas, Arma 3 Data CI e CodeQL passaram. Depois, avançar para páginas militares com contratos de dados mais pesados ou iniciar `/geo` e `/visao` com auditorias específicas.
