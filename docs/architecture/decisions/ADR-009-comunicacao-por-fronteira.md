# ADR-009 — Comunicação por fronteira, com o transporte adequado a cada integração

- **Status:** ✅ **aceita** — aprovada explicitamente pelo operador em 2026-11-24.
- **Data:** 2026-11-24
- **Contexto:** [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) (arquitetura-alvo), [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) (somente app)
- **Formaliza:** **D7** de [`arquitetura-alvo.md` §16](../v2/arquitetura-alvo.md#16-decisões-pendentes)
- **Redação normativa:** [`plano-prontidao-arq1.md` §4.2](../v2/plano-prontidao-arq1.md#42-o-que-deve-mudar-na-redação-antes-de-assinar)
- **Evidência:** [`auditoria-evidencias-d5-d6-d7.md`](../v2/auditoria-evidencias-d5-d6-d7.md) §3.1, §3.2, §3.3, §4.3, §4.5; [`analise-decisoes-d5-d6-d7.md`](../v2/analise-decisoes-d5-d6-d7.md) §4 e §6
- **Relaciona-se com:** [ADR-002](./ADR-002-permissoes-deny-by-default.md), [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md), [ADR-007](./ADR-007-dois-nucleos-core-orquestracao-host-runtime.md), [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md)

---

## Contexto e problema arquitetural

D5 decidiu **onde** ficam as autoridades; D6 decidiu **que forma** cada componente
assume. D7 decide **como elas falam** — e essa decisão não pode ser uma tecnologia
única, porque as fronteiras têm perfis opostos: uma chamada de tela dura
microssegundos e acontece a cada interação; uma tarefa de IA dura minutos e pode
falhar no meio.

O problema arquitetural é que cada família de transporte tem um modo de falha
diferente. IPC com JSON é legível e barato de manter, mas não resolve trabalho
longo. Fila durável resolve trabalho longo, mas é caríssima para interação. stdio
não tem endereço — não há o que sequestrar —, mas exige que um processo seja pai
do outro. C ABI é a única forma de não pagar serialização, e é a que mais exige
disciplina de ownership. Escolher uma para tudo importa o modo de falha errado
para as outras.

Duas restrições delimitam a resposta e precisam estar ditas desde o início:

1. **A engine de persistência é D8 e está em conflito aberto.** Qualquer redação
   que diga "fila Postgres" filtra uma decisão de dados para dentro de uma
   decisão de comunicação.
2. **O shell é D13 e está em conflito aberto.** Qualquer redação que diga "Tauri
   command" ou "`postMessage` do Electron" escolhe o shell por dentro de D7.

Existe também um transporte real no protótipo — stdio JSON-lines com envelope v1 —
que funciona, é testado dos dois lados e está integrado. A decisão deve preservá-lo
onde ele é adequado, em vez de descartá-lo por preferência.

## Decisão aprovada

**A comunicação é definida por fronteira, não por tecnologia única.**

| Fronteira | Mecanismo aprovado | Condição |
| --- | --- | --- |
| **TS ↔ Host** | IPC nativo do shell que D13 escolher, payload JSON, **allowlist de operações** | Nenhum shell é presumido aqui; o mecanismo é nomeado por capacidade |
| **Host ↔ Python — chamada curta** | **stdio JSON-lines**, uma requisição em voo, linha única, limite de bytes, timeout, correlação, sem log em stdout | Worker residente iniciado pelo Host |
| **Host ↔ Python — trabalho longo** | **fila durável** com idempotência, lease, heartbeat e retry com teto, falha registrada | **A fila é o mecanismo; a engine é D8.** Nenhuma engine é presumida |
| **Host ↔ C++** | **C ABI** in-process (ou bridge gerada): ownership, thread-safety declarada, erro por código, sem exceção atravessando a fronteira | Apenas se D4 medir ganho |
| **Módulo ↔ Core** | **API e eventos in-process versionados**; manifesto e capacidades | Módulo não abre conexão própria com dados |
| **Módulo ↔ dados** | Contratos do Core, esquema versionado, isolamento por módulo | Sem conexão própria do módulo |

**Garantias mínimas de contrato, em toda fronteira.** Versão explícita; `id` de
correlação; prazo; cancelamento; **limite de bytes na requisição e na resposta**;
erro com código estável. Sem esses seis, a fronteira não é contrato — é chamada
direta com outro nome.

**Preservação do que já existe.** O envelope v1 e o transporte stdio do protótipo
continuam válidos; `runtime-transport.js` já separa contrato de transporte, então
trocar stdio pelo IPC do shell é substituir uma função, não reescrever o sistema.
O **contrato** é o que se reaproveita.

**O envelope v1 é ponto de partida, não congelamento.** Este ADR **não** o
ratifica como contrato seguro: hoje a validação aceita `:` em identificador de
módulo e existe uma guarda escrita e inerte (`valid_module_id`). Por isso o ajuste
A4 permanece **condição de implementação (P1)**, não condição deste registro.

## Alternativas consideradas

| Alternativa | Descrição | Veredicto |
| --- | --- | --- |
| **Uma tecnologia para tudo — JSON IPC** | Todo par de componentes fala pelo mesmo transporte de mensagens | **Rejeitada.** Trabalho longo precisa de lease, heartbeat, idempotência e retry — semântica de fila que o IPC não tem |
| **Uma tecnologia para tudo — fila** | Até a chamada interativa vira tarefa enfileirada | **Rejeitada.** Paga persistência e polling em cada interação de tela |
| **stdio para trabalho longo** | Reaproveitar o transporte existente para tudo entre Host e Python | **Rejeitada.** Reintroduz o problema que a fila resolveu: processo preso, tarefa órfã, timeout sem devolução |
| **Protobuf como padrão** | Formato binário com schema em todas as fronteiras | **Rejeitada por ora.** Sem volume medido que pague codegen em três toolchains e depuração binária. Fica como opção quando houver medição |
| **Socket local como padrão** | UDS / named pipe com ACL em todas as fronteiras | **Rejeitada por ora.** Cria endereço a sequestrar, ciclo de vida próprio e diferença Windows × POSIX, sem demanda de múltiplos clientes |
| **IPC específico de um shell** | Escrever a decisão em termos de "Tauri command" ou "`postMessage`" | **Rejeitada.** D13 está aberto; a decisão ficaria refém de uma escolha não feita |
| **FFI direto a partir do webview** | Chamar Rust como biblioteca a partir da página | **Rejeitada por impossibilidade.** O webview não carrega biblioteca nativa do Host |

## Justificativa técnica

**O transporte segue a frequência da fronteira.** Atravessar processo custa
**154,8 µs p50 / 274,4 µs p95** por ida e volta (4 KB, stdio real; auditoria §4.3,
E17). Isso é aceitável para chamadas de baixa frequência — que é o perfil de
todas as fronteiras deste ADR — e proibitivo para eventos de interface, que ficam
in-process por D5. A matriz não escolhe "o transporte mais rápido"; escolhe o
transporte cujo modo de falha corresponde ao trabalho.

**O que já está testado continua valendo.** O envelope v1 isola as duas pontas; o
transporte stdio é testado do lado Node e do lado Rust e está integrado ao app;
o `RuntimePolicy` revalida cada requisição. Descartar isso seria trocar código
verde por código novo sem ganho medido.

**A fila já tem a semântica necessária no protótipo.** `SKIP LOCKED`, lease,
heartbeat, retry e reaper existem e passam em teste local — mas **fora do CI** e
dependentes de `search_path` configurado. É por isso que a fila é o mecanismo e a
maturidade é dívida: A7/O6, no portão P3/P5.

**JSON tem custo medido e limite explícito.** A resposta de `Response::File {
bytes }` infla **4,01×** (16.428 bytes para 4 KB) e **não havia limite de
resposta** (auditoria §3.1 e risco R6). Daí a exigência de limite de bytes nos dois
sentidos. Formato binário só entra com necessidade medida — não por estética.

**O que este ADR não afirma.** Não afirma que a fila roda em CI; não afirma que o
envelope é seguro; não afirma que existe supervisor para o worker que fala stdio;
e não afirma que o IPC do shell cabe em um orçamento de latência, porque esse
número é **M6**.

## Consequências positivas e negativas

**Positivas.**

- Cada fronteira recebe o mecanismo cujo modo de falha ela suporta.
- Todo contrato é testável por fronteira, com `id` de correlação e erro estável.
- O transporte é trocável sem reescrever o contrato — o protótipo já foi desenhado
  assim.
- Nenhum worker abre porta local por padrão: stdio não tem endereço.
- A decisão sobrevive a D8 e a D13 sem ser reescrita.

**Negativas, sem maquiagem.**

- São seis contratos de fronteira para manter, não um.
- Existem dois caminhos para Python (curto e longo), e a escolha entre eles é
  arquitetural, não incidental — errar significa tarefa presa ou interação lenta.
- JSON infla payload e exige limite nos dois sentidos; o limite é implementação
  obrigatória, não sugestão.
- Não existe "camada de comunicação" única para raciocinar; cada fronteira tem
  sua semântica.
- Protobuf e socket voltam à mesa quando houver medição — este ADR não os proíbe
  para sempre, apenas não os adota sem evidência.

## Responsabilidades e fronteiras

| Fronteira | Dono do contrato | Dono do processo | Garantias exigidas |
| --- | --- | --- | --- |
| TS ↔ Host | ambos, cada lado no seu limite; mudança incompatível exige versão nova | shell (D13) | versão, `id`, prazo, cancelamento, limite de bytes (req. e resp.), erro com código estável, allowlist |
| Host ↔ Python (curto) | Host define, worker obedece | Host inicia; supervisão a construir | linha única, uma requisição em voo, timeout, correlação, limite de bytes, stdout reservado ao protocolo |
| Host ↔ Python (longo) | Host define o contrato de tarefa; a engine é D8 | Host enfileira; worker reivindica | idempotência, lease, heartbeat, retry com teto, falha registrada |
| Host ↔ C++ | Host, com header estável e versão de ABI | Host carrega in-process | ownership, thread-safety declarada, erro por código, `catch_unwind` |
| Módulo ↔ Core | Core, versionado por API | Core | capacidade concedida, namespace de storage, versão de API |
| Módulo ↔ dados | Core, esquema versionado | Data Layer (D8) | isolamento por módulo, sem conexão própria |

Regras que acompanham a matriz:

- **A versão é do contrato, não da negociação.** Mudança incompatível exige versão
  nova; os dois lados não "combinam em runtime" o que cada campo significa.
- **Nenhum worker abre porta local por padrão.** Se um dia precisar, é decisão
  própria, com autenticação e escopo — não consequência deste ADR.
- **Manifesto não é sandbox.** O contrato de módulo continua sendo capacidade
  concedida e revalidada; D7 não muda isso.

## Restrições e condições

**Não decidido aqui.** A engine da fila (D8); o shell e seu IPC nativo (D13); o
escopo e a forma de C++ (D4); o empacotamento (D9); as plataformas (D10).

**Protobuf e sockets não são decisões gerais.** Ambos permanecem opções
condicionadas a medição (volume de payload, múltiplos clientes) e exigiriam
decisão própria. Este ADR não os adota nem os proíbe para sempre.

**O envelope v1 não é certificado.** Enquanto `:` for aceito na validação e
`valid_module_id` estiver inerte, o envelope não pode ser chamado de seguro. Isso
é A4, condição de **P1**, e este ADR não o antecipa.

**A aprovação deste ADR não significa que os requisitos operacionais estejam
concluídos.** P1–P5 continuam obrigatórios:

| Portão | Antes de | Critérios exigidos |
| --- | --- | --- |
| **P1** | Etapa A (contrato vertical) | C-A4, C-O2 — a primeira chamada real usa o envelope; a guarda de caminho vem antes |
| **P2** | Etapa B (runtime e módulos) | C-A2a, C-A3 (início), C-O3 (contrato escrito) |
| **P3** | Etapa C (worker Python) | C-A3, C-O5, C-O4, C-A7 — inclui a fila no CI |
| **P4** | Etapa D (C++ nativo) | D4 com benchmark contra alternativas |
| **P5** | Distribuição / release | C-A2b, C-O1, C-O6, C-O7 |

**C-A7 valida a fila que existe, não escolhe a engine.** O workflow com Postgres
exercita `SKIP LOCKED`, lease e heartbeat do protótipo — é o único código de fila
que existe hoje. Ele **não** decide D8 e não pode ser lido como decisão: a engine
segue em conflito e este ADR não a presume. Se D8 escolher outra engine, C-A7 é
re-instanciado sobre ela com os mesmos critérios (migração aplicada, contagem de
testes no log, falha com zero testes), e a abstração de fila independente de
engine continua sendo a capacidade pendente do Anexo B.

**P1 não esgota as condições da Etapa A.** Além de C-A4 e C-O2, o
[canônico §19.3](../v2/arquitetura-alvo.md#193-o-que-impede-a-implementação-de-começar)
exige D13 resolvido antes dela — porque o IPC do shell é, aqui, nomeado por
capacidade e não por produto.

**Windows permanece requisito de primeira classe** e não está coberto: nenhum
workflow V2 roda em `windows-latest` e o smoke empacotado recusa `win32`. A fila
também não roda em CI; "testado" hoje significa "passa localmente com
`search_path` configurado".

## Relação com outros ADRs

| ADR | Relação |
| --- | --- |
| [ADR-002](./ADR-002-permissoes-deny-by-default.md) | Autenticação interna entre componentes segue o modelo de capacidades; o contrato é o veículo da política, não sua substituição |
| [ADR-007](./ADR-007-dois-nucleos-core-orquestracao-host-runtime.md) | A matriz implementa a fronteira entre as duas autoridades e herda o dono de cada fato |
| [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) | A forma de cada componente define quais transportes existem; este ADR não cria fronteira que D6 não tenha justificado |
| [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md) | Fornece o critério de frequência × volume que orienta a escolha por fronteira |
| D4 / D8 / D13 | **Abertos.** O mecanismo da fila e o IPC do shell são nomeados por capacidade justamente para sobreviver a eles |

## Dívidas de medição (anexo A)

| # | Medição pendente | Fecha | Portão | Observação |
| --- | --- | --- | --- | --- |
| M1 | Boot e memória em Windows (app + Host + worker) | C-O1 | P5 | Diferença de plataforma é justamente o que se quer medir |
| M2 | Custo de parada e retorno à fila em Windows | C-A3, C-O5 | P3 | Depende do mecanismo de parada, que não existe |
| M3 | Spawn de worker Python com dependências de IA | C-O4, C-O7 | P3 / P5 | Sem dependências instaladas, qualquer número é chute |
| M4 | Vazão da fila com N workers | C-O6 | P5 | Só correção foi exercitada; concorrência real não |
| M5 | Memória e boot do webview (Electron × WebView2) | D10 / D13 | shell | Exige build e display |
| **M6** | **Custo de travessia UI↔Host com o app real** | critério 1 da §6.5 do estudo (mede UI↔Host; é o gatilho de reabertura de D5 e o que decide se o transporte de D7 segue adequado) | sem portão fixo | O número de processo não inclui o IPC do shell; é o que pode tornar o IPC TS↔Host inadequado |

Regra: dívida nomeada não vira estimativa. Nenhum valor desta tabela pode ser
preenchido por inferência para "fechar" o documento.

## Capacidades que ainda precisam ser construídas (anexo B)

| Capacidade | Estado real | O que não pode ser afirmado hoje |
| --- | --- | --- |
| **Fila durável no CI** — workflow com Postgres, migração como consumidor faria, contagem de testes e falha com zero | **Não existe**; 14 testes passam localmente, dependentes de `search_path` | "a fila é testada em automação" |
| **Abstração de fila independente de engine** — contrato de tarefa que sobreviva a D8 | **Não existe**; o protótipo usa `SKIP LOCKED` sobre Postgres | "a fila não depende da engine" |
| **Testes de contrato por fronteira** — versão, `id`, prazo, cancelamento, limite de bytes nos dois sentidos, erro estável | **Parciais**: transporte e permissão têm teste; as seis garantias não são cobradas em todas as fronteiras | "as fronteiras são testadas por contrato" |
| **Limite de bytes na resposta** | **Não existe**; resposta inflou 4,01× sem teto (R6) | "payload é limitado" |

Supervisor, encerramento multiplataforma e distribuição do worker Python estão no
Anexo B do [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md);
este ADR depende deles e não os substitui.

## As seis garantias, fronteira por fronteira (anexo C)

As seis garantias da decisão não são um selo colado por cima da matriz: cada uma
tem um lugar próprio em cada fronteira. A tabela abaixo mostra **onde** cada uma
se materializa — não o nome final do campo, que é do contrato escrito (P2/P3).

| Garantia | TS ↔ Host | Host ↔ Python (curto) | Host ↔ Python (longo) | Host ↔ C++ | Módulo ↔ Core | Módulo ↔ dados |
| --- | --- | --- | --- | --- | --- | --- |
| **Versão** | campo de versão no envelope; incompatível exige versão nova | campo de versão na linha JSON | versão do contrato de tarefa, **separada** da versão da engine (D8) | versão de ABI no header + teste de layout | versão de API declarada no manifesto | esquema versionado do contrato |
| **`id` de correlação** | `id` por chamada; a resposta casa com o pedido | `id` por linha, com uma requisição em voo | `id` da tarefa, que é também a chave de idempotência | `id` da chamada carregado até o retorno de erro | `id` de requisição/evento | `id` da operação |
| **Prazo** | prazo por chamada no envelope; expirado é erro, não espera | timeout por requisição | prazo da tarefa no contrato; expirado devolve ao fluxo de lease | prazo conferido antes e depois da chamada — in-process não é preemptível | deadline da chamada | timeout de operação no contrato |
| **Cancelamento** | cancelamento pelo `id`, com confirmação | pelo `id`; com uma em voo, descarta a resposta e libera a linha | cancelamento explícito da tarefa, distinto de lease expirado | flag cooperativa checada pela função | cancelamento do handle devolvido pela API | cancelamento da operação |
| **Limite de bytes (req. e resp.)** | teto nos **dois** sentidos, com erro ao exceder | teto na linha de entrada e na de saída | teto no payload da tarefa e no resultado | tamanho declarado no header; buffer maior que o teto é recusado | teto no retorno de chamada/evento | teto no resultado da consulta |
| **Erro com código estável** | código estável no envelope; a mensagem de tela é do Core | código estável na linha, com stdout reservado ao protocolo | falha registrada na tarefa, com código e tentativa | código de retorno; exceção não atravessa a fronteira | código do contrato, não inventado pelo módulo | código do Core; o módulo não interpreta erro de engine |

Três advertências sobre a leitura desta tabela:

1. **Ela não acrescenta garantia nem fronteira.** As seis e as seis são as da
   decisão acima; o anexo é a demonstração de que a regra "em toda fronteira" é
   aplicável, e não uma lista de desejos.
2. **Onde a célula descreve comportamento** — recusar, cancelar, registrar — é
   requisito, não capacidade existente; nenhuma dessas garantias é cobrada hoje
   em todas as fronteiras (Anexo B).
3. **"Limite de bytes" não é opinião.** A resposta de `Response::File { bytes }`
   inflou **4,01×** sem teto (auditoria §3.1, R6); por isso o limite vale na
   requisição **e** na resposta, em todas as fronteiras que serializam.

## Critérios de validação

| Condição | Critério verificável | Portão | Estado |
| --- | --- | --- | --- |
| **C-A6a** | Host neutro ao shell; transporte TS↔Host nomeado por capacidade, sem produto | P0 | ✅ neste ADR |
| **C-A4** | `:`, `C:x`, `C:\x`, `..\x`, NUL rejeitados por teste; validação chamada fora dos testes | P1 | 🟡 não implementado |
| **C-O2** | Nenhum identificador escapa da raiz; bateria adversarial falha fechado em Windows e Linux | P1 | 🟡 não implementado |
| **C-A7** | Workflow com Postgres aplica migração, roda 14 testes, falha com zero testes; `search_path` documentado ou dispensado | P3 | 🟡 não implementado |
| **C-O6** | Fila sob N workers: nenhuma tarefa reivindicada duas vezes; nenhuma presa em `RUNNING` | P5 | 🟡 não implementado |
| **C-A2b** | Smoke do pacote roda em `win32` e falha quando o binário é removido | P5 | 🟡 não implementado |
| **M4, M6** | Vazão da fila e custo de travessia com o app real medidos | P5 / gatilho | 🟡 não medido |

**Reabertura.** D7 é reavaliada pelos **critérios 1 e 3 da
[§6.5 do estudo](../v2/analise-decisoes-d5-d6-d7.md#65-em-que-circunstâncias-eu-mudaria-de-recomendação)**:
(1) se a medição com o app real mostrar que a ida e volta UI↔Host custa mais do
que o transporte deste ADR suporta — o mesmo critério que reabre D5, porque o
número é o mesmo, M6; ou (3) se surgir necessidade real de múltiplos clientes do
Host, que tornaria socket local mais barato que adaptar o desenho. Os critérios 2,
4 e 5 da §6.5 são de D6, D4 e da forma do Host, e não reabrem D7 por si. Em
qualquer caso, ADR novo revoga este; este não é editado.
