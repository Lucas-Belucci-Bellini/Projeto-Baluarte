# ⬡ Núcleo Baluarte — Backend de IA (opcional)

Servidor Python que dá ao **J.A.R.V.I.S.** um modelo mais forte e **busca na web
de verdade** (Google Search via Gemini) — a *camada 2* do raciocínio em 3 camadas
(doc 08 do plano da IA). É o **plano B** do doc 04: entra só quando você quer
pesquisa web real; para uso local sem chave, o modo **Ollama** já existe, e o
modo **Navegador (WebLLM)** roda 100% no cliente.

> **Isto NÃO faz parte do site.** A Vercel só empacota `src/` + `public/`. O site
> continua estático; este servidor roda à parte e o site fala com ele por uma URL
> configurável. Por isso nenhuma reescrita do site foi necessária — o backend é
> aditivo (entra como mais um *modo* do J.A.R.V.I.S., igual ao Ollama).

## Como rodar

```bash
cd backend
pip install -r requirements.txt

# chave gratuita do Google AI Studio (https://aistudio.google.com/apikey)
export GEMINI_API_KEY="sua-chave"      # Windows: set GEMINI_API_KEY=sua-chave

python server.py                        # sobe em http://127.0.0.1:8000
```

Confira: abra <http://127.0.0.1:8000/health> — deve responder `{"ok": true, "hasKey": true}`.

## Usar no site

No J.A.R.V.I.S. (`/jarvis`): **⚙ Modos & Config → modo "Servidor"** e confirme a
URL (`http://127.0.0.1:8000`). Mande uma pergunta que dependa de algo atual —
o servidor pesquisa no Google e responde.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status + se a `GEMINI_API_KEY` está configurada |
| `POST` | `/chat` | `{ messages: [{role, content}], system }` → `{ resposta }` |

O servidor é **stateless**: o site envia a conversa inteira a cada chamada (o
histórico vive no site, em IndexedDB), evitando dessincronização.

## Deploy (opcional)

Para uso fora da sua máquina, hospede este servidor (Render, Railway, Fly, uma
VM…) e aponte a URL do modo "Servidor" para o endereço público. Mantenha a
`GEMINI_API_KEY` apenas no ambiente do servidor — nunca no front.
