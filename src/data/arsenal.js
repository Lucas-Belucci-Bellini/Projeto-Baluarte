/**
 * Arsenal do Baluarte (Fase 11).
 *
 * 159 armas + 24 veículos + doutrinas.
 * Cada item: { id, name, category, subcat, origin, year, caliber,
 *              rangeM, weightKg, equipe, notes, tier }
 * Tier: 'S' | 'A' | 'B' | 'C' (raridade/disponibilidade no Baluarte)
 */

export const CATEGORIES = [
  { id: 'pistolas',      label: 'Pistolas',         icon: '⚰', color: '#00f0ff' },
  { id: 'smg',           label: 'Submetralhadoras', icon: '⌖', color: '#00f0ff' },
  { id: 'rifles',        label: 'Rifles',           icon: '⌗', color: '#00ff88' },
  { id: 'snipers',       label: 'Snipers',          icon: '⊹', color: '#ff00aa' },
  { id: 'shotguns',      label: 'Shotguns',         icon: '◊', color: '#ffaa00' },
  { id: 'mg',            label: 'Metralhadoras',    icon: '☷', color: '#ff3355' },
  { id: 'launchers',     label: 'Lança-projéteis',  icon: '⚡', color: '#ff3355' },
  { id: 'melee',         label: 'Armas Brancas',    icon: '✠', color: '#93a4bf' },
  { id: 'experimental',  label: 'Experimentais',    icon: '⚛', color: '#7c4dff' },
  { id: 'veiculos',      label: 'Veículos',         icon: '◧', color: '#66ddff' }
];

export const EQUIPES = [
  'ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL',
  'INDIA', 'JULIETT', 'KILO', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA', 'QUEBEC',
  'ROMEO', 'SIERRA'
];

/* ============================================================
 *  PISTOLAS (15)
 * ============================================================ */
const PISTOLAS = [
  { name: 'M9 Beretta', origin: 'Itália', year: 1985, caliber: '9×19mm', rangeM: 50, weightKg: 0.95, equipe: 'ALFA', tier: 'A',
    notes: 'Padrão das forças regulares. Confiável e robusta.' },
  { name: 'Glock 17', origin: 'Áustria', year: 1982, caliber: '9×19mm', rangeM: 50, weightKg: 0.65, equipe: 'BRAVO', tier: 'A',
    notes: 'Polímero leve, 17 cartuchos. Favorita de operadores urbanos.' },
  { name: 'SIG P226', origin: 'Suíça', year: 1984, caliber: '9×19mm', rangeM: 55, weightKg: 0.96, equipe: 'CHARLIE', tier: 'A',
    notes: 'Precisão suíça. Usada por unidades de elite.' },
  { name: 'Desert Eagle .50', origin: 'EUA/Israel', year: 1983, caliber: '.50 AE', rangeM: 60, weightKg: 2.0, equipe: 'GOLF', tier: 'S',
    notes: 'Calibre brutal. Penetra coletes leves. Ostentação tática.' },
  { name: 'Colt 1911 .45', origin: 'EUA', year: 1911, caliber: '.45 ACP', rangeM: 50, weightKg: 1.1, equipe: 'HOTEL', tier: 'A',
    notes: 'Veterana centenária. Stopping power lendário.' },
  { name: 'HK USP', origin: 'Alemanha', year: 1993, caliber: '.45 ACP', rangeM: 50, weightKg: 0.88, equipe: 'INDIA', tier: 'A',
    notes: 'Modular e resistente. Versão SOCOM com supressor.' },
  { name: 'CZ 75', origin: 'Tchéquia', year: 1975, caliber: '9×19mm', rangeM: 50, weightKg: 1.0, equipe: 'JULIETT', tier: 'B',
    notes: 'Engenharia tcheca. Slide interno raro entre pistolas.' },
  { name: 'FN Five-Seven', origin: 'Bélgica', year: 1998, caliber: '5.7×28mm', rangeM: 50, weightKg: 0.62, equipe: 'KILO', tier: 'A',
    notes: 'Calibre perfurante. 20 cartuchos.' },
  { name: 'Walther PPK', origin: 'Alemanha', year: 1929, caliber: '7.65mm', rangeM: 25, weightKg: 0.59, equipe: 'MIKE', tier: 'B',
    notes: 'Compacta clássica. Operações stealth.' },
  { name: 'Makarov PM', origin: 'URSS', year: 1951, caliber: '9×18mm', rangeM: 50, weightKg: 0.73, equipe: 'NOVEMBER', tier: 'B',
    notes: 'Adversária oriental. Vista em operações de leste.' },
  { name: 'M1903 Browning', origin: 'EUA', year: 1903, caliber: '.32 ACP', rangeM: 30, weightKg: 0.6, equipe: 'OSCAR', tier: 'C',
    notes: 'Pistola histórica. Coleção, raramente operacional.' },
  { name: 'Taurus PT92', origin: 'Brasil', year: 1980, caliber: '9×19mm', rangeM: 50, weightKg: 0.97, equipe: 'PAPA', tier: 'B',
    notes: 'Variante brasileira da M9. Produção nacional.' },
  { name: 'Wilson Combat CQB', origin: 'EUA', year: 2005, caliber: '.45 ACP', rangeM: 60, weightKg: 1.05, equipe: 'QUEBEC', tier: 'S',
    notes: 'Customizada para operadores de alto escalão.' },
  { name: 'HK MK23 SOCOM', origin: 'Alemanha', year: 1996, caliber: '.45 ACP', rangeM: 65, weightKg: 1.2, equipe: 'ROMEO', tier: 'S',
    notes: 'Pistola SOCOM. Supressora e LAM nativos.' },
  { name: 'SIG P320 X-Carry', origin: 'Suíça/EUA', year: 2017, caliber: '9×19mm', rangeM: 55, weightKg: 0.79, equipe: 'SIERRA', tier: 'A',
    notes: 'Modular moderna. Adotada como sidearm Mark XIII.' }
];

/* ============================================================
 *  SUBMETRALHADORAS (12)
 * ============================================================ */
