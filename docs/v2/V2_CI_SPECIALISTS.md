# V2 — CI por especialistas de linguagem

## Objetivo

A V2 não deve depender de um verificador genérico que tenta entender todas as linguagens e todas as camadas ao mesmo tempo.

Cada responsabilidade tecnológica recebe um especialista próprio. O especialista deve conhecer:

- a linguagem;
- as ferramentas daquela linguagem;
- os contratos da camada;
- os modos de falha mais prováveis;
- quais arquivos ele pode diagnosticar.

Um agregador posterior **não refaz as verificações**. Ele apenas reúne os resultados dos especialistas para o gate da PR.

## Especialistas

| Especialista | Escopo | Verificação principal |
|---|---|---|
| JavaScript/V2-JSDoc | `src/` + `v2/core` + módulos nativos JS | `npm test`, `npm run tipos:v2` |
| Rust Runtime | `v2/runtime` | `cargo test`, `cargo fmt --check` |
| Python/Arma3 | `scripts/**/*.py` | `compileall` + testes Python existentes |
| SQL/Supabase | migrations + contratos de segurança | testes de contrato SQL existentes |
| Integração | somente agregação | espera os especialistas e publica o resultado |

## Regra de diagnóstico

Quando um especialista falhar, a primeira pergunta é **qual camada quebrou**, não "como fazer o workflow ficar verde".

Exemplos:

- erro `TS7006` → especialista JS/JSDoc;
- erro `cargo` → especialista Rust;
- `SyntaxError`/`compileall` → especialista Python;
- RLS, migration ou contrato de tenant → especialista SQL/Supabase.

## Relação com o planejamento da V2

Isso não substitui o planejamento de #420/#422/#423. O especialista só verifica uma decisão já tomada.

A ordem continua:

`requisito → análise → benchmark/prova → decisão → implementação → especialista → integração`.

Não se deve enfraquecer um especialista para esconder uma falha.
