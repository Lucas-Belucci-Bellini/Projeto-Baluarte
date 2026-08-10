# Catálogo do storage local

> ⚠️ **ARQUIVO GERADO** por `scripts/gen-catalogo-storage.mjs` — não edite à mão.
> O CI regera com `--verificar` e falha se divergir.

Tudo que o Baluarte grava no navegador do operador. A pergunta que este
documento responde é **"se eu mexer aqui, o que quebro?"** — e para uma chave
de storage a resposta é: *quem toca*, *que classe* e *que versão*.

Hoje: **72 chaves declaradas**, todas com `migrar`.

As chaves aparecem no `localStorage` com o prefixo `baluarte:` — é assim
que elas surgem no DevTools, e é por isso que `clearAll()` alcança todas: o
namespace é o que torna "limpar meus dados" uma promessa cumprível.

## A regra que este catálogo cobra

**Toda chave tocada por `src/` precisa estar declarada em `src/core/politica.js`.**

Chave sem esquema não tem versão nem migração. No dia em que o formato mudar,
não existe caminho de volta para o dado já gravado: `storage.get` devolve o
fallback e o operador perde a escolha dele **em silêncio** — sem erro, sem log,
sem pista. O gerador se recusa a rodar enquanto houver chave fora da política,
e o `--verificar` do CI faz a mesma recusa no PR.

## `publico`

Pode aparecer em qualquer lugar — inclusive no bundle. Classificar assim é uma afirmação, não um descuido.

| Chave | Versão | Tocada por |
| --- | --- | --- |
| `baluarte:color-studio:color` | 1 | `src/pages/color-studio.js` · `src/utils/jarvis-tools.js` |
| `baluarte:nexus:key` | 1 | `src/utils/nexus.js` |

**Por que esta classificação:**

- `nexus:key` — Pública POR DESIGN, não por descuido: é chave de anti-abuso da RPC de ingestão, e qualquer visitante a veria no bundle de qualquer jeito (ver o cabeçalho de `utils/nexus.js`). Classificar como `publico` é a afirmação honesta — fingir que é segredo seria pior.

## `local`

Preferência da máquina. Não sai do navegador e não vale nada fora dele.

| Chave | Versão | Tocada por |
| --- | --- | --- |
| `baluarte:editor:state` | 1 | `src/pages/academia.js` · `src/pages/gerar-codigo.js` · `src/utils/editor-engine.js` · `src/utils/jarvis-tools.js` |
| `baluarte:biblioteca:state` | 1 | `src/pages/biblioteca.js` · `src/pages/elites.js` · `src/pages/universo.js` |
| `baluarte:ui:sidebarCollapsed` | 1 | `src/layout/sidebar.js` |
| `baluarte:musicas:acervoLoop` | 1 | `src/pages/musicas.js` |
| `baluarte:nucleo:glbUrl` | 1 | `src/utils/nucleo-scene.js` |
| `baluarte:perfil:config` | 1 | `src/pages/perfil.js` |
| `baluarte:permissoes` | 1 | — *(nenhum arquivo de `src/` toca)* |
| `baluarte:flags` | 1 | `src/core/flags.js` |
| `baluarte:ui:theme` | 1 | `src/utils/theme.js` |
| `baluarte:ui:universe` | 1 | `src/utils/universe-theme.js` |
| `baluarte:aviso:v2` | 1 | `src/layout/aviso-v2.js` |
| `baluarte:mark11:state` | 1 | `src/pages/ia-proprietaria.js` |
| `baluarte:academia:state` | 1 | `src/pages/academia.js` |
| `baluarte:arcade:current` | 1 | `src/utils/players-engine.js` |
| `baluarte:arcade:players` | 1 | `src/utils/players-engine.js` |
| `baluarte:arsenal:state` | 1 | `src/pages/arsenal.js` |
| `baluarte:calc:cientifica` | 1 | `src/pages/calc-cientifica.js` |
| `baluarte:calc:numerica` | 1 | `src/pages/calc-numerica.js` |
| `baluarte:calculadoras:active` | 1 | `src/pages/calculadoras/index.js` |
| `baluarte:ciberseg:state` | 1 | `src/pages/ciberseg.js` |
| `baluarte:cripto:active` | 1 | `src/pages/cripto/index.js` |
| `baluarte:dolar:state` | 1 | `src/pages/dolar.js` |
| `baluarte:dossie:state` | 1 | `src/pages/dossie.js` |
| `baluarte:economia:cache` | 1 | `src/pages/economia.js` |
| `baluarte:elites:state` | 1 | `src/pages/elites.js` |
| `baluarte:graficos:state` | 1 | `src/pages/graficos.js` |
| `baluarte:guia-pc:state` | 1 | `src/pages/guia-pc.js` |
| `baluarte:json-studio:input` | 1 | `src/pages/json-studio.js` |
| `baluarte:logic-sim:circuit` | 1 | `src/pages/logic-sim.js` |
| `baluarte:logic-sim:saved` | 1 | `src/pages/logic-sim.js` |
| `baluarte:militar-enc:cat` | 1 | `src/pages/enciclopedia-militar.js` |
| `baluarte:modpack:state` | 1 | `src/pages/modpack.js` |
| `baluarte:morse:state` | 1 | `src/pages/morse.js` |
| `baluarte:musicas:custom` | 1 | `src/pages/musicas.js` |
| `baluarte:nexus:lastTab` | 1 | `src/pages/git-nexus-cockpit.js` |
| `baluarte:paleta:recentes` | 1 | `src/utils/paleta.js` |
| `baluarte:periodic:state` | 1 | `src/pages/tabela-periodica.js` |
| `baluarte:qr-studio:mode` | 1 | `src/pages/qr-studio.js` |
| `baluarte:qr-studio:text` | 1 | `src/pages/qr-studio.js` |
| `baluarte:radio:state` | 1 | `src/pages/radio.js` |
| `baluarte:regex:state` | 1 | `src/pages/regex.js` |
| `baluarte:robotica:state` | 1 | `src/pages/robotica.js` |
| `baluarte:simbolos:state` | 1 | `src/pages/simbolos.js` |
| `baluarte:tabela-verdade:state` | 1 | `src/pages/tabela-verdade.js` |
| `baluarte:universo:state` | 1 | `src/pages/universo.js` |
| `baluarte:videos:state` | 1 | `src/pages/videos.js` |
| `baluarte:voice:lang` | 1 | `src/utils/jarvis-voice.js` |
| `baluarte:voice:on` | 1 | `src/utils/jarvis-voice.js` |
| `baluarte:webllm:semF16` | 1 | `src/utils/jarvis-webllm.js` |

