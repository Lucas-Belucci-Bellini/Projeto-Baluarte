# ⬡ Núcleo Baluarte — Backend de IA (opcional)

Servidor Python que dá ao **J.A.R.V.I.S.** um modelo mais forte e **busca na web
de verdade** (Google Search via Gemini) — a *camada 2* do raciocínio em 3 camadas
(doc 08 do plano da IA). É o **plano B** do doc 04: entra só quando você quer
pesquisa web real; para uso local sem chave, o modo **Ollama** já existe, e o
modo **Navegador (WebLLM)** roda 100% no cliente.

> Há **dois caminhos** para o modo Servidor: (1) **embutido na Vercel** como
> função serverless em `api/` — roda no mesmo domínio do site (recomendado); ou
> (2) este **servidor Python** rodando à parte (local ou hospedado no Render),
> que o site chama por uma URL configurável.

## ✅ Recomendado: backend embutido na Vercel (`/api`)

As funções `api/chat.py` e `api/health.py` (na raiz do repo) rodam no **mesmo
domínio do site** — sem mixed-content e sem URL separada.

1. Pegue uma chave Gemini (grátis): <https://aistudio.google.com/apikey> → **Create API key**.
2. Na Vercel: **projeto-baluarte → Settings → Environment Variables** → adicione
   `GEMINI_API_KEY` = sua chave (marque **Production**) → **Save**.
3. **Redeploy** (Deployments → ⋯ no deploy mais recente → **Redeploy**) para a função pegar a variável.
4. No site: **J.A.R.V.I.S. → ⚙ Modos & Config → modo Servidor** → deixe a **URL vazia**
   (usa `/api`) → **Testar conexão** → deve dar **"✓ online · chave Gemini OK"**.

> Função serverless tem limite de ~60s por requisição — a busca do Gemini cabe.

## Alternativa: Render (servidor Python à parte)

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

Confira: abra <http://127.0.0.1:8000/health>. O endpoint responde o contrato `server-health/v1`, mantendo `ok`, `model` e `hasKey` para compatibilidade:

```json
{
  "contractVersion": "server-health/v1",
  "source": "runtime-observed",
  "connection": "connected",
  "health": "healthy",
  "severity": "none",
  "fallback": "available",
  "authority": "not-authorized",
  "ok": true,
  "service": "jarvis-backend",
  "model": "gemini-2.5-flash",
  "hasKey": true,
  "detail": "health endpoint + Gemini key observados"
}
```

`ok` indica que o processo respondeu; não significa que o Gemini esteja pronto. Sem `GEMINI_API_KEY`, o endpoint permanece conectado, mas projeta `health: degraded`, `severity: warning` e `fallback: degraded`. A projeção é somente leitura: não executa fallback, não desabilita módulos e não concede autoridade.

Para habilitar somente a consulta de identidade do endpoint `/claims/observe`, configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no ambiente do backend. O servidor consulta `/auth/v1/user` com o Bearer recebido e redige o resultado. Essa consulta não cria roles, não aceita `module:execute`, não chama o Permission Manager e não substitui RLS. Sem as duas variáveis, sem Bearer válido ou com erro de rede, a resposta permanece `decision: not-authorized`.

A projeção formal de escopos aceita somente as roles server-side `user`, `admin`, `dev` e `owner`. `user` observa `platform:observe`; as outras três observam, sem autorização operacional, `platform:observe`, `registry:read` e `module:read`. Role desconhecida, `user_metadata` ou payload sem `iat`/`exp` não recebe escopos. A função `project_verified_supabase_payload()` não decodifica JWT: ela recebe apenas dados que uma biblioteca/JWKS confiável já verificou.

## Usar no site

No J.A.R.V.I.S. (`/jarvis`): **⚙ Modos & Config → modo "Servidor"** e confirme a
URL (`http://127.0.0.1:8000`). Mande uma pergunta que dependa de algo atual —
o servidor pesquisa no Google e responde.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Contrato `server-health/v1`: liveness, health observado, severidade, fallback read-only e presença booleana da `GEMINI_API_KEY` |
| `POST` | `/chat` | `{ messages: [{role, content}], system }` → `{ resposta }` |
| `GET` | `/claims/observe` | Observa identidade por Bearer + Supabase Auth; sem configuração/token válido, nega por padrão e nunca retorna token ou metadata. `/user` não fabrica TTL nem escopos. O transporte usa allowlist CORS, rate limit process-local e auditoria redigida. |

O servidor é **stateless**: o site envia a conversa inteira a cada chamada (o
histórico vive no site, em IndexedDB), evitando dessincronização.

## Configuração de hardening

Para um deploy publicado, defina as origens exatas do site e ajuste o limite conforme a capacidade do serviço:

```text
BALUARTE_ALLOWED_ORIGINS=https://seu-site.example
BALUARTE_CLAIMS_RATE_LIMIT=30
BALUARTE_CLAIMS_RATE_WINDOW_SECONDS=60
```

A especificação completa, os casos de falha, os riscos e o rollback estão em [`SERVER_CLAIMS_HARDENING_CONTRACT_2026-08-21.md`](../docs/v2/SERVER_CLAIMS_HARDENING_CONTRACT_2026-08-21.md).

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
- CORS usa origens exatas configuradas em `BALUARTE_ALLOWED_ORIGINS`, separadas por vírgula. Sem configuração, somente `http://localhost:5173` e `http://127.0.0.1:5173` são aceitas; wildcard, caminhos e origens malformadas são rejeitados.
- O endpoint `/claims/observe` aplica `BALUARTE_CLAIMS_RATE_LIMIT` por `BALUARTE_CLAIMS_RATE_WINDOW_SECONDS`. O padrão é 30 requisições por 60 segundos por bucket de transporte. É uma contenção process-local, não uma quota distribuída para múltiplas instâncias.
- A auditoria registra somente método, rota, classe HTTP, origem permitida, rate limit, decisão e presença booleana de request-id. Tokens, Authorization, subject, e-mail, metadata, IP e detalhes de upstream nunca são registrados.
- O envelope server-side é uma observação do backend e ainda não é o `PlatformDiagnostic` da V2. `server-claims/v1` valida a sessão por uma fonte server-side quando configurada, mas não concede escopos nem roles; a integração futura deverá transportar o diagnóstico V2 por uma fronteira autorizada, sem criar um segundo Registry ou Event Bus.
- A URL pública precisa ser **HTTPS** para o site publicado conseguir usá-la.
