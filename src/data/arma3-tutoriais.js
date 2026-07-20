/**
 * Tutorial detalhado dos 105 mods do preset "projeto baluarte vercel app"
 * (pedido do operador: explicar CADA mod — o que é, como funciona, comandos
 * e atalhos — tudo numa página só, /arma3-tutorial).
 *
 * Honestidade primeiro: teclas listadas são os PADRÕES conhecidos (jogo/ACE)
 * — quase todo mod baseado no CBA deixa trocar em Options → Controls →
 * Configure Addons. Quando um mod não tem tecla padrão documentada, o campo
 * diz "configurável". A página do Workshop (link em cada card) é a fonte
 * oficial de cada mod.
 *
 * Chave de cada entrada = id do Steam Workshop (bate com arma3-presets.js).
 */

export const A3TUT_CATEGORIAS = [
  { id: 'fundacao',    nome: 'Fundação & Frameworks', icon: '🧱', desc: 'A base de tudo — sem estes, metade do preset nem carrega. Instale e deixe.' },
  { id: 'imersao',     nome: 'Movimento & Imersão',   icon: '🏃', desc: 'Como o soldado se move, atira, cansa e reage — o "game feel".' },
  { id: 'interface',   nome: 'Interface & HUD',       icon: '🖥️', desc: 'Inventário, radar de esquadrão, GPS, marcação de alvos e visão noturna.' },
  { id: 'cordas',      nome: 'Cordas, Rapel & Breach', icon: '🪢', desc: 'Descer de corda, tirolesa, içar carga e arrombar porta.' },
  { id: 'apoio',       nome: 'Apoio de Fogo & Comando', icon: '📡', desc: 'Artilharia, apoio aéreo e comando de operações.' },
  { id: 'armas',       nome: 'Armas & Acessórios',    icon: '🔫', desc: 'Pacotes de armas, óticas, lasers e dispositivos — tudo aparece no Arsenal.' },
  { id: 'faccoes',     nome: 'Facções & Conteúdo',    icon: '🎖️', desc: 'Exércitos completos (unidades, veículos, armas) pro editor, Zeus e cenários.' },
  { id: 'equipamento', nome: 'Uniformes & Equipamento', icon: '🎽', desc: 'Capacetes, coletes, uniformes e retexturas — visual no Arsenal.' },
  { id: 'aeronaves',   nome: 'Aeronaves & Drones',    icon: '🚁', desc: 'Aeronaves novas e drone FPV.' },
  { id: 'construcao',  nome: 'Construção & Cenário',  icon: '🏗️', desc: 'Trincheiras, estruturas e construção em jogo — Eden e Zeus.' },
  { id: 'admin',       nome: 'Admin, Cheats & Performance', icon: '⚙️', desc: 'Menus de administração/teste e ganho de FPS.' }
];

