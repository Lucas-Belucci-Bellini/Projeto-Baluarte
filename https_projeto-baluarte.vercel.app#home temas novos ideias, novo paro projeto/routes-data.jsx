// Routes catalog for Projeto Baluarte — Mark XIII
// All 41 routes registered in src/main.js, grouped by the 6 menu sections
// from the README plus the hidden Shadow gateway.

const BALUARTE_BASE = 'https://projeto-baluarte.vercel.app/#';

const BALUARTE_GROUPS = [
  {
    id: 'operacoes',
    title: 'Operações',
    subtitle: 'Ponte de comando e hub central da plataforma',
    routes: [
      { path: '/home',         label: 'Ponte de Comando',   desc: 'Painel inicial · status do sistema' },
      { path: '/ferramentas',  label: 'Hub de Ferramentas', desc: 'Catálogo navegável de todas as ferramentas' },
    ],
  },
  {
    id: 'ferramentas',
    title: 'Ferramentas',
    subtitle: 'Editor, terminal, calculadoras, laboratórios técnicos',
    routes: [
      { path: '/editor',          label: 'Editor de Código',    desc: '26 linguagens · multi-abas · runners' },
      { path: '/terminal',        label: 'Terminal Web',        desc: '60+ comandos POSIX · FS virtual · pipes' },
      { path: '/calc-cientifica', label: 'Calc. Científica',    desc: 'Funções trigonométricas, logs, mem.' },
      { path: '/calc-numerica',   label: 'Calc. Numérica',      desc: 'IEEE 754 · análise de bits' },
      { path: '/calculadoras',    label: 'Calculadoras (Hub)',  desc: 'Financeira · conversores · estatística · engenharia · saúde' },
      { path: '/tabela-verdade',  label: 'Tabela Verdade',      desc: 'Parser lógico · Karnaugh · Quine-McCluskey' },
      { path: '/cripto',          label: 'Lab de Cripto',       desc: 'César · Base64/32 · SHA · AES-GCM · Vigenère · Atbash · OTP' },
      { path: '/regex',           label: 'Lab de Regex',        desc: 'Tester com destaque · cheatsheet' },
      { path: '/graficos',        label: 'Gerador de Gráficos', desc: '12 tipos · Canvas 2D puro' },
      { path: '/simbolos',        label: 'Símbolos',            desc: '1200+ caracteres Unicode pesquisáveis' },
      { path: '/logic-sim',       label: 'Logic Sim',           desc: '14 portas · fios · propagação tempo-real' },
      { path: '/portas',          label: 'Portas Lógicas',      desc: 'Enciclopédia · CIs 7400/4000' },
      { path: '/morse',           label: 'Código Morse',        desc: 'Texto ↔ Morse · áudio · flash' },
      { path: '/json-studio',     label: 'JSON Studio',         desc: 'Formatador · validador · diff' },
      { path: '/qr-studio',       label: 'QR Studio',           desc: 'Gerador e leitor de QR codes' },
      { path: '/git-helper',      label: 'Git Helper',          desc: 'Cheatsheet de comandos Git' },
    ],
  },
  {
    id: 'conhecimento',
    title: 'Conhecimento',
    subtitle: 'Biblioteca narrativa, academia, currículo, enciclopédias',
    routes: [
      { path: '/biblioteca',       label: 'Biblioteca',       desc: 'Crônicas da Baluarte · 24 arcos · 1127 capítulos' },
      { path: '/academia',         label: 'Academia',         desc: '16 linguagens de programação · recursos externos' },
      { path: '/robotica',         label: 'Robótica',         desc: 'Currículo de 12 módulos' },
      { path: '/universo',         label: 'Universo',         desc: '10 universos narrativos cruzados' },
      { path: '/tabela-periodica', label: 'Tabela Periódica', desc: '118 elementos' },
      { path: '/modpack',          label: 'Modpack Minecraft',desc: 'Modpack curado' },
      { path: '/guia-pc',          label: 'Guia para Montar PC', desc: 'Guia completo de hardware' },
    ],
  },
  {
    id: 'midia',
    title: 'Mídia',
    subtitle: 'Áudio, vídeo, imagens, FFT, acervo cultural',
    routes: [
      { path: '/fft',     label: 'Visualizador FFT',  desc: '6 modos · mic · arquivo · oscilador · áudio do PC' },
      { path: '/media',   label: 'Media Hub',         desc: 'Player local de áudio/vídeo/imagem' },
      { path: '/videos',  label: 'Central de Vídeos', desc: 'Playlists temáticas' },
      { path: '/memes',   label: 'Arquivo de Memes',  desc: 'Catálogo curado dos memes de 2016' },
      { path: '/filmes',  label: 'Cinema',            desc: 'Acervo de filmes · player embutido' },
      { path: '/radio',   label: 'Rádio',             desc: 'Estações via stream' },
      { path: '/musicas', label: 'Músicas',           desc: 'Player de música' },
    ],
  },
  {
    id: 'tatico',
    title: 'Tático',
    subtitle: 'Catálogos militares, cibersegurança, economia ao vivo',
    routes: [
      { path: '/arsenal',  label: 'Arsenal',  desc: '251 itens · 15 categorias · armas / artilharia / drones / frota / aeronaves' },
      { path: '/elites',   label: 'Elites',   desc: '26 equipes operacionais ALFA → ZULU' },
      { path: '/ciberseg', label: 'CiberSeg', desc: 'Enciclopédia de cibersegurança' },
      { path: '/economia', label: 'Economia', desc: 'Cotações de câmbio e cripto ao vivo' },
    ],
  },
  {
    id: 'sistema',
    title: 'Sistema',
    subtitle: 'Assistentes IA, perfil do operador, metadados do projeto',
    routes: [
      { path: '/jarvis',          label: 'J.A.R.V.I.S.',           desc: '4 modos · local · Claude API · Ollama · agente' },
      { path: '/ia-proprietaria', label: 'IA Proprietária Mk.11',  desc: 'Sistema de Skills modular' },
      { path: '/perfil',          label: 'Perfil',                 desc: 'Identidade do operador · stats · configs' },
      { path: '/sobre',           label: 'Sobre o Projeto',        desc: 'História das 13 iterações' },
    ],
  },
  {
    id: 'oculto',
    title: 'Oculto',
    subtitle: 'Rota acessível via gateway hidden — Ponte Shadow',
    routes: [
      { path: '/shadow', label: 'Shadow', desc: 'Gateway oculto · easter egg' },
    ],
  },
];

window.BALUARTE_BASE = BALUARTE_BASE;
window.BALUARTE_GROUPS = BALUARTE_GROUPS;
