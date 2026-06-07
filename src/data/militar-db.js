/**
 * Banco de dados militar — base de conhecimento estruturada da Seção Militar.
 *
 * Fatos compilados de fontes públicas (Wikipedia, CC BY-SA; SIPRI 2024 para
 * gastos). Descrições são originais/resumidas — não reproduzem o texto-fonte.
 * Pensado para crescer: cada categoria é um array; adicione itens à vontade.
 *
 * Consumido pela página /enciclopedia-militar (e disponível para o J.A.R.V.I.S.).
 */

/* ===== Ramos das Forças Armadas ===== */
export const BRANCHES = [
  { id: 'army', nome: 'Exército', icon: '⊕', dominio: 'Terra', resumo: 'Força terrestre principal: infantaria, blindados, artilharia e engenharia para conquistar e manter território.' },
  { id: 'navy', nome: 'Marinha', icon: '⚓', dominio: 'Mar', resumo: 'Projeção de poder pelo mar: navios de superfície, submarinos e porta-aviões; controla rotas e nega o mar ao inimigo.' },
  { id: 'air', nome: 'Força Aérea', icon: '✈', dominio: 'Ar', resumo: 'Superioridade aérea, ataque, transporte e reconhecimento; caças, bombardeiros e apoio aéreo aproximado.' },
  { id: 'marines', nome: 'Fuzileiros Navais', icon: '⚔', dominio: 'Anfíbio', resumo: 'Força expedicionária de assalto anfíbio — combina mar, terra e ar para tomar praias e bases.' },
  { id: 'coast', nome: 'Guarda Costeira', icon: '⛴', dominio: 'Litoral', resumo: 'Segurança marítima, busca e salvamento, interdição e patrulha das águas costeiras.' },
  { id: 'space', nome: 'Força Espacial', icon: '🛰', dominio: 'Espaço', resumo: 'Satélites, vigilância orbital, alerta de mísseis e domínio do espaço — ramo mais recente.' },
  { id: 'sof', nome: 'Forças Especiais', icon: '✷', dominio: 'Multi', resumo: 'Operações especiais: reconhecimento profundo, ação direta, contraterrorismo e guerra não-convencional.' },
  { id: 'cyber', nome: 'Força Cibernética', icon: '⌬', dominio: 'Cyber', resumo: 'Defesa e ataque em redes, guerra eletrônica e proteção de sistemas de comando e controle.' },
  { id: 'border', nome: 'Guarda de Fronteira', icon: '⛬', dominio: 'Fronteira', resumo: 'Vigilância e defesa das fronteiras terrestres; muitas vezes paramilitar.' }
];

/* ===== Especialidades / funções ===== */
export const SPECIALTIES = [
  { nome: 'Estado-Maior', resumo: 'Planejamento, coordenação e assessoria ao comando.' },
  { nome: 'Engenheiros de Combate', resumo: 'Fortificações, pontes, desminagem e demolições.' },
  { nome: 'Inteligência Militar', resumo: 'Coleta e análise de ameaças e do ambiente operacional.' },
  { nome: 'Reconhecimento', resumo: 'Observação avançada e obtenção de dados do inimigo.' },
  { nome: 'Corpo Médico', resumo: 'Atendimento, evacuação e medicina de combate.' },
  { nome: 'Polícia Militar', resumo: 'Disciplina, segurança de retaguarda e prisioneiros.' },
  { nome: 'Mergulho de Combate', resumo: 'Operações subaquáticas e sabotagem naval.' },
  { nome: 'Comunicações / Sinais', resumo: 'Redes táticas, criptografia e guerra eletrônica.' }
];