const SMG = [
  { name: 'MP5A3', origin: 'Alemanha', year: 1966, caliber: '9×19mm', rangeM: 200, weightKg: 2.5, equipe: 'ALFA', tier: 'S',
    notes: 'Padrão CT mundial. Precisão automática lendária.' },
  { name: 'MP5SD6', origin: 'Alemanha', year: 1974, caliber: '9×19mm', rangeM: 100, weightKg: 3.5, equipe: 'BRAVO', tier: 'S',
    notes: 'Versão suprimida integrada. Subsônica.' },
  { name: 'MP7A1', origin: 'Alemanha', year: 2001, caliber: '4.6×30mm', rangeM: 200, weightKg: 1.9, equipe: 'CHARLIE', tier: 'S',
    notes: 'PDW perfurante. Penetra coletes IIIA.' },
  { name: 'P90', origin: 'Bélgica', year: 1990, caliber: '5.7×28mm', rangeM: 200, weightKg: 2.6, equipe: 'DELTA', tier: 'A',
    notes: '50 cartuchos. Bullpup compacta.' },
  { name: 'UMP45', origin: 'Alemanha', year: 1999, caliber: '.45 ACP', rangeM: 100, weightKg: 2.5, equipe: 'ECHO', tier: 'A',
    notes: 'Sucessora da MP5 com calibre maior.' },
  { name: 'Vector .45', origin: 'EUA', year: 2007, caliber: '.45 ACP', rangeM: 100, weightKg: 2.7, equipe: 'FOXTROT', tier: 'A',
    notes: 'Mecanismo Kriss reduz recuo dramaticamente.' },
  { name: 'PP-19 Bizon', origin: 'Rússia', year: 1993, caliber: '9×18mm', rangeM: 200, weightKg: 2.7, equipe: 'GOLF', tier: 'B',
    notes: 'Carregador helicoidal 64 cartuchos.' },
  { name: 'Uzi', origin: 'Israel', year: 1954, caliber: '9×19mm', rangeM: 200, weightKg: 3.5, equipe: 'HOTEL', tier: 'B',
    notes: 'Ícone israelense. Robusta e simples.' },
  { name: 'Micro Uzi', origin: 'Israel', year: 1982, caliber: '9×19mm', rangeM: 50, weightKg: 1.5, equipe: 'INDIA', tier: 'A',
    notes: 'Compacta para CQB extremo.' },
  { name: 'AS Val', origin: 'Rússia', year: 1987, caliber: '9×39mm', rangeM: 300, weightKg: 2.5, equipe: 'JULIETT', tier: 'S',
    notes: 'Suprimida integrada. Penetração contra coletes.' },
  { name: 'B&T APC9', origin: 'Suíça', year: 2011, caliber: '9×19mm', rangeM: 100, weightKg: 2.5, equipe: 'KILO', tier: 'A',
    notes: 'Adotada pelo US Army como Sub-Compact Weapon.' },
  { name: 'CZ Scorpion EVO 3', origin: 'Tchéquia', year: 2009, caliber: '9×19mm', rangeM: 100, weightKg: 2.4, equipe: 'MIKE', tier: 'A',
    notes: 'Modular, leve, com supressor integrado opcional.' }
];

/* ============================================================
 *  RIFLES (28)
 * ============================================================ */
const RIFLES = [
  /* Assalto */
  { name: 'M4A1 Carbine', origin: 'EUA', year: 1994, caliber: '5.56×45mm', rangeM: 500, weightKg: 3.4, equipe: 'ALFA', tier: 'S',
    notes: 'Padrão US SOCOM. Curta, modular.', subcat: 'Assalto' },
  { name: 'M16A4', origin: 'EUA', year: 1997, caliber: '5.56×45mm', rangeM: 600, weightKg: 4.0, equipe: 'BRAVO', tier: 'A',
    notes: 'Versão full-length. Marines.', subcat: 'Assalto' },
  { name: 'HK416', origin: 'Alemanha', year: 2004, caliber: '5.56×45mm', rangeM: 600, weightKg: 3.5, equipe: 'CHARLIE', tier: 'S',
    notes: 'Substituto melhorado do M4. Sistema piston.', subcat: 'Assalto' },
  { name: 'SIG MCX', origin: 'Suíça/EUA', year: 2015, caliber: '.300 BLK / 5.56', rangeM: 500, weightKg: 3.3, equipe: 'DELTA', tier: 'S',
    notes: 'Modular trocando calibre em campo.', subcat: 'Assalto' },
  { name: 'AK-47', origin: 'URSS', year: 1947, caliber: '7.62×39mm', rangeM: 400, weightKg: 4.3, equipe: 'ECHO', tier: 'A',
    notes: 'Ícone universal. Robustez lendária.', subcat: 'Assalto' },
  { name: 'AK-74', origin: 'URSS', year: 1974, caliber: '5.45×39mm', rangeM: 500, weightKg: 3.3, equipe: 'FOXTROT', tier: 'A',
    notes: 'Versão moderna com calibre menor.', subcat: 'Assalto' },
  { name: 'AK-12', origin: 'Rússia', year: 2018, caliber: '5.45×39mm', rangeM: 500, weightKg: 3.3, equipe: 'GOLF', tier: 'A',
    notes: 'Modernização contemporânea da família AK.', subcat: 'Assalto' },
  { name: 'AKM', origin: 'URSS', year: 1959, caliber: '7.62×39mm', rangeM: 400, weightKg: 3.1, equipe: 'HOTEL', tier: 'A',
    notes: 'AK aliviada com chapa estampada.', subcat: 'Assalto' },
  { name: 'FAMAS F1', origin: 'França', year: 1978, caliber: '5.56×45mm', rangeM: 450, weightKg: 3.6, equipe: 'INDIA', tier: 'B',
    notes: 'Bullpup francesa. "Clarion".', subcat: 'Assalto' },
  { name: 'SCAR-L', origin: 'Bélgica', year: 2009, caliber: '5.56×45mm', rangeM: 500, weightKg: 3.5, equipe: 'JULIETT', tier: 'S',
    notes: 'SOCOM Combat Assault Rifle. Modular.', subcat: 'Assalto' },
  { name: 'SCAR-H', origin: 'Bélgica', year: 2009, caliber: '7.62×51mm', rangeM: 700, weightKg: 3.7, equipe: 'KILO', tier: 'S',
    notes: 'Versão calibre maior. Penetração superior.', subcat: 'Assalto' },
  { name: 'Galil ACE', origin: 'Israel', year: 2009, caliber: '5.56 / 7.62', rangeM: 500, weightKg: 3.6, equipe: 'MIKE', tier: 'A',
    notes: 'Modernização da Galil. Modular.', subcat: 'Assalto' },
  { name: 'Tavor X95', origin: 'Israel', year: 2009, caliber: '5.56×45mm', rangeM: 500, weightKg: 3.4, equipe: 'NOVEMBER', tier: 'A',
    notes: 'Bullpup adotada por IDF.', subcat: 'Assalto' },
  { name: 'G36', origin: 'Alemanha', year: 1997, caliber: '5.56×45mm', rangeM: 600, weightKg: 3.6, equipe: 'OSCAR', tier: 'A',
    notes: 'Bullpup HK. Aposentada pelo Bundeswehr.', subcat: 'Assalto' },
  { name: 'IMBEL IA2', origin: 'Brasil', year: 2012, caliber: '5.56×45mm', rangeM: 500, weightKg: 3.5, equipe: 'PAPA', tier: 'B',
    notes: 'Fuzil padrão do Exército Brasileiro.', subcat: 'Assalto' },
  /* Batalha */
  { name: 'FN FAL', origin: 'Bélgica', year: 1953, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.3, equipe: 'QUEBEC', tier: 'A',
    notes: '"O direito do mundo livre". Clássico da OTAN.', subcat: 'Batalha' },
  { name: 'HK G3', origin: 'Alemanha', year: 1959, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.5, equipe: 'ROMEO', tier: 'A',
    notes: 'Rifle de batalha pesado. Service rifle de muitos países.', subcat: 'Batalha' },
  { name: 'M14', origin: 'EUA', year: 1959, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.5, equipe: 'SIERRA', tier: 'A',
    notes: 'Versão tardia ainda em uso DM.', subcat: 'Batalha' },
  /* Designados Marksman */
  { name: 'Mk 14 EBR', origin: 'EUA', year: 2003, caliber: '7.62×51mm', rangeM: 800, weightKg: 5.1, equipe: 'ALFA', tier: 'S',
    notes: 'Designated Marksman. M14 modernizada.', subcat: 'DMR' },
  { name: 'HK417', origin: 'Alemanha', year: 2005, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.4, equipe: 'BRAVO', tier: 'S',
    notes: 'Irmão maior do 416. Marksman/sniper híbrido.', subcat: 'DMR' },
  { name: 'SR-25', origin: 'EUA', year: 1990, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.9, equipe: 'CHARLIE', tier: 'A',
    notes: 'Sniper semi-auto SOCOM (Mk 11).', subcat: 'DMR' },
  { name: 'SVD Dragunov', origin: 'URSS', year: 1963, caliber: '7.62×54mm R', rangeM: 800, weightKg: 4.3, equipe: 'DELTA', tier: 'A',
    notes: 'DMR clássico russo.', subcat: 'DMR' },
  { name: 'PSL Romak', origin: 'Romênia', year: 1974, caliber: '7.62×54mm R', rangeM: 800, weightKg: 4.3, equipe: 'ECHO', tier: 'B',
    notes: 'Variante romena do SVD.', subcat: 'DMR' },
  { name: 'M110 SASS', origin: 'EUA', year: 2007, caliber: '7.62×51mm', rangeM: 800, weightKg: 6.94, equipe: 'FOXTROT', tier: 'S',
    notes: 'Semi-Automatic Sniper System.', subcat: 'DMR' },
  { name: 'AR-10', origin: 'EUA', year: 1956, caliber: '7.62×51mm', rangeM: 700, weightKg: 3.3, equipe: 'GOLF', tier: 'A',
    notes: 'Antecessor do AR-15. Calibre maior.', subcat: 'DMR' },
  /* Carbinas curtas */
  { name: 'CAR-15', origin: 'EUA', year: 1965, caliber: '5.56×45mm', rangeM: 400, weightKg: 2.6, equipe: 'HOTEL', tier: 'B',
    notes: 'Carabina precursora do M4.', subcat: 'Carbina' },
  { name: 'AKS-74U', origin: 'URSS', year: 1979, caliber: '5.45×39mm', rangeM: 350, weightKg: 2.7, equipe: 'INDIA', tier: 'A',
    notes: 'Krinkov compacta. Crew weapon.', subcat: 'Carbina' },
  { name: 'CZ Bren 2', origin: 'Tchéquia', year: 2017, caliber: '5.56×45mm', rangeM: 500, weightKg: 3.0, equipe: 'JULIETT', tier: 'A',
    notes: 'Modernização tcheca. Forças especiais.', subcat: 'Carbina' }
];

