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

## Estado real: **ligado**, e medido contra o binário de verdade

O portão E2E do CI (`v2-runtime-e2e.yml` → `scripts/v2-runtime-smoke.mjs`) passou
a **usar** o `criarRuntimeStdio` em vez de reimplementar o protocolo.

Isso conserta um defeito de arquitetura que estava escondido à vista: o smoke
tinha `spawn`, serialização, buffer de linhas e teto **próprios**. Havia duas
implementações do mesmo protocolo, e a única que falava com o binário passava por
fora do transporte. Por isso o transporte tinha zero consumidores — e por isso o
E2E ficava verde provando o protocolo *do script*, não o do transporte. O
transporte podia estar quebrado sem que nada acusasse. E estava.

Medido nesta máquina (Windows, Rust 1.97.1 com toolchain GNU):

| | |
| --- | --- |
| `cargo test` (`npm run v2:runtime`) | **12 + 3 testes, 0 falhas** |
| smoke E2E pelo transporte, contra o `.exe` real | **OK** |
| testes do transporte | **12/12**, com 9/9 mutantes mortos |

## Histórico: como a peça estava antes

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

- **Nada sobre o app.** O consumidor do transporte é o portão E2E, não o
  Baluarte em execução. O entrypoint web (`v2/harness/main.js`) injeta
  autorização sem transporte, e não poderia fazer diferente — navegador não
  spawna processo. Levar isto ao produto é no **app desktop**, atrás de
  `window.baluarte.native` (#238), e continua item aberto.
- **Nada sobre o alvo MSVC.** O binário aqui foi compilado com o toolchain
  **GNU**, porque instalar as Build Tools do Visual Studio exige elevação que
  uma sessão não-interativa não consegue dar (o instalador sai com `1602`,
  "cancelado pelo usuário"). Uma release Windows deveria usar MSVC; para provar
  o protocolo, GNU serve.

### Ligar no app desktop — o que já está medido (17/08/2026)

O caminho foi mapeado; o que falta não é desenho, são duas pontas de
empacotamento que **não se verificam numa máquina sem `cargo`**.

O que já existe e serve de molde:

- `desktop/src/preload.js` expõe `window.baluarte` com `invoke(channel, payload)`
  sobre `ipcRenderer.invoke('baluarte:invoke', …)`, e `desktop/src/ipc.js` tem
  **allowlist explícita** por canal (`buildHandlers`). Um namespace `runtime:*`
  entra ali, do mesmo jeito que `arma3:*`, `arquivos:*` e `hermes:*`.
- `desktop/src/nexus.js` e `desktop/src/hermes.js` já fazem spawn **lazy e
  guardado** — é o padrão a seguir, não um a inventar.
- O M4 (RFC #232) já decidiu **onde** runtimes moram:
  `app.getPath('userData')/runtimes/…`, com preflight que detecta e baixa. O
  `baluarte-runtime` segue a mesma forma.

Os dois bloqueios que existiam **foram resolvidos**:

1. **`v2/` não ia no instalador.** O `files` do electron-builder cobre só o
   `desktop/`. Agora há dois `extraResources`: `../v2/core → v2core` (filtrando
   `runtime-stdio.js`) e `../v2/runtime/target/release → runtime`. O
   `desktop/src/runtime.js` procura exatamente nesses destinos.
2. **O binário nunca tinha sido compilado.** Agora o `desktop-release.yml`
   compila o Runtime **antes** de empacotar, em cada SO da matriz. Isso importa
   porque `extraResources` com `filter` **não falha** quando a origem falta —
   apenas não copia. Sem o passo de build, a release sairia sem o Runtime, o app
   degradaria educadamente, e ninguém notaria.

A ponte é o `desktop/src/runtime.js`, registrado na allowlist do `ipc.js` como
`runtime:status`, `runtime:autorizar` e `runtime:ler`. Três decisões:

- **Não requer `electron`.** A raiz confiável entra injetada
  (`app.getPath('userData')/runtime-root`, seguindo o M4/RFC #232), calculada no
  `buildHandlers` — não no topo do módulo, porque `app.getPath` depende do app
  pronto. Isso é o que torna a ponte testável em Node puro, e é a razão de
  `test/v2/desktop-runtime.test.js` existir: o `desktop/` não tinha **nenhum**
  teste até aqui.
- **Ausência não é erro.** Sem binário, `status()` devolve
  `{ disponivel: false, motivo }` — mesmo contrato do `hermes:status`. Recurso
  ausente não pode virar app quebrado.
- **`pathToFileURL` no `import()`.** O transporte é ESM e o `main` é CommonJS. Em
  Windows, `import()` de caminho absoluto (`C:\...`) falha sem URL `file://` —
  família "Windows" outra vez.

Medido: **8/8** em `desktop-runtime.test.js`, incluindo o ponta a ponta que
atravessa ponte → transporte ESM → processo Rust, no Windows.

### O que continua aberto

O ponta a ponta prova a ponte, **não o app empacotado**. Nenhum instalador foi
produzido com estas mudanças dentro, então o caminho `process.resourcesPath`
segue sendo o único ramo não exercitado — ele só existe em app empacotado.
Provar isso exige rodar o `desktop-release.yml` e abrir o instalador.

### Teto por requisição — `TETO_RUNTIME_MS`

`enviar()` não tinha teto. Runtime que **aceita** a linha e nunca responde
pendura o chamador; pelo lifecycle havia o `comTeto` do `ciclo.ts`, mas
`lerArquivo` não passava por ele.

O conserto veio junto porque virou requisito: o smoke tinha teto próprio de 5 s,
e fazê-lo usar o transporte sem teto teria **removido uma proteção existente**.
O padrão é `TETO_RUNTIME_MS = 5000`, e `tetoMs` sobrescreve.

O `clearTimeout` mora num lugar só (`retirarDeVoo`), porque são **quatro** os
caminhos que assentam uma requisição — resposta, erro do processo, saída do
processo, falha de escrita. Esquecê-lo em qualquer um faz o teto disparar depois,
sobre uma requisição já respondida, e o estrago aparece na requisição
**seguinte** — o pior lugar possível para procurar. Há mutante para os dois
lados: remover o teto, e remover o `clearTimeout`.
