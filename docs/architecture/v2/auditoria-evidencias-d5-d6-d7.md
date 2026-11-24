# Auditoria de evidências — D5, D6 e D7

> **Status:** 🔍 **auditoria independente — não aprova nada.**
> Nenhuma linha de código-fonte do repositório foi alterada por esta auditoria:
> ela só executou o que já existe, leu código e mediu processos.
>
> **Atualização de 2026-11-24:** D5, D6 e D7 foram aprovados explicitamente pelo
> operador e registrados nos
> [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md),
> [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) e
> [ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md). Os sete ajustes da
> [§6.1](#ajustes-exigidos-antes-de-a-arq-1-virar-adr) entraram como portões
> P1–P5 e dívidas nomeadas M1–M6 nos anexos dos ADRs; nenhum deles foi declarado
> concluído. Este documento continua sendo o registro do que a evidência sustenta.
>
> **Objeto auditado:** [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md)
> e as evidências que ele usa.
> **Método:** reproduzir, não reler. Onde não foi possível reproduzir, o motivo
> está declarado e a classificação reflete isso.

---

## 0. Ambiente e limites desta auditoria

Vale registrar antes de qualquer número: **esta auditoria rodou em Linux, não em
Windows.** Toda afirmação sobre Windows 10/11 abaixo é leitura de código e de
configuração de build — não medição. Isso, por si, já é um achado da §3.

| Item | Valor |
| --- | --- |
| Host | Linux 5.10.134 x86_64, 4 vCPU, Intel Xeon Platinum, 7,6 GB RAM |
| Node | v22.23.2 (bench original: v22.22.2) |
| Rust | 1.98.1 (bench original: 1.94.1) |
| Python | 3.12.13 (bench original: 3.11.15) |
| Postgres | 14.24 (cliente) + servidor embarcado efêmero via `pgserver`, socket em `/tmp/pgdata` |
| `psycopg` | 3.3.9 |
| Alvo WASM | `wasm32-unknown-unknown` instalado manualmente (o mirror configurado devolvia 404) |

O que **não** foi possível executar: app Electron/Tauri empacotado (sem
`node_modules`, sem display), navegador real para os benchmarks de rota e boot,
e qualquer coisa em Windows.

Classificação usada: **CONFIRMADA**, **PARCIALMENTE CONFIRMADA**,
**NÃO REPRODUZIDA**, **INSUFICIENTE**.

---

## 1. Placar das evidências

| # | Evidência usada no estudo | Classificação | Resumo |
| --- | --- | --- | --- |
| E1 | 22,1 ns (JS) × 110,9 ns (WASM), razão 5,0× | **PARCIALMENTE CONFIRMADA** | Razão reproduzida (4,61–5,15×); valores absolutos ~30% menores aqui |
| E2 | Travessia crua 2,0 ns × 11,8 ns | **PARCIALMENTE CONFIRMADA** | 1,2 ns × 7,6–8,9 ns |
| E3 | Core gasta 2,4 µs por evento | **NÃO REPRODUZIDA** | 8,6–8,7 µs, estável em 3 execuções — 3,6× acima |
| E4 | Manifesto 0,9 µs/op | **CONFIRMADA** (ordem) | 0,6–0,7 µs |
| E5 | Selar 100/1.000 módulos: 348 µs / 3,30 ms | **PARCIALMENTE CONFIRMADA** | 198–218 µs / 2,17–2,24 ms |
| E6 | Boot 1.000 módulos: 191 ms | **PARCIALMENTE CONFIRMADA** | 101–104 ms |
| E7 | Permissão ~0,0 µs | **CONFIRMADA** | 0,0 µs em 2 M execuções |
| E8 | Task Manager 5,0 µs/tarefa | **CONFIRMADA** (ordem) | 4,1–4,3 µs |
| E9 | Rust 1,34× mais rápido que Node em JSON | **NÃO REPRODUZIDA** | 65 ms × 59 ms — Rust levemente **mais lento** no payload testado |
| E10 | Rust 1,8× Node no laço de byte | **NÃO REPRODUZIDA** | 13 ms × 14 ms — ~1,08× |
| E11 | Python 236× mais lento que Rust no laço de byte | **PARCIALMENTE CONFIRMADA** | 1.762 ms × 13 ms ≈ 136× (outro dataset) |
| E12 | Transporte stdio JSON-lines implementado | **CONFIRMADA** | 12 testes JS + 3 testes Rust passam aqui; integrado ao app |
| E13 | Fila com `SKIP LOCKED`, lease, heartbeat, shutdown gracioso | **CONFIRMADA com ressalva** | 14/14 testes passam — mas só depois de configurar `search_path`, que a documentação não menciona |
| E14 | "14 testes" da fila como garantia | **PARCIALMENTE CONFIRMADA** | Os testes existem e passam; **não estão em nenhum workflow de CI** |
| E15 | Estimativa de 10–30 MB para o Host Rust | **NÃO REPRODUZIDA (favorável)** | RSS medido: **1,03 MB** |
| E16 | Estimativa de 5–30 ms para subir o Host | **PARCIALMENTE CONFIRMADA** | 4,8 ms cold, incluindo `spawn` + primeira autorização |
| E17 | Estimativa de 30–300 µs por chamada de processo | **CONFIRMADA** | 154,8 µs p50 / 274,4 µs p95 (4 KB, stdio real) |
| E18 | Boot 215–855 ms e rotas 163 ms | **INSUFICIENTE** | Exigem build + navegador; não executável aqui |
| E19 | "C++ zero linhas no repositório" | **CONFIRMADA** | Nenhum arquivo C/C++ |
| E20 | ARQ-1 em Windows 10/11 x64 | **INSUFICIENTE / NÃO COBERTO** | Nenhum CI Windows para V2; smoke empacotado recusa Windows |

Duas conclusões imediatas e desconfortáveis:

1. **A evidência mais citada do estudo (22,1/110,9 ns) não é o número que decide
   ARQ-1.** Ela compara JS com WASM *dentro do webview* — topologia que nem ARQ-1
   nem ARQ-2 propõem (nelas o Host é **processo**, não WASM). A comparação certa
   foi medida nesta auditoria: **154,8 µs p50** por ida e volta de processo.
2. **Onde o estudo errou, errou contra si mesmo** (Host 1 MB, não 10–30 MB) ou
   em detalhe que não muda a decisão (Rust 1,08× em vez de 1,8× sobre Node). Mas
   há um erro que muda a confiança: a fila é dada como "✅ já implementado" sem
   nunca ter rodado em CI.

---

## 2. Auditoria dos benchmarks

### 2.1 JS × WASM — os 22,1 ns e 110,9 ns

**Código.** `v2/bench/fronteira-wasm.mjs`:

- `medir()` nas linhas 43–51: aquece **50.000** iterações, cronometra `N` com
  `process.hrtime.bigint()`, divide pelo número de iterações.
- `N = 2_000_000` (linha 52).
- `r.jsSoma` (56), `r.wasmSoma` (57), `r.jsDespacho` (68), `r.wasmId` (72),
  `despacharWasmStr` (81–84), `r.wasmStr` (85).
- Lado Rust: `v2/bench/rust-wasm/src/lib.rs` — `soma`, `registrar`,
  `despachar` (por id, sem alocar), `despachar_str` (lê do buffer estático de
  256 bytes).

**Comando.**

```sh
cd v2/bench/rust-wasm && cargo build --release --target wasm32-unknown-unknown
node v2/bench/fronteira-wasm.mjs
```

**Metodologia.** Uma execução por cenário, sem percentis, sem intervalo de
confiança, sem repetição. Aquecimento de 50 mil iterações. `soma` não tem
consumo do retorno (DCE possível); `despachar` tem `CONTAGEM += 1` e
`contagemJs++`, o que impede eliminação.

**Hardware original.** `v2/bench/RESULTADOS.md` declara "Linux x86_64, Node
v22.22.2, Rust 1.94.1" e **não registra modelo de CPU** — não há como saber em
que máquina os 22,1/110,9 ns foram obtidos.

**Reprodução (3 execuções, script original, sem alteração):**

| Medida | Registrado | R1 | R2 | R3 |
| --- | ---: | ---: | ---: | ---: |
| JS `soma` | 2,0 ns | 1,2 | 1,3 | 1,2 |
| WASM `soma` | 11,8 ns | 7,6 | 8,9 | 8,2 |
| JS `despachar("ev:7")` | 22,1 ns | 15,3 | 15,4 | 16,8 |
| WASM `despachar("ev:7")` | 110,9 ns | 78,7 | 78,0 | 77,4 |
| Razão | 5,01× | 5,15× | 5,05× | 4,61× |
| Sobrecarga/evento | +88,7 ns | +63,5 | +62,6 | +60,6 |

**Veredicto:** *PARCIALMENTE CONFIRMADA*. A razão reproduz dentro de 8%
(4,61–5,15× contra 5,01×) e a conclusão qualitativa se sustenta; os valores
absolutos são ~30% menores, compatível com máquina mais rápida. O que **não**
reproduz é o uso retórico: o texto do estudo chama isso de "despacho de evento
real", e não é. É `Map.get` com chave constante mais um incremento — enquanto o
Event Bus real, medido pelo próprio repositório, custa **8,7 µs** (E3), ou seja
**~570× mais** que os 15 ns aqui medidos. Comparar esse microbenchmark com o Core
como se fosse o Core é o tipo de erro que o ADR-004 acusa em outros.

**Limitações que invalidam comparação mais forte:**

1. **Topologia errada para a decisão.** WASM no webview ≠ processo Rust. ARQ-1 e
   ARQ-2 põem o Host em processo; o número relevante é 154,8 µs, não 110,9 ns.
2. **Sem percentis nem repetição.** Um p95 poderia inverter a leitura em máquina
   com turbo/throttling.
3. **`soma` sem consumo de retorno** — candidato a eliminação por DCE; o "piso"
   de 2,0/7,6 ns pode ser artefato.
4. **Buffer fixo de 256 bytes** para o nome do evento: mede o caso fácil. Nome
   maior muda o custo de `encodeInto`.
5. **Comparação de melhor-caso contra melhor-caso** é correta em método, mas o
   lado JS usa `Map`, não o bus real (que tem curinga, origem, versão e
   correlação — os 2,4–8,7 µs).

### 2.2 Core em JS — 2,4 µs por evento, 0,9 µs por manifesto

**Código.** `v2/bench/core-js.mjs`: `medir()` (34–41) aquece só 2 chamadas e usa
`performance.now()`; `validar` (74), boot (92), `emit` (103) com 500.000
iterações.

**Comando.** `node v2/bench/core-js.mjs`

**Reprodução (3 execuções):**

| Medida | Registrado | R1 | R2 | R3 |
| --- | ---: | ---: | ---: | ---: |
| `validar()` | 0,9 µs | 0,7 | 0,6 | 0,6 |
| `selar()` 10 módulos | 63,6 µs | 39,2 | — | — |
| `selar()` 100 | 347,8 µs | 218,2 | 198,3 | 198,7 |
| `selar()` 1.000 | 3,295 ms | 2,213 | 2,236 | 2,165 |
| boot 10 | 5,28 ms | 2,32 | — | — |
| boot 1.000 | 191,09 ms | 104,3 | 101,5 | 103,4 |
| `emit()` 1 direto + curinga | **2,4 µs** | 8,7 | 8,6 | 8,7 |
| 50.000 tarefas | 5,0 µs | 4,2 | 4,3 | 4,1 |
| `pode()` concedida | 0,0 µs | 0,0 | 0,0 | 0,0 |

**Veredicto:** *NÃO REPRODUZIDA* no item que o estudo mais cita (evento), e
*PARCIALMENTE CONFIRMADA* no resto.

O `emit()` é o caso grave: 2,4 µs registrado, **8,6–8,7 µs** reproduzido, com
variância desprezível entre execuções. Não é ruído — é diferença de máquina/versão
que o registro original não permite explicar, porque **não guarda modelo de CPU
nem percentis**. O estudo herdou 2,4 µs e escreveu "o bus só é gargalo se a UI
emitir milhares de eventos por segundo". Com 8,7 µs, o teto cai para ~115 mil
eventos/s — ainda muito acima de uma UI real, então **a conclusão sobrevive**, mas
o número citado não é confiável e o texto deveria dizer "2,4 a 8,7 µs conforme a
máquina".

### 2.3 Python × Node × Rust em JSON e em byte

**Código.** `v2/bench/workers/comparar.sh` — lê um JSON grande, desserializa,
percorre 532 mil chaves e depois faz varredura de byte com hash rolante.

**Comando original.** `bash v2/bench/workers/comparar.sh` (usa
`scripts/arma3/out/arma3-config.json`, 18,7 MB).

**Problema de reprodutibilidade encontrado:** `arma3-config.json` **não existe**
no repositório — só `arma3-acessorios.json` (30,7 MB) e `arma3-animacoes.json`
(8,8 MB). O comando padrão do script falha com "arquivo de medição ausente". A
auditoria rodou com o dataset de 8,4 MB via argumento explícito.

| Medida | Registrado (17,9 MB) | Reproduzido (8,4 MB) |
| --- | --- | --- |
| parse Python | 292 ms | 66 ms |
| parse Node | 250 ms | 59 ms |
| parse Rust | 187 ms | 65 ms |
| passeio Python | 130 ms | 49 ms |
| passeio Node | 64 ms | 17 ms |
| passeio Rust | 19 ms | 6 ms |
| memória Python | 114 MB | 47 MB |
| memória Node | 130 MB | 84 MB |
| memória Rust | 104 MB | 84 MB |
| byte loop Python | 4.240 ms | 1.762 ms |
| byte loop Node | 32 ms | 14 ms |
| byte loop Rust | 18 ms | 13 ms |

**Veredicto:** *PARCIALMENTE CONFIRMADA*, com duas correções materiais.

- **"Rust 1,34× mais rápido que Node em JSON": não reproduzido.** Aqui Rust
  (65 ms) ficou **mais lento** que Node (59 ms). O argumento do estudo — "1,34×
  não justifica reescrita" — fica *mais forte*, não mais fraco: o ganho real é
  zero nesse payload.
- **"Rust 1,8× Node no laço de byte": não reproduzido.** Aqui 13 ms × 14 ms
  (~1,08×). O abismo real é Python (1.762 ms), ~136× — que é o que sustenta a
  decisão de tirar parser binário de Python. A vantagem de Rust sobre **Node**
  nesse teste é marginal; a vantagem de ambos sobre Python é enorme.

Datasets diferentes impedem comparação direta de valores; a **direção** das três
afirmações qualitativas (Python desqualificado em byte, Python aceitável em JSON,
Rust no topo em estrutura profunda) se mantém.

### 2.4 Benchmarks que não pude reproduzir

| Benchmark | Por quê | Classificação |
| --- | --- | --- |
| Boot real da plataforma (14 ms / 215–855 ms) | exige `npm run build` + preview + navegador | INSUFICIENTE |
| Rotas reais (p50 163 ms) | idem | INSUFICIENTE |
| Busca Evidence (125–223 µs) | exige dataset `PZ_IDS` e script | INSUFICIENTE |
| Event Bus 2026-08-25 (9,46 µs externo) | script próprio, execução longa | não executado — nota: já diverge 4× do `core-js.mjs`, o que reforça que a medição de bus é sensível a método |

Observação relevante: o repositório tem **três** números diferentes para "custo
de evento" — 2,4 µs (`core-js.mjs`), 8,7 µs (reproduzido aqui) e 9,46 µs (bench
de 2026-08-25 com método externo). O estudo escolheu o menor. Nenhum é falso; o
problema é citar um sem a faixa.