/* ============================================================
 *  SNIPERS (15)
 * ============================================================ */
const SNIPERS = [
  { name: 'Barrett M82', origin: 'EUA', year: 1982, caliber: '.50 BMG', rangeM: 1800, weightKg: 14.0, equipe: 'ALFA', tier: 'S',
    notes: 'Anti-material. Lendária .50.' },
  { name: 'M107A1', origin: 'EUA', year: 2002, caliber: '.50 BMG', rangeM: 1800, weightKg: 13.0, equipe: 'BRAVO', tier: 'S',
    notes: 'Variante M82 atualizada SOCOM.' },
  { name: 'CheyTac M200', origin: 'EUA', year: 2001, caliber: '.408 CheyTac', rangeM: 2300, weightKg: 12.3, equipe: 'CHARLIE', tier: 'S',
    notes: 'Recorde de 2300m em testes.' },
  { name: 'TAC-50 McMillan', origin: 'EUA', year: 2000, caliber: '.50 BMG', rangeM: 2000, weightKg: 11.8, equipe: 'DELTA', tier: 'S',
    notes: 'Recorde mundial documentado de 3540m (Canadian JTF2).' },
  { name: 'Remington 700', origin: 'EUA', year: 1962, caliber: '7.62×51mm', rangeM: 800, weightKg: 4.0, equipe: 'ECHO', tier: 'A',
    notes: 'Base de muitos sistemas militares (M24, M40).' },
  { name: 'AWM (L115A3)', origin: 'UK', year: 1996, caliber: '.338 Lapua', rangeM: 1500, weightKg: 6.9, equipe: 'FOXTROT', tier: 'S',
    notes: 'Padrão sniper UK. Recorde Craig Harrison 2475m.' },
  { name: 'M40A6', origin: 'EUA', year: 2014, caliber: '7.62×51mm', rangeM: 900, weightKg: 7.5, equipe: 'GOLF', tier: 'A',
    notes: 'Sniper USMC modernizado.' },
  { name: 'M24 SWS', origin: 'EUA', year: 1988, caliber: '7.62×51mm', rangeM: 800, weightKg: 5.5, equipe: 'HOTEL', tier: 'A',
    notes: 'Sniper Weapon System US Army.' },
  { name: 'VSS Vintorez', origin: 'URSS', year: 1987, caliber: '9×39mm', rangeM: 400, weightKg: 2.6, equipe: 'INDIA', tier: 'S',
    notes: 'Sniper suprimido. Subsônica.' },
  { name: 'KSVK', origin: 'Rússia', year: 1997, caliber: '12.7×108mm', rangeM: 2000, weightKg: 12.5, equipe: 'JULIETT', tier: 'S',
    notes: 'Anti-material russo. Bullpup.' },
  { name: 'OSV-96', origin: 'Rússia', year: 1994, caliber: '12.7×108mm', rangeM: 1800, weightKg: 12.9, equipe: 'KILO', tier: 'A',
    notes: 'Anti-material dobrável.' },
  { name: 'Steyr SSG 69', origin: 'Áustria', year: 1969, caliber: '7.62×51mm', rangeM: 800, weightKg: 3.9, equipe: 'MIKE', tier: 'A',
    notes: 'Sniper clássico austríaco.' },
  { name: 'PSG-1', origin: 'Alemanha', year: 1972, caliber: '7.62×51mm', rangeM: 800, weightKg: 8.1, equipe: 'NOVEMBER', tier: 'S',
    notes: 'Sniper semi-auto de elite GSG-9.' },
  { name: 'AS50', origin: 'UK', year: 2007, caliber: '.50 BMG', rangeM: 1800, weightKg: 14.1, equipe: 'OSCAR', tier: 'S',
    notes: 'Anti-material Accuracy International.' },
  { name: 'Voere SDP', origin: 'Áustria', year: 2018, caliber: '.50 BMG', rangeM: 2000, weightKg: 11.0, equipe: 'PAPA', tier: 'S',
    notes: 'Sniper experimental européia.' }
];

