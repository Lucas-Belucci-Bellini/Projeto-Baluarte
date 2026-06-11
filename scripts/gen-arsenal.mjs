/* ============================================================
 * Gerador do Arsenal Expandido (híbrido: famílias curadas → variantes).
 *
 * Cada FAMÍLIA real é declarada de forma compacta com uma lista de
 * variantes/modelos reais; o script expande em uma entrada por variante,
 * herdando os dados-base (com overrides quando informado). Saída:
 *   src/data/arsenal-expandido.json  (consumido por /arsenal-expandido)
 *
 * Dados públicos (origem/tipo/calibre/alcance/ano). Variantes têm specs
 * aproximadas da família/era. Aumentar = adicionar famílias/variantes aqui.
 *
 * Uso:  node scripts/gen-arsenal.mjs
 * ============================================================ */
import { writeFileSync } from 'fs';

const CATS = [
  { id: 'infantaria', label: 'Infantaria', icon: '🔫' },
  { id: 'blindados',  label: 'Blindados',  icon: '🚜' },
  { id: 'artilharia', label: 'Artilharia', icon: '💥' },
  { id: 'aereo',      label: 'Aéreo',      icon: '✈' },
  { id: 'naval',      label: 'Naval',      icon: '🚢' },
  { id: 'misseis',    label: 'Mísseis',    icon: '🚀' },
  { id: 'drones',     label: 'Drones',     icon: '🛩' }
];

const FAM = [];
/** fam(cat, nome, origem, tipo, calibre, alcance, ano, nota, variantes)
 * variante: string (sufixo após o nome) OU objeto { s,nome,ano,cal,alc,tipo,nota } */
const fam = (cat, nome, origem, tipo, calibre, alcance, ano, nota, variantes = ['']) =>
  FAM.push({ cat, nome, origem, tipo, calibre, alcance, ano, nota, variantes });

/* ===================== INFANTARIA ===================== */
fam('infantaria','AK','🇷🇺 URSS','Fuzil de assalto','7.62×39mm','350 m',1949,'A família de fuzis mais difundida da história',
  [{s:'-47'},{s:'M',ano:1959,nota:'Modernizado, estampado e mais leve'},'MS',{s:'-74',ano:1974,cal:'5.45×39mm'},'S-74',{s:'S-74U',nota:'Carabina compacta'},'-74M','-101','-102','-103','-104','-105','-107','-108','-12','-15','-19','-9','-200','-203','-204','-205','-308']);
fam('infantaria','RPK','🇷🇺 URSS','Metralhadora leve','7.62×39mm','800 m',1961,'LMG derivada do AK',['','-74','-16','-201','-203']);
fam('infantaria','M16','🇺🇸 EUA','Fuzil de assalto','5.56×45mm','550 m',1964,'Plataforma AR-15 das forças dos EUA',['','A1','A2','A3','A4']);
fam('infantaria','M4','🇺🇸 EUA','Carabina','5.56×45mm','500 m',1994,'Carabina padrão dos EUA, modular',['',' Carbine','A1','A1 Block II']);
fam('infantaria','AR-15','🇺🇸 EUA','Fuzil semiautomático','5.56×45mm','550 m',1959,'Base civil/militar amplamente clonada',['','A2','A4','SP1']);
fam('infantaria','HK416','🇩🇪 Alemanha','Fuzil de assalto','5.56×45mm','600 m',2004,'Pistão a gás, operações especiais',['','A5','C','D']);
fam('infantaria','HK417','🇩🇪 Alemanha','Fuzil de batalha','7.62×51mm','800 m',2005,'DMR/combate, irmão do 416',['','A2',' Recce']);
fam('infantaria','G36','🇩🇪 Alemanha','Fuzil de assalto','5.56×45mm','600 m',1997,'Bundeswehr, polímero',['','K','C','V','A2']);
fam('infantaria','G3','🇩🇪 Alemanha','Fuzil de batalha','7.62×51mm','600 m',1959,'Roller-delayed, difundido mundialmente',['','A3','A4','KA4','SG1']);
fam('infantaria','MP5','🇩🇪 Alemanha','Submetralhadora','9×19mm','200 m',1966,'Padrão de CT e forças especiais',['','A2','A3','A4','A5','SD','K','/10','/40','N']);
fam('infantaria','MP7','🇩🇪 Alemanha','PDW','4.6×30mm','200 m',2001,'Perfura coletes, compacta',['','A1','A2']);
fam('infantaria','UMP','🇩🇪 Alemanha','Submetralhadora','.45 ACP','100 m',1999,'Sucessora barata do MP5',['45','40','9']);
fam('infantaria','FN FAL','🇧🇪 Bélgica','Fuzil de batalha','7.62×51mm','600 m',1953,'"O braço direito do mundo livre"',['','L1A1','50.61','50.63','PARA']);
fam('infantaria','FN SCAR','🇧🇪 Bélgica','Fuzil modular','5.56 / 7.62mm','600 m',2009,'SOCOM, configurável',['-L','-H','-SC','-H PR']);
fam('infantaria','FN Minimi','🇧🇪 Bélgica','Metralhadora leve','5.56×45mm','1000 m',1984,'Apoio de esquadra (M249 SAW)',['','Para','Mk3','7.62']);
fam('infantaria','FN MAG','🇧🇪 Bélgica','Metralhadora de uso geral','7.62×51mm','1800 m',1958,'GPMG (M240) confiável',['','58','M240B','M240L']);
fam('infantaria','FN P90','🇧🇪 Bélgica','PDW','5.7×28mm','200 m',1990,'Bullpup, carregador de 50',['','TR','Tactical']);
fam('infantaria','Steyr AUG','🇦🇹 Áustria','Fuzil bullpup','5.56×45mm','500 m',1978,'Bullpup pioneiro com óptica',['','A1','A2','A3','Para']);
fam('infantaria','Glock','🇦🇹 Áustria','Pistola','9×19mm','50 m',1982,'A pistola mais usada do mundo',['17','17 Gen5','19','19X','26','34','45','43','43X','22','23','21','30','41','20','31','40','44','47']);
fam('infantaria','SIG Sauer','🇩🇪/🇺🇸','Pistola','9×19mm','50 m',1975,'Pistolas de serviço de elite',['P226','P229','P228','P320','M17','M18','P365','P210','P225','P230','P938']);
fam('infantaria','Beretta','🇮🇹 Itália','Pistola','9×19mm','50 m',1976,'Serviço dos EUA por décadas',['92','92FS','M9','M9A3','APX','PX4','81','84','8000']);
fam('infantaria','CZ','🇨🇿 Tchéquia','Pistola','9×19mm','50 m',1975,'Robustas e precisas',['75','75 SP-01','P-07','P-09','P-10C','Shadow 2','83']);
fam('infantaria','Colt 1911','🇺🇸 EUA','Pistola','.45 ACP','50 m',1911,'A pistola militar mais icônica',['','A1','M45A1',' Government',' Commander',' Defender']);
fam('infantaria','S&W M&P','🇺🇸 EUA','Pistola','9×19mm','50 m',2005,'Polímero, polícia dos EUA',['9','40','45','Shield','2.0','M2.0 Compact']);
fam('infantaria','Walther','🇩🇪 Alemanha','Pistola','9×19mm','50 m',1929,'Da PPK clássica à PDP moderna',['PPK','P38','P99','PPQ','PDP','P5']);
fam('infantaria','HK pistola','🇩🇪 Alemanha','Pistola','9×19mm','50 m',1993,'USP/VP9/P30 de serviço',['USP','USP Tactical','VP9','P30','P2000','Mark 23']);
fam('infantaria','Makarov PM','🇷🇺 URSS','Pistola','9×18mm','50 m',1951,'Pistola soviética padrão',['','PMM']);
fam('infantaria','Tokarev TT','🇷🇺 URSS','Pistola','7.62×25mm','50 m',1930,'Clássica soviética',['-30','-33']);
fam('infantaria','Browning Hi-Power','🇧🇪 Bélgica','Pistola','9×19mm','50 m',1935,'Pioneira de alta capacidade',['','Mk III']);
fam('infantaria','Desert Eagle','🇮🇱/🇺🇸','Pistola pesada','.50 AE','60 m',1985,'Magnum semiautomática icônica',['','.357','.44','XIX']);
fam('infantaria','Taurus','🇧🇷 Brasil','Pistola','9×19mm','50 m',2013,'Pistolas brasileiras populares',['G2','G2C','G3','G3C','TH9','PT92']);
fam('infantaria','IMBEL','🇧🇷 Brasil','Fuzil de assalto','5.56 / 7.62mm','500 m',2012,'Armamento do Exército Brasileiro',['IA2','IA2 7.62','MD97','MD2']);
fam('infantaria','Dragunov','🇷🇺 URSS','Fuzil de precisão (DMR)','7.62×54mmR','800 m',1963,'Atirador designado soviético',['SVD','SVDS','SVU','SVDM']);
fam('infantaria','Barrett','🇺🇸 EUA','Fuzil antimaterial','.50 BMG','1800 m',1989,'Sniper de longo alcance',['M82','M82A1','M107','M95','MRAD']);
fam('infantaria','Accuracy Intl','🇬🇧 Reino Unido','Fuzil de precisão','.338 Lapua','1500 m',1996,'Recordes de tiro a longa distância',['AWM','AWP','AW','AX','AXMC','L96']);
fam('infantaria','Remington 700','🇺🇸 EUA','Fuzil de precisão','7.62×51mm','800 m',1962,'Base do M24/M40',['','M24','M40','MSR','PSR']);
fam('infantaria','M249 / M240','🇺🇸 EUA','Metralhadora','5.56 / 7.62mm','1000 m',1984,'Apoio de fogo de infantaria',['M249 SAW','M240B','M240L','M249 Para']);
fam('infantaria','M2 Browning','🇺🇸 EUA','Metralhadora pesada','.50 BMG','1800 m',1933,'Quase um século em serviço',['','A1','QCB']);
fam('infantaria','PKM','🇷🇺 URSS','Metralhadora de uso geral','7.62×54mmR','1500 m',1961,'GPMG soviética difundida',['','PK','PKP Pecheneg','PKT']);
fam('infantaria','Mosin-Nagant','🇷🇺 Rússia','Fuzil de ferrolho','7.62×54mmR','500 m',1891,'Fuzil histórico de duas guerras mundiais',['M1891','M1891/30','M38','M44']);
fam('infantaria','Mauser 98','🇩🇪 Alemanha','Fuzil de ferrolho','7.92×57mm','500 m',1898,'Padrão alemão por décadas',['Gewehr 98','Kar98k']);
fam('infantaria','Lee-Enfield','🇬🇧 Reino Unido','Fuzil de ferrolho','.303 British','500 m',1895,'Fuzil britânico das guerras mundiais',['SMLE','No.1 Mk III','No.4 Mk I']);
fam('infantaria','M1 Garand','🇺🇸 EUA','Fuzil semiautomático','.30-06','500 m',1936,'"A maior arma já criada" (Patton)',['','M1C','M1D']);
fam('infantaria','Thompson','🇺🇸 EUA','Submetralhadora','.45 ACP','100 m',1921,'"Tommy gun" da 2ª Guerra',['M1921','M1928','M1','M1A1']);
fam('infantaria','PPSh-41','🇷🇺 URSS','Submetralhadora','7.62×25mm','150 m',1941,'Tambor de 71, ícone soviético',['','PPS-43']);
fam('infantaria','StG 44','🇩🇪 Alemanha','Fuzil de assalto','7.92×33mm','300 m',1943,'O primeiro fuzil de assalto da história',['']);
fam('infantaria','Uzi','🇮🇱 Israel','Submetralhadora','9×19mm','200 m',1950,'SMG israelense compacta e robusta',['','Mini','Micro','Pro']);
fam('infantaria','IWI Tavor','🇮🇱 Israel','Fuzil bullpup','5.56×45mm','550 m',2009,'Bullpup compacto da FDI',['TAR-21','X95','7']);
fam('infantaria','IWI Galil','🇮🇱 Israel','Fuzil de assalto','5.56 / 7.62mm','500 m',1972,'Confiabilidade do AK',['AR','ARM','SAR','ACE 21','ACE 23','ACE 32']);
fam('infantaria','FAMAS','🇫🇷 França','Fuzil bullpup','5.56×45mm','450 m',1978,'"Le Clairon", alta cadência',['F1','G2']);
fam('infantaria','Benelli','🇮🇹 Itália','Espingarda de combate','Calibre 12','50 m',1999,'Espingardas semiautomáticas militares',['M4','M1014','M3','M2']);
fam('infantaria','RPG','🇷🇺 URSS','Lança-foguetes','85mm (ogiva)','500 m',1961,'Antitanque/antiestrutura icônico',['-7','-7V2','-16','-18','-22','-26','-29','-32']);
fam('infantaria','Carl Gustaf','🇸🇪 Suécia','Canhão sem recuo','84mm','1000 m',1948,'Multipropósito reutilizável',['M2','M3','M4']);
fam('infantaria','QBZ','🇨🇳 China','Fuzil de assalto bullpup','5.8×42mm','500 m',1995,'Família do EPL chinês',['-95','-95-1','-03','-191(convencional)']);

/* ===================== BLINDADOS ===================== */
fam('blindados','M1 Abrams','🇺🇸 EUA','Tanque principal (MBT)','120mm','4000 m',1980,'MBT a turbina dos EUA',['','IP','A1','A2','A2 SEPv2','A2 SEPv3','A2C']);
fam('blindados','Leopard 2','🇩🇪 Alemanha','MBT','120mm L/44–L/55','5000 m',1979,'Referência ocidental, exportadíssimo',['','A4','A5','A6','A7','A7V','2PL']);
fam('blindados','Leopard 1','🇩🇪 Alemanha','MBT','105mm','4000 m',1965,'MBT da Guerra Fria',['','A3','A5']);
fam('blindados','T-72','🇷🇺 URSS','MBT','125mm','4000 m',1973,'Um dos mais produzidos da história',['','A','B','B3','B3M','M1']);
fam('blindados','T-80','🇷🇺 URSS','MBT','125mm','5000 m',1976,'MBT a turbina soviético',['','U','UD','BV','BVM']);
fam('blindados','T-90','🇷🇺 Rússia','MBT','125mm','5000 m',1992,'Evolução do T-72',['','A','S','M','MS']);
fam('blindados','T-14 Armata','🇷🇺 Rússia','MBT','125mm','5000 m',2015,'Torre não tripulada',['']);
fam('blindados','Challenger','🇬🇧 Reino Unido','MBT','120mm','5000 m',1983,'Blindagem britânica Chobham/Dorchester',['1','2','3']);
fam('blindados','Leclerc','🇫🇷 França','MBT','120mm','4000 m',1992,'Autocarregador, ágil',['','S2','XLR']);
fam('blindados','Type 99','🇨🇳 China','MBT','125mm','5000 m',2001,'MBT de ponta chinês',['','A','A2']);
fam('blindados','Type 10','🇯🇵 Japão','MBT','120mm','4000 m',2012,'Leve, blindagem modular',['']);
fam('blindados','K2 Black Panther','🇰🇷 Coreia do Sul','MBT','120mm L/55','5000 m',2014,'Suspensão ativa',['']);
fam('blindados','Merkava','🇮🇱 Israel','MBT','120mm','4000 m',1979,'Motor frontal, APS Trophy',['Mk1','Mk2','Mk3','Mk4','Barak']);
fam('blindados','M4 Sherman','🇺🇸 EUA','Tanque médio','75mm','2000 m',1942,'Tanque aliado símbolo da 2ª Guerra',['','A1','A2','A3','Firefly','Easy Eight']);
fam('blindados','Tiger','🇩🇪 Alemanha','Tanque pesado','88mm','3000 m',1942,'Tanque pesado temido da 2ª Guerra',[' I',' II (Königstiger)']);
fam('blindados','Panther','🇩🇪 Alemanha','Tanque médio','75mm L/70','2500 m',1943,'Um dos melhores tanques da 2ª Guerra',['','A','G']);
fam('blindados','T-34','🇷🇺 URSS','Tanque médio','76mm / 85mm','2000 m',1940,'O tanque que mudou a guerra blindada',['/76','/85']);
fam('blindados','M48 / M60 Patton','🇺🇸 EUA','MBT','90mm / 105mm','3000 m',1952,'MBT americano da Guerra Fria',['M48','M48A5','M60','M60A1','M60A3']);
fam('blindados','M2 Bradley','🇺🇸 EUA','Veículo de combate (IFV)','25mm + TOW','3750 m',1981,'IFV de transporte + antitanque',['','A2','A3','A4']);
fam('blindados','BMP','🇷🇺 URSS','IFV','73mm / 100mm','4000 m',1966,'Família de IFV anfíbios soviéticos',['-1','-2','-3','-3M']);
fam('blindados','BTR','🇷🇺 URSS','Blindado 8×8','14.5mm / 30mm','2000 m',1960,'APC anfíbio sobre rodas',['-60','-70','-80','-82','-82A','-90']);
fam('blindados','Stryker','🇺🇸 EUA','Veículo 8×8','.50 / 30mm','2000 m',2002,'Brigadas de rodas rápidas',['','ICV','MGS','Dragoon']);
fam('blindados','M113','🇺🇸 EUA','Transporte (APC)','.50 Browning','1800 m',1960,'APC de esteira clássico',['','A1','A2','A3']);
fam('blindados','Puma','🇩🇪 Alemanha','IFV','30mm','3000 m',2015,'Dos IFV mais protegidos',['']);
fam('blindados','CV90','🇸🇪 Suécia','IFV','35–40mm','3000 m',1993,'Família modular exportada',['','Mk0','Mk III','Mk IV','120-T']);
fam('blindados','Warrior','🇬🇧 Reino Unido','IFV','30mm','2000 m',1988,'IFV britânico',['','CSP']);
fam('blindados','VBTP Guarani','🇧🇷 Brasil','Blindado 6×6','.50 / 30mm','2000 m',2014,'Anfíbio do Exército Brasileiro',['']);
fam('blindados','EE-9 Cascavel','🇧🇷 Brasil','Carro de reconhecimento','90mm','2000 m',1974,'Blindado de rodas da Engesa',['']);
fam('blindados','Type 90 / 96 / 99','🇨🇳 China','IFV/MBT','100mm / 125mm','4000 m',1990,'Blindados chineses modernos',['ZBD-04','ZBL-08','ZTZ-96']);
fam('blindados','Arjun','🇮🇳 Índia','MBT','120mm raiado','4000 m',2004,'Projeto indiano',['Mk1','Mk1A']);

/* ===================== ARTILHARIA ===================== */
fam('artilharia','M109','🇺🇸 EUA','Obus autopropulsado','155mm','30 km',1963,'Cavalo de batalha da artilharia dos EUA',['','A6 Paladin','A7']);
fam('artilharia','M777','🇺🇸 EUA','Obus rebocado','155mm','30 km',2005,'Leve (titânio), munição Excalibur',['','A2']);
fam('artilharia','PzH 2000','🇩🇪 Alemanha','Obus autopropulsado','155mm','40 km',1998,'Até 10 tiros por minuto',['']);
fam('artilharia','2S19 Msta','🇷🇺 Rússia','Obus autopropulsado','152mm','29 km',1989,'Padrão russo',['-S','-M2']);
fam('artilharia','2S3 Akatsiya','🇷🇺 URSS','Obus autopropulsado','152mm','24 km',1971,'SPG soviético clássico',['']);
fam('artilharia','Caesar','🇫🇷 França','Obus sobre caminhão','155mm','42 km',2008,'Shoot-and-scoot',['','6x6','8x8']);
fam('artilharia','K9 Thunder','🇰🇷 Coreia do Sul','Obus autopropulsado','155mm','40 km',1999,'Best-seller de exportação',['','A1']);
fam('artilharia','Archer','🇸🇪 Suécia','Obus sobre caminhão','155mm','50 km',2016,'Totalmente automatizado',['']);
fam('artilharia','HIMARS','🇺🇸 EUA','Lança-foguetes','227mm / ATACMS','300 km',2010,'Precisão GPS, alta mobilidade',['','M142']);
fam('artilharia','M270 MLRS','🇺🇸 EUA','Lança-foguetes de esteira','227mm','300 km',1983,'Saturação de área',['','A1']);
fam('artilharia','BM-21 Grad','🇷🇺 URSS','Lança-foguetes','122mm','40 km',1963,'40 tubos, difusão mundial',['','-1']);
fam('artilharia','BM-27 / BM-30','🇷🇺 URSS','MLRS pesado','220 / 300mm','90 km',1975,'Uragan e Smerch',['Uragan','Smerch']);
fam('artilharia','TOS-1','🇷🇺 Rússia','Lança-foguetes termobárico','220mm','10 km',1999,'Ogivas incendiárias/termobáricas',['','A Buratino']);
fam('artilharia','ASTROS II','🇧🇷 Brasil','MLRS','127–300mm','300 km',1983,'Modular, Exército Brasileiro',['','MK6']);
fam('artilharia','Mortar','🌍 Diversos','Morteiro','60 / 81 / 120mm','7 km',1900,'Fogo indireto de pelotão/companhia',['60mm','81mm','120mm']);

/* ===================== AÉREO ===================== */
fam('aereo','F-16 Fighting Falcon','🇺🇸 EUA','Caça multifunção','Multifunção','4220 km',1978,'Mais de 4500 produzidos',['A','B','C','D','E','F','V','Block 50','Block 70']);
fam('aereo','F-15 Eagle','🇺🇸 EUA','Caça de superioridade','Ar-ar','5550 km',1976,'Recorde de abates sem perdas',['A','C','D','E Strike Eagle','EX','QA']);
fam('aereo','F/A-18 Hornet','🇺🇸 EUA','Caça embarcado','Multifunção','3330 km',1983,'Espinha dorsal da Marinha dos EUA',['A','C','D','E Super Hornet','F','G Growler']);
fam('aereo','F-22 Raptor','🇺🇸 EUA','Caça furtivo 5ª ger.','Ar-ar','2960 km',2005,'Supercruise, supermanobrável',['']);
fam('aereo','F-35 Lightning II','🇺🇸 EUA','Caça furtivo 5ª ger.','Multifunção','2200 km',2015,'Fusão de sensores, stealth',['A','B','C']);
fam('aereo','F-14 Tomcat','🇺🇸 EUA','Interceptador embarcado','Ar-ar','2960 km',1974,'Asa variável, ícone de Top Gun',['A','B','D']);
fam('aereo','F-4 Phantom II','🇺🇸 EUA','Caça-bombardeiro','Multifunção','2600 km',1960,'Onipresente na Guerra Fria',['C','D','E','G','F-4EJ']);
fam('aereo','A-10 Thunderbolt II','🇺🇸 EUA','Ataque ao solo','GAU-8 30mm','1200 km',1977,'Caça-tanques voador (CAS)',['','C']);
fam('aereo','Su-27 Flanker','🇷🇺 URSS','Caça de superioridade','Ar-ar','3530 km',1985,'Base de uma grande família russa',['','S','SK','SM']);
fam('aereo','Su-30','🇷🇺 Rússia','Caça multifunção','Multifunção','3000 km',1996,'Biplace multifunção exportado',['','MKI','MKK','SM','MKM']);
fam('aereo','Su-35','🇷🇺 Rússia','Caça multifunção','Multifunção','3600 km',2014,'Supermanobrável',['','S']);
fam('aereo','Su-57 Felon','🇷🇺 Rússia','Caça furtivo 5ª ger.','Multifunção','3500 km',2020,'Stealth russo, vetor de empuxo',['']);
fam('aereo','Su-34','🇷🇺 Rússia','Caça-bombardeiro','Ar-terra','4000 km',2014,'Bombardeiro tático lado a lado',['']);
fam('aereo','MiG-21','🇷🇺 URSS','Caça interceptador','Ar-ar','1210 km',1959,'O jato de combate mais produzido',['','bis','MF']);
fam('aereo','MiG-29 Fulcrum','🇷🇺 URSS','Caça multifunção','Multifunção','1430 km',1982,'Caça frontal soviético',['','S','K','SMT','M']);
fam('aereo','MiG-31 Foxhound','🇷🇺 Rússia','Interceptador','Ar-ar longo','3300 km',1981,'Mach 2.8, porta o Kinzhal',['','BM','K']);
fam('aereo','J-20 Mighty Dragon','🇨🇳 China','Caça furtivo 5ª ger.','Multifunção','5500 km',2017,'5ª geração chinesa',['','A','B']);
fam('aereo','J-10','🇨🇳 China','Caça multifunção','Multifunção','1850 km',2005,'Caça leve chinês',['','B','C']);
fam('aereo','Eurofighter Typhoon','🇪🇺 Europa','Caça multifunção','Multifunção','2900 km',2003,'Consórcio UK/DE/IT/ES',['','T1','T3']);
fam('aereo','Dassault Rafale','🇫🇷 França','Caça multifunção','Multifunção','3700 km',2001,'Omnirole, embarcado',['C','B','M','F3','F4']);
fam('aereo','Mirage','🇫🇷 França','Caça multifunção','Multifunção','2400 km',1961,'Família delta francesa clássica',['III','5','F1','2000','2000-5','2000D']);
fam('aereo','Saab Gripen','🇸🇪 Suécia','Caça multifunção','Multifunção','3200 km',1996,'Baixo custo operacional (FAB)',['A','C','D','E','F']);
fam('aereo','B-52 Stratofortress','🇺🇸 EUA','Bombardeiro estratégico','32 t','16000 km',1955,'Em serviço há ~70 anos',['','G','H']);
fam('aereo','B-1 Lancer','🇺🇸 EUA','Bombardeiro supersônico','34 t','12000 km',1986,'Asa de geometria variável',['','B']);
fam('aereo','B-2 Spirit','🇺🇸 EUA','Bombardeiro furtivo','Nuclear/conv.','11000 km',1997,'Asa voadora stealth',['']);
fam('aereo','Tu-95 Bear','🇷🇺 URSS','Bombardeiro estratégico','Mísseis','15000 km',1956,'Turbo-hélice estratégico longevo',['','MS']);
fam('aereo','Tu-160 Blackjack','🇷🇺 Rússia','Bombardeiro estratégico','Cruzeiro','12300 km',1987,'Maior bombardeiro supersônico',['','M2']);
fam('aereo','C-130 Hercules','🇺🇸 EUA','Transporte tático','19 t','3800 km',1956,'Onipresente, pista curta',['','H','J','KC-130']);
fam('aereo','C-17 Globemaster III','🇺🇸 EUA','Transporte estratégico','77 t','4500 km',1995,'Carga pesada, pista curta',['']);
fam('aereo','A400M Atlas','🇪🇺 Europa','Transporte','37 t','3300 km',2013,'Ponte entre tático e estratégico',['']);
fam('aereo','KC-135 / KC-46','🇺🇸 EUA','Reabastecedor','Tanker','17000 km',1957,'Reabastecimento aéreo',['KC-135','KC-46 Pegasus']);
fam('aereo','E-3 Sentry (AWACS)','🇺🇸 EUA','Alerta aéreo (AEW&C)','Radar','9250 km',1977,'Controle de combate aéreo',['']);
fam('aereo','AH-64 Apache','🇺🇸 EUA','Helicóptero de ataque','30mm + Hellfire','480 km',1986,'O caçador de tanques voador',['A','D Longbow','E']);
fam('aereo','UH-60 Black Hawk','🇺🇸 EUA','Helicóptero utilitário','Transporte','590 km',1979,'Cavalo de batalha de transporte',['A','L','M','MH-60']);
fam('aereo','CH-47 Chinook','🇺🇸 EUA','Helicóptero de carga','Rotor duplo','740 km',1962,'Transporte pesado',['','D','F']);
fam('aereo','Mi-24 Hind','🇷🇺 URSS','Helicóptero de ataque','12.7mm + foguetes','450 km',1972,'"Carro de combate voador"',['','D','P','V','-35']);
fam('aereo','Mi-8 / Mi-17','🇷🇺 URSS','Helicóptero utilitário','Transporte','500 km',1967,'Helicóptero mais produzido do mundo',['Mi-8','Mi-17','Mi-171']);
fam('aereo','Ka-52 Alligator','🇷🇺 Rússia','Helicóptero de ataque','30mm + Vikhr','460 km',2011,'Rotores coaxiais, assento ejetável',['']);
fam('aereo','AH-1 Cobra/Viper','🇺🇸 EUA','Helicóptero de ataque','20mm + TOW','510 km',1967,'Primeiro helicóptero de ataque dedicado',['','W SuperCobra','Z Viper']);