---

## 3. Auditoria dos protótipos

### 3.1 `v2/core/runtime-stdio.js` — o transporte

**Implementado.** `TETO_RUNTIME_MS = 5_000` (linha 28); `spawn` com
`stdio: ['pipe','pipe','pipe']`; uma requisição em voo (`pending`); quatro
caminhos de assentamento (resposta, `error`, `exit`, falha de escrita), cada um
limpando o timer; `parseResposta` com validação de forma; `fechar()` encerra stdin
e o readline.

**Testado.** `test/v2/runtime-stdio.test.js` — **12 testes, 12 passam aqui**
(executado). O par de teste é `node -e` falando o protocolo, não o binário Rust:
prova o **lado Core**, e o cabeçalho do arquivo diz isso explicitamente.

**Integrado.** Sim: `desktop/src/runtime.js` resolve o binário por
`process.resourcesPath` → `target/release|debug` → env `BALUARTE_RUNTIME_BIN`, e
`desktop/src/ipc.js` expõe `runtime:status`, `runtime:autorizar`, `runtime:ler`.
O `extraResources` do empacotamento copia `baluarte-runtime[.exe]` e o próprio
`runtime-stdio.js`. Ausência do binário **degrada** em vez de quebrar — decisão
consciente e documentada no código.

**Ressalvas.**

