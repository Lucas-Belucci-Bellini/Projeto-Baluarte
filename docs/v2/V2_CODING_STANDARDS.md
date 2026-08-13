# V2 — Padrões de código

> Companheiro de [`V2_TESTING_RULES.md`](./V2_TESTING_RULES.md), e escrito com o
> mesmo critério: **nada aqui é preferência de estilo**. Cada padrão saiu de um
> defeito concreto da fundação — a maioria meu — e traz o caso junto, porque
> regra sem caso vira ritual e ritual se abandona na primeira pressa.
>
> A Regra 28 do plano manda o ritmo (*pequena alteração → teste → revisão →
> próxima*); isto aqui diz o que a "pequena alteração" precisa parecer.

## 1. Portão com escopo implícito mente

`npm run tipos:v2` está no CI desde que afirmei "tsc exit=0" com o tsc vermelho.
Portão instalado, lição aprendida — e o `include` do `jsconfig.json` continuou
alcançando **apenas** o `core/`. O primeiro módulo escrito para a V2 nunca passou
pelo verificador. Quando entrou, apareceram **12 erros de tipo** — num arquivo que é o
modelo de todo módulo futuro.

O erro não foi esquecer. Foi que o portão **não diz sobre o que ficou verde**:
`exit 0` não distingue "verifiquei tudo" de "verifiquei o Core e mais nada".

**O padrão:** todo portão declara o próprio escopo, e o escopo é **cobrado por
teste**. `test/v2/tipos-cobertura.test.js` fica vermelho quando um módulo nativo
não aparece no `include` — no mesmo commit em que ele nasce.

A fronteira que o teste cobra é real, não burocrática: módulo **nativo** entra;
módulo **adaptador** (o que importa página da V1) fica fora, porque o tsc segue
import e arrastaria 297 erros de código congelado. `exclude` não resolveria — ele
tira o arquivo do `include`, não do grafo de imports.

## 2. Anotação pode ser MENOS precisa que a inferência

O caso mais contraintuitivo da rodada. `bytesAleatorios` devolvia
`Uint8Array<ArrayBuffer>` por inferência, e o JSDoc "melhorou" para:

```js
/** @param {Uint8Array} salt */   // ❌ vira Uint8Array<ArrayBufferLike>
```

`ArrayBufferLike` inclui `SharedArrayBuffer`, que **não** é `BufferSource` — e o
WebCrypto recusa. A anotação escrita para documentar tornou o tipo mais largo que
o real e quebrou a chamada.

```js
/** @returns {Uint8Array<ArrayBuffer>} */   // ✅
```

**O padrão:** anotação sem parâmetro de tipo, em API genérica, é anotação
incompleta. Se a inferência já acerta, ou você a preserva por inteiro ou não a
anota.

## 3. Não silencie o verificador — torne o invariante explícito

O `registry` sabe que todo id em `ordem` está em `ativos`. O tsc não sabe, e
oferece o caminho fácil: um cast e segue o jogo. O que existe no lugar:

```js
function obrig(mapa, id) {
  const m = mapa.get(id);
  if (!m) throw new Error(`registry inconsistente: "${id}" está na ordem e não no mapa`);
  return m;
}
```

Custo: uma função de quatro linhas. Ganho: no dia em que alguém mexer na ordem e
quebrar a premissa, o Baluarte **diz onde** — em vez de acessar `undefined.routes`
três frames adiante, num lugar que não tem nada a ver com a causa.

**O padrão:** cast é afirmação sem prova. Quando o verificador reclama de algo que
você sabe ser verdade, escreva a verificação — ela é a documentação da premissa,
e vira a mensagem de erro quando a premissa cair.

## 4. Capacidade se recebe; vizinho se pede; o próprio se importa

Três caminhos, e confundi dois deles escrevendo o primeiro módulo nativo:

| Alcançando | Caminho | Por quê |
| --- | --- | --- |
| Core (storage, log, bus, métricas, trabalho) | `ctx.*` — **recebido** no `init` | é o recorte declarado no manifesto; importar burlaria a declaração |
| outro módulo | `ctx.usar('editor', { versao: 1 })` | fronteira declarada, versão negociada, culpa com dono |
| arquivo do próprio módulo | `import { cifrar } from './motor.js'` | é o mesmo módulo — não há fronteira para atravessar |

Escrevi `ctx.usarMotor.cifrar(...)` por reflexo, procurando o motor **dentro** do
contexto. Não existe, e o `ctx.usar()` inclusive recusa a própria api com "não
precisa de `usar()` para a própria api".

O reflexo é compreensível e vale registrado: a arquitetura fala tanto de contrato
que dá a impressão de que tudo passa por ele. **O contrato governa atravessar
fronteira de módulo.** Dentro do módulo, o caminho é o import de sempre.

## 5. Dê nome à ausência

```js
origem: meta.origem ?? 'desconhecida',
```

Vazio e ausente parecem a mesma coisa num log e não são: quem lê `origem: ""`
acha que o campo quebrou; quem lê `origem: "desconhecida"` sabe que **ninguém
declarou**. Um manda investigar o bus, o outro manda investigar o emissor.

**O padrão:** a ausência é um valor do domínio e merece um nome. `null`, `""` e
`undefined` espalhados pelo mesmo campo são três formas de dizer "não sei" que o
leitor precisa decodificar.

## 6. Nada sem teto num processo que vive muito

Duas peças do Core têm limite explícito, pela mesma razão:

- `metricas` — `TETO_SERIES = 100` por métrica. Rótulo vindo de dado do operador
  (um id, uma URL) cria série nova a cada chamada e come a memória. O excedente
  **não é ignorado**: cai num balde `«outros»` e o nome da métrica entra em
  `truncadas`, para o diagnóstico dizer que houve corte em vez de mentir por
  omissão.
