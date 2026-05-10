# 📚 Specs — Banco de dados do Projeto Baluarte

A **fonte de verdade** para todas as fases é o **Google Drive** do Lucas.

> **Pasta principal (compartilhada com o Claude):**
> 📁 **GIT HUB** → 📁 **Obsidian Vault**
> Drive ID raiz: `1SVtzASymdin9z0RmLBsuVR43cH-W9hxO` (GIT HUB)
> Drive ID do vault: `1Apng0h4O72Tq5O6REBVeoTI1QSpqVUm1` (Obsidian Vault)
> [Abrir GIT HUB no Drive](https://drive.google.com/drive/folders/1SVtzASymdin9z0RmLBsuVR43cH-W9hxO)

> ⏳ **Status:** Lucas ainda está fazendo upload do conteúdo. Quando terminar, este README + [`drive-index.md`](./drive-index.md) serão atualizados com a estrutura completa.

---

## ⚙️ Fluxo

1. **Lucas** mantém o vault Obsidian no Windows + sincroniza com Drive (`GIT HUB/Obsidian Vault/`)
2. **Claude** lê os arquivos via MCP do Google Drive (acesso já configurado e testado)
3. **Não precisa subir nada pro GitHub** — o Drive é a fonte
4. Esta pasta `docs/specs/` no repo serve só como **ponto de referência**: este README + [`drive-index.md`](./drive-index.md) listando IDs estáveis do Drive. Não duplicamos os arquivos `.md` aqui (evita inflar o repo)

---

## 🎯 Quando o Claude usa cada arquivo

| Fase | Conteúdo do Drive a consultar |
|---|---|
| 1 (Foundation) | ✅ Já entregue |
| 2 (Ferramentas Técnicas) | UX das páginas, schemas de calculadoras, refs de editores de código |
| 3 (Conteúdo) | Crônicas da Baluarte (24+ arcos), 18 equipes ALFA→ZETA, 159 armas |
| 4 (Mídia + Universo) | Refs visuais (Marks anteriores), modpack Minecraft, tabela periódica |
| 5 (IA + PWA + Polish) | Specs Mark 11 IA Proprietária, prompt t1 |

> Os IDs específicos dos arquivos serão catalogados em [`drive-index.md`](./drive-index.md) assim que o upload terminar.

---

## ⚠️ O que **NÃO** fazer

- ❌ Não subir os `.md` do vault pra dentro deste repo (`docs/specs/Obsidian Vault/`) — vai inflar o repo desnecessariamente. A fonte é o Drive.
- ❌ Não modificar arquivos do vault pelo Claude sem combinar — pode causar conflito com edições do Obsidian
- ❌ Não compartilhar IDs do Drive externamente — funcionam como tokens de acesso ao conteúdo

---

## 🧪 Como o Claude lê (referência técnica)

```
mcp__<drive>__read_file_content({ fileId: "<id-do-arquivo>" })
  → retorna o conteúdo do .md como texto
```

```
mcp__<drive>__search_files({ query: "parentId = '1Apng0h4O72Tq5O6REBVeoTI1QSpqVUm1'" })
  → lista todos os arquivos diretos da pasta Obsidian Vault
```

IDs específicos serão catalogados em [`drive-index.md`](./drive-index.md).
