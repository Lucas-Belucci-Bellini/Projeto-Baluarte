# baluarte-DOMINIO

> Domínio do **Projeto Nexus Baluarte**. Substitua `DOMINIO` e apague o que não
> se aplicar — mas **não apague as seções**: o orquestrador e as próximas
> sessões leem daqui.

**Responsabilidade:** _uma frase. Se precisar de duas, o domínio está grande._

**Estado:** `vazio` · `backlog` · `desenvolvimento` · `teste` · `estavel`
→ mantenha igual ao que está em `docs/nexus/dominios.json` no Projeto-Baluarte.

## Rotas que este domínio publica

| Rota | Título | Peso |
|---|---|---|
| `/exemplo` | Exemplo | leve |

`peso: pesado` = só carrega no app desktop (`window.baluarte.native`); na web
vira teaser "abre no app". Regra do mega-plano #238.

## Contrato

Implementa o **contrato v1.0.0** (`docs/NEXUS-CONTRATO.md` no Projeto-Baluarte).
Entrada única: [`baluarte.module.js`](baluarte.module.js).

- **Emite:** `dominio:coisa-que-aconteceu`
- **Escuta:** `outro:coisa-que-aconteceu`
- **Precisa:** `baluarte-core` (…)

Este domínio **não importa outro domínio direto** — só o `core` e o contrato.

## Rodar sozinho

```bash
npm install
npm run dev      # tem que abrir sem o monólito
```

## Regras herdadas (valem aqui também)

- **JS puro (ES2022)**, sem TypeScript e sem framework. Vite só empacota.
- **Tokens primeiro**: nada de hex ou px solto — sempre `variables.css`.
- **Por feature**: branch própria → commit → PR draft → merge com CI verde.
- **Validar no navegador**, não só no build.
- **Número sem fonte não entra.** O que não foi medido aparece como ausente,
  nunca como zero.

## Enquanto não está `estavel`

A versão que vale é a do **Projeto-Baluarte**. Este repositório é rascunho até
passar no critério de aceite do contrato (§6).
