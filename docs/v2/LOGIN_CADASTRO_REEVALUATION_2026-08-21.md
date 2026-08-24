# Reavaliação `feature/login-cadastro`

**Status:** AUDIT ONLY — branch não foi mergeada
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Main auditado:** `3346270864f07e63084c423d60558e1f73e2b7b9`
**Branch auditada:** `feature/login-cadastro`
**Commit da branch:** `9ffbe39ed4213610c07b549df8a002ea03fdb0a8`
**Data:** 2026-08-21
**Resultado:** branch divergente; não é candidata a merge direto no main atual.

## Resumo executivo

A branch contém um único commit, está **1 commit à frente e 447 commits atrás** do main atual. O commit foi criado contra uma base histórica e altera oito arquivos. A diferença de idade da base é o risco dominante: qualquer merge direto reabriria conflitos em router, mapa do Nexus, shell, sidebar, Auth e wrappers JavaScript que já evoluíram no main.

A branch **não foi mergeada**, nenhum cherry-pick foi aplicado e nenhum arquivo dela foi copiado para o checkout do main. Ela foi apenas buscada como referência remota e inspecionada.

## Arquivos e riscos encontrados

| Arquivo na branch | Alteração | Avaliação contra o main atual |
|---|---:|---|
| `src/core/supabase-auth.js` | adiciona login e cadastro por e-mail/senha | ideia funcional útil, mas a API Auth atual precisa ser revalidada contra o contrato server-side; não copiar sem testes de timeout, erro, sessão e redaction |
| `src/pages/login.js` | nova página inteira em JavaScript | incompatível com a regra atual de zero páginas canônicas JS; o main deve receber uma implementação TypeScript, não este arquivo histórico |
| `src/styles/login.css` | novo estilo da tela | pode ser reaproveitado seletivamente, mas precisa passar pelo layout/UI atual e pelos gates de acessibilidade |
| `src/main.js` | registra rota `/login` e captura redirect OAuth | arquivo crítico; qualquer alteração exige atualização simultânea de `docs/nexus/dominios.json`, além de validar o router atual |
| `docs/nexus/dominios.json` | registra identidade/autenticação | a branch respeita a regra de co-alteração com `src/main.js`, mas seu mapa está baseado na estrutura antiga e deve ser reconciliado, não aplicado literalmente |
| `src/layout/sidebar.ts` | adiciona atalho de login | precisa respeitar o shell atual, Module Registry e política de botão para módulos degradados |
| `src/layout/shell.ts` | integração de navegação | risco de conflito com o Command Center/harness e layout atual |
| `src/utils/icons.js` | adiciona ícone | wrapper/arquivo JS antigo; deve ser traduzido para a convenção TypeScript vigente se ainda necessário |

## Capacidades observadas na branch

O commit declara uma tela `/login` com duas modalidades, entrar e criar conta, usando e-mail/senha, além do login Google. Também adiciona `signInWithPassword()` e `signUpWithPassword()` ao adapter Supabase e preserva a chave local de sessão `auth:session`. A página mostra conta já autenticada, permite sair e oferece atalho para o Perfil.

O fluxo de redirect OAuth usa tokens vindos do fragmento da URL e tenta substituir o histórico para remover o token da barra de endereço antes de iniciar o router. A implementação também define timeouts para logout e refresh e faz limpeza local em falha de sessão.

Essas capacidades são referências de produto, não evidência de prontidão. A branch não demonstra compatibilidade com os contratos atuais de claims server-side, roles em `app_metadata`, RLS, política de módulos quebrados ou o preflight OpenClaw.

## Causa para não fazer merge direto

O merge direto seria inadequado por quatro causas independentes. Primeiro, a branch está 447 commits atrás e contém um `src/pages/login.js` canônico, contrariando a migração TypeScript concluída. Segundo, `src/main.js` e `docs/nexus/dominios.json` atuais evoluíram várias vezes; aplicar o diff histórico poderia apagar ou deslocar contratos de rotas e eventos. Terceiro, o adapter Auth da branch usa chamadas Supabase que precisam ser comparadas ao estado atual e a testes de segurança antes de receberem autoridade. Quarto, o fluxo de login/cadastro não pode liberar automaticamente acesso a páginas quebradas: isso depende de claims frescas e escopos server-side, enquanto a política atual é deny-by-default.

## Recomendação de reaproveitamento

Reaproveitar somente a intenção funcional: rota dedicada de login/cadastro, login Google preservado, sessão única e feedback de erro. A implementação deve ser reconstruída sobre o main atual em TypeScript, em um vertical slice separado, com contrato local de identity release, testes de sessão/expiração, integração do mapa Nexus na mesma mudança de `src/main.js` e nenhum DDL remoto.

O slice atual deste marco não implementa login nem modifica Auth real. Ele cria apenas o contrato local de prontidão de identidade para que a próxima implementação possa ser validada sem misturar a branch histórica.

## Bloqueios mantidos

RLS remoto continua bloqueado até aprovação explícita do custo de staging. Não haverá criação de usuários reais, alteração de provider, alteração de secrets, execução de migration, decode local de JWT ou promoção de módulos degradados. Roles devem vir de `app_metadata`, nunca de `user_metadata`; escopos desconhecidos permanecem vazios; e `runtimeAuthority` continua `not-authorized` até uma decisão server-side formal.

## Rollback

Como nenhum arquivo da branch foi aplicado, o rollback da auditoria é simplesmente manter `main` no estado atual. O fetch de referência pode ser removido localmente sem alterar histórico remoto. O contrato local futuro terá rollback independente e não exigirá alteração na branch histórica.

— **Manus AI**
