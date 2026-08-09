# 🛡️ Fase de Hardening — estrada até a 1.0.0

> **Fila viva da issue [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420).**
> Uma conversa nova começa aqui: pegue o próximo item não-marcado, execute no
> fluxo padrão (branch → PR draft → CI verde → merge → `CHANGELOG`) e marque.
>
> A #420 é **guarda-chuva — não fechar**. Este arquivo é o braço executável dela;
> a issue guarda o raciocínio, o arquivo guarda o estado.

---

## O que "1.0.0" significa aqui

A definição adotada (#420, item 1) **não** é "todas as funcionalidades prontas".
É:

> **1.0.0 = tudo que está marcado como estável é previsível, testado,
> recuperável e seguro para uso.**

A diferença muda a prioridade inteira: uma funcionalidade incompleta pode ficar
atrás de uma flag `experimental` e não atrasa nada. Uma funcionalidade marcada
como **estável** precisa cumprir critérios. Essa marcação agora é código, não
adjetivo — `src/core/flags.js` **recusa** uma flag experimental que tente nascer
ligada por padrão.

E a 1.0.0 é um **ponto de congelamento**, não a versão final: ela é a última
release da arquitetura atual considerada estável, a linha-base contra a qual a
V2 vai ser comparada (ver [`architecture/v2-vision.md`](./architecture/v2-vision.md)
e ADR-001).

---

## Auditoria de segurança — resultado (2026-08-09)

Primeira varredura da fase, sobre `src/`, `api/`, `scripts/`, `public/`,
`index.html` e `jarvis-python/`.

| Frente | Resultado | Ação |
|---|---|---|
| **Segredos no frontend** | ✅ **limpo** — nenhuma chave, token ou senha embutida. Nenhum `sk-`/`AIza`/`ghp_`/JWT em código. | manter; cobrar no CI (item aberto) |
| **`eval` / `new Function`** | ⚠️ **1 ocorrência**, `src/utils/jarvis-skills.js:89` — e ela **já está sandboxed** em duas camadas (lista de bloqueio por regex + globais perigosos sombreados como parâmetros `undefined`). | revisar na frente do JARVIS, não é buraco aberto |
| **`innerHTML`** | ⚠️ **58 atribuições** em 40 arquivos. Concentração nas calculadoras (`engenharia` 8, `saude` 5, `financeira` 5, `estatistica` 4). | triar: quais recebem entrada do operador? |
| **Dependências** | ⚠️ **6 avisos** (4 altos), **todos em devDependencies** — `postcss` (via `vite`), `tar` (via `@capacitor/cli`). `npm audit --omit=dev` → **0**. Nada disso chega ao navegador. | CI cobra produção; dev fica informativo |
| **Armazenamento** | ⚠️ **25 chamadas diretas** a `localStorage`/`sessionStorage` fora de `src/core/storage.js`, em 10 arquivos. | migrar pro wrapper, item aberto |
| **CI** | ✅ melhor que o esperado — `ci.yml` (build + testes + invariantes do Arma 3), `smoke.yml` (todas as rotas num navegador real, de hora em hora), `codeql.yml`. | somar `npm audit` |

**Leitura geral:** a postura de segurança estava *melhor* do que a #420 supunha.
Não há segredo vazado, o `new Function` é o caso mais bem cuidado do repositório
e o CI já existe. Os buracos reais são de **arquitetura de acesso** (não havia
fronteira de permissão) e de **durabilidade de dado** (não havia versionamento),
que é exatamente onde esta fase começou.

---

## 🔴 Obrigatório para a 1.0.0

- [x] **Auditoria de segurança — primeira varredura** — resultado na tabela acima.
- [x] **Permission Manager** — `src/core/permissions.js`. Deny-by-default; permissão
      precisa ser declarada (typo falha alto, não vira negação silenciosa); curinga
      nunca alcança risco `restrito`. 22 testes.
- [x] **Versionamento e migração de dados** — `src/core/storage.js`. Esquema por
      chave, envelope `{__bv, d}`, migração automática do dado legado, recusa de
      "desmigrar" dado mais novo. 18 testes.
- [x] **Classificação de dado** — classe `secreto` **recusada na gravação**: o
      frontend é público, e a regra "nunca segredo no frontend" agora é cobrada.
- [x] **Auditoria de dependências no CI** — `npm audit --omit=dev --audit-level=high`
      bloqueia; o audit completo (com dev) fica informativo, sem travar merge.
- [ ] **Migrar os 25 `localStorage` diretos** para `storage.set/get`, aproveitando
      para classificar cada chave. Sem isso não dá para trocar o backend de
      persistência nem saber o que é sensível. Arquivos: `main.js`,
      `core/supabase-auth.js`, `utils/{shadow-gate,page-views,hx-beacon,visit-counter,terminal-engine,wikipedia}.js`,
      `pages/{perfil,shadow}.js`.
- [ ] **Triagem dos 58 `innerHTML`** — separar "HTML que eu mesmo escrevi" (ok) de
      "HTML com dado do operador ou de API" (vira `textContent` ou sanitização).
      Começar pelas calculadoras.
- [ ] **Sandbox do Terminal** — confirmar por teste que o VFS de
      `utils/terminal-engine.js` não alcança nada real, e que os 60+ comandos
      passam obrigatoriamente por uma API explícita.
- [x] **JARVIS atrás do Permission Manager** — `runTool()` é o gargalo por onde
      toda chamada do agente passa, e exige a permissão do mapa
      `src/utils/jarvis-permissoes.js` antes de executar. Ferramenta fora do mapa
      cai no padrão **fechado** (`jarvis.skills.executar`, risco `restrito`), então
      tool nova nasce negada em vez de nascer aberta. 10 testes.
- [ ] **Critical Path Test** — o `smoke` já abre todas as rotas; falta afirmar
      *jornada* (home → arsenal → item → volta → JARVIS → estado íntegro) e
      "zero erro de JS no console".
- [ ] **Error handling nas bordas** — timeout/retry/fallback/mensagem legível em
      toda chamada externa (API, IA, IndexedDB, Service Worker, rede).
- [ ] **Teste de vazamento de memória** — abrir/fechar página 100× e conferir se
      listeners, timers, AudioNodes e objetos Three.js são liberados.
      `core/ciclo-vida.js` já existe; falta cobrar.

## 🟠 Muito recomendado

- [x] **Event bus como sistema nervoso** — `src/core/events.js` ganhou curinga
      (`bus.on('*')` e `bus.on('arsenal:*')`) com o nome do evento em `meta`.
      É o que permite histórico, telemetria e contexto do JARVIS sem lista fixa.
      16 testes.
- [x] **Feature flags + níveis de estabilidade** — `src/core/flags.js`.
      `estavel`/`beta`/`experimental`, gate de ambiente web/app (#238) sem porta
      dos fundos, override por `?flags=` que não persiste. 23 testes.
- [x] **Página `/diagnostico`** — o painel de status do #420, item 8. Sondas do
      ambiente, tabela de estabilidade, permissões com liga/desliga, esquemas de
      storage com versão gravada vs. esperada, e o rastro das últimas decisões.
      Sem `innerHTML` em lugar nenhum. Verificada no navegador.
- [x] **Declarar as permissões reais do Baluarte** — `src/core/politica.js`:
      **19 permissões**, sendo 7 `restrito`. Quatro delas (`terminal.executar`,
      `arquivos.ler`, `arquivos.escrever`, `rede.chamar`) estão declaradas **antes
      de existirem**, para que a tool nasça atrás de uma permissão que ninguém
      concedeu em vez de nascer aberta e "ser protegida depois".
- [x] **Conectar flags e permissões ao boot** — `aplicarPolitica()` no topo do
      `boot()` de `src/main.js`, antes do shell e do router (página que consulte
      flag antes disso receberia `false` e se desenharia errada).
- [ ] **Auditoria do Service Worker** — v1 em cache → deploy v2 → usuário preso na v1.
- [ ] **Teste de offline real** — online → offline → navega → online → sincroniza.
- [ ] **Schemas dos datasets** — um JSON quebrado não pode derrubar a página.

## 🟡 Pode esperar a 1.1

- [ ] Organização do `.smart-env/` (19 MB, 96 arquivos gerados) em `generated/`,
      `cache/`, `indexes/` — e o máximo possível no `.gitignore`.
- [ ] Triagem completa das issues abertas (o que é 1.0, o que é pós-1.0, o que fecha).
- [ ] Tabela de estabilidade no `README.md`, gerada de `flags.porNivel()`.
- [ ] Baluarte MCP · Knowledge Engine · Project Registry — **tudo V2**, ver
      [`architecture/v2-vision.md`](./architecture/v2-vision.md).

---

## A ordem que a #420 pediu (e por quê)

```
        HARDENING              ← estamos aqui
   segurança · storage
   permissões · testes
            ↓
       CORE ESTÁVEL
            ↓
    ┌───────┴───────┐
 Plugin System   JARVIS
    └───────┬───────┘
            ↓
      Baluarte MCP
            ↓
          NEXUS
```

O MCP **não** vem antes das proteções. Um servidor MCP é, por definição, uma
porta pela qual um agente escolhe a ação sozinho — abri-la antes da fronteira de
permissão é abrir acesso irrestrito e chamar isso de integração.