- `fechar()` não espera `exit` nem mata o filho; depende de o Runtime encerrar no
  EOF de stdin (faz: `for line in stdin.lock().lines()` termina).
- Falha no meio de uma escrita concorrente não existe porque só há uma em voo —
  mas isso também significa **zero paralelismo**: a 154,8 µs por chamada, o teto
  é ~6.400 chamadas/s serializadas. Suficiente para I/O de app; insuficiente se
  alguém projetar streaming ou consultas concorrentes.
- **Nenhum dos 12 testes roda em Windows.** O comentário do arquivo cita a
  armadilha do `.cmd` no Windows, mas o comportamento não é verificado lá.

### 3.2 `v2/runtime/src/protocol.rs` — o contrato

**Implementado.** Duas operações: `authorize` e `read_file`. Loop de linha em
`main.rs` com `MAX_REQUEST_BYTES = 1 MB` (linha 6), rejeição de JSON inválido e
continuidade após erro. Envelope v1 com cinco rejeições. `RuntimePolicy` por
módulo, raiz vinda do ambiente do host (`BALUARTE_RUNTIME_ROOT`).

**Testado.** `cargo test` → **12 unitários + 3 de processo**, todos passam aqui
(executado). Os 3 de processo spawnam o binário real e verificam JSON inválido,
linha vazia e requisição acima de 1 MB.

