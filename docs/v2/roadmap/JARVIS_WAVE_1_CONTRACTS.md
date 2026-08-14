# JARVIS — Onda 1: contratos e adapters sem DOM

**Status:** plano aprovado para execução incremental; `jarvis.js` ainda não foi convertido nesta onda.

**Objetivo:** preparar a migração de `src/pages/jarvis.js` para TypeScript começando pelas fronteiras tipadas de sessão, mensagens, configuração e adapters. A primeira onda não deve mudar a UI, não deve alterar o comportamento dos modos e não deve conectar WhatsApp real.

> A regra desta onda é **tipar e testar contratos antes de trocar a superfície**. O arquivo `jarvis.js` continua sendo a implementação em produção até que as ondas posteriores provem equivalência.

## 1. Escopo da Onda J1

A página JARVIS mistura persistência, memória, transporte, renderização e fallback. A Onda J1 separa as fronteiras, mas não move o orquestrador da página. O resultado esperado é um conjunto de declarações `.d.ts` ou módulos TypeScript pequenos que possam ser consumidos pelo futuro `jarvis.ts` sem obrigar a conversão imediata dos motores legados.

| Contrato | Forma inicial | Fonte atual | Critério de fechamento |
| --- | --- | --- | --- |
| `SessionMode` | União dos modos atuais: `local`, `webllm`, `hermes-agente`, `claude`, `ollama`, `hermes-local`, `noticias`, `servidor`, `hermes`, `claude-servidor`, `openclaw`, `agente` | `src/pages/jarvis.js` e motores de modo | Nenhuma string de modo desconhecida entra no dispatcher sem erro explícito |
| `JarvisMessage` | `{ id?, sessionId, role, text, ts, meta? }` | armazenamento de sessões e `handleSend()` | Roles fechadas; mensagens de ferramenta e resposta não confundidas |
| `JarvisSession` | `{ id, title, mode, createdAt, updatedAt }` | criação, listagem e atualização de sessões | Datas e ids validados; sessão atual pode ser excluída do recall |
| `JarvisConfig` | Configuração pública separada de credenciais e endpoints protegidos | `loadConfig()`/`saveConfig()` | Nenhum segredo novo entra em prompt persistente ou renderização |
| `ConversationRequest` | `{ text, session, messages, config, context }` imutável | pipeline de `handleSend()` | O adapter recebe somente o contexto necessário e não o elemento DOM |
| `AdapterResult` | Evento discriminado `reply`, `token`, `progress`, `tool-call` ou `failure` | branches de `handleSend()` | Todo adapter pode ser fakeado sem browser e sem rede |
| `FallbackReason` | `setup`, `network`, `permission`, `timeout`, `model`, `unknown` | `catch` e botões de fallback | Erro operacional não vira erro silencioso nem apaga mensagem |
| `ToolCallEvent` | `{ name, input, result, permission, durationMs? }` | `agente` e `hermes-agente` | Permissões continuam deny-by-default |

## 2. Arquivos da primeira implementação

A primeira implementação deve ser pequena e reversível. Os nomes abaixo são alvos; se um arquivo legado já possuir contrato equivalente, deve-se adicionar uma fronteira declarativa em vez de duplicar runtime.

| Arquivo | Ação | Motivo |
| --- | --- | --- |
| `src/utils/jarvis-contracts.ts` | Criar tipos puros e type guards | Concentrar as uniões sem efeitos colaterais |
| `src/utils/jarvis-contracts.d.ts` | Não criar se o `.ts` for o contrato canônico | Evitar duas fontes de verdade |
| `src/utils/jarvis-sessions.d.ts` | Declarar somente se o storage de sessões continuar JS | Fechar IndexedDB sem converter o storage inteiro |
| `src/utils/jarvis-engine.d.ts` | Expandir gradualmente por adapter | Evitar tipar todas as 12 integrações de uma vez |
| `src/utils/jarvis-brain.d.ts` | Adicionar tipos de memória somente quando usados por J2 | Preservar a fronteira já existente |
| `test/jarvis-contracts.test.js` | Criar testes de aceitação de tipos em runtime | Validar guardas, modos e payloads inválidos |
| `docs/v2/roadmap/JARVIS_WAVE_1_CONTRACTS.md` | Manter esta decisão e os resultados | Permitir reprodução por novos colaboradores |

