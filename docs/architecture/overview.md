# Visão geral da arquitetura — Baluarte 1.0.0

> **Escopo:** o Baluarte **como ele é hoje**, não como ele deveria ser. Para o
> destino, veja [`v2-vision.md`](./v2-vision.md) — e note que os dois documentos
> descrevem coisas deliberadamente diferentes.

---

## O formato em uma frase

Uma **SPA em JavaScript puro (ES2022)**, sem framework, empacotada pelo Vite,
servida estaticamente pelo Vercel — e a **mesma base de código** roda dentro de
um app Electron (`desktop/`, "Baluarte Launcher") e de um Capacitor Android.

Não há servidor de aplicação. O que existe de "backend" são funções isoladas em
`api/`, o Supabase para o que é por-usuário, e GitHub Actions gerando dado.

## As camadas

```
                    index.html + src/main.js
                              │
                    ┌─────────┴─────────┐
                    │       CORE        │   src/core/
                    └─────────┬─────────┘
      router · state · events · storage · permissions · flags
                    ciclo-vida · supabase
                              │
       ┌──────────────────────┼──────────────────────┐
       ↓                      ↓                      ↓
    LAYOUT                  PAGES                  UTILS
  src/layout/            src/pages/              src/utils/
 shell · sidebar        ~100 rotas          motores e helpers
     header             1 arquivo/rota    (jarvis, terminal, nexus,
                                            effects, wikipedia…)
                              │
                              ↓
                            DATA
                          src/data/
                 gerado por scripts/ + Actions
```

### Regra que atravessa tudo: `window.baluarte.native`

O mega-plano [#238](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/238)
divide a plataforma em duas: **web = leve** (conteúdo e ferramentas leves),
**app = completo** (IA, Git Nexus, motor real). Uma base de código só, gateada
por `window.baluarte.native` — a ponte IPC que **só existe dentro do Launcher**.

No navegador, o pesado vira teaser "baixe o app". No app, ativa de verdade.

**O que quebra ao mexer:** tirar um gate faz o chunk pesado entrar no boot da web
(o `/git-nexus` sozinho são ~49 kB gz). A medição da Fase 1 do #238 fixou o boot
em ~111 kB gz — qualquer mudança aqui mexe nesse número.

---

## O que cada peça garante (e o que quebra se você mexer)

### `core/router.js` — roteamento por hash

Registro explícito em `src/main.js`; cada página é um `import()` dinâmico, então
o Vite corta um chunk por rota. Falha de import (deploy novo trocou os hashes
enquanto a aba estava aberta) tem recuperação: um reload automático com guarda
anti-loop; se já tentou ou está offline, cai em `route:error`.

**Quebra se:** você registrar rota sem colocar em `sidebar.js`, `shell.js` e
`icons.js` (a rota fica órfã — ver `CONTRIBUTING.md`), ou sem dono declarado em
`docs/nexus/dominios.json` (o CI reprova, de propósito).

### `core/events.js` — o event bus

Pub/sub. Desde o hardening, aceita curinga: `bus.on('*')` recebe tudo e
`bus.on('arsenal:*')` recebe um namespace, com o nome real do evento no segundo
argumento (`meta.event`).

**Por que o curinga importa:** histórico, telemetria, diagnóstico e o contexto do
JARVIS são ouvintes cujo trabalho é justamente *não* ter uma lista fixa. É o que
faz os módulos parecerem um sistema só em vez de ferramentas independentes.

**Quebra se:** um handler seu lançar — não derruba os outros (cada um roda
isolado), mas o erro vai pro console e o efeito dele não acontece. E `emit('*')`
lança: `*` é padrão de inscrição, não evento.

### `core/storage.js` — persistência local

`localStorage` com namespace `baluarte:`, fallback para um `Map` em memória
quando o navegador recusa (modo privado). Desde o hardening, uma chave pode
registrar **esquema**: versão + migração + classe de dado.

**O que isso evita:** dado gravado no navegador do operador é para sempre — ele
não roda migração, só abre o site de novo. Sem versionamento, mudar o formato de
uma chave transforma o dado dele em lixo silencioso.

**Quebra se:** você mudar o formato de uma chave sem subir a `versao` e escrever
o `migrar`. Na sua máquina não aparece nada — você tem o dado novo.

**Dívida conhecida:** 25 chamadas diretas a `localStorage` ainda passam por fora
do wrapper (ver [fila de hardening](../HARDENING-1.0.0.md)). Enquanto existirem,
essas chaves não têm versão nem classificação.

### `core/permissions.js` — a fronteira de acesso

Deny-by-default. Permissão precisa ser **declarada** antes de usada, e curinga
(`arsenal.*`) nunca alcança o que é `restrito`.

**Para que serve:** hoje o único chamador é o operador clicando. No momento em
que um agente (JARVIS agente, MCP, Nexus) escolher a ação sozinho, "executa e
pronto" vira acesso irrestrito. A regra é `JARVIS → Permission → Tool`.

**Estado:** o motor existe e está **vazio** — falta declarar as permissões reais
e pôr as tools do JARVIS atrás dele.

### `core/flags.js` — estabilidade e liberação

`estavel` / `beta` / `experimental`, mais o gate `web`/`app`/`ambos`. Uma flag
experimental **não pode** nascer ligada por padrão — é isso que dá sentido à
definição de 1.0.0 (ver [ADR-001](./decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md)).

**Quebra se:** nada. Flag não declarada é sempre `false`, e o ambiente começa em
`'web'` (o caso mais fechado) justamente para que esquecer de configurar não
vaze funcionalidade de app para a web.

### `core/ciclo-vida.js` — desmontagem de página

Ganchos de saída por página, executados na ordem inversa do registro (como um
`defer`). É o que impede vazamento entre rotas.

**Quebra se:** uma página registrar listener/timer/AudioNode/objeto Three.js e
não registrar a limpeza. O sintoma não aparece na navegação seguinte — aparece na
centésima.

---

## Dados: fonte, gerador e gerado

```
scripts/arma3/*.py        src/data/arma3-*.js
scripts/gen-*.mjs    →    public/arma3/…          →   páginas
(fonte + parsers)         (GERADO — não editar)
```

Os arquivos em `src/data/` que têm gerador **são saída**, não fonte. O CI regera
tudo a partir do dump versionado em `scripts/arma3/out/` e falha se o resultado
divergir do commit — ou seja, editar `src/data/arma3-*.js` à mão é reprovado
automaticamente, e isso é intencional.

---

## Onde o CI cobra o quê

| Workflow | Cobra |
|---|---|
| `ci.yml` | build · `verificar-nexus` (toda rota tem dono declarado) · testes · parsers/imagens/pipeline/modelos do Arma 3 · bases geradas em dia com o gerador |
| `smoke.yml` | **todas** as rotas abertas num Chromium de verdade, de hora em hora; rota vermelha vira issue |
| `codeql.yml` | análise estática |

A regra do projeto é "merge quando o CI ficar verde". Esses três são o verde.

---

## O que este documento **não** cobre

JARVIS, Nexus e o app desktop têm profundidade própria e documento próprio (ou
terão — ver o [índice](./README.md)). Aqui ficou só o que qualquer mudança
atravessa.
