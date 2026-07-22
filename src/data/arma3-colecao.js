/**
 * Catálogo COMPLETO da coleção Steam do operador (0.8.0) — GERADO por
 * gerar-colecao.mjs (scratchpad) a partir da Steam Web API
 * (GetPublishedFileDetails) + raspagem das páginas. NÃO editar à mão:
 * regenere com o script.
 *
 * Coleção: "projeto-baluarte.vercel.app" · id 3769819471 · 221 itens.
 * Cada item: nome, cat, tam, img (capa no CDN do Steam), tags, deps,
 * resumo e — para itens SEM tutorial na aba Mods — o guia do autor.
 */

export const A3COL_INFO = {
  id: '3769819471',
  nome: 'projeto-baluarte.vercel.app',
  autor: 'Spartan Gamer BR',
  url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3769819471'
};

export const A3COL_CATS = [
  {
    "id": "mod",
    "nome": "Mods",
    "icon": "🧩",
    "desc": "Conteúdo e mecânica: armas, facções, IA, imersão — o grosso da coleção."
  },
  {
    "id": "cenario",
    "nome": "Cenários & Missões",
    "icon": "🎬",
    "desc": "Missões prontas pra jogar: Dynamic Recon Ops, KP Liberation, séries SP/Coop."
  },
  {
    "id": "composicao",
    "nome": "Composições",
    "icon": "🧱",
    "desc": "Bases, FOBs e conjuntos prontos pra soltar no Eden/Zeus."
  },
  {
    "id": "terreno",
    "nome": "Terrenos",
    "icon": "🗺",
    "desc": "Mapas novos: Isla Duala, Lingor e companhia."
  },
  {
    "id": "campanha",
    "nome": "Campanhas",
    "icon": "🏴",
    "desc": "Campanhas completas de história ou dinâmicas."
  }
];

