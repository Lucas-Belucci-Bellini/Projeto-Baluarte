# Inventário da migração — estado real antes da 1.0.0

> **Medido em 2026-08-01** contra o `main`. Números saem de
> `npm run verificar-nexus` e de `du`/`find` no repositório — nenhum foi digitado
> de memória. Mapa completo: [`nexus/dominios.json`](nexus/dominios.json) ·
> Contrato: [`NEXUS-CONTRATO.md`](NEXUS-CONTRATO.md) · Plano:
> [`PROJETO-NEXUS-BALUARTE.md`](PROJETO-NEXUS-BALUARTE.md) (issues #405/#406).

## O que existe hoje

| | |
|---|---|
| Rotas registradas em `src/main.js` | **97** |
| Páginas em `src/pages/` | 112 arquivos · 1,5 MB |
| Utilitários em `src/utils/` | 87 arquivos · 808 kB |
| Folhas em `src/styles/` | 95 arquivos · 780 kB |
| Datasets em `src/data/` | 67 arquivos · **10 MB** |
| App desktop | `desktop/` · 16 arquivos |
| Versão do site | 2.0.0 · wiki de Arma 3 em 0.9.1 (1.816 artigos) |
| **Os 20 repositórios de domínio** | **criados e 100% vazios — nem README** |

O último ponto é o que importa: a migração está em **0%**. O plano foi escrito
(#406, `docs/PROJETO-NEXUS-BALUARTE.md`, 651 linhas) e os 20 repositórios foram
abertos, mas nenhum recebeu um arquivo sequer. Tudo continua rodando do monólito.

## Distribuição das 97 rotas

| Domínio | Rotas | Depende de |
|---|---:|---|
| `baluarte-tools` | 22 | core, shell |
| `baluarte-arsenal` | 18 | core, shell, data |
| `baluarte-content` | 8 | core, shell, data |
| `baluarte-jarvis-core` | 8 | core, shell, jarvis-memory |
| `baluarte-shell` | 6 | core |
| `baluarte-cibersec` | 5 | core, shell |
| `baluarte-jarvis-tools` | 5 | core, jarvis-core, desktop |
| `baluarte-midia` | 4 | core, shell, data |
| `baluarte-audio` · `baluarte-economia` | 3 cada | core, shell, data |
| `baluarte-elites` | 2 | core, shell, data |
| `academia` · `robotica` · `jarvis-memory` · `profile` · `desktop` | 1 cada | — |
| `core` · `data` · `infra` · `docs` | 0 (não têm rota) | — |
| **Sem dono (lacunas)** | **8** | ver abaixo |

## As 2 lacunas — decisão do operador, antes de começar

O plano tem 20 domínios; o site tem rotas que não cabem em nenhum deles. São 8
rotas órfãs. Elas não podem ser descobertas no meio da migração.

**1. Geo/tático — 6 rotas** (`/mapa`, `/radar`, `/geo`, `/find`,
`/triangulacao`, `/vanguard`).
O repositório irmão **Project-Vanguard já é esse domínio** (GPS topográfico +
computador de tiro, motor com zero dependência e zero DOM — feito exatamente
pra ser consumido de fora).
→ *Recomendo:* `baluarte-geo` como 21º domínio, acoplando o Vanguard por
contrato. A alternativa (dobrar em `tools`) engorda o domínio que já é o maior.

**2. Social — 2 rotas** (`/mural`, `/comms`).
Feed + chat em tempo real, domínio que o plano não previu. Já existe o
repositório **Projeto-Baluarte-Social-Media**.
→ *Recomendo:* levar as duas pra lá, em vez de abrir um 22º.

## O gate da 1.0.0

O que **precisa** estar fechado antes de chamar qualquer coisa de
"Nexus Baluarte 1.0.0" — na ordem em que destrava:

- [x] **Mapa da migração medido e verificável** — `nexus/dominios.json` +
      `npm run verificar-nexus` (cobertura das 97 rotas, sem dono duplo, sem
      ciclo de dependência).
- [x] **Contrato mínimo de integração v1.0.0** — `NEXUS-CONTRATO.md`.
- [ ] **Decidir as 2 lacunas acima.** Bloqueia a primeira onda.
- [ ] **Semear os 20 repositórios** com README + `baluarte.module.js` +
      CI mínimo, a partir de `docs/nexus/template/`. Repositório vazio não tem
      como receber domínio.
- [ ] **Primeira onda: `core` → `shell` → `profile` → `data`** extraídos e
      rodando, com o site atual **sem regressão** (é o critério de sucesso que o
      próprio plano define).
- [ ] **Camada de composição** — o orquestrador montando módulo externo de
      verdade, não só import relativo.
- [ ] **Fila local pendente do #240** — M3c/M3d dependem da máquina; o aceite do
      motor real segue aberto e a migração não o resolve.
- [ ] **Rebranding por último.** Renomear antes de os domínios estarem estáveis
      troca o nome sem trocar o problema.

## O risco declarado

O plano diz "não migrar tudo de uma vez". O estado atual — 20 repositórios
vazios abertos de uma vez — é justamente a foto do risco de fragmentação sem
controle que ele mesmo lista. O antídoto que ficou combinado é este: contrato
antes de extração, um domínio por vez, e o monólito mandando enquanto o domínio
não passa no aceite.
