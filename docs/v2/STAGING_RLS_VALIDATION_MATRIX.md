# Staging RLS Validation Matrix

## Status

`PREPARED LOCALLY — NO REMOTE EXECUTION`

## Objetivo

Preparar uma validação reproduzível da fronteira Auth/RLS sem modificar o projeto Supabase conectado. A matriz usa quatro identidades distintas e exige fixtures isoladas, limpeza determinística e evidência do resultado antes de qualquer aprovação de staging.

A implementação tipada está em `v2/data/staging-rls-matrix.ts`. O harness estrutural está em `test/security/staging-rls-matrix-contract.test.js`. Esta etapa apenas verifica a forma e a completude da matriz; não cria usuários, não executa SQL remoto e não faz escrita em Supabase.

## Cenários

| Identidade | Tabela | Operação | Resultado esperado | Evidência |
|---|---|---|---|---|
| Anônimo | `profiles` | SELECT | `empty` ou bloqueio equivalente | Nenhum perfil exposto |
| Dono U1 | `profiles` | SELECT | `allow` | Retorna somente a linha U1 |
| Dono U1 | `profiles` | UPDATE | `allow` | Alteração fica restrita a U1 |
| Não dono U2 | `profiles` | SELECT | `empty` | Linha U1 não aparece |
| Não dono U2 | `profiles` | UPDATE | `deny` | Nenhuma alteração em U1 |
| Dono U1 | `memories` | SELECT | `allow` | Retorna somente memórias U1 |
| Não dono U2 | `memories` | DELETE | `deny` | Memória U1 permanece |
| Operador | `mural_posts` | INSERT | `allow` | Policy server-side autorizou a fixture |
| Usuário comum | `mural_posts` | INSERT | `deny` | Nenhum post administrativo criado |

## Pré-condições para execução remota futura

Antes da execução será necessário aprovar um projeto Supabase staging separado da produção, definir quatro contas de teste ou fixtures Auth equivalentes, registrar o identificador do tenant, aplicar migrations versionadas, confirmar o allow-list OAuth e definir a política de limpeza. O operador deverá confirmar explicitamente que a execução remota está autorizada.

O teste não deve usar service role no browser. Caso service role seja necessária para preparar ou limpar fixtures, ela deve permanecer em um processo server-side temporário, fora do frontend, com segredo fornecido por ambiente protegido e logs sem token.

## Classificação dos resultados

`allow` significa que a operação esperada foi aceita e afetou somente a fixture autorizada. `deny` significa que a operação foi recusada ou não afetou nenhuma linha protegida. `empty` significa que a leitura não revelou linhas pertencentes a outro contexto. Um status HTTP isolado não é suficiente: o harness deve verificar estado antes e depois.

## Rollback

Cada cenário deve possuir identificador de fixture, cleanup idempotente e ordem de remoção inversa à criação. Em falha, interromper a sequência, preservar logs sem tokens e executar somente a limpeza server-side autorizada. Não alterar policies para fazer um cenário passar.

## O que não foi feito

Nenhuma conta foi criada, nenhum token foi solicitado, nenhuma migration foi aplicada remotamente, nenhum dado de produção foi consultado e nenhuma policy foi alterada. A matriz não declara que RLS remoto está verde; ela apenas torna a futura validação explícita e auditável.
