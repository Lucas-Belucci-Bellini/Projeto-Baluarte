# Contrato — o Núcleo é o palco; a conversa e o config são camadas

**Data:** 2026-08-24
**Escopo:** a rota `/jarvis` no app (o Launcher). A web não muda de forma.
**Implementação:** `project V2/Modelar objeto 3D/jarvis-nucleo-v7.{html,ts,js}`,
`src/utils/jarvis-v7-visual.ts`, `src/pages/jarvis.ts`, `src/styles/fase19.css`

## O defeito

> *"tem como deixar essa parte de forma que ela fique dentro e seja ativável
> pelos botões do jarvis […] mas sem descer criar mais página para baixo como
> está agora"*

No app, `/jarvis` empilhava três blocos: o Núcleo V7, depois a barra de estado
com o botão `⚙ Modos & Config`, depois a conversa. A página crescia para baixo e
o 3D — que é a superfície principal — virava o cabeçalho de outra coisa. Rolar
para conversar é o sintoma; o defeito é de composição.

## O contrato agora

A rota monta um **palco**: o Núcleo ocupa a área de conteúdo inteira, e as duas
superfícies do JARVIS flutuam **por cima** dele, uma de cada vez.

| superfície | o que traz | como abre |
|---|---|---|
| `conversa` | sessões, nova conversa, mensagens, campo e envio | `◈ conversa` no HUD (atalho `c`) |
| `config` | barra de estado (modo, memória, skills) e o painel de modos, incluindo o Spotify | `⚙ config` no HUD (atalho `g`) |

Premir o botão que já está aceso fecha — é o que um `aria-pressed` promete. `Esc`
fecha a que estiver aberta. O painel é uma **gaveta à esquerda**, com largura
`min(560px, 100% - 230px)`: a coluna de ações do V7 fica livre no canto superior
direito, porque são aqueles botões que abrem e fecham isto.

## A parte que não é óbvia: o Núcleo não abre nada

O V7 vive num `<iframe>` e não sabe o que é uma sessão de chat. Se os botões
fossem implementados lá, o artefato 3D — que também roda sozinho, fora do
Baluarte — ganharia dependência de coisas que não existem nele.

Então a divisão é esta:

1. **A página declara o que tem.** `publicarSuperficies({ conversa, config })`
   manda `baluarte-superficies` para dentro do quadro; os botões só saem do
   `hidden` para as superfícies declaradas. O app declara as duas; **a web não
   declara nenhuma**, e lá os botões continuam invisíveis.
2. **O Núcleo apenas avisa.** Premir um botão envia
   `{ source: 'baluarte-nucleo-acao', acao }` ao pai, same-origin e com
   `targetOrigin` fechado. Nada mais acontece do lado de dentro.
3. **A página abre, e devolve o estado.** `publicarSuperficieAberta(qual)` manda
   `baluarte-superficie-estado`, e o botão acende. Sem esse retorno, o clique
   pareceria inerte.

A oferta e o estado ficam guardados e são **reenviados no `load`** do quadro: um
reload do iframe deixaria, sem isso, os botões escondidos com a conversa aberta
atrás deles.

## Quando o Núcleo não sobe

Os botões moram dentro do V7. Se o three.js não chegar, eles não existem — e o
app ficaria sem conversa, sem aviso. A tira `.jv-palco__socorro` traz os mesmos
dois botões fora do quadro e aparece **somente** quando o visual entra em
`fallback`.

## A altura é medida, não calculada

`calc(100vh - cabeçalho - padding)` erra aqui porque o que fica acima do palco
varia — a faixa "V2 em construção" é dispensável pelo operador, e o padding do
shell entra na conta. Medido em navegador, o erro era de **39 px**: o bastante
para a página ganhar a barra de rolagem que o palco existe para não ter.

`ocuparAlturaRestante()` mede `getBoundingClientRect().top` contra
`window.innerHeight` e escreve `--palco-altura`. Remede em `resize`, num
`ResizeObserver` do corpo e em quatro instantes escalonados até o layout
assentar — a guarda de igualdade torna as remedições supérfluas gratuitas e
impede o observador de se realimentar. A função devolve o disposer, e as duas
páginas o chamam ao sair da rota.

## Um resto conhecido, que não é deste palco

A página ainda rola **40 px**, e a causa é anterior e global: `.shell` tem
`min-height: 100vh` e fica **abaixo** da faixa de 40 px do topo, então o
documento mede 940 px numa janela de 900. Isso vale para todas as 99 rotas, não
só para esta. A correção é de uma linha no `layout.css`, mas mexe no shell de
tudo — fica registrada aqui em vez de entrar de carona numa mudança de `/jarvis`.

Medido depois desta mudança: `.page-jarvis` termina em 886 px numa janela de
900 px. O palco cabe; o excesso é só o do shell.

## Verificação

`test/v2/jarvis-palco.test.js` cobra: os botões nascem escondidos; só aparecem
com a declaração do pai; o artefato não contém nada de chat; a ponte valida
origem e remetente; a oferta e o estado são reenviados no `load`; o app monta
camada em vez de empilhar (e a conversa **deixou** de ser o último filho da
página); premir de novo fecha; o `Esc` fecha e o ouvinte é solto ao sair; existe
saída quando o V7 falha; a altura é medida e o palco não estica além dela.

Observação de navegador, com o app simulado (`window.baluarte.native`): abrir
pela ação vinda de dentro do quadro acende `aria-pressed` no botão certo, trocar
de superfície fecha a anterior, premir de novo fecha, `Esc` fecha, e
`--palco-altura` estabiliza em 766 px com `.page-jarvis` terminando em 886 px.