/* ===== Estrutura de unidades terrestres (efetivo aproximado) ===== */
export const UNIT_STRUCTURE = [
  { nome: 'Esquadra / Fireteam', efetivo: '4–13', comando: 'Cabo / Sargento', simbolo: 'Ø' },
  { nome: 'Pelotão', efetivo: '26–55', comando: 'Tenente', simbolo: '•••' },
  { nome: 'Companhia', efetivo: '80–250', comando: 'Capitão / Major', simbolo: 'I' },
  { nome: 'Batalhão', efetivo: '300–1.000', comando: 'Tenente-Coronel', simbolo: 'II' },
  { nome: 'Regimento / Brigada', efetivo: '1.500–3.500', comando: 'Coronel / Gen. Brigada', simbolo: 'X' },
  { nome: 'Divisão', efetivo: '10.000–25.000', comando: 'General de Divisão', simbolo: 'XX' },
  { nome: 'Corpo de Exército', efetivo: '25.000–50.000', comando: 'Tenente-General', simbolo: 'XXX' },
  { nome: 'Exército de Campo', efetivo: '100.000–300.000', comando: 'General', simbolo: 'XXXX' },
  { nome: 'Grupo de Exércitos', efetivo: '400.000+', comando: 'General / Marechal', simbolo: 'XXXXX' }
];

/* ===== Espaço de batalha (domínios) ===== */
export const BATTLESPACE = [
  { nome: 'Terra', resumo: 'Combate terrestre: regiões frias, deserto, selva, montanha, urbano e subterrâneo.', sub: ['Cold-region', 'Deserto', 'Selva', 'Montanha', 'Urbano', 'Subterrâneo'] },
  { nome: 'Mar', resumo: 'Guerra naval em águas azuis (oceânica), verdes e marrons (costeira/fluvial), superfície e submarina.', sub: ['Anfíbia', 'Águas azuis', 'Águas marrons', 'Superfície', 'Submarina'] },
  { nome: 'Ar', resumo: 'Superioridade aérea, aerotransporte e ataque; manobra de combate aéreo.', sub: ['Aérea', 'Aerotransportada', 'Apoio aéreo'] },
  { nome: 'Espaço', resumo: 'Satélites, vigilância e negação orbital; domínio cada vez mais estratégico.', sub: ['Reconhecimento orbital', 'Alerta de mísseis'] },
  { nome: 'Cibernético', resumo: 'Ataque e defesa de redes, sistemas de C2 e infraestrutura crítica.', sub: ['Ofensivo', 'Defensivo'] },
  { nome: 'Informação', resumo: 'Guerra de informação, desinformação e operações psicológicas.', sub: ['PSYOP', 'Desinformação'] }
];

/* ===== Tipos de guerra / warfare ===== */
export const WARFARE_TYPES = [
  { nome: 'Armas combinadas', resumo: 'Integra infantaria, blindados, artilharia e ar para efeito sinérgico.' },
  { nome: 'Guerra blindada', resumo: 'Emprego massivo de tanques e veículos de combate para ruptura e manobra.' },
  { nome: 'Artilharia', resumo: 'Fogo indireto de canhões, obuses e foguetes para suprimir e destruir.' },
  { nome: 'Guerra anfíbia', resumo: 'Assalto do mar para a terra com fuzileiros e meios de desembarque.' },
  { nome: 'Guerra de trincheiras', resumo: 'Defesa fortificada e estática; marcou a Primeira Guerra Mundial.' },
  { nome: 'Guerrilha', resumo: 'Ataques de pequenas unidades irregulares: emboscada e hit-and-run.' },
  { nome: 'Guerra de drones', resumo: 'UAVs e munições de vagueio para reconhecimento e ataque de precisão.' },
  { nome: 'Guerra eletrônica', resumo: 'Bloqueio, interceptação e engano de sensores e comunicações.' },
  { nome: 'Guerra nuclear', resumo: 'Armas de destruição em massa; dissuasão e destruição mútua assegurada.' },
  { nome: 'Guerra química', resumo: 'Agentes tóxicos; banida por convenções internacionais.' },
  { nome: 'Guerra biológica', resumo: 'Patógenos como arma; proibida por tratado.' },
  { nome: 'Guerra psicológica', resumo: 'Mina a moral e a vontade de combater do inimigo.' },
  { nome: 'Guerra cibernética', resumo: 'Ataques digitais a sistemas militares e civis.' },
  { nome: 'Guerra de informação', resumo: 'Ataca comando, comunicações e bancos de dados.' }
];

