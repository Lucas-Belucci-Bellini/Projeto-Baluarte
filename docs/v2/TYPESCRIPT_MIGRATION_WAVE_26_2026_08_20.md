# Migração TypeScript — Wave 26

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover dois utilitários TypeScript puros que ainda eram consumidos por wrappers JavaScript: o renderer seguro de Markdown usado em `/utilidades` e o construtor de prompt do briefing de notícias usado pelo engine JARVIS.

> Esta onda não promove o cliente de notícias nem altera o POST remoto do JARVIS. Ela muda somente a resolução dos consumidores para as implementações canônicas já tipadas.

## Baseline e publicação

A Wave 26 partiu do fechamento da Wave 25 em `9c05ab6e83f741c59635e95b218e48c238e053dd`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `06485ac6c276ba7a5012b4bea269455d599cbf9e` |
| Mensagem | `refactor(utils): promote typed markdown and news` |
| Utilitários promovidos | 2 |
| Consumers alterados | 2 |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Candidatos auditados

O inventário dos utilitários `.ts` com wrappers `.js` separou módulos puros de módulos com rede, storage, DOM, Supabase ou bridges. `markdown.ts` e `news-briefing.ts` foram escolhidos porque não executam chamadas externas e já expõem contratos tipados estáveis.

| Módulo canônico | Consumer promovido | Contrato preservado |
|---|---|---|
| `src/utils/markdown.ts` | `src/pages/utilidades.ts` | `mdToHtml()` continua escapando texto antes das transformações e filtrando esquemas de URL para `http`, `https` e `mailto` |
| `src/utils/news-briefing.ts` | `src/utils/jarvis-engine.js` | `buildNewsBriefingPrompt()` continua limitando o número de itens, exigindo fonte/URL e proibindo envio, publicação ou ação externa no texto do prompt |

O wrapper `markdown.js` continua reexportando `mdToHtml` e `urlSegura`. O wrapper `news-briefing.js` continua reexportando normalização, deduplicação, construção de prompt e renderização de fontes para consumidores legados.

## Auditoria de fronteiras

O renderer Markdown é uma fronteira de segurança local. Ele escapa o texto recebido antes de gerar tags, e o destino dos links passa por `urlSegura()`, que rejeita esquemas não navegáveis e remove caracteres de controle antes de verificar o esquema. A promoção não alterou essa sequência.

O módulo de notícias é uma fronteira de conteúdo, não um cliente HTTP. `normalizeNewsItem()` valida URL, datas, confiança, idioma, tópicos e status; `deduplicateNews()` ordena e elimina duplicatas; `buildNewsBriefingPrompt()` somente monta texto. O `processNewsBriefing()` do engine continua responsável pelo POST remoto e não foi reescrito nesta onda.

## Implementação

Foram aplicados somente três ajustes de fronteira:

| Arquivo | Alteração |
|---|---|
| `src/pages/utilidades.ts` | `markdown.js` → resolução extensionless de `markdown.ts` |
| `src/utils/jarvis-engine.js` | `news-briefing.js` → `news-briefing.ts` |
| `docs/nexus/dominios.json` | Registro de `markdown.ts` no domínio de ferramentas e `news-briefing.ts` no domínio JARVIS |

Nenhuma rota foi adicionada, removida ou renomeada. O `src/main.js` não foi alterado nesta onda; por isso, a sincronização obrigatória do router não foi necessária.

## Escopo mantido fora

Continuam fora desta onda os utilitários de Supabase/RLS (`mil-curation`), armazenamento, MapLibre, fingerprint, geo tracker, WebGL, tema, presença musical, Spotify, Hermes, WebLLM, OpenClaw, memória de repositório, autenticação e bridges externos. Também não foram removidos wrappers JavaScript.

O cliente de notícias ainda precisa de uma onda própria se for migrado: ele terá que preservar proveniência, timeout, falhas, fontes e política de não publicação. O JARVIS continua podendo usar o modo de notícias existente, mas essa promoção não cria novas credenciais nem executa a busca durante os gates.

## Gates locais

Os gates rápidos e comportamentais foram executados após os dois retargetings. Vite stale foi encerrado antes da integração. Os relatórios transitórios do smoke, com tempos e títulos não determinísticos, foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 391 arquivos com dono |
| `npm run tipos:ts` | verde | imports canônicos resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 7,78 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A falha local do Rust permanece ambiental e não foi mascarada. O CI remoto usa uma toolchain compatível.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal é uma diferença de resolução de wrapper em um consumer legado ou um futuro uso do renderer sem respeitar o filtro de URLs. A API não mudou, os wrappers permanecem e os testes de build, rotas e caminho crítico cobrem a superfície pública.

O rollback é restaurar os dois imports para `.js`, remover as duas entradas TypeScript adicionadas ao mapa Nexus e publicar um commit normal no `main`. Não é necessário apagar as implementações canônicas, relaxar `strict` ou reverter histórico.

## CI remota

A execução remota foi disparada para o SHA curto `06485ac6`; todos os oito workflows aplicáveis terminaram com sucesso.

| Workflow | Run inicial | Estado no momento da redação |
|---|---:|---|
| CI | `32336237566` | success |
| Core CI | `32336237617` | success |
| V2 Core | `32336237555` | success |
| V2 Runtime | `32336237619` | success |
| V2 Validation | `32336237756` | success |
| Vigia das rotas | `32336237694` | success |
| Arma 3 Data CI | `32336237675` | success |
| CodeQL | `32336237687` | success |

## Critério de conclusão

A Wave 26 está encerrada: a CI remota confirmou o SHA de implementação, o relatório registra o resultado e nenhum workflow registrou regressão. O próximo passo recomendado é escolher entre promover os demais utilitários puros (`triangulation`, `cor`) ou auditar com mais profundidade as fronteiras de memória, Supabase e bridges antes de qualquer mudança externa.

**Autor:** Manus AI

**SHA de implementação:** `06485ac6c276ba7a5012b4bea269455d599cbf9e`.

**Data:** 2026-08-20.
