/**
 * Administração de servidor — Project Zomboid (#zomboid-admin).
 *
 * Dois conjuntos de dados:
 *   1. PZ_COMMANDS — comandos de admin do jogo (consulta rápida).
 *   2. PZ_IDS      — banco de IDs de mods/veículos (Mod ID / Workshop ID /
 *      Spawn ID) pra busca. SEMENTE com os mods conhecidos da coleção; os IDs
 *      ficam vazios ('') até o operador colar a lista real (renderiza como "—").
 *
 * Comandos com a grafia CORRETA do jogo (o que realmente funciona no console):
 *   /additem · /addvehicle · /setaccesslevel  (não aditem/advehicle/setacesslevel).
 */

export const PZ_COMMANDS = [
  {
    cmd: '/godmod "Jogador"',
    fn: 'Deixa o jogador invencível (modo Deus).',
    ex: '/godmod "Spartan"',
    danger: true
  },
  {
    cmd: '/invisible "Jogador"',
    fn: 'Deixa o jogador invisível para os zumbis.',
    ex: '/invisible "Spartan"'
  },
  {
    cmd: '/teleport "Jogador1" "Jogador2"',
    fn: 'Teleporta o Jogador 1 para a posição do Jogador 2.',
    ex: '/teleport "Spartan" "Alfa"'
  },
  {
    cmd: '/additem "Jogador" "ID_do_Item"',
    fn: 'Adiciona um item ao inventário do jogador.',
    ex: '/additem "Spartan" "Base.Axe"'
  },
  {
    cmd: '/addvehicle "Base.NomeDoVeiculo"',
    fn: 'Spawna um veículo à sua frente (ou do jogador informado).',
    ex: '/addvehicle "Base.CarNormal"'
  },
  {
    cmd: '/setaccesslevel "Jogador" "admin"',
    fn: 'Dá privilégios de administrador ao jogador.',
    ex: '/setaccesslevel "Spartan" "admin"',
    danger: true
  }
];

/* Níveis de acesso aceitos pelo /setaccesslevel (referência). */
export const PZ_ACCESS_LEVELS = ['admin', 'moderator', 'overseer', 'gm', 'observer'];

/**
 * Banco de IDs. `modId`/`workshopId`/`spawnId` vazios = "a preencher".
 * spawnId de veículo é o que vai no /addvehicle (formato "Base.X").
 * Semente com os destaques da coleção "alfa" (Spartan Gamer BR).
 */
export const PZ_IDS = [
  // — Veículos (KI5) —
  { name: "'67 Shelby GT500", cat: 'veiculo', modId: '', workshopId: '', spawnId: '' },
  { name: "'73 Nissan Skyline", cat: 'veiculo', modId: '', workshopId: '', spawnId: '' },
  { name: "'93 Ford Mustang", cat: 'veiculo', modId: '', workshopId: '', spawnId: '' },
  { name: "'70 Dodge Challenger", cat: 'veiculo', modId: '', workshopId: '', spawnId: '' },
  { name: 'Halo Warthog', cat: 'veiculo', modId: '', workshopId: '', spawnId: '' },
  // — Blindados —
  { name: 'LAV-300', cat: 'blindado', modId: '', workshopId: '', spawnId: '' },
  { name: 'M1 Abrams', cat: 'blindado', modId: '', workshopId: '', spawnId: '' },
  { name: 'M577 APC', cat: 'blindado', modId: '', workshopId: '', spawnId: '' },
  { name: 'Bushmaster', cat: 'blindado', modId: '', workshopId: '', spawnId: '' },
  // — Aeronaves —
  { name: 'UH-60 Black Hawk', cat: 'aeronave', modId: '', workshopId: '', spawnId: '' },
  { name: 'AH-64A Apache', cat: 'aeronave', modId: '', workshopId: '', spawnId: '' },
  { name: 'AH-60 Black Hawk', cat: 'aeronave', modId: '', workshopId: '', spawnId: '' },
  // — Uniformes & Equipamento —
  { name: 'SWAT', cat: 'uniforme', modId: '', workshopId: '', spawnId: '' },
  { name: 'MARPAT', cat: 'uniforme', modId: '', workshopId: '', spawnId: '' },
  { name: 'Multicam (variantes)', cat: 'uniforme', modId: '', workshopId: '', spawnId: '' },
  // — Mundo & Estruturas —
  { name: 'Heavens Hill (mansão)', cat: 'mundo', modId: '', workshopId: '', spawnId: '' },
  { name: "Yumi's Fridge Expansion Deluxe", cat: 'item', modId: '', workshopId: '', spawnId: '' }
];

export const PZ_CATS = {
  veiculo: { label: 'Veículo', icon: '🚗' },
  blindado: { label: 'Blindado', icon: '🛡️' },
  aeronave: { label: 'Aeronave', icon: '🚁' },
  uniforme: { label: 'Uniforme', icon: '🎖️' },
  mundo: { label: 'Mundo', icon: '🏚️' },
  item: { label: 'Item', icon: '📦' }
};
