# Baluarte — Inventário de páginas e sistema modular

**Status:** especificação documental e inventário do estado atual  
**Objetivo:** orientar a evolução do site para módulos isoláveis, observáveis e controláveis por função  
**Fonte das rotas:** [`src/main.js`][1] no snapshot publicado da `main`  
**Documento relacionado:** [`ROADMAP_V2_ONBOARDING.md`](roadmap/ROADMAP_V2_ONBOARDING.md)

> **Resumo da proposta:** cada página deixa de ser apenas uma rota registrada e passa a pertencer a um módulo com estado próprio. Se uma página da Wiki Arma 3 quebrar, o sistema desliga somente aquele módulo, remove o botão para usuários normais e mantém o restante do site funcionando. Proprietário, administradores e desenvolvedores autenticados podem consultar a área operacional protegida, diagnosticar e reativar o módulo segundo suas permissões. Usuários normais não recebem acesso ao painel, ao stack trace ou ao caminho de recuperação.

## 1. Estado atual do site

O Baluarte atual é uma SPA com carregamento sob demanda. O arquivo `src/main.js` registra as rotas, o `router` resolve o caminho, o `lazy()` carrega o módulo da página e o Vite gera chunks separados. A Home é carregada de forma eager; as demais páginas utilizam importação dinâmica. Falhas de chunk passam por uma tentativa controlada de reload quando a sessão está online e depois chegam à `route:error`, que mostra uma tela de falha de carregamento em vez de confundir o problema com 404.

No snapshot auditado existem **98 rotas reais registradas**, incluindo dois aliases para a Home, e **114 arquivos JavaScript em `src/pages/`**. Os 114 arquivos não equivalem a 114 páginas: parte deles são subpáginas, gates do Núcleo, componentes de calculadoras, ferramentas de cripto ou arquivos de suporte. O comentário de exemplo `router.register('/x', ...)` no topo de `src/main.js` não é uma rota real e não entra na contagem.

| Indicador | Quantidade | Como interpretar |
| --- | ---: | --- |
| Rotas reais registradas | 98 | Entradas efetivas do router, incluindo `/home-3d` e `/home2` como aliases |
| Arquivos em `src/pages/` | 114 | Páginas, submódulos, gates e componentes de superfície |
| Aliases da Home | 2 | `/home-3d` e `/home2` chamam `homePage` |
| Fallback 404 | 1 | `router.setNotFound()` usa `_placeholder.js` |
| Fallback de erro de chunk | 1 | `route:error` usa `loadErrorPage()` |
| Estratégias de carregamento | 4 | Eager, `lazy`, `lazyNexus` e `lazyLeve` |

## 2. Inventário completo das rotas atuais

A tabela abaixo é o inventário de rotas do site. O agrupamento é operacional, não significa que todos os módulos já estejam separados fisicamente como a arquitetura V2 pretende.

### 2.1. Núcleo e ferramentas — 18 rotas

| Rota | Página/módulo | Carregamento |
| --- | --- | --- |
| `/home` | Home e Ponte de Comando | Eager |
| `/baixar` | Downloads e instalação | Lazy |
| `/ferramentas` | Hub de ferramentas | Lazy |
| `/editor` | Editor de código | Lazy |
| `/json-studio` | JSON Studio | Lazy |
| `/qr-studio` | QR Studio | Lazy |
| `/git-helper` | Git Helper | Lazy |
| `/terminal` | Terminal web com filesystem virtual | Lazy |
| `/calc-cientifica` | Calculadora científica | Lazy |
| `/calc-numerica` | Calculadora numérica | Lazy |
| `/calculadoras` | Hub de calculadoras | Lazy |
| `/tabela-verdade` | Tabela verdade e lógica | Lazy |
| `/cripto` | Hub de criptografia | Lazy |
| `/esteganografia` | Esteganografia em imagem | Lazy |
| `/graficos` | Gerador de gráficos | Lazy |
| `/simbolos` | Catálogo de símbolos | Lazy |
| `/color-studio` | Color Studio | Lazy |
| `/regex` | Laboratório de expressões regulares | Lazy |

