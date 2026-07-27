/**
 * Dicionário da CONVENÇÃO DE NOMES do Arma 3 — o que cada pedaço de um
 * `classname` quer dizer.
 *
 * Por que existe: as tabelas desta wiki mostram `arifle_MX_ACO_pointer_F`,
 * `V_PlateCarrier1_rgr`, `B_MBT_01_cannon_F` — e o leitor que não decora
 * a convenção vê ruído. Mas o nome NÃO é ruído: ele é estruturado, e quem
 * sabe lê-lo descobre o que a coisa é sem abrir o jogo.
 *
 *     arifle_MX_ACO_pointer_F
 *     └┬───┘ └┬┘ └┬┘ └──┬──┘ ┴
 *      │     │   │      │    └ F = "Futura", marca do Arma 3 (vs. Arma 2)
 *      │     │   │      └ acessório montado de fábrica (apontador laser)
 *      │     │   └ óptica montada de fábrica (ACO)
 *      │     └ a família da arma
 *      └ assault rifle: vai no slot de arma primária
 *
 * ⚠️ ESTE ARQUIVO É ESCRITO À MÃO, e é o único da wiki de Arma 3 que é.
 * Não sai de dump nenhum: convenção de nomes não está no config, está na
 * prática da Bohemia. Por isso cada verbete diz em que EVIDÊNCIA se apoia —
 * `slot` quando o próprio engine usa o prefixo pra decidir onde o item
 * encaixa (verificável), `pratica` quando é convenção observada no acervo.
 *
 * O consumidor (`explicarClasse`) só afirma o que casa. Classe de mod que
 * não segue a convenção volta sem explicação, em vez de receber um palpite.
 */

/* ── prefixos: o primeiro pedaço, antes do primeiro "_" ───────────────── */
export const A3CLS_PREFIXOS = [
  /* armas — o engine usa o prefixo pra escolher o slot */
  { p: 'arifle', nome: 'Fuzil de assalto', desc: 'Arma primária. Vai no slot principal das costas.', ev: 'slot' },
  { p: 'srifle', nome: 'Fuzil de precisão', desc: 'Primária de tiro preciso — DMR ou sniper.', ev: 'slot' },
  { p: 'LMG', nome: 'Metralhadora leve', desc: 'Primária de fogo de supressão, carregador de caixa.', ev: 'slot' },
  { p: 'SMG', nome: 'Submetralhadora', desc: 'Primária curta, munição de pistola.', ev: 'slot' },
  { p: 'hgun', nome: 'Pistola', desc: 'Arma secundária, slot do coldre.', ev: 'slot' },
  { p: 'launch', nome: 'Lançador', desc: 'AT ou AA, no slot de lançador. Não segue o modelo de bala.', ev: 'slot' },

  /* equipamento — prefixo de uma letra, o mais críptico da convenção */
  { p: 'U', nome: 'Uniforme', desc: 'Vai no slot de fardamento (Uniform).', ev: 'slot' },
  { p: 'V', nome: 'Colete', desc: 'Slot de colete (Vest). É quem costuma carregar a blindagem.', ev: 'slot' },
  { p: 'H', nome: 'Capacete', desc: 'Slot de cabeça (Headgear).', ev: 'slot' },
  { p: 'G', nome: 'Óculos / máscara', desc: 'Slot de rosto (Goggles).', ev: 'slot' },
  { p: 'B', nome: 'Mochila', desc: 'Slot das costas (Backpack) — em item. Em VEÍCULO ou SOLDADO, B_ quer dizer BLUFOR.', ev: 'slot' },

  /* acessórios */
  { p: 'optic', nome: 'Óptica', desc: 'Mira, no trilho superior (CowsSlot).', ev: 'slot' },
  { p: 'muzzle', nome: 'Boca do cano', desc: 'Supressor ou quebra-chamas (MuzzleSlot).', ev: 'slot' },
  { p: 'acc', nome: 'Acessório lateral', desc: 'Lanterna ou apontador laser (PointerSlot).', ev: 'slot' },
  { p: 'bipod', nome: 'Bipé / empunhadura', desc: 'Vai no trilho inferior (UnderBarrelSlot).', ev: 'slot' },

  /* lados — em soldado e veículo, a primeira letra é a facção */
  { p: 'O', nome: 'OPFOR', desc: 'Lado leste (CSAT e afins).', ev: 'pratica' },
  { p: 'I', nome: 'Independente', desc: 'Lado independente (AAF, guerrilha).', ev: 'pratica' },
  { p: 'C', nome: 'Civil', desc: 'Civil — em veículo e soldado.', ev: 'pratica' },
  { p: 'Land', nome: 'Objeto de cenário', desc: 'Estrutura ou objeto do mundo, não tropa.', ev: 'pratica' },
];

