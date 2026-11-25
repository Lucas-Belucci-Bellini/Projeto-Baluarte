# ADR-006 — Disponibilização somente como aplicativo durante a reconstrução

- **Status:** aceita
- **Data:** 2026-11-24
- **Contexto:** [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539), [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540)
- **Relaciona-se com:** [ADR-001](./ADR-001-1.0.0-como-ponto-de-congelamento.md), [ADR-003](./ADR-003-congelamento-e-manutencao-da-v1.md)

## Contexto

O Baluarte vinha sendo construído e distribuído como site (Vercel) e como
aplicativo desktop (Electron). A visão da V2 e o ADR-004 ainda tratavam a
“interface web” como parte do escopo, e havia expectativa de retorno do site
depois do período de indisponibilidade.

A issue #539 comunica a decisão do responsável pelo projeto: o retorno será
gradual e, neste momento, **não há previsão de retorno do site**. O
desenvolvimento está concentrado na reorganização e reconstrução da arquitetura
da V2, e o aplicativo será a única forma de acesso enquanto essa etapa durar.

## Decisão

1. Durante a reconstrução da V2, o Baluarte será disponibilizado **somente como
   aplicativo**.
2. O site **não faz parte dos planos de disponibilização** neste momento, e não
   há data definida para retorno.
3. Uma eventual versão web futura é possibilidade, não promessa: exigirá decisão
   própria, novo ADR e planejamento separado.
4. Esta decisão **não apaga** o código nem os artefatos da V1. A V1 permanece
   preservada como referência histórica e operacional, conforme o
   [ADR-003](./ADR-003-congelamento-e-manutencao-da-v1.md).

## Alternativas consideradas

- **Manter o site disponível durante a reconstrução.** Rejeitada: cria expectativa
  de continuidade e divide o esforço de uma reconstrução que muda a arquitetura
  por inteiro.
- **Manter site e app em paralelo, com escopos diferentes.** Rejeitada como
  promessa pública: hoje significaria duas superfícies para manter durante a
  reconstrução, sem ganho arquitetural.
- **Anunciar uma data de retorno.** Rejeitada: a issue #539 é explícita em evitar
  expectativa sem base.

## Consequências

**Boas.** A prioridade fica clara: a experiência, o empacotamento, a atualização e
o rollback do aplicativo são requisitos de primeira classe. O frontend TypeScript
pode assumir um shell local em vez de um servidor web público.

**Custos e restrições.** Não se investe em deploy, SEO, roteamento público ou
compatibilidade de navegador para o site novo. Quem acessava pelo navegador fica
sem essa via durante a reconstrução — é a consequência aceita e comunicada.

**O que este ADR não decide:** a tecnologia do shell (ADR-004 indica Tauri, mas a
#540 mantém o tema pendente), as plataformas suportadas, o canal de atualização e
o modelo de distribuição. Esses pontos estão em
[`arquitetura-alvo.md` §16](../v2/arquitetura-alvo.md#16-decisões-pendentes).