### 2.2. Conhecimento, mídia e ferramentas de apoio — 36 rotas

| Rota | Página/módulo | Carregamento |
| --- | --- | --- |
| `/arsenal` | Arsenal militar | Lazy |
| `/militar` | Hub militar consolidado | Lazy |
| `/modelos-3d` | Visualizador 3D militar | Lazy |
| `/biblioteca` | Biblioteca e Crônicas | Lazy |
| `/elites` | Equipes de elite | Lazy |
| `/dossie` | Dossiês | Lazy |
| `/ciberseg` | Enciclopédia de cibersegurança | Lazy |
| `/academia` | Academia e linguagens | Lazy |
| `/robotica` | Currículo de robótica | Lazy |
| `/fft` | Visualizador FFT e Web Audio | Lazy |
| `/radio` | Rádio | Lazy |
| `/musicas` | Acervo de músicas | Lazy |
| `/media` | Media Hub | Lazy |
| `/videos` | Central de vídeos | Lazy |
| `/tv` | Televisão e programação | Lazy |
| `/utilidades` | Utilidades | Lazy |
| `/jogos` | Hub de jogos | Lazy |
| `/batalha-naval` | Batalha naval | Lazy |
| `/universo` | Universos narrativos | Lazy |
| `/tabela-periodica` | Tabela periódica | Lazy |
| `/modpack` | Modpack Minecraft | Lazy |
| `/wiki-arma3` | Wiki Arma 3 | Lazy |
| `/arma3-tutorial` | Tutorial de mods Arma 3 | Lazy |
| `/vanguard` | Project Vanguard | Lazy |
| `/zomboid` | Project Zomboid | Lazy |
| `/zomboid-admin` | Administração de servidor Zomboid | Lazy |
| `/guia-pc` | Guia para montar PC | Lazy |
| `/logic-sim` | Simulador de lógica digital | Lazy |
| `/portas` | Enciclopédia de portas lógicas | Lazy |
| `/morse` | Código Morse | Lazy |
| `/memes` | Arquivo de memes | Lazy |
| `/filmes` | Cinema e filmes | Lazy |
| `/shadow` | Shadow e diagnósticos locais | Lazy |
| `/perfil` | Perfil do operador | Lazy |
| `/economia` | Economia e cotações | Lazy |
| `/dolar` | Cotação do dólar | Lazy |

### 2.3. Sistema, IA e conhecimento militar — 27 rotas

| Rota | Página/módulo | Carregamento |
| --- | --- | --- |
| `/jarvis` | JARVIS | Gate do Núcleo |
| `/ia-proprietaria` | IA Proprietária Mark 11 | Gate do Núcleo |
| `/radar` | Radar | Lazy |
| `/geo` | GeoPulse | Lazy |
| `/find` | Busca Find | Lazy |
| `/triangulacao` | Triangulação | Lazy |
| `/llm-lab` | Laboratório de LLM | Gate do Núcleo |
| `/sobre` | Sobre o projeto | Lazy |
| `/roadmap` | Roadmap público | Lazy |
| `/diagnostico` | Diagnóstico do sistema | Lazy |
| `/jarvis-dashboard` | Dashboard do JARVIS | Gate do Núcleo |
| `/mapa` | Mapa | Lazy |
| `/visao` | Visão | Lazy |
| `/jarvis-vision` | Visão do JARVIS | Gate leve |
| `/forcas-armadas` | Forças armadas | Lazy |
| `/orcamentos-militares` | Orçamentos militares | Lazy |
| `/poder-militar` | Poder militar | Lazy |
| `/arsenal-expandido` | Arsenal expandido | Lazy |
| `/forcas-especiais` | Forças especiais | Lazy |
| `/organizacao-militar` | Organização militar | Lazy |
| `/tecnologia-militar` | Tecnologia militar | Lazy |
| `/taticas-estrategias` | Táticas e estratégias | Lazy |
| `/historia-militar` | História militar | Lazy |
| `/armas-por-pais` | Armas por país | Lazy |
| `/guerras-conflitos` | Guerras e conflitos | Lazy |
| `/batalhas-historicas` | Batalhas históricas | Lazy |
| `/enciclopedia-militar` | Enciclopédia militar | Lazy |

