# Server Claims Adapter Contract — 2026-08-21

## Resumo

Este marco conecta o contrato de observação de claims a uma fronteira server-side real, sem transformar o navegador em autoridade. O backend FastAPI adiciona `GET /claims/observe`, extrai um header Bearer em memória, consulta `GET /auth/v1/user` do Supabase Auth quando `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão configurados e projeta apenas flags mínimas de identidade.

> A validação da sessão não concede escopo operacional. A resposta mantém `decision: not-authorized` e `authority: not-authorized`; `Permission Manager`, Registry, Auth/RLS e decisões de módulo continuam separados.

## Fluxo

```text
Authorization: Bearer <token>
        │
        ├── parser estrito; formato inválido → observação negada
        │
        ├── configuração ausente → observação negada sem chamada externa
        │
        ├── Supabase Auth GET /auth/v1/user
        │       ├── 200 + id → identidade server-validated observada
        │       └── outro status/timeout/JSON inválido → observação negada
        │
        └── envelope server-claims/v1 redigido
```

O token não é devolvido, registrado, incluído em `detail`, encaminhado para o frontend ou convertido em `subject` na resposta. O identificador retornado pelo Supabase é usado internamente para estabelecer `subjectPresent`; a resposta pública contém apenas flags booleanas, escopos vazios neste adaptador e redaction explícita.

## Contrato de saída

```json
{
  "contractVersion": "server-claims/v1",
  "source": "server-authority",
  "identity": {
    "issuerPresent": true,
    "subjectPresent": true,
    "audienceMatched": true,
    "authenticated": true,
    "trustedSource": true
  },
  "scopes": {
    "requested": [],
    "accepted": [],
    "rejected": []
  },
  "validity": {
    "issuedAt": null,
    "expiresAt": null,
    "ttlMs": null,
    "fresh": false
  },
  "requestIdPresent": false,
  "redaction": {
    "applied": true,
    "fields": ["token", "subject", "rawClaims", "user_metadata", "app_metadata"]
  },
  "decision": "not-authorized",
  "authority": "not-authorized"
}
```

A consulta ao endpoint `/user` confirma somente que a fonte de identidade aceitou o token atual. Como este adaptador não recebe assinatura/verificação de expiração/roles do lado do servidor, ele não inventa TTL, roles ou scopes. Os escopos `accepted` permanecem vazios até existir um contrato formal de claims assinado ou uma política server-side que forneça esses campos.

## Configuração

| Variável | Uso | Regra |
|---|---|---|
| `SUPABASE_URL` | Base do projeto Supabase Auth | Se ausente, o adaptador nega sem chamada externa. |
| `SUPABASE_ANON_KEY` | Header `apikey` da consulta `/auth/v1/user` | O valor nunca aparece na resposta. |
| `Authorization` | Header Bearer recebido pelo FastAPI | Parser estrito; token não é logado nem devolvido. |

Não foram aplicadas migrations, DDL, RLS remoto ou alterações no projeto Supabase. Configurar a variável não concede roles; somente habilita a consulta de identidade.

## Arquivos e testes

| Arquivo | Papel |
|---|---|
| `backend/claims_adapter.py` | Parser Bearer, consulta injetável a Supabase Auth, redaction e projeção `server-claims/v1`. |
| `backend/server.py` | Endpoint FastAPI `GET /claims/observe`, read-only e deny-by-default. |
| `backend/test_claims_adapter.py` | Cinco testes Python com fake HTTP, ausência de configuração, token inválido, redaction e escopos. |
| `src/layout/server-claims-observation.ts` | Contrato frontend/harness já existente para a mesma semântica de negação. |
| `docs/v2/SERVER_CLAIMS_OBSERVATION_CONTRACT_2026-08-20.md` | Catálogo de claims observado e limites da camada frontend. |

Validações direcionadas deste marco:

```text
python3 backend/test_claims_adapter.py → 5/5
python3 backend/test_health_contract.py → 4/4
python3 -m py_compile backend/claims_adapter.py backend/server.py backend/health_contract.py → passou
```

## Segurança e limites

O CORS amplo já existente no backend não é alterado neste marco e continua sendo uma pendência de hardening. O endpoint não deve ser usado como autorização de mudança de Registry, disable/quarantine, restart, cobrança, venda, WhatsApp ou publicação. A fonte de identidade é consultada somente para uma observação mínima.

O adaptador não verifica localmente a assinatura JWT, não usa decode local como prova de identidade, não persiste tokens, não acessa RLS diretamente e não retorna metadata. Para produção, ainda faltam restrição de origem/CORS, rate limit, auditoria sem tokens, rotação/revogação, expiração formal, mapeamento de roles server-side, RLS e testes de integração em ambiente configurado.

## Rollback

O rollback remove `backend/claims_adapter.py`, o import e endpoint em `backend/server.py`, `backend/test_claims_adapter.py` e este documento. O contrato frontend `server-claims-observation/v1` pode permanecer como projeção read-only independente; nenhum Permission Manager, Registry, Auth ou DDL remoto precisa ser revertido.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `cfb96dd116027c24926a9bc6565ce2d45d81ed3e`.
- Commit de publicação: será registrado após os gates e a CI.
- Autor padrão: Manus AI.