/* ===================== NAVAL ===================== */
fam('naval','Porta-aviões Nimitz','🇺🇸 EUA','Porta-aviões nuclear','60+ aeronaves','Ilimitado',1975,'10 navios, dominância naval',['']);
fam('naval','Porta-aviões Gerald R. Ford','🇺🇸 EUA','Porta-aviões nuclear','75+ aeronaves','Ilimitado',2017,'Catapultas EMALS, maior do mundo',['']);
fam('naval','HMS Queen Elizabeth','🇬🇧 Reino Unido','Porta-aviões','40 aeronaves (F-35B)','19000 km',2017,'Maior navio da Royal Navy',['',' / Prince of Wales']);
fam('naval','Porta-aviões Fujian/Shandong','🇨🇳 China','Porta-aviões','40+ aeronaves','Global',2019,'Expansão naval chinesa',['Liaoning','Shandong','Fujian']);
fam('naval','Destroyer Arleigh Burke','🇺🇸 EUA','Destróier Aegis','VLS 96 células','Global',1991,'Defesa antimíssil BMD',['','Flight IIA','Flight III']);
fam('naval','Cruzador Ticonderoga','🇺🇸 EUA','Cruzador Aegis','VLS 122 células','Global',1983,'Escolta de porta-aviões',['']);
fam('naval','Destroyer Zumwalt','🇺🇸 EUA','Destróier furtivo','VLS + canhão','Global',2016,'Forma tumblehome, baixa assinatura',['']);
fam('naval','Type 055 Renhai','🇨🇳 China','Cruzador/Destróier','VLS 112 células','Global',2020,'Maior surface combatant chinês',['']);
fam('naval','Type 052D','🇨🇳 China','Destróier','VLS 64 células','Global',2014,'Destróier Aegis-like chinês',['']);
fam('naval','Type 45 Daring','🇬🇧 Reino Unido','Destróier antiaéreo','Sea Viper/Aster','Global',2009,'Radar SAMPSON',['']);
fam('naval','Fragata FREMM','🇫🇷🇮🇹 FR/IT','Fragata multifunção','Aster/Exocet','11000 km',2012,'Antissubmarino e antiaéreo',['']);
fam('naval','Fragata Tamandaré','🇧🇷 Brasil','Fragata','CAMM/MANSUP','7000 km',2025,'Programa da Marinha do Brasil',['']);
fam('naval','Submarino Ohio','🇺🇸 EUA','Submarino estratégico (SSBN)','24× Trident II','Ilimitado',1981,'Dissuasão nuclear dos EUA',['',' SSGN']);
fam('naval','Submarino Virginia','🇺🇸 EUA','Submarino de ataque (SSN)','Tomahawk/torpedos','Ilimitado',2004,'SSN nuclear furtivo',['','Block V']);
fam('naval','Submarino Seawolf','🇺🇸 EUA','SSN','Torpedos/Tomahawk','Ilimitado',1997,'O SSN mais silencioso',['']);
fam('naval','Submarino Los Angeles','🇺🇸 EUA','SSN','Torpedos/Tomahawk','Ilimitado',1976,'Espinha dorsal submarina por décadas',['']);
fam('naval','Submarino Borei','🇷🇺 Rússia','SSBN nuclear','16× Bulava','Ilimitado',2013,'Dissuasão nuclear naval russa',['','-A']);
fam('naval','Submarino Yasen','🇷🇺 Rússia','SSGN','Kalibr/Oniks','Ilimitado',2013,'Submarino de ataque russo moderno',['','-M']);
fam('naval','Submarino Kilo','🇷🇺 Rússia','Submarino diesel-elétrico','Torpedos/Kalibr','12000 km',1980,'"Buraco negro", muito silencioso',['','Improved 636']);
fam('naval','Submarino Type 212/214','🇩🇪 Alemanha','Submarino AIP','Torpedos','15000 km',2005,'Célula de combustível, ultra-silencioso',['212','212A','214']);
fam('naval','Submarino Scorpène','🇫🇷 França','Submarino diesel-elétrico','Torpedos/Exocet','12000 km',2005,'Exportado (inclui Brasil - Riachuelo)',['','Riachuelo']);
fam('naval','Iowa (couraçado)','🇺🇸 EUA','Couraçado','16 polegadas','Histórico',1943,'Último couraçado em serviço (até 1990s)',['']);
fam('naval','LHD Wasp/America','🇺🇸 EUA','Navio de assalto anfíbio','Helicópteros/F-35B','Global',1989,'"Porta-aviões leve" de fuzileiros',['Wasp','America']);

/* ===================== MÍSSEIS ===================== */
fam('misseis','Tomahawk','🇺🇸 EUA','Míssil de cruzeiro','Subsônico','2500 km',1983,'Ataque a terra, precisão GPS',['','Block IV','Block V']);
fam('misseis','AGM-158 JASSM','🇺🇸 EUA','Cruzeiro furtivo ar-terra','Subsônico','1000 km',2009,'Stealth, lançado de avião',['','-ER','LRASM']);
fam('misseis','Storm Shadow / SCALP','🇬🇧🇫🇷','Cruzeiro ar-terra','Subsônico','560 km',2002,'Penetra alvos endurecidos',['']);
fam('misseis','Kalibr','🇷🇺 Rússia','Míssil de cruzeiro','Sub/supersônico','2500 km',1994,'Lançado de navio/submarino',['']);
fam('misseis','Kinzhal','🇷🇺 Rússia','Hipersônico aerobalístico','Mach 10','2000 km',2018,'Lançado de ar, manobrável',['']);
fam('misseis','Avangard','🇷🇺 Rússia','Planador hipersônico','Mach 27','6000+ km',2019,'Veículo de reentrada manobrável',['']);
fam('misseis','BrahMos','🇮🇳🇷🇺','Cruzeiro supersônico','Mach 3','500 km',2006,'Anti-navio/terra versátil',['','-A','-NG']);
fam('misseis','DF (Dong Feng)','🇨🇳 China','Míssil balístico','Mach 10-25','15000 km',1990,'Família estratégica chinesa',['-15','-21','-21D','-26','-31','-41','-17']);
fam('misseis','Minuteman III','🇺🇸 EUA','ICBM em silo','Mach 23','13000 km',1970,'Tríade nuclear terrestre dos EUA',['']);
fam('misseis','Trident','🇺🇸 EUA','SLBM nuclear','Mach 24','12000 km',1990,'Lançado de submarino, MIRV',['I C4','II D5']);
fam('misseis','RS-28 Sarmat','🇷🇺 Rússia','ICBM pesado','Mach 20+','18000 km',2023,'"Satan II", múltiplas ogivas',['']);
fam('misseis','Topol / Yars','🇷🇺 Rússia','ICBM móvel','Mach 23','11000 km',1988,'ICBM sobre rodas',['Topol-M','RS-24 Yars']);
fam('misseis','Patriot','🇺🇸 EUA','Antimíssil/antiaéreo','Hit-to-kill','160 km',1981,'Defesa contra balísticos',['PAC-2','PAC-3','PAC-3 MSE']);
fam('misseis','THAAD','🇺🇸 EUA','Defesa de área terminal','Hit-to-kill','200 km',2008,'Intercepta na alta atmosfera',['']);
fam('misseis','Aegis SM','🇺🇸 EUA','Antimíssil naval','Exo/endo','700 km',2004,'Família Standard Missile',['SM-2','SM-3','SM-6']);
fam('misseis','S-300 / S-400 / S-500','🇷🇺 Rússia','SAM de longo alcance','Multicamada','400 km',1978,'Família de defesa aérea russa',['S-300','S-400 Triumf','S-500']);
fam('misseis','Iron Dome','🇮🇱 Israel','Defesa de curto alcance','Tamir','70 km',2011,'Intercepta foguetes e morteiros',['']);
fam('misseis','David\'s Sling / Arrow','🇮🇱 Israel','Antimíssil','Médio/longo','300 km',2017,'Camadas da defesa israelense',['David\'s Sling','Arrow 2','Arrow 3']);
fam('misseis','AIM-9 Sidewinder','🇺🇸 EUA','Ar-ar curto alcance','Infravermelho','35 km',1956,'O míssil ar-ar mais usado',['','L','M','X']);
fam('misseis','AIM-120 AMRAAM','🇺🇸 EUA','Ar-ar além do alcance visual','Mach 4','160 km',1991,'Radar ativo, fire-and-forget',['','C','D']);
fam('misseis','Meteor','🇪🇺 Europa','Ar-ar BVR','Ramjet','200+ km',2016,'Maior "zona de não-escape"',['']);
fam('misseis','R-37 / R-77','🇷🇺 Rússia','Ar-ar russo','Mach 4-6','200 km',2002,'BVR russo de longo alcance',['R-77','R-37M']);
fam('misseis','Harpoon','🇺🇸 EUA','Anti-navio','Subsônico','280 km',1977,'Sea-skimming padrão ocidental',['','Block II']);
fam('misseis','Exocet','🇫🇷 França','Anti-navio','Subsônico','180 km',1979,'Famoso desde as Malvinas',['MM38','MM40','AM39']);
fam('misseis','NSM / JSM','🇳🇴 Noruega','Anti-navio furtivo','Subsônico','185 km',2012,'Stealth, sea-skimming',['NSM','JSM']);
fam('misseis','Javelin FGM-148','🇺🇸 EUA','Antitanque portátil','Fire-and-forget','4 km',1996,'Top-attack, infravermelho',['']);
fam('misseis','Kornet','🇷🇺 Rússia','Antitanque guiado','Laser','10 km',1998,'Tandem HEAT, difundido',['','-EM']);
fam('misseis','TOW','🇺🇸 EUA','Antitanque guiado','Fio/rádio','3.75 km',1970,'ATGM clássico montado em veículo',['','-2','-2B']);
fam('misseis','NLAW','🇬🇧🇸🇪','Antitanque portátil','Predito','1 km',2009,'Descartável, top/direct attack',['']);
fam('misseis','Stinger FIM-92','🇺🇸 EUA','Antiaéreo portátil (MANPADS)','Infravermelho','8 km',1981,'Caça a helicópteros e aviões',['']);
fam('misseis','Igla / Verba','🇷🇺 Rússia','MANPADS','Infravermelho','6 km',1981,'MANPADS russo difundido',['Igla','Igla-S','Verba']);

/* ===================== DRONES ===================== */
fam('drones','MQ-9 Reaper','🇺🇸 EUA','UCAV (caça-mata)','Hellfire + bombas','1900 km',2007,'Ataque e vigilância de longa duração',['','ER','SeaGuardian']);
fam('drones','MQ-1 Predator','🇺🇸 EUA','UAV vigilância/ataque','Hellfire','1100 km',1995,'Pioneiro dos drones armados',['','C Gray Eagle']);
fam('drones','RQ-4 Global Hawk','🇺🇸 EUA','Reconhecimento HALE','Sensores','22000 km',2001,'Vigilância estratégica, 30h de voo',['','MQ-4C Triton']);
fam('drones','Bayraktar','🇹🇷 Turquia','UCAV','Munições MAM','150 km',2014,'Baixo custo, alto impacto',['TB2','Akıncı','Kızılelma']);
fam('drones','Anka / Aksungur','🇹🇷 Turquia','UAV MALE','Mísseis/sensores','5000 km',2018,'UAVs turcos de média altitude',['Anka','Aksungur']);
fam('drones','CH (Rainbow)','🇨🇳 China','UCAV','Mísseis ar-terra','6500 km',2017,'Concorrente do Reaper, exportado',['-4','-5','-7']);
fam('drones','Wing Loong','🇨🇳 China','UCAV','Mísseis/bombas','4000 km',2011,'Família MALE chinesa exportada',['I','II','ID']);
fam('drones','Shahed-136','🇮🇷 Irã','Munição de vagueio (kamikaze)','Ogiva ~40 kg','2500 km',2021,'Drone suicida de baixo custo',['','-131']);
fam('drones','Switchblade','🇺🇸 EUA','Munição de vagueio portátil','Ogiva leve','40 km',2011,'Lançada da mochila por um soldado',['300','600']);
fam('drones','Lancet','🇷🇺 Rússia','Munição de vagueio','Ogiva 3 kg','40 km',2019,'Anti-artilharia e blindados',['-1','-3']);
fam('drones','Orlan-10','🇷🇺 Rússia','UAV de reconhecimento','Sensores/EW','600 km',2010,'Correção de fogo de artilharia',['','-30']);
fam('drones','X-47B','🇺🇸 EUA','UCAV furtivo embarcado','Experimental','3900 km',2011,'Pousou/decolou de porta-aviões',['']);
fam('drones','Heron','🇮🇱 Israel','UAV MALE','Sensores','7000 km',1994,'Vigilância israelense difundida',['','TP','1']);
fam('drones','Hermes','🇮🇱 Israel','UAV tático','Sensores/mísseis','1000 km',2005,'Família Elbit de reconhecimento',['450','900','StarLiner']);