### 2.4. Desenvolvimento, projetos e Núcleo — 15 rotas

| Rota | Página/módulo | Carregamento |
| --- | --- | --- |
| `/codigo` | Código e autoanálise | Lazy |
| `/projetos` | Projetos conectados | Lazy |
| `/mural` | Mural | Lazy |
| `/comms` | Rede Neural e chat global | Lazy |
| `/banco` | Banco de dados/recursos | Lazy |
| `/cerebro` | Cérebro do Núcleo | Gate leve |
| `/ocr` | OCR | Lazy |
| `/memoria` | Memória | Gate leve |
| `/terminal-ia` | Terminal de IA | Gate do Núcleo |
| `/seguranca` | Segurança | Gate do Núcleo |
| `/gerar-codigo` | Geração de código | Gate leve |
| `/conselho` | Conselho | Gate do Núcleo |
| `/apis` | APIs | Gate do Núcleo |
| `/git-nexus` | Git Nexus | Gate do Núcleo |
| `/aprendizado` | Aprendizado de máquina | Gate do Núcleo |

### 2.5. Aliases da Home — 2 rotas

| Rota | Destino | Motivo |
| --- | --- | --- |
| `/home-3d` | `homePage` | Alias histórico/preview |
| `/home2` | `homePage` | Alias de compatibilidade |

## 3. O que já existe e o que ainda é novo

### Já existe hoje

O site já possui registro central de rotas, carregamento lazy, code splitting, tentativa de recuperação de chunks, fallback de 404 e fallback de erro de carregamento. Também possui `flags` de estabilidade por módulo, um motor de permissões com deny-by-default, auditoria em memória das decisões e autenticação Supabase via Google/OAuth.

A política atual declara permissões como `app.navegar`, `sistema.diagnostico`, `arsenal.read`, `jarvis.use` e capacidades restritas de terminal, arquivos e rede. Ela também distingue riscos de `leitura`, `escrita` e `restrito`. O motor atual é uma boa base para o novo sistema, mas **ainda não é um RBAC completo por usuário autenticado**.

A autenticação atual identifica a sessão e o usuário, mas `currentUser().meta` é adequada para exibição da UI, não para decidir autorização de segurança. Um papel não pode ser confiado apenas a metadata enviada pelo cliente. A autorização real de administrador, desenvolvedor ou proprietário precisa estar em perfil/claims controlados pelo servidor e protegidos por RLS.

### O que o novo sistema adicionará

A evolução proposta introduz um **Module Registry** com manifesto por módulo, estados operacionais, circuit breaker, controle de visibilidade, área protegida de diagnóstico e autorização por função. A rota continua existindo tecnicamente, mas deixa de ser automaticamente pública só porque foi registrada no router.

## 4. Modelo do novo sistema de módulos

### 4.1. Módulo como unidade operacional

Um módulo é uma unidade com identidade, rota, entrada, dependências, permissões, estado de disponibilidade, telemetria e política de fallback. A página da Wiki Arma 3 seria o módulo `wiki-arma3`, e não apenas um arquivo `src/pages/wiki-arma3.js` carregado sem contexto.

Um manifesto conceitual pode ser:

```js
{
  id: 'wiki-arma3',
  route: '/wiki-arma3',
  label: 'Wiki Arma 3',
  entry: () => import('./pages/wiki-arma3.js'),
  status: 'enabled',
  visibility: 'public',
  roles: ['user', 'developer', 'admin', 'owner'],
  permissions: ['wiki-arma3.read'],
  fallback: 'module-unavailable',
  health: {
    lastCheckAt: null,
    lastFailureAt: null,
    incidentId: null
  }
}
```

