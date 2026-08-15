# Baluarte Launcher (desktop)

App desktop em **Electron** do Projeto Baluarte — um *launcher* nativo que abre o
mesmo hub da web, **se atualiza sozinho** e (a partir do M3) roda as versões
pesadas localmente: o **motor real do GitNexus** (`GitNexus-1.6.7/`, Node nativo),
JARVIS com modelos maiores, jogos/3D sem as travas da aba.

> Por que existe: o site é estático no Vercel e não roda o motor Node nativo do
> GitNexus (tree-sitter, LadybugDB, etc.) — limite de Lambda, sem disco, sem
> processo em background. O desktop derrubа essa parede. Plano completo: issue #222.

## Como funciona

- **Conexão com a web:** a janela carrega `https://projeto-baluarte.vercel.app`
  (a mesma UI Vite). O deploy web já é o canal de atualização **instantâneo** da
  interface.
- **Fallback offline:** se a web falhar, cai num build embutido (`resources/web`,
  copiado de `../dist` no empacotamento) e, em último caso, em `offline.html`.
- **Auto-update da casca:** `electron-updater` checa as **GitHub Releases** e
  instala no próximo restart (só no app empacotado).
- **Segurança:** `contextIsolation` ligado, `nodeIntegration` desligado, sandbox,
  navegação/links presos às origens confiáveis. A ponte nativa real entra no M2.

### Casca de launcher (M1)

- **Splash:** janela de abertura (`splash.html`) enquanto o hub carrega; some
  quando a página fica pronta (com trava de segurança de 12s).
- **System tray:** ícone na bandeja com menu (Mostrar / Recarregar / Sair).
  **Fechar a janela minimiza pra bandeja** (estilo launcher) — o app só encerra
  de fato no "Sair". Clique no ícone alterna mostrar/esconder.
- **Deep-link `baluarte://<rota>`:** instância única (`requestSingleInstanceLock`);
  ex.: `baluarte://git-nexus` foca a janela e navega pra `#/git-nexus`. A rota é
  sanitizada antes de entrar na URL.
- **Indicador de conexão:** o preload relata `navigator.onLine`; o estado aparece
  na **bandeja** (tooltip + linha de status) e no **título** da janela. A UI da
  web também pode ler `window.baluarte.isOnline()`.

### Ponte IPC allowlisted (M2)

A fronteira de segurança entre a UI (vinda da web) e o nativo. **Tudo passa por
um funil único** `window.baluarte.invoke(channel, payload)` → canal `baluarte:invoke`
no main (`src/ipc.js`), validado por: remetente = janela principal, `channel` na
**allowlist** explícita, e payload validado por cada handler. O renderer nunca
recebe `ipcRenderer` cru, FS ou `require`.

Canais do M2 (a UI pode usar quando `window.baluarte.native`):

```js
await window.baluarte.invoke('ping');                 // 'pong'
await window.baluarte.invoke('app:info');             // { name, version, platform, arch, online }
await window.baluarte.invoke('app:openExternal', { url: 'https://…' });
await window.baluarte.invoke('app:reload');
```

### Motor real do GitNexus — detecção (M3a)

`src/nexus.js` detecta o **motor real** do GitNexus (servidor Express do pacote
`gitnexus` na porta **4747**): faz `GET /api/health` + `/api/info`. Exposto na ponte:

```js
await window.baluarte.invoke('nexus:status');
// { available, url, version?, nodeVersion?, spawned }
await window.baluarte.invoke('nexus:graph');
// { repo, nodes: GraphNode[], relationships: GraphRelationship[] }  (1º repo analisado)
```

A página `/git-nexus` (no site) usa o `status` pra mostrar um badge: **verde** "motor
real conectado" ou **âmbar** "motor local indisponível — usando o mapa de build". E
usa o `graph` (**M3b**): quando o motor está no ar, o orbe 3D, as comunidades, o
PageRank e o impacto rodam no **grafo REAL** (via `fromEngineGraph` → o mesmo
`analyze()`, sem fork); na web (sem launcher) o badge fica oculto e tudo segue com o
`codemap.json`.

### Subir o motor sozinho (M3c)

A partir do **M3c**, o launcher **sobe o motor por padrão** — não precisa mais
rodar `gitnexus serve` à parte. No boot, `nexus.maybeStart()`:

1. **Já tem motor no ar?** Se algo responde `/api/health` na 4747, só conecta
   (não duplica) — ex.: o operador rodou `gitnexus serve` na mão.
