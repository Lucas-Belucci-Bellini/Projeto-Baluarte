/**
 * Guias de CAMPANHA do Arma 3 — pedido do operador: "usa isso para melhorar
 * o guia (github.com/Sparker95/Vindicta)".
 *
 * COLETA REAL: todo o conteúdo do Vindicta abaixo foi extraído do README
 * oficial (Sparker95/Vindicta) e das páginas do guia oficial Vindicta-Docs
 * (vindicta-team.github.io/Vindicta-Docs — quick-start, suspicion, intel,
 * civilians, camps, recruitment, building, arsenal, maps e FAQ). Números
 * (limiares de suspeita, 6 saves, raios) são os documentados pelo time.
 */

export const A3CAMP_SECOES = [
  {
    id: 'vind-comeco', nome: 'Vindicta — Começando', icon: '🏴',
    desc: 'Instalar, criar a campanha, salvar (do jeito CERTO) e o que NÃO pode estar na lista de mods.',
    topicos: [
      {
        titulo: 'Primeira campanha — o menu U',
        texto: 'O Vindicta instala como MOD (com CBA + ACE + FileXT — tudo no seu preset) e a missão aparece sozinha: no MP crie um servidor local (recomendado) ou jogue pela aba de cenários SP (funciona, mas o time recomenda MP hospedado). Em jogo: aperte U → CREATE → nomeie a campanha → escolha as FACÇÕES (precisa ter os mods da facção!) → ajuste o "INITIAL ENEMY %" (o quão guarnecidos os postos começam) → START. A inicialização leva 1-2 minutos; nasça no ponto laranja.',
        atalhos: [['U', 'o menu do Vindicta (criar campanha, salvar, aba estratégica)'], ['Esc → Addon Options → Vindicta → Server', 'dificuldade e performance da campanha']],
        dicas: ['Começo canônico: você e pistolas — o resto se saqueia.', 'INITIAL ENEMY % baixo = mapa mais vazio pro começo furtivo.']
      },
      {
        titulo: 'O save é PRÓPRIO (e frágil) — leia isto',
        texto: 'O Vindicta NÃO usa o save do Arma: salve pelo menu U. São no MÁXIMO 6 SLOTS (documentado) — cada save incha o arquivo .vars do seu profile e deixa até o BOOT do Arma mais lento. O time oficialmente recomenda BACKUP do .vars regularmente, especialmente antes de rodar o jogo após update da Steam.',
        atalhos: [['U → Save', 'salvar a campanha (máx. 6 slots)']],
        dicas: ['O .vars fica na pasta do seu profile do Arma — copie ele de tempos em tempos.', 'Sem o FileXT ativo não há persistência — ele já está no preset.']
      },
      {
        titulo: '⚠ Mods de IA são INCOMPATÍVEIS + estado do projeto',
        texto: 'Do FAQ oficial: mods de IA (VCOM, LAMBS danger.fsm etc.) QUEBRAM o Vindicta — o comandante IA dele controla tudo, e mod de IA faz patrulha fugir de posto e coisas piores (exceção: mods que não mudam waypoints, tipo LAMBS suppression). E honestidade do próprio time: o desenvolvimento foi ENCERRADO — o alpha é jogável e completo no que tem, mas não vem feature nova.',
        atalhos: [['—', 'checar a lista de mods antes de criar a campanha']],
        dicas: ['O seu preset atual não tem mod de IA de waypoint — está seguro.', 'Facções suportadas (built-in e de addon) estão listadas no site oficial do guia.']
      },
      {
        titulo: 'Mapas suportados',
        texto: 'Oficiais: Altis (base), Enoch (DLC Contact), Tanoa (Apex), Malden (grátis), Weferlingen (Global Mobilization) — e via mods: Takistan, Chernarus 2020, Southern Sahrani (CUP), Tembelan e Beketov. Cada um com marcação de mapa feita pelo time/comunidade.',
        atalhos: [['—', 'escolha o mapa ao criar a campanha']],
        dicas: ['Altis é a experiência de referência (marcação do próprio time).', 'Com o seu CUP no preset, Takistan e Chernarus 2020 são upgrades naturais.']
      }
    ]
  },
  {
    id: 'vind-suspeita', nome: 'Vindicta — Suspeita & Undercover', icon: '🕶️',
    desc: 'O coração do jogo: você é civil até PARECER guerrilheiro. Os números oficiais dos três estados.',
    topicos: [
      {
        titulo: 'Os 3 estados (números oficiais)',
        texto: 'A suspeita é CUMULATIVA (ação suspeita + lugar suspeito = soma das duas). Abaixo de 50%: UNDERCOVER — inimigos te ignoram completamente. De 50% a 100%: SUSPEITO — podem tentar te PRENDER. Em 100%: OVERT — atiram pra matar no avistamento.',
        atalhos: [['—', 'o indicador de suspeita aparece na HUD']],
        dicas: ['Entre a prisão e o tiro existe uma janela — se virou "suspeito", saia de vista ANTES de virar "overt".']
      },
      {
        titulo: 'O que te entrega (fontes documentadas)',
        texto: 'AÇÕES suspeitas: discutir assuntos "sensíveis" com civis e... CORRER (sim, correr levanta suspeita). APARÊNCIA suspeita: QUALQUER arma à mostra, roupa militar, mochila militar e capacete. Também pesa ONDE você está e a exposição dentro de veículos (o sistema considera o quão visível você fica no banco).',
        atalhos: [['0 (zero)', 'coldre da pistola (ação ACE) — pistola guardada não conta como arma à mostra']],
        dicas: ['Uniforme civil + ANDAR (nunca correr) + arma no coldre/mochila civil = fantasma.', 'Reconhecimento profundo se faz de carro civil, devagar, de dia.']
      }
    ]
  },
  {
    id: 'vind-intel', nome: 'Vindicta — Civis, Influência & Intel', icon: '📡',
    desc: 'Informação vence guerra: os civis são seu radar — e a influência na cidade multiplica tudo.',
    topicos: [
      {
        titulo: 'Conversando com civis (todas as opções oficiais)',
        texto: 'Cada cidade tem população viva. Nos diálogos: PERGUNTE SOBRE LOCAIS MILITARES (todos sabem da delegacia local; a maioria conhece bases num raio de km), PERGUNTE SOBRE ATIVIDADES INIMIGAS (eles ouvem os planos — quanto mais influência, mais contam), PEÇA SUPRIMENTOS DE CONSTRUÇÃO (com influência alta, dão), e INSTIGUE a revolta (sobe sua influência na cidade). Bônus: LIBERTE CIVIS PRESOS pela polícia — também sobe influência.',
        atalhos: [['⊞ Win (no civil)', 'abrir o diálogo (interação ACE)']],
        dicas: ['Rotina de chegada numa cidade: instigar + perguntar locais + perguntar atividades.', 'Influência alta transforma a cidade num aliado logístico (intel automática + suprimentos).']
      },
      {
        titulo: 'Os 2 tipos de intel (e por que um deles MENTE)',
        texto: 'Documentado: intel de FORÇAS NOS POSTOS é sempre VELHA — só atualiza quando alguém do seu lado observa o local ou quando você pega um TABLET TÁTICO de soldado inimigo (eles carregam no uniforme: ação atual, locais próximos, ordens das esquadras). Intel de AÇÕES FUTURAS (comboios, QRFs, ataques) é sincronizada — se o inimigo cancelar, aparece "Ended". Tudo no mapa, ordenável e filtrável.',
        atalhos: [['M', 'mapa — painel de intel (ordenar por tipo/data, filtrar ativas/encerradas)'], ['revistar corpo → tablet', 'intel fresca do posto de origem']],
        dicas: ['Todo soldado morto merece uma revista: o tablet vale mais que o fuzil.', 'Com influência ALTA na cidade, a intel interceptada pelos civis chega SOZINHA no seu mapa.', 'Interceptação por RÁDIO é o método difícil-porém-confiável (independe de influência).']
      }
    ]
  },
  {
    id: 'vind-base', nome: 'Vindicta — Camps, Recrutamento & Ordens', icon: '⛺',
    desc: 'Da barraca escondida ao exército: o ciclo de crescimento da guerrilha.',
    topicos: [
      {
        titulo: 'Onde e como criar o camp',
        texto: 'Camp é sua base inicial: estoque (Arsenal), recrutamento e construção. O trade-off documentado: longe de estrada/patrulha = seguro, MAS o recrutamento vem das cidades dentro do RAIO do camp (o círculo aparece ao selecionar o camp no mapa). Criar: recursos de construção NA MOCHILA → menu U → aba STRATEGIC. Prédios existentes dentro do raio somam capacidade de infantaria automaticamente — criar camp perto de construções abandonadas é vantagem oficial.',
        atalhos: [['U → Strategic', 'criar camp · claim de locais capturados']],
        dicas: ['A pilha de equipamento que marca o camp some no próximo load — o LOCAL fica (comportamento documentado).', 'Capacidade cheia? Construa TENDAS no menu de build.']
      },
      {
        titulo: 'Recrutas → soldados (as 3 condições)',
        texto: 'Recrutas são POTENCIAL (vêm das cidades livres no raio); pra virarem soldados o local precisa de: (1) ser camp/outpost/base/airfield seu, (2) ter ARSENAL anexado com armas disponíveis, e (3) ter ALOJAMENTO suficiente (casas próximas ou tendas). Cumpriu as três? Aliste.',
        atalhos: [['no local, via menu', 'alistar soldados (com Arsenal + alojamento)']],
        dicas: ['Sem arma no Arsenal não há alistamento — saquear armas É recrutar.', 'O número de recrutas do local = soma das cidades no raio de recrutamento.']
      },
      {
        titulo: 'Ordens de guarnição — e a pegadinha do abandono',
        texto: 'Clique na guarnição no mapa pra dar ordens: SPLIT (divide em duas com a composição que você escolher), MOVE (vai até o ponto) e REINFORCE (junta-se a outra guarnição ou ocupa local vazio). A PEGADINHA documentada: dar ordem de movimento à guarnição de um local ABANDONA o local — sempre faça SPLIT primeiro e deixe defensores.',
        atalhos: [['clique na guarnição (mapa)', 'menu de ordens: Split · Move · Reinforce']],
        dicas: ['Split é a ordem mais importante do jogo: ataque com metade, segure com a outra.', '"Attach to garrison" (FAQ): use em caixas de recursos pro local enxergá-las no build.']
      }
    ]
  },
  {
    id: 'vind-construir', nome: 'Vindicta — Construção, Arsenal & Veículos', icon: '🔨',
    desc: 'Build UI, o Arsenal limitado (de propósito) e o lockpick que ninguém descobre sozinho.',
    topicos: [
      {
        titulo: 'Build UI — construir e mover',
        texto: 'Num local SEU (nome no topo da tela), a RODA DO MOUSE abre o menu de construção — escolha se os recursos saem do seu inventário ou do Arsenal do local. Selecione a peça, posicione o "fantasma" com os controles mostrados na UI e confirme. Pra MOVER algo já construído: feche o carrossel de categorias, olhe pro objeto e confirme pra pegar/recolocar.',
        atalhos: [['roda do mouse (em local seu)', 'abrir o Build UI'], ['controles na tela', 'girar/posicionar o fantasma da peça']],
        dicas: ['Recursos de construção vêm de: delegacias, locais militares, COMBOIOS de suprimento e civis (influência alta).', 'Tendas = capacidade de infantaria; Storage = Arsenais.']
      },
      {
        titulo: 'O Arsenal do Vindicta é LIMITADO de propósito',
        texto: 'O "Jeroen\'s Limited Arsenal": capacidade infinita de ESTOQUE, mas só contém O QUE VOCÊ SAQUEOU (FAQ oficial: não dá pra desbloquear tudo — é design). O truque de logística documentado: "Inventory to Arsenal" na caixa do Arsenal + "Select" na caixa/veículo a até ~10 m transfere o conteúdo INTEIRO de uma vez. A caixa do Arsenal tem DOIS armazéns: o inventário normal dela e o Arsenal — são coisas separadas.',
        atalhos: [['roda do mouse → Arsenal', 'abrir (demora uns segundos)'], ['Inventory to Arsenal → Select', 'engolir caixa/veículo inteiro pro estoque']],
        dicas: ['Cada fuzil saqueado alimenta o alistamento — a economia do jogo é o saque.', 'Quer mais loot nas caixas inimigas? Tem opção pra isso no Addon Options (FAQ).']
      },
      {
        titulo: 'Veículos militares: LOCKPICK (o segredo do FAQ)',
        texto: 'Você NÃO consegue entrar em veículo militar inimigo direto — precisa fazer LOCKPICK pela interação do ACE ("Lockpick vehicle"). O item de lockpick é adicionado AUTOMATICAMENTE ao seu uniforme a cada respawn (detalhe documentado que quase ninguém acha sozinho). Sobre ar: só HELIS DE ATAQUE existem na missão (sem transporte/drones/aviões) e desde a 0.55 você pode pilotá-los.',
        atalhos: [['⊞ Win (no veículo) → Lockpick vehicle', 'arrombar veículo militar (item já no uniforme)']],
        dicas: ['Roubar o primeiro caminhão é o rito de passagem da campanha.', 'Anti-aéreo existe (0.55+) — heli de ataque roubado não é imortal.']
      }
    ]
  }
];

export const A3CAMP_TOTAL = A3CAMP_SECOES.reduce((n, s) => n + s.topicos.length, 0);