O manifesto não deve conceder autoridade sozinho. Ele descreve o módulo; o servidor e as políticas de permissão decidem quem pode executar ações administrativas.

### 4.2. Estados operacionais

| Estado | Usuário normal | Dev/Admin/Proprietário | Significado |
| --- | --- | --- | --- |
| `enabled` | Botão e página disponíveis | Disponíveis + diagnóstico | Módulo operacional |
| `degraded` | Botão pode continuar disponível com aviso controlado | Diagnóstico, logs e retry | Módulo parcialmente funcional |
| `disabled` | Botão oculto; acesso direto recebe indisponível | Painel de incidente e página protegida de diagnóstico | Desligamento manual ou automático |
| `maintenance` | Mensagem curta de manutenção | Acesso operacional conforme permissão | Intervenção planejada |
| `experimental` | Só aparece se a política liberar | Dev/Admin/Owner podem testar | Funcionalidade não estável |
| `quarantined` | Sem acesso | Somente Owner/Admin autorizado | Falha de segurança ou risco alto |

O estado público não deve revelar stack trace, caminho de arquivo, token, dados do usuário ou detalhes que ajudem a atacar o sistema. O estado operacional interno pode registrar esses dados em storage/telemetria protegidos, com retenção e acesso controlados.

## 5. Exemplo: Wiki Arma 3 com problema

O comportamento esperado é:

```text
Erro em /wiki-arma3
       │
       ▼
Module Health Monitor registra o incidente
       │
       ▼
Circuit breaker muda wiki-arma3 → disabled
       │
       ├── menu público remove/oculta o botão
       ├── acesso direto do usuário → página indisponível
       └── área operacional → incidente visível para dev/admin/owner
```

A página não deve derrubar a Home, o Arsenal, a Biblioteca, o Router ou o restante do site. Se o problema for um chunk quebrado, o mecanismo atual de recuperação pode tentar um reload uma vez. Se a falha persistir, ela deve ser convertida em estado do módulo, e não em uma sucessão infinita de reloads.

Para um usuário normal:

```text
#/wiki-arma3

Wiki Arma 3 temporariamente indisponível.
A equipe responsável foi avisada. Tente novamente mais tarde.
```

Para um desenvolvedor, administrador ou proprietário autenticado com a permissão correta:

```text
/admin/modules/wiki-arma3

Status: disabled
Incidente: MOD-2026-0001
Última falha: import do módulo / erro de dados
Ações: ver diagnóstico · tentar novamente · reativar após validação
```

O botão público ser desligado não significa apagar a página nem remover o código. Significa impedir que uma falha local se transforme em uma falha global e deixar a recuperação disponível para quem possui autorização operacional.

## 6. Papéis e matriz de acesso

Os papéis propostos são hierárquicos, mas não devem ser inferidos pelo cliente:

| Papel | Origem | Acesso público | Acesso operacional |
| --- | --- | --- | --- |
| `user` | Usuário autenticado ou visitante | Módulos `enabled` e conteúdo público | Nenhum painel de incidente; não vê página quebrada |
| `developer` | Perfil aprovado pelo proprietário | Igual ao usuário, salvo módulos experimentais explicitamente permitidos | Diagnóstico técnico, logs redigidos, retry e testes autorizados |
| `admin` | Perfil administrativo controlado | Igual ao usuário | Gerenciamento operacional de módulos, manutenção e incidentes |
| `owner` | Proprietário da instalação/projeto | Totalidade do conteúdo permitido pela política | Controle máximo, aprovação de papéis, reativação e quarentena |

A regra para a página quebrada é:

```text
user                    → não vê o botão; rota devolve indisponível
usuário sem role elevada → nunca recebe área de diagnóstico
 developer              → acessa diagnóstico técnico autorizado
 admin                  → acessa operações administrativas autorizadas
 owner                  → acessa controle máximo e aprovação
```

