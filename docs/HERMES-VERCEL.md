# 🧠 Hermes no Vercel (modo "Hermes servidor")

## A resposta curta
- **Rodar os *pesos* do Hermes na própria Vercel:** ❌ não dá de forma útil.
  As funções serverless da Vercel são **CPU‑only** (sem GPU), com limite de
  memória (~3 GB), tempo (60 s) e tamanho de bundle (250 MB). Um LLM de 7B+ não
  roda ali na prática.
- **Rodar o Hermes *através* da Vercel (proxy):** ✅ **dá — e é o "cinema".**
  Uma função serverless (`api/hermes.py`) chama um provedor que hospeda o Hermes
  (com GPU). A Vercel só intermedia e guarda a chave — igual ao `api/chat.py`
  faz com o Gemini. Funciona em **qualquer device, sem WebGPU**, e até os
  modelos grandes (70B/405B) ficam usáveis.

## Como ligar (2 min)
1. Crie uma chave grátis em **https://openrouter.ai/keys**.
2. Na Vercel → projeto **projeto-baluarte** → **Settings → Environment Variables**:
   - `OPENROUTER_API_KEY` = a sua chave (Production + Preview).
   - *(opcional)* `HERMES_MODEL` = `nousresearch/hermes-3-llama-3.1-70b`
     (padrão) ou outro, ex.: `nousresearch/hermes-3-llama-3.1-405b`.
3. **Redeploy**. Pronto.

## Onde aparece
- **JARVIS → modo "Hermes (servidor)"**: conversa direta com o Hermes server‑side.
- **Conselho de IAs** (`/conselho`): o Hermes entra **automaticamente** como
  mais um membro assim que a chave estiver definida.

## As três formas de Hermes no site
| Forma | Onde roda | Precisa de | Observação |
|-------|-----------|------------|------------|
| Agente hermes (skills) | navegador | nada | já existia (modo Agente) |
| Modelo no navegador | GPU do usuário (WebGPU) | Chrome/Edge | baixa ~2–5 GB |
| **Hermes servidor (Vercel→OpenRouter)** | **GPU do provedor** | `OPENROUTER_API_KEY` | **qualquer device** |

> Trocar de provedor: defina `HERMES_ENDPOINT` (ex.: Together/Fireworks, que
> também são compatíveis com a API de chat). O `api/hermes.py` usa só a stdlib.