**Ressalvas técnicas encontradas na leitura:**

1. **Resposta em bytes como array JSON.** `Response::File { bytes: Vec<u8> }`
   (`protocol.rs:27`) serializa `[120,120,...]`. Medido: arquivo de 4 KB →
   resposta de **16.428 bytes**, **4,01× de inflação**. Base64 daria ~1,37×. Para
   um protocolo que existe há meses e só lê arquivos pequenos, é dívida latente,
   não bug — mas num desenho que pretende transportar conteúdo (documentos,
   imagens), 4× é significativo.
2. **Sem limite de resposta**, só de requisição. Nada impede um `read_file` de 80
   MB gerar uma linha de 320 MB.
3. **Sem `id` de correlação, sem cancelamento, sem streaming.** Coerente com uma
   requisição em voo, mas é o contrato que D7 herdaria.

### 3.3 Fila PostgreSQL — `SKIP LOCKED`, lease, heartbeat, shutdown

**Implementado** (`v2/data/migrations/001_fundacao.sql`, `worker.py`):

- `reivindicar_tarefa` (linha 177) com `FOR UPDATE SKIP LOCKED` (195), incremento
  de `tentativas`, `lease_ate`;
- `recuperar_tarefas_vencidas` (203): devolve ao `QUEUED` com backoff exponencial
  (teto 300 s) e vira `FAILED` acima de `max_tentativas`;