export const A3TUT_MODS = {
  /* ===================== 🧱 FUNDAÇÃO & FRAMEWORKS ===================== */
  450814997: {
    cat: 'fundacao', nome: 'CBA_A3',
    oQue: 'Community Base Addons — a biblioteca que quase todos os outros mods usam. Não adiciona conteúdo visível: adiciona os SISTEMAS (eventos, configurações, teclas).',
    como: 'Carrega sozinho e fica invisível. As duas portas que ele abre pra você: "Addon Options" (Options → Addon Options), onde cada mod expõe suas configurações, e "Configure Addons" (Options → Controls → Configure Addons), onde TODAS as teclas de mods CBA são vistas e trocadas.',
    atalhos: [['Esc → Options → Addon Options', 'configurações de cada mod'], ['Options → Controls → Configure Addons', 'ver/trocar as teclas de todos os mods']],
    dicas: ['Sempre que este tutorial disser "configurável", é NESSE menu que a tecla mora.', 'Deixe o CBA no topo da lista de mods do Launcher.']
  },
  463939057: {
    cat: 'fundacao', nome: 'ACE',
    oQue: 'O maior overhaul de realismo do Arma 3: sistema médico avançado, balística real, interação com tudo (portas, corpos, veículos), granadas arremessáveis de verdade, protetores auriculares e dezenas de subsistemas.',
    como: 'O coração é o menu de interação: aponte pra algo e segure a tecla de interação — um menu radial aparece com as ações do alvo (tratar ferido, arrastar, algemar, abrir porta devagar…). A auto-interação abre o mesmo menu apontado pra VOCÊ (tratar-se, colocar protetor, checar munição). O sistema médico troca a barra de vida por ferimentos por membro: bandagem estanca, morfina tira dor, soro repõe volume, torniquete segura hemorragia em campo.',
    atalhos: [['⊞ Win (segurar)', 'menu de interação (no que você está olhando)'], ['Ctrl + ⊞ Win (segurar)', 'auto-interação (em você mesmo)'], ['Page Up / Page Down', 'ajuste de mira (zeroing) da luneta'], ['G (segurar) / G', 'preparar/arremessar granada (modo ACE)']],
    dicas: ['Configure a dificuldade médica em Addon Options → ACE Medical (de "arcade" a "realista de esmagar").', 'Protetor auricular: auto-interação → Equipamento. Sem ele, tiro dentro de prédio ensurdece.', 'Quase todo mod deste preset conversa com o ACE — aprender o menu radial é aprender o preset inteiro.']
  },
  2522638637: {
    cat: 'fundacao', nome: 'ACE3 Arsenal Extended - Core',
    oQue: 'Extensão do Arsenal do ACE que agrupa variantes de equipamento (cores/versões do mesmo item) num seletor só — em vez de 30 entradas "capacete verde/tan/preto", uma entrada com opções.',
    como: 'É o CORE: precisa de mods de compatibilidade por pack de equipamento (existem compats prontos, ex.: USP) — mods deste preset que já suportam (SPS, retexturas do Simpel) se agrupam sozinhos. Requer ACE 3.16+. Sem tecla própria: é UI dentro do Arsenal ACE.',
    atalhos: [['— ', 'sem teclas; funciona dentro do Arsenal ACE']],
    dicas: ['Se um pack aparecer "desagrupado", falta o compat dele — procure "[Pack] AAE compat" no Workshop.']
  },
  1376867375: {
    cat: 'fundacao', nome: 'ACE Interaction Menu Expansion',
    oQue: 'Porta as ações mais usadas do menu de rolagem vanilla pro menu radial do ACE — a cura da guerra entre os dois menus (e do clássico "ejetar sem querer" rolando a roda).',
    como: 'As ações novas (abrir INVENTÁRIO, entrar em veículos por posição, etc.) aparecem no menu radial (⊞ Win / Ctrl+⊞ Win) quando fazem sentido — o objetivo declarado do autor é você quase nunca precisar do menu de rolagem.',
    atalhos: [['⊞ Win / Ctrl + ⊞ Win', 'as ações novas entram no menu radial do ACE']],
    dicas: ['Requer o ACE (interact menu) — já está no preset.', 'Ótimo pra imersão: menos UI vanilla quebrando o clima.']
  },
  1779063631: {
    cat: 'fundacao', nome: 'Zeus Enhanced (ZEN)',
    oQue: 'O editor "ao vivo" (Zeus) turbinado: dezenas de módulos novos, atributos editáveis de qualquer unidade/veículo, criador de composições e interface muito melhor.',
    como: 'Entre como curador (tecla do Zeus) e tudo do ZEN aparece na própria interface: clique-direito em unidades pra atributos avançados (munição, combustível, postura, lealdade), árvore de módulos nova (clima, spawn, IED, médico…) e busca melhorada. É a ferramenta pra MONTAR cenários em segundos.',
    atalhos: [['Y', 'abrir o Zeus (padrão do jogo, precisa ser curador na missão)'], ['clique-direito (no Zeus)', 'menu de contexto do ZEN com atributos avançados']],
    dicas: ['Jogando Antistasi Ultimate, a tecla Y pode conflitar com o menu do Antistasi — remapeie uma das duas.', 'Use "Game Master" do próprio ZEN nas missões do editor pra ter Zeus em qualquer cenário seu.']
  },
  2966168738: {
    cat: 'fundacao', nome: 'Terrain Lib',
    oQue: 'Editor de TERRENO dentro do Zeus: funções pra modificar a altura/forma do terreno por áreas (gatilhos, marcadores, áreas por função) com vários parâmetros.',
    como: 'No Zeus, use as ferramentas/módulos do Terrain Lib pra esculpir o terreno da área escolhida. Também otimiza a rede em MP: só os pontos de terreno que mudaram são enviados (o padrão do jogo reenvia o grupo todo).',
    atalhos: [['—', 'ferramentas dentro do Zeus']],
    dicas: ['Combina com o Trencher e as Chameleon Trenches: terreno esculpido + trincheira com textura do solo.']
  },
  3147473073: {
    cat: 'fundacao', nome: 'TOTT Core',
    oQue: 'Núcleo da família TOTT (Tools of the Trade): retratos autênticos das armas usadas por componentes do JSOC, feitos com referências e pesquisa pesada.',
    como: 'Passivo — funções e assets compartilhados. Requer CBA e RHSUSAF (a família TOTT é construída sobre o framework RHS).',
    atalhos: [['—', 'sem interação direta']],
    dicas: ['Os itens em si aparecem via TOTT AiO/NSW/Optics no Arsenal.']
  },
  2010222986: {
    cat: 'fundacao', nome: 'GGE: Core',
    oQue: 'Núcleo dos mods GGE (Gruppe Adler-style Gameplay Enhancements) — base pro GGE: Weapon Canting deste preset.',
    como: 'Passivo; expõe configurações em Addon Options quando os módulos GGE estão ativos.',
    atalhos: [['—', 'sem interação direta']],
    dicas: ['Sem ele o Weapon Canting não carrega.']
  },
  3575468172: {
    cat: 'fundacao', nome: 'MCC - Core',
    oQue: 'Núcleo da série "Modern Combat Carbines" (Project M) — a linha de armas e acessórios modernos deste preset (Red Dot, LPVO, M4A1, Knights…). Não confundir com o "MCC Sandbox" de missões.',
    como: 'Core puro: NÃO contém itens em jogo (aviso oficial do autor) — carrega os sistemas que os packs MCC usam. As armas e óticas vêm dos packs "MCC -" e aparecem no Arsenal.',
    atalhos: [['—', 'sem interação direta']],
    dicas: ['Instale sempre junto de qualquer pack "MCC -" da lista — todos dependem deste Core.']
  },
  3328314886: {
    cat: 'fundacao', nome: 'Heavy Weapons Framework',
    oQue: 'Framework de ANIMAÇÕES pra armas pesadas: carregar uma arma pesada te coloca num moveset especial que restringe o movimento (mantendo alguma mobilidade) — peso de verdade no ombro. Nasceu dentro do mod Solar Auxilia e virou standalone a pedidos.',
    como: 'As armas afetadas são definidas nas opções do CBA (ou no config de cada mod compatível). Entrou no moveset pesado? Pra SAIR: agache ou dispare o sprint.',
    atalhos: [['X ou sprint', 'sair do moveset de arma pesada'], ['Addon Options → HWF', 'definir quais armas contam como pesadas']],
    dicas: ['Metralhadora pesada deixou de ser fuzil com skin: agora ela ANDA como pesada.']
  },

  /* ===================== 🏃 MOVIMENTO & IMERSÃO ===================== */
  2664678033: {
    cat: 'imersao', nome: 'CE: Movement',
    oQue: 'Cluster Enhancements: Movement — controle FINO da velocidade de movimento: você ajusta o passo entre os degraus fixos do jogo (andar/trotar/correr), estilo "walk speed" analógico.',
    como: 'Ajuste a velocidade atual pelos atalhos do mod (roda de velocidade) — útil pra acompanhar formação sem a dança do anda-para-anda. Open source (GPLv3), da comunidade Cluster.',
    atalhos: [['configurável (Configure Addons → CE Movement)', 'aumentar/diminuir a velocidade de movimento']],
    dicas: ['Patrulha em formação: iguale sua velocidade à do ponto e esqueça o stop-and-go.']
  },
  3351398245: {
    cat: 'imersao', nome: 'Animated Corner Shooting',
    oQue: 'Sistema de tiro "às cegas" por trás de cobertura: desloca a arma pro lado/cima da quina expondo o mínimo do corpo. Funciona em todas as posturas (só pra jogadores, não pra IA).',
    como: 'Perto da cobertura, desloque a arma com os atalhos do mod e atire; clique DUPLO na tecla trava a posição. Requer o Animated Recoil (mesmo autor) ativo — já está neste preset.',
    atalhos: [['Shift + Q', 'deslocar a arma pra ESQUERDA da cobertura (padrão)'], ['Shift + E', 'deslocar a arma pra DIREITA (padrão)'], ['Ctrl + botão-direito', 'deslocar a arma pra CIMA (padrão)'], ['tecla 2× rápido', 'travar/destravar a posição deslocada']],
    dicas: ['Brutal em CQB urbano; treine no VR antes de usar em missão.', 'Teclas trocáveis nas configurações do mod (CBA).']
  },
  3687909045: {
    cat: 'imersao', nome: 'Showdown Posture',
    oQue: 'Postura "arma alta" AUTOMÁTICA inspirada no Hunt: Showdown — o personagem levanta a arma sozinho na prontidão, como naquele jogo. Feito originalmente pro cenário Mad God Part 2 e liberado pra todo mundo.',
    como: 'Automático ao carregar — sem tecla. Dá pra EXCLUIR armas do sistema nas opções (as MGs do Spearhead já vêm excluídas por usarem sistema próprio). Existe uma versão separada do autor com suporte a IA.',
    atalhos: [['—', 'automático; exclusões em Addon Options']],
    dicas: ['Compatível com praticamente tudo, segundo o autor — se alguma arma brigar, exclua ela nas opções.']
  },
  3761394375: {
    cat: 'imersao', nome: 'Realistic Vegetation Interaction (RVI)',
    oQue: 'Penalidades de MOVIMENTO na vegetação densa: atravessar arbusto/mato fechado fica lento de verdade — pra você E pra IA — simulando o esforço de romper a folhagem.',
    como: '100% passivo, com impacto de performance praticamente zero (promessa oficial do autor). Ande no mato denso e sinta o freio.',
    atalhos: [['—', 'passivo']],
    dicas: ['O autor recomenda o irmão RVC (Realistic Vegetation Concealment) pro lado da OCULTAÇÃO — papel que neste preset o HATG já cumpre.', 'Emboscada em mata fechada ficou mais honesta: ninguém "surfa" pelo arbusto.']
  },
  3346427969: {
    cat: 'imersao', nome: 'Hide Among The Grass (HATG)',
    oQue: 'Stealth com foco em performance: a IA passa a NÃO te ver na grama. Você fica oculto quando DEITADO ou AGACHADO (ou em pé dentro de prédio), pesando fatores como distância do inimigo e o tipo de superfície.',
    como: 'Passivo — não mexe no comportamento da IA, só em como ela "enxerga" (por isso é compatível com mods de IA). Todos os fatores são configuráveis em Addon Options.',
    atalhos: [['—', 'passivo; opções em Addon Options → HATG']],
    dicas: ['Em pé no meio do mato você CONTINUA visível — a ocultação exige deitar/agachar.', 'Combina perfeitamente com Dynamic Camo System e ghillie: sniper de verdade.']
  },
  2800081814: {
    cat: 'imersao', nome: 'Dynamic Camo System',
    oQue: 'Camuflagem dinâmica: adapta a eficácia (e o visual da ghillie) ao terreno onde você está.',
    como: 'Use a interação do mod (auto-interação ACE → camuflagem) pra "montar" camuflagem do terreno local; a detecção da IA considera o quão certo você se camuflou pro ambiente.',
    atalhos: [['Ctrl + ⊞ Win', 'auto-interação → aplicar/ajustar camuflagem']],
    dicas: ['Ghillie de floresta em deserto = alvo. Recamufle ao trocar de bioma.']
  },
  632435682: {
    cat: 'imersao', nome: 'Remove Stamina',
    oQue: 'Remove a fadiga/stamina do jogo — corre pra sempre, sem arma balançando de cansaço. Feito pra co-op com MUITA corrida.',
    como: 'Passivo, zero configuração: executa `player enableStamina false` a cada segundo (é literalmente isso, segundo o autor). Instalou, nunca mais cansou.',
    atalhos: [['—', 'passivo']],
    dicas: ['Convive bem com o Simple Weight Limit: você não CANSA, mas também não vira mula de carga infinita.']
  },
  3044998814: {
    cat: 'imersao', nome: 'Simple Weight Limit',
    oQue: 'Limite de peso em DOIS degraus: acima do peso MÉDIO você perde o sprint (só trota); acima do peso MÁXIMO, nem trotar.',
    como: 'Passivo — os dois limites (em libras/lbs) são configuráveis em Addon Options → "Weight Limit". Em MP, só o servidor precisa ter o mod.',
    atalhos: [['Addon Options → Weight Limit', 'definir peso médio e máximo (lbs)']],
    dicas: ['Olhe a barra de peso no inventário antes de sair do Arsenal.', 'Mula de esquadrão com mochila cheia de munição vai sentir os dois degraus.']
  },
  2010226699: {
    cat: 'imersao', nome: 'GGE: Weapon Canting',
    oQue: 'Atirar com a arma primária INCLINADA (canted) — o clássico "deitar o fuzil" pra mirar por cima de cobertura baixa ou usar mira offset.',
    como: 'MIRANDO, aperte a tecla do mod pra alternar entre mira normal e inclinada. Se você usa "toggle" pra mirar (Optics no botão direito), marque a opção "Toggle ADS" nas configurações do mod.',
    atalhos: [['C (mirando)', 'alternar mira normal ↔ inclinada (padrão do mod)'], ['Configure Addons → GGE', 'trocar tecla e opções (Toggle ADS)']],
    dicas: ['Retículo fora do centro ao inclinar? Desligue o headbob (dica oficial do autor).', 'Com LPVO das MCC, o canting vira mira secundária real de CQB.']
  },
  2623341670: {
    cat: 'imersao', nome: 'Animated Recoil Coefficient Changer',
    oQue: 'Recuo re-animado: coronha empurra o ombro, muzzle rise crível, e coeficientes ajustáveis.',
    como: 'Passivo no tiro; o "quanto" de recuo é ajustável nas opções do mod (Addon Options).',
    atalhos: [['—', 'passivo; intensidade em Addon Options']],
    dicas: ['Se achar exagerado com alguma arma de mod, baixe o coeficiente global em vez de remover o mod.']
  },
  2993442344: {
    cat: 'imersao', nome: 'Death and Hit Reactions',
    oQue: 'Animações cinematográficas de morte e reação a acertos — e um truque técnico por trás: a animação antes do ragdoll ajuda a SINCRONIZAR o ragdoll em MP (o jogo só interpola o fim da queda, não o caminho todo).',
    como: 'Passivo — IA e jogadores tropeçam, cambaleiam e caem de formas variadas conforme onde levaram o tiro. Em MP precisa estar no cliente E no servidor.',
    atalhos: [['—', 'passivo']],
    dicas: ['Muda completamente a leitura de "acertei ou não" a média distância.']
  },
  3444518126: {
    cat: 'imersao', nome: 'Immersive Voices PLUS',
    oQue: 'Conjuntos de VOZES TEMÁTICAS com protocolo de rádio completo: Warhammer 40K (Guarda Imperial, Space Marines, Orks…), HALO (fuzileiros, Elites), Star Wars (clones com voz do Temuera Morrison, droides) e mais.',
    como: 'Aplica as vozes automaticamente (via setSpeaker) nas unidades spawnadas no Eden e no Zeus, conforme o tema. Jogadores e o Zeus escutam; os arquivos são assinados pra MP.',
    atalhos: [['—', 'automático ao spawnar unidades (Eden/Zeus)']],
    dicas: ['Jogando cenário normal, é neutro; em cenários temáticos (40K/HALO/SW) as unidades ganham as vozes certas sozinhas.']
  },

  /* ===================== 🖥️ INTERFACE & HUD ===================== */
  2791403093: {
    cat: 'interface', nome: 'Better Inventory',
    oQue: 'Fim do pula-pula entre abas: uniforme, colete E mochila visíveis AO MESMO TEMPO na tela de inventário, com movimentação de itens em pilha e botões do Task Force Radio.',
    como: 'Abra o inventário (I) e a UI nova está lá. Mover em PILHA: segure Shift ao arrastar = 5 itens de uma vez; segure Ctrl = o máximo possível (carregadores parciais agrupam com parciais, cheios com cheios). Só itens/carregadores empilham (armas e contêineres não — limite do engine). Clientside: em MP basta o servidor permitir.',
    atalhos: [['I', 'inventário (padrão do jogo)'], ['Shift + arrastar', 'mover 5 itens de uma vez'], ['Ctrl + arrastar', 'mover o máximo possível'], ['Options → Controls → Better Inventory', 'trocar as teclas do mod']],
    dicas: ['Tem compatibilidade nativa com o Dual Arms (2 armas primárias) — ver o destaque no topo da página.', '⚠ CONFLITO: o EBI (também neste preset) declara-se incompatível com este mod — ative UM dos dois, não ambos.']
  },
  3739421199: {
    cat: 'interface', nome: 'EVEN Better Inventory (EBI)',
    oQue: 'Inventário estilo ESCAPE FROM TARKOV em 3 painéis: GEAR (armas/loadout), CONTAINER (uniforme+colete+mochila sempre visíveis) e STASH (chão/caixas/veículos com abas de filtro All·Weapons·Magazines·Items). Em BETA público.',
    como: 'Substitui a TELA do inventário mantendo as regras vanilla por baixo (é overhaul de UI, não de sistema). Destaque oficial: integração com o Armor Plates System — slot dedicado de placas com barra de HP (arraste a placa pro slot e pronto). Compatível com BackpackOnChest-Redux e ACE (carregue @ace ANTES do EBI).',
    atalhos: [['I', 'inventário (padrão do jogo)'], ['abas do STASH', 'filtrar loot: All · Weapons · Magazines · Items']],
    dicas: ['⚠ INCOMPATÍVEL com o Better Inventory original (aviso oficial do autor) — como os DOIS estão no preset, ative só um por vez no Launcher.', 'É beta: o autor pede pra testar em SP antes de levar pra comunidade.', '🎉 Desde a atualização 0.7.8 do preset, o Armor Plates System e o BackpackOnChest-Redux estão INCLUSOS — o slot de placas com barra de HP e o botão de mochila no peito ficam ATIVOS.']
  },
  2060770170: {
    cat: 'interface', nome: 'Arsenal Search',
    oQue: 'Campo de busca no Arsenal vanilla — digite "AK" e ache em segundos no meio de 3.000 itens.',
    como: 'Abra qualquer Arsenal e use a caixinha de busca que aparece na UI; filtra a categoria atual em tempo real.',
    atalhos: [['—', 'campo de busca na própria UI do Arsenal']],
    dicas: ['Com 330 mods somados nos presets, isto aqui vale ouro.']
  },
  1638341685: {
    cat: 'interface', nome: 'DUI - Squad Radar',
    oQue: 'O HUD de esquadrão definitivo: radar compacto mostrando posição/direção dos colegas, nomes, e indicadores configuráveis.',
    como: 'Liga sozinho em missão. TUDO é configurável em Addon Options → DUI (tamanho, transparência, o que aparece); teclas pra alternar elementos são definidas no Configure Addons.',
    atalhos: [['configurável (Configure Addons → DUI)', 'mostrar/ocultar radar · nomes · indicadores']],
    dicas: ['Em servidor milsim costuma-se jogar só com o radar (sem nametags) — ajuste o seu.', 'O radar respeita o rádio/distância se o servidor configurar assim.']
  },
  2480263219: {
    cat: 'interface', nome: 'Enhanced GPS',
    oQue: 'GPS de verdade no canto da tela: minimapa maior, zoom e mais informação que o GPS vanilla.',
    como: 'Precisa do item GPS no inventário. Ligue o minimapa com a tecla padrão do jogo e use as opções do mod pra zoom/tamanho.',
    atalhos: [['Ctrl + M', 'ligar/desligar o GPS (padrão do jogo, com item GPS)'], ['configurável', 'zoom/tamanho — Configure Addons']],
    dicas: ['Navegação noturna sem abrir o mapa (que te deixa cego): GPS + bússola.']
  },
  2057294714: {
    cat: 'interface', nome: 'ETS - Enemy Tagging System',
    oQue: 'Marcação de inimigos estilo "tagging": olhou, marcou, o esquadrão vê a marca.',
    como: 'Aponte pro inimigo e use a tecla de marcação do mod; a marca aparece pra você/grupo conforme as opções.',
    atalhos: [['configurável (Configure Addons → ETS)', 'marcar alvo olhado']],
    dicas: ['Em dificuldade alta, limite a duração da marca nas opções — senão vira wallhack.']
  },
  2652027546: {
    cat: 'interface', nome: 'IVAS Headset',
    oQue: 'O headset IVAS (realidade aumentada militar real dos EUA): visão noturna/térmica moderna de tela larga com overlay de informações.',
    como: 'Equipe o IVAS no slot de NVG pelo Arsenal e ligue como uma visão noturna normal; modos extras alternam na tecla de modo.',
    atalhos: [['N', 'ligar/desligar (slot de NVG, padrão do jogo)'], ['Ctrl + N', 'alternar modo de visão (padrão do jogo)']],
    dicas: ['Procure "IVAS" no Arsenal Search — fica na categoria de óculos/NVG.']
  },
  2260572637: {
    cat: 'interface', nome: 'BettIR NVG',
    oQue: 'Faz os iluminadores IR (infravermelho) funcionarem de verdade: com NVG, o feixe IR ilumina o ambiente como uma lanterna invisível a olho nu.',
    como: 'Monte um laser/iluminador IR na arma, ligue-o com a tecla de lanterna/laser e use o NVG — o cone de luz IR aparece só na visão noturna. A IA também usa.',
    atalhos: [['L', 'ligar acessório (lanterna/laser/IR — padrão do jogo)'], ['Ctrl + L (ACE)', 'alternar entre modos do acessório']],
    dicas: ['Noite fechada + IR iluminando = vantagem absurda contra quem não tem NVG.']
  },
  3100410156: {
    cat: 'interface', nome: '121 Deployable Spotting Scope',
    oQue: 'Luneta de observação implantável via ACE — Leupold Mark 4 12-40x com retículo Horus TREMOR4, criada pra acompanhar rifles de precisão (feita originalmente pra Task Force 121).',
    como: 'PRECISA DE DOIS ITENS do Arsenal: a luneta [121] Leupold Mk4 (slot de binóculo) E o tripé [121] Vortex Summit (itens diversos). Com os dois no inventário: auto-interação do ACE → Equipment → Deploy pra montar no tripé; aí é olhar, ajustar o zoom (12-40x) e ditar correções.',
    atalhos: [['Ctrl + ⊞ Win → Equipment → Deploy', 'montar a luneta no tripé'], ['numpad + / -', 'zoom 12-40x']],
    dicas: ['Sem o tripé no inventário não há como implantar — os DOIS itens são obrigatórios.', 'Dupla clássica: um no Modern Sniper Systems, outro nesta luneta com o retículo TREMOR4 ditando correções.']
  },
  3550382310: {
    cat: 'interface', nome: 'Sniper Utilities',
    oQue: 'Keybinds de DEPLOY RÁPIDO pro kit de precisão: monta tripé de tiro (ACE SSWT) em 3 alturas e a luneta de observação com UMA tecla — sem caçar a ação no menu do ACE.',
    como: 'Feito especificamente pro tripé SSWT do ACE e pro 121 Deployable Spotting Scope (dependência; está no preset). Defina as 4 teclas no Configure Addons: tripé altura 1/2/3 + implantar luneta. As classes dos itens são configuráveis (dá pra apontar pra outros tripés compatíveis).',
    atalhos: [['configurável (Configure Addons → Sniper Utilities)', 'tripé altura 1 · altura 2 · altura 3 · implantar luneta']],
    dicas: ['Fluxo de dupla de precisão em segundos: uma tecla monta o tripé, outra a luneta — e o ACE zeroing (PgUp/PgDn) faz o resto.']
  },
  2954489716: {
    cat: 'interface', nome: 'Advanced Unit Positioning',
    oQue: '"Lean Out": debruçar sobre janelas, parapeitos e beiradas pra atirar ao longo (ou pra baixo) da parede — posições de tiro que o jogo normal não permite.',
    como: 'Com a arma APOIADA numa superfície (deploy do bipé/apoio), entre no modo de debruçar com Ctrl+W (Ajustar Postura Acima) e ajuste o ângulo com E/Q (girar torre). Saia com V — MAS reduza o ângulo antes: no ângulo máximo, sair (ou morrer) te faz cair da beirada. Funciona até em unidades controladas remotamente pelo Zeus.',
    atalhos: [['C (apoiar arma) + Ctrl + W', 'entrar no modo de debruçar (arma apoiada)'], ['E / Q', 'ajustar o ângulo do debruçar'], ['V', 'sair do modo (reduza o ângulo antes!)']],
    dicas: ['Defesa de telhado: debruce e cubra a base da parede — o ângulo morto clássico deixa de existir.', 'Cair da beirada no ângulo máximo é recurso, não bug: dá pra "escorregar" pra fora de uma janela de propósito.']
  },

  /* ===================== 🪢 CORDAS, RAPEL & BREACH ===================== */
  713709341: {
    cat: 'cordas', nome: 'Advanced Rappelling',
    oQue: 'Rapel de helicóptero: a esquadra desce de corda de um heli pairando.',
    como: 'Heli parado no ar (piloto segurando hover), passageiros ganham a ação "Rappel" no menu de rolagem — desça segurando o controle de velocidade da descida. IA comandada também desce (menu de comando).',
    atalhos: [['menu de rolagem', 'ação "Rappel" quando o heli está pairando'], ['W / S (na corda)', 'controlar a descida']],
    dicas: ['Piloto: trave o hover (auto-hover) antes de mandar descer.', 'Altura demais = corda curta; fique < ~30 m do chão.']
  },
  730310357: {
    cat: 'cordas', nome: 'Advanced Urban Rappelling',
    oQue: 'Rapel urbano: descer de corda de prédios, penhascos e estruturas.',
    como: 'Na beirada de um telhado/estrutura, ação "Rappel" no menu de rolagem; desça de costas controlando a velocidade — dá até pra atirar com a pistola na descida.',
    atalhos: [['menu de rolagem', 'ação "Rappel" na beirada'], ['W / S (na corda)', 'controlar a descida'], ['espaço (na corda)', 'impulso/salto de parede']],
    dicas: ['Entrada tática por janela: rapele até a altura dela e limpe o cômodo da corda.']
  },
  1569116504: {
    cat: 'cordas', nome: 'Advanced Zipline',
    oQue: 'Tirolesa: lançar cabo entre dois pontos e deslizar.',
    como: 'Use o item/ação de zipline pra fixar o cabo no destino (precisa de ancoragem válida) e a ação pra deslizar. Verifique inclinação — tirolesa só desce.',
    atalhos: [['menu de rolagem / interação', 'lançar cabo · prender · deslizar']],
    dicas: ['De telhado pra rua = inserção silenciosa sem escada.']
  },
  1667745333: {
    cat: 'cordas', nome: 'Advanced Pickup Rope',
    oQue: 'Corda de extração/içamento: helicóptero recolhe pessoal ou carga por cabo sem pousar.',
    como: 'Heli pairando lança o cabo (ação do piloto/tripulação); quem está no chão usa a ação pra se prender; o heli sai voando com o pacote pendurado.',
    atalhos: [['menu de rolagem', 'lançar cabo · prender-se · soltar']],
    dicas: ['Extração de zona quente sem pouso: o clássico SPIE rig.']
  },
  1547016606: {
    cat: 'cordas', nome: 'Advanced Breaching',
    oQue: 'Arrombamento de portas: cargas de breach, escopeta na fechadura — entrada dinâmica de verdade.',
    como: 'Com o item de breach no inventário, interaja com a porta trancada e escolha o método (carga explosiva, shotgun breach); afaste-se e detone.',
    atalhos: [['⊞ Win / interação na porta', 'colocar carga · arrombar']],
    dicas: ['Combine com Animated Corner Shooting: breach + quina = CQB completo.']
  },
  1547762495: {
    cat: 'cordas', nome: 'Advanced Underbarrel',
    oQue: 'Melhora o uso de acessórios sob o cano (lança-granadas/underbarrel) com mira e manuseio aprimorados.',
    como: 'Com underbarrel montado, alterne pro modo dele e use as miras/ajustes adicionais do mod pro tiro em arco.',
    atalhos: [['F', 'alternar modo de disparo/underbarrel (padrão do jogo)'], ['configurável', 'ajustes finos do mod']],
    dicas: ['Granadeiro treinado no VR: acertar o arco do M203 sem mod de mira é sorte, com isto é técnica.']
  },

  /* ===================== 📡 APOIO DE FOGO & COMANDO ===================== */
  2699465073: {
    cat: 'apoio', nome: 'Fire Support Plus',
    oQue: 'Menu de apoio de fogo: pedir artilharia/morteiro com tipos de munição e padrões de tiro, sem precisar de FSG humano.',
    como: 'Abra o menu do mod (ação/tecla própria), escolha a bateria, munição (HE, fumaça, iluminação…), aponte o alvo no mapa/terreno e confirme. As opções de disponibilidade são configuradas pelo criador da missão/Addon Options.',
    atalhos: [['configurável / menu de comunicação', 'abrir o menu de apoio de fogo']],
    dicas: ['Iluminação noturna sobre o objetivo muda um assalto inteiro.']
  },
  2836999643: {
    cat: 'apoio', nome: 'Air Support Plus',
    oQue: 'Irmão aéreo do Fire Support Plus: CAS (apoio aéreo aproximado), varreduras e lançamentos chamados por menu.',
    como: 'Mesmo fluxo: menu do mod → tipo de apoio aéreo → alvo → confirmação; o avião/heli entra, executa e sai.',
    atalhos: [['configurável / menu de comunicação', 'abrir o menu de apoio aéreo']],
    dicas: ['Marque o alvo com fumaça/laser antes de chamar pra evitar fogo amigo.']
  },
  3679457651: {
    cat: 'apoio', nome: 'SCAI Artillery Support',
    oQue: 'Morteiros IA que FUNCIONAM: quando unidades aliadas avistam o inimigo, elas reportam as coordenadas pras guarnições de morteiro, que engajam com dispersão e precisão realistas. "Chega de morteiros mudos" (lema oficial).',
    como: 'Passivo — o sistema de observação aliada roda sozinho: contato avistado → coordenada reportada → fogo indireto chegando. Tudo configurável via CBA (Addon Options).',
    atalhos: [['—', 'passivo; opções em Addon Options → SCAI']],
    dicas: ['Vale pros DOIS lados: ficar parado em campo aberto contra IA com morteiros virou convite.', 'Coloque um morteiro + guarnição IA na sua base e ganhe apoio de fogo "de graça" nas defesas.']
  },
  3671208957: {
    cat: 'apoio', nome: 'WBK Simple Support',
    oQue: 'Líderes de esquadrão chamam apoio SEM módulo nenhum, em qualquer missão — com um detalhe de imersão: é preciso carregar a MOCHILA-RÁDIO (qual mochila conta é configurável).',
    como: 'Com a mochila exigida nas costas, abra o menu de suporte do mod e chame; tempos, custos e catálogo são todos configuráveis em Addon Options. O autor recomenda combinar com o Simplex Support Services pra sistema mais profundo — os dois convivem.',
    atalhos: [['configurável (Configure Addons → WBK)', 'abrir o menu de suportes'], ['mochila-rádio equipada', 'requisito pra poder chamar']],
    dicas: ['Sem a mochila certa o menu não funciona — o RTO (operador de rádio) virou função de verdade.']
  },
  3323604819: {
    cat: 'apoio', nome: 'LAFS - Light AI Fire Support',
    oQue: 'Dá à IA acesso dinâmico a armas de guerra que ela não sabia usar (incluindo os drones FPV — o Crocus é dependência!) — mais ameaça, combate mais interessante e apoio de fogo justo, sem gatilho manual.',
    como: 'Passivo — o sistema decide quando a IA emprega o apoio. O "Light" é a carga no SERVIDOR: foi desenhado pra operações e unidades grandes. Tem wiki própria com o funcionamento detalhado (link na página do Workshop).',
    atalhos: [['—', 'passivo; opções em Addon Options']],
    dicas: ['⚠ IA com drone FPV caçando você é outra guerra — esteja avisado.', 'Combina com SCAI: o campo de batalha inteiro passa a usar fogo indireto.']
  },
  3699105433: {
    cat: 'apoio', nome: 'ADAPTATIVE ARMA SUPPORTS (AAS - Core)',
    oQue: 'Interface tática de suportes que funciona em QUALQUER missão: do gun run de precisão à QRF completa, de campo minado lançável a FOB entregue de helicóptero — sem módulo de Zeus, sem objeto pré-posto, sem script.',
    como: 'Solte o AAS na missão e a interface de chamados aparece; configure uma vez (mods, mapa, economia) e chame suportes a operação inteira. Funciona com Antistasi, KP Liberation, Warlords, Overthrow e cenário vanilla — e o admin ajusta tudo em tempo real.',
    atalhos: [['interface própria do AAS (menu/ação)', 'chamar os suportes configurados'], ['Addon Options → AAS', 'configurar catálogo, custos e limites']],
    dicas: ['No seu Antistasi Ultimate: AAS vira o "menu de apoio" que a guerrilha não tem.', 'Tudo é IA de verdade executando (o heli VOA até você com a FOB) — não é spawn mágico.']
  },
  2651774379: {
    cat: 'apoio', nome: 'OPCOM - Operations Command',
    oQue: 'Comando de operações: planejar e comandar grupos IA em nível de operação (estilo high command).',
    como: 'Abra a interface do OPCOM, selecione grupos sob seu comando e emita ordens de movimento/objetivo no mapa; a IA executa a manobra.',
    atalhos: [['configurável (Configure Addons)', 'abrir a interface de comando']],
    dicas: ['Brinque de "capitão": você no rádio e três esquadras IA manobrando no mapa.']
  },
  3492800259: {
    cat: 'apoio', nome: 'Binocular - Artillery',
    oQue: 'Transforma o DESIGNADOR A LASER num controlador de artilharia: você carrega "munições" de artilharia nele (foguetes 230 mm, morteiros 155/82 mm, guiados, fumaça, cluster, até minas AT) e o que você designa, cai.',
    como: 'Equipe o Laserdesignator + os carregadores de artilharia do mod (Arsenal). Aponte o designador no alvo e dispare a munição escolhida — HE, guiada por laser, iluminação, fumaça… cada "carregador" traz 800 disparos do tipo.',
    atalhos: [['B', 'sacar o designador (slot de binóculo)'], ['botão de disparo da arma', 'chamar o fogo no ponto designado']],
    dicas: ['O clássico "sempre carreguei o designador e nunca usei" morre aqui (piada do próprio autor).', 'Munição guiada a laser + alvo em movimento = acompanhe o alvo com o feixe até o impacto.']
  },

  /* ===================== 🔫 ARMAS & ACESSÓRIOS ===================== */
  497660133: {
    cat: 'armas', nome: 'CUP Weapons',
    oQue: 'Community Upgrade Project — TODO o armamento do Arma 2/OA portado: centenas de armas clássicas (AK, M16, M240, RPG…), com óticas e acessórios.',
    como: 'Tudo entra no Arsenal (categoria por arma). É conteúdo — sem teclas próprias; recargas e acessórios seguem o padrão do jogo/ACE.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Use o Arsenal Search: "CUP" lista tudo do pack.']
  },
  2268351256: {
    cat: 'armas', nome: 'Tier One Weapons',
    oQue: 'Armamento do US SOCOM por Fingolfin: SIG MCX Virtus (5.56 e .300 Blackout), SR16 (canos 11.5/14.5"), HK416 (10.4/14.5", rails Geissele/Remington/Midwest), Mk46 e Mk48 — em várias cores e configurações.',
    como: 'Conteúdo de Arsenal. Construído sobre o framework do RHS (RHSUSAF é dependência) e compatível com ACE.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Requer RHSUSAF ativo (já está no preset).', 'O .300 Blackout do MCX é o rei do supressor — subsônico de verdade.']
  },
  2811886291: {
    cat: 'armas', nome: 'SPS Weapons V2',
    oQue: 'Pacote de armas SPS com acessórios de ponta: inclui lasers/iluminadores reais — Steiner DBAL-A4, B.E. Meyers MAWL-DA, Wilcox RAID-Xe e lanterna Surefire M300C (com modos IR).',
    como: 'Conteúdo de Arsenal (requer CBA + ACE + Arsenal Extended, todos no preset). Os lasers usam a implementação de laser visível atual do jogo/ACE.',
    atalhos: [['L', 'ligar acessório'], ['Ctrl + L (ACE)', 'alternar modos (visível/IR/lanterna)']],
    dicas: ['O MAWL-DA + BettIR = iluminação IR de verdade no NVG.', 'Confira os calibres: alguns usam munição própria do pack.']
  },
  699630614: {
    cat: 'armas', nome: 'Specialist Military Arms (SMA) 2.7.1',
    oQue: 'Um dos packs de armas mais clássicos do Arma 3: HK416, SCAR, ACR e companhia, com sistema próprio de skins e acessórios.',
    como: 'Conteúdo de Arsenal; acessórios SMA em armas SMA.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['As texturas/camos alternativos aparecem como variantes (o Arsenal Extended agrupa).']
  },
  3100490558: {
    cat: 'armas', nome: 'NGA - Next Generation Armory',
    oQue: 'Os VENCEDORES do programa NGSW do Exército dos EUA: XM7 Spear 6.8 mm (fuzil), XM7 Raptor (cano curto) e a família da nova geração.',
    como: 'Conteúdo de Arsenal (requer CBA + ACE). Munição própria 6.8 mm — leve os carregadores certos.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Par natural do [FACTION] US Army 2027 deste preset — a facção já vem equipada com eles.']
  },
  3614460136: {
    cat: 'armas', nome: 'Modern Combat Carbines (All-in-One)',
    oQue: 'O tudo-em-um da série MCC: as carabinas do campo de batalha de ~2025, do FN LICC ao M4 URG-I, com acessórios de alta qualidade e modularidade máxima — "o sonho do infante e do gun guy" (palavras do autor).',
    como: 'Conteúdo de Arsenal (requer MCC Core). Em expansão contínua — o pack recebe conteúdo novo com o tempo.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Busque "MCC" no Arsenal Search pra ver a família toda.']
  },
  3564392635: {
    cat: 'armas', nome: 'Modern Sniper Systems (All-in-One)',
    oQue: 'Sistemas de sniper modernos tudo-em-um: rifles de precisão atuais com óticas e supressores dedicados.',
    como: 'Conteúdo de Arsenal; zeroing pelo ACE (PgUp/PgDn).',
    atalhos: [['Page Up / Page Down', 'zeroing (ACE)']],
    dicas: ['Dupla com o 121 Spotting Scope e o Sniper Utilities = kit completo de precisão.']
  },
  3425368881: {
    cat: 'armas', nome: 'M4A1 URGI',
    oQue: 'O M4A1 URG-I (Upper Receiver Group - Improved) do SOCOM, modelado em detalhe (modelo original de LOUETTA).',
    como: 'Conteúdo de Arsenal (procure URGI). Requer CBA + RHSUSAF.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Na imagem oficial o autor usa óticas TOTT — o par natural dele neste preset.']
  },
  3029401059: {
    cat: 'armas', nome: 'JCA - P320',
    oQue: 'A pistola SIG P320/M17-M18 (sidearm padrão atual dos EUA).',
    como: 'Conteúdo de Arsenal (slot de pistola).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Par perfeito com os capacetes IHPS e uniformes US 2027 pra loadout "Exército 2025+".']
  },
  3147482833: {
    cat: 'armas', nome: 'TOTT AiO',
    oQue: 'O all-in-one da família TOTT (Tools of the Trade): reúne Core + Optics + CAG + NSW — as armas do JSOC com fidelidade de referência, sobre o framework RHS.',
    como: 'Conteúdo de Arsenal (requer CBA + RHSUSAF; feito pra jogar com ACE).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Busque "TOTT" no Arsenal Search.', 'Óticas TOTT foram feitas pra estas armas — o encaixe é perfeito.']
  },
  3391372394: {
    cat: 'armas', nome: 'TOTT NSW',
    oQue: 'Extensão TOTT com tema NSW (Naval Special Warfare — SEALs): armas/equipamento do universo naval especial.',
    como: 'Conteúdo de Arsenal (requer TOTT Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Combina com US & UK Gear e GEARSOC pra composição de operador naval.']
  },
  3147476552: {
    cat: 'armas', nome: 'TOTT Optics',
    oQue: 'Óticas JSOC de alta fidelidade: Aimpoint T2 (várias montagens), Romeo 4T, EOTech XPS-3/EXPS-3, Nightforce ATACR 1-8x NSWDG, Vortex 1-6 e 1-10, Leupold CQBSS — as variáveis com PiP (picture-in-picture) real via CBA — e até clip-on térmico VooDoo-S.',
    como: 'Conteúdo de Arsenal — slot de ótica (requer TOTT Core). Nas LPVO com PiP, o zoom alterna dentro da própria ótica.',
    atalhos: [['numpad + / -', 'zoom/magnificação'], ['Ctrl + botão-direito', 'alternar retículo/modo em óticas que têm (padrão)']],
    dicas: ['O clip-on térmico VooDoo-S na frente de uma LPVO = visão térmica sem trocar de ótica.', 'Óticas TOTT em armas TOTT têm o encaixe visual perfeito.']
  },
  3583519360: {
    cat: 'armas', nome: 'MCC - Red Dot Pack',
    oQue: 'Red dots modernos com modelos comprados/licenciados: Aimpoint T2 (+ magnifier), EOTech EXPS (+ magnifier) e Sig Sauer Romeo9T.',
    como: 'Slot de ótica no Arsenal (requer MCC Core). Versões com magnifier alternam a magnificação na tecla de modo da ótica.',
    atalhos: [['Ctrl + botão-direito', 'alternar red dot ↔ magnifier (quando houver)']],
    dicas: ['MCC = "Modern Combat Carbines" (a série de armas do Project M).', 'Versões com riser combinam com capacete + NVG.']
  },
  3596642267: {
    cat: 'armas', nome: 'MCC - Extended Red Dot Pack',
    oQue: 'Variações estendidas dos red dots do pack base em montagens de operador: GBRS Hydra e UnityX (as elevações altas usadas com NVG/passivo).',
    como: 'Slot de ótica no Arsenal. Requer o MCC Red Dot Pack E o MCC Lights & Lasers (dependências oficiais — ambos no preset).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Montagem alta (Hydra/Unity) é feita pra mirar COM o NVG na cara — combina com BettIR.']
  },
  3583521742: {
    cat: 'armas', nome: 'MCC - Lights & Lasers',
    oQue: 'Os lasers/lanternas táticos reais de 2025: BE Meyers SAL-UHP (LA-30), EOTech NGAL e OGL, AN/PEQ-15, AN/PEQ-16B, L3 Squad LRF, Surefire M600V/M300C e Inforce WMLX — cada um com TODOS os modos reais (luz branca, tocha IR, laser IR, laser visível e combos).',
    como: 'Slot lateral no Arsenal (requer MCC Core). Liga com a tecla de acessório; os MODOS alternam pela tecla "Next Laser Function" do CBA (defina no Configure Addons — orientação oficial do autor).',
    atalhos: [['L', 'ligar acessório (padrão)'], ['CBA "Next Laser Function" (Configure Addons)', 'alternar luz branca / IR / laser / combos']],
    dicas: ['Com o BettIR deste preset, os modos IR viram iluminação real no NVG.']
  },
  3575476126: {
    cat: 'armas', nome: 'MCC - LPVO Pack',
    oQue: 'Óticas LPVO (Low Power Variable Optics, 1-6x/1-10x) — a tendência atual de ótica "faz-tudo".',
    como: 'Slot de ótica; alterne a magnificação pela tecla de zoom da ótica.',
    atalhos: [['numpad + / -', 'trocar magnificação'], ['Ctrl + botão-direito', 'modo/retículo (quando houver)']],
    dicas: ['1x pra CQB, 6x pro contato a 400 m — uma ótica só, com o canting do GGE de backup.']
  },
  3596643390: {
    cat: 'armas', nome: 'MCC - Magnified Optics Pack',
    oQue: 'Óticas magnificadas de baixa potência (Elcan, ACOG…): hoje traz o Elcan SPECTR Gen3 — inclusive na versão com red dot Steiner MPS em cima. Pack em expansão.',
    como: 'Slot de ótica no Arsenal (requer MCC Core).',
    atalhos: [['numpad + / -', 'zoom'], ['Ctrl + botão-direito', 'alternar Elcan ↔ red dot MPS (na versão combinada)']],
    dicas: ['Elcan + MPS em cima = alcance E CQB na mesma ótica.']
  },
  3576299123: {
    cat: 'armas', nome: 'MCC - Muzzle Devices',
    oQue: 'Dispositivos de boca: supressores, freios de boca e flash hiders modernos.',
    como: 'Slot de boca no Arsenal; afetam som, chama e recuo.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Supressor não é silenciador de filme — reduz assinatura, não a elimina.']
  },
  3591481785: {
    cat: 'armas', nome: 'MCC - M4A1 Pack',
    oQue: 'M4A1 "upgradeados": handguards, stocks, grips e ferros novos dando vida ao clássico — perfeitos pra PMC, milícia ocidental ou "forças especiais de orçamento" (descrição do autor). Configurações SMR (Geissele 9/11.5/14.5", basicamente um URGI) e Aero, tudo em 5.56 E .300 Blackout.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['O SMR 11.5" .300BLK + supressor MCC = arma de PMC perfeita.', 'Compare com o M4A1 URGI standalone — dois sabores do mesmo fuzil.']
  },
  3575470416: {
    cat: 'armas', nome: 'MCC - Knights KS-1-2-3-4 Pack',
    oQue: 'Os fuzis KS-1/KS-2/KS-3/KS-4 da Knight\'s Armament — linha atual da KAC.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['O KS-1 é o fuzil dos contratos SOF recentes — loadout "2025" autêntico.']
  },
  3591474457: {
    cat: 'armas', nome: 'MCC - FN LICC-IWS',
    oQue: 'O FN IWS (Individual Weapon System) de contrato governamental: carabina IPC no calibre .264 LICC (6.5×43 mm) com carregador polímero de 25 — a aposta da FN pra próxima geração.',
    como: 'Conteúdo de Arsenal (requer MCC Core). Calibre próprio — leve os carregadores .264 LICC.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Compare com o XM7 6.8 mm do NGA: dois futuros concorrentes no mesmo preset.']
  },
  3611446339: {
    cat: 'armas', nome: 'MCC - Barrett Rec7DI',
    oQue: 'O Barrett REC7 DI: AR leve e modular em gás direto (aceno ao design original de Eugene Stoner), com sistema de gás mid-length pensado pra rodar liso COM ou SEM supressor.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Feito pra supressor: casa com os Muzzle Devices do próprio MCC.']
  },
  3620610160: {
    cat: 'armas', nome: 'MCC - Sig SpearLT & RattlerLT Pack',
    oQue: 'SIG MCX Spear-LT e Rattler-LT — a evolução direta do MCX Virtus, a plataforma que a SIG lapidou com testes e feedback de operadores até virar referência.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Rattler-LT + supressor MCC = arma de CQB/PSD perfeita.', 'O Virtus "original" está no Tier One Weapons — dá pra comparar as gerações.']
  },
  3618796804: {
    cat: 'armas', nome: 'MCC - LMT MARS-L and SPECWAR Pack',
    oQue: 'A família LMT MARS-L com o upper SPECWAR: desenvolvido em parceria com operadores, cano MRP de 12.5"+ e rail monolítico patenteado da LMT — mais espaço de acessório e ergonomia que o CQB clássico.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Fecha a coleção MCC: com os packs deste preset você monta praticamente qualquer fuzil ocidental atual.']
  },

  /* ===================== 🎖️ FACÇÕES & CONTEÚDO ===================== */
  843577117: {
    cat: 'faccoes', nome: 'RHSUSAF',
    oQue: 'Red Hammer Studios — Forças Armadas dos EUA: Exército e USMC completos (M1A2, Bradley, Black Hawk, Apache, M4, uniformes) com fidelidade de referência.',
    como: 'Facções no editor/Zeus (BLUFOR → RHS); armas/equipamento no Arsenal. Veículos RHS têm sistemas próprios (estabilização, FCS) — teclas padrão do jogo.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal'], ['Ctrl + T (em blindado RHS)', 'trava/laser do FCS (padrão de veículo)']],
    dicas: ['RHS é o padrão-ouro de milsim US — a maioria dos cenários sérios assume ele.']
  },
  843425103: {
    cat: 'faccoes', nome: 'RHSAFRF',
    oQue: 'RHS — Forças Armadas da Federação Russa: T-90, BMP, BTR, Mi-8, Ka-52, AK-74M e o inventário russo completo.',
    como: 'Facções no editor/Zeus (OPFOR → RHS); conteúdo no Arsenal.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['O par natural do RHSUSAF pra cenários convencionais EUA×Rússia.']
  },
  843632231: {
    cat: 'faccoes', nome: 'RHSSAF',
    oQue: 'RHS — Forças Armadas da Sérvia: infantaria, blindados e equipamento sérvio.',
    como: 'Facções no editor/Zeus (Independent/OPFOR conforme configuração).',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['Ótimo pra cenários balcânicos com os mapas CUP.']
  },
  843593391: {
    cat: 'faccoes', nome: 'RHSGREF',
    oQue: 'RHS GREF — facções "verdes": milícias, guerrilhas e exércitos menores (ChDKZ, NAPA…) com equipamento misto leste/oeste.',
    como: 'Facções no editor/Zeus (Independent); conteúdo no Arsenal.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['A cereja pra insurgências: inimigo irregular crível pro Antistasi.']
  },
  497661914: {
    cat: 'faccoes', nome: 'CUP Units',
    oQue: 'As facções e unidades do Arma 2 portadas: USMC, exército russo, takistani, guerrilhas — os personagens clássicos.',
    como: 'Facções no editor/Zeus; uniformes/equipamento no Arsenal.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['Requer CUP Weapons; com CUP Vehicles fecha a trilogia.']
  },
  541888371: {
    cat: 'faccoes', nome: 'CUP Vehicles',
    oQue: 'Todos os veículos do Arma 2: HMMWV, UAZ, T-72, A-10, C-130, barcos — a frota clássica inteira.',
    como: 'Veículos no editor/Zeus e nas facções CUP. Operação padrão do jogo.',
    atalhos: [['—', 'veículos no editor/Zeus']],
    dicas: ['O C-130 e o A-10 clássicos moram aqui.']
  },
  1200127537: {
    cat: 'faccoes', nome: 'BWMod',
    oQue: 'Bundeswehr (Alemanha): G36, Puma, Leopard 2, Fuchs, uniformes flecktarn — as forças alemãs em alta qualidade.',
    como: 'Facções no editor/Zeus (BLUFOR → BW); conteúdo no Arsenal.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['O Leopard 2 do BWMod é um dos melhores blindados de mod do jogo.']
  },
  579942493: {
    cat: 'faccoes', nome: 'US Military Mod',
    oQue: 'Forças militares dos EUA em pacote independente: unidades, equipamento e veículos US adicionais.',
    como: 'Facções no editor/Zeus; conteúdo no Arsenal.',
    atalhos: [['—', 'facções no editor/Zeus; conteúdo no Arsenal']],
    dicas: ['Sobrepõe um pouco com RHSUSAF — compare e escolha o sabor por cenário.']
  },
  3132553286: {
    cat: 'faccoes', nome: '[FACTION] US Army 2027',
    oQue: 'O Exército dos EUA de 2027: facção com o kit da próxima geração (NGSW, IVAS, IHPS) já composta.',
    como: 'Facção no editor/Zeus (BLUFOR); unidades já equipadas com o material moderno dos packs.',
    atalhos: [['—', 'facção no editor/Zeus']],
    dicas: ['Com NGA + IVAS + IHPS deste preset, é o cenário "futuro próximo" completo.']
  },
  3020755032: {
    cat: 'faccoes', nome: 'Antistasi Ultimate',
    oQue: 'O modo de jogo: campanha dinâmica de guerrilha (libertar o mapa cidade a cidade), no fork mais ambicioso da família — 25+ mods de facção suportados, 50+ mapas, condições de vitória/derrota opcionais e QOL em cima do Antistasi Plus do Socrates.',
    como: 'Crie a partida pelo menu multiplayer (host local ou servidor) escolhendo o cenário Antistasi Ultimate no mapa desejado. Dentro do jogo, o menu do Antistasi (tecla própria) controla recrutamento, garagem, dinheiro, HQ e persistência — o sistema de save foi reimplementado (funciona até em servidor Linux).',
    atalhos: [['Y', 'menu do jogador Antistasi (padrão; pode conflitar com Zeus — remapeie um)'], ['mapa → HQ', 'ações da base: recrutar, arsenal, salvar']],
    dicas: ['Comece limpando outposts pequenos — atacar cidade grande cedo é suicídio.', 'O arsenal da guerrilha só mantém o que você SAQUEIA: cada fuzil inimigo vale ouro.', 'Com RHS/CUP deste preset o inimigo usa o conteúdo dos mods — e o justBuild/KzyxTools daqui têm integração oficial.']
  },

  /* ===================== 🎽 UNIFORMES & EQUIPAMENTO ===================== */
  2044374502: {
    cat: 'equipamento', nome: 'USP Gear - Core',
    oQue: 'Undersiege Patches Gear — a linha de equipamento tático de altíssima fidelidade: base da família USP.',
    como: 'Conteúdo de Arsenal (uniformes, coletes, mochilas); variantes agrupadas pelo Arsenal Extended.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Procure "USP" no Arsenal Search pra família toda.']
  },
  2588603554: {
    cat: 'equipamento', nome: 'USP Gear - IHPS',
    oQue: 'O capacete IHPS (Integrated Head Protection System) real do Exército dos EUA, na qualidade USP.',
    como: 'Slot de capacete no Arsenal; variantes de cor/acessório via Arsenal Extended.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Par com o IVAS: o kit de cabeça do soldado US atual.']
  },
  3702954719: {
    cat: 'equipamento', nome: 'IHPS Helmet 2035',
    oQue: 'O capacete IHPS reimaginado DENTRO do lore 2035 do Arma 3: com lore próprio escrito (a Invasão do Takistão, a "Recessão Negra" dos anos 2020, a chegada lenta do IHPS junto do fuzil MX 6.5 mm) — feito pra casar com a NATO vanilla.',
    como: 'Slot de capacete no Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Use este com as facções vanilla NATO (MX 6.5 mm); o USP IHPS com RHS/US Army 2027.']
  },
  2127190744: {
    cat: 'equipamento', nome: 'Moe Pilot Gear Suite',
    oQue: 'Equipamento de piloto: capacetes de voo com visor/HMD, macacões e coletes de aviador.',
    como: 'Conteúdo de Arsenal (slots de capacete/uniforme/colete).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Voando o FVL ou o Osprey deste preset, complete o personagem com isto.']
  },
  2871002081: {
    cat: 'equipamento', nome: "Simpel's MilGP Retextures",
    oQue: 'Retexturas do Military Gear Pack (MilGP) — camuflagens adicionais pro equipamento MilGP.',
    como: 'As variantes aparecem no Arsenal junto do equipamento base. ATENÇÃO: retextura precisa do mod base MilGP (não incluso neste preset) — confira a dependência na página do Workshop.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Se as texturas não aparecerem, é a dependência MilGP faltando — assine na página do Workshop.']
  },
  3087700723: {
    cat: 'equipamento', nome: 'AEW | Operator Helmet Expansion',
    oQue: 'Expansão de capacetes "operator": high-cuts, acessórios e variações de equipamento de cabeça SOF.',
    como: 'Slot de capacete no Arsenal; muitas variantes (fones, NVG mount, strobes).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['High-cut + fone + NVG = a silhueta operator clássica.']
  },
  3694150202: {
    cat: 'equipamento', nome: '[TRF] Blackthorn Operators Equipment - REDUX',
    oQue: 'Equipamento da unidade Blackthorn (REDUX — a versão limpa e refeita do pack antigo): uniformes e gear SOF de alta qualidade, com insígnias da unidade.',
    como: 'Conteúdo de Arsenal (requer CBA + ACE). O capacete Caiman tem INTERAÇÕES ACE próprias: levantar os abafadores (earpro) e o visor LH250 pelo menu de auto-interação.',
    atalhos: [['Ctrl + ⊞ Win (com o Caiman)', 'levantar/baixar abafadores e visor do capacete']],
    dicas: ['É pack de unidade (btrg.co.uk) — vem com insígnia deles; bom pra estética PMC/unidade fictícia.']
  },
  1299068883: {
    cat: 'equipamento', nome: 'GEARSOC - Deluxe Edition',
    oQue: 'Gear de operações especiais: uniformes crye-style, plate carriers e capacetes com dezenas de camos.',
    como: 'Conteúdo de Arsenal; use o Arsenal Extended pra navegar as variantes.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Uma das maiores coleções de camuflagem do Workshop — perca-se com moderação.']
  },
  3424012664: {
    cat: 'equipamento', nome: 'US & UK Gear',
    oQue: 'Equipamento combinado EUA + Reino Unido: uniformes MTP/Multicam, coletes e capacetes dos dois exércitos.',
    como: 'Conteúdo de Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Monte um destacamento SAS pra variar do tema US.']
  },
  779568775: {
    cat: 'equipamento', nome: 'TAC VESTS',
    oQue: 'Coleção de coletes táticos: plate carriers e chest rigs variados.',
    como: 'Slot de colete no Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Capacidade varia por colete — olhe o espaço de carga, não só o visual.']
  },

  /* ===================== 🚁 AERONAVES & DRONES ===================== */
  1686321576: {
    cat: 'aeronaves', nome: 'Project - Future Vertical Lift',
    oQue: 'Tiltrotor baseado no Bell V-280 Valor (no jogo, UV-85 "Omaha") — o substituto do Black Hawk, em CINCO variantes: básica (sem armas), com miniguns, com Gatling .50, MV-85 Spec Ops (2× minigun + canhão 20 mm + 14 foguetes + 2 mísseis Griffin) e AV-85 de ataque (troca os assentos por 8× ATGM).',
    como: 'Aeronaves no editor/Zeus (BLUFOR). Voam como VTOL: decolagem vertical, transição de rotores pra cruzeiro pela tecla de VTOL do jogo.',
    atalhos: [['tecla de transição VTOL (padrão do jogo)', 'alternar rotores helicóptero ↔ cruzeiro'], ['G (padrão)', 'trem de pouso']],
    dicas: ['Aprenda a transição no VR: levantar como heli, transicionar, cruzar rápido, voltar a heli no LZ.', 'Escolha a variante pelo papel: tropa (básica/minigun), escolta (MV-85), caça-tanque (AV-85).']
  },
  2147841185: {
    cat: 'aeronaves', nome: 'Project - FVL ACE3 Compatibility',
    oQue: 'Ponte de compatibilidade FVL ↔ ACE — na prática, habilita o FASTROPING do ACE (descer de corda rápida) nas aeronaves FVL.',
    como: 'Passivo — instale junto do FVL quando jogar com ACE (o caso deste preset). Com ele, o UV-85 pairando ganha a interação de fast rope do ACE.',
    atalhos: [['⊞ Win (no heli pairando)', 'preparar cordas / descer (fast rope do ACE)']],
    dicas: ['Fast rope do ACE + Advanced Rappelling = dois jeitos de descer sem pousar; o fast rope é o mais rápido.']
  },
  3354581482: {
    cat: 'aeronaves', nome: 'CV-22 Osprey',
    oQue: 'O tiltrotor CV-22/MV-22 Osprey completo: rotores que giram, rampa, capacidade de tropa real.',
    como: 'Aeronave no editor/Zeus. Decole na vertical, gire as nacelles pra frente (transição VTOL) e voe como avião; rampa e funções via interação/menu de rolagem.',
    atalhos: [['tecla de transição VTOL (padrão do jogo)', 'girar nacelles heli ↔ avião'], ['menu de rolagem', 'rampa · funções da aeronave']],
    dicas: ['Inserção de 20+ soldados num LZ apertado — a especialidade do Osprey.']
  },
  3390219536: {
    cat: 'aeronaves', nome: 'C-5 Galaxy',
    oQue: 'O Lockheed C-5 Galaxy: capacidade de transporte aéreo ESTRATÉGICO intercontinental da USAF — engole cargas "outsized" (veículos inteiros) que nem o C-17 leva.',
    como: 'Aeronave no editor/Zeus. Carregue veículos pelo sistema de carga (ViV/ACE cargo) pela rampa; pista LONGA obrigatória.',
    atalhos: [['menu de rolagem / ⊞ Win', 'rampa · carga de veículos'], ['G', 'trem de pouso']],
    dicas: ['Planeje o pouso: nem toda pista do Arma segura um C-5.']
  },
  3686190970: {
    cat: 'aeronaves', nome: 'STmod AC-130J',
    oQue: 'Recriação do AC-130J Ghostrider (o gunship que entrou em serviço na USAF em 2017) E do irmão de transporte MC-130J Commando II — canhões laterais orbitando o alvo + inserção especial.',
    como: 'Coloque pelo editor/Zeus (requer ACE); pilote a órbita (ou use piloto IA) e opere as estações de artilharia nas posições de gunner — câmera estilo "olho de Deus" com os canhões laterais.',
    atalhos: [['posições de gunner (entrar no veículo)', 'estações dos canhões'], ['Ctrl + botão-direito', 'trocar modo de câmera/zoom (padrão de gunner)']],
    dicas: ['Órbita à esquerda: os canhões atiram pelo bordo esquerdo — mantenha o alvo nesse lado.', 'O MC-130J cobre o papel de transporte especial (o C-5 daqui é o estratégico).']
  },
  3045129955: {
    cat: 'aeronaves', nome: 'FPV Drone Crocus',
    oQue: 'Drone de ATAQUE FPV (first-person view) até 190 km/h, em duas versões: AT (anticarro) e AP (antipessoal) — o retrato do campo de batalha de 2024+.',
    como: 'Use o terminal UAV (item no slot GPS) pra conectar e pilotar em primeira pessoa; voe até o alvo e detone a carga. Existem mods-irmãos oficiais do autor: IA usando FPV, jammer (Sania) e dano reduzido — links na página do Workshop.',
    atalhos: [['terminal UAV (equipar + usar)', 'conectar/pilotar o drone'], ['W A S D + mouse', 'voo FPV']],
    dicas: ['Pilotar FPV tem curva de aprendizado — treine no VR antes.', 'Contra blindado use a versão AT; infantaria entrincheirada, a AP.']
  },
  3431126976: {
    cat: 'aeronaves', nome: 'Wings of Fury',
    oQue: 'Pacote de AERONAVES NOVAS (frota dos packs FireWill, Luca e TeTeTe3 — incluindo o A-10) com sistemas de armas realistas, física de armamento e animações avançadas integradas.',
    como: 'As aeronaves aparecem no editor/Zeus; armamento e travas seguem o padrão do jogo (F troca arma, T trava alvo, C contramedidas).',
    atalhos: [['F', 'trocar arma'], ['T', 'travar alvo'], ['C', 'contramedidas (padrão)'], ['G', 'trem de pouso']],
    dicas: ['Voo livre no VR/editor primeiro: cada aeronave tem envelope e armamento próprios.']
  },

  /* ===================== 🏗️ CONSTRUÇÃO & CENÁRIO ===================== */
  3336740643: {
    cat: 'construcao', nome: 'Milsim Structures',
    oQue: 'Prédios de base militar "sem glamour" (proposital!) COM INTERIORES navegáveis — feitos originalmente pro mapa Fort Johnson do autor e liberados standalone.',
    como: 'Objetos no Eden/Zeus. As paredes têm SNAP entre si: ligue/desligue o encaixe alternando a Grade de Translação do editor.',
    atalhos: [['grade de translação do Eden', 'ligar/desligar o snap das paredes']],
    dicas: ['Interior de verdade = CQB de verdade dentro da SUA base.', 'No ZEN, salve a base pronta como COMPOSIÇÃO e reutilize em qualquer missão.']
  },
  2914901109: {
    cat: 'construcao', nome: 'Chameleon Trenches',
    oQue: 'Trincheiras "camaleão": objetos de trincheira que adotam automaticamente a TEXTURA DO SOLO onde são postos — zero contraste entre trincheira e terreno.',
    como: 'No editor, categoria "Trench Structures": posicione os objetos e afunde-os parcialmente no chão pra imitar posição cavada. O autor recomenda usar junto do mod Deformer (deformar o terreno de verdade); a atribuição automática de textura pode ser desligada se quiser.',
    atalhos: [['—', 'objetos no Eden/Zeus (categoria Trench Structures)']],
    dicas: ['Linha de trincheira + HATG = defesa que a IA custa a enxergar.', 'Com o Terrain Lib dá pra esculpir o terreno em volta no próprio Zeus.']
  },
  3256534418: {
    cat: 'construcao', nome: 'Trencher - Eden Trench Generation',
    oQue: 'Geração de trincheiras POR MÓDULO no Eden: qualquer profundidade e largura, com reforços opcionais (sacos de areia, dentes-de-dragão, arame farpado) — e a IA NAVEGA e guarnece as trincheiras.',
    como: 'No Eden, coloque os módulos do Trencher no traçado desejado e configure; módulos de área desligam a geração em trechos escolhidos. IMPORTANTE: salve a missão pra ver as modificações em jogo; em MP, servidor E clientes precisam do mod + dependências (Chameleon Trenches e Terrain Lib — ambas no preset).',
    atalhos: [['—', 'módulos dentro do Eden (editor 3D)']],
    dicas: ['Frente de 500 m em 2 minutos — WW1 no Arma sem túnel do carpo.', 'IA guarnecendo trincheira gerada = defesa pronta sem script.']
  },
  1162098941: {
    cat: 'construcao', nome: 'justBuild',
    oQue: 'Construção EM JOGO via menu do ACE: FOB, estação de reparo, barreiras Hesco, sacos de areia, caixa de munição COM Arsenal, bunker, concertina e posições de morteiro/HMG/AA/AT/artilharia — em qualquer missão.',
    como: 'Usa o menu de interação do ACE pra colocar os objetos (requer o ACE ativo — está no preset). Tem integração oficial com o ANTISTASI: o que você constrói entra no save persistente. Alguns objetos pedem RHSUSAF/RHSAFRF (ambos no preset).',
    atalhos: [['⊞ Win / Ctrl + ⊞ Win', 'menu de construção via interação ACE']],
    dicas: ['No seu Antistasi Ultimate: fortificar cidade tomada e SALVAR junto da campanha.', 'A caixa com Arsenal construível é um respawn de equipamento portátil.']
  },

  /* ===================== ⚙️ ADMIN, CHEATS & PERFORMANCE ===================== */
  410206202: {
    cat: 'admin', nome: 'Simple Single Player Cheat Menu',
    oQue: 'Menu de cheats pra SINGLE player: god mode, teleporte, spawnar unidades/veículos, curar, tempo — a caixa de ferramentas de testes.',
    como: 'Em partida single player, abra pela ação no menu de rolagem ("Open Cheat Menu") e navegue as categorias. É também um ótimo jeito de TESTAR os outros mods rapidamente.',
    atalhos: [['menu de rolagem', 'ação "Cheat Menu" em single player']],
    dicas: ['Use pra testar o preset: spawn de inimigo + god mode = laboratório de mods.', 'Só funciona em SP — pra MP existe o KzyxTools abaixo.']
  },
  3674879316: {
    cat: 'admin', nome: 'KzyxTools - Cheat Menu & Admin Tool',
    oQue: 'Kit completo de admin/desenvolvimento numa UI só (MP compatível): spawn de unidades/veículos com editor de loadout, visualização de balística e rastreio de projéteis em tempo real, módulos Zeus na hora, edição de texturas/hitpoints de veículo, god mode, teleporte e NoClip.',
    como: 'TUDO sai de uma tecla só (defina no Configure Addons). Compatível com qualquer mod/missão — inclusive suporte nativo ao Antistasi (revive integrado).',
    atalhos: [['configurável (Configure Addons → KzyxTools)', 'abrir o menu (uma tecla pra tudo)']],
    dicas: ['O rastreio de projéteis é uma AULA de balística: veja a bala caindo no ar.', 'USE COM RESPONSABILIDADE em servidor: é ferramenta de admin, não de trapaça com os amigos.']
  },
  2565965887: {
    cat: 'admin', nome: 'Arma 3 Performance Extension',
    oQue: 'Extensão nativa de performance com a filosofia declarada do autor: "não posso mudar COMO o Arma calcula certas coisas, mas posso mudar QUEM calcula" — descarrega cálculos do engine e ganha FPS, principalmente com muita IA (a página traz tabela de benchmark).',
    como: 'Passivo após instalado (requer CBA) — a extensão precisa ser permitida no jogo no primeiro uso.',
    atalhos: [['—', 'passivo']],
    dicas: ['Com 105 mods carregados, todo FPS conta — deixe sempre ativo.', 'Se o jogo pedir confirmação de extensão no boot, aceite (é este mod).']
  }
};

