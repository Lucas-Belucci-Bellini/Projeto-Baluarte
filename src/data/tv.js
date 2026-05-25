/**
 * TV do Baluarte — 16 canais, cada um é uma playlist do YouTube.
 * A "grade" é gerada por horário: cada hora do dia tem um canal no ar
 * (rotação pelos 16 canais), então abrir a TV sempre mostra "algo passando".
 */

export const TV_CHANNELS = [
  { num: 1,  name: 'Canal 1',  playlistId: 'PLAr322Yg8UkAhkdPzDURG6hRbUCOVi9UW' },
  { num: 2,  name: 'Canal 2',  playlistId: 'PLMuGnpKpy0OXlo-R7wzkr-bS2qkM0rVKh' },
  { num: 3,  name: 'Canal 3',  playlistId: 'PLmQE7tyAGR5fN9W0yVbu2Iu-pMRhL97SY' },
  { num: 4,  name: 'Canal 4',  playlistId: 'PLWxgd78JrPl6BbiJiL2SmH7W7Bhi_kjiD' },
  { num: 5,  name: 'Canal 5',  playlistId: 'PLfXXolPy7ryiiAs4vOunXAzMWvRKsWx2S' },
  { num: 6,  name: 'Canal 6',  playlistId: 'PLu7abxj8TkWV00fZEJSpRX-fWjM6_fO53' },
  { num: 7,  name: 'Canal 7',  playlistId: 'PLG6VCV39w7FauYSs85lLW9wJMod0KhsOT' },
  { num: 8,  name: 'Canal 8',  playlistId: 'PLELT-7RtEHSrzmkBh0lk1ghg5WiCAlmv3' },
  { num: 9,  name: 'Canal 9',  playlistId: 'PL8pZb7UEcd3-o5NZcg916O4jgVnrO8pq9' },
  { num: 10, name: 'Canal 10', playlistId: 'PLAdHZz43zz8ARd5OCLUvOuq9NovrEyIKE' },
  { num: 11, name: 'Canal 11', playlistId: 'PLprgmSiHB2FqZe_jAkMcWvXb0yixcC9Vw' },
  { num: 12, name: 'Canal 12', playlistId: 'PLwJPTYuMd_ub9CDT7aSUREyEbNd_HqcVm' },
  { num: 13, name: 'Canal 13', playlistId: 'PL6145727E46FF5FD4' },
  { num: 14, name: 'Canal 14', playlistId: 'PLjwAcgCR1ww3U9AtXjQaoE_h4HoiG_3jz' },
  { num: 15, name: 'Canal 15', playlistId: 'PLEZiAg2bYC7l_BC5sxy0oP-PMvH4poZ8e' },
  { num: 16, name: 'Canal 16', playlistId: 'PLAdHZz43zz8DloHxbrO7d5HkJ53Uv1Dpb' }
];

export const TOTAL_CHANNELS = TV_CHANNELS.length;

/** Canal no ar numa hora do dia (0-23). Rotação pelos 16 canais. */
export function channelForHour(hour) {
  const n = TV_CHANNELS.length;
  return TV_CHANNELS[(((hour % n) + n) % n)];
}

/** Grade do dia: 24 blocos de 1h com o canal de cada hora. */
export function dailySchedule() {
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, channel: channelForHour(h) }));
}
