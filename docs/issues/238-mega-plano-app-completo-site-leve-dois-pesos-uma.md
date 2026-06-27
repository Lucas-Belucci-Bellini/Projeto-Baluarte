# #238 — 🧭 Mega-plano: App completo + Site leve — dois pesos, uma base

> **Status:** open · **Criada:** 2026-06-15 · **Atualizada:** 2026-06-18 · **Comentários:** 1
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/238
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## A virada (o porquê)

O Baluarte cresceu MUITO — virou uma plataforma com IA, Git Nexus, ML, Mini-LLM, IDE, terminal... incrível, mas **pesado e "maluco" demais pra uma página web** que precisa carregar voando em qualquer celular. Hoje o web carrega chunks gigantes (ex.: `git-nexus` ~441 KB, `arsenal-expandido` ~420 KB, `jarvis-brain`, `codemap`, ML) que a maioria dos visitantes nunca usa.

**Nova direção — dois produtos, papéis claros:**
- 🌐 **Web** = **leve, rápida, vitrine + conteúdo**. O cartão de visita e a porta de entrada. Sem tantas funções malucas (IA pesada, Git Nexus).
- 🖥 **App (Baluarte Launcher)** = **completo, pesado**. A plataforma de verdade — onde mora a IA, o Git Nexus real, o ML, os runtimes nativos.

## Princípio: uma base de código, dois pesos

A chave técnica **já existe**: o launcher injeta `window.baluarte.native` (M3a, #222). Então a **mesma base** detecta onde roda e **libera as camadas pesadas só no app** — sem forkar o projeto.
- No **navegador puro** → a feature pesada vira um *teaser* ("isso roda no app — baixe") e o chunk pesado **nem é baixado** (code-split).
- No **launcher** (`window.baluarte.native === true`) → a feature ativa de verdade (motor real, ML local, etc.).

## O que vai pra onde (proposta — ajuste à vontade)

| 🌐 Fica leve no WEB | 🖥 Vai pro APP (completo) |
|---|---|
| Crônicas / Biblioteca / Universo / Academia (narrativa, conteúdo) | **Git Nexus** + Raio-X do Código (grafo, ~441 KB) |
| Seção Militar / Ciência / Tabela Periódica (conteúdo, já leve) | **Cluster de IA**: Conselho de IAs, ML da Memória, Mini-LLM, Segundo Cérebro, Memória do JARVIS, IA Proprietária, Terminal-IA |
| Ferramentas leves: calculadoras, cripto didático, regex, tabela verdade, símbolos, QR, color studio | **JARVIS pesado** (motor + skills + ML local; no web fica um chat básico via API, ou só teaser) |
| Vitrine: Home (mais enxuta), Perfil, Sobre, Projetos, Roadmap, Mural | **IDE/Editor + Terminal** pesados, **Visão & Câmera** (ML/câmera) |
| **Página de download do app** (a ponte) | Processamento que o navegador não aguenta + acesso a filesystem |

## Plano em fases

**Fase 1 — Medir.** Auditar o bundle web (rollup-visualizer): listar os chunks pesados e quem os puxa. Definir metas (ex.: JS inicial < 150 KB gzip; cada rota leve < 50 KB).

**Fase 2 — Gate + code-split.** Pôr as features pesadas (IA, Git Nexus) atrás de `window.baluarte.native`:
- No web puro: a rota mostra um *teaser* elegante ("⬇ Essa função roda no Baluarte Launcher") com link pra `/baixar`.
- O `import()` do chunk pesado só acontece no app → o web **não baixa** mais esses KBs.
- Tirar trabalho pesado do boot (sync de memórias/codemap) do caminho web.

**Fase 3 — App mais completo.** O pesado roda de verdade no launcher: **M3c** (motor real do GitNexus na 4747), **M4** (runtimes próprios — Node/Python), JARVIS + skills + ML local. (Já planejados em #222.)

**Fase 4 — Web = vitrine leve definitiva.** Home enxuta, conteúdo + ferramentas leves + narrativa + download. Rápida, indexável, compartilhável.

## Critério de decisão (o que vai pra onde)

> Precisa de **motor nativo / filesystem / muito JS / processamento pesado** → **App.**
> É **conteúdo / narrativa / ferramenta leve / vitrine** → **Web.**

## Métricas de sucesso

- **Web**: JS inicial e por-rota bem menores; Lighthouse/performance alto; carrega rápido no celular.
- **App**: paridade com o web leve **+ exclusivos** (Git Nexus real, IA/ML local) que o web não tem.

## Não-objetivos / riscos

- ❌ **Não forkar** a base — é uma base, gated por `native`.
- ✅ Web sozinha continua **útil e completa pro que é dela** (quem não baixa o app ainda tem conteúdo + ferramentas leves).
- ⚠️ SEO/compartilhamento: manter o conteúdo leve indexável; os teasers das features de app são amigáveis.
- ⚠️ Transição **gradual** — gate feature por feature, sempre com o web funcionando.

## Como se conecta ao que já existe

Esta é a issue **guarda-chuva estratégica** acima de:
- **#222** — app desktop (M0→M6: launcher, auto-update, motor real, runtimes).
- **#231** — JARVIS ↔ Git Nexus como skills.
- **#195** — redesign 3D/imersivo (continua, mas mirando o "site leve e bonito").

A ordem sugerida pra começar: **Fase 1 (medir)** + **Fase 2 num piloto** (gate o Git Nexus atrás do `native` com teaser no web) — prova o conceito com a feature mais pesada, e o web já emagrece de cara.

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