/* ===== novos na atualização 0.7.8 do preset (dados oficiais do Workshop) ===== */
Object.assign(A3TUT_MODS, {
  2162811561: {
    cat: 'fundacao', nome: 'FileXT',
    oQue: 'Extensão que deixa o SQF LER E GRAVAR ARQUIVOS no disco — é a memória permanente que o Arma não tem. No seu preset, é a dependência que dá PERSISTÊNCIA ao Vindicta (salvar a campanha entre sessões).',
    como: 'Passivo — carrega como mod e expõe as funções de arquivo pros scripts. O guia de setup oficial é do próprio time do Vindicta (vindicta-team.github.io); em servidor dedicado a extensão precisa ser permitida.',
    atalhos: [['—', 'passivo; usado pelos mods que salvam em arquivo']],
    dicas: ['Sem ele o Vindicta não salva — instale sempre junto.', 'Suporta Linux desde 2022 (serve pra servidor dedicado Linux).']
  },
  2523439183: {
    cat: 'imersao', nome: 'Armor Plates System (APS)',
    oQue: 'Sistema médico ALTERNATIVO standalone: placas cerâmicas no colete viram HP extra (inspiração declarada no médico do COD Warzone) — leve, cheio de opções, com revive próprio (quando o ACE medical não está carregado) e suporte aos recursos do ACE.',
    como: 'Coloque as placas no colete (com o EBI deste preset, ARRASTE a placa direto pro slot dedicado — a integração é o recurso-manchete do EBI e dispensa keybind). Dano consome primeiro as placas; barra de HP da placa visível na UI. Configurações no CBA pra encaixar no seu estilo.',
    atalhos: [['arrastar placa → slot (no EBI)', 'instalar placa com animação e regras do APS'], ['Addon Options → APS', 'ajustar HP, revive e comportamento']],
    dicas: ['⚠ Decisão de preset: APS carregado JUNTO do ACE medical muda a dinâmica — leia as opções e escolha qual sistema manda no dano.', 'Com EBI + APS + BackpackOnChest, o trio do inventário Tarkov-style deste preset fica completo.']
  },
  2372036642: {
    cat: 'equipamento', nome: 'BackpackOnChest - Redux',
    oQue: 'Mochila no PEITO e nas costas AO MESMO TEMPO (com penalidade de movimento) — a reescrita oficial do clássico de DerZade. O caso de uso número 1: PARAQUEDAS nas costas, mochila no peito.',
    como: 'Via interação/auto-interação do ACE: mova a mochila pro peito e equipe outra (ou o paraquedas) nas costas. Preserva as variáveis da mochila (rádio TFAR e ACE Gunbag continuam funcionando no peito). Requer CBA + ACE.',
    atalhos: [['Ctrl + ⊞ Win → equipamento', 'mover mochila pro peito / devolver às costas']],
    dicas: ['Salto HALO completo: paraquedas atrás, mochila de missão na frente.', 'O EBI tem botão dedicado pra este mod na tela de inventário (compat oficial).']
  },
  2185874952: {
    cat: 'faccoes', nome: 'Vindicta (Alpha)',
    oQue: 'Campanha dinâmica de GUERRILHA cooperativa: liberte o território da ocupação começando só com pistolas. Mundo vivo com PERSISTÊNCIA TOTAL (cada unidade de cada guarnição é salva — via FileXT) e um comandante IA que REAGE: QRFs, patrulhas, postos ocupados e bloqueios de estrada conforme a sua atividade cresce.',
    como: 'Crie a partida pelo MP (host/servidor) escolhendo o cenário Vindicta no mapa. Começo furtivo: o mundo nasce calmo, você viaja livre; cada ação sua sobe a temperatura da região e o comandante inimigo responde. Capture armas, recrute e construa o movimento. Requer CBA + ACE + FileXT (todos no preset). É ALPHA — o time pede feedback pelo Discord deles.',
    atalhos: [['menu próprio do Vindicta (em jogo)', 'ações de guerrilha: recrutar, construir, planejar']],
    dicas: ['A alternativa ao Antistasi Ultimate no MESMO preset: Vindicta aposta na simulação profunda (comandante IA + persistência por unidade); o Antistasi na variedade de facções/mapas. Jogue os dois.', 'Furtividade importa DE VERDADE: no começo, tiro dado é QRF na sua cabeça.']
  }
});

