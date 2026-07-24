/**
 * Database de ARMAS do Arma 3 — estilo tabela da wiki de Fallout, porém com a
 * profundidade que nenhuma wiki de Arma 3 tem (issue #398). Esta é a base
 * VANILLA (jogo + DLCs); o arsenal modado ENORME (RHS, CUP, NIArms…) é
 * completado pela extração local dos PBOs do Drive — ver docs/HANDOFF-LOCAL.md.
 *
 * ⚠️ Regra de honestidade: aqui entram os fatos ESTÁVEIS e públicos (nome,
 * tipo, calibre, carregador, modos, DLC, zeroing). Os DECIMAIS EXATOS de config
 * (airFriction, hit) são a fonte definitiva e vêm da extração local (#398) —
 * por isso a velocidade de saída abaixo é a de REFERÊNCIA por calibre (aparece
 * no Arsenal/guia oficial), e a calculadora deixa o valor editável.
 */

/* Tipos (separadores da tabela, estilo Fallout "Base type") */
export const A3ARM_TIPOS = [
  { id: 'fuzil',    nome: 'Fuzis de assalto',            icon: '🔫', desc: 'A espinha dorsal da infantaria: 5.56/6.5/7.62, semi + automático, trilhos pra tudo.' },
  { id: 'dmr',      nome: 'Fuzis de precisão (DMR)',      icon: '🎯', desc: 'Alcance de tirador designado: semi-auto, calibres cheios, miras de médio/longo.' },
  { id: 'sniper',   nome: 'Snipers & anti-materiel',      icon: '🦅', desc: 'Ferrolho e semi de longo alcance — de .338 a 12.7mm que fura veículo leve.' },
  { id: 'smg',      nome: 'Submetralhadoras (SMG)',       icon: '💨', desc: 'CQB: cadência alta, 9mm/.45, compactas pra dentro de prédio e veículo.' },
  { id: 'lmg',      nome: 'Metralhadoras (LMG/MMG)',      icon: '🌾', desc: 'Fogo de supressão: caixa/cinto, bipé, o "muro de chumbo" do esquadrão.' },
  { id: 'pistola',  nome: 'Pistolas & revólveres',        icon: '🔩', desc: 'Secundária: saque rápido, o que sobra quando o primário seca.' },
  { id: 'lancador', nome: 'Lançadores (AT/AA)',           icon: '🚀', desc: 'Anti-tanque e anti-aéreo: guiado (trava) ou balístico (mira livre).' }
];

/* Velocidade de saída de REFERÊNCIA por família de calibre (m/s) + arrasto
 * relativo. Valor exato de airFriction/initSpeed por arma = extração local. */
export const A3ARM_CALIBRES = {
  '9x21mm':    { vel: 390, arrasto: 'alto',      classe: 'pistola/SMG', nota: 'Subsônico curto; cai rápido além de ~100 m.' },
  '.45 ACP':   { vel: 250, arrasto: 'muito alto', classe: 'pistola/SMG', nota: 'Pesado e lento — muito dano perto, péssimo alcance.' },
  '5.56mm':    { vel: 750, arrasto: 'médio',     classe: 'fuzil',       nota: '5.56×45 — leve, plano até ~300 m, pouca energia longe.' },
  '5.8mm':     { vel: 760, arrasto: 'médio',     classe: 'fuzil',       nota: 'Calibre do CAR-95 (CSAT Pacífico, Apex).' },
  '6.5mm':     { vel: 800, arrasto: 'baixo',     classe: 'fuzil/DMR',   nota: '6.5×39 caseless — o padrão OTAN 2035, ótimo equilíbrio alcance/dano.' },
  '7.62mm':    { vel: 833, arrasto: 'baixo',     classe: 'fuzil/DMR',   nota: '7.62×51 — energia cheia, o calibre dos DMR e das MMG mais leves.' },
  '7.62x39mm': { vel: 715, arrasto: 'médio',     classe: 'fuzil',       nota: 'Calibre do AK-12 (Contact) — mais dano perto, cai antes.' },
  '9.3mm':     { vel: 875, arrasto: 'baixo',     classe: 'DMR/MMG',     nota: '9.3×64 — o meio-termo entre fuzil e anti-materiel (Cyrus, Navid).' },
  '.338':      { vel: 900, arrasto: 'muito baixo', classe: 'sniper/MMG', nota: '.338 LM — trajetória plana e alcance longo (MAR-10, SPMG).' },
  '12.7x54mm': { vel: 300, arrasto: 'alto',      classe: 'DMR',         nota: 'Subsônico de propósito (ASP-1 Kir) — silencioso, arco alto.' },
  '12.7mm':    { vel: 900, arrasto: 'baixo',     classe: 'anti-materiel', nota: '12.7×99 (.50 BMG) — fura veículo leve, alcance de km.' }
};

