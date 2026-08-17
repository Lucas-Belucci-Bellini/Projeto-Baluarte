# V2 — Status do lifecycle por módulo

O `ciclo.js` continua sendo o único dono da execução do lifecycle. Este contrato
é apenas uma projeção observável do estado operacional.

## Estados

| Estado | Significado |
| --- | --- |
| `registered` | módulo está no Registry, mas o ciclo ainda não o colocou no ar |
| `starting` | reservado para a futura observabilidade de uma inicialização em andamento |
| `running` | a autorização de Runtime foi aberta **e** `init` e `start` terminaram com sucesso |
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
- Falhas preservam módulo, fase e motivo.
- O status não altera o lifecycle; ele apenas o observa.
- Um módulo `failed` não deve ganhar rota no Boot.
- O Supervisor continua responsável pelo estado global; este contrato é por módulo.

A existência de `starting` no vocabulário permite instrumentação futura sem
alterar o contrato dos consumidores atuais. A implementação atual é deliberada:
o `ciclo.js` executa `init`/`start` sequencialmente, portanto o snapshot só observa
estados estáveis.
