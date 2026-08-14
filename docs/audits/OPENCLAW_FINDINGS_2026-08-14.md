# OpenClaw — findings de integração

**Data da consulta:** 14 de agosto de 2026
**Fontes oficiais consultadas:**

- [RPC adapters](https://docs.openclaw.ai/reference/rpc)
- [Gateway protocol](https://docs.openclaw.ai/gateway/protocol)
- [WebChat](https://docs.openclaw.ai/web/webchat)
- [Gateway runbook](https://docs.openclaw.ai/gateway)

## Constatações

1. A documentação de RPC descreve `send`, `chats.list`, `watch.subscribe` e `watch.unsubscribe` como métodos usados em adaptadores externos; ela não apresenta um método genérico de “prompt → resposta” no endpoint descrito como RPC adapter.
2. O Gateway atual possui protocolo WebSocket com frames `{type:"req", id, method, params}` e respostas `{type:"res", id, ok, payload|error}`. O primeiro request precisa ser `connect`, com autenticação e escopos.
3. O Gateway atual também expõe, na própria porta padrão, endpoints compatíveis com OpenAI: `GET /v1/models`, `POST /v1/embeddings`, `POST /v1/chat/completions` e `POST /v1/responses`.
4. O caminho preferencial para o JARVIS no primeiro marco é usar diretamente `POST /v1/chat/completions` quando a instância OpenClaw estiver configurada para isso, com autenticação protegida e sem assumir que `localhost` significa ausência de auth.
5. Para interações de controle, sessões, histórico e canais, a documentação oficial descreve os métodos WebSocket `chat.history`, `chat.send`, `chat.inject` e `chat.message.get`. `chat.send` exige chave de idempotência.
6. O gateway exige autenticação por padrão, inclusive em loopback, e suporta token/senha compartilhados. Credenciais não podem ser colocadas no frontend nem em URLs públicas.
7. O Gateway é um processo sempre ativo que também suporta canais externos. A ponte Baluarte deve ser um adaptador de contrato, não um novo gateway de WhatsApp.

## Decisão provisória do marco

O primeiro marco não deve implementar um RPC inventado. Deve:

- atualizar `docs/OPENCLAW.md` para refletir que o endpoint OpenAI-compatible existe nas versões atuais;
- manter `processOpenClaw()` tolerante, adicionando configuração de autenticação apenas no backend/bridge quando necessário;
- criar um bridge local opcional que proteja o token e normalize respostas, sem enviar mensagens externas automaticamente;
- usar o JARVIS para gerar/consultar briefings de notícias somente em modo de leitura e rascunho;
- testar a integração com endpoint falso local e não com WhatsApp real sem confirmação explícita do operador.