O papel deve ser derivado de uma fonte de autoridade do servidor, por exemplo `profiles.role` ou uma tabela de atribuições ligada ao `auth.uid()`, com políticas RLS. `user_metadata` vindo do navegador não pode promover alguém a `admin`, `developer` ou `owner`.

## 7. Autenticação, autorização e RLS

O Supabase Auth atual já fornece a identidade da sessão. A próxima camada precisa separar três coisas:

1. **Autenticação:** quem é a pessoa, por meio da sessão Supabase e `auth.uid()`.
2. **Autorização:** qual papel e quais permissões o servidor atribuiu à pessoa.
3. **Disponibilidade:** se o módulo está ligado, degradado, em manutenção ou desativado.

Uma modelagem inicial pode ser:

```text
profiles
├── user_id / auth.uid()
├── display_name
└── status

user_roles
├── user_id
├── role: user | developer | admin | owner
├── granted_by
├── granted_at
└── revoked_at

module_registry
├── module_id
├── public_state
├── internal_state
├── incident_id
├── updated_by
└── updated_at

module_incidents
├── id
├── module_id
├── severity
├── public_message
├── internal_diagnosis
├── created_at
├── resolved_at
└── resolved_by
```

As regras mínimas de RLS são:

- qualquer pessoa pode ler somente o estado público necessário para construir a navegação;
- usuário normal não pode ler `internal_state`, diagnóstico privado ou logs técnicos;
- apenas `developer`, `admin` e `owner` podem ler incidentes técnicos, sempre conforme escopo;
- apenas `admin` e `owner` podem alterar estado operacional de módulos;
- apenas `owner` pode conceder/revogar papéis elevados;
- ações administrativas geram auditoria com `auth.uid()`, módulo, ação e horário;
- o frontend nunca pode transformar sozinho `disabled` em `enabled`.

## 8. Fluxo do desligamento e reativação

### Desligamento automático

Um monitor observa falhas de import, erro de inicialização, falhas repetidas de dados ou health check. Depois de um limite definido, abre um incidente e muda o módulo para `degraded`, `disabled` ou `quarantined`, dependendo da severidade. O limite precisa impedir que um erro transitório derrube a página após uma única falha.

### Desligamento manual

Um administrador ou proprietário pode colocar o módulo em `maintenance` ou `disabled` antes de uma publicação. O botão público desaparece de forma controlada, mas a documentação e a área operacional continuam indicando a causa e o estado.

### Reativação

A reativação exige papel autorizado, comentário/justificativa, validação do módulo e registro de auditoria. O sistema deve permitir `retry` sem liberar publicamente até o health check passar. Em caso de falha repetida, o circuito volta a abrir.

```text
closed/enabled → falha repetida → open/disabled
open/disabled  → retry autorizado → half-open/teste
half-open      → health verde → closed/enabled
half-open      → nova falha → open/disabled
```

## 9. Separação entre menu público e painel operacional

A navegação pública deve ser derivada de `public_state`, flags de estabilidade e permissões de leitura. O painel operacional deve ser uma superfície separada, por exemplo `/admin/modules` ou uma área protegida dentro de `/diagnostico`.

O usuário normal não deve descobrir um painel administrativo por inspeção do HTML. Isso não substitui autorização, mas reduz exposição acidental. A proteção real continua no servidor/RLS e no middleware/API que responde às operações administrativas.

| Superfície | Visitante/usuário | Developer | Admin | Owner |
| --- | --- | --- | --- | --- |
| Menu público | Módulos públicos ligados | Igual | Igual | Igual |
| Página desativada | Mensagem neutra | Diagnóstico se autorizado | Diagnóstico e operação | Controle total |
| `/diagnostico` público | Saúde pública redigida | Detalhes técnicos permitidos | Detalhes administrativos | Detalhes completos autorizados |
| `/admin/modules` | 403/404 sem revelar existência sensível | Leitura/retry conforme permissão | Alteração operacional | Alteração e papéis |
| Logs internos | Não | Escopo técnico redigido | Escopo administrativo | Escopo completo conforme política |

