# Baluarte V2 — Plano de Navegação Modular e Workspace

**Status:** PLANNED  
**Tipo:** UX / Arquitetura de navegação  
**Prioridade:** Alta  
**Escopo:** Baluarte V2  

---

## 1. Objetivo

Preparar a interface do Baluarte para crescer de dezenas para centenas de páginas e módulos sem transformar a sidebar em uma lista interminável.

A navegação deve deixar de tratar a sidebar como um catálogo completo de páginas. A sidebar deve representar o **workspace atual do usuário**, enquanto o **Hub** mantém acesso ao catálogo completo de módulos.

> **Princípio central:** o Baluarte possui um catálogo de módulos; cada usuário possui um workspace personalizado.

---

## 2. Problema atual

Com mais de 50 páginas, adicionar cada nova página diretamente à sidebar gera:

- poluição visual;
- dificuldade para encontrar páginas;
- navegação cada vez mais alta;
- excesso de categorias e submenus;
- dependência de decisões centralizadas sobre onde cada página deve aparecer;
- crescimento da complexidade da interface junto com o crescimento do produto.

Esse modelo não deve ser levado para uma escala de 100, 200 ou mais módulos.

---

## 3. Conceito proposto

Criar três elementos principais:

```text
Baluarte
│
├── Workspace
│   ├── módulos fixados pelo usuário
│   ├── ordem personalizada
│   └── acesso rápido
│
├── Module Hub
│   ├── catálogo completo
│   ├── categorias
│   ├── pesquisa
│   ├── descobrir módulos
│   └── fixar/desafixar
│
└── Command Palette
    ├── busca global
    ├── abertura rápida
    └── navegação por teclado
```

Nenhum módulo deixa de existir quando é removido da sidebar. Ele apenas deixa de ocupar espaço na navegação rápida.

---

## 4. Nova Sidebar / Dock

A sidebar deve ser compacta e orientada a funções, não a páginas.

Proposta inicial:

```text
🏠 Home
📌 Fixados
🧩 Hub
🕘 Recentes
🔍 Busca
⚙️ Configurações
```

A sidebar não deve listar automaticamente todas as páginas existentes.

### Regras

1. Não adicionar novos módulos diretamente à sidebar global.
2. Módulos fixados pelo usuário podem aparecer no Workspace.
3. A navegação deve continuar funcional mesmo com centenas de módulos.
4. A sidebar deve permanecer visualmente compacta.

---

## 5. Module Hub

O Hub será o catálogo completo do Baluarte.

Estrutura conceitual:

```text
Baluarte Hub
│
├── 🔎 Buscar qualquer coisa...
│
├── ⭐ Seus favoritos
│
└── Categorias
    ├── 🤖 Inteligência Artificial
    ├── 🎵 Entretenimento
    ├── 🛠️ Ferramentas
    ├── 📁 Sistema
    ├── 📚 Estudos
    ├── 🎮 Games
    ├── 🌐 Web
    ├── 🧪 Experimentos
    └── ⚙️ Administração
```

Cada módulo deve possuir uma ação clara de **Fixar** ou **Desafixar**.

---

## 6. Workspace personalizado

Cada usuário deve poder montar sua própria navegação.

Exemplo de usuário focado em IA:

```text
📌 Workspace
├── 🤖 Chat
├── 🧠 Modelos
├── 🔬 Laboratório
├── 📊 Analytics
└── 📝 Notas
```

Exemplo de usuário focado em entretenimento:

```text
📌 Workspace
├── 🎵 Música
├── 🎬 Vídeos
├── 🤖 IA
├── 🎮 Games
└── 📰 Notícias
```

O produto continua sendo o mesmo. Apenas a organização muda.

---

## 7. Drag & Drop

O usuário deve poder reorganizar os itens do Workspace por arrastar e soltar.

Exemplo:

```text
⋮⋮ 🤖 IA
⋮⋮ 🎵 Música
⋮⋮ 📁 Arquivos
⋮⋮ 🧠 Modelos
⋮⋮ 📊 Analytics
```

O estado da ordem deve ser persistido por usuário.

### Requisitos

- drag & drop acessível;
- suporte a teclado quando possível;
- feedback visual durante o arraste;
- persistência automática;
- opção de restaurar ordem padrão.

---

## 8. Estados de navegação

Um módulo deve poder estar em três estados principais:

### Fixado

Aparece no Workspace/navegação rápida.

### Recente

Aparece automaticamente na área de páginas recentes.

### Descoberto

Continua disponível no Hub e na busca, mas não ocupa espaço permanente na navegação.

> Remover um módulo do Workspace nunca deve apagar ou bloquear o acesso ao módulo.

---

## 9. Command Palette

Adicionar uma Command Palette, inicialmente com `Ctrl + K`.

Exemplo:

```text
┌─────────────────────────────────────────────┐
│ 🔎 O que você quer abrir?                  │
├─────────────────────────────────────────────┤
│ 🤖 Chat IA                                 │
│ 🎵 Música                                  │
│ 📁 Arquivos                                │
│ 🧠 Modelos                                 │
│ 📊 Analytics                               │
│ ⚙️ Configurações                           │
└─────────────────────────────────────────────┘
```

A pesquisa deve considerar:

- nome;
- descrição;
- categoria;
- tags;
- rota;
- aliases.

---

## 10. Page Registry / Module Registry

A navegação não deve depender de listas hard-coded espalhadas pelo frontend.

Criar um registro central de módulos com metadados semelhantes a:

```ts
interface BaluarteModule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  route: string;
  tags?: string[];
  aliases?: string[];
  searchable?: boolean;
  pinnable?: boolean;
  permissions?: string[];
}
```

