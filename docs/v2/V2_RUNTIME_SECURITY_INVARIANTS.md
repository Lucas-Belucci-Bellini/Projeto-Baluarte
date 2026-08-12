# V2 Runtime — invariantes de segurança

Esta lista é um contrato de segurança, não uma descrição aspiracional.

## Fronteira Core → Runtime

1. O Runtime valida novamente o envelope recebido.
2. A versão do envelope é explícita e incompatível com versões desconhecidas.
3. IDs de módulo são identificadores, não caminhos de filesystem.
4. `.` / `..`, separadores `/` e `\\` e NUL são recusados em IDs de módulo.
5. A raiz física é fornecida pelo host confiável, nunca pelo manifesto.
6. Permissões desconhecidas são rejeitadas antes da criação da política.
7. Permissões duplicadas são rejeitadas.
8. Módulos duplicados são rejeitados.
9. Um módulo só recebe as capacidades declaradas no seu grant.
10. O sandbox de filesystem continua sendo aplicado no Runtime Rust, mesmo que o Core já tenha filtrado o pedido.

## Por que a validação existe nos dois lados?

O Core controla a orquestração, mas não é a fronteira final de confiança. O
Runtime Rust precisa tratar toda mensagem recebida como entrada não confiável.
Isso permite trocar o transporte no futuro sem transformar uma falha do Core em
escape de sandbox.

## Regressão descoberta durante a construção

O `RuntimeHost` deriva a raiz física com `root.join(modulo)`. Um ID como
`../outro` poderia transformar um identificador lógico em caminho físico fora da
raiz. A validação do envelope agora rejeita esses IDs **antes** dessa construção.

Esse caso fica coberto por teste unitário em `v2/runtime/src/envelope.rs`.
