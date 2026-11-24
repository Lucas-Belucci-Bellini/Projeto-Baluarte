# Estudo técnico — D5, D6 e D7: núcleos, modelo de execução e comunicação

> **Status:** 🟣 **estudo técnico — registro histórico da análise.**
> **Atualização de 2026-11-24:** as recomendações abaixo foram aprovadas
> explicitamente pelo operador e registradas nos
> [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md)
> (D5), [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md)
> (D6) e [ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md) (D7). O corpo
> do documento permanece como o raciocínio que sustentou a decisão; onde ele
> disser "pendente" ou "proposta", vale a errata abaixo e o ADR correspondente.
> Este estudo não é ADR e não substitui nenhum deles.
>
> Não revoga o [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md)
> nem aprova a seção 15 da [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540).
> Complementa o [documento canônico](./arquitetura-alvo.md) (§16–§17) e o
> [dossier de proposta](./proposta-core-e-fronteiras.md): o dossier diz *o que
> recomendar*; este estudo diz *por que*, com alternativas completas, custos e
> critérios de falsificação.
>
> **Escopo:** análise e documentação. Nenhum componente novo foi criado, nenhuma
> linha de Core/Runtime/worker/biblioteca foi escrita, nenhuma migração de código
> foi feita ([#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540),
> [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539)).

---

## Como ler este documento

Toda afirmação numérica carrega o grau de evidência, porque a diferença entre
"medido" e "achei que era" é exatamente o defeito que o ADR-004 corrigiu:

| Marca | Significado |
| --- | --- |
| **M** | **Medido** no repositório, com o método registrado em `v2/bench/RESULTADOS.md` ou em documento de benchmark próprio |
| **D** | **Derivado** — aritmética sobre medições existentes (ex.: custo por evento × frequência) |
| **E** | **Estimativa** — ordem de grandeza plausível, sem medição no Baluarte; precisa de benchmark antes de virar argumento |

Estimativa **não** sustenta decisão. Onde a estimativa for o único dado
disponível, o texto diz qual medição falta. A seção [§9](#9-o-que-falta-medir-antes-de-aprovar)
lista essas medições como condição de aprovação consciente — não como
pré-requisito para ler o estudo.

Marcas de estado continuam as do canônico: ✅ Definido, 🟣 Proposto, 🟡 Pendente,
⛔ Conflito aberto.

### Errata da auditoria

A [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md)
reproduziu os números deste estudo e encontrou divergências. O corpo do documento
fica como **registro histórico** do que foi analisado; onde ele divergir da tabela
abaixo, **a errata prevalece**.

| Afirmação no corpo | O que a reprodução mostrou | Como ler daqui em diante |
| --- | --- | --- |
| "22,1 ns × 110,9 ns" como despacho de evento real (§1, §2.2, §2.3, §6.2) | É microbenchmark JS × WASM **dentro do webview** — topologia que ARQ-1 não usa. Razão reproduzida em 4,61–5,15×; valores absolutos ~30% menores | Comparativo intra-webview, sem função de prova. A base de D5 é **154,8 µs p50** de travessia de processo (auditoria §4.3) |
| "2,4 µs por evento" no bus | Não reproduzido: **8,6–8,7 µs** estável em três execuções; há um terceiro valor de 9,46 µs no repositório | Citar **faixa 2,4–9,5 µs**, nunca um ponto sem máquina registrada |
| "Rust 1,34× mais rápido que Node em JSON" | Não reproduzido no dataset substituto: 65 ms (Rust) × 59 ms (Node) | Rust ≈ Node nesse payload; a vantagem de Rust sobre Node é marginal, a de ambos sobre Python é grande |
| "Rust 1,8× Node no laço de byte" | Não reproduzido: 13 ms × 14 ms (~1,08×) | idem: direção qualitativa mantida, fator não |
| "Host Rust 10–30 MB ocioso" e "boot 5–30 ms" | Medido: **1,03 MB** ocioso e **4,8 ms** cold | Usar o medido. Webview e worker Python seguem **E**, sem medição |
| "processo principal" (toda ocorrência) | A forma é relativa ao shell, e D13 está em aberto | Ler **processo privilegiado**; principal × sidecar é **D13** |
| "14 testes" da fila como garantia de maturidade | Os 14 passam, mas **fora do CI** e só com `search_path` configurado | "Testes existem e passam localmente; CI e configuração pendentes" (ajuste A7) |

---

## 1. Fatos medidos que restringem as três decisões

Nada nesta seção é opinião. São medições do repositório ou artefatos que já
existem e já são testados. **Onde a reprodução divergiu, vale a
[Errata](#errata-da-auditoria)** — inclusive nos itens marcados **M**.

| Fato | Número / estado | Grau | Consequência para D5–D7 |
| --- | --- | ---: | --- |
| Travessia crua JS ↔ WASM | **2,0 ns** (JS) × **11,8 ns** (WASM) | M | Levar orquestração de UI para Rust/WASM paga pedágio antes de fazer qualquer coisa |
| Despacho de evento em microbenchmark intra-webview | **22,1 ns** (JS) × **110,9 ns** (WASM com string) | M | Comparativo dentro do webview, **não** é o caminho do app; a base de D5 é a travessia de processo abaixo |
| Validação de manifesto | **0,9 µs/op** | M | O manifesto pode ser validado em toda carga sem custo perceptível |
| Selar registro (ordenação topológica) | **63,6 µs** (10 módulos) · **347,8 µs** (100) · **3,295 ms** (1.000) | M | Escala aceitável até centenas de módulos; 1.000 módulos é caso de boot, não de interação |
| Boot completo | **5,28 ms** (10) · **4,05 ms** (100) · **191,09 ms** (1.000) | M | O boot do Core é irrelevante frente ao boot do shell |
| Custo do Event Bus | **2,4–8,7 µs/op** (reprodução); **9,46 µs** em outro bench do repositório | M | O bus só é gargalo se a UI emitir milhares de eventos por segundo; citar faixa, não ponto |
| Consulta de permissão | **~0,0 µs/op** (2.000.000 execuções em 83 ms) | M | Verificar permissão em toda chamada é viável; não há desculpa de desempenho para não revalidar |
| Task Manager (50.000 tarefas triviais) | **5,0–5,6 µs** por tarefa | M | Concorrência interna não exige outra linguagem |
| Parse JSON 17,9 MB | Python **292 ms** · Node **250 ms** · Rust **187 ms** | M | A reprodução **não confirmou** 1,34× sobre Node (Rust ≈ Node); em nenhum cenário o fator justifica reescrita |
| Passeio de 532.622 chaves | Python **130 ms** · Node **64 ms** · Rust **19 ms** | M | Estrutura de dados aninhada é onde a diferença aparece: Rust **3,4×** Node |
| Laço de byte + hash (18 MB) | Python **4.240 ms** · Node **32 ms** · Rust **18 ms** | M | Na reprodução, Rust × Node é marginal (~1,08×) e Rust × Python é ~136× — é o caso que decide parser binário |
| Memória de pico ao parsear 17,9 MB | Python **114 MB** · Rust **104 MB** · Node **130 MB** (rss) | M | Python não é "gastão" por natureza nesse tipo de carga; o custo dele é inicialização e dependências |
| Boot interno da plataforma V2 (protótipo) | **14 ms** p50 | M | O protótipo de Core já sobe rápido; o gargalo é o shell/webview (**215–855 ms** até `partida`) |
| Navegação real nas 99 rotas da V1 | p50 **163 ms** até DCL | M | A referência de experiência que a V2 precisa igualar ou superar |
| Transporte Core → Runtime | **stdio JSON-lines já implementado**, uma requisição em voo, teto de **5 s**, limite de **1 MB** por linha | M | D7 não parte do zero: a fronteira TS→Rust já tem transporte testado |
| Rejeições do envelope | versão incompatível, módulo duplicado, ID vazio, permissão desconhecida, permissão duplicada | M | O contrato já falha fechado; isso é base de D7, não hipótese |
| Fila de trabalho longo | Postgres com `SKIP LOCKED`, lease + heartbeat, desligamento gracioso, erro registrado | M | O mecanismo existe no protótipo; config e CI pendentes — o transporte de trabalho assíncrono não é IPC |
| Tamanho do protótipo | Core ≈ 2.700 linhas (JS/TS) · Runtime ≈ 950 linhas (Rust) · worker ≈ 284 linhas (Python) | M | Nenhum dos lados é grande o bastante para que "reescrever" seja a opção barata por si só |
| C++ no repositório | **zero linhas** | M | D4/D6/D7 para C++ só podem ser analisados como hipótese |

Três leituras que mudam o debate:

1. **A fronteira não é grátis, mas também não é catástrofe.** A travessia crua
   JS↔WASM custa ~11,8 ns porque é no mesmo processo. Atravessar **processo** é
   outra ordem de grandeza: **154,8 µs p50** por ida e volta (medido, 4 KB, stdio
   real) — cerca de quatro ordens acima. Isso não invalida processo; invalida
   **processo para chamada frequente**.
2. **Onde Rust ganha é trabalho de byte e estrutura profunda**, não orquestração
   (em JSON, Rust ≈ Node na reprodução, o que não paga reescrita; em byte,
   ~136× sobre Python paga).
3. **O que já está construído pesa.** Um desenho que descarta o transporte stdio
   e o envelope v1 existentes joga fora código testado para comprar uma hipótese.
   Isso não decide nada, mas entra no custo de cada alternativa.

---

## 2. D5 — Organização dos núcleos

### 2.1 O que esta decisão decide (e o que não decide)

**Decide:** a fronteira entre *orquestração de experiência* e *execução
privilegiada* — quem é dono de rotas, estado de tela, ciclo de vida de módulo
visível, e quem é dono de processo, filesystem, rede, permissão real e
supervisão. Decide também se essas duas funções podem ser uma só.

**Não decide:** a linguagem de cada lado (já fixada pelo ADR-004: TS e Rust),
onde o código mora (D12), qual shell (D13), qual banco (D8) e se C++ existe além
da presença (D4).

A confusão histórica foi tratar "linguagem do Core" como uma pergunta única. São
duas funções com perfis opostos, e o ADR-004 já as separou. A pergunta real de D5
é: **manter separadas, fundir em Rust, ou manter separadas com uma faixa de
responsabilidade compartilhada e explicitamente delimitada?**

### 2.2 Alternativa A — Core de UI TS + Host Rust (separação do ADR-004)

Duas autoridades nomeadas. TypeScript no webview é dono da experiência: rotas,
views, estado de tela, eventos de UI, composição de módulos visíveis. Rust, em
processo próprio, é dono de tudo que exige garantia do sistema operacional:
abrir arquivo, falar rede, iniciar/encerrar processo, aplicar política.

| Dimensão | Avaliação | Evidência |
| --- | --- | --- |
| Desempenho | Ótimo no caminho quente (UI não atravessa fronteira); bom no caminho frio | M: 154,8 µs p50 por travessia de processo (auditoria §4.3); 22,1/110,9 ns apenas como comparativo intra-webview |
| Complexidade | Média: duas linguagens, um contrato, duas autoridades | D: 1 fronteira principal a projetar e testar |
| Manutenção | Boa: dono óbvio por sintoma; contrato versionado isola as mudanças | D: o envelope v1 já isola as duas pontas |
| Segurança | Forte: privilégio concentrado em Rust; TS não toca filesystem nem processo | M: `RuntimePolicy` por módulo, raiz vinda do host confiável |
| Escalabilidade (módulos) | Boa: registry valida em 0,9 µs e sela 100 módulos em 348 µs | M |
| Integração com módulos | Natural: módulo declara-se no manifesto e o Core de UI compõe a interface | M: `cripto`, `editor`, `militar` validaram o contrato |
| Custo de adoção | **Baixo**: `v2/core` já é esse Core; `v2/runtime` já é esse Host | M |

**Risco estrutural:** duas autoridades de estado. Se o estado "vivo" existir nos
dois lados, ele diverge. A mitigação não é tecnológica, é de desenho: **um dado
tem um dono**, o outro lado guarda cópia derivada e descartável.

### 2.3 Alternativa B — Host Rust único, absorvendo a orquestração

Um único processo confiável em Rust é dono de tudo: rotas, estado, permissões,
filesystem, supervisão. O webview vira camada de desenho: recebe um modelo e
emite intenções.

| Dimensão | Avaliação | Evidência |
| --- | --- | --- |
| Desempenho | Ruim no caminho quente: cada interação de UI atravessa processo | M: 11,8 ns por travessia WASM + serialização; **E** dezenas–centenas de µs por IPC de processo |
| Complexidade | Baixa conceitualmente (uma autoridade), alta na prática (todo evento de UI vira mensagem) | D |
| Manutenção | Uma linguagem no núcleo; contrato muito mais verboso | D |
| Segurança | A mais forte possível: uma única superfície privilegiada | D |
| Escalabilidade | Boa; Rust escala em concorrência | M/D |
| Integração com módulos | **Piora**: cada módulo visível precisa de descrição serializável da sua UI | D |
| Custo de adoção | **Alto**: `v2/core` (2.700 linhas verdes) seria reescrito | M |

O ponto que decide contra B não é "Rust é pior". É que **a medição diz que a
orquestração de UI é exatamente o trabalho de alta frequência e volume mínimo que
o ADR-004 mandou *não* atravessar**. B paga pedágio em cada tecla, cada hover,
cada transição de rota, e ganha isolamento que a UI não precisa (a UI já está no
processo mais isolado do sistema, o webview).

**Quando B faria sentido:** se o produto fosse um serviço headless com interface
ocasional (API-first), ou se houvesse múltiplas interfaces (voz, CLI, web,
desktop) disputando a mesma autoridade de estado. Nenhuma das duas descreve o
Baluarte, que é app local-first de interface rica.

### 2.4 Alternativa C — Híbrido com responsabilidades compartilhadas e delimitadas

Mantém duas autoridades, mas define uma **faixa compartilhada explícita**: o que
é *decidido* num lado e *executado* no outro, com contrato formal. Exemplo
concreto para o Baluarte:

| Responsabilidade | Dono da decisão | Dono da execução |
| --- | --- | --- |
| Qual rota está ativa | Core de UI (TS) | Core de UI |
| Quais módulos sobem no boot | Host (Rust) + Registry | Host |
| Conceder `READ_FILES` a um módulo | Core de UI (política declarada) | Host (revalida e aplica) |
| Onde fica a raiz de filesystem do módulo | Host | Host |
| Estado de tela e histórico de navegação | Core de UI | Core de UI |
| Estado de execução (running/stopped, saúde) | Host | Host |
| Cache de dados derivados | Core de UI | Core de UI, descartável |
| Fonte da verdade dos dados | Data Layer | Data Layer |

O que C acrescenta em relação a A não é uma terceira linguagem: é **a regra
explícita de quem decide e quem executa**, com a proibição de que os dois lados
decidam a mesma coisa. Sem essa tabela, A degenera em duplicação — e é assim que
nasce "a regra de permissão que existe nos dois lados e discorda".

| Dimensão | Avaliação | Evidência |
| --- | --- | --- |
| Desempenho | Igual a A (mesma topologia) | D |
| Complexidade | Média-alta: A + disciplina de propriedade documentada | D |
| Manutenção | Melhor que A a longo prazo: o dono é escrito, não intuído | D |
| Segurança | Igual a A, com menos chance de revalidação esquecida | M: o Runtime já revalida o envelope |
| Escalabilidade | Igual a A | D |
| Integração com módulos | Melhor: cada módulo sabe o que o Core decide e o que o Host aplica | D |
| Custo de adoção | Baixo sobre A: documentação e testes de contrato, não reescrita | D |

### 2.5 Comparação direta de D5

| Critério (peso sugerido) | A | B | C |
| --- | --- | --- | --- |
| Desempenho no caminho quente | Ótimo | Ruim | Ótimo |
| Autoridade única por dado | Boa (se disciplinada) | Ótima | Ótima (por construção) |
| Custo de adoção sobre o protótipo | Baixo | Alto | Baixo |
| Custo de manutenção em 5 anos | Médio | Médio-alto | Médio |
| Segurança do privilégio | Forte | Máxima | Forte |
| Risco de duplicação de regra | Médio | Baixo | Baixo |
| Aderência à medição do ADR-004 | Alta | Baixa | Alta |
| Risco de virar "dois monólitos" | Médio | Baixo | Médio (com tabela de donos, menor) |

**Recomendação preliminar de D5 (🟣, não decisão):** **C — separação mantida, com
a tabela de donos formalizada.** C não é "meio-termo": é A com a única coisa que
impede A de apodrecer — a propriedade escrita. B só se justificaria numa mudança
de produto (headless/multi-interface) que não está no horizonte.

---

## 3. D6 — Modelo de execução

### 3.1 Precisão necessária antes de comparar

"Mesmo processo" **não** pode significar "TypeScript no mesmo processo do Rust".
O webview é, por definição do shell (Tauri ou Electron), um processo separado. O
frontend sempre atravessa uma fronteira de processo, qualquer que seja o desenho.

Logo, D6 decide o modelo de execução do **lado confiável**: Rust, Python, C++ e
os workers. São três formas:

- **P1 — Processo único do lado confiável:** Rust embute Python (PyO3) e C++
  (link estático ou `dlopen`); tudo que não é webview roda em um processo.
- **P2 — Processos separados por componente:** Host Rust, workers Python e
  (se existir) serviços C++ como processos distintos, conversando por contrato.
- **P3 — Híbrido por necessidade:** cada componente recebe a forma que o problema
  pede — biblioteca in-process quando o ganho é por travessia, processo quando o
  ganho é isolamento.

### 3.2 Comparação por dimensão

| Dimensão | P1 — processo único | P2 — processos separados | P3 — híbrido |
| --- | --- | --- | --- |
| **Memória** | Menor número de cópias de runtime; um heap por linguagem no mesmo espaço | Cada processo carrega seu runtime | Paga só onde precisa |
| **Inicialização** | Uma vez por app; **E** 40–120 ms para subir Python embutido com dependências | **M** 4,8 ms cold por processo Rust; **E** 120–600 ms por worker Python com dependências | Igual a P2 no que é processo; zero no que é biblioteca |
| **Comunicação** | Chamada FFI direta, ~nanossegundos a poucos µs | Serialização + syscall; **M** 154,8 µs p50 (4 KB, stdio real) | Escolhida por fronteira |
| **Falha** | Segfault/panic de C++, ou `abort` do interpretador, derruba **o app inteiro** | Falha contida no processo; supervisor reinicia | Contida onde há processo; contida por teste onde há FFI |
| **Isolamento** | Nenhum entre linguagens: memória compartilhada, GIL global | Forte: memória, sinais, ambiente, dependências separados | Forte onde importa |
| **Distribuição** | Um binário + bibliotecas + stdlib Python embutida (**E** +40–80 MB) | Um binário por componente + runtime Python empacotado (mesmo peso, mas isolado) | Soma dos dois, mínima |
| **Depuração** | Um debugger, um stack trace — mas stack misto é ilegível na prática | Ferramentas por linguagem, correlação por `id` de requisição | Mista; exige correlação |
| **Custo de implementação** | Alto: PyO3, GIL, empacotamento de stdlib, ABI de C++ | Médio: supervisor e protocolo | Médio-alto: duas formas para testar |

### 3.3 Por linguagem

**TypeScript (webview).** Sempre processo separado — não é escolha. O que se
escolhe é o **transporte** até o Host (D7) e quanto estado vive lá (D5).

**Rust (Host).** Candidato natural a processo privilegiado: é o único componente que
precisa de privilégio real e de supervisão. Em P1 ele vira o processo que embute
tudo — e passa a ser o ponto único de falha do aplicativo. Em P2 é um processo
entre outros, o que é mais fraco do ponto de vista de privilégio (quem supervisiona
o supervisor?) e mais forte do ponto de vista de falha. O Baluarte precisa dos
dois: Host **é** processo privilegiado *e* supervisor. P3 resolve isso: Host é o
processo privilegiado e supervisiona os demais.

**Python (workers).** Três perfis distintos, que costumam ser confundidos:

1. **Trabalho longo e assíncrono** (coleta, indexação, verificação): já tem
   transporte — fila Postgres com `SKIP LOCKED`, lease, heartbeat. Processo
   separado é obrigatório por natureza (o trabalho sobrevive ao app, o app não
   espera por ele).
2. **Chamada curta e interativa** (parsear um documento, extrair texto): se
   estiver no mesmo processo, cada `import` pesado carrega no app e um crash leva
   tudo; se estiver em processo, paga-se *spawn* ou mantém-se um worker residente.
3. **Dependências nativas frágeis** (modelos, OCR, bibliotecas com C): embutir é
   receita de conflito de versão de biblioteca nativa.

Embutir Python (P1) só compensa se as chamadas forem muito frequentes **e** as
dependências forem poucas e estáveis. Nenhuma das duas coisas é verdade para IA e
automação, que são justamente o motivo de Python existir aqui.

**C++.** Ainda sem escopo (D4). Mas a forma segue o motivo econômico: C++ só se
justifica se o custo por chamada for dominante — ou seja, **biblioteca**, não
processo. Um processo C++ que serializa argumentos paga o mesmo pedágio de
qualquer processo e perde a única vantagem que tinha.

### 3.4 Comparação direta de D6

| Critério | P1 | P2 | P3 |
| --- | --- | --- | --- |
| Falha de Python contida | Não | Sim | Sim |
| C++ sem pedágio de serialização | Sim | Não | Sim |
| Empacotamento simples | Sim | Médio | Médio |
| Depuração legível | Não | Sim | Sim |
| Custo de supervisor | Zero | Alto | Alto |
| Número de toolchains no build | 1 (+ Python embutido) | 3 | 3 |
| Risco de crash total | Alto | Baixo | Baixo |

**Recomendação preliminar de D6 (🟣):** **P3 — híbrido**, com a regra escrita:
*processo por padrão para Python; biblioteca só para C++ com benchmark; Host Rust
é o processo privilegiado e o supervisor dos demais — principal × sidecar é D13.* P1 troca isolamento por
empacotamento mais simples e não é compatível com a natureza de Python neste
produto. P2 puro desperdiça a única razão de C++ existir.

---

## 4. D7 — Comunicação entre componentes

### 4.1 As cinco famílias de transporte

| Transporte | Custo por chamada | Custo de manutenção | Versionamento | Depuração | Onde falha |
| --- | --- | --- | --- | --- | --- |
| **IPC com JSON** (pipe nomeado / UDS / IPC do shell) | **E** 30–300 µs (payload pequeno) | Baixo: legível, sem codegen | Campo `versao` + validação | Alta: `cat` do payload resolve | Processo morto, pipe fechado, mensagem parcial |
| **IPC com Protobuf** | **E** 15–150 µs | Médio-alto: `.proto`, codegen, build em 3 linguagens | Excelente por construção, mas exige disciplina de campo | Baixa: binário opaco sem ferramenta | Idem + incompatibilidade de schema gerado |
| **stdio JSON-lines** | **E** 30–300 µs; **já medido como viável** no protótipo | Baixo: é o transporte que existe | Igual a JSON | Alta: linha a linha | Processo que aceita e não responde (teto resolve), saída poluída por log |
| **Socket local protegido** (UDS com permissão de arquivo / named pipe com ACL + token) | **E** 30–300 µs | Médio-alto: ciclo de vida do socket, permissões de SO, porta/socket órfão, Windows ≠ POSIX | Igual a JSON/Protobuf | Média | Sequestro de socket, permissão frouxa, resíduo após crash |
| **FFI / C ABI** | **E** dezenas de ns a ~2 µs (sem serialização) | Alto: header estável, ownership, thread-safety, `catch_unwind` | Manual: versão de ABI + teste de layout | Baixa: crash nativo não tem stack amigável | UB, vazamento, panic atravessando a fronteira |

Dois comentários que evitam decisão por moda:

- **Protobuf não é "mais rápido" de forma relevante aqui.** O ganho aparece em
  payload grande e alta frequência. Nesta arquitetura, a maioria das fronteiras é
  de baixa frequência (por definição do ADR-004) — o que se ganha em parse se
  perde em codegen, em três toolchains e em depuração binária. Fica como opção
  **quando houver volume medido**, não como ponto de partida.
- **Socket local não é automaticamente "mais seguro" que stdio.** Um UDS com
  permissão de arquivo correta é forte; um socket em `/tmp` com permissão frouxa
  é uma porta de entrada. stdio tem uma vantagem subestimada: **não tem endereço**
  — não há o que sequestrar, e o ciclo de vida é o do processo pai.

### 4.2 Por fronteira

#### TypeScript ↔ Rust (webview ↔ Host)

| Opção | Veredicto |
| --- | --- |
| IPC do shell (Tauri command / `postMessage` do Electron) com JSON | 🟣 **recomendado** — é o caminho nativo do shell, sem processo extra, sem socket |
| stdio JSON-lines | Já existe no protótipo, mas exige que o Host seja filho do processo que faz a chamada. Em Tauri, o Host **é** o processo principal, então o webview não pode ser pai dele |
| Socket local | Só se houver mais de uma interface (CLI, outro app) consumindo o Host |
| FFI direto | Impossível a partir do webview |
| Protobuf | Só com volume medido; o IPC do shell já é binário internamente |

O ponto decisivo: **quem é filho de quem**. Com Host Rust como processo
principal (Tauri), a fronteira webview→Host é IPC do shell, não stdio. O stdio
existente no protótipo continua valendo para o modo atual (Core Node como pai) e
para testes de contrato — ou seja, não é código perdido: é o **contrato** que se
reaproveita, com transporte trocável. Isso já está previsto no desenho do
protótipo (`runtime-transport.js` recebe qualquer objeto com `enviar`).

#### Rust ↔ Python

| Opção | Veredicto |
| --- | --- |
| Fila Postgres `SKIP LOCKED` | ✅ **já implementado** para trabalho longo — não é proposta |
| stdio JSON-lines, worker residente iniciado pelo Host | 🟣 recomendado para chamada curta interativa |
| IPC por socket local | Alternativa se houver muitos workers ou reuso entre clientes |
| Embutir Python (PyO3) | Só se a chamada for muito frequente e as dependências estáveis — não é o perfil de IA |
| Protobuf | Sem ganho demonstrado em payload pequeno de tarefa |

Regra que evita o pior erro: **trabalho longo nunca vai por stdio**. Se a chamada
pode durar segundos ou minutos, ela pertence à fila — que já tem lease,
heartbeat, retry e idempotência. Usar stdio para isso reintroduz o problema que a
fila resolveu.

#### Rust ↔ C++

| Opção | Veredicto |
| --- | --- |
| C ABI in-process | 🟣 **hipótese** — única forma de não pagar serialização; exige benchmark e D4 |
| Processo C++ com JSON | Contradiz o motivo de existir C++ |
| `cxx`/`bindgen` (bridge gerada) | 🟣 alternativa mais segura que C ABI manual, se D4 aprovar |
| WASM | Não resolve: C++ nativo existe justamente para o que WASM não faz bem |

Condições mínimas antes de existir: caso de uso real, baseline medido, header
estável, ownership documentado, erro por código (nada de exceção atravessando a
fronteira), `catch_unwind` do lado Rust.

#### Módulos ↔ Core

| Opção | Veredicto |
| --- | --- |
| API e eventos in-process (manifesto + contrato) | ✅ **já validado** no protótipo com 3 módulos |
| Processo por módulo | Fora de cogitação para módulos de UI: mataria o custo de composição |
| FFI por módulo | Só faz sentido se o módulo for de outra linguagem — e é justamente o caso que o Module System quer evitar |

A regra do protótipo continua: módulo declara no manifesto, Core consome o
manifesto, capacidade é concedida, Runtime revalida. **Manifesto não é sandbox** —
e D7 não muda isso.

### 4.3 Matriz de transporte (🟣 proposta, não decisão)

| Fronteira | Transporte recomendado | Garantias exigidas no contrato |
| --- | --- | --- |
| Webview (TS) ↔ Host (Rust) | IPC do shell, JSON, allowlist de operações | `versao`, `id`, `prazo_ms`, erro com código estável, timeout, cancelamento |
| Host (Rust) ↔ worker Python — curto | stdio JSON-lines, worker residente | linha única, limite de bytes, timeout, correlação, sem log em stdout |
| Host (Rust) ↔ worker Python — longo | fila Postgres `SKIP LOCKED` | idempotência, lease, heartbeat, retry com teto, falha registrada |
| Host (Rust) ↔ biblioteca C++ | C ABI (ou bridge gerada), in-process | ownership, thread-safety declarada, erro por código, sem exceção na fronteira |
| Core ↔ módulo | API/eventos in-process versionados | capacidade concedida, namespace de storage, versão de API |
| Módulo ↔ dados | contratos do Core, sem conexão própria | esquema versionado, isolamento por módulo |

Nenhum worker abre porta local por padrão. Se um dia precisar, é decisão própria
com autenticação e escopo.

---

## 5. Análise integrada — quatro arquiteturas completas

D5, D6 e D7 não são independentes: escolher o modelo de execução já escolhe
metade dos transportes, e escolher a fronteira dos núcleos decide onde há
transporte. As quatro arquiteturas abaixo são **combinações coerentes**, não
menus independentes.

Cada uma traz: diagrama, inicialização, comunicação, falha, segurança,
recursos (**E** onde estimado), complexidade, manutenção, vantagens,
desvantagens e riscos de longo prazo.

---

### ARQ-1 — Dois núcleos, execução híbrida, transporte por fronteira

Combina D5-C, D6-P3 e a matriz de D7. É a arquitetura que os protótipos já
sugerem.

```text
┌──────────────────────────────────────────────────────────────┐
│ SHELL DO APLICATIVO (Tauri, se ADR-004/D13 prevalecer)       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ WEBVIEW — processo do webview                          │  │
│  │  FRONTEND TS + CORE DE UI TS                           │  │
│  │  rotas · views · estado de tela · bus de UI · módulos  │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │ IPC do shell (allowlist, JSON)   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ HOST — processo privilegiado, Rust                     │  │
│  │  boot · permissões reais · filesystem · supervisor     │  │
│  │  RuntimeHost · RuntimePolicy · envelope v1             │  │
│  └────┬──────────────────────────────┬────────────────────┘  │
│       │ stdio JSON-lines (curto)     │ C ABI (in-process)    │
│  ┌────▼──────────────────┐      ┌────▼──────────────────┐    │
│  │ WORKER Python (N)     │      │ BIBLIOTECA C++ (0..1) │    │
│  │ IA · automação · NLP  │      │ só com benchmark (D4) │    │
│  └────┬──────────────────┘      └───────────────────────┘    │
└───────┼──────────────────────────────────────────────────────┘
        │ trabalho longo
   ┌────▼────────────────────┐
   │ FILA (Postgres/SQLite)  │  engine: D8 pendente
   │ SKIP LOCKED · lease     │
   └─────────────────────────┘
```

**Inicialização.** (1) Shell sobe e cria o webview. (2) Host Rust inicia:
configuração, logging, verificação de versão de dados, carregamento de política.
(3) Host descobre módulos instalados (manifestos) e valida. (4) Host inicia
somente os workers necessários — residentes sob demanda, não todos no boot.
(5) Webview carrega o Core de UI TS, pede o estado inicial ao Host e renderiza.
(6) Interface recebe prontidão. Encerrar: cancelar tarefas, `SIGTERM` com
desligamento gracioso nos workers, fechar fila e arquivos.

**Comunicação.** Caminho quente (navegação, hover, transição) fica inteiro no
webview. Caminho frio (ler arquivo, iniciar tarefa, consultar saúde) vai por IPC
com allowlist. Trabalho longo nunca usa IPC: entra na fila. Chamada curta a
Python usa stdio com worker residente. C++ só entra por C ABI.

**Falha.** Worker Python que morre não afeta o app: o Host registra, aplica
política de reinício (com teto) e marca a capacidade como degradada. Trabalho na
fila volta por lease expirado. Módulo que falha no `init` é isolado. Falha do Host
é catastrófica por definição — mas é a menor superfície possível: Host pequeno,
sem regra de negócio de módulo. Falha de biblioteca C++ derruba o Host; por isso
C++ exige benchmark **e** teste de contenção antes de entrar.

**Segurança.** Duas camadas de permissão (JS valida manifesto, Rust revalida
envelope). Raiz de filesystem vem do Host, nunca do manifesto. IPC com allowlist
nomeada: o webview não pede "execute isto", pede `fs.read`. Worker não abre porta.
Segredo nunca no payload de log.

**Recursos (M onde medido; E onde estimado).** Host Rust: **1,03 MB ocioso** e
**4,8 ms cold** (medidos — auditoria §4.2 e §4.3). Webview 60–120 MB; worker
Python 40–90 MB com dependências de IA; C++ 1–5 MB; worker Python residente
150–600 ms: tudo **E**, sem medição. Total ocioso plausível: 110–240 MB.
**Medir antes de prometer.**

**Complexidade de implementação.** Média-alta. As peças novas são: IPC com
allowlist no shell, supervisor de processos com política de reinício, contrato
curto com Python. O resto já existe em protótipo.

**Manutenção.** Média. Três toolchains no build; uma fronteira principal; o custo
recorrente é o teste de contrato de cada fronteira e a disciplina de dono único
por dado.

**Vantagens.** Respeita a medição do ADR-004; aproveita 100% do protótipo;
isola Python; contém falha; privilégio onde deve estar; caminho quente sem
pedágio; C++ entra por motivo econômico.

**Desvantagens.** Duas autoridades de estado (exige tabela de donos); duas
linguagens na fronteira principal; supervisor é peça nova e crítica; empacotar
três runtimes é trabalho real.

**Riscos de longo prazo.** (a) Host crescer até virar monólito — mitigação: regra
de que só entra no Host o que todo módulo precisa. (b) Divergência de estado entre
Core de UI e Host — mitigação: cópia derivada é descartável por definição.
(c) Worker residente virar dependency hell — mitigação: um worker por domínio, com
`requirements` próprio.

---

### ARQ-2 — Host único Rust (mono-núcleo)

Combina D5-B, D6-P3 e D7 com IPC para tudo.

```text
┌──────────────────────────────────────────────────────────────┐
│ SHELL                                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ WEBVIEW — view "burra"                                 │  │
│  │  desenha modelo · emite intenções · sem estado próprio  │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │ IPC: intenção → modelo           │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ HOST RUST ÚNICO                                        │  │
│  │  rotas · estado · permissões · fs · supervisor · UI     │  │
│  └────┬──────────────────────────────┬────────────────────┘  │
│       │ stdio (curto)                │ C ABI                 │
│  ┌────▼──────────────┐          ┌────▼──────────────┐        │
│  │ WORKER Python     │          │ BIBLIOTECA C++    │        │
│  └───────────────────┘          └───────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

**Inicialização.** Host sobe primeiro e constrói o modelo de aplicação completo
(rotas, módulos, permissões). Webview só é carregado depois e recebe o modelo
inicial. Encerrar segue a mesma ordem invertida.

**Comunicação.** Toda interação de UI é mensagem. Navegação, mudança de estado,
abertura de painel: cada uma atravessa processo, ida e volta.

**Falha.** Uma autoridade só — não há divergência de estado possível. Em
compensação, se o Host travar, a interface congela sem ter o que mostrar: não há
lado que continue funcionando.

**Segurança.** Máxima: uma superfície privilegiada, um ponto de auditoria. O
webview não tem estado, então não há o que corromper nele.

**Recursos (E).** Tendencialmente menor: um processo de estado em vez de dois.
Webview 50–100 MB, Host 15–40 MB, worker 40–90 MB.

**Complexidade.** Alta na fronteira de UI: cada elemento interativo vira
mensagem, e o modelo precisa ser serializável. Baixa em concorrência de estado.

**Manutenção.** Uma linguagem no núcleo — atraente. Mas o contrato UI↔Host fica
muito maior e mais volátil: é ali que mora o custo.

**Vantagens.** Autoridade única; auditoria de segurança simples; coerência de
estado por construção.

**Desvantagens.** Paga o pedágio exatamente onde a medição mandou não pagar
(11,8 ns de travessia + serialização por interação); descarta o Core de UI
existente; cada módulo visível precisa descrever sua UI de forma serializável,
o que empurra complexidade para todo autor de módulo.

**Riscos de longo prazo.** (a) Latência perceptível em interação rica — difícil
de reverter depois. (b) Contrato de UI virar o novo monólito, agora distribuído.
(c) Módulos de UI deixarem de ser simples, matando a proposta do Module System.

---

### ARQ-3 — Núcleo TS com sidecars por socket protegido

Combina D5-A estrito, D6-P2 puro e D7 com socket local em tudo.

```text
┌──────────────────────────────────────────────────────────────┐
│ WEBVIEW — CORE DE UI TS (dono de estado e orquestração)      │
└───────────┬──────────────────┬───────────────────┬───────────┘
            │ UDS/pipe + token │                   │
   ┌────────▼────────┐  ┌──────▼─────────┐  ┌──────▼──────────┐
   │ SERVIÇO Rust    │  │ SERVIÇO Python │  │ SERVIÇO C++     │
   │ fs · rede · perm│  │ IA · automação │  │ (se D4)         │
   └─────────────────┘  └────────┬───────┘  └─────────────────┘
                                 │ fila
                          ┌──────▼───────┐
                          │ BANCO        │
                          └──────────────┘
```

**Inicialização.** Core de UI sobe, depois sobe cada serviço e faz *handshake* de
capacidade (quem é, o que pode, qual versão de contrato). Serviço que não responde
ao handshake fica indisponível, não impede o app.

**Comunicação.** Uniforme: um só protocolo, um só formato, um só mecanismo de
erro. Simetria total entre fronteiras.

**Falha.** Isolamento máximo: qualquer serviço pode morrer e ser reiniciado sem
levar o app. Mas o Core de UI é ponto único: se o webview morrer, tudo morre —
o que já é verdade em qualquer shell.

**Segurança.** Exige disciplina de SO: permissão de arquivo do socket, token de
sessão, limpeza de socket órfão, comportamento diferente em Windows. É o desenho
com **mais** superfície de ataque local entre os quatro.

**Recursos (E).** Mais processos, mais overhead de memória: 150–300 MB total.
Custo por chamada igual a IPC.

**Complexidade.** Alta: ciclo de vida de socket, handshake, reconexão, e três
implementações do mesmo cliente de protocolo.

**Manutenção.** Alta: qualquer mudança de protocolo toca três linguagens; SOs
diferentes se comportam diferente; sockets órfãos são uma classe de bug própria.

**Vantagens.** Uniformidade conceitual; isolamento forte; permite múltiplos
clientes (CLI, outro app) sem redesenho.

**Desvantagens.** Complexidade de infraestrutura sem demanda que a justifique;
paga pedágio até para biblioteca C++; superfície de segurança local maior que
stdio.

**Riscos de longo prazo.** (a) Complexidade operacional virar fonte constante de
falha. (b) Sockets órfãos e conflitos de permissão entre plataformas. (c) Custo
de manter três clientes de protocolo para sempre.

---

### ARQ-4 — Monólito poliglota (tudo em um processo do lado confiável)

Combina D5-B, D6-P1 e D7 com FFI.

```text
┌──────────────────────────────────────────────────────────────┐
│ WEBVIEW — view + orquestração mínima                         │
└───────────────────────────┬──────────────────────────────────┘
                            │ IPC do shell (poucas operações)
┌───────────────────────────▼──────────────────────────────────┐
│ PROCESSO ÚNICO (Rust)                                        │
│  Host · permissões · fs · supervisor                         │
│  ├── Python embutido (PyO3): IA, automação                   │
│  └── C++ linkado (C ABI): parsers, SDKs                      │
└──────────────────────────────────────────────────────────────┘
```

**Inicialização.** Um processo, um boot. Python inicializado dentro do Host,
bibliotecas C++ carregadas dele.

**Comunicação.** Chamadas diretas; nenhuma serialização entre linguagens.

**Falha.** Qualquer falha nativa derruba tudo. Um `abort` do interpretador Python
encerra o aplicativo. Um segfault em C++ idem. Não há contenção possível.

**Segurança.** Uma fronteira de processo só, o que é bom; mas dentro do processo
não há isolamento entre módulo e biblioteca nativa — a política de permissão passa
a depender de código que compartilha o mesmo espaço de endereçamento.

**Recursos (E).** Menor total de memória e o boot mais rápido; por outro lado,
GIL limita concorrência Python e uma biblioteca C++ mal comportada afeta o todo.

**Complexidade.** Alta no build (PyO3, stdlib embutida, ABI de C++, três
toolchains no mesmo link) e alta no diagnóstico (stack misto). Baixa em
infraestrutura de comunicação — não há.

**Manutenção.** Build e empacotamento dominam; atualizar Python vira atualizar o
aplicativo inteiro; conflito de biblioteca nativa entre Python e C++ é real.

**Vantagens.** Distribuição mais simples; zero IPC entre linguagens; boot rápido.

**Desvantagens.** Sem isolamento de falha; GIL; empacotamento frágil; contraria
a razão de existir worker (contensão de dano).

**Riscos de longo prazo.** (a) Instabilidade: uma dependência nativa derruba o
app em produção sem diagnóstico claro. (b) Atualização de Python presa ao ciclo
do app. (c) Impossível escalar IA para processo separado depois sem redesenho.

---

### 5.1 Comparação entre as quatro

| Critério | ARQ-1 | ARQ-2 | ARQ-3 | ARQ-4 |
| --- | --- | --- | --- | --- |
| Desempenho no caminho quente | Ótimo | Ruim | Ótimo | Ótimo |
| Isolamento de falha (Python) | Forte | Forte | Forte | Nenhum |
| Segurança do privilégio | Forte | Máxima | Forte | Média |
| Superfície de ataque local | Baixa | Baixa | Alta | Baixa |
| Complexidade de implementação | Média-alta | Média | Alta | Alta (build) |
| Custo de manutenção | Médio | Médio-alto | Alto | Alto |
| Aproveitamento do protótipo | **Alto** | Baixo | Médio | Baixo |
| Empacotamento | Médio | Médio | Médio | Difícil |
| Depuração | Boa (correlação) | Boa | Média | Ruim |
| Risco de regressão de experiência | Baixo | Alto | Baixo | Médio |
| Aderência ao ADR-004 | Alta | Baixa | Média | Baixa |

Nenhuma das quatro é "a certa" em abstrato. ARQ-2 e ARQ-4 comprariam simplicidade
conceitual (uma autoridade / um processo) ao preço de experiência de UI e de
estabilidade — os dois bens que o Baluarte declarou não negociáveis. ARQ-3 compra
uniformidade ao preço de infraestrutura que o produto ainda não pede.

---

## 6. Recomendação técnica

### 6.1 Recomendação

**ARQ-1 — dois núcleos com propriedade formalizada (D5-C), execução híbrida
(D6-P3) e transporte escolhido por fronteira (D7, matriz da §4.3).**

Traduzindo em respostas, **aceitas em 2026-11-24** (ADR-007, 008 e 009):

| Decisão | Recomendação | Estado |
| --- | --- | --- |
| D5 | Manter os dois núcleos do ADR-004, com tabela de donos explícita (quem decide × quem executa) | ✅ aceita em 2026-11-24 — [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md) |
| D6 | Host Rust como processo privilegiado e supervisor; Python em processo; C++ como biblioteca só após benchmark; módulos in-process. Principal × sidecar conforme D13 | ✅ aceita em 2026-11-24 — [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) |
| D7 | IPC do shell (JSON, allowlist) TS↔Host; stdio JSON-lines para chamada curta a Python; fila durável para longo (engine conforme D8); C ABI para C++; API/eventos in-process para módulos | ✅ aceita em 2026-11-24 — [ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md) |

### 6.2 Por que esta é a mais adequada

**Porque é a única que respeita a medição que já existe.** Atravessar processo
custa **154,8 µs p50** por ida e volta (medido), enquanto a orquestração dentro do
webview custa nanossegundos — o comparativo intra-webview (≈5× por evento, e o
ADR-004 registra ~124 ns contra ~26 ns) reforça a mesma direção, mas quem sustenta
a separação é a travessia de processo. ARQ-1 mantém a orquestração onde ela é
barata e o privilégio onde ele é necessário. ARQ-2 e ARQ-4 contradizem essa
medição; ARQ-3 a respeita mas paga infraestrutura desnecessária.

**Porque aproveita o que está testado.** Envelope v1, `RuntimePolicy`, rejeições,
transporte stdio, fila com lease e heartbeat: tudo isso já existe e continua
valendo em ARQ-1. Nas outras três, boa parte vira código morto.

**Porque isola a parte instável.** O componente mais provável de travar é o que
tem dependências nativas de IA — Python. ARQ-1 o coloca em processo separado, com
supervisor e política de reinício. ARQ-4 o embute no app.

**Porque deixa C++ entrar sem contaminar a arquitetura.** Com C++ como biblioteca
condicionada a benchmark, o custo de errar é uma biblioteca removível — não um
processo a mais ou um vínculo de build permanente.

**Porque a fronteira já é o desenho do protótipo.** `runtime-transport.js` separa
contrato de transporte; trocar stdio por IPC do shell é substituir uma função, não
reescrever o sistema.

### 6.3 Que problemas ela evita

- **Latência em interação rica** (evita ARQ-2): nenhum evento de UI atravessa
  processo.
- **Deriva de estado entre núcleos** (evita a fraqueza de A puro): a tabela de
  donos da D5-C define quem decide e quem executa — o outro lado guarda cópia
  descartável.
- **Dependência nativa derrubando o app** (evita ARQ-4): Python isolado.
- **Superfície local sem necessidade** (evita ARQ-3): stdio não tem endereço.
- **C++ virando segundo núcleo** (evita a leitura errada de D4): biblioteca, com
  escopo e benchmark.
- **Regra duplicada em duas linguagens** (evita o risco clássico de arquitetura
  poliglota): dono único por dado, escrito.

### 6.4 Limitações

- **Duas autoridades** exigem disciplina contínua; a tabela de donos é documentação
  viva, não código que se autoimpõe.
- **Supervisor é peça nova e crítica**; errar nele gera processos órfãos, que é
  uma classe de bug silenciosa.
- **Três toolchains** no build, no CI e na distribuição — custo permanente.
- **C++ continua indefinido na prática** (D4): a recomendação não resolve o escopo,
  só a forma caso ele exista.
- **Não resolve D8 nem D13**: a fila precisa de engine, e o shell define se o
  Host é processo principal do SO ou sidecar — a recomendação só fixa que ele é
  **processo privilegiado**. Se for Electron, ARQ-1 sobrevive com um processo a
  mais e um hop de IPC a mais.

### 6.5 Em que circunstâncias eu mudaria de recomendação

Critérios de falsificação, escritos antes da aprovação:

1. **Benchmark de fronteira real** (não microbenchmark) mostrando que a ida e
   volta UI↔Host custa mais que manter a operação no Core de UI **com o app
   real** → reconsiderar D5 na direção de B para aquele conjunto de operações.
2. **Caso de uso concreto em que embutir Python** seja mais estável e barato que
   supervisionar worker (dependências poucas, chamadas muito frequentes, crash
   raro) → reconsiderar D6 pontualmente, não para todo o Python.
3. **Necessidade real de múltiplos clientes** do Host (CLI, automação externa,
   outro aplicativo) → ARQ-3 passa a ser mais barata que adaptar ARQ-1.
4. **Ganho de C++ que não sobreviva** ao desconto de cópia, serialização e
   manutenção da ABI → D4 fecha em "não entra", e a arquitetura fica mais simples.
5. **Shell que impeça processo Rust principal** (Electron) **e** requisito de boot
   mínimo → reconsiderar a forma do Host (sidecar) e o transporte.

Se nenhuma dessas aparecer, ARQ-1 é a recomendação estável.

---

## 7. Impacto nos documentos existentes

Este estudo **não altera** nenhuma decisão registrada. O que muda é a
documentação de apoio:

| Documento | Efeito |
| --- | --- |
| [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) | Intocado; continua a decisão registrada da separação dos núcleos |
| [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) | Intocado; continua restrito à #540 §1 |
| [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md) | Intocado |
| [arquitetura-alvo.md](./arquitetura-alvo.md) | Aponta para este estudo em §16; D5/D6/D7 passaram a ✅ com os ADR-007/008/009 |
| [proposta-core-e-fronteiras.md](./proposta-core-e-fronteiras.md) | Permanece o dossier curto de decisão; este estudo é a análise longa que o sustenta |

**Atualização de 2026-11-24.** Os ADR-007, ADR-008 e ADR-009 foram criados a
partir das minutas do [plano de prontidão](./plano-prontidao-arq1.md) §4.2, que
adotam esta recomendação. O texto do dossier §9 continua no dossier como rascunho
histórico; a redação que vale é a dos ADRs. D8 e D13 permanecem abertos.

---

## 8. Riscos de longo prazo (transversais às quatro)

| Risco | Onde aparece | Mitigação |
| --- | --- | --- |
| Segundo sistema dentro do Host | ARQ-1, ARQ-2 | regra: só entra no Host o que **todo** módulo precisa |
| Contrato de UI virar monólito distribuído | ARQ-2 | não adotar ARQ-2 |
| Três clientes de protocolo para manter | ARQ-3 | não adotar ARQ-3 sem demanda real |
| Biblioteca nativa quebrar o app | ARQ-4 | não adotar ARQ-4; C++ só com teste de contenção |
| ABI de C++ apodrecer | ARQ-1 com C++ | versão de ABI + teste de layout + `catch_unwind` |
| Worker órfão consumindo recurso | ARQ-1, ARQ-3 | supervisor com teto, heartbeat e reaper |
| Protobuf cedo demais | qualquer | JSON v1 até haver volume medido |
| Duplicação de regra entre TS e Rust | ARQ-1 | tabela de donos (D5-C) + teste de contrato por fronteira |
| Dependência de shell não decidido (D13) | todas | desenhar Host como processo principal **ou** sidecar sem mudar o contrato |

---

## 9. O que falta medir antes de aprovar

Aprovar sem estes números é aprovar por plausibilidade — o que o ADR-004
explicitamente rejeitou. Nenhum item abaixo exige implementar a V2: todos são
bancos de prova isolados, do mesmo tipo que já existe em `v2/bench/`.

1. **Ida e volta UI↔Host com payload realista** (p50/p95): 100 chamadas de
   `fs.read` de 4 KB e 1.000 eventos de estado pequenos, com o shell candidato.
2. **Custo de spawn + handshake + primeira chamada** de worker Python residente,
   e custo por chamada subsequente.
3. **Consumo de memória ocioso e sob carga** por componente (webview, Host,
   worker, biblioteca), para substituir as estimativas desta seção por medições.
4. **Contenção de falha**: matar worker no meio da tarefa e medir recuperação,
   duplicidade e tempo de retomada.
5. **Custo de C ABI** de uma função trivial versus a mesma função em Rust puro,
   com o desconto de cópia — este é o único número que pode justificar D4.
6. **`SKIP LOCKED` sob concorrência** de N workers no hardware alvo (o protótipo
   já testa correção; falta número de vazão).
7. **Boot do aplicativo completo** com os três runtimes empacotados, comparado
   aos 215–855 ms medidos no harness atual.

Critério de aprovação consciente: para cada decisão, o número que a sustenta está
medido **ou** a decisão é aprovada explicitamente como aposta, com o benchmark
nomeado como dívida.

---

## 10. Como esta recomendação vira decisão

Nada aqui é aprovação. O caminho para fechar D5/D6/D7:

1. O operador lê este estudo e o [dossier](./proposta-core-e-fronteiras.md), e
   pode conferir as evidências na
   [auditoria independente](./auditoria-evidencias-d5-d6-d7.md), que reproduz os
   benchmarks e separa código existente de funcionalidade operacional.
2. Aprova, rejeita ou pede medição adicional (seção [§9](#9-o-que-falta-medir-antes-de-aprovar)).
3. Se aprovar, cada decisão vira ADR (007, 008, 009) com contexto, alternativas,
   escolha, consequências e data — o rascunho já existe no dossier.
4. Só então a Etapa A deixa de estar bloqueada por D5/D6/D7. D8 e D13 continuam
   bloqueando o que dependem deles.

Até o passo 3, este documento é 🟣 proposta. Depois disso, ele passa a registro
das alternativas consideradas — não a fonte da decisão.

**Passos 3 e 4 concluídos em 2026-11-24:** ADR-007/008/009 criados e aceitos.
D5/D6/D7 deixaram de bloquear a Etapa A; **D8, D13 e os portões P1–P5 continuam
bloqueando** o que depende deles. A Etapa A não foi iniciada.

---

## 11. Referências

**Medições e artefatos**

- [`v2/bench/RESULTADOS.md`](../../../v2/bench/RESULTADOS.md) — números de Core, WASM, JSON e laço de byte.
- [`v2/runtime/CONTRACT.md`](../../../v2/runtime/CONTRACT.md) — envelope, estados, capacidades, fluxo de autorização.
- `v2/runtime/src/` — `protocol.rs` (stdio JSON-lines), `envelope.rs`, `host.rs`, `security.rs`.
- `v2/core/runtime-transport.js` — contrato de transporte trocável.
- `v2/core/runtime-stdio.js` — transporte stdio com teto de 5 s e uma requisição em voo.
- `v2/services/tarefas/worker.py` — fila com `SKIP LOCKED`, lease, heartbeat, desligamento gracioso.
- `v2/data/migrations/` — proveniência, grafo e fila.
- `v2/core/manifest.d.ts` — contrato do manifesto e vocabulário de permissões.

**Decisões e documentos**

- [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) — stack por responsabilidade.
- [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) — V2 app, TS no frontend, backend poliglota.
- [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md) — disponibilização somente como app.
- [arquitetura-alvo.md](./arquitetura-alvo.md) — arquitetura-alvo, decisões pendentes e conflitos.
- [proposta-core-e-fronteiras.md](./proposta-core-e-fronteiras.md) — dossier de D5/D6/D7.
- [auditoria-evidencias-d5-d6-d7.md](./auditoria-evidencias-d5-d6-d7.md) — auditoria independente das evidências deste estudo.

**Issues**

- [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) — arquitetura-alvo.
- [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) — somente app.
- [#423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423) — Plano Mestre V2.
