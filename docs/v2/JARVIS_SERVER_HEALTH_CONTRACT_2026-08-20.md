# JARVIS Server Health Contract — 2026-08-20

## Resumo

Este marco cria a primeira superfície **server-side read-only** de observabilidade do JARVIS. O backend Python e a função serverless da Vercel passam a retornar o contrato `server-health/v1`, mantendo os campos antigos `ok`, `model` e `hasKey` para compatibilidade com a página `/jarvis`.

> `ok: true` significa que o endpoint respondeu. Não significa que o Gemini esteja pronto, que um módulo esteja saudável ou que o cliente tenha autoridade para alterar o Registry.

## Escopo

A mudança cobre somente o backend opcional já existente e a função `api/health.py`. Não cria um segundo Runtime, Registry, Event Bus ou Permission Manager. Também não transforma o diagnóstico local de `v2/core/plataforma.ts` em uma afirmação server-side: as duas superfícies ainda possuem responsabilidades diferentes e essa diferença é deliberada.

| Superfície | Fonte | Contrato | Papel |
|---|---|---|---|
| `backend/server.py` | Processo FastAPI + presença booleana de `GEMINI_API_KEY` | `server-health/v1` | Health remoto do backend Python. |
| `api/health.py` | Função Vercel + presença booleana de chaves | `server-health/v1` + campos de APIs | Health remoto do backend serverless. |
| `src/pages/jarvis.ts` | `healthCheckServer()` | Consumidor compatível | Consome `health`, `connection`, `severity`, `fallback` e `detail` quando presentes; usa `hasKey` como fallback legado e sempre projeta `authority: not-authorized`. |
| `v2/core/plataforma.ts` | Boot, Supervisor, Health, Registry e Lifecycle | `PlatformDiagnostic` | Diagnóstico canônico local da V2; ainda não é transportado por este marco. |

## Envelope `server-health/v1`

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

`connection` descreve a resposta HTTP observada. `health` descreve a prontidão mínima do backend para usar Gemini. `severity` e `fallback` são projeções de leitura. `authority` permanece fixo em `not-authorized`, portanto o envelope não concede claims nem autoriza ações. `hasKey` é booleano; o valor da chave nunca é retornado. O campo `ok` permanece verdadeiro quando o processo responde mesmo que a prontidão esteja degradada.

| Condição | `ok` | `connection` | `health` | `severity` | `fallback` |
|---|---:|---|---|---|---|
| Endpoint responde e `GEMINI_API_KEY` existe | `true` | `connected` | `healthy` | `none` | `available` |
| Endpoint responde sem `GEMINI_API_KEY` | `true` | `connected` | `degraded` | `warning` | `degraded` |
| Endpoint não responde | sem envelope | desconhecida | `failed` projetado pelo consumidor | `critical` projetado pelo consumidor | `blocked` projetado pelo consumidor |

A última linha não é produzida pelo backend: é a decisão read-only já existente em `src/pages/jarvis.ts` quando a requisição falha. Isso evita que o servidor invente um estado de transporte que não pôde ser observado.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `backend/health_contract.py` | Implementação tipada do envelope FastAPI, sem segredos e sem autoridade operacional. |
| `backend/server.py` | Endpoint FastAPI `GET /health` usando o contrato. |
| `api/health.py` | Projeção equivalente para a função serverless Vercel, preservando `keys` e `models`. |
| `backend/test_health_contract.py` | Quatro verificações: healthy, degraded, ausência de segredo, paridade FastAPI/Vercel. |
| `backend/README.md` | Instruções, exemplo do envelope e limites de segurança. |
| `src/utils/jarvis-engine.d.ts` | Tipos TypeScript opcionais para `server-health/v1` e respostas legadas. |
| `test/jarvis-mark-xiii-console.test.js` | Contrato estático do consumidor JARVIS e da declaração do health. |

## Segurança e governança

A `GEMINI_API_KEY` continua restrita ao ambiente do servidor. O contrato não expõe o valor, não identifica claims de usuário e não permite que o cliente promova, desabilite, quarentene ou reinicie módulos. A existência de uma chave é somente um sinal de configuração; ela não prova autorização, disponibilidade de quota ou correção de uma dependência externa.

CORS continua liberado como dívida histórica do backend opcional. Este marco não amplia essa dívida e não a mascara: o próximo hardening deve substituir `*` por uma allowlist de origens conhecidas, com teste de preflight e validação de deploy. Nenhuma chamada real ao Gemini, WhatsApp, OpenClaw ou serviço externo foi executada por este marco.

## Validação

Os testes locais deste marco são:

```text
(cd backend && python3 test_health_contract.py)  → backend health contract: 4/4
python3 -m py_compile backend/server.py backend/health_contract.py api/health.py → passou
npm run tipos:ts → passou após a integração do consumidor
npm run tipos:v2 → passou após a integração do consumidor
npm test → passou no baseline anterior e deve ser repetido antes do push
npm run build → passou no baseline anterior e deve ser repetido antes do push
npm run v2:integracao → 33/33 no baseline anterior e deve ser repetido antes do push
npm run smoke → 99/99 no baseline anterior e deve ser repetido antes do push
npm run caminho-critico → 15/15 no baseline anterior e deve ser repetido antes do push
```

A CI também deve validar o commit exato publicado. O gate `v2:runtime` continua sujeito à limitação histórica do Cargo 1.75.0 com metadados `edition2024`; essa limitação não deve ser mascarada por esta mudança.

## Riscos, rollback e próximos passos

O risco principal é divergência futura entre o envelope Python e o envelope Vercel. A paridade é protegida por `backend/test_health_contract.py`, que importa a função Vercel sem iniciar FastAPI ou Gemini. O rollback é remover `health_contract.py`, restaurar as implementações anteriores de `backend/server.py` e `api/health.py`, e revertê-las em um commit normal no `main`; não é necessário reverter a matriz de observação do JARVIS.

O próximo marco não deve criar um endpoint que aceite comandos. Ele deve avaliar uma ponte autenticada e somente leitura entre o diagnóstico `PlatformDiagnostic` da V2 e uma superfície server-side, com origem, identidade, autorização, TTL, redaction, auditoria e RLS definidos antes de qualquer decisão de disponibilidade. Até lá, `server-health/v1` é somente health do backend e `v2-platform-diagnostic` continua restrito ao harness V2.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch: `main`.
- Commit de base: `ba8c2c6fcd0e1751a79690fcf98b347f8658a58a`.
- Commit de publicação do backend: `ba4bd2417528f5d37ba0feb5053593b093d1a29c`.
- Integração do consumidor: será registrada no commit da próxima publicação.
- Autor padrão: Manus AI.
