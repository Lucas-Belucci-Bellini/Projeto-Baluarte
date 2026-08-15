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

### Hermes Agent (Nous Research)

O agente que inspirou o modo `hermes-agente` do JARVIS e as skills
auto-criadas de `src/utils/jarvis-skills.js` (ver `docs/JARVIS-SKILLS.md`).
Fica instalado como referência viva e como servidor MCP local (`mcp_serve.py`).

- Repositório: <https://github.com/NousResearch/hermes-agent.git>
- Clone: `.baluarte/tools/hermes-agent` · venv: `.baluarte/venvs/hermes-agent`
- Versão instalada: `0.20.1` (Python 3.11.9)

```bash
npm run tools:sync -- hermes-agent --setup
npm run hermes -- --help
npm run hermes -- doctor
```

Três decisões que valem registro:

1. **O venv fica fora do clone.** O próprio README avisa: um venv dentro da
   árvore em que o agente opera pode ser apagado por um comando de caminho
   relativo do próprio agente, matando o runtime em pleno voo.
2. **Python 3.11 explícito.** O projeto exige `>=3.11,<3.14` e o `python`
   padrão desta máquina é 3.14 — sem fixar a versão, o install falha.
3. **Sem o instalador oficial.** O `iex (irm …/install.ps1)` baixa Python,
   Node, ffmpeg e um Git portátil para `%LOCALAPPDATA%`. Aqui usamos o caminho
   manual documentado no README, que não mexe na máquina inteira.

Instalado só com as dependências base. Os extras (voz, provider Anthropic
nativo) são opcionais:

```bash
uv pip install --python .baluarte/venvs/hermes-agent/Scripts/python.exe -e ".[all,dev]"
```

### OpenClaw

Assistente self-hosted. Esta é a peça que **faltava**: o Baluarte já tinha o
modo `openclaw` no JARVIS (`src/utils/jarvis-engine.js`), a ponte
`scripts/openclaw-bridge.mjs` e o `docs/OPENCLAW.md` — tudo apontando para um
gateway em `127.0.0.1:18789` que não existia na máquina.

- Repositório: <https://github.com/openclaw/openclaw.git>
- Clone: `.baluarte/tools/openclaw` · versão `2026.8.1`
- Gateway: `127.0.0.1:18789` · ponte do Baluarte: `127.0.0.1:18790`

```bash
npm run tools:sync -- openclaw --setup   # pnpm install + build (obrigatório)
npm run openclaw -- --help
npm run openclaw:gateway                 # sobe o gateway na 18789
npm run openclaw:bridge                  # sobe a ponte do Baluarte na 18790
```

**O build não é opcional.** Sem `dist/entry.mjs`, o CLI responde `--version` e
morre em qualquer subcomando com `missing dist/entry.(m)js`. Foi assim que este
clone se comportou antes de `pnpm build` — `--version` funcionando dá uma falsa
sensação de instalado.

`pnpm` não está instalado globalmente aqui; os passos de setup usam `corepack`,
que baixa a versão exata fixada em `packageManager` sem criar shim global.

Ligando no JARVIS: o modo `openclaw` aceita a URL nas configurações. Aponte para
`http://localhost:18789` (gateway direto) ou `http://localhost:18790` (ponte),
que é o caminho recomendado quando houver token — a ponte lê
`OPENCLAW_GATEWAY_TOKEN` do processo local e **nunca** expõe a credencial ao
navegador. Detalhes em [`OPENCLAW.md`](OPENCLAW.md).

### Claude Code Terminal (plugin do Obsidian)

Terminal embutido com Claude Code dentro do Obsidian. A raiz deste repositório
**é** um vault, então o plugin entra ao lado dos que já estão lá
(`claude-code-ide`, `claude-sessions`, `claude-sidebar`…).

- Repositório: <https://github.com/dternyak/claude-code-terminal.git>
- Clone: `.baluarte/tools/claude-code-terminal` · versão `1.0.1`
- Instalado em: `.obsidian/plugins/claude-code-terminal/`

```bash
npm run tools:sync -- claude-code-terminal --setup   # instala, compila e copia pro vault
npm run obsidian:plugin -- claude-code-terminal      # só recopia o artefato
```

Depois: **Obsidian → Configurações → Plugins da comunidade → ativar**. Precisa
do CLI do Claude Code instalado; é desktop-only (`isDesktopOnly: true`).

O que entra no git e o que não entra:

| arquivo | versionado? | por quê |
|---|---|---|
| `main.js`, `manifest.json`, `styles.css` | sim (~457 KB) | é o padrão dos outros plugins do vault |
| `node_modules/node-pty` | **não** (64 MB) | binário nativo regenerável; `node_modules/` é a 1ª linha do `.gitignore` e casa em qualquer profundidade |

O `node-pty` precisa mesmo ficar ali: o plugin o resolve em
`<pasta do plugin>/node_modules/node-pty` (`src/main.ts:165`), não pelo
`require` normal — ele é `external` no esbuild. A máquina não tem toolchain
MSVC, mas o pacote traz prebuilds para win32-x64, então nada é compilado.

Detalhe do npm 11: install-scripts vêm bloqueados por padrão, e o esbuild
precisa do dele para baixar o binário da plataforma — daí o
`npm approve-scripts esbuild` nos passos de setup.

### Claude Code (repositório público)

**Referência, não instalação.** `anthropics/claude-code` não tem `package.json`:
é o repositório público de plugins, exemplos e CHANGELOG. A CLI é distribuída à
parte e já está nesta máquina (`claude --version` → 2.1.177) — clonar isto não
a instala nem a atualiza.

- Repositório: <https://github.com/anthropics/claude-code.git>
- Clone: `.baluarte/tools/claude-code` · sem build

O que vale olhar de lá:

| pasta | conteúdo |
|---|---|
| `plugins/` | plugins oficiais: `code-review`, `feature-dev`, `hookify`, `plugin-dev`, `agent-sdk-dev`, `frontend-design`… |
| `examples/` | referências de `hooks`, `settings`, `gateway` e `mdm` — aplicáveis ao `.claude/` deste repo |
| `CHANGELOG.md` | o que muda a cada versão da CLI |

### OpenAI Codex (fonte)

**Fonte, não instalação.** A CLI já está nesta máquina (`codex --version` →
`codex-cli 0.125.0`) e é o que o operador usa; o clone traz o código —
workspace Rust (`codex-rs/`) e wrapper npm (`codex-cli/`).

- Repositório: <https://github.com/openai/codex.git>
- Clone: `.baluarte/tools/codex` · sem build

**Não foi compilado, de propósito:** `cargo` não existe nesta máquina, e
instalar toolchain Rust é mudança de máquina, não de repositório — decisão do
operador. Se for compilar: `cargo build --release` em `codex-rs/`. O mesmo
`cargo` destrava o `npm run v2:runtime` deste repo, que hoje também não roda
por falta dele.

Por que manter o fonte por perto: o [ADR-004](architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md)
define **Rust** para o Core de Runtime da V2, e o `codex-rs` é uma
implementação madura exatamente desse tipo de processo local. `docs/config.md`
e `docs/agents_md.md` documentam o formato de configuração que já existe em
`~/.codex` nesta máquina.

## Regras

- `.baluarte/` e `.gitnexus/` são ignorados — não force nada pra dentro do git.
- Capacidade nova (comando, porta, variável) se declara **no manifest**, não
  espalhada por scripts.
- Chave/token vai pro `.env` (ignorado). O `.env.tools.example` só lista nomes.
- Instalou ou atualizou uma ferramenta? Commit pequeno, com o `installedCommit`
  do manifest batendo com o disco.
