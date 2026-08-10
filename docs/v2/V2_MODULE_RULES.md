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
| 10 | `routes[].view` é função | ver abaixo — o **retorno** dela é o que importa |
| 11 | `dependencies[]` não contém o próprio `id` | ciclo trivial |
| 12 | `permissions[]` só nomes conhecidos | Regra 11 — permissão mínima e explícita |
| 13 | `lifecycle.*` são funções quando presentes | |

O validador **acumula** os erros em vez de parar no primeiro: quem escreve um
manifesto quer a lista inteira, não descobrir um problema por execução.

## `view` devolve o ELEMENTO, não o módulo

O invariante 10 diz que `view` é função. Isso **não basta**, e a primeira versão
deste contrato errou aí:

```js
view: () => import('./pagina.js')                      // ❌ resolve para o MÓDULO
view: (args) => import('./pagina.js')
        .then((m) => m.minhaPagina(args))              // ✅ resolve para o ELEMENTO
```

O router recebe um objeto e não tem o que montar — e o erro **não aparece no
registro**: as rotas registram, o `count()` bate, e a tela fica vazia. Nenhum
teste com router falso pega isso, porque o falso só guarda a função.

Foi o **banco de prova** (`v2/harness/`) que revelou, com o router de verdade num
navegador de verdade. É a razão de ele existir.

### A outra metade: o router anuncia, não monta

O router da V1 resolve a rota e emite `route:change` no bus; quem monta é quem
escuta. É desenho bom — desacopla resolução de renderização —, mas significa que
**registrar rotas não põe nada na tela**. Quem ligar a V2 ao shell precisa assinar
`route:change`, `route:notfound` e `route:error`.

## Chamar outro módulo: `ctx.usar()`

Um módulo **não importa** outro. Ele declara a dependência e pede a api:

```js
// no manifesto de quem OFERECE
api: { abrirAba, fecharAba },
apiVersion: 1,

// no manifesto de quem USA
dependencies: ['editor'],

// em runtime
const editor = ctx.usar('editor', { versao: 1 });
editor.abrirAba({ nome: 'a.js' });
```

Quatro regras, todas cobradas por teste (`test/v2/api.test.js`):

| Regra | O que ela impede |
| --- | --- |
| **chamar exige declarar** | dependência invisível — sem ela o Registry não ordena a subida nem corta em cascata |
| **versão é negociada** | `undefined is not a function` seis frames depois; a falha vira erro na resolução, com os dois números |
| **a culpa tem dono** | o log culpar quem chamou; `ErroApiModulo` carrega `dono`, `metodo` e a `causa` original, inclusive em promessa rejeitada |
| **superfície congelada** | o chamador remendar a api de quem ofereceu — usar o contrato ≠ mexer no módulo alheio |

> **Isto não é RPC.** É chamada de função no mesmo runtime, com fronteira
> declarada. O dia em que um módulo morar noutro processo — ou noutro
> repositório — o contrato já existe e o transporte entra por baixo, sem o
> chamador saber. É a preparação para integrar outros repositórios: **a
> fronteira nasce agora, o transporte depois.**

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

Deny-by-default vale: **declarar não é receber**. O manifesto diz o que o módulo
*pode pedir* — é o **teto**; conceder é decisão do decisor
([`v2/core/permissoes.js`](../../v2/core/permissoes.js)), cobrada por
`test/v2/permissoes.test.js` e verificada no navegador pelo `v2:integracao`.

> ⚠️ **Esta frase ficou aqui um bom tempo sem nada por trás dela.** O
> `contexto.js` respondia `pode(p)` com `manifesto.permissions.includes(p)`: na
> prática, declarar **era** receber, e este parágrafo descrevia um sistema que
> ninguém tinha escrito. Fica registrado em vez de reescrito porque é a lição
> mais cara desta fase — garantia documentada e não implementada é pior que
> garantia nenhuma: a ausência ninguém confia, a falsa todo mundo confia. Os
> detalhes estão em [`V2_SECURITY_RULES.md`](./V2_SECURITY_RULES.md) §1.

## Respondido pela evidência: módulo **não** é rota

A pergunta da granularidade tinha ficado em aberto. A V1 já a respondia, e não
tinha sido lida: a tabela de estabilidade declara `{ id: 'arsenal', descricao:
'Arsenal e Centro Militar' }` — **um id cobrindo duas rotas**. E o Centro Militar
consolidou 13 frentes numa entrada de sidebar porque são uma coisa só para quem
usa.

**As 99 rotas não viram 99 módulos.** Um módulo é unidade de propósito;
`routes[]` é plural desde o primeiro rascunho, e o formato aguentou 15 rotas num
módulo sem alteração (`v2/modules/militar/`).

## O que os casos difíceis revelaram

**O JARVIS escreve na chave do editor.** `src/utils/jarvis-tools.js:232` faz
`storage.set('editor:state', …)`, conhecendo o formato interno (`tabs`,
`activeId`). É a Regra 2 violada numa linha: storage compartilhado é import
disfarçado, e nenhuma análise estática aponta. O namespace obrigatório torna isso
**impossível por construção** — um módulo `jarvis` que declarasse `editor:state`
é recusado —, e o caminho legítimo passa a ser a `api` do editor.

**O contrato ainda não distingue dependência de referência.** O hub militar chama
`router.navigate()` para 14 rotas; some uma, o botão vai ao `notFound` calado.
Ali não dói porque as 15 rotas são do mesmo módulo, mas quando um módulo linkar
para outro vai ser preciso separar *dependência dura* (não funciona sem) de
*referência fraca* (degrada). **Pendência real, não resolvida.**

**Chave que não cabe no namespace vira migração, não exceção.** `/militar` grava
`militar-enc:cat`, que o validador recusa. A saída foi deixá-la fora e registrar
o alvo (`militar:enc-cat` v2 com `migrate`) — renomear dado do operador num
arquivo de exemplo, ou afrouxar o invariante para passar, seriam as duas formas
de fingir que o caso difícil era fácil.

## Ainda em aberto

Depende de decisão do operador (ver o fim da `V2_ARCHITECTURE.md`):
- **tipos** — se a V2 abrir mão do "JS puro", `stability`, `class` e
  `permissions` viram uniões de tipo e metade destes invariantes deixa de
  precisar de teste em runtime.
