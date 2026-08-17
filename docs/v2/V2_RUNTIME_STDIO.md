# V2 — Transporte Runtime por stdio

A primeira implementação concreta da fronteira Core → Runtime usa um processo Rust com `stdin/stdout`.

```text
Core
  │ JSON line
  ▼
stdin
  │
  ▼
baluarte-runtime (Rust)
  │
  ├─ valida envelope
  ├─ resolve raízes confiáveis
  ├─ cria RuntimeHost
  └─ executa operação autorizada
  │
  ▼
stdout
  │ JSON line
  ▼
Core
```

## Raiz confiável

O caminho base é fornecido pelo processo pai através de `BALUARTE_RUNTIME_ROOT`. O manifesto não escolhe a raiz física.

Para cada módulo autorizado, o Runtime usa `BALUARTE_RUNTIME_ROOT/<modulo>` como raiz física. A política continua responsável por impedir escapes de caminho.

## Protocolo atual

### Autorizar

```json
{"op":"authorize","envelope":{"versao":1,"modulos":[{"modulo":"alpha","permissoes":["READ_FILES"]}]}}
```

Resposta:

```json
{"status":"authorized","modulos":["alpha"]}
```

### Ler arquivo

```json
{"op":"read_file","envelope":{"versao":1,"modulos":[{"modulo":"alpha","permissoes":["READ_FILES"]}]},"modulo":"alpha","path":"hello.txt"}
```

A resposta de sucesso contém os bytes como array JSON. Falhas retornam `status: error`.

## Limites atuais

- uma requisição em voo por processo;
- somente `READ_FILES` está implementado;
- o transporte ainda é uma implementação experimental, não um contrato final de concorrência;
- Tauri continua fora desta etapa.

## Estado real: testado, **ainda não ligado**

Até 17/08/2026 o `criarRuntimeStdio` era a **quarta peça** encontrada pronta,
documentada por este arquivo e sem um único importador — nem de produção, nem de
teste. Documento sem executor é intenção, e peça sem consumidor não tem retrato:
ninguém sabia se ela funcionava.

Agora ela tem `test/v2/runtime-stdio.test.js`, exercitada contra **processo real**
(um `node` falando este protocolo), não contra duplo de `spawn`. A distinção é o
ponto: duplo prova o formato das mensagens; só processo de verdade expõe o
comportamento de I/O — e foi ali que estava o defeito abaixo.

> **O defeito que só o processo real mostrou.** Uma resposta inválida fazia o
> `parseResposta` lançar **dentro do handler de `line`**, com o `pending` já
> zerado: o erro subia como exceção não capturada **e a promessa do chamador
> nunca assentava**. Um Runtime que respondesse lixo penduraria o Core em
> silêncio — o mesmo formato do "init que trava não pendura o Baluarte", agora na
> fronteira. Medido: sem o conserto os dois testes de resposta inválida não
> falham, eles **travam** (71,8 s contra 639 ms). Sete mutantes plantados, sete
> mortos.

### O que isto NÃO prova

- **Nada sobre o binário Rust.** O par nos testes é um `node`; quem mede o outro
  lado é `npm run v2:runtime`, que exige `cargo` — ausente na máquina do
  operador, então essa metade é do remoto.
- **Nada sobre produção.** O transporte continua **sem consumidor**: o entrypoint
  web (`v2/harness/main.js`) injeta autorização sem transporte, e não poderia
  fazer diferente — navegador não spawna processo. Ligar isto de verdade é no
  **app desktop**, atrás de `window.baluarte.native`, conforme o mega-plano #238.

Por isso a caixa `transporte concreto` do [`V2_PROGRESS.md`](./V2_PROGRESS.md)
**segue desmarcada**. Marcá-la com a peça testada e desligada seria repetir
exatamente o erro que este repositório já pagou quatro vezes.

### Buraco conhecido, deliberadamente não consertado aqui

`enviar()` não tem teto próprio. Pelo caminho do lifecycle há o `comTeto` do
`ciclo.ts`, que cobre a abertura do Host; `lerArquivo` não passa por ele. Runtime
que aceita a linha e nunca responde pendura esse caminho. Não foi consertado
nesta rodada para manter o escopo no item da fila — mas é a mesma família do
defeito acima e merece ser o próximo passo, não uma descoberta futura.
