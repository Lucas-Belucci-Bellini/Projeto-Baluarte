# ⬡ IA do Baluarte — Plano de Construção

Este diretório reúne, em 10 documentos, **tudo o que foi discutido** sobre
criar a IA embarcada do Projeto Baluarte (o "núcleo Mark XIII"). É um plano
de referência — nada aqui é código de produção ainda. Serve para você
**não se perder nas atualizações** e decidir o que construir e em que ordem.

> Idioma: tudo em português. Stack do site: **JavaScript puro + Vite 5**,
> hospedado na Vercel, ~42 rotas/ferramentas. Qualquer solução de IA precisa
> respeitar essa stack (sem framework, sem TypeScript).

---

## A estratégia (decisão do Lucas)

**A IA é a ÚLTIMA coisa a ser construída.** Primeiro terminamos todas as
funções do site; só quando não houver mais nada pendente é que começamos a
IA. Motivo: evitar que a IA interfira em funções que ainda estão sendo
feitas. A IA nasce já "enxergando" um site pronto e estável.

Quando chegar a hora, a IA não será um chatbot qualquer — será um
**agente** que:

1. **Lê** o estado de todas as funções do site (sem quebrar nada).
2. **Controla** as ferramentas do site (cria circuitos no Logic Sim, escreve
   no Editor, gera QR, etc.) via *function calling*.
3. **Raciocina em 3 camadas**: tenta resolver com o próprio site → busca na
   internet → deduz uma hipótese viável com base em evidências.
4. Pode ter a **memória apagada** pelo usuário quando quiser.

---

## Os 10 documentos

| # | Arquivo | Assunto |
|---|---|---|
| 0 | `README.md` | Este índice + estratégia + roadmap |
| 1 | `01-conceitos-e-abordagem.md` | Criar IA do zero vs. usar agente; Python + JS |
| 2 | `02-chat-conversacional.md` | A base: chat com histórico e streaming |
| 3 | `03-ia-no-navegador-webllm.md` | **Método 1** — rodar a IA 100% no navegador (WebLLM) |
| 4 | `04-servidor-python-e-busca-web.md` | **Método 2** — servidor Python + busca na web |
| 5 | `05-criador-de-codigo.md` | Evoluir o chat para um criador de código |
| 6 | `06-agente-e-ferramentas.md` | Agente que controla as funções do site (tools) |
| 7 | `07-estado-global-e-leitura-segura.md` | Ler as 20+ funções sem quebrar o site |
| 8 | `08-raciocinio-3-camadas.md` | Site → Internet → Dedução viável |
| 9 | `09-esteganografia.md` | Ferramenta de esteganografia (ideia separada) |

---

## Ordem de construção sugerida (quando a IA começar)

1. **Decidir o motor** → docs 3 e 4. Sem API externa (WebLLM no navegador) é
   o caminho preferido; servidor Python com Gemini é o plano B mais capaz.
2. **Chat base** → doc 2. Histórico + streaming + botão "apagar memória".
3. **Criador de código** → doc 5. Realce de sintaxe + prompt de engenheiro.
4. **Ponte de ferramentas** → docs 6 e 7. Catálogo de funções + estado global
   de leitura. É aqui que a IA vira agente do Baluarte.
5. **Raciocínio em camadas** → doc 8. Prompt do sistema + lógica de fallback.
6. **Esteganografia** (doc 9) é independente: pode entrar a qualquer momento
   como mais uma ferramenta do Hub.

---

## Estado atual do site (referência)

- Punch-list do `PROXIMOS-PASSOS.md` **concluída** (Rádio Online, Hub
  expandido, QR Studio, Find & Replace, auditoria do Terminal, Logic Sim
  com flip-flops, Color Studio, code-splitting).
- O Hub já tem um card de IA: **J.A.R.V.I.S.** (`/jarvis`) e **IA
  Proprietária Mark 11** (`/ia-proprietaria`) — pontos de partida naturais
  para plugar o agente real descrito aqui.

> Próximo passo: o Lucas revisa estes docs e diz o que construir primeiro.