/* ============================================================
 *  SHOTGUNS (10)
 * ============================================================ */
const SHOTGUNS = [
  { name: 'Mossberg 590', origin: 'EUA', year: 1987, caliber: '12 Gauge', rangeM: 40, weightKg: 3.3, equipe: 'ALFA', tier: 'A',
    notes: 'Pump-action militar. 8+1.' },
  { name: 'Remington 870 MCS', origin: 'EUA', year: 1951, caliber: '12 Gauge', rangeM: 40, weightKg: 3.6, equipe: 'BRAVO', tier: 'A',
    notes: 'Modular Combat Shotgun.' },
  { name: 'Benelli M4', origin: 'Itália', year: 1998, caliber: '12 Gauge', rangeM: 40, weightKg: 3.8, equipe: 'CHARLIE', tier: 'S',
    notes: 'Semi-auto USMC (M1014).' },
  { name: 'SPAS-12', origin: 'Itália', year: 1979, caliber: '12 Gauge', rangeM: 40, weightKg: 4.4, equipe: 'DELTA', tier: 'A',
    notes: 'Conversível pump/semi.' },
  { name: 'KSG', origin: 'EUA', year: 2011, caliber: '12 Gauge', rangeM: 40, weightKg: 3.5, equipe: 'ECHO', tier: 'A',
    notes: 'Bullpup com 2 tubos de 7 cartuchos.' },
  { name: 'Saiga-12', origin: 'Rússia', year: 1994, caliber: '12 Gauge', rangeM: 40, weightKg: 3.6, equipe: 'FOXTROT', tier: 'A',
    notes: 'Shotgun semi-auto baseado em AK.' },
  { name: 'AA-12', origin: 'EUA', year: 1972, caliber: '12 Gauge', rangeM: 40, weightKg: 4.8, equipe: 'GOLF', tier: 'S',
    notes: 'Auto-Assault. Drum 32 cartuchos.' },
  { name: 'Pancor Jackhammer', origin: 'EUA', year: 1984, caliber: '12 Gauge', rangeM: 35, weightKg: 4.6, equipe: 'HOTEL', tier: 'S',
    notes: 'Protótipo lendário. Bullpup auto.' },
  { name: 'Stoeger Double Defense', origin: 'Turquia', year: 2008, caliber: '12 Gauge', rangeM: 30, weightKg: 3.3, equipe: 'INDIA', tier: 'B',
    notes: 'Dupla SxS para CQB.' },
  { name: 'Winchester 1300', origin: 'EUA', year: 1978, caliber: '12 Gauge', rangeM: 40, weightKg: 3.2, equipe: 'JULIETT', tier: 'B',
    notes: 'Pump-action civil/policial.' }
];

/* ============================================================
 *  METRALHADORAS (12)
 * ============================================================ */
const MG = [
  { name: 'M249 SAW', origin: 'EUA', year: 1984, caliber: '5.56×45mm', rangeM: 800, weightKg: 7.5, equipe: 'ALFA', tier: 'A',
    notes: 'Squad Auto Weapon. Standard.' },
  { name: 'M240B', origin: 'Bélgica/EUA', year: 1977, caliber: '7.62×51mm', rangeM: 1800, weightKg: 12.5, equipe: 'BRAVO', tier: 'A',
    notes: 'MAG belga. Padrão de companhia.' },
  { name: 'M2 Browning .50', origin: 'EUA', year: 1933, caliber: '.50 BMG', rangeM: 1800, weightKg: 38, equipe: 'CHARLIE', tier: 'S',
    notes: 'Pesada. Veicular/posicional. "Ma Deuce".' },
  { name: 'PKM', origin: 'URSS', year: 1969, caliber: '7.62×54mm R', rangeM: 1500, weightKg: 7.5, equipe: 'DELTA', tier: 'A',
    notes: 'GPMG soviética leve.' },
  { name: 'DShK', origin: 'URSS', year: 1938, caliber: '12.7×108mm', rangeM: 2000, weightKg: 34, equipe: 'ECHO', tier: 'A',
    notes: 'Análogo russo à M2.' },
  { name: 'NSV', origin: 'URSS', year: 1972, caliber: '12.7×108mm', rangeM: 2000, weightKg: 25, equipe: 'FOXTROT', tier: 'A',
    notes: 'Substituto leve da DShK.' },
  { name: 'MG3', origin: 'Alemanha', year: 1958, caliber: '7.62×51mm', rangeM: 1200, weightKg: 11.5, equipe: 'GOLF', tier: 'A',
    notes: 'Descendente direta da MG42.' },
  { name: 'MG5', origin: 'Alemanha', year: 2013, caliber: '7.62×51mm', rangeM: 1200, weightKg: 11.6, equipe: 'HOTEL', tier: 'S',
    notes: 'Sucessora moderna do Bundeswehr.' },
  { name: 'Mk 48', origin: 'EUA', year: 2003, caliber: '7.62×51mm', rangeM: 1200, weightKg: 8.2, equipe: 'INDIA', tier: 'S',
    notes: 'Versão SOCOM mais leve da Mk 240.' },
  { name: 'IMI Negev NG7', origin: 'Israel', year: 2012, caliber: '7.62×51mm', rangeM: 1200, weightKg: 7.95, equipe: 'JULIETT', tier: 'A',
    notes: 'MG israelense moderna.' },
  { name: 'FN Minimi Mk3', origin: 'Bélgica', year: 2012, caliber: '5.56 / 7.62', rangeM: 800, weightKg: 7.5, equipe: 'KILO', tier: 'A',
    notes: 'Modernização do SAW.' },
  { name: 'M134 Minigun', origin: 'EUA', year: 1962, caliber: '7.62×51mm', rangeM: 1000, weightKg: 18.9, equipe: 'MIKE', tier: 'S',
    notes: 'Gatling elétrica. 6000 rpm. Veicular.' }
];

