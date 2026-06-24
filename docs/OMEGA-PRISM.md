# 🔱 OMEGA PRISM — o Núcleo de IA unificado (começo do JARVIS)

> **O que é.** O Baluarte já tem **12 ferramentas de IA** soltas em abas (Git Nexus,
> JARVIS, Conselho, APIs, Dashboard, ML, Mini-LLM, Segundo Cérebro, Memória,
> Terminal-IA, Segurança, IA Proprietária). O **Omega Prism** é o plano de **unir
> tudo numa coisa só** — um "prisma" onde **uma entrada** (pergunta/comando) **se
> refrata** em todas as capacidades, com **memória e contexto compartilhados**. É o
> **começo do JARVIS**.
>
> Este doc é o **contrato de arquitetura**: a visão, as peças que já existem, o que
> os repos de referência (`vendor/`) trazem, o desenho em camadas e o **roadmap em
> fatias** — com a 1ª fatia detalhada. (Visão original: issues #231 e #238.)

---

## 1. Princípios (inegociáveis)

1. **Web leve / App pesado (#238).** Na web, o Omega Prism é **casca unificada +
   conhecimento/memória leve** (JS puro, persistido por usuário no Supabase). O
   **pesado** (LLM real, embeddings/vetores, modelo multimodal, motor do GitNexus)
   fica **atrás de `window.baluarte.native`** → no navegador vira teaser "abra no app".
2. **Reusar, não reinventar.** As peças já existem (seção 3). O Prism **conecta**, não
   reescreve.
3. **Memória compartilhada é a espinha.** Todas as facetas leem/escrevem **uma** base
   de conhecimento + memória (hoje local; alvo: por usuário no Supabase).
4. **JS puro (ES2022), sem deps.** Os repos de `vendor/` são **referência de conceito**,
   não dependências.
5. **Degradar em silêncio.** Sem login / sem app / offline → cai no modo leve sem erro.

---

## 2. As peças que já existem (não refazer)

| Faceta (aba) | Arquivo | O que já faz |
|---|---|---|
| 🔗 Grafo de Código | `src/utils/git-nexus-engine.js` · `src/pages/git-nexus.js` | grafo real de código: `nexusContext/Impact/path/rename/search` |
| ◉ JARVIS | `src/utils/jarvis-engine.js` · `jarvis-tools.js` | agente com **tools** (`registerTool/runTool/getToolSchemas/initSkills`) — já é "OpenJarvis-like" |
| 🕸️ Segundo Cérebro | `src/pages/cerebro.js` | **knowledge graph**: liga domínios/projetos/conceitos/fontes |
| 🧠 Memória | `src/pages/memoria.js` · `src/utils/jarvis-brain.js` | **memória durável "estilo supermemory"**: `addMemory/getMemories/linkConcepts/linkCode` |
| ⚖ Conselho de IAs | `src/pages/conselho.js` | orquestra múltiplos provedores num "conselho" |
| 🔑 Central de APIs | `src/pages/apis.js` | cofre de chaves / provedores |
| 📊 Dashboard · 📈 ML · ⚛ Mini-LLM · ⌨ Terminal-IA · 🛡 Segurança · 🦾 IA Proprietária | `jarvis-dashboard.js` · `aprendizado.js` · `llm-lab.js` · `terminal-ia.js` · `seguranca.js` · `ia-proprietaria.js` | painéis/labs já existentes |
| **Host das abas** | `src/pages/git-nexus-cockpit.js` | o **cockpit** que já junta as 12 numa página com abas (o `/git-nexus` / "Núcleo de IA") |

> Ou seja: **80% da matéria-prima já está pronta.** Falta a **cola** (memória/contexto
> compartilhados) e a **casca** (uma entrada única que refrata).

---

## 3. O que cada repo de referência (`vendor/`) traz

(Detalhe em `vendor/README.md`.)

| Repo | Conceito → faceta do Prism |
|---|---|
| `obsidian-second-brain` | organização de conhecimento (PARA/Zettelkasten, links/tags) → **Segundo Cérebro** |
| `supermemory` | memória universal persistente que a IA consulta → **Memória** |
| `anything-llm` | **RAG + agente + multi-provedor + workspaces** → **JARVIS/Conselho/APIs** (no app) |
| `nousresearch-obsidian` | mini-modelo **multimodal** compacto → **Mini-LLM / IA Proprietária** (no app) |
| `quant-mind` | pipeline ingestão→raciocínio → **orquestração** do Núcleo |

---

## 4. Arquitetura — o Prisma em camadas

```
            ╔══════════════════ OMEGA PRISM ══════════════════╗
   entrada  ║  ▟ BARRA DE COMANDO ÚNICA  (pergunta / ação)     ║
   única →  ║        │  refrata em ↓  (contexto compartilhado) ║
            ╠──────────────────────────────────────────────────╣
            ║ L5 Modelo      mini-LLM / multimodal      [APP]   ║
            ║ L4 Raciocínio  regras+busca [WEB] · RAG/agente [APP]
            ║ L3 Ferramentas Git Nexus skills + jarvis-tools + APIs
            ║ L2 Memória     fatos duráveis (jarvis-brain)     ║  ← espinha
            ║ L1 Conhecimento Segundo Cérebro (notas/links/tags)║  ← espinha
            ║ L0 Identidade  usuário logado (Supabase profiles) ║
            ╚══════════════════════════════════════════════════╝
                         = começo do JARVIS
```

**Leve (web) × Pesado (app), por camada:**

| Camada | Web (leve, agora) | App (`native`, depois) |
|---|---|---|
| L0 Identidade | login Google + `profiles` (✅ já temos) | idem |
| L1 Conhecimento | notas/conceitos em JS, por usuário (Supabase) | + import de vault Obsidian/Notion |
| L2 Memória | `jarvis-brain` + por usuário (Supabase) | + embeddings (pgvector) |
| L3 Ferramentas | `jarvis-tools` + Nexus (codemap) | + motor real GitNexus (4747) |
| L4 Raciocínio | regras + busca na memória (verbaliza) | RAG + agente real (estilo anything-llm) |
| L5 Modelo | teaser "abra no app" | mini-LLM / multimodal local |

---

## 5. Modelo de dados (Supabase, por usuário)

Agora que temos **contas + RLS** (tabela `profiles`), a memória/conhecimento pode
**sair do localStorage e virar por-usuário, cross-device**. Migrations futuras
(mesmo padrão dono-só de `profiles`):

- **`knowledge_notes`** — `id, user_id, title, body, tags[], links[], updated_at` (Segundo Cérebro).
- **`memories`** — `id, user_id, text, source, tags[], created_at` (Memória "lembre que…").
- *(futuro/app)* embeddings via **pgvector** pra busca semântica.

RLS **dono-só** (`auth.uid() = user_id`), igual `profiles`. **Sem login → modo local
(localStorage)**, sem regressão. Leitura/escrita pelo token do usuário (já temos
`user-prefs.js` como molde).

---

## 6. Roadmap em fatias (incremental e verificável)

| Fatia | O quê | Onde | Estado |
|---|---|---|---|
| **0** | `vendor/` (referência) + **este desenho** | repo/docs | ✅ |
| **1** | **Segundo Cérebro + Memória por usuário** (Supabase): unifica `/cerebro` + `/memoria` numa base coerente, persistida na conta | web | ⏭️ próxima |
| **2** | **Casca do Prisma**: barra de comando única no cockpit + **contexto compartilhado** (a entrada flui pras facetas; resultado de tool vira memória) | web | |
| **3** | **Nexus → skills do JARVIS** (#231): grafo de código vira `nexus_*` tools chamáveis | web | |
| **4** | **RAG leve**: JARVIS responde **usando a memória/conhecimento** (busca + verbaliza) no modo local; teaser do RAG pesado | web | |
| **5+** | **Pesado (app)**: LLM/embeddings reais (anything-llm-like), mini-modelo multimodal (nousresearch-obsidian), motor real GitNexus | app/local | |

---

## 7. 🎯 1ª Fatia detalhada — "Segundo Cérebro + Memória na conta"

**Por que primeiro:** é a **espinha** (L1+L2). Tudo no Prism pluga aqui, e ela aproveita
direto o login/contas que acabamos de construir. 100% web, verificável.

**Banco (migrations novas, RLS dono-só):**
- `0006_knowledge.sql` → tabela `knowledge_notes`.
- `0007_memories.sql` → tabela `memories`.
- Verificação por REST (igual fizemos): anon não lê/escreve (401/[]); dono CRUD na própria linha.

**Cliente (reusa o que existe):**
- `jarvis-brain.js` ganha um *backend* opcional: **logado → Supabase; deslogado → localStorage** (mesma API `addMemory/getMemories`).
- `/cerebro` e `/memoria` passam a ler/gravar por usuário; **sincroniza no login** (como a estética em `user-prefs.js`).

**Aceite:** logar → criar uma nota/memória → recarregar/outro dispositivo → continua lá;
deslogado → modo local sem erro; RLS comprovado por `curl`.

> As fatias 2–4 (casca + Nexus-skills + RAG leve) entram depois, uma por PR, cada uma
> verificável no navegador. A fatia 5+ (LLM real) é handoff pro **app/local** (#238/#222).

---

## 8. Decisões em aberto (do operador)

- **Provedor de LLM no app** (fatia 5): seguir o padrão multi-provedor do `anything-llm`
  (Ollama local + APIs)? — decisão quando chegarmos no pesado.
- **Importar Obsidian/Notion** de verdade (fatia futura): a partir de export `.md`/API.
- **Nome/identidade visual** do Prisma na UI (o "JARVIS" como rosto do Núcleo).

---

## Refs
#231 (JARVIS↔Nexus) · #238 (web leve/app pesado) · #222 (app desktop) · `vendor/README.md`
(repos de referência) · peças: `src/utils/jarvis-tools.js`, `jarvis-brain.js`,
`git-nexus-engine.js`, `src/pages/git-nexus-cockpit.js`, `cerebro.js`, `memoria.js` ·
contas: `src/core/supabase.js` / `supabase-auth.js` / `user-prefs.js` (+ `docs/SUPABASE.md`).
