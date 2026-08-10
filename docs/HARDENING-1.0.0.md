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
- [x] **Sandbox do Terminal** — provado por teste. **A fronteira estava fechada**:
      o VFS é uma árvore de objetos em memória (persistida pelo wrapper), `..`
      já era contido por construção, e nenhum comando alcança rede, execução de
      código ou a ponte do Launcher. `test/terminal-sandbox.test.js` (14 testes)
      **executa comandos de verdade** contra a fronteira — `cat /etc/passwd`,
      `rm -rf /`, escrita com `../../..` — e roda em Node puro, o que também
      prova que o terminal nunca precisou de filesystem.
      Nota honesta: a única falha foi **do teste**, não do código — a primeira
      versão confundia substring com segmento e acusava `....` (nome legítimo)
      de travessia. *(Terminal com processo real é da IDE da V2 — #422.)*
- [x] **JARVIS atrás do Permission Manager** — `runTool()` é o gargalo por onde
      toda chamada do agente passa, e exige a permissão do mapa
      `src/utils/jarvis-permissoes.js` antes de executar. Ferramenta fora do mapa
      cai no padrão **fechado** (`jarvis.skills.executar`, risco `restrito`), então
      tool nova nasce negada em vez de nascer aberta. 10 testes.
- [x] **Critical Path Test** — `scripts/caminho-critico.mjs` (`npm run caminho-critico`,
      no CI junto do smoke). O smoke abre cada rota numa **aba nova** e por isso
      é cego para estado que corrompe *entre* navegações. Este percorre **uma
      sessão contínua** — boot → arsenal → home → editor (escreve) → terminal →
      volta no editor → diagnóstico (revoga) → **reload** → a escolha sobreviveu?
      — com **15 afirmações de estado** e zero exceção não capturada.
      Nota honesta: as duas primeiras versões **passavam com a persistência
      quebrada**. A primeira comparava estado *relativo* (`!antes`), que não
      distingue "voltou ao padrão" de "nunca mudou"; a segunda usava `goto()`
      para a mesma rota, que é navegação no mesmo documento e **não recarrega** —
      o teste lia o heap achando que lia o disco. Só a terceira versão morde:
      verificado quebrando `persistirPermissoes` e vendo a afirmação do reload
      ficar vermelha.
- [x] **Error handling nas bordas (superfícies `estavel`)** — medido antes de
      executar: são **5 pontos de chamada**, não 100 páginas. Todos ganharam teto
      de espera.
      O modo de falha coberto é o que **não parece falha**: rede que *pendura* em
      vez de recusar. Recusa é fácil — rejeita, o `catch` roda, a UI mostra erro.
      Pendurar deixa o `await` esperando para sempre: nenhum erro, nenhum
      fallback, a tela girando.
      O pior era `getAccessToken()`, que roda **antes de quase toda operação
      autenticada** — um refresh pendurado pendurava junto tudo que depende de
      dado. Também: `dbFetch` (caminho de toda ida ao banco, 8 s + mensagem
      legível em vez de `TimeoutError` cru), o `signOut` (4 s — revogar no
      servidor é bônus, sair é o que foi pedido) e a Wikipédia do Centro Militar
      (6 s, o mesmo teto que `pages/arsenal.js` já usava).
      6 testes, com um `fetch` que pendura de verdade; verificado que todos ficam
      vermelhos sem o `signal`.
- [x] **Sonda de vazamento** — `scripts/sonda-memoria.mjs` (`npm run sonda-memoria`,
      no CI). **Veio limpo:** `/home`, `/cerebro`, `/radio`, `/visao` e `/mapa`
      visitadas 6× cada não acumulam timer, contexto de áudio nem laço de
      animação. O `ciclo-vida` está fazendo o trabalho dele.
      Mede **inclinação**, não valor absoluto — número alto e estável é legítimo
      (a página abre 3 timers e fecha 3); o que acusa é crescer a cada visita.
      Heap é reportado mas **não reprova**: oscila com o coletor, e limiar grande
      o bastante para não dar falso positivo não pega vazamento pequeno.
      Verificado plantando um `setInterval` e um laço de `rAF` sem limpeza em
      `/cerebro`: a sonda acusou `timers 2→3→4→5→6→7`.

- [x] **As 59 chaves de storage sem esquema — o bloqueador achado por último.**
      Só 12 chaves estavam declaradas em `politica.js`. Uma varredura de `src/`
      achou **outras 59 em uso e sem esquema**, quase todas acessadas por
      constante (`const KEY = 'ui:theme'`) — forma que um grep pelo literal
      dentro de `storage.get(...)` não enxerga, e a razão de terem passado
      batido: quem procurou, procurou pelo padrão errado.

      **Por que bloqueava a 1.0.0.** Chave sem esquema não tem versão. Congelar
      a V1 assim deixaria a V2 — que é reconstrução, não evolução — sem contrato
      para ler o dado da V1. E a perda é silenciosa: chave que ganhe esquema
      depois tem o dado antigo lido como versão 0 e, sem `migrar`, `get()`
      devolve o fallback (`storage.js:160-166`) — sem erro, sem log, sem pista.
      Entre as 59 havia `apis:vault` (cofre de chaves de API), `voice:elevenKey`,
      `nucleo:wsToken`, `shadow:auth`/`shadow:session` e o histórico e a memória
      do JARVIS.

      **Nenhuma virou `secreto`**, e isso é decisão, não omissão: `secreto` é
      recusado na gravação, e chave de API que o operador digita para usar a
      conta dele precisa viver no navegador. Marcar assim não deixaria o
      Baluarte mais seguro — deixaria o cofre quebrado. Mesmo raciocínio já
      registrado em `auth:session`. Hoje: **21 `sensivel` · 48 `local` ·
      2 `publico` · 0 `secreto`**.

      Verificado tirando o `migrar` de `apis:vault`: `npm test` foi de 422 para
      420 com a mensagem *"perdeu o dado legado ao ganhar esquema"*. O caminho
      crítico passou 15/15 depois da mudança — o que o editor escreveu sobrevive
      à ida e volta, e a permissão revogada sobrevive ao reload.
      `npm run gen-catalogo-storage` gera [`architecture/storage.md`](./architecture/storage.md)
      e **se recusa a rodar** enquanto houver chave fora da política; o CI cobra
      a mesma coisa com `--verificar`.

- [x] **A 1.0.0 apagaria o dado de quem já usa o app — e o defeito era meu.**
      A ADR-003 mandava o app apontar para `v1.projeto-baluarte.vercel.app` para
      não drenar para a V2. A intenção estava certa; a execução era um apagador
      silencioso.

      `localStorage` é escopado por **origem**. O app publicado (0.9.2) aponta
      para `projeto-baluarte.vercel.app`; `v1.` é **outra origem**. Quem
      atualizasse para a 1.0.0 encontraria as **71 chaves vazias** — abas do
      editor, conversas e memórias do JARVIS, histórico do terminal e o cofre de
      chaves de API (`apis:vault`). Sem erro, sem aviso, sem desfazer. Pareceria
      que o app apagou tudo, numa versão chamada "ponto de congelamento".

      Pior: o passo 1 do [`HANDOFF-LOCAL.md`](./HANDOFF-LOCAL.md#a0) mandava
      criar o alias **antes** de publicar o app. A ordem escrita levava direto ao
      estrago.

      **A correção inverte quem se muda:** a V1 fica onde o dado já está, e a
      **V2** nasce em endereço próprio. O pin continua valendo — o app fica na V1
      porque a V1 é que fica parada. E a V2, sendo reconstrução, tem motivo
      independente para não herdar o `localStorage` da V1.
      `REMOTE_URL` revertido, ADR-003 corrigida com o erro registrado (não
      reescrita em silêncio), handoff com um ⛔ no lugar do passo perigoso e um
      passo novo de aceite: *abrir o 0.9.2, deixar algo no editor, atualizar e
      confirmar que continua lá*.

      ⚠️ **Fica em aberto para o operador:** o endereço principal passa a servir
      a V1 até ele decidir promover a V2, e **não existe exportar/importar** do
      dado local — só "limpar". Qualquer mudança de origem futura precisa de uma
      das duas: ponte entre origens (iframe + `postMessage`) ou exportação. É
      decisão dele, não da sessão.

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
- [x] **Auditoria do Service Worker** — as duas metades fechadas, e **achou um
      bug que eu mesmo ativei**.
      A primeira metade já estava: `test/versao.test.js` impede a VERSION do
      `sw.js` de ficar para trás (a causa das duas vezes em que gente ficou presa
      em cache velho).
      A segunda metade: a limpeza de caches antigos comparava por **prefixo**, e
      `'baluarte-v1.0.0-rc-static'.startsWith('baluarte-v1.0.0')` é **`true`** —
      então na subida de `1.0.0-rc` para `1.0.0` os caches da rc sobreviveriam
      **para sempre**: invisíveis, ocupando espaço, nunca servidos. Renumerar
      para `-rc` foi o que criou o cenário. Agora compara por **nome exato**.
      `test/service-worker.test.js` (6 testes) **executa o `sw.js` de verdade**
      num sandbox `vm` com `self`/`caches` de mentira — testa o arquivo servido,
      não uma cópia da lógica. Verificado revertendo para o prefixo: o teste
      acusa.
- [x] **Prova de offline** — `scripts/prova-offline.mjs` (`npm run prova-offline`,
      no CI). **Passou:** o site volta depois de recarregar sem rede, não cai na
      tela de erro do navegador, rota já visitada abre do cache, rota nunca
      aberta **degrada com aviso em vez de tela branca**, e tudo volta quando a
      rede volta.
      O percurso distingue os dois casos porque a arquitetura os separa: com
      roteamento por hash, trocar de rota offline não dispara requisição — o que
      pode faltar é o **chunk** de uma página nunca visitada.
      Nota: a primeira versão **travava** em vez de falhar quando não havia SW —
      `navigator.serviceWorker.ready` nunca resolve nesse caso, não rejeita. Em
      CI isso queimaria o job por timeout em vez de acusar. Teto de 15 s e falha
      imediata com a causa dita.
- [x] **Datasets buscados em runtime** — medido antes: são **7** (6 bases do
      Arma 3 + a saga das Crônicas). Dataset *importado* quebrado falha o
      **build**; buscado quebrado falha **na cara do operador**, e é essa a
      categoria que importava.
      A garantia "JSON quebrado não derruba a página" **já estava de pé** — os
      dois consumidores tratam a rejeição com mensagem legível. O que faltava:
      **(a)** teto de espera — sem ele a tela ficava em "baixando…" para sempre
      (a base de armas tem ~1,9 MB); **(b)** conferência de **forma** — JSON
      *válido* sem o campo esperado resolvia `undefined`, e o `.filter()` de quem
      chamou estourava com "Cannot read properties of undefined", erro que não
      menciona dataset nenhum.
      Extraído para `src/core/dados-remotos.js` (teto de 20 s — são megabytes, o
      teto é contra rede *pendurada*, não contra rede lenta; forma conferida;
      cache que **não guarda fracasso**, senão o "tentar de novo" mentiria).
      10 testes. Verificado no navegador: `/biblioteca` carrega os 1178
      capítulos, sem erro.
      Proveniência (fonte, data, confiança por campo) segue **V2** — #422.

## 🟡 Pode esperar a 1.1

- [x] Organização do `.smart-env/` (19 MB, 96 arquivos gerados) em `generated/`,
      `cache/`, `indexes/` — e o máximo possível no `.gitignore`.
      **Resolvido por remoção, não por reorganização.** Reorganizar em três
      subpastas pressupõe que o diretório é nosso; ele não é. Os 96 `.ajson` são
      índice do **Smart Connections** (embeddings + logs de evento derivados dos
      nossos próprios READMEs), e **nenhum arquivo de `src/` ou `scripts/` lê ou
      escreve qualquer um deles** — não há gerador nosso nem consumidor nosso.
      Inventar `generated/cache/indexes/` numa pasta de ferramenta externa só
      quebraria a ferramenta. Foi para o `.gitignore` e saiu do índice, no mesmo
      bloco onde `Humanity always first/` e `GitNexus-1.6.7/` já tinham ido pelo
      mesmo motivo.
      ⚠️ **O `.gitignore` estanca o futuro, não o passado**: os 19 MB continuam
      no histórico e todo clone ainda os baixa. Tirá-los de lá exige reescrever
      histórico, o que invalidaria todo hash já publicado — decisão do operador,
      e péssima ideia às vésperas de congelar a 1.0.0.

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
- [ ] **🖥 Release 1.0.0 do app + alias `v1.` na Vercel** — só numa sessão LOCAL.
      A 1.0.0 é a última versão que o app instala sozinho, e a mudança do
      `autoDownload` precisa estar **dentro** dessa release. Passo a passo (com a
      ordem, que importa) em [`HANDOFF-LOCAL.md`](./HANDOFF-LOCAL.md#a0).
- [x] **Tabela de estabilidade no `README.md`** — **gerada** de
      `src/core/politica.js` por `npm run gen-tabela-estabilidade`, e o CI regera
      com `--verificar` e falha se divergir (mesmo padrão das bases do Arma 3).
      Escrever à mão seria promessa em dois lugares, e promessa em dois lugares
      diverge: alguém promove uma flag no código, esquece o README, e o README
      passa a mentir. Hoje: **6 estáveis · 5 beta · 3 experimentais**.
- [ ] **Triagem das 53 issues abertas** (o que é 1.0, o que é V2, o que fecha).
      Estava em "pode esperar a 1.1" e foi **promovida**: a lista mistura bug real
      com ideia solta (`#197 resolver o editor de codigo`, `#307 arrumar (supabase)`,
      `#210 temos que arrumar`), e não dá para afirmar que a 1.0.0 é sólida sem
      saber se alguma delas descreve algo quebrado no que está marcado estável.
      É varredura de leitura, não de código.
      **Levantamento feito** → [`TRIAGEM-1.0.0.md`](./TRIAGEM-1.0.0.md): as 53
      lidas, e **nenhuma descreve defeito no que está `estavel`**. As três de
      título alarmante se dissolvem — #197 é o editor (`beta`), #307 é pedido de
      V2 disfarçado de conserto, #210 é log de build de junho cujos três alertas
      já morreram. Falta só o operador **concordar com a leitura** e decidir o
      que fechar; fechar issue é decisão dele, não da sessão.
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
