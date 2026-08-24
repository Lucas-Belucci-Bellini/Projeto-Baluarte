# Auth Adapter TypeScript — Contrato de fronteira

**Marco:** `auth-adapter-typescript/v1`
**Status:** contrato definido para implementação incremental
**Base:** `main` após `b48c94e3` / matriz reconciliada em `5ad5e53e`
**Autor:** Manus AI

## Objetivo

Tipar a fronteira de `src/core/supabase-auth.js` sem reescrever o provider, sem trocar endpoints Supabase Auth e sem remover o wrapper JavaScript usado pelos consumidores V1. A primeira implementação permanece no arquivo `.js`; o contrato TypeScript fornece tipos reais para sessão, usuário, respostas do provider e listeners.

## API pública preservada

A API nominal permanece: `onAuthChange`, `isLoggedIn`, `currentUser`, `signInWithGoogle`, `signUpWithPassword`, `signInWithPassword`, `signOut`, `getAccessToken` e `handleAuthRedirect`. O importador continua usando `../core/supabase-auth.js`. Nenhum consumidor é obrigado a mudar nesta slice.

## Tipos

```ts
interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly meta: Readonly<Record<string, unknown>>;
}

interface SignUpResult {
  readonly confirmed: boolean;
}
```

A sessão interna do provider pode continuar serializada como `access_token`, `refresh_token` e `expires_at` para manter a chave `baluarte:auth:session` compatível. O tipo público TypeScript usa camelCase para evitar propagar o formato externo ao restante do código.

## Helpers bounded

A fronteira terá helpers puros para validar e projetar respostas do provider:

| Helper | Regra |
|---|---|
| `projectAuthSession` | Aceita somente access token e refresh token strings não vazias; normaliza expiração positiva e finita; nunca retorna senha, e-mail ou metadata. |
| `projectRefreshSession` | Aceita novo access token e preserva o refresh token anterior quando o provider não o devolve; resposta inválida retorna `null`. |
| `authSessionFromStorage` | Converte storage desconhecido para sessão interna somente se os campos forem válidos; dados inválidos são tratados como sessão ausente. |

O adapter continua podendo usar o formato snake_case internamente, mas a lógica de validação não deve persistir resposta arbitrária do provider.

## Lifecycle

O login e o cadastro projetam a sessão somente quando os dois tokens necessários estão presentes. OAuth limpa o fragmento da URL sempre que detectar `access_token` ou `error`; token parcial nunca autentica. Refresh inválido remove a sessão local. Logout continua best-effort remoto e sempre remove a sessão local. `onAuthChange` mantém callback de sessão serializada compatível com o wrapper atual.

## Segurança e autoridade

Este contrato não verifica JWT, não deriva roles e não libera módulos. `currentUser()` continua sendo uma projeção de apresentação da UI; claims server-validated e `auth-identity-release` permanecem a autoridade para autorização. Nenhuma função altera `runtimeAuthority`, que deve permanecer `not-authorized`, e `publicPromotionAllowed` continua `false`.

Tokens ainda são dados sensíveis necessários para a sessão web local, mas não devem aparecer em logs, erros, observabilidade, URLs ou mensagens do usuário. O browser continua sem service role e sem credenciais de OpenClaw.

## Compatibilidade e rollback

O `.js` permanece como implementação canônica temporária e o `.d.ts` será atualizado como contrato da fronteira. Se qualquer teste V1 falhar, o rollback remove somente os tipos/helpers e restaura a declaração anterior; não exige migration, alteração em Supabase, mudança de RLS ou alteração no router.

## Testes obrigatórios

A slice deve preservar os testes atuais de login, refresh, logout e OAuth e acrescentar casos para sessão inválida, expiração inválida, refresh token preservado, token parcial, ausência de credencial e não vazamento de campos sensíveis. O `npm run tipos:ts`, `npm test`, build, integração V2, smoke e caminho crítico continuam obrigatórios.

— **Manus AI**
