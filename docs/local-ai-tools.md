# Ferramentas locais de IA

Este playbook instala repos externos fora do versionamento, em `.baluarte/tools`,
e versiona somente o manifest, scripts e pontos de integracao do Baluarte.
Assim cada ferramenta pode ser atualizada com `git pull --ff-only` sem criar
submodulos fantasma nem mandar caches/builds para o GitHub.

## Comandos

```bash
npm run tools:sync -- gitnexus
npm run tools:sync -- gitnexus --with-setup
npm run tools:status
npm run tools:status -- --remoto
npm run tools:status -- --remoto --estrito
npm run motores:empacotar
```

`tools:sync` clona o repo se ele ainda nao existir e roda `git pull --ff-only`
quando ja existe. O flag `--with-setup` executa os passos locais declarados no
manifest, como `npm install` em pacotes internos.

### Esta atualizado?

`tools:status` responde tres perguntas que e facil confundir:

| coluna | pergunta |
| --- | --- |
| `state` | o clone tem edicao solta (`dirty`) ou esta limpo? |
| `pin` | o commit da maquina bate com o `installedCommit` do manifest? |
| `remoto` | saiu commit novo no origin? (so com `--remoto`, precisa de rede) |

`pin: divergiu` quer dizer que a maquina **nao** esta no commit que o repo
declara suportar — ou o manifest envelheceu, ou o clone andou. `--estrito` faz
o comando sair com codigo != 0 quando algo divergiu, atrasou ou nem esta
instalado, que e o formato util para CI. Sem `--estrito` ele so relata.

### Empacotar para o instalador

`motores:empacotar` encena o motor compilado em `desktop/engine/<id>/`, que o
electron-builder leva em `extraResources`. **Nao vai para o git** (o gitnexus
sozinho da ~460 MB): e artefato de build, reconstruido pelo comando.

Ele **copia** a arvore de `node_modules` ja instalada em vez de reinstalar,
porque `@ladybugdb/core` nao tem prebuilt para esta plataforma e cairia em build
nativo, que exige MSVC. Os `optionalDependencies` pesados (~396 MB) sao podados.

## GitNexus

- Repo: <https://github.com/abhigyanpatwari/GitNexus.git>
- Clone local: `.baluarte/tools/gitnexus`
- CLI buildada: `.baluarte/tools/gitnexus/gitnexus/dist/cli/index.js`
- Porta do motor: `4747`

Fluxo local:

```bash
npm run tools:sync -- gitnexus --with-setup
npm run nexus:analyze
npm run nexus:serve
```

O launcher desktop procura o motor nessa ordem: `BALUARTE_NEXUS_CMD`, copia
vendorizada buildada, binario global `gitnexus` e, por fim, `npx gitnexus`.
A variavel `BALUARTE_GITNEXUS_DIR` pode apontar diretamente para o pacote CLI
local caso a pasta mude.

## Politica de versionamento

- `.baluarte/` e `.gitnexus/` ficam ignorados.
- `config/ai-tools.json` registra repos, caminhos e comandos reproduziveis.
- `scripts/sync-ai-tools.mjs` e `scripts/ai-tools-status.mjs` sao a interface
  padrao para instalar, atualizar e auditar as ferramentas.
- Depois de instalar/configurar uma ferramenta, faca um commit pequeno e push
  para `origin/main` antes de seguir para a proxima.