/* ===================== EXPANSÃO — + famílias reais (rumo a 3560) ===================== */
/* --- Infantaria: pistolas --- */
fam('infantaria','Ruger pistola','🇺🇸 EUA','Pistola','9×19mm','50 m',2007,'Pistolas civis/serviço dos EUA',['SR9','SR40','American','American Compact','Security-9','Max-9','LCP','LC9','P89','P95']);
fam('infantaria','Springfield Armory','🇺🇸 EUA','Pistola','9×19mm','50 m',2001,'XD/Hellcat populares',['XD','XD-M','XD-S','Hellcat','Hellcat Pro','911','Echelon']);
fam('infantaria','Kimber','🇺🇸 EUA','Pistola','.45 ACP','50 m',1995,'1911 refinadas',['Custom','Pro Carry','Ultra','Micro','Rapide','KDS9c']);
fam('infantaria','FN pistola','🇧🇪 Bélgica','Pistola','9×19mm','50 m',1998,'Five-seveN/509/FNX',['Five-seveN','509','509 Tactical','FNX-45','FNP-9','FNS-9','High Power 2022']);
fam('infantaria','Canik','🇹🇷 Turquia','Pistola','9×19mm','50 m',2012,'Custo-benefício turco',['TP9','TP9 SFx','TP9 Elite','METE','Mete SFT','Rival']);
fam('infantaria','Jericho 941','🇮🇱 Israel','Pistola','9×19mm','50 m',1990,'"Baby Eagle" da IWI',['','F','FS','PSL','Enhanced']);
fam('infantaria','Luger P08','🇩🇪 Alemanha','Pistola','9×19mm','50 m',1908,'Cotovelo articulado icônico',['','Artillery','Navy']);
fam('infantaria','Mauser C96','🇩🇪 Alemanha','Pistola','7.63×25mm','100 m',1896,'"Broomhandle" histórica',['','M712 Schnellfeuer']);
fam('infantaria','Webley','🇬🇧 Reino Unido','Revólver','.455','50 m',1887,'Revólver de serviço britânico',['Mk IV','Mk VI']);
fam('infantaria','S&W revólver','🇺🇸 EUA','Revólver','.357 / .44','60 m',1899,'Revólveres clássicos',['Model 10','Model 19','Model 29','Model 686','Model 442','Model 500','Model 627']);
fam('infantaria','Colt revólver','🇺🇸 EUA','Revólver','.357 / .45','60 m',1955,'Python/Anaconda/SAA',['Python','Anaconda','King Cobra','Single Action Army','Detective Special']);
fam('infantaria','Ruger revólver','🇺🇸 EUA','Revólver','.357 / .44','60 m',1985,'GP100/Redhawk robustos',['GP100','SP101','Redhawk','Super Redhawk','LCR','Blackhawk']);
fam('infantaria','Nagant M1895','🇷🇺 Rússia','Revólver','7.62×38mmR','50 m',1895,'Revólver de gás selado',['']);
fam('infantaria','Five-seveN clones','🇨🇳 China','Pistola','5.8×21mm','50 m',2006,'QSZ-92/CF-98 de serviço',['QSZ-92','QSZ-92G','CF-98','QSW-06']);
/* --- Infantaria: fuzis/clones AK e AR --- */
fam('infantaria','Zastava','🇷🇸 Sérvia','Fuzil de assalto','7.62×39 / 5.56','400 m',1970,'Família AK iugoslava/sérvia',['M70','M70AB2','M21','M77','M90','M91 (DMR)']);
fam('infantaria','Type 56','🇨🇳 China','Fuzil de assalto','7.62×39mm','400 m',1956,'AK chinês muito exportado',['','-1','-2','Type 81','Type 87']);
fam('infantaria','Vz. 58','🇨🇿 Tchecoslováquia','Fuzil de assalto','7.62×39mm','400 m',1958,'Parece AK mas é mecanismo próprio',['','P','V','Sporter']);
fam('infantaria','INSAS','🇮🇳 Índia','Fuzil de assalto','5.56×45mm','400 m',1998,'Fuzil padrão indiano',['','LMG','1B1']);
fam('infantaria','FB Beryl','🇵🇱 Polônia','Fuzil de assalto','5.56×45mm','500 m',1997,'Família polonesa (Grot moderno)',['wz.96','MSBS Grot','Mini-Beryl']);
fam('infantaria','AMD-65','🇭🇺 Hungria','Carabina','7.62×39mm','300 m',1965,'AK húngaro compacto',['','AMD-63']);
fam('infantaria','Daniel Defense','🇺🇸 EUA','Carabina AR','5.56×45mm','500 m',2009,'AR-15 premium',['DDM4','DDM4 V7','MK18','DD5']);
fam('infantaria','Knights Armament','🇺🇸 EUA','Fuzil modular','5.56 / 7.62mm','800 m',1990,'SR-15/SR-25 de elite',['SR-15','SR-25','M110 SASS','LAMG']);
fam('infantaria','LWRC','🇺🇸 EUA','Carabina AR','5.56×45mm','500 m',2006,'Pistão a gás',['IC','SIX8','REPR','IC-DI']);
fam('infantaria','LMT','🇺🇸 EUA','Fuzil modular','5.56 / 7.62mm','600 m',2000,'MARS/MWS, adotado por NZ/UK',['MARS-L','MWS','CSW','LM308']);
fam('infantaria','SIG MCX','🇺🇸 EUA','Carabina modular','5.56 / .300 BLK','500 m',2015,'Plataforma SPEAR/XM7',['','Virtus','Rattler','SPEAR XM7']);
fam('infantaria','SIG M400','🇺🇸 EUA','Fuzil semiautomático','5.56×45mm','500 m',2011,'AR-15 da SIG',['','Tread','MCX']);
fam('infantaria','M14 / M1A','🇺🇸 EUA','Fuzil de batalha','7.62×51mm','800 m',1959,'Serviço dos EUA e base de DMR',['M14','M1A','M21','Mk14 EBR','M14 DMR']);
fam('infantaria','Type 81','🇨🇳 China','Fuzil de assalto','7.62×39mm','400 m',1981,'Fuzil de transição chinês',['','-1','LMG']);
fam('infantaria','Vektor R4','🇿🇦 África do Sul','Fuzil de assalto','5.56×45mm','500 m',1980,'Galil sul-africano',['R4','R5','R6','CR-21']);
/* --- Infantaria: bullpups, DMR, SMG, escopetas, MG, sniper, lança-granadas --- */
fam('infantaria','SAR-21','🇸🇬 Singapura','Fuzil bullpup','5.56×45mm','460 m',1999,'Bullpup de Singapura',['','MMS','P','LWC']);
fam('infantaria','QBZ-191','🇨🇳 China','Fuzil de assalto','5.8×42mm','500 m',2019,'Novo fuzil convencional do EPL',['','QBU-191 (DMR)','QBZ-192']);
fam('infantaria','PSG-1','🇩🇪 Alemanha','Fuzil de precisão (DMR)','7.62×51mm','800 m',1972,'Sniper semiauto de precisão',['','MSG90']);
fam('infantaria','HK G28 / M110','🇩🇪/🇺🇸','DMR semiautomático','7.62×51mm','800 m',2010,'Atirador designado moderno',['G28','M110','M110A1 SDMR']);
fam('infantaria','SVDK / SVU','🇷🇺 Rússia','Fuzil de precisão','9.3 / 7.62mm','800 m',2006,'Variantes do Dragunov',['SVDK','SVU','SVU-A']);
fam('infantaria','MP40','🇩🇪 Alemanha','Submetralhadora','9×19mm','150 m',1940,'SMG icônica da 2ª Guerra',['','MP38']);
fam('infantaria','Sten','🇬🇧 Reino Unido','Submetralhadora','9×19mm','100 m',1941,'SMG barata de guerra',['Mk II','Mk III','Mk V']);
fam('infantaria','Sterling','🇬🇧 Reino Unido','Submetralhadora','9×19mm','200 m',1953,'SMG britânica do pós-guerra',['L2A3','Mk4','Mk5 (silenciada)']);
fam('infantaria','M3 Grease Gun','🇺🇸 EUA','Submetralhadora','.45 ACP','100 m',1943,'SMG simples da 2ª Guerra',['','A1']);
fam('infantaria','Vz.61 Škorpion','🇨🇿 Tchecoslováquia','Pistola-metralhadora','.32 ACP','100 m',1961,'Machine pistol compacta',['','EVO 3 A1']);
fam('infantaria','PP-19 Bizon','🇷🇺 Rússia','Submetralhadora','9×18mm','100 m',1993,'Carregador helicoidal de 64',['','-2','-3']);
fam('infantaria','KRISS Vector','🇺🇸 EUA','Submetralhadora','.45 ACP / 9mm','100 m',2009,'Sistema antirecuo Super V',['','SBR','SDP','Gen II']);
fam('infantaria','B&T','🇨🇭 Suíça','Submetralhadora/PDW','9×19mm','150 m',2004,'APC/MP9/TP9 de operações',['MP9','APC9','TP9','GHM9','USW']);
fam('infantaria','SIG MPX','🇺🇸 EUA','Submetralhadora','9×19mm','150 m',2015,'SMG a gás moderna',['','K','Copperhead']);
fam('infantaria','Remington 870','🇺🇸 EUA','Espingarda de combate','Calibre 12','40 m',1950,'Pump-action onipresente',['','Express','MCS','Marine Magnum']);
fam('infantaria','Mossberg','🇺🇸 EUA','Espingarda de combate','Calibre 12','40 m',1961,'500/590 militares e policiais',['500','590','590A1','Shockwave','940']);
fam('infantaria','Saiga-12','🇷🇺 Rússia','Espingarda semiautomática','Calibre 12','50 m',1997,'Escopeta no padrão AK',['','-12K','-12S']);
fam('infantaria','Franchi SPAS','🇮🇹 Itália','Espingarda de combate','Calibre 12','50 m',1979,'SPAS-12/15 dupla ação',['SPAS-12','SPAS-15']);
fam('infantaria','M60','🇺🇸 EUA','Metralhadora de uso geral','7.62×51mm','1100 m',1957,'"The Pig" do Vietnã',['','E3','E4','E6']);
fam('infantaria','MG3 / MG42','🇩🇪 Alemanha','Metralhadora de uso geral','7.62×51mm','1200 m',1942,'Alta cadência ("Hitler\'s buzzsaw")',['MG42','MG3','MG3A1']);
fam('infantaria','DShK','🇷🇺 URSS','Metralhadora pesada','12.7×108mm','2000 m',1938,'HMG soviética antiaérea/terra',['','M']);
fam('infantaria','NSV / Kord','🇷🇺 Rússia','Metralhadora pesada','12.7×108mm','2000 m',1971,'HMG soviética/russa moderna',['NSV','Kord','6P50']);
fam('infantaria','KPV','🇷🇺 URSS','Metralhadora pesada','14.5×114mm','3000 m',1949,'Calibre antimaterial pesado',['','ZPU-1','ZPU-2','ZPU-4']);
fam('infantaria','M134 Minigun','🇺🇸 EUA','Metralhadora rotativa','7.62×51mm','1000 m',1963,'Gatling elétrica de alta cadência',['','GAU-17']);
fam('infantaria','IWI Negev','🇮🇱 Israel','Metralhadora leve','5.56 / 7.62mm','1000 m',1997,'LMG israelense moderna',['','NG7','Commando']);
fam('infantaria','McMillan TAC-50','🇨🇦 Canadá','Fuzil antimaterial','.50 BMG','2000 m',2000,'Recordes de tiro mais longo',['','A1']);
fam('infantaria','CheyTac M200','🇺🇸 EUA','Fuzil antimaterial','.408 CheyTac','2300 m',2001,'Sistema de tiro de ultralongo alcance',['','Intervention']);
fam('infantaria','Steyr HS .50','🇦🇹 Áustria','Fuzil antimaterial','.50 BMG','1500 m',2004,'Antimaterial de ferrolho',['','M1']);
fam('infantaria','M203 / M320','🇺🇸 EUA','Lança-granadas acoplado','40×46mm','400 m',1969,'Lança-granadas sob o cano',['M203','M203A2','M320','M320A1']);
fam('infantaria','Mk 19','🇺🇸 EUA','Lança-granadas automático','40×53mm','1500 m',1968,'AGL montado em veículo',['','Mod 3','Mk 47']);
fam('infantaria','Milkor MGL','🇿🇦 África do Sul','Lança-granadas giratório','40mm','400 m',1983,'Tambor de 6 granadas',['','M32','MGL-140']);
fam('infantaria','GP-25 / AGS','🇷🇺 URSS','Lança-granadas','40 / 30mm','1700 m',1978,'Acoplado (GP) e automático (AGS)',['GP-25','GP-30','GP-34','AGS-17','AGS-30']);
fam('infantaria','Panzerfaust 3','🇩🇪 Alemanha','Lança-foguetes antitanque','110mm','600 m',1992,'AT recarregável alemão',['','-IT','Bunkerfaust']);
fam('infantaria','AT4','🇸🇪 Suécia','Lança-foguetes descartável','84mm','300 m',1987,'AT de uso único',['','CS','HEDP']);
fam('infantaria','M72 LAW','🇺🇸 EUA','Lança-foguetes descartável','66mm','200 m',1963,'AT leve clássico',['','A7','EC']);
/* --- Blindados: + MBTs/IFV/APC/SPAA/históricos --- */
fam('blindados','T-55 / T-54','🇷🇺 URSS','MBT','100mm','2000 m',1948,'O tanque mais produzido da história',['T-54','T-55','T-55A','T-55AM','Type 59']);
fam('blindados','T-62','🇷🇺 URSS','MBT','115mm','2000 m',1961,'Primeiro canhão de alma lisa',['','M','MV']);
fam('blindados','T-64','🇷🇺 URSS','MBT','125mm','3000 m',1966,'Autocarregador pioneiro',['','A','B','BV','BM Bulat']);
fam('blindados','PT-91 Twardy','🇵🇱 Polônia','MBT','125mm','4000 m',1995,'T-72 modernizado polonês',['','M','M2']);
fam('blindados','Ariete','🇮🇹 Itália','MBT','120mm','4000 m',1995,'MBT italiano',['','C1','AMV']);
fam('blindados','Type 74 / 90','🇯🇵 Japão','MBT','105 / 120mm','3500 m',1975,'MBTs japoneses da Guerra Fria',['Type 74','Type 90']);
fam('blindados','K1','🇰🇷 Coreia do Sul','MBT','105 / 120mm','3500 m',1987,'"Tanque do tipo 88"',['K1','K1A1','K1A2','K1E1']);
fam('blindados','Al-Khalid','🇵🇰 Paquistão','MBT','125mm','4000 m',2001,'MBT sino-paquistanês',['','I','MBT-2000']);
fam('blindados','Centurion','🇬🇧 Reino Unido','MBT','105mm','3000 m',1945,'Um dos MBTs mais bem-sucedidos',['Mk3','Mk5','Mk13']);
fam('blindados','Chieftain','🇬🇧 Reino Unido','MBT','120mm','3000 m',1966,'Blindagem pesada britânica',['Mk5','Mk10','Mk11']);
fam('blindados','AMX-30','🇫🇷 França','MBT','105mm','3000 m',1966,'MBT francês da Guerra Fria',['','B','B2']);
fam('blindados','AMX-13','🇫🇷 França','Tanque leve','75 / 90mm','2000 m',1952,'Torre oscilante, autocarregador',['','-90','-105']);
fam('blindados','Stridsvagn 103','🇸🇪 Suécia','Tanque sem torre','105mm','3000 m',1967,'"S-Tank" casamata',['A','B','C']);
fam('blindados','Strv 122','🇸🇪 Suécia','MBT','120mm','5000 m',1997,'Leopard 2 sueco',['']);
fam('blindados','BMD','🇷🇺 URSS','IFV aerotransportado','73 / 100mm','4000 m',1969,'IFV das tropas aerotransportadas (VDV)',['-1','-2','-3','-4','-4M']);
fam('blindados','BMPT Terminator','🇷🇺 Rússia','Veículo de apoio a tanques','2×30mm + Ataka','4000 m',2011,'Suporte de fogo blindado',['','-72']);
fam('blindados','Marder','🇩🇪 Alemanha','IFV','20mm','2000 m',1971,'IFV da Bundeswehr',['','A3','A5']);
fam('blindados','Lynx KF41','🇩🇪 Alemanha','IFV','35mm','3000 m',2018,'IFV modular da Rheinmetall',['KF31','KF41']);
fam('blindados','ASCOD / Pizarro','🇪🇸🇦🇹','IFV','30mm','3000 m',1996,'Base do Ajax britânico',['Pizarro','Ulan','Ajax']);
fam('blindados','K21','🇰🇷 Coreia do Sul','IFV','40mm','3000 m',2009,'IFV coreano anfíbio',['']);
fam('blindados','Namer','🇮🇱 Israel','Transporte pesado (APC)','.50 / 30mm','2000 m',2008,'Sobre chassi do Merkava',['','APC','IFV']);
fam('blindados','LAV-25','🇺🇸 EUA','Veículo 8×8','25mm','2000 m',1983,'Reconhecimento dos fuzileiros',['','-A2','LAV III']);
fam('blindados','Boxer','🇩🇪 Alemanha','Blindado 8×8 modular','30mm','3000 m',2011,'Módulos de missão intercambiáveis',['','CRV','RCH 155']);
fam('blindados','Patria AMV','🇫🇮 Finlândia','Blindado 8×8','30mm','2000 m',2004,'Exportado (Rosomak/Guarani-like)',['','XP','28A']);
fam('blindados','MRAP','🌍 Diversos','Veículo resistente a minas','.50 / 40mm','1800 m',2007,'Proteção contra IEDs',['MaxxPro','Cougar','RG-33','Bushmaster','M-ATV','JLTV']);
fam('blindados','Humvee','🇺🇸 EUA','Veículo utilitário tático','.50 / 40mm','1800 m',1984,'HMMWV onipresente',['M998','M1114','M1151','M1165']);
fam('blindados','Tigr','🇷🇺 Rússia','Veículo utilitário tático','7.62 / 30mm','2000 m',2006,'"Tigre" russo (anti-Humvee)',['','-M','GAZ-2330']);
fam('blindados','Gepard','🇩🇪 Alemanha','Antiaéreo autopropulsado','2×35mm','5500 m',1976,'SPAAG sobre chassi Leopard',['','1A2']);
fam('blindados','ZSU-23-4 Shilka','🇷🇺 URSS','Antiaéreo autopropulsado','4×23mm','2500 m',1965,'SPAAG radar-guiada',['']);
fam('blindados','Pantsir','🇷🇺 Rússia','Sistema antiaéreo míssil/canhão','2×30mm + mísseis','20 km',2012,'Defesa de ponto SHORAD',['-S1','-S2','-SM']);
fam('blindados','StuG III','🇩🇪 Alemanha','Canhão de assalto','75mm','2000 m',1940,'Caça-tanques alemão mais produzido',['','F','G']);
fam('blindados','IS (Iosif Stalin)','🇷🇺 URSS','Tanque pesado','122mm','2500 m',1943,'Tanques pesados soviéticos',['IS-1','IS-2','IS-3']);
fam('blindados','Panzer IV','🇩🇪 Alemanha','Tanque médio','75mm','2000 m',1939,'Cavalo de batalha da Wehrmacht',['Ausf. F','Ausf. G','Ausf. H','Ausf. J']);
/* --- Artilharia: + towed/SPG/MLRS/morteiros --- */
fam('artilharia','D-30','🇷🇺 URSS','Obus rebocado','122mm','15 km',1963,'Obus soviético muito difundido',['','A','2A18']);
fam('artilharia','M198','🇺🇸 EUA','Obus rebocado','155mm','30 km',1979,'Antecessor do M777',['']);
fam('artilharia','FH70','🇪🇺 Europa','Obus rebocado','155mm','24 km',1978,'Anglo-germano-italiano',['']);
fam('artilharia','G5 / G6','🇿🇦 África do Sul','Obus','155mm','50 km',1983,'Longo alcance sul-africano',['G5','G6 Rhino']);
fam('artilharia','2S5 Giatsint','🇷🇺 URSS','Obus autopropulsado','152mm','30 km',1976,'SPG de longo alcance',['','-S']);
fam('artilharia','2S7 Pion','🇷🇺 URSS','Obus pesado autopropulsado','203mm','37 km',1975,'Um dos maiores SPGs',['','-M Malka']);
fam('artilharia','2S1 Gvozdika','🇷🇺 URSS','Obus autopropulsado','122mm','15 km',1971,'SPG anfíbio leve',['']);
fam('artilharia','AS-90','🇬🇧 Reino Unido','Obus autopropulsado','155mm','30 km',1993,'SPG da artilharia britânica',['','Braveheart']);
fam('artilharia','AHS Krab','🇵🇱 Polônia','Obus autopropulsado','155mm','40 km',2017,'Torre AS-90 em chassi K9',['']);
fam('artilharia','Dana / Zuzana','🇨🇿🇸🇰','Obus sobre rodas','152 / 155mm','40 km',1981,'SPG 8×8 tchecoslovaco',['Dana','Zuzana','Zuzana 2']);
fam('artilharia','PLZ','🇨🇳 China','Obus autopropulsado','155mm','40 km',2005,'Família SPG chinesa',['-05','-45','-52']);
fam('artilharia','T-155 Fırtına','🇹🇷 Turquia','Obus autopropulsado','155mm','40 km',2004,'SPG turco baseado no K9',['','II']);
fam('artilharia','BM-13 Katyusha','🇷🇺 URSS','Lança-foguetes','132mm','8 km',1939,'"Órgão de Stalin" da 2ª Guerra',['','BM-8','BM-31']);
fam('artilharia','Tornado','🇷🇺 Rússia','Lança-foguetes','122 / 300mm','120 km',2012,'Sucessor do Grad/Smerch',['-G','-S']);
fam('artilharia','Pinaka','🇮🇳 Índia','Lança-foguetes','214mm','75 km',2000,'MLRS indiano',['Mk1','Mk2','ER']);
fam('artilharia','Chunmoo','🇰🇷 Coreia do Sul','Lança-foguetes','130–600mm','290 km',2015,'MLRS modular coreano (K239)',['']);
fam('artilharia','2S4 Tyulpan','🇷🇺 URSS','Morteiro autopropulsado','240mm','20 km',1971,'Maior morteiro em serviço',['']);
fam('artilharia','2S9 Nona','🇷🇺 URSS','Obus-morteiro autopropulsado','120mm','13 km',1981,'Apoio aerotransportado',['','-S','2S23']);
fam('artilharia','M252 / M224','🇺🇸 EUA','Morteiro','81 / 60mm','5.6 km',1987,'Morteiros de infantaria dos EUA',['M252 81mm','M224 60mm','M120 120mm']);
/* --- Aéreo: + caças/bombardeiros/transporte/helos/patrulha --- */
fam('aereo','F-5 Tiger','🇺🇸 EUA','Caça leve','Multifunção','1400 km',1962,'Caça leve muito exportado',['A','E Tiger II','F','T-38 Talon']);
fam('aereo','F-104 Starfighter','🇺🇸 EUA','Interceptador','Ar-ar','1250 km',1958,'"Foguete tripulado"',['A','G','S']);
fam('aereo','A-4 Skyhawk','🇺🇸 EUA','Ataque leve embarcado','Ar-terra','3200 km',1956,'Ataque leve longevo (usado pela FAB)',['','E','F','M','AF-1']);
fam('aereo','AV-8 Harrier','🇬🇧🇺🇸','Caça VTOL','Multifunção','2200 km',1969,'Decolagem vertical embarcada',['GR.7','GR.9','AV-8B','Sea Harrier']);
fam('aereo','F-117 Nighthawk','🇺🇸 EUA','Ataque furtivo','Bombas guiadas','1700 km',1983,'Primeiro avião furtivo operacional',['']);
fam('aereo','MiG-23 / MiG-27','🇷🇺 URSS','Caça-bombardeiro','Multifunção','2000 km',1970,'Asa de geometria variável',['MiG-23','MiG-23ML','MiG-27']);
fam('aereo','MiG-25 Foxbat','🇷🇺 URSS','Interceptador','Ar-ar','1730 km',1970,'Mach 3 de alta altitude',['','PD','RB']);
fam('aereo','Su-25 Frogfoot','🇷🇺 URSS','Ataque ao solo','30mm + foguetes','1000 km',1981,'CAS soviético blindado',['','SM','T','UB']);
fam('aereo','Su-24 Fencer','🇷🇺 URSS','Caça-bombardeiro','Ar-terra','2800 km',1974,'Bombardeiro de penetração',['','M','MR']);
fam('aereo','J-7 / J-8','🇨🇳 China','Caça interceptador','Ar-ar','2200 km',1966,'MiG-21/derivados chineses',['J-7','J-7E','J-8','J-8F']);
fam('aereo','JF-17 Thunder','🇵🇰🇨🇳','Caça multifunção','Multifunção','3000 km',2007,'Caça leve sino-paquistanês',['','Block II','Block III']);
fam('aereo','HAL Tejas','🇮🇳 Índia','Caça leve','Multifunção','1700 km',2015,'Caça delta indiano',['Mk1','Mk1A']);
fam('aereo','KAI T-50 / FA-50','🇰🇷 Coreia do Sul','Treinador/ataque leve','Multifunção','1850 km',2005,'Treinador supersônico/ataque',['T-50','TA-50','FA-50']);
fam('aereo','Mitsubishi F-2','🇯🇵 Japão','Caça multifunção','Multifunção','2900 km',2000,'"Super F-16" japonês',['']);
fam('aereo','SEPECAT Jaguar','🇬🇧🇫🇷','Ataque','Ar-terra','1400 km',1973,'Ataque anglo-francês',['A','S','IS','IM']);
fam('aereo','Panavia Tornado','🇪🇺 Europa','Caça-bombardeiro','Multifunção','3890 km',1979,'IDS/ADV/ECR',['IDS','ADV','ECR','GR4']);
fam('aereo','BAE Hawk','🇬🇧 Reino Unido','Treinador/ataque leve','Multifunção','2520 km',1976,'Treinador a jato dos Red Arrows',['T1','100','200','128']);
fam('aereo','L-39 Albatros','🇨🇿 Tchecoslováquia','Treinador a jato','Leve','1100 km',1972,'Treinador do Bloco Oriental',['','ZA','NG']);
fam('aereo','Embraer Super Tucano','🇧🇷 Brasil','Ataque leve turboélice','Ar-terra','1500 km',2003,'A-29, COIN e treinamento',['EMB-312','A-29A','A-29B']);
fam('aereo','Tu-22M Backfire','🇷🇺 URSS','Bombardeiro supersônico','Cruzeiro','6800 km',1972,'Bombardeiro de longo alcance',['','M3']);
fam('aereo','Xian H-6','🇨🇳 China','Bombardeiro estratégico','Mísseis','6000 km',1969,'Derivado do Tu-16',['','K','N']);
fam('aereo','C-5 Galaxy','🇺🇸 EUA','Transporte estratégico','120 t','4400 km',1970,'Um dos maiores aviões militares',['','B','M']);
fam('aereo','An-124 Ruslan','🇺🇦 URSS','Transporte estratégico','150 t','4800 km',1986,'Cargueiro pesado gigante',['','-100']);
fam('aereo','Il-76','🇷🇺 URSS','Transporte estratégico','50 t','4400 km',1974,'Cargueiro soviético difundido',['','MD','MF','A-50 AWACS']);
fam('aereo','Y-20 Kunpeng','🇨🇳 China','Transporte estratégico','66 t','7800 km',2016,'Cargueiro pesado chinês',['','U (tanker)']);
fam('aereo','Embraer KC-390','🇧🇷 Brasil','Transporte/reabastecedor','26 t','5000 km',2019,'Cargueiro a jato da Embraer',['','Millennium']);
fam('aereo','P-8 Poseidon','🇺🇸 EUA','Patrulha marítima','Torpedos/Harpoon','2200 km',2013,'Caça a submarinos sobre 737',['']);
fam('aereo','P-3 Orion','🇺🇸 EUA','Patrulha marítima','Torpedos','2490 km',1962,'Patrulha ASW clássica',['','C','CUP']);
fam('aereo','U-2 Dragon Lady','🇺🇸 EUA','Reconhecimento de alta altitude','Sensores','11000 km',1956,'Espião de grande altitude',['','S','R']);
fam('aereo','E-2 Hawkeye','🇺🇸 EUA','Alerta aéreo embarcado','Radar','2700 km',1964,'AEW&C de porta-aviões',['C','D Advanced']);
fam('aereo','Mi-28 Havoc','🇷🇺 Rússia','Helicóptero de ataque','30mm + Ataka','1100 km',2006,'Caça-tanques russo blindado',['','N','NM']);
fam('aereo','SH-60 / MH-60 Seahawk','🇺🇸 EUA','Helicóptero naval','Torpedos/Hellfire','830 km',1984,'Versão naval do Black Hawk',['SH-60B','MH-60R','MH-60S']);
fam('aereo','CH-53','🇺🇸 EUA','Helicóptero de carga pesada','Transporte','1000 km',1966,'Transporte pesado dos fuzileiros',['D','E Super Stallion','K King Stallion']);
fam('aereo','UH-1 Huey','🇺🇸 EUA','Helicóptero utilitário','Transporte/armado','510 km',1959,'Ícone do Vietnã',['B','D','H','N','Y Venom']);
fam('aereo','NH90','🇪🇺 Europa','Helicóptero médio','Transporte/naval','800 km',2007,'Helicóptero europeu multifunção',['TTH','NFH']);
fam('aereo','Eurocopter Tiger','🇪🇺 Europa','Helicóptero de ataque','30mm + mísseis','800 km',2003,'Helicóptero de ataque europeu',['HAP','HAD','UHT','ARH']);
fam('aereo','Z-10 / Z-19','🇨🇳 China','Helicóptero de ataque','30mm + HJ','800 km',2012,'Helicópteros de ataque chineses',['Z-10','Z-19','Z-10ME']);
/* --- Naval: + porta-aviões/destróieres/fragatas/submarinos --- */
fam('naval','Porta-aviões Kuznetsov','🇷🇺 Rússia','Porta-aviões','40+ aeronaves','Global',1990,'Único porta-aviões russo (STOBAR)',['']);
fam('naval','Charles de Gaulle','🇫🇷 França','Porta-aviões nuclear','40 aeronaves','Global',2001,'Único CVN francês',['']);
fam('naval','Cavour / Garibaldi','🇮🇹 Itália','Porta-aviões leve','F-35B/Harrier','Global',1985,'Porta-aeronaves italianos',['Garibaldi','Cavour','Trieste']);
fam('naval','Vikrant / Vikramaditya','🇮🇳 Índia','Porta-aviões','MiG-29K','Global',2013,'Porta-aviões indianos',['Vikramaditya','Vikrant']);
fam('naval','Destroyer Sovremenny','🇷🇺 URSS','Destróier','Moskit/130mm','Global',1980,'Anti-navio soviético',['']);
fam('naval','Destroyer Udaloy','🇷🇺 URSS','Destróier ASW','Torpedos/SAM','Global',1980,'Antissubmarino soviético',['','II']);
fam('naval','Destroyer Kongo/Atago/Maya','🇯🇵 Japão','Destróier Aegis','VLS','Global',1993,'Aegis da JMSDF',['Kongo','Atago','Maya']);
fam('naval','Sejong the Great','🇰🇷 Coreia do Sul','Destróier Aegis','VLS 128','Global',2008,'KDX-III, muitas células VLS',['','Batch II']);
fam('naval','Fragata Type 054A','🇨🇳 China','Fragata','VLS 32','Global',2008,'Fragata multifunção chinesa difundida',['','054B']);
fam('naval','Fragata Talwar/Shivalik','🇮🇳 Índia','Fragata','BrahMos/Shtil','Global',2003,'Fragatas furtivas indianas',['Talwar','Shivalik','Nilgiri']);
fam('naval','Fragata Type 23 Duke','🇬🇧 Reino Unido','Fragata ASW','Sea Ceptor','Global',1990,'Fragata antissubmarino britânica',['','Type 26','Type 31']);
fam('naval','Fragata Álvaro de Bazán','🇪🇸 Espanha','Fragata Aegis','VLS 48','Global',2002,'F100, base de exportações',['F100','F110']);
fam('naval','Fragata Niterói','🇧🇷 Brasil','Fragata','Exocet/canhão','7000 km',1976,'Classe Niterói da Marinha do Brasil',['','Barroso']);
fam('naval','Corveta Visby','🇸🇪 Suécia','Corveta furtiva','Canhão/mísseis','Litoral',2000,'Stealth de assinatura ínfima',['']);
fam('naval','Corveta Steregushchy','🇷🇺 Rússia','Corveta','Kalibr/canhão','Litoral',2007,'Corveta russa moderna',['','Gremyashchy 20385']);
fam('naval','Corveta Tarantul','🇷🇺 URSS','Barco-míssil','Moskit/P-15','Litoral',1979,'Lancha lança-mísseis',['']);
fam('naval','LCS','🇺🇸 EUA','Navio de combate litorâneo','Modular','Litoral',2008,'Modular Freedom/Independence',['Freedom','Independence']);
fam('naval','Submarino Typhoon','🇷🇺 URSS','SSBN','20× R-39','Ilimitado',1981,'Maior submarino já construído',['']);
fam('naval','Submarino Delta','🇷🇺 URSS','SSBN','16× SLBM','Ilimitado',1972,'Espinha dorsal estratégica soviética',['III','IV']);
fam('naval','Submarino Akula','🇷🇺 URSS','SSN','Torpedos/Granat','Ilimitado',1986,'SSN silencioso soviético',['','Improved','II']);
fam('naval','Submarino Oscar II','🇷🇺 URSS','SSGN','24× P-700 Granit','Ilimitado',1985,'Caçador de porta-aviões',['']);
fam('naval','Submarino Type 094 Jin','🇨🇳 China','SSBN','12× JL-2/3','Ilimitado',2007,'Dissuasão nuclear naval chinesa',['']);
fam('naval','Submarino Type 093 Shang','🇨🇳 China','SSN','Torpedos/YJ-18','Ilimitado',2006,'SSN de ataque chinês',['','A','B']);
fam('naval','Submarino Astute','🇬🇧 Reino Unido','SSN','Tomahawk/Spearfish','Ilimitado',2010,'SSN britânico moderno',['']);
fam('naval','Submarino Soryu / Taigei','🇯🇵 Japão','Submarino AIP/Li-ion','Torpedos/Harpoon','Global',2009,'SSK japonês de ponta',['Soryu','Taigei']);
fam('naval','Submarino Collins','🇦🇺 Austrália','Submarino diesel-elétrico','Torpedos/Harpoon','Global',1996,'SSK australiano',['']);
fam('naval','Type 075 / 071','🇨🇳 China','Navio de assalto anfíbio','Helicópteros/docas','Global',2007,'LHD/LPD anfíbios chineses',['Type 071','Type 075']);
fam('naval','Mistral','🇫🇷 França','Navio de assalto anfíbio','Helicópteros','Global',2006,'LHD projetada francesa',['']);
/* --- Mísseis: + ar-ar/SAM/anti-navio/cruzeiro/balístico/ATGM/MANPADS --- */
fam('misseis','AIM-7 Sparrow','🇺🇸 EUA','Ar-ar BVR (semiativo)','Radar SARH','70 km',1958,'BVR clássico ocidental',['','E','M','RIM-7 Sea Sparrow']);
fam('misseis','AIM-54 Phoenix','🇺🇸 EUA','Ar-ar longo alcance','Radar ativo','190 km',1974,'Arma do F-14',['','A','C']);
fam('misseis','IRIS-T','🇪🇺 Europa','Ar-ar curto alcance','Infravermelho','25 km',2005,'WVR europeu (também SLM SAM)',['','SLM','SLS']);
fam('misseis','MICA','🇫🇷 França','Ar-ar curto/BVR','IR/Radar','80 km',1996,'Versátil do Rafale/Mirage',['IR','EM','NG','VL']);
fam('misseis','Python / Derby','🇮🇱 Israel','Ar-ar','IR / Radar','100 km',1978,'Família israelense (também SPYDER)',['Python-4','Python-5','Derby','I-Derby ER']);
fam('misseis','PL (Pi Li)','🇨🇳 China','Ar-ar','IR / Radar','200 km',1990,'Família ar-ar chinesa',['PL-5','PL-8','PL-10','PL-12','PL-15','PL-21']);
fam('misseis','R-27 / R-73','🇷🇺 URSS','Ar-ar','IR / Radar','110 km',1984,'Padrão de caças russos',['R-27R','R-27ER','R-73','R-74']);
fam('misseis','RIM-116 RAM','🇺🇸🇩🇪','Antimíssil naval de ponto','IR/anti-radiação','9 km',1992,'Defesa de ponto contra anti-navio',['','Block 2']);
fam('misseis','ESSM','🇺🇸 EUA','Antiaéreo naval','Radar semiativo/ativo','50 km',2004,'Sea Sparrow evoluído',['','Block 2']);
fam('misseis','Crotale / VL MICA','🇫🇷 França','SAM de curto alcance','Radar/IR','20 km',1971,'Defesa de ponto francesa',['Crotale','Crotale NG','VL MICA']);
fam('misseis','Rapier','🇬🇧 Reino Unido','SAM de curto alcance','Comando óptico','8 km',1971,'SHORAD britânico',['','FSC','Jernas']);
fam('misseis','Aster','🇪🇺 Europa','SAM naval/terrestre','Radar ativo','120 km',2001,'SAMP/T e naval (Aster 15/30)',['15','30','30 B1NT']);
fam('misseis','Buk','🇷🇺 URSS','SAM médio alcance','Radar semiativo','50 km',1979,'"SA-11/17" móvel',['M1','M2','M3']);
fam('misseis','HQ (Hong Qi)','🇨🇳 China','SAM','Radar','200 km',1990,'Família SAM chinesa',['HQ-7','HQ-9','HQ-16','HQ-22']);
fam('misseis','Akash','🇮🇳 Índia','SAM médio alcance','Radar','30 km',2014,'SAM indiano',['','-1S','-NG']);
fam('misseis','S-75 / S-125 / S-200','🇷🇺 URSS','SAM (Guerra Fria)','Radar','300 km',1957,'Família SAM soviética histórica',['S-75 Dvina','S-125 Neva','S-200 Angara']);
fam('misseis','P-800 Oniks / P-270 Moskit','🇷🇺 Rússia','Anti-navio supersônico','Mach 2-3','600 km',1987,'Anti-navio russo pesado',['Oniks','Moskit','Yakhont']);
fam('misseis','Kh-35 Uran','🇷🇺 Rússia','Anti-navio','Subsônico','260 km',2003,'"Harpoonski"',['','-U','-UE']);
fam('misseis','YJ (Ying Ji)','🇨🇳 China','Anti-navio','Sub/supersônico','540 km',1998,'Família anti-navio chinesa',['YJ-83','YJ-12','YJ-18','YJ-62']);
fam('misseis','Hsiung Feng','🇹🇼 Taiwan','Anti-navio','Sub/supersônico','400 km',1990,'Família anti-navio taiwanesa',['I','II','III']);
fam('misseis','RBS-15','🇸🇪 Suécia','Anti-navio','Subsônico','250 km',1985,'Anti-navio sueco',['Mk2','Mk3','Mk4 Gungnir']);
fam('misseis','AGM-86 ALCM','🇺🇸 EUA','Cruzeiro lançado de ar','Subsônico','2400 km',1982,'Cruzeiro estratégico do B-52',['B','C','D']);
fam('misseis','Kh-55 / Kh-101','🇷🇺 Rússia','Cruzeiro estratégico','Subsônico','5500 km',1984,'Cruzeiro de longo alcance',['Kh-55','Kh-101','Kh-102','Kh-555']);
fam('misseis','Iskander','🇷🇺 Rússia','Míssil balístico tático','Mach 6-7','500 km',2006,'SRBM manobrável (e Iskander-K)',['-M','-K','-E']);
fam('misseis','Scud','🇷🇺 URSS','Míssil balístico tático','Mach 5','700 km',1957,'SRBM histórico muito copiado',['B','C','D']);
fam('misseis','ATACMS / PrSM','🇺🇸 EUA','Míssil balístico tático','Mach 3','500 km',1991,'Lançado do HIMARS/M270',['ATACMS','PrSM']);
fam('misseis','Hyunmoo','🇰🇷 Coreia do Sul','Míssil balístico/cruzeiro','Mach 6+','800 km',2009,'Família coreana',['-2','-3','-4','-5']);
fam('misseis','Shahab / Fateh','🇮🇷 Irã','Míssil balístico','Mach 7+','2000 km',1998,'Família balística iraniana',['Shahab-3','Fateh-110','Zolfaghar','Khorramshahr']);
fam('misseis','Shaheen / Ghauri','🇵🇰 Paquistão','Míssil balístico','Mach 8+','2700 km',1999,'Dissuasão paquistanesa',['Shaheen-1','Shaheen-2','Shaheen-3','Ghauri']);
fam('misseis','Agni','🇮🇳 Índia','Míssil balístico','Mach 24','8000 km',1989,'Dissuasão estratégica indiana',['-I','-II','-III','-IV','-V']);
fam('misseis','Spike','🇮🇱 Israel','Antitanque guiado','Fire-and-forget','25 km',1981,'Família ATGM israelense',['SR','MR','LR','LR2','ER','NLOS']);
fam('misseis','Milan','🇪🇺 Europa','Antitanque guiado','SACLOS','2 km',1972,'ATGM franco-alemão clássico',['','2','3','ER']);
fam('misseis','HOT','🇪🇺 Europa','Antitanque guiado','SACLOS','4 km',1977,'ATGM de helicóptero/veículo',['','2','3']);
fam('misseis','Konkurs / Fagot / Metis','🇷🇺 URSS','Antitanque guiado','SACLOS','4 km',1970,'Família ATGM soviética',['Konkurs','Fagot','Metis-M']);
fam('misseis','Malyutka (Sagger)','🇷🇺 URSS','Antitanque guiado','MCLOS','3 km',1963,'ATGM histórico (Guerra do Yom Kippur)',['','-2','-P']);
fam('misseis','HJ (Hong Jian)','🇨🇳 China','Antitanque guiado','SACLOS/laser','10 km',1990,'Família ATGM chinesa',['HJ-8','HJ-9','HJ-10','HJ-12']);
fam('misseis','Strela (SA-7)','🇷🇺 URSS','MANPADS','Infravermelho','4 km',1968,'MANPADS histórico difundido',['Strela-2','Strela-3']);
fam('misseis','Mistral','🇫🇷 França','MANPADS','Infravermelho','6 km',1988,'MANPADS francês',['','2','3']);
fam('misseis','Starstreak','🇬🇧 Reino Unido','MANPADS de alta velocidade','Laser (3 dardos)','7 km',1997,'Mach 4, difícil de enganar',['','II']);
fam('misseis','QW / FN-6','🇨🇳 China','MANPADS','Infravermelho','6 km',1994,'MANPADS chineses exportados',['QW-1','QW-2','FN-6','FN-16']);
fam('misseis','AGM-88 HARM','🇺🇸 EUA','Antirradiação','Anti-radar','150 km',1985,'Supressão de defesas (SEAD)',['','-ER','AARGM']);
fam('misseis','AGM-65 Maverick','🇺🇸 EUA','Ar-terra tático','TV/IR/laser','22 km',1972,'Ataque de precisão ar-terra',['A','B','D','G','H']);
fam('misseis','Zircon','🇷🇺 Rússia','Anti-navio hipersônico','Mach 9','1000 km',2022,'Cruzeiro hipersônico naval',['']);
/* --- Drones: + ISR/UCAV/loitering --- */
fam('drones','RQ-7 Shadow','🇺🇸 EUA','UAV tático','Sensores','125 km',2002,'Reconhecimento de brigada',['','-M','V2']);
fam('drones','RQ-11 Raven','🇺🇸 EUA','Mini-UAV lançado à mão','Sensores','10 km',2003,'O drone militar mais produzido',['','B','DDL']);
fam('drones','ScanEagle','🇺🇸 EUA','UAV de longa duração','Sensores','100 km',2004,'ISR de catapulta',['','RQ-21 Blackjack']);
fam('drones','RQ-170 Sentinel','🇺🇸 EUA','UAV furtivo de reconhecimento','Sensores','Classificado',2007,'"Besta de Kandahar"',['']);
fam('drones','MQ-8 Fire Scout','🇺🇸 EUA','Helicóptero não tripulado','Sensores','180 km',2009,'VTUAV naval',['B','C']);
fam('drones','XQ-58 Valkyrie','🇺🇸 EUA','UCAV "wingman" furtivo','Experimental','5500 km',2019,'Drone leal de baixo custo',['']);
fam('drones','Harpy / Harop','🇮🇱 Israel','Munição de vagueio anti-radar','Ogiva','1000 km',1990,'Loitering anti-radiação',['Harpy','Harop','Mini Harpy']);
fam('drones','Searcher / Heron','🇮🇱 Israel','UAV MALE','Sensores','350 km',1992,'ISR israelense exportado',['Searcher II','Heron 1','Heron TP']);
fam('drones','Mohajer / Ababil','🇮🇷 Irã','UAV ISR/ataque','Mísseis/sensores','2000 km',1985,'Famílias de UAV iranianas',['Mohajer-6','Ababil-3','Ababil-5']);
fam('drones','Shahed-129','🇮🇷 Irã','UCAV MALE','Mísseis','1700 km',2012,'MALE armado iraniano',['','-191 Saeqeh']);
fam('drones','Okhotnik','🇷🇺 Rússia','UCAV furtivo pesado','Bombas/mísseis','6000 km',2019,'Asa voadora de combate (S-70)',['']);
fam('drones','Orion / Forpost','🇷🇺 Rússia','UAV MALE','Sensores/mísseis','250 km',2016,'MALE russo',['Orion','Forpost','Forpost-R']);
fam('drones','Watchkeeper','🇬🇧 Reino Unido','UAV tático','Sensores','150 km',2010,'ISR do Exército britânico',['WK450']);
fam('drones','nEUROn / Taranis','🇪🇺 Europa','UCAV furtivo (demonstrador)','Experimental','Classificado',2012,'Demonstradores de combate furtivo',['nEUROn','Taranis']);
fam('drones','Hero (UVision)','🇮🇱 Israel','Munição de vagueio','Ogiva','40 km',2016,'Família loitering modular',['Hero-30','Hero-120','Hero-400']);
fam('drones','Warmate','🇵🇱 Polônia','Munição de vagueio','Ogiva leve','30 km',2017,'Loitering tático polonês',['','TL']);
fam('drones','Coyote','🇺🇸 EUA','Drone-interceptor / enxame','Lançável em tubo','15 km',2018,'Anti-drone e enxame',['Block 1','Block 2','Block 3']);