- `trabalho` — fila limitada que rejeita com `FilaCheia`, mais teto global e teto
  por módulo (`limitePorModulo`), para um módulo não faminar os outros.

**O padrão:** coleção que cresce por entrada externa tem teto, e o corte é
**anunciado**. Estouro silencioso de memória é o defeito mais caro de
diagnosticar, porque a pilha aponta para a vítima e nunca para a causa.

## 7. Falhe alto em vez de renderizar uma tela morta

```js
if (!estado?.ctx) {
  throw new Error('cripto: view pedida antes do init — o módulo não está no ar');
}
```

O caminho oposto — devolver uma div vazia — produz o pior resultado possível: a
rota funciona, a tela abre, nada acontece, e o operador reporta "está estranho"
três dias depois sem nada no log.

**O padrão:** estado impossível levanta, com o nome do módulo e o que faltou na
mensagem. Degradação suave é para o que o operador consegue contornar; para
invariante quebrada, é disfarce.

## 8. Exceção engolida é decisão, e vem com o motivo escrito

Existe **uma** no `log.js`:

```js
try { destino(r); } catch { /* … */ }
```

com o porquê logo abaixo: destino que quebra não pode derrubar quem estava só
registrando — a alternativa é um erro de log **mascarar o erro real** que se
tentava registrar.

**O padrão:** `catch {}` vazio é proibido. Ou o bloco trata, ou repassa, ou traz
escrito por que engolir é o comportamento certo ali. As três são aceitáveis; o
silêncio sem justificativa não é, porque o próximo leitor não distingue decisão
de descuido.

## 9. Conversão de fronteira é explícita

```js
if (['1', 'true', 'sim', 'yes', 'on'].includes(s))  return true;
if (['0', 'false', 'nao', 'não', 'no', 'off', ''].includes(s)) return false;
return undefined;   // não é booleano — e dizer isso é melhor que chutar
```

`FLAG=0` virando `true` porque `"0"` é string não-vazia é o clássico, e é
silencioso: a flag fica ligada, o comportamento muda, e nada no log menciona
configuração.

**O padrão:** tudo que entra de fora (ambiente, URL, arquivo, rede) é convertido
por função que **enumera** as formas aceitas e devolve "não sei" para o resto.
Coerção implícita da linguagem não vale como conversão.

## 10. O nome carrega o risco

```js
config.ler('API_TOKEN')      // ❌ levanta: "é segredo — use revelar(), e só onde precisa mesmo"
config.revelar('API_TOKEN')  // ✅ feio de propósito
```

E o `toJSON` devolve o diagnóstico com os segredos mascarados, então
`JSON.stringify(config)` — que é como um segredo chega a um log sem ninguém
querer — não tem como vazar.

**O padrão:** o caminho perigoso é mais difícil de escrever que o seguro, e o
caminho acidental é **impossível**. Não por desconfiança de quem escreve: por
saber que o vazamento típico não é decisão, é `JSON.stringify` num handler de
erro às duas da manhã.

> Isto vale junto com a instrução permanente do operador: **credencial não entra
> em código nem em commit**. Na reconstrução migra-se a *referência* à
> credencial, nunca o valor. `config.js` existe para que a referência tenha onde
> morar.

## 11. Sem `innerHTML`

O texto vem do operador. Texto de operador que vira marcação é injeção — a regra
é a mesma do shell da V1, e a V2 não a afrouxa por conveniência de construção de
DOM. O helper `h()` de cada view resolve o caso comum em 12 linhas.

## 12. O comentário registra o porquê — inclusive quando o porquê é um erro meu

O achado da §4 está escrito no cabeçalho de `v2/modules/cripto/view.js`, com a
tentativa errada junto. Apagar teria deixado o arquivo mais limpo e o próximo
leitor igualmente propenso a errar.

**O padrão:** comentário explica **decisão e alternativa descartada**, não o que
a linha faz. E erro de projeto corrigido fica registrado onde foi cometido —
mesma prática do ADR-003 e do commit-errata: histórico que esconde o erro ensina
que ele não aconteceu.

---

## Convenções mecânicas

O que não precisa de justificativa por já estar decidido no repositório:

| | |
| --- | --- |
| **Linguagem** | **português** em identificadores, mensagens e comentários — é o idioma do repositório inteiro; `criarRegistry` misturado com `createRegistry` seria o pior dos dois |
| **Sintaxe** | ES2022, ESM. Sem TypeScript **de sintaxe**: tipos entram por JSDoc + `checkJs` (ver [`V2_STACK.md`](./V2_STACK.md) §2) |
| **Exports** | `export function criarX()` para fábricas; `export default` só em manifesto de módulo, onde é o objeto único do arquivo |
| **Erros** | classe própria quando o chamador precisa distinguir (`ErroChave`, `ErroApiModulo`, `FilaCheia`); `Error` com mensagem específica quando não |
| **Assíncrono** | `async/await`. `.then()` só onde o valor é a promessa em si (rota `view`, por exemplo) |
| **Tamanho** | nenhum arquivo do Core passou de 300 linhas, e isso não foi meta — é o que um arquivo com **uma** responsabilidade dá. Passou muito disso, provavelmente são dois |
| **Cabeçalho** | todo arquivo do Core abre com o bloco que responde *por que este arquivo existe* e *o que ele recusa fazer* |

## O portão, antes de commitar

```sh
npm test              # a suíte inteira
npm run tipos:v2      # exit 0 — LIDO, não presumido (§1)
npm run v2:integracao # navegador real
npm run build         # a V1 continua construindo
```

Os quatro estão no CI. O terceiro item da lista tem história: a única vez que
afirmei um resultado sem ler a saída, o commit foi para o `main` com o tsc
vermelho.
