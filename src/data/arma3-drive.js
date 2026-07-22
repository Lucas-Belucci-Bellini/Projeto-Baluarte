/**
 * Aba "Arquivos (Drive)" da Bíblia do Arma 3 (0.8.0).
 *
 * O operador espelhou a instalação inteira do Arma 3 no Google Drive
 * (pasta compartilhada "projeto-baluarte.vercel.app (dados que vc pode
 * precisar"). Este módulo é o SNAPSHOT curado dessa pasta: o que cada
 * diretório é, o perfil GHOST decifrado campo a campo (baixamos e lemos o
 * .Arma3Profile de verdade), as composições próprias e a anatomia dos
 * arquivos no nível de quem programa.
 *
 * A navegação AO VIVO usa o embeddedfolderview do Drive (iframe) — funciona
 * porque a pasta está compartilhada por link. IDs abaixo = pastas reais.
 */

export const A3DRV_RAIZ = {
  nome: 'projeto-baluarte.vercel.app (dados que vc pode precisar)',
  driveId: '1bj8YiZnXgsijcdFC2NtduXx6gyhOFJlt'
};

/* Pastas navegáveis no visualizador embutido (iframe do Drive). */
export const A3DRV_PASTAS = [
  { id: 'raiz', nome: '📂 Raiz do espelho', driveId: '1bj8YiZnXgsijcdFC2NtduXx6gyhOFJlt', desc: 'As 5 pastas do backup: jogo, Workshop, perfis e configs da Bohemia.' },
  { id: 'jogo', nome: '🎮 Arma 3 (1) — o jogo', driveId: '1U2PB4fzTVghn6E3P_v0dVdSB5OpCrbLw', desc: 'A pasta de instalação inteira (steamapps/common/Arma 3): executável, Addons, Dta, DLCs.' },
  { id: 'workshop', nome: '🧩 107410 — Workshop', driveId: '1_bkYAPBbfqF_ucTa572ASXGyS4_LS8t4', desc: 'steamapps/workshop/content/107410 — cada subpasta numérica é um mod baixado (o número É o id do Workshop).' },
  { id: 'perfil', nome: '👤 Arma 3 — perfil principal', driveId: '12MP_TOJl0CPS1RkcINXB-Vkv8EFYNIEL', desc: 'Documentos/Arma 3 — perfil padrão, configs .cfg e capturas.' },
  { id: 'outros', nome: '👻 Other Profiles (GHOST)', driveId: '1Wmr4wIbaxMJCNsklTQacOB8MTLCL1csr', desc: 'Documentos/Arma 3 - Other Profiles — o perfil GHOST mora aqui (settings, saves, missões, composições).' },
  { id: 'ghost', nome: '⭐ GHOST — dentro do perfil', driveId: '1ds3LvFHkGt7nF16dIqILUz0jOZrXSgwz', desc: 'GHOST.Arma3Profile, GHOST.vars (27 MB de saves!), missions/, compositions/, Saved/.' },
  { id: 'composicoes', nome: '🧱 compositions — as composições', driveId: '15YZaipz9TSv58sIZwleMNi1lOY-HhU7v', desc: 'As composições próprias do Eden (frota SPARTAN TIME, OSPREY, BRASIL 1/2…).' },
  { id: 'bohemia', nome: '⚙️ Bohemia_Interactive', driveId: '1ojA6g7IiURvEBMvjr2FLFwXnPNyyASFG', desc: 'AppData Local da Bohemia: crash dumps, launcher logs e configs de GPU.' }
];