/* ===================== EXPANSÃO 2 — + famílias reais ===================== */
/* --- Infantaria: pistolas/revólveres adicionais --- */
fam('infantaria','Kel-Tec','🇺🇸 EUA','Pistola','9×19mm','50 m',2000,'Subcompactas e PMR',['P-11','P-32','P-3AT','PF-9','PMR-30','P-17','P-15']);
fam('infantaria','Stechkin APS','🇷🇺 URSS','Pistola automática','9×18mm','100 m',1951,'Pistola seletiva soviética',['','APB','OTs-33 Pernach']);
fam('infantaria','PSM','🇷🇺 URSS','Pistola de bolso','5.45×18mm','25 m',1973,'Fina, para oficiais',['']);
fam('infantaria','Radom','🇵🇱 Polônia','Pistola','9×19 / 9×18mm','50 m',1935,'Família polonesa (Vis a PR-15)',['Vis wz.35','P-64','P-83','PR-15 Ragun']);
fam('infantaria','Tanfoglio','🇮🇹 Itália','Pistola','9×19mm','50 m',1980,'Clones CZ de competição',['Stock','Force','Stock II','Limited']);
fam('infantaria','Star','🇪🇸 Espanha','Pistola','9×19mm','50 m',1934,'Pistolas espanholas clássicas',['Model B','BM','30M','Firestar']);
fam('infantaria','Astra','🇪🇸 Espanha','Pistola','9×19mm','50 m',1921,'Pistolas espanholas históricas',['400','600','A-80','A-100']);
fam('infantaria','Lahti','🇫🇮 Finlândia','Pistola','9×19mm','50 m',1935,'L-35 finlandesa robusta',['L-35','m/40']);
fam('infantaria','Chiappa Rhino','🇮🇹 Itália','Revólver','.357 Magnum','60 m',2009,'Cano alinhado ao tambor inferior',['30DS','40DS','50DS','60DS']);
fam('infantaria','Manurhin MR73','🇫🇷 França','Revólver','.357 Magnum','60 m',1973,'Revólver de elite francês (GIGN)',['','Gendarmerie','Sport']);
fam('infantaria','Korth','🇩🇪 Alemanha','Revólver','.357 Magnum','60 m',1965,'Revólveres de alta precisão',['Combat','Sky Marshal','Mongoose']);
fam('infantaria','Nagant pós','🇧🇪 Bélgica','Revólver','7.5mm','50 m',1878,'Revólveres Nagant europeus',['M1878','M1895']);
fam('infantaria','Webley-Fosbery','🇬🇧 Reino Unido','Revólver automático','.455','50 m',1901,'Revólver semiautomático curioso',['']);
fam('infantaria','FN Five-seveN / 509','🇧🇪 Bélgica','Pistola','5.7 / 9mm','50 m',1998,'Famílias modernas da FN',['Five-seveN Mk2','509 Tactical','509 LS Edge','503']);
fam('infantaria','Arex','🇸🇮 Eslovênia','Pistola','9×19mm','50 m',2010,'Rex Zero/Delta',['Rex Zero 1','Rex Alpha','Rex Delta']);
fam('infantaria','Grand Power','🇸🇰 Eslováquia','Pistola','9×19mm','50 m',2002,'Cano rotativo',['K100','P11','P1','Stribog (SMG)']);
/* --- Infantaria: fuzis de serviço por país --- */
fam('infantaria','Howa','🇯🇵 Japão','Fuzil de assalto','5.56×45mm','500 m',1989,'Fuzis das JSDF',['Type 64','Type 89','Type 20']);
fam('infantaria','Daewoo K2','🇰🇷 Coreia do Sul','Fuzil de assalto','5.56×45mm','500 m',1984,'Fuzil padrão sul-coreano',['K1A','K2','K2C','K2C1']);
fam('infantaria','T65 / T91','🇹🇼 Taiwan','Fuzil de assalto','5.56×45mm','500 m',1976,'Fuzis taiwaneses',['T65','T65K2','T86','T91']);
fam('infantaria','Pindad','🇮🇩 Indonésia','Fuzil de assalto','5.56×45mm','500 m',1991,'SS1/SS2 indonésios',['SS1','SS2','SS2-V4','SS3']);
fam('infantaria','CZ BREN','🇨🇿 Tchéquia','Fuzil de assalto','5.56 / 7.62mm','500 m',2009,'Fuzil modular tcheco',['805 BREN','BREN 2','BREN 2 BR']);
fam('infantaria','FN 2000','🇧🇪 Bélgica','Fuzil bullpup','5.56×45mm','500 m',2001,'Bullpup com ejeção frontal',['','Tactical','S']);
fam('infantaria','Malyuk','🇺🇦 Ucrânia','Fuzil bullpup','5.45 / 7.62mm','500 m',2017,'Bullpup ucraniano (Vulcan-M)',['']);
fam('infantaria','Norinco CQ','🇨🇳 China','Fuzil de assalto','5.56×45mm','500 m',1980,'Clone chinês do M16',['','Type CQ-A','CQ 5.56']);
fam('infantaria','Vektor CR-21','🇿🇦 África do Sul','Fuzil bullpup','5.56×45mm','500 m',1997,'Bullpup sul-africano',['']);
fam('infantaria','SAR 80 / SR 88','🇸🇬 Singapura','Fuzil de assalto','5.56×45mm','500 m',1980,'Fuzis de Singapura',['SAR 80','SR 88','SR 88A']);
fam('infantaria','Vz.52 / Vz.58','🇨🇿 Tchecoslováquia','Fuzil','7.62mm','400 m',1952,'Fuzis tchecoslovacos',['vz.52','vz.52/57']);
fam('infantaria','SKS','🇷🇺 URSS','Carabina semiautomática','7.62×39mm','400 m',1945,'Carabina pré-AK muito difundida',['','Type 56 carbine','M59/66']);
fam('infantaria','Ruger Mini','🇺🇸 EUA','Carabina','5.56 / 7.62×39','400 m',1973,'Mini-14/Mini-30',['Mini-14','Mini-30','AC-556']);
/* --- Infantaria: SMG/escopeta/MG/sniper/lançador adicionais --- */
fam('infantaria','PP-19-01 Vityaz','🇷🇺 Rússia','Submetralhadora','9×19mm','200 m',2004,'SMG russa baseada no AK',['','-SN']);
fam('infantaria','SR-2 Veresk','🇷🇺 Rússia','Submetralhadora','9×21mm','200 m',1999,'SMG perfurante russa',['','M']);
fam('infantaria','Carl Gustaf m/45','🇸🇪 Suécia','Submetralhadora','9×19mm','200 m',1945,'"Swedish K"',['','m/45B']);
fam('infantaria','Madsen M50','🇩🇰 Dinamarca','Submetralhadora','9×19mm','150 m',1946,'SMG dinamarquesa',['M46','M50','M53']);
fam('infantaria','Owen / F1','🇦🇺 Austrália','Submetralhadora','9×19mm','150 m',1942,'SMGs australianas',['Owen','F1','Austen']);
fam('infantaria','Winchester 1897','🇺🇸 EUA','Espingarda de combate','Calibre 12','40 m',1897,'"Trench gun" da 1ª Guerra',['','M1912','Model 12']);
fam('infantaria','Ithaca 37','🇺🇸 EUA','Espingarda de combate','Calibre 12','40 m',1937,'Pump de ejeção inferior',['','M37','Stakeout']);
fam('infantaria','Vepr-12','🇷🇺 Rússia','Espingarda semiautomática','Calibre 12','50 m',2003,'Escopeta de combate AK',['','Molot']);
fam('infantaria','BAR M1918','🇺🇸 EUA','Fuzil automático','.30-06','800 m',1918,'Fuzil-metralhadora histórico',['','A2']);
fam('infantaria','Bren','🇬🇧 Reino Unido','Metralhadora leve','.303 / 7.62mm','800 m',1935,'LMG britânica icônica',['Mk1','Mk2','L4']);
fam('infantaria','MG34','🇩🇪 Alemanha','Metralhadora de uso geral','7.92×57mm','1200 m',1934,'Primeira GPMG da história',['']);
fam('infantaria','DP-27','🇷🇺 URSS','Metralhadora leve','7.62×54mmR','800 m',1928,'"Prato de panqueca" soviético',['DP','DPM','RP-46']);
fam('infantaria','Type 99 / Type 11','🇯🇵 Japão','Metralhadora leve','6.5 / 7.7mm','800 m',1922,'LMGs japonesas da 2ª Guerra',['Type 11','Type 96','Type 99']);
fam('infantaria','HK21 / HK23','🇩🇪 Alemanha','Metralhadora','7.62 / 5.56mm','1200 m',1961,'GPMG da família G3',['HK21','HK21E','HK23E']);
fam('infantaria','Ultimax 100','🇸🇬 Singapura','Metralhadora leve','5.56×45mm','1300 m',1982,'LMG de baixo recuo',['Mk3','Mk5','Mk8']);
fam('infantaria','Type 67 / 80','🇨🇳 China','Metralhadora','7.62mm','1000 m',1967,'GPMG/HMG chinesas',['Type 67','Type 80','Type 88 QJY']);
fam('infantaria','Steyr SSG 69','🇦🇹 Áustria','Fuzil de precisão','7.62×51mm','800 m',1969,'Sniper austríaco clássico',['','P1','P4']);
fam('infantaria','Sako TRG','🇫🇮 Finlândia','Fuzil de precisão','.338 / 7.62mm','1500 m',1989,'Precisão finlandesa',['TRG-22','TRG-42','TRG M10']);
fam('infantaria','OSV-96 / KSVK','🇷🇺 Rússia','Fuzil antimaterial','12.7×108mm','1800 m',1996,'Antimaterial russos',['OSV-96','KSVK','V-94']);
fam('infantaria','Zastava M93','🇷🇸 Sérvia','Fuzil antimaterial','12.7mm','1800 m',1993,'"Black Arrow"',['']);
fam('infantaria','RPO-A Shmel','🇷🇺 Rússia','Lança-foguetes termobárico','93mm','1000 m',1984,'Lança-chamas de foguete',['','-M','-PDM']);
fam('infantaria','SMAW','🇺🇸 EUA','Lança-foguetes','83mm','500 m',1984,'Antiestrutura dos fuzileiros',['','Mk153','II']);
fam('infantaria','Matador / RGW','🇩🇪🇸🇬','Lança-foguetes descartável','90mm','500 m',2000,'AT urbano leve',['Matador','RGW-90','MAS']);
fam('infantaria','Type 69 RPG','🇨🇳 China','Lança-foguetes','85mm','500 m',1970,'RPG-7 chinês',['','PF-89','PF-98']);
/* --- Blindados: + MBT/IFV/SPAA/históricos --- */
fam('blindados','Type 96','🇨🇳 China','MBT','125mm','3000 m',1997,'MBT de produção em massa do EPL',['','A','B']);
fam('blindados','VT-4 / MBT-3000','🇨🇳 China','MBT de exportação','125mm','5000 m',2014,'MBT chinês de exportação',['VT-4','MBT-2000','VT-1A']);
fam('blindados','M60 Patton','🇺🇸 EUA','MBT','105mm','3000 m',1960,'MBT americano longevo',['','A1','A3','Magach','Sabra']);
fam('blindados','TR-85','🇷🇴 Romênia','MBT','100 / 120mm','3000 m',1986,'MBT romeno',['','M1 Bizonul']);
fam('blindados','M-84','🇷🇸 Iugoslávia','MBT','125mm','4000 m',1984,'T-72 iugoslavo',['','A','AB','Degman']);
fam('blindados','PT-76','🇷🇺 URSS','Tanque leve anfíbio','76mm','1500 m',1951,'Reconhecimento anfíbio',['','B']);
fam('blindados','M551 Sheridan','🇺🇸 EUA','Tanque leve aerotransportável','152mm','3000 m',1969,'Leve com míssil Shillelagh',['']);
fam('blindados','Scorpion / Scimitar','🇬🇧 Reino Unido','Veículo de reconhecimento','76 / 30mm','2000 m',1972,'CVR(T) britânicos leves',['Scorpion','Scimitar','Sabre']);
fam('blindados','2S25 Sprut','🇷🇺 Rússia','Caça-tanque anfíbio','125mm','4000 m',2005,'Canhão de MBT em chassi leve',['','-SDM1']);
fam('blindados','MT-LB','🇷🇺 URSS','Transporte blindado de esteira','7.62mm','1000 m',1970,'Multiuso anfíbio difundido',['','V','VM']);
fam('blindados','Type 89 / ZBD','🇨🇳 China','IFV','35mm','3000 m',1990,'IFVs chineses',['Type 86','ZBD-04A','ZBD-05','Type 89']);
fam('blindados','Dardo / Freccia','🇮🇹 Itália','IFV','25 / 30mm','3000 m',2002,'IFVs italianos',['Dardo','VBM Freccia']);
fam('blindados','Otokar','🇹🇷 Turquia','Blindado','30mm','2000 m',2010,'Arma/Tulpar/Cobra turcos',['Cobra','Cobra II','Arma 8x8','Tulpar']);
fam('blindados','Ratel','🇿🇦 África do Sul','IFV 6×6','20 / 90mm','2000 m',1976,'IFV de rodas sul-africano',['20','60','90','Command']);
fam('blindados','Casspir / Mamba','🇿🇦 África do Sul','MRAP','7.62mm','1500 m',1980,'Pioneiros do conceito MRAP',['Casspir','Mamba','RG-12']);
fam('blindados','Tunguska','🇷🇺 Rússia','Antiaéreo míssil/canhão','2×30mm + 8 mísseis','8 km',1986,'SPAAG soviético/russo',['','M1']);
fam('blindados','Tor','🇷🇺 Rússia','Sistema antiaéreo','Mísseis 9M331','12 km',1986,'SHORAD de resposta rápida',['M1','M2','M2DT']);
fam('blindados','M88 / BREM','🌍 Diversos','Veículo blindado de recuperação','Guincho','—',1961,'Resgate de blindados',['M88A1','M88A2','BREM-1','Büffel']);
fam('blindados','M26 Pershing','🇺🇸 EUA','Tanque pesado','90mm','2000 m',1944,'Tanque pesado do fim da 2ª Guerra',['','M46']);
fam('blindados','KV','🇷🇺 URSS','Tanque pesado','76 / 152mm','2000 m',1939,'Tanques pesados soviéticos',['KV-1','KV-2','KV-85']);
fam('blindados','Churchill','🇬🇧 Reino Unido','Tanque de infantaria','75mm','1500 m',1941,'Tanque pesado britânico',['Mk III','Mk VII','Crocodile']);
fam('blindados','Cromwell / Comet','🇬🇧 Reino Unido','Tanque cruzador','75 / 77mm','2000 m',1944,'Cruzadores britânicos rápidos',['Cromwell','Comet']);
fam('blindados','Panzer III','🇩🇪 Alemanha','Tanque médio','37 / 50mm','1500 m',1939,'Cavalo de batalha inicial alemão',['Ausf. E','Ausf. J','Ausf. M','Ausf. N']);
fam('blindados','SU / ISU','🇷🇺 URSS','Canhão autopropulsado','85–152mm','2000 m',1943,'Caça-tanques e SPGs soviéticos',['SU-85','SU-100','SU-122','SU-152','ISU-152','ISU-122']);
fam('blindados','Jagdpanzer','🇩🇪 Alemanha','Caça-tanque','75–128mm','2500 m',1943,'Destruidores de tanques alemães',['Jagdpanther','Jagdtiger','Hetzer','Elefant']);
/* --- Artilharia: + towed/SPG/MLRS/morteiros --- */
fam('artilharia','M114 / M115','🇺🇸 EUA','Obus rebocado','155 / 203mm','15 km',1942,'Obuses pesados clássicos',['M114 155mm','M115 203mm']);
fam('artilharia','M-46','🇷🇺 URSS','Canhão de campanha','130mm','27 km',1954,'Canhão de longo alcance difundido',['','Type 59-1']);
fam('artilharia','Nora B-52','🇷🇸 Sérvia','Obus sobre rodas','155mm','40 km',2005,'SPG 8×8 sérvio',['K0','K1','M03']);
fam('artilharia','ATMOS 2000','🇮🇱 Israel','Obus sobre caminhão','155mm','41 km',2004,'Shoot-and-scoot israelense',['','2000']);
fam('artilharia','2S7 / 2S43','🇷🇺 Rússia','Artilharia pesada','203 / 152mm','37 km',1975,'SPGs pesados russos',['2S7 Pion','2S43 Malva']);
fam('artilharia','PLZ-83 / Type 83','🇨🇳 China','Obus autopropulsado','152 / 122mm','30 km',1983,'SPGs chineses',['Type 83','PLZ-89','PLZ-07']);
fam('artilharia','M270 / K136','🌍 Diversos','Lança-foguetes','227 / 130mm','80 km',1983,'MLRS rebocados/esteira',['M270','K136 Kooryong','RM-70','WR-40']);
fam('artilharia','T-122 / TRG','🇹🇷 Turquia','Lança-foguetes','122 / 300mm','120 km',2010,'MLRS turcos (Roketsan)',['T-122 Sakarya','T-300 Kasırga','TRG-300']);
fam('artilharia','2S4 / 2S9 / 2S31','🇷🇺 URSS','Morteiro autopropulsado','120 / 240mm','13 km',1971,'Morteiros pesados sobre chassi',['2S4 Tyulpan','2S9 Nona','2S31 Vena','2S34']);
fam('artilharia','L16 / M252','🇬🇧🇺🇸','Morteiro','81mm','5.6 km',1965,'Morteiro médio padrão OTAN',['L16','M252','M29']);
/* --- Aéreo: + caças/bombardeiros/transporte/helos clássicos --- */
fam('aereo','F-86 Sabre','🇺🇸 EUA','Caça a jato','Ar-ar','1200 km',1949,'Caça da Guerra da Coreia',['A','E','F','H']);
fam('aereo','F-100 Super Sabre','🇺🇸 EUA','Caça-bombardeiro','Ar-terra','3210 km',1954,'Primeiro caça supersônico operacional',['C','D','F']);
fam('aereo','F-111 Aardvark','🇺🇸 EUA','Bombardeiro tático','Ar-terra','5500 km',1967,'Asa variável de penetração',['A','E','F','FB-111']);
fam('aereo','A-7 Corsair II','🇺🇸 EUA','Ataque','Ar-terra','3700 km',1967,'Ataque subsônico embarcado',['A','D','E']);
fam('aereo','F-8 Crusader','🇺🇸 EUA','Caça embarcado','Ar-ar','2800 km',1957,'"O último pistoleiro"',['C','E','J']);
fam('aereo','P-51 Mustang','🇺🇸 EUA','Caça a pistão','Ar-ar','2750 km',1942,'Caça de escolta lendário',['B','C','D','H']);
fam('aereo','P-47 Thunderbolt','🇺🇸 EUA','Caça-bombardeiro a pistão','Ar-terra','1290 km',1942,'Caça pesado robusto',['C','D','M','N']);
fam('aereo','F4U Corsair','🇺🇸 EUA','Caça embarcado a pistão','Ar-ar','1600 km',1942,'Asa de gaivota icônica',['-1','-4','-5','AU-1']);
fam('aereo','Spitfire','🇬🇧 Reino Unido','Caça a pistão','Ar-ar','1800 km',1938,'Símbolo da Batalha da Grã-Bretanha',['Mk I','Mk V','Mk IX','Mk XIV']);
fam('aereo','Messerschmitt Bf 109','🇩🇪 Alemanha','Caça a pistão','Ar-ar','850 km',1937,'Caça alemão mais produzido',['E','F','G','K']);
fam('aereo','Focke-Wulf Fw 190','🇩🇪 Alemanha','Caça a pistão','Multifunção','800 km',1941,'Caça-bombardeiro alemão',['A','D','F']);
fam('aereo','Mitsubishi A6M Zero','🇯🇵 Japão','Caça embarcado a pistão','Ar-ar','3100 km',1940,'Caça naval japonês ágil',['A6M2','A6M3','A6M5']);
fam('aereo','MiG-15 / MiG-17','🇷🇺 URSS','Caça a jato','Ar-ar','2000 km',1949,'Caças da Guerra Fria inicial',['MiG-15','MiG-15bis','MiG-17','MiG-17F']);
fam('aereo','MiG-19','🇷🇺 URSS','Caça supersônico','Ar-ar','2200 km',1955,'Primeiro supersônico soviético',['','S','PM','J-6']);
fam('aereo','Su-7 / Su-17','🇷🇺 URSS','Caça-bombardeiro','Ar-terra','1900 km',1959,'Asa fixa/variável de ataque',['Su-7B','Su-17','Su-20','Su-22']);
fam('aereo','Saab 35 Draken','🇸🇪 Suécia','Caça interceptador','Ar-ar','3250 km',1960,'Asa dupla delta sueca',['','J','F']);
fam('aereo','Saab 37 Viggen','🇸🇪 Suécia','Caça multifunção','Multifunção','2000 km',1971,'Canard sueco',['AJ','JA','SF']);
fam('aereo','Hawker Hunter','🇬🇧 Reino Unido','Caça a jato','Ar-ar','3060 km',1954,'Caça britânico elegante',['F.6','FGA.9','T.7']);
fam('aereo','English Electric Lightning','🇬🇧 Reino Unido','Interceptador','Ar-ar','1370 km',1959,'Interceptador de subida vertical',['F.1','F.3','F.6']);
fam('aereo','Avro Vulcan','🇬🇧 Reino Unido','Bombardeiro estratégico','Nuclear/conv.','4170 km',1956,'Bombardeiro V em asa delta',['B.1','B.2']);
fam('aereo','B-17 Flying Fortress','🇺🇸 EUA','Bombardeiro pesado','Bombas','3220 km',1938,'Bombardeiro da 2ª Guerra',['E','F','G']);
fam('aereo','B-29 Superfortress','🇺🇸 EUA','Bombardeiro estratégico','Bombas','5230 km',1944,'Bombardeiro de muito longo alcance',['','A','Washington']);
fam('aereo','Lancaster','🇬🇧 Reino Unido','Bombardeiro pesado','Bombas','4070 km',1942,'Bombardeiro noturno britânico',['B.I','B.III']);
fam('aereo','Tu-16 Badger','🇷🇺 URSS','Bombardeiro a jato','Mísseis/bombas','7200 km',1954,'Bombardeiro médio soviético',['','K','H-6']);
fam('aereo','C-47 Skytrain','🇺🇸 EUA','Transporte','Tropas/carga','2600 km',1941,'"Dakota", transporte lendário',['','Dakota','AC-47']);
fam('aereo','An-12 / An-26','🇺🇦 URSS','Transporte tático','20 t','5700 km',1959,'Cargueiros soviéticos difundidos',['An-12','An-24','An-26','An-32','Y-8']);
fam('aereo','CASA C-295 / 235','🇪🇸 Espanha','Transporte tático','9 t','4500 km',1997,'Cargueiros leves exportados',['C-212','CN-235','C-295']);
fam('aereo','OV-10 Bronco','🇺🇸 EUA','Observação/ataque leve','Ar-terra','2300 km',1969,'COIN turboélice',['A','D']);
fam('aereo','AC-130','🇺🇸 EUA','Gunship','105 / 40 / 30mm','3700 km',1968,'Canhoneira voadora',['H Spectre','U Spooky','J Ghostrider']);
fam('aereo','S-3 Viking','🇺🇸 EUA','Antissubmarino embarcado','Torpedos','5500 km',1974,'ASW de porta-aviões',['A','B']);
fam('aereo','E-7 / E-8','🇺🇸🇦🇺','Vigilância/comando','Radar','7000 km',2009,'Wedgetail (AEW) e JSTARS',['E-7 Wedgetail','E-8 JSTARS']);
fam('aereo','Bell Huey família','🇺🇸 EUA','Helicóptero utilitário','Transporte','500 km',1959,'205/212/412 civis-militares',['205','212','412','UH-1N']);
fam('aereo','Sea King','🇬🇧🇺🇸','Helicóptero naval','ASW/transporte','1230 km',1961,'Helicóptero naval clássico',['SH-3','HAS.1','HC.4','Commando']);
fam('aereo','Aérospatiale','🇫🇷 França','Helicóptero','Utilitário','700 km',1967,'Alouette/Gazelle/Puma/Dauphin',['Alouette III','Gazelle','SA 330 Puma','Super Puma','Dauphin']);
fam('aereo','AgustaWestland','🇮🇹🇬🇧','Helicóptero','Utilitário/naval','800 km',2004,'AW101/109/139/159/189',['AW101','AW109','AW139','AW159 Wildcat','AW189']);
fam('aereo','Z-helicópteros','🇨🇳 China','Helicóptero','Utilitário/ataque','800 km',1994,'Família Changhe/Harbin',['Z-8','Z-9','Z-11','Z-15','Z-20']);
fam('aereo','Mi-26 Halo','🇷🇺 URSS','Helicóptero de carga pesada','20 t','800 km',1983,'Maior helicóptero em produção',['','T2']);
/* --- Naval: + classes adicionais --- */
fam('naval','Porta-aviões Enterprise (CVN-65)','🇺🇸 EUA','Porta-aviões nuclear','90 aeronaves','Ilimitado',1961,'Primeiro CVN do mundo',['']);
fam('naval','Porta-aviões Midway/Forrestal','🇺🇸 EUA','Porta-aviões','75 aeronaves','Global',1945,'Porta-aviões clássicos dos EUA',['Midway','Forrestal','Kitty Hawk']);
fam('naval','Destroyer Spruance','🇺🇸 EUA','Destróier','Tomahawk/ASROC','Global',1975,'Destróier ASW dos EUA',['','Kidd']);
fam('naval','Destroyer Type 052/051','🇨🇳 China','Destróier','VLS/HQ','Global',1994,'Famílias de destróieres chineses',['Type 051','Type 052','Type 052B','Type 052C']);
fam('naval','Fragata Oliver Hazard Perry','🇺🇸 EUA','Fragata','SM-1/Harpoon','Global',1977,'Fragata muito exportada',['','Adelaide','Kang Ding']);
fam('naval','Fragata Admiral Gorshkov','🇷🇺 Rússia','Fragata','Kalibr/Oniks','Global',2018,'Fragata russa moderna',['Project 22350','Gorshkov']);
fam('naval','Fragata MEKO','🇩🇪 Alemanha','Fragata modular','VLS/Harpoon','Global',1982,'Plataforma exportada (Brasil, etc.)',['MEKO 200','MEKO A-200','MEKO 140']);
fam('naval','Corveta Milgem','🇹🇷 Turquia','Corveta','VLS/anti-navio','Litoral',2011,'Ada/Istif turcas',['Ada','Istif','Hisar']);
fam('naval','Corveta Pohang','🇰🇷 Coreia do Sul','Corveta','Canhão/torpedos','Litoral',1984,'Corveta sul-coreana',['','Flight III']);
fam('naval','Submarino Vanguard','🇬🇧 Reino Unido','SSBN','Trident II','Ilimitado',1993,'Dissuasão nuclear do Reino Unido',['']);
fam('naval','Submarino Triomphant','🇫🇷 França','SSBN','M51 SLBM','Ilimitado',1997,'Dissuasão nuclear francesa',['']);
fam('naval','Submarino Type 209/214/218','🇩🇪 Alemanha','Submarino diesel/AIP','Torpedos','Global',1971,'SSKs alemães muito exportados',['209','212A','214','218SG']);
fam('naval','Submarino U-Boat','🇩🇪 Alemanha','Submarino (histórico)','Torpedos','Atlântico',1935,'Submarinos da 2ª Guerra',['Type VII','Type IX','Type XXI']);
fam('naval','Submarino Gato/Balao','🇺🇸 EUA','Submarino (histórico)','Torpedos','Pacífico',1941,'Submarinos da 2ª Guerra no Pacífico',['Gato','Balao','Tench']);
fam('naval','Lancha-míssil Osa','🇷🇺 URSS','Barco lança-mísseis','P-15 Termit','Litoral',1960,'Lancha rápida muito exportada',['I','II']);
/* --- Mísseis: + famílias adicionais --- */
fam('misseis','AIM-4 / AIM-26','🇺🇸 EUA','Ar-ar (histórico)','IR/Radar','11 km',1956,'Falcon, primeiros ar-ar guiados',['Falcon','Super Falcon','Nuclear Falcon']);
fam('misseis','ASRAAM','🇬🇧 Reino Unido','Ar-ar curto alcance','Infravermelho','50 km',1998,'WVR britânico de alta energia',['']);
fam('misseis','Magic / R550','🇫🇷 França','Ar-ar curto alcance','Infravermelho','15 km',1976,'WVR francês',['R550','Magic II']);
fam('misseis','A-Darter','🇿🇦🇧🇷','Ar-ar curto alcance','Infravermelho','20 km',2018,'WVR sul-africano/brasileiro',['']);
fam('misseis','Hawk MIM-23','🇺🇸 EUA','SAM médio alcance','Radar semiativo','45 km',1960,'SAM móvel clássico',['','I-Hawk','Phase III']);
fam('misseis','Nike','🇺🇸 EUA','SAM (histórico)','Radar','140 km',1953,'SAM da Guerra Fria',['Ajax','Hercules']);
fam('misseis','Sea Sparrow / RAM','🇺🇸 EUA','SAM naval de ponto','Radar/IR','19 km',1976,'Defesa naval de ponto',['RIM-7','ESSM','RIM-116 RAM']);
fam('misseis','Barak','🇮🇱 Israel','SAM naval/terrestre','Radar ativo','150 km',1997,'Família de defesa aérea israelense',['Barak-1','Barak-8','Barak-MX']);
fam('misseis','SPYDER','🇮🇱 Israel','SAM móvel','Python/Derby','50 km',2005,'SHORAD/MRSAM israelense',['SR','MR']);
fam('misseis','Crotale / VL MICA','🇫🇷 França','SAM curto/médio','Radar/IR','40 km',1971,'Defesa aérea francesa',['Crotale NG','VL MICA','Mistral']);
fam('misseis','S-1 / Styx','🇷🇺 URSS','Anti-navio (histórico)','Subsônico','80 km',1958,'P-15 Termit, primeiro anti-navio usado em combate',['P-15','P-15M','HY-2 Silkworm']);
fam('misseis','C-80x / YJ','🇨🇳 China','Anti-navio','Subsônico','180 km',1989,'Família C-801/802/803',['C-801','C-802','C-803']);
fam('misseis','Penguin','🇳🇴 Noruega','Anti-navio','Subsônico','55 km',1972,'Anti-navio de helicóptero',['Mk2','Mk3']);
fam('misseis','Gabriel','🇮🇱 Israel','Anti-navio','Subsônico','200 km',1970,'Anti-navio israelense (Sea Serpent)',['Mk1','Mk2','Mk3','Mk5']);
fam('misseis','Type 90 / 12 SSM','🇯🇵 Japão','Anti-navio','Subsônico','200 km',1992,'Anti-navio japonês',['Type 88','Type 90','Type 12']);
fam('misseis','SSM-700K Haeseong','🇰🇷 Coreia do Sul','Anti-navio','Subsônico','150 km',2006,'"C-Star" sul-coreano',['']);
fam('misseis','HARM / ALARM','🇺🇸🇬🇧','Antirradiação','Anti-radar','150 km',1985,'Supressão de defesas aéreas',['AGM-88 HARM','ALARM','AARGM-ER']);
fam('misseis','Kh-25 / Kh-29 / Kh-31','🇷🇺 Rússia','Ar-terra tático','TV/laser/anti-radar','110 km',1975,'Família ar-superfície russa',['Kh-25','Kh-29','Kh-31A','Kh-31P','Kh-38']);
fam('misseis','Brimstone / Hellfire','🇬🇧🇺🇸','Antitanque aéreo','Radar/laser','12 km',1998,'Mísseis ar-terra de precisão',['AGM-114 Hellfire','Brimstone','Brimstone 2','JAGM']);
fam('misseis','Spike NLOS','🇮🇱 Israel','Multifunção de longo alcance','Eletro-óptico','32 km',2009,'Tiro além da linha de visada',['','ER2']);
fam('misseis','Nag / Helina','🇮🇳 Índia','Antitanque','Imagem IR','7 km',2018,'ATGM indianos',['Nag','HELINA','MPATGM']);
fam('misseis','RBS-70 / Mistral','🇸🇪🇫🇷','MANPADS/SHORAD','Laser/IR','8 km',1977,'Defesa antiaérea portátil',['RBS-70','RBS-70 NG','Mistral 3']);
fam('misseis','LORA / Pradyumna','🇮🇱 Israel','Míssil balístico tático','Mach 5','400 km',2007,'SRBM de precisão',['']);
/* --- Drones: + ISR/UCAV/loitering adicionais --- */
fam('drones','RQ-21 / RQ-20','🇺🇸 EUA','UAV tático pequeno','Sensores','100 km',2012,'Blackjack e Puma',['RQ-21 Blackjack','RQ-20 Puma','Wasp']);
fam('drones','MQ-25 Stingray','🇺🇸 EUA','UAV reabastecedor embarcado','Tanker','—',2021,'Reabastecimento aéreo não tripulado',['']);
fam('drones','MQ-20 Avenger','🇺🇸 EUA','UCAV furtivo a jato','Sensores/armas','—',2009,'Predator C a jato',['','ER']);
fam('drones','GA-ASI Gray Eagle','🇺🇸 EUA','UAV MALE','Hellfire/sensores','400 km',2009,'MQ-1C do Exército dos EUA',['','-ER','25M']);
fam('drones','Skylark / Orbiter','🇮🇱 Israel','Mini-UAV','Sensores','40 km',2008,'ISR tático lançado à mão',['Skylark','Orbiter 2','Orbiter 3','Orbiter 4']);
fam('drones','SkyStriker / Mini Harpy','🇮🇱 Israel','Munição de vagueio','Ogiva','100 km',2017,'Loitering israelense',['SkyStriker','Mini Harpy']);
fam('drones','BZK / WZ','🇨🇳 China','UAV ISR/estratégico','Sensores','7000 km',2006,'Famílias de reconhecimento chinesas',['BZK-005','WZ-7 Soaring Dragon','WZ-8','GJ-11']);
fam('drones','TB-001 / TB-002','🇨🇳 China','UCAV MALE','Mísseis/sensores','6000 km',2018,'"Twin-tailed Scorpion"',['TB-001','TB-001A']);
fam('drones','Forpost / Orion','🇷🇺 Rússia','UAV MALE','Sensores/mísseis','250 km',2016,'MALE russos',['Forpost','Forpost-R','Orion','Orion-E']);
fam('drones','Eleron / Zala','🇷🇺 Rússia','Mini-UAV ISR','Sensores','50 km',2008,'Reconhecimento tático russo',['Eleron-3','Zala 421','Zala Lancet (recon)']);
fam('drones','Vestel Karayel','🇹🇷 Turquia','UAV tático','Sensores/munições','150 km',2016,'UAV tático turco',['','-SU']);
fam('drones','TAI Aksungur / Anka','🇹🇷 Turquia','UAV MALE/HALE','Mísseis/sensores','6500 km',2019,'UAVs turcos de alta autonomia',['Anka-S','Anka-3','Aksungur']);
fam('drones','Phoenix Ghost / Altius','🇺🇸 EUA','Munição de vagueio','Ogiva','—',2022,'Loitering tático dos EUA',['Phoenix Ghost','ALTIUS-600','ALTIUS-700']);

