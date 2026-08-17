# V2 — Registro de construção

Este arquivo é um retrato de implementação, não substitui o Master Plan, Rules ou
Decision Log. Serve para uma sessão nova descobrir rapidamente o que já existe.

## Fundação operacional

- [x] Manifest validation
- [x] Module Registry
- [x] Permission System
- [x] Module lifecycle (`init → start`, `stop → dispose`)
- [x] Runtime Rust
- [x] Runtime capabilities
- [x] Runtime filesystem confinement
- [x] Runtime envelope v1
- [x] Runtime Host por módulo
- [x] Runtime Bridge
- [x] Runtime bootstrap
- [x] Transport abstraction
- [x] Health / readiness
- [x] Supervisor global
- [x] Per-module lifecycle status
- [x] Operational platform facade

## Portão de integração (`npm run v2:integracao`) — 15/15

- [x] roda no Windows
- [x] espera por condição, não por relógio

Duas correções, ambas no `scripts/v2-integracao.mjs`; nenhuma no módulo.

**Nunca tinha rodado no Windows.** `spawn('npx', …)` morre em `ENOENT` — o Node
24 recusa spawnar `.cmd` (CVE-2024-27980), e `npx` é `npx.cmd`. Morria antes da
primeira asserção: 0/14, não 13/14. Chamamos o bin do vite com o próprio Node.

**O `13/14` era do relógio, não do briefing.** O portão dormia um tempo fixo
(900 ms) antes de ler a tela. A view do `briefing` é a única importada sob
demanda com esse orçamento — onde a primeira transformação do Vite passa disso,
o portão reprova um módulo correto, e a mensagem mostra a tela *anterior*
(`Lab de Criptografia`), que parece defeito de render. Sleep fixo mede a
máquina, não o sistema.

Medido, com a view atrasada 2 s de propósito: relógio → `13/14`, condição →
`14/14`. E com `view` devolvendo o **módulo** (o defeito de
[`V2_MODULE_RULES.md`](./V2_MODULE_RULES.md)), a condição ainda reprova —
`view não é um nó: object`. Só o falso vermelho saiu; o verdadeiro ficou.

> A hipótese herdada era "view devolve o ELEMENTO". Ela está descartada: o
> `loadView` do `briefing` devolve o elemento desde o commit que o criou
> (`446a272e`), e a asserção do portão está certa — não foi afrouxada.

## Portão de tipos (`npm run tipos:v2`) — 0 erros

- [x] 61 → 0, sem afrouxar `strict`, `checkJs` ou `noImplicitAny`
- [x] o `V2 integration` do CI saiu do `skipped` e **passa**

Estava vermelho havia dias em três branches sem ninguém ver: os últimos commits
do `main` eram do bot de câmbio, e push de bot não dispara workflow. E como no
`v2-validation.yml` os passos são sequenciais, o typecheck vermelho deixava o
`V2 integration` `skipped` — o portão acima existia, mas **não era exercitado**.

Consertá-lo revelou mais duas camadas atrás dele: os dois geradores de catálogo
não enxergavam TypeScript (varriam só `.js` e liam o shim de re-export), e o
workflow nunca instalava o Chromium do Playwright.

## A fachada dirige o entrypoint, e a cadeia inteira tem contrato

- [x] a Plataforma sobe o sistema — supervisor, saúde e lifecycle em runtime
- [x] `Manifest → Registry → Permission → Runtime` testado com as peças **reais**

O `criarPlataforma` existia, tinha teste e não era usado por ninguém: o único
consumidor era o próprio teste. O `v2/harness/main.js` dirigia o `boot` na mão.
As três peças estavam prontas *em isolamento*; nada as compunha em execução
real, então "a fundação está de pé" era verdade em teste e hipótese em campo.

Medido depois de integrar: `partida.estado` = `ready`, supervisor em `ready`,
lifecycle com 4/4 `running` e 0 `failed`, e o portão em **14/14** — não 13/14,
porque a falha do briefing que a sessão anterior reportou como pré-existente era
justamente o falso vermelho que o `navegarAte` já tinha corrigido.