/* ===== Níveis da guerra ===== */
export const WAR_LEVELS = [
  { nome: 'Estratégico', escopo: 'Meses a anos', resumo: 'Define os objetivos da guerra e aloca recursos nacionais; subordina o militar à política.' },
  { nome: 'Operacional', escopo: 'Semanas a um mês', resumo: 'Liga táticas a estratégia; campanhas conduzidas por exércitos de campo e corpos.' },
  { nome: 'Tático', escopo: 'Horas a dias', resumo: 'Engajamento direto do inimigo por unidades (do pelotão à divisão).' }
];

/* ===== Táticas notáveis ===== */
export const TACTICS = [
  { nome: 'Emboscada', resumo: 'Ataque-surpresa de posição oculta.' },
  { nome: 'Envolvimento', resumo: 'Ataca o flanco/retaguarda enquanto fixa a frente.' },
  { nome: 'Cerco / Encirclement', resumo: 'Isola e cerca a força inimiga.' },
  { nome: 'Carga', resumo: 'Avanço rápido e em massa para o choque.' },
  { nome: 'Hit-and-run', resumo: 'Golpe rápido seguido de retirada; típico de guerrilha.' },
  { nome: 'Swarming', resumo: 'Convergência de múltiplas unidades sobre um alvo.' },
  { nome: 'Combate em ambiente fechado (CQC)', resumo: 'Combate a curtíssima distância, urbano/interiores.' },
  { nome: 'Defesa em ponto forte (foxhole)', resumo: 'Posições preparadas para resistir ao avanço.' },
  { nome: 'Saturação de alvo', resumo: 'Sobrecarrega as defesas com volume de fogo.' },
  { nome: 'Contra-ataque', resumo: 'Resposta ofensiva imediata após absorver um ataque.' },
  { nome: 'Guerra de trincheiras', resumo: 'Linhas fortificadas e terra de ninguém.' },
  { nome: 'Assalto aéreo', resumo: 'Inserção rápida de tropas por helicóptero.' }
];

/* ===== Estratégias e conceitos ===== */
export const STRATEGIES = [
  { nome: 'Blitzkrieg', resumo: 'Guerra-relâmpago: velocidade, blindados e ar para romper e cercar.' },
  { nome: 'Guerra de atrito', resumo: 'Desgastar o inimigo até o colapso de recursos e moral.' },
  { nome: 'Operação profunda', resumo: 'Ataca a profundidade do dispositivo inimigo, não só a linha de frente.' },
  { nome: 'Guerra de manobra', resumo: 'Quebra a coesão inimiga por movimento, não por desgaste.' },
  { nome: 'Defesa em profundidade', resumo: 'Camadas sucessivas que absorvem e drenam o avanço.' },
  { nome: 'Terra arrasada', resumo: 'Destrói recursos para negá-los ao inimigo.' },
  { nome: 'Estratégia fabiana', resumo: 'Evita a batalha decisiva; desgasta com pequenas ações.' },
  { nome: 'Bloqueio', resumo: 'Corta o abastecimento marítimo/terrestre do inimigo.' },
  { nome: 'Dissuasão (deterrence)', resumo: 'Evita o ataque pela ameaça crível de retaliação.' },
  { nome: 'A2/AD (anti-acesso)', resumo: 'Nega ao inimigo a entrada e a manobra numa região.' }
];

