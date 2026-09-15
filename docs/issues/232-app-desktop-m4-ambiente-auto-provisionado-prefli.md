# #232 — App desktop — M4: ambiente auto-provisionado (preflight de runtimes próprios)

> **Status:** open · **Criada:** 2026-06-15 · **Atualizada:** 2026-06-15 · **Comentários:** 0
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/232
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Contexto

O operador quer que o app **garanta sozinho os runtimes/deps na versão certa** ("checa e atualiza, e isso pra todos os outros"), pra ninguém precisar estudar programação pra usar. Confirmado que o projeto precisa de runtimes não-triviais:

- **Node ≥ 22** — o motor do GitNexus exige (`gitnexus/package.json` → `engines.node: ">=22.0.0"`). O Electron embute um Node **mais antigo**, então até o Node precisa ser gerenciado.
- **Python 3.11 + libs pesadas** — o `jarvis-python/` (nível 1/2/3) faz reconhecimento facial, voz e visão (nível OpenCV), cada um com seu `requirements.txt`.
- **Módulos nativos** (tree-sitter ×11, onnxruntime, ladybug) — vêm **prebuild no instalador** (M3c, `electron-rebuild`), não em runtime.

## Decisão de arquitetura (batida com o operador)

**Runtimes PRÓPRIOS do app — nunca tocar no sistema do usuário.** Atualizar o Node/Python instalados no PC foi descartado: precisa de admin, pode quebrar outros programas que dependem de versões específicas, varia por SO, e é comportamento que antivírus tratam como malware. O caminho é o que Steam/VS Code/Blender fazem: **runtimes privados numa pasta do app**.

## Proposta — preflight/bootstrapper (M4)

Tudo numa pasta gerenciada: `app.getPath('userData')/runtimes/`. **Zero admin, isolado, removível** (desinstalar = apagar a pasta).

**1. Manifesto declarativo** (`desktop/runtimes.json`) — a "lista única" do que o app precisa:
```jsonc
{
  "node":   { "version": "22.x", "dir": "node" },
  "python": { "version": "3.11.x", "dir": "python",
              "deps": ["jarvis-python/nivel2/requirements.txt"] },
  "nativeBundled": ["tree-sitter", "onnxruntime-node", "@ladybugdb/core"]
}
```
Mexer no manifesto = o app re-provisiona na próxima abertura. É assim que "atualiza sozinho".

**2. Preflight na abertura** (`desktop/src/preflight.js` + `desktop/src/runtimes/{node,python}.js`):
- **Node 22**: se não existir em `runtimes/node`, baixa o tarball **oficial** (`nodejs.org/dist`) pro SO/arch, extrai, confere `node --version`.
- **Python 3.11**: baixa um **python-build-standalone** (portátil, astral/indygreg) pro SO/arch, cria um **venv** e roda `pip install -r` das deps em `runtimes/python` — nunca no Python do sistema.
- Cada item: checagem de versão + **checksum** (os releases publicam SHASUMS); re-provisiona se faltar/corromper/desatualizar.
- **Nativos**: o preflight só **confirma** que vieram no instalador (não baixa).

**3. UI de setup (estilo launcher)** — janela de preflight com progresso por item, via IPC (`preflight:status`) sobre a ponte do M2:
> Preparando ambiente — ✓ Node 22 · baixando Python 3.11 (45%)… · instalando deps… · ✓ Motor GitNexus

**4. Segurança**: downloads só de **fontes oficiais** por HTTPS, com **verificação de checksum**. Nada de executar script remoto. Sem privilégios elevados.

**5. Degradação graciosa**: se um download falhar (offline), mostra erro + retry; as funções que dependem daquele runtime ficam desabilitadas com aviso, mas o **hub web continua funcionando**.

## Onde mexe

- `desktop/runtimes.json` (novo) — manifesto.
- `desktop/src/preflight.js` + `desktop/src/runtimes/node.js`, `python.js` (novos) — verificação/provisão por SO.
- `desktop/src/main.js` — roda o preflight no boot e mostra a UI de setup antes de liberar as features nativas.
- IPC: `preflight:status` na allowlist (M2).

## Verificabilidade

- **Parcial aqui**: a seleção de URL/arch por SO, o parsing do manifesto e a lógica de "precisa re-provisionar?" são **unit-testáveis** (sem rede).
- **Aceite real na máquina**: o download+extract+venv+pip é por-SO e pesado — fecha na máquina do operador, junto do M3c.

## Tamanho do instalador (decisão menor, pra depois)

Baixar os runtimes no 1º uso mantém o **instalador pequeno** (~150 MB) e só baixa o que aquele SO precisa — recomendado (estilo launcher). Alternativa: embutir tudo (instalador ~400 MB+). 

## Depende de / relaciona

- **M3c** (empacotar o motor + nativos) — irmão desta fatia.
- Issue guarda-chuva do app desktop: #222.

---
Decisão do operador: **runtimes próprios + planejar primeiro** (esta issue). Quando o M3c/M4 forem pra máquina, a gente constrói e testa junto.

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
