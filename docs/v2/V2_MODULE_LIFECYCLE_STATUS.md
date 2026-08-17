# V2 — Status do lifecycle por módulo

O `ciclo.js` continua sendo o único dono da execução do lifecycle. Este contrato
é apenas uma projeção observável do estado operacional.

## Estados

| Estado | Significado |
| --- | --- |
| `registered` | módulo está no Registry e o ciclo ainda não chegou nele — antes do boot **ou** durante uma subida em andamento |
| `starting` | o ciclo está executando uma fase de subida deste módulo **neste instante** (`runtime`, `init` ou `start`) |
| `running` | a autorização de Runtime foi aberta **e** `init` e `start` terminaram com sucesso |
| `stopping` | o ciclo está executando uma fase de descida deste módulo **neste instante** (`stop`, `runtime` ou `dispose`) |
| `failed` | alguma fase de subida falhou — inclusive a abertura do Runtime (fase `runtime`) |
| `stopped` | módulo não está no ar após uma execução do ciclo |

## Regras

- `running` só pode ser derivado de um módulo presente em `ciclo.vivos()`.
- **A autorização é pré-condição de `running`, e é cobrada num lugar só.** Quem
  barra é o `ciclo.ts`: sem Host aberto o módulo não entra em `vivos()`, e daí
  este contrato o vê como `failed` sem precisar perguntar nada ao Runtime.
  Repetir a checagem aqui seria defesa em profundidade escondendo mutante —
  Regra 1 das [`V2_TESTING_RULES.md`](./V2_TESTING_RULES.md), que já custou um
  sobrevivente nesta mesma cadeia.
- **A transição ganha do estado assentado.** `starting`/`stopping` são decididos
  antes de consultar `vivos()`, e isso é necessidade, não estilo: na descida o
  módulo **continua vivo enquanto desce**, então perguntar a `vivos()` primeiro
  devolveria `running` justamente para quem está parando.
- **Quem observa não é quem executa.** O ciclo é a única fonte da transição
  (`ciclo.emTransicao()`); este contrato só a traduz. `emTransicao()` é
  **obrigatório** — ciclo que não o expõe é recusado na construção, porque um
  retrato que nunca acusa transição é indistinguível de um sistema que nunca
  transiciona.
- Falhas preservam módulo, fase e motivo.
- O status não altera o lifecycle; ele apenas o observa.
- Um módulo `failed` não deve ganhar rota no Boot.
- O Supervisor continua responsável pelo estado global; este contrato é por módulo.
- Todo estado desta tabela tem contador em `resumo()`, e a soma dos contadores
  fecha com `total`. Contador que falta faz um módulo sumir da soma.

## ⚠️ Lacuna conhecida: módulo ignorado por ambiente aparece como `stopped`

Desde que o ciclo passou a aplicar `ambiente`, existe um quarto jeito de um
módulo não estar no ar: **ele não pertence a este ambiente**. O ciclo o devolve
em `ignorados`, separado de `falhas`, porque não é defeito.

Este contrato ainda não sabe disso. Um módulo ignorado não está em `vivos()`, não
está em `falhas()`, e com o ciclo em `no-ar` cai em `stopped` — que afirma "saiu
do ar" sobre um módulo que **nunca foi ao ar aqui, por regra**. É a mesma classe
de mentira que o `registered` corrigiu para a subida em andamento, e vale
registrá-la em vez de deixá-la descoberta.

Duas saídas, e a escolha não é óbvia:

| saída | a favor | contra |
| --- | --- | --- |
| estado novo (`ignored`) | diz a verdade sem ambiguidade | acrescenta ao enum público; todo consumidor de `resumo()` precisa contá-lo |
| reusar `registered` | sem mudança de contrato; "está no Registry e não foi ao ar" é literalmente verdade | apaga a distinção entre "ainda não chegou nele" e "decidiu que não é daqui" |

Enquanto não se decide, o `resumo()` continua fechando com `total` — o módulo é
contado, só que sob um rótulo que conta menos do que sabe. **Não é urgente porque
hoje nenhum módulo declara ambiente restrito**, e é exatamente por isso que
merece estar escrito: quando o primeiro declarar, o retrato vai mentir em
silêncio.

## Transições

`ciclo.emTransicao()` devolve `{ modulo, direcao, etapa }` ou `null`:

- `direcao` é `subindo` ou `descendo` — é o que separa `starting` de `stopping`.
- `etapa` reusa o vocabulário de `LifecycleFailure.fase` de propósito: é a mesma
  pergunta ("em que fase?"), respondida **antes** de haver falha em vez de depois.
- Só há um módulo em voo por vez, porque o ciclo percorre o Registry em série. Se
  algum dia a subida for paralela, isto vira uma lista e este contrato muda junto.

> `starting` passou anos no vocabulário sem nunca ser produzido — a implementação
> anterior era sequencial e o snapshot só via estados assentados. O mesmo defeito
> existia em `LifecycleStage`: `'start'` estava declarado e nada o emitia, então
> falha de `start` era reportada como falha de `init`, mandando quem lia o
> diagnóstico para o handler errado. Palavra declarada que ninguém emite não é
> contrato — é decoração que passa em qualquer teste.