/* ============================================================
 *  LANÇA-PROJÉTEIS (15)
 * ============================================================ */
const LAUNCHERS = [
  { name: 'M203', origin: 'EUA', year: 1969, caliber: '40mm GP', rangeM: 400, weightKg: 1.4, equipe: 'ALFA', tier: 'A',
    notes: 'Lança-granadas single-shot acoplado.' },
  { name: 'M320', origin: 'Alemanha/EUA', year: 2009, caliber: '40mm GP', rangeM: 400, weightKg: 1.5, equipe: 'BRAVO', tier: 'A',
    notes: 'Substituto do M203 standalone/acoplado.' },
  { name: 'GP-25', origin: 'URSS', year: 1978, caliber: '40mm caseless', rangeM: 400, weightKg: 1.5, equipe: 'CHARLIE', tier: 'A',
    notes: 'Lança-granadas soviético sob o cano.' },
  { name: 'AT4', origin: 'Suécia', year: 1987, caliber: '84mm HEAT', rangeM: 300, weightKg: 6.7, equipe: 'DELTA', tier: 'A',
    notes: 'Anti-tank descartável. Padrão OTAN.' },
  { name: 'M72 LAW', origin: 'EUA', year: 1963, caliber: '66mm HEAT', rangeM: 200, weightKg: 2.5, equipe: 'ECHO', tier: 'A',
    notes: 'Light Anti-Armor compacta.' },
  { name: 'RPG-7', origin: 'URSS', year: 1961, caliber: '40-105mm', rangeM: 300, weightKg: 7.0, equipe: 'FOXTROT', tier: 'A',
    notes: 'Lança-foguetes universal. Lendário.' },
  { name: 'Carl Gustaf M4', origin: 'Suécia', year: 2014, caliber: '84mm', rangeM: 1000, weightKg: 6.6, equipe: 'GOLF', tier: 'S',
    notes: 'Recoilless reutilizável. Multi-munição.' },
  { name: 'FGM-148 Javelin', origin: 'EUA', year: 1996, caliber: '127mm', rangeM: 2500, weightKg: 22.3, equipe: 'HOTEL', tier: 'S',
    notes: 'Anti-tank fire-and-forget. Top attack.' },
  { name: 'NLAW', origin: 'UK/Suécia', year: 2008, caliber: '150mm', rangeM: 800, weightKg: 12.5, equipe: 'INDIA', tier: 'S',
    notes: 'Predictive Line of Sight. Anti-tank moderno.' },
  { name: 'Mk 19', origin: 'EUA', year: 1968, caliber: '40mm', rangeM: 1500, weightKg: 35.3, equipe: 'JULIETT', tier: 'A',
    notes: 'Lança-granadas automático veicular.' },
  { name: 'AGS-17', origin: 'URSS', year: 1971, caliber: '30mm', rangeM: 1700, weightKg: 31, equipe: 'KILO', tier: 'A',
    notes: 'Análogo russo do Mk 19.' },
  { name: 'FIM-92 Stinger', origin: 'EUA', year: 1981, caliber: '70mm', rangeM: 4800, weightKg: 15.2, equipe: 'MIKE', tier: 'S',
    notes: 'Anti-aéreo portátil MANPAD.' },
  { name: 'SA-7 Strela', origin: 'URSS', year: 1968, caliber: '72mm', rangeM: 4200, weightKg: 9.8, equipe: 'NOVEMBER', tier: 'A',
    notes: 'MANPAD soviético clássico.' },
  { name: 'Igla-S', origin: 'Rússia', year: 2002, caliber: '72mm', rangeM: 6000, weightKg: 19, equipe: 'OSCAR', tier: 'S',
    notes: 'MANPAD russo moderno.' },
  { name: 'Spike NLOS', origin: 'Israel', year: 1981, caliber: '170mm', rangeM: 25000, weightKg: 71, equipe: 'PAPA', tier: 'S',
    notes: 'Anti-tank fibra óptica. Longo alcance.' }
];

/* ============================================================
 *  ARMAS BRANCAS (22)
 * ============================================================ */
