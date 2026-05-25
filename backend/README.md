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

## Deploy em 1 clique (HTTPS — para o site publicado)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte)

1. Pegue uma chave Gemini (grátis): <https://aistudio.google.com/apikey> → **Create API key**.
2. Clique no botão acima → o Render lê o `render.yaml` e cria o serviço **baluarte-ia-backend**.
3. No serviço (Render) → **Environment** → defina `GEMINI_API_KEY` com a sua chave.
4. Quando ficar **Live**, copie a URL pública (`https://…onrender.com`) e cole em
   **J.A.R.V.I.S. → ⚙ Modos & Config → modo Servidor → URL DO SERVIDOR** → **Testar conexão**.

Detalhes, alternativas (Docker/Railway) e execução local estão abaixo.

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

## Deploy com HTTPS (para usar no site PUBLICADO)

> **Por que precisa de HTTPS:** o site publicado (Vercel) é HTTPS. O navegador
> **bloqueia** uma página HTTPS de chamar um backend `http://` local (mixed
> content). Por isso, para usar o modo Servidor no site no ar, o backend
> precisa estar **hospedado com HTTPS**. (Rodando o site localmente via
> `npm run dev` em `http://localhost`, o backend local `http://127.0.0.1` funciona.)

### Opção A — Render (blueprint, recomendado)

Já existe um `render.yaml` na raiz do repo.

1. [render.com](https://render.com) → **New → Blueprint** → conecte este repositório.
2. O Render lê o `render.yaml` e cria o serviço **baluarte-ia-backend** (pasta `backend/`).
3. No serviço, em **Environment**, defina `GEMINI_API_KEY` (chave do Google AI Studio).
4. Depois do deploy, copie a URL pública — algo como
   `https://baluarte-ia-backend.onrender.com`.
5. No site: **J.A.R.V.I.S. → ⚙ Modos & Config → modo Servidor → URL DO SERVIDOR**,
   cole a URL. Clique **Testar conexão** (deve dar "✓ online · chave Gemini OK").

> Plano free do Render hiberna após inatividade — a 1ª mensagem depois de um
> tempo parado pode demorar alguns segundos (cold start). O timeout do site cobre isso.

### Opção B — Docker (Railway, Fly, Cloud Run, VM…)

Há um `backend/Dockerfile`. Em plataformas com Docker, aponte o serviço para
a pasta `backend/`, defina `GEMINI_API_KEY` e exponha a porta `$PORT`.

```bash
# build/run local de teste:
cd backend
docker build -t baluarte-ia .
docker run -p 8000:8000 -e GEMINI_API_KEY="sua-chave" baluarte-ia
```

### Regras

- A `GEMINI_API_KEY` fica **só** no ambiente do servidor — nunca no front.
- CORS já está liberado (`*`), então o site (qualquer origem) consegue chamar.
- A URL pública precisa ser **HTTPS** para o site publicado conseguir usá-la.
