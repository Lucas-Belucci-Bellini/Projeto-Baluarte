/**
 * Álbuns musicais — /musicas (issue #185).
 *
 * Cada álbum: capa + artista + ano + faixas. Para adicionar um álbum, copie um
 * bloco abaixo. Cada faixa: { titulo, url? } — se a url for do Spotify ou
 * SoundCloud, toca ao clicar (player embutido no próprio cartão).
 */

export const ALBUNS = [
  {
    titulo: 'Hinos do Imperador',
    artista: 'Coletânea W40K (SunoAI)',
    ano: 2024,
    capa: 'https://static.wikia.nocookie.net/fiction-battlefield/images/b/b5/Godemperor.jpg/revision/latest/scale-to-width-down/400?cb=20181230204113&path-prefix=pt-br',
    faixas: [
      { titulo: 'W40K — El Emperador, Dios de la Humanidad', url: 'https://soundcloud.com/izaac-luna-920602576/w40k-el-emperador-dios-de-la' },
      { titulo: 'W40K — Salamandras, Ángeles de la Humanidad', url: 'https://soundcloud.com/pablo-perez-157069405/w40k-salamandras-angeles-de-la' }
    ]
  }
];
