# 🤖 J.A.R.V.I.S. com IA real (Gemini) — ativar em 1 minuto

O modo **Servidor** do JARVIS usa o **Gemini** (Google) com **busca no Google**,
rodando no backend serverless do próprio site (`api/chat.py` → `/api/chat`). Assim
**qualquer visitante** conversa com IA real — sem API key própria nem download.

Falta só **uma** coisa: a variável `GEMINI_API_KEY` no projeto da Vercel. É **grátis**.

## Passo a passo

### 1. Pegue a chave (grátis)
1. Acesse **https://aistudio.google.com/apikey** (Google AI Studio).
2. Faça login com a conta Google.
3. **Create API key** → copie a chave (começa com `AIza…`). O tier gratuito é
   generoso, suficiente para o site.

### 2. Cole na Vercel
1. **https://vercel.com** → projeto **projeto-baluarte**.
2. **Settings → Environment Variables**.
3. Adicione:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** a chave `AIza…`
   - **Environments:** marque **Production** (e Preview, se quiser).
4. **Save**.

### 3. Redeploy
A env var só passa a valer após um novo deploy:
- **Deployments → ⋯ no último → Redeploy**, ou faça qualquer push.

### 4. Confirme ✅
- Abra `https://projeto-baluarte.vercel.app/api/health` → deve mostrar
  `"hasKey": true`.
- No site: **/jarvis → ⚙ Modos & Config → modo Servidor → Testar conexão** →
  "online · chave Gemini OK". Pronto, é só conversar.

## Como funciona
- O frontend envia a conversa + um **dossiê do Baluarte** (identidade, universos,
  equipes, contagens) + o estado do site. O Gemini responde com isso e com **busca
  no Google** para fatos recentes.
- A chave fica **só no servidor** (env var) — nunca exposta ao visitante.
- Modelo: `gemini-2.5-flash` (troque com a env `BALUARTE_MODEL`).

## Outros modos (alternativas)
- **Navegador (WebLLM):** IA no próprio navegador, sem key (precisa WebGPU + baixar o modelo 1×).
- **Local:** assistente de regras, offline, sempre disponível.
- **Claude / Ollama:** exigem key/instalação próprias.
