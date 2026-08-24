# Contrato — o Núcleo sabe o que toca sem passar pelo Spotify

**Data:** 2026-08-24
**Escopo:** o app (o Launcher). Na web esta capacidade **não existe**, por desenho.
**Implementação:** `desktop/src/musica.js`, `desktop/src/ipc.js`,
`src/utils/jarvis-musica-nativa.ts`, `src/utils/jarvis-music-presence.ts`,
`src/pages/jarvis.ts`

## O problema que isto resolve

> *"por algum motivo mesmo eu sendo redirecionado eu não consigo conectar ao
> spotify"* — e, a seguir: *"acho que criar algo que faça isso funcionar seria
> legal"*.

O handshake do Spotify **está correto**. Foi exercitado ponta a ponta em
navegador: o pedido sai com `S256`, `client_id`, `scope` e `redirect_uri`
certos; a volta troca o código por token; o poll do player responde; o
distintivo vira `SPOTIFY · ONLINE`.

O que trava não é código deste repositório. É configuração de terceiro:

1. uma conta Spotify,
2. um app registado no dashboard,
3. e — enquanto esse app estiver em **Development mode** — a conta do operador
   explicitamente listada em **User Management** (limite de 25).

Nenhuma linha daqui resolve (3). Enquanto ela faltar, o Núcleo não sabe o que
toca, e melhorar a mensagem de erro apenas explica melhor a mesma parede.

## A saída: o sistema já sabe

O Windows mantém o **SMTC** (System Media Transport Controls) — o cartão de
mídia que aparece no volume e responde às teclas de mídia do teclado. Qualquer
aplicação que toque som publica ali: o Spotify de desktop, o Spotify no
navegador, o YouTube, o VLC, o player do próprio Windows.

Ler o SMTC dá título e artista do que está tocando **agora**, seja qual for a
origem, **sem conta, sem OAuth, sem allowlist**. E cobre mais fontes do que o
caminho do Spotify jamais cobriria — ele só sabe do Spotify.

| | Spotify Web API | SMTC |
|---|---|---|
| precisa de conta | sim | **não** |
| precisa de app registado | sim | **não** |
| Development mode bloqueia | **sim** | não |
| cobre outros players | não | **sim** |
| onde funciona | web e app | **só o app**, só Windows |

As duas convivem. O Spotify continua a ser o único caminho na **web**, e quem
quiser a sessão dele continua a tê-la. No **app**, quando o SMTC responde, ele
ganha: é a fonte que reflete o que o operador está mesmo a ouvir.

## Como atravessa

```
PowerShell (WinRT)  →  desktop/src/musica.js  →  IPC 'musica:agora'
                                                       ↓
              src/utils/jarvis-musica-nativa.ts  (poller, 5 s)
                                                       ↓
                    presença global  +  src/pages/jarvis.ts
                                                       ↓
                              publicarPresencaMusical → <iframe> do V7
```

O Núcleo V7 **não muda**: ele já consumia `baluarte-presenca-musical` desde a
1.3.6, e é isso que faz o botão `♪ música` nomear a faixa e ir atrás do som do
sistema. Trocou-se **quem alimenta** a presença, não o que ela é.

### O script do WinRT

`GlobalSystemMediaTransportControlsSessionManager` é assíncrono e devolve
`IAsyncOperation`, que o PowerShell não sabe esperar sozinho — daí o `Await`
construído por reflexão sobre `WindowsRuntimeSystemExtensions.AsTask`. É o
caminho canónico; não há atalho mais curto.

Duas decisões que parecem detalhe e não são:

- **`-EncodedCommand`, não `-Command`.** O script vai em UTF-16LE/base64. Passá-lo
  como texto exigiria escapar aspas, crases e `$` através de duas camadas (JS e
  PowerShell) — a fonte clássica de um script que funciona no terminal e quebra
  empacotado. Codificado, não há nada para escapar. O nome do tipo genérico
  (`IAsyncOperation` + crase + `1`) depende disto para chegar inteiro.
- **Falha sempre em JSON.** Quem chama precisa distinguir *"não há sessão"* de
  *"este Windows não expõe o SMTC"* de *"deu erro"*, e um `stderr` cru não
  permite isso.

### O poller

Pergunta de 5 em 5 s, **só enquanto a rota `/jarvis` estiver aberta** — sair
desmonta. Emite **apenas quando muda**: quem ouve repinta a interface e reenvia a
presença para dentro do quadro, e emitir a cada ciclo faria o mesmo trabalho
cinco vezes por minuto sem nada de novo para dizer.

O ciclo **não se sobrepõe a si mesmo**: cada volta é agendada quando a anterior
termina. Com `setInterval`, uma sonda lenta acumularia chamadas até o PowerShell
disputar consigo próprio.

## O que não atravessa

Só metadado: **título, artista, estado e qual app é a fonte**. Nunca áudio, e
nunca comandos de reprodução — não há como o Baluarte pausar ou pular a sua
música por aqui.

O espectrómetro continua a vir da **captura do sistema** (`getDisplayMedia`,
1.3.6), que é outra coisa e pede consentimento próprio. As duas juntas são a
resposta inteira à queixa original: o SMTC dá o **nome**, a captura dá a **forma
de onda**.

## Verificação

`test/v2/jarvis-musica-nativa.test.js` cobra: a sonda degrada fora do Windows em
vez de estourar; o diagnóstico não inventa saída; o script sobrevive à
codificação **com o nome do tipo genérico literal e os estados 4/5 do enum**; o
que vem do processo principal é tratado como desconhecido; um `playback`
inexistente vira `unknown`; o monitor avisa só na mudança, cala ao parar, e não
se sobrepõe; sem a ponte, a resposta diz onde a capacidade mora.

Observação de navegador com a ponte nativa **simulada** (o que o preload do
Electron expõe): o distintivo vai a `SISTEMA · TOCANDO`, a linha mostra
`♪ Ainda Assim · Anavitória (Spotify.exe)`, e a presença global fica
`{ source: 'sistema', playback: 'playing', title: 'Ainda Assim' }`.

### ⚠️ O que **não** foi verificado

**A leitura real do WinRT.** Esta sessão corre em Linux; o SMTC exige Windows.
O que está exercitado é tudo à volta — a degradação, a travessia da ponte, o
poller, a interface e a forma do script. O `powershell.exe` a devolver a faixa
verdadeira é o único elo que só a máquina do operador prova.

Por isso existe o canal `musica:diagnostico`: devolve o `stdout`, o `stderr` e o
código de saída crus. Se não funcionar, é ele que diz porquê — sem ele, a falha
chegaria como "não funcionou" e nada mais.
