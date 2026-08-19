# Feature `login-cadastro`

**Estado:** integrada localmente na `main` atual; publicação pendente do ciclo final deste marco. Checks remotos de Auth/RLS ainda precisam ser observados.

**Branch de origem:** `feature/login-cadastro`

**Commit de origem:** `9ffbe39ed4213610c07b549df8a002ea03fdb0a8`
**Conversão TypeScript:** `login.ts` no commit local `7e50207b`
**Base de integração:** `main` após `04575d5a`; SHA final será registrado após o push.

## 1. O que há de novo

A branch adiciona uma aba dedicada `/login` para **entrar, criar conta e sair**, separada do `/perfil`. O fluxo oferece cadastro e login por e-mail e senha, login social com Google, confirmação de e-mail quando exigida pelo Supabase e atalho para o perfil quando a sessão já está ativa.

A mudança é composta por oito arquivos, com 303 linhas adicionadas e 3 removidas no diff contra o `main` auditado.

| Arquivo | Mudança | Papel |
| --- | --- | --- |
| `src/pages/login.js` | Novo | UI de Entrar/Criar Conta, tabs, validação de confirmação de senha e estado logado |
| `src/styles/login.css` | Novo | Estilos isolados da aba de autenticação |
| `src/core/supabase-auth.js` | Modificado | Cadastro, login por senha, Google, refresh, logout e captura do redirect OAuth |
| `src/main.js` | Modificado | Registro da rota `/login` e boot do redirect de autenticação |
| `src/layout/shell.ts` | Modificado | Entrada da navegação principal |
| `src/layout/sidebar.ts` | Modificado | Link visível no menu |
| `src/utils/icons.js` | Modificado | Ícone da área de acesso |
| `docs/nexus/dominios.json` | Modificado | Registro do domínio de identidade no mapa do Nexus |

## 2. Fluxos entregues

O cadastro usa `POST /auth/v1/signup` e não grava senha no Baluarte. Quando o Supabase exige confirmação, a UI informa que o usuário precisa clicar no link enviado e volta para a aba Entrar. Quando a confirmação automática está ativa, a sessão é armazenada e a pessoa é encaminhada ao Perfil.

O login usa `POST /auth/v1/token?grant_type=password`. O login Google usa redirect ao endpoint oficial do Supabase e `handleAuthRedirect()` lê os tokens do fragmento, grava a sessão e substitui a URL por uma rota limpa. O logout tenta revogar a sessão no servidor, mas sempre limpa a sessão local mesmo se a rede estiver indisponível.

A sessão usa a chave de storage já prevista (`auth:session`) e continua no modo local quando o Supabase não está configurado. O cliente usa a anon key pública prevista para o frontend; nenhuma service key ou segredo de servidor deve entrar no bundle.

## 3. Revisão de segurança

A sessão é classificada como dado sensível de navegador, não como segredo de backend. O acesso real aos dados deve continuar sendo decidido pelo JWT e pelas políticas RLS do Supabase, especialmente `auth.uid() = id` para `profiles`. A decodificação local do JWT em `currentUser()` é apenas para exibição da UI; ela não deve ser usada para autorizar operações.

O fluxo precisa manter as seguintes regras antes do merge:

| Regra | Critério |
| --- | --- |
| Senha | Nunca armazenar senha no frontend, Git, logs ou URL |
| Tokens | Remover tokens da URL após OAuth e não incluí-los em telemetria |
| Autorização | Não confiar em `currentUser()` ou `localStorage` para papel, admin ou owner |
| RLS | Validar leitura/escrita com sessão real e usuário diferente |
| Redirect | Confirmar allow-list de produção e localhost no Supabase |
| Erros | Não vazar detalhes sensíveis; mensagens podem ser específicas apenas para UX |
| Timeouts | Manter timeout de signup, login, refresh e logout |
| Logout | Limpar sessão local mesmo quando a revogação remota falhar |

## 4. Pendências antes de merge

A implementação foi convertida para `src/pages/login.ts` e `login.js` agora é apenas wrapper de compatibilidade. A rota continua registrada no router V1 e a migração respeita a regra de zero páginas canônicas JavaScript.

Foram adicionados testes de contrato para cadastro confirmado/pendente, senha divergente, timeouts, logout, redirect OAuth, rota e vínculo RLS. Na integração local, a feature passou `npm run tipos:ts`, `npm run tipos:v2`, `npm test` (**965/965**), `npm run build`, `npm run smoke` (**99/99**), `npm run v2:integracao` (**19/19**), `npm run caminho-critico` (**15/15**), `npm run prova-offline` (**9/9**) e `npm run sonda-memoria`.

A integração foi reaplicada sobre a main atual e submetida a um único ciclo local de gates. A promoção do release ainda depende de observar Auth/RLS, redirect allow-list e configuração real do Supabase em ambiente remoto; a UI não decide papéis elevados.

## 5. Relação com o roadmap

A feature é o marco **L0 — Identidade** do roadmap: permitir que o visitante use o site sem login, mas tenha uma conta quando precisar sincronizar perfil, estética, favoritos, memória e módulos privados. Ela prepara o terreno para JARVIS por usuário, Segundo Cérebro por usuário, permissões de developer/admin/owner e o protótipo de app.

O próximo marco não é ampliar permissões no cliente. É consolidar identidade, sessão, RLS, logout e testes; depois, conectar cada módulo à identidade somente por contratos de backend autorizados.
