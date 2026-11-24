# Plano de prontidão — aprovação da ARQ-1 e critérios da V2

> **Status:** ✅ **executado em 2026-11-24** — D5, D6 e D7 foram aprovados
> explicitamente pelo operador e registrados nos
> [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md),
> [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) e
> [ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md). P0 foi fechado com
> a criação dos três ADRs; **P1–P5 continuam obrigatórios** nas respectivas etapas.
> Este documento permanece como registro dos critérios e portões que sustentaram a
> aprovação — não aprova nada por si.
>
> **Base:** [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md)
> (os sete ajustes vêm dela, com as mesmas evidências) e
> [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md) (a recomendação
> ARQ-1). Este documento não os substitui: ele diz **o que falta para assinar** e
> **o que pode esperar a implementação**.

---

## 0. Escopo e vocabulário

### 0.1 O que este documento é e o que não é

É um plano de decisão: para cada achado da auditoria, diz se ele impede a
aprovação de D5/D6/D7 ou apenas a implementação da capacidade correspondente, e
qual evidência objetiva encerra o assunto.

Não é: um plano de execução, uma promessa de prazo, um conjunto de ADRs
disfarçados, nem uma licença para começar a Etapa A. Nada aqui autoriza código.

### 0.2 Três significados de "bloqueia"

A palavra é usada em três sentidos distintos, e misturá-los é o que faz uma
equipe aprovar arquitetura e depois descobrir que não consegue entregar:

| Bloqueio | Significado | Quem resolve |
| --- | --- | --- |
| **B1 — bloqueia o registro** | O texto da decisão estaria errado, incompleto ou prometendo o que não se sabe. Assinar assim contamina o ADR. | Documentação |
| **B2 — bloqueia a implementação** | A decisão pode ser tomada, mas a capacidade não pode ser construída nem entregue antes da correção. | Código, CI, empacotamento |
| **B3 — bloqueia a promessa** | Nem decisão nem código: bloqueia *comunicar* algo como pronto (por exemplo "pacote portátil", "suporte a Windows"). | Produto |

Um item **B2** ou **B3** nunca deve travar D5/D6/D7 — se travar, a decisão
arquitetural está refém de trabalho que ela mesma deveria orientar. Um item
**B1** deve travar: significa que o registro ainda não está correto.

---

## 1. Os sete ajustes da auditoria

Os ajustes mantêm a numeração da auditoria (§6). Cada um traz problema,
evidência, impacto, severidade, critério de aceitação, validação, dependências e
classificação de bloqueio.

### 1.1 Ajuste 1 — Trocar a justificativa central

**Problema.** O estudo usa 22,1 ns × 110,9 ns como argumento principal de D5. É
um microbenchmark JS × WASM **dentro do webview**, topologia que nenhuma das
arquiteturas propostas utiliza: em ARQ-1 e ARQ-2 o Host é processo, não WASM. A
conclusão está certa; a prova citada não prova isso.

**Evidência.** Auditoria §2.1 (evidência **E1**, PARCIALMENTE CONFIRMADA — razão
reproduzida em 4,61–5,15×, valores absolutos ~30% menores) e a medição de
processo real: **154,8 µs p50 / 274,4 µs p95** por ida e volta, 4,8 ms cold
(**E17**, CONFIRMADA). Arquivos: `v2/bench/fronteira-wasm.mjs`,
`v2/bench/rust-wasm/src/lib.rs`.

**Impacto arquitetural.** D5 decide onde fica a orquestração. Se ela fica no
webview, o argumento é latência de evento; se fica em processo, é latência de
travessia. São quatro ordens de grandeza de diferença e o desenho de D6/D7 herda
essa escolha.

**Severidade.** Média (R8), com efeito alto sobre a credibilidade do registro: um
ADR que cita a topologia errada é contestável por qualquer leitor futuro.

**Critério objetivo de aceitação.** O texto da decisão cita a medição de processo
(154,8 µs p50, com comando, arquivo e ambiente) como base da separação de núcleos;
o microbenchmark WASM aparece apenas como registro histórico, rotulado como
topologia diferente, sem função de prova.

**Como validar.** Ler o parágrafo de justificativa do ADR e conferir que ele
nomeia a medição de processo; buscar no documento os valores 22,1/110,9 ns e
verificar que estão marcados como comparativo intra-webview; conferir que a
tabela de evidências do ADR aponta para a auditoria (§2.1 e §4.3).

**Dependências.** Nenhuma decisão pendente. Depende de D5 ser redigido.

**Bloqueio.** **B1** — bloqueia o registro de D5 (e a fundamentação de D6/D7 que
o citar). Não bloqueia a escolha em si.

---

### 1.2 Ajuste 2 — Windows como requisito de primeira classe

**Problema.** Nenhum teste V2 roda em Windows. O único smoke ponta-a-ponta do
pacote **recusa** `win32` por construção. Windows é um dos alvos de distribuição
declarados e é justamente o que não tem verificação.

**Evidência.** Auditoria §4.1 e R1 (Alta): `v2-core.yml`, `v2-runtime.yml`,
`v2-runtime-e2e.yml`, `v2-desktop-packaged-runtime.yml` e `v2-validation.yml`
usam `runs-on: ubuntu-latest`; `desktop-release.yml` tem matriz com
`windows-latest` mas só **compila**; `scripts/v2-packaged-runtime-smoke.mjs:29`
lança erro quando `process.platform === 'win32'`. Evidência **E20**
(INSUFICIENTE / NÃO COBERTO).

