/**
 * Comandos & Spawn — console de debug do Arma 3 (pedido do operador:
 * "puxa todos comandos de spawn de coisa… o FOB do KP Liberation").
 *
 * COLETA DE DADOS REAL: a seção do KP Liberation foi extraída do código
 * oficial (github.com/KillahPotatoes/KP-Liberation, Missionframework/):
 * presets/blufor/custom.sqf (typenames), scripts/server/base/startgame.sqf
 * (a missão cria a caixa com createVehicle puro), scripts/client/build/
 * do_build.sqf (a caixa é reconhecida pelo CLASSNAME via nearObjects),
 * scripts/server/remotecall/build_fob_remote_call.sqf (assinatura) e
 * functions/fn_createCrate.sqf (caixas de recurso com valor).
 *
 * Cada comando tem `sqf` pronto pra COPIAR e colar no console de debug.
 */

export const A3CMD_SECOES = [
  {
    id: 'console', nome: 'O Console de Debug', icon: '⌨️',
    desc: 'Onde os comandos rodam — e a regra de ouro: use no SEU jogo (SP/host próprio), nunca em servidor dos outros.',
    itens: [
      {
        titulo: 'Como abrir o console',
        texto: 'O console de debug aparece no menu de PAUSA (Esc) quando você é: (a) single player, (b) host da partida local, (c) admin logado em servidor com o console liberado, ou (d) dentro do editor Eden (que sempre tem). Digite o comando na caixa grande e clique EXEC LOCAL (roda na sua máquina) ou GLOBAL/SERVER quando o comando precisar rodar no servidor.',
        sqf: null,
        dicas: ['Sem console no Esc? A missão/servidor bloqueou — no seu preset, o KzyxTools e o Simple SP Cheat Menu são as alternativas com menu.', 'REGRA DE OURO: console em servidor alheio = ban. Tudo aqui é pro SEU host, SP ou servidor onde você é admin.']
      },
      {
        titulo: 'Descobrir o classname de QUALQUER coisa',
        texto: 'Todo objeto/arma/veículo tem um CLASSNAME (o "nome de código"). Olhe pro objeto e rode o comando — o classname vai direto pro seu Ctrl+V. No Eden: clique-direito no objeto → atributos mostra a classe; e Tools → Config Viewer navega o catálogo inteiro (CfgVehicles/CfgWeapons).',
        sqf: 'copyToClipboard typeOf cursorObject; hint ("copiado: " + typeOf cursorObject);',
        dicas: ['cursorObject = o que sua mira está olhando.', 'Config Viewer do Eden é a "biblioteca-mãe" de classnames — tudo que existe no jogo está lá.']
      },
      {
        titulo: 'hint e systemChat — ver o resultado',
        texto: 'Pra inspecionar qualquer coisa, imprima: hint mostra na tela, systemChat no chat, copyToClipboard leva pro clipboard. Combine com format pra montar textos.',
        sqf: 'hint format ["pos: %1 · dir: %2", getPosATL player, getDir player];',
        dicas: ['diag_log escreve no arquivo .rpt — o "console.log" do Arma.']
      }
    ]
  },
  {
    id: 'kplib', nome: 'KP Liberation — FOB & Logística', icon: '🏗️',
    desc: 'Extraído do CÓDIGO OFICIAL do KP Liberation: a caixa de FOB, a FOB instantânea e as caixas de recurso — com os comandos exatos.',
    itens: [
      {
        titulo: '⭐ Spawnar a CAIXA DE FOB (o jeito legítimo)',
        texto: 'A caixa que constrói base é definida pela variável FOB_box_typename (no preset padrão = "B_Slingload_01_Cargo_F", o contêiner do Huron). CONFIRMADO NO CÓDIGO: a própria missão cria a caixa com um createVehicle puro (startgame.sqf), e o sistema de build reconhece a caixa pelo CLASSNAME (do_build.sqf usa nearObjects) — ou seja, uma caixa spawnada por console é IDÊNTICA à oficial. Use a VARIÁVEL (não o classname fixo): funciona em qualquer preset de facção.',
        sqf: 'private _caixa = FOB_box_typename createVehicle (player getRelPos [6, 0]); _caixa setDir getDir player; hint "Caixa de FOB criada — leve até o local e implante.";',
        dicas: ['Rode com EXEC LOCAL no seu host/SP (createVehicle em cliente local funciona; em dedicado prefira GLOBAL/SERVER).', 'Transporte: de caminhão, sling do Huron, ou empurrando com o Zeus.', 'Longe da base o menu de ações da caixa mostra a opção de implantar a FOB.']
      },
      {
        titulo: '⭐ Criar a FOB DIRETO no lugar (sem caixa)',
        texto: 'O servidor tem a chamada oficial build_fob_remote_call — assinatura confirmada no código: [posição, criarPrédio]. Ela registra a FOB em GRLIB_all_fobs, limpa a área, cria o prédio HQ (FOB_typename = "Land_Cargo_HQ_V1_F"), salva a campanha e anuncia. É a FOB instantânea de admin, no ponto onde você está.',
        sqf: '[getPosATL player, true] remoteExec ["build_fob_remote_call", 2];',
        dicas: ['O "2" no remoteExec = executa NO SERVIDOR (obrigatório; a função sai se não for server).', 'true = cria o prédio HQ; false registra a FOB sem prédio.', 'Respeite o limite de FOBs da campanha — o sistema não checa duplicata neste caminho.']
      },
      {
        titulo: 'Caminhão-FOB, caminhão de respawn e o Huron',
        texto: 'As outras peças da logística, pelas variáveis oficiais do preset: FOB_truck_typename ("B_Truck_01_box_F" — a FOB sobre rodas), Respawn_truck_typename ("B_Truck_01_medical_F" — respawn móvel) e huron_typename ("B_Heli_Transport_03_unarmed_F" — o Spartan 01).',
        sqf: 'FOB_truck_typename createVehicle (player getRelPos [8, 0]);\nRespawn_truck_typename createVehicle (player getRelPos [8, 90]);\nhuron_typename createVehicle (player getRelPos [15, 180]);',
        dicas: ['Rode uma linha por vez se quiser só um deles.', 'O caminhão-FOB implanta a base igual à caixa (mesmo reconhecimento por classname).']
      },
      {
        titulo: 'Caixas de RECURSO com valor de verdade',
        texto: 'Supplies/munição/combustível são caixas físicas: KP_liberation_supply_crate ("CargoNet_01_box_F"), KP_liberation_ammo_crate ("B_CargoNet_01_ammo_F") e KP_liberation_fuel_crate ("CargoNet_01_barrels_F"). NÃO spawne com createVehicle cru — a caixa nasceria sem valor. Use a função oficial da missão, que já atribui a quantidade: KPLIB_fnc_createCrate [recurso, quantidade, posição] (assinatura confirmada em fn_createCrate.sqf; padrão 100).',
        sqf: '[KP_liberation_supply_crate, 100, player getRelPos [4, 0]] call KPLIB_fnc_createCrate;\n[KP_liberation_ammo_crate, 100, player getRelPos [4, 45]] call KPLIB_fnc_createCrate;\n[KP_liberation_fuel_crate, 100, player getRelPos [4, 90]] call KPLIB_fnc_createCrate;',
        dicas: ['100 é o valor cheio padrão de uma caixa.', 'Leve as caixas pra zona de armazenamento da FOB pra entrarem na economia.']
      },
      {
        titulo: 'Arsenal portátil do Liberation',
        texto: 'O arsenal virtual do Liberation vive em caixas do tipo Arsenal_typename ("B_supplyCrate_F"). Perto delas o menu de ações abre o arsenal da campanha (com a whitelist configurada).',
        sqf: 'Arsenal_typename createVehicle (player getRelPos [3, 0]);',
        dicas: ['Em campanha com arsenal restrito, a caixa respeita a lista — não vira arsenal infinito.']
      }
    ]
  },
  {
    id: 'veiculos', nome: 'Spawn de Veículos & Objetos', icon: '🚙',
    desc: 'createVehicle e a família BIS_fnc_* — do Hunter ao contêiner, vazio ou com tripulação.',
    itens: [
      {
        titulo: 'createVehicle — o spawn básico (veículo VAZIO)',
        texto: 'classname createVehicle posição. O veículo nasce vazio, sem tripulação. player getRelPos [distância, direção] posiciona em relação a você (6 m à frente no exemplo). setDir alinha com o seu olhar.',
        sqf: 'private _v = "B_MRAP_01_F" createVehicle (player getRelPos [6, 0]); _v setDir getDir player;',
        dicas: ['"B_MRAP_01_F" = Hunter. Troque pelo classname que quiser (descubra com o typeOf/Config Viewer).', 'Nasceu em cima de algo? A engine empurra — use área aberta.']
      },
      {
        titulo: 'createVehicle com precisão total',
        texto: 'A forma-array dá controle: [classname, posição, marcadores, raio, modo]. O modo "CAN_COLLIDE" coloca EXATAMENTE na posição (sem procurar espaço vago) — bom pra empilhar/encostar objetos.',
        sqf: 'private _v = createVehicle ["B_Heli_Transport_01_F", player getRelPos [15, 0], [], 0, "CAN_COLLIDE"]; _v setDir getDir player;',
        dicas: ['"NONE" procura lugar seguro perto; "CAN_COLLIDE" confia em você.', '"B_Heli_Transport_01_F" = Ghost Hawk.']
      },
      {
        titulo: 'BIS_fnc_spawnVehicle — veículo JÁ TRIPULADO',
        texto: 'Spawna o veículo com a tripulação da facção dentro e um grupo criado: [posição, direção, classname, lado] call BIS_fnc_spawnVehicle. Retorna [veículo, tripulação, grupo].',
        sqf: 'private _r = [player getRelPos [30, 0], getDir player, "O_MBT_02_cannon_F", east] call BIS_fnc_spawnVehicle; hint format ["spawnado: %1", _r select 0];',
        dicas: ['east/west/independent/civilian são os lados.', '"O_MBT_02_cannon_F" = T-100 inimigo tripulado — cuidado com o que deseja.']
      },
      {
        titulo: 'Deletar, virar, mover',
        texto: 'deleteVehicle remove; setVectorUp desvira; setPosATL move. cursorObject deixa tudo apontável: olhe e execute.',
        sqf: 'deleteVehicle cursorObject;',
        dicas: ['Pra desvirar: cursorObject setVectorUp [0,0,1];', 'Pra puxar até você: cursorObject setPosATL (player getRelPos [5, 0]);']
      }
    ]
  },
  {
    id: 'unidades', nome: 'Spawn de Unidades & Grupos', icon: '🎖️',
    desc: 'IA aliada ou inimiga: createUnit exige um GRUPO — e BIS_fnc_spawnGroup monta esquadras inteiras.',
    itens: [
      {
        titulo: 'Um soldado (createUnit precisa de grupo)',
        texto: 'A regra que trava todo mundo: createUnit só funciona DENTRO de um grupo. Crie o grupo primeiro (createGroup lado) e spawne a unidade nele.',
        sqf: 'private _g = createGroup [west, true]; "B_Soldier_F" createUnit [player getRelPos [4, 0], _g];',
        dicas: ['[west, true] — o true limpa o grupo quando esvaziar (higiene de MP).', 'Pra ele virar SEU subordinado: (units _g) joinSilent (group player);']
      },
      {
        titulo: 'Esquadra completa — BIS_fnc_spawnGroup',
        texto: 'Monta um grupo inteiro de uma vez: [posição, lado, lista de classnames] call BIS_fnc_spawnGroup. A lista pode ser escrita à mão ou vir de um config de grupo pronto.',
        sqf: 'private _g = [player getRelPos [10, 0], west, ["B_Soldier_SL_F","B_Soldier_AR_F","B_Soldier_LAT_F","B_medic_F"]] call BIS_fnc_spawnGroup; (units _g) joinSilent (group player);',
        dicas: ['Tire o joinSilent se quiser a esquadra independente (IA própria).', 'Com east no lugar de west, você acabou de criar problema.']
      },
      {
        titulo: 'Waypoints por script',
        texto: 'Grupo sem ordem fica parado. addWaypoint dá destino; setWaypointType muda o comportamento (MOVE, SAD = search and destroy, GUARD).',
        sqf: 'private _wp = (group cursorObject) addWaypoint [getPosATL player, 0]; _wp setWaypointType "MOVE";',
        dicas: ['Olhe pra um IA do grupo e rode — o grupo dele vem até você.', '"SAD" transforma o waypoint em caçada ativa.']
      }
    ]
  },
  {
    id: 'utilitarios', nome: 'Utilitários de Console', icon: '🧰',
    desc: 'Teleporte, cura, arsenal, clima, tempo — a caixa de ferramentas do host.',
    itens: [
      {
        titulo: 'Teleporte por clique no mapa',
        texto: 'Arma o teleporte: abra o mapa e clique onde quer aparecer. O comando se desarma sozinho depois do clique.',
        sqf: 'onMapSingleClick {player setPosATL _pos; onMapSingleClick {}; true};',
        dicas: ['Variante direta pra um marcador: player setPos (getMarkerPos "respawn_west");']
      },
      {
        titulo: 'Cura, munição e combustível',
        texto: 'setDamage 0 cura tudo; setVehicleAmmo 1 enche a munição do veículo/arma; setFuel 1 enche o tanque.',
        sqf: 'player setDamage 0; vehicle player setVehicleAmmo 1; vehicle player setFuel 1;',
        dicas: ['Com ACE médico, prefira o menu médico do ACE — setDamage 0 nem sempre limpa os ferimentos do ACE.']
      },
      {
        titulo: 'God mode (allowDamage)',
        texto: 'Desliga o dano no SEU personagem. Ligue de volta com true — e jogue limpo: isto é ferramenta de teste.',
        sqf: 'player allowDamage false; hint "god ON (player allowDamage true pra desligar)";',
        dicas: ['Vale só pra você; veículo é à parte: vehicle player allowDamage false;']
      },
      {
        titulo: 'Arsenal virtual completo',
        texto: 'Abre o Arsenal da BIS com TUDO liberado, em qualquer lugar.',
        sqf: '["Open", true] call BIS_fnc_arsenal;',
        dicas: ['Em campanha (Antistasi/Liberation) isso fura a economia — use com consciência.']
      },
      {
        titulo: 'Tempo e clima',
        texto: 'skipTime pula horas (aceita fração/negativo); setOvercast e setFog mudam o céu (o primeiro número é a transição em segundos; 0 = instantâneo + forceWeatherChange aplica na hora).',
        sqf: 'skipTime 6;\n0 setOvercast 0; 0 setFog 0; forceWeatherChange;',
        dicas: ['skipTime -6 volta pro dia anterior de manhã.', 'Chuva dramática: 0 setOvercast 1; 0 setRain 1; forceWeatherChange;']
      },
      {
        titulo: 'Câmera livre (splendid camera)',
        texto: 'A câmera cinematográfica da BIS — voa livre pelo mapa pra screenshot/observação.',
        sqf: '[] call BIS_fnc_camera;',
        dicas: ['Esc sai. No Eden a mesma câmera existe nativa.', 'Combine com o Milsim Structures/Trencher do preset pra fotografar suas bases.']
      }
    ]
  }
];

export const A3CMD_TOTAL = A3CMD_SECOES.reduce((n, s) => n + s.itens.length, 0);
