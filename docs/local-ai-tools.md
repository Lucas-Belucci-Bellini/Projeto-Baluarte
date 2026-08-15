# Ferramentas locais de IA

Repositórios externos que o Baluarte usa na máquina do operador — motor de
grafo, agentes, CLIs. Eles **não entram no versionamento**: o repo guarda o
manifest, os scripts e os pontos de integração; os clones ficam em
`.baluarte/tools/`, ignorado pelo git.

> Por que assim: `GitNexus-1.6.7/` (139 MB) e `Humanity always first/` (172 MB)
> já foram copiados pra dentro deste repositório. O histórico carrega os dois
> pra sempre, e o build da Vercel tentava empacotá-los até estourar o limite de
> 245 MB da Lambda. Ferramenta externa se **instala**, não se versiona.

## Comandos

```bash
npm run tools:status                      # o que está instalado, em que commit
npm run tools:sync                        # clona/atualiza todas
npm run tools:sync -- gitnexus            # só uma
npm run tools:sync -- gitnexus --setup    # + passos locais (npm install, build…)
```

`tools:sync` clona quando não existe e roda `git pull --ff-only` quando existe —
se o clone local divergiu, ele para e avisa em vez de fazer merge por conta
própria. Os passos de `setup` ficam atrás da flag porque compilar custa minutos
e gigabytes; clonar não.

`tools:status` compara o `installedCommit` do manifest com o que está no disco:

| estado | significa |
|---|---|
| `ok` | clone limpo, no commit registrado |
| `sujo` | há alteração local não commitada no clone |
| `movido` | commit no disco ≠ manifest (atualize o manifest se foi de propósito) |
| `FALTA` | nunca instalado — o comando sai com código 1 |

## Onde os clones ficam

`.baluarte/tools/<id>`, ancorado na raiz do repositório **principal**. Isso
importa porque o Baluarte também é aberto de worktrees (`.claude/worktrees/…`):
sem essa âncora, cada worktree clonaria os mesmos gigabytes de novo e um
GitNexus já compilado de um lado apareceria como `FALTA` do outro.

Para mudar o lugar: `BALUARTE_AI_TOOLS_DIR` (veja `.env.tools.example`).

## Ferramentas instaladas

### GitNexus

O motor real do grafo de código — o mesmo que a página `/git-nexus` e o
Baluarte Launcher consomem quando rodam no app (#222, M3a–M3c).

- Repositório: <https://github.com/abhigyanpatwari/GitNexus.git>
- Clone: `.baluarte/tools/gitnexus`
- CLI compilada: `.baluarte/tools/gitnexus/gitnexus/dist/cli/index.js`
- Porta do servidor: `4747`

```bash
npm run tools:sync -- gitnexus --setup   # instala e compila
npm run nexus:analyze                    # indexa ESTE repositório
npm run nexus:serve                      # sobe o motor na 4747
npm run nexus:local -- status            # estado do índice
```

O `analyze` grava o índice em `.gitnexus/` (ignorado) e mantém o bloco
`<!-- gitnexus:start -->…<!-- gitnexus:end -->` no `CLAUDE.md`, o `AGENTS.md` e
as skills em `.claude/skills/gitnexus-*` — esses **são** versionados, porque são
o contrato de uso pro agente, não o índice.

O launcher desktop procura o motor nesta ordem (`desktop/src/nexus.js`):

1. `BALUARTE_NEXUS_CMD` — override explícito do operador
2. cópia local compilada (`BALUARTE_GITNEXUS_DIR` ou `.baluarte/tools/gitnexus/gitnexus`)
3. binário global `gitnexus` no PATH
4. `npx -y gitnexus@latest`

**Limitação conhecida no Windows:** a extensão FTS/BM25 da LadybugDB não carrega
sem o *Visual C++ 2015-2022 Redistributable x64* e o *OpenSSL 3*. O índice e o
grafo funcionam; só a busca textual fica desligada. Depois de instalar os
runtimes, rode `npm run nexus:local -- analyze --repair-fts`.

## Regras

- `.baluarte/` e `.gitnexus/` são ignorados — não force nada pra dentro do git.
- Capacidade nova (comando, porta, variável) se declara **no manifest**, não
  espalhada por scripts.
- Chave/token vai pro `.env` (ignorado). O `.env.tools.example` só lista nomes.
- Instalou ou atualizou uma ferramenta? Commit pequeno, com o `installedCommit`
  do manifest batendo com o disco.
