# ADR-005 — V2 como aplicativo, frontend TypeScript e backend Python, Rust e C++

- **Status:** aceita
- **Data:** 2026-11-24
- **Contexto:** [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) (arquitetura-alvo), [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) (somente app)
- **Revê parcialmente:** [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md)
- **Documento de arquitetura:** [`docs/architecture/v2/arquitetura-alvo.md`](../v2/arquitetura-alvo.md)

## Contexto

O ADR-004 (2026-08-11) escolheu a stack da V2 com base em benchmark e fixou:
TypeScript na interface e no Core de Orquestração, Rust no Core de Runtime,
Python em IA/coleta/automação, PostgreSQL em dados e fila, Tauri no app. Na mesma
decisão, **Go, C e C++ ficaram de fora**, com o argumento de que não cobriam nada
que Rust não cobrisse com garantia a mais.

A issue #540 estabelece uma direção nova para a V2 e o responsável pelo projeto
confirmou três pontos: a V2 é uma reconstrução arquitetural (não incremental),
**todo o frontend será TypeScript** e **o backend reunirá Python, Rust e C++**.
A issue #539 acrescenta que, durante a reconstrução, o Baluarte será
disponibilizado **somente como aplicativo**.

Isso deixa duas partes do ADR-004 desatualizadas: a exclusão de C++ e o
enquadramento de “interface web”. O restante da análise continua válido — os
números, as fronteiras e a divisão Rust/Python/TypeScript não foram refutados.

## Decisão

1. **A V2 é um aplicativo local-first**, e o aplicativo é o produto. A
   disponibilização segue o [ADR-006](./ADR-006-disponibilizacao-somente-app.md).
2. **Todo o frontend da V2 é escrito em TypeScript.** A migração de JavaScript
   para TypeScript acontece **junto com a reconstrução arquitetural**, nunca como
   conversão isolada.
3. **O backend da V2 reúne Python, Rust e C++**, com divisão de
   responsabilidades a formalizar em ADRs próprios.
4. **O ADR-004 permanece válido no que não conflita com esta decisão**:
   Rust no Core de Runtime e nos parsers binários; Python em IA, coleta e
   automação; TypeScript na interface e no Core de Orquestração; Tauri como
   destino do shell, pós-1.0.0.
5. **A exclusão de C++ do ADR-004 fica revogada.** C++ entra como linguagem de
   bibliotecas nativas especializadas, com fronteira C ABI e **justificativa
   técnica mensurável** — benchmark e caso de uso real antes da primeira linha.
   Não é sinal verde para reimplementar em C++ o que Rust já resolve.

## Alternativas consideradas

- **Manter o ADR-004 sem C++.** Rejeitada: contraria a direção confirmada na
  #540 e ignora integrações com SDKs que expõem API C/C++.
- **Backend em uma única linguagem.** Rejeitada: descartaria o ecossistema Python
  para IA e as garantias de Rust para execução local, já justificados e medidos.
- **Criar um repositório novo para a V2.** Já rejeitada na
  [Decisão 3](../../v2/V2_DECISION_LOG.md): transformaria reconstrução em
  reconstrução + migração.
- **Adotar C++ como segundo Core.** Rejeitada: duplicaria responsabilidades e
  criaria duas fontes de verdade para as mesmas regras.

## Consequências

**Boas.** A direção fica sem ambiguidade: frontend TypeScript, backend poliglota,
app como único canal. Cada camada já tem dono definido para o que existe hoje, e a
inclusão de C++ abre caminho para SDKs nativos sem transformar a linguagem em
critério estético.

**Custos, sem maquiagem.** Três toolchains em build, teste, depuração e
distribuição. A fronteira C ABI precisa ser projetada e mantida. O empacotamento
de Rust, Python e C++ dentro do aplicativo passa a ser requisito de release, não
detalhe. E existe risco real de sobreposição entre Rust e C++ — mitigado pela
regra de que **uma responsabilidade tem um único dono**.

**Continua pendente** (não decidido por este ADR): a divisão fina entre as três
linguagens, a linguagem do Core/Host, o mecanismo de comunicação, o banco, o
shell, o empacotamento e as plataformas. A lista completa, com estado e impacto,
está em [`arquitetura-alvo.md` §16](../v2/arquitetura-alvo.md#16-decisões-pendentes).