> A metade daquele commit que mexia no `scripts/v2-integracao.mjs` foi
> **descartada**: o `main` já tinha a correção do `npx` *e* estava à frente.
> Trazer o commit inteiro teria reintroduzido os sleeps fixos. Commit antigo é
> matéria-prima, não pacote — confira contra o `main` antes de aplicar inteiro.

O contract test cobre a costura que nenhum teste de unidade alcança, com as
quatro peças reais — o `contract-slice.test.js` faz o mesmo percurso com registro
e decisor falsos, e mock prova o mock (Regra 7).

**Um mutante sobreviveu na primeira rodada.** Removida a poda do
`conhecerModulos`, o teste seguia verde: o `avaliar()` barra por
"não-declarada" mesmo com a concessão ainda guardada. Duas defesas, a primeira
cobrindo a segunda — Regra 1 outra vez. Quem enxerga a poda sozinha é o estado
persistido: sem ela, `exportar()` mantém a permissão e o `importar()` do próximo
arranque a ressuscita sob um manifesto que não a declara mais.

## O ciclo passa pelo Runtime Host antes do `init`

- [x] `running` exige autorização aberta — quem não abre não chega ao `init`
- [x] a ordem do contrato (`open → init → start`, `stop → close → dispose`) é executada
- [x] o entrypoint injeta um Host real; o portão cobra que ele foi consultado

Terceira vez o mesmo padrão, e vale nomear: **peça pronta, testada e desligada.**
Primeiro o `criarPlataforma`, depois o contract test, agora o
`criarLifecycleRuntime` — o Host por módulo. Ele existia, tinha teste próprio, e
a busca textual pelos importadores achou **um** consumidor de produção
(`vertical-slice.js`), que não é o caminho por onde os módulos sobem. O
`ciclo.ts` ia direto ao `init`.

O efeito era um módulo declarado `running` cuja autorização nunca tinha sido
pedida uma única vez. O `V2_LIFECYCLE_RUNTIME_CONTRACT.md` descrevia a ordem
certa desde sempre; ninguém a executava. **Contrato sem executor é intenção** — e
o retrato mentia com todas as luzes verdes, porque peça correta e desligada dá
exatamente o mesmo diagnóstico que peça ligada.

O teto do `init` foi extraído (`comTeto`) e passou a valer para a abertura: um
Runtime que não responde pendura a subida do mesmo jeito que um `init` que trava,
e esse caminho novo não passava por teto nenhum.

**Oito mutantes plantados, oito mortos** — incluindo o mutante que É a doença
original (remover a chamada ao Host: 8 dos 12 testes caem). O portão foi de
14 para **15/15**, e a asserção nova é a única que enxerga o defeito: plantando-o
no entrypoint, as outras 14 seguem verdes e ela devolve `[]`.

> **Grant vazio é autorização disponível.** `militar` declara `NETWORK`, não
> recebe nada e continua subindo — como antes. Tratar "sem permissão concedida"
> como "sem autorização" derrubaria um módulo correto e transformaria
> deny-by-default em deny-tudo. A distinção quase virou defeito ao desenhar isto.

O `--strictPort` entrou no portão junto: sem ele o Vite troca de porta em
silêncio quando a escolhida está ocupada, e o portão mede um servidor zumbi.

## Próximo bloco

- [x] integrar a fachada ao entrypoint oficial da V2
- [x] contract test completo Manifest → Registry → Permission → Runtime
- [x] lifecycle + Runtime Host: módulo só fica `running` quando sua autorização estiver disponível
- [ ] observabilidade de transições `starting/running/stopping`
- [ ] transporte concreto depois do contrato estabilizado
      — o `criarRuntimeStdio` **existe e agora é testado** contra processo real
      (`test/v2/runtime-stdio.test.js`, 9 testes, 7/7 mutantes mortos, e um
      pendura real consertado). A caixa segue **desmarcada de propósito**: nada em
      produção o importa. Ligar exige o app desktop — navegador não spawna
      processo. Ver [`V2_RUNTIME_STDIO.md`](./V2_RUNTIME_STDIO.md).
- [ ] primeiro vertical slice de módulo nativo

## Regra de manutenção

Uma caixa só vira `[x]` quando existe código e teste correspondente. Documentar
uma intenção não conta como implementação.
