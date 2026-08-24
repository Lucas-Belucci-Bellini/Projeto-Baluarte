# JARVIS — Contrato de otimização local v1

**Status:** CONTRACT FIRST — sem provider externo
**Base SHA:** `9aae1f4a14217c940895d8837bb129505a663792`
**Objetivo:** reduzir o payload de inferência e o trabalho de preparação por turno, preservando a conversa, os guards, o fallback offline e a compatibilidade com OpenClaw local.

## 1. Budget de contexto

O helper existente `selectContextMessages()` passa a ser aplicado no caminho de envio da página JARVIS. A sessão inteira continua persistida; somente a cópia enviada ao provider é limitada.

| Modo | Máximo de mensagens | Máximo de caracteres | Uso |
|---|---:|---:|---|
| Provider sem agente | 24 | 12.000 | Claude, Ollama, Hermes local/servidor, OpenClaw, servidor e WebLLM |
| Agente | 32 | 18.000 | Claude Agent e Hermes Agent, incluindo respostas de ferramentas |
| Local | — | — | Não monta payload remoto |

A seleção percorre do fim para o início, preserva a pergunta atual e as mensagens mais recentes, recorta o texto mais antigo quando necessário e retorna métricas `messages`, `characters` e `truncated`.

## 2. Métricas bounded

A preparação deve produzir uma observação local sem texto de usuário, token, URL privada, resposta completa ou identificador de sessão. Os campos permitidos são `mode`, `messages`, `characters`, `truncated`, `toolSchemas`, `preparationMs` e `turns` quando medidos. A observação pode ser enviada ao console/telemetria local existente, mas não cria autoridade nem altera o `PlatformDiagnostic`.

## 3. Briefing e memória

O cache full/compact do briefing é preservado. A memória durável continua limitada a cinco fatos. O recall cross-session permanece best-effort e fora do primeiro caminho de mudança estrutural: a otimização deste slice não altera IndexedDB, Nexus, o algoritmo TF-IDF ou a persistência.

## 4. Schemas de ferramentas

`getToolSchemas()` mantém o comportamento completo por padrão. O catálogo combinado passa a ter cache invalidado quando uma skill dinâmica é registrada/removida. Uma seleção lazy opcional recebe a pergunta recente:

- sempre mantém `navigate`, `system_status`, `read_site_state` e `recall_memory`;
- adiciona ferramentas focadas quando a pergunta contém o domínio correspondente: arsenal, equipe, arco, cálculo, editor, cor ou skills;
- se nenhum domínio for reconhecido, retorna o catálogo completo para não reduzir capacidade por desconhecimento;
- preserva skills dinâmicas quando o foco for skill e nunca remove o guard, `exigir()` ou `runTool()`.

A seleção é somente de schema enviado ao modelo; a execução continua passando pela fronteira de permissão e pelo guard existentes.

## 5. Agente e fallback

O loop local mantém `maxTurns=6`. O fallback Hermes nativo → WebLLM permanece igual. OpenClaw continua opcional e local; nenhuma bridge nova, endpoint externo, WhatsApp, publicação ou notícias automáticas entra neste slice.

## 6. Invariantes

A otimização não pode aumentar autoridade, converter `deny-by-default` em permissão implícita, remover ferramentas de segurança, alterar rotas V1, expor secrets, enviar conteúdo externo ou transformar falha de provider em falha do boot. `runtimeAuthority` continua `not-authorized` e qualquer promoção pública continua proibida.

## 7. Testes obrigatórios

Os testes devem cobrir seleção de contexto e métricas, preservação da última mensagem, cache/invalidação de schemas, foco reconhecido e desconhecido, inclusão das ferramentas essenciais, execução protegida por permissão, fallback local e regressão dos providers existentes.

## 8. Rollback

Rollback é a reversão do commit que conecta o budget de contexto, as métricas e a seleção opcional de schemas. Nenhum dado persistido será migrado e nenhuma configuração externa será necessária.

— **Manus AI**