- `lease_ate` + índice parcial `tarefa_lease` (156, 173);
- `_Heartbeat` (227–255): thread separada renovando o lease;
- `parar()` idempotente com `SIGTERM`/`SIGINT` (113–118) e espera ociosa
  interrompível.

**Testado — e aqui está o achado.** Os 14 testes existem
(`v2/services/tarefas/test_worker.py`), mas:

1. **Nenhum workflow de CI os executa.** Nenhum arquivo em
   `.github/workflows/` referencia `BALUARTE_TEST_DSN` ou `pytest`. Ou seja: a
   garantia "14 testes" nunca foi exercida por automação no repositório.
2. **Falham contra banco recém-migrado.** Rodados aqui contra Postgres 14
   embarcado, os 14 falharam com `UndefinedTable`: a migração faz
   `SET search_path TO baluarte, public` **na sessão do script**, e a função
   `reivindicar_tarefa` referencia `tarefa` sem qualificar — logo depende do
   `search_path` de **quem chama**. O DSN do README não define isso.
3. Depois de `ALTER DATABASE postgres SET search_path TO baluarte, public`,
   **14/14 passaram em 2,29 s**.

**Veredicto:** a fila **funciona** — mas o caminho documentado não funciona sem
uma configuração que não está escrita em lugar nenhum. Isso é
*PARCIALMENTE CONFIRMADA* com ressalva operacional, e explica por que "14 testes"
não deveria ser lido como "provado em CI".

### 3.4 O que **não** está implementado, apesar do que o estudo sugere

| Alegação implícita | Realidade |
| --- | --- |
| Supervisor de processos | **Não existe.** Nenhum código em `v2/core/` ou `desktop/src/` inicia `worker.py`; `supervisor.js` e `runtime-supervisor.js` supervisionam saúde de **módulos**, não processos de SO |
| Worker Python integrado ao app | Não. Não há chamada, nem empacotamento: `extraResources` leva `dist`, `runtime-stdio.js` e o binário Rust — **nenhum Python** |
| Runtime rodando por padrão no app | Só se o binário existir no pacote; hoje degrada para indisponível |
| C++ | Zero linhas, como o estudo disse |

---

## 4. Auditoria da ARQ-1 nos sete eixos exigidos

### 4.1 Windows 10/11 x64 — o eixo mais frágil

| Fato verificado | Consequência |
| --- | --- |
| Todos os workflows V2 rodam em `ubuntu-latest` (`v2-runtime`, `v2-core`, `v2-runtime-e2e`, `v2-desktop-packaged-runtime`, `v2-validation`) | **Nenhum teste V2 roda em Windows** |
| `desktop-release.yml` tem matriz `windows-latest` e roda `cargo build --release` do runtime | Compila em Windows; **não testa** |
| `scripts/v2-packaged-runtime-smoke.mjs` lança erro em `win32`: "o smoke empacotado atual exige o runner Linux com Xvfb" | O único teste ponta-a-ponta do pacote **exclui Windows por construção** |
| `desktop/src/runtime.js` já escolhe `baluarte-runtime.exe` e `extraResources` copia o `.exe` | O caminho existe; a verificação, não |

**Dois riscos de código que só aparecem no Windows:**

**(a) Encerramento gracioso não é portável.** `worker.py` instala handlers para
`signal.SIGTERM` e `signal.SIGINT`. No Windows, `SIGTERM` **não é entregue pelo
SO**: `TerminateProcess` mata sem rodar handler. O desligamento gracioso
documentado (termina a tarefa na mão, não deixa `RUNNING` órfã) **não acontece**
com o mecanismo atual em Windows — a tarefa só volta pela reaper, depois do lease.
O desenho precisa de outro gatilho (fechar stdin, evento nomeado, Job Object).

