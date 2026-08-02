# Projeto Nexus Baluarte — plano de reestruturação e reescrita

> **Este documento é a VISÃO** (issues #405/#406). O que já virou execução:
>
> - 🗺️ [`NEXUS-INVENTARIO.md`](NEXUS-INVENTARIO.md) — estado real medido + o
>   gate da 1.0.0 + as 2 lacunas que dependem de decisão do operador.
> - 📐 [`NEXUS-CONTRATO.md`](NEXUS-CONTRATO.md) — contrato de integração v1.0.0.
> - ⚖️ [`NEXUS-DECISOES.md`](NEXUS-DECISOES.md) — decisões fechadas (D-001 geo,
>   D-002 social). São **21** domínios + externos, não mais os 20 da lista abaixo.
> - 📊 [`nexus/dominios.json`](nexus/dominios.json) — quem leva o quê, cobrado
>   por `npm run verificar-nexus` contra o `src/main.js` real.
> - 🧩 [`nexus/template/`](nexus/template/) — esqueleto de repositório de domínio.

## Visão

A ideia de separar o Baluarte em 20 repositórios dedicados para reescrever cada função com mais calma e depois consolidar tudo em um projeto único é boa, desde que seja tratada como uma migração arquitetural e não como uma fragmentação sem controle.

O motivo de fundo é simples e honesto: o projeto já ficou muito grande, com muitas funções cruzadas, muitas áreas de responsabilidade e uma carga de manutenção que começa a pesar tanto para o dono quanto para quem ajuda a construir. Quando o escopo vira muito grande, a produtividade cai, a qualidade fica inconsistente e a sensação de “estar sempre no meio do caos” aumenta.

Por isso, a separação em domínios menores faz sentido. Ela reduz a carga cognitiva, permite reescrever com mais calma, evita que tudo seja tocado ao mesmo tempo e cria uma base mais saudável para a união final. Se a intenção é transformar o projeto em algo mais forte, mais limpo e mais escalável, então o nome “Projeto Nexus Baluarte” faz sentido. A diferença é que o valor não vem do nome em si, e sim da disciplina de separação, contratos claros e reconciliação final.

## Opinião direta

Eu acho que a estratégia é válida, mas com uma condição essencial: não basta “quebrar em 20 repositórios” e depois juntar tudo. O ganho real vem de reescrever cada domínio com limites claros, interfaces estáveis e um motor de integração forte.

A melhor versão da ideia é:

1. dividir por domínio funcional;
2. reescrever cada domínio com calma;
3. manter as APIs e o banco funcionando durante a transição;
4. consolidar tudo em um único projeto-orquestrador no fim.

Ou seja: a mudança é boa, mas a execução precisa ser arquitetural, não apenas estética.

## Princípios do Nexus

- O projeto final continua sendo um único sistema unificado.
- Cada repositório dedicado deve ter responsabilidade bem definida.
- APIs e contratos precisam ser preservados durante a migração.
- O frontend continua em JavaScript puro + Vite, sem TypeScript e sem framework.
- O backend e o banco permanecem operantes; a reestruturação não pode quebrar o fluxo real.
- O rebranding para “Nexus Baluarte” só faz sentido se houver uma base técnica mais limpa e coesa.
- A separação não pode virar uma desculpa para perder controle; cada domínio precisa ter dono, prazo e critérios de integração.
- A estratégia existe para aliviar o trabalho humano e do agente, não para aumentar a complexidade invisível.

## Arquitetura proposta

### 1. Camada de orquestração

Esta camada será o núcleo do projeto final. Ela vai reunir:

- shell da aplicação;
- navegação;
- estado global;
- autenticação/perfil;
- orquestração de módulos;
- gateway de APIs.

### 2. Camadas de domínio

Cada função do projeto deve virar um domínio independente, por exemplo:

- núcleo da interface;
- conteúdo narrativo;
- ferramentas técnicas;
- arsenal militar;
- equipes e elites;
- conhecimento acadêmico;
- mídia e áudio;
- economia e dados;
- IA/J.A.R.V.I.S.;
- perfil e identidade do operador;
- desktop/launcher;
- infraestrutura e deploy.

### 3. Contratos entre módulos

Cada repositório novo precisa expor contratos claros, por exemplo:

- eventos;
- payloads JSON;
- schemas de dados;
- modos de integração;
- endpoints compatíveis;
- contratos de UI.

Isso evita que a “unificação” vire um caos de dependências invisíveis.

## Estrutura de repositórios proposta

A divisão em 20 repositórios pode seguir esta lógica:

1. baluarte-core
2. baluarte-shell
3. baluarte-content
4. baluarte-tools
5. baluarte-arsenal
6. baluarte-elites
7. baluarte-academia
8. baluarte-robotica
9. baluarte-midia
10. baluarte-audio
11. baluarte-cibersec
12. baluarte-economia
13. baluarte-jarvis-core
14. baluarte-jarvis-tools
15. baluarte-jarvis-memory
16. baluarte-profile
17. baluarte-data
18. baluarte-desktop
19. baluarte-infra
20. baluarte-docs

A ideia não é fazer 20 repositórios para “parecer moderno”, e sim organizar as responsabilidades do sistema de forma que cada uma possa ser reescrita sem arrastar o resto junto.

## Fases do plano

### Fase 0 — Congelar o baseline

- definir o estado atual como referência;
- criar branch de migração;
- mapear todas as rotas e funções existentes;
- registrar inventário de dados e APIs;
- identificar o que é essencial, o que é legado e o que pode ser reescrito depois.

### Fase 1 — Preparar a camada de integração

- criar o gateway de módulos;
- definir o estado global e o modelo de eventos;
- estabelecer os contratos de comunicação entre módulos;
- garantir que o sistema atual continue rodando durante a mudança;
- definir um padrão mínimo de documentação para cada repositório novo.

### Fase 2 — Separar por domínio

- extrair os módulos principais em repositórios menores;
- mover cada domínio para um repositório próprio;
- manter adaptadores para compatibilidade com o sistema atual;
- priorizar primeiro os domínios que mais impactam a experiência do usuário.

### Fase 3 — Reescrever com calma

- reescrever cada domínio de forma isolada;
- melhorar performance, estrutura e clareza;
- remover código legado somente quando o novo módulo estiver estável;
- validar cada domínio antes de passar para o próximo.

### Fase 4 — Integrar tudo novamente

- montar o projeto final unificado;
- fazer a orquestração entre os domínios;
- validar API, UI, banco de dados e fluxo do operador;
- garantir que o sistema final tenha um caminho de uso claro e consistente.

### Fase 5 — Rebranding e consolidação

- renomear o projeto para “Projeto Nexus Baluarte”;
- organizar a documentação principal;
- deixar o sistema pronto para evolução contínua;
- fechar a transição com um estado estável e documentado.

## Prioridades iniciais

1. Core e shell do sistema
2. J.A.R.V.I.S. e camada de IA
3. Dados e perfil do operador
4. Conteúdo e ferramentas principais
5. Mídia, áudio e economia
6. Desktop, infraestrutura e documentação

Essa ordem reduz risco porque começa pelos blocos que sustentam o resto do sistema.

## Fase inicial recomendada

A primeira onda de migração deve ser conservadora e objetiva. O objetivo não é separar tudo de uma vez, e sim criar um núcleo estável que permita crescer sem desorganizar o projeto.

### 1. Definir o núcleo de integração

Criar um repositório principal de orquestração que:

- carregue os módulos por domínio;
- exponha uma navegação comum;
- mantenha o estado global;
- faça o roteamento entre os subdomínios.

### 2. Separar os blocos mais estáveis

Começar pelos módulos que já têm menos dependência direta e mais valor de isolamento:

- core
- shell
- profile
- data
- docs

### 3. Depois migrar os blocos de experiência

Em um segundo momento, migrar os domínios que fazem parte da experiência central:

- content
- tools
- arsenal
- elites
- academia
- robotica

### 4. Por fim, migrar os domínios mais ligados a infraestrutura e extensão

- media
- audio
- cibersec
- economia
- jarvis-core
- jarvis-tools
- jarvis-memory
- desktop
- infra

## Responsabilidade sugerida por repositório

- baluarte-core: base da aplicação, estado, eventos, router, helpers compartilhados.
- baluarte-shell: layout, sidebar, header, navegação, temas e shell visual.
- baluarte-content: conteúdo narrativo, crônicas, universos, bibliotecas e páginas de leitura.
- baluarte-tools: catálogo de ferramentas, páginas e experiência de uso geral.
- baluarte-arsenal: dados e experiência do arsenal militar.
- baluarte-elites: equipes, unidades e páginas de contexto operacional.
- baluarte-academia: conteúdo acadêmico, estudos e aprendizagem.
- baluarte-robotica: currículo, módulos e material teórico/prático.
- baluarte-midia: player, galerias, vídeos, mídia e navegação visual.
- baluarte-audio: áudio, FFT, síntese, processamento e player de som.
- baluarte-cibersec: conteúdo e ferramentas de segurança digital.
- baluarte-economia: economia, câmbio, cripto e dados financeiros.
- baluarte-jarvis-core: motor principal do J.A.R.V.I.S.
- baluarte-jarvis-tools: ferramentas e capacidades do agente.
- baluarte-jarvis-memory: memória, histórico, recall e contexto persistente.
- baluarte-profile: identidade do operador, estatísticas e preferências.
- baluarte-data: datasets, schemas, cache e modelos de informação.
- baluarte-desktop: integração com o app desktop e recursos nativos.
- baluarte-infra: deploy, configuração, pipelines e infraestrutura.
- baluarte-docs: documentação, guias e processo de desenvolvimento.

## Roteiro inicial de implementação

1. Inventariar o que existe hoje em cada área.
2. Criar os contratos mínimos de integração entre módulos.
3. Extrair o core e o shell primeiro.
4. Criar uma camada de composição para montar o sistema final.
5. Migrar um domínio por vez, mantendo compatibilidade.
6. Validar cada mudança no navegador antes de seguir.
7. Só depois de estabilizar a primeira onda, avançar para os domínios mais complexos.

## Critérios de aceite por domínio

Cada domínio só pode ser considerado pronto quando:

- está isolado em seu repositório próprio;
- tem README claro e contrato de integração;
- funciona sozinho em teste;
- pode ser chamado pelo orquestrador sem quebrar o fluxo principal;
- foi validado no navegador ou na execução real correspondente.

## Regra de ouro da migração

A separação em repositórios não pode ser tratada como fim em si mesma. Ela só vale se resultar em:

- menos caos;
- menos risco de regressão;
- mais facilidade de manutenção;
- mais velocidade de evolução.

## Regras de execução

- não reescrever tudo de uma vez;
- cada domínio deve entrar em produção antes de passar para o próximo;
- cada repositorio precisa ter um README próprio e um contrato de integração;
- cada mudança precisa ser validada no navegador;
- nenhuma fase pode quebrar o fluxo de uso da plataforma atual.

## Governança da migração

Para que isso não vire um projeto disperso, a migração precisa de regras simples de gestão:

- cada repositório precisa ter um dono claro;
- cada mudança precisa ter um objetivo específico;
- cada domínio precisa ter uma definição de escopo e uma lista de dependências;
- cada integração precisa ser versionada e documentada;
- cada repositório precisa ter um estado de maturidade: backlog, em desenvolvimento, em teste ou estável.

## Backlog inicial de execução

### Sprint 0 — base de governança

- mapear todos os módulos atuais;
- definir os contratos mínimos;
- criar o template base de README e estrutura de repositório;
- abrir a branch de migração.

### Sprint 1 — núcleo do sistema

- extrair core;
- extrair shell;
- criar a camada de composição;
- garantir que a aplicação continue funcionando como antes.

### Sprint 2 — identidade e dados

- migrar profile;
- migrar data;
- criar os primeiros adaptadores de compatibilidade.

### Sprint 3 — experiência principal

- migrar content;
- migrar tools;
- migrar arsenal;
- migrar elites;
- migrar academia;
- migrar robotica.

### Sprint 4 — extensões e IA

- migrar media;
- migrar audio;
- migrar cibersec;
- migrar economia;
- migrar jarvis-core;
- migrar jarvis-tools;
- migrar jarvis-memory.

### Sprint 5 — consolidação

- migrar desktop;
- migrar infra;
- migrar docs;
- consolidar o projeto final como Nexus Baluarte.

## Modelo mínimo de contrato entre módulos

Cada módulo deve expor, no mínimo:

- nome do módulo;
- versão;
- entradas disponíveis;
- eventos emitidos;
- dados esperados;
- dependências obrigatórias;
- forma de integração com o orquestrador.

Esse modelo evita que a integração vire uma mistura de improviso e dependências invisíveis.

## Riscos principais e como evitar

- risco de fragmentação sem controle: evitar com governança, dono por repositório e checkpoints claros;
- risco de quebrar o fluxo atual: evitar com compatibilidade gradual e validação contínua;
- risco de reescrever demasiado cedo: evitar com migração por domínio e validação antes de avançar;
- risco de depender de muitos módulos ao mesmo tempo: evitar com uma ordem de migração bem definida.

## Ordem prática de migração

1. core
2. shell
3. profile
4. data
5. docs
6. content
7. tools
8. arsenal
9. elites
10. academia
11. robotica
12. media
13. audio
14. cibersec
15. economia
16. jarvis-core
17. jarvis-tools
18. jarvis-memory
19. desktop
20. infra

Essa ordem prioriza o que sustenta o sistema antes do que depende dele.

## Checklist inicial de abertura

- [ ] criar branch de migração;
- [ ] mapear módulos atuais;
- [ ] definir contratos mínimos;
- [ ] criar template de repositório;
- [ ] extrair core;
- [ ] extrair shell;
- [ ] validar o sistema no navegador;
- [ ] registrar o primeiro domínio migrado como estável.

## Primeira onda real de migração

A primeira onda não precisa ser grande. Ela precisa ser limpa, estável e bem documentada. A sugestão é começar por um primeiro pacote mínimo composto por:

- baluarte-core
- baluarte-shell
- baluarte-profile
- baluarte-data

Esse conjunto já entrega o suficiente para sustentar a aplicação sem depender ainda de todos os módulos de experiência. Se esse pacote funcionar bem, o restante da migração passa a ser progressiva e menos arriscada.

### O que o primeiro pacote deve entregar

- estado global estável;
- navegação compartilhada;
- perfil do operador e dados persistidos;
- estrutura base para adicionar módulos depois;
- compatibilidade com a versão atual do projeto.

### Critério de sucesso da primeira onda

A primeira onda só é considerada bem-sucedida quando:

- o projeto continua rodando sem regressão;
- o core e o shell conseguem carregar módulos externos;
- o perfil e os dados funcionam sem depender do monólito antigo;
- a equipe ou o agente conseguem evoluir o sistema sem quebrar o fluxo principal.

## O que eu recomendo de verdade

Se o objetivo é “mudar de verdade”, eu faria assim:

1. primeiro, construir a arquitetura do Nexus;
2. depois, separar em repositórios por domínio;
3. depois, reescrever cada módulo com calma;
4. só no fim consolidar tudo em um projeto principal forte.

Em outras palavras: eu faria a mudança, sim. Mas eu faria como uma migração estratégica, não como uma grande quebra repentina.

## Resultado esperado

O resultado final não seria apenas “um projeto com outro nome”. O resultado seria:

- arquitetura mais limpa;
- funções mais bem separadas;
- manutenção mais simples;
- reescrita com menos risco;
- maior capacidade de evolução;
- uma base que realmente merece o nome “Nexus”.

## Plano em fases curtas

A migração não precisa acontecer de uma vez. Ela pode ser executada em ciclos curtos e controlados:

### Fase curta 1 — estabilizar

- criar a base de integração;
- extrair core e shell;
- validar a aplicação atual sem regressão.

### Fase curta 2 — isolar

- migrar profile e data;
- deixar o primeiro pacote funcional e testado.

### Fase curta 3 — expandir

- migrar content e tools;
- trazer os módulos principais para o novo modelo.

### Fase curta 4 — aprofundar

- migrar IA, mídia, áudio e economia;
- consolidar os domínios de extensão.

### Fase curta 5 — consolidar

- fechar desktop e infra;
- renomear o projeto para Nexus Baluarte;
- deixar a estrutura pronta para crescimento contínuo.

## Conclusão prática

Se a intenção é fazer isso de forma inteligente, a melhor estratégia é: não tentar migrar tudo ao mesmo tempo, não tentar parecer moderno apenas pelo nome e não perder o foco de que o objetivo principal é reduzir o caos. O Nexus Baluarte só faz sentido se a separação levar a menos complexidade, menos risco e mais força real no projeto.

## Próximos passos imediatos

1. criar a branch de migração;
2. mapear os módulos atuais e separar por domínio;
3. definir o primeiro contrato de integração entre core, shell, profile e data;
4. extrair o core e o shell como base inicial;
5. validar a aplicação com o novo fluxo antes de expandir para os demais domínios;
6. registrar cada domínio migrado com status claro: backlog, em desenvolvimento, em teste ou estável.

## Plano de 30 dias

Este plano foca na primeira onda real de migração: core, shell, profile e data.

### Semana 1 — base e mapeamento

- criar a branch de migração;
- mapear as rotas, módulos e dependências atuais;
- escolher o primeiro contrato de integração;
- criar o template base de repositório e README;
- definir o estado inicial de cada domínio.

### Semana 2 — núcleo do sistema

- extrair o core;
- extrair o shell;
- criar a camada de composição inicial;
- garantir que a aplicação continue abrindo e navegando corretamente.

### Semana 3 — identidade e dados

- migrar profile;
- migrar data;
- criar os adaptadores mínimos de compatibilidade;
- validar persistência, navegação e estado global.

### Semana 4 — estabilização e integração

- validar a primeira onda completa no navegador;
- corrigir regressões e pontos de fricção;
- documentar o fluxo de integração;
- preparar o próximo pacote de migração para a semana seguinte.

### Entregas esperadas ao fim dos 30 dias

- core e shell funcionando como base de integração;
- profile e data operando com compatibilidade mínima;
- o projeto caminhando sem perder a experiência atual;
- um mapa claro do próximo conjunto de domínios a migrar.

## Checklist de execução diária

### Antes de começar

- [ ] revisar o que foi feito no dia anterior;
- [ ] confirmar qual tarefa da semana está em andamento;
- [ ] verificar se há algum risco ou dependência crítica;
- [ ] abrir a branch de migração e garantir que ela está atualizada.

### Durante o trabalho

- [ ] trabalhar em uma tarefa por vez;
- [ ] manter o foco no domínio atual;
- [ ] validar a mudança no navegador ou na execução correspondente;
- [ ] registrar qualquer regressão ou bloqueio imediatamente;
- [ ] evitar tocar em outros domínios sem necessidade.

### Ao final do dia

- [ ] salvar o estado atual;
- [ ] anotar o que foi concluído;
- [ ] verificar se o sistema continua estável;
- [ ] deixar a próxima tarefa pronta para o próximo dia.

## Todo list pronta para execução

> Formato alinhado com GitHub Projects: cada item pode virar uma issue com prioridade, status e dependência.

### Fase 1 — base de migração

- [ ] P0 — criar branch de migração
  - Dependência: nenhuma
  - Status sugerido: Backlog
- [ ] P0 — mapear rotas, módulos e dependências
  - Dependência: branch criada
  - Status sugerido: Backlog
- [ ] P0 — definir o contrato mínimo de integração
  - Dependência: mapeamento concluído
  - Status sugerido: Backlog
- [ ] P1 — criar template base de repositório e README
  - Dependência: contrato definido
  - Status sugerido: Backlog
- [ ] P1 — preparar o estado inicial de cada domínio
  - Dependência: template criado
  - Status sugerido: Backlog

### Fase 2 — núcleo

- [ ] P0 — extrair baluarte-core
  - Dependência: contrato mínimo definido
  - Status sugerido: Backlog
- [ ] P0 — extrair baluarte-shell
  - Dependência: core extraído
  - Status sugerido: Backlog
- [ ] P1 — criar a camada de composição inicial
  - Dependência: core e shell extraídos
  - Status sugerido: Backlog
- [ ] P1 — validar navegação e bootstrap do sistema
  - Dependência: camada de composição criada
  - Status sugerido: Backlog

### Fase 3 — identidade e dados

- [ ] P0 — migrar baluarte-profile
  - Dependência: núcleo estável
  - Status sugerido: Backlog
- [ ] P0 — migrar baluarte-data
  - Dependência: profile migrado
  - Status sugerido: Backlog
- [ ] P1 — criar adaptadores de compatibilidade mínimos
  - Dependência: profile e data migrados
  - Status sugerido: Backlog
- [ ] P1 — validar persistência e estado global
  - Dependência: adaptadores criados
  - Status sugerido: Backlog

### Fase 4 — experiência principal

- [ ] P1 — migrar baluarte-content
  - Dependência: núcleo estável
  - Status sugerido: Backlog
- [ ] P1 — migrar baluarte-tools
  - Dependência: content migrado
  - Status sugerido: Backlog
- [ ] P1 — migrar baluarte-arsenal
  - Dependência: tools migrado
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-elites
  - Dependência: arsenal migrado
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-academia
  - Dependência: content migrado
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-robotica
  - Dependência: academia migrada
  - Status sugerido: Backlog

### Fase 5 — extensões e IA

- [ ] P2 — migrar baluarte-midia
  - Dependência: experiência principal estabilizada
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-audio
  - Dependência: mídia migrada
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-cibersec
  - Dependência: experiência principal estabilizada
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-economia
  - Dependência: cibersec migrada
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-jarvis-core
  - Dependência: núcleo estável
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-jarvis-tools
  - Dependência: jarvis-core migrado
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-jarvis-memory
  - Dependência: tools migrados
  - Status sugerido: Backlog

### Fase 6 — consolidação

- [ ] P2 — migrar baluarte-desktop
  - Dependência: núcleo e integração estáveis
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-infra
  - Dependência: desktop migrado
  - Status sugerido: Backlog
- [ ] P2 — migrar baluarte-docs
  - Dependência: infraestrutura definida
  - Status sugerido: Backlog
- [ ] P0 — consolidar o projeto final como Nexus Baluarte
  - Dependência: todos os domínios principais migrados
  - Status sugerido: Backlog
