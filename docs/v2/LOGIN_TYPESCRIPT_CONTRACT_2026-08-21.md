# Login/Cadastro — Contrato TypeScript da primeira vertical slice

**Versão:** `login-typescript/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** validação e projeção da UI antes/depois do adapter Auth existente
**Autor:** Manus AI

## Objetivo

Reconstruir no main a intenção funcional de `feature/login-cadastro` sobre a página canônica `src/pages/login.ts`, sem fazer merge da branch histórica e sem mudar os endpoints Supabase Auth. A slice valida dados localmente, controla estados da interface e impede que mensagens arbitrárias de provider sejam exibidas sem normalização.

## Limites de entrada

O e-mail deve ser uma string aparada, não vazia, com no máximo 254 caracteres e formato básico de endereço. A senha deve ter entre 6 e 128 caracteres. No modo `signup`, a confirmação deve coincidir exatamente com a senha. O contrato não avalia força criptográfica de senha, não armazena credencial e não recebe token.

## Estados da UI

A página usa estados locais `idle`, `submitting`, `error` e `success`. A transição para `submitting` ocorre antes de chamar o adapter existente; toda exceção volta a `error` com mensagem bounded; o botão deve ser reabilitado no `finally`. No cadastro confirmado, a UI pode navegar ao Perfil; no cadastro que exige confirmação de e-mail, deve informar o próximo passo sem tratar a sessão como autenticada.

```ts
interface AuthFormValidation {
  valid: boolean;
  mode: 'login' | 'signup';
  email: string;
  passwordLength: number;
  reasons: readonly AuthValidationReason[];
}
```

A senha bruta existe somente no elemento de formulário e na chamada transitória ao adapter; o resultado do contrato expõe apenas `passwordLength` e não deve ser persistido, logado ou incluído na observabilidade.

## Reason codes bounded

`email-required`, `email-invalid`, `email-too-long`, `password-too-short`, `password-too-long`, `password-mismatch` e `confirmation-required`.

Mensagens do adapter são mapeadas para um catálogo local: credencial inválida, e-mail não confirmado, e-mail já cadastrado, provider indisponível, timeout e erro genérico. O texto recebido do provider nunca deve ser devolvido diretamente ao DOM, log ou Event Bus.

## Invariantes

A validação é pura e sem rede. Nenhuma função deste contrato cria conta, faz login, refresh, logout, decodifica JWT ou altera `runtimeAuthority`. O contrato de identidade server-side continua sendo a única fonte para roles e módulos quebrados. `publicPromotionAllowed` permanece `false` fora e dentro da UI.

## Testes obrigatórios

A suíte deve cobrir e-mail vazio/inválido/longo, senha curta/longo, confirmação divergente, login válido, cadastro válido, normalização de erros conhecidos/desconhecidos, ausência de vazamento de senha/token e compatibilidade da página com a rota atual.

## Rollback

Remover este contrato e o wiring de validação da página devolve o formulário ao comportamento anterior sem alterar provider, sessão existente ou router.

— **Manus AI**
