# 🐾 OpenClaw no JARVIS e no Conselho

## O que é (com honestidade)
O [OpenClaw](https://github.com/openclaw/openclaw) é um **assistente de IA
self-hosted** (Node/TS) que roda na **sua máquina** como um *control plane* —
ele orquestra IA por vários canais (WhatsApp, Telegram, Slack, Discord, Signal,
iMessage…) com um **gateway** (porta padrão `18789`).

Dois pontos importantes:
1. **É self-hosted** — roda no seu hardware, **não** na Vercel. O site (no
   navegador) fala com o seu OpenClaw, igual ao modo **Ollama**.
2. O **gateway nativo é RPC** (métodos como `send`, `chats.list`,
   `watch.subscribe`) para gerenciar canais/sessões — **não** é um endpoint de
   chat-completions OpenAI pronto.

## Como conectamos
Adicionamos no JARVIS o modo **OpenClaw** (e ele entra no **Conselho de IAs**)
como um conector HTTP **configurável e tolerante**:
- Você define **URL** (padrão `http://localhost:18789`) e **endpoint**
  (padrão `/v1/chat/completions`) em **JARVIS → ⚙ → modo OpenClaw**.
- Ele envia `{ messages: [...] }` (formato OpenAI) e aceita várias formas de
  resposta (`choices[].message.content`, `reply`, `response`, `content`, `text`…).
- Definir a URL também faz o OpenClaw **entrar automaticamente no Conselho**.

## O elo que falta (o bridge)
Como o gateway do OpenClaw é **RPC**, ele só responde a esse conector se houver
um **endpoint de chat compatível com OpenAI**. Duas opções:
- **A) OpenClaw expõe um endpoint OpenAI-compat** (se/quando existir): aponte a
  URL/endpoint pra ele. Pronto.
- **B) Bridge** (recomendado por ora): um adaptador pequeno que recebe
  `POST /v1/chat/completions` e fala o RPC do OpenClaw por baixo. Me diga o
  método exato do gateway que "manda um prompt e devolve a resposta" (da doc
  https://docs.openclaw.ai/reference/rpc) e eu escrevo esse bridge (~50 linhas).

## CORS / mixed-content
- O navegador acessa `http://localhost:18789` mesmo a partir do site HTTPS
  (localhost é permitido). Para **outra máquina**, use **https://** (um túnel),
  senão o navegador bloqueia (mixed content).
- O gateway precisa **permitir CORS** do domínio do site (cabeçalho
  `Access-Control-Allow-Origin`).

> Resumo: a integração **já está pronta no site**. Falta só apontar pra um
> endpoint de chat do seu OpenClaw — nativo ou via bridge.