**Por que esta classificação:**

- `permissoes` — Estado da própria política.
- `ui:theme` — ── local: estado de tela, preferência e cache de dado público ────────── Não sai do navegador e não vale nada fora dele. `json-studio:input` e `qr-studio:text` guardam o que o operador digitou e ficaram AQUI de propósito: são rascunho de ferramenta, e classificar todo campo de texto como `sensivel` esvaziaria o sentido da palavra.
- `aviso:v2` — Em que versão o operador fechou a faixa "V2 em construção". Guarda a VERSÃO, não um booleano: quando o aviso mudar de conteúdo, sobe-se `VERSAO_AVISO` em `layout/aviso-v2.js` e a faixa reaparece para quem já tinha dispensado — senão um aviso novo nasceria invisível justamente para quem mais acompanha o projeto. Temporária, sai com a faixa.

## `sensivel`

Diz respeito ao operador. Fica no navegador porque precisa, e nunca é enviada a lugar nenhum pelo Baluarte.

| Chave | Versão | Tocada por |
| --- | --- | --- |
| `baluarte:terminal:history` | 1 | `src/utils/terminal-engine.js` |
| `baluarte:auth:session` | 1 | `src/core/supabase-auth.js` |
| `baluarte:apis:vault` | 1 | `src/pages/apis.js` |
| `baluarte:voice:elevenKey` | 1 | `src/utils/jarvis-voice.js` |
| `baluarte:jarvis:config` | 1 | `src/utils/jarvis-engine.js` |
| `baluarte:jarvis:history` | 1 | `src/utils/jarvis-engine.js` |
| `baluarte:jarvis:memories` | 1 | `src/utils/jarvis-brain.js` |
| `baluarte:jarvis:skills` | 1 | `src/utils/jarvis-skills.js` |
| `baluarte:jarvis:guard` | 1 | `src/utils/jarvis-guard.js` |
| `baluarte:jarvis:guardlog` | 1 | `src/utils/jarvis-guard.js` |
| `baluarte:mark11:custom-skills` | 1 | `src/pages/ia-proprietaria.js` |
| `baluarte:shadow:auth` | 1 | `src/utils/auth-engine.js` |
| `baluarte:shadow:session` | 1 | `src/utils/auth-engine.js` |
| `baluarte:nucleo:wsToken` | 1 | `src/utils/nucleo-socket.js` |
| `baluarte:nucleo:wsUrl` | 1 | `src/utils/nucleo-socket.js` |
| `baluarte:geo:track` | 1 | `src/utils/geo-tracker.js` |
| `baluarte:find:db` | 1 | `src/utils/fingerprint-engine.js` |
| `baluarte:media:bookmarks` | 1 | `src/core/media-sync.js` |
| `baluarte:mural:author` | 1 | `src/pages/mural.js` |
| `baluarte:mural:posts` | 1 | `src/pages/mural.js` |
| `baluarte:vfs:tree` | 1 | `src/utils/vfs.js` |

