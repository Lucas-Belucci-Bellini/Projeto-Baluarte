# 🧬 JARVIS — Skills auto-criadas

Primeira capacidade trazida do **hermes-agent** (Nous Research) para o JARVIS: o
agente **cria as próprias habilidades** em runtime, **guarda** e **reusa** nas
próximas conversas — sem você editar código.

> Conceito-assinatura do hermes: "criação autônoma de skills". Aqui ele encaixa
> na infraestrutura de ferramentas que o JARVIS já tinha (`registerTool`).

---

## Como usar

1. Abra **`/jarvis`** e selecione o modo **⚛ Agente** (requer Claude API key).
2. Peça uma capacidade nova, por exemplo:
   - *"Crie uma skill que converte reais para dólar a uma taxa que eu informo."*
   - *"Crie uma skill que calcula o dano efetivo dado dano-base e mitigação (%)."*
   - *"Crie uma skill que lista as equipes de elite por especialidade."*
3. O JARVIS chama `create_skill`, a skill é validada, salva e **registrada na
   hora** — ele já a usa na mesma resposta.
4. As habilidades aprendidas aparecem em **⚙ Modos & Config → 🧬 Skills
   aprendidas** (com contador de uso e botão de apagar) e num badge na toolbar.

As skills ficam no `localStorage` (`baluarte:jarvis:skills`) e são recarregadas
automaticamente no boot do site.

### Ferramentas do agente
| Ferramenta | O que faz |
|---|---|
| `create_skill` | Cria/atualiza uma skill (`name`, `description`, `input_schema`, `code`). |
| `list_skills`  | Lista o que já foi aprendido (nome, descrição, nº de usos). |
| `delete_skill` | Apaga uma skill pelo nome. |

---

## Anatomia de uma skill

```js
{
  name: 'converter_moeda',          // snake_case, único, 3–40 chars
  description: 'Converte um valor por uma taxa informada.',
  input_schema: {                   // JSON Schema dos argumentos
    type: 'object',
    properties: { valor: { type: 'number' }, taxa: { type: 'number' } },
    required: ['valor', 'taxa']
  },
  code: 'return { resultado: input.valor * input.taxa };'
}
```

O `code` é o **corpo** de uma função `(input, sdk) => resultado`:
- **`input`** — objeto com os argumentos (conforme o `input_schema`).
- **`sdk`** — capacidades seguras (abaixo).
- Use **`return`** para devolver o resultado (precisa ser serializável em JSON).

### SDK disponível
| Função | Descrição |
|---|---|
| `sdk.calc(expr)` | Avalia expressão matemática (`'2 + 3 * sqrt(16)'`). |
| `sdk.arsenal(query)` | Busca no Arsenal (até 10 itens). |
| `sdk.equipe(code)` / `sdk.equipes()` | Ficha de uma equipe / lista de todas. |
| `sdk.arco(code)` / `sdk.arcos()` | Resumo de um arco / lista de todos. |
| `sdk.log(...args)` | Linha de depuração, devolvida junto do resultado. |
| `sdk.now()` | Timestamp atual (ms). |

---

## 🔒 Segurança — sandbox de 3 camadas

O corpo da skill é JavaScript, mas executado de forma defensiva
(`src/utils/jarvis-skills.js`):

1. **Denylist estática** — antes de salvar, recusa código com tokens perigosos
   (`fetch`, `document`, `window`, `localStorage`, `eval`, `Function`,
   `constructor`, `prototype`, timers, `async`/`await`…) e código que não compila.
2. **Shadowing de globais** — os identificadores perigosos são declarados como
   parâmetros `undefined` da função, então `fetch`/`window`/`globalThis`/`self`
   ficam **mortos** dentro do corpo. Sem nenhuma referência ao objeto global, não
   há como transformar uma string em acesso global.
3. **Strict mode, sem segredos** — roda em `"use strict"` (`this === undefined`)
   e só recebe `input` e `sdk`. **A API key do operador nunca é exposta.**

➡️ Resultado: skills são **puras** — computam/consultam dados do Baluarte e
devolvem um valor. Não tocam no DOM nem na rede.

### Limites
- Nome: `^[a-z][a-z0-9_]{2,39}$`, sem colidir com ferramentas built-in.
- Código: até 4000 chars · até 64 skills salvas.
- Execução **síncrona** (sem timer/async) — um laço infinito travaria a aba.

---

## 🗺️ Roadmap

- **Isolamento forte** em Web Worker (mata o resíduo do `new Function` e permite
  timeout/kill de skills que travem).
- **Ações** (além de computação pura): deixar skills dispararem ferramentas
  built-in (navegar, abrir o editor) de forma controlada.
- **Compartilhar/exportar** skills entre operadores.

Verificação automática da sandbox: smoke test cobre denylist, shadowing,
execução, SDK e persistência (15 casos). Validação de bundle via `npm run build`.
