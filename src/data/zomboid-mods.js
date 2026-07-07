/**
 * Coleção "alfa" — modpack militar de Project Zomboid do Spartan Gamer BR.
 *
 * Vitrine no Baluarte da coleção da Steam Workshop (159 mods militares/táticos):
 * veículos, aeronaves, blindados, armamento, uniformes e utilidades. Aqui ficam
 * os metadados + os DESTAQUES curados por categoria (a lista completa vive na
 * Steam). Data-driven: pra adicionar um mod, é só empurrar no array certo.
 */

export const ZOMBOID_COLLECTION = {
  id: '3759068138',
  name: 'alfa',
  game: 'Project Zomboid',
  author: 'Spartan Gamer BR',
  total: 159,
  url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3759068138',
  tagline: 'Modpack militar tático — veículos, aeronaves, blindados e arsenal completo.',
  desc: 'Coleção curada de 159 mods com foco militar e de sobrevivência: frota de veículos, ' +
        'aeronaves, blindados, armamento, uniformes e mecânicas de combate — reunindo o trabalho ' +
        'de dezenas de modders num só pacote tático.'
};

/* Destaques por frente (amostra dos 159 — a lista completa está na Steam). */
export const ZOMBOID_CATEGORIES = [
  {
    id: 'veiculos', label: 'Veículos', icon: '🚗',
    desc: 'Frota KI5 — clássicos e ícones sobre rodas.',
    mods: [
      { name: "'73 Nissan Skyline", author: 'KI5' },
      { name: "'67 Shelby GT500", author: 'KI5' },
      { name: "'93 Ford Mustang", author: 'KI5' },
      { name: "'70 Dodge Challenger", author: 'KI5' },
      { name: 'Halo Warthog', author: 'KI5' }
    ]
  },
  {
    id: 'aeronaves', label: 'Aeronaves', icon: '🚁',
    desc: 'Asas rotativas — transporte e ataque.',
    mods: [
      { name: 'UH-60 Black Hawk', author: 'comunidade' },
      { name: 'AH-64A Apache', author: 'comunidade' },
      { name: 'AH-60 Black Hawk', author: 'comunidade' }
    ]
  },
  {
    id: 'blindados', label: 'Blindados', icon: '🛡️',
    desc: 'Aço pesado — do MBT ao transporte de tropa.',
    mods: [
      { name: 'M1 Abrams', author: 'comunidade' },
      { name: 'M577 APC', author: 'comunidade' },
      { name: 'LAV-300', author: 'comunidade' },
      { name: 'Bushmaster', author: 'comunidade' }
    ]
  },
  {
    id: 'uniformes', label: 'Uniformes & Equipamento', icon: '🎖️',
    desc: 'Camuflagem e gear tático.',
    mods: [
      { name: 'SWAT', author: 'comunidade' },
      { name: 'MARPAT', author: 'comunidade' },
      { name: 'Multicam (variantes)', author: 'comunidade' }
    ]
  },
  {
    id: 'mundo', label: 'Mundo & Estruturas', icon: '🏚️',
    desc: 'Locais e mecânicas que expandem o mapa.',
    mods: [
      { name: 'Heavens Hill (mansão)', author: 'comunidade' },
      { name: "Yumi's Fridge Expansion Deluxe", author: 'Yumi' }
    ]
  }
];
