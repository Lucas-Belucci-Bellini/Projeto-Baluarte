/**
 * Cinema do Baluarte (v2.0.0).
 *
 * Catálogo dos filmes da pasta "filmes" do Drive-base. Cada filme toca
 * via embed do Google Drive (drive.google.com/file/d/{id}/preview).
 *
 * Observação: o embed só carrega se o arquivo estiver compartilhado
 * como "qualquer pessoa com o link" no Google Drive.
 */

export const FILMES = [
  {
    id: '1tuiYzOnnqHn4A2zlfQHIDQqQSBOI9Yth',
    titulo: 'Batman vs Superman: A Origem da Justiça',
    ano: 2016,
    genero: 'Super-herói',
    sinopse:
      'Temendo as ações de um Super-Homem com poder de um deus, Batman decide ' +
      'enfrentá-lo — enquanto o mundo debate de que tipo de herói realmente precisa.'
  },
  {
    id: '1qf46HxhtYAb_iB2wRaJnW00BhsBxx6p2',
    titulo: 'Batman: O Cavaleiro das Trevas Ressurge',
    ano: 2012,
    genero: 'Super-herói',
    sinopse:
      'Oito anos após assumir a culpa pela morte de Harvey Dent, Batman volta ' +
      'das sombras para enfrentar Bane, que ameaça reduzir Gotham a cinzas.'
  },
  {
    id: '1H8QuJg33Yed15LwZktLwH9Oir_qhF_6V',
    titulo: 'Transformers: O Lado Oculto da Lua',
    ano: 2011,
    genero: 'Ação / Ficção',
    sinopse:
      'Os Autobots descobrem uma nave Cybertroniana escondida na Lua e correm ' +
      'para alcançar sua tecnologia antes que os Decepticons a usem.'
  },
  {
    id: '1rolZHruUXJOiIqNaRqzPkpqi8TYFVaAh',
    titulo: 'Godzilla: Rei dos Monstros',
    ano: 2019,
    genero: 'Kaiju / Ação',
    sinopse:
      'A agência Monarch enfrenta uma batalha de titãs antigos — Godzilla, ' +
      'Mothra, Rodan e o rival de três cabeças, King Ghidorah.'
  },
  {
    id: '1euVcBBjigj6VNeb1vDdYo_BR8-g7ksCU',
    titulo: 'Godzilla',
    ano: 2014,
    genero: 'Kaiju / Ação',
    sinopse:
      'Quando criaturas pré-históricas gigantescas ressurgem, a humanidade fica ' +
      'no meio do caminho — e Godzilla emerge para restaurar o equilíbrio da natureza.'
  },
  {
    id: '1eDk2S2ekjSERrSt0ETqt99p70-5ayyvA',
    titulo: 'Godzilla (acervo)',
    ano: null,
    genero: 'Kaiju / Ação',
    sinopse:
      'Mais um título da franquia Godzilla no acervo. Toca direto pelo player.'
  },
  {
    id: '1emWRawqS_2JW1SFpEJqGUIknGgAZNGBG',
    titulo: 'Ben 10 / Generator Rex: Heróis Unidos',
    ano: 2011,
    genero: 'Animação',
    sinopse:
      'Ben Tennyson e Rex Salazar unem forças quando uma ameaça alienígena ' +
      'coloca em risco os dois universos.'
  },
  {
    id: '1ldiDLfhjfWIpRmcdQ4G3-9GqlnBVfWg2',
    titulo: 'Ben 10 (acervo)',
    ano: null,
    genero: 'Animação',
    sinopse: 'Filme da franquia Ben 10 no acervo. Toca direto pelo player.'
  },
  {
    id: '1NB4B1jkk6OnXfdSNJo-OHtqIXGnmeps2',
    titulo: 'Jogo do Dinheiro',
    ano: 2016,
    genero: 'Thriller',
    sinopse:
      'Um apresentador de TV de finanças e sua produtora são feitos reféns, ao ' +
      'vivo, por um investidor que perdeu tudo seguindo suas dicas.'
  },
  {
    id: '12C2mEkxM-bgv-5XFG6cUAMPX5svoH1eq',
    titulo: 'Vídeo do Acervo · 01',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1GIZ1_Gvhh5mTKFSkKOyi5sAF20VrZxU1',
    titulo: 'Vídeo do Acervo · 02',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1aqT2xYAk8LoFVcfdN9tybN2fHdWCG5hK',
    titulo: 'Vídeo do Acervo · 03',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1MRy68JVUMzPYwv6udBxdyJT7Vwsyxr4l',
    titulo: 'Vídeo do Acervo · 04',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1Gfmkml2jlQMYTRrMWfzrNDW1lzIkL9bx',
    titulo: 'Vídeo do Acervo · 05',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1sWXx0EZXzbWRAWnvMJ-OQyU_HWjmI9Xc',
    titulo: 'Vídeo do Acervo · 06',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1UsjtiNv-AYjlcyRZFp_iXvjawEGiUPnb',
    titulo: 'Vídeo do Acervo · 07',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1QbkkeJ5PxBEQLqOtKpAdn_aDGN0BJqnm',
    titulo: 'Vídeo do Acervo · 08',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1GJU575Aa1Fjx8ineBwOPkutTfLQf-7fB',
    titulo: 'Vídeo do Acervo · 09',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '14sQIb-7kaM-XRNmBTbf10AqsTghhnK_T',
    titulo: 'Vídeo do Acervo · 10',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  },
  {
    id: '1czqYiJ089CBMb2adlv5lDMj6_Ku0loR0',
    titulo: 'Vídeo do Acervo · 11',
    ano: null, genero: 'Acervo',
    sinopse: 'Arquivo de vídeo do acervo, título não catalogado. Toca direto pelo player.'
  }
];

/** Embed do player do Google Drive. */
export function filmeEmbedUrl(id) {
  return `https://drive.google.com/file/d/${id}/preview`;
}

export const FILMES_TOTAL = FILMES.length;
