# V2 — Proposta de arquitetura

> **Status: proposta.** Nenhuma linha de Core foi escrita. Este documento é o
> passo 1 da ordem do [`V2_MASTER_PLAN.md`](./V2_MASTER_PLAN.md) §26
> (*arquitetura → Core → Module System → contratos → migração → módulos*) e
> cumpre a regra do operador: *"quando a mudança for arquitetural, NÃO
> implementar imediatamente — primeiro apresentar problema, arquitetura atual,
> arquitetura proposta, alternativas, riscos, impacto e plano de migração."*
>
> **Pendência conhecida:** a V1 ainda **não foi congelada** (não existe tag
> `v1.0.0`, o app não foi publicado, o PR do hardening está aberto). Pela ADR-001
> a construção começa depois disso. Projetar antes é legítimo — implementar não.

---

## 1. O que foi medido

Nada aqui é impressão. Números do repositório em 2026-08-10:

| Camada | Arquivos | Linhas |
| --- | ---: | ---: |
| `src/core/` | 17 | 2.593 |
| `src/layout/` | 5 | 858 |
| `src/pages/` | 114 | 32.249 |
| `src/utils/` | 96 | 18.294 |
| `src/data/` | 59 | 21.138 |
| `src/styles/` | 97 | 18.940 |

**O acoplamento é melhor do que a intuição sugeria.** Duas coisas que costumam
estar podres num projeto deste tamanho estão sãs:

- **zero inversão de dependência** — nenhum arquivo de `core/`, `utils/` ou
  `layout/` importa de `pages/`;
- **quase nenhum acoplamento lateral** — só 2 arquivos em `pages/` importam
  outra página, e ambos são índices agregando painéis da própria pasta
  (`calculadoras/`, `cripto/`).

Isso **muda o diagnóstico**: o problema da V1 não é espaguete. É outra coisa,
mais específica e mais consertável.

### O hub

`utils/helpers.js` tem **120 importadores**. Depois dele: `storage.js` (60),
`toast.js` (52), `router.js` (34). Um módulo com 120 dependentes não é
necessariamente errado — mas é o ponto onde qualquer mudança é cara, e na V2 ele
precisa virar interface explícita do Core, não um saco de utilidades.

### O defeito que prova a tese

Adicionar **uma** página hoje exige tocar em, no mínimo, estes lugares:

```
src/pages/x.js          (a página)          src/data/site-capabilities.js  (45 rotas)
src/main.js             (99 registros)      src/utils/jarvis-engine.js     (31 rotas)
src/layout/sidebar.js   (70 entradas)       src/utils/icons.js             (29 rotas)
src/layout/shell.js     (68 títulos)        docs/nexus/dominios.json       (98 rotas)
src/styles/x.css        (+ <link>)          src/core/politica.js           (se guardar dado)
```