/* Sanidade: total esperado de tutoriais */
export const A3TUT_TOTAL = Object.keys(A3TUT_MODS).length;

/* ===== Destaque: o mod das 2 ARMAS PRINCIPAIS (pedido do operador) =====
 * Ele NÃO está no preset atual — o Better Inventory daqui declara
 * compatibilidade nativa com ele; fica o caminho honesto pra adicionar. */
export const A3TUT_DUAL_ARMS = {
  nome: 'Dual Arms - Two Primary Weapons',
  url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1334412770',
  oQue: 'O mod que permite carregar DUAS ARMAS PRINCIPAIS: a segunda vai no slot do lançador (classificada como lançador) e você TROCA entre elas de forma fluida. Suporta 5.700+ armas da comunidade e 2.600+ acessórios.',
  como: 'Assine no Workshop e ative no Launcher junto do preset. A troca é por botões no inventário ou por atalho: as addactions vêm DESLIGADAS por padrão — vá em Options → Controls → Custom controls e binde a "Use Action 16" pra trocar de arma por tecla.',
  atalhos: [['Use Action 16 (bindar em Custom Controls)', 'trocar entre as duas primárias'], ['botões no inventário', 'guardar/trocar a segunda arma']],
  dicas: ['NÃO está no preset atual — é adição à parte (o Better Inventory daqui já tem compatibilidade nativa com ele).', 'O slot de lançador fica ocupado: escolha entre AT ou segunda primária — realismo cobra.'],
  nota: 'Fora do preset — compatível com o Better Inventory desta lista'
};