## 3. Ordem de execução

### J1.1 — Inventário de adapters

Mapear cada função de processamento atualmente importada por `jarvis.js`: Local, Claude, Ollama, Hermes local, Notícias, Servidor, Hermes remoto, Claude servidor, OpenClaw, WebLLM, Agente e Hermes Agente. Para cada função registrar entrada, saída, streaming, timeout, dependência de DOM, segredo exigido, fallback e teste fake correspondente.

A saída desta etapa é uma tabela de adapters, não uma mudança de comportamento. Funções que ainda aceitam objetos sem contrato devem receber uma fronteira `.d.ts` mínima e explícita, sem `any`.

### J1.2 — Contratos puros

Criar tipos para `SessionMode`, roles, configuração pública, mensagens, sessão, request e eventos. Adicionar type guards para dados vindos de storage ou rede. Valores desconhecidos devem produzir `false` ou erro estruturado; nunca devem ser convertidos silenciosamente para `local`.

### J1.3 — Configuração e segurança

Separar campos que podem aparecer na UI, como modo e modelo, dos campos que só podem permanecer no bridge ou backend, como token OpenClaw, API keys e senhas. O tipo frontend não deve sugerir que um segredo seja seguro no localStorage. O modo OpenClaw da primeira onda permanece limitado a health/chat fake e não possui operação de envio WhatsApp.

### J1.4 — Adapters fakeáveis

Definir uma interface `JarvisAdapter` com método de conversa e, quando necessário, stream de eventos. Criar fakes determinísticos para resposta, timeout, permissão negada, indisponibilidade e tool call. A implementação legada pode ser adaptada atrás dessa interface sem mover o `handleSend()` ainda.

### J1.5 — Testes de contrato

Os testes devem cobrir: todos os modos válidos; modo desconhecido; mensagem com role inválida; sessão sem id; configuração contendo segredo; resposta vazia; evento de token fora de ordem; timeout; erro de rede; permissão negada; tool call sem permissão; e fallback para Local sem apagar a mensagem original.

### J1.6 — Gate da Onda J1

A onda só fecha quando `npm run tipos:ts`, testes focais, `npm test`, `npm run build`, `npm run smoke`, `npm run v2:integracao` e `npm run caminho-critico` estiverem verdes ou documentados contra o baseline. `npm run tipos:v2` deve continuar nos 61 diagnósticos históricos, sem crescimento atribuído ao JARVIS.

## 4. O que fica fora da J1

A J1 não converte `jarvis.js`, não altera o layout, não muda a ordem do pipeline de `handleSend()`, não substitui a memória, não adiciona novos modelos, não liga WhatsApp real, não publica notícias e não executa vendas ou anúncios. Também não deve introduzir uma segunda camada de permissões: o contrato existente de `jarvis-permissoes` continua sendo a fonte de decisão.

## 5. Onda seguinte após J1

Depois dos contratos, a Onda J2 extrairá `buildMemoryCorpus`, briefing compacto, recall e memória durável para um serviço sem DOM. J2 terá testes de corpus vazio, exclusão da sessão atual, limite de documentos, deduplicação, erro best-effort e tamanho máximo do prompt. Somente após J1 e J2 o dispatcher de modos poderá ser isolado para preparar `jarvis.ts`.

## 6. Rollback

O rollback é feito removendo o novo contrato e os fakes, sem tocar em `jarvis.js`, sessões, memória, OpenClaw bridge ou configuração persistida. Se qualquer consumidor descobrir incompatibilidade, o wrapper e os motores legados continuam sendo a rota de produção. Nenhuma migração desta onda pode apagar dados ou enviar mensagens externas.

## 7. Referências

[1]: ../../../src/pages/jarvis.js "Orquestrador atual do JARVIS"
[2]: ../../../src/utils/jarvis-engine.js "Motores e modos do JARVIS"
[3]: ../../../src/utils/jarvis-permissoes.ts "Permissões deny-by-default"
[4]: ../../../src/utils/jarvis-context.ts "Briefing completo e compacto"
[5]: ../JARVIS_EDITOR_MIGRATION_PLAN.md "Mapa geral de contratos e ondas JARVIS/Editor"