**Por que esta classificação:**

- `terminal:history` — Histórico de comandos do terminal — o que o operador digitou.
- `auth:session` — A sessão do usuário (JWT + refresh token do Supabase). `sensivel`, **não** `secreto`, e a distinção é o ponto: `secreto` é recusado na gravação, e a sessão PRECISA viver no navegador — é assim que auth web funciona. O que a protege não é escondê-la do frontend (impossível), é ela ser o JWT do próprio usuário, de vida curta, renovável, com o RLS do banco decidindo o que ele alcança. Classificar como `secreto` aqui não deixaria o Baluarte mais seguro — deixaria o login quebrado.
- `apis:vault` — ══════════════════════════════════════════════════════════════════════════ A VARREDURA (#420 — bloqueador achado às vésperas do congelamento) ══════════════════════════════════════════════════════════════════════════ As 12 chaves acima eram as declaradas. `scripts/gen-catalogo-storage.mjs` varreu `src/` e achou **outras 59 em uso e sem esquema** — quase todas acessadas por constante (`const KEY = 'ui:theme'`), forma que um grep pelo literal dentro de `storage.get(...)` não enxerga. Por isso passaram batido por tanto tempo: quem procurou, procurou pelo padrão errado. POR QUE ISSO BLOQUEIA A 1.0.0, e não é arrumação cosmética: Chave sem esquema não tem versão. Congelar a V1 assim deixaria a V2 — que é reconstrução arquitetural, não evolução — **sem contrato nenhum** para ler o dado gravado pela V1. E o modo de falha não avisa: uma chave que ganhe esquema depois tem o dado antigo lido como versão 0 e, sem `migrar`, `storage.get` devolve o fallback (storage.js:160-166). O operador perde o que tinha sem erro, sem log, sem pista. Declarar agora, com identidade, é o que torna o congelamento reversível: a partir daqui existe um formato v1 nomeado, e a V2 tem de onde migrar. SOBRE AS CLASSES: nenhuma credencial virou `secreto`. `secreto` é RECUSADO na gravação por `core/storage.js`, e chave de API que o próprio operador digita para usar a conta dele precisa viver no navegador — marcar assim não deixaria o Baluarte mais seguro, deixaria o cofre quebrado. É o mesmo raciocínio já registrado em `auth:session` acima. `sensivel` é a afirmação correta: fica no navegador porque precisa, e o Baluarte não a envia a lugar nenhum. ── sensivel: credenciais, autenticação e conteúdo do operador ────────── O critério é "o operador se importaria se isto aparecesse numa captura de tela?". Chave de API, sessão, conversa, memória, localização, identidade e o que ele escreveu entram; estado de tela, não.

## `secreto`

**Recusada na gravação** por `core/storage.js`. Existe para que classificar errado doa na hora, em vez de vazar depois.

*Nenhuma chave nesta classe.*

## Mudar o formato de uma chave

1. Suba a `versao` em `ESQUEMAS`.
2. Escreva o `migrar(dados, de, para)` que leva o formato antigo ao novo.
3. Rode `npm run gen-catalogo-storage` e commite este arquivo.

O passo 2 não é opcional. Dado gravado antes dos envelopes é lido como
**versão 0**; sem `migrar`, `storage.get` cai no fallback e o que o operador
tinha desaparece sem barulho. É por isso que toda chave aqui — inclusive as
que nunca mudaram de formato — carrega ao menos a migração identidade.

---

Gerado de `src/core/politica.js` (valores e justificativas) e de uma varredura
de `src/**/*.js` (quem toca). Comentários são removidos antes da varredura: há
arquivo que *menciona* uma chave em prosa sem nunca tocá-la, e contá-lo seria
apontar o dedo para o arquivo errado no dia do conserto.
