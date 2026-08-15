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
```

`tools:sync` clona o repo se ele ainda nao existir e roda `git pull --ff-only`
quando ja existe. O flag `--with-setup` executa os passos locais declarados no
manifest, como `npm install` em pacotes internos.

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
