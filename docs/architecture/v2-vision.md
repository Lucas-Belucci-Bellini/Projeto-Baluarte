# Visão da V2 — a bússola

> ⚠️ **Este documento não é para ser implementado agora.**
>
> Ele existe porque a issue [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420)
> pediu exatamente isso: escrever o destino **antes** de fechar a 1.0.0, e não
> começar a construir. Enquanto a 1.0.0 não fechar, este arquivo serve para
> **decidir o que não fazer** — nada mais.
>
> Decisão fechada em [ADR-001](./decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md).

---

## O que mudou o problema

O Baluarte deixou de caminhar para "um site com muitas ferramentas". O destino é
**um hub que reúne, indexa e conecta projetos** — inclusive projetos externos que
nem moram neste repositório, possivelmente nem nesta máquina.

Isso muda a pergunta de arquitetura. Não é mais "como organizo 100 páginas?", é:

> **como um projeto que eu ainda não escrevi se conecta ao Baluarte sem que o
> Baluarte precise conhecê-lo por dentro?**

---

## Os oito objetivos

São a bússola. Qualquer decisão da V2 se justifica apontando para um deles.

1. O Baluarte funciona como **plataforma**, não como site.
2. Projetos externos conseguem **se conectar** sem alterar o núcleo.
3. O **JARVIS é independente da UI**.
4. O **Knowledge Engine é independente do frontend**.
5. **MCP é uma interface de integração**, não o produto.
6. **Módulos são independentes** entre si.
7. **Dados têm proveniência** — de onde veio, quando, com que confiança.
8. O **Core não depende de nenhuma interface específica**.

O teste de qualquer proposta da V2: se ela quebra um destes, está errada mesmo
que o código seja bonito.

---

## A forma pretendida

```
                     BALUARTE
                        │
                  PLATFORM CORE
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Knowledge        Registry       Permissions
        │               │               │
        └───────────────┼───────────────┘
                        ↓
                   ORCHESTRATOR
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          JARVIS     MODULES    PROJECTS
             │                     │
             └──────────┬──────────┘
                        ↓
                       MCP
```

A diferença que carrega tudo: **projeto externo vira integração, não parte
obrigatória do Core.**

### Project Registry

Um projeto se descreve; o Baluarte descobre. Sem `if (project === "X")` — essa
cadeia de `if` é a bomba-relógio que a V2 existe para não construir.

```json
{
  "id": "projeto-x",
  "name": "Projeto X",
  "version": "1.4.0",
  "type": "external",
  "capabilities": ["knowledge.search", "documents.read"],
  "endpoint": "…",
  "status": "online"
}
```

### Capabilities, não plugins

O Baluarte entende **o que o projeto sabe fazer**, sem saber como ele foi
programado. O JARVIS consulta o registry → capabilities → tools, e funciona com
qualquer projeto que respeite o contrato.

---

## Stack

| Linguagem | Papel |
|---|---|
| **TypeScript** | Core, web, APIs, módulos, MCP |
| **Python** | JARVIS, IA, Knowledge Engine, bots de coleta |
| **SQL** (SQLite → Postgres se crescer) | Banco. Não guardar dado relacional em JSON gigante |
| **HTML/CSS** | Interface |
| **Bash/PowerShell** | Automação e CI |
| **Rust** | *só* onde houver problema real de desempenho — e não no começo |

Fora agora: Java, C++, Go, Kotlin. Uma arquitetura boa com duas linguagens vale
mais que uma arquitetura mediana com seis.

### Sobre o TypeScript

A conversão acontece **como parte da reconstrução arquitetural**, nunca como
migração de linguagem isolada:

> ✅ JavaScript → TypeScript **+ nova arquitetura**
> ❌ JavaScript → TypeScript mantendo a mesma arquitetura

Tipar durante meses uma estrutura que já se sabe que vai ser substituída é
trabalho jogado fora. E o histórico do projeto pesa aqui: uma versão Mark
anterior quebrou justamente por uma migração de TypeScript feita solta.

E o Core não deve saber que um serviço é Python. Deve saber que existe algo que
implementa `KnowledgeProvider` — assim a implementação troca sem destruir o resto.

---

## Calendário aproximado

| Período | Frente |
|---|---|
| ago–set/2026 | **Fechar a 1.0.0** — bugs, segurança, testes, documentação, estabilidade |
| out–dez/2026 | Fundação da V2 — Core, Storage, Events, Registry, Permissions |
| jan–fev/2027 | JARVIS + Knowledge Engine |
| mar–abr/2027 | Integrações — MCP, Project Registry, APIs |
| mai–jun/2027 | Migração e estabilização |
| meados/2027 | Release Candidate → **2.0.0** |

Não é promessa de data. É a ordem: **fundações → sistemas → integrações →
estabilização**, em vez de construir tudo ao mesmo tempo.

---

## Como a migração acontece

**Rewrite por estrangulamento**, nunca "apagar e começar de novo":

```
v1.0   Core antigo + Storage novo
v1.1   + Arsenal novo
v1.2   Core novo + JARVIS novo
v1.3   + Knowledge novo
v2.0   Legacy removido
```

O operador quase não percebe a reconstrução.

### Duas regras que economizam meses

**1. Se uma parte da V1 funciona perfeitamente, não reescreva automaticamente.**
Pergunte: *existe uma razão arquitetural para substituir isto?* Se não há,
migra e mantém.

**2. Não tenha medo de jogar código da V2 fora.** É para isso que a branch
existe. O objetivo não é preservar cada linha do Baluarte atual — é **preservar
o conhecimento e as funcionalidades importantes enquanto a engenharia melhora**.

---

## O que **não** fazer até a 1.0.0 fechar

- ❌ Não criar a branch `architecture/v2` ainda.
- ❌ Não começar a conversão para TypeScript.
- ❌ Não mover `src/pages/` para `src/modules/`.
- ❌ Não construir o Baluarte MCP — ele vem **depois** da fronteira de permissão,
      não antes (ver [fila de hardening](../HARDENING-1.0.0.md)).
- ❌ Não adicionar funcionalidade nova que não esteja na fila de hardening.

O que **é** permitido agora é o que já está sendo feito: deixar o Core com as
fronteiras certas (permissões, storage versionado, event bus, flags). Essas
peças nascem alinhadas com os oito objetivos e migram para a V2 em vez de serem
jogadas fora — o que é o oposto de "começar a V2 mais cedo".
