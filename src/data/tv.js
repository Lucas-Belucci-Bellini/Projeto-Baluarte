/**
 * TV do Baluarte — 34 canais, cada um é uma playlist do YouTube.
 * A "grade" é gerada por horário: cada hora do dia tem um canal no ar
 * (rotação pelos 34 canais), então abrir a TV sempre mostra "algo passando".
 *
 * Canais com `videoIds` (array de IDs) tocam na ordem definida pelo array
 * (usado quando queremos forçar uma ordem custom — ex: reverso).
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
  { num: 16, name: 'Canal 16', playlistId: 'PLAdHZz43zz8DloHxbrO7d5HkJ53Uv1Dpb' },
  { num: 17, name: 'Canal 17', playlistId: 'PLslbmPsYWz4dd9TAstQag-H_kNQYVv9-M' },
  { num: 18, name: 'Canal 18', playlistId: 'PLslbmPsYWz4dd9TAstQag-H_kNQYVv9-M' },
  { num: 19, name: 'Canal 19', playlistId: 'PLEh3lVhmhs8i-z0tmnlXfo-C6mEQbloBJ' },
  { num: 20, name: 'Canal 20', playlistId: 'PLk_e6laOs_lQP0mhHoG63xnQtr8Tsc_sz' },
  { num: 21, name: 'Canal 21', playlistId: 'PL4_z5hB-Wq33gkaFhKaPy9Yo0CeiED8Rg' },
  { num: 22, name: 'Canal 22', playlistId: 'PLD40851E0E52E9080' },
  { num: 23, name: 'Canal 23', playlistId: 'PLQjUmLgt0aGTKFVtwqaMZijMGc0ScotFH' },
  { num: 24, name: 'Canal 24', playlistId: 'PLu7abxj8TkWUqPgC1jiE7r6-T6XIFRGtz' },
  {
    num: 25,
    name: 'Canal 25',
    playlistId: 'PLu7abxj8TkWVadkdLRKspwAakY-zF1IyE',
    /* Ordem REVERSA da playlist original (pedido do operador). */
    videoIds: [
      'nwOW7MaGxNA', 'Ys-M1mw9164', '48_cfxnjU0k', 'EW62geD1i4I', 'NJnnLqnOiOM',
      'aokhyuMadmg', 'bVJaps2bixo', 'ZEtq7V26Hb8', 'eyYPRa0pMWY', 'BYxJeotPFj0',
      'NdvJuEj1_DI', 'qg4UOLUKgBM', 'n3yYuPdtWgc', 'bUOcusHwtQ8', 'B-Rr569xZXo',
      'GqJK3siEIq0', 'z0cwhbziMys', 'ins7-qVXG3s', 'xao8oav4ekg', 'IrFlUORAS-Q',
      'TWvf1nsE_kQ', 'J_1Z_xDlges', 'RgW9IFUvLr4', '0Y8sy_0Nugw', 'CC4xVam-z4w'
    ]
  },
  { num: 26, name: 'Canal 26', playlistId: 'PLprgmSiHB2FoSP27MNJaopcWnOh-zBbgj' },
  { num: 27, name: 'Canal 27', playlistId: 'PL9hKdpBVqWZ53VtnnfFZYEdKKAFgfz4w6' },
  { num: 28, name: 'Canal 28', playlistId: 'PLMuGnpKpy0OXVCm_MrcUafISu2e9LsPld' },
  { num: 29, name: 'Canal 29', playlistId: 'PLMuGnpKpy0OU_hpqFqj-Bam0Duqd8zDnu' },
  { num: 30, name: 'Canal 30', playlistId: 'PLMuGnpKpy0OUdPbV_MltB8_pg-4uY54GY' },
  { num: 31, name: 'Canal 31', playlistId: 'PLMuGnpKpy0OXPXGrJmSnaxmwP2x4XUHUa' },
  { num: 32, name: 'Canal 32', playlistId: 'PLMuGnpKpy0OXfZKnU3o4Ox5-cvNEdzx-c' },
  { num: 33, name: 'Canal 33', playlistId: 'PLMuGnpKpy0OXfZKnU3o4Ox5-cvNEdzx-c' },
  { num: 34, name: 'Canal 34', playlistId: 'PL2Aen4YnIdjaGTrAlqRmMVNY1bpq-h3Kg' }
];

export const TOTAL_CHANNELS = TV_CHANNELS.length;

/** Canal no ar numa hora do dia (0-23). Rotação pelos canais ativos. */
export function channelForHour(hour) {
  const n = TV_CHANNELS.length;
  return TV_CHANNELS[(((hour % n) + n) % n)];
}

/** Grade do dia: 24 blocos de 1h com o canal de cada hora. */
export function dailySchedule() {
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, channel: channelForHour(h) }));
}
