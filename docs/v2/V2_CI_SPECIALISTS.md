# V2 — CI por especialistas de linguagem

A V2 não deve depender de um verificador genérico que tenta entender todas as linguagens e camadas ao mesmo tempo.

Cada responsabilidade tecnológica recebe um especialista próprio. O agregador posterior apenas reúne os resultados; não refaz nem enfraquece os gates.

| Especialista | Escopo | Gate |
|---|---|---|
| JavaScript/V2-JSDoc | `src/`, `v2/core`, módulos nativos JS | `npm test`, `npm run tipos:v2` |
| Rust Runtime | `v2/runtime` | `cargo fmt --check`, `cargo test` |
| Python/data | `scripts/**/*.py` | `compileall` + testes específicos |
| SQL/Supabase | migrations + contratos de segurança | testes de contrato SQL |
| Integração | somente agregação | reúne os quatro veredictos |

Quando um especialista falha, a pergunta é qual camada quebrou, não como fazer o workflow ficar verde.

A ordem da V2 continua: `requisito → análise → benchmark/prova → decisão → implementação → especialista → integração`.
