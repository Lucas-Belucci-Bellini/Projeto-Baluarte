# Inventário da migração — estado real antes da 1.0.0

> **Medido em 2026-08-02** contra o `main`. Números saem de
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
| Repositórios de domínio | **21**, todos semeados (manifesto + verificador + CI) |
| Extraídos e rodando sozinhos | **4** — core, shell, profile, data |
| Arquivos com dono no mapa | **363** (rotas, páginas, folhas, datasets) |

**O monólito segue intacto.** Nenhum arquivo de `src/` foi movido — só copiado.
Enquanto um domínio não estiver `estavel`, a versão que vale é a deste
repositório. É o que permite migrar sem apostar o site.

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

Duas decisões vieram depois, ao extrair de verdade:

- **D-003 — a home recebe destaques declarados** em vez de importar dataset de
  três domínios. Tirou 122 kB do boot da web e fechou a maior violação de
  contrato que existia.
- **D-004 — o rótulo do skin de universo é do shell**, não do content.

## O gate da 1.0.0

O que **precisa** estar fechado antes de chamar qualquer coisa de
"Nexus Baluarte 1.0.0" — na ordem em que destrava:

- [x] **Mapa da migração medido e verificável** — `nexus/dominios.json` +
      `npm run verificar-nexus` (cobertura das 97 rotas, sem dono duplo, sem
      ciclo de dependência).
- [x] **Contrato mínimo de integração v1.0.0** — `NEXUS-CONTRATO.md`.
- [x] **Decidir as 2 lacunas** — D-001 e D-002, em
      [`NEXUS-DECISOES.md`](NEXUS-DECISOES.md). As 97 rotas têm dono.
- [x] **Criar o repositório `baluarte-geo`** (consequência de D-001).
- [x] **Semear os 21 repositórios** — manifesto, verificador de contrato e CI
      em cada um, derivados do mapa.
- [x] **Primeira onda: `core` → `shell` → `profile` → `data`** extraídos, cada
      um rodando sozinho com teste em `node --test` e CI verde. O monólito
      segue intacto — nenhum arquivo de `src/` foi movido, só copiado.
- [ ] **Camada de composição** — o orquestrador montando módulo externo de
      verdade, não só import relativo.
- [ ] **Fila local pendente do #240** — M3c/M3d dependem da máquina; o aceite do
      motor real segue aberto e a migração não o resolve.
- [ ] **Rebranding por último.** Renomear antes de os domínios estarem estáveis
      troca o nome sem trocar o problema.

## O que a extração real ensinou

Cada domínio extraído achou problema que o mapa sozinho não mostrava — e todos
viraram check no `verificar-nexus`, que hoje cobra **12 invariantes**:

| Achado | Como apareceu | Guarda que ficou |
|---|---|---|
| 4 arquivos com **dois donos** | lendo o grafo de imports do core | check 9: arquivo com dono duplo |
| 4 páginas do shell **sem dono** | shell prometia `/sobre` sem ter o arquivo | check 10: página de rota tem dono |
| **93 de 95 folhas** de CSS sem dono | CSS não aparece em import de rota | check 11: folha tem dono |
| **36 datasets** sem dono | a entrada do data era prosa, não lista | check 12: dataset tem dono |
| core **não carregava fora do Vite** | `import.meta.env` no topo do módulo | teste que importa o barril em Node |
| home importava 3 domínios | extração do shell | D-003 + teste que varre `src/` |

O plano dizia "não migrar tudo de uma vez", e o antídoto seguiu valendo:
contrato antes de extração, um domínio por vez, e o monólito mandando enquanto
o domínio não passa no aceite.

## Próximo passo

A **camada de composição**: o orquestrador montando módulo externo de verdade —
carregando os manifestos, juntando os `destaques` e registrando as rotas no
router. É o que transforma quatro repositórios que rodam sozinhos num sistema.
