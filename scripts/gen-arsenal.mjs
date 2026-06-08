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

/* ===== Expansão ===== */
const joinName = (base, suf) => {
  if (!suf) return base;
  if (suf.startsWith(' ') || suf.startsWith('/')) return base + suf;
  if (/^[A-Za-z0-9]/.test(suf) && /[A-Za-z0-9)]$/.test(base)) return base + suf; // AKM, F-16A
  return base + suf;
};

const arsenal = {};
for (const c of CATS) arsenal[c.id] = [];
let total = 0;
for (const f of FAM) {
  for (const v of f.variantes) {
    const o = typeof v === 'string' ? { s: v } : v;
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
