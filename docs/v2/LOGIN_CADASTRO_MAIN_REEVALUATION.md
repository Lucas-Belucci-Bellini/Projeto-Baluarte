# Reavaliação de `feature/login-cadastro` contra o `main`

## Status

`AUDIT COMPLETE — DO NOT MERGE DIRECTLY`

## Commits observados

| Referência | Estado |
|---|---|
| `main` auditado | `d99f09be1ae40537fb788f4ac9fadcf1bce53211` |
| `origin/feature/login-cadastro` | `9ffbe39e` |
| Diferença de histórico | A branch está 227 commits atrás e 1 commit à frente do main |
| Commit exclusivo | `9ffbe39e feat(login): aba dedicada de login/cadastro por e-mail+senha` |

## Conclusão executiva

A branch não deve ser mergeada diretamente. Ela foi criada antes de várias ondas posteriores da V2 e seu único commit exclusivo contém uma implementação antiga da superfície de login. Um diff de duas pontas mostra remoções de arquivos e contratos que já estão presentes e mais evoluídos no `main`, incluindo Billing Foundation, Evidence, Runtime, testes V2, arquivos TypeScript, wrappers de compatibilidade e migrações SQL.

Isso não significa que a ideia da branch foi perdida. A funcionalidade principal de identidade já está representada no main atual, mas precisa ser validada como release de Auth/RLS e não transplantada por merge cego.

## O que já existe no main

A implementação canônica atual é `src/pages/login.ts`, com `src/pages/login.js` mantido como wrapper V1. A página possui modos de entrada e cadastro, validação de confirmação de senha, login Google, estados de sessão, tratamento de erro tipado, estado de banco não configurado e navegação para `/perfil`.

O driver `src/core/supabase-auth.js` já expõe `signUpWithPassword`, `signInWithPassword`, `signInWithGoogle`, `signOut`, `getAccessToken`, `isLoggedIn` e `currentUser`. As requisições usam timeout, não colocam service role key no frontend e armazenam somente a sessão do usuário no storage previsto pelo contrato local.

A fronteira TypeScript já foi aplicada: a implementação de página é `.ts`, o wrapper `.js` preserva importadores legados e `npm run tipos:ts` valida o contrato. A branch antiga adiciona a mesma direção funcional, mas em JavaScript e sobre uma base anterior.

## Riscos do merge direto

| Risco | Evidência | Consequência |
|---|---|---|
| Regressão de arquitetura | Branch 227 commits atrás | Remoção de módulos e testes V2 atuais |
| Regressão TypeScript | Branch adiciona `login.js`; main usa `login.ts` canônico | Perda da migração já concluída |
| Regressão de Billing/Evidence | Diff efetivo contém remoções de `v2/data`, testes e migrations | Quebra de contratos que estão verdes |
| Falso fechamento de Auth | UI existe, mas Auth/RLS remoto não foi validado | Login local parecer pronto sem evidência de staging |
| Divergência de segurança | Branch foi criada antes das regras recentes de identidade e RLS | Papéis/client-side poderiam ser tratados como autoridade |

## Próxima integração segura

A branch deve ser tratada como fonte histórica de requisitos, não como commit para merge. O próximo vertical slice de identidade deve ser construído sobre o main atual:

1. Criar ou atualizar testes de contrato para login, cadastro, logout, refresh, OAuth redirect e ambiente sem Supabase.
2. Confirmar que o redirect não aceita destinos arbitrários e que tokens não ficam em URLs após o retorno.
3. Validar `currentUser` e `isLoggedIn` sem confiar em claims client-side para autorização administrativa.
4. Preparar Auth/RLS em staging somente após aprovação do projeto remoto e revisão das policies.
5. Integrar a superfície de login ao Module Registry e ao estado de health sem tornar Auth dependência obrigatória do boot V1.

## O que não deve ser alterado nesta etapa

Não substituir `src/pages/login.ts` pela implementação JavaScript da branch, não reverter os wrappers de compatibilidade, não remover testes V2 ou migrations atuais e não declarar o release de identidade concluído apenas porque a tela renderiza.

## Rollback

Como esta rodada é documental e não altera a implementação da autenticação, o rollback é o revert do commit documental. Nenhum token, segredo, usuário, policy remota ou provider foi alterado.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/feature/login-cadastro "Branch feature/login-cadastro"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Main do Projeto-Baluarte"
