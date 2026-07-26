/**
 * Catálogo do Arma 3 — TUDO que não é arma, com valores medidos no config
 * do jogo em execução: veículos, soldados, miras, uniformes, coletes,
 * capacetes, mochilas, acessórios e óculos.
 *
 * ⚠️ ARQUIVO GERADO — não edite à mão.
 *   Gerador: scripts/arma3/gerar-catalogo.py
 *   Dump de origem: (ainda não rodado)
 *
 * As armas ficam em arma3-armas.js — separadas porque só elas têm
 * balística, e é a balística que alimenta a calculadora de trajetória.
 *
 * HONESTIDADE
 *   - Ausente é `null`, NUNCA zero. O `getNumber` do SQF devolve 0 pra
 *     propriedade que não existe, então o dump testa `isNumber` antes e
 *     emite vazio — senão "sem blindagem declarada" viraria "blindagem 0".
 *   - `protecao` traz o valor por ponto do corpo como o config dá
 *     (`armor` absorve, `passThrough` é o que ATRAVESSA). `protecaoTorax`
 *     é um resumo editorial pra tabela, não um número do jogo.
 *   - `zoomMax` sai do FOV em radianos do config (0.75 rad = olho nu).
 *   - `img: null` + `imgAusente` com o motivo — sem placeholder que finja
 *     ser o item.
 */

/* Categorias, com as colunas que cada tabela mostra (a UI lê daqui). */
export const A3CAT_CATEGORIAS = [
  { id: "viatura", nome: "Viaturas", icon: "🚙", desc: "Rodas sem blindagem pesada: transporte, patrulha, logística.", colunas: ["blindagem", "velocidade", "transporte", "combustivel"] },
  { id: "blindado", nome: "Blindados", icon: "🛡️", desc: "Carros de combate e APC — canhão, lagarta ou roda pesada.", colunas: ["blindagem", "velocidade", "transporte", "armamento"] },
  { id: "helicoptero", nome: "Helicópteros", icon: "🚁", desc: "Asa rotativa: transporte, ataque e reconhecimento.", colunas: ["blindagem", "velocidade", "transporte", "armamento"] },
  { id: "aviao", nome: "Aviões", icon: "✈️", desc: "Asa fixa: caça, ataque ao solo e transporte.", colunas: ["blindagem", "velocidade", "transporte", "armamento"] },
  { id: "naval", nome: "Naval", icon: "🚤", desc: "Barcos e submersíveis.", colunas: ["blindagem", "velocidade", "transporte"] },
  { id: "drone", nome: "Drones (UAV/UGV)", icon: "📡", desc: "Não tripulados — observação e ataque.", colunas: ["blindagem", "velocidade", "armamento"] },
  { id: "estatico", nome: "Armamento estático", icon: "🎯", desc: "Metralhadora, morteiro e AT/AA de posição fixa.", colunas: ["armamento", "transporte"] },
  { id: "soldado", nome: "Soldados & funções", icon: "🪖", desc: "Cada função com o equipamento que nasce equipado.", colunas: ["lado", "faccao", "uniforme", "armamento"] },
  { id: "mira", nome: "Miras & ópticas", icon: "🔭", desc: "Do red dot ao 25×: zoom real lido do config.", colunas: ["zoom", "visao", "massa"] },
  { id: "boca", nome: "Acessórios de boca", icon: "🔇", desc: "Supressores e freios — o que vai na ponta do cano.", colunas: ["massa"] },
  { id: "apontador", nome: "Apontadores & lanternas", icon: "🔦", desc: "Laser (visível e IV) e iluminação.", colunas: ["massa"] },
  { id: "bipe", nome: "Bipés", icon: "📐", desc: "Apoio que reduz a oscilação no tiro deitado.", colunas: ["massa"] },
  { id: "uniforme", nome: "Uniformes", icon: "👕", desc: "Roupa: capacidade de carga e a proteção que ela dá.", colunas: ["protecao", "capacidade", "massa"] },
  { id: "colete", nome: "Coletes", icon: "🦺", desc: "Proteção por ponto do corpo + capacidade de bolsos.", colunas: ["protecao", "capacidade", "massa"] },
  { id: "capacete", nome: "Capacetes", icon: "⛑️", desc: "Proteção de cabeça.", colunas: ["protecao", "massa"] },
  { id: "mochila", nome: "Mochilas", icon: "🎒", desc: "Capacidade de carga nas costas.", colunas: ["capacidade", "massa"] },
  { id: "visao-noturna", nome: "Visão noturna", icon: "🌙", desc: "NVG e termais.", colunas: ["massa"] },
  { id: "binoculo", nome: "Binóculos & telêmetros", icon: "🔍", desc: "Observação e medição de distância.", colunas: ["massa"] },
  { id: "gps", nome: "GPS & UAV terminal", icon: "🛰️", desc: "Navegação e controle de drone.", colunas: ["massa"] },
  { id: "bussola", nome: "Bússolas & relógios", icon: "🧭", desc: "Navegação básica.", colunas: ["massa"] },
  { id: "radio", nome: "Rádios", icon: "📻", desc: "Comunicação.", colunas: ["massa"] },
  { id: "oculos", nome: "Óculos & máscaras", icon: "🕶️", desc: "Facial: óculos, balaclava, máscara de gás.", colunas: ["massa"] },
  { id: "coldre", nome: "Coldres", icon: "🔩", desc: "Onde a secundária fica.", colunas: ["massa"] },
];

/* Núcleo: jogo base + DLC. O resto (mods) desce sob demanda. */
export const A3CAT = [
];

export const A3CAT_TOTAL = A3CAT.length;

export const A3CAT_META = {
  disponivel: false,
  dump: null,
  nucleo: 0,
  total: 0,
  porCategoria: {  },
  catalogoUrl: '/arma3/catalogo-db.json',
  comoGerar: "No jogo: Esc → DEBUG CONSOLE → cole scripts/arma3/dump-catalogo.sqf → EXECUTE. Depois: python scripts/arma3/parse-catalogo.py && python scripts/arma3/gerar-catalogo.py"
};

/* Catálogo completo (com mods) sob demanda — uma requisição por sessão. */
let _catalogo = null;
export function carregarCatalogo() {
  if (!_catalogo) {
    _catalogo = fetch(A3CAT_META.catalogoUrl)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => d.itens)
      .catch((err) => { _catalogo = null; throw err; });
  }
  return _catalogo;
}
