# Handoff — supervisor de motores no app (#222, M3d expandido)

> **Sessão LOCAL.** Precisa da máquina do operador: os 7 motores instalados, o
> Electron e o vault do Obsidian. Uma sessão remota não consegue executar isto —
> só planejar. Mesma divisão do [`HANDOFF-LOCAL.md`](HANDOFF-LOCAL.md).

## O que o operador pediu

> *"a ideia era dar ao app a possibilidade de usar os 7 juntos ou separados ou
> 3 do 7 combinados + o próprio app"*

O Baluarte Launcher deve poder subir, derrubar e compor os motores externos —
todos, um só, ou um subconjunto — e saber o estado de cada um.

## O protótipo já existe

`desktop/src/nexus.js` faz exatamente isso **para um motor só**:

1. detecta se já há motor no ar (`GET /api/health` na 4747) e, se houver, só conecta;
2. senão, tenta subir numa cadeia de estratégias (`env → vendored → global → npx`);
3. faz polling de readiness até ficar saudável;
4. expõe pra UI pela ponte allowlisted (`nexus:status`, `nexus:graph`).

Isso é um supervisor de processo. O trabalho é **generalizar de 1 para N**, não
inventar do zero.

## O que falta declarar

O `config/ai-tools.json` já guarda id, caminho, versão e como executar
(`run.kind` + entrypoint/binário por plataforma). Falta o **contrato de
processo**, que hoje está hardcoded dentro do `nexus.js`:

```jsonc
"service": {
  "porta": 4747,
  "health": "/api/health",
  "serveArgs": ["serve", "--port", "4747"],
  "readyMs": 20000,
  "dependeDe": []
}
```

E os **perfis**, que respondem ao "3 dos 7 combinados":

```jsonc
"perfis": {
  "codigo":   ["gitnexus", "graphify"],
  "conversa": ["hermes-agent", "openclaw"],
  "tudo":     ["gitnexus", "graphify", "hermes-agent", "openclaw"]
}
```

## Primeiro passo (pequeno e verificável)

**Não** escrever o supervisor de N motores de cara. Fazer a refatoração com rede:

1. adicionar o bloco `service` ao `gitnexus` no manifest;
2. fazer `desktop/src/nexus.js` ler porta, health, args e `readyMs` dali em vez
   das constantes `HOST`/`PORT`/`BASE`;
3. **comportamento idêntico** — o GitNexus sobe exatamente como hoje.

Critério de aceite: abrir o launcher, `/git-nexus` fica com o badge verde e o
orbe roda no grafo real, igual antes da mudança. Se algo mudou, a refatoração
falhou.

Só depois disso o segundo motor entra, e aí o código já está pronto.

## Restrições que não são negociáveis sem ADR novo

- **ADR-001** — a 1.0.0 é ponto de congelamento e vem **antes** da V2. Isto é
  trabalho do app (#222), não abertura da segunda frente.
- **ADR-004** — a fronteira entre linguagens vai onde o volume por travessia é
  **alto** e a frequência **baixa**. Supervisão de processo é o oposto: não
  justifica um binário Rust no meio de Electron e os motores. Escrever o
  supervisor em Node agora **define o contrato** que o Runtime em Rust vai
  implementar depois — que é o papel que o próprio ADR-004 dá ao Runtime.
- A lição de 265× do CLAUDE.md: **meça antes de culpar a linguagem.**

## Fatos dos motores (medidos nesta máquina, 2026-08-15)

| motor | sobe serviço? | observação que custa tempo se for redescoberta |
|---|---|---|
| gitnexus 1.6.9 | sim, 4747 | FTS/BM25 desligado no Windows (falta VC++ 2015-2022 x64 + OpenSSL 3) |
| openclaw 2026.8.1 | sim, 18789 | **exige `pnpm build`**; sem `dist/entry.mjs` só o `--version` responde |
| hermes-agent 0.20.1 | CLI/gateway | venv **fora** do clone (o README avisa: o agente pode apagar o próprio runtime) |
| graphify 0.9.43 | tem `graphify-mcp` | pacote no PyPI é `graphifyy`, com dois `y` |
| claude-code-terminal 1.0.1 | não | plugin do Obsidian; `node-pty` tem que estar na pasta do plugin |
| claude-code | não | repositório de referência; a CLI é outro pacote (v2.1.177 na máquina) |
| codex | não | **`cargo` não existe nesta máquina** — não compila |

Portas em uso: `4747` (GitNexus), `18789` (gateway OpenClaw), `18790` (ponte do
Baluarte). Ver [`local-ai-tools.md`](local-ai-tools.md) e [`OPENCLAW.md`](OPENCLAW.md).

## Prompt para abrir a próxima sessão

```text
Sessão LOCAL do Projeto Baluarte. Leia docs/HANDOFF-SUPERVISOR-MOTORES.md e
execute só o "Primeiro passo": mover o contrato de processo do GitNexus
(porta, health, args de serve, readyMs) das constantes de desktop/src/nexus.js
para um bloco "service" em config/ai-tools.json, e fazer o nexus.js ler dali.

Comportamento tem que ficar idêntico — é refatoração, não feature. Critério de
aceite: abrir o Baluarte Launcher, ir em /git-nexus e ver o badge verde com o
orbe rodando no grafo real, igual antes.

Rode npm run tipos:ts e npm run build antes de commitar. Respeite ADR-001
(1.0.0 congela antes da V2) e ADR-004 (não meta Rust nessa fronteira sem medir).
Commit pequeno, branch própria, e me diga o que NÃO conseguiu verificar.
```
