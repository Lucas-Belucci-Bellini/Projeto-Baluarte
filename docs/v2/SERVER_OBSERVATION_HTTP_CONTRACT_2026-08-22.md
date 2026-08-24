# Contrato — Cliente HTTP server-observation/v1

**Versão:** `server-observation-http/v1`  
**Escopo:** transporte GET read-only para o envelope backend `server-observation/v1` e projeção local `server-validated-session/v1`  
**Autor:** Manus AI

## Objetivo

Esta slice cria somente o transporte entre uma superfície TypeScript e os endpoints de observabilidade já existentes. O cliente não cria endpoints, não acessa Supabase diretamente, não decodifica JWT, não calcula roles e não autoriza módulos. A resposta externa é normalizada pela projeção local antes de ser exposta ao consumidor.

## Endpoint

O endpoint deve ser fornecido explicitamente como URL absoluta pelo consumidor. São superfícies já existentes: `/observability/observe` no FastAPI e `/api/observability` no adapter Vercel. O cliente não monta URL a partir de dados do usuário e não possui fallback remoto oculto. URLs devem usar `http:` ou `https:`, sem username, password, fragmento ou query string.

## Request

| Campo | Regra |
|---|---|
| `endpoint` | Obrigatório; URL absoluta e validada |
| `accessToken` | Opcional; usado somente como `Authorization: Bearer`; nunca retorna ou persiste |
| `requestId` | Opcional; somente header `X-Request-ID` não vazio |
| `origin` | Opcional; somente header `Origin` não vazio |
| `timeoutMs` | Default 2500 ms; limitado entre 100 e 10000 ms |
| `fetcher` | Opcional; fake injetável para testes; default é `globalThis.fetch` |

A operação é sempre `GET`, não envia body e não usa `service_role`, `module:execute`, cookies de aplicação ou metadata de usuário.

## Resultados bounded

```ts
interface ServerObservationHttpResult {
  readonly contractVersion: 'server-observation-http/v1';
  readonly outcome: 'observed' | 'unavailable';
  readonly projection: ServerValidatedSessionProjection;
  readonly transport: {
    readonly attempted: boolean;
    readonly statusCode: number | null;
    readonly reasonCode:
      | 'observed'
      | 'configuration-missing'
      | 'invalid-endpoint'
      | 'timeout'
      | 'network-error'
      | 'server-rate-limited'
      | 'http-error'
      | 'invalid-response';
  };
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}
```

O resultado nunca contém URL, headers, token, corpo HTTP, mensagem de exceção, `Response`, subject, role, metadata ou credencial. `statusCode` é o único dado numérico de transporte e só admite status HTTP inteiro; falhas de rede e timeout retornam `null`.

## Classificação

`observed` somente ocorre quando a resposta é 2xx e o envelope é reconhecido/projetado. HTTP 429 retorna `server-rate-limited`; outros não-2xx retornam `http-error`. Abort por timeout retorna `timeout`; falha de fetch retorna `network-error`; JSON ausente, inválido ou envelope incompatível retorna `invalid-response`. Endpoint ausente ou inválido não executa rede e retorna `configuration-missing` ou `invalid-endpoint`.

Um resultado `observed` não significa autorizado. A projeção interna mantém `authority: not-authorized`; health, scopes e identidade são observações para UI e diagnóstico. Falta de claims, claims stale, fallback bloqueado ou health degradado continuam nos estados conservadores da projeção.

## Invariantes e não-escopo

`runtimeAuthority` não é alterado; `publicPromotionAllowed` continua `false`; nenhum módulo é habilitado por este cliente; não há retry automático, cache, armazenamento local, refresh, logout, DDL, RLS ou chamada direta ao provider. A credencial, quando fornecida pelo consumidor, só atravessa o header da requisição e não aparece em logs, exceções ou retorno.

## Testes e rollback

Os testes devem cobrir URL ausente/inválida, GET sem body, timeout, rede, HTTP 429, HTTP 500, JSON inválido, envelope válido, token redigido, request ID, origin, limite de timeout e ausência de mutação. Rollback: remover o cliente, fake e testes; os endpoints backend e a projeção local permanecem intactos.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/backend/server.py "FastAPI observability endpoint"

[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/api/observability.py "Vercel observability adapter"

[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/src/security/server-validated-session.ts "TypeScript server-validated session projection"
