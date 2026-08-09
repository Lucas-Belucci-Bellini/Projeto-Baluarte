# 🛡️ Fase de Hardening — estrada até a 1.0.0

> **Fila viva da issue [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420).**
> Uma conversa nova começa aqui: pegue o próximo item não-marcado, execute no
> fluxo padrão (branch → PR draft → CI verde → merge → `CHANGELOG`) e marque.
>
> A #420 é **guarda-chuva — não fechar**. Este arquivo é o braço executável dela;
> a issue guarda o raciocínio, o arquivo guarda o estado.
>
> ℹ️ A #420 tem **dois assuntos**: esta fase de hardening **e** a arquitetura da
> V2 (junto com a [#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422),
> que carrega os produtos). Não é confusão — é o mesmo argumento contínuo:
> *endurecer → congelar a 1.0.0 → reconstruir como V2*. O que é V2 está resumido
> em [`architecture/v2-vision.md`](./architecture/v2-vision.md) e **não se executa
> agora**; o que se executa agora é a fila abaixo.

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
| **`innerHTML`** | ⚠️→✅ **58 atribuições** triadas uma a uma: **1 era XSS real** (`javascript:` no preview de markdown da `/utilidades`), as outras 57 são seguras. | corrigida; detalhe na fila abaixo |
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
- [x] **Migrar o `localStorage` direto para o wrapper** — de 11 chamadas cruas
      para **2**, ambas intencionais e documentadas (`/shadow` mede o storage;
      `/perfil` varre o cache legado). `auth:session`, `terminal:history` e
      `perfil:config` ganharam esquema e classificação. **Achou dois bugs reais:**
      o cache da Wikipédia gravava fora do namespace — o "Limpar todos os dados
      locais" nunca o alcançava, então o operador lia "tudo apagado" e o registro
      do que ele consultou ficava no disco; e `loadHistory()` do terminal fazia
      `JSON.parse` sem `try`, derrubando a página com uma entrada corrompida.
      `test/storage-namespace.test.js` impede a reincidência.
      As 14 chamadas a **`sessionStorage` ficam diretas por decisão**: o wrapper é
      `localStorage` (persiste para sempre) e essas flags existem para morrer com
      a aba — migrá-las trocaria a semântica e transformaria a guarda anti-loop do
      boot num bloqueio permanente. Justificado em `core/politica.js`.
- [x] **Triagem dos 58 `innerHTML`** — feita, uma a uma. **Uma era vulnerabilidade
      real**, as outras 57 são seguras e o motivo está registrado abaixo.

      🔴 **`pages/utilidades.js` — XSS por `javascript:` no preview de markdown.**
      O renderizador escapava `<`, `>` e `&` do texto e parava aí. Mas `href` não
      precisa de tag: `[clique](javascript:alert(1))` virava
      `<a href="javascript:alert(1)">` e executava no clique. O escape do texto
      nunca tocou nisso — o problema estava no atributo. Corrigido com filtro de
      esquema (só `http`/`https`/`mailto`; o resto vira `#`, inerte e visível).
      Extraído para `src/utils/markdown.js` para poder ser testado sem navegador:
      **15 testes**, e 4 deles falham se o comportamento antigo voltar.

      ✅ **As outras 57**, por categoria:
      **21** são `innerHTML = ''` (limpar container) — sem conteúdo, sem risco.
      **8** são HTML literal estático escrito no próprio arquivo.
      **17** interpolam apenas números calculados (calculadoras, métricas de FPS,
      dimensões de imagem).
      **3** passam por `highlight()` (editor, JARVIS, gerar-código) — o
      highlighter escapa tudo com `escapeHtml` nos três caminhos (genérico,
      markdown e markup), verificado.
      **1** usa `escapeHtml()` explicitamente (`terminal.js`).
      **1** é o `log` do runner do editor, que roda **dentro de um iframe
      `sandbox="allow-scripts"` sem `allow-same-origin`** — origem opaca, sem
      acesso ao DOM/storage do pai. Executar ali é o propósito do recurso, não
      escalada.
      **6** interpolam identificadores internos (rótulo de nó do cérebro, id de
      aba, nome de RPC) sem caminho para dado externo.
- [ ] **Sandbox do Terminal** — confirmar **por teste** que o FS virtual de
      `utils/terminal-engine.js` não alcança nada real, e que os 60+ comandos
      passam por uma API explícita. O terminal está `beta`, mas fuga de sandbox é
      buraco de segurança e segurança não é dispensável por estar em beta.
      *(Terminal com processo de verdade é da IDE da V2 — #422.)*
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
      *(Meio caminho andado: a causa mais comum — a VERSION do `sw.js` parada
      enquanto o site avança — agora é cobrada por `test/versao.test.js`. Falta
      testar o ciclo de troca de SW de verdade, num navegador.)*
- [ ] **Teste de offline real** — online → offline → navega → online → sincroniza.
- [ ] **Schemas dos datasets** — a garantia mínima: **um JSON quebrado não derruba
      a página**. Proveniência (fonte, data, revisão, confiança por campo) e fila
      de revisão **não** entram aqui — exigem banco e são V2 (#422).

## 🟡 Pode esperar a 1.1

- [ ] Organização do `.smart-env/` (19 MB, 96 arquivos gerados) em `generated/`,
      `cache/`, `indexes/` — e o máximo possível no `.gitignore`.

---

## 🚪 O gate da 1.0.0 — o que fecha a versão

Os itens acima são o trabalho. Estes cinco são o **fechamento**, e sem eles não
existe "1.0.0", só um monte de item marcado:

- [x] **Decidir o número da versão** — decidido pelo operador: `1.0.0-rc` agora,
      `1.0.0` no congelamento; a V2 vira 2.0.0 (ADR-003). O `2.0.0` que estava no
      `package.json` era numeração interna do Mark XIII, nunca publicada (o repo
      não tinha nenhuma tag). **Os três arquivos que carregam a versão foram
      alinhados** e `test/versao.test.js` passa a cobrar que continuem — o
      `public/sw.js` estava em `v0.9.1` enquanto o site dizia `2.0.0`, que é
      exatamente o bug "cache velho servido após deploy" (já aconteceu 2×).
- [ ] **Publicar a tag `v1.0.0`** — é o **ponto de retorno**. Sem tag não existe
      "voltar para a 1.0", e a linha-base que justifica o ADR-001 não existe.
- [ ] **Tabela de estabilidade no `README.md`**, gerada de `flags.porNivel()` —
      é onde a 1.0.0 diz publicamente o que promete.
- [ ] **Triagem das 53 issues abertas** (o que é 1.0, o que é V2, o que fecha).
      Estava em "pode esperar a 1.1" e foi **promovida**: a lista mistura bug real
      com ideia solta (`#197 resolver o editor de codigo`, `#307 arrumar (supabase)`,
      `#210 temos que arrumar`), e não dá para afirmar que a 1.0.0 é sólida sem
      saber se alguma delas descreve algo quebrado no que está marcado estável.
      É varredura de leitura, não de código.
- [ ] **Suíte verde no congelamento** — `npm test` · `npm run smoke` ·
      `npm run build` · `npm audit --omit=dev`.

---

## 🔵 Fora do escopo — vai para a V2 (issue #422)

Registrado aqui para não voltar à fila por engano. O **backlog** está na
[#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422); a
**forma** está em [`architecture/v2-vision.md`](./architecture/v2-vision.md).

| Item | Por que não cabe na 1.0.0 |
|---|---|
| Proveniência dos dados (fonte · data · confiança) | Exige banco relacional e histórico; em JSON no frontend vira campo decorativo |
| Fila de revisão / curadoria do conhecimento | Idem — é o Knowledge Engine |
| Terminal com processo real | O da V1 é FS virtual; terminal real é peça da IDE web, com sandbox de servidor |
| Storage como camada trocável | A V2 tem banco — abstrair `localStorage` agora é abstrair o que será substituído |
| Baluarte MCP · Knowledge Engine · Project Registry | Vêm **depois** da fronteira de permissão, que a 1.0.0 entrega |
| Wikis (Arma 3 com motor refeito, Zomboid) · parser Lua/SQF · Social · IDE web · 3D engine | São **projetos consumidores** da plataforma V2, não parte dela |

> ⚠️ A V2 entregável é a **fundação**. Os projetos vêm depois, e o critério de
> aceitação é: *construir uma wiki nova usando só as interfaces da V2, sem tocar
> no Core.*

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
