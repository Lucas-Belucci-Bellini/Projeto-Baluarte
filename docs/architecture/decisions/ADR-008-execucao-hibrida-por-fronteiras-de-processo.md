# ADR-008 — Execução híbrida por fronteira de processo

- **Status:** ✅ **aceita** — aprovada explicitamente pelo operador em 2026-11-24.
- **Data:** 2026-11-24
- **Contexto:** [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) (arquitetura-alvo), [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) (somente app)
- **Formaliza:** **D6** de [`arquitetura-alvo.md` §16](../v2/arquitetura-alvo.md#16-decisões-pendentes)
- **Redação normativa:** [`plano-prontidao-arq1.md` §4.2](../v2/plano-prontidao-arq1.md#42-o-que-deve-mudar-na-redação-antes-de-assinar)
- **Evidência:** [`auditoria-evidencias-d5-d6-d7.md`](../v2/auditoria-evidencias-d5-d6-d7.md) §3, §4.1, §4.2, §4.3, §4.4, §4.7; [`analise-decisoes-d5-d6-d7.md`](../v2/analise-decisoes-d5-d6-d7.md) §3 e §6
- **Relaciona-se com:** [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md), [ADR-005](./ADR-005-v2-app-typescript-backend-poliglota.md), [ADR-006](./ADR-006-disponibilizacao-somente-app.md), [ADR-007](./ADR-007-dois-nucleos-core-orquestracao-host-runtime.md), [ADR-009](./ADR-009-comunicacao-por-fronteira.md)

---

## Contexto e problema arquitetural

D6 pergunta **que forma cada componente assume**: processo, biblioteca ou
mistura. A pergunta vem depois de D5 porque a forma herda a fronteira: se há dois
núcleos, há pelo menos um processo privilegiado; se houvesse um só, a conta
mudaria.

Antes de comparar opções, é preciso uma precisão que evita metade da confusão:
**"mesmo processo" não pode significar "TypeScript no mesmo processo do Rust"**.
O webview é, por definição do shell — Tauri ou Electron —, um processo separado.
O frontend sempre atravessa fronteira. D6 decide o modelo de execução do **lado
confiável**: Rust, Python, C++ e os workers.

O problema arquitetural é que cada forma compra uma coisa e paga outra: processo
compra isolamento e paga travessia; biblioteca compra velocidade e paga
contaminação de falha. Escolher uma só forma para tudo força um dos dois lados a
pagar o preço errado.

Duas restrições reais do repositório delimitam a resposta e precisam estar ditas
desde o início:

1. **O supervisor não existe.** Nem iniciar-e-detectar-queda, nem reinício com
   teto, nem registro de motivo. A arquitetura pode prescrevê-lo; não pode
   afirmar que ele já opera.
2. **O shell não está decidido (D13).** Qualquer redação que diga "processo
   principal do sistema operacional" transforma D6 em refém de D13 — e fica
   falsa se D13 escolher Electron.

## Decisão aprovada

1. **Modelo híbrido por necessidade (D6-P3).** Cada componente recebe a forma que
   o problema pede: biblioteca in-process quando o ganho é por travessia;
   processo quando o ganho é isolamento. Não há forma única obrigatória.
2. **Módulos rodam in-process no Core de Orquestração**, pela API e pelos eventos
   versionados do Module System — não em processo por módulo.
3. **Python roda em processo separado**, e é o caso de isolamento por excelência:
   é o componente com dependências nativas de IA e a maior probabilidade de
   falhar.
4. **C++ entra apenas como biblioteca isolada, in-process**, e apenas se D4 medir
   ganho contra alternativas. Nunca como processo; nunca como segundo núcleo.
5. **O Host Rust é processo privilegiado.** Se é processo principal do sistema
   operacional ou sidecar é **D13**, e nenhuma parte deste desenho presume um
   shell específico nem o mecanismo IPC nativo de um shell específico.
6. **Nenhum componente novo vira processo sem requisito de isolamento
   demonstrado** — a mesma regra do ADR-004: volume por travessia × frequência.

**Declaração explícita de ausência.** Supervisão de processos, recuperação
automática, encerramento multiplataforma e distribuição do worker Python são
**capacidades a construir**, não funcionalidades existentes. Este ADR as declara
como requisito, não como conquista.

## Alternativas consideradas

| Alternativa | Descrição | Veredicto |
| --- | --- | --- |
| **P1 — processo único do lado confiável** | Rust embute Python (PyO3) e C++ (link estático ou `dlopen`); tudo que não é webview em um processo | **Rejeitada.** Uma falha nativa de IA derruba o app inteiro; o GIL vira global; a stdlib Python passa a ser requisito de build. Não há frequência de chamada medida que justifique a FFI |
| **P2 — processos separados por componente** | Host, workers Python e serviços C++ todos como processos distintos | **Rejeitada como regra geral.** Paga travessia até na composição de módulos e cria superfície de supervisão maior que a necessária. Só o caso de Python paga por isso |
| **Tudo biblioteca** (dossier, opção B) | Todos os componentes in-process no Host | **Rejeitada.** Contradiz o motivo de existir Python separado: isolamento de dependências nativas instáveis |
| **Tudo processo** (dossier, opção C) | Todo componente em processo próprio, inclusive módulos | **Rejeitada.** Mataria o custo de composição de UI, que é o caminho quente |
| **Presumir o shell** | Escrever D6 em termos de "processo principal" (Tauri) ou "sidecar" (Electron) | **Rejeitada.** D13 está aberto; a redação ficaria falsa sob o outro shell sem que a arquitetura estivesse errada |
| **Adiar D6 e decidir no empacotamento** | Deixar a forma emergir de D9 | **Rejeitada.** Empacotamento é consequência da forma, não sua origem |

## Justificativa técnica

**Onde há isolamento a ganhar, há processo.** Python concentra dependências
nativas e é o candidato mais provável a travar; separá-lo transforma "app morto"
em "worker morto", que é recuperável. Já o custo de atravessar processo —
**154,8 µs p50 / 274,4 µs p95** por ida e volta, medidos em 4 KB sobre stdio real
(auditoria §4.3, E17) — é aceitável para chamadas de baixa frequência, que é
exatamente o perfil dessa fronteira.

**Onde há frequência a perder, não há processo.** Módulos e composição de
interface são alta frequência e volume mínimo; a chamada in-process é a única
forma que não paga pedágio por evento.

**Um processo privilegiado a mais é barato.** Medidos **1,03 MB** de RSS ocioso e
**4,8 ms** de cold start do Host (auditoria §4.2 e §4.3, E15/E16). Isso remove o
argumento de que "dois processos não cabem em app de desktop" — mas não autoriza
prometer orçamento de memória, porque o webview e o worker Python continuam sem
medição (M1, M3, M5).

**C++ é a única forma que entra condicionada.** Não há código para medir; a
decisão de escopo é D4. Como biblioteca, o custo de errar é uma biblioteca
removível — não um processo a mais nem vínculo de build permanente.

**O que este ADR não afirma.** Não há recuperação automática hoje. Não há
supervisor. Não há worker Python distribuído: ele não está em `extraResources` e
não é executável sem Python do sistema. E não há cobertura de Windows: o único
smoke ponta-a-ponta do pacote recusa `win32` por construção.

## Consequências positivas e negativas

**Positivas.**

- Falha nativa fica contida onde existe processo — e é testável onde só existe
  FFI.
- Memória previsível por componente, em vez de um heap poliglota.
- C++ permanece removível se D4 fechar em "não entra".
- Módulos continuam baratos de compor.
- A forma escolhida sobrevive tanto a Tauri quanto a Electron.

**Negativas, sem maquiagem.**

- **Supervisor é peça nova e crítica**; errar nele gera processo órfão — uma
  classe de bug silenciosa.
- Três toolchains no build, no CI e na distribuição: custo permanente.
- Duas formas para testar (processo e FFI).
- Se D13 escolher Electron, há um processo a mais e um hop de IPC a mais; o custo
  real desse hop é **M6**, não medido.
- O worker Python ainda não é distribuível; até lá, o desenho existe no papel.

## Responsabilidades e fronteiras

| Componente | Forma | Quem cria e encerra | Fronteira (ADR-009) |
| --- | --- | --- | --- |
| Webview / Core de Orquestração (TS) | processo separado por definição do shell | shell | IPC nativo do shell |
| Runtime/Host (Rust) | **processo privilegiado** (principal × sidecar conforme D13) | shell | IPC com o webview; stdio com Python (curto); fila com Python (longo); C ABI com biblioteca |
| Worker Python | **processo separado**; supervisão **a construir** | Host (quando o supervisor existir) | stdio (curto) / fila durável (longo) |
| Biblioteca C++ | **in-process**, apenas se D4 medir ganho | Host (carregamento) | C ABI |
| Módulos | **in-process** no Core | Core, por manifesto e capacidade | API e eventos versionados |

Regras que acompanham a tabela:

- **A forma não concede autoridade.** Rodar in-process não dá ao módulo acesso a
  filesystem ou rede; a capacidade continua sendo concedida pelo Core e
  revalidada pelo Host (ADR-007, ADR-002).
- **Quem inicia não é necessariamente quem supervisiona hoje** — porque a
  supervisão não existe. O contrato de supervisão é condição de P2; o
  comportamento é condição de P3.
- **Um componente novo só vira processo com requisito de isolamento demonstrado**
  e registrado; preferência por biblioteca é o padrão.

## Restrições e condições

**Não decidido aqui.** O shell (D13); empacotamento, atualização e rollback (D9);
plataformas suportadas (D10); escopo e forma de C++ (D4); engine de persistência
(D8). A forma escolhida é compatível com as opções em aberto — é isso que permite
decidir D6 antes delas.

**Nenhuma promessa de recuperação automática.** Este ADR não afirma que o
aplicativo reinicia componentes sozinho. Detecção de queda, reinício com teto,
registro de motivo e ausência de órfãos são critérios de construção do supervisor
(C-O3), não comportamento atual.

**A aprovação deste ADR não significa que os requisitos operacionais estejam
concluídos.** P1–P5 continuam obrigatórios:

| Portão | Antes de | Critérios exigidos |
| --- | --- | --- |
| **P1** | Etapa A (contrato vertical) | C-A4, C-O2 |
| **P2** | Etapa B (runtime e módulos) | C-A2a, C-A3 (início), C-O3 (contrato escrito) |
| **P3** | Etapa C (worker Python) | C-A3, C-O5, C-O4, C-A7 |
| **P4** | Etapa D (C++ nativo) | D4 com benchmark contra alternativas |
| **P5** | Distribuição / release | C-A2b, C-O1, C-O6, C-O7 |

**Windows permanece requisito de primeira classe** e não está coberto: nenhum
workflow V2 roda em `windows-latest` e o smoke empacotado recusa `win32`.

## Relação com outros ADRs

| ADR | Relação |
| --- | --- |
| [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md) | Fornece a matéria-prima (Rust no Runtime, Python em IA, parsers binários em Rust); este ADR decide a **forma** com que cada uma entra |
| [ADR-005](./ADR-005-v2-app-typescript-backend-poliglota.md) | C++ tem presença confirmada e escopo pendente (D4); este ADR fixa que a forma, se entrar, é biblioteca isolada |
| [ADR-006](./ADR-006-disponibilizacao-somente-app.md) | App-only torna a forma e o empacotamento requisitos de primeira classe; o shell é local |
| [ADR-007](./ADR-007-dois-nucleos-core-orquestracao-host-runtime.md) | Dependência direta: a separação dos núcleos define que o Host é processo privilegiado |
| [ADR-009](./ADR-009-comunicacao-por-fronteira.md) | A forma escolhida aqui determina os transportes; D7 os especifica |
| D4 / D8 / D9 / D13 | **Abertos.** Nenhum deles muda a decisão de forma; mudam o empacotamento e a posição do Host |

## Dívidas de medição (anexo A)

| # | Medição pendente | Fecha | Portão | Observação |
| --- | --- | --- | --- | --- |
| M1 | Boot e memória em Windows (app + Host + worker) | C-O1 | P5 | Diferença de plataforma é justamente o que se quer medir |
| M2 | Custo de parada e retorno à fila em Windows | C-A3, C-O5 | P3 | Depende do mecanismo de parada, que não existe |
| M3 | Spawn de worker Python com dependências de IA | C-O4, C-O7 | P3 / P5 | Sem dependências instaladas, qualquer número é chute |
| M4 | Vazão da fila com N workers | C-O6 | P5 | Só correção foi exercitada; concorrência real não |
| M5 | Memória e boot do webview (Electron × WebView2) | D10 / D13 | shell | Exige build e display |
| M6 | Custo de travessia UI↔Host com o app real | critério 1 da §6.5 do estudo (mede UI↔Host; dispara D5 e decide a adequação do transporte de D7) | sem portão fixo | O número de processo não inclui o IPC do shell |

Regra: dívida nomeada não vira estimativa, e nenhuma linha desta tabela autoriza
preencher o valor "para fechar o documento".

## Capacidades que ainda precisam ser construídas (anexo B)

| Capacidade | Estado real | O que não pode ser afirmado hoje |
| --- | --- | --- |
| **Supervisor de processos** — iniciar, detectar queda, reiniciar com teto, registrar motivo, não deixar órfão | **Não existe** | "o app se recupera sozinho" |
| **Encerramento multiplataforma** — parada que o worker obedece em Windows e Linux (o Windows não entrega `SIGTERM`) | **Não existe**; hoje o worker depende de sinal e o lease é a única rede | "graceful shutdown" |
| **Distribuição do worker Python** — executável a partir do pacote, sem Python do sistema | **Não existe**; não está em `extraResources` | "worker Python integrado" |
| **Empacotamento** — alvo portátil e execução offline | **NSIS apenas**; sem alvo portátil e sem prova offline | "pacote portátil" |

## Critérios de validação

| Condição | Critério verificável | Portão | Estado |
| --- | --- | --- | --- |
| **C-A6a** | Host descrito como processo privilegiado; forma remetida a D13; supervisor e distribuição do Python **não** afirmados no presente | P0 | ✅ neste ADR |
| **C-A2a** | Job mínimo em Windows executa `cargo test` do Runtime e testes JS do transporte, com contagem no log | P2 | 🟡 não implementado |
| **C-A3** | Sem processo órfão ao fechar o app **e** tarefa devolvida à fila antes do lease vencer, em Linux **e** Windows | P3 | 🟡 não implementado |
| **C-O1** | Windows 10 e 11: suíte verde, smoke verde, ciclo real sem órfão | P5 | 🟡 não implementado |
| **C-O3** | Supervisor inicia, detecta queda, reinicia com teto e registra o motivo; sem órfão ao sair | P2 (contrato) → implementação | 🟡 não implementado |
| **C-O4** | Worker Python instalado e executável a partir do pacote, sem Python do sistema | P3 | 🟡 não implementado |
| **C-O5** | Parada limpa em Windows e Linux pelo mecanismo definido, sem sinal | P3 | 🟡 não implementado |
| **C-O7** | Pacote offline executa o fluxo principal sem rede, em máquina sem toolchain | P5 | 🟡 não implementado |
| **M1, M2, M3** | Medições registradas antes de qualquer promessa de memória, parada ou distribuição | P3 / P5 | 🟡 não medido |

**Reabertura.** D6 é reavaliada pontualmente — não para todo o Python — se
aparecer caso concreto em que embutir Python seja mais estável e barato que
supervisionar (critério 2 da §6.5 do estudo), ou se o shell escolhido em D13
impedir processo Rust principal e o requisito de boot mínimo exigir outra forma
(critério 5). ADR novo revoga este; este não é editado.
