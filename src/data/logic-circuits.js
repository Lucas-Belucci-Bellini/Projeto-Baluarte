/**
 * Enciclopédia de Lógica Digital (v2.0.0).
 *
 * Portas fundamentais (símbolo, expressão, tabela verdade), blocos
 * construtivos (somadores, mux, flip-flops) e famílias de circuitos
 * integrados 7400 (TTL) e 4000 (CMOS).
 */

/* ===== Portas lógicas fundamentais ===== */
export const FUNDAMENTAL_GATES = [
  {
    id: 'buffer', name: 'BUFFER', symbol: 'buffer', inputs: 1,
    expr: 'Y = A',
    desc: 'Repete a entrada na saída sem alterá-la. Serve para reforçar o sinal e isolar etapas do circuito.',
    truth: { headers: ['A', 'Y'], rows: [[0, 0], [1, 1]] },
    universal: false
  },
  {
    id: 'not', name: 'NOT · Inversor', symbol: 'not', inputs: 1,
    expr: 'Y = Ā',
    desc: 'Inverte o sinal: 0 vira 1 e 1 vira 0. É a única porta de uma entrada que muda o valor.',
    truth: { headers: ['A', 'Y'], rows: [[0, 1], [1, 0]] },
    universal: false
  },
  {
    id: 'and', name: 'AND', symbol: 'and', inputs: 2,
    expr: 'Y = A · B',
    desc: 'Saída 1 somente quando TODAS as entradas são 1. É a multiplicação lógica.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
    universal: false
  },
  {
    id: 'or', name: 'OR', symbol: 'or', inputs: 2,
    expr: 'Y = A + B',
    desc: 'Saída 1 quando AO MENOS UMA entrada é 1. É a soma lógica.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
    universal: false
  },
  {
    id: 'nand', name: 'NAND', symbol: 'nand', inputs: 2,
    expr: 'Y = (A · B)′',
    desc: 'O inverso do AND. Porta UNIVERSAL: qualquer circuito lógico pode ser montado só com NANDs.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    universal: true
  },
  {
    id: 'nor', name: 'NOR', symbol: 'nor', inputs: 2,
    expr: 'Y = (A + B)′',
    desc: 'O inverso do OR. Também é porta UNIVERSAL — sozinha constrói qualquer função lógica.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]] },
    universal: true
  },
  {
    id: 'xor', name: 'XOR · OU-Exclusivo', symbol: 'xor', inputs: 2,
    expr: 'Y = A ⊕ B',
    desc: 'Saída 1 quando as entradas são DIFERENTES. Base dos somadores e da paridade.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    universal: false
  },
  {
    id: 'xnor', name: 'XNOR · Coincidência', symbol: 'xnor', inputs: 2,
    expr: 'Y = (A ⊕ B)′',
    desc: 'O inverso do XOR. Saída 1 quando as entradas são IGUAIS. Usada em comparadores.',
    truth: { headers: ['A', 'B', 'Y'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
    universal: false
  }
];

/* ===== Blocos construtivos (combinacionais e sequenciais) ===== */
export const BUILDING_BLOCKS = [
  {
    id: 'half-adder', name: 'Meio-somador', kind: 'Combinacional',
    expr: 'S = A ⊕ B    ·    C = A · B',
    desc: 'Soma dois bits e produz a soma (S) e o "vai-um" (carry, C). Não recebe carry de entrada.',
    truth: { headers: ['A', 'B', 'S', 'C'], rows: [[0, 0, 0, 0], [0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1]] }
  },
  {
    id: 'full-adder', name: 'Somador completo', kind: 'Combinacional',
    expr: 'S = A ⊕ B ⊕ Cᵢₙ    ·    Cₒᵤₜ = A·B + Cᵢₙ·(A ⊕ B)',
    desc: 'Soma três bits (A, B e o carry de entrada). Encadeado, monta somadores de qualquer largura.',
    truth: {
      headers: ['A', 'B', 'Cin', 'S', 'Cout'],
      rows: [
        [0, 0, 0, 0, 0], [0, 0, 1, 1, 0], [0, 1, 0, 1, 0], [0, 1, 1, 0, 1],
        [1, 0, 0, 1, 0], [1, 0, 1, 0, 1], [1, 1, 0, 0, 1], [1, 1, 1, 1, 1]
      ]
    }
  },
  {
    id: 'mux21', name: 'Multiplexador 2:1', kind: 'Combinacional',
    expr: 'Y = S̄·A + S·B',
    desc: 'Seleciona uma de duas entradas (A ou B) conforme o bit de seleção S. O "comutador" digital.',
    truth: {
      headers: ['S', 'A', 'B', 'Y'],
      rows: [
        [0, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 1], [0, 1, 1, 1],
        [1, 0, 0, 0], [1, 0, 1, 1], [1, 1, 0, 0], [1, 1, 1, 1]
      ]
    }
  },
  {
    id: 'demux12', name: 'Demultiplexador 1:2', kind: 'Combinacional',
    expr: 'Y₀ = S̄·D    ·    Y₁ = S·D',
    desc: 'O inverso do mux: encaminha uma entrada D para uma de duas saídas, conforme S.',
    truth: {
      headers: ['S', 'D', 'Y0', 'Y1'],
      rows: [[0, 0, 0, 0], [0, 1, 1, 0], [1, 0, 0, 0], [1, 1, 0, 1]]
    }
  },
  {
    id: 'decoder24', name: 'Decodificador 2:4', kind: 'Combinacional',
    expr: 'Yₙ = 1 quando (A,B) = n',
    desc: 'Converte um número binário de 2 bits em uma de 4 saídas ativas. Base do endereçamento de memória.',
    truth: {
      headers: ['A', 'B', 'Y0', 'Y1', 'Y2', 'Y3'],
      rows: [
        [0, 0, 1, 0, 0, 0], [0, 1, 0, 1, 0, 0],
        [1, 0, 0, 0, 1, 0], [1, 1, 0, 0, 0, 1]
      ]
    }
  },
  {
    id: 'sr-latch', name: 'Latch SR', kind: 'Sequencial',
    expr: 'montado com 2 NOR (ou 2 NAND) realimentados',
    desc: 'A memória de 1 bit mais simples. Set liga, Reset desliga; com ambos 0, ele MEMORIZA. S=R=1 é proibido.',
    truth: {
      headers: ['S', 'R', 'Q', 'estado'],
      rows: [
        [0, 0, 'Q', 'memória'], [0, 1, 0, 'reset'],
        [1, 0, 1, 'set'], [1, 1, '—', 'proibido']
      ]
    }
  },
  {
    id: 'd-ff', name: 'Flip-flop D', kind: 'Sequencial',
    expr: 'Q⁺ = D (na borda do clock)',
    desc: 'Captura o valor de D na borda de subida do clock e o mantém. É a célula básica dos registradores.',
    truth: {
      headers: ['clock', 'D', 'Q⁺'],
      rows: [['↑', 0, 0], ['↑', 1, 1], ['—', 'x', 'Q']]
    }
  },
  {
    id: 'jk-ff', name: 'Flip-flop JK', kind: 'Sequencial',
    expr: 'Q⁺ = J·Q̄ + K̄·Q',
    desc: 'Flip-flop versátil: J seta, K reseta, J=K=1 inverte (toggle). Não tem estado proibido.',
    truth: {
      headers: ['J', 'K', 'Q⁺', 'ação'],
      rows: [
        [0, 0, 'Q', 'memória'], [0, 1, 0, 'reset'],
        [1, 0, 1, 'set'], [1, 1, 'Q̄', 'inverte']
      ]
    }
  },
  {
    id: 't-ff', name: 'Flip-flop T', kind: 'Sequencial',
    expr: 'Q⁺ = T ⊕ Q',
    desc: 'Com T=1 ele inverte a cada clock; com T=0 mantém. Base dos contadores e divisores de frequência.',
    truth: {
      headers: ['T', 'Q⁺'],
      rows: [[0, 'Q'], [1, 'Q̄']]
    }
  }
];

/* ===== Famílias de circuitos integrados ===== */
export const CHIP_FAMILIES = [
  {
    family: 'Série 7400 — TTL',
    note: 'A lógica TTL (Transistor-Transistor Logic) dominou a eletrônica digital a partir de 1964. Tensão 5 V.',
    chips: [
      { code: '7400', name: 'Quad NAND de 2 entradas', pins: 14 },
      { code: '7402', name: 'Quad NOR de 2 entradas', pins: 14 },
      { code: '7404', name: 'Hex inversor (NOT)', pins: 14 },
      { code: '7408', name: 'Quad AND de 2 entradas', pins: 14 },
      { code: '7410', name: 'Triplo NAND de 3 entradas', pins: 14 },
      { code: '7411', name: 'Triplo AND de 3 entradas', pins: 14 },
      { code: '7420', name: 'Duplo NAND de 4 entradas', pins: 14 },
      { code: '7427', name: 'Triplo NOR de 3 entradas', pins: 14 },
      { code: '7430', name: 'NAND de 8 entradas', pins: 14 },
      { code: '7432', name: 'Quad OR de 2 entradas', pins: 14 },
      { code: '7447', name: 'Decodificador BCD → 7 segmentos', pins: 16 },
      { code: '7474', name: 'Duplo flip-flop D com preset/clear', pins: 14 },
      { code: '7476', name: 'Duplo flip-flop JK', pins: 16 },
      { code: '7483', name: 'Somador completo de 4 bits', pins: 16 },
      { code: '7485', name: 'Comparador de magnitude de 4 bits', pins: 16 },
      { code: '7486', name: 'Quad XOR de 2 entradas', pins: 14 },
      { code: '7490', name: 'Contador década (÷10)', pins: 14 },
      { code: '7493', name: 'Contador binário de 4 bits', pins: 14 },
      { code: '74138', name: 'Decodificador / demux 3 → 8', pins: 16 },
      { code: '74139', name: 'Duplo decodificador 2 → 4', pins: 16 },
      { code: '74148', name: 'Codificador de prioridade 8 → 3', pins: 16 },
      { code: '74151', name: 'Multiplexador 8:1', pins: 16 },
      { code: '74153', name: 'Duplo multiplexador 4:1', pins: 16 },
      { code: '74157', name: 'Quad multiplexador 2:1', pins: 16 },
      { code: '74161', name: 'Contador binário síncrono de 4 bits', pins: 16 },
      { code: '74181', name: 'Unidade lógica e aritmética (ULA) de 4 bits', pins: 24 },
      { code: '74244', name: 'Buffer / driver octal tri-state', pins: 20 },
      { code: '74273', name: 'Registrador octal de flip-flops D', pins: 20 },
      { code: '74373', name: 'Latch octal transparente tri-state', pins: 20 },
      { code: '74374', name: 'Registrador octal D com clock', pins: 20 }
    ]
  },
  {
    family: 'Série 4000 — CMOS',
    note: 'A lógica CMOS consome pouquíssima energia e aceita 3–18 V. Lançada pela RCA em 1968, ainda é onipresente.',
    chips: [
      { code: '4001', name: 'Quad NOR de 2 entradas', pins: 14 },
      { code: '4011', name: 'Quad NAND de 2 entradas', pins: 14 },
      { code: '4013', name: 'Duplo flip-flop D', pins: 14 },
      { code: '4017', name: 'Contador década Johnson com 10 saídas', pins: 16 },
      { code: '4027', name: 'Duplo flip-flop JK', pins: 16 },
      { code: '4040', name: 'Contador binário de 12 estágios', pins: 16 },
      { code: '4049', name: 'Hex inversor buffer', pins: 16 },
      { code: '4051', name: 'Mux / demux analógico de 8 canais', pins: 16 },
      { code: '4060', name: 'Contador de 14 estágios + oscilador', pins: 16 },
      { code: '4066', name: 'Quad chave bilateral analógica', pins: 14 },
      { code: '4070', name: 'Quad XOR de 2 entradas', pins: 14 },
      { code: '4071', name: 'Quad OR de 2 entradas', pins: 14 },
      { code: '4081', name: 'Quad AND de 2 entradas', pins: 14 },
      { code: '4511', name: 'Decodificador BCD → 7 segmentos com latch', pins: 16 },
      { code: '4514', name: 'Decodificador 4 → 16 com latch', pins: 24 },
      { code: '4528', name: 'Duplo multivibrador monoestável', pins: 16 }
    ]
  }
];

/* Resumo numérico para a página. */
export const LOGIC_STATS = {
  gates: FUNDAMENTAL_GATES.length,
  blocks: BUILDING_BLOCKS.length,
  chips: CHIP_FAMILIES.reduce((n, f) => n + f.chips.length, 0)
};