export const A3DRV_SECOES = [
  {
    id: 'espelho', nome: 'O espelho no Drive', icon: '☁️',
    desc: 'O que é cada pasta do backup — e por que espelhar o jogo inteiro salva campanhas de anos.',
    topicos: [
      {
        titulo: 'Por que esse backup existe',
        texto: 'O Arma 3 espalha o que importa por TRÊS lugares do PC: a instalação (steamapps/common/Arma 3), o conteúdo do Workshop (steamapps/workshop/content/107410) e os perfis (Documentos/Arma 3 e Arma 3 - Other Profiles). Formatar o PC sem copiar os perfis = perder TODAS as campanhas salvas (Antistasi, Vindicta, KP Liberation), os controles e as composições. Este espelho no Drive guarda os três + a pasta da Bohemia (crash logs).',
        dicas: [
          'O que NÃO pode se perder de jeito nenhum: a pasta do perfil (GHOST) — o resto o Steam baixa de novo.',
          'Pra restaurar noutro PC: instala o jogo pelo Steam, assina o preset (a coleção baixa os mods) e só então copia os perfis de volta por cima.'
        ],
        link: { url: 'https://drive.google.com/drive/folders/1bj8YiZnXgsijcdFC2NtduXx6gyhOFJlt', rotulo: 'abrir a raiz no Drive' }
      },
      {
        titulo: 'Arma 3 (1) — a instalação do jogo',
        texto: 'Espelho de steamapps/common/Arma 3. Dentro: arma3_x64.exe (o jogo), Addons/ (o conteúdo vanilla inteiro em PBOs), Dta/ (dados do engine), pastas de DLC (Expansion = Apex, Enoch = Contact, AoW = Art of War…) e os .dll do BattlEye. ~1.457 arquivos.',
        dicas: ['Cada DLC vive numa subpasta própria com Addons/ dentro — é assim que o jogo sabe o que você possui e o que vira "conteúdo de teste".']
      },
      {
        titulo: '107410 — o Workshop cru',
        texto: 'Espelho de steamapps/workshop/content/107410. O número 107410 é o AppID do Arma 3 na Steam — TODO jogo tem o seu. Cada subpasta numérica é um item do Workshop (o número é o id que aparece na URL da página do mod). Dentro de cada uma: addons/*.pbo + as assinaturas .bisign. ~4.600 arquivos.',
        dicas: [
          'É por isso que os tutoriais da aba Mods citam o id: 463939057 = ACE3, 583496184 = CUP Terrains, e por aí vai.',
          'O Launcher cria atalhos "!Workshop" dentro da pasta do jogo apontando pra cá — mod "sumido" quase sempre é atalho quebrado.'
        ]
      },
      {
        titulo: 'Arma 3 & Other Profiles — onde o jogador mora',
        texto: 'Documentos/Arma 3 guarda o perfil padrão + arma3.cfg (config de vídeo global) + capturas. Documentos/Arma 3 - Other Profiles guarda perfis extras — o GHOST (o perfil real do operador) vive aqui, com settings, keybinds, campanhas salvas, missões e composições.',
        dicas: ['O jogo salva TUDO em texto ou serialização própria — dá pra abrir o .Arma3Profile no bloco de notas (a seção "Perfil GHOST decifrado" abaixo faz exatamente isso).']
      },
      {
        titulo: 'Bohemia_Interactive — a pasta que ninguém olha',
        texto: 'Espelho de AppData/Local/Bohemia_Interactive: logs do Launcher, relatórios de crash (.rpt ficam no perfil, dumps ficam aqui) e cache. Quando o jogo fecha sozinho, o diagnóstico começa por aqui e pelos .rpt.',
        dicas: ['Crash com mod novo? Abre o .rpt mais recente e procura a última linha antes do fim — 9 em 10 vezes cita o addon culpado.']
      }
    ]
  },
  {
    id: 'perfil', nome: 'Perfil GHOST decifrado', icon: '👻',
    desc: 'Baixamos o GHOST.Arma3Profile real do Drive e lemos campo a campo — isto não é exemplo genérico, é a config que está em uso.',
    topicos: [
      {
        titulo: 'Dificuldade: Custom no talo',
        texto: 'difficulty="Custom" com aiLevelPreset="AILevelHigh" e CustomAILevel skillAI=1 / precisionAI=1 — a IA está no MÁXIMO nos dois eixos (habilidade e mira). HUD minimalista de veterano: sem indicadores de grupo, sem tags de amigo/inimigo, sem marcadores de comando/waypoint (tudo 0). Fica ligado: crosshair, stance indicator, barra de stamina, visão de 3ª pessoa, tactical ping=3 e multipleSaves=1.',
        dicas: [
          'skillAI=1 + precisionAI=1 é mais difícil que o preset Veteran padrão (que usa precision ~0.75). A IA do GHOST atira MUITO melhor que a média.',
          'reducedDamage=0 e sem visionAid… mas thirdPersonView=1 — estilo "difícil, porém situacional".'
        ]
      },
      {
        titulo: 'Vídeo: qualidade alta com view distance tático',
        texto: 'viewDistance=3000 m (objetos a 1900 m, PiP 1000 m), shadowQuality=4, textureQuality=3, anisoFilter=12, terrainGrid=12.5 (terreno detalhado), sceneComplexity=1.300.000. Pós-processo sutil: brilho 1.01, contraste 1.06, saturação 1.08. IGUIScale=0.55 (HUD pequeno, estilo competitivo).',
        dicas: [
          '3000 m de view distance é o ponto doce infantaria/heli — pra voar jato o pessoal sobe pra 5000+, custa MUITO FPS.',
          'terrainGrid baixo (=melhor) muda até gameplay: grama renderiza mais longe, inimigo deitado some menos.'
        ]
      },
      {
        titulo: 'Progresso: East Wind, Old Man, Spearhead, Contact',
        texto: 'currentCampaign aponta pra The East Wind (campanha base) com lastCampaignMission="Blackfoot Down" — o capítulo Adapt bem no clímax. As activeKeys/playedKeys registram: prólogo de Stratis completo, hub de Altis, VR Arsenal feito, showcases (Laws of War, Future), Contact (Enoch) do intro ao FreeRoam, The Old Man (BIS_OM_Oldman), Spearhead 1944 (Operation Cobra + Liberation of Saint Gilles), Western Sahara (Extraction), missões em Tanoa (Apex m01/m02, TRGM2, THE DOWN) e ALiVE Quick Start.',
        dicas: [
          'Essas chaves ("BIS_A_m04.Stratis_done"…) são exatamente o que a campanha checa pra liberar missão — apagar o profile = campanha zerada.',
          'lastMPMission="ALiVE | Quick Start (APEX)" e currentMPMission de Spearhead: o multiplayer recente foi de milsim dinâmico.'
        ]
      },
      {
        titulo: 'Keybinds de mod gravados no perfil',
        texto: 'O .Arma3Profile guarda TODA tecla de mod já configurada, mesmo de mods desinstalados. No GHOST tem: Antistasi (keyA3A_core_battleMenu=Y, respawn=R, selfRevive=H, earPlugs=Del, menu de construção completo), RHS FCS (lase=T, zerar alcance PgUp/PgDn, computador balístico=B), BettIR (power do IR), Unsung (sifão de combustível, cesta de heli), EMR (ação principal), WBK (corrida alternativa), Zulu, VAST, Spectrum Device e mais.',
        dicas: [
          'É assim que você "recupera" teclas de um mod antigo: procura keyNOMEDOMOD_* no profile e vê os códigos DIK.',
          'Códigos: 19=R, 21=Y, 35=H, 57=Espaço, 29=Ctrl, 42=Shift esq. Números gigantes (487784465…) = combinações com prefixo (Ctrl/Shift/Alt).'
        ]
      },
      {
        titulo: 'Som, mouse e o resto',
        texto: 'Volumes todos em 10 (efeitos, fala, VON), threshold do mic em 0.03, mouseSmoothing=5 com aceleração DESLIGADA (mouseAcceleration=0 — regra de ouro de shooter), vibração ligada, sem TrackIR/joystick configurado (JoysticksList vazia), battleyeLicense=1, servidor favorito salvo na lista MP.',
        dicas: ['singleVoice=0 e vonID=1 — VON identificado no MP. streamFriendlyUI=0: os nomes aparecem (cuidado ao stremar).']
      }
    ]
  },
  {
    id: 'composicoes', nome: 'Composições próprias (Eden)', icon: '🧱',
    desc: 'A pasta compositions/ do GHOST — bases e esquadrões prontos que o operador montou no editor e reusa em qualquer missão.',
    topicos: [
      {
        titulo: 'A frota SPARTAN e as outras 50+',
        texto: 'Composições salvas no perfil: a série SPARTAN TIME (1, DELTA, RECON, HEAVY 1-3, AIR 1-4, WATER, TANK, UNCS, MONTORIZED RECON MK1/MK2, ATACK, BOPE MK1, 3 TRANSPORTE, 14), a família OSPREY (com quad bike, com tropas com/sem rampa), BRASIL 1 e 2, STRIKE 1 e 2, TRANSPORTE DE TROPAS 1/2, TROPAS INIMIGAS, INFILTRADED TIME 2, GOD MORNING VIETNAM, SUPORT TIME, GHOST 1-3, BASE OLD MEN e experimentos com nome livre ("OLHA A FRESQUINA", "VIVA A IGNORÂNCIA", "Os fins justificam os meios"…).',
        dicas: [
          'Cada composição é uma pasta com header + composition.sqe — o Eden lê direto de Documentos/…/compositions.',
          'Pra usar noutro PC: copia a pasta da composição pro mesmo caminho do perfil de lá. Aparece em Eden → Compositions → Custom.'
        ],
        link: { url: 'https://drive.google.com/drive/folders/15YZaipz9TSv58sIZwleMNi1lOY-HhU7v', rotulo: 'abrir compositions/ no Drive' }
      },
      {
        titulo: 'Composição = LEGO tático (como criar a sua)',
        texto: 'No Eden: seleciona os objetos (unidades, muros, torres, veículos — com waypoints e atributos), botão direito → Save Custom Composition. Ela guarda posições RELATIVAS: solta em qualquer mapa e o conjunto inteiro nasce montado. É o jeito profissional de construir base de KP Liberation/Antistasi rápido.',
        dicas: [
          'Composições aceitam scripts nos init dos objetos — uma base inteira com defesas scriptadas vira 1 clique.',
          'O Workshop também distribui composições (a coleção tem várias de FOB) — Subscribe e elas aparecem no mesmo menu.'
        ]
      }
    ]
  },
  {
    id: 'saves', nome: 'Saves & vars — onde as campanhas vivem', icon: '💾',
    desc: 'Os arquivos que guardam anos de campanha — e como cada formato funciona.',
    topicos: [
      {
        titulo: 'GHOST.vars.Arma3Profile — 27 MB de campanhas',
        texto: 'O .vars.Arma3Profile é o "banco de dados" do perfil: variáveis persistentes que missões salvam com profileNamespace. Campanhas dinâmicas (Vindicta, Antistasi, KP Liberation) salvam AQUI — não em savegame clássico. 27 MB = muitas campanhas acumuladas (Vindicta usa até 6 slots dentro dele).',
        dicas: [
          'Backup deste arquivo = backup das campanhas dinâmicas. É ELE que não pode se perder.',
          'Programador: profileNamespace setVariable ["chave", valor]; saveProfileNamespace; — é literalmente isso que os mods chamam.'
        ]
      },
      {
        titulo: 'AntistasiUltimate.vars — save dedicado',
        texto: 'O Antistasi Ultimate exporta o estado da guerra num .vars próprio (3,3 MB no Drive): territórios, agressão, arsenal do HQ, veículos. Junto ficam Saved/ e UserSaved/ (savegames clássicos de missão, formato binário do engine).',
        dicas: [
          'Save clássico (Saved/) = foto do momento; .vars = estado da CAMPANHA. Os dois coexistem.',
          'O save "morre" se os mods da sessão mudarem — mesma lista de mods, mesma ordem, e ele volta.'
        ]
      }
    ]
  },
  {
    id: 'anatomia', nome: 'Anatomia dos arquivos (nível programador)', icon: '🔬',
    desc: 'O que cada formato do Arma 3 é por dentro — pra quem quer mexer de verdade.',
    topicos: [
      {
        titulo: '.Arma3Profile — config em sintaxe de classe',
        texto: 'Texto puro com a MESMA sintaxe de classes dos configs do engine (estilo C): class DifficultyPresets { class CustomDifficulty { class Options { … } } }, arrays com nome[]={…}, ponto-e-vírgula obrigatório. É o formato "Param File" da Real Virtuality — o mesmo de description.ext e config.cpp de addon.',
        dicas: [
          'Editável no bloco de notas COM O JOGO FECHADO — o jogo reescreve ao sair.',
          'Quem sabe ler esse formato lê qualquer config de mod: é a gramática universal do engine.'
        ]
      },
      {
        titulo: 'PBO, bisign e bikey — o tripé dos addons',
        texto: 'PBO ("packed bank of objects") é o container de addon: um arquivo-pacote com header de entradas + dados (opcionalmente comprimidos LZSS). Cada PBO pode vir com um .bisign (assinatura digital gerada com a chave privada do autor); o servidor confere contra o .bikey público (pasta Keys/) — é assim que servidor recusa mod adulterado (verifySignatures=2).',
        dicas: [
          'Ferramentas oficiais nos Arma 3 Tools (Steam, grátis): BankRev extrai PBO, DSSignFile assina, Addon Builder empacota.',
          'Dentro do PBO: config.cpp (classes), model.cfg, p3d (modelos), paa (texturas) e os .sqf de script.'
        ]
      },
      {
        titulo: 'mission.sqm e a estrutura de uma missão',
        texto: 'Toda missão é uma pasta NomeDaMissao.NomeDoMapa (ex.: op1.Altis) com mission.sqm (o cenário serializado: unidades, marcadores, lógicas — hoje binarizado por padrão, o Eden alterna em Settings), description.ext (metadados, respawn, loadouts), init.sqf (script de arranque) e o resto dos scripts. O sufixo do mapa É o que diz onde ela abre.',
        dicas: [
          'missions/ vs mpmissions/ no servidor: SP/hosted vs dedicado.',
          'Missão do Workshop chega como PBO em 107410 — BankRev extrai e você estuda o código de qualquer missão que admira.'
        ]
      },
      {
        titulo: 'arma3.cfg, .rpt e os arquivos de suporte',
        texto: 'Documentos/Arma 3/arma3.cfg = vídeo global (resolução, GPU, refresh — o que o profile NÃO guarda). Os *.rpt (na raiz do perfil ou AppData) são os logs de execução: todo erro de script, addon faltando e crash fica registrado com timestamp. O Launcher guarda os próprios logs em AppData/Local/Bohemia_Interactive.',
        dicas: [
          'Parâmetro de inicialização -showScriptErrors mostra erro de SQF na tela — dev de missão joga SEMPRE com ele.',
          'O .rpt cresce sem limite: pode apagar os antigos sem dó.'
        ]
      },
      {
        titulo: 'O id do Workshop é a chave de tudo',
        texto: 'O número na URL do Workshop (ex.: …?id=463939057) é a identidade universal do item: nome da pasta em 107410, chave nos manifests do Steam (appworkshop_107410.acf), referência em preset HTML do Launcher e o que -mod= carrega. A coleção do site (id 3769819471) é só uma lista de ids — por isso dá pra reconstruir a instalação inteira a partir dela.',
        dicas: [
          'steamcmd baixa item sem abrir a Steam: workshop_download_item 107410 <id> — é assim que servidor dedicado atualiza mod.',
          'A aba Coleção desta página cataloga os 221 ids um a um.'
        ]
      }
    ]
  }
];

export const A3DRV_TOTAL = A3DRV_SECOES.reduce((n, s) => n + s.topicos.length, 0);