const MELEE = [
  { name: 'KA-BAR', origin: 'EUA', year: 1942, caliber: 'lâmina 18cm', rangeM: 1, weightKg: 0.32, equipe: 'ALFA', tier: 'A',
    notes: 'Faca de combate USMC. Ícone.' },
  { name: 'Gerber Mark II', origin: 'EUA', year: 1966, caliber: 'lâmina 17cm', rangeM: 1, weightKg: 0.37, equipe: 'BRAVO', tier: 'A',
    notes: 'Vietnã-era. Dois gumes.' },
  { name: 'SOG SEAL Pup', origin: 'EUA', year: 1992, caliber: 'lâmina 12cm', rangeM: 1, weightKg: 0.20, equipe: 'CHARLIE', tier: 'A',
    notes: 'Aprovada SEAL para utility.' },
  { name: 'Glock 78 Field Knife', origin: 'Áustria', year: 1981, caliber: 'lâmina 16cm', rangeM: 1, weightKg: 0.22, equipe: 'DELTA', tier: 'A',
    notes: 'Faca austríaca utilitária.' },
  { name: 'Fairbairn-Sykes', origin: 'UK', year: 1941, caliber: 'lâmina 18cm', rangeM: 1, weightKg: 0.27, equipe: 'ECHO', tier: 'S',
    notes: 'Comando britânico clássico. Lâmina dupla.' },
  { name: 'OKC-3S Bayonet', origin: 'EUA', year: 2003, caliber: 'lâmina 20cm', rangeM: 1, weightKg: 0.65, equipe: 'FOXTROT', tier: 'A',
    notes: 'Baioneta USMC moderna.' },
  { name: 'Tomahawk SOG', origin: 'EUA', year: 2001, caliber: 'machado 36cm', rangeM: 1, weightKg: 0.85, equipe: 'GOLF', tier: 'A',
    notes: 'Machado tático. Tactical Tomahawk.' },
  { name: 'Katana Tipo 95', origin: 'Japão', year: 1935, caliber: 'lâmina 70cm', rangeM: 2, weightKg: 1.2, equipe: 'HOTEL', tier: 'S',
    notes: 'Espada cerimonial recuperada.' },
  { name: 'Kukri Gurkha', origin: 'Nepal', year: 1810, caliber: 'lâmina 30cm', rangeM: 1, weightKg: 0.7, equipe: 'INDIA', tier: 'A',
    notes: 'Faca curva clássica dos Gurkhas.' },
  { name: 'Tanto Cold Steel', origin: 'EUA', year: 1980, caliber: 'lâmina 15cm', rangeM: 1, weightKg: 0.18, equipe: 'JULIETT', tier: 'A',
    notes: 'Lâmina chiseled inspirada em tanto.' },
  { name: 'Karambit', origin: 'Indonésia', year: 1500, caliber: 'lâmina 8cm', rangeM: 1, weightKg: 0.1, equipe: 'KILO', tier: 'A',
    notes: 'Lâmina curva indonésia. Krav Maga.' },
  { name: 'Bowie XL', origin: 'EUA', year: 1830, caliber: 'lâmina 25cm', rangeM: 1, weightKg: 0.9, equipe: 'MIKE', tier: 'B',
    notes: 'Bowie clássica grande.' },
  { name: 'Espada Long. Romana', origin: 'Roma', year: 100, caliber: 'lâmina 60cm', rangeM: 2, weightKg: 0.9, equipe: 'NOVEMBER', tier: 'B',
    notes: 'Gladius reconstruída para cerimônia.' },
  { name: 'Lança Pilum', origin: 'Roma', year: 200, caliber: 'haste 200cm', rangeM: 30, weightKg: 2.2, equipe: 'OSCAR', tier: 'C',
    notes: 'Lança romana. Coleção histórica.' },
  { name: 'Yari (lança japonesa)', origin: 'Japão', year: 1300, caliber: 'haste 280cm', rangeM: 3, weightKg: 2.0, equipe: 'PAPA', tier: 'C',
    notes: 'Lança samurai cerimonial.' },
  { name: 'Smatchet Mk II', origin: 'UK', year: 1942, caliber: 'lâmina 30cm', rangeM: 1, weightKg: 1.1, equipe: 'QUEBEC', tier: 'A',
    notes: 'Lâmina larga para CQB WWII.' },
  { name: 'Becker BK7', origin: 'EUA', year: 2003, caliber: 'lâmina 18cm', rangeM: 1, weightKg: 0.45, equipe: 'ROMEO', tier: 'A',
    notes: 'Faca tática combat-ready.' },
  { name: 'Microtech Combat Troodon', origin: 'EUA', year: 2008, caliber: 'lâmina 10cm', rangeM: 1, weightKg: 0.12, equipe: 'SIERRA', tier: 'S',
    notes: 'OTF automática para operadores.' },
  { name: 'Punhal Sykes-Fairbairn 3rd', origin: 'UK', year: 1944, caliber: 'lâmina 17cm', rangeM: 1, weightKg: 0.27, equipe: 'ALFA', tier: 'A',
    notes: 'Terceira variante do clássico britânico.' },
  { name: 'Kpinga (Mangbetu)', origin: 'Congo', year: 1700, caliber: 'lâmina 50cm', rangeM: 20, weightKg: 0.9, equipe: 'BRAVO', tier: 'C',
    notes: 'Faca de arremesso africana ritual.' },
  { name: 'Khopesh', origin: 'Egito', year: -1500, caliber: 'lâmina 60cm', rangeM: 2, weightKg: 1.5, equipe: 'CHARLIE', tier: 'C',
    notes: 'Foice egípcia. Item de coleção do museu.' },
  { name: 'Shuriken Bo (set)', origin: 'Japão', year: 1500, caliber: 'lâmina 8cm', rangeM: 15, weightKg: 0.08, equipe: 'DELTA', tier: 'B',
    notes: 'Conjunto de 8 estrelas. Lançamento.' }
];

/* ============================================================
 *  EXPERIMENTAIS (15) — universo Baluarte
 * ============================================================ */
const EXPERIMENTAL = [
  { name: 'Plasma Lance Mark IV', origin: 'Baluarte', year: 2042, caliber: '∇-plasma 8GW', rangeM: 800, weightKg: 5.5, equipe: 'ALFA', tier: 'S',
    notes: 'Arma de plasma direcional. Núcleo Infinity. Munição: 24 disparos.' },
  { name: 'Pulse Rifle BLT-9', origin: 'Baluarte', year: 2041, caliber: 'Pulso eletromagn.', rangeM: 600, weightKg: 4.2, equipe: 'BRAVO', tier: 'S',
    notes: 'Rifle de pulso EM. Anti-eletrônica devastador.' },
  { name: 'Coilgun Saga', origin: 'Baluarte', year: 2039, caliber: 'Projétil 8mm Mach 7', rangeM: 4000, weightKg: 11.0, equipe: 'CHARLIE', tier: 'S',
    notes: 'Sniper de bobinas. Velocidade hipersônica.' },
  { name: 'Railgun Compacto Mk III', origin: 'Baluarte', year: 2043, caliber: 'Slug 10mm Mach 5', rangeM: 2500, weightKg: 9.5, equipe: 'DELTA', tier: 'S',
    notes: 'Railgun portátil. Bateria de plasma fria.' },
  { name: 'Cryo-Beam SHIVA', origin: 'Baluarte', year: 2040, caliber: 'Feixe -180°C', rangeM: 200, weightKg: 6.0, equipe: 'ECHO', tier: 'S',
    notes: 'Feixe criogênico. Imobiliza alvos orgânicos.' },
  { name: 'Sonic Disruptor LOKI', origin: 'Baluarte', year: 2041, caliber: 'Onda 180dB', rangeM: 100, weightKg: 3.2, equipe: 'FOXTROT', tier: 'A',
    notes: 'Arma sônica não-letal. Concussão direcional.' },
  { name: 'Particle Beam THOR', origin: 'Baluarte', year: 2044, caliber: 'Feixe relativ.', rangeM: 6000, weightKg: 25, equipe: 'GOLF', tier: 'S',
    notes: 'Anti-blindagem por feixe de partículas.' },
  { name: 'Nano-Cloud Disperser', origin: 'Baluarte', year: 2042, caliber: 'Enxame nano', rangeM: 50, weightKg: 4.0, equipe: 'HOTEL', tier: 'S',
    notes: 'Dispersor de nanopartículas corrosivas.' },
  { name: 'Gravitic Slam DRAGON', origin: 'Baluarte', year: 2045, caliber: 'Pulso grav.', rangeM: 40, weightKg: 7.5, equipe: 'INDIA', tier: 'S',
    notes: 'Onda gravitacional direcional. CQB extremo.' },
  { name: 'Photon Sword VANADIS', origin: 'Baluarte', year: 2046, caliber: 'Lâmina fóton', rangeM: 2, weightKg: 1.8, equipe: 'JULIETT', tier: 'S',
    notes: 'Espada de fóton coerente. Equipe Vanadis exclusiva.' },
  { name: 'Plasma Mortar TITAN', origin: 'Baluarte', year: 2043, caliber: 'Bola plasma 200mm', rangeM: 5000, weightKg: 80, equipe: 'KILO', tier: 'S',
    notes: 'Morteiro de plasma. Operação de cerco.' },
  { name: 'EMP Grenade SHADOW', origin: 'Baluarte', year: 2040, caliber: 'EMP 5MV/m', rangeM: 80, weightKg: 0.4, equipe: 'MIKE', tier: 'A',
    notes: 'Granada EMP. Desativa eletrônica num raio.' },
  { name: 'Smart Drone ARGUS', origin: 'Baluarte', year: 2044, caliber: 'IA + 4 micro-foguetes', rangeM: 1500, weightKg: 2.5, equipe: 'NOVEMBER', tier: 'S',
    notes: 'Drone autônomo de combate. Reconhece amigo/inimigo.' },
  { name: 'Exoskeleton GUNDAM-S', origin: 'Baluarte', year: 2045, caliber: 'Servo-aumentado', rangeM: 0, weightKg: 35, equipe: 'OSCAR', tier: 'S',
    notes: 'Exoesqueleto leve. +400% carga, +150% velocidade.' },
  { name: 'Cloaking Suit GHOST', origin: 'Baluarte', year: 2046, caliber: 'Camuflagem ativa', rangeM: 0, weightKg: 8, equipe: 'PAPA', tier: 'S',
    notes: 'Traje de camuflagem ativa por meta-materiais.' }
];

