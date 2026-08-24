# JARVIS — Auditoria de otimização local

**Status:** IMPLEMENTATION COMPLETE — otimização local publicada; auditoria e limites preservados
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA auditado (baseline):** `9aae1f4a14217c940895d8837bb129505a663792`
**SHA de implementação:** `1f47f0c475fec03420334a6f38af670ce4c3b345`
**SHA documental corrente:** `5e345547738cfb35c7c8dd24d4953affee4eeb69`
**Data/hora UTC:** `2026-08-21T05:08:05Z`
**Objetivo:** reduzir custo de contexto e inicialização para que o JARVIS possa conviver com OpenClaw, sem ativar bridge externo, WhatsApp, notícias automáticas ou autoridade adicional.

## Resumo executivo

O JARVIS já possui uma fundação relevante para uma otimização incremental. `src/utils/jarvis-context.ts` implementa cache do briefing por versão/contagens, variante compacta e `selectContextMessages()` com limites de caracteres e mensagens. Contudo, o caminho real de envio da página `src/pages/jarvis.ts` ainda passa o array completo da sessão para os providers: a função constrói `convo` sem orçamento, injeta o runtime context, varre o corpus inteiro de todas as sessões quando `memoryOn` está ativo e depois injeta memória durável. Assim, o contrato de orçamento existe, mas está parcialmente desligado do hot path.

O segundo custo identificado está na memória cross-session. `buildMemoryCorpus()` chama `getAllMessages()` e resume todas as sessões anteriores a cada envio; em seguida `recall()` reprocessa todos os documentos candidatos. Esse caminho é best-effort e não quebra a conversa quando falha, mas pode competir com o JARVIS e o OpenClaw por CPU/memória. O terceiro custo está nos modos de agente: `jarvis-tools.js` reconstrói o catálogo combinado de ferramentas a cada `getToolSchemas()`, e o agente local sempre recebe o conjunto inteiro de schemas, embora as permissões continuem sendo verificadas antes da execução.

O menor slice seguro é conectar `selectContextMessages()` ao envio real, registrar métricas bounded do contexto e manter budgets maiores apenas para agentes. A seleção de ferramentas pode ser tratada como uma segunda mudança reversível, preservando sempre ferramentas essenciais e o guard/permission gate. Não será feito bridge OpenClaw neste slice.

## Evidências e hot paths

| Área | Estado observado | Impacto provável | Ação candidata |
|---|---|---|---|
| Briefing | Cache full/compact já existe | Baixo após primeira chamada | Preservar e medir |
| Mensagens da sessão | `convo` completo enviado aos providers | Prompt cresce sem teto por sessão | Aplicar `selectContextMessages()` |
| Memória cross-session | `getAllMessages()` + resumo de todas as sessões por envio | CPU/latência e pressão de memória | Limite/telemetria; cache em slice posterior |
| Memória durável | `memoryContext(text, 5)` bounded | Baixo/moderado | Preservar |
| Tools | `getToolSchemas()` combina built-ins + skills | Payload de agente sempre inclui catálogo inteiro | Cache/seleção lazy posterior |
| Agente | `maxTurns=6` no loop Hermes local | Limite já existe | Não aumentar; medir |
| Fallback | Hermes nativo → WebLLM e providers locais já possuem fallback | Risco de regressão se otimização mudar transporte | Testar sem alterar fallback |
| OpenClaw | Chat compatível e bridge fake já testado | Integração real ainda externa | Não ativar neste marco |
| Notícias | Briefing somente leitura com fontes | Não é hot path de memória geral | Não tocar |

## Causa raiz versus efeitos

A causa raiz principal é **o contrato de orçamento de contexto não estar conectado ao array enviado por `jarvis.ts`**. O crescimento do payload por conversa, a degradação de latência e a competição de memória são efeitos derivados, não problemas independentes.

A varredura integral de sessões é uma segunda causa potencial, independente do limite da sessão ativa, porque ocorre mesmo que o provider receba poucas mensagens. Ela será tratada somente se o orçamento do contexto não for suficiente ou se os testes/medição mostrarem regressão mensurável.

## Orçamento inicial proposto

| Caminho | `maxMessages` | `maxCharacters` | Justificativa |
|---|---:|---:|---|
| Local | não envia provider | — | Preservar resposta determinística |
| Chat remoto/local sem tools | 24 | 12.000 | Limite compatível com helper existente |
| Agente Claude/Hermes | 32 | 18.000 | Reservar contexto para tool responses sem crescimento ilimitado |

