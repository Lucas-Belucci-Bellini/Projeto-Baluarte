# ADR-003 — O que "congelar a V1" significa na prática

**Data:** 2026-08-09 · **Estado:** aceita · **Contexto:** [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420) · **Depende de:** [ADR-001](./ADR-001-1.0.0-como-ponto-de-congelamento.md)

## O problema

O ADR-001 decidiu que a 1.0.0 é um **ponto de congelamento**. Faltava dizer o que
isso quer dizer no dia seguinte à tag: o que ainda pode entrar no `main`, o que o
app desktop faz, e onde funcionalidade nova passa a morar.

Sem essa regra escrita, "congelado" degrada sozinho. O caminho é conhecido: entra
uma correção, depois uma correção *com uma melhoriazinha junto*, depois uma
funcionalidade "pequena" — e seis meses depois existem duas versões vivas se
desenvolvendo em paralelo, que é exatamente o que o congelamento queria evitar.

## A decisão

### 1. Numeração

A V1 congelada é a **1.0.0**. A V2 será a **2.0.0**.

O `package.json` dizia `2.0.0` — numeração interna do Mark XIII, nunca publicada
(o repositório **não tinha nenhuma tag git**). Renumerado para `1.0.0-rc` durante
a fase de hardening, e vira `1.0.0` no congelamento.

### 2. Depois da tag `v1.0.0`, o `main` recebe só:

- correção de bug;
- correção de segurança;
- atualização de dado (Arsenal, Arma 3, câmbio — os pipelines automáticos seguem);
- documentação.

**Não recebe:** funcionalidade nova, refatoração arquitetural, mudança de
dependência que não seja correção de segurança. Isso tudo vai para a
`architecture/v2`.

### 3. A 1.0.0 é a última versão que o app instala sozinho

> **Correção (mesmo dia).** A primeira redação desta seção dizia "o app trava na
> linha 1.x: recebe correção, não recebe funcionalidade". Isso registrava mal a
> decisão do operador, que é outra e mais precisa: **o auto-update termina na
> 1.0.0**. Depois dela, instalar é escolha de quem usa. Corrigido aqui em vez de
> num ADR novo porque nunca chegou a valer — não é reversão de decisão em vigor,
> é conserto de registro.

O Baluarte Launcher se auto-atualiza (`electron-updater`, `autoDownload = true`,
checagem a cada 2 h). A partir da 1.0.0:

- `autoDownload` passa a **`false`**. O app ainda **avisa** que existe versão
  nova — avisar é serviço —, mas só baixa se mandarem. Baixar sozinho é decidir
  pelo outro, e o que vem depois da 1.0.0 é código novo.
- O botão padrão do aviso é **"Agora não"**. Quem não decidir nada fica onde
  está, que é o comportamento seguro.
- Instalar a V2 é **por conta e risco**, dito com essas palavras na caixa de
  diálogo.

### 3b. O app aponta para um endereço fixado da 1.x

Consequência que quase passou batido: o launcher **não embute conteúdo**, ele faz
`loadURL` do site ao vivo. Existem portanto **dois** canais de atualização, e
desligar o auto-update fecha só um. Se a V2 subir no mesmo endereço, o app
"congelado na 1.0.0" passa a mostrar a V2 sem instalar nada — e o congelamento
vira enfeite.

Por isso o app precisa ficar preso à linha 1.x. **Mas a primeira tentativa de
fazer isso estava errada, e o erro merece ficar registrado**, porque ele quase
entrou na release.

#### ⛔ Correção: quem muda de endereço é a V2, não a V1

A versão original deste ADR mandava o app apontar para
`v1.projeto-baluarte.vercel.app`. Isso era um **apagador de dados silencioso**.

`localStorage` é escopado por **origem**, e `projeto-baluarte.vercel.app` e
`v1.projeto-baluarte.vercel.app` são origens diferentes. O app publicado hoje
(0.9.2) aponta para o endereço principal. Quem atualizasse para a 1.0.0
encontraria as **71 chaves vazias**: abas do editor, conversas e memórias do
JARVIS, histórico do terminal e o cofre de chaves de API (`apis:vault`). Sem
erro, sem aviso, sem desfazer — pareceria que o app apagou tudo. O pior modo de
falha possível numa versão chamada "ponto de congelamento".