/* ===== Teoria e princípios ===== */
export const CONCEPTS = [
  { nome: 'Supremacia aérea', resumo: 'Controle do ar que permite operar sem oposição efetiva.' },
  { nome: 'Comando do mar', resumo: 'Domínio das linhas marítimas de comunicação.' },
  { nome: 'Multiplicação de força', resumo: 'Fatores (moral, tecnologia, terreno) que ampliam o poder de combate.' },
  { nome: 'Leis de Lanchester', resumo: 'Modelos matemáticos que relacionam número e poder de fogo ao resultado.' },
  { nome: 'Centro de gravidade', resumo: 'Fonte de poder cuja queda colapsa o inimigo (Clausewitz).' },
  { nome: 'Projeção de poder', resumo: 'Capacidade de aplicar força militar longe das próprias bases.' },
  { nome: 'Moral', resumo: '"O homem ainda é a primeira arma da guerra" — fator humano decisivo.' },
  { nome: 'Domínio de espectro total', resumo: 'Superioridade simultânea em terra, mar, ar, espaço e cyber.' }
];

/* ===== Eras da tecnologia militar ===== */
export const TECH_ERAS = [
  { era: 'Idade da Pedra', marco: 'Lança com ponta de sílex — primeira tecnologia aplicada à arma.' },
  { era: 'Bronze e Ferro', marco: 'Espadas, escudos e a cavalaria; armaduras cada vez melhores.' },
  { era: 'Pólvora', marco: 'Mosquete e canhão encerram o domínio do cavaleiro blindado.' },
  { era: 'Industrial', marco: 'Metralhadora, fuzil de repetição e artilharia de retrocarga.' },
  { era: '1ª Guerra Mundial', marco: 'Tanques, aviação e guerra química rompem o impasse das trincheiras.' },
  { era: '2ª Guerra Mundial', marco: 'Radar, jato, míssil guiado, penicilina e a arma nuclear.' },
  { era: 'Guerra Fria', marco: 'Corrida armamentista institucionalizada; MBTs, mísseis e satélites.' },
  { era: 'Era da Informação', marco: 'Mísseis de precisão, drones, guerra eletrônica e reconhecimento espacial.' }
];

/* ===== Direito e ética da guerra ===== */
export const LAW_OF_WAR = [
  { nome: 'Convenções de Genebra', resumo: 'Protegem feridos, prisioneiros e civis em conflito.' },
  { nome: 'Crime de guerra', resumo: 'Violações graves do direito da guerra, sujeitas a julgamento.' },
  { nome: 'Regras de engajamento', resumo: 'Definem quando e como a força pode ser usada.' },
  { nome: 'Combatente legal / ilegal', resumo: 'Status que determina proteções e responsabilidades.' },
  { nome: 'Corte marcial', resumo: 'Justiça militar para crimes e infrações disciplinares.' },
  { nome: 'Objeção de consciência', resumo: 'Recusa a ordem imoral/ilegal em alguns países.' },
  { nome: 'Lei marcial', resumo: 'Governo militar temporário em emergência.' },
  { nome: 'Armas proibidas (WMD)', resumo: 'Banimento internacional de químicas, biológicas e uso de nucleares.' }
];

/* ===== Gastos militares — SIPRI 2024, % do PIB (top 25) ===== */
export const SPENDING_GDP = [
  { pais: 'Ucrânia', v: 34.5 }, { pais: 'Israel', v: 8.8 }, { pais: 'Argélia', v: 8.0 },
  { pais: 'Arábia Saudita', v: 7.3 }, { pais: 'Rússia', v: 7.1 }, { pais: 'Myanmar', v: 6.8 },
  { pais: 'Omã', v: 5.6 }, { pais: 'Armênia', v: 5.5 }, { pais: 'Azerbaijão', v: 5.0 },
  { pais: 'Kuwait', v: 4.8 }, { pais: 'Jordânia', v: 4.8 }, { pais: 'Burkina Faso', v: 4.7 },
  { pais: 'Mali', v: 4.2 }, { pais: 'Polônia', v: 4.2 }, { pais: 'Burundi', v: 3.8 },
  { pais: 'Brunei', v: 3.6 }, { pais: 'Marrocos', v: 3.5 }, { pais: 'EUA', v: 3.4 },
  { pais: 'Estônia', v: 3.4 }, { pais: 'Colômbia', v: 3.4 }, { pais: 'Letônia', v: 3.3 },
  { pais: 'Grécia', v: 3.1 }, { pais: 'Lituânia', v: 3.1 }, { pais: 'Chade', v: 3.0 },
  { pais: 'Quirguistão', v: 3.0 }
];

