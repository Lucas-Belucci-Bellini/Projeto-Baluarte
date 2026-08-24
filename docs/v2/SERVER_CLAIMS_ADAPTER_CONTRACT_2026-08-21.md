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

A consulta ao endpoint `/user` confirma somente que a fonte de identidade aceitou o token atual. Como essa resposta não fornece expiração verificável, o caminho `/user` não fabrica TTL e mantém `accepted` vazio. Existe uma função separada, `project_verified_supabase_payload()`, que só aceita payload já verificado por biblioteca/JWKS confiável; nesse caminho, `iat`/`exp` são convertidos para TTL e a role é mapeada por catálogo fechado.

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
| `backend/claims_adapter.py` | Parser Bearer, consulta injetável a Supabase Auth, redaction, catálogo fechado de roles e projeção TTL `server-claims/v1`. |
| `backend/server.py` | Endpoint FastAPI `GET /claims/observe`, read-only e deny-by-default. |
| `backend/test_claims_adapter.py` | Cinco testes Python com fake HTTP, ausência de configuração, token inválido, redaction e escopos. |
| `src/layout/server-claims-observation.ts` | Contrato frontend/harness já existente para a mesma semântica de negação. |
| `docs/v2/SERVER_CLAIMS_OBSERVATION_CONTRACT_2026-08-20.md` | Catálogo de claims observado e limites da camada frontend. |

Validações direcionadas deste marco:

```text
python3 backend/test_claims_adapter.py → 7/7
python3 backend/test_health_contract.py → 4/4
python3 -m py_compile backend/claims_adapter.py backend/server.py backend/health_contract.py → passou
```

## Roles e expiração

| Role server-side reconhecida | Escopos observáveis derivados |
|---|---|
| `user` | `platform:observe` |
| `admin` | `platform:observe`, `registry:read`, `module:read` |
| `dev` | `platform:observe`, `registry:read`, `module:read` |
| `owner` | `platform:observe`, `registry:read`, `module:read` |
| Qualquer outra | Nenhum escopo; `roleRecognized: false`. |

A derivação é de least privilege e continua read-only. Nenhum escopo representa autorização operacional. Roles vêm de `app_metadata` ou de um payload explicitamente marcado como previamente verificado; `user_metadata` não é fonte de autoridade. O TTL máximo permanece 60 segundos, e payloads sem `iat`, `exp`, issuer, audience ou subject são rejeitados pela projeção formal.

## Segurança e limites

O CORS amplo já existente no backend não é alterado neste marco e continua sendo uma pendência de hardening. O endpoint não deve ser usado como autorização de mudança de Registry, disable/quarantine, restart, cobrança, venda, WhatsApp ou publicação. A fonte de identidade é consultada somente para uma observação mínima.

O adaptador não verifica localmente a assinatura JWT, não usa decode local como prova de identidade, não persiste tokens, não acessa RLS diretamente e não retorna metadata. Para produção, ainda faltam restrição de origem/CORS, rate limit, auditoria sem tokens, rotação/revogação, expiração formal, mapeamento de roles server-side, RLS e testes de integração em ambiente configurado.

## Rollback

O rollback remove `backend/claims_adapter.py`, o import e endpoint em `backend/server.py`, `backend/test_claims_adapter.py` e este documento. O contrato frontend `server-claims-observation/v1` pode permanecer como projeção read-only independente; nenhum Permission Manager, Registry, Auth ou DDL remoto precisa ser revertido.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `cfb96dd116027c24926a9bc6565ce2d45d81ed3e`.
- Commit de implementação publicado: `e2f39bae91304516db9f5c4e7131d2a53b09673b`.
- Autor padrão: Manus AI.