**(b) Prefixo de caminho do Windows não é rejeitado.** `security.rs` tem
`valid_module_id`, que rejeita `/`, `\`, `.`, `..`, NUL e qualquer caractere fora
de `[A-Za-z0-9_-]`. **Essa função não é chamada por nada além dos próprios
testes** (verificado por busca textual). Quem valida de verdade é
`envelope.validate()`, que rejeita `/`, `\`, `.`, `..`, NUL — mas **aceita `:`**.
Em Windows, `PathBuf::push` com caminho que tem prefixo mas não raiz (ex.: `C:x`)
**substitui** o caminho base. Resultado: um ID de módulo `C:algo` sairia da raiz
confiável. Não é explorável hoje (o Core é quem monta o envelope, e o Core é
confiável), mas é exatamente a classe de defeito que ADR-002 existe para impedir:
**uma guarda escrita, testada e não usada**.

### 4.2 Consumo de memória

Medido, não estimado: o processo Rust do Runtime em repouso consome **1.052 kB
(~1,03 MB)**. O estudo estimou 10–30 MB. Erro de uma ordem de grandeza, **na
direção que desfavorece a própria recomendação**.

O que continua desconhecido: webview (Electron ~100 MB+ ou WebView2) e worker
Python com dependências de IA. Sem `node_modules` e sem display, não há medição
possível aqui. As estimativas de 60–120 MB e 40–90 MB permanecem **E**, sem
confirmação.

### 4.3 Inicialização

Medido: `spawn` do Runtime + primeira autorização = **4,8 ms** cold; chamadas
seguintes 154,8 µs p50. O estudo estimou 5–30 ms — faixa correta, limite superior
pessimista.

Para Python, medido apenas o custo de importação do módulo do worker com
`psycopg` presente: **115 ms** (`worker_import_s 0.115`). O custo de subir um
worker com dependências de IA continua **INSUFICIENTE** — não há dependências
instaladas aqui e o estudo estimou 150–600 ms sem base.

O boot completo do app (215–855 ms no harness) **não é** o boot da V2: é um
preview de navegador com 99 rotas da V1. Usar esse número como "boot do
aplicativo" seria repetir o erro de confundir harness com produto.

### 4.4 Recuperação após falhas

| Cenário | Estado real |
| --- | --- |
| Worker morre no meio da tarefa | Coberto por teste (`test_workers_paralelos...`, lease) — passa, **fora do CI** |
| Worker não responde a chamada curta | Teto de 5 s existe e é testado (JS) |
| Runtime Rust morre | `exit` rejeita a requisição em voo; **não há política de reinício** em `runtime-stdio.js` |
| Reinício automático do Runtime | Não existe. O estudo falou de "política de reinício com teto" como se fosse peça do desenho; é peça **a construir** |
| Processo órfão em Windows | Sem Job Object, órfão sobrevive ao app |

### 4.5 Segurança entre processos

O que é sólido: envelope revalidado no Runtime, raiz vinda do host, política por
módulo, rejeições testadas, `PathOutsideRoot` testado, permissões de vocabulário
fechado (7 capacidades).

O que é frágil: `:` aceito em ID de módulo (§4.1b); nenhum limite de resposta;
nenhuma autenticação entre processos (não precisa com stdio, precisaria com
socket); o socket de Postgres no teste local é aberto por padrão.

### 4.6 Manutenção de três toolchains

Estado real: Node (V1 + Core V2), Rust (Runtime, 950 linhas), Python (worker, 284
linhas, fora do pacote). CI tem `v2-runtime.yml`, `v2-core.yml`, `v2-validation.yml`
— todos em Ubuntu. C++ **não existe**, então "três toolchains" hoje são **duas em
CI** e três no build de release (`desktop-release.yml`).

Custo observado nesta auditoria: instalar toolchain WASM quebrou (mirror 404);
subir Postgres local exigiu pacote embarcado; `psycopg` faltava. Nada disso é
argumento contra a arquitetura — é a evidência de que "três toolchains" é custo
recorrente de **ambiente**, não só de build.

### 4.7 Distribuição em pacote portátil

| Fato | Consequência |
| --- | --- |
| `desktop/package.json`: `win.target = "nsis"` | Instalador, **não** portátil |
| Não há target `portable` | "Pacote portátil" **não existe** hoje |
| `extraResources` inclui o `.exe` do Runtime | Runtime está previsto no pacote |
| `extraResources` **não inclui Python** | Worker não é distribuído |
| Shell atual é Electron 31; Tauri não está no repositório | ARQ-1 hoje é "Electron + sidecar Rust"; a versão "Tauri + processo principal" é hipótese |
| WebView2 (se Tauri) depende de runtime do sistema ou bootstrapper | Conflito direto com "portátil" e com local-first offline |

Este é o eixo em que o estudo foi mais otimista sem dizer: chamou de "trabalho
real" o empacotamento, mas não registrou que **nada disso está implementado** e
que a combinação "portátil + offline + três runtimes + WebView2" tem restrições
que se contradizem.

---

## 5. Riscos que o estudo subestimou

| # | Risco | Severidade | Evidência |
| --- | --- | --- | --- |
| R1 | Windows fora do CI e do smoke empacotado | **Alta** | workflows + smoke que recusa `win32` |
| R2 | Encerramento gracioso depende de `SIGTERM`, que o Windows não entrega | **Alta** | `worker.py:117` |
| R3 | `valid_module_id` escrito, testado e **não usado**; `:` aceito no envelope | **Média-alta** | `security.rs:6`, `envelope.rs:56-72` |
| R4 | "Fila implementada" sem CI; caminho documentado falha sem `search_path` | **Média** | 14 falhas → 14 passes só após `ALTER DATABASE` |
| R5 | Supervisão de processos e reinício do Runtime não existem | **Média** | busca textual: nenhum spawn de `worker.py` |
| R6 | Resposta JSON infla bytes 4,01×; sem limite de resposta | **Média** | medido 16.428 B para 4 KB |
| R7 | Empacotamento portátil inexistente; Python fora do pacote | **Alta** | `desktop/package.json` |
| R8 | Justificativa principal do estudo mede topologia que ARQ-1 não usa | **Média** | 110,9 ns WASM × 154,8 µs processo |
| R9 | Benchmarks sem percentis, sem CPU registrada, com dataset ausente | **Média** | §2.1–2.3 |
| R10 | Estimativas de memória do Host erradas por 10× (contra a recomendação) | **Baixa** | 1,03 MB medido |

---

## 6. Veredicto sobre a ARQ-1

**A ARQ-1 continua válida — com ajustes obrigatórios. Não deve ser
reconsiderada.**

O que a auditoria **confirmou**:

- o transporte existe, é testado no lado Core (12/12) e no lado Rust (3/3), e é
  integrado ao app;
- a fronteira de permissão funciona e falha fechado;
- a fila funciona (14/14) quando configurada;
- o custo real de atravessar processo é **154,8 µs p50** — quatro ordens acima
  dos 15 ns de um despacho no webview, o que sustenta a separação de núcleos e a
  recusa do host único para orquestração de UI;
- o Host Rust é **barato** (1 MB ocioso, 4,8 ms cold) — mais barato do que o
  estudo supôs.

O que a auditoria **refutou**:

- o uso dos 22,1/110,9 ns como argumento central (topologia errada, valores não
  reproduzidos);
- "Rust 1,8× Node" e "Rust 1,34× mais rápido em JSON" (não reproduzidos);
- "2,4 µs por evento" como valor único (faixa real 2,4–9,5 µs).

O que a auditoria **acrescentou como bloqueio de maturidade**: nada em Windows foi
verificado, e dois defeitos reais (`SIGTERM`, `C:`/prefixo) moram exatamente ali.

### Ajustes exigidos antes de a ARQ-1 virar ADR

1. **Trocar a justificativa central.** O número que decide é 154,8 µs de ida e
   volta de processo (medido), não 110,9 ns de WASM (microbenchmark de topologia
   diferente). O texto deve dizer isso explicitamente.
2. **Windows como requisito de primeira classe:** job de CI em `windows-latest`
   para `cargo test` + testes JS do transporte, e um smoke empacotado que não
   recuse `win32`.
3. **Encerramento portátil:** definir o mecanismo de parada do worker em Windows
   (fechar stdin / Job Object) antes de prometer "graceful shutdown".
4. **Usar ou remover `valid_module_id`:** chamá-la na validação do envelope, ou
   rejeitar `:` explicitamente. Não pode ficar escrita e inerte.
5. **Corrigir as estimativas:** Host 1 MB (medido), cold 4,8 ms (medido), faixa
   de evento 2,4–8,7 µs (medido), e marcar o resto como E sem exceção.
6. **Declarar o estado real do empacotamento:** NSIS hoje, portátil inexistente,
   Python fora do pacote; e o que muda se o shell for Electron (sidecar) ou Tauri
   (processo principal + WebView2).
7. **Fila no CI:** os 14 testes precisam de workflow com Postgres e do
   `search_path` documentado — senão "✅ implementado" continua sendo fé.

Nenhum desses ajustes muda a escolha entre ARQ-1 e as outras três. ARQ-2 continua
pagando pedágio onde a medição manda não pagar; ARQ-3 continua comprando
infraestrutura sem demanda; ARQ-4 continua trocando isolamento por conveniência de
build.

---

## 7. O que esta auditoria não conseguiu verificar

Declarado para não virar confiança falsa:

1. Todo o comportamento em **Windows** (10 e 11): nenhuma execução.
2. Memória e boot de **webview** (Electron ou WebView2).
3. Custo de **spawn de worker Python** com dependências de IA.
4. **Pacote portátil** e smoke ponta-a-ponta fora do Linux.
5. **C ABI / C++** — não há código para medir; D4 segue sem base empírica.
6. **Vazão** da fila sob N workers concorrentes (só correção foi exercitada).
7. Benchmarks de **rota e boot do harness** (exigem navegador).

---

## 8. Próximo passo recomendado

Antes de qualquer ADR: fechar os sete itens da §6.1, sendo os itens 1–5
documentais ou de correção pontual, e 6–7 dependentes de trabalho de
empacotamento/CI — que **não** é Etapa A e **não** implementa V2.

Se o operador quiser aprovar sem esperar, a aprovação deve ser explícita nas
condições: "ARQ-1 aprovada como direção, com Windows e empacotamento portátil como
requisitos abertos e verificáveis antes da Etapa B".

A separação entre o que trava a assinatura e o que pertence à implementação está
detalhada em [`plano-prontidao-arq1.md`](./plano-prontidao-arq1.md), com critérios
verificáveis por ajuste e portões P0–P5. Este parágrafo e aquele documento dizem a
mesma coisa em níveis diferentes; nenhum dos dois aprova decisão.

**Executado em 2026-11-24.** P0 foi fechado documentalmente; D5, D6 e D7 viraram
os ADR-007, 008 e 009. Dos sete ajustes da §6.1, os **itens 1 e 5** — justificativa
medida e estimativas corrigidas — foram fechados como redação em **P0** (C-A1 e
C-A5); os **itens 2, 3, 4, 6 e 7** — Windows, encerramento portátil,
`valid_module_id`, empacotamento e fila no CI — permanecem como condições de
implementação em **P1–P5**, cada um no portão em que vence. Nada aqui foi
declarado pronto por ter virado ADR.

---

## 9. Anexo — comandos e saídas brutas

```text
# ambiente
node --version                 → v22.23.2
rustc --version                → 1.98.1
python3 --version              → 3.12.13
# alvo wasm instalado manualmente (mirror configurado devolvia 404):
curl -sL -o wasm-std.tar.xz \
  https://static.rust-lang.org/dist/2026-09-03/rust-std-1.98.1-wasm32-unknown-unknown.tar.xz