/* ===================== EXPANSÃO 3 — + famílias reais ===================== */
/* --- Infantaria --- */
fam('infantaria','Walther extras','🇩🇪 Alemanha','Pistola','9 / .22','50 m',2000,'P22/CCP/Q5 e correlatas',['P22','CCP','Q5 Match','Q4','PK380']);
fam('infantaria','Caracal','🇦🇪 Emirados','Pistola','9×19mm','50 m',2007,'Pistola de serviço dos Emirados',['F','C','Enhanced','Lightweight']);
fam('infantaria','FÉG','🇭🇺 Hungria','Pistola','9×19 / 7.62','50 m',1948,'Pistolas húngaras (PA-63, etc.)',['PA-63','P9R','GKK','Tokagypt']);
fam('infantaria','Type 54 / 51','🇨🇳 China','Pistola','7.62×25mm','50 m',1954,'Cópias chinesas do TT',['Type 54','Type 51']);
fam('infantaria','Taurus revólver','🇧🇷 Brasil','Revólver','.38 / .357 / .44','60 m',1941,'Revólveres brasileiros populares',['RT 85','RT 605','Judge','Raging Bull','RT 627']);
fam('infantaria','Rossi','🇧🇷 Brasil','Revólver','.38 Special','50 m',1889,'Revólveres e carabinas brasileiros',['Model 971','Model 351','R98']);
fam('infantaria','SIG 550','🇨🇭 Suíça','Fuzil de assalto','5.56×45mm','600 m',1986,'Stgw 90 do exército suíço',['550','551','552','553','SAN 556']);
fam('infantaria','Beretta ARX','🇮🇹 Itália','Fuzil de assalto','5.56 / 7.62mm','500 m',2008,'Fuzil modular italiano',['ARX-160','ARX-100','ARX-200']);
fam('infantaria','FN FNC / CAL','🇧🇪 Bélgica','Fuzil de assalto','5.56×45mm','450 m',1979,'Fuzis FN pré-SCAR',['CAL','FNC','FNC-80']);
fam('infantaria','Bushmaster ACR','🇺🇸 EUA','Fuzil modular','5.56 / 6.8mm','500 m',2010,'Masada/ACR (Remington)',['','Enhanced','SBR']);
fam('infantaria','CETME','🇪🇸 Espanha','Fuzil de batalha','7.62 / 5.56mm','600 m',1957,'Base do G3 (roller-delayed)',['Model A','Model C','Model L']);
fam('infantaria','PTR / DSA','🇺🇸 EUA','Fuzil de batalha','7.62×51mm','800 m',2002,'Clones de G3/FAL nos EUA',['PTR-91','DSA SA58','DSA SA58 OSW']);
fam('infantaria','SVT-40','🇷🇺 URSS','Fuzil semiautomático','7.62×54mmR','500 m',1940,'Semiauto soviético da 2ª Guerra',['SVT-38','SVT-40','AVT-40']);
fam('infantaria','MAS-49','🇫🇷 França','Fuzil semiautomático','7.5×54mm','500 m',1949,'Fuzil francês do pós-guerra',['MAS-49','MAS-49/56']);
fam('infantaria','Sa vz.23','🇨🇿 Tchecoslováquia','Submetralhadora','9×19mm','150 m',1948,'SMG tcheca (pioneira do telescópico)',['vz.23','vz.25','vz.24','vz.26']);
fam('infantaria','Suomi KP/-31','🇫🇮 Finlândia','Submetralhadora','9×19mm','200 m',1931,'SMG finlandesa de tambor',['','KP/-44']);
fam('infantaria','FAMAE SAF','🇨🇱 Chile','Submetralhadora','9×19mm','150 m',1993,'SMG chilena',['SAF','Mini-SAF','SG 540']);
fam('infantaria','Beretta 1301 / A300','🇮🇹 Itália','Espingarda semiautomática','Calibre 12','50 m',2014,'Escopetas táticas/desportivas',['1301 Tactical','A300 Ultima Patrol']);
fam('infantaria','MAG-7','🇿🇦 África do Sul','Espingarda compacta','Calibre 12','40 m',1995,'Escopeta de carregador',['','M1']);
fam('infantaria','AA-12','🇺🇸 EUA','Espingarda automática','Calibre 12','40 m',1972,'Escopeta totalmente automática',['','CTS-2000']);
fam('infantaria','M1919 Browning','🇺🇸 EUA','Metralhadora média','.30-06 / 7.62','1400 m',1919,'MG refrigerada a ar clássica',['A4','A6','M37']);
fam('infantaria','Vickers','🇬🇧 Reino Unido','Metralhadora pesada','.303','2000 m',1912,'MG refrigerada a água lendária',['Mk I']);
fam('infantaria','Daewoo K3','🇰🇷 Coreia do Sul','Metralhadora leve','5.56×45mm','1000 m',1991,'LMG sul-coreana',['']);
fam('infantaria','CIS 50MG','🇸🇬 Singapura','Metralhadora pesada','.50 BMG','1800 m',1988,'HMG de Singapura',['']);
fam('infantaria','Blaser','🇩🇪 Alemanha','Fuzil de precisão','.338 / 7.62','1500 m',1993,'Ferrolho reto de precisão',['R93 Tactical','R8','LRS 2']);
fam('infantaria','Desert Tech','🇺🇸 EUA','Fuzil de precisão bullpup','.338 / .375','1800 m',2007,'SRS/HTI bullpup',['SRS','SRS A2','HTI']);
fam('infantaria','JS / AMR (China)','🇨🇳 China','Fuzil antimaterial','12.7 / 14.5mm','2000 m',2005,'Antimaterial chineses',['M99','AMR-2','JS 12.7']);
fam('infantaria','Instalaza','🇪🇸 Espanha','Lança-foguetes','90mm','500 m',1990,'C90/Alcotan AT espanhóis',['C90-CR','Alcotan-100','C100']);
fam('infantaria','APILAS / LRAC','🇫🇷 França','Lança-foguetes','112 / 89mm','600 m',1985,'AT franceses',['APILAS','LRAC F1']);
/* --- Blindados --- */
fam('blindados','Type 99A','🇨🇳 China','MBT','125mm','5000 m',2011,'MBT de ponta do EPL',['','A2']);
fam('blindados','Magach','🇮🇱 Israel','MBT','105mm','3000 m',1965,'M48/M60 modernizados por Israel',['3','6','7']);
fam('blindados','Olifant','🇿🇦 África do Sul','MBT','105mm','3000 m',1976,'Centurion sul-africano',['Mk1A','Mk1B','Mk2']);
fam('blindados','Sabra','🇮🇱 Israel','MBT (exportação)','120mm','4000 m',2002,'M60 com torre de 120mm',['Mk I','Mk II','Mk III']);
fam('blindados','Stridsvagn 103','🇸🇪 Suécia','Tanque sem torre','105mm','3000 m',1967,'"S-Tank" (já listado base)',['C']);
fam('blindados','Type 15','🇨🇳 China','Tanque leve','105mm','3000 m',2018,'Tanque leve de montanha',['','ZTQ-15']);
fam('blindados','Kaplan / Harimau','🇹🇷🇮🇩','Tanque médio','105mm','3000 m',2019,'MMWT turco-indonésio',['Kaplan MT','Harimau']);
fam('blindados','K808 / K806','🇰🇷 Coreia do Sul','Blindado 8×8/6×6','12.7 / 40mm','2000 m',2018,'"White Tiger" coreano',['K808','K806']);
fam('blindados','VBCI','🇫🇷 França','IFV 8×8','25mm','2000 m',2008,'IFV de rodas francês',['','Philoctète']);
fam('blindados','Freccia / Centauro','🇮🇹 Itália','Blindado de rodas','25 / 105 / 120mm','4000 m',1991,'Família Centauro/Freccia',['Centauro','Centauro II','Freccia']);
fam('blindados','Rooikat','🇿🇦 África do Sul','Carro de combate de rodas','76 / 105mm','3000 m',1990,'Reconhecimento pesado 8×8',['76','105']);
fam('blindados','M3 Stuart / M24','🇺🇸 EUA','Tanque leve (histórico)','37mm','1500 m',1941,'Tanques leves da 2ª Guerra',['M3 Stuart','M5','M24 Chaffee']);
fam('blindados','Chi-Ha','🇯🇵 Japão','Tanque médio (histórico)','57 / 47mm','1500 m',1938,'Tanque japonês da 2ª Guerra',['Type 97','Type 97 Shinhoto']);
fam('blindados','Char B1 / Somua','🇫🇷 França','Tanque (histórico)','47 / 75mm','1500 m',1935,'Tanques franceses de 1940',['Char B1 bis','Somua S35']);
/* --- Artilharia --- */
fam('artilharia','Type 59-1 / Type 66','🇨🇳 China','Canhão de campanha','130 / 152mm','27 km',1959,'Artilharia rebocada chinesa',['Type 59-1','Type 66','Type 83']);
fam('artilharia','GHN-45 / FH-77','🇦🇹🇸🇪','Obus rebocado','155mm','30 km',1977,'Obuses de exportação',['GHN-45','FH-77B','Bofors 77']);
fam('artilharia','Aleksandar / SOKO','🇷🇸 Sérvia','Obus sobre rodas','155mm','40 km',2019,'SPG sérvio moderno',['Aleksandar','SOKO SP RR']);
fam('artilharia','PCL-181 / SH-15','🇨🇳 China','Obus sobre caminhão','155mm','40 km',2019,'SPG de rodas chinês',['PCL-181','SH-15']);
fam('artilharia','AR1 / AR3','🇨🇳 China','Lança-foguetes pesado','300 / 370mm','280 km',2010,'MLRS de exportação chinês',['AR1A','AR2','AR3']);
fam('artilharia','LYNX / LAR-160','🇮🇱 Israel','Lança-foguetes','122–306mm','150 km',1985,'MLRS modular israelense',['LAR-160','Lynx','PULS']);
fam('artilharia','Valkiri / Bateleur','🇿🇦 África do Sul','Lança-foguetes','127mm','36 km',1981,'MLRS sul-africanos',['Valkiri','Bateleur','Bagheera']);
fam('artilharia','Patria NEMO / AMOS','🇫🇮 Finlândia','Morteiro montado','120mm','10 km',2006,'Morteiros em torre',['NEMO','AMOS']);
/* --- Aéreo --- */
fam('aereo','A-6 Intruder','🇺🇸 EUA','Ataque embarcado','Ar-terra','5200 km',1963,'Ataque de todo tempo da Marinha',['A','E','EA-6B Prowler']);
fam('aereo','A-1 Skyraider','🇺🇸 EUA','Ataque a pistão','Ar-terra','2100 km',1946,'Ataque longevo (usado no Vietnã)',['AD-4','A-1H','A-1J']);
fam('aereo','F-84 Thunderjet','🇺🇸 EUA','Caça-bombardeiro','Ar-terra','3200 km',1947,'Jato da Guerra da Coreia',['F-84E','F-84F','RF-84']);
fam('aereo','F-102 / F-106','🇺🇸 EUA','Interceptador','Ar-ar','2400 km',1956,'Interceptadores delta dos EUA',['F-102 Delta Dagger','F-106 Delta Dart']);
fam('aereo','B-25 Mitchell','🇺🇸 EUA','Bombardeiro médio','Bombas','2170 km',1941,'Bombardeiro médio da 2ª Guerra',['B','H','J']);
fam('aereo','B-24 Liberator','🇺🇸 EUA','Bombardeiro pesado','Bombas','3400 km',1941,'Bombardeiro pesado aliado',['D','J','L']);
fam('aereo','Il-2 Sturmovik','🇷🇺 URSS','Ataque ao solo a pistão','Ar-terra','720 km',1941,'"Tanque voador" soviético',['','Il-10']);
fam('aereo','Yak (pistão)','🇷🇺 URSS','Caça a pistão','Ar-ar','900 km',1940,'Caças Yakovlev da 2ª Guerra',['Yak-1','Yak-3','Yak-9']);
fam('aereo','Lavochkin','🇷🇺 URSS','Caça a pistão','Ar-ar','1000 km',1942,'Caças La da 2ª Guerra',['La-5','La-7','La-9','La-11']);
fam('aereo','Su-15 / Su-9','🇷🇺 URSS','Interceptador','Ar-ar','1700 km',1962,'Interceptadores soviéticos',['Su-9','Su-11','Su-15']);
fam('aereo','J-15 / J-16','🇨🇳 China','Caça multifunção','Multifunção','3500 km',2013,'Flankers chineses',['J-15','J-16','J-16D']);
fam('aereo','JH-7 Flying Leopard','🇨🇳 China','Caça-bombardeiro','Ar-terra','3700 km',1992,'Bombardeiro tático chinês',['','A','II']);
fam('aereo','KF-21 Boramae','🇰🇷 Coreia do Sul','Caça 4.5ª geração','Multifunção','2900 km',2022,'Caça coreano (semi-stealth)',['']);
fam('aereo','Su-75 Checkmate','🇷🇺 Rússia','Caça furtivo leve','Multifunção','3000 km',2023,'5ª geração leve russo (protótipo)',['']);
fam('aereo','Tu-22 Blinder','🇷🇺 URSS','Bombardeiro supersônico','Cruzeiro','4900 km',1962,'Bombardeiro supersônico inicial',['','K','R']);
fam('aereo','T-37 / T-38','🇺🇸 EUA','Treinador a jato','Leve','1500 km',1957,'Treinadores da USAF',['T-37 Tweet','T-38 Talon','AT-38']);
fam('aereo','MB-339 / M-345','🇮🇹 Itália','Treinador/ataque leve','Leve','1760 km',1976,'Treinadores Aermacchi',['MB-326','MB-339','M-345']);
fam('aereo','Pilatus','🇨🇭 Suíça','Treinador turboélice','Leve','1500 km',1978,'PC-7/9/21',['PC-7','PC-9','PC-21']);
fam('aereo','P-2 Neptune','🇺🇸 EUA','Patrulha marítima','Torpedos','5600 km',1947,'Patrulha ASW clássica',['P2V-5','P2V-7']);
fam('aereo','Beriev','🇷🇺 URSS','Hidroavião/AEW','Sensores','4000 km',1960,'Be-12 e A-50 AEW',['Be-12','Be-200','A-50 Mainstay','A-100']);
fam('aereo','KJ AEW','🇨🇳 China','Alerta aéreo','Radar','5000 km',2003,'AEW&C chineses',['KJ-2000','KJ-200','KJ-500']);
fam('aereo','OV-1 Mohawk','🇺🇸 EUA','Observação/reconhecimento','Sensores','1600 km',1959,'Reconhecimento do Exército dos EUA',['A','C','D']);
/* --- Naval --- */
fam('naval','Porta-aviões Liaoning/Shandong','🇨🇳 China','Porta-aviões STOBAR','J-15','Global',2012,'Primeiros porta-aviões chineses',['Liaoning','Shandong']);
fam('naval','Destroyer Type 956','🇷🇺 URSS','Destróier','Moskit/130mm','Global',1980,'Sovremenny (exportado p/ China)',['','EM']);
fam('naval','Cruzador Kirov','🇷🇺 URSS','Cruzador de batalha nuclear','VLS pesado','Ilimitado',1980,'Maior surface combatant não-porta-aviões',['Kirov','Pyotr Velikiy']);
fam('naval','Cruzador Slava','🇷🇺 URSS','Cruzador','P-1000/S-300F','Global',1982,'Cruzador lança-mísseis (ex-Moskva)',['','Atlant']);
fam('naval','Fragata La Fayette','🇫🇷 França','Fragata furtiva','Exocet/Crotale','Global',1996,'Pioneira do stealth de fragatas',['','Formidable','Kang Ding']);
fam('naval','Fragata Anzac / MEKO','🇦🇺🇩🇪','Fragata','ESSM/Harpoon','Global',1996,'Fragatas MEKO 200',['Anzac','Brandenburg','Sachsen']);
fam('naval','Fragata Iver Huitfeldt','🇩🇰 Dinamarca','Fragata','VLS 32','Global',2012,'Fragata de defesa aérea dinamarquesa',['','Absalon']);
fam('naval','Corveta Braunschweig (K130)','🇩🇪 Alemanha','Corveta','RBS-15/RAM','Litoral',2008,'Corveta alemã',['']);
fam('naval','Corveta Sa\'ar','🇮🇱 Israel','Corveta lança-mísseis','Barak/Harpoon','Litoral',1973,'Família de corvetas israelenses',['Sa\'ar 4','Sa\'ar 4.5','Sa\'ar 5','Sa\'ar 6']);
fam('naval','Lancha Houbei (Type 022)','🇨🇳 China','Catamarã lança-mísseis furtivo','YJ-83','Litoral',2004,'Lancha rápida stealth chinesa',['']);
fam('naval','Submarino Yuan (Type 039A)','🇨🇳 China','Submarino AIP','Torpedos/YJ-18','Global',2006,'SSK AIP chinês',['Type 039A','Type 039B','Type 039C']);
fam('naval','Submarino Song (Type 039)','🇨🇳 China','Submarino diesel-elétrico','Torpedos','Global',1999,'SSK chinês',['']);
fam('naval','Submarino Dolphin','🇮🇱 Israel','Submarino AIP','Torpedos/cruzeiro','Global',1999,'SSK alemão da marinha israelense',['','Dolphin II']);
fam('naval','Submarino Scorpène (mais)','🇫🇷 França','Submarino diesel-elétrico','Torpedos/Exocet','Global',2005,'Exportado (Índia Kalvari, Brasil)',['Kalvari','Riachuelo (mais)']);
/* --- Mísseis --- */
fam('misseis','Taurus KEPD 350','🇩🇪🇸🇪','Cruzeiro furtivo ar-terra','Subsônico','500 km',2005,'Penetra alvos endurecidos',['','K2']);
fam('misseis','AGM-154 JSOW','🇺🇸 EUA','Planador guiado','Subsônico','130 km',1999,'Bomba planadora de precisão',['A','C','C-1']);
fam('misseis','SLAM-ER','🇺🇸 EUA','Cruzeiro ar-terra','Subsônico','270 km',2000,'Derivado do Harpoon',['']);
fam('misseis','3M22 Zircon','🇷🇺 Rússia','Anti-navio hipersônico','Mach 9','1000 km',2022,'Cruzeiro hipersônico (já citado)',['']);
fam('misseis','Burevestnik / Poseidon','🇷🇺 Rússia','Arma estratégica exótica','Nuclear','Ilimitado',2018,'Cruzeiro nuclear e torpedo nuclear',['9M730 Burevestnik','Poseidon']);
fam('misseis','K-15 / K-4','🇮🇳 Índia','SLBM','Mach 7','3500 km',2018,'SLBMs indianos (Arihant)',['K-15 Sagarika','K-4']);
fam('misseis','JL (Ju Lang)','🇨🇳 China','SLBM','Mach 20','9000 km',2001,'SLBMs chineses',['JL-1','JL-2','JL-3']);
fam('misseis','M51','🇫🇷 França','SLBM','Mach 25','10000 km',2010,'SLBM francês (classe Triomphant)',['','.2','.3']);
fam('misseis','KN-23 / Hwasong','🇰🇵 Coreia do Norte','Míssil balístico','Mach 6+','690 km',2019,'SRBM/IRBM norte-coreanos',['KN-23','Hwasong-12','Hwasong-15','Hwasong-17']);
fam('misseis','CAMM / Sea Ceptor','🇬🇧 Reino Unido','SAM','Radar ativo','25 km',2018,'Defesa aérea de nova geração',['CAMM','CAMM-ER','Sea Ceptor']);
fam('misseis','S-350 Vityaz','🇷🇺 Rússia','SAM médio alcance','Radar ativo','120 km',2019,'SAM de média camada russo',['']);
fam('misseis','Akeron / MMP','🇫🇷 França','Antitanque','Fibra óptica/IR','5 km',2017,'ATGM francês de 5ª geração',['MMP','Akeron MP','Akeron LP']);
fam('misseis','PARS 3 / Mokopa','🇩🇪🇿🇦','Antitanque aéreo','IR/laser','8 km',2012,'ATGM de helicóptero',['PARS 3 LR','Mokopa','Ingwe']);
fam('misseis','Toophan / Dehlavie','🇮🇷 Irã','Antitanque','SACLOS/laser','4 km',1988,'ATGM iranianos (cópias TOW/Kornet)',['Toophan','Dehlavie','Almas']);
/* --- Drones --- */
fam('drones','Black Hornet','🇳🇴 Noruega','Nano-UAV','Sensores','2 km',2012,'Drone de reconhecimento de bolso',['PD-100','Nano','Block III']);
fam('drones','Akinci / Kizilelma','🇹🇷 Turquia','UCAV pesado/furtivo','Mísseis/sensores','7500 km',2021,'Bayraktar de alta capacidade',['Akinci','Kizilelma']);
fam('drones','Geran / Shahed','🇷🇺🇮🇷','Munição de vagueio','Ogiva ~40 kg','2000 km',2022,'Drones suicidas de longo alcance',['Geran-2','Shahed-136','Shahed-238']);
fam('drones','KARGU / Alpagu','🇹🇷 Turquia','Munição de vagueio (enxame)','Ogiva','10 km',2019,'Loitering autônomo da STM',['KARGU','Alpagu','Togan']);
fam('drones','KUB-BLA','🇷🇺 Rússia','Munição de vagueio','Ogiva 3 kg','40 km',2019,'Loitering da ZALA/Kalashnikov',['','-E']);
fam('drones','Spy\'Ranger / Luna','🇫🇷🇩🇪','UAV tático ISR','Sensores','150 km',2016,'Reconhecimento europeu',['Spy\'Ranger','Luna NG','KZO']);
fam('drones','GJ-2 / Wing Loong (mais)','🇨🇳 China','UCAV MALE','Mísseis/bombas','4000 km',2017,'Wing Loong/GJ exportados',['GJ-2','Wing Loong I-D','Wing Loong 10']);
fam('drones','Penguin C / Indago','🌍 Diversos','UAV ISR comercial-militar','Sensores','100 km',2014,'ISR de pequeno porte',['Penguin C','Indago 3','Quantix']);

