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
    oQue: 'Extensão do Arsenal do ACE que agrupa variantes de equipamento (cores/versões do mesmo item) num painel só.',
    como: 'Dentro do Arsenal ACE, itens com variantes ganham um seletor extra — em vez de 30 entradas "capacete verde/tan/preto" espalhadas, você escolhe o item e depois a variante. Sem tecla própria: é UI dentro do Arsenal.',
    atalhos: [['— ', 'sem teclas; funciona dentro do Arsenal ACE']],
    dicas: ['Combina com os packs de equipamento (USP, GEARSOC, TAC VESTS…): a lista fica MUITO mais limpa.']
  },
  1376867375: {
    cat: 'fundacao', nome: 'ACE Interaction Menu Expansion',
    oQue: 'Mais entradas no menu de interação do ACE: sentar em cadeiras, dobrar/guardar mapa, gestos e utilidades que o ACE base não traz.',
    como: 'As ações novas aparecem automaticamente no menu radial (⊞ Win / Ctrl+⊞ Win) quando fazem sentido — olhe uma cadeira e "sentar" estará lá.',
    atalhos: [['⊞ Win / Ctrl + ⊞ Win', 'as ações novas entram no menu radial do ACE']],
    dicas: ['Ótimo pra screenshots e roleplay de base: sentar, apoiar arma, gestos.']
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
    oQue: 'Biblioteca de objetos/estruturas usada como dependência por terrenos e mods de cenário.',
    como: 'Passivo — não tem menu nem tecla. Instala e esquece; outros mods puxam os assets dela.',
    atalhos: [['—', 'sem interação direta']],
    dicas: ['Se um mapa reclamar de "missing addon", confira se ela está ativa.']
  },
  3147473073: {
    cat: 'fundacao', nome: 'TOTT Core',
    oQue: 'Núcleo da família TOTT (Tools of the Trade): funções e recursos compartilhados pelos packs TOTT AiO, NSW e Optics deste preset.',
    como: 'Passivo. Precisa estar ativo pros outros TOTT funcionarem.',
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
    oQue: 'Núcleo da série MCC de ARMAS e ACESSÓRIOS deste preset (Red Dot, LPVO, M4A1, Knights…). Atenção: não é o "MCC Sandbox" de missões — aqui MCC é uma linha de armamento moderno.',
    como: 'Passivo: carrega os sistemas/texturas que os packs MCC usam. As armas e óticas aparecem no Arsenal com prefixo MCC.',
    atalhos: [['—', 'sem interação direta']],
    dicas: ['Instale sempre junto de qualquer pack "MCC -" da lista — todos dependem deste Core.']
  },
  3328314886: {
    cat: 'fundacao', nome: 'Heavy Weapons Framework',
    oQue: 'Framework pra armas pesadas desmontáveis: carregar metralhadora/morteiro em partes na mochila e montar em campo.',
    como: 'As partes viram itens de mochila. Monte/desmonte pela ação de interação (ACE ou menu de rolagem) perto das partes no chão; a arma montada opera como estática normal.',
    atalhos: [['⊞ Win / menu de rolagem', 'montar · desmontar · pegar partes']],
    dicas: ['Divida as partes entre dois soldados — tripé com um, tubo com outro.']
  },

  /* ===================== 🏃 MOVIMENTO & IMERSÃO ===================== */
  2664678033: {
    cat: 'imersao', nome: 'CE: Movement',
    oQue: 'Movimento estendido: escalar muros e obstáculos mais altos do que o passo vanilla permite.',
    como: 'Chegue de frente no obstáculo e use a tecla de escalada — a animação leva você por cima de muros/caixas que o V padrão não vence.',
    atalhos: [['configurável (Configure Addons → CE Movement)', 'escalar/vault — defina uma tecla sua (ex.: V longa)']],
    dicas: ['Nem toda parede é escalável — altura máxima existe.', 'Com mochila muito pesada a escalada pode ser negada (combina com o Simple Weight Limit).']
  },
  3351398245: {
    cat: 'imersao', nome: 'Animated Corner Shooting',
    oQue: 'Atirar de quina com animação real: o personagem projeta a arma pro lado da esquina expondo o mínimo do corpo.',
    como: 'Encoste na quina e ative pela tecla do mod — entra na postura de corner shooting; atire e saia com a mesma tecla.',
    atalhos: [['configurável (Configure Addons)', 'entrar/sair da postura de quina']],
    dicas: ['Brutal em CQB urbano; treine no VR antes de usar em missão.']
  },
  3687909045: {
    cat: 'imersao', nome: 'Showdown Posture',
    oQue: 'Posturas adicionais de arma (posições de prontidão/abaixada mais naturais).',
    como: 'Alterna posturas pela tecla do mod; as posturas afetam velocidade e silhueta.',
    atalhos: [['configurável (Configure Addons)', 'alternar postura']],
    dicas: ['Postura baixa + caminhar = patrulha com cara de milsim.']
  },
  3761394375: {
    cat: 'imersao', nome: 'Realistic Vegetation Interaction',
    oQue: 'A vegetação reage a você: galhos e arbustos se afastam/balançam quando o soldado passa.',
    como: '100% passivo — atravesse o mato e veja. Também denuncia: mato mexendo entrega movimento.',
    atalhos: [['—', 'passivo']],
    dicas: ['Lembre que o inimigo (humano) também VÊ o arbusto mexendo…']
  },
  3346427969: {
    cat: 'imersao', nome: 'Hide Among The Grass (HATG)',
    oQue: 'Conserta a injustiça clássica do Arma: a IA te enxergava por cima da grama que o seu monitor renderiza. Deitado na vegetação, você fica de fato mais difícil de ver.',
    como: 'Passivo — deite na grama/mato e a detecção da IA cai de acordo com a cobertura real.',
    atalhos: [['—', 'passivo']],
    dicas: ['Combina perfeitamente com Dynamic Camo System e ghillie: sniper de verdade.']
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
    oQue: 'Remove a fadiga/stamina do jogo — corre pra sempre, sem arma balançando de cansaço.',
    como: 'Passivo, zero configuração. Instalou, nunca mais cansou.',
    atalhos: [['—', 'passivo']],
    dicas: ['Convive bem com o Simple Weight Limit: você não CANSA, mas também não vira mula de carga infinita.']
  },
  3044998814: {
    cat: 'imersao', nome: 'Simple Weight Limit',
    oQue: 'Limite de peso simples: acima do teto, você não consegue simplesmente sair andando com o inventário lotado.',
    como: 'Passivo — o peso total do equipamento é vigiado e o excesso bloqueia/penaliza o movimento.',
    atalhos: [['—', 'passivo']],
    dicas: ['Olhe a barra de peso no canto do inventário antes de sair do Arsenal.']
  },
  2010226699: {
    cat: 'imersao', nome: 'GGE: Weapon Canting',
    oQue: 'Inclinar a arma (cant) — o clássico "deitar o fuzil" pra mirar por cima de cobertura baixa ou usar red dot offset.',
    como: 'Segure/pressione a tecla do mod pra inclinar a arma nos ângulos configurados; a balística respeita a inclinação.',
    atalhos: [['configurável (Configure Addons → GGE)', 'inclinar arma esquerda/direita']],
    dicas: ['Com LPVO das MCC + red dot em 45°, o canting vira mira secundária real de CQB.']
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
    oQue: 'Animações novas de morte e de reação a acertos — fim do "manequim que desliga".',
    como: 'Passivo — IA e jogadores tropeçam, cambaleiam e caem de formas variadas conforme onde levaram o tiro.',
    atalhos: [['—', 'passivo']],
    dicas: ['Muda completamente a leitura de "acertei ou não" a média distância.']
  },
  3444518126: {
    cat: 'imersao', nome: 'Immersive Voices PLUS',
    oQue: 'Vozes imersivas: gritos de dor, esforço e reações vocais mais humanas no combate.',
    como: 'Passivo — substitui/adiciona as vozes automaticamente.',
    atalhos: [['—', 'passivo']],
    dicas: ['Com o sistema médico do ACE, ferido gritando = pressão real no medic.']
  },

  /* ===================== 🖥️ INTERFACE & HUD ===================== */
  2791403093: {
    cat: 'interface', nome: 'Better Inventory',
    oQue: 'Reforma da tela de inventário: layout mais denso e legível, sem mudar as regras do jogo.',
    como: 'Passivo — abra o inventário (I) e a UI nova já está lá.',
    atalhos: [['I', 'inventário (padrão do jogo)']],
    dicas: ['Este preset também tem o EVEN Better Inventory — ver o card dele.']
  },
  3739421199: {
    cat: 'interface', nome: 'EVEN Better Inventory (EBI)',
    oQue: 'A evolução do Better Inventory pelo mesmo caminho: ainda mais informação e organização na mesma tela.',
    como: 'Passivo — refina a tela de inventário (agrupamentos, contadores, leitura rápida).',
    atalhos: [['I', 'inventário (padrão do jogo)']],
    dicas: ['Melhora principalmente saque rápido de corpos/caixas em MP.']
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
    oQue: 'Luneta de observação (spotting scope) implantável — o item do observador da dupla de sniper.',
    como: 'Carregue como equipamento, implante pela ação de montar (como arma estática) e use F pra entrar na luneta; grande zoom pra observar e corrigir tiros.',
    atalhos: [['menu de rolagem / ⊞ Win', 'montar · desmontar a luneta'], ['numpad +/-', 'zoom (padrão de óticas)']],
    dicas: ['Dupla clássica: um no Modern Sniper Systems, outro nesta luneta ditando correções.']
  },
  3550382310: {
    cat: 'interface', nome: 'Sniper Utilities',
    oQue: 'Utilidades de atirador de precisão: ferramentas de cálculo e apoio pro tiro longo.',
    como: 'Adiciona itens/ações de sniper (dados de tiro, apoio de cálculo) usáveis pelo inventário e interação. Detalhes finos na página do Workshop.',
    atalhos: [['configurável / interação', 'ferramentas via itens e menu']],
    dicas: ['Use junto do zeroing do ACE (PgUp/PgDn) e do spotting scope.']
  },
  2954489716: {
    cat: 'interface', nome: 'Advanced Unit Positioning',
    oQue: 'Posicionamento fino de unidades da sua esquadra — mandar IA pra posições exatas (andares, janelas, coberturas) além do "mover pra lá" grosseiro.',
    como: 'Com IA sob seu comando, use o menu/tecla do mod pra apontar a posição exata desejada. Consulte a página do Workshop pros detalhes do fluxo.',
    atalhos: [['configurável (Configure Addons)', 'posicionar unidade apontada']],
    dicas: ['Transforma defesa urbana com IA: cada janela com um fuzileiro DE PROPÓSITO.']
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
    oQue: 'IA de artilharia: baterias controladas por IA passam a usar artilharia de forma inteligente (inclusive contra você).',
    como: 'Majoritariamente passivo — configure o comportamento em Addon Options; em missões, baterias IA respondem a contatos.',
    atalhos: [['—', 'passivo; opções em Addon Options']],
    dicas: ['Cuidado: com isto ativo, ficar parado em campo aberto contra IA com morteiros é convite.']
  },
  3671208957: {
    cat: 'apoio', nome: 'WBK Simple Support',
    oQue: 'Menu simples de suportes (artilharia, suprimento, reforço) pra usar em qualquer missão sem montar módulos.',
    como: 'Abra o menu do mod e escolha o suporte; pensado pra ser o caminho mais direto entre "quero apoio" e "apoio caiu".',
    atalhos: [['configurável (Configure Addons → WBK)', 'abrir o menu de suportes']],
    dicas: ['Ótimo pra sessões casuais de editor onde você só quer brincar de comandante.']
  },
  3323604819: {
    cat: 'apoio', nome: 'LAFS - Light AI Fire Support',
    oQue: 'Fogo de apoio leve automático da IA: esquadras IA usam morteiros/metralhadoras de apoio de forma coordenada.',
    como: 'Passivo — a IA aliada/inimiga coordena apoio leve sozinha conforme o combate; ajuste em Addon Options.',
    atalhos: [['—', 'passivo; opções em Addon Options']],
    dicas: ['Combina com SCAI: o campo de batalha inteiro passa a usar fogo indireto.']
  },
  3699105433: {
    cat: 'apoio', nome: 'ADAPTATIVE ARMA SUPPORTS (AAS - Core)',
    oQue: 'Framework adaptativo de suportes: base que padroniza pedidos de apoio pra missões e outros módulos.',
    como: 'Core passivo — os suportes aparecem conforme a missão/módulos configurarem; opções em Addon Options.',
    atalhos: [['—', 'passivo/depende da missão']],
    dicas: ['Se um cenário seu usar AAS, os menus dele assumem o padrão do framework.']
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
    oQue: 'Chamar artilharia OLHANDO pelo binóculo: viu, pediu, caiu.',
    como: 'Com binóculo equipado, olhe pro alvo e use a ação/tecla do mod pra designar o ponto e disparar a chamada de fogo (bateria precisa existir na missão).',
    atalhos: [['B', 'binóculo (padrão do jogo)'], ['configurável', 'chamar fogo no ponto observado']],
    dicas: ['O jeito mais rápido de brincar de observador avançado (FO) sem menus.']
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
    oQue: 'Armamento de forças especiais de alta fidelidade (fuzis modernos, acessórios detalhados, skins).',
    como: 'Conteúdo de Arsenal; os acessórios próprios (miras/lasers do pack) montam pelas teclas normais do Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Qualidade de animação/som acima da média — vale montar um loadout só com ele pra sentir.']
  },
  2811886291: {
    cat: 'armas', nome: 'SPS Weapons V2',
    oQue: 'Pacote variado de armas SPS: fuzis, pistolas e apoio com modelagem própria.',
    como: 'Conteúdo de Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Confira os calibres: alguns usam munição própria do pack.']
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
    oQue: 'Arsenal de nova geração: armamento moderno (linha NGSW e afins) com acessórios atuais.',
    como: 'Conteúdo de Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Par natural do [FACTION] US Army 2027 deste preset.']
  },
  3614460136: {
    cat: 'armas', nome: 'Modern Combat Carbines (All-in-One)',
    oQue: 'Coleção tudo-em-um de carabinas modernas (variantes AR e afins) num pacote só.',
    como: 'Conteúdo de Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Busque "MCC"/"Carbine" no Arsenal Search pra ver a família toda.']
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
    oQue: 'O M4A1 URG-I (Upper Receiver Group - Improved) do SOCOM, modelado em detalhe.',
    como: 'Conteúdo de Arsenal (procure URGI).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Aceita as óticas MCC — montagem moderna autêntica.']
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
    oQue: 'O pacote all-in-one da família TOTT: armas e equipamento da linha Tools of the Trade.',
    como: 'Conteúdo de Arsenal (requer TOTT Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Busque "TOTT" no Arsenal Search.']
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
    oQue: 'Pacote de óticas da família TOTT: miras e lunetas pra montar nas armas.',
    como: 'Conteúdo de Arsenal — slot de ótica (requer TOTT Core).',
    atalhos: [['numpad + / -', 'zoom de ótica (padrão do jogo)'], ['Ctrl + botão-direito', 'alternar retículo/modo em óticas que têm (padrão)']],
    dicas: ['Óticas TOTT em armas TOTT têm o encaixe visual perfeito.']
  },
  3583519360: {
    cat: 'armas', nome: 'MCC - Red Dot Pack',
    oQue: 'Miras red dot modernas da linha MCC (Aimpoint/EOTech-like) em várias montagens.',
    como: 'Slot de ótica no Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Versões com riser combinam com capacete + NVG.']
  },
  3596642267: {
    cat: 'armas', nome: 'MCC - Extended Red Dot Pack',
    oQue: 'Expansão do Red Dot Pack: mais modelos e variações de miras de ponto.',
    como: 'Slot de ótica no Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Instale junto do pack base pra lista completa.']
  },
  3583521742: {
    cat: 'armas', nome: 'MCC - Lights & Lasers',
    oQue: 'Lanternas e lasers táticos modernos (visível/IR) da linha MCC.',
    como: 'Slot lateral no Arsenal; liga/desliga com a tecla de acessório e alterna modos com o ACE.',
    atalhos: [['L', 'ligar acessório (padrão)'], ['Ctrl + L (ACE)', 'alternar lanterna/laser/IR']],
    dicas: ['Com o BettIR deste preset, os modos IR destes lasers viram iluminação real no NVG.']
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
    oQue: 'Óticas magnificadas MCC: lunetas fixas e magnifiers pra red dots.',
    como: 'Slot de ótica no Arsenal.',
    atalhos: [['numpad + / -', 'zoom'], ['Ctrl + botão-direito', 'flip do magnifier (quando houver)']],
    dicas: ['Red dot + magnifier basculante = DMR improvisado.']
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
    oQue: 'Família M4A1 da linha MCC com as configurações modernas.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Compare com o M4A1 URGI — dois sabores do mesmo fuzil.']
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
    oQue: 'O FN LICC/IWS (Individual Weapon System) — o sistema modular da FN.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Curiosidade de armaria moderna: procure as variantes de cano no Arsenal Extended.']
  },
  3611446339: {
    cat: 'armas', nome: 'MCC - Barrett Rec7DI',
    oQue: 'O Barrett REC7 DI — fuzil AR em gás direto da Barrett.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Aceita o ecossistema de óticas/lasers MCC.']
  },
  3620610160: {
    cat: 'armas', nome: 'MCC - Sig SpearLT & RattlerLT Pack',
    oQue: 'SIG MCX Spear-LT e Rattler-LT — as carabinas compactas da SIG usadas por SOF.',
    como: 'Conteúdo de Arsenal (requer MCC Core).',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Rattler-LT + supressor MCC = arma de CQB/PSD perfeita.']
  },
  3618796804: {
    cat: 'armas', nome: 'MCC - LMT MARS-L and SPECWAR Pack',
    oQue: 'Fuzis LMT MARS-L e a linha SPECWAR — os AR da Lewis Machine & Tool (contrato NZ).',
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
    oQue: 'O modo de jogo: campanha dinâmica de guerrilha onde você liberta o mapa cidade por cidade contra um invasor — persistente, cooperativa e infinitamente rejogável.',
    como: 'Crie a partida pelo menu multiplayer (host local ou servidor) escolhendo o cenário Antistasi Ultimate no mapa desejado. Dentro do jogo, o menu do Antistasi (tecla própria) controla recrutamento, garagem, dinheiro, HQ e persistência (salvar campanha).',
    atalhos: [['Y', 'menu do jogador Antistasi (padrão; pode conflitar com Zeus — remapeie um)'], ['mapa → HQ', 'ações da base: recrutar, arsenal, salvar']],
    dicas: ['Comece limpando outposts pequenos — atacar cidade grande cedo é suicídio.', 'O arsenal da guerrilha só mantém o que você SAQUEIA: cada fuzil inimigo vale ouro.', 'Funciona com RHS/CUP deste preset — o inimigo usa o conteúdo dos mods.']
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
    oQue: 'Outra leitura do capacete IHPS, adaptada ao estilo 2035 do Arma 3 vanilla.',
    como: 'Slot de capacete no Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Use este com as facções vanilla NATO; o USP IHPS com RHS/2027.']
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
    oQue: 'Equipamento de operadores Blackthorn (REDUX): uniformes e gear SOF estilizados de alta qualidade.',
    como: 'Conteúdo de Arsenal.',
    atalhos: [['—', 'conteúdo de Arsenal']],
    dicas: ['Estética PMC/unidade fictícia — bom pra cenários originais seus.']
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
    oQue: 'As aeronaves do programa FVL real dos EUA: V-280 Valor e companhia — os substitutos do Black Hawk, voáveis.',
    como: 'Aeronaves no editor/Zeus (BLUFOR). Voam como VTOL: transição entre modo helicóptero e avião pela tecla de VTOL do jogo.',
    atalhos: [['tecla de transição VTOL (padrão do jogo)', 'alternar rotores helicóptero ↔ cruzeiro'], ['G (padrão)', 'trem de pouso']],
    dicas: ['Aprenda a transição no VR: levantar como heli, transicionar, cruzar a 300 kt, voltar a heli no LZ.']
  },
  2147841185: {
    cat: 'aeronaves', nome: 'Project - FVL ACE3 Compatibility',
    oQue: 'Ponte de compatibilidade entre o FVL e o ACE (integra os sistemas médico/carga/interação do ACE nas aeronaves FVL).',
    como: 'Passivo — instale junto do FVL quando jogar com ACE (o caso deste preset).',
    atalhos: [['—', 'passivo']],
    dicas: ['Sem ele, interações ACE dentro do FVL ficam capadas.']
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
    oQue: 'O gigante C-5 Galaxy: transporte estratégico capaz de engolir veículos inteiros.',
    como: 'Aeronave no editor/Zeus. Carregue veículos pelo sistema de carga (ViV/ACE cargo) pela rampa; pista LONGA obrigatória.',
    atalhos: [['menu de rolagem / ⊞ Win', 'rampa · carga de veículos'], ['G', 'trem de pouso']],
    dicas: ['Planeje o pouso: nem toda pista do Arma segura um C-5.']
  },
  3686190970: {
    cat: 'aeronaves', nome: 'STmod AC-130J',
    oQue: 'O AC-130J Ghostrider: o gunship com canhões laterais (105 mm, 30 mm) orbitando o alvo.',
    como: 'Coloque pelo editor/Zeus; pilote a órbita (ou use piloto IA) e opere as estações de artilharia nas posições de gunner — câmera estilo "olho de Deus" com os canhões laterais.',
    atalhos: [['posições de gunner (entrar no veículo)', 'estações dos canhões'], ['Ctrl + botão-direito', 'trocar modo de câmera/zoom (padrão de gunner)']],
    dicas: ['Órbita à esquerda: os canhões atiram pelo bordo esquerdo — mantenha o alvo nesse lado.']
  },
  3045129955: {
    cat: 'aeronaves', nome: 'FPV Drone Crocus',
    oQue: 'Drone FPV (first-person view) estilo guerra atual: pequeno, rápido e com carga explosiva.',
    como: 'Use o terminal UAV (item no slot GPS) pra conectar e pilotar em primeira pessoa; voe até o alvo e detone a carga.',
    atalhos: [['terminal UAV (equipar + usar)', 'conectar/pilotar o drone'], ['W A S D + mouse', 'voo FPV']],
    dicas: ['Pilotar FPV tem curva de aprendizado — treine no VR antes.', 'Retrato fiel do campo de batalha de 2024+: barato, letal, assustador.']
  },
  3431126976: {
    cat: 'aeronaves', nome: 'Wings of Fury',
    oQue: 'Pacote de melhorias de aviação/combate aéreo da comunidade.',
    como: 'Melhorias aplicadas às aeronaves conforme as opções do mod; detalhes finos na página do Workshop.',
    atalhos: [['—', 'ver página do Workshop pros detalhes']],
    dicas: ['Teste num voo livre no VR/editor pra sentir as mudanças antes de missão.']
  },

  /* ===================== 🏗️ CONSTRUÇÃO & CENÁRIO ===================== */
  3336740643: {
    cat: 'construcao', nome: 'Milsim Structures',
    oQue: 'Estruturas militares pra composição de bases: torres, muralhas HESCO, tendas, contêineres.',
    como: 'Objetos no Eden (editor) e no Zeus — categoria de estruturas; monte FOBs arrastando e alinhando.',
    atalhos: [['—', 'objetos no Eden/Zeus']],
    dicas: ['No ZEN, salve a base pronta como COMPOSIÇÃO e reutilize em qualquer missão.']
  },
  2914901109: {
    cat: 'construcao', nome: 'Chameleon Trenches',
    oQue: 'Trincheiras "camaleão": objetos de trincheira que adotam a textura do terreno onde são postos.',
    como: 'Objetos no Eden/Zeus; ao posicionar, a trincheira assume a cor/textura do solo local — sem remendo visual.',
    atalhos: [['—', 'objetos no Eden/Zeus']],
    dicas: ['Linha de trincheira + HATG = defesa que a IA custa a enxergar.']
  },
  3256534418: {
    cat: 'construcao', nome: 'Trencher - Eden Trench Generation',
    oQue: 'Gerador de trincheiras no Eden: desenhe a linha e ele gera o trincheiramento inteiro.',
    como: 'Ferramenta do EDITOR (Eden): use o módulo/ferramenta Trencher pra traçar o caminho da trincheira e gerar os segmentos automaticamente.',
    atalhos: [['—', 'ferramenta dentro do Eden (editor 3D)']],
    dicas: ['Frente de 500 m de trincheiras em 2 minutos — WW1 no Arma sem carpal túnel.']
  },
  1162098941: {
    cat: 'construcao', nome: 'justBuild',
    oQue: 'Construção EM JOGO: menu de construção livre pra erguer estruturas durante a partida (estilo fortificação).',
    como: 'Abra o menu de construção do mod, escolha a peça, posicione com o preview fantasma e confirme; peças encaixam umas nas outras.',
    atalhos: [['configurável (Configure Addons → justBuild)', 'abrir o menu de construção'], ['mouse + roda', 'girar/ajustar a peça no preview']],
    dicas: ['Fortificar objetivo tomado no meio da partida muda o metagame da defesa.']
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
    oQue: 'Menu de administração/desenvolvimento compatível com MULTIPLAYER: ferramentas de admin, spawn, teleporte e debug pra quem roda o servidor.',
    como: 'Abra pelo atalho do mod (precisa de permissão de admin no MP); menus de jogador, mundo e debug.',
    atalhos: [['configurável (Configure Addons → KzyxTools)', 'abrir o menu de admin']],
    dicas: ['USE COM RESPONSABILIDADE em servidor: é ferramenta de admin, não de trapaça com os amigos.']
  },
  2565965887: {
    cat: 'admin', nome: 'Arma 3 Performance Extension',
    oQue: 'Extensão nativa de performance: otimizações de engine via DLL pra ganhar FPS (especialmente em cenários pesados de IA).',
    como: 'Passivo após instalado — siga as instruções da página do Workshop (a extensão precisa ser permitida no jogo no primeiro uso).',
    atalhos: [['—', 'passivo']],
    dicas: ['Com 105 mods carregados, todo FPS conta — deixe sempre ativo.', 'Se o jogo pedir confirmação de extensão no boot, aceite (é este mod).']
  }
};

/* Sanidade: total esperado de tutoriais */
export const A3TUT_TOTAL = Object.keys(A3TUT_MODS).length;
