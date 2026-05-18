/**
 * Currículo de Robótica do Baluarte (v2.0.0).
 *
 * 12 módulos do básico ao avançado. Cada módulo: resumo + tópicos-chave.
 */

export const ROBOTICA_MODULOS = [
  {
    id: 'historia',
    titulo: 'História da Robótica',
    icon: '◷',
    nivel: 'Básico',
    resumo:
      'A palavra "robô" nasceu em 1920, na peça tcheca R.U.R. de Karel Čapek — ' +
      'de "robota", trabalho forçado. Da automação industrial aos androides ' +
      'modernos, a robótica é a busca de máquinas que percebem, decidem e agem.',
    topicos: [
      { nome: 'Autômatos antigos', desc: 'Mecanismos gregos e árabes que imitavam seres vivos séculos antes da eletricidade.' },
      { nome: 'As Três Leis (Asimov)', desc: 'Em 1942 Isaac Asimov formulou as leis ficcionais que moldaram o imaginário da robótica.' },
      { nome: 'Unimate (1961)', desc: 'O primeiro robô industrial, instalado numa linha de montagem da General Motors.' },
      { nome: 'Era moderna', desc: 'Robôs móveis, drones, cirúrgicos e humanoides como Atlas e os de exploração espacial.' }
    ]
  },
  {
    id: 'anatomia',
    titulo: 'Anatomia de um Robô',
    icon: '⬡',
    nivel: 'Básico',
    resumo:
      'Todo robô combina três sistemas: SENTIR (sensores), PENSAR (controlador) ' +
      'e AGIR (atuadores). O ciclo sentir → pensar → agir, repetido muitas vezes ' +
      'por segundo, é a base de qualquer comportamento robótico.',
    topicos: [
      { nome: 'Estrutura', desc: 'O "corpo" — chassi, elos e juntas que sustentam tudo.' },
      { nome: 'Sensores', desc: 'Os "sentidos" — convertem o mundo físico em sinais elétricos.' },
      { nome: 'Atuadores', desc: 'Os "músculos" — motores que transformam energia em movimento.' },
      { nome: 'Controlador', desc: 'O "cérebro" — microcontrolador ou computador que decide o que fazer.' },
      { nome: 'Fonte de energia', desc: 'Baterias ou alimentação externa que mantêm o sistema vivo.' }
    ]
  },
  {
    id: 'tipos',
    titulo: 'Tipos de Robôs',
    icon: '◫',
    nivel: 'Básico',
    resumo:
      'Robôs são classificados pelo formato e pela aplicação. Cada categoria ' +
      'resolve uma classe de problema — da solda de carros à exploração de Marte.',
    topicos: [
      { nome: 'Manipuladores', desc: 'Braços fixos usados em indústria — solda, pintura, montagem.' },
      { nome: 'Móveis terrestres', desc: 'Robôs com rodas, esteiras ou pernas que se deslocam pelo ambiente.' },
      { nome: 'Aéreos (drones)', desc: 'VANTs para inspeção, mapeamento e entregas.' },
      { nome: 'Aquáticos', desc: 'ROVs e AUVs para exploração submarina.' },
      { nome: 'Humanoides', desc: 'Formato humano para operar em ambientes feitos para pessoas.' },
      { nome: 'Colaborativos (cobots)', desc: 'Projetados para trabalhar ao lado de humanos com segurança.' }
    ]
  },
  {
    id: 'sensores',
    titulo: 'Sensores',
    icon: '◉',
    nivel: 'Intermediário',
    resumo:
      'Sensores são os sentidos do robô. Sem eles, a máquina é cega e o controle ' +
      'vira "malha aberta" — pura suposição. Sensores fecham a malha, permitindo ' +
      'que o robô reaja ao que realmente acontece.',
    topicos: [
      { nome: 'Ultrassônico', desc: 'Mede distância pelo eco do som — barato e popular (HC-SR04).' },
      { nome: 'Infravermelho', desc: 'Detecta proximidade e segue linhas pelo reflexo de luz IR.' },
      { nome: 'LIDAR', desc: 'Varre o ambiente com laser e monta um mapa de distâncias preciso.' },
      { nome: 'Encoder', desc: 'Conta a rotação de um eixo — essencial para odometria.' },
      { nome: 'IMU', desc: 'Acelerômetro + giroscópio: mede orientação e aceleração.' },
      { nome: 'Câmera', desc: 'Fornece imagem para visão computacional e navegação.' }
    ]
  },
  {
    id: 'atuadores',
    titulo: 'Atuadores e Motores',
    icon: '⚙',
    nivel: 'Intermediário',
    resumo:
      'Atuadores transformam energia em movimento. A escolha do motor define ' +
      'força, velocidade e precisão — e quase sempre é um compromisso entre os três.',
    topicos: [
      { nome: 'Motor DC', desc: 'Gira continuamente; rápido, simples, mas sem controle fino de posição.' },
      { nome: 'Servomotor', desc: 'Gira até um ângulo exato — ideal para juntas de braços.' },
      { nome: 'Motor de passo', desc: 'Move-se em passos discretos e precisos sem precisar de encoder.' },
      { nome: 'Motor brushless', desc: 'Sem escovas: mais eficiente e durável — padrão em drones.' },
      { nome: 'Atuador linear', desc: 'Produz movimento em linha reta em vez de rotação.' },
      { nome: 'Driver / ponte H', desc: 'Circuito que controla sentido e velocidade do motor (L298N, etc.).' }
    ]
  },
  {
    id: 'eletronica',
    titulo: 'Eletrônica e Microcontroladores',
    icon: '⊞',
    nivel: 'Intermediário',
    resumo:
      'O microcontrolador é o cérebro acessível da robótica amadora e profissional. ' +
      'Entender GPIO, PWM e comunicação é o que liga o código ao mundo físico.',
    topicos: [
      { nome: 'Arduino', desc: 'Plataforma de entrada — fácil, robusta, enorme comunidade.' },
      { nome: 'Raspberry Pi', desc: 'Computador completo para tarefas pesadas como visão e ROS.' },
      { nome: 'ESP32', desc: 'Microcontrolador com Wi-Fi e Bluetooth integrados.' },
      { nome: 'GPIO', desc: 'Pinos digitais de entrada/saída que leem sensores e acionam atuadores.' },
      { nome: 'PWM', desc: 'Modulação por largura de pulso — controla velocidade e brilho.' },
      { nome: 'I2C / SPI / UART', desc: 'Protocolos que conectam o controlador a sensores e periféricos.' }
    ]
  },
  {
    id: 'cinematica',
    titulo: 'Cinemática e Movimento',
    icon: '◢',
    nivel: 'Intermediário',
    resumo:
      'Cinemática é a matemática do movimento. Ela responde: "se eu girar estas ' +
      'juntas, onde a garra vai parar?" — e a pergunta inversa, bem mais difícil.',
    topicos: [
      { nome: 'Graus de liberdade', desc: 'O número de movimentos independentes que o robô consegue fazer.' },
      { nome: 'Cinemática direta', desc: 'Dos ângulos das juntas calcula a posição da extremidade.' },
      { nome: 'Cinemática inversa', desc: 'Da posição desejada calcula os ângulos necessários — o problema difícil.' },
      { nome: 'Espaço de trabalho', desc: 'O volume que a garra do robô consegue alcançar.' },
      { nome: 'Trajetória', desc: 'O caminho suave (posição, velocidade, aceleração) entre dois pontos.' }
    ]
  },
  {
    id: 'controle',
    titulo: 'Controle e PID',
    icon: '∿',
    nivel: 'Avançado',
    resumo:
      'Controle é manter o robô fazendo o que você quer apesar de atrito, peso e ' +
      'ruído. O controlador PID é a ferramenta mais usada da engenharia para isso.',
    topicos: [
      { nome: 'Malha aberta × fechada', desc: 'Sem realimentação o robô "chuta"; com realimentação ele corrige.' },
      { nome: 'Erro', desc: 'A diferença entre o valor desejado (setpoint) e o medido.' },
      { nome: 'Proporcional (P)', desc: 'Corrige na medida do erro atual — quanto maior o erro, maior a ação.' },
      { nome: 'Integral (I)', desc: 'Acumula o erro passado e elimina o desvio residual.' },
      { nome: 'Derivativo (D)', desc: 'Antecipa o erro futuro e amortece oscilações.' },
      { nome: 'Sintonia', desc: 'Ajustar os ganhos Kp, Ki, Kd até a resposta ficar estável e rápida.' }
    ]
  },
  {
    id: 'programacao',
    titulo: 'Programação e ROS',
    icon: '⌨',
    nivel: 'Avançado',
    resumo:
      'Programar robôs vai além de ligar motores: envolve arquitetura de software, ' +
      'concorrência e o ROS, o "sistema operacional" de fato da robótica de pesquisa.',
    topicos: [
      { nome: 'Linguagens', desc: 'C/C++ para tempo real e baixo nível; Python para prototipagem e IA.' },
      { nome: 'ROS / ROS 2', desc: 'Framework com nós, tópicos e serviços que organizam robôs complexos.' },
      { nome: 'Máquina de estados', desc: 'Modela o comportamento do robô como estados e transições.' },
      { nome: 'Simulação', desc: 'Gazebo e Webots testam o robô em ambiente virtual antes do hardware.' },
      { nome: 'Tempo real', desc: 'Garantir que o controle responda dentro de prazos rígidos.' }
    ]
  },
  {
    id: 'visao',
    titulo: 'Visão Computacional',
    icon: '◎',
    nivel: 'Avançado',
    resumo:
      'Visão computacional dá ao robô o sentido mais rico de todos. De um mar de ' +
      'pixels, o robô precisa extrair objetos, distâncias e significado.',
    topicos: [
      { nome: 'Processamento de imagem', desc: 'Filtros, bordas e limiarização que limpam e realçam a imagem.' },
      { nome: 'Detecção de objetos', desc: 'Localizar e classificar o que aparece na cena.' },
      { nome: 'Visão estéreo', desc: 'Duas câmeras estimam profundidade como os olhos humanos.' },
      { nome: 'OpenCV', desc: 'A biblioteca padrão de visão computacional, aberta e madura.' },
      { nome: 'SLAM', desc: 'Mapear o ambiente e se localizar nele ao mesmo tempo.' }
    ]
  },
  {
    id: 'ia',
    titulo: 'Inteligência Artificial Aplicada',
    icon: '◈',
    nivel: 'Avançado',
    resumo:
      'A IA permite que o robô aprenda em vez de só seguir regras fixas. É o que ' +
      'separa um robô programado de um robô que se adapta ao inesperado.',
    topicos: [
      { nome: 'Aprendizado de máquina', desc: 'O robô extrai padrões de dados em vez de receber regras explícitas.' },
      { nome: 'Redes neurais', desc: 'Modelos inspirados no cérebro que reconhecem padrões complexos.' },
      { nome: 'Aprendizado por reforço', desc: 'O robô aprende por tentativa e erro, guiado por recompensas.' },
      { nome: 'Planejamento', desc: 'Algoritmos como A* que encontram o melhor caminho até um objetivo.' },
      { nome: 'Navegação autônoma', desc: 'Decidir rotas e desviar de obstáculos sem intervenção humana.' }
    ]
  },
  {
    id: 'etica',
    titulo: 'Ética e o Futuro',
    icon: '◇',
    nivel: 'Avançado',
    resumo:
      'Quanto mais capazes os robôs ficam, mais pesam as perguntas humanas: ' +
      'emprego, segurança, responsabilidade e autonomia. Engenharia também é ética.',
    topicos: [
      { nome: 'Automação e trabalho', desc: 'Como a robótica transforma — e desloca — empregos.' },
      { nome: 'Segurança', desc: 'Normas para que robôs operem perto de pessoas sem causar dano.' },
      { nome: 'Responsabilidade', desc: 'Quem responde quando um robô autônomo erra?' },
      { nome: 'Robôs e sociedade', desc: 'Assistência a idosos, medicina, exploração — e os riscos militares.' },
      { nome: 'O futuro próximo', desc: 'Enxames, humanoides de uso geral e robôs cada vez mais integrados à IA.' }
    ]
  }
];

export const ROBOTICA_TOTAL = ROBOTICA_MODULOS.length;
