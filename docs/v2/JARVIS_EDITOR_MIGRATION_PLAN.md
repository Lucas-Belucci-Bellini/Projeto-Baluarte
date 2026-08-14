# Plano de migração segura — JARVIS e Editor

**Status:** análise de contratos; nenhuma dessas duas páginas foi convertida nesta onda.

**Objetivo:** fechar as fronteiras de estado, transporte, memória, DOM, execução e lifecycle antes de transformar `jarvis.js` e `editor.js` em implementações TypeScript canônicas.

> As páginas `jarvis.js` e `editor.js` não devem ser migradas apenas por cópia mecânica de extensão. Ambas são orquestradores de muitos subcontratos legados e precisam de ondas próprias, testes focais e rollback independente.

## 1. JARVIS — contrato atual

A página JARVIS possui aproximadamente 998 linhas e importa motores de conversa, WebLLM, Hermes, OpenClaw, memória, recall, skills, syntax highlight, gráficos, catálogo de linguagens, status e router. Ela não é somente uma view: é uma máquina de estados assíncrona que mantém sessões, mensagens, configuração, modo atual e estado de execução.[1]

| Fronteira | Contrato observado | Risco | Tratamento necessário |
| --- | --- | --- | --- |
| Sessões | `createSession`, `listSessions`, `updateSession`, `deleteSession`, `addMessage`, `getMessages`, `getAllMessages` | Alto | Criar `Session`, `JarvisMessage`, `SessionMode` e contratos de fallback; preservar IndexedDB e o limite de histórico |
| Configuração | `loadConfig()`/`saveConfig()` com modo, prompts, URLs, modelos, chaves locais, memória, humanização e skills | Muito alto | Separar configuração pública, segredo local e configuração de backend; nunca expor segredo novo no tipo ou no prompt |
| Modos | `local`, `webllm`, `hermes-agente`, `claude`, `ollama`, `hermes-local`, `servidor`, `noticias`, `hermes`, `claude-servidor`, `openclaw` e `agente` | Muito alto | Usar união discriminada ou adaptadores por modo; cada branch deve retornar `Promise<string>` ou um contrato de streaming próprio |
| Contexto | Briefing compacto/completo, status do site, memória entre sessões e memória durável | Alto | Reutilizar `jarvis-context.ts`, limitar tamanho por chamada e impedir persistência acidental do `systemPrompt` enriquecido |
| Recall | `getAllMessages()` → agrupamento por sessão → `summarizeSession` → `recall` → cache de memória | Alto | Tipar documentos de recall, excluir a sessão atual e testar corpus vazio, falha de memória e limite de resultados |
| Ferramentas | Callbacks de tool-call visíveis em `agente` e `hermes-agente`; skills com persistência própria | Muito alto | Tipar `ToolCallEvent`, `ToolResult`, permissões e estados `ok/erro`; manter deny-by-default |
| WebLLM | Progresso de download, tokens parciais e bolha de resposta viva | Alto | Isolar o contrato de streaming antes de converter a página; garantir que `removeTyping` e `scrollDown` sejam idempotentes |
| OpenClaw | Conversa via endpoint configurável; bridge local com health e `/v1/chat/completions` | Muito alto | O browser não recebe token do Gateway; manter o modo sem envio WhatsApp e exigir confirmação em marco separado |
| Fallback | Qualquer modo não-local oferece caminho para WebLLM ou Local | Médio | Tipar erro operacional versus erro de produto; fallback não pode alterar permissões nem apagar a mensagem original |
| UI | Renderização de mensagens, Markdown/code fences, gráficos, tool calls, sessões, input e painel de configuração | Alto | Separar renderers puros de efeitos; evitar `innerHTML` fora do highlighter e dos gráficos controlados |

### 1.1 Pipeline de envio que precisa ser preservado

`handleSend()` cria ou reutiliza sessão, persiste a mensagem do operador, captura memória, injeta briefing e status, faz recall de conversas anteriores, acrescenta memória durável, escolhe o adapter de modo, persiste a resposta, renderiza a saída e oferece fallback em caso de setup. A sequência atual aparece em `jarvis.js` entre as linhas 340 e 608.[1]

A migração segura deve extrair primeiro um `JarvisConversationService` sem DOM. Esse serviço recebe uma requisição imutável com `{ text, session, messages, config }` e retorna um evento discriminado: `reply`, `token`, `progress`, `tool-call` ou `failure`. A página TypeScript ficará responsável apenas por conectar esses eventos à UI. Isso reduz o maior risco atual: misturar persistência, rede, memória e renderização dentro de cada branch de modo.

### 1.2 Ondas recomendadas para JARVIS

| Onda | Escopo | Saída bloqueadora |
| --- | --- | --- |
| J1 | Declarações de `Session`, `JarvisMessage`, `JarvisConfig`, modos e adapters existentes | Typecheck das fronteiras sem modificar runtime |
| J2 | Extrair e testar `buildMemoryCorpus`, briefing compacto, recall e memória durável | Testes de corpus vazio, exclusão de sessão, limite e falha best-effort |
| J3 | Extrair dispatcher dos modos sem DOM | Cada modo mantém contrato de resposta e fallback |
| J4 | Tipar renderers de mensagem, código, gráficos, tool calls e streaming | Smoke da rota e teste de conteúdo não confiável |
| J5 | Converter a página `jarvis.ts` e manter `jarvis.js` como wrapper | `tipos:ts`, 876+ testes, build, smoke, caminho crítico e teste de todos os modos fake |
| J6 | Revisar OpenClaw/WhatsApp e permissões | Nenhum envio externo automático; health e chat somente leitura/fake primeiro |

