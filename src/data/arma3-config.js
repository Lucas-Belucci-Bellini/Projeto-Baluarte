/**
 * BÍBLIA DE MODS DO ARMA 3 — instalar, configurar e resolver problema (pedido
 * do operador: "tudo que alguém possa precisar para mexer com os mods e
 * configurar eles"). Vale pro preset "projeto baluarte vercel app" e pra
 * qualquer coleção.
 *
 * Honestidade: caminhos/teclas são os padrões do Steam + Arma 3 Launcher +
 * CBA. Parâmetros de inicialização e nomes de menu podem mudar entre versões —
 * onde o valor "certo" depende da máquina, o texto manda conferir em vez de
 * cravar. Nada aqui pede login, senha ou dado pessoal.
 */

export const A3CFG_SECOES = [
  {
    id: 'instalar', nome: 'Instalar mods (do zero)', icon: '📥',
    desc: 'Do "nunca mexi com mod" ao jogo rodando com o preset — o caminho seguro.',
    topicos: [
      {
        titulo: 'De onde vêm os mods: Steam Workshop',
        texto: 'Quase todo mod do Arma 3 mora no Steam Workshop. ASSINAR um item (botão "+ Subscribe" na página) faz o Steam baixar e manter o mod atualizado sozinho. O Arma 3 Launcher lê o que você assinou e lista em MODS. Não existe "instalar .exe": é assinar no Workshop e ativar no Launcher.',
        atalhos: [['página do Workshop → + Subscribe', 'baixar e manter o mod atualizado'], ['Steam → Downloads', 'ver o progresso do download dos mods']],
        dicas: ['O preset deste site tem o link do Workshop em CADA mod (aba "Mods do preset") — assine todos por ali.', 'Mod grande (RHS, CUP) tem vários GB: deixe baixar por completo antes de abrir o jogo.']
      },
      {
        titulo: 'O atalho: importar o PRESET (arrastar e pronto)',
        texto: 'Em vez de assinar 105 mods na mão, use o preset: baixe o arquivo .html do preset (botão na Central de Modpacks) e ARRASTE ele pra dentro da janela do Arma 3 Launcher. O Launcher lê a lista, marca tudo e abre as páginas do Workshop pra você assinar em lote. É o jeito mais rápido de replicar a coleção inteira.',
        atalhos: [['arrastar o .html na janela do Launcher', 'importar o preset inteiro'], ['MODS → Preset → Import (canto sup. direito)', 'o mesmo, pelo menu']],
        dicas: ['Depois de importar, ainda é preciso ASSINAR os que faltam (o Launcher mostra quais).', 'Preset é só a LISTA — os arquivos vêm do Workshop mesmo.']
      },
      {
        titulo: 'Ativar e jogar',
        texto: 'Na aba MODS do Launcher, marque os mods (ou o preset importado) e clique PLAY. O Launcher monta a linha de comando com os mods e abre o jogo já modado. Primeira vez com muitos mods: o carregamento demora (ele indexa tudo) — normal.',
        atalhos: [['Launcher → MODS → marcar → PLAY', 'jogar com os mods ativos'], ['Launcher → Mods → "..." → Enable/Disable', 'ligar/desligar um mod individual']],
        dicas: ['Testou e algo quebrou? Desligue metade dos mods e vá pela metade (busca binária) pra achar o culpado.', 'Salve conjuntos diferentes como PRESETS locais (só-armas, milsim completo…) e troque num clique.']
      }
    ]
  },
  {
    id: 'ordem', nome: 'Ordem de load & dependências', icon: '🔗',
    desc: 'A causa nº 1 de "abre e crasha": ordem errada e dependência faltando.',
    topicos: [
      {
        titulo: 'A regra de ouro da ordem de carga',
        texto: 'A ordem importa: um mod que MODIFICA outro precisa carregar DEPOIS dele. A regra prática: CBA_A3 SEMPRE primeiro; depois os mods de base/conteúdo (RHS, CUP, ACE); por último os mods de COMPATIBILIDADE e patches ("X ACE compat", "Y RHS compat"). No Launcher, arraste os mods pra reordenar quando algum patch precisar vir depois do alvo.',
        atalhos: [['Launcher → MODS → arrastar o item', 'mudar a ordem de carga'], ['Launcher → Mods → Load order (coluna)', 'ver/forçar a sequência']],
        dicas: ['CBA no topo, compat mods no rodapé — 90% dos crashes de ordem somem com isso.', 'O FVL ACE3 Compat deste preset tem que vir DEPOIS do FVL e do ACE.']
      },
      {
        titulo: 'Dependências: o que "Required Items" quer dizer',
        texto: 'Todo mod lista no Workshop os "Required Items" (dependências) — sem eles, ele não carrega ou crasha. Na aba "Mods do preset" deste site, cada card mostra os chips REQUER com as dependências OFICIAIS. Exemplos do preset: quase tudo pede CBA_A3; a família TOTT pede RHSUSAF; o Trencher pede Chameleon Trenches + Terrain Lib; o LAFS pede o drone Crocus.',
        atalhos: [['card do mod (aba Mods) → chips REQUER', 'ver as dependências oficiais'], ['página do Workshop → Required Items', 'a fonte oficial da dependência']],
        dicas: ['"You cannot play/edit this mission, dependent downloadable content is missing" = falta uma dependência OU um DLC. Leia o nome que o erro cita.', 'Assinar o mod NÃO assina as dependências sozinho — assine cada Required Item.']
      },
      {
        titulo: 'Conflitos: quando dois mods brigam',
        texto: 'Dois mods que mexem na MESMA coisa podem conflitar. O caso vivo deste preset: EBI (EVEN Better Inventory) e Better Inventory são declarados INCOMPATÍVEIS pelo autor do EBI — ative UM por vez. Sinais de conflito: menu duplicado, item que some, erro de config no boot. Solução: descubra o par brigando (desligue um) e escolha.',
        atalhos: [['Launcher → desligar um dos dois', 'resolver conflito de par'], ['.rpt log (troubleshooting)', 'ver qual config duplicou']],
        dicas: ['Conflito de TECLA é diferente de conflito de mod — esse resolve no Configure Addons (aba de keybinds).', 'Na dúvida entre dois inventários/HUDs, rode um só: eles quase sempre disputam a mesma tela.']
      }
    ]
  },
  {
    id: 'cba', nome: 'Configurar: CBA Addon Options & teclas', icon: '🎛️',
    desc: 'Onde 90% dos mods deste preset guardam suas configurações e atalhos.',
    topicos: [
      {
        titulo: 'Addon Options — as configurações de cada mod',
        texto: 'A maioria dos mods baseados no CBA expõe suas opções em Esc → Options → Addon Options. Lá você regula ACE Medical (arcade↔realista), o radar do DUI (tamanho/o que aparece), os pesos do Simple Weight Limit, os coeficientes do Animated Recoil, e por aí. Dá pra salvar como GLOBAL (vale em tudo) ou por MISSÃO.',
        atalhos: [['Esc → Options → Addon Options', 'configurações de todos os mods CBA'], ['botão Global / Mission (no topo)', 'onde a configuração vale']],
        dicas: ['Configurou do seu jeito? Exporte (botão Export) e guarde — reimporta em qualquer PC.', 'Servidor pode FORÇAR configurações (ex.: ACE médico realista) — nesse caso as suas são ignoradas ali.']
      },
      {
        titulo: 'Configure Addons — trocar as teclas dos mods',
        texto: 'As teclas de mods CBA NÃO estão no menu de controle normal — moram em Esc → Options → Controls → Configure Addons (às vezes "Configure Addon Controls"). É lá que você define/troca: canting do GGE, corner shooting, deploy do Sniper Utilities, "Next Laser Function" do CBA (troca os modos dos lasers MCC), o menu do KzyxTools, etc.',
        atalhos: [['Esc → Options → Controls → Configure Addons', 'ver e trocar TODAS as teclas de mods'], ['campo da ação → clicar → apertar a tecla nova', 'rebindar']],
        dicas: ['Quando um card deste site diz "configurável", é AQUI que a tecla mora.', 'Anote suas teclas: reinstalar/limpar config zera tudo.']
      },
      {
        titulo: 'Conflito de teclas (o caso Zeus × Antistasi)',
        texto: 'Duas ações na mesma tecla = uma não funciona (ou as duas disparam). Achado real deste preset: o Zeus (tecla Y padrão) colide com o menu do jogador do Antistasi Ultimate (também Y). Solução: remapeie UMA das duas no Configure Addons / Controls. Regra geral: se um atalho "parou de funcionar" ao adicionar um mod, é conflito de tecla — não bug.',
        atalhos: [['Options → Controls (vanilla)', 'teclas do jogo base'], ['Options → Controls → Configure Addons', 'teclas dos mods'], ['campo em vermelho', 'o jogo marca a tecla já usada']],
        dicas: ['O jogo AVISA quando você tenta usar uma tecla ocupada — leia o aviso antes de confirmar.', 'Mantenha um "mapa de teclas" seu: com 105 mods, memória não basta.']
      }
    ]
  },
  {
    id: 'servidores', nome: 'Multiplayer com mods', icon: '🌐',
    desc: 'Entrar em servidor modado, chaves de assinatura e o que combinar com a galera.',
    topicos: [
      {
        titulo: 'Entrar num servidor que usa mods',
        texto: 'Servidor modado exige os MESMOS mods que ele roda. O jeito fácil: no Server Browser, clique no servidor e o Launcher mostra os mods dele — muitos deixam "juntar e baixar o que falta". O jeito robusto: o dono publica um preset (.html) e todos importam. Mods a mais que o servidor não usa geralmente tudo bem; mods de MENOS = não entra.',
        atalhos: [['Multiplayer → Server Browser → servidor → Join', 'o Launcher casa os mods'], ['importar o preset do servidor', 'garantir a lista idêntica']],
        dicas: ['Ping < 100 conta muito — filtre por ping no browser.', 'Servidor sério publica o preset dele; peça o .html se não achar.']
      },
      {
        titulo: 'Chaves de assinatura (bikeys) e verifySignatures',
        texto: 'Servidor com verificação de assinatura (verifySignatures) só aceita mods ASSINADOS cujas chaves (.bikey) ele conhece. Mods do Workshop já vêm assinados — na prática, o problema aparece com mod baixado fora do Workshop ou desatualizado. Sintoma: "You were kicked. BattlEye: ... signature". Solução: use a versão do Workshop e mantenha atualizado.',
        atalhos: [['—', 'assinatura é automática nos mods do Workshop']],
        dicas: ['Kick por assinatura quase sempre = mod desatualizado ou versão não-Workshop; reassine pelo Workshop.', 'Não tente burlar verifySignatures — é a segurança do servidor.']
      },
      {
        titulo: 'Combine com a galera: mesmo preset, mesma versão',
        texto: 'Co-op sem dor de cabeça: todos importam O MESMO preset e mantêm o Steam atualizando. Divergência de versão de um mod pesado (RHS, ACE) entre jogadores gera dessincronização e crash. Antes da sessão: todos abrem o Launcher, deixam o Steam terminar updates, e conferem que o preset é o mesmo.',
        atalhos: [['Launcher → Preset → Export', 'gerar o .html pra mandar pra galera'], ['Steam → deixar atualizar', 'igualar versões antes de jogar']],
        dicas: ['Um jogador com ACE de versão diferente derruba a missão médica inteira.', 'Combine também as ADDON OPTIONS que importam (dificuldade médica, etc.) — ou deixe o servidor forçar.']
      }
    ]
  },
  {
    id: 'performance', nome: 'Performance & parâmetros', icon: '🚀',
    desc: 'Com 105 mods, FPS é ouro — o que ajuda de verdade (e o que é lenda).',
    topicos: [
      {
        titulo: 'Parâmetros de inicialização no Launcher',
        texto: 'Na aba PARAMETERS do Launcher dá pra passar flags de inicialização. Os que costumam ajudar: alocar RAM/CPU corretamente e reduzir I/O de log. NÃO decore valores de fóruns antigos — muitos viraram padrão ou foram removidos. Regra honesta: mude UM parâmetro por vez e MEÇA (FPS antes/depois) em vez de colar uma "lista mágica".',
        atalhos: [['Launcher → PARAMETERS', 'flags de inicialização'], ['PARAMETERS → Basic / Advanced / All', 'do simples ao avançado']],
        dicas: ['O Arma 3 Performance Extension deste preset já ataca o gargalo de cálculo — deixe ativo.', 'Desconfie de "startup mágico" de vídeo antigo: teste e meça; o que não ajudar, tire.']
      },
      {
        titulo: 'Gráficos que mais pesam',
        texto: 'No Arma, os vilões de FPS são: View Distance e Object Distance (o maior de todos), Shadows, e a densidade de IA/objeto da missão. Baixar View/Object Distance costuma dar mais FPS que qualquer parâmetro. Sampling acima de 100% (super-resolução) derruba tudo — comece em 100%.',
        atalhos: [['Options → Video → General', 'View/Object Distance, Sampling'], ['Options → Video → Quality', 'sombras, texturas, objetos']],
        dicas: ['Missão de 200 IAs vai engasgar por mais forte que seja o PC — é o motor calculando cada uma.', 'Sombras em "Standard" já dá um respiro grande vs "Ultra".']
      },
      {
        titulo: 'Quando o culpado é um mod',
        texto: 'Alguns mods são naturalmente pesados (IA avançada, mods de gráfico, muita física). Se o FPS despencou depois de adicionar mods, faça a busca binária: desligue metade, meça; repita na metade culpada até achar o mod. Mods de IA (LAFS, SCAI) e de vegetação/gráfico são os primeiros suspeitos.',
        atalhos: [['Launcher → desligar metade dos mods → PLAY', 'busca binária do mod pesado']],
        dicas: ['Mod de IA que dá apoio de fogo dinâmico é ótimo E caro — vale o trade-off, mas saiba que ele custa.', 'Rode o mesmo teste no mesmo lugar/hora do dia pra a medição valer.']
      }
    ]
  },
  {
    id: 'troubleshooting', nome: 'Deu ruim? Troubleshooting', icon: '🔧',
    desc: 'Os erros clássicos do Arma modado e o que cada um significa.',
    topicos: [
      {
        titulo: '"You cannot play/edit this mission…" (dependência/DLC)',
        texto: 'Esse erro no menu de missão significa que falta um mod DEPENDENTE ou um DLC que a missão/mod exige. O texto costuma citar o nome. Confira: (1) o mod dependente está assinado e ativo? (2) é um DLC pago (o preset lista Reaction Forces, Expeditionary, Western Sahara)? DLC não tem como contornar — ou você tem, ou a missão não abre com o conteúdo dele.',
        atalhos: [['ler o nome citado no erro', 'ele diz o que falta'], ['aba Mods do preset → chips REQUER', 'conferir a cadeia de dependência']],
        dicas: ['90% desse erro é uma dependência desativada — reative e reordene (CBA no topo).', 'Modo Eden reclamando disso = você abriu uma missão feita com mod que não está ativo agora.']
      },
      {
        titulo: 'Crash no boot ou "Bad version / config"',
        texto: 'Crash logo ao carregar quase sempre é ORDEM ou DEPENDÊNCIA: um compat carregou antes do alvo, ou falta um Required Item. Cheque a ordem (CBA primeiro, compat por último) e as dependências. Se persistir, o arquivo de log (.rpt) aponta o mod/config culpado.',
        atalhos: [['Launcher → conferir Load order + dependências', 'a causa mais comum'], ['%LOCALAPPDATA%\\\\Arma 3\\\\ (.rpt mais recente)', 'o log do último boot']],
        dicas: ['O .rpt é texto: procure "ErrorMessage", "not found" ou o nome de um addon perto do fim.', 'Desligue tudo e reative em blocos até o crash voltar — o último bloco tem o culpado.']
      },
      {
        titulo: 'Achar o log (.rpt) e ler o essencial',
        texto: 'O Arma escreve um relatório (.rpt) a cada execução. Ele é a caixa-preta: erros de config, addon faltando e scripts quebrados aparecem lá. No Windows fica em %LOCALAPPDATA%\\Arma 3\\. Abra o mais recente num editor de texto e vá pro FIM — o que quebrou costuma estar nas últimas linhas.',
        atalhos: [['Win+R → %LOCALAPPDATA%\\\\Arma 3\\\\', 'pasta dos logs .rpt'], ['abrir o .rpt mais novo → ir pro fim', 'onde o erro final aparece']],
        dicas: ['Vai pedir ajuda num fórum/Discord? Cole as últimas ~30 linhas do .rpt — é o que resolve.', 'Nunca poste o .rpt inteiro cru: é gigante; recorte o trecho do erro.']
      },
      {
        titulo: 'Atualizou e quebrou (o "estava funcionando ontem")',
        texto: 'Mod do Workshop atualiza sozinho — e às vezes uma atualização de um mod-base (CBA, ACE, RHS) quebra um compat que ainda não atualizou. Sintomas: erro de config novo sem você mexer em nada. Espere o compat atualizar, ou role o mod-base pra versão anterior se o Workshop permitir, ou desative o compat problemático até ele acompanhar.',
        atalhos: [['Steam → Workshop → histórico de updates do mod', 'ver o que mudou'], ['Launcher → desativar o compat quebrado', 'jogar até o autor atualizar']],
        dicas: ['Update do CBA costuma ser o gatilho: ele é a base de tudo.', 'Antes de evento importante, evite atualizar mods na última hora.']
      }
    ]
  }
];

export const A3CFG_TOTAL_TOPICOS = A3CFG_SECOES.reduce((n, s) => n + s.topicos.length, 0);