/* ============================================================
 *  VEÍCULOS (24)
 * ============================================================ */
const VEICULOS = [
  /* Terrestres */
  { name: 'M1A2 Abrams', origin: 'EUA', year: 1992, caliber: '120mm + 7.62 + .50', rangeM: 4000, weightKg: 62000, equipe: 'ALFA', tier: 'S',
    notes: 'MBT americano. Blindagem Chobham.', subcat: 'Terrestre' },
  { name: 'Leopard 2A7', origin: 'Alemanha', year: 2014, caliber: '120mm + 7.62', rangeM: 4000, weightKg: 67000, equipe: 'BRAVO', tier: 'S',
    notes: 'MBT alemão moderno.', subcat: 'Terrestre' },
  { name: 'T-14 Armata', origin: 'Rússia', year: 2015, caliber: '125mm + 7.62 + 12.7', rangeM: 5000, weightKg: 48000, equipe: 'CHARLIE', tier: 'S',
    notes: 'MBT russo de nova geração. Torre não-tripulada.', subcat: 'Terrestre' },
  { name: 'Bradley M2A3', origin: 'EUA', year: 2000, caliber: '25mm + TOW', rangeM: 3000, weightKg: 30000, equipe: 'DELTA', tier: 'A',
    notes: 'IFV americano.', subcat: 'Terrestre' },
  { name: 'BMP-3', origin: 'Rússia', year: 1987, caliber: '100mm + 30mm', rangeM: 4000, weightKg: 18700, equipe: 'ECHO', tier: 'A',
    notes: 'IFV russo anfíbio.', subcat: 'Terrestre' },
  { name: 'Stryker ICV', origin: 'EUA', year: 2002, caliber: '12.7 ou 40mm', rangeM: 2000, weightKg: 16500, equipe: 'FOXTROT', tier: 'A',
    notes: 'Veículo de infantaria 8×8.', subcat: 'Terrestre' },
  { name: 'HMMWV M1151', origin: 'EUA', year: 1984, caliber: '7.62 / 12.7', rangeM: 1500, weightKg: 5560, equipe: 'GOLF', tier: 'A',
    notes: 'Humvee blindado.', subcat: 'Terrestre' },
  { name: 'MRAP MaxxPro', origin: 'EUA', year: 2007, caliber: '12.7 / 40mm', rangeM: 2000, weightKg: 15400, equipe: 'HOTEL', tier: 'A',
    notes: 'Anti-IED. Mine-Resistant.', subcat: 'Terrestre' },
  /* Aéreos */
  { name: 'AH-64E Apache', origin: 'EUA', year: 2011, caliber: '30mm + Hellfire', rangeM: 8000, weightKg: 6840, equipe: 'INDIA', tier: 'S',
    notes: 'Helicóptero de ataque.', subcat: 'Aéreo' },
  { name: 'Mi-28 Havoc', origin: 'Rússia', year: 2009, caliber: '30mm + Vikhr', rangeM: 8000, weightKg: 8095, equipe: 'JULIETT', tier: 'S',
    notes: 'Helicóptero de ataque russo.', subcat: 'Aéreo' },
  { name: 'F-35A Lightning II', origin: 'EUA', year: 2015, caliber: '25mm + AIM-120', rangeM: 150000, weightKg: 13290, equipe: 'KILO', tier: 'S',
    notes: 'Caça stealth 5ª geração.', subcat: 'Aéreo' },
  { name: 'Su-57 Felon', origin: 'Rússia', year: 2020, caliber: '30mm + R-77', rangeM: 200000, weightKg: 18000, equipe: 'MIKE', tier: 'S',
    notes: 'Caça stealth russo.', subcat: 'Aéreo' },
  { name: 'A-10 Thunderbolt II', origin: 'EUA', year: 1977, caliber: '30mm GAU-8', rangeM: 5000, weightKg: 11321, equipe: 'NOVEMBER', tier: 'A',
    notes: 'CAS warthog. Anti-tank.', subcat: 'Aéreo' },
  { name: 'V-22 Osprey', origin: 'EUA', year: 1989, caliber: '7.62 ou 12.7', rangeM: 1600000, weightKg: 15032, equipe: 'OSCAR', tier: 'A',
    notes: 'Tiltrotor de transporte.', subcat: 'Aéreo' },
  { name: 'UH-60 Black Hawk', origin: 'EUA', year: 1979, caliber: '7.62 / 12.7', rangeM: 580000, weightKg: 4819, equipe: 'PAPA', tier: 'A',
    notes: 'Helicóptero de transporte/CSAR.', subcat: 'Aéreo' },
  /* Navais */
  { name: 'Arleigh Burke DDG', origin: 'EUA', year: 1991, caliber: 'Mk 41 + Aegis', rangeM: 280000, weightKg: 9200000, equipe: 'QUEBEC', tier: 'S',
    notes: 'Destróier Aegis.', subcat: 'Naval' },
  { name: 'Submarino Virginia', origin: 'EUA', year: 2004, caliber: 'Tomahawk + Torpedos', rangeM: 1500000, weightKg: 7800000, equipe: 'ROMEO', tier: 'S',
    notes: 'SSN nuclear de ataque.', subcat: 'Naval' },
  { name: 'Type 055', origin: 'China', year: 2020, caliber: '112 célula VLS', rangeM: 280000, weightKg: 12000000, equipe: 'SIERRA', tier: 'S',
    notes: 'Cruzador chinês de superfície.', subcat: 'Naval' },
  { name: 'Lança patrulha CCB-1750', origin: 'Baluarte', year: 2043, caliber: '57mm + ESM', rangeM: 30000, weightKg: 280000, equipe: 'ALFA', tier: 'A',
    notes: 'Patrulha rápida do Baluarte. Litoral.', subcat: 'Naval' },
  /* Especiais */
  { name: 'Drone MQ-9 Reaper', origin: 'EUA', year: 2007, caliber: 'Hellfire + GBU', rangeM: 1850000, weightKg: 2223, equipe: 'BRAVO', tier: 'S',
    notes: 'UAV de ataque.', subcat: 'Drone' },
  { name: 'Drone Bayraktar TB2', origin: 'Turquia', year: 2014, caliber: 'MAM-L', rangeM: 150000, weightKg: 700, equipe: 'CHARLIE', tier: 'A',
    notes: 'UAV combat eficaz e barato.', subcat: 'Drone' },
  { name: 'Mecha Lightframe BLT', origin: 'Baluarte', year: 2046, caliber: 'Plasma cannon dorsal', rangeM: 4000, weightKg: 8500, equipe: 'DELTA', tier: 'S',
    notes: 'Mecha leve pilotado. Equipe Vanadis crossover.', subcat: 'Mecha' },
  { name: 'Jaeger Mk II Baluarte', origin: 'Baluarte', year: 2047, caliber: 'Cano de plasma 460mm', rangeM: 12000, weightKg: 1700000, equipe: 'ECHO', tier: 'S',
    notes: 'Mecha pesado para enfrentar Kaiju (universo Pacific Rim).', subcat: 'Mecha' },
  { name: 'Capsule Pod ORBITER', origin: 'Baluarte', year: 2045, caliber: '—', rangeM: 400000, weightKg: 12000, equipe: 'FOXTROT', tier: 'S',
    notes: 'Inserção orbital de operadores. Drop from space.', subcat: 'Drone' }
];

