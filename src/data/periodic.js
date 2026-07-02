/**
 * Tabela Periódica — 118 elementos (Fase 17).
 * Dados: símbolo, número, nome, massa, grupo, período, categoria.
 */

export const CATEGORIES_PT = {
  'alkali':       { label: 'Alcalino',                color: '#ff3355' },
  'alkaline':     { label: 'Alcalino-terroso',        color: '#ff6f3c' },
  'transition':   { label: 'Metal de transição',      color: '#ffaa00' },
  'post-transition': { label: 'Metal pós-transição',  color: '#a3a8b8' },
  'metalloid':    { label: 'Metaloide',               color: '#00ff88' },
  'nonmetal':     { label: 'Não-metal',               color: '#66ddff' },
  'halogen':      { label: 'Halogênio',               color: '#d4a24e' },
  'noble':        { label: 'Gás nobre',               color: '#e8c07a' },
  'lanthanide':   { label: 'Lantanídeo',              color: '#7c4dff' },
  'actinide':     { label: 'Actinídeo',               color: '#b15dff' },
  'unknown':      { label: 'Desconhecido',            color: '#93a4bf' }
};

/* Dataset compacto: [Z, símbolo, nome, massa, grupo, período, categoria]
 * massa em u (unidade unificada de massa atômica). Grupo: 1-18 ou 'L'/'A' (lantanídeos/actinídeos).
 */