A seleção preservará sempre as mensagens mais recentes e recortará somente o início do corpus quando exceder o limite. A sessão completa continua persistida no IndexedDB; o limite é apenas do payload de inferência.

## Invariantes de segurança

A otimização não pode conceder permissões, remover `runTool()` guard, enviar credenciais ao navegador, tornar OpenClaw obrigatório, alterar o fallback local/Hermes, publicar mensagens, enviar WhatsApp ou buscar notícias automaticamente. `runtimeAuthority` e contratos de promoção permanecem sem alteração.

## Testes e medição planejados

O slice deverá comparar contexto sem limite e contexto limitado com mensagens sintéticas determinísticas, verificando contagem, caracteres, preservação das mensagens finais, marcação de truncamento e ausência de perda do último pedido. Também deverá manter os testes de fallback offline, permissões de ferramentas e integração V2. A medição de antes/depois deve registrar pelo menos caracteres, mensagens selecionadas, `truncated`, duração da preparação do contexto e quantidade de turnos do agente quando disponível.

## Rollback

Rollback é a reversão do commit do wiring de contexto, métricas e testes. Nenhuma alteração externa ou de provider será necessária.

— **Manus AI**

## Implementação e medição inicial

O slice local foi implementado sem bridge externo e publicado diretamente na `main` no SHA `1f47f0c4` (documentação reconciliada no SHA `5e345547`). `src/pages/jarvis.ts` agora aplica `selectContextMessages()` antes de qualquer provider: 12.000 caracteres/24 mensagens para modos sem agente e 18.000 caracteres/32 mensagens para agentes. A sessão completa permanece no IndexedDB, e somente o payload de inferência é recortado. A observação local `JarvisContextObservation` registra apenas modo, mensagens, caracteres, truncamento e duração bounded.

`src/utils/jarvis-tools.js` agora cacheia o catálogo combinado e invalida o cache quando uma ferramenta dinâmica muda. A seleção lazy opcional preserva `navigate`, `system_status`, `read_site_state` e `recall_memory`; adiciona ferramentas por domínio reconhecido; e retorna o catálogo completo quando o foco é desconhecido. `runTool()`, `exigir()` e o guard não foram modificados. Claude Agent e Hermes Agent recebem o foco da pergunta apenas no config transitório.

A validação focal passou em **30/30**. A regressão completa passou em **1179/1179**; `npm run tipos:ts` e `npm run tipos:v2` passaram. Os contratos JARVIS existentes, fallback, permissões, Spotify, console Mark XIII e bridge fake OpenClaw permaneceram verdes.

O benchmark determinístico `scripts/jarvis-context-benchmark.mjs` usou 80 mensagens e 73.278 caracteres como entrada lógica. O budget padrão selecionou 14 mensagens/12.000 caracteres, reduzindo 83,62% do payload lógico; o budget de agente selecionou 20 mensagens/18.000 caracteres, reduzindo 75,44%. O catálogo completo tem 13 schemas; o foco de Arsenal enviou 5 schemas, redução de 61,54%, mantendo os quatro essenciais e `search_arsenal`. Foco desconhecido retornou os 13 schemas completos por segurança. Esses números são benchmark local determinístico, não medição de latência, tokens cobrados ou memória de hardware real.

## Limites e decisão

O custo de `buildMemoryCorpus()` continua sem cache estrutural e ainda pode varrer todas as mensagens de todas as sessões quando a memória entre conversas está ativa. Ele foi deliberadamente deixado para um slice posterior porque exige uma política de invalidação por sessão e não deve ser alterado junto do primeiro wiring de contexto. O loop Claude Agent continua com até oito turnos; o loop Hermes local continua com seis. Nenhum provider, endpoint OpenClaw, WhatsApp, notícia automática ou segredo foi tocado.

— **Manus AI**

## Runner oficial

O runner `/home/ubuntu/run_baluarte_hardening_gates.sh` executou 21 entradas. `event_catalog`, `nexus`, `types_ts`, `types_v2`, `npm_test`, `build`, `v2_integracao`, `smoke`, `caminho_critico`, todos os contratos Python, `module_visual`, `controlled_rollout`, `rls_local`, `distributed_rate_limit`, `v2_doctor` e `py_compile` retornaram código 0. `rust_runtime` retornou código 101 pelo bloqueio conhecido da toolchain Cargo 1.75.0/metadata `edition2024`; isso permanece documentado e não foi mascarado.

A suíte completa deste marco totalizou **1179/1179** testes verdes. O gate de integração V2 permaneceu em **45/45**. O benchmark de payload é lógico/determinístico; não representa uma promessa de FPS, latência de rede, custo de provider ou memória de hardware.
