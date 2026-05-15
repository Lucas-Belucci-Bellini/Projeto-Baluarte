/**
 * Modpack Minecraft (Fase 17).
 *
 * Dataset compacto: 80+ mods representativos catalogados em categorias e tiers.
 * Tier S/A/B/C representa popularidade e impacto no gameplay.
 */

export const MOD_CATEGORIES = [
  { id: 'tech',        label: 'Tech',              color: '#00f0ff' },
  { id: 'magic',       label: 'Magia',             color: '#ff00aa' },
  { id: 'exploration', label: 'Exploração',        color: '#00ff88' },
  { id: 'combat',      label: 'Combate',           color: '#ff3355' },
  { id: 'building',    label: 'Construção',        color: '#ffaa00' },
  { id: 'storage',     label: 'Storage / QoL',     color: '#66ddff' },
  { id: 'world',       label: 'World gen',         color: '#7c4dff' },
  { id: 'performance', label: 'Performance',       color: '#a3a8b8' },
  { id: 'utility',     label: 'Utility',           color: '#ffd700' }
];

export const MODS = [
  /* TECH */
  { name: 'Applied Energistics 2', cat: 'tech', tier: 'S', author: 'AlgorithmX2', desc: 'Storage digital com canais ME, autocrafting massivo.' },
  { name: 'Refined Storage', cat: 'tech', tier: 'S', author: 'raoulvdberge', desc: 'Sistema de storage simplificado, alternativa ao AE2.' },
  { name: 'Mekanism', cat: 'tech', tier: 'S', author: 'aidancbrady', desc: 'Tier system de máquinas (Basic→Ultimate), fusão, jetpack.' },
  { name: 'Thermal Series', cat: 'tech', tier: 'S', author: 'Team CoFH', desc: 'Foundation, Dynamics, Expansion, Innovation. Ferro/cobre.' },
  { name: 'Industrial Foregoing', cat: 'tech', tier: 'A', author: 'Buuz135', desc: 'Mob farms, latex production, plant gatherer.' },
  { name: 'Tech Reborn', cat: 'tech', tier: 'A', author: 'TechReborn', desc: 'IC2-style tech: máquinas, energia EU.' },
  { name: 'Immersive Engineering', cat: 'tech', tier: 'S', author: 'BluSunrize', desc: 'Multiblocks industriais, dieselpunk visual.' },
  { name: 'Create', cat: 'tech', tier: 'S', author: 'simibubi', desc: 'Mecânica de eixos, encanamentos, trens. Linda fisicamente.' },

  /* MAGIA */
  { name: 'Botania', cat: 'magic', tier: 'S', author: 'Vazkii', desc: 'Magia floral, mana, lentes, sem GUI.' },
  { name: 'Blood Magic', cat: 'magic', tier: 'A', author: 'WayofTime', desc: 'Sangue como recurso, sacrifícios, rituais.' },
  { name: 'Thaumcraft', cat: 'magic', tier: 'S', author: 'azanor', desc: 'Aspectos, varinhas, golems. Clássico (legacy).' },
  { name: 'Astral Sorcery', cat: 'magic', tier: 'A', author: 'HellFirePvP', desc: 'Constelações, perks, atunement.' },
  { name: 'Ars Nouveau', cat: 'magic', tier: 'A', author: 'baileyholl2', desc: 'Spells customizáveis com glifos.' },
  { name: 'Occultism', cat: 'magic', tier: 'B', author: 'klikli-dev', desc: 'Demons summons, storage spirits.' },

  /* EXPLORAÇÃO */
  { name: 'Twilight Forest', cat: 'exploration', tier: 'S', author: 'Benimatic', desc: 'Dimensão de bosses progressivos.' },
  { name: 'Aether II', cat: 'exploration', tier: 'A', author: 'Modding Legacy', desc: 'Céu/anti-Nether com bosses voadores.' },
  { name: 'Ice and Fire', cat: 'exploration', tier: 'A', author: 'sbom_xela', desc: 'Dragões funcionais, ciclopes, mythical creatures.' },
  { name: 'AbyssalCraft', cat: 'exploration', tier: 'B', author: 'Shinoow', desc: 'Lovecraftian dimensions, cthulhuoid.' },
  { name: 'Dungeons Plus', cat: 'exploration', tier: 'A', author: 'Legacy', desc: 'Novos dungeons gerados procedurais.' },
  { name: 'Hexerei', cat: 'exploration', tier: 'B', author: 'Joefoxe', desc: 'Bruxaria estética, vassouras, mortars.' },

  /* COMBATE */
  { name: 'Tinkers Construct', cat: 'combat', tier: 'S', author: 'mDiyo/KnightMiner', desc: 'Ferramentas/armas customizáveis com materiais.' },
  { name: 'Tetra', cat: 'combat', tier: 'A', author: 'mickelus', desc: 'Modular tools, similar a Tinkers mais leve.' },
  { name: 'Spartan Weaponry', cat: 'combat', tier: 'A', author: 'ObliviousSpartan', desc: 'Espadas, machados, halberds com IA reagindo.' },
  { name: 'Mutant Beasts', cat: 'combat', tier: 'B', author: 'BobMowzie', desc: 'Mobs com versão mutante mais difícil.' },
  { name: 'Apotheosis', cat: 'combat', tier: 'S', author: 'Shadows_of_Fire', desc: 'Affixes em armas, gemas, deadly mob spawning.' },

  /* CONSTRUÇÃO */
  { name: "Chisel & Bits", cat: 'building', tier: 'S', author: 'AlgorithmX2', desc: 'Subdivide blocos em 16x16x16 pra detalhes.' },
  { name: 'Building Gadgets', cat: 'building', tier: 'A', author: 'Direwolf20', desc: 'Cópia/cola/exchange via gadget.' },
  { name: 'Chipped', cat: 'building', tier: 'A', author: 'Grimbright', desc: '+1500 variantes decorativas de blocos vanilla.' },
  { name: 'Macaws Doors / Bridges / Windows', cat: 'building', tier: 'A', author: 'Macaw', desc: 'Variedade decorativa massiva.' },
  { name: 'BuildCraft', cat: 'building', tier: 'B', author: 'CovertJaguar', desc: 'Pipes, builder, quarry. Clássico.' },

  /* STORAGE / QoL */
  { name: 'Storage Drawers', cat: 'storage', tier: 'S', author: 'jaquadro', desc: 'Drawers visuais com upgrade slots.' },
  { name: 'Iron Chests', cat: 'storage', tier: 'A', author: 'cpw', desc: 'Tiers de baús (iron, gold, diamond, obsidian).' },
  { name: 'JEI', cat: 'storage', tier: 'S', author: 'mezz', desc: 'Just Enough Items — recipe browser indispensável.' },
  { name: 'JER', cat: 'storage', tier: 'A', author: 'way2muchnoise', desc: 'Just Enough Resources — drops e ores.' },
  { name: 'Patchouli', cat: 'storage', tier: 'A', author: 'Vazkii', desc: 'Engine de manuais in-game.' },
  { name: 'TooltipFix', cat: 'storage', tier: 'B', author: 'MrCrayfish', desc: 'Corrige tooltips fora da tela.' },

  /* WORLD GEN */
  { name: 'Biomes O\' Plenty', cat: 'world', tier: 'S', author: 'Forstride', desc: '90+ biomas novos.' },
  { name: 'Terralith', cat: 'world', tier: 'S', author: 'Starmute', desc: 'Datapack-based, geração épica vanilla+.' },
  { name: 'Oh The Biomes You\'ll Go', cat: 'world', tier: 'A', author: 'AOCAWOL', desc: '80+ biomes fantasy.' },
  { name: 'YUNG\'s Better Caves', cat: 'world', tier: 'A', author: 'YUNGNICKYOUNG', desc: 'Caves naturais e exploráveis.' },
  { name: 'Tectonic', cat: 'world', tier: 'A', author: 'Apollo', desc: 'Montanhas dramáticas em 1.18+.' },

  /* PERFORMANCE */
  { name: 'Sodium', cat: 'performance', tier: 'S', author: 'CaffeineMC', desc: 'Renderer optimizado, +300% FPS médio.' },
  { name: 'Lithium', cat: 'performance', tier: 'S', author: 'CaffeineMC', desc: 'Otimização de tick, AI, world gen.' },
  { name: 'Starlight', cat: 'performance', tier: 'S', author: 'PaperMC', desc: 'Engine de luz reescrita.' },
  { name: 'FerriteCore', cat: 'performance', tier: 'A', author: 'malte0811', desc: 'Reduz uso de memória.' },
  { name: 'Memory Leak Fix', cat: 'performance', tier: 'A', author: 'fxmorin', desc: 'Corrige leaks comuns.' },
  { name: 'FastWorkbench', cat: 'performance', tier: 'B', author: 'Shadows_of_Fire', desc: 'Recipes mais rápidas.' },

  /* UTILITY */
  { name: 'WAILA / Jade / WTHIT', cat: 'utility', tier: 'S', author: 'Mojang+', desc: 'Mostra dados do bloco mirado.' },
  { name: 'Minimap (JourneyMap)', cat: 'utility', tier: 'S', author: 'techbrew', desc: 'Minimapa + waypoints.' },
  { name: 'Xaero\'s Minimap', cat: 'utility', tier: 'S', author: 'Xaero', desc: 'Alternativa leve ao JourneyMap.' },
  { name: 'Mouse Tweaks', cat: 'utility', tier: 'A', author: 'YaLTeR', desc: 'Drag e split em GUIs.' },
  { name: 'Inventory Tweaks Renewed', cat: 'utility', tier: 'A', author: 'jenkinsdev', desc: 'Auto-sort e refill.' },
  { name: 'Hwyla', cat: 'utility', tier: 'B', author: 'TehNut', desc: 'Outra variante de tooltip.' },
  { name: 'AppleSkin', cat: 'utility', tier: 'A', author: 'squeek502', desc: 'Mostra saturation/exhaustion.' },
  { name: 'Bookshelf', cat: 'utility', tier: 'B', author: 'darkhax', desc: 'Lib usada por vários mods.' },
  { name: 'Curios API', cat: 'utility', tier: 'S', author: 'TheIllusiveC4', desc: 'Slots cosméticos/utility (anéis, cintos).' }
];

