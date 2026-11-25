# ADR-007 — Dois núcleos: Core de Orquestração em TypeScript e Runtime/Host em Rust

- **Status:** ✅ **aceita** — aprovada explicitamente pelo operador em 2026-11-24.
- **Data:** 2026-11-24
- **Contexto:** [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) (arquitetura-alvo), [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) (somente app)
- **Formaliza:** **D5** de [`arquitetura-alvo.md` §16](../v2/arquitetura-alvo.md#16-decisões-pendentes)
- **Redação normativa:** [`plano-prontidao-arq1.md` §4.2 e §4.2.1](../v2/plano-prontidao-arq1.md#42-o-que-deve-mudar-na-redação-antes-de-assinar)
- **Evidência:** [`auditoria-evidencias-d5-d6-d7.md`](../v2/auditoria-evidencias-d5-d6-d7.md) §2.1, §4.2, §4.3, §6; [`analise-decisoes-d5-d6-d7.md`](../v2/analise-decisoes-d5-d6-d7.md) §2 e §6
- **Relaciona-se com:** [ADR-002](./ADR-002-permissoes-deny-by-default.md), [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md), [ADR-005](./ADR-005-v2-app-typescript-backend-poliglota.md), [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md), [ADR-009](./ADR-009-comunicacao-por-fronteira.md)

---

## Contexto e problema arquitetural

O ADR-004 separou duas funções que a palavra "Core" costumava juntar: o **Core de
UI** — rotas, views, estado de tela, eventos de interface — e o **Core de
Runtime** — processo, filesystem, rede, permissão real, supervisão. A separação
foi registrada, mas nunca virou decisão sobre **como as duas autoridades
convivem**.

A issue #540 §15.2 propôs o caminho oposto: consolidar tudo em um host Rust
único, com o webview reduzido a camada de desenho. Isso é o conflito **C5** da
[§17 do canônico](../v2/arquitetura-alvo.md#17-conflitos-e-divergências-abertos),
e é o que D5 precisava resolver.

O problema real não é "qual linguagem" — isso o ADR-004 já fixou. É decidir se
existem **duas autoridades nomeadas** ou uma só, e, se existirem duas, como
impedir que elas decidam o mesmo fato e divirjam. A história mostra o modo de
falha: a regra de permissão que existe nos dois lados e discorda.

Dois protótipos já materializam lados dessa fronteira: `v2/core` (o Core de
orquestração, em JS com verificação de tipos) e `v2/runtime` (o Host mínimo, em
Rust). A decisão precisa aproveitar o que está testado, não recomeçar.

## Decisão aprovada

1. **O aplicativo tem dois núcleos nomeados, com escopos exclusivos.**
   O **Core de Orquestração TypeScript** — o "Core de UI" do canônico, no
   webview — é dono exclusivo de rotas, estado de tela, composição da interface,
   orquestração de chamadas e cache derivado. O **Runtime/Host Rust**, como
   processo **privilegiado**, é dono exclusivo de ciclo de vida de processo,
   filesystem, rede e recursos do sistema operacional, raiz por módulo e
   contenção de caminho, revalidação de permissão, estado de execução e saúde, e
   aplicação de limite de bytes, timeout e cancelamento.
2. **As responsabilidades compartilhadas são governadas por uma tabela de
   propriedade**, adotada como anexo normativo deste ADR (§Responsabilidades e
   fronteiras): cada dado tem **um único dono de decisão**; o outro lado guarda
   cópia derivada e descartável. Onde houver decisão e execução em lados
   diferentes, a regra é explícita — o Host pode negar o que o Core concedeu,
   nunca conceder o que o Core negou.
3. **A fusão em host Rust único fica rejeitada para o horizonte atual**, com os
   critérios de reabertura da [§6.5 do estudo](../v2/analise-decisoes-d5-d6-d7.md#65-em-que-circunstâncias-eu-mudaria-de-recomendação).
   Reabrir exige ADR novo; não é edição deste.
4. **Este ADR não decide linguagem** (já fixada no ADR-004), **nem shell**
   (D13), **nem persistência** (D8), **nem o escopo de C++** (D4), **nem
   plataformas** (D10), **nem empacotamento** (D9).

Estas quatro linhas são a decisão inteira. Nada neste ADR autoriza código: a
implementação continua subordinada aos portões P1–P5 da seção "Restrições e
condições".

## Alternativas consideradas

| Alternativa | Descrição | Veredicto |
| --- | --- | --- |
| **Host Rust único (ARQ-2)** | Um processo confiável em Rust absorve rotas, estado, permissões e supervisão; o webview só desenha | **Rejeitada.** Cada interação de UI passaria a atravessar processo — exatamente o trabalho de alta frequência e volume mínimo que o ADR-004 mandou não atravessar. Também exigiria reescrever `v2/core` e descrever toda UI de módulo como modelo serializável |
| **Separação sem tabela de donos (A puro)** | Mantém os dois núcleos, mas sem formalizar quem decide e quem executa cada fato compartilhado | **Rejeitada.** Degenera em duplicação de autoridade — duas implementações da mesma regra que discordam com o tempo. É o defeito que a decisão existe para evitar |
| **Núcleo TS com sidecars por socket (ARQ-3)** | Orquestração em TypeScript, serviços em processos separados conversando por socket local protegido | **Rejeitada como desenho padrão.** Compra ciclo de vida de socket, ACL por plataforma e superfície com endereço — sem demanda de múltiplos clientes que pague por isso |
| **Monólito poliglota (ARQ-4)** | Tudo no mesmo processo confiável, com Python embutido | **Rejeitada.** Uma falha nativa de IA derrubaria o app inteiro, e o empacotamento da stdlib Python vira requisito de build |
| **Manter D5 aberto e decidir no código** | Deixar a forma emergir da implementação | **Rejeitada.** Decisão por omissão é a que ninguém consegue auditar depois |

## Justificativa técnica

**O número que decide é a travessia de processo, não o microbenchmark.** Atravessar
processo custa **154,8 µs p50 / 274,4 µs p95** por ida e volta, medidos em 4 KB
sobre stdio real (auditoria §4.3, evidência E17). A orquestração dentro do
webview custa nanossegundos. Manter a orquestração onde ela é barata e o
privilégio onde ele é necessário é a única leitura compatível com o critério do
ADR-004 — volume por travessia × frequência.

**O comparativo JS × WASM não sustenta D5.** Os **22,1 ns (JS) × 110,9 ns (WASM)**
são microbenchmark **dentro do webview**, topologia que nenhuma arquitetura
proposta usa: aqui o Host é processo, não WASM. A razão foi reproduzida em
4,61–5,15×, com valores absolutos ~30% menores (auditoria §2.1, E1). Ele fica
registrado como comparativo intra-webview, **sem função de prova**. Um ADR que
citasse a topologia errada seria contestável por qualquer leitor futuro.

**O Host é barato o suficiente para existir.** Medidos **1,03 MB** de RSS ocioso e
**4,8 ms** de cold start até a primeira autorização (auditoria §4.2 e §4.3,
E15/E16). As estimativas anteriores de 10–30 MB e 5–30 ms foram substituídas pelo
medido.

**O que já está testado continua valendo.** `RuntimePolicy` por módulo, raiz de
filesystem vinda do host confiável, envelope v1 e rejeições de permissão são
código existente e testado; a fronteira de capacidade falha fechado, conforme o
ADR-002. Três módulos já validaram o contrato de manifesto. A separação não
começa do zero — ela é o desenho que o protótipo já tem.

**A regra que impede a duplicação é a tabela, não a tecnologia.** Duas autoridades
só são estáveis se cada fato tiver um dono escrito. Por isso a tabela de
propriedade é anexo normativo, e não recomendação.

**O que este ADR não afirma.** O custo de travessia com o app real — incluindo o
IPC do shell — **não está medido**; é a dívida **M6**. Este ADR não declara que
ele cabe em um orçamento qualquer, porque orçamento não foi fixado. Também não
afirma que a tabela esteja completa: ela é documentação viva, revisável por
contrato.

## Consequências positivas e negativas

**Positivas.**

- O caminho quente — tecla, hover, transição de rota — não atravessa processo.
- O privilégio fica concentrado no único componente que precisa dele.
- Cada sintoma tem dono óbvio: quem for consertar estado de tela não precisa
  entender de supervisão de processo, e vice-versa.
- A composição de módulos continua natural: módulo declara manifesto, Core
  compõe, Host revalida.
- Custo de adoção baixo: os dois lados já existem em protótipo.

**Negativas, sem maquiagem.**

- Duas autoridades exigem disciplina contínua; a tabela é documentação viva, não
  código que se autoimpõe.
- Toda linha compartilhada vira superfície de contrato a testar.
- Três toolchains permanecem no build, no CI e na distribuição.
- Existe risco real de "dois monólitos": mitigado pela tabela e por teste de
  contrato, não eliminado por arquitetura.
- **M6 não medido:** o custo de travessia com o app real pode mudar a conclusão
  para um conjunto de operações. Se isso acontecer, reabre-se D5 pelos critérios
  1 e 3 da §6.5 do estudo, com ADR novo.

## Responsabilidades e fronteiras

Tabela adotada como **anexo normativo**. Base: §2.4 do estudo, com a distinção
entre exclusivo e compartilhado.

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

> A primeira linha é **responsabilidade prevista** do Host, não capacidade
> existente: hoje não há supervisor. O exercício dela é o Anexo B (P2/P3).

**Compartilhado (com dono único de decisão)**

| Responsabilidade | Dono da decisão | Dono da execução | Regra |
| --- | --- | --- | --- |
| Conceder `READ_FILES` a um módulo | Core TS (política declarada) | Host (revalida e aplica) | Host pode negar o que o Core concedeu; nunca conceder o que o Core negou |
| Autorização para módulos subirem no boot | Host (manifestos do Registry como entrada) | Host | Divergência com o Core é erro de contrato, não "escolha de quem chegou primeiro" |
| Dados persistidos | Data Layer (D8) | Data Layer | Nem Core nem Host são donos da verdade |
| Versão de contrato entre fronteiras | decisão arquitetural (ADR-009) | ambos, cada lado no seu limite | Mudança incompatível exige versão nova, não negociação em runtime |

A regra que impede a duplicação: **se dois lados precisam decidir o mesmo fato,
um deles está errado por construção** — e o teste de contrato é o que revela qual.

> **Nota de leitura (não altera a tabela).** A linha “quais módulos sobem no boot”
> governa a **autorização** do boot — quem pode subir e sob quais capacidades,
> fato do Host com o Registry como entrada. A **instanciação** do módulo é
> in-process no Core, conforme a decisão 2 do [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md).
> A fronteira exata entre autorizar e instanciar é o contrato escrito em **P2**;
> até lá, ela é ambígua por construção e não deve ser lida como dois donos.

## Restrições e condições

**Não decidido aqui.** A forma do Host — processo principal do sistema
operacional ou sidecar (D13); a engine de persistência (D8); empacotamento e
atualização (D9); plataformas (D10); escopo e forma de C++ (D4). Nenhuma parte
desta decisão presume shell, engine ou plataforma.

**"Privilegiado" qualifica privilégio, não posição.** Este ADR não afirma que o
Host é processo principal do SO; se D13 escolher Electron, ele é sidecar, e isto
não invalida D5.

**A aprovação deste ADR não significa que os requisitos operacionais estejam
concluídos.** P0 foi fechado por este ADR (justificativa medida, números com
fonte, Host neutro ao shell, anexos A e B existentes). P1–P5 continuam
obrigatórios nas respectivas etapas:

| Portão | Antes de | Critérios exigidos |
| --- | --- | --- |
| **P1** | Etapa A (contrato vertical) | C-A4, C-O2 — segurança de caminho antes da primeira chamada real |
| **P2** | Etapa B (runtime e módulos) | C-A2a, C-A3 (início), C-O3 (contrato escrito) |
| **P3** | Etapa C (worker Python) | C-A3, C-O5, C-O4, C-A7 |
| **P4** | Etapa D (C++ nativo) | D4 com benchmark contra alternativas |
| **P5** | Distribuição / release | C-A2b, C-O1, C-O6, C-O7 |

**Windows permanece requisito de primeira classe** e **não está coberto**: não há
job `windows-latest` para a suíte V2 e o smoke empacotado recusa `win32`. Este
ADR não autoriza comunicar "suporte a Windows".

**Capacidades futuras não são funcionalidades existentes.** Supervisor de
processos, recuperação automática, encerramento multiplataforma e distribuição do
worker Python **não existem** hoje — estão no Anexo B como trabalho a construir.

## Relação com outros ADRs

| ADR | Relação |
| --- | --- |
| [ADR-002](./ADR-002-permissoes-deny-by-default.md) | A revalidação de permissão no Host é a defesa em profundidade que este ADR exige; o Core não substitui o Host, e o Host não substitui o Core |
| [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md) | **Formaliza** a separação que o ADR-004 registrou; não a revoga nem a reinterpreta |
| [ADR-005](./ADR-005-v2-app-typescript-backend-poliglota.md) | Compatível: frontend TS é o Core de Orquestração; o backend poliglota é o Host e seus workers. C++ segue com presença confirmada e escopo pendente (D4) |
| [ADR-008](./ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) | Depende deste: a forma dos componentes herda a fronteira entre os dois núcleos |
| [ADR-009](./ADR-009-comunicacao-por-fronteira.md) | Implementa a comunicação entre as autoridades definidas aqui |
| D8 / D13 | **Abertos.** Não invalidam D5: a fronteira não muda com a engine nem com o shell |

## Dívidas de medição (anexo A)

Dívidas nomeadas, sem resultado antecipado. Nenhuma delas foi estimada para
preencher lacuna.

| # | Medição pendente | Fecha | Portão | Observação |
| --- | --- | --- | --- | --- |
| M1 | Boot e memória em Windows (app + Host + worker) | C-O1 | P5 | Diferença de plataforma é justamente o que se quer medir |
| M2 | Custo de parada e retorno à fila em Windows | C-A3, C-O5 | P3 | Depende de mecanismo que ainda não existe |
| M3 | Spawn de worker Python com dependências de IA | C-O4, C-O7 | P3 / P5 | Sem dependências instaladas, qualquer número é chute |
| M4 | Vazão da fila com N workers | C-O6 | P5 | Só correção foi exercitada; concorrência real não |
| M5 | Memória e boot do webview (Electron × WebView2) | D10 / D13 | shell | Exige build e display |
| **M6** | **Custo de travessia UI↔Host com o app real** | **critério de falsificação 1 de D5** | sem portão fixo | O número de processo (154,8 µs) não inclui o IPC do shell; é o gatilho de reabertura de D5 |

Regra: dívida nomeada não vira estimativa. Se o operador quiser aprovar antes da
medição, aprova sabendo que a decisão repousa em medição de Linux e em leitura de
código para Windows.

## Capacidades que ainda precisam ser construídas (anexo B)

| Capacidade | Estado real | O que não pode ser afirmado hoje |
| --- | --- | --- |
| Supervisor de processos (iniciar, detectar queda, reiniciar com teto, registrar motivo, não deixar órfão) | **Não existe** | "o app se recupera sozinho" |
| Encerramento multiplataforma do worker (sem depender de `SIGTERM`, que o Windows não entrega) | **Não existe** | "graceful shutdown" |
| Distribuição do worker Python (executável a partir do pacote, sem Python do sistema) | **Não existe** — não está em `extraResources` | "worker Python integrado" |
| Empacotamento e distribuição (alvo portátil, execução offline) | **NSIS apenas**, sem alvo portátil | "pacote portátil" |
| Testes de contrato das linhas compartilhadas da tabela de propriedade | **Não existem** para a tabela como um todo | "a tabela é aplicada pelo código" |

## Critérios de validação

| Condição | Critério verificável | Portão | Estado |
| --- | --- | --- | --- |
| **C-A1** | A justificativa cita 154,8 µs p50 com comando, arquivo e ambiente; 22,1/110,9 ns aparece rotulado como intra-webview | P0 | ✅ neste ADR |
| **C-A5** | Todo número tem origem M/D/E; absolutos com variação aparecem como faixa | P0 | ✅ neste ADR |
| **C-A6a** | Host descrito como processo privilegiado; forma remetida a D13 | P0 | ✅ neste ADR |
| **C-O2** | Nenhum identificador de módulo escapa da raiz; teste adversarial falha fechado em Windows e Linux | P1 | 🟡 não implementado |
| **M6** | Custo de travessia com o app real medido e comparado ao baseline | gatilho de reabertura | 🟡 não medido |

**Reabertura.** D5 volta à mesa se (1) a medição com o app real mostrar que a ida
e volta UI↔Host custa mais que manter a operação no Core de UI, ou (3) surgir
necessidade real de múltiplos clientes do Host — critérios 1 e 3 da §6.5 do
estudo. Nos dois casos, ADR novo revoga este; este não é editado.