tar -xf wasm-std.tar.xz && cp -a rust-std-*/rust-std-wasm32-unknown-unknown/lib/rustlib/wasm32-unknown-unknown \
  "$(rustc --print sysroot)/lib/rustlib/"

# benchmarks
cd v2/bench/rust-wasm && cargo build --release --target wasm32-unknown-unknown
node v2/bench/fronteira-wasm.mjs          # 3 execuções
node v2/bench/core-js.mjs                 # 3 execuções
bash v2/bench/workers/comparar.sh ../../../scripts/arma3/out/arma3-animacoes.json

# protótipos
cargo test --manifest-path v2/runtime/Cargo.toml     # 12 + 3 testes, ok
node --test test/v2/runtime-stdio.test.js           # 12/12, ok
python3 -c "import pgserver; pgserver.get_server('/tmp/pgdata', cleanup_mode=None)"
psql "$DSN" -f v2/data/migrations/001_fundacao.sql
python3 -m pytest v2/services/tarefas -q            # 14 falhas → 14 passes após ALTER DATABASE ... search_path

# medição própria da fronteira de processo (4 KB, stdio real)
{ "cold_ms_spawn_e_autorizar": 4.8, "status": "authorized", "bytes": 4096,
  "n": 500, "us_p50": 154.8, "us_p95": 274.4, "us_min": 133.8, "us_max": 985,
  "rss_kb": 1052 }