export const A3COL_ITENS = {
 "167274881": {
  "nome": "[SP/MP]Dynamic Universal War System",
  "cat": "cenario",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/636421081619296188/C4DD3912FF3932C44962FB55693D7EE50F2E9C8A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "The DUWS proceduraly generates a mini campaign, with all the enemy zones to capture being randomly generated.  Or you can also choose to manually place your HQ and the enemy, and easily make your own unique campaign.  The key here is to have maximum replayability, where the player can setup his own campaign or let the DUWS create everything randomly for him.  You can play with the DUWS on any island you want, you just have to rename…",
  "temTutorial": false,
  "guia": "The DUWS proceduraly generates a mini campaign, with all the enemy zones to capture being randomly generated.  Or you can also choose to manually place your HQ and the enemy, and easily make your own unique campaign.  The key here is to have maximum replayability, where the player can setup his own campaign or let the DUWS create everything randomly for him.  You can play with the DUWS on any island you want, you just have to rename the .pbo file.\n\nYou can play the DUWS on any island you want, all you have to do is to rename the mission file, more info below.\n\nFEATURES:\n\n*Play the way you want:\n-Play as a lone wolf or as a SF team, using support assets and gadgets and perform side missions\n-Control your personnal squad of troopers and fight against the OPFOR\n-Control several squads, vehicles and supports and try to retake the island from the enemy\n-...or a mix of all of them\n*Persistent player stats througout the campaigns/missions, allowing the player to play a multi island driven campaign\n*Unlock abilities throughout the campaigns as you gain experience (persistent)\n*Pretty much every location is randomly generated on the map, from the HQ to the enemy zones and side mission locations.\n*Random side missions, with names randomly generated\n*Play the DUWS on any island you want to.\n*VAS by Tonic (Armory)\n*Several support options to unlock (UAV, Arty, Personnal FLIR, VAS, ...)\n*You can define the HQ and/or the enemy zones, or just the HQ and let the DUWS generate the zones automatically. You can also let the DUWS create everything by itself. Basicly you decide the level of randomization there is.\n*WARCOM(War Commander) system. BLUFOR forces will try to capture the island, war escalates as the campaign progress.\n*Dynamic weather. At the start of the campaign, you may choose the type of weather (mediterranean, temperate, tropical, arid...). The weather will then be randomly generated according to these parameters.\n*Full support of the High Command module\n\nMore info on:\nh"
 },
 "183397120": {
  "nome": "[DYN/CO-08] Whole Lotta Altis",
  "cat": "cenario",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/615041740935073478/2EC2F4603C4189B6A51478195A77A4A2CDAB3658/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Infantry",
   "Vehicles",
   "Air",
   "Altis"
  ],
  "deps": [],
  "resumo": "COOP version of the dynamic whole map mission WLA for 1-8 players.\n\nA Dynamic Whole Map COOP mission focusing on smooth performance, offering wide customization options and full freedom for gameplay in random generated world events that react on players actions. Where ever you go, there is life and events to see depending local relationship values and what kind of enemy/friendly installations there happens currently to be. Capture…",
  "temTutorial": false,
  "guia": "COOP version of the dynamic whole map mission WLA for 1-8 players.\n\nA Dynamic Whole Map COOP mission focusing on smooth performance, offering wide customization options and full freedom for gameplay in random generated world events that react on players actions. Where ever you go, there is life and events to see depending local relationship values and what kind of enemy/friendly installations there happens currently to be. Capture factories, piers, power plants to get resources faster to custom build AI guarded guardposts with custom easy-to-use constructing system or spend it to call more support that you can high command if wanted. Or drive any land vehicle, chopper or plane, capturing dynamic generating zones around map. Keep local civilians happy by commiting tasks for them or turn them rioting by raiding villages for more resources. Experience the campaign long mission run by over 400 scripts that are constantly updated and expanded.\n\nIn this COOP version its always possible now to play in CSAT side, giving trouble for opposite side player.\n\nTHIRD PARTY SCRIPTS:\n-Virtual Ammobox System for TAW_Tonic\n\nSPECIAL THANKS:\n-ss3goku0001 for Text Improvements\n-TAW_Tonic for Virtual Ammobox System (with permission, updated to work for AI-teammember too)\n\nRECOMMENDED MODS:\n-JSRS2.0 and Blastcore\n\nWORK IN PROGRESS. MORE TASKS AND FEATURES COMING THROUGH 2014"
 },
 "192890745": {
  "nome": "BECTI 0.97 - Stratis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/504695938647274502/B11E2E9F6FCF67B4FCA78F9A2A47604E98008655/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Vehicles",
   "Air"
  ],
  "deps": [],
  "resumo": "BECTI is a Conquer The Island gamemode based on the old school OFP MFCTI where two teams composed of Players and AI fight for the controls of an island in a power struggle with towns and bases.\n\nThe commander is the leader of your side, only he may build the base and set the income distribution, all team leaders shall always listen to the commander. The commander is the only one which is able to perform upgrades and assign orders.…",
  "temTutorial": false,
  "guia": "BECTI is a Conquer The Island gamemode based on the old school OFP MFCTI where two teams composed of Players and AI fight for the controls of an island in a power struggle with towns and bases.\n\nThe commander is the leader of your side, only he may build the base and set the income distribution, all team leaders shall always listen to the commander. The commander is the only one which is able to perform upgrades and assign orders.\n\nTowns need to be captured and held by your side, to capture a town, you simply have to stand next to the flag while no enemy is around, but watch out ! the town occupation may try to defend it ! The generated income and the units may vary depending on a town's size.\n\nFunds are mainly earned by capturing town and salvaging wrecks but killing enemies will also reward you with a bounty bonus, funds may be used to purchase units and gear.\n\nParameters allows you to play with a different setup all the time, nearly everything can be changed (AI, base, environment, economy, gameplay, module, respawn, towns...).\n\nAs the fights goes on, different assets may appear such as:\n\n    HQ: The HQ is the commander's main toy. Once destroyed, a side may no longer build factories so move it wisely!\n    Repair trucks: Repair trucks may be used by anyone to buy and place defensive structure but they can also be used to repair and build factories. FOB may be deployed from it upon request!\n    Ammo trucks: The ammo truck act as mobile resupply point for both infantry and vehicles. The gear and the service menu may be accessed from it.\n    Salvage trucks: Salvage trucks may be used to gain a certain cash amount from vehicle wrecks (You get 50% of the bounty, the rest is split among the other units). Independent trucks may also be purchased by commander.\n    Forward operating base: Those special structures may be built from Repair Truck and may act as a mobile respawn/resupply point. Note that they are limited in a way that only X of them may be placed at a time. T"
 },
 "192891753": {
  "nome": "BECTI 0.97 - Altis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/504695938647382353/B11E2E9F6FCF67B4FCA78F9A2A47604E98008655/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Vehicles",
   "Air"
  ],
  "deps": [],
  "resumo": "BECTI is a Conquer The Island gamemode based on the old school OFP MFCTI where two teams composed of Players and AI fight for the controls of an island in a power struggle with towns and bases.\n\nThe commander is the leader of your side, only he may build the base and set the income distribution, all team leaders shall always listen to the commander. The commander is the only one which is able to perform upgrades and assign orders.…",
  "temTutorial": false,
  "autor": "Benny",
  "guia": "BECTI is a Conquer The Island gamemode based on the old school OFP MFCTI where two teams composed of Players and AI fight for the controls of an island in a power struggle with towns and bases.\n\nThe commander is the leader of your side, only he may build the base and set the income distribution, all team leaders shall always listen to the commander. The commander is the only one which is able to perform upgrades and assign orders.\n\nTowns need to be captured and held by your side, to capture a town, you simply have to stand next to the flag while no enemy is around, but watch out ! the town occupation may try to defend it ! The generated income and the units may vary depending on a town's size.\n\nFunds are mainly earned by capturing town and salvaging wrecks but killing enemies will also reward you with a bounty bonus, funds may be used to purchase units and gear.\n\nParameters allows you to play with a different setup all the time, nearly everything can be changed (AI, base, environment, economy, gameplay, module, respawn, towns...).\n\nAs the fights goes on, different assets may appear such as:\n\n    HQ: The HQ is the commander's main toy. Once destroyed, a side may no longer build factories so move it wisely!\n    Repair trucks: Repair trucks may be used by anyone to buy and place defensive structure but they can also be used to repair and build factories. FOB may be deployed from it upon request!\n    Ammo trucks: The ammo truck act as mobile resupply point for both infantry and vehicles. The gear and the service menu may be accessed from it.\n    Salvage trucks: Salvage trucks may be used to gain a certain cash amount from vehicle wrecks (You get 50% of the bounty, the rest is split among the other units). Independent trucks may also be purchased by commander.\n    Forward operating base: Those special structures may be built from Repair Truck and may act as a mobile respawn/resupply point. Note that they are limited in a way that only X of them may be placed at a time. T"
 },
 "295295762": {
  "nome": "HETMAN - Artificial Leader",
  "cat": "mod",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/572273937138586773/0A562622D503A2A259A08D7D3E83C7C9AC14F7F2/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [],
  "resumo": "(requires CBA)\n\nHAL is intended to enliven the battlefield the same way a human leader would operate. In other words, this addon gives one or both sides of a conflict a field-commander level AI.\n\nTo be more specific, whatever set of groups you put under Hetman control, he'll try to turn them into effective force, an organized army fighting as one to take designated objectives and neutralize any encountered resistance. Player under…",
  "temTutorial": false,
  "autor": "Rydygier",
  "guia": "(requires CBA)\n\nHAL is intended to enliven the battlefield the same way a human leader would operate. In other words, this addon gives one or both sides of a conflict a field-commander level AI.\n\nTo be more specific, whatever set of groups you put under Hetman control, he'll try to turn them into effective force, an organized army fighting as one to take designated objectives and neutralize any encountered resistance. Player under HAL's control is only one of many cogs in the war machine, so will be used as any other asset, when needed. You may expect flanking, artillery support, logistical support, non-combat recon, cargo transportation, morale simulation, Leader's personality simulation, offensive and defensive stance, many kinds of missions for human and AI Team Leaders and much more. Basic setup is simple, but for advanced users is awaiting enormous amount of init configuration variables giving very deep and wide control over Hetman's mechanics including Big Boss mode, where commander of higher level is controling several Leaders and pointing objectives dynamically, at his discretion, to take whole map.\n\nFull PDF manual online.\n\nBI Forums thread (news, help, feedback, discussion).\n\nHETMAN: War Stories mission, an easy way to familiarize with Hetman.\n\nThis addon was created \"by player for players\", source scripts you can freely modify, copy, \"cannibalize\", to use in your projects. It is released under APL-SA license. Voice acting: DuddBudda, SiC_Disaster, nettrucker. I'll be grateful for notification about each such usage.\n\nEnjoy being under control.\n\nRydygier"
 },
 "310594159": {
  "nome": "HUNTER SIX - Special Operations Unit",
  "cat": "cenario",
  "tam": "11 MB",
  "img": "https://images.steamusercontent.com/ugc/546381588901141515/9038423560044F85D4DA0F519B21410FDC77AFBC/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Campaign",
   "Altis"
  ],
  "deps": [],
  "resumo": "Hunter Six: Special Operation Unit is a Single Player open map Campaign set in 2016 on Altis.\n\nNo Mods Required.\n\nHUNTER SIX 2 (Now Available):\nSTEAM WORKSHOP LINK\n\nFor more content, please SUPPORT the project at:\nDONATION\n\nThe main idea is not to copy a linear Call of Duty campaign style, but instead to focus on the best features that ArmA series offers.    The campaign offers a fully randomized open map campaign with two main…",
  "temTutorial": false,
  "guia": "Hunter Six: Special Operation Unit is a Single Player open map Campaign set in 2016 on Altis.\n\nNo Mods Required.\n\nHUNTER SIX 2 (Now Available):\nSTEAM WORKSHOP LINK\n\nFor more content, please SUPPORT the project at:\nDONATION\n\nThe main idea is not to copy a linear Call of Duty campaign style, but instead to focus on the best features that ArmA series offers.    The campaign offers a fully randomized open map campaign with two main objectives: locate and rescue the hostages and locate and eliminate the leader of the rebels. The decisions how to reach the goals are fully up to the player. Each playthrough will also offer a different objectives path to collect the intel on the main targets locations. The content is packed within one dynamic SP mission.\n\nOverview:\nOn the eve of civil war in Greece, a Navy Special Unit - HUNTER SIX is sent to Altis to locate and rescue two missing CIA agents, who were tracking the rebel separatist leader, that calls himself the Messiah.\n\nKey Features:\n    - open world, fully procedural mini campaign (each playthrough is a different scenario)\n    - teammates level up system increases their combat skill\n    - teammates individual perks have an actual influence on your team\n    - teammates fatigue system (operators need to get back to the base and rest)\n    - talk to your teammates to learn facts from their personal life\n    - teammates permadeath\n    - squad selection, medal & ribbon awards and a squad statistics screen\n    - a reputation system that verifies if the locals are going to help you or join the rebels\n    - dynamic day/night cycle with sleeping (skip time) option\n    - new Transport and Close Air Support system via radio\n    - interview the locals, gather intel and plan your next move against the rebels\n    - search bodies to collect intel\n    - NEW! Playable teammates (press U)\n\nInspired by:\nTom Clancy's Ghost Recon (2001)\nArmA 2 - Manhattan mission\nBooks by Howard E. Wasdin, Marcus Luttrell, Chris Kyle, Mark Owen and Brandon Web"
 },
 "338988835": {
  "nome": "MCC Sandbox 4 -  Mission Making The Easy Way",
  "cat": "mod",
  "tam": "36 MB",
  "img": "https://images.steamusercontent.com/ugc/956353122130177353/CCF736FC24E0CAD04F556221A856C31EF9E9F5A9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Join our Discord Channel and our server\nhttps://discord.gg/3DzkzAn\n\nMCC Wikia page\n\nhttp://mccsandbox.wikia.com/wiki/MCCSandbox_Wiki\n\nSo what is MCC Sandbox exactly?\n\"A powerful tool that takes control of any mission you’re running.\" - Rock, Paper, Shotgun - July 12TH 2013.\n\nLicense:\nUnder GPL3 License as described here:\n http://http://www.gnu.org/licenses/gpl-3.0.en.html\n\nMCC Sandbox with its integrated advanced AI system (GAIA) is…",
  "temTutorial": false,
  "guia": "Join our Discord Channel and our server\nhttps://discord.gg/3DzkzAn\n\nMCC Wikia page\n\nhttp://mccsandbox.wikia.com/wiki/MCCSandbox_Wiki\n\nSo what is MCC Sandbox exactly?\n\"A powerful tool that takes control of any mission you’re running.\" - Rock, Paper, Shotgun - July 12TH 2013.\n\nLicense:\nUnder GPL3 License as described here:\n http://http://www.gnu.org/licenses/gpl-3.0.en.html\n\nMCC Sandbox with its integrated advanced AI system (GAIA) is Freedom.\nYou can do anything you ever dreamed of in ArmA without knowing even one script command.\n\nEither you play PvP, Co-op or survival, It will change the way you play ArmA forever.\n\nInspired be VBS and it's in game real time editor we tried to create something similar that will let any player as the role of an instructor or as we call him the mission maker, to create different real life scenarios and put them to the test. Then he can alter and change the mission progress as he see fit in order to give the other players a more divert and intense experience. MCC support role/kits selection and it's build to work on dedicated servers. MCC will save the player progress and let him unlock new gear, weapons, scopes and uniforms.\nYou can create missions without any scripting knowladge and alter them in while in game. You can save your missions and share with friends.\nMCC expends Zeus and ads more variety to it.\n\nSupport us in Make ArmA Not War:\n http://makearmanotwar.com/entry/EbPhuUe5nR#.VGH2aTSqk0D\n\nYou'll get:\nCustom AI Behavior  – GAIA an new AI level like no other, AI will fortify in buildings, place mines, throw smoke grenades, use empty vehicles, suppress with automatic rifles, flank, call CAS and artillery  and much more.\n\nMission Generator – Define your game style and the amount of players and press \"Generate\" and MCC will generate random, suprising fully voice narrating with up to 20 different objectives.\n\n3D editor – You can place units and object in 3D save them, load them, add some unique presets for them.\n\nGroup generator – Yo"
 },
 "410206202": {
  "nome": "Simple Single Player Cheat Menu",
  "cat": "mod",
  "tam": "106 KB",
  "img": "https://images.steamusercontent.com/ugc/775102075317058450/ED6D286A1978CB50D7812F30CA10742FD7CB4CC1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [],
  "resumo": "v1.1.7 Released!\n\nATTENTION! Since 1.1.5 you must press the LOAD SSPCM button for the cheat menu to load!\n\nSimple single player cheat menu by Benargee. This addon is accessible inside any single player mission or scenario, Including the official campaign. Includes access to Zeus, debug console, virtual arsenal and a few other cheat functions. This addon is also very useful for mission developement, without having to include temporary…",
  "temTutorial": true
 },
 "450814997": {
  "nome": "CBA_A3",
  "cat": "mod",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/1014940825593906790/E3A99D3EB1031126D7FFADCF6BBDA00FAA7FAFEC/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "CBA: Community Based Addons for Arma 3\n\nWhat does the name Community Base Addons mean? It is a system that:\n\n• Offers a range of features for addon-makers and mission designers.\n\n• Aims to have community wide acceptance and to be used as much as possible by community addons to maintain compatibility.\n\n• The community is very much encouraged to request or submit functionality.\n\n• The most obvious example would be to submit functions to…",
  "temTutorial": true
 },
 "462357997": {
  "nome": "Warlords",
  "cat": "mod",
  "tam": "8 MB",
  "img": "https://images.steamusercontent.com/ugc/25115303595431457/BB30E45BC1ED8B29C6AFA2DEEC52CDE933033D6C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Coop",
   "PvP"
  ],
  "deps": [],
  "resumo": "Warlords for Arma 3 is a multiplayer mode set up as a sort of Sector Control / CTI hybrid supporting TvT, PvP as well as COOP and even solo play against the AI.\n\nVersion 0.98 (Jul 22 2016)\n\nDetailed info, including how to set up your own Warlords mission, can be found on the BI forums: https://forums.bistudio.com/topic/182339-warlords/\n\nDISCLAIMER: Although I'm a BIS employee, this is an UNOFFICIAL mod and should be treated as any…",
  "temTutorial": false,
  "guia": "Warlords for Arma 3 is a multiplayer mode set up as a sort of Sector Control / CTI hybrid supporting TvT, PvP as well as COOP and even solo play against the AI.\n\nVersion 0.98 (Jul 22 2016)\n\nDetailed info, including how to set up your own Warlords mission, can be found on the BI forums: https://forums.bistudio.com/topic/182339-warlords/\n\nDISCLAIMER: Although I'm a BIS employee, this is an UNOFFICIAL mod and should be treated as any other usermade content.\n\nHow do I run it?\n\nAfter subscribing on Workshop and restarting the game, Warlords scenarios will appear when setting up a MP game. Stratis and Altis both have their dedicated missions.\n\nGame rules\n\n(Note that the current rules may change in the future)\n\nCore mechanics\n    There are three contesting factions: BLUFOR, OPFOR and Independents (AAF). BLUFOR and OPFOR can be controlled by players, AAF is always AI only.\n    BLUFOR and OPFOR start in their bases and respawn there. In every scenario, there are multiple sectors linked with each other and with the bases themselves.\n        All sectors except faction bases are initially controlled by AAF.\n        All sectors except the player's faction's base are initially locked and inaccessible (zone restriction).\n    At the start of the game, players vote for the sector to unlock and attack via the Sector voting tab in the map screen.\n        Players can vote only for sectors directly linked with a sector controlled by their faction (at the start it's only those connected to their faction's base).\n    Once a sector is selected, it's unlocked and zone restriction is removed for the entirety of the game.\n        This means that even if a faction seizes a sector and then loses control over it, the sector can be reclaimed by that faction even without being selected again.\n    A sector is seized when the attacking faction is the dominating presence in its area.\n        Seizing progress is shown by a HUD in the bottom right corner of the screen.\n    Once the selected sector is s"
 },
 "463939057": {
  "nome": "ace",
  "cat": "mod",
  "tam": "228 MB",
  "img": "https://images.steamusercontent.com/ugc/964230428541162652/F7DC4A5DD2A4896E2D572D7E9E085489426FC64B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Content Review",
   "x64"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Advanced Combat Environment 3 (ACE3)\n\nhttps://ace3.acemod.org\n\nACE3 is the collaborative efforts of the former AGM and CSE teams, along with many of the developers from Arma 2's ACE2 project.\n\nThis mod is entirely open-source (we are hosted on GitHub), and everyone is free to propose changes or maintain their own, customized version as long as they make their changes open to the public in accordance with the GNU General Public License.…",
  "temTutorial": true
 },
 "497660133": {
  "nome": "CUP Weapons",
  "cat": "mod",
  "tam": "6.6 GB",
  "img": "https://images.steamusercontent.com/ugc/766100671611183860/2B9D482C5FA7F72A8EDB6D4B2B3B6C80F4752B99/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "CONTENT\n\nThis is the WEAPONS pack. It contains all the weapons, assault rifles, machine guns, shotguns, grenade launchers, pistols, sniper rifles, and whatever else goes \"boom\" in Arma 2 and the expansion and DLC's. All weapons are stripped of their attachments were possible, and these have been turned into attachable scopes, lasers, flashlights, and bipods interchangeable with the vanilla content.\n\nSome of the weapons are new or…",
  "temTutorial": true
 },
 "497661914": {
  "nome": "CUP Units",
  "cat": "mod",
  "tam": "6.2 GB",
  "img": "https://images.steamusercontent.com/ugc/766100671610525227/8FBD235EDAC76072CC4F37F5786EF8B2C7CF4F70/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character"
  ],
  "deps": [
   "CUP Weapons",
   "CBA_A3"
  ],
  "resumo": "CONTENT\n\nThis is the Units pack. It contains all the units of the original Arma 2 and Arrowhead as well as the DLC. Right now, there are a lot of placeholder units that do not look like the original ones but are instead stand-ins using default Arma 3 uniforms and CUP equipment.\nAll uniforms and vests are compatible with vanilla content, meaning that you can mix vanilla and CUP content.\n\nThis pack contains:\n\n• almost all units from…",
  "temTutorial": true
 },
 "541888371": {
  "nome": "CUP Vehicles",
  "cat": "mod",
  "tam": "14.3 GB",
  "img": "https://images.steamusercontent.com/ugc/772869688661233505/6663ECB13741B70479891439FF43B9A4BAF2CE76/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Boat",
   "Plane"
  ],
  "deps": [
   "CBA_A3",
   "CUP Weapons",
   "CUP Units"
  ],
  "resumo": "CONTENT\n\nThis is the VEHICLE pack. It contains all the vehicles from Arma 2 and the expansion\nand DLC's. All vehicles are ported with Arma 3 standarts and features.\n\nFor credits and other information, see our web page.\n\nThis pack contains:\n\n• almost all vehicles from previous arma titles like https://community.bistudio.com/wiki/ArmA_2:_Vehicles\n\n• community made additional content that was donated and fit's the timeframe\n\nISSUES\n\nTHIS…",
  "temTutorial": true
 },
 "579942493": {
  "nome": "US Military Mod",
  "cat": "mod",
  "tam": "179 MB",
  "img": "https://images.steamusercontent.com/ugc/867368163161862071/8E68043CE471EAA4183AF1B13CA89401DF24604E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "US Military Mod\n\nBy Delta Hawk\n\n///DO NOT REUPLOAD\\\\\\\n\nThis mod features a comprehensive selection of high quality, realistic military gear, uniforms and equipment in effort to accurately portray basic U.S. Army Soldiers, including infantry and Rangers, U.S. Marine infantry, and basic Airmen and Sailor for the late 1980s to the mid 1990s.\n\nThank you for downloading my mod! Enjoy!\n\nFEATURES\n\n- Over 200 high quality, period accurate…",
  "temTutorial": true
 },
 "583496184": {
  "nome": "CUP Terrains - Core",
  "cat": "terreno",
  "tam": "13.2 GB",
  "img": "https://images.steamusercontent.com/ugc/954108744283705578/9057AFA885298D149510454FA270399226B50A9C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain"
  ],
  "deps": [],
  "resumo": "CONTENT\n\nThis is the TERRAINS - CORE pack, the successor of \"A3MP\" and \"All in ArmA - Terrain Pack (AiA TP)\". It contains all the core data for maps from Arma1, Arma 2, expansions and DLC's.\n\nThis pack contains:\n\n• all terrains core data like models and configs from previous arma titles\n\n• community made additional content that was donated and fit's the timeframe\n\nIMPORTANT!\nThis is the CORE DATA pack, it DOES NOT include any maps!\nTo…",
  "temTutorial": false,
  "guia": "CONTENT\n\nThis is the TERRAINS - CORE pack, the successor of \"A3MP\" and \"All in ArmA - Terrain Pack (AiA TP)\". It contains all the core data for maps from Arma1, Arma 2, expansions and DLC's.\n\nThis pack contains:\n\n• all terrains core data like models and configs from previous arma titles\n\n• community made additional content that was donated and fit's the timeframe\n\nIMPORTANT!\nThis is the CORE DATA pack, it DOES NOT include any maps!\nTo get the maps from CUP Terrains Pack, you need to download the MAPS PACK\nhttp://steamcommunity.com/sharedfiles/filedetails/?id=583544987\n\nISSUES\n\nTHIS WORKSHOP PAGE IS NOT MONITORED BY THE DEVELOPERS\nPlease report bugs to\n\nhttps://dev.cup-arma3.org/u/Ticket\n\nABOUT US\n\nThe Community Upgrade Project is a cooperative effort to bring the content of Bohemia Interactive's earlier games (Arma 2 and Arma 2: Operation Arrowhead and DLC's in particular) into Arma 3, updated to the functionality and standards of the next generation game.\n\nFor more information on the project, check our webpage at\n\nhttp://cup-arma3.org/\n\nor visit us on out discord server at\n\nhttps://dev.cup-arma3.org/u/discord\n\nDONATIONS\n\nHelp us to keep this Mod up and running, The link below will lead you to our donation page.\nThank you!\n\nhttps://www.cup-arma3.org/donations\n\nREDISTRIBUTION\n\nANY REUPLOADS (STANDALONE OR PART OF MODPACKS) TO THE STEAM WORKSHOP (ARMA3 & DAYZ) ARE PROHIBITED AND VIOLATING THE STEAM WORKSHOP EULA SECTION 6D, AS WELL AS THE CUP LICENSE. REUPLOADS WILL BE TAKEN DOWN VIA DMCA NOTICE WITHOUT WARNING!\nhttps://www.cup-arma3.org/cup-license"
 },
 "583544987": {
  "nome": "CUP Terrains - Maps",
  "cat": "terreno",
  "tam": "3.2 GB",
  "img": "https://images.steamusercontent.com/ugc/767236446983929084/E6866F24F7AD0E4175AE1488649161A0934D41E9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain"
  ],
  "deps": [],
  "resumo": "CONTENT\n\nThis is the TERRAINS pack, the successor of \"A3MP\" and \"All in ArmA - Terrain Pack (AiA TP)\". It contains 16 maps from Arma: Arma: Armed Assault and the expansion, Arma 2 and the expansion and DLC's.\n\nFor credits and other information, see our web page.\n\nThis pack contains:\n\n• all terrains from previous arma titles\n\n• community made additional content that was donated and fit's the timeframe\n\nISSUES\n\nTHIS WORKSHOP PAGE IS NOT…",
  "temTutorial": false,
  "guia": "CONTENT\n\nThis is the TERRAINS pack, the successor of \"A3MP\" and \"All in ArmA - Terrain Pack (AiA TP)\". It contains 16 maps from Arma: Arma: Armed Assault and the expansion, Arma 2 and the expansion and DLC's.\n\nFor credits and other information, see our web page.\n\nThis pack contains:\n\n• all terrains from previous arma titles\n\n• community made additional content that was donated and fit's the timeframe\n\nISSUES\n\nTHIS WORKSHOP PAGE IS NOT MONITORED BY THE DEVELOPERS\nPlease report bugs to\n\nhttps://dev.cup-arma3.org/u/Ticket\n\nABOUT US\n\nThe Community Upgrade Project is a cooperative effort to bring the content of Bohemia Interactive's earlier games (Arma 2 and Arma 2: Operation Arrowhead and DLC's in particular) into Arma 3, updated to the functionality and standards of the next generation game.\n\nFor more information on the project, check our webpage at\n\nhttp://cup-arma3.org/\n\nor visit us on out discord server at\n\nhttps://dev.cup-arma3.org/u/discord\n\nDONATIONS\n\nHelp us to keep this Mod up and running, The link below will lead you to our donation page.\nThank you!\n\nhttps://www.cup-arma3.org/donations\n\nREDISTRIBUTION\n\nANY REUPLOADS (STANDALONE OR PART OF MODPACKS) TO THE STEAM WORKSHOP (ARMA3 & DAYZ) ARE PROHIBITED AND VIOLATING THE STEAM WORKSHOP EULA SECTION 6D, AS WELL AS THE CUP LICENSE. REUPLOADS WILL BE TAKEN DOWN VIA DMCA NOTICE WITHOUT WARNING!\nhttps://www.cup-arma3.org/cup-license"
 },
 "620260972": {
  "nome": "ALiVE",
  "cat": "mod",
  "tam": "465 MB",
  "img": "https://images.steamusercontent.com/ugc/895518197408616272/A0D89A72B66FF2810D19C9731A0D34A58871B3A9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Content Review",
   "x64"
  ],
  "deps": [],
  "resumo": "This is the official ALiVEmod team release of ALiVE on Steam\n\nALiVE is the next generation dynamic persistent battlefield for ArmA3. Developed by the Multi Session Operations team, the easy to use modular mission framework provides everything that players and mission makers need to set up and run realistic military operations in almost any scenario up to Company level, including command, combat support, service support and logistics.…",
  "temTutorial": false,
  "guia": "This is the official ALiVEmod team release of ALiVE on Steam\n\nALiVE is the next generation dynamic persistent battlefield for ArmA3. Developed by the Multi Session Operations team, the easy to use modular mission framework provides everything that players and mission makers need to set up and run realistic military operations in almost any scenario up to Company level, including command, combat support, service support and logistics.\n\nAI Commanders automatically plan and direct missions for all AI forces across the Area of Operations, identifying strategic objectives and reacting to changes in the tactical situation. The revolutionary Virtual Profile System can support thousands of units operating simultaneously across the map with minimal impact on performance. The result is a realistic and constantly changing battlefield which truly brings ArmA3 ALiVE.\n\nPlease visit our Wiki here:\nhttps://alivewiki.com/\n\nJoin us on Discord:\nhttps://discord.gg/KkacXFx\n\nPlease note the ALiVE War Room is no longer available.\n\nQ. If War Room is down, how do I save my mission progress/use persistence?\n\nA. Set the 'Database Source' parameter in the ALiVE data module to 'Local'. This will allow persistence to function via saving mission persistence data to the host machine, and you can save as normal.\n\nQ. Are the official Bohemia Interactive DLCs & CDLC's compatible with ALiVE?\n\nA. Yes all DLCs & CDLC's are compatible.\n\nThe latest ALiVE addon files can also be downloaded directly from:\nhttps://github.com/ALiVEOS/ALiVE.OS/releases/tag/v2.2.0.2601221"
 },
 "632435682": {
  "nome": "Remove stamina",
  "cat": "mod",
  "tam": "30 KB",
  "img": "https://images.steamusercontent.com/ugc/496890651657415180/7BBABBE5D5CC19F276FFE57B41496432E8E11783/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Simple mod which executes \"player enableStamina false\" each second. Useful when you play CO-OP missions which require a lot of running.\n\nCBA_A3 is required\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=450814997",
  "temTutorial": true
 },
 "692082939": {
  "nome": "[STOPPED] Chornobyl Zone",
  "cat": "terreno",
  "tam": "1.7 GB",
  "img": "https://images.steamusercontent.com/ugc/111860334490250488/BC01D3FE9C94F49992E89FBE8B00058FA6F857A0/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain"
  ],
  "deps": [],
  "resumo": "Chornobyl Exclusion Zone is an area with controlled possibility of entry and residence on grounds of radioactive contamination caused by the Chernobyl accident in 1986. It is located on the territory of Kiev and Zhitomir regions of Ukraine and on its northern border with Polesie state radioecological reserve in Belarus.\nThe Zone is divided into two parts, an inner diameter of 10 km and an external 30 km from the accident site. The…",
  "temTutorial": false,
  "autor": "ArmanIII",
  "guia": "Chornobyl Exclusion Zone is an area with controlled possibility of entry and residence on grounds of radioactive contamination caused by the Chernobyl accident in 1986. It is located on the territory of Kiev and Zhitomir regions of Ukraine and on its northern border with Polesie state radioecological reserve in Belarus.\nThe Zone is divided into two parts, an inner diameter of 10 km and an external 30 km from the accident site. The inner zone are allowed only employees of the plant, scientists and also limited permission participants of excursions. Into the outer zone has been slowly at their own risk and people returned voluntarily earlier evictions during the evacuation. These people rather a higher age receive from the state contribution for the purchase and importation of safe water and food grown outside the zone.\n\n----\n\nCurrent version 0.47\n\nANYONE WHO HAS AN EMPTY MAP (WITHOUT OBJECTS), PLEASE GO TO LEFT UPPER PART OF MAP!!! MAP IS IN BETA STAGE!!!\nMap doesn't contain scenario, so you must load map in Eden editor!\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!\n\nWork on this map is canceled, no more new updates!!\nIn future I want to re-create the map again.\n\nAnd what you can look forward to?\n-satellite images as terrain satmap\n-better textures quality\n-accessible reactor sarcofag\n-CHNPP without the New Safe Confinement\n\nCreator\n\nArmanIII"
 },
 "699630614": {
  "nome": "Specialist Military Arms (SMA) Version 2.7.1",
  "cat": "mod",
  "tam": "1.1 GB",
  "img": "https://images.steamusercontent.com/ugc/445109396306602786/8D564F60F8C4B73D29ACAD252660716C2D6E52CB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Sound",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "BI Forums Thread\nArmaholic…",
  "temTutorial": true
 },
 "705986840": {
  "nome": "Dynamic Recon Ops - Altis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/499155130687310074/F521A4AE49435074ADEDB1C9AA9D889FA0659F99/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Altis"
  ],
  "deps": [],
  "resumo": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get…",
  "temTutorial": false,
  "autor": "baby yoda executed by the state",
  "guia": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get playing a new scenario in singleplayer or co-op. With as few changes to the base game as possible, DRO aims to showcase the unique and varied gameplay that Arma 3 has to offer for smaller scale infantry combat.\nAdditionally, DRO has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Menu on startup to select a variety of options including time of day and insertion type\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 30mins - 1hr 30mins duration"
 },
 "713709341": {
  "nome": "Advanced Rappelling",
  "cat": "mod",
  "tam": "470 KB",
  "img": "https://images.steamusercontent.com/ugc/272847783026597640/AB56C590FEA01D3E419AC9DC9A7BCCDF077EA0DE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter"
  ],
  "deps": [],
  "resumo": "Adds support for helicopter rappelling. SP & MP Compatible.\n\nCompletely optional, but if you want to give back for any of my addons, I would greatly appreciate Donations!\n\nhttps://forums.bistudio.com/topic/192126-advanced-rappelling/\n\nWant more? Check out my latest mods!\n\nAlso check out my Advanced Urban Rappelling, Advanced Sling Loading  and Advanced Towing addons for more rope features!\n\nFeatures:\n\n - Rappel up to 6 players or AI…",
  "temTutorial": true
 },
 "714149065": {
  "nome": "Isla Duala",
  "cat": "terreno",
  "tam": "521 MB",
  "img": "https://images.steamusercontent.com/ugc/1645462536950287945/0AA179F80D2A6EEDC78E6E613E99E08EBFD8DF22/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain"
  ],
  "deps": [
   "CUP Terrains - Core"
  ],
  "resumo": "Isla Duala: one of the most played islands since Arma2 release.\n\nVersion: 3.9.5\n\nEl Diablo, IceBreakr and Tourist Board of Afrene are inviting you to visit a paradise on Earth - Isla Duala. Tropical forests, sandy beaches, wild savannah, clear water and... nasty neighbouring Republic of Molatia threatening to overrun friendly Republic Afrene in Southern part of Duala. Current peace can be very decieving. Marks of previous decade-long…",
  "temTutorial": false,
  "autor": "IceBreakr",
  "guia": "Isla Duala: one of the most played islands since Arma2 release.\n\nVersion: 3.9.5\n\nEl Diablo, IceBreakr and Tourist Board of Afrene are inviting you to visit a paradise on Earth - Isla Duala. Tropical forests, sandy beaches, wild savannah, clear water and... nasty neighbouring Republic of Molatia threatening to overrun friendly Republic Afrene in Southern part of Duala. Current peace can be very decieving. Marks of previous decade-long war can be seen even today and no-man zone still divides both countries with high fence running all along the border. Only few of the natives dare to travel across. With recent diamond and oil findings in Molatia their war machine is growing. European and US peacekeeping forces are currently present in Afrene in small numbers, but this might change very soon. Russia and China are in close business ties with Molatia and Afrene is mainly providing services for US and European tourists. War between Molatia and Afrene might be just around the corner...\n\nIsla Duala is a fictional 100km2 African island divided into two countries: Molatia on North and Afrene on South. Border runs along the river and there is a constant tension between both countries. Both countries are backed by different developed world countries that abuse their natural resources: oil and diamonds in Molatia and tourism (natural beauty) in Afrene. Recent discovery of rich oil reserves on Hazena (NW Molatia) ignited the old hatred between countries and Molatia is using fresh income to boost its military. Agressive Molatia is ready to invade weakened Afrene... but US/Europe forces with UN are there to keep the balance and enforce peace.\n\nLike my work?\n\nI've dedicated 12+ years in creating new battleground and sightseeing places for your enjoyment. Please support me via following:\n\n1. Patreon (signup required / monthly fee)\n\n2. Paypal (single amount)"
 },
 "718649903": {
  "nome": "Lingor/Dingor Island",
  "cat": "terreno",
  "tam": "739 MB",
  "img": "https://images.steamusercontent.com/ugc/940586221759769492/16D8874368204643C0C14A04DA1C83B0E517AFEA/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain"
  ],
  "deps": [
   "CUP Terrains - Core"
  ],
  "resumo": "Lingor & Dingor Island\n\nVersion: 3.9.6\n\nThis lush green environment in a fictional country somewhere near the Equator. Inspiration were countries such as Venezuela & Colombia. ~5 months were spent on research and creation of this world.\n\nLingor is one of the most played maps in Arma Community and first really lush green environment that worked well with all the optimizations.\nReason for the project is that I've been waiting for years…",
  "temTutorial": false,
  "autor": "IceBreakr",
  "guia": "Lingor & Dingor Island\n\nVersion: 3.9.6\n\nThis lush green environment in a fictional country somewhere near the Equator. Inspiration were countries such as Venezuela & Colombia. ~5 months were spent on research and creation of this world.\n\nLingor is one of the most played maps in Arma Community and first really lush green environment that worked well with all the optimizations.\nReason for the project is that I've been waiting for years for a proper optimised jungle map. With help of great talented man Berghoff that is now (after 5-6 months of hard work) possible to enjoy.\n\nWe have to understand that vegetation rich map is a whole different matter in BIS engine. PCs that were able to run Duala/Jade Groove on max settings & view distance of 10 km will probably only have sufficient FPS with 1000-4000 meter distance on Lingor. With months of optimisations (especially Berghoff did an amazing feat here) we can now enjoy jungle from air or from a grunt's perspective.\n\nLike my work?\n\nI've dedicated 12+ years in creating new battleground and sightseeing places for your enjoyment. Please support me via following:\n\n1. Patreon (signup required / monthly fee)\n\n2. Paypal (single amount)"
 },
 "722648525": {
  "nome": "Dynamic Recon Ops - Tanoa",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/498028597183589836/22C25A8956382571CDFFB29AE5E3F86A0B7B97D3/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Tanoa"
  ],
  "deps": [],
  "resumo": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get…",
  "temTutorial": false,
  "autor": "baby yoda executed by the state",
  "guia": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get playing a new scenario in singleplayer or co-op. With as few changes to the base game as possible, DRO aims to showcase the unique and varied gameplay that Arma 3 has to offer for smaller scale infantry combat.\nAdditionally, DRO has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Menu on startup to select a variety of options including time of day and insertion type\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 30mins - 1hr 30mins duration"
 },
 "722675841": {
  "nome": "Dynamic Recon Ops - Stratis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/498028597183643485/B2BB39F029D51DE9CF84396E96068C51E2CD5393/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Stratis"
  ],
  "deps": [],
  "resumo": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get…",
  "temTutorial": false,
  "autor": "baby yoda executed by the state",
  "guia": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get playing a new scenario in singleplayer or co-op. With as few changes to the base game as possible, DRO aims to showcase the unique and varied gameplay that Arma 3 has to offer for smaller scale infantry combat.\nAdditionally, DRO has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Menu on startup to select a variety of options including time of day and insertion type\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 30mins - 1hr 30mins duration"
 },
 "730310357": {
  "nome": "Advanced Urban Rappelling",
  "cat": "mod",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/273976121084936417/3845856952F5C50CB8BD0119F738552AEE6A9160/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "Created by Duda w/ custom animations by Mcruppert\n\nhttps://forums.bistudio.com/topic/192925-advanced-urban-rappelling/\n\nWant more? Check out my latest mods!\n\nAlso check out my Advanced Rappelling, Advanced Sling Loading  and Advanced Towing addons for more rope features!\n\nFeatures:\n\n - Rappel of anything that's more than 4-5m high. This includes buildings, cliff, towers, etc. Everything works as long a you can walk to an edge.\n - Fire…",
  "temTutorial": true
 },
 "779568775": {
  "nome": "TAC VESTS",
  "cat": "mod",
  "tam": "426 MB",
  "img": "https://images.steamusercontent.com/ugc/1772706191178784375/661BCA9D6CDDF97E6D5E92EBFF0B249E17231AB0/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "Here is my answer to ljyyg mushi\n\nYou said I was jealous?\nThe data you used when you released your mod (some RRV, PACA, leg pouches, etc.) was created by me. So first I asked \"why you build by stolen data?\" and you commented on the mod page. You deleted it, though.\nIf you didn't know, now you know it.\nWhen I look at the your screenshot I can understand that it is my data (TAC VESTS). Because I have spent thousands of hours making it.…",
  "temTutorial": true
 },
 "788666316": {
  "nome": "Dynamic Recon Ops - Chernobyl Zone",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/430484747224276454/17EAD26125051A03BEA0CECD3BAD12F9489723F1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "OtherMap"
  ],
  "deps": [
   "[STOPPED] Chornobyl Zone"
  ],
  "resumo": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get…",
  "temTutorial": false,
  "autor": "baby yoda executed by the state",
  "guia": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get playing a new scenario in singleplayer or co-op. With as few changes to the base game as possible, DRO aims to showcase the unique and varied gameplay that Arma 3 has to offer for smaller scale infantry combat.\nAdditionally, DRO has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Menu on startup to select a variety of options including time of day and insertion type\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 30mins - 1hr 30mins duration"
 },
 "843425103": {
  "nome": "RHSAFRF",
  "cat": "mod",
  "tam": "7.0 GB",
  "img": "https://images.steamusercontent.com/ugc/1807610517241277731/D189FBA795A4B98F0CF4F2B9B6ECBDF314EBD950/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "# RELEASE 0.5.6: RHS: Armed Forces of the Russian Federation\nchangelog available here - http://www.rhsmods.org/mod/1#changelog\n\n# DISCLAIMER & LICENSE\nhttp://www.rhsmods.org/page/EULA\n\n# RE-UPLOADS\nRe-uploads of any RHS content (in part or in full) on Steam Workshop is PROHIBITED\n\n# FREQUENT ASKED QUESTIONS\nhttp://www.rhsmods.org/faq\n\n# DOCUMENTATION & CREDITS\nhttp://www.rhsmods.org/\n\n# FEEDBACK TRACKER\nhttp://feedback.rhsmods.org/\nIf…",
  "temTutorial": true
 },
 "843577117": {
  "nome": "RHSUSAF",
  "cat": "mod",
  "tam": "7.4 GB",
  "img": "https://images.steamusercontent.com/ugc/1807610517241296764/A0FF7B32D163C76BBC6F6FC0B50F235B94F0B08E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Animation",
   "Boat"
  ],
  "deps": [],
  "resumo": "# RELEASE 0.5.6: RHS: United States Armed Forces\nchangelog available here - http://www.rhsmods.org/mod/2#changelog\n\n# DISCLAIMER & LICENSE\nhttp://www.rhsmods.org/page/EULA\n\n# RE-UPLOADS\nRe-uploads of any RHS content (in part or in full) on Steam Workshop is PROHIBITED\n\n# FREQUENT ASKED QUESTIONS\nhttp://www.rhsmods.org/faq\n\n# DOCUMENTATION & CREDITS\nhttp://www.rhsmods.org/\n\n# FEEDBACK TRACKER\nhttp://feedback.rhsmods.org/\nIf you have…",
  "temTutorial": true
 },
 "843593391": {
  "nome": "RHSGREF",
  "cat": "mod",
  "tam": "2.7 GB",
  "img": "https://images.steamusercontent.com/ugc/956340059398363211/ABAB9646B0792402164AA5548214276F95843B70/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Character",
   "Equipment"
  ],
  "deps": [
   "RHSAFRF",
   "RHSUSAF"
  ],
  "resumo": "# RELEASE 0.5.6: RHS: GREen Forces\nchangelog available here - http://www.rhsmods.org/mod/3#changelog\n\n# REQUIREMENTS\nRHS: GREF requires 2 mods to run\n* RHS: AFRF  - https://steamcommunity.com/sharedfiles/filedetails/?id=843425103\n* RHS: USAF - https://steamcommunity.com/sharedfiles/filedetails/?id=843577117\n\n# DISCLAIMER & LICENSE\nhttp://www.rhsmods.org/page/EULA\n\n# RE-UPLOADS\nRe-uploads of any RHS content (in part or in full) on Steam…",
  "temTutorial": true
 },
 "843632231": {
  "nome": "RHSSAF",
  "cat": "mod",
  "tam": "817 MB",
  "img": "https://images.steamusercontent.com/ugc/785235397900427237/904E239D5B6703741BC5C0A91E1D92D498F908EB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Character",
   "Equipment"
  ],
  "deps": [
   "RHSAFRF",
   "RHSUSAF"
  ],
  "resumo": "# RELEASE 0.5.6: RHS: Serbian Armed Forces\nchangelog available here - http://www.rhsmods.org/mod/4#changelog\n\n# REQUIREMENTS\nRHS: SAF requires 2 mods to run\n* RHS: AFRF  - https://steamcommunity.com/sharedfiles/filedetails/?id=843425103\n* RHS: USAF - https://steamcommunity.com/sharedfiles/filedetails/?id=843577117\n\n# DISCLAIMER & LICENSE\nhttp://www.rhsmods.org/page/EULA\n\n# RE-UPLOADS\nRe-uploads of any RHS content (in part or in full)…",
  "temTutorial": true
 },
 "865203162": {
  "nome": "Dynamic Combat Ops - Altis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/171539824340022188/8108ACDE459CBC5A846FC0E840CC64797C1C417A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped…",
  "temTutorial": false,
  "guia": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped enemy force and a larger number of objectives to tackle, selecting and utilising your platoon as a commander may be the key to victory. However, if you prefer to be a cog in the war machine rather than taking a command role, your platoon have support menu options allowing you to call them into battle and let them proceed from sector to sector autonomously.\n\nAs with DRO, DCO is designed to be simple to use but with plenty of options to customise your mission setup. The objective behind DCO is to create a way to quickly get playing a new scenario in singleplayer or co-op and has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Select a platoon to command using the High Command interface\n\n• Menu on startup to select a variety of options including time of day\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 1-2 hour estimated duration"
 },
 "865662937": {
  "nome": "Dynamic Combat Ops - Stratis",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/171537921637245524/DCC378ACBFEBAA2B033A62F9F8A0A022EBD79DD6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped…",
  "temTutorial": false,
  "guia": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped enemy force and a larger number of objectives to tackle, selecting and utilising your platoon as a commander may be the key to victory. However, if you prefer to be a cog in the war machine rather than taking a command role, your platoon have support menu options allowing you to call them into battle and let them proceed from sector to sector autonomously.\n\nAs with DRO, DCO is designed to be simple to use but with plenty of options to customise your mission setup. The objective behind DCO is to create a way to quickly get playing a new scenario in singleplayer or co-op and has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Select a platoon to command using the High Command interface\n\n• Menu on startup to select a variety of options including time of day\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 1-2 hour estimated duration"
 },
 "865663571": {
  "nome": "Dynamic Combat Ops - Tanoa",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/171537921637250812/25E459F977CBE5E1C4AB5616AAD470295D652F5C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped…",
  "temTutorial": false,
  "guia": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped enemy force and a larger number of objectives to tackle, selecting and utilising your platoon as a commander may be the key to victory. However, if you prefer to be a cog in the war machine rather than taking a command role, your platoon have support menu options allowing you to call them into battle and let them proceed from sector to sector autonomously.\n\nAs with DRO, DCO is designed to be simple to use but with plenty of options to customise your mission setup. The objective behind DCO is to create a way to quickly get playing a new scenario in singleplayer or co-op and has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Select a platoon to command using the High Command interface\n\n• Menu on startup to select a variety of options including time of day\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 1-2 hour estimated duration"
 },
 "878714108": {
  "nome": "KP Liberation Altis",
  "cat": "cenario",
  "tam": "4 MB",
  "img": "https://images.steamusercontent.com/ugc/159154817306391131/F8EE7007CA19F9AF364077A63048ED3451F03356/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Coop",
   "Persistent",
   "Altis"
  ],
  "deps": [],
  "resumo": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a…",
  "temTutorial": false,
  "guia": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a massive “Capture the Island” campaign involving a large range of different settlements across the entire area.\n- Cooperate with up to 34 players, including a Commanding role, two fire-team squads, a medevac and a logistical support squad as well as AI recruits to fill the gaps.\n- Purchase both infantry and vehicles (both ground and air) using three different types of physical resources; supplies, ammunition and fuel.\n- Build the FOB of your dreams with an in-game \"what you see is what you get\" system.\n- Play within an immersive engine that not only punishes you for civilian casualty but diversely reacts in turn.\n- Combat aggressive and cunning hostile forces who react and adapt to your actions.\n- Monitor and work alongside, or against, independent guerrilla forces.\n- Learn that every window is a threat thanks to the custom urban combat AI.\n- Accomplish meaningful secondary objectives that will benefit your progression.\n- Never lose your progress with the built-in server-side save system.\n\n-- Predefined Factions (can be changed easily in the config) --\nBlufor (0): NATO\nOpfor (0): CSAT\nResistance (0): FIA\n\n-- Statistics --\nCapitals: 10\nCities: 68\nMilitary: 26\nFactories: 24\nRadiotower: 22\nTotal Sectors: 147\n\nOfficial BI Forum Thread\n\nTo have a look at the code, participate with pulls or if you want to report issues, you can visit the\nGitHub Page\n\nYou have questions, suggestions or need help? Click on the link below to talk to people who work with or on the mission:\nKP Liberation Discord\n\nIf you like the work and think it's worth a small dona"
 },
 "884703460": {
  "nome": "KP Liberation Tanoa",
  "cat": "cenario",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/159155650896140317/F8EE7007CA19F9AF364077A63048ED3451F03356/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Coop",
   "Persistent",
   "Tanoa",
   "Apex"
  ],
  "deps": [],
  "resumo": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a…",
  "temTutorial": false,
  "guia": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a massive “Capture the Island” campaign involving a large range of different settlements across the entire area.\n- Cooperate with up to 34 players, including a Commanding role, two fire-team squads, a medevac and a logistical support squad as well as AI recruits to fill the gaps.\n- Purchase both infantry and vehicles (both ground and air) using three different types of physical resources; supplies, ammunition and fuel.\n- Build the FOB of your dreams with an in-game \"what you see is what you get\" system.\n- Play within an immersive engine that not only punishes you for civilian casualty but diversely reacts in turn.\n- Combat aggressive and cunning hostile forces who react and adapt to your actions.\n- Monitor and work alongside, or against, independent guerrilla forces.\n- Learn that every window is a threat thanks to the custom urban combat AI.\n- Accomplish meaningful secondary objectives that will benefit your progression.\n- Never lose your progress with the built-in server-side save system.\n\n-- Predefined Factions (can be changed easily in the config) --\nBlufor (1): NATO\nOpfor (1): CSAT\nResistance (1): Tanoa Syndicate\n\n-- Statistics --\nCapitals: 7\nCities: 65\nMilitary: 22\nFactories: 34\nRadiotower: 30\nTotal Sectors: 158\n\nOfficial BI Forum Thread\n\nTo have a look at the code, participate with pulls or if you want to report issues, you can visit the\nGitHub Page\n\nYou have questions, suggestions or need help? Click on the link below to talk to people who work with or on the mission:\nKP Liberation Discord\n\nIf you like the work and think it's worth a"
 },
 "917511991": {
  "nome": "AW Invade & Annex",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/799796907298726574/1AA009AE0F41F3C38B5CFA8F90DDF1FAA5BD8EE6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Coop",
   "Persistent",
   "Stratis"
  ],
  "deps": [],
  "resumo": "The Original Ahoy World Invade and Annex created for Arma 3 in Alpha! (Optimized for peak performance 64-bit)\n\nI changed the AI within this mission for a more dynamic and immersive gameplay. They will route, utilize weaponry, and even flank if you stay too long in one position! The more recent Ahoy missions, in my opinion, have been oversaturated with users attempting to make their own versions. Yet at the very core of the original,…",
  "temTutorial": false,
  "guia": "The Original Ahoy World Invade and Annex created for Arma 3 in Alpha! (Optimized for peak performance 64-bit)\n\nI changed the AI within this mission for a more dynamic and immersive gameplay. They will route, utilize weaponry, and even flank if you stay too long in one position! The more recent Ahoy missions, in my opinion, have been oversaturated with users attempting to make their own versions. Yet at the very core of the original, there is much fun to be had because this is the state that it was meant to be played.\n\nPlease Rate and leave feedback based on your experience!"
 },
 "953118282": {
  "nome": "Dynamic Combat Ops - Malden 2035",
  "cat": "cenario",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/861726596736332428/6D9FDA7471A25C0ABA472419271D954274837CA6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped…",
  "temTutorial": false,
  "guia": "Dynamic Combat Ops is a randomised, replayable scenario that focuses on combined arms operations.\nSelect your AO location, the factions you want to use and your platoon makeup or leave them all randomised and see what mission you are sent on.\n\nThe sister mission to Dynamic Recon Ops, DCO is intended to take the design philosophy behind that mission and expand it to cover the full range of combined arms scenarios. With a better equipped enemy force and a larger number of objectives to tackle, selecting and utilising your platoon as a commander may be the key to victory. However, if you prefer to be a cog in the war machine rather than taking a command role, your platoon have support menu options allowing you to call them into battle and let them proceed from sector to sector autonomously.\n\nAs with DRO, DCO is designed to be simple to use but with plenty of options to customise your mission setup. The objective behind DCO is to create a way to quickly get playing a new scenario in singleplayer or co-op and has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Select a platoon to command using the High Command interface\n\n• Menu on startup to select a variety of options including time of day\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 1-2 hour estimated duration"
 },
 "1162098941": {
  "nome": "justBuild",
  "cat": "mod",
  "tam": "453 KB",
  "img": "https://images.steamusercontent.com/ugc/2003576831915406093/E5CF5061CB1D2A49545EC94F8A7C213310CC3911/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics",
   "Structure"
  ],
  "deps": [],
  "resumo": "This mod gives you the ability to place static objects in any mission\n\n**Added Antistasi integration - currently objects will be saved with persitent save feature.**\n\nRequires ACE menu to function.\nAddon Requirement removed to facilitate different versions of ACE. ie ACE no Medical\n\nRHSUSAF and RHSAFRF    are needed for some objects\n\nList of Current Objects:\n\nFOB , Repair Station , Hesco barriers , Sandbags\nAmmobox with Arsenal ,…",
  "temTutorial": true
 },
 "1200127537": {
  "nome": "BWMod",
  "cat": "mod",
  "tam": "4.5 GB",
  "img": "https://images.steamusercontent.com/ugc/877503398819490565/658B639E14970D82CC68003729670FD9F62E2564/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Animation",
   "Character"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Version 2.6\n\nIntroduction\n\nThe Bundeswehr - Modifikation is a community of interest for the computer game series Armed Assault, whose goal is to make material of the Bundeswehr accessible in Arma 3.\nThe main focus is on vehicles, weapons and equipment that were or will be acquired by the Bundeswehr in a period of 2005-2020, such as the IdZ system or the SPz Puma.\n\nDownload\n\nYou can download older versions of the mod here:…",
  "temTutorial": true
 },
 "1270920304": {
  "nome": "TRGM2 - Tanoa",
  "cat": "cenario",
  "tam": "7 MB",
  "img": "https://images.steamusercontent.com/ugc/927047100813835408/B0251207BD4C42FAE069B6CEB728B4C73E1E291C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Tanoa"
  ],
  "deps": [],
  "resumo": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late…",
  "temTutorial": false,
  "autor": "treendy",
  "dlcs": [
   "Arma 3 Apex"
  ],
  "guia": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late 2015, and still adding new features!!  the list below is most of what to expect, however, more is being added often, so dont get too comfortable!  I aim to make it feel like the enemy have a human command, and the details to look like they have been placed by hand!\n\n•  Enemy vehicles, patrols, locations, weather, time of day will change on each playthrough\n\n•  Enemy equipment will vary (NVG, AA, AT, Snipers), chance of enemy calling in air support or reinforcements\n\n•  Varied vehicle threats (enemy will have heavier vehicles if you activate this in params)\n\n•  Random chance of a side mission: Take down comms to lower chance of enemy air support.  Gather intel from enemy base of objective location\n\n•  Enemy patrols are not in a random order, they will be paroling around the AO, or from building to building\n\n•  AI enhanced.  If you get spotted, they will send a nearby patrol to investigate, or call in a near by vehicle\n\n•  Friendly transport chopper to fly you in and extract when completed (but there is a chopper and car you can control should you wish)\n\n•  Hardcore NVG script added\n\n•  Random events you can encounter (checkpoints, stranded civs, downed convoy etc...)\n\n•  Campaign Mode!\n\n•  All version are updated and maintained!\n\n=================================================\nJoin my Discord for updates or media of things to come, play throughs etc...\nhttps://discord.gg/qYrjgJs\nWant to join Tactical Cannon Fodder? mention in my discord...\nWarning, we are a hardcore one life group!\n=================================================\n\nTha"
 },
 "1299068883": {
  "nome": "GEARSOC - Deluxe Edition",
  "cat": "mod",
  "tam": "666 MB",
  "img": "https://images.steamusercontent.com/ugc/1745727360957139321/06993B90317A443421D692388F5187DB8AB2B307/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "For years the community enjoyed the GEARSOC, a pioneer, a unique and innovative mod, the first to bring realistic cryes and oakley gloves nicely worked, now a new beginning, a new opportunity. GEARSOC is back to the community.\n\nWhat is the GEARSOC Deluxe Edition?\n\nThis project will bring the GEARSOC back to the ArmA 3 Public Community, including almost all uniforms from tier 1 units which were present in GEARSOC v2. The Deluxe Edition…",
  "temTutorial": true
 },
 "1376822401": {
  "nome": "RIS - Stratis",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1778352699176123893/3F3D22CFBE85A9D90867EEE2BBEE8E1B0FA1A02B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles",
   "Air"
  ],
  "deps": [],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "1376841377": {
  "nome": "RIS - Malden 2035",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1778352699176122558/DEFA5D120F43FF602277F5193B3C76F98ADAFB12/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "1376867375": {
  "nome": "ACE Interaction Menu Expansion",
  "cat": "mod",
  "tam": "278 KB",
  "img": "https://images.steamusercontent.com/ugc/947329065476237034/7FA75F595B8FACD56A93DE6C2B2E1D4F7E580437/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Important\n\nACE (official or custom versions that includes ace interact menu) is required.\n\n==========================================================\n\nIf you play with ACE mod you've probably felt the annoyance more or less when the ACE interaction menu and vanilla ArmA action menu get in the way of each other - having to remember when to use which ruins the fun...\nOr maybe you've become sworn enemy of the vanilla menu because that one…",
  "temTutorial": true
 },
 "1547016606": {
  "nome": "Advanced Breaching",
  "cat": "mod",
  "tam": "34 KB",
  "img": "https://images.steamusercontent.com/ugc/957475029108813132/F878C66A82C7903FC5BB751BB867BC823442726C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Tracked",
   "Animation",
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Advanced Breaching\n\nAdvanced Breaching allows to open closed doors with demolition charges or with a shotgun.\n\nIt is easy to use, you just have to add a module in the editor and select the weapon or demolition charge to use.\n\nIf you're not sure what kind of weapon or magazine you're using:\nIn the editor, hit ESC, and in the \"Watch\" section of the command console, write:\n\nprimaryWeapon player;\n to see the weapon.\n\nprimaryWeaponMagazine…",
  "temTutorial": true
 },
 "1547762495": {
  "nome": "Advanced Underbarrel",
  "cat": "mod",
  "tam": "7 KB",
  "img": "https://images.steamusercontent.com/ugc/957475029108812078/4680F8B405B3D569E4536A70F567EB9FF60D99BB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Tracked",
   "Animation",
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Advanced Underbarrel\n\nAdvanced Underbarrel allows you to modify the ammunition fired by the grenade launcher of a weapon, replacing it with shotgun shells, flash grenades, or whatever else you can think of.\n\nIt is easy to use, you just have to add a module in the editor and assign the weapon you want to replace and the new ammunition.\n\nIf you're not sure what kind of weapon or magazine you're using:\nIn the editor, hit ESC, and in the…",
  "temTutorial": true
 },
 "1559969481": {
  "nome": "RIS - Altis",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1778352699176121163/10B2D5D9083C6A731F0CFC093D5D803B848C9AB4/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles",
   "Air"
  ],
  "deps": [],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "1569116504": {
  "nome": "Advanced Zipline",
  "cat": "mod",
  "tam": "138 KB",
  "img": "https://images.steamusercontent.com/ugc/957475188820799373/104B3D7552DC3320A8B82336F26E112046333310/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Tracked",
   "Animation",
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Advanced Zipline\n\n- Content & Features\nAdvanced Zipline adds a new round of grenade launcher that allows you to deploy an harpon with a rope.\nOnce the harpon hits somewhere, it allows several players to slide down the rope and overrun valleys, buildings, or any other obstacle!\n\n- Installation & Steam Workshop\nSubscribe to the mods of your choice and they will be kept up to date by the Steam Worshop updater.\n\n- Requirements\n\nAdvanced…",
  "temTutorial": true
 },
 "1590156730": {
  "nome": "Arma Commander",
  "cat": "campanha",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/1782841130634687765/B24508A69EEE6D1D03864989EEE863B2E6E5267D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles",
   "Multiplayer"
  ],
  "deps": [],
  "resumo": "Arma Commander is large scale strategy game mode, in which player controls Army Battalion, and captures bases on the island. Player can control his troops from the map, or assume their direct control on the battlefield. Mode can be played in Single Player or Coop against AI Battalion, or in Team vs. Team setup.\n\nHow to Play\n\n- Launch Arma with the Mod\n- Go to Multiplayer -> Server Browser -> Host Server\n- Select one of the missions…",
  "temTutorial": false,
  "autor": "FrankForsyth",
  "guia": "Arma Commander is large scale strategy game mode, in which player controls Army Battalion, and captures bases on the island. Player can control his troops from the map, or assume their direct control on the battlefield. Mode can be played in Single Player or Coop against AI Battalion, or in Team vs. Team setup.\n\nHow to Play\n\n- Launch Arma with the Mod\n- Go to Multiplayer -> Server Browser -> Host Server\n- Select one of the missions called Arma Commander (currently available on Malden only)\n- (You can go to Params in lobby to change settings of the mission, select battalions fighting the battle, etc.)\n\nGame Rules\n\n- Request troops of your selection on the battlefield\n- Attack enemy and empty bases on the map\n- Each captured base will generate some income to buy reinforcements\n- Battalion that owns more bases when time runs out is victorious\n\nGame Mechanics\n\nRequesting units\nRequest new groups by pressing REQUISITION button on map screen.\nYou have to place landing zone and then order new groups.\nNew groups are bought for requisition points. There is limit on how many groups of one type you can request, and there is also limit on simultaneously deployed groups.\n\nTaking Control of Groups\nYou can assume direct control of your groups by clicking on 'Switch' button. You will switch into the leader of selected group (if it's not taken by another player), and fight on the batlefield yourself.\nOnly exception are artillery units, which has to be commanded remotely.\n\nResupplying\nEvery group can take losses, run out of ammunition or just lost its transport. For this there is resupply button on group tabs, which will refill the group into its original status. Ammmunition is refilled automatically and reinforcements are dropped on parachute.\nResupply is available when you have enough Requisition points and group is far enough from the fighting.\n\nCapturing Bases\nCapturing bases takes some time, so side of the opponent can react on the attack and try to deflect it. Capturing is indi"
 },
 "1638341685": {
  "nome": "DUI - Squad Radar",
  "cat": "mod",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/12254485454457071819/6AED9793B9A3F91939E2C7A740D747062C38D715/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "A UI showing unit positions and names of units in your squad\n\nSummary\n\nThis clientside mod shows a compass in the bottom middle of you screen and a list of people in your current squad. It is made with SQF commands which recently have been added to Arma3 and were not available back in the days of Arma2 or early Arma3. Meaning no weird workarounds with map elements are needed anymore which just eat more frames.\nA strong point of this UI…",
  "temTutorial": true
 },
 "1664588656": {
  "nome": "Advanced Spotting Scope (Script)",
  "cat": "cenario",
  "tam": "1 KB",
  "img": "https://images.steamusercontent.com/ugc/966490065573669509/B4B534E668FA5669FEB9CEA0184EC2AC5C4BEE2D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Advanced Spotting Scope (Script)\n\nUse the ACE 3 Spotting Scope as rangefinder, showing the distance, azimuth, inclination and coordinates of the specific point that is being observed.\n\nAlthough they are data that can be obtained with the Vector and the MicroDAGR, the Scope allows you to zoom in a lot or use night vision or thermal glasses.\n\nThe script is made to put it as is in the initPlayerLocal.sqf of the mission\n\nDisclaimer and…",
  "temTutorial": false,
  "guia": "Advanced Spotting Scope (Script)\n\nUse the ACE 3 Spotting Scope as rangefinder, showing the distance, azimuth, inclination and coordinates of the specific point that is being observed.\n\nAlthough they are data that can be obtained with the Vector and the MicroDAGR, the Scope allows you to zoom in a lot or use night vision or thermal glasses.\n\nThe script is made to put it as is in the initPlayerLocal.sqf of the mission\n\nDisclaimer and License\n\nAll the computer programs and software are provided \"as is\" without warranty of any kind. We make no warranties, express or implied, that they are free of error, or are consistent with any particular standard of merchantability, or that they will meet your requirements for any particular application. They should not be relied on for solving a problem whose incorrect solution could result in injury to a person or loss of property. If you do use them in such a manner, it is at your own risk. The author and publisher disclaim all liability for direct, indirect, or consequential damages resulting from your use of the programs.\n\nBy downloading and using this mod, you hereby agree to the following license agreement.\n\nCreative Commons\n\nThe work contained in this distribution is licensed under the Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License. Please note that the above mentioned agreement gives the right to Dash to waiver any of the conditions, thus feel free to contact me to obtain permission to modify my work.\n\nIt is forbidden to distribute the content of this package by itself, or as part of another distribution, using the Steam Workshop by anyone other than Dash.\n\nYou may not use the material for commercial purposes. This includes running this package on server instances that employ any monetization schemes, including, but not limited to, donate-reward systems. Bohemia Interactive's approval of your monitization scheme does not grant you rights to wave this clause of the EULA.\n\nThis add-on is provided for "
 },
 "1667745333": {
  "nome": "Advanced Pickup Rope",
  "cat": "mod",
  "tam": "15 KB",
  "img": "https://images.steamusercontent.com/ugc/1003645170008722309/CB7E0E33E400B73208E8BB02E32C947D42BAAA02/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Tracked",
   "Animation",
   "Character",
   "Equipment"
  ],
  "deps": [
   "Advanced Rappelling"
  ],
  "resumo": "Advanced Pickup Rope\n\nAdvanced Pickup Rope allows you to request a pickup rope to a helicopter in the air. Once the rope is taken, you can climb up to the helicopter or travel hanging.\n\nIt is easy to use, you just have to load the mod, look at a helicopter in the air and use the \"Request Pickup Rope\" action.\n\nDisclaimer and License\n\nThe MIT License (MIT)\n\nCopyright (c) 2016 Seth Duda & Dash\n\nPermission is hereby granted, free of…",
  "temTutorial": true
 },
 "1686321576": {
  "nome": "Project - Future Vertical Lift",
  "cat": "mod",
  "tam": "115 MB",
  "img": "https://images.steamusercontent.com/ugc/1763698086845418455/CA90D2521A4903BBE8C6BD2BFAD2FC91ADBDD17D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Plane"
  ],
  "deps": [],
  "resumo": "ACE3 Compatibility mod available  Here\n\nThe FVL Mod is a tilt-rotor based on the Bell V-280 Valor. For the game we have called the aircraft the UV-85 \"Omaha\". There are five variants in the game.  The UV-85 basic has no weapons, UV-85 with mini-guns, UV-85 with .50 cal Gatlin gun,  MV-85 (Spec Ops) with 2x mini-gun, a 20mm cannon, 14 rockets, 2x Griffin missile (mini-Hellfire), and the AV-85 (attack) that has same as MV-85, but trades…",
  "temTutorial": true
 },
 "1691027866": {
  "nome": "Evannex: AI vs AI - Altis",
  "cat": "cenario",
  "tam": "589 KB",
  "img": "https://images.steamusercontent.com/ugc/998017573087756535/D9ED30F15691925F1B1D4FD9C48772AA80D24FB4/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Summary:\n\nArma 3 - AI vs AI Gamemode.\n\nZones are randomly generated around the map you need to capture these zones by completing objectives and killing the AI within the zone. It's endless, zones keep spawning when you complete them! This game mode does not require any player input. AI will command themselves, leaving players to do as they wish without having to micro manage the AI. Essentially chaos unfolds between the AI. All units…",
  "temTutorial": false,
  "guia": "Summary:\n\nArma 3 - AI vs AI Gamemode.\n\nZones are randomly generated around the map you need to capture these zones by completing objectives and killing the AI within the zone. It's endless, zones keep spawning when you complete them! This game mode does not require any player input. AI will command themselves, leaving players to do as they wish without having to micro manage the AI. Essentially chaos unfolds between the AI. All units in the pictures are AI controlled aside from myself.\n\nThis is my first ArmA 3 mod. I also mainly made it for myself. This gamemode is also based off Invade & Annex which is very similar. I did not use their framework because I wanted to learn the SQF language and thought it would be fun to make my own version. Therefore it does not include the same things. You can view the code if you wish. I just wanted a gamemode where I can screw around and do what I want.\n\nThis gamemode is not really finished either.\n\nUsage:\n\nYou'll find the mission file through hosting your own server. This can be done in the MP menu. It currently only adds the mission to Altis. Others maps can easily be added. You can also change the server params to your liking as there's a few.\n\nWhat do I do?:\n\nWhat ever you want... fly a jet, be a gunner in a tank or be a sniper. You can kill your own friendly if you really wanted too.. They do respawn.\n\nDependencies\n\nNone. This mod does not require any other mods.\n\nSupported Mods:\n\nSome things may be missing, that comes down to me not knowing what's the best from other mods.\n RHSUSAF\n RHSAFRF\n RHSSAF\n RHSGREF\n\nCapturing a Zone:\n\nIn-order to capture a zone most enemies need to be dead along with the objectives completed. The most important objective to complete is destroying the radio tower. Failure to do so will mean more enemy reinforcements will keep arriving.\n\nFeatures:\n\nCustomizable & dynamic systems (Includes mission parameters)\nMini central intelligences controlling both enemy & friendly AI\nFriendlies can mark enemies on"
 },
 "1737370963": {
  "nome": "KP Liberation Malden",
  "cat": "cenario",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/807744928410966867/F8EE7007CA19F9AF364077A63048ED3451F03356/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Malden 2035",
   "Malden"
  ],
  "deps": [],
  "resumo": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a…",
  "temTutorial": false,
  "guia": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a massive “Capture the Island” campaign involving a large range of different settlements across the entire area.\n- Cooperate with up to 34 players, including a Commanding role, two fire-team squads, a medevac and a logistical support squad as well as AI recruits to fill the gaps.\n- Purchase both infantry and vehicles (both ground and air) using three different types of physical resources; supplies, ammunition and fuel.\n- Build the FOB of your dreams with an in-game \"what you see is what you get\" system.\n- Play within an immersive engine that not only punishes you for civilian casualty but diversely reacts in turn.\n- Combat aggressive and cunning hostile forces who react and adapt to your actions.\n- Monitor and work alongside, or against, independent guerrilla forces.\n- Learn that every window is a threat thanks to the custom urban combat AI.\n- Accomplish meaningful secondary objectives that will benefit your progression.\n- Never lose your progress with the built-in server-side save system.\n\n-- Predefined Factions (can be changed easily in the config) --\nBlufor (0): NATO\nOpfor (0): CSAT\nResistance (0): FIA\n\n-- Statistics --\nCapitals: 7\nCities: 31\nMilitary: 10\nFactories: 11\nRadiotower: 10\nTotal Sectors: 69\n\nOfficial BI Forum Thread\n\nTo have a look at the code, participate with pulls or if you want to report issues, you can visit the\nGitHub Page\n\nYou have questions, suggestions or need help? Click on the link below to talk to people who work with or on the mission:\nKP Liberation Discord\n\nIf you like the work and think it's worth a small donati"
 },
 "1779063631": {
  "nome": "Zeus Enhanced",
  "cat": "mod",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/1012688337454495071/1B3EFB602ADE48C765E56567B9F02C7F2F0E884F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Editor Extension"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Zeus Enhanced\n\nZeus Enhanced, also known as ZEN, is an Arma 3 mod aimed at improving and expanding the functionality of the Zeus real-time editor.\n\nZeus Enhanced is built with communities who use Zeus as their primary mission making tool in mind by enabling curators with powerful tools to create dynamic scenarios in an efficient manner. For an in-depth breakdown of the features and frameworks please visit the website.\n\nThis mod is…",
  "temTutorial": true
 },
 "1816049282": {
  "nome": "KP Liberation Livonia",
  "cat": "cenario",
  "tam": "4 MB",
  "img": "https://images.steamusercontent.com/ugc/794241183259346017/F8EE7007CA19F9AF364077A63048ED3451F03356/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Coop",
   "Persistent",
   "OtherMap",
   "Livonia"
  ],
  "deps": [],
  "resumo": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a…",
  "temTutorial": false,
  "guia": "Version: 0.96.7a\nChangelog and Wiki\n\nThis mission is only a continued project based on the original, but most likely abandoned, mission from GreuhZbug.\n\nOTHER MAPS:\nSteam Workshop Collection\n\n--- Overview ---\nThe area has fallen to the enemy, and it is up to you to take it back. Embark with your teammates on a persistent campaign that will span several weeks of real time to liberate all the major cities of the area.\n\n- Experience a massive “Capture the Island” campaign involving a large range of different settlements across the entire area.\n- Cooperate with up to 34 players, including a Commanding role, two fire-team squads, a medevac and a logistical support squad as well as AI recruits to fill the gaps.\n- Purchase both infantry and vehicles (both ground and air) using three different types of physical resources; supplies, ammunition and fuel.\n- Build the FOB of your dreams with an in-game \"what you see is what you get\" system.\n- Play within an immersive engine that not only punishes you for civilian casualty but diversely reacts in turn.\n- Combat aggressive and cunning hostile forces who react and adapt to your actions.\n- Monitor and work alongside, or against, independent guerrilla forces.\n- Learn that every window is a threat thanks to the custom urban combat AI.\n- Accomplish meaningful secondary objectives that will benefit your progression.\n- Never lose your progress with the built-in server-side save system.\n\n-- Predefined Factions (can be changed easily in the config) --\nBlufor (27): Livonia Defence Force\nOpfor (1): CSAT\nResistance (0): FIA\n\n-- Statistics --\nCapitals: 6\nCities: 28\nMilitary: 18\nFactories: 23\nRadiotower: 23\nTotal Sectors: 98\n\nOfficial BI Forum Thread\n\nTo have a look at the code, participate with pulls or if you want to report issues, you can visit the\nGitHub Page\n\nYou have questions, suggestions or need help? Click on the link below to talk to people who work with or on the mission:\nKP Liberation Discord\n\nIf you like the work and think it's wo"
 },
 "1818899168": {
  "nome": "Dynamic Recon Ops - Livonia",
  "cat": "cenario",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/797618883357383665/AF6616DB828CE4BAD92B2C5C19F146297A5D3FEE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [],
  "resumo": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get…",
  "temTutorial": false,
  "autor": "baby yoda executed by the state",
  "dlcs": [
   "Arma 3 Contact"
  ],
  "guia": "Dynamic Recon Ops is a randomised, replayable scenario that generates an enemy occupied AO with a selection of tasks to complete within. Select your AO location, the factions you want to use and any supports available or leave them all randomised and see what mission you are sent on.\n\nDesigned to be simple to use but with plenty of options to customise your mission setup, the objective behind DRO is to create a way to quickly get playing a new scenario in singleplayer or co-op. With as few changes to the base game as possible, DRO aims to showcase the unique and varied gameplay that Arma 3 has to offer for smaller scale infantry combat.\nAdditionally, DRO has been designed from the ground up to take advantage of faction mods. If you have any mods that create new factions they will be selectable as player or enemy sides within the mission. However, the scenario itself requires no mods apart from specific terrains if you want to use them.\n\nFeatures\n\n• Playable in SP or COOP\n\n• Dynamic scripting means that no two missions are the same\n\n• Menu on startup to select a variety of options including time of day and insertion type\n\n• Revive system that takes visual cues from BIS revive but is fully AI compatible and works in both MP and SP\n\n• Virtual Arsenal to select starting loadout for both player and AI units\n\n• 'Reset AI' diary entry to unstick AI units\n\n• 30mins - 1hr 30mins duration"
 },
 "1932381514": {
  "nome": "TRGM2 - Altis",
  "cat": "cenario",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/789749906590156050/F2D25C62E39DC6CAF6908FF1717B68E8354DECD6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Altis"
  ],
  "deps": [],
  "resumo": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late…",
  "temTutorial": false,
  "guia": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late 2015, and still adding new features!!  the list below is most of what to expect, however, more is being added often, so dont get too comfortable!  I aim to make it feel like the enemy have a human command, and the details to look like they have been placed by hand!\n\n•  Enemy vehicles, patrols, locations, weather, time of day will change on each playthrough\n\n•  Enemy equipment will vary (NVG, AA, AT, Snipers), chance of enemy calling in air support or reinforcements\n\n•  Varied vehicle threats (enemy will have heavier vehicles if you activate this in params)\n\n•  Random chance of a side mission: Take down comms to lower chance of enemy air support.  Gather intel from enemy base of objective location\n\n•  Enemy patrols are not in a random order, they will be paroling around the AO, or from building to building\n\n•  AI enhanced.  If you get spotted, they will send a nearby patrol to investigate, or call in a near by vehicle\n\n•  Friendly transport chopper to fly you in and extract when completed (but there is a chopper and car you can control should you wish)\n\n•  Hardcore NVG script added\n\n•  Random events you can encounter (checkpoints, stranded civs, downed convoy etc...)\n\n•  Campaign Mode!\n\n•  All version are updated and maintained!\n\n=================================================\nJoin my Discord for updates or media of things to come, play throughs etc...\nhttps://discord.gg/qYrjgJs\nWant to join Tactical Cannon Fodder? mention in my discord...\nWarning, we are a hardcore one life group!\n=================================================\n\nTha"
 },
 "1981964169": {
  "nome": "CUP Terrains - Maps 2.0",
  "cat": "mod",
  "tam": "822 MB",
  "img": "https://images.steamusercontent.com/ugc/767236446983862447/E6866F24F7AD0E4175AE1488649161A0934D41E9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "CONTENT\n\nThis is the Maps 2.0 pack, the successor of \"CUP Terrains - Maps\". It will contain all upgraded CUP Terrains.\n\nFor credits and other information, see our web page.\n\nThis pack contains:\n\n• Chernarus 2020\n\n• Zargabad 2025\n\nISSUES\n\nTHIS WORKSHOP PAGE IS NOT MONITORED BY THE DEVELOPERS\nPlease report bugs to\n\nhttps://dev.cup-arma3.org/u/Ticket\n\nABOUT US\n\nThe Community Upgrade Project is a cooperative effort to bring the content of…",
  "temTutorial": false,
  "guia": "CONTENT\n\nThis is the Maps 2.0 pack, the successor of \"CUP Terrains - Maps\". It will contain all upgraded CUP Terrains.\n\nFor credits and other information, see our web page.\n\nThis pack contains:\n\n• Chernarus 2020\n\n• Zargabad 2025\n\nISSUES\n\nTHIS WORKSHOP PAGE IS NOT MONITORED BY THE DEVELOPERS\nPlease report bugs to\n\nhttps://dev.cup-arma3.org/u/Ticket\n\nABOUT US\n\nThe Community Upgrade Project is a cooperative effort to bring the content of Bohemia Interactive's earlier games (Arma 2 and Arma 2: Operation Arrowhead and DLC's in particular) into Arma 3, updated to the functionality and standards of the next generation game.\n\nFor more information on the project, check our webpage at\n\nhttp://cup-arma3.org/\n\nor visit us on out discord server at\n\nhttps://dev.cup-arma3.org/u/discord\n\nDONATIONS\n\nHelp us to keep this Mod up and running, The link below will lead you to our donation page.\nThank you!\n\nhttps://www.cup-arma3.org/donations\n\nREDISTRIBUTION\n\nANY REUPLOADS (STANDALONE OR PART OF MODPACKS) TO THE STEAM WORKSHOP (ARMA3 & DAYZ) ARE PROHIBITED AND VIOLATING THE STEAM WORKSHOP EULA SECTION 6D, AS WELL AS THE CUP LICENSE. REUPLOADS WILL BE TAKEN DOWN VIA DMCA NOTICE WITHOUT WARNING!\nhttps://www.cup-arma3.org/cup-license"
 },
 "1984611671": {
  "nome": "TRGM2 - Livonia",
  "cat": "cenario",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/779621670737967541/A3D473A7301B87946CC486C5727A4267EED63275/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Livonia"
  ],
  "deps": [],
  "resumo": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late…",
  "temTutorial": false,
  "guia": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\n\nwww.trgm2.com\n\nEngine:\n\nStarted development in late 2015, and still adding new features!!  the list below is most of what to expect, however, more is being added often, so dont get too comfortable!  I aim to make it feel like the enemy have a human command, and the details to look like they have been placed by hand!\n\n•  Enemy vehicles, patrols, locations, weather, time of day will change on each playthrough\n\n•  Enemy equipment will vary (NVG, AA, AT, Snipers), chance of enemy calling in air support or reinforcements\n\n•  Varied vehicle threats (enemy will have heavier vehicles if you activate this in params)\n\n•  Random chance of a side mission: Take down comms to lower chance of enemy air support.  Gather intel from enemy base of objective location\n\n•  Enemy patrols are not in a random order, they will be paroling around the AO, or from building to building\n\n•  AI enhanced.  If you get spotted, they will send a nearby patrol to investigate, or call in a near by vehicle\n\n•  Friendly transport chopper to fly you in and extract when completed (but there is a chopper and car you can control should you wish)\n\n•  Hardcore NVG script added\n\n•  Random events you can encounter (checkpoints, stranded civs, downed convoy etc...)\n\n•  Campaign Mode!\n\n•  All version are updated and maintained!\n\n=================================================\nJoin my Discord for updates or media of things to come, play throughs etc...\nhttps://discord.gg/qYrjgJs\nWant to join Tactical Cannon Fodder? mention in my discord...\nWarning, we are a hardcore one life group!\n=================================================\n\nTha"
 },
 "1990653162": {
  "nome": "Drongos Map Population",
  "cat": "mod",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/1751309476711946285/BB4A54189CC4CD3DBA2052507F425CEB60C29A1E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "Quickly and easily populate an entire map with any faction, no scripting required\n\nCheck my profile for a link to my Discord.\n\nDiscord for my mods\nMy Artillery/Cruise Missile/Loitering Munition mod\nMy Air Support mod\nMy Active Protection System mod\n\n•  Quickly and easily populate an entire map with any faction, no scripting required\n\n•  Spawns patrols, garrisons, vehicles, air units, ships, occupied towns, HVTs, civilians, IEDs,…",
  "temTutorial": false,
  "autor": "Drongo",
  "guia": "Quickly and easily populate an entire map with any faction, no scripting required\n\nCheck my profile for a link to my Discord.\n\nDiscord for my mods\nMy Artillery/Cruise Missile/Loitering Munition mod\nMy Air Support mod\nMy Active Protection System mod\n\n•  Quickly and easily populate an entire map with any faction, no scripting required\n\n•  Spawns patrols, garrisons, vehicles, air units, ships, occupied towns, HVTs, civilians, IEDs, VBIEDs, suicide bombers, SAM sites, abandoned vehicles and loot\n\n•  Mission generator (Kill, Recon, Destroy Squad, Destroy Vehicles, Clear, SEAD, Rescue, Interdict, Destroy Structure, Destroy Ships, Destroy Aircraft, Deliver)\n\n•  Semi-persistent dynamic campaign (insurgency/COIN theme)\n\n•  Semi-persistent dynamic campaign (frontline combat theme)\n\n•  Place and play mission modules (go here, kill this, demo this building, defend here, clear this area, extract, rescue, hack, interact)\n\n•  HVT hunt open-world mission\n\n•  Optional stealth gameplay\n\n•  Tweak most settings through modules\n\n•  Any mod, any map\n\n•  Easy setup\n\n•  WIP RPG system with XP, levels, skills and survival aspects (food, weather, exposure, poison, infection, etc)\n\n•  Optional modules for skill, knockdown, random time/weather, traders and more\n\n•  Civilian/POW interaction\n\n•  Morale system with surrender and panic\n\nOptional missions: Kill HVT, Clear Area, Recon, Destroy Squad, Destroy Vehicle, SEAD\n\nThere is a demo mission and readme in the mod folder. If you can't find your steam mod folders, you can download the .zip file from my Patreon: Direct download\n\nDemo missions\n\nVarious missions built with DMP:\nInsurgent Ops I\nInsurgent Ops II\nInsurgent Ops III\nGround Ops Altis\nAir Ops\n\nAlternative dynamic simulation\n\nHow to edit internal variables\n\nBASIC USE\n\n•  Place a DMP Core module at the center of your desired AO\n\n•  Select the desired AO size (values larger than the map will not go out of map bounds)\n\n•  Place a Define Faction module\n\n•  Adjust the composition options\n\n•  Pla"
 },
 "2008673542": {
  "nome": "[SP/CO12] The Forgotten Few 2 (NT/AL)",
  "cat": "cenario",
  "tam": "24 MB",
  "img": "https://images.steamusercontent.com/ugc/780749967728550389/BA2A7B1C6F0D229FD05FED2E81C21320DF607D4A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Altis"
  ],
  "deps": [],
  "resumo": "Dynamic Single-Scenario Campaign / Single Mission for SP and MP\n\nThe Forgotten Few 2 is the Arma 3 successor to the dynamic mission originally created for Arma 2. Command a small special task group and plan your mission execution. Finish randomly generated missions on an evolving battle map divided into territories. Dynamic civilian life and enemy activity spanning across the entire map. Choose a grand campaign or finish a single…",
  "temTutorial": false,
  "autor": "KingN",
  "guia": "Dynamic Single-Scenario Campaign / Single Mission for SP and MP\n\nThe Forgotten Few 2 is the Arma 3 successor to the dynamic mission originally created for Arma 2. Command a small special task group and plan your mission execution. Finish randomly generated missions on an evolving battle map divided into territories. Dynamic civilian life and enemy activity spanning across the entire map. Choose a grand campaign or finish a single mission of your choice. SP or MP for up to 12 players. Unlimited replayability.\n\nThis Version\n\nThis version is the vanilla version using only stock Arma 3 assets. No Mod requirements.\n\nSide: NATO\nTerrain: Altis\n\nPlayer Factions:\n- NATO: CTRG Group 14\n- ION PMC (Western Sahara dependency)\n- MJTF Combat Divers (Expeditionary Forces dependency)\n- MJTF Force Recon (Expeditionary Forces dependency)\n\nEnemy Factions:\n- AAF Revolutionists\n- CSAT Renegades\n\nOptional/Supported Mods\n\n- ACE3\n- ACRE2\n\nForum\n\nBohemia Interactive Forums"
 },
 "2010222986": {
  "nome": "GGE: Core",
  "cat": "mod",
  "tam": "51 KB",
  "img": "https://images.steamusercontent.com/ugc/788631542385297111/4DB5CE06D6440A6FDCDE63DF3FF8486FC9931522/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Contains common functions and assets utilised by Goobin's Gameplay Enhancement mods.\n\nI will try to fix issues and add new GGE mods when I have time.\n\nThanks to Iceman, SpartanSix and Valentine there is now a Discord for GGE mods!\n\nCheck it out:  https://discord.gg/xTsDvXY",
  "temTutorial": true
 },
 "2010226699": {
  "nome": "GGE: Weapon Canting",
  "cat": "mod",
  "tam": "65 KB",
  "img": "https://images.steamusercontent.com/ugc/1023947217957906327/F014B6AAABB4231BF612B277896305F9537EB7E5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Character",
   "Mechanics"
  ],
  "deps": [
   "GGE: Core"
  ],
  "resumo": "Adds the ability to fire primary weapons canted.\n\nWhile aiming, press the keybind (default key: \"C\") to switch between canted and non canted aiming modes.\n\nCheck the \"Configure Addons\" menu to change settings and the \"Configure Addon Controls\" menu to change the keybind.\n\nNOTE: If you use toggle to aim (\"Optics\" is bound to right mouse buttton and \"Optics Temporary\" is not) make sure you select the \"Toggle ADS\" option in the \"Configure…",
  "temTutorial": true
 },
 "2044374502": {
  "nome": "USP Gear - Core",
  "cat": "mod",
  "tam": "101 MB",
  "img": "https://images.steamusercontent.com/ugc/1865069180910820562/A8D7B9B4D6CA0DC0D30A7BA0C11E7B574BB3C279/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Version: 0.8.8\n\nUSP Gear Core contains files that are essential to other USP Gear & Uniforms modules. Additionally, numerous flag/ID/morale/etc patches are included which can be used with many of the other USP packs which feature flag patch selections.This is a standalone module and does not need to be used alongside the all-in-one pack; USP Gear & Uniforms AIO. Always be sure to check the versions between modules, as the standalone…",
  "temTutorial": true
 },
 "2057294714": {
  "nome": "ETS - Enemy Tagging System",
  "cat": "mod",
  "tam": "81 KB",
  "img": "https://images.steamusercontent.com/ugc/1004808899015316084/97BCA90C534D2B3FF96F932EA1518641B0CFF367/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Summary\n\nConcept was inspired by Ghost Recon : Wildlands.\nThis mod is useful for communications in a squad, and identifying targets.\nIdeally best suited for Co-op, but it can be used in PVP or Singleplayer to help you keep track of enemy targets, or at least make them more apparent if they blend in.\n\nFeatures\n\n- Tag enemies by Aiming at them or holding your 'Lock Target' key.\n- Option to choose between Side or Group for Tag visibility.…",
  "temTutorial": true
 },
 "2058008726": {
  "nome": "TRGM2 - Bystrica",
  "cat": "cenario",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/1007060051797596597/B29A5E553B7E46AF2CCCE4DDE15BA892F8F62F14/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\nwww.trgm2.com\n\nHelp for Heroes…",
  "temTutorial": false,
  "guia": "TRGM2 is a fully randomised mission, no need for mission setup, just press play and go (If you want to customise your settings, there is an easy menu at start where you can adjust mission types and advanced settings)\n\nYou start the mission at the same base or a camp near the AO, from here you plan how to arrive at the AO, do you drive? fly? or get flown in by the AI transport team.\nwww.trgm2.com\n\nHelp for Heroes\n\nhttps://www.helpforheroes.org.uk/\nI have a lot of fun playing and building Arma missions, but do this from the comfort of my home with the only worry of pis**ng my wife off by being too loud or playing too long, which is nothing compared to the s#!t the real guys go through and have to live with after! I knew a very genuine guy, always seemed happy, but took his own life while suffering from PTSD.\nI have massive respect for anyone serving! thank you\n Help For Heroes\n\nEngine:\n\nStarted development in late 2015, and still adding new features!!  the list below is most of what to expect, however, more is being added often, so dont get too comfortable!  I aim to make it feel like the enemy have a human command, and the details to look like they have been placed by hand!\n\n•  Enemy vehicles, patrols, locations, weather, time of day will change on each playthrough\n\n•  Enemy equipment will vary (NVG, AA, AT, Snipers), chance of enemy calling in air support or reinforcements\n\n•  Varied vehicle threats (enemy will have heavier vehicles if you activate this in params)\n\n•  Random chance of a side mission: Take down comms to lower chance of enemy air support.  Gather intel from enemy base of objective location\n\n•  Enemy patrols are not in a random order, they will be paroling around the AO, or from building to building\n\n•  AI enhanced.  If you get spotted, they will send a nearby patrol to investigate, or call in a near by vehicle\n\n•  Friendly transport chopper to fly you in and extract when completed (but there is a chopper and car you can control should you wish)\n\n•  Ha"
 },
 "2060770170": {
  "nome": "Arsenal Search",
  "cat": "mod",
  "tam": "18 KB",
  "img": "https://images.steamusercontent.com/ugc/1022823184775339035/984AF7C19B23FEBB872D92B7F7E91E7450FE6B16/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Client-side search MOD for Arsenal.\n\nUsage: Press Ctrl+F to open the interface, then put any words to search.\nBonus: You can sort items by stats (such as ROF, accuracy and weight).\n\nTip: Put “class ” prefix to the search words make a search for classNames.\n\nAPL-SA.",
  "temTutorial": true
 },
 "2127190744": {
  "nome": "Moe Pilot Gear Suite",
  "cat": "mod",
  "tam": "626 MB",
  "img": "https://images.steamusercontent.com/ugc/1662358684751238516/419503C220EA6F507B03B8C93961B14F9BFC30D3/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Character",
   "Equipment",
   "Mechanics",
   "Plane"
  ],
  "deps": [],
  "resumo": "Moe Pilot Gear Suite\n\nThis mod is no longer being updated. Thank you for the kind comments and for enjoying my work! If you wish to pick up the baton and continue development or even port this to Arma Reforger, there is no need to ask me for permission! You can download the unbinarized files (and even some WIP stuff I never finished) from the link below:…",
  "temTutorial": true
 },
 "2147841185": {
  "nome": "Project - FVL Ace3 Compatibility",
  "cat": "mod",
  "tam": "6 KB",
  "img": "https://images.steamusercontent.com/ugc/1298675216378653975/6A99D7EC574DC780570C9F825B20C8C0CD201318/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter"
  ],
  "deps": [
   "Project - Future Vertical Lift",
   "ace"
  ],
  "resumo": "ACE compatibility for the  Project - Future Vertical Lift mod.\n\nFeatures:\n\n•  Support for ACE Fastroping\n\n•  More to come…",
  "temTutorial": true
 },
 "2162811561": {
  "nome": "FileXT",
  "cat": "mod",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1835783750446762654/3502FDE84864FC619935B53BD06C13BE0BE8BEA8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Server",
   "Content Review",
   "x64"
  ],
  "deps": [],
  "resumo": "This is an Arma extension which lets you store and read data in files from SQF.\n\nImportant: at 22 Jan. 2022 Linux support was added, thanks to user https://github.com/xoorath\n\nMore information at:\nSetup guide\nGitHub page",
  "temTutorial": true
 },
 "2185874952": {
  "nome": "Vindicta (Alpha)",
  "cat": "mod",
  "tam": "26 MB",
  "img": "https://images.steamusercontent.com/ugc/1466437268076639171/998FD746650F223245B2C463A90D94284E33FCBA/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [
   "ace",
   "CBA_A3",
   "FileXT"
  ],
  "resumo": "Vindicta is a dynamic cooperative guerrilla warfare scenario where your goal is to free territory from enemy occupation.\n\nNOTE ABOUT COMMENTS\n\nPlease follow to our Discord server if you want to provide feedback.\nThis comment section is not checked as often!\n\nMAIN FEATURES\n\nThe following review by HazBo sums up most of the features of Vindicta:\n\n•  Dynamic game world. At game start everything is relatively peaceful and not all outposts…",
  "temTutorial": true
 },
 "2237337619": {
  "nome": "Field Headquarters (NATO)",
  "cat": "composicao",
  "tam": "8 KB",
  "img": "https://images.steamusercontent.com/ugc/1540751497603367512/93C161A4693FD135DAE6E782EADA4BE0FE8FE8A8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Communications",
   "Facility"
  ],
  "deps": [],
  "resumo": "This field tent functions as a mobile field headquarters, using quickly deployable and rugged electronic equipment. This allows it to both remain mobile, and maintain a line of communication to both higher ups, and fellow units in the field.",
  "temTutorial": false
 },
 "2260572637": {
  "nome": "BettIR NVG",
  "cat": "mod",
  "tam": "28 KB",
  "img": "https://images.steamusercontent.com/ugc/1649965854349059837/30291B2D8E6F95EB50CF124E30C16E57D6B42FBD/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "BettIR Nightvision module\n\nIf you noticed a change in the mod title and description, it's because BettIR will soon be updated right here; it was previously called \"Legacy\" because I was going to upload a new version separately, but I've decided otherwise.\n\nThe weapon attachments module will be moved to a separate mod soon however, so that people don't have to use my solution and pick anything else they prefer (i.e. ITN)\n\nThis is still…",
  "temTutorial": true
 },
 "2264167015": {
  "nome": "Small Drone Command  Position By Flex7103",
  "cat": "composicao",
  "tam": "4 KB",
  "img": "https://images.steamusercontent.com/ugc/1671358355330839637/4E2C46B3E74FB93CA45936BCA1C355FFB97AF8C1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics"
  ],
  "deps": [],
  "resumo": "A small drone command position .\nMod used in the screenshoot \"Italian Armed Forces By DVK\" - \"Eden Objects\"",
  "temTutorial": false
 },
 "2267029016": {
  "nome": "CyberOps Container HQ",
  "cat": "composicao",
  "tam": "107 KB",
  "img": "https://images.steamusercontent.com/ugc/1679239828208348084/E0D5614EB824070436FAF29A4AC07064A9510BC6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Communications",
   "Facility"
  ],
  "deps": [],
  "resumo": "This is a Cyber Operations Container HQ with a detailed interior.\n\nIf you see objects floating make sure to toggle Vertical Mode and Surface Snapping before placing it.\n\nI'm very interested in your feedback so leave a comment.\n\nNote: all objects have their damage and simulation disabled.",
  "temTutorial": false
 },
 "2268351256": {
  "nome": "Tier One Weapons",
  "cat": "mod",
  "tam": "2.9 GB",
  "img": "https://images.steamusercontent.com/ugc/1675862637185951954/3581125BEDE8269FB7126E5787B81814FD8928D6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "RHSUSAF"
  ],
  "resumo": "Tier 1 Weapons - A mod by Fingolfin\n\nDescription\nThis mod adds several weapons used by US SOCOM units in different setups and color variants. It is based on the RHS framework and should work fine with ACE.\n\nContent\n Weapons:\n  • SIS Sauer MCX Virtus with 11.5 inch barrels in different color variants (5.56mm and .300 Blackout)\n  • SR16s with 11.5 and 14.5inch barrels, URX4 rails, various stocks in different color variants\n  • HK416s…",
  "temTutorial": true
 },
 "2281685552": {
  "nome": "Forward Scan Sonar For Ships",
  "cat": "mod",
  "tam": "198 KB",
  "img": "https://images.steamusercontent.com/ugc/1754683711344356582/51678F2AA20E8AF491DB6895EBC0C706195B3010/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Boat",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Description\n\nThis mod adds a sonar to the game which you can use from any ship. This can be useful if you have ever unintentionally grounded your ship or crashed into underwater objects. Also it can be used for searching for objects at the sea floor.\n\nModes of operation\n\nSector Imaging Mode - scans a 180 degrees sector with a very narrow vertical beam. Signal strength is mapped to display intensity, displayed range is not corrected…",
  "temTutorial": false,
  "guia": "Description\n\nThis mod adds a sonar to the game which you can use from any ship. This can be useful if you have ever unintentionally grounded your ship or crashed into underwater objects. Also it can be used for searching for objects at the sea floor.\n\nModes of operation\n\nSector Imaging Mode - scans a 180 degrees sector with a very narrow vertical beam. Signal strength is mapped to display intensity, displayed range is not corrected (slant range). This is best suited for searching for objects on the sea floor and for making images.\n\nSector Depth Mode - scans a 180 degrees sector with a wider vertical beam. Depth of each point is mapped to display color, displayed range is projected. This mode is more useful for navigation in shallow areas.\n\nBasic Forward Scan Mode - scans area directly ahead of your vessel with a vertical beam. Position of each point is displayed on distance-depth graph, giving you precise information of depth right ahead of your vessel. Although you can see only a small area of the sea floor, this mode has the fastest refresh rate.\n\nNOTE:\n\n* Wherever the depth is displayed in the device, it is not the true depth, but depth below sensor position which is located at the bottom of your vessel.\n* Sector scanning modes might degrade your frame rate. If you are having bad performance, reduce the scan rate.\n\nHow to enable\n\nWhen you are in a ship, use the \"Sonar Options\" action in the action menu.\n\nOptions\n\nMode - sets the mode of sonar.\nRange - sets the maximum range of the sonar.\nMax Depth - sets the depth limit for the display. Only affects basic forward scan and sector depth modes.\nImage Gamma - Allows you to adjust gamma correction of the image. Only affects sector imaging mode.\nScan Rate - Allows you to adjust the scanning rate of the sonar. Only affects sector imaging and sector depth modes.\n\nLinks\n\nGithub: https://github.com/Sparker95/Arma-3-Ship-Sonar\nBI Forum: https://forums.bohemia.net/forums/topic/231509-forward-scan-sonar-for-ships/"
 },
 "2307477087": {
  "nome": "Direct Action - Altis",
  "cat": "cenario",
  "tam": "33 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521871565091/1FC3479B47D58A5760D269FA26274181F0306038/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Water"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2372036642": {
  "nome": "BackpackOnChest - Redux",
  "cat": "mod",
  "tam": "147 KB",
  "img": "https://images.steamusercontent.com/ugc/12566738081789096480/2AB4037C46C7B0F752F2B6A5B2A23C2126BE0CF6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3",
   "ace"
  ],
  "resumo": "BackpackOnChest - Redux\n\nAn official rewrite and continuation of the original BackpackOnChest mod by DerZade. This mod allows you to have a backpack on your chest and on your back at the same time, with movement penalties. Great for parachutes!\n\nImprovements from the original\n\n• Optimizations.\n\n• Support for variables associated with the backpack (for items such as the ACE Gunbag or TFAR backpack radios).\n\n• Transition to an easier…",
  "temTutorial": true
 },
 "2379914629": {
  "nome": "[Prae] Container HQ Armory",
  "cat": "composicao",
  "tam": "375 KB",
  "img": "https://images.steamusercontent.com/ugc/1770446772610081774/166BC8CA75B1027A442C912CDA7E4B9B6576E603/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Camp",
   "Garrison",
   "Shelter",
   "Storage"
  ],
  "deps": [],
  "resumo": "This Building is used as an Armory and Storage unit for smaller Camps, FOBs or Outposts. It has 8 restricted arsenals that only provide weapons, ammo, attachments and a few items such as Rangefinders. It is also equipped with 4 First-Aid stations where you can stock up on First-Aid Kits and Medic-Bags.I used vanilla weapons and attachments only  in the arsenal and for the Gun walls so if you want to expand it with more stuff you need…",
  "temTutorial": false,
  "guia": "This Building is used as an Armory and Storage unit for smaller Camps, FOBs or Outposts. It has 8 restricted arsenals that only provide weapons, ammo, attachments and a few items such as Rangefinders. It is also equipped with 4 First-Aid stations where you can stock up on First-Aid Kits and Medic-Bags.I used vanilla weapons and attachments only  in the arsenal and for the Gun walls so if you want to expand it with more stuff you need to do that yourself.\n\nIf you have suggestions what you would like to see me build just let me know, and maybe I can work something out. \n\nRequirements:\n- Should have none \n\nVisit us on our Homepage: prae-garde.de"
 },
 "2387647757": {
  "nome": "[Prae] Container HQ Briefing Room",
  "cat": "composicao",
  "tam": "228 KB",
  "img": "https://images.steamusercontent.com/ugc/1771573315525880770/CE477B773C134BA90564550CB6AA795644668534/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Contact (Platform)",
   "Base",
   "Camp",
   "Communications",
   "Garrison"
  ],
  "deps": [],
  "resumo": "This Building is use as a conference room and briefing area for smaller Camps, FOBs or Outposts. It build with ACEX Sitting function in mind so i did everything in my power to prevent people from breaking their legs when standing up. It doesn't have any arsenal or storage space but it's possible to add if needed. \n\nIf you have suggestions what you would like to see me build just let me know, and maybe I can work something out.…",
  "temTutorial": false,
  "guia": "This Building is use as a conference room and briefing area for smaller Camps, FOBs or Outposts. It build with ACEX Sitting function in mind so i did everything in my power to prevent people from breaking their legs when standing up. It doesn't have any arsenal or storage space but it's possible to add if needed. \n\nIf you have suggestions what you would like to see me build just let me know, and maybe I can work something out. \n\nRequirements:\n- Contact DLC maybe for some of the objects not sure\n\nIf you don't need that you should be able to leave these requirements out.\n\nVisit us on our Homepage: prae-garde.de"
 },
 "2407225063": {
  "nome": "CTRG ELINT camp (Tropic/Woodland)",
  "cat": "composicao",
  "tam": "12 KB",
  "img": "https://images.steamusercontent.com/ugc/1765945444546314379/81DF53B0241AF293A9AAC429C8E00B380613103C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Apex",
   "Contact (Platform)",
   "Camp",
   "Communications"
  ],
  "deps": [],
  "resumo": "A small CTRG camp, used for Electronic Intelligence, Emissions Intelligence and Cyberwarfare. Easily concealed in any woodland/forested area.\n\nHas a Hunter for transportation and a crate with CTRG weapons (SPAR/DMR).",
  "temTutorial": false
 },
 "2474792559": {
  "nome": "Direct Action - Tanoa",
  "cat": "cenario",
  "tam": "31 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521871622675/0DA88B21AB011F74DEEB6B298CD8C24E185C1477/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Water"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2480263219": {
  "nome": "Enhanced GPS",
  "cat": "mod",
  "tam": "34 KB",
  "img": "https://images.steamusercontent.com/ugc/1815491732015312524/5BD7A4C8BC3A198D3F091B02F97294AA51098EAB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Makes the Arma 3 vanilla GPS readable and suitable for use.\nAdds a High contrast version for helicopters and planes, to see obstacles clearly and dodge them easily.\n\nOn the High contrast version, powerlines are marked in green. Terrain at your altitude level or above is marked in red areas.\n\nTo get an even better visual, it is advised to use it with the mod Enhanced Map :…",
  "temTutorial": true
 },
 "2522638637": {
  "nome": "ACE3 Arsenal Extended - Core",
  "cat": "mod",
  "tam": "19 MB",
  "img": "https://images.steamusercontent.com/ugc/2144334696788750643/E605FB1CAC6C2F988868DFCB6364D5899C83A3CE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics"
  ],
  "deps": [
   "ace",
   "CBA_A3"
  ],
  "resumo": "This mod will group ACE arsenal entries and allow to pick a model using options. It avoid having a lot of combinaisons listed.\n\nIt needs compat mods to work :\n-  USP version\n- AMF version\n\nThis version requires ACE 3.16, and will not work with earlier versions.\n\nContributors / Compat mods\n\nYou can create compat mods and contribute to this project on GitHub.\n\nTo quickly create a compat mod you can use the Config Helper Application :\n-…",
  "temTutorial": true
 },
 "2523439183": {
  "nome": "Armor Plates System",
  "cat": "mod",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/14909848998539557837/9B7A1376B41A3DA964CB4566B13D0EC58060A4A8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics",
   "Sound"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Standalone Arma 3 Alternative Medical System\n\nFeatures\n\n- Many settings to fit your play style\n- Lightweight\n- ACE features support\n- Own revive system (Only when ACE medical is not loaded)\n- UI and QoL additions\n- ACE medical rewrite support\n\nInfo - Standalone mode\n\nThe Armor Plates System (APS) is at its core a stand-alone medical system. It is meant to abstract Arma 3’s vanilla damage and streamline the vanilla medical system. It…",
  "temTutorial": true
 },
 "2550003269": {
  "nome": "Bunker HQ",
  "cat": "composicao",
  "tam": "102 KB",
  "img": "https://images.steamusercontent.com/ugc/1709663201330730389/C022BAECCD14860BDEFFB170C03286ACE69A87A9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "MarksmenDLC",
   "Malden",
   "Contact (Platform)",
   "Base",
   "Fortification"
  ],
  "deps": [],
  "resumo": "This is a fully furnished Bunker HQ. This time, there's not much to tell.\n\n+++ Bohemia DLC only +++ No Creator DLC +++ No mods +++ Furniture +++\n\nSome objects are scaled and might look a bit off when placing the composition in the editor. But after spawning as a player, everything will look as intended.\n\n! ! ! CAUTION ! ! !\n\nMake sure to disable surface snapping and terrain alignment (vertical mode, see last picture) before placing…",
  "temTutorial": false,
  "guia": "This is a fully furnished Bunker HQ. This time, there's not much to tell.\n\n+++ Bohemia DLC only +++ No Creator DLC +++ No mods +++ Furniture +++\n\nSome objects are scaled and might look a bit off when placing the composition in the editor. But after spawning as a player, everything will look as intended.\n\n! ! ! CAUTION ! ! !\n\nMake sure to disable surface snapping and terrain alignment (vertical mode, see last picture) before placing comps!\n\nMaybe you won't need all listed DLC, I didn't really double-check that.\n\nFeel free to use and alter this composition for your missions. Attribution is appreciated but not necessary."
 },
 "2588603554": {
  "nome": "USP Gear - IHPS",
  "cat": "mod",
  "tam": "386 MB",
  "img": "https://images.steamusercontent.com/ugc/2319983877132814434/4F02CC22E3F8DC4DBA0339F4CAF814B63AEBD23B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "Version: 0.8.6\n\nUSP Gear IHPS is a standalone pack containing the Integrated Head Protection System (IHPS). The helmet comes in a variety of colors, patterns, and other variants. More variants will be available with the 'USP_Gear_Head' versions. This module does require USP Gear - Core in order to function properly.\n\nCurrent contents include:\n\n- IHPS\n- IHPS Covered\n- IHPS Comtac3\n- IHPS USA Flag\n- IHPS Mandible\n- IHPS Up-Armor\n- IHPS…",
  "temTutorial": true
 },
 "2595671123": {
  "nome": "Direct Action - Livonia",
  "cat": "cenario",
  "tam": "31 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521875148250/74A67C97AB6CAEF55297585F6DC49E40349DB63B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Multiplayer"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2609065498": {
  "nome": "Military Data Center (Sand)",
  "cat": "composicao",
  "tam": "99 KB",
  "img": "https://images.steamusercontent.com/ugc/2015974654668185705/3E7CCA9D4905413BC622BBD2F8F8966CC8A7F02D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Communications",
   "Storage"
  ],
  "deps": [],
  "resumo": "Military Data Center\n\nA Military Cargo HQ deployed as a Data Center for communications, intelligence gathering, and can operate as a briefing room.\n\nThis HQ contains electronics, TV screens, server units, and more.\n\nImportant Note:\n\nWhen placing this composition in the Eden Editor, make sure you toggle vertical mode to not adjust to terrain, as well as toggle Surface Snapping to snap to terrain, otherwise spawning the composition will…",
  "temTutorial": false,
  "guia": "Military Data Center\n\nA Military Cargo HQ deployed as a Data Center for communications, intelligence gathering, and can operate as a briefing room.\n\nThis HQ contains electronics, TV screens, server units, and more.\n\nImportant Note:\n\nWhen placing this composition in the Eden Editor, make sure you toggle vertical mode to not adjust to terrain, as well as toggle Surface Snapping to snap to terrain, otherwise spawning the composition will misplace the objects inside the HQ.\n\nAll objects inside of the building use BIS_fnc_attachToRelative to make it Zeus friendly. An event handler has been added that will delete all attached objects when the main building itself is physically destroyed or deleted by Zeus.\n\nOriginal Design by me (XpeditionXD8).\nIf you use this composition in a mission or a Zeus Operation, feel free to let me know in the comments. I'd like to receive feedback with suggestions/improvements."
 },
 "2609065953": {
  "nome": "Military Data Center (Green)",
  "cat": "composicao",
  "tam": "99 KB",
  "img": "https://images.steamusercontent.com/ugc/2015974654668184062/FCA6C3B7EA46605849DA1537CD18EAF345D92C53/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Communications",
   "Storage"
  ],
  "deps": [],
  "resumo": "Military Data Center\n\nA Military Cargo HQ deployed as a Data Center for communications, intelligence gathering, and can operate as a briefing room.\n\nThis HQ contains electronics, TV screens, server units, and more.\n\nImportant Note:\n\nWhen placing this composition in the Eden Editor, make sure you toggle vertical mode to not adjust to terrain, as well as toggle Surface Snapping to snap to terrain, otherwise spawning the composition will…",
  "temTutorial": false,
  "guia": "Military Data Center\n\nA Military Cargo HQ deployed as a Data Center for communications, intelligence gathering, and can operate as a briefing room.\n\nThis HQ contains electronics, TV screens, server units, and more.\n\nImportant Note:\n\nWhen placing this composition in the Eden Editor, make sure you toggle vertical mode to not adjust to terrain, as well as toggle Surface Snapping to snap to terrain, otherwise spawning the composition will misplace the objects inside the HQ.\n\nAll objects inside of the building use BIS_fnc_attachToRelative to make it Zeus friendly. An event handler has been added that will delete all attached objects when the main building itself is physically destroyed or deleted by Zeus.\n\nOriginal Design by me (XpeditionXD8).\nIf you use this composition in a mission or a Zeus Operation, feel free to let me know in the comments. I'd like to receive feedback with suggestions/improvements."
 },
 "2623341670": {
  "nome": "Animated Recoil coefficient changer",
  "cat": "mod",
  "tam": "15 MB",
  "img": "https://images.steamusercontent.com/ugc/2061008729214856093/00A43CE70779447938C0952956C8E25A71595813/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "The mod changes the behavior of weapons. Now it feels alive in your hands, the cardboard effect disappears.\n\nThe mod contains:\n\n• Animated weapon recoil.\n\n• Animated entry into aiming mode.\n\n• Animated change of fire modes.\n\n• Adjust recoil coefficient.\n\n• Adjustment of recoil behavior during automatic fire.\n\n• Adjust AI accuracy.\n\nIn the mod settings you can find many parameters, including the influence of the degree of animation…",
  "temTutorial": true
 },
 "2651774379": {
  "nome": "OPCOM - Operations Command",
  "cat": "mod",
  "tam": "26 MB",
  "img": "https://images.steamusercontent.com/ugc/28808598732246672/8AAA06F6D04E230A10B2BEE23F00C22104213B57/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Editor Extension"
  ],
  "deps": [],
  "resumo": "OPCOM: OPERATIONS COMMAND\n\nVersion: 0.2.1.241003.1\n\nWHAT TO EXPECT:\nOPCOM is a \"see what you get\" menu with lots of customization and settings. No modding or deep editor knowledge required. It takes just a few clicks to set up your single-player scenario, operator, squad, and support.  Play missions or liberation on any map. In Global Ops, you drop into other maps, directly from your current scenario, to execute special operations…",
  "temTutorial": true
 },
 "2652027546": {
  "nome": "Integrated Visual Augmentation System (IVAS) Headset",
  "cat": "mod",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/2368398840958735076/AB4D8A8F3ADBEED856B4A389A50EC55C50FBFD1A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment"
  ],
  "deps": [],
  "resumo": "Integrated Visual Augmentation System\n\nOur very first Arma 3 Mod! After 4 days of nonstop tears and wanting to strangle the Arma devs for using pain in the ass files and programs, it is complete. This is our first mod, and will definitely be our last.\n\nWorn in your NVG slot to free up facewear for some kickass combinations, We present;\nIntegrated Visual Augmentation Goggles, currently in testing with the United States Army on a $22…",
  "temTutorial": true
 },
 "2659085897": {
  "nome": "Direct Action - Sefrou-Ramal",
  "cat": "cenario",
  "tam": "31 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521872055817/8DE02015B451CDE063A8129BC505EFCE30280F2D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Multiplayer"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2662233087": {
  "nome": "Direct Action - Malden",
  "cat": "cenario",
  "tam": "31 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521871589475/204221663EA361A78421E8DF8A2EC54ED148C379/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Multiplayer"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2664678033": {
  "nome": "CE: Movement",
  "cat": "mod",
  "tam": "894 KB",
  "img": "https://images.steamusercontent.com/ugc/2492264315559424168/9953B1D124404A72F23A58F8655C59C0E9E91AFD/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Cluster Enhancements: Movement (CE:M)\n\nCE:M is the collaborative effort of the Cluster Community Mod team. It is a part of a broader collection of mods designed to enhance the experience of players in our community.\n\nThis addon is entirely open source and all contributions are welcome. Feel free to maintain your own custom version, so long as the changes you make are open to the public in accordance with the GNU General Public License…",
  "temTutorial": true
 },
 "2667104050": {
  "nome": "Direct Action - Stratis",
  "cat": "cenario",
  "tam": "31 MB",
  "img": "https://images.steamusercontent.com/ugc/1956279521871603011/16E81326337D5E71473783D76A4022C41F5F4812/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Infantry",
   "Coop",
   "Vehicles",
   "Air",
   "Multiplayer"
  ],
  "deps": [],
  "resumo": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play…",
  "temTutorial": false,
  "guia": "Welcome to Direct Action: Dynamic Missions! A new open world, combined arms, dynamic mission for ARMA 3.\n\nPlease do not modify and / or re-upload this mission without permission in any form on Steam or elsewhere.\n\nAny SUGGESTIONS and BUG REPORTS please reach out to us on our Discord - https://discord.gg/vRG3X4yqYV\n\n.....\n\n*** IMPORTANT INFO ***\n\n- Direct action is a multiplayer only scenario. It will not appear in \"Scenarios\". To play solo, host a local multiplayer server, select the map you want to play and adjust mission parameters as required.\n- For best results, don’t guess what mods work. Download SUPPORTED MOD PRESETS here - https://discord.gg/vRG3X4yqYV\n- Check Discussions for FAQ.\n- PBO Files - https://www.dropbox.com/sh/2rwfpu1h3sowee6/AABjA-YFHv3iIEiJtmqhY45Ka?dl=0\n\n.....\n\n*** MULTIPLAYER SAVING***\n\n- You MUST be running the @Inidbi2 database mod on the dedi server or local host.\n- Saving happens automatically in the background. The in game save button has nothing to do with the save system in DA.\n- Your server / game client MUST be in 64bit mode.\n- If on a dedicated server, @inidbi2 should be loaded in -servermod, not -mod.\n- If @INIDBI2 doesn’t work, manually move the mod folder to ARMA 3 root directory and run from there.\n- Connected clients DO NOT need to run @inidbi2. Just the server / host.\n\nDownload INIDBI2 here - https://steamcommunity.com/workshop/filedetails/?id=1768992669\n\n.....\n\nFeatures:\n\n- Open world dynamic design\n- Up to 12 player co-op\n- Works on hosted and dedicated servers\n- Persistence (must be using \"Inidbi2 - Official Extension\" mod)\n- Enemy camps\n- Dynamically generated side objectives\n- Random Encounters\n- Discoverable friendly camps\n- Static ships + carriers\n- Mission level progression system to unlock gear and vehicles\n- Class special abilities.\n- Switch class in game.\n- Weapon and gear class restrictions.\n- Find and unlock new friendly vehicles to spawn at base.\n- \"Outpost\" mobile spawn point mechanic.\n- Fast Travel system\n- Recr"
 },
 "2699465073": {
  "nome": "Fire Support Plus",
  "cat": "mod",
  "tam": "41 MB",
  "img": "https://images.steamusercontent.com/ugc/12733515678850094788/F4E7274614768153CDFC15811ED1B7184259DD97/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics",
   "Weapon",
   "Editor Extension",
   "Server"
  ],
  "deps": [
   "CBA_A3",
   "Zeus Enhanced"
  ],
  "resumo": "A mod that adds more Fire Support modules into ArmA 3 Zeus\n\n STATUS: STABLE\n\nThis mod will add more different Fire support modules as well as Barrages for ease of use during your operations as well as New custom munitions usable via 3DEN and Zeus modules and, where marked , directly by players in the field.\n\nYou can run these modules via Zeus, 3DEN or through Functions in your scripts\nGithub wiki page for all the PLUS mods:…",
  "temTutorial": true
 },
 "2709837403": {
  "nome": "Military Tower With Interiors",
  "cat": "composicao",
  "tam": "41 KB",
  "img": "https://images.steamusercontent.com/ugc/1868430881857883685/F51A0975AE18D1A872745916D2EEE2357D9B711F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "NO MODS NEEDED.\n\nMade easy with this composition - Thanks man for posting it!\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=2399157621&searchtext=DESK+SET\n\n⭐Want to see more great stuff!?⭐\n\nJoin my discord for Arma 3 scripts and goodies!\nhttps://discord.gg/ZxXWDXeFbM\n\nCheck My YouTube channel for Arma content (tutorials and gameplay)\nhttps://www.youtube.com/channel/UC8ssC9aJNK47AgR7rWqp1yw\n\nEnjoy",
  "temTutorial": false
 },
 "2719006683": {
  "nome": "Vehicle Maintenance Station",
  "cat": "composicao",
  "tam": "105 KB",
  "img": "https://images.steamusercontent.com/ugc/1844787679314934135/9C6AF3E13032040426E2F81FB2E6461934FF2DD9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Barricade",
   "Base",
   "Camp",
   "Checkpoint"
  ],
  "deps": [],
  "resumo": "Vehicle Maintenance Station for all your needs. You can add or delete any components as you wish. Don't forget to toggle vertical mode and surface snapping off. Hope you enjoy it!",
  "temTutorial": false
 },
 "2733847169": {
  "nome": "UAV Feed Station [NATO] v1.4",
  "cat": "composicao",
  "tam": "19 KB",
  "img": "https://images.steamusercontent.com/ugc/2015975677055085223/0E0C82BA0C55732569FA8DBC8147DF76367F06F5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "HelicoptersDLC",
   "Apex",
   "Laws of War",
   "Contact (Platform)",
   "Communications"
  ],
  "deps": [],
  "resumo": "UAV Feed Station\n\nCreates a global camera, attaches itself to an AR-2 Darter Drone, and displays the camera feed on a screen texture.\n\nImportant Info / Known issues\n\n• This has been tested in multiplayer environments where there could be a player with Zeus perms/controls that could spawn this composition and have it work properly for ground players not using a Zeus interface. The Zeus user(s) will not be able to see the displayed feed…",
  "temTutorial": false,
  "guia": "UAV Feed Station\n\nCreates a global camera, attaches itself to an AR-2 Darter Drone, and displays the camera feed on a screen texture.\n\nImportant Info / Known issues\n\n• This has been tested in multiplayer environments where there could be a player with Zeus perms/controls that could spawn this composition and have it work properly for ground players not using a Zeus interface. The Zeus user(s) will not be able to see the displayed feed texture applied to the object, but if they leave the Zeus interface and return to their player state, they will see it.\n\n• Work In Progress: In a possible future update, this will add another event handler that will allow Zeus users to see the live feed on the screened object while using the Zeus interface.\n\n• To use this in a scenario like ones mentioned above, make sure you have a file called \"Description.ext\" in your mission's folder. More info in this very helpful video: https://www.youtube.com/watch?v=-SZrnZPvA80\n\n• Use at your own risk in Zeus multiplayer scenarios/servers. There will eventually be an update to fix the issue of players not being able to use the actions due to remoteExec restrictions. As of now, if a Zeus spawns this composition, the addActions are not correctly executed for every client/JIP to receive the intended actions for the object. This will be fixed eventually.\n\n• The time has finally come where this works properly with usage of the Virtual Arsenal and Virtual Garage. The issue before was that when a player opened any instance of the Virtual Arsenal using BIS_fnc_arsenal, all PIP textures would stop working. Every time a camera is deleted without the terminated effect being applied beforehand, all other PIP textures stopped working. You have to delete and recreate every camera.\n\nNote: The static that appears on some displays are a known issue according to everything related to ArmA 3 and Bohemia Interactive, and there is nothing that can fix it or take it out of the display. it's something to do with the a"
 },
 "2734912943": {
  "nome": "UAV Feed (Data Terminal) [NATO] v1.4",
  "cat": "composicao",
  "tam": "15 KB",
  "img": "https://images.steamusercontent.com/ugc/2015975784044113624/FA08500970FE5BB340CD63ABFE774D925720319C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Communications"
  ],
  "deps": [],
  "resumo": "UAV Feed Station\n\nCreates a global camera, attaches itself to an AR-2 Darter Drone, and displays the camera feed on a Data Terminal.\n2 cameras are used on the Darter Drone and have different PiP effects: Left cam (cam 1) has normal and night vision PiP effects, Right cam (cam 2) has thermal PiP.\n\nImportant Info / Known issues\n\n• This has been tested in multiplayer environments where there could be a player with Zeus perms/controls that…",
  "temTutorial": false,
  "guia": "UAV Feed Station\n\nCreates a global camera, attaches itself to an AR-2 Darter Drone, and displays the camera feed on a Data Terminal.\n2 cameras are used on the Darter Drone and have different PiP effects: Left cam (cam 1) has normal and night vision PiP effects, Right cam (cam 2) has thermal PiP.\n\nImportant Info / Known issues\n\n• This has been tested in multiplayer environments where there could be a player with Zeus perms/controls that could spawn this composition and have it work properly for ground players not using a Zeus interface. The Zeus user(s) will not be able to see the displayed feed texture applied to the object, but if they leave the Zeus interface and return to their player state, they will see it.\n\n• Work In Progress: In a possible future update, this will add another event handler that will allow Zeus users to see the live feed on the screened object while using the Zeus interface.\n\n• To use this in a scenario like ones mentioned above, make sure you have a file called \"Description.ext\" in your mission's folder. More info in this very helpful video: https://www.youtube.com/watch?v=-SZrnZPvA80\n\n• Use at your own risk in Zeus multiplayer scenarios/servers. There will eventually be an update to fix the issue of players not being able to use the actions due to remoteExec restrictions. As of now, if a Zeus spawns this composition, the addActions are not correctly executed for every client/JIP to receive the intended actions for the object. This will be fixed eventually.\n\n• The time has finally come where this works properly with usage of the Virtual Arsenal and Virtual Garage. The issue before was that when a player opened any instance of the Virtual Arsenal using BIS_fnc_arsenal, all PIP textures would stop working. Every time a camera is deleted without the terminated effect being applied beforehand, all other PIP textures stopped working. You have to delete and recreate every camera.\n\nNote: The static that appears on some displays (such as this one) ar"
 },
 "2760602147": {
  "nome": "AIO Arsenal (Service Station)",
  "cat": "composicao",
  "tam": "55 KB",
  "img": "https://images.steamusercontent.com/ugc/1827902607960302927/923234E45B8461C76FDEFE9100A2D6932B9086F6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Artillery",
   "Collection",
   "KartsDLC",
   "MarksmenDLC",
   "HelicoptersDLC"
  ],
  "deps": [],
  "resumo": "All In One Virtual Arsenal & Service Station\n by M9-SD\n\nFeatures:\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits enabled.\n\nHow to use:\n3DEN: Compositions >…",
  "temTutorial": false,
  "guia": "All In One Virtual Arsenal & Service Station\n by M9-SD\n\nFeatures:\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits enabled.\n\nHow to use:\n3DEN: Compositions > Custom > Steam Subscribed Content > Services > AIO Arsenal by M9-SD\nZeus: Groups > Empty > Steam Subscribed Content > Services > AIO Arsenal by M9-SD\n\nRate, Favorite, & Subscribe for more features and updates.\n\nScroll down for other variants!\n\nOther Variants:\n\n• Supply Box (Small)\n\n• Module (Apply to anything)\n\nSource Code & License:\n\n• Github\n• MIT License\n\nYou may do what you want with the code, provided you abide by and include my copyright/license.\n\nTags:\narsenal composition script sqf code 3den eden editor zeus pub public official m9 m9sd m9-sd scroll action actions aio all-in-one vehicle crate box ammo container shipping emp faraday cage proof welding fuel gas medical gear weapons uniforms backpacks face faces zam supply supplies cargo drop camp tool tools utility utilities module make create spawn give apply car tank ammunition weapon armament pylon round vest clothes hat helmet bullet bullets plate carrier backpack reload quick full arsenal yellow gold helipad light lighting day night\n\n——————————————————————————————————\n\nMy Links\n\n• Donate\n• Website\n• YouTube\n• GitHub\n• Workshop\n• Discord (ZAM)\n• Discord (SQF Archive)\n\n——————————————————————————————————\n\nRequirements\n\nThis is a scripted composition, designed to be placed from the Zeus interface. After subscribing to and subsequently downloading this composition, it will automatically be accessible in-game from Zeus > Groups > Empty > Compositions (since it's not a mod, it won't show up as one in the Arma 3 launcher). The scripts attached to this composition will only work if the"
 },
 "2764558652": {
  "nome": "AIO Arsenal (Supply Box)",
  "cat": "composicao",
  "tam": "26 KB",
  "img": "https://images.steamusercontent.com/ugc/1827903024508654097/7A759EA7DCC8907F1AB17A98CBED4925D0D8F7E5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Artillery",
   "Collection",
   "KartsDLC",
   "MarksmenDLC",
   "HelicoptersDLC"
  ],
  "deps": [],
  "resumo": "All In One Virtual Arsenal\n by M9-SD\n\nFeatures:\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n• Slingloadable\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits enabled.\n\nHow to use:\n3DEN: Compositions >…",
  "temTutorial": false,
  "guia": "All In One Virtual Arsenal\n by M9-SD\n\nFeatures:\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n• Slingloadable\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits enabled.\n\nHow to use:\n3DEN: Compositions > Custom > Steam Subscribed Content > Services > AIO Arsenal (Supply Box)\nZeus: Groups > Empty > Steam Subscribed Content > Services > AIO Arsenal (Supply Box)\n\nRate, Favorite, & Subscribe for more features and updates.\n\nOther Variants:\n\n• Service Station (Faraday Cage)\n• Module (Apply to anything)\n\nSource Code & License:\n\n• Github\n• MIT License\n\nFeel free to do whatever you want with the code, just include the above copyright notice.\n\nTags:\narsenal composition script sqf code 3den eden editor zeus pub public official m9 m9sd m9-sd scroll action actions aio all-in-one vehicle crate box ammo container shipping emp faraday cage proof welding fuel gas medical gear weapons uniforms backpacks face faces zam supply supplies cargo drop camp tool tools utility utilities module make create spawn give apply car tank ammunition weapon armament pylon round vest clothes hat helmet bullet bullets plate carrier backpack reload quick full arsenal yellow gold helipad light lighting day night small\n\n——————————————————————————————————\n\nMy Links\n\n• Donate\n• Website\n• YouTube\n• GitHub\n• Workshop\n• Discord (ZAM)\n• Discord (SQF Archive)\n\n——————————————————————————————————\n\nRequirements\n\nThis is a scripted composition, designed to be placed from the Zeus interface. After subscribing to and subsequently downloading this composition, it will automatically be accessible in-game from Zeus > Groups > Empty > Compositions (since it's not a mod, it won't show up as one in the Arma 3 launcher). The scripts attached to this composition will only work if the server allows i"
 },
 "2765292972": {
  "nome": "[+] AIO Arsenal (Module)",
  "cat": "composicao",
  "tam": "26 KB",
  "img": "https://images.steamusercontent.com/ugc/1827903024510876583/86FAC2F0D9561A646A4BC1580D418795F0A5563A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Artillery",
   "Collection",
   "KartsDLC",
   "MarksmenDLC",
   "HelicoptersDLC"
  ],
  "deps": [],
  "resumo": "All In One Virtual Arsenal (Module)\n by M9-SD\n\nFeatures:\n\n• Make anything a virtual arsenal!\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n• Slingloadable\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits…",
  "temTutorial": false,
  "guia": "All In One Virtual Arsenal (Module)\n by M9-SD\n\nFeatures:\n\n• Make anything a virtual arsenal!\n\n• Full Arsenal (+Animations)\n• Copy Loadout\n• Empty Loadout\n• Save Respawn Loadout\n• Load Respawn Loadout\n• Delete Respawn Loadout\n• Heal\n• Repair Vehicle\n• Rearm Vehicle\n• Refuel Vehicle\n• 3D Marker\n• Map Marker\n• Sound Effects\n• Slingloadable\n\nNo mods or DLC required!\nThis composition only works properly if the server has composition inits enabled.\n\nHow to use:\n3DEN: Does not work when spawned from 3den editor.\nThis works just like a zeus module, so it must be run from the zeus interface.\nZeus: Groups > Empty > Steam Subscribed Content > Services > [+] AIO Arsenal (Module)\nPlace the composition on any editable object to add the arsenal actions to it.\n\nRate, Favorite, & Subscribe for more features and updates.\n\nOther Variants:\n\n• Service Station (Faraday Cage)\n• Supply Box (Small)\n\nSource Code & License:\n\n• Github\n• MIT License\n\nFeel free to do whatever you want with the code, just include the above copyright notice.\n\nTags:\narsenal composition script sqf code 3den eden editor zeus pub public official m9 m9sd m9-sd scroll action actions aio all-in-one vehicle crate box ammo container shipping emp faraday cage proof welding fuel gas medical gear weapons uniforms backpacks face faces zam supply supplies cargo drop camp tool tools utility utilities module make create spawn give apply car tank ammunition weapon armament pylon round vest clothes hat helmet bullet bullets plate carrier backpack reload quick full arsenal yellow gold helipad light lighting day night small\n\n——————————————————————————————————\n\nMy Links\n\n• Donate\n• Website\n• YouTube\n• GitHub\n• Workshop\n• Discord (ZAM)\n• Discord (SQF Archive)\n\n——————————————————————————————————\n\nRequirements\n\nThis is a scripted composition, designed to be placed from the Zeus interface. After subscribing to and subsequently downloading this composition, it will automatically be accessible in-game from Zeus > Groups > Empty > Compositio"
 },
 "2783387288": {
  "nome": "FOB Sentinel",
  "cat": "composicao",
  "tam": "146 KB",
  "img": "https://images.steamusercontent.com/ugc/1833534870165213449/CDB4BC3F9AD76EF7AE6C9A814E8E1AFE494F4661/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Barricade",
   "Base",
   "Camp",
   "Communications"
  ],
  "deps": [],
  "resumo": "Medium size FOB for your needs.\nIncludes HQ, briefing area, dormitory area, medical tent and couple of empty tents for your own needs (arsenal, etc...).\nMedium population with props. Performance friendly!\nWorking lamp system; night won't be so dark.\nNo DLC requirements! Completely vanilla (WS was used only for screenshots).\nHope y'all enjoy and have a good time!",
  "temTutorial": false
 },
 "2788422362": {
  "nome": "RIS - Isla Duala",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1804262450942489986/66DC3C6F025B9FBF453B9F9C5EADEAE946242ED8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [
   "Isla Duala"
  ],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "2788422469": {
  "nome": "RIS - Lingor",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1804262450942490611/1A8B6C74672C0D4B02FBB4D636243B89A59004B5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Multiplayer",
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles"
  ],
  "deps": [
   "Lingor/Dingor Island"
  ],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "2788700580": {
  "nome": "RIS - Livonia",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/1804262450944639371/D13DB5F92FD57339E975DB8E8DB108B0A4E89E86/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Vehicles",
   "Air"
  ],
  "deps": [],
  "resumo": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of…",
  "temTutorial": false,
  "autor": "Kamen",
  "guia": "Immediately jump into random infantry skirmish on random place on the map. You can choose any faction, any weapon and any vehicles and just start fighting.\n\nMain features\n\n•  Fast paced, dynamically generated firefight with infantry and land/air vehicles\n\n•  Compatible with any mod that has proper units definitions\n\n•  Fully customizable, set your own rules, select your gear, pick location, pick factions\n\n•  5 game modes: Push, King of the Hill, Team Deathmatch, Arena Team Deathmatch, Arena Gun Game and Defense\n\n•  Supports Singleplayer, COOP and PvP (up to 8 players per side)\n\nGame modes\n\n•  Push - attack and capture sequence of points, one after another while defenders put fierce resistence\n\n•  King of the Hill - team that has more units in specified area gets points over time, the team that reaches point limit first wins\n\n•  Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins\n\n•  Arena Team Deathmatch - get points for killing enemy units, the team that reaches point limit first wins, fought in small arena\n\n•  Arena Gun Game - starts with predefined list of weapons, everybody starts with the first weapon and progresses to next one once they manage to kill 2 opponents. First player to reach the last weapon and achieve the 2 kills wins the game\n\n•  Defense - defend area against increasingly more difficult waves of enemies\n\nCan't find the map you want? Just use the module version!\n\nRIS - Module The module version allows you to start the mission on any map you want. Note that the module version is a mod that needs to be enabled in the launcher.\n\n2025-08-18\n\n•  Added class-based spawn ratios with possibility to define ratios for AntiAir, AntiTank, Infantry\n\n2024-09-28\n\n•  Fixed UI not working for other players in MP\n\n•  Fixed Gun Game mode not working properly for other players in PM\n\n•  Fixed edge cases in MP that could result in spawning issues\n\n2024-02-08\n\n•  Module version released, easily start the game mode to any ma"
 },
 "2791403093": {
  "nome": "Better Inventory",
  "cat": "mod",
  "tam": "104 KB",
  "img": "https://images.steamusercontent.com/ugc/1812145140779902648/D6781B7FB5942FB40537D4B53BE63BE9C3C67AAF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Are you also annoyed to switch between Uniform, Vest and Backpack?\nHere is the solution to this madness.\n\nFeatures:\n\n- Changed Inventory Layout\n- Contents of Uniform, Vest and Backpack are visible at the same time.\n- Clientside Mod. The Mod only needs to be whitelisted on the Server and have CBA installed.\n- Stack Moving. Move many Items/Magazines at the same Time.\n- Task Force Radio Buttons to open the settings of equipped Radios.…",
  "temTutorial": true
 },
 "2798280128": {
  "nome": "Uplink",
  "cat": "composicao",
  "tam": "12 KB",
  "img": "https://images.steamusercontent.com/ugc/1827907906662927740/B12BD998BCED2A891436B5B15A01EB498F3523A1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "(sem descrição no Workshop)",
  "temTutorial": false
 },
 "2798381570": {
  "nome": "Weapon workshop",
  "cat": "composicao",
  "tam": "17 KB",
  "img": "https://images.steamusercontent.com/ugc/1827907906663967276/EBCC4793B4A0CA9AAFC8C02B5BDC153785C5CA37/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "(sem descrição no Workshop)",
  "temTutorial": false
 },
 "2800081814": {
  "nome": "Dynamic Camo System",
  "cat": "terreno",
  "tam": "383 KB",
  "img": "https://images.steamusercontent.com/ugc/5089662133321427675/B5D24661639B3D474C666620B1CC57D89F1227CC/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain",
   "Server",
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Dynamic Camo System\n\nA lightweight mod that makes your uniform choice actually matter. If your uniforms colours match the ground, you will be less visible to AI. The mod does this by comparing the uniforms average colour to the ground textures average colour and applying a camouflage coefficient depending on how much the colours match.\n\nFeatures\n\n•  Almost everything is adjustable through CBA settings\n\n•  Only the server needs the mod…",
  "temTutorial": true
 },
 "2800373440": {
  "nome": "Briefing Area (Small)",
  "cat": "composicao",
  "tam": "50 KB",
  "img": "https://images.steamusercontent.com/ugc/1816649539779842486/8D5C55DC6B05D8F180C08A904BFD24723AA2F86B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "This composition features a fairly detailed smaller briefing area complete with seating area, tables, whiteboard, and monitors.",
  "temTutorial": false
 },
 "2800515391": {
  "nome": "Sleeping Area Tent",
  "cat": "composicao",
  "tam": "56 KB",
  "img": "https://images.steamusercontent.com/ugc/1816649539780082772/F710711A31AE27AE1F28A49350FD473F0F28FFAE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "This composition features a fully furnished sleeping area for a maximum of 12 individuals.",
  "temTutorial": false
 },
 "2808189229": {
  "nome": "Medium Military Base",
  "cat": "composicao",
  "tam": "247 KB",
  "img": "https://images.steamusercontent.com/ugc/1848176100935826247/550CF09B3A272C54FED5990F8B1E3982458F6569/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Barricade",
   "Base",
   "Camp",
   "Emplacement"
  ],
  "deps": [],
  "resumo": "Medium Military Base ( No Mods )\nWith living quarters, storage and office rooms.\n\n- You can find the compositions in the group section under Compositions > Custom\n- Try to place the composition by turning vertical mode off and surface snapping.\n- Object Counter:\n- All of my compositions have most of their objects simulation & damage disabled to save performance.\n\nLink to my other Arma 3 Compositions\nThank you for subscribing to my…",
  "temTutorial": false,
  "guia": "Medium Military Base ( No Mods )\nWith living quarters, storage and office rooms.\n\n- You can find the compositions in the group section under Compositions > Custom\n- Try to place the composition by turning vertical mode off and surface snapping.\n- Object Counter:\n- All of my compositions have most of their objects simulation & damage disabled to save performance.\n\nLink to my other Arma 3 Compositions\nThank you for subscribing to my composition! Don't forget to rate it! ;)"
 },
 "2811886291": {
  "nome": "SPS Weapons V2",
  "cat": "mod",
  "tam": "1.2 GB",
  "img": "https://images.steamusercontent.com/ugc/17547105072701585/CB985ED7B0ACC242D6EF84572A64533087827B9C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "ACE3 Arsenal Extended - Core",
   "CBA_A3",
   "ace"
  ],
  "resumo": "SPS Weapons V2\n\n2.3.0\nUpdated laser/light modules to adapt to ACE3's latest implementation of visible lasers. ACE3 has dropped their original implementation and now use the Vanilla game engine version which was added fairly recently. The laser/light modules in this mod now use the same implementation as ACE3 have removed their old implementation.\n\n2.2.0\nAdded a series of laser pointers, IR illuminators and white light illuminators to…",
  "temTutorial": true
 },
 "2824471652": {
  "nome": "Overthrow Community Edition",
  "cat": "mod",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/11898843091538412645/36962C10593156CA02F8DBEFE2807F4EFB06716E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "The work on Overthrow continues!\n\nOverthrow is a dynamic and persistent revolution campaign mod for Arma 3.\n\nOverthrow: Community Edition (previously Rekter Edition) is a continuation of the Overthrow Plus project by Nifnat\n\nThe goal of the project is to update the Overthrow codebase to allow for easier modification and enhanced performance, while also adding new features and fixing bugs, trying to stay faithful to the original vision…",
  "temTutorial": false,
  "guia": "The work on Overthrow continues!\n\nOverthrow is a dynamic and persistent revolution campaign mod for Arma 3.\n\nOverthrow: Community Edition (previously Rekter Edition) is a continuation of the Overthrow Plus project by Nifnat\n\nThe goal of the project is to update the Overthrow codebase to allow for easier modification and enhanced performance, while also adding new features and fixing bugs, trying to stay faithful to the original vision of Overthrow.\n\nThe mod is in active development, and bugs and issues may occur, even to the save system. Making backups is highly recommended!\n\nCurrent features\n\n•  Ability to change enemy faction (RHS, 3CB)\n\n•  Warehouse inventories are separate\n\n•  Warehouse arsenal no longer resets loadout\n\n•  Improved warehouse search\n\n•  Resistance cap speed increased 4x if NATO isn't present\n\n•  VCOM has been removed\n\n•  New gendarmerie units\n\n•  Performance improvements\n\n•  Security & bug fixes\n\n•  New save system allows for save transfers and back-ups\n\n•  Ability to disable random loadouts for NATO\n\n•  And so much more...\n\nIssues\n\n•  Saves are NOT compatible with other versions of Overthrow\n\nFAQ\n\nQ: Do I have to use ACE?\nA: Yes. Overthrow has been designed to be played with ACE from the start.\nQ: Can I use 'ACE no medical' mods?\nA: No. Overthrow requires that the medical items are present.\nQ: How do I change the faction?\nA: Click the \"Parameters\" button in the role selection screen.\nQ: Do I load only this, or Overthrow and this?\nA: Load only this mod! Do NOT load other versions at the same time!\nQ: Do I need any DLC?\nA: None are required but Apex is very much recommended.\nQ: Can I make my own version?\nA: Yes, absolutely! If you make something cool, considering making a pull request for it on GitHub and I may merge it into this version as well.\nQ: I made a campaign for a new map! Should I release a new version?\nA: In my opinion, no. Just create a pull request on GitHub, and if everything is alright, we will add your custom campaign right into th"
 },
 "2836999643": {
  "nome": "Air Support Plus",
  "cat": "mod",
  "tam": "251 KB",
  "img": "https://images.steamusercontent.com/ugc/2017084459270406324/058020ABBABB891948911411495EC52960E46895/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Plane",
   "Weapon",
   "Editor Extension"
  ],
  "deps": [
   "Zeus Enhanced",
   "CBA_A3"
  ],
  "resumo": "Current State: STABLE\n\nAdds an expanded air support module into ArmA 3 ZEUS\n\nThis is a client-side mod\n\nThis mod will add a new Air Support module that will allow you to use any Aircraft with any Weapon for any of your CAS purposes, this mod will ease the use CAS during your operations when you don't want or have any players to do CAS.\n\n Basipek and Phenosi\n\nFeel free to follow me on my Content Platforms\nMy Youtube Channel\n\nLICENSE:…",
  "temTutorial": true
 },
 "2852399167": {
  "nome": "NATO HQ Jungle [CHECK-IN ROOM TENT]",
  "cat": "composicao",
  "tam": "37 KB",
  "img": "https://images.steamusercontent.com/ugc/1735595301156052049/876630213938DC44DCD805F5B11517F1B0C2089B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Base",
   "Camp",
   "Communications"
  ],
  "deps": [],
  "resumo": "Free to use by \"mitwit\"",
  "temTutorial": false
 },
 "2852780363": {
  "nome": "NATO HQ Desert [MAIN MEDICAL TENT]",
  "cat": "composicao",
  "tam": "70 KB",
  "img": "https://images.steamusercontent.com/ugc/1735595301157997703/8F812C9716E884223F2427EEDEFA18F3289C92CF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Base",
   "Camp",
   "Communications"
  ],
  "deps": [],
  "resumo": "Free to use by \"mitwit\"",
  "temTutorial": false
 },
 "2852782449": {
  "nome": "NATO HQ Jungle [MAIN MEDICAL TENT]",
  "cat": "composicao",
  "tam": "70 KB",
  "img": "https://images.steamusercontent.com/ugc/1735595301158018655/DF4126DBC5883A5ABF425942F380B6A96E3D253E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Logistics",
   "Base",
   "Camp",
   "Communications"
  ],
  "deps": [],
  "resumo": "Free to use by \"mitwit\"",
  "temTutorial": false
 },
 "2871002081": {
  "nome": "Simpel's MilGP Retextures",
  "cat": "mod",
  "tam": "424 MB",
  "img": "https://images.steamusercontent.com/ugc/2053120954679027944/511854CBA6D2C4EEA2AAA6EBE556457DDF96A543/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment"
  ],
  "deps": [],
  "resumo": "This mod was initially made for my unit as a fix for some of the textures from Adacas' Military Gear Pack, all credits to him for the models and most of the original textures. I have edited almost every single texture from MILGP + MILGP AOR extension, as well as added extra options such as black and white vests, multicam arid, tropic, and black JPCs, spraypainted and covered helmets, flecktarn and tropentarn uniforms, camo PCUs and…",
  "temTutorial": true
 },
 "2876605714": {
  "nome": "Nato Main Command Tent",
  "cat": "composicao",
  "tam": "103 KB",
  "img": "https://images.steamusercontent.com/ugc/1879715491883914417/09CCB41060CA9F5F8574E037FE48EFB62D6D195F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "MarksmenDLC",
   "HelicoptersDLC",
   "Malden",
   "Laws of War",
   "Tanks"
  ],
  "deps": [],
  "resumo": "This comp is a tent for Blufor Forces, specificly Nato. Put this with Vertical Mode on and No simulation  on all. Hope you enjoy.",
  "temTutorial": false
 },
 "2877029157": {
  "nome": "AIO Arsenal+Service (Huron Cargo Container, Orange UI)",
  "cat": "composicao",
  "tam": "29 KB",
  "img": "https://images.steamusercontent.com/ugc/12558138937331989059/2E921E63FFC1FBC8CDFF929E940306554E8974FF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "HelicoptersDLC",
   "Logistics",
   "Storage"
  ],
  "deps": [],
  "resumo": "All-In-One Virtual Arsenal + Service Station\n\nBy M9-SD\nEdited by XpeditionXD8\n\n(Disclaimer):\nThis version of AIO Arsenal has been slightly modified to be used on a Huron Cargo Container.\nMultiple of these can be placed in a scenario. However, there is a high possibility that every AIO Arsenal will be the same UI color as the first one that was spawned, since it initializes global marker variables and can overwrite other markers.\n\nTo…",
  "temTutorial": false,
  "guia": "All-In-One Virtual Arsenal + Service Station\n\nBy M9-SD\nEdited by XpeditionXD8\n\n(Disclaimer):\nThis version of AIO Arsenal has been slightly modified to be used on a Huron Cargo Container.\nMultiple of these can be placed in a scenario. However, there is a high possibility that every AIO Arsenal will be the same UI color as the first one that was spawned, since it initializes global marker variables and can overwrite other markers.\n\nTo see the official description and instructions, please visit\n ArmA 3 Workshop > M9-SD's Workshop > \"AIO Arsenal\"\n\nVirtual Arsenal Features:\n\nService Station Features:\n\nUsage:\n\n• Works in both singleplayer and multiplayer scenarios, including official Zeus servers.\n\n• Usable in official Zeus servers with zeusCompositionScriptLevel = 2 (servers ending in an even number).\n\nAll copyrights and original content go to their respective owners."
 },
 "2894857160": {
  "nome": "Military Jungle Operations Table",
  "cat": "composicao",
  "tam": "23 KB",
  "img": "https://images.steamusercontent.com/ugc/1922503068776490601/4F71B177D690A1CC4DFE22419F4BFFBFE10B2537/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "MarksmenDLC",
   "HelicoptersDLC",
   "Apex",
   "Laws of War",
   "Contact (Platform)"
  ],
  "deps": [],
  "resumo": "This comp is a jungle version of the military desert operation table comp. Dont forget to put it with simulation off and vertical mode on. This was  based on a request from Predator14. Enjoy!",
  "temTutorial": false
 },
 "2914901109": {
  "nome": "Chameleon Trenches",
  "cat": "mod",
  "tam": "6 MB",
  "img": "https://images.steamusercontent.com/ugc/11925215522600746/8FA4480BD3C6C2FDE312422DB01953477690AA3C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [],
  "resumo": "Chameleon Trenches/ Peer Trenches\n\nZiel des Mods ist es Objekte zum Bauen von Grabenstellungen bereit zustellen. Am sinnvollsten ist es, wenn man die Mod mit dem Deformer Mod zusammen verwendet.\n\n Anleitung\n\nUm die Mod zu verwenden einfach die Objekte aus der Editor Kategorie \"Trench Structures\" platzieren. Die Objekte nehmen die Textur des Bodens an, sodass sie keinen deutlichen Kontrast zwischen den Objekten und dem Boden bilden. Die…",
  "temTutorial": true
 },
 "2954489716": {
  "nome": "Advanced Unit Positioning",
  "cat": "mod",
  "tam": "110 KB",
  "img": "https://images.steamusercontent.com/ugc/2049741895440138769/A0895A55BB304AC494EA275FAAE651A645E465B9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Get in the right positions to take the right shots.\n\nLean Out\n\nLean over a window or ledge to shoot along or down the wall!\n\nWhen your weapon is deployed on a surface, press Infantry > Adjust Stance Up (Ctrl + W) to go into leaning mode. Use View > Raise/Lower Turret (E/Q) to adjust the lean angle.\n\nBe sure to decrease the lean angle before exiting! At maximum lean angle, exiting or being killed will result in you falling over the…",
  "temTutorial": true
 },
 "2966168738": {
  "nome": "Terrain Lib",
  "cat": "terreno",
  "tam": "91 KB",
  "img": "https://images.steamusercontent.com/ugc/2443844912295918833/AC9E1AD4E9B7388343428EABF580886D623F90BF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain",
   "Mechanics",
   "Editor Extension"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Terrain Library\n\nUse this mod as a terrain editor in Zeus\n\nThis provides some useful functions which makes working with terrain much nicer by allowing you to use triggers, markers, and function-based areas to modify terrain as an area, with a ton of parameters.\n\nIt also fixes a problem of network optimisation in multiplayer when it comes to changing terrain heights. By default, when you modify group of terrain points, unless the exact…",
  "temTutorial": true
 },
 "2993442344": {
  "nome": "Death and Hit reactions",
  "cat": "mod",
  "tam": "62 MB",
  "img": "https://images.steamusercontent.com/ugc/14657452162068958566/A182F62E8F74A5A1BBFFFBE504F406E84E4381CB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Had this idea for a while. Wanted to make game just a little bit cinematic.\n\nMod must be installed on both client and server\n\nThis mod is also serving another purpose: to more or less syncronize ragdoll in MP environment just a little bit when death animations enabled. Because after dying units are playing an animation and only afterwards ragdoll, it allow arma to not syncronize full path of a ragdoll but only the end of it making an…",
  "temTutorial": true
 },
 "3020755032": {
  "nome": "Antistasi Ultimate - Mod",
  "cat": "mod",
  "tam": "276 MB",
  "img": "https://images.steamusercontent.com/ugc/10828796960465140315/E7E2E5CBCC341F4EFD2B9DDE231C8331CA47151C/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Antistasi Ultimate is a fork of Socrates Antistasi Plus. We aim to add more templates, maps, and features along with many tweaks and fixes that will completely change the experience.\n\nHere are just a few of the Antistasi Ultimate improvements!\n\n• 25+ Supported Faction Mods.\n\n• 50+ Supported Maps.\n\n• Countless features and QOL changes added since the original 10.0 release.\n\n• New optional victory and loss conditions.\n\n• Reimplemented…",
  "temTutorial": true
 },
 "3029401059": {
  "nome": "JCA - P320",
  "cat": "mod",
  "tam": "33 MB",
  "img": "https://images.steamusercontent.com/ugc/56958131476718099/CA9C4669FE9DBF642573D56455E6A148E46FA1AC/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Sound",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "JointCom Armoury - P320\n\nThe first mod in the JCA Standalone mod selection, the JCA - P320.\n\nDESCRIPTION:\n\nThe Obelisk Weapons Group P320 sets out to arm you with a new sidearm for when things get that little bit tricky. The P320 is a balance between weight and power with it being lighter than the 4-five .45 acp pistols with roughly the same accuracy, though packing less of a punch being chambered in 9 mm.\n\nWeapons:\n\nPistols:\n- P320 9…",
  "temTutorial": true
 },
 "3038594789": {
  "nome": "SF Gear",
  "cat": "mod",
  "tam": "1.9 GB",
  "img": "https://images.steamusercontent.com/ugc/2101549397282569011/FB48E81AF3BD11BC3C694E7E1B7A6976BF307D5B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment"
  ],
  "deps": [],
  "resumo": "We do not declare that we own the Mods, we just include the Mods that the server wants to play. Thank you to the owner for making it.\n\nadded\n- SF Helmet\n- Viking Vest\n- Viking Backpack\n- Cigarette & Animation ( Cigar & Cigarette In Facewear,Cig Pack In Magazines )\n- IFF Strobe ( In Grenades )\n\nUpdateed 1/10/2023\n\nAdjusted helmet stats to make them more reasonable Adjusted all equipmentl stats\n\n- Adjusted Cap\n- Adjusted Helmet\n-…",
  "temTutorial": false,
  "guia": "We do not declare that we own the Mods, we just include the Mods that the server wants to play. Thank you to the owner for making it.\n\nadded\n- SF Helmet\n- Viking Vest\n- Viking Backpack\n- Cigarette & Animation ( Cigar & Cigarette In Facewear,Cig Pack In Magazines )\n- IFF Strobe ( In Grenades )\n\nUpdateed 1/10/2023\n\nAdjusted helmet stats to make them more reasonable Adjusted all equipmentl stats\n\n- Adjusted Cap\n- Adjusted Helmet\n- Adjusted Vest\n\nTo make it look reasonable"
 },
 "3042013497": {
  "nome": "First Steps [SP][Coop-5]",
  "cat": "cenario",
  "tam": "359 KB",
  "img": "https://images.steamusercontent.com/ugc/2068898047217024821/A6943DFAC3A01F29B6D83022D55E808167CE32CD/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nRoughly eight hours ago, a CIA asset and informant embedded deep withing Chedaki structures has gone silent. After CDF Intelligence Teams have intercepted radio calls about an American mole, we believe him to be held somewhere in the western part of South Zagoria, probably near Zelenogorsk. While we do not know the end goal of the Chedaki rebels, we strongly believe they will move the informant somewhere even more remote or…",
  "temTutorial": false,
  "guia": "Situation\n\nRoughly eight hours ago, a CIA asset and informant embedded deep withing Chedaki structures has gone silent. After CDF Intelligence Teams have intercepted radio calls about an American mole, we believe him to be held somewhere in the western part of South Zagoria, probably near Zelenogorsk. While we do not know the end goal of the Chedaki rebels, we strongly believe they will move the informant somewhere even more remote or possible even into Russia proper.\nThat's why Razor Team of the 27th MEU will be the first American military unit to officially reach Chernarussian shores, move into the area, and rescue the hostage before escaping the area.\n\n Mission\n\nOur mission is easy: go in, rescue the hostage and escape without losing anybody. To achieve this, however, you first have to meet with allied NAPA guerillas who already scouted out the area and can tell you where the HVT is being held.\n\n Data\n\n• Difficulty: Easy/Medium*\n\n• Type Of Combat: MidRange\n\n• Playtime: 15-30min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI\n\nCallsign Razor 01"
 },
 "3044998814": {
  "nome": "Simple Weight Limit",
  "cat": "mod",
  "tam": "3 KB",
  "img": "https://images.steamusercontent.com/ugc/2094794225482456811/41A5F78720865BA239D2D80683443C66BECDBB64/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Super simple mod that limits movement speed based on weight, and designed to prevent players from carrying an enormous amount of items.\n\nAdds 2 CBA settings found under \"Weight Limit\", max and med weight, if the player goes over the med weight they can no longer sprint but can still jog, if they go over the max weight they cannot sprint or jog. Weights are in lbs.\n\nThis mod is ONLY needed on the server, clients do not need to have it…",
  "temTutorial": true
 },
 "3045129955": {
  "nome": "FPV Drone Crocus",
  "cat": "mod",
  "tam": "55 MB",
  "img": "https://images.steamusercontent.com/ugc/14390479270212528024/055AC0D556BFDDE0C958B56D4641711D1315F143/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "ATTENTION:\nThe mod authors firmly condemn the terrorist attack at Crocus City Hall and extend their condolences to the victims and the injured, along with the entire country. Please note that the mod is in no way related to recent events; it was named \"Crocus\" a long time ago.\n\nCrocus is a strike Unmanned Aerial Vehicle (UAV) with First-Person View (FPV) video transmission. Available in two modifications: AT (Anti-Tank) and AP…",
  "temTutorial": true
 },
 "3048337256": {
  "nome": "Into Enemy Territory [SP][Coop-5]",
  "cat": "cenario",
  "tam": "642 KB",
  "img": "https://images.steamusercontent.com/ugc/2068898681962679640/DAEA0A1BD569F224129CE9A256330EB03BE46FB4/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nThe northern mountain range and border region to Russia is firmly in Chedaki hand and barely any CDF airstrikes even went that far. Boots on the ground mostly consisted of local guerillas with a death wish - until now.\nThe CIA managed to find out who is behind the arrest and torture of their guy a few days ago and as it turns out, he's behind the same fate of pretty much any other foreignt national the Chedaki could get…",
  "temTutorial": false,
  "guia": "Situation\n\nThe northern mountain range and border region to Russia is firmly in Chedaki hand and barely any CDF airstrikes even went that far. Boots on the ground mostly consisted of local guerillas with a death wish - until now.\nThe CIA managed to find out who is behind the arrest and torture of their guy a few days ago and as it turns out, he's behind the same fate of pretty much any other foreignt national the Chedaki could get their hands on. In the same investigation they didn't just find his current hideout but also a hidden rebel supply depot.\nThat's why Razor Team of the 27th MEU will be moving behind enemy lines to destroy all Chedaki supplies and neutralize the head of rebel counter-intelligence.\n\n Mission\n\nOur mission is to destroy Chedaki supplies and neutralize the guy who is responsible for the arrest and torture of dozens of international aid workers as well as our CIA guy. After we've done that we have to secure the LZ and wait for a CDF bird to pick us up.\n\n Data\n\n• Difficulty: Easy/Medium*\n\n• Type Of Combat: MidRange\n\n• Playtime: 20-35min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI\n\nCallsign Razor 02\n\nCredit\n\nThanks to Devastator_cm for their convoy script"
 },
 "3087700723": {
  "nome": "AEW | Operator Helmet Expansion",
  "cat": "mod",
  "tam": "36 MB",
  "img": "https://images.steamusercontent.com/ugc/2205136466813458102/9E858EF15992BA88AEA9D611B0523ADB692AC0B8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Server",
   "Character",
   "Equipment",
   "Editor Extension"
  ],
  "deps": [],
  "resumo": "This mod expands upon the Operator Helmets from the Aegis mod by adding some exciting AEW additions: the camouflage pattern used by the New Altis Army (ALPAT), along with the inclusion of Greek Lizard patterns used by HAF and Myrimidones PMC variants. With this expansion, also comes a few custom configuration of the helmet like FAST and Light.\n\nFEATURES\n\n5 Operator Helmet variants in ALPAT, Greek Lizard, Greek Lizard-A  and Tan…",
  "temTutorial": true
 },
 "3100410156": {
  "nome": "121 Deployable Spotting Scope",
  "cat": "mod",
  "tam": "56 MB",
  "img": "https://images.steamusercontent.com/ugc/2310972238920060039/02DFB156DBEDDF5567C41637E9C57414826B6470/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "ace"
  ],
  "resumo": "Summary\n\nOriginally created for Task Force 121 to supplement the USASOC Sniper Rifles. This mod introduces an ACE deployable and adjustable spotting scope to Arma. The scope is based on the Leupold Mark 4 12-40x spotting scope with a Horus TREMOR4 reticle. Note that you will need BOTH spotting scope (in binocular slot) AND tripod (in misc items) to deploy spotting scope as a tripod!\n\nUsage\n\nFrom Arsenal\n- Add [121] Vortex Summit Carbon…",
  "temTutorial": true
 },
 "3100490558": {
  "nome": "NGA - Next Generation Armory",
  "cat": "mod",
  "tam": "545 MB",
  "img": "https://images.steamusercontent.com/ugc/2280572941434880404/98C5727350EC78FC7D75EA3A22316C48EC566886/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "ace"
  ],
  "resumo": "Next Generation Armory\n\nNext Generation Armory is a project originally started by SonicJohnBH, with the intent to add all of the candidates from the NGSW program for the US Army.\nAfter months of procrastination, and busy schedules preventing myself (Pred) and SonicJohnBH from continuing work, this is the re-release of the mod, with many fixes that were done, but pushes never released.\n\nThis mod currently only contains the winning…",
  "temTutorial": true
 },
 "3132553286": {
  "nome": "[FACTION] US Army 2027",
  "cat": "mod",
  "tam": "12 MB",
  "img": "https://images.steamusercontent.com/ugc/2459606329271739393/5DC5946C5EF86460DB40B73A0A0EF11A6C31C387/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Character",
   "Equipment"
  ],
  "deps": [
   "CBA_A3",
   "ace",
   "RHSUSAF",
   "Simpel's MilGP Retextures",
   "NGA - Next Generation Armory",
   "Integrated Visual Augmentation System (IVAS) Headset",
   "USP Gear - Core",
   "USP Gear - IHPS",
   "SPS Weapons V2",
   "JCA - P320",
   "Moe Pilot Gear Suite",
   "Project - Future Vertical Lift",
   "Project - FVL Ace3 Compatibility"
  ],
  "resumo": "A complete set of 3 faction variants of US Army soldiers from the year 2025+, equipped with Next Generation Army equipment, such as the M7 SPEAR Rifle, IVAS Headset, IHPS Helmet, and many other upgraded goods.\n\n GENERAL DESCRIPTION:\n\nAs the US Army steps into the Next Generation in the 2020s, new and upgraded equipment begins to appear in the hands of the G.I. Notably, the new service rifle, the  SIG M7 SPEAR  an upgraded, awesome new…",
  "temTutorial": true
 },
 "3147473073": {
  "nome": "TOTT Core",
  "cat": "mod",
  "tam": "403 MB",
  "img": "https://images.steamusercontent.com/ugc/24304572090506779/CE8DF53BA6CFC7A39B8476099C1750B6126919B1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "RHSUSAF"
  ],
  "resumo": "TOTT\n\n   Tools of The Trade is a mod that aims to provide authentic and accurate depictions of various rifles and weapons used by components of JSOC. All depictions are made using insider knowledge, countless reference images and hours of research and testing. For more info join the Discord.\n\nIf for some reason you couldn't figure out how to click on the image, here's the link: discord.gg/cvbSSJ9QbF\n\nContent\n\nCore Functions\nCore Assets…",
  "temTutorial": true
 },
 "3147476552": {
  "nome": "TOTT Optics",
  "cat": "mod",
  "tam": "648 MB",
  "img": "https://images.steamusercontent.com/ugc/24304572090510233/A5FC23479ECF0D19636BA6D898B137690AA4FDA3/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "TOTT\n\n   Tools of The Trade is a mod that aims to provide authentic and accurate depictions of various rifles and weapons used by components of JSOC. All depictions are made using insider knowledge, countless reference images and hours of research and testing. For more info join the Discord.\n\nIf for some reason you couldn't figure out how to click on the image, here's the link: discord.gg/cvbSSJ9QbF\n\nContent\n\nAimpoint T2 with Assorted…",
  "temTutorial": true
 },
 "3147482833": {
  "nome": "TOTT AiO",
  "cat": "mod",
  "tam": "1.4 GB",
  "img": "https://images.steamusercontent.com/ugc/24304572090517012/377776E9A4680BAEFEDABCCD2383765558F09C2E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "RHSUSAF"
  ],
  "resumo": "TOTT\n\n   Tools of The Trade is a mod that aims to provide authentic and accurate depictions of various rifles and weapons used by components of JSOC. All depictions are made using insider knowledge, countless reference images and hours of research and testing. For more info join the Discord.\n\nIf for some reason you couldn't figure out how to click on the image, here's the link: discord.gg/cvbSSJ9QbF\n\nContent\n\n TOTT Core\n TOTT Optics…",
  "temTutorial": true
 },
 "3153893342": {
  "nome": "Drone Down [SP][Coop-5]",
  "cat": "cenario",
  "tam": "541 KB",
  "img": "https://images.steamusercontent.com/ugc/2323362844679420109/06F39DF5B3B6E2716CFD75CE1C320F263DCE4684/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nAn American drone was looking at the Chedaki-held Krasnostav Airbase and got shot down earlier. Due to the top secret nature of  the current US-involvement (which is not happening, at least officially), destroying the wreck and removing the local backup drive has highest priority.\nThat's why Razor Team of the 27th MEU will be moving behind enemy lines to find the crash site, clear it and cover all tracks of direct…",
  "temTutorial": false,
  "guia": "Situation\n\nAn American drone was looking at the Chedaki-held Krasnostav Airbase and got shot down earlier. Due to the top secret nature of  the current US-involvement (which is not happening, at least officially), destroying the wreck and removing the local backup drive has highest priority.\nThat's why Razor Team of the 27th MEU will be moving behind enemy lines to find the crash site, clear it and cover all tracks of direct US-involvement in the Chernarussian Civil War.\n\n Mission\n\nOur mission is to find the crashed drone and remove the local backup drive before Russian special forces can do the same. While not our planned main task, we are in Chedaki heartlands and might find a few chances to suprise the enemy...\n\n Data\n\n• Difficulty: Easy/Medium*\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 20-45min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI\n\nCallsign Razor 03"
 },
 "3155812911": {
  "nome": "When It Rains It Pours [SP][Coop-5]",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/2323363479522541694/2DF9186069A07553E44D9EB0EDCB75B0F6918270/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nSince we cleaned up the area two weeks ago, when we were resucing the informant, this region was pretty safe, except for a Chedaki garrison at the dam, who mostly stayed for themselves. Neither the insurgents nor the NAPA or CDF fighters really engaged each other at that time. But as it seems, this informal truce was not meant to last - we received a distress call from NAPA guerillas near Zelenogorsk. They sounded like they…",
  "temTutorial": false,
  "guia": "Situation\n\nSince we cleaned up the area two weeks ago, when we were resucing the informant, this region was pretty safe, except for a Chedaki garrison at the dam, who mostly stayed for themselves. Neither the insurgents nor the NAPA or CDF fighters really engaged each other at that time. But as it seems, this informal truce was not meant to last - we received a distress call from NAPA guerillas near Zelenogorsk. They sounded like they were in big trouble, and asked us to help them as fast as we could.\n\n Mission\n\nOur mission is simple: meet the NAPA fighters at their hideout, find out what's wrong and offer to assist as good as we can.\n\n Data\n\n• Difficulty: Easy/Medium*\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-25min, shorter but more story-driven\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI\n\nCallsign Razor 04\n\nalso gave the callsign razor collection page a small overhaul"
 },
 "3159553804": {
  "nome": "War Welcome [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2323363479565241499/CD34D6A577F4C7C667964D78A68957D9F1C1DC0A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nRecent satellite and drone pictures have confirmed what many already thought: to anticipate our looming invasion, Chedaki insurgents have concentrated further inland, leaving installations and towns near or at the coast only lightly guarded. The port town of Berezino is only guarded by a single platoon. For this reason, Colonel Armstrong has decided that the best course of action is a quick heliborne insertion of Task Force…",
  "temTutorial": false,
  "guia": "Situation\n\nRecent satellite and drone pictures have confirmed what many already thought: to anticipate our looming invasion, Chedaki insurgents have concentrated further inland, leaving installations and towns near or at the coast only lightly guarded. The port town of Berezino is only guarded by a single platoon. For this reason, Colonel Armstrong has decided that the best course of action is a quick heliborne insertion of Task Force 21 to secure the area and prepare the landing of armored and motorized reinforcements.\n\nBut for this to happen, we have do to some preparations...\n\n Mission\n\nThe Chedaki-held port town of Berezino is only lightly guarded, but the enemy still has two defensive positions on the beach. To prepare for the insertion of Task Force 21, we have to clear out both defensive sites and neutralize an enemy commander who is currently not far away from our location. As soon as TF21 has been inserted into the region, we are tasked with supporting them in their offensive operations. \n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange/Long-ish Range\n\n• Playtime: 20-40min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI\n\nCallsign Razor 05"
 },
 "3165549156": {
  "nome": "Backroads [SP][Coop-5]",
  "cat": "cenario",
  "tam": "746 KB",
  "img": "https://images.steamusercontent.com/ugc/2460724535534795723/EAB69089DAD13B073ECEF4EA602EF359C18C824E/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nTask Forces 21 and 22 managed to secure Berezino and Krasnostav. But the area between those towns is still an insurgent territory. This is why Command has designated Routes 16 and 17. 16 is the well-kept main road, and 17 is the hidden backroad. Both are connecting the port of Berezino to the airbase in Krasnostav and are high-probability targets for Chedaki ambushes and IEDs. \n\nThis is why both roads are to be patrolled at…",
  "temTutorial": false,
  "guia": "Situation\n\nTask Forces 21 and 22 managed to secure Berezino and Krasnostav. But the area between those towns is still an insurgent territory. This is why Command has designated Routes 16 and 17. 16 is the well-kept main road, and 17 is the hidden backroad. Both are connecting the port of Berezino to the airbase in Krasnostav and are high-probability targets for Chedaki ambushes and IEDs. \n\nThis is why both roads are to be patrolled at regular intervals, but right now, a Marine squad is kept busy because of Chedaki prisoners. We have volunteered to patrol along Route 17 instead.\n\n Mission\n\nOur mission is to meet up with the Marine squad and talk to the soldier in charge. After that, we have to walk alon Route 17 (through WP 1 to 9) until we reach Krasnostav Airbase. There we have to talk to Logistics Officer Wright and offer assistance if needed.\n\n Data\n\n• Difficulty: Easy*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 20-40min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 06 | I'm not 100% happy with this mission myself but I already started over twice, so yeah, this is good enough"
 },
 "3170686732": {
  "nome": "Guardian Angels [SP][Coop-5]",
  "cat": "cenario",
  "tam": "856 KB",
  "img": "https://images.steamusercontent.com/ugc/2437081273410374299/A301C901F69B2C4234A118CAF682BA670571720D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nUS Marines are attacking the industrial and military hub of Zelenogorsk, which is currently held by Chedaki insurgents. However, an AH-1Z Viper got shot down over enemy territory not too far away from the battle, but regular Marine units can't spare anyone for SAR operations.\n\nLuckily, Razor Team was conducting anti-guerilla operations not too far from the crash site and has been ordered to secure the wreck and search for…",
  "temTutorial": false,
  "guia": "Situation\n\nUS Marines are attacking the industrial and military hub of Zelenogorsk, which is currently held by Chedaki insurgents. However, an AH-1Z Viper got shot down over enemy territory not too far away from the battle, but regular Marine units can't spare anyone for SAR operations.\n\nLuckily, Razor Team was conducting anti-guerilla operations not too far from the crash site and has been ordered to secure the wreck and search for both pilots.\n\n Mission\n\nOur mission is to clear the village of Drozhino, secure the wreck, and search for any signs of the pilot and co-pilot. \n\n Data\n\n• Difficulty: Easy*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 20-30min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 07 | I had to start over and change pretty much everything about this mission >SIX< times. I pray to god this'll work and won't suck"
 },
 "3171940465": {
  "nome": "Callsign Saber [SP][Coop-5]",
  "cat": "cenario",
  "tam": "968 KB",
  "img": "https://images.steamusercontent.com/ugc/2437081273420606730/6E7EAD619697614B78EC6290F0D27BD2FB754C24/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nSaber Team, another Force Recon squad, has been active behind enemy lines ever since the invasion started. Tonight they were tasked with destroying artillery that has been pounding the frontlint as well as finding the source of a weird radio signal that has been intercepted.\n\nHowever, half an hour ago, they called for backup against well-equipped and numerically superior Chedaki forces - a few minutes later, they went radio…",
  "temTutorial": false,
  "guia": "Situation\n\nSaber Team, another Force Recon squad, has been active behind enemy lines ever since the invasion started. Tonight they were tasked with destroying artillery that has been pounding the frontlint as well as finding the source of a weird radio signal that has been intercepted.\n\nHowever, half an hour ago, they called for backup against well-equipped and numerically superior Chedaki forces - a few minutes later, they went radio silent.\n\n Mission\n\nOur mission is to check out the friendly camp to see if we can find any clues as to their whereabouts. If we can't find anything, we have to move to Saber's last known position near the old lodge in western Bogtyrka. After finding and assisting the squad, we are tasked with finishing their mission and finding the source of the radio signal. \n\n Data\n\n• Difficulty: Easy*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 20-25min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 08 | yes I know I mixed up UK and US english. sue me"
 },
 "3172727094": {
  "nome": "Operation Shieldbreaker [SP][Coop-5]",
  "cat": "cenario",
  "tam": "740 KB",
  "img": "https://images.steamusercontent.com/ugc/2437081273427189269/37FC92DBC40461FCF24F3F236D77C5EA133A1D77/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nAs joint US-CDF units prepare their last push towards the Chedaki main base at the Northwestern Airfield, there are still many insurgent-held towns and villages forming a ring around the headquarters. However, before those can be attacked and secured, many (more or less hidden) defensive positions have to be cleared.\n\n Mission\n\nRazor Team is tasked with clearing multiple defensive positions in and around the Chedaki-held…",
  "temTutorial": false,
  "guia": "Situation\n\nAs joint US-CDF units prepare their last push towards the Chedaki main base at the Northwestern Airfield, there are still many insurgent-held towns and villages forming a ring around the headquarters. However, before those can be attacked and secured, many (more or less hidden) defensive positions have to be cleared.\n\n Mission\n\nRazor Team is tasked with clearing multiple defensive positions in and around the Chedaki-held town of Stary Sobor.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 25-45min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 09"
 },
 "3173740364": {
  "nome": "Endgame [SP][Coop-5]",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/2437081273437948377/8F8A8C9A4A655A658E1A7664C67462CDB10EDAD5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nA few hours ago, a Chedaki commander crossed the border back into Chernarus. We believe he will be leading the negotiations with the Novigrad government, as he is one of their more moderate commanders. He did not only criticize Moscow for its maneuvers and pouring oil on the fire, but he also openly stated his disgust with Chedaki war crimes.\n\nDespite his (more or less) clean record, he's still a wanted man as well as…",
  "temTutorial": false,
  "guia": "Situation\n\nA few hours ago, a Chedaki commander crossed the border back into Chernarus. We believe he will be leading the negotiations with the Novigrad government, as he is one of their more moderate commanders. He did not only criticize Moscow for its maneuvers and pouring oil on the fire, but he also openly stated his disgust with Chedaki war crimes.\n\nDespite his (more or less) clean record, he's still a wanted man as well as commander of an enemy fighting force and terrorist organization. Novigrad and Washington both want him taken alive to be brought back for questioning and his looming trial. \n\n Mission\n\nRazor Team is tasked with clearing an enemy lookout before they move to the last known position of the HVT at Kamensk Military Base. There they have to secure the area, find and arrest the commander, and bring him back to base. \n\nOptionally, there is a Chedaki comms site not too far away from the base itself. Sabotaging enemy communications will deny them the chance to call in reinforcements. \n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 25-45min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 10 | gotta wait for the Tigr in the next CUPdate. sorry guys"
 },
 "3210449198": {
  "nome": "Against Time [SP][Coop-5]",
  "cat": "cenario",
  "tam": "1003 KB",
  "img": "https://images.steamusercontent.com/ugc/2483245701713449707/9657949C6B98A1297021C20E2BBE3F67E2AD2B5F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nRussian forces have crossed the border. No radio contact with any friendly units. Tracers light up the sky. Enemy patrols made us crawl through grass and brush. Situation: FUBAR.\n\n Mission\n\nRazor Team has to move back to Krasnostav Airbase to reunite with friendly forces to find out what happened and - if needed - leave Chernarus behind.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 20-30min\n\n•…",
  "temTutorial": false,
  "guia": "Situation\n\nRussian forces have crossed the border. No radio contact with any friendly units. Tracers light up the sky. Enemy patrols made us crawl through grass and brush. Situation: FUBAR.\n\n Mission\n\nRazor Team has to move back to Krasnostav Airbase to reunite with friendly forces to find out what happened and - if needed - leave Chernarus behind.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 20-30min\n\n• Factions: Razor Team (USMC) vs Chedaki\n\n• Players: SP/ Coop-5\n\n• Revive: Vanilla Revive w/ Medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 11 | guess whos back. back again"
 },
 "3239072023": {
  "nome": "Poking The Bear [SP][Coop-5]",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/2479871171892616878/A575965811D1243AE80CA3D22DAC054A6A56F9B5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nAfter escaping from the north, you were offered to join a local NAPA cell at their headquarters at Rog Castle. From there, you talked to Baseplate, and it was decided that you'd, while officially MIA/KIA, would stay behind and advise as well as join NAPA guerillas in their fight against Russian occupiers.\n\n Mission\n\nYou're tasked with helping out NAPA fighters in their new guerilla war against Russian forces, who had invaded…",
  "temTutorial": false,
  "guia": "Situation\n\nAfter escaping from the north, you were offered to join a local NAPA cell at their headquarters at Rog Castle. From there, you talked to Baseplate, and it was decided that you'd, while officially MIA/KIA, would stay behind and advise as well as join NAPA guerillas in their fight against Russian occupiers.\n\n Mission\n\nYou're tasked with helping out NAPA fighters in their new guerilla war against Russian forces, who had invaded South Zagoria just a day prior.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 30-60min\n\n• Factions: Razor Team (NAPA) vs Chedaki & Russian Armed Forces\n\n• Players: SP/ Coop-5\n\n• Revive: Medic can vanilla revive w/ medkit In COOP\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 12 | all hail the watcher of staroye"
 },
 "3256534418": {
  "nome": "Trencher - Eden Trench Generation",
  "cat": "terreno",
  "tam": "166 KB",
  "img": "https://images.steamusercontent.com/ugc/2495640378556985345/F908707BE0787FA9E39697DED6BEC75D69036BA7/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Terrain",
   "Mechanics",
   "Structure",
   "Editor Extension"
  ],
  "deps": [
   "CBA_A3",
   "Chameleon Trenches",
   "Terrain Lib"
  ],
  "resumo": "Trencher\n\nModule-based trench generation.\n\nYou must save the mission for trench modifications to show up in-game.\n\nThe server and client both need this mod and its dependencies for it to work.\n\nFEATURES:\n\n- Create trenches of any depth and width, with lots of configuration options\n- AI can navigate and garrison trenches\n- Optionally add reinforcement to the trench walls, sandbags, dragons teeth and barbed wire\n- Use area-based module…",
  "temTutorial": true
 },
 "3267596179": {
  "nome": "Hunted/Hunter [SP][Coop-5]",
  "cat": "cenario",
  "tam": "759 KB",
  "img": "https://images.steamusercontent.com/ugc/2462986661271638065/3994C0BF51561EA7133FED3B7C66353A14319DFE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nAfter disrupting Russian operations in the area, things stayed calm for a while, but over night, Russian planes and helicopters started to patrol the area around the NAPA main base at Rog Castle. Razor Team was sent out to patrol the woods to the east to look for any signs of a Russian assault on the base.\n\nThe patrol itself was quiet and without anything noteworthy; on their way back, however, they saw smoke rising over the…",
  "temTutorial": false,
  "guia": "Situation\n\nAfter disrupting Russian operations in the area, things stayed calm for a while, but over night, Russian planes and helicopters started to patrol the area around the NAPA main base at Rog Castle. Razor Team was sent out to patrol the woods to the east to look for any signs of a Russian assault on the base.\n\nThe patrol itself was quiet and without anything noteworthy; on their way back, however, they saw smoke rising over the castle...\n\n Mission\n\nMove back to your patrol base, try to reach somebody at Rog, and find out what's going on.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 40-60min\n\n• Factions: Razor Team (NAPA) vs Chedaki & Russian Armed Forces\n\n• Players: SP/ Coop-5\n\n Thanks to\n\nTova for their convoy script https://forums.bohemia.net/forums/topic/226608-simple-convoy-script-release/ and to onestar for beta testing\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 13 | the AI convoy might be a bit buggy"
 },
 "3270456437": {
  "nome": "Information Game [SP][Coop-5]",
  "cat": "cenario",
  "tam": "534 KB",
  "img": "https://images.steamusercontent.com/ugc/2457357698621879389/F4845D9C4244F7FE2CCFACDE2A412BA08B8157F0/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nA Russian soldier who is growing disillusioned with the war effort wants to meet Razor Team to discuss the location of intel that might change to course of the war. \n\n Mission\n\nMeet the informant, retrieve all documents and bring them to a CIA contact.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 30-45min\n\n• Factions: Razor Team (NAPA) vs Chedaki & Russian Armed Forces\n\n• Players: SP/ Coop-5\n\n*…",
  "temTutorial": false,
  "guia": "Situation\n\nA Russian soldier who is growing disillusioned with the war effort wants to meet Razor Team to discuss the location of intel that might change to course of the war. \n\n Mission\n\nMeet the informant, retrieve all documents and bring them to a CIA contact.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 30-45min\n\n• Factions: Razor Team (NAPA) vs Chedaki & Russian Armed Forces\n\n• Players: SP/ Coop-5\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 14 | one more to go"
 },
 "3277283940": {
  "nome": "[EKS] AI Artillery System",
  "cat": "composicao",
  "tam": "4 KB",
  "img": "https://images.steamusercontent.com/ugc/2501268517186164726/23EC61A3F0235AAC2BF44FB91D0F0270B94079D5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Artillery"
  ],
  "deps": [],
  "resumo": "scripts are fully compatible with Public Zeus servers on the Game Master slot.\n\nThis script allows AI Artillery to fire autonomously. Artillery units will now act properly and provide support to the battlefield just how they would in real life. Forward Observers (FO's) will even order danger close missions if they're about to be overrun and destroyed.\n\n- Forward Observers will now call artillery strikes on enemy positions that they are…",
  "temTutorial": false,
  "guia": "scripts are fully compatible with Public Zeus servers on the Game Master slot.\n\nThis script allows AI Artillery to fire autonomously. Artillery units will now act properly and provide support to the battlefield just how they would in real life. Forward Observers (FO's) will even order danger close missions if they're about to be overrun and destroyed.\n\n- Forward Observers will now call artillery strikes on enemy positions that they are aware of.\n- FO's will use artillery assets that are part of their team within range (Mortars won't fire at extreme distances, just like Rocket Artillery won't fire at extremely close ones!)\n- Compatible with all vanilla Artillery units (Mortars, SPGs, MLRs).\n- Basic RHS Support (See below the supported vehicle roster)\n\nHow to use:\n\n1. Place down the composition on any infantry unit, turning it into a Forward Observer.\n2. Place down any artillery unit.\n3. Make the Forward Observer engage any hostiles.\n\nSupported Stationary Artillery:\n\n- Mk6 Mortar (All Sides)\n- MK41 VLS\n\nSupported Mobile Artillery Roster:\n\nArtillery accuracy is determined by how much the Forward Observer knows about you. If his information is minimal, then the artillery will hit you in the radius of 125m. If his information is full, then the artillery will hit you in the radius of 25m. And everything in between."
 },
 "3277439226": {
  "nome": "Loose Ends [SP][Coop-5]",
  "cat": "cenario",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/2513653416209837034/2131262B1EDEB4AB3A395C5A90FF459AA06B4B3A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "OtherMap"
  ],
  "deps": [],
  "resumo": "Situation\n\nMoscow changed its tune: from denying all allegations regarding the invasion of South Zagoria, they switched over to calling it an \"illegal operation by rouge elements\". But according to our intelligence reports, that's an elaborate ruse: they deny all involvement in the ongoing war and argue that they cannot stop the aggression, yet they keep on secretly supporting the so-called rouge general and his underlings.\nHowever,…",
  "temTutorial": false,
  "guia": "Situation\n\nMoscow changed its tune: from denying all allegations regarding the invasion of South Zagoria, they switched over to calling it an \"illegal operation by rouge elements\". But according to our intelligence reports, that's an elaborate ruse: they deny all involvement in the ongoing war and argue that they cannot stop the aggression, yet they keep on secretly supporting the so-called rouge general and his underlings.\nHowever, this allowed us to declare all Russian army personnel inside Chernarus members of a terrorist organization, as well as restart our weapon shipments, intelligence sharing, and air support against hardened targets. Thus, NAPA and CDF forces managed to gain the upper hand and are about to push the aggressor back behind the border.\n\n Mission\n\nWe have to take out Colonel Malyukov, the so-called \"rouge general\" acting without orders from Moscow. Because once he is out of the picture, the Kremlin has no more hand to play but to stop reinforcing their presence inside Chernarus.\n\nBesides neutralizing the HVT (Codename: Jester), we also have to retrieve the \"Cobalt Dossier\" - a collection of files ranging from the planning stage of the invasion up to the names of involved commanders.\n\n Data\n\n• Difficulty: Medium*\n\n• Type Of Combat: CQB/MidRange\n\n• Playtime: 25-45min\n\n• Factions: Razor Team (NAPA) vs Russian Armed Forces\n\n• Players: SP/ Coop-5\n\n• Bonus: different ending depending on how well you do\n\n* you will receive less damage than you normaly would because I wanted to make the loadout as faithful to Arma 2 Razor as I could, but that'd mean getting one-tapped by AI.\n\nthis mission is not meant to be played with any other mods like ACE, AI mods, etc. Use those at your own risk\n\nCallsign Razor 15 | i dont want to set the world on fire"
 },
 "3289908126": {
  "nome": "Night Shift [SP][Coop-5]",
  "cat": "cenario",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/2511402976544312335/AFE7EA6EBD5B66A0D8C9619B7282DB27381FEDD3/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nAs the situation on Altis grows more dire, the government in Pyrgos keeps downplaying the situation. But despite all efforts to ignore the crisis, more and more AAF soldiers and Altian policemen leave their posts to join the pro-CSAT protests all around the country. However, they are taking comrades as well as equipment with them, which allows the resistance to arm itself while also sharpening its rhetoric against the Pyrgos…",
  "temTutorial": false,
  "guia": "Situation\n\nAs the situation on Altis grows more dire, the government in Pyrgos keeps downplaying the situation. But despite all efforts to ignore the crisis, more and more AAF soldiers and Altian policemen leave their posts to join the pro-CSAT protests all around the country. However, they are taking comrades as well as equipment with them, which allows the resistance to arm itself while also sharpening its rhetoric against the Pyrgos government.\n\nFor this reason, the British MoD has given green light to an SAS team to keep an eye on the situation and intervene if needed...\n\n Mission\n\nSAS squad \"Lancer\" is tasked with neutralizing a former AAF officer who turned into an arms dealer. After he's taken care of, the team has to find all the weapon crates in his hideout and report them to headquarters before being transported back to the HMS Elizabeth. \n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-25min\n\n• Factions: SAS vs AAF Deserters"
 },
 "3297140142": {
  "nome": "Supply Run [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2478752882688817927/8927C1014796E59217C57CF03801245ADD7C0AC6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nWestern intelligence reports and influence have talked the government in Pyrgos into increasing police and army activity against all protestors and in protest-heavy regions. After we banded together under the banner of the 'Freedom and Indepence Army', the Altis Armed Forces (AAF) increased their armed patrols through woods and villages to find our campsites. They arrested hundreds, put a curfew in effect, and declared the…",
  "temTutorial": false,
  "guia": "Situation\n\nWestern intelligence reports and influence have talked the government in Pyrgos into increasing police and army activity against all protestors and in protest-heavy regions. After we banded together under the banner of the 'Freedom and Indepence Army', the Altis Armed Forces (AAF) increased their armed patrols through woods and villages to find our campsites. They arrested hundreds, put a curfew in effect, and declared the area around the parliament as a military zone. This leaves us no other choice than to go into the offensive and strike back. Either we will create a new and brighter future for our country, or we will die trying.\n\nBut since our main supplier got taken out by our former colonial master, who is using Pyrgos as its lapdog, we have to find other ways to get supplies and need to strike at the source - the armories of the AAF. \n\n Mission\n\nWe have to clear an AAF-held village and roadblock before we can advance towards a newly constructed base. There, we have to clear the FOB and load all supplies into a truck before bringing them to the meeting point.\n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-25min\n\n• Factions: FIA vs AAF\n\nAI mods, ACE, etc. might break the mission."
 },
 "3303386235": {
  "nome": "A New Threat [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2478753516687095734/70BF5A52AA1E1D4394C3AFF1466713AF70833051/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nFIA guerillas managed to capture Oreokastro and consolidate their power over the rural northwest of the island. There, they held out against AAF counterattacks and managed to evade Altian special forces patrolling the woods. But unlike many experts believed, they never strayed too far outside those areas. only ambushing army convoys at the fringes of their territory a few times. \n\nBut over the last few days, there have been…",
  "temTutorial": false,
  "guia": "Situation\n\nFIA guerillas managed to capture Oreokastro and consolidate their power over the rural northwest of the island. There, they held out against AAF counterattacks and managed to evade Altian special forces patrolling the woods. But unlike many experts believed, they never strayed too far outside those areas. only ambushing army convoys at the fringes of their territory a few times. \n\nBut over the last few days, there have been more and more reports of guerilla activity way outside the FIA-controlled areas. Altian police, stretched too thin with guarding strategic locations and administrative buildings, have asked the army for help to patrol the area and investigate some of those reports.\n\n Mission\n\nWe (Gamma Squad) are tasked with patrolling areas in southern Altis to follow up on alleged FIA sightings. For that we have to recon the AO and investiage: a reported campsite, an old warehouse, and two farms. \n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 10-20min\n\n• Factions: AAF vs FIA\n\nAI mods, ACE, etc. might break the mission."
 },
 "3311558427": {
  "nome": "HEMTT - Deployable Defender",
  "cat": "composicao",
  "tam": "6 KB",
  "img": "https://images.steamusercontent.com/ugc/2413452682801926613/0D6898CCB0A51F1140928D32F3856E05615850EF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Apex",
   "AntiAir",
   "Communications",
   "Emplacement"
  ],
  "deps": [],
  "resumo": "HEMTT w/ Deployable MIM-145 Defender\n\nHeavy Expanded Mobility Tactical Truck w/ Deployable MIM-145 Defender\n\nPart of a bigger mod I'm working on, but I believe the workshop needs this. Enjoy.\nComes in Sand and Olive variants.\n\nFits perfectly in combination with HEMTT - Deployable Radar!\n\nThis composition has no crew, it's empty. However, here's one with the UAV Operator inside!\n\nHOW TO USE:\nSTEP 1. - Get out of the damn vehicle. Deploy…",
  "temTutorial": false,
  "guia": "HEMTT w/ Deployable MIM-145 Defender\n\nHeavy Expanded Mobility Tactical Truck w/ Deployable MIM-145 Defender\n\nPart of a bigger mod I'm working on, but I believe the workshop needs this. Enjoy.\nComes in Sand and Olive variants.\n\nFits perfectly in combination with HEMTT - Deployable Radar!\n\nThis composition has no crew, it's empty. However, here's one with the UAV Operator inside!\n\nHOW TO USE:\nSTEP 1. - Get out of the damn vehicle. Deploy the MIM-145 Defender. When deploying, make sure the clear the 10m radius around the back of the vehicle and make sure HEMTT is not manned.\nSTEP 2. - Once deployed, hack it and use it at will. Meanwhile all HEMTT seats are removed until you deactivate the SAM. This is to prevent the misuse of the composition and taking advantage of it.\nSTEP 3.1. - When you're done using it, deactivate it and all seats will then be unlocked.\nSTEP 3.2. - When you need to use it, activate it again. HEMTT seats are locked again, Defender is ready to use, but you need to hack it again.\n\nHOW TO REARM/REPAIR:\nSTEP 1. Park the rearm/repair vehicle near the deployed Defender.\nSTEP 2. Take control of the Defender and point to the truck. Interact with it to rearm/repair.\n\nDescription:\nA composition which enhances the already lacking vanilla content, this one in particular makes use of HEMTT in combination with MIM-145 Defender trailer. We all know that towing vehicles in vanilla ArmA 3 is not possible, so I added 3 user actions that add the ability to drive the HEMTT where you need to and deploy the Defender.\n\nYou only need to deploy the Defender once, then there's nothing more you can do with that user action. After that, there's only deactivate and activate user actions.\n\nThe composition consists of vanilla assets, uses the vehicle's init field to execute scripts. No need for any special attention when placing this composition in either editor or Zeus. Simple place and use.\n\nWorks flawlessly in singleplayer and missions in general, however... for multiplayer pu"
 },
 "3311578760": {
  "nome": "HEMTT - Deployable Radar",
  "cat": "composicao",
  "tam": "6 KB",
  "img": "https://images.steamusercontent.com/ugc/2413452682802088831/D3FDBC5D57BF8C0C236389A4BD3B834D90A899A4/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Apex"
  ],
  "deps": [],
  "resumo": "HEMTT w/ Deployable AN/MPQ-105 Radar\n\nHeavy Expanded Mobility Tactical Truck w/ Deployable AN/MPQ-105 Radar\n\nPart of a bigger mod I'm working on, but I believe the workshop needs it. Enjoy.\nComes in Sand and Olive variants.\n\nFits perfectly in combination with HEMTT - Deployable Defender!\n\nThis composition has no crew, it's empty. However, here's one with the UAV Operator inside!\n\nHOW TO USE:\nSTEP 1. - Get out of the damn vehicle.…",
  "temTutorial": false,
  "guia": "HEMTT w/ Deployable AN/MPQ-105 Radar\n\nHeavy Expanded Mobility Tactical Truck w/ Deployable AN/MPQ-105 Radar\n\nPart of a bigger mod I'm working on, but I believe the workshop needs it. Enjoy.\nComes in Sand and Olive variants.\n\nFits perfectly in combination with HEMTT - Deployable Defender!\n\nThis composition has no crew, it's empty. However, here's one with the UAV Operator inside!\n\nHOW TO USE:\nSTEP 1. - Get out of the damn vehicle. Deploy the AN/MPQ-105 Radar.\nSTEP 2. - Once deployed, hack it and use it at will. Meanwhile all HEMTT seats are removed until you deactivate the Radar. This is to prevent the misuse of the composition and taking advantage of it.\nSTEP 3.1. - When you're done using it, deactivate it and all seats will then be unlocked.\nSTEP 3.2. - When you need to use it, activate it again. HEMTT seats are locked again, Radar is ready to use, but you need to hack it again.\n\nHOW TO REPAIR:\nSTEP 1. Park the repair vehicle near the deployed Radar.\nSTEP 2. Take control of the Radar and point to the truck. Interact with it to repair it.\n\nDescription:\nA composition which enhances the already lacking vanilla content, this one in particular makes use of HEMTT in combination with AN/MPQ-105 Radar trailer. We all know that towing vehicles in vanilla ArmA 3 is not possible, so I added 3 user actions that add the ability to drive the HEMTT where you need to and deploy the AN/MPQ-105 Radar.\n\nYou only need to deploy the Radar once, then there's nothing more you can do with that user action. After that, there's only deactivate and activate user actions.\n\nThe composition consists of vanilla assets, uses the vehicle's init field to execute scripts. No need for any special attention when placing this composition in either editor or Zeus. Simple place and use.\n\nWorks flawlessly in singleplayer and missions in general, however... for multiplayer purposes you must include \" zeusCompositionScriptLevel = 2; \" in the description file of the dedicated server... or you can use the fol"
 },
 "3318806960": {
  "nome": "Persona Non Grata [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2390935750940097202/F6BDBAF0655D7252045A00ADA741498499C3F965/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nWith the FIA offensive starting and rioters breaking into the British embassy, the United States called all their diplomatic personnel back to the states. The ambassador was moved via motorcade, which was guarded by ION Inc. contractors, because the Marines were busy guarding the embassy itself until they could evacuate. \n\nThe convoy, however, never reached the International Airport and went silent only thirty minutes into…",
  "temTutorial": false,
  "guia": "Situation\n\nWith the FIA offensive starting and rioters breaking into the British embassy, the United States called all their diplomatic personnel back to the states. The ambassador was moved via motorcade, which was guarded by ION Inc. contractors, because the Marines were busy guarding the embassy itself until they could evacuate. \n\nThe convoy, however, never reached the International Airport and went silent only thirty minutes into the trip. An AAF helicopter has shown a possible ambush, but the ION Security Team on the ground decided to ignore those warnings and keep on moving...\n\n Mission\n\nYou are part of ION Extraction Team \"Firebird.\" You are tasked with securing the ambushed convoy as well as finding ambassador Dennis Crocker before moving him to safety.\n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-20min\n\n• Factions: ION vs AAF\n\nAI mods, ACE, etc. might break the mission."
 },
 "3323604819": {
  "nome": "LAFS - Light AI Fire Support",
  "cat": "mod",
  "tam": "391 KB",
  "img": "https://images.steamusercontent.com/ugc/61460041985324431/E71FF0ED3C56881DF807FFD954D6F852D3ED3211/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "FPV Drone Crocus"
  ],
  "resumo": "Light AI Fire Support is intended for giving the AI dynamic access to many weapons of war they previously couldn't use to increase their threat, provide a more enjoyable combat experience for players and to provide a fair system of fire support that avoids the pitfalls of manually triggering it. The Light refers to the load on the server, with this mod intended for use by bigger operations and units.\n\nVideo explaining LAFS\n\nLAFS Wiki,…",
  "temTutorial": true
 },
 "3328314886": {
  "nome": "Heavy Weapons Framework",
  "cat": "mod",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/58090453763581901/314953209B8C9F355AC3E9C9988BC59D43A5BBB6/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "This mod was a part of the Solar Auxilia mod for a while, but due to popular request I have made it into a completely standalone system.\n\nSo what does this mod do?\n\nThis mod adds specific animations to any weapon added to the CBA options or in the weapons config aswell, the main idea behind the mod is to restrict player movement with heavy weapons yet keep some mobility. When using a heavy weapon the player will be put into a special…",
  "temTutorial": true
 },
 "3336740643": {
  "nome": "Milsim Structures",
  "cat": "mod",
  "tam": "265 MB",
  "img": "https://images.steamusercontent.com/ugc/11512622348938522685/3AE7900EDF48FEB540E1116EA97A9FFE79AA6474/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Structure",
   "Editor Extension"
  ],
  "deps": [],
  "resumo": "Things in your environment looking too nice? Grey it up! Wanna do some cool LARPing? Throw these down! These are some bland military base-themed buildings WITH INTERIORS that I initially made for my Fort Johnson map, but now I've moved them to a standalone release here so I can use them in other maps and update them separately- and now you can use them too! Snapping on the wall pieces can be toggled on & off by turning the Translation…",
  "temTutorial": true
 },
 "3346427969": {
  "nome": "Hide Among The Grass - HATG",
  "cat": "mod",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/14158265354810508739/A08B6A5844F488C4B2D501AE8513B80A1AB91D44/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Hide Among The Grass (HATG) is a performance-focused solution to all things stealth.\n\nThis mod was originally designed as an alternative to ACSTG but we very quickly realised we could do more.\n\nYou will only be hidden when prone or crouched (and standing, if in a building). A variety of factors apply, such as enemies being close or what surface you are on. These can all be configured!\n\nOther AI mods should be compatible. This mod does…",
  "temTutorial": true
 },
 "3351167408": {
  "nome": "Razor's Edge [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2495648990697365478/179ECB89BAFB9167AA9E60DD169B8CADCD7D455D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nA group of high-ranking FIA leaders showed willingness to negotiate with the Altian army and political officials in Pyrgos to end the Civil War without more bloodshed. As a sign of goodwill, they have leaked the rough location where Ambassador Crocker is being held by fighters staying true to Gavras. This is why Razor Team has been dispatched to clear and search the area to find Crocker and bring him back to safety.…",
  "temTutorial": false,
  "guia": "Situation\n\nA group of high-ranking FIA leaders showed willingness to negotiate with the Altian army and political officials in Pyrgos to end the Civil War without more bloodshed. As a sign of goodwill, they have leaked the rough location where Ambassador Crocker is being held by fighters staying true to Gavras. This is why Razor Team has been dispatched to clear and search the area to find Crocker and bring him back to safety.\n\n Mission\n\nOur mission is to find Ambassador Crocker, who is currently held inside the AO, and bring him to the USS Nimitz\n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-25min\n\n• Factions: USMC vs FIA\n\nAI mods, ACE, etc. might break the mission."
 },
 "3351398245": {
  "nome": "Animated Corner Shooting",
  "cat": "mod",
  "tam": "1019 KB",
  "img": "https://images.steamusercontent.com/ugc/10683292272002862222/91D5DB5FB0D28FA7E5FE6AEA329171C4B7CD651F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3",
   "Animated Recoil coefficient changer"
  ],
  "resumo": "The mod implements a system of shooting blindly from behind cover.\n\nWeapon shifting works in all stances and positions.\n\nThe mod only works for players, not for AI.\n\nControl (can be changed in settings):\n\n• Shift + Q - weapon shift to the left\n\n• Shift + E - weapon shift to the right\n\n• CTRL + right mouse button - weapon shift up\n\nDouble clicking locks the position.…",
  "temTutorial": true
 },
 "3354581482": {
  "nome": "CV-22 Osprey",
  "cat": "mod",
  "tam": "133 MB",
  "img": "https://images.steamusercontent.com/ugc/16897676530333177915/80D48A8BE9236F9685BEA3B063750658F9D59AB0/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Plane",
   "Server"
  ],
  "deps": [],
  "resumo": "Systems Application Development Office presents:\n\nCV-22 Special Operations Osprey\n\nbased on the Deltagamer V-22 mod, modified to the CV-22 with several additional enhancements\n\nThe CV-22 Osprey is a tiltrotor aircraft employed by the US Air Force Special Operations Command (AFSOC) that combines the vertical takeoff, hover and vertical landing qualities of a helicopter with the long-range, fuel efficiency and speed characteristics of a…",
  "temTutorial": true
 },
 "3356778268": {
  "nome": "Ghost Town Gunfight [SP][Coop-5]",
  "cat": "cenario",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/2495649625447909508/A08FCDF2F0246D81AE1C7AE744793957A389ABDF/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "Altis"
  ],
  "deps": [],
  "resumo": "Situation\n\nCoalition airstrikes and AAF advances quickly overcame organized FIA resistance. What was left of the guerilla group fled into the northwestern mountain ranges. The former tourist village of Oreokastro quickly turned to the last stand of Gavras' last fighter as he took refuge there.\n\nWhile former FIA leaders met for peace talks, Gavras and his most loyal fighters ignored every ultimatum and kept on attacking AAF forces now…",
  "temTutorial": false,
  "guia": "Situation\n\nCoalition airstrikes and AAF advances quickly overcame organized FIA resistance. What was left of the guerilla group fled into the northwestern mountain ranges. The former tourist village of Oreokastro quickly turned to the last stand of Gavras' last fighter as he took refuge there.\n\nWhile former FIA leaders met for peace talks, Gavras and his most loyal fighters ignored every ultimatum and kept on attacking AAF forces now besieging the village. This is why Special Forces squad \"Apollo\" was dispatched. With their advanced training and tactics, they are tasked with capturing Gavras without turning the village into rubble even further.\n\n Mission\n\nYour mission is to find and apprehend Gavras.\n\n Data\n\n• Difficulty: Easy\n\n• Type Of Combat: MidRange/CQB\n\n• Playtime: 15-25min\n\n• Factions: AAF SF vs FIA"
 },
 "3365693392": {
  "nome": "Operation Tremor [SP]",
  "cat": "cenario",
  "tam": "4 MB",
  "img": "https://images.steamusercontent.com/ugc/51322921727272664/78478B43D7CD204408425A1B92E97226CA18A425/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "MarksmenDLC",
   "HelicoptersDLC",
   "Apex"
  ],
  "deps": [],
  "resumo": "Situation\n\nA few weeks ago, a regiment of CSAT paratroopers and a large number of cargo aircraft arrived at the Sefrou-Ramal airbase. Combined with that, (infrequent) earthquakes have started to hit the region, which is rather uncharacteristic for the area as a whole. At the same time, many construction projects began to pop out all over the desert. Most of them are simple fuel depots or outposts in remote areas, but one of those…",
  "temTutorial": false,
  "guia": "Situation\n\nA few weeks ago, a regiment of CSAT paratroopers and a large number of cargo aircraft arrived at the Sefrou-Ramal airbase. Combined with that, (infrequent) earthquakes have started to hit the region, which is rather uncharacteristic for the area as a whole. At the same time, many construction projects began to pop out all over the desert. Most of them are simple fuel depots or outposts in remote areas, but one of those projects looks different. Combined with tremors growing more frequent, analysts believe that CSAT is currently testing the so-called 'East Wind Device' somewhere in the region.\n\n Mission\n\nYour mission is to infiltrate remote CSAT/SFIA-held territory and find out what they are building at the construction site, which Headquarters believes will become a major testing site for the 'East Wind Device'.\nFor that, you have to clear out an outpost roughly a kilometer north of the site. This needs to be done so that the enemies present at the base won't be a problem later in the mission. Optionally, you can also disable enemy communications at this stage.\n\nAfter you have taken out all personnel at the outpost, you have to proceed to the construction site. There, you first have to secure the site and then look around for any blueprints, data sets, or the device itself. After you have found any intel, a friendly HELO will pick you up and bring you back to base.\n\n Data\n\n• Difficulty: Easy/ Medium\n\n• Type Of Combat: MidRange/CQB\n\n• Voiced: Yes (11labs)\n\n• Playtime: 15-25 minutes\n\n• Factions: CTRG vs SFIA/CSAT\n\n Special Thanks\n\n• to reddit user u/cmsc351_irl for their hex camo template\n\n• 11labs for their AI voices\n\n• Benchmark for their flyby composition"
 },
 "3374221806": {
  "nome": "Derii Simple Logistical Compositions",
  "cat": "composicao",
  "tam": "47 KB",
  "img": "https://images.steamusercontent.com/ugc/37813303397997924/3A01422AD367B109547F95C2D8100E6B97F12612/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "HelicoptersDLC",
   "Apex",
   "Malden",
   "Laws of War",
   "Logistics"
  ],
  "deps": [],
  "resumo": "🔶ESPAÑOL: Composiciones sencillas de comunicaciones y logística para el Zeus y el editor de juego.\n\n🔶ENGLISH: Simple communications and logistics setups for the Zeus and the game editor.\n\n🔹Check out my other compositions!\n\n🔹https://steamcommunity.com/sharedfiles/filedetails/?id=3703527603",
  "temTutorial": false
 },
 "3386249759": {
  "nome": "Desert Ocean [SP/COOP 1-8]",
  "cat": "cenario",
  "tam": "19 MB",
  "img": "https://images.steamusercontent.com/ugc/2912473862598769/2E25B5C872EA7DD2DD50929F7CD3EAC011070A4F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Coop",
   "Multiplayer",
   "KartsDLC"
  ],
  "deps": [],
  "resumo": "Desert Ocean is a SP/MP co-op mission designed for 1 to 8 players.\n\n• Immersive cutscenes and thrilling story\n\n• English voiceover\n\n• No Mods\n\n• In-game music, streamer-friendly\n\n• 2035 \"Future\" Setting\n\nMods:\n\nMods are not required for this mission.\nHowever, I recommend using ‘ACE3’ and 'TFAR' or 'ACRE2'.\n(Please avoid using mods that alter the behavior of the AI)\n\nFor additional equipment mods, place a virtual arsenal with the…",
  "temTutorial": false,
  "guia": "Desert Ocean is a SP/MP co-op mission designed for 1 to 8 players.\n\n• Immersive cutscenes and thrilling story\n\n• English voiceover\n\n• No Mods\n\n• In-game music, streamer-friendly\n\n• 2035 \"Future\" Setting\n\nMods:\n\nMods are not required for this mission.\nHowever, I recommend using ‘ACE3’ and 'TFAR' or 'ACRE2'.\n(Please avoid using mods that alter the behavior of the AI)\n\nFor additional equipment mods, place a virtual arsenal with the available Zeus slot.\n\nMission:\n\nThe situation in the Sahara region has escalated, requiring immediate action.\nThe remote desert village of Tazzarine has fallen under Tura control, and critical intelligence essential for disrupting their operations has been lost.\nA UNA team, led by Lt. Jonathan Lasco, was deployed to assist the village but went silent 48 hours ago.\nYour mission: retake Tazzarine, recover the lost intel, and reestablish security in the region.\nGood luck!\n\nV1.10"
 },
 "3390219536": {
  "nome": "C-5 Galaxy",
  "cat": "mod",
  "tam": "81 MB",
  "img": "https://images.steamusercontent.com/ugc/15299110322395742/930DB775508A340E1A5A6E6B9DFB079071B67BB7/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Plane"
  ],
  "deps": [],
  "resumo": "The Lockheed C-5 Galaxy is a large military transport aircraft designed and built by Lockheed, and now maintained and upgraded by its successor, Lockheed Martin. It provides the United States Air Force (USAF) with a heavy intercontinental-range strategic airlift capability, one that can carry outsized and oversized loads, including all air-certifiable cargo. The Galaxy has many similarities to the smaller Lockheed C-141 Starlifter and…",
  "temTutorial": true
 },
 "3390585168": {
  "nome": "(CUP) Altian Civil War",
  "cat": "mod",
  "tam": "199 MB",
  "img": "https://images.steamusercontent.com/ugc/17648723896372613866/5E6D382C7F0CEF2C3D724511E9DD6766C434CC82/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Helicopter",
   "Wheeled",
   "Tracked",
   "Boat",
   "Character"
  ],
  "deps": [],
  "resumo": "The Altian Civil War:\n\nAfter a long period of economic crisis and political instability on Altis, Colonel Georgious Akhanteros comes to power with a coup in 2018. He continues to maintain relations with European countries and NATO to receive the military aid requested under agreements with the previous civilian government but, in the beginning of 2020, he began to make military and economic agreements with other non-NATO countries as…",
  "temTutorial": false,
  "guia": "The Altian Civil War:\n\nAfter a long period of economic crisis and political instability on Altis, Colonel Georgious Akhanteros comes to power with a coup in 2018. He continues to maintain relations with European countries and NATO to receive the military aid requested under agreements with the previous civilian government but, in the beginning of 2020, he began to make military and economic agreements with other non-NATO countries as well. After long peaceful protests violently repressed by Akhanteros, all kinds of dissidents gathered under the armed movement of the FIA, thus starting a conflict that will degenerate more and more...\n\nFeatures\n\n-Altis Armed Forces:\n\n• Independent faction.\n\n• Infantry units and special forces with their groups.\n\n• Different vehicles with custom textures.\n\n• Uniforms and gear in AAF camo.\n\nAfter the coup, the AAF underwent several changes and received several funds for equipment modernization, with particular attention also to the navy which is responsible for cutting the FIA ​​supply lines. Thanks to Akhanteros, the AAF can count on various vehicles and weapons (some of their own production under license).\n\n-Freedom and Independence Army:\n\n• All side faction.\n\n• Infantry units with their groups.\n\n• Different vehicles with custom textures.\n\n• Randomised headgear and facewear for more variety.\n\nFrom simple street criminals to arms smugglers, the FIA ​​is characterized by its ability to gather under its influence all those who do not support the military government. Although composed mainly of civilians and some AAF deserters, this paramilitary force can rely on foreign-funded weapons and rudimentary and captured enemy vehicles.\n\n-Raven PMCs:\n\n• Independent and Opfor faction.\n\n• Infantry units with their groups.\n\n• Different vehicles.\n\nA relatively small military force composed of mercenaries from Russian territory. Their main mission is to defend cargo ships from FIA attacks, but according to some AAN investigations, the Altian governme"
 },
 "3391372394": {
  "nome": "TOTT NSW",
  "cat": "mod",
  "tam": "163 MB",
  "img": "https://images.steamusercontent.com/ugc/24304572090484618/8C885127DE549347793145A752559AE5A24FE307/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "TOTT Core",
   "CBA_A3",
   "RHSUSAF"
  ],
  "resumo": "TOTT\n\n   Tools of The Trade is a mod that aims to provide authentic and accurate depictions of various rifles and weapons used by components of JSOC. All depictions are made using insider knowledge, countless reference images and hours of research and testing. For more info join the Discord.\n\nIf for some reason you couldn't figure out how to click on the image, here's the link: discord.gg/cvbSSJ9QbF\n\n Recommended Mods\n\n ACE3 - This mod…",
  "temTutorial": true
 },
 "3416827457": {
  "nome": "Bandit Country [CUP] - [SP]",
  "cat": "cenario",
  "tam": "18 MB",
  "img": "https://images.steamusercontent.com/ugc/15301013013774124/DF4512D3B1A6A8F0AA9B2145370BE0FEC5024196/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Singleplayer",
   "Infantry",
   "Altis",
   "MarksmenDLC",
   "HelicoptersDLC"
  ],
  "deps": [],
  "resumo": "DO NOT USE AI ALTERING MODS SUCH AS LAMBS OR VCOM OR SUCH AS IT WOULD CAUSE UNINTENTED AI BEHAVIOUR\n\n \"In the year 2025, Akhanteros began his ascent to power in the Altian region. Shortly after assuming office, the ceasefire between the FIA party and the AAF broke down, leading to escalating tensions. His brutal conduct toward the local populace caused NATO to withdraw its mandate, and soon after, Task Force Aegis was dissolved. Locals…",
  "temTutorial": false,
  "guia": "DO NOT USE AI ALTERING MODS SUCH AS LAMBS OR VCOM OR SUCH AS IT WOULD CAUSE UNINTENTED AI BEHAVIOUR\n\n \"In the year 2025, Akhanteros began his ascent to power in the Altian region. Shortly after assuming office, the ceasefire between the FIA party and the AAF broke down, leading to escalating tensions. His brutal conduct toward the local populace caused NATO to withdraw its mandate, and soon after, Task Force Aegis was dissolved. Locals who defied his reign formed small militia cells under the banner of the FIA, but their efforts to combat Akhanteros's forces proved futile. Outgunned and outnumbered, they hoped for foreign intervention.\n\nWitnessing his oppression of the people, NATO council approved a redeployment to Altis. Before sending the main incursion force, a small US Marine team was dispatched to eliminate one of Akhanteros's closest advisors.\"\n\n Overview\n\nUS Marine team 'Dogstar' deployed into Altis to eliminate a high profile AAF Officer\n\n Features\n\n•  Play Singleplayer\n\n•  Include Voice Acting (Courtesy of Elevenlab)\n\n•  25 Minutes duration\n\n•  Custom Music\n\nAuthor's notes\n\nHello guys. Been a while. Today i've brought a scenario using Flex's very based Altian Civil War CUP Expansion mod. Meant to bring this earlier this month but IRL stuff got me backlogged.\n\nAs always:\n\nVoice acting is created with elevenlab.\n\nDO NOT use AI mods such as LAMBS, VCOM, or the such. A lot of the script relies with the unit waypoints and may cause unintended issues.\n\nHope you all enjoy :)\n\nCredits\n\nFlex7103 for the very based CUP Expansion - Altian Civil War\nCUP Collection Dev Team\nArma 3 forums and discord dwellers for teaching me a lot\n\nSongs Used\n\nSOCOM 3 - All Threats\n\nSOCOM 3 - Prevent Sarwat's Escape\n\nSOCOM 3 - Hearts Of The Fist\n\nSOCOM 3 - Prevent Terrorist Escape 1\n\nSOCOM 2 - SEALs Demoliton Spawn Theme\n\nSOCOM Combined Assault - Intro Track"
 },
 "3424012664": {
  "nome": "US & UK Gear",
  "cat": "mod",
  "tam": "14.9 GB",
  "img": "https://images.steamusercontent.com/ugc/27688449399803647/84D3F723F93AAF8D2CC616C9F50862AE49BE747A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment",
   "Weapon"
  ],
  "deps": [],
  "resumo": "(sem descrição no Workshop)",
  "temTutorial": true
 },
 "3425368881": {
  "nome": "M4A1_URGI",
  "cat": "mod",
  "tam": "164 MB",
  "img": "https://images.steamusercontent.com/ugc/15689805494094732944/9CE403357E537EDB55D97C46617D5322D8AB7988/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "RHSUSAF"
  ],
  "resumo": "M4A1 URGI!!!\n\nOptica utilizada en la imagen es del mod \"TOTT\"\n\nTodos los derechos para el autor original \"LOUETTA\"",
  "temTutorial": true
 },
 "3431126976": {
  "nome": "Wings of Fury",
  "cat": "mod",
  "tam": "8.7 GB",
  "img": "https://images.steamusercontent.com/ugc/34443213661645038/523E9D231AA62D975E0C86A5A77D875E99D8FF25/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Equipment",
   "Mechanics",
   "Plane",
   "Sound"
  ],
  "deps": [],
  "resumo": "Wings of Fury is a mod that introduces new aircraft, known from the FireWill, Luca, and TeTeTe3 packs. The mod adds a variety of airborne machines equipped with realistic weapon systems and advanced mechanics. If you're a fan of aerial combat, this mod will provide you with intense and exciting experiences in the game.\n\nFeatures:\n\n• New aircraft from FireWill, Luca, and TeTeTe3.\n\n• Integrated weaponry and control systems.\n\n• Realistic…",
  "temTutorial": true
 },
 "3444518126": {
  "nome": "Immersive Voices PLUS",
  "cat": "mod",
  "tam": "440 MB",
  "img": "https://images.steamusercontent.com/ugc/14181150881237568/769DA035D4F9EA9B820F1006FBB8339AF3D0938D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Mechanics",
   "Sound"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "STATUS: Stable\n\nFeatures:\n\n- A Full Voice set tailored to an extensive 'Radio Protocol' for MANY Themes.\n- Automatically applies the thematic voices using 'setSpeaker' after units are spawned (3DEN and Zeus).\n- Can be heard by Players and Zeus\n- All Voice Files have now been keyed/signed for Multiplayer Use\n\nSupported Themes\n\n• Warhammer 40K |  Imperial Guard, Heretics, Space Marines (Loyalist and Chaos), Skitarii (Adeptus Mechanicus),…",
  "temTutorial": true
 },
 "3444555961": {
  "nome": "UAV GROUND CONTROL STATION",
  "cat": "composicao",
  "tam": "40 KB",
  "img": "https://images.steamusercontent.com/ugc/59215140628212510/A05D2360218F0DBE1ECCF668358996E64546CF9B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "HelicoptersDLC",
   "Apex",
   "Laws of War",
   "Contact (Platform)"
  ],
  "deps": [],
  "resumo": "SMALL UAV DRONE CONTROL STATION / HUT.  NO MODS NEEDED",
  "temTutorial": false
 },
 "3492800259": {
  "nome": "Binocular -Artillery",
  "cat": "mod",
  "tam": "2 MB",
  "img": "https://images.steamusercontent.com/ugc/13521199062230429896/A66DC3139EA73564910095DAA50117B171DE9C02/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics",
   "Plane",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "I know you've always had the laserdesignator with you, but you've never used it.\nNow you can do \"something\" with your laserdesignator.\n\nHere is a few magazines for you,but they actully 800Rnd in game you can load into laserdesignator.\n  magazines[]=\n  {\n   \"Laserbatteries\",\n   \"800Rnd_230mm_rockets\",\n   \"800Rnd_230mm_rockets_cluster\",\n   \"800Rnd_230mm_rockets_LG\",\n   \"800Rnd_155mm_Mo_shells\",\n   \"800Rnd_155mm_Mo_guided\",…",
  "temTutorial": true
 },
 "3498478340": {
  "nome": "JCA - Modular Helmet Remake Project",
  "cat": "mod",
  "tam": "13 MB",
  "img": "https://images.steamusercontent.com/ugc/13978275007501585313/A6C8C5B14E5E53F3762DC60F24371D1C04A34169/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment"
  ],
  "deps": [],
  "resumo": "JointCom Armoury - Modular Helmet Remake Project\n\nThe first helmet mod in the JCA Standalone mod selection, the JCA - Modular Helmet Remake Project.\n\nDISCLAIMERS:\n\n ▪ No DLC assets were edited in the creation of this project.\n ▪ No DLC content was \"Ripped\" in the creation of this project.\n ▪ This mod does not exist to bypass DLC or infringe the Arma 3 EULA.\n\nDESCRIPTION:\n\nThe first helmet mod to come from JointCom armoury, the JCA…",
  "temTutorial": false,
  "guia": "JointCom Armoury - Modular Helmet Remake Project\n\nThe first helmet mod in the JCA Standalone mod selection, the JCA - Modular Helmet Remake Project.\n\nDISCLAIMERS:\n\n ▪ No DLC assets were edited in the creation of this project.\n ▪ No DLC content was \"Ripped\" in the creation of this project.\n ▪ This mod does not exist to bypass DLC or infringe the Arma 3 EULA.\n\nDESCRIPTION:\n\nThe first helmet mod to come from JointCom armoury, the JCA Modular Helmet Remake Project sets out to protect you with four variants of the Modular Helmet platform first added in A3 Contact. To achieve this the model was made to be as close to 1-1 as possible to the Contact assets over the course of a seven months from the absolute ground up. The model was then UV mapped to the existing Modular Helmet textures, weighted and configured with the same selections to allow for existing textures/materials to easily be switched out for one another giving the ability to add multiple variants easily, as well as creating compatibility with the existing designs config wise.\n\nMHRP was designed to be used as a baseline gear item for dependencies within E22 as well as other unit mods, the helmets include a set of patch selections for customise able logos or flags depending on users wants without having to add many large files for simple flag textures painted directly onto the canvas.\n\nFeatures:\n\nFour Modular Helmet variants:\n- Modular Helmet (Standard)\n- Modular Helmet (Headset)\n- Modular Helmet (Ear Protectors)\n- Modular Helmet (Chops)\n\ncolour schemes:\n- Black\n- Sand\n- Olive\n\n-Fully Implemented arsenal icons for all new vests for ease of location.\n-Default Patch/Name Tag textures included in PBO for easy retextures (Not permission to re-upload mod.)\n\nDisclaimer:\n\nArma 3 Sync:\nReupload of any JCA content to third party softwear such as Arma 3 sync is prohibited. You are not permited to reupload JCA content due to lisances of many assets within.\n\nCredits:\n\nPatreons - For their continued support.\nGrave - Model, Co"
 },
 "3550382310": {
  "nome": "Sniper Utilities",
  "cat": "mod",
  "tam": "27 KB",
  "img": "https://images.steamusercontent.com/ugc/14046187916266582483/072BA485E167BB008C8C74244FDD185D84366ED0/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Mechanics",
   "Weapon"
  ],
  "deps": [
   "ace",
   "121 Deployable Spotting Scope"
  ],
  "resumo": "Systems Application Development Office presents:\n\nSniper Utilities\n\nThis mod adds a few keybinds and settings for more rapid and dynamic deployment of shooting tripods and spotting scopes. It specifically is for the ACE SSWT Kit tripod and spotting scope and the 121 Deployable Spotting Scope. Be sure to check out the video to see how it works.\n\nAdds the following keybinds:\n1. Deploy tripod at height 1\n2. Deploy tripod at height 2\n3.…",
  "temTutorial": true
 },
 "3564392635": {
  "nome": "Modern Sniper Systems (All-in-One)",
  "cat": "mod",
  "tam": "4.1 GB",
  "img": "https://images.steamusercontent.com/ugc/17800786188782376505/06A7551AFB8D97E0E39EFD7ECD92D0F56AB74CBD/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN SNIPER SYSTEMS: All in One\n\n JOIN THE PROJECT M DISCORD\nThe Modern Sniper Systems ensemble adds a comprehensive array of Long Range weapon systems and their asscociated optics, attachments and ammo types. This mod draws on the core platforms that define the long range environment in the 2020s and gives players these tools. Many of these weapons or attachments are a first for Arma 3 and provides something any Long Range…",
  "temTutorial": true
 },
 "3575468172": {
  "nome": "MCC - Core",
  "cat": "mod",
  "tam": "363 MB",
  "img": "https://images.steamusercontent.com/ugc/15204360234822587814/609E65E0589A066E081FE814CAC56C93FC2BD6CD/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: CORE\n\nTHIS IS A CORE MOD ONLY, IT DOES NOT CONTAIN ANY IN-GAME ITEMS\nTo Utilise, please use in conjunction with an MCC GUN or OPTIC mod\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nREPACKING THIS MOD:\nI do NOT allow repacking/reuploading of this mod for a few simple reasons:\n1. This mod will receive regular updates / Bug fixes with time.\n2. I beleive repacking takes away the link that credits the…",
  "temTutorial": true
 },
 "3575470416": {
  "nome": "MCC - Knights KS-1-2-3-4 Pack",
  "cat": "mod",
  "tam": "109 MB",
  "img": "https://images.steamusercontent.com/ugc/9994594942920616140/6D8BEAD70F0467789DC8DB29828412150185324B/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "MCC - Core",
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: Knights KS-1/2/3/4 Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nThe KS series of rifles are produced by Knight's Armament Company (KAC). They are designed as updated versions of their AR-based SR-16 rifles. The 13.7\" KS-1 variant was adopted as the L403A1-AIW by the British Armed Forces in 2023 to supplement the L85A2-A3 and L119A1-A2 rifles used by Royal Marines and the British Army Ranger…",
  "temTutorial": true
 },
 "3575476126": {
  "nome": "MCC - LPVO Pack",
  "cat": "mod",
  "tam": "230 MB",
  "img": "https://images.steamusercontent.com/ugc/16358256816982099729/B63AA833D285B0CE2EB2F4C62C4A5219C64FD7BE/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: Low Power Variable Optic Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nINCLUDES:\nLeupold Mark 5HD 2-10\nTrijicon VCOG 1-8\nVortex AMG 1-10 Elanaor\nZero Compromise ZCO 2-10\n\nAll LPVOs come with backup red dot (exception of VCOG)\n\nAll models were purchased through reputable platforms such as CGTrader or directly through the modeler with their written consent. A list of them is provided below:…",
  "temTutorial": true
 },
 "3576299123": {
  "nome": "MCC - Muzzle Devices",
  "cat": "mod",
  "tam": "332 MB",
  "img": "https://images.steamusercontent.com/ugc/11765725956465954794/235D2989DC5A8639B84DB2388C5F4A729179912D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [],
  "resumo": "MODERN COMBAT CABRINES: Muzzle Devices\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nWant to up your long range aesthetics & performance? The Muzzle devices pack adds a range of Suppressors, Muzzle Brakes & Flash hiders for your carbine of choice!\n\nCONTENT:\nSurefire TI2 (7.62)\nSurefire RC2 & Mini2 (5.56 & 7.62)\nSurefire RC4 & Mini4\nSurefire Warden\nSurefire Warcomp\nSurefire SF4P\nSurefire RBC\nOtter Creek Polonium & PoloniumK…",
  "temTutorial": true
 },
 "3583519360": {
  "nome": "MCC - Red Dot Pack",
  "cat": "mod",
  "tam": "432 MB",
  "img": "https://images.steamusercontent.com/ugc/13968873542168027168/949255FB014C30459F05C560468C513AF0F3AE23/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES:Red Dot Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nINCLUDES (All variants with & without magnifier):\nAimpoint T2\nAimpoint CompM5\nEotech EXPS3\nEotech EXPS3-HD\nLeupold LCO PRO F2\nSig Sauer Romeo8T (In UK-spec Railscales Mount for magnified variant)\nSig Sauer Romeo9T\nVortex AMG UH-1\n\nAll models were purchased through reputable platforms such as CGTrader or directly through the modeler with their…",
  "temTutorial": true
 },
 "3583521742": {
  "nome": "MCC - Lights & Lasers",
  "cat": "mod",
  "tam": "432 MB",
  "img": "https://images.steamusercontent.com/ugc/12218483484130455529/4FDFE0AAF5458EA264B9612FB606C19C676581BA/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES:Lights & Lasers\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nINCLUDES:\nBE-Meyers & CO SAL-UHP (LA-30)\nEotech NGAL\nEotech OGL\nL3 AN/PEQ-15\nL3 AN/PEQ-16B MIPIM\nL3 SQUAD LRF\nSurefire M600V\nSurefire M300C\nInforce WMLX\n\nAll units feature their real life options, including White Light, IR-Torch, IR-Laser, Visible Laser, IR-COMBO & VIS-COMBO. Use CBA Next Laser Function key to toggle between.\n\nAll models…",
  "temTutorial": true
 },
 "3591474457": {
  "nome": "MCC - FN LICC-IWS",
  "cat": "mod",
  "tam": "54 MB",
  "img": "https://images.steamusercontent.com/ugc/17644696706696861690/B9E84E9C14D3BD50839E9A16AC3596DDBAE31283/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [
   "MCC - Core",
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: FN LICC\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nThe FN IWS was purpose-built and developed under government contract to meet the requirements of today’s warfighter: a more lethal and lighter individual weapon system. The system consists of four complementary components:\n\nFN’s Improved Performance Carbine (IPC)\n.264 LICC (Lightweight Intermediate Caliber Cartridge), or 6.5x43mm, ammunition that…",
  "temTutorial": true
 },
 "3591481785": {
  "nome": "MCC - M4A1 Pack",
  "cat": "mod",
  "tam": "552 MB",
  "img": "https://images.steamusercontent.com/ugc/14423482180749783057/B35C1A67EB5CA00120287016603E4C1276F5AB38/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "MCC - Core",
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: 'Upgraded' M4A1 Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nThis pack features a range of M4A1 rifles with upgraded furnishings such as Handguards, Charging Handles, Stocks, Grips, Safety & Iron Sights. The idea of this pack is to breath some fresh life into the old classic, giving you options for weapons perfect for PMCs or western militia or budget special forces.\n\nCONTENT:\nAll…",
  "temTutorial": true
 },
 "3596642267": {
  "nome": "MCC - Extended Red Dot Pack",
  "cat": "mod",
  "tam": "359 MB",
  "img": "https://images.steamusercontent.com/ugc/15922337217027730023/78E6EB5930FB8E2BD373CE4D5C81A80C643018C5/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [
   "MCC - Red Dot Pack",
   "MCC - Lights &amp; Lasers",
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES:Extended Red Dot Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nINCLUDES:\nExtended variations of the red dots found in the MCC - Red Dot Optics Pack\n- GBRS Hydra Mount\n- UnityX Mounts\n- Spuhr T2 mounts\n\nAll models were purchased through reputable platforms such as CGTrader or directly through the modeler with their written consent. A list of them is provided below:\n\nCredits & Thankyous:\nCannuccia…",
  "temTutorial": true
 },
 "3596643390": {
  "nome": "MCC - Magnified Optics Pack",
  "cat": "mod",
  "tam": "334 MB",
  "img": "https://images.steamusercontent.com/ugc/13452764146752434450/84C6742263F0B1B857056F11CBB69E2D329A5409/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: Magnified OpticsPack\n\nThis pack includes a number of low power magnified optics like Elcans, ACOGs etc etc. This pack will be expanded over time.\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nINCLUDES\nElcan SPECTR Gen3 (With Steiner MPS Red dot option)\n\nAll models were purchased through reputable platforms such as CGTrader or directly through the modeler with their written consent. A list of them is…",
  "temTutorial": true
 },
 "3611446339": {
  "nome": "MCC - Barrett Rec7DI",
  "cat": "mod",
  "tam": "90 MB",
  "img": "https://images.steamusercontent.com/ugc/16353750682842668284/6B20BBC3BB213A612D12C1F21E472562A5922C38/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "MCC - Core"
  ],
  "resumo": "MODERN COMBAT CARBINES: Barrett REC7DI\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nWith a nod to Eugene Stoner and his direct impingement design, Barrett is proud to produce the REC7 DI: a lightweight, modular, accurate AR that even the most die hard traditionalist can appreciate.\n\nKnown for its reliability and precision, the Barrett REC7 is designed specifically for situations in which there’s no room for error and…",
  "temTutorial": true
 },
 "3614460136": {
  "nome": "Modern Combat Carbines (All-in-One)",
  "cat": "mod",
  "tam": "4.0 GB",
  "img": "https://images.steamusercontent.com/ugc/15906965351428778047/AFC81FDC73004BEE5E7EEED9A2D86A4E3E206F35/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: All in One\n\n JOIN THE PROJECT M DISCORD\nThe Modern Combat Carbines ensemble adds a comprehensive array of carbine rifles from around the 2025 battlespaces from FNs LICC through to upgraded M4 platform rifles like the URG-I. Feauturing a wide range of high quality attachments and built with maximum modularity, this mod is designed to be a infantrymans & gun guys dream! This pack will be supported & expanded over…",
  "temTutorial": true
 },
 "3618796804": {
  "nome": "MCC - LMT MARS-L and SPECWAR Pack",
  "cat": "mod",
  "tam": "125 MB",
  "img": "https://images.steamusercontent.com/ugc/11909330716894887183/CB0DCF1AEF00051A2277E5C76D8B7B43E8955AA3/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "MODERN COMBAT CARBINES: LMT MARS-L Family\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nBuilt with operational performance in mind, the new LMT Spec War upper was designed in partnership with some of Americas most specialized warfighters. This upper was built to utilize the new 12.5″ MRP barrel as well as other 12″ or greater barrels. We removed the built in forward QD swivels and extended the length over the traditional…",
  "temTutorial": true
 },
 "3620610160": {
  "nome": "MCC - Sig SpearLT & RattlerLT Pack",
  "cat": "mod",
  "tam": "231 MB",
  "img": "https://images.steamusercontent.com/ugc/13015534667358443213/8BDA5083B4150413911BD2F1492905311CEDE2B8/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Weapon"
  ],
  "deps": [
   "CBA_A3",
   "MCC - Core"
  ],
  "resumo": "MODERN COMBAT CARBINES: Sig SpearLT & RattlerLT Pack\n\nJOIN THE PROJECT M DISCORD\nhttps://discord.gg/RbDhB82CTA\n\nThe MCX platform has long been SIG SAUER’S breeding ground for developing the best rifle system in the world through extensive testing, continued innovation and customer feedback. Now SIG SAUER Introduces the SIG SAUER MCX-SPEAR-LT Rifle, a revolutionary firearm built upon the legacy of its predecessor, the MCX Virtus.…",
  "temTutorial": true
 },
 "3671208957": {
  "nome": "WBK Simple Support",
  "cat": "mod",
  "tam": "16 MB",
  "img": "https://images.steamusercontent.com/ugc/15941104725319928170/BBADDCDF6C4E3BEEDAC54A89E6190CF60CD56DC9/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "This simple mod allows squad leaders to call support without needing to place any modules, everything can be configured through addon settings and can be accesed in any mission, as long as you have required backpack (that can also be changed). Please watch the video to see everything.\n\nIf you want more in-depth support system i highly reccomend using Simplex Support Services, besides those two mods can work together and thats how i use…",
  "temTutorial": true
 },
 "3674879316": {
  "nome": "KzyxTools - Cheat Menu & Development-Admin Tool (MP Compatible)",
  "cat": "mod",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/11129655631150262442/F8C02D89467B0AC16DF977569645D79DEEA2989A/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "A comprehensive UI-based toolkit for Arma 3 - spawn, debug, administrate, and customize your experience from a single menu.\n\nSpawn units and vehicles with full dynamic loadout editing. Visualize ballistics, track projectiles, and analyze shots in real time. Manage Zeus modules on the fly. Edit vehicle textures, hitpoints, and animation sources. Toggle god mode, teleport, fly with NoClip, or tweak weapon behavior - all from one keybind.…",
  "temTutorial": true
 },
 "3679457651": {
  "nome": "SCAI Artillery Support",
  "cat": "mod",
  "tam": "1 MB",
  "img": "https://images.steamusercontent.com/ugc/15970491504579172416/0FA673C23F43FC7122AC0DE3B6A37A19028C160D/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Equipment",
   "Helicopter",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "💬 JOIN OUR DISCORD SERVER\n\n🔗 >>> CLICK HERE TO JOIN DISCORD <<<\n\nSCAI Artillery - AI Mortar Support System\n\nIntelligent AI artillery support with realistic accuracy and CBA settings\n\n📋 Description\n\nSCAI Artillery enhances AI mortar crews with intelligent targeting based on allied spotting. When your allies detect enemies, they report target coordinates to artillery crews who will engage with realistic spread and accuracy.\n\nNo more…",
  "temTutorial": true
 },
 "3686190970": {
  "nome": "STmod_AC130J",
  "cat": "mod",
  "tam": "47 MB",
  "img": "https://images.steamusercontent.com/ugc/9921659950449659631/AA367B9AF6094C4C25DB419AB58BB7A918E92149/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Plane"
  ],
  "deps": [
   "ace"
  ],
  "resumo": "Please report any bugs or other issues in this workshop thread.\nWhen reporting a bug, please read the notes in the bug thread carefully and check to see if a similar bug has already been reported.\n\nThis mod recreates the AC-130J Ghostrider gunship, which entered service with the U.S. Air Force in 2017, and its predecessor, the MC-130J Commando II transport aircraft, for Arma 3.\nPlease note that due to a lack of reference materials or…",
  "temTutorial": true
 },
 "3687909045": {
  "nome": "Showdown Posture",
  "cat": "mod",
  "tam": "37 KB",
  "img": "https://images.steamusercontent.com/ugc/9441191039192474667/1DF5D70A68F58A88BC8D9713F77B4119DFD5D56F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Version with AI support:\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=3728185537\n\nSimple mod that was inspired by Hunt: Showdown and adds an automatic weapon up posture similar to that game. Was made originally for upcoming Mad God Part 2, but i am releasing it so anybody can use it. Can work with multiple genres and mods, should be compatible with everything.\n\nMain things:\n\n•  You can exclude weapons from system, for…",
  "temTutorial": true
 },
 "3694150202": {
  "nome": "[TRF] Blackthorn Operators Equipment Mod - REDUX",
  "cat": "mod",
  "tam": "818 MB",
  "img": "https://images.steamusercontent.com/ugc/9454042233608347617/CE18589349B114D319DE39CCBAA2CD17DE5FDABB/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Equipment"
  ],
  "deps": [
   "ace",
   "CBA_A3"
  ],
  "resumo": "BLACKTHORN OPERATORS EQUIPMENT MOD - REDUX\n\n A new release of equipment for the Blackthorn unit. The old mod was getting too cluttered with alot of errors and issues that a new pack was made instead. I will not be taking general requests for this one as it's for a unit, nor will I upload a version without insignia.\n\nJoin us at: https://btrg.co.uk/\n\n Require ACE for Caiman interactive options to lift Earpro and LH250 Visor.\n\nAPL-ND\n\n*No…",
  "temTutorial": true
 },
 "3699105433": {
  "nome": "ADAPTATIVE ARMA SUPPORTS (AAS - Core)",
  "cat": "mod",
  "tam": "5 MB",
  "img": "https://images.steamusercontent.com/ugc/15219527743235471776/3F932713BEDFA987EB340FCB6500E36B6FAB08E4/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "◈  ADAPTATIVE ARMA SUPPORTS  ◈\n\nDrop AAS into any Arma 3 mission and gain access to an immersive tactical support interface. No Zeus modules, no pre-placed objects, no scripting required. Configure it once to match your mods, map, and economy framework, then call in supports seamlessly throughout your operation. Works with Antistasi, KP Liberation, Warlords, Overthrow, and any vanilla scenario.\nFrom a precision gun run to a full…",
  "temTutorial": true
 },
 "3702954719": {
  "nome": "IHPS Helmet 2035",
  "cat": "mod",
  "tam": "54 MB",
  "img": "https://images.steamusercontent.com/ugc/15898894026542807140/EF2BC9FE7A2A5E82F4EC4A778C0FF8FAFD1910A2/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character"
  ],
  "deps": [],
  "resumo": "Lore\n\nThe Integrated Helmet Protection System began development after lessons learned in the Takistan Invasion, but in the wake of the Black Recession of the 2020s, the US Army had to enact cost-cutting measures to stay within Congress's allocated budget. MICH style helmets already in service would be unable to be replaced quickly as focus shifted from soldiers' PPE to arming all combat MOS with the new MX rifle alongside the 6.5mm…",
  "temTutorial": true
 },
 "3739421199": {
  "nome": "EVEN Better Inventory (EBI)",
  "cat": "mod",
  "tam": "3 MB",
  "img": "https://images.steamusercontent.com/ugc/10848091551393537359/5571796250CDAC123E120258EA94BEB3C310761F/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Character",
   "Equipment",
   "Mechanics",
   "Weapon"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "EVEN Better Inventory (EBI)\n\nTarkov-style inventory UI for Arma 3 — PUBLIC BETA\n\n⚠ BETA — PLEASE READ\n\nThis mod is in active development. Features work, but you should expect rough edges. — if you try EBI, please report bugs, broken interactions, and mod incompatibilities. Your feedback directly shapes what gets fixed next.\n\nThis is not a final release. Test in single-player or a dedicated server before committing your whole community…",
  "temTutorial": true
 },
 "3761394375": {
  "nome": "Realistic Vegetation Interaction",
  "cat": "mod",
  "tam": "422 KB",
  "img": "https://images.steamusercontent.com/ugc/15819578297701256897/270B2C675FD98F498A5C47CFED9582CE43B77AF1/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Animation",
   "Character",
   "Mechanics"
  ],
  "deps": [
   "CBA_A3"
  ],
  "resumo": "Realistic Vegetation Interaction (RVI) adds dynamic vegetation movement penalties to Arma 3.\n\nDense foliage now affects player and AI movement, simulating the difficulty of pushing through bushes and vegetation.\n\nFeatures\n\n• Player vegetation interaction.\n• AI vegetation interaction.\n• Virtually zero performance impact.\n\nRecommended Mods\n\nFor the best experience, Realistic Vegetation Concealment (RVC) is highly recommended. RVC handles…",
  "temTutorial": true
 },
 "3763899932": {
  "nome": "Realistic Vegetation Concealment",
  "cat": "mod",
  "tam": "455 KB",
  "img": "https://images.steamusercontent.com/ugc/14303514506419769766/8FCBE4D3DA634C33F28ABEBD11F18E10EF8570CC/?imw=460&imh=260&ima=fit&impolicy=Letterbox&letterbox=false",
  "tags": [
   "Character",
   "Mechanics"
  ],
  "deps": [],
  "resumo": "Realistic Vegetation Concealment (RVC) is a lightweight AI enhancement that simulates the visual uncertainty created by vegetation.\n\nInstead of making units stealthier, RVC slows how quickly AI visually confirm targets that are partially obscured by foliage. AI will still detect, engage, and eventually identify enemies—they simply take longer to build visual confidence when vegetation gets in the way.\n\nFeatures\n\n• Lightweight,…",
  "temTutorial": false,
  "guia": "Realistic Vegetation Concealment (RVC) is a lightweight AI enhancement that simulates the visual uncertainty created by vegetation.\n\nInstead of making units stealthier, RVC slows how quickly AI visually confirm targets that are partially obscured by foliage. AI will still detect, engage, and eventually identify enemies—they simply take longer to build visual confidence when vegetation gets in the way.\n\nFeatures\n\n• Lightweight, group-based AI logic with minimal performance impact.\n• Multiplayer and dedicated server compatible.\n• Supports dynamically spawned AI.\n\nRecommended Mods\n\nFor the best experience, Realistic Vegetation Interaction (RVI) is highly recommended. RVI handles movement through vegetation, while RVC handles how vegetation affects AI perception.\n\nRVC also pairs well with Real Engine Enhanced and LAMBS Danger.fsm (DEV), complementing their AI behavior without overlapping functionality.\n\nRequirements\n\n• CBA_A3\n\nLICENSE\n\nAPL-SA – Arma Public License Share Alike\n\nWhat am I allowed to do?\n✔️ Redistribute this mod in part or whole privately / within a unit, just give credit where it is due.\n✔️ Redistribute this mod in part or whole publicly ONLY with clear credit towards the author and with credits linking to this page.\n❌ You may not use this mod on monetized servers.\n❌ Port this mod in part or whole to games other than ArmA."
 }
};

export const A3COL_TOTAL = 221;