/* ===================== EXPANSÃO 4 — + famílias reais (histórico/regional) ===================== */
/* --- Infantaria: pistolas históricas --- */
fam('infantaria','Mauser HSc / C96 var','🇩🇪 Alemanha','Pistola','7.65 / 9mm','50 m',1940,'Pistolas Mauser do entreguerras',['HSc','M1914','M1934']);
fam('infantaria','Sauer 38H','🇩🇪 Alemanha','Pistola','7.65mm','50 m',1938,'Pistola compacta alemã',['']);
fam('infantaria','Walther P38','🇩🇪 Alemanha','Pistola','9×19mm','50 m',1938,'Pistola de serviço da Wehrmacht',['','P1','P4']);
fam('infantaria','CZ vz.','🇨🇿 Tchecoslováquia','Pistola','7.65 / 9mm','50 m',1927,'Pistolas tchecas clássicas',['vz.24','vz.27','vz.38','vz.52','vz.82']);
fam('infantaria','Browning FN 1900/1910','🇧🇪 Bélgica','Pistola','7.65 / 9mm','50 m',1900,'Pistolas de bolso da FN',['M1900','M1910','M1922']);
fam('infantaria','Beretta M1934','🇮🇹 Itália','Pistola','9mm Corto','50 m',1934,'Pistola italiana da 2ª Guerra',['M1934','M1935']);
fam('infantaria','Steyr M1912','🇦🇹 Áustria','Pistola','9×23mm Steyr','50 m',1912,'"Steyr-Hahn"',['','Doppelpistole']);
fam('infantaria','Ruby / Star','🇪🇸 Espanha','Pistola','7.65mm','50 m',1914,'Pistolas espanholas da 1ª Guerra',['Ruby','Eibar']);
fam('infantaria','Tokagypt 58','🇭🇺 Hungria','Pistola','9×19mm','50 m',1958,'TT húngaro de exportação',['']);
fam('infantaria','Husqvarna m/40','🇸🇪 Suécia','Pistola','9×19mm','50 m',1940,'Lahti sueco',['']);
fam('infantaria','Enfield No.2','🇬🇧 Reino Unido','Revólver','.38/200','50 m',1932,'Revólver britânico da 2ª Guerra',['Mk I','Mk I*']);
fam('infantaria','Colt/S&W M1917','🇺🇸 EUA','Revólver','.45 ACP','50 m',1917,'Revólveres militares da 1ª Guerra',['Colt M1917','S&W M1917']);
fam('infantaria','Lebel / MAS 1873','🇫🇷 França','Revólver','8 / 11mm','50 m',1873,'Revólveres franceses históricos',['MAS 1873','Lebel M1892']);
/* --- Infantaria: fuzis de ferrolho históricos --- */
fam('infantaria','Springfield M1903','🇺🇸 EUA','Fuzil de ferrolho','.30-06','500 m',1903,'Fuzil padrão dos EUA na 1ª Guerra',['','A1','A3','A4']);
fam('infantaria','Arisaka','🇯🇵 Japão','Fuzil de ferrolho','6.5 / 7.7mm','500 m',1897,'Fuzis japoneses',['Type 30','Type 38','Type 99']);
fam('infantaria','Carcano','🇮🇹 Itália','Fuzil de ferrolho','6.5 / 7.35mm','500 m',1891,'Fuzil italiano',['M91','M91/38','M38']);
fam('infantaria','Berthier / Lebel','🇫🇷 França','Fuzil de ferrolho','8mm Lebel','500 m',1886,'Fuzis franceses das guerras mundiais',['Lebel 1886','Berthier M1907','M1916']);
fam('infantaria','Gewehr 88 / 98','🇩🇪 Alemanha','Fuzil de ferrolho','7.92mm','500 m',1888,'Fuzis alemães pré-Kar98',['Gew 88','Gew 98','Kar 98a']);
fam('infantaria','Mannlicher M1895','🇦🇹 Áustria','Fuzil de ferrolho','8×50mmR','500 m',1895,'Fuzil austro-húngaro de carregamento reto',['','M1888','M95/30']);
fam('infantaria','Pattern 1914 / M1917','🇬🇧🇺🇸','Fuzil de ferrolho','.303 / .30-06','500 m',1914,'"Enfield americano"',['P14','M1917']);
fam('infantaria','Krag-Jørgensen','🇳🇴🇺🇸','Fuzil de ferrolho','.30-40 / 6.5mm','500 m',1886,'Ferrolho de portinhola lateral',['M1892','M1894']);
fam('infantaria','Martini-Henry','🇬🇧 Reino Unido','Fuzil de bloco basculante','.577/450','400 m',1871,'Fuzil colonial britânico',['Mk I','Mk IV']);
/* --- Infantaria: semiautomáticos históricos --- */
fam('infantaria','M1 Carbine','🇺🇸 EUA','Carabina','.30 Carbine','300 m',1942,'Carabina leve da 2ª Guerra',['M1','M1A1','M2','M3']);
fam('infantaria','Gewehr 43','🇩🇪 Alemanha','Fuzil semiautomático','7.92×57mm','500 m',1943,'Semiauto alemão da 2ª Guerra',['G41','G43','K43']);
fam('infantaria','FG 42','🇩🇪 Alemanha','Fuzil automático de paraquedista','7.92×57mm','600 m',1942,'Fuzil seletivo dos Fallschirmjäger',['Type I','Type II']);
fam('infantaria','Johnson M1941','🇺🇸 EUA','Fuzil semiautomático','.30-06','500 m',1941,'Recuo do cano, usado por fuzileiros',['','LMG']);
fam('infantaria','Ljungman AG42','🇸🇪 Suécia','Fuzil semiautomático','6.5×55mm','500 m',1942,'Tomada direta de gás pioneira',['','Hakim','Rasheed']);
/* --- Infantaria: SMG históricas --- */
fam('infantaria','MP18 / MP28','🇩🇪 Alemanha','Submetralhadora','9×19mm','150 m',1918,'Primeira SMG de fato da história',['MP18','MP28','MP34','MP35']);
fam('infantaria','Erma EMP / MP40 var','🇩🇪 Alemanha','Submetralhadora','9×19mm','150 m',1932,'SMGs alemãs do entreguerras',['EMP','MP38','MP41']);
fam('infantaria','Lanchester','🇬🇧 Reino Unido','Submetralhadora','9×19mm','150 m',1941,'Cópia britânica do MP28',['Mk1','Mk1*']);
fam('infantaria','Beretta M38','🇮🇹 Itália','Submetralhadora','9×19mm','200 m',1938,'SMG italiana de qualidade',['M38','M38/42','M12']);
fam('infantaria','Steyr MPi 69','🇦🇹 Áustria','Submetralhadora','9×19mm','200 m',1969,'SMG austríaca',['MPi 69','MPi 81','AUG Para']);
/* --- Infantaria: MG históricas --- */
fam('infantaria','Maxim / MG08','🇩🇪 Alemanha','Metralhadora pesada','7.92 / 7.62mm','2000 m',1884,'A metralhadora que definiu a 1ª Guerra',['Maxim','MG08','MG08/15','PM M1910']);
fam('infantaria','Hotchkiss','🇫🇷 França','Metralhadora','8mm Lebel','2000 m',1914,'MG francesa a gás',['M1914','M1922','Mle 1900']);
fam('infantaria','Chauchat','🇫🇷 França','Fuzil-metralhadora','8mm Lebel','600 m',1915,'LMG da 1ª Guerra (infame)',['M1915','M1918']);
fam('infantaria','ZB vz.26','🇨🇿 Tchecoslováquia','Metralhadora leve','7.92×57mm','1000 m',1926,'Base do Bren',['vz.26','vz.30']);
fam('infantaria','Breda M37','🇮🇹 Itália','Metralhadora','8×59mm','2000 m',1937,'MG média italiana',['M37','M30']);
fam('infantaria','Type 92 / 99 (Japão)','🇯🇵 Japão','Metralhadora','7.7mm','2000 m',1932,'MGs japonesas da 2ª Guerra',['Type 92','Type 99','Type 3']);
/* --- Infantaria: AT/launchers históricos --- */
fam('infantaria','Bazooka','🇺🇸 EUA','Lança-foguetes','60 / 88.9mm','150 m',1942,'O lança-foguetes original',['M1','M9','M20 Super']);
fam('infantaria','Panzerschreck','🇩🇪 Alemanha','Lança-foguetes','88mm','150 m',1943,'"Terror de tanque" alemão',['RPzB 54','RPzB 54/1']);
fam('infantaria','PIAT','🇬🇧 Reino Unido','Lançador antitanque','83mm','100 m',1943,'AT por mola britânico',['']);
fam('infantaria','Recoilless rifle','🇺🇸 EUA','Canhão sem recuo','57–106mm','1000 m',1945,'Família M18/M20/M40',['M18 57mm','M20 75mm','M40 106mm','M67 90mm']);
fam('infantaria','RPG-29 / 30 / 32','🇷🇺 Rússia','Lança-foguetes antitanque','105 / 72.5mm','500 m',1989,'RPGs tandem modernos',['RPG-29 Vampir','RPG-30','RPG-32 Nashshab']);
/* --- Blindados: históricos e modernos --- */
fam('blindados','Renault FT','🇫🇷 França','Tanque leve (histórico)','37mm','500 m',1917,'O primeiro tanque de torre giratória',['','M1917 (EUA)']);
fam('blindados','Mark I–V','🇬🇧 Reino Unido','Tanque (histórico)','57mm','1000 m',1916,'Os primeiros tanques da história',['Mark I','Mark IV','Mark V']);
fam('blindados','Panzer I / II','🇩🇪 Alemanha','Tanque leve (histórico)','MG / 20mm','1000 m',1934,'Tanques leves alemães iniciais',['Pz I','Pz II','Pz 38(t)']);
fam('blindados','M3 Lee/Grant','🇺🇸 EUA','Tanque médio (histórico)','75 / 37mm','1800 m',1941,'Tanque médio de transição dos EUA',['Lee','Grant']);
fam('blindados','Cruiser/Crusader','🇬🇧 Reino Unido','Tanque cruzador (histórico)','40 / 57mm','1500 m',1940,'Cruzadores britânicos iniciais',['A9','A10','Crusader','Covenanter']);
fam('blindados','Matilda / Valentine','🇬🇧 Reino Unido','Tanque de infantaria','40mm','1500 m',1938,'Tanques de infantaria britânicos',['Matilda II','Valentine']);
fam('blindados','BT / T-26','🇷🇺 URSS','Tanque leve (histórico)','45mm','1500 m',1931,'Tanques rápidos/leves soviéticos',['BT-5','BT-7','T-26']);
fam('blindados','VAB / VBL','🇫🇷 França','Blindado de rodas','7.62 / 12.7mm','1500 m',1976,'Transporte/recon franceses',['VAB','VBL','VBL Ultra']);
fam('blindados','Fuchs / Dingo','🇩🇪 Alemanha','Blindado de rodas','MG','1500 m',1979,'TPz Fuchs e ATF Dingo',['Fuchs','Fuchs 2','Dingo','Dingo 2']);
fam('blindados','BMP-3 família','🇷🇺 Rússia','IFV','100 + 30mm','4000 m',1987,'IFV pesado russo',['','M','Dragoon','BMD-4 base']);
fam('blindados','ZBL / ZBD-05','🇨🇳 China','IFV anfíbio','30 / 105mm','3000 m',2005,'Família anfíbia chinesa',['ZBL-08','ZBD-05','ZTD-05']);
/* --- Artilharia: históricas e modernas --- */
fam('artilharia','75mm M1897','🇫🇷 França','Canhão de campanha','75mm','8 km',1897,'"French 75", revolução da artilharia',['','M1897A4']);
fam('artilharia','25-pounder','🇬🇧 Reino Unido','Obus-canhão','87.6mm','12 km',1940,'Artilharia de campanha britânica',['Mk II','Mk III']);
fam('artilharia','105mm M101 / M102','🇺🇸 EUA','Obus rebocado','105mm','11 km',1941,'Obus de campanha clássico dos EUA',['M101','M102','M119']);
fam('artilharia','ML-20 / A-19','🇷🇺 URSS','Canhão-obus pesado','152 / 122mm','17 km',1937,'Artillharia pesada soviética',['ML-20','A-19','D-1']);
fam('artilharia','Type 63 MLRS','🇨🇳 China','Lança-foguetes','107mm','8 km',1963,'MRL leve muito exportado',['','Type 81']);
fam('artilharia','Avibras SS','🇧🇷 Brasil','Foguetes de artilharia','127–300mm','300 km',1983,'Foguetes do sistema ASTROS',['SS-30','SS-40','SS-60','SS-80','SS-150']);
/* --- Aéreo: clássicos da 2ª Guerra e Guerra Fria --- */
fam('aereo','Hawker Hurricane','🇬🇧 Reino Unido','Caça a pistão','Ar-ar','970 km',1937,'Caça da Batalha da Grã-Bretanha',['Mk I','Mk IIC','Mk IV']);
fam('aereo','Junkers Ju 87 Stuka','🇩🇪 Alemanha','Bombardeiro de mergulho','Ar-terra','600 km',1936,'Bombardeiro de mergulho icônico',['B','D','G']);
fam('aereo','Junkers Ju 88','🇩🇪 Alemanha','Bombardeiro multifunção','Ar-terra','2430 km',1939,'Avião de combate alemão versátil',['A','C','G']);
fam('aereo','Heinkel He 111','🇩🇪 Alemanha','Bombardeiro médio','Bombas','2300 km',1935,'Bombardeiro alemão da Blitz',['H','P']);
fam('aereo','Messerschmitt Me 262','🇩🇪 Alemanha','Caça a jato (histórico)','Ar-ar','1050 km',1944,'Primeiro caça a jato operacional',['A-1a','A-2a']);
fam('aereo','Mitsubishi G4M / Ki-21','🇯🇵 Japão','Bombardeiro','Bombas/torpedo','6000 km',1939,'Bombardeiros japoneses',['G4M','Ki-21','Ki-67']);
fam('aereo','Polikarpov I-16','🇷🇺 URSS','Caça a pistão','Ar-ar','700 km',1934,'Caça soviético dos anos 1930',['','Type 24']);
fam('aereo','Gloster Meteor','🇬🇧 Reino Unido','Caça a jato','Ar-ar','1610 km',1944,'Primeiro jato aliado operacional',['F.3','F.8','NF.11']);
fam('aereo','de Havilland Vampire','🇬🇧 Reino Unido','Caça a jato','Ar-ar','1960 km',1946,'Caça a jato do pós-guerra',['FB.5','FB.6','NF.10']);
fam('aereo','Dassault Ouragan/Mystère','🇫🇷 França','Caça a jato','Ar-ar','1000 km',1949,'Primeiros jatos da Dassault',['Ouragan','Mystère IV','Super Mystère']);
fam('aereo','Dassault Étendard','🇫🇷 França','Caça embarcado','Ar-terra','3300 km',1962,'Ataque naval francês',['Étendard IV','Super Étendard','SEM']);
fam('aereo','Saab 29 Tunnan','🇸🇪 Suécia','Caça a jato','Ar-ar','1100 km',1950,'"O Barril Voador"',['A','B','S']);
fam('aereo','Fiat G.91','🇮🇹 Itália','Caça-bombardeiro leve','Ar-terra','1150 km',1958,'Caça leve da OTAN',['R','Y','T']);
fam('aereo','Northrop F-89 / F-94','🇺🇸 EUA','Interceptador (histórico)','Ar-ar','1370 km',1950,'Interceptadores dos anos 1950',['F-89 Scorpion','F-94 Starfire']);
fam('aereo','McDonnell F-101 Voodoo','🇺🇸 EUA','Caça/recon','Ar-ar','2450 km',1957,'Supersônico de longo alcance',['A','B','RF-101']);
/* --- Aéreo: especiais derivados de comerciais --- */
fam('aereo','Boeing 707 militar','🇺🇸 EUA','Plataforma especial','Radar/tanker','9000 km',1957,'Base de E-3/E-6/KC-135/E-8',['E-3 Sentry','E-6 Mercury','E-8 JSTARS','KC-135']);
fam('aereo','Boeing 747 militar','🇺🇸 EUA','Plataforma estratégica','Comando/laser','13000 km',1990,'E-4/VC-25/YAL-1',['E-4B','VC-25 (Air Force One)','YAL-1']);
fam('aereo','Gulfstream/Bombardier ISR','🌍 Diversos','Vigilância eletrônica','Sensores/SIGINT','11000 km',2005,'Jatos executivos de missão especial',['EC-37B','E-11A BACN','Saab GlobalEye','R-99 (Embraer)']);
/* --- Naval: clássicos e modernos --- */
fam('naval','Couraçado Bismarck/Yamato','🌍 Diversos','Couraçado (histórico)','15–18 polegadas','Histórico',1940,'Maiores couraçados da 2ª Guerra',['Bismarck','Tirpitz','Yamato','Musashi']);
fam('naval','Couraçado Iowa/King George V','🇺🇸🇬🇧','Couraçado (histórico)','14–16 polegadas','Histórico',1940,'Couraçados aliados rápidos',['Iowa','Missouri','King George V','Prince of Wales']);
fam('naval','Porta-aviões Essex','🇺🇸 EUA','Porta-aviões (histórico)','90 aeronaves','Pacífico',1942,'Porta-aviões da 2ª Guerra no Pacífico',['','Ticonderoga (CV)']);
fam('naval','Cruzador Type 055/052 (mais)','🇨🇳 China','Cruzador/Destróier','VLS','Global',2017,'Combatentes de superfície chineses',['Type 055 Renhai','Type 052DL']);
fam('naval','Destroyer Type 45/Daring','🇬🇧 Reino Unido','Destróier antiaéreo','Aster/Sea Viper','Global',2009,'Defesa aérea da Royal Navy',['Daring','Dragon','Duncan']);
fam('naval','Fragata FREMM (mais)','🇫🇷🇮🇹🇺🇸','Fragata multifunção','Aster/VLS','Global',2012,'FREMM e Constellation (EUA)',['Aquitaine','Bergamini','Constellation (FFG-62)']);
fam('naval','Fragata Type 26/31','🇬🇧 Reino Unido','Fragata','Sea Ceptor/VLS','Global',2022,'Global Combat Ship',['Type 26 City','Type 31 Inspiration']);
fam('naval','Submarino Barracuda/Suffren','🇫🇷 França','SSN','Torpedos/cruzeiro','Ilimitado',2020,'SSN francês moderno',['Suffren','Barracuda']);
fam('naval','Submarino Type 212CD','🇩🇪🇳🇴','Submarino AIP','Torpedos','Global',2029,'Próxima geração AIP alemã/norueguesa',['']);
fam('naval','Patrulha/OPV','🌍 Diversos','Navio-patrulha oceânico','Canhão/UAV','Global',2010,'OPVs modernos exportados',['River','Khareef','Darussalam','Amazonas']);
/* --- Mísseis: famílias adicionais --- */
fam('misseis','AGM-130 / GBU','🇺🇸 EUA','Bomba guiada de precisão','Planador/foguete','75 km',1994,'Família de bombas guiadas',['AGM-130','GBU-15','GBU-39 SDB','GBU-53 SDB II']);
fam('misseis','Paveway','🇺🇸 EUA','Bomba guiada a laser','Laser/GPS','24 km',1976,'A bomba inteligente clássica',['Paveway II','Paveway III','Paveway IV','Enhanced']);
fam('misseis','KAB / FAB guiada','🇷🇺 Rússia','Bomba guiada','Laser/GLONASS','70 km',1975,'Bombas guiadas russas (com UMPK)',['KAB-500','KAB-1500','FAB-500 UMPK','FAB-3000']);
fam('misseis','9K720 / Tochka','🇷🇺 URSS','Míssil balístico tático','Mach 5','120 km',1975,'SRBM soviético/russo',['Tochka','Tochka-U','OTR-21']);
fam('misseis','ATACMS / GMLRS','🇺🇸 EUA','Foguete/míssil guiado','GPS','300 km',2005,'Munições guiadas do HIMARS',['GMLRS','GMLRS-ER','ATACMS','PrSM Inc 1']);
fam('misseis','Pralay / Shaurya','🇮🇳 Índia','Míssil balístico tático','Mach 7','700 km',2021,'SRBM indianos',['Pralay','Shaurya']);
/* --- Drones: famílias adicionais --- */
fam('drones','Bayraktar (mais)','🇹🇷 Turquia','UCAV','Munições MAM','300 km',2014,'Família Baykar completa',['TB2','TB3','Akinci','Kizilelma','Mini']);
fam('drones','ANKA-3 / Kaan UAV','🇹🇷 Turquia','UCAV furtivo','Sensores/armas','—',2023,'Asa voadora de combate turca',['ANKA-3']);
fam('drones','Sunflower / Spike Firefly','🇮🇱 Israel','Mini-loitering','Ogiva','5 km',2018,'Munição de vagueio leve urbana',['Spike Firefly','Maharaja']);
fam('drones','RQ-170 / RQ-180','🇺🇸 EUA','UAV furtivo de reconhecimento','Sensores','—',2007,'ISR furtivos classificados',['RQ-170 Sentinel','RQ-180']);
fam('drones','Hermes (mais) / WK450','🇮🇱🇬🇧','UAV MALE/tático','Sensores/mísseis','1000 km',2005,'Família Elbit Hermes/Watchkeeper',['Hermes 450','Hermes 900','Hermes StarLiner','Watchkeeper']);
fam('drones','Mugin / FPV','🌍 Diversos','Drone FPV de ataque','Ogiva leve','20 km',2022,'Drones FPV de combate (Ucrânia/Rússia)',['FPV kamikaze','Mugin-5','Vampire (heavy)']);

