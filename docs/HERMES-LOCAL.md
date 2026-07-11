# 🖥️ Hermes LOCAL da máquina — modo `hermes-local` (#340 fatia 4)

O Baluarte conversa com um LLM rodando **na sua máquina** por qualquer servidor
que exponha a API OpenAI-compatível (`/v1/chat/completions`). O texto que o
Hermes responde entra no pipeline normal do Núcleo — com **`voz on`**, vira
áudio automaticamente (**ElevenLabs** se houver chave `voz chave <key>`;
`speechSynthesis` do navegador como fallback grátis). Código:
`src/utils/hermes-local.js` (serviço) · registrado no `/jarvis` (seletor) e no
Núcleo (comandos).

## ⚡ Instalação automatizada (recomendado)

Scripts que fazem TUDO (instalam o Ollama, baixam o Hermes, sobem a API em
segundo plano **já com o CORS liberado** e rodam o teste de vida):

```bash
# Linux / macOS
bash scripts/instalar-hermes.sh
```
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\instalar-hermes.ps1
```

Ajustes por variável de ambiente (opcionais): `BALUARTE_HERMES_MODELO`
(default **`hermes3`** — Nous Hermes 3 8B, ~4,7 GB; alternativa leve:
`openhermes`, Mistral 7B) e `BALUARTE_OLLAMA_ORIGINS` (default `*`).
No fim, o script imprime os comandos do site (`hermes ollama` → `modo
hermes-local`). A instalação manual segue abaixo.

## Servidores suportados e portas

| Servidor | Endpoint (URL base) | Como ligar |
|---|---|---|
| **LM Studio** | `http://localhost:1234/v1` *(default)* | aba **Developer** → *Start Server* → carregue o modelo (ex.: Nous Hermes 2) |
| **Ollama** | `http://localhost:11434/v1` | `ollama serve` (o modo OpenAI já vem junto) · `ollama pull <modelo>` |
| **text-generation-webui** | `http://localhost:5000/v1` | iniciar com `--api` |
| llamafile / LocalAI / vLLM | porta do servidor + `/v1` | ver doc de cada um |

## ⚠️ CORS — a única "pegadinha" (site é outra origem)

O navegador só deixa o site falar com `localhost` se o **servidor local
permitir a origem**:

- **LM Studio**: Developer → marcar **"Enable CORS"**.
- **Ollama**: variável de ambiente **antes** de subir:
  `OLLAMA_ORIGINS="*" ollama serve`
  (ou restrito: `OLLAMA_ORIGINS="https://projeto-baluarte.vercel.app"`).
  No Windows: `setx OLLAMA_ORIGINS "*"` e reinicie o Ollama.
- **text-generation-webui**: flags `--api --api-enable-cors`.

> `http://localhost` é origem confiável — o site HTTPS **pode** chamá-lo (sem
> mixed content). URLs `http://` que **não** são localhost são bloqueadas; o
> modo avisa com a correção.

## Como usar

1. Suba o servidor local com um modelo carregado (tabela acima).
2. No site/app:
   - **Núcleo** (sem menu): `hermes status` (testa) · `hermes lmstudio|ollama|textgen`
     (preset de porta) ou `hermes url http://localhost:1234/v1` · `modo hermes-local` ·
     `modelos` (lista **viva** do servidor) · `modelo <nome>`.
   - **/jarvis** (visual): selecionar **Hermes (local da máquina)** e preencher
     ENDPOINT/MODELO no painel de config.
3. Voz (pipeline completo Hermes → ElevenLabs): `voz on` (+ `voz chave <key>`
   uma vez pra qualidade ElevenLabs). Pronto: pergunta → resposta local → fala.

## Erros e diagnóstico

| Sintoma | Causa provável | Correção |
|---|---|---|
| "Hermes local inacessível" | servidor não está rodando / porta errada | subir o servidor · `hermes status` · conferir porta |
| Falha só no site (curl funciona) | **CORS** não habilitado | seção CORS acima |
| "HTTP 404 … termina em /v1?" | URL base sem `/v1` | `hermes url http://localhost:1234/v1` |
| "demorou demais (2 min)" | modelo carregando na 1ª chamada | tentar de novo; ver console do servidor |
| Resposta vazia | nenhum modelo carregado | carregar modelo (LM Studio) / `ollama pull` |

## Config persistida (localStorage `baluarte:jarvis:config`)

- `hermesLocalUrl` — URL base (default `http://localhost:1234/v1`)
- `hermesLocalModel` — nome do modelo (`''` = usa o carregado no servidor)
- `mode: 'hermes-local'` — ativa o modo

Não há variável de ambiente do lado do **site** (estático) — as envs são todas
do **servidor local** (ex.: `OLLAMA_ORIGINS`). No **app desktop** funciona
igual (mesma origem web).