export const TOTAL_MODS = MODS.length;

export function modsByCategory(catId) {
  return MODS.filter((m) => m.cat === catId);
}

/* PC Builds presets (Guia PC) ===== */

export const PC_PRESETS = [
  {
    id: 'budget',
    name: 'Orçamento (R$ 4.000-5.000)',
    icon: '◇',
    color: '#00ff88',
    purpose: 'Trabalho/estudo + games leves a 1080p.',
    parts: [
      { type: 'CPU', value: 'AMD Ryzen 5 5600' },
      { type: 'GPU', value: 'NVIDIA RTX 3060 12GB ou AMD RX 6600' },
      { type: 'RAM', value: '16 GB DDR4 3200MHz (2x8)' },
      { type: 'Mobo', value: 'B550 ou A520 (verificar BIOS)' },
      { type: 'SSD', value: 'NVMe 500 GB' },
      { type: 'Fonte', value: '550W 80+ Bronze' },
      { type: 'Gabinete', value: 'mid-tower com bom airflow' }
    ],
    tip: 'Compre RAM em par. SSD NVMe é não-negociável.'
  },
  {
    id: 'gamer',
    name: 'Gamer 1440p (R$ 8.000-12.000)',
    icon: '◆',
    color: '#ff3355',
    purpose: 'AAA a 1440p 100+ FPS, ray tracing moderado.',
    parts: [
      { type: 'CPU', value: 'AMD Ryzen 7 7700X ou Intel Core i5-14600KF' },
      { type: 'GPU', value: 'NVIDIA RTX 4070 Ti SUPER ou RX 7900 GRE' },
      { type: 'RAM', value: '32 GB DDR5 6000MHz CL30 (2x16)' },
      { type: 'Mobo', value: 'B650 AM5 ou B760 LGA1700' },
      { type: 'SSD', value: 'NVMe Gen4 1 TB + secundário 2 TB' },
      { type: 'Cooler', value: 'AIO 240mm ou tower premium' },
      { type: 'Fonte', value: '750W 80+ Gold modular' },
      { type: 'Gabinete', value: 'mid-tower com mesh frontal' }
    ],
    tip: 'CL30 na RAM importa pra Ryzen. Gen4 NVMe basta — Gen5 ainda esquenta.'
  },
  {
    id: 'creator',
    name: 'Content Creator (R$ 15.000-25.000)',
    icon: '✦',
    color: '#ff00aa',
    purpose: '4K render, edit, streaming, dev pesado.',
    parts: [
      { type: 'CPU', value: 'AMD Ryzen 9 7950X3D ou Intel Core i7-14700K' },
      { type: 'GPU', value: 'NVIDIA RTX 4080 SUPER ou RTX 4090' },
      { type: 'RAM', value: '64 GB DDR5 6000MHz (2x32 ou 4x16)' },
      { type: 'Mobo', value: 'X670E ou Z790 com chipset full' },
      { type: 'SSD', value: 'NVMe Gen4 2 TB (sistema) + 4 TB (projetos)' },
      { type: 'HDD', value: '8 TB para backup/raw' },
      { type: 'Cooler', value: 'AIO 360mm' },
      { type: 'Fonte', value: '1000W 80+ Platinum' },
      { type: 'Gabinete', value: 'full tower premium' }
    ],
    tip: 'Para Blender/After Effects, GPU CUDA importa. AMD melhora pra edit puro.'
  },
  {
    id: 'workstation',
    name: 'Workstation / ML (R$ 30.000+)',
    icon: '⚛',
    color: '#7c4dff',
    purpose: 'ML training, simulações, 8K, multi-VM.',
    parts: [
      { type: 'CPU', value: 'AMD Threadripper PRO 7965WX ou Xeon W7' },
      { type: 'GPU', value: '2× RTX 4090 ou A6000 Ada' },
      { type: 'RAM', value: '128-256 GB DDR5 ECC' },
      { type: 'Mobo', value: 'WRX90 ou W790' },
      { type: 'SSD', value: 'NVMe Gen5 2 TB + 8 TB Gen4' },
      { type: 'Fonte', value: '1600W 80+ Titanium' },
      { type: 'Gabinete', value: 'EATX full tower com 10+ slots' }
    ],
    tip: 'PCIe lanes importam. Threadripper PRO oferece 128 lanes vs 24 do consumidor.'
  }
];

/* Lógica: portas básicas (Logic Sim) */
export const LOGIC_GATES = [
  { id: 'AND',  symbol: '∧', fn: (a, b) => a && b, desc: 'Saída 1 se ambos forem 1.' },
  { id: 'OR',   symbol: '∨', fn: (a, b) => a || b, desc: 'Saída 1 se pelo menos um for 1.' },
  { id: 'NOT',  symbol: '¬', fn: (a) => !a, desc: 'Inverte o sinal (1 input).' },
  { id: 'XOR',  symbol: '⊕', fn: (a, b) => a !== b, desc: 'Saída 1 se exatamente um for 1.' },
  { id: 'NAND', symbol: '⊼', fn: (a, b) => !(a && b), desc: 'NOT AND. Universal: pode formar qualquer porta.' },
  { id: 'NOR',  symbol: '⊽', fn: (a, b) => !(a || b), desc: 'NOT OR. Também universal.' },
  { id: 'XNOR', symbol: '↔', fn: (a, b) => a === b, desc: 'NOT XOR (igualdade).' }
];