/* ===================== EXPANSÃO 5 — + famílias reais ===================== */
/* --- Infantaria: pistolas modernas (fabricantes) --- */
fam('infantaria','STI / Staccato','🇺🇸 EUA','Pistola 2011','9×19mm','50 m',2017,'2011 de competição/serviço',['P','C2','XC','XL','HD']);
fam('infantaria','Wilson Combat','🇺🇸 EUA','Pistola 1911/2011','9 / .45','50 m',1977,'Pistolas custom de elite',['CQB','EDC X9','SFX9','Beretta 92 Brigadier']);
fam('infantaria','Dan Wesson','🇺🇸 EUA','Pistola 1911','.45 / 9mm','50 m',1996,'1911 de alta qualidade',['Valor','Vigil','TCP','DWX']);
fam('infantaria','Rock Island (RIA)','🇵🇭 Filipinas','Pistola 1911','.45 / 9 / 10mm','50 m',1985,'1911 de custo acessível',['GI','TAC','MS','XT22']);
fam('infantaria','Sarsilmaz','🇹🇷 Turquia','Pistola','9×19mm','50 m',2004,'Pistolas de serviço turcas',['SAR9','K2','B6','ST10','SAR109']);
fam('infantaria','Girsan','🇹🇷 Turquia','Pistola','9×19mm','50 m',2010,'Clones e originais turcos',['MC9','MC28','MC P35','Regard']);
fam('infantaria','EAA Witness / Tanfoglio','🇮🇹 Itália','Pistola','9 / .45 / 10mm','50 m',1990,'CZ-pattern de competição',['Witness','Stock III','Limited','Match']);
fam('infantaria','Laugo Alien','🇨🇿 Tchéquia','Pistola','9×19mm','50 m',2019,'Cano fixo de baixíssimo recuo',['']);
fam('infantaria','Archon Type B','🇺🇸 EUA','Pistola','9×19mm','50 m',2018,'Mecanismo de baixo levantamento',['']);
fam('infantaria','Smith & Wesson metal','🇺🇸 EUA','Pistola','9×19mm','50 m',1955,'Série metálica clássica (39/59/5906)',['Model 39','Model 59','5906','4006','910']);
fam('infantaria','HK P7 / P9','🇩🇪 Alemanha','Pistola','9×19mm','50 m',1976,'Travamento por gás (squeeze cocker)',['P7','P7M8','P7M13','P9S']);
/* --- Infantaria: fuzis de serviço (OTAN e regionais) --- */
fam('infantaria','SA80 / L85','🇬🇧 Reino Unido','Fuzil bullpup','5.56×45mm','500 m',1985,'Fuzil padrão britânico',['L85A1','L85A2','L85A3','L86 LSW']);
fam('infantaria','Colt Canada','🇨🇦 Canadá','Fuzil de assalto','5.56×45mm','500 m',1984,'C7/C8 (Diemaco) da OTAN',['C7','C7A2','C8','C8 IUR']);
fam('infantaria','Ak 5 / AG-3','🇸🇪🇳🇴','Fuzil de assalto/batalha','5.56 / 7.62mm','500 m',1964,'FNC sueco e G3 norueguês',['Ak 5','Ak 5C','AG-3','AG-3F2']);
fam('infantaria','Valmet RK','🇫🇮 Finlândia','Fuzil de assalto','7.62×39 / 5.56','400 m',1962,'AK finlandês (base do Galil)',['RK 62','RK 95','M76']);
fam('infantaria','EF88 / F90','🇦🇺 Austrália','Fuzil bullpup','5.56×45mm','500 m',2015,'AUG australiano (Austeyr)',['F88','EF88','F90']);
fam('infantaria','Aero / PSA AR','🇺🇸 EUA','Carabina AR-15','5.56×45mm','500 m',2010,'ARs de fabricantes populares',['Aero M4E1','PSA PA-15','Anderson AM-15','Ruger AR-556','S&W M&P15']);
fam('infantaria','Geissele / BCM','🇺🇸 EUA','Carabina AR de elite','5.56×45mm','500 m',2011,'ARs premium de SOF',['Geissele URGI','BCM RECCE','Noveske N4','POF Revolution']);
fam('infantaria','IWI Carmel / Tavor 7','🇮🇱 Israel','Fuzil de assalto','5.56 / 7.62mm','600 m',2019,'Novos fuzis da IWI',['Carmel','Tavor 7','Zion-15']);
/* --- Infantaria: SMG/MG/sniper/AT modernos --- */
fam('infantaria','Grand Power Stribog','🇸🇰 Eslováquia','Submetralhadora','9×19mm','150 m',2017,'PCC/SMG popular',['SP9','A1','A3','SR9']);
fam('infantaria','CMMG Banshee','🇺🇸 EUA','Carabina PCC','9 / .45 / 5.7','150 m',2018,'AR-pattern em calibres de pistola',['Mk9','Mk57','Mk45','Mk4']);
fam('infantaria','US Ordnance / Mk48','🇺🇸 EUA','Metralhadora','5.56 / 7.62mm','1000 m',2003,'Minimi de SOF (Mk46/Mk48)',['Mk46','Mk48','M240 (US Ord)']);
fam('infantaria','RPK-16','🇷🇺 Rússia','Metralhadora leve','5.45×39mm','800 m',2016,'LMG modular russa moderna',['']);
fam('infantaria','SIG Cross / SSG','🇺🇸 EUA','Fuzil de precisão','.277 / 7.62 / .338','1500 m',2020,'Snipers modernos da SIG',['Cross','SSG 3000','TANGO']);
fam('infantaria','Cadex / Surgeon','🇨🇦🇺🇸','Fuzil de precisão','.338 / .50','2000 m',2010,'Sistemas de precisão de competição',['Cadex CDX-40','Cadex CDX-50','Surgeon 591','Surgeon CSR']);
fam('infantaria','Bergara / Tikka','🇪🇸🇫🇮','Fuzil de precisão','7.62 / 6.5','1200 m',2013,'Precisão de custo-benefício',['Bergara B-14','Bergara HMR','Tikka T3x TAC','Tikka T3x CTR']);
fam('infantaria','Armbrust / Miniman','🇩🇪🇸🇪','Lança-foguetes descartável','67 / 74mm','300 m',1979,'AT leves descartáveis',['Armbrust','Miniman','Pskott m/68']);
/* --- Naval: destróieres/fragatas/submarinos/anfíbios por nação --- */
fam('naval','Destroyer Hobart','🇦🇺 Austrália','Destróier Aegis','VLS 48','Global',2017,'Defesa aérea da RAN',['']);
fam('naval','Destroyer Mogami','🇯🇵 Japão','Fragata furtiva','VLS/canhão','Global',2022,'Fragata multifunção japonesa (FFM)',['']);
fam('naval','Destroyer Daegu / FFX','🇰🇷 Coreia do Sul','Fragata','VLS/anti-navio','Global',2016,'Fragatas FFX coreanas',['Incheon','Daegu','Chungnam']);
fam('naval','Fragata De Zeven Provinciën','🇳🇱 Holanda','Fragata de defesa aérea','SM-2/ESSM','Global',2002,'LCF holandesa',['']);
fam('naval','Fragata Fridtjof Nansen','🇳🇴 Noruega','Fragata Aegis','SM-2/NSM','Global',2006,'Fragata norueguesa',['']);
fam('naval','Fragata Karel Doorman','🇳🇱 Holanda','Fragata multifunção','SM-1/Harpoon','Global',1991,'Exportada (Bélgica, Portugal, Chile)',['']);
fam('naval','Fragata Bergamini (FREMM IT)','🇮🇹 Itália','Fragata multifunção','Aster/canhão','Global',2013,'FREMM italiana',['ASW','GP']);
fam('naval','Submarino S-80 Plus','🇪🇸 Espanha','Submarino AIP','Torpedos/Tomahawk','Global',2023,'Isaac Peral, AIP espanhol',['']);
fam('naval','Submarino KSS-III Dosan','🇰🇷 Coreia do Sul','Submarino','Torpedos/SLBM','Global',2021,'SSK coreano com VLS',['Batch I','Batch II']);
fam('naval','Submarino Lada','🇷🇺 Rússia','Submarino diesel-elétrico','Torpedos/Kalibr','Global',2010,'SSK russo de 4ª geração',['Project 677']);
fam('naval','LHD Canberra / Juan Carlos','🇦🇺🇪🇸','Navio de assalto anfíbio','F-35B/helos','Global',2010,'Plataforma anfíbia de exportação',['Canberra','Juan Carlos I','Trieste']);
fam('naval','LHD Dokdo','🇰🇷 Coreia do Sul','Navio de assalto anfíbio','Helos/docas','Global',2007,'Anfíbio coreano',['Dokdo','Marado']);
fam('naval','Porta-helicópteros Izumo/Hyuga','🇯🇵 Japão','"Destróier" porta-helicópteros','Helos/F-35B','Global',2009,'JMSDF (Izumo será portador de F-35B)',['Hyuga','Ise','Izumo','Kaga']);
fam('naval','Corveta Gowind','🇫🇷 França','Corveta furtiva','Exocet/VL MICA','Litoral',2014,'Exportada (Egito, EAU, Malásia)',['Gowind 2500','El Fateh']);
fam('naval','Navio-patrulha River/OPV','🌍 Diversos','Navio-patrulha oceânico','Canhão/helo','Global',2003,'OPVs de muitas marinhas',['River','Holland','Khareef','Amazonas (BR)']);
/* --- Aéreo: treinadores e helicópteros modernos --- */
fam('aereo','Hongdu L-15 / JL-8','🇨🇳 China','Treinador/ataque leve','Leve','3000 km',1994,'Treinadores a jato chineses',['JL-8 (K-8)','L-15 Falcon']);
fam('aereo','Leonardo M-346','🇮🇹 Itália','Treinador avançado','Leve','2000 km',2011,'Treinador/ataque leve (T-100/M-346FA)',['M-346','M-346FA','T-100']);
fam('aereo','Textron AT-6 / Scorpion','🇺🇸 EUA','Ataque leve','Ar-terra','2400 km',2017,'COIN e treinamento dos EUA',['AT-6 Wolverine','Scorpion']);
fam('aereo','Airbus Helicopters militar','🇪🇺 Europa','Helicóptero militar','Utilitário/ataque','800 km',2014,'H145M/H160M/H225M Caracal',['H145M','H160M','H225M Caracal']);
fam('aereo','Bell militar moderno','🇺🇸 EUA','Helicóptero','Utilitário/ataque','700 km',2018,'360 Invictus / 525 / V-280 (FLRAA)',['360 Invictus','V-280 Valor','429']);
fam('aereo','Mil Mi-38 / Mi-171Sh','🇷🇺 Rússia','Helicóptero de transporte','Tropas/armado','900 km',2015,'Transporte russo moderno',['Mi-38','Mi-171Sh','Mi-8AMTSh']);
/* --- Mísseis/Drones: adições finais --- */
fam('misseis','AGM-183 ARRW / HACM','🇺🇸 EUA','Hipersônico ar-lançado','Mach 5+','1600 km',2023,'Hipersônicos dos EUA',['AGM-183 ARRW','HACM']);
fam('misseis','SOM / Atmaca / Bora','🇹🇷 Turquia','Cruzeiro/anti-navio/balístico','Subsônico/Mach 5','280 km',2011,'Família de mísseis turcos (Roketsan)',['SOM','Atmaca','Bora','Tayfun']);
fam('misseis','Sea Venom / Marte','🇬🇧🇮🇹','Anti-navio leve (helicóptero)','Subsônico','110 km',2020,'Anti-navio de helicóptero',['Sea Venom','Marte ER','Marte Mk2']);
fam('drones','Anduril Ghost / Roadrunner','🇺🇸 EUA','UAS autônomo/interceptor','Sensores/ogiva','—',2020,'Drones de IA da Anduril',['Ghost','Ghost-X','Roadrunner','Altius (Anduril)']);
fam('drones','Shield AI V-BAT','🇺🇸 EUA','UAV VTOL autônomo','Sensores','—',2016,'VTOL de IA (Hivemind)',['V-BAT','V-BAT 128']);
fam('drones','ASN (China)','🇨🇳 China','UAV ISR','Sensores','3000 km',2000,'Família ASN muito exportada',['ASN-209','ASN-216','ASN-301']);
fam('drones','Korsar / Orlan (mais)','🇷🇺 Rússia','UAV tático ISR','Sensores/EW','250 km',2018,'ISR e correção de fogo russos',['Korsar','Orlan-10','Orlan-30','Orlan-50']);

