# Inventário da migração — estado real antes da 1.0.0

> **Medido em 2026-08-01** contra o `main`. Números saem de
> `npm run verificar-nexus` e de `du`/`find` no repositório — nenhum foi digitado
> de memória. Mapa completo: [`nexus/dominios.json`](nexus/dominios.json) ·
> Contrato: [`NEXUS-CONTRATO.md`](NEXUS-CONTRATO.md) · Decisões:
> [`NEXUS-DECISOES.md`](NEXUS-DECISOES.md) · Plano:
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
| 21º domínio (`baluarte-geo`, D-001) | decidido, repositório ainda **não criado** |

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
| `baluarte-geo` | 6 | core, shell, data (+ Project-Vanguard) |
| `academia` · `robotica` · `jarvis-memory` · `profile` · `desktop` | 1 cada | — |
| `core` · `data` · `infra` · `docs` | 0 (não têm rota) | — |
| **Externo** `Projeto-Baluarte-Social-Media` | 2 | contrato v1.0.0 |
| **Sem dono (lacunas)** | **0** | — |

## As 2 lacunas — decididas em 2026-08-01

O plano tinha 20 domínios; o site tinha 8 rotas que não cabiam em nenhum deles.
Registro completo com contexto e consequências em
[`NEXUS-DECISOES.md`](NEXUS-DECISOES.md):

- **D-001 — geo/tático vira `baluarte-geo`, o 21º domínio.** Dono de `/mapa`,
  `/radar`, `/geo`, `/find`, `/triangulacao` e `/vanguard`. Consome o motor do
  **Project-Vanguard** em vez de reimplementar — hoje esse motor está
  *vendorizado* em `src/utils/vanguard/`, e cópia de física é duas
  implementações esperando divergir. Efeito colateral corrigido:
  `fingerprint-engine.js` sai de `cibersec` e vai pro geo, porque `/find` é
  posicionamento indoor por impressão acústica, não segurança.
- **D-002 — social vai pro `Projeto-Baluarte-Social-Media`.** `/mural` e
  `/comms` entram como **externo**: publicam rota pelo mesmo contrato, sem virar
  um 22º domínio. `src/core/comms.js` e `src/core/realtime.js` migram junto.

**Resultado: as 97 rotas têm dono. Zero órfãs.**

Pendência operacional das decisões: **o repositório `baluarte-geo` ainda não
existe no GitHub** — os outros 20 já foram criados.

## O gate da 1.0.0

O que **precisa** estar fechado antes de chamar qualquer coisa de
"Nexus Baluarte 1.0.0" — na ordem em que destrava:

- [x] **Mapa da migração medido e verificável** — `nexus/dominios.json` +
      `npm run verificar-nexus` (cobertura das 97 rotas, sem dono duplo, sem
      ciclo de dependência).
- [x] **Contrato mínimo de integração v1.0.0** — `NEXUS-CONTRATO.md`.
- [x] **Decidir as 2 lacunas** — D-001 e D-002, em
      [`NEXUS-DECISOES.md`](NEXUS-DECISOES.md). As 97 rotas têm dono.
- [ ] **Criar o repositório `baluarte-geo`** (consequência de D-001).
- [ ] **Semear os 21 repositórios** com README + `baluarte.module.js` +
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