Dez lugares. A [definição de sucesso da V2](./V2_MASTER_PLAN.md#definição-de-sucesso)
diz, literalmente, que ela terá cumprido sua função quando *"adicionar uma nova
funcionalidade deixar de exigir alterações em dezenas de partes não
relacionadas"*. **Está medido: são dez.**

E não é risco teórico — **a duplicação já derivou**:

| | `sidebar.js` | `shell.js` |
| --- | --- | --- |
| `/cripto` | Lab de Cripto | Lab de Criptografia |
| `/jogos` | Arcade Baluarte | Jogos de Aprendizado |
| `/dossie` | Dossiê de Forças | Dossiê |
| `/filmes` | Cinema | Cinema do Baluarte |
| `/graficos` | Gráficos | Gerador de Gráficos |

**22 rotas com label divergente** entre os dois arquivos, e **31 rotas
registradas sem título nenhum no shell**. Ninguém errou: a mesma verdade está
declarada em dois lugares, e dois lugares divergem com o tempo. É o mecanismo,
não o descuido.

> É cosmético e **não** justifica mexer na V1 congelando. Vale como exibit: o
> problema da V1 é que **não existe um lugar onde um módulo se declare**.

---

## 2. Diagnóstico

> **O problema da V1 não é acoplamento entre módulos. É a ausência de manifesto.**

Cada capacidade do Baluarte hoje se declara por **presença espalhada**: existe
porque `main.js` registrou, porque `sidebar.js` listou, porque `shell.js` tem
título, porque `icons.js` tem ícone. Não há nenhum lugar onde se pergunte *"o que
é o módulo `/cripto`?"* e se obtenha uma resposta.

Uma peça da V1 já faz exatamente isso, e é o modelo a seguir: **`core/politica.js`
é o lugar único onde o Baluarte declara o que existe** — permissões, esquemas de
storage, tabela de estabilidade. Ele já provou o padrão em pequena escala, e os
três geradores (`gen-catalogo-eventos`, `gen-catalogo-storage`,
`gen-tabela-estabilidade`) já provam que **derivar documentação do código
funciona** e que o CI consegue cobrá-la.

**A V2 é a generalização disso para tudo.** Não é uma ideia nova para o projeto —
é a ideia que já funciona em `politica.js`, aplicada ao resto.

---

## 3. A proposta central — Module Manifest

Um módulo se declara em **um** arquivo. Tudo o mais é **derivado**.

```js
// modules/cripto/module.js
export default {
  id: 'cripto',
  name: 'Lab de Criptografia',        // ← UMA fonte. Sidebar e header leem daqui.
  version: '1.0.0',
  stability: 'estavel',
  icon: '🔐',
  routes: [{ path: '/cripto', view: () => import('./view.js') }],
  nav: { section: 'ferramentas', order: 30 },
  permissions: ['USER_DATA'],          // o que ele pode pedir
  storage: [{ key: 'cripto:prefs', version: 1, class: 'local', migrate }],
  events: { emits: ['cripto:cifrado'], consumes: [] },
  api: { encrypt, decrypt },           // o que oferece a outros módulos
  lifecycle: { init, start, stop, dispose }
};
```

**O que isso mata, na ordem em que dói hoje:**

| Hoje | Com manifesto |
| --- | --- |
| label em 2 arquivos → 22 divergências | 1 campo `name` |
| rota em `main.js` + `dominios.json` | `routes[]`, e o mapa é gerado |
| ícone em `icons.js` | `icon` |
| ordem na sidebar hard-coded | `nav.order` |
| permissão mapeada à parte | `permissions[]` |
| esquema de storage em `politica.js` | `storage[]` |
| capacidade em `site-capabilities.js` | derivado do manifesto |

E habilita o que a V1 **não consegue**: saber quais módulos existem, quais estão
ativos, quais dependem de quê, e **remover um módulo** sem caçar referências.

> ⚠️ **O manifesto não é registro passivo.** Se ele apenas *descrever* enquanto o
> código continua registrando por conta própria, a V2 terá **onze** lugares em vez
> de dez. O Core precisa **consumir** o manifesto — a sidebar renderiza a partir
> dele, o router registra a partir dele, as permissões nascem dele. Manifesto que
> não é a fonte da verdade é documentação, e documentação diverge.

---

## 4. Os 17 sistemas — o que existe, e a decisão

A Regra 2 do plano exige decidir, para cada componente da V1: **manter ·
refatorar · reescrever · substituir · remover** — pela arquitetura da V2, não
pelo esforço já gasto.

| # | Sistema | Estado na V1 | Decisão | Por quê |
| --- | --- | --- | --- | --- |
| 1 | **Core** | não existe como conceito; `src/core/` é uma pasta, não um núcleo com fronteira | **construir** | é o item que não tem equivalente |
| 2 | **Module System** | ✗ inexistente | **construir** | é *a* entrega da V2 |
| 3 | **Module Registry** | ✗ (`main.js` é registro implícito de rotas) | **construir** | |
| 4 | **Module Lifecycle** | parcial: `utils/ciclo-vida.js` (12 importadores) | **refatorar** | o conceito existe e funciona; falta contrato e `dispose` garantido |
| 5 | **Event Bus** | ✅ `core/events.js` — curinga, `meta.event`, catálogo gerado | **manter** | atende a §7 do plano quase inteira; falta `versão` e `origem` no envelope |
| 6 | **API interna** | ✗ módulos não expõem API; comunicação é import direto | **construir** | |
| 7 | **API externa** | ✗ | **preparar só a interface** | Regra 17/18 — projetos externos são V2 tardia |
| 8 | **Storage Layer** | ✅ `core/storage.js` — 72 chaves, versão, migração, classe, backup | **manter e generalizar** | a peça mais madura da V1; falta ser *por módulo* |
| 9 | **Permission System** | ✅ `core/permissions.js` — deny-by-default, `JARVIS → Permission → Tool` | **manter e generalizar** | o modelo está certo; falta o sujeito ser o módulo |
| 10 | **Configuration** | ✗ espalhada (Regra 9 violada hoje) | **construir** | |
| 11 | **Logging** | ✗ `console.*` direto | **construir** | Regra 7 e 35 dependem disso |
| 12 | **Diagnostics** | ✅ `/diagnostico` mostra permissões, flags, esquemas, sondas | **refatorar** | vira leitor do Registry |
| 13 | **Feature Flags** | ✅ `core/flags.js` — estável/beta/experimental + gate web/app | **manter** | |
| 14 | **Testing** | ✅ 463 testes + smoke de 97 rotas + 3 geradores no CI | **manter** | a infraestrutura serve à V2 sem mudança |
| 15 | **Error Handling** | parcial: tetos de rede, degradação em cota | **refatorar** | falta classificação e isolamento por módulo (§6) |
| 16 | **Versioning** | ✅ por chave de storage · ✗ por módulo | **estender** | |
| 17 | **Compatibility Layer** | ✗ | **construir** | é onde entra o backup V1 como ponte |

> ⚠️ **Correção — esta tabela tinha um viés.** A versão original concluía aqui
> *"sete dos dezessete já existem e ficam"*, apresentando isso como economia. Era
> o argumento do esforço já gasto, que a [Regra 2](./V2_MASTER_PLAN.md#2-a-regra-mais-importante)
> proíbe em uma frase: *"'nós já temos isso' NÃO é motivo suficiente para manter
> código"*.
>
> A leitura correta: sete peças **passam no critério da V2 por mérito próprio** —
> o Event Bus tem catálogo gerado, o Storage tem versão e migração por chave, as
> Permissions negam por omissão. Elas ficam porque atendem ao que a arquitetura
> nova exige, e não porque custaram caro. Se alguma deixar de atender quando o
> Module System existir, ela sai.
>
> E a decisão vale por **camada**, não pelo projeto: as tabelas acima falam da
> arquitetura, não da linguagem. A escolha de tecnologia foi refeita do zero em
> [`V2_STACK.md`](./V2_STACK.md) — inclusive a de `src/data/`, 21 mil linhas de JS
> que são banco de dados disfarçado de código e **não sobrevivem** à V2.

---

## 5. Ordem de construção

```
1. Core mínimo          config · logging · errors           (nada depende de módulo)
2. Module Manifest      o formato + validador               (contrato antes de consumidor)
3. Module Registry      carregar, listar, resolver deps
4. Adaptar o existente  storage · permissions · events → por módulo
5. Lifecycle + isolamento   §6: módulo quebrado não derruba o Core
6. UM módulo de prova   migrar /cripto pelo caminho novo
7. Migração em lote     as demais rotas, em ondas
8. Só então             módulos grandes (Data Layer, JARVIS, IDE, 3D)
```

**O passo 6 é o portão.** `/cripto` é o candidato: tem 27 testes, motor isolado
(`cripto-engine.js`, 10 importadores), sem rede e sem estado global. Se um módulo
com essas características não couber no manifesto sem gambiarra, o formato está
errado — e é infinitamente mais barato descobrir isso no primeiro do que no
quinquagésimo.

> ✅ **Feito, e os casos difíceis também.** O risco que estava escrito aqui —
> *formato validado só contra o caso fácil erra nos difíceis* — foi fechado com
> `/militar` (15 rotas, rede, id de estabilidade que não bate) e `/editor` (chave
> escrita por outro módulo). O contrato aguentou os dois **sem mudar**, e os dois
> revelaram achados que estão em [`V2_MODULE_RULES.md`](./V2_MODULE_RULES.md):
> módulo **não** é rota (as 99 não viram 99 módulos), e o namespace de storage
> torna impossível por construção o acoplamento que o JARVIS tem hoje com o
> editor. Testes: `test/v2/modulos-dificeis.test.js`.

---

## 6. Riscos

| Risco | Por que é real | Mitigação |
| --- | --- | --- |
| **Manifesto vira documentação** | é o modo de falha mais provável, e o mais silencioso: tudo parece certo enquanto diverge | o Core **consome** o manifesto; um gerador cobra no CI, como os 3 de hoje |
| **Big bang nas 99 rotas** | migrar tudo de uma vez é a Regra 28 ao contrário | ondas; a V1 segue servindo em `release/v1.x` |
| **Core inchado** | Regra 34 — cada coisa parece pertencer ao Core | regra de admissão: entra no Core só o que **todo** módulo precisa |
| **Abstração antes do segundo caso** | um Module System desenhado com um módulo na cabeça erra | migrar **três** módulos diferentes (`/cripto` puro, `/editor` com estado pesado, `/militar` com rede) antes de congelar o contrato |
| **Perda de dado na migração** | já quase aconteceu nesta sessão | o backup com versão por chave existe e é a ponte |
| **A V2 parecer parada por meses** | é real e esperado (Decisão 9) | marcos verificáveis: manifesto validado, registry listando, `/cripto` migrado |

---

## 7. O que **não** entra na V2

Regra 17, Regra 18 e §23 (*preparar ≠ implementar*). Ficam como **interface sem
implementação**:

- **Sensor API** sem sensor físico
- **3D Engine API** sem os modelos
- **JARVIS Tool API** sem os agentes
- **Desktop API** sem o Baluarte OS
- **Social** — arquitetura, não rede social
- **IDE** — infraestrutura, não IDE

E uma que **não** é "preparar": a **Data Layer com proveniência**
([Decisão 5](./V2_DECISION_LOG.md)). Essa é fundação — se cada bot tiver o
próprio formato, volta o problema que a V2 existe para resolver. Mas vem
**depois** do Module System, porque é um módulo grande e o passo 8 é o passo 8.

---

## 8. Como se mede o sucesso

O critério não é "tem mais coisa que a V1". É:

```
Adicionar uma página nova em V1:  10 arquivos
Adicionar um módulo novo em V2:    1 manifesto + o código do módulo
```

Verificável por teste: *criar um módulo de mentira, registrar, ver aparecer na
navegação, no diagnóstico e no catálogo — sem editar nenhum arquivo do Core.*
Enquanto esse teste não passar, o Module System não está pronto.

---

## Decisões que precisam do operador

Pela Regra 26 — *o agente deve parar quando não souber; documentar a dúvida e
solicitar decisão*:

1. **A V1 não está congelada.** Não existe tag `v1.0.0`, o app não foi publicado
   e o PR do hardening está aberto. Construir Core antes disso contraria a
   ADR-001. **Seguir mesmo assim, ou fechar a V1 primeiro?**
2. **Branch.** A §21 manda a V2 viver em `v2-development`, e esta proposta está
   numa branch de trabalho da V1. Criar `v2-development` a partir de quê — do
   `main` atual, ou da tag `v1.0.0` quando existir?
3. **Rotas vs. módulos.** As 99 rotas viram 99 módulos, ou módulos maiores com
   várias rotas (o Centro Militar já consolidou 13 frentes numa entrada)? Muda o
   desenho do manifesto.
4. **JS puro na V2?** A V1 é "JS puro, sem framework, não negociável". O #420
   menciona TypeScript para a V2. Contratos de módulo são exatamente onde tipos
   pagam mais. **Continua não negociável, ou a V2 reabre isso?**