**Impacto arquitetural.** ARQ-1 é uma arquitetura de **processos**; o
comportamento de processo é onde Windows mais diverge (sinais, órfãos, caminhos,
console). Sem cobertura, a decisão de D6 (Python em processo supervisionado) é
uma aposta não testada no sistema operacional de destino.

**Severidade.** Alta (R1).

**Critério objetivo de aceitação.** Existe job em `windows-latest` que executa,
no mínimo, `cargo test` do Runtime e os testes JS do transporte stdio, com saída
que comprove a contagem de testes executados (não apenas "verde") — C-A2a; e o
smoke empacotado deixa de lançar por `win32`, executando o ciclo autorizar → ler em
Windows — C-A2b.

**Como validar.** Abrir o log do job e conferir a contagem de testes executados e
o caminho do binário usado (`baluarte-runtime.exe`); executar o smoke em Windows
e verificar que ele falha quando o binário é removido do pacote (prova negativa).

**Dependências.** D10 (plataformas suportadas) ainda 🟡. Se Windows sair do
escopo inicial, o ajuste vira "declarar a ausência" em vez de "cobrir".

**Bloqueio.** **B2** para entrega em Windows; **B3** para qualquer comunicação de
"suporte a Windows". Não bloqueia D5/D6/D7: a forma do Host não muda por causa da
cobertura.

---

### 1.3 Ajuste 3 — Encerramento portátil

**Problema.** O desligamento gracioso do worker Python depende de `SIGTERM`, que
o Windows **não entrega**: `TerminateProcess` mata sem executar handler. A tarefa
em `RUNNING` fica órfã até o lease vencer e a reaper devolvê-la.

**Evidência.** Auditoria §4.1(a) e R2 (Alta): `v2/services/tarefas/worker.py`
instala handlers para `SIGTERM`/`SIGINT` em `instalar_sinais()`;
`recuperar_tarefas_vencidas()` na migração é a única rede de segurança.

**Impacto arquitetural.** D6 coloca Python em processo supervisionado. Supervisionar
significa **parar** também, não só iniciar. Se a parada não é portátil, o contrato
"worker encerra limpo" não é verdadeiro em toda plataforma — e o supervisor
precisa saber disso antes de ser desenhado.

**Severidade.** Alta (R2).

**Critério objetivo de aceitação.** Existe um mecanismo de parada que o worker
obedece em Windows e em Linux (por exemplo: EOF em stdin, evento nomeado ou Job
Object), documentado no contrato do worker; e um teste que prova que, ao fechar o
app, não sobra processo do worker e a tarefa em execução volta à fila antes do
vencimento do lease.

**Como validar.** Teste automatizado que inicia o worker, reivindica uma tarefa,
sinaliza parada pelo mecanismo novo e verifica: (a) processo ausente após o
término; (b) tarefa em `QUEUED` com `tentativas` coerente; (c) em Windows, o mesmo
teste passa. A prova negativa: remover o mecanismo novo e verificar que o teste
falha (órfão ou lease vencido).

**Dependências.** O1 (Windows em CI) para executar a prova lá; D6 para o contrato
de supervisão.

**Bloqueio.** **B2** — bloqueia implementar supervisor e prometer "graceful
shutdown". Não bloqueia a escolha de D6: o mecanismo de parada é detalhe de
implementação, não de arquitetura.

---

### 1.4 Ajuste 4 — Usar ou remover `valid_module_id`

**Problema.** Existe uma guarda de identificador de módulo escrita, testada e
**nunca chamada**. Quem valida de verdade aceita `:`. Em Windows, `PathBuf::push`
com caminho que tem prefixo mas não raiz (por exemplo `C:x`) **substitui** o
caminho base — o módulo sairia da raiz confiável. Além disso, `:` habilita fluxo
alternativo de arquivo (`arquivo.txt:stream`), que é uma classe de escrita
inesperada.