2. Senão, tenta subir `gitnexus serve --port 4747` numa **cadeia de estratégias**,
   na ordem, até uma ficar saudável (polling no `/api/health`):
   | ordem | via | comando |
   |---|---|---|
   | 1 | `env` | `BALUARTE_NEXUS_CMD serve --port 4747` (override do operador) |
   | 2 | `vendored` | Electron-as-Node em `…/gitnexus/dist/cli/index.js` (só se o `dist/` estiver **compilado** — a cópia do repo tem só `src/`) |
   | 3 | `global` | `gitnexus serve …` (depois de `npm i -g gitnexus`) |
   | 4 | `npx` | `npx -y gitnexus@latest serve …` (cold-start mais lento; `GITNEXUS_SKIP_OPTIONAL_GRAMMARS=1`) |

- **Onde o contrato mora:** a porta, a rota de health, os args do `serve` e a janela
  de readiness são **declarados** no bloco `service` do `gitnexus` em
  [`config/ai-tools.json`](../config/ai-tools.json) — o `nexus.js` só lê de lá. Sem o
  manifest (app empacotado sem `config/`), cai nos mesmos valores de antes. A janela
  maior do `npx` é da *estratégia*, não do serviço, e segue no código.
- **Desligar o autostart:** `BALUARTE_NEXUS_DISABLE=1` (a UI ainda detecta um motor
  externo, só não tenta subir um).
- O `stderr` do motor é encaminhado pro console do main (prefixo `[nexus]`) — útil
  pra depurar o aceite local.

> **Pra ter grafo de verdade**, o repo alvo precisa ter sido indexado antes:
> `gitnexus analyze` no repo (registra em `~/.gitnexus/registry.json`); aí
> `/api/repos` e `/api/graph` devolvem o grafo real.

**Aceite local (precisa da máquina):** instale o motor (`npm i -g gitnexus` **ou**
deixe o npx baixar) e indexe um repo (`gitnexus analyze`); abra o launcher; em
`/git-nexus` o badge fica **verde** e o orbe roda no **grafo real**.

> **Todas as funções (M3d, próximo):** o servidor 4747 expõe REST de leitura
> (`/api/graph`, `/api/search`, `/api/processes`, `/api/clusters`) + Cypher cru
> (`POST /api/query`) **e** uma ponte **MCP-over-HTTP** em `POST /api/mcp`
> (JSON-RPC) por onde saem as 16 tools (`context`, `impact`, `detect_changes`,
> `rename`, …) — que **não** têm rota REST direta. O M3d pluga esses tools na
> ponte IPC (`nexus:*`) + um cliente com fallback pro codemap na web.

## Rodar em desenvolvimento

```bash
# na raiz do repo, gere o build web (serve de fallback offline):
npm install && npm run build

# depois, no app desktop:
cd desktop
npm install
npm start          # abre o launcher carregando a produção
```

## Gerar instalador local

```bash
cd desktop
npm run dist        # gera o instalador do SO atual em desktop/release/
```

## Publicar uma versão (dispara o auto-update)

O release é automático via GitHub Actions (`.github/workflows/desktop-release.yml`):
builda Windows/macOS/Linux e publica os instaladores na Release da tag.

```bash
# 1. suba a versão em desktop/package.json (ex: 0.1.1)
# 2. crie e empurre a tag:
git tag desktop-v0.1.1
git push origin desktop-v0.1.1
```

Quem já tem o launcher instalado recebe a atualização no próximo restart.

## Notas

- **Assinatura de código** fica pro M6. Sem assinar: Windows mostra aviso do
  SmartScreen e o **auto-update do macOS não funciona** (Squirrel.Mac exige app
  assinado). Windows e Linux atualizam normalmente mesmo sem assinatura.
- **Ícone:** coloque `build/icon.png` (≥512×512) — o electron-builder deriva os
  ícones de cada plataforma. Sem ele, usa o ícone padrão do Electron.
- **Módulos nativos** (a partir do M3): rodar `electron-rebuild` após instalar.

## Roadmap

Marcos M0→M6 detalhados na issue **#222**. Estado atual: **M0** (esqueleto +
auto-update), **M1** (casca de launcher), **M2** (ponte IPC allowlisted),
**M3a** (detecção do motor + badge), **M3b** (consumo do **grafo real** via
`nexus:graph`) e **M3c** (o launcher **sobe o motor sozinho** — cadeia
override→vendored→global→npx com readiness no `/api/health`; aceite final é
**local**, na máquina). Próximo: **M3d** — plugar **todas as 16 tools** na ponte
IPC via a ponte MCP-over-HTTP (`POST /api/mcp`) + os REST de leitura, com um
cliente que cai no `codemap.json` na web (gate `window.baluarte.native`).
