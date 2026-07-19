/**
 * Tutorial completo do ARMA 3 VANILLA (jogo base, sem mods) — pedido do
 * operador: "um tutorial completo tudo do jogo (digo do vanilla)".
 *
 * Regra de honestidade (a mesma da página): as teclas são os PADRÕES do
 * jogo — tudo remapeável em Options → Controls. Onde o padrão varia por
 * layout/versão, o texto manda conferir em Controls em vez de chutar.
 * O Field Manual (menu de pausa) é a referência oficial dentro do jogo.
 */

export const A3VAN_SECOES = [
  {
    id: 'comeco', nome: 'Primeiros passos', icon: '🎯',
    desc: 'O que é o Arma 3, onde aprender dentro do jogo e como não se frustrar no dia 1.',
    topicos: [
      {
        titulo: 'O que é o Arma 3 (e o que ele espera de você)',
        texto: 'Arma 3 é um simulador militar de mundo aberto: balística real, logística, comando de IA e liberdade total. Ele NÃO segura sua mão — morrer com um tiro é normal, correr no aberto é punido e o mapa é a sua principal arma. A curva é íngreme, mas é exatamente por isso que cada vitória vale.',
        atalhos: [['Esc', 'menu de pausa — onde vive o FIELD MANUAL (manual oficial em jogo)']],
        dicas: ['Leia o Field Manual quando tiver dúvida de mecânica: ele é atualizado pela Bohemia e cobre TUDO do vanilla.', 'Jogue os primeiros dias no Recruit/Regular sem vergonha.']
      },
      {
        titulo: 'Bootcamp e VR Training — a escola oficial',
        texto: 'No menu principal: TUTORIALS → Bootcamp (campanha-escola com a história do recruta) e VR Training (aulas isoladas: tiro, direção, voo de helicóptero, comando). O VR também é o LABORATÓRIO perfeito pra testar armas e mods depois.',
        atalhos: [['menu principal → Tutorials', 'Bootcamp · VR Training']],
        dicas: ['Faça o Bootcamp inteiro antes da campanha — 1h que economiza 10.', 'O campo de tiro do VR é onde você aprende o zeroing sem pressão.']
      },
      {
        titulo: 'Dificuldade e opções que valem mudar',
        texto: 'A dificuldade (Recruit/Regular/Veteran/Custom) controla mira assistida, marcadores de inimigo, terceira pessoa e stamina. Em Options → Game você liga a barra de stamina e o crosshair; em Options → Controls remapeia QUALQUER tecla (o jogo inteiro é remapeável).',
        atalhos: [['Esc → Options → Difficulty', 'presets e dificuldade customizada'], ['Esc → Options → Controls', 'ver e remapear todas as teclas']],
        dicas: ['Custom com terceira pessoa ligada e marcadores desligados é um meio-termo popular.', 'Aprenda as teclas ANTES de trocá-las — os tutoriais assumem o padrão.']
      }
    ]
  },
  {
    id: 'movimento', nome: 'Movimento & Posturas', icon: '🏃',
    desc: 'O sistema de movimento é o mais rico do gênero: 3 posturas base + ajustes finos.',
    topicos: [
      {
        titulo: 'Andar, correr, sprintar',
        texto: 'W/A/S/D move; o passo padrão é o trote. Segure Shift pra SPRINTAR (arma abaixada, stamina drenando). A stamina regula tudo: cansado, sua mira balança e o sprint some — administre o fôlego como munição.',
        atalhos: [['W A S D', 'mover'], ['Shift (segurar)', 'sprint'], ['2× Ctrl esquerdo', 'abaixar/levantar a arma (andar "administrativo")']],
        dicas: ['Arma abaixada anda mais rápido e cansa menos — abaixe fora de combate.', 'Sprint é pra cruzar rua sob fogo, não pra patrulhar.']
      },
      {
        titulo: 'As três posturas + ajuste fino',
        texto: 'Em pé (C), agachado (X) e deitado (Z) — cada uma muda velocidade, silhueta e estabilidade da mira. O AJUSTE FINO (segurar Ctrl + W/S/A/D) cria posturas intermediárias: meio-agachado mais alto/baixo, deitado de lado… é o segredo pra usar cobertura baixa de verdade.',
        atalhos: [['C', 'ficar de pé'], ['X', 'agachar'], ['Z', 'deitar'], ['Ctrl (segurar) + W/S', 'postura mais alta/mais baixa (ajuste fino)'], ['Ctrl (segurar) + A/D', 'inclinar o corpo deitado/lateral']],
        dicas: ['Atrás de muro baixo: agache e suba UM degrau de postura — só a cabeça e o fuzil aparecem.', 'Deitado é a mira mais estável e a silhueta mínima — e a mobilidade zero. Escolha.']
      },
      {
        titulo: 'Inclinar, transpor e nadar',
        texto: 'Q/E inclinam o tronco pra espiar esquinas expondo pouco (toque duplo TRAVA a inclinação). V transpõe obstáculos baixos (muretas, cercas). Na água você nada automaticamente — equipamento pesado afunda você mais rápido e arma molhada continua funcionando (é 2035).',
        atalhos: [['Q / E', 'inclinar esquerda/direita'], ['2× Q / 2× E', 'travar a inclinação'], ['V', 'transpor obstáculo (step over)']],
        dicas: ['Inclinar + esquina é a jogada mais forte do CQB vanilla.', 'Antes de nadar, pense no peso: dá pra soltar a mochila no fundo (e perdê-la).']
      }
    ]
  },
  {
    id: 'tiro', nome: 'Armas & Tiro', icon: '🔫',
    desc: 'Balística real: bala cai, vento não existe no vanilla, mas distância e respiração sim.',
    topicos: [
      {
        titulo: 'Mirar, atirar, recarregar',
        texto: 'Botão direito MIRA (ADS); esquerdo atira. R recarrega (o soldado guarda o carregador parcial), F troca o modo de fogo (semi/rajada/auto — olhe o indicador no canto). Mirando, prender a respiração estabiliza a luneta por alguns segundos.',
        atalhos: [['botão direito', 'mirar (ADS)'], ['botão esquerdo', 'atirar'], ['R', 'recarregar'], ['F', 'modo de fogo (semi · rajada · auto)'], ['botão direito (segurar, mirando)', 'prender a respiração']],
        dicas: ['Semi-auto é o modo padrão do jogo inteiro: 1 bala bem posta > 5 espalhadas.', 'O indicador de arma (canto inferior) mostra modo de fogo e munição restante.']
      },
      {
        titulo: 'Zeroing — a bala CAI',
        texto: 'A gravidade puxa a bala: em 300+ metros você precisa compensar. Page Up/Page Down ajustam o ZEROING da mira (a distância pra qual a luneta está calibrada). Alvo a 400 m? Zere pra 400 e mire no centro.',
        atalhos: [['Page Up', 'aumentar o zeroing'], ['Page Down', 'diminuir o zeroing']],
        dicas: ['Sem zeroing disponível na mira? Mire ACIMA do alvo (holdover) — treine as alturas no VR.', 'Luneta com retículo graduado: as marcas abaixo do centro são holdovers prontos.']
      },
      {
        titulo: 'Granadas, lançadores e acessórios',
        texto: 'G arremessa granada (a força acompanha o movimento — pare pra arremessos curtos). Fuzil com lança-granadas: F alterna pro tubo (a mira muda pro arco). Lanterna/laser montados ligam no L; visão noturna (se equipada no capacete) no N.',
        atalhos: [['G', 'arremessar granada'], ['F', 'alternar fuzil ↔ lança-granadas (quando montado)'], ['L', 'lanterna/laser da arma'], ['N', 'visão noturna'], ['B', 'binóculo']],
        dicas: ['Granada de fumaça é a "cobertura portátil" do jogo — use MUITO.', 'À noite: NVG + laser IR (L) só visível no NVG = mira rápida sem denunciar.']
      },
      {
        titulo: 'Trocar de arma e lançadores AT',
        texto: 'Números trocam de arma: 1 primária, 2 pistola, 3 lançador. Lançadores AT/AA travam em veículos com T (os guiados); os burros (RPG/NLAW no CDLC) são mira e fé. Recarregar lançador exige o foguete na MOCHILA.',
        atalhos: [['1 / 2 / 3', 'primária · pistola · lançador'], ['T (com lançador guiado)', 'travar no alvo']],
        dicas: ['Titan AA trava em aeronave a quilômetros — mas o rastro de fumaça denuncia SUA posição: atire e MUDE.']
      }
    ]
  },
  {
    id: 'inventario', nome: 'Inventário, Ações & Saúde', icon: '🎒',
    desc: 'O inventário de 3 camadas (uniforme/colete/mochila), o menu de ações e o sistema médico.',
    topicos: [
      {
        titulo: 'O inventário de três camadas',
        texto: 'I abre o inventário: uniforme, colete e mochila têm espaços separados (números = capacidade). Perto de caixa/corpo/veículo, o lado esquerdo mostra o contêiner externo — arraste itens entre os lados. O PESO total afeta stamina e velocidade.',
        atalhos: [['I', 'abrir inventário'], ['arrastar', 'mover itens entre uniforme/colete/mochila/chão']],
        dicas: ['Munição no colete (acesso), granadas no uniforme, o resto na mochila.', 'A barra de peso (se ligada nas opções) é sua amiga: verde = ágil.']
      },
      {
        titulo: 'O menu de ações (a roda do mouse)',
        texto: 'A RODA do mouse abre o menu de ações contextual: abrir porta, entrar no veículo, pegar arma do chão, tratar ferido… Role pra escolher e confirme com o clique do MEIO (ou Enter). É a interface universal do vanilla pra interagir com o mundo.',
        atalhos: [['roda do mouse', 'abrir/rolar o menu de ações'], ['clique do meio / Enter', 'confirmar a ação selecionada']],
        dicas: ['CUIDADO com "Eject" rolando o menu dentro de aeronave — a lenda urbana mais verdadeira do Arma.', 'Ação some do menu? Chegue mais perto/olhe direto pro objeto.']
      },
      {
        titulo: 'Saúde: First Aid Kit vs Medkit',
        texto: 'Levou tiro e sobreviveu? A tela borra/dessatura e a mira balança. FIRST AID KIT (descartável) estanca e estabiliza — mas não cura tudo; só o MEDKIT (do médico) restaura 100%. Trate-se pela ação do menu (roda) ou peça ao médico do esquadrão.',
        atalhos: [['roda do mouse → Treat yourself', 'usar first aid kit'], ['6 (comando) → Heal', 'mandar o médico da IA te tratar']],
        dicas: ['Ferido grave anda devagar E atira pior — recue e trate antes do próximo contato.', 'Carregue 2-3 first aid kits SEMPRE; peso quase zero.']
      }
    ]
  },
  {
    id: 'comando', nome: 'Comandar a IA (esquadrão)', icon: '🎖️',
    desc: 'Seu esquadrão de IA é uma arma — os menus numéricos comandam tudo.',
    topicos: [
      {
        titulo: 'Selecionar e mover',
        texto: 'F1–F10 selecionam soldados (F2 = o nº 2…); ~ (til) seleciona TODOS. Com alguém selecionado, os menus numéricos abrem: 1 MOVER (ou clique no chão/mapa pra mandar ali), 8 FORMAÇÃO, 7 MODO DE COMBATE. Backspace fecha o menu.',
        atalhos: [['F1 … F10', 'selecionar soldado do esquadrão'], ['~ (til)', 'selecionar todos'], ['1', 'menu MOVER (ou clique direto no terreno/mapa)'], ['8', 'formações (coluna, linha, cunha…)'], ['Backspace', 'fechar/voltar o menu de comando']],
        dicas: ['O básico que resolve 90%: ~ → 1 → clique onde quer o esquadrão.', 'Mande a IA pra POSIÇÕES (1), não "siga-me" — ela se cola em você e morre junto.']
      },
      {
        titulo: 'Combate: alvos, engajar, segurar fogo',
        texto: 'Menu 2 = ALVOS (atribuir alvo específico), 3 = ENGAJAR (abrir fogo, suprimir, cessar), 7 = MODO DE COMBATE (stealth/aware/combat) e "hold fire". A IA reporta contatos por rádio — os alvos aparecem no menu 2.',
        atalhos: [['2', 'menu de alvos'], ['3', 'engajar · suprimir · cessar fogo'], ['7', 'modo de combate / segurar fogo'], ['5', 'status/relatórios da unidade']],
        dicas: ['Emboscada perfeita: 7 → Hold Fire + Stealth, posiciona todo mundo (1), e solta com 3 → Open Fire.', 'IA vanilla atira BEM — aponte o alvo (2) e deixe.']
      },
      {
        titulo: 'Veículos, ações e o resto',
        texto: 'Menu 4 = EMBARCAR (em qual veículo/posição), 6 = AÇÕES (curar, pegar arma, desarmar mina — o "faz-tudo"), 9 = organizar equipes coloridas (vermelha/verde/azul) pra comandar em blocos, 0 = respostas de rádio.',
        atalhos: [['4', 'embarcar/desembarcar do veículo'], ['6', 'menu de ações da IA (curar, rearmar, engenharia)'], ['9', 'equipes coloridas (subgrupos)'], ['0', 'responder rádio']],
        dicas: ['9 → equipes: RED assalta, GREEN cobre — dois blocos comandados com metade dos cliques.', '6 → Rearm: IA sem munição se serve sozinha do veículo/caixa apontada.']
      }
    ]
  },
  {
    id: 'navegacao', nome: 'Mapa & Navegação', icon: '🗺️',
    desc: 'O mapa é a alma do jogo: sem minimapa mágico, você navega como gente grande.',
    topicos: [
      {
        titulo: 'Mapa, marcadores e medição',
        texto: 'M abre o mapa (estilo carta topográfica real: curvas de nível, vegetação, edifícios). CLIQUE DUPLO cria um marcador editável (digite o texto; setas mudam cor/ícone antes do Enter). As linhas de grade dão a coordenada — a leitura padrão é "primeiro leste (horizontal), depois norte".',
        atalhos: [['M', 'abrir/fechar o mapa'], ['2× clique (no mapa)', 'criar marcador'], ['Del (marcador selecionado)', 'apagar marcador'], ['Ctrl (segurar) + arrastar', 'medir distância/direção com a régua (dependendo da dificuldade)']],
        dicas: ['Marque contatos NA HORA que avistar — memória tática vale mais que reflexo.', 'Curva de nível apertada = morro íngreme = cobertura de fogo ou rota morta. Aprenda a ler.']
      },
      {
        titulo: 'Bússola, relógio e GPS',
        texto: 'K saca a bússola (norte magnético + azimutes) e O o relógio (hora do jogo — importa pra luz!). Com o item GPS no inventário, Ctrl+M liga o mini-GPS no canto (posição + direção; sem inimigos, claro).',
        atalhos: [['K', 'bússola'], ['O', 'relógio'], ['Ctrl + M', 'mini-GPS (com o item GPS no inventário)']],
        dicas: ['Comunicar direção por azimute ("contato 240!") é padrão milsim — a bússola é o vocabulário.', 'Sem GPS: mapa + bússola + terreno = navegação clássica. O Arma recompensa quem sabe.']
      }
    ]
  },
  {
    id: 'veiculos', nome: 'Veículos Terrestres', icon: '🚙',
    desc: 'Do quadriciclo ao MBT: posições, armas e sobrevivência sobre rodas/lagartas.',
    topicos: [
      {
        titulo: 'Entrar, dirigir, posições',
        texto: 'Aproxime-se e use a roda do mouse: entrar como MOTORISTA, ARTILHEIRO, COMANDANTE ou passageiro — cada posição é um papel real. Dirigindo: W/S acelera/freia-ré, A/D vira, e a câmera do motorista pode "virar pra fora" (turn out) pra ver melhor (e se expor).',
        atalhos: [['roda do mouse (perto do veículo)', 'entrar em cada posição'], ['W / S / A / D', 'dirigir'], ['roda do mouse → Turn out / Turn in', 'colocar/tirar a cabeça pra fora'], ['roda do mouse → Switch seat', 'trocar de posição por dentro']],
        dicas: ['Blindado sozinho é caixão: sem comandante observando, você é cego. Leve IA nas posições.', 'Turn out vê MUITO melhor; um sniper discorda. Escolha por contexto.']
      },
      {
        titulo: 'Artilheiro: torres, travas e munições',
        texto: 'Como artilheiro, o mouse gira a torre; F troca o TIPO de munição (AP/HE/coax — cada uma pra um alvo); T trava em alvos (nos sistemas com FCS o ponto de mira compensa o movimento). Blindagem é direcional: frente forte, traseira fraca — nos DOIS sentidos.',
        atalhos: [['mouse', 'girar a torre'], ['F', 'trocar munição/arma da torre (AP · HE · coax)'], ['T', 'travar/designar alvo'], ['N (na ótica)', 'modos de visão da ótica (térmica, quando houver)']],
        dicas: ['HE em infantaria/leve, AP (sabot) em blindado — errar o tipo desperdiça o tiro do duelo.', 'A térmica do artilheiro acha gente no mato que o olho nunca veria.']
      }
    ]
  },
  {
    id: 'aereo', nome: 'Helicópteros, Aviões & Drones', icon: '🚁',
    desc: 'Voar no Arma é uma habilidade à parte — o VR Training de voo existe por um motivo.',
    topicos: [
      {
        titulo: 'Helicópteros — o básico honesto',
        texto: 'O heli responde a COLETIVO (sobe/desce), CÍCLICO (inclina pra onde vai) e PEDAIS (gira o nariz). Os eixos exatos dependem do seu setup (teclado puro, mouse+teclado, joystick) — confira/ajuste em Options → Controls → Helicopter Movement em vez de decorar tecla: o que importa é o CONCEITO. Pouso: chegue DEVAGAR, nariz levemente pra cima, desça o coletivo com paciência. O auto-hover (ação/tecla de autohover) segura o voo pairado pra você.',
        atalhos: [['Options → Controls → Helicopter Movement', 'ver/ajustar coletivo, cíclico e pedais do SEU setup'], ['G', 'trem de pouso (nos helis que têm)'], ['auto-hover (ação do menu/tecla)', 'travar voo pairado']],
        dicas: ['VR Training → Helicopter ensina em 20 min o que texto nenhum ensina.', 'Regra de ouro do pouso: se a aproximação passou rápido demais, ARREMETA e tente de novo.']
      },
      {
        titulo: 'Aviões e jatos',
        texto: 'Decolagem: alinhe, acelere no eixo de throttle até a velocidade de rotação e puxe. Em combate: T trava alvos (ar-ar/ar-solo conforme a arma selecionada em F), contramedidas (flares/chaff) na tecla própria (padrão C) quebram mísseis. Trem de pouso G — esquecer é tradição.',
        atalhos: [['G', 'trem de pouso'], ['F', 'trocar arma (canhão · mísseis · bombas)'], ['T', 'travar alvo'], ['C', 'contramedidas (flares/chaff — padrão)']],
        dicas: ['Míssil no aviso (tom contínuo)? Flare + quebra fechada pra dentro do míssil, mudando de plano.', 'Jato no Arma morre no CHÃO: paradão em pista é alvo de Titan.']
      },
      {
        titulo: 'UAVs/Drones do vanilla',
        texto: 'Com o TERMINAL UAV no slot de GPS (e a frequência da sua facção), abra o terminal, conecte ao drone e assuma como piloto ou operador da câmera/armas. Os pequenos (Darter) são olhos; os grandes (Greyhawk) atiram. O autopilot mantém órbita/altitude enquanto você opera a câmera.',
        atalhos: [['terminal UAV (item no slot GPS)', 'abrir · conectar · assumir controle'], ['dentro do terminal', 'alternar piloto ↔ operador da torre']],
        dicas: ['Darter + mapa = reconhecimento perfeito: voe alto, marque contatos, planeje.', 'Laser do drone + CAS de verdade é o combo rei do vanilla tardio.']
      }
    ]
  },
  {
    id: 'criacao', nome: 'Editor Eden, Zeus & Cenários', icon: '🛠️',
    desc: 'O Arma vem com as ferramentas de criar o SEU jogo dentro do jogo.',
    topicos: [
      {
        titulo: 'Editor Eden (3DEN) — crie missões em minutos',
        texto: 'No menu principal, EDITOR: escolha o mapa e caia no editor 3D. Coloque uma unidade jogável (lado, facção, grupo), arraste WAYPOINTS pra IA, ajuste hora/clima nos atributos do cenário e aperte PLAY. Salvou, virou missão — dá até pra exportar pro Workshop.',
        atalhos: [['menu principal → Editor', 'abrir o Eden no mapa escolhido'], ['clique-direito (no editor)', 'menu de contexto (waypoints, atributos, agrupar)'], ['Play (botão)', 'testar a missão na hora']],
        dicas: ['Sua primeira missão em 5 min: você + esquadrão inimigo com waypoint de patrulha + Play.', 'Atributos do cenário: hora do dia muda TUDO — a mesma missão às 14h e às 02h são dois jogos.']
      },
      {
        titulo: 'Zeus — o mestre de jogo ao vivo',
        texto: 'Zeus é o "game master": um curador voa pelo mapa em tempo real criando inimigos, objetivos e eventos enquanto os outros jogam. No vanilla, Y abre o Zeus (quando você é o curador da missão — há cenários oficiais "Zeus" prontos no MP).',
        atalhos: [['Y', 'abrir a interface do Zeus (sendo curador)'], ['arrastar unidades no mapa/mundo', 'criar e mover ao vivo']],
        dicas: ['Zeus + 2 amigos = missão infinita sem preparar nada.', 'O Zeus Enhanced do seu preset multiplica ISSO — mas o vanilla já é poderoso.']
      },
      {
        titulo: 'Campanha, Showcases e Workshop',
        texto: 'A campanha "The East Wind" (Survive/Adapt/Win) é o tutorial narrativo definitivo. Os SHOWCASES demonstram cada sistema isolado (infantaria, blindados, helis, mergulho…). E o STEAM WORKSHOP tem dezenas de milhares de missões grátis — assinar já as coloca no menu.',
        atalhos: [['menu principal → Campaign / Showcases', 'conteúdo oficial'], ['menu principal → Workshop', 'missões da comunidade assinadas']],
        dicas: ['Showcase de cada sistema ANTES de usá-lo em missão séria.', 'A campanha ensina o jogo inteiro em doses — vale mais que 100 vídeos.']
      }
    ]
  },
  {
    id: 'taticas', nome: 'Táticas de combate', icon: '🎯',
    desc: 'O Arma premia tática, não reflexo — os fundamentos que mantêm você vivo.',
    topicos: [
      {
        titulo: 'Cobertura, conceal e a regra dos 3 segundos',
        texto: 'COVER (cobertura) para bala; CONCEAL (ocultação — mato, fumaça) só esconde. Não confunda: um arbusto não para tiro. Mova-se de cobertura em cobertura em lances curtos ("I\'m up, he sees me, I\'m down" — ~3 segundos expostos), porque o atirador leva um tempo pra te processar. Ficar parado no aberto é morte.',
        atalhos: [['Z / X', 'deitar/agachar atrás de cobertura'], ['Q / E', 'espiar da quina expondo pouco']],
        dicas: ['Antes de correr, tenha a PRÓXIMA cobertura escolhida — nunca corra pro nada.', 'Fumaça (granada) cria concealment na hora: cruze estradas atrás dela.']
      },
      {
        titulo: 'Supressão e fogo de manobra',
        texto: 'Você não precisa ACERTAR pra vencer: fogo perto do inimigo o obriga a se abaixar (supressão) e para de atirar em você. A manobra clássica é fogo-e-movimento: um elemento SUPRIME (atira na posição inimiga) enquanto o outro MANOBRA pelo flanco. Comande isso na IA com as equipes coloridas (9) + engajar (3).',
        atalhos: [['3 → Suppress (comando de IA)', 'mandar a IA suprimir uma posição'], ['9 → equipes', 'dividir suprimir × manobrar']],
        dicas: ['Metralhadora (LMG) é a rainha da supressão — 200 balas mantendo cabeça abaixada.', 'Flanco vem DEPOIS da supressão: sem supressão, quem manobra corre pro tiro.']
      },
      {
        titulo: 'Distância de engajamento e a bala que cai',
        texto: 'Escolha o tiro pela distância: red dot/CQB até ~200 m, óticas médias 200-500 m, luneta 500 m+. Lembre da queda da bala (zeroing, PgUp/PgDn) e que, sem vento no vanilla, a variável é só distância. Não abra fogo cedo demais: revelar posição a 600 m com fuzil de assalto só entrega você.',
        atalhos: [['Page Up / Page Down', 'ajustar o zeroing pra distância'], ['prender respiração (mirando)', 'estabilizar o tiro longo']],
        dicas: ['Contra alvo distante, MIRE e ESPERE ele parar — tiro em movimento a 400 m é loteria.', 'Deixe o inimigo se aproximar da SUA distância ideal em vez de duelar na dele.']
      },
      {
        titulo: 'Operações noturnas',
        texto: 'À noite, NVG (tecla N) + laser IR (L, só visível no NVG) é vantagem esmagadora contra quem não tem visão noturna. Sem NVG, use a luz da lua (relógio O mostra a hora) e evite lanternas brancas — elas te entregam a quilômetros. Iluminação (flare de artilharia/foguete) sobre o inimigo troca o jogo de um assalto.',
        atalhos: [['N', 'visão noturna (com NVG equipado)'], ['L', 'laser/lanterna (IR só aparece no NVG)'], ['O', 'relógio (hora → luz da lua)']],
        dicas: ['Luz branca à noite = "atire em mim". Prefira IR sempre que tiver NVG.', 'Sem NVG contra inimigo COM NVG: fique na cobertura e force o combate pra perto.']
      }
    ]
  },
  {
    id: 'multiplayer', nome: 'Multiplayer & Comunidade', icon: '🌐',
    desc: 'Onde o Arma vira estilo de vida: co-op, milsim, King of the Hill, Antistasi…',
    topicos: [
      {
        titulo: 'Entrar num servidor',
        texto: 'MULTIPLAYER → Server Browser: filtre por modo/mapa/ping (ping < 100 importa MUITO). A maioria dos servidores modded lista os mods exigidos — o launcher oficial baixa e ativa o pacote certo ao conectar (ou use os presets, como os da sua Central de Modpacks).',
        atalhos: [['menu principal → Multiplayer', 'browser de servidores'], ['filtros do browser', 'modo · mapa · ping · com/sem mods']],
        dicas: ['Comece em servidor co-op casual — PvP no Arma é pós-graduação.', 'JIP (entrar no meio da partida) é normal no Arma: o jogo te coloca no que está rolando.']
      },
      {
        titulo: 'Etiqueta milsim básica',
        texto: 'Nos servidores organizados: ouça o líder, reporte contatos com direção+distância ("contato leste, 300, infantaria"), não atire sem ordem em stealth e NUNCA pegue veículo/slot que não é seu. Rádio: fale curto, confirme ordens ("copiado").',
        atalhos: [['V (padrão de VON em muitos servidores)', 'voz — confira a tecla de Push-to-Talk nas opções/servidor']],
        dicas: ['Slot de "rifleman" é o melhor lugar pra aprender observando.', 'Errar tudo bem; avisar que é novo = metade da comunidade vira instrutor voluntário.']
      }
    ]
  }
];

export const A3VAN_TOTAL_TOPICOS = A3VAN_SECOES.reduce((n, s) => n + s.topicos.length, 0);