/* ===================== LOTE EXTRA (famílias reais adicionais) ===================== */
/* --- Infantaria --- */
fam('infantaria','SIG Spear / XM7','🇺🇸 EUA','Fuzil de assalto','6.8×51mm','600 m',2022,'Vencedor do programa NGSW, substituto do M4',['*SIG MCX-Spear','*XM7','*SIG XM250','*MCX-Spear LT']);
fam('infantaria','HK433','🇩🇪 Alemanha','Fuzil de assalto','5.56×45mm','500 m',2017,'Fuzil modular HK, herdeiro do G36/HK416',['','A1']);
fam('infantaria','Beretta Px4 / APX','🇮🇹 Itália','Pistola','9×19mm','50 m',2004,'Pistolas de serviço Beretta',['*Beretta Px4 Storm','*Beretta Px4 Compact','*Beretta APX','*Beretta APX A1','*Beretta 8000 Cougar']);
fam('infantaria','CZ Scorpion EVO 3','🇨🇿 Tchéquia','Submetralhadora','9×19mm','100 m',2009,'SMG moderna da CZ',['',' S1',' S2 Micro']);
fam('infantaria','Arsenal AR','🇧🇬 Bulgária','Fuzil de assalto','7.62×39mm','400 m',1990,'AK búlgaro de exportação',['*Arsenal AR-M1','*Arsenal SLR-106','*Arsenal SAM7','*Arsenal SLR-107']);
fam('infantaria','Stoner 63','🇺🇸 EUA','Sistema de armas modular','5.56×45mm','800 m',1963,'Sistema modular de Eugene Stoner',['','A1']);
fam('infantaria','Savage 110','🇺🇸 EUA','Fuzil de ferrolho','.308 Win','800 m',1958,'Fuzil de precisão/caça econômico',['','*Savage Axis','*Savage 10 FCP','*Savage 110 BA']);
fam('infantaria','Weatherby Mark V','🇺🇸 EUA','Fuzil de ferrolho','.300 Wby','900 m',1957,'Fuzil de alta potência',['','*Weatherby Vanguard']);
fam('infantaria','Gepárd (antimaterial)','🇭🇺 Hungria','Fuzil antimaterial','12.7×108mm','2000 m',1987,'Família húngara de fuzis antimaterial',['*Gepárd M1','*Gepárd M2','*Gepárd M3','*Gepárd M6']);
fam('infantaria','Denel NTW-20','🇿🇦 África do Sul','Fuzil antimaterial','20×82mm','1500 m',1995,'Antimaterial sul-africano',['','*Truvelo SR']);
fam('infantaria','Beretta M12','🇮🇹 Itália','Submetralhadora','9×19mm','100 m',1959,'SMG italiana compacta',['','S']);
fam('infantaria','Walther MPL / MPK','🇩🇪 Alemanha','Submetralhadora','9×19mm','100 m',1963,'SMG alemã',['*Walther MPL','*Walther MPK']);
fam('infantaria','VHS-2','🇭🇷 Croácia','Fuzil de assalto bullpup','5.56×45mm','500 m',2013,'Bullpup croata',['','*VHS-K2']);
fam('infantaria','HK45 / P30','🇩🇪 Alemanha','Pistola','.45 ACP / 9×19mm','50 m',2006,'Pistolas de serviço HK',['*HK45','*HK45 Compact','*HK P30','*HK P30L','*HK P2000']);
fam('infantaria','Lewis Gun','🇬🇧 Reino Unido','Metralhadora leve','.303 British','800 m',1911,'LMG da Primeira Guerra',['']);
fam('infantaria','Madsen (metralhadora)','🇩🇰 Dinamarca','Metralhadora leve','vários','1000 m',1902,'Primeira LMG produzida em série',['']);
fam('infantaria','MAC-10 / MAC-11','🇺🇸 EUA','Submetralhadora','.45 ACP / .380','50 m',1970,'SMG compacta Ingram',['*MAC-10 (.45)','*MAC-10 (9mm)','*MAC-11 (.380)']);
fam('infantaria','Calico','🇺🇸 EUA','Submetralhadora','9×19mm','100 m',1985,'SMG de carregador helicoidal',['*Calico M960','*Calico M951']);
fam('infantaria','TEC-9','🇺🇸 EUA','Pistola semiautomática','9×19mm','50 m',1985,'Pistola de grande capacidade Intratec',['*Intratec TEC-9','*Intratec TEC-DC9']);

/* --- Blindados --- */
fam('blindados','Type 16 MCV','🇯🇵 Japão','Veículo de combate de rodas','105mm','2000 m',2016,'Veículo de combate manobrável japonês 8x8',['']);
fam('blindados','AMX-10 RC','🇫🇷 França','Veículo de reconhecimento','105mm','2000 m',1981,'Recon blindado francês de rodas',['','*AMX-10 RCR']);
fam('blindados','EBRC Jaguar','🇫🇷 França','Veículo de combate de rodas','40mm','2500 m',2020,'Recon/combate do programa Scorpion',['']);
fam('blindados','Pandur','🇦🇹 Áustria','APC de rodas','vários','1500 m',1985,'APC 6x6/8x8 austríaco',['*Pandur I','*Pandur II']);
fam('blindados','Rosomak','🇵🇱 Polônia','APC de rodas','30mm','2000 m',2004,'Patria AMV produzido na Polônia',['']);
fam('blindados','Terrex','🇸🇬 Singapura','APC de rodas','vários','1500 m',2009,'APC anfíbio 8x8 de Singapura',['']);
fam('blindados','M10 Booker','🇺🇸 EUA','Veículo de apoio blindado','105mm','2500 m',2022,'Blindado leve do US Army (ex-MPF)',['']);
fam('blindados','Engesa EE-11 Urutu','🇧🇷 Brasil','APC de rodas','12.7mm','1000 m',1974,'APC anfíbio brasileiro 6x6',['']);
fam('blindados','BTR-4','🇺🇦 Ucrânia','APC de rodas','30mm','2000 m',2008,'APC 8x8 ucraniano',['']);
fam('blindados','FV432','🇬🇧 Reino Unido','APC de lagartas','7.62mm','1000 m',1963,'APC britânico clássico',['','*FV430 Bulldog']);
fam('blindados','Saxon','🇬🇧 Reino Unido','APC de rodas','7.62mm','1000 m',1976,'APC britânico de rodas',['']);

/* --- Artilharia --- */
fam('artilharia','2S35 Koalitsiya-SV','🇷🇺 Rússia','Obuseiro autopropulsado','152mm','40 km',2015,'SPG russo de nova geração',['']);
fam('artilharia','RCH 155','🇩🇪 Alemanha','Obuseiro autopropulsado de rodas','155mm','40 km',2021,'Howitzer 155mm sobre chassi Boxer',['']);
fam('artilharia','M119 / L118','🇺🇸🇬🇧','Obuseiro rebocado leve','105mm','19 km',1989,'Howitzer leve 105mm',['*M119','*L118 Light Gun']);
fam('artilharia','OTO Melara Mod 56','🇮🇹 Itália','Obuseiro de montanha','105mm','10 km',1957,'Howitzer leve transportável',['']);
fam('artilharia','Type 99 HSP','🇯🇵 Japão','Obuseiro autopropulsado','155mm','30 km',1999,'SPG japonês de lagartas',['']);
fam('artilharia','M107 / M110','🇺🇸 EUA','Obuseiro autopropulsado pesado','175/203mm','30 km',1962,'SPGs pesados da Guerra Fria',['*M107 (175mm)','*M110 (203mm)','*M110A2']);
fam('artilharia','Bofors 40mm','🇸🇪 Suécia','Canhão antiaéreo','40mm','4 km',1934,'Canhão AA clássico',['*Bofors L60','*Bofors L70']);
fam('artilharia','Oerlikon AA','🇨🇭 Suíça','Canhão antiaéreo','20/35mm','4 km',1940,'Canhões AA suíços',['*Oerlikon 20mm','*Oerlikon GDF 35mm']);
fam('artilharia','Flak 88','🇩🇪 Alemanha','Canhão antiaéreo/antitanque','88mm','10 km',1936,'O famoso 88 alemão',['*Flak 18','*Flak 36','*Flak 37']);
fam('artilharia','Brandt (morteiros)','🇫🇷 França','Morteiro','60/81/120mm','8 km',1935,'Morteiros Brandt franceses',['*Brandt 60mm','*Brandt 81mm','*Brandt MO-120']);
fam('artilharia','S-23','🇷🇺 URSS','Canhão pesado rebocado','180mm','30 km',1955,'Canhão soviético de longo alcance',['']);

/* --- Aéreo --- */
fam('aereo','F-15EX Eagle II','🇺🇸 EUA','Caça multifunção','—','1800 km',2021,'F-15 de nova geração para a USAF',['']);
fam('aereo','IAI Kfir','🇮🇱 Israel','Caça multifunção','—','1000 km',1975,'Derivado israelense do Mirage 5 com motor J79',['*Kfir C2','*Kfir C7','*Kfir C10 (Block 60)']);
fam('aereo','IAI Nesher','🇮🇱 Israel','Caça','—','1000 km',1971,'Mirage 5 produzido em Israel',['']);
fam('aereo','Atlas Cheetah','🇿🇦 África do Sul','Caça','—','1000 km',1986,'Mirage III sul-africano modernizado',['*Cheetah C','*Cheetah D','*Cheetah E']);
fam('aereo','Nanchang Q-5','🇨🇳 China','Avião de ataque ao solo','—','2000 km',1970,'Ataque chinês derivado do MiG-19',['','*A-5 (exportação)']);
fam('aereo','SOKO J-22 Orao / IAR-93','🇷🇸 Iugoslávia/Romênia','Avião de ataque','—','1300 km',1974,'Ataque ítalo... luso-iugoslavo-romeno conjunto',['*SOKO J-22 Orao','*IAR-93 Vultur']);
fam('aereo','IAR-99 Șoim','🇷🇴 Romênia','Treinador/ataque leve','—','1100 km',1985,'Jato de treino romeno',['']);
fam('aereo','PZL-130 Orlik','🇵🇱 Polônia','Treinador turboélice','—','1000 km',1984,'Treinador básico polonês',['']);
fam('aereo','Jatos de treino poloneses','🇵🇱 Polônia','Treinador a jato','—','1000 km',1964,'TS-11 e Iryda',['*TS-11 Iskra','*PZL I-22 Iryda']);
fam('aereo','Aero L-29 Delfín','🇨🇿 Tchecoslováquia','Treinador a jato','—','900 km',1959,'Treinador padrão do Pacto de Varsóvia',['']);
fam('aereo','Yakovlev Yak-130','🇷🇺 Rússia','Treinador/ataque leve a jato','—','2000 km',2009,'Treinador avançado russo',['']);
fam('aereo','Treinadores britânicos a jato','🇬🇧 Reino Unido','Treinador/ataque leve','—','1400 km',1955,'Jet Provost e Strikemaster',['*Jet Provost','*BAC Strikemaster']);
fam('aereo','Fouga Magister','🇫🇷 França','Treinador a jato','—','900 km',1952,'Treinador de cauda em V',['']);
fam('aereo','Grumman F6F Hellcat','🇺🇸 EUA','Caça embarcado','—','1500 km',1943,'Caça naval da WWII',['']);
fam('aereo','Grumman F4F Wildcat','🇺🇸 EUA','Caça embarcado','—','1300 km',1940,'Caça naval inicial da WWII',['']);
fam('aereo','Curtiss P-40 Warhawk','🇺🇸 EUA','Caça','—','1100 km',1939,'Caça dos Flying Tigers',['']);
fam('aereo','Bell P-39 Airacobra','🇺🇸 EUA','Caça','—','840 km',1940,'Caça de motor central',['','*P-63 Kingcobra']);
fam('aereo','Lockheed P-38 Lightning','🇺🇸 EUA','Caça','—','2100 km',1941,'Caça bicaudal da WWII',['']);
fam('aereo','Caças do exército japonês','🇯🇵 Japão','Caça','—','1700 km',1941,'Ki-43 e Ki-84',['*Nakajima Ki-43 Hayabusa','*Nakajima Ki-84 Hayate']);
fam('aereo','Kawasaki Ki-61 Hien','🇯🇵 Japão','Caça','—','1100 km',1943,'Caça japonês de motor em linha',['']);
fam('aereo','Caças italianos da WWII','🇮🇹 Itália','Caça','—','1000 km',1941,'Macchi série 5',['*Macchi C.202 Folgore','*Macchi C.205 Veltro']);
fam('aereo','Hawker Typhoon / Tempest','🇬🇧 Reino Unido','Caça-bombardeiro','—','1100 km',1941,'Caças britânicos de ataque',['*Hawker Typhoon','*Hawker Tempest']);

/* --- Naval --- */
fam('naval','Submarino Walrus','🇳🇱 Holanda','Submarino de ataque','—','—',1990,'Submarino diesel-elétrico holandês',['']);
fam('naval','Submarino Gotland','🇸🇪 Suécia','Submarino AIP','—','—',1996,'Primeiro submarino AIP Stirling',['']);
fam('naval','Fragata Constellation','🇺🇸 EUA','Fragata','—','—',2026,'Nova fragata da US Navy (FFG-62, base FREMM)',['']);
fam('naval','Fragata F125','🇩🇪 Alemanha','Fragata','—','—',2019,'Fragata alemã de estabilização',['']);
fam('naval','Fragata F126','🇩🇪 Alemanha','Fragata','—','—',2028,'Próxima fragata alemã (MKS-180)',['']);
fam('naval','Corveta Type 056','🇨🇳 China','Corveta','—','—',2013,'Corveta chinesa classe Jiangdao',['','*Type 056A']);
fam('naval','Cruzador Long Beach','🇺🇸 EUA','Cruzador de mísseis nuclear','—','—',1961,'Primeiro cruzador de propulsão nuclear',['']);
fam('naval','Cruzadores Leahy / Belknap','🇺🇸 EUA','Cruzador de mísseis','—','—',1962,'Cruzadores da Guerra Fria',['*Leahy','*Belknap']);
fam('naval','Couraçado Richelieu','🇫🇷 França','Couraçado','—','—',1940,'Couraçado francês da WWII',['']);
fam('naval','Porta-aviões Clemenceau','🇫🇷 França','Porta-aviões','—','—',1961,'Porta-aviões francês da Guerra Fria',['*Clemenceau','*Foch']);
fam('naval','Porta-aviões Invincible','🇬🇧 Reino Unido','Porta-aviões V/STOL','—','—',1980,'Porta-aviões leve britânico',['']);
fam('naval','Submarino Rubis','🇫🇷 França','Submarino de ataque nuclear','—','—',1983,'SSN francês compacto',['']);
fam('naval','Fragata Halifax','🇨🇦 Canadá','Fragata','—','—',1992,'Fragata canadense classe Halifax',['']);
fam('naval','Fragata Formidable','🇸🇬 Singapura','Fragata furtiva','—','—',2007,'Fragata de Singapura (base La Fayette)',['']);
fam('naval','Destroyers britânicos County','🇬🇧 Reino Unido','Destroyer','—','—',1962,'Destroyers da Guerra Fria',['*County','*Type 82 Bristol']);
fam('naval','Lancha CB90','🇸🇪 Suécia','Lancha de assalto rápido','—','—',1991,'Embarcação de assalto costeiro',['']);

/* --- Mísseis --- */
fam('misseis','Otomat / Teseo','🇮🇹 Itália','Míssil antinavio','Subsônico','180 km',1977,'Antinavio ítalo-francês',['*Otomat Mk2','*Teseo Mk2/E']);
fam('misseis','SS.11 / SS.12','🇫🇷 França','Míssil antitanque','—','3.5 km',1956,'ATGM franceses iniciais',['*SS.11','*SS.12']);
fam('misseis','ENTAC','🇫🇷 França','Míssil antitanque','—','2 km',1957,'ATGM francês guiado por fio',['']);
fam('misseis','Shillelagh','🇺🇸 EUA','Míssil antitanque lançado por canhão','—','3 km',1968,'MGM-51 do Sheridan/M60A2',['']);
fam('misseis','Swingfire','🇬🇧 Reino Unido','Míssil antitanque','—','4 km',1969,'ATGM britânico',['']);
fam('misseis','Vigilant','🇬🇧 Reino Unido','Míssil antitanque','—','1.6 km',1963,'ATGM britânico inicial',['']);
fam('misseis','Bloodhound / Thunderbird','🇬🇧 Reino Unido','Míssil terra-ar','—','80 km',1958,'SAMs britânicos da Guerra Fria',['*Bloodhound','*Thunderbird']);
fam('misseis','Sea Dart / Sea Slug','🇬🇧 Reino Unido','Míssil naval superfície-ar','—','75 km',1973,'SAMs navais britânicos',['*Sea Dart','*Sea Slug']);
fam('misseis','Sea Wolf','🇬🇧 Reino Unido','Míssil naval de defesa pontual','—','10 km',1979,'SAM naval britânico',['']);
fam('misseis','Masurca','🇫🇷 França','Míssil naval superfície-ar','—','40 km',1968,'SAM naval francês',['']);
fam('misseis','Talos / Terrier / Tartar','🇺🇸 EUA','Míssil naval superfície-ar','—','—',1956,'Os "3 T" navais dos EUA',['*RIM-8 Talos','*RIM-2 Terrier','*RIM-24 Tartar']);
fam('misseis','ASROC','🇺🇸 EUA','Míssil antissubmarino','—','22 km',1961,'Foguete antissubmarino',['*RUR-5 ASROC','*RUM-139 VL-ASROC']);
fam('misseis','Ikara / Malafon','🌍 Aliados','Míssil antissubmarino','—','—',1964,'Sistemas ASW ocidentais',['*Ikara','*Malafon']);
fam('misseis','Sea Eagle / Martel','🇬🇧 Reino Unido','Míssil antinavio aéreo','—','110 km',1985,'Antinavio britânicos',['*Sea Eagle','*Martel']);
fam('misseis','Kh-22 / Kh-32','🇷🇺 URSS','Míssil de cruzeiro antinavio','Mach 4+','600 km',1962,'Grande antinavio soviético',['*Kh-22','*Kh-32']);
fam('misseis','Kh-15','🇷🇺 URSS','Míssil balístico ar-superfície','Mach 5','300 km',1980,'Míssil aerobalístico soviético',['']);
fam('misseis','Osa / Strela-10','🇷🇺 URSS','Míssil terra-ar móvel','—','10 km',1972,'SAMs táticos soviéticos',['*9K33 Osa (SA-8)','*9K35 Strela-10 (SA-13)']);
fam('misseis','Krug / Kub','🇷🇺 URSS','Míssil terra-ar','—','50 km',1965,'SAMs soviéticos de média altitude',['*2K11 Krug (SA-4)','*2K12 Kub (SA-6)']);
fam('misseis','Blowpipe / Javelin (UK)','🇬🇧 Reino Unido','Míssil terra-ar portátil','—','5 km',1975,'MANPADS britânicos',['*Blowpipe','*Javelin (UK)']);

/* --- Drones --- */
fam('drones','Boeing MQ-28 Ghost Bat','🇦🇺 Austrália','UAV leal wingman','Sensores','—',2021,'Loyal wingman australiano',['']);
fam('drones','Airbus Eurodrone','🇪🇺 Europa','UAV MALE','Sensores/armas','—',2025,'UAV de média altitude europeu',['']);
fam('drones','BlueBird / Aerostar','🇮🇱 Israel','UAV tático','Sensores','—',2000,'UAVs táticos israelenses',['*Aerostar','*WanderB','*ThunderB']);
fam('drones','Comercial militarizado','🌍 Diversos','Quadricóptero comercial adaptado','Câmera/granadas','—',2016,'Drones comerciais usados em combate',['*DJI Mavic','*DJI Matrice','*Autel EVO']);
fam('drones','VTOL de mapeamento','🇩🇪 Alemanha','UAV VTOL de asa fixa','Sensores','—',2019,'UAVs de recon/mapeamento VTOL',['*Quantum Vector','*Trinity Pro']);
fam('drones','Schiebel Camcopter S-100','🇦🇹 Áustria','UAV helicóptero','Sensores','—',2005,'VTOL UAV de reconhecimento naval',['']);
fam('drones','HESA Karrar / Kaman','🇮🇷 Irã','UAV de ataque','Bombas/mísseis','—',2010,'UAVs iranianos',['*Karrar','*Kaman-12','*Kaman-22']);

/* ===== Expansão ===== */
/* Junta base+variante com espaçamento correto:
 *   - sufixo começando com ' ' ou '/' → cola como veio ("Tiger I", "MP5/10")
 *   - base composta ("A / B")        → separa com espaço
 *   - base termina em minúscula      → separa ("Glock 17", "Beretta 92FS")
 *   - base MAIÚSCULA + sufixo dígito → separa ("CZ 75", "UMP 45")
 *   - sufixo é Palavra (Cap+minúsc.) → separa ("M200 Intervention", "MRAP MaxxPro")
 *   - base sigla longa (4+ MAIÚSC.)  → separa ("MRAP RG-33", "MRAP M-ATV")
 *   - resto                          → cola direto ("AKM", "M16A1", "MP5SD") */
const joinName = (base, suf) => {
  if (!suf) return base;
  if (suf.startsWith(' ') || suf.startsWith('/')) return base + suf;
  if (base.includes('/')) return base + ' ' + suf;
  const lastB = base[base.length - 1];
  if (/[a-zà-ú]/.test(lastB)) return base + ' ' + suf;
  if (/[A-Z]/.test(lastB) && /[0-9]/.test(suf[0])) return base + ' ' + suf;
  if (/^[A-Z][a-zà-ú]/.test(suf)) return base + ' ' + suf;
  if (/^[A-Z]{4,}$/.test(base)) return base + ' ' + suf;
  return base + suf;
};

const arsenal = {};
for (const c of CATS) arsenal[c.id] = [];
let total = 0;
for (const f of FAM) {
  for (const v of f.variantes) {
    /* string '*Nome Completo' = nome absoluto (não concatena com a base) */
    const o = typeof v === 'string' ? (v.startsWith('*') ? { nome: v.slice(1) } : { s: v }) : v;
    const nome = o.nome || joinName(f.nome, o.s || '');
    arsenal[f.cat].push({
      nome,
      origem: o.origem || f.origem,
      tipo: o.tipo || f.tipo,
      calibre: o.cal || f.calibre,
      alcance: o.alc || f.alcance,
      ano: o.ano || f.ano,
      nota: o.nota || f.nota
    });
    total++;
  }
}
/* dedup por nome dentro da categoria */
for (const c of CATS) {
  const seen = new Set();
  arsenal[c.id] = arsenal[c.id].filter((w) => { const k = w.nome.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}
total = CATS.reduce((s, c) => s + arsenal[c.id].length, 0);

const out = {
  meta: { total, geradoEm: new Date().toISOString(), fonte: 'Famílias reais expandidas em variantes — dados públicos aproximados.' },
  categorias: CATS,
  arsenal
};
writeFileSync('src/data/arsenal-expandido.json', JSON.stringify(out));
console.log('✓ src/data/arsenal-expandido.json');
console.log('Total:', total, 'armas');
for (const c of CATS) console.log(' ', c.label.padEnd(12), arsenal[c.id].length);