# inflação de payload
{ "resposta_bytes": 16428, "arquivo_bytes": 4096, "razao": 4.01 }
```

Nenhum arquivo do repositório foi modificado por esta auditoria; os artefatos de
build gerados (`target/`) são ignorados pelo `.gitignore`.

---

## 10. Referências

- Auditado: [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md)
- Contexto: [`arquitetura-alvo.md`](./arquitetura-alvo.md) · [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md)
- Benchmarks: [`v2/bench/RESULTADOS.md`](../../../v2/bench/RESULTADOS.md) · `v2/bench/fronteira-wasm.mjs` · `v2/bench/core-js.mjs` · `v2/bench/workers/comparar.sh`
- Protótipos: `v2/core/runtime-stdio.js` · `v2/core/runtime-transport.js` · `v2/runtime/src/{main,protocol,envelope,host,security}.rs` · `v2/data/migrations/001_fundacao.sql` · `v2/services/tarefas/worker.py`
- Integração: `desktop/src/{runtime,ipc}.js` · `desktop/package.json` · `scripts/v2-packaged-runtime-smoke.mjs`
- CI: `.github/workflows/{v2-runtime,v2-core,v2-validation,v2-runtime-e2e,v2-desktop-packaged-runtime,desktop-release}.yml`
- Decisões: [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) · [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) · [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md)
