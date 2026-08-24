# Login/Cadastro TypeScript — Auditoria do main

**Status:** AUDIT COMPLETE — nenhum provider remoto alterado
**Main observado:** `7c2ff15123c4a63b7c5a582069b6abd03b925ffa`
**Data:** 2026-08-21
**Objetivo:** confirmar o estado atual antes de construir a primeira vertical slice TypeScript a partir da intenção de `feature/login-cadastro`.

## Estado atual

O main já possui `src/pages/login.ts` como implementação canônica e `src/pages/login.js` como wrapper de compatibilidade. A página já apresenta abas de entrar/criar conta, login Google, confirmação de senha, estados de loading, mensagens de erro, sessão ativa, atalho para Perfil e logout. A rota `/login` já existe no router atual e a página importa `signInWithPassword()` e `signUpWithPassword()` do adapter `src/core/supabase-auth.js`.

O adapter Auth atual usa `fetch` diretamente contra os endpoints Supabase Auth, com timeout de 8 segundos para login/cadastro/refresh e 4 segundos para logout. A sessão é armazenada sob `auth:session` pelo wrapper de storage, o refresh é best-effort e o logout limpa a sessão local mesmo se o servidor estiver indisponível. O login Google usa redirect e o boot chama `handleAuthRedirect()` antes do router.

## Lacunas que não serão ampliadas neste slice

A página não deve interpretar a sessão local como claims server-side, decidir roles ou liberar módulos quebrados. A função `currentUser()` serve para apresentação da UI e não é uma autoridade; as decisões de acesso permanecem nos contratos de claims server-validated e `auth-identity-release`.

O adapter Auth ainda é JavaScript de infraestrutura compatível, mas a implementação canônica da página é TypeScript. Não será feita migração ampla do adapter neste slice porque isso mudaria um ponto sensível de Auth sem necessidade. Não haverá DDL Supabase, criação de usuário real, alteração de provider, novos secrets, decode local de JWT para autorização ou merge da branch histórica.

## Escopo da vertical slice

A slice reconstrói o contrato de formulário e estado de sessão local em TypeScript: email válido, senha mínima, confirmação no cadastro, estados idle/submitting/error/success, mensagens bounded e retorno seguro ao Perfil. Os testes usarão funções locais/fakes e não dependerão de rede. A UI continuará respeitando `supabaseConfigured()` e exibirá indisponibilidade quando o ambiente não tiver configuração.

## Invariantes

A rota atual e os wrappers V1 permanecem compatíveis. O mapa do Nexus não é alterado se `src/main.js` não for tocado. O estado de autenticação não será usado como `runtimeAuthority`; `publicPromotionAllowed` permanece `false`; roles futuras devem vir exclusivamente de `app_metadata` server-side.

## Rollback

O rollback remove somente contrato, testes e ajustes da página/adapter desta vertical slice. Não exige alterar Auth remoto, sessão existente, RLS, bridge OpenClaw ou o router global.

— **Manus AI**

## Resultado da implementação da slice

A implementação adicionou `src/security/auth-form-contract.ts` como contrato puro e conectou `src/pages/login.ts` a três operações locais: `validateAuthForm()`, `authValidationMessage()` e `normalizeAuthError()`. A senha bruta não aparece na saída da validação; somente o comprimento é exposto para diagnóstico local. O adapter `src/core/supabase-auth.js` não foi modificado.

A normalização cobre credencial inválida, e-mail não confirmado, conta já cadastrada, provider não configurado, falha de rede/timeout e erro desconhecido. Em todos os demais casos, a UI usa uma mensagem genérica, sem devolver o texto arbitrário do provider ao DOM.

| Verificação | Resultado |
|---|---:|
| `npm run tipos:ts` | Passou |
| Testes focais login + Auth/OpenClaw/JARVIS | 39/39 |
| `npm run verificar-nexus` | 99 rotas, 0 lacunas |
| `npm run smoke` | 99/99 rotas verdes |
| `npm test` | 1208/1208 |

O primeiro teste completo revelou uma expectativa incorreta no novo teste (`senha123` possui 8 caracteres, não 7). A expectativa foi corrigida sem alterar a implementação; a segunda execução passou com 1208 testes.

## Bloqueios remanescentes

A confirmação real de e-mail e a sessão real continuam dependentes da configuração existente do Supabase Auth. RLS remoto permanece bloqueado por custo de staging e não foi tocado. A decisão de roles, a liberação de módulos degradados/quarentenados e a autoridade de runtime continuam server-side e deny-by-default. A branch `feature/login-cadastro` continua não incorporada, pois sua base histórica diverge do main e contém implementação canônica JavaScript incompatível com a política atual.

## Próximo gate

Antes do commit será executado o runner completo de hardening, incluindo catálogo de eventos, TypeScript, testes, build, integração V2, smoke, caminho crítico, contratos Python e V2 Doctor. O único bloqueio conhecido esperado é o runtime Rust já classificado como `blocked-known`; qualquer falha nova será tratada como regressão e não mascarada.

— **Manus AI**