O Registry será a fonte de verdade para descoberta e navegação.

### Benefício

Adicionar uma nova página deve significar registrar um novo módulo, e não alterar manualmente várias partes da sidebar.

---

## 11. Home como Dashboard pessoal

O Home deve evoluir de uma simples página inicial para um dashboard do Workspace.

Proposta:

```text
Bom dia

⚡ Acesso rápido
[ IA ] [ Música ] [ Projetos ] [ Arquivos ]

🕘 Continue de onde parou
[ último módulo utilizado ]

⭐ Seus módulos
[ módulos fixados ]

🧩 Explorar Baluarte
[ Ver todos os módulos ]
```

---

## 12. Breadcrumbs

Em áreas profundas, utilizar breadcrumbs para indicar contexto:

```text
Baluarte > Inteligência Artificial > Modelos > Comparador
```

Isso reduz a necessidade de criar árvores enormes na sidebar.

---

## 13. Workspaces múltiplos — fase futura

Depois da implementação inicial, avaliar suporte a múltiplos Workspaces:

```text
Workspace: Geral
Workspace: IA
Workspace: Estudos
Workspace: Entretenimento
Workspace: Desenvolvimento
```

Cada Workspace pode possuir seus próprios módulos fixados e sua própria ordem.

A implementação deve ser planejada para não exigir duplicação de módulos.

---

## 14. Personalização assistida — fase futura

O Baluarte poderá sugerir ajustes com base no uso, mas nunca deve reorganizar a interface de forma irreversível sem autorização.

Exemplo:

> Você utilizou este módulo 14 vezes esta semana. Deseja adicioná-lo aos seus favoritos?

Regras:

- sugestões, não imposições;
- sempre permitir desfazer;
- não alterar o Workspace silenciosamente;
- respeitar preferências do usuário.

---

## 15. Princípios de UX

### Descoberta sem poluição

Todo módulo deve ser encontrável, mas nem todo módulo precisa estar visível o tempo todo.

### Personalização sem perda de acesso

Ocultar da sidebar não significa remover do sistema.

### Crescimento independente

Adicionar módulos não deve exigir redesign da navegação.

### Busca como navegação de primeira classe

Em sistemas grandes, pesquisa deve ser tão importante quanto menus.

### Usuário no controle

O usuário decide o que aparece no Workspace.

### Interface compacta

A navegação global deve permanecer pequena mesmo quando o catálogo crescer.

---

## 16. Arquitetura conceitual

```text
                 ┌──────────────────┐
                 │  MODULE REGISTRY │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          Workspace       Hub       Search
             │            │            │
             ▼            ▼            ▼
        Fixados       Catálogo      Resultados
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Módulos / Rotas
```

---

## 17. Fases de implementação

### Fase 1 — Fundação

- definir Module Registry;
- mapear páginas existentes;
- definir categorias e metadados;
- identificar rotas atuais;
- separar navegação de catálogo.

### Fase 2 — Novo Workspace

- criar sidebar/dock compacta;
- criar área de fixados;
- criar persistência da ordem;
- criar estados fixado/descoberto.

### Fase 3 — Hub

- catálogo completo;
- categorias;
- pesquisa;
- fixar/desafixar;
- páginas recentes.

### Fase 4 — Drag & Drop

- reorganização visual;
- persistência;
- acessibilidade;
- reset da organização.

### Fase 5 — Command Palette

- `Ctrl + K`;
- busca global;
- aliases;
- atalhos;
- navegação rápida.

### Fase 6 — Dashboard

- Home personalizado;
- acesso rápido;
- recentes;
- favoritos;
- descoberta de módulos.

### Fase 7 — Workspaces múltiplos

Avaliar somente depois que o modelo básico estiver estável.

### Fase 8 — Personalização assistida

Sugestões de organização baseadas em uso, sempre com consentimento e possibilidade de desfazer.

---

## 18. Critérios de aceitação

A implementação será considerada adequada quando:

- [ ] o usuário não precisar visualizar dezenas de páginas na sidebar;
- [ ] todas as páginas continuarem acessíveis;
- [ ] qualquer módulo puder ser encontrado pelo Hub;
- [ ] módulos puderem ser fixados/desafixados;
- [ ] o usuário puder reorganizar os módulos;
- [ ] a organização persistir por usuário;
- [ ] novos módulos puderem ser adicionados sem redesign da sidebar;
- [ ] a busca global encontrar módulos por nome, categoria e tags;
- [ ] o sistema continuar utilizável com 100+ módulos;
- [ ] o sistema não depender de listas de navegação duplicadas em múltiplos componentes;
- [ ] acessibilidade e navegação por teclado sejam consideradas desde a fundação.

---

## 19. Não objetivos

Esta proposta não significa:

- remover páginas existentes;
- esconder funcionalidades permanentemente;
- transformar tudo em um dashboard complexo;
- criar uma navegação diferente para cada usuário no backend;
- duplicar módulos para cada Workspace.

O objetivo é **separar catálogo, descoberta e navegação personalizada**.

---

## 20. Decisão arquitetural proposta

> **A sidebar do Baluarte V2 não será o catálogo de páginas. Ela será uma superfície de acesso rápido ao Workspace do usuário. O catálogo completo ficará no Module Hub, e a descoberta será complementada por busca global e Command Palette.**

Essa decisão deve orientar novos módulos e futuras decisões de UX da V2.

---

## 21. Resultado esperado

O Baluarte deve conseguir crescer de:

```text
50 páginas
   ↓
100 páginas
   ↓
200 páginas
   ↓
500+ módulos
```

sem que o crescimento do catálogo obrigue o crescimento proporcional da sidebar.

O sistema deve crescer **em profundidade funcional**, não em poluição visual.