## 2. Editor — contrato atual

A página Editor possui aproximadamente 972 linhas e coordena tabs, persistência, syntax highlight, autocomplete, runners, VFS, busca/substituição, atalhos globais, preview e cleanup de rota. O estado da página depende do motor `editor-engine.js`, do catálogo `editor-langs.js`, do autocomplete e do VFS.[2]

| Fronteira | Contrato observado | Risco | Tratamento necessário |
| --- | --- | --- | --- |
| Estado persistido | `editor:state` com `{ tabs: [{ id, name, lang, content }], activeId }` | Alto | Validar storage como `unknown`, criar `EditorState`/`EditorTab` e garantir ao menos uma tab |
| Linguagens | 26 definições com id, extensão, runner, comentários, delimitadores e flags | Alto | Criar `LanguageDefinition` compartilhada com JARVIS e highlighter; não duplicar catálogo |
| Mutations | `addTab`, `closeTab`, `getActiveTab`, `updateTabContent`, `changeTabLang`, `renameTab` | Alto | Tornar transições explícitas e testar fechar tab ativa, última tab e renomeação vazia |
| Runner | JS em iframe `srcdoc`, HTML/CSS em iframe, Markdown em HTML e demais linguagens em logs | Muito alto | Tipar `RunResult` discriminado; preservar sandbox, escaping de `</script>` e mensagem de não-runner |
| VFS | Abrir e salvar arquivos entre Editor e Terminal, usando árvore persistida | Muito alto | Tipar `VNode`, paths e erros; testar arquivo ausente, diretório, escrita e nomes inválidos |
| Autocomplete | Snippets → keywords → palavras do arquivo; dropdown perto do cursor; Tab/Enter aceita; Esc fecha | Alto | Tipar `AutocompleteItem` e `AutocompleteController`; manter prioridade antes dos atalhos do Editor |
| Teclado | Ctrl+Enter, Ctrl+S, Ctrl+W, Ctrl+T, Tab, Shift+Tab, comentários, duplicar/mover linha, pares | Muito alto | Extrair reducer/commands; testar seleção, indentação, cursor e prevenção de evento |
| Busca/substituição | Painel com estado próprio, navegação entre matches e substituição | Alto | Extrair `FindReplaceState`; testar regex inválida, zero matches, seleção e rerender |
| Preview | Iframe, HTML renderizado ou logs; atualização após run | Alto | Separar `PreviewRenderer` do DOM principal e limpar preview ao trocar tab/rota |
| Lifecycle | Handler global `window.keydown` instalado na página e removido por `aoSair` | Muito alto | Criar contrato explícito de disposer; garantir que não haja atalhos duplicados após rerenders |
| Status | `setStatus('editor', ...)` publica estado de tab, linguagem, runner e preview | Médio | Usar resumo serializável e limpar ao sair/quarentenar módulo |

### 2.1 Sequência segura para Editor

A primeira onda deve converter ou declarar os contratos do motor, não a página inteira. O `editor-engine.js` já concentra o shape de tabs, persistência e runners, enquanto `editor-autocomplete.js` concentra uma máquina de estado própria com `refresh`, `handleKey`, `close` e `isOpen`.[3] [4]

A ordem recomendada é: primeiro `LanguageDefinition` e `EditorState`; depois `editor-engine.ts` com `RunResult`; em seguida `vfs.ts` ou uma fronteira `.d.ts` com testes; depois `editor-autocomplete.ts`; então separar comandos de teclado e find/replace; somente ao final converter a composição da página para `editor.ts`. O wrapper `editor.js` deve permanecer até o smoke provar que a rota, o Terminal, o VFS, o reload e a limpeza de lifecycle continuam íntegros.

## 3. O que não deve ser feito

Não se deve converter `jarvis.js` ou `editor.js` copiando o arquivo inteiro e adicionando anotações locais. Isso esconderia contratos incompletos com coerções e criaria uma onda difícil de reverter. Também não se deve tipar `editor.js` com um catálogo paralelo de linguagens, nem permitir que a migração do JARVIS introduza segredo de OpenClaw no browser, nem transformar o runner do Editor em execução no contexto principal da página.

O limite de cada futura onda é: um contrato novo por vez, uma implementação canônica, um wrapper compatível, testes focais e os gates V1/V2. A dívida JSDoc histórica da V2 continua separada e não deve ser mascarada pela migração dessas páginas.

## 4. Rollback

O rollback de JARVIS deve remover o dispatcher tipado e restaurar o wrapper para a implementação JavaScript anterior sem alterar `jarvis-memory`, `jarvis-brain` ou o bridge OpenClaw. O rollback de Editor deve restaurar a composição `editor.js` e preservar o estado `editor:state`, o VFS e os dados do usuário. Nenhum rollback deve apagar storage, sessões, tabs ou arquivos virtuais.

## Referências

[1]: ../../src/pages/jarvis.js "Página JARVIS e pipeline de modos"
[2]: ../../src/pages/editor.js "Página Editor e lifecycle de UI"
[3]: ../../src/utils/editor-engine.js "Estado, tabs e runners do Editor"
[4]: ../../src/utils/editor-autocomplete.js "Autocomplete, eventos e inserção de sugestões"
[5]: ../../src/data/editor-langs.js "Catálogo compartilhado de linguagens"