/* ===== Gastos militares — SIPRI 2024, US$ bi por PPP (top 25) ===== */
export const SPENDING_PPP = [
  { pais: 'EUA', v: 997 }, { pais: 'China', v: 567 }, { pais: 'Rússia', v: 401 },
  { pais: 'Índia', v: 308 }, { pais: 'Ucrânia', v: 183 }, { pais: 'Alemanha', v: 99 },
  { pais: 'Coreia do Sul', v: 96 }, { pais: 'Japão', v: 91 }, { pais: 'França', v: 91 },
  { pais: 'Reino Unido', v: 86 }, { pais: 'Brasil', v: 64 }, { pais: 'Polônia', v: 62 },
  { pais: 'Itália', v: 60 }, { pais: 'Turquia', v: 59 }, { pais: 'Indonésia', v: 47 },
  { pais: 'Colômbia', v: 43 }, { pais: 'México', v: 40 }, { pais: 'Espanha', v: 39 },
  { pais: 'Austrália', v: 31 }, { pais: 'Canadá', v: 31 }, { pais: 'Países Baixos', v: 21 },
  { pais: 'Filipinas', v: 21 }, { pais: 'Romênia', v: 21 }, { pais: 'Grécia', v: 17 },
  { pais: 'Malásia', v: 14 }
];

/* Índice de categorias (para a página navegar). */
export const MILITAR_CATEGORIAS = [
  { id: 'branches', titulo: 'Ramos das Forças', icon: '⊕', data: BRANCHES, tipo: 'cards' },
  { id: 'specialties', titulo: 'Especialidades', icon: '✚', data: SPECIALTIES, tipo: 'list' },
  { id: 'units', titulo: 'Estrutura de Unidades', icon: '▦', data: UNIT_STRUCTURE, tipo: 'units' },
  { id: 'battlespace', titulo: 'Espaço de Batalha', icon: '◎', data: BATTLESPACE, tipo: 'battlespace' },
  { id: 'warfare', titulo: 'Tipos de Guerra', icon: '⚔', data: WARFARE_TYPES, tipo: 'list' },
  { id: 'levels', titulo: 'Níveis da Guerra', icon: '⊿', data: WAR_LEVELS, tipo: 'levels' },
  { id: 'tactics', titulo: 'Táticas', icon: '✶', data: TACTICS, tipo: 'list' },
  { id: 'strategies', titulo: 'Estratégias', icon: '◈', data: STRATEGIES, tipo: 'list' },
  { id: 'concepts', titulo: 'Teoria & Princípios', icon: '✸', data: CONCEPTS, tipo: 'list' },
  { id: 'tech', titulo: 'Eras da Tecnologia', icon: '⚙', data: TECH_ERAS, tipo: 'eras' },
  { id: 'law', titulo: 'Direito da Guerra', icon: '§', data: LAW_OF_WAR, tipo: 'list' },
  { id: 'spending-gdp', titulo: 'Gastos (% PIB)', icon: '％', data: SPENDING_GDP, tipo: 'rank-pct' },
  { id: 'spending-ppp', titulo: 'Gastos (US$ bi PPP)', icon: '＄', data: SPENDING_PPP, tipo: 'rank-bi' }
];

export const MILITAR_FONTES = 'Fatos compilados de fontes públicas: Wikipedia (CC BY-SA) e SIPRI 2024 (gastos militares).';
