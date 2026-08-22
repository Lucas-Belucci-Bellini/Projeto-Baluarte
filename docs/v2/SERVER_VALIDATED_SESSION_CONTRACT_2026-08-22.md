# Contrato — Sessão server-validated TypeScript

**Versão:** `server-validated-session/v1`  
**Escopo:** projeção local read-only de um envelope `server-observation/v1` já produzido pelo backend  
**Autor:** Manus AI

## Intenção

Este contrato separa três fatos que não podem ser confundidos: a sessão local armazenada pelo browser, a evidência de identidade observada pelo backend e a autorização operacional dos módulos. A primeira slice somente projeta a segunda em um estado de interface bounded. Ela não autentica localmente, não decodifica JWT e não autoriza ações.

## Entrada permitida

A entrada é `unknown` e é normalizada por `observeServerObservation()` em `src/layout/server-observation.ts`. O envelope válido contém health, claims, evidência, transporte e `authority: 'not-authorized'`. Campos adicionais são ignorados. O token Bearer, `subject`, `role`, `user_metadata`, `app_metadata`, headers, cookies, URLs privadas e payload bruto não entram na saída.

## Estados de saída

| Estado | Condição mínima | Uso permitido |
|---|---|---|
| `authenticated` | claims observados, autenticados e frescos; health observado; fallback não bloqueado | Exibir identidade observada e buscar dados já autorizados por backend |
| `anonymous` | claims observados, mas identidade não autenticada | Exibir superfície pública e orientar login |
| `stale` | claims observados, porém `claimsFresh` falso | Exigir nova observação; nunca tratar como sessão válida |
| `degraded` | health degradado, fallback degradado ou evidência incompleta | Exibir estado neutro e manter módulos isolados |
| `unavailable` | envelope ausente, inválido, rate-limited ou fonte desconhecida | Fallback neutro; não iniciar operações sensíveis |

Um envelope com `authority` diferente de `not-authorized` não é promovido; a projeção retorna `unavailable`. Scopes aceitos são evidência observada, não permissão client-side.

## Saída estável

```ts
interface ServerValidatedSessionProjection {
  readonly contractVersion: 'server-validated-session/v1';
  readonly state: 'authenticated' | 'anonymous' | 'stale' | 'degraded' | 'unavailable';
  readonly claimsObserved: boolean;
  readonly claimsFresh: boolean;
  readonly authenticated: boolean;
  readonly health: 'healthy' | 'degraded' | 'unknown';
  readonly fallback: 'available' | 'degraded' | 'blocked' | 'unknown';
  readonly acceptedScopes: readonly string[];
  readonly rejectedScopes: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}
```

A saída é congelada, limitada a listas de escopos conhecidos vindas do envelope e não contém credenciais. Não existe função de `authorize`, `promote`, `grant`, `decode`, `verifyJwt` ou equivalente neste módulo.

## Classificação determinística

A prioridade é `unavailable` para entrada ausente/ inválida ou autoridade divergente; depois `stale` para claims presentes porém não frescos; depois `anonymous` quando os claims foram observados e a identidade não está autenticada; depois `degraded` para health/fallback degradado; e `authenticated` somente quando todas as condições mínimas estiverem presentes. Em qualquer dúvida, vence o estado mais restritivo.

## Falhas e fallback

Rate limit, CORS negado, servidor ausente, timeout e resposta malformada são dados de observação indisponíveis. A camada não repete requests, não persiste o envelope, não chama Supabase e não modifica Storage. Um futuro cliente HTTP deverá ficar em outro módulo, com timeout, AbortController, redaction e testes de fake; essa integração não faz parte desta slice.

## Invariantes

`authority` permanece sempre `'not-authorized'`; `publicPromotionAllowed` permanece sempre `false`; roles não são aceitas nessa saída; apenas `app_metadata` server-side pode alimentar a projeção de identidade posterior; sessão local nunca substitui claims server-validated; e módulo degradado continua isolado.

## Testes e rollback

Os testes devem cobrir envelope válido, anônimo, stale, degradado, bloqueado, ausente, malformado, autoridade divergente, listas duplicadas, campos sensíveis e imutabilidade. Rollback: remover o projetor e seus testes; os contratos backend, Auth local, claims e observability publicados permanecem intactos.

## Fronteira de execução

Para compatibilidade com o workflow `Security Contracts`, os contratos de observação possuem wrappers `.js` que reexportam as implementações canônicas `.ts` com extensão explícita. A projeção importa esses wrappers; isso resolve a resolução ESM do Node do CI sem habilitar `allowJs`, sem alterar `moduleResolution` e sem criar uma segunda implementação. O Node 22 do sandbox continua exigindo `tsx` para executar testes que importam `.ts` diretamente; essa limitação é registrada como ambiente local, não como autorização para relaxar o strict gate.