**Evidência.** Auditoria §4.1(b) e R3 (Média-alta): `v2/runtime/src/security.rs`
define `valid_module_id` (rejeita `/`, `\`, `.`, `..`, NUL e tudo fora de
`[A-Za-z0-9_-]`), usada apenas pelo próprio módulo de teste; `envelope.rs`
(`validate`) rejeita `.`, `..`, `/`, `\`, NUL e **aceita `:`**.

**Impacto arquitetural.** A validação do envelope é parte do contrato de D7. Se D7
ratificar o envelope v1 como contrato, ratifica junto uma superfície de caminho
que falha aberto em Windows — exatamente o que o ADR-002 existe para impedir.

**Severidade.** Média-alta (R3).

**Critério objetivo de aceitação.** Ou `valid_module_id` é chamada no caminho de
validação do envelope, ou é removida e substituída por uma checagem equivalente
com teste próprio; em qualquer caso, `:`, `C:x`, `C:\x`, `..\x` e NUL são
rejeitados com erro estável e testado.

**Como validar.** Teste unitário que passa cada um desses identificadores e exige
`Err`; busca textual provando que a função de validação é chamada fora dos testes;
execução em Windows do mesmo conjunto (a diferença de `PathBuf::push` só aparece
lá).

**Dependências.** Nenhuma. É correção localizada e independente de decisão.

**Bloqueio.** **B2** para usar o Runtime como está; **B1 parcial** para D7 **se** o
envelope v1 for ratificado como contrato na mesma decisão. Não bloqueia a escolha
do mecanismo de comunicação.

---

### 1.5 Ajuste 5 — Corrigir as estimativas

**Problema.** O estudo estimou 10–30 MB para o Host Rust; mediu-se **1,03 MB**.
Estimou 5–30 ms de subida; mediu-se **4,8 ms** cold. O custo de evento foi citado
como 2,4 µs; a reprodução dá **8,6–8,7 µs**. Os três erros vão na direção de
**piorar** a recomendação, mas número errado em documento de decisão é dívida.

**Evidência.** Auditoria **E15** (NÃO REPRODUZIDA, favorável), **E16**
(PARCIALMENTE CONFIRMADA), **E3** (NÃO REPRODUZIDA) e R10 (Baixa). Ressalva
adicional: o repositório tem **três** valores para custo de evento (2,4 / 8,7 /
9,46 µs) e nenhum traz modelo de CPU — o texto deve citar faixa, não ponto.

**Impacto arquitetural.** Memória e startup do Host sustentam o argumento de que
"dois núcleos cabem em app de desktop". Com 1 MB, o argumento fica mais forte; com
número errado, fica frágil sob auditoria.

**Severidade.** Baixa (R10), alta visibilidade.

**Critério objetivo de aceitação.** Todo número do texto de decisão tem origem
rastreável — **M** com arquivo, comando e ambiente; **D** com a derivação; **E**
marcado como estimativa — e nenhum valor absoluto aparece sem faixa quando as
execuções divergem.

**Como validar.** Percorrer a tabela de evidências do ADR e confrontar cada valor
com o anexo de comandos da auditoria (§9); buscar por unidades (`ns`, `µs`, `ms`,
`MB`) e conferir que nenhuma ocorrência está órfã de fonte.

**Dependências.** Nenhuma.

**Bloqueio.** **B1** — bloqueia o registro. Não bloqueia decisão nem implementação.

---

### 1.6 Ajuste 6 — Declarar o estado real do empacotamento

**Problema.** O estudo trata empacotamento como "trabalho real" sem registrar que
**nada disso existe**: o alvo Windows é `nsis` (instalador), não há target
portátil, o worker Python não entra no pacote e a forma do Host depende de um
shell que ainda é conflito aberto (C4/D13). A frase "Host Rust como processo
principal" pressupõe um shell — com Electron, o Host é sidecar.

**Evidência.** Auditoria §4.7 e R7 (Alta): `desktop/package.json` —
`win.target = "nsis"`, sem `portable`; `extraResources` leva `dist`,
`runtime-stdio.js` e `baluarte-runtime[.exe]`, **sem Python**; Electron 31 é o
shell atual; Tauri não está no repositório.

**Impacto arquitetural.** D6 é sobre **forma** (processo, biblioteca, mistura).
"Processo principal" é forma **relativa ao shell**. Se D13 escolher Electron, a
frase fica falsa sem que a arquitetura esteja errada — o que é pior: erro de
redação que parece erro de arquitetura.

**Severidade.** Alta (R7).

**Critério objetivo de aceitação.** Duas coisas: (a) o texto de decisão descreve
o Host como **processo privilegiado**, neutro quanto ao shell, e remete a forma
(principal × sidecar) a D13; (b) o estado do empacotamento está escrito com todas
as letras — NSIS hoje, portátil inexistente, Python fora do pacote, e o que muda
em Electron × Tauri.

**Como validar.** Buscar "portátil", "pacote" e "processo principal" no texto e
confrontar cada ocorrência com `desktop/package.json` e com a §17 (C4) do
canônico; conferir que nenhuma promessa de distribuição aparece sem dependência
nomeada.

**Dependências.** D13 (shell) e D9 (empacotamento) seguem 🟡/⛔; a redação neutra
é justamente o que permite decidir D6 sem esperar por elas.

**Bloqueio.** **B1** para a parte (a) — sem ela o ADR de D6 afirma algo que pode
ser falso. **B2/B3** para a parte (b) e para a distribuição.

---

### 1.7 Ajuste 7 — Fila no CI

**Problema.** A fila Postgres é apresentada como "✅ já implementado", mas os 14
testes nunca rodaram em automação e o caminho documentado **falha** contra banco
recém-migrado: a migração faz `SET search_path` dentro da própria transação (volta
atrás no `COMMIT`) e a função `reivindicar_tarefa` referencia `tarefa` sem
qualificar. Depende, portanto, do `search_path` de **quem chama**.

**Evidência.** Auditoria §3.3 e R4 (Média): 14 falhas com `UndefinedTable` →
14 passes após `ALTER DATABASE ... SET search_path`; nenhum workflow referencia
`BALUARTE_TEST_DSN` ou `pytest` (**E13** CONFIRMADA com ressalva, **E14**
PARCIALMENTE CONFIRMADA). Arquivos: `v2/data/migrations/001_fundacao.sql`
(linhas 18–22, 177–200, 218), `v2/services/tarefas/test_worker.py`.

**Impacto arquitetural.** D7 usa a fila como caminho longo do Python. Um contrato
cujo teste não roda em automação não sustenta decisão; e a dependência implícita
de `search_path` é o tipo de acoplamento que quebra na primeira mudança de
credencial ou de banco.

**Severidade.** Média (R4).

**Critério objetivo de aceitação.** Workflow que sobe Postgres, aplica a migração
como um consumidor faria (sem `ALTER DATABASE` mágico, ou com ele documentado e
aplicado pelo próprio script), roda os 14 testes e falha se **zero** testes forem
executados. A dependência de `search_path` está escrita ou eliminada por
qualificação dentro das funções.

**Como validar.** Verde no CI com contagem de testes no log; prova negativa
(renomear a tabela `tarefa` derruba o job); execução do mesmo workflow contra banco
limpo, sem intervenção manual.

**Dependências.** D8 (engine de persistência) está ⛔. Se D8 mudar a engine, este
ajuste precisa ser reescrito — a fila é mecanismo de D7, a engine é D8.

**Bloqueio.** **B2** para a implementação baseada na fila; **B1 parcial** para D7
**se** a decisão citar "14 testes" como evidência de maturidade. Não bloqueia o
mecanismo em si.

---

### 1.8 Quadro-resumo dos ajustes

| # | Ajuste | Severidade | Bloqueia | Encerra com |
| --- | --- | --- | --- | --- |
| A1 | Justificativa central (154,8 µs, não 110,9 ns) | Média (R8) | **B1** D5/D6/D7 | Redação corrigida + evidência rastreável |
| A2 | Windows no CI e no smoke empacotado | Alta (R1) | **B2/B3** | Job `windows-latest` + smoke sem recusa |
| A3 | Encerramento portátil | Alta (R2) | **B2** | Mecanismo não-sinal + teste de órfão |
| A4 | `valid_module_id` usada ou removida | Média-alta (R3) | **B2** (+B1 se D7 ratificar envelope) | Rejeição de `:` testada |
| A5 | Estimativas corrigidas | Baixa (R10) | **B1** | Números com fonte e faixa |
| A6 | Estado real do empacotamento | Alta (R7) | **B1** (redação) + **B2/B3** | Host neutro ao shell + inventário honesto |
| A7 | Fila no CI | Média (R4) | **B2** (+B1 se citada como prova) | Workflow + contagem + prova negativa |

**Consequência direta:** quatro ajustes são **B1** (A1, A5, A6a, A7-condicional) e
podem ser fechados **antes** da aprovação, só com redação. Quatro são **B2**
(A2, A3, A4, A6b, A7) e pertencem à implementação. Nenhum dos sete exige mudar a
escolha entre ARQ-1 e as outras três.

---

## 2. Aprovação arquitetural × prontidão operacional

São dois atos diferentes, com donos, insumos e critérios diferentes. Confundi-los
produz dois erros simétricos: aprovar arquitetura para "destravar" e aprovar
depois descobrir que o alicerce não fecha; ou segurar a arquitetura até que a
última CI fique verde, e construir no escuro enquanto isso.

### 2.1 Lista A — aprovação arquitetural

Aprovar arquitetura é escolher **forma e responsabilidade**. É reversível com
custo baixo no papel e custo alto no código — por isso é feita antes.

| # | Item | O que exatamente se aprova | O que **não** se aprova junto |
| --- | --- | --- | --- |
| A-D5 | Consolidação dos núcleos | Dois núcleos com nomes e escopos exclusivos — Core de Orquestração TypeScript (Core de UI no canônico) e Runtime/Host Rust —, tabela de propriedade com exclusivas e compartilhadas (§4.2.1) e proibição de decisão duplicada | Que a fusão em host único seja rejeitada para sempre; que a tabela esteja completa |
| A-D6 | Forma dos componentes | Módulos in-process; Python em processo separado; C++ como biblioteca isolada **se** D4 provar ganho; Host como processo privilegiado; supervisão e distribuição do Python declaradas como **capacidades a construir** | Que o Host seja processo principal do SO (isso é D13); que C++ entre no build; que exista supervisor hoje |
| A-D7 | Mecanismo de comunicação | Comunicação por fronteira: IPC nativo do shell que D13 escolher, com allowlist (TS↔Host); stdio JSON-lines para chamada curta (Host↔Python); fila durável com idempotência, lease e retry para trabalho longo; C ABI condicionada (C++); API/eventos in-process (módulos) | Que o envelope v1 esteja congelado; que a fila seja Postgres (isso é D8); que Protobuf ou socket nunca entrem; que o IPC seja o de um shell específico |
| A-RESP | Responsabilidades de cada núcleo | A tabela §4.2.1: exclusivas de cada núcleo e compartilhadas com dono único de decisão e cópia descartável do outro lado | A implementação da tabela; a política de permissões (já é ADR-002) |
| A-FRONT | Fronteiras de comunicação | As seis fronteiras da §4.3 do estudo e as garantias mínimas de contrato (versão, id, prazo, cancelamento, limite de bytes em requisição e resposta, erro com código estável) | O formato binário definitivo; a biblioteca de serialização; a engine da fila |

**Regra de aprovação:** cada linha acima se considera aprovada quando o ADR
correspondente contém a escolha, as alternativas descartadas com o motivo, as
consequências e a data. **Cumprida em 2026-11-24:** A-D5 → ADR-007; A-D6 →
ADR-008; A-D7, A-RESP e A-FRONT → ADR-009 (com a tabela de A-D5 como anexo
normativo).

### 2.2 Lista B — prontidão operacional

Prontidão operacional é **provar que a forma escolhida funciona na plataforma de
destino**. É reversível com custo alto — por isso não deve anteceder a decisão.

| # | Item | Por que **não** bloqueia D5/D6/D7 | Depende de |
| --- | --- | --- | --- |
| O1 | Compatibilidade Windows 10/11 x64 | É cobertura de teste de uma forma já escolhida, não escolha de forma | D10 (plataformas) 🟡; A2 |
| O2 | Segurança de caminhos e módulos | Corrige implementação de guarda já prevista no desenho (ADR-002); a fronteira continua a mesma | A4 |
| O3 | Supervisor e recuperação de processos | É peça **a construir** sob D6; o contrato de supervisão pode ser redigido antes do código | D6 aprovado; O5 |
| O4 | Distribuição do worker Python | É consequência de D6 (Python em processo) + D9 (pacote); não muda a forma | D9, D2 |
| O5 | Encerramento gracioso multiplataforma | Mecanismo de parada é detalhe do contrato de supervisão | A3, O1 |
| O6 | Testes automatizados da fila | Prova a maturidade do caminho longo de D7; não escolhe o mecanismo | A7; D8 se a engine mudar |
| O7 | Empacotamento e execução offline | É entrega de distribuição; D9/D13 a definem | D9, D13 ⛔/🟡, D8 |

Note o que **não** está nesta lista: cobertura de Windows para o *Core de UI*
(webview) e medição de memória do webview. São reais, mas pertencem a D10/D13 —
entram na prontidão do shell, não da fronteira Core↔Host.

### 2.3 A linha entre as duas listas

O critério não é "é importante?" — quase tudo é. O critério é: **a resposta muda
a forma?**

| Pergunta | Lista | Exemplo |
| --- | --- | --- |
| Se a resposta for "não", alguma peça muda de lugar, de linguagem ou de processo? | **A** | "Python é processo ou biblioteca?" muda D6 |
| A resposta altera contrato entre duas peças? | **A** | "Envelope tem `id` e cancelamento?" muda D7 |
| A resposta só prova que a peça escolhida funciona na plataforma? | **B** | "O worker para limpo em Windows?" |
| A resposta só prova que o pacote chega ao usuário? | **B** | "Existe build portátil?" |

Duas observações que a auditoria deixa explícitas e que mudam a fronteira:

1. **O supervisor não existe.** Nem em lista A nem em B ele está "feito" — está
   *prescrito* por D6 e *não implementado* (auditoria §3.4, R5). Aprovar D6 sem
   dizer isso transformaria uma peça inexistente em promessa.
2. **"Portátil" não é decisão de arquitetura, é promessa de produto.** Enquanto
   D9 e D13 estiverem abertos, nenhum ADR de D5/D6/D7 pode afirmar distribuição
   portátil — no máximo pode declarar que a forma escolhida é compatível com ela,
   com as restrições conhecidas (WebView2 do sistema no caso Tauri; runtime
   embarcado no caso Electron).

---

## 3. Critérios de aceitação

Todos os critérios abaixo são verificáveis por inspeção de artefato ou por
execução. Onde não existe medição, o critério é **produzir a medição** — nunca um
número escolhido no papel.

### 3.1 Critérios dos ajustes (fecham o registro)

| # | Critério verificável | Artefato de prova | Medição necessária |
| --- | --- | --- | --- |
| C-A1 | Justificativa de D5 cita 154,8 µs p50 **com comando, arquivo e ambiente**; microbenchmark rotulado como intra-webview | Texto do ADR + anexo de comandos da auditoria §9 | Já existe (auditoria §4.3) |
| C-A2a | Job mínimo em Windows executa `cargo test` do Runtime e os testes JS do transporte, com contagem de testes no log | Log do workflow | Contagem de testes executados em Windows (nova) |
| C-A2b | Smoke do pacote roda em `win32` e falha quando o binário é removido do pacote | Saída do smoke (positiva e negativa) | Nenhuma |
| C-A3 | Teste prova: sem processo órfão após fechar o app **e** tarefa devolvida à fila antes do lease vencer, em Linux **e** Windows | Teste automatizado + log | Tempo de retorno à fila em Windows (nova) |
| C-A4 | `:` , `C:x`, `C:\x`, `..\x`, NUL rejeitados por teste; função de validação chamada fora dos testes | Teste unitário + busca textual | Nenhuma |
| C-A5 | Todo número do ADR tem origem M/D/E; absolutos com variação aparecem como faixa | Tabela de evidências do ADR | Nenhuma |
| C-A6 | Host descrito como processo privilegiado, forma remetida a D13; inventário de empacotamento sem omissão | Texto do ADR + `desktop/package.json` | Nenhuma |
| C-A7 | Workflow com Postgres aplica migração, roda 14 testes e falha com zero testes; `search_path` documentado ou dispensado por qualificação | Log do CI + migração | Nenhuma (comportamental) |

### 3.2 Critérios dos itens operacionais (fecham a capacidade)

| # | Critério verificável | Só é "pronto" quando | Medição necessária |
| --- | --- | --- | --- |
| C-O1 | Windows 10 e 11: suíte V2 verde, smoke do pacote verde, e um ciclo real do app (abrir, usar, fechar) sem órfão | Ambos os sistemas listados, não apenas o runner | Sim — baseline de boot e memória em Windows |
| C-O2 | Nenhum identificador de módulo escapa da raiz; teste adversarial (prefixo de unidade, ADS, `..`) falha fechado | Bateria de casos hostis em CI, em Windows e Linux | Nenhuma |
| C-O3 | Supervisor inicia, detecta queda, reinicia com teto e registra o motivo; não deixa órfão ao sair | Teste que mata o filho e verifica reinício e registro | Sim — custo de reinício e número de tentativas até desistir (política do operador) |
| C-O4 | Worker Python instalado e executável a partir do pacote, sem Python do sistema | Instalação em máquina limpa, sem toolchain | Sim — tamanho do pacote e custo de primeira execução |
| C-O5 | Parada limpa em Windows e Linux pelo mecanismo definido, sem sinal | Teste C-A3 estendido ao app empacotado | Tempo de parada por plataforma |
| C-O6 | Fila sob N workers concorrentes: nenhuma tarefa reivindicada duas vezes, nenhuma presa em `RUNNING` | Teste de concorrência em CI | Sim — vazão com N fixado pelo operador |
| C-O7 | Pacote offline executa o fluxo principal sem rede; instalação/execução em máquina sem toolchain | Checklist em máquina limpa + prova sem rede | Sim — tamanho final e dependências de runtime do sistema |

### 3.3 Medições que faltam — e que não podem virar número inventado

Nenhum critério acima usa limiar arbitrário. Onde há limiar, ele é **derivado de
baseline medido** e registrado antes da comparação. O que hoje falta medir:

| # | Medição | Serve para | Por que não pode ser estimada |
| --- | --- | --- | --- |
| M1 | Boot e memória em Windows (app + Host + worker) | C-O1 | Diferença de plataforma é justamente o que se quer medir |
| M2 | Custo de parada e retorno à fila em Windows | C-A3, C-O5 | Depende de mecanismo que ainda não existe |
| M3 | Spawn de worker Python com dependências de IA | C-O4, C-O7 | Sem dependências instaladas, qualquer número é chute |
| M4 | Vazão da fila com N workers | C-O6 | Só correção foi exercitada; concorrência real não |
| M5 | Memória e boot do webview (Electron × WebView2) | D10/D13, prontidão do shell | Exige build e display |
| M6 | Custo de travessia UI↔Host com o app real | critério de falsificação 1 de D5 | O número de processo (154,8 µs) não inclui IPC do shell |

Regra: **M1–M6 entram no ADR como dívida nomeada**, não como estimativa. Todo ADR
de D5/D6/D7 carrega o anexo **“Dívidas de medição”** com estas seis linhas, o
critério que cada uma fecha e o portão em que ela vence — sem resultado
antecipado. Se o operador quiser aprovar antes, aprova sabendo que a decisão
repousa em medição de Linux e em leitura de código para Windows.

### 3.4 Portões de prontidão

Os critérios acima não são todos devidos ao mesmo tempo. Mapeados nas etapas
propostas no canônico (§18), viram portões:

| Portão | Antes de | Critérios exigidos | Observação |
| --- | --- | --- | --- |
| **P0** | assinar D5/D6/D7 | C-A1, C-A5, C-A6(a) + anexos “Dívidas de medição” e “Capacidades a construir” | Só redação; nenhum código |
| **P1** | Etapa A (contrato vertical) | C-A4, C-O2 | Segurança de caminho vem antes da primeira chamada real |
| **P2** | Etapa B (runtime e módulos) | C-A2a, C-A3 início, C-O3 contrato escrito | O job mínimo em Windows é pré-requisito da prova de C-A3, que exige as duas plataformas |
| **P3** | Etapa C (worker Python) | C-A3, C-O5, C-O4, C-A7 | Python em processo só se para limpo e é distribuído |
| **P4** | Etapa D (C++ nativo) | D4 com benchmark vs alternativas | Sem benchmark não se cria a fronteira |
| **P5** | Distribuição / release | C-A2b, C-O1, C-O6, C-O7 | Smoke empacotado em Windows, fila concorrente, pacote offline |

P0 é o único que a aprovação exige. P1–P5 são condições de **etapa**, não de
decisão — e é isso que permite aprovar arquitetura sem parar a reconstrução.
Nenhum dos sete itens operacionais foi rebaixado a recomendação: O1 → P5, O2 → P1,
O3 → P2, O4 → P3, O5 → P3, O6 → P5, O7 → P5. Aprovar D5/D6/D7 **não** dispensa
nenhum deles; apenas desloca a cobrança da assinatura para a etapa.

### 3.5 Verificação de P0 no texto canônico e nos documentos referenciados

P0 não é uma promessa para o futuro: é conferível hoje, documento por documento.
Estado após a revisão final das minutas:

| Condição | Onde foi aplicada | Como conferir | Estado |
| --- | --- | --- | --- |
| **C-A1** — justificativa medida | Estudo: errata, §1 (tabela de fatos), §2.2, §6.1; dossier §1 | Buscar `22,1`/`110,9`: só aparece rotulado como intra-webview; a base citada é 154,8 µs p50 | ✅ atendida |
| **C-A5** — estimativas corrigidas | Estudo: errata, §1, §3.2, recursos do ARQ-1 | Buscar `10–30 MB` e `5–30 ms`: só na errata, como valor substituído; memória do Host e boot aparecem como **M** | ✅ atendida |
| **C-A6a** — Host neutro ao shell | Canônico (vocabulário e descrição do diagrama); dossier (tabela de D6, §1, §9); estudo (errata, §6.1, §6.4, recomendação de D6) | Buscar `processo principal`: só na errata, em frases que remetem a D13, ou em condicional explícito sobre um shell (“em Tauri”) | ✅ atendida |
| **Anexo “Dívidas de medição”** | Minuta de fronteiras (§4.2) + M1–M6 (§3.3) | Anexo A dos ADR-007, ADR-008 e ADR-009 | ✅ existente |
| **Anexo “Capacidades a construir”** | Minuta de D6 (§4.2) + P0 (§3.4) | Anexo B dos ADR-007, ADR-008 e ADR-009; verbo no presente ausente para supervisor e distribuição Python | ✅ existente |

Duas observações de honestidade sobre esta tabela:

1. **“Atendida” significa documentalmente atendida**, não implementada. C-A1, C-A5
   e C-A6a são condições de redação; nenhuma delas exige código, e nenhuma foi
   cumprida por código.
2. **Os anexos existem desde 2026-11-24**, porque os ADR-007/008/009 existem. A
   criação dos ADRs fechou P0; não fechou nenhum dos critérios de P1–P5.

---

## 4. Recomendação final

### 4.1 É possível aprovar D5, D6 e D7 agora?

**Sim — com quatro correções de redação, dois anexos obrigatórios e três
condicionamentos explícitos.** Nenhum dos sete ajustes da auditoria muda a escolha
entre ARQ-1 e as outras três arquiteturas; o que existe é redação a corrigir e
capacidade a construir. As correções são A1 (justificativa medida), A5
(estimativas), A6a (Host neutro ao shell) e as duas neutralidades de redação em D6
e D7; os anexos são a tabela de propriedade (§4.2.1) e a matriz de fronteiras; os
condicionamentos são D8 (engine), D13 (shell) e as capacidades a construir.

O que sustenta a aprovação, em ordem de força: a fronteira de permissão funciona e
falha fechado (testada); o transporte existe, é testado dos dois lados e está
integrado ao app; o custo de atravessar processo é medido (154,8 µs p50); o Host
é barato (1,03 MB, 4,8 ms cold); e a fila funciona quando configurada.

O que a aprovação **não** pode afirmar: que Windows está coberto, que o worker
Python é distribuído, que existe supervisor, que existe pacote portátil ou que o
envelope v1 está livre de furo de caminho. Tudo isso é implementação — e deve
estar escrito como requisito, não como conquista.

### 4.2 O que deve mudar na redação antes de assinar

Minutas **adotadas em 2026-11-24**: cada linha abaixo virou o texto de um ADR —
D5 no [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md),
D6 no [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md)
e D7/Resp./Fronteiras no
[ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md). O texto permanece aqui
como registro da redação aprovada. Cada uma foi escrita para ser auto-suficiente:
quem ler o ADR não precisa adivinhar shell, engine de persistência nem estado de
implementação.

| Decisão | Redação sugerida | Correção que embute |
| --- | --- | --- |
| **D5** | "O app tem dois núcleos nomeados. O **Core de Orquestração TypeScript** (o “Core de UI” do canônico, no webview) é dono exclusivo de rotas, estado de tela, composição da interface, orquestração de chamadas e cache derivado. O **Runtime/Host Rust** (processo privilegiado) é dono exclusivo de ciclo de vida de processo, filesystem, rede, raiz por módulo, revalidação de permissão e estado de execução/saúde. As responsabilidades compartilhadas estão na tabela de propriedade (§4.2.1), com um único dono de decisão por dado e cópia descartável do outro lado. A fusão em host único fica rejeitada para o horizonte atual, com os critérios de reabertura da §6.5 do estudo." | A1 (mede-se travessia de processo, não WASM); vocabulário do canônico; exclusivas × compartilhadas explícitas |
| **D6** | "Módulos in-process; Python em processo separado; C++ como biblioteca isolada apenas se D4 medir ganho. O Host é processo **privilegiado**; se é processo principal do sistema operacional ou sidecar é D13, e nenhuma parte deste desenho presume um shell específico nem o mecanismo IPC nativo de um shell específico. **Supervisão de processos e distribuição do worker Python são capacidades a construir**, não existentes: o ADR as declara como requisito, não como conquista." | A6a (neutro ao shell); supervisor e distribuição declarados como futuros |
| **D7** | "Comunicação definida **por fronteira**, não por tecnologia única: (a) TS↔Host pelo mecanismo IPC nativo do shell que D13 escolher, com allowlist de operações e payload JSON; (b) Host↔Python, chamada curta, por stdio JSON-lines com uma requisição em voo; (c) Host↔Python, trabalho longo, por fila durável com idempotência, lease, heartbeat e retry com teto — **a fila é o mecanismo; a engine é D8**, e nenhuma engine é presumida aqui; (d) Host↔C++ por C ABI, apenas se D4 medir ganho; (e) módulos via API/eventos in-process versionados. O envelope v1 é ponto de partida, não congelamento." | A6b; D8 respeitado; IPC sem presumir Electron nem Tauri |
| **Resp. por núcleo** | Adotar a tabela §4.2.1 como anexo normativo do ADR de D5, com a regra: “nenhum dado tem dois donos de decisão; o lado que não decide guarda cópia descartável”. | A-D5 |
| **Fronteiras** | Adotar a matriz da §4.3 do estudo como anexo do ADR de D7, com as garantias mínimas de cada contrato — versão, `id` de correlação, prazo, cancelamento, limite de bytes na requisição **e na resposta**, erro com código estável — mais os anexos “Dívidas de medição” (M1–M6) e “Capacidades a construir” (supervisor, distribuição do Python, empacotamento). | A4, A7, M1–M6 |

#### 4.2.1 Tabela de propriedade — exclusivas e compartilhadas

Base: §2.4 do estudo, com a distinção explícita entre o que é exclusivo de um
núcleo e o que é compartilhado por decisão/execução.

**Exclusivo do Core de Orquestração TypeScript**

| Responsabilidade | Por que não pode estar no Host |
| --- | --- |
| Rota ativa e histórico de navegação | É estado de interface; atravessar processo por interação tornaria a UI refém da latência de travessia |
| Estado de tela e composição visual | Só o webview conhece o que está montado |
| Orquestração de chamadas (quando, em que ordem, com que prioridade) | É política de produto; o Host executa, não decide fluxo de tela |
| Cache de dados derivados | Descartável por definição; perder não corrompe a verdade |
| Tratamento de erro de apresentação (o que o usuário vê) | Depende do contexto visual |

**Exclusivo do Runtime/Host Rust**

| Responsabilidade | Por que não pode estar no Core TS |
| --- | --- |
| Criar e encerrar processos; supervisionar filhos | Exige garantia do sistema operacional |
| Acesso a filesystem, rede e recursos do SO | Privilégio concentrado; TS não deve tocar |
| Raiz física por módulo e contenção de caminho | Precisa valer mesmo se o chamador estiver errado ou comprometido |
| Revalidação de permissão e aplicação da política | Defesa em profundidade do ADR-002; um lado só não basta |
| Estado de execução e saúde (running/stopped/degradado) | É fato do processo, não da tela |
| Aplicação de limite de bytes, timeout e cancelamento | Quem executa a operação é quem sabe abortá-la |

**Compartilhado (com dono único de decisão)**

| Responsabilidade | Dono da decisão | Dono da execução | Regra |
| --- | --- | --- | --- |
| Conceder `READ_FILES` a um módulo | Core TS (política declarada) | Host (revalida e aplica) | Host pode negar o que o Core concedeu; nunca conceder o que o Core negou |
| Quais módulos sobem no boot | Host + Registry (manifesto como entrada) | Host | Divergência com o Core é erro de contrato, não “escolha de quem chegou primeiro” |
| Dados persistidos | Data Layer (D8) | Data Layer | Nem Core nem Host são donos da verdade |
| Versão de contrato entre fronteiras | decisão arquitetural (D7) | ambos, cada lado no seu limite | Mudança incompatível exige versão nova, não negociação em runtime |

A regra que impede a duplicação: **se dois lados precisam decidir o mesmo fato,
um deles está errado por construção** — e o teste de contrato é o que revela qual.

### 4.3 O que não pode ser prometido na aprovação

- **"Suporte a Windows"** enquanto não houver job Windows e smoke sem recusa (A2/O1).
- **"Graceful shutdown"** enquanto o mecanismo depender de sinal (A3/O5).
- **"Pacote portátil"** enquanto o alvo for NSIS e não houver build offline (A6b/O7).
- **"Worker Python integrado"** enquanto ele não estiver no `extraResources` e
  executável sem Python do sistema (O4).
- **"Testado em CI"** para a fila enquanto não houver workflow com contagem
  (A7/O6).
- **"Envelope seguro"** enquanto `:` for aceito e `valid_module_id` estiver inerte
  (A4/O2).

### 4.4 Riscos de aprovar agora × esperar

| Escolha | Risco | Mitigação |
| --- | --- | --- |
| Aprovar agora com P0 fechado | Decidir sobre medição de Linux e leitura de código para Windows | Declarar M1–M6 como dívida nomeada; P1–P5 como condições de etapa |
| Aprovar agora **sem** P0 | ADR cita topologia errada e promete o que não existe; perde valor como registro | Não aprovar sem C-A1, C-A5, C-A6a |
| Esperar toda a prontidão | Reconstrução parada por tempo indeterminado; decisões tomadas de fato por omissão, no código | Separar P0 de P1–P5; nada de Etapa A antes de P1, mas D5/D6/D7 fecham em P0 |
| Aprovar D7 sem tratar D8 | Filtrar "fila Postgres" para dentro de uma decisão de comunicação, criando dívida em D8 | Redação neutra de engine (A6b) |

**Recomendação:** fechar P0 (A1, A5, A6a + as duas neutralidades de D6/D7),
aprovar D5, D6 e D7 como decisões arquiteturais, e registrar os outros ajustes
como **requisitos obrigatórios de implementação**, cada um no seu portão. É a
única combinação que não transforma decisão em promessa nem prontidão em
pré-requisito de decisão.

**Executado em 2026-11-24.** P0 fechado; D5, D6 e D7 aprovados explicitamente
pelo operador e registrados em ADR-007, ADR-008 e ADR-009. A2, A3, A4, A6b e A7
seguem como requisitos de implementação em P1–P5, e M1–M6 como dívidas nomeadas
nos anexos A dos três ADRs. Nenhum código foi escrito e nenhuma etapa foi
iniciada.

---

## 5. Rastreabilidade

| Ajuste | Evidência da auditoria | Achado de risco | Seção do estudo afetada |
| --- | --- | --- | --- |
| A1 | E1, E17 | R8 | §1, §2.4, §6.2 |
| A2 | E20 | R1 | §5 (ARQ-1), §6.4, §8 |
| A3 | E13, E14 | R2 | §4.2, §5 (ARQ-1), §6.4 |
| A4 | §4.1(b), §4.5 | R3 | §4.3, §6.4, §8 |
| A5 | E3, E15, E16 | R10 | §1, §2.2, §5 (ARQ-1) |
| A6 | §4.7 | R7 | §5 (ARQ-1), §6.4, §7 |
| A7 | E13, E14 | R4 | §4.1, §4.2, §5 (ARQ-1) |

Itens operacionais sem ajuste correspondente na auditoria — O3 (supervisor) e O4
(distribuição do Python) — vêm de §3.4 e R5, e não estavam nos sete porque a
auditoria os tratou como ausência de implementação, não como erro de evidência.

---

## 6. Referências

- [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md) — de onde vêm os sete ajustes e todas as evidências citadas.
- [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md) — ARQ-1, tabela de donos (§2.4), matriz de transporte (§4.3), critérios de falsificação (§6.5).
- [`arquitetura-alvo.md`](./arquitetura-alvo.md) — §16 (decisões pendentes), §17 (conflitos D8/D13), §18 (etapas A–F).
- [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) — dossier de decisão; não é decisão.
- [`../decisions/`](../decisions/) — ADRs 001–009; os três novos (007, 008, 009)
  nasceram das minutas deste plano. Nenhum ADR anterior foi alterado.
- Issues [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) e [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539).
