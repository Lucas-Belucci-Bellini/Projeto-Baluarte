# 📦 vendor/ — repositórios de referência (Omega Prism / JARVIS)

> **O que é isto:** repos externos importados como **referência de arquitetura** pro
> projeto de unificar o **Núcleo de IA** do Baluarte (Git Nexus + JARVIS + Conselho +
> APIs + Dashboard + ML + Mini-LLM + Segundo Cérebro + Memória + Terminal-IA +
> Segurança + IA Proprietária) num só — o **"Omega Prism"**, o começo do JARVIS.
>
> ⚠️ **Não fazem parte do build/deploy** (excluídos no `.vercelignore`; nada aqui é
> importado por `src/`). São material de estudo — extraímos os **conceitos**, não o
> código bruto (stacks diferentes: Node/React, Python, modelos ML). **Esta branch
> (`claude/vendor-omega-prism`) não deve ser mergeada no `main`** — fica como
> referência viva, no padrão dos vendor-PRs antigos (#71–103).
>
> Importados via tarball (o `git clone` externo é bloqueado no ambiente remoto).

## Os repositórios

| Pasta | Origem | Ref | Tam. | O que é | Conceito que traz pro Omega Prism |
|---|---|---|---:|---|---|
| `obsidian-second-brain/` | [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain) | `main` | 2 MB | Sistema de "segundo cérebro" no Obsidian (PARA/Zettelkasten, links e tags) | **Estrutura da base de conhecimento**: como organizar notas, backlinks e tags → molde do **Segundo Cérebro** |
| `supermemory/` | [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | `main` | 100 MB | "Universal memory API" — guarda qualquer coisa (notas, links, tweets) e consulta via IA | **Camada de memória persistente** que a IA lê/escreve → molde da **Memória / ML da Memória** |
| `anything-llm/` | [Mintplex-Labs/anything-llm](https://github.com/Mintplex-Labs/anything-llm) | `master` | 23 MB | App full-stack "converse com seus docs" — RAG, workspaces, multi-provedor de LLM, agentes, vetores | **Blueprint do RAG + agente + multi-provedor** → molde do **JARVIS + Conselho de IAs + Central de APIs** |
| `nousresearch-obsidian/` | [NousResearch/Obsidian](https://github.com/NousResearch/Obsidian) | `main` | 20 MB | Modelo de linguagem **multimodal compacto** (visão+texto) da Nous Research | **Mini-modelo multimodal** (referência) → molde do **Mini-LLM / IA Proprietária / visão** |
| `quant-mind/` | [LLMQuant/quant-mind](https://github.com/LLMQuant/quant-mind) | `master` | 8 MB | "Quant mind" — pipeline de IA pra pesquisa/conhecimento (domínio quant) | **Pipeline LLM + conhecimento** (ingestão → raciocínio) → referência pra orquestração do Núcleo |

*(Importados em 2026-06-23. Tamanhos extraídos aproximados.)*

## A tese do "Omega Prism"

O Baluarte **já tem as peças** (as abas do Núcleo de IA em `src/pages/git-nexus-cockpit.js`).
A ideia é uni-las numa experiência só, com **uma memória/contexto compartilhada** —
um "prisma" que refrata uma entrada em todas as capacidades:

```
            ┌───────────────── OMEGA PRISM (Núcleo de IA) ─────────────────┐
 entrada →  │  comando único + memória compartilhada (Segundo Cérebro)     │
            │   ├─ Conhecimento  ← obsidian-second-brain (notas/links/tags) │
            │   ├─ Memória       ← supermemory (memória persistente p/ IA)  │
            │   ├─ Raciocínio    ← anything-llm (RAG + agente + provedores) │
            │   ├─ Grafo         ← Git Nexus (já existe: grafo de código)   │
            │   ├─ Modelo        ← nousresearch-obsidian (mini multimodal)  │
            │   └─ Pipeline      ← quant-mind (ingestão → raciocínio)       │
            └──────────────────────────────────────────────────────────────┘
                         = começo do JARVIS
```

**Realidade técnica (#238):** o LLM/vetores/modelo pesado **não roda no site estático** —
isso é app/local. Na web, o Omega Prism é a **casca unificada + a base de conhecimento
leve** (notas/memória em JS puro, agora podendo persistir por usuário no Supabase que
montamos). O pesado fica atrás de `window.baluarte.native`. Próximo passo sugerido:
um `docs/OMEGA-PRISM.md` com o desenho concreto da 1ª fatia (a casca + a memória leve).

## Licenças
Cada pasta mantém a licença original do projeto (ver `LICENSE`/`README` dentro dela).
Uso aqui é **referência/estudo**; qualquer reuso de código respeitará a licença de origem.