const RAW = [
  [1,  'H',  'Hidrogênio',    1.008,   1,  1, 'nonmetal'],
  [2,  'He', 'Hélio',         4.0026,  18, 1, 'noble'],
  [3,  'Li', 'Lítio',         6.94,    1,  2, 'alkali'],
  [4,  'Be', 'Berílio',       9.0122,  2,  2, 'alkaline'],
  [5,  'B',  'Boro',          10.81,   13, 2, 'metalloid'],
  [6,  'C',  'Carbono',       12.011,  14, 2, 'nonmetal'],
  [7,  'N',  'Nitrogênio',    14.007,  15, 2, 'nonmetal'],
  [8,  'O',  'Oxigênio',      15.999,  16, 2, 'nonmetal'],
  [9,  'F',  'Flúor',         18.998,  17, 2, 'halogen'],
  [10, 'Ne', 'Neônio',        20.180,  18, 2, 'noble'],
  [11, 'Na', 'Sódio',         22.990,  1,  3, 'alkali'],
  [12, 'Mg', 'Magnésio',      24.305,  2,  3, 'alkaline'],
  [13, 'Al', 'Alumínio',      26.982,  13, 3, 'post-transition'],
  [14, 'Si', 'Silício',       28.085,  14, 3, 'metalloid'],
  [15, 'P',  'Fósforo',       30.974,  15, 3, 'nonmetal'],
  [16, 'S',  'Enxofre',       32.06,   16, 3, 'nonmetal'],
  [17, 'Cl', 'Cloro',         35.45,   17, 3, 'halogen'],
  [18, 'Ar', 'Argônio',       39.948,  18, 3, 'noble'],
  [19, 'K',  'Potássio',      39.098,  1,  4, 'alkali'],
  [20, 'Ca', 'Cálcio',        40.078,  2,  4, 'alkaline'],
  [21, 'Sc', 'Escândio',      44.956,  3,  4, 'transition'],
  [22, 'Ti', 'Titânio',       47.867,  4,  4, 'transition'],
  [23, 'V',  'Vanádio',       50.942,  5,  4, 'transition'],
  [24, 'Cr', 'Cromo',         51.996,  6,  4, 'transition'],
  [25, 'Mn', 'Manganês',      54.938,  7,  4, 'transition'],
  [26, 'Fe', 'Ferro',         55.845,  8,  4, 'transition'],
  [27, 'Co', 'Cobalto',       58.933,  9,  4, 'transition'],
  [28, 'Ni', 'Níquel',        58.693,  10, 4, 'transition'],
  [29, 'Cu', 'Cobre',         63.546,  11, 4, 'transition'],
  [30, 'Zn', 'Zinco',         65.38,   12, 4, 'transition'],
  [31, 'Ga', 'Gálio',         69.723,  13, 4, 'post-transition'],
  [32, 'Ge', 'Germânio',      72.630,  14, 4, 'metalloid'],
  [33, 'As', 'Arsênio',       74.922,  15, 4, 'metalloid'],
  [34, 'Se', 'Selênio',       78.971,  16, 4, 'nonmetal'],
  [35, 'Br', 'Bromo',         79.904,  17, 4, 'halogen'],
  [36, 'Kr', 'Criptônio',     83.798,  18, 4, 'noble'],
  [37, 'Rb', 'Rubídio',       85.468,  1,  5, 'alkali'],
  [38, 'Sr', 'Estrôncio',     87.62,   2,  5, 'alkaline'],
  [39, 'Y',  'Ítrio',         88.906,  3,  5, 'transition'],
  [40, 'Zr', 'Zircônio',      91.224,  4,  5, 'transition'],
  [41, 'Nb', 'Nióbio',        92.906,  5,  5, 'transition'],
  [42, 'Mo', 'Molibdênio',    95.95,   6,  5, 'transition'],
  [43, 'Tc', 'Tecnécio',      98,      7,  5, 'transition'],
  [44, 'Ru', 'Rutênio',       101.07,  8,  5, 'transition'],
  [45, 'Rh', 'Ródio',         102.91,  9,  5, 'transition'],
  [46, 'Pd', 'Paládio',       106.42,  10, 5, 'transition'],
  [47, 'Ag', 'Prata',         107.87,  11, 5, 'transition'],
  [48, 'Cd', 'Cádmio',        112.41,  12, 5, 'transition'],
  [49, 'In', 'Índio',         114.82,  13, 5, 'post-transition'],
  [50, 'Sn', 'Estanho',       118.71,  14, 5, 'post-transition'],
  [51, 'Sb', 'Antimônio',     121.76,  15, 5, 'metalloid'],
  [52, 'Te', 'Telúrio',       127.60,  16, 5, 'metalloid'],
  [53, 'I',  'Iodo',          126.90,  17, 5, 'halogen'],
  [54, 'Xe', 'Xenônio',       131.29,  18, 5, 'noble'],
  [55, 'Cs', 'Césio',         132.91,  1,  6, 'alkali'],
  [56, 'Ba', 'Bário',         137.33,  2,  6, 'alkaline'],
  [57, 'La', 'Lantânio',      138.91,  'L', 6, 'lanthanide'],
  [58, 'Ce', 'Cério',         140.12,  'L', 6, 'lanthanide'],
  [59, 'Pr', 'Praseodímio',   140.91,  'L', 6, 'lanthanide'],
  [60, 'Nd', 'Neodímio',      144.24,  'L', 6, 'lanthanide'],
  [61, 'Pm', 'Promécio',      145,     'L', 6, 'lanthanide'],
  [62, 'Sm', 'Samário',       150.36,  'L', 6, 'lanthanide'],
  [63, 'Eu', 'Európio',       151.96,  'L', 6, 'lanthanide'],
  [64, 'Gd', 'Gadolínio',     157.25,  'L', 6, 'lanthanide'],
  [65, 'Tb', 'Térbio',        158.93,  'L', 6, 'lanthanide'],
  [66, 'Dy', 'Disprósio',     162.50,  'L', 6, 'lanthanide'],
  [67, 'Ho', 'Hólmio',        164.93,  'L', 6, 'lanthanide'],
  [68, 'Er', 'Érbio',         167.26,  'L', 6, 'lanthanide'],
  [69, 'Tm', 'Túlio',         168.93,  'L', 6, 'lanthanide'],
  [70, 'Yb', 'Itérbio',       173.05,  'L', 6, 'lanthanide'],
  [71, 'Lu', 'Lutécio',       174.97,  'L', 6, 'lanthanide'],
  [72, 'Hf', 'Háfnio',        178.49,  4,  6, 'transition'],
  [73, 'Ta', 'Tântalo',       180.95,  5,  6, 'transition'],
  [74, 'W',  'Tungstênio',    183.84,  6,  6, 'transition'],
  [75, 'Re', 'Rênio',         186.21,  7,  6, 'transition'],
  [76, 'Os', 'Ósmio',         190.23,  8,  6, 'transition'],
  [77, 'Ir', 'Irídio',        192.22,  9,  6, 'transition'],
  [78, 'Pt', 'Platina',       195.08,  10, 6, 'transition'],
  [79, 'Au', 'Ouro',          196.97,  11, 6, 'transition'],
  [80, 'Hg', 'Mercúrio',      200.59,  12, 6, 'transition'],
  [81, 'Tl', 'Tálio',         204.38,  13, 6, 'post-transition'],
  [82, 'Pb', 'Chumbo',        207.2,   14, 6, 'post-transition'],
  [83, 'Bi', 'Bismuto',       208.98,  15, 6, 'post-transition'],
  [84, 'Po', 'Polônio',       209,     16, 6, 'metalloid'],
  [85, 'At', 'Astato',        210,     17, 6, 'halogen'],
  [86, 'Rn', 'Radônio',       222,     18, 6, 'noble'],
  [87, 'Fr', 'Frâncio',       223,     1,  7, 'alkali'],
  [88, 'Ra', 'Rádio',         226,     2,  7, 'alkaline'],
  [89, 'Ac', 'Actínio',       227,     'A', 7, 'actinide'],
  [90, 'Th', 'Tório',         232.04,  'A', 7, 'actinide'],
  [91, 'Pa', 'Protactínio',   231.04,  'A', 7, 'actinide'],
  [92, 'U',  'Urânio',        238.03,  'A', 7, 'actinide'],
  [93, 'Np', 'Netúnio',       237,     'A', 7, 'actinide'],
  [94, 'Pu', 'Plutônio',      244,     'A', 7, 'actinide'],
  [95, 'Am', 'Amerício',      243,     'A', 7, 'actinide'],
  [96, 'Cm', 'Cúrio',         247,     'A', 7, 'actinide'],
  [97, 'Bk', 'Berquélio',     247,     'A', 7, 'actinide'],
  [98, 'Cf', 'Califórnio',    251,     'A', 7, 'actinide'],
  [99, 'Es', 'Einstênio',     252,     'A', 7, 'actinide'],
  [100, 'Fm', 'Férmio',        257,    'A', 7, 'actinide'],
  [101, 'Md', 'Mendelévio',    258,    'A', 7, 'actinide'],
  [102, 'No', 'Nobélio',       259,    'A', 7, 'actinide'],
  [103, 'Lr', 'Laurêncio',     262,    'A', 7, 'actinide'],
  [104, 'Rf', 'Rutherfórdio',  267,    4,  7, 'transition'],
  [105, 'Db', 'Dúbnio',        268,    5,  7, 'transition'],
  [106, 'Sg', 'Seabórgio',     269,    6,  7, 'transition'],
  [107, 'Bh', 'Bóhrio',        270,    7,  7, 'transition'],
  [108, 'Hs', 'Hássio',        269,    8,  7, 'transition'],
  [109, 'Mt', 'Meitnério',     278,    9,  7, 'unknown'],
  [110, 'Ds', 'Darmstácio',    281,    10, 7, 'unknown'],
  [111, 'Rg', 'Roentgênio',    282,    11, 7, 'unknown'],
  [112, 'Cn', 'Copernício',    285,    12, 7, 'transition'],
  [113, 'Nh', 'Nihônio',       286,    13, 7, 'unknown'],
  [114, 'Fl', 'Fleróvio',      289,    14, 7, 'unknown'],
  [115, 'Mc', 'Moscóvio',      290,    15, 7, 'unknown'],
  [116, 'Lv', 'Livermório',    293,    16, 7, 'unknown'],
  [117, 'Ts', 'Tenessino',     294,    17, 7, 'unknown'],
  [118, 'Og', 'Oganessônio',   294,    18, 7, 'noble']
];

export const ELEMENTS = RAW.map(([z, symbol, name, mass, group, period, category]) => ({
  z, symbol, name, mass, group, period, category
}));

export const TOTAL_ELEMENTS = ELEMENTS.length;

export function findElement(z) {
  return ELEMENTS.find((e) => e.z === z) || null;
}

/**
 * Configuração eletrônica simplificada (aproximação Madelung).
 * Retorna string como "1s2 2s2 2p6 3s2 ...".
 */
export function electronConfig(z) {
  const orbitals = [
    ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6],
    ['4s', 2], ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10],
    ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10], ['6p', 6],
    ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6]
  ];
  let remaining = z;
  const out = [];
  for (const [label, max] of orbitals) {
    if (remaining <= 0) break;
    const n = Math.min(remaining, max);
    out.push(label + n);
    remaining -= n;
  }
  return out.join(' ');
}
