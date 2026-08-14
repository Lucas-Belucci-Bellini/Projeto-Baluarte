# Integração do JARVIS com OpenClaw, WhatsApp e Notícias

## Estado desta integração

O Projeto-Baluarte possui dois caminhos complementares. O modo **OpenClaw** do JARVIS conversa com uma instância self-hosted do OpenClaw por um endpoint compatível com OpenAI. O módulo **Briefing** usa o backend de busca web existente para produzir rascunhos de notícias com fonte e URL, sem enviar mensagens ou publicar conteúdo.

O primeiro marco é deliberadamente somente leitura. Ele prova contrato, cache de contexto, proveniência, bridge, isolamento e testes sem conectar ou enviar uma mensagem real pelo WhatsApp.

## O que a documentação oficial atual confirma

A documentação atual do OpenClaw descreve um Gateway sempre ativo que concentra WebSocket de controle, RPC e APIs HTTP. Entre as superfícies compatíveis com OpenAI estão `GET /v1/models`, `POST /v1/embeddings`, `POST /v1/chat/completions` e `POST /v1/responses`.[1] O Gateway exige autenticação por padrão, inclusive em loopback, por token ou senha compartilhados.[2]

Para controle de sessões e Chat UI, o protocolo WebSocket usa primeiro um request `connect` e, depois, métodos como `chat.history`, `chat.send`, `chat.inject` e `chat.message.get`. O método `chat.send` usa chave de idempotência para evitar duplicação quando uma requisição é repetida.[3]

> **Decisão:** o projeto não implementa um método RPC de chat inventado. Primeiro usa o endpoint oficial `/v1/chat/completions`. Um cliente WebSocket só será necessário quando houver uma operação de sessão/canal que não possa ser atendida pela API compatível.

## Arquitetura do primeiro marco

```text
JARVIS no navegador
        │
        │ POST /v1/chat/completions
        ▼
OpenClaw direto ou bridge local em 127.0.0.1:18790
        │  token/senha permanece no processo local
        ▼
OpenClaw Gateway em 127.0.0.1:18789
        │
        ├── modelo/agent do OpenClaw
        └── canais autorizados, incluindo WhatsApp

Briefing V2
        │
        │ consulta somente leitura
        ▼
/api/chat ou backend configurado
        │ busca web do provedor
        ▼
rascunho com fonte, URL, data e limitações
```

O bridge está em `scripts/openclaw-bridge.mjs`. Ele expõe somente `GET /health` e `POST /v1/chat/completions`, escuta em loopback por padrão, limita o corpo, valida `messages`, restringe CORS a origens locais ou à origem configurada, aplica timeout e não implementa rotas de envio de WhatsApp.

## Execução local do bridge

Inicie o Gateway OpenClaw com autenticação habilitada, conforme a instalação local. Depois, execute o bridge em outro terminal:

```bash
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789 \
OPENCLAW_GATEWAY_TOKEN="$OPENCLAW_GATEWAY_TOKEN" \
BALUARTE_ALLOWED_ORIGIN=http://localhost:5173 \
node scripts/openclaw-bridge.mjs
```

O token deve ser fornecido ao processo local por variável de ambiente, cofre ou gerenciador de serviço. Não deve ser salvo no `localStorage`, no frontend, em commit ou em uma URL.

No JARVIS, configure o modo OpenClaw com:

| Campo | Valor recomendado |
|---|---|
| URL do OpenClaw | `http://127.0.0.1:18789` quando o Gateway expõe diretamente a API compatível |
| URL do bridge | `http://127.0.0.1:18790` quando o token precisa permanecer fora do navegador |
| Endpoint | `/v1/chat/completions` |
| Modelo | `openclaw` ou o alias publicado por `GET /v1/models` |

Para validar sem conversar com o modelo, use primeiro:

```bash
curl -fsS http://127.0.0.1:18790/health
curl -fsS http://127.0.0.1:18789/v1/models
```

O segundo comando pode exigir o header de autenticação da instalação do OpenClaw. O bridge não possui rota para enviar uma mensagem externa nem para escolher destinatário de WhatsApp.

## WhatsApp: limites e próxima etapa

O OpenClaw é a camada que mantém a conexão de canais. O Projeto-Baluarte não deve colocar credenciais, QR code, cookies ou tokens de WhatsApp no frontend. No primeiro marco, são permitidos health check, leitura controlada, geração de rascunho e simulação.

O envio real será uma etapa separada e exigirá confirmação explícita do operador contendo, no mínimo, canal, destinatário, conteúdo final e momento do envio. A confirmação não será substituída por uma instrução do modelo. Logs devem ser redigidos e idempotência precisa ser testada antes de habilitar qualquer operação side-effecting.

## Notícias e briefing

O novo modo **Briefing** do JARVIS usa o backend de busca existente. Ele exige que cada rascunho preserve o link original e instrui o modelo a separar fato de análise, declarar lacunas e não inventar URLs. A camada TypeScript em `src/utils/news-briefing.ts` normaliza itens, rejeita registros sem fonte ou URL, limita campos, deduplica por URL/título e mantém `candidate`, `reviewed` e `published` como estados distintos.

O primeiro módulo nativo V2 está em `v2/modules/briefing/`. Seu manifesto declara `NETWORK`, possui storage próprio `briefing:items`, emite apenas `briefing:atualizado`, expõe `health`, `prompt`, `ingest` e `list`, e publica uma superfície experimental em `/briefing` no harness V2. A permissão declarada não é concessão automática: o Permission System continua sendo a autoridade.

## Testes do marco

A cobertura determinística está em `test/jarvis-first-slice.test.js` e valida:

- cache do briefing completo e variante compacta;
- limite de histórico por caracteres e mensagens;
- rejeição e deduplicação de notícias;
- prompt de briefing explicitamente somente leitura;
- bridge contra um upstream fake, incluindo CORS e encaminhamento;
- registro do módulo V2 e ciclo abrir/fechar do Runtime.

Nenhum teste deste marco conecta uma conta real do OpenClaw, WhatsApp ou outro canal externo.

## Fontes

[1]: https://docs.openclaw.ai/gateway "OpenClaw Gateway runbook e endpoints OpenAI-compatible"
[2]: https://docs.openclaw.ai/gateway/authentication "OpenClaw Gateway authentication"
[3]: https://docs.openclaw.ai/web/webchat "OpenClaw WebChat e métodos de sessão"
[4]: https://docs.openclaw.ai/gateway/protocol "OpenClaw Gateway WebSocket protocol"
[5]: https://docs.openclaw.ai/reference/rpc "OpenClaw RPC adapters"
