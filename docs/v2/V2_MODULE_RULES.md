# V2 — Contrato do módulo

> Especificação do **Module Manifest**. Implementação: `v2/core/manifest.js`.
> Testes: `test/v2/manifest.test.js`. Contexto:
> [`V2_ARCHITECTURE.md`](./V2_ARCHITECTURE.md) §3.

## A regra que faz o manifesto valer alguma coisa

> **O Core consome o manifesto. Nada se declara duas vezes.**

Se o manifesto apenas *descrever* enquanto o código continua se registrando por
conta própria, a V2 terá **onze** lugares onde uma rota é declarada, em vez dos
dez da V1 — e a divergência que já existe hoje (22 labels diferentes entre
`sidebar.js` e `shell.js`) só ganha mais um lugar para acontecer.

Portanto, é proibido:

- registrar rota fora de `routes[]`;
- escrever label de navegação fora de `name`;
- declarar esquema de storage fora de `storage[]`;
- pedir permissão que não esteja em `permissions[]`.

A checagem disso é do **Registry** (passo 3), não do validador. O validador
garante que o manifesto está bem formado; o Registry garante que ele é a única
fonte.

## Forma

```js
export default {
  // ── identidade (obrigatório) ──────────────────────────────────────────
  id:      'cripto',              // kebab-case; único; é o namespace do módulo
  name:    'Lab de Criptografia', // UMA fonte para sidebar, header e catálogos
  version: '1.0.0',               // semver do MÓDULO, não do Baluarte

  // ── opcional ──────────────────────────────────────────────────────────
  description: 'Cifras clássicas, hashes e AES-GCM no navegador.',
  stability:   'estavel',         // estavel | beta | experimental (padrão: experimental)
  icon:        '🔐',
  ambiente:    'ambos',           // web | app | ambos (padrão: ambos)

  routes: [{ path: '/cripto', view: () => import('../modules/cripto/view.js') }],
  nav:    { section: 'ferramentas', order: 30 },

  dependencies: [],                    // ids de outros módulos
  permissions:  ['USER_DATA'],         // o que ELE pode pedir
  storage: [{ key: 'cripto:prefs', version: 1, class: 'local', migrate: (v) => v }],
  events:  { emits: ['cripto:cifrado'], consumes: [] },

  api: { encrypt, decrypt },           // o que oferece a outros módulos
  lifecycle: { init, start, stop, dispose }
};
```

## Invariantes cobrados pelo validador

| # | Invariante | Por quê |
| --- | --- | --- |
| 1 | `id` em kebab-case | é namespace de storage, de evento e de arquivo; maiúscula e ponto quebram os três |
| 2 | `name` não vazio | a ausência é o que produz "rota registrada sem título" — 31 casos na V1 |
| 3 | `version` semver | Regra 14 |
| 4 | `stability` ∈ {estavel, beta, experimental} | a tabela da V1 já usa esses três |
| 5 | **`storage[].key` começa com `<id>:`** | sem isso, dois módulos reivindicam a mesma chave e o segundo a carregar vence — em silêncio |
| 6 | **`events.emits[]` começa com `<id>:`** | um módulo não pode emitir em nome de outro |
| 7 | `storage[]` com `version` inteira ≥ 1 e `class` válida | é o contrato do storage da V1, que fica |
| 8 | **chave versão > 1 exige `migrate`** | a lição das 59 chaves: dado do operador não migra sozinho |
| 9 | `routes[].path` começa com `/` e é único no módulo | |
| 10 | `routes[].view` é função | carregamento é preguiçoso; `view` importa sob demanda |
| 11 | `dependencies[]` não contém o próprio `id` | ciclo trivial |
| 12 | `permissions[]` só nomes conhecidos | Regra 11 — permissão mínima e explícita |
| 13 | `lifecycle.*` são funções quando presentes | |

O validador **acumula** os erros em vez de parar no primeiro: quem escreve um
manifesto quer a lista inteira, não descobrir um problema por execução.

## O que o validador **não** faz

- **Não** checa colisão entre módulos (dois módulos com o mesmo `id`, ou rotas
  duplicadas entre módulos). Isso é do **Registry** — ele é quem vê o conjunto.
- **Não** executa `lifecycle` nem `view`.
- **Não** valida a implementação da `api`, só que é objeto.

## Permissões reconhecidas

Herdadas do vocabulário do #423 §9:

```
READ_FILES · WRITE_FILES · NETWORK · DATABASE · SYSTEM_INFO · USER_DATA · EXECUTION
```

Deny-by-default segue valendo (é o modelo da V1 que fica): **declarar não é
receber**. O manifesto diz o que o módulo *pode pedir*; conceder é decisão do
Permission System.

## Ainda em aberto

Depende de decisão do operador (ver o fim da `V2_ARCHITECTURE.md`):

- **granularidade** — 99 módulos de uma rota, ou módulos maiores com várias? O
  contrato já aceita `routes[]` plural, então suporta os dois; o que muda é a
  convenção.
- **tipos** — se a V2 abrir mão do "JS puro", `stability`, `class` e
  `permissions` viram uniões de tipo e metade destes invariantes deixa de
  precisar de teste em runtime.
