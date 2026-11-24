# Proposta de decisão — D5, D6 e D7: Core, componentes e comunicação

> **Status:** 🟣 **proposta para decisão — não é ADR, não está aprovada.**
> Nenhum ADR existente é revogado por esta proposta; D5/D13 reabrem apenas o que
> a #540 explicitou.
> Quando o operador decidir, cada item vira ADR (007, 008, 009) e esta proposta
> fica como registro das alternativas. Enquanto isso, nada aqui pode ser usado
> para justificar implementação como se fosse decisão.
>
> **Contexto:** itens D5, D6 e D7 de
> [`arquitetura-alvo.md` §16](./arquitetura-alvo.md#16-decisões-pendentes).
> Complementa o [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md)
> e as issues [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539)
> e [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540).

## Por que as três juntas

D5 (qual linguagem no Core), D6 (componentes são processos ou bibliotecas) e D7
(como eles falam) não são independentes. Escolher a linguagem do Core sem saber
se o Core é processo ou biblioteca produz um desenho que não fecha; escolher o
transporte antes do modelo de componente produz IPC onde não precisa. Decidir uma
só e adiar as outras duas tende a gerar retrabalho — é a mesma lição do ADR-004:
a fronteira vai onde o volume por travessia é alto e a frequência é baixa.

---

## 1. Fatos que restringem a decisão

Nada abaixo é opinião; são medições ou artefatos que já existem.

| Fato | Consequência |
| --- | --- |
| O produto é **somente aplicativo** ([#539](../decisions/ADR-006-disponibilizacao-somente-app.md)) | não existe “servidor web público” a proteger; o shell é local |
| Core de orquestração em WASM mediu **~124 ns** por evento contra **~26 ns** em JS (ADR-004) | levar a orquestração de alta frequência para Rust/WASM é perda, não ganho |
| O Core de Runtime Rust já existe em `v2/runtime/`: `RuntimeHost`, `RuntimePolicy`, envelope JSON v1, `ReadFile` e `RuntimeStopped` | a fronteira Rust já tem um contrato mínimo testado; a decisão deve aproveitá-lo |
| O worker Python já usa fila Postgres com `SKIP LOCKED` (`v2/services/tarefas`, `v2/data/migrations/001_fundacao.sql`) | trabalho assíncrono **já** tem transporte; forçá-lo por IPC seria regressão |
| O protótipo `v2/core` em JS dirige o router real da V1 no harness | a orquestração de UI já provou que funciona perto da interface |
| O app V1 é Electron e o ADR-004 escolhe **Tauri** pós-1.0.0 | se Tauri prevalecer, o shell é Rust + webview; se Electron, o shell é Node — o desenho muda |
| C++ precisa de caso medido (ADR-005) | C++ entra como biblioteca, não como processo, salvo prova em contrário |

---

## 2. D5 — Linguagem do Core

“Core” são duas funções diferentes com perfis opostos. Nomeá-las separado evita
metade da confusão:

- **Core de UI / Orquestração** — rotas, views, estado de tela, ciclo de vida de
  módulo visível. Alta frequência, volume mínimo por operação, precisa do DOM.
- **Host / Core de Runtime** — processo, filesystem, rede, permissões reais,
  supervisão de workers, boot do app. Baixa frequência, volume alto, precisa de
  isolamento e garantia de memória.

### Opção A — Host em Rust + Core de UI em TypeScript (recomendada)

Rust é o processo confiável do aplicativo; TypeScript roda no webview e cuida da
experiência. Os dois conversam por contrato local.

- A favor: mantém a medição do ADR-004 (orquestração de UI em JS/TS é mais rápida
  no webview); dá a Rust o que ele faz melhor (execução privilegiada); o Runtime
  Rust existente vira o começo do Host, não código descartado.
- Contra: duas linguagens na fronteira principal; exige contrato tipado e
  disciplina de permissões.
- Custo de migração: baixo — `v2/core` continua sendo o Core de UI; `v2/runtime`
  cresce para Host.

### Opção B — Tudo em Rust, UI só como view

O Host Rust também mantém rotas, estado e orquestração; o webview só desenha.

- A favor: um modelo mental, uma autoridade, sem fronteira para a lógica.
- Contra: cada interação de UI atravessa a fronteira; o ADR-004 mediu a travessia
  como perda para operações de alta frequência; o protótipo `v2/core` seria
  reescrito; e a UI fica dependente de um contrato muito mais verboso.
- Custo de migração: alto, com ganho não demonstrado.

### Opção C — Tudo em TypeScript no webview (ou Node sidecar)

Volta ao modelo da V1, com um sidecar para o que precisar de privilégio.

- A favor: menor custo aparente; reaproveita quase tudo.
- Contra: permissão real sobre processo/filesystem continua sendo convenção, não
  garantia — exatamente o defeito que a V2 existe para corrigir; Node sidecar
  recria o problema de fronteira sem o isolamento de Rust.
- Custo de migração: baixo hoje, alto quando a segurança for cobrada.

**Recomendação:** Opção A. Não é “Rust é melhor que TS”; é que cada um está sendo
usado onde a medição favorece — a mesma regra do ADR-004, agora com o app-only no
lugar do “navegador”.

---

## 3. D6 — Componentes: processos, bibliotecas ou mistura

### Opção A — Híbrido por necessidade (recomendada)

| Componente | Forma | Por quê |
| --- | --- | --- |
| Frontend TypeScript | webview do shell | é onde a UI vive |
| Host / Runtime Rust | processo principal | privilégio, supervisão, boot, ciclo de vida |
| Worker Python | processo supervisionado | isolamento de dependências, GIL, falha contida |
| Biblioteca C++ | biblioteca nativa in-process, via C ABI | desempenho sem pedágio de IPC; é o caso que justifica C++ |
| Módulos | pacotes/manifestos carregados pelo Core | contrato já validado no protótipo |

- A favor: cada componente tem a forma que o problema pede; falha de Python não
  derruba o app; C++ não paga travessia; o Host permanece pequeno.
- Contra: três toolchains no empacotamento; o Host precisa de um supervisor de
  processos de verdade.
- Custo: médio — o supervisor é a peça nova.

### Opção B — Tudo biblioteca em um processo

- A favor: build e distribuição mais simples; chamadas baratas.
- Contra: dependências Python embutidas e GIL; crash de biblioteca nativa derruba
  o app; isolamento de módulo vira só disciplina.
- Custo: baixo no começo, alto em estabilidade.

### Opção C — Tudo processo

- A favor: isolamento máximo e uniforme; linguagem de cada processo é detalhe.
- Contra: IPC em toda operação; C++ perde o sentido (o ganho seria comido pela
  serialização); boot mais lento; empacotamento e diagnóstico mais caros.
- Custo: alto sem necessidade demonstrada.

**Recomendação:** Opção A. A forma segue a necessidade, não a estética: Python
isola, C++ acelera, Rust supervisiona, TS apresenta.

---

## 4. D7 — Comunicação entre componentes

### Matriz recomendada

| Fronteira | Transporte | Garantias |
| --- | --- | --- |
| UI (TS) ↔ Host (Rust) | comando IPC do shell (Tauri command ou envelope próprio), lista de operações permitidas | envelope versionado, `id` de requisição, timeout, erro com código estável |
| Host (Rust) ↔ worker Python — chamada curta | JSON por linha sobre stdio, worker iniciado pelo Host | timeout, cancelamento, correlação, sem porta pública |
| Host (Rust) ↔ worker Python — trabalho longo | fila Postgres com `SKIP LOCKED` (já existe) | idempotência, heartbeat, retry, estado no banco |
| Host (Rust) ↔ biblioteca C++ | C ABI in-process | ownership explícito, códigos de erro, thread-safety declarada |
| Módulo ↔ Core | manifesto + API/eventos versionados (já validado) | capacidade concedida, namespace de storage |
| Módulo ↔ dados | serviços/contratos do Core | sem conexão própria, sem esquema paralelo |

### Envelope proposto — UI ↔ Host

```json
{
  "versao": 1,
  "id": "req-7f3a",
  "operacao": "fs.read",
  "modulo": "editor",
  "parametros": { "caminho": "notas/hoje.md" },
  "prazo_ms": 2000
}
```

Resposta:

```json
{
  "versao": 1,
  "id": "req-7f3a",
  "ok": true,
  "dados": { "conteudo": "..." }
}
```

Erro:

```json
{
  "versao": 1,
  "id": "req-7f3a",
  "ok": false,
  "erro": { "codigo": "CapabilityDenied", "mensagem": "READ_FILES não concedida a editor" }
}
```

### Regras que acompanham a escolha

1. **Nenhum worker abre porta local pública por padrão.** Se um dia precisar, é
   decisão própria com autenticação e escopo.
2. **Assíncrono vai para a fila, não para IPC.** Só chamada curta e interativa
   usa stdio; trabalho longo usa o banco que já existe.
3. **Toda operação tem nome estável e allowlist.** O Host não expõe “execute
   isto”; expõe operações nomeadas.
4. **Timeout, cancelamento e recuperação são do contrato**, não do transporte.
5. **JSON v1 primeiro.** Protobuf/binário só com necessidade medida.
6. **C ABI mínima:** funções pequenas, ownership documentado, erro por código,
   nada de exceção atravessando a fronteira.

---

## 5. Desenho consolidado da recomendação

```text
┌─────────────────────────────────────────────────────────────┐
│ APLICATIVO (shell Tauri, se o ADR-004 prevalecer)           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ WEBVIEW — TypeScript                                  │  │
│  │ UI · rotas · estado · Core de UI (v2/core evolui)      │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │ IPC allowlist, envelope v1        │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │ HOST — Rust (v2/runtime evolui)                       │  │
│  │ boot · permissões · processos · filesystem · logs     │  │
│  └───────┬───────────────────────────────┬───────────────┘  │
│          │ stdio JSON-lines              │ C ABI (in-process)│
│  ┌───────▼─────────────┐        ┌────────▼──────────────┐   │
│  │ WORKER — Python     │        │ BIBLIOTECA — C++      │   │
│  │ curto: stdio        │        │ caso medido           │   │
│  │ longo: fila Postgres│        │                       │   │
│  └─────────────────────┘        └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

O que isso resolve: o Core de UI continua rápido e perto da interface (medição do
ADR-004), o privilégio fica em Rust (segurança), Python isola o que precisa de
ecossistema, C++ só entra onde o benchmark justificar, e o trabalho assíncrono
não é empurrado para IPC.

---

## 6. Consequências

**Boas.** D5/D6/D7 passam a ter uma resposta coerente, e as peças existentes
deixam de ser descartadas: `v2/core` vira o Core de UI, `v2/runtime` vira o Host,
`v2/services/tarefas` e as migrações viram a camada assíncrona. O primeiro
vertical slice fica pequeno: uma chamada tipada de UI → Host, uma leitura de
arquivo autorizada, uma tarefa na fila e um encerramento limpo.

**Custos.** Supervisor de processos em Rust (novo). Contrato IPC com allowlist,
versionamento e testes (novo). Empacotamento de três toolchains (já era
consequência do ADR-005). E a fronteira precisa de disciplina: qualquer operação
nova exige nome, permissão e teste de contrato.

**Riscos.** Se o shell final for Electron em vez de Tauri, o Host Rust deixa de ser
o processo principal do shell e passa a ser sidecar — o desenho sobrevive, mas o
D13 precisa ser resolvido antes da Etapa A. Se o Host crescer demais, vira um
segundo monólito; a regra é mantê-lo pequeno e admitir funcionalidade só se todo
módulo precisar.

---

## 7. O que esta proposta não decide

D1 (framework de UI e estado), D2 (divisão fina de Python), D4 (escopo de C++),
D8 (banco), D9 (empacotamento/atualização), D10 (plataformas), D11
(compatibilidade V1), D12 (monorepo) e D13 (shell). A recomendação assume Tauri
por herança do ADR-004, mas não o decide.

---

## 8. Critérios de aceite da decisão

Antes de marcar qualquer ADR como aceita, a fatia vertical mínima deve provar:

- [ ] UI TypeScript faz uma chamada tipada ao Host e recebe erro e sucesso
      padronizados.
- [ ] O Host nega uma operação sem capacidade concedida, com código estável.
- [ ] Um worker Python sobe, responde a uma chamada curta e é encerrado por
      timeout sem travar o app.
- [ ] Uma tarefa longa roda pela fila com `SKIP LOCKED`, sobrevive a reinício do
      worker e não duplica execução.
- [ ] Uma função C++ trivial atravessa a C ABI e devolve erro corretamente (a
      prova da fronteira; não é o caso de uso final).
- [ ] Falha de módulo opcional não derruba o Host; falha do Host produz
      diagnóstico claro.
- [ ] Encerramento limpo: tarefas canceladas, workers encerrados, estado
      persistido.

---

## 9. Se aprovado, o texto do ADR

**ADR-007 (D5):** O aplicativo tem dois núcleos nomeados — Core de UI em
TypeScript, no webview, e Host de Runtime em Rust, como processo principal. A
orquestração de alta frequência permanece em TypeScript; privilégio de processo,
filesystem, rede e supervisão ficam em Rust. Não há segundo Core em C++.

**ADR-008 (D6):** Componentes assumem a forma que o problema exige: webview (TS),
processo principal (Rust), worker supervisionado (Python), biblioteca in-process
(C++ via C ABI), módulos carregados por manifesto. Nenhum componente novo vira
processo sem requisito de isolamento demonstrado.

**ADR-009 (D7):** Comunicação por contrato versionado em cada fronteira: IPC com
allowlist entre UI e Host; stdio JSON-lines para chamada curta ao worker; fila
Postgres `SKIP LOCKED` para trabalho longo; C ABI para biblioteca nativa.
Nenhum worker abre porta pública por padrão; JSON v1 até haver necessidade medida
de formato binário.

Cada ADR deve registrar: contexto (esta proposta), alternativas descartadas,
escolha, consequências e data. A aprovação é do operador — o agente não promove
proposta a decisão.

---

## 10. O que falsificaria a recomendação

- Benchmark mostrando que atravessar a fronteira UI↔Host custa mais que manter a
  operação no webview, **com o app real** e não com microbenchmark.
- Um caso de uso concreto em que embutir Python no processo seja mais estável e
  barato que supervisionar worker.
- Um ganho de C++ que não se sustente depois de descontar cópia, serialização e
  manutenção da C ABI.
- Escolha de shell que impeça um processo Rust principal (ex.: Electron), o que
  muda D6/D7 sem mudar D5.

Se algum desses aparecer, a proposta é revista — não defendida.