/* ── sufixos e pedaços do meio ────────────────────────────────────────── */
export const A3CLS_SUFIXOS = [
  { p: 'F', nome: 'Arma 3', desc: '"Futura" — marca o conteúdo do Arma 3, separando do herdado do Arma 2.', ev: 'pratica' },
  { p: 'FIA', nome: 'FIA', desc: 'Freedom and Independence Army — a guerrilha da campanha.', ev: 'pratica' },
  { p: 'sand', nome: 'Camuflagem areia', desc: 'Variante cosmética: mesma estatística, cor diferente.', ev: 'pratica' },
  { p: 'blk', nome: 'Preto', desc: 'Variante cosmética.', ev: 'pratica' },
  { p: 'khk', nome: 'Cáqui', desc: 'Variante cosmética.', ev: 'pratica' },
  { p: 'rgr', nome: 'Ranger green', desc: 'Variante cosmética.', ev: 'pratica' },
  { p: 'tna', nome: 'Tropentarn', desc: 'Variante cosmética (camuflagem de deserto alemã).', ev: 'pratica' },
  { p: 'mcamo', nome: 'Multicam', desc: 'Variante cosmética.', ev: 'pratica' },
  { p: 'ghex', nome: 'Hex verde', desc: 'Camuflagem hexagonal CSAT (Apex).', ev: 'pratica' },
  { p: 'hex', nome: 'Hex', desc: 'Camuflagem hexagonal CSAT.', ev: 'pratica' },
  { p: 'lush', nome: 'Vegetação densa', desc: 'Variante cosmética (Apex/Tanoa).', ev: 'pratica' },
  { p: 'arid', nome: 'Árido', desc: 'Variante cosmética.', ev: 'pratica' },
  { p: 'snd', nome: 'Areia', desc: 'Variante cosmética.', ev: 'pratica' },
];

/* Óptica e acessório que aparecem MONTADOS no nome da arma. Uma variante
 * `arifle_MX_ACO_pointer_F` é o MX que já vem de fábrica com o ACO e o
 * apontador — informação real sobre o que aquela arma aceita. */
export const A3CLS_MONTADOS = [
  { p: 'ACO', nome: 'ACO', desc: 'Colimador (red dot) — tiro rápido de perto.' },
  { p: 'Holo', nome: 'Holosight', desc: 'Mira holográfica.' },
  { p: 'ARCO', nome: 'ARCO', desc: 'Óptica de combate com colimador secundário.' },
  { p: 'MRCO', nome: 'MRCO', desc: 'Óptica de alcance médio.' },
  { p: 'RCO', nome: 'RCO', desc: 'Óptica de combate.' },
  { p: 'Hamr', nome: 'HAMR', desc: 'Óptica de alcance médio com colimador.' },
  { p: 'SOS', nome: 'SOS', desc: 'Luneta de precisão de longo alcance.' },
  { p: 'AMS', nome: 'AMS', desc: 'Luneta avançada (Marksmen).' },
  { p: 'KHS', nome: 'KHS', desc: 'Luneta com telêmetro (Marksmen).' },
  { p: 'DMS', nome: 'DMS', desc: 'Luneta de tirador designado.' },
  { p: 'MOS', nome: 'MOS', desc: 'Trilho modular — aceita óptica de precisão.' },
  { p: 'pointer', nome: 'Apontador laser', desc: 'Laser IR, visível com visão noturna.' },
  { p: 'snds', nome: 'Supressor', desc: 'Reduz o som e o clarão do disparo.' },
  { p: 'GL', nome: 'Lança-granadas', desc: 'Boca secundária de 40 mm sob o cano.' },
  { p: 'LMG', nome: 'Versão metralhadora', desc: 'Variante de cano pesado.' },
];

const porPrefixo = new Map(A3CLS_PREFIXOS.map((x) => [x.p.toLowerCase(), x]));
const porSufixo = new Map(A3CLS_SUFIXOS.map((x) => [x.p.toLowerCase(), x]));
const porMontado = new Map(A3CLS_MONTADOS.map((x) => [x.p.toLowerCase(), x]));

/**
 * Decompõe um classname no que dá pra afirmar.
 *
 * Devolve `{ partes: [{ texto, nome, desc, tipo, ev }] }`. Pedaço que não
 * casa com nada NÃO entra: melhor mostrar meia explicação verdadeira que
 * uma inteira inventada. Se nada casar, `partes` volta vazio e a UI não
 * mostra o bloco.
 *
 * `contexto` desempata o `B_`, que é mochila em item e BLUFOR em soldado
 * e veículo — a única letra da convenção com dois sentidos.
 */
export function explicarClasse(classe, contexto = 'item') {
  if (!classe || typeof classe !== 'string') return { partes: [] };
  const pedacos = classe.split('_').filter(Boolean);
  const partes = [];

  pedacos.forEach((pedaco, i) => {
    const chave = pedaco.toLowerCase();

    if (i === 0) {
      if (chave === 'b' && (contexto === 'soldado' || contexto === 'veiculo')) {
        partes.push({
          texto: pedaco, nome: 'BLUFOR', tipo: 'lado', ev: 'pratica',
          desc: 'Lado ocidental (NATO e afins).',
        });
        return;
      }
      const pre = porPrefixo.get(chave);
      if (pre) {
        partes.push({ texto: pedaco, nome: pre.nome, desc: pre.desc, tipo: 'prefixo', ev: pre.ev });
        return;
      }
      /* Prefixo que não conhecemos costuma ser a etiqueta do mod. */
      partes.push({
        texto: pedaco, nome: 'Etiqueta do mod', tipo: 'mod', ev: 'pratica',
        desc: 'Não é prefixo do jogo base — mod costuma marcar as classes dele assim.',
      });
      return;
    }

    const mont = porMontado.get(chave);
    if (mont) {
      partes.push({ texto: pedaco, nome: mont.nome, desc: mont.desc, tipo: 'montado', ev: 'pratica' });
      return;
    }
    const suf = porSufixo.get(chave);
    if (suf) {
      partes.push({ texto: pedaco, nome: suf.nome, desc: suf.desc, tipo: 'sufixo', ev: suf.ev });
    }
  });

  return { partes };
}

/* Frase curta pra tooltip: "fuzil de assalto · ACO montado · Arma 3". */
export function resumirClasse(classe, contexto = 'item') {
  const { partes } = explicarClasse(classe, contexto);
  if (!partes.length) return '';
  return partes.map((p) => p.nome).join(' · ');
}