A decisão corrigida inverte quem se muda:

| | Endereço | Por quê |
| --- | --- | --- |
| **V1 (congelada)** | `projeto-baluarte.vercel.app` | é onde o dado dos operadores **já está** |
| **V2 (reconstrução)** | endereço próprio (`v2.` ou domínio novo) | nasce limpa, sem herdar origem |

O pin continua valendo — o app fica na V1 porque a V1 é que fica parada no
endereço dele. E a V2, sendo reconstrução arquitetural e não evolução, tem
motivo independente para nascer em outra origem: ela não quer o `localStorage`
da V1 no formato da V1.

⚠️ **Consequência aceita:** o endereço principal serve a V1 até o operador
decidir promover a V2. Enquanto isso, quem chega pelo navegador vê a V1. Trocar
essa ordem depois exige plano de migração — ponte entre origens (iframe +
`postMessage`) ou exportar/importar —, e é decisão do operador, não da sessão.

**O site continua recebendo correções da 1.x** — quem abre o navegador escolheu
isso ao digitar a URL. A distinção original permanece: *no site você escolhe a
cada visita; no app você escolheu uma vez, ao instalar.*

### 4. A régua para decidir o que entra na 1.x

Quando não estiver claro se algo entra na 1.x ou vai para a V2:

> **Isso conserta algo que está quebrado na 1.0.0, ou adiciona algo que ela nunca
> teve?**

Conserta → 1.x. Adiciona → V2. Não existe terceira resposta, e "é rapidinho" não
é argumento — o custo do congelamento não é o tamanho da mudança, é ter duas
versões vivas ao mesmo tempo.

## Por quê

**Uma linha-base só serve enquanto for estável.** O valor da 1.0.0 é poder dizer
"temos isto funcionando" quando a V2 der problema. Uma 1.0.0 que continua
recebendo funcionalidade não é linha-base, é uma segunda frente de trabalho — e
duas frentes ao mesmo tempo é como as versões Mark anteriores quebraram.

**Parar o auto-update é o que torna o congelamento real para quem usa.** Se o
launcher continuar puxando tudo que entra na produção, "congelado" vira só uma
palavra no repositório: o operador segue recebendo mudança que não pediu. E a
troca é assimétrica — quem quer a V2 tem trabalho de um clique; quem não quer,
sem esta regra, não teria escolha nenhuma.

## Consequências

- Precisa existir a tag `v1.0.0`. Sem ela não há para onde voltar, e a decisão do
  ADR-001 fica sem objeto.
- A branch `architecture/v2` abre **depois** da tag, não antes (ver o gate em
  [`../v2-vision.md`](../v2-vision.md)).
- Ideia de funcionalidade que aparecer durante o congelamento vai para a
  [#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422),
  não para o `main`.
- O `desktop/package.json` tem versionamento próprio (`0.9.2`) e precisa de uma
  sessão **local** para alinhar e publicar a release da 1.0.0 — está na fila de
  [`../../HANDOFF-LOCAL.md`](../../HANDOFF-LOCAL.md).
- **O alias `v1.` precisa existir na Vercel antes de a 1.0.0 do app ser
  publicada.** Se o app sair apontando para um endereço que não resolve, ele não
  abre. Por isso `ALLOWED_ORIGINS` mantém também o endereço principal durante a
  transição, e `BALUARTE_URL` permite apontar para um deploy de teste sem editar
  código.
- A mudança do `autoDownload` só tem efeito no app **empacotado**: ela precisa
  estar DENTRO da release 1.0.0. Se sair depois, a 1.0.0 ainda terá auto-update e
  a regra começa uma versão atrasada.
- Três arquivos carregam o número da versão (`package.json`, `src/data/version.js`,
  `public/sw.js`) e não conseguem se importar. `test/versao.test.js` cobra que
  concordem — a divergência do Service Worker já causou "cache velho servido após
  deploy" duas vezes.

## O que revogaria esta decisão

Descobrir na 1.0.0 um defeito cuja correção **exige** mudança arquitetural. Aí a
correção não cabe na regra da seção 4, e é preciso escolher explicitamente entre
antecipar parte da V2 ou conviver com o defeito — com ADR novo dizendo qual foi.
