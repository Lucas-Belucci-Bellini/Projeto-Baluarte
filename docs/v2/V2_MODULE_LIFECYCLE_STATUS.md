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
