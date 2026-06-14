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
auto-update) e **M1** (casca de launcher: splash, tray, deep-link, conexão).
Próximo: **M2** (ponte IPC allowlisted) e **M3** (motor real do GitNexus no main).