## 10. Migração do router atual para o Module Registry

A migração deve ser incremental e não deve apagar as 98 rotas atuais de uma vez.

### Etapa 1 — Manifesto paralelo

Criar um catálogo de módulos ao lado do `router.register()`, começando por Wiki Arma 3, Arsenal, Biblioteca e JARVIS. Cada entrada referencia a rota atual, a loader atual e o estado público.

### Etapa 2 — Resolver o estado antes do menu

O menu e a paleta passam a consultar o `Module Registry` antes de mostrar um botão. O router continua funcionando para compatibilidade, mas verifica se o módulo está público, autenticado e autorizado antes de carregar a página.

### Etapa 3 — Envolver carregamento e inicialização

O `lazy()` atual passa a ser usado por um loader de módulo que emite eventos como `module:loading`, `module:ready` e `module:error`. Uma falha persistente atualiza o circuito do módulo e aciona o fallback seguro.

### Etapa 4 — Persistir o estado operacional no servidor

Flags experimentais locais continuam sendo úteis para desenvolvimento, mas o estado de produção e as ações administrativas devem ser persistidos no backend com RLS e auditoria.

### Etapa 5 — Remover duplicação gradualmente

Quando o catálogo estiver estável, rotas, sidebar, ícones, título, flags, permissões e health checks devem derivar do mesmo manifesto. Até lá, o projeto deve manter adaptadores para não quebrar links antigos.

## 11. Critérios de aceitação

O sistema de módulos estará pronto para o primeiro módulo quando:

1. um erro na Wiki Arma 3 não derrubar outra rota nem o boot do site;
2. o botão da Wiki puder ser ocultado por estado operacional sem apagar o módulo;
3. uma rota desligada retornar mensagem neutra para usuário normal;
4. developer, admin e owner autenticados forem diferenciados no servidor;
5. `user_metadata` do cliente não puder elevar privilégio;
6. o painel de módulos exigir autorização server-side e RLS;
7. logs técnicos não vazarem para o público;
8. a reativação exigir permissão e gerar auditoria;
9. o circuito tiver retry limitado e estado `half-open`/equivalente;
10. existirem testes de contrato, permissão, rota desativada, bypass por URL e regressão do restante do site.

## 12. O que não deve ser feito

Não esconder o botão apenas com CSS e considerar isso segurança. Não confiar em `?role=admin`, `localStorage`, `user_metadata` ou qualquer valor enviado pelo cliente. Não apagar uma página quebrada para “resolver” o problema. Não expor stack trace, tokens ou diagnóstico interno na mensagem pública. Não criar um segundo sistema de permissões paralelo ao Permission Manager sem uma decisão arquitetural. Não transformar todas as páginas em módulos de uma vez; começar por um slice pequeno e observável.

## 13. Próximo slice recomendado

O primeiro slice recomendado é **Wiki Arma 3 + Module Registry + área de diagnóstico protegida**. Ele é concreto, reproduz o problema citado e exercita a arquitetura inteira:

```text
manifesto wiki-arma3
      ↓
router/loader
      ↓
health + circuit breaker
      ↓
menu público
      ↓
Supabase Auth + role/RLS
      ↓
/admin/modules/wiki-arma3
      ↓
testes de falha, ocultação, diagnóstico e reativação
```

Somente depois de esse slice funcionar deve-se migrar Arsenal, JARVIS, Terminal, Wiki Project Zomboid e os demais módulos.

## 14. Referências

[1]: ../../src/main.js "Registro atual de rotas e loaders"
[2]: ../../src/core/supabase-auth.js "Autenticação Supabase atual"
[3]: ../../src/core/politica.js "Política de permissões, storage e flags"
[4]: ../../src/core/permissions.js "Permission Manager atual"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Hardening, permissões e arquitetura V2"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