/* Cada arma: id, nome, tipo, calibre, mag[], modos, rpm (~ cíclico), zeroing,
 * dlc, trilhos, obs. `vel` herda do calibre (referência) salvo override.
 * `img` fica vazio de propósito — a extração local (#398) aponta o ícone/render
 * "como no jogo". */
export const A3ARM = [
  /* ===== Fuzis de assalto ===== */
  { id: 'mx',       nome: 'MX 6.5 mm',            tipo: 'fuzil', faccao: 'OTAN', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 700, zeroing: '100–800 m', dlc: 'Base', trilhos: 'mira, lateral, cano', obs: 'Família MX (Mk-1) — o fuzil-padrão OTAN. Confiável e modular.' },
  { id: 'mxc',      nome: 'MXC 6.5 mm',           tipo: 'fuzil', faccao: 'OTAN', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 700, zeroing: '100–600 m', dlc: 'Base', trilhos: 'mira, lateral, cano', obs: 'Carabina do MX — cano curto pra CQB, menos alcance/estabilidade.' },
  { id: 'mx3gl',    nome: 'MX 3GL 6.5 mm',        tipo: 'fuzil', faccao: 'OTAN', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 700, zeroing: '100–800 m', dlc: 'Base', trilhos: 'mira + lança-granadas 3 tiros', obs: 'MX com UGL de tambor de 3 granadas 40 mm — apoio orgânico do rifleman.' },
  { id: 'katiba',   nome: 'Katiba 6.5 mm',        tipo: 'fuzil', faccao: 'CSAT', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 600, zeroing: '100–800 m', dlc: 'Base', trilhos: 'mira, lateral', obs: 'Bullpup do CSAT — compacto pro mesmo cano, recuo mais seco.' },
  { id: 'katibagl', nome: 'Katiba GL 6.5 mm',     tipo: 'fuzil', faccao: 'CSAT', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 600, zeroing: '100–800 m', dlc: 'Base', trilhos: 'mira + UGL', obs: 'Katiba com lança-granadas acoplado.' },
  { id: 'trg21',    nome: 'TRG-21 5.56 mm',       tipo: 'fuzil', faccao: 'AAF',  calibre: '5.56mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 750, zeroing: '100–800 m', dlc: 'Base', trilhos: 'mira, lateral', obs: 'Fuzil da AAF (Mk20) — 5.56 leve, plano perto, fraco no longo.' },
  { id: 'trg20',    nome: 'TRG-20 5.56 mm',       tipo: 'fuzil', faccao: 'AAF',  calibre: '5.56mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 750, zeroing: '100–600 m', dlc: 'Base', trilhos: 'mira, lateral', obs: 'Carabina do TRG.' },
  { id: 'spar16',   nome: 'SPAR-16 5.56 mm',      tipo: 'fuzil', faccao: 'OTAN (Apex)', calibre: '5.56mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 750, zeroing: '100–800 m', dlc: 'Apex', trilhos: 'mira, lateral, cano', obs: 'AR-15-like do Apex — forças especiais OTAN, muito modular.' },
  { id: 'spar16s',  nome: 'SPAR-16S 5.56 mm',     tipo: 'fuzil', faccao: 'OTAN (Apex)', calibre: '5.56mm', mag: [30, 100], modos: ['Semi', 'Auto'], rpm: 750, zeroing: '100–800 m', dlc: 'Apex', trilhos: 'mira, lateral, cano', obs: 'Variante de suporte — aceita tambor de 100 (fogo sustentado).' },
  { id: 'type115',  nome: 'Type 115 6.5 mm',      tipo: 'fuzil', faccao: 'CSAT (Apex)', calibre: '6.5mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 700, zeroing: '100–800 m', dlc: 'Apex', trilhos: 'mira, lateral, cano', obs: 'Fuzil caseless futurista do CSAT Viper — usa 6.5 mm caseless próprio.' },
  { id: 'car95',    nome: 'CAR-95 5.8 mm',        tipo: 'fuzil', faccao: 'CSAT Pacífico (Apex)', calibre: '5.8mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 650, zeroing: '100–800 m', dlc: 'Apex', trilhos: 'mira, lateral', obs: 'Bullpup do CSAT do Pacífico — calibre 5.8 mm próprio.' },
  { id: 'ak12',     nome: 'AK-12 7.62 mm',        tipo: 'fuzil', faccao: 'LDF/Spetsnaz (Contact)', calibre: '7.62x39mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 600, zeroing: '100–800 m', dlc: 'Contact', trilhos: 'mira, lateral', obs: 'Kalashnikov do Contact — 7.62×39, pancada perto, cai antes que 6.5.' },
  { id: 'ak12gl',   nome: 'AK-12 GL 7.62 mm',     tipo: 'fuzil', faccao: 'LDF/Spetsnaz (Contact)', calibre: '7.62x39mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 600, zeroing: '100–800 m', dlc: 'Contact', trilhos: 'mira + UGL', obs: 'AK-12 com lança-granadas.' },

  /* ===== DMR ===== */
  { id: 'mxm',      nome: 'MXM 6.5 mm',           tipo: 'dmr', faccao: 'OTAN', calibre: '6.5mm', mag: [30], modos: ['Semi'], rpm: null, zeroing: '100–1000 m', dlc: 'Base', trilhos: 'mira, lateral, cano, bipé', obs: 'MX marksman — cano longo, só semi, ponte entre fuzil e DMR.' },
  { id: 'mk1emr',   nome: 'Mk-I EMR 7.62 mm',     tipo: 'dmr', faccao: 'OTAN', calibre: '7.62mm', mag: [20], modos: ['Semi'], rpm: null, zeroing: '100–1000 m', dlc: 'Marksmen', trilhos: 'mira, lateral, bipé', obs: 'DMR 7.62 da OTAN — energia cheia, ótimo até 800 m.' },
  { id: 'mk18abr',  nome: 'Mk18 ABR 7.62 mm',     tipo: 'dmr', faccao: 'AAF',  calibre: '7.62mm', mag: [20], modos: ['Semi', 'Auto'], rpm: 700, zeroing: '100–1000 m', dlc: 'Marksmen', trilhos: 'mira, lateral, bipé', obs: 'Battle rifle da AAF — 7.62 com opção automática (recuo forte).' },
  { id: 'cmr76',    nome: 'CMR-76 6.5 mm',        tipo: 'dmr', faccao: 'LDF (Contact)', calibre: '6.5mm', mag: [30], modos: ['Semi'], rpm: null, zeroing: '100–1000 m', dlc: 'Contact', trilhos: 'mira, lateral, bipé', obs: 'DMR compacto do Contact — 6.5 mm, leve pra tirador móvel.' },
  { id: 'cyrus',    nome: 'Cyrus 9.3 mm',         tipo: 'dmr', faccao: 'CSAT', calibre: '9.3mm', mag: [10], modos: ['Semi'], rpm: null, zeroing: '100–1200 m', dlc: 'Marksmen', trilhos: 'mira, lateral, bipé', obs: 'DMR pesado do CSAT — 9.3×64 fura colete fácil, quase anti-materiel leve.' },
  { id: 'asp1kir',  nome: 'ASP-1 Kir 12.7 mm',    tipo: 'dmr', faccao: 'CSAT/guerrilha', calibre: '12.7x54mm', mag: [5], modos: ['Semi'], rpm: null, zeroing: '100–600 m', dlc: 'Marksmen', trilhos: 'mira integrada', obs: 'Subsônico silencioso — arco de bala alto, letal e furtivo no médio.' },

  /* ===== Snipers & anti-materiel ===== */
  { id: 'mar10',    nome: 'MAR-10 .338',          tipo: 'sniper', faccao: 'OTAN', calibre: '.338', mag: [10], modos: ['Semi'], rpm: null, zeroing: '100–1500 m', dlc: 'Marksmen', trilhos: 'mira, bipé', obs: 'Sniper semi-auto .338 — trajetória plana, alcance longo, recuo controlável.' },
  { id: 'lrr',      nome: 'M320 LRR .408',        tipo: 'sniper', faccao: 'OTAN', calibre: '12.7mm', mag: [7], modos: ['Semi'], rpm: null, zeroing: '100–2000 m', dlc: 'Base', trilhos: 'mira, bipé', obs: 'Ferrolho de longo alcance da OTAN — o clássico do sniper (~2 km com prática).' },
  { id: 'gm6',      nome: 'GM6 Lynx 12.7 mm',     tipo: 'sniper', faccao: 'CSAT', calibre: '12.7mm', mag: [5], modos: ['Semi'], rpm: null, zeroing: '100–2000 m', dlc: 'Base', trilhos: 'mira, bipé', obs: 'Anti-materiel bullpup do CSAT — 12.7×99 fura veículo leve, semi-auto.' },

  /* ===== SMG ===== */
  { id: 'pdw2000',  nome: 'PDW2000 9 mm',         tipo: 'smg', faccao: 'OTAN/AAF', calibre: '9x21mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 900, zeroing: '50–200 m', dlc: 'Base', trilhos: 'mira curta', obs: 'PDW dobrável — escondível, pro CQB e tripulação de veículo.' },
  { id: 'vermin',   nome: 'Vermin SMG .45',       tipo: 'smg', faccao: 'OTAN', calibre: '.45 ACP', mag: [30], modos: ['Semi', 'Burst', 'Auto'], rpm: 1100, zeroing: '50–200 m', dlc: 'Marksmen', trilhos: 'mira, lateral', obs: 'SMG .45 de cadência altíssima — parede de chumbo no CQB.' },
  { id: 'sting',    nome: 'Sting 9 mm',           tipo: 'smg', faccao: 'OTAN', calibre: '9x21mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 1100, zeroing: '50–200 m', dlc: 'Base', trilhos: 'mira curta', obs: 'SMG compacta 9 mm — rápida e leve.' },
  { id: 'protector', nome: 'Protector 9 mm',      tipo: 'smg', faccao: 'CSAT', calibre: '9x21mm', mag: [30], modos: ['Semi', 'Auto'], rpm: 980, zeroing: '50–200 m', dlc: 'Base', trilhos: 'mira, supressor integrável', obs: 'SMG do CSAT (SMG-02) — furtiva, ótima suprimida.' },

  /* ===== LMG / MMG ===== */
  { id: 'mk200',    nome: 'Mk200 6.5 mm',         tipo: 'lmg', faccao: 'OTAN', calibre: '6.5mm', mag: [200], modos: ['Auto'], rpm: 700, zeroing: '100–1000 m', dlc: 'Base', trilhos: 'mira, bipé', obs: 'LMG 6.5 de caixa 200 — supressão móvel da OTAN.' },
  { id: 'zafir',    nome: 'Zafir 7.62 mm',        tipo: 'lmg', faccao: 'CSAT', calibre: '7.62mm', mag: [150], modos: ['Auto'], rpm: 750, zeroing: '100–1000 m', dlc: 'Base', trilhos: 'mira, bipé', obs: 'LMG 7.62 do CSAT — cinto de 150, mais energia que a Mk200.' },
  { id: 'spmg',     nome: 'SPMG .338',            tipo: 'lmg', faccao: 'OTAN', calibre: '.338', mag: [130], modos: ['Auto'], rpm: 600, zeroing: '100–1500 m', dlc: 'Marksmen', trilhos: 'mira, bipé', obs: 'MMG .338 — supressão de LONGO alcance, fura leve, pesadíssima.' },
  { id: 'navid',    nome: 'Navid 9.3 mm',         tipo: 'lmg', faccao: 'CSAT', calibre: '9.3mm', mag: [150], modos: ['Auto'], rpm: 600, zeroing: '100–1500 m', dlc: 'Marksmen', trilhos: 'mira, bipé', obs: 'MMG 9.3 do CSAT — o equivalente da SPMG, cinto de 150.' },
  { id: 'rpk12',    nome: 'RPK-12 7.62 mm',       tipo: 'lmg', faccao: 'LDF (Contact)', calibre: '7.62x39mm', mag: [75], modos: ['Semi', 'Auto'], rpm: 600, zeroing: '100–1000 m', dlc: 'Contact', trilhos: 'mira, lateral', obs: 'LMG da família AK-12 — tambor de 75, LMG leve/móvel.' },

  /* ===== Pistolas ===== */
  { id: 'p07',      nome: 'P07 9 mm',             tipo: 'pistola', faccao: 'OTAN', calibre: '9x21mm', mag: [17], modos: ['Semi'], rpm: null, zeroing: '25–50 m', dlc: 'Base', trilhos: 'supressor', obs: 'Pistola-padrão OTAN — 9 mm, confiável.' },
  { id: 'rook40',   nome: 'Rook-40 9 mm',         tipo: 'pistola', faccao: 'CSAT', calibre: '9x21mm', mag: [17], modos: ['Semi'], rpm: null, zeroing: '25–50 m', dlc: 'Base', trilhos: 'supressor', obs: 'Pistola-padrão CSAT — equivalente da P07.' },
  { id: '4five',    nome: '4-five .45',           tipo: 'pistola', faccao: 'AAF', calibre: '.45 ACP', mag: [11], modos: ['Semi'], rpm: null, zeroing: '25–50 m', dlc: 'Base', trilhos: 'supressor', obs: 'Pistola .45 da AAF — mais dano por tiro, menos munição.' },
  { id: 'acpc2',    nome: 'ACP-C2 .45',           tipo: 'pistola', faccao: 'Guerrilha', calibre: '.45 ACP', mag: [9], modos: ['Semi'], rpm: null, zeroing: '25–50 m', dlc: 'Base', trilhos: '—', obs: 'Pistola clássica .45 (1911-like) da FIA.' },
  { id: 'zubr',     nome: 'Zubr .45 (revólver)',  tipo: 'pistola', faccao: 'Guerrilha', calibre: '.45 ACP', mag: [6], modos: ['Semi'], rpm: null, zeroing: '25–50 m', dlc: 'Base', trilhos: '—', obs: 'Revólver .45 de 6 tiros — dano alto, recarga lenta.' },

  /* ===== Lançadores ===== */
  { id: 'pcml',     nome: 'PCML (AT guiado)',     tipo: 'lancador', faccao: 'OTAN', calibre: '—', mag: [1], modos: ['Trava/direto'], rpm: null, zeroing: 'trava ~20–320 m', dlc: 'Base', trilhos: '—', obs: 'AT leve descartável tipo NLAW — trava no topo do alvo ou tiro direto.' },
  { id: 'rpg42',    nome: 'RPG-42 Alamut (AT)',   tipo: 'lancador', faccao: 'CSAT', calibre: '—', mag: [1], modos: ['Direto'], rpm: null, zeroing: 'iron/optic', dlc: 'Base', trilhos: '—', obs: 'AT não-guiado do CSAT — mira balística, barato e efetivo no médio.' },
  { id: 'titanat',  nome: 'Titan MPRL (AT/AA)',   tipo: 'lancador', faccao: 'OTAN', calibre: '—', mag: [1], modos: ['Trava AT/AA'], rpm: null, zeroing: 'trava térmica', dlc: 'Base', trilhos: '—', obs: 'Míssil guiado recarregável — mísseis AT (top-attack) ou AA (trava térmica).' },
  { id: 'titancompact', nome: 'Titan MPRL Compact (AT)', tipo: 'lancador', faccao: 'OTAN', calibre: '—', mag: [1], modos: ['Trava AT'], rpm: null, zeroing: 'trava térmica', dlc: 'Base', trilhos: '—', obs: 'Versão leve do Titan — só AT, mais portátil.' }
];

export const A3ARM_TOTAL = A3ARM.length;
