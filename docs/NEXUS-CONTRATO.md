# Contrato de integração do Nexus — v1.0.0

> **O que é:** a interface única entre os 20 repositórios de domínio e o
> orquestrador. Enquanto isto não existir, "separar em 20 repositórios" é
> fragmentação, não arquitetura — é a condição que o próprio plano
> ([`PROJETO-NEXUS-BALUARTE.md`](PROJETO-NEXUS-BALUARTE.md) / issue #406) coloca.
>
> **Quem manda:** o mapa de quem leva o quê é
> [`nexus/dominios.json`](nexus/dominios.json), cobrado por
> `npm run verificar-nexus` contra o `src/main.js` real.

---

## A regra que sustenta o resto

**Um domínio não conhece outro domínio.** Ele conhece o `core` e o contrato.
Se `arsenal` precisar de algo do `midia`, isso passa pelo barramento de eventos
ou vira um dado no `data` — nunca um `import` direto de repositório irmão.

É o que permite reescrever um domínio inteiro sem abrir os outros 19, que é o
objetivo declarado da migração. Sem essa regra, os 20 repositórios viram o mesmo
monólito com 20 `git clone`.

---

## 1. O manifesto: `baluarte.module.js`

Todo repositório de domínio expõe **um único arquivo de entrada** na raiz.
O orquestrador não lê mais nada além dele.

```js
export default {
  nome: 'arsenal',              // == nome do repositório, sem o prefixo
  versao: '0.1.0',              // semver do DOMÍNIO, independente do site
  contrato: '1.0.0',            // versão deste contrato que o módulo implementa
  natureza: 'paginas',          // paginas | biblioteca (ver §1.1)

  /* Rotas que o domínio publica. `load` é sempre import() dinâmico:
   * é o que mantém o code-splitting que o site já tem hoje. */
  rotas: [
    {
      path: '/arsenal',
      titulo: 'Arsenal',
      icone: 'arsenal',                       // chave no icons.js do core
      peso: 'leve',                           // leve | pesado (ver §4)
      load: () => import('./src/paginas/arsenal.js'),
    },
  ],

  /* Barramento: o que emite e o que escuta. Declarar é obrigatório —
   * evento não declarado é dependência invisível. */
  eventos: {
    emite: ['arsenal:arma-selecionada'],
    escuta: ['perfil:mudou'],
  },

  /* Dependências. Só domínio que existe no mapa, e o grafo não pode ter ciclo
   * (o verificar-nexus.mjs cobra os dois). */
  precisa: ['baluarte-core', 'baluarte-shell', 'baluarte-data'],

  /* Opcional: sobe quando o módulo entra; desmonta quando sai. */
  async iniciar(ctx) {},
  async parar() {},
};
```

### 1.1 `natureza` — nem todo domínio publica tela

Quatro dos 21 não têm rota e nunca vão ter: `core`, `data`, `infra` e `docs`.
Eles são consumidos, não navegados. Sem essa distinção, "domínio sem rota"
seria indistinguível de "domínio que ainda não extraiu nada" — e o verificador
não teria como cobrar nem um nem outro.

| `natureza` | Quem | Regra |
|---|---|---|
| `paginas` | os outros 17 | publica rota. Enquanto `rotas` estiver vazio, `planejado` diz o que vem — um dos dois é obrigatório. |
| `biblioteca` | `core`, `data`, `infra`, `docs` | `rotas` **tem que** ficar vazio. Rota aqui é erro de contrato, não domínio adiantado. |

### Nomes de evento

`dominio:coisa-que-aconteceu` — minúsculas, sem acento, passado.
O prefixo é sempre o nome do domínio que **emite**. Assim, lendo o evento,
se sabe de quem cobrar.

---

## 2. O que o `core` entrega (superfície estável)

O contrato do `core` é o que já existe hoje em `src/core/` e
`src/utils/helpers.js` — não é API nova, é a API atual promovida a contrato:

| Import | Entrega |
|---|---|
| `router` | `register(path, handler)`, `navigate(path)`, rotas com `:param` |
| `bus` | `on/off/emit` — o barramento de eventos |
| `appState` | estado global da sessão |
| `storage` | persistência local com prefixo `baluarte:` |
| `h`, `empty` | hyperscript — **mesma assinatura do Vanguard**, de propósito |
| `toast`, `icons`, `theme` | avisos, ícones e tema |

**Um handler de rota devolve um nó do DOM.** É o que o `shell` monta. Nada de
o domínio pintar direto no `document` — quem pinta é o shell.

Quebra nessa superfície é **major** no `core`. Todos os 20 dependem dela.

---

## 3. Versionamento

- Cada domínio versiona sozinho (`versao`), e declara qual `contrato` implementa.
- O orquestrador recusa módulo com `contrato` de major diferente do dele.
  Melhor falhar no boot com mensagem clara do que renderizar meio quebrado.
- O `core` é o único que pode forçar migração dos 20 — por isso ele muda pouco
  e com aviso.

---

## 4. Peso: o gate do mega-plano #238 continua valendo

A regra "**web = leve, app = completo**" não é revogada pela migração — ela vira
campo do contrato. `peso: 'pesado'` significa: no navegador o orquestrador mostra
o teaser "abre no app" e **não** carrega o chunk; no launcher
(`window.baluarte.native`) carrega de verdade.

Hoje já são pesados por medição: `git-nexus` (~49 kB gz), `arsenal` (~51 kB gz),
`dossie` (~43 kB gz). Marcar peso errado é regressão de boot — o número existe
e está medido no #238.

---

## 5. Dados

`baluarte-data` não tem rota: ele publica datasets e schemas. Duas regras que já
custaram caro e continuam valendo:

- **Base gerada por script não se edita à mão.** As bases `arma3-*` saem dos
  geradores em `scripts/arma3/` e escrevem em dois repositórios (aqui e no
  Project-Vanguard). Editar à mão é perder a edição no próximo dump e fazer as
  duas bases divergirem em silêncio.
- **Número sem fonte não entra.** O que não foi medido aparece como ausente,
  nunca como zero.

---

## 6. Critério de aceite de um domínio

Um domínio só sai de `desenvolvimento` quando:

- [ ] tem `baluarte.module.js` válido e um README que diz o que ele é;
- [ ] roda sozinho (`npm run dev` no próprio repositório) sem o monólito;
- [ ] o orquestrador monta as rotas dele sem quebrar o fluxo principal;
- [ ] foi visto no navegador — não só "buildou";
- [ ] o `estado` dele foi atualizado em `nexus/dominios.json`.

Maturidade: `vazio` → `backlog` → `desenvolvimento` → `teste` → `estavel`.

---

## 7. Durante a migração, o monólito manda

Enquanto um domínio não estiver `estavel`, **a versão que vale é a do
Projeto-Baluarte**. O repositório de domínio é rascunho até passar no aceite.
Nada de duas versões vivas da mesma página disputando qual é a verdade — foi
esse tipo de divergência silenciosa que motivou a migração.