/* ============================================================
 *  DOUTRINAS
 * ============================================================ */
export const DOUTRINAS = [
  {
    id: 'cqb',
    title: 'CQB · Close-Quarters Battle',
    summary: 'Combate em ambiente fechado, distância 0-15m.',
    items: [
      'Empilhamento na porta (stack): 4 operadores em coluna, ângulos cobertos.',
      'Slicing the pie: progressão por arcos de visão antes da entrada.',
      'Dynamic vs Deliberate: rapidez vs cautela conforme inteligência.',
      'Critério das 3D: Distância, Direção, Discriminação antes do disparo.',
      'Cores de movimento: White/Yellow/Orange/Red de Cooper.'
    ]
  },
  {
    id: 'overwatch',
    title: 'Overwatch · Apoio elevado',
    summary: 'Cobertura em altitude por DM/Sniper enquanto a equipe avança.',
    items: [
      'Par sniper-spotter: cálculo de vento, distância e movimento do alvo.',
      'Hide vs FFP: posições preparadas vs improvisadas conforme tempo.',
      'Mil-dot reticle: distância via altura conhecida do alvo.',
      'Comunicação: PID positivo do alvo antes do disparo.',
      'Backup spotter para detectar contra-sniper.'
    ]
  },
  {
    id: 'fireteam',
    title: 'Fireteam · Manobra de 4',
    summary: 'Unidade base do Baluarte: 4 operadores cobrindo 360°.',
    items: [
      'TL (Team Leader), AR (Auto Rifleman), GR (Grenadier), RM (Rifleman).',
      'Movimento bound-overwatch: pares se cobrindo alternadamente.',
      'Wedge formation: TL na frente, demais em V.',
      'Buddy team: cada operador tem um par fixo.',
      'Comunicação em tríades: comando, confirmação, execução.'
    ]
  },
  {
    id: 'breach',
    title: 'Breach · Arrombamento',
    summary: 'Métodos de entrada forçada — explosivo, mecânico, balístico, térmico.',
    items: [
      'Carga linear (det cord) em portas reforçadas.',
      'Hooligan tool + Halligan para portas comuns.',
      'Shotgun breach: Mossberg 500 + breach round em dobradiças.',
      'Thermite para cofres e cofres-forte.',
      'Sempre flash-bang antes de entrada CQB.'
    ]
  },
  {
    id: 'evac',
    title: 'EVAC · Evacuação tática',
    summary: 'Extração de feridos ou refém sob fogo.',
    items: [
      'TCCC (Tactical Combat Casualty Care): 3 fases — Care Under Fire / TFC / TACEVAC.',
      'M-A-R-C-H: Massive bleed, Airway, Respiration, Circulation, Hypothermia.',
      'Tourniquet em até 60s no membro afetado.',
      'Carry: fireman / drag / sled. Manter contato visual com extração.',
      'CASEVAC vs MEDEVAC: rapidez vs cuidado durante o transporte.'
    ]
  },
  {
    id: 'recon',
    title: 'Recon · Reconhecimento',
    summary: 'Coleta de informação antes da operação principal.',
    items: [
      'LZ (Landing Zone) clareada em até 50m de raio.',
      'OP (Observation Post) em terreno elevado coberto.',
      'SALUTE: Size, Activity, Location, Unit, Time, Equipment.',
      'NODS (Night Optics) + IR strobe para identificação amigo/inimigo.',
      'Comms: PRC-117G em modo SATCOM para alcance teatro.'
    ]
  }
];

/* ============================================================
 *  Junta tudo em um array indexável
 * ============================================================ */

function pack(arr, category) {
  return arr.map((w, i) => ({
    id: `${category}-${i + 1}`,
    category,
    subcat: w.subcat || null,
    ...w
  }));
}

export const ARSENAL = [
  ...pack(PISTOLAS, 'pistolas'),
  ...pack(SMG, 'smg'),
  ...pack(RIFLES, 'rifles'),
  ...pack(SNIPERS, 'snipers'),
  ...pack(SHOTGUNS, 'shotguns'),
  ...pack(MG, 'mg'),
  ...pack(LAUNCHERS, 'launchers'),
  ...pack(MELEE, 'melee'),
  ...pack(EXPERIMENTAL, 'experimental'),
  ...pack(VEICULOS, 'veiculos')
];

export const TOTAL = ARSENAL.length;

export function byCategory(catId) {
  return ARSENAL.filter((w) => w.category === catId);
}

export function search(term) {
  if (!term) return ARSENAL;
  const t = term.toLowerCase();
  return ARSENAL.filter((w) =>
    w.name.toLowerCase().includes(t) ||
    (w.origin || '').toLowerCase().includes(t) ||
    (w.caliber || '').toLowerCase().includes(t) ||
    (w.notes || '').toLowerCase().includes(t) ||
    (w.equipe || '').toLowerCase().includes(t)
  );
}
